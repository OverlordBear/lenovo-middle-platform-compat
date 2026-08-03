(function (window, document) {
  'use strict';

  var VERSION = '0.6.1';
  var GLOBAL_KEY = '__RUIAN_FILEZ_VIEWER_060__';
  var BRIDGE_KEY = '__RUIAN_FILEZ_FACADE_BRIDGE_060__';
  var ADAPTER_KEY = 'RUIAN_FILEZ_VIEW';
  var READY_CHANNEL = 'ruian-filez-view';
  var READY_PROTOCOL = 'postMessage-v1';
  // The first verified A8 session creation took 20.557 seconds. Keep enough
  // headroom for a cold cache while the server-side stage timings identify
  // the remaining latency.
  var DEFAULT_REQUEST_TIMEOUT = 45000;
  var DEFAULT_READY_TIMEOUT = 60000;
  var activeSessions = [];

  if (window[GLOBAL_KEY] && window[GLOBAL_KEY].version === VERSION) {
    return;
  }

  function safeString(value) {
    return value === undefined || value === null ? '' : String(value);
  }

  function makeError(code, message, cause) {
    var error = new Error(message || code);
    error.code = code;
    if (cause !== undefined) {
      error.cause = cause;
    }
    return error;
  }

  function errorCode(error) {
    return safeString(error && error.code) || 'FILEZ_VIEW_FAILED';
  }

  function report(options, type, detail) {
    var bridge;
    try {
      if (options && typeof options.record === 'function') {
        options.record(type, detail || {});
        return;
      }
      bridge = window[BRIDGE_KEY];
      if (bridge && typeof bridge.record === 'function') {
        bridge.record(type, detail || {});
      }
    } catch (ignore) {
      // Diagnostics must never change the editor result.
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

  function addActive(session) {
    activeSessions.push(session);
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
      // Fall through to the current A8 context path.
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
      /^[0-9]+(?:\.[0-9]+)?$/.test(value.trim())
    ) {
      numeric = Number(value.trim());
    }

    if (numeric !== undefined) {
      if (!isFinite(numeric) || numeric <= 0) {
        return NaN;
      }
      // Accept both Unix seconds and JavaScript/Java epoch milliseconds.
      return numeric < 100000000000 ? numeric * 1000 : numeric;
    }

    parsed = Date.parse(value);
    return parsed;
  }

  function validateViewContract(raw, session) {
    var response;
    var data;
    var viewUrl;
    var webRootUrl;
    var expiresAt;

    try {
      response = parseJsonResponse(raw);
    } catch (error) {
      throw makeError('INVALID_RESPONSE', 'FileZ response is not valid JSON', error);
    }

    if (
      response &&
      Object.prototype.hasOwnProperty.call(response, 'result')
    ) {
      try {
        response = parseJsonResponse(response.result);
      } catch (error) {
        throw makeError(
          'INVALID_RESPONSE',
          'FileZ response result is not valid JSON',
          error
        );
      }
    }

    if (!response || response.success !== true || response.code !== 'OK') {
      throw makeError(
        safeString(response && response.code) || 'VIEW_SESSION_REJECTED',
        'FileZ view session was rejected'
      );
    }

    data = response.data;
    if (
      !data ||
      !data.viewUrl ||
      !data.sessionId ||
      data.expiresAt === undefined ||
      data.expiresAt === null ||
      data.expiresAt === '' ||
      data.readyProtocol !== READY_PROTOCOL ||
      !data.nonce
    ) {
      throw makeError('INVALID_RESPONSE', 'FileZ view session is incomplete');
    }

    try {
      viewUrl = new window.URL(data.viewUrl, window.location.href);
      webRootUrl = new window.URL(normalizedWebRoot(session.instance.params));
    } catch (error) {
      throw makeError('INVALID_VIEW_URL', 'FileZ view URL is invalid', error);
    }

    if (
      viewUrl.origin !== currentOrigin() ||
      (
        viewUrl.pathname !== webRootUrl.pathname &&
        viewUrl.pathname.indexOf(webRootUrl.pathname.replace(/\/+$/, '') + '/') !== 0
      )
    ) {
      throw makeError('UNTRUSTED_VIEW_URL', 'FileZ view URL must be inside A8');
    }

    expiresAt = parseExpiresAt(data.expiresAt);
    if (!isFinite(expiresAt) || expiresAt <= Date.now()) {
      throw makeError('VIEW_SESSION_EXPIRED', 'FileZ view session is expired');
    }

    return {
      viewUrl: viewUrl.href,
      sessionId: safeString(data.sessionId),
      expiresAt: data.expiresAt,
      readyProtocol: data.readyProtocol,
      nonce: safeString(data.nonce)
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
      // A frame boundary must not break the native fallback path.
    }

    try {
      if (window.parent && window.parent !== window) {
        candidates.push(window.parent);
      }
    } catch (ignore) {
      // Cross-origin parents are intentionally ignored.
    }

    try {
      if (window.top && window.top !== window) {
        candidates.push(window.top);
      }
    } catch (ignore) {
      // Cross-origin top windows are intentionally ignored.
    }

    for (index = 0; index < candidates.length; index += 1) {
      try {
        if (candidates[index] && candidates[index].CsrfGuard) {
          return candidates[index].CsrfGuard;
        }
      } catch (ignore) {
        // Continue looking in the remaining same-origin windows.
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
      // The request will fail closed at A8 if its CSRF guard rejects it.
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

  function requestViewSession(session) {
    var endpoint =
      normalizedWebRoot(session.instance.params) +
      '/ajax.do?method=ajaxAction' +
      '&managerName=ruianFileZViewManager' +
      '&managerMethod=createViewSession';
    var payload = {
      affairId: session.affairId,
      fileId: safeString(session.instance.params.fileId),
      fileType: safeString(session.instance.params.fileType).toLowerCase().replace(/^\./, ''),
      category: 4,
      mode: 'view'
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

    if (
      window.$ &&
      typeof window.$.ajax === 'function'
    ) {
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
          reject(makeError('VIEW_SESSION_TIMEOUT', 'FileZ view session timed out'));
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
            beforeSend: function (request) {
              applyCsrfToXhr(request);
            },
            success: function (raw) {
              try {
                finish(resolve, validateViewContract(raw, session));
              } catch (error) {
                finish(reject, error);
              }
            },
            error: function (xhr, status, error) {
              finish(
                reject,
                status === 'timeout'
                  ? makeError(
                      'VIEW_SESSION_TIMEOUT',
                      'FileZ view session timed out',
                      error
                    )
                  : makeError(
                      'VIEW_SESSION_NETWORK_ERROR',
                      'FileZ request failed',
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
            makeError(
              'VIEW_SESSION_NETWORK_ERROR',
              'FileZ request failed',
              error
            )
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
        reject(makeError('VIEW_SESSION_TIMEOUT', 'FileZ view session timed out'));
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
              'VIEW_SESSION_HTTP_ERROR',
              'FileZ view session HTTP request failed'
            );
          }
          if (typeof response.text !== 'function') {
            throw makeError('INVALID_RESPONSE', 'FileZ response has no body');
          }
          return response.text();
        })
        .then(function (text) {
          finish(resolve, validateViewContract(text, session));
        })
        .catch(function (error) {
          finish(
            reject,
            error && error.code
              ? error
              : makeError('VIEW_SESSION_NETWORK_ERROR', 'FileZ request failed', error)
          );
        });
    });
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
    if (session.messageHandler) {
      window.removeEventListener('message', session.messageHandler, false);
      session.messageHandler = null;
    }
    if (session.iframe) {
      session.iframe.onerror = null;
    }
  }

  function rejectReadyWait(session, error) {
    var reject = session.readyReject;
    session.readyReject = null;
    cleanupReadyWait(session);
    if (reject) {
      reject(error);
    }
  }

  function teardownView(session, reason, rejectPending) {
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

    if (rejectPending !== false) {
      rejectReadyWait(
        session,
        makeError(reason || 'VIEW_CANCELLED', 'FileZ view was cancelled')
      );
    } else {
      cleanupReadyWait(session);
      session.readyReject = null;
    }

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
    session.positionChanged = false;
    session.ready = false;
  }

  function mountView(session, contract) {
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
    host.id = 'ruian-filez-view-host-' + session.id;
    host.setAttribute('data-ruian-filez-view', 'true');
    host.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;' +
      'z-index:2147483000;background:#fff;overflow:hidden;';

    loading = document.createElement('div');
    loading.setAttribute('data-ruian-filez-loading', 'true');
    loading.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;display:flex;' +
      'align-items:center;justify-content:center;background:#f7f8fa;' +
      'color:#4b5563;font:14px/1.5 Arial,sans-serif;';
    loading.textContent = 'FileZ 正文正在安全加载…';

    iframe = document.createElement('iframe');
    iframe.setAttribute('title', 'FileZ 公文正文只读预览');
    iframe.setAttribute('allow', 'fullscreen *');
    iframe.setAttribute('data-ruian-filez-frame', 'true');
    iframe.style.cssText =
      'width:100%;height:100%;border:0;margin:0;padding:0;display:block;' +
      'visibility:hidden;background:#fff;';

    session.container = container;
    session.host = host;
    session.iframe = iframe;
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
        session.readyReject = null;
        cleanupReadyWait(session);
        if (error) {
          reject(error);
          return;
        }
        iframe.style.visibility = 'visible';
        removeNode(loading);
        resolve(true);
      }

      session.readyReject = function (error) {
        finish(error || makeError('VIEW_CANCELLED', 'FileZ view was cancelled'));
      };

      session.messageHandler = function (event) {
        var data = event && event.data;
        var type;

        if (
          !event ||
          event.origin !== currentOrigin() ||
          event.source !== iframe.contentWindow ||
          !data ||
          typeof data !== 'object' ||
          data.channel !== READY_CHANNEL ||
          data.protocol !== READY_PROTOCOL ||
          safeString(data.nonce) !== contract.nonce ||
          safeString(data.sessionId) !== contract.sessionId
        ) {
          return;
        }

        type = safeString(data.type).toUpperCase();
        if (type === 'READY') {
          finish(null);
        } else if (type === 'FAILED') {
          finish(
            makeError(
              safeString(data.code) || 'FILEZ_WRAPPER_FAILED',
              'FileZ wrapper reported a failure'
            )
          );
        }
      };

      window.addEventListener('message', session.messageHandler, false);
      iframe.onerror = function () {
        finish(makeError('VIEW_IFRAME_ERROR', 'FileZ wrapper failed to load'));
      };
      session.readyTimer = window.setTimeout(function () {
        finish(makeError('VIEW_READY_TIMEOUT', 'FileZ wrapper readiness timed out'));
      }, readyTimeout);

      iframe.src = contract.viewUrl;
    });
  }

  function renderFinalFailure(session, error) {
    var domId = safeString(session.instance.params.domId);
    var container = document.getElementById(domId);
    var host;
    var title;
    var detail;
    var computedPosition = '';

    if (!container || !container.appendChild) {
      return;
    }

    teardownView(session, 'FINAL_FAILURE', false);
    host = document.createElement('div');
    host.id = 'ruian-filez-view-host-' + session.id;
    host.setAttribute('data-ruian-filez-error', 'true');
    host.style.cssText =
      'position:absolute;left:0;top:0;right:0;bottom:0;' +
      'z-index:2147483000;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;background:#fff7ed;' +
      'color:#7c2d12;font:14px/1.6 Arial,sans-serif;text-align:center;' +
      'padding:24px;box-sizing:border-box;';

    title = document.createElement('strong');
    title.textContent = 'FileZ 正文加载失败';
    title.style.cssText = 'font-size:16px;margin-bottom:8px;';
    detail = document.createElement('span');
    detail.textContent =
      '错误码：' +
      errorCode(error) +
      '。FileZ 与致远原生查看均未能打开该正文。';
    host.appendChild(title);
    host.appendChild(detail);

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

    if (session.fallbackPromise) {
      return session.fallbackPromise;
    }

    session.fallingBack = true;
    // Reject an in-flight READY waiter so the public open promise cannot hang
    // when the top-level coordinator changes mode while FileZ is loading.
    teardownView(session, 'NATIVE_FALLBACK', true);
    session.instance.__ruianFilezBypass = true;
    session.instance.params.__ruianFilezBypass = true;
    fallbackInitParams = shallowCopy(session.instance.params);
    fallbackInitParams.__ruianFilezBypass = true;
    fallbackOpenParams = shallowCopy(openParams || {});
    if (session.openBeforeInvoked) {
      delete fallbackOpenParams.openBeforeFun;
    }

    report(session.options, 'native-fallback-started', {
      reason: safeString(reason) || 'FILEZ_VIEW_FAILED'
    });

    session.fallbackPromise = Promise.resolve()
      .then(function () {
        return session.instance.init(fallbackInitParams);
      })
      .then(function () {
        return session.instance.openFile(fallbackOpenParams);
      })
      .then(function (result) {
        report(session.options, 'native-fallback-completed', {
          success: true
        });
        return result;
      })
      .catch(function (error) {
        report(session.options, 'native-fallback-completed', {
          success: false,
          errorCode: errorCode(error)
        });
        renderFinalFailure(session, error);
        throw error;
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
      'FILEZ_VIEW_ONLY',
      'FileZ view mode does not support ' + operation
    );
    if (typeof callback === 'function') {
      callback(error);
    }
    return false;
  }

  function createAdapter(session) {
    var adapter = {
      init: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, true);
        }
      },

      openFile: function (params, callback) {
        var done = invokeOnce(callback);
        var openParams = shallowCopy(params || {});

        session.lastOpenParams = openParams;
        if (!session.openPromise) {
          session.openPromise = Promise.resolve()
            .then(function () {
              if (
                openParams.isHide === true ||
                openParams.isDialog === true ||
                openParams.zwPrint === true
              ) {
                throw makeError(
                  'UNSUPPORTED_OPEN_VARIANT',
                  'This open variant must use the native editor'
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
                throw makeError('MODE_CHANGED', 'FileZ view mode is no longer active');
              }
              return requestViewSession(session);
            })
            .then(function (contract) {
              if (
                typeof session.options.isModeActive === 'function' &&
                !session.options.isModeActive()
              ) {
                throw makeError('MODE_CHANGED', 'FileZ view mode is no longer active');
              }
              return mountView(session, contract);
            })
            .then(function () {
              session.ready = true;
              report(session.options, 'filez-view-ready', {
                ready: true
              });
              return true;
            })
            .catch(function (error) {
              report(session.options, 'filez-view-failed', {
                errorCode: errorCode(error)
              });
              if (session.destroyed) {
                throw error;
              }
              return nativeFallback(
                session,
                openParams,
                errorCode(error)
              );
            });
        }

        session.openPromise.then(
          function (result) {
            done(null, result);
          },
          function (error) {
            done(error);
          }
        );
        return session.openPromise;
      },

      destroy: function (params, callback) {
        session.destroyed = true;
        teardownView(session, 'VIEW_DESTROYED', true);
        removeActive(session);
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      closeFile: function (params, callback) {
        session.destroyed = true;
        teardownView(session, 'VIEW_CLOSED', true);
        removeActive(session);
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      isClientApp: function () {
        return false;
      },

      isAvailable: function () {
        return true;
      },

      isContentLoaded: function () {
        return session.ready === true;
      },

      isModified: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, false);
        }
        return false;
      },

      contentIsModified: function () {
        return false;
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

      fileExists: function (params, callback) {
        var exists = session.ready === true;
        if (typeof callback === 'function') {
          callback(null, exists);
        }
        return exists;
      },

      supportMultiEditing: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, false);
        }
        return false;
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

      setOptions: function (params, callback) {
        mergeOwn(session.instance.params, params || {});
        if (typeof callback === 'function') {
          callback(null, true);
        }
        return true;
      },

      saveFile: function (params, callback) {
        return unsupported(callback, 'saveFile');
      },
      isEmpty: function (params, callback) {
        if (typeof callback === 'function') {
          callback(null, false);
        }
        return false;
      },
      print: function (params, callback) {
        return unsupported(callback, 'print');
      },
      download: function (params, callback) {
        return unsupported(callback, 'download');
      },
      signature: function (params, callback) {
        return unsupported(callback, 'signature');
      },
      openSignaturePage: function (params, callback) {
        return unsupported(callback, 'openSignaturePage');
      },
      countBookmarks: function (params, callback) {
        return unsupported(callback, 'countBookmarks');
      },
      delBookmarks: function (params, callback) {
        return unsupported(callback, 'delBookmarks');
      },
      clearTrail: function (params, callback) {
        return unsupported(callback, 'clearTrail');
      },
      taohong: function (params, callback) {
        return unsupported(callback, 'taohong');
      },
      transform: function (params, callback) {
        return unsupported(callback, 'transform');
      },
      setContent: function (params, callback) {
        return unsupported(callback, 'setContent');
      }
    };

    return adapter;
  }

  function FilezOfficeAdapter(params, sdkUtils, sdkInstance) {
    var bridge = window[BRIDGE_KEY];
    var routeEpoch = Number(params && params.__ruianFilezRouteEpoch);
    var options = {
      record:
        bridge && typeof bridge.record === 'function'
          ? bridge.record
          : null,
      isModeActive: function () {
        return !!(
          bridge &&
          typeof bridge.isModeActive === 'function' &&
          bridge.isModeActive(routeEpoch)
        );
      }
    };
    var session;
    var adapter;

    if (!sdkInstance || !params) {
      throw makeError(
        'INVALID_ADAPTER_CONTEXT',
        'FileZ adapter context is invalid'
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
      affairId: safeString(params.__ruianFilezAffairId),
      initParams: shallowCopy(params),
      adapter: this,
      options: options,
      openPromise: null,
      fallbackPromise: null,
      lastOpenParams: null,
      requestAbort: null,
      abortController: null,
      readyTimer: null,
      readyReject: null,
      messageHandler: null,
      container: null,
      host: null,
      iframe: null,
      previousInlinePosition: '',
      positionChanged: false,
      ready: false,
      destroyed: false,
      fallingBack: false,
      openBeforeInvoked: false
    };
    adapter = createAdapter(session);
    mergeOwn(this, adapter);
    this.__ruianFilezSession = session;
    addActive(session);

    report(options, 'filez-view-adapter-created', {
      category: 4,
      fileType: safeString(params.fileType).toLowerCase(),
      mode: 'VIEW',
      hasAffairId: !!session.affairId,
      hasFileId: !!params.fileId
    });
  }

  function cleanupAll(reason, fallbackToNative) {
    var snapshot = activeSessions.slice();
    var tasks = [];

    snapshot.forEach(function (session) {
      if (session.destroyed) {
        removeActive(session);
        return;
      }
      if (fallbackToNative) {
        tasks.push(
          nativeFallback(
            session,
            session.lastOpenParams || {},
            reason || 'MODE_OFF'
          ).catch(function () {
            // The native error remains observable to an in-flight open call.
          })
        );
      } else {
        session.destroyed = true;
        teardownView(session, reason || 'VIEW_CANCELLED', true);
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
    constants: {
      adapterKey: ADAPTER_KEY,
      readyChannel: READY_CHANNEL,
      readyProtocol: READY_PROTOCOL
    }
  };

  if (
    !window.OfficeSDK ||
    typeof window.OfficeSDK.register !== 'function'
  ) {
    throw makeError(
      'OFFICESDK_REGISTER_UNAVAILABLE',
      'OfficeSDK.register is unavailable'
    );
  }
  window.OfficeSDK.register(ADAPTER_KEY, FilezOfficeAdapter);
  if (
    typeof window.OfficeSDK.getAdapter === 'function' &&
    window.OfficeSDK.getAdapter(ADAPTER_KEY) !== FilezOfficeAdapter
  ) {
    throw makeError(
      'ADAPTER_KEY_CONFLICT',
      'The FileZ OfficeSDK adapter key is already registered'
    );
  }
})(window, document);
