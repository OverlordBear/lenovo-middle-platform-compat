/**
 * gjx-start：联想 FileZ 文档中台集成 —— 后端通道与业务适配（客开新增文件）
 * ================================================================
 * 职责：所有与 euFileZManager 后端的通信、文件名/文件类型拼装、
 *      正文 fileId 的提取与生成、致远 contentAPI 数据总线反写。
 * 形态对齐公文模块 apps-edoc-front 的 services/filez-adapter.js。
 * ================================================================
 */
import globalData from '@/plugins/data';
import { useBaseInfoStore } from '@/store/modules/base-info';
import { MANAGER_NAME, AJAX_FALLBACK_URL, getStandardFileType } from './config';

/**
 * 统一后端调用通道（与公文模块 _callBackend 同构）：
 * 通道1 优先走致远同步 Bridge window.callBackendMethod；
 * 通道2 兜底走 /seeyon/ajax.do 异步 Ajax（本地 devServer 等无 Bridge 场景）。
 * @param {string} managerMethod euFileZManager 上的方法名
 * @param {Object} params 业务参数（作为唯一入参传给后端）
 * @returns {Promise<any>} 后端返回值（Bridge 原样返回；Ajax 自动 JSON.parse）
 */
export async function callFileZBackend(managerMethod, params) {
  if (typeof window.callBackendMethod === 'function') {
    return window.callBackendMethod(MANAGER_NAME, managerMethod, params);
  }
  return new Promise((resolve) => {
    window.$.ajax({
      url: AJAX_FALLBACK_URL + managerMethod,
      type: 'POST',
      async: true,
      data: { arguments: JSON.stringify([params]) },
      success: (res) => {
        try {
          resolve(typeof res === 'string' ? JSON.parse(res) : res);
        } catch (e) {
          resolve(res);
        }
      },
      error: () => resolve(null)
    });
  });
}

/**
 * fileZInit：向文档中台换取编辑/预览页 URL。
 * @param {Object} p {fileId, createDate, fileName, state: 'edit'|'view'}
 * @returns {Promise<{url:string}|null>}
 */
export function fileZInit(p) {
  return callFileZBackend('fileZInit', p);
}

/** createDefaultFile：在文档中台创建空白默认文档（新建正文用） */
export function createDefaultFile(fileId, fileType, fileName) {
  return callFileZBackend('createDefaultFile', { fileId, fileType, fileName });
}

/**
 * 生成正文 fileId（毫秒时间戳 + 6 位随机数）。
 * 沿用旧客开实现的取号方式，保证与既有存量数据/后端约定兼容；
 * TODO(建议)：后续可改为由 createDefaultFile 后端返回统一取号。
 */
export function generateFileId() {
  return (
    String(new Date().getTime()) + String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  );
}

/**
 * 拼装正文文件名：表单标题 + 标准后缀（如 "请示报告.doc"）。
 * 标题取自 base-info store 的 formInfo.subject（新建页填写的标题）。
 */
export function buildBodyFileName(bodyType) {
  let subject = '协同正文';
  try {
    const store = useBaseInfoStore();
    subject = (store && store.formInfo && store.formInfo.subject && store.formInfo.subject.value) || subject;
  } catch (e) {
    /* pinia 尚未就绪时使用默认名 */
  }
  return subject + '.' + getStandardFileType(bodyType);
}

/**
 * 提取当前正文已有的 fileId（详情/处理页场景）。
 * 逻辑沿用旧客开实现：
 * 1. URL 带新建标识（method=newColl / isNew=true）时强制视为"无已有文档"，
 *    避免误用致远预分配的空壳 ID；
 * 2. 否则从 zwIframe.contentAPI 数据总线读 contentDataId，
 *    过滤负数占位符与过短的无效值。
 * @returns {string|undefined}
 */
export function extractExistingFileId() {
  const currentUrl = window.location.href;
  if (currentUrl.indexOf('method=newColl') > -1 || currentUrl.indexOf('isNew=true') > -1) {
    return undefined;
  }
  try {
    const zwIframe = window._getZWIframe && window._getZWIframe();
    if (zwIframe && zwIframe.contentAPI) {
      const cId = zwIframe.contentAPI.getMainBodyData('contentDataId');
      if (cId && String(cId).length > 5 && String(cId).indexOf('-') !== 0) {
        return cId;
      }
    }
  } catch (e) {
    console.warn('[FileZ] 从 contentAPI 提取 fileId 失败:', e);
  }
  return undefined;
}

/** 判断提取到的 fileId 是否可用（与旧客开实现的判定一致） */
export function isValidExistingFileId(fileId) {
  return !!fileId && String(fileId).length > 5 && String(fileId) !== '-1';
}

/**
 * 详情/处理页：按已有 fileId 换取预览（或编辑）URL。
 * @param {string} realFileId 已有正文 fileId
 * @param {Object} params OfficeSDK 参数（用于推断文件类型）
 * @param {string} mode 'view' | 'edit'
 * @returns {Promise<{url:string, fileId:string}>}
 */
export async function getBodyViewData(realFileId, params, mode = 'view') {
  const bodyType = (params && params.fileType) || globalData.bodyType || '41';
  const res = await fileZInit({
    fileId: realFileId,
    createDate: new Date().getTime(),
    fileName: buildBodyFileName(bodyType),
    state: mode
  });
  if (!res || !res.url) {
    throw new Error('[FileZ] fileZInit 未返回有效 url');
  }
  return { url: res.url, fileId: realFileId };
}

/**
 * 新建页：创建空白正文并换取编辑 URL。
 * 关键动作：把新生成的 fileId 反写进致远 contentAPI 数据总线
 * （id / contentDataId / fileId），保证后续"发送/暂存"能带上正确的正文 ID。
 * @param {Object} params OfficeSDK 参数
 * @param {string} mode 'edit' | 'view'
 * @returns {Promise<{url:string, fileId:string}>}
 */
export async function getBodyCreateData(params, mode = 'edit') {
  const bodyType = (params && params.fileType) || globalData.bodyType || '41';
  const fileType = getStandardFileType(bodyType);
  const realFileId = generateFileId();

  await createDefaultFile(realFileId, fileType, buildBodyFileName(bodyType));

  try {
    const zwIframe = window._getZWIframe && window._getZWIframe();
    if (zwIframe && zwIframe.contentAPI) {
      zwIframe.contentAPI.updateMainBodyData('id', realFileId);
      zwIframe.contentAPI.updateMainBodyData('contentDataId', realFileId);
      zwIframe.contentAPI.updateMainBodyData('fileId', realFileId);
      console.log('[FileZ] 新建正文 fileId 已写入致远 contentAPI:', realFileId);
    }
  } catch (e) {
    console.error('[FileZ] 写入致远 contentAPI 失败:', e);
  }

  const res = await fileZInit({
    fileId: realFileId,
    createDate: new Date().getTime(),
    fileName: buildBodyFileName(bodyType),
    state: mode
  });
  if (!res || !res.url) {
    throw new Error('[FileZ] fileZInit 未返回有效 url');
  }
  return { url: res.url, fileId: realFileId };
}

/**
 * 附件预览：按附件 fileId 换取预览 URL。
 * @param {Object} p {fileId, createDate, fileName}
 * @returns {Promise<string|null>} 预览 URL
 */
export async function getAttachmentViewUrl(p) {
  const res = await fileZInit({
    fileId: p.fileId,
    createDate: p.createDate,
    fileName: p.fileName,
    state: 'view'
  });
  return (res && res.url) || null;
}
// gjx-end
