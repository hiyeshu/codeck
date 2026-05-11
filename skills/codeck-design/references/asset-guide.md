# Asset References Guide

`deck.md` asset list marks each resource's level:

## Asset Work Contract

Asset work starts from the slide need, not from an image category.

The contract:

- Preserve meaning.
- Fit the slot.
- Serve the slide.
- Record what changed.

Decision order:

1. Define the visual job: evidence, atmosphere, explanation, comparison, product proof, system structure, or emotional stake.
2. Choose the slot and ratio from the skeleton.
3. Inspect user-provided assets first.
4. Prefer HTML, CSS, or SVG when editability or factual precision matters.
5. Use raster work only when it adds clear value: photo treatment, screenshot cleanup, generated scene, composite visual, or image polish.

Default actions:

- If the user provides a usable image, improve crop, contrast, framing, and ratio without asking.
- If a screenshot is too tall, noisy, or low contrast, create a cleaned derivative.
- If a visual is missing and the slide needs one, generate or compose an asset.
- If a diagram needs exact labels or future edits, draw it in HTML/SVG instead of generating a raster image.
- If an image would only decorate, skip it.

Ask only when the asset work changes meaning, identity, facts, legal/brand content, or the deck's visual direction.

## Recording

Write visual asset strategy to `DESIGN.md`:

```markdown
## Image Assets

Strategy: {how images support this deck's argument and skeleton}

| Slide | Source | Output | Work | Slot | Ratio | Reason |
|-------|--------|--------|------|------|-------|--------|
| 3 | raw screenshot | assets/03-dashboard-clean.png | clean + crop | UI beside text | 16:10 | make the workflow readable on stage |
```

Write lane state to `roles/design.md`:

```markdown
## Asset Work

- Current rule: {crop / contain / generate / skip}
- Generated or processed files:
  - assets/03-dashboard-clean.png — cleaned from {source}
```

If `deck.md` needs an asset manifest update, write a proposal to `threads/threads.md`; `@outline` owns `deck.md`.

For generated assets, include prompt constraints in `DESIGN.md`:

```markdown
| Slide | Output | Prompt seed | Negative constraints |
|-------|--------|-------------|----------------------|
| 4 | assets/04-system-map-generated.png | {short slot-aware prompt} | no slide chrome, no logo, no footer, no page number |
```

## Example Asset Shapes

These are examples, not modes. Start from the slide need, then borrow a shape if useful.

### Documentary Visual

Use when the slide needs reality, atmosphere, human stakes, or a field anchor.

Good for:

- opening hook
- founder or team story
- field scene
- audience pain
- physical artifact

Avoid when:

- the slide needs exact evidence
- the scene could be mistaken for a real documented event
- a diagram would explain better

Prompt seed:

```text
Horizontal editorial documentary image about {slide idea}. Real setting, natural light, low saturation, subtle grain, room for overlaid slide text. No logo, watermark, staged advertising, slide title, footer, page number, signature, or decorative frame. Ratio: {slot ratio}.
```

### Explanatory Diagram

Use when the slide needs to make structure visible.

Good for:

- system relationship
- before/after
- pipeline
- data flow
- concept map
- stakeholder map

Avoid when:

- HTML/SVG can draw it more accurately
- labels must be exact and editable
- the diagram is core evidence

Prompt seed:

```text
Horizontal explanatory diagram showing {relationship or process}. Fine lines, nodes, short labels, clear spacing, restrained palette matching the deck. Text language: {language}. No slide title, header, footer, page number, logo, watermark, signature, or decorative frame. Ratio: {slot ratio}.
```

### UI Screenshot Redesign

Use when the user provides a screenshot but it is too tall, messy, low contrast, or visually inconsistent.

Good for:

- product workflow
- dashboard
- code editor
- browser workspace
- design tool screen
- before/after product state

Avoid when:

- the screenshot is legal, audit, or compliance evidence
- exact UI text must stay pixel-true
- brand identity must remain unchanged

Prompt seed:

```text
Redesign this interface screenshot into a slide-safe horizontal UI visual. Preserve the real workflow feeling, improve hierarchy, contrast, spacing, and readability. Keep text in {language}. Do not invent brand logos or new facts. No slide title, footer, page number, signature, watermark, or decorative frame. Ratio: 16:10.
```

### Data Poster

Use when one number carries the argument.

Good for:

- key metric
- shocking contrast
- milestone
- market size
- time saved
- cost reduced

Avoid when:

- many numbers compete
- chart accuracy matters
- the number still needs source validation

Prompt seed:

```text
Horizontal data-poster visual centered on the number {number}, meaning {meaning}. Large typographic number, short supporting annotation, fine lines, paper-like texture, restrained palette matching the deck. No slide title, footer, page number, logo, watermark, signature, or decorative frame. Ratio: 16:9.
```

### Composite Visual

Use when one slide needs to combine several existing assets into one clearer visual.

Good for:

- three screenshots into one panel
- photo plus annotation
- product state sequence
- source material collage
- timeline wall

Avoid when:

- composition hides evidence
- user assets must stay untouched
- a simple HTML layout works better

Prompt seed:

```text
Compose these assets into one horizontal presentation visual. Keep each source recognizable, normalize scale, margin, contrast, and visual density, and leave room for HTML text. Do not add facts, logos, slide chrome, page numbers, signature, watermark, or decorative frame. Ratio: {slot ratio}.
```

### Cleaned User Image

Use when a user-provided image is semantically right but visually weak.

Good for:

- dark screenshots
- blurry exports
- uneven photo crop
- noisy background
- mixed-ratio image sets

Avoid when:

- cleanup would remove meaningful details
- crop would hide evidence
- the user requested the original untouched

Prompt seed:

```text
Clean this image for a 16:9 presentation slide while preserving its meaning. Improve crop, exposure, contrast, and readability. Do not change factual content, people, product UI, chart values, logos, or text. No slide chrome, footer, page number, signature, watermark, or decorative frame. Ratio: {slot ratio}.
```

If none of these examples fit, create the right asset shape. The shape is a servant, not the rule.

## inline
Images use `assets/` path (assemble.sh auto-base64). SVG inline directly.
```html
<img src="assets/architecture.png" alt="System architecture" style="max-width:80%">
<svg viewBox="0 0 100 100">...</svg>
```

## poster
Video/audio/large files use cover image + play placeholder.
```html
<div class="media-poster">
  <img src="assets/demo-cover.jpg" alt="Demo video">
  <div class="play-icon">&#9654;</div>
  <p class="caption">demo.mp4</p>
</div>
```
Add `.media-poster` styles in custom.css (centered, rounded, semi-transparent play icon overlay).

## extract
Code uses `<pre><code>`, data uses tables or CSS charts.
```html
<pre><code class="lang-typescript">function resolve(state: State): Action {
  return state.match(patterns);
}</code></pre>

<div class="bar" style="--val:85%">Conversion rate 85%</div>
```
