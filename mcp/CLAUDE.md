# mcp/
> L2 | 父级: /Users/yeshu/codeck/CLAUDE.md

成员清单
server.mjs: Codex MCP stdio server，暴露 deck editor room 的 latest UI selection、pending changes、revision、checkout 和 asset 工具。

架构决策
MCP 是 agent 的手，不是脑；它只读写 deck room 的协作状态，不生成叙事、不决定设计、不修改 skill runtime。`state/selection.json` 是当前指向，`events/*.jsonl` 是操作日志，`inbox/*.md` 才是明确请求。

依赖边界
只依赖 `skills/codeck/scripts/deck-editor-core.mjs` 的文件系统原语。不得直接读写插件安装目录之外的未知路径。

变更日志
2026-06-27: get pending 返回最新 UI selection，使 Codex 能看到用户当前选中的 deck 节点。
2026-06-27: 新增 deck editor MCP 边界，连接 Codex 与本地协作 room。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
