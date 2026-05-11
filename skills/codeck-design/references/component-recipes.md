<!--
[INPUT]: Depends on selected theme preset, layout recipes, and DESIGN.md component semantics.
[OUTPUT]: Provides implementation recipes for common presentation components.
[POS]: codeck-design/references visual library; turns abstract component roles into concrete HTML/CSS patterns.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Component Recipes

Use component recipes to make repeated structures feel designed instead of improvised. Record the selected recipes in DESIGN.md `## Components`.

```markdown
## Components
Component recipes: stat-tower, evidence-card, labeled-arrow, quote-cut, route-stepper
```

## Information Components

### `stat-tower`

Use when a number is the main claim.

- HTML shape: `.stat-tower > .stat-label + .stat-value + .stat-note`
- Visual: number uses display type, label uses metadata type, note is short and lower contrast.
- Motion: value appears last or scales in once.
- Guardrail: one dominant number per slide; a stat grid can have many numbers, but only one tower.

### `metric-strip`

Use for 3-5 comparable metrics.

- HTML shape: `.metric-strip` with repeated `.metric-item`.
- Visual: all items share width, label grammar, and number scale.
- Motion: cascade from left to right or top to bottom.
- Guardrail: no paragraph notes; use one-line notes only.

### `rowline`

Use for compact comparisons, files, roles, decisions, constraints, or capabilities.

- HTML shape: `.rowline > .row-key + .row-body + .row-meta`
- Visual: key is compact and strong, body is readable, meta is small/status-like.
- Motion: line reveal or cascade.
- Guardrail: rowlines are not cards; keep borders thin and surfaces calm.

### `constraint-chip`

Use for states, limits, requirements, or "must/must not" markers.

- HTML shape: `.constraint-chip[data-state="risk|ok|pending"]`
- Visual: small, high-contrast label, stable height, no tag cloud.
- Motion: appear with the evidence they annotate.
- Guardrail: more than eight chips needs grouping.

## Narrative Components

### `quote-cut`

Use when one sentence should interrupt the slide.

- HTML shape: `.quote-cut > blockquote + .quote-source`
- Visual: large text, strong line-height, source tiny but present.
- Motion: line-by-line reveal.
- Guardrail: do not add quotation marks as oversized decoration unless the theme needs it.

### `callout-note`

Use for one sharp thought beside evidence.

- HTML shape: `.callout-note > .callout-kicker + .callout-body`
- Visual: bordered or background-separated note with enough whitespace.
- Motion: enters after the evidence.
- Guardrail: one callout per slide; otherwise none of them is a callout.

### `manifesto-line`

Use for closing belief or thesis repetition.

- HTML shape: `.manifesto-line` with optional `.manifesto-support`.
- Visual: display type, calm page, no extra UI chrome.
- Motion: slow reveal or static.
- Guardrail: must be sentence-level, not a slogan pile.

## Diagram Components

### `labeled-arrow`

Use only when an exchange has a name.

- HTML shape: `.flow-edge` with visible label near the edge.
- Visual: thin line, arrowhead optional, label always readable.
- Motion: edge appears after both connected nodes.
- Guardrail: unlabeled arrows are invalid.

### `route-stepper`

Use for paths, journeys, build pipelines, or demo sequences.

- HTML shape: `.route-stepper` with repeated `.route-step[data-active]`.
- Visual: visible rail, stable step sizing, current step stronger.
- Motion: reveal one step at a time.
- Guardrail: if the path branches, use decision-tree-lite instead.

### `layer-band`

Use for stack architecture, maturity levels, or dependency layers.

- HTML shape: `.layer-stack > .layer-band`
- Visual: bands align precisely; labels sit inside or left of the band.
- Motion: bottom-up build.
- Guardrail: layers must be dependency order, not random categories.

### `node-cluster`

Use for systems with grouped actors or modules.

- HTML shape: `.node-cluster` containing `.node-group` and `.node`.
- Visual: group boundaries are subtle; edges stay sparse.
- Motion: groups first, nodes second, edges last.
- Guardrail: more than nine nodes should be simplified.

## Media Components

### `figure-frame`

Use for screenshots, UI, diagrams, charts, or photos that are evidence.

- HTML shape: `.figure-frame > img/svg + .figure-caption`
- Visual: contain fit for UI and diagrams; cover fit only for atmospheric photography.
- Motion: static or simple fade-in.
- Guardrail: captions identify evidence, not commentary.

### `evidence-card`

Use when an artifact needs a label, source, and interpretation.

- HTML shape: `.evidence-card > .evidence-media + .evidence-caption + .evidence-takeaway`
- Visual: media dominates, caption is small, takeaway is one sentence.
- Motion: media first, takeaway second.
- Guardrail: do not use as generic decorative card.

### `placeholder-slot`

Use when a needed asset is missing but the slot is structurally important.

- HTML shape: `.placeholder-slot[data-needed="..."]`
- Visual: visible outline, clear intended asset label, low visual weight.
- Motion: none.
- Guardrail: never pretend placeholder is real evidence.

## Navigation And Chrome Components

### `chapter-chrome`

Use to show act/section context.

- HTML shape: `.chapter-chrome` near a stable edge.
- Visual: tiny, consistent, never competes with slide title.
- Motion: usually static.
- Guardrail: do not repeat the slide title.

### `source-foot`

Use for sources, context, or confidence labels.

- HTML shape: `.source-foot`
- Visual: small metadata type, fixed edge, enough contrast for projector.
- Motion: none.
- Guardrail: no long URLs unless required.

## Selection Rules

- Pick component recipes that match the selected layout recipes. Do not add components just because they exist.
- Use shared class naming derived from recipes, but keep the fixed engine selectors untouched.
- Every repeated component must have stable dimensions so dynamic content does not shift the page.
- Record both component recipes and component guardrails in DESIGN.md before writing CSS.
