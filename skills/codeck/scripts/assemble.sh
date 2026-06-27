#!/usr/bin/env bash
# [INPUT]: accepts a deck room with slides.html/custom.css plus fixed assets and render-engine.js.
# [OUTPUT]: writes one self-contained HTML document to stdout.
# [POS]: skills/codeck/scripts low-level assembler; build-html.sh owns validation and revision naming.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -euo pipefail

DECK_DIR="$1"
TITLE="$2"
LANG="${3:-zh-CN}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS_DIR="$SCRIPT_DIR/../assets"

# Check required files.
[ -f "${DECK_DIR}/slides.html" ] || { echo "ERROR: ${DECK_DIR}/slides.html not found" >&2; exit 1; }
[ -f "${DECK_DIR}/custom.css" ] || { echo "ERROR: ${DECK_DIR}/custom.css not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/base.css" ] || { echo "ERROR: ${ASSETS_DIR}/base.css not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/editor.css" ] || { echo "ERROR: ${ASSETS_DIR}/editor.css not found" >&2; exit 1; }
[ -f "${SCRIPT_DIR}/render-engine.js" ] || { echo "ERROR: ${SCRIPT_DIR}/render-engine.js not found" >&2; exit 1; }
[ -f "${SCRIPT_DIR}/editor-engine.js" ] || { echo "ERROR: ${SCRIPT_DIR}/editor-engine.js not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/icons.svg" ] || { echo "ERROR: ${ASSETS_DIR}/icons.svg not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/toolbar.html" ] || { echo "ERROR: ${ASSETS_DIR}/toolbar.html not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/presenter.html" ] || { echo "ERROR: ${ASSETS_DIR}/presenter.html not found" >&2; exit 1; }
[ -f "${ASSETS_DIR}/editor-toolbar.html" ] || { echo "ERROR: ${ASSETS_DIR}/editor-toolbar.html not found" >&2; exit 1; }

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

_inline_engine() {
  local line
  while IFS= read -r line; do
    if [ "$line" = "  /* __CODECK_EDITOR_ENGINE__ */" ]; then
      cat "${SCRIPT_DIR}/editor-engine.js"
    else
      printf '%s\n' "$line"
    fi
  done < "${SCRIPT_DIR}/render-engine.js"
}

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

cat "${ASSETS_DIR}/base.css"
cat "${ASSETS_DIR}/editor.css"
printf '\n/* ====== Design system + slide styles ====== */\n'
cat "${DECK_DIR}/custom.css"

cat <<'EOF'
</style>
</head>
<body>
<div id="app" style="opacity:0">
EOF

# ─── Inline icon sprite ───
cat "${ASSETS_DIR}/icons.svg"
printf '\n'

# ─── Inline HTML templates (engine reads these via <template>.innerHTML) ───
printf '<template id="ck-tpl-toolbar">\n'
cat "${ASSETS_DIR}/toolbar.html"
printf '\n</template>\n'
printf '<template id="ck-tpl-presenter">\n'
cat "${ASSETS_DIR}/presenter.html"
printf '\n</template>\n'
printf '<template id="ck-tpl-editor-toolbar">\n'
cat "${ASSETS_DIR}/editor-toolbar.html"
printf '\n</template>\n'

# ─── Slide content ───
cat "${DECK_DIR}/slides.html"

cat <<'EOF'
</div>
<script>
EOF

# ─── Engine constants: read inlined <template> elements ───
cat <<'EOF'
var TOOLBAR_HTML = document.getElementById('ck-tpl-toolbar').innerHTML;
var PRESENTER_HTML = document.getElementById('ck-tpl-presenter').innerHTML;
var EDITOR_TOOLBAR_HTML = document.getElementById('ck-tpl-editor-toolbar').innerHTML;
EOF

# ─── Engine code ───
_inline_engine

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
