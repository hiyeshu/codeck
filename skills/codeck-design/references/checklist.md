# Design Self-Review Checklist

## How it works

Design produces one validated archive, two source files, and one final build step. Check in order:
1. After writing DESIGN.md → Pass 0
2. After writing custom.css → Pass 1
3. After writing slides.html → Pass 2
4. After running build-html.sh → Pass 3

Auto-fix means fix it directly. Ask only for user-owned content conflicts.

## Output Format

```
Review ({artifact}): N issues (X auto-fixed, Y need user decision)

**AUTO-FIXED:**
- [issue] → fixed

**NEEDS USER DECISION:**
- [issue] {why it cannot be resolved from sources}
```

All clear: `Review ({artifact}): all good.`

---

## Pass 0 — DESIGN.md

### [HIGH] Archive validation
- `scripts/validate-design.sh "$DECK_DIR/DESIGN.md"` passes
- Failed → revise DESIGN.md before writing CSS/HTML

### [HIGH] Full section map
- YAML front matter exists and all 10 sections are present in spec order
- Missing section → AUTO-FIX: add the section with concrete decisions, not placeholders

### [HIGH] Implementation-driving detail
- Overview, Components, Visual Effects, and Do's and Don'ts each have enough specific rules to drive CSS/HTML
- Thin section → AUTO-FIX: add skeleton mapping, component semantics, motion policy, focal rules, or explicit non-applicability reason

### [HIGH] Visual recipe selections
- DESIGN.md includes `Theme preset:`, `Layout recipes:`, `Component recipes:`, and `Image prompt recipes:`
- Missing recipe selection → AUTO-FIX: read theme-presets.md, layout-recipes.md, component-recipes.md, image-prompts.md and record the selected ingredients before writing CSS/HTML

---

## Pass 1 — custom.css

### [HIGH] :root variables complete
- Defines `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`
- Missing → AUTO-FIX: add sensible defaults

### [HIGH] Canvas coordinate system
- All sizing in `px` based on 1280 × 720 canvas. No `vw`/`vh`/`rem` inside slide styles
- Violation → AUTO-FIX: convert to px equivalents (1vw ≈ 12.8px, 1vh ≈ 7.2px)

### [HIGH] No position on slides
- `.slide` and `.slide-*` must not have `position` set. Engine uses `position: absolute`
- Violation → AUTO-FIX: remove the position declaration

### [MEDIUM] Font fallback
- Google Fonts must include `system-ui, sans-serif` (or `monospace`) fallback
- Missing → AUTO-FIX: append fallback stack

### [LOW] No engine style conflicts
- Does not override `.slide`, `#progress`, `.mobile-nav`, `.presenter-*`
- Conflict found → AUTO-FIX: remove or rename to custom class
- `.slide-*` component classes are allowed, but the bare `.slide` engine selector is not

---

## Pass 2 — slides.html

### [HIGH] Slide count matches content source
- Slide count matches `deck.md`
- Mismatch → AUTO-FIX: add missing slides or remove extras

### [HIGH] Slide structure correct
- Every slide is `<section class="slide" data-notes="...">`
- Missing class or data-notes → AUTO-FIX: add them

### [HIGH] Fragment-only source
- slides.html has no `<!doctype>`, `<html>`, `<head>`, `<body>`, `<main class="deck">`, `<link rel="stylesheet">`, or document shell
- Violation → INVALID: extract only the slide sections and let build-html.sh assemble the shell

### [HIGH] Comment anchors
- Each slide has `<!-- ====== N. Title ====== -->` comment before it
- Missing → AUTO-FIX: add them

### [HIGH] No engine code
- slides.html has no `<script>` tags, no progress bar HTML, no mobile nav HTML
- Found → AUTO-FIX: remove (the engine creates these automatically)

### [MEDIUM] data-notes quality
- Not a repeat of the title; contains specific talking points
- Empty or hollow → AUTO-FIX: extract key points from `deck.md`

### [HIGH] Fragment continuity
- Within each slide, `data-f` attributes must start at 1, increment by 1, no gaps, no duplicates
- Violation → AUTO-FIX: renumber sequentially

### [LOW] Data authenticity
- Data comes from source materials, not invented
- Suspicious → AUTO-FIX if source-backed; otherwise record in review.md as "needs verification" without blocking

---

## Pass 3 — Final HTML

### [HIGH] Assembly succeeded
- build-html.sh ran without errors, output file exists and is non-empty
- Failed → check that custom.css and slides.html both exist

### [HIGH] Engine shell present
- Final HTML contains `openPresenter`, `codeck-presenter`, and `BroadcastChannel`
- Missing → INVALID: the deck was not assembled through the fixed engine; run build-html.sh

### [HIGH] Self-contained final HTML
- Final HTML has no `<link rel="stylesheet" ...>` pointing to a sibling deck CSS file
- External stylesheet found → INVALID: move styles back to `$DECK_DIR/custom.css` and run build-html.sh

### [HIGH] No text overflow
- No text extends outside slide boundaries
- Overflow → AUTO-FIX: reduce font size or truncate (edit custom.css and run build-html.sh)

### [MEDIUM] Asset inlining complete
- No residual `assets/` paths in the final HTML — all images should be base64-inlined by assemble.sh
- Residual path found → check that the source file exists and run build-html.sh

### [LOW] Color consistency
- Prefer CSS classes or `var()` over inline `style="color: #xxx"` — inline colors won't follow theme changes
- Excessive hard-coded colors → AUTO-FIX: move them into CSS variables or classes

---

## Suppressions

Do not flag:
- Unconventional design choices the user explicitly requested during iteration
