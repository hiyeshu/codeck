<div align="center">

# codeck

**Conversational AI Presentation Skill — Claude Code Skill**

English · [中文](README.md)

</div>

Turn a folder of notes, docs, data, and images into a complete presentation by chatting with Claude.

codeck is a set of Claude Code skills. Install it, then type `/codeck` inside Claude Code to start. Six roles work in relay to take you from raw materials to a finished deck.

```
/codeck → /codeck-outline → /codeck-design → /codeck-review → /codeck-export → /codeck-speech
```

## Workflow

| Command | Role | What it does | Output |
|---------|------|-------------|--------|
| `/codeck` | Entry | Scan materials, restore project memory, show progress, recommend next step | Pipeline status |
| `/codeck-outline` | Editor | Diagnose materials → narrative questions → story arc → title smithing | outline.json, intent.json |
| `/codeck-design` | Designer | Style recommendation → generate content spec + design params → compile HTML | deck.json, design.json, HTML |
| `/codeck-review` | Reviewer | Screenshot every slide → six-dimension scoring → source-traced fixes | review.md |
| `/codeck-export` | Publisher | HTML → PDF / PPTX | PDF, PPTX |
| `/codeck-speech` | Speech coach | Style/duration dialog → verbatim script + stage directions + time budget | speech.md |

## Architecture

```
Materials
  ↓
outline.json (narrative structure) + intent.json (user intent)
  ↓
deck.json (content spec) + design.json (visual params)
  ↓
compiler → default.html (structural base) → Claude produces final HTML
  ↓
PDF / PPTX
```

Three-layer separation:
- **Content layer** `deck.json` — text, structure, speakerNotes. No visuals.
- **Design layer** `design.json` — colors, typography, spacing, mood (design_system / design_style / visual_effects).
- **Interaction layer** `default.html` — compiler-generated navigation, fullscreen, notes panel, a11y.

All intermediates stored under `~/.codeck/projects/{slug}/`. Project directory stays clean.

## Install

Requires [Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Node.js 18+.

```bash
npx skills add hiyeshu/codeck
```

Type `/codeck` inside Claude Code to get started.

## Repository Layout

```
skill/
├── codeck/          entry dashboard
├── codeck-outline/  editor skill
├── codeck-design/   designer skill + reference library
├── codeck-review/   reviewer skill
├── codeck-export/   export skill
├── codeck-speech/   speech skill
├── compiler/        spec validation, migration, rendering, HTML contract checks
├── pipeline.ts      pipeline state tracking + staleness propagation
├── intent-schema.ts cross-skill intent protocol
├── home.ts          global directory resolver
└── cli-util.ts      shared CLI utilities
```

## Development

```bash
npm test
```

## License

Apache-2.0
