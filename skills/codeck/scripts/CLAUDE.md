# codeck/scripts/
> L2 | Parent: ../CLAUDE.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

init-room.sh: Bootstraps deck room directories and current-state documents; seeds the room truth contract into new and existing rooms.
resolve-dirs.sh: Shared lane-directory resolver, sourced (never executed) by every SKILL.md Setup bootstrap. Derives CODECK_ROOT from the resolved codeck dir, then CODECK_DESIGN_DIR / CODECK_EXPORT_DIR via sibling-first lookup with flat-install fallback; env overrides always win.
scan-materials.sh: Scans the user project for candidate deck materials without mutating project or room files.
status.sh: Reads current truth and prints the pipeline dashboard plus machine-readable state exports.

## Boundaries

Scripts stay deterministic and small. They may inspect files and initialize room scaffolding, but creative decisions remain in SKILL.md protocols and lane artifacts.
