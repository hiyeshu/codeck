#!/usr/bin/env bash
# [INPUT]: accepts a deck room, file stem, language, and optional output directory.
# [OUTPUT]: writes one validated engine-assembled HTML file and prints its path.
# [POS]: codeck-design/scripts final-build guard; wraps assemble.sh so speaker mode cannot be skipped.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -euo pipefail

DECK_DIR="${1:?Usage: build-html.sh <deck_dir> <file_stem> [lang] [out_dir]}"
FILE_STEM="${2:?Usage: build-html.sh <deck_dir> <file_stem> [lang] [out_dir]}"
LANG="${3:-zh-CN}"
OUT_DIR="${4:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$FILE_STEM" in
  */*|*\\*|"") echo "ERROR: file_stem must be a plain filename stem" >&2; exit 1 ;;
esac

mkdir -p "$OUT_DIR"

slides="$DECK_DIR/slides.html"
css="$DECK_DIR/custom.css"
[ -f "$slides" ] || { echo "ERROR: missing slides source: $slides" >&2; exit 1; }
[ -f "$css" ] || { echo "ERROR: missing css source: $css" >&2; exit 1; }

grep -Eiq '<!doctype|<html[[:space:]>]|<head[[:space:]>]|<body[[:space:]>]|</html>|</body>' "$slides" && {
  echo "ERROR: slides.html must contain slide sections only, not a full HTML document" >&2
  exit 1
}
grep -Eiq '<script[[:space:]>]|<link[^>]*rel=["'\'']stylesheet' "$slides" && {
  echo "ERROR: slides.html must not contain scripts or stylesheet links; the fixed engine owns runtime and CSS assembly" >&2
  exit 1
}
grep -Eq '(^|[[:space:]])\.slide([[:space:],:{.#]|$)|(^|[[:space:]])#progress([[:space:],:{.#]|$)|(^|[[:space:]])\.mobile-nav([[:space:],:{.#]|$)|(^|[[:space:]])\.presenter-' "$css" && {
  echo "ERROR: custom.css must not override engine selectors (.slide, #progress, .mobile-nav, .presenter-*)" >&2
  exit 1
}

last_rev="$(
  find "$OUT_DIR" -maxdepth 1 -type f -name "${FILE_STEM}-r*.html" -print 2>/dev/null \
    | sed -E "s|^.*/${FILE_STEM}-r([0-9]+)\\.html$|\\1|" \
    | awk '/^[0-9]+$/ { if ($1 > max) max = $1 } END { print max + 0 }'
)"
rev=$((last_rev + 1))
out="${OUT_DIR%/}/${FILE_STEM}-r${rev}.html"

bash "$SCRIPT_DIR/assemble.sh" "$DECK_DIR" "$FILE_STEM" "$LANG" > "$out"

[ -s "$out" ] || { echo "ERROR: assembled HTML is empty: $out" >&2; exit 1; }

grep -q 'openPresenter' "$out" || { echo "ERROR: missing speaker mode engine marker: openPresenter" >&2; exit 1; }
grep -q 'codeck-presenter' "$out" || { echo "ERROR: missing speaker mode window marker: codeck-presenter" >&2; exit 1; }
grep -q 'BroadcastChannel' "$out" || { echo "ERROR: missing presenter sync marker: BroadcastChannel" >&2; exit 1; }
grep -qi '<link[^>]*rel=["'\'']stylesheet' "$out" && {
  echo "ERROR: final HTML must be self-contained; external stylesheet link found" >&2
  exit 1
}

printf '%s\n' "$out"
