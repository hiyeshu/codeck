# codeck-design/references/
> L2 | Parent: ../SKILL.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

asset-guide.md: Fluid asset workflow; decides improve/adapt/generate/compose/draw/skip from slide need and slot.
checklist.md: Design self-review; validates DESIGN.md, CSS, slide fragments, and final HTML guardrails.
component-recipes.md: Presentation component cookbook; turns stats, callouts, rowlines, diagrams, media frames, and chrome into concrete HTML/CSS patterns.
design-md-guide.md: Mapping guide from DESIGN.md tokens and prose to custom.css variables, primitives, slide styles, and motion.
design-md-spec.md: DESIGN.md archive schema; requires tokens, sections, selected recipes, and implementation-driving design rationale.
image-prompts.md: Prompt recipes for generated, cleaned, redesigned, composited, and diagrammatic slide assets.
layout-recipes.md: Named page-structure recipes; gives rhetorical page patterns without importing template runtime.
skeletons.md: Deck-level rhythm skeleton; owns page family cadence, media slot planning, tone variation, and motion recipes.
theme-presets.md: Named visual system presets; supplies palette, type, material, layout, and motion defaults.
visual-floor.md: Visual quality benchmarks that the generated deck must beat before CSS/HTML is considered complete.

## Boundary

References provide ingredients, not final templates. The fixed codeck engine remains in `../scripts/`; @design writes only DESIGN.md, custom.css, slides.html, and assets.
