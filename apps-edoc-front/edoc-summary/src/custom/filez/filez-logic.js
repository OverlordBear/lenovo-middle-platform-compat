//gjx-start：联想文档中台公文自定义按钮逻辑
import Vue from 'vue';
import actions from '@/store/actions';
import state from '@/store/state';
import { contentFrame } from '@/enum';
import { getRequestParams } from '@/utils/url-params';
import { destroyOfficeEditor } from '@/components/content/office-content';
import {
  isFileZType,
  getFileZFileFingerprint,
  initFileZEditor,
  waitFileZUpdateAndRefresh,
} from './filez-adapter';

// ===================== 内部辅助 =====================

function _showProgress() {
  try {
    if (window.getCtpTop) {
      window.getCtpTop().proce = $.progressBar();
    }
  } catch (e) { /* 静默：进度条非关键路径 */ }
}

function _hideProgress() {
  try {
    if (window.getCtpTop && window.getCtpTop().proce) {
      window.getCtpTop().proce.close();
    }
  } catch (e) { /* 静默 */ }
}

/**
 * 构造正文容器刷新所需参数（fileId/fileName 取值方式与 content-edit.js 保持一致）
 * @returns {Object|null} 非 FileZ 正文或取不到 fileId 时返回 null
 */
function _buildContentRefreshParams() {
  const edocContent = state.edocContent;
  const summaryInfo = state.summaryInfo;

  if (!isFileZType(edocContent.bodyType)) return null;

  const fileId = edocContent.fileId || edocContent.content;
  if (!fileId) return null;

  let fileName = edocContent.title || summaryInfo.subject || '公文正文';
  const fileType = edocContent.fileType || 'docx';
  if (fileName.indexOf(fileType) < 0) fileName += '.' + fileType;

  return { fileId, createDate: summaryInfo.createDate, fileName, fileType };
}

// ===================== 公开 API：正文转 PDF =====================

function _getPdfParams() {
  const params = getRequestParams();
  return { affairId: params.affairId, summaryId: params.summaryId };
}

const PDF_POLL_INTERVAL = 2500;
const PDF_POLL_MAX_COUNT = 15;

function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function _isCurrentPdfResult(beforeStatus, currentStatus, isUpdate) {
  if (!currentStatus || !currentStatus.isReady || !currentStatus.url || !currentStatus.fileId) {
    return false;
  }
  if (!isUpdate) return true;

  const beforeFileId = beforeStatus && beforeStatus.fileId
    ? String(beforeStatus.fileId)
    : '';
  return !!beforeFileId && String(currentStatus.fileId) !== beforeFileId;
}

/**
 * 只更新 PDF 正文状态和容器，不销毁 Word 正文实例，也不刷新整个公文页面。
 */
async function _refreshPdfContainer(status) {
  const fileId = status && status.fileId ? String(status.fileId) : '';
  if (!fileId || !status.createDate) return false;

  // 先清理旧 PDF 实例；正文(content)实例保持不动，编辑态和未保存文单都不受影响。
  await destroyOfficeEditor({ instance: [contentFrame.pdfContent] });

  actions.changePdfFileId({
    pdfFileId: fileId,
    pdfCreateDate: status.createDate,
    pdfHasBodyFile: status.hasBodyFile !== false,
  });
  if (typeof actions.updateConvertPdf === 'function') {
    actions.updateConvertPdf();
  }

  // 等待 pdfFileId watcher 更新页签并完成它的销毁动作，再建立唯一的新实例。
  await Vue.nextTick();
  await destroyOfficeEditor({ instance: [contentFrame.pdfContent] });
  const editor = await initFileZEditor({
    fileId,
    createDate: status.createDate,
    fileName: status.fileName || '正文.pdf',
    state: 'view',
    domId: contentFrame.pdfContent,
    fileType: 'pdf',
    skipEmptyCheck: true,
  });
  if (!editor) return false;

  // 最后切换页签；组件发现已有 FileZ 实例时只切换显示状态，不会重复初始化。
  actions.changeContentActiveTab('pdfContent');
  await Vue.nextTick();
  return true;
}

async function _waitForPdfResult(paramData, beforeStatus, isUpdate) {
  for (let count = 0; count < PDF_POLL_MAX_COUNT; count++) {
    await _delay(PDF_POLL_INTERVAL);
    const pollRes = window.callBackendMethod('euFileZManager', 'checkPdfStatus', paramData);
    if (_isCurrentPdfResult(beforeStatus, pollRes, isUpdate)) {
      return pollRes;
    }
  }
  return null;
}

async function _triggerGeneratePdf(paramData, isUpdate, beforeStatus) {
  const processbar = window.getA8Top().$.progressBar({
    text: isUpdate ? '正在重新生成最新 PDF，请稍候...' : '首次生成 PDF 中，请稍候...'
  });

  try {
    const fileZRavl = window.callBackendMethod('euFileZManager', 'edocPdf', paramData);
    if (fileZRavl && fileZRavl.msg) {
      $.alert(fileZRavl.msg);
      return;
    }

    const pdfStatus = await _waitForPdfResult(paramData, beforeStatus, isUpdate);
    if (!pdfStatus) {
      $.alert('转换耗时较长，任务仍可能在后台进行，请稍后再试。');
      return;
    }

    const refreshed = await _refreshPdfContainer(pdfStatus);
    if (refreshed) {
      $.infor(isUpdate ? '最新 PDF 同步成功' : 'PDF 生成成功');
    } else {
      $.alert('PDF 已生成，但当前预览容器加载失败，请重新进入 PDF 正文页签。');
    }
  } catch (e) {
    console.error('[FileZ正文转PDF] 请求或局部刷新异常:', e);
    $.alert('请求异常，请检查控制台');
  } finally {
    if (processbar) processbar.close();
  }
}

/**
 * FileZ 正文转 PDF。
 * 由管理端 handle=custom 的按钮触发，handles-patch.js 按 label/operationId 分发。
 */
export function handleFileZPdf() {
  const paramData = _getPdfParams();
  const checkRes = window.callBackendMethod('euFileZManager', 'checkPdfStatus', paramData);

  if (checkRes && checkRes.isReady && checkRes.url) {
    $.confirm({
      msg: '系统已存在 PDF 预览。如果您刚刚修改了原正文，是否需要重新生成以保持最新？',
      ok_fn: function () {
        _triggerGeneratePdf(paramData, true, checkRes);
      },
      cancel_fn: async function () {
        const currentPdfId = state.edocContent.pdfFileId
          ? String(state.edocContent.pdfFileId)
          : '';
        if (checkRes.fileId && String(checkRes.fileId) !== currentPdfId) {
          const refreshed = await _refreshPdfContainer(checkRes);
          if (!refreshed) {
            $.alert('PDF 已生成，但当前预览容器加载失败，请稍后重试。');
          }
          return;
        }
        actions.changeContentActiveTab('pdfContent');
      }
    });
  } else {
    _triggerGeneratePdf(paramData, false, checkRes);
  }
}

// ===================== 公开 API：套红 =====================

/**
 * FileZ 套红逻辑
 *
 * 【2026-07-09】套红任务提交成功后，不再提示"前往下一节点查看"，
 * 改为轮询正文文件 meta 指纹（后端 saveRed 回调覆盖文件后 updateDate 变化），
 * 检测到套红完成即仅局部刷新正文容器 —— 整页不刷新，文单已编辑内容保留。
 */
export function handleFileZRed() {
  const affairId = state.summaryInfo.affairId;

  var dialogFile = $.dialog({
    id: 'eqbFileSignDialog',
    url: '/seeyon/euFileZ.do?method=selectRedTemplate',
    width: 700,
    height: 350,
    transParams: {},
    title: '选择套红文件',
    type: 'panel',
    checkMax: true,
    closeParam: {
      show: true,
      autoClose: false,
      handler: function () {
        dialogFile.close();
      }
    },
    buttons: [{
      text: '确定',
      handler: async function () {
        _showProgress();

        var fileValue = dialogFile.getReturnValue();
        if (!fileValue || fileValue.length === 0) {
          _hideProgress();
          $.alert('请选择套红模板');
          return;
        }

        var singleFile = fileValue[0].id;

        // 套红提交前先记录正文文件指纹基线（meta 内含 updateDate），
        // 必须在提交前取，否则任务完成过快时检测不到变化
        const refreshParams = _buildContentRefreshParams();
        const baseline = refreshParams
          ? await getFileZFileFingerprint(refreshParams)
          : null;

        // 当前唯一套红链路：FileZ一次处理正文DOC参数和动态配置的TEXT字段参数
        var fileZRavl = window.callBackendMethod('euFileZRedManager', 'edocRedTest', {
          id: singleFile,
          affairId: affairId
        });

        console.log('[FileZ套红] edocRedTest 返回结果:', fileZRavl);

        const msg = fileZRavl && fileZRavl.msg;
        // 后端成功文案以"套红成功"/"套红已提交"开头；无 msg 时沿用旧逻辑视为提交成功
        const isSubmitted = !msg
          || msg.indexOf('套红成功') === 0
          || msg.indexOf('套红已提交') === 0;

        if (!isSubmitted) {
          // 提交失败：弹出后端返回的异常/警告消息
          $.alert({
            msg: msg,
            ok_fn: function () {
              _hideProgress();
              dialogFile.close();
            }
          });
          return;
        }

        // 提交成功：关闭弹窗，等待 FileZ 异步任务完成后局部刷新正文容器
        _hideProgress();
        dialogFile.close();

        if (!baseline) {
          // 无法建立指纹基线（非 FileZ 正文或 fileZInit 异常），退回原提示方式
          $.alert('套红任务已提交，请稍后刷新正文或前往下一节点查看结果');
          return;
        }

        const refreshed = await waitFileZUpdateAndRefresh({
          ...refreshParams,
          baseline,
          domId: contentFrame.content,
          loadingTitle: '正文套红处理中…',
          loadingSub: '完成后将自动刷新正文 ✨'
        });

        if (!refreshed) {
          $.alert('套红处理时间较长，任务仍在后台进行，请稍后刷新正文或前往下一节点查看');
        }
      }
    }, {
      text: '关闭',
      handler: function () {
        dialogFile.close();
      }
    }]
  });
}

// ===================== 清稿 / 恢复原文档 =====================

/**
 * 清稿/恢复共用链：调后端 → 指纹轮询等落盘 → 局部刷新正文容器
 * （清稿 edocClear 是 FileZ 异步任务，落盘在 saveClear[含XML解毒]；
 *   恢复 edocClearRestore 是后端同步拷回备份，调用返回时文件已更新，首轮轮询即命中）
 * @param {string} managerMethod - 'edocClear' | 'edocClearRestore'
 * @param {Object} refreshParams - _buildContentRefreshParams() 的结果
 * @param {string} loadingSub    - 等待期间的副标题文案
 */
async function _runClearChain(managerMethod, refreshParams, loadingSub) {
  const affairId = state.summaryInfo.affairId;
  const domId = contentFrame.content;

  // 基线必须在提交前取：落盘会更新 updateDate → 指纹变化即完成信号
  const baseline = await getFileZFileFingerprint(refreshParams);

  let ret = window.callBackendMethod('euFileZManager', managerMethod, {
    affairId: affairId
  });
  console.log('[FileZ清稿] ' + managerMethod + ' 返回结果:', ret);

  // 兼容 Bridge 返回 JSON 字符串的情况
  if (typeof ret === 'string') {
    try { ret = JSON.parse(ret); } catch (e) { ret = null; }
  }
  // 严格校验：必须拿到带 msg 字段的对象才算后端真正执行了方法。
  // 返回 null/无 msg 字段 = 方法没被执行到（典型：JRebel 热部署新增方法未挂上
  // Spring 代理、或方法名写错），绝不能当成功进入等待，否则就是假等待+超时误导。
  if (!ret || typeof ret.msg === 'undefined') {
    $.alert('后端接口未正确响应：' + managerMethod + ' 可能尚未加载（新增方法后请重启OA服务再试）');
    return;
  }
  // 后端约定：msg 为空串代表成功/已提交，非空即失败原因
  if (ret.msg) {
    $.alert(ret.msg);
    return;
  }
  if (!baseline) {
    $.alert('操作已提交，请稍后刷新正文查看结果');
    return;
  }
  const refreshed = await waitFileZUpdateAndRefresh({
    ...refreshParams,
    baseline,
    domId,
    loadingTitle: '正文处理中…',
    loadingSub: loadingSub,
  });
  if (!refreshed) {
    $.alert('处理时间较长，任务仍在后台进行，请稍后刷新正文查看');
  }
}

/**
 * 【2026-07-14】FileZ 清稿逻辑（服务端链 + 可恢复）
 *
 * 清稿 = 后端 edocClear：FileZ ClearDoc 接受增删修订 + saveClear 落盘前 XML 解毒
 *（物理删除 ClearDoc 漏清的 w:rPrChange 等格式修订/幽灵节点），保证落盘零修订节点；
 * saveClear 仅在第一次清稿时把正文备份为 <fileId>.qgbak，之后永不覆盖。
 * 恢复原文档 = 后端 edocClearRestore：还原到第一次清稿前的文档最初版（后悔药）。
 */
export function handleFileZClear() {
  const refreshParams = _buildContentRefreshParams();
  if (!refreshParams) {
    $.alert('当前正文不是 FileZ 在线文档类型，无法清稿');
    return;
  }

  // 三按钮弹窗（照抄 summary-taohong.js 的 $.messageBox 用法）
  $.messageBox({
    type: 100,
    msg: '清稿：接受正文全部修订并保存为定稿版；恢复原文档：将正文还原到第一次清稿前的原始版本。',
    buttons: [
      {
        id: 'btnFileZClear',
        text: '确定清稿',
        handler: function () {
          _runClearChain('edocClear', refreshParams, '正在接受全部修订，完成后自动刷新 ✨');
        }
      },
      {
        id: 'btnFileZRestore',
        text: '恢复原文档',
        handler: function () {
          _runClearChain('edocClearRestore', refreshParams, '正在恢复清稿前的正文 ✨');
        }
      },
      {
        id: 'btnFileZCancel',
        text: '取消',
        handler: function () { }
      }
    ]
  });
}
//gjx-end
