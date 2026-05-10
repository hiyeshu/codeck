# skills/

## Members

codeck/SKILL.md: Deck room entry. Initializes MEMORY.md + channel/tasks/threads/roles, scans materials, diagnoses content, routes work across fixed role lanes, writes expanded channel to file and keeps user output compact by default.
codeck-outline/SKILL.md: @outline lane. Role activation → bundled Deck Intent → story arc → title smithing. Outputs deck.md and mirrors outline.md for compatibility.
codeck-outline/references/checklist.md: Outline self-review checklist.
codeck-design/SKILL.md: @design lane. Role activation → skeleton selection → DESIGN.md isomorphic mapping → structured design archive → AI writes custom.css + slides.html → assemble.sh assembles single HTML.
codeck-design/references/: Design archive specs (skeletons.md narrative grid skeleton + design-md-spec.md format definition + design-md-guide.md mapping rules + checklist.md design self-review).
codeck/scripts/init-room.sh: Creates the slock-style deck room workspace (MEMORY.md, channel/tasks/threads/roles) and imports legacy project memory when present.
codeck/scripts/status.sh: Shared status detection. File detection + MEMORY status + timestamp staleness + machine-readable NEXT/CONTENT/HTML/STALE exports, called by all skills.
codeck-design/scripts/: Fixed slide engine (engine.js + engine.css + assemble.sh). Navigation, fragments (4 entrance types), overview, speaker mode, clamp responsive system.
codeck-review/SKILL.md: @review lane (inverse selection: listener most likely to struggle). Six-dimension review + scoped HTML fixes, decision summary in review.md and MEMORY.md.
codeck-export/SKILL.md: @export lane. HTML as single source of truth, PDF (Playwright) / PPTX export + QA.
codeck-export/pptx/: PPTX tools (PptxGenJS, thumbnail.py, soffice.py).
codeck-export/pdf/: PDF tools (pypdf/reportlab reference, form filling).
codeck-speech/SKILL.md: @speech lane. Role activation → verbatim transcript + stage directions + time budget + write back HTML data-notes.
CONVENTIONS.md: Skill authoring conventions (frontmatter / description / directory structure / evals).
LICENSE: MIT.

## Dependencies

Upstream: playwright, pptxgenjs
Downstream: Claude skill runtime

## Changelog

- 2026-05-10: design-md-spec.md now absorbs the full guizang components discipline as presentation component semantics: shell, type roles, chrome/foot, kicker/tag, callout, stats, channel cards, rowlines, pillars, figures, icons, ghost text, highlights, and motion-bearing fragments.
- 2026-05-10: skeletons.md now has a guizang-inspired pre-flight layer for page family, energy, tone, media slot, motion pattern, and image-slot guardrails before @design writes visual files.
- 2026-05-10: codeck-design image asset work now uses a fluid contract instead of fixed image modes. @design starts from slide need and slot, then improves, adapts, generates, composes, draws with HTML/SVG, or skips raster work. Asset examples live in asset-guide.md and DESIGN.md has an Image Assets section.
- 2026-05-10: slock-style deck room. `/codeck` is the single user entry. MEMORY.md replaces the old project file as room index; channel/tasks/threads/roles hold expanded role turns, work tickets, open decisions, and lane memory. Fixed lanes are @orchestrator, @outline, @design, @review, @speech, and @export; dynamic personas still come from diagnosis.md. AskUser is capped at 2 rounds and only allowed for Project Init, Deck Intent, Design Direction, Export Format, and Speech Style.
- 2026-05-10: removed the old auxiliary design artifact from the runtime protocol. @design now stores design state in DESIGN.md and roles/design.md; skeletons.md now uses the narrative grid skeleton as the default structure.
- 2026-04-22: codeck-design + codeck-review: design-dna.json → DESIGN.md migration. Adopted Google design.md format (YAML front matter for machine-readable tokens + Markdown prose for design rationale). New files: design-md-spec.md (format spec), design-md-guide.md (token → CSS mapping). Removed: design-dna-schema.md, design-dna-guide.md. Isomorphic mapping process unchanged — output format changed from JSON to DESIGN.md.
- 2026-03-30: codeck-design: image physics — added perceptual principles for image use (scarcity, scale, rhythm) to visual-floor.md. Added gotcha pointing to generate-image skill for on-demand image generation into $DECK_DIR/assets/. No rules on placement — principles that inspire AI to make its own decisions.
- 2026-03-30: codeck-design + codeck-review: perceptual compensation rewrite. Removed aesthetic constraints (cover symmetry, content density caps, cover signal-to-noise) that limited AI creativity. Added perceptual blind spot rules: projector color loss (#333→black), Windows thin font rendering, contrast fatigue relief, height breakpoint checklist, visual weight = content importance. Rules now target what AI can't see about human perception, not what humans disagree about aesthetically.
- 2026-03-30: codeck-design + codeck-review: element scale rules (superseded by perceptual rewrite above) — visual elements must use relative units (vw/vh/%/clamp), not fixed small px. Design checklist and review both check for undersized multi-element layouts. Deliberate breathing pages exempted.
- 2026-03-30: codeck-speech: fragment-synced data-notes — split speech segments per fragment step instead of dumping full text on slide entry. speech.md output format now uses `### [on enter]` / `### [fragment N]` sections for slides with fragments.
- 2026-03-29: codeck-design: add reference extraction step — user-provided URLs, screenshots, or design specs are decomposed into design signals (color logic, type contrast, spatial rhythm, material, motion, structure) and cross-checked against isomorphic mapping. Signals that match content structure are adopted; decorative-only signals are discarded.
- 2026-03-29: v2 rewrite. Single HTML architecture (fixed engine + AI-written custom.css/slides.html). Content diagnosis with three signals, role selection derived from problem nature, DESIGN.md isomorphic mapping, inverse review role. Forward-only flow: diagnosis → outline → HTML → review → export/speech. All skills in English.
- 2026-03-24: Repository directory renamed from `skill/` to `skills/`.
