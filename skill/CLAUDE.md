# skill/
> L2 | 父级: /CLAUDE.md

成员清单
deck-filename.ts: 文件名工具函数，从 meta.title + revision 生成安全文件名，并统一 final/candidate HTML 的命名。
home.ts: 全局目录管理器，管理 `~/.codeck/`（自动更新 + 项目快照备份）。
export/SKILL.md: 导出角色，HTML 为单一真相源，PDF（Playwright 打印）/ PPTX（LibreOffice 转换）多格式导出 + QA 验证。
export/pptx/: 官方 PPTX 工具库（PptxGenJS 教程、编辑工作流、thumbnail.py、soffice.py）。
export/pdf/: 官方 PDF 工具库（pypdf/reportlab/pdfplumber 参考、表单填写、OCR）。
pipeline.ts: Pipeline 状态追踪器，管理 outline → design → review → export → speech 的依赖关系和 staleness 检测。
tsconfig.json: skill 子树 TypeScript 编译配置，映射 core/ai 源码入口。
LICENSE: skill 发布许可证文本（Apache-2.0）。
CONVENTIONS.md: 技能编写规范（frontmatter / pushy description / 目录结构 / evals）。
evals/: 技能触发准确率测试，含 evals.json + trigger-test.ts（90% 准确率）。
codeck/SKILL.md: 入口 dashboard，自动更新 + 诊断式重构——扫描缓存 + 项目记忆恢复 + 时间戳偏差检测 + 智能 NEXT 推荐。
outline/SKILL.md: 编辑角色，素材诊断 + 叙事提问 + 大纲规划 + 标题锻造 + intent.md 生成。
design/SKILL.md: 设计师角色，三层架构（`$DECK_DIR/deck.json` 内容 + `$DECK_DIR/design.json` 三层设计层 + `$DECK_DIR/default.html` 结构基底），先 render-default，再由 Claude 基于 Lisp prompt 直出最终 HTML。
design/references/: 设计参考库，含 8 个完整 DeckSpec 案例 + block-types.md（所有 block 类型的 JSON schema 和 HTML 渲染示例）。
design/ui-ux-db/: UI/UX 设计智能数据库（styles/colors/typography/charts/ux-guidelines CSV + BM25 搜索引擎），design skill 生成 design.json 时查询风格、配色、字体数据。
review/SKILL.md: 审稿人角色，HTML 驱动逐页审查——六维评分（叙事/内容/AI废话/视觉层级/一致性/交互）+ 路径 A（改 `$DECK_DIR/design.json` 三层设计层重渲染）/ 路径 B（直接改 HTML）修复模型 + 渲染债务追踪。
speech/SKILL.md: 演讲稿撰写，观众/风格/时长提问 + 生成完整逐字稿 + 舞台指示 + 时间预算 + `$DECK_DIR/design.json` 的 design_style / design_system 情绪感知。

依赖关系
上游: zod、tsx/vitest、playwright、pptxgenjs
下游: Claude skill 运行时、本地 deck 预览流程

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
