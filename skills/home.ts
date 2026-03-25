/**
 * [INPUT]: 依赖 Node.js fs/child_process/path，管理 ~/.codeck/ 全局状态、当前项目 deck 目录与最小更新链
 * [OUTPUT]: 对外提供 repoSlug/resolveDeckDirForCwd/resolveDeckDir/resolveFinalHtmlDir/install 形态判断，以及 CLI：auto-update / snapshot / ensure-home / slug / deck-dir / final-html-dir
 * [POS]: skills/ 的全局目录管理层，负责项目目录解析、repo 自动更新与非 git 安装的显式升级提示
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFileSync, execSync } from "child_process";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  realpathSync,
  readFileSync,
  writeFileSync,
} from "fs";

const INSTALL_ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const REMOTE_VERSION_URL = process.env.CODECK_REMOTE_URL || "https://raw.githubusercontent.com/hiyeshu/codeck/main/VERSION";

type InstallKind = "repo" | "install" | "unknown";

type AutoUpdateOptions = {
  nowSeconds?: () => number;
  fileExists?: (path: string) => boolean;
  readFile?: (path: string, encoding: BufferEncoding) => string;
  writeFile?: (path: string, content: string) => void;
  gitPull?: (cwd: string) => string;
  fetchRemoteVersion?: () => string;
  installRoot?: string;
};

function homeDir(): string {
  return join(process.env.HOME || "~", ".codeck");
}

function projectsDir(): string {
  return join(homeDir(), "projects");
}

function lastCheckPath(): string {
  return join(homeDir(), "last-update-check");
}

function versionPath(root: string): string {
  return join(root, "VERSION");
}

function setupPath(root: string): string {
  return join(root, "setup");
}

function skillsPath(root: string): string {
  return join(root, "skills");
}

/* ─── 目录初始化 ─── */

export function ensureHome(): void {
  mkdirSync(projectsDir(), { recursive: true });
}

/* ─── 项目标识 ─── */

export function repoSlug(): string {
  if (!gitRoot()) return basename(process.cwd());
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

function gitRoot(): string | null {
  try {
    return execSync("git rev-parse --show-toplevel", {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

function gitRootFor(dir: string): string | null {
  try {
    return execSync("git rev-parse --show-toplevel", {
      cwd: dir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

export function isInstallRoot(dir: string, fileExists = existsSync): boolean {
  return fileExists(versionPath(dir)) && fileExists(setupPath(dir)) && fileExists(skillsPath(dir));
}

export function detectInstallKind(dir = INSTALL_ROOT, fileExists = existsSync): InstallKind {
  if (!isInstallRoot(dir, fileExists)) return "unknown";
  const root = gitRootFor(dir);
  if (!root) return "install";
  return realpathSync(root) === realpathSync(dir) ? "repo" : "install";
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

export function resolveFinalHtmlDir(finalHtmlDir = process.env.FINAL_HTML_DIR): string {
  const dir = resolve(finalHtmlDir || gitRoot() || process.cwd());
  mkdirSync(dir, { recursive: true });
  return dir;
}

/* ─── 自动更新 ─── */

function defaultGitPull(cwd: string): string {
  return execSync("git pull --ff-only", {
    cwd,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    timeout: 10000,
  }).trim();
}

function defaultFetchRemoteVersion(): string {
  return execFileSync("curl", [
    "-fsSL",
    "--connect-timeout",
    "3",
    "--max-time",
    "5",
    REMOTE_VERSION_URL,
  ], {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

function readLastCheck(
  path: string,
  fileExists: (path: string) => boolean,
  readFile: (path: string, encoding: BufferEncoding) => string,
): number {
  if (!fileExists(path)) return 0;
  return parseInt(readFile(path, "utf8").trim(), 10) || 0;
}

function readVersion(
  root: string,
  fileExists: (path: string) => boolean,
  readFile: (path: string, encoding: BufferEncoding) => string,
): string {
  const file = versionPath(root);
  if (!fileExists(file)) return "";
  return readFile(file, "utf8").trim();
}

function repoAutoUpdate(root: string, gitPull: (cwd: string) => string): string | null {
  try {
    const result = gitPull(root);
    if (!result || result.includes("Already up to date")) return null;
    return `CODECK_UPDATED: ${result.split("\n")[0]}`;
  } catch {
    return null;
  }
}

function installUpdateNotice(
  root: string,
  fileExists: (path: string) => boolean,
  readFile: (path: string, encoding: BufferEncoding) => string,
  fetchRemoteVersion: () => string,
): string | null {
  try {
    const localVersion = readVersion(root, fileExists, readFile);
    const remoteVersion = fetchRemoteVersion().trim();
    if (!localVersion || !remoteVersion || remoteVersion === localVersion) return null;
    return `CODECK_UPDATE_AVAILABLE ${localVersion} ${remoteVersion}`;
  } catch {
    return null;
  }
}

export function autoUpdate(options: AutoUpdateOptions = {}): string | null {
  ensureHome();
  const nowSeconds = options.nowSeconds || (() => Math.floor(Date.now() / 1000));
  const fileExists = options.fileExists || existsSync;
  const readFile = options.readFile || readFileSync;
  const writeFile = options.writeFile || writeFileSync;
  const gitPull = options.gitPull || defaultGitPull;
  const fetchRemoteVersion = options.fetchRemoteVersion || defaultFetchRemoteVersion;
  const root = resolve(options.installRoot || INSTALL_ROOT);
  const lastCheck = lastCheckPath();
  const now = nowSeconds();
  const last = readLastCheck(lastCheck, fileExists, readFile);

  if (last && now - last < 86400) return null;
  writeFile(lastCheck, String(now));

  if (detectInstallKind(root, fileExists) === "repo") {
    return repoAutoUpdate(root, gitPull);
  }
  if (detectInstallKind(root, fileExists) === "install") {
    return installUpdateNotice(root, fileExists, readFile, fetchRemoteVersion);
  }
  return null;
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
      {
        const output = autoUpdate();
        if (output) console.log(output);
      }
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
    case "final-html-dir":
      console.log(resolveFinalHtmlDir());
      return;
    default:
      console.error("Usage: home.ts <auto-update|snapshot|ensure-home|slug|deck-dir|final-html-dir>");
      process.exit(1);
  }
}

if (isMainModule()) {
  runCli();
}
