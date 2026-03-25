/**
 * [INPUT]: 依赖 Vitest 与文件系统读取关键 skill/reference 文本，覆盖快捷键承诺、产物命名和 reference shell 对齐
 * [OUTPUT]: 保证文档与参考文件不会再次回到未实现的 help 面板或旧 HTML 命名说法
 * [POS]: skills/ 的对齐测试层，保护运行时说明与真实实现一致
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

function read(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("skill alignment", () => {
  it("removes unsupported help-panel promises from runtime docs", () => {
    const designSkill = read("skills/codeck-design/SKILL.md");
    const reviewSkill = read("skills/codeck-review/SKILL.md");
    const helpPanelPhrase = ["快捷键", "帮助面板"].join("");

    expect(designSkill).not.toContain(helpPanelPhrase);
    expect(designSkill).not.toContain("? 查看所有快捷键");
    expect(reviewSkill).not.toContain(helpPanelPhrase);
  });

  it("avoids stale fullscreen wording in skill docs", () => {
    const designSkill = read("skills/codeck-design/SKILL.md");
    const reviewSkill = read("skills/codeck-review/SKILL.md");

    expect(designSkill).not.toContain("全屏模式，自动隐藏导航栏和页码");
    expect(reviewSkill).not.toContain("进入全屏，导航栏和页码隐藏");
    expect(designSkill).not.toContain("永久隐藏导航栏");
    expect(reviewSkill).not.toContain("永久隐藏导航栏");
  });

  it("documents the final html artifact instead of the legacy html filename", () => {
    const designSkill = read("skills/codeck-design/SKILL.md");
    const evals = read("skills/evals/evals.json");
    const legacyHtmlName = ["deck", "html"].join(".");

    expect(designSkill).not.toContain("Outputs $DECK_DIR/deck.json + deck.html");
    expect(designSkill).toContain("{title}-r{revision}.html");
    expect(evals).not.toContain(legacyHtmlName);
    expect(evals).toContain("{title}-r{revision}.html");
  });

  it("keeps reference shell aligned with the renderer", () => {
    const reference = read("skills/codeck-design/references/default.html");

    expect(reference).not.toContain("deck-help");
    expect(reference).toContain("event.preventDefault();");
    expect(reference).toContain("document.addEventListener('fullscreenchange'");
    expect(reference).toContain("event.clientY > window.innerHeight - 48");
    expect(reference).toContain(".deck-app.is-fullscreen .deck-nav.nav-revealed");
  });

  it("write-final outputs to resolveFinalHtmlDir, not dirname(deckPath)", () => {
    const compilerSrc = read("skills/compiler/index.ts");

    expect(compilerSrc).toContain("resolveFinalHtmlDir()");
  });

  it("preflight returns structured READY/NOT_READY", () => {
    const preflight = read("skills/preflight.mjs");

    expect(preflight).toContain('"READY"');
    expect(preflight).toContain('"NOT_READY"');
    expect(preflight).not.toContain('"FOUND"');
    expect(preflight).not.toContain('"MISSING"');
  });

  it("CLAUDE.md documents final HTML output to repo root", () => {
    const claude = read("CLAUDE.md");

    expect(claude).toContain("仓库根目录");
    expect(claude).toContain("FINAL_HTML_DIR");
  });
});
