---
name: codeck
version: 3.0.0
description: |
  codeck opens a persistent deck room and runs the full presentation lifecycle:
  bootstrap, outline, design, review, export, and speech. Use when the user says
  "codeck", "new deck", "make a presentation", "build slides", "outline",
  "design slides", "review", "export", "speech", or wants to continue a
  presentation project.
---

<!--
[INPUT]: 依赖 cwd 素材、~/.codeck/projects/{slug} room 文件与固定 scripts/assets。
[OUTPUT]: 提供 /codeck 入口协议、lane 路由和 workflow/design/delivery 引用指针。
[POS]: skills/codeck 入口层,单 skill 门面覆盖内部角色 lane 与确定性构建工具。
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# codeck

codeck is one user-facing skill. It opens a durable deck room, routes the request to the right lane, and keeps final artifacts rebuildable from room files.

## Room

- **cwd**: user materials and final exports.
- **`~/.codeck/projects/{slug}/`**: `MEMORY.md`, `channel/`, `tasks/`, `threads/`, `roles/`, `diagnosis.md`, `deck.md`, `DESIGN.md`, `custom.css`, `slides.html`, `review.md`, `speech.md`.

Room document rank and bootstrap details live in `references/workflow.md`. Cowart is the precedent: runtime code lives in the skill/plugin, project state lives in the active user workbench.

## Lanes

| Handle | Owns | Writes |
|--------|------|--------|
| `@orchestrator` | room state, routing, tasks, threads, handoffs | `MEMORY.md`, `tasks/tasks.md`, `threads/threads.md`, `channel/YYYY-MM-DD.md`, `roles/*.md` |
| `@outline` | narrative and slide structure | `deck.md` |
| `@design` | visual system and HTML source | `DESIGN.md`, `custom.css`, `slides.html` |
| `@review` | audience resistance, QA, scoped fixes | `review.md`, scoped fixes to `slides.html` / `custom.css` |
| `@speech` | talk track and speaker notes | `speech.md`, HTML `data-notes` |
| `@export` | PDF/PPTX export and QA | PDF/PPTX files, export notes |

Dynamic personas live in `diagnosis.md`; fixed handles own the write boundary.

## Routing

| User intent | Action | Decision Ask |
|-------------|--------|--------------|
| New or continue deck | open room -> scan -> diagnose -> outline -> design -> review | Deck Intent / Design Direction only if needed, max 2 rounds |
| Content edit | edit `deck.md` -> rebuild -> review | none |
| Visual style change | update `DESIGN.md` -> rebuild -> review | Design Direction if direction is not clear |
| Export | export latest valid HTML | Export Format only when PDF/PPTX/all is missing |
| Speech | create `speech.md` and sync notes | Speech Style only when style/duration is missing |

Decision Ask is a room-scoped decision record first, UI question second. Never ask for permission to scan, generate HTML, save files, run review, or use existing materials.

## Setup

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in "$HOME/.agents/skills/codeck" "$HOME/.codex/skills/codeck" "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found" >&2; exit 1; }
mkdir -p "$DECK_DIR"/{channel,tasks,threads,roles}
```

Initialize missing room files from `references/workflow.md` before any Decision Ask. Scan cwd, excluding `.git`, `node_modules`, and the deck room.

## Fixed Runtime

codeck outputs a single self-contained HTML file:

- `scripts/assemble.sh`: inline `assets/*.html`, `icons.svg`, runtime CSS, `slides.html`, and runtime JS.
- `scripts/build-html.sh`: revisioned final build guard; rejects full-doc `slides.html`, runtime scripts, engine selector overrides, missing presenter/editor markers, and external stylesheet links.
- `scripts/validate-design.sh`: DESIGN.md validator; run before writing `custom.css` / `slides.html`.
- `scripts/office/soffice.py`: LibreOffice wrapper for PDF/PPTX export.
- `scripts/thumbnail.py`: PDF/PPTX thumbnail helper for export QA.
- `assets/`: build-time UI fragments and icons; no runtime `fetch()`.

AI writes only `DESIGN.md`, `custom.css`, and `slides.html`. Engine JS/CSS/assets are fixed.

## Editor & feedback loop

The assembled HTML is an in-browser editing surface: press **E** for text/image edits, **M** for marks, Save for an edited snapshot, Feedback for a `feedback-*.md` sidecar. Consumption rules live in `references/workflow.md` -> "Feedback consumption".

## References

- `references/workflow.md`: room contract, Decision Ask policy, material scan, diagnosis, outline lane.
- `references/design.md`: design lane, DESIGN.md schema, recipes, build rules.
- `references/delivery.md`: review, export, and speech lanes.

## Response

Keep user output compact: state, action, artifact, next lane. Before responding, update `MEMORY.md`, `tasks/tasks.md`, `threads/threads.md` if needed, and today's channel file.
