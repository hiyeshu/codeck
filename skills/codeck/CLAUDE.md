# codeck/
> L2 | 父级: /Users/yeshu/codeck/skills/CLAUDE.md

成员清单
SKILL.md: 用户可触发入口，保留 routing、setup、runtime 指针，不承载长参考。
references/: 分支参考层，按 workflow/design/delivery 拆分长规则。
scripts/: 确定性工具层，负责 assemble、build、validate、deck editor service、UI selection/event 感知、export、thumbnail 与浏览器 runtime。
assets/: 固定运行时资源层，负责 base/editor CSS、toolbar/presenter/editor HTML 片段和 icon sprite。

架构决策
`SKILL.md` 是门面；`references/` 是渐进披露；`scripts/` 消除重复生成代码并承载本地 deck editor 服务；`assets/` 保存官方规范允许的静态资源，并在构建时内联进单 HTML。

依赖边界
AI 每 deck 只写 room 内 `DESIGN.md`、`custom.css`、`slides.html`。固定 runtime 文件不在普通 deck 生成中修改。

变更日志
2026-06-27: 新增 HTML deck 可观察界面；元素选择写入 `state/selection.json`，操作写入 `events/*.jsonl`。
2026-06-27: 新增本地 deck editor 服务；HTML deck 仍是主画布，右侧 agent marker dialog 写入 room。
2026-06-27: 拆分 editor runtime/style，保持单 skill 输出不变但消除单文件肥大。
2026-06-26: 合并 codeck-outline/design/review/export/speech 为单一 skill 内部 lanes。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
