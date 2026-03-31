#!/usr/bin/env bash
# ─── codeck assemble ───
# 拼装 engine + AI 内容 → 单 HTML（自包含，含内联资源）
# 用法: assemble.sh <deck_dir> <title> [lang]
# 输出到 stdout，调用方重定向到文件

set -euo pipefail

DECK_DIR="$1"
TITLE="$2"
LANG="${3:-zh-CN}"
ENGINE_DIR="$(cd "$(dirname "$0")" && pwd)"

# 检查必需文件
[ -f "${DECK_DIR}/slides.html" ] || { echo "ERROR: ${DECK_DIR}/slides.html not found" >&2; exit 1; }
[ -f "${DECK_DIR}/custom.css" ] || { echo "ERROR: ${DECK_DIR}/custom.css not found" >&2; exit 1; }

# ─── 拼装到临时文件 ───

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
} > "$TMPFILE"

# ─── 内联资源（assets/ → base64 data URI） ───
# slides.html 里引用 assets/xxx.png 会变成 data:image/png;base64,...
# 使最终 HTML 完全自包含

if [ -d "${DECK_DIR}/assets" ]; then
  for asset in "${DECK_DIR}"/assets/*; do
    [ -f "$asset" ] || continue
    filename=$(basename "$asset")
    # 推断 MIME 类型
    case "${filename##*.}" in
      png)  mime="image/png" ;;
      jpg|jpeg) mime="image/jpeg" ;;
      gif)  mime="image/gif" ;;
      svg)  mime="image/svg+xml" ;;
      webp) mime="image/webp" ;;
      ico)  mime="image/x-icon" ;;
      *)    continue ;;  # 跳过非图片
    esac
    b64=$(base64 -w0 "$asset" 2>/dev/null || base64 "$asset" 2>/dev/null)
    datauri="data:${mime};base64,${b64}"
    # 替换 HTML 中的 assets/filename 引用（src="assets/..." 或 url(assets/...)）
    LC_ALL=C sed -i "s|assets/${filename}|${datauri}|g" "$TMPFILE" 2>/dev/null || \
    LC_ALL=C sed -i '' "s|assets/${filename}|${datauri}|g" "$TMPFILE" 2>/dev/null || true
  done
fi

cat "$TMPFILE"
