<!--
[INPUT]: Depends on deck.md, diagnosis.md, roles/design.md, and workflow room state.
[OUTPUT]: Defines @design lane rules, DESIGN.md schema, visual recipes, and build gates.
[POS]: skills/codeck/references design manual; read when visual direction or HTML generation is needed.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Design — @design Lane, DESIGN.md Spec, Recipes, Visual Floor

This reference covers the `@design` lane: role activation, skeletons, isomorphic mapping, the DESIGN.md archive spec, the visual recipe library (themes, layouts, components, image prompts), generation rules, the visual floor benchmarks, the self-review checklist, and engine responsibilities.

## @design lane

`@design` owns visual direction, validated design archive, design skeleton, HTML source, and assembled HTML.

Write boundaries:
- May write `DESIGN.md`, `custom.css`, `slides.html`
- May write generated/processed visual assets to `assets/`
- May assemble the final `./{title}-r{revision}.html` in the user's project directory
- May update `roles/design.md`, `tasks/tasks.md`, `channel/YYYY-MM-DD.md`
- Must not rewrite `deck.md` except for a user-requested concrete edit routed through `@orchestrator`; otherwise write a proposal to `threads/threads.md`
- Must not edit `review.md`, `speech.md`, or export files

### Role activation

Read `diagnosis.md` for the recommended design role and its structural mapping. You ARE that person; their formal logic — how they organize space, tension, rhythm — becomes your visual logic. The role is chosen for structural match, not domain. Apply their formal logic directly; don't explain their principles — embody them in every visual choice. Fallback: run `/codeck` entry logic first; do not ask a generic setup question.

### Decision Ask

Design Direction is the only Decision Ask moment in this lane (before visual generation, or when the user says "change the visual style"). Skip when the user already provided a clear style, reference, skeleton, or confirmed direction in `MEMORY.md`, `roles/design.md`, `deck.md`, or `DESIGN.md`. Create a `D-YYYYMMDD-NN` decision in `threads/threads.md` first, then render: Re-ground ("codeck design, Design Direction") → Current read → Recommendation → 2-3 mutually exclusive visual directions. If blocking and no structured UI, stop before writing `DESIGN.md`/`custom.css`/`slides.html`.

### Setup

Use the shared `CODECK_SKILL_DIR` setup block (single skill). Read `MEMORY.md`, active `tasks/tasks.md`, open `threads/threads.md`, `roles/design.md`, `deck.md` (page structure, content points, user intent, note to designer), and `diagnosis.md`. If `deck.md` does not exist, route back to `/codeck` — do not ask "run outline first?".

### Reference extraction (optional)

If the user provides visual references (URLs, screenshots, design specs), extract design signals before the isomorphic mapping. Extract: color (primary by area dominance, secondary by supporting role, accent by CTA usage; map neutral scale lightest→darkest), typography (identify by visual characteristics, not font-name guessing; estimate scale ratio), spatial rhythm (density by proximity, rhythm by gap consistency), material/texture (shadow softness, glass, grain, gradients), motion (easing curves, duration feel). Multiple references → find the intersection; if they conflict, note the dominant pattern and let the user choose. References inform the mapping, not override it. Fold signals into the skeleton; record final structural choices in `DESIGN.md`.

## Design skeletons

The default skeleton is `narrative-grid`: argument-first structure with explicit page roles, hero/body rhythm, stable media slots, reusable page families, and a preplanned density cadence.

A skeleton is the deck's repeatable structure: page family inventory, page sequence rhythm, density curve, tonal cadence, image slot rules, type role separation, review guardrails. It is not a theme, template, asset kit, or finished style.

Selection priority: (1) user-provided style/brand/screenshot/reference/existing `DESIGN.md`; (2) current skeleton in `roles/design.md`; (3) `diagnosis.md` expression challenge plus the content's formal structure; (4) `narrative-grid`. Ask only when two choices would change the argument order.

Record the choice in `DESIGN.md` `## Overview` (`Skeleton: narrative-grid` or `narrative-{variant}`) and `roles/design.md` `## Current Skeleton`.

### Pre-flight plan (before writing visual files)

Decide for every slide: (1) page family; (2) page energy — `anchor`, `breath`, `work`, or `contrast`; (3) visual tone — light, dark, hero-light, or hero-dark; (4) media slot and ratio for any image/visual; (5) motion pattern for any slide using fragments.

Checks: no three consecutive slides share the same energy; no three consecutive slides share the same visual tone unless monotony is intended; dense `work` slides have a nearby `breath`/`anchor` slide; hero pages are for turns/resets/openings/questions/closings, not decoration; a repeated page family must do a different rhetorical job each time; metadata (names the section) and kicker (hooks the page) are not the same sentence; large titles sized by word length, not wish; media slots align to body area, not title top; image grids use equal visual height; UI/diagrams/charts/text-bearing images use contain fit; a long-strip UI screenshot should be split into panels or redesigned.

### Narrative-grid page families

| Family | Rhetorical job | Default theme | Motion | Guardrail |
|--------|----------------|---------------|--------|-----------|
| `hero-cover` | open the talk, name the thesis | hero dark | slow reveal | one title, one subtitle, one speaker/context line |
| `act-divider` | mark a turn | hero light/dark alternating | slow reveal | one idea only |
| `big-numbers` | make data unavoidable | light, rare dark | cascade | no more than four primary numbers |
| `quote-image` | pair a claim with a concrete visual | light/dark alternating | cascade | image aligns to body area, not title top |
| `image-grid` | compare visual evidence | light | cascade | same height or ratio across all images |
| `pipeline` | explain a process or sequence | light | stepped reveal | steps advance one by one |
| `hero-question` | create suspense or a reset | hero dark | slow reveal | question must fit in one breath |
| `big-quote` | give a sentence ritual weight | dark preferred | line reveal | short enough to read from the back row |
| `before-after` | show a contrast or decision | light | directional | left/right labels must be parallel |
| `image-text-mix` | denser explanation with a visual anchor | light/dark alternating | cascade | keep image and text in one grid system |

### Rhythm

Page energy: `anchor` (title/section turn/closing), `breath` (sparse reset), `work` (proof/process/data), `contrast` (quote/before-after/tension/objection). Rules: never run more than three pages with the same energy; for 8+ page decks include at least two anchors; include at least one breath page after a dense work sequence; insert an anchor every 3-4 pages when the story needs a turn; repeat a page family only when its role changes.

Custom variants: `narrative-technical`, `narrative-data`, `narrative-product`, `narrative-cinematic`, `narrative-report`. Record only the selected variant, reason, and guardrails in `roles/design.md`.

## DESIGN.md: isomorphic mapping → archive

Three steps: select skeleton → find isomorphic mapping (conceptual) → output DESIGN.md (specification).

### Isomorphic mapping

Extract the **formal structure** from the outline (not the content itself): tension curve, information density, argument topology (linear/branching/layered/contrastive), emotional arc. Find structurally similar things in your role's domain. Even flat lists have formal structure (accumulation, enumeration, crescendo). Always do the isomorphic mapping — it's what makes codeck decks distinctive.

> Layered business proposal → Ravel's Bolero → simple to complex, each page adds a layer, color gradually saturates.
> Contrastive technical argument → Go attack/defense → black-white contrast dominant, each turn uses one accent as a "move".
> Structured explanation → architectural blueprint → warm off-white ground, precise lines, spatial hierarchy.
> Data report chaos→order → karesansui → early pages scattered, final page stripped to minimal.

## DESIGN.md spec

Based on [Google design.md](https://github.com/google-labs-code/design.md). YAML front matter carries machine-readable tokens; Markdown sections carry design rationale.

codeck environment: 16:9 HTML output; engine JS is fixed; AI writes HTML + CSS only. No JS in slides. Google Fonts allowed via `@import url('https://fonts.googleapis.com/css2?...')` at top of custom.css (always include system font fallback). CSS + inline SVG only. No other CDN, no script tags.

### Token schema (YAML front matter)

```yaml
---
version: alpha
name: <string>
description: <string>
colors:
  primary: "#1B2838"
  secondary: "#4A6741"
  accent: "#D4A574"
  neutral: "#F5F0EB"
  surface-card: "#FFFFFF"
  surface-elevated: "#FAFAF8"
  success: "#2D7D46"
  warning: "#C4841D"
  error: "#B83232"
  info: "#3B6FA0"
typography:
  display: { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }
  heading-1: { ... }
  body: { fontFamily: "Source Sans 3", fontSize: 20px, fontWeight: 400, lineHeight: 1.6 }
  caption: { ... }
  font-heading: <string>
  font-body: <string>
  font-mono: <string>
spacing:
  base-unit: 8px
  sm: 16px
  md: 32px
  lg: 64px
  slide-padding: "60px 80px"
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  pill: 999px
components:
  button: { backgroundColor, textColor, rounded }
  card: { backgroundColor, rounded }
---
```

Token types: Color (`#`+hex sRGB), Dimension (number+unit), Token reference (`{path.to.token}`). codeck adds `colors.surface-card`, `colors.surface-elevated`, `spacing.slide-padding`, and `typography.font-heading/font-body/font-mono`.

### Section order (10 sections, in order)

1. **Overview** — isomorphic mapping, mood, visual metaphor, era, personality, design philosophy. Must include `Theme preset: {name}` or `Theme preset: custom-{name} — {reason}`, and `Skeleton: {name}`.
2. **Colors** — palette type, each color's role, contrast strategy.
3. **Typography** — type scale ratio derivation, font selection rationale.
4. **Layout** — grid system, columns, alignment tendency, content density, section rhythm, recipe mapping. Must include `Layout recipes: {list}`.
5. **Elevation & Depth** — shadow style, depth cues, level descriptions.
6. **Shapes** — border usage, divider style.
7. **Components** — presentation component semantics (shell, type roles, chrome/foot, kicker, tag, callout, stats, rowlines, pillars, figures, icons, ghost text, highlights, fragment roles). Must include `Component recipes: {list}`.
8. **Visual Effects** — background effects, glass, text effects, fragment entrances, motion philosophy, easing, duration scale.
9. **Image Assets** — asset strategy, generated/processed decisions, prompt constraints. Must include `Image prompt recipes: {list}` or `none — {reason}`.
10. **Do's and Don'ts** — focal strategy, whitespace, contrast, ornamentation, what to avoid.

### Completeness rule

Every section populated with deliberate decisions — no placeholder text. For non-applicable sections write "Not applicable — {concrete reason}". Minimum bar: complete YAML token groups; all 10 sections in order; at least 90 nonblank lines total; explicit recipe selections; Overview/Components/Visual Effects/Do's-and-Don'ts each ≥8 nonblank lines; every other section ≥4 nonblank lines; no `TBD`/`TODO`/vague placeholders.

Validate `DESIGN.md` against the DESIGN.md spec above before writing `custom.css` (YAML front matter + all 10 sections in spec order + recipe selections present). If validation fails, revise `DESIGN.md`; do not compensate by inventing missing decisions inside CSS.

## Visual recipe library

Before writing `DESIGN.md`, read the four recipe sets. Use them as ingredients, not templates. The fixed engine remains codeck's runtime; do not copy external template code.

Selection order: (1) pick one theme preset or define `custom-{name}` only when no preset fits; (2) pick 4-8 layout recipes matching slide purposes; (3) pick component recipes only for repeated structures; (4) pick image prompt recipes only when raster/processed assets are actually needed, otherwise record `none — {reason}`. Record all four choices in `DESIGN.md`.

### Theme presets

| Preset | Use for | Palette | Material | Avoid |
|--------|---------|---------|----------|-------|
| `swiss-ink` | product, technical, method, analysis | near-white/charcoal + one saturated anchor, no gradients | flat, no shadow/glass/glow | rounded cards, soft gradients, centered generic title pages |
| `editorial-ink` | narrative, founder essays, human-centered | paper neutral, ink dark, one muted accent | paper grain optional, soft image treatment, almost no shadow | dashboard cards, neon accents |
| `field-board` | operational tools, logistics, field research | off-white map stock, dark ink, safety accent | paper, rule lines, stamps; slight shadow separation | glossy SaaS gradient, fake travel photography |
| `cinematic-contrast` | high-tension, launches, security/risk, charged reveals | black/graphite foundation, one luminous accent | gradients as light not decoration; shadow is part of the scene | dark mode for every deck; low-contrast gray text |
| `system-blueprint` | architecture, protocols, dev tools, data flow | blueprint blue/pale drafting paper, ink lines, one warning accent | fine lines, grid ticks, no heavy cards | unlabeled arrows, tiny code screenshots |
| `soft-lab` | research, education, complex topics needing calm | light neutral, low-saturation scientific colors, one accent | light surfaces, subtle dividers, no heavy shadows | beige monotony, vague pastel blobs |

Selection rules: pick one preset unless a stronger brand reference is given; change at most two core palette roles without recording why; preserve the preset's material logic; if none fit, define `custom-{short-name}` and explain which preset it most closely rejects.

### Layout recipes (pick by rhetorical job)

**Opening:** `cover-signal` (clear promise in first five seconds), `cover-field-note` (operational/field-tested), `opening-problem-wall` (audience feels pain, lacks structure), `opening-quote-cut` (human sentence > thesis).

**Argument:** `statement-slab` (one sentence dominates), `proof-stat-tower` (a number is the object), `duo-compare` (two worlds contrasted), `before-after-evidence` (transformation), `constraint-wall` (tradeoffs define story), `myth-fact-split` (wrong assumption), `evidence-strip` (several artifacts prove one claim), `lens-stack` (same object, multiple interpretations).

**Explanation:** `process-spine` (sequence; >6 stages means merge/split), `loop-diagram` (cyclical), `system-map` (relationships > steps; no unlabeled arrows), `layer-cake` (builds in layers; lowest = foundation), `exploded-view` (decomposed parts), `decision-tree-lite` (≤3 branches), `workflow-board` (work moving through states).

**Product/demo:** `product-frame` (UI inspection; contain fit, never blur evidence), `demo-path` (happy path), `capability-matrix` (jobs × capabilities), `user-day-slice` (one persona), `roadmap-rail` (now/next/later), `integration-handoff` (source→transform→destination).

**Closing:** `closing-manifesto` (belief; no recap list), `closing-ask` (action; executable by audience), `takeaway-stack` (memory handles), `open-question` (leave tension alive).

Selection rules: pick 4-8 recipes for a normal deck; repeat one intentionally for rhythm; cover and close should not use the same visual weight unless the argument is circular; prefer `statement-slab` over generic title-body; prefer `process-spine`/`system-map`/`workflow-board` over bullet lists for mechanisms; prefer `product-frame`/`evidence-strip` over decorative imagery when real artifacts exist.

### Component recipes (record in DESIGN.md `## Components`)

**Information:** `stat-tower` (`.stat-tower > .stat-label + .stat-value + .stat-note`; one dominant number per slide), `metric-strip` (3-5 comparable metrics, shared width/scale; no paragraph notes), `rowline` (`.rowline > .row-key + .row-body + .row-meta`; compact comparisons; thin borders, calm surfaces), `constraint-chip` (`.constraint-chip[data-state]`; >8 chips needs grouping).

**Narrative:** `quote-cut` (`.quote-cut > blockquote + .quote-source`; one sentence interrupts), `callout-note` (`.callout-note > .callout-kicker + .callout-body`; one per slide), `manifesto-line` (closing belief; sentence-level, not a slogan pile).

**Diagram:** `labeled-arrow` (`.flow-edge` with visible label; unlabeled arrows invalid), `route-stepper` (paths/pipelines; if it branches use decision-tree-lite), `layer-band` (`.layer-stack > .layer-band`; dependency order, not random categories), `node-cluster` (>9 nodes should be simplified).

**Media:** `figure-frame` (`.figure-frame > img/svg + .figure-caption`; contain for UI/diagrams, cover only for atmospheric photos), `evidence-card` (`.evidence-card > .evidence-media + .evidence-caption + .evidence-takeaway`; media dominates), `placeholder-slot` (`.placeholder-slot[data-needed]`; never pretend placeholder is real evidence).

**Chrome:** `chapter-chrome` (act/section context; tiny, never competes with title), `source-foot` (sources/confidence labels; no long URLs unless required).

Rules: pick components that match selected layouts; keep engine selectors untouched; every repeated component must have stable dimensions.

## Image asset work

Image work belongs to `@design`. It is not a separate command and not a fixed menu of image types. Handle any visual asset the deck needs: improve user images, crop/resize/recolor, clean screenshots, redesign messy screenshots, generate missing visuals, compose several assets, or skip raster when HTML/CSS/SVG is more accurate.

Decision order: (1) what job must the visual do on this slide? (2) what slot and ratio does the skeleton require? (3) does the user already provide a usable asset? (4) can HTML/CSS/SVG express it better than raster? (5) if raster is needed, should `@design` improve, adapt, generate, compose, or leave a placeholder?

Defaults: preserve meaning of user images; improve fit/crop/contrast/framing/consistency without asking; do not alter factual content, people, logos, product UI, chart values, legal text, or brand identity unless the user explicitly asks; if a user asset is semantically important but visually weak, create a cleaned derivative and keep the source path; if no asset exists and the slide needs one, generate/compose; if an image would be decorative only, skip it.

Ask only when image work changes meaning or deck direction: replacing a real product screenshot with a stylized version; changing a person's appearance/identity; inventing a scene mistaken for documentation; removing/altering brand/legal/factual content; choosing between visual approaches that change the deck's tone. Do not ask whether to crop, improve contrast, normalize ratios, clean a screenshot, create a placeholder, or use an asset already present.

Asset levels: `inline` (images use `assets/` path, auto-base64 by assemble.sh; SVG inline directly), `poster` (video/audio/large files use cover image + play placeholder `.media-poster`), `extract` (code uses `<pre><code>`, data uses tables or CSS charts). Rule of thumb: can the HTML still be emailed? Yes → inline.

Asset naming: `{slide-number}-{semantic-name}-{work}.{ext}` (e.g. `03-dashboard-clean.png`).

Record image work in: `DESIGN.md` `## Image Assets` (strategy + table of slide/source/output/work/slot/ratio/reason); `roles/design.md` `## Asset Work` (current rule + generated/processed files); `MEMORY.md` Artifacts (final asset outputs only); `threads/threads.md` (any needed `deck.md` asset-manifest update, since `@outline` owns `deck.md`).

### Image prompt recipes (universal constraints)

Append to every generated asset prompt:

```text
No slide title, no footer, no page number, no logo unless supplied by the user, no watermark, no signature, no decorative border, no UI chrome unless requested. Leave safe negative space for HTML text. Match the deck language for any labels. Ratio: {slot ratio}.
```

If the asset represents a real product, dataset, person, legal text, chart value, or brand UI, do not invent or alter facts — clean, crop, or annotate instead.

Recipes: `documentary-photo` (human context, field work, atmosphere), `product-context-photo` (product in believable setting, no fake UI), `screenshot-cleanup` (preserve all factual UI; improve contrast/crop/readability; do not redesign), `screenshot-redesign` (messy screenshot → slide-safe diagram; preserve real workflow/labels/meaning), `system-infographic` (architectures/protocols/data flow; labeled nodes, sparse labeled arrows), `process-diagram` (linear workflows; one highlighted current/bottleneck stage), `comparison-visual` (before/after; parallel scale, one transformation cue), `data-poster` (one metric; abstract geometry only, HTML carries the number), `artifact-collage` (several sources → one composite; keep each recognizable), `map-or-route` (logistics/operations; abstract blocks/route rail, not realistic cartography), `icon-set` (repeated icons; single stroke logic, no filled emoji style, no text inside).

Selection rules: prefer CSS/SVG/typography when the image would be decorative; prefer `screenshot-cleanup` over `screenshot-redesign` when factual UI matters; prefer `system-infographic` over stock photos for abstract technical concepts; generated diagrams must use short labels, no paragraphs.

## Generation: custom.css + slides.html → build-html.sh

### Canvas (fixed 1280 × 720 px)

The engine renders every slide at **1280 × 720 px** and uses `transform: scale()` to fit any screen. Inside a slide you work in a fixed coordinate system — use `px`, not `vw`/`vh`/`rem`. An element that spans 40% of slide width is `width: 512px`. The engine's `transform: scale()` already adapts to any viewport, so `@media` breakpoints in custom.css are only for engine UI elements (which the AI does not write) — leave them to the engine.

Priority: (1) color + typography — 80% of visual identity; (2) spacing + layout; (3) shape + shadow; (4) overview + do's/don'ts; (5) visual effects; (6) motion (add last).

### DESIGN.md tokens → custom.css

```css
:root {
  /* Color — --bg, --fg, --accent are engine interface variables (base.css uses them) */
  --bg: {colors.neutral};
  --fg: {derive: light bg → dark fg, dark bg → light fg};
  --accent: {colors.accent};
  --accent2: {colors.secondary};
  --primary: {colors.primary};
  --surface-card: {colors.surface-card};
  --surface-elevated: {colors.surface-elevated};
  /* Typography — Google Fonts + system fallback */
  --font-heading: {typography.font-heading}, system-ui, sans-serif;
  --font-body: {typography.font-body}, system-ui, sans-serif;
  --font-mono: {typography.font-mono}, ui-monospace, monospace;
  /* Spacing / Shape / Shadow / Motion derived from DESIGN.md prose */
  --space-sm: {spacing.sm}; --space-md: {spacing.md}; --space-lg: {spacing.lg};
  --slide-padding: {spacing.slide-padding};
  --radius: {rounded.md}; --radius-sm: {rounded.sm}; --radius-lg: {rounded.lg};
  --shadow-low: {from ## Elevation & Depth}; --shadow-md: {...}; --shadow-high: {...};
  --ease: {from ## Visual Effects}; --duration-micro: {...}; --duration-normal: {...};
}
```

Type scale must be a ratio, not arbitrary values. Pick a base (`--body-size`, typically `20px`) and a ratio derived from the design role: `.caption` = base × ratio⁻¹, `.body-text` = base, `.title-medium` = base × ratio, `.title-large` = base × ratio², `.title-mega` = base × ratio³.

Visual center sits at ~40-45% from top, not geometric center — use `padding-top` > `padding-bottom` or `align-content: center` with slight upward bias. Padding is a system: define slide padding once in `px` and share across slide types.

### Fragment entrance effects

Four built-in entrance types via `data-f-type`: `fade-up` (default, text/lists), `scale` (images/cards/key numbers), `blur` (large headings/hero copy), `slide` (timelines/steps). Usage: `<div data-f="1" data-f-type="blur">`. Custom types: define `[data-f-type="yourname"]` initial state in custom.css; engine handles reveal (`.visible` resets opacity/transform/filter). Guideline: one entrance type per slide for coherence.

To override engine transition duration/easing:
```css
[data-f] { transition: opacity var(--duration-normal) var(--ease), transform var(--duration-normal) var(--ease), filter var(--duration-normal) var(--ease); }
```

### slides.html conventions

```html
<!-- ====== 1. Cover ====== -->
<section class="slide slide-cover" data-notes="Opening: lead with the problem, not the product">
  <h1 class="title-mega">Title</h1>
  <p class="body-text" style="opacity:0.7">Subtitle</p>
</section>
```

- Each `<section class="slide" data-notes="...">` is one page.
- `data-notes`: 1-2 sentence summary of that page's key point from `deck.md`.
- Separate pages with `<!-- ====== N. Title ====== -->` comments.
- `data-f="N"`: fragment stepping, sequential from 1, no gaps/duplicates.
- No `<!doctype>`, `<html>`, `<head>`, `<body>`, `<main class="deck">`, stylesheet links, `<script>` tags, progress bar, or mobile nav — engine handles all of it.

### Write + assemble

```bash
ENGINE_DIR="$CODECK_SKILL_DIR/scripts"
bash "$ENGINE_DIR/validate-design.sh" "$DECK_DIR"
bash "$ENGINE_DIR/build-html.sh" "$DECK_DIR" "{file-stem}" "{language}" "."
```

`validate-design.sh` blocks shallow or unordered `DESIGN.md`. `build-html.sh` calls `assemble.sh` and rejects HTML without speaker mode. If slides.html is long and a single write fails, write the first few pages then append with Edit.

## Visual floor — minimum acceptable impact

Benchmarks to beat, not presets. After generating DESIGN.md and before writing custom.css, compare your planned output against the closest benchmark. If flatter, push DESIGN.md harder. Then diverge — your output follows the isomorphic mapping, not the benchmark. The rule: structurally unique (from the mapping), visually at least this impactful (from the floor).

**Benchmark A — Light Editorial:** warm paper background (not clinical white) with subtle radial accent glow; oversized serif heading with tight tracking (`80px`, `letter-spacing: -0.04em`, `line-height: 0.9`); accent line as a mark not decoration (`64px × 4px`); cards with hard offset shadow (`8px 8px 0`); metric value `72px` dominating its label.

**Benchmark B — Neutral Tension:** warm stone surface with weight not color; `120px` ultra-light (`font-weight: 200`) title at bottom-left (asymmetry creates tension from nothing); content slides one statement at `48px`/`300` weight, max-width `700px`; the only accent is a `48px × 1px` divider meaning "pause"; final slide lightens background and shrinks text — the deck dissolves into silence. Zero decoration; whitespace does all the work.

**Benchmark C — Dark Cinematic:** animated gradient that breathes (warm top-left, cool bottom-right, not flat black); `88px` cover title with gradient fill (`-webkit-background-clip: text`); glass cards (`backdrop-filter: blur(20px)`, `1px` glow border, layered shadow); SVG `feTurbulence` noise overlay at `0.03` opacity with `mix-blend-mode: overlay` for analog warmth.

### Deck-level techniques

- **Color temperature drift** — shift `--bg` per page to follow the emotional arc (don't change the palette, change the temperature).
- **Density inversion** — every 3-4 pages flip dense↔sparse (forte → piano).
- **Breathing pages** — a single word, color inversion, or a number at 200px with nothing else; one per deck section.
- **Morph within a slide** — engine sets `data-step="N"` as fragments advance; CSS transitions morph existing elements (position/size/color/opacity) between states. Pure CSS, no JS.
- **Type as illustration** — a 400px `?` as background texture at `0.04` opacity; the letter is atmosphere, not content.
- **mix-blend-mode for light/depth** — one pseudo-element with a radial gradient and `mix-blend-mode: overlay` creates the illusion of light falling on the surface.
- **Inline SVG generative texture** — `<svg>` with `feTurbulence` for noise/grain, resolution-independent, under 500 bytes.

## Self-review checklist

Check in order. Auto-fix means fix directly; ask only for user-owned content conflicts.

**Pass 0 — DESIGN.md:** spec check passes; YAML front matter + all 10 sections in spec order; Overview/Components/Visual Effects/Do's-and-Don'ts have implementation-driving detail; `Theme preset:`, `Layout recipes:`, `Component recipes:`, `Image prompt recipes:` all present.

**Pass 1 — custom.css:** `:root` defines `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`; all sizing in `px` on 1280×720 canvas (no `vw`/`vh`/`rem`); no `position` on `.slide`/`.slide-*`; Google Fonts include `system-ui, sans-serif` fallback; no overrides of `.slide`, `#progress`, `.mobile-nav`, `.presenter-*` (`.slide-*` component classes allowed, bare `.slide` not).

**Pass 2 — slides.html:** slide count matches `deck.md`; every slide is `<section class="slide" data-notes="...">`; no document shell (`<!doctype>`/`<html>`/`<head>`/`<body>`/`<main>`/`<link>`/`<script>`); every slide has `<!-- ====== N. Title ====== -->`; `data-f` sequential from 1, no gaps/duplicates; `data-notes` substantive (not title repeat); data from source materials, not invented.

**Pass 3 — final HTML:** `build-html.sh` succeeded, output non-empty; contains `openPresenter`, `codeck-presenter`, `BroadcastChannel`; no `<link rel="stylesheet">` to sibling deck CSS; no text overflow; no residual `assets/` paths (all base64-inlined); prefer CSS classes/`var()` over inline `style="color:#xxx"`.

Suppressions: don't flag unconventional design choices the user explicitly requested during iteration.

## Engine responsibilities (fixed, do not reimplement)

- `render-engine.js` — fixed slide runtime: navigation, fragments, overview, speaker mode, presenter sync, toolbar, notes assembly, and in-browser editor (text editing, image click/drop-to-replace, `data-img-slot` placeholders, save-as-download).
- `assets/base.css` — fixed runtime chrome: slide shell, toolbar, overview, mobile controls, presenter layout, editor-mode chrome, engine-level responsive behavior.
- `assemble.sh` — low-level assembler; inlines the asset fragments, base.css, custom.css, slides.html, render-engine.js, and image assets into one HTML stream.
- `validate-design.sh` — DESIGN.md gate; checks YAML tokens, section order, recipe markers, and placeholder text.
- `build-html.sh` — final build guard; auto-increments revisions, calls assemble.sh, rejects output without speaker-mode markers or self-contained CSS.

## Gotchas

- **Google Fonts allowed, always with fallback.** Use `@import url()` at the top of custom.css; assemble.sh places it inside `<style>` in `<head>`. Always include a system font fallback stack. Offline = fallback renders, no breakage.
- **No `<script>` in slides.html.** Engine handles all JS. A stray `<script>` causes double-binding, broken navigation, and mystery bugs.
- **`:root` variables are an API contract.** `--bg`, `--fg`, `--accent` are consumed by base.css. Missing/misspelled = broken progress bar, invisible page numbers, white-on-white overview.
- **Fragment numbers must be sequential starting from 1.** Gaps (1, 3, 5) cause the engine to skip steps. Duplicates cause simultaneous reveals.
- **Don't override engine classes.** `.slide`, `#progress`, `.mobile-nav`, `.presenter-*` belong to the engine.
- **Never set `position` on `.slide` or slide-type classes.** `.slide` is `position: absolute; inset: 0` — that's what makes it fill the viewport. `position: relative` breaks it.
- **CSS animations + `prefers-reduced-motion`.** Wrap `@keyframes`: `@media (prefers-reduced-motion: no-preference) { ... }`.
- **Hard-coded colors in slides.html = unmaintainable.** Use CSS classes and `var()` exclusively.
- **Cover slide defaults to centered title + subtitle.** If the design role calls for symmetry, centering is correct. Otherwise break it — asymmetry signals intentional design.
- **CSS negation of math functions silently fails.** `-clamp(...)`, `-min(...)`, `-max(...)` are silently discarded. Always write `calc(-1 * clamp(...))`.
- **Content density has hard limits.** Title slide: 1 heading + 1 subtitle max. Content slide: 1 heading + 6 bullets or 2 short paragraphs max. Data slide: 1 heading + 4 metric cards max. Code slide: 10 lines max. Exceeding = viewport overflow. Split into multiple slides, never cram.
- **Assemble.sh auto-increments revision.** Don't manually name output files. Let the script handle `r1`, `r2`, etc.
