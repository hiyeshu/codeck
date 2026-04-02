#!/usr/bin/env bash
# codeck status — pipeline dashboard (no ANSI colors, works everywhere)
# Usage: bash status.sh "$DECK_DIR"

DECK_DIR="${1:?Usage: bash status.sh \$DECK_DIR}"

# ─── File detection ───
_has() { [ -f "$1" ]; }
_html() {
  local f
  f=$(ls ./*-r*.html 2>/dev/null | sort -V | tail -1)
  [ -n "$f" ] && echo "$f" && return 0
  return 1
}
_mtime() { stat -c '%Y' "$1" 2>/dev/null || stat -f '%m' "$1" 2>/dev/null; }

CODECK_OUTLINE=$(_has "$DECK_DIR/outline.md" && echo done || echo none)
CODECK_CSS=$(_has "$DECK_DIR/custom.css" && echo done || echo none)
CODECK_SLIDES=$(_has "$DECK_DIR/slides.html" && echo done || echo none)
CODECK_HTML_PATH=$(_html)
[ -n "$CODECK_HTML_PATH" ] && CODECK_HTML="done" || CODECK_HTML="none"
CODECK_SPEECH=$(_has "$DECK_DIR/speech.md" && echo done || echo none)
CODECK_REVIEWED=$(_has "$DECK_DIR/.reviewed" && echo done || echo none)

# ─── Stage status ───
_stage_design() {
  if [ "$CODECK_HTML" = "done" ]; then echo done
  elif [ "$CODECK_OUTLINE" = "done" ]; then echo ready
  else echo locked; fi
}
_stage_review() {
  if [ "$CODECK_REVIEWED" = "done" ]; then echo done
  elif [ "$CODECK_HTML" = "done" ]; then echo ready
  else echo locked; fi
}
_stage_speech() {
  if [ "$CODECK_SPEECH" = "done" ]; then echo done
  elif [ "$CODECK_HTML" = "done" ] || [ "$CODECK_OUTLINE" = "done" ]; then echo ready
  else echo locked; fi
}
_stage_export() {
  [ "$CODECK_HTML" = "done" ] && echo ready || echo locked
}

# Stale detection
_stage_design_stale() {
  if [ "$CODECK_HTML" = "done" ] && [ "$CODECK_OUTLINE" = "done" ] && [ -n "$CODECK_HTML_PATH" ]; then
    local t_outline=$(_mtime "$DECK_DIR/outline.md")
    local t_html=$(_mtime "$CODECK_HTML_PATH")
    [ "$t_outline" -gt "$t_html" ] 2>/dev/null && echo stale && return
  fi
  echo ok
}
_stage_review_stale() {
  if [ "$CODECK_REVIEWED" = "done" ] && [ "$CODECK_HTML" = "done" ] && [ -n "$CODECK_HTML_PATH" ]; then
    local t_reviewed=$(_mtime "$DECK_DIR/.reviewed")
    local t_html=$(_mtime "$CODECK_HTML_PATH")
    [ "$t_html" -gt "$t_reviewed" ] 2>/dev/null && echo stale && return
  fi
  echo ok
}

CODECK_STATUS_OUTLINE=$( [ "$CODECK_OUTLINE" = "done" ] && echo done || echo none )
CODECK_STATUS_DESIGN=$(_stage_design)
CODECK_STATUS_REVIEW=$(_stage_review)
CODECK_STATUS_SPEECH=$(_stage_speech)
CODECK_STATUS_EXPORT=$(_stage_export)

[ "$(_stage_design_stale)" = "stale" ] && [ "$CODECK_STATUS_DESIGN" = "done" ] && CODECK_STATUS_DESIGN=stale
[ "$(_stage_review_stale)" = "stale" ] && [ "$CODECK_STATUS_REVIEW" = "done" ] && CODECK_STATUS_REVIEW=stale

# ─── NEXT recommendation ───
if [ "$CODECK_STATUS_OUTLINE" = "none" ]; then
  CODECK_NEXT="outline"
elif [ "$CODECK_STATUS_DESIGN" = "stale" ]; then
  CODECK_NEXT="design"
elif [ "$CODECK_STATUS_DESIGN" = "ready" ] || [ "$CODECK_STATUS_DESIGN" = "locked" ]; then
  CODECK_NEXT="design"
elif [ "$CODECK_STATUS_REVIEW" = "stale" ]; then
  CODECK_NEXT="review"
elif [ "$CODECK_STATUS_REVIEW" = "ready" ]; then
  CODECK_NEXT="review"
elif [ "$CODECK_STATUS_SPEECH" = "ready" ] && [ "$CODECK_SPEECH" = "none" ]; then
  CODECK_NEXT="speech"
elif [ "$CODECK_STATUS_EXPORT" = "ready" ]; then
  CODECK_NEXT="export"
else
  CODECK_NEXT=""
fi

# ─── Title ───
_title="new deck"
if [ -f "$DECK_DIR/outline.md" ]; then
  _title=$(head -1 "$DECK_DIR/outline.md" | sed 's/^#* *//' | cut -c1-36)
elif [ -n "$CODECK_HTML_PATH" ]; then
  _title=$(basename "$CODECK_HTML_PATH" | sed 's/-r[0-9]*\.html$//')
fi

# ─── Meta ───
_meta=""
if [ -f "$DECK_DIR/outline.md" ]; then
  _pages=$(grep -c '^## ' "$DECK_DIR/outline.md" 2>/dev/null || echo 0)
  [ "$_pages" -gt 0 ] && _meta="${_pages}p"
fi
if [ -n "$CODECK_HTML_PATH" ]; then
  _rev=$(basename "$CODECK_HTML_PATH" | grep -o 'r[0-9]*' | tail -1)
  [ -n "$_rev" ] && { [ -n "$_meta" ] && _meta="$_meta $_rev" || _meta="$_rev"; }
fi

# ─── Symbol per status ───
#   done → ✓    stale → !    next → ● (bold)    waiting → ○
# Bold only on next step. Symbols carry meaning if ANSI fails.
B='\033[1m'
R='\033[0m'
_sym() {
  local name="$1" status="$2"
  case "$status" in
    done)  printf "✓ %s" "$name" ;;
    stale) printf "! %s" "$name" ;;
    *)     if [ "$name" = "$CODECK_NEXT" ]; then
             printf "${B}● %s${R}" "$name"
           else
             printf "○ %s" "$name"
           fi ;;
  esac
}

# ─── Render ───
echo ""
_header="  codeck  ${_title}"
[ -n "$_meta" ] && _header="${_header}  $_meta"
echo "$_header"
echo ""
printf "  "
_sym outline "$CODECK_STATUS_OUTLINE"; printf "  "
_sym design "$CODECK_STATUS_DESIGN"; printf "  "
_sym review "$CODECK_STATUS_REVIEW"; printf "  "
_sym speech "$CODECK_STATUS_SPEECH"; printf "  "
_sym export "$CODECK_STATUS_EXPORT"
echo ""
echo ""
if [ -n "$CODECK_NEXT" ]; then
  echo "  → /codeck-${CODECK_NEXT}"
else
  echo "  ✓ all done"
fi
echo ""

# ─── Machine-readable exports (for AI) ───
echo "DECK_DIR: $DECK_DIR"
[ -n "$CODECK_HTML_PATH" ] && echo "HTML: $CODECK_HTML_PATH"
exit 0
