/**
 * [INPUT]: 依赖 Vitest 与临时文件，覆盖 deck/design 联合校验与副作用边界
 * [OUTPUT]: 保证 validateDeckAndDesign 的 legacy warning、schema error 与 no-write contract 稳定
 * [POS]: skill/compiler 的校验测试层，保护 validate.ts 的纯函数行为
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { existsSync, mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { describe, expect, it } from "vitest";
import { validateDeckAndDesign } from "./validate";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function validDeck() {
  return {
    schemaVersion: 2,
    root: "deck",
    meta: { title: "Deck", revision: 1 },
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

function validDesign() {
  return {
    meta: { description: "Design DNA" },
    design_system: {
      description: "Tokens",
      color: {},
      typography: {},
      spacing: {},
      layout: {},
      shape: {},
      elevation: {},
      motion: {},
      components: {},
    },
    design_style: {
      description: "Style",
      aesthetic: {},
      visual_language: {},
      composition: {},
      imagery: {},
      interaction_feel: {},
      brand_voice_in_ui: {},
    },
    visual_effects: {
      description: "Effects",
      overview: {},
      background_effects: {},
      particle_systems: {},
      three_d_elements: {},
      shader_effects: {},
      scroll_effects: {},
      text_effects: {},
      cursor_effects: {},
      canvas_drawings: {},
      svg_animations: {},
    },
  };
}

describe("validateDeckAndDesign", () => {
  it("accepts a valid v2 deck", () => {
    const dir = makeTempDir("codeck-validate-");
    const deckPath = join(dir, "deck.json");
    writeJson(deckPath, validDeck());

    expect(validateDeckAndDesign(deckPath)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("warns for legacy decks", () => {
    const dir = makeTempDir("codeck-validate-legacy-");
    const deckPath = join(dir, "deck.json");
    writeJson(deckPath, {
      pages: [
        {
          title: "Legacy",
          blocks: [{ type: "statement-hero" }],
        },
      ],
    });

    const report = validateDeckAndDesign(deckPath);
    expect(report.valid).toBe(true);
    expect(report.warnings[0]?.path).toBe("schemaVersion");
  });

  it("returns errors for invalid decks", () => {
    const dir = makeTempDir("codeck-validate-invalid-");
    const deckPath = join(dir, "deck.json");
    writeJson(deckPath, { schemaVersion: 2, root: "deck", elements: {} });

    const report = validateDeckAndDesign(deckPath);
    expect(report.valid).toBe(false);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("validates design.json when provided", () => {
    const dir = makeTempDir("codeck-validate-design-");
    const deckPath = join(dir, "deck.json");
    const designPath = join(dir, "design.json");
    writeJson(deckPath, validDeck());
    writeJson(designPath, []);

    const report = validateDeckAndDesign(deckPath, designPath);
    expect(report.valid).toBe(false);
    expect(report.errors.some((item) => item.path === "design")).toBe(true);
  });

  it("does not write validate-report.json as a side effect", () => {
    const dir = makeTempDir("codeck-validate-pure-");
    const deckPath = join(dir, "deck.json");
    writeJson(deckPath, validDeck());

    validateDeckAndDesign(deckPath);

    expect(existsSync(join(dir, "validate-report.json"))).toBe(false);
  });
});
