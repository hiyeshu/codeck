# Visual Floor — Minimum Acceptable Impact

Not presets. **Benchmarks to beat.**

After generating design-dna.json and before writing custom.css, compare your planned output against these. If your design is flatter than the closest benchmark, go back to the DNA and push harder.

---

## Benchmark A: Dark Cinematic

Calibration reference, not a style to apply. Your design comes from the isomorphic mapping — use this only to check if your output has enough visual weight.

```css
:root {
  --bg: #08080a;
  --fg: #e8e6e3;
  --accent: #ff6b35;
  --accent2: #3d8bfd;
  --surface-card: rgba(255, 255, 255, 0.04);
  --surface-elevated: rgba(255, 255, 255, 0.08);
  --font-heading: 'Clash Display', system-ui, sans-serif;
  --font-body: 'General Sans', system-ui, sans-serif;
}

/* @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;800&family=General+Sans:wght@400;500&display=swap'); */

/* Background: animated gradient that breathes, not static */
body {
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(61, 139, 253, 0.06) 0%, transparent 50%),
    var(--bg);
}

/* Cover title: massive, gradient-filled, unmissable */
.slide-cover .title-mega {
  font-size: 88px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.95;
  background: linear-gradient(135deg, var(--fg) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Cards: glass surface with glow border */
.card {
  background: var(--surface-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(20px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 8px 40px rgba(0, 0, 0, 0.4);
}

/* Noise texture for analog warmth */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: overlay;
}
```

**What makes this the floor, not the ceiling:**
- Background has color temperature (warm top-left, cool bottom-right) — not flat black
- Title uses gradient fill — not plain white text
- Cards have glass + glow — not just a background color swap
- Noise overlay adds tactile quality — most AI output skips this

---

## Benchmark B: Light Editorial

Calibration reference, not a style to apply. Your design comes from the isomorphic mapping — use this only to check if your output has enough visual weight.

```css
:root {
  --bg: #faf8f5;
  --fg: #1a1a1a;
  --accent: #c41e3a;
  --accent2: #2d5a27;
  --surface-card: #ffffff;
  --surface-elevated: #f0ede8;
  --font-heading: 'Cormorant Garamond', 'Georgia', serif;
  --font-body: 'Source Sans 3', system-ui, sans-serif;
}

/* Background: warm paper, not clinical white */
body {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(196, 30, 58, 0.03) 0%, transparent 60%),
    var(--bg);
}

/* Heading: oversized serif with tight tracking — magazine, not PowerPoint */
.title-mega {
  font-size: 80px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.9;
  color: var(--fg);
}

/* Accent line — a single decisive stroke, not a full border */
.slide-divider::before {
  content: '';
  width: 64px;
  height: 4px;
  background: var(--accent);
  display: block;
  margin-bottom: 24px;
}

/* Card: elevated with hard shadow — not the default soft diffuse */
.card {
  background: var(--surface-card);
  border-radius: 4px;
  padding: 32px;
  box-shadow: 8px 8px 0 var(--surface-elevated);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Data emphasis: the number is the hero, not the label */
.metric-value {
  font-size: 72px;
  font-weight: 800;
  color: var(--accent);
  line-height: 1;
  letter-spacing: -0.03em;
}
.metric-label {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(26, 26, 26, 0.5);
  margin-top: 8px;
}
```

**What makes this the floor:**
- Serif heading with extreme tracking (-0.04em) — editorial, not corporate
- Accent line is a mark, not decoration — gives the page a focal anchor
- Hard shadow on cards — has personality vs generic soft blur
- Data metric is 72px — it dominates, not sits politely next to its label

---

## Benchmark C: Minimal Tension

Calibration reference, not a style to apply. Your design comes from the isomorphic mapping — use this only to check if your output has enough visual weight.

```css
:root {
  --bg: #111111;
  --fg: #ffffff;
  --accent: #ffffff;
  --surface-card: transparent;
  --font-heading: 'Instrument Sans', system-ui, sans-serif;
  --font-body: 'Instrument Sans', system-ui, sans-serif;
}

/* Almost nothing. The emptiness IS the design. */
body { background: var(--bg); }

/* Title: enormous, left-aligned, hugging the bottom edge */
.slide-cover {
  justify-content: flex-end;
  align-items: flex-start;
  padding: 0 80px 64px 80px;
}
.slide-cover .title-mega {
  font-size: 120px;
  font-weight: 200;
  letter-spacing: -0.05em;
  line-height: 0.85;
  color: var(--fg);
}

/* Content slides: one statement, massive, centered vertically */
.slide-statement .body-text {
  font-size: 48px;
  font-weight: 300;
  line-height: 1.3;
  max-width: 700px;
  color: rgba(255, 255, 255, 0.85);
}

/* The only accent: a thin horizontal rule that means "pause here" */
.divider {
  width: 48px;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  margin: 40px 0;
}

/* Final slide: fade to near-black, single small line */
.slide-ending {
  background: #0a0a0a;
}
.slide-ending .body-text {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.4);
}
```

**What makes this the floor:**
- 120px ultra-light title at bottom-left — asymmetry creates tension from nothing
- Body text at 48px on content slides — each slide is one thought, unavoidable
- Divider is 48px × 1px — restrained to the point of being a whisper
- Final slide dims the background and shrinks the text — the deck literally fades out
- Zero decoration. The whitespace does all the work. This is harder to pull off than Benchmark A.

---

## How to use these benchmarks

After writing design-dna.json, before writing custom.css:

1. **Pick the closest benchmark** to your DNA's mood and content structure
2. **Compare element by element:** Is your title as bold? Your background as layered? Your cards as tactile? Your data as dominant?
3. **If your planned CSS is flatter than the benchmark** — you haven't pushed the DNA far enough. Go back to design-dna.json and intensify: more contrast, more scale difference, more surface depth, more decisive color
4. **Then diverge** — your output should match the isomorphic mapping, not the benchmark. The benchmark just ensures you don't settle for mediocre

The rule: **structurally unique (from the mapping), visually at least this good (from the floor).**

---

## Deck-level techniques

Single-page quality is necessary but not sufficient. These techniques operate across pages — they're what separates a deck from 12 copies of the same slide.

### Color temperature drift

Shift `--bg` per page to follow the emotional arc. Don't change the palette — change the temperature.

```css
/* Cold open (analytical, establishing) */
.slide:nth-child(-n+3) { --bg: #0a0f1a; }

/* Warm peak (tension, conflict, the key argument) */
.slide:nth-child(n+5):nth-child(-n+8) { --bg: #1a0f0a; }

/* Resolved (conclusion — cooler than peak, warmer than open) */
.slide:nth-child(n+10) { --bg: #0f1218; }
```

### Density inversion

Every 3-4 pages, flip from dense to sparse or vice versa. A page packed with 4 metric cards followed by a page with one sentence and 80% whitespace. This is forte → piano. Without it, every page feels the same volume.

### Breathing pages

Some slides exist to make the audience feel, not think. A single word. A color inversion. A number at 200px with nothing else. These slides have no bullet points, no cards — just one element and space. Insert at least one per deck section.

### Type as illustration

When you can't use images, type itself becomes the visual element.

```css
/* Giant character as page texture */
.slide-question::before {
  content: '?';
  position: absolute;
  right: -5%;
  bottom: -10%;
  font-size: 400px;
  font-weight: 900;
  opacity: 0.04;
  line-height: 1;
  color: var(--fg);
}
```

A 400px `?` as background texture. A `3x` with `-webkit-text-stroke` as a data page watermark. The letter is not content — it's atmosphere.

### mix-blend-mode for light and depth

One pseudo-element with a radial gradient and `mix-blend-mode: overlay` creates the illusion of light falling on the surface. Zero-cost depth.

```css
.slide-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 0%, var(--accent), transparent 60%);
  mix-blend-mode: overlay;
  opacity: 0.4;
  pointer-events: none;
}
```

### Inline SVG generative texture

`<svg>` with `feTurbulence` generates noise, grain, and organic patterns — resolution-independent, under 500 bytes. Use as a slide `::after` overlay for tactile warmth.

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
</svg>
```
```css
.slide::after {
  content: '';
  position: absolute;
  inset: 0;
  filter: url(#grain);
  opacity: 0.03;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```
