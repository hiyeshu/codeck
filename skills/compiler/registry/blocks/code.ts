/**
 * [INPUT]: 接收 Code props
 * [OUTPUT]: 返回默认版 code block HTML
 * [POS]: skills/compiler/registry/blocks 的 Code renderer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeHtml } from "../../escape";
import { wrapBlock } from "./shared";

export function renderCode(id: string, props: Record<string, unknown>): string {
  const titleText = props.title ? escapeHtml(props.title) : "";
  const titleBar = titleText
    ? `<div class="code-block__title-bar"><span class="code-block__dot code-block__dot--red"></span><span class="code-block__dot code-block__dot--yellow"></span><span class="code-block__dot code-block__dot--green"></span><span class="code-block__title-text">${titleText}</span></div>`
    : "";
  const code = escapeHtml(props.code);
  const html = `<div class="code-block">${titleBar}<pre class="code-block__pre"><code>${code}</code></pre></div>`;
  return wrapBlock(id, "code", html);
}
