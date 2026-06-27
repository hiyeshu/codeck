<!--
[INPUT]: Depends on MEMORY.md, deck.md, DESIGN.md, custom.css, slides.html, latest HTML, and export scripts.
[OUTPUT]: Defines @review, @export, and @speech lane rules for final delivery.
[POS]: skills/codeck/references delivery manual; read only when the request reaches review/export/speech.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Delivery — @review, @export, @speech

Delivery has three lanes: audience review, file export, and presenter speech. Keep the lane boundary strict: review may fix scoped source defects; export may write PDF/PPTX files; speech may write talk track and notes.

## @review Lane

`@review` owns audience resistance, quality review, and scoped fixes. Use inverse selection: not the expert, but the listener most likely to struggle or push back.

Write boundary:

- May write `review.md`.
- May fix `slides.html` and `custom.css` when the issue is scoped and source-backed.
- May update `roles/review.md`, `tasks/tasks.md`, and `channel/YYYY-MM-DD.md`.
- Must not rewrite `deck.md`, `DESIGN.md`, `speech.md`, or export files.
- Cross-lane changes become proposals in `threads/threads.md`.

Setup:

1. Read `MEMORY.md`, active `tasks/tasks.md`, open `threads/threads.md`, `deck.md`, `roles/design.md`, `DESIGN.md`, and `diagnosis.md`.
2. Validate the latest assembled HTML. It must contain `openPresenter`, `codeck-presenter`, `BroadcastChannel`, and no sibling stylesheet link.
3. If no valid assembled HTML exists but `custom.css` and `slides.html` exist, rebuild:

```bash
ENGINE_DIR="$CODECK_SKILL_DIR/scripts"
bash "$ENGINE_DIR/build-html.sh" "$DECK_DIR" "{file-stem}" "{language}" "."
```

Review dimensions:

1. **Narrative flow**: gaps, pacing, core message, and audience relevance.
2. **Content completeness**: invented facts, weak terminology, missing notes, page count drift.
3. **AI fluff**: generic buzzwords, replaceable claims, templated slide forms.
4. **Visual hierarchy**: eye path, type scale, whitespace, contrast, and rhythm.
5. **Cross-page consistency**: consistent tokens and component semantics; intentional variation must match `DESIGN.md`.
6. **Interaction integrity**: `<section class="slide" data-notes="...">`, no scripts in `slides.html`, sequential `data-f`, no engine selector overrides.

Fix loop: identify `custom.css` or `slides.html`, edit the owned file, rebuild, and re-check. Max 3 rounds. Ask the user only for real user-owned conflicts.

Completion gate:

- `review.md` exists.
- Latest valid HTML was built through `build-html.sh`.
- Scoped fixes are reflected in the latest HTML.
- `tasks/tasks.md` marks review done.
- `$DECK_DIR/.reviewed` was touched after the latest HTML write.

## @export Lane

`@export` owns PDF/PPTX output and export QA. Export starts from the latest valid HTML; HTML is the source artifact, not an export choice.

Write boundary:

- May write final PDF/PPTX files in cwd.
- May write export QA notes to `review.md` or `MEMORY.md`.
- May update `roles/export.md`, `tasks/tasks.md`, and `channel/YYYY-MM-DD.md`.
- Must not edit `deck.md`, `DESIGN.md`, `custom.css`, `slides.html`, or `speech.md`.
- Source defects become threads for `@design` or `@review`.

Format rule:

- `PDF`, `print`, or `save as PDF` -> PDF.
- `PPTX`, `PowerPoint`, or `slides file` -> PPTX.
- `all` or `both` -> PDF + PPTX.
- Bare `export` -> non-blocking Export Format decision; default to PDF if unanswered.

### PDF

Preferred path: Playwright print from the self-contained HTML.

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

Fallback path: LibreOffice.

```bash
python "$CODECK_SKILL_DIR/scripts/office/soffice.py" --headless --convert-to pdf ./*-r*.html
```

### PPTX

Primary path: LibreOffice conversion through the bundled wrapper.

```bash
python "$CODECK_SKILL_DIR/scripts/office/soffice.py" --headless --convert-to pptx ./*-r*.html
```

Fallback path: screenshot each slide with Playwright and embed screenshots with PptxGenJS. Use this only when LibreOffice is unavailable or produces a visibly broken PPTX. Do not claim native editable PPTX unless the export path actually produced editable PowerPoint objects.

### Export QA

Assume export has problems until checked.

```bash
python "$CODECK_SKILL_DIR/scripts/thumbnail.py" ./*-r*.pdf
python "$CODECK_SKILL_DIR/scripts/thumbnail.py" ./*-r*.pptx
```

PDF check: page count, no truncation, backgrounds render, fonts display correctly.

PPTX check: thumbnails or converted PDF screenshots show no overlapping text, missing backgrounds, cropped slides, or large visual drift from HTML.

Fix loop: export -> thumbnail/screenshot -> inspect -> adjust export params or create a source-defect thread -> re-export. At least one full verify pass before declaring done.

After export, update `MEMORY.md`, mark the `@export` task done, and append the handoff to today's channel file.

## @speech Lane

`@speech` owns the talk track and speaker notes.

Write boundary:

- May write `speech.md`.
- May update HTML `data-notes` when syncing final notes.
- May update `roles/speech.md`, `tasks/tasks.md`, and `channel/YYYY-MM-DD.md`.
- Must not rewrite `deck.md`, `DESIGN.md`, `custom.css`, `review.md`, or export files.

Setup:

1. Read `MEMORY.md`, active tasks, open threads, latest valid HTML, `deck.md`, `DESIGN.md`, and `roles/design.md`.
2. If no HTML exists but `deck.md` exists, write from deck structure and state that the script is pre-visual.
3. Ask Speech Style only when style or duration cannot be inferred.

`speech.md` format:

```markdown
# Speech

## Defaults
- Duration:
- Language:
- Style:

## Slide 1 — {title}
- Intent:
- Say:
- Notes:
```

Sync rule: HTML `data-notes` must stay concise and presenter-friendly; `speech.md` can hold the full talk track.
