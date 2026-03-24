/**
 * [INPUT]: 依赖 Vitest 运行时读取默认导出配置
 * [OUTPUT]: 对外提供 workspace 级 Vitest 配置
 * [POS]: 项目根测试配置层，为 packages 下的单元测试提供统一入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "skills/**/*.test.ts"],
  },
});
