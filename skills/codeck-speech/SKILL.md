---
name: codeck-speech
version: 2.0.0
description: |
  Speech writer role. Reads deck content, asks about audience and style,
  generates a full speech transcript with stage directions. Outputs
  $DECK_DIR/speech.md. Use whenever the user says "演讲稿", "备注",
  "speaker notes", "speech", "怎么讲", or wants help preparing to
  present a deck on stage.
---

# codeck speech — 演讲稿

## 角色激活

读取 `$DECK_DIR/diagnosis.md`。speech 不一定有专门推荐的角色——如果有，用它；如果没有，根据内容领域和受众自选一个"演讲教练"。

> 技术分享 → 用费曼的方式：把复杂的讲简单，用类比拉近距离
>
> 商业提案 → 用乔布斯的方式：制造期待，一个"one more thing"
>
> 学术报告 → 用 Hans Rosling 的方式：让数据讲故事

## AskUserQuestion 格式

1. **Re-ground** — "codeck speech，{当前步骤}"
2. **Simplify** — 人话
3. **Recommend** — 建议
4. **Options** — 选项

## 准备

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

ls "$DECK_DIR"/*-r*.html 2>/dev/null && echo "HTML: FOUND" || echo "HTML: MISSING"
[ -f "$DECK_DIR/outline.md" ] && echo "OUTLINE: FOUND" || echo "OUTLINE: MISSING"
[ -f "$DECK_DIR/intent.md" ] && echo "INTENT: FOUND" || echo "INTENT: MISSING"
[ -f "$DECK_DIR/review.md" ] && echo "REVIEW: FOUND" || echo "REVIEW: MISSING"
[ -f "$DECK_DIR/design-notes.md" ] && echo "DESIGN_NOTES: FOUND" || echo "DESIGN_NOTES: MISSING"
```

读取源文件：
- **HTML 文件**（最新的 `*-r*.html`）— 这是实际的幻灯片内容。读取每个 `<section class="slide">` 的文字内容。
- **outline.md** — 大纲结构和叙事弧
- **intent.md** — 用户意图、情绪基调
- **review.md** — 审稿人的"给演讲稿的话"
- **design-notes.md** — 设计师的视觉意图（演讲稿节奏应匹配视觉节奏）

如果没有 HTML 文件也没有 outline.md，提示先跑 `/codeck design` 或 `/codeck outline`。

如果只有 outline.md 没有 HTML，可以基于大纲写稿——提示用户稿子基于大纲而非最终视觉。

## 提问

**智能跳过：** 用户指令已包含的信息跳过。

### Q1: 风格

> codeck speech，选风格。

- A) TED 风格 — 口语化、故事驱动、有呼吸感
- B) 正式演讲 — 结构严谨、措辞正式
- C) 轻松分享 — 随意自然、可以开玩笑

### Q2: 时长

> codeck speech，多长时间？

- A) 5 分钟 — 闪电，约 1000 字
- B) 15 分钟 — 标准，约 3000 字
- C) 30+ 分钟 — 深度，约 6000 字

## 生成

逐页写完整可朗读的演讲稿。

### 规则

1. **逐页对应** — 每页幻灯片一个章节
2. **过渡衔接** — 页间自然过渡，不生硬跳转
3. **舞台指示** — `[停顿 Ns]` `[过渡]` `[放慢]` `[加快]` `[看观众]`
4. **字数控制** — 中文约 200 字/分钟，英文约 130 词/分钟
5. **内容基于素材** — 不编造数据
6. **开场抓人** — 故事/数据/问题
7. **结尾有力** — 回扣主题/号召行动

### 风格细则

**TED：** 多用"你""我们"，短句长句交替，核心观点后停顿，结尾回扣开头。

**正式：** 完整句式，逻辑递进，"首先…其次…最后"，结尾总结+展望。

**轻松：** 口语化，可以自嘲，过渡随意，结尾留彩蛋。

## 时间预算

> codeck speech，时间预算。
>
> 总预估 {M}分{S}秒，目标 {T} 分钟。

| 页 | 标题 | 字数 | 预估 |
|----|------|------|------|
| 1 | ... | ... | ... |

- A) 帮我精简超时的
- B) 没关系，我自己控制

## 回写 HTML data-notes

演讲稿生成后，把每页的逐字稿写回 HTML 的 `data-notes` 属性。这样演讲者模式能显示完整演讲稿而非 design 阶段的简要备注。

用 Edit 工具逐页替换：
- 找到 `<section class="slide" data-notes="...">`
- 把 `data-notes` 的值替换为该页的完整演讲稿文本（HTML 转义引号）
- 舞台指示（`[停顿]` `[过渡]` 等）保留在 data-notes 中

## 写出

`$DECK_DIR/speech.md`：

```markdown
---
stage: speech
status: done
created: {ISO datetime}
role: {角色名}
style: "{风格}"
duration: "{时长}"
totalEstimate: "{预估}"
---

# 演讲稿: {主题}

> 风格: {风格} | 目标: {时长}

---

## 第 1 页: {标题}
<!-- 预估: {N}s | {M}字 -->

{完整演讲正文}

[停顿 2s]

---

## 第 2 页: {标题}
<!-- 预估: {N}s | {M}字 -->

[过渡] {衔接句}

{完整演讲正文}

---

...
```

## 完成

> codeck speech 完成。
>
> {一句话——关于演讲准备度}
>
> 产出：`$DECK_DIR/speech.md` + HTML `data-notes` 已更新为完整逐字稿
> 按 P 键进入演讲者模式可看到逐字稿

如果 `intent.md` 存在，追加决策日志：
```
> [speech] {风格选择、时间分配、关键决策}
```

```
outline [done] → design [done] → review [done] → export → speech [done]
```
