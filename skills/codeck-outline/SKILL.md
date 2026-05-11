---
name: codeck-outline
version: 2.2.0
description: |
  Editor role. Reads local materials, asks narrative questions, plans
  story arc. Outputs $DECK_DIR/deck.md as the sole content source.
  Use whenever the user says
  "outline", "plan slides", "organize materials", "structure",
  "table of contents", "narrative", or wants to structure content into a presentation.
---

<!--
[INPUT]: Depends on local materials, MEMORY.md, threads/threads.md, diagnosis.md, and prior deck.md.
[OUTPUT]: Provides deck.md with narrative structure and Decision Log.
[POS]: skills/codeck-outline lane; owns canonical deck content before design consumes it.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# codeck outline — @outline lane

`@outline` owns narrative structure and canonical deck content.

Write boundaries:

- May write `$DECK_DIR/deck.md`
- May update `$DECK_DIR/roles/outline.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/channel/YYYY-MM-DD.md`
- Must not edit `DESIGN.md`, `custom.css`, `slides.html`, `review.md`, `speech.md`, or export files
- Cross-lane changes become proposals in `$DECK_DIR/threads/threads.md`

## Role activation

Read `$DECK_DIR/diagnosis.md` for the recommended outline role and its derivation.

You ARE that person. Their way of questioning becomes your editorial instinct.

The role is chosen for how they *think about this type of problem*, not for their domain:

> Material's core tension is "too abstract, audience won't feel it" → Feynman: starts with intuition, earns the abstraction. Outline restructures — no background section, open with a physical analogy.
>
> Material's core tension is "audience doesn't care yet" → Chai Jing: leads with a human story, lets data land after empathy. Outline restructures — open with a person, not a statistic.
>
> Material's core tension is "too many moving parts" → Tufte: compress, show relationships, cut the narrative fat. Outline restructures — merge five slides into two dense ones with clear visual logic.

The role must change what the outline *includes, excludes, and sequences*. If the outline would be the same without the role, the match is wrong.

Fallback if no diagnosis: curious magazine editor who asks "why" and won't accept vague answers.

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

Read `$DECK_DIR/MEMORY.md`, active rows in `$DECK_DIR/tasks/tasks.md`, open rows in `$DECK_DIR/threads/threads.md`, `$DECK_DIR/deck.md`, and `$DECK_DIR/diagnosis.md` if they exist. Do not read `channel/YYYY-MM-DD.md` unless debugging history. Ignore legacy `outline.md` during normal generation.

Before writing content, claim the work ticket:

```markdown
@orchestrator
Owner: @outline. Task: structure deck content. Artifact: deck.md.

@outline
I claim the narrative pass. I will write `deck.md` and hand off to @design.
```

Append that exchange to `$DECK_DIR/channel/YYYY-MM-DD.md` and reflect the ticket in `tasks/tasks.md`.

## Step 1: Scan materials

Scan the **current directory** (the user's project), not DECK_DIR. Use the shared `scan-materials.sh` probe so the exclusion list and grouping stay aligned with `/codeck`.

```bash
bash "$CODECK_SKILL_DIR/scripts/scan-materials.sh" .
```

Do not use `eval find` — the entry skill explicitly forbids it. If the probe is unavailable, fall back to a plain `find` with explicit `! -path` exclusions.

User-provided structure is raw material — cut, merge, reorder freely.

Read text files with Read tool. Classify assets:

| Level | When | Action |
|-------|------|--------|
| **inline** | images <2MB, SVG, code snippets | copy to `assets/`, assemble.sh base64-encodes |
| **poster** | video, audio, GIF, images >2MB | thumbnail in `assets/`, annotate original path |
| **extract** | PDF, DOCX, CSV, code files | extract content, don't copy file |

Rule of thumb: can the HTML still be emailed? Yes → inline. No → poster or extract.

```bash
mkdir -p "$DECK_DIR/assets"
```

If 0 files found, use the Deck Intent Decision Ask moment: create a room decision for the topic/core goal once, or tell the user to add files and run `/codeck` again.

## Step 1.5: Material diagnosis

Silent checks on materials:

1. **Core message clarity** — can you extract a one-sentence thesis?
2. **Density** — concise or needs heavy trimming?
3. **Presentation fit** — slide-ready or needs restructuring?
4. **Image assets** — content images (architecture, charts) or decorative?

All clear → continue silently. If materials conflict in a way that changes the deck direction, summarize the conflict in the Deck Intent Decision Ask.

Results go into `deck.md` under "Material summary".

## Step 2: Deck Intent

Use the shared `/codeck` Decision Ask Policy. Deck Intent is one allowed Decision Ask moment.

Do not ask for "mode". Default to fast: decide, write, and let the user edit after output.

Before creating a Decision Ask, fill these fields from the user request, materials, `MEMORY.md`, open `threads/threads.md` rows, and `deck.md`:

- Core message
- Audience scene: industry internal / commercial launch / demo day / private session
- Duration: 15 minutes / 30 minutes / 45 minutes
- Language

Do not ask for slide count. Derive page count from duration:

| Duration | Derived page count |
|----------|--------------------|
| 15 minutes | about 10 pages |
| 30 minutes | about 20 pages |
| 45 minutes | about 25-30 pages |

If the user explicitly provides a custom duration, derive the page count from the same rhythm and record the reason. A very short deck is not a default package; use it only when the user explicitly asks for a short teaser or the material cannot support more.

Skip any field that is already clear. If all four are clear enough, do not ask and record `skipped: inferred from room/materials` in the Decision Log.

If one or more missing fields would change the deck, create one `D-YYYYMMDD-NN` decision in `threads/threads.md` and render one bundled question:

```text
codeck needs to lock the presentation scene.

Current read: {what the materials imply}.

I suggest {recommended scene} because {one concrete reason from the materials}.

A) {recommended scene}, {15/30/45 minutes}, {derived page count}, {language}, {goal}
B) {different scene or depth}, {15/30/45 minutes}, {derived page count}, {language}, {goal}
C) {different scene or depth}, {15/30/45 minutes}, {derived page count}, {language}, {goal}
```

Options must be mutually exclusive packages, not separate mini-questions. A good option includes audience scene, duration, derived page count, language, and goal in one line.

If the decision is non-blocking and the user does not answer, use the recommended option and write it to `MEMORY.md` as `assumed default`. If it is blocking in a runtime without structured AskUser UI, stop before writing `deck.md`.

Optional intent exploration is allowed only when the user volunteers it. Do not ask "why do you care?", "what should they feel?", or style-avoidance questions unless the answer is needed to resolve a material conflict.

Record the result in both `MEMORY.md` and `deck.md`.

## Step 3: Research to fill gaps

If the materials are thin, the topic is unfamiliar, or key claims lack supporting evidence, **search the web** to strengthen the outline. Don't fabricate data — find it.

When to search:
- User mentions statistics or trends without providing source → find the real numbers
- Material references a product, paper, or event you haven't seen → look it up
- You need a concrete example to ground an abstract point → find one
- The audience is specialized and you need to verify terminology or conventions

Integrate findings naturally into the outline. Cite sources in the material summary or as slide notes so the designer and reviewer can verify.

## Step 4: Narrative structure

### Story arc templates

**Problem-driven:** problem → solution → evidence → implications

**Demo-driven:** concept → demonstration → mechanism → extensions

**Data report:** summary → metrics → patterns → actions

**Teaching:** motivation → core idea → application → practice

These are narrative shapes, not slide titles. Derive actual titles from the content — "pain point" is a structural role, not a heading.

### Title smithing

Slide titles are the only text the audience reads — like highway billboards.

**Two rules:**
1. **Instant clarity** — no second read needed. Short > long, concrete > abstract.
2. **Hook** — questions > statements, tension > flatness.

**Priority:** apt first, then as dramatic as accuracy allows. Flat but accurate is a floor, not a goal.

**Five strategies per title:**

Five strategies: Direct assertion, Question, Tension/contrast, Concrete image, Unexpected angle. Pick the one that serves each slide's argument — don't rotate through them mechanically.

**Quality check:**
1. Understood in one read? No → rewrite.
2. Want to hear more? No → switch strategy.
3. Sounds human? AI-flavored → rewrite.

Write the outline. Do not ask for confirmation before generating files.

## Step 5: Write $DECK_DIR/deck.md

`deck.md` is the canonical content source. Do not create or update `outline.md`.

```markdown
# Outline: {topic}

## Material summary

{key content extracted from files}

## Basics

- Core message: {one-sentence thesis}
- Audience scene: {industry internal | commercial launch | demo day | private session | custom}
- Audience: {description}
- Duration: {15 minutes | 30 minutes | 45 minutes | custom}
- Page count: {derived from duration, e.g. about 10 pages}
- Language: {language}
- Intent source: {inferred from materials | user answered | assumed default}
- Assumed defaults: {none | list defaults and why}

## Decision log

| ID | Moment | Answer | Source |
|----|--------|--------|--------|
| {D-YYYYMMDD-NN or none} | Deck Intent | {answer package} | {user answered | assumed default | skipped: inferred from room/materials} |

## Story arc

{arc description}

## Slide structure

### 1. {cover title}
- Purpose: cover
- Rhythm: climax
- Key points: {points}

### 2. {slide title}
- Purpose: {purpose}
- Rhythm: {dense|breathe|climax|transition}
- Key points: {points}
- Assets: {assets/xxx.png or file:line if applicable}

...

## Asset manifest

| File | Level | Use | Assigned to |
|------|-------|-----|-------------|
| assets/architecture.png | inline | architecture diagram | slide 3 |
| assets/demo-cover.jpg | poster | video cover (source: demo.mp4) | slide 6 |

Level: inline / poster / extract. No assets → write "none".

## User intent

- Motivation: {Q1.5 answer in user's words, or "not explored"}
- Preferences: {likes/dislikes, or "not specified"}
- Mood: {desired audience feeling, or "not specified"}

## Note to designer

> {1-2 sentences: narrative intent and structural highlights}
```

## Self-review

Read `$HOME/.claude/skills/codeck-outline/references/checklist.md`, then check `deck.md`.

- Pass 1: structural issues → auto-fix
- Pass 2: content quality → auto-fix mechanical issues. Ask only for real user-owned content conflicts.

## Handoff

After writing and self-review:

1. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
2. Mark the `@outline` task done in `tasks/tasks.md`.
3. If content needs a user decision, add or update a row in `threads/threads.md`.
4. Append the handoff to today's channel file:

```markdown
@outline
I finished `deck.md`. The next owner is @design.

@design
I will read `deck.md`, `diagnosis.md`, and the design thread before writing visual files.
```

## Done

Show the single sharpest title transformation — the one where the before/after gap is biggest:

> codeck outline done.
>
> @outline
> I wrote `deck.md` and handed the room to @design.
>
> Best title move: "{before}" → "{after}"
>
> {one-line quality assessment}
>
> Output: `$DECK_DIR/deck.md`
> Next: `/codeck` will generate slides.
