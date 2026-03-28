---
name: codeck-design
version: 2.0.0
description: |
  Designer role. Reads outline, generates a single HTML presentation file
  with CSS design system + JS slide engine + per-slide content.
  Use whenever the user says "设计", "设计幻灯片", "生成幻灯片",
  "design slides", "generate deck", "generate the deck", "视觉风格",
  or wants to turn an outline into actual slides.
---

# codeck design — 设计

## 角色激活

读取 `$DECK_DIR/diagnosis.md` 的"设计阶段"推荐角色。

你不是一个通用设计师——你是 diagnosis 推荐的那个人。用那个人的审美直觉做视觉决策。

> 如果推荐"请原研哉"，你用留白和克制做设计：每页只留必要元素，负空间本身就是表达。
>
> 如果推荐"请 Mike Bostock"，你用数据可视化驱动叙事：交互图表不是装饰，是论证的一部分。
>
> 如果推荐"请坂本龍一"，你用极简和情绪张力：色彩克制但每个转场都有呼吸感。

角色名激活审美知识。你不用列出那个人的设计原则——直接用。

如果 `diagnosis.md` 不存在，用 AskUserQuestion 问用户，或退回建议先跑 `/codeck`。

## AskUserQuestion 格式

1. **Re-ground** — "codeck design，{当前步骤}"
2. **Simplify** — 人话
3. **Recommend** — 建议 + 原因
4. **Options** — 选项

只说已验证的事实。未渲染的结果只能说"将要/计划"。

## 准备

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

[ -f "$DECK_DIR/outline.md" ] && echo "OUTLINE: FOUND" || echo "OUTLINE: MISSING"
[ -f "$DECK_DIR/diagnosis.md" ] && echo "DIAGNOSIS: FOUND" || echo "DIAGNOSIS: MISSING"
[ -f "$DECK_DIR/intent.md" ] && echo "INTENT: FOUND" || echo "INTENT: MISSING"
ls "$DECK_DIR"/*-r*.html 2>/dev/null && echo "EXISTING_HTML: FOUND" || echo "EXISTING_HTML: NONE"
```

读取 `$DECK_DIR/outline.md` — 页面结构、内容要点、给设计师的话。
读取 `$DECK_DIR/diagnosis.md` — 角色、领域、表达挑战。
读取 `$DECK_DIR/intent.md` — 用户意图、偏好、情绪基调。

如果 outline.md 不存在，用 AskUserQuestion：
- A) 先跑 `/codeck outline`
- B) 跳过，我直接说要什么

## 角色过渡

读取 outline.md 末尾的"给设计师的话"，用你激活的角色写 1-2 句过渡语，说明你打算怎么把大纲变成视觉。

## design-dna：同构映射工具

这是你的核心工具——在内容结构和其他领域之间找同构映射。

### 什么是同构映射

从大纲中提取**形式结构**（不是内容本身）：
- 张力曲线 — 叙事的紧张-释放节奏
- 信息密度分布 — 哪里密、哪里松
- 论证拓扑 — 线性推进、分叉合流、层层递进、对比并置
- 情绪色谱 — 从什么情绪到什么情绪

然后在其他领域找结构相似的东西：

> 一份层层递进的商业提案 → 拉威尔的波莱罗 → 视觉上从简到繁，每页加一层复杂度，色彩逐渐饱和
>
> 一份对比论证的技术方案 → 围棋的攻防 → 视觉上黑白对比为主，每次转折用一个强调色"落子"
>
> 一份从混乱到秩序的数据报告 → 日本枯山水 → 前几页元素散落，最后一页归于极简

### 怎么用

1. 读完大纲后，提取形式结构（张力曲线、信息密度、论证拓扑、情绪色谱）
2. 在你的角色知识域里找同构：如果你是原研哉，你在设计/建筑/自然里找；如果你是坂本龍一，你在音乐/声学/情感里找
3. 把同构映射翻译成具体的视觉策略：配色变化规律、排版节奏、留白分布、动效时序
4. 写入 design-notes.md

design-dna 不是必须的。如果内容结构简单（平铺并列），不需要强行找同构。但如果内容有明确的张力曲线或情绪变化，design-dna 能让视觉和内容在结构层面共振，而不只是"好看"。

## 风格确认

基于角色审美和 design-dna 分析，向用户描述你打算做的视觉方向：

> codeck design，风格方向。
>
> {用角色的声音描述视觉方向，引用 design-dna 的同构映射}
>
> 例："这份内容从困惑走向清晰，像雾中显影。我打算前几页用低对比、模糊的背景，随着论证推进，对比度逐渐拉高，最后一页干净利落。"

- A) 就这个方向（推荐）
- B) 我有别的想法
- C) 给我看几个方向选

## 生成内容

### 架构：引擎固定，AI 只写内容和样式

翻页引擎（导航、fragment、overview、演讲者模式、进度条、FOUC 防护）是预写好的固定代码，存在 `engine/engine.js` 和 `engine/engine.css`。每个 deck 用同一套引擎，行为完全一致。

**AI 写两个文件：**

| 文件 | 内容 | 说明 |
|------|------|------|
| `$DECK_DIR/custom.css` | `:root` 变量 + 布局原语 + 每页特定样式 + 移动适配 | 设计系统，每个 deck 不同 |
| `$DECK_DIR/slides.html` | `<section class="slide">` 序列 | 每页内容，自由 HTML |

**Bash 拼装最终 HTML：**

```bash
ENGINE_DIR="$HOME/.claude/skills/codeck-design/engine"

# 确定版本号
REV=$(ls "$DECK_DIR"/*-r*.html 2>/dev/null | grep -oP 'r\K\d+' | sort -n | tail -1)
REV=$((${REV:-0} + 1))

# 拼装（engine 原样嵌入，AI 不碰）
bash "$ENGINE_DIR/assemble.sh" "$DECK_DIR" "{标题}" "{语言}" \
  > "$DECK_DIR/{title}-r${REV}.html"
```

### 引擎能力（engine.js 提供，不需要实现）

engine.js 已包含这些能力，AI 不需要写任何 JS：

1. **页面导航** — 左右箭头/空格/PageDown 翻页
2. **Fragment 步进** — `data-f="N"` 属性，ArrowDown 逐步显示，ArrowUp 逐步隐藏
3. **Overview 模式** — Esc 切换，缩略图网格，点击跳转
4. **进度条 + 页码** — 自动创建，不需要写 HTML
5. **移动端导航** — 自动创建底部按钮栏
6. **FOUC 防护** — 双 rAF 后显示
7. **Speaker Notes** — 读取 `data-notes` 属性
8. **演讲者模式** — P 键打开同步窗口（BroadcastChannel），Grid 布局显示当前页/下一页/备注/计时器

### custom.css 写法

```css
/* ====== 设计系统 ====== */
:root {
  --bg: #0a0a0a;
  --fg: #f0f0f0;
  --accent: #4a9eff;
  --accent2: #ff6b6b;
  --font-body: 'SF Pro', system-ui, sans-serif;
  --font-heading: 'SF Pro Display', system-ui, sans-serif;
  --font-mono: 'SF Mono', ui-monospace, monospace;
  --space-sm: 16px;
  --space-md: 32px;
  --space-lg: 64px;
  --radius: 8px;
}

/* ====== 布局原语 ====== */
.title-mega { font-size: 72px; font-weight: 800; line-height: 1.1; }
.title-large { font-size: 48px; font-weight: 700; line-height: 1.2; }
.body-text { font-size: 28px; line-height: 1.6; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.flex-col { display: flex; flex-direction: column; gap: var(--space-sm); }
.card { background: rgba(255,255,255,0.05); border-radius: var(--radius); padding: var(--space-md); }
/* ...根据内容需要添加更多原语 */

/* ====== 每页特定样式 ====== */
.slide-cover { text-align: center; justify-content: center; align-items: center; }
/* ...每页的特定布局和视觉效果 */

/* ====== 移动端适配 ====== */
@media (max-width: 768px) {
  .title-mega { font-size: 36px; }
  .title-large { font-size: 28px; }
  .body-text { font-size: 18px; }
  .grid-2 { grid-template-columns: 1fr; }
}
```

**CSS 变量是引擎和内容的接口。** engine.css 用 `var(--bg)`, `var(--fg)`, `var(--accent)` 等变量渲染引擎 UI（进度条、overview 边框、页码颜色）。AI 在 custom.css 的 `:root` 里定义这些变量，引擎自动适配。

### slides.html 写法

```html
<!-- ====== 1. 封面 ====== -->
<section class="slide slide-cover" data-notes="开场要点：先说问题，不说产品">
  <h1 class="title-mega">标题</h1>
  <p class="body-text" style="opacity:0.7">副标题</p>
</section>

<!-- ====== 2. 问题 ====== -->
<section class="slide" data-notes="这组数据来自 2024 年报告">
  <h2 class="title-large">问题是什么</h2>
  <div class="grid-2">
    <div class="card" data-f="1">第一点</div>
    <div class="card" data-f="2">第二点</div>
  </div>
</section>
```

**约定：**
- 每个 `<section class="slide" data-notes="...">` 是一页
- `data-notes` 填 outline.md 中该页的核心要点（1-2 句）
- 页面之间用注释分隔：`<!-- ====== N. 标题 ====== -->`
- 页面内自由 HTML——没有 block type 限制
- `data-f="N"` 标记 fragment 步进（N 越小越先出现）
- 不写 `<script>` 标签、进度条、移动导航——引擎自动处理

### 视觉规则

1. **CSS 变量驱动** — 全局色彩、字体、间距通过 `:root` 变量控制
2. **留白充分** — 每页留白 > 30%
3. **字号分层** — 标题 48-72px，正文 24-32px，注释 16-20px
4. **移动端适配** — 768px 断点
5. **无外部依赖** — 系统字体栈，不引用 CDN

### 写出 + 拼装

1. 用 Write 工具写入 `$DECK_DIR/custom.css`
2. 用 Write 工具写入 `$DECK_DIR/slides.html`
3. 用 Bash 运行 assemble.sh 拼装最终 HTML

slides.html 可能很长。如果单次写入失败，先写前几页，再用 Edit 追加。

### 自审

拼装后检查最终 HTML：

1. **页面数量** — 和 outline.md 的页面数一致？
2. **注释锚点** — 每页之间有 `<!-- ====== N. 标题 ====== -->` ？
3. **data-notes** — 每个 slide section 都有 `data-notes` 属性？
4. **CSS 变量** — `:root` 里定义了 `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`？
5. **移动适配** — custom.css 有 `@media (max-width: 768px)` ？
6. **内容准确** — 文字来自素材，没有编造数据？
7. **无引擎代码** — slides.html 里没有 `<script>` 标签？

问题直接修（Edit custom.css 或 slides.html，重新 assemble），不问用户。

## design-notes.md

写入 `$DECK_DIR/design-notes.md`，记录设计过程：

```markdown
# Design Notes

## 角色
{激活的角色名}

## design-dna
{形式结构分析}
{同构映射}
{视觉策略}

## 风格方向
{用户确认的方向}

## 关键决策
- {决策及原因}
- ...

## 给审稿人的话
> {用角色的声音，1-2 句话说明设计意图和最值得关注的点}
```

## 迭代

> codeck design，HTML 已生成。想调整吗？
>
> 你可以说"第 3 页标题改成 xxx"或"整体配色换暖色"。

- A) 我想改
- B) 满意，下一步

选 A → 用 Edit 工具修改 `$DECK_DIR/slides.html` 或 `$DECK_DIR/custom.css`，重新运行 assemble.sh。修改后版本号不变（覆盖同一个 r{n}.html）。最多 3 轮后建议继续。

## 完成

> codeck design 完成。
>
> {一句话评价——引用 design-dna 的同构映射}
>
> 产出：`$DECK_DIR/{title}-r{revision}.html` + `$DECK_DIR/design-notes.md`
> 下一步：`/codeck review`

如果 `intent.md` 存在，追加决策日志：
```
> [design] {风格方向、同构映射、关键视觉决策}
```

```
outline [done] → design [done] → review [ready] → export → speech
```
