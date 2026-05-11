# codeck — AI presentation skill

## Architecture

codeck outputs a **single HTML file**, built by `build-html.sh` wrapping `assemble.sh`:

| Author | File | Role |
|--------|------|------|
| Human (fixed) | `engine.js` + `engine.css` + `build-html.sh` | Navigation, fragments, overview, speaker mode, progress bar, final HTML validation |
| AI (per deck) | `custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| AI (per deck) | `slides.html` | `<section class="slide" data-notes="...">` free HTML |

Engine code is fixed. AI handles content and visuals only.

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

Skills install into the active runtime's skills directory. codeck scripts probe these locations in order: `~/.agents/skills/codeck*/`, `~/.codex/skills/codeck*/`, `~/.claude/skills/codeck*/`. The first match wins, so the same SKILL.md works under Cursor agents, Codex CLI, and Claude.

Two directories at runtime:
- **cwd** — the user's project. codeck reads materials here, writes final deliverables here (HTML, PDF, PPTX).
- **`~/.codeck/projects/{slug}/`** — codeck's deck room. Reads and writes MEMORY.md, channel/tasks/threads/roles, diagnosis.md, deck.md, DESIGN.md, custom.css, slides.html, review.md, and speech.md. Legacy outline.md is audit-only when found.

## Repository

```
codeck/
├── CLAUDE.md         # mirror of AGENTS.md for Claude runtime
├── AGENTS.md         # this file; agents/codex runtime entry
├── skills/
│   ├── CLAUDE.md      # Member list + changelog
│   ├── CONVENTIONS.md # Skill authoring conventions
│   ├── codeck/        # Entry dashboard
│   │   ├── CLAUDE.md  # Entry lane map
│   │   └── scripts/   # Room bootstrap + probes
│   ├── codeck-outline/
│   ├── codeck-design/
│   ├── codeck-review/
│   ├── codeck-export/
│   └── codeck-speech/
└── README.md
```
