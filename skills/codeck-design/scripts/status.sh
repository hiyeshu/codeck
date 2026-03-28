#!/usr/bin/env bash
# codeck status — 所有 skill 共用的状态检测
# 用法: source status.sh "$DECK_DIR"
# 输出: 环境变量 CODECK_STATUS_* 和 CODECK_DASHBOARD

DECK_DIR="${1:?用法: source status.sh \$DECK_DIR}"

# ─── 文件检测 ───
_has() { [ -f "$1" ]; }
_html() { ls "$DECK_DIR"/*-r*.html 2>/dev/null | sort -V | tail -1; }
_mtime() { stat -c '%Y' "$1" 2>/dev/null || stat -f '%m' "$1" 2>/dev/null; }

CODECK_DIAGNOSIS=$(_has "$DECK_DIR/diagnosis.md" && echo done || echo none)
CODECK_OUTLINE=$(_has "$DECK_DIR/outline.md" && echo done || echo none)
CODECK_INTENT=$(_has "$DECK_DIR/intent.md" && echo done || echo none)
CODECK_CSS=$(_has "$DECK_DIR/custom.css" && echo done || echo none)
CODECK_SLIDES=$(_has "$DECK_DIR/slides.html" && echo done || echo none)
CODECK_HTML=$(_html && echo done || echo none)
CODECK_HTML_PATH=$(_html)
CODECK_DESIGN_NOTES=$(_has "$DECK_DIR/design-notes.md" && echo done || echo none)
CODECK_REVIEW=$(_has "$DECK_DIR/review.md" && echo done || echo none)
CODECK_SPEECH=$(_has "$DECK_DIR/speech.md" && echo done || echo none)

# ─── 阶段状态（done / stale / ready / locked） ───
_stage_design() {
  [ "$CODECK_HTML" = "done" ] || { [ "$CODECK_CSS" = "done" ] && echo done && return; }
  [ "$CODECK_HTML" = "done" ] && echo done || { [ "$CODECK_OUTLINE" = "done" ] && echo ready || echo locked; }
}

_stage_review() {
  if [ "$CODECK_REVIEW" = "done" ]; then
    # 检查是否过期：HTML 比 review 新？
    if [ "$CODECK_HTML" = "done" ] && [ -n "$CODECK_HTML_PATH" ]; then
      local t_html=$(_mtime "$CODECK_HTML_PATH")
      local t_review=$(_mtime "$DECK_DIR/review.md")
      [ "$t_html" -gt "$t_review" ] 2>/dev/null && echo stale && return
    fi
    echo done
  elif [ "$CODECK_HTML" = "done" ]; then
    echo ready
  else
    echo locked
  fi
}

_stage_export() {
  [ "$CODECK_HTML" = "done" ] && echo ready || echo locked
}

_stage_speech() {
  if [ "$CODECK_SPEECH" = "done" ]; then
    echo done
  elif [ "$CODECK_HTML" = "done" ] || [ "$CODECK_OUTLINE" = "done" ]; then
    echo ready
  else
    echo locked
  fi
}

# 大纲偏差：outline 比 HTML 新？
_stage_design_stale() {
  if [ "$CODECK_HTML" = "done" ] && [ "$CODECK_OUTLINE" = "done" ] && [ -n "$CODECK_HTML_PATH" ]; then
    local t_outline=$(_mtime "$DECK_DIR/outline.md")
    local t_html=$(_mtime "$CODECK_HTML_PATH")
    [ "$t_outline" -gt "$t_html" ] 2>/dev/null && echo stale && return
  fi
  echo ok
}

CODECK_STATUS_OUTLINE=$( [ "$CODECK_OUTLINE" = "done" ] && echo done || echo none )
CODECK_STATUS_DESIGN=$(_stage_design)
CODECK_STATUS_REVIEW=$(_stage_review)
CODECK_STATUS_EXPORT=$(_stage_export)
CODECK_STATUS_SPEECH=$(_stage_speech)

# 覆盖 design stale
[ "$(_stage_design_stale)" = "stale" ] && [ "$CODECK_STATUS_DESIGN" = "done" ] && CODECK_STATUS_DESIGN=stale

# ─── 偏差列表 ───
CODECK_STALE=""
[ "$CODECK_STATUS_DESIGN" = "stale" ] && CODECK_STALE="${CODECK_STALE}design "
[ "$CODECK_STATUS_REVIEW" = "stale" ] && CODECK_STALE="${CODECK_STALE}review "

# ─── NEXT 推荐 ───
if [ "$CODECK_STATUS_OUTLINE" = "none" ]; then
  CODECK_NEXT="outline"
  CODECK_NEXT_REASON="还没有大纲，先规划结构"
elif [ "$CODECK_STATUS_DESIGN" = "stale" ]; then
  CODECK_NEXT="design"
  CODECK_NEXT_REASON="大纲改过了，幻灯片需要同步"
elif [ "$CODECK_STATUS_DESIGN" = "ready" ] || [ "$CODECK_STATUS_DESIGN" = "locked" ]; then
  CODECK_NEXT="design"
  CODECK_NEXT_REASON="大纲就绪，可以生成了"
elif [ "$CODECK_STATUS_REVIEW" = "stale" ]; then
  CODECK_NEXT="review"
  CODECK_NEXT_REASON="幻灯片改过了，审稿需要重跑"
elif [ "$CODECK_STATUS_REVIEW" = "ready" ]; then
  CODECK_NEXT="review"
  CODECK_NEXT_REASON="成品出来了，该审稿了"
elif [ "$CODECK_STATUS_SPEECH" = "ready" ] && [ "$CODECK_SPEECH" = "none" ]; then
  CODECK_NEXT="speech"
  CODECK_NEXT_REASON="可以准备演讲稿了"
elif [ "$CODECK_STATUS_EXPORT" = "ready" ]; then
  CODECK_NEXT="export"
  CODECK_NEXT_REASON="可以导出了"
else
  CODECK_NEXT=""
  CODECK_NEXT_REASON="全部完成"
fi

# ─── 状态标记符号 ───
_icon() {
  case "$1" in
    done)   echo "done";;
    stale)  echo "STALE";;
    ready)  echo "ready";;
    locked) echo "---";;
    none)   echo "---";;
  esac
}

# ─── 结构化输出 ───
echo "DECK_DIR: $DECK_DIR"
echo "STATUS_OUTLINE: $CODECK_STATUS_OUTLINE"
echo "STATUS_DESIGN: $CODECK_STATUS_DESIGN"
echo "STATUS_REVIEW: $CODECK_STATUS_REVIEW"
echo "STATUS_EXPORT: $CODECK_STATUS_EXPORT"
echo "STATUS_SPEECH: $CODECK_STATUS_SPEECH"
[ -n "$CODECK_STALE" ] && echo "STALE: $CODECK_STALE"
[ -n "$CODECK_NEXT" ] && echo "NEXT: $CODECK_NEXT — $CODECK_NEXT_REASON"
[ -n "$CODECK_HTML_PATH" ] && echo "HTML: $CODECK_HTML_PATH"
