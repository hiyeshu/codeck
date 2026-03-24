/**
 * [INPUT]: 接收 Slide element id、props 和已渲染 children
 * [OUTPUT]: 返回带稳定 data 属性的 section.slide，内含统一 slide__canvas 内容层
 * [POS]: skill/compiler/registry 的页面级组件，实现 Slide 容器与 selector contract
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeAttribute } from "../escape";

export function renderSlide(
  id: string,
  props: Record<string, unknown>,
  children: string,
): string {
  const purpose = String(props.purpose || "content");
  const narrativeRole = String(props.narrativeRole || "");
  const importance = String(props.importance || "");
  const notes = String(props.speakerNotes || "");

  return `<section class="slide slide--${escapeAttribute(purpose)}" id="${escapeAttribute(id)}" data-purpose="${escapeAttribute(purpose)}" data-narrative-role="${escapeAttribute(narrativeRole)}" data-importance="${escapeAttribute(importance)}" data-notes="${escapeAttribute(notes)}"><div class="slide__canvas">${children}</div></section>`;
}
