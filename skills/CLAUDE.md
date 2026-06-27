# skills/
> L2 | 父级: /Users/gaoding/Desktop/codeck/CLAUDE.md

成员清单
codeck/: 单一可安装 presentation skill，承载入口、参考文档、固定脚本和 build-time assets。

架构决策
多 skill 已折叠为一个 `codeck` 叶子 skill；内部角色通过 room lane 表达，不再靠多个 installable skill 暴露给用户。

依赖边界
`skills/` 只放可安装 skill。外部参考仓、测试输出、个人 `.agents/` 不进入此层。

变更日志
2026-06-26: 收束为单 skill 容器，恢复 L2 地图。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
