/**
 * gjx-start：联想 FileZ 文档中台集成 —— 常量配置（客开新增文件）
 * ================================================================
 * 本目录（src/custom/filez/）为客开新增，不属于致远原版源码。
 * 集成方式与协同模块（pc-collaboration）同构：零侵入外挂 ——
 * 原版源码仅 src/main.js 增加一处引入，其余通过
 * 「window.OfficeSDK 类劫持 + handles 调度表补丁」在运行时接管。
 * 卸载方式：删除 main.js 中的 gjx 标记块与本目录即可回到原版行为
 * （table.vue 附件预览、content-header.vue AI 创作等少量标记块见改动总结）。
 * ================================================================
 */

/**
 * FileZ 套红 / 清稿 / 正文转PDF 自定义按钮的识别条件（管理端配置的按钮）。
 * 按 label 或 operationId 匹配；管理端新建按钮后把 operationId 回填到这里。
 */
export const RED_BUTTON_LABEL = 'FileZ套红';
export const RED_BUTTON_OPERATION_ID = '9030026099510101913';
export const CLEAR_BUTTON_LABEL = 'FileZ清稿';
export const CLEAR_BUTTON_OPERATION_ID = ''; // 管理端建好按钮后回填
export const PDF_BUTTON_LABEL = 'FileZ正文转PDF';
export const PDF_BUTTON_OPERATION_ID = ''; // 管理端建好按钮后回填

/** 独立按钮 handle 注册键（与管理端按钮配置的 handle 字段一致） */
export const HANDLE_KEY_DOWNLOAD = 'test777'; // 正文下载
// gjx-end
