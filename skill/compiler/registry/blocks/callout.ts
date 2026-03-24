/**
 * [INPUT]: 接收 Callout props
 * [OUTPUT]: 返回默认版 callout HTML，body 按白名单富文本规则过滤
 * [POS]: skill/compiler/registry/blocks 的 Callout renderer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeHtml, sanitizeRichText } from "../../escape";
import { wrapBlock } from "./shared";

export function renderCallout(id: string, props: Record<string, unknown>): string {
  const variant = typeof props.variant === "string" ? props.variant : "info";
  const title = props.title ? `<h3 class="callout__title">${escapeHtml(props.title)}</h3>` : "";
  const body = `<div class="callout__body">${sanitizeRichText(props.body, ["strong", "em", "a"])}</div>`;
  return wrapBlock(id, "callout", `<aside class="callout callout--${escapeHtml(variant)}">${title}${body}</aside>`);
}
