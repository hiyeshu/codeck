# office/
> L2 | 父级: /Users/gaoding/Desktop/codeck/skills/codeck/scripts/CLAUDE.md

成员清单
soffice.py: LibreOffice CLI 包装器，统一 headless 转 PDF/PPTX 的错误处理和输出路径。

架构决策
Office 转换只封装现有 LibreOffice，不假装生成原生可编辑 PPTX；输出质量由 delivery QA 再检查。

依赖边界
只调用本机 `soffice`/`libreoffice`。没有 LibreOffice 时必须明确失败，不静默降级。

变更日志
2026-06-26: 从旧 export skill 折叠出最小 office bridge。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
