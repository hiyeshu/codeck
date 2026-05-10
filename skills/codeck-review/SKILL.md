---
name: codeck-review
version: 2.1.0
description: |
  Reviewer role. Opens rendered HTML, inspects every slide visually,
  fixes problems in custom.css or slides.html and re-assembles.
  Use whenever the user says "review", "QA", "check slides",
  "inspect", "audit", "proofread", or wants feedback on a rendered deck.
---

# codeck review — @review lane

`@review` owns audience resistance, quality review, and scoped fixes.

Write boundaries:

- May write `$DECK_DIR/review.md`
- May fix `$DECK_DIR/slides.html` and `$DECK_DIR/custom.css` when the issue is scoped and source-backed
- May update `$DECK_DIR/roles/review.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/channel/YYYY-MM-DD.md`
- Must not rewrite `deck.md`, `DESIGN.md`, `speech.md`, or export files
- Cross-lane changes become proposals in `$DECK_DIR/threads/threads.md`

## Role activation

Read `$DECK_DIR/diagnosis.md` for the review role and its derivation.

Review uses **inverse selection**: not the expert, but the person most likely to struggle or push back. Their skepticism becomes your review lens.

> Audience is executives → summon the exec who asks "so what?" after every slide. Flag anything that doesn't earn its place.
>
> Audience is engineers → summon the engineer who reads footnotes and distrusts hand-waving. Flag imprecise claims and unsupported numbers.
>
> Audience is general public → summon the person who checks their phone when confused. Flag jargon, assumed knowledge, and dense slides.

The role determines what counts as a problem. See through their eyes, flag what would make *them* disengage.

Fallback: senior publishing editor with an eye for detail.

## Setup

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"
mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles"
bash "$HOME/.claude/skills/codeck/scripts/init-room.sh" "$DECK_DIR"
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

Gate check: if no assembled HTML exists (`./*-r*.html`), run `/codeck` to generate/rebuild the deck first.

If custom.css + slides.html exist but no assembled HTML, re-run assemble.sh.

## Context

Read `$DECK_DIR/MEMORY.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/threads/threads.md`.
Read `$DECK_DIR/deck.md` first if it exists; otherwise read `$DECK_DIR/outline.md` — page structure, user intent.
Read `$DECK_DIR/roles/design.md` — current design skeleton, lane memory, and handoff guardrails.
Read `$DECK_DIR/DESIGN.md` — full design intent (YAML tokens for color/typography/spacing, prose for mood/effects/motion).
Read `$DECK_DIR/diagnosis.md` — role activation.

**Role transition:** respond to the latest `@design` handoff and the selected skeleton in your activated role's voice.

Before review, claim the work ticket:

```markdown
@orchestrator
Owner: @review. Task: inspect rendered deck and fix scoped issues.

@review
I claim the review pass. I will write `review.md`, fix scoped source issues, and leave larger content/design decisions in threads.
```

Append the exchange to today's channel file and update `tasks/tasks.md`.

## Target

Review the assembled HTML (`./{title}-r{N}.html` in the user's project directory).

Three layers:
- engine.css + engine.js — fixed, don't touch
- custom.css — can fix
- slides.html — can fix

## Six-dimension review

Open the HTML, inspect every slide.

### 1. Narrative flow
- Logic between pages? Gaps?
- Arguments solid? Empty claims?
- Pacing balanced? Info density even?
- Core message in first 2 pages?
- Arc matches user intent mood?

Content issues → fix slides.html.

### 2. Content completeness
- Fabricated data or statistics?
- Accurate terminology?
- data-notes substantive, not repeating the title?
- Page count matches `deck.md` / `outline.md`?

Content issues → fix slides.html.

### 3. AI fluff detection

**Hollow buzzwords:** leveraging, cutting-edge, seamlessly, robust solution, ecosystem, synergy, empower, holistic, paradigm shift, end-to-end

**Structural fluff:** every page is 3-column cards, all titles are "N advantages of X", everything centered with no hierarchy variation

**Test:** replace company name with competitor — if the sentence still holds, it's fluff.

Grade: A (zero fluff) / B (1-2) / C (3-5) / D (>5) / F (template throughout)

Content issues → fix slides.html.

### 4. Visual hierarchy
- Clear eye guidance? Title → body hierarchy?
- Whitespace intentional? (Sparse can be deliberate — check DESIGN.md and roles/design.md before adding content)
- Color matches content mood from DESIGN.md `## Overview`?
- Type scale ratio ≥ 2.5:1 heading/body?

Style issues → fix custom.css.

### 5. Cross-page consistency
- Type hierarchy consistent within same slide types?
- Similar layouts consistent?
- No hardcoded color values? All CSS variables?
- Intentional variation (color drift, density) is not inconsistency — check DESIGN.md and roles/design.md

Style issues → fix custom.css. Hardcoded colors in slides.html too.

### 6. Interaction integrity

Check that AI-generated content doesn't break the engine:

| Check | Pass criteria |
|-------|---------------|
| Slide structure | Each page is `<section class="slide" data-notes="...">` |
| No scripts | No `<script>` tags in slides.html |
| No engine conflicts | custom.css doesn't override `.slide`, `#progress`, `.mobile-nav` |
| Fragment markup | `data-f="N"` sequential from 1 |
| Comment anchors | `<!-- ====== N. Title ====== -->` between pages |

### 7. Visual quality

Compare against the DESIGN.md intent and visual-floor benchmarks (`~/.claude/skills/codeck-design/references/visual-floor.md`).

- **Surface depth** — does the deck have material quality (gradients, shadows, glass, noise, blend modes)? Or flat colored rectangles?
- **Type as design** — are headings visually commanding (large scale, tight tracking, gradient fill, weight contrast)? Or default-looking text?
- **Deck-level rhythm** — does the deck use intentional variation across slides (color temperature drift, density inversion, breathing pages)? Or does every slide feel the same volume?
- **Font character** — are fonts distinctive (Google Fonts, not Inter/Roboto/system-ui)? Is `@import` present in custom.css with fallback stack?
- **Fragment entrances** — do entrance types match content mood? Are custom types used where appropriate?

If the DESIGN.md specifies an effect or technique that's missing from custom.css, flag it.

Style issues → fix custom.css.

### Design-aware guardrails

Before flagging a visual "inconsistency," check if it's intentional:

- **Color varies across slides** → check DESIGN.md `## Visual Effects` and the selected skeleton for color drift. Intentional variation is not a bug.
- **A slide is mostly empty** → check if it's a breathing page (one element + whitespace = deliberate pacing). Don't fill it.
- **Slide density alternates** → check for density inversion pattern. Forte → piano is a technique.
- **Title is extremely large (>80px)** → check visual-floor benchmarks. 88–120px is normal for impact slides.
- **Background changes between slides** → this is deck-level technique, not inconsistency.

Rule: if DESIGN.md or roles/design.md documents a creative decision, don't override it. Flag it only if the execution is broken (e.g. contrast too low to read), not because it's unconventional.

## Fixes

Fix directly. Do not use AskUser for light review, HTML generation, saving, or re-assembly.

Only ask when there is a real user-owned decision: conflicting source materials, mutually exclusive claims, legal/commercial wording, or a style tradeoff that changes the deck direction.

1. Determine: custom.css or slides.html
2. Edit the file
3. Re-run assemble.sh

```bash
ENGINE_DIR="$HOME/.claude/skills/codeck-design/scripts"
REV=$(ls ./*-r*.html 2>/dev/null | grep -oP 'r\K\d+' | sort -n | tail -1)
bash "$ENGINE_DIR/assemble.sh" "$DECK_DIR" "{title}" "{language}" \
  > "./{title}-r${REV}.html"
```

Overwrite same revision. Max 3 rounds.

## Decision summary

Write review findings and fixes to `$DECK_DIR/review.md`:

```markdown
# Review

## Summary
{N} issues found. {N} fixed automatically.

## Fixes
- {slide/file}: {what changed and why}

## Needs user decision
{none | conflict that cannot be resolved without user judgment}
```

If a finding needs `@outline` or `@design` to change their owned source beyond a scoped fix, add it to `threads/threads.md` and hand off the task. Do not silently rewrite their owned artifact.

After review:

1. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
2. Mark the `@review` task done in `tasks/tasks.md`.
3. Append the handoff to today's channel file:

```markdown
@review
I wrote `review.md`, fixed scoped issues, and marked remaining decisions in threads. Next owner: @export or @speech.
```

## Done

Highlight the single most impactful fix — the one that changed the most about how the deck feels:

> codeck review done. Fixed {N} issues.
>
> @review
> I inspected the rendered deck, fixed scoped issues, and left unresolved decisions in threads.
>
> Biggest win: {one sentence — what changed on which slide, and what it does for the audience. e.g., "Slide 5 had three competing text blocks. Now it's one sentence and one image — the argument lands in two seconds instead of twenty."}
>
> {one line — can this go on stage? Any remaining risks?}
>
> Next: `/codeck export PDF` or `/codeck speech script`

```bash
touch "$DECK_DIR/.reviewed"
```
