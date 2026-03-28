# skills/

成员清单
codeck/SKILL.md: 入口 dashboard，素材扫描 + 内容诊断（三信号：领域属性、表达挑战、听众认知起点）+ 动态角色推荐 + pipeline 状态面板。
codeck-outline/SKILL.md: 大纲角色，角色激活 → 叙事提问 → 大纲规划 → 标题锻造。产出 outline.md + intent.md。
codeck-outline/checklist.md: 大纲自审清单。
codeck-design/SKILL.md: 设计角色，角色激活 → design-dna 同构映射 → 结构化设计档案 → AI 写 custom.css + slides.html → assemble.sh 拼装单 HTML。
codeck-design/design-dna/: 三维设计档案规格（schema.md 字段定义 + generation-guide.md 从 design-dna.json → custom.css 的映射规则）。
codeck-design/checklist.md: 设计自审清单（CSS 审查 + slides 审查 + 拼装后审查）。
codeck-design/engine/: 固定翻页引擎（engine.js + engine.css + assemble.sh）。导航、fragment、overview、演讲者模式、进度条，每个 deck 行为一致。
codeck-design/ui-ux-db/: UI/UX 设计数据库（styles/colors/typography CSV + BM25 搜索），设计时可查询风格参考。
codeck-review/SKILL.md: 审稿角色（反向选择：最可能翻车的听众），六维审查 + 直接改 HTML。
codeck-export/SKILL.md: 导出角色，HTML 为单一真相源，PDF（Playwright）/ PPTX 导出 + QA。
codeck-export/pptx/: PPTX 工具库（PptxGenJS、thumbnail.py、soffice.py）。
codeck-export/pdf/: PDF 工具库（pypdf/reportlab 参考、表单填写）。
codeck-speech/SKILL.md: 演讲稿角色，角色激活 → 逐字稿 + 舞台指示 + 时间预算 + 回写 HTML data-notes。
CONVENTIONS.md: 技能编写规范（frontmatter / pushy description / 目录结构 / evals）。
LICENSE: Apache-2.0。

依赖关系
上游: playwright, pptxgenjs
下游: Claude skill 运行时

变更日志
- 2026-03-28: v2.1 引擎分离。固定 engine.js/engine.css（导航、fragment、overview、演讲者模式），AI 只写 custom.css + slides.html，assemble.sh 拼装。加演讲者模式（BroadcastChannel 同步）、data-notes speaker notes、speech 回写。
- 2026-03-28: v2.0 架构重写。去掉 deck.json/design.json/compiler 三层架构，改为 AI 直出单 HTML。引入内容诊断三信号、动态角色选择、design-dna 同构映射、反向审稿角色。
- 2026-03-24: 仓库目录从 `skill/` 硬切到 `skills/`
