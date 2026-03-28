# Design DNA Schema — 演示文稿适配版

三维设计档案：
- **design_system** — 可量化的设计 token
- **design_style** — 定性感知
- **visual_effects** — 特殊渲染（CSS 动画、SVG、Canvas）

每个字段都必须出现在最终 JSON 中。不适用的写 `"none"` 或 `false`。

## 顶层结构

### `meta`
- `name` — 设计档案名
- `description` — 一句话设计意图，引用 design-dna 同构映射
- `source_references` — 参考来源
- `created_at` — ISO datetime

### `design_system`

#### `design_system.color`
- `palette_type` — "monochromatic" / "complementary" / "analogous" / "triadic" / "split-complementary"
- `primary.hex` + `primary.role`
- `secondary.hex` + `secondary.role`
- `accent.hex` + `accent.role`
- `neutral.scale` — 中性色阶梯（如 ["#0a0a0a", "#1a1a1a", "#333", "#666", "#999", "#ccc", "#f0f0f0"]）
- `neutral.usage` — 中性色用途说明
- `surface.background` — 全局背景色
- `surface.card` — 卡片/容器背景
- `surface.elevated` — 高层级表面
- `contrast_strategy` — "high contrast" / "subtle layers" / "dark-on-light dominant"

#### `design_system.typography`
演示文稿尺度（不是 web 尺度）：

- `type_scale.display` — 封面大标题。size: 64-96px, weight, line_height, tracking
- `type_scale.heading_1` — 页面标题。size: 48-72px
- `type_scale.heading_2` — 副标题。size: 36-48px
- `type_scale.body` — 正文。size: 24-32px
- `type_scale.body_small` — 注释/标签。size: 16-20px
- `type_scale.caption` — 数据标签。size: 14-16px
- `font_families.heading` — 标题字体族
- `font_families.body` — 正文字体族
- `font_families.mono` — 代码字体族
- `font_style_notes` — 字体风格说明（如 "几何无衬线 + 人文触感"）

#### `design_system.spacing`
- `base_unit` — 基础间距单位（如 "8px"）
- `scale` — 间距阶梯（如 [8, 16, 24, 32, 48, 64, 80]）
- `slide_padding` — 幻灯片内边距（如 "64px 80px"）
- `content_density` — "spacious" / "comfortable" / "compact"
- `section_rhythm` — 元素间距节奏说明

#### `design_system.layout`
- `slide_ratio` — "16:9"（固定）
- `reference_size` — "1280x720"（引擎参考尺寸）
- `grid_system` — 网格系统说明
- `alignment_tendency` — "centered" / "left-aligned" / "asymmetric" / "mixed"
- `content_max_width` — 内容最大宽度（如 "1100px"）

#### `design_system.shape`
- `border_radius.small` / `medium` / `large` / `pill`
- `border_usage` — "none" / "subtle 1px" / "bold borders"
- `divider_style` — 分隔线风格

#### `design_system.elevation`
- `shadow_style` — "none" / "soft diffused" / "hard drop" / "layered"
- `levels.low` / `medium` / `high` — CSS box-shadow 值
- `depth_cues` — "shadows" / "overlapping layers" / "blur/glass" / "color intensity"

#### `design_system.motion`
- `transition` — 页面过渡方式（引擎支持的，仅做记录）
- `easing` — CSS easing function
- `duration_scale.micro` / `normal` / `macro`
- `entrance_pattern` — 元素入场模式（如 "fade-up"）
- `philosophy` — "minimal functional" / "playful" / "cinematic" / "none"

#### `design_system.slides`
替代 web 的 components，按幻灯片类型定义：

- `cover` — 封面页样式（布局、对齐、字号比例）
- `content` — 内容页样式（标题位置、正文区域、卡片网格）
- `section_divider` — 章节分隔页
- `data` — 数据展示页（图表、指标卡片）
- `ending` — 结尾页
- `slide_notes` — 整体幻灯片风格说明

### `design_style`

#### `design_style.aesthetic`
- `mood` — 3-5 个情绪词（如 ["calm", "professional", "warm"]）
- `visual_metaphor` — 视觉隐喻（来自 design-dna 同构映射）
- `era_influence` — 年代影响（如 "Swiss modernism"）
- `personality_traits` — 如果设计是一个人（如 ["confident", "meticulous"]）
- `adjectives` — 3-5 个形容词

#### `design_style.visual_language`
- `complexity` — "minimal" / "moderate" / "rich"
- `ornamentation` — "none" / "subtle accents" / "decorative"
- `whitespace_usage` — "generous" / "balanced" / "compact"
- `visual_weight_distribution` — 视觉重量分布
- `focal_strategy` — "single hero element" / "distributed interest" / "progressive reveal"
- `contrast_level` — "high" / "medium" / "low"
- `texture_usage` — 纹理使用说明

#### `design_style.composition`
- `hierarchy_method` — "scale contrast" / "color weight" / "spatial isolation" / "typographic hierarchy"
- `balance_type` — "symmetric" / "asymmetric" / "radial"
- `flow_direction` — 视线流向
- `grouping_strategy` — 分组策略
- `negative_space_role` — 负空间的角色

#### `design_style.imagery`
- `photo_treatment` — 照片处理方式
- `illustration_style` — 插图风格
- `graphic_elements` — 装饰性图形元素
- `pattern_usage` — 图案使用

### `visual_effects`

演示文稿的视觉效果比 web 轻量——引擎已经管了交互，AI 只管视觉增强。

#### `visual_effects.overview`
- `effect_intensity` — "none" / "subtle-accent" / "moderate"（演示文稿不建议 "heavy"）
- `performance_tier` — "lightweight"（CSS）/ "medium"（CSS + SVG）
- `fallback_strategy` — "disable effects"（演示文稿默认）
- `primary_technology` — "CSS only" / "CSS + SVG"

#### `visual_effects.background_effects`
- `type` — "none" / "gradient-animation" / "noise-field" / "mesh-gradient"
- `description`
- `params` — color_palette, speed, opacity, blend_mode

#### `visual_effects.text_effects`
- `type` — "none" / "gradient-fill" / "split-letter-animate"
- `description`
- `params` — split_strategy, stagger, effect_style

#### `visual_effects.glassmorphism_neumorphism`
- `enabled`
- `style` — "glass" / "frosted-layers" / "none"
- `params` — blur_radius, transparency, border_treatment

#### `visual_effects.svg_animations`
- `enabled`
- `type` — "none" / "path-draw" / "decorative-loop"
- `params` — animation_method, stroke_animation

#### `visual_effects.fragment_effects`
fragment 步进时的视觉效果（配合引擎的 `data-f` 属性）：
- `entrance` — fragment 出现时的 CSS 动画（如 "fade-up"）
- `timing` — 动画时长
- `stagger` — 多 fragment 间隔

#### `visual_effects.composite_notes`
自由文本。多效果叠加说明、性能权衡、特殊要求。

## 在 codeck 中的使用

1. 设计师读完大纲，提取形式结构（design-dna 同构映射）
2. 基于同构映射 + 角色审美，填写 design-dna.json
3. 从 design-dna.json 生成 custom.css（见 generation-guide.md）
4. 写 slides.html 时参考 design_style 指导内容呈现
5. design-dna.json 保存到 `$DECK_DIR/design-dna.json`
