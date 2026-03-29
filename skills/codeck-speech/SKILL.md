---
name: codeck-speech
version: 2.1.0
description: |
  Speech writer role. Reads deck content, asks about style and duration,
  generates a verbatim speech transcript with stage directions. Outputs
  $DECK_DIR/speech.md. Use whenever the user says "speech",
  "speaker notes", "script", "how to present", "talk track",
  "presentation notes", or wants help preparing to present a deck.
---

# codeck speech

## Role activation

Read `$DECK_DIR/diagnosis.md`. If a speech role is recommended, use it. Otherwise, pick a coach based on domain and audience:

> Technical → Feynman: simplify the complex, bridge with analogy
>
> Business → Jobs: build anticipation, one "one more thing"
>
> Academic → Hans Rosling: let data tell the story

## Setup

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"

bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

Read:
- **HTML** (latest `*-r*.html`) — actual slide content
- **outline.md** — structure, arc, user intent
- **design-notes.md** — visual intent (speech rhythm should match visual rhythm)

If no HTML and no outline, suggest `/codeck-design` or `/codeck-outline` first.

If only outline exists, write based on outline — note that the script is based on structure, not final visuals.

**Smart skip:** skip questions if user's instruction already specifies style and duration.

## Questions

### Q1: Style

- A) TED — conversational, story-driven, breathing room
- B) Formal — structured, precise language
- C) Casual — natural, humor ok

### Q2: Duration

- A) 5 min — lightning, ~1000 words
- B) 15 min — standard, ~3000 words
- C) 30+ min — deep dive, ~6000 words

## Generate

Write a complete, readable-aloud transcript. Page by page.

### Rules

1. **One section per slide** — matches the deck
2. **Transitions** — natural bridges between pages
3. **Stage directions** — `[pause Ns]` `[transition]` `[slow down]` `[speed up]` `[look at audience]`
4. **Word count** — ~200 words/min Chinese, ~130 words/min English
5. **Source-based** — no fabricated data
6. **Strong opening** — story, data, or question
7. **Strong close** — callback to opening or call to action

### Style notes

**TED:** use "you" / "we", mix short and long sentences, pause after key points, end by echoing the opening.

**Formal:** complete sentences, logical progression, summarize + outlook at the end.

**Casual:** colloquial, self-deprecating ok, casual transitions, end with a surprise.

## Time budget

| Slide | Title | Words | Estimate |
|-------|-------|-------|----------|
| 1 | ... | ... | ... |

- A) Help me trim the ones over time
- B) I'll manage it myself

## Write back HTML data-notes

After generating, replace each slide's `data-notes` with the full speech text for that page. This way speaker mode shows the complete script.

Use Edit tool per slide:
- Find `<section class="slide" data-notes="...">`
- Replace `data-notes` value with the page's verbatim script (HTML-escape quotes)
- Keep stage directions in data-notes

## Output: $DECK_DIR/speech.md

```markdown
---
style: "{style}"
duration: "{target}"
totalEstimate: "{estimate}"
---

# Speech: {topic}

---

## Slide 1: {title}
<!-- estimate: {N}s | {M} words -->

{verbatim speech text}

[pause 2s]

---

## Slide 2: {title}
<!-- estimate: {N}s | {M} words -->

[transition] {bridge sentence}

{verbatim speech text}

---
```

## Done

Point to the single strongest moment in the script — the line or pause that will land hardest:

> codeck speech done.
>
> Strongest moment: {slide N — what happens and why it works. e.g., "Slide 4, the three-second pause after the question. That silence is where the audience decides you're worth listening to."}
>
> {one line — readiness assessment}
>
> Output: `$DECK_DIR/speech.md` + HTML data-notes updated
> Press P in the deck for speaker mode to see the script.
>
> All done. Need to export? `/codeck-export`. Check progress anytime with `/codeck`.

```bash
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```
