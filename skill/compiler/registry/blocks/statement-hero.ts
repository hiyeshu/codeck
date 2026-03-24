/**
 * [INPUT]: 接收 StatementHero props
 * [OUTPUT]: 返回默认版 hero block HTML
 * [POS]: skill/compiler/registry/blocks 的 StatementHero renderer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeHtml } from "../../escape";
import { wrapBlock } from "./shared";

export function renderStatementHero(id: string, props: Record<string, unknown>): string {
  const label = props.label ? `<p class="statement-hero__label">${escapeHtml(props.label)}</p>` : "";
  const body = props.body ? `<p class="statement-hero__body">${escapeHtml(props.body)}</p>` : "";
  const html = `<div class="statement-hero">${label}<h1 class="statement-hero__title">${escapeHtml(props.title)}</h1>${body}</div>`;
  return wrapBlock(id, "statement-hero", html);
}
