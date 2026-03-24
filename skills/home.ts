/**
 * [INPUT]: 依赖 Node.js fs/child_process/path，管理 ~/.codeck/ 全局状态与当前项目的 deck 目录
 * [OUTPUT]: 对外提供可复用的 repoSlug/resolveDeckDirForCwd/resolveDeckDir 以及 CLI：auto-update / snapshot / ensure-home / deck-dir
 * [POS]: skills/ 的全局目录管理层，负责自动更新、项目目录解析和项目数据备份
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execSync } from "child_process";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";

const SKILL_DIR = resolve(dirname(new URL(import.meta.url).pathname), "..");

function homeDir(): string {
  return join(process.env.HOME || "~", ".codeck");
}

function projectsDir(): string {
  return join(homeDir(), "projects");
}

function lastCheckPath(): string {
  return join(homeDir(), "last-update-check");
}

/* ─── 目录初始化 ─── */

export function ensureHome(): void {
  mkdirSync(projectsDir(), { recursive: true });
}

/* ─── 项目标识 ─── */

export function repoSlug(): string {
  try {
    const remote = execSync("git remote get-url origin", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    const match = remote.match(/[/:]([^/]+\/[^/.]+?)(?:\.git)?$/);
    if (match) return match[1].replace("/", "-");
  } catch { /* 非 git 目录 */ }
  return basename(process.cwd());
}

export function resolveDeckDirForCwd(): string {
  ensureHome();
  const dir = join(projectsDir(), repoSlug());
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function resolveDeckDir(deckDir = process.env.DECK_DIR): string {
  if (deckDir) {
    const dir = resolve(deckDir);
    mkdirSync(dir, { recursive: true });
    return dir;
  }
  return resolveDeckDirForCwd();
}

/* ─── 自动更新 ─── */

function autoUpdate(): void {
  ensureHome();
  const now = Math.floor(Date.now() / 1000);
  const lastCheck = lastCheckPath();

  if (existsSync(lastCheck)) {
    const last = parseInt(readFileSync(lastCheck, "utf8").trim(), 10) || 0;
    if (now - last < 86400) return; // 24h 内跳过
  }

  writeFileSync(lastCheck, String(now));

  try {
    const result = execSync("git pull --ff-only", {
      cwd: SKILL_DIR,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 10000,
    }).trim();
    if (result && !result.includes("Already up to date")) {
      console.log(`CODECK_UPDATED: ${result.split("\n")[0]}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("timed out") || msg.includes("Could not resolve")) return;
    console.warn(`CODECK_UPDATE_WARN: ${msg.split("\n")[0]}`);
  }
}

/* ─── 快照备份 ─── */

function snapshotDeck(): void {
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const projDir = resolveDeckDir();
  const deckSrc = join(projDir, "deck.json");
  const designSrc = join(projDir, "design.json");

  if (existsSync(deckSrc)) {
    copyFileSync(deckSrc, join(projDir, `deck-${ts}.json`));
  }
  if (existsSync(designSrc)) {
    copyFileSync(designSrc, join(projDir, `design-${ts}.json`));
  }

  const pipelineSrc = join(projDir, "pipeline.json");
  if (existsSync(pipelineSrc)) {
    copyFileSync(pipelineSrc, join(projDir, "pipeline-backup.json"));
  }
}

/* ─── CLI ─── */

function isMainModule(): boolean {
  const entry = process.argv[1];
  return !!entry && resolve(entry) === fileURLToPath(import.meta.url);
}

function runCli(): void {
  const cmd = process.argv[2];
  switch (cmd) {
    case "auto-update":
      autoUpdate();
      return;
    case "snapshot":
      snapshotDeck();
      console.log(`snapshot → ~/.codeck/projects/${repoSlug()}/`);
      return;
    case "ensure-home":
      ensureHome();
      console.log(homeDir());
      return;
    case "slug":
      console.log(repoSlug());
      return;
    case "deck-dir":
      console.log(resolveDeckDir());
      return;
    default:
      console.error("Usage: home.ts <auto-update|snapshot|ensure-home|slug|deck-dir>");
      process.exit(1);
  }
}

if (isMainModule()) {
  runCli();
}
