/**
 * [INPUT]: 依赖 Node.js fs/path/module/child_process，在当前本地仓库内检查 compiler 文件、关键依赖与 render-default 启动能力
 * [OUTPUT]: 对外提供 compiler preflight 检测函数与 CLI，返回 READY / NOT_READY、原因和推荐命令
 * [POS]: skills/ 的仓库初始化预检层，保护首次 clone 后的 design 渲染入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as childProcess from "child_process";
import * as fs from "fs";
import { tmpdir } from "os";
import { join, resolve, dirname } from "path";
import { createRequire } from "module";

const REQUIRED_MODULES = ["tsx", "zod"];
const READY = "READY";
const NOT_READY = "NOT_READY";

export function resolveRepoRoot(start = process.cwd(), fileExists = fs.existsSync) {
  let current = resolve(start);
  while (true) {
    if (isRepoRoot(current, fileExists)) return current;
    const parent = dirname(current);
    if (parent === current) return resolve(start);
    current = parent;
  }
}

function isRepoRoot(dir, fileExists) {
  return fileExists(join(dir, "package.json")) && fileExists(join(dir, "skills", "compiler", "index.ts"));
}

function defaultResolveModule(repoRoot, name) {
  const requireFromRepo = createRequire(join(repoRoot, "package.json"));
  requireFromRepo.resolve(name);
  return true;
}

function buildSetupHint(repoRoot, fileExists) {
  return fileExists(join(repoRoot, "setup")) ? "./setup" : "npm install";
}

function resolveCompilerPath(repoRoot) {
  return join(repoRoot, "skills", "compiler", "index.ts");
}

function createProbeDeck(repoRoot) {
  const dir = fs.mkdtempSync(join(tmpdir(), "codeck-preflight-"));
  const deckPath = join(dir, "deck.json");
  fs.writeFileSync(deckPath, "{}");
  return { dir, deckPath, cwd: repoRoot };
}

function defaultRunProbe(repoRoot, compilerPath) {
  const probe = createProbeDeck(repoRoot);
  try {
    const result = childProcess.spawnSync(
      "npx",
      ["--no-install", "tsx", compilerPath, "render-default", probe.deckPath],
      { cwd: probe.cwd, encoding: "utf8" },
    );
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    const ok = output.includes("render-default requires schemaVersion: 2 deck");
    return { ok, output: output.trim(), exitCode: result.status ?? 1 };
  } finally {
    fs.rmSync(probe.dir, { recursive: true, force: true });
  }
}

function notReady(repoRoot, reason, details, fileExists) {
  return {
    status: NOT_READY,
    repoRoot,
    reason,
    details,
    recommendedCommand: buildSetupHint(repoRoot, fileExists),
  };
}

function buildReady(repoRoot) {
  return {
    status: READY,
    repoRoot,
    reason: "compiler_ready",
    details: ["render-default reached schema validation"],
    recommendedCommand: "",
  };
}

function readMissingDependencies(repoRoot, resolveModule) {
  return REQUIRED_MODULES.filter((name) => {
    try {
      return !resolveModule(repoRoot, name);
    } catch {
      return true;
    }
  });
}

function checkCompilerFile(repoRoot, fileExists) {
  const compilerPath = resolveCompilerPath(repoRoot);
  if (fileExists(compilerPath)) return { ok: true, compilerPath };
  return {
    ok: false,
    result: notReady(repoRoot, "compiler_missing", ["skills/compiler/index.ts is missing"], fileExists),
  };
}

function checkDependencies(repoRoot, resolveModule, fileExists) {
  const missing = readMissingDependencies(repoRoot, resolveModule);
  if (!missing.length) return { ok: true };
  return {
    ok: false,
    result: notReady(
      repoRoot,
      "dependencies_missing",
      missing.map((name) => `missing dependency: ${name}`),
      fileExists,
    ),
  };
}

function checkProbe(repoRoot, compilerPath, runProbe, fileExists) {
  const probe = runProbe(repoRoot, compilerPath);
  if (probe.ok) return { ok: true };
  const details = probe.output ? [probe.output] : ["render-default probe failed before schema validation"];
  return { ok: false, result: notReady(repoRoot, "compiler_not_ready", details, fileExists) };
}

export function detectCompilerReadiness(start = process.cwd(), options = {}) {
  const fileExists = options.fileExists || fs.existsSync;
  const resolveModule = options.resolveModule || defaultResolveModule;
  const runProbe = options.runProbe || defaultRunProbe;
  const repoRoot = resolveRepoRoot(start, fileExists);
  const compiler = checkCompilerFile(repoRoot, fileExists);
  if (!compiler.ok) return compiler.result;
  const dependencies = checkDependencies(repoRoot, resolveModule, fileExists);
  if (!dependencies.ok) return dependencies.result;
  const probe = checkProbe(repoRoot, compiler.compilerPath, runProbe, fileExists);
  if (!probe.ok) return probe.result;
  return buildReady(repoRoot);
}

function toShellOutput(result) {
  return [
    `STATUS=${result.status}`,
    `REASON=${result.reason}`,
    `RECOMMENDED_COMMAND=${result.recommendedCommand}`,
    `REPO_ROOT=${result.repoRoot}`,
    `DETAILS=${result.details.join(" | ")}`,
  ].join("\n");
}

function runCli() {
  const cmd = process.argv[2];
  const start = process.argv[3] || process.cwd();
  if (cmd !== "compiler-ready") {
    console.error("Usage: node skills/preflight.mjs compiler-ready [repoRoot]");
    process.exit(1);
  }
  console.log(toShellOutput(detectCompilerReadiness(start)));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  runCli();
}
