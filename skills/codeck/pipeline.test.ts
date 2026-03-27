/**
 * [INPUT]: 依赖 Vitest 与临时目录，覆盖 pipeline 状态迁移、脏写保护与 CLI 分发
 * [OUTPUT]: 保证 pipeline.ts 在无副作用导入后仍能正确读写、迁移和标记 stale
 * [POS]: skills/ 的 pipeline 测试层，保护 compiler-first 流水线状态机
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { existsSync, mkdtempSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as pipeline from "./pipeline";

function makeTempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

describe("pipeline", () => {
  let deckDir: string;
  let cwd: string;
  let originalCwd: string;
  let originalArgv: string[];
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalCwd = process.cwd();
    deckDir = makeTempDir("codeck-pipeline-");
    cwd = makeTempDir("codeck-project-");
    process.env.DECK_DIR = deckDir;
    process.chdir(cwd);
    pipeline.resetPipelineCaches();
    originalArgv = [...process.argv];
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.chdir(originalCwd);
    logSpy.mockRestore();
    delete process.env.DECK_DIR;
    pipeline.resetPipelineCaches();
  });

  it("readPipeline returns an empty pipeline when the file is missing", () => {
    expect(pipeline.readPipeline()).toEqual({ version: 1, revision: 0, stages: {} });
  });

  it("readPipeline returns an empty pipeline when JSON is corrupted", () => {
    writeFileSync(join(deckDir, "pipeline.json"), "{broken");
    expect(pipeline.readPipeline()).toEqual({ version: 1, revision: 0, stages: {} });
  });

  it("readPipeline reads a valid pipeline file", () => {
    const value = {
      version: 1,
      revision: 2,
      stages: {
        outline: { status: "done", revision: 2 },
      },
    };
    writeJson(join(deckDir, "pipeline.json"), value);
    expect(pipeline.readPipeline()).toEqual(value);
  });

  it("migratePipeline returns new-format data unchanged", () => {
    const raw = {
      revision: 3,
      currentStage: "review",
      stages: {
        design: { status: "done", revision: 3 },
      },
    };
    expect(pipeline.migratePipeline(raw)).toEqual({
      version: 1,
      revision: 3,
      currentStage: "review",
      stages: {
        design: { status: "done", revision: 3 },
      },
    });
  });

  it("migratePipeline converts legacy skills and maps none to missing", () => {
    const migrated = pipeline.migratePipeline({
      skills: {
        outline: { status: "none", at: "2025-01-01T00:00:00.000Z", output: ["outline.md"] },
        design: { status: "done", hash: "abcd1234" },
      },
    });

    expect(migrated.stages.outline.status).toBe("missing");
    expect(migrated.stages.design.status).toBe("done");
  });

  it("markDone writes default inputs and outputs", () => {
    pipeline.markDone("design", []);
    const saved = pipeline.readPipeline();
    expect(saved.stages.design.inputs).toEqual([
      join(deckDir, "outline.md"),
      join(deckDir, "outline.json"),
      join(deckDir, "intent.md"),
      join(deckDir, "intent.json"),
    ]);
    expect(saved.stages.design.outputs).toEqual([
      join(deckDir, "deck.json"),
      join(deckDir, "design.json"),
    ]);
  });

  it("markDone accepts custom --inputs and --outputs", () => {
    pipeline.markDone("review", [
      "--inputs",
      `${cwd}/custom-input.md,${cwd}/custom-input-2.md`,
      "--outputs",
      `${cwd}/review-a.md,${cwd}/review-b.md`,
    ]);
    const saved = pipeline.readPipeline();
    expect(saved.stages.review.inputs).toEqual([
      join(cwd, "custom-input.md"),
      join(cwd, "custom-input-2.md"),
    ]);
    expect(saved.stages.review.outputs).toEqual([
      join(cwd, "review-a.md"),
      join(cwd, "review-b.md"),
    ]);
  });

  it("markDone increments revision", () => {
    pipeline.markDone("outline", []);
    pipeline.markDone("design", []);
    expect(pipeline.readPipeline().revision).toBe(2);
  });

  it("markDownstream marks a finished downstream stage as stale", () => {
    const value: pipeline.Pipeline = {
      version: 1,
      revision: 4,
      stages: {
        design: {
          status: "done",
          revision: 1,
          inputs: [join(deckDir, "outline.json")],
          outputs: [join(deckDir, "deck.json")],
        },
      },
    };
    pipeline.markDownstream(value, "outline", [join(deckDir, "outline.json")]);
    expect(value.stages.design.status).toBe("stale");
    expect(value.stages.design.staleBy).toBe("outline");
  });

  it("markDownstream skips missing downstream stages without crashing", () => {
    const value: pipeline.Pipeline = { version: 1, revision: 2, stages: {} };
    expect(() => pipeline.markDownstream(value, "design", [join(deckDir, "deck.json")])).not.toThrow();
  });

  it("markDownstream skips stages that do not consume the updated outputs", () => {
    const value: pipeline.Pipeline = {
      version: 1,
      revision: 2,
      stages: {
        review: {
          status: "done",
          revision: 1,
          inputs: [join(deckDir, "other.json")],
          outputs: [join(deckDir, "review.md")],
        },
      },
    };
    pipeline.markDownstream(value, "design", [join(deckDir, "deck.json")]);
    expect(value.stages.review.status).toBe("done");
  });

  it("checkStale prints an empty array and does not write when nothing changed", () => {
    pipeline.checkStale();
    expect(logSpy).toHaveBeenCalledWith("[]");
    expect(existsSync(join(deckDir, "pipeline.json"))).toBe(false);
  });

  it("checkStale marks changed stages as stale", () => {
    const outlineJson = join(deckDir, "outline.json");
    writeFileSync(outlineJson, "{}");
    const now = new Date();
    const past = new Date(now.getTime() - 10_000).toISOString();
    writeJson(join(deckDir, "pipeline.json"), {
      version: 1,
      revision: 2,
      stages: {
        outline: {
          status: "done",
          revision: 1,
          at: past,
          outputs: [outlineJson],
        },
        design: {
          status: "done",
          revision: 2,
          at: past,
          inputs: [outlineJson],
          outputs: [join(deckDir, "deck.json")],
        },
      },
    });

    pipeline.checkStale();

    const saved = pipeline.readPipeline();
    expect(saved.stages.design.status).toBe("stale");
    expect(saved.stages.design.staleBy).toBe("outline");
  });

  it("runCli dispatches all supported command paths", () => {
    writeFileSync(join(deckDir, "outline.md"), "# outline");

    process.argv = ["node", "pipeline.ts", "read"];
    pipeline.runCli();

    process.argv = ["node", "pipeline.ts", "rebuild"];
    pipeline.runCli();

    process.argv = ["node", "pipeline.ts", "done", "outline"];
    pipeline.runCli();

    process.argv = ["node", "pipeline.ts", "status", "outline"];
    pipeline.runCli();

    process.argv = ["node", "pipeline.ts", "check-stale"];
    pipeline.runCli();

    expect(logSpy).toHaveBeenCalled();
  });
});
