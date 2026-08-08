# codeck skill authoring conventions
<!--
[INPUT]: Depends on the codeck skill tree and Anthropic skill packaging conventions.
[OUTPUT]: Provides shared authoring rules for codeck skills and room protocol.
[POS]: skills module policy file; constrains every SKILL.md under this directory.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

Aligned with [anthropic/skills](https://github.com/anthropics/skills) standard. Adapted for codeck's multi-role pipeline.

## Frontmatter

Required fields plus the `version` extension. codeck-aligned skills all carry a `version` so the changelog in `skills/CLAUDE.md` lines up with each lane's released state.

```yaml
---
name: codeck-xxx
version: 2.x.y
description: |
  {what it does}. {trigger scenarios}.
---
```

- `name` (required): skill identifier. codeck sub-skills use `codeck-` prefix.
- `description` (required): function + trigger scenarios, pushy style (see below).
- `version` (required for codeck lanes): semver-ish string. Bump when SKILL.md protocol changes.

Other non-standard fields (allowed-tools, triggers, etc.) still go in body comments:

```markdown
<!-- codeck metadata
triggers: /codeck
-->
```

## Description — pushy style

Claude tends to under-trigger skills. The description is the main trigger mechanism. Be aggressive.

**Template:**
```
{one-sentence function}. {output}. Use whenever the user says {trigger words},
or wants to {user intent} — even if they don't explicitly mention "{skill name}".
```

**Rules:**
1. Cover both Chinese and English trigger words
2. List 4-6 specific trigger phrases in quotes
3. End with a catch-all: "even if they don't explicitly mention X"
4. Write scenarios, not just features

## Directory structure

```
skill-name/
├── SKILL.md          # required, < 500 lines
├── references/       # optional, detailed reference material
├── scripts/          # optional, executable scripts
└── assets/           # optional, templates/icons/fonts
```

## Progressive disclosure

1. **Metadata** (name + description) — always in context, ~100 words
2. **SKILL.md body** — loaded when skill triggers, < 500 lines
3. **Bundled resources** — loaded on demand, no limit

When SKILL.md approaches 500 lines, move details to references/ and note when to read them.

## Instruction style

- Imperatives ("read the file" not "you should read the file")
- Explain why, don't stack MUSTs ("the user may not have looked at the screen for 20 minutes, so re-ground first" beats "MUST re-ground")
- Give examples, especially for output formats
- Theory of mind: imagine how the model reads your instruction, write so it naturally does the right thing

## codeck conventions

- `/codeck` is the user-facing entry. Sub-skills may exist as internal modules, but user handoffs point back to `/codeck`.
- A skill is a channel: an addressable role with a write boundary, durable room files, and a handoff protocol.
- codeck is a deck room, not a linear wizard. `MEMORY.md` is the room index; `channel/`, `tasks/`, `threads/`, and `roles/` hold the collaboration state.
- Fixed role lanes are `@orchestrator`, `@outline`, `@design`, `@review`, `@speech`, and `@export`.
- Each lane has a write boundary. Cross-lane changes go to `threads/threads.md` as proposals.
- Task claiming is a work ticket, not a hard lock: owner, status, artifact, handoff.
- Decision Ask appears only at allowed decision moments: Project Init, Deck Intent, Design Direction, Export Format, Speech Style.
- Each `/codeck` run has a hard cap of 2 Decision Ask rounds. Infer first, default second, ask only when the answer changes the deck.
- Decision Ask is semantic state, not UI. Record it in `threads/threads.md` before rendering through AskUser UI, plain text pause, or assumed default.
- Rendered ask shape: Re-ground, Current read, Recommendation, 2-3 mutually exclusive options.
- Record answers and assumed defaults in `MEMORY.md`; record deck-shaping choices in `deck.md`.
- Upstream/downstream data passes through `~/.codeck/projects/{slug}/`, not direct skill-to-skill calls
- Each stage activates a dynamic role via diagnosis.md recommendations
- Skills and all internal documentation are in English

## Packaging & versions

- The repository is simultaneously a Claude Code marketplace/plugin (`.claude-plugin/`), a Codex marketplace/plugin (`.codex-plugin/` + `.agents/plugins/`), and a flat skills bundle (`skills/` consumed by skills.sh). All three channels ship the same `skills/` directory; never restructure `skills/` in a way that breaks any channel.
- Two version scopes: the **bundle version** lives in both plugin.json files, must stay identical, and bumps on any released change under `skills/`; the **per-skill version** lives in each SKILL.md frontmatter and bumps per lane change. `scripts/check-plugin-metadata.mjs` enforces both (CI runs it on every PR).
- Every SKILL.md that needs lane directories starts from the unified Setup bootstrap block below — copy it verbatim, then assert the specific `CODECK_*_DIR` you need. Never hard-code an install path outside this probe list; the metadata check rejects it.

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in \
    "${CLAUDE_PLUGIN_ROOT}/skills/codeck" \
    "$HOME"/.claude/plugins/cache/*/codeck/*/skills/codeck \
    "$HOME"/.codex/plugins/cache/*/codeck/*/skills/codeck \
    "$HOME/.agents/skills/codeck" \
    "$HOME/.codex/skills/codeck" \
    "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found; set CODECK_SKILL_DIR" >&2; exit 1; }
. "$CODECK_SKILL_DIR/scripts/resolve-dirs.sh"
```

- Write `${CLAUDE_PLUGIN_ROOT}` exactly as shown — never the `${VAR:-}` modifier form, which may defeat the plugin runtime's textual substitution. Unset, it expands empty and the `-d` test fails harmlessly.
