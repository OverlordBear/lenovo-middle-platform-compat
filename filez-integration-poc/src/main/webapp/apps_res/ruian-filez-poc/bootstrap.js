(function (window, document) {
  'use strict';

  var VERSION = '0.1.0';
  var GLOBAL_KEY = '__RUIAN_FILEZ_POC__';
  var WINDOWS_KEY = '__RUIAN_FILEZ_POC_WINDOWS__';
  var REGISTER_KEY = '__RUIAN_FILEZ_POC_REGISTER__';
  var DEBUG_KEY = 'ruian.filez.poc.debug';
  var BADGE_ID = 'ruian-filez-poc-badge';

  function now() {
    return new Date().toISOString();
  }

  function getSource() {
    var script = document.currentScript || document.getElementById('ruian-filez-poc-bootstrap');
    return script && script.getAttribute('data-ruian-source') || 'UNKNOWN';
  }

  function hasDebugQuery() {
    return /(?:^|[?&])filezPoc=1(?:&|$)/.test(window.location.search || '');
  }

  function debugEnabled() {
    try {
      if (hasDebugQuery()) {
        window.sessionStorage.setItem(DEBUG_KEY, '1');
      }
      return window.sessionStorage.getItem(DEBUG_KEY) === '1';
    } catch (ignore) {
      return hasDebugQuery();
    }
  }

  function safeWindowName() {
    try {
      return String(window.name || '');
    } catch (ignore) {
      return '';
    }
  }

  function snapshot(phase) {
    return {
      phase: phase,
      at: now(),
      readyState: document.readyState,
      hasOfficeSDK: typeof window.OfficeSDK === 'function',
      hasDollarSDK: typeof window.$SDK === 'function',
      officeSdkScriptPresent: !!document.querySelector(
        'script[src*="/common/office/js/officeSDK.js"]'
      )
    };
  }

  function getTopWindow() {
    try {
      if (window.top && window.top.location.origin === window.location.origin) {
        return window.top;
      }
    } catch (ignore) {
      // Cross-origin windows intentionally stay isolated.
    }
    return window;
  }

  function makeSummary(info) {
    var last = info.observations[info.observations.length - 1] || {};
    return {
      id: info.id,
      version: info.version,
      source: info.sources.join(','),
      pathname: info.pathname,
      windowName: info.windowName,
      isTop: info.isTop,
      loadedAt: info.loadedAt,
      lastPhase: last.phase || '',
      hasOfficeSDK: !!last.hasOfficeSDK,
      hasDollarSDK: !!last.hasDollarSDK
    };
  }

  function installRegistry(root) {
    if (!root[WINDOWS_KEY]) {
      root[WINDOWS_KEY] = [];
    }
    if (!root[REGISTER_KEY]) {
      root[REGISTER_KEY] = function (summary) {
        var registry = root[WINDOWS_KEY];
        var replaced = false;
        var i;
        for (i = 0; i < registry.length; i += 1) {
          if (registry[i].id === summary.id) {
            registry[i] = summary;
            replaced = true;
            break;
          }
        }
        if (!replaced) {
          registry.push(summary);
        }
        renderBadge(root);
      };
    }
  }

  function renderBadge(root) {
    var doc;
    var badge;
    var windows;
    var sdkCount = 0;
    var i;

    if (!debugEnabled()) {
      return;
    }

    try {
      doc = root.document;
    } catch (ignore) {
      return;
    }

    if (!doc || !doc.body) {
      return;
    }

    windows = root[WINDOWS_KEY] || [];
    for (i = 0; i < windows.length; i += 1) {
      if (windows[i].hasOfficeSDK) {
        sdkCount += 1;
      }
    }

    badge = doc.getElementById(BADGE_ID);
    if (!badge) {
      badge = doc.createElement('button');
      badge.id = BADGE_ID;
      badge.type = 'button';
      badge.style.cssText =
        'position:fixed;right:12px;bottom:12px;z-index:2147483647;' +
        'border:0;border-radius:6px;padding:8px 10px;background:#16803a;' +
        'color:#fff;font:12px/1.4 Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25);' +
        'cursor:pointer;';
      badge.onclick = function () {
        if (window.console && console.table) {
          console.table(root[WINDOWS_KEY] || []);
        } else if (window.console) {
          console.log(root[WINDOWS_KEY] || []);
        }
      };
      doc.body.appendChild(badge);
    }

    badge.textContent =
      'FileZ PoC ' + VERSION + ' · 窗口 ' + windows.length + ' · OfficeSDK ' + sdkCount;
    badge.title = '点击后在控制台输出已加载的 window 列表';
  }

  function register(info) {
    var root = getTopWindow();
    installRegistry(root);
    try {
      root[REGISTER_KEY](makeSummary(info));
    } catch (ignore) {
      // Diagnostics must never affect A8 behavior.
    }
  }

  if (window[GLOBAL_KEY] && window[GLOBAL_KEY].version === VERSION) {
    window[GLOBAL_KEY].duplicateLoads += 1;
    if (window[GLOBAL_KEY].sources.indexOf(getSource()) < 0) {
      window[GLOBAL_KEY].sources.push(getSource());
    }
    register(window[GLOBAL_KEY]);
    return;
  }

  var info = {
    id:
      String(Date.now()) + '-' +
      Math.random().toString(16).slice(2) + '-' +
      safeWindowName(),
    version: VERSION,
    loadedAt: now(),
    source: getSource(),
    sources: [getSource()],
    pathname: window.location.pathname,
    windowName: safeWindowName(),
    isTop: window === window.top,
    duplicateLoads: 0,
    observations: []
  };

  window[GLOBAL_KEY] = info;
  window.__RUIAN_FILEZ_POC_NOTE_SOURCE__ = function (source) {
    if (info.sources.indexOf(source) < 0) {
      info.sources.push(source);
      register(info);
    }
  };

  function observe(phase) {
    info.observations.push(snapshot(phase));
    register(info);
  }

  observe('bootstrap');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      observe('dom-content-loaded');
      renderBadge(getTopWindow());
    });
  } else {
    observe('dom-already-ready');
  }

  window.addEventListener('load', function () {
    observe('window-load');
    renderBadge(getTopWindow());
  });

  if (window.console && console.info) {
    console.info('[Ruian FileZ PoC] bootstrap loaded', makeSummary(info));
  }
})(window, document);
