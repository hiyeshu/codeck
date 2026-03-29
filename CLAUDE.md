# codeck — AI presentation skill

## Architecture

codeck outputs a **single HTML file**, assembled by `assemble.sh`:

| Author | File | Role |
|--------|------|------|
| Human (fixed) | `engine.js` + `engine.css` | Navigation, fragments, overview, speaker mode, progress bar |
| AI (per deck) | `custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| AI (per deck) | `slides.html` | `<section class="slide" data-notes="...">` free HTML |

Engine code is fixed. AI handles content and visuals only.

## Pipeline

```
Materials → content diagnosis (3 signals) → dynamic role selection
  ↓
outline.md (narrative structure + user intent)
  ↓
custom.css + slides.html → assemble.sh → single HTML
  ↓
review → export (PDF/PPTX) → speech
```

Core idea: skills handle process and format. Knowledge comes from dynamically summoned "people" — role names activate the AI's knowledge network.

## Three diagnostic signals

1. **Domain** — determines outline role
2. **Expression challenge** — determines design role
3. **Audience starting point** — determines review role (inverse: listener most likely to struggle)

## Directory structure

Skills installed at `~/.claude/skills/codeck*/`, project artifacts at `~/.codeck/projects/{slug}/`.

Key artifacts:
- `diagnosis.md` — content diagnosis + role recommendations
- `outline.md` — outline + user intent
- `{title}-r{n}.html` — design output (revision number increments)
- `design-notes.md` — design process + design-dna isomorphic mapping
- `speech.md` — speech transcript

## Repository

```
codeck/
├── setup              # Install script (symlinks skills → ~/.claude/skills/)
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
