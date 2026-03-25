/**
 * [INPUT]: 依赖 Node.js fs/path/os/url/child_process/fetch，在 macOS/Linux 上显式升级当前 codeck 安装目录
 * [OUTPUT]: 提供 detectInstallKind/runUpdate CLI；repo 安装走 git pull，非 git 安装走 tarball 覆盖 + setup
 * [POS]: skills/ 的最小显式升级层，给非 git 安装一个单命令更新入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const INSTALL_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARBALL_URL = process.env.CODECK_TARBALL_URL || "https://codeload.github.com/hiyeshu/codeck/tar.gz/refs/heads/main";

function homeDir() {
  return join(process.env.HOME || "~", ".codeck");
}

function lastCheckPath() {
  return join(homeDir(), "last-update-check");
}

function versionPath(root) {
  return join(root, "VERSION");
}

function setupPath(root) {
  return join(root, "setup");
}

function skillsPath(root) {
  return join(root, "skills");
}

export function isInstallRoot(root, fileExists = existsSync) {
  return fileExists(versionPath(root)) && fileExists(setupPath(root)) && fileExists(skillsPath(root));
}

function gitRootFor(dir) {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: dir,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

export function detectInstallKind(root = INSTALL_ROOT, fileExists = existsSync) {
  if (!isInstallRoot(root, fileExists)) return "unknown";
  const gitRoot = gitRootFor(root);
  if (!gitRoot) return "install";
  return realpathSync(gitRoot) === realpathSync(root) ? "repo" : "install";
}

function runCommand(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

async function defaultDownloadTarball(url, archivePath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`download failed: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(archivePath, buffer);
}

function defaultExtractTarball(archivePath, tempDir) {
  runCommand("tar", ["-xzf", archivePath, "-C", tempDir], tempDir);
}

function findExtractedRoot(tempDir) {
  const entry = readdirSync(tempDir, { withFileTypes: true }).find((dirent) => dirent.isDirectory());
  if (!entry) throw new Error("extract failed: missing root directory");
  return join(tempDir, entry.name);
}

function defaultCopyInstall(sourceRoot, targetRoot) {
  runCommand("cp", ["-Rf", `${sourceRoot}/.`, targetRoot], targetRoot);
}

function defaultRunSetup(root) {
  runCommand("bash", ["./setup"], root);
}

function defaultRunGitPull(root) {
  runCommand("git", ["pull", "--ff-only"], root);
}

function defaultClearLastCheck() {
  rmSync(lastCheckPath(), { force: true });
}

export async function runUpdate(options = {}) {
  const root = resolve(options.installRoot || INSTALL_ROOT);
  const fileExists = options.fileExists || existsSync;
  const kind = detectInstallKind(root, fileExists);
  const runGitPull = options.runGitPull || defaultRunGitPull;
  const runSetup = options.runSetup || defaultRunSetup;
  const downloadTarball = options.downloadTarball || defaultDownloadTarball;
  const extractTarball = options.extractTarball || defaultExtractTarball;
  const copyInstall = options.copyInstall || defaultCopyInstall;
  const clearLastCheck = options.clearLastCheck || defaultClearLastCheck;
  const createTempDir = options.createTempDir || (() => mkdtempSync(join(tmpdir(), "codeck-update-")));

  if (kind === "unknown") {
    throw new Error("invalid codeck install: expected VERSION, setup, and skills/");
  }

  if (kind === "repo") {
    runGitPull(root);
    runSetup(root);
    clearLastCheck();
    return { kind, root };
  }

  const tempDir = createTempDir();
  const archivePath = join(tempDir, "codeck.tar.gz");
  try {
    await downloadTarball(TARBALL_URL, archivePath);
    extractTarball(archivePath, tempDir);
    copyInstall(findExtractedRoot(tempDir), root);
    runSetup(root);
    clearLastCheck();
    return { kind, root };
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function main() {
  try {
    const result = await runUpdate();
    if (result.kind === "repo") {
      console.log(`codeck updated in ${result.root}`);
      return;
    }
    console.log(`codeck refreshed in ${result.root}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`codeck update failed: ${message}`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
