/**
 * [INPUT]: 依赖 Node.js fs/path 与 zod，读写 $DECK_DIR/intent.json 的结构化意图数据
 * [OUTPUT]: 对外提供 IntentSchema、IntentDecisionSchema、IntentDocument 类型与 create/read/append-log CLI
 * [POS]: skills/ 的意图协议层，负责在 outline 创建 intent，并供下游 skill 追加 decision_log
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { resolveDeckDir } from "./home";
import { exitWith, readJson } from "./cli-util";

export const IntentDecisionSchema = z.object({
  at: z.string().datetime(),
  by: z.string().min(1),
  action: z.string().min(1),
  value: z.string().min(1).optional(),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
  reason: z.string().min(1),
});

export const IntentSchema = z.object({
  version: z.literal(1),
  created_by: z.string().min(1),
  goal: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  constraints: z.array(z.string()),
  must_include: z.array(z.string()),
  must_avoid: z.array(z.string()),
  open_questions: z.array(z.string()),
  working_assumptions: z.array(z.string()),
  narrative_arc: z.enum([
    "problem-driven",
    "demo-driven",
    "data-report",
    "teaching",
  ]),
  decision_log: z.array(IntentDecisionSchema),
  last_modified_by: z.string().min(1),
  last_modified_at: z.string().datetime(),
});

const IntentCreateInputSchema = IntentSchema.omit({
  version: true,
  decision_log: true,
  last_modified_by: true,
  last_modified_at: true,
}).extend({
  decision_log: z.array(IntentDecisionSchema).optional(),
});

export type IntentDecision = z.infer<typeof IntentDecisionSchema>;
export type IntentDocument = z.infer<typeof IntentSchema>;

function intentDeckDir(): string {
  return resolve(resolveDeckDir());
}

function intentPath(): string {
  return `${intentDeckDir()}/intent.json`;
}

function ensureDeckDir(): void {
  mkdirSync(dirname(intentPath()), { recursive: true });
}

function parseInputFromFile(filePath: string): z.infer<typeof IntentCreateInputSchema> {
  if (!filePath || !existsSync(filePath)) {
    exitWith("Usage: intent-schema.ts create <input.json>");
  }
  try {
    return IntentCreateInputSchema.parse(readJson(filePath));
  } catch (error) {
    console.error("Invalid intent create payload");
    throw error;
  }
}

export function readIntent(): IntentDocument {
  if (!existsSync(intentPath())) {
    exitWith(`Intent file not found: ${intentPath()}`);
  }
  return IntentSchema.parse(readJson(intentPath()));
}

function writeIntent(intent: IntentDocument): void {
  ensureDeckDir();
  writeFileSync(intentPath(), JSON.stringify(intent, null, 2) + "\n");
}

export function createIntent(filePath: string): void {
  const input = parseInputFromFile(filePath);
  const now = new Date().toISOString();
  const intent = IntentSchema.parse({
    ...input,
    version: 1,
    decision_log: input.decision_log || [],
    last_modified_by: input.created_by,
    last_modified_at: now,
  });
  writeIntent(intent);
  console.log(intentPath());
}

function parseOptionalFields(args: string[]): Pick<IntentDecision, "value" | "from" | "to"> {
  const options: Pick<IntentDecision, "value" | "from" | "to"> = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key || !value) continue;
    if (key === "--value") options.value = value;
    if (key === "--from") options.from = value;
    if (key === "--to") options.to = value;
  }
  return options;
}

export function appendDecision(skill: string, action: string, reason: string, extra: string[]): void {
  const intent = readIntent();
  const entry = IntentDecisionSchema.parse({
    at: new Date().toISOString(),
    by: skill,
    action,
    reason,
    ...parseOptionalFields(extra),
  });
  intent.decision_log.push(entry);
  intent.last_modified_by = skill;
  intent.last_modified_at = entry.at;
  writeIntent(IntentSchema.parse(intent));
  console.log(intentPath());
}

export function printIntent(): void {
  console.log(JSON.stringify(readIntent(), null, 2));
}

export function runCli(): void {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "create") {
    createIntent(rest[0]);
    return;
  }
  if (cmd === "read") {
    printIntent();
    return;
  }
  if (cmd === "append-log") {
    const [skill, action, reason, ...extra] = rest;
    if (!skill || !action || !reason) {
      exitWith(
        "Usage: intent-schema.ts append-log <skill> <action> <reason> [--value x] [--from x] [--to x]",
      );
    }
    appendDecision(skill, action, reason, extra);
    return;
  }
  exitWith("Usage: intent-schema.ts <create|read|append-log>");
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return !!entry && resolve(entry) === fileURLToPath(import.meta.url);
}

if (isMainModule()) {
  runCli();
}
