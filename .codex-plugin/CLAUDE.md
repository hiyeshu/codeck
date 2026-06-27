# .codex-plugin/
> L2 | 父级: /Users/gaoding/Desktop/codeck/CLAUDE.md

成员清单
plugin.json: Codex plugin manifest，声明 codeck 插件元数据、界面展示、能力列表和 `skills/` 入口。
assets/: 插件界面资源，只服务插件市场展示，不参与 deck runtime。

架构决策
codeck 采用 Cowart 式插件壳：仓库根是 Codex plugin，`skills/` 是实际能力入口。当前没有 MCP 或前端服务，因此不创建 `.mcp.json`、`mcp/`、`src/`、`vite.config.js`。

依赖边界
plugin manifest 只指向 `./skills/`。Deck runtime 资源仍在 `skills/codeck/assets/`，不要和插件市场图标混用。

变更日志
2026-06-26: 新增 Cowart-style Codex plugin manifest。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
