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

Skills resolve their install location in this order: `CODECK_SKILL_DIR` / `CODECK_DESIGN_DIR` / `CODECK_EXPORT_DIR` env overrides → `${CLAUDE_PLUGIN_ROOT}/skills/*` (Claude Code plugin install) → plugin cache globs (`~/.claude/plugins/cache/*/codeck/*/skills/*`, `~/.codex/plugins/cache/*/codeck/*/skills/*`) → flat installs (`~/.agents/skills/codeck*/`, `~/.codex/skills/codeck*/`, `~/.claude/skills/codeck*/`). The first match wins, so the same SKILL.md works as a Claude Code plugin, a Codex plugin, or a flat skills.sh install. Sibling lane directories are derived by `codeck/scripts/resolve-dirs.sh` (siblings hold in every layout), sourced from each skill's unified Setup bootstrap block.

Two directories at runtime:
- **cwd** — the user's project. codeck reads materials here, writes final deliverables here (HTML, PDF, PPTX).
- **`~/.codeck/projects/{slug}/`** — codeck's deck room. Reads and writes MEMORY.md, channel/tasks/threads/roles, diagnosis.md, deck.md, DESIGN.md, custom.css, slides.html, review.md, and speech.md. Legacy outline.md is audit-only when found.

## Repository

```
codeck/
├── CLAUDE.md          # mirror of AGENTS.md for Claude runtime
├── AGENTS.md          # this file; agents/codex runtime entry
├── .claude-plugin/    # plugin.json + marketplace.json — Claude Code plugin, self-marketplacing (source "./")
├── .codex-plugin/     # plugin.json — Codex plugin manifest with interface block
├── .agents/plugins/   # marketplace.json — Codex marketplace "codeck-github", local source "."
├── .github/workflows/ # CI: plugin metadata consistency + shell syntax gate
├── scripts/           # release tooling (check-plugin-metadata.mjs); not skill runtime
├── skills/
│   ├── CLAUDE.md      # Member list + changelog
│   ├── CONVENTIONS.md # Skill authoring conventions (incl. packaging & versions)
│   ├── codeck/        # Entry dashboard
│   │   ├── CLAUDE.md  # Entry lane map
│   │   └── scripts/   # Room bootstrap + probes + resolve-dirs.sh
│   ├── codeck-outline/
│   ├── codeck-design/
│   ├── codeck-review/
│   ├── codeck-export/
│   └── codeck-speech/
└── README.md          # + zh / zh-TW / ja / ko translations
```

The four plugin manifests are JSON and cannot carry L3 header comments; their contracts live in this map and are enforced by `scripts/check-plugin-metadata.mjs`. The bundle version in both plugin.json files bumps on any released change to `skills/`, independently of per-skill frontmatter versions.
