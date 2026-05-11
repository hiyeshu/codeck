---
name: codeck-speech
version: 2.1.0
description: |
  Internal speech module for /codeck. Reads deck content, asks about
  style and duration only when missing, generates a verbatim speech
  transcript with stage directions. Outputs $DECK_DIR/speech.md.
---

<!--
[INPUT]: Depends on deck content, HTML notes, MEMORY.md, tasks/tasks.md, and threads/threads.md.
[OUTPUT]: Provides speech.md and fragment-synced HTML data-notes.
[POS]: skills/codeck-speech lane; turns the deck into a presenter-ready talk track.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# codeck speech — @speech lane

`@speech` owns the talk track, presenter rhythm, and fragment-synced notes.

Write boundaries:

- May write `$DECK_DIR/speech.md`
- May update HTML `data-notes` in `$DECK_DIR/slides.html`
- May update `$DECK_DIR/roles/speech.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/channel/YYYY-MM-DD.md`
- Must not rewrite `deck.md`, `DESIGN.md`, `custom.css`, `review.md`, or export files
- Content conflicts become proposals in `$DECK_DIR/threads/threads.md`

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
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in "$HOME/.agents/skills/codeck" "$HOME/.codex/skills/codeck" "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found" >&2; exit 1; }
mkdir -p "$DECK_DIR"
mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles"
bash "$CODECK_SKILL_DIR/scripts/init-room.sh" "$DECK_DIR"
bash "$CODECK_SKILL_DIR/scripts/status.sh" "$DECK_DIR"
```

Read:
- **MEMORY.md** — known style, duration, language, defaults, open threads
- **tasks/tasks.md / threads/threads.md** — active tickets and open decisions only
- **HTML** (latest `*-r*.html`) — actual slide content
- **deck.md** — structure, arc, user intent; ignore legacy `outline.md`
- **DESIGN.md / roles/design.md** — visual intent and selected skeleton (speech rhythm should match visual rhythm)

If no HTML and no `deck.md`, run `/codeck` to build the missing deck state first.

If only `deck.md` exists, write based on `deck.md` — note that the script is based on structure, not final visuals.

Do not read `channel/YYYY-MM-DD.md` unless debugging history.

**Smart skip:** skip Decision Ask if the user's instruction, `MEMORY.md`, open `threads/threads.md` rows, `deck.md`, or existing `speech.md` already specifies style and duration.

Before writing, claim the work ticket:

```markdown
@orchestrator
Owner: @speech. Task: create presenter script and sync data-notes.

@speech
I claim the speech pass. I will write `speech.md`, sync fragment notes, and leave source conflicts in threads.
```

Append the exchange to today's channel file and update `tasks/tasks.md`.

## Questions

Speech Style is one allowed Decision Ask moment under `/codeck`.

Use the shared `/codeck` Decision Ask Policy. Create one `D-YYYYMMDD-NN` decision only when style or duration is missing. Bundle both into one choice so the user is deciding the speech shape, not filling a form.

```text
codeck needs the speech shape.

Current read: {deck audience and rhythm}.

I suggest {recommended package} because {reason}.

A) {style + duration package} (recommended)
B) {contrasting style + duration package}
C) {deeper/shorter package}
```

Use these defaults when the deck gives no signal:

- A) TED — conversational, story-driven, breathing room
- B) Formal — structured, precise language
- C) Casual — natural, humor ok

- A) 5 min — lightning, ~1000 words
- B) 15 min — standard, ~3000 words
- C) 30+ min — deep dive, ~6000 words

If the decision is non-blocking and the user does not answer, use the recommended package and write `assumed default` to `MEMORY.md`. If the speech commitment is blocking and no structured AskUser UI is available, leave it open in `threads/threads.md` and stop before writing `speech.md`.

Record the final style and duration in `speech.md` front matter and `MEMORY.md`.

## Generate

**Before writing, build a fragment map.** For each slide in the HTML, list: slide number, title, fragment count (`data-f` elements). This map determines the speech structure — slides with fragments get `### [on enter]` + `### [fragment N]` sections, slides without get a single block. Do not skip this step.

Write a complete, readable-aloud transcript. Page by page.

### Rules

1. **One section per slide** — matches the deck
2. **Transitions** — natural bridges between pages
3. **Stage directions** — write stage directions in the same language as the transcript. For English, use `[pause 2s]`, `[slow down]`, `[look at audience]`. For other languages, translate the stage directions so the speaker never has to switch languages while presenting.
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

If a section is over budget, trim it directly before writing the final script. Do not ask another question.

## Write back HTML data-notes (fragment-synced)

The engine's `buildNotes()` concatenates the slide's `data-notes` with each visible fragment's `data-notes` as the presenter steps through. Use this to sync speech rhythm with fragment rhythm.

### How it works

1. **Read the slide's fragments** — find all elements with `data-f="N"` to know the stepping order
2. **Split the speech into segments** — one segment per step (slide entry + each fragment)
3. **Assign notes to each step:**
   - Slide's `data-notes` → what to say when the slide first appears (before any fragment)
   - `data-f="1"` element's `data-notes` → what to say when fragment 1 reveals
   - `data-f="2"` element's `data-notes` → what to say when fragment 2 reveals
   - ...and so on

### Example

Speech for slide 3:
> "Let's talk about the three ideas behind codeck. [pause 2s] First, it recruits people, not rules. [pause] Second, isomorphic mapping. [pause] Third, no schema ceiling."

Slide 3 has `data-f="1"`, `data-f="2"`, `data-f="3"`:

```html
<section class="slide" data-notes="Let's talk about the three ideas behind codeck. [pause 2s]">
  <h2 data-f="1" data-notes="First, it recruits people, not rules. [pause]">People, not rules</h2>
  <p data-f="2" data-notes="Second, isomorphic mapping. [pause]">Isomorphic mapping</p>
  <p data-f="3" data-notes="Third, no schema ceiling.">No schema ceiling</p>
</section>
```

Presenter presses → three times. Notes build up progressively:
- Step 0: "Let's talk about the three ideas..."
- Step 1: + "First, it recruits people..."
- Step 2: + "Second, isomorphic mapping..."
- Step 3: + "Third, no schema ceiling."

### Rules

- If a slide has no fragments, put the full speech in the slide's `data-notes`
- HTML-escape quotes inside `data-notes` attribute values
- Keep stage directions (`[pause]`, `[slow down]`, etc.) in the notes
- Each segment should be self-contained — the presenter reads what's new at each step
- Match the number of speech segments to the number of steps (1 + fragment count)

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
<!-- estimate: {N}s | {M} words | fragments: 0 -->

{verbatim speech text}

[pause 2s]

---

## Slide 2: {title}
<!-- estimate: {N}s | {M} words | fragments: 3 -->

### [on enter]

{what to say when slide appears, before any fragment}

### [fragment 1]

{what to say when fragment 1 reveals}

### [fragment 2]

{what to say when fragment 2 reveals}

### [fragment 3]

{what to say when fragment 3 reveals}

---
```

## Done

After writing:

1. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
2. Mark the `@speech` task done in `tasks/tasks.md`.
3. If script work exposed a content issue, add it to `threads/threads.md`.
4. Append the handoff to today's channel file.

Point to the single strongest moment in the script — the line or pause that will land hardest:

> codeck speech done.
>
> @speech
> I wrote `speech.md`, synced fragment notes, and recorded the speech shape in memory.
>
> Strongest moment: {slide N — what happens and why it works. e.g., "Slide 4, the three-second pause after the question. That silence is where the audience decides you're worth listening to."}
>
> {one line — readiness assessment}
>
> Output: `$DECK_DIR/speech.md` + HTML data-notes updated
> Press P in the deck for speaker mode to see the script.
>
> Export: `/codeck export`. Overview: `/codeck`.
