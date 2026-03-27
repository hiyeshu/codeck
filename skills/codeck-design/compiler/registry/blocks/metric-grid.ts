/**
 * [INPUT]: 接收 MetricGrid / DarkStat props
 * [OUTPUT]: 返回默认版指标网格 HTML
 * [POS]: skills/compiler/registry/blocks 的 MetricGrid renderer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeHtml } from "../../escape";
import { wrapBlock } from "./shared";

export function renderMetricGrid(
  id: string,
  props: Record<string, unknown>,
  blockType = "metric-grid",
): string {
  const label = props.label ? `<p class="metric-grid__label">${escapeHtml(props.label)}</p>` : "";
  const title = props.title ? `<h3 class="metric-grid__title">${escapeHtml(props.title)}</h3>` : "";
  const items = Array.isArray(props.items) ? props.items : [];
  const cards = items.map((item) => {
    const value = escapeHtml(item?.value ?? "");
    const itemLabel = escapeHtml(item?.label ?? "");
    const note = item?.note ? `<p class="metric-grid__note">${escapeHtml(item.note)}</p>` : "";
    return `<article class="metric-grid__card"><div class="metric-grid__value">${value}</div><div class="metric-grid__item-label">${itemLabel}</div>${note}</article>`;
  }).join("");
  const html = `<div class="metric-grid">${label}${title}<div class="metric-grid__items">${cards}</div></div>`;
  return wrapBlock(id, blockType, html);
}
