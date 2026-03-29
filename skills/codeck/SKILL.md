---
name: codeck
version: 2.1.0
description: |
  codeck entry point. Scans local files for materials, shows pipeline
  dashboard with diagnostic intelligence, guides user to the next step.
  Use when the user says "codeck", "new deck", "make a presentation",
  "做 PPT", "做演示文稿", "新建幻灯片", or wants to start a new
  presentation project from scratch. Do NOT trigger for specific
  sub-tasks like designing, reviewing, exporting, or writing speeches
  — those have dedicated skills.
---

# codeck — Entry & Dashboard

Scan materials, diagnose project state, show pipeline overview, guide next step.

Flag anomalies proactively: stale stages, upstream changes not reflected downstream.

## AskUserQuestion format

All codeck skills follow this pattern:

1. **Re-ground** — which skill, which step. One line.
2. **Simplify** — plain language. Assume user hasn't looked at screen for 20 minutes.
3. **Recommend** — `Suggest [X] because [reason]`.
4. **Options** — A) B) C), one click.

Only state verified facts. Unexecuted actions use "will / plan to".

---

## Phase 1: Init + status

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"

bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

## Phase 2: Material scan

```bash
EXCLUDE='! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./dist/*" ! -path "./build/*" ! -name "CLAUDE.md" ! -name "TODOS.md" ! -name "README.md" ! -name "DESIGN.md" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.config.*"'

echo "=== TEXT ===" && eval find . -maxdepth 4 -type f \( -name "*.md" -o -name "*.txt" -o -name "*.rtf" -o -name "*.org" -o -name "*.rst" \) $EXCLUDE 2>/dev/null | head -20
echo "=== DOCS ===" && eval find . -maxdepth 4 -type f \( -name "*.pdf" -o -name "*.docx" -o -name "*.doc" -o -name "*.pptx" -o -name "*.ppt" -o -name "*.key" -o -name "*.pages" -o -name "*.xlsx" -o -name "*.xls" -o -name "*.numbers" \) $EXCLUDE 2>/dev/null | head -20
echo "=== IMAGES ===" && eval find . -maxdepth 4 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" -o -name "*.svg" -o -name "*.ico" -o -name "*.bmp" -o -name "*.tiff" \) $EXCLUDE 2>/dev/null | head -20
echo "=== DATA ===" && eval find . -maxdepth 4 -type f \( -name "*.csv" -o -name "*.tsv" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.xml" \) $EXCLUDE 2>/dev/null | head -20
echo "=== MEDIA ===" && eval find . -maxdepth 4 -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.mp3" -o -name "*.wav" -o -name "*.m4a" -o -name "*.webm" \) $EXCLUDE 2>/dev/null | head -10
```

---

## Phase 3: Content diagnosis

If materials exist and `$DECK_DIR/diagnosis.md` doesn't, read materials and diagnose:

### Three signals

1. **Domain** — what field? Determines outline role.
2. **Expression challenge** — what's hardest to convey? Determines design role.
3. **Audience starting point** — what do they know / not know? Determines review role (inverse selection: the listener most likely to struggle).

### Role selection methodology

Don't pick from a list. Don't match by domain. Find the person whose *way of thinking* cracks this specific problem.

**Outline role — who asks the right question about this material?**
Identify the core tension in the material, then find someone known for penetrating that *type* of tension — regardless of their field. A product launch where the real challenge is "why should anyone care" might need Sondheim (every lyric earns its place) more than a marketing guru. A technical architecture talk where the challenge is "too many moving parts" might need Tufte (information compression) or a film editor (what to cut).

Test: does this person's way of questioning change what the outline *includes and excludes*? If the outline would be the same without them, the match is wrong.

**Design role — whose formal logic mirrors the content's structure?**
Not "good designer" but "whose way of organizing form matches how this argument moves." A content that builds layer by layer might map to Ravel. A content driven by contrast might map to Caravaggio. A content that strips away to reveal essence might map to Dieter Rams. The match can come from any domain — music, painting, architecture, choreography — because form is transferable.

Test: can you state the structural mapping in one sentence? ("This content does X; this person's work does X in visual/sonic/spatial form.") If not, the match is decorative.

**Review role — inverse selection.**
Not the expert. The listener most likely to struggle or push back. The role determines what gets flagged — not correctness, but comprehension and trust.

Test: would this person interrupt you mid-presentation? If not, pick someone harder to convince.

### Material summary

One-line summary per file: what it is, how it can be used. Written into diagnosis.md.

### Output: `$DECK_DIR/diagnosis.md`

```markdown
# Diagnosis

## Materials

| File | Content | Use for |
|------|---------|---------|
| {filename} | {one-line description} | {role in deck} |

## Domain
{description}

## Expression challenge
{hardest part to convey}

## Audience starting point
{what they know / don't know}

## Role recommendations

### Outline stage
{role name} — {derivation: domain + why this person's method of explaining reshapes the structure}

### Design stage
{role name} — {derivation: expression challenge + structural mapping between content and this person's visual logic}

### Review stage
{role name} — {derivation: audience starting point + why this person would struggle or push back}
```

Skip diagnosis if no materials — let user provide topic directly in each stage.

---

## Phase 4: Results

status.sh already outputs the dashboard. Below it, add:

1. **Materials** — file types and counts from Phase 2
2. **STALE** — one-line explanation if any stage is stale
3. **Diagnosis** — three signals and recommended roles if Phase 3 ran

Don't redraw the table.

---

## Phase 5: Handoff

All outputs go to `$DECK_DIR/`. Next skill reads upstream outputs.

status.sh prints a NEXT recommendation. Use it:

| NEXT | Suggest |
|------|---------|
| `/codeck-outline` | "Materials scanned. Next: `/codeck-outline` to plan the structure." |
| `/codeck-design` | "Outline ready. Next: `/codeck-design` to generate slides." |
| `/codeck-review` | "Slides generated. Next: `/codeck-review` to inspect and fix." |
| `/codeck-export` or `/codeck-speech` | "Review done. Next: `/codeck-export` for PDF/PPTX, or `/codeck-speech` for a script." |

User can run `/codeck` anytime to see progress.
