---
name: codeck-design
version: 2.0.0
description: |
  Designer role. Reads deck.md, generates a single HTML presentation file
  with CSS design system + JS slide engine + per-slide content.
  Accepts visual references (URLs, screenshots, design specs) and
  extracts design signals to inform the isomorphic mapping.
  Use whenever the user says "design slides", "generate deck",
  "generate the deck", "build slides", "visual style",
  "reference this style", "like this design",
  "design", "generate slides", "visual style", "reference this style",
  or wants to turn an outline into actual slides.
---

<!--
[INPUT]: Depends on deck.md, diagnosis.md, DESIGN references, and room decision state.
[OUTPUT]: Provides validated DESIGN.md, custom.css, slides.html, assembled HTML, and design lane memory.
[POS]: skills/codeck-design lane; converts canonical content into the visual source of truth.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# codeck design — @design lane

`@design` owns visual direction, validated design archive, design skeleton, HTML source, and assembled HTML.

Write boundaries:

- May write `$DECK_DIR/DESIGN.md`, `$DECK_DIR/custom.css`, `$DECK_DIR/slides.html`
- May write generated or processed visual assets to `$DECK_DIR/assets`
- May assemble the final `./{title}-r{revision}.html` in the user's project directory
- May update `$DECK_DIR/roles/design.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/channel/YYYY-MM-DD.md`
- Must not rewrite `deck.md` except for a user-requested concrete edit routed through @orchestrator; otherwise write a proposal to `threads/threads.md`
- Must not edit `review.md`, `speech.md`, or export files

## Role activation

Read `$DECK_DIR/diagnosis.md` for the recommended design role and its structural mapping.

You are that person. Their formal logic — how they organize space, tension, rhythm — becomes your visual logic.

The role is chosen for structural match, not domain:

> Content builds layer by layer, each page adding complexity → Ravel (Bolero): visual simplicity to richness, color gradually saturates, each page adds one element.
>
> Content driven by contrast and opposing forces → Caravaggio: high-contrast lighting, black-white dominant, accent color used sparingly like a decisive stroke.
>
> Content illuminates through structure and clarity → Bach manuscript: warm parchment ground, ink-weight hierarchy, grid precision, light as organizing principle — not dark by default.
>
> Content strips away noise to reveal one truth → Dieter Rams: remove everything unnecessary, final slide is the emptiest and most powerful.

Apply their formal logic directly. Don't explain their principles — embody them in every visual choice.

If `diagnosis.md` doesn't exist, run `/codeck` entry logic first when possible. Do not ask a generic setup question.

## Decision Ask Policy

Use the shared `/codeck` Decision Ask Policy.

Design Direction is the only Decision Ask moment in this skill. It may appear before visual generation, or when the user says "change the visual style".

Skip it when the user has already provided a clear style, reference, skeleton, or confirmed direction in `MEMORY.md`, `roles/design.md`, `deck.md`, or `DESIGN.md`.

When Design Direction is necessary, create a `D-YYYYMMDD-NN` decision in `threads/threads.md` first. Then render it through the current runtime:

1. **Re-ground** — "codeck design, Design Direction"
2. **Current read** — content structure and visual implication
3. **Recommendation** — one direction and why
4. **Options** — 2-3 mutually exclusive visual directions

Only state verified facts. For unrendered results, say "will" not "is".

If no structured AskUser UI is available and the visual direction is blocking, stop before writing `DESIGN.md`, `custom.css`, or `slides.html`. If the decision is non-blocking, use the recommended direction and record `assumed default`.

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
mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles" "$DECK_DIR/assets"
bash "$CODECK_SKILL_DIR/scripts/init-room.sh" "$DECK_DIR"
bash "$CODECK_SKILL_DIR/scripts/status.sh" "$DECK_DIR"
```

Read `$DECK_DIR/MEMORY.md`, active rows in `$DECK_DIR/tasks/tasks.md`, open rows in `$DECK_DIR/threads/threads.md`, and `$DECK_DIR/roles/design.md`. Do not read `channel/YYYY-MM-DD.md` unless debugging history.
Read `$DECK_DIR/deck.md` — page structure, content points, user intent, note to designer. Ignore legacy `outline.md`.
Read `$DECK_DIR/diagnosis.md` — role, domain, expression challenge.

If `deck.md` does not exist, route back to `/codeck` to create the content source. Do not ask "run outline first?"

## Role transition

Read the "note to designer" at the end of `deck.md`. Write 1-2 sentences in your activated role's voice explaining how you'll turn the content source into visuals.

Before writing visual files, claim the work ticket:

```markdown
@orchestrator
Owner: @design. Task: turn deck content into visual source and assembled HTML.

@design
I claim the design pass. I will write and validate `DESIGN.md`, then write `custom.css`, `slides.html`, build HTML, and hand off to @review.
```

Append the exchange to today's channel file and update `tasks/tasks.md`.

## Reference extraction (optional)

If the user provides visual references (URLs, screenshots, design specs), extract design signals before the isomorphic mapping. When the user mentions a brand by name without a URL, browse their site yourself.

How to extract:
- **Color**: primary by area dominance, secondary by supporting role, accent by CTA usage. Map neutral scale from lightest background to darkest text.
- **Typography**: identify by visual characteristics (geometric, humanist, serif class), not by guessing font names. Estimate scale ratio from heading/body size relationship.
- **Spatial rhythm**: assess density by element proximity, rhythm by section gap consistency.
- **Material/texture**: classify shadow softness, spread, layering. Note glass, grain, gradients.
- **Motion**: if observable, note easing curves and duration feel.

Multiple references → find the intersection. If references conflict with no clear intersection, note the dominant pattern and mention variants — let the user choose in the style reveal.

References inform the mapping, not override it. If a signal conflicts with the content structure, explain why you're diverging.

Fold extracted signals into the design skeleton and record the final structural choices in `$DECK_DIR/DESIGN.md`.

## Image Asset Work

Image work belongs to `@design`. It is not a separate user command and not a fixed menu of image types.

Handle any visual asset the deck needs:

- improve user-provided images
- crop, resize, recolor, de-noise, or normalize ratio
- clean screenshots and make UI readable on stage
- redesign messy screenshots into slide-safe assets
- generate missing visuals
- compose several assets into one clearer visual
- skip raster images when HTML, CSS, or SVG is more accurate

Decision order:

1. What job must the visual do on this slide?
2. What slot and ratio does the skeleton require?
3. Does the user already provide a usable asset?
4. Can HTML, CSS, or SVG express it better than raster?
5. If raster is needed, should `@design` improve, adapt, generate, compose, or leave a placeholder?

Default behavior:

- Preserve the meaning of user-provided images.
- Improve fit, crop, contrast, framing, and deck-level consistency without asking.
- Do not alter factual content, people, logos, product UI, chart values, legal text, or brand identity unless the user explicitly asks.
- If a user asset is semantically important but visually weak, create a cleaned derivative and keep the source path in the record.
- If no asset exists and the slide needs one, generate or compose an asset.
- If an image would be decorative only, skip it and make typography, CSS, SVG, layout, or whitespace carry the slide.

Decision Ask is allowed only when image work changes meaning or deck direction:

- replacing a real product screenshot with a stylized version
- changing a person's appearance or identity cues
- inventing a scene that could be mistaken for documentation
- removing or altering brand, legal, or factual content
- choosing between visual approaches that change the deck's tone

Do not ask whether to crop, improve contrast, normalize ratios, clean a screenshot, create a placeholder, or use an asset already present.

Read `references/asset-guide.md` before asset work. Its shapes are examples, not modes. If none fit, invent the right asset shape.

Record image work in:

- `DESIGN.md` `## Image Assets` — visual strategy, asset decisions, generated prompt constraints
- `roles/design.md` `## Asset Work` — current lane state and generated/processed files
- `MEMORY.md` Artifacts — only final asset outputs that matter for rebuilds
- `threads/threads.md` — any needed `deck.md` asset-manifest update, because `@outline` owns `deck.md`

## Visual recipe library

Before writing `DESIGN.md`, read these four reference files:

- `references/theme-presets.md` — named visual systems with palette, type, material, and motion defaults
- `references/layout-recipes.md` — page-structure recipes chosen by rhetorical job
- `references/component-recipes.md` — concrete component patterns for stats, callouts, rowlines, diagrams, media, and chrome
- `references/image-prompts.md` — prompt recipes for generated, cleaned, redesigned, or composited assets

Use them as ingredients, not templates. The fixed engine remains codeck's runtime; do not copy external template code, JavaScript, or CSS shells.

Selection order:

1. Pick one theme preset or define `custom-{name}` only when no preset fits.
2. Pick 4-8 layout recipes that match the deck's slide purposes.
3. Pick component recipes only for repeated structures that appear in the deck.
4. Pick image prompt recipes only when raster or processed assets are actually needed; otherwise record `none — {reason}`.

Record all four choices in `DESIGN.md`:

```markdown
Theme preset: {preset}
Layout recipes: {recipe-a}, {recipe-b}, ...
Component recipes: {recipe-a}, {recipe-b}, ...
Image prompt recipes: {recipe-a | none — reason}
```

## Design skeletons

Read `references/skeletons.md` before writing `DESIGN.md`.

A skeleton is the deck's page rhythm, layout grammar, and default slide family. It is not a theme, template, or asset pack.

Selection order:

1. Explicit user style, brand, reference, screenshot, or existing `DESIGN.md`
2. Current skeleton in `$DECK_DIR/roles/design.md`
3. `diagnosis.md` expression challenge plus the content's formal structure
4. The narrative grid skeleton, adapted to the deck's argument

Default skeleton:

| Skeleton | Use for |
|----------|---------|
| `narrative-grid` | argument-led decks with clear page roles, hero/body rhythm, stable media slots, data posters, quotes, pipelines, and before/after pages |

User references modify the skeleton; they do not replace the room protocol. Extract structural rules, name the variant, and record it in `DESIGN.md` and `roles/design.md`. Do not create a new permanent skeleton file unless the user asks.

Record the selected skeleton in `DESIGN.md` `## Overview` as `Skeleton: {name}` and in `roles/design.md` under `## Current Skeleton`.

## DESIGN.md: isomorphic mapping → design archive

Three steps: select the skeleton, find the isomorphic mapping (conceptual), then output DESIGN.md (specification).

### Step 1: Select skeleton

Use `references/skeletons.md` and the current deck structure. Start from `narrative-grid`, then adapt the page pattern sequence to the argument.

The skeleton answers:

- Which slide families exist?
- How does density change across the deck?
- What visual element carries the argument?
- How much variation is allowed between pages?
- What must the reviewer protect?

### Step 2: Isomorphic mapping

Extract the **formal structure** from the outline (not the content itself):
- Tension curve — narrative tension-release rhythm
- Information density — where it's dense, where it breathes
- Argument topology — linear, branching, layered, contrastive
- Emotional arc — what emotion to what emotion

Find structurally similar things in your role's knowledge domain:

> A layered business proposal → Ravel's Bolero → visually simple to complex, each page adds a layer, color gradually saturates
>
> A contrastive technical argument → Go attack and defense → black-white contrast dominant, each turn uses one accent color as a "move"
>
> A structured explanation that builds understanding → architectural blueprint → warm off-white ground, precise lines, information revealed through spatial hierarchy, not through darkness
>
> A data report moving from chaos to order → Japanese karesansui → early pages scattered, final page stripped to minimal

Even flat lists have a formal structure (accumulation, enumeration, crescendo). Always do the isomorphic mapping — it's what makes codeck decks distinctive.

### Step 3: Generate DESIGN.md

Read `references/design-md-spec.md` — the codeck DESIGN.md format spec, based on [Google design.md](https://github.com/google-labs-code/design.md). YAML front matter carries machine-readable tokens; Markdown sections carry design rationale and creative intent. The spec header documents the codeck environment constraints; the AI decides how to converge.

Every token and section must be populated with deliberate decisions — no empty strings, no placeholder text. Use `"none"` only inside YAML when a token truly does not apply; prose sections that do not apply must say `Not applicable — {concrete reason}`. A complete DESIGN.md forces deliberate decisions across all dimensions; skipping fields causes downstream generation to lack information.

Minimum archive shape:

- YAML front matter with full color, typography, spacing, rounded, and component tokens from `design-md-spec.md`
- all 10 sections in spec order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Visual Effects, Image Assets, Do's and Don'ts
- explicit selected theme preset, layout recipes, component recipes, and image prompt recipes
- at least one concrete rule per major component family that appears in the deck
- explicit skeleton mapping, type ratio, slide rhythm, motion policy, and asset strategy
- no placeholder language

Write to `$DECK_DIR/DESIGN.md`.

Run validation immediately after writing:

```bash
CODECK_DESIGN_DIR="${CODECK_DESIGN_DIR:-}"
if [ -z "$CODECK_DESIGN_DIR" ]; then
  for d in "$HOME/.agents/skills/codeck-design" "$HOME/.codex/skills/codeck-design" "$HOME/.claude/skills/codeck-design"; do
    if [ -d "$d/scripts" ]; then CODECK_DESIGN_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_DESIGN_DIR" ] || { echo "codeck-design scripts not found" >&2; exit 1; }
bash "$CODECK_DESIGN_DIR/scripts/validate-design.sh" "$DECK_DIR/DESIGN.md"
```

If validation fails, revise `DESIGN.md` directly and rerun validation. Do not write `custom.css` or `slides.html` until validation passes.

## Style reveal

This is the Design Direction Decision Ask moment.

Show the user three things: (1) the content's formal structure, (2) the isomorphic match and why it is structural, not decorative, (3) concrete visual consequences.

Offer 2-3 directions. Make the recommendation explicit.

- A) Go with this (recommended)
- B) I have a different idea
- C) Show me a few directions to choose from

If the decision is non-blocking and the user does not answer, use A. Write `assumed default` to `MEMORY.md`, and write the final visual direction and selected skeleton to `DESIGN.md` and `roles/design.md`. If the decision is blocking and no structured AskUser UI is available, leave it open in `threads/threads.md` and stop before writing visual source.

## Visual impact — quality gate

Correct and forgettable is a failure mode. Read `references/visual-floor.md` after DESIGN.md validates and before writing custom.css — 3 CSS benchmarks (dark cinematic, light editorial, minimal tension). Your output must be at least that level.

Pick the closest benchmark, compare element by element. If flatter, push the DESIGN.md harder before proceeding.

## Generate content

### Architecture: fixed engine, AI writes content and styles only

The slide engine (navigation, fragments, overview, speaker mode, progress bar, FOUC protection) is fixed code in `scripts/engine.js` and `scripts/engine.css`. Every deck uses the same engine.

**AI writes two files:**

| File | Contents |
|------|----------|
| `$DECK_DIR/custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| `$DECK_DIR/slides.html` | `<section class="slide">` sequence |

**Bash assembles the final HTML. This is the only valid path to a project-root `*-rN.html`:**

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

Never hand-write the final project-root HTML. Never create a sibling project-root CSS file such as `{file-stem}-deck.css`. Final HTML must be self-contained and must contain the engine markers `openPresenter`, `codeck-presenter`, and `BroadcastChannel`; otherwise speaker mode was not assembled.

### Engine capabilities (engine.js — do not reimplement)

1. **Page navigation** — arrow keys / space / PageDown
2. **Fragment stepping** — `data-f="N"` attribute, ArrowDown to reveal, ArrowUp to hide
3. **Overview mode** — Esc toggle, thumbnail grid, click to jump
4. **Progress bar + page number** — auto-created
5. **Mobile navigation** — auto-created bottom button bar
6. **FOUC protection** — double rAF before display
7. **Speaker notes** — reads `data-notes` attribute
8. **Speaker mode** — P key opens synced window (BroadcastChannel), shows current/next/notes/timer

### custom.css

Read `references/design-md-guide.md` for full mapping rules: DESIGN.md → custom.css.

Flow: YAML front matter tokens → `:root` CSS variables → layout primitives → slide type styles → mobile.

**Critical:** `--bg`, `--fg`, `--accent` are engine interface variables. engine.css uses them for progress bar, overview borders, page numbers. They must be defined in `:root`.

Do not style engine selectors: `.slide`, `#progress`, `.mobile-nav`, or `.presenter-*`. Use slide-specific classes such as `.slide-cover`, `.route-map`, or `.station-panel`; the engine owns the shell.

### slides.html

Before writing `slides.html`, read `DESIGN.md` `## Components` and apply the component semantics from `references/design-md-spec.md`.

```html
<!-- ====== 1. Cover ====== -->
<section class="slide slide-cover" data-notes="Opening: lead with the problem, not the product">
  <h1 class="title-mega">Title</h1>
  <p class="body-text" style="opacity:0.7">Subtitle</p>
</section>

<!-- ====== 2. Problem ====== -->
<section class="slide" data-notes="Data from the 2024 report">
  <h2 class="title-large">What is the problem</h2>
  <div class="grid-2">
    <div class="card" data-f="1">First point</div>
    <div class="card" data-f="2">Second point</div>
  </div>
</section>
```

**Conventions:**
- Each `<section class="slide" data-notes="...">` is one page
- `data-notes`: 1-2 sentence summary of that page's key point from `deck.md`
- Separate pages with comments: `<!-- ====== N. Title ====== -->`
- Free HTML inside — no block type restrictions
- `data-f="N"`: fragment stepping (lower N appears first)
- No `<!doctype>`, `<html>`, `<head>`, `<body>`, `<main class="deck">`, stylesheet links, `<script>` tags, progress bar, or mobile nav — engine handles all of it

### Asset references

Read `references/asset-guide.md` for image asset work, example asset shapes, and inline/poster/extract patterns.

Generated and processed assets go in `$DECK_DIR/assets/`.

Naming:

```text
{slide-number}-{semantic-name}-{work}.{ext}
```

Examples:

- `03-dashboard-clean.png`
- `04-system-map-generated.png`
- `06-founder-photo-crop.jpg`
- `08-ui-redesign.png`

### Write + assemble

1. Write `$DECK_DIR/custom.css` with Write tool
2. Write `$DECK_DIR/slides.html` with Write tool
3. Run `build-html.sh` with Bash; it calls `assemble.sh` and rejects HTML without speaker mode

If slides.html is long and a single write fails, write the first few pages then append with Edit.

### Self-review

After assembling, check the final HTML:

1. **Page count** — matches `deck.md`?
2. **Comment anchors** — every page has `<!-- ====== N. Title ====== -->`?
3. **data-notes** — every slide section has the attribute?
4. **CSS variables** — `:root` defines `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`?
5. **Mobile** — custom.css has `@media (max-width: 768px)`?
6. **Content accuracy** — text comes from source material, no fabricated data?
7. **No engine code** — no `<script>` tags in slides.html?
8. **Speaker mode present** — final HTML contains `openPresenter`, `codeck-presenter`, and `BroadcastChannel`?
9. **Self-contained** — final HTML has no `<link rel="stylesheet" ...>` and no required sibling CSS file?

Fix issues directly (Edit custom.css or slides.html, then run `build-html.sh`). Don't ask the user.

## Iteration

Do not use Decision Ask for generic iteration.

If the user asks for a visual change, edit `$DECK_DIR/slides.html` or `$DECK_DIR/custom.css`, then run `build-html.sh`. If the change requires `deck.md`, write a proposal in `threads/threads.md` and hand the ticket to @outline. For a new user request later, create the next revision.

End with the output path and the highest-signal note about what changed. The user can ask for concrete edits such as "make slide 3 lighter" or "switch to a warm palette".

## Handoff

After assembling and self-review:

1. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
2. Mark the `@design` task done in `tasks/tasks.md`.
3. If content or style needs a user decision, write it to `threads/threads.md`.
4. Append the handoff to today's channel file:

```markdown
@design
I wrote validated `DESIGN.md`, `custom.css`, `slides.html`, and assembled the HTML. The next owner is @review.

@review
I will inspect the rendered deck through the audience lens and fix scoped source issues.
```

## Gotchas

- **Google Fonts allowed, but always with fallback.** Use `@import url()` at the top of custom.css — assemble.sh places it inside `<style>` in `<head>`. Always include a system font fallback stack. Offline = fallback renders, no breakage.
- **No `<script>` in slides.html.** Engine handles all JS. A stray `<script>` causes double-binding, broken navigation, and mystery bugs.
- **`:root` variables are an API contract.** `--bg`, `--fg`, `--accent` are consumed by engine.css. Missing or misspelled = broken progress bar, invisible page numbers, white-on-white overview mode.
- **Fragment numbers must be sequential starting from 1.** `data-f="1"`, `data-f="2"`, etc. Gaps (1, 3, 5) cause the engine to skip steps. Duplicates cause simultaneous reveals.
- **Don't override engine classes.** `.slide`, `#progress`, `.mobile-nav`, `.presenter-*` belong to the engine. Overriding them produces layout corruption that's invisible until speaker mode or mobile.
- **Never set `position` on `.slide` or slide-type classes.** `.slide` is `position: absolute; inset: 0` in engine.css — that's what makes it fill the viewport. `position: relative` on `.slide-cover` etc. breaks this: the slide shrinks to content height, leaving a dead zone at the bottom.
- **CSS animations + `prefers-reduced-motion`.** If custom.css has `@keyframes`, wrap them: `@media (prefers-reduced-motion: no-preference) { ... }`. Skip this = accessibility failure.
- **Hard-coded colors in slides.html = unmaintainable.** One palette change and you're hunting through 30 slides. Use CSS classes and `var()` exclusively.
- **Cover slide defaults to centered title + subtitle.** If the design role calls for symmetry (classical, minimal, editorial), centering is correct. Otherwise, break it — asymmetry signals intentional design.
- **CSS negation of math functions silently fails.** `-clamp(...)`, `-min(...)`, `-max(...)` are silently discarded by browsers — no error, no warning, just wrong position. Always write `calc(-1 * clamp(...))` instead.
- **Height breakpoints, not just width.** Laptops with browser chrome show ~600px viewport height. Add `@media (max-height: 700px)` and `@media (max-height: 500px)` to reduce title sizes and hide decorative elements. Width-only breakpoints miss the most common overflow scenario.
- **Content density has hard limits.** Title slide: 1 heading + 1 subtitle max. Content slide: 1 heading + 6 bullets or 2 short paragraphs max. Data slide: 1 heading + 4 metric cards max. Code slide: 10 lines max. Exceeding these = viewport overflow. Split into multiple slides, never cram.
- **Assemble.sh auto-increments revision.** Don't manually name output files. Let the script handle `r1`, `r2`, etc. Manual names break the revision chain.

## Done

> codeck design complete.
>
> @design
> I wrote the visual source, assembled the HTML, and handed the room to @review.
>
> {One sentence — cite the DESIGN.md isomorphic mapping}
>
> Output: `./{title}-r{revision}.html` (in user's project directory)
> Intermediates: `$DECK_DIR/DESIGN.md`
> Next: `/codeck` will inspect and fix.
