/* ─── codeck engine v2.0 ─── */
/* Slide engine: navigation, fragments, overview, presenter, toolbar */
/* Inlined by assemble.sh — AI does not modify this file */

(function () {
  'use strict';

  /* ─── Constants ─── */
  var REF_W = 1280;
  var REF_H = 720;
  var TOOLBAR_HIDE_MS = 3000;

  /* ─── SVG icons (inline, 20x20 viewBox) ─── */
  var ICON = {
    grid: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1"/></svg>',
    left: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4l6 6-6 6"/></svg>',
    presenter: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="16" height="11" rx="1.5"/><path d="M7 17h6M10 14v3"/></svg>',
    fullscreen: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7V4a1 1 0 011-1h3M13 3h3a1 1 0 011 1v3M17 13v3a1 1 0 01-1 1h-3M7 17H4a1 1 0 01-1-1v-3"/></svg>',
    exitfs: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3v3a1 1 0 01-1 1H3M17 7h-3a1 1 0 01-1-1V3M13 17v-3a1 1 0 011-1h3M3 13h3a1 1 0 011 1v3"/></svg>',
    zoomin: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/><path d="M10 7v6M7 10h6"/></svg>',
    zoomout: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="6"/><path d="M7 10h6"/></svg>',
    sun: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="4"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"/></svg>',
    moon: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 11.5a7 7 0 01-9.5-6.5 7 7 0 109.5 6.5z"/></svg>'
  };

  /* ─── State ─── */
  var slides = [];
  var cur = 0;
  var frag = 0;
  var inOverview = false;
  var isPresenter = /[?&]presenter/.test(location.search);
  var isPrint = /[?&]print/.test(location.search);
  var channel = null;
  var toolbarTimer = null;
  var timerSecs = 0;
  var timerIv = null;
  var timerStarted = false;
  var notesFontSize = 16;

  /* ─── Init ─── */
  function init() {
    slides = Array.from(document.querySelectorAll('.slide'));
    if (!slides.length) return;
    channel = new BroadcastChannel('codeck-sync');
    channel.onmessage = onSync;
    if (isPrint) {
      initPrint();
      return;
    }
    if (isPresenter) {
      initPresenter();
    } else {
      createSlideUI();
    }
    goto(0);
    bindKeys();
    if (!isPresenter) bindTouch();
    fouc();
  }

  /* ─── FOUC protection ─── */
  function fouc() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.getElementById('app').classList.add('ready');
      });
    });
  }

  /* ─── Navigation ─── */
  function goto(n, silent) {
    if (n < 0 || n >= slides.length) return;
    if (cur !== n) {
      slides[cur].classList.remove('active');
      resetFragments(slides[cur]);
    }
    cur = n;
    frag = 0;
    slides[n].classList.add('active');
    resetFragments(slides[n]);
    updateProgress();
    if (isPresenter) {
      updatePresenter();
      autoStartTimer();
    }
    if (!silent) sync({ t: 'g', s: n });
  }

  function next() {
    if (inOverview) return;
    goto(cur + 1);
  }

  function prev() {
    if (inOverview) return;
    goto(cur - 1);
  }

  /* ─── Fragments ─── */
  function maxFrag(slide) {
    var m = 0;
    slide.querySelectorAll('[data-f]').forEach(function (el) {
      m = Math.max(m, parseInt(el.dataset.f, 10) || 0);
    });
    return m;
  }

  function resetFragments(slide) {
    slide.querySelectorAll('[data-f]').forEach(function (el) {
      el.classList.remove('visible');
    });
  }

  function showUpTo(slide, step) {
    slide.querySelectorAll('[data-f]').forEach(function (el) {
      var f = parseInt(el.dataset.f, 10) || 0;
      el.classList.toggle('visible', f <= step);
    });
  }

  function stepDown() {
    if (inOverview) return;
    var slide = slides[cur];
    var max = maxFrag(slide);
    if (frag < max) {
      frag++;
      showUpTo(slide, frag);
      updateProgress();
      sync({ t: 'f', s: cur, f: frag });
      if (isPresenter) {
        updatePresenter();
        autoStartTimer();
      }
    } else {
      goto(cur + 1);
    }
  }

  function stepUp() {
    if (inOverview) return;
    var slide = slides[cur];
    if (frag > 0) {
      frag--;
      showUpTo(slide, frag);
      updateProgress();
      sync({ t: 'f', s: cur, f: frag });
      if (isPresenter) updatePresenter();
    } else if (cur > 0) {
      goto(cur - 1);
      var p = slides[cur];
      frag = maxFrag(p);
      showUpTo(p, frag);
      updateProgress();
    }
  }

  /* ─── Overview (clone-based thumbnails) ─── */
  function toggleOverview() {
    inOverview = !inOverview;
    var app = document.getElementById('app');
    app.classList.toggle('overview', inOverview);

    if (inOverview) {
      /* Hide real slides (in presenter they're already hidden) */
      if (!isPresenter) {
        slides.forEach(function (s) { s.style.display = 'none'; });
      }

      /* Build thumbnail grid */
      var grid = document.createElement('div');
      grid.id = 'ov-grid';
      slides.forEach(function (s, i) {
        var cell = document.createElement('div');
        cell.className = 'ov-cell' + (i === cur ? ' ov-active' : '');
        cell.onclick = function () { toggleOverview(); goto(i); };
        var vp = document.createElement('div');
        vp.className = 'ov-viewport';
        cell.appendChild(vp);
        grid.appendChild(cell);
      });
      app.appendChild(grid);

      /* Render clones after layout (so clientWidth is measured) */
      requestAnimationFrame(function () {
        grid.querySelectorAll('.ov-viewport').forEach(function (vp, i) {
          renderPreview(vp, i, maxFrag(slides[i]));
        });
      });
    } else {
      /* Tear down grid */
      var grid = document.getElementById('ov-grid');
      if (grid) grid.parentNode.removeChild(grid);
      /* Restore slides only in slide view (not presenter) */
      if (!isPresenter) {
        slides.forEach(function (s) { s.style.display = ''; });
        slides.forEach(function (s, i) {
          if (i !== cur) s.classList.remove('active');
        });
        resetFragments(slides[cur]);
        showUpTo(slides[cur], frag);
      } else {
        updatePresenter();
      }
    }
  }

  /* ─── BroadcastChannel sync ─── */
  function sync(data) {
    if (channel) channel.postMessage(data);
  }

  function onSync(e) {
    var d = e.data;
    if (d.t === 'g') {
      goto(d.s, true);
    } else if (d.t === 'f') {
      if (d.s !== cur) goto(d.s, true);
      frag = d.f;
      showUpTo(slides[cur], frag);
      updateProgress();
      if (isPresenter) updatePresenter();
    } else if (d.t === 'sync?' && !isPresenter) {
      sync({ t: 'g', s: cur });
      if (frag > 0) sync({ t: 'f', s: cur, f: frag });
    }
  }

  /* ─── Fullscreen ─── */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  /* ─── Slide view UI ─── */
  function createSlideUI() {
    var app = document.getElementById('app');

    /* Segmented progress bar */
    var prog = document.createElement('div');
    prog.id = 'progress';
    slides.forEach(function (s, i) {
      var seg = document.createElement('div');
      seg.className = 'progress-seg';
      seg.onclick = function () { goto(i); };
      var fill = document.createElement('div');
      fill.className = 'progress-fill';
      seg.appendChild(fill);
      prog.appendChild(seg);
    });
    app.appendChild(prog);

    /* Floating toolbar */
    var tb = document.createElement('div');
    tb.id = 'slide-toolbar';
    tb.innerHTML = [
      '<button class="tb-btn" data-act="overview" data-tip="Overview (Esc)">' + ICON.grid + '</button>',
      '<button class="tb-btn" data-act="prev" data-tip="Previous (\u2190)">' + ICON.left + '</button>',
      '<span class="tb-counter" id="slide-counter"></span>',
      '<button class="tb-btn" data-act="next" data-tip="Next (\u2192)">' + ICON.right + '</button>',
      '<button class="tb-btn" data-act="presenter" data-tip="Presenter (P)">' + ICON.presenter + '</button>',
      '<button class="tb-btn" data-act="fullscreen" data-tip="Fullscreen (F)">' + ICON.fullscreen + '</button>'
    ].join('');
    app.appendChild(tb);

    tb.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var a = btn.dataset.act;
      if (a === 'prev') stepUp();
      else if (a === 'next') stepDown();
      else if (a === 'overview') toggleOverview();
      else if (a === 'presenter') openPresenter();
      else if (a === 'fullscreen') toggleFullscreen();
    });

    /* Show toolbar when mouse enters bottom zone, hide on leave */
    var isTouchDevice = 'ontouchstart' in window;
    if (!isTouchDevice) {
      var ZONE_H = 80;
      document.addEventListener('mousemove', function (e) {
        var inZone = e.clientY > window.innerHeight - ZONE_H;
        if (inZone || tb.matches(':hover')) {
          tb.classList.add('tb-visible');
        } else {
          tb.classList.remove('tb-visible');
        }
      });
      tb.addEventListener('mouseleave', function () {
        tb.classList.remove('tb-visible');
      });
    }

    /* Update fullscreen icon on change + flash toolbar on enter */
    document.addEventListener('fullscreenchange', function () {
      var fsBtn = tb.querySelector('[data-act="fullscreen"]');
      if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? ICON.exitfs : ICON.fullscreen;
      if (document.fullscreenElement && !isTouchDevice) {
        tb.classList.add('tb-visible');
        clearTimeout(toolbarTimer);
        toolbarTimer = setTimeout(function () { tb.classList.remove('tb-visible'); }, 2000);
      }
    });

    /* Keyboard hints (desktop only, once per session) */
    if (!isTouchDevice && !sessionStorage.getItem('codeck-hints')) {
      var hints = document.createElement('div');
      hints.id = 'key-hints';
      hints.innerHTML = '<kbd>&larr;</kbd> <kbd>&rarr;</kbd> Navigate &nbsp; <kbd>Esc</kbd> Overview &nbsp; <kbd>P</kbd> Presenter &nbsp; <kbd>F</kbd> Fullscreen';
      app.appendChild(hints);
      sessionStorage.setItem('codeck-hints', '1');
      setTimeout(function () { hints.classList.add('hints-fade'); }, 100);
      setTimeout(function () { if (hints.parentNode) hints.parentNode.removeChild(hints); }, 4000);
    }
  }

  function updateProgress() {
    var segs = document.querySelectorAll('.progress-seg');
    if (!segs.length) return;
    segs.forEach(function (seg, i) {
      var fill = seg.querySelector('.progress-fill');
      if (!fill) return;
      if (i < cur) {
        fill.style.width = '100%';
      } else if (i === cur) {
        var max = maxFrag(slides[i]);
        var pct = max > 0 ? ((frag + 1) / (max + 1) * 100) : 100;
        fill.style.width = pct + '%';
      } else {
        fill.style.width = '0%';
      }
    });
    var ctr = document.getElementById('slide-counter');
    if (ctr) ctr.textContent = (cur + 1) + ' / ' + slides.length;

    /* Also update presenter counter if it exists */
    var pctr = document.getElementById('pv-counter');
    if (pctr) pctr.textContent = (cur + 1) + ' / ' + slides.length;
  }

  /* ─── Presenter mode ─── */
  function openPresenter() {
    var base = location.href.split('?')[0].split('#')[0];
    window.open(base + '?presenter', 'codeck-presenter',
      'width=1200,height=800,menubar=no,toolbar=no');
  }

  function initPresenter() {
    slides.forEach(function (s) { s.style.display = 'none'; });
    var app = document.getElementById('app');
    app.classList.add('presenter-mode');

    var grid = document.createElement('div');
    grid.className = 'presenter-grid';
    grid.innerHTML = [
      '<div class="pv-main"><div class="pv-viewport" id="pv-cur"></div></div>',
      '<div class="pv-side">',
      '  <div class="pv-next-wrap"><div class="pv-viewport" id="pv-next"></div></div>',
      '  <div class="pv-notes-wrap">',
      '    <div class="pv-notes-body" id="pv-notes"></div>',
      '  </div>',
      '</div>',
      '<div class="pv-toolbar">',
      '  <div class="pv-toolbar-group">',
      '    <button class="pv-btn" data-act="prev" data-tip="Previous (\u2190)">' + ICON.left + '</button>',
      '    <button class="pv-btn" data-act="next" data-tip="Next (\u2192)">' + ICON.right + '</button>',
      '    <span class="pv-counter" id="pv-counter"></span>',
      '  </div>',
      '  <div class="pv-toolbar-group">',
      '    <button class="pv-btn" data-act="overview" data-tip="Overview (Esc)">' + ICON.grid + '</button>',
      '    <button class="pv-btn" data-act="fullscreen" data-tip="Fullscreen (F)">' + ICON.fullscreen + '</button>',
      '  </div>',
      '  <div class="pv-toolbar-group">',
      '    <button class="pv-btn pv-btn-sm" data-act="zoom-out" data-tip="Zoom out">' + ICON.zoomout + '</button>',
      '    <button class="pv-btn pv-btn-sm" data-act="zoom-in" data-tip="Zoom in">' + ICON.zoomin + '</button>',
      '  </div>',
      '  <div class="pv-toolbar-group">',
      '    <button class="pv-btn pv-btn-sm" data-act="theme" data-tip="Toggle theme" id="pv-theme-btn">' + ICON.sun + '</button>',
      '  </div>',
      '  <div class="pv-toolbar-group pv-timer-group">',
      '    <span class="pv-time" id="pv-time" data-tip="Click: pause. Double-click: reset">00:00</span>',
      '  </div>',
      '</div>'
    ].join('\n');
    app.insertBefore(grid, app.firstChild);

    /* Segmented progress for presenter */
    var prog = document.createElement('div');
    prog.id = 'progress';
    prog.className = 'pv-progress';
    slides.forEach(function (s, i) {
      var seg = document.createElement('div');
      seg.className = 'progress-seg';
      seg.onclick = function () { goto(i); };
      var fill = document.createElement('div');
      fill.className = 'progress-fill';
      seg.appendChild(fill);
      prog.appendChild(seg);
    });
    grid.appendChild(prog);

    /* Toolbar actions */
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var a = btn.dataset.act;
      if (a === 'prev') stepUp();
      else if (a === 'next') stepDown();
      else if (a === 'overview') toggleOverview();
      else if (a === 'fullscreen') toggleFullscreen();
      else if (a === 'zoom-in') zoomNotes(2);
      else if (a === 'zoom-out') zoomNotes(-2);
      else if (a === 'theme') togglePresenterTheme(grid);
    });

    /* Timer: click = pause/resume, double-click = reset */
    var timeEl = document.getElementById('pv-time');
    timeEl.addEventListener('click', function () {
      if (timerIv) {
        clearInterval(timerIv); timerIv = null;
      } else {
        timerIv = setInterval(function () { timerSecs++; timeEl.textContent = fmtTime(timerSecs); }, 1000);
      }
    });
    timeEl.addEventListener('dblclick', function () {
      timerSecs = 0; timeEl.textContent = '00:00';
      if (timerIv) { clearInterval(timerIv); timerIv = null; }
      timerStarted = false;
    });

    /* Fullscreen icon update */
    document.addEventListener('fullscreenchange', function () {
      var fsBtn = grid.querySelector('[data-act="fullscreen"]');
      if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? ICON.exitfs : ICON.fullscreen;
    });

    /* Set initial theme icon based on system preference */
    var preferLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var themeBtn = document.getElementById('pv-theme-btn');
    if (themeBtn && preferLight) themeBtn.innerHTML = ICON.moon;

    sync({ t: 'sync?' });
  }

  function autoStartTimer() {
    if (timerStarted) return;
    timerStarted = true;
    var timeEl = document.getElementById('pv-time');
    if (!timeEl) return;
    timerIv = setInterval(function () { timerSecs++; timeEl.textContent = fmtTime(timerSecs); }, 1000);
  }

  function fmtTime(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
           String(s % 60).padStart(2, '0');
  }

  function zoomNotes(delta) {
    notesFontSize = Math.max(10, Math.min(32, notesFontSize + delta));
    var el = document.getElementById('pv-notes');
    if (el) el.style.fontSize = notesFontSize + 'px';
  }

  function togglePresenterTheme(grid) {
    var isLight = grid.classList.contains('pv-light');
    grid.classList.toggle('pv-light', !isLight);
    grid.classList.toggle('pv-dark', isLight);
    var btn = document.getElementById('pv-theme-btn');
    if (btn) btn.innerHTML = isLight ? ICON.sun : ICON.moon;
  }

  function updatePresenter() {
    var curEl = document.getElementById('pv-cur');
    var nextEl = document.getElementById('pv-next');
    var notesEl = document.getElementById('pv-notes');
    if (!curEl) return;

    /* Current slide at current fragment step */
    renderPreview(curEl, cur, frag);

    /* Next preview = next step (not next slide) */
    var max = maxFrag(slides[cur]);
    if (frag < max) {
      /* More fragments on this slide — show current slide at frag+1 */
      renderPreview(nextEl, cur, frag + 1);
    } else {
      /* No more fragments — show next slide at step 0 */
      renderPreview(nextEl, cur + 1, -1);
    }

    /* Notes: slide base notes + visible fragment notes */
    var noteText = buildNotes(slides[cur], frag);
    notesEl.textContent = noteText || 'No notes.';
    notesEl.classList.toggle('pv-notes-empty', !noteText);
  }

  /* Build notes: slide data-notes + data-notes from visible fragments */
  function buildNotes(slide, step) {
    var parts = [];
    var base = slide.dataset.notes;
    if (base) parts.push(base);
    slide.querySelectorAll('[data-f]').forEach(function (el) {
      var f = parseInt(el.dataset.f, 10) || 0;
      if (f <= step && el.dataset.notes) {
        parts.push(el.dataset.notes);
      }
    });
    return parts.join('\n\n');
  }

  /* fragStep: -1 = hide all fragments, 0+ = showUpTo that step */
  function renderPreview(container, idx, fragStep) {
    container.innerHTML = '';
    if (idx < 0 || idx >= slides.length) {
      container.innerHTML = '<div class="pv-empty">&mdash;</div>';
      return;
    }
    var clone = slides[idx].cloneNode(true);
    clone.style.cssText = [
      'display:flex', 'position:absolute', 'inset:auto',
      'width:' + REF_W + 'px', 'height:' + REF_H + 'px',
      'transform-origin:top left',
      'transform:scale(' + (container.clientWidth / REF_W) + ')'
    ].join(';');
    if (fragStep >= 0) showUpTo(clone, fragStep);
    container.appendChild(clone);
  }

  /* ─── Print mode (?print) ─── */
  function initPrint() {
    /* Override body/html overflow for scrollable vertical layout */
    document.documentElement.style.cssText = 'width:1280px;height:auto;overflow:visible';
    document.body.style.cssText = 'width:1280px;height:auto;overflow:visible';
    var app = document.getElementById('app');
    app.classList.add('print-mode', 'ready');
    slides.forEach(function (s) {
      s.classList.add('active');
      /* Show all fragments */
      showUpTo(s, maxFrag(s));
    });
  }

  /* ─── Keyboard (unified: all arrows step through fragments) ─── */
  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ': case 'Enter': case 'PageDown':
          e.preventDefault(); stepDown(); break;
        case 'ArrowLeft': case 'ArrowUp': case 'Backspace': case 'PageUp':
          e.preventDefault(); stepUp(); break;
        case 'Escape':
          e.preventDefault(); toggleOverview(); break;
        case 'f': case 'F':
          e.preventDefault(); toggleFullscreen(); break;
        case 'p': case 'P':
          if (!isPresenter) openPresenter(); break;
      }
    });
  }

  /* ─── Touch ─── */
  function bindTouch() {
    var sx = 0, sy = 0;
    var app = document.getElementById('app');

    app.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }, { passive: true });

    app.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) stepDown(); else stepUp();
    }, { passive: true });
  }

  /* ─── Boot ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
