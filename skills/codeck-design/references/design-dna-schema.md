# Design DNA Schema — Presentation Edition

Three-dimensional design archive:
- **design_system** — quantifiable design tokens
- **design_style** — qualitative perception
- **visual_effects** — special rendering (CSS animations, SVG, Canvas)

Every field must appear in the final JSON. Write `"none"` or `false` for fields that don't apply.

## Top-Level Structure

### `meta`
- `name` — archive name
- `description` — one-sentence design intent, referencing the design-dna isomorphic mapping
- `source_references` — reference sources
- `created_at` — ISO datetime

### `design_system`

#### `design_system.color`
- `palette_type` — "monochromatic" / "complementary" / "analogous" / "triadic" / "split-complementary"
- `primary.hex` + `primary.role`
- `secondary.hex` + `secondary.role`
- `accent.hex` + `accent.role`
- `neutral.scale` — neutral color ladder (e.g. `["#0a0a0a", "#1a1a1a", "#333", "#666", "#999", "#ccc", "#f0f0f0"]`)
- `neutral.usage` — how neutrals are used
- `surface.background` — global background color
- `surface.card` — card/container background
- `surface.elevated` — elevated surface
- `contrast_strategy` — "high contrast" / "subtle layers" / "dark-on-light dominant"

#### `design_system.typography`
Presentation scale (not web scale):

- `type_scale.display` — cover hero title. size: 64–96px, weight, line_height, tracking
- `type_scale.heading_1` — slide title. size: 48–72px
- `type_scale.heading_2` — subtitle. size: 36–48px
- `type_scale.body` — body text. size: 24–32px
- `type_scale.body_small` — annotations/labels. size: 16–20px
- `type_scale.caption` — data labels. size: 14–16px
- `font_families.heading` — heading font family
- `font_families.body` — body font family
- `font_families.mono` — code font family
- `font_style_notes` — typeface character notes (e.g. "geometric sans + humanist touch")

#### `design_system.spacing`
- `base_unit` — base spacing unit (e.g. "8px")
- `scale` — spacing ladder (e.g. [8, 16, 24, 32, 48, 64, 80])
- `slide_padding` — slide inset (e.g. "64px 80px")
- `content_density` — "spacious" / "comfortable" / "compact"
- `section_rhythm` — description of inter-element spacing rhythm

#### `design_system.layout`
- `slide_ratio` — "16:9" (fixed)
- `reference_size` — "1280x720" (engine reference size)
- `grid_system` — grid system description
- `alignment_tendency` — "centered" / "left-aligned" / "asymmetric" / "mixed"
- `content_max_width` — max content width (e.g. "1100px")

#### `design_system.shape`
- `border_radius.small` / `medium` / `large` / `pill`
- `border_usage` — "none" / "subtle 1px" / "bold borders"
- `divider_style` — divider line style

#### `design_system.elevation`
- `shadow_style` — "none" / "soft diffused" / "hard drop" / "layered"
- `levels.low` / `medium` / `high` — CSS box-shadow values
- `depth_cues` — "shadows" / "overlapping layers" / "blur/glass" / "color intensity"

#### `design_system.motion`
- `transition` — slide transition type (engine-supported; record only)
- `easing` — CSS easing function
- `duration_scale.micro` / `normal` / `macro`
- `entrance_pattern` — element entrance pattern (e.g. "fade-up")
- `philosophy` — "minimal functional" / "playful" / "cinematic" / "none"

#### `design_system.slides`
Replaces web components. Defined per slide type:

- `cover` — cover slide style (layout, alignment, type scale proportions)
- `content` — content slide style (title position, body area, card grid)
- `section_divider` — section break slide
- `data` — data slide (charts, metric cards)
- `ending` — closing slide
- `slide_notes` — overall slide style notes

### `design_style`

#### `design_style.aesthetic`
- `mood` — 3–5 mood words (e.g. ["calm", "professional", "warm"])
- `visual_metaphor` — visual metaphor from the design-dna isomorphic mapping
- `era_influence` — historical influence (e.g. "Swiss modernism")
- `personality_traits` — if the design were a person (e.g. ["confident", "meticulous"])
- `adjectives` — 3–5 descriptors

#### `design_style.visual_language`
- `complexity` — "minimal" / "moderate" / "rich"
- `ornamentation` — "none" / "subtle accents" / "decorative"
- `whitespace_usage` — "generous" / "balanced" / "compact"
- `visual_weight_distribution` — how visual weight is distributed
- `focal_strategy` — "single hero element" / "distributed interest" / "progressive reveal"
- `contrast_level` — "high" / "medium" / "low"
- `texture_usage` — texture description

#### `design_style.composition`
- `hierarchy_method` — "scale contrast" / "color weight" / "spatial isolation" / "typographic hierarchy"
- `balance_type` — "symmetric" / "asymmetric" / "radial"
- `flow_direction` — eye movement direction
- `grouping_strategy` — how elements are grouped
- `negative_space_role` — role of negative space

#### `design_style.imagery`
- `photo_treatment` — how photos are treated
- `illustration_style` — illustration style
- `graphic_elements` — decorative graphic elements
- `pattern_usage` — pattern usage

### `visual_effects`

Visual effects in presentations are lighter than on the web — the engine handles interaction; AI handles visual enhancement only.

#### `visual_effects.overview`
- `effect_intensity` — "none" / "subtle-accent" / "moderate" ("heavy" not recommended for presentations)
- `performance_tier` — "lightweight" (CSS) / "medium" (CSS + SVG)
- `fallback_strategy` — "disable effects" (presentation default)
- `primary_technology` — "CSS only" / "CSS + SVG"

#### `visual_effects.background_effects`
- `type` — "none" / "gradient-animation" / "noise-field" / "mesh-gradient"
- `description`
- `params` — color_palette, speed, opacity, blend_mode

#### `visual_effects.text_effects`
- `type` — "none" / "gradient-fill" / "split-letter-animate"
- `description`
- `params` — split_strategy, stagger, effect_style

#### `visual_effects.glassmorphism_neumorphism`
- `enabled`
- `style` — "glass" / "frosted-layers" / "none"
- `params` — blur_radius, transparency, border_treatment

#### `visual_effects.svg_animations`
- `enabled`
- `type` — "none" / "path-draw" / "decorative-loop"
- `params` — animation_method, stroke_animation

#### `visual_effects.fragment_effects`
Visual effects for fragment steps (works with the engine's `data-f` attribute):
- `entrance` — CSS animation on fragment reveal (e.g. "fade-up")
- `timing` — animation duration
- `stagger` — delay between multiple fragments

#### `visual_effects.composite_notes`
Free text. Multi-effect layering notes, performance trade-offs, special requirements.

## Usage in codeck

1. Designer reads the outline and extracts formal structure (design-dna isomorphic mapping)
2. Fill in design-dna.json based on the isomorphic mapping and role aesthetics
3. Generate custom.css from design-dna.json (see design-dna-guide.md)
4. Reference `design_style` when writing slides.html to guide content presentation
5. Save design-dna.json to `$DECK_DIR/design-dna.json`
