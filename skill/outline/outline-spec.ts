/**
 * [INPUT]: 依赖 zod，描述 outline 阶段产出的 $DECK_DIR/outline.json 契约
 * [OUTPUT]: 对外提供 OutlineAssetSchema、OutlinePageSchema、OutlineSpecSchema 与 OutlineSpec 类型
 * [POS]: skill/outline 的结构化约束层，统一 outline → design 的 JSON handoff
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { z } from "zod";

export const OutlineAssetSchema = z.object({
  file: z.string().min(1),
  original: z.string().min(1),
});

export const OutlinePageSchema = z.object({
  title: z.string().min(1),
  purpose: z.string().min(1),
  keyPoint: z.string().min(1),
  blockType: z.string().min(1),
  layout: z.string().min(1),
});

export const OutlineSpecSchema = z.object({
  version: z.literal(1),
  topic: z.string().min(1),
  coreMessage: z.string().min(1),
  audience: z.string().min(1),
  length: z.string().min(1),
  language: z.string().min(2),
  narrativeArc: z.string().min(1),
  pages: z.array(OutlinePageSchema).min(1),
  assets: z.array(OutlineAssetSchema).optional(),
});

export type OutlineSpec = z.infer<typeof OutlineSpecSchema>;
