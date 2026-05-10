---
name: codeck
version: 2.1.0
description: |
  codeck entry point. Scans local files for materials, shows pipeline
  dashboard with diagnostic intelligence, guides user to the next step.
  Use when the user says "codeck", "new deck", "make a presentation",
  "make a deck", "new slides", "build a presentation", "export",
  "speech", "script", or wants to start or continue a presentation
  project. /codeck is the user-facing entry; legacy sub-skills are
  internal modules.
---

# codeck — Deck Room Entry

Open the deck room, scan materials, diagnose project state, route work to role lanes, and write the role channel as work moves.

Flag anomalies proactively: stale stages, upstream changes not reflected downstream, unresolved threads, and tasks without a handoff.

## Deck room model

codeck follows a slock-style collaboration model in one skill runtime.

Fixed role lanes:

| Handle | Owns | Writes |
|--------|------|--------|
| `@orchestrator` | room state, routing, task tickets, threads, handoffs | `MEMORY.md`, `tasks/tasks.md`, `threads/threads.md`, `channel/YYYY-MM-DD.md`, `roles/*.md` |
| `@outline` | narrative, deck content, slide structure | `deck.md`, legacy mirror `outline.md` |
| `@design` | design skeleton, visual system, HTML source | `DESIGN.md`, `custom.css`, `slides.html` |
| `@review` | audience resistance, QA, scoped fixes | `review.md`, scoped fixes to `slides.html` / `custom.css` |
| `@speech` | talk track, presenter notes | `speech.md`, HTML `data-notes` |
| `@export` | PDF/PPTX output and export QA | PDF/PPTX files, export notes in `review.md` or `MEMORY.md` |

Dynamic role persona:

- Read `diagnosis.md` for the recommended person behind `@outline`, `@design`, and `@review`.
- The fixed handle owns the work. The dynamic person shapes the judgment.
- Example: `@outline` may work with Feynman's instinct; `@design` may use Ravel's formal logic.

Default user-facing output is compact: judgment, artifact, next action. The expanded role channel is written to `channel/YYYY-MM-DD.md`; show it only when the user asks to see the channel.

Compact response shape:

```markdown
codeck: {state}

I read this as {task}. I {did/will do} {action}.

Artifact: `{path}`
Next: `{next command or next lane}`
```

When the user asks to see the channel, show the handoff:

```markdown
@orchestrator
I read the current request as: {task}. Owner: @outline.

@outline
I will change `deck.md` first and leave visual files alone.

@design
I will rebuild `slides.html` and `custom.css` after the content changes.

@review
I will check whether the change lands for the target audience.
```

## Memory protocol

`MEMORY.md` is the deck room index. It replaces `PROJECT.md`.

Keep it short. Store decisions, state, and indexes. Do not paste the full deck.

`MEMORY.md` must include:

```markdown
# Memory

## Active Context
- Current request:
- Active lane:
- Next:
- Blockers:

## Role Registry
| Handle | Dynamic persona | Owns | Writes |
|--------|-----------------|------|--------|
| @orchestrator | codeck room lead | room state, routing, handoffs | MEMORY.md, tasks, threads, channel, roles |
| @outline | {from diagnosis.md or fallback} | narrative and deck content | deck.md, outline.md |
| @design | {from diagnosis.md or fallback} | design skeleton, visual system, HTML source | DESIGN.md, custom.css, slides.html |
| @review | {from diagnosis.md or fallback} | audience resistance and QA | review.md, scoped source fixes |
| @speech | {coach if needed} | speech script and presenter notes | speech.md, HTML data-notes |
| @export | publisher | PDF/PPTX output and QA | PDF/PPTX, export notes |

## Latest Channel Summary
{short summary of the latest role exchange}

## Open Threads
| ID | Topic | Status | Decision |
|----|-------|--------|----------|

## Task Index
| Task | Owner | Status | Artifact | Handoff |
|------|-------|--------|----------|---------|

## Artifacts
- Source of truth:
- Current preview:
- Final exports:

## Assumed Defaults
- {field}: {value} — {reason}

## AskUser Log
| Time | Moment | Answer | Source |
|------|--------|--------|--------|
```

Workspace directories:

```text
$DECK_DIR/MEMORY.md
$DECK_DIR/channel/YYYY-MM-DD.md
$DECK_DIR/tasks/tasks.md
$DECK_DIR/threads/threads.md
$DECK_DIR/roles/orchestrator.md
$DECK_DIR/roles/outline.md
$DECK_DIR/roles/design.md
$DECK_DIR/roles/review.md
$DECK_DIR/roles/speech.md
$DECK_DIR/roles/export.md
```

`channel/YYYY-MM-DD.md` stores expanded role turns. Append one block per handoff:

```markdown
## {ISO time} — {request}

@orchestrator
{routing read}

@{owner}
{claim and action}

@{next-owner}
{handoff if any}
```

`tasks/tasks.md` stores claim tickets. Do not use hard locks. Each ticket has owner, status, artifact, and handoff.

`threads/threads.md` stores unresolved decisions, content conflicts, design disputes, and cross-owner proposals.

`roles/*.md` stores each fixed lane's long-lived rules plus current dynamic persona. Update it when `diagnosis.md` changes.

Legacy migration:

- If `MEMORY.md` is missing but `PROJECT.md` exists, read `PROJECT.md` as legacy memory.
- On the next state write, create `MEMORY.md` and copy intent/defaults/AskUser log into the matching sections.
- Leave `PROJECT.md` untouched. Do not keep writing to it.

## AskUser Policy

AskUser is a decision layer, not a questionnaire.

Default rule:

```text
Infer what materials already prove.
Use a reasonable default when the risk is low.
Ask only when the answer changes the deck direction.
```

One `/codeck` run may use at most **2 AskUser rounds**. Count all internal modules against that budget.

Allowed AskUser moments:

1. **Project Init** — only when project state is missing or ambiguous.
2. **Deck Intent** — audience, duration, language, and core goal. Bundle these into one round. Skip fields already clear from the user request, materials, `MEMORY.md`, or `deck.md`.
3. **Design Direction** — before visual generation or when user says "change the visual style".
4. **Export Format** — only when user says "export" without PDF / PPTX / all.
5. **Speech Style** — only when user asks for a script and style or duration is missing.

Never ask:

- Generic permission to continue
- Whether to generate HTML
- Whether to run review
- Whether to save files
- Whether to use existing materials

Those steps are automatic.

Every AskUser must contain:

1. **Re-ground** — which skill, which step. One line.
2. **Current read** — what the system thinks is true.
3. **Recommendation** — `Suggest [X] because [reason]`.
4. **Options** — 2-3 mutually exclusive choices. Mark one as recommended.

Only state verified facts. Unexecuted actions use "will / plan to".

If the user does not answer, use the recommended option. Record it in `MEMORY.md` as `assumed default`.

Persist every AskUser result:

- `MEMORY.md` stores room state, project-level intent, defaults, AskUser log, task index, thread index, and artifact index.
- `deck.md` stores deck-shaping decisions that affect rebuilds. During migration, also mirror them in `outline.md` if that is the active content file.

Automatic light review must not trigger AskUser. Write findings and fixes to `review.md`. Ask only when the content has a real conflict the user must decide.

---

## Single-entry routing

`/codeck` routes the user's request before running the pipeline:

| User intent | Action | AskUser |
|-------------|--------|---------|
| New / continue deck | `@orchestrator` opens room → scan → diagnose → `@outline` → `@design` → `@review` | Deck Intent and Design Direction only if needed, max 2 rounds |
| "make slide 3 less dense" / concrete content edit | `@outline` edits `deck.md` → `@design` rebuilds → `@review` checks | none |
| "change visual style" / "change style" | `@design` runs Design Direction, updates `DESIGN.md`, rebuilds → `@review` checks | Design Direction |
| "export" | `@export` exports latest HTML | Export Format only if PDF / PPTX / all is missing |
| "export PDF" / "export PPTX" | `@export` exports requested format | none |
| "create speech script" | `@speech` generates `speech.md` and syncs notes | Speech Style only if style or duration is missing |

For edits, `deck.md` is the single truth source. HTML is the audience preview, not the editing surface.

Before a lane works:

1. `@orchestrator` writes or updates a task ticket.
2. The owner states the claim in channel.
3. The owner reads only the needed artifacts plus `MEMORY.md`.
4. Cross-owner changes go to `threads/threads.md` as proposals.

After a lane works:

1. Update the task ticket.
2. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
3. Append the role exchange to today's channel file.
4. Keep the user response compact unless the user asked for the channel.

## Two directories

- **Current directory (`.`)** — the user's project. Materials live here. **Final HTML goes here too** so the user can open it directly.
- **`$DECK_DIR`** — codeck's deck room. `MEMORY.md`, `channel/`, `tasks/`, `threads/`, `roles/`, `deck.md` or `outline.md`, `diagnosis.md`, `DESIGN.md`, `custom.css`, `slides.html`, `review.md`, `speech.md`.

Scan materials in `.`. Write intermediate artifacts to `$DECK_DIR`. Output final HTML to `.`.

## Phase 1: Init + status

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in "$HOME/.agents/skills/codeck" "$HOME/.codex/skills/codeck" "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found" >&2; exit 1; }
mkdir -p "$DECK_DIR"
mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles"
bash "$CODECK_SKILL_DIR/scripts/init-room.sh" "$DECK_DIR"

bash "$CODECK_SKILL_DIR/scripts/status.sh" "$DECK_DIR"
```

Initialize the room before asking anything:

1. If `$DECK_DIR/MEMORY.md` is missing, create it from the Memory protocol template.
2. If `$DECK_DIR/PROJECT.md` exists, migrate its intent, defaults, and AskUser log into `MEMORY.md`.
3. If `$DECK_DIR/tasks/tasks.md` is missing, create it with the task ticket table.
4. If `$DECK_DIR/threads/threads.md` is missing, create it with the thread table.
5. If any `roles/*.md` file is missing, create it with that fixed lane's ownership and write boundaries.
6. Append the current request and routing read to today's channel file.

Read existing `MEMORY.md`, `tasks/tasks.md`, `threads/threads.md`, `deck.md`, and `outline.md` before asking anything. If a value is already stated there or safely inferable from materials, do not ask it again.

Track AskUser rounds for this run. Stop at 2. If another decision remains, use the recommended default and write it to `MEMORY.md`.

## Phase 2: Material scan

Scan the **current directory** (the user's project), not DECK_DIR.

```bash
bash "$CODECK_SKILL_DIR/scripts/scan-materials.sh" .
```

Do not use `eval find` for material scan. If the script is unavailable, use a plain `find` with explicit `! -path` exclusions.

---

## Phase 3: Content diagnosis

If materials exist and `$DECK_DIR/diagnosis.md` doesn't, read materials and diagnose:

### Research before diagnosis

If the material involves a domain you're unfamiliar with, or uses specialized terminology, **search the web first**. Understand the field's key concepts, common presentation patterns, and what experts in this space consider hard to explain. This grounds your diagnosis in real knowledge, not guesses.

Examples:
- Material about "WebTransport protocol" → search for what it is, how it differs from WebSocket, who's adopting it
- Material about a specific company's product → search for the product, its competitors, its positioning
- Material in a niche academic field → search for how practitioners in that field typically present findings

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

## State outputs

Define what the user sees in each pipeline state. These are the exact outputs — not summaries.

### Empty state (no materials found)

When Phase 2 finds zero files:

```
No materials found in this directory.

That's fine — you can start from a topic directly.

Tell me the topic in one sentence, or drop files here and run /codeck again.
```

Warm, not clinical. One primary action. No error language.

### Error state (assemble.sh fails)

When assemble.sh exits non-zero:

```
Assembly failed: {error message}

Check that custom.css and slides.html exist in {DECK_DIR}.
Run /codeck to rebuild.
```

Name the exact file missing. Give the exact command to fix it.

### Stale state (upstream changed, downstream not rebuilt)

When status.sh detects staleness:

```
⚠ {stage} is stale — {upstream file} changed after {downstream file} was built.
Run /codeck to rebuild.
```

One line. Name the files. Give the command.

---

## Phase 4: Results

status.sh already outputs the dashboard. Below it, add:

1. **Materials** — file types and counts from Phase 2
2. **STALE** — one-line explanation if any stage is stale
3. **Threads** — unresolved decisions from `threads/threads.md`, only if any are open
4. **Channel** — only if the user asks to see the internal channel

Don't redraw the table.

### Role reveal (if Phase 3 ran)

This is the first moment the user sees the system *think*. Don't dump three role names — tell a story in three beats:

1. **What your content is really about** — the core tension, in one sentence. Not the topic, the underlying struggle. ("Your material isn't about microservices — it's about convincing a team to accept short-term pain for long-term sanity.")

2. **Who I'm bringing in, and why** — the derivation, not just the name. Connect the person's *way of thinking* to the content's tension. ("For the outline, I'm thinking of Feynman — not because this is physics, but because your argument needs to make the invisible feel obvious. He did that better than anyone.")

3. **What this changes** — one concrete consequence. ("This means the outline won't start with background. It'll start with the one thing your audience already knows is broken.")

Keep it short. Three paragraphs, not three pages. The point is: the user should feel their content was *seen*, not just processed.

### Channel visibility

Every `/codeck` run writes the role channel to `channel/YYYY-MM-DD.md`. User responses stay compact by default. If the user asks for the channel, show the role blocks for the work just done or about to happen.

Use handles, not stage names:

```markdown
@orchestrator
{what I read, which task ticket I opened, who owns it}

@outline
{what I will change or changed, and which artifact I touched}

@design
{handoff or rebuild note}

@review
{verification lens and result}
```

Do not invent work. If a role did not participate, omit it.

---

## Phase 5: Handoff

All outputs go to `$DECK_DIR/`. Next skill reads upstream outputs.

Before the response ends, update:

- `MEMORY.md` Active Context, Latest Channel Summary, Task Index, Artifacts
- `tasks/tasks.md` current ticket status and handoff
- `threads/threads.md` if a decision remains
- `channel/YYYY-MM-DD.md` with the expanded role exchange

status.sh prints a NEXT recommendation. Use it:

| NEXT | Suggest |
|------|---------|
| `outline` | "Materials scanned. Next: `/codeck` will plan the structure." |
| `design` | "Outline ready. Next: `/codeck` will generate slides." |
| `review` | "Slides generated. Next: `/codeck` will inspect and fix." |
| `export` / `speech` | "Review done. Next: `/codeck export PDF` or `/codeck speech script`." |

User can run `/codeck` anytime to see progress.
