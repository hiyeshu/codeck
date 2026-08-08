<div align="center">

# codeck

**A skill is a channel. codeck is a deck room.**

[Live demo →](https://codeck.sh/codeck-intro)

English | [简体中文](README.zh.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

</div>

You have a folder of notes, docs, data, and images. You want a presentation. You type `/codeck`.

codeck opens a persistent deck room. Each codeck skill enters that room as a channel: outline, design, review, speech, and export.

A channel has an address, a write boundary, room files, and a handoff. The room keeps the current deck state in `~/.codeck/projects/{slug}/`, so work can continue across runs without relying on chat memory.

The result is a single HTML file. No templates. No slide-type vocabulary. Free HTML per slide — the AI can invent any visual form your content needs.

## How it works

`/codeck` opens the room and reads the project. The outline channel shapes the story. The design channel gives the story visual form. The review channel pushes back like the hardest audience member. Speech and export channels prepare delivery.

The handoff lives in the room, not in chat history.

## Three ideas

**A skill is a channel.** codeck is not a single long prompt pretending to be a team. Each skill owns one channel in the room: what it listens for, what it writes, and who it hands off to.

**Isomorphic mapping.** Before designing, codeck analyzes the *formal structure* of your content — its tension curve, information density, emotional arc. Then it finds a structural match from another domain: a piece of music, a painting style, an architectural principle. Your slides don't just *contain* your argument — they *look like* it. (Inspired by Hofstadter's *GEB*.)

**No schema ceiling.** Most slide tools give you a vocabulary of block types — title, bullets, image, quote. codeck gives the AI free HTML. If your content needs a visual form that doesn't have a name yet, the AI can invent it.

## Install

### Claude Code (recommended)

```
/plugin marketplace add hiyeshu/codeck
/plugin install codeck@codeck
```

Type `/codeck` to start (shown as `/codeck:codeck` in the plugin namespace).

### Codex

```bash
codex plugin marketplace add hiyeshu/codeck --ref main
codex plugin add codeck@codeck-github
```

Start a new task so the skills load, then type `/codeck`.

### Other agents

Works with [Cursor](https://cursor.com) and [40+ other agents](https://skills.sh).

```bash
npx skills add hiyeshu/codeck
```

## Local development — clone and edit live

The repository is its own marketplace: the plugin's source points at the repo root, so a local clone is a live, editable install.

```bash
git clone https://github.com/hiyeshu/codeck && cd codeck
```

- **Claude Code, in place (immediately live):** `claude --plugin-dir .` — edits to any SKILL.md, engine.css, or reference file are picked up with `/reload-plugins`.
- **Claude Code, marketplace path:** `/plugin marketplace add /path/to/codeck` then `/plugin install codeck@codeck`. This copies into the plugin cache; after edits run `/plugin marketplace update codeck` and reinstall to refresh.
- **Codex:** `codex plugin marketplace add /path/to/codeck`, then `codex plugin add codeck@codeck-github`; refresh after edits with `codex plugin marketplace upgrade codeck-github`.
- **Universal escape hatch (any runtime, always live):** point the skills at your clone — every Setup block honors these before any probe.

  ```bash
  export CODECK_SKILL_DIR=/path/to/codeck/skills/codeck
  export CODECK_DESIGN_DIR=/path/to/codeck/skills/codeck-design
  export CODECK_EXPORT_DIR=/path/to/codeck/skills/codeck-export
  ```

## The HTML file

The output is a self-contained HTML file. Open it in any browser. No server, no build tools.

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `→` `↓` `Space` `Enter` | Next step (fragment or slide) |
| `←` `↑` `Backspace` | Previous step |
| `Esc` | Toggle overview grid |
| `F` | Toggle fullscreen |
| `P` | Open presenter mode |

Touch: swipe left/right to navigate. A floating toolbar appears at the bottom on hover (desktop) or always visible (mobile).

### Presenter mode

Press `P` to open a presenter window with:

- **Current slide** — large preview at your current fragment step
- **Next preview** — shows what comes next (next fragment or next slide)
- **Speaker notes** — scrollable, with zoom controls (`+` / `-`)
- **Timer** — auto-starts on first navigation, click to pause, double-click to reset
- **Theme toggle** — switches light/dark for all UI chrome (toolbar, overview, presenter panel)

The presenter window syncs with the main window via BroadcastChannel. Navigate from either side.

### Overview mode

Press `Esc` to see all slides as a grid. Click any thumbnail to jump. Works in both slide view and presenter mode.

## Acknowledgments

The slide engine's navigation UI is inspired by [Slidev](https://github.com/slidevjs/slidev).

## License

MIT
