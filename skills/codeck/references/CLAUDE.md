# references/
> L2 | 父级: /Users/gaoding/Desktop/codeck/skills/codeck/CLAUDE.md

成员清单
workflow.md: room contract、Decision Ask、material scan、diagnosis、@outline。
design.md: @design、DESIGN.md schema、recipes、visual floor、build gates。
delivery.md: @review、@export、@speech，以及真实存在的 export/QA 命令。

架构决策
长规则按执行分支拆分；入口只保留何时读取哪个 reference，避免 `SKILL.md` 膨胀。

依赖边界
reference 只能描述流程和契约；可执行事实必须落到 `scripts/`，静态 UI 必须落到 `assets/`。

变更日志
2026-06-26: 从多 skill references 合并为三份分支文档。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
