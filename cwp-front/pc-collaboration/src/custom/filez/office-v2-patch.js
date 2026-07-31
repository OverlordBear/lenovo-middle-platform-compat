/**
 * gjx-start：联想 FileZ 文档中台集成 —— "修改正文"新窗口补丁（客开新增文件）
 * ================================================================
 * 以运行时原型补丁的方式替换 OfficeV2.prototype.editOfficeTrans，
 * 使 office-v2.js 源码保持致远原版不动：
 *  - 正文类型为 41-44（Word/Excel/WPS）时：新窗口打开 FileZ 编辑器，
 *    轮询窗口关闭后仅局部刷新正文预览（不整页刷新）；
 *  - 其余类型（PDF/OFD 等）：原样走致远原生 editOfficeTrans。
 * 触发链路：处理页"修改正文"按钮 → plugins/office editOffice()
 *          → BaseOffice.editOffice → this.editOfficeTrans（本补丁）。
 * ================================================================
 */
import OfficeV2 from '@/plugins/office/extend/office-v2';
import globalMethods from '@/plugins/methods';
import { useBaseInfoWithOut } from '@/store/modules/base-info';
import { isFileZBodyType } from './config';
import { extractExistingFileId, getBodyViewData } from './filez-service';
import { renderBodyIframe } from './content-render';

const PATCHED_FLAG = '__filez_edit_patched__';

/** FileZ 新窗口编辑流程（迁移自旧客开在 office-v2.js 内的实现，逻辑保持一致） */
async function fileZPopupEdit(instance, { zwIframe, transParams, userId }) {
  console.log('[FileZ] 新窗口接管正文编辑');
  const useBaseInfo = useBaseInfoWithOut();

  // 加编辑锁，防止多人同时编辑正文
  const lock = await instance.addLock({ userId });
  if (!lock) return;

  // 标记正文已修改，保证最后提交时会保存正文状态
  zwIframe.document.getElementById('viewState').value = '1';
  useBaseInfo.setIsHideGlobalLoading(true);

  try {
    const existFileId = extractExistingFileId();
    const params = { ...(zwIframe.officeSDK && zwIframe.officeSDK.params), ...transParams };

    const filezData = await getBodyViewData(existFileId, params, 'edit');

    // 新窗口打开联想文档编辑器，不在当前页 iframe 内渲染编辑态
    const editWindow = window.open(filezData.url, '_blank');
    if (!editWindow) {
      globalMethods.warning({ content: '拦截器阻止了新窗口弹出，请允许本站弹出窗口。' });
      return;
    }

    // 每 500ms 检查一次编辑窗口是否关闭；关闭后仅局部刷新正文预览
    const timer = setInterval(async () => {
      if (editWindow.closed) {
        clearInterval(timer);
        console.log('[FileZ] 编辑窗口已关闭，局部刷新正文预览');
        useBaseInfo.setIsHideGlobalLoading(false);
        try {
          const viewData = await getBodyViewData(filezData.fileId, params, 'view');
          // 只重渲染正文区，绝不 reload 整个页面（保留页面上未保存的其它内容）
          renderBodyIframe(viewData.url);
        } catch (e) {
          console.error('[FileZ] 编辑后刷新正文预览失败:', e);
        } finally {
          useBaseInfo.setIsHideGlobalLoading(true);
        }
      }
    }, 500);
  } catch (error) {
    console.error('[FileZ] 启动联想文档编辑失败:', error);
    useBaseInfo.setIsHideGlobalLoading(true);
    globalMethods.warning({ content: '无法启动联想文档服务，请稍后再试' });
  }
}

/** 安装补丁（幂等） */
export function applyOfficeV2Patch() {
  if (OfficeV2.prototype[PATCHED_FLAG]) return;

  const originalEditOfficeTrans = OfficeV2.prototype.editOfficeTrans;
  OfficeV2.prototype.editOfficeTrans = function (payload) {
    // 仅接管 FileZ 目标类型；PDF/OFD 等仍走致远原生编辑
    if (!isFileZBodyType(this.bodyType)) {
      return originalEditOfficeTrans.apply(this, arguments);
    }
    return fileZPopupEdit(this, payload || {});
  };

  OfficeV2.prototype[PATCHED_FLAG] = true;
  console.log('[FileZ] OfficeV2.editOfficeTrans 补丁已安装');
}
// gjx-end
