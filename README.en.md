<div align="center">

# codeck

**Conversational AI Presentation Skill — Claude Code Skill**

English · [中文](README.md)

</div>

Turn a folder of notes, docs, data, and images into a complete presentation by chatting with Claude.

codeck is a set of Claude Code skills. Install it, then type `/codeck` inside Claude Code to start.

```
/codeck → /codeck-outline → /codeck-design → /codeck-review → /codeck-export → /codeck-speech
```

## Workflow

| Command | What it does | Output |
|---------|-------------|--------|
| `/codeck` | Scan materials, content diagnosis (three signals), dynamic role recommendation | diagnosis.md |
| `/codeck-outline` | Role activation → narrative questions → story arc → title smithing | outline.md, intent.md |
| `/codeck-design` | Role activation → design-dna isomorphic mapping → single HTML output | {title}-r{n}.html |
| `/codeck-review` | Inverse role (audience most likely to struggle) → six-dimension review → direct HTML fixes | review.md |
| `/codeck-export` | HTML → PDF / PPTX | PDF, PPTX |
| `/codeck-speech` | Role activation → verbatim script + stage directions + time budget | speech.md |

## Architecture

```
Materials
  ↓
Content diagnosis (domain · expression challenge · audience starting point) → dynamic role selection
  ↓
outline.md (narrative structure) + intent.md (user intent)
  ↓
Single HTML file (CSS design system + JS slide engine + free HTML per slide)
  ↓
PDF / PPTX / Speech script
```

Core ideas:
- **Skills define flow and format; knowledge comes from dynamically selected "people"** — role names activate vast knowledge networks in AI parameters
- **No schema ceiling** — no block type vocabulary, free HTML per slide, AI can invent any visual expression
- **design-dna** — finds isomorphic mappings from content's formal structure (inspired by Hofstadter's GEB), so visuals and content resonate at the structural level

## Install

Requires [Claude Code](https://docs.anthropic.com/en/docs/claude-code) + Node.js 18+.

```bash
npx skills add hiyeshu/codeck
```

Type `/codeck` inside Claude Code to get started.

## Layout

```
~/.claude/skills/
├── codeck/          entry dashboard + content diagnosis
├── codeck-outline/  outline skill + self-review checklist
├── codeck-design/   design skill + ui-ux-db style database
├── codeck-review/   review skill
├── codeck-export/   export skill + PDF/PPTX toolchain
└── codeck-speech/   speech skill
```

Project artifacts live under `~/.codeck/projects/{slug}/`.

## License

Apache-2.0
