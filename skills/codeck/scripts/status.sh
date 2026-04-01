#!/usr/bin/env bash
# codeck status — pipeline dashboard
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

CODECK_DIAGNOSIS=$(_has "$DECK_DIR/diagnosis.md" && echo done || echo none)
CODECK_OUTLINE=$(_has "$DECK_DIR/outline.md" && echo done || echo none)
CODECK_CSS=$(_has "$DECK_DIR/custom.css" && echo done || echo none)
CODECK_SLIDES=$(_has "$DECK_DIR/slides.html" && echo done || echo none)
CODECK_HTML_PATH=$(_html)
[ -n "$CODECK_HTML_PATH" ] && CODECK_HTML="done" || CODECK_HTML="none"
CODECK_SPEECH=$(_has "$DECK_DIR/speech.md" && echo done || echo none)

# ─── Stage status ───
# Pipeline order: outline → design → review → speech → export

_stage_design() {
  [ "$CODECK_HTML" = "done" ] || { [ "$CODECK_CSS" = "done" ] && echo done && return; }
  [ "$CODECK_HTML" = "done" ] && echo done || { [ "$CODECK_OUTLINE" = "done" ] && echo ready || echo locked; }
}

_stage_review() {
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

_stage_export() {
  [ "$CODECK_HTML" = "done" ] && echo ready || echo locked
}

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
CODECK_STATUS_SPEECH=$(_stage_speech)
CODECK_STATUS_EXPORT=$(_stage_export)

[ "$(_stage_design_stale)" = "stale" ] && [ "$CODECK_STATUS_DESIGN" = "done" ] && CODECK_STATUS_DESIGN=stale

# ─── NEXT recommendation ───
# Order: outline → design → review → speech → export
if [ "$CODECK_STATUS_OUTLINE" = "none" ]; then
  CODECK_NEXT="outline"
elif [ "$CODECK_STATUS_DESIGN" = "stale" ]; then
  CODECK_NEXT="design"
elif [ "$CODECK_STATUS_DESIGN" = "ready" ] || [ "$CODECK_STATUS_DESIGN" = "locked" ]; then
  CODECK_NEXT="design"
elif [ "$CODECK_HTML" = "done" ] && [ "$CODECK_SPEECH" = "none" ]; then
  CODECK_NEXT="review"
elif [ "$CODECK_STATUS_SPEECH" = "ready" ] && [ "$CODECK_SPEECH" = "none" ]; then
  CODECK_NEXT="speech"
elif [ "$CODECK_STATUS_EXPORT" = "ready" ]; then
  CODECK_NEXT="export"
else
  CODECK_NEXT=""
fi

# ─── Colors ───
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_GREEN='\033[32m'
C_YELLOW='\033[33m'
C_CYAN='\033[36m'
C_WHITE='\033[97m'

# ─── Title ───
_title="new deck"
if [ -f "$DECK_DIR/outline.md" ]; then
  _title=$(head -1 "$DECK_DIR/outline.md" | sed 's/^#* *//' | cut -c1-36)
elif [ -n "$CODECK_HTML_PATH" ]; then
  _title=$(basename "$CODECK_HTML_PATH" | sed 's/-r[0-9]*\.html$//')
fi

# ─── Meta line ───
_meta=""
if [ -f "$DECK_DIR/outline.md" ]; then
  _pages=$(grep -c '^## ' "$DECK_DIR/outline.md" 2>/dev/null || echo 0)
  [ "$_pages" -gt 0 ] && _meta="${_pages} pages"
fi
if [ -n "$CODECK_HTML_PATH" ]; then
  _rev=$(basename "$CODECK_HTML_PATH" | grep -o 'r[0-9]*' | tail -1)
  [ -n "$_rev" ] && { [ -n "$_meta" ] && _meta="$_meta · $_rev" || _meta="$_rev"; }
fi

# ─── Pipeline node ───
_node() {
  local name="$1" status="$2"
  case "$status" in
    done)   printf "${C_GREEN}✓ %s${C_RESET}" "$name" ;;
    stale)  printf "${C_YELLOW}⚠ %s${C_RESET}" "$name" ;;
    ready)  if [ "/codeck-$name" = "/codeck-$CODECK_NEXT" ]; then
              printf "${C_WHITE}${C_BOLD}● %s${C_RESET}" "$name"
            else
              printf "${C_DIM}%s${C_RESET}" "$name"
            fi ;;
    locked) printf "${C_DIM}%s${C_RESET}" "$name" ;;
    none)   if [ "/codeck-$name" = "/codeck-$CODECK_NEXT" ]; then
              printf "${C_WHITE}${C_BOLD}● %s${C_RESET}" "$name"
            else
              printf "${C_DIM}%s${C_RESET}" "$name"
            fi ;;
  esac
}

_sep() { printf " ${C_DIM}─${C_RESET} "; }

# ─── Render ───
_w=47
_hline=""
for _ in $(seq 1 $_w); do _hline="${_hline}─"; done

echo ""
printf "  ${C_DIM}┌%s┐${C_RESET}\n" "$_hline"

printf "  ${C_DIM}│${C_RESET} ${C_BOLD}codeck${C_RESET} ${C_DIM}·${C_RESET} %s" "$_title"
# pad to box width
_title_len=$((9 + ${#_title}))
_pad=$(( _w - _title_len ))
[ $_pad -gt 0 ] && printf "%${_pad}s" ""
printf " ${C_DIM}│${C_RESET}\n"

if [ -n "$_meta" ]; then
  printf "  ${C_DIM}│${C_RESET} ${C_DIM}%s${C_RESET}" "$_meta"
  _meta_len=$(( ${#_meta} + 1 ))
  _pad=$(( _w - _meta_len ))
  [ $_pad -gt 0 ] && printf "%${_pad}s" ""
  printf " ${C_DIM}│${C_RESET}\n"
fi

printf "  ${C_DIM}│${C_RESET}%${_w}s ${C_DIM}│${C_RESET}\n" ""

# pipeline flow
printf "  ${C_DIM}│${C_RESET} "
_node "outline" "$CODECK_STATUS_OUTLINE"
_sep
_node "design" "$CODECK_STATUS_DESIGN"
_sep
_node "review" "$CODECK_STATUS_REVIEW"
_sep
_node "speech" "$CODECK_STATUS_SPEECH"
_sep
_node "export" "$CODECK_STATUS_EXPORT"
printf " ${C_DIM}│${C_RESET}\n"

printf "  ${C_DIM}│${C_RESET}%${_w}s ${C_DIM}│${C_RESET}\n" ""

# next action
if [ -n "$CODECK_NEXT" ]; then
  printf "  ${C_DIM}│${C_RESET} ${C_CYAN}→ /codeck-%s${C_RESET}" "$CODECK_NEXT"
  _next_len=$(( 13 + ${#CODECK_NEXT} ))
  _pad=$(( _w - _next_len ))
  [ $_pad -gt 0 ] && printf "%${_pad}s" ""
  printf " ${C_DIM}│${C_RESET}\n"
else
  printf "  ${C_DIM}│${C_RESET} ${C_GREEN}✓ done${C_RESET}"
  printf "%$(( _w - 7 ))s" ""
  printf " ${C_DIM}│${C_RESET}\n"
fi

printf "  ${C_DIM}└%s┘${C_RESET}\n" "$_hline"
echo ""

# ─── Machine-readable exports (for AI) ───
echo "DECK_DIR: $DECK_DIR"
[ -n "$CODECK_HTML_PATH" ] && echo "HTML: $CODECK_HTML_PATH"
