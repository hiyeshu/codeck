<div align="center">

# codeck

**对话式 AI 演示文稿技能 — Claude Code Skill**

[English](README.en.md) · 中文

</div>

把一个文件夹里的笔记、文档、数据、图片，通过和 Claude 对话变成一套完整的演示文稿。

codeck 是一组 Claude Code 技能（Skill），安装后在 Claude Code 中用 `/codeck` 命令启动。六个角色接力完成从素材到成品的全流程。

```
/codeck → /codeck-outline → /codeck-design → /codeck-review → /codeck-export → /codeck-speech
```

## 工作流程

| 命令 | 角色 | 做什么 | 产出 |
|------|------|--------|------|
| `/codeck` | 入口 | 扫描素材、恢复项目记忆、显示进度、推荐下一步 | pipeline 状态面板 |
| `/codeck-outline` | 编辑 | 素材诊断 → 叙事提问 → 大纲规划 → 标题锻造 | outline.json, intent.json |
| `/codeck-design` | 设计师 | 风格推荐 → 生成内容 spec + 设计参数 → 编译渲染 HTML | deck.json, design.json, HTML |
| `/codeck-review` | 审稿人 | 逐页截图审查 → 六维评分 → 溯源修复 | review.md |
| `/codeck-export` | 出版 | HTML → PDF / PPTX 多格式导出 | PDF, PPTX |
| `/codeck-speech` | 演讲教练 | 风格/时长对话 → 逐字演讲稿 + 舞台指示 + 时间预算 | speech.md |

## 架构

```
素材
  ↓
outline.json（叙事结构）+ intent.json（用户意图）
  ↓
deck.json（内容 spec）+ design.json（视觉参数）
  ↓
compiler → default.html（结构基底）→ Claude 直出最终 HTML
  ↓
PDF / PPTX
```

三层分离：
- **内容层** `deck.json` — 文字、结构、speakerNotes，不含视觉
- **设计层** `design.json` — 配色、字体、间距、情绪（design_system / design_style / visual_effects 三层）
- **交互层** `default.html` — compiler 生成的翻页、全屏、备注面板、无障碍

所有中间产物存在 `~/.codeck/projects/{slug}/`；最终 HTML 默认输出到当前仓库根目录，必要时可用 `FINAL_HTML_DIR` 覆盖。

## 安装

需要 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Node.js 18+。

```bash
npx skills add hiyeshu/codeck
```

在 Claude Code 中输入 `/codeck` 开始使用。

如果你是从本仓库本地 clone 后直接运行，请先在仓库根目录执行 `./setup`，确保依赖、软链和 compiler 入口都已就绪。

> 破坏性变更：仓库目录已从 `skill/` 迁移到 `skills/`。升级后请重新运行 `./setup`，旧的基于 `skill/` 的本地脚本和软链不再兼容。

## 更新

- git 仓库安装：在仓库根目录运行 `git pull --ff-only && ./setup`
- 非 git 的 repo-like 安装：在安装根目录运行 `node skills/update.mjs`

`node skills/update.mjs` 这条显式升级命令目前只支持 macOS/Linux，依赖系统自带 `tar` 和 `cp`。

## 目录

```
skills/
├── codeck/          入口 dashboard
├── codeck-outline/  编辑技能
├── codeck-design/   设计师技能 + 参考案例库
├── codeck-review/   审稿人技能
├── codeck-export/   导出技能
├── codeck-speech/   演讲稿技能
├── compiler/        spec 校验、迁移、渲染、HTML contract 检查
├── pipeline.ts      pipeline 状态追踪 + staleness 传播
├── intent-schema.ts 跨技能意图协议
├── home.ts          全局目录解析
└── cli-util.ts      共享 CLI 工具
```

## 开发

```bash
npm test
```

## License

Apache-2.0
