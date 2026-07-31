/**
 * gjx-start：联想 FileZ 文档中台集成 —— 装配入口（客开新增文件）
 * ================================================================
 * 这是集成的唯一入口，由 src/main.js 中的 gjx 标记块调用一次。
 *
 * 子模块一览（均在本目录）：
 *   config.js               常量 / 类型映射
 *   filez-service.js        euFileZManager 后端通道 + 业务适配
 *   filez-loader.js         加载过渡动画（视觉与公文模块一致）
 *   content-render.js       正文容器注入 / 恢复 + 正文类型切换监听
 *   sdk-hijack.js           zwIframe 内 OfficeSDK 运行时代理（查看 / 新建正文）
 *   office-v2-patch.js      "修改正文"新窗口补丁（OfficeV2 原型补丁）
 *   attachment-intercept.js 附件预览拦截（officeTrans → FileZ 弹窗）
 *
 * 设计原则：核心实现收敛在本目录；原版源码只保留 main.js 装配入口与
 * 两个附件组件中的 FileZ 优先路由标记块。各子系统独立 try/catch 启动，
 * 单点失败不影响其它能力与原生功能。
 * ================================================================
 */
import { startSdkHijack } from './sdk-hijack';
import { applyOfficeV2Patch } from './office-v2-patch';
import { startAttachmentIntercept } from './attachment-intercept';
import { startContentTypeWatch } from './content-render';

export default function installFileZ() {
  const subsystems = [
    ['SDK劫持', startSdkHijack],
    ['修改正文补丁', applyOfficeV2Patch],
    ['附件预览拦截', startAttachmentIntercept],
    ['正文类型切换监听', startContentTypeWatch]
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
