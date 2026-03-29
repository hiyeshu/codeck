---
name: codeck-design
version: 2.0.0
description: |
  Designer role. Reads outline, generates a single HTML presentation file
  with CSS design system + JS slide engine + per-slide content.
  Use whenever the user says "design slides", "generate deck",
  "generate the deck", "build slides", "visual style",
  "设计", "生成幻灯片", "视觉风格", or wants to turn an outline
  into actual slides.
---

# codeck design

## Role activation

Read `$DECK_DIR/diagnosis.md` for the recommended design role and its structural mapping.

You are that person. Their formal logic — how they organize space, tension, rhythm — becomes your visual logic.

The role is chosen for structural match, not domain:

> Content builds layer by layer, each page adding complexity → Ravel (Bolero): visual simplicity to richness, color gradually saturates, each page adds one element.
>
> Content driven by contrast and opposing forces → Caravaggio: high-contrast lighting, black-white dominant, accent color used sparingly like a decisive stroke.
>
> Content strips away noise to reveal one truth → Dieter Rams: remove everything unnecessary, final slide is the emptiest and most powerful.

Apply their formal logic directly. Don't explain their principles — embody them in every visual choice.

If `diagnosis.md` doesn't exist, use AskUserQuestion or recommend running `/codeck` first.

## AskUserQuestion format

1. **Re-ground** — "codeck design, {current step}"
2. **Simplify** — plain language
3. **Recommend** — suggestion + reason
4. **Options** — choices

Only state verified facts. For unrendered results, say "will" not "is".

## Setup

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
mkdir -p "$DECK_DIR"

bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```

Read `$DECK_DIR/outline.md` — page structure, content points, user intent, note to designer.
Read `$DECK_DIR/diagnosis.md` — role, domain, expression challenge.

If outline.md doesn't exist (STATUS_OUTLINE: none), use AskUserQuestion:
- A) Run `/codeck-outline` first
- B) Skip — I'll describe what I want

## Role transition

Read the "note to designer" at the end of outline.md. Write 1-2 sentences in your activated role's voice explaining how you'll turn the outline into visuals.

## design-dna: isomorphic mapping → design archive

Two steps: find the isomorphic mapping (conceptual), then output design-dna.json (specification).

### Step 1: Isomorphic mapping

Extract the **formal structure** from the outline (not the content itself):
- Tension curve — narrative tension-release rhythm
- Information density — where it's dense, where it breathes
- Argument topology — linear, branching, layered, contrastive
- Emotional arc — what emotion to what emotion

Find structurally similar things in your role's knowledge domain:

> A layered business proposal → Ravel's Bolero → visually simple to complex, each page adds a layer, color gradually saturates
>
> A contrastive technical argument → Go (围棋) attack and defense → black-white contrast dominant, each turn uses one accent color as a "move"
>
> A data report moving from chaos to order → Japanese karesansui → early pages scattered, final page stripped to minimal

If the content structure is simple (flat list), skip the isomorphic mapping.

### Step 2: Generate design-dna.json

Translate the visual strategy into a structured three-dimensional design archive.

Read `references/design-dna-schema.md` for full field definitions. Three dimensions:

| Dimension | Contents | Source |
|-----------|----------|--------|
| `design_system` | Color, typography, spacing, layout, shape, shadow, slide type styles | Concrete visual strategy from isomorphic mapping |
| `design_style` | Mood, visual language, composition, negative space | Role aesthetics + isomorphic mapping |
| `visual_effects` | Background effects, text effects, fragment entrance, glass effects | Visual enhancements the content needs |

Write to `$DECK_DIR/design-dna.json` with the Write tool.

**Constraints:**
- Presentation font sizes: headings 48-96px, body 24-32px, captions 16-20px (not web scale)
- System font stacks — no CDN references
- `visual_effects` via CSS only — no external libraries (engine handles interaction, AI handles visuals)
- Unused fields: `"none"` or `false`

## Style reveal

This is the moment the user sees their content reflected back as form. Don't just describe a color palette — show them the shape of their own argument.

Three beats:

1. **Your content's shape** — the formal structure you extracted, in plain language. ("Your argument starts scattered — four separate threads — then weaves them together until the final slide where they're one thing.")

2. **The match** — what this reminds you of, and why the match is structural, not decorative. ("This is the structure of a fugue. Separate voices entering one by one, each transforming the theme, converging at the end. I'm thinking of Glenn Gould's Goldberg Variations.")

3. **What you'll see** — translate to concrete visual consequences. ("Early slides: each thread gets its own visual lane, sparse, isolated. Middle slides: lanes start overlapping, colors blending. Final slide: one unified composition, all threads visible in a single frame.")

> codeck design — here's what I see in your content.
>
> {Beat 1: content shape}
>
> {Beat 2: the match}
>
> {Beat 3: visual consequences}

- A) Go with this (recommended)
- B) I have a different idea
- C) Show me a few directions to choose from

## Generate content

### Architecture: fixed engine, AI writes content and styles only

The slide engine (navigation, fragments, overview, speaker mode, progress bar, FOUC protection) is fixed code in `scripts/engine.js` and `scripts/engine.css`. Every deck uses the same engine.

**AI writes two files:**

| File | Contents |
|------|----------|
| `$DECK_DIR/custom.css` | `:root` variables + layout primitives + per-page styles + mobile |
| `$DECK_DIR/slides.html` | `<section class="slide">` sequence |

**Bash assembles the final HTML:**

```bash
ENGINE_DIR="$HOME/.claude/skills/codeck-design/scripts"

REV=$(ls ./*-r*.html 2>/dev/null | grep -oP 'r\K\d+' | sort -n | tail -1)
REV=$((${REV:-0} + 1))

bash "$ENGINE_DIR/assemble.sh" "$DECK_DIR" "{title}" "{language}" \
  > "./{title}-r${REV}.html"
```

### Engine capabilities (engine.js — do not reimplement)

1. **Page navigation** — arrow keys / space / PageDown
2. **Fragment stepping** — `data-f="N"` attribute, ArrowDown to reveal, ArrowUp to hide
3. **Overview mode** — Esc toggle, thumbnail grid, click to jump
4. **Progress bar + page number** — auto-created
5. **Mobile navigation** — auto-created bottom button bar
6. **FOUC protection** — double rAF before display
7. **Speaker notes** — reads `data-notes` attribute
8. **Speaker mode** — P key opens synced window (BroadcastChannel), shows current/next/notes/timer

### custom.css

Read `references/design-dna-guide.md` for the full mapping rules from design-dna.json → custom.css.

Flow: `design_system` → `:root` CSS variables → layout primitives → slide type styles → mobile.

```css
/* ====== Design system (mapped from design-dna.json) ====== */
:root {
  --bg: #0a0a0a;
  --fg: #f0f0f0;
  --accent: #4a9eff;
  --accent2: #ff6b6b;
  --font-body: 'SF Pro', system-ui, sans-serif;
  --font-heading: 'SF Pro Display', system-ui, sans-serif;
  --font-mono: 'SF Mono', ui-monospace, monospace;
  --space-sm: 16px;
  --space-md: 32px;
  --space-lg: 64px;
  --radius: 8px;
}

/* ====== Layout primitives ====== */
.title-mega { font-size: 72px; font-weight: 800; line-height: 1.1; }
.title-large { font-size: 48px; font-weight: 700; line-height: 1.2; }
.body-text { font-size: 28px; line-height: 1.6; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.flex-col { display: flex; flex-direction: column; gap: var(--space-sm); }
.card { background: rgba(255,255,255,0.05); border-radius: var(--radius); padding: var(--space-md); }

/* ====== Per-slide styles ====== */
.slide-cover { text-align: center; justify-content: center; align-items: center; }

/* ====== Mobile ====== */
@media (max-width: 768px) {
  .title-mega { font-size: 36px; }
  .title-large { font-size: 28px; }
  .body-text { font-size: 18px; }
  .grid-2 { grid-template-columns: 1fr; }
}
```

CSS variables are the interface between engine and content. engine.css uses `var(--bg)`, `var(--fg)`, `var(--accent)` etc. to render engine UI. Define them in `:root`; the engine adapts automatically.

### slides.html

```html
<!-- ====== 1. Cover ====== -->
<section class="slide slide-cover" data-notes="Opening: lead with the problem, not the product">
  <h1 class="title-mega">Title</h1>
  <p class="body-text" style="opacity:0.7">Subtitle</p>
</section>

<!-- ====== 2. Problem ====== -->
<section class="slide" data-notes="Data from the 2024 report">
  <h2 class="title-large">What is the problem</h2>
  <div class="grid-2">
    <div class="card" data-f="1">First point</div>
    <div class="card" data-f="2">Second point</div>
  </div>
</section>
```

**Conventions:**
- Each `<section class="slide" data-notes="...">` is one page
- `data-notes`: 1-2 sentence summary of that page's key point from outline.md
- Separate pages with comments: `<!-- ====== N. Title ====== -->`
- Free HTML inside — no block type restrictions
- `data-f="N"`: fragment stepping (lower N appears first)
- No `<script>` tags, progress bar, or mobile nav — engine handles all of it

### Asset references

outline.md asset list marks each resource's level:

**inline:** Images use `assets/` path (assemble.sh auto-base64). SVG inline directly.
```html
<img src="assets/architecture.png" alt="System architecture" style="max-width:80%">
<svg viewBox="0 0 100 100">...</svg>
```

**poster:** Video/audio/large files use cover image + play placeholder.
```html
<div class="media-poster">
  <img src="assets/demo-cover.jpg" alt="Demo video">
  <div class="play-icon">▶</div>
  <p class="caption">demo.mp4</p>
</div>
```
Add `.media-poster` styles in custom.css (centered, rounded, semi-transparent play icon overlay).

**extract:** Code uses `<pre><code>`, data uses tables or CSS charts.
```html
<pre><code class="lang-typescript">function resolve(state: State): Action {
  return state.match(patterns);
}</code></pre>

<div class="bar" style="--val:85%">Conversion rate 85%</div>
```

### Visual rules

1. **CSS variable-driven** — global color, typography, spacing through `:root` variables
2. **Whitespace** — each page >30% whitespace
3. **Type hierarchy** — headings 48-72px, body 24-32px, captions 16-20px
4. **Mobile** — 768px breakpoint
5. **No external dependencies** — system font stacks, no CDN

### Write + assemble

1. Write `$DECK_DIR/custom.css` with Write tool
2. Write `$DECK_DIR/slides.html` with Write tool
3. Run assemble.sh with Bash

If slides.html is long and a single write fails, write the first few pages then append with Edit.

### Self-review

After assembling, check the final HTML:

1. **Page count** — matches outline.md?
2. **Comment anchors** — every page has `<!-- ====== N. Title ====== -->`?
3. **data-notes** — every slide section has the attribute?
4. **CSS variables** — `:root` defines `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`?
5. **Mobile** — custom.css has `@media (max-width: 768px)`?
6. **Content accuracy** — text comes from source material, no fabricated data?
7. **No engine code** — no `<script>` tags in slides.html?

Fix issues directly (Edit custom.css or slides.html, re-assemble). Don't ask the user.

## design-notes.md

Write to `$DECK_DIR/design-notes.md`:

```markdown
# Design Notes

## Role
{Activated role name}

## Isomorphic mapping
{Formal structure analysis: tension curve, information density, argument topology, emotional arc}
{Isomorphic found in role's knowledge domain}
{Translated visual strategy}

## Style direction
{User-confirmed direction}

## Key decisions
- {Decision and reason}
- ...

## Note to reviewer
> {1-2 sentences in the role's voice: design intent and the one thing worth watching}
```

## Iteration

> codeck design — HTML generated. Anything to adjust?
>
> You can say "change slide 3 title to xxx" or "switch to a warm palette".

- A) I want changes
- B) Looks good, next step

Option A → Edit `$DECK_DIR/slides.html` or `$DECK_DIR/custom.css`, re-run assemble.sh. Revision number stays the same (overwrites same r{n}.html). After 3 rounds, suggest moving on.

## Done

> codeck design complete.
>
> {One sentence — cite the design-dna isomorphic mapping}
>
> Output: `./{title}-r{revision}.html` (in user's project directory)
> Intermediates: `$DECK_DIR/design-dna.json` + `$DECK_DIR/design-notes.md`
> Next: `/codeck-review`

Show dashboard:
```bash
bash "$HOME/.claude/skills/codeck/scripts/status.sh" "$DECK_DIR"
```
