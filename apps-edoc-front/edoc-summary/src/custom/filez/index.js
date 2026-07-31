/**
 * gjx-start：联想 FileZ 文档中台集成 —— 装配入口（客开新增文件）
 * ================================================================
 * 这是集成的唯一装配入口，由 src/main.js 中的 gjx 标记块调用一次。
 * 结构与协同模块（pc-collaboration/src/custom/filez）同构。
 *
 * 子模块一览（均在本目录）：
 *   config.js         常量 / 按钮识别条件 / handle 注册键
 *   filez-adapter.js  FileZ 统一适配器（后端双通道 / URL / 注入 / 动画 / 指纹轮询，
 *                     2026-07-16 由 src/services/ 迁入，内容未变）
 *   sdk-hijack.js     window.OfficeSDK 类劫持（正文查看/新建/上传的接管点，
 *                     覆盖原 office-content.js / upload-content-file.js /
 *                     save-content.js / save-draft.js / send.js / content-utils.js
 *                     六个源文件的内联改动，相关源文件已恢复致远原版）
 *   handles-patch.js  handles 调度表补丁（修改正文 / FileZ套红 / FileZ清稿 /
 *                     转PDF / 正文下载，覆盖原 content-edit.js /
 *                     custom-action/index.js / common/index.js 的内联改动）
 *   filez-logic.js    套红 + 清稿 + 正文转PDF 业务逻辑
 *                     （由 handles.custom 按 label/operationId 分发）
 *   test-777.js       「正文下载」按钮逻辑（由 custom-test/ 迁入）
 *
 * 仍保留标记块的源文件（无法零侵入的部分，见《公文FileZ改动总结.md》）：
 *   src/main.js                                   本模块引入（1 处）
 *   src/components/attachment-list/table.vue      附件 FileZ 预览（模板事件为 $emit
 *                                                 多层链路，拦截成本高于收益）
 *   src/components/content/content-header.vue     「AI 智能创作」客开（与 FileZ 无关）
 *   src/store/actions/common/modules/edoc-content.js  新建默认 HTML 正文（与 FileZ 无关）
 * ================================================================
 */
import { startSdkHijack } from './sdk-hijack';
import { applyHandlesPatch } from './handles-patch';

export default function installFileZ() {
  const subsystems = [
    ['OfficeSDK类劫持', startSdkHijack],
    ['handles调度表补丁', applyHandlesPatch]
  ];
  subsystems.forEach(([name, start]) => {
    try {
      start();
    } catch (e) {
      console.error('[FileZ] 子系统「' + name + '」启动失败:', e);
    }
  });

  console.log('[FileZ] 联想文档中台集成已启动（src/custom/filez）');
}
// gjx-end
