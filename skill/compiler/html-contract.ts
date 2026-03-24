/**
 * [INPUT]: 接收 default.html 与 Claude 生成的最终 HTML
 * [OUTPUT]: 返回 HTML contract 校验报告，约束 slide/block/shell 结构不被破坏
 * [POS]: skill/compiler 的最终 HTML 合同校验层，负责守住 default.html 作为结构真相源
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export interface HtmlContractMessage {
  path: string;
  message: string;
}

export interface HtmlContractReport {
  valid: boolean;
  errors: HtmlContractMessage[];
  warnings: HtmlContractMessage[];
}

interface SlideContract {
  id: string;
  purpose: string;
  notes: string;
  hasCanvas: boolean;
  blocks: BlockContract[];
}

interface BlockContract {
  id: string;
  type: string;
}

export function validateFinalHtmlContract(
  defaultHtml: string,
  candidateHtml: string,
): HtmlContractReport {
  const errors: HtmlContractMessage[] = [];
  const warnings: HtmlContractMessage[] = [];
  compareSlides(extractSlides(defaultHtml), extractSlides(candidateHtml), errors);
  compareShell(defaultHtml, candidateHtml, errors);
  return { valid: errors.length === 0, errors, warnings };
}

function compareSlides(
  source: SlideContract[],
  candidate: SlideContract[],
  errors: HtmlContractMessage[],
): void {
  if (source.length !== candidate.length) {
    errors.push(message("slides", `slide count changed: expected ${source.length}, received ${candidate.length}`));
  }
  for (let i = 0; i < Math.min(source.length, candidate.length); i += 1) {
    compareSlide(source[i], candidate[i], i, errors);
  }
}

function compareSlide(
  source: SlideContract,
  candidate: SlideContract,
  index: number,
  errors: HtmlContractMessage[],
): void {
  compareField(source.id, candidate.id, `slides[${index}].id`, errors);
  compareField(source.purpose, candidate.purpose, `slides[${index}].purpose`, errors);
  compareField(source.notes, candidate.notes, `slides[${index}].notes`, errors);
  if (!candidate.hasCanvas) errors.push(message(source.id, "missing .slide__canvas root"));
  compareBlocks(source.id, source.blocks, candidate.blocks, errors);
}

function compareBlocks(
  slideId: string,
  source: BlockContract[],
  candidate: BlockContract[],
  errors: HtmlContractMessage[],
): void {
  if (source.length !== candidate.length) {
    errors.push(message(`${slideId}.blocks`, `block count changed: expected ${source.length}, received ${candidate.length}`));
  }
  for (let i = 0; i < Math.min(source.length, candidate.length); i += 1) {
    compareField(source[i].id, candidate[i].id, `${slideId}.blocks[${i}].id`, errors);
    compareField(source[i].type, candidate[i].type, `${slideId}.blocks[${i}].type`, errors);
  }
}

function compareShell(
  sourceHtml: string,
  candidateHtml: string,
  errors: HtmlContractMessage[],
): void {
  for (const marker of shellMarkers()) {
    if (!marker.test(sourceHtml)) continue;
    if (!marker.test(candidateHtml)) errors.push(message(marker.path, marker.message));
  }
}

function extractSlides(html: string): SlideContract[] {
  const slides: SlideContract[] = [];
  const regex = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  for (const match of html.matchAll(regex)) {
    if (!hasClass(match[1], "slide")) continue;
    slides.push(toSlide(match[1], match[2]));
  }
  return slides;
}

function toSlide(attrs: string, innerHtml: string): SlideContract {
  return {
    id: attr(attrs, "id"),
    purpose: attr(attrs, "data-purpose"),
    notes: attr(attrs, "data-notes"),
    hasCanvas: /^\s*<div\b[^>]*class=(['"])[^'"]*\bslide__canvas\b[^'"]*\1/i.test(innerHtml),
    blocks: extractBlocks(innerHtml),
  };
}

function extractBlocks(html: string): BlockContract[] {
  const blocks: BlockContract[] = [];
  const regex = /<div\b([^>]*)>/gi;
  for (const match of html.matchAll(regex)) {
    if (!hasClass(match[1], "block")) continue;
    if (!attr(match[1], "data-block-type")) continue;
    blocks.push({ id: attr(match[1], "id"), type: attr(match[1], "data-block-type") });
  }
  return blocks;
}

function hasClass(attrs: string, name: string): boolean {
  return classNames(attrs).includes(name);
}

function classNames(attrs: string): string[] {
  return attr(attrs, "class").split(/\s+/).filter(Boolean);
}

function attr(attrs: string, name: string): string {
  const regex = new RegExp(`${escape(name)}\\s*=\\s*(['"])(.*?)\\1`, "i");
  return attrs.match(regex)?.[2] || "";
}

function compareField(
  source: string,
  candidate: string,
  path: string,
  errors: HtmlContractMessage[],
): void {
  if (source !== candidate) errors.push(message(path, `expected "${source}" but received "${candidate}"`));
}

function shellMarkers(): Array<{ path: string; message: string; test: (html: string) => boolean }> {
  return [
    classMarker("shell.deck-app", "missing .deck-app shell root", "deck-app"),
    classMarker("shell.deck-nav", "missing .deck-nav shell navigation", "deck-nav"),
    regexMarker("shell.counter", "missing data-counter node", /\bdata-counter\b/i),
    regexMarker("shell.progress", "missing data-progress node", /\bdata-progress\b/i),
    regexMarker("shell.notes-panel", "missing notes panel node", /\bdata-notes-panel\b/i),
    regexMarker("shell.action.overview", "missing overview action button", /\bdata-action=(['"])overview\1/i),
    regexMarker("shell.action.fullscreen", "missing fullscreen action button", /\bdata-action=(['"])fullscreen\1/i),
    regexMarker("shell.action.notes", "missing notes action button", /\bdata-action=(['"])notes\1/i),
    regexMarker("shell.script-entry", "missing deck shell script entrypoint", /document\.querySelector\((['"])\.deck-app\1\)/i),
  ];
}

function classMarker(path: string, messageText: string, className: string) {
  return { path, message: messageText, test: (html: string) => hasClassInHtml(html, className) };
}

function regexMarker(path: string, messageText: string, pattern: RegExp) {
  return { path, message: messageText, test: (html: string) => pattern.test(html) };
}

function message(path: string, text: string): HtmlContractMessage {
  return { path, message: text };
}

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasClassInHtml(html: string, className: string): boolean {
  const regex = /class\s*=\s*(['"])(.*?)\1/gi;
  for (const match of html.matchAll(regex)) {
    if (match[2].split(/\s+/).includes(className)) return true;
  }
  return false;
}
