# codeck skill authoring conventions

Aligned with [anthropic/skills](https://github.com/anthropics/skills) standard. Adapted for codeck's multi-role pipeline.

## Frontmatter

Standard fields only:

```yaml
---
name: codeck-xxx
description: |
  {what it does}. {trigger scenarios}.
---
```

- `name` (required): skill identifier. codeck sub-skills use `codeck-` prefix.
- `description` (required): function + trigger scenarios, pushy style (see below).

Non-standard fields (version, allowed-tools, triggers) go in body comments:

```markdown
<!-- codeck metadata
version: 2.0.0
triggers: /codeck-outline
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

- All codeck skills share the AskUserQuestion four-beat format: Re-ground, Simplify, Recommend, Options
- Upstream/downstream data passes through `~/.codeck/projects/{slug}/`, not direct skill-to-skill calls
- Each stage activates a dynamic role via diagnosis.md recommendations
- Skills and all internal documentation are in English

## Evals

Test cases live in `skills/evals/evals.json`. Two types:

### Functional evals

Verify skill output quality for a given prompt.

```json
{
  "id": 1,
  "skill": "codeck-outline",
  "prompt": "Plan an outline for a tech talk about AI agents",
  "expected_output": "generates outline.md",
  "assertions": [
    { "type": "file_exists", "path": "outline.md" },
    { "type": "file_contains", "path": "outline.md", "value": "Story arc" }
  ]
}
```

Assertion types: `contains`, `file_exists`, `file_contains`, `asks_question`, `skill_triggered`.

### Trigger evals

Verify description trigger accuracy — fires when it should, doesn't when it shouldn't.

```json
{ "query": "make a presentation", "should_trigger": "codeck", "reason": "core trigger" }
{ "query": "help me write Python", "should_trigger": null, "reason": "unrelated to presentations" }
```

Rules:
- Roughly 50/50 should-trigger and should-not-trigger
- should-not-trigger cases should be near-misses (editing markdown != making a presentation), not obviously unrelated
- Each query should sound like a real user, with specific details
