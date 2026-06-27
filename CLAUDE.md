# codeck — AI presentation skill

## Architecture

codeck outputs a **single self-contained HTML file**, built by `build-html.sh` wrapping `assemble.sh`:

| Author | File | Role |
|--------|------|------|
| Human (fixed) | `render-engine.js` + `assets/base.css` + `build-html.sh` + `validate-design.sh` | Navigation, fragments, overview, speaker mode, editor mode, progress bar, design/build validation |
| Human (fixed) | `assets/toolbar.html`, `assets/presenter.html`, `assets/editor-toolbar.html`, `assets/icons.svg` | Toolbar, speaker-mode, editor-mode, and icon fragments inlined at build time |
| Human (fixed) | `scripts/office/soffice.py` + `scripts/thumbnail.py` | PDF/PPTX export bridge and visual QA thumbnails |
| AI (per deck) | `custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| AI (per deck) | `slides.html` | `<section class="slide" data-notes="...">` free HTML |

Engine code is fixed. AI handles content and visuals only.

## Plugin shape

codeck follows the Cowart-style repository shape:

- `.codex-plugin/plugin.json` is the Codex plugin manifest.
- `skills/` is the installable skill surface exposed by the plugin.
- `skills/codeck/` is the single user-facing skill.
- No MCP server or frontend app is declared until there is a real local service to run.

## Deck room

```
/codeck opens ~/.codeck/projects/{slug}/
  ↓
MEMORY.md + channel/ + tasks/ + threads/ + roles/
  ↓
Decision Ask records live in threads/ before any runtime question
  ↓
@outline → deck.md
  ↓
@design → DESIGN.md + custom.css + slides.html → build-html.sh → single HTML
  ↓
@review → export (PDF/PPTX) / speech
```

Core idea: fixed role lanes own artifacts; dynamic people from diagnosis.md shape the judgment inside those lanes. The room is the durable scope; necessary asks are decision records first and UI questions second.

Room documents have rank:
- Current truth: MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, latest assembled HTML, speech.md when present.
- Work state: diagnosis.md, active tasks, open threads plus the Decision Ask ledger, roles/*.md, latest valid review.md.
- Audit trail: channel/YYYY-MM-DD.md, legacy PROJECT.md, legacy design-notes.md, superseded reviews, and old previews. Audit never overrides current truth.

## Three diagnostic signals

1. **Domain** — determines outline role
2. **Expression challenge** — determines design role
3. **Audience starting point** — determines review role (inverse: listener most likely to struggle)

## Directory structure

The single codeck skill installs into the active runtime's skills directory. codeck probes these locations in order: `~/.agents/skills/codeck/`, `~/.codex/skills/codeck/`, `~/.claude/skills/codeck/`. The first match wins, so the same SKILL.md works under Cursor agents, Codex CLI, and Claude. No glob — one skill directory.

Two directories at runtime:
- **cwd** — the user's project. codeck reads materials here, writes final deliverables here (HTML, PDF, PPTX).
- **`~/.codeck/projects/{slug}/`** — codeck's deck room. Reads and writes MEMORY.md, channel/tasks/threads/roles, diagnosis.md, deck.md, DESIGN.md, custom.css, slides.html, review.md, and speech.md. Legacy outline.md is audit-only when found.

## Repository

```
codeck/
├── CLAUDE.md         # mirror of AGENTS.md for Claude runtime
├── AGENTS.md         # agents/codex runtime entry
├── .codex-plugin/
│   ├── CLAUDE.md
│   ├── plugin.json   # Codex plugin manifest
│   └── assets/
│       ├── CLAUDE.md
│       └── app-icon.svg
├── skills/
│   ├── CLAUDE.md
│   └── codeck/       # single consolidated skill
│       ├── CLAUDE.md
│       ├── SKILL.md
│       ├── references/
│       │   ├── CLAUDE.md
│       │   ├── workflow.md   # room contract + outline lane
│       │   ├── design.md     # design lane + recipe library
│       │   └── delivery.md   # review + export + speech lanes
│       ├── scripts/
│       │   ├── CLAUDE.md
│       │   ├── assemble.sh
│       │   ├── build-html.sh
│       │   ├── validate-design.sh
│       │   ├── render-engine.js
│       │   ├── thumbnail.py
│       │   └── office/
│       │       ├── CLAUDE.md
│       │       └── soffice.py
│       └── assets/
│           ├── CLAUDE.md
│           ├── toolbar.html
│           ├── presenter.html
│           ├── editor-toolbar.html
│           ├── icons.svg
│           └── base.css
└── README.md
```
