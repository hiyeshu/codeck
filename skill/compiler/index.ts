/**
 * [INPUT]: 接收 compiler CLI 命令与 deck/design 文件路径
 * [OUTPUT]: 提供 validate / validate-design / upgrade-design / migrate / render-default / prompt-only / validate-html / candidate-filename / write-final / design-compile 十个命令
 * [POS]: skill/compiler 的入口层，串联 catalog、migrate、registry 和 design compiler
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { dirname, join, resolve } from "path";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { DeckSpecV2Schema, type DeckSpecV2, type ElementNode } from "./catalog";
import { validateDeckAndDesign, writeValidationReport } from "./validate";
import { migrateLegacyDeck } from "./migrate";
import { renderDeckDocument } from "./registry/deck";
import { renderSlide } from "./registry/slide";
import { renderStatementHero } from "./registry/blocks/statement-hero";
import { renderBulletList } from "./registry/blocks/bullet-list";
import { renderCode } from "./registry/blocks/code";
import { renderCallout } from "./registry/blocks/callout";
import { renderMetricGrid } from "./registry/blocks/metric-grid";
import { renderTree } from "./traverse";
import { compileDesign } from "./design-compiler";
import { validateFinalHtmlContract } from "./html-contract";
import { buildFinalHtmlLispPrompt } from "../design/final-html-prompt";
import {
  normalizeDesignJson,
  upgradeLegacyDesignJson,
  validateDesignJson,
} from "../design/design-schema";
import {
  deckCandidateHtmlFileName,
  deckFinalHtmlFileName,
} from "../deck-filename";
import { exitWith, readJson } from "../cli-util";

type Renderer = (id: string, props: Record<string, unknown>, children: string) => string;

const IMPLEMENTED_RENDERERS: Record<string, Renderer> = {
  Slide: (id, props, children) => renderSlide(id, props, children),
  StatementHero: (id, props) => renderStatementHero(id, props),
  BulletList: (id, props) => renderBulletList(id, props),
  Code: (id, props) => renderCode(id, props),
  Callout: (id, props) => renderCallout(id, props),
  MetricGrid: (id, props) => renderMetricGrid(id, props, "metric-grid"),
  DarkStat: (id, props) => renderMetricGrid(id, props, "dark-stat"),
};

export function runCli(): void {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === "validate") return runValidate(args[0], args[1]);
  if (cmd === "validate-design") return runValidateDesign(args[0]);
  if (cmd === "upgrade-design") return runUpgradeDesign(args[0]);
  if (cmd === "migrate") return runMigrate(args[0]);
  if (cmd === "render-default") return runRenderDefault(args[0]);
  if (cmd === "prompt-only") return runPromptOnly(args[0], args[1]);
  if (cmd === "validate-html") return runValidateHtml(args[0], args[1]);
  if (cmd === "candidate-filename") return runCandidateFileName(args[0]);
  if (cmd === "write-final") return runWriteFinal(args[0], args[1], args[2]);
  if (cmd === "design-compile") return runDesignCompile(args[0], args[1]);
  exitWith("Usage: compiler <validate|validate-design|upgrade-design|migrate|render-default|prompt-only|validate-html|candidate-filename|write-final|design-compile> ...", 1);
}

function runValidate(deckPath?: string, designPath?: string): void {
  if (!deckPath) exitWith("Usage: validate <deck> [design]", 1);
  const report = validateDeckAndDesign(deckPath, designPath);
  writeValidationReport(deckPath, report);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exit(1);
  if (report.warnings.length) process.exit(2);
}

function runMigrate(deckPath?: string): void {
  if (!deckPath) exitWith("Usage: migrate <oldDeck>", 1);
  const legacy = readJson(deckPath);
  console.log(JSON.stringify(migrateLegacyDeck(legacy), null, 2));
}

function runValidateDesign(designPath?: string): void {
  if (!designPath) exitWith("Usage: validate-design <design>", 1);
  const report = validateDesignJson(readJson(designPath));
  console.log(JSON.stringify({
    valid: report.success,
    warnings: report.warnings,
    error: report.error || null,
  }, null, 2));
  if (!report.success) process.exit(1);
  if (report.warnings.length) process.exit(2);
}

function runUpgradeDesign(designPath?: string): void {
  if (!designPath) exitWith("Usage: upgrade-design <legacyDesign>", 1);
  console.log(JSON.stringify(upgradeLegacyDesignJson(readJson(designPath)), null, 2));
}

function runRenderDefault(deckPath?: string): void {
  if (!deckPath) exitWith("Usage: render-default <deck>", 1);
  const parsed = DeckSpecV2Schema.safeParse(readJson(deckPath));
  if (!parsed.success) exitWith("render-default requires schemaVersion: 2 deck", 1);

  const html = renderDefaultDeck(parsed.data);
  const outPath = join(dirname(resolve(deckPath)), "default.html");
  writeFileSync(outPath, html);
  console.log(outPath);
}

function runDesignCompile(defaultHtmlPath?: string, designPath?: string): void {
  if (!defaultHtmlPath || !designPath) exitWith("Usage: design-compile <defaultHtml> <design>", 1);
  const html = readFileSync(resolve(defaultHtmlPath), "utf8");
  const design = readJson(designPath);
  process.stdout.write(compileDesign(html, design));
}

function runPromptOnly(defaultHtmlPath?: string, designPath?: string): void {
  if (!defaultHtmlPath || !designPath) exitWith("Usage: prompt-only <defaultHtml> <design>", 1);
  const prompt = buildPrompt(defaultHtmlPath, designPath);
  process.stdout.write(prompt);
}

function buildPrompt(defaultHtmlPath: string, designPath: string): string {
  const html = readFileSync(resolve(defaultHtmlPath), "utf8");
  const normalized = normalizeDesignJson(readJson(designPath));
  if (!normalized.success || !normalized.design) exitWith(normalized.error || "design.json is invalid", 1);
  const deckMeta = readSiblingDeckMeta(defaultHtmlPath);
  return buildFinalHtmlLispPrompt({
    defaultHtml: html,
    design: normalized.design,
    deckTitle: deckMeta?.title,
    outputFileName: deckMeta ? deckFinalHtmlFileName(deckMeta.title, deckMeta.revision) : undefined,
    defaultHtmlPath: resolve(defaultHtmlPath),
    designPath: resolve(designPath),
  });
}

function runValidateHtml(defaultHtmlPath?: string, candidateHtmlPath?: string): void {
  if (!defaultHtmlPath || !candidateHtmlPath) exitWith("Usage: validate-html <defaultHtml> <candidateHtml>", 1);
  const report = validateHtml(defaultHtmlPath, candidateHtmlPath);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length) process.exit(1);
}

function runCandidateFileName(deckPath?: string): void {
  if (!deckPath) exitWith("Usage: candidate-filename <deck>", 1);
  const deck = readDeck(deckPath);
  const outPath = join(
    dirname(resolve(deckPath)),
    deckCandidateHtmlFileName(deck.meta.title, deck.meta.revision ?? 0),
  );
  console.log(outPath);
}

function runWriteFinal(deckPath?: string, candidateHtmlPath?: string, defaultHtmlPath?: string): void {
  if (!deckPath || !candidateHtmlPath) {
    exitWith("Usage: write-final <deck> <candidateHtml> [defaultHtml]", 1);
  }
  const deck = readDeck(deckPath);
  const fallbackDefault = join(dirname(resolve(deckPath)), "default.html");
  const baseHtmlPath = resolve(defaultHtmlPath || fallbackDefault);
  const report = validateHtml(baseHtmlPath, candidateHtmlPath);
  if (report.errors.length) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
  const outPath = join(
    dirname(resolve(deckPath)),
    deckFinalHtmlFileName(deck.meta.title, deck.meta.revision ?? 0),
  );
  const candidate = readFileSync(resolve(candidateHtmlPath), "utf8");
  writeFileSync(outPath, candidate);
  console.log(outPath);
}

function validateHtml(defaultHtmlPath: string, candidateHtmlPath: string) {
  const source = readFileSync(resolve(defaultHtmlPath), "utf8");
  const candidate = readFileSync(resolve(candidateHtmlPath), "utf8");
  return validateFinalHtmlContract(source, candidate);
}

function readSiblingDeckMeta(defaultHtmlPath: string): { title: string; revision: number } | null {
  try {
    const candidatePath = join(dirname(resolve(defaultHtmlPath)), "deck.json");
    const parsed = DeckSpecV2Schema.safeParse(readJson(candidatePath));
    if (!parsed.success) return null;
    return {
      title: parsed.data.meta.title,
      revision: parsed.data.meta.revision ?? 0,
    };
  } catch {
    return null;
  }
}

function renderDefaultDeck(spec: DeckSpecV2): string {
  const deck = spec.elements[spec.root];
  const slideIds = deck.children;
  const slides = slideIds.map((slideId) => renderSlideEntry(spec, slideId)).join("");
  return renderDeckDocument(spec.meta.title, slides, slideIds.length);
}

function renderSlideEntry(spec: DeckSpecV2, slideId: string): string {
  return canRenderSlide(spec, slideId)
    ? renderTree(localSpec(spec, slideId), (id, node, children) => renderNode(id, node, children))
    : `<!-- fallback: ${slideId} -->`;
}

function canRenderSlide(spec: DeckSpecV2, slideId: string): boolean {
  const node = spec.elements[slideId];
  if (!node) return false;
  if (!IMPLEMENTED_RENDERERS[node.type]) return false;
  return node.children.every((childId) => canRenderBranch(spec, childId));
}

function canRenderBranch(spec: DeckSpecV2, id: string): boolean {
  const node = spec.elements[id];
  if (!node) return true;
  if (!IMPLEMENTED_RENDERERS[node.type]) return false;
  return node.children.every((childId) => canRenderBranch(spec, childId));
}

function localSpec(spec: DeckSpecV2, root: string): DeckSpecV2 {
  return { ...spec, root };
}

function renderNode(id: string, node: ElementNode, children: string): string {
  const renderer = IMPLEMENTED_RENDERERS[node.type];
  if (!renderer) return `<!-- fallback: ${id} -->`;
  return renderer(id, node.props, children);
}

function readDeck(path: string): DeckSpecV2 {
  const parsed = DeckSpecV2Schema.safeParse(readJson(path));
  if (!parsed.success) exitWith("write-final requires schemaVersion: 2 deck", 1);
  return parsed.data;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return !!entry && resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  runCli();
}
