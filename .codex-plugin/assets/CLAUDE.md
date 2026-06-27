# assets/
> L2 | 父级: /Users/gaoding/Desktop/codeck/.codex-plugin/CLAUDE.md

成员清单
app-icon.svg: 插件市场和 composer 展示图标，供 `.codex-plugin/plugin.json` 引用。

架构决策
插件图标放在 `.codex-plugin/assets/`，避免与 `skills/codeck/assets/` 的 deck runtime 资源混淆。

依赖边界
这里只放插件界面资源，不放 deck toolbar、presenter、editor 或 slide runtime 资源。

变更日志
2026-06-26: 新增插件图标资源层。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
