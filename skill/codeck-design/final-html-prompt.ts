/**
 * [INPUT]: 接收 default.html 内容、新三层 design.json 对象及可选路径元数据
 * [OUTPUT]: 输出一段 Lisp 风格 prompt，约束 Claude 基于结构真相源和三层设计层直出最终 HTML
 * [POS]: skill/design 的最终渲染提示词生成层，负责把 default.html + design.json 收束为单轮 HTML 任务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { DesignJson } from "./design-schema";

export interface FinalHtmlPromptInput {
  defaultHtml: string;
  design: DesignJson;
  deckTitle?: string;
  outputFileName?: string;
  defaultHtmlPath?: string;
  designPath?: string;
}

export function buildFinalHtmlLispPrompt(input: FinalHtmlPromptInput): string {
  const designJson = JSON.stringify(input.design, null, 2);
  return [
    "(task",
    ...metadataLines(input),
    ...objectiveLines(),
    ...structureRules(),
    ...designPriority(),
    ...allowedActions(),
    ...forbiddenActions(),
    ...outputContract(),
    ...payloadBlock("default-html", "DEFAULT_HTML", input.defaultHtml),
    ...payloadBlock("design-json", "DESIGN_JSON", designJson),
    ")",
  ].join("\n");
}

function metadataLines(input: FinalHtmlPromptInput): string[] {
  return [
    '  :name "compose-final-html-from-default-ppt"',
    '  :mode "single-pass-html-render"',
    `  :deck-title ${quote(input.deckTitle || "(unknown)")}`,
    `  :output-filename ${quote(input.outputFileName || "deck-r0.html")}`,
    `  :default-html-path ${quote(input.defaultHtmlPath || "(inline)")}`,
    `  :design-json-path ${quote(input.designPath || "(inline)")}`,
  ];
}

function objectiveLines(): string[] {
  return [
    '  :objective "基于 default.html 结构真相源和 design.json 三层设计真相源，输出单文件最终 HTML 作品"',
    '  :instruction "你必须只返回完整 HTML，不要解释，不要 markdown code fence，不要额外说明"',
    '  :identity "把这份作品视为 deck-title 对应的最终演示文稿，输出文件名目标是 output-filename"',
  ];
}

function structureRules(): string[] {
  return [
    "  :structure-rules",
    "  (",
    '    "default.html 是结构真相源，不得改 slide 顺序、数量或根层级 contract"',
    '    "必须保留每个 section.slide 的 id、data-purpose、data-narrative-role、data-importance、data-notes"',
    '    "必须保留每个 .slide 内的 .slide__canvas 根层级"',
    '    "必须保留每个 .block 的 id、block--type class 与 data-block-type"',
    '    "必须保留 deck shell DOM：.deck-app、.deck-nav、data-counter、data-progress、notes panel、脚本入口"',
    '    "允许微调 block 内部 markup 和新增 style，但不得替换 slide 或 block 根节点"',
    "  )",
  ];
}

function designPriority(): string[] {
  return [
    "  :design-priority",
    "  (",
    '    "1. design_system：颜色、字体、间距、布局、形状、阴影、组件原则，是硬输入"',
    '    "2. design_style：情绪、视觉语言、构图、留白、品牌语气，是主观审美方向"',
    '    "3. visual_effects：背景效果、SVG、Canvas、粒子、3D、着色器等表现层增强，只能附加，不能破坏 shell 或 PPT 根结构"',
    "  )",
  ];
}

function allowedActions(): string[] {
  return [
    "  :allowed-actions",
    "  (",
    '    "强化 typography、spacing、background、surface、ornament、page rhythm"',
    '    "基于 design_system 做硬 token 与 layout 决策，基于 design_style 做审美与构图决策，基于 visual_effects 做表现层增强"',
    '    "允许新增自包含 <style>，允许微调 block 内部非根层级包装"',
    '    "允许新增附加型 SVG、Canvas、background effect 容器，但不能替换 slide 或 block 根节点"',
    "  )",
  ];
}

function forbiddenActions(): string[] {
  return [
    "  :forbidden-actions",
    "  (",
    '    "不得删除或新增 slide"',
    '    "不得改变 block 身份、顺序或归属页面"',
    '    "不得破坏 overview、fullscreen、notes、progress 等 shell 行为"',
    '    "不得把结果改成网页应用、营销页或组件 playground"',
    "  )",
  ];
}

function outputContract(): string[] {
  return [
    "  :output-contract",
    "  (",
    '    "返回单文件最终 HTML"',
    '    "HTML 必须可直接在浏览器打开"',
    '    "结果应当是高完成度静态演示作品，而不是开发预览"',
    "  )",
  ];
}

function payloadBlock(name: string, marker: string, content: string): string[] {
  return [
    `  :${name}`,
    `  #<<${marker}`,
    content,
    `  ${marker}`,
  ];
}

function quote(value: string): string {
  return JSON.stringify(value);
}
