#!/usr/bin/env bash
# [INPUT]: accepts a project root whose files may become deck materials.
# [OUTPUT]: prints grouped candidate materials without mutating the project.
# [POS]: codeck/scripts material probe; feeds diagnosis and outline without reading room history.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
# codeck scan-materials — deterministic material scan for the current project.
# Usage: bash scan-materials.sh [ROOT]

set -euo pipefail

ROOT="${1:-.}"

_find_base() {
  find "$ROOT" -maxdepth 4 -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/.claude/*" \
    ! -path "*/.agents/*" \
    ! -path "*/.codeck/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/.next/*" \
    ! -path "*/.venv/*" \
    ! -name "CLAUDE.md" \
    ! -name "TODOS.md" \
    ! -name "DESIGN.md" \
    ! -name "*.test.*" \
    ! -name "*.spec.*" \
    ! -name "*.config.*" \
    2>/dev/null
}

_match_ext() {
  local re="$1"
  _find_base | awk -v re="$re" 'BEGIN { IGNORECASE=1 } $0 ~ re { print }' | sort
}

_section() {
  local name="$1"
  local re="$2"
  local limit="${3:-20}"
  local tmp
  tmp="$(mktemp)"
  _match_ext "$re" > "$tmp"
  printf '=== %s (%s) ===\n' "$name" "$(wc -l < "$tmp" | tr -d ' ')"
  sed -n "1,${limit}p" "$tmp"
  rm -f "$tmp"
}

_section "TEXT" '\.(md|txt|rtf|org|rst)$' 30
_section "DOCS" '\.(pdf|docx?|pptx?|key|pages|xlsx?|numbers)$' 20
_section "PSD" '\.(psd|psb)$' 20
_section "IMAGES" '\.(png|jpe?g|webp|gif|svg|ico|bmp|tiff?)$' 30
_section "DATA" '\.(csv|tsv|json|ya?ml|xml)$' 30
_section "MEDIA" '\.(mp4|mov|mp3|wav|m4a|webm)$' 10
