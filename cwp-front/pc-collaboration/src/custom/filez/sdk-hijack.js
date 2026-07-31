/**
 * gjx-start：联想 FileZ 文档中台集成 —— OfficeSDK 劫持引擎（客开新增文件）
 * ================================================================
 * 背景：协同正文编辑器（致远 OfficeSDK）在 zwIframe 内部页面里初始化，
 * 该页面源码不在本仓库内，无法像公文模块那样在初始化点加显式分支，
 * 因此从父页面对 zwIframe.contentWindow.OfficeSDK 做运行时代理接管。
 *
 * 接管规则：
 *  - init：目标类型（41-44/doc 家族）→ 已有正文按预览渲染、新建正文先建
 *    空白文档再按编辑渲染，其余类型原样放行给致远原生逻辑；
 *  - 其余生命周期方法（saveFile 等）：仅对"本引擎接管过 init 的实例"
 *    伪造成功返回（FileZ 由中台自行保存，前端只需放行），
 *    未接管的实例（如 PDF/OFD、签章等场景创建的 SDK）不受影响。
 *    —— 旧客开实现按页面级 bodyType 兜底判断，会误伤同页其它 SDK 实例，
 *       此处收窄为实例级标记判断。
 * ================================================================
 */
import globalData from '@/plugins/data';
import { isFileZTargetParams } from './config';
import {
  extractExistingFileId,
  isValidExistingFileId,
  getBodyViewData,
  getBodyCreateData
} from './filez-service';
import { showBodyLoading, hideBodyLoading, renderBodyIframe } from './content-render';

/** window 级标记：该 window 的 OfficeSDK 已被代理 */
const HIJACK_FLAG = '__is_filez_hijacked__';
/** 实例级标记：该 SDK 实例的 init 已被 FileZ 接管 */
const MANAGED_FLAG = '__filez_managed__';
/** 启动级标记：防止热更新或重复入口创建多个轮询器 */
const ENGINE_STARTED_FLAG = '__filez_sdk_hijack_started__';

/** init 判定：params.fileType 优先，兜底页面级 bodyType（与旧客开一致） */
function isFileZInitTarget(params) {
  return isFileZTargetParams(params, globalData && globalData.bodyType);
}

/**
 * 方法级判定（saveFile/closeFile 等）：
 * 实例被接管过（MANAGED_FLAG），或实例参数里显式声明了目标 fileType。
 * 不再用页面级 bodyType 兜底，避免误伤同页其它用途的 SDK 实例。
 */
function isManagedInstance(inst) {
  if (!inst) return false;
  if (inst[MANAGED_FLAG]) return true;
  const fileType = inst.params && inst.params.fileType;
  return !!fileType && isFileZTargetParams({ fileType });
}

/**
 * 被代理后的 init：目标类型走 FileZ，否则原样调用原生 init。
 * 保持旧客开的回调/Promise 双通道返回习惯。
 */
function buildHijackedInit(originalInit) {
  return async function hijackedInit() {
    const args = Array.prototype.slice.call(arguments);
    const params = args[0] || {};
    const callback = args.filter((a) => typeof a === 'function')[0];

    if (isFileZInitTarget(params)) {
      try {
        // 标记实例：后续 saveFile 等生命周期方法据此静默放行
        if (this) this[MANAGED_FLAG] = true;
        // 动画尽早出现（旧实现要等 fileZInit 返回才出动画）
        showBodyLoading();

        const existFileId = extractExistingFileId();
        let filezData;
        if (isValidExistingFileId(existFileId)) {
          // 详情/处理页：加载已有文档。
          // 注意这里固定 state='view'：正文区内嵌一律预览态，
          // "修改正文"的编辑动作由 office-v2-patch 用新窗口接管，
          // 因此不透传 params.mode（EDIT）。
          console.log('[FileZ] 加载已有正文, fileId:', existFileId);
          filezData = await getBodyViewData(existFileId, params, 'view');
        } else {
          // 新建/切换正文类型：创建空白文档并进入编辑态
          const modeStr = String(params.mode || 'EDIT').toLowerCase();
          const mode = modeStr.indexOf('view') > -1 ? 'view' : 'edit';
          console.log('[FileZ] 新建空白正文, mode:', mode);
          filezData = await getBodyCreateData(params, mode);
          // 把新 fileId 反写回原生参数，保证发送/保存链路取到正确 ID
          params.recordId = filezData.fileId;
          params.fileId = filezData.fileId;
          if (this && this.params) {
            this.params.recordId = filezData.fileId;
            this.params.fileId = filezData.fileId;
          }
        }

        renderBodyIframe(filezData.url);

        const mockResult = { success: true, code: 0, msg: 'FileZ loaded successfully' };
        if (callback) callback(null, mockResult);
        return Promise.resolve(mockResult);
      } catch (error) {
        console.error('[FileZ] 正文加载失败:', error);
        hideBodyLoading(true);
        if (callback) callback(error, null);
        return Promise.reject(error);
      }
    }

    return originalInit.apply(this, args);
  };
}

/**
 * 代理 OfficeSDK（类或已实例化对象均可，与旧客开兼容）：
 * 重写 init，并把衍生生命周期方法对"被接管实例"伪造成功。
 */
function createProxySDK(originalSDK) {
  if (!originalSDK || originalSDK[HIJACK_FLAG]) return originalSDK;

  const target = originalSDK.prototype || originalSDK;
  const originalInit = target.init;
  if (typeof originalInit === 'function') {
    target.init = buildHijackedInit(originalInit);
  }

  // FileZ 由中台自行保存与管理生命周期，以下原生调用对被接管实例静默放行
  const mockMethods = [
    'setSize',
    'closeFile',
    'hideLoading',
    'showLoading',
    'setOptions',
    'saveFile',
    'openFile',
    'isContentLoaded',
    'getAutoId'
  ];
  mockMethods.forEach((method) => {
    const originalMethod = target[method];
    target[method] = function () {
      if (isManagedInstance(this)) {
        const args = Array.prototype.slice.call(arguments);
        const callback = args.filter((a) => typeof a === 'function')[0];
        if (method === 'isContentLoaded') return true;
        const mockResult = { success: true, code: 0, msg: 'Mocked ' + method + ' successfully' };
        if (callback) callback(null, mockResult);
        return Promise.resolve(mockResult);
      }
      if (originalMethod) {
        return originalMethod.apply(this, arguments);
      }
      return Promise.resolve(true);
    };
  });

  originalSDK[HIJACK_FLAG] = true;
  return originalSDK;
}

/**
 * 监听指定 window 上的 OfficeSDK：
 * 已存在则立刻代理；并用访问器捕获后续的动态注入（脚本晚于我们执行的场景）。
 */
function observeOfficeSDK(targetWindow) {
  if (!targetWindow || targetWindow[HIJACK_FLAG]) return;
  targetWindow[HIJACK_FLAG] = true;

  let _officeSDK = targetWindow.OfficeSDK;
  if (_officeSDK) targetWindow.OfficeSDK = createProxySDK(_officeSDK);

  try {
    Object.defineProperty(targetWindow, 'OfficeSDK', {
      configurable: true,
      enumerable: true,
      get() {
        return _officeSDK;
      },
      set(newValue) {
        if (newValue && !newValue[HIJACK_FLAG]) {
          console.log('[FileZ] 捕获到 OfficeSDK 动态注入，已代理');
          _officeSDK = createProxySDK(newValue);
        } else {
          _officeSDK = newValue;
        }
      }
    });
  } catch (e) {
    console.warn('[FileZ] defineProperty(OfficeSDK) 失败，仅做即时代理:', e);
  }
}

/**
 * 启动劫持引擎。
 * 为什么用轮询而不用 load 事件：zwIframe 同源导航后 window 全局对象会被
 * 重建（我们设置的访问器/标记随之丢失），而 SDK 脚本在 load 事件之前就可能
 * 完成初始化，事件驱动存在竞态；20ms 轮询每拍只做一次标记位短路检查，
 * 开销可忽略，且天然覆盖 iframe 任意次数的重载/正文类型切换。
 */
export function startSdkHijack() {
  if (window[ENGINE_STARTED_FLAG]) return;
  window[ENGINE_STARTED_FLAG] = true;

  console.log('[FileZ] OfficeSDK 劫持引擎启动');
  observeOfficeSDK(window);

  setInterval(() => {
    try {
      const zwIframe = document.getElementById('zwIframe');
      if (zwIframe && zwIframe.contentWindow) {
        if (!zwIframe.contentWindow[HIJACK_FLAG]) {
          observeOfficeSDK(zwIframe.contentWindow);
          // 兼容 zwIframe 页面里已实例化的小写 officeSDK 对象
          if (zwIframe.contentWindow.officeSDK) {
            createProxySDK(zwIframe.contentWindow.officeSDK);
          }
          console.log('[FileZ] 已代理 zwIframe 内的 OfficeSDK');
        }
      }
    } catch (e) {
      /* 跨域或 iframe 尚未就绪，忽略本拍 */
    }
  }, 20);
}
// gjx-end
