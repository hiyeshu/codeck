# Generation Guide — 从 design-dna.json 生成 custom.css

## 优先级

1. **配色 + 字体** — 决定 80% 视觉身份
2. **间距 + 布局** — 结构节奏
3. **形状 + 阴影** — 表面处理
4. **design_style** — 情绪、构图、视觉语言
5. **visual_effects** — 视觉增强
6. **motion** — 动画点缀（静态布局和效果就绪后再加）

## design_system → CSS 变量

design-dna.json 的 design_system 直接映射为 custom.css 的 `:root` 变量：

```css
:root {
  /* ─── 配色 ─── */
  --bg: {color.surface.background};
  --fg: {推算：bg 浅则 fg 深，bg 深则 fg 浅};
  --accent: {color.accent.hex};
  --accent2: {color.secondary.hex};
  --primary: {color.primary.hex};
  --surface-card: {color.surface.card};
  --surface-elevated: {color.surface.elevated};

  /* ─── 字体 ─── */
  --font-heading: {typography.font_families.heading};
  --font-body: {typography.font_families.body};
  --font-mono: {typography.font_families.mono};

  /* ─── 间距 ─── */
  --space-sm: {spacing.scale[1]}px;   /* 通常 16px */
  --space-md: {spacing.scale[3]}px;   /* 通常 32px */
  --space-lg: {spacing.scale[5]}px;   /* 通常 64px */
  --slide-padding: {spacing.slide_padding};

  /* ─── 形状 ─── */
  --radius: {shape.border_radius.medium};
  --radius-sm: {shape.border_radius.small};
  --radius-lg: {shape.border_radius.large};

  /* ─── 阴影 ─── */
  --shadow-low: {elevation.levels.low};
  --shadow-md: {elevation.levels.medium};
  --shadow-high: {elevation.levels.high};

  /* ─── 动画 ─── */
  --ease: {motion.easing};
  --duration-micro: {motion.duration_scale.micro};
  --duration-normal: {motion.duration_scale.normal};
}
```

**关键：** `--bg`, `--fg`, `--accent` 是引擎接口变量。engine.css 用这三个变量渲染进度条、overview 边框、页码。必须定义。

## design_system → 布局原语

从 design-dna 的 typography 和 slides 生成布局 class：

```css
/* ─── 字号层级 ─── */
.title-mega {
  font-size: {typography.type_scale.display.size};
  font-weight: {typography.type_scale.display.weight};
  line-height: {typography.type_scale.display.line_height};
  letter-spacing: {typography.type_scale.display.tracking};
}
.title-large {
  font-size: {typography.type_scale.heading_1.size};
  font-weight: {typography.type_scale.heading_1.weight};
  line-height: {typography.type_scale.heading_1.line_height};
}
.title-medium {
  font-size: {typography.type_scale.heading_2.size};
  font-weight: {typography.type_scale.heading_2.weight};
}
.body-text {
  font-size: {typography.type_scale.body.size};
  line-height: {typography.type_scale.body.line_height};
}
.caption {
  font-size: {typography.type_scale.caption.size};
  opacity: 0.7;
}

/* ─── 布局原语 ─── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-md); }
.flex-col { display: flex; flex-direction: column; gap: var(--space-sm); }
.flex-row { display: flex; gap: var(--space-md); align-items: center; }
.card {
  background: var(--surface-card);
  border-radius: var(--radius);
  padding: var(--space-md);
  box-shadow: var(--shadow-low);
}
```

## design_system.slides → 页面类型样式

```css
/* ─── 封面 ─── */
.slide-cover {
  /* 从 slides.cover 映射 */
  text-align: center;
  justify-content: center;
  align-items: center;
}

/* ─── 章节分隔 ─── */
.slide-divider {
  /* 从 slides.section_divider 映射 */
  justify-content: center;
  align-items: center;
}

/* ─── 数据页 ─── */
.slide-data {
  /* 从 slides.data 映射 */
}

/* ─── 结尾 ─── */
.slide-ending {
  text-align: center;
  justify-content: center;
}
```

## design_style → 主观决策

design_style 不直接生成 CSS，而是指导 CSS 和 HTML 的写法：

| DNA 字段 | 指导 |
|---------|------|
| aesthetic.mood | 整体情绪 → 影响配色温度、间距松紧 |
| visual_language.whitespace_usage | → padding/margin 多寡 |
| visual_language.contrast_level | → 前景/背景对比度 |
| visual_language.focal_strategy | → 每页的视觉重心处理 |
| composition.hierarchy_method | → 用什么手段做层级（字号/颜色/空间） |
| composition.balance_type | → 对称布局 vs 非对称布局 |
| imagery.graphic_elements | → 装饰性 SVG、渐变、图案 |

## visual_effects → CSS 增强

演示文稿的 visual_effects 用纯 CSS 实现（不引入外部库）：

### 背景效果
```css
/* gradient-animation */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.slide-cover {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  background-size: 200% 200%;
  animation: gradient-shift {params.speed} ease infinite;
}
```

### fragment 入场效果

引擎内置四种入场，通过 `data-f-type` 属性选择：

| 类型 | 属性值 | 适用场景 |
|------|--------|----------|
| fade-up | 默认（不写） | 文字、列表、大多数内容 |
| scale | `data-f-type="scale"` | 图片、卡片、关键数字 |
| blur | `data-f-type="blur"` | 大标题、hero 文案、电影感揭示 |
| slide | `data-f-type="slide"` | 时间线、步骤、从左到右的序列 |

用法：`<div data-f="1" data-f-type="blur">...</div>`

原则：同一页内保持一种入场方式。整个 deck 最多用两种。

custom.css 可以覆盖引擎的入场 transition 时长和曲线：
```css
[data-f] {
  transition: opacity var(--duration-normal) var(--ease),
              transform var(--duration-normal) var(--ease),
              filter var(--duration-normal) var(--ease);
}
```

### 玻璃效果
```css
.glass {
  backdrop-filter: blur({params.blur_radius});
  background: rgba(255, 255, 255, {params.transparency});
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### 文字效果
```css
/* gradient-fill */
.gradient-text {
  background: linear-gradient(90deg, var(--accent), var(--primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 移动端适配

必须包含 768px 断点：

```css
@media (max-width: 768px) {
  .title-mega { font-size: calc({display.size} * 0.5); }
  .title-large { font-size: calc({heading_1.size} * 0.6); }
  .body-text { font-size: 18px; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}
```

## 反模式黑名单

以下选择是 AI 的常见退化默认，design-dna 流程应自然避开。如果你发现自己在用，退回 DNA 重新推导：

- **字体**：Inter / Roboto / Arial — 通用到没有性格。从 DNA 的 aesthetic.mood 推导具体字体
- **颜色**：`#6366f1`（Tailwind indigo）— AI 生成 UI 的指纹色。如果 DNA 色板出现它，质疑来源
- **布局**：所有内容居中 — 每页都 `text-align:center; justify-content:center` = 没有层级。DNA 的 composition.balance_type 应该驱动非对称选择
- **效果**：glassmorphism（毛玻璃 + 模糊背景）— 趋势已过，执行难度高。除非 DNA 的 visual_effects 明确指定，不用

## 质量检查

交付前验证：
- [ ] 每个颜色追溯到 DNA 色板
- [ ] 字体族匹配 DNA 规格
- [ ] 间距节奏匹配 DNA 阶梯
- [ ] 整体情绪匹配 design_style.aesthetic.mood
- [ ] `:root` 定义了 `--bg`, `--fg`, `--accent`（引擎接口）
- [ ] 有 `@media (max-width: 768px)` 断点
- [ ] 对比度 ≥ 4.5:1（正文）
- [ ] 不覆盖引擎 class（`.slide`, `#progress`, `.mobile-nav`）
- [ ] `prefers-reduced-motion` 尊重（如果有动画）
- [ ] 不在黑名单里
