/**
 * gjx-start：联想 FileZ 文档中台集成 —— 常量配置（客开新增文件）
 * ================================================================
 * 本目录（src/custom/filez/）为客开新增，不属于致远原版源码。
 * 集成方式：核心能力集中在本目录，通过「SDK 劫持 + 原型补丁 + 事件订阅
 * + URL 拦截」在运行时接管；原版源码仅保留 main.js 装配入口与两个附件
 * 组件中的 FileZ 路由标记块。
 * 卸载方式：删除上述标记块与本目录即可回到原版行为。
 * ================================================================
 */

/** 后端客开桥的 managerName（对应 apps 侧 euFileZManager） */
export const MANAGER_NAME = 'euFileZManager';

/** ajax 兜底通道地址（window.callBackendMethod 不可用时使用） */
export const AJAX_FALLBACK_URL =
  '/seeyon/ajax.do?method=ajaxAction&managerName=' + MANAGER_NAME + '&managerMethod=';

/**
 * 由 FileZ 接管的正文类型（致远 BodyTypeEnums 数字枚举）：
 * 41 微软 Word / 42 微软 Excel / 43 金山 WPS 文字 / 44 金山 WPS 表格。
 * 注意：45(pdf)、46(ofd) 不接管，仍走致远原生流版签插件。
 */
export const FILEZ_BODY_TYPES = ['41', '42', '43', '44'];

/** Word 家族（数字枚举 + 扩展名） */
const WORD_TYPES = ['41', '43', 'doc', 'docx', 'wps'];
/** Excel 家族（数字枚举 + 扩展名） */
const EXCEL_TYPES = ['42', '44', 'xls', 'xlsx', 'et'];

/** init 参数匹配用的全量目标类型（数字枚举 + 常见扩展名） */
export const TARGET_TYPES = FILEZ_BODY_TYPES.concat(['docx', 'doc', 'wps', 'xlsx', 'xls', 'et']);

/**
 * FileZ 附件预览白名单。命中的附件会在数据层把 canLook 补为 true，
 * 使模板显示"查看"图标，并统一经附件拦截器走 FileZ 弹窗预览。
 * PDF 和图片也只走 FileZ，不再回落组件原生预览。
 */
export const FILEZ_PREVIEW_EXTENSIONS = [
  'doc', 'docx', 'wps',
  'xls', 'xlsx', 'et',
  'ppt', 'pptx', 'dps',
  'pdf',
  'txt', 'md', 'csv', 'rtf',
  'zip', 'rar', '7z',
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tif', 'tiff', 'svg'
];

/** 把扩展名或文件名规范成无点、小写扩展名，并去掉路径、查询串和 hash。 */
function normalizeAttachmentExtension(value) {
  if (typeof value !== 'string') return '';
  const withoutQuery = value.trim().split(/[?#]/)[0];
  const lastSlash = Math.max(withoutQuery.lastIndexOf('/'), withoutQuery.lastIndexOf('\\'));
  const basename = withoutQuery.slice(lastSlash + 1);
  const lastDot = basename.lastIndexOf('.');
  const extension = lastDot > -1 ? basename.slice(lastDot + 1) : basename;
  return extension.replace(/^\.+/, '').trim().toLowerCase();
}

/** extension/fileType 应是后缀；若传来 MIME 或路径则交给文件名字段兜底。 */
function normalizeDeclaredExtension(value) {
  if (typeof value !== 'string') return '';
  const declared = value.trim().split(/[?#]/)[0];
  if (declared.indexOf('/') > -1 || declared.indexOf('\\') > -1) return '';
  return normalizeAttachmentExtension(declared);
}

/**
 * 从各附件接口的不同字段取扩展名。
 * 全部附件接口使用 fileType/fileFullName，常规附件接口使用 extension/filename。
 */
export function getAttachmentExtension(attachment) {
  const att = attachment || {};
  const directExtension = normalizeDeclaredExtension(att.extension);
  if (directExtension) return directExtension;

  const fileType = normalizeDeclaredExtension(att.fileType);
  if (fileType) return fileType;

  const names = [att.filename, att.fileName, att.fileFullName];
  for (let i = 0; i < names.length; i++) {
    const extension = normalizeAttachmentExtension(names[i]);
    if (extension) return extension;
  }
  return '';
}

/** 判断附件是否属于 FileZ 预览白名单。 */
export function isFileZPreviewFile(attachment) {
  return FILEZ_PREVIEW_EXTENSIONS.includes(getAttachmentExtension(attachment));
}

/** 附件预览弹窗的窗口特征（与旧客开实现保持一致） */
export const POPUP_FEATURES =
  'top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes';

/** 正文渲染 iframe 的 DOM id（旧客开实现同名，保持排查习惯） */
export const BODY_IFRAME_ID = 'filez-render-iframe';

/** 致远原生正文 iframe 的 DOM id */
export const NATIVE_IFRAME_ID = 'zwIframe';

/** 判断 bodyType（数字枚举）是否由 FileZ 接管 */
export function isFileZBodyType(bodyType) {
  return FILEZ_BODY_TYPES.includes(String(bodyType));
}

/**
 * 判断 OfficeSDK.init 的入参是否命中 FileZ 接管目标。
 * 与旧客开实现保持一致：优先看 params.fileType，取不到时兜底页面级 bodyType
 * （zwIframe 内正文编辑器 init 时常常不带 fileType）。
 */
export function isFileZTargetParams(params, fallbackBodyType) {
  const t = (params && params.fileType) || fallbackBodyType;
  if (!t) return false;
  return TARGET_TYPES.includes(String(t));
}

/**
 * 数字枚举 / 扩展名 → FileZ 标准文件后缀。
 * 与旧客开实现保持一致：Word 家族兜底 doc，Excel 家族兜底 xls，未知兜底 doc。
 */
export function getStandardFileType(bodyType) {
  const typeStr = String(bodyType || '41').toLowerCase();
  if (WORD_TYPES.includes(typeStr)) {
    return ['doc', 'docx', 'wps'].includes(typeStr) ? typeStr : 'doc';
  }
  if (EXCEL_TYPES.includes(typeStr)) {
    return ['xls', 'xlsx', 'et'].includes(typeStr) ? typeStr : 'xls';
  }
  return 'doc';
}
// gjx-end
