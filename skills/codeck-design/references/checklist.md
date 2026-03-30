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

### [HIGH] Type scale ratio
- Heading/body size ratio ≥ 2.5:1 (e.g. 80px/28px, 120px/36px)
- Body ≥ 18px, annotations ≥ 14px
- Hierarchy unclear → AUTO-FIX: increase ratio

### [HIGH] Mobile breakpoint
- Has `@media (max-width: 768px)`
- Missing → AUTO-FIX: add reduced font sizes and single-column layout

### [MEDIUM] Color contrast
- Foreground/background contrast ≥ 4.5:1
- Insufficient → ASK: suggest adjustment

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

### [MEDIUM] Cover signal-to-noise
- Cover slide: one line + breathing room, not cluttered
- Overloaded → ASK: suggest trimming

### [MEDIUM] AI filler words
- No hollow words (empower, seamless, disrupt, all-in-one)
- Found → AUTO-FIX: replace with specific language

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

### [MEDIUM] Color consistency
- slides.html has no hard-coded color values; all use CSS classes or var()
- Hard-coded → AUTO-FIX: replace with var() references

---

## Suppressions

Do not flag:
- Unconventional design choices the user explicitly requested during iteration
- Fragment step numbers on `data-f` attributes (intentional stepping control)
