/**
 * [INPUT]: 接收 block id、语义 block type 和 inner HTML
 * [OUTPUT]: 返回统一 block 容器，带稳定 class、id 和 data-block-type
 * [POS]: skill/compiler/registry/blocks 的共享包装层，统一 selector contract
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeAttribute } from "../../escape";

export function wrapBlock(id: string, blockType: string, inner: string): string {
  return `<div class="block block--${escapeAttribute(blockType)}" id="${escapeAttribute(id)}" data-block-type="${escapeAttribute(blockType)}">${inner}</div>`;
}
