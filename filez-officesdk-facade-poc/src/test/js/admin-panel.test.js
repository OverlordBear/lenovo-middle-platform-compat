'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const adminPanelPath = path.resolve(
  __dirname,
  '../../main/webapp/apps_res/ruian-filez-facade-poc/admin-panel.js'
);
const adminPanelText = fs.readFileSync(adminPanelPath, 'utf8');

function classNames(element) {
  return String(element.className || '').split(/\s+/).filter(Boolean);
}

function hasClass(element, className) {
  return classNames(element).includes(className);
}

function addClass(element, className) {
  const names = classNames(element);
  if (!names.includes(className)) names.push(className);
  element.className = names.join(' ');
}

function removeClass(element, className) {
  element.className = classNames(element)
    .filter((name) => name !== className)
    .join(' ');
}

function descendants(root) {
  const result = [];
  (root.children || []).forEach((child) => {
    result.push(child);
    result.push(...descendants(child));
  });
  return result;
}

function matchesSimple(element, selector) {
  if (!element || !element.tagName) return false;
  if (selector.charAt(0) === '#') return element.id === selector.slice(1);
  if (selector.charAt(0) === '.') return hasClass(element, selector.slice(1));

  const dataRole = selector.match(/^\[data-filez-role="([^"]+)"\]$/);
  if (dataRole) return element.getAttribute('data-filez-role') === dataRole[1];

  if (selector === 'input[type="radio"]') {
    return element.tagName === 'INPUT' && element.type === 'radio';
  }

  const checkedMode = selector.match(
    /^input\[name="ruian-filez-mode"\]:checked$/
  );
  if (checkedMode) {
    return element.tagName === 'INPUT' &&
      element.name === 'ruian-filez-mode' && element.checked === true;
  }

  const valuedMode = selector.match(
    /^input\[name="ruian-filez-mode"\]\[value="([^"]+)"\]$/
  );
  if (valuedMode) {
    return element.tagName === 'INPUT' &&
      element.name === 'ruian-filez-mode' && element.value === valuedMode[1];
  }

  return element.tagName === selector.toUpperCase();
}

function matchesSelector(element, selector) {
  const parts = selector.trim().split(/\s+/);
  let candidate = element;
  if (!matchesSimple(candidate, parts[parts.length - 1])) return false;
  for (let index = parts.length - 2; index >= 0; index -= 1) {
    candidate = candidate.parentNode;
    while (candidate && !matchesSimple(candidate, parts[index])) {
      candidate = candidate.parentNode;
    }
    if (!candidate) return false;
  }
  return true;
}

function createEventTarget(target) {
  const listeners = Object.create(null);
  target.addEventListener = function (type, listener) {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(listener);
  };
  target.dispatchEvent = function (event) {
    const normalized = event || {};
    normalized.type = normalized.type || '';
    normalized.target = normalized.target || target;
    normalized.preventDefault = normalized.preventDefault || function () {
      normalized.defaultPrevented = true;
    };
    normalized.stopPropagation = normalized.stopPropagation || function () {
      normalized.propagationStopped = true;
    };
    normalized.stopImmediatePropagation = normalized.stopImmediatePropagation || function () {
      normalized.immediatePropagationStopped = true;
    };
    (listeners[normalized.type] || []).slice().some((listener) => {
      listener.call(target, normalized);
      return normalized.immediatePropagationStopped === true;
    });
    return !normalized.defaultPrevented;
  };
  return target;
}

function createElement(tagName) {
  const element = createEventTarget({
    tagName: String(tagName).toUpperCase(),
    id: '',
    type: '',
    name: '',
    value: '',
    className: '',
    textContent: '',
    checked: false,
    disabled: false,
    ownerDocument: null,
    parentNode: null,
    children: [],
    attributes: Object.create(null),
    style: Object.create(null),
    appendChild(child) {
      if (child.parentNode) child.parentNode.removeChild(child);
      this.children.push(child);
      child.parentNode = this;
      (function assignOwnerDocument(node, ownerDocument) {
        node.ownerDocument = ownerDocument;
        (node.children || []).forEach((nested) => {
          assignOwnerDocument(nested, ownerDocument);
        });
      })(child, this.ownerDocument);
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) this.children.splice(index, 1);
      child.parentNode = null;
      return child;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === 'id') this.id = String(value);
      if (name === 'class') this.className = String(value);
    },
    getAttribute(name) {
      if (name === 'id') return this.id || null;
      if (name === 'class') return this.className || null;
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
        ? this.attributes[name]
        : null;
    },
    querySelector(selector) {
      return this.querySelectorAll(selector)[0] || null;
    },
    querySelectorAll(selector) {
      return descendants(this).filter((candidate) => matchesSelector(candidate, selector));
    },
    focus() {},
    click() {
      const event = { type: 'click', target: this };
      if (this.ownerDocument) this.ownerDocument.dispatchEvent(event);
      if (!event.immediatePropagationStopped) this.dispatchEvent(event);
    }
  });
  element.classList = {
    add(className) { addClass(element, className); },
    remove(className) { removeClass(element, className); },
    contains(className) { return hasClass(element, className); }
  };
  return element;
}

function findById(root, id) {
  if (root.id === id) return root;
  for (const child of root.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

function createDocument(withNativeLayout) {
  const documentElement = createElement('html');
  const head = createElement('head');
  const body = createElement('body');
  const document = createEventTarget({
    readyState: 'complete',
    documentElement,
    head,
    body,
    createElement,
    getElementById(id) {
      return findById(documentElement, id);
    },
    querySelector(selector) {
      if (matchesSelector(documentElement, selector)) return documentElement;
      return documentElement.querySelector(selector);
    },
    querySelectorAll(selector) {
      const result = documentElement.querySelectorAll(selector);
      return matchesSelector(documentElement, selector)
        ? [documentElement, ...result]
        : result;
    }
  });

  documentElement.ownerDocument = document;
  head.ownerDocument = document;
  body.ownerDocument = document;
  documentElement.appendChild(head);
  documentElement.appendChild(body);

  if (withNativeLayout) {
    const tabs = createElement('div');
    const nativeTab = createElement('div');
    const contentHost = createElement('div');
    const nativeContent = createElement('div');
    const bottom = createElement('div');
    const change = createElement('div');
    const submit = createElement('div');
    const cancel = createElement('div');

    tabs.className = 'system-config-header-tabs';
    nativeTab.id = 'native-online-edit-tab';
    nativeTab.className = 'tab active';
    nativeTab.setAttribute('data-value', 'ONLINE_EDIT');
    nativeTab.textContent = '在线编辑';
    tabs.appendChild(nativeTab);

    contentHost.className = 'system-config-content';
    nativeContent.id = 'ONLINE_EDIT';
    nativeContent.className = 'tab-content active';
    contentHost.appendChild(nativeContent);

    bottom.className = 'system-config-bottom';
    change.id = 'config-change-btn';
    change.textContent = '修改';
    submit.id = 'config-submit-btn';
    submit.textContent = '保存';
    submit.style.display = 'none';
    cancel.id = 'config-cancel-btn';
    cancel.textContent = '取消';
    cancel.style.display = 'none';
    bottom.appendChild(change);
    bottom.appendChild(submit);
    bottom.appendChild(cancel);

    body.appendChild(tabs);
    body.appendChild(contentHost);
    body.appendChild(bottom);
  }

  return document;
}

function createEnvironment(options = {}) {
  const document = createDocument(options.withNativeLayout !== false);
  const backendCalls = [];
  const initialMode = options.initialMode || 'edit';
  const window = {
    document,
    MutationObserver: undefined,
    callBackendMethod(manager, method, parameters) {
      backendCalls.push({ manager, method, parameters });
      if (method === 'getFacadePolicy') {
        return {
          success: true,
          data: { enabled: initialMode !== 'off', mode: initialMode }
        };
      }
      if (method === 'setFacadePolicy') {
        return {
          success: true,
          data: { enabled: parameters.enabled, mode: parameters.mode }
        };
      }
      throw new Error('Unexpected backend method: ' + method);
    }
  };
  window.window = window;
  window.parent = window;
  window.top = window;

  const context = vm.createContext({ window, document, Promise, console });
  return {
    document,
    window,
    backendCalls,
    execute() {
      vm.runInContext(adminPanelText, context, { filename: adminPanelPath });
    }
  };
}

function modeInput(panel, mode) {
  return panel.querySelector(
    'input[name="ruian-filez-mode"][value="' + mode + '"]'
  );
}

function selectMode(panel, mode) {
  panel.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.checked = input.value === mode;
  });
  const selected = modeInput(panel, mode);
  selected.dispatchEvent({ type: 'change', target: selected });
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function latestSetCall(calls) {
  const setCalls = calls.filter((call) => call.method === 'setFacadePolicy');
  return setCalls[setCalls.length - 1];
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setImmediate(resolve));
}

async function injectsNativeInlineTabAndLoadsPolicy() {
  const env = createEnvironment({ initialMode: 'edit' });
  env.execute();

  const tabs = env.document.querySelector('.system-config-header-tabs');
  const contentHost = env.document.querySelector('.system-config-content');
  const entry = env.document.getElementById('ruian-filez-admin-entry');
  const panel = env.document.getElementById('RUIAN_FILEZ');

  assert(entry, 'FileZ tab should be injected');
  assert(panel, 'FileZ inline content should be injected');
  assert.strictEqual(entry.parentNode, tabs);
  assert.strictEqual(panel.parentNode, contentHost);
  assert(hasClass(entry, 'tab'));
  assert(hasClass(panel, 'tab-content'));
  assert.strictEqual(env.document.getElementById('ruian-filez-admin-overlay'), null);

  entry.click();
  await flushPromises();

  assert(hasClass(entry, 'active'));
  assert(hasClass(panel, 'active'));
  assert.strictEqual(modeInput(panel, 'edit').checked, true);
  assert.strictEqual(modeInput(panel, 'edit').disabled, true);
  assert.strictEqual(env.document.getElementById('config-change-btn').style.display, 'block');
  assert.strictEqual(env.document.getElementById('config-submit-btn').style.display, 'none');
  assert.deepStrictEqual(plain(env.backendCalls[0]), {
    manager: 'ruianFileZViewManager',
    method: 'getFacadePolicy',
    parameters: {}
  });
}

async function editsSavesAndCancelsThroughNativeButtons() {
  const env = createEnvironment({ initialMode: 'edit' });
  env.execute();
  env.document.getElementById('ruian-filez-admin-entry').click();
  await flushPromises();

  const panel = env.document.getElementById('RUIAN_FILEZ');
  const change = env.document.getElementById('config-change-btn');
  const submit = env.document.getElementById('config-submit-btn');
  const cancel = env.document.getElementById('config-cancel-btn');

  change.click();
  assert.strictEqual(modeInput(panel, 'off').disabled, false);
  assert.strictEqual(change.style.display, 'none');
  assert.strictEqual(submit.style.display, 'block');
  assert.strictEqual(cancel.style.display, 'block');

  selectMode(panel, 'off');
  submit.click();
  await flushPromises();
  assert.deepStrictEqual(plain(latestSetCall(env.backendCalls).parameters), {
    enabled: false,
    mode: 'off'
  });
  assert.strictEqual(change.style.display, 'block');
  assert.strictEqual(modeInput(panel, 'off').disabled, true);

  change.click();
  selectMode(panel, 'view');
  cancel.click();
  assert.strictEqual(modeInput(panel, 'off').checked, true);
  assert.strictEqual(change.style.display, 'block');
}

async function leavesNativeTabHandlingUntouched() {
  const env = createEnvironment();
  env.execute();
  env.document.getElementById('ruian-filez-admin-entry').click();
  await flushPromises();
  env.document.getElementById('native-online-edit-tab').click();
  assert.strictEqual(env.window.__RUIAN_FILEZ_ADMIN_PANEL_020__.active, false);
}

function skipsPagesWithoutNativeLayout() {
  const env = createEnvironment({ withNativeLayout: false });
  env.execute();
  assert.strictEqual(env.document.getElementById('ruian-filez-admin-entry'), null);
  assert.strictEqual(env.document.getElementById('RUIAN_FILEZ'), null);
}

function isIdempotentWhenExecutedTwice() {
  const env = createEnvironment();
  env.execute();
  env.execute();
  const entries = descendants(env.document.documentElement).filter(
    (element) => element.id === 'ruian-filez-admin-entry'
  );
  const contents = descendants(env.document.documentElement).filter(
    (element) => element.id === 'RUIAN_FILEZ'
  );
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(contents.length, 1);
}

function containsNoPopupImplementation() {
  assert(!adminPanelText.includes('ruian-filez-admin-overlay'));
  assert(!adminPanelText.includes("role', 'dialog"));
  assert(!adminPanelText.includes('position:fixed'));
}

(async function main() {
  await injectsNativeInlineTabAndLoadsPolicy();
  await editsSavesAndCancelsThroughNativeButtons();
  await leavesNativeTabHandlingUntouched();
  skipsPagesWithoutNativeLayout();
  isIdempotentWhenExecutedTwice();
  containsNoPopupImplementation();
  console.log('admin-panel.js inline-tab contract tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
