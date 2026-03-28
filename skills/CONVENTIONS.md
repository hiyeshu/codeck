# codeck 技能编写规范

> 对齐 [anthropic/skills/skill-creator](https://github.com/anthropics/skills) 标准，适配 codeck 多角色 pipeline。

## Frontmatter

只用标准字段：

```yaml
---
name: codeck-xxx
description: |
  {功能描述}。{触发场景}。
---
```

- `name`（必填）：技能标识符，codeck 子技能统一 `codeck-` 前缀
- `description`（必填）：功能 + 触发场景，pushy 风格（见下方）
- `compatibility`（可选）：依赖的工具或环境

非标准字段（version / allowed-tools / triggers / benefits-from）放正文注释：

```markdown
<!-- codeck metadata
version: 0.2.0
triggers: /codeck-outline
benefits-from: codeck-outline
allowed-tools: Bash, Read, Write, AskUserQuestion
-->
```

## Description 编写规则（Pushy 风格）

Claude 倾向于少触发技能。description 是主要触发机制，要主动揽活。

**模板：**
```
{一句话功能}。{输出物}。Use whenever the user says {中文触发词}, {英文触发词},
or wants to {用户意图描述} — even if they don't explicitly mention "{技能名}".
```

**规则：**
1. 中英文触发词都要覆盖（用户可能说中文也可能说英文）
2. 列出 4-6 个具体触发词/短语，用引号包裹
3. 末尾加一句兜底："even if they don't explicitly mention X"
4. 不要只写功能，要写场景

**好的例子：**
```yaml
description: |
  Publisher role. Exports deck to PDF or PPTX with post-export QA.
  Use whenever the user says "导出", "export", "PDF", "PPTX",
  "PowerPoint", "打印", "发邮件", or wants to convert a deck to a
  shareable file format.
```

**坏的例子：**
```yaml
description: |
  Publisher role. Exports deck to PDF or PPTX.
```

## 目录结构

```
skill-name/
├── SKILL.md          # 必须，< 500 行
├── references/       # 可选，大段参考资料
│   ├── principles.md
│   └── examples.json
├── scripts/          # 可选，可执行脚本
└── assets/           # 可选，模板/图标/字体
```

## Progressive Disclosure（三层加载）

1. **Metadata**（name + description）— 始终在上下文中，约 100 词
2. **SKILL.md body** — 技能触发时加载，< 500 行
3. **Bundled resources** — 按需加载，无上限

关键：SKILL.md 接近 500 行时，把详细内容移到 references/ 并在正文中标注何时读取。

## 指令风格

- 用祈使句（"读取文件" 而非 "你应该读取文件"）
- 解释 why 而非堆 MUST（"因为用户可能 20 分钟没看屏幕，所以先 re-ground" 比 "MUST re-ground" 更有效）
- 给示例，尤其是输出格式
- 用 theory of mind：想象模型会怎么理解你的指令，写得让它自然做对

## codeck 特有约定

- 所有 codeck 子技能共享 AskUserQuestion 四段式：Re-ground → Simplify → Recommend → Options
- 上下游依赖通过 `~/.codeck/projects/{slug}/` 目录传递，不通过技能间直接调用
- 每个阶段通过 diagnosis.md 的角色推荐激活动态角色
- 以用户母语为主，技术术语保留英文

## Evals（测试用例）

测试用例存放在 `skills/evals/evals.json`，包含两类测试：

### 功能测试（evals）

验证技能在给定 prompt 下的输出质量。

```json
{
  "id": 1,
  "skill": "codeck-outline",
  "prompt": "帮我规划一个关于 AI 的技术分享大纲",
  "expected_output": "生成 outline.md",
  "files": [],
  "assertions": [
    { "type": "file_exists", "path": "outline.md", "description": "应生成 outline" },
    { "type": "file_contains", "path": "outline.md", "value": "叙事弧", "description": "应有叙事结构" }
  ]
}
```

assertion 类型：
- `contains` — 输出文本包含指定字符串
- `file_exists` — 指定文件被创建
- `file_contains` — 指定文件包含指定字符串
- `asks_question` — 技能通过 AskUserQuestion 提问
- `skill_triggered` — 指定技能被正确触发

### 触发测试（trigger_evals）

验证 description 的触发准确率——该触发时触发，不该触发时不触发。

```json
{ "query": "帮我做 PPT", "should_trigger": "codeck", "reason": "做 PPT 是核心触发词" }
{ "query": "帮我写 Python", "should_trigger": null, "reason": "与演示文稿无关" }
```

规则：
- should-trigger 和 should-not-trigger 各占约一半
- should-not-trigger 要选近似场景（编辑 markdown ≠ 做演示），不要选明显无关的
- 每个 query 要像真实用户会说的话，带具体细节，不要太抽象
