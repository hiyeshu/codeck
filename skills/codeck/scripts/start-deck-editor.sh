#!/usr/bin/env bash
# [INPUT]: accepts an optional deck room path, file stem, and CODECK_EDITOR_PORT.
# [OUTPUT]: starts the local codeck deck editor HTTP service and prints its URL.
# [POS]: skills/codeck/scripts launcher for the browser-visible deck collaboration service.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

set -euo pipefail

CALLER_DIR="$PWD"
DECK_DIR="${1:-$HOME/.codeck/projects/$(basename "$CALLER_DIR")}"
FILE_STEM="${2:-$(basename "$DECK_DIR")}"
PORT="${CODECK_EDITOR_PORT:-43218}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export CODECK_DECK_DIR="$DECK_DIR"

echo "codeck deck editor: http://127.0.0.1:${PORT}/"
echo "codeck deck room: ${DECK_DIR}"
exec node "$SCRIPT_DIR/deck-editor-server.mjs" "$DECK_DIR" "$FILE_STEM" "$PORT"
