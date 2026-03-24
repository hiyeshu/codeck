/**
 * [INPUT]: 依赖 Vitest 运行 deck 文件名工具函数
 * [OUTPUT]: 覆盖最终 HTML 与 candidate HTML 的命名约定
 * [POS]: skill/ 的文件名测试层，保证 design 最终渲染链路的文件命名稳定
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import {
  deckCandidateHtmlFileName,
  deckFileName,
  deckFinalHtmlFileName,
} from "./deck-filename";

describe("deck filename helpers", () => {
  it("builds a stable revisioned deck stem", () => {
    expect(deckFileName("重新定义可能", 3)).toBe("重新定义可能-r3");
  });

  it("builds the final html file name", () => {
    expect(deckFinalHtmlFileName("Mify", 2)).toBe("Mify-r2.html");
  });

  it("builds the candidate html file name", () => {
    expect(deckCandidateHtmlFileName("codeck 组件展示", 1)).toBe("codeck 组件展示-r1.candidate.html");
  });
});
