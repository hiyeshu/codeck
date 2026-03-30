# Design DNA Schema

Based on [design-dna](https://github.com/zanwei/design-dna) by zanwei. Full three-dimensional schema, unabridged.

## codeck environment

Output: 16:9 HTML presentation. Engine JS is fixed; AI writes HTML + CSS only.

- **No JS in slides** — engine.js handles all interaction; slides.html contains only HTML + CSS classes
- **Google Fonts allowed** — use `@import url('https://fonts.googleapis.com/css2?...')` at the top of custom.css (assemble.sh places it inside `<style>` in `<head>`). Always include a system font fallback stack so the deck degrades gracefully offline.
- **CSS + inline SVG only** — all visual_effects must be achievable with CSS @keyframes, CSS filters, backdrop-filter, gradients, and inline `<svg>` elements
- **No other CDN** — no script tags, no external assets besides Google Fonts

Record the full design intent in every field. For effects beyond CSS+SVG, describe the intent (the AI will find the closest CSS approximation). This preserves the design vision if the deck is later rendered in a richer environment.

---

Three-dimensional design profile:
- **design_system** — measurable tokens
- **design_style** — qualitative perception
- **visual_effects** — special rendering such as Canvas, WebGL, 3D, particles, shaders, scroll effects, cursor effects, SVG animation, and glassmorphism

Every field below must appear in the final JSON output.

## Top-Level Structure

### `meta`
- `name`
- `description`
- `source_references`
- `created_at`

### `design_system`
The structural and measurable layer.

#### `design_system.color`
- `palette_type`
- `primary.hex` + `primary.role`
- `secondary.hex` + `secondary.role`
- `accent.hex` + `accent.role`
- `neutral.scale`
- `neutral.usage`
- `semantic.success`
- `semantic.warning`
- `semantic.error`
- `semantic.info`
- `surface.background`
- `surface.card`
- `surface.elevated`
- `contrast_strategy`

#### `design_system.typography`
- `type_scale.display.size` / `weight` / `line_height` / `tracking`
- `type_scale.heading_1.size` / `weight` / `line_height` / `tracking`
- `type_scale.heading_2.size` / `weight` / `line_height` / `tracking`
- `type_scale.heading_3.size` / `weight` / `line_height` / `tracking`
- `type_scale.body.size` / `weight` / `line_height` / `tracking`
- `type_scale.body_small.size` / `weight` / `line_height` / `tracking`
- `type_scale.caption.size` / `weight` / `line_height` / `tracking`
- `type_scale.overline.size` / `weight` / `line_height` / `tracking`
- `font_families.heading`
- `font_families.body`
- `font_families.mono`
- `font_style_notes`

#### `design_system.spacing`
- `base_unit`
- `scale`
- `content_density`
- `section_rhythm`

#### `design_system.layout`
- `grid_system`
- `max_content_width`
- `columns`
- `gutter`
- `breakpoints`
- `alignment_tendency`

#### `design_system.shape`
- `border_radius.small` / `medium` / `large` / `pill`
- `border_usage`
- `divider_style`

#### `design_system.elevation`
- `shadow_style`
- `levels.low` / `medium` / `high`
- `depth_cues`

#### `design_system.iconography`
- `style`
- `stroke_weight`
- `size_scale`
- `preferred_set`

#### `design_system.motion`
- `easing`
- `duration_scale.micro` / `normal` / `macro`
- `entrance_pattern`
- `exit_pattern`
- `philosophy`

#### `design_system.components`
- `button_style`
- `input_style`
- `card_style`
- `navigation_pattern`
- `modal_style`
- `list_style`
- `component_notes`

### `design_style`
The qualitative and perceptual layer.

#### `design_style.aesthetic`
- `mood`
- `visual_metaphor`
- `era_influence`
- `genre`
- `personality_traits`
- `adjectives`

#### `design_style.visual_language`
- `complexity`
- `ornamentation`
- `whitespace_usage`
- `visual_weight_distribution`
- `focal_strategy`
- `contrast_level`
- `texture_usage`

#### `design_style.composition`
- `hierarchy_method`
- `balance_type`
- `flow_direction`
- `grouping_strategy`
- `negative_space_role`

#### `design_style.imagery`
- `photo_treatment`
- `illustration_style`
- `graphic_elements`
- `pattern_usage`
- `image_shape`

#### `design_style.interaction_feel`
- `feedback_style`
- `hover_behavior`
- `transition_personality`
- `loading_style`
- `microinteraction_density`

#### `design_style.brand_voice_in_ui`
- `tone`
- `formality`
- `cta_style`
- `empty_state_approach`
- `error_tone`

### `visual_effects`
The special rendering and advanced visual behavior layer.

#### `visual_effects.overview`
- `effect_intensity`
- `performance_tier`
- `fallback_strategy`
- `primary_technology`

#### `visual_effects.background_effects`
- `type`
- `description`
- `technology`
- `params.color_palette` / `speed` / `density` / `opacity` / `blend_mode`

#### `visual_effects.particle_systems`
- `enabled`
- `type`
- `description`
- `technology`
- `params.count` / `shape` / `size_range` / `movement_pattern` / `color_behavior` / `interaction` / `spawn_area`

#### `visual_effects.3d_elements`
- `enabled`
- `type`
- `description`
- `technology`
- `params.renderer` / `lighting` / `camera` / `materials` / `geometry` / `post_processing` / `interaction_model`

#### `visual_effects.shader_effects`
- `enabled`
- `type`
- `description`
- `technology`
- `params.uniforms` / `vertex_manipulation` / `fragment_output` / `noise_type` / `distortion`

#### `visual_effects.scroll_effects.parallax`
- `enabled`
- `layers`
- `depth_range`
- `speed_curve`

#### `visual_effects.scroll_effects.scroll_triggered_animations`
- `enabled`
- `trigger_points`
- `animation_type`
- `scrub_behavior`

#### `visual_effects.scroll_effects.scroll_morphing`
- `enabled`
- `description`

#### `visual_effects.text_effects`
- `type`
- `description`
- `technology`
- `params.split_strategy` / `animation_per_unit` / `stagger` / `effect_style`

#### `visual_effects.cursor_effects`
- `enabled`
- `type`
- `description`
- `params.shape` / `size` / `blend_mode` / `trail` / `interaction_zone`

#### `visual_effects.image_effects`
- `type`
- `description`
- `technology`
- `params.filter_pipeline` / `hover_transform` / `reveal_animation` / `distortion_type`

#### `visual_effects.glassmorphism_neumorphism`
- `enabled`
- `style`
- `params.blur_radius` / `transparency` / `border_treatment` / `shadow_type` / `light_source_angle`

#### `visual_effects.canvas_drawings`
- `enabled`
- `type`
- `description`
- `technology`
- `params.draw_method` / `animation_loop` / `color_scheme` / `responsiveness` / `interaction`

#### `visual_effects.svg_animations`
- `enabled`
- `type`
- `description`
- `params.animation_method` / `path_morphing` / `stroke_animation` / `filter_effects`

#### `visual_effects.composite_notes`
- Free-text notes for layered effects, implementation ambiguity, performance trade-offs, or screenshot-only observations

