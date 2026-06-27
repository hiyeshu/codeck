#!/usr/bin/env bash
# [INPUT]: accepts a deck room containing DESIGN.md, or an explicit DESIGN.md path.
# [OUTPUT]: exits 0 only when DESIGN.md has required tokens, ordered sections, recipes, and enough detail.
# [POS]: skills/codeck/scripts design gate; protects custom.css and slides.html from undocumented visual decisions.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -euo pipefail

target="${1:?Usage: validate-design.sh <deck_dir|DESIGN.md>}"
if [ -d "$target" ]; then
  design="$target/DESIGN.md"
else
  design="$target"
fi

[ -f "$design" ] || { echo "ERROR: missing DESIGN.md: $design" >&2; exit 1; }

fail() {
  echo "ERROR: DESIGN.md validation failed: $1" >&2
  exit 1
}

first_line="$(sed -n '1p' "$design")"
[ "$first_line" = "---" ] || fail "YAML front matter must start at line 1"

yaml_end="$(awk 'NR > 1 && $0 == "---" { print NR; exit }' "$design")"
[ -n "${yaml_end:-}" ] || fail "YAML front matter is not closed"
[ "$yaml_end" -le 80 ] || fail "YAML front matter is too large or malformed"

yaml="$(sed -n "1,${yaml_end}p" "$design")"
body="$(sed -n "$((yaml_end + 1)),\$p" "$design")"

for token in \
  '^version:' '^name:' '^description:' '^colors:' '^  primary:' '^  secondary:' '^  accent:' \
  '^typography:' '^  display:' '^  heading-1:' '^  body:' '^  font-heading:' '^  font-body:' \
  '^spacing:' '^  base-unit:' '^  slide-padding:' '^rounded:' '^components:'; do
  printf '%s\n' "$yaml" | grep -Eq "$token" || fail "missing token: $token"
done

sections=(
  "Overview"
  "Colors"
  "Typography"
  "Layout"
  "Elevation & Depth"
  "Shapes"
  "Components"
  "Visual Effects"
  "Image Assets"
  "Do's and Don'ts"
)

last_line=0
for section in "${sections[@]}"; do
  line="$(grep -n "^## ${section}$" "$design" | head -1 | cut -d: -f1 || true)"
  [ -n "$line" ] || fail "missing section: ## $section"
  [ "$line" -gt "$last_line" ] || fail "section out of order: ## $section"
  last_line="$line"
done

for marker in "Theme preset:" "Skeleton:" "Layout recipes:" "Component recipes:" "Image prompt recipes:"; do
  grep -q "$marker" "$design" || fail "missing required marker: $marker"
done

nonblank="$(printf '%s\n' "$body" | awk 'NF { count++ } END { print count + 0 }')"
[ "$nonblank" -ge 90 ] || fail "too thin: expected at least 90 nonblank body lines, found $nonblank"

grep -Eiq '\b(TBD|TODO|lorem|placeholder|to be decided|fix later)\b' "$design" && \
  fail "contains placeholder language"

echo "DESIGN.md validation passed: $design"
