/**
 * [INPUT]: 接收 Deck props、已渲染好的 Slide HTML 和文档标题
 * [OUTPUT]: 返回单个自包含 HTML 文档，内含默认样式、交互层 JS 和打印降级规则
 * [POS]: skill/compiler/registry 的页面级根组件，实现 Deck 交互壳
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { escapeAttribute, escapeHtml } from "../escape";

export function renderDeckDocument(
  title: string,
  slidesHtml: string,
  totalPages?: number,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --deck-bg: #f3f4f6;
      --slide-bg: #ffffff;
      --deck-fg: #111827;
      --deck-muted: #6b7280;
      --deck-border: #e5e7eb;
      --deck-accent: #2563eb;
      --deck-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
      --slide-width: 1280px;
      --slide-height: 720px;
      --deck-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --deck-mono: ui-monospace, "SFMono-Regular", "SF Mono", Consolas, monospace;
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
    body {
      background: var(--slide-bg);
      color: var(--deck-fg);
      font-family: var(--deck-font);
    }
    .skip-link {
      position: absolute;
      left: -9999px;
      top: 16px;
      background: #fff;
      color: #000;
      padding: 8px 12px;
      z-index: 999;
    }
    .skip-link:focus { left: 16px; }
    .deck-app {
      width: 100vw;
      height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .deck-stage {
      width: 100%;
      height: 100%;
    }
    .deck-slides {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .slide {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: none;
      position: absolute;
      top: 0;
      left: 0;
    }
    .slide.is-active { display: block; }

    /* ─── Slide 内容区默认布局 ─── */
    .slide__canvas {
      width: 100%;
      height: 100%;
      padding: 64px 80px;
      overflow: hidden;
      background: var(--slide-bg);
    }
    .slide--cover .slide__canvas {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .slide--section-divider .slide__canvas {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: var(--deck-fg);
      color: var(--slide-bg);
    }
    .slide--closing .slide__canvas {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: var(--deck-fg);
      color: var(--slide-bg);
    }

    /* ─── Block 通用 ─── */
    .block { margin-bottom: 24px; }
    .block:last-child { margin-bottom: 0; }

    /* ─── StatementHero ─── */
    .statement-hero { width: 100%; }
    .statement-hero__label {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--deck-muted);
      margin: 0 0 16px;
    }
    .statement-hero__title {
      font-size: 56px;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .statement-hero__body {
      font-size: 20px;
      line-height: 1.5;
      color: var(--deck-muted);
      margin: 20px 0 0;
      max-width: 600px;
    }
    .slide--cover .statement-hero__body { margin-left: auto; margin-right: auto; }

    /* ─── BulletList ─── */
    .bullet-list__heading {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--deck-muted);
      margin: 0 0 20px;
    }
    .bullet-list__items { list-style: none; margin: 0; padding: 0; }
    .bullet-list__item { padding: 12px 0; border-bottom: 1px solid var(--deck-border); }
    .bullet-list__item:last-child { border-bottom: none; }
    .bullet-list__item-title { font-size: 18px; font-weight: 600; margin: 0; }
    .bullet-list__item-body { font-size: 16px; color: var(--deck-muted); margin: 4px 0 0; }

    /* ─── Code ─── */
    .code-block__title-bar {
      background: #313244;
      padding: 8px 16px;
      border-radius: 12px 12px 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .code-block__dot { width: 10px; height: 10px; border-radius: 50%; }
    .code-block__dot--red { background: #F38BA8; }
    .code-block__dot--yellow { background: #FAB387; }
    .code-block__dot--green { background: #A6E3A1; }
    .code-block__title-text { font-size: 13px; color: #a6adc8; margin-left: 8px; }
    .code-block__pre {
      background: #1E1E2E;
      color: #CDD6F4;
      padding: 20px;
      margin: 0;
      border-radius: 0 0 12px 12px;
      overflow-x: auto;
      font-family: var(--deck-mono);
      font-size: 14px;
      line-height: 1.6;
    }
    .code-block__title-bar + .code-block__pre { border-radius: 0 0 12px 12px; }
    .code-block__pre:first-child { border-radius: 12px; }

    /* ─── Callout ─── */
    .callout {
      padding: 20px 24px;
      border-radius: 16px;
      background: #f0f4ff;
    }
    .callout--warning { background: #FEF3C7; }
    .callout--success { background: #ECFDF5; }
    .callout--danger { background: #FEE2E2; }
    .callout__title { font-size: 16px; font-weight: 600; margin: 0 0 6px; }
    .callout__body { font-size: 15px; line-height: 1.5; margin: 0; }

    /* ─── MetricGrid ─── */
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .metric-grid__card {
      background: var(--slide-bg);
      border: 1px solid var(--deck-border);
      border-radius: 16px;
      padding: 24px;
    }
    .metric-grid__value { font-size: 36px; font-weight: 700; margin: 0; }
    .metric-grid__label { font-size: 14px; color: var(--deck-muted); margin: 4px 0 0; }
    .metric-grid__note { font-size: 13px; color: var(--deck-muted); margin: 8px 0 0; }

    /* ─── Heading (slide title) ─── */
    .slide__canvas h2:first-child, .slide__canvas h3:first-child {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin: 0 0 32px;
    }
    /* ─── 全览模式 ─── */
    .deck-app.is-overview {
      overflow: auto;
      align-items: flex-start;
      background: var(--deck-bg);
    }
    .deck-app.is-overview .deck-stage {
      align-items: flex-start;
      padding: 32px;
    }
    .deck-app.is-overview .deck-slides {
      width: min(100%, 1720px);
      height: auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      transform: none !important;
    }
    .deck-app.is-overview .slide {
      display: block;
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
      cursor: pointer;
      border: 1px solid var(--deck-border);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .deck-app.is-overview .slide .slide__canvas {
      transform: scale(var(--overview-scale, 0.25));
      transform-origin: top left;
      width: 1280px;
      height: 720px;
      position: absolute;
      top: 0;
      left: 0;
    }
    /* ─── 导航栏：极简半透明，鼠标悬停浮现 ─── */
    .deck-nav {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 20px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      transition: opacity 400ms ease, transform 400ms ease;
      opacity: 0;
      z-index: 100;
    }
    .deck-app:hover .deck-nav,
    .deck-nav:hover {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    .deck-counter {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      font-variant-numeric: tabular-nums;
    }
    .deck-progress {
      width: 120px;
      height: 2px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px;
      overflow: hidden;
    }
    .deck-progress > span {
      display: block;
      height: 100%;
      background: rgba(255,255,255,0.7);
      width: 0;
      transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    /* ─── 功能按钮 ─── */
    .deck-actions { display: flex; gap: 2px; margin-left: 8px; }
    .deck-btn {
      width: 32px; height: 32px;
      border-radius: 8px; border: none; background: transparent;
      color: rgba(255,255,255,0.5); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 200ms ease, color 200ms ease;
      position: relative;
    }
    .deck-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.9); }
    .deck-btn.is-active { color: rgba(255,255,255,0.95); background: rgba(255,255,255,0.15); }
    .deck-btn svg { width: 16px; height: 16px; }
    .deck-btn__tip {
      position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
      padding: 4px 10px; border-radius: 6px;
      background: rgba(0,0,0,0.8); color: rgba(255,255,255,0.9);
      font-size: 11px; white-space: nowrap;
      opacity: 0; pointer-events: none;
      transition: opacity 200ms ease;
    }
    .deck-btn:hover .deck-btn__tip { opacity: 1; }
    .deck-panel {
      position: fixed;
      bottom: 72px;
      left: 50%;
      transform: translateX(-50%);
      width: min(100%, 640px);
      padding: 16px 20px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.85);
      color: rgba(255,255,255,0.9);
      display: none;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.6;
      backdrop-filter: blur(16px);
      z-index: 99;
    }
    .deck-panel.is-open { display: block; }
    :focus-visible {
      outline: 2px solid var(--deck-accent);
      outline-offset: 2px;
      border-radius: 6px;
    }
    @media (prefers-reduced-motion: reduce) {
      .deck-progress > span,
      .slide { transition: none !important; animation: none !important; }
    }
    @media print {
      body { background: #fff; }
      .deck-app { padding: 0; display: block; }
      .deck-stage, .deck-slides { width: auto; min-height: 0; display: block !important; }
      .deck-nav, .deck-panel, .deck-help, .skip-link { display: none !important; }
      .slide {
        display: block !important;
        width: var(--slide-width);
        height: var(--slide-height);
        box-shadow: none;
        border: none;
        page-break-after: always;
      }
      video { display: none !important; }
      .video-print-fallback { display: block !important; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#deck-main">Skip to slides</a>
  <div class="deck-app" data-total-pages="${escapeAttribute(totalPages || "")}">
    <div class="deck-stage">
      <main id="deck-main" class="deck-slides">${slidesHtml}</main>
    </div>
    <div class="deck-nav" aria-hidden="false">
      <div class="deck-counter" data-counter>1 / ${escapeHtml(totalPages || 0)}</div>
      <div class="deck-progress" aria-hidden="true"><span data-progress></span></div>
      <div class="deck-actions">
        <button class="deck-btn" data-action="overview" title="全览">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span class="deck-btn__tip">全览 Esc</span>
        </button>
        <button class="deck-btn" data-action="fullscreen" title="全屏">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>
          <span class="deck-btn__tip">全屏 F</span>
        </button>
        <button class="deck-btn" data-action="notes" title="备注">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span class="deck-btn__tip">备注 S</span>
        </button>
      </div>
    </div>
    <section class="deck-panel" data-notes-panel></section>
  </div>
  <script>
    (() => {
      const app = document.querySelector('.deck-app');
      const slides = Array.from(document.querySelectorAll('.slide'));
      const counter = document.querySelector('[data-counter]');
      const progress = document.querySelector('[data-progress]');
      const notesPanel = document.querySelector('[data-notes-panel]');
      if (!app || slides.length === 0) return;

      let index = 0;
      let overview = false;
      let notesOpen = false;
      let touchStartX = 0;

      /* ─── 视口自适应缩放 ─── */
      const fit = () => {
        if (overview) {
          /* 全览模式：计算每个 slide 卡片的缩放比 */
          requestAnimationFrame(() => {
            slides.forEach(slide => {
              const cardWidth = slide.offsetWidth || 320;
              const scale = cardWidth / 1280;
              slide.style.setProperty('--overview-scale', String(scale));
            });
          });
          return;
        }
      };
      window.addEventListener('resize', fit);

      const clamp = (value) => Math.max(0, Math.min(slides.length - 1, value));
      const update = () => {
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('is-active', !overview && slideIndex === index);
          slide.setAttribute('aria-hidden', overview ? 'false' : String(slideIndex !== index));
        });
        app.classList.toggle('is-overview', overview);
        const active = slides[index];
        if (counter) counter.textContent = (index + 1) + ' / ' + slides.length;
        if (progress) progress.style.width = (((index + 1) / slides.length) * 100) + '%';
        if (notesPanel) {
          notesPanel.textContent = notesOpen ? (active?.dataset.notes || '') : '';
          notesPanel.classList.toggle('is-open', notesOpen);
        }
        if (typeof fit === 'function') fit();
        /* 按钮状态同步 */
        document.querySelector('[data-action="overview"]')?.classList.toggle('is-active', overview);
        document.querySelector('[data-action="notes"]')?.classList.toggle('is-active', notesOpen);
      };

      const toggleFullscreen = async () => {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
        else await document.exitFullscreen?.();
      };

      document.addEventListener('keydown', async (event) => {
        if (event.key === 'ArrowRight' || event.key === ' ') {
          if (!overview) index = clamp(index + 1);
          update();
        }
        if (event.key === 'ArrowLeft') {
          if (!overview) index = clamp(index - 1);
          update();
        }
        if (event.key.toLowerCase() === 'f') await toggleFullscreen();
        if (event.key === 'Escape') {
          overview = !overview;
          update();
        }
        if (event.key.toLowerCase() === 's') {
          notesOpen = !notesOpen;
          update();
        }
      });

      slides.forEach((slide, slideIndex) => {
        slide.addEventListener('click', () => {
          if (!overview) return;
          index = slideIndex;
          overview = false;
          update();
        });
      });

      document.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0]?.clientX || 0;
      }, { passive: true });
      document.addEventListener('touchend', (event) => {
        const delta = (event.changedTouches[0]?.clientX || 0) - touchStartX;
        if (Math.abs(delta) < 40 || overview) return;
        index = clamp(index + (delta < 0 ? 1 : -1));
        update();
      }, { passive: true });

      /* ─── 按钮点击 ─── */
      const btnOverview = document.querySelector('[data-action="overview"]');
      const btnFullscreen = document.querySelector('[data-action="fullscreen"]');
      const btnNotes = document.querySelector('[data-action="notes"]');
      btnOverview?.addEventListener('click', () => { overview = !overview; update(); });
      btnFullscreen?.addEventListener('click', () => toggleFullscreen());
      btnNotes?.addEventListener('click', () => { notesOpen = !notesOpen; update(); });

      const syncBtnState = () => {
        btnOverview?.classList.toggle('is-active', overview);
        btnNotes?.classList.toggle('is-active', notesOpen);
      };
      const origUpdate2 = update;

      update();
    })();
  </script>
</body>
</html>`;
}
