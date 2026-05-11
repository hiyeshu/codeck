<!--
[INPUT]: Depends on diagnosis.md tone, user references, and selected layout recipes.
[OUTPUT]: Provides named visual systems with palette, type, material, and motion defaults.
[POS]: codeck-design/references visual library; gives models high-quality starting palettes without freezing templates.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Theme Presets

Theme presets are starting points, not brands. Select one preset, adapt it to the content, and record it in DESIGN.md.

```markdown
## Overview
Theme preset: swiss-ink
Adaptation: keep the grid discipline, but warm the neutral background because the audience is non-technical.
```

## Presets

### `swiss-ink`

Use for product, technical, operating-system, method, and analysis decks that need confidence and precision.

- Palette: near-white or charcoal foundation, one saturated anchor, neutral gray scale, no gradients by default.
- Type: grotesk or neo-grotesk sans for headings, same family for body, mono only for labels/code.
- Layout: hard grid, large type contrast, hairline dividers, rectangular blocks.
- Material: flat, no shadow, no glass, no glow.
- Motion: crisp line reveal, short cascade, directional slide for comparisons.
- Avoid: rounded cards, soft gradients, decorative icons, centered generic title pages.

Suggested tokens:

```yaml
colors:
  primary: "#111111"
  secondary: "#E6E8EC"
  accent: "#0047FF"
  neutral: "#F7F7F2"
  surface-card: "#FFFFFF"
  surface-elevated: "#F0F1F4"
```

### `editorial-ink`

Use for narrative, industry observation, founder essays, culture, and human-centered product stories.

- Palette: paper neutral, ink dark, one muted accent, restrained warm/cool support colors.
- Type: serif display + humanist sans body, mono only for metadata.
- Layout: magazine spreads, strong image slots, generous margins, captions as first-class elements.
- Material: paper grain optional, soft image treatment, almost no shadow.
- Motion: slow fade-up, quote line reveal, image parallax simulated with CSS transforms.
- Avoid: dashboard cards, excessive chips, neon accents, fake magazine clutter.

Suggested tokens:

```yaml
colors:
  primary: "#1C1A17"
  secondary: "#8A6F4D"
  accent: "#B94E2F"
  neutral: "#F4EFE5"
  surface-card: "#FFFDF7"
  surface-elevated: "#EFE4D3"
```

### `field-board`

Use for operational tools, travel/workflow planning, field research, logistics, and "real-world constraints" stories.

- Palette: off-white map stock, dark ink, safety accent, muted greens/blues for terrain or state.
- Type: sturdy sans for headings, tabular mono for coordinates/status, readable body.
- Layout: boards, tickets, route rails, constraint walls, map-like blocks.
- Material: paper, rule lines, stamps, status labels; shadows only as slight separation.
- Motion: step-by-step reveal, route draw, status flip.
- Avoid: glossy SaaS gradient, decorative map pins, fake travel photography.

Suggested tokens:

```yaml
colors:
  primary: "#25312B"
  secondary: "#7E8B6F"
  accent: "#D65A31"
  neutral: "#F2EFE5"
  surface-card: "#FCFAF2"
  surface-elevated: "#E5DDC8"
```

### `cinematic-contrast`

Use for high-tension arguments, launches, before/after stories, security/risk, and emotionally charged reveals.

- Palette: black or deep graphite foundation, high-contrast text, one luminous accent, limited support color.
- Type: condensed or sharp sans display, calm sans body, labels in small mono.
- Layout: hero frames, darkness as negative space, one spotlighted object per slide.
- Material: gradients allowed as light, not background decoration; shadow is part of the scene.
- Motion: dramatic but sparse: fade-through-black, blur-in title, one macro reveal.
- Avoid: using dark mode for every deck; glowing every object; low-contrast gray text.

Suggested tokens:

```yaml
colors:
  primary: "#F6F1E8"
  secondary: "#5F6673"
  accent: "#FFB000"
  neutral: "#090A0F"
  surface-card: "#151820"
  surface-elevated: "#20242E"
```

### `system-blueprint`

Use for architecture, protocols, developer tools, data flow, validation, and system boundaries.

- Palette: blueprint blue or pale drafting paper, ink lines, one warning/accent color.
- Type: clean sans headings, mono for identifiers, small captions for contracts.
- Layout: diagrams, layer-cake, system-map, exploded-view, rowlines.
- Material: fine lines, grid ticks, labels, no heavy cards.
- Motion: build diagram layer by layer; arrows appear only with labels.
- Avoid: unlabeled arrows, tiny code screenshots, pretending diagrams are decorative.

Suggested tokens:

```yaml
colors:
  primary: "#0E2A47"
  secondary: "#AFC7DD"
  accent: "#F25C54"
  neutral: "#EEF5FA"
  surface-card: "#FFFFFF"
  surface-elevated: "#DCEAF5"
```

### `soft-lab`

Use for research, education, design exploration, and complex topics that need calm attention.

- Palette: light neutral, low-saturation scientific colors, one clear accent, generous contrast.
- Type: readable sans, optional serif display for chapter breaks.
- Layout: explain-panels, evidence strips, diagrams, annotated figures.
- Material: light surfaces, subtle dividers, no heavy shadows.
- Motion: gentle cascade and controlled fragment steps.
- Avoid: beige monotony, oversized hero treatment on every slide, vague pastel blobs.

Suggested tokens:

```yaml
colors:
  primary: "#22313F"
  secondary: "#7A8E99"
  accent: "#2F80ED"
  neutral: "#F6F7F2"
  surface-card: "#FFFFFF"
  surface-elevated: "#E9EFEF"
```

## Selection Rules

- Pick one preset unless the user gave a stronger brand reference.
- Change at most two core palette roles without recording why.
- Preserve the preset's material logic. Do not put glass cards into `swiss-ink` or neon glows into `editorial-ink`.
- If none fit, define `custom-{short-name}` in DESIGN.md and explain which preset it most closely rejects.
