<!--
[INPUT]: Depends on cwd materials, deck room state, and user request intent.
[OUTPUT]: Defines room contract, Decision Ask policy, material scan, diagnosis, and @outline lane.
[POS]: skills/codeck/references workflow manual; read for bootstrap, routing, and content planning.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Workflow — Room Contract, Diagnosis, Decision Ask, @outline

This reference covers the deck room model, `MEMORY.md` structure, the Decision Ask Policy, the three diagnostic signals, and the `@outline` lane. It is the work-state layer of the codeck skill.

## Deck room model

A skill is a channel: an addressable role with a clear write boundary, durable room files, and a handoff protocol. `/codeck` is the entry channel; the lanes are internal channels that own one part of the room. Fixed role lanes: `@orchestrator`, `@outline`, `@design`, `@review`, `@speech`, `@export`.

Cowart is the useful precedent for locality, not for infinite canvas. codeck opens a local deck editor service where the HTML deck remains the main canvas. Runtime assets and scripts live in the skill; UI selection state, editor events, agent marker requests, revision snapshots, room state, and final deck artifacts belong to the user's workbench, not to the skill source tree.

Default user-facing output is compact: judgment, artifact, next action. The expanded role channel is written to `channel/YYYY-MM-DD.md`; show it only when the user asks to see the channel.

## Room document contract

Room documents are not equal. One current truth layer, one work-state layer, one audit layer.

| Layer | Files | Read rule | Write rule |
|-------|-------|-----------|------------|
| Current truth | `MEMORY.md`, `deck.md`, `DESIGN.md`, `custom.css`, `slides.html`, latest assembled HTML, `speech.md` when present | Read first. These define the rebuildable deck. | Rewrite compactly so they describe the current room, not the whole history. |
| Work state | `diagnosis.md`, `tasks/tasks.md`, `threads/threads.md`, `roles/*.md`, `review.md` | Read current material diagnosis, active tickets, open decisions, lane persona/rules, latest valid review. | Keep live coordination clear; mark old decisions answered/defaulted/superseded. |
| Collaboration inbox | `state/selection.json`, `events/*.jsonl`, `inbox/*.md`, `feedback-*.md`, `revisions/` | Read before lane work. Selection is the user's current pointer; events are browser/user operation logs; inbox files are explicit agent requests; revisions are rebuild snapshots. | Consume explicit requests into source files, summarize useful events, then archive or mark resolved. |
| Audit trail | `channel/YYYY-MM-DD.md`, legacy `PROJECT.md`, legacy `outline.md`, legacy `design-notes.md`, superseded reviews, old previews | Read only when debugging history or when the user asks to see the channel. | Append-only or leave untouched. Never use as generation truth. |

Read order for every lane:

1. `MEMORY.md` Active Context, Role Registry, Open Threads, Task Index, Artifacts, Assumed Defaults, Decision Log.
2. `tasks/tasks.md` open or active rows only.
3. `threads/threads.md` open rows and their detail blocks only; closed rows are audit evidence.
4. `diagnosis.md` for material interpretation and dynamic persona, when present.
5. `roles/{lane}.md` for current lane persona and lane-local rules.
6. Owned source: `deck.md`; `DESIGN.md` before `custom.css` / `slides.html`; assembled HTML only after `build-html.sh`.
7. `channel/YYYY-MM-DD.md` only for audit/debug. Channel text must not override current truth.

### Legacy handling

- `outline.md` is audit-only if found from an older room. Do not read, write, or recreate it.
- `design-notes.md` is a legacy scratchpad. Migrate useful facts into `DESIGN.md`, `roles/design.md`, or latest valid `review.md`.
- `review.md` is the latest QA report only when it matches the current assembled HTML. If HTML changed after review, treat review as stale.
- Old project-root `*-rN.html` or `*-deck.css` files are historical unless produced by the current `build-html.sh` path.
- If `MEMORY.md` is missing but `PROJECT.md` exists, read `PROJECT.md` as legacy memory; on the next state write, create `MEMORY.md` and copy intent/defaults/Decision Log entries. Leave `PROJECT.md` untouched.

## MEMORY.md structure

`MEMORY.md` is the deck room index and current-state map. Keep it short. Store current decisions, state, and indexes — not the full deck, channel transcript, or stale preview history.

```markdown
# Memory

## Active Context
- Current request:
- Active lane:
- Next:
- Blockers:

## Room Truth Contract
- Current truth: MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, latest assembled HTML, speech.md when present.
- Work state: diagnosis.md, tasks/tasks.md active tickets, threads/threads.md open decisions and decision ledger, roles/*.md lane memory, latest valid review.md.
- Collaboration inbox: state/selection.json, events/*.jsonl, inbox/*.md, feedback-*.md, revisions/.
- Audit only: channel/YYYY-MM-DD.md, legacy PROJECT.md, legacy outline.md, legacy design-notes.md, superseded reviews, old previews, project-root sibling CSS.
- Rule: audit text never overrides current truth; legacy outline.md is never a generation source.

## Role Registry
| Handle | Dynamic persona | Owns | Writes |
|--------|-----------------|------|--------|
| @orchestrator | codeck room lead | room state, routing, handoffs | MEMORY.md, tasks, threads, channel, roles |
| @outline | {from diagnosis.md or fallback} | narrative and deck content | deck.md |
| @design | {from diagnosis.md or fallback} | design skeleton, visual system, HTML source | DESIGN.md, custom.css, slides.html |
| @review | {from diagnosis.md or fallback} | audience resistance and QA | review.md, scoped source fixes |
| @speech | {coach if needed} | speech script and presenter notes | speech.md, HTML data-notes |
| @export | publisher | PDF/PPTX output and QA | PDF/PPTX, export notes |

## Latest Channel Summary
{short summary of the latest role exchange}

## Open Threads
| ID | Kind | Owner | Status | Blocking | Writes To | Decision |
|----|------|-------|--------|----------|-----------|----------|

## Task Index
| Task | Owner | Status | Artifact | Handoff |
|------|-------|--------|----------|---------|

## Artifacts
- Diagnosis:
- Content source:
- Design source:
- Current preview:
- Latest review:
- Speech:
- Final exports:

## Assumed Defaults
- {field}: {value} — {reason}

## Decision Log
| Time | ID | Moment | Resolution | Source |
|------|----|--------|------------|--------|
```

### Other room files

- `channel/YYYY-MM-DD.md` — audit trail of expanded role turns. Append one block per handoff. Do not read during normal generation; do not let old channel facts override current truth.
- `tasks/tasks.md` — live claim tickets (no hard locks). Each ticket: owner, status, artifact, handoff. Closed history belongs in `MEMORY.md` summaries or channel, not a growing backlog.
- `threads/threads.md` — unresolved decisions, content conflicts, design disputes, cross-owner proposals, and the Decision Ask ledger. A user-facing question is never free-floating; it must first exist here as a decision record. Once resolved, copy the outcome into the owned source and `MEMORY.md` Decision Log, then mark the thread answered/defaulted/superseded. Normal reads treat only `open` rows as work state.
- `roles/*.md` — each fixed lane's long-lived rules plus current dynamic persona. Update when `diagnosis.md` changes.

## Decision Ask Policy

Decision Ask is a room-scoped decision layer, not a questionnaire. AskUser UI is only one possible renderer.

```text
Decision Ask semantics -> AskUser UI if available -> plain text pause if blocking -> assumed default if non-blocking
```

Default rule:

```text
Infer what materials already prove.
Use a reasonable default when the risk is low.
Ask only when the answer changes the deck direction.
```

One `/codeck` run may use at most **2 Decision Ask rounds**. Count all internal modules against that budget.

### Allowed moments

1. **Project Init** — only when project state is missing or ambiguous.
2. **Deck Intent** — audience scene, duration, language, and core goal. Bundle these into one round. Skip fields already clear from the user request, materials, `MEMORY.md`, or `deck.md`. Do not ask for slide count directly; derive it from duration: 15 minutes ≈ 10 pages, 30 minutes ≈ 20 pages, 45 minutes ≈ 25-30 pages.
3. **Design Direction** — before visual generation or when the user says "change the visual style".
4. **Export Format** — only when the user says "export" without PDF / PPTX / all.
5. **Speech Style** — only when the user asks for a script and style or duration is missing.

Never create a Decision Ask for: generic permission to continue, whether to generate HTML, whether to run review, whether to save files, whether to use existing materials. Those steps are automatic.

### Decision record shape

```text
id: D-YYYYMMDD-NN
owner: @orchestrator | @outline | @design | @export | @speech | @review
moment: Project Init | Deck Intent | Design Direction | Export Format | Speech Style | User-Owned Conflict
reason: why this cannot be safely inferred
current_read: what the room already knows
recommendation: the preferred option and one concrete reason
options: 2-3 mutually exclusive packages
default: the option to use if non-blocking or unanswered
blocking: true only when inventing the answer would damage the deck direction or user commitment
writes_to: MEMORY.md | deck.md | DESIGN.md | speech.md | review.md | export artifact
status: open | answered | defaulted | superseded
```

Keep an index row plus a short detail block in `threads/threads.md`:

```markdown
| D-20260511-01 | Decision Ask: Deck Intent | @outline | open | true | deck.md, MEMORY.md | choose audience scene/duration package |

### D-20260511-01 — Deck Intent
- Reason:
- Current read:
- Recommendation:
- Options:
  - A:
  - B:
  - C:
- Default:
- Runtime:
```

Every rendered ask must contain: (1) Re-ground — which skill, which step, one line; (2) Current read; (3) Recommendation `Suggest [X] because [reason]`; (4) 2-3 mutually exclusive choices, one marked recommended.

### Runtime rendering

1. If structured AskUser UI is available, render the decision through that UI.
2. If no structured UI is available and `blocking: true`, show the same decision as a compact plain-text question, write it to `threads/threads.md`, and stop before mutating the target artifact.
3. If no structured UI is available and `blocking: false`, use the default, record `assumed default`, and continue.
4. If the 2-round budget is exhausted, use the default only for non-blocking decisions; leave blocking decisions open in `threads/threads.md` and stop.

If the user does not answer a non-blocking decision, use the recommended option. Record it in `MEMORY.md` as `assumed default`.

Persist every Decision Ask result: `threads/threads.md` stores every open decision before it is rendered; `MEMORY.md` stores current room state, project-level intent, defaults, Decision Log, task index, thread index, and artifact index (not a transcript); `deck.md` stores deck-shaping decisions that affect rebuilds.

Automatic light review must not trigger Decision Ask. Write findings and fixes to `review.md`. Ask only when the content has a real conflict the user must decide.

## Three diagnostic signals

If materials exist and `diagnosis.md` doesn't, read materials and diagnose. Research the web first if the material involves a domain you're unfamiliar with or uses specialized terminology — understand key concepts, common presentation patterns, and what experts consider hard to explain.

### Signals

1. **Domain** — what field? Determines outline role.
2. **Expression challenge** — what's hardest to convey? Determines design role.
3. **Audience starting point** — what do they know / not know? Determines review role (inverse selection: the listener most likely to struggle or push back).

### Role selection methodology

Don't pick from a list. Don't match by domain. Find the person whose *way of thinking* cracks this specific problem.

**Outline role — who asks the right question about this material?** Identify the core tension, then find someone known for penetrating that *type* of tension — regardless of their field. A launch where the real challenge is "why should anyone care" might need Sondheim (every lyric earns its place) more than a marketing guru. Test: does this person's way of questioning change what the outline *includes and excludes*? If the outline would be the same without them, the match is wrong.

**Design role — whose formal logic mirrors the content's structure?** Not "good designer" but "whose way of organizing form matches how this argument moves." Layer-by-layer content → Ravel. Contrast-driven content → Caravaggio. Essence-revealing content → Dieter Rams. The match can come from any domain — music, painting, architecture, choreography. Test: can you state the structural mapping in one sentence? If not, the match is decorative.

**Review role — inverse selection.** Not the expert. The listener most likely to struggle or push back. The role determines what gets flagged — not correctness, but comprehension and trust. Test: would this person interrupt you mid-presentation? If not, pick someone harder to convince.

### diagnosis.md output

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

Skip diagnosis if no materials — let the user provide the topic directly in each stage.

## @outline lane

`@outline` owns narrative structure and canonical deck content.

Write boundaries:
- May write `deck.md`
- May update `roles/outline.md`, `tasks/tasks.md`, and `channel/YYYY-MM-DD.md`
- Must not edit `DESIGN.md`, `custom.css`, `slides.html`, `review.md`, `speech.md`, or export files
- Cross-lane changes become proposals in `threads/threads.md`

### Role activation

Read `diagnosis.md` for the recommended outline role and derivation. You ARE that person; their way of questioning becomes your editorial instinct. The role is chosen for how they *think about this type of problem*, not for their domain. The role must change what the outline includes, excludes, and sequences. Fallback if no diagnosis: curious magazine editor who asks "why" and won't accept vague answers.

### Steps

1. **Scan materials** in the current directory using a plain `find` (exclude `.git`, `node_modules`, and the deck room). User-provided structure is raw material — cut, merge, reorder freely. Classify assets: `inline` (images <2MB, SVG, code snippets → copy to `assets/`, base64-encoded), `poster` (video, audio, GIF, images >2MB → thumbnail + annotate original path), `extract` (PDF, DOCX, CSV, code → extract content, don't copy file). Rule of thumb: can the HTML still be emailed? Yes → inline. No → poster or extract. If 0 files found, use the Deck Intent Decision Ask moment once, or tell the user to add files and run `/codeck` again.

2. **Material diagnosis** (silent): core message clarity, density, presentation fit, image assets. All clear → continue silently. Conflicts that change deck direction → summarize in the Deck Intent Decision Ask. Results go into `deck.md` under "Material summary".

3. **Deck Intent** — one allowed Decision Ask moment. Default to fast: decide, write, let the user edit after. Fill core message, audience scene (industry internal / commercial launch / demo day / private session), duration (15 / 30 / 45 min), language from the room before asking. Do not ask for slide count; derive it from duration. Skip any field already clear. If missing fields would change the deck, create one `D-YYYYMMDD-NN` decision and render one bundled question with mutually exclusive packages (each option includes scene, duration, derived page count, language, goal in one line). Non-blocking + unanswered → use recommended option, write `assumed default`. Blocking + no structured UI → stop before writing `deck.md`.

4. **Research to fill gaps** — if materials are thin, the topic is unfamiliar, or key claims lack evidence, search the web. Don't fabricate data — find it. Integrate findings naturally; cite sources in the material summary or slide notes.

### Narrative structure

Story arc templates (narrative shapes, not slide titles):
- **Problem-driven:** problem → solution → evidence → implications
- **Demo-driven:** concept → demonstration → mechanism → extensions
- **Data report:** summary → metrics → patterns → actions
- **Teaching:** motivation → core idea → application → practice

### Title smithing

Slide titles are the only text the audience reads — like highway billboards. Two rules: (1) Instant clarity — no second read needed; short > long, concrete > abstract. (2) Hook — questions > statements, tension > flatness. Priority: apt first, then as dramatic as accuracy allows.

Five strategies per title: Direct assertion, Question, Tension/contrast, Concrete image, Unexpected angle. Pick the one that serves each slide's argument — don't rotate mechanically.

Quality check: Understood in one read? No → rewrite. Want to hear more? No → switch strategy. Sounds human? AI-flavored → rewrite.

Write the outline. Do not ask for confirmation before generating files.

### deck.md output

`deck.md` is the canonical content source. Do not create or update `outline.md`.

```markdown
# Outline: {topic}

## Material summary
{key content extracted from files}

## Basics
- Core message: {one-sentence thesis}
- Audience scene: {industry internal | commercial launch | demo day | private session | custom}
- Audience: {description}
- Duration: {15 minutes | 30 minutes | 45 minutes | custom}
- Page count: {derived from duration, e.g. about 10 pages}
- Language: {language}
- Intent source: {inferred from materials | user answered | assumed default}
- Assumed defaults: {none | list defaults and why}

## Decision log
| ID | Moment | Answer | Source |
|----|--------|--------|--------|
| {D-YYYYMMDD-NN or none} | Deck Intent | {answer package} | {user answered | assumed default | skipped: inferred from room/materials} |

## Story arc
{arc description}

## Slide structure
### 1. {cover title}
- Purpose: cover
- Rhythm: climax
- Key points: {points}

### 2. {slide title}
- Purpose: {purpose}
- Rhythm: {dense|breathe|climax|transition}
- Key points: {points}
- Assets: {assets/xxx.png or file:line if applicable}

## Asset manifest
| File | Level | Use | Assigned to |
|------|-------|-----|-------------|
| assets/architecture.png | inline | architecture diagram | slide 3 |

Level: inline / poster / extract. No assets → write "none".

## User intent
- Motivation: {Q1.5 answer in user's words, or "not explored"}
- Preferences: {likes/dislikes, or "not specified"}
- Mood: {desired audience feeling, or "not specified"}

## Note to designer
> {1-2 sentences: narrative intent and structural highlights}
```

### Self-review checklist

Check `deck.md` after writing. Auto-fix directly. Ask only for real user-owned content conflicts.

**Pass 1 — Structural (AUTO-FIX):**
- [HIGH] Story arc completeness — beginning creates tension, ending resolves it. Missing → choose simplest natural arc, record as assumed default.
- [HIGH] Every page has purpose (cover/content/section-divider/ending). Missing → infer from content.
- [MEDIUM] Page count derived from duration (15 min ≈ 10, 30 min ≈ 20, 45 min ≈ 25-30). Direct slide-count prompt → replace with duration-derived count. Mismatch → auto-fix unless user explicitly requested custom count.
- [HIGH] No duplicate pages making the same point → merge the overlap.

**Pass 2 — Content quality:**
- [MEDIUM] Title sharpness — communicates the point independently, not "About X". Vague → write sharper alternative.
- [MEDIUM] Info density balance — density variation should be intentional (rhythm annotation). Unintentional unevenness → redistribute or add rhythm annotation.
- [MEDIUM] AI fluff detection — replace vague amplifiers with concrete claims; remove words that could be deleted without losing meaning.
- [LOW] User intent section filled (not all "not specified") → infer from materials or record "not specified"; do not prompt.

Suppressions: don't flag fields the user explicitly said to skip; don't flag "not explored" in user intent (normal in fast mode).

### Handoff

After writing and self-review: update `MEMORY.md` (Active Context, Latest Channel Summary, Task Index, Artifacts); mark the `@outline` task done in `tasks/tasks.md`; if content needs a user decision, add/update a row in `threads/threads.md`; append the handoff to today's channel file:

```markdown
@outline
I finished `deck.md`. The next owner is @design.

@design
I will read `deck.md`, `diagnosis.md`, and the design thread before writing visual files.
```

Done output: show the single sharpest title transformation (the one where the before/after gap is biggest) plus a one-line quality assessment, the output path, and the next step.

## Feedback consumption (反馈消费)

At the start of any lane (`@outline` / `@design` / `@review`), before doing anything else, check the deck room for browser collaboration inputs:

```bash
ls "$DECK_DIR"/feedback-*.md 2>/dev/null
test -f "$DECK_DIR"/state/selection.json && cat "$DECK_DIR"/state/selection.json
ls "$DECK_DIR"/inbox/*.md 2>/dev/null
ls "$DECK_DIR"/events/*.jsonl 2>/dev/null
```

### UI selection state

`state/selection.json` is the latest deck element the user pointed at in the local editor. It carries `ckId`, role, DOM selector, bbox, text excerpt, and `sourceMap` back to `slides.html` / `custom.css`. Treat it as context, not a command. Use it to disambiguate words like "this", "here", or "the card" when an inbox message or live user request asks for a change.

### Agent marker inbox

The right-side deck editor dialog writes `inbox/agent-*.md`. Each message has a marker block: slide number, slide title, marker type (`slide`, `selection`, `block`), `ck_id`, role, selector, bbox, source selector, and excerpt. Treat the marker as the user's explicit pointer into the HTML deck, like a small block screenshot. Apply the request to source files (`deck.md`, `slides.html`, `custom.css`, `assets/`) instead of editing the built HTML directly.

Consumption:

1. Read inbox messages oldest first.
2. Resolve each marker against the current `slides.html`. Prefer `ck_id` and source selector when present; if stale, use slide number + excerpt as the fallback truth.
3. Apply the requested change in the owned source files.
4. Move consumed inbox files to `channel/{YYYY-MM-DD}-agent-inbox.md` or record them as resolved in the channel file, then remove the open inbox file.
5. Build a new revision and record the result in `MEMORY.md`.

If a `feedback-{deck}-{rev}.md` file exists, consume it before proceeding:

1. **Parse the front matter** — `deck`, `revision`, `exported_at`, `source`. The `source` field names the HTML revision the user edited (e.g. `editor-test-r1.html`).

2. **Read the three sections in order**:
   - `## 编辑改动 (Edits)` — per-slide current text + image references. This is the user's WYSIWYG edits. There is no diff; compare against the current `slides.html` to find what changed. Text edits the user made directly are authoritative — apply them to `slides.html` unless they conflict with a structural rule.
   - `## 标注 (Annotations)` — `[pin]` (element-level comment) and `[highlight]` (text selection + instruction). These are **modification instructions**, not edits. Execute them: rewrite the marked text, restructure the marked element, add the requested data.
   - `## 新增图片 (New images)` — base64 data URIs in code blocks. Decode each, save to `$DECK_DIR/assets/feedback-img-{n}.png`, then reference as `assets/feedback-img-{n}.png` in `slides.html`. If a base64 matches an existing asset's bytes, reuse the existing filename instead of creating a duplicate.

3. **Apply changes to source files** — `slides.html` (and `custom.css` if the user's annotation implies a visual change). The agent owns source files; the feedback is instructions, not a direct overwrite.

4. **Archive + reassemble** — move `feedback-{deck}-{rev}.md` to `$DECK_DIR/channel/{YYYY-MM-DD}-feedback.md` (audit trail). Run `build-html.sh` to produce a new revision. Record in `MEMORY.md`: "Applied feedback-{rev}.md: N text edits, M annotations, K new images → revision r{new}."

5. **Acknowledge** — in the done output, list the top 3 applied changes so the user sees what was heard.

If multiple `feedback-*.md` files exist, consume in chronological order (oldest `exported_at` first). Never consume a feedback file twice — once archived to `channel/`, it's audit-only.

If no feedback or inbox file exists, proceed with the normal lane flow. Event JSONL without matching inbox/feedback is still evidence: summarize it in `review.md` or `MEMORY.md` if it changes current truth. A lone `state/selection.json` is current context only; do not mutate source files from selection alone.

### Feedback loop diagram

```
HTML service → user presses E (editor) → elements receive data-ck-id
           → user clicks/operates UI → state/selection.json + events/*.jsonl
           → user edits text / replaces images
           → user presses M (mark) → pins comments / highlights text + instructions
           → right-side Agent marker dialog writes inbox/agent-*.md
           → Save/Feedback writes events/*.jsonl and feedback-{deck}-{rev}.md
           → next /codeck → agent consumes feedback → edits slides.html/custom.css
           → build-html.sh → new revision HTML → loop repeats
```
