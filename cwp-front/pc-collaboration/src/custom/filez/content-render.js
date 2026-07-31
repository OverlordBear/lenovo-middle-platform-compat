/**
 * gjx-start：联想 FileZ 文档中台集成 —— 正文容器渲染与恢复（客开新增文件）
 * ================================================================
 * 职责：
 * 1. renderBodyIframe(url)  把 FileZ 页面注入正文区（隐藏致远原生 zwIframe）；
 * 2. restoreNativeBody()    对称恢复原生正文显示（隐藏 FileZ iframe）；
 * 3. startContentTypeWatch() 订阅正文类型切换事件，切到非 FileZ 类型时自动恢复。
 *    —— 该订阅取代了旧客开在 contentType.vue 里的内联 DOM 恢复代码，
 *       依赖的是原版源码本身就会发布的 'ContentTypeChanged' 事件，零侵入。
 * 加载动画生命周期与公文模块一致：
 *    show → iframe onload 后再等 1.5s（覆盖 FileZ SDK 内部初始化）→ 淡出；
 *    30s 未加载完成则红字提示并在 5s 后强制关闭。
 * ================================================================
 */
import emitter from '@/utils/emitter';
import { BODY_IFRAME_ID, NATIVE_IFRAME_ID, isFileZBodyType } from './config';
import { showLoading, hideLoading, failLoading } from './filez-loader';

/** iframe onload 后额外等待时长（毫秒），与公文模块一致 */
const POST_ONLOAD_DELAY = 1500;
/** iframe 加载超时时间（毫秒），与公文模块一致 */
const IFRAME_LOAD_TIMEOUT = 30000;
/** 启动级标记：防止热更新或重复入口重复订阅正文类型事件 */
const CONTENT_TYPE_WATCH_STARTED_FLAG = '__filez_content_type_watch_started__';

/** 当前渲染批次的超时定时器（重复渲染时先清掉上一次的） */
let loadTimeoutTimer = null;

/** 正文容器：优先 #zw-wrapper（致远正文外层容器），兜底 body */
function getBodyContainer() {
  return document.getElementById('zw-wrapper') || document.body;
}

/**
 * 提前显示正文加载动画。
 * 供 SDK 劫持层在请求后端换取 URL 之前调用，让动画尽早出现
 * （旧客开实现要等接口返回后才出动画，白屏窗口更长）。
 */
export function showBodyLoading(textOptions) {
  showLoading(getBodyContainer(), textOptions);
}

/** 关闭正文加载动画（异常兜底用） */
export function hideBodyLoading(instant) {
  hideLoading(getBodyContainer(), instant);
}

/**
 * 把 FileZ 页面 URL 渲染进正文区。
 * 做法与旧客开实现一致：隐藏原生 #zwIframe，在容器内维护一个
 * #filez-render-iframe 承载 FileZ；重复调用时复用同一 iframe 仅换 src。
 * @param {string} url FileZ 编辑/预览页地址
 */
export function renderBodyIframe(url) {
  const container = getBodyContainer();

  // 1. 隐藏致远原生正文 iframe（恢复动作见 restoreNativeBody，两处对称）
  const nativeIframe = document.getElementById(NATIVE_IFRAME_ID);
  if (nativeIframe) {
    nativeIframe.style.display = 'none';
  }

  // 2. 显示加载动画（若劫持层已提前显示则复用，最短显示时长从首次显示起算）
  showLoading(container);

  // 3. 准备 / 复用 FileZ 承载 iframe
  let filezIframe = document.getElementById(BODY_IFRAME_ID);
  if (!filezIframe) {
    filezIframe = document.createElement('iframe');
    filezIframe.id = BODY_IFRAME_ID;
    filezIframe.style.cssText =
      'width:100%;height:100%;min-height:600px;border:none;display:block;background-color:#fff;';
    container.appendChild(filezIframe);
  }
  filezIframe.style.display = 'block';

  // 4. 加载动画生命周期：onload 后延迟 1.5s 淡出；30s 超时红字提示
  if (loadTimeoutTimer) {
    clearTimeout(loadTimeoutTimer);
    loadTimeoutTimer = null;
  }
  let finished = false;
  filezIframe.onload = () => {
    if (finished) return;
    finished = true;
    if (loadTimeoutTimer) {
      clearTimeout(loadTimeoutTimer);
      loadTimeoutTimer = null;
    }
    setTimeout(() => hideLoading(container), POST_ONLOAD_DELAY);
  };
  loadTimeoutTimer = setTimeout(() => {
    if (finished) return;
    finished = true;
    console.warn('[FileZ] 正文 iframe 加载超时（' + IFRAME_LOAD_TIMEOUT + 'ms）');
    failLoading(container);
  }, IFRAME_LOAD_TIMEOUT);

  // 5. 加载真实文档
  filezIframe.src = url;
}

/**
 * 恢复致远原生正文显示（与 renderBodyIframe 完全对称）：
 * 隐藏 FileZ iframe、清掉残留动画、恢复 #zwIframe。
 * 触发场景：正文类型从 Word/Excel 切回 HTML/表单/PDF/OFD 等非 FileZ 类型。
 */
export function restoreNativeBody() {
  const filezIframe = document.getElementById(BODY_IFRAME_ID);
  if (filezIframe) {
    filezIframe.style.display = 'none';
  }
  if (loadTimeoutTimer) {
    clearTimeout(loadTimeoutTimer);
    loadTimeoutTimer = null;
  }
  hideBodyLoading(true);
  const nativeIframe = document.getElementById(NATIVE_IFRAME_ID);
  if (nativeIframe) {
    nativeIframe.style.display = 'block';
  }
}

/**
 * 订阅正文类型切换事件（原版 contentType.vue 在切换回调里发布），
 * 切到非 FileZ 类型（HTML/表单/PDF/OFD）时恢复原生正文。
 * 说明：旧客开只处理了"切回 HTML(10)"，切到 PDF/OFD 会残留 FileZ iframe，
 * 这里统一按"非 41-44 即恢复"处理，行为是旧逻辑的安全超集。
 */
export function startContentTypeWatch() {
  if (window[CONTENT_TYPE_WATCH_STARTED_FLAG]) return;
  window[CONTENT_TYPE_WATCH_STARTED_FLAG] = true;

  emitter.subscribe('ContentTypeChanged', (val) => {
    if (!isFileZBodyType(val)) {
      restoreNativeBody();
    }
  });
}
// gjx-end
