---
name: codeck-review
version: 2.1.0
description: |
  Reviewer role. Opens rendered HTML, inspects every slide visually,
  fixes problems in custom.css or slides.html and re-assembles.
  Use whenever the user says "审查", "检查", "review", "QA",
  or wants feedback on a rendered deck.
---

# codeck review

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

bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

If `STATUS_DESIGN` is not `done`, suggest running `/codeck-design` first.

If custom.css + slides.html exist but no assembled HTML, re-run assemble.sh.

## Context

Read `$DECK_DIR/outline.md` — page structure, user intent.
Read `$DECK_DIR/design-notes.md` — designer's decisions and note to reviewer.
Read `$DECK_DIR/diagnosis.md` — role activation.

**Role transition:** if design-notes.md has a "note to reviewer", respond in your activated role's voice.

## Target

Review the assembled HTML (`$DECK_DIR/{title}-r{N}.html`).

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
- Page count matches outline.md?

Content issues → fix slides.html.

### 3. AI fluff detection

**Hollow buzzwords:** leveraging, cutting-edge, seamlessly, robust solution, ecosystem, synergy, empower, holistic, paradigm shift, end-to-end

**Structural fluff:** every page is 3-column cards, all titles are "N advantages of X", everything centered with no hierarchy variation

**Test:** replace company name with competitor — if the sentence still holds, it's fluff.

Grade: A (zero fluff) / B (1-2) / C (3-5) / D (>5) / F (template throughout)

Content issues → fix slides.html.

### 4. Visual hierarchy
- Clear eye guidance? Title → body hierarchy?
- Whitespace rhythm? Pages too crowded or empty?
- Color matches content mood?
- Clear type scale?

Style issues → fix custom.css.

### 5. Cross-page consistency
- Colors consistent across pages?
- Type hierarchy consistent?
- Similar layouts consistent?
- No hardcoded color values? All CSS variables?

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

## Fixes

Fix directly. Only ask user for judgment calls (content tradeoffs, style preferences).

1. Determine: custom.css or slides.html
2. Edit the file
3. Re-run assemble.sh

```bash
ENGINE_DIR="$HOME/.claude/skills/codeck-design/scripts"
REV=$(ls "$DECK_DIR"/*-r*.html 2>/dev/null | grep -oP 'r\K\d+' | sort -n | tail -1)
bash "$ENGINE_DIR/assemble.sh" "$DECK_DIR" "{title}" "{language}" \
  > "$DECK_DIR/{title}-r${REV}.html"
```

Overwrite same revision. Max 3 rounds.

## Decision summary

Append to `$DECK_DIR/design-notes.md`:

```markdown
## Review — {ISO date}

Fixed {N} issues. {one line: what and why}
Remaining risk: {none / slide N: risk}
```

## Done

> codeck review done. Fixed {N} issues.
>
> {one line — can this go on stage? Any remaining risks?}
>
> Next: `/codeck-export` or `/codeck-speech`

```bash
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```
