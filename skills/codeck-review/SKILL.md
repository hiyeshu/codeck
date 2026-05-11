---
name: codeck-review
version: 2.1.0
description: |
  Reviewer role. Opens rendered HTML, inspects every slide visually,
  fixes problems in custom.css or slides.html and rebuilds through build-html.sh.
  Use whenever the user says "review", "QA", "check slides",
  "inspect", "audit", "proofread", or wants feedback on a rendered deck.
---

<!--
[INPUT]: Depends on rendered HTML, DESIGN.md, deck content, MEMORY.md, and threads/threads.md.
[OUTPUT]: Provides review.md, scoped fixes, and user-owned decisions for unresolved issues.
[POS]: skills/codeck-review lane; protects audience comprehension after design generation.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

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

Gate check: a valid assembled HTML is a self-contained engine deck, not merely any `./*-r*.html` file.

Valid assembled HTML must:

- contain `openPresenter`
- contain `codeck-presenter`
- contain `BroadcastChannel`
- contain no `<link rel="stylesheet" ...>` for a sibling deck CSS file

If no valid assembled HTML exists and `$DECK_DIR/custom.css` + `$DECK_DIR/slides.html` exist, re-run `build-html.sh`. If the latest `*-r*.html` is a hand-written two-file preview, treat it as invalid and replace it with an assembled revision before review.

## Context

Read `$DECK_DIR/MEMORY.md`, active rows in `$DECK_DIR/tasks/tasks.md`, and open rows in `$DECK_DIR/threads/threads.md`. Do not read `channel/YYYY-MM-DD.md` unless debugging history.
Read `$DECK_DIR/deck.md` — page structure, user intent. Ignore legacy `outline.md`; if `deck.md` is missing, route back to `/codeck`.
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

Review the assembled HTML (`./{file-stem}-r{N}.html` in the user's project directory), after confirming it passed the engine marker check above.

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
- Page count matches `deck.md`?

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

Compare against the DESIGN.md intent and visual-floor benchmarks in the installed `codeck-design/references/visual-floor.md`.

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

Fix directly. Do not use Decision Ask for light review, HTML generation, saving, or final build.

Only create a Decision Ask when there is a real user-owned decision: conflicting source materials, mutually exclusive claims, legal/commercial wording, or a style tradeoff that changes the deck direction. Record it in `threads/threads.md` before rendering it; if no structured AskUser UI is available and the decision is blocking, stop before changing the owned source artifact.

1. Determine: custom.css or slides.html
2. Edit the file
3. Run `build-html.sh`

```bash
CODECK_DESIGN_DIR="${CODECK_DESIGN_DIR:-}"
if [ -z "$CODECK_DESIGN_DIR" ]; then
  for d in "$HOME/.agents/skills/codeck-design" "$HOME/.codex/skills/codeck-design" "$HOME/.claude/skills/codeck-design"; do
    if [ -d "$d/scripts" ]; then CODECK_DESIGN_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_DESIGN_DIR" ] || { echo "codeck-design scripts not found" >&2; exit 1; }
ENGINE_DIR="$CODECK_DESIGN_DIR/scripts"
bash "$ENGINE_DIR/build-html.sh" "$DECK_DIR" "{file-stem}" "{language}" "."
```

Review fixes create a new validated revision. Max 3 rounds.

## Decision summary

Write the latest valid review findings and fixes to `$DECK_DIR/review.md`. If the current HTML was not built through `build-html.sh` or is stale, mark prior findings superseded before writing the new review:

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

Review is not complete until all five are true:

- `review.md` exists
- scoped fixes, if any, have been rebuilt into the latest validated HTML
- latest HTML contains speaker mode engine markers and has no external stylesheet link
- `tasks/tasks.md` marks the review ticket done
- `$DECK_DIR/.reviewed` has been touched after the latest HTML write

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
