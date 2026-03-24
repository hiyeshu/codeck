/**
 * [INPUT]: 依赖 Vitest、临时 JSON 文件与 DECK_DIR 环境变量，覆盖 intent 协议 CLI 辅助函数
 * [OUTPUT]: 保证 intent create/read/append-log 在文件输入模式下稳定运行
 * [POS]: skill/ 的 intent 协议测试层，保护 structured intent handoff
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { appendDecision, createIntent, readIntent } from "./intent-schema";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

function expectExit(fn: () => unknown): void {
  const exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`process.exit:${code ?? 0}`);
  }) as never);
  try {
    expect(fn).toThrow(/process\.exit/);
  } finally {
    exitSpy.mockRestore();
  }
}

describe("intent-schema", () => {
  let deckDir: string;

  beforeEach(() => {
    deckDir = makeTempDir("codeck-intent-");
    process.env.DECK_DIR = deckDir;
  });

  afterEach(() => {
    delete process.env.DECK_DIR;
  });

  it("createIntent creates intent.json from an input file", () => {
    const input = join(deckDir, "intent-input.json");
    writeJson(input, {
      created_by: "outline",
      goal: "Explain compiler-first deck rendering",
      audience: "engineers",
      tone: "clear",
      constraints: ["stay under 10 slides"],
      must_include: ["migration plan"],
      must_avoid: ["marketing fluff"],
      open_questions: ["timeline"],
      working_assumptions: ["review follows design"],
      narrative_arc: "teaching",
    });

    createIntent(input);

    const saved = JSON.parse(readFileSync(join(deckDir, "intent.json"), "utf8"));
    expect(saved.version).toBe(1);
    expect(saved.created_by).toBe("outline");
    expect(saved.last_modified_by).toBe("outline");
  });

  it("createIntent throws a zod error for invalid payloads", () => {
    const input = join(deckDir, "bad-intent.json");
    writeJson(input, { created_by: "outline" });
    expect(() => createIntent(input)).toThrow(ZodError);
  });

  it("createIntent exits when the input file is missing", () => {
    expectExit(() => createIntent(join(deckDir, "missing.json")));
  });

  it("appendDecision appends a decision log entry", () => {
    const input = join(deckDir, "intent-input.json");
    writeJson(input, {
      created_by: "outline",
      goal: "Explain compiler-first deck rendering",
      audience: "engineers",
      tone: "clear",
      constraints: [],
      must_include: [],
      must_avoid: [],
      open_questions: [],
      working_assumptions: [],
      narrative_arc: "teaching",
    });
    createIntent(input);

    appendDecision("design", "picked-preset", "Matches editorial tone", []);

    const saved = readIntent();
    expect(saved.decision_log).toHaveLength(1);
    expect(saved.decision_log[0].by).toBe("design");
  });

  it("appendDecision exits when intent.json does not exist", () => {
    expectExit(() => appendDecision("design", "picked-preset", "reason", []));
  });

  it("appendDecision preserves optional --value/--from/--to fields", () => {
    const input = join(deckDir, "intent-input.json");
    writeJson(input, {
      created_by: "outline",
      goal: "Explain compiler-first deck rendering",
      audience: "engineers",
      tone: "clear",
      constraints: [],
      must_include: [],
      must_avoid: [],
      open_questions: [],
      working_assumptions: [],
      narrative_arc: "teaching",
    });
    createIntent(input);

    appendDecision("review", "tone-shift", "Adjusted after review", [
      "--value",
      "calmer",
      "--from",
      "bold",
      "--to",
      "calm",
    ]);

    const saved = readIntent();
    expect(saved.decision_log[0]).toMatchObject({
      value: "calmer",
      from: "bold",
      to: "calm",
    });
  });

  it("readIntent throws when schema validation fails", () => {
    writeFileSync(join(deckDir, "intent.json"), JSON.stringify({ created_by: "outline" }));
    expect(() => readIntent()).toThrow(ZodError);
  });

  it("createIntent writes the target file to the deck directory", () => {
    const input = join(deckDir, "intent-input.json");
    writeJson(input, {
      created_by: "outline",
      goal: "Explain compiler-first deck rendering",
      audience: "engineers",
      tone: "clear",
      constraints: [],
      must_include: [],
      must_avoid: [],
      open_questions: [],
      working_assumptions: [],
      narrative_arc: "teaching",
    });
    createIntent(input);
    expect(existsSync(join(deckDir, "intent.json"))).toBe(true);
  });
});
