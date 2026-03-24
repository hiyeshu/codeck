/**
 * [INPUT]: 依赖 Vitest 和 outline schema，覆盖结构化大纲 handoff 的基本校验
 * [OUTPUT]: 保证 outline.json 的必填字段契约稳定
 * [POS]: skill/outline 的测试层，保护 outline → design 的 JSON handoff
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import { OutlineSpecSchema } from "./outline-spec";

describe("OutlineSpecSchema", () => {
  it("accepts a valid outline JSON payload", () => {
    expect(() => OutlineSpecSchema.parse({
      version: 1,
      topic: "Compiler-first decks",
      coreMessage: "Stability comes from constraints",
      audience: "engineers",
      length: "8 slides",
      language: "zh-CN",
      narrativeArc: "problem → migration → payoff",
      pages: [
        {
          title: "Why now",
          purpose: "cover",
          keyPoint: "Rendering is unstable today",
          blockType: "statement-hero",
          layout: "center",
        },
      ],
    })).not.toThrow();
  });

  it("rejects payloads missing required fields", () => {
    const result = OutlineSpecSchema.safeParse({
      version: 1,
      topic: "Compiler-first decks",
      pages: [],
    });
    expect(result.success).toBe(false);
  });
});
