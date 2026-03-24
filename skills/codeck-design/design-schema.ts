/**
 * [INPUT]: 接收 design.json 原始对象，支持新的三层设计结构和 legacy design.json
 * [OUTPUT]: 提供新 schema 校验、legacy 升级和 compiler 兼容映射
 * [POS]: skills/design 的设计真相源层，负责统一 design.json 的正式结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { z } from "zod";

type JsonRecord = Record<string, unknown>;

const LooseObject = z.record(z.string(), z.unknown());

const MetaSchema = z.object({
  name: z.string().optional(),
  description: z.string(),
  source_references: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  preset: z.string().optional(),
}).passthrough();

const LayerSchema = (shape: Record<string, z.ZodTypeAny>) => z.object({
  description: z.string(),
  ...shape,
}).passthrough();

export const DesignJsonSchema = z.object({
  meta: MetaSchema,
  design_system: LayerSchema({
    color: LooseObject.default({}),
    typography: LooseObject.default({}),
    spacing: LooseObject.default({}),
    layout: LooseObject.default({}),
    shape: LooseObject.default({}),
    elevation: LooseObject.default({}),
    motion: LooseObject.default({}),
    components: LooseObject.default({}),
  }),
  design_style: LayerSchema({
    aesthetic: LooseObject.default({}),
    visual_language: LooseObject.default({}),
    composition: LooseObject.default({}),
    imagery: LooseObject.default({}),
    interaction_feel: LooseObject.default({}),
    brand_voice_in_ui: LooseObject.default({}),
  }),
  visual_effects: LayerSchema({
    overview: LooseObject.default({}),
    background_effects: LooseObject.default({}),
    particle_systems: LooseObject.default({}),
    three_d_elements: LooseObject.default({}),
    shader_effects: LooseObject.default({}),
    scroll_effects: LooseObject.default({}),
    text_effects: LooseObject.default({}),
    cursor_effects: LooseObject.default({}),
    canvas_drawings: LooseObject.default({}),
    svg_animations: LooseObject.default({}),
  }),
}).passthrough();

const LegacyDesignSchema = z.object({
  id: z.string().optional(),
  revision: z.number().optional(),
  meta: z.object({
    preset: z.string().optional(),
    description: z.string().optional(),
  }).passthrough().optional(),
  tokens: LooseObject.optional(),
  global: LooseObject.optional(),
  pageStyles: LooseObject.optional(),
  blockStyles: LooseObject.optional(),
  animations: LooseObject.optional(),
  overrides: z.array(z.unknown()).optional(),
}).passthrough();

export type DesignJson = z.infer<typeof DesignJsonSchema>;

export interface DesignValidationResult {
  success: boolean;
  design?: DesignJson;
  warnings: string[];
  error?: string;
}

export function validateDesignJson(value: unknown): DesignValidationResult {
  const normalized = normalizeDesignJson(value);
  if (!normalized.success) {
    return { success: false, warnings: normalized.warnings, error: normalized.error };
  }
  return { success: true, design: normalized.design, warnings: normalized.warnings };
}

export function normalizeDesignJson(value: unknown): DesignValidationResult {
  const parsed = DesignJsonSchema.safeParse(value);
  if (parsed.success) {
    return { success: true, design: parsed.data, warnings: [] };
  }

  const legacy = LegacyDesignSchema.safeParse(value);
  if (!legacy.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      warnings: [],
      error: issue ? `${issue.path.join(".") || "design"} — ${issue.message}` : "design.json is invalid",
    };
  }

  const upgraded = upgradeLegacyDesignJson(legacy.data);
  const finalParsed = DesignJsonSchema.safeParse(upgraded);
  if (!finalParsed.success) {
    const issue = finalParsed.error.issues[0];
    return {
      success: false,
      warnings: [],
      error: issue ? `${issue.path.join(".") || "design"} — ${issue.message}` : "failed to normalize legacy design.json",
    };
  }

  return {
    success: true,
    design: finalParsed.data,
    warnings: ["Legacy design.json detected and normalized to the new three-layer schema."],
  };
}

export function upgradeLegacyDesignJson(value: unknown): DesignJson {
  const legacy = LegacyDesignSchema.parse(value);
  const tokens = record(legacy.tokens);
  const global = record(legacy.global);
  const meta = record(legacy.meta);
  const pageStyles = record(legacy.pageStyles);
  const blockStyles = record(legacy.blockStyles);
  const animations = record(legacy.animations);
  const overrides = Array.isArray(legacy.overrides) ? legacy.overrides : [];

  const color = record(tokens.colors);
  const typography = record(tokens.typography);
  const spacing = record(tokens.spacing);
  const radii = record(tokens.radii);
  const shadows = record(tokens.shadows);
  const effects = record(tokens.effects);

  return {
    meta: {
      name: asString(legacy.id) || asString(meta.preset) || "design-system",
      description: firstText(
        asString(meta.description),
        asString(color.description),
        asString(typography.description),
        "Legacy design.json upgraded to the new three-layer design schema.",
      ),
      preset: asString(meta.preset),
      created_at: new Date().toISOString(),
      source_references: [],
    },
    design_system: {
      description: firstText(
        asString(meta.description),
        asString(color.description),
        "Quantified design tokens and component rules migrated from legacy design.json.",
      ),
      color,
      typography,
      spacing,
      layout: {
        ...global,
        page_styles: pageStyles,
      },
      shape: {
        border_radius: radii,
        border_usage: color.border,
        divider_style: pageStyles,
      },
      elevation: {
        shadows,
      },
      motion: {
        ...animations,
        transition: global.transition,
        transition_duration: global.transitionDuration,
      },
      components: {
        page_styles: pageStyles,
        block_styles: blockStyles,
        overrides,
      },
    },
    design_style: {
      description: firstText(
        asString(meta.description),
        asString(global.description),
        "Qualitative style direction inferred from the legacy design layer.",
      ),
      aesthetic: {
        mood: asString(meta.description),
        personality_traits: arrayOfStrings(meta.personalityTraits),
      },
      visual_language: {
        whitespace_usage: spacing.blockGap || spacing.sectionGap,
        contrast_level: color.contrastStrategy || color.contrast_strategy,
        texture_usage: effects.grain || effects.texture,
      },
      composition: {
        hierarchy_method: typography.scale,
        balance_type: global.density,
        grouping_strategy: pageStyles,
      },
      imagery: {
        graphic_elements: global.background,
      },
      interaction_feel: {
        transition_personality: global.transition,
        microinteraction_density: animations,
      },
      brand_voice_in_ui: {
        tone: asString(meta.description),
      },
    },
    visual_effects: {
      description: firstText(
        asString(effects.description),
        "Visual effects and decorative layers inferred from legacy tokens/global settings.",
      ),
      overview: {
        effect_intensity: effects.enabled ? "medium" : "lightweight",
        performance_tier: "lightweight",
        fallback_strategy: "preserve-shell-and-slide-contract",
        primary_technology: "css",
      },
      background_effects: {
        ...record(global.background),
        ...effects,
      },
      particle_systems: {
        enabled: false,
      },
      three_d_elements: {
        enabled: false,
      },
      shader_effects: {
        enabled: false,
      },
      scroll_effects: {
        enabled: false,
      },
      text_effects: {
        enabled: false,
      },
      cursor_effects: {
        enabled: false,
      },
      canvas_drawings: {
        enabled: false,
      },
      svg_animations: {
        enabled: false,
      },
    },
  };
}

export function projectLegacyCompileInput(value: unknown): JsonRecord {
  const normalized = normalizeDesignJson(value);
  if (!normalized.success || !normalized.design) return {};
  const design = normalized.design;
  const components = record(design.design_system.components);
  const layout = record(design.design_system.layout);
  const color = record(design.design_system.color);
  const typography = record(design.design_system.typography);
  const spacing = record(design.design_system.spacing);
  const shape = record(design.design_system.shape);
  const elevation = record(design.design_system.elevation);
  const backgroundEffects = record(design.visual_effects.background_effects);

  return {
    meta: design.meta,
    tokens: {
      colors: color,
      typography,
      spacing,
      radii: record(shape.border_radius),
      shadows: record(elevation.shadows || elevation.levels),
      effects: backgroundEffects,
    },
    global: {
      transition: record(design.design_system.motion).transition,
      transitionDuration: record(design.design_system.motion).transition_duration,
      background: backgroundEffects,
      density: layout.content_density || layout.density,
    },
    pageStyles: record(components.page_styles),
    blockStyles: record(components.block_styles),
    overrides: Array.isArray(components.overrides) ? components.overrides : [],
  };
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function firstText(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (value && value.trim()) return value;
  }
  return "";
}

function arrayOfStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
