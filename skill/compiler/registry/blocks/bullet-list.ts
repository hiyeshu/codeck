/**
 * [INPUT]: 接收 BulletList props
 * [OUTPUT]: 返回默认版 bullet list HTML
 * [POS]: skill/compiler/registry/blocks 的 BulletList renderer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeHtml } from "../../escape";
import { wrapBlock } from "./shared";

export function renderBulletList(id: string, props: Record<string, unknown>): string {
  const heading = props.heading ? `<h3 class="bullet-list__heading">${escapeHtml(props.heading)}</h3>` : "";
  const items = Array.isArray(props.items) ? props.items : [];
  const list = items.map((item) => {
    if (typeof item === "string") {
      return `<li class="bullet-list__item">${escapeHtml(item)}</li>`;
    }
    const title = item?.title ? `<strong>${escapeHtml(item.title)}</strong>` : "";
    const body = item?.body ? `<span>${escapeHtml(item.body)}</span>` : "";
    return `<li class="bullet-list__item">${title}${title && body ? "<br />" : ""}${body}</li>`;
  }).join("");
  return wrapBlock(id, "bullet-list", `<div class="bullet-list">${heading}<ul>${list}</ul></div>`);
}
