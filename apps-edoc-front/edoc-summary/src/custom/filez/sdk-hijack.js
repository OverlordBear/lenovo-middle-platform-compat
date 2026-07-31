/**
 * gjx-start：联想 FileZ 文档中台集成 —— window.OfficeSDK 类劫持（客开新增文件）
 * ================================================================
 * 背景：公文正文编辑器在主窗口初始化（utils/init-office-sdk.js 的 loadJs()
 * 把致远 OfficeSDK 挂到 window 上，components/content/office-content.js 再
 * `new window.OfficeSDK(officeParams)` 创建实例）。用访问器陷阱在 SDK 脚本
 * 挂载的一瞬间把类包一层：
 *   - 正文类型为 FileZ 目标（OfficeWord/WpsWord/OfficeExcel/WpsExcel）时，
 *     构造函数直接返回一个「FileZ 实例」——init 记参、openFile 注入 FileZ
 *     iframe（isHide 时只登记不出 UI）、saveFile/isEmpty 等静默放行、
 *     countBookmarks 恒 0（使 checkBookMarks 套红书签检查自然短路）；
 *   - 其余类型（Pdf/Ofd/gd 等）原样 new 致远原生 SDK，行为不变。
 *
 * 由于原版 _initOfficeEditor 会把构造出来的实例 setOfficeEditor 登记进
 * store/instance，后续保存/发送/书签检查读到的就是这个 FileZ 实例——
 * save-content / save-draft / send / content-utils 等源文件因此无需任何改动。
 * 与协同模块的差别：这里 SDK 在主窗口、时机确定，不需要轮询。
 * ================================================================
 */
import state from '@/store/state';
import { contentFrame } from '@/enum';
import {
  isFileZType,
  hasFileZEditor,
  isFileContentEmpty,
  createDefaultFile,
  getFileZEditorUrl,
  injectFileZToContainer,
  printFileZDocument,
  showFileZLoading,
  hideFileZLoading
} from './filez-adapter';

const WRAPPED_FLAG = '__filez_wrapped__';

/** 当前页面正文是否应由 FileZ 接管（构造时机 state.edocContent 已就绪） */
function shouldFileZTakeOver() {
  return isFileZType(state.edocContent && state.edocContent.bodyType);
}

/** 新建公文时，标题的实时值只存在于文单 iframe 中，尚未同步到 summaryInfo。 */
function getLiveFormSubject() {
  try {
    const formFrame = window.frames && window.frames['govDocZwIframe'];
    if (!formFrame || !formFrame.document) return '';
    const subject = $(':input[mappingField=subject]', formFrame.document).val();
    return typeof subject === 'string' ? subject.trim() : '';
  } catch (e) {
    console.warn('[FileZ] 读取文单标题失败，使用备用文件名', e);
    return '';
  }
}

/**
 * 解析 FileZ 渲染所需的文件信息。
 * 取值优先级沿用旧客开 _handleFileZEditor 的口径：
 * fileId：SDK 参数 > edocContent.fileId > edocContent.content；
 * 编辑态：viewMode=edit 或新建公文页（method=newGovdoc）。
 */
function resolveFileInfo(officeParams, initParams) {
  const edocContent = state.edocContent || {};
  const queryParam = state.queryParam || {};

  let fileId = (officeParams && officeParams.fileId) || edocContent.fileId || edocContent.content;
  if (!fileId || String(fileId).length < 5) fileId = edocContent.content;

  const paramMode = (officeParams && officeParams.viewMode) || '';
  const isEdit = paramMode === 'edit' || queryParam.method === 'newGovdoc';

  const fileType =
    (officeParams && officeParams.fileType) || edocContent.fileType || 'doc';
  const liveFormSubject =
    queryParam.method === 'newGovdoc' ? getLiveFormSubject() : '';
  let fileName =
    liveFormSubject ||
    (officeParams && officeParams.fileName) ||
    edocContent.title ||
    (state.summaryInfo && state.summaryInfo.subject) ||
    '公文正文';
  if (fileName.indexOf('.') < 0) fileName += '.' + fileType;

  return {
    fileId,
    fileType,
    fileName,
    state: isEdit ? 'edit' : 'view',
    createDate: edocContent.createDate || new Date().format('yyyy-MM-dd'),
    domId: (initParams && initParams.domId) || contentFrame.content
  };
}

/**
 * 构造 FileZ 实例：实现原版调用链（init → openFile →（保存期）isEmpty/
 * saveFile/countBookmarks…）所需的全部方法。带 params 属性，保证
 * checkBookMarks 等原版代码读 officeEditor.params.* 不报错。
 */
function createFileZInstance(officeParams) {
  const instance = {
    params: officeParams || {},
    adapterInstance: true,
    pluginKey: 'FILEZ_MOCK',
    __filez_managed__: true,
    _initParams: null,

    async init(initParams) {
      this._initParams = initParams || {};
      return true;
    },

    async openFile(opts) {
      const options = opts || {};
      // 隐藏打开（openHideContent / 保存兜底场景）：只登记实例，不出 UI
      if (options.isHide) return true;

      const info = resolveFileInfo(this.params, this._initParams);
      if (!info.fileId) {
        console.warn('[FileZ] openFile 未取到 fileId，跳过渲染');
        return true;
      }

      // 原生正文打印会临时 new OfficeSDK 并以 zwPrint=true 再次 openFile。
      // 当前 FileZ 正文已加载时直接复用，避免打印前清空、刷新下方正文容器。
      if (options.zwPrint && hasFileZEditor(info.domId, info.fileId)) {
        return true;
      }

      try {
        showFileZLoading(info.domId);
        // 编辑态且文件为空时先创建默认空白文档（全新新建正文场景）
        if (info.state === 'edit' && (await isFileContentEmpty(info.fileId))) {
          await createDefaultFile(info.fileId, info.fileType, info.fileName);
        }
        const url = await getFileZEditorUrl({
          fileId: info.fileId,
          createDate: info.createDate,
          fileName: info.fileName,
          state: info.state
        });
        if (url) {
          injectFileZToContainer(url, info.domId, info.fileId);
        } else {
          hideFileZLoading(info.domId);
          console.warn('[FileZ] 未获取到编辑器 URL');
        }
      } catch (e) {
        hideFileZLoading(info.domId);
        console.error('[FileZ] openFile 渲染失败:', e);
      }
      return true;
    },

    // ---- 以下为原版保存/发送/切换流程会触碰的生命周期，全部静默放行 ----
    async isEmpty() {
      return false; // FileZ 由中台自行管理内容，前端不拦空正文
    },
    async saveFile() {
      return true; // FileZ 由中台自行保存
    },
    async print() {
      const info = resolveFileInfo(this.params, this._initParams);
      return printFileZDocument(info.domId, info.fileId);
    },
    async countBookmarks() {
      return 0; // 套红书签检查（checkBookMarks）据此自然短路放行
    },
    async delBookmarks() {
      return true;
    },
    async supportMultiEditing() {
      return false;
    },
    async closeFile() {
      return true;
    },
    destroy() {
      // 切换正文类型等场景原版会先 destroy 再重建；
      // 容器由下一次 injectFileZToContainer 清空重建，这里仅移除加载动画
      if (this._initParams && this._initParams.domId) {
        hideFileZLoading(this._initParams.domId);
      }
    },
    isClientApp() {
      return false;
    },
    hide() {},
    setOptions() {},
    getAutoId() {},
    getContainerAttributes() {
      return {};
    },
    getAttribute() {
      return null;
    },
    setAttribute() {},
    setScrollTo() {},
    setFocus() {},
    Display: true,
    Visible: true
  };
  return instance;
}

/**
 * 把致远 OfficeSDK 类包一层：FileZ 目标类型返回 FileZ 实例，否则透传原生。
 * 静态成员（OfficeSDK.utils.copyWebOffice / allProductType、ENUM_MODE_TYPE 等
 * 被原版代码直接引用）逐一拷贝引用；prototype 指向原生，保证外部探测不受影响。
 */
function wrapSDKClass(RealSDK) {
  if (!RealSDK || RealSDK[WRAPPED_FLAG]) return RealSDK;

  function HijackedOfficeSDK(officeParams) {
    if (shouldFileZTakeOver()) {
      console.log('[FileZ] OfficeSDK 构造被接管，正文交由文档中台渲染');
      return createFileZInstance(officeParams);
    }
    return new RealSDK(officeParams);
  }

  Object.getOwnPropertyNames(RealSDK).forEach((key) => {
    if (['prototype', 'length', 'name', 'caller', 'arguments'].includes(key)) return;
    try {
      HijackedOfficeSDK[key] = RealSDK[key];
    } catch (e) {
      /* 个别只读静态属性拷贝失败可忽略 */
    }
  });
  HijackedOfficeSDK.prototype = RealSDK.prototype;
  HijackedOfficeSDK[WRAPPED_FLAG] = true;
  HijackedOfficeSDK.__filez_real_sdk__ = RealSDK;
  return HijackedOfficeSDK;
}

/**
 * 安装劫持：SDK 已存在则立即包装；否则用访问器捕获 loadJs() 的后续挂载。
 */
export function startSdkHijack() {
  let current = window.OfficeSDK;
  if (current) {
    window.OfficeSDK = wrapSDKClass(current);
    return;
  }
  try {
    Object.defineProperty(window, 'OfficeSDK', {
      configurable: true,
      enumerable: true,
      get() {
        return current;
      },
      set(value) {
        current = wrapSDKClass(value);
        if (value && value !== current) {
          console.log('[FileZ] 捕获到 OfficeSDK 挂载，已完成类包装');
        }
      }
    });
  } catch (e) {
    console.warn('[FileZ] defineProperty(OfficeSDK) 失败:', e);
  }
}
// gjx-end
