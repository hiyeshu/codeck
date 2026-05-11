# codeck/
> L2 | Parent: ../CLAUDE.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

SKILL.md: /codeck entry protocol; owns room document contract, Decision Ask semantics, routing, and compact user output.
scripts/: Deterministic shell probes and room bootstrap helpers used by the entry lane and sub-lanes.

## Boundaries

codeck/ owns orchestration and room state. It does not own deck visuals, review judgment, speech writing, or export mechanics; those live in sibling lane skills.

## Room Contract

Current truth is `MEMORY.md`, `deck.md`, `DESIGN.md`, `custom.css`, `slides.html`, latest assembled HTML, and `speech.md` when present. Work state is `diagnosis.md`, active tasks, open threads plus the Decision Ask ledger, lane role files, and latest valid review. Channel history plus legacy `outline.md` and `design-notes.md` are audit evidence only.
