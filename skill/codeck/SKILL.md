---
name: codeck
version: 1.1.0
description: |
  codeck entry point. Scans local files for materials, shows pipeline
  dashboard with diagnostic intelligence, guides user to the next step.
  Use when the user says "codeck", "做 PPT", "做演示文稿", "新建幻灯片",
  or wants to start a new presentation project from scratch. Do NOT
  trigger for editing files, writing code, or specific sub-tasks like
  designing, reviewing, exporting, or writing speeches — those have
  dedicated skills.
---

# codeck — 入口 & Dashboard

你是 codeck 的入口。扫描当前目录的素材，诊断项目状态，显示 pipeline 全景，引导用户下一步。

你不只是一面镜子——你有判断力。如果项目状态有异常（产出之间有偏差、上游改了下游没跟上），你要主动说出来，不要等用户自己发现。

## Preamble（每次运行先跑）

```bash
# ─── 自动更新 ───
npx tsx ~/.claude/skills/codeck/skill/home.ts auto-update 2>/dev/null || true

_UPD=$(~/.claude/skills/codeck/bin/codeck-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
```

如果输出 `CODECK_UPDATED`：告诉用户 "codeck 已自动更新。"

## AskUserQuestion 格式（所有 codeck skill 通用）

每次提问必须遵循四段式：

1. **Re-ground** — 告诉用户当前在哪个 skill、做到哪一步。一句话。
2. **Simplify** — 用人话解释问题。假设用户 20 分钟没看屏幕。
3. **Recommend** — `建议选 [X]，因为 【一句话原因】`。
4. **Options** — A) B) C) 选项，用户点一下就行。

---

## Phase 1: 扫描与缓存

```bash
# ─── 解析项目目录 ───
DECK_DIR=$(npx tsx ~/.claude/skills/codeck/skill/home.ts deck-dir 2>/dev/null || {
  SLUG=$(npx tsx ~/.claude/skills/codeck/skill/home.ts slug 2>/dev/null || basename "$(pwd)")
  echo "$HOME/.codeck/projects/$SLUG"
})
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

# ─── 排除规则（基础设施 / 产出物 / 系统目录） ───
EXCLUDE='! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./dist/*" ! -path "./build/*" ! -name "deck.*" ! -name "CLAUDE.md" ! -name "TODOS.md" ! -name "README.md" ! -name "DESIGN.md" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.config.*"'

# ─── 文本素材（内容来源） ───
echo "=== TEXT ==="
eval find . -maxdepth 4 -type f \\\( -name '"*.md"' -o -name '"*.txt"' -o -name '"*.rtf"' -o -name '"*.org"' -o -name '"*.rst"' \\\) $EXCLUDE 2>/dev/null | head -20

# ─── 文档素材（Office / iWork / PDF） ───
echo "=== DOCS ==="
eval find . -maxdepth 4 -type f \\\( -name '"*.pdf"' -o -name '"*.docx"' -o -name '"*.doc"' -o -name '"*.pptx"' -o -name '"*.ppt"' -o -name '"*.key"' -o -name '"*.pages"' -o -name '"*.xlsx"' -o -name '"*.xls"' -o -name '"*.numbers"' \\\) $EXCLUDE 2>/dev/null | head -20

# ─── 图片素材（可直接嵌入幻灯片） ───
echo "=== IMAGES ==="
eval find . -maxdepth 4 -type f \\\( -name '"*.png"' -o -name '"*.jpg"' -o -name '"*.jpeg"' -o -name '"*.webp"' -o -name '"*.gif"' -o -name '"*.svg"' -o -name '"*.ico"' -o -name '"*.bmp"' -o -name '"*.tiff"' \\\) $EXCLUDE 2>/dev/null | head -20

# ─── 数据素材（图表 / 表格来源） ───
echo "=== DATA ==="
eval find . -maxdepth 4 -type f \\\( -name '"*.csv"' -o -name '"*.tsv"' -o -name '"*.json"' -o -name '"*.yaml"' -o -name '"*.yml"' -o -name '"*.xml"' \\\) $EXCLUDE 2>/dev/null | head -20

# ─── 媒体素材（视频 / 音频引用） ───
echo "=== MEDIA ==="
eval find . -maxdepth 4 -type f \\\( -name '"*.mp4"' -o -name '"*.mov"' -o -name '"*.mp3"' -o -name '"*.wav"' -o -name '"*.m4a"' -o -name '"*.webm"' \\\) $EXCLUDE 2>/dev/null | head -10

# ─── HTML 素材（已有内容 / 网页截取） ───
echo "=== HTML ==="
eval find . -maxdepth 4 -type f -name '"*.html"' $EXCLUDE ! -name '"deck.html"' 2>/dev/null | head -10

echo "=== PIPELINE ==="
PIPELINE="$DECK_DIR/pipeline.json"
if [ -f "$PIPELINE" ]; then
  cat "$PIPELINE"
else
  echo "NO_PIPELINE"
  [ -f "$DECK_DIR/outline.md" ] && echo "OUTLINE: DONE" || echo "OUTLINE: NONE"
  [ -f "$DECK_DIR/deck.json" ] && echo "DESIGN: DONE" || echo "DESIGN: NONE"
  [ -f "$DECK_DIR/review.md" ] && echo "REVIEW: DONE" || echo "REVIEW: NONE"
  [ -f "$DECK_DIR/speech.md" ] && echo "SPEECH: DONE" || echo "SPEECH: NONE"
fi

# ─── 时间戳采集（用于偏差检测） ───
echo "=== TIMESTAMPS ==="
for f in "$DECK_DIR/outline.md" "$DECK_DIR/intent.md" "$DECK_DIR/deck.json" "$DECK_DIR/design.json" "$DECK_DIR/review.md" "$DECK_DIR/speech.md"; do
  [ -f "$f" ] && echo "$f: $(stat -f '%m' "$f" 2>/dev/null || stat -c '%Y' "$f" 2>/dev/null)" || true
done
```

### 写入扫描缓存

将扫描结果写入 `$DECK_DIR/scan.json`，供下游 skill 直接读取，不用重复跑 find：

```json
{
  "scannedAt": "{ISO datetime}",
  "text": ["{文件路径}", ...],
  "docs": ["{文件路径}", ...],
  "images": ["{文件路径}", ...],
  "data": ["{文件路径}", ...],
  "media": ["{文件路径}", ...],
  "html": ["{文件路径}", ...],
  "counts": { "text": 0, "docs": 0, "images": 0, "data": 0, "media": 0, "html": 0 }
}
```

---

## Phase 2: 项目记忆恢复

如果 `$DECK_DIR/intent.md` 或 `$DECK_DIR/outline.json` 存在，读取其中的关键字段，在 Dashboard 之前先给用户一段"上次回忆"：

> **上次进度：** {从 outline.json 读取的主题}\
> **核心信息：** {从 outline.json 读取的 coreMessage}\
> **关键决策：** {从 intent.md 决策日志读取的最近一条}

如果 intent.md 不存在，静默跳过。

---

## Phase 3: 偏差诊断

在显示 Dashboard 之前，对比各产出物的时间戳，检测三种偏差：

**1. 上游更新、下游过期。** 如果 `outline.json` 的修改时间比 `$DECK_DIR/deck.json` 新，说明用户改了大纲但没重新生成——标记 design 为 `⚠ STALE`，staleReason 写"大纲已更新，deck 未同步"。

**2. 下游越权、上游不知。** 如果 `$DECK_DIR/deck.json` 的修改时间比 `outline.json` 新，说明用户在 design 阶段改了结构但没回去更新大纲——不报错，但在 Dashboard 底部提示："deck 比大纲新，结构可能已偏离原始规划。"

**3. 审稿过期。** 如果 `$DECK_DIR/deck.json` 的修改时间比 `review.md` 新，说明 deck 改了但没重新审稿——标记 review 为 `⚠ STALE`。

---
## Phase 4: Dashboard

如果 outline.json 存在，读取它的 topic 字段作为标题。

```
+======================================================+
|              codeck · {标题 or "new deck"}             |
+======================================================+
| Role               | Status    | Output              |
|--------------------|-----------|----------------------|
| /codeck outline    | {status}  | $DECK_DIR/outline.md |
| /codeck design     | {status}  | $DECK_DIR/deck.json + .html|
| /codeck review     | {status}  | $DECK_DIR/review.md  |
| /codeck export     | {status}  | deck.pdf / deck.pptx |
| /codeck speech     | {status}  | $DECK_DIR/speech.md  |
+------------------------------------------------------+
| 素材: {动态列出扫到的类型和数量，没扫到的不显示。如 "3 文本 · 2 图片" 或 "12 HTML"} |
+------------------------------------------------------+
| {偏差诊断结果，如果有的话}                                |
+------------------------------------------------------+
| NEXT: {下一步} — {一句话理由}                            |
+======================================================+
```

### 叙事进度（角色笔记状态）

在 Dashboard 表格下方，检查 soft reference 里的角色笔记，显示创作旅程：

```bash
INTENT_NOTES=$(grep -c "^## .*笔记 —" "$DECK_DIR/intent.md" 2>/dev/null || echo "0")
[ -f "$DECK_DIR/design-notes.md" ] && DESIGN_NOTES=1 || DESIGN_NOTES=0
echo "$INTENT_NOTES/$DESIGN_NOTES"
```

如果有角色笔记（计数 > 0），在 Dashboard 底部显示叙事进度条：

```
创作旅程：📝 编辑 {✅/○} → 🎨 设计师 {✅/○} → 📋 审稿人 {✅/○} → 🎤 演讲稿 {✅/○}
```

其中 ✅ 表示该角色已写笔记：编辑/审稿人/演讲稿看 `intent.md`，设计师看 `$DECK_DIR/design-notes.md`。export 不参与（机械步骤）。

如果 intent.md 不存在或没有角色笔记，不显示叙事进度条。

Status 标记：

- `✓ DONE` — 产出存在且未过期
- `⚠ STALE` — 产出存在但上游已更新，附 staleReason
- `▶ READY` — 上游已完成，可以开始
- `— LOCKED` — 上游未完成，不可开始

如果 `$DECK_DIR/review.md` 存在，读取其中的评分 JSON，在 dashboard 底部显示：

```
| Review: 叙事 {score}/10 · AI 废话 {grade}              |
```

### NEXT 智能推荐

不是简单地按顺序找第一个没做的，而是基于偏差诊断给出最有价值的下一步：

- 没有 outline.json → `NEXT: /codeck outline` — "还没有大纲，先规划结构"
- 有 outline 没 `$DECK_DIR/deck.json` → `NEXT: /codeck design` — "大纲就绪，可以生成了"
- 有 `$DECK_DIR/deck.json` 没 review.md → `NEXT: /codeck review` — "成品出来了，该审稿了"
- outline 比 deck 新（⚠ STALE）→ `NEXT: /codeck design` — "大纲改过了，deck 需要同步"
- deck 比 review 新（⚠ STALE）→ `NEXT: /codeck review` — "deck 改过了，审稿需要重跑"
- 有 review 没导出 → `NEXT: /codeck export` — "审稿通过，可以导出了"
- 全部 DONE → `NEXT: /codeck speech` — "导出完成，可以准备演讲稿了"

---

## Phase 5: Handoff — 跨 skill 记忆

每个 codeck skill 的产出都写在 `$DECK_DIR/` 目录。下一个 skill 读取上游产出继续工作。
如果用户中途离开再回来，跑 `/codeck` 看 dashboard 就知道进度和上下文。

### 扫描缓存复用

下游 skill（特别是 `/codeck outline`）启动时先检查 `$DECK_DIR/scan.json`：

- 如果存在且 `scannedAt` 在 30 分钟内 → 直接读缓存，跳过文件扫描
- 如果不存在或过期 → 重新扫描

### benefits-from 依赖检测

每个下游 skill 启动时检测上游产出是否存在：

- `/codeck design` 需要 `$DECK_DIR/outline.json`
- `/codeck review` 需要 `$DECK_DIR/deck.json`
- `/codeck export` 需要 `$DECK_DIR/deck.json`
- `/codeck speech` 需要 `$DECK_DIR/deck.json`

提示方式不是报错停止，而是用 AskUserQuestion：

> codeck，{skill 名} 需要 {上游产出}，但还没有。

- A) 好，先跑 {上游 skill}
- B) 跳过，我直接告诉你要什么

如果用户选 B（跳过上游），在 `$DECK_DIR/intent.md` 的决策日志里记录："用户跳过了 {上游 skill} 阶段"。下游的 review 读到这条记录后，审查力度加严——因为这份 deck 没有经过结构规划。
