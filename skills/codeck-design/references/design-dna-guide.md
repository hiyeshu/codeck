# Generation Guide — design-dna.json → custom.css

## Priority

1. **Color + typography** — 80% of visual identity
2. **Spacing + layout** — structural rhythm
3. **Shape + shadow** — surface treatment
4. **design_style** — mood, composition, visual language
5. **visual_effects** — visual enhancements
6. **motion** — animation (add last, after layout and effects are solid)

## design_system → CSS Variables

Map `design_system` fields directly to `:root` variables in custom.css:

```css
:root {
  /* ─── Color ─── */
  --bg: {color.surface.background};
  --fg: {derive: light bg → dark fg, dark bg → light fg};
  --accent: {color.accent.hex};
  --accent2: {color.secondary.hex};
  --primary: {color.primary.hex};
  --surface-card: {color.surface.card};
  --surface-elevated: {color.surface.elevated};

  /* ─── Typography ─── */
  --font-heading: {typography.font_families.heading};
  --font-body: {typography.font_families.body};
  --font-mono: {typography.font_families.mono};

  /* ─── Spacing ─── */
  --space-sm: {spacing.scale[1]}px;   /* typically 16px */
  --space-md: {spacing.scale[3]}px;   /* typically 32px */
  --space-lg: {spacing.scale[5]}px;   /* typically 64px */
  --slide-padding: {spacing.slide_padding};

  /* ─── Shape ─── */
  --radius: {shape.border_radius.medium};
  --radius-sm: {shape.border_radius.small};
  --radius-lg: {shape.border_radius.large};

  /* ─── Shadow ─── */
  --shadow-low: {elevation.levels.low};
  --shadow-md: {elevation.levels.medium};
  --shadow-high: {elevation.levels.high};

  /* ─── Motion ─── */
  --ease: {motion.easing};
  --duration-micro: {motion.duration_scale.micro};
  --duration-normal: {motion.duration_scale.normal};
}
```

**Critical:** `--bg`, `--fg`, `--accent` are engine interface variables. engine.css uses these three to render the progress bar, overview borders, and page numbers. They must be defined.

## design_system → Layout Primitives

Generate layout classes from the `typography` and `slides` fields:

```css
/* ─── Type scale ─── */
.title-mega {
  font-size: {typography.type_scale.display.size};
  font-weight: {typography.type_scale.display.weight};
  line-height: {typography.type_scale.display.line_height};
  letter-spacing: {typography.type_scale.display.tracking};
}
.title-large {
  font-size: {typography.type_scale.heading_1.size};
  font-weight: {typography.type_scale.heading_1.weight};
  line-height: {typography.type_scale.heading_1.line_height};
}
.title-medium {
  font-size: {typography.type_scale.heading_2.size};
  font-weight: {typography.type_scale.heading_2.weight};
}
.body-text {
  font-size: {typography.type_scale.body.size};
  line-height: {typography.type_scale.body.line_height};
}
.caption {
  font-size: {typography.type_scale.caption.size};
  opacity: 0.7;
}

/* ─── Layout primitives ─── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); }
.flex-col { display: flex; flex-direction: column; gap: var(--space-sm); }
.flex-row { display: flex; gap: var(--space-md); align-items: center; }
.card {
  background: var(--surface-card);
  border-radius: var(--radius);
  padding: var(--space-md);
  box-shadow: var(--shadow-low);
}
```

## design_system.slides → Slide Type Styles

```css
/* ─── Cover ─── */
.slide-cover {
  /* map from slides.cover */
  text-align: center;
  justify-content: center;
  align-items: center;
}

/* ─── Section divider ─── */
.slide-divider {
  /* map from slides.section_divider */
  justify-content: center;
  align-items: center;
}

/* ─── Data slide ─── */
.slide-data {
  /* map from slides.data */
}

/* ─── Ending ─── */
.slide-ending {
  text-align: center;
  justify-content: center;
}
```

## design_style → Subjective Decisions

`design_style` does not map to CSS directly — it guides how you write CSS and HTML:

| DNA field | Guidance |
|-----------|----------|
| aesthetic.mood | Overall mood → affects color temperature, spacing density |
| visual_language.whitespace_usage | → padding/margin generosity |
| visual_language.contrast_level | → foreground/background contrast |
| visual_language.focal_strategy | → visual focus handling per slide |
| composition.hierarchy_method | → how hierarchy is expressed (size / color / space) |
| composition.balance_type | → symmetric vs asymmetric layout |
| imagery.graphic_elements | → decorative SVGs, gradients, patterns |

## visual_effects → CSS Enhancements

Implement `visual_effects` with pure CSS — no external libraries.

### Background effects
```css
/* gradient-animation */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.slide-cover {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  background-size: 200% 200%;
  animation: gradient-shift {params.speed} ease infinite;
}
```

### Fragment entrance effects

The engine has four built-in entrance types, selected via `data-f-type`:

| Type | Attribute value | Use case |
|------|----------------|----------|
| fade-up | default (omit) | text, lists, most content |
| scale | `data-f-type="scale"` | images, cards, key numbers |
| blur | `data-f-type="blur"` | large headings, hero copy, cinematic reveals |
| slide | `data-f-type="slide"` | timelines, steps, left-to-right sequences |

Usage: `<div data-f="1" data-f-type="blur">...</div>`

Rule: use one entrance type per slide. Use at most two across the whole deck.

To override the engine's transition duration and easing in custom.css:
```css
[data-f] {
  transition: opacity var(--duration-normal) var(--ease),
              transform var(--duration-normal) var(--ease),
              filter var(--duration-normal) var(--ease);
}
```

### Glass effect
```css
.glass {
  backdrop-filter: blur({params.blur_radius});
  background: rgba(255, 255, 255, {params.transparency});
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Text effects
```css
/* gradient-fill */
.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Mobile

Must include the 768px breakpoint:

```css
@media (max-width: 768px) {
  .title-mega { font-size: calc({display.size} * 0.5); }
  .title-large { font-size: calc({heading_1.size} * 0.6); }
  .body-text { font-size: 18px; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}
```

## Anti-Pattern Blacklist

These are common AI defaults. If you catch yourself using any of them, go back to the DNA and re-derive:

- **Fonts:** Inter / Roboto / Arial — generic, no character. Derive the font from `aesthetic.mood`.
- **Color:** `#6366f1` (Tailwind indigo) — fingerprint of AI-generated UI. If it appears in the DNA palette, question the source.
- **Layout:** everything centered — every slide with `text-align:center; justify-content:center` means no hierarchy. `composition.balance_type` should drive asymmetric choices.
- **Effects:** glassmorphism — trend has passed, hard to execute well. Don't use unless `visual_effects` explicitly specifies it.

## Quality Checklist

Before delivery:
- [ ] Every color traces back to the DNA palette
- [ ] Font families match DNA spec
- [ ] Spacing rhythm matches DNA scale
- [ ] Overall mood matches `design_style.aesthetic.mood`
- [ ] `:root` defines `--bg`, `--fg`, `--accent` (engine interface)
- [ ] `@media (max-width: 768px)` breakpoint present
- [ ] Contrast ≥ 4.5:1 for body text
- [ ] No engine classes overridden (`.slide`, `#progress`, `.mobile-nav`)
- [ ] `prefers-reduced-motion` respected (if animations present)
- [ ] Nothing on the blacklist
