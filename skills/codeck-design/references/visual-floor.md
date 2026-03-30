# Visual Floor — Minimum Acceptable Impact

Not presets. **Benchmarks to beat.**

After generating design-dna.json and before writing custom.css, compare your planned output against these. If your design is flatter than the closest benchmark, go back to the DNA and push harder.

---

## Benchmark A: Dark Cinematic

When the content has dramatic tension, contrast, or a reveal structure.

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

When the content is structured, authoritative, or informational.

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

When the content is reductive — stripping away to reveal a core truth.

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

### The physics of images

Text argues. Images assert. A photograph lands in the audience's gut before their brain has finished reading the title — it bypasses the verbal processing pipeline entirely and goes straight to emotion. This is not metaphor; it's how human perception works.

When an image fills the entire slide, it stops being an illustration and becomes an environment. The audience is no longer looking *at* something — they're *inside* it. The threshold is somewhere around 60-70% of the canvas: below that, the image is furniture; above it, the image is the room. The same photograph, at different scales, tells completely different stories.

Scarcity multiplies impact. In a deck of twenty text-heavy slides, a single full-bleed photograph hits like a cymbal crash. In a deck where every slide has an image, none of them register. The audience's visual system habituates — each additional image reduces the marginal impact of all the others. The most powerful image in a deck is often the only one.

When the user's materials include images, or when you can generate them, think about this: not *where* to put images, but *where their absence makes the text-only slides more powerful by contrast*. The image isn't decoration. It's a rhythm break — the moment the deck shifts from thinking to feeling.

### Data, comparison, hierarchy

**One number beats a table.** A 120px number with a one-word label is more memorable than a 5-row spreadsheet. The audience will forget the table by the next slide. They'll remember the number next week. When you have data, find the one figure that carries the argument and make it the biggest thing on the page. Everything else is footnote.

**Visual distance = conceptual distance.** Two things being compared should be physically close when they're similar, physically far when they're different. If A and B are nearly identical, put them side by side so the small difference pops. If A and B are opposites, separate them — left vs right, black vs white, big vs small. The spatial layout should make the comparison legible before the audience reads a single word.

**Size is rank.** In any hierarchy, the most important element should be literally the largest. Not metaphorically. Not "emphasized with color." Largest. The eye reads size before it reads anything else — before color, before position, before typography. A pyramid principle argument where the conclusion and the supporting detail are the same font size has no hierarchy. The conclusion is the 80px line. The detail is the 16px line.

### Living surfaces

CSS animations loop. The eye detects the repeat within seconds and tunes it out — the brain classifies it as mechanical and stops paying attention. A shader generates continuous variation that never exactly repeats. The brain can't predict the next frame, so it keeps watching. This is the difference between a screensaver and a fire.

A single slide with a shader background in an otherwise static deck is like a held note that starts vibrating. The audience doesn't know why that page felt different — they just stayed with it longer. The effect comes from contrast with the surrounding stillness.

This is the highest-cost visual tool available. It adds weight to the HTML, demands GPU, and can fail silently on weak hardware. CSS gradients, blend modes, and noise textures can get 80% of the way there with zero risk. But when a page needs to feel alive — not animated, *alive* — a shader is the only thing that does it.

### Contrast fatigue relief

Human eyes adapt to sustained high contrast. 30 slides of white-on-black (or black-on-white) at the same contrast ratio causes fatigue — the audience stops reading without knowing why. Every 4-5 slides, shift the contrast environment: invert light/dark, change background warmth, or drop a breathing page with reduced contrast. This is the visual equivalent of changing the room's lighting.

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
