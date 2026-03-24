/**
 * [INPUT]: 接收 v1 deck（pages + blocks）JSON
 * [OUTPUT]: 迁移为 schemaVersion 2 的 flat element tree spec
 * [POS]: skill/compiler 的迁移层，负责双轨期间的 v1 → v2 deck 转换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { DeckSpecV2, ComponentType } from "./catalog";

const BLOCK_TYPE_MAP: Record<string, ComponentType> = {
  "statement-hero": "StatementHero",
  hero: "Hero",
  heading: "Heading",
  "bullet-list": "BulletList",
  "metric-grid": "MetricGrid",
  "dark-stat": "DarkStat",
  comparison: "Comparison",
  "outcome-comparison": "OutcomeComparison",
  "problem-card-grid": "ProblemCardGrid",
  quote: "Quote",
  flow: "Flow",
  timeline: "Timeline",
  table: "Table",
  code: "Code",
  image: "Image",
  video: "Video",
  callout: "Callout",
  chart: "Chart",
  divider: "Divider",
  "metric-card": "MetricCard",
};

export function migrateLegacyDeck(input: any): DeckSpecV2 {
  const elements: DeckSpecV2["elements"] = {};
  const deckChildren: string[] = [];

  (input.pages || []).forEach((page: any, pageIndex: number) => {
    const purpose = String(page.purpose || "content");
    const slideId = `slide-${purpose}-${pageIndex}`;
    deckChildren.push(slideId);
    const blockChildren: string[] = [];

    (page.blocks || []).forEach((block: any, blockIndex: number) => {
      const mapped = BLOCK_TYPE_MAP[block.type];
      if (!mapped) throw new Error(`Unsupported legacy block type: ${block.type}`);
      const blockId = `block-${slideId}-${block.type}-${blockIndex}`;
      blockChildren.push(blockId);

      const props = { ...block };
      delete props.id;
      delete props.type;
      elements[blockId] = { type: mapped, props, children: [] };
    });

    elements[slideId] = {
      type: "Slide",
      props: {
        purpose,
        narrativeRole: inferNarrativeRole(purpose),
        importance: inferImportance(purpose),
        speakerNotes: page.speakerNotes || "",
      },
      children: blockChildren,
    };
  });

  elements.deck = {
    type: "Deck",
    props: { totalPages: deckChildren.length },
    children: deckChildren,
  };

  return {
    schemaVersion: 2,
    root: "deck",
    meta: {
      title: input.meta?.title || "Untitled Deck",
      language: input.meta?.language,
      revision: input.revision || input.meta?.revision || 1,
    },
    elements,
  };
}

function inferNarrativeRole(purpose: string): string {
  if (purpose === "cover") return "hook";
  if (purpose === "metrics") return "evidence";
  if (purpose === "closing") return "cta";
  if (purpose === "section-divider") return "transition";
  return "content";
}

function inferImportance(purpose: string): string {
  if (purpose === "cover" || purpose === "closing") return "high";
  if (purpose === "metrics") return "medium";
  return "medium";
}
