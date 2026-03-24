/**
 * [INPUT]: 依赖 Vitest 与临时目录，覆盖 deck 目录解析和 repo slug 回退逻辑
 * [OUTPUT]: 保证 home.ts 在有无环境变量、非 git 目录场景下行为稳定
 * [POS]: skills/ 的 home 测试层，保护全局 deck 工作区解析
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { mkdtempSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { repoSlug, resolveDeckDir } from "./home";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

describe("home", () => {
  let originalHome: string | undefined;
  let originalDeckDir: string | undefined;
  let originalCwd: string;

  beforeEach(() => {
    originalHome = process.env.HOME;
    originalDeckDir = process.env.DECK_DIR;
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
    if (originalDeckDir === undefined) delete process.env.DECK_DIR;
    else process.env.DECK_DIR = originalDeckDir;
  });

  it("resolveDeckDir uses DECK_DIR when provided", () => {
    const dir = makeTempDir("codeck-home-deck-");
    process.env.DECK_DIR = dir;
    expect(resolveDeckDir()).toBe(dir);
  });

  it("resolveDeckDir falls back to resolveDeckDirForCwd behavior when env is missing", () => {
    const home = makeTempDir("codeck-home-root-");
    const cwd = makeTempDir("project-folder-");
    delete process.env.DECK_DIR;
    process.env.HOME = home;
    process.chdir(cwd);

    expect(resolveDeckDir()).toBe(join(home, ".codeck", "projects", repoSlug()));
  });

  it("repoSlug falls back to basename in a non-git directory", () => {
    const cwd = makeTempDir("plain-folder-");
    process.chdir(cwd);
    expect(repoSlug()).toBe(cwd.split("/").pop());
  });
});
