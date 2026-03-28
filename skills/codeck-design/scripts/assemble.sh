#!/usr/bin/env bash
# ─── codeck assemble ───
# 拼装 engine + AI 内容 → 单 HTML
# 用法: assemble.sh <deck_dir> <title> [lang]

set -euo pipefail

DECK_DIR="$1"
TITLE="$2"
LANG="${3:-zh-CN}"
ENGINE_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查必需文件
[ -f "${DECK_DIR}/slides.html" ] || { echo "ERROR: ${DECK_DIR}/slides.html not found" >&2; exit 1; }
[ -f "${DECK_DIR}/custom.css" ] || { echo "ERROR: ${DECK_DIR}/custom.css not found" >&2; exit 1; }

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
printf '\n/* ====== 设计系统 + 页面样式 ====== */\n'
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
