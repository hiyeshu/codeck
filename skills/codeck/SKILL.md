---
name: codeck
version: 2.1.0
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

## Phase 1: 初始化 + 状态检测

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"

# 共用状态检测
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

## Phase 2: 素材扫描

```bash
# ─── 排除规则 ───
EXCLUDE='! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./dist/*" ! -path "./build/*" ! -name "CLAUDE.md" ! -name "TODOS.md" ! -name "README.md" ! -name "DESIGN.md" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.config.*"'

echo "=== TEXT ===" && eval find . -maxdepth 4 -type f \( -name "*.md" -o -name "*.txt" -o -name "*.rtf" -o -name "*.org" -o -name "*.rst" \) $EXCLUDE 2>/dev/null | head -20
echo "=== DOCS ===" && eval find . -maxdepth 4 -type f \( -name "*.pdf" -o -name "*.docx" -o -name "*.doc" -o -name "*.pptx" -o -name "*.ppt" -o -name "*.key" -o -name "*.pages" -o -name "*.xlsx" -o -name "*.xls" -o -name "*.numbers" \) $EXCLUDE 2>/dev/null | head -20
echo "=== IMAGES ===" && eval find . -maxdepth 4 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" -o -name "*.svg" -o -name "*.ico" -o -name "*.bmp" -o -name "*.tiff" \) $EXCLUDE 2>/dev/null | head -20
echo "=== DATA ===" && eval find . -maxdepth 4 -type f \( -name "*.csv" -o -name "*.tsv" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.xml" \) $EXCLUDE 2>/dev/null | head -20
echo "=== MEDIA ===" && eval find . -maxdepth 4 -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mp3" -o -name "*.wav" -o -name "*.m4a" -o -name "*.webm" \) $EXCLUDE 2>/dev/null | head -10
```

---

## Phase 3: 内容诊断（三信号）

如果素材存在且 `$DECK_DIR/diagnosis.md` 不存在，读取素材后做内容诊断：

### 三个信号

1. **领域属性** — 这份内容属于什么领域？决定大纲阶段请谁（角色名激活 AI 的知识网络）。
2. **表达挑战** — 这份内容最难表达的是什么？决定设计阶段请谁。
3. **听众认知起点** — 听众已经知道什么、不知道什么？决定审稿阶段请谁（反向选择：最可能翻车的听众）。

### 素材摘要

读取素材，为每个文件写一行摘要——是什么、能用来做什么。写入 diagnosis.md 的素材段。

### 诊断产出

写入 `$DECK_DIR/diagnosis.md`：

```markdown
# 内容诊断

## 素材

| 文件 | 内容 | 可用于 |
|------|------|--------|
| {文件名} | {一句话描述} | {在演示文稿中的用途} |

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

## Phase 4: 结果展示

Phase 1 的 status.sh 已输出 dashboard。在 dashboard 下方补充：

1. **素材摘要** — Phase 2 扫到的文件类型和数量（如"3 个 .md, 2 张图片, 1 个 .csv"）
2. **STALE 说明** — 如果有偏差阶段，用一句话解释原因
3. **诊断摘要** — 如果刚做了 Phase 3 诊断，列出三信号和推荐角色

不要重新画表。status.sh 的输出就是 dashboard。

---

## Phase 5: Handoff

每个 codeck skill 的产出都写在 `$DECK_DIR/` 目录。下一个 skill 读取上游产出继续工作。
用户中途离开再回来，跑 `/codeck` 看 dashboard 就知道进度和上下文。
