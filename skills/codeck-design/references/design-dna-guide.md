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

**Type scale must be a ratio, not arbitrary values.** Pick a base (`--body-size`, typically `clamp(16px, 1.2vw, 20px)`) and a ratio derived from the design role — high-contrast roles (Caravaggio, Brutalism) want 2×+, compressed roles (Tufte, Rams) want 1.2×, most fall between 1.3× and 1.8×. Then: `.caption` = base × ratio^-1, `.body-text` = base, `.title-medium` = base × ratio, `.title-large` = base × ratio², `.title-mega` = base × ratio³. The ratio IS a design decision — derive it from the DNA, don't default it.

## design_system.slides → Slide Type Styles

Map `slides.cover`, `slides.section_divider`, `slides.data`, `slides.ending` from the DNA to `.slide-cover`, `.slide-divider`, `.slide-data`, `.slide-ending` classes. Derive layout, alignment, and type scale from the DNA — don't default to centered everything.

**Padding is a system, not per-slide guesswork.** Define slide padding once with viewport units (e.g. `8vh 6vw`) and share it across all slide types. Individual slides can override, but the default rhythm comes from one place.

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

Width breakpoint (mobile):
```css
@media (max-width: 768px) {
  .title-mega { font-size: calc({display.size} * 0.5); }
  .title-large { font-size: calc({heading_1.size} * 0.6); }
  .body-text { font-size: 18px; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}
```

Height breakpoints (laptop with browser chrome, external monitors):
```css
@media (max-height: 700px) {
  .slide { padding: 40px 60px; }
  .title-mega { font-size: calc({display.size} * 0.75); }
  .title-large { font-size: calc({heading_1.size} * 0.8); }
}
@media (max-height: 500px) {
  .slide { padding: 24px 40px; }
  .title-mega { font-size: calc({display.size} * 0.55); }
  .caption, .decorative { display: none; }
}
```

## Anti-Pattern Blacklist

If you catch yourself using any of these, go back to the DNA and re-derive:

- Inter / Roboto / Arial / system-ui as display fonts — AI fingerprint, no character. Google Fonts is open now — use distinctive faces (Clash Display, Fraunces, Syne, Cormorant, Archivo Black...). Never converge on Space Grotesk across decks.
- `#6366f1` (Tailwind indigo) — AI fingerprint
- Every slide centered — no hierarchy. Let `composition.balance_type` drive asymmetry
- Default glassmorphism — don't use unless DNA explicitly specifies it

## Quality Checklist

Before delivery:
- [ ] Every color traces back to the DNA palette
- [ ] Font families match DNA spec
- [ ] Spacing rhythm matches DNA scale
- [ ] Overall mood matches `design_style.aesthetic.mood`
- [ ] `:root` defines `--bg`, `--fg`, `--accent` (engine interface)
- [ ] `@media (max-width: 768px)` width breakpoint present
- [ ] `@media (max-height: 700px)` and `@media (max-height: 500px)` height breakpoints present
- [ ] Contrast ≥ 4.5:1 for body text
- [ ] No engine classes overridden (`.slide`, `#progress`, `.mobile-nav`)
- [ ] `prefers-reduced-motion` respected (if animations present)
- [ ] Nothing on the blacklist
