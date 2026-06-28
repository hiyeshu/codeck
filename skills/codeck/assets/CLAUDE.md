# assets/
> L2 | 父级: /Users/yeshu/codeck/skills/codeck/CLAUDE.md

成员清单
base.css: 固定 runtime chrome 基础样式，覆盖 slide、toolbar、overview、presenter 和 print。
editor.css: 固定 editor chrome 样式，覆盖 editor toolbar、Ask Codex panel、selected node overlay、image slot 和低干扰 annotation。
toolbar.html: 主放映工具栏 HTML fragment，构建时内联为 `TOOLBAR_HTML`。
presenter.html: presenter mode HTML fragment，构建时内联为 `PRESENTER_HTML`。
editor-toolbar.html: editor mode HTML fragment，构建时内联为 `EDITOR_TOOLBAR_HTML`，包含 Ask Codex 与 Version 入口。
icons.svg: 固定 SVG symbol sprite，供所有 runtime controls 与 Ask Codex 入口使用。

架构决策
HTML partials 放在官方 skill assets 目录，仍由 `assemble.sh` 构建时内联；最终 deck 不做 runtime fetch。

依赖边界
assets 是固定 runtime 资源，不承载每 deck 的视觉系统。每 deck 视觉只写 room 内 `custom.css`。

变更日志
2026-06-28: 主工具条收敛为 Ask Codex + Version；Mark/Feedback 从默认工作流移除。
2026-06-27: 新增 selected node overlay，暴露当前 agent 可感知的 deck 元素。
2026-06-27: 新增右侧 Ask Codex 样式与 toolbar 入口。
2026-06-27: 拆分 editor.css，基础放映样式与编辑器样式分离。
2026-06-26: 把 toolbar/presenter/editor chrome 从 JS 字符串移入 assets。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
