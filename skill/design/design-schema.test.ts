/**
 * [INPUT]: 依赖 Vitest 运行 design.json 新 schema、legacy 升级与 fallback compile 映射
 * [OUTPUT]: 覆盖三层 design.json 的校验、迁移与兼容回归
 * [POS]: skill/design 的测试层，保证 design.json 文件名不变但语义升级可控
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import {
  normalizeDesignJson,
  projectLegacyCompileInput,
  validateDesignJson,
} from "./design-schema";

const DNA_DESIGN = {
  meta: {
    name: "showcase",
    description: "Warm, calm, editorial demo deck.",
  },
  design_system: {
    description: "Quantified tokens and layout rules.",
    color: { primary: { hex: "#ffb7b2" } },
    typography: { font_families: { heading: "Outfit" } },
    spacing: { base_unit: "8px" },
    layout: { content_density: "spacious" },
    shape: { border_radius: { large: "24px" } },
    elevation: { levels: { low: "0 2px 8px rgba(0,0,0,0.08)" } },
    motion: { easing: "ease-out" },
    components: {
      page_styles: { cover: { background: { color: "#fffaf5" } } },
      block_styles: { "statement-hero": { titleColor: "#222" } },
      overrides: [{ target: "slide-cover", styles: { color: "#111" } }],
    },
  },
  design_style: {
    description: "Quiet and composed visual direction.",
    aesthetic: { mood: "warm" },
    visual_language: { whitespace_usage: "high" },
    composition: { hierarchy_method: "scale-and-space" },
    imagery: {},
    interaction_feel: {},
    brand_voice_in_ui: { tone: "confident" },
  },
  visual_effects: {
    description: "Lightweight atmospheric effects only.",
    overview: { fallback_strategy: "preserve-shell-and-slide-contract" },
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

const LEGACY_DESIGN = {
  id: "legacy-showcase",
  meta: {
    preset: "warm-minimal",
    description: "Legacy warm minimal design system.",
  },
  tokens: {
    colors: { background: "#fffaf5", primary: "#ffb7b2" },
    typography: { fontPrimary: "Outfit" },
    spacing: { blockGap: "32px" },
    radii: { lg: "24px" },
    shadows: { card: "0 2px 8px rgba(0,0,0,0.08)" },
  },
  global: {
    transition: "fade",
    transitionDuration: "0.6s",
    background: { color: "#fffaf5" },
  },
  pageStyles: {
    cover: { title: { color: "#222" } },
  },
  blockStyles: {
    "statement-hero": { textAlign: "center" },
  },
  overrides: [{ target: "slide-cover", styles: { color: "#111" } }],
};

describe("validateDesignJson", () => {
  it("accepts the new three-layer design.json schema", () => {
    const result = validateDesignJson(DNA_DESIGN);
    expect(result.success).toBe(true);
    expect(result.warnings).toHaveLength(0);
    expect(readField(result.design?.design_style.aesthetic, "mood")).toBe("warm");
  });

  it("normalizes legacy design.json into the new schema with a warning", () => {
    const result = normalizeDesignJson(LEGACY_DESIGN);
    expect(result.success).toBe(true);
    expect(result.warnings[0]).toContain("Legacy design.json detected");
    expect(readField(result.design?.design_system.components, "page_styles")).toEqual(LEGACY_DESIGN.pageStyles);
  });

  it("projects the new schema back to the fallback compile input shape", () => {
    const legacy = projectLegacyCompileInput(DNA_DESIGN);
    expect(readField(legacy, "pageStyles")).toEqual(readField(DNA_DESIGN.design_system.components, "page_styles"));
    expect(readField(legacy, "blockStyles")).toEqual(readField(DNA_DESIGN.design_system.components, "block_styles"));
    expect(readField(readField(legacy, "tokens"), "colors")).toEqual(DNA_DESIGN.design_system.color);
  });
});

function readField(value: unknown, key: string): unknown {
  return value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
}
