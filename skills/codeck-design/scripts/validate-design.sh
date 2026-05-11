#!/usr/bin/env bash
# [INPUT]: accepts one DESIGN.md path produced by the design lane.
# [OUTPUT]: exits non-zero when the design archive is too thin or structurally invalid.
# [POS]: codeck-design/scripts design-archive guard; blocks CSS/HTML generation without real decisions.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -euo pipefail

DESIGN_MD="${1:?Usage: validate-design.sh <DESIGN.md>}"
[ -f "$DESIGN_MD" ] || { echo "ERROR: DESIGN.md not found: $DESIGN_MD" >&2; exit 1; }

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

nonblank=$(awk 'NF { n++ } END { print n + 0 }' "$DESIGN_MD")
[ "$nonblank" -ge 90 ] || fail "DESIGN.md is too short: ${nonblank} nonblank lines; expected at least 90"

fences=$(grep -c '^---[[:space:]]*$' "$DESIGN_MD" || true)
[ "$fences" -ge 2 ] || fail "DESIGN.md must start with YAML front matter delimited by ---"

for token in \
  'version:' 'name:' 'description:' \
  'colors:' 'primary:' 'secondary:' 'accent:' 'neutral:' 'surface-card:' 'surface-elevated:' \
  'typography:' 'display:' 'heading-1:' 'heading-2:' 'body:' 'caption:' 'font-heading:' 'font-body:' \
  'spacing:' 'base-unit:' 'slide-padding:' \
  'rounded:' 'components:'
do
  grep -q "^[[:space:]]*$token" "$DESIGN_MD" || fail "missing YAML token: $token"
done

required_sections=(
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

for section in "${required_sections[@]}"; do
  grep -qx "## $section" "$DESIGN_MD" || fail "missing section: ## $section"
done

for marker in \
  'Theme preset:' \
  'Layout recipes:' \
  'Component recipes:' \
  'Image prompt recipes:'
do
  grep -q "$marker" "$DESIGN_MD" || fail "missing visual recipe selection: $marker"
done

awk '
  /^## / {
    if (section != "") counts[section] = count
    section = substr($0, 4)
    count = 0
    next
  }
  section != "" && NF { count++ }
  END {
    if (section != "") counts[section] = count
    split("Overview|Colors|Typography|Layout|Elevation & Depth|Shapes|Components|Visual Effects|Image Assets|Do'\''s and Don'\''ts", required, "|")
    for (i = 1; i <= length(required); i++) {
      s = required[i]
      min = 4
      if (s == "Overview" || s == "Components" || s == "Visual Effects" || s == "Do'\''s and Don'\''ts") min = 8
      if ((counts[s] + 0) < min) {
        printf("ERROR: section ## %s is too thin: %d nonblank lines; expected at least %d\n", s, counts[s] + 0, min) > "/dev/stderr"
        exit 1
      }
    }
  }
' "$DESIGN_MD"

grep -Eiq '\b(TBD|TODO|placeholder|lorem ipsum|待定|占位)\b' "$DESIGN_MD" && \
  fail "DESIGN.md contains placeholder language"

grep -Eq 'Not applicable[[:space:]]*(\.|$)' "$DESIGN_MD" && \
  fail "Not applicable entries must include a concrete reason"

grep -Eiq 'Theme preset:[[:space:]]*(none|n/a|not applicable)' "$DESIGN_MD" && \
  fail "Theme preset must name a preset or custom-* reason"

grep -Eiq 'Layout recipes:[[:space:]]*(none|n/a|not applicable)' "$DESIGN_MD" && \
  fail "Layout recipes must name at least one recipe"

grep -Eiq 'Component recipes:[[:space:]]*(none|n/a|not applicable)' "$DESIGN_MD" && \
  fail "Component recipes must name at least one recipe"

printf 'DESIGN.md valid: %s\n' "$DESIGN_MD"
