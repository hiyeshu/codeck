/**
 * [INPUT]: 依赖 Vitest 与临时目录，覆盖 compiler preflight 在缺文件、缺依赖与可执行场景下的返回值
 * [OUTPUT]: 保证首次 clone 后的初始化提示基于当前本地仓库的真实可执行状态
 * [POS]: skills/ 的预检测试层，保护 design 入口不会误报 compiler 状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { mkdtempSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { detectCompilerReadiness } from "./preflight.mjs";

function makeRepo(prefix: string): string {
  const repoRoot = mkdtempSync(join(tmpdir(), prefix));
  writeFileSync(join(repoRoot, "package.json"), "{}");
  writeFileSync(join(repoRoot, "setup"), "#!/bin/sh\n");
  mkdirSync(join(repoRoot, "skills"), { recursive: true });
  return repoRoot;
}

function addCompiler(repoRoot: string): void {
  mkdirSync(join(repoRoot, "skills", "codeck-design", "compiler"), { recursive: true });
  writeFileSync(join(repoRoot, "skills", "codeck-design", "compiler", "index.ts"), "export {};\n");
}

describe("preflight", () => {
  it("returns NOT_READY when compiler file is missing", () => {
    const repoRoot = makeRepo("codeck-preflight-missing-");

    const result = detectCompilerReadiness(repoRoot);

    expect(result.status).toBe("NOT_READY");
    expect(result.reason).toBe("compiler_missing");
    expect(result.recommendedCommand).toBe("./setup");
  });

  it("returns NOT_READY when dependencies are missing", () => {
    const repoRoot = makeRepo("codeck-preflight-deps-");
    addCompiler(repoRoot);

    const result = detectCompilerReadiness(repoRoot, {
      resolveModule: () => {
        throw new Error("missing");
      },
    });

    expect(result.status).toBe("NOT_READY");
    expect(result.reason).toBe("dependencies_missing");
    expect(result.details).toContain("missing dependency: tsx");
    expect(result.details).toContain("missing dependency: zod");
  });

  it("returns READY when compiler reaches schema validation", () => {
    const repoRoot = makeRepo("codeck-preflight-ready-");
    addCompiler(repoRoot);

    const result = detectCompilerReadiness(repoRoot, {
      resolveModule: () => true,
      runProbe: () => ({
        ok: true,
        output: "render-default requires schemaVersion: 2 deck",
        exitCode: 1,
      }),
    });

    expect(result.status).toBe("READY");
    expect(result.reason).toBe("compiler_ready");
    expect(result.details).toContain("render-default reached schema validation");
  });
});
