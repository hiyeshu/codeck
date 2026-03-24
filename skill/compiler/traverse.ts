/**
 * [INPUT]: 接收 schemaVersion 2 的 flat element tree spec
 * [OUTPUT]: 提供遍历分析报告与严格按 children 顺序的递归渲染器
 * [POS]: skill/compiler 的遍历合同层，负责 missing/duplicate/orphan/cycle 规则
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { DeckSpecV2, ElementNode } from "./catalog";

export interface TraverseIssue {
  level: "error" | "warning";
  kind: "missing" | "duplicate" | "orphan" | "cycle" | "max-depth";
  id: string;
  message: string;
}

export interface TraverseReport {
  order: string[];
  referenced: Set<string>;
  issues: TraverseIssue[];
}

export interface RenderComment {
  kind: "missing" | "cycle" | "max-depth";
  id: string;
}

export function analyzeTraversal(spec: DeckSpecV2, maxDepth = 20): TraverseReport {
  const issues: TraverseIssue[] = [];
  const order: string[] = [];
  const referenced = new Set<string>();
  const rendered = new Set<string>();
  const stack = new Set<string>();

  function visit(id: string, depth: number): void {
    if (depth > maxDepth) {
      issues.push({ level: "error", kind: "max-depth", id, message: `Traversal depth exceeded at ${id}` });
      return;
    }
    if (stack.has(id)) {
      issues.push({ level: "error", kind: "cycle", id, message: `Cycle detected at ${id}` });
      return;
    }
    const node = spec.elements[id];
    if (!node) {
      issues.push({ level: "error", kind: "missing", id, message: `Missing child ${id}` });
      return;
    }
    if (rendered.has(id)) {
      issues.push({
        level: "warning",
        kind: "duplicate",
        id,
        message: `Element ${id} is referenced more than once`,
      });
      return;
    }

    rendered.add(id);
    order.push(id);
    stack.add(id);
    for (const childId of node.children) {
      referenced.add(childId);
      visit(childId, depth + 1);
    }
    stack.delete(id);
  }

  visit(spec.root, 0);

  for (const id of Object.keys(spec.elements)) {
    if (id === spec.root) continue;
    if (referenced.has(id)) continue;
    if (rendered.has(id)) continue;
    issues.push({
      level: "warning",
      kind: "orphan",
      id,
      message: `Element ${id} is not referenced by any parent`,
    });
  }

  return { order, referenced, issues };
}

export function renderTree(
  spec: DeckSpecV2,
  renderNode: (id: string, node: ElementNode, children: string) => string,
  maxDepth = 20,
): string {
  const rendered = new Set<string>();
  const stack = new Set<string>();

  function visit(id: string, depth: number): string {
    if (depth > maxDepth) return comment("max-depth", id);
    if (stack.has(id)) return comment("cycle", id);
    const node = spec.elements[id];
    if (!node) return comment("missing", id);
    if (rendered.has(id)) return "";

    rendered.add(id);
    stack.add(id);
    const children = node.children.map((childId) => visit(childId, depth + 1)).join("");
    stack.delete(id);
    return renderNode(id, node, children);
  }

  return visit(spec.root, 0);
}

function comment(kind: RenderComment["kind"], id: string): string {
  return `<!-- ${kind}: ${id} -->`;
}
