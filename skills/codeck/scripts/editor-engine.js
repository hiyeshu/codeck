  /**
   * [INPUT]: 依赖 render-engine.js 的 slides/editor 状态与模板常量。
   * [OUTPUT]: 提供编辑模式、可观察 UI 节点、文字/图片 source write、Ask Codex 请求和低干扰反馈导出函数。
   * [POS]: skills/codeck/scripts 的编辑器扩展,把 HTML deck 变成 agent 可感知主画布。
   * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
   */

  var editorToolbar = null;
  var agentDialog = null;
  var agentMarker = null;
  var lastAgentTarget = null;
  var agentStatusTimer = null;
  var isMarkMode = false;
  var ckObservationBound = false;
  var ckSelectedNode = null;
  var ckLastSelectionKey = '';
  var ckInputTimer = null;
  var ckLastInputTarget = null;
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
      activateObservableSurface();
      bindImageEditing();
      bindAgentMarkerCapture();
      showEditorToolbar();
      showAgentDialog();
      var tb = document.getElementById('slide-toolbar');
      if (tb) tb.classList.add('tb-visible');
    } else {
      deactivateObservableSurface();
      unbindImageEditing();
      unbindAgentMarkerCapture();
      hideEditorToolbar();
      hideAgentDialog();
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
      recordControlEvent('editor-toolbar', a, btn);
      if (a === 'exit') toggleEditor();
      else if (a === 'save') saveEditedHTML();
      else if (a === 'agent') toggleAgentDialog();
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

  /* ─── Observable deck surface ─── */
  function activateObservableSurface() {
    assignDeckElementIds();
    if (ckObservationBound) return;
    ckObservationBound = true;
    document.addEventListener('click', observeDeckClick, true);
    document.addEventListener('input', observeDeckInput, true);
  }

  function deactivateObservableSurface() {
    if (!ckObservationBound) return;
    ckObservationBound = false;
    document.removeEventListener('click', observeDeckClick, true);
    document.removeEventListener('input', observeDeckInput, true);
    clearSelectedNode();
  }

  function assignDeckElementIds() {
    slides.forEach(function (slide, i) {
      if (!slide.getAttribute('data-ck-id')) slide.setAttribute('data-ck-id', 'slide-' + padNumber(i + 1));
      if (!slide.getAttribute('data-ck-source')) slide.setAttribute('data-ck-source', 'slides.html');
      slide.querySelectorAll('*').forEach(function (el) {
        if (isEditorChrome(el)) return;
        if (!el.getAttribute('data-ck-id')) el.setAttribute('data-ck-id', 's' + padNumber(i + 1) + '-' + elementPath(slide, el));
        if (!el.getAttribute('data-ck-source')) el.setAttribute('data-ck-source', 'slides.html');
      });
    });
  }

  function padNumber(n) {
    return String(n).padStart(3, '0');
  }

  function elementPath(slide, el) {
    var parts = [];
    while (el && el.nodeType === 1 && el !== slide) {
      parts.unshift(el.tagName.toLowerCase() + nthOfType(el));
      el = el.parentElement;
    }
    return parts.join('-') || 'root';
  }

  function nthOfType(el) {
    var n = 1;
    var tag = el.tagName;
    var cur = el;
    while ((cur = cur.previousElementSibling)) {
      if (cur.tagName === tag) n++;
    }
    return String(n).padStart(2, '0');
  }

  function isEditorChrome(el) {
    return !!(el && el.closest && el.closest('#editor-toolbar, #agent-dialog, #slide-toolbar, .ck-pin'));
  }

  function observeDeckClick(e) {
    if (!isEditor || isEditorChrome(e.target)) return;
    var slide = e.target.closest && e.target.closest('.slide');
    if (!slide) return;
    var target = e.target === slide ? slide : (e.target.closest('[data-ck-id]') || e.target);
    selectUiNode(target, 'click', e);
  }

  function observeDeckInput(e) {
    if (!isEditor) return;
    var slide = e.target.closest && e.target.closest('.slide');
    if (!slide) return;
    var target = e.target.closest('[data-ck-id]') || slide;
    var selEl = selectionElement(window.getSelection && window.getSelection());
    if (selEl && selEl.closest && selEl.closest('.slide') === slide) {
      var selectedTarget = selEl.closest('[data-ck-id]');
      if (selectedTarget && selectedTarget !== slide) target = selectedTarget;
    }
    ckLastInputTarget = target;
    clearTimeout(ckInputTimer);
    ckInputTimer = setTimeout(function () {
      if (!ckLastInputTarget) return;
      saveTextEdit(ckLastInputTarget, {
        action: 'input',
        text: trimExcerpt(ckLastInputTarget.innerText || ckLastInputTarget.textContent || '', 1000)
      });
    }, 450);
  }

  function selectUiNode(target, reason, event) {
    assignDeckElementIds();
    var slide = target && target.closest ? target.closest('.slide') : null;
    if (!slide) return;
    clearSelectedNode();
    ckSelectedNode = target;
    if (ckSelectedNode.classList) ckSelectedNode.classList.add('ck-selected-node');
    var payload = {
      kind: 'ui-selection',
      action: reason || 'select',
      node: describeUiNode(target, slide),
      pointer: event ? { x: Math.round(event.clientX), y: Math.round(event.clientY) } : null,
      deck: currentDeckInfo(),
      selectedAt: new Date().toISOString()
    };
    var key = payload.node.ckId + ':' + payload.action + ':' + payload.node.slide;
    if (key !== ckLastSelectionKey) {
      ckLastSelectionKey = key;
      postLocalJSON('/api/selection', payload, function () {});
    }
  }

  function clearSelectedNode() {
    if (ckSelectedNode && ckSelectedNode.classList) ckSelectedNode.classList.remove('ck-selected-node');
    ckSelectedNode = null;
  }

  function recordControlEvent(zone, action, target) {
    postLocalJSON('/api/events', {
      kind: 'ui-control',
      zone: zone,
      action: action,
      node: target ? {
        role: 'control',
        text: trimExcerpt(target.innerText || target.getAttribute('aria-label') || action, 160)
      } : null,
      deck: currentDeckInfo(),
      slide: cur + 1,
      happenedAt: new Date().toISOString()
    }, function () {});
  }

  function recordUiEvent(kind, target, extra) {
    var slide = target && target.closest ? target.closest('.slide') : slides[cur];
    postLocalJSON('/api/events', {
      kind: kind,
      node: describeUiNode(target, slide),
      deck: currentDeckInfo(),
      slide: (slides.indexOf(slide) + 1) || cur + 1,
      details: extra || {},
      happenedAt: new Date().toISOString()
    }, function () {});
  }

  function saveTextEdit(target, details) {
    var text = details && details.text ? details.text : trimExcerpt(target.innerText || target.textContent || '', 1000);
    postLocalJSON('/api/source/text', {
      kind: 'edit-text',
      node: describeUiNode(target),
      text: text,
      details: details || {},
      deck: currentDeckInfo(),
      happenedAt: new Date().toISOString()
    }, function (ok) {
      if (!ok) {
        recordUiEvent('ui-edit', target, { action: 'input', text: text, sourceWrite: 'failed' });
      }
    });
  }

  function saveImageReplacement(target, dataUrl, file, details, done) {
    postLocalJSON('/api/source/image', {
      kind: 'replace-image',
      node: describeUiNode(target),
      dataUrl: dataUrl,
      fileName: file && file.name ? file.name : 'image.png',
      mimeType: file && file.type ? file.type : '',
      size: file && file.size ? file.size : 0,
      details: details || {},
      deck: currentDeckInfo(),
      happenedAt: new Date().toISOString()
    }, function (ok, result) {
      if (ok && result && result.asset && done) done(result.asset);
      if (!ok) {
        recordUiEvent('ui-image-change', target, Object.assign({ sourceWrite: 'failed' }, details || {}));
      }
    });
  }

  function currentDeckInfo() {
    return {
      title: document.title,
      url: location.href,
      slideCount: slides.length
    };
  }

  function selectionElement(sel) {
    if (!sel || !sel.rangeCount) return null;
    var node = sel.getRangeAt(0).commonAncestorContainer;
    return node.nodeType === 1 ? node : node.parentElement;
  }

  function inferRole(el) {
    if (!el) return 'unknown';
    if (el.classList && el.classList.contains('slide')) return 'slide';
    var tag = (el.tagName || '').toLowerCase();
    if (/^h[1-6]$/.test(tag)) return 'heading';
    if (tag === 'img') return 'image';
    if (tag === 'a') return 'link';
    if (tag === 'button') return 'control';
    if (tag === 'li') return 'list-item';
    if (tag === 'ul' || tag === 'ol') return 'list';
    if (tag === 'table') return 'table';
    if (tag === 'figure') return 'figure';
    if (tag === 'p') return 'paragraph';
    return tag || 'element';
  }

  function safeAttr(value, limit) {
    value = String(value || '');
    if (value.indexOf('data:') === 0) return value.slice(0, 80) + '…';
    return value.slice(0, limit || 240);
  }

  function cleanClassName(value) {
    return String(value || '').split(/\s+/).filter(function (name) {
      return name && name.indexOf('ck-') !== 0 && name !== 'active' && name !== 'visible' && name !== 'drag-over' && name !== 'slot-filled';
    }).join(' ');
  }

  function rectPayload(rect, baseRect) {
    var payload = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    if (baseRect) {
      payload.relative = {
        x: Math.round(rect.left - baseRect.left),
        y: Math.round(rect.top - baseRect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    }
    return payload;
  }

  function describeUiNode(el, slide) {
    if (!slide && el && el.closest) slide = el.closest('.slide');
    if (!el) el = slide || slides[cur];
    if (!slide) slide = slides[cur];
    assignDeckElementIds();
    var slideIdx = slides.indexOf(slide);
    var rect = el.getBoundingClientRect();
    var slideRect = slide.getBoundingClientRect();
    var selector = el === slide ? '.slide.active' : describeSelector(el);
    var text = el.tagName === 'IMG'
      ? 'Image: ' + safeAttr(el.getAttribute('alt') || el.getAttribute('src') || '', 300)
      : trimExcerpt(el.innerText || el.textContent || '', 500);
    return {
      ckId: el.getAttribute('data-ck-id') || '',
      role: inferRole(el),
      tag: (el.tagName || '').toLowerCase(),
      slide: slideIdx + 1,
      selector: selector,
      bbox: rectPayload(rect, slideRect),
      text: text,
      state: {
        classes: cleanClassName(el.className && typeof el.className === 'string' ? el.className : ''),
        editable: el.getAttribute('contenteditable') || '',
        src: el.tagName === 'IMG' ? safeAttr(el.getAttribute('src') || '', 300) : '',
        alt: el.tagName === 'IMG' ? safeAttr(el.getAttribute('alt') || '', 300) : ''
      },
      sourceMap: {
        file: 'slides.html',
        styleFile: 'custom.css',
        slide: slideIdx + 1,
        ckId: el.getAttribute('data-ck-id') || '',
        selector: selector,
        elementPath: el === slide ? 'slide' : elementPath(slide, el)
      }
    };
  }

  /* ─── Ask Codex panel ─── */
  function toggleAgentDialog() {
    if (!isEditor) return;
    if (agentDialog) hideAgentDialog();
    else showAgentDialog();
  }

  function showAgentDialog() {
    if (agentDialog) {
      updateAgentDialog();
      return;
    }
    agentDialog = document.createElement('aside');
    agentDialog.id = 'agent-dialog';
    agentDialog.innerHTML = [
      '<div class="agent-head">',
      '  <div>',
      '    <div class="agent-kicker">Ask Codex</div>',
      '    <div class="agent-title" id="agent-slide-title">Current slide</div>',
      '  </div>',
      '  <button class="agent-icon-btn" data-agent-act="close" aria-label="Close">×</button>',
      '</div>',
      '<div class="agent-marker-card" id="agent-marker-card">',
      '  <div class="agent-shot">',
      '    <div class="agent-shot-bar"></div>',
      '    <div class="agent-shot-lines"><i></i><i></i><i></i></div>',
      '  </div>',
      '  <div class="agent-marker-copy">',
      '    <div class="agent-marker-label" id="agent-marker-label">Slide marker</div>',
      '    <div class="agent-marker-excerpt" id="agent-marker-excerpt">Select text or click a block, then capture it.</div>',
      '  </div>',
      '</div>',
      '<div class="agent-hint">Click an object on the slide, then tell Codex what to change.</div>',
      '<textarea id="agent-message" rows="5" placeholder="Tell Codex what to change here..."></textarea>',
      '<button class="agent-send" data-agent-act="send">Send to Codex</button>',
      '<div class="agent-status" id="agent-status">Codex can read sent requests from this deck room.</div>'
    ].join('');
    document.getElementById('app').appendChild(agentDialog);
    agentDialog.addEventListener('click', onAgentDialogClick);
    agentMarker = buildAgentMarker('slide');
    updateAgentDialog();
  }

  function hideAgentDialog() {
    if (!agentDialog) return;
    agentDialog.parentNode.removeChild(agentDialog);
    agentDialog = null;
  }

  function onAgentDialogClick(e) {
    var btn = e.target.closest('[data-agent-act]');
    if (!btn) return;
    var act = btn.dataset.agentAct;
    if (act === 'close') hideAgentDialog();
    else if (act === 'send') {
      sendAgentMessage();
    }
  }

  function bindAgentMarkerCapture() {
    document.addEventListener('click', rememberAgentTarget, true);
    document.addEventListener('selectionchange', rememberAgentSelection);
  }

  function unbindAgentMarkerCapture() {
    document.removeEventListener('click', rememberAgentTarget, true);
    document.removeEventListener('selectionchange', rememberAgentSelection);
  }

  function rememberAgentTarget(e) {
    if (!isEditor) return;
    if (e.target.closest('#editor-toolbar') || e.target.closest('#agent-dialog') || e.target.closest('#slide-toolbar')) return;
    var slide = e.target.closest('.slide');
    if (!slide) return;
    lastAgentTarget = e.target === slide ? slide : e.target;
    var sel = window.getSelection && window.getSelection();
    if (agentDialog && !(sel && sel.toString().trim())) {
      agentMarker = buildAgentMarker('block');
      updateAgentDialog();
    }
  }

  function rememberAgentSelection() {
    if (!isEditor || !agentDialog) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
    var slide = selectionSlide(sel);
    if (!slide) return;
    agentMarker = buildAgentMarker('selection');
    updateAgentDialog();
  }

  function selectionSlide(sel) {
    if (!sel || !sel.rangeCount) return null;
    var node = sel.getRangeAt(0).commonAncestorContainer;
    var el = node.nodeType === 1 ? node : node.parentElement;
    return el && el.closest ? el.closest('.slide') : null;
  }

  function currentSlideTitle(slide) {
    var h = slide && slide.querySelector('h1, h2, h3');
    return h ? h.textContent.replace(/\s+/g, ' ').trim().slice(0, 90) : 'Untitled slide';
  }

  function trimExcerpt(text, n) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, n || 220);
  }

  function buildAgentMarker(mode) {
    var slide = slides[cur];
    var marker = {
      type: mode || 'slide',
      slide: cur + 1,
      title: currentSlideTitle(slide),
      selector: '',
      excerpt: '',
      ckId: '',
      role: '',
      bbox: null,
      sourceMap: null,
      uiNode: null,
      capturedAt: new Date().toISOString()
    };
    var sel = window.getSelection();
    var selectedText = sel && !sel.isCollapsed && selectionSlide(sel) === slide ? trimExcerpt(sel.toString(), 500) : '';
    if ((mode === 'selection' || selectedText) && selectedText) {
      var selectionNode = selectionElement(sel) || slide;
      var selectionUiNode = describeUiNode(selectionNode, slide);
      var rangeRect = sel.rangeCount ? sel.getRangeAt(0).getBoundingClientRect() : selectionNode.getBoundingClientRect();
      marker.type = 'selection';
      marker.excerpt = selectedText;
      marker.selector = 'selection';
      marker.ckId = selectionUiNode.ckId;
      marker.role = selectionUiNode.role;
      marker.bbox = rectPayload(rangeRect, slide.getBoundingClientRect());
      marker.sourceMap = selectionUiNode.sourceMap;
      marker.uiNode = selectionUiNode;
      return marker;
    }
    var target = mode === 'slide' ? slide : (lastAgentTarget || document.activeElement || slide);
    if (!target || !target.closest || !target.closest('.slide')) target = slide;
    var uiNode = describeUiNode(target, slide);
    marker.type = target === slide ? 'slide' : 'block';
    marker.selector = uiNode.selector;
    marker.excerpt = uiNode.text || marker.title;
    marker.tag = target.tagName ? target.tagName.toLowerCase() : '';
    marker.ckId = uiNode.ckId;
    marker.role = uiNode.role;
    marker.bbox = uiNode.bbox;
    marker.sourceMap = uiNode.sourceMap;
    marker.uiNode = uiNode;
    return marker;
  }

  function updateAgentDialog() {
    if (!agentDialog) return;
    if (!agentMarker) agentMarker = buildAgentMarker('slide');
    var title = document.getElementById('agent-slide-title');
    var label = document.getElementById('agent-marker-label');
    var excerpt = document.getElementById('agent-marker-excerpt');
    if (title) title.textContent = 'Slide ' + agentMarker.slide + ' · ' + agentMarker.title;
    if (label) label.textContent = agentMarkerLabel(agentMarker);
    if (excerpt) excerpt.textContent = agentMarker.excerpt || 'No text in this marker.';
  }

  function agentMarkerLabel(marker) {
    if (!marker) return 'Whole slide';
    if (marker.type === 'selection') return 'Selected text';
    if (marker.type === 'block') {
      var role = marker.role || marker.tag || 'block';
      return 'Selected ' + role;
    }
    return 'Whole slide';
  }

  function setAgentStatus(text, isError) {
    var el = document.getElementById('agent-status');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('agent-status-error', !!isError);
    clearTimeout(agentStatusTimer);
    agentStatusTimer = setTimeout(function () {
      if (el && !isError) el.textContent = 'Codex can read sent requests from this deck room.';
    }, 5000);
  }

  function postLocalJSON(path, payload, cb) {
    if (!/^https?:$/.test(location.protocol)) {
      cb(false, new Error('No local service for file:// pages.'));
      return;
    }
    fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (json) {
      cb(true, json);
    }).catch(function (err) {
      cb(false, err);
    });
  }

  function agentMessageMarkdown(payload) {
    return [
      '---',
      'source: codeck-agent-dialog',
      'created_at: ' + new Date().toISOString(),
      'slide: ' + payload.marker.slide,
      'type: ' + payload.marker.type,
      '---',
      '',
      '# Agent Request',
      '',
      payload.message,
      '',
      '## Marker',
      '',
      '- title: ' + payload.marker.title,
      '- ck_id: `' + (payload.marker.ckId || '') + '`',
      '- role: ' + (payload.marker.role || ''),
      '- selector: `' + (payload.marker.selector || '') + '`',
      '- source: `' + ((payload.marker.sourceMap && payload.marker.sourceMap.file) || 'slides.html') + '`',
      '- source_selector: `' + ((payload.marker.sourceMap && payload.marker.sourceMap.selector) || payload.marker.selector || '') + '`',
      '- bbox: `' + JSON.stringify(payload.marker.bbox || {}) + '`',
      '',
      '```',
      payload.marker.excerpt || '',
      '```',
      ''
    ].join('\n');
  }

  function sendAgentMessage() {
    if (!agentDialog) return;
    var textarea = document.getElementById('agent-message');
    var message = textarea ? textarea.value.trim() : '';
    if (!message) {
      setAgentStatus('Write a request for Codex first.', true);
      return;
    }
    if (!agentMarker) agentMarker = buildAgentMarker('block');
    var payload = {
      message: message,
      marker: agentMarker,
      deck: currentDeckInfo(),
      marks: ckMarks.slice()
    };
    setAgentStatus('Sending to Codex inbox...');
    postLocalJSON('/api/inbox', payload, function (ok, result) {
      if (ok) {
        if (textarea) textarea.value = '';
        setAgentStatus('Sent to Codex inbox: ' + (result.id || 'open request'));
      } else {
        var name = 'agent-message-slide-' + agentMarker.slide + '-' + Date.now() + '.md';
        downloadText(agentMessageMarkdown(payload), name, 'text/markdown;charset=utf-8');
        setAgentStatus('Local service unavailable; downloaded request sidecar.', true);
      }
    });
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
    pickImage(function (dataUrl, file) {
      img.src = dataUrl;
      saveImageReplacement(img, dataUrl, file, { action: 'file-picker' }, function (asset) {
        img.setAttribute('data-ck-asset-src', asset.src);
      });
    });
  }

  function onSlotClick(e) {
    if (!isEditor) return;
    var slot = e.currentTarget;
    if (slot.querySelector('img')) return;
    e.preventDefault();
    pickImage(function (dataUrl, file) { fillSlot(slot, dataUrl, file, { action: 'file-picker' }); });
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
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    var img = e.currentTarget;
    readImageFile(file, function (dataUrl) {
      img.src = dataUrl;
      saveImageReplacement(img, dataUrl, file, {
        action: 'drop',
        fileName: file.name,
        mimeType: file.type,
        size: file.size
      }, function (asset) {
        img.setAttribute('data-ck-asset-src', asset.src);
      });
    });
  }

  function onSlotDrop(e) {
    if (!isEditor) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    var slot = e.currentTarget;
    var file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    readImageFile(file, function (dataUrl) {
      fillSlot(slot, dataUrl, file, {
        action: 'drop',
        fileName: file.name,
        mimeType: file.type,
        size: file.size
      });
    });
  }

  function fillSlot(slot, dataUrl, file, details) {
    var existing = slot.querySelector('img');
    if (existing) {
      existing.src = dataUrl;
      saveImageReplacement(existing, dataUrl, file, details || { action: 'fill-slot' }, function (asset) {
        existing.setAttribute('data-ck-asset-src', asset.src);
      });
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
    assignDeckElementIds();
    saveImageReplacement(slot, dataUrl, file, details || { action: 'fill-slot' }, function (asset) {
      img.setAttribute('data-ck-asset-src', asset.src);
    });
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
    reader.onload = function () { cb(reader.result, file); };
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
      clone.querySelectorAll('.ck-selected-node').forEach(function (el) {
        el.classList.remove('ck-selected-node');
      });
    }

    var html = '<!DOCTYPE html>\n' + clone.outerHTML;

    var path = location.pathname || '';
    var filename = path.split('/').pop() || 'slides.html';
    if (!/\.html?$/i.test(filename)) filename = 'slides.html';
    filename = filename.replace(/\.html?$/i, '') + '-edited.html';

    postLocalJSON('/api/events', {
      kind: 'edited-html',
      deck: filename.replace(/-edited\.html?$/i, ''),
      fileName: filename,
      html: html,
      marker: agentMarker || buildAgentMarker('slide'),
      marks: ckMarks.slice(),
      slide: cur + 1,
      savedAt: new Date().toISOString()
    }, function (ok) {
      if (ok) {
        setAgentStatus('Saved HTML snapshot to deck room events.');
        return;
      }
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ═══════════════════════════════════════
     Annotation (mark) mode — legacy review pins + highlights.
     Hidden from the primary toolbar; Ask Codex is the default collaboration path.
     Marks persist in DOM as data-ck-mark + serialized to #app[data-ck-marks].
     Export via exportFeedback().
     ═══════════════════════════════════════ */
  function toggleMarkMode() {
    if (!isEditor) return;
    isMarkMode = !isMarkMode;
    var app = document.getElementById('app');
    app.classList.toggle('mark-mode', isMarkMode);
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
    saveOrDownloadFeedback(md, mdFilename, imgAttachments, stem, rev);
  }

  function downloadFeedbackFiles(md, mdFilename, imgAttachments) {
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

  function saveOrDownloadFeedback(md, mdFilename, imgAttachments, stem, rev) {
    postLocalJSON('/api/events', {
      kind: 'feedback',
      deck: stem,
      revision: rev,
      fileName: mdFilename,
      markdown: md,
      marker: agentMarker || buildAgentMarker('slide'),
      marks: ckMarks.slice(),
      imageCount: imgAttachments.length,
      exportedAt: new Date().toISOString()
    }, function (ok) {
      if (ok) {
        setAgentStatus('Saved feedback to deck room.');
        return;
      }
      downloadFeedbackFiles(md, mdFilename, imgAttachments);
      setAgentStatus('Local service unavailable; downloaded feedback sidecar.', true);
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
