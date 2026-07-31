//gjx-start：联想文档中台 (FileZ) 统一适配器
// src/custom/filez/filez-adapter.js（2026-07-16 由 src/services/ 迁入客开独立目录，内容未变）
// ================================================================
// 联想文档中台 (FileZ) 统一适配器
// 职责：封装所有与 FileZ 后端通信、URL 生成、DOM 注入、编辑器初始化、加载动画的逻辑
// ================================================================

import { contentFrame } from '@/enum';
import { setOfficeEditor } from '@/store/instance';

// ======================== 常量 ========================

/** FileZ 支持的正文类型列表 */
export const FILEZ_TYPES = ['OfficeWord', 'WpsWord', 'OfficeExcel', 'WpsExcel'];

/** 后端代理路径 */
const BACKEND_URL = '/seeyon/ajax.do?method=ajaxAction&managerName=euFileZManager&managerMethod=';

/** 加载动画 CSS 是否已注入 */
let _loadingStylesInjected = false;

/** iframe 加载超时时间（毫秒） */
const IFRAME_LOAD_TIMEOUT = 30000;

/** 加载动画最短显示时长（毫秒），避免一闪而过 */
const MIN_OVERLAY_DURATION = 2000;

/** iframe onload 后额外等待时长（毫秒），覆盖 FileZ SDK 内部初始化 */
const POST_ONLOAD_DELAY = 1500;

/** 点击正文打印后，等待 FileZ SDK 暴露打印能力的最长时间 */
const FILEZ_PRINT_READY_TIMEOUT = 10000;

/** FileZ 打印能力就绪检测间隔 */
const FILEZ_PRINT_READY_INTERVAL = 200;

// ======================== 内部工具 ========================

/**
 * 注入加载动画 CSS（全局执行一次）
 */
function _ensureLoadingStyles() {
  if (_loadingStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = `
    /* ===== FileZ 动漫风格加载动画 ===== */
    .filez-loading-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #f7f8fa;
      z-index: 20; min-height: 300px; overflow: hidden;
      opacity: 1;
    }

    /* 光环脉冲 */
    .filez-loading-ring {
      position: relative; width: 80px; height: 80px; margin-bottom: 28px;
      display: flex; align-items: center; justify-content: center;
    }
    .filez-loading-ring::before {
      content: ''; position: absolute; inset: -6px;
      border-radius: 50%;
      border: 2px solid rgba(120, 100, 240, 0.18);
      animation: filez-ring-pulse 2s ease-in-out infinite;
    }
    @keyframes filez-ring-pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.35); opacity: 0.85; }
    }

    /* 彩色弹跳圆点 */
    .filez-loading-dots { display: flex; gap: 10px; position: relative; z-index: 1; }
    .filez-dot {
      width: 14px; height: 14px; border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      animation: filez-bounce 1.2s ease-in-out infinite;
    }
    .filez-dot:nth-child(1) { background: #ff6b9d; animation-delay: 0s; }
    .filez-dot:nth-child(2) { background: #c084fc; animation-delay: 0.12s; }
    .filez-dot:nth-child(3) { background: #60a5fa; animation-delay: 0.24s; }
    .filez-dot:nth-child(4) { background: #34d399; animation-delay: 0.36s; }
    .filez-dot:nth-child(5) { background: #fbbf24; animation-delay: 0.48s; }

    @keyframes filez-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-22px) scale(1.3); }
      60% { transform: translateY(-22px) scale(1.3); }
    }

    /* 渐变流光主标题 */
    .filez-loading-text {
      font-size: 15px; font-weight: 600; letter-spacing: 1px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea);
      background-size: 400% 100%;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: filez-shimmer 2.5s linear infinite;
    }
    @keyframes filez-shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 400% 50%; }
    }

    /* 副标题 */
    .filez-loading-sub {
      margin-top: 8px; font-size: 12px; color: #b0b0c0; letter-spacing: 0.5px;
    }
  `;
  document.head.appendChild(style);
  _loadingStylesInjected = true;
}

/**
 * 统一的后端调用通道（Bridge 同步通道优先，Ajax 异步兜底）
 * @param {string} managerMethod - 后端方法名
 * @param {Object} params       - 参数对象
 * @param {Object} [options]
 * @param {boolean} [options.parseJson=true] - 是否自动 JSON.parse
 * @returns {Promise<any>}
 */
async function _callBackend(managerMethod, params, options = {}) {
  const { parseJson = true } = options;

  // 通道1: 致远同步 Bridge（如果可用）
  if (typeof window.callBackendMethod === 'function') {
    return window.callBackendMethod('euFileZManager', managerMethod, params);
  }

  // 通道2: 异步 Ajax 兜底
  return new Promise((resolve) => {
    $.ajax({
      url: BACKEND_URL + managerMethod,
      type: 'POST',
      async: true,
      data: { arguments: JSON.stringify([params]) },
      success: (res) => {
        resolve(parseJson && typeof res === 'string' ? JSON.parse(res) : res);
      },
      error: () => resolve(null),
    });
  });
}

/**
 * 从后端响应中提取原始 FileZ SDK URL（兼容对象/JSON字符串两种返回）
 */
function _getRawFileZUrl(response) {
  if (!response) return '';
  if (typeof response === 'string') {
    try { response = JSON.parse(response); } catch (e) { return ''; }
  }
  return response.url || (response.result?.url) || '';
}

function _buildFileZUrl(response) {
  const showUrl = _getRawFileZUrl(response);
  if (!showUrl) {
    console.warn('[FileZAdapter] 接口返回成功，但 url 为空');
    return null;
  }
  return `/seeyon/euFileZ.do?method=fileZsdkEdit&fileZurl=${encodeURIComponent(showUrl)}`;
}

function _findContainer(containerId) {
  if (containerId) {
    const el = document.getElementById(containerId);
    if (el) return el;
  }

  const candidateIds = [
    contentFrame?.content,
    'officeEditorFrame',
    'zwIframe',
    'content-component',
  ];

  for (const id of candidateIds) {
    if (id) {
      const el = document.getElementById(id);
      if (el) return el;
    }
  }

  return document.querySelector('.component-body-container');
}

/**
 * 查找指定正文容器、指定文件的 FileZ 包装页 iframe。
 * data 标记用于新注入的 iframe，src 条件兼容页面上已经加载的旧实例。
 */
function _findFileZFrame(containerId, fileId) {
  // 打印路径传入了明确容器时必须严格查找，不能回退到 PDF/Word 的另一容器。
  const container = containerId
    ? document.getElementById(containerId)
    : _findContainer();
  if (!container) return null;

  const frames = container.querySelectorAll(
    'iframe[data-filez-editor="true"], iframe[src*="euFileZ.do?method=fileZsdkEdit"]'
  );
  if (fileId === undefined || fileId === null || fileId === '') {
    return frames[0] || null;
  }

  const expectedFileId = String(fileId);
  for (const frame of frames) {
    if (frame.dataset.filezFileId === expectedFileId) return frame;
  }
  return null;
}

/**
 * 获取 FileZ 当前文档对象。真正的打印入口位于 ActiveDocument 等对象上，
 * 不能调用包装页 window.print，也不能调用 FileZ app 的兼容占位 print。
 */
function _getFileZPrintTarget(containerId, fileId) {
  const iframe = _findFileZFrame(containerId, fileId);
  if (!iframe || !iframe.contentWindow) return null;

  try {
    const app = iframe.contentWindow.__filezApp;
    if (!app) return null;

    const targetKeys = ['ActiveDocument', 'ActiveWorkbook', 'ActivePresentation'];
    for (const key of targetKeys) {
      try {
        const target = app[key];
        if (target && typeof target.print === 'function') return target;
      } catch (e) {
        // 某一文档类型不支持对应 getter 时继续尝试下一种类型。
      }
    }
  } catch (e) {
    // 包装页尚未完成加载或暂时不可访问时，由上层等待就绪。
  }
  return null;
}

/**
 * 为 loading 的绝对定位建立定位上下文，但保留业务组件已有的定位方式。
 * office-content.vue 依赖多个 absolute 容器重叠后通过 z-index 切换页签，
 * 不能在这里无条件改成 relative。
 */
function _ensurePositionContext(container) {
  if (!container) return;
  const position = window.getComputedStyle
    ? window.getComputedStyle(container).position
    : container.style.position;
  if (!position || position === 'static') {
    container.style.position = 'relative';
  }
}

/**
 * 移除指定容器中的加载动画（带淡出过渡）
 * @param {HTMLElement} container
 * @param {boolean} [instant=false] - 是否立即移除（跳过淡出动画）
 */
function _removeOverlay(container, instant = false) {
  const overlay = container.querySelector('#filez-loading-overlay');
  if (!overlay) return;
  if (instant) {
    overlay.remove();
    return;
  }
  overlay.style.transition = 'opacity 0.5s ease-out';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.remove(), 500);
}

// ======================== 公开 API ========================

/**
 * 判断 bodyType 是否由 FileZ 接管
 * @param {string} bodyType
 * @returns {boolean}
 */
export function isFileZType(bodyType) {
  return FILEZ_TYPES.includes(bodyType);
}

/**
 * 当前正文容器中是否已经存在指定文件的 FileZ iframe。
 * @param {string} [containerId]
 * @param {string} [fileId]
 * @returns {boolean}
 */
export function hasFileZEditor(containerId, fileId) {
  return !!_findFileZFrame(containerId, fileId);
}

/**
 * 调用当前 FileZ 正文的浏览器打印能力。
 * 正常情况下会在用户点击事件中立即发起；仅在正文仍初始化时短暂轮询等待。
 *
 * @param {string} [containerId]
 * @param {string} [fileId]
 * @returns {Promise<boolean>}
 */
export async function printFileZDocument(containerId, fileId) {
  const start = Date.now();
  while (Date.now() - start < FILEZ_PRINT_READY_TIMEOUT) {
    const printTarget = _getFileZPrintTarget(containerId, fileId);
    if (printTarget) {
      try {
        const result = await printTarget.print();
        if (result === false) {
          $.alert('FileZ 未能发起打印，请稍后重试。');
          return false;
        }
        return true;
      } catch (e) {
        console.error('[FileZAdapter] FileZ 打印调用异常:', e);
        $.alert('FileZ 打印调用失败，请稍后重试。');
        return false;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, FILEZ_PRINT_READY_INTERVAL));
  }

  console.warn('[FileZAdapter] 等待 FileZ 打印能力超时');
  $.alert('FileZ 正文尚未加载完成，请稍后重试。');
  return false;
}

/**
 * 获取 FileZ 编辑/预览 URL
 * @param {Object} params
 * @param {string} params.fileId       - 文件 ID
 * @param {string} params.createDate   - 创建日期
 * @param {string} params.fileName     - 文件名（含扩展名）
 * @param {string} params.state        - "edit" | "view"
 * @returns {Promise<string|null>}     - FileZ SDK URL，失败返回 null
 */
export async function getFileZEditorUrl({ fileId, createDate, fileName, state }) {
  try {
    const result = await _callBackend('fileZInit', { fileId, createDate, fileName, state });
    return _buildFileZUrl(result);
  } catch (e) {
    console.error('[FileZAdapter] getFileZEditorUrl 异常:', e);
    return null;
  }
}

/**
 * 创建默认空白文件
 * @param {string} fileId
 * @param {string} fileType  - "doc" | "docx" | "xls" | "xlsx"
 * @param {string} [fileName] - 真实文件名（兼容旧调用，可不传）
 */
export async function createDefaultFile(fileId, fileType = 'doc', fileName) {
  try {
    return await _callBackend(
      'createDefaultFile',
      { fileId, fileType, fileName, category: 4 },
      { parseJson: false }
    );
  } catch (e) {
    console.error('[FileZAdapter] createDefaultFile 异常:', e);
  }
}

/**
 * 检查文件内容是否为空（异步版本，不阻塞 UI）
 * @param {string} fileId
 * @returns {Promise<boolean>} true 表示文件为空
 */
export async function isFileContentEmpty(fileId) {
  try {
    const result = await _callBackend('isFileContentNotEmpty', { fileId });
    return result?.isNull === true;
  } catch (e) {
    console.error('[FileZAdapter] isFileContentEmpty 异常:', e);
    return false;
  }
}

/**
 * 返回 Mock SDK 实例，用于替代致远 OfficeSDK
 */
export function getMockSDK(domId, fileId) {
  return {
    init: async () => true,
    openFile: async () => true,
    saveFile: async () => true,
    print: async () => printFileZDocument(domId, fileId),
    isEmpty: async () => false,
    closeFile: async () => true,
    destroy: () => {},
    isClientApp: () => false,
    setOptions: () => {},
    adapterInstance: true,
    pluginKey: 'FILEZ_MOCK',
    getContainerAttributes: () => ({}),
    getAttribute: () => null,
    setAttribute: () => {},
    setScrollTo: () => {},
    setFocus: () => {},
    Display: true,
    Visible: true,
    hide: () => {},
  };
}

/**
 * 在指定容器中显示 FileZ 加载动画
 * @param {string} [containerId] - 容器 DOM ID，不传则自动查找
 * @param {Object} [textOptions] - 自定义文案（可选，向后兼容）
 * @param {string} [textOptions.title] - 主标题文案
 * @param {string} [textOptions.sub]   - 副标题文案
 */
export function showFileZLoading(containerId, textOptions) {
  _ensureLoadingStyles();
  const container = _findContainer(containerId);
  if (!container) return;

  // 移除已存在的 loading（避免重复）
  _removeOverlay(container);

  const title = (textOptions && textOptions.title) || 'FileZ 文档正在初始化…';
  const sub = (textOptions && textOptions.sub) || '请耐心等待，马上就好 ✨';

  _ensurePositionContext(container);
  const overlay = document.createElement('div');
  overlay.className = 'filez-loading-overlay';
  overlay.id = 'filez-loading-overlay';
  overlay.innerHTML = `
    <div class="filez-loading-ring">
      <div class="filez-loading-dots">
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
      </div>
    </div>
    <div class="filez-loading-text">${title}</div>
    <div class="filez-loading-sub">${sub}</div>
  `;
  container.appendChild(overlay);
}

/**
 * 关闭指定容器中的 FileZ 加载动画
 * @param {string} [containerId] - 容器 DOM ID，不传则自动查找
 */
export function hideFileZLoading(containerId) {
  const container = _findContainer(containerId);
  if (container) _removeOverlay(container);
}

/**
 * 将 FileZ SDK URL 注入到页面容器中（iframe 方式，含加载动画）
 *
 * 流程：显示 loading → 创建 iframe → iframe onload 后关闭 loading
 * 超时 30s 后自动关闭 loading 并提示
 *
 * @param {string} url - FileZ SDK URL
 * @param {string} [containerId] - 指定容器 ID，默认按优先级尝试常见容器
 * @param {string} [fileId] - 当前 iframe 对应的 OA 文件 ID
 * @returns {boolean} 是否成功注入
 */
export function injectFileZToContainer(url, containerId, fileId) {
  const container = _findContainer(containerId);
  if (!container) {
    // 兜底：弹窗打开
    console.warn('[FileZAdapter] 未找到容器，弹窗打开');
    window.open(url, '_blank', 'width=1300,height=800');
    return false;
  }

  _ensureLoadingStyles();

  // 1. 清空容器，显示加载动画
  container.innerHTML = '';
  _ensurePositionContext(container);
  container.style.display = 'block';
  container.style.overflow = 'hidden';
  container.style.padding = '0';
  container.style.margin = '0';
  if (container.offsetHeight < 100) {
    container.style.height = '100%';
    container.style.minHeight = '600px';
  }

  const overlay = document.createElement('div');
  overlay.className = 'filez-loading-overlay';
  overlay.id = 'filez-loading-overlay';
  overlay.innerHTML = `
    <div class="filez-loading-ring">
      <div class="filez-loading-dots">
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
        <div class="filez-dot"></div>
      </div>
    </div>
    <div class="filez-loading-text">FileZ 文档正在初始化…</div>
    <div class="filez-loading-sub">请耐心等待，马上就好 ✨</div>
  `;
  container.appendChild(overlay);

  // 2. 创建 iframe，智能管理加载动画生命周期
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.dataset.filezEditor = 'true';
  if (fileId !== undefined && fileId !== null) {
    iframe.dataset.filezFileId = String(fileId);
  }
  iframe.style.cssText =
    'width:100%;height:100%;min-height:600px;border:none;display:block;margin:0;padding:0;';

  const _overlayStartTime = Date.now();
  let _loadingDone = false;

  /**
   * 完成加载：保证最短显示时长 + 淡出过渡
   * 策略：最短显示 2s（避免闪烁），iframe onload 后额外等 1.5s（覆盖 FileZ SDK 内部初始化）
   */
  const _finishLoading = () => {
    if (_loadingDone) return;
    _loadingDone = true;
    const elapsed = Date.now() - _overlayStartTime;
    const remaining = Math.max(0, MIN_OVERLAY_DURATION - elapsed);
    setTimeout(() => _removeOverlay(container), remaining);
  };

  // iframe 页面加载完成后，额外等待让 FileZ SDK 完成内部初始化
  iframe.onload = () => {
    setTimeout(_finishLoading, POST_ONLOAD_DELAY);
  };

  // 超时兜底：30s 后提示用户，再过 5s 强制关闭
  setTimeout(() => {
    if (!_loadingDone) {
      console.warn('[FileZAdapter] iframe 加载超时（30s），强制关闭动画');
      const textEl = overlay.querySelector('.filez-loading-text');
      if (textEl) {
        textEl.textContent = '加载时间较长，请检查网络或刷新重试';
        textEl.style.webkitTextFillColor = '#e88080';
        textEl.style.animation = 'none';
      }
      setTimeout(() => {
        _loadingDone = true;
        _removeOverlay(container, true); // 超时场景立即移除，不做淡出
      }, 5000);
    }
  }, IFRAME_LOAD_TIMEOUT);

  container.appendChild(iframe);
  return true;
}

/**
 * 【新增】初始化 FileZ 编辑器（嵌入模式）
 * 合并"空文件检查 → 获取 URL → 注入容器（含加载动画）→ 返回 Mock SDK"的完整流程
 *
 * @param {Object} params
 * @param {string} params.fileId      - 文件 ID
 * @param {string} params.createDate  - 创建日期
 * @param {string} params.fileName    - 文件名
 * @param {string} params.state       - "edit" | "view"
 * @param {string} params.domId       - 目标容器 DOM ID
 * @param {string} params.fileType    - 文件类型后缀（用于创建默认文件）
 * @param {boolean} [params.skipEmptyCheck] - 跳过空文件检查
 * @returns {Promise<Object|null>} Mock SDK 实例
 */
export async function initFileZEditor({ fileId, createDate, fileName, state, domId, fileType, skipEmptyCheck }) {
  // 编辑模式下，空文件才创建默认模板
  if (state === 'edit' && !skipEmptyCheck) {
    const isEmpty = await isFileContentEmpty(fileId);
    if (isEmpty) {
      await createDefaultFile(fileId, fileType, fileName);
    }
  }

  // 先显示加载动画，保证尽早出现 loading 状态
  showFileZLoading(domId);

  const url = await getFileZEditorUrl({ fileId, createDate, fileName, state });
  if (url) {
    injectFileZToContainer(url, domId, fileId);
  } else {
    // URL 获取失败，关闭动画
    hideFileZLoading(domId);
    return null;
  }

  const mockInstance = getMockSDK(domId, fileId);
  setOfficeEditor(domId, mockInstance);
  return mockInstance;
}

/**
 * 【新增】弹窗打开 FileZ 编辑器，监听窗口关闭后执行回调
 *
 * @param {string} url     - FileZ SDK URL
 * @param {Function} [onClose] - 窗口关闭后的回调
 * @returns {Window} 子窗口引用
 */
export function openFileZPopupEditor(url, onClose) {
  const childWindow = window.open(url, '_blank',
    'width=1200,height=800,top=50,left=50,resizable=yes,scrollbars=yes');

  if (onClose && childWindow) {
    const timer = setInterval(() => {
      if (childWindow.closed) {
        clearInterval(timer);
        onClose();
      }
    }, 800);
  }

  return childWindow;
}

/**
 * 【新增 2026-07-09】获取正文文件的 FileZ 元数据指纹
 *
 * 原理：fileZInit 返回的 SDK URL 中携带 meta 参数（base64 的 {id, name, modified_at, ...}），
 * 其中 modified_at 取自 OA 侧 V3XFile.updateDate。后端异步任务（如套红回调 saveRed）
 * 覆盖正文文件时会更新 updateDate → meta 指纹变化。
 * 注意不能直接比较整个 URL：URL 末尾的 &ts=/&HMAC= 每次调用都不同。
 *
 * @param {Object} params
 * @param {string} params.fileId     - 文件 ID
 * @param {string} params.createDate - 创建日期
 * @param {string} params.fileName   - 文件名（须每次传同一值，meta.name 参与指纹）
 * @returns {Promise<string|null>} meta 参数值，失败返回 null
 */
export async function getFileZFileFingerprint({ fileId, createDate, fileName }) {
  try {
    const result = await _callBackend('fileZInit', { fileId, createDate, fileName, state: 'view' });
    const raw = _getRawFileZUrl(result);
    const match = raw.match(/[?&]meta=([^&]+)/);
    return match ? match[1] : null;
  } catch (e) {
    console.error('[FileZAdapter] getFileZFileFingerprint 异常:', e);
    return null;
  }
}

/**
 * 【新增 2026-07-09】等待 FileZ 异步任务更新正文文件后，局部刷新正文容器
 *
 * 适用场景：套红等 FileZ 服务端异步任务提交后，任务回调（saveRed）会覆盖
 * 原正文文件（fileId 不变、updateDate 更新）。本方法轮询 meta 指纹，
 * 检测到变化即调用 initFileZEditor 仅重载正文容器 —— 避免整页刷新丢失文单已编辑内容。
 *
 * @param {Object} params
 * @param {string} params.fileId       - 正文文件 ID
 * @param {string} params.createDate   - 创建日期
 * @param {string} params.fileName     - 文件名
 * @param {string} params.fileType     - 文件类型后缀
 * @param {string} params.domId        - 正文容器 DOM ID
 * @param {string} params.baseline     - 任务提交前的指纹基线（getFileZFileFingerprint 获取）
 * @param {number} [params.intervalMs=3000]  - 轮询间隔
 * @param {number} [params.timeoutMs=120000] - 超时时间
 * @param {string} [params.loadingTitle] - 等待期间加载动画主标题
 * @param {string} [params.loadingSub]   - 等待期间加载动画副标题
 * @returns {Promise<boolean>} true=已检测到更新并刷新, false=超时或无基线
 */
export async function waitFileZUpdateAndRefresh({
  fileId, createDate, fileName, fileType, domId,
  baseline,
  intervalMs = 3000,
  timeoutMs = 120000,
  loadingTitle = '文档处理中…',
  loadingSub = '完成后将自动刷新正文 ✨',
}) {
  if (!baseline) {
    console.warn('[FileZAdapter] waitFileZUpdateAndRefresh: 无基线指纹，无法检测更新');
    return false;
  }

  showFileZLoading(domId, { title: loadingTitle, sub: loadingSub });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    const fingerprint = await getFileZFileFingerprint({ fileId, createDate, fileName });
    if (fingerprint && fingerprint !== baseline) {
      // 文件已被任务回调覆盖更新 → 局部刷新正文容器（skipEmptyCheck：文件必然非空）
      await initFileZEditor({
        fileId, createDate, fileName,
        state: 'view',
        domId,
        fileType,
        skipEmptyCheck: true,
      });
      return true;
    }
  }

  hideFileZLoading(domId);
  console.warn('[FileZAdapter] waitFileZUpdateAndRefresh: 等待超时（' + timeoutMs + 'ms）');
  return false;
}

//gjx-end
