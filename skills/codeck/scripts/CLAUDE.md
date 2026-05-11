# codeck/scripts/
> L2 | Parent: ../CLAUDE.md

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

## Members

init-room.sh: Bootstraps deck room directories and current-state documents; seeds the room truth contract into new and existing rooms.
scan-materials.sh: Scans the user project for candidate deck materials without mutating project or room files.
status.sh: Reads current truth and prints the pipeline dashboard plus machine-readable state exports.

## Boundaries

Scripts stay deterministic and small. They may inspect files and initialize room scaffolding, but creative decisions remain in SKILL.md protocols and lane artifacts.
