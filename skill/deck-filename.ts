/**
 * [INPUT]: 依赖 DeckSpec 的 meta.title 和 revision 字段
 * [OUTPUT]: 对外提供 deckFileName()/deckFinalHtmlFileName()/deckCandidateHtmlFileName()，统一最终产物与候选 HTML 的命名规则
 * [POS]: skill/ 的文件名工具层，被 compile-standalone / export-pdf / export-pptx / run.ts 共用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * 从 DeckSpec 的 title + revision 生成安全文件名（保留中文，去除特殊字符）
 * 例: "重新定义可能", revision 3 → "重新定义可能-r3"
 */
export function deckFileName(title: string, revision: number): string {
  const safe = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return `${safe || "deck"}-r${revision}`;
}

export function deckFinalHtmlFileName(title: string, revision: number): string {
  return `${deckFileName(title, revision)}.html`;
}

export function deckCandidateHtmlFileName(title: string, revision: number): string {
  return `${deckFileName(title, revision)}.candidate.html`;
}
