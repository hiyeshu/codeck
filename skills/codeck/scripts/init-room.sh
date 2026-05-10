#!/usr/bin/env bash
# codeck init-room — create the slock-style deck room workspace.
# Usage: bash init-room.sh "$DECK_DIR"

set -euo pipefail

DECK_DIR="${1:?Usage: bash init-room.sh \$DECK_DIR}"
NOW="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles"

if [ ! -f "$DECK_DIR/MEMORY.md" ]; then
  cat > "$DECK_DIR/MEMORY.md" <<EOF
# Memory

## Active Context
- Current request:
- Active lane: @orchestrator
- Next:
- Blockers:

## Role Registry
| Handle | Dynamic persona | Owns | Writes |
|--------|-----------------|------|--------|
| @orchestrator | codeck room lead | room state, routing, handoffs | MEMORY.md, tasks, threads, channel, roles |
| @outline | fallback: curious magazine editor | narrative and deck content | deck.md, outline.md |
| @design | fallback: structural designer | design skeleton, visual system, HTML source | DESIGN.md, custom.css, slides.html |
| @review | fallback: senior publishing editor | audience resistance and QA | review.md, scoped source fixes |
| @speech | fallback: presentation coach | speech script and presenter notes | speech.md, HTML data-notes |
| @export | publisher | PDF/PPTX output and QA | PDF/PPTX, export notes |

## Latest Channel Summary
Room initialized at $NOW.

## Open Threads
| ID | Topic | Status | Decision |
|----|-------|--------|----------|

## Task Index
| Task | Owner | Status | Artifact | Handoff |
|------|-------|--------|----------|---------|

## Artifacts
- Source of truth:
- Current preview:
- Final exports:

## Assumed Defaults
- none

## AskUser Log
| Time | Moment | Answer | Source |
|------|--------|--------|--------|
EOF

  if [ -f "$DECK_DIR/PROJECT.md" ]; then
    {
      echo ""
      echo "## Legacy PROJECT.md Import"
      echo "Imported at $NOW. Keep this section only until the room memory has absorbed the useful decisions."
      echo ""
      sed 's/^/> /' "$DECK_DIR/PROJECT.md"
    } >> "$DECK_DIR/MEMORY.md"
  fi
fi

if [ ! -f "$DECK_DIR/tasks/tasks.md" ]; then
  cat > "$DECK_DIR/tasks/tasks.md" <<'EOF'
# Tasks

| ID | Task | Owner | Status | Artifact | Handoff |
|----|------|-------|--------|----------|---------|
EOF
fi

if [ ! -f "$DECK_DIR/threads/threads.md" ]; then
  cat > "$DECK_DIR/threads/threads.md" <<'EOF'
# Threads

| ID | Topic | Owner | Status | Decision |
|----|-------|-------|--------|----------|
EOF
fi

role_file() {
  local handle="$1"
  local owns="$2"
  local writes="$3"
  local path="$DECK_DIR/roles/${handle}.md"
  if [ ! -f "$path" ]; then
    cat > "$path" <<EOF
# @${handle}

## Owns
${owns}

## Writes
${writes}

## Dynamic Persona
Read diagnosis.md when present. Keep the fixed handle; let the persona shape judgment.
EOF
  fi
}

role_file "orchestrator" "room state, routing, task tickets, threads, handoffs" "MEMORY.md, tasks/tasks.md, threads/threads.md, channel/YYYY-MM-DD.md, roles/*.md"
role_file "outline" "narrative structure and canonical deck content" "deck.md and legacy outline.md"
role_file "design" "visual direction, design skeleton, design archive, HTML source, assembled HTML" "DESIGN.md, custom.css, slides.html, final HTML"
role_file "review" "audience resistance, quality review, scoped fixes" "review.md, scoped fixes to slides.html/custom.css"
role_file "speech" "talk track, presenter rhythm, fragment-synced notes" "speech.md, HTML data-notes"
role_file "export" "PDF/PPTX output and export QA" "PDF/PPTX files, export notes"

if ! grep -q '^## Current Skeleton' "$DECK_DIR/roles/design.md"; then
  cat >> "$DECK_DIR/roles/design.md" <<'EOF'

## Current Skeleton
- Name:
- Reason:
- Guardrails:
EOF
fi

today="$(date '+%Y-%m-%d')"
if [ ! -f "$DECK_DIR/channel/${today}.md" ]; then
  cat > "$DECK_DIR/channel/${today}.md" <<EOF
# Channel — ${today}

## ${NOW} — room initialized

@orchestrator
Deck room initialized. Waiting for the next task ticket.
EOF
fi
