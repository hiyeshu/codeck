/**
 * [INPUT]: 依赖 Vitest 与 compiler catalog 类型，覆盖遍历分析和渲染守卫
 * [OUTPUT]: 保证 traverse.ts 在正常、缺失、循环、重复和深度超限场景下稳定输出
 * [POS]: skills/compiler 的测试层，保护 spec 遍历合同
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import type { DeckSpecV2 } from "./catalog";
import { analyzeTraversal, renderTree } from "./traverse";

function makeSpec(overrides?: Partial<DeckSpecV2>): DeckSpecV2 {
  return {
    schemaVersion: 2,
    root: "deck",
    meta: { title: "Deck", revision: 1 },
    elements: {
      deck: { type: "Deck", props: {}, children: ["slide-1"] },
      "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["block-1"] },
      "block-1": { type: "StatementHero", props: { title: "Hello" }, children: [] },
    },
    ...overrides,
  };
}

describe("analyzeTraversal", () => {
  it("returns a stable traversal order for a valid spec", () => {
    expect(analyzeTraversal(makeSpec()).order).toEqual(["deck", "slide-1", "block-1"]);
  });

  it("reports cycles as errors", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["deck"] },
      },
    });
    expect(analyzeTraversal(spec).issues.some((issue) => issue.kind === "cycle")).toBe(true);
  });

  it("reports missing children as errors", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["missing-block"] },
      },
    });
    expect(analyzeTraversal(spec).issues.some((issue) => issue.kind === "missing")).toBe(true);
  });

  it("reports duplicate references as warnings", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1", "slide-2"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["block-1"] },
        "slide-2": { type: "Slide", props: { purpose: "content" }, children: ["block-1"] },
        "block-1": { type: "StatementHero", props: { title: "Hello" }, children: [] },
      },
    });
    expect(analyzeTraversal(spec).issues.some((issue) => issue.kind === "duplicate")).toBe(true);
  });

  it("reports orphan elements as warnings", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: [] },
        orphan: { type: "Heading", props: { title: "Unused" }, children: [] },
      },
    });
    expect(analyzeTraversal(spec).issues.some((issue) => issue.kind === "orphan")).toBe(true);
  });
});

describe("renderTree", () => {
  const renderNode = (id: string, _node: any, children: string) => `<${id}>${children}</${id}>`;

  it("renders a valid tree in children order", () => {
    expect(renderTree(makeSpec(), renderNode)).toBe("<deck><slide-1><block-1></block-1></slide-1></deck>");
  });

  it("renders a cycle comment when a cycle is detected", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["deck"] },
      },
    });
    expect(renderTree(spec, renderNode)).toContain("<!-- cycle: deck -->");
  });

  it("renders a missing comment for absent children", () => {
    const spec = makeSpec({
      elements: {
        deck: { type: "Deck", props: {}, children: ["slide-1"] },
        "slide-1": { type: "Slide", props: { purpose: "cover" }, children: ["missing-block"] },
      },
    });
    expect(renderTree(spec, renderNode)).toContain("<!-- missing: missing-block -->");
  });

  it("renders a max-depth comment when traversal exceeds the limit", () => {
    const elements: DeckSpecV2["elements"] = {
      deck: { type: "Deck", props: {}, children: ["n0"] },
    };
    for (let i = 0; i < 25; i += 1) {
      elements[`n${i}`] = {
        type: i === 24 ? "StatementHero" : "Slide",
        props: i === 24 ? { title: `Node ${i}` } : { purpose: `p${i}` },
        children: i === 24 ? [] : [`n${i + 1}`],
      };
    }
    const spec = makeSpec({ elements });
    expect(renderTree(spec, renderNode, 5)).toContain("<!-- max-depth: n5 -->");
  });
});
