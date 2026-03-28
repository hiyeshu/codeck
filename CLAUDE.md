# codeck — 对话式 AI 演示文稿技能

## 架构

codeck 产出一个**单 HTML 文件**，由 `assemble.sh` 拼装：

| 谁写 | 文件 | 职责 |
|---|---|---|
| 人（固定） | `engine.js` + `engine.css` | 翻页导航、fragment 步进、overview、演讲者模式、进度条 |
| AI（每次） | `custom.css` | `:root` 变量 + 布局原语 + 每页特定样式 + 移动适配 |
| AI（每次） | `slides.html` | `<section class="slide" data-notes="...">` 自由 HTML |

引擎代码写好后不变，每个 deck 行为一致。AI 只管内容和视觉，不写 JS。

## 流程

```
素材 → 内容诊断（三信号）→ 动态角色选择
  ↓
outline.md（叙事结构 + 用户意图）
  ↓
custom.css + slides.html → assemble.sh → 单 HTML 文件
  ↓
review → export（PDF/PPTX）→ speech
```

核心理念：skill 只管流程和格式，知识来自动态请来的"人"。每个阶段根据内容诊断选择角色——角色名激活 AI 参数里的知识网络。

## 内容诊断三信号

1. **领域属性** — 决定大纲阶段请谁
2. **表达挑战** — 决定设计阶段请谁
3. **听众认知起点** — 决定审稿阶段请谁（反向选择：最可能翻车的听众）

## 目录结构

skill 文件安装在 `~/.claude/skills/codeck*/`，项目产物在 `~/.codeck/projects/{slug}/`。

关键产物：
- `diagnosis.md` — 内容诊断 + 角色推荐
- `outline.md` — 大纲 + 用户意图
- `{title}-r{n}.html` — 设计产出（修订版本号递增）
- `design-notes.md` — 设计过程 + design-dna 同构映射
- `review.md` — 审稿记录
- `speech.md` — 演讲稿

## design-dna

设计阶段的核心工具。从大纲提取形式结构（张力曲线、信息密度、论证拓扑、情绪色谱），在其他领域找同构映射，翻译成视觉策略。

## 仓库结构

```
codeck/
├── setup              # 安装脚本（符号链接 skills → ~/.claude/skills/）
├── CLAUDE.md          # 项目说明
├── skills/            # 全部 skill 源码
│   ├── CLAUDE.md      # 成员清单 + 变更日志
│   ├── CONVENTIONS.md # 技能编写规范
│   ├── codeck/        # 入口 dashboard
│   ├── codeck-outline/
│   ├── codeck-design/
│   ├── codeck-review/
│   ├── codeck-export/
│   └── codeck-speech/
└── README.md
```
