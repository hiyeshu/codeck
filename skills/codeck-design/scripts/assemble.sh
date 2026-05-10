#!/usr/bin/env bash
# ─── codeck assemble ───
# Assemble engine + AI content into one self-contained HTML file.
# Usage: assemble.sh <deck_dir> <title> [lang]
# Writes to stdout; callers redirect to a file.

set -euo pipefail

DECK_DIR="$1"
TITLE="$2"
LANG="${3:-zh-CN}"
ENGINE_DIR="$(cd "$(dirname "$0")" && pwd)"

_base64_one_line() {
  local file="$1"
  if base64 --help 2>&1 | grep -q -- '-w'; then
    base64 -w0 "$file"
  elif base64 -i "$file" >/dev/null 2>&1; then
    base64 -i "$file" | tr -d '\n'
  elif command -v openssl >/dev/null 2>&1; then
    openssl base64 -A -in "$file"
  else
    base64 "$file" | tr -d '\n'
  fi
}

# Check required files.
[ -f "${DECK_DIR}/slides.html" ] || { echo "ERROR: ${DECK_DIR}/slides.html not found" >&2; exit 1; }
[ -f "${DECK_DIR}/custom.css" ] || { echo "ERROR: ${DECK_DIR}/custom.css not found" >&2; exit 1; }

# ─── Assemble to temp file ───

TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

{
cat <<EOF
<!DOCTYPE html>
<html lang="${LANG}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${TITLE}</title>
<style>
EOF

cat "${ENGINE_DIR}/engine.css"
printf '\n/* ====== Design system + slide styles ====== */\n'
cat "${DECK_DIR}/custom.css"

cat <<'EOF'
</style>
</head>
<body>
<div id="app" style="opacity:0">
EOF

cat "${DECK_DIR}/slides.html"

cat <<'EOF'
</div>
<script>
EOF

cat "${ENGINE_DIR}/engine.js"

cat <<'EOF'
</script>
</body>
</html>
EOF
} > "$TMPFILE"

# ─── Inline assets (assets/ → base64 data URI) ───
# References to assets/xxx.png in slides.html become data:image/png;base64,...
# This keeps the final HTML self-contained.

if [ -d "${DECK_DIR}/assets" ]; then
  for asset in "${DECK_DIR}"/assets/*; do
    [ -f "$asset" ] || continue
    filename=$(basename "$asset")
    # Infer MIME type.
    case "${filename##*.}" in
      png)  mime="image/png" ;;
      jpg|jpeg) mime="image/jpeg" ;;
      gif)  mime="image/gif" ;;
      svg)  mime="image/svg+xml" ;;
      webp) mime="image/webp" ;;
      ico)  mime="image/x-icon" ;;
      *)    continue ;;  # Skip non-images.
    esac
    b64=$(_base64_one_line "$asset")
    datauri="data:${mime};base64,${b64}"
    # Replace assets/filename references in HTML (src="assets/..." or url(assets/...)).
    LC_ALL=C sed -i "s|assets/${filename}|${datauri}|g" "$TMPFILE" 2>/dev/null || \
    LC_ALL=C sed -i '' "s|assets/${filename}|${datauri}|g" "$TMPFILE" 2>/dev/null || true
  done
fi

cat "$TMPFILE"
