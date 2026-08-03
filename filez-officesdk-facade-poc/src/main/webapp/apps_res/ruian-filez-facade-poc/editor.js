(function (window, document) {
  'use strict';

  var VERSION = '0.6.1';
  var GLOBAL_KEY = '__RUIAN_FILEZ_EDITOR_060__';
  // Do not fall back to an older bridge: 0.5.0 did not understand the
  // distinct edit capability and could therefore treat view mode as edit.
  var BRIDGE_KEYS = ['__RUIAN_FILEZ_FACADE_BRIDGE_060__'];
  var ADAPTER_KEY = 'RUIAN_FILEZ_EDIT';
  var MESSAGE_CHANNEL = 'ruian-filez-edit';
  var MESSAGE_PROTOCOL = 'postMessage-v1';
  var DEFAULT_REQUEST_TIMEOUT = 45000;
  var DEFAULT_READY_TIMEOUT = 60000;
  var DEFAULT_SAVE_TIMEOUT = 60000;
  var activeSessions = [];
  var lastFailure = null;

  if (window[GLOBAL_KEY] && window[GLOBAL_KEY].version === VERSION) {
    return;
  }

  function safeString(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function makeError(code, message, cause) {
    var error = new Error(message || code);
    error.code = code;
    error.msg = message || code;
    if (cause !== undefined) {
      error.cause = cause;
    }
    return error;
  }

  function errorCode(error) {
    return safeString(error && error.code) || 'FILEZ_EDIT_FAILED';
  }

  function diagnosticText(value, limit) {
    var text = safeString(value)
      .replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s+|\s+$/g, '');
    var max = Number(limit) || 240;
    return text.length > max ? text.substring(0, max - 3) + '...' : text;
  }

  function appendUnique(list, value) {
    var normalized = diagnosticText(value, 240);
    if (normalized && list.indexOf(normalized) < 0) {
      list.push(normalized);
    }
  }

  function collectFailureParts(value, depth, seen, parts) {
    var nestedKeys;
    var index;
    var code;
    var message;

    if (value === undefined || value === null || depth > 4) {
      return;
    }
    if (typeof value === 'string') {
      if (/^[A-Z][A-Z0-9_.-]{2,80}$/.test(value)) {
        appendUnique(parts.codes, value);
      } else {
        appendUnique(parts.messages, value);
      }
      return;
    }
    if (typeof value === 'number') {
      appendUnique(parts.codes, value);
      return;
    }
    if (typeof value !== 'object' || seen.indexOf(value) >= 0) {
      return;
    }
    seen.push(value);

    code = value.code;
    if (code === undefined || code === null || code === '') {
      code = value.errorCode;
    }
    if (code === undefined || code === null || code === '') {
      code = value.errCode;
    }
    appendUnique(parts.codes, code);

    message = value.message || value.msg;
    if (!message && typeof value.err === 'string') {
      message = value.err;
    }
    if (!message && typeof value.reason === 'string') {
      message = value.reason;
    }
    appendUnique(parts.messages, message);

    nestedKeys = ['cause', 'data', 'error', 'detail'];
    for (index = 0; index < nestedKeys.length; index += 1) {
      collectFailureParts(
        value[nestedKeys[index]],
        depth + 1,
        seen,
        parts
      );
    }
  }

  function describeFailure(error, fallbackCode, phase) {
    var parts = { codes: [], messages: [] };
    collectFailureParts(error, 0, [], parts);
    return {
      code: parts.codes[0] || fallbackCode || 'UNKNOWN_FAILURE',
      message:
        parts.messages[0] ||
        'No detailed error message was returned by the provider',
      phase: phase || 'unknown',
      nestedCodes: parts.codes.slice(1, 4),
      nestedMessages: parts.messages.slice(1, 3)
    };
  }

  function failureLabel(failure) {
    var codes;
    if (!failure) {
      return 'UNKNOWN_FAILURE';
    }
    codes = [failure.code].concat(failure.nestedCodes || []);
    return (
      '[' + diagnosticText(failure.phase, 40) + '] ' +
      codes.join(' / ') + ': ' + diagnosticText(failure.message, 240)
    );
  }

  function combinedOpenError(filezFailure, nativeFailure) {
    var error = makeError(
      'FILEZ_AND_NATIVE_OPEN_FAILED',
      'FileZ failed (' + filezFailure.code + '); A8 native editor failed (' +
        nativeFailure.code + ')'
    );
    error.filezFailure = filezFailure;
    error.nativeFailure = nativeFailure;
    return error;
  }

  function nativeProviderKey(session) {
    var mapping;
    var key;
    var family;
    var fileType = safeString(session.instance.params.fileType)
      .toLowerCase()
      .replace(/^\./, '');
    var mode = safeString(session.instance.params.mode).toUpperCase();
    if (
      ['doc', 'docx', 'wps', 'xls', 'xlsx', 'et'].indexOf(fileType) < 0 ||
      mode !== 'EDIT'
    ) {
      return '';
    }
    family = ['xls', 'xlsx', 'et'].indexOf(fileType) >= 0 ? 'EXCEL' : 'WORD';
    try {
      mapping = session.instance.cacheAdapterMapping;
      key = mapping && mapping[family] && mapping[family].EDIT;
    } catch (ignore) {
      key = '';
    }
    return diagnosticText(key, 80);
  }

  function rememberFinalFailure(session, error) {
    var filezFailure = error && error.filezFailure;
    var nativeFailure = error && error.nativeFailure;
    lastFailure = {
      at: new Date().toISOString(),
      code: errorCode(error),
      fileType: diagnosticText(session.instance.params.fileType, 20),
      mode: diagnosticText(session.instance.params.mode, 20),
      filez: filezFailure || null,
      native: nativeFailure || null
    };
    try {
      if (window.console && typeof window.console.error === 'function') {
        window.console.error(
          '[Ruian FileZ Editor] FileZ and native fallback both failed',
          lastFailure
        );
      }
    } catch (ignore) {
      // Diagnostics must never change the failure path.
    }
  }

  function invokeOnce(callback) {
    var invoked = false;
    return function () {
      if (invoked) {
        return;
      }
      invoked = true;
      if (typeof callback === 'function') {
        callback.apply(null, arguments);
      }
    };
  }

  function shallowCopy(source) {
    var target = {};
    var key;
    if (!source) {
      return target;
    }
    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function mergeOwn(target, source) {
    var key;
    target = target || {};
    if (!source) {
      return target;
    }
    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  function resolveBridge() {
    var index;
    for (index = 0; index < BRIDGE_KEYS.length; index += 1) {
      if (window[BRIDGE_KEYS[index]]) {
        return window[BRIDGE_KEYS[index]];
      }
    }
    return null;
  }

  function report(options, type, detail) {
    var bridge;
    try {
      if (options && typeof options.record === 'function') {
        options.record(type, detail || {});
        return;
      }
      bridge = resolveBridge();
      if (bridge && typeof bridge.record === 'function') {
        bridge.record(type, detail || {});
      }
    } catch (ignore) {
      // Diagnostics must never affect the editor lifecycle.
    }
  }

  function addActive(session) {
    if (activeSessions.indexOf(session) < 0) {
      activeSessions.push(session);
    }
  }

  function removeActive(session) {
    var index = activeSessions.indexOf(session);
    if (index >= 0) {
      activeSessions.splice(index, 1);
    }
  }

  function currentOrigin() {
    return safeString(window.location && window.location.origin);
  }

  function normalizedWebRoot(params) {
    var raw = safeString(params && params.webRoot);
    var url;
    var contextPath;

    try {
      if (raw) {
        url = new window.URL(raw, window.location.href);
        if (url.origin === currentOrigin()) {
          return url.origin + url.pathname.replace(/\/+$/, '');
        }
      }
    } catch (ignore) {
      // Use the current A8 context path below.
    }

    contextPath = safeString(window._ctxPath);
    if (!contextPath) {
      contextPath = '/seeyon';
    }
    if (contextPath.charAt(0) !== '/') {
      contextPath = '/' + contextPath;
    }
    return currentOrigin() + contextPath.replace(/\/+$/, '');
  }

  function parseJsonResponse(value) {
    var parsed = value;
    var depth = 0;
    while (typeof parsed === 'string' && depth < 2) {
      parsed = JSON.parse(parsed);
      depth += 1;
    }
    return parsed;
  }

  function parseExpiresAt(value) {
    var numeric;
    var parsed;

    if (typeof value === 'number') {
      numeric = value;
    } else if (
      typeof value === 'string' &&
      /^[0-9]+(?:\.[0-9]+)?$/.test(value.replace(/^\s+|\s+$/g, ''))
    ) {
      numeric = Number(value.replace(/^\s+|\s+$/g, ''));
    }

    if (numeric !== undefined) {
      if (!isFinite(numeric) || numeric <= 0) {
        return NaN;
      }
      return numeric < 100000000000 ? numeric * 1000 : numeric;
    }

    parsed = Date.parse(value);
    return parsed;
  }

  function normalizeFileId(value) {
    var result = safeString(value).replace(/^\s+|\s+$/g, '');
    if (!result || result.length > 128 || /[\u0000-\u001f\u007f]/.test(result)) {
      return '';
    }
    return result;
  }

  function resolveEditSurface(params) {
    var explicit = safeString(
      params && (params.__ruianFilezSurface || params.surface)
    ).toUpperCase();
    var pathname = safeString(window.location && window.location.pathname).toLowerCase();
    if (
      explicit === 'GOVDOC' ||
      explicit === 'COLLABORATION' ||
      explicit === 'DOCUMENT'
    ) {
      return explicit;
    }
    if (pathname.indexOf('/govdoc/') >= 0) {
      return 'GOVDOC';
    }
    if (pathname.indexOf('/collaboration/') >= 0) {
      return 'COLLABORATION';
    }
    if (pathname.indexOf('/doc/') >= 0) {
      return 'DOCUMENT';
    }
    return '';
  }

  function isNewDocument(params) {
    return !!(
      params &&
      (
        params.__ruianFilezNewDocument === true ||
        params.newDocument === true ||
        params.isNewOfficeFilePage === true ||
        !normalizeFileId(params.fileId)
      )
    );
  }

  function validateEditContract(raw, session) {
    var response;
    var data;
    var editUrlValue;
    var editUrl;
    var webRootUrl;
    var expiresAt;
    var fileId;

    try {
      response = parseJsonResponse(raw);
    } catch (error) {
      throw makeError('INVALID_RESPONSE', 'FileZ edit response is not valid JSON', error);
    }

    if (response && Object.prototype.hasOwnProperty.call(response, 'result')) {
      try {
        response = parseJsonResponse(response.result);
      } catch (error) {
        throw makeError(
          'INVALID_RESPONSE',
          'FileZ edit response result is not valid JSON',
          error
        );
      }
    }

    if (!response || response.success !== true || response.code !== 'OK') {
      throw makeError(
        safeString(response && response.code) || 'EDIT_SESSION_REJECTED',
        safeString(response && response.message) || 'FileZ edit session was rejected'
      );
    }

    data = response.data;
    editUrlValue = data && (data.editUrl || data.viewUrl || data.wrapperUrl);
    fileId = normalizeFileId(data && data.fileId);
    if (
      !data ||
      !editUrlValue ||
      !data.sessionId ||
      data.expiresAt === undefined ||
      data.expiresAt === null ||
      data.expiresAt === '' ||
      data.readyProtocol !== MESSAGE_PROTOCOL ||
      !data.nonce ||
      !fileId
    ) {
      throw makeError('INVALID_RESPONSE', 'FileZ edit session is incomplete');
    }

    try {
      editUrl = new window.URL(editUrlValue, window.location.href);
      webRootUrl = new window.URL(normalizedWebRoot(session.instance.params));
    } catch (error) {
      throw makeError('INVALID_EDIT_URL', 'FileZ edit URL is invalid', error);
    }

    if (
      editUrl.origin !== currentOrigin() ||
      (
        editUrl.pathname !== webRootUrl.pathname &&
        editUrl.pathname.indexOf(webRootUrl.pathname.replace(/\/+$/, '') + '/') !== 0
      )
    ) {
      throw makeError('UNTRUSTED_EDIT_URL', 'FileZ edit URL must be inside A8');
    }

    expiresAt = parseExpiresAt(data.expiresAt);
    if (!isFinite(expiresAt) || expiresAt <= Date.now()) {
      throw makeError('EDIT_SESSION_EXPIRED', 'FileZ edit session is expired');
    }

    if (
      data.saveProtocol !== undefined &&
      data.saveProtocol !== null &&
      data.saveProtocol !== '' &&
      data.saveProtocol !== MESSAGE_PROTOCOL
    ) {
      throw makeError('UNSUPPORTED_SAVE_PROTOCOL', 'FileZ save protocol is unsupported');
    }

    return {
      editUrl: editUrl.href,
      sessionId: safeString(data.sessionId),
      expiresAt: data.expiresAt,
      readyProtocol: data.readyProtocol,
      saveProtocol: data.saveProtocol || data.readyProtocol,
      nonce: safeString(data.nonce),
      fileId: fileId,
      createdNew: data.createdNew === true,
      contentLength:
        typeof data.contentLength === 'number' && data.contentLength >= 0
          ? data.contentLength
          : null
    };
  }

  function resolveCsrfGuard() {
    var candidates = [window];
    var a8Top;
    var index;

    try {
      if (typeof window.getA8Top === 'function') {
        a8Top = window.getA8Top();
        if (a8Top) {
          candidates.push(a8Top);
        }
      }
    } catch (ignore) {
      // Continue with the remaining same-origin windows.
    }

    try {
      if (window.parent && window.parent !== window) {
        candidates.push(window.parent);
      }
    } catch (ignore) {
      // Ignore cross-origin parents.
    }

    try {
      if (window.top && window.top !== window) {
        candidates.push(window.top);
      }
    } catch (ignore) {
      // Ignore cross-origin top windows.
    }

    for (index = 0; index < candidates.length; index += 1) {
      try {
        if (candidates[index] && candidates[index].CsrfGuard) {
          return candidates[index].CsrfGuard;
        }
      } catch (ignore) {
        // Continue looking.
      }
    }
    return null;
  }

  function applyCsrfToXhr(request) {
    var guard = resolveCsrfGuard();
    var token;
    if (!guard || !request) {
      return;
    }
    try {
      if (typeof guard.beforeAjaxSend === 'function') {
        guard.beforeAjaxSend(request);
        return;
      }
      if (
        typeof guard.getToken === 'function' &&
        typeof request.setRequestHeader === 'function'
      ) {
        token = safeString(guard.getToken());
        if (token) {
          request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          request.setRequestHeader('CSRFTOKEN', token);
        }
      }
    } catch (ignore) {
      // A8 will reject the request if its CSRF contract is not satisfied.
    }
  }

  function prepareFetchCsrf(endpoint, headers) {
    var guard = resolveCsrfGuard();
    var token = '';
    var suffix = '';

    headers['X-Requested-With'] = 'XMLHttpRequest';
    if (!guard) {
      return endpoint;
    }
    try {
      if (typeof guard.getToken === 'function') {
        token = safeString(guard.getToken());
      }
    } catch (ignore) {
      token = '';
    }
    if (token) {
      headers.CSRFTOKEN = token;
      return endpoint;
    }
    try {
      if (typeof guard.getUrlSurffix === 'function') {
        suffix = safeString(guard.getUrlSurffix(endpoint));
      }
    } catch (ignore) {
      suffix = '';
    }
    if (!suffix || endpoint.indexOf('CSRFTOKEN=') >= 0) {
      return endpoint;
    }
    if (suffix.charAt(0) === '?' || suffix.charAt(0) === '&') {
      return endpoint + suffix;
    }
    return (
      endpoint +
      (endpoint.indexOf('?') >= 0 ? '&' : '?') +
      suffix.replace(/^[?&]+/, '')
    );
  }

  function requestEditSession(session) {
    var params = session.instance.params;
    var endpoint =
      normalizedWebRoot(params) +
      '/ajax.do?method=ajaxAction' +
      '&managerName=ruianFileZViewManager' +
      '&managerMethod=createEditSession';
    var payload = {
      affairId: session.affairId,
      fileId: normalizeFileId(params.fileId),
      originalFileId: normalizeFileId(params.originalFileId),
      fileName: safeString(params.fileName),
      fileType: safeString(params.fileType).toLowerCase().replace(/^\./, ''),
      category:
        params.category === undefined || params.category === null
          ? 4
          : params.category,
      editType: safeString(params.editType),
      surface: resolveEditSurface(params),
      newDocument: isNewDocument(params),
      mode: 'edit'
    };
    var requestTimeout =
      Number(session.options.requestTimeoutMs) || DEFAULT_REQUEST_TIMEOUT;
    var controller = null;
    var requestOptions = {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: 'arguments=' + encodeURIComponent(JSON.stringify([payload]))
    };
    var fetchEndpoint;

    if (window.$ && typeof window.$.ajax === 'function') {
      return new Promise(function (resolve, reject) {
        var settled = false;
        var request = null;
        var timer = window.setTimeout(function () {
          if (settled) {
            return;
          }
          settled = true;
          session.requestAbort = null;
          if (request && typeof request.abort === 'function') {
            try {
              request.abort();
            } catch (ignore) {
              // Abort is best effort.
            }
          }
          reject(makeError('EDIT_SESSION_TIMEOUT', 'FileZ edit session timed out'));
        }, requestTimeout);

        function finish(callback, value) {
          if (settled) {
            return;
          }
          settled = true;
          window.clearTimeout(timer);
          session.requestAbort = null;
          callback(value);
        }

        try {
          request = window.$.ajax({
            url: endpoint,
            type: 'POST',
            data: {
              arguments: JSON.stringify([payload])
            },
            dataType: 'json',
            cache: false,
            beforeSend: function (xhr) {
              applyCsrfToXhr(xhr);
            },
            success: function (raw) {
              try {
                finish(resolve, validateEditContract(raw, session));
              } catch (error) {
                finish(reject, error);
              }
            },
            error: function (xhr, status, error) {
              finish(
                reject,
                status === 'timeout'
                  ? makeError('EDIT_SESSION_TIMEOUT', 'FileZ edit session timed out', error)
                  : makeError(
                      'EDIT_SESSION_NETWORK_ERROR',
                      'FileZ edit request failed',
                      error || status
                    )
              );
            }
          });
          if (!settled) {
            session.requestAbort = function () {
              if (request && typeof request.abort === 'function') {
                request.abort();
              }
            };
          }
        } catch (error) {
          finish(
            reject,
            makeError('EDIT_SESSION_NETWORK_ERROR', 'FileZ edit request failed', error)
          );
        }
      });
    }

    if (typeof window.fetch !== 'function') {
      return Promise.reject(
        makeError('FETCH_UNAVAILABLE', 'The browser has no fetch implementation')
      );
    }

    if (typeof window.AbortController === 'function') {
      controller = new window.AbortController();
      requestOptions.signal = controller.signal;
      session.abortController = controller;
    }
    fetchEndpoint = prepareFetchCsrf(endpoint, requestOptions.headers);

    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) {
          return;
        }
        settled = true;
        if (controller) {
          try {
            controller.abort();
          } catch (ignore) {
            // Abort is best effort.
          }
        }
        reject(makeError('EDIT_SESSION_TIMEOUT', 'FileZ edit session timed out'));
      }, requestTimeout);

      function finish(callback, value) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        session.abortController = null;
        callback(value);
      }

      Promise.resolve(window.fetch(fetchEndpoint, requestOptions))
        .then(function (response) {
          if (!response || response.ok === false) {
            throw makeError(
              'EDIT_SESSION_HTTP_ERROR',
              'FileZ edit session HTTP request failed'
            );
          }
          if (typeof response.text !== 'function') {
            throw makeError('INVALID_RESPONSE', 'FileZ edit response has no body');
          }
          return response.text();
        })
        .then(function (text) {
          finish(resolve, validateEditContract(text, session));
        })
        .catch(function (error) {
          finish(
            reject,
            error && error.code
              ? error
              : makeError(
                  'EDIT_SESSION_NETWORK_ERROR',
                  'FileZ edit request failed',
                  error
                )
          );
        });
    });
  }

  function sameOriginWindow(candidate) {
    try {
      if (candidate && candidate.location && candidate.location.origin === currentOrigin()) {
        return candidate;
      }
    } catch (ignore) {
      // Cross-origin windows are not candidates.
    }
    return null;
  }

  function appendWindow(candidates, candidate) {
    var normalized = sameOriginWindow(candidate);
    if (normalized && candidates.indexOf(normalized) < 0) {
      candidates.push(normalized);
    }
  }

  function appendContentApi(apis, candidateWindow) {
    var trustedWindow = sameOriginWindow(candidateWindow);
    var api;
    if (!trustedWindow) {
      return;
    }
    try {
      api = trustedWindow.contentAPI;
      if (
        api &&
        typeof api.updateMainBodyData === 'function' &&
        apis.indexOf(api) < 0
      ) {
        apis.push(api);
      }
    } catch (ignore) {
      // Cross-origin or not-yet-ready frames are not valid binding targets.
    }
  }

  function frameWindow(frameReference) {
    var frame = frameReference;
    if (frame && frame.jquery && frame.length) {
      frame = frame[0];
    }
    if (frame && frame.contentWindow) {
      frame = frame.contentWindow;
    }
    return sameOriginWindow(frame);
  }

  function appendFrameApi(windows, apis, frameReference) {
    var trustedFrame = frameWindow(frameReference);
    if (!trustedFrame) {
      return;
    }
    appendWindow(windows, trustedFrame);
    appendContentApi(apis, trustedFrame);
  }

  function bodyContentApiCandidates() {
    var windows = [];
    var apis = [];
    var frameNames = ['govDocZwIframe', 'zwIframe', 'componentDiv'];
    var index;
    var nameIndex;
    var nodeIndex;
    var candidate;
    var frame;
    var nodes;

    appendWindow(windows, window);
    try {
      appendWindow(windows, window.parent);
    } catch (ignore) {
      // Ignore cross-origin parent.
    }
    try {
      appendWindow(windows, window.top);
    } catch (ignore) {
      // Ignore cross-origin top.
    }
    try {
      if (typeof window.getA8Top === 'function') {
        appendWindow(windows, window.getA8Top());
      }
    } catch (ignore) {
      // Ignore unavailable A8 top window.
    }

    for (index = 0; index < windows.length; index += 1) {
      candidate = windows[index];
      appendContentApi(apis, candidate);
      try {
        if (typeof candidate._getZWIframe === 'function') {
          appendFrameApi(windows, apis, candidate._getZWIframe());
        }
      } catch (ignore) {
        // Continue with DOM lookup.
      }
      try {
        if (
          candidate.edocSdk &&
          typeof candidate.edocSdk.getZwIframe === 'function'
        ) {
          appendFrameApi(windows, apis, candidate.edocSdk.getZwIframe());
        }
      } catch (ignore) {
        // Continue with named-frame and DOM lookup.
      }

      for (nameIndex = 0; nameIndex < frameNames.length; nameIndex += 1) {
        try {
          if (candidate.frames) {
            appendFrameApi(
              windows,
              apis,
              candidate.frames[frameNames[nameIndex]]
            );
          }
        } catch (ignore) {
          // Continue with DOM id/name lookup.
        }
        try {
          if (candidate.document && candidate.document.getElementById) {
            frame = candidate.document.getElementById(frameNames[nameIndex]);
            appendFrameApi(windows, apis, frame);
          }
        } catch (ignore) {
          // Continue with DOM name lookup.
        }
        try {
          if (candidate.document && candidate.document.getElementsByName) {
            nodes = candidate.document.getElementsByName(frameNames[nameIndex]);
            for (nodeIndex = 0; nodes && nodeIndex < nodes.length; nodeIndex += 1) {
              appendFrameApi(windows, apis, nodes[nodeIndex]);
            }
          }
        } catch (ignore) {
          // Continue with the next frame name.
        }
      }
    }
    return apis;
  }

  function updateHiddenFileIds(fileId, previousFileId) {
    var windows = [];
    var names = ['fileId', 'contentDataId', 'contentId'];
    var index;
    var nameIndex;
    var nodes;
    var nodeIndex;
    var node;

    appendWindow(windows, window);
    try {
      appendWindow(windows, window.parent);
      appendWindow(windows, window.top);
    } catch (ignore) {
      // Best effort only.
    }
    for (index = 0; index < windows.length; index += 1) {
      try {
        for (nameIndex = 0; nameIndex < names.length; nameIndex += 1) {
          nodes = windows[index].document.getElementsByName(names[nameIndex]);
          for (nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
            node = nodes[nodeIndex];
            if (
              node &&
              ('value' in node) &&
              (!node.value || safeString(node.value) === safeString(previousFileId))
            ) {
              node.value = fileId;
            }
          }
        }
      } catch (ignore) {
        // Hidden fields are a secondary compatibility path.
      }
    }
  }

  function bindResolvedFileId(session, contract) {
    var finalFileId = normalizeFileId(contract && contract.fileId);
    var previousFileId = normalizeFileId(session.sourceFileId);
    var requiresBodyBinding =
      !!(contract && contract.createdNew) || !previousFileId || finalFileId !== previousFileId;
    var apis;
    var index;
    var bound = false;

    if (!finalFileId) {
      throw makeError('FINAL_FILE_ID_MISSING', 'FileZ did not return the final A8 fileId');
    }

    if (requiresBodyBinding) {
      apis = bodyContentApiCandidates();
      for (index = 0; index < apis.length; index += 1) {
        try {
          apis[index].updateMainBodyData('fileId', finalFileId);
          bound = true;
          try {
            apis[index].updateMainBodyData('id', finalFileId);
            apis[index].updateMainBodyData('contentDataId', finalFileId);
          } catch (ignore) {
            // fileId is the required binding; aliases are best effort.
          }
          break;
        } catch (ignore) {
          // Try the next same-origin body API.
        }
      }
      if (!bound) {
        throw makeError(
          'A8_BODY_BINDING_UNAVAILABLE',
          'The final FileZ fileId could not be bound to the A8 body'
        );
      }
    }

    session.finalFileId = finalFileId;
    session.instance.params.fileId = finalFileId;
    session.adapter.params.fileId = finalFileId;
    session.initParams.fileId = finalFileId;
    if (contract.contentLength !== null) {
      session.contentLength = contract.contentLength;
    }
    updateHiddenFileIds(finalFileId, previousFileId);
  }

  function removeNode(node) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }

  function cleanupReadyWait(session) {
    if (session.readyTimer) {
      window.clearTimeout(session.readyTimer);
      session.readyTimer = null;
    }
    session.readyReject = null;
    if (session.iframe) {
      session.iframe.onerror = null;
    }
  }

  function cleanupMessageBridge(session) {
    if (session.messageHandler) {
      window.removeEventListener('message', session.messageHandler, false);
      session.messageHandler = null;
    }
  }

  function rejectPendingSave(session, error) {
    var pending = session.pendingSave;
    if (!pending) {
      return;
    }
    session.pendingSave = null;
    if (pending.timer) {
      window.clearTimeout(pending.timer);
    }
    pending.reject(error);
  }

  function teardownEditor(session, reason, rejectPending) {
    var readyReject;
    var error = makeError(reason || 'EDIT_CANCELLED', 'FileZ edit was cancelled');

    if (session.requestAbort) {
      try {
        session.requestAbort();
      } catch (ignore) {
        // Abort is best effort.
      }
      session.requestAbort = null;
    }
    if (session.abortController) {
      try {
        session.abortController.abort();
      } catch (ignore) {
        // Abort is best effort.
      }
      session.abortController = null;
    }

    readyReject = session.readyReject;
    cleanupReadyWait(session);
    if (rejectPending !== false && readyReject) {
      readyReject(error);
    }
    if (rejectPending !== false) {
      rejectPendingSave(session, error);
    }
    cleanupMessageBridge(session);

    removeNode(session.host);
    if (
      session.positionChanged &&
      session.container &&
      session.container.style &&
      session.container.style.position === 'relative'
    ) {
      session.container.style.position = session.previousInlinePosition;
    }

    session.host = null;
    session.iframe = null;
    session.container = null;
    session.blockedBanner = null;
    session.positionChanged = false;
    session.ready = false;
  }

  function isTrustedMessage(session, event, data) {
    return !!(
      event &&
      event.origin === currentOrigin() &&
      session.iframe &&
      event.source === session.iframe.contentWindow &&
      data &&
      typeof data === 'object' &&
      data.channel === MESSAGE_CHANNEL &&
      data.protocol === MESSAGE_PROTOCOL &&
      session.contract &&
      safeString(data.nonce) === session.contract.nonce &&
      safeString(data.sessionId) === session.contract.sessionId
    );
  }

  function emitContentModified(session, modified, detail) {
    var callback = session.instance.params.eventTriggerCallback;
    session.dirty = modified === true;
    if (typeof callback === 'function') {
      try {
        callback({
          type:
            window.OfficeSDK && window.OfficeSDK.ENUM_EVENT_TYPE
              ? window.OfficeSDK.ENUM_EVENT_TYPE.CONTENT_MODIFIED
              : 'contentModified',
          value: session.dirty,
          detail: detail || null
        });
      } catch (ignore) {
        // A business event callback must not break the save channel.
      }
    }
  }

  function showBlockedFailure(session, error) {
    var banner;
    if (!session.host || !session.host.appendChild || session.blockedBanner) {
      return;
    }
    banner = document.createElement('div');
    banner.setAttribute('data-ruian-filez-blocked', 'true');
    banner.setAttribute('role', 'alert');
    banner.style.cssText =
      'position:absolute;left:12px;right:12px;top:12px;z-index:3;' +
      'padding:10px 14px;border:1px solid #f59e0b;border-radius:4px;' +
      'background:#fff7ed;color:#9a3412;box-shadow:0 2px 8px rgba(0,0,0,.15);' +
      'font:14px/1.5 Arial,sans-serif;box-sizing:border-box;';
    banner.textContent =
      'FileZ 编辑器发生异常，当前修改尚未确认保存。' +
      '请勿提交或关闭页面，并联系管理员处理。错误代码：' +
      errorCode(error);
    session.blockedBanner = banner;
    session.host.appendChild(banner);
  }

  function saveResultPayload(data) {
    if (data && data.data && typeof data.data === 'object') {
      return data.data;
    }
    return data || {};
  }

  function handleSaveResult(session, data) {
    var pending = session.pendingSave;
    var payload;
    var resultFileId;
    var success;
    var error;

    if (!pending || safeString(data.requestId) !== pending.requestId) {
      return;
    }
    session.pendingSave = null;
    if (pending.timer) {
      window.clearTimeout(pending.timer);
    }

    payload = saveResultPayload(data);
    success = data.success === true || payload.success === true;
    if (!success) {
      error = makeError(
        safeString(data.code || payload.code) || 'FILEZ_SAVE_FAILED',
        safeString(data.message || payload.message) || 'FileZ did not confirm the save'
      );
      pending.reject(error);
      return;
    }

    resultFileId = normalizeFileId(
      data.fileId || payload.fileId || pending.targetFileId
    );
    if (resultFileId && resultFileId !== session.finalFileId) {
      try {
        bindResolvedFileId(session, {
          fileId: resultFileId,
          createdNew: true,
          contentLength:
            typeof payload.contentLength === 'number' ? payload.contentLength : null
        });
      } catch (bindingError) {
        pending.reject(bindingError);
        return;
      }
    }
    if (typeof payload.contentLength === 'number' && payload.contentLength >= 0) {
      session.contentLength = payload.contentLength;
    }
    session.savedOnce = true;
    session.needsSave = false;
    emitContentModified(session, false, payload);
    pending.resolve(true);
  }

  function handleBridgeMessage(session, event) {
    var data = event && event.data;
    var type;
    var modified;
    var readyResolve;
    var readyReject;
    var wrapperError;
    var hasUncommittedWork;

    if (!isTrustedMessage(session, event, data)) {
      return;
    }
    type = safeString(data.type).toUpperCase();
    if (type === 'READY') {
      readyResolve = session.readyResolve;
      session.readyResolve = null;
      session.readyReject = null;
      if (readyResolve) {
        readyResolve(true);
      }
      return;
    }
    if (type === 'FAILED') {
      wrapperError = makeError(
        safeString(data.code) || 'FILEZ_WRAPPER_FAILED',
        safeString(data.message) || 'FileZ edit wrapper reported a failure'
      );
      readyReject = session.readyReject;
      session.readyResolve = null;
      session.readyReject = null;
      if (readyReject) {
        readyReject(wrapperError);
      } else {
        session.primaryFailure = describeFailure(
          wrapperError,
          'FILEZ_WRAPPER_FAILED',
          'post-ready-wrapper'
        );
        hasUncommittedWork = !!(
          session.dirty ||
          session.needsSave ||
          session.pendingSave
        );
        session.ready = false;
        rejectPendingSave(session, wrapperError);
        if (hasUncommittedWork) {
          // The iframe is the only holder of edits that have not received a
          // durable SAVE_RESULT. Keep it mounted and block A8 submission.
          if (!session.blockedError) {
            session.blockedError = wrapperError;
          }
          showBlockedFailure(session, session.blockedError);
          report(session.options, 'filez-edit-blocked', {
            errorCode: errorCode(session.blockedError),
            dirty: session.dirty === true,
            needsSave: session.needsSave === true
          });
        } else {
          // With no uncommitted work it is safe to remove the failed iframe
          // and re-open through A8's native resolver.
          nativeFallback(
            session,
            session.lastOpenParams || {},
            wrapperError
          ).catch(function () {
            // Failure has already been reported and rendered by nativeFallback.
          });
        }
      }
      return;
    }
    if (type === 'SAVE_RESULT') {
      handleSaveResult(session, data);
      return;
    }
    if (type === 'SAVE_FAILED') {
      data.success = false;
      handleSaveResult(session, data);
      return;
    }
    if (type === 'SAVE_REQUESTED') {
      // The FileZ SDK accepted its local save call, but A8 has not yet
      // confirmed that the corresponding revision is durable. Keep waiting
      // for SAVE_RESULT instead of releasing the A8 submit/send gate.
      report(session.options, 'filez-edit-save-accepted', {
        requestId: safeString(data.requestId)
      });
      return;
    }
    if (type === 'CONTENT_MODIFIED') {
      if (typeof data.modified === 'boolean') {
        modified = data.modified;
      } else if (typeof data.value === 'boolean') {
        modified = data.value;
      } else if (data.data && typeof data.data.modified === 'boolean') {
        modified = data.data.modified;
      } else {
        modified = true;
      }
      emitContentModified(session, modified, data.data || data);
    }
  }

  function mountEditor(session, contract) {
    var domId = safeString(session.instance.params.domId);
    var container = document.getElementById(domId);
    var host;
    var loading;
    var iframe;
    var computedPosition = '';
    var readyTimeout =
      Number(session.options.readyTimeoutMs) || DEFAULT_READY_TIMEOUT;

    if (!container || !document.body || !container.appendChild) {
      return Promise.reject(
        makeError('BODY_CONTAINER_MISSING', 'The A8 body container was not found')
      );
    }

    host = document.createElement('div');
    host.id = 'ruian-filez-edit-host-' + session.id;
    host.setAttribute('data-ruian-filez-edit', 'true');
    host.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;' +
      'z-index:2147483000;background:#fff;overflow:hidden;';

    loading = document.createElement('div');
    loading.setAttribute('data-ruian-filez-loading', 'true');
    loading.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;display:flex;' +
      'align-items:center;justify-content:center;background:#f7f8fa;' +
      'color:#4b5563;font:14px/1.5 Arial,sans-serif;';
    loading.textContent = 'FileZ editor is loading...';

    iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'FileZ document editor');
    iframe.setAttribute('allow', 'fullscreen *');
    iframe.setAttribute('data-ruian-filez-frame', 'true');
    iframe.style.cssText =
      'width:100%;height:100%;border:0;margin:0;padding:0;display:block;' +
      'visibility:hidden;background:#fff;';

    session.container = container;
    session.host = host;
    session.iframe = iframe;
    session.contract = contract;
    session.previousInlinePosition = container.style.position || '';

    try {
      computedPosition = window.getComputedStyle
        ? window.getComputedStyle(container).position
        : session.previousInlinePosition;
    } catch (ignore) {
      computedPosition = session.previousInlinePosition;
    }
    if (!computedPosition || computedPosition === 'static') {
      container.style.position = 'relative';
      session.positionChanged = true;
    }

    host.appendChild(loading);
    host.appendChild(iframe);
    container.appendChild(host);

    return new Promise(function (resolve, reject) {
      var settled = false;

      function finish(error) {
        if (settled) {
          return;
        }
        settled = true;
        cleanupReadyWait(session);
        session.readyResolve = null;
        session.readyReject = null;
        if (error) {
          reject(error);
          return;
        }
        iframe.style.visibility = 'visible';
        removeNode(loading);
        resolve(true);
      }

      session.readyResolve = function () {
        finish(null);
      };
      session.readyReject = function (error) {
        finish(error || makeError('EDIT_CANCELLED', 'FileZ edit was cancelled'));
      };
      session.messageHandler = function (event) {
        handleBridgeMessage(session, event);
      };
      window.addEventListener('message', session.messageHandler, false);
      iframe.onerror = function () {
        finish(makeError('EDIT_IFRAME_ERROR', 'FileZ edit wrapper failed to load'));
      };
      session.readyTimer = window.setTimeout(function () {
        finish(makeError('EDIT_READY_TIMEOUT', 'FileZ edit wrapper readiness timed out'));
      }, readyTimeout);
      iframe.src = contract.editUrl;
    });
  }

  function renderFinalFailure(session, error) {
    var domId = safeString(session.instance.params.domId);
    var container = document.getElementById(domId);
    var host;
    var title;
    var detail;
    var filezDetail;
    var nativeDetail;
    var hint;
    var filezFailure = error && error.filezFailure;
    var nativeFailure = error && error.nativeFailure;
    var computedPosition = '';

    if (!container || !container.appendChild) {
      return;
    }
    teardownEditor(session, 'FINAL_FAILURE', false);
    host = document.createElement('div');
    host.id = 'ruian-filez-edit-host-' + session.id;
    host.setAttribute('data-ruian-filez-error', 'true');
    host.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;' +
      'z-index:2147483000;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;background:#fff7ed;' +
      'color:#7c2d12;font:14px/1.6 Arial,sans-serif;text-align:left;' +
      'padding:24px;box-sizing:border-box;';
    title = document.createElement('strong');
    title.textContent = 'FileZ 与致远原生编辑器均无法打开正文';
    title.style.cssText = 'font-size:16px;margin-bottom:8px;';
    detail = document.createElement('span');
    detail.textContent = '综合错误代码：' + errorCode(error);
    detail.style.cssText = 'margin-bottom:8px;';
    host.appendChild(title);
    host.appendChild(detail);
    if (filezFailure) {
      filezDetail = document.createElement('span');
      filezDetail.setAttribute('data-ruian-filez-primary-error', 'true');
      filezDetail.textContent = 'FileZ：' + failureLabel(filezFailure);
      host.appendChild(filezDetail);
    }
    if (nativeFailure) {
      nativeDetail = document.createElement('span');
      nativeDetail.setAttribute('data-ruian-native-fallback-error', 'true');
      nativeDetail.textContent =
        '致远原生：' + failureLabel(nativeFailure) +
        (nativeFailure.providerKey
          ? '（后台映射：' + nativeFailure.providerKey + '）'
          : '');
      host.appendChild(nativeDetail);
      if (
        safeString(nativeFailure.code) === '1' ||
        /^(NONE|OFF|NULL|UNDEFINED)$/i.test(
          safeString(nativeFailure.providerKey)
        )
      ) {
        hint = document.createElement('span');
        hint.setAttribute('data-ruian-native-config-hint', 'true');
        hint.style.cssText = 'margin-top:10px;color:#9a3412;';
        hint.textContent =
          '提示：错误代码 1 通常表示致远原生在线编辑器配置为“无”、' +
          '未安装对应厂商插件，或该插件不支持当前文件类型。';
        host.appendChild(hint);
      }
    }

    try {
      computedPosition = window.getComputedStyle
        ? window.getComputedStyle(container).position
        : container.style.position;
    } catch (ignore) {
      computedPosition = container.style.position;
    }
    if (!computedPosition || computedPosition === 'static') {
      session.previousInlinePosition = container.style.position || '';
      container.style.position = 'relative';
      session.positionChanged = true;
    }
    session.container = container;
    session.host = host;
    container.appendChild(host);
  }

  function nativeFallback(session, openParams, reason) {
    var fallbackInitParams;
    var fallbackOpenParams;
    var primaryFailure;
    var nativePhase = 'native-init';
    var configuredNativeProvider = nativeProviderKey(session);

    if (session.fallbackPromise) {
      return session.fallbackPromise;
    }
    primaryFailure =
      session.primaryFailure ||
      describeFailure(reason, 'FILEZ_EDIT_FAILED', session.openPhase || 'unknown');
    session.primaryFailure = primaryFailure;
    session.fallingBack = true;
    teardownEditor(session, 'NATIVE_FALLBACK', true);
    session.instance.__ruianFilezBypass = true;
    session.instance.params.__ruianFilezBypass = true;
    fallbackInitParams = shallowCopy(session.instance.params);
    fallbackInitParams.__ruianFilezBypass = true;
    fallbackOpenParams = shallowCopy(openParams || {});
    if (session.openBeforeInvoked) {
      delete fallbackOpenParams.openBeforeFun;
    }

    report(session.options, 'native-edit-fallback-started', {
      reasonCode: primaryFailure.code,
      reasonPhase: primaryFailure.phase
    });
    session.fallbackPromise = Promise.resolve()
      .then(function () {
        return session.instance.init(fallbackInitParams);
      })
      .then(function () {
        if (
          session.instance.pluginKey === ADAPTER_KEY ||
          (
            session.instance.adapterInstance &&
            session.instance.adapterInstance.__ruianFilezSession
          )
        ) {
          throw makeError(
            'NATIVE_FALLBACK_RESELECTED_FILEZ',
            'A8 selected the FileZ adapter again while native fallback was active'
          );
        }
        nativePhase = 'native-open';
        return session.instance.openFile(fallbackOpenParams);
      })
      .then(function (result) {
        report(session.options, 'native-edit-fallback-completed', { success: true });
        return result;
      })
      .catch(function (error) {
        var nativeFailure = describeFailure(
          error,
          nativePhase === 'native-init'
            ? 'NATIVE_EDITOR_INIT_FAILED'
            : 'NATIVE_EDITOR_OPEN_FAILED',
          nativePhase
        );
        var combinedError = combinedOpenError(primaryFailure, nativeFailure);
        nativeFailure.providerKey = configuredNativeProvider;
        session.nativeFailure = nativeFailure;
        report(session.options, 'native-edit-fallback-completed', {
          success: false,
          errorCode: combinedError.code,
          filezCode: primaryFailure.code,
          filezPhase: primaryFailure.phase,
          nativeCode: nativeFailure.code,
          nativePhase: nativeFailure.phase,
          nativeProvider: configuredNativeProvider || 'UNKNOWN'
        });
        rememberFinalFailure(session, combinedError);
        renderFinalFailure(session, combinedError);
        throw combinedError;
      })
      .then(
        function (result) {
          removeActive(session);
          return result;
        },
        function (error) {
          removeActive(session);
          throw error;
        }
      );
    return session.fallbackPromise;
  }

  function unsupported(callback, operation) {
    var error = makeError(
      'FILEZ_EDIT_UNSUPPORTED_' + safeString(operation).toUpperCase(),
      'FileZ edit adapter does not support ' + operation
    );
    if (typeof callback === 'function') {
      callback(error, null);
    }
    return false;
  }

  function normalizeSaveParams(session, params) {
    var normalized;
    if (typeof params === 'string' || typeof params === 'number') {
      normalized = { fileId: safeString(params) };
    } else {
      normalized = shallowCopy(params || {});
    }
    normalized.fileId =
      normalizeFileId(normalized.fileId) ||
      normalizeFileId(session.targetFileId) ||
      session.finalFileId;
    normalized.sourceFileId = session.finalFileId;
    normalized.isAsync = normalized.isAsync !== false;
    normalized.noTransFlag = normalized.noTransFlag === true;
    normalized.isNotCloseDoc = normalized.isNotCloseDoc === true;
    return normalized;
  }

  function postSave(session, params) {
    var requestId;
    var timeout;
    var message;

    if (session.blockedError) {
      return Promise.reject(session.blockedError);
    }
    if (session.destroyed) {
      return Promise.reject(makeError('EDIT_DESTROYED', 'FileZ edit was destroyed'));
    }
    if (!session.ready || !session.iframe || !session.contract) {
      return Promise.reject(makeError('FILE_NOT_OPEN', 'The FileZ document is not open'));
    }
    if (session.savedOnce && !session.dirty && !session.needsSave) {
      return Promise.resolve(true);
    }
    if (session.savePromise) {
      return session.savePromise;
    }

    session.saveSequence += 1;
    requestId = session.id + '-save-' + session.saveSequence;
    timeout = Number(session.options.saveTimeoutMs) || DEFAULT_SAVE_TIMEOUT;
    message = {
      channel: MESSAGE_CHANNEL,
      protocol: MESSAGE_PROTOCOL,
      type: 'SAVE',
      nonce: session.contract.nonce,
      sessionId: session.contract.sessionId,
      requestId: requestId,
      fileId: session.finalFileId,
      targetFileId: params.fileId,
      modified: session.dirty === true || session.needsSave === true,
      params: {
        fileId: params.fileId,
        sourceFileId: params.sourceFileId,
        isAsync: params.isAsync,
        noTransFlag: params.noTransFlag,
        isNotCloseDoc: params.isNotCloseDoc
      }
    };

    session.savePromise = new Promise(function (resolve, reject) {
      var timer = window.setTimeout(function () {
        if (!session.pendingSave || session.pendingSave.requestId !== requestId) {
          return;
        }
        session.pendingSave = null;
        reject(makeError('FILEZ_SAVE_TIMEOUT', 'FileZ save confirmation timed out'));
      }, timeout);

      session.pendingSave = {
        requestId: requestId,
        targetFileId: params.fileId,
        timer: timer,
        resolve: resolve,
        reject: reject
      };
      try {
        session.iframe.contentWindow.postMessage(message, currentOrigin());
        report(session.options, 'filez-edit-save-requested', {
          requestId: requestId,
          targetChanged: params.fileId !== session.finalFileId
        });
      } catch (error) {
        session.pendingSave = null;
        window.clearTimeout(timer);
        reject(makeError('FILEZ_SAVE_POST_FAILED', 'Unable to request FileZ save', error));
      }
    }).then(
      function (result) {
        session.savePromise = null;
        report(session.options, 'filez-edit-save-completed', { success: true });
        return result;
      },
      function (error) {
        session.savePromise = null;
        report(session.options, 'filez-edit-save-completed', {
          success: false,
          errorCode: errorCode(error)
        });
        throw error;
      }
    );
    return session.savePromise;
  }

  function createAdapter(session) {
    var adapter = {
      init: function (params, callback) {
        mergeOwn(session.instance.params, params || {});
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      openFile: function (params, callback) {
        var done = invokeOnce(callback);
        var openParams = shallowCopy(params || {});
        var signaturePreflight =
          isNewDocument(session.instance.params) &&
          resolveEditSurface(session.instance.params) === 'COLLABORATION' &&
          openParams.isHide === true &&
          openParams.isDialog === true &&
          openParams.zwPrint !== true;
        var preflightPromise;

        session.lastOpenParams = openParams;
        // Collaboration OfficeV2 creates a temporary hidden SDK only to ask
        // whether a brand-new body already contains a signature. Creating a
        // second FileZ edit session here would duplicate the blank body and
        // mount into an intentionally empty DOM. A new body cannot contain an
        // A8 signature, so acknowledge this narrow preflight without opening.
        if (signaturePreflight) {
          session.signaturePreflight = true;
          report(session.options, 'filez-edit-signature-preflight', {
            skippedOpen: true,
            newDocument: true
          });
          preflightPromise = Promise.resolve(true);
          preflightPromise.then(
            function (result) {
              done(null, result);
            },
            function (error) {
              done(error, null);
            }
          );
          return preflightPromise;
        }
        addActive(session);
        if (!session.openPromise) {
          session.openPromise = Promise.resolve()
            .then(function () {
              session.openPhase = 'preflight';
              if (
                openParams.isHide === true ||
                openParams.isDialog === true ||
                openParams.zwPrint === true
              ) {
                throw makeError(
                  'UNSUPPORTED_OPEN_VARIANT',
                  'This edit variant must use the native editor'
                );
              }
              if (typeof openParams.openBeforeFun === 'function') {
                openParams.openBeforeFun();
                session.openBeforeInvoked = true;
              }
              if (
                typeof session.options.isModeActive === 'function' &&
                !session.options.isModeActive()
              ) {
                throw makeError('MODE_CHANGED', 'FileZ edit mode is no longer active');
              }
              session.openPhase = 'session-request';
              return requestEditSession(session);
            })
            .then(function (contract) {
              if (
                typeof session.options.isModeActive === 'function' &&
                !session.options.isModeActive()
              ) {
                throw makeError('MODE_CHANGED', 'FileZ edit mode is no longer active');
              }
              session.openPhase = 'body-binding';
              bindResolvedFileId(session, contract);
              session.openPhase = 'wrapper-ready';
              return mountEditor(session, contract);
            })
            .then(function () {
              session.ready = true;
              session.openPhase = 'ready';
              report(session.options, 'filez-edit-ready', {
                ready: true,
                createdNew: !!(session.contract && session.contract.createdNew)
              });
              return true;
            })
            .catch(function (error) {
              session.primaryFailure = describeFailure(
                error,
                'FILEZ_EDIT_OPEN_FAILED',
                session.openPhase || 'unknown'
              );
              report(session.options, 'filez-edit-failed', {
                errorCode: session.primaryFailure.code,
                errorPhase: session.primaryFailure.phase,
                errorMessage: session.primaryFailure.message
              });
              if (session.destroyed) {
                throw error;
              }
              return nativeFallback(session, openParams, error);
            });
        }

        session.openPromise.then(
          function (result) {
            done(null, result);
          },
          function (error) {
            done(error, null);
          }
        );
        return session.openPromise;
      },

      saveFile: function (params, callback) {
        var done = invokeOnce(callback);
        var promise = postSave(session, normalizeSaveParams(session, params));
        promise.then(
          function (result) {
            done(null, result);
          },
          function (error) {
            done(error, null);
          }
        );
        return promise;
      },

      closeFile: function (params, callback) {
        session.destroyed = true;
        teardownEditor(session, 'EDIT_CLOSED', true);
        removeActive(session);
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      destroy: function (params, callback) {
        session.destroyed = true;
        teardownEditor(session, 'EDIT_DESTROYED', true);
        removeActive(session);
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      setOptions: function (params, callback) {
        var incoming = params || {};
        var fileId = normalizeFileId(incoming.fileId);
        if (fileId && fileId !== session.finalFileId) {
          session.targetFileId = fileId;
          session.needsSave = true;
        }
        mergeOwn(session.instance.params, incoming);
        mergeOwn(session.adapter.params, incoming);
        if (session.finalFileId) {
          session.instance.params.fileId = session.finalFileId;
          session.adapter.params.fileId = session.finalFileId;
        }
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      isAvailable: function () {
        return true;
      },
      isClientApp: function () {
        return false;
      },
      isContentLoaded: function () {
        return session.ready === true;
      },
      contentIsModified: function () {
        return session.dirty === true || session.needsSave === true;
      },
      isModified: function (params, callback) {
        var modified = session.dirty === true || session.needsSave === true;
        if (typeof callback === 'function') {
          callback(null, modified);
        }
        return modified;
      },
      isEmpty: function (params, callback) {
        var empty = session.ready !== true;
        if (typeof callback === 'function') {
          callback(null, empty);
        }
        return empty;
      },
      fileExists: function (params, callback) {
        var exists = !!session.finalFileId && session.ready === true;
        if (typeof callback === 'function') {
          callback(null, exists);
        }
        return exists;
      },
      contentLength: function (params, callback) {
        var length = Number(session.contentLength);
        if (!isFinite(length) || length < 0) {
          length = Number(session.instance.params.officeFileRealSize) || 0;
        }
        if (typeof callback === 'function') {
          callback(null, length);
        }
        return length;
      },
      contentLengthAndCreateDate: function (params, callback) {
        var length = Number(session.contentLength);
        var result;
        if (!isFinite(length) || length < 0) {
          length = Number(session.instance.params.officeFileRealSize) || 0;
        }
        result = {
          fileSize: length,
          createDate:
            session.instance.params.createDate ||
            session.instance.params.originalCreateDate ||
            null
        };
        if (typeof callback === 'function') {
          callback(null, result);
        }
        return result;
      },
      supportMultiEditing: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, false);
        }
        return false;
      },
      active: function (params, callback) {
        if (session.host && session.host.style) {
          session.host.style.display = '';
        }
        try {
          if (session.iframe && session.iframe.contentWindow) {
            session.iframe.contentWindow.focus();
          }
        } catch (ignore) {
          // Focus is best effort.
        }
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },
      hide: function (params, callback) {
        if (session.host && session.host.style) {
          session.host.style.display = 'none';
        }
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },
      getContainerAttributes: function (params, callback) {
        var container = session.container;
        var result = {
          ScrollLeft: container ? container.scrollLeft || 0 : 0,
          ScrollTop: container ? container.scrollTop || 0 : 0
        };
        if (typeof callback === 'function') {
          callback(null, result);
        }
        return result;
      },
      setScrollTo: function (params, callback) {
        var container = session.container;
        params = params || {};
        if (container) {
          if (typeof params.left === 'number') {
            container.scrollLeft = params.left;
          }
          if (typeof params.top === 'number') {
            container.scrollTop = params.top;
          }
        }
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },
      getThirdInstance: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, null);
        }
        return null;
      },
      isAllowSignature: function () {
        return false;
      },
      isAllowTransform: function () {
        return false;
      },
      getQpJson: function () {
        return null;
      },
      setQpJson: function () {
        return false;
      },

      print: function (params, callback) {
        return unsupported(callback, 'print');
      },
      download: function (params, callback) {
        return unsupported(callback, 'download');
      },
      preview: function (params, callback) {
        return unsupported(callback, 'preview');
      },
      signature: function (params, callback) {
        return unsupported(callback, 'signature');
      },
      openSignaturePage: function (params, callback) {
        return unsupported(callback, 'openSignaturePage');
      },
      hasProfessionalSign: function (params, callback) {
        return unsupported(callback, 'hasProfessionalSign');
      },
      countSignatures: function (params, callback) {
        if (
          isNewDocument(session.instance.params) &&
          resolveEditSurface(session.instance.params) === 'COLLABORATION'
        ) {
          if (typeof callback === 'function') {
            callback(null, 0);
          }
          return 0;
        }
        return unsupported(callback, 'countSignatures');
      },
      delAnnotations: function (params, callback) {
        return unsupported(callback, 'delAnnotations');
      },
      saveHuaLian: function (params, callback) {
        return unsupported(callback, 'saveHuaLian');
      },
      clearTrail: function (params, callback) {
        return unsupported(callback, 'clearTrail');
      },
      bookmarkHighlight: function (params, callback) {
        return unsupported(callback, 'bookmarkHighlight');
      },
      taohong: function (params, callback) {
        return unsupported(callback, 'taohong');
      },
      transform: function (params, callback) {
        return unsupported(callback, 'transform');
      },
      getBookmarkList: function (params, callback) {
        return unsupported(callback, 'getBookmarkList');
      },
      countBookmarks: function (params, callback) {
        return unsupported(callback, 'countBookmarks');
      },
      delBookmarks: function (params, callback) {
        return unsupported(callback, 'delBookmarks');
      },
      batchSwap: function (params, callback) {
        return unsupported(callback, 'batchSwap');
      },
      swapWithoutHighlight: function (params, callback) {
        return unsupported(callback, 'swapWithoutHighlight');
      },
      batchDeleteBM: function (params, callback) {
        return unsupported(callback, 'batchDeleteBM');
      },
      decryptSeal: function (params, callback) {
        return unsupported(callback, 'decryptSeal');
      },
      analyzing: function (params, callback) {
        return unsupported(callback, 'analyzing');
      },
      modifyContent: function (params, callback) {
        if (!isNewDocument(session.instance.params)) {
          return unsupported(callback, 'modifyContent');
        }
        // In a new collaboration OfficeV2 calls modifyContent instead of
        // openFile on the primary SDK after the signature preflight. Opening
        // the same FileZ session here preserves the public OfficeSDK contract.
        return adapter.openFile({}, callback);
      },
      setContent: function (params, callback) {
        return unsupported(callback, 'setContent');
      },
      insertText: function (params, callback) {
        return unsupported(callback, 'insertText');
      },
      getCurrentSelection: function (params, callback) {
        return unsupported(callback, 'getCurrentSelection');
      },
      setDocFieldContent: function (params, callback) {
        return unsupported(callback, 'setDocFieldContent');
      },
      getSelectionText: function (params, callback) {
        return unsupported(callback, 'getSelectionText');
      },
      getBookmarkContent: function (params, callback) {
        return unsupported(callback, 'getBookmarkContent');
      },
      getDocFieldList: function (params, callback) {
        return unsupported(callback, 'getDocFieldList');
      },
      getDocFieldContent: function (params, callback) {
        return unsupported(callback, 'getDocFieldContent');
      },
      deleteBookmark: function (params, callback) {
        return unsupported(callback, 'deleteBookmark');
      },
      cleanAllContent: function (params, callback) {
        return unsupported(callback, 'cleanAllContent');
      },
      newLine: function (params, callback) {
        return unsupported(callback, 'newLine');
      },
      newLineOnEnd: function (params, callback) {
        return unsupported(callback, 'newLineOnEnd');
      },
      continueWriteWithNewLine: function (params, callback) {
        return unsupported(callback, 'continueWriteWithNewLine');
      },
      getAllContent: function (params, callback) {
        return unsupported(callback, 'getAllContent');
      },
      hasDocField: function (params, callback) {
        return unsupported(callback, 'hasDocField');
      }
    };
    return adapter;
  }

  function FilezEditAdapter(params, sdkUtils, sdkInstance) {
    var bridge = resolveBridge();
    var routeEpoch = Number(params && params.__ruianFilezRouteEpoch);
    var options = {
      record:
        bridge && typeof bridge.record === 'function'
          ? bridge.record
          : null,
      isModeActive: function () {
        if (!bridge || typeof bridge.isModeActive !== 'function') {
          return true;
        }
        return !!bridge.isModeActive(routeEpoch, 'edit');
      }
    };
    var session;
    var adapter;

    if (!sdkInstance || !params) {
      throw makeError(
        'INVALID_ADAPTER_CONTEXT',
        'FileZ edit adapter context is invalid'
      );
    }

    this.params = params;
    this.sdkUtils = sdkUtils;
    this.sdkInstance = sdkInstance;
    session = {
      id:
        safeString(Date.now()) +
        '-' +
        Math.random().toString(16).slice(2),
      instance: sdkInstance,
      adapter: this,
      options: options,
      affairId: safeString(params.__ruianFilezAffairId),
      sourceFileId: normalizeFileId(params.fileId),
      finalFileId: '',
      targetFileId: '',
      initParams: shallowCopy(params),
      openPromise: null,
      fallbackPromise: null,
      savePromise: null,
      pendingSave: null,
      saveSequence: 0,
      lastOpenParams: null,
      requestAbort: null,
      abortController: null,
      readyTimer: null,
      readyResolve: null,
      readyReject: null,
      messageHandler: null,
      contract: null,
      container: null,
      host: null,
      iframe: null,
      previousInlinePosition: '',
      positionChanged: false,
      ready: false,
      dirty: false,
      needsSave: false,
      savedOnce: false,
      blockedError: null,
      blockedBanner: null,
      openPhase: 'created',
      primaryFailure: null,
      nativeFailure: null,
      contentLength:
        typeof params.officeFileRealSize === 'number'
          ? params.officeFileRealSize
          : null,
      destroyed: false,
      fallingBack: false,
      openBeforeInvoked: false
    };
    adapter = createAdapter(session);
    mergeOwn(this, adapter);
    this.__ruianFilezSession = session;

    report(options, 'filez-edit-adapter-created', {
      category: params.category,
      fileType: safeString(params.fileType).toLowerCase(),
      mode: 'EDIT',
      hasAffairId: !!session.affairId,
      hasFileId: !!session.sourceFileId
    });
  }

  function cleanupAll(reason, fallbackToNative) {
    var snapshot = activeSessions.slice();
    var tasks = [];
    snapshot.forEach(function (session) {
      var fallbackTask;
      if (session.destroyed) {
        removeActive(session);
        return;
      }
      if (fallbackToNative) {
        fallbackTask = Promise.resolve();
        if (session.ready && (session.dirty || session.needsSave)) {
          // A provider switch must not discard edits that only exist inside
          // the FileZ iframe. Persist them first; on failure keep this editor
          // mounted so the user can retry instead of silently losing work.
          fallbackTask = postSave(session, normalizeSaveParams(session, {}));
        }
        tasks.push(
          fallbackTask
            .then(function () {
              return nativeFallback(
                session,
                session.lastOpenParams || {},
                reason || 'MODE_OFF'
              );
            })
            .catch(function (error) {
              report(session.options, 'native-edit-fallback-deferred', {
                errorCode: errorCode(error)
              });
              // The FileZ editor intentionally remains mounted when the
              // durable save gate cannot be satisfied.
            })
        );
      } else {
        session.destroyed = true;
        teardownEditor(session, reason || 'EDIT_CANCELLED', true);
        removeActive(session);
      }
    });
    return Promise.all(tasks);
  }

  window[GLOBAL_KEY] = {
    version: VERSION,
    cleanupAll: cleanupAll,
    activeCount: function () {
      return activeSessions.length;
    },
    getLastFailure: function () {
      if (!lastFailure) {
        return null;
      }
      try {
        return JSON.parse(JSON.stringify(lastFailure));
      } catch (ignore) {
        return shallowCopy(lastFailure);
      }
    },
    constants: {
      adapterKey: ADAPTER_KEY,
      messageChannel: MESSAGE_CHANNEL,
      messageProtocol: MESSAGE_PROTOCOL
    }
  };

  if (!window.OfficeSDK || typeof window.OfficeSDK.register !== 'function') {
    throw makeError(
      'OFFICESDK_REGISTER_UNAVAILABLE',
      'OfficeSDK.register is unavailable'
    );
  }
  window.OfficeSDK.register(ADAPTER_KEY, FilezEditAdapter);
  if (
    typeof window.OfficeSDK.getAdapter === 'function' &&
    window.OfficeSDK.getAdapter(ADAPTER_KEY) !== FilezEditAdapter
  ) {
    throw makeError(
      'ADAPTER_KEY_CONFLICT',
      'The FileZ edit adapter key is already registered'
    );
  }
})(window, document);
