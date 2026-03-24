# codeck — 对话式 AI 演示文稿技能
TypeScript + Vitest + Zod + Playwright + PptxGenJS

## 三层架构

| 层 | 文件 | 谁写 | 职责 |
|---|---|---|---|
| 内容层 | `$DECK_DIR/deck.json` | Claude | 页面结构、文本、数据、speakerNotes。纯内容，不含视觉。schemaVersion 2，flat element tree。 |
| 设计层 | `$DECK_DIR/design.json` | Claude | 三层视觉参数：design_system（可量化规则）/ design_style（主观方向）/ visual_effects（表现层）。每层带 description 字段。 |
| 交互层 | `$DECK_DIR/default.html` | compiler 生成 | render-default 产出的结构基底。翻页、全屏、全览、备注面板、触摸手势、进度条、无障碍。Claude 读取不改根 contract。 |

最终 HTML = compiler render-default 生成 default.html → Claude 读取 default.html + design.json → 直出最终自包含 HTML。

<config>
package.json - 项目依赖（zod, playwright, pptxgenjs, vitest）
vitest.config.ts - 测试配置，覆盖 skills/**/*.test.ts
setup - 安装脚本（npm install）
skills/CONVENTIONS.md - 技能编写规范（frontmatter / pushy description / evals）
</config>

## 目录结构

- `skills/` — 仓库内的技能源码与共享运行时代码；安装到客户端后的入口目录仍是 `~/.claude/skills/{name}/`
- `~/.codeck/projects/{slug}/` — 项目中间产物（deck.json、design.json、outline.json、intent.json、pipeline.json、intent.md 等）
- `~/.codeck/` — 用户全局状态（自动更新、项目历史快照）
- 最终产出（HTML/PDF/PPTX）输出到项目根目录

## 核心约束

1. deck.json 是内容的唯一真相源 — 文字、结构、speakerNotes
2. design.json 是视觉的唯一真相源 — 颜色、字体、间距、情绪
3. default.html 是交互层的结构 contract — Claude 生成最终 HTML 时不删除/重排 slide/block 根节点
4. intent.json + intent.md 是跨 skill 记忆载体 — outline 创建，design/review/speech 读取和追加 decision_log
5. design skill 内部用 deck.draft.json 工作，校验通过后原子替换为 deck.json

## 开发规范

1. 每文件不超过 800 行，超出则拆分
2. 单函数不超过 20 行，超出则提取
3. 注释：中文 + ASCII 分块 `/* ─── 标题 ─── */`
4. 所有业务文件必须有 L3 头部契约
5. 包边界：只通过 `exports` 字段声明的入口互引

## 渲染管线

```
deck.json（schemaVersion 2，flat element tree）
    ↓
compiler render-default → default.html（白底、系统字体、完整结构）
    ↓
compiler prompt-only → Lisp 约束 prompt（default.html + design.json）
    ↓
Claude 读取 prompt，直出最终 HTML（保持 default.html 的 slide/block/shell contract）
    ↓
compiler write-final → 校验 HTML contract → 命名为 {title}-r{revision}.html
```

CLI：`npx tsx skills/compiler/index.ts <validate|migrate|render-default|prompt-only|validate-html|write-final>`

迁移说明：仓库已从 `skill/` 硬切到 `skills/`。升级后必须重新运行 `./setup`，旧路径不再兼容。

## 2.x 远期目标

- HTML 双向编辑：用户在 HTML 上改文字 → 写回 deck.json → 重新渲染

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
