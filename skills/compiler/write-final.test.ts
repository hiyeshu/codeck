/**
 * [INPUT]: 依赖 Vitest、临时目录与本地 tsx/git CLI，覆盖 write-final 的跨目录输出与失败保护
 * [OUTPUT]: 保证 candidate 留在 DECK_DIR、final HTML 写到 git root/FINAL_HTML_DIR，且校验失败时不落盘
 * [POS]: skills/compiler 的集成测试层，保护最终 HTML 输出位置与 contract 校验协作链路
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { execFileSync } from "child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const THIS_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(THIS_DIR, "../..");
const TSX_BIN = join(REPO_ROOT, "node_modules", ".bin", "tsx");
const COMPILER_ENTRY = join(REPO_ROOT, "skills", "compiler", "index.ts");

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head><title>Deck</title></head>
<body>
  <div class="deck-app">
    <main class="deck-slides">
      <section class="slide slide--cover" id="slide-cover" data-purpose="cover" data-narrative-role="hook" data-importance="high" data-notes="cover notes">
        <div class="slide__canvas">
          <div class="block block--statement-hero" id="block-cover" data-block-type="statement-hero"></div>
        </div>
      </section>
    </main>
    <div class="deck-nav">
      <div data-counter></div>
      <div data-progress></div>
      <button data-action="overview"></button>
      <button data-action="fullscreen"></button>
      <button data-action="notes"></button>
    </div>
    <section data-notes-panel></section>
  </div>
  <script>const app = document.querySelector('.deck-app');</script>
</body>
</html>`;

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function initGitRepo(dir: string): void {
  execFileSync("git", ["init", "-q"], { cwd: dir });
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function validDeck() {
  return {
    schemaVersion: 2,
    root: "deck",
    meta: { title: "重新定义可能", revision: 1 },
    elements: {
      deck: { type: "Deck", props: {}, children: ["slide-1"] },
      "slide-1": {
        type: "Slide",
        props: { purpose: "cover", narrativeRole: "hook", importance: "high" },
        children: ["block-1"],
      },
      "block-1": {
        type: "StatementHero",
        props: { title: "Compiler-first rendering" },
        children: [],
      },
    },
  };
}

function runWriteFinal(
  cwd: string,
  deckPath: string,
  candidatePath: string,
  defaultHtmlPath: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return execFileSync(
    TSX_BIN,
    [COMPILER_ENTRY, "write-final", deckPath, candidatePath, defaultHtmlPath],
    { cwd, env, encoding: "utf8" },
  ).trim();
}

describe("write-final CLI", () => {
  it("writes final HTML to the git root while candidate stays in DECK_DIR", () => {
    const repoRoot = makeTempDir("codeck-write-final-repo-");
    const deckDir = makeTempDir("codeck-write-final-deck-");
    initGitRepo(repoRoot);

    const deckPath = join(deckDir, "deck.json");
    const defaultHtmlPath = join(deckDir, "default.html");
    const candidatePath = join(deckDir, "重新定义可能-r1.candidate.html");
    const finalPath = join(repoRoot, "重新定义可能-r1.html");
    writeJson(deckPath, validDeck());
    writeFileSync(defaultHtmlPath, DEFAULT_HTML);
    writeFileSync(candidatePath, DEFAULT_HTML);

    const output = runWriteFinal(repoRoot, deckPath, candidatePath, defaultHtmlPath);

    expect(realpathSync(output)).toBe(realpathSync(finalPath));
    expect(existsSync(candidatePath)).toBe(true);
    expect(existsSync(finalPath)).toBe(true);
    expect(existsSync(join(deckDir, "重新定义可能-r1.html"))).toBe(false);
    expect(readFileSync(finalPath, "utf8")).toBe(DEFAULT_HTML);
  });

  it("uses FINAL_HTML_DIR when provided", () => {
    const repoRoot = makeTempDir("codeck-write-final-env-repo-");
    const deckDir = makeTempDir("codeck-write-final-env-deck-");
    const finalDir = join(repoRoot, "exports");
    initGitRepo(repoRoot);
    mkdirSync(finalDir, { recursive: true });

    const deckPath = join(deckDir, "deck.json");
    const defaultHtmlPath = join(deckDir, "default.html");
    const candidatePath = join(deckDir, "重新定义可能-r1.candidate.html");
    const finalPath = join(finalDir, "重新定义可能-r1.html");
    writeJson(deckPath, validDeck());
    writeFileSync(defaultHtmlPath, DEFAULT_HTML);
    writeFileSync(candidatePath, DEFAULT_HTML);

    const output = runWriteFinal(repoRoot, deckPath, candidatePath, defaultHtmlPath, {
      ...process.env,
      FINAL_HTML_DIR: finalDir,
    });

    expect(realpathSync(output)).toBe(realpathSync(finalPath));
    expect(existsSync(finalPath)).toBe(true);
  });

  it("does not write final HTML when contract validation fails", () => {
    const repoRoot = makeTempDir("codeck-write-final-invalid-repo-");
    const deckDir = makeTempDir("codeck-write-final-invalid-deck-");
    initGitRepo(repoRoot);

    const deckPath = join(deckDir, "deck.json");
    const defaultHtmlPath = join(deckDir, "default.html");
    const candidatePath = join(deckDir, "重新定义可能-r1.candidate.html");
    const finalPath = join(repoRoot, "重新定义可能-r1.html");
    writeJson(deckPath, validDeck());
    writeFileSync(defaultHtmlPath, DEFAULT_HTML);
    writeFileSync(candidatePath, DEFAULT_HTML.replace('id="slide-cover"', 'id="slide-cover-bad"'));

    expect(() => runWriteFinal(repoRoot, deckPath, candidatePath, defaultHtmlPath)).toThrow();
    expect(existsSync(finalPath)).toBe(false);
  });
});
