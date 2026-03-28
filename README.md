<div align="center">

# codeck

**对话式 AI 演示文稿技能 — Claude Code Skill**

[English](README.en.md) · 中文

</div>

把一个文件夹里的笔记、文档、数据、图片，通过和 Claude 对话变成一套完整的演示文稿。

codeck 是一组 Claude Code 技能（Skill），安装后在 Claude Code 中用 `/codeck` 命令启动。

```
/codeck → /codeck-outline → /codeck-design → /codeck-review → /codeck-export → /codeck-speech
```

## 工作流程

| 命令 | 做什么 | 产出 |
|------|--------|------|
| `/codeck` | 扫描素材、内容诊断（三信号）、动态角色推荐、显示进度 | diagnosis.md |
| `/codeck-outline` | 角色激活 → 叙事提问 → 大纲规划 → 标题锻造 | outline.md |
| `/codeck-design` | 角色激活 → design-dna 同构映射 → 直出单 HTML 文件 | {title}-r{n}.html |
| `/codeck-review` | 反向角色（最可能翻车的听众）→ 六维审查 → 直接改 HTML | review.md |
| `/codeck-export` | HTML → PDF / PPTX | PDF, PPTX |
| `/codeck-speech` | 角色激活 → 逐字演讲稿 + 舞台指示 + 时间预算 | speech.md |

## 架构

```
素材
  ↓
内容诊断（领域属性 · 表达挑战 · 听众认知起点）→ 动态角色选择
  ↓
outline.md（叙事结构 + 用户意图）
  ↓
单 HTML 文件（CSS 设计系统 + JS 翻页引擎 + 每页自由 HTML）
  ↓
PDF / PPTX / 演讲稿
```

核心理念：
- **skill 只管流程和格式，知识来自动态请来的"人"** — 角色名激活 AI 参数里的知识网络
- **没有 schema 天花板** — 不用 block type 词汇表，每页自由 HTML，AI 可以发明任何视觉表达
- **design-dna** — 从内容形式结构找同构映射（受侯世达《集异壁》启发），让视觉和内容在结构层面共振

## 安装

需要 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Node.js 18+。

```bash
npx skills add hiyeshu/codeck
```

在 Claude Code 中输入 `/codeck` 开始使用。

## 目录

```
~/.claude/skills/
├── codeck/          入口 dashboard + 内容诊断
├── codeck-outline/  大纲技能 + 自审清单
├── codeck-design/   设计技能 + ui-ux-db 风格数据库
├── codeck-review/   审稿技能
├── codeck-export/   导出技能 + PDF/PPTX 工具链
└── codeck-speech/   演讲稿技能
```

项目产物存在 `~/.codeck/projects/{slug}/`。

## License

Apache-2.0
