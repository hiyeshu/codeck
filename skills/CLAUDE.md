# skills/
> L2 | Parent: ../CLAUDE.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

codeck/CLAUDE.md: Entry lane map. Defines codeck/ ownership boundaries and the room document contract.
codeck/SKILL.md: Deck room entry. Initializes MEMORY.md + channel/tasks/threads/roles, defines room document rank, Decision Ask semantics, scans materials, diagnoses content, routes work across fixed role lanes, writes expanded channel to file and keeps user output compact by default.
codeck/scripts/CLAUDE.md: Script map for room bootstrap, material scanning, and status probes.
codeck-outline/SKILL.md: @outline lane. Role activation → bundled Deck Intent Decision Ask → story arc → title smithing. Outputs deck.md as the sole content source.
codeck-outline/references/checklist.md: Outline self-review checklist.
codeck-design/SKILL.md: @design lane. Role activation → skeleton selection → DESIGN.md isomorphic mapping → structured design archive → AI writes custom.css + slides.html → build-html.sh validates and assembles single HTML.
codeck-design/references/CLAUDE.md: Reference library map for design archive specs, skeletons, visual recipes, theme presets, component recipes, image prompts, and quality gates.
codeck-design/references/: Design reference library (theme-presets.md visual systems + layout-recipes.md page structures + component-recipes.md reusable components + image-prompts.md asset prompts + skeletons.md deck rhythm + design-md-spec.md format definition + design-md-guide.md mapping rules + checklist.md design self-review + visual-floor.md quality benchmarks).
codeck/scripts/init-room.sh: Creates the slock-style deck room workspace (MEMORY.md, channel/tasks/threads/roles), seeds the Room Truth Contract, and imports legacy project memory when present.
codeck/scripts/scan-materials.sh: Deterministic material scanner for the current project; excludes generated/runtime folders and prints grouped candidates.
codeck/scripts/status.sh: Shared status detection. File detection + MEMORY status + timestamp staleness + machine-readable NEXT/CONTENT/HTML/STALE exports, called by all skills.
codeck-design/scripts/: Fixed slide engine plus validation guards (engine.js + engine.css + assemble.sh + validate-design.sh + build-html.sh). Navigation, fragments (4 entrance types), overview, speaker mode, clamp responsive system, DESIGN.md completeness validation, and self-contained HTML validation.
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

- 2026-05-11: README and conventions now state the core architecture as "a skill is a channel": /codeck is the entry channel, sub-skills are internal role channels with write boundaries and room-backed handoffs.
- 2026-05-11: codeck-design now has a guizang-level visual ingredient layer without importing template runtime: theme-presets.md, layout-recipes.md, component-recipes.md, and image-prompts.md. DESIGN.md must record Theme preset, Layout recipes, Component recipes, and Image prompt recipes before validation passes.
- 2026-05-11: Removed the legacy outline.md mirror. @outline writes only deck.md; downstream lanes and status.sh no longer read outline.md as a fallback.
- 2026-05-11: Deck Intent now asks for audience scene + duration rather than slide count. Standard rhythm: industry internal / commercial launch / demo day / private session, with 15 minutes ≈ 10 pages, 30 minutes ≈ 20 pages, 45 minutes ≈ 25-30 pages.
- 2026-05-10: design-md-spec.md now absorbs the full guizang components discipline as presentation component semantics: shell, type roles, chrome/foot, kicker/tag, callout, stats, channel cards, rowlines, pillars, figures, icons, ghost text, highlights, and motion-bearing fragments.
- 2026-05-11: Room documents now have ranked authority: current truth, live work state, and audit trail. `diagnosis.md` is live work state, `speech.md` is current truth only when present, and legacy `design-notes.md` is audit-only. Lanes read MEMORY/deck/DESIGN/open threads before channel history; init-room.sh seeds the contract into new and existing rooms.
- 2026-05-11: Decision Ask replaces UI-bound AskUser semantics. Necessary asks are first-class room decisions in threads/threads.md, then render through structured AskUser UI when available, plain text pause when blocking, or assumed defaults when non-blocking.
- 2026-05-11: build-html.sh is now the required final HTML path. It wraps assemble.sh, auto-increments revisions, rejects sibling CSS previews, and verifies speaker-mode engine markers (`openPresenter`, `codeck-presenter`, `BroadcastChannel`).
- 2026-05-11: validate-design.sh is now required before CSS/HTML generation. It rejects short DESIGN.md files without complete YAML tokens, all 10 design sections, and implementation-driving detail.
- 2026-05-10: skeletons.md now has a guizang-inspired pre-flight layer for page family, energy, tone, media slot, motion pattern, and image-slot guardrails before @design writes visual files.
- 2026-05-10: codeck-design image asset work now uses a fluid contract instead of fixed image modes. @design starts from slide need and slot, then improves, adapts, generates, composes, draws with HTML/SVG, or skips raster work. Asset examples live in asset-guide.md and DESIGN.md has an Image Assets section.
- 2026-05-10: slock-style deck room. `/codeck` is the single user entry. MEMORY.md replaces the old project file as room index; channel/tasks/threads/roles hold expanded role turns, work tickets, open decisions, and lane memory. Fixed lanes are @orchestrator, @outline, @design, @review, @speech, and @export; dynamic personas still come from diagnosis.md. Decision Ask is capped at 2 rounds and only allowed for Project Init, Deck Intent, Design Direction, Export Format, and Speech Style.
- 2026-05-10: removed the old auxiliary design artifact from the runtime protocol. @design now stores design state in DESIGN.md and roles/design.md; skeletons.md now uses the narrative grid skeleton as the default structure.
- 2026-04-22: codeck-design + codeck-review: design-dna.json → DESIGN.md migration. Adopted Google design.md format (YAML front matter for machine-readable tokens + Markdown prose for design rationale). New files: design-md-spec.md (format spec), design-md-guide.md (token → CSS mapping). Removed: design-dna-schema.md, design-dna-guide.md. Isomorphic mapping process unchanged — output format changed from JSON to DESIGN.md.
- 2026-03-30: codeck-design: image physics — added perceptual principles for image use (scarcity, scale, rhythm) to visual-floor.md. Added gotcha pointing to generate-image skill for on-demand image generation into $DECK_DIR/assets/. No rules on placement — principles that inspire AI to make its own decisions.
- 2026-03-30: codeck-design + codeck-review: perceptual compensation rewrite. Removed aesthetic constraints (cover symmetry, content density caps, cover signal-to-noise) that limited AI creativity. Added perceptual blind spot rules: projector color loss (#333→black), Windows thin font rendering, contrast fatigue relief, height breakpoint checklist, visual weight = content importance. Rules now target what AI can't see about human perception, not what humans disagree about aesthetically.
- 2026-03-30: codeck-design + codeck-review: element scale rules (superseded by perceptual rewrite above) — visual elements must use relative units (vw/vh/%/clamp), not fixed small px. Design checklist and review both check for undersized multi-element layouts. Deliberate breathing pages exempted.
- 2026-03-30: codeck-speech: fragment-synced data-notes — split speech segments per fragment step instead of dumping full text on slide entry. speech.md output format now uses `### [on enter]` / `### [fragment N]` sections for slides with fragments.
- 2026-03-29: codeck-design: add reference extraction step — user-provided URLs, screenshots, or design specs are decomposed into design signals (color logic, type contrast, spatial rhythm, material, motion, structure) and cross-checked against isomorphic mapping. Signals that match content structure are adopted; decorative-only signals are discarded.
- 2026-03-29: v2 rewrite. Single HTML architecture (fixed engine + AI-written custom.css/slides.html). Content diagnosis with three signals, role selection derived from problem nature, DESIGN.md isomorphic mapping, inverse review role. Forward-only flow: diagnosis → outline → HTML → review → export/speech. All skills in English.
- 2026-03-24: Repository directory renamed from `skill/` to `skills/`.
