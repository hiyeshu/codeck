/**
 * [INPUT]: 依赖 Vitest 运行 prompt builder 与 final HTML contract validator
 * [OUTPUT]: 覆盖 Lisp prompt 组装和最终 HTML 结构守卫的关键回归场景
 * [POS]: skill/compiler 的测试层，保证 Claude 直出最终 HTML 的约束链路可回归
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import { buildFinalHtmlLispPrompt } from "../design/final-html-prompt";
import { validateFinalHtmlContract } from "./html-contract";
import type { DesignJson } from "../design/design-schema";

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
      <section class="slide slide--content" id="slide-content" data-purpose="content" data-narrative-role="evidence" data-importance="medium" data-notes="content notes">
        <div class="slide__canvas">
          <div class="block block--bullet-list" id="block-list" data-block-type="bullet-list"></div>
          <div class="block block--callout" id="block-callout" data-block-type="callout"></div>
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

const DESIGN_JSON: DesignJson = {
  meta: {
    name: "showcase",
    description: "Warm, editorial, calm design DNA.",
  },
  design_system: {
    description: "Tokens and layout rules.",
    color: { primary: { hex: "#ffb7b2" } },
    typography: { font_families: { heading: "Outfit" } },
    spacing: { base_unit: "8px" },
    layout: { content_density: "spacious" },
    shape: { border_radius: { large: "24px" } },
    elevation: { levels: { low: "0 2px 8px rgba(0,0,0,0.08)" } },
    motion: { easing: "ease-out" },
    components: {
      page_styles: { cover: { background: { color: "#fffaf5" } } },
      block_styles: { "statement-hero": { textAlign: "center" } },
      overrides: [],
    },
  },
  design_style: {
    description: "Quiet and deliberate visual language.",
    aesthetic: { mood: "warm" },
    visual_language: { whitespace_usage: "high" },
    composition: { hierarchy_method: "scale-and-space" },
    imagery: {},
    interaction_feel: {},
    brand_voice_in_ui: { tone: "calm" },
  },
  visual_effects: {
    description: "Light atmospheric effects.",
    overview: { fallback_strategy: "preserve-shell" },
    background_effects: { enabled: true, type: "gradient-blobs" },
    particle_systems: { enabled: false },
    three_d_elements: { enabled: false },
    shader_effects: { enabled: false },
    scroll_effects: { enabled: false },
    text_effects: { enabled: false },
    cursor_effects: { enabled: false },
    canvas_drawings: { enabled: false },
    svg_animations: { enabled: false },
  },
};

describe("buildFinalHtmlLispPrompt", () => {
  it("includes structure truth, design truth, and hard output contract", () => {
    const prompt = buildFinalHtmlLispPrompt({
      defaultHtml: DEFAULT_HTML,
      design: DESIGN_JSON,
      deckTitle: "重新定义可能",
      outputFileName: "重新定义可能-r1.html",
      defaultHtmlPath: "/tmp/default.html",
      designPath: "/tmp/design.json",
    });

    expect(prompt).toContain(':deck-title "重新定义可能"');
    expect(prompt).toContain(':output-filename "重新定义可能-r1.html"');
    expect(prompt).toContain(':default-html-path "/tmp/default.html"');
    expect(prompt).toContain(':design-json-path "/tmp/design.json"');
    expect(prompt).toContain("default.html 是结构真相源");
    expect(prompt).toContain("必须只返回完整 HTML");
    expect(prompt).toContain("output-filename");
    expect(prompt).toContain("design_system");
    expect(prompt).toContain("visual_effects");
    expect(prompt).toContain("#<<DEFAULT_HTML");
    expect(prompt).toContain("#<<DESIGN_JSON");
  });
});

describe("validateFinalHtmlContract", () => {
  it("passes when candidate preserves the structure contract", () => {
    const report = validateFinalHtmlContract(DEFAULT_HTML, DEFAULT_HTML);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it("fails when slide ids drift or shell nodes disappear", () => {
    const candidate = DEFAULT_HTML
      .replace('id="slide-content"', 'id="slide-content-rewritten"')
      .replace('<div class="deck-nav">', '<div class="deck-nav-missing">');

    const report = validateFinalHtmlContract(DEFAULT_HTML, candidate);
    expect(report.valid).toBe(false);
    expect(report.errors.some((item) => item.path === "slides[1].id")).toBe(true);
    expect(report.errors.some((item) => item.path === "shell.deck-nav")).toBe(true);
  });

  it("fails when slide count changes", () => {
    const candidate = DEFAULT_HTML.replace(
      /<section class="slide slide--content"[\s\S]*?<\/section>/,
      "",
    );

    const report = validateFinalHtmlContract(DEFAULT_HTML, candidate);
    expect(report.valid).toBe(false);
    expect(report.errors.some((item) => item.path === "slides")).toBe(true);
  });

  it("fails when slide canvas or block order changes", () => {
    const candidate = DEFAULT_HTML
      .replace('<div class="slide__canvas">', '<div class="slide__body">')
      .replace('id="block-list" data-block-type="bullet-list"></div>\n          <div class="block block--callout" id="block-callout" data-block-type="callout"', 'id="block-callout" data-block-type="callout"></div>\n          <div class="block block--bullet-list" id="block-list" data-block-type="bullet-list"');

    const report = validateFinalHtmlContract(DEFAULT_HTML, candidate);
    expect(report.valid).toBe(false);
    expect(report.errors.some((item) => item.message.includes("slide__canvas"))).toBe(true);
    expect(report.errors.some((item) => item.path === "slide-content.blocks[0].id")).toBe(true);
  });

  it("handles empty HTML without crashing", () => {
    expect(validateFinalHtmlContract("", "")).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });
});
