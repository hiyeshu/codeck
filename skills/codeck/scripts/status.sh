#!/usr/bin/env bash
# codeck status — 所有 skill 共用的状态检测
# 用法: bash status.sh "$DECK_DIR"
# 输出: dashboard + 环境变量 CODECK_STATUS_*

DECK_DIR="${1:?用法: bash status.sh \$DECK_DIR}"

# ─── 文件检测 ───
_has() { [ -f "$1" ]; }
_html() {
  local f
  f=$(ls "$DECK_DIR"/*-r*.html 2>/dev/null | sort -V | tail -1)
  [ -n "$f" ] && echo "$f" && return 0
  return 1
}
_mtime() { stat -c '%Y' "$1" 2>/dev/null || stat -f '%m' "$1" 2>/dev/null; }

CODECK_DIAGNOSIS=$(_has "$DECK_DIR/diagnosis.md" && echo done || echo none)
CODECK_OUTLINE=$(_has "$DECK_DIR/outline.md" && echo done || echo none)
CODECK_CSS=$(_has "$DECK_DIR/custom.css" && echo done || echo none)
CODECK_SLIDES=$(_has "$DECK_DIR/slides.html" && echo done || echo none)
CODECK_HTML_PATH=$(_html)
[ -n "$CODECK_HTML_PATH" ] && CODECK_HTML="done" || CODECK_HTML="none"
CODECK_SPEECH=$(_has "$DECK_DIR/speech.md" && echo done || echo none)

# ─── 阶段状态（done / stale / ready / locked） ───
_stage_design() {
  [ "$CODECK_HTML" = "done" ] || { [ "$CODECK_CSS" = "done" ] && echo done && return; }
  [ "$CODECK_HTML" = "done" ] && echo done || { [ "$CODECK_OUTLINE" = "done" ] && echo ready || echo locked; }
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
CODECK_STATUS_EXPORT=$(_stage_export)
CODECK_STATUS_SPEECH=$(_stage_speech)

# 覆盖 design stale
[ "$(_stage_design_stale)" = "stale" ] && [ "$CODECK_STATUS_DESIGN" = "done" ] && CODECK_STATUS_DESIGN=stale

# ─── 偏差列表 ───
CODECK_STALE=""
[ "$CODECK_STATUS_DESIGN" = "stale" ] && CODECK_STALE="${CODECK_STALE}design "

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
elif [ "$CODECK_HTML" = "done" ] && [ "$CODECK_SPEECH" = "none" ]; then
  CODECK_NEXT="review"
  CODECK_NEXT_REASON="HTML 出来了，审一遍再继续"
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

# ─── 状态标记 ───
_icon() {
  case "$1" in
    done)   echo "done";;
    stale)  echo "STALE";;
    ready)  echo "ready";;
    locked) echo "---";;
    none)   echo "---";;
  esac
}

# ─── 推导 title ───
_title="new deck"
if [ -n "$CODECK_HTML_PATH" ]; then
  _title=$(basename "$CODECK_HTML_PATH" | sed 's/-r[0-9]*\.html$//')
elif [ -f "$DECK_DIR/outline.md" ]; then
  _title=$(head -1 "$DECK_DIR/outline.md" | sed 's/^#* *//' | cut -c1-40)
fi

# ─── Dashboard 输出 ───
echo ""
echo "+======================================================+"
printf "| %-52s |\n" "codeck · $_title"
echo "+======================================================+"
echo "| Stage              | Status    | Output               |"
echo "|--------------------|-----------|----------------------|"
printf "| %-18s | %-9s | %-20s |\n" "/codeck-outline" "$(_icon "$CODECK_STATUS_OUTLINE")" "outline.md"
_design_out="---"
[ -n "$CODECK_HTML_PATH" ] && _design_out=$(basename "$CODECK_HTML_PATH")
printf "| %-18s | %-9s | %-20s |\n" "/codeck-design" "$(_icon "$CODECK_STATUS_DESIGN")" "$_design_out"
printf "| %-18s | %-9s | %-20s |\n" "/codeck-review" "$(_icon "ready")" "(improves HTML)"
printf "| %-18s | %-9s | %-20s |\n" "/codeck-export" "$(_icon "$CODECK_STATUS_EXPORT")" ".pdf / .pptx"
printf "| %-18s | %-9s | %-20s |\n" "/codeck-speech" "$(_icon "$CODECK_STATUS_SPEECH")" "speech.md"
echo "+------------------------------------------------------+"
if [ -n "$CODECK_STALE" ]; then
  echo "| STALE: $CODECK_STALE"
  echo "+------------------------------------------------------+"
fi
if [ -n "$CODECK_NEXT" ]; then
  echo "| NEXT: /codeck-$CODECK_NEXT — $CODECK_NEXT_REASON"
else
  echo "| $CODECK_NEXT_REASON"
fi
echo "+======================================================+"
echo ""
echo "DECK_DIR: $DECK_DIR"
[ -n "$CODECK_HTML_PATH" ] && echo "HTML: $CODECK_HTML_PATH"
