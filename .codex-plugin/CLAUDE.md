# .codex-plugin/
> L2 | 父级: /Users/yeshu/codeck/CLAUDE.md

成员清单
plugin.json: Codex plugin manifest，声明 codeck 插件元数据、界面展示、能力列表和 `skills/` 入口。
assets/: 插件界面资源，只服务插件市场展示，不参与 deck runtime。

架构决策
codeck 采用 Cowart 式插件壳：仓库根是 Codex plugin，`skills/` 是实际能力入口，`.mcp.json` 只暴露本地 deck editor room 工具。前端仍是 deck HTML 主画布，不引入独立 SPA；UI 感知状态保存在 room 的 `state/selection.json` 和 `events/*.jsonl`。

依赖边界
plugin manifest 指向 `./skills/` 与 `./.mcp.json`。Deck runtime 资源仍在 `skills/codeck/assets/`，不要和插件市场图标混用。

变更日志
2026-06-27: plugin manifest 增加 deck editor MCP 声明，并通过 MCP pending 暴露最新 UI selection。
2026-06-26: 新增 Cowart-style Codex plugin manifest。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
