<div align="center">

# codeck

**一个 skill 是一个 channel。codeck 是一个 deck room。**

[在线演示 →](https://codeck.sh/codeck-intro)

[English](README.md) | 简体中文 | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

</div>

你有一个文件夹，里面是笔记、文档、数据、图片。你想做一套演示文稿。你输入 `/codeck`。

codeck 打开一个持久的 deck room。一个用户可见 skill 在内部 channel 之间路由工作：outline、design、review、speech、export。

channel 有地址、写入边界、房间文件和 handoff。room 把当前 deck 状态保存在 `~/.codeck/projects/{slug}/`，所以跨运行继续工作，不依赖聊天记忆。

产出是一个 HTML 文件。没有模板。没有固定的幻灯片类型。每页自由 HTML——AI 可以为你的内容发明任何视觉形式。

## 怎么用

`/codeck` 打开 room 并读取项目。outline channel 组织故事，design channel 赋予视觉形式，review channel 像最难搞的听众一样追问。speech 和 export channel 准备交付。

handoff 留在 room 里，不靠聊天历史。

## 三个想法

**一个 skill 是一个 channel。** codeck 不是一个超长 prompt 假装成团队。这个 skill 打开一个 room，然后固定 lanes 各自拥有清晰写入边界：响应什么、写什么、交给谁。

**同构映射。** 设计之前，codeck 分析你内容的*形式结构*——张力曲线、信息密度、情绪弧线。然后从另一个领域找到结构上的对应：一首乐曲、一种绘画风格、一个建筑原则。你的幻灯片不只是*装着*你的论证——它们*长得像*你的论证。（受侯世达《集异壁》启发。）

**没有 schema 天花板。** 大多数幻灯片工具给你一套积木：标题、要点、图片、引用。codeck 给 AI 自由 HTML。如果你的内容需要一种还没有名字的视觉形式，AI 可以发明它。

## 安装

支持 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://cursor.com)、[Codex](https://openai.com/codex) 及 [40+ 其他 agent](https://skills.sh)。

```bash
npx skills add hiyeshu/codeck
```

输入 `/codeck` 开始。

## HTML 文件

产出是一个自包含的 HTML 文件。任何浏览器打开即用，不需要服务器或构建工具。

### 快捷键

| 按键 | 功能 |
|------|------|
| `→` `↓` `Space` `Enter` | 下一步（片段或页） |
| `←` `↑` `Backspace` | 上一步 |
| `Esc` | 总览视图 |
| `F` | 全屏 |
| `P` | 演讲者模式 |
| `E` | 编辑模式 |

触屏：左右滑动翻页。底部浮动工具栏桌面端悬停显示，移动端常驻。

### 演讲者模式

按 `P` 打开演讲者窗口：

- **当前页** — 大预览，显示当前片段步骤
- **下一步预览** — 下一个片段或下一页
- **演讲笔记** — 可滚动，支持缩放（`+` / `-`）
- **计时器** — 首次翻页自动开始，点击暂停，双击归零
- **主题切换** — 一键切换所有 UI 元素（工具栏、总览、演讲面板）的明暗模式

演讲者窗口通过 BroadcastChannel 与主窗口同步，两边都能翻页。

### 总览模式

按 `Esc` 显示全部页面的缩略图网格，点击跳转。

## License

MIT
