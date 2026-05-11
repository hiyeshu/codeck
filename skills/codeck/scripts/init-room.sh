#!/usr/bin/env bash
# [INPUT]: accepts one deck-room path and optional legacy PROJECT.md state.
# [OUTPUT]: creates MEMORY.md, channel, tasks, threads, and role memory files.
# [POS]: codeck/scripts bootstrapper that gives every runtime a durable room scope.
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
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

## Room Truth Contract
- Current truth: MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, latest assembled HTML, speech.md when present.
- Work state: diagnosis.md current material reading, tasks/tasks.md active tickets, threads/threads.md open decisions and decision ledger, roles/*.md lane memory, latest valid review.md.
- Audit only: channel/YYYY-MM-DD.md, legacy PROJECT.md, legacy outline.md, legacy design-notes.md, superseded reviews, old previews, project-root sibling CSS.
- Rule: audit text never overrides current truth; legacy outline.md is never a generation source.

## Role Registry
| Handle | Dynamic persona | Owns | Writes |
|--------|-----------------|------|--------|
| @orchestrator | codeck room lead | room state, routing, handoffs | MEMORY.md, tasks, threads, channel, roles |
| @outline | fallback: curious magazine editor | narrative and deck content | deck.md |
| @design | fallback: structural designer | design skeleton, visual system, HTML source | DESIGN.md, custom.css, slides.html |
| @review | fallback: senior publishing editor | audience resistance and QA | review.md, scoped source fixes |
| @speech | fallback: presentation coach | speech script and presenter notes | speech.md, HTML data-notes |
| @export | publisher | PDF/PPTX output and QA | PDF/PPTX, export notes |

## Latest Channel Summary
Room initialized at $NOW.

## Open Threads
| ID | Kind | Owner | Status | Blocking | Writes To | Decision |
|----|------|-------|--------|----------|-----------|----------|

## Task Index
| Task | Owner | Status | Artifact | Handoff |
|------|-------|--------|----------|---------|

## Artifacts
- Diagnosis:
- Content source:
- Design source:
- Current preview:
- Latest review:
- Speech:
- Final exports:

## Assumed Defaults
- none

## Decision Log
| Time | ID | Moment | Resolution | Source |
|------|----|--------|------------|--------|
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

if [ -f "$DECK_DIR/MEMORY.md" ]; then
  tmp="$(mktemp)"
  sed \
    -e 's/- Audit only: channel\/YYYY-MM-DD.md, legacy PROJECT.md, legacy design-notes.md, superseded reviews, old previews, project-root sibling CSS./- Audit only: channel\/YYYY-MM-DD.md, legacy PROJECT.md, legacy outline.md, legacy design-notes.md, superseded reviews, old previews, project-root sibling CSS./' \
    -e 's/- Rule: audit text never overrides current truth; outline.md is read only when deck.md is missing./- Rule: audit text never overrides current truth; legacy outline.md is never a generation source./' \
    -e 's/| @outline | fallback: curious magazine editor | narrative and deck content | deck.md, outline.md |/| @outline | fallback: curious magazine editor | narrative and deck content | deck.md |/' \
    "$DECK_DIR/MEMORY.md" > "$tmp"
  mv "$tmp" "$DECK_DIR/MEMORY.md"
fi

if ! grep -q '^## Room Truth Contract' "$DECK_DIR/MEMORY.md"; then
  cat >> "$DECK_DIR/MEMORY.md" <<'EOF'

## Room Truth Contract
- Current truth: MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, latest assembled HTML, speech.md when present.
- Work state: diagnosis.md current material reading, tasks/tasks.md active tickets, threads/threads.md open decisions and decision ledger, roles/*.md lane memory, latest valid review.md.
- Audit only: channel/YYYY-MM-DD.md, legacy PROJECT.md, legacy outline.md, legacy design-notes.md, superseded reviews, old previews, project-root sibling CSS.
- Rule: audit text never overrides current truth; legacy outline.md is never a generation source.
EOF
fi

if [ ! -f "$DECK_DIR/tasks/tasks.md" ]; then
  cat > "$DECK_DIR/tasks/tasks.md" <<'EOF'
# Tasks

Live claim tickets only. Closed history belongs in MEMORY.md summaries or channel.

| ID | Task | Owner | Status | Artifact | Handoff |
|----|------|-------|--------|----------|---------|
EOF
fi

if ! grep -q '^Live claim tickets only\.' "$DECK_DIR/tasks/tasks.md"; then
  {
    echo ""
    echo "Live claim tickets only. Closed history belongs in MEMORY.md summaries or channel."
  } >> "$DECK_DIR/tasks/tasks.md"
fi

if [ ! -f "$DECK_DIR/threads/threads.md" ]; then
  cat > "$DECK_DIR/threads/threads.md" <<'EOF'
# Threads

Open decisions plus Decision Ask ledger. Normal reads use open rows only; resolved decisions must be copied into the owned source and MEMORY.md Decision Log, then marked answered/defaulted/superseded here.

| ID | Kind | Owner | Status | Blocking | Writes To | Decision |
|----|------|-------|--------|----------|-----------|----------|

Decision Ask entries must also include a detail block below the table:

```markdown
### D-YYYYMMDD-NN — {Moment}
- Reason:
- Current read:
- Recommendation:
- Options:
  - A:
  - B:
  - C:
- Default:
- Runtime:
```
EOF
fi

if ! grep -q '^Open decisions plus Decision Ask ledger\.' "$DECK_DIR/threads/threads.md"; then
  {
    echo ""
    echo "Open decisions plus Decision Ask ledger. Normal reads use open rows only; resolved decisions must be copied into the owned source and MEMORY.md Decision Log, then marked answered/defaulted/superseded here."
  } >> "$DECK_DIR/threads/threads.md"
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

## Read Scope
Read current truth and live work state first. Treat channel/YYYY-MM-DD.md as audit evidence only, not generation truth.
EOF
  fi
}

role_file "orchestrator" "room state, routing, task tickets, threads, handoffs" "MEMORY.md, tasks/tasks.md, threads/threads.md, channel/YYYY-MM-DD.md, roles/*.md"
role_file "outline" "narrative structure and canonical deck content" "deck.md"
role_file "design" "visual direction, design skeleton, design archive, HTML source, assembled HTML" "DESIGN.md, custom.css, slides.html, final HTML"
role_file "review" "audience resistance, quality review, scoped fixes" "review.md, scoped fixes to slides.html/custom.css"
role_file "speech" "talk track, presenter rhythm, fragment-synced notes" "speech.md, HTML data-notes"
role_file "export" "PDF/PPTX output and export QA" "PDF/PPTX files, export notes"

for path in "$DECK_DIR"/roles/*.md; do
  [ -f "$path" ] || continue
  if ! grep -q '^## Read Scope' "$path"; then
    cat >> "$path" <<'EOF'

## Read Scope
Read current truth and live work state first. Treat channel/YYYY-MM-DD.md as audit evidence only, not generation truth.
EOF
  fi
done

if [ -f "$DECK_DIR/roles/outline.md" ] && grep -q 'legacy outline.md' "$DECK_DIR/roles/outline.md"; then
  tmp="$(mktemp)"
  sed 's/deck.md and legacy outline.md/deck.md/' "$DECK_DIR/roles/outline.md" > "$tmp"
  mv "$tmp" "$DECK_DIR/roles/outline.md"
fi

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

Audit trail only. Current truth lives in MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, and the latest assembled HTML.

## ${NOW} — room initialized

@orchestrator
Deck room initialized. Waiting for the next task ticket.
EOF
fi

if ! grep -q '^Audit trail only\.' "$DECK_DIR/channel/${today}.md"; then
  {
    echo ""
    echo "Audit trail only. Current truth lives in MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, and the latest assembled HTML."
  } >> "$DECK_DIR/channel/${today}.md"
fi
