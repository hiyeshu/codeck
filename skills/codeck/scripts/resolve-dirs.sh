# resolve-dirs.sh — sourced, never executed. No shebang, no exit.
#
# [INPUT]: 依赖调用方已解析的 CODECK_SKILL_DIR（指向已安装的 codeck skill 目录）
# [OUTPUT]: 导出 CODECK_ROOT、CODECK_SKILL_DIR、CODECK_DESIGN_DIR、CODECK_EXPORT_DIR；环境变量覆盖永远优先
# [POS]: codeck/scripts 的共享 lane 目录解析器，被每个 SKILL.md 的统一 bootstrap 块 source
# [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
#
# 兄弟推导在所有布局下成立：扁平安装把 skills/* 并排复制，插件安装保留整个
# skills/ 目录，因此 codeck 的父目录必然同时容纳 codeck-design 与 codeck-export。
# 注意：插件缓存 glob 在多版本宽限期内取字典序第一个版本目录（2.10.0 排在
# 2.9.0 之前）；Claude 下 ${CLAUDE_PLUGIN_ROOT} 探测项优先命中，影响可忽略。

CODECK_SKILL_DIR="$(cd "$CODECK_SKILL_DIR" && pwd)"
CODECK_ROOT="$(cd "$CODECK_SKILL_DIR/.." && pwd)"

if [ -z "${CODECK_DESIGN_DIR:-}" ]; then
  if [ -d "$CODECK_ROOT/codeck-design/scripts" ]; then
    CODECK_DESIGN_DIR="$CODECK_ROOT/codeck-design"
  else
    for d in "$HOME/.agents/skills/codeck-design" "$HOME/.codex/skills/codeck-design" "$HOME/.claude/skills/codeck-design"; do
      if [ -d "$d/scripts" ]; then CODECK_DESIGN_DIR="$d"; break; fi
    done
  fi
fi

if [ -z "${CODECK_EXPORT_DIR:-}" ]; then
  if [ -d "$CODECK_ROOT/codeck-export/pptx/scripts" ]; then
    CODECK_EXPORT_DIR="$CODECK_ROOT/codeck-export"
  else
    for d in "$HOME/.agents/skills/codeck-export" "$HOME/.codex/skills/codeck-export" "$HOME/.claude/skills/codeck-export"; do
      if [ -d "$d/pptx/scripts" ]; then CODECK_EXPORT_DIR="$d"; break; fi
    done
  fi
fi

export CODECK_ROOT CODECK_SKILL_DIR CODECK_DESIGN_DIR CODECK_EXPORT_DIR
