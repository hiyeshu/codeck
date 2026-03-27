/**
 * [INPUT]: 依赖 Vitest 运行默认 deck shell 渲染函数，覆盖导航控件、帮助面板缺省与键盘接管行为
 * [OUTPUT]: 保护 default.html 的真实交互 contract 与参考文档保持一致
 * [POS]: skills/compiler/registry 的 shell 测试层，防止 renderer 再次承诺未实现的 help 面板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { describe, expect, it } from "vitest";
import { renderDeckDocument } from "./deck";

describe("renderDeckDocument", () => {
  it("renders only the supported shell controls", () => {
    const html = renderDeckDocument("Demo", '<section class="slide"></section>', 1);

    expect(html).toContain('data-action="overview"');
    expect(html).toContain('data-action="fullscreen"');
    expect(html).toContain('data-action="notes"');
    expect(html).not.toContain('data-action="help"');
    expect(html).not.toContain("deck-help");
  });

  it("prevents browser defaults for deck navigation keys", () => {
    const html = renderDeckDocument("Demo", '<section class="slide"></section>', 1);

    expect(html).toContain("if (event.key === 'ArrowRight' || event.key === ' ') {\n          event.preventDefault();");
    expect(html).toContain("if (event.key === 'ArrowLeft') {\n          event.preventDefault();");
  });

  it("supports fullscreen nav reveal near the bottom edge", () => {
    const html = renderDeckDocument("Demo", '<section class="slide"></section>', 1);

    expect(html).toContain("document.addEventListener('fullscreenchange'");
    expect(html).toContain("event.clientY > window.innerHeight - 48");
    expect(html).toContain(".deck-app.is-fullscreen .deck-nav");
    expect(html).toContain(".deck-app.is-fullscreen .deck-nav.nav-revealed");
  });

  it("does not toggle overview on Escape while fullscreen is active", () => {
    const html = renderDeckDocument("Demo", '<section class=\"slide\"></section>', 1);

    expect(html).toContain("if (event.key === 'Escape') {\n          if (document.fullscreenElement) return;");
  });
});
