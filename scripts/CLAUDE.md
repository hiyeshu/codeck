# scripts/
> L2 | Parent: ../CLAUDE.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

check-plugin-metadata.mjs: Release gate. Asserts the four plugin manifests (.claude-plugin/{plugin,marketplace}.json, .codex-plugin/plugin.json, .agents/plugins/marketplace.json) agree on name/version/self-referential source/policy, that every skills/*/SKILL.md frontmatter name matches its directory and carries strict semver, and that hard-coded install paths never reappear outside the unified probe list. Run by CI on every PR and main push.

## Boundaries

Release tooling only — nothing here runs at skill runtime. Skill-runtime shell helpers live in skills/codeck/scripts/.
