# Outline self-review checklist

Check `$DECK_DIR/outline.md` after writing. AUTO-FIX directly, ASK for judgment calls.

## Pass 1 — Structural (AUTO-FIX)

### [HIGH] Story arc completeness
- Has opening (problem/conflict) → development → closure (action/conclusion)?
- Missing arc segment → add placeholder page

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
- Scan all text for: leveraging, cutting-edge, seamlessly, robust solution, synergy, empower, holistic, paradigm shift, end-to-end
- Found → AUTO-FIX: replace with concrete language

### [LOW] User intent section
- outline.md "User intent" section filled (not all "not specified")?
- Missing → ASK: prompt user to fill in

## Suppressions

Don't flag:
- Fields user explicitly said to skip
- "Not explored" in user intent section (normal in fast mode)
