/**
 * [INPUT]: 接收 renderer 的文本、富文本和 URL 字段
 * [OUTPUT]: 提供 HTML escape、属性 escape、白名单富文本过滤和 URL 协议校验
 * [POS]: skills/compiler 的安全层，统一执行 HTML 安全规则与 URL 协议白名单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "data:", "file:"]);

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, "file:///");
    return SAFE_URL_PROTOCOLS.has(url.protocol) ? value : null;
  } catch {
    return null;
  }
}

function sanitizeTag(raw: string, allowedTags: Set<string>): string {
  const close = raw.match(/^<\s*\/\s*([a-z]+)\s*>$/i);
  if (close && allowedTags.has(close[1].toLowerCase())) {
    return `</${close[1].toLowerCase()}>`;
  }

  const open = raw.match(/^<\s*([a-z]+)([^>]*)>$/i);
  if (!open) return escapeHtml(raw);
  const tag = open[1].toLowerCase();
  if (!allowedTags.has(tag)) return escapeHtml(raw);
  if (tag !== "a") return `<${tag}>`;

  const href = open[2].match(/href\s*=\s*"([^"]*)"/i)?.[1]
    || open[2].match(/href\s*=\s*'([^']*)'/i)?.[1];
  const safeHref = sanitizeUrl(href || "");
  if (!safeHref) return "<a>";
  return `<a href="${escapeAttribute(safeHref)}">`;
}

export function sanitizeRichText(value: unknown, allowed: string[]): string {
  const input = String(value ?? "");
  const allowedTags = new Set(allowed.map((tag) => tag.toLowerCase()));
  let result = "";
  let lastIndex = 0;

  for (const match of input.matchAll(/<[^>]*>/g)) {
    const index = match.index ?? 0;
    result += escapeHtml(input.slice(lastIndex, index));
    result += sanitizeTag(match[0], allowedTags);
    lastIndex = index + match[0].length;
  }

  result += escapeHtml(input.slice(lastIndex));
  return result;
}
