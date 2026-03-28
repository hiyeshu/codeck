---
name: codeck
version: 2.0.0
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

你不只是一面镜子——你有判断力。如果项目状态有异常（产出之间有偏差、上游改了下游没跟上），你要主动说出来。

## AskUserQuestion 格式（所有 codeck skill 通用）

每次提问必须遵循四段式：

1. **Re-ground** — 告诉用户当前在哪个 skill、做到哪一步。一句话。
2. **Simplify** — 用人话解释问题。假设用户 20 分钟没看屏幕。
3. **Recommend** — `建议选 [X]，因为 【一句话原因】`。
4. **Options** — A) B) C) 选项，用户点一下就行。

只能陈述已经验证过的事实。未执行的操作只能说"建议 / 将要 / 计划"。

---

## Phase 1: 扫描与缓存

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

# ─── 排除规则（基础设施 / 产出物 / 系统目录） ───
EXCLUDE='! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./dist/*" ! -path "./build/*" ! -name "CLAUDE.md" ! -name "TODOS.md" ! -name "README.md" ! -name "DESIGN.md" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.config.*"'

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

echo "=== STATUS ==="
[ -f "$DECK_DIR/diagnosis.md" ] && echo "DIAGNOSIS: DONE" || echo "DIAGNOSIS: NONE"
[ -f "$DECK_DIR/outline.md" ] && echo "OUTLINE: DONE" || echo "OUTLINE: NONE"
[ -f "$DECK_DIR/intent.md" ] && echo "INTENT: DONE" || echo "INTENT: NONE"
[ -f "$DECK_DIR/custom.css" ] && echo "CUSTOM_CSS: DONE" || echo "CUSTOM_CSS: NONE"
[ -f "$DECK_DIR/slides.html" ] && echo "SLIDES_HTML: DONE" || echo "SLIDES_HTML: NONE"
ls "$DECK_DIR"/*-r*.html 2>/dev/null && echo "ASSEMBLED_HTML: DONE" || echo "ASSEMBLED_HTML: NONE"
[ -f "$DECK_DIR/design-notes.md" ] && echo "DESIGN_NOTES: DONE" || echo "DESIGN_NOTES: NONE"
[ -f "$DECK_DIR/review.md" ] && echo "REVIEW: DONE" || echo "REVIEW: NONE"
[ -f "$DECK_DIR/speech.md" ] && echo "SPEECH: DONE" || echo "SPEECH: NONE"

# ─── 时间戳采集（用于偏差检测） ───
echo "=== TIMESTAMPS ==="
for f in "$DECK_DIR/outline.md" "$DECK_DIR/intent.md" "$DECK_DIR/custom.css" "$DECK_DIR/slides.html" "$DECK_DIR/review.md" "$DECK_DIR/speech.md"; do
  [ -f "$f" ] && echo "$f: $(stat -c '%Y' "$f" 2>/dev/null || stat -f '%m' "$f" 2>/dev/null)" || true
done
```

### 写入扫描缓存

将扫描结果写入 `$DECK_DIR/scan.json`，供下游 skill 直接读取：

```json
{
  "scannedAt": "{ISO datetime}",
  "text": ["{文件路径}", ...],
  "docs": ["{文件路径}", ...],
  "images": ["{文件路径}", ...],
  "data": ["{文件路径}", ...],
  "media": ["{文件路径}", ...],
  "counts": { "text": 0, "docs": 0, "images": 0, "data": 0, "media": 0 }
}
```

---

## Phase 2: 内容诊断（三信号）

如果素材存在且 `$DECK_DIR/diagnosis.md` 不存在，读取素材后做内容诊断：

### 三个信号

1. **领域属性** — 这份内容属于什么领域？决定大纲阶段请谁（角色名激活 AI 的知识网络）。
2. **表达挑战** — 这份内容最难表达的是什么？决定设计阶段请谁。
3. **听众认知起点** — 听众已经知道什么、不知道什么？决定审稿阶段请谁（反向选择：最可能翻车的听众）。

### 诊断产出

写入 `$DECK_DIR/diagnosis.md`：

```markdown
# 内容诊断

## 领域属性
{领域描述}

## 表达挑战
{最难表达的点}

## 听众认知起点
{听众已知/未知}

## 角色推荐

### 大纲阶段
请 {角色名} — {一句话原因}

### 设计阶段
请 {角色名} — {一句话原因}

### 审稿阶段
请 {角色名}（反向选择：最可能翻车的听众）— {一句话原因}
```

如果素材不存在（用户直接说主题），跳过诊断，让用户在各阶段自选角色。

---

## Phase 3: 偏差诊断

对比各产出物的时间戳，检测偏差：

**1. 上游更新、下游过期。** outline.md 比 custom.css/slides.html 新 → 标记 design 为 `⚠ STALE`。

**2. 审稿过期。** custom.css 或 slides.html 比 review.md 新 → 标记 review 为 `⚠ STALE`。

---

## Phase 4: Dashboard

```
+======================================================+
|              codeck · {标题 or "new deck"}             |
+======================================================+
| Role               | Status    | Output              |
|--------------------|-----------|----------------------|
| /codeck outline    | {status}  | outline.md           |
| /codeck design     | {status}  | {title}-r{N}.html    |
| /codeck review     | {status}  | review.md            |
| /codeck export     | {status}  | .pdf / .pptx         |
| /codeck speech     | {status}  | speech.md            |
+------------------------------------------------------+
| 素材: {动态列出扫到的类型和数量} |
+------------------------------------------------------+
| {偏差诊断结果，如果有的话}                               |
+------------------------------------------------------+
| NEXT: {下一步} — {一句话理由}                            |
+======================================================+
```

Status 标记：

- `✓ DONE` — 产出存在且未过期
- `⚠ STALE` — 产出存在但上游已更新
- `▶ READY` — 上游已完成，可以开始
- `— LOCKED` — 上游未完成，不可开始

### NEXT 智能推荐

- 没有 outline.md → `NEXT: /codeck outline` — "还没有大纲，先规划结构"
- 有 outline 没 HTML → `NEXT: /codeck design` — "大纲就绪，可以生成了"
- 有 HTML 没 review.md → `NEXT: /codeck review` — "成品出来了，该审稿了"
- outline 比 HTML 新（⚠ STALE）→ `NEXT: /codeck design` — "大纲改过了，幻灯片需要同步"
- HTML 比 review 新（⚠ STALE）→ `NEXT: /codeck review` — "幻灯片改过了，审稿需要重跑"
- 有 review 没导出 → `NEXT: /codeck export` — "审稿通过，可以导出了"
- 全部 DONE → `NEXT: /codeck speech` — "可以准备演讲稿了"

---

## Phase 5: Handoff — 跨 skill 记忆

每个 codeck skill 的产出都写在 `$DECK_DIR/` 目录。下一个 skill 读取上游产出继续工作。
如果用户中途离开再回来，跑 `/codeck` 看 dashboard 就知道进度和上下文。

### benefits-from 依赖检测

每个下游 skill 启动时检测上游产出是否存在：

- `/codeck design` 需要 `$DECK_DIR/outline.md`
- `/codeck review` 需要 `$DECK_DIR/*-r*.html`（拼装后的 HTML）
- `/codeck export` 需要 `$DECK_DIR/*-r*.html`
- `/codeck speech` 需要 `$DECK_DIR/*-r*.html`

提示方式不是报错停止，而是用 AskUserQuestion：

> codeck，{skill 名} 需要 {上游产出}，但还没有。

- A) 好，先跑 {上游 skill}
- B) 跳过，我直接告诉你要什么
