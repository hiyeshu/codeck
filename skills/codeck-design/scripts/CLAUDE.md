# codeck-design/scripts/
> L2 | Parent: ../../CLAUDE.md

engine.js: Fixed slide runtime; owns navigation, fragments, overview, speaker mode, presenter sync, toolbar, and notes assembly.
engine.css: Fixed runtime chrome; owns slide shell, toolbar, overview, mobile controls, presenter layout, and engine-level responsive behavior.
assemble.sh: Low-level assembler; inlines engine.css, custom.css, slides.html, engine.js, and image assets into one HTML stream.
validate-design.sh: Design archive validator; blocks CSS/HTML generation when DESIGN.md lacks YAML tokens, required sections, visual recipe selections, or implementation-driving detail.
build-html.sh: Final build guard; auto-increments project-root revisions, calls assemble.sh, and rejects output without speaker-mode markers or self-contained CSS.

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
