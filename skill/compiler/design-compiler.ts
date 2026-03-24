/**
 * [INPUT]: 接收 default HTML 字符串和 design.json 对象（新三层 schema 或 legacy schema）
 * [OUTPUT]: 返回注入 fallback CSS 后的最终 HTML，供 legacy/对照渲染使用
 * [POS]: skill/compiler 的确定性 fallback design compiler，负责兼容旧的 CSS 注入路径
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeAttribute } from "./escape";
import { projectLegacyCompileInput } from "../design/design-schema";

export function compileDesign(defaultHtml: string, design: any): string {
  const legacy = projectLegacyCompileInput(design);
  const css = [
    googleFontImports(legacy),
    tokenCss(legacy.tokens || {}),
    pageStyleCss(legacy.pageStyles || {}),
    blockStyleCss(legacy.blockStyles || {}),
    overrideCss(Array.isArray(legacy.overrides) ? legacy.overrides : []),
  ].filter(Boolean).join("\n\n");

  if (!css.trim()) return defaultHtml;
  return defaultHtml.replace("</head>", `<style id="codeck-design-compiler">\n${css}\n</style>\n</head>`);
}

function googleFontImports(input: any): string {
  const urls = collectFontUrls(input);
  return urls.map((url) => `@import url("${escapeAttribute(url)}");`).join("\n");
}

function collectFontUrls(input: any, urls: string[] = []): string[] {
  if (!input || typeof input !== "object") return urls;
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && key.toLowerCase().includes("fonturl")) urls.push(value);
    if (value && typeof value === "object") collectFontUrls(value, urls);
  }
  return [...new Set(urls)];
}

function tokenCss(tokens: any): string {
  const vars = flattenTokens(tokens).map(([key, value]) => `  --${key}: ${value};`);
  return vars.length ? `:root {\n${vars.join("\n")}\n}` : "";
}

function flattenTokens(input: any, prefix = ""): Array<[string, string]> {
  if (!input || typeof input !== "object") return [];
  const pairs: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(input)) {
    if (key === "description") continue;
    const next = prefix ? `${prefix}-${kebab(key)}` : kebab(key);
    if (typeof value === "string" || typeof value === "number") {
      pairs.push([next, String(value)]);
    }
    if (Array.isArray(value) && value.every((item) => typeof item === "string" || typeof item === "number")) {
      pairs.push([next, value.join(", ")]);
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      pairs.push(...flattenTokens(value, next));
    }
  }
  return pairs;
}

function pageStyleCss(pageStyles: any): string {
  return Object.entries(pageStyles).map(([purpose, value]) => {
    const decls = cssDeclarations(value as Record<string, unknown>, ["description", "title", "subtitle", "body", "background", "cta"]);
    const bgColor = (value as any)?.background?.color ? `background:${(value as any).background.color};` : "";
    const titleColor = (value as any)?.title?.color ? `.slide[data-purpose="${purpose}"] h1,.slide[data-purpose="${purpose}"] h2{color:${(value as any).title.color};}` : "";
    return `.slide[data-purpose="${purpose}"]{${bgColor}${decls}}${titleColor}`;
  }).join("\n");
}

function blockStyleCss(blockStyles: any): string {
  return Object.entries(blockStyles).map(([type, value]) => {
    const decls = cssDeclarations(value as Record<string, unknown>, ["description", "title", "subtitle", "body", "variants", "marker", "valueFont"]);
    return `.block--${kebab(type)}{${decls}}`;
  }).join("\n");
}

function overrideCss(overrides: any[]): string {
  if (!Array.isArray(overrides)) return "";
  return overrides.map((entry) => {
    const selector = entry?.target?.startsWith("#") ? entry.target : `#${entry?.target || ""}`;
    const styles = entry?.styles || entry?.declarations || {};
    return selector ? `${selector}{${cssDeclarations(styles, [])}}` : "";
  }).join("\n");
}

function cssDeclarations(
  input: Record<string, unknown>,
  excluded: string[],
): string {
  return Object.entries(input).flatMap(([key, value]) => {
    if (excluded.includes(key)) return [];
    if (typeof value === "string" || typeof value === "number") {
      return [`${kebab(key)}:${value};`];
    }
    return [];
  }).join("");
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
