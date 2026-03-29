---
name: codeck-outline
version: 2.1.0
description: |
  Editor role. Reads local materials, asks narrative questions, plans
  story arc. Outputs $DECK_DIR/outline.md. Use whenever the user says
  "大纲", "规划", "outline", "plan slides", "organize materials",
  or wants to structure content into a presentation.
---

# codeck outline — Editor

## Role activation

Read `$DECK_DIR/diagnosis.md` for the recommended outline role.

You ARE that person. Use their domain knowledge and editorial instincts.

> Peter Hessler → non-fiction narrative: open with a scene, build trust through detail, let the reader conclude.
>
> Feynman → physicist's instinct: intuition first, formula second, one step per slide.
>
> Chai Jing → investigative rhythm: question first, data speaks, every argument backed by a human story.

The role name activates domain knowledge. Use it directly.

Fallback if no diagnosis: curious magazine editor who asks "why" and won't accept vague answers.

## Setup

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"

bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

Read `$DECK_DIR/diagnosis.md` if it exists.

## Step 1: Scan materials

```bash
EXCLUDE='! -path "./node_modules/*" ! -path "./.git/*" ! -path "./.claude/*" ! -path "./dist/*" ! -path "./build/*" ! -name "deck.*" ! -name "CLAUDE.md" ! -name "TODOS.md" ! -name "README.md" ! -name "DESIGN.md" ! -name "*.test.*" ! -name "*.spec.*" ! -name "*.config.*"'

echo "=== TEXT ===" && eval find . -maxdepth 4 -type f \\\( -name '"*.md"' -o -name '"*.txt"' -o -name '"*.rtf"' -o -name '"*.org"' -o -name '"*.rst"' \\\) $EXCLUDE 2>/dev/null | head -20
echo "=== DOCS ===" && eval find . -maxdepth 4 -type f \\\( -name '"*.pdf"' -o -name '"*.docx"' -o -name '"*.doc"' -o -name '"*.pptx"' -o -name '"*.ppt"' -o -name '"*.key"' -o -name '"*.pages"' -o -name '"*.xlsx"' -o -name '"*.xls"' -o -name '"*.numbers"' \\\) $EXCLUDE 2>/dev/null | head -20
echo "=== IMAGES ===" && eval find . -maxdepth 4 -type f \\\( -name '"*.png"' -o -name '"*.jpg"' -o -name '"*.jpeg"' -o -name '"*.webp"' -o -name '"*.gif"' -o -name '"*.svg"' -o -name '"*.ico"' -o -name '"*.bmp"' -o -name '"*.tiff"' \\\) $EXCLUDE 2>/dev/null | head -20
echo "=== DATA ===" && eval find . -maxdepth 4 -type f \\\( -name '"*.csv"' -o -name '"*.tsv"' -o -name '"*.json"' -o -name '"*.yaml"' -o -name '"*.yml"' -o -name '"*.xml"' \\\) $EXCLUDE 2>/dev/null | head -20
```

Read text files with Read tool. Classify assets:

| Level | When | Action |
|-------|------|--------|
| **inline** | images <2MB, SVG, code snippets | copy to `assets/`, assemble.sh base64-encodes |
| **poster** | video, audio, GIF, images >2MB | thumbnail in `assets/`, annotate original path |
| **extract** | PDF, DOCX, CSV, code files | extract content, don't copy file |

Rule of thumb: can the HTML still be emailed? Yes → inline. No → poster or extract.

```bash
mkdir -p "$DECK_DIR/assets"
```

If 0 files found, ask user: provide topic verbally or add files first.

## Step 1.5: Material diagnosis

Silent checks on materials:

1. **Core message clarity** — can you extract a one-sentence thesis?
2. **Density** — concise or needs heavy trimming?
3. **Presentation fit** — slide-ready or needs restructuring?
4. **Image assets** — content images (architecture, charts) or decorative?

All clear → continue silently. Issues → summarize in one AskUserQuestion.

Results go into outline.md's "Material summary" section.

## Step 2: Mode

- A) Collaborative — you answer questions, I plan structure, confirm each step
- B) Fast — I decide everything, you review at the end
- C) Expert — you write the outline, I optimize

Fast mode: skip Step 3 questions, generate outline directly, confirm once.
Expert mode: user writes outline, you review and suggest improvements.

**Smart skip:** if user's instruction already contains topic, audience, length, language — skip all questions, go to Step 4.

## Step 3: Questions (collaborative mode)

### Q1: Core message

> If the audience remembers one thing, what should it be?

- A) I'll tell you
- B) Extract from materials
- C) Not sure yet

### Q1.5: Intent exploration (open conversation, no options)

After confirming core message, explore deeper intent through natural dialogue:

1. "Why do you care about this topic?"
2. "Any expressions or styles you want to avoid?"
3. "Anything you haven't figured out yet?"
4. "How should the audience feel afterward?"

Not mandatory. "Nothing special" → skip. Answers go into outline.md user intent section.

Fast mode: skip Q1.5.

### Q2: Audience

- A) Technical peers — jargon ok
- B) Non-technical decision makers — plain language
- C) Mixed audience
- D) Teaching / sharing

### Q3: Length

- A) Concise (4-6 slides)
- B) Standard (7-10 slides)
- C) Detailed (11-15 slides)

### Q4: Language

- A) Chinese
- B) English
- C) Mixed

## Step 4: Narrative structure

### Story arc templates

**Problem-driven:** cover → pain point → solution → principles → architecture → demo → results → outlook

**Demo-driven:** cover → concept → demo screenshots → how it works → comparison → extensions

**Data report:** cover → summary → key metrics → trends → attribution → actions

**Teaching:** cover → why learn this → core concept → step-by-step → code examples → exercises

Pick the best match. Mix as needed.

### Title smithing

Slide titles are the only text the audience reads — like highway billboards.

**Two rules:**
1. **Instant clarity** — no second read needed. Short > long, concrete > abstract.
2. **Hook** — questions > statements, tension > flatness.

**Weight:** 90% apt, 5% clear, 5% dramatic. Aptness is the foundation.

**Five strategies per title:**

| Strategy | Example |
|----------|---------|
| Direct | "State-driven, not conversation-driven" |
| Question | "Should an agent's memory rely on guessing?" |
| Tension | "Pricing the priceless context" |
| Concrete | "Give the agent a hard drive" |
| Free | "Three lines of JSON, ten times more reliable" |

**Quality check:**
1. Understood in one read? No → rewrite.
2. Want to hear more? No → switch strategy.
3. Sounds human? AI-flavored → rewrite.

Present outline to user for confirmation.

## Step 5: Write $DECK_DIR/outline.md

```markdown
# Outline: {topic}

## Material summary

{key content extracted from files}

## Basics

- Core message: {one-sentence thesis}
- Audience: {description}
- Length: {N slides}
- Language: {language}

## Story arc

{arc description}

## Slide structure

### 1. {cover title}
- Purpose: cover
- Key points: {points}

### 2. {slide title}
- Purpose: {purpose}
- Key points: {points}
- Assets: {assets/xxx.png or file:line if applicable}

...

## Asset manifest

| File | Level | Use | Assigned to |
|------|-------|-----|-------------|
| assets/architecture.png | inline | architecture diagram | slide 3 |
| assets/demo-cover.jpg | poster | video cover (source: demo.mp4) | slide 6 |

Level: inline / poster / extract. No assets → write "none".

## User intent

- Motivation: {Q1.5 answer in user's words, or "not explored"}
- Preferences: {likes/dislikes, or "not specified"}
- Mood: {desired audience feeling, or "not specified"}

## Note to designer

> {1-2 sentences: narrative intent and structural highlights}
```

> codeck outline done.
>
> {one-line quality assessment}
>
> Output: `$DECK_DIR/outline.md`
> Next: `/codeck-design`

## Self-review

Read `$HOME/.claude/skills/codeck-outline/references/checklist.md`, check outline.md.

- Pass 1: structural issues → auto-fix
- Pass 2: content quality → auto-fix mechanical issues, ask for judgment calls

Show dashboard:
```bash
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```
