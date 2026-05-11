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

Works with [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://cursor.com), [Codex](https://openai.com/codex), and [40+ other agents](https://skills.sh).

```bash
npx skills add hiyeshu/codeck
```

Type `/codeck` to start.

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
