'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const bootstrapPath = path.resolve(
  __dirname,
  '../../main/webapp/apps_res/ruian-filez-facade-poc/bootstrap.js'
);
const viewerPath = path.resolve(
  __dirname,
  '../../main/webapp/apps_res/ruian-filez-facade-poc/viewer.js'
);
const officeSdkPath = path.resolve(
  __dirname,
  '../../main/webapp/common/office/js/officeSDK.js'
);
const bootstrapText = fs.readFileSync(bootstrapPath, 'utf8');
const viewerText = fs.readFileSync(viewerPath, 'utf8');
const officeSdkText = fs.readFileSync(officeSdkPath, 'utf8');
const realConsole = console;
const quietConsole = {
  log() {},
  info() {},
  warn() {},
  error() {},
  table() {}
};

function createStorage() {
  const values = Object.create(null);
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(values, key)
        ? values[key]
        : null;
    },
    setItem(key, value) {
      values[key] = String(value);
    },
    removeItem(key) {
      delete values[key];
    }
  };
}

function addEventApi(target) {
  const listeners = Object.create(null);
  target.addEventListener = function (type, listener) {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(listener);
  };
  target.removeEventListener = function (type, listener) {
    const bucket = listeners[type] || [];
    const index = bucket.indexOf(listener);
    if (index >= 0) bucket.splice(index, 1);
  };
  target.dispatchEvent = function (event) {
    const bucket = (listeners[event.type] || []).slice();
    bucket.forEach((listener) => listener.call(target, event));
  };
  target.__listeners = listeners;
  return target;
}

function createElement(tagName, onAppend) {
  const element = addEventApi({
    tagName: String(tagName).toUpperCase(),
    id: '',
    type: '',
    src: '',
    async: true,
    textContent: '',
    parentNode: null,
    children: [],
    attributes: Object.create(null),
    style: {
      cssText: '',
      position: '',
      visibility: ''
    },
    scrollLeft: 0,
    scrollTop: 0,
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
        ? this.attributes[name]
        : null;
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      if (onAppend) onAppend(child);
      return child;
    },
    removeChild(child) {
      const index = this.children.indexOf(child);
      if (index >= 0) this.children.splice(index, 1);
      child.parentNode = null;
      return child;
    }
  });
  if (element.tagName === 'IFRAME') {
    element.contentWindow = {};
  }
  return element;
}

function walk(root, predicate) {
  if (!root) return null;
  if (predicate(root)) return root;
  for (const child of root.children || []) {
    const found = walk(child, predicate);
    if (found) return found;
  }
  return null;
}

function createDocument(onScriptAppend) {
  let document;
  const onAppend = (child) => {
    if (
      child.tagName === 'SCRIPT' &&
      child.id === 'ruian-filez-facade-poc-viewer'
    ) {
      onScriptAppend(child);
    }
  };
  const html = createElement('html', onAppend);
  const head = createElement('head', onAppend);
  const body = createElement('body', onAppend);
  html.appendChild(head);
  html.appendChild(body);
  document = addEventApi({
    readyState: 'complete',
    documentElement: html,
    head,
    body,
    currentScript: null,
    createElement(tagName) {
      return createElement(tagName, onAppend);
    },
    getElementById(id) {
      return walk(html, (node) => node.id === id);
    }
  });
  return document;
}

function successfulContract(overrides = {}) {
  return {
    success: true,
    code: 'OK',
    data: {
      viewUrl:
        '/seeyon/ruianFileZView.do?method=wrapper&ticket=opaque-ticket',
      sessionId: 'session-1',
      expiresAt: '2099-01-01T00:00:00.000Z',
      readyProtocol: 'postMessage-v1',
      nonce: 'nonce-1',
      ...overrides
    }
  };
}

function successfulFetch(capture, contract = successfulContract()) {
  return function fetch(url, options) {
    if (capture) {
      capture.url = url;
      capture.options = options;
    }
    return Promise.resolve({
      ok: true,
      text() {
        return Promise.resolve(JSON.stringify(contract));
      }
    });
  };
}

function successfulAjax(capture, response) {
  return {
    ajax(options) {
      let aborted = false;
      const headers = Object.create(null);
      const request = {
        setRequestHeader(name, value) {
          headers[name] = value;
        }
      };
      if (capture) {
        capture.url = options.url;
        capture.options = options;
        capture.headers = headers;
      }
      if (typeof options.beforeSend === 'function') {
        options.beforeSend(request);
      }
      Promise.resolve().then(() => {
        if (!aborted) {
          options.success(response, 'success', {});
        }
      });
      return {
        abort() {
          aborted = true;
        }
      };
    }
  };
}

function createEnvironment(options = {}) {
  let context;
  const storage =
    options.storage ||
    (options.topWindow && options.topWindow.sessionStorage) ||
    createStorage();
  const origin = 'http://localhost';
  const pathname =
    options.pathname === undefined
      ? '/seeyon/govdoc/govdoc.do'
      : options.pathname;
  const search =
    options.search === undefined
      ? '?method=summary&affairId=-6153440369511218856'
      : options.search;
  const document = createDocument((script) => {
    vm.runInContext(viewerText, context, { filename: viewerPath });
    if (typeof script.onload === 'function') script.onload();
    script.dispatchEvent({ type: 'load' });
  });
  const currentScript = createElement('script');
  currentScript.src =
    origin +
    '/seeyon/apps_res/ruian-filez-facade-poc/bootstrap.js?v=0.6.1';
  currentScript.setAttribute(
    'data-ruian-source',
    options.source || 'GLOBAL_ENV_PC'
  );
  if (options.omitServerMode !== true) {
    currentScript.setAttribute(
      'data-ruian-mode',
      options.serverMode === undefined ? 'view' : options.serverMode
    );
  }
  document.currentScript = currentScript;

  const window = addEventApi({
    name: options.windowName || '',
    document,
    console: quietConsole,
    sessionStorage: storage,
    location: {
      origin,
      pathname,
      search,
      href: origin + pathname + search
    },
    _ctxPath: '/seeyon',
    URL,
    AbortController:
      typeof AbortController === 'function' ? AbortController : undefined,
    $: options.$,
    CsrfGuard: options.CsrfGuard,
    fetch:
      options.fetch ||
      successfulFetch(options.fetchCapture, options.contract),
    setTimeout,
    clearTimeout,
    getComputedStyle(element) {
      return {
        position: element.style.position || 'static'
      };
    }
  });
  window.window = window;
  window.top = options.topWindow || window;

  context = vm.createContext({
    window,
    document,
    console: quietConsole,
    Date,
    Math,
    Object,
    Array,
    Promise,
    RegExp,
    JSON,
    Error,
    Number,
    String,
    Boolean,
    URL,
    encodeURIComponent,
    decodeURIComponent,
    isFinite,
    setTimeout,
    clearTimeout
  });

  const container = createElement('div');
  container.id = 'officeEditorFrame';
  container.style.position = 'absolute';
  const sentinel = createElement('span');
  sentinel.id = 'native-sentinel';
  container.appendChild(sentinel);
  document.body.appendChild(container);

  vm.runInContext(bootstrapText, context, { filename: bootstrapPath });
  return {
    window,
    document,
    context,
    container,
    sentinel,
    storage,
    currentScript
  };
}

function createOfficeSdk(environment) {
  const resolverKey = '__SEEYON_OFFICE_ADAPTER_RESOLVERS__';
  const adapters = Object.create(null);
  const counters = {
    constructed: 0,
    initCalls: 0,
    bypassInitCalls: 0,
    nativeInit: 0,
    publicOpen: 0,
    nativeAdapterOpen: 0,
    publicSave: 0,
    nativeAdapterSave: 0,
    initCallbacks: 0,
    openCallbacks: 0,
    registerCalls: 0,
    customAdapterInstances: 0,
    nativeOpenParams: []
  };

  function resolverQueue() {
    if (!environment.window[resolverKey]) {
      environment.window[resolverKey] = [];
    }
    return environment.window[resolverKey];
  }

  function nativeAdapter() {
    return {
      openFile(params, callback) {
        counters.nativeAdapterOpen += 1;
        counters.nativeOpenParams.push({ ...(params || {}) });
        if (callback) callback(null, 'native-open');
        return Promise.resolve('native-open');
      },
      saveFile(params, callback) {
        counters.nativeAdapterSave += 1;
        if (callback) callback(null, 'native-save');
        return Promise.resolve('native-save');
      },
      destroy(params, callback) {
        if (callback) callback(null, true);
        return true;
      },
      closeFile(params, callback) {
        if (callback) callback(null, true);
      },
      isClientApp() {
        return false;
      },
      getContainerAttributes(params, callback) {
        callback(null, { ScrollLeft: 0, ScrollTop: 0 });
      },
      setScrollTo(params, callback) {
        callback(null, true);
      }
    };
  }

  function decorate(instance, method, params, callback) {
    const adapter = instance.adapterInstance;
    if (!adapter || typeof adapter[method] !== 'function') {
      return Promise.reject(
        Object.assign(new Error('adapter method missing'), {
          code: 'ADAPTER_METHOD_MISSING'
        })
      );
    }
    return adapter[method](params || {}, callback);
  }

  function resolveAdapter(instance) {
    const nativeMap = {
      key: 'NATIVE',
      url: ['/common/office/js/native-adapter.js']
    };
    const queue = resolverQueue().slice();
    for (const entry of queue) {
      if (!entry || typeof entry.resolve !== 'function') continue;
      const resolved = entry.resolve(instance, instance.params, nativeMap);
      if (
        resolved &&
        typeof resolved.key === 'string' &&
        resolved.url &&
        resolved.url.length
      ) {
        return resolved;
      }
    }
    return nativeMap;
  }

  function loadRegisteredAdapter(map) {
    if (map.key === 'NATIVE') return;
    if (!adapters[map.key]) {
      assert.deepStrictEqual(
        Array.from(map.url),
        [
          '/apps_res/ruian-filez-facade-poc/viewer.js?v=0.6.1'
        ],
        'resolver must load only the independently owned FileZ adapter'
      );
      vm.runInContext(viewerText, environment.context, {
        filename: viewerPath
      });
    }
  }

  function OfficeSDK(params) {
    counters.constructed += 1;
    this.params = {
      webRoot: 'http://localhost/seeyon',
      ...(params || {})
    };
    this.adapterInstance = null;
    this.Adapter = null;
    this.pluginKey = null;
  }
  OfficeSDK.ENUM_MODE_TYPE = {
    VIEW: 'VIEW',
    EDIT: 'EDIT',
    SIGN: 'SIGN'
  };
  OfficeSDK.utils = {
    getWebRoot() {
      return 'http://localhost/seeyon';
    }
  };
  OfficeSDK.register = function register(name, Adapter) {
    counters.registerCalls += 1;
    if (!adapters[name]) adapters[name] = Adapter;
  };
  OfficeSDK.getAdapter = function getAdapter(name) {
    return adapters[name] || null;
  };
  OfficeSDK.registerAdapterResolver =
    function registerAdapterResolver(name, resolver) {
      const normalized = String(name || '').trim();
      const queue = resolverQueue();
      if (!normalized || typeof resolver !== 'function') return false;
      for (let index = 0; index < queue.length; index += 1) {
        if (queue[index] && queue[index].name === normalized) {
          queue[index] = { name: normalized, resolve: resolver };
          return true;
        }
      }
      queue.push({ name: normalized, resolve: resolver });
      return true;
    };
  OfficeSDK.unregisterAdapterResolver =
    function unregisterAdapterResolver(name) {
      const queue = resolverQueue();
      for (let index = queue.length - 1; index >= 0; index -= 1) {
        if (queue[index] && queue[index].name === name) {
          queue.splice(index, 1);
        }
      }
    };
  OfficeSDK.prototype.init = function init(params, callback) {
    counters.initCalls += 1;
    Object.assign(this.params, params || {});
    if (this.params.__ruianFilezBypass === true) {
      counters.bypassInitCalls += 1;
    }
    const map = resolveAdapter(this);
    this.pluginKey = map.key;
    if (map.key === 'NATIVE') {
      counters.nativeInit += 1;
      this.adapterInstance = nativeAdapter();
      if (callback) {
        counters.initCallbacks += 1;
        callback(null, 'native-init');
      }
      return Promise.resolve('native-init');
    }

    loadRegisteredAdapter(map);
    const Adapter = OfficeSDK.getAdapter(map.key);
    assert.strictEqual(
      typeof Adapter,
      'function',
      'viewer.js must synchronously register its adapter constructor'
    );
    this.Adapter = Adapter;
    this.adapterInstance = new Adapter(
      this.params,
      OfficeSDK.utils,
      this
    );
    counters.customAdapterInstances += 1;

    return new Promise((resolve, reject) => {
      let completed = false;
      const done = (error, result) => {
        if (completed) return;
        completed = true;
        if (callback) {
          counters.initCallbacks += 1;
          callback(error, result);
        }
        if (error) reject(error);
        else resolve(result);
      };
      if (typeof this.adapterInstance.init === 'function') {
        this.adapterInstance.init({}, done);
      } else {
        done(null, true);
      }
    });
  };
  OfficeSDK.prototype.openFile = function openFile(params, callback) {
    counters.publicOpen += 1;
    return decorate(this, 'openFile', params, callback && ((error, result) => {
      counters.openCallbacks += 1;
      callback(error, result);
    }));
  };
  OfficeSDK.prototype.saveFile = function saveFile(params, callback) {
    counters.publicSave += 1;
    return decorate(this, 'saveFile', params, callback);
  };
  OfficeSDK.prototype.destroy = function destroy(params, callback) {
    if (!this.adapterInstance) return undefined;
    return this.adapterInstance.destroy(params || {}, callback);
  };
  OfficeSDK.prototype.closeFile = function closeFile(params, callback) {
    return decorate(this, 'closeFile', params, callback);
  };
  OfficeSDK.prototype.isClientApp = function isClientApp() {
    return this.adapterInstance
      ? this.adapterInstance.isClientApp()
      : null;
  };
  OfficeSDK.prototype.isAvailable = function isAvailable() {
    return this.adapterInstance
      ? this.adapterInstance.isAvailable()
      : false;
  };
  OfficeSDK.prototype.isModified = function isModified(
    params,
    callback
  ) {
    return decorate(this, 'isModified', params, callback);
  };
  OfficeSDK.prototype.isEmpty = function isEmpty(params, callback) {
    return decorate(this, 'isEmpty', params, callback);
  };
  OfficeSDK.prototype.fileExists = function fileExists(
    params,
    callback
  ) {
    return decorate(this, 'fileExists', params, callback);
  };
  OfficeSDK.prototype.isAllowSignature =
    function isAllowSignature() {
      return this.adapterInstance
        ? this.adapterInstance.isAllowSignature()
        : false;
    };
  OfficeSDK.prototype.isAllowTransform =
    function isAllowTransform() {
      return this.adapterInstance
        ? this.adapterInstance.isAllowTransform()
        : false;
    };
  OfficeSDK.prototype.getQpJson = function getQpJson() {
    return this.adapterInstance
      ? this.adapterInstance.getQpJson()
      : null;
  };
  OfficeSDK.prototype.setQpJson = function setQpJson(value) {
    return this.adapterInstance
      ? this.adapterInstance.setQpJson(value)
      : false;
  };
  OfficeSDK.prototype.getContainerAttributes =
    function getContainerAttributes(params, callback) {
      return decorate(this, 'getContainerAttributes', params, callback);
    };
  OfficeSDK.prototype.setScrollTo = function setScrollTo(
    params,
    callback
  ) {
    return decorate(this, 'setScrollTo', params, callback);
  };

  return {
    OfficeSDK,
    counters,
    adapters,
    originalInit: OfficeSDK.prototype.init,
    resolverQueue
  };
}

function assignSdk(environment, sdk) {
  environment.window.$SDK = sdk.OfficeSDK;
  environment.window.OfficeSDK = sdk.OfficeSDK;
}

function wordViewParams(overrides = {}) {
  return {
    category: 4,
    fileId: '-1010101010101010101',
    createDate: '2026-07-31',
    fileType: 'docx',
    fileName: '公文测试.docx',
    domId: 'officeEditorFrame',
    viewMode: 'view',
    ...overrides
  };
}

function findFilezFrame(container) {
  return walk(
    container,
    (node) => node.getAttribute &&
      node.getAttribute('data-ruian-filez-frame') === 'true'
  );
}

function findFilezHost(container) {
  return walk(
    container,
    (node) => node.getAttribute &&
      node.getAttribute('data-ruian-filez-view') === 'true'
  );
}

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function testLiveViewSuccessAndExactContracts() {
  const fetchCapture = {};
  const env = createEnvironment({
    fetchCapture,
    CsrfGuard: {
      getToken() {
        return 'fetch-csrf-token';
      }
    }
  });
  const sdk = createNativeSdk();
  assignSdk(env, sdk);

  assert.strictEqual(env.window.OfficeSDK, sdk.NativeOfficeSDK);
  assert.strictEqual(env.window.$SDK, sdk.NativeOfficeSDK);
  assert.strictEqual(env.window.__RUIAN_FILEZ_FACADE_POC__.version, '0.6.1');

  const instance = new env.window.OfficeSDK(wordViewParams());
  let initCallbackCount = 0;
  await instance.init(
    { domId: 'officeEditorFrame', mode: 'VIEW' },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      initCallbackCount += 1;
    }
  );

  assert(instance instanceof sdk.NativeOfficeSDK);
  assert.strictEqual(initCallbackCount, 1);
  assert.strictEqual(sdk.counters.nativeInit, 0);
  assert.strictEqual(instance.pluginKey, 'RUIAN_FILEZ_VIEW_ONLY');

  let openCallbackCount = 0;
  const openPromise = instance.openFile(
    { isHide: false, isDialog: false },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      openCallbackCount += 1;
    }
  );
  await flush();

  const iframe = findFilezFrame(env.container);
  assert(iframe, 'FileZ iframe should be mounted');
  assert.strictEqual(
    env.container.children.includes(env.sentinel),
    true,
    'native children must not be removed'
  );
  assert(fetchCapture.url.includes('managerName=ruianFileZViewManager'));
  assert(fetchCapture.url.includes('managerMethod=createViewSession'));
  assert.strictEqual(
    fetchCapture.options.headers['X-Requested-With'],
    'XMLHttpRequest'
  );
  assert.strictEqual(
    fetchCapture.options.headers.CSRFTOKEN,
    'fetch-csrf-token'
  );
  const bodyValue = decodeURIComponent(
    fetchCapture.options.body.slice('arguments='.length)
  );
  const requestPayload = JSON.parse(bodyValue)[0];
  assert.deepStrictEqual(requestPayload, {
    affairId: '-6153440369511218856',
    fileId: '-1010101010101010101',
    fileType: 'docx',
    category: 4,
    mode: 'view'
  });
  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(requestPayload, 'userId'),
    false
  );

  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: iframe.contentWindow,
    data: {
      channel: 'ruian-filez-view',
      protocol: 'postMessage-v1',
      type: 'READY',
      nonce: 'nonce-1',
      sessionId: 'session-1'
    }
  });
  assert.strictEqual(await openPromise, true);
  assert.strictEqual(openCallbackCount, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 0);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.readyCount,
    1
  );

  assert.strictEqual(instance.isAvailable(), true);
  assert.strictEqual(await instance.isModified({}), false);
  assert.strictEqual(await instance.isEmpty({}), false);
  assert.strictEqual(instance.isAllowSignature(), false);
  assert.strictEqual(instance.isAllowTransform(), false);
  assert.strictEqual(instance.getQpJson(), null);
  assert.strictEqual(instance.setQpJson('{}'), false);
  assert.strictEqual(await instance.fileExists({}), true);

  await assert.rejects(
    instance.saveFile({ isAsync: false }),
    (error) => error && error.code === 'FILEZ_VIEW_ONLY'
  );
  assert.strictEqual(sdk.counters.nativeAdapterSave, 0);
}

async function testReadyMessageIsStrictlyAuthenticated() {
  const env = createEnvironment();
  const sdk = createNativeSdk();
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  await instance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });

  let resolved = false;
  const openPromise = instance.openFile({}).then(() => {
    resolved = true;
  });
  await flush();
  const iframe = findFilezFrame(env.container);
  assert(iframe);

  const baseMessage = {
    channel: 'ruian-filez-view',
    protocol: 'postMessage-v1',
    type: 'READY',
    nonce: 'nonce-1',
    sessionId: 'session-1'
  };
  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://evil.example',
    source: iframe.contentWindow,
    data: baseMessage
  });
  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: {},
    data: baseMessage
  });
  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: iframe.contentWindow,
    data: { ...baseMessage, nonce: 'wrong' }
  });
  await flush();
  assert.strictEqual(resolved, false);

  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: iframe.contentWindow,
    data: baseMessage
  });
  await openPromise;
  assert.strictEqual(resolved, true);
}

async function testJQueryPreferredAndWrappedEpochContracts() {
  const cases = [
    {
      label: 'epoch number in result object',
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      wrap(contract) {
        return { result: contract };
      }
    },
    {
      label: 'epoch numeric string in JSON result',
      expiresAt: String(Date.now() + 3600000),
      wrap(contract) {
        return { result: JSON.stringify(contract) };
      }
    }
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const testCase = cases[index];
    const ajaxCapture = {};
    let fetchCalls = 0;
    const contract = successfulContract({
      expiresAt: testCase.expiresAt,
      sessionId: `jquery-session-${index}`,
      nonce: `jquery-nonce-${index}`
    });
    let csrfCalls = 0;
    const env = createEnvironment({
      $: successfulAjax(ajaxCapture, testCase.wrap(contract)),
      CsrfGuard: {
        beforeAjaxSend(request) {
          csrfCalls += 1;
          request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          request.setRequestHeader('CSRFTOKEN', 'jquery-csrf-token');
        }
      },
      fetch() {
        fetchCalls += 1;
        return Promise.reject(new Error('fetch must not be used'));
      }
    });
    const sdk = createNativeSdk();
    assignSdk(env, sdk);
    const instance = new env.window.OfficeSDK(wordViewParams());

    await instance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });
    const openPromise = instance.openFile({});
    await flush();

    const iframe = findFilezFrame(env.container);
    assert(iframe, `${testCase.label} should mount FileZ`);
    assert.strictEqual(fetchCalls, 0, 'A8 jQuery AJAX must be preferred');
    assert.strictEqual(csrfCalls, 1, 'A8 CSRF hook must run once');
    assert.strictEqual(
      ajaxCapture.headers['X-Requested-With'],
      'XMLHttpRequest'
    );
    assert.strictEqual(
      ajaxCapture.headers.CSRFTOKEN,
      'jquery-csrf-token'
    );
    assert(
      ajaxCapture.url.includes('managerName=ruianFileZViewManager')
    );
    assert.deepStrictEqual(
      JSON.parse(ajaxCapture.options.data.arguments)[0],
      {
        affairId: '-6153440369511218856',
        fileId: '-1010101010101010101',
        fileType: 'docx',
        category: 4,
        mode: 'view'
      }
    );

    env.window.dispatchEvent({
      type: 'message',
      origin: 'http://localhost',
      source: iframe.contentWindow,
      data: {
        channel: 'ruian-filez-view',
        protocol: 'postMessage-v1',
        type: 'READY',
        nonce: `jquery-nonce-${index}`,
        sessionId: `jquery-session-${index}`
      }
    });
    assert.strictEqual(await openPromise, true);
  }
}

async function testBackendFailureFallsBackToNativeOnce() {
  const env = createEnvironment({
    fetch() {
      return Promise.resolve({
        ok: true,
        text() {
          return Promise.resolve(
            JSON.stringify({
              success: false,
              code: 'CONFIG_MISSING',
              message: 'not configured'
            })
          );
        }
      });
    }
  });
  const sdk = createNativeSdk();
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  let initCallbacks = 0;
  let openCallbacks = 0;

  await instance.init(
    { domId: 'officeEditorFrame', mode: 'VIEW' },
    () => {
      initCallbacks += 1;
    }
  );
  const result = await instance.openFile({}, (error, value) => {
    assert.ifError(error);
    assert.strictEqual(value, 'native-open');
    openCallbacks += 1;
  });

  assert.strictEqual(result, 'native-open');
  assert.strictEqual(initCallbacks, 1);
  assert.strictEqual(openCallbacks, 1);
  assert.strictEqual(sdk.counters.nativeInit, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 1);
  assert.strictEqual(findFilezHost(env.container), null);
  assert.strictEqual(env.container.children.includes(env.sentinel), true);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.fallbackCount,
    1
  );
}

async function testStrictRoutesStayNative() {
  const cases = [
    { label: 'PDF', params: { fileType: 'pdf' } },
    { label: 'PowerPoint', params: { fileType: 'pptx' } },
    { label: 'category', params: { category: 1 } },
    { label: 'dom', params: { domId: 'attachmentViewer' } },
    { label: 'edit', params: { viewMode: 'edit' }, mode: 'EDIT' },
    { label: 'file id', params: { fileId: 'not-a-long' } }
  ];

  for (const testCase of cases) {
    const env = createEnvironment();
    const sdk = createNativeSdk();
    assignSdk(env, sdk);
    const instance = new env.window.OfficeSDK(
      wordViewParams(testCase.params)
    );
    await instance.init({
      domId: testCase.params.domId || 'officeEditorFrame',
      mode: testCase.mode || 'VIEW'
    });
    assert.strictEqual(
      sdk.counters.nativeInit,
      1,
      `${testCase.label} should use native init`
    );
    assert.strictEqual(instance.pluginKey, 'NATIVE');
  }

  const iframeEnv = createEnvironment({
    pathname: '/seeyon/content/content.do',
    search: '?filezFacade=view'
  });
  const iframeSdk = createNativeSdk();
  assignSdk(iframeEnv, iframeSdk);
  const iframeInstance = new iframeEnv.window.OfficeSDK(wordViewParams());
  await iframeInstance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });
  assert.strictEqual(iframeSdk.counters.nativeInit, 1);
  assert.strictEqual(
    iframeEnv.window.__RUIAN_FILEZ_FACADE_POC__.installStatus,
    'disabled-surface'
  );
}

async function testShadowOnlyObservesAndCallsNative() {
  const env = createEnvironment({
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=shadow'
  });
  const sdk = createNativeSdk();
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  const result = await instance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  assert.strictEqual(result, 'native-init');
  assert.strictEqual(sdk.counters.nativeInit, 1);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.matchedCount,
    1
  );
  assert.strictEqual(findFilezHost(env.container), null);
}

async function testHiddenAndPrintVariantsFallbackBeforeFilez() {
  for (const openParams of [
    { isHide: true },
    { isDialog: true },
    { zwPrint: true },
    { openBeforeFun() {} }
  ]) {
    const env = createEnvironment();
    const sdk = createNativeSdk();
    assignSdk(env, sdk);
    const instance = new env.window.OfficeSDK(wordViewParams());
    await instance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });
    const result = await instance.openFile(openParams);
    assert.strictEqual(result, 'native-open');
    assert.strictEqual(sdk.counters.nativeInit, 1);
    assert.strictEqual(sdk.counters.nativeAdapterOpen, 1);
    assert.strictEqual(findFilezHost(env.container), null);
  }
}

async function testTopOffIsAtomicAcrossFrames() {
  const storage = createStorage();
  const topEnv = createEnvironment({ storage });
  const sdk = createNativeSdk();
  assignSdk(topEnv, sdk);
  assert.notStrictEqual(sdk.NativeOfficeSDK.prototype.init, sdk.originalInit);

  const childEnv = createEnvironment({
    topWindow: topEnv.window,
    pathname: '/seeyon/content/content.do',
    search: '?filezFacade=view',
    storage
  });
  assert.strictEqual(
    childEnv.window.__RUIAN_FILEZ_FACADE_POC__.mode,
    'view',
    'child uses the top coordinator, not its own URL'
  );

  topEnv.window.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
    'off',
    'unit-test'
  );
  assert.strictEqual(storage.getItem('ruian.filez.facade.mode'), null);
  assert.strictEqual(sdk.NativeOfficeSDK.prototype.init, sdk.originalInit);
  assert.strictEqual(
    topEnv.window.__RUIAN_FILEZ_FACADE_CONTROL__.registry.length,
    0
  );
  assert.strictEqual(
    topEnv.document.getElementById('ruian-filez-facade-poc-badge'),
    null
  );
  assert.strictEqual(
    childEnv.window.__RUIAN_FILEZ_FACADE_POC__.mode,
    'off'
  );
}

async function testTopOffSettlesPendingReadyWithNativeFallback() {
  const env = createEnvironment();
  const sdk = createNativeSdk();
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  let openCallbacks = 0;

  await instance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });
  const openPromise = instance.openFile({}, (error, value) => {
    assert.ifError(error);
    assert.strictEqual(value, 'native-open');
    openCallbacks += 1;
  });
  await flush();
  assert(findFilezFrame(env.container), 'READY should still be pending');

  env.window.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
    'off',
    'pending-ready-test'
  );

  const result = await Promise.race([
    openPromise,
    new Promise((resolve) => {
      setTimeout(() => resolve('timed-out'), 1000);
    })
  ]);
  assert.strictEqual(result, 'native-open');
  assert.strictEqual(openCallbacks, 1);
  assert.strictEqual(sdk.counters.nativeInit, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 1);
  assert.strictEqual(findFilezHost(env.container), null);
}

async function testTopOffOverridesChildViewQuery() {
  const storage = createStorage();
  storage.setItem('ruian.filez.facade.mode', 'view');
  const topEnv = createEnvironment({
    storage,
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=off'
  });
  const childEnv = createEnvironment({
    topWindow: topEnv.window,
    pathname: '/seeyon/content/content.do',
    search: '?filezFacade=view',
    storage
  });
  assert.strictEqual(
    topEnv.window.__RUIAN_FILEZ_FACADE_CONTROL__.mode,
    'off'
  );
  assert.strictEqual(
    childEnv.window.__RUIAN_FILEZ_FACADE_POC__.mode,
    'off'
  );
  assert.strictEqual(storage.getItem('ruian.filez.facade.mode'), null);
}

async function contractNoOfficeSdkHijackAndResolverIsIdempotent() {
  assert(
    /var VERSION = '0\.6\.1'/.test(bootstrapText) &&
      /var VERSION = '0\.6\.1'/.test(viewerText),
    'bootstrap and viewer must publish the same 0.6.1 contract version'
  );
  assert(
    /__RUIAN_FILEZ_FACADE_BRIDGE_060__/.test(bootstrapText) &&
      /__RUIAN_FILEZ_FACADE_BRIDGE_060__/.test(viewerText) &&
      /__RUIAN_FILEZ_VIEWER_060__/.test(bootstrapText) &&
      /__RUIAN_FILEZ_VIEWER_060__/.test(viewerText),
    'bootstrap and viewer must share the 060 internal keys'
  );
  assert.strictEqual(
    /_040__/.test(bootstrapText + viewerText),
    false,
    '0.6.1 runtime files must not retain 040 internal globals'
  );
  assert.strictEqual(
    /Object\.defineProperty\s*\(\s*window\s*,\s*['"]OfficeSDK['"]/.test(
      bootstrapText
    ),
    false,
    'bootstrap must not trap or replace window.OfficeSDK'
  );
  assert.strictEqual(
    /OfficeSDK\.prototype\.[A-Za-z0-9_$]+\s*=/.test(bootstrapText),
    false,
    'bootstrap must not rewrite OfficeSDK.prototype'
  );
  assert(
    /DEFAULT_REQUEST_TIMEOUT\s*=\s*45000/.test(viewerText),
    'cold A8 session creation must retain the verified 45 second timeout'
  );
  assert(
    /DEFAULT_READY_TIMEOUT\s*=\s*60000/.test(viewerText),
    'FileZ wrapper READY must retain the 60 second cold-start allowance'
  );
  assert(
    /OfficeSDK\.register\(ADAPTER_KEY,\s*FilezOfficeAdapter\)/.test(
      viewerText
    ),
    'viewer must register a normal OfficeSDK adapter constructor'
  );

  const env = createEnvironment();
  const sdk = createOfficeSdk(env);
  assignSdk(env, sdk);
  const originalInit = sdk.OfficeSDK.prototype.init;
  const originalConstructor = env.window.OfficeSDK;

  assert.strictEqual(sdk.resolverQueue().length, 1);
  assert.strictEqual(
    sdk.resolverQueue()[0].name,
    'ruian-filez-view-edit'
  );

  vm.runInContext(bootstrapText, env.context, {
    filename: bootstrapPath
  });
  assert.strictEqual(env.window.OfficeSDK, originalConstructor);
  assert.strictEqual(sdk.OfficeSDK.prototype.init, originalInit);
  assert.strictEqual(sdk.resolverQueue().length, 1);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.duplicateLoads,
    1
  );

  env.window.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
    'shadow',
    'idempotency-test'
  );
  env.window.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
    'view',
    'idempotency-test'
  );
  assert.strictEqual(
    sdk.resolverQueue().filter(
      (entry) => entry.name === 'ruian-filez-view-edit'
    ).length,
    1,
    'mode changes must replace the named resolver, not append duplicates'
  );

  env.window.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
    'off',
    'idempotency-test'
  );
  assert.strictEqual(sdk.resolverQueue().length, 0);
  assert.strictEqual(env.window.OfficeSDK, originalConstructor);
  assert.strictEqual(sdk.OfficeSDK.prototype.init, originalInit);
}

function contractOfficeSdkResolverHandlesMissingDeclaredFileType() {
  const mapStart = officeSdkText.indexOf('  function getAdapterMap(params, config) {');
  const mapEnd = officeSdkText.indexOf('\n  /**\n   * 加载adapter', mapStart);
  const runtimeStart = officeSdkText.indexOf(
    '  // RUIAN-FILEZ-ADAPTER-RESOLVER-RUNTIME-BEGIN'
  );
  const runtimeEndMarker =
    '  // RUIAN-FILEZ-ADAPTER-RESOLVER-RUNTIME-END';
  const runtimeEnd =
    officeSdkText.indexOf(runtimeEndMarker, runtimeStart) + runtimeEndMarker.length;
  assert(mapStart >= 0 && mapEnd > mapStart);
  assert(runtimeStart >= 0 && runtimeEnd > runtimeStart);

  const context = vm.createContext({
    console: quietConsole,
    window: { console: quietConsole }
  });
  vm.runInContext(
    [
      "var ADAPTER_KEY={NATIVE_WORD:['/native-word.js'],NATIVE_PDF:['/native-pdf.js']};",
      'var officeAdapterResolvers=[];',
      officeSdkText.slice(mapStart, mapEnd),
      officeSdkText.slice(runtimeStart, runtimeEnd),
      'this.invoke=function(params,config,resolver){',
      'officeAdapterResolvers=resolver?[{name:"test",resolve:resolver}]:[];',
      'var instance={pluginKey:""};',
      'return {map:getAdapterMap.call(instance,params,config),params:params,pluginKey:instance.pluginKey};',
      '};'
    ].join('\n'),
    context,
    { filename: officeSdkPath }
  );

  const custom = context.invoke(
    { fileType: '', fileName: 'blank.xlsx', mode: 'EDIT' },
    { WORD: { EDIT: 'NATIVE_WORD' }, PDF: { VIEW: 'NATIVE_PDF' } },
    (instance, params) => {
      params.fileType = 'xlsx';
      return {
        key: 'RUIAN_FILEZ_EDIT',
        url: ['/apps_res/ruian-filez-facade-poc/editor.js']
      };
    }
  );
  assert.strictEqual(custom.map.key, 'RUIAN_FILEZ_EDIT');
  assert.strictEqual(custom.params.fileType, 'xlsx');

  const nativePdf = context.invoke(
    { fileType: 'pdf', mode: 'VIEW' },
    { WORD: { EDIT: 'NATIVE_WORD' }, PDF: { VIEW: 'NATIVE_PDF' } },
    null
  );
  assert.strictEqual(nativePdf.map.key, 'NATIVE_PDF');
  assert.strictEqual(nativePdf.pluginKey, 'NATIVE_PDF');

  const unresolved = context.invoke(
    { fileType: '', mode: 'EDIT' },
    { WORD: { EDIT: 'NATIVE_WORD' }, PDF: { VIEW: 'NATIVE_PDF' } },
    null
  );
  assert.strictEqual(unresolved.map, false);
}

async function contractWordViewRegistersAdapterAndReachesReadyOnce() {
  const fetchCapture = {};
  const env = createEnvironment({
    fetchCapture,
    CsrfGuard: {
      getToken() {
        return 'csrf-contract-token';
      }
    }
  });
  const sdk = createOfficeSdk(env);
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  let initCallbackCount = 0;

  const initResult = await instance.init(
    { domId: 'officeEditorFrame', mode: 'VIEW' },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      initCallbackCount += 1;
    }
  );

  assert.strictEqual(initResult, true);
  assert.strictEqual(initCallbackCount, 1);
  assert.strictEqual(sdk.counters.initCallbacks, 1);
  assert.strictEqual(sdk.counters.nativeInit, 0);
  assert.strictEqual(instance.pluginKey, 'RUIAN_FILEZ_VIEW');
  assert.strictEqual(
    typeof sdk.adapters.RUIAN_FILEZ_VIEW,
    'function'
  );
  assert.strictEqual(instance.Adapter, sdk.adapters.RUIAN_FILEZ_VIEW);
  assert.strictEqual(sdk.counters.registerCalls, 1);
  assert.strictEqual(sdk.counters.customAdapterInstances, 1);

  let openCallbackCount = 0;
  let openBeforeCount = 0;
  let settled = false;
  const openPromise = instance.openFile(
    {
      openBeforeFun() {
        openBeforeCount += 1;
      }
    },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      openCallbackCount += 1;
    }
  ).then((result) => {
    settled = true;
    return result;
  });
  await flush();

  const iframe = findFilezFrame(env.container);
  assert(iframe, 'successful session must mount the FileZ iframe');
  assert.strictEqual(openBeforeCount, 1);
  assert.strictEqual(settled, false, 'open waits for authenticated READY');
  assert(
    fetchCapture.url.includes('managerName=ruianFileZViewManager')
  );
  assert(
    fetchCapture.url.includes('managerMethod=createViewSession')
  );
  assert.strictEqual(
    fetchCapture.options.headers.CSRFTOKEN,
    'csrf-contract-token'
  );

  const requestPayload = JSON.parse(
    decodeURIComponent(
      fetchCapture.options.body.slice('arguments='.length)
    )
  )[0];
  assert.deepStrictEqual(requestPayload, {
    affairId: '-6153440369511218856',
    fileId: '-1010101010101010101',
    fileType: 'docx',
    category: 4,
    mode: 'view'
  });

  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: iframe.contentWindow,
    data: {
      channel: 'ruian-filez-view',
      protocol: 'postMessage-v1',
      type: 'READY',
      nonce: 'wrong-nonce',
      sessionId: 'session-1'
    }
  });
  await flush();
  assert.strictEqual(settled, false, 'wrong nonce must not unlock FileZ');

  env.window.dispatchEvent({
    type: 'message',
    origin: 'http://localhost',
    source: iframe.contentWindow,
    data: {
      channel: 'ruian-filez-view',
      protocol: 'postMessage-v1',
      type: 'READY',
      nonce: 'nonce-1',
      sessionId: 'session-1'
    }
  });

  assert.strictEqual(await openPromise, true);
  assert.strictEqual(openCallbackCount, 1);
  assert.strictEqual(sdk.counters.openCallbacks, 1);
  assert.strictEqual(openBeforeCount, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 0);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.readyCount,
    1
  );
  assert.strictEqual(instance.isAvailable(), true);
  assert.strictEqual(await instance.isModified({}), false);
  assert.strictEqual(await instance.fileExists({}), true);
}

async function contractChildUsesTopGovdocSurface() {
  const storage = createStorage();
  const topEnv = createEnvironment({ storage });
  const childEnv = createEnvironment({
    storage,
    topWindow: topEnv.window,
    pathname: '/seeyon/content/content.do',
    search: '?filezFacade=off',
    windowName: 'govDocZwIframe'
  });
  const childSdk = createOfficeSdk(childEnv);
  assignSdk(childEnv, childSdk);
  const childInstance = new childEnv.window.OfficeSDK(
    wordViewParams()
  );

  await childInstance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  assert.strictEqual(
    childInstance.pluginKey,
    'RUIAN_FILEZ_VIEW',
    'child content iframe must route from the same-origin top govdoc URL'
  );
  assert.strictEqual(childSdk.counters.nativeInit, 0);

  const otherTop = createEnvironment({
    pathname: '/seeyon/collaboration/collaboration.do'
  });
  const govdocNamedChild = createEnvironment({
    topWindow: otherTop.window,
    pathname: '/seeyon/govdoc/govdoc.do',
    search: '?filezFacade=view'
  });
  const nativeSdk = createOfficeSdk(govdocNamedChild);
  assignSdk(govdocNamedChild, nativeSdk);
  const nativeInstance = new govdocNamedChild.window.OfficeSDK(
    wordViewParams()
  );
  await nativeInstance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  assert.strictEqual(
    nativeInstance.pluginKey,
    'NATIVE',
    'a child pathname must not spoof a non-govdoc top surface'
  );
  assert.strictEqual(nativeSdk.counters.nativeInit, 1);
}

async function contractRoutesModesAndResolverPrecision() {
  const passThroughCases = [
    {
      label: 'PDF view',
      params: { fileType: 'pdf' },
      mode: 'VIEW'
    },
    {
      label: 'Word edit',
      params: { viewMode: 'edit' },
      mode: 'EDIT'
    },
    {
      label: 'wrong category',
      params: { category: 1 },
      mode: 'VIEW'
    },
    {
      label: 'wrong container',
      params: { domId: 'attachmentViewer' },
      mode: 'VIEW'
    }
  ];

  for (const testCase of passThroughCases) {
    const env = createEnvironment();
    const sdk = createOfficeSdk(env);
    assignSdk(env, sdk);
    const instance = new env.window.OfficeSDK(
      wordViewParams(testCase.params)
    );
    await instance.init({
      domId: testCase.params.domId || 'officeEditorFrame',
      mode: testCase.mode
    });
    assert.strictEqual(
      instance.pluginKey,
      'NATIVE',
      `${testCase.label} must remain on the native adapter`
    );
    assert.strictEqual(sdk.counters.nativeInit, 1);
    assert.strictEqual(sdk.counters.registerCalls, 0);
  }

  const shadowEnv = createEnvironment({
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=shadow'
  });
  const shadowSdk = createOfficeSdk(shadowEnv);
  assignSdk(shadowEnv, shadowSdk);
  const shadowInstance = new shadowEnv.window.OfficeSDK(
    wordViewParams()
  );
  await shadowInstance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  assert.strictEqual(shadowInstance.pluginKey, 'NATIVE');
  assert.strictEqual(shadowSdk.counters.nativeInit, 1);
  assert.strictEqual(
    shadowEnv.window.__RUIAN_FILEZ_FACADE_POC__.matchedCount,
    1,
    'shadow mode observes a precise hit without replacing the adapter'
  );

  const offEnv = createEnvironment({
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=off'
  });
  const offSdk = createOfficeSdk(offEnv);
  assignSdk(offEnv, offSdk);
  assert.strictEqual(offSdk.resolverQueue().length, 0);
  const offInstance = new offEnv.window.OfficeSDK(wordViewParams());
  await offInstance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  assert.strictEqual(offInstance.pluginKey, 'NATIVE');
  assert.strictEqual(offSdk.counters.nativeInit, 1);
}

function contractNewCollaborationEditRouting() {
  function resolve(options = {}) {
    const env = createEnvironment({
      pathname: '/seeyon/collaboration/collaboration.do',
      search: options.search || '?method=newColl',
      serverMode: options.serverMode || 'edit'
    });
    const sdk = createOfficeSdk(env);
    assignSdk(env, sdk);

    const resolver = sdk.resolverQueue().find(
      (entry) => entry && entry.name === 'ruian-filez-view-edit'
    );
    assert(resolver, 'the FileZ adapter resolver must be registered');

    const params = wordViewParams({
      category: 1,
      fileId: '',
      fileName: 'new-collaboration.docx',
      viewMode: 'edit',
      mode: 'EDIT',
      ...(options.params || {})
    });
    const resolved = resolver.resolve(
      { params },
      params,
      {
        key: 'NATIVE',
        url: ['/common/office/js/native-adapter.js']
      }
    );

    return { env, params, resolved };
  }

  const edit = resolve({ serverMode: 'edit' });
  assert(edit.resolved, 'server edit mode must resolve a FileZ adapter');
  assert.strictEqual(edit.resolved.key, 'RUIAN_FILEZ_EDIT');
  assert.deepStrictEqual(Array.from(edit.resolved.url), [
    '/apps_res/ruian-filez-facade-poc/editor.js?v=0.6.1'
  ]);
  assert.strictEqual(edit.params.__ruianFilezSurface, 'COLLABORATION');
  assert.strictEqual(edit.params.__ruianFilezNewDocument, true);

  const preallocated = resolve({
    params: {
      originalFileId: '-900000000000000001',
      originalCreateDate: '2026-08-03'
    }
  });
  assert.strictEqual(
    preallocated.resolved.key,
    'RUIAN_FILEZ_EDIT',
    'newColl is authoritative even when A8 preallocates original-file placeholders'
  );

  const excel = resolve({
    params: { fileType: 'xlsx', fileName: 'new-collaboration.xlsx' }
  });
  assert.strictEqual(excel.resolved.key, 'RUIAN_FILEZ_EDIT');
  assert.strictEqual(excel.params.fileType, 'xlsx');

  const inferredExcel = resolve({
    params: {
      fileType: '',
      contentType: '42',
      fileName: 'new-collaboration'
    }
  });
  assert.strictEqual(inferredExcel.resolved.key, 'RUIAN_FILEZ_EDIT');
  assert.strictEqual(
    inferredExcel.params.fileType,
    'xls',
    'A8 content type 42 must normalize to an Excel body extension'
  );

  assert.strictEqual(
    resolve({ serverMode: 'view' }).resolved,
    null,
    'server view mode must keep a new collaboration edit on native'
  );

  const passThroughCases = [
    {
      label: 'template-based collaboration',
      search: '?method=newColl&templateId=-123456789'
    },
    {
      label: 'hidden initialization mode',
      params: { viewMode: 'hidden' }
    },
    {
      label: 'non-Office-body collaboration',
      params: { fileType: 'pdf', fileName: 'new-collaboration.pdf' }
    }
  ];

  for (const testCase of passThroughCases) {
    assert.strictEqual(
      resolve(testCase).resolved,
      null,
      `${testCase.label} must remain on the native adapter`
    );
  }
}

async function contractFailureFallsBackThroughBypassOnlyOnce() {
  const env = createEnvironment({
    fetch() {
      return Promise.resolve({
        ok: true,
        text() {
          return Promise.resolve(
            JSON.stringify({
              success: false,
              code: 'CONFIG_MISSING'
            })
          );
        }
      });
    }
  });
  const sdk = createOfficeSdk(env);
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  let initCallbackCount = 0;

  await instance.init(
    { domId: 'officeEditorFrame', mode: 'VIEW' },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      initCallbackCount += 1;
    }
  );

  let openBeforeCount = 0;
  let openCallbackCount = 0;
  const result = await instance.openFile(
    {
      openBeforeFun() {
        openBeforeCount += 1;
      }
    },
    (error, value) => {
      assert.ifError(error);
      assert.strictEqual(value, 'native-open');
      openCallbackCount += 1;
    }
  );

  assert.strictEqual(result, 'native-open');
  assert.strictEqual(initCallbackCount, 1);
  assert.strictEqual(openCallbackCount, 1);
  assert.strictEqual(openBeforeCount, 1);
  assert.strictEqual(sdk.counters.customAdapterInstances, 1);
  assert.strictEqual(sdk.counters.initCalls, 2);
  assert.strictEqual(sdk.counters.bypassInitCalls, 1);
  assert.strictEqual(sdk.counters.nativeInit, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 1);
  assert.strictEqual(
    sdk.counters.nativeOpenParams[0].openBeforeFun,
    undefined,
    'native fallback must not invoke openBeforeFun a second time'
  );
  assert.strictEqual(instance.__ruianFilezBypass, true);
  assert.strictEqual(
    instance.params.__ruianFilezBypass,
    true,
    'fallback init must bypass the FileZ resolver to prevent recursion'
  );
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_POC__.fallbackCount,
    1
  );
  assert.strictEqual(findFilezHost(env.container), null);
}

async function contractUnsupportedVariantBypassesBeforeRequest() {
  let fetchCalls = 0;
  const env = createEnvironment({
    fetch() {
      fetchCalls += 1;
      return successfulFetch()();
    }
  });
  const sdk = createOfficeSdk(env);
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());

  await instance.init({
    domId: 'officeEditorFrame',
    mode: 'VIEW'
  });
  const result = await instance.openFile({ isHide: true });
  assert.strictEqual(result, 'native-open');
  assert.strictEqual(fetchCalls, 0);
  assert.strictEqual(sdk.counters.bypassInitCalls, 1);
  assert.strictEqual(sdk.counters.nativeAdapterOpen, 1);
}

async function contractServerViewIsAutomaticWithoutUrl() {
  const env = createEnvironment();
  const state = env.window.__RUIAN_FILEZ_FACADE_POC__;
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;
  const badge = env.document.getElementById(
    'ruian-filez-facade-poc-badge'
  );

  assert.strictEqual(
    env.window.location.search.includes('filezFacade='),
    false,
    'the default contract must exercise automatic mode without a URL flag'
  );
  assert.strictEqual(control.serverMode, 'view');
  assert.strictEqual(control.mode, 'view');
  assert.strictEqual(state.serverMode, 'view');
  assert.strictEqual(state.mode, 'view');
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_BRIDGE_060__.currentServerMode(),
    'view'
  );
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_BRIDGE_040__,
    undefined,
    '0.6.1 must not reuse the 0.4.0 bridge key'
  );
  assert(badge, 'automatic view mode should render diagnostics');
  assert(
    badge.textContent.includes('服务端 VIEW'),
    'the badge must expose the trusted server ceiling'
  );
}

async function contractServerOffBlocksEveryClientPromotion() {
  const storage = createStorage();
  storage.setItem('ruian.filez.facade.mode', 'view');
  const env = createEnvironment({
    storage,
    serverMode: 'off',
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=view'
  });
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;
  const state = env.window.__RUIAN_FILEZ_FACADE_POC__;

  assert.strictEqual(control.serverMode, 'off');
  assert.strictEqual(control.mode, 'off');
  assert.strictEqual(state.serverMode, 'off');
  assert.strictEqual(state.mode, 'off');
  assert.strictEqual(
    storage.getItem('ruian.filez.facade.mode'),
    'view',
    'a URL override must not rewrite sessionStorage'
  );
  assert.strictEqual(
    control.setMode('view', 'promotion-attempt'),
    'off',
    'control.setMode must clamp view to the server off ceiling'
  );
  assert.strictEqual(control.mode, 'off');
  assert.strictEqual(
    storage.getItem('ruian.filez.facade.mode'),
    null,
    'an equal-or-higher request must not become a stale stored downgrade'
  );
  assert.strictEqual(
    (env.window.__SEEYON_OFFICE_ADAPTER_RESOLVERS__ || []).length,
    0
  );

  const oldSession = createStorage();
  oldSession.setItem('ruian.filez.facade.mode', 'view');
  const noUrlEnv = createEnvironment({
    storage: oldSession,
    serverMode: 'off'
  });
  assert.strictEqual(
    noUrlEnv.window.__RUIAN_FILEZ_FACADE_CONTROL__.mode,
    'off',
    'an old stored view must not promote a server-off page'
  );
  assert.strictEqual(
    oldSession.getItem('ruian.filez.facade.mode'),
    null,
    'a stored mode that is not a strict downgrade should be cleaned'
  );
}

async function contractServerShadowIsAHardCeiling() {
  const storage = createStorage();
  storage.setItem('ruian.filez.facade.mode', 'view');
  const env = createEnvironment({
    storage,
    serverMode: 'shadow'
  });
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;
  const state = env.window.__RUIAN_FILEZ_FACADE_POC__;

  assert.strictEqual(control.serverMode, 'shadow');
  assert.strictEqual(control.mode, 'shadow');
  assert.strictEqual(state.serverMode, 'shadow');
  assert.strictEqual(
    control.setMode('view', 'promotion-attempt'),
    'shadow'
  );
  assert.strictEqual(control.mode, 'shadow');
  assert.strictEqual(
    storage.getItem('ruian.filez.facade.mode'),
    null,
    'view is not a strict downgrade from server shadow'
  );

  const sdk = createOfficeSdk(env);
  assignSdk(env, sdk);
  const instance = new env.window.OfficeSDK(wordViewParams());
  await instance.init({ domId: 'officeEditorFrame', mode: 'VIEW' });
  assert.strictEqual(instance.pluginKey, 'NATIVE');
  assert.strictEqual(sdk.counters.nativeInit, 1);
  assert.strictEqual(state.matchedCount, 1);
}

async function contractUrlDowngradesAreTemporary() {
  for (const downgrade of ['off', 'shadow']) {
    const env = createEnvironment({
      serverMode: 'view',
      search:
        '?method=summary&affairId=-6153440369511218856' +
        `&filezFacade=${downgrade}`
    });
    const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;

    assert.strictEqual(control.serverMode, 'view');
    assert.strictEqual(control.mode, downgrade);
    assert.strictEqual(
      env.storage.getItem('ruian.filez.facade.mode'),
      null,
      `URL ${downgrade} must remain page-local`
    );

    env.window.location.search =
      '?method=summary&affairId=-6153440369511218856';
    env.window.location.href =
      env.window.location.origin +
      env.window.location.pathname +
      env.window.location.search;
    control.syncFromTop('query-removed');

    assert.strictEqual(
      control.mode,
      'view',
      `removing URL ${downgrade} without stored downgrade must restore server view`
    );
    assert.strictEqual(
      env.window.__RUIAN_FILEZ_FACADE_POC__.mode,
      'view'
    );
  }
}

async function contractSessionAndControlPersistOnlyWithinCeiling() {
  const storage = createStorage();
  storage.setItem('ruian.filez.facade.mode', 'shadow');
  const env = createEnvironment({ storage, serverMode: 'view' });
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;

  assert.strictEqual(
    control.mode,
    'shadow',
    'a valid stored mode may explicitly downgrade server view'
  );
  assert.strictEqual(control.setMode('off', 'persistent-downgrade'), 'off');
  assert.strictEqual(storage.getItem('ruian.filez.facade.mode'), 'off');
  control.syncFromTop('same-page-sync');
  assert.strictEqual(control.mode, 'off');
  assert.strictEqual(control.setMode('view', 'restore-server-mode'), 'view');
  assert.strictEqual(
    storage.getItem('ruian.filez.facade.mode'),
    null,
    'a request equal to server view clears the obsolete downgrade'
  );
}

async function contractUrlModePrecedesStoredAndControlModes() {
  const storage = createStorage();
  storage.setItem('ruian.filez.facade.mode', 'view');
  const env = createEnvironment({
    storage,
    serverMode: 'view',
    search:
      '?method=summary&affairId=-6153440369511218856&filezFacade=off'
  });
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;

  assert.strictEqual(control.mode, 'off');
  assert.strictEqual(
    control.setMode('shadow', 'stored-while-query-active'),
    'off',
    'the current URL downgrade remains effective while it is present'
  );
  assert.strictEqual(storage.getItem('ruian.filez.facade.mode'), 'shadow');

  env.window.location.search =
    '?method=summary&affairId=-6153440369511218856';
  control.syncFromTop('query-removed');
  assert.strictEqual(
    control.mode,
    'shadow',
    'after the temporary URL mode is removed, the stored downgrade applies'
  );
}

async function contractInvalidOrMissingServerModeFailsClosed() {
  for (const options of [
    { serverMode: 'enabled' },
    { serverMode: '' },
    { omitServerMode: true }
  ]) {
    const env = createEnvironment({
      ...options,
      search:
        '?method=summary&affairId=-6153440369511218856&filezFacade=view'
    });
    const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;
    const state = env.window.__RUIAN_FILEZ_FACADE_POC__;

    assert.strictEqual(control.serverMode, 'off');
    assert.strictEqual(control.mode, 'off');
    assert.strictEqual(state.serverMode, 'off');
    assert.strictEqual(state.mode, 'off');
    assert.strictEqual(
      (env.window.__SEEYON_OFFICE_ADAPTER_RESOLVERS__ || []).length,
      0
    );
  }
}

async function contractDuplicateBootstrapSynchronizesServerMode() {
  const env = createEnvironment({ serverMode: 'view' });
  const control = env.window.__RUIAN_FILEZ_FACADE_CONTROL__;
  const state = env.window.__RUIAN_FILEZ_FACADE_POC__;

  for (const expectedMode of ['shadow', 'off', 'view']) {
    env.currentScript.setAttribute('data-ruian-mode', expectedMode);
    vm.runInContext(bootstrapText, env.context, {
      filename: bootstrapPath
    });
    assert.strictEqual(control.serverMode, expectedMode);
    assert.strictEqual(control.mode, expectedMode);
    assert.strictEqual(state.serverMode, expectedMode);
    assert.strictEqual(state.mode, expectedMode);
  }

  assert.strictEqual(state.duplicateLoads, 3);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_FACADE_BRIDGE_060__.currentServerMode(),
    'view'
  );
  assert(
    env.document
      .getElementById('ruian-filez-facade-poc-badge')
      .textContent.includes('服务端 VIEW')
  );
}

(async function main() {
  await contractServerViewIsAutomaticWithoutUrl();
  await contractServerOffBlocksEveryClientPromotion();
  await contractServerShadowIsAHardCeiling();
  await contractUrlDowngradesAreTemporary();
  await contractSessionAndControlPersistOnlyWithinCeiling();
  await contractUrlModePrecedesStoredAndControlModes();
  await contractInvalidOrMissingServerModeFailsClosed();
  await contractDuplicateBootstrapSynchronizesServerMode();
  contractOfficeSdkResolverHandlesMissingDeclaredFileType();
  await contractNoOfficeSdkHijackAndResolverIsIdempotent();
  await contractWordViewRegistersAdapterAndReachesReadyOnce();
  await contractChildUsesTopGovdocSurface();
  await contractRoutesModesAndResolverPrecision();
  contractNewCollaborationEditRouting();
  await contractFailureFallsBackThroughBypassOnlyOnce();
  await contractUnsupportedVariantBypassesBeforeRequest();
  realConsole.log('bootstrap.js + viewer.js 0.6.1 contract tests passed.');
})().catch((error) => {
  realConsole.error(error);
  process.exitCode = 1;
});
