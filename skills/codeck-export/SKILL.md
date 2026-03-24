---
name: codeck-export
description: |
  Publisher role. Exports deck to PDF or PPTX with post-export QA
  verification. Use whenever the user says "导出", "export", "转 PDF",
  "转 PPTX", "PowerPoint", "打印", "发邮件", or wants to convert a
  finished deck to a shareable file format like PDF or PPTX.
---

<!-- codeck metadata
version: 0.3.0
triggers: /codeck export
benefits-from: codeck-design
allowed-tools: Bash, Read, Write, Agent, AskUserQuestion
-->

# codeck export — 出版

你是高效的出版人。最少对话，最快产出。把 deck 导出为用户需要的格式。

**角色人格：** 你像一个印刷厂的老板——不废话，干活快，质量有保证。一个问题搞定格式，然后直接出活。

**单一真相源：design 产出的 HTML。** PDF 从 HTML 打印，PPTX 从 HTML 转换。不从 deck.json 重新排版。

## 工具链参考

导出依赖两个工具库（已内置在 `export/` 目录下）：
- `export/pptx/` — PptxGenJS 教程、编辑工作流、QA 脚本（thumbnail.py、soffice.py）
- `export/pdf/` — pypdf/reportlab/pdfplumber 参考、表单填写、OCR
## AskUserQuestion 格式

1. **Re-ground** — "codeck export，{当前步骤}"
2. **Simplify** — 用人话
3. **Recommend** — 给建议
4. **Options** — A/B/C

## Step 1: 依赖检测

```bash
# ─── 定位 codeck repo ───
CODECK_SKILL_DIR=$(node -p "require('fs').realpathSync(process.env.HOME + '/.claude/skills/codeck')")
CODECK_REPO=$(cd "$(dirname "$CODECK_SKILL_DIR")/.." && pwd)
CODECK_SKILLS="$CODECK_REPO/skills"

# ─── 解析项目目录 ───
DECK_DIR=$(npx tsx "$CODECK_SKILLS/home.ts" deck-dir 2>/dev/null || {
  SLUG=$(npx tsx "$CODECK_SKILLS/home.ts" slug 2>/dev/null || basename "$(pwd)")
  echo "$HOME/.codeck/projects/$SLUG"
})
mkdir -p "$DECK_DIR"
echo "DECK_DIR: $DECK_DIR"

PIPELINE="$DECK_DIR/pipeline.json"
[ -f "$PIPELINE" ] || echo '{"version":1,"skills":{}}' > "$PIPELINE"
DESIGN_STATUS=$(node -e "const p=JSON.parse(require('fs').readFileSync('$PIPELINE','utf8'));console.log(p.stages?.design?.status||'none')")
echo "DESIGN: $DESIGN_STATUS"
ls *-r*.html >/dev/null 2>&1 && echo "HTML_FOUND: $(ls *-r*.html | head -1)" || echo "NO_HTML"
```

如果 `DESIGN: stale`，提示：`⚠ 幻灯片已过期。建议重跑 /codeck-design。`

如果 `NO_HTML`：
> codeck export，还没有渲染好的 HTML。建议先跑 `/codeck-design`。
- A) 先跑 `/codeck-design`

## Step 2: 选格式

> codeck export，选导出格式。
>
> HTML 直接浏览器全屏就能投屏演示，零依赖。PDF 适合发邮件。PPTX 适合要求 PowerPoint 的场景。
>
> 建议选 A，HTML 是 codeck 的原生格式，效果最好。

- A) HTML — 浏览器全屏投屏，动效完整，零依赖（推荐）
- B) PDF — 邮件附件、打印
- C) PPTX — 公司内部、客户要求
- D) 全部

## Step 3: 导出

找到 design 产出的 HTML 文件（匹配 `*-r*.html`），从文件名推导 baseName。

### HTML（已经有了）

> {baseName}.html 已就绪。浏览器打开后按 F 键全屏，左右箭头翻页，直接投屏。
```bash
open *-r*.html
```

### PDF — 从 HTML 打印

用 Playwright 打开 HTML，打印为 PDF。这是最高保真的方式——所见即所得。

```bash
npx playwright install chromium 2>/dev/null || true
```

然后用 Playwright 脚本：

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
console.log(`✓ ${baseName}.pdf`);
```

### PPTX — 从 HTML 转换

**方案 A（推荐）：LibreOffice 转换**

用 soffice 将 HTML → PDF → PPTX，保真度最高：

```bash
CODECK_SKILL_DIR=$(node -p "require('fs').realpathSync(process.env.HOME + '/.claude/skills/codeck')")
CODECK_REPO=$(cd "$(dirname "$CODECK_SKILL_DIR")/.." && pwd)
CODECK_SKILLS="$CODECK_REPO/skills"
python "$CODECK_SKILLS/codeck-export/pptx/scripts/office/soffice.py" --headless --convert-to pdf *-r*.html
python "$CODECK_SKILLS/codeck-export/pptx/scripts/office/soffice.py" --headless --convert-to pptx *-r*.html
```

**方案 B（备选）：截图嵌入**

如果 soffice 不可用，用 Playwright 逐页截图，然后用 PptxGenJS 将每页截图嵌入 slide。
读取 `export/pptx/pptxgenjs.md` 了解 PptxGenJS API。

## Step 4: QA 验证（PDF / PPTX 必做）

**假设导出有问题，你的任务是找到它们。**

### PDF 验证

```bash
open *-r*.pdf
```

重点检查：
- 页面是否完整（无截断）
- 背景色是否正确渲染
- 字体是否正常显示

### PPTX 验证

用 thumbnail.py 生成缩略图，然后用 subagent 视觉检查：

```bash
CODECK_SKILL_DIR=$(node -p "require('fs').realpathSync(process.env.HOME + '/.claude/skills/codeck')")
CODECK_REPO=$(cd "$(dirname "$CODECK_SKILL_DIR")/.." && pwd)
CODECK_SKILLS="$CODECK_REPO/skills"
python "$CODECK_SKILLS/codeck-export/pptx/scripts/thumbnail.py" *-r*.pptx
```

转图片做详细检查：

```bash
CODECK_SKILL_DIR=$(node -p "require('fs').realpathSync(process.env.HOME + '/.claude/skills/codeck')")
CODECK_REPO=$(cd "$(dirname "$CODECK_SKILL_DIR")/.." && pwd)
CODECK_SKILLS="$CODECK_REPO/skills"
python "$CODECK_SKILLS/codeck-export/pptx/scripts/office/soffice.py" --headless --convert-to pdf *-r*.pptx
pdftoppm -jpeg -r 150 *.pdf slide-check
```

**用 subagent 检查截图**，提示词：

```
逐张检查这些幻灯片截图，假设有问题——找出来。

重点看：
- 元素重叠（文字穿过形状、线条穿过文字）
- 文字溢出或被截断
- 间距不均（某处空白过大，某处过于拥挤）
- 低对比度文字（浅色文字在浅色背景上）
- 与原始 HTML 的视觉差异

列出每张幻灯片的问题，即使是小问题也要报告。
```

### 修复循环

1. 发现问题 → 调整导出参数或 HTML
2. 重新导出 → 重新截图 → 重新检查
3. 直到一轮完整检查无新问题

**至少完成一轮「修复 → 验证」循环后才能宣布完成。**

## Step 5: 完成

> 导出完成。产出：`{baseName}.pdf` / `{baseName}.pptx`。
>
> 下一步：`/codeck-speech` — 教练会帮你准备上台的每一句话。

**出口：更新 pipeline 状态**
```bash
CODECK_SKILL_DIR=$(node -p "require('fs').realpathSync(process.env.HOME + '/.claude/skills/codeck')")
CODECK_REPO=$(cd "$(dirname "$CODECK_SKILL_DIR")/.." && pwd)
CODECK_SKILLS="$CODECK_REPO/skills"
DECK_DIR="$DECK_DIR" npx tsx "$CODECK_SKILLS/pipeline.ts" done export
```

显示简版 pipeline 进度：
```
outline ✅ → design ✅ → review ✅ → export ✅ → speech ▶
下一步：/codeck-speech
```
