# DESIGN.md Spec for codeck

Based on [Google design.md](https://github.com/google-labs-code/design.md) format specification. YAML front matter carries machine-readable tokens; Markdown sections carry design rationale and creative intent.

## codeck environment

Output: 16:9 HTML presentation. Engine JS is fixed; AI writes HTML + CSS only.

- **No JS in slides** — engine.js handles all interaction; slides.html contains only HTML + CSS classes
- **Google Fonts allowed** — use `@import url('https://fonts.googleapis.com/css2?...')` at the top of custom.css (assemble.sh places it inside `<style>` in `<head>`). Always include a system font fallback stack so the deck degrades gracefully offline.
- **CSS + inline SVG only** — all visual effects must be achievable with CSS @keyframes, CSS filters, backdrop-filter, gradients, and inline `<svg>` elements
- **No other CDN** — no script tags, no external assets besides Google Fonts

Record the full design intent in every section. For effects beyond CSS+SVG, describe the intent (the AI will find the closest CSS approximation). This preserves the design vision if the deck is later rendered in a richer environment.

---

## File structure

A codeck DESIGN.md has two layers:

1. **YAML front matter** — machine-readable design tokens, delimited by `---` fences
2. **Markdown body** — human-readable design rationale organized into `##` sections

The tokens are the normative values. The prose provides context for how to apply them.

## Token schema

```yaml
---
version: alpha
name: <string>
description: <string>

colors:
  primary: <Color>           # deep/dominant brand color
  secondary: <Color>         # supporting color
  accent: <Color>            # interactive/highlight color
  neutral: <Color>           # background foundation
  surface-card: <Color>      # card/panel background
  surface-elevated: <Color>  # elevated surface (modals, popovers)
  success: <Color>
  warning: <Color>
  error: <Color>
  info: <Color>

typography:
  display:
    fontFamily: <string>
    fontSize: <Dimension>
    fontWeight: <number>
    lineHeight: <number>
    letterSpacing: <Dimension>
  heading-1:
    fontFamily: <string>
    fontSize: <Dimension>
    fontWeight: <number>
    lineHeight: <number>
    letterSpacing: <Dimension>
  heading-2: ...
  heading-3: ...
  body: ...
  body-small: ...
  caption: ...
  overline: ...
  font-heading: <string>     # heading font family name
  font-body: <string>        # body font family name
  font-mono: <string>        # monospace font family name

spacing:
  base-unit: <Dimension>
  sm: <Dimension>
  md: <Dimension>
  lg: <Dimension>
  slide-padding: <string>    # e.g. "60px 80px"

rounded:
  sm: <Dimension>
  md: <Dimension>
  lg: <Dimension>
  pill: <Dimension>

components:
  button:
    backgroundColor: <Color | token reference>
    textColor: <Color | token reference>
    rounded: <Dimension | token reference>
  card:
    backgroundColor: <Color | token reference>
    rounded: <Dimension | token reference>
---
```

### Token types

| Type | Format | Example |
|:-----|:-------|:--------|
| Color | `#` + hex (sRGB) | `"#1A1C1E"` |
| Dimension | number + unit (`px`, `em`, `rem`) | `48px`, `-0.02em` |
| Token reference | `{path.to.token}` | `{colors.primary}` |

### codeck-specific tokens

Beyond the Google design.md base schema, codeck adds:

- `colors.surface-card` and `colors.surface-elevated` — slide surface layers
- `spacing.slide-padding` — presentation-specific padding
- `typography.font-heading/font-body/font-mono` — shorthand family names for CSS variable generation

These are valid under the Google spec (unknown token names are accepted if values are valid).

## Section order

Sections use `##` headings. They can be omitted, but those present must appear in this order:

| # | Section | What it carries |
|:--|:--------|:----------------|
| 1 | Overview | Isomorphic mapping, mood, visual metaphor, era influence, personality, design philosophy |
| 2 | Colors | Palette type, each color's role, contrast strategy |
| 3 | Typography | Type scale ratio derivation, font selection rationale, style notes |
| 4 | Layout | Grid system, columns, alignment tendency, content density, section rhythm |
| 5 | Elevation & Depth | Shadow style, depth cues, level descriptions |
| 6 | Shapes | Border usage, divider style |
| 7 | Components | Button/card/navigation/modal/list design intent |
| 8 | Visual Effects | Background effects, particles, glass, text effects, fragment entrances, motion philosophy, easing, duration scale |
| 9 | Do's and Don'ts | Focal strategy, whitespace usage, contrast level, ornamentation, what to avoid |

### Section details

**## Overview** — the creative soul. This is where the isomorphic mapping lives. Describe the structural analogy between the content and the design (e.g., "layered business proposal → Ravel's Bolero: simple to complex, each page adds a layer"). Include mood, visual metaphor, era influence, genre, personality traits. This section replaces `design_style.aesthetic` from the old schema.

**## Visual Effects** — codeck extension section. The Google spec preserves unknown sections without error. Describe background effects, particle systems, glassmorphism, text effects, cursor effects, SVG animations, and fragment entrance types. For effects beyond CSS+SVG, describe the intent. This section replaces `visual_effects` from the old schema. Also include motion philosophy, easing curves, and duration scale (micro/normal/macro) here.

**## Do's and Don'ts** — design guardrails. Derived from the old `design_style.visual_language`, `composition`, and `imagery` fields. Describe complexity level, ornamentation, whitespace usage, visual weight distribution, focal strategy, contrast level, texture usage, hierarchy method, balance type, flow direction, photo treatment, illustration style, graphic elements.

## Completeness rule

Every section must be populated with deliberate decisions. No placeholder text. For sections that don't apply, write "Not applicable — [reason]" rather than omitting. Complete DESIGN.md forces deliberate decisions across all dimensions.

## Example

```markdown
---
version: alpha
name: Bolero Crescendo
description: Layered business proposal — each page adds an instrument
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
  display:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  heading-1:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.01em
  body:
    fontFamily: Source Sans 3
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  caption:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.02em
  font-heading: Playfair Display
  font-body: Source Sans 3
  font-mono: JetBrains Mono
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
  button:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.md}"
---

## Overview

Ravel's Bolero as visual architecture. The proposal builds like the orchestral piece — a single theme introduced simply, then each page adds a new instrument (data layer, visual complexity, color saturation) until the full orchestra plays on the closing slide.

Warm, editorial, quietly confident. The aesthetic sits between a premium annual report and a gallery exhibition catalog. No flash — the content earns attention through accumulation.

## Colors

Earth-toned palette rooted in warmth and trust. Primary deep navy for authority without coldness. Accent warm copper draws the eye to key numbers and CTAs. Neutral warm limestone — softer than white, more alive than gray.

Contrast strategy: high contrast for text (primary on neutral), medium contrast for decorative elements (secondary on neutral), accent reserved for singular focal points per slide.

## Visual Effects

Fragment entrances: fade-up for body content, blur for hero headings (cinematic reveal matching the crescendo metaphor), scale for key data points.

Motion philosophy: deliberate and unhurried. Easing: cubic-bezier(0.25, 0.1, 0.25, 1.0). Duration: micro 150ms, normal 400ms, macro 800ms.

Background: subtle warm gradient shift on cover slide (limestone to cream, 20s cycle). No particles, no glass — the Bolero metaphor is about clarity building, not decoration.

## Do's and Don'ts

Do: let whitespace increase as content density increases (breathing room scales with complexity). Use typography size contrast as primary hierarchy tool. Keep one focal point per slide.

Don't: use more than two colors on any single slide. Add decorative elements that don't serve the accumulation metaphor. Break the warm-to-warm color temperature.
```
