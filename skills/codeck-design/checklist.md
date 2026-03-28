# Design 自审清单

## 说明

design 产出两个文件 + 一次拼装，按顺序检查：
1. custom.css 写完后 → Pass 1
2. slides.html 写完后 → Pass 2
3. assemble.sh 拼装后 → Pass 3

AUTO-FIX 直接改，ASK 问用户。

## Output Format

```
自审 ({产出物}): N 个问题 (X 自动修复, Y 需确认)

**AUTO-FIXED:**
- [问题] → 已修复

**NEEDS INPUT:**
- [问题] 建议: {修复方案}
```

全部通过: `自审 ({产出物}): 全部通过。`

---

## Pass 1 — custom.css 审查

### [HIGH] :root 变量齐全
- 定义了 `--bg`, `--fg`, `--accent`, `--font-body`, `--font-heading`
- 缺失 → AUTO-FIX: 补上合理默认值

### [HIGH] 字号层级
- 标题 48-72px，正文 24-32px，注释 16-20px
- 层级不清 → AUTO-FIX: 调整

### [HIGH] 移动端适配
- 有 `@media (max-width: 768px)` 断点
- 缺失 → AUTO-FIX: 补上字号缩小和单列布局

### [MEDIUM] 颜色对比度
- 前景/背景对比度 ≥ 4.5:1
- 不足 → ASK: 建议调整

### [LOW] 无引擎样式冲突
- 没有覆盖 `.slide`, `#progress`, `.mobile-nav`, `.presenter-*` 等引擎 class
- 有冲突 → AUTO-FIX: 移除或改用自定义 class

---

## Pass 2 — slides.html 审查

### [HIGH] 页面数量匹配
- 页数和 outline.md 一致
- 不一致 → AUTO-FIX: 补缺或删多余

### [HIGH] slide 结构正确
- 每页是 `<section class="slide" data-notes="...">`
- 缺 class 或 data-notes → AUTO-FIX: 补上

### [HIGH] 注释锚点
- 每页之间有 `<!-- ====== N. 标题 ====== -->`
- 缺失 → AUTO-FIX: 补上

### [HIGH] 无引擎代码
- slides.html 里没有 `<script>` 标签、没有进度条/移动导航 HTML
- 有 → AUTO-FIX: 移除（引擎自动创建这些）

### [MEDIUM] data-notes 质量
- 不是重复标题，有具体要点
- 空洞 → AUTO-FIX: 从 outline.md 提取要点填入

### [MEDIUM] 封面信噪比
- 封面页一句话 + 留白，不堆砌
- 过载 → ASK: 建议精简

### [MEDIUM] AI 废话
- 无空洞词（赋能、无缝、颠覆、一站式）
- 有 → AUTO-FIX: 替换为具体表达

### [LOW] 数据真实性
- 数据来自素材，不是编造的
- 可疑 → ASK: 标注"此数据需确认"

---

## Pass 3 — 最终 HTML 审查

### [HIGH] 拼装成功
- assemble.sh 无报错，输出文件存在且非空
- 失败 → 检查 custom.css 和 slides.html 是否存在

### [HIGH] 文字不溢出
- 没有文字超出 slide 边界
- 溢出 → AUTO-FIX: 缩小字号或截断（改 custom.css 后重新 assemble）

### [MEDIUM] 配色一致
- slides.html 里没有硬编码颜色值，都用 CSS class 或 var()
- 硬编码 → AUTO-FIX: 改为 var() 引用

---

## Suppressions

不要标记：
- 用户在迭代中明确要求的非常规设计
- data-f 属性的 fragment 编号（这是有意的步进控制）
