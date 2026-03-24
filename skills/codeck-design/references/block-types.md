# Block Types Reference

codeck 的所有 block 类型定义。生成 deck.json 时按 schema 写，渲染 HTML 时参考示例。

来源: `packages/core/src/deck-spec.ts` (类型) + `skills/compiler/registry/` (渲染)

---

## hero

封面/章节标题，大字号视觉冲击。

**JSON Schema:**
```json
{
  "id": "block-hero",
  "type": "hero",
  "eyebrow": "可选上标签",
  "title": "string (必填)",
  "body": "可选副标题"
}
```

**HTML 渲染:**
```html
<div class="block">
  <span class="label">eyebrow</span>
  <h2>title (blur-word 动画)</h2>
  <p class="body">body</p>
</div>
```

**使用场景：** 封面页、章节开头。需要 eyebrow 小标签时用 hero，不需要时也可用 statement-hero。

---

## statement-hero

断言式封面，label + accent 色彩强调，适合观点驱动型开场。

**JSON Schema:**
```json
{
  "id": "block-stmt",
  "type": "statement-hero",
  "label": "可选上标签",
  "accent": "default | blue",
  "title": "string (必填)",
  "body": "string (必填)"
}
```

**HTML 渲染:**
```html
<div class="block">
  <span class="label">label</span>
  <h2>title (blur-word 动画)</h2>
  <p class="body">body</p>
</div>
```

**使用场景：** 技术论证/产品发布封面，用断言句制造张力。body 必填，比 hero 更适合需要解释性副文本的场景。

---

## bullet-list

要点列表，每项可带标题+正文。

**JSON Schema:**
```json
{
  "id": "block-bullets",
  "type": "bullet-list",
  "heading": "可选标题",
  "items": [
    { "id": "item-1", "title": "string (必填)", "body": "可选说明" }
  ]
}
```

**HTML 渲染:**
```html
<div class="block">
  <h3>heading</h3>
  <ul>
    <li>title — body</li>
  </ul>
</div>
```

**使用场景：** 功能列表、优势罗列、议程。items 中每项必须有 id 和 title。

---

## metric-grid

指标网格，数字+标签+注释，自动滚动计数器动画。

**JSON Schema:**
```json
{
  "id": "block-metrics",
  "type": "metric-grid",
  "items": [
    { "value": "99.9%", "label": "可用率", "note": "过去 12 个月" }
  ]
}
```

**HTML 渲染:**
```html
<div class="block-grid">
  <div class="stat">
    <div class="value"><!-- roll-digit 动画 --></div>
    <div class="stat-label">label</div>
    <div class="stat-note">note</div>
  </div>
</div>
```

**使用场景：** 数据展示页，2-4 个核心指标并排。value 支持数字+符号混排（如 "3.2x"、"$1.2M"）。

---

## dark-stat

深色背景指标卡，带 label/title 头部，items 同 metric-grid 但支持自定义 color。

**JSON Schema:**
```json
{
  "id": "block-darkstat",
  "type": "dark-stat",
  "label": "可选上标签",
  "title": "string (必填)",
  "items": [
    { "value": "47%", "label": "转化率", "note": "同比增长", "color": "#34C759" }
  ]
}
```

**HTML 渲染:**
```html
<div class="block">
  <span class="label">label</span>
  <h3>title</h3>
  <div class="block-grid">
    <div class="stat"><!-- 同 metric-grid --></div>
  </div>
</div>
```

**使用场景：** 需要标题上下文的指标展示，比 metric-grid 多一层叙事包装。color 可选，用于区分正负指标。

---

## comparison

双栏对比，左右各带 label/items/outcome。

**JSON Schema:**
```json
{
  "id": "block-cmp",
  "type": "comparison",
  "heading": "可选标题",
  "prompt": "可选引导语",
  "left": {
    "label": "方案 A", "title": "可选副标题",
    "items": ["优点1", "优点2"], "outcome": "可选结论"
  },
  "right": {
    "label": "方案 B", "title": "可选副标题",
    "items": ["优点1", "优点2"], "outcome": "可选结论"
  },
  "footer": "可选脚注"
}
```

**HTML 渲染:**
```html
<div class="block-grid">
  <div class="card"><h4>label</h4><ul><li>...</li></ul><p class="body">outcome</p></div>
  <div class="card"><h4>label</h4><ul><li>...</li></ul><p class="body">outcome</p></div>
</div>
```

**使用场景：** 方案对比、技术选型、before/after。items 是字符串数组，不是对象。

---

## outcome-comparison

结果导向双栏对比，带 tone 语义色（danger/neutral/success），body 是字符串数组。

**JSON Schema:**
```json
{
  "id": "block-outcome",
  "type": "outcome-comparison",
  "label": "可选上标签",
  "title": "string (必填)",
  "prompt": "可选引导语",
  "left": {
    "label": "Before", "tone": "danger",
    "body": ["痛点1", "痛点2"], "outcome": "结论"
  },
  "right": {
    "label": "After", "tone": "success",
    "body": ["改善1", "改善2"], "outcome": "结论"
  }
}
```

**HTML 渲染:**
```html
<div class="block-grid">
  <div class="card"><h4>label</h4><ul><li>body[0]</li></ul><p class="body">outcome</p></div>
  <div class="card"><h4>label</h4><ul><li>body[0]</li></ul><p class="body">outcome</p></div>
</div>
```

**使用场景：** 变革前后对比，tone 控制语义色彩。比 comparison 更适合叙事型论证。

---

## problem-card-grid

问题卡片网格，每张卡带 tone 色彩标签。

**JSON Schema:**
```json
{
  "id": "block-problems",
  "type": "problem-card-grid",
  "label": "可选上标签",
  "title": "string (必填)",
  "cards": [
    { "title": "问题标题", "body": "问题描述", "tone": "blue | orange | red | green | violet" }
  ]
}
```

**HTML 渲染:**
```html
<div class="block-grid">
  <div class="card"><h4>title</h4><p>body</p></div>
</div>
```

**使用场景：** 痛点展示、挑战罗列。tone 五选一，用于视觉区分不同类别的问题。

---

## quote

引用块，左侧竖线装饰。

**JSON Schema:**
```json
{
  "id": "block-quote",
  "type": "quote",
  "content": "string (必填，引用正文)",
  "caption": "可选出处"
}
```

**HTML 渲染:**
```html
<div class="block">
  <p class="quote-text">content</p>
  <p class="quote-attr">— caption</p>
</div>
```

**使用场景：** 客户证言、名人名言、关键洞察引用。

---

## flow

流程/步骤，自动编号卡片网格。

**JSON Schema:**
```json
{
  "id": "block-flow",
  "type": "flow",
  "heading": "可选标题",
  "items": [
    { "title": "步骤名 (必填)", "subtitle": "可选说明", "note": "可选备注" }
  ],
  "footer": "可选脚注"
}
```

**HTML 渲染:**
```html
<div class="block">
  <h3>heading</h3>
  <div class="block-grid">
    <div class="card"><h4>1. title</h4><p>subtitle</p></div>
  </div>
  <p class="body">footer</p>
</div>
```

**使用场景：** 实施路径、操作流程、方法论步骤。自动加序号前缀。

---

## timeline

时间线，编号卡片 + 可选脚注。

**JSON Schema:**
```json
{
  "id": "block-timeline",
  "type": "timeline",
  "items": [
    { "title": "阶段名 (必填)", "body": "string (必填)" }
  ],
  "footnote": "可选脚注"
}
```

**HTML 渲染:**
```html
<div class="block">
  <div class="block-grid">
    <div class="card"><h4>1. title</h4><p>body</p></div>
  </div>
  <p class="body">footnote</p>
</div>
```

**使用场景：** 项目里程碑、产品路线图、历史回顾。与 flow 结构相似但语义不同——timeline 强调时间维度。

---

## table

数据表格，columns 定义表头，rows 是二维字符串数组。

**JSON Schema:**
```json
{
  "id": "block-table",
  "type": "table",
  "heading": "可选标题",
  "columns": ["列1", "列2", "列3"],
  "rows": [
    ["单元格", "单元格", "单元格"]
  ],
  "footnote": "可选脚注"
}
```

**HTML 渲染:**
```html
<div class="block">
  <h3>heading</h3>
  <table>
    <tr><th>列1</th><th>列2</th></tr>
    <tr><td>单元格</td><td>单元格</td></tr>
  </table>
  <p class="body">footnote</p>
</div>
```

**使用场景：** 功能对比矩阵、定价表、规格参数。rows 每行长度必须与 columns 一致。

---

## code

代码块，深色背景 + 行号 + 高亮行。

**JSON Schema:**
```json
{
  "id": "block-code",
  "type": "code",
  "language": "typescript",
  "code": "interface Spec {\n  id: string;\n}",
  "title": "可选文件名",
  "highlight": [2]
}
```

**HTML 渲染:**
```html
<div class="block code-block">
  <div class="code-title">title</div>
  <pre>
    <span class="line-hl"><span class="line-num">2</span>高亮行</span>
  </pre>
</div>
```

**使用场景：** 技术演示、API 示例。highlight 是 1-based 行号数组。language 用于语义标注（当前不做语法高亮）。

---

## image

图片/截图，支持 contain/cover/none 适配。

**JSON Schema:**
```json
{
  "id": "block-img",
  "type": "image",
  "src": "assets/arch.png",
  "alt": "string (必填，无障碍描述)",
  "caption": "可选图注",
  "fit": "contain | cover | none"
}
```

**HTML 渲染:**
```html
<div class="block img-block">
  <img src="src" alt="alt" style="object-fit:fit">
  <p class="caption">caption</p>
</div>
```

**使用场景：** 架构图、产品截图、照片。src 支持 https://、assets/、data:image/ 前缀。

---

## video

视频嵌入，支持 autoplay + poster。

**JSON Schema:**
```json
{
  "id": "block-video",
  "type": "video",
  "src": "assets/demo.mp4",
  "poster": "可选封面图 URL",
  "autoplay": false,
  "caption": "可选说明"
}
```

**HTML 渲染:**
```html
<div class="block video-block">
  <video src="src" controls poster="poster"></video>
  <p class="caption">caption</p>
</div>
```

**使用场景：** 产品演示、操作录屏。autoplay 为 true 时自动静音播放。src 同 image 的 URL 规则。

---

## callout

高亮提示框，四种语义变体。

**JSON Schema:**
```json
{
  "id": "block-callout",
  "type": "callout",
  "variant": "info | warning | success | danger",
  "title": "可选标题",
  "body": "string (必填)"
}
```

**HTML 渲染:**
```html
<div class="block callout callout-info">
  <h4>title</h4>
  <p>body</p>
</div>
```

**使用场景：** 关键洞察(info)、风险提醒(warning)、成果确认(success)、严重警告(danger)。左侧彩色竖线区分变体。

---

## chart

数据图表，支持 bar 和 line 两种类型。

**JSON Schema:**
```json
{
  "id": "block-chart",
  "type": "chart",
  "chartType": "bar | line",
  "title": "可选标题",
  "data": [
    { "label": "类别名", "value": 120, "color": "可选色值" }
  ],
  "unit": "可选单位后缀"
}
```

**HTML 渲染 (bar):**
```html
<div class="block chart-block">
  <h3>title</h3>
  <div class="chart-bar">
    <span class="bar-label">label</span>
    <div class="bar-track"><div class="bar-fill" style="width:百分比%"></div></div>
    <span class="bar-value">120ms</span>
  </div>
</div>
```

**HTML 渲染 (line):**
```html
<div class="block chart-block">
  <h3>title</h3>
  <svg><!-- polyline + circle 数据点 --></svg>
</div>
```

**使用场景：** 性能对比用 bar，趋势变化用 line。value 自动按最大值归一化。unit 拼接在数值后（如 "ms"、"%"）。

---

## divider

分隔线，无属性，纯视觉断点。

**JSON Schema:**
```json
{
  "id": "block-div",
  "type": "divider"
}
```

**HTML 渲染:**
```html
<hr class="divider-line">
```

**使用场景：** 同一页内不同内容区域的视觉分隔。极少使用——优先通过页面拆分而非分隔线来组织内容。

---

## comparison-table

design.json blockStyles 扩展类型。用于 design.json 中定义对比表格的视觉样式（边框、高亮列、斑马纹等）。deck.json 中实际使用 `table` 类型承载数据，design.json 中用 comparison-table 样式覆盖渲染。

**design.json 用法:**
```json
{
  "blockStyles": {
    "comparison-table": {
      "description": "对比矩阵样式，高亮推荐列",
      "highlightColumn": 2,
      "zebraStripe": true
    }
  }
}
```

**使用场景：** 当 table block 需要对比矩阵视觉处理时，在 design.json 中声明 comparison-table 样式。

---

## metric-card

design.json blockStyles 扩展类型。用于 design.json 中定义指标卡片的视觉样式（圆角、阴影、背景渐变等）。deck.json 中实际使用 `metric-grid` 或 `dark-stat` 承载数据。

**design.json 用法:**
```json
{
  "blockStyles": {
    "metric-card": {
      "description": "指标卡片样式，渐变背景 + 大圆角",
      "gradient": true,
      "borderRadius": "lg"
    }
  }
}
```

**使用场景：** 当 metric-grid/dark-stat 需要更丰富的卡片视觉时，在 design.json 中声明 metric-card 样式。
