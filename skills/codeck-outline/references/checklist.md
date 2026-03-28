# Outline 自审清单

## 说明

outline 产出物（`$DECK_DIR/outline.md`）写完后，逐项检查。AUTO-FIX 直接改，ASK 问用户。

## Classification

- **AUTO-FIX**: 机械性问题，直接修复
- **ASK**: 需要内容判断，问用户

## Output Format

```
自审: N 个问题 (X 自动修复, Y 需确认)

**AUTO-FIXED:**
- [问题] → 已修复

**NEEDS INPUT:**
- [问题] 建议: {修复方案}
```

如果全部通过: `自审: 全部通过。`

---

## Pass 1 — 结构性问题（AUTO-FIX）

### [HIGH] 叙事弧完整性
- 检查 outline.md 是否有开场（问题/冲突）→ 展开 → 收束（行动/结论）
- 缺失任何弧段 → AUTO-FIX: 补充缺失段落的占位页

### [HIGH] 每页有 purpose
- 检查每页是否标注了 purpose（cover/content/section-divider/ending）
- 缺失 → AUTO-FIX: 根据内容推断并补上

### [HIGH] 页数合理
- 总页数 5-15 页为正常范围
- 超出 → ASK: 建议合并或拆分

### [HIGH] 无重复页
- 检查是否有两页讲同一个观点
- 有 → ASK: 建议合并，说明哪两页重复

---

## Pass 2 — 内容质量（ASK）

### [MEDIUM] 标题锐利度
- 标题能独立传达观点，不是"关于 X"或"X 介绍"
- 模糊标题 → ASK: 建议更锐利的替代

### [MEDIUM] 信息密度均匀
- 没有某页 5 个要点、另一页只有标题
- 不均匀 → ASK: 建议重新分配

### [MEDIUM] AI 废话检测
- 扫描所有文本，检测：赋能、无缝、颠覆、一站式、全方位、深度融合、生态闭环、降本增效
- 发现 → AUTO-FIX: 替换为具体表达

### [LOW] 用户意图段
- outline.md 的"用户意图"段是否填了（不全是"未指定"）
- 缺失 → ASK: 提示用户补充

---

## Suppressions

不要标记：
- 用户明确说"先跳过"的部分
- 用户意图段标注为"未探索"的字段（快速模式下正常）
