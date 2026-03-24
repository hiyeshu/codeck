/**
 * [INPUT]: 接收 deck.json 路径和可选 design.json 路径
 * [OUTPUT]: 提供 validateDeckAndDesign 与 writeValidationReport，分别负责纯校验与报告落盘
 * [POS]: skill/compiler 的校验层，负责 schemaVersion 检测、catalog 校验、遍历合同和 design.json schema 校验
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { dirname, join, resolve } from "path";
import { writeFileSync } from "fs";
import {
  DeckSpecV2Schema,
  LegacyDeckSchema,
  validateElementProps,
  type CatalogIssue,
} from "./catalog";
import { analyzeTraversal } from "./traverse";
import { validateDesignJson } from "../design/design-schema";
import { readJson } from "../cli-util";

export interface ValidationMessage {
  path: string;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
}

export function validateDeckAndDesign(
  deckPath: string,
  designPath?: string,
): ValidationReport {
  const warnings: ValidationMessage[] = [];
  const errors: ValidationMessage[] = [];
  const rawDeck = readJson(deckPath);

  if (rawDeck.schemaVersion !== 2) {
    const legacy = LegacyDeckSchema.safeParse(rawDeck);
    if (legacy.success) {
      warnings.push({
        path: "schemaVersion",
        message: "Legacy deck detected (schemaVersion 1 or missing). Run compiler migrate first.",
      });
      return { valid: true, errors, warnings };
    }
  }

  const parsedDeck = DeckSpecV2Schema.safeParse(rawDeck);
  if (!parsedDeck.success) {
    for (const issue of parsedDeck.error.issues) {
      errors.push({
        path: issue.path.join(".") || "deck",
        message: issue.message,
      });
    }
    return { valid: false, errors, warnings };
  }

  for (const [id, element] of Object.entries(parsedDeck.data.elements)) {
    pushCatalogIssues(errors, warnings, validateElementProps(id, element));
  }

  const traversal = analyzeTraversal(parsedDeck.data);
  for (const issue of traversal.issues) {
    const target = issue.kind === "orphan" ? warnings : errorsOrWarnings(issue.level, errors, warnings);
    target.push({ path: issue.id, message: issue.message });
  }

  if (designPath) {
    const design = readJson(designPath);
    const parsedDesign = validateDesignJson(design);
    if (!parsedDesign.success) {
      errors.push({ path: "design", message: parsedDesign.error || "design.json is invalid" });
    }
    for (const warning of parsedDesign.warnings) {
      warnings.push({ path: "design", message: warning });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function pushCatalogIssues(
  errors: ValidationMessage[],
  warnings: ValidationMessage[],
  issues: CatalogIssue[],
): void {
  for (const issue of issues) {
    errorsOrWarnings(issue.level, errors, warnings).push({
      path: issue.path,
      message: issue.message,
    });
  }
}

function errorsOrWarnings(
  level: "error" | "warning",
  errors: ValidationMessage[],
  warnings: ValidationMessage[],
): ValidationMessage[] {
  return level === "error" ? errors : warnings;
}

export function writeValidationReport(deckPath: string, report: ValidationReport): void {
  const reportPath = join(dirname(resolve(deckPath)), "validate-report.json");
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
}
