# codeck — AI presentation skill

## Architecture

codeck outputs a **single HTML file**, assembled by `assemble.sh`:

| Author | File | Role |
|--------|------|------|
| Human (fixed) | `engine.js` + `engine.css` | Navigation, fragments, overview, speaker mode, progress bar |
| AI (per deck) | `custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| AI (per deck) | `slides.html` | `<section class="slide" data-notes="...">` free HTML |

Engine code is fixed. AI handles content and visuals only.

## Deck room

```
/codeck opens ~/.codeck/projects/{slug}/
  ↓
MEMORY.md + channel/ + tasks/ + threads/ + roles/
  ↓
@outline → deck.md (+ legacy outline.md)
  ↓
@design → DESIGN.md + custom.css + slides.html → assemble.sh → single HTML
  ↓
@review → export (PDF/PPTX) / speech
```

Core idea: fixed role lanes own artifacts; dynamic people from diagnosis.md shape the judgment inside those lanes.

## Three diagnostic signals

1. **Domain** — determines outline role
2. **Expression challenge** — determines design role
3. **Audience starting point** — determines review role (inverse: listener most likely to struggle)

## Directory structure

Skills installed at `~/.claude/skills/codeck*/`.

Two directories at runtime:
- **cwd** — the user's project. codeck reads materials here, writes final deliverables here (HTML, PDF, PPTX).
- **`~/.codeck/projects/{slug}/`** — codeck's deck room. Reads and writes MEMORY.md, channel/tasks/threads/roles, diagnosis.md, deck.md, legacy outline.md, DESIGN.md, custom.css, slides.html, review.md, and speech.md.

## Repository

```
codeck/
├── CLAUDE.md
├── skills/
│   ├── CLAUDE.md      # Member list + changelog
│   ├── CONVENTIONS.md # Skill authoring conventions
│   ├── codeck/        # Entry dashboard
│   ├── codeck-outline/
│   ├── codeck-design/
│   ├── codeck-review/
│   ├── codeck-export/
│   └── codeck-speech/
└── README.md
```
