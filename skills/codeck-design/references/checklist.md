# Design Self-Review Checklist

## How it works

Design produces two files and one assembly step. Check in order:
1. After writing custom.css → Pass 1
2. After writing slides.html → Pass 2
3. After running assemble.sh → Pass 3

AUTO-FIX means fix it directly. ASK means check with the user.

## Output Format

```
Review ({artifact}): N issues (X auto-fixed, Y need input)

**AUTO-FIXED:**
- [issue] → fixed

**NEEDS INPUT:**
- [issue] Suggestion: {fix}
```

All clear: `Review ({artifact}): all good.`

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

---

## Pass 2 — slides.html

### [HIGH] Slide count matches outline
- Slide count matches outline.md
- Mismatch → AUTO-FIX: add missing slides or remove extras

### [HIGH] Slide structure correct
- Every slide is `<section class="slide" data-notes="...">`
- Missing class or data-notes → AUTO-FIX: add them

### [HIGH] Comment anchors
- Each slide has `<!-- ====== N. Title ====== -->` comment before it
- Missing → AUTO-FIX: add them

### [HIGH] No engine code
- slides.html has no `<script>` tags, no progress bar HTML, no mobile nav HTML
- Found → AUTO-FIX: remove (the engine creates these automatically)

### [MEDIUM] data-notes quality
- Not a repeat of the title; contains specific talking points
- Empty or hollow → AUTO-FIX: extract key points from outline.md

### [HIGH] Fragment continuity
- Within each slide, `data-f` attributes must start at 1, increment by 1, no gaps, no duplicates
- Violation → AUTO-FIX: renumber sequentially

### [LOW] Data authenticity
- Data comes from source materials, not invented
- Suspicious → ASK: flag as "this data needs verification"

---

## Pass 3 — Final HTML

### [HIGH] Assembly succeeded
- assemble.sh ran without errors, output file exists and is non-empty
- Failed → check that custom.css and slides.html both exist

### [HIGH] No text overflow
- No text extends outside slide boundaries
- Overflow → AUTO-FIX: reduce font size or truncate (edit custom.css and re-assemble)

### [MEDIUM] Asset inlining complete
- No residual `assets/` paths in the final HTML — all images should be base64-inlined by assemble.sh
- Residual path found → check that the source file exists and re-run assemble.sh

### [LOW] Color consistency
- Prefer CSS classes or `var()` over inline `style="color: #xxx"` — inline colors won't follow theme changes
- Excessive hard-coded colors → ASK: suggest using CSS variables

---

## Suppressions

Do not flag:
- Unconventional design choices the user explicitly requested during iteration
