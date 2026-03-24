# Design 自审清单

## 说明

design 产出物分三轮审查，每个产出物写完后立即检查：
1. deck.draft.json 写完后 → Pass 1
2. design.json 写完后 → Pass 2
3. HTML 渲染完后 → Pass 3

AUTO-FIX 直接改，ASK 问用户。

## Classification

- **AUTO-FIX**: 机械性问题，直接修复
- **ASK**: 需要设计判断，问用户

## Output Format

```
自审 ({产出物}): N 个问题 (X 自动修复, Y 需确认)

**AUTO-FIXED:**
- [问题] → 已修复

**NEEDS INPUT:**
- [问题] 建议: {修复方案}
```

如果全部通过: `自审 ({产出物}): 全部通过。`

---

## Pass 1 — deck.draft.json 审查

### [HIGH] 页面结构匹配 outline
- 页数、顺序、purpose 和 `$DECK_DIR/outline.json` 一致
- 不一致 → AUTO-FIX: 补缺或删多余

### [HIGH] block type 合法
- 全部来自 references/block-types.md 定义的类型
- 非法类型 → AUTO-FIX: 替换为最接近的合法类型

### [HIGH] id 全局唯一
- 无重复 id
- 重复 → AUTO-FIX: 重命名

### [HIGH] JSON 语法
- 无语法错误、无中文引号 `""`
- 有 → AUTO-FIX: 修复

### [MEDIUM] speakerNotes 质量
- 不是重复标题，有具体演讲指导
- 空洞 → AUTO-FIX: 重写为具体指导

### [MEDIUM] AI 废话
- 无空洞词（赋能、无缝、颠覆、一站式）
- 有 → AUTO-FIX: 替换为具体表达

### [LOW] 数据真实性
- 数据来自素材，不是编造的
- 可疑 → ASK: 标注"此数据需确认"

---

## Pass 2 — design.json 审查

### [HIGH] 三层字段齐全
- `meta`、`design_system`、`design_style`、`visual_effects` 都存在
- 缺失 → AUTO-FIX: 补齐空层级并填最小可用结构

### [HIGH] description 字段齐全
- `design_system`、`design_style`、`visual_effects` 都有 description
- 缺失 → AUTO-FIX: 补写设计意图

### [HIGH] design_system 结构有效
- color / typography / spacing / layout / shape / elevation / motion / components 都是对象
- 不是对象 → AUTO-FIX: 归一化为对象

### [HIGH] legacy 结构已升级
- 不再保留旧的顶层 `tokens/pageStyles/blockStyles/overrides` 作为正式输出
- 仍是旧结构 → AUTO-FIX: 升级成新三层 schema

### [HIGH] var() 引用正确
- 所有 var(x) 在 `design_system.color` 或等价 token 容器里有定义
- 未定义 → AUTO-FIX: 改为实际颜色值或补定义

### [HIGH] page / block 规则覆盖完整
- deck.json 里用到的每个 purpose 都有对应 `design_system.components.page_styles`
- 缺失 → AUTO-FIX: 基于最接近的已有样式补写

- deck.json 里用到的每个 block type 都有对应 `design_system.components.block_styles`
- 缺失 → AUTO-FIX: 基于最接近的已有样式补写

### [HIGH] JSON 语法
- 无语法错误
- 有 → AUTO-FIX: 修复

### [MEDIUM] 颜色对比度
- 前景/背景对比度 ≥ 4.5:1（WCAG AA）
- 不足 → ASK: 建议调整，说明哪组颜色对比不够

### [MEDIUM] 字号层级
- hero > h1 > h2 > h3 > body，相邻层级差距 ≥ 6px
- 层级不清 → AUTO-FIX: 调整 `design_system.typography`

---

## Pass 3 — HTML 审查

### [HIGH] slide 结构正确
- 每页是 `<section class="slide" data-notes="...">`
- 缺 class 或 data-notes → AUTO-FIX: 补上

### [HIGH] 文字不溢出
- 没有文字超出 slide 边界
- 溢出 → AUTO-FIX: 缩小字号或截断

### [MEDIUM] 封面信噪比
- 封面页一句话 + 留白，不堆砌信息
- 过载 → ASK: 建议精简

### [MEDIUM] 配色一致
- 全 deck 用 CSS 变量，没有硬编码颜色值
- 硬编码 → AUTO-FIX: 改为 var() 引用

### [LOW] shell 交互兼容
- 没有 CSS 覆盖 default.html shell 的样式（如 `* { transition: none }`）
- 有冲突 → AUTO-FIX: 移除冲突 CSS

---

## Suppressions

不要标记：
- `design_system.components.overrides` 里的局部覆盖（这是有意的）
- 用户在迭代中明确要求的非常规设计
