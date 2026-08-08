---
name: codeck-export
version: 2.1.1
description: |
  Internal publisher module for /codeck. Exports deck to PDF or PPTX
  with post-export QA. User-facing export requests should enter through
  /codeck; this skill defines the export behavior.
---

<!--
[INPUT]: Depends on latest assembled HTML, MEMORY.md, tasks/tasks.md, and threads/threads.md.
[OUTPUT]: Provides PDF/PPTX exports and export QA notes.
[POS]: skills/codeck-export lane; publishes the reviewed deck from room state to final artifacts.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# codeck export — @export lane

Minimum conversation, maximum output. Export the deck to the user's format.

`@export` owns PDF/PPTX output and export QA.

Write boundaries:

- May write final PDF/PPTX files in the user's project directory
- May write export QA notes to `$DECK_DIR/review.md` or `$DECK_DIR/MEMORY.md`
- May update `$DECK_DIR/roles/export.md`, `$DECK_DIR/tasks/tasks.md`, and `$DECK_DIR/channel/YYYY-MM-DD.md`
- Must not edit `deck.md`, `DESIGN.md`, `custom.css`, `slides.html`, or `speech.md`
- Export defects that require source changes become proposals in `$DECK_DIR/threads/threads.md`

## Step 1: Status

```bash
DECK_DIR="$HOME/.codeck/projects/$(basename "$(pwd)")"
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in \
    "${CLAUDE_PLUGIN_ROOT}/skills/codeck" \
    "$HOME"/.claude/plugins/cache/*/codeck/*/skills/codeck \
    "$HOME"/.codex/plugins/cache/*/codeck/skills/codeck \
    "$HOME/.agents/skills/codeck" \
    "$HOME/.codex/skills/codeck" \
    "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found; set CODECK_SKILL_DIR" >&2; exit 1; }
. "$CODECK_SKILL_DIR/scripts/resolve-dirs.sh"
mkdir -p "$DECK_DIR"
mkdir -p "$DECK_DIR/channel" "$DECK_DIR/tasks" "$DECK_DIR/threads" "$DECK_DIR/roles"
bash "$CODECK_SKILL_DIR/scripts/init-room.sh" "$DECK_DIR"
bash "$CODECK_SKILL_DIR/scripts/status.sh" "$DECK_DIR"
```

Read `$DECK_DIR/MEMORY.md`, active rows in `$DECK_DIR/tasks/tasks.md`, and open rows in `$DECK_DIR/threads/threads.md`. Do not read `channel/YYYY-MM-DD.md` unless debugging history.

Gate check: if no assembled HTML exists (`./*-r*.html`), run `/codeck` to generate/rebuild the deck first.

Before export, claim the work ticket:

```markdown
@orchestrator
Owner: @export. Task: export latest HTML and run export QA.

@export
I claim the export pass. I will write PDF/PPTX outputs and record any source defects as threads.
```

Append the exchange to today's channel file and update `tasks/tasks.md`.

## Step 2: Format

Export Format is one allowed Decision Ask moment under `/codeck`.

Use the shared `/codeck` Decision Ask Policy. Skip Decision Ask when the user names a target:

- `PDF`, `print`, `save as PDF` → export PDF
- `PPTX`, `PowerPoint`, `slides file` → export PPTX
- `all`, `both` → export PDF and PPTX

If the user only says "export", create a non-blocking `D-YYYYMMDD-NN` decision in `threads/threads.md` and render once:

```text
codeck needs the export format.

Current read: HTML already exists as the audience preview.

I suggest PDF because it preserves the visual layout and is easiest to share.

A) PDF (recommended)
B) PPTX
C) PDF + PPTX
```

If the user does not answer or structured AskUser UI is unavailable, export PDF and write `assumed default` to `MEMORY.md`.

Do not offer HTML as an export choice. HTML is the preview/source artifact.

## Step 3: Export

Find the HTML file (`./*-r*.html` in the user's project directory), derive baseName.

### HTML

Already exists. Open in browser, F for fullscreen, arrows to navigate.

### PDF — print from HTML

Use Playwright for WYSIWYG PDF:

```bash
npx playwright install chromium 2>/dev/null || true
```

```javascript
import { chromium } from 'playwright';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';

const html = readdirSync('.').find(f => /-r\d+\.html$/.test(f));
const baseName = html.replace('.html', '');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve(html)).toString(), { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'screen' });
await page.pdf({
  path: `${baseName}.pdf`,
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' }
});
await browser.close();
console.log(`done: ${baseName}.pdf`);
```

### Poster assets

`.media-poster` elements in slides.html are video/audio placeholders. Original file paths are in the caption and `deck.md` asset manifest.

Default: keep placeholders in export. If user says "embed video", extract path from caption, use `slide.addMedia({ path: "..." })` for PPTX.

### PPTX — from HTML

**Option A (recommended): LibreOffice**

```bash
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in \
    "${CLAUDE_PLUGIN_ROOT}/skills/codeck" \
    "$HOME"/.claude/plugins/cache/*/codeck/*/skills/codeck \
    "$HOME"/.codex/plugins/cache/*/codeck/skills/codeck \
    "$HOME/.agents/skills/codeck" \
    "$HOME/.codex/skills/codeck" \
    "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found; set CODECK_SKILL_DIR" >&2; exit 1; }
. "$CODECK_SKILL_DIR/scripts/resolve-dirs.sh"
[ -n "${CODECK_EXPORT_DIR:-}" ] || { echo "codeck-export not found; set CODECK_EXPORT_DIR" >&2; exit 1; }
EXPORT_SCRIPTS="$CODECK_EXPORT_DIR/pptx/scripts"
python "$EXPORT_SCRIPTS/office/soffice.py" --headless --convert-to pdf ./*-r*.html
python "$EXPORT_SCRIPTS/office/soffice.py" --headless --convert-to pptx ./*-r*.html
```

**Option B (fallback): screenshot embed**

If soffice unavailable, use Playwright to screenshot each page, then PptxGenJS to embed screenshots as slides. Read `$CODECK_EXPORT_DIR/pptx/pptxgenjs.md` for the API.

## Step 4: QA (required for PDF/PPTX)

**Assume the export has problems. Find them.**

### PDF

Check: pages complete (no truncation), backgrounds render, fonts display correctly.

### PPTX

Generate thumbnails:

```bash
CODECK_SKILL_DIR="${CODECK_SKILL_DIR:-}"
if [ -z "$CODECK_SKILL_DIR" ]; then
  for d in \
    "${CLAUDE_PLUGIN_ROOT}/skills/codeck" \
    "$HOME"/.claude/plugins/cache/*/codeck/*/skills/codeck \
    "$HOME"/.codex/plugins/cache/*/codeck/skills/codeck \
    "$HOME/.agents/skills/codeck" \
    "$HOME/.codex/skills/codeck" \
    "$HOME/.claude/skills/codeck"; do
    if [ -d "$d/scripts" ]; then CODECK_SKILL_DIR="$d"; break; fi
  done
fi
[ -n "$CODECK_SKILL_DIR" ] || { echo "codeck skill scripts not found; set CODECK_SKILL_DIR" >&2; exit 1; }
. "$CODECK_SKILL_DIR/scripts/resolve-dirs.sh"
[ -n "${CODECK_EXPORT_DIR:-}" ] || { echo "codeck-export not found; set CODECK_EXPORT_DIR" >&2; exit 1; }
EXPORT_SCRIPTS="$CODECK_EXPORT_DIR/pptx/scripts"
python "$EXPORT_SCRIPTS/thumbnail.py" ./*-r*.pptx
```

Convert to images for detailed check:

```bash
python "$EXPORT_SCRIPTS/office/soffice.py" --headless --convert-to pdf ./*-r*.pptx
pdftoppm -jpeg -r 150 *.pdf slide-check
```

Use subagent to visually inspect screenshots. Focus on: overlapping elements, text overflow, uneven spacing, low-contrast text, differences from HTML original.

### Fix loop

1. Find issue → adjust export params or HTML
2. Re-export → re-screenshot → re-check
3. Until one full check finds no new issues

At least one fix-verify cycle before declaring done.

If QA finds a source defect, do not edit source files directly. Add a thread with the affected artifact and suggested owner, then hand off to @design or @review.

After export:

1. Update `MEMORY.md` Active Context, Latest Channel Summary, Task Index, and Artifacts.
2. Mark the `@export` task done in `tasks/tasks.md`.
3. Append the handoff to today's channel file.

## Step 5: Done

> Export done. Output: `{baseName}.pdf` / `{baseName}.pptx`
>
> @export
> I exported the latest HTML, ran QA, and recorded output paths in memory.
>
> Speech script: `/codeck speech script`. Overview: `/codeck`.
