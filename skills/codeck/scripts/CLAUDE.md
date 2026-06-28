# scripts/
> L2 | 父级: /Users/yeshu/codeck/skills/codeck/CLAUDE.md

成员清单
assemble.sh: 低层装配器，把固定 assets、engine、deck CSS/HTML 内联成 stdout HTML。
build-html.sh: 最终构建门禁，负责修订号、自包含校验和 engine marker 校验。
validate-design.sh: DESIGN.md 门禁，检查 YAML tokens、章节顺序、recipe markers 和占位文本。
render-engine.js: 固定浏览器核心运行时，负责导航、fragments、overview、presenter 和键盘触控；编辑态不暴露 mark 快捷键。
editor-engine.js: 固定浏览器编辑器扩展，负责可观察 UI 节点、文字/图片 source write、右侧 Ask Codex 请求和低干扰反馈写回。
deck-editor-core.mjs: 本地协作状态内核，统一 source patch、selection、events、inbox、assets、revisions 文件语义。
deck-editor-server.mjs: 本地 HTTP deck editor 服务，提供 HTML 主画布、`/api/source/*`、`/api/selection` 和 room API。
start-deck-editor.sh: deck editor 服务启动器，绑定当前 deck room 与本地端口。
thumbnail.py: export QA 缩略图生成器，把 PDF/PPTX 渲染成页面 PNG。
office/: LibreOffice 桥接层，提供 HTML/PPTX/PDF 格式转换。

架构决策
重复、可判定、会影响交付可靠性的动作必须放脚本；agent 只选择何时调用脚本，不重写脚本逻辑。

依赖边界
scripts 可读取 `../assets` 和 deck room；不得写 skill source tree。输出写到 stdout、cwd、或用户指定目录。

变更日志
2026-06-28: Ask Codex 成为默认协作入口；Mark/Feedback 从主工具条移除，遗留标注只作低干扰审计痕迹。
2026-06-28: 新增文字编辑与图片替换的 source write；位置移动仍只记录语义事件。
2026-06-27: 新增 UI selection 感知路径；点击元素写入 `state/selection.json`，操作事件写入 JSONL。
2026-06-27: 新增本地 deck editor 服务与右侧 Ask Codex 写回路径。
2026-06-27: 拆分 editor-engine.js，核心放映逻辑与编辑器扩展不再挤在一个文件。
2026-06-26: 新增 validate/export/thumbnail 工具，恢复单 skill 的 deterministic contract。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
