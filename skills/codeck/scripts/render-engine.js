/**
 * [INPUT]: 依赖内联 slide section 与 TOOLBAR_HTML/PRESENTER_HTML 模板常量。
 * [OUTPUT]: 提供导航、fragment、overview、presenter、toolbar、键盘和触控运行时。
 * [POS]: skills/codeck/scripts 的核心浏览器引擎,编辑能力由 editor-engine.js 插入同一 IIFE。
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

(function () {
  'use strict';

  var REF_W = 1280;
  var REF_H = 720;

  function icon(name) {
    return '<svg class="ck-icon"><use href="#icon-' + name + '"/></svg>';
  }

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
  var isEditor = false;

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

  function fouc() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.getElementById('app').classList.add('ready');
      });
    });
  }

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
    slide.dataset.step = '0';
  }

  function showUpTo(slide, step) {
    slide.querySelectorAll('[data-f]').forEach(function (el) {
      var f = parseInt(el.dataset.f, 10) || 0;
      el.classList.toggle('visible', f <= step);
    });
    slide.dataset.step = String(step);
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

  function toggleOverview() {
    inOverview = !inOverview;
    var app = document.getElementById('app');
    app.classList.toggle('overview', inOverview);

    if (inOverview) {
      if (!isPresenter) {
        slides.forEach(function (s) { s.style.display = 'none'; });
      }

      var grid = document.createElement('div');
      grid.id = 'ov-grid';
      slides.forEach(function (s, i) {
        var cell = document.createElement('div');
        cell.className = 'ov-cell' + (i === cur ? ' ov-active' : '');
        cell.onclick = function () { toggleOverview(); goto(i); };
        var vp = document.createElement('div');
        vp.className = 'ov-viewport';
        cell.appendChild(vp);
        var label = document.createElement('div');
        label.className = 'ov-label';
        var h = s.querySelector('h1, h2');
        var title = h ? h.textContent.trim() : '';
        label.textContent = (i + 1) + (title ? '. ' + title : '');
        cell.appendChild(label);
        grid.appendChild(cell);
      });
      app.appendChild(grid);

      requestAnimationFrame(function () {
        grid.querySelectorAll('.ov-viewport').forEach(function (vp, i) {
          renderPreview(vp, i, maxFrag(slides[i]));
        });
      });
    } else {
      var grid = document.getElementById('ov-grid');
      if (grid) grid.parentNode.removeChild(grid);
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

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  function createSlideUI() {
    var app = document.getElementById('app');

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

    var tb = document.createElement('div');
    tb.id = 'slide-toolbar';
    tb.innerHTML = TOOLBAR_HTML;
    app.appendChild(tb);

    tb.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var a = btn.dataset.act;
      if (a === 'prev') stepUp();
      else if (a === 'next') stepDown();
      else if (a === 'overview') toggleOverview();
      else if (a === 'presenter') openPresenter();
      else if (a === 'edit') toggleEditor();
      else if (a === 'fullscreen') toggleFullscreen();
    });

    /* Show toolbar when mouse enters bottom zone, hide on leave.
       In editor mode the toolbar stays pinned visible. */
    var isTouchDevice = 'ontouchstart' in window;
    if (!isTouchDevice) {
      var ZONE_H = 80;
      document.addEventListener('mousemove', function (e) {
        if (isEditor) { tb.classList.add('tb-visible'); return; }
        var inZone = e.clientY > window.innerHeight - ZONE_H;
        if (inZone || tb.matches(':hover')) {
          tb.classList.add('tb-visible');
        } else {
          tb.classList.remove('tb-visible');
        }
      });
      tb.addEventListener('mouseleave', function () {
        if (isEditor) return;
        tb.classList.remove('tb-visible');
      });
    }

    /* Update fullscreen icon on change + flash toolbar on enter */
    document.addEventListener('fullscreenchange', function () {
      var fsBtn = tb.querySelector('[data-act="fullscreen"]');
      if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? icon('exitfs') : icon('fullscreen');
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
    grid.innerHTML = PRESENTER_HTML;
    app.insertBefore(grid, app.firstChild);

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
      else if (a === 'theme') togglePresenterTheme();
    });

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

    document.addEventListener('fullscreenchange', function () {
      var fsBtn = grid.querySelector('[data-act="fullscreen"]');
      if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? icon('exitfs') : icon('fullscreen');
    });

    var themeBtn = document.getElementById('pv-theme-btn');
    if (themeBtn) {
      var uiTheme = document.documentElement.getAttribute('data-ui-theme');
      var isLight = uiTheme ? uiTheme === 'light' : window.matchMedia('(prefers-color-scheme: light)').matches;
      themeBtn.innerHTML = isLight ? icon('moon') : icon('sun');
    }

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

  function togglePresenterTheme() {
    var html = document.documentElement;
    var current = html.getAttribute('data-ui-theme');
    var next;
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'light';
    else next = window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark' : 'light';
    html.setAttribute('data-ui-theme', next);
    var btn = document.getElementById('pv-theme-btn');
    if (btn) btn.innerHTML = next === 'light' ? icon('moon') : icon('sun');
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
      renderPreview(nextEl, cur + 1, -1);
    }

    var noteText = buildNotes(slides[cur], frag);
    notesEl.textContent = noteText || 'No notes.';
    notesEl.classList.toggle('pv-notes-empty', !noteText);
  }

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

  function initPrint() {
    document.documentElement.style.cssText = 'width:1280px;height:auto;overflow:visible';
    document.body.style.cssText = 'width:1280px;height:auto;overflow:visible';
    var app = document.getElementById('app');
    app.classList.add('print-mode', 'ready');
    slides.forEach(function (s) {
      s.classList.add('active');
      showUpTo(s, maxFrag(s));
    });
  }

  /* __CODECK_EDITOR_ENGINE__ */

  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        if (isEditor) { e.preventDefault(); saveEditedHTML(); }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if ((e.key === 'e' || e.key === 'E') && !isPresenter && !isPrint) {
        e.preventDefault();
        if (inOverview) toggleOverview();
        toggleEditor();
        return;
      }

      if (isEditor) {
        if (e.key === 'Escape') {
          e.preventDefault();
          if (isMarkMode) toggleMarkMode();
          else toggleEditor();
        }
        return;
      }

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
