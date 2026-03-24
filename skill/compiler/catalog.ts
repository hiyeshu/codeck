/**
 * [INPUT]: 依赖 zod，定义 codeck json-render spec 的组件目录与 props 契约
 * [OUTPUT]: 对外提供 DeckSpecV2Schema、LegacyDeckSchema、COMPONENT_TYPES、COMPONENT_PROP_SCHEMAS 与校验辅助函数
 * [POS]: skill/compiler 的 schema 宪法层，负责统一 validate、migrate、renderer 的输入契约
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { z } from "zod";

const NonEmptyString = z.string().min(1);

const RichTextString = z.string();
const StringList = z.array(NonEmptyString);

const MetricItemSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: NonEmptyString,
  note: z.string().optional(),
});

const ProblemCardSchema = z.object({
  title: NonEmptyString,
  body: NonEmptyString,
  tone: z.string().optional(),
});

const FlowItemSchema = z.object({
  title: NonEmptyString,
  subtitle: z.string().optional(),
});

const ChartDatumSchema = z.object({
  label: NonEmptyString,
  value: z.number(),
});

const TableRowSchema = z.array(z.union([z.string(), z.number(), z.null()]));

export const COMPONENT_TYPES = [
  "Deck",
  "Slide",
  "TwoColumn",
  "Grid",
  "Stack",
  "Center",
  "StatementHero",
  "Hero",
  "Heading",
  "BulletList",
  "MetricGrid",
  "DarkStat",
  "Comparison",
  "OutcomeComparison",
  "ProblemCardGrid",
  "Quote",
  "Flow",
  "Timeline",
  "Table",
  "Code",
  "Image",
  "Video",
  "Callout",
  "Chart",
  "Divider",
  "MetricCard",
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export const COMPONENT_PROP_SCHEMAS: Record<ComponentType, z.ZodTypeAny> = {
  Deck: z.object({
    totalPages: z.number().int().positive().optional(),
  }),
  Slide: z.object({
    purpose: NonEmptyString,
    narrativeRole: z.string().optional(),
    importance: z.enum(["high", "medium", "low"]).optional(),
    speakerNotes: z.string().optional(),
    transition: z.enum(["fade", "slide", "none"]).optional(),
  }),
  TwoColumn: z.object({
    ratio: z.tuple([z.number(), z.number()]).optional(),
    gap: z.string().optional(),
  }),
  Grid: z.object({
    columns: z.number().int().min(1).max(4).optional(),
    gap: z.string().optional(),
  }),
  Stack: z.object({
    gap: z.string().optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
  }),
  Center: z.object({
    maxWidth: z.string().optional(),
  }),
  StatementHero: z.object({
    title: NonEmptyString,
    body: z.string().optional(),
    label: z.string().optional(),
  }),
  Hero: z.object({
    eyebrow: z.string().optional(),
    title: NonEmptyString,
    body: z.string().optional(),
  }),
  Heading: z.object({
    title: NonEmptyString,
    subtitle: z.string().optional(),
    level: z.enum(["h1", "h2", "h3"]).optional(),
  }),
  BulletList: z.object({
    heading: z.string().optional(),
    items: z.array(z.union([
      NonEmptyString,
      z.object({ title: NonEmptyString, body: z.string().optional() }),
    ])).min(1),
  }),
  MetricGrid: z.object({
    label: z.string().optional(),
    title: z.string().optional(),
    items: z.array(MetricItemSchema).min(1),
  }),
  DarkStat: z.object({
    label: z.string().optional(),
    title: z.string().optional(),
    items: z.array(MetricItemSchema).min(1),
  }),
  Comparison: z.object({
    left: z.record(z.string(), z.unknown()),
    right: z.record(z.string(), z.unknown()),
  }),
  OutcomeComparison: z.object({
    before: z.record(z.string(), z.unknown()),
    after: z.record(z.string(), z.unknown()),
  }),
  ProblemCardGrid: z.object({
    label: z.string().optional(),
    title: NonEmptyString,
    cards: z.array(ProblemCardSchema).min(1),
  }),
  Quote: z.object({
    content: RichTextString,
    attribution: z.string().optional(),
  }),
  Flow: z.object({
    heading: z.string().optional(),
    items: z.array(FlowItemSchema).min(1),
  }),
  Timeline: z.object({
    heading: z.string().optional(),
    items: z.array(z.record(z.string(), z.unknown())).min(1),
  }),
  Table: z.object({
    title: z.string().optional(),
    columns: StringList.min(1).optional(),
    rows: z.array(TableRowSchema).min(1).optional(),
  }),
  Code: z.object({
    language: z.string().optional(),
    title: z.string().optional(),
    code: z.string(),
    highlight: z.array(z.number().int().positive()).optional(),
  }),
  Image: z.object({
    src: NonEmptyString,
    alt: z.string().optional(),
    caption: z.string().optional(),
    fit: z.enum(["contain", "cover"]).optional(),
  }),
  Video: z.object({
    src: NonEmptyString,
    poster: z.string().optional(),
    caption: z.string().optional(),
  }),
  Callout: z.object({
    variant: z.enum(["info", "warning", "success", "danger"]).optional(),
    title: z.string().optional(),
    body: RichTextString,
  }),
  Chart: z.object({
    chartType: z.enum(["bar", "line"]),
    title: z.string().optional(),
    data: z.array(ChartDatumSchema).min(1),
    unit: z.string().optional(),
  }),
  Divider: z.object({}).passthrough(),
  MetricCard: z.object({
    value: z.union([z.string(), z.number()]),
    label: NonEmptyString,
    note: z.string().optional(),
    delta: z.union([z.string(), z.number()]).optional(),
  }),
};

export const ElementSchema = z.object({
  type: z.enum(COMPONENT_TYPES),
  props: z.record(z.string(), z.unknown()).default({}),
  children: z.array(NonEmptyString).default([]),
});

export const DeckSpecV2Schema = z.object({
  schemaVersion: z.literal(2),
  root: NonEmptyString,
  meta: z.object({
    title: NonEmptyString,
    language: z.string().optional(),
    revision: z.number().int().nonnegative().optional(),
  }).passthrough(),
  elements: z.record(NonEmptyString, ElementSchema),
});

export const LegacyDeckSchema = z.object({
  pages: z.array(z.object({
    id: NonEmptyString.optional(),
    title: z.string().optional(),
    purpose: z.string().optional(),
    blocks: z.array(z.object({
      id: NonEmptyString.optional(),
      type: NonEmptyString,
    }).passthrough()),
  }).passthrough()).min(1),
}).passthrough();

export type ElementNode = z.infer<typeof ElementSchema>;
export type DeckSpecV2 = z.infer<typeof DeckSpecV2Schema>;
export type LegacyDeck = z.infer<typeof LegacyDeckSchema>;

export interface CatalogIssue {
  level: "error" | "warning";
  path: string;
  message: string;
}

export function validateElementProps(
  id: string,
  element: ElementNode,
): CatalogIssue[] {
  const schema = COMPONENT_PROP_SCHEMAS[element.type];
  const parsed = schema.safeParse(element.props);
  if (parsed.success) return [];
  return parsed.error.issues.map((issue) => ({
    level: "error",
    path: `elements.${id}.props${issue.path.length ? `.${issue.path.join(".")}` : ""}`,
    message: issue.message,
  }));
}
