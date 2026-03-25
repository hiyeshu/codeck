/**
 * [INPUT]: 依赖 Vitest、临时目录与 git CLI，覆盖 deck/final 输出目录解析和 repo slug 回退逻辑
 * [OUTPUT]: 保证 home.ts 在有无环境变量、git/non-git 目录场景下行为稳定
 * [POS]: skills/ 的 home 测试层，保护全局 deck 工作区解析
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFileSync } from "child_process";
import { mkdirSync, mkdtempSync, realpathSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { repoSlug, resolveDeckDir, resolveFinalHtmlDir } from "./home";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function initGitRepo(dir: string): void {
  execFileSync("git", ["init", "-q"], { cwd: dir });
}

describe("home", () => {
  let originalHome: string | undefined;
  let originalDeckDir: string | undefined;
  let originalFinalHtmlDir: string | undefined;
  let originalCwd: string;

  beforeEach(() => {
    originalHome = process.env.HOME;
    originalDeckDir = process.env.DECK_DIR;
    originalFinalHtmlDir = process.env.FINAL_HTML_DIR;
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalHome === undefined) delete process.env.HOME;
    else process.env.HOME = originalHome;
    if (originalDeckDir === undefined) delete process.env.DECK_DIR;
    else process.env.DECK_DIR = originalDeckDir;
    if (originalFinalHtmlDir === undefined) delete process.env.FINAL_HTML_DIR;
    else process.env.FINAL_HTML_DIR = originalFinalHtmlDir;
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

  it("resolveFinalHtmlDir uses FINAL_HTML_DIR when provided", () => {
    const dir = makeTempDir("codeck-home-final-");
    process.env.FINAL_HTML_DIR = dir;
    expect(resolveFinalHtmlDir()).toBe(dir);
  });

  it("resolveFinalHtmlDir returns the git root when cwd is inside a repo", () => {
    const repo = makeTempDir("codeck-home-git-");
    const nested = join(repo, "nested", "app");
    initGitRepo(repo);
    mkdirSync(nested, { recursive: true });
    delete process.env.FINAL_HTML_DIR;
    process.chdir(nested);

    expect(resolveFinalHtmlDir()).toBe(realpathSync(repo));
  });

  it("resolveFinalHtmlDir falls back to cwd outside git", () => {
    const cwd = makeTempDir("codeck-home-final-cwd-");
    delete process.env.FINAL_HTML_DIR;
    process.chdir(cwd);

    expect(resolveFinalHtmlDir()).toBe(realpathSync(cwd));
  });
});
