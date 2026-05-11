<!--
[INPUT]: Depends on slide need, layout media slot, source assets, and selected theme preset.
[OUTPUT]: Provides prompt recipes for generated, cleaned, redesigned, or composited deck assets.
[POS]: codeck-design/references visual library; complements asset-guide.md with reusable prompt shapes.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Image Prompt Recipes

Use these prompts only when a raster asset helps the slide. Generated images are slide assets, not mini slides. They must not contain deck titles, page numbers, footers, watermarks, signatures, or decorative frames.

Record selected prompt recipes in DESIGN.md:

```markdown
## Image Assets
Image prompt recipes: screenshot-redesign, system-infographic
Generated prompts:
| Slide | Recipe | Output | Constraint |
```

## Universal Constraints

Append these constraints to every generated asset prompt:

```text
No slide title, no footer, no page number, no logo unless supplied by the user, no watermark, no signature, no decorative border, no UI chrome unless requested. Leave safe negative space for HTML text. Match the deck language for any labels. Ratio: {slot ratio}.
```

If the asset represents a real product, dataset, person, legal text, chart value, or brand UI, do not invent or alter facts. Clean, crop, or annotate instead.

## Prompt Recipes

### `documentary-photo`

Use for human context, field work, real-world use, and atmosphere.

```text
Editorial documentary photograph about {slide idea}. Real setting, natural light, grounded composition, restrained color palette matching {theme preset}, one clear focal subject, subtle environmental detail, room for overlaid HTML text. {universal constraints}
```

### `product-context-photo`

Use when a product is used in a believable setting without showing fake UI.

```text
Realistic product-context photograph showing {user/persona} using {product category or workflow} in {setting}. Focus on situation and posture, not readable UI. Natural light, credible objects, no staged advertising feel, visual tone matching {theme preset}. {universal constraints}
```

### `screenshot-cleanup`

Use when the user provides a real screenshot that needs stage readability.

```text
Clean this provided screenshot for a presentation: preserve all factual UI content, labels, values, product identity, and layout relationships. Improve contrast, crop empty browser chrome, normalize margins, sharpen text, and fit a {slot ratio} slide media slot. Do not redesign the product or change any text. {universal constraints}
```

### `screenshot-redesign`

Use when a messy screenshot should become a slide-safe explanatory asset, and factual UI can be abstracted.

```text
Redesign the provided screenshot as a clean presentation-safe UI diagram. Preserve the real workflow, labels that matter, hierarchy, and product meaning. Remove noise, simplify panels, align spacing, and use the deck visual system: {theme preset}. Do not invent features, values, or brand marks. {universal constraints}
```

### `system-infographic`

Use for architectures, protocols, data flow, validation, and tool boundaries.

```text
Clean vector-like system infographic explaining {system relationship}. Use labeled nodes, sparse labeled arrows, clear grouping, and a visual style matching {theme preset}. Keep labels short and in {language}. No tiny text, no decorative icons, no unlabeled arrows. {universal constraints}
```

### `process-diagram`

Use for linear workflows or pipelines.

```text
Presentation-ready process diagram for {process}. Show {number} stages from {start} to {end}, each with a short label and one visual cue. Use stable spacing, one highlighted current/bottleneck stage, and the visual tone of {theme preset}. {universal constraints}
```

### `comparison-visual`

Use for before/after or old/new.

```text
Side-by-side comparison visual showing {before state} versus {after state}. Keep both sides parallel in scale and grammar, with one central transformation cue. Style should match {theme preset}. Do not add unsupported claims or numbers. {universal constraints}
```

### `data-poster`

Use when one metric needs a visual support image, not when HTML type can do it better.

```text
Data-poster background asset for the metric {metric}. Abstract supporting geometry only, no rendered number or title because HTML will carry the text. High contrast negative space, visual rhythm matching {theme preset}. {universal constraints}
```

### `artifact-collage`

Use when several source artifacts need one composite.

```text
Compose the provided artifacts into one presentation visual. Keep each source recognizable, normalize scale and lighting, align margins, reduce clutter, and leave a clear HTML text area. Do not alter factual text, values, or UI hierarchy. {universal constraints}
```

### `map-or-route`

Use for trip, logistics, routing, operations, or geography-like structures.

```text
Map-like editorial visual for {route/system}. Use abstract blocks, route rail, labels, and constraint markers rather than realistic cartography unless real map data is provided. Style matches {theme preset}. Do not invent real places or distances. {universal constraints}
```

### `icon-set`

Use only when repeated icons are structurally useful.

```text
Small consistent icon set for {concept list}. Single stroke logic, no filled emoji style, no text inside icons, no brand marks, transparent background, visually compatible with {theme preset}. {universal constraints}
```

## Selection Rules

- Prefer CSS, SVG, and typography when the image would be decorative.
- Prefer `screenshot-cleanup` over `screenshot-redesign` when factual UI matters.
- Prefer `system-infographic` over a stock photo for abstract technical concepts.
- Generated diagrams must use short labels and cannot contain paragraphs.
- Every generated or processed asset path belongs in DESIGN.md and roles/design.md.
