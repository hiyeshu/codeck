# skills/

## Members

codeck/SKILL.md: Entry dashboard. Material scan + content diagnosis (3 signals: domain, expression challenge, audience starting point) + dynamic role recommendation + pipeline status.
codeck-outline/SKILL.md: Editor role. Role activation → narrative questions → story arc → title smithing. Outputs outline.md (with user intent section).
codeck-outline/references/checklist.md: Outline self-review checklist.
codeck-design/SKILL.md: Designer role. Role activation → design-dna isomorphic mapping → structured design archive → AI writes custom.css + slides.html → assemble.sh assembles single HTML.
codeck-design/references/: Design archive specs (design-dna-schema.md field definitions + design-dna-guide.md mapping rules + checklist.md design self-review).
codeck/scripts/status.sh: Shared status detection. File detection + timestamp staleness + NEXT recommendation, called by all skills.
codeck-design/scripts/: Fixed slide engine (engine.js + engine.css + assemble.sh). Navigation, fragments (4 entrance types), overview, speaker mode, clamp responsive system.
codeck-review/SKILL.md: Reviewer role (inverse selection: listener most likely to struggle). Six-dimension review + direct HTML fixes, decision summary appends to design-notes.md.
codeck-export/SKILL.md: Publisher role. HTML as single source of truth, PDF (Playwright) / PPTX export + QA.
codeck-export/pptx/: PPTX tools (PptxGenJS, thumbnail.py, soffice.py).
codeck-export/pdf/: PDF tools (pypdf/reportlab reference, form filling).
codeck-speech/SKILL.md: Speech writer role. Role activation → verbatim transcript + stage directions + time budget + write back HTML data-notes.
CONVENTIONS.md: Skill authoring conventions (frontmatter / description / directory structure / evals).
LICENSE: Apache-2.0.

## Dependencies

Upstream: playwright, pptxgenjs
Downstream: Claude skill runtime

## Changelog

- 2026-03-29: v2 rewrite. Single HTML architecture (fixed engine + AI-written custom.css/slides.html). Content diagnosis with three signals, role selection derived from problem nature, design-dna isomorphic mapping, inverse review role. Forward-only flow: diagnosis → outline → HTML → review → export/speech. All skills in English.
- 2026-03-24: Repository directory renamed from `skill/` to `skills/`.
