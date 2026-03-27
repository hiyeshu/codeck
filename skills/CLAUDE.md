# skills/
> L2 | 父级: /CLAUDE.md

成员清单
codeck/: 入口 skill + 共享工具层。SKILL.md 是 dashboard（扫描缓存 + 偏差检测 + 智能 NEXT），同目录放所有 skill 共享的 CLI 工具。
codeck/home.ts: 全局目录管理器，管理 `~/.codeck/`（自动更新 + 项目快照备份）。
codeck/cli-util.ts: 共享 CLI 工具（readJson / exitWith）。
codeck/pipeline.ts: Pipeline 状态追踪器，管理 outline → design → review → export → speech 的依赖与 staleness。
codeck/intent-schema.ts: 意图协议层，zod schema + create/read/append-log CLI。
codeck/deck-filename.ts: 文件名工具，从 meta.title + revision 生成安全文件名。
codeck/preflight.mjs: 仓库初始化预检，检测 compiler 可执行状态。
codeck/update.mjs: 显式升级入口，repo 走 git pull，非 git 走 tarball 覆盖。
codeck-outline/: 编辑角色，素材诊断 + 叙事提问 + 大纲规划 + 标题锻造 + intent.md 生成。
codeck-outline/outline-spec.ts: 大纲 JSON schema（zod）。
codeck-design/: 设计师角色，三层架构（deck.json 内容 + design.json 设计层 + default.html 结构基底）。
codeck-design/design-schema.ts: design.json 三层 schema + 校验 + legacy 升级。
codeck-design/final-html-prompt.ts: Lisp prompt builder，组装 default.html + design.json 约束。
codeck-design/compiler/: DeckSpec v2 compiler，render-default + validate + write-final + design-compile。
codeck-design/references/: 设计参考库，8 个 DeckSpec 案例 + block-types.md。
codeck-design/ui-ux-db/: UI/UX 设计数据库（CSV + BM25 搜索引擎）。
codeck-review/: 审稿人角色，六维评分 + 路径 A/B 修复 + 渲染债务追踪。
codeck-export/: 导出角色，PDF（Playwright 打印）/ PPTX（LibreOffice 转换）+ QA 验证。
codeck-export/pptx/: PPTX 工具库（PptxGenJS、thumbnail.py、soffice.py）。
codeck-export/pdf/: PDF 工具库（pypdf/reportlab/pdfplumber、表单填写、OCR）。
codeck-speech/: 演讲稿撰写，逐字稿 + 舞台指示 + 时间预算。
tsconfig.json: skills 子树 TypeScript 编译配置。
LICENSE: Apache-2.0。
CONVENTIONS.md: 技能编写规范（frontmatter / pushy description / 目录结构 / evals）。
evals/: 技能触发准确率测试，含 evals.json + trigger-test.ts + alignment.test.ts。

依赖关系
上游: zod、tsx/vitest、playwright、pptxgenjs
下游: Claude skill 运行时、本地 deck 预览流程
共享代码归属: 所有 skill 共享的 CLI 工具（home/pipeline/intent-schema/cli-util/deck-filename/preflight/update）统一放在 codeck/ 目录，随 `npx skills add` 一起安装；compiler 放在 codeck-design/ 目录

变更日志
- 2026-03-27: 共享工具从 skills/ 根迁入 codeck/，compiler 从 skills/compiler/ 迁入 codeck-design/compiler/，解决 `npx skills add` 安装时散落文件丢失问题
- 2026-03-24: 仓库目录从 `skill/` 硬切到 `skills/`

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
