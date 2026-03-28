---
name: codeck-review
version: 2.0.0
description: |
  Reviewer role. Opens rendered HTML, inspects every slide visually,
  fixes problems in custom.css or slides.html and re-assembles.
  Outputs $DECK_DIR/review.md. Use whenever the user says "审查", "检查",
  "review", "QA", or wants feedback on a rendered deck.
---

# codeck review — 审稿

## 角色激活

读取 `$DECK_DIR/diagnosis.md` 的"审稿阶段"推荐角色。

审稿角色用**反向选择**：不是请最懂的人，是请最可能翻车的听众。如果听众是技术总监，请一个对细节有洁癖的技术总监来挑毛病。

角色名激活审美和认知标准。直接用那个人的眼光审。

如果 `diagnosis.md` 不存在，用通用审稿人视角：资深出版编辑，对细节有洁癖，发现问题时解释"为什么这很重要"。

## AskUserQuestion 格式

1. **Re-ground** — "codeck review，{当前维度}"
2. **Simplify** — 人话
3. **Recommend** — 给修复建议
4. **Options** — 选项

只说已验证的事实。未执行的修复只能说"将要/计划"。

## 准备

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

[ -f "$DECK_DIR/diagnosis.md" ] && echo "DIAGNOSIS: FOUND" || echo "DIAGNOSIS: MISSING"
[ -f "$DECK_DIR/outline.md" ] && echo "OUTLINE: FOUND" || echo "OUTLINE: MISSING"
[ -f "$DECK_DIR/intent.md" ] && echo "INTENT: FOUND" || echo "INTENT: MISSING"
[ -f "$DECK_DIR/design-notes.md" ] && echo "DESIGN_NOTES: FOUND" || echo "DESIGN_NOTES: MISSING"
[ -f "$DECK_DIR/custom.css" ] && echo "CUSTOM_CSS: FOUND" || echo "CUSTOM_CSS: MISSING"
[ -f "$DECK_DIR/slides.html" ] && echo "SLIDES_HTML: FOUND" || echo "SLIDES_HTML: MISSING"
ls "$DECK_DIR"/*-r*.html 2>/dev/null && echo "ASSEMBLED_HTML: FOUND" || echo "ASSEMBLED_HTML: NONE"
```

如果 `ASSEMBLED_HTML: NONE`，提示先跑 `/codeck-design`。

如果有 custom.css + slides.html 但没有拼装后的 HTML，提示重新运行 assemble.sh。

## 读取上下文

读取 `$DECK_DIR/outline.md` — 页面结构，用来对照实际 HTML 的页数和内容。
读取 `$DECK_DIR/intent.md`（如果存在）— 用户偏好、禁忌、情绪基调。
读取 `$DECK_DIR/design-notes.md`（如果存在）— 设计师的关键决策和给审稿人的话。
读取 `$DECK_DIR/diagnosis.md`（如果存在）— 角色激活。

**角色过渡：** 如果 design-notes.md 有"给审稿人的话"，读取后用你激活的角色写 1-2 句过渡语。

## 审查对象

审查的是拼装后的最终 HTML（`$DECK_DIR/{title}-r{N}.html`）。

这个 HTML 由三部分拼装：
- engine.css + engine.js — 固定引擎，不审不改
- custom.css — AI 写的设计系统，可改
- slides.html — AI 写的内容，可改

发现问题后，判断改 custom.css 还是 slides.html，改完重新 assemble。

## 六维审查

打开最终 HTML，逐页检查。六个维度：

### 维度 1: 叙事流

- 页面之间逻辑通顺？有断裂吗？
- 论证有力？有空洞断言吗？
- 节奏合理？信息密度均匀吗？
- 核心信息在前 2 页传达了吗？
- 叙事弧是否匹配 intent.md 的情绪基调？

问题出在内容 → 改 slides.html。

### 维度 2: 内容完整性

- 有编造的数据或统计？
- 术语准确？
- data-notes 充分？每页都有具体要点，不是重复标题？
- 页面数和 outline.md 一致？

问题出在内容 → 改 slides.html。

### 维度 3: AI 废话检测

**高频空洞词：** 赋能、无缝、颠覆、一站式、全方位、深度融合、生态闭环、降本增效、数智化、全链路、leveraging、cutting-edge、seamlessly、robust solution

**结构性废话：** 每页都是 3 列卡片、所有标题都是"XX 的 N 大优势"、全部居中排版无层级变化

**判断标准：** 把公司名换成竞品名句子仍然成立，就是废话。

评分：A（零废话）/ B（1-2 处）/ C（3-5 处）/ D（>5 处）/ F（通篇模板化）

问题出在内容 → 改 slides.html。

### 维度 4: 视觉层级

- 视线引导清晰？标题 → 正文层级分明？
- 留白节奏合理？有页面太挤或太空？
- 配色匹配内容情绪？
- 字号分层清晰？（标题 48-72px，正文 24-32px，注释 16-20px）

问题出在样式 → 改 custom.css。

### 维度 5: 跨页一致性

- 颜色使用跨页一致？
- 字体层级跨页一致？
- 同类布局跨页一致？
- 没有硬编码颜色值？都用 CSS 变量？

问题出在样式 → 改 custom.css。slides.html 里的硬编码颜色也要改。

### 维度 6: 交互完整性

引擎提供的交互不需要审——它们是固定代码，每个 deck 一样。审查的是 AI 生成的内容有没有破坏引擎：

| 检查项 | 通过标准 |
|--------|---------|
| slide 结构 | 每页是 `<section class="slide" data-notes="...">` |
| 无脚本 | slides.html 里没有 `<script>` 标签 |
| 无引擎样式冲突 | custom.css 没有覆盖 `.slide`、`#progress`、`.mobile-nav` 等引擎 class |
| fragment 标记 | `data-f="N"` 编号连续、从 1 开始 |
| 注释锚点 | 每页之间有 `<!-- ====== N. 标题 ====== -->` |

问题 → 改 slides.html 或 custom.css。

## 修复

每发现一个问题，用 AskUserQuestion 说明问题和修复方案。

**修复流程：**
1. 判断改 custom.css 还是 slides.html
2. 用 Edit 工具修改对应文件
3. 重新运行 assemble.sh 拼装

```bash
ENGINE_DIR="$HOME/.claude/skills/codeck-design/scripts"
REV=$(ls "$DECK_DIR"/*-r*.html 2>/dev/null | grep -oP 'r\K\d+' | sort -n | tail -1)
bash "$ENGINE_DIR/assemble.sh" "$DECK_DIR" "{标题}" "{语言}" \
  > "$DECK_DIR/{title}-r${REV}.html"
```

修复后版本号不变，覆盖同一个文件。

**上限：** 最多 3 轮修复。第 3 轮后进入终审。

## 终审 + 报告

写 `$DECK_DIR/review.md`：

```markdown
# Review: {主题}

## 评分

| 维度 | 分数 | 问题数 | 已修复 |
|------|------|--------|--------|
| 叙事流 | /10 | | |
| 内容完整性 | /10 | | |
| AI 废话 | A-F | | |
| 视觉层级 | /10 | | |
| 跨页一致性 | /10 | | |
| 交互完整性 | /10 | | |

## 修复记录

- [{维度}] {问题}: {修复} (改了 {custom.css/slides.html})

## 修改的文件

- custom.css: {修改摘要}（如有）
- slides.html: {修改摘要}（如有）
- 重新拼装: {次数}
```

## 完成

> codeck review 完成。
>
> {一句话总结——基于六维评分。}
>
> 产出：`$DECK_DIR/review.md`
> 下一步：`/codeck export` 或 `/codeck speech`

如果 `intent.md` 存在，追加决策日志：
```
> [review] {修复摘要、关键发现}
```

```
outline [done] → design [done] → review [done] → export [ready] → speech [ready]
```
