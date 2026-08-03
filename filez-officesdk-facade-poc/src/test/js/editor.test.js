'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const editorPath = path.resolve(
  __dirname,
  '../../main/webapp/apps_res/ruian-filez-facade-poc/editor.js'
);
const editorText = fs.readFileSync(editorPath, 'utf8');

function nextTurn() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function waitFor(predicate, description) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) return;
    await nextTurn();
  }
  throw new Error(`Timed out waiting for ${description}`);
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
  return target;
}

function createElement(tagName) {
  const element = addEventApi({
    tagName: String(tagName).toUpperCase(),
    id: '',
    src: '',
    textContent: '',
    parentNode: null,
    children: [],
    attributes: Object.create(null),
    style: {
      cssText: '',
      position: '',
      visibility: '',
      display: ''
    },
    scrollLeft: 0,
    scrollTop: 0,
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
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
    element.contentWindow = {
      messages: [],
      focused: false,
      postMessage(message, origin) {
        this.messages.push({ message, origin });
      },
      focus() {
        this.focused = true;
      }
    };
  }
  return element;
}

function createDocument(container) {
  const body = createElement('body');
  const elementsById = Object.create(null);
  const elementsByName = Object.create(null);
  return {
    body,
    createElement,
    getElementById(id) {
      if (id === 'editor') return container;
      return elementsById[id] || null;
    },
    getElementsByName(name) {
      return (elementsByName[name] || []).slice();
    },
    __registerFrame(id, name, frame) {
      if (id) elementsById[id] = frame;
      if (name) {
        if (!elementsByName[name]) elementsByName[name] = [];
        elementsByName[name].push(frame);
      }
    }
  };
}

function collectText(node) {
  if (!node) return '';
  return [node.textContent || '']
    .concat((node.children || []).map(collectText))
    .join(' ');
}

function createEnvironment(options = {}) {
  const adapters = Object.create(null);
  const container = createElement('div');
  const document = createDocument(container);
  const ajaxCalls = [];
  const bodyBindings = [];
  const bridgeCalls = [];
  const consoleEntries = [];
  const iframeSrcAssignments = [];
  const nativeCalls = {
    init: [],
    openFile: []
  };
  const pathname =
    options.pathname || '/seeyon/collaboration/collaboration.do';
  const href = `http://localhost${pathname}?method=newColl`;
  const originalCreateElement = document.createElement;
  document.createElement = function (tagName) {
    const element = originalCreateElement(tagName);
    if (String(tagName).toLowerCase() === 'iframe') {
      let source = '';
      Object.defineProperty(element, 'src', {
        configurable: true,
        enumerable: true,
        get() {
          return source;
        },
        set(value) {
          source = String(value);
          iframeSrcAssignments.push({
            value: source,
            bindingCount: bodyBindings.length
          });
        }
      });
    }
    return element;
  };

  const OfficeSDK = {
    ENUM_EVENT_TYPE: {
      CONTENT_MODIFIED: 'contentModified'
    },
    register(key, Adapter) {
      adapters[key] = Adapter;
    },
    getAdapter(key) {
      return adapters[key];
    }
  };

  const diagnosticConsole = {
    log() {},
    info() {},
    warn() {},
    error() {
      consoleEntries.push(Array.prototype.slice.call(arguments));
    },
    table() {}
  };

  const window = addEventApi({
    location: {
      origin: 'http://localhost',
      href,
      pathname
    },
    URL,
    OfficeSDK,
    document,
    _ctxPath: '/seeyon',
    Promise,
    Date,
    Math,
    JSON,
    Number,
    String,
    Object,
    Array,
    Error,
    setTimeout,
    clearTimeout,
    console: diagnosticConsole,
    getComputedStyle() {
      return { position: 'static' };
    },
    __RUIAN_FILEZ_FACADE_BRIDGE_060__: {
      isModeActive(epoch, capability) {
        bridgeCalls.push({ epoch, capability });
        return true;
      },
      record() {}
    }
  });
  window.window = window;
  window.parent = window;
  window.top = window;
  window.frames = Object.create(null);

  if (options.withContentApi !== false) {
    const contentAPI = {
      updateMainBodyData(name, value) {
        bodyBindings.push({ name, value });
      }
    };
    if (options.contentApiFrameDiscovery) {
      const frameWindow = {
        location: {
          origin: options.contentApiFrameOrigin || 'http://localhost',
          href:
            (options.contentApiFrameOrigin || 'http://localhost') +
            '/seeyon/govdoc/body.do'
        },
        contentAPI,
        frames: Object.create(null),
        document: {
          getElementById() {
            return null;
          },
          getElementsByName() {
            return [];
          }
        }
      };
      const frameElement = createElement('iframe');
      frameElement.contentWindow = frameWindow;
      if (options.contentApiFrameDiscovery === 'frames') {
        window.frames.govDocZwIframe = frameWindow;
      } else if (options.contentApiFrameDiscovery === 'id') {
        document.__registerFrame('govDocZwIframe', '', frameElement);
      } else if (options.contentApiFrameDiscovery === 'name') {
        document.__registerFrame('', 'govDocZwIframe', frameElement);
      } else if (options.contentApiFrameDiscovery === 'nested-component') {
        const componentWindow = {
          location: {
            origin: 'http://localhost',
            href: 'http://localhost/seeyon/govdoc/component.do'
          },
          frames: Object.create(null),
          document: {
            getElementById(id) {
              return id === 'zwIframe' ? frameElement : null;
            },
            getElementsByName() {
              return [];
            }
          }
        };
        const componentFrame = createElement('iframe');
        componentFrame.contentWindow = componentWindow;
        document.__registerFrame('componentDiv', '', componentFrame);
      } else if (options.contentApiFrameDiscovery === 'edocSdk') {
        window.edocSdk = {
          getZwIframe() {
            return frameElement;
          }
        };
      }
    } else {
      window.contentAPI = contentAPI;
    }
  }

  window.$ = {
    ajax(request) {
      const payload = JSON.parse(request.data.arguments)[0];
      ajaxCalls.push({ request, payload });
      setImmediate(() => {
        request.success(
          options.ajaxResponse || {
            success: true,
            code: 'OK',
            data: {
              editUrl: '/seeyon/ruianFileZEdit.do?method=edit',
              sessionId: 'session-1',
              expiresAt: Date.now() + 60000,
              readyProtocol: 'postMessage-v1',
              nonce: 'nonce-1',
              fileId: options.finalFileId || '-123',
              createdNew: options.createdNew !== false
            }
          }
        );
      });
      return {
        abort() {}
      };
    }
  };

  const context = vm.createContext({
    window,
    document,
    OfficeSDK,
    URL,
    Promise,
    Date,
    Math,
    JSON,
    Number,
    String,
    Object,
    Array,
    Error,
    setTimeout,
    clearTimeout,
    console: diagnosticConsole
  });
  vm.runInContext(editorText, context, { filename: editorPath });

  function createSdk(params) {
    return {
      params,
      cacheAdapterMapping: options.nativeProviderKey
        ? { WORD: { EDIT: options.nativeProviderKey } }
        : null,
      init(initParams) {
        nativeCalls.init.push(initParams);
        if (options.nativeInitError) {
          return Promise.reject(options.nativeInitError);
        }
        return Promise.resolve(true);
      },
      openFile(openParams) {
        nativeCalls.openFile.push(openParams);
        if (options.nativeOpenError) {
          return Promise.reject(options.nativeOpenError);
        }
        return Promise.resolve('native-opened');
      }
    };
  }

  function dispatchWrapperMessage(session, detail) {
    window.dispatchEvent({
      type: 'message',
      origin: 'http://localhost',
      source: session.iframe.contentWindow,
      data: Object.assign(
        {
          channel: 'ruian-filez-edit',
          protocol: 'postMessage-v1',
          nonce: 'nonce-1',
          sessionId: 'session-1'
        },
        detail
      )
    });
  }

  return {
    window,
    container,
    adapters,
    ajaxCalls,
    bodyBindings,
    bridgeCalls,
    consoleEntries,
    iframeSrcAssignments,
    nativeCalls,
    createSdk,
    dispatchWrapperMessage
  };
}

async function contractEditSessionSaveIsDurableAndSingleFlight() {
  const env = createEnvironment();
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const contentEvents = [];
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '',
    fileName: 'new-document.docx',
    fileType: 'docx',
    category: 4,
    __ruianFilezAffairId: '-88',
    __ruianFilezRouteEpoch: 7,
    __ruianFilezSurface: 'COLLABORATION',
    __ruianFilezNewDocument: true,
    eventTriggerCallback(event) {
      contentEvents.push(event);
    }
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);
  let openCallbackCount = 0;

  const openPromise = adapter.openFile({}, (error, result) => {
    assert.ifError(error);
    assert.strictEqual(result, true);
    openCallbackCount += 1;
  });
  await waitFor(
    () => adapter.__ruianFilezSession.iframe,
    'FileZ edit iframe'
  );

  const session = adapter.__ruianFilezSession;
  env.dispatchWrapperMessage(session, { type: 'READY', success: true });
  assert.strictEqual(await openPromise, true);
  assert.strictEqual(openCallbackCount, 1);
  assert.strictEqual(env.ajaxCalls.length, 1);
  assert.strictEqual(env.ajaxCalls[0].payload.surface, 'COLLABORATION');
  assert.strictEqual(env.ajaxCalls[0].payload.newDocument, true);
  assert.strictEqual(env.ajaxCalls[0].payload.mode, 'edit');
  assert.strictEqual(env.ajaxCalls[0].payload.affairId, '-88');
  assert.strictEqual(sdk.params.fileId, '-123');
  assert.deepStrictEqual(env.bodyBindings, [
    { name: 'fileId', value: '-123' },
    { name: 'id', value: '-123' },
    { name: 'contentDataId', value: '-123' }
  ]);
  assert(
    env.bridgeCalls.some(
      (call) => call.epoch === 7 && call.capability === 'edit'
    )
  );

  env.dispatchWrapperMessage(session, {
    type: 'CONTENT_MODIFIED',
    modified: true
  });
  assert.strictEqual(adapter.contentIsModified(), true);
  assert.strictEqual(contentEvents.length, 1);
  assert.strictEqual(contentEvents[0].type, 'contentModified');
  assert.strictEqual(contentEvents[0].value, true);

  let firstSaveCallbackCount = 0;
  let secondSaveCallbackCount = 0;
  const firstSave = adapter.saveFile({}, (error, result) => {
    assert.ifError(error);
    assert.strictEqual(result, true);
    firstSaveCallbackCount += 1;
  });
  const secondSave = adapter.saveFile({}, (error, result) => {
    assert.ifError(error);
    assert.strictEqual(result, true);
    secondSaveCallbackCount += 1;
  });
  assert.strictEqual(firstSave, secondSave, 'saveFile must be single-flight');
  await nextTurn();

  assert.strictEqual(session.iframe.contentWindow.messages.length, 1);
  const saveMessage = session.iframe.contentWindow.messages[0];
  assert.strictEqual(saveMessage.origin, 'http://localhost');
  assert.strictEqual(saveMessage.message.type, 'SAVE');
  assert.strictEqual(saveMessage.message.fileId, '-123');
  assert.strictEqual(saveMessage.message.targetFileId, '-123');
  assert.strictEqual(saveMessage.message.modified, true);
  assert(saveMessage.message.requestId);

  let saveSettled = false;
  firstSave.then(
    () => {
      saveSettled = true;
    },
    () => {
      saveSettled = true;
    }
  );
  env.dispatchWrapperMessage(session, {
    type: 'SAVE_REQUESTED',
    requestId: saveMessage.message.requestId
  });
  await nextTurn();
  assert.strictEqual(
    saveSettled,
    false,
    'SAVE_REQUESTED is not a durable-save acknowledgement'
  );

  windowMessageWithWrongOrigin(env, session, {
    type: 'SAVE_RESULT',
    requestId: saveMessage.message.requestId,
    success: true
  });
  await nextTurn();
  assert.strictEqual(saveSettled, false, 'wrong-origin messages must be ignored');

  env.dispatchWrapperMessage(session, {
    type: 'SAVE_RESULT',
    requestId: saveMessage.message.requestId,
    success: true,
    data: {
      contentLength: 42,
      revision: 3
    }
  });
  await Promise.all([firstSave, secondSave]);
  assert.strictEqual(firstSaveCallbackCount, 1);
  assert.strictEqual(secondSaveCallbackCount, 1);
  assert.strictEqual(adapter.contentIsModified(), false);
  assert.strictEqual(adapter.contentLength(), 42);
  assert.strictEqual(contentEvents.length, 2);
  assert.strictEqual(contentEvents[1].value, false);

  adapter.hide({}, (error, result) => {
    assert.ifError(error);
    assert.strictEqual(result, true);
  });
  assert.strictEqual(session.host.style.display, 'none');
  adapter.active({}, (error, result) => {
    assert.ifError(error);
    assert.strictEqual(result, true);
  });
  assert.strictEqual(session.host.style.display, '');
  assert.strictEqual(session.iframe.contentWindow.focused, true);

  assert.strictEqual(await adapter.saveFile({}), true);
  assert.strictEqual(
    session.iframe.contentWindow.messages.length,
    1,
    'a clean, already-durable document must not trigger another save'
  );

  const unsupportedMethods = [
    'setDocFieldContent',
    'getSelectionText',
    'getBookmarkContent',
    'getDocFieldList',
    'getDocFieldContent',
    'deleteBookmark',
    'cleanAllContent',
    'newLine',
    'newLineOnEnd',
    'continueWriteWithNewLine',
    'getAllContent',
    'hasDocField'
  ];
  for (const method of unsupportedMethods) {
    let callbackCount = 0;
    const decoratedCall = new Promise((resolve, reject) => {
      assert.strictEqual(typeof adapter[method], 'function');
      adapter[method]({}, (error, value) => {
        callbackCount += 1;
        if (error) reject(error);
        else resolve(value);
      });
    });
    await assert.rejects(
      decoratedCall,
      (error) =>
        error &&
        String(error.code).indexOf('FILEZ_EDIT_UNSUPPORTED_') === 0
    );
    assert.strictEqual(callbackCount, 1, `${method} callback must run once`);
  }
}

async function contractNewCollaborationSignaturePreflightAndModifyContent() {
  const env = createEnvironment();
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const baseParams = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '',
    fileName: 'new-spreadsheet.xlsx',
    fileType: 'xlsx',
    mode: 'EDIT',
    category: 1,
    __ruianFilezRouteEpoch: 31,
    __ruianFilezSurface: 'COLLABORATION',
    __ruianFilezNewDocument: true
  };

  const preflightSdk = env.createSdk(Object.assign({}, baseParams));
  const preflightAdapter = new Adapter(
    preflightSdk.params,
    {},
    preflightSdk
  );
  let preflightCallbackCount = 0;
  assert.strictEqual(
    await preflightAdapter.openFile(
      { isHide: true, isDialog: true, showMaskFlag: false },
      (error, result) => {
        assert.ifError(error);
        assert.strictEqual(result, true);
        preflightCallbackCount += 1;
      }
    ),
    true
  );
  assert.strictEqual(preflightCallbackCount, 1);
  assert.strictEqual(
    env.window.__RUIAN_FILEZ_EDITOR_060__.activeCount(),
    0,
    'an init-only/hidden probe must not leak into active editor cleanup state'
  );
  assert.strictEqual(
    env.ajaxCalls.length,
    0,
    'the temporary signature probe must not reserve a second blank body'
  );
  let signatureCallbackCount = 0;
  assert.strictEqual(
    preflightAdapter.countSignatures({}, (error, count) => {
      assert.ifError(error);
      assert.strictEqual(count, 0);
      signatureCallbackCount += 1;
    }),
    0
  );
  assert.strictEqual(signatureCallbackCount, 1);
  preflightAdapter.destroy({}, () => {});

  const mainSdk = env.createSdk(Object.assign({}, baseParams));
  const mainAdapter = new Adapter(mainSdk.params, {}, mainSdk);
  let modifyCallbackCount = 0;
  const modifyPromise = mainAdapter.modifyContent(
    { canSign: false },
    (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      modifyCallbackCount += 1;
    }
  );
  await waitFor(
    () => mainAdapter.__ruianFilezSession.iframe,
    'FileZ Excel iframe opened by collaboration modifyContent'
  );
  assert.strictEqual(env.window.__RUIAN_FILEZ_EDITOR_060__.activeCount(), 1);
  assert.strictEqual(env.ajaxCalls.length, 1);
  assert.strictEqual(env.ajaxCalls[0].payload.fileType, 'xlsx');
  assert.strictEqual(env.ajaxCalls[0].payload.surface, 'COLLABORATION');
  env.dispatchWrapperMessage(mainAdapter.__ruianFilezSession, {
    type: 'READY',
    success: true
  });
  assert.strictEqual(await modifyPromise, true);
  assert.strictEqual(modifyCallbackCount, 1);
  let repeatModifyCallbackCount = 0;
  assert.strictEqual(
    await mainAdapter.modifyContent({}, (error, result) => {
      assert.ifError(error);
      assert.strictEqual(result, true);
      repeatModifyCallbackCount += 1;
    }),
    true
  );
  assert.strictEqual(repeatModifyCallbackCount, 1);
  assert.strictEqual(
    env.ajaxCalls.length,
    1,
    'view/open followed by modifyContent must reuse the same FileZ session'
  );
  assert.strictEqual(env.window.__RUIAN_FILEZ_EDITOR_060__.activeCount(), 1);
  mainAdapter.destroy({}, () => {});
  assert.strictEqual(env.window.__RUIAN_FILEZ_EDITOR_060__.activeCount(), 0);
}

function windowMessageWithWrongOrigin(env, session, detail) {
  env.window.dispatchEvent({
    type: 'message',
    origin: 'https://attacker.example',
    source: session.iframe.contentWindow,
    data: Object.assign(
      {
        channel: 'ruian-filez-edit',
        protocol: 'postMessage-v1',
        nonce: 'nonce-1',
        sessionId: 'session-1'
      },
      detail
    )
  });
}

async function contractMissingBodyBindingFallsBackToNativeOnce() {
  const env = createEnvironment({
    withContentApi: false,
    pathname: '/seeyon/govdoc/govdoc.do',
    finalFileId: '-999'
  });
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '',
    fileName: 'new-govdoc.docx',
    fileType: 'docx',
    category: 4,
    __ruianFilezRouteEpoch: 11,
    __ruianFilezSurface: 'GOVDOC',
    __ruianFilezNewDocument: true
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);
  let callbackCount = 0;

  const result = await adapter.openFile({}, (error, value) => {
    assert.ifError(error);
    assert.strictEqual(value, 'native-opened');
    callbackCount += 1;
  });

  assert.strictEqual(result, 'native-opened');
  assert.strictEqual(callbackCount, 1);
  assert.strictEqual(env.ajaxCalls.length, 1);
  assert.strictEqual(env.ajaxCalls[0].payload.surface, 'GOVDOC');
  assert.strictEqual(env.ajaxCalls[0].payload.newDocument, true);
  assert.strictEqual(env.nativeCalls.init.length, 1);
  assert.strictEqual(env.nativeCalls.openFile.length, 1);
  assert.strictEqual(env.nativeCalls.init[0].__ruianFilezBypass, true);
  assert.strictEqual(sdk.params.__ruianFilezBypass, true);
  assert.strictEqual(env.container.children.length, 0);
}

async function contractGovdocNamedBodyFrameBindsBeforeWrapperNavigation() {
  for (const discovery of [
    'frames',
    'id',
    'name',
    'nested-component',
    'edocSdk'
  ]) {
    const env = createEnvironment({
      pathname: '/seeyon/govdoc/govdoc.do',
      contentApiFrameDiscovery: discovery
    });
    const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
    const params = {
      domId: 'editor',
      webRoot: '/seeyon',
      fileId: '',
      fileName: `new-govdoc-${discovery}.docx`,
      fileType: 'docx',
      mode: 'EDIT',
      category: 4,
      __ruianFilezRouteEpoch: 12,
      __ruianFilezSurface: 'GOVDOC',
      __ruianFilezNewDocument: true
    };
    const sdk = env.createSdk(params);
    const adapter = new Adapter(params, {}, sdk);
    const openPromise = adapter.openFile({});
    await waitFor(
      () => adapter.__ruianFilezSession.iframe,
      `FileZ wrapper iframe through govDocZwIframe ${discovery}`
    );

    const session = adapter.__ruianFilezSession;
    assert.deepStrictEqual(env.bodyBindings, [
      { name: 'fileId', value: '-123' },
      { name: 'id', value: '-123' },
      { name: 'contentDataId', value: '-123' }
    ]);
    assert.strictEqual(env.iframeSrcAssignments.length, 1);
    assert.strictEqual(
      env.iframeSrcAssignments[0].bindingCount,
      3,
      `govDocZwIframe ${discovery} must bind fileId before wrapper navigation`
    );
    assert(
      env.iframeSrcAssignments[0].value.includes(
        '/seeyon/ruianFileZEdit.do?method=edit'
      )
    );
    assert.strictEqual(env.nativeCalls.init.length, 0);

    env.dispatchWrapperMessage(session, { type: 'READY', success: true });
    assert.strictEqual(await openPromise, true);
    adapter.destroy({}, () => {});
  }
}

async function contractCrossOriginGovdocFrameIsNeverUsedForBinding() {
  const env = createEnvironment({
    pathname: '/seeyon/govdoc/govdoc.do',
    contentApiFrameDiscovery: 'frames',
    contentApiFrameOrigin: 'https://attacker.example'
  });
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '',
    fileName: 'cross-origin.docx',
    fileType: 'docx',
    mode: 'EDIT',
    category: 4,
    __ruianFilezRouteEpoch: 14,
    __ruianFilezSurface: 'GOVDOC',
    __ruianFilezNewDocument: true
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);

  assert.strictEqual(await adapter.openFile({}), 'native-opened');
  assert.strictEqual(env.bodyBindings.length, 0);
  assert.strictEqual(env.iframeSrcAssignments.length, 0);
  assert.strictEqual(env.nativeCalls.init.length, 1);
  assert.strictEqual(env.nativeCalls.openFile.length, 1);
}

async function contractPostReadyDirtyFailureBlocksWithoutDiscardingEdits() {
  const env = createEnvironment({ createdNew: false });
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '-123',
    fileName: 'existing.docx',
    fileType: 'docx',
    category: 4,
    __ruianFilezRouteEpoch: 13,
    __ruianFilezSurface: 'COLLABORATION',
    __ruianFilezNewDocument: false
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);
  const openPromise = adapter.openFile({});
  await waitFor(
    () => adapter.__ruianFilezSession.iframe,
    'FileZ edit iframe before wrapper failure'
  );

  const session = adapter.__ruianFilezSession;
  env.dispatchWrapperMessage(session, { type: 'READY', success: true });
  await openPromise;
  env.dispatchWrapperMessage(session, {
    type: 'CONTENT_MODIFIED',
    modified: true
  });

  let saveCallbackCount = 0;
  let firstError = null;
  const savePromise = adapter.saveFile({}, (error, value) => {
    assert(error);
    assert.strictEqual(error.code, 'CONTENT_CHANGE_LISTENER_FAILED');
    assert.strictEqual(value, null);
    firstError = error;
    saveCallbackCount += 1;
  });
  await nextTurn();
  env.dispatchWrapperMessage(session, {
    type: 'FAILED',
    code: 'CONTENT_CHANGE_LISTENER_FAILED'
  });

  await assert.rejects(
    savePromise,
    (error) => error && error.code === 'CONTENT_CHANGE_LISTENER_FAILED'
  );
  assert.strictEqual(saveCallbackCount, 1);
  assert.strictEqual(session.blockedError, firstError);
  assert.strictEqual(env.nativeCalls.init.length, 0);
  assert.strictEqual(env.nativeCalls.openFile.length, 0);
  assert.strictEqual(env.container.children.length, 1);
  assert(session.iframe, 'the iframe holding uncommitted edits must be preserved');
  assert.strictEqual(session.pendingSave, null);
  assert.strictEqual(adapter.contentIsModified(), true);
  assert(
    session.host.children.some(
      (child) => child.attributes['data-ruian-filez-blocked'] === 'true'
    ),
    'a visible blocked-state warning must be rendered'
  );

  const messageCount = session.iframe.contentWindow.messages.length;
  let retryCallbackCount = 0;
  const retryPromise = adapter.saveFile({}, (error, value) => {
    assert.strictEqual(error, firstError);
    assert.strictEqual(value, null);
    retryCallbackCount += 1;
  });
  await assert.rejects(retryPromise, (error) => error === firstError);
  assert.strictEqual(retryCallbackCount, 1);
  assert.strictEqual(
    session.iframe.contentWindow.messages.length,
    messageCount,
    'a blocked editor must not issue another unsafe save request'
  );
}

async function contractPostReadyCleanFailureFallsBackToNative() {
  const env = createEnvironment({ createdNew: false });
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '-123',
    fileName: 'clean-existing.docx',
    fileType: 'docx',
    category: 4,
    __ruianFilezRouteEpoch: 17,
    __ruianFilezSurface: 'COLLABORATION',
    __ruianFilezNewDocument: false
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);
  const openPromise = adapter.openFile({});
  await waitFor(
    () => adapter.__ruianFilezSession.iframe,
    'clean FileZ edit iframe before wrapper failure'
  );

  const session = adapter.__ruianFilezSession;
  env.dispatchWrapperMessage(session, { type: 'READY', success: true });
  await openPromise;
  assert.strictEqual(adapter.contentIsModified(), false);
  env.dispatchWrapperMessage(session, {
    type: 'FAILED',
    code: 'CONTENT_CHANGE_LISTENER_FAILED'
  });

  await session.fallbackPromise;
  assert.strictEqual(env.nativeCalls.init.length, 1);
  assert.strictEqual(env.nativeCalls.openFile.length, 1);
  assert.strictEqual(env.nativeCalls.init[0].__ruianFilezBypass, true);
  assert.strictEqual(env.container.children.length, 0);
  assert.strictEqual(session.iframe, null);
  assert.strictEqual(session.blockedError, null);
}

async function contractDualOpenFailurePreservesFilezAndNativeCauses() {
  const env = createEnvironment({
    withContentApi: false,
    nativeInitError: {
      code: 1,
      msg: 'The current native plugin does not support docx files',
      data: {
        code: 'NATIVE_WORD_EDIT_NONE',
        message: 'WORD.EDIT has no configured adapter URL'
      }
    },
    nativeProviderKey: 'NONE'
  });
  const Adapter = env.adapters.RUIAN_FILEZ_EDIT;
  const params = {
    domId: 'editor',
    webRoot: '/seeyon',
    fileId: '',
    fileName: 'new-govdoc.docx',
    fileType: 'docx',
    mode: 'EDIT',
    category: 4,
    __ruianFilezRouteEpoch: 23,
    __ruianFilezSurface: 'GOVDOC',
    __ruianFilezNewDocument: true
  };
  const sdk = env.createSdk(params);
  const adapter = new Adapter(params, {}, sdk);
  let callbackCount = 0;
  let callbackError = null;

  const openPromise = adapter.openFile({}, (error, value) => {
    callbackCount += 1;
    callbackError = error;
    assert.strictEqual(value, null);
  });
  await assert.rejects(
    openPromise,
    (error) =>
      error &&
      error.code === 'FILEZ_AND_NATIVE_OPEN_FAILED' &&
      error.filezFailure.code === 'A8_BODY_BINDING_UNAVAILABLE' &&
      error.nativeFailure.code === '1'
  );

  assert.strictEqual(callbackCount, 1);
  assert.strictEqual(callbackError.code, 'FILEZ_AND_NATIVE_OPEN_FAILED');
  assert.strictEqual(env.nativeCalls.init.length, 1);
  assert.strictEqual(env.nativeCalls.openFile.length, 0);
  assert.strictEqual(env.nativeCalls.init[0].__ruianFilezBypass, true);
  assert.strictEqual(
    env.iframeSrcAssignments.length,
    0,
    'binding failure must happen before wrapper navigation'
  );
  assert.strictEqual(env.container.children.length, 1);

  const visibleText = collectText(env.container.children[0]);
  assert(visibleText.includes('FILEZ_AND_NATIVE_OPEN_FAILED'));
  assert(visibleText.includes('A8_BODY_BINDING_UNAVAILABLE'));
  assert(visibleText.includes('NATIVE_WORD_EDIT_NONE'));
  assert(visibleText.includes('后台映射：NONE'));
  assert(visibleText.includes('错误代码 1'));

  const diagnostics = env.window.__RUIAN_FILEZ_EDITOR_060__.getLastFailure();
  assert.strictEqual(diagnostics.code, 'FILEZ_AND_NATIVE_OPEN_FAILED');
  assert.strictEqual(diagnostics.filez.code, 'A8_BODY_BINDING_UNAVAILABLE');
  assert.strictEqual(diagnostics.filez.phase, 'body-binding');
  assert.strictEqual(diagnostics.native.code, '1');
  assert.strictEqual(diagnostics.native.phase, 'native-init');
  assert.strictEqual(diagnostics.native.providerKey, 'NONE');
  assert.deepStrictEqual(
    Array.from(diagnostics.native.nestedCodes),
    ['NATIVE_WORD_EDIT_NONE']
  );
  assert.strictEqual(env.consoleEntries.length, 1);
}

(async function main() {
  assert(
    editorText.includes('__RUIAN_FILEZ_FACADE_BRIDGE_060__'),
    'editor must require the 0.6.1 capability-aware bridge'
  );
  assert(
    !editorText.includes('__RUIAN_FILEZ_FACADE_BRIDGE_050__'),
    'editor must not let the view-only 0.5.0 bridge authorize edit mode'
  );
  await contractEditSessionSaveIsDurableAndSingleFlight();
  await contractNewCollaborationSignaturePreflightAndModifyContent();
  await contractMissingBodyBindingFallsBackToNativeOnce();
  await contractGovdocNamedBodyFrameBindsBeforeWrapperNavigation();
  await contractCrossOriginGovdocFrameIsNeverUsedForBinding();
  await contractPostReadyDirtyFailureBlocksWithoutDiscardingEdits();
  await contractPostReadyCleanFailureFallsBackToNative();
  await contractDualOpenFailurePreservesFilezAndNativeCauses();
  console.log('editor.js 0.6.1 contract tests passed.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
