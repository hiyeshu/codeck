# Outline self-review checklist

Check `$DECK_DIR/deck.md` after writing. Auto-fix directly. Ask only for real user-owned content conflicts.

## Pass 1 — Structural (AUTO-FIX)

### [HIGH] Story arc completeness
- Has a beginning that creates tension and an ending that resolves it?
- Missing arc → AUTO-FIX: choose the simplest natural arc and record the choice as an assumed default

### [HIGH] Every page has purpose
- Each page tagged with purpose (cover/content/section-divider/ending)?
- Missing → infer from content

### [MEDIUM] Page count
- Page count is derived from duration: 15 minutes ≈ 10 pages, 30 minutes ≈ 20 pages, 45 minutes ≈ 25-30 pages
- Direct slide-count prompt found → AUTO-FIX: replace with duration-derived page count and record the rule
- Derived count does not match duration → AUTO-FIX unless the user explicitly requested a custom page count

### [HIGH] No duplicate pages
- Two pages making the same point?
- Found → AUTO-FIX: merge the overlap and record which pages changed

## Pass 2 — Content quality

### [MEDIUM] Title sharpness
- Title communicates the point independently, not "About X" or "Introduction to X"
- Vague → AUTO-FIX: write a sharper alternative

### [MEDIUM] Info density balance
- Density variation should be intentional (rhythm field: dense → breathe is a technique)
- Unintentional unevenness (no rhythm annotation, similar purpose slides with wildly different density) → AUTO-FIX: redistribute or add rhythm annotation

### [MEDIUM] AI fluff detection
- Replace vague amplifiers with concrete claims. If a word could be removed without losing meaning, remove it.
- Found → AUTO-FIX: rewrite with specifics

### [LOW] User intent section
- `deck.md` "User intent" section filled (not all "not specified")?
- Missing → AUTO-FIX: infer from materials or record "not specified"; do not prompt

## Suppressions

Don't flag:
- Fields user explicitly said to skip
- "Not explored" in user intent section (normal in fast mode)
