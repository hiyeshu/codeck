  /**
   * [INPUT]: 依赖 render-engine.js 的 slides/editor 状态与模板常量。
   * [OUTPUT]: 提供编辑模式、图片替换、标注、反馈导出函数。
   * [POS]: skills/codeck/scripts 的编辑器扩展,由 assemble.sh 插入核心 IIFE。
   * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
   */

  var editorToolbar = null;
  var isMarkMode = false;
  var ckMarks = [];
  var ckMarkSeq = 0;

  function toggleEditor() {
    if (isPresenter || isPrint) return;
    if (inOverview) toggleOverview();
    isEditor = !isEditor;
    var app = document.getElementById('app');
    app.classList.toggle('editor-mode', isEditor);

    slides.forEach(function (s) {
      if (isEditor) {
        s.setAttribute('contenteditable', 'true');
      } else {
        s.removeAttribute('contenteditable');
      }
    });

    slides.forEach(function (s) {
      s.querySelectorAll('img').forEach(function (img) {
        if (isEditor) img.setAttribute('contenteditable', 'false');
        else img.removeAttribute('contenteditable');
      });
    });

    if (isEditor) {
      bindImageEditing();
      showEditorToolbar();
      var tb = document.getElementById('slide-toolbar');
      if (tb) tb.classList.add('tb-visible');
    } else {
      unbindImageEditing();
      hideEditorToolbar();
      var tb2 = document.getElementById('slide-toolbar');
      if (tb2) tb2.classList.remove('tb-visible');
    }
  }

  function showEditorToolbar() {
    if (editorToolbar) return;
    editorToolbar = document.createElement('div');
    editorToolbar.id = 'editor-toolbar';
    editorToolbar.innerHTML = EDITOR_TOOLBAR_HTML;
    document.getElementById('app').appendChild(editorToolbar);
    editorToolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var a = btn.dataset.act;
      if (a === 'exit') toggleEditor();
      else if (a === 'save') saveEditedHTML();
      else if (a === 'mark') toggleMarkMode();
      else if (a === 'feedback') exportFeedback();
      else if (a === 'undo') document.execCommand('undo');
      else if (a === 'redo') document.execCommand('redo');
    });
  }

  function hideEditorToolbar() {
    if (editorToolbar) {
      editorToolbar.parentNode.removeChild(editorToolbar);
      editorToolbar = null;
    }
  }

  /* ─── Image editing ─── */
  function bindImageEditing() {
    slides.forEach(function (s) {
      s.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('click', onImageClick);
        img.addEventListener('dragover', onImageDragOver);
        img.addEventListener('dragleave', onImageDragLeave);
        img.addEventListener('drop', onImageDrop);
      });
      s.querySelectorAll('[data-img-slot]').forEach(function (slot) {
        slot.addEventListener('click', onSlotClick);
        slot.addEventListener('dragover', onImageDragOver);
        slot.addEventListener('dragleave', onImageDragLeave);
        slot.addEventListener('drop', onSlotDrop);
      });
    });
  }

  function unbindImageEditing() {
    slides.forEach(function (s) {
      s.querySelectorAll('img').forEach(function (img) {
        img.removeEventListener('click', onImageClick);
        img.removeEventListener('dragover', onImageDragOver);
        img.removeEventListener('dragleave', onImageDragLeave);
        img.removeEventListener('drop', onImageDrop);
      });
      s.querySelectorAll('[data-img-slot]').forEach(function (slot) {
        slot.removeEventListener('click', onSlotClick);
        slot.removeEventListener('dragover', onImageDragOver);
        slot.removeEventListener('dragleave', onImageDragLeave);
        slot.removeEventListener('drop', onSlotDrop);
      });
    });
  }

  function onImageClick(e) {
    if (!isEditor) return;
    e.preventDefault();
    var img = e.currentTarget;
    pickImage(function (dataUrl) { img.src = dataUrl; });
  }

  function onSlotClick(e) {
    if (!isEditor) return;
    var slot = e.currentTarget;
    if (slot.querySelector('img')) return;
    e.preventDefault();
    pickImage(function (dataUrl) { fillSlot(slot, dataUrl); });
  }

  function onImageDragOver(e) {
    if (!isEditor) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  }

  function onImageDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function onImageDrop(e) {
    if (!isEditor) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    var img = e.currentTarget;
    readImageFile(file, function (dataUrl) { img.src = dataUrl; });
  }

  function onSlotDrop(e) {
    if (!isEditor) return;
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    var slot = e.currentTarget;
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    readImageFile(file, function (dataUrl) { fillSlot(slot, dataUrl); });
  }

  function fillSlot(slot, dataUrl) {
    var existing = slot.querySelector('img');
    if (existing) {
      existing.src = dataUrl;
      return;
    }
    var img = document.createElement('img');
    img.src = dataUrl;
    img.setAttribute('contenteditable', 'false');
    slot.appendChild(img);
    slot.classList.add('slot-filled');
    img.addEventListener('click', onImageClick);
    img.addEventListener('dragover', onImageDragOver);
    img.addEventListener('dragleave', onImageDragLeave);
    img.addEventListener('drop', onImageDrop);
  }

  function pickImage(cb) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (file) readImageFile(file, cb);
    };
    input.click();
  }

  function readImageFile(file, cb) {
    var reader = new FileReader();
    reader.onload = function () { cb(reader.result); };
    reader.readAsDataURL(file);
  }

  function saveEditedHTML() {
    var clone = document.documentElement.cloneNode(true);
    var app = clone.querySelector('#app');
    if (app) {
      app.classList.remove('editor-mode');
      var etb = clone.querySelector('#editor-toolbar');
      if (etb) etb.parentNode.removeChild(etb);
      clone.querySelectorAll('[contenteditable]').forEach(function (el) {
        el.removeAttribute('contenteditable');
      });
      clone.querySelectorAll('.drag-over').forEach(function (el) {
        el.classList.remove('drag-over');
      });
      clone.querySelectorAll('.slot-filled').forEach(function (el) {
        el.classList.remove('slot-filled');
      });
      clone.querySelectorAll('.tb-visible').forEach(function (el) {
        el.classList.remove('tb-visible');
      });
    }

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;

    var path = location.pathname || '';
    var filename = path.split('/').pop() || 'slides.html';
    if (!/\.html?$/i.test(filename)) filename = 'slides.html';
    filename = filename.replace(/\.html?$/i, '') + '-edited.html';

    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ═══════════════════════════════════════
     Annotation (mark) mode — pin comments + highlight instructions.
     Toggle: M key or editor toolbar Mark button.
     Marks persist in DOM as data-ck-mark + serialized to #app[data-ck-marks].
     Export via exportFeedback().
     ═══════════════════════════════════════ */
  function toggleMarkMode() {
    if (!isEditor) return;
    isMarkMode = !isMarkMode;
    var app = document.getElementById('app');
    app.classList.toggle('mark-mode', isMarkMode);
    var btn = document.getElementById('ed-mark-btn');
    if (btn) btn.classList.toggle('ed-btn-active', isMarkMode);
    if (isMarkMode) {
      document.addEventListener('click', onMarkClick, true);
      document.addEventListener('mouseup', onMarkSelection, true);
    } else {
      document.removeEventListener('click', onMarkClick, true);
      document.removeEventListener('mouseup', onMarkSelection, true);
    }
  }

  function onMarkClick(e) {
    if (!isMarkMode) return;
    /* Ignore clicks on editor chrome */
    if (e.target.closest('#editor-toolbar') || e.target.closest('#slide-toolbar')) return;
    /* Ignore clicks on existing pins */
    if (e.target.closest('.ck-pin')) return;
    var slide = e.target.closest('.slide');
    if (!slide) return;
    e.preventDefault();
    e.stopPropagation();
    var target = e.target;
    /* If target is a pin or mark, don't re-mark */
    if (target.hasAttribute && target.hasAttribute('data-ck-mark')) return;
    var comment = window.prompt('Mark comment (leave empty to cancel):');
    if (!comment) return;
    addMark(slide, target, 'pin', comment);
  }

  function onMarkSelection() {
    if (!isMarkMode) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    var text = sel.toString().trim();
    if (!text) return;
    var range = sel.getRangeAt(0);
    var slide = range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer.closest('.slide')
      : (range.commonAncestorContainer.parentElement && range.commonAncestorContainer.parentElement.closest('.slide'));
    if (!slide) { sel.removeAllRanges(); return; }
    /* Only wrap if selection is within a single slide and not crossing block boundaries badly */
    try {
      var markEl = document.createElement('mark');
      markEl.setAttribute('data-ck-mark-type', 'highlight');
      range.surroundContents(markEl);
      var comment = window.prompt('Instruction for "' + (text.length > 30 ? text.slice(0, 30) + '…' : text) + '":', '');
      if (comment === null) {
        /* Cancelled — unwrap */
        var parent = markEl.parentNode;
        while (markEl.firstChild) parent.insertBefore(markEl.firstChild, markEl);
        parent.removeChild(markEl);
        sel.removeAllRanges();
        return;
      }
      addMark(slide, markEl, 'highlight', comment, text);
      sel.removeAllRanges();
    } catch (err) {
      /* surroundContents fails across partial node boundaries — silently ignore */
      sel.removeAllRanges();
    }
  }

  function addMark(slide, target, type, comment, excerpt) {
    var id = 'ck-mark-' + (++ckMarkSeq);
    if (target.setAttribute) target.setAttribute('data-ck-mark', id);
    var slideIdx = slides.indexOf(slide);
    var entry = {
      id: id,
      slide: slideIdx + 1,
      type: type,
      comment: comment,
      excerpt: excerpt || null
    };
    if (type === 'pin') {
      entry.selector = describeSelector(target);
      renderPin(slide, target, id, comment);
    } else {
      entry.selector = describeSelector(target);
    }
    ckMarks.push(entry);
    serializeMarks();
  }

  function describeSelector(el) {
    var parts = [];
    while (el && el.nodeType === 1 && !el.classList.contains('slide')) {
      var part = el.tagName.toLowerCase();
      if (el.id) part += '#' + el.id;
      if (el.className && typeof el.className === 'string') {
        var cls = el.className.split(/\s+/).filter(function (c) {
          return c && c.indexOf('ck-') !== 0 && c.indexOf('active') !== 0 && c.indexOf('visible') !== 0 && c.indexOf('drag-over') !== 0 && c.indexOf('slot-filled') !== 0;
        });
        if (cls.length) part += '.' + cls.join('.');
      }
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function renderPin(slide, target, id, comment) {
    var pin = document.createElement('div');
    pin.className = 'ck-pin';
    pin.setAttribute('data-ck-pin-for', id);
    pin.innerHTML = '<span class="ck-pin-dot"></span><span class="ck-pin-bubble">' + escapeHTML(comment) + '<span class="ck-pin-close" data-ck-pin-close="' + id + '">×</span></span>';
    /* Position near target */
    var rect = target.getBoundingClientRect();
    var slideRect = slide.getBoundingClientRect();
    pin.style.left = (rect.left - slideRect.left + rect.width / 2) + 'px';
    pin.style.top = (rect.top - slideRect.top) + 'px';
    slide.appendChild(pin);
    pin.querySelector('.ck-pin-close').addEventListener('click', function (e) {
      e.stopPropagation();
      removeMark(id);
    });
  }

  function removeMark(id) {
    ckMarks = ckMarks.filter(function (m) { return m.id !== id; });
    var el = document.querySelector('[data-ck-mark="' + id + '"]');
    if (el) {
      if (el.tagName === 'MARK') {
        var parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
      } else {
        el.removeAttribute('data-ck-mark');
      }
    }
    var pin = document.querySelector('[data-ck-pin-for="' + id + '"]');
    if (pin) pin.parentNode.removeChild(pin);
    serializeMarks();
  }

  function serializeMarks() {
    var app = document.getElementById('app');
    if (app) app.setAttribute('data-ck-marks', JSON.stringify(ckMarks));
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ─── Export feedback (markdown sidecar) ─── */
  function exportFeedback() {
    if (!isEditor) return;
    var path = location.pathname || '';
    var filename = path.split('/').pop() || 'slides.html';
    if (!/\.html?$/i.test(filename)) filename = 'slides.html';
    var revMatch = filename.match(/-r(\d+)\.html?$/i);
    var rev = revMatch ? 'r' + revMatch[1] : 'r1';
    var stem = filename.replace(/\.html?$/i, '').replace(/-r\d+$/i, '');

    var lines = [];
    lines.push('---');
    lines.push('deck: ' + stem);
    lines.push('revision: ' + rev);
    lines.push('exported_at: ' + new Date().toISOString());
    lines.push('source: ' + filename);
    lines.push('---');
    lines.push('');
    lines.push('# 反馈清单 (Feedback)');
    lines.push('');
    lines.push('由 codeck 编辑器导出。把本文件放进 deck room (`~/.codeck/projects/{slug}/`) 后,下次 `/codeck` 会自动消费。');
    lines.push('');

    /* Edits: text changes per slide */
    lines.push('## 编辑改动 (Edits)');
    lines.push('');
    var imgCount = 0;
    var imgAttachments = [];
    slides.forEach(function (s, i) {
      var slideNum = i + 1;
      var notes = s.getAttribute('data-notes') || '';
      var titleEl = s.querySelector('h1, h2, h3');
      var title = titleEl ? titleEl.textContent.trim().slice(0, 60) : '(无标题)';
      lines.push('### Slide ' + slideNum + ' — "' + title + '"');
      if (notes) lines.push('  data-notes: ' + notes);
      /* Text content (current state) */
      var textContent = s.textContent.replace(/\s+/g, ' ').trim();
      if (textContent) {
        lines.push('  当前文本: ' + (textContent.length > 200 ? textContent.slice(0, 200) + '…' : textContent));
      }
      /* Images */
      var imgs = s.querySelectorAll('img');
      imgs.forEach(function (img, j) {
        var src = img.getAttribute('src') || '';
        if (src.indexOf('data:') === 0) {
          imgCount++;
          var imgName = 'feedback-img-' + imgCount + '.png';
          lines.push('  - 图片[' + (j + 1) + ']: data URI (见 ' + imgName + ')');
          imgAttachments.push({ name: imgName, dataUrl: src });
        } else {
          lines.push('  - 图片[' + (j + 1) + ']: ' + src);
        }
      });
      lines.push('');
    });

    /* Annotations */
    if (ckMarks.length) {
      lines.push('## 标注 (Annotations)');
      lines.push('');
      var bySlide = {};
      ckMarks.forEach(function (m) {
        if (!bySlide[m.slide]) bySlide[m.slide] = [];
        bySlide[m.slide].push(m);
      });
      Object.keys(bySlide).forEach(function (sn) {
        lines.push('### Slide ' + sn);
        bySlide[sn].forEach(function (m) {
          if (m.type === 'pin') {
            lines.push('  - [pin] 元素 `' + (m.selector || '?') + '`: "' + m.comment + '"');
          } else {
            lines.push('  - [highlight] 选中文本 "' + (m.excerpt || '') + '": "' + m.comment + '"');
          }
        });
        lines.push('');
      });
    } else {
      lines.push('## 标注 (Annotations)');
      lines.push('');
      lines.push('(无标注)');
      lines.push('');
    }

    /* New images */
    if (imgAttachments.length) {
      lines.push('## 新增图片 (New images)');
      lines.push('');
      lines.push('以下 base64 图片需保存到 deck room `assets/` 目录,并在 slides.html 里用 `<img src="assets/{name}">` 引用:');
      lines.push('');
      imgAttachments.forEach(function (att) {
        lines.push('### ' + att.name);
        lines.push('');
        lines.push('```');
        lines.push(att.dataUrl);
        lines.push('```');
        lines.push('');
      });
    }

    var md = lines.join('\n');
    var mdFilename = 'feedback-' + stem + '-' + rev + '.md';
    downloadText(md, mdFilename, 'text/markdown;charset=utf-8');

    /* Also download each image separately */
    imgAttachments.forEach(function (att) {
      try {
        var b64 = att.dataUrl.split(',')[1];
        var mime = (att.dataUrl.match(/^data:([^;]+)/) || [])[1] || 'image/png';
        var byteString = atob(b64);
        var len = byteString.length;
        var arr = new Uint8Array(len);
        for (var i = 0; i < len; i++) arr[i] = byteString.charCodeAt(i);
        var blob = new Blob([arr], { type: mime });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = att.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      } catch (e) { /* skip bad data URI */ }
    });
  }

  function downloadText(text, filename, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
