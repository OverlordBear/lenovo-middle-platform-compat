/**
 * gjx-start：联想 FileZ 文档中台集成 —— 附件预览拦截（客开新增文件）
 * ================================================================
 * 目标：附件"查看"统一改为 FileZ 预览。
 *
 * 原版两条预览链路最终都汇聚到同一个隐藏 iframe（public/index.html 里的
 * <iframe id="myIframe" name="openFrame">）加载 officeTrans.do?method=view：
 *   1. accessory-item（老版组件）：<a :href="officeTrans..." target="openFrame">
 *      —— 用 document 捕获阶段 click 监听拦截；
 *   2. accessory-item-new（新版组件）：onPreviewOffice() 直接给
 *      $('#myIframe')[0].src 赋值 —— 用元素实例级 src 访问器拦截。
 * 两处都只认 officeTrans.do 且 method=view 的地址，命中则改为
 * FileZ 弹窗预览，未命中原样放行（下载等原生行为不受影响）。
 *
 * 注意：为规避浏览器弹窗拦截，先在点击同步阶段 window.open 空白窗口，
 * 待 fileZInit 异步返回后再定位到预览地址。
 *
 * 另含「FileZ 预览类型」数据层补丁（installCanLookExtension）：
 * 在 api 的 axios 单例上追加响应拦截器，把白名单扩展名附件的 canLook
 * 补为 true（数据尚未进入 store，一处覆盖 baseInfo / 意见附件等来源）。
 * 两个附件组件通过成对标记块补正白名单判断，并把查看按钮统一接到
 * officeTrans 出口，因此 Office、PDF、文本、压缩包和图片都只走 FileZ。
 * ================================================================
 */
import globalMethods from '@/plugins/methods';
import { service } from '@/api/service';
import { POPUP_FEATURES, isFileZPreviewFile } from './config';
import { getAttachmentViewUrl } from './filez-service';

/** 启动级标记：防止热更新或重复入口重复注册事件与响应拦截器 */
const ATTACHMENT_INTERCEPT_STARTED_FLAG = '__filez_attachment_intercept_started__';

/** 是否是"officeTrans 在线查看"地址（附件预览的统一出口） */
function isOfficeTransViewUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.indexOf('officeTrans.do') > -1 && /[?&]method=view(&|$)/.test(url);
}

/** 从 URL 提取查询参数（不用 URLSearchParams，兼容 IE11） */
function getQueryParam(url, name) {
  const match = url.match(new RegExp('[?&]' + name + '=([^&#]*)'));
  if (!match) return '';
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch (e) {
    return match[1];
  }
}

/**
 * 用 FileZ 弹窗预览 officeTrans 地址指向的附件。
 * 参数与旧客开实现一致：fileId=附件 fileUrl、createDate、fileName、state=view。
 */
async function openAttachmentWithFileZ(transUrl) {
  const fileId = getQueryParam(transUrl, 'fileId');
  const createDate = getQueryParam(transUrl, 'createDate');
  const fileName = getQueryParam(transUrl, 'filename');

  // 先同步开窗占位，避免 await 之后 window.open 被浏览器拦截
  const previewWindow = window.open('', '_blank', POPUP_FEATURES);
  try {
    const url = await getAttachmentViewUrl({ fileId, createDate, fileName });
    if (url) {
      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, '_blank', POPUP_FEATURES);
    } else {
      if (previewWindow) previewWindow.close();
      globalMethods.warning({ content: '后台异常' });
    }
  } catch (e) {
    console.error('[FileZ] 附件预览失败:', e);
    if (previewWindow) previewWindow.close();
    globalMethods.warning({ content: '后台异常' });
  }
}

/** 沿 DOM 向上找最近的 <a>（不用 Element.closest，兼容 IE11） */
function findAnchor(node) {
  let cur = node;
  while (cur && cur !== document) {
    if (cur.tagName === 'A') return cur;
    cur = cur.parentNode;
  }
  return null;
}

/** 链路1：拦截 target="openFrame" 的 officeTrans 预览链接（老版附件组件） */
function installClickIntercept() {
  document.addEventListener(
    'click',
    (event) => {
      const anchor = findAnchor(event.target);
      if (!anchor) return;
      if (anchor.getAttribute('target') !== 'openFrame') return;
      const href = anchor.href || anchor.getAttribute('href');
      if (!isOfficeTransViewUrl(href)) return;

      event.preventDefault();
      event.stopPropagation();
      openAttachmentWithFileZ(href);
    },
    true // 捕获阶段，先于组件自身逻辑
  );
}

/** 链路2：拦截 #myIframe 的 src 赋值（新版附件组件 onPreviewOffice） */
function installIframeSrcHook() {
  const iframe = document.getElementById('myIframe');
  if (!iframe) {
    console.warn('[FileZ] 未找到 #myIframe，新版附件组件预览拦截未安装');
    return;
  }
  if (iframe.__filez_src_hooked__) return;

  // 取原生 src 访问器：iframe 实例本身没有 own src 属性，
  // 访问器定义在 HTMLIFrameElement.prototype 上
  let nativeDesc = null;
  try {
    nativeDesc =
      Object.getOwnPropertyDescriptor(window.HTMLIFrameElement.prototype, 'src') ||
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(iframe), 'src');
  } catch (e) {
    nativeDesc = null;
  }
  if (!nativeDesc || !nativeDesc.set) {
    console.warn('[FileZ] 当前浏览器不支持 src 访问器劫持，新版附件组件预览拦截未安装');
    return;
  }

  Object.defineProperty(iframe, 'src', {
    configurable: true,
    enumerable: true,
    get() {
      return nativeDesc.get.call(iframe);
    },
    set(value) {
      if (isOfficeTransViewUrl(value)) {
        openAttachmentWithFileZ(value);
        return; // 不再让隐藏 iframe 去加载 officeTrans 页面
      }
      nativeDesc.set.call(iframe, value);
    }
  });
  iframe.__filez_src_hooked__ = true;
}

/**
 * 深度遍历接口返回数据，把白名单扩展名附件的 canLook 补为 true。
 * 识别特征取"canLook 不为 true 且带非空 fileUrl"的附件对象，其余数据不碰；
 * 打上 __filezExtendedPreview__ 标记便于控制台排查。
 */
function extendCanLookDeep(node, depth) {
  if (!node || typeof node !== 'object' || depth > 8) return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) extendCanLookDeep(node[i], depth + 1);
    return;
  }
  if (
    node.canLook !== true &&
    node.fileUrl !== undefined &&
    node.fileUrl !== null &&
    node.fileUrl !== '' &&
    isFileZPreviewFile(node)
  ) {
    node.canLook = true;
    node.__filezExtendedPreview__ = true;
  }
  for (const key in node) {
    const val = node[key];
    if (val && typeof val === 'object') extendCanLookDeep(val, depth + 1);
  }
}

/**
 * 「扩展预览类型」数据层补丁：在 api 的 axios 单例上追加响应拦截器。
 * 追加的拦截器排在项目原有拦截器之后执行，拿到的已是解包后的业务数据；
 * 运行时 append，不修改 api/service.js 源码。
 */
function installCanLookExtension() {
  service.interceptors.response.use(
    (data) => {
      try {
        extendCanLookDeep(data, 0);
      } catch (e) {
        console.warn('[FileZ] 扩展预览类型处理失败（不影响原数据）:', e);
      }
      return data;
    },
    (error) => Promise.reject(error)
  );
}

/** 启动附件预览拦截（#myIframe 在 index.html 静态存在，必要时等 DOM 就绪） */
export function startAttachmentIntercept() {
  if (window[ATTACHMENT_INTERCEPT_STARTED_FLAG]) return;
  window[ATTACHMENT_INTERCEPT_STARTED_FLAG] = true;

  installClickIntercept();
  installCanLookExtension();
  if (document.getElementById('myIframe')) {
    installIframeSrcHook();
  } else {
    document.addEventListener('DOMContentLoaded', installIframeSrcHook);
  }
}
// gjx-end
