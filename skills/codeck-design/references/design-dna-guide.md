# Generation Guide — design-dna.json → custom.css

## Canvas

The engine renders every slide at **1280 × 720 px** and uses `transform: scale()` to fit any screen. Inside a slide you are working in a fixed coordinate system — use `px`, not `vw`/`vh`/`rem`. An element that should span 40 % of the slide width is `width: 512px`. Font sizes, spacing, border-radius — all in `px`, all relative to 1280 × 720. Fill the canvas.

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

  /* ─── Typography (Google Fonts + system fallback) ─── */
  --font-heading: {typography.font_families.heading}, system-ui, sans-serif;
  --font-body: {typography.font_families.body}, system-ui, sans-serif;
  --font-mono: {typography.font_families.mono}, ui-monospace, monospace;

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

Generate type scale classes (`.title-mega`, `.title-large`, `.title-medium`, `.body-text`, `.caption`) from `typography.type_scale`, and layout primitives (`.grid-2`, `.grid-3`, `.flex-col`, `.flex-row`, `.card`) using the spacing and shape variables.

**Type scale must be a ratio, not arbitrary values.** Pick a base (`--body-size`, typically `20px` on the 1280×720 canvas) and a ratio derived from the design role. Then: `.caption` = base × ratio^-1, `.body-text` = base, `.title-medium` = base × ratio, `.title-large` = base × ratio², `.title-mega` = base × ratio³. The ratio is a design decision — derive it from the DNA, don't default it.

## design_system.slides → Slide Type Styles

Map `slides.cover`, `slides.section_divider`, `slides.data`, `slides.ending` from the DNA to `.slide-cover`, `.slide-divider`, `.slide-data`, `.slide-ending` classes. Derive layout, alignment, and type scale from the DNA — don't default to centered everything.

**Padding is a system, not per-slide guesswork.** Define slide padding once in `px` (e.g. `60px 80px` on the 1280×720 canvas) and share it across all slide types. Individual slides can override, but the default rhythm comes from one place.

**Visual center sits at ~40-45% from top, not geometric center.** Projected slides are viewed above eye level; laptop viewports lose bottom space to browser chrome. Use `padding-top` > `padding-bottom` or `align-content: center` with slight upward bias to place content mass in the audience's natural focal zone.

## design_style → Subjective Decisions

`design_style` does not map to CSS directly — it guides how you write CSS and HTML. Let `aesthetic.mood` drive color temperature, `composition.balance_type` drive layout symmetry, `visual_language.focal_strategy` drive per-slide emphasis.

## visual_effects → CSS Enhancements

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

Custom types: define `[data-f-type="yourname"]` initial state in custom.css; the engine handles reveal automatically (`.visible` resets opacity, transform, filter).
```css
[data-f-type="rotate"] { transform: rotate(-5deg) scale(0.95); }
[data-f-type="drop"]   { transform: translateY(-20px); opacity: 0; }
```

Guideline: one entrance type per slide for coherence. Across the deck, use as many types as the design role calls for — a cinematic deck might use all four plus custom types, a minimal deck might use only fade-up. The role decides, not a fixed cap.

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

## Responsive

The engine's `transform: scale()` already adapts slides to any viewport. You do not need `@media` breakpoints for slide content — no width breakpoints, no height breakpoints. The engine handles it.

`@media` queries in custom.css are only for engine UI elements (progress bar, mobile nav) which the AI does not write. Leave them to the engine.

## Platform Constraints

These are engine facts, not aesthetic preferences:

- **Canvas is 1280 × 720 px.** All sizing in `px`. No `vw`/`vh`/`rem` inside slides.
- **Don't set `position` on `.slide` or `.slide-*`.** The engine uses `position: absolute` to fill the viewport. Overriding it breaks layout.
- **Google Fonts need fallback.** Always include `system-ui, sans-serif` (or `monospace`) after the Google Font name. Offline viewers see system fonts, not broken blanks.
- **`--bg`, `--fg`, `--accent` are engine interface variables.** They must be defined in `:root`. The engine reads them for progress bar, overview, and page numbers.

## Quality Checklist

Before delivery:
- [ ] `:root` defines `--bg`, `--fg`, `--accent` (engine interface)
- [ ] All sizing in `px` based on 1280 × 720 canvas
- [ ] Google Fonts have `system-ui` fallback
- [ ] No `position` set on `.slide` or `.slide-*`
- [ ] No engine classes overridden (`.slide`, `#progress`, `.mobile-nav`)
- [ ] `prefers-reduced-motion` respected (if animations present)
