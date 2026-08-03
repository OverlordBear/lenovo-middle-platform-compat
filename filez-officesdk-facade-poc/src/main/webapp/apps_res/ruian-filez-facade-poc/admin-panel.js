(function (window, document) {
  'use strict';

  var GLOBAL_KEY = '__RUIAN_FILEZ_ADMIN_PANEL_020__';
  var ENTRY_ID = 'ruian-filez-admin-entry';
  var CONTENT_ID = 'RUIAN_FILEZ';
  var STYLE_ID = 'ruian-filez-admin-style';
  var MANAGER_NAME = 'ruianFileZViewManager';
  var MODE_ORDER = ['off', 'shadow', 'view', 'edit'];
  var MODE_TEXT = {
    off: {
      title: '关闭',
      description: '不接管任何 Office 正文，全部回退到致远原生流版签配置。'
    },
    shadow: {
      title: '旁路观察',
      description: '只记录 FileZ 路由判定和运行信息，不替换致远原生编辑器。'
    },
    view: {
      title: '只读查看',
      description: '仅在 FileZ 白名单场景中接管已有 Word/Excel 正文的查看，编辑仍走致远原生适配器。'
    },
    edit: {
      title: '查看与编辑',
      description: '允许 FileZ 接管符合策略的查看、新建和编辑。仅当 FileZ EDIT Adapter 及保存回写链路已完成验证时启用。'
    }
  };
  var pageState = {
    active: false,
    editing: false,
    busy: false,
    savedMode: 'off',
    panel: null
  };

  if (window[GLOBAL_KEY]) {
    return;
  }

  window[GLOBAL_KEY] = {
    version: '0.2.0',
    layout: 'inline-tab',
    injected: false,
    active: false
  };

  function text(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function normalizeResponse(value) {
    var parsed = value;
    var depth = 0;

    while (typeof parsed === 'string' && depth < 2) {
      try {
        parsed = JSON.parse(parsed);
      } catch (ignore) {
        break;
      }
      depth += 1;
    }

    if (parsed && typeof parsed === 'object' && typeof parsed.result === 'string') {
      try {
        parsed = JSON.parse(parsed.result);
      } catch (ignoreResult) {
        // Keep the original bridge result when it is not JSON.
      }
    }
    return parsed;
  }

  function backendWindow() {
    var candidates = [window];
    try {
      if (window.parent && window.parent !== window) {
        candidates.push(window.parent);
      }
      if (window.top && window.top !== window && window.top !== window.parent) {
        candidates.push(window.top);
      }
    } catch (ignore) {
      // Cross-origin ancestors are deliberately ignored.
    }

    for (var i = 0; i < candidates.length; i += 1) {
      try {
        if (typeof candidates[i].callBackendMethod === 'function') {
          return candidates[i];
        }
      } catch (ignoreCandidate) {
        // Continue with the next same-origin candidate.
      }
    }
    return null;
  }

  function callPolicyMethod(method, parameters) {
    return new Promise(function (resolve, reject) {
      var host = backendWindow();
      var result;

      if (!host) {
        reject(new Error('当前页面未加载致远 callBackendMethod，无法访问 FileZ 配置。'));
        return;
      }

      try {
        result = host.callBackendMethod(MANAGER_NAME, method, parameters || {});
        if (result && typeof result.then === 'function') {
          result.then(function (value) {
            resolve(normalizeResponse(value));
          }, reject);
        } else {
          resolve(normalizeResponse(result));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function errorMessage(result, fallback) {
    var code = text(result && result.code);
    var message = text(result && (result.message || result.msg));

    if (code === 'AUTH_REQUIRED') {
      return '登录状态已失效，请重新登录后再试。';
    }
    if (code === 'FORBIDDEN') {
      return '只有致远系统管理员可以查看或修改 FileZ 集成设置。';
    }
    if (code === 'METHOD_NOT_ALLOWED') {
      return 'FileZ 配置接口拒绝了当前请求方式。';
    }
    if (code === 'INVALID_ARGUMENT') {
      return message || '服务端不支持选中的 FileZ 运行模式，请先完成对应后端部署。';
    }
    return message || fallback || 'FileZ 配置操作失败。';
  }

  function setStatus(panel, kind, message) {
    var status = panel.querySelector('[data-filez-role="status"]');
    if (!status) {
      return;
    }
    status.className = 'ruian-filez-admin-status is-' + kind;
    status.textContent = message;
  }

  function selectedMode(panel) {
    var selected = panel.querySelector('input[name="ruian-filez-mode"]:checked');
    return selected ? selected.value : 'off';
  }

  function updateModeDescription(panel, mode) {
    var description = panel.querySelector('[data-filez-role="mode-description"]');
    if (!description) {
      return;
    }
    description.textContent = MODE_TEXT[mode]
      ? MODE_TEXT[mode].description
      : '服务端返回了未知模式。';
  }

  function selectMode(panel, mode) {
    var normalized = MODE_ORDER.indexOf(mode) >= 0 ? mode : 'off';
    var input = panel.querySelector(
      'input[name="ruian-filez-mode"][value="' + normalized + '"]'
    );
    if (input) {
      input.checked = true;
    }
    updateModeDescription(panel, normalized);
  }

  function setBusy(panel, busy) {
    var radios = panel.querySelectorAll('input[type="radio"]');
    pageState.busy = busy === true;
    for (var i = 0; i < radios.length; i += 1) {
      radios[i].disabled = pageState.busy || !pageState.editing;
    }
    panel.setAttribute('aria-busy', busy ? 'true' : 'false');
    syncBottomControls();
  }

  function loadPolicy(panel) {
    setBusy(panel, true);
    setStatus(panel, 'loading', '正在读取服务端配置…');

    return callPolicyMethod('getFacadePolicy', {}).then(function (result) {
      if (!result || result.success !== true || !result.data) {
        throw new Error(errorMessage(result, '无法读取 FileZ 服务端配置。'));
      }

      var mode = result.data.enabled === true ? text(result.data.mode).toLowerCase() : 'off';
      pageState.savedMode = MODE_ORDER.indexOf(mode) >= 0 ? mode : 'off';
      selectMode(panel, mode);
      if (MODE_ORDER.indexOf(mode) < 0) {
        setStatus(panel, 'warning', '服务端返回了未知模式，界面已按“关闭”显示。');
      } else {
        setStatus(panel, 'success', '当前服务端模式：' + MODE_TEXT[mode].title);
      }
    }).catch(function (error) {
      setStatus(panel, 'error', text(error && error.message) || '读取 FileZ 配置失败。');
    }).then(function () {
      setBusy(panel, false);
      return pageState.savedMode;
    });
  }

  function savePolicy(panel) {
    var mode = selectedMode(panel);
    var enabled = mode !== 'off';

    setBusy(panel, true);
    setStatus(panel, 'loading', '正在保存服务端配置…');

    return callPolicyMethod('setFacadePolicy', {
      enabled: enabled,
      mode: mode
    }).then(function (result) {
      if (!result || result.success !== true || !result.data) {
        throw new Error(errorMessage(result, '保存 FileZ 服务端配置失败。'));
      }

      var persistedMode = result.data.enabled === true
        ? text(result.data.mode).toLowerCase()
        : 'off';
      pageState.savedMode = MODE_ORDER.indexOf(persistedMode) >= 0
        ? persistedMode
        : 'off';
      selectMode(panel, persistedMode);
      setStatus(
        panel,
        'success',
        '保存成功，当前模式：' +
          (MODE_TEXT[persistedMode] ? MODE_TEXT[persistedMode].title : persistedMode) +
          '。请刷新已打开的业务页面使新策略生效。'
      );
      return true;
    }).catch(function (error) {
      setStatus(panel, 'error', text(error && error.message) || '保存 FileZ 配置失败。');
      return false;
    }).then(function (success) {
      setBusy(panel, false);
      return success;
    });
  }

  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent =
      '#' + ENTRY_ID + '{width:140px;flex:0 0 140px;line-height:36px;white-space:nowrap}' +
      '#' + ENTRY_ID + ':focus{outline:2px solid #91caff;outline-offset:-2px}' +
      '.ruian-filez-admin-content{color:#505d6e;font-family:"PingFang SC","Microsoft YaHei",Arial,sans-serif}' +
      '.ruian-filez-admin-inner{box-sizing:border-box;max-width:1180px;padding:18px 40px 0 0}' +
      '.ruian-filez-admin-content .ruian-filez-admin-intro{margin:0 0 22px 304px;max-width:760px;' +
      'padding:10px 14px;border-left:3px solid var(--theme-brand6,#0C62F8);background:#f5f9ff;' +
      'font-size:14px;line-height:1.7;color:#505d6e}' +
      '.ruian-filez-admin-content .ruian-filez-mode-options{display:flex;align-items:center;flex-wrap:wrap;gap:0 18px}' +
      '.ruian-filez-admin-content .ruian-filez-mode-option{margin-right:0}' +
      '.ruian-filez-admin-content .ruian-filez-mode-option input{margin:0}' +
      '.ruian-filez-admin-content .ruian-filez-mode-option label{display:inline;font-weight:400;cursor:pointer}' +
      '.ruian-filez-admin-content .ruian-filez-mode-option input:disabled+label{cursor:not-allowed;color:#8f959e}' +
      '.ruian-filez-admin-content .ruian-filez-description{max-width:760px;min-height:22px;line-height:1.6;' +
      'font-size:14px;color:#8f959e}' +
      '.ruian-filez-admin-content .ruian-filez-admin-status{display:inline-block;max-width:760px;' +
      'padding:7px 12px;border-radius:4px;line-height:1.5}' +
      '.ruian-filez-admin-status.is-loading{background:#f5f5f5;color:#505d6e}' +
      '.ruian-filez-admin-status.is-success{background:#f0fff4;color:#237804}' +
      '.ruian-filez-admin-status.is-warning{background:#fffbe6;color:#ad6800}' +
      '.ruian-filez-admin-status.is-error{background:#fff1f0;color:#cf1322}' +
      '.ruian-filez-admin-content[aria-busy="true"]{cursor:progress}';
    (document.head || document.documentElement).appendChild(style);
  }

  function findAncestorById(node, id) {
    while (node && node !== document) {
      if (node.id === id) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  }

  function createModeOption(mode) {
    var wrapper = document.createElement('div');
    var input = document.createElement('input');
    var label = document.createElement('label');
    var inputId = 'ruian-filez-mode-' + mode;

    wrapper.className = 'radio-item-button ruian-filez-mode-option';
    input.type = 'radio';
    input.id = inputId;
    input.name = 'ruian-filez-mode';
    input.value = mode;
    input.addEventListener('change', function () {
      if (input.checked) {
        updateModeDescription(pageState.panel, mode);
      }
    });
    label.className = 'radio-label-item';
    label.setAttribute('for', inputId);
    label.textContent = MODE_TEXT[mode].title;
    wrapper.appendChild(input);
    wrapper.appendChild(label);
    return wrapper;
  }

  function createRow(labelText, valueNode, extraClass) {
    var row = document.createElement('div');
    var label = document.createElement('label');
    row.className = 'form-row' + (extraClass ? ' ' + extraClass : '');
    label.className = 'lab';
    label.textContent = labelText;
    row.appendChild(label);
    row.appendChild(valueNode);
    return row;
  }

  function createInlineContent() {
    var panel = document.createElement('div');
    var inner = document.createElement('div');
    var intro = document.createElement('div');
    var options = document.createElement('div');
    var description = document.createElement('div');
    var status = document.createElement('div');
    var i;

    panel.id = CONTENT_ID;
    panel.className = 'tab-content ruian-filez-admin-content';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', ENTRY_ID);
    inner.className = 'ruian-filez-admin-inner';
    intro.className = 'ruian-filez-admin-intro';
    intro.textContent =
      'FileZ 使用独立的服务端接管策略，不改变致远上方各原生厂商配置。' +
      '关闭或未命中 FileZ 时，仍按原生流版签设置处理。';
    options.className = 'ruian-filez-mode-options';
    for (i = 0; i < MODE_ORDER.length; i += 1) {
      options.appendChild(createModeOption(MODE_ORDER[i]));
    }
    description.className = 'ruian-filez-description';
    description.setAttribute('data-filez-role', 'mode-description');
    status.className = 'ruian-filez-admin-status is-loading';
    status.setAttribute('data-filez-role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = '正在读取服务端配置…';

    inner.appendChild(intro);
    inner.appendChild(createRow('FileZ 接管模式：', options));
    inner.appendChild(createRow('', description, 'form-row-desc'));
    inner.appendChild(createRow('服务端状态：', status));
    panel.appendChild(inner);
    return panel;
  }

  function nativeControls() {
    return {
      change: document.getElementById('config-change-btn'),
      submit: document.getElementById('config-submit-btn'),
      cancel: document.getElementById('config-cancel-btn')
    };
  }

  function syncBottomControls() {
    var controls;
    var disabled;
    if (!pageState.active) {
      return;
    }
    controls = nativeControls();
    if (!controls.change || !controls.submit || !controls.cancel) {
      return;
    }
    controls.change.style.display = pageState.editing ? 'none' : 'block';
    controls.submit.style.display = pageState.editing ? 'block' : 'none';
    controls.cancel.style.display = pageState.editing ? 'block' : 'none';
    controls.submit.textContent = '保存';
    disabled = pageState.busy === true;
    controls.change.style.pointerEvents = disabled ? 'none' : '';
    controls.submit.style.pointerEvents = disabled ? 'none' : '';
    controls.cancel.style.pointerEvents = disabled ? 'none' : '';
    controls.change.style.opacity = disabled ? '.55' : '';
    controls.submit.style.opacity = disabled ? '.55' : '';
    controls.cancel.style.opacity = disabled ? '.55' : '';
  }

  function setEditing(editing) {
    pageState.editing = editing === true;
    if (pageState.panel) {
      setBusy(pageState.panel, pageState.busy);
    }
    syncBottomControls();
  }

  function deactivateFilez() {
    pageState.active = false;
    pageState.editing = false;
    window[GLOBAL_KEY].active = false;
  }

  function activateFilez() {
    var tabs = document.querySelectorAll('.system-config-header-tabs .tab');
    var contents = document.querySelectorAll('.system-config-content .tab-content');
    var entry = document.getElementById(ENTRY_ID);
    var panel = document.getElementById(CONTENT_ID);
    var i;
    if (!entry || !panel) {
      return;
    }
    for (i = 0; i < tabs.length; i += 1) {
      tabs[i].classList.remove('active');
    }
    for (i = 0; i < contents.length; i += 1) {
      contents[i].classList.remove('active');
    }
    entry.classList.add('active');
    panel.classList.add('active');
    pageState.active = true;
    pageState.panel = panel;
    window[GLOBAL_KEY].active = true;
    setEditing(false);
    loadPolicy(panel).then(function () {
      syncBottomControls();
    });
  }

  function stopNativeAction(event) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    if (event.stopImmediatePropagation) {
      event.stopImmediatePropagation();
    } else if (event.stopPropagation) {
      event.stopPropagation();
    }
  }

  function handlePageClick(event) {
    var target = event.target;
    var entry = findAncestorById(target, ENTRY_ID);
    var nativeTab;
    var controls;
    if (entry) {
      stopNativeAction(event);
      activateFilez();
      return;
    }

    nativeTab = target;
    while (nativeTab && nativeTab !== document) {
      if (
        nativeTab.classList &&
        nativeTab.classList.contains('tab') &&
        nativeTab.getAttribute('data-value') !== CONTENT_ID
      ) {
        deactivateFilez();
        return;
      }
      nativeTab = nativeTab.parentNode;
    }
    if (!pageState.active) {
      return;
    }

    controls = nativeControls();
    if (controls.change && findAncestorById(target, controls.change.id)) {
      stopNativeAction(event);
      if (!pageState.busy) {
        setEditing(true);
        setStatus(pageState.panel, 'success', '请选择 FileZ 接管模式，然后点击“保存”。');
      }
      return;
    }
    if (controls.submit && findAncestorById(target, controls.submit.id)) {
      stopNativeAction(event);
      if (!pageState.busy && pageState.editing) {
        savePolicy(pageState.panel).then(function (success) {
          if (success) {
            setEditing(false);
          } else {
            syncBottomControls();
          }
        });
      }
      return;
    }
    if (controls.cancel && findAncestorById(target, controls.cancel.id)) {
      stopNativeAction(event);
      if (!pageState.busy) {
        selectMode(pageState.panel, pageState.savedMode);
        setStatus(
          pageState.panel,
          'success',
          '已取消修改，当前服务端模式：' + MODE_TEXT[pageState.savedMode].title
        );
        setEditing(false);
      }
    }
  }

  function injectEntry() {
    var tabs = document.querySelector('.system-config-header-tabs');
    var contentHost = document.querySelector('.system-config-content');
    var entry = document.getElementById(ENTRY_ID);
    var panel = document.getElementById(CONTENT_ID);
    if (!tabs || !contentHost) {
      return false;
    }

    addStyles();
    if (!panel) {
      panel = createInlineContent();
      contentHost.appendChild(panel);
    }
    pageState.panel = panel;
    if (!entry) {
      entry = document.createElement('div');
      entry.id = ENTRY_ID;
      entry.className = 'tab';
      entry.setAttribute('data-value', CONTENT_ID);
      entry.setAttribute('role', 'tab');
      entry.setAttribute('tabindex', '0');
      entry.textContent = 'FileZ 集成设置';
      entry.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ' || event.keyCode === 13 || event.keyCode === 32) {
          stopNativeAction(event);
          activateFilez();
        }
      });
      tabs.appendChild(entry);
    }
    window[GLOBAL_KEY].injected = true;
    return true;
  }

  function start() {
    injectEntry();
    document.addEventListener('click', handlePageClick, true);

    if (typeof window.MutationObserver === 'function') {
      var observer = new window.MutationObserver(function () {
        injectEntry();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      window[GLOBAL_KEY].observer = observer;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window, document);
