(function (window, document) {
  'use strict';

  var VERSION = '0.6.1';
  var MODE_OFF = 'off';
  var MODE_SHADOW = 'shadow';
  var MODE_VIEW = 'view';
  var MODE_EDIT = 'edit';
  var STORAGE_KEY = 'ruian.filez.facade.mode';
  var STATE_KEY = '__RUIAN_FILEZ_FACADE_POC__';
  var CONTROL_KEY = '__RUIAN_FILEZ_FACADE_CONTROL__';
  var WINDOWS_KEY = '__RUIAN_FILEZ_FACADE_WINDOWS__';
  var BRIDGE_KEY = '__RUIAN_FILEZ_FACADE_BRIDGE_060__';
  var VIEWER_KEY = '__RUIAN_FILEZ_VIEWER_060__';
  var EDITOR_KEY = '__RUIAN_FILEZ_EDITOR_060__';
  var RESOLVER_QUEUE_KEY = '__SEEYON_OFFICE_ADAPTER_RESOLVERS__';
  var RESOLVER_NAME = 'ruian-filez-view-edit';
  var VIEW_ADAPTER_KEY = 'RUIAN_FILEZ_VIEW';
  var VIEW_ADAPTER_URL =
    '/apps_res/ruian-filez-facade-poc/viewer.js?v=' + VERSION;
  var EDIT_ADAPTER_KEY = 'RUIAN_FILEZ_EDIT';
  var EDIT_ADAPTER_URL =
    '/apps_res/ruian-filez-facade-poc/editor.js?v=' + VERSION;
  var ADMIN_PANEL_URL =
    '/apps_res/ruian-filez-facade-poc/admin-panel.js?v=' + VERSION;
  var BADGE_ID = 'ruian-filez-facade-poc-badge';
  var MAX_EVENTS = 200;
  var bootstrapScript = document.currentScript;

  function safeString(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function now() {
    return new Date().toISOString();
  }

  function queryValue(search, name) {
    var expression = new RegExp(
      '(?:^|[?&])' + name + '=([^&]*)(?:&|$)',
      'i'
    );
    var match = expression.exec(safeString(search));
    if (!match) {
      return '';
    }
    try {
      return decodeURIComponent(match[1].replace(/\+/g, ' '));
    } catch (ignore) {
      return match[1];
    }
  }

  function getRootWindow() {
    try {
      if (
        window.top &&
        window.top.location &&
        window.top.location.origin === window.location.origin
      ) {
        return window.top;
      }
    } catch (ignore) {
      // Cross-origin frames intentionally remain isolated.
    }
    return window;
  }

  function getSource() {
    var script =
      bootstrapScript ||
      document.getElementById('ruian-filez-facade-poc-bootstrap');
    return (
      (script && script.getAttribute('data-ruian-source')) ||
      'UNKNOWN'
    );
  }

  function normalizedMode(value) {
    return safeString(value).toLowerCase().replace(/\s+/g, '');
  }

  function validMode(value) {
    return (
      value === MODE_OFF ||
      value === MODE_SHADOW ||
      value === MODE_VIEW ||
      value === MODE_EDIT
    );
  }

  function modeRank(mode) {
    if (mode === MODE_EDIT) {
      return 3;
    }
    if (mode === MODE_VIEW) {
      return 2;
    }
    if (mode === MODE_SHADOW) {
      return 1;
    }
    return 0;
  }

  function serverModeFromScript() {
    var script =
      bootstrapScript ||
      document.getElementById('ruian-filez-facade-poc-bootstrap');
    var mode = normalizedMode(
      script && script.getAttribute('data-ruian-mode')
    );
    return validMode(mode) ? mode : MODE_OFF;
  }

  function clampMode(mode, serverMode) {
    mode = validMode(mode) ? mode : MODE_OFF;
    serverMode = validMode(serverMode) ? serverMode : MODE_OFF;
    return modeRank(mode) <= modeRank(serverMode) ? mode : serverMode;
  }

  function requestedTopMode(root, serverMode) {
    var requested = '';
    var stored = '';

    try {
      requested = normalizedMode(
        queryValue(root.location.search, 'filezFacade')
      );
    } catch (ignore) {
      requested = '';
    }

    if (requested) {
      if (!validMode(requested)) {
        requested = MODE_OFF;
      }
      return clampMode(requested, serverMode);
    }

    try {
      stored = normalizedMode(root.sessionStorage.getItem(STORAGE_KEY));
    } catch (ignoreRead) {
      stored = '';
    }
    if (
      validMode(stored) &&
      modeRank(stored) < modeRank(serverMode)
    ) {
      return stored;
    }
    if (stored) {
      try {
        root.sessionStorage.removeItem(STORAGE_KEY);
      } catch (ignoreCleanup) {
        // Invalid or non-downgrading stored values are ignored regardless.
      }
    }
    return serverMode;
  }

  function removeBadge(root) {
    var badge;
    try {
      badge = root.document.getElementById(BADGE_ID);
      if (badge && badge.parentNode) {
        badge.parentNode.removeChild(badge);
      }
    } catch (ignore) {
      // Diagnostics never affect the OfficeSDK path.
    }
  }

  function renderBadge(control) {
    var registry = control.registry;
    var registered = 0;
    var matched = 0;
    var ready = 0;
    var doc;
    var badge;
    var i;

    if (control.mode === MODE_OFF) {
      removeBadge(control.root);
      return;
    }

    try {
      doc = control.root.document;
    } catch (ignore) {
      return;
    }
    if (!doc || !doc.body) {
      return;
    }

    for (i = 0; i < registry.length; i += 1) {
      if (
        registry[i].installStatus === 'resolver-registered' ||
        registry[i].installStatus === 'resolver-queued'
      ) {
        registered += 1;
      }
      matched += registry[i].matchedCount || 0;
      ready += registry[i].readyCount || 0;
    }

    badge = doc.getElementById(BADGE_ID);
    if (!badge) {
      badge = doc.createElement('button');
      badge.id = BADGE_ID;
      badge.type = 'button';
      badge.style.cssText =
        'position:fixed;right:12px;bottom:12px;z-index:2147483647;' +
        'border:0;border-radius:6px;padding:8px 10px;background:#047857;' +
        'color:#fff;font:12px/1.4 Arial,sans-serif;' +
        'box-shadow:0 2px 10px rgba(0,0,0,.25);cursor:pointer;';
      badge.onclick = function () {
        if (control.root.console && control.root.console.table) {
          control.root.console.table(control.registry);
        }
      };
      doc.body.appendChild(badge);
    }

    badge.textContent =
      'FileZ Facade ' +
      VERSION +
      ' · 服务端 ' +
      control.serverMode.toUpperCase() +
      ' · ' +
      control.mode.toUpperCase() +
      ' · 窗口 ' +
      registry.length +
      ' · 解析器 ' +
      registered +
      ' · 命中 ' +
      matched +
      ' · 就绪 ' +
      ready;
    badge.title =
      control.mode === MODE_EDIT
        ? 'FileZ 查看与基础编辑已启用；高级公文操作仍回退致远原生适配器'
        : control.mode === MODE_VIEW
          ? 'FileZ 只读查看已启用'
          : '影子模式：只记录路由结果';
  }

  function ensureControl(root, serverMode) {
    var existing = root[CONTROL_KEY];
    var control;
    var serverModeChanged;

    if (existing && existing.version === VERSION) {
      serverModeChanged = existing.serverMode !== serverMode;
      existing.serverMode = serverMode;
      existing.syncFromTop('server-mode-sync', serverModeChanged);
      return existing;
    }

    removeBadge(root);
    control = {
      version: VERSION,
      root: root,
      serverMode: serverMode,
      mode: requestedTopMode(root, serverMode),
      epoch: 1,
      controllers: [],
      registry: []
    };

    control.publish = function (summary) {
      var i;
      if (control.mode === MODE_OFF) {
        return;
      }
      for (i = 0; i < control.registry.length; i += 1) {
        if (control.registry[i].id === summary.id) {
          control.registry[i] = summary;
          renderBadge(control);
          return;
        }
      }
      control.registry.push(summary);
      renderBadge(control);
    };

    control.register = function (controller) {
      if (control.controllers.indexOf(controller) < 0) {
        control.controllers.push(controller);
      }
      controller.onMode(control.mode, control.epoch);
    };

    control.unregister = function (controller) {
      var index = control.controllers.indexOf(controller);
      if (index >= 0) {
        control.controllers.splice(index, 1);
      }
    };

    function applyMode(mode, reason, forceNotify) {
      var controllers;
      var i;
      mode = validMode(mode) ? mode : MODE_OFF;
      mode = clampMode(mode, control.serverMode);
      if (control.mode === mode && !forceNotify) {
        renderBadge(control);
        return mode;
      }
      control.mode = mode;
      control.epoch += 1;
      if (mode === MODE_OFF) {
        control.registry.splice(0, control.registry.length);
        removeBadge(root);
      }
      controllers = control.controllers.slice();
      for (i = 0; i < controllers.length; i += 1) {
        try {
          controllers[i].onMode(mode, control.epoch, reason || 'mode-change');
        } catch (ignoreController) {
          // One frame cannot block the remaining frames.
        }
      }
      renderBadge(control);
      return mode;
    }

    control.setMode = function (mode, reason) {
      mode = normalizedMode(mode);
      mode = validMode(mode) ? mode : MODE_OFF;
      try {
        if (modeRank(mode) < modeRank(control.serverMode)) {
          root.sessionStorage.setItem(STORAGE_KEY, mode);
        } else {
          root.sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (ignore) {
        // The in-memory value remains authoritative for this page.
      }
      return control.syncFromTop(reason || 'mode-change');
    };

    control.syncFromTop = function (reason, forceNotify) {
      return applyMode(
        requestedTopMode(root, control.serverMode),
        reason || 'top-url-sync',
        forceNotify === true
      );
    };

    root[CONTROL_KEY] = control;
    root[WINDOWS_KEY] = control.registry;
    return control;
  }

  var root = getRootWindow();
  var control = ensureControl(root, serverModeFromScript());
  var existingState = window[STATE_KEY];

  if (
    existingState &&
    existingState.version === VERSION &&
    existingState.controller
  ) {
    existingState.duplicateLoads += 1;
    if (existingState.sources.indexOf(getSource()) < 0) {
      existingState.sources.push(getSource());
    }
    existingState.controller.sync();
    return;
  }

  var state = {
    id: safeString(Date.now()) + '-' + Math.random().toString(16).slice(2),
    version: VERSION,
    serverMode: control.serverMode,
    mode: control.mode,
    epoch: control.epoch,
    source: getSource(),
    sources: [getSource()],
    pathname: safeString(window.location && window.location.pathname),
    isTop: window === root,
    loadedAt: now(),
    installStatus: 'disabled',
    instanceCount: 0,
    matchedCount: 0,
    readyCount: 0,
    fallbackCount: 0,
    lastReason: '',
    duplicateLoads: 0,
    events: [],
    controller: null
  };
  window[STATE_KEY] = state;

  function stateSummary() {
    return {
      id: state.id,
      version: state.version,
      serverMode: state.serverMode,
      mode: state.mode,
      epoch: state.epoch,
      source: state.sources.join(','),
      pathname: state.pathname,
      isTop: state.isTop,
      installStatus: state.installStatus,
      instanceCount: state.instanceCount,
      matchedCount: state.matchedCount,
      readyCount: state.readyCount,
      fallbackCount: state.fallbackCount,
      lastReason: state.lastReason,
      eventCount: state.events.length
    };
  }

  function publish() {
    control.publish(stateSummary());
  }

  function record(type, detail) {
    var event = {
      at: now(),
      type: type,
      detail: detail || {}
    };
    state.events.push(event);
    if (state.events.length > MAX_EVENTS) {
      state.events.splice(0, state.events.length - MAX_EVENTS);
    }
    if (type === 'filez-view-ready') {
      state.readyCount += 1;
    } else if (type === 'native-fallback-started') {
      state.fallbackCount += 1;
    }
    publish();
    return event;
  }

  window.__RUIAN_FILEZ_FACADE_NOTE_SOURCE__ = function (source) {
    if (state.sources.indexOf(source) < 0) {
      state.sources.push(source);
      publish();
    }
  };

  function normalizeFileType(value) {
    return safeString(value)
      .toLowerCase()
      .replace(/^\./, '')
      .replace(/\s+/g, '');
  }

  function officeBodyFileType(value) {
    var normalized = normalizeFileType(value);
    var mapping = {
      '41': 'doc',
      '42': 'xls',
      '43': 'wps',
      '44': 'et'
    };
    if (mapping[normalized]) {
      return mapping[normalized];
    }
    return ['doc', 'docx', 'wps', 'xls', 'xlsx', 'et'].indexOf(normalized) >= 0
      ? normalized
      : '';
  }

  function fileTypeFromName(value) {
    var name = safeString(value).split(/[?#]/)[0];
    var slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
    var dot;
    if (slash >= 0) {
      name = name.slice(slash + 1);
    }
    dot = name.lastIndexOf('.');
    return dot > 0 ? officeBodyFileType(name.slice(dot + 1)) : '';
  }

  function contentApiFileType(api) {
    var keys = ['fileType', 'contentType', 'bodyType'];
    var i;
    var value;
    if (!api || typeof api.getMainBodyData !== 'function') {
      return '';
    }
    for (i = 0; i < keys.length; i += 1) {
      try {
        value = officeBodyFileType(api.getMainBodyData(keys[i]));
      } catch (ignore) {
        value = '';
      }
      if (value) {
        return value;
      }
    }
    return '';
  }

  function windowBodyFileType(candidate) {
    var values = [];
    var bodyWindow;
    var bodyElement;
    var i;
    var value;
    if (!candidate) {
      return '';
    }
    try {
      values.push(candidate.fileType, candidate.contentType, candidate.bodyType);
      values.push(
        queryValue(candidate.location && candidate.location.search, 'fileType'),
        queryValue(candidate.location && candidate.location.search, 'contentType'),
        queryValue(candidate.location && candidate.location.search, 'bodyType')
      );
      value = contentApiFileType(candidate.contentAPI);
      if (value) {
        return value;
      }
      if (typeof candidate._getZWIframe === 'function') {
        bodyWindow = candidate._getZWIframe();
        bodyWindow = bodyWindow && (bodyWindow.contentWindow || bodyWindow);
        value = contentApiFileType(bodyWindow && bodyWindow.contentAPI);
        if (value) {
          return value;
        }
      }
      if (candidate.document && candidate.document.getElementById) {
        for (i = 0; i < 3; i += 1) {
          bodyElement = candidate.document.getElementById(
            i === 0 ? 'fileType' : i === 1 ? 'contentType' : 'bodyType'
          );
          values.push(bodyElement && bodyElement.value);
        }
      }
    } catch (ignoreCandidate) {
      // Only same-origin, readable page state is considered.
    }
    for (i = 0; i < values.length; i += 1) {
      value = officeBodyFileType(values[i]);
      if (value) {
        return value;
      }
    }
    return '';
  }

  function effectiveFileType(instance, params) {
    var declared = normalizeFileType(params && params.fileType);
    var value = declared ? officeBodyFileType(declared) || declared : '';
    var candidates;
    var i;
    if (!value) {
      value = officeBodyFileType(
        params && (params.contentType || params.bodyType)
      );
    }
    if (!value) {
      value = fileTypeFromName(params && params.fileName);
    }
    if (!value && instance && instance.params && instance.params !== params) {
      declared = normalizeFileType(instance.params.fileType);
      value = declared
        ? officeBodyFileType(declared) || declared
        : officeBodyFileType(
            instance.params.contentType || instance.params.bodyType
          ) || fileTypeFromName(instance.params.fileName);
    }
    if (!value) {
      candidates = [window];
      try {
        if (window.parent && window.parent !== window) {
          candidates.push(window.parent);
        }
        if (root && candidates.indexOf(root) < 0) {
          candidates.push(root);
        }
      } catch (ignoreAncestors) {
        // Cross-origin ancestors are not inspected.
      }
      for (i = 0; i < candidates.length && !value; i += 1) {
        value = windowBodyFileType(candidates[i]);
      }
    }
    if (value && params) {
      params.fileType = value;
    }
    return value;
  }

  function normalizeMode(value) {
    return safeString(value).toUpperCase().replace(/\s+/g, '');
  }

  function topAffairId() {
    var value = '';
    try {
      value = queryValue(root.location.search, 'affairId');
    } catch (ignore) {
      value = '';
    }
    return /^-?\d{5,20}$/.test(value) ? value : '';
  }

  function topQuery(name) {
    try {
      return queryValue(root.location.search, name);
    } catch (ignore) {
      return '';
    }
  }

  function surfaceOf(pathname) {
    if (/\/govdoc\/govdoc\.do$/.test(pathname)) {
      return 'GOVDOC';
    }
    if (/\/collaboration\/collaboration\.do$/.test(pathname)) {
      return 'COLLABORATION';
    }
    if (/\/(?:doc\/)?doc\.do$/.test(pathname)) {
      return 'DOCUMENT';
    }
    return 'OTHER';
  }

  function isNewDocument(surface, params) {
    var method = safeString(topQuery('method')).toLowerCase();
    var hasExplicitTemplate = !!(
      topQuery('templateId') || topQuery('transOfficeId')
    );
    if (hasExplicitTemplate) {
      return false;
    }
    // A8 preallocates originalFileId/originalCreateDate placeholders on a
    // genuine new collaboration. The top method is the authoritative signal.
    if (surface === 'COLLABORATION' && method === 'newcoll') {
      return true;
    }
    if (params && (params.originalFileId || params.originalCreateDate)) {
      return false;
    }
    if (surface === 'GOVDOC') {
      return method === 'newgovdoc';
    }
    if (surface === 'COLLABORATION') {
      return method === 'newcoll';
    }
    if (surface === 'DOCUMENT') {
      return method === 'theneweditdoc' || method === 'neweditdoc';
    }
    return false;
  }

  function routeDecision(instance, params) {
    var pathname = '';
    var category = safeString(params && params.category);
    var fileType = effectiveFileType(instance, params);
    var officeFamily = ['xls', 'xlsx', 'et'].indexOf(fileType) >= 0
      ? 'EXCEL'
      : 'WORD';
    var domId = safeString(params && params.domId);
    var viewMode = safeString(params && params.viewMode).toLowerCase();
    var mode = normalizeMode(params && params.mode);
    var fileId = safeString(params && params.fileId);
    var affairId = topAffairId();
    var surface;
    var newDocument;
    var viewMatched = false;
    var editMatched = false;
    var reason = 'PASS_UNKNOWN';

    try {
      pathname = safeString(root.location.pathname)
        .toLowerCase()
        .replace(/\/+$/, '');
    } catch (ignore) {
      pathname = '';
    }

    surface = surfaceOf(pathname);
    newDocument = isNewDocument(surface, params);

    if (
      !params ||
      params.__ruianFilezBypass === true ||
      (instance && instance.__ruianFilezBypass === true)
    ) {
      reason = 'PASS_BYPASS';
    } else if (surface === 'OTHER') {
      reason = 'PASS_SURFACE';
    } else if (
      ['doc', 'docx', 'wps', 'xls', 'xlsx', 'et'].indexOf(fileType) < 0
    ) {
      reason = 'PASS_FILE_TYPE';
    } else if (
      surface === 'GOVDOC' &&
      category === '4' &&
      domId === 'officeEditorFrame' &&
      viewMode === 'view' &&
      mode === 'VIEW' &&
      /^-?\d{5,20}$/.test(fileId) &&
      affairId
    ) {
      viewMatched = true;
      reason = 'MATCH_GOVDOC_' + officeFamily + '_VIEW';
    } else if (
      mode === 'EDIT' &&
      (viewMode === '' || viewMode === 'edit') &&
      ((surface === 'GOVDOC' && newDocument) ||
        (surface === 'GOVDOC' && affairId && /^-?\d{5,20}$/.test(fileId)) ||
        ((surface === 'COLLABORATION' || surface === 'DOCUMENT') &&
          newDocument))
    ) {
      editMatched = true;
      reason = newDocument
        ? 'MATCH_' + officeFamily + '_NEW_EDIT'
        : 'MATCH_GOVDOC_' + officeFamily + '_EDIT';
    } else {
      reason = 'PASS_MODE_OR_SCOPE';
    }

    return {
      matched: viewMatched || editMatched,
      viewMatched: viewMatched,
      editMatched: editMatched,
      reason: reason,
      surface: surface,
      fileType: fileType || 'UNKNOWN',
      mode: mode || 'UNKNOWN',
      affairId: affairId,
      newDocument: newDocument,
      hasAffairId: !!affairId,
      hasFileId: !!fileId
    };
  }

  function resolveAdapter(instance, params) {
    var decision = routeDecision(instance, params);

    state.instanceCount += 1;
    state.lastReason = decision.reason;
    if (decision.matched) {
      state.matchedCount += 1;
    }
    record('route-decision', {
      matched: decision.matched,
      reason: decision.reason,
      surface: decision.surface,
      fileType: decision.fileType,
      mode: decision.mode,
      hasAffairId: decision.hasAffairId,
      hasFileId: decision.hasFileId
    });

    if (!decision.matched) {
      return null;
    }

    params.__ruianFilezAffairId = decision.affairId;
    params.__ruianFilezSurface = decision.surface;
    params.__ruianFilezNewDocument = decision.newDocument;
    params.__ruianFilezRouteEpoch = control.epoch;
    if (
      decision.editMatched &&
      control.mode === MODE_EDIT
    ) {
      return {
        key: EDIT_ADAPTER_KEY,
        url: [EDIT_ADAPTER_URL]
      };
    }
    if (
      decision.viewMatched &&
      (control.mode === MODE_VIEW || control.mode === MODE_EDIT)
    ) {
      return {
        key: VIEW_ADAPTER_KEY,
        url: [VIEW_ADAPTER_URL]
      };
    }
    return null;
  }

  function resolverQueue() {
    var queue = window[RESOLVER_QUEUE_KEY];
    if (Object.prototype.toString.call(queue) !== '[object Array]') {
      queue = [];
      window[RESOLVER_QUEUE_KEY] = queue;
    }
    return queue;
  }

  function queueResolver() {
    var queue = resolverQueue();
    var i;
    for (i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i] && queue[i].name === RESOLVER_NAME) {
        queue.splice(i, 1);
      }
    }
    queue.push({
      name: RESOLVER_NAME,
      resolve: resolveAdapter
    });
  }

  function installResolver() {
    if (
      window.OfficeSDK &&
      typeof window.OfficeSDK.registerAdapterResolver === 'function'
    ) {
      window.OfficeSDK.registerAdapterResolver(
        RESOLVER_NAME,
        resolveAdapter
      );
      state.installStatus = 'resolver-registered';
    } else {
      queueResolver();
      state.installStatus = 'resolver-queued';
    }
    state.lastReason = 'RESOLVER_READY';
    record('resolver-ready', {
      status: state.installStatus
    });
  }

  function removeResolver() {
    var queue = resolverQueue();
    var i;
    if (
      window.OfficeSDK &&
      typeof window.OfficeSDK.unregisterAdapterResolver === 'function'
    ) {
      window.OfficeSDK.unregisterAdapterResolver(RESOLVER_NAME);
    }
    for (i = queue.length - 1; i >= 0; i -= 1) {
      if (queue[i] && queue[i].name === RESOLVER_NAME) {
        queue.splice(i, 1);
      }
    }
  }

  function cleanupAdapters(reason, fallbackToNative) {
    var viewer = window[VIEWER_KEY];
    var editor = window[EDITOR_KEY];
    if (viewer && typeof viewer.cleanupAll === 'function') {
      viewer.cleanupAll(reason, fallbackToNative);
    }
    if (editor && typeof editor.cleanupAll === 'function') {
      editor.cleanupAll(reason, fallbackToNative);
    }
  }

  function loadAdminPanel() {
    var id = 'ruian-filez-admin-panel-script';
    var script;
    var contextPath;
    if (!isPcSource() || document.getElementById(id)) {
      return;
    }
    contextPath = safeString(window._ctxPath) || '/seeyon';
    if (contextPath.charAt(0) !== '/') {
      contextPath = '/' + contextPath;
    }
    script = document.createElement('script');
    script.id = id;
    script.async = false;
    script.src = contextPath.replace(/\/+$/, '') + ADMIN_PANEL_URL;
    (document.head || document.documentElement).appendChild(script);
  }

  function isPcSource() {
    return state.sources.indexOf('GLOBAL_ENV_PC') >= 0;
  }

  window[BRIDGE_KEY] = {
    version: VERSION,
    record: record,
    isModeActive: function (epoch, capability) {
      return (
        (capability === 'edit'
          ? control.mode === MODE_EDIT
          : control.mode === MODE_VIEW || control.mode === MODE_EDIT) &&
        (epoch === undefined || Number(epoch) === Number(control.epoch))
      );
    },
    currentMode: function () {
      return control.mode;
    },
    currentServerMode: function () {
      return control.serverMode;
    }
  };

  var controller = {
    onMode: function (mode, epoch) {
      var leavingActive =
        (state.mode === MODE_VIEW || state.mode === MODE_EDIT) &&
        mode !== state.mode;
      state.serverMode = control.serverMode;
      state.mode = mode;
      state.epoch = epoch;

      if (mode === MODE_OFF) {
        cleanupAdapters('MODE_OFF', true);
        removeResolver();
        state.installStatus = 'disabled';
        state.lastReason = 'MODE_OFF';
        return;
      }

      if (leavingActive) {
        cleanupAdapters('MODE_CHANGED', true);
      }

      if (!isPcSource()) {
        removeResolver();
        state.installStatus = 'disabled-mobile';
        state.lastReason = 'PC_ONLY';
        publish();
        return;
      }

      installResolver();
      loadAdminPanel();
      publish();
    },

    sync: function () {
      control.syncFromTop();
      state.serverMode = control.serverMode;
      publish();
    }
  };

  state.controller = controller;
  control.register(controller);

  window.addEventListener('unload', function () {
    removeResolver();
    control.unregister(controller);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      publish();
      renderBadge(control);
      loadAdminPanel();
    });
  } else {
    publish();
    renderBadge(control);
    loadAdminPanel();
  }

  window.addEventListener('load', function () {
    controller.sync();
  });

  if (window.console && typeof window.console.info === 'function') {
    window.console.info(
      '[Ruian FileZ Facade] resolver bootstrap loaded',
      stateSummary()
    );
  }
})(window, document);
