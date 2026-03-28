/* ─── codeck engine v1.0 ─── */
/* 翻页引擎：导航、fragment、overview、演讲者模式 */
/* 此文件由 assemble.sh 原样嵌入 HTML，AI 不修改 */

(function () {
  'use strict';

  /* ─── 常量 ─── */
  var REF_W = 1280;
  var REF_H = 720;

  /* ─── 状态 ─── */
  var slides = [];
  var cur = 0;
  var frag = 0;
  var inOverview = false;
  var isPresenter = /[?&]presenter/.test(location.search);
  var channel = null;

  /* ─── 初始化 ─── */
  function init() {
    slides = Array.from(document.querySelectorAll('.slide'));
    if (!slides.length) return;
    createUI();
    channel = new BroadcastChannel('codeck-sync');
    channel.onmessage = onSync;
    if (isPresenter) initPresenter();
    goto(0);
    bindKeys();
    bindTouch();
    fouc();
  }

  /* ─── FOUC 防护 ─── */
  function fouc() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.getElementById('app').classList.add('ready');
      });
    });
  }

  /* ─── 导航 ─── */
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
    if (isPresenter) updatePresenter();
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

  /* ─── Fragment ─── */
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
      sync({ t: 'f', s: cur, f: frag });
      if (isPresenter) updatePresenter();
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
      sync({ t: 'f', s: cur, f: frag });
      if (isPresenter) updatePresenter();
    } else if (cur > 0) {
      goto(cur - 1);
      var p = slides[cur];
      frag = maxFrag(p);
      showUpTo(p, frag);
    }
  }

  /* ─── Overview ─── */
  function toggleOverview() {
    inOverview = !inOverview;
    var app = document.getElementById('app');
    app.classList.toggle('overview', inOverview);
    slides.forEach(function (s, i) {
      if (inOverview) {
        s.classList.add('active');
        s.onclick = function () { toggleOverview(); goto(i); };
      } else {
        if (i !== cur) s.classList.remove('active');
        s.onclick = null;
      }
    });
  }

  /* ─── BroadcastChannel 同步 ─── */
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
      if (isPresenter) updatePresenter();
    } else if (d.t === 'sync?' && !isPresenter) {
      sync({ t: 'g', s: cur });
      if (frag > 0) sync({ t: 'f', s: cur, f: frag });
    }
  }

  /* ─── 演讲者模式 ─── */
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
      '<div class="presenter-panel presenter-main">',
      '  <div class="presenter-label">Current</div>',
      '  <div class="presenter-viewport" id="pv-cur"></div>',
      '</div>',
      '<div class="presenter-panel presenter-next">',
      '  <div class="presenter-label">Next</div>',
      '  <div class="presenter-viewport" id="pv-next"></div>',
      '</div>',
      '<div class="presenter-panel presenter-notes">',
      '  <div class="presenter-label">Notes</div>',
      '  <div class="presenter-notes-body" id="pv-notes"></div>',
      '</div>',
      '<div class="presenter-panel presenter-timer">',
      '  <span id="pv-time" class="presenter-time">00:00</span>',
      '  <button id="pv-start" class="presenter-btn">Start</button>',
      '  <button id="pv-reset" class="presenter-btn">Reset</button>',
      '</div>'
    ].join('\n');
    app.insertBefore(grid, app.firstChild);

    initTimer();
    sync({ t: 'sync?' });
  }

  function initTimer() {
    var secs = 0;
    var iv = null;
    var el = document.getElementById('pv-time');
    var startBtn = document.getElementById('pv-start');
    var resetBtn = document.getElementById('pv-reset');

    function fmt(s) {
      return String(Math.floor(s / 60)).padStart(2, '0') + ':' +
             String(s % 60).padStart(2, '0');
    }

    startBtn.onclick = function () {
      if (iv) {
        clearInterval(iv); iv = null;
        startBtn.textContent = 'Start';
      } else {
        iv = setInterval(function () { secs++; el.textContent = fmt(secs); }, 1000);
        startBtn.textContent = 'Pause';
      }
    };

    resetBtn.onclick = function () {
      secs = 0; el.textContent = '00:00';
      if (iv) { clearInterval(iv); iv = null; startBtn.textContent = 'Start'; }
    };
  }

  function updatePresenter() {
    var curEl = document.getElementById('pv-cur');
    var nextEl = document.getElementById('pv-next');
    var notesEl = document.getElementById('pv-notes');
    if (!curEl) return;

    renderPreview(curEl, cur, true);
    renderPreview(nextEl, cur + 1, false);
    notesEl.textContent = slides[cur].dataset.notes || '';
  }

  function renderPreview(container, idx, showFrags) {
    container.innerHTML = '';
    if (idx < 0 || idx >= slides.length) {
      container.innerHTML = '<div class="presenter-empty">\u2014</div>';
      return;
    }
    var clone = slides[idx].cloneNode(true);
    clone.style.cssText = [
      'display:flex', 'position:absolute', 'inset:auto',
      'width:' + REF_W + 'px', 'height:' + REF_H + 'px',
      'transform-origin:top left',
      'transform:scale(' + (container.clientWidth / REF_W) + ')'
    ].join(';');
    if (showFrags) showUpTo(clone, frag);
    container.appendChild(clone);
  }

  /* ─── UI 创建 ─── */
  function createUI() {
    var app = document.getElementById('app');

    var prog = document.createElement('div');
    prog.id = 'progress';
    prog.innerHTML = '<div id="progress-bar"></div>';
    app.appendChild(prog);

    var counter = document.createElement('div');
    counter.id = 'slide-counter';
    app.appendChild(counter);

    var nav = document.createElement('div');
    nav.className = 'mobile-nav';
    nav.innerHTML = [
      '<button class="mnav-btn" data-act="prev">\u25C0</button>',
      '<button class="mnav-btn" data-act="overview">\u25A0</button>',
      '<button class="mnav-btn" data-act="next">\u25B6</button>'
    ].join('');
    app.appendChild(nav);

    nav.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var a = btn.dataset.act;
      if (a === 'prev') prev();
      else if (a === 'next') next();
      else if (a === 'overview') toggleOverview();
    });
  }

  function updateProgress() {
    var bar = document.getElementById('progress-bar');
    var ctr = document.getElementById('slide-counter');
    if (bar) bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    if (ctr) ctr.textContent = (cur + 1) + ' / ' + slides.length;
  }

  /* ─── 键盘 ─── */
  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight': case ' ': case 'PageDown':
          e.preventDefault(); next(); break;
        case 'ArrowLeft': case 'PageUp':
          e.preventDefault(); prev(); break;
        case 'ArrowDown':
          e.preventDefault(); stepDown(); break;
        case 'ArrowUp':
          e.preventDefault(); stepUp(); break;
        case 'Escape':
          e.preventDefault(); toggleOverview(); break;
        case 'p': case 'P':
          if (!isPresenter) openPresenter(); break;
      }
    });
  }

  /* ─── 触摸 ─── */
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
      if (dx < 0) next(); else prev();
    }, { passive: true });
  }

  /* ─── 启动 ─── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
