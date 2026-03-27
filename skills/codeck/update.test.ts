/**
 * [INPUT]: 依赖 Vitest、临时目录与 update.mjs 的注入点，覆盖 repo/install 两类显式升级流程
 * [OUTPUT]: 保证 update.mjs 会在合法安装目录执行正确步骤，并在非法目录快速失败
 * [POS]: skills/ 的显式升级测试层，保护最小 updater 不回退成复杂状态机
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFileSync } from "child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it, vi } from "vitest";

import { runUpdate } from "./update.mjs";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function initGitRepo(dir: string): void {
  execFileSync("git", ["init", "-q"], { cwd: dir });
}

function seedInstallRoot(dir: string): void {
  mkdirSync(join(dir, "skills"), { recursive: true });
  writeFileSync(join(dir, "VERSION"), "0.1.0\n");
  writeFileSync(join(dir, "setup"), "#!/bin/bash\n");
}

describe("update", () => {
  it("runs git pull and setup for repo installs", async () => {
    const repo = makeTempDir("codeck-update-repo-");
    const runGitPull = vi.fn();
    const runSetup = vi.fn();

    seedInstallRoot(repo);
    initGitRepo(repo);

    const result = await runUpdate({
      installRoot: repo,
      runGitPull,
      runSetup,
      clearLastCheck: vi.fn(),
    });

    expect(result.kind).toBe("repo");
    expect(runGitPull).toHaveBeenCalledWith(repo);
    expect(runSetup).toHaveBeenCalledWith(repo);
  });

  it("downloads, extracts, copies, and sets up non-git installs", async () => {
    const installRoot = makeTempDir("codeck-update-install-");
    const downloadTarball = vi.fn(async () => undefined);
    const extractTarball = vi.fn();
    const copyInstall = vi.fn();
    const runSetup = vi.fn();

    seedInstallRoot(installRoot);

    const result = await runUpdate({
      installRoot,
      downloadTarball,
      extractTarball,
      copyInstall,
      runSetup,
      clearLastCheck: vi.fn(),
      createTempDir: () => {
        const tempDir = makeTempDir("codeck-update-tmp-");
        mkdirSync(join(tempDir, "codeck-main"));
        return tempDir;
      },
    });

    expect(result.kind).toBe("install");
    expect(downloadTarball).toHaveBeenCalled();
    expect(extractTarball).toHaveBeenCalled();
    expect(copyInstall).toHaveBeenCalled();
    expect(runSetup).toHaveBeenCalledWith(installRoot);
  });

  it("fails fast when the target directory is not a codeck install", async () => {
    const plainDir = makeTempDir("codeck-update-plain-");

    await expect(runUpdate({ installRoot: plainDir })).rejects.toThrow(
      "invalid codeck install: expected VERSION, setup, and skills/",
    );
  });
});
