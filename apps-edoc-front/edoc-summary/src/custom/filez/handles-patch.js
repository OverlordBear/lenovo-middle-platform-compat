/**
 * gjx-start：联想 FileZ 文档中台集成 —— handles 调度表补丁（客开新增文件）
 * ================================================================
 * 原版按钮点击统一走 src/handles/index.js 导出的 `handles` 合并调度表，
 * 按键名在点击时现查（widgets/edoc-toolbar-button: handles[handle]）。
 * 该表是普通可变对象 —— 在运行时替换/新增槽位即可接管按钮行为，
 * 对应源文件（content-edit.js、custom-action/index.js、common/index.js）
 * 保持致远原版不动：
 *   1. handles.contentPrint 正文打印：当前为 PDF 正文页签时提示切回正文；
 *   2. handles.edit    修改正文：FileZ 类型 → 弹窗编辑 + 关窗后局部刷新正文，
 *                      其余类型 → 原生 editContent；
 *   3. handles.custom  自定义按钮：拦截「FileZ套红 / FileZ清稿 / FileZ正文转PDF」
 *                      转入 filez-logic，
 *                      其余 → 原生 customAction 分发；
 *   4. handles.test777 注册「正文下载」处理器
 *                      （管理端按钮的 handle 字段与键名对应）。
 * ================================================================
 */
import handlesDefault, { handles } from '@/handles';
import state from '@/store/state';
import actions from '@/store/actions';
import { contentFrame } from '@/enum';
import {
  RED_BUTTON_LABEL,
  RED_BUTTON_OPERATION_ID,
  CLEAR_BUTTON_LABEL,
  CLEAR_BUTTON_OPERATION_ID,
  PDF_BUTTON_LABEL,
  PDF_BUTTON_OPERATION_ID,
  HANDLE_KEY_DOWNLOAD
} from './config';
import {
  isFileZType,
  getFileZEditorUrl,
  openFileZPopupEditor,
  initFileZEditor
} from './filez-adapter';
import { handleFileZRed, handleFileZClear, handleFileZPdf } from './filez-logic';
import test777Action from './test-777';

const PATCHED_FLAG = '__filez_handles_patched__';

/**
 * FileZ 版「修改正文」：弹窗打开编辑器，关闭弹窗后仅重新初始化正文容器
 * （原为 window.location.reload() 整页刷新，会丢失文单上未保存的内容）。
 * 逻辑迁移自旧客开在 content-edit.js 内的实现，行为保持一致。
 */
async function fileZEditContent() {
  const summaryInfo = state.summaryInfo;
  const edocContent = state.edocContent;

  let fileName = edocContent.title || summaryInfo.subject;
  const fileType = edocContent.fileType;
  if (fileType && fileName.indexOf(fileType) < 0) fileName += '.' + fileType;

  const finalFileId = edocContent.fileId || edocContent.content;
  if (!finalFileId) {
    $.alert('无法获取文件 ID');
    return true;
  }

  const fileZUrl = await getFileZEditorUrl({
    fileId: finalFileId,
    createDate: summaryInfo.createDate,
    fileName: fileName,
    state: 'edit'
  });
  if (!fileZUrl) return false; // 未取到地址时回落原生流程

  openFileZPopupEditor(fileZUrl, () => {
    initFileZEditor({
      fileId: finalFileId,
      createDate: summaryInfo.createDate,
      fileName: fileName,
      state: 'view',
      domId: contentFrame.content,
      fileType: fileType
    });
  });
  actions.updateContentFlag();
  return true;
}

/** 在合并调度表与 summary 子注册表上同时替换一个键（防个别代码绕过合并表直调） */
function patchKey(key, wrap) {
  if (typeof handles[key] === 'function') {
    handles[key] = wrap(handles[key]);
  }
  const summaryHandles = handlesDefault && handlesDefault.summaryHandles;
  if (summaryHandles && typeof summaryHandles[key] === 'function') {
    summaryHandles[key] = wrap(summaryHandles[key]);
  }
}

/** 在合并调度表与 common 子注册表上注册新键 */
function registerKey(key, fn) {
  handles[key] = fn;
  const commonHandles = handlesDefault && handlesDefault.commonHandles;
  if (commonHandles) commonHandles[key] = fn;
}

export function applyHandlesPatch() {
  if (handles[PATCHED_FLAG]) return;

  // 1. FileZ 正文打印只面向 Word 正文容器；PDF 页签下前置提示，避免隐藏容器闪烁。
  patchKey('contentPrint', (originalPrint) => {
    return function () {
      const edocContent = state.edocContent || {};
      if (isFileZType(edocContent.bodyType) && edocContent.activeTab === 'pdfContent') {
        $.alert('请切换到正文页签打印');
        return;
      }
      return originalPrint.apply(this, arguments);
    };
  });

  // 2. 修改正文：FileZ 类型走弹窗编辑，否则原生
  patchKey('edit', (originalEdit) => {
    return async function () {
      const bodyType = state.edocContent && state.edocContent.bodyType;
      if (isFileZType(bodyType) && bodyType !== 'HTML') {
        console.log('[FileZ] 修改正文 → 弹窗编辑（关窗后局部刷新正文）');
        const handled = await fileZEditContent();
        if (handled) return;
      }
      return originalEdit.apply(this, arguments);
    };
  });

  // 3. 自定义按钮：FileZ套红 / FileZ清稿 / FileZ正文转PDF 拦截
  patchKey('custom', (originalCustom) => {
    return async function (operation) {
      if (operation) {
        const label = operation.label;
        const operationId = operation.id;
        if (label === RED_BUTTON_LABEL || operationId === RED_BUTTON_OPERATION_ID) {
          console.log('[FileZ] 拦截到 FileZ套红 按钮');
          return handleFileZRed();
        }
        if (
          label === CLEAR_BUTTON_LABEL ||
          (CLEAR_BUTTON_OPERATION_ID && operationId === CLEAR_BUTTON_OPERATION_ID)
        ) {
          console.log('[FileZ] 拦截到 FileZ清稿 按钮');
          return handleFileZClear();
        }
        if (
          label === PDF_BUTTON_LABEL ||
          (PDF_BUTTON_OPERATION_ID && operationId === PDF_BUTTON_OPERATION_ID)
        ) {
          console.log('[FileZ] 拦截到 FileZ正文转PDF 按钮');
          return handleFileZPdf();
        }
      }
      return originalCustom.apply(this, arguments);
    };
  });

  // 4. 注册正文下载独立处理器
  registerKey(HANDLE_KEY_DOWNLOAD, test777Action);

  handles[PATCHED_FLAG] = true;
  console.log('[FileZ] handles 调度表补丁已安装（contentPrint / edit / custom[套红/清稿/转PDF] / test777）');
}
// gjx-end
