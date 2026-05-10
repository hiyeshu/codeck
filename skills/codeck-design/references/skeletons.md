# Design Skeletons

The default codeck skeleton is `narrative-grid`.

It uses an argument-first deck structure: explicit page roles, hero/body rhythm, stable media slots, reusable page families, and a preplanned density cadence.

Use the skeleton as structure, not as copied code. Do not copy external HTML class names or runtime code. codeck keeps its own fixed engine; `@design` writes codeck `custom.css` and `slides.html`.

## What A Skeleton Is

A skeleton is the deck's repeatable structure:

- page family inventory
- page sequence rhythm
- density curve
- tonal cadence
- image slot rules
- type role separation
- review guardrails

It is not a theme, template, asset kit, or finished style. Palette, typography, and effects still come from `DESIGN.md`.

## Selection

Start from `narrative-grid` unless the user gives a reference that clearly demands a different structure.

Priority:

1. User-provided style, brand, screenshot, reference deck, website, or existing `DESIGN.md`
2. Current skeleton in `$DECK_DIR/roles/design.md`
3. `diagnosis.md` expression challenge and the content's formal structure
4. `narrative-grid`

Ask only when two skeleton choices would change the argument order. Otherwise choose and record the reason.

Record the choice in:

- `DESIGN.md` `## Overview`: `Skeleton: narrative-grid` or `Skeleton: narrative-{variant}`
- `roles/design.md` `## Current Skeleton`
- `channel/YYYY-MM-DD.md`: one line in the `@design` claim or handoff

## Pre-flight

Before writing `DESIGN.md`, `custom.css`, or `slides.html`, make a skeleton plan.

The plan must decide:

1. Page family for every slide.
2. Page energy for every slide: `anchor`, `breath`, `work`, or `contrast`.
3. Visual tone for every slide: light, dark, hero-light, or hero-dark.
4. Media slot and ratio for every slide that uses an image or visual asset.
5. Motion pattern for every slide that uses fragments.

Checks:

- No three consecutive slides share the same energy.
- No three consecutive slides share the same visual tone unless the content demands monotony.
- Dense `work` slides have a nearby `breath` or `anchor` slide.
- Hero pages are used for turns, resets, openings, questions, and closings, not decoration.
- A repeated page family must do a different rhetorical job each time.
- Metadata and kicker are not the same sentence. Metadata names the section; kicker hooks the page.
- Large titles are sized by word length, not by wish.
- Media slots align to the body area, not the title top.
- Image grids use equal visual height.
- UI, diagrams, charts, and text-bearing images use contain fit.
- If a UI screenshot becomes a long strip, split it into panels or redesign it into a slide-safe asset.

Record the plan in `DESIGN.md` `## Layout` and summarize the current skeleton state in `roles/design.md`.

## Narrative Grid

Use for decks with a speaker voice: keynotes, private talks, product launches, demo days, industry talks, creator-led essays, and narrative reports.

Avoid it for dense training decks, spreadsheet-heavy board packs, compliance documentation, or slides that need many tiny tables.

Core principles:

- Structure beats decoration.
- Page roles carry the argument before decoration does.
- Hero pages create breath, reset, or emphasis.
- Body pages carry proof, process, and explanation.
- Images are assets inside slots, not standalone slides.
- Tone changes must create rhythm.
- Dense pages need sparse pages near them.

## Page Families

Use these families as the default layout catalog. Pick by rhetorical job, not by decoration.

| Family | Rhetorical job | Default theme | Motion feel | Guardrail |
|--------|----------------|---------------|-------------|-----------|
| `hero-cover` | open the talk, name the thesis | hero dark | slow reveal | one title, one subtitle, one speaker/context line |
| `act-divider` | mark a turn in the argument | hero light or hero dark, alternating | slow reveal | one idea only |
| `big-numbers` | make data unavoidable | light, with rare dark variation | cascade | no more than four primary numbers |
| `quote-image` | pair a claim with a concrete visual | light/dark alternating | cascade | image aligns to body area, not title top |
| `image-grid` | compare visual evidence | light | cascade | same height or ratio across all images |
| `pipeline` | explain a process or sequence | light | stepped reveal | steps advance one by one |
| `hero-question` | create suspense or a reset | hero dark | slow reveal | question must fit in one breath |
| `big-quote` | give a sentence ritual weight | dark preferred, light allowed | line reveal | quote must be short enough to read from the back row |
| `before-after` | show a contrast or decision | light | directional | left/right labels must be parallel |
| `image-text-mix` | handle denser explanation with a visual anchor | light/dark alternating | cascade | keep image and text in one grid system |

## Rhythm Plan

Before writing slides, make a page rhythm plan. This is the part to borrow from magazine-style decks: decide the role and energy of each page before writing HTML.

Page energy levels:

- `anchor` — title, section turn, closing idea
- `breath` — sparse reset between dense pages
- `work` — proof, process, data, image/text explanation
- `contrast` — quote, before/after, tension, objection

Map energy to visual tone in `DESIGN.md`. A cinematic deck may use dark anchors. A technical deck may use light anchors. A warm report may barely use dark pages at all. The skeleton controls rhythm, not palette.

Rules:

- Never run more than three pages with the same energy.
- For decks with eight or more pages, include at least two anchors.
- Include at least one breath page after a dense work sequence.
- Insert an anchor every three to four pages when the story needs a turn.
- Repeat a page family only when its role changes.
- Keep data, grids, pipelines, and comparisons visually clear by default.

Eight-page starter rhythm:

| Page | Energy | Family | Job |
|------|------|--------|-----|
| 1 | anchor | hero-cover | open |
| 2 | work | big-numbers | data strike |
| 3 | contrast | quote-image | story or objection |
| 4 | work | pipeline | method |
| 5 | breath | act-divider | reset |
| 6 | contrast | quote-image or big-quote | tension |
| 7 | anchor | hero-question | suspense |
| 8 | anchor | big-quote or act-divider | close |

## Type System

Use a three-role type system. The exact fonts come from `DESIGN.md`; the skeleton only defines the jobs.

- Display type for hero titles, quotes, and large numbers
- Humanist or grotesk sans-serif for body copy
- Monospace for metadata, labels, footers, code, and small navigational text

Rules:

- Do not use emoji as icons.
- Do not mix heading and body roles randomly.
- Metadata is not the kicker. Metadata names the section; kicker hooks the page.
- Large titles must fit the viewport. Size by word length, not by wish.

## Image Slots

Images are always placed in stable slots.

Recommended ratios:

| Use | Ratio |
|-----|-------|
| main image beside text | 16:10 or 4:3 |
| full visual | 16:9 |
| UI or infographic | 16:9 or 16:10, contain fit |
| small mixed media | 3:2, 3:4, or 1:1 |
| image grid | equal heights across the group |

Rules:

- Never use a source image's odd aspect ratio as the slot ratio.
- Crop photos from the bottom first. Preserve top, left, and right.
- Use `object-fit: contain` for UI, diagrams, charts, and text-bearing images.
- Do not pin images to the bottom edge.
- Do not add heavy borders or shadows to images.
- Generated visuals must not include slide titles, footers, page numbers, signatures, or decorative frames.
- For image cleanup, generation, composition, or screenshot redesign, use `references/asset-guide.md`. Its asset shapes are examples, not fixed modes.

## Motion Mapping

Map the skeleton's motion recipes to codeck fragments and CSS animation classes:

| Page family | Motion |
|-------------|--------|
| hero pages | slow staggered reveal |
| body pages | simple cascade |
| big-quote | line-by-line reveal |
| before-after | left side, divider, right side |
| pipeline | one step per fragment |

Motion must support reading. If motion makes the argument harder to follow, remove it.

## Review Guardrails

`@review` should protect these choices:

- The page family matches the rhetorical job.
- The rhythm plan has enough light/dark and hero/body contrast.
- Dense pages are separated by breath pages.
- Images keep stable ratios and readable crops.
- Big numbers and quotes are large enough to work on stage.
- Metadata and kicker do different jobs.
- No generic card grid replaces a stronger page family.

## Custom Variants

When a user gives a brand, screenshot, or reference deck, keep the narrative page-family logic and adapt surface choices:

- `narrative-technical`: more blueprint linework, diagrams, code blocks, restrained motion
- `narrative-data`: more big-numbers, tables, variance callouts, chart discipline
- `narrative-product`: more UI slots, before/after, workflow steps, zoom callouts
- `narrative-cinematic`: more hero pages, full-bleed visuals, sparse copy
- `narrative-report`: more report pages, quotes, pullouts, footnotes

Record only the selected variant, reason, and guardrails in `roles/design.md`. Put full design decisions in `DESIGN.md`.
