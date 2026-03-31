# Outline self-review checklist

Check `$DECK_DIR/outline.md` after writing. AUTO-FIX directly, ASK for judgment calls.

## Pass 1 — Structural (AUTO-FIX)

### [HIGH] Story arc completeness
- Has a beginning that creates tension and an ending that resolves it?
- Missing arc → ASK: the content's natural shape might not be three-act — confirm with user before restructuring

### [HIGH] Every page has purpose
- Each page tagged with purpose (cover/content/section-divider/ending)?
- Missing → infer from content

### [MEDIUM] Page count
- 5-15 pages is typical, not mandatory
- Under 5 or over 15 → ASK: confirm with user, don't auto-trim

### [HIGH] No duplicate pages
- Two pages making the same point?
- Found → ASK: suggest merge, explain which two overlap

## Pass 2 — Content quality (ASK)

### [MEDIUM] Title sharpness
- Title communicates the point independently, not "About X" or "Introduction to X"
- Vague → ASK: suggest sharper alternative

### [MEDIUM] Info density balance
- Density variation should be intentional (rhythm field: dense → breathe is a technique)
- Unintentional unevenness (no rhythm annotation, similar purpose slides with wildly different density) → ASK: suggest redistribution or add rhythm annotation

### [MEDIUM] AI fluff detection
- Replace vague amplifiers with concrete claims. If a word could be removed without losing meaning, remove it.
- Found → AUTO-FIX: rewrite with specifics

### [LOW] User intent section
- outline.md "User intent" section filled (not all "not specified")?
- Missing → ASK: prompt user to fill in

## Suppressions

Don't flag:
- Fields user explicitly said to skip
- "Not explored" in user intent section (normal in fast mode)
