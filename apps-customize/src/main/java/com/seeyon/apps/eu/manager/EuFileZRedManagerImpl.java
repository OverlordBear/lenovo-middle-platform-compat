package com.seeyon.apps.eu.manager;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.alibaba.fastjson.JSON;
import com.seeyon.apps.eu.config.EuConfig;
import com.seeyon.apps.eu.po.EuEdocRecordPO;
import com.seeyon.apps.eu.util.EuRedFieldConfigUtil;
import com.seeyon.apps.eu.util.EuRedFieldValueUtil;
import com.seeyon.apps.eu.util.FileZUtil;
//gjx-start：2026-07-15 套红字段动态配置（公文表单引擎取数）
// ⚠️ 引擎勘误（联调发现）：发文单在 form_definition 表，走 formApi4Cap3 / ctp.form.bean 体系
//（产品 govdoc 模块同款，如 GovdocNewHelper.setEdocSummaryProperty）；
// cap4FormManager 管的是 cap_form_definition（普通业务表单），getForm 查不到发文单。
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.form.api.FormApi4Cap3;
import com.seeyon.ctp.form.bean.FormBean;
import com.seeyon.ctp.form.bean.FormDataMasterBean;
import com.seeyon.ctp.form.bean.FormFieldBean;
//gjx-end
import com.seeyon.apps.euc.base.EucBaseManager;
import com.seeyon.apps.euc.util.seeyon.DesUtil;
import com.seeyon.ctp.common.filemanager.manager.AttachmentManager;
import com.seeyon.ctp.common.po.affair.CtpAffair;
import com.seeyon.ctp.common.po.content.CtpContentAll;
import com.seeyon.ctp.common.po.filemanager.Attachment;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.util.ParamUtil;
import com.seeyon.ctp.util.Strings;
import com.seeyon.ctp.util.annotation.AjaxAccess;
import com.seeyon.ctp.util.json.JSONUtil;
import com.seeyon.v3x.edoc.domain.EdocSummary;
import com.seeyon.v3x.edoc.manager.EdocSummaryManager;

/**
 * FileZ公文套红专用管理器实现。
 *
 * <p>将正文作为DOC参数、动态配置的文单字段作为TEXT参数，一次提交给
 * FileZ UpdateBookmarkRef；异步结果由saveRed()覆盖回原正文文件。</p>
 *
 * @author gjx
 * @since 2026-06-12
 */
public class EuFileZRedManagerImpl extends EucBaseManager implements EuFileZRedManager {

	private static final Log log = LogFactory.getLog(EuFileZRedManagerImpl.class);

	/** Content 书签名 —— FileZ DOC合并的唯一书签 */
	private static final String CONTENT_BOOKMARK = "Content";

	/** 日志前缀 */
	private static final String LOG_PREFIX = "[套红V2]";

	// ======================== Spring 注入依赖 ========================

	private EuConfig euConfig;
	private AttachmentManager attachmentManager;
	private EdocSummaryManager edocSummaryManager;

	// ---- setters for Spring byName autowire ----

	public void setEuConfig(EuConfig euConfig) {
		this.euConfig = euConfig;
	}

	public void setAttachmentManager(AttachmentManager attachmentManager) {
		this.attachmentManager = attachmentManager;
	}

	public void setEdocSummaryManager(EdocSummaryManager edocSummaryManager) {
		this.edocSummaryManager = edocSummaryManager;
	}

	// ======================== [gjx 2026-07-15] 套红字段动态配置取数 ========================

	/**
	 * 字段收集总入口：<b>套入哪些字段完全由配置决定</b>。
	 *
	 * <p>生效语义：</p>
	 * <ul>
	 *   <li>发文单配置了字段 ⇒ 只输出配置勾选的书签；</li>
	 *   <li>发文单未配置 / 一个字段都没勾 / 配置链路取数失败 ⇒ 返回空 map，
	 *       套红只做 Content 正文合并，不套入任何文单字段；</li>
	 * </ul>
	 *
	 * @param summaryId 公文 summaryId（= affair.objectId）
	 * @return 书签名 → 值（空 map = 仅正文合并）
	 */
	Map<String, String> buildFieldValuesAuto(Long summaryId) {
		Map<String, String> empty = new LinkedHashMap<String, String>();
		try {
			EdocSummary summary = edocSummaryManager.findById(summaryId);
			if (summary == null || summary.getFormAppid() == null || summary.getFormRecordid() == null) {
				log.info(LOG_PREFIX + " 无法定位公文表单数据(summary/formAppid/formRecordid缺失), 不套入文单字段");
				return empty;
			}
			List<Map<String, Object>> cfgRows = EuRedFieldConfigUtil.loadConfig(summary.getFormAppid());
			if (cfgRows.isEmpty()) {
				log.info(LOG_PREFIX + " 发文单" + summary.getFormAppid()
						+ "未配置套红字段, 仅正文合并");
				return empty;
			}
			Map<String, String> fv = buildConfiguredFieldValues(summary, cfgRows);
			if (fv == null) {
				log.info(LOG_PREFIX + " 动态配置取数失败, 仅正文合并");
				return empty;
			}
			log.info(LOG_PREFIX + " 命中动态配置: formAppId=" + summary.getFormAppid()
					+ ", 配置字段" + cfgRows.size() + "个, 取到值" + fv.size() + "个");
			return fv;
		} catch (Exception e) {
			log.error(LOG_PREFIX + " buildFieldValuesAuto异常, 仅正文合并", e);
			return empty;
		}
	}

	/**
	 * 配置模式取数：按配置行从公文表单数据（formmain 物理表）逐字段取原值并转换。
	 *
	 * <p>取数链路与产品 govdoc 模块同款（GovdocNewHelper.setEdocSummaryProperty）：
	 * formApi4Cap3.getForm(formAppId) → findDataById(recordId, formAppId) → getFieldValue(字段名)。
	 * 注意 findDataById 参数顺序是（数据ID, 表单ID），已按产品调用方字节码核实。</p>
	 *
	 * @return 书签名→值（保留配置顺序，空值字段跳过）；表单/数据读不到返回 null（触发仅正文合并）
	 */
	private Map<String, String> buildConfiguredFieldValues(EdocSummary summary, List<Map<String, Object>> cfgRows) {
		try {
			FormApi4Cap3 formApi = (FormApi4Cap3) AppContext.getBean("formApi4Cap3");
			FormBean form = formApi.getForm(summary.getFormAppid().longValue());
			if (form == null) {
				log.info(LOG_PREFIX + " 未找到表单定义 formAppId=" + summary.getFormAppid());
				return null;
			}
			FormDataMasterBean master = formApi.findDataById(
					summary.getFormRecordid().longValue(), summary.getFormAppid().longValue());
			if (master == null) {
				log.info(LOG_PREFIX + " 未找到表单数据 formRecordId=" + summary.getFormRecordid());
				return null;
			}

			Map<String, FormFieldBean> fieldByName = new HashMap<String, FormFieldBean>();
			List<FormFieldBean> allFields = form.getAllFieldBeans();
			if (allFields != null) {
				for (FormFieldBean fb : allFields) {
					if (fb != null && fb.isMasterField()) {
						fieldByName.put(fb.getName(), fb);
					}
				}
			}

			Map<String, String> fv = new LinkedHashMap<String, String>();
			for (Map<String, Object> row : cfgRows) {
				String fieldName = String.valueOf(row.get("fieldName"));
				String bookmark = String.valueOf(row.get("bookmark"));
				try {
					FormFieldBean fb = fieldByName.get(fieldName);
					if (fb == null) {
						// 字段在表单里已被删除：配置页会标失效，运行时静默跳过
						log.info(LOG_PREFIX + "  书签[" + bookmark + "] 对应字段" + fieldName + "已不存在, 跳过");
						continue;
					}
					Object raw = master.getFieldValue(fieldName);
					String value = EuRedFieldValueUtil.convert(fb, raw);
					if (Strings.isNotBlank(value)) {
						fv.put(bookmark, value);
						log.info(LOG_PREFIX + "  书签[" + bookmark + "] ← " + fieldName
								+ "(" + fb.getFieldType() + ") = \"" + value + "\"");
					} else {
						log.info(LOG_PREFIX + "  书签[" + bookmark + "] ← " + fieldName + " 无值, 跳过");
					}
				} catch (Exception per) {
					log.error(LOG_PREFIX + "  书签[" + bookmark + "] 取值异常, 跳过该字段", per);
				}
			}
			return fv;
		} catch (Exception e) {
			log.error(LOG_PREFIX + " buildConfiguredFieldValues异常", e);
			return null;
		}
	}

	// ======================== 当前生效的FileZ公文套红 ========================

	@Override
	@AjaxAccess
	public Map<String, Object> edocRedTest(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<>();
		String msg = "";
		List<Map<String, Object>> debugArgs = new ArrayList<>();

		try {
			Long redId = ParamUtil.getLong(param, "id");
			Long affairId = ParamUtil.getLong(param, "affairId");
			long edocFileId = 0L;
			long contentId = 0L;
			List<Map<String, Object>> ops = new ArrayList<>();
			Map<String, Object> op = new HashMap<>();
			op.put("actId", "UpdateBookmarkRef");
			Map<String, Object> options = new HashMap<>();
			CtpAffair affair = colManager.getAffairById(affairId);
			Map<String, Object> contentParams = new HashMap<>();
			contentParams.put("moduleId", affair.getObjectId());
			List<CtpContentAll> contentList = seeyonDao.findBy(CtpContentAll.class, contentParams);
			List<Map<String, Object>> args = new ArrayList<>();

			String oaUrl = euConfig.getOaUrl();
			String fileZUrl = euConfig.getFileZurl();

			// 1. 构造正文 DOC 书签
			for (CtpContentAll content : contentList) {
				Long fileId = NumberUtils.toLong(content.getContent());
				V3XFile v3xFile = fileManager.getV3XFile(fileId);
				if (v3xFile != null) {
					File file = fileManager.getFile(v3xFile.getId(), v3xFile.getUpdateDate());
					if (file != null) {
						String edocType = getFileType(content.getContentType() + "");
						if (".docx".equals(edocType) || ".wps".equals(edocType)) {
							Map<String, Object> arg = new HashMap<>();
							arg.put("bookname", CONTENT_BOOKMARK);
							arg.put("dataType", "DOC");
							arg.put("refName", "正文.docx");
							String desName = DesUtil.encode("正文.docx", "123456");
							contentId = content.getId();
							edocFileId = fileId;
							String downloadUrl = oaUrl + "/seeyon/euFileZ.do?method=download&fileId="
									+ fileId + "&fileName=" + desName;
							arg.put("dataRef", downloadUrl);
							args.add(arg);
						}
					}
				}
			}

			// 2. 按动态配置获取公文单字段；无配置时只合并正文
			if (args.size() > 0 && edocFileId != 0L && contentId != 0L) {
				Map<String, String> fv = buildFieldValuesAuto(affair.getObjectId());
				log.info("[edocRedTest] 收集到的字段: " + JSONUtil.toJSONString(fv));

				for (Map.Entry<String, String> entry : fv.entrySet()) {
					String bookName = entry.getKey();
					String bookValue = entry.getValue();

					// 【2026-06-12 修正】参数名修正为 dataRef（官方文档确认）
					// dataType=TEXT 时，dataRef 直接赋文本字符串值（不是 URL）
					// 之前错误使用了 text/value/data 作为参数名，导致全部静默失败
					Map<String, Object> textArg = new HashMap<>();
					textArg.put("bookname", bookName);
					textArg.put("dataType", "TEXT");
					textArg.put("dataRef", bookValue);  // ← 修正：dataRef 而非 text
					args.add(textArg);
					log.info("[edocRedTest] 字段[" + bookName + "]=" + bookValue + " -> 加了1个TEXT arg (dataRef)");
				}
			}

			debugArgs.addAll(args);
			log.info("[edocRedTest] args总数=" + args.size());
			log.info("[edocRedTest] args详情: " + JSONUtil.toJSONString(args));

			options.put("args", args);
			op.put("options", options);
			ops.add(op);
			List<Attachment> redAttach = attachmentManager.getByReference(redId, redId);
			Attachment attachment = redAttach.get(0);
			Long fileUrl = attachment.getFileUrl();
			V3XFile redFile = fileManager.getV3XFile(fileUrl);

			Map<String, Object> sendParam = new HashMap<>();
			String desRedName = DesUtil.encode(redFile.getFilename(), "123456");
			String downloadRedUrl = oaUrl + "/seeyon/euFileZ.do?method=download&fileId="
					+ redFile.getId() + "&fileName=" + desRedName;
			sendParam.put("fileUrl", downloadRedUrl);
			sendParam.put("filename", redFile.getFilename());
			sendParam.put("callback", oaUrl + "/seeyon/euFileZ.do?method=fileZredReturn");
			sendParam.put("ops", ops);

			log.info("[edocRedTest] 发送body: " + JSONUtil.toJSONString(sendParam));
			String apiResp = FileZUtil.publicapiUpdate(
					JSONUtil.toJSONString(sendParam), fileZUrl);
			log.info("[edocRedTest] FileZ返回: " + apiResp);
			Map<String, Object> startMap = JSON.parseObject(apiResp, Map.class);
			String code = ParamUtil.getString(startMap, "code");
			if ("Ok".equals(code)) {
				String taskId = ParamUtil.getString(startMap, "taskId");
				if (Strings.isBlank(taskId)) {
					log.error("[edocRedTest] FileZ返回Ok但taskId为空");
					msg = "套红任务提交失败：FileZ未返回taskId";
				} else {
					EuEdocRecordPO po = new EuEdocRecordPO();
					po.setId(contentId);
					po.setOldFileId(edocFileId);
					po.setTaskId(taskId);
					seeyonDao.saveOrUpdate(po);
					log.info("[edocRedTest] 成功! taskId=" + taskId);
					msg = "套红成功-请稍后前往下一结点查看";
				}
			} else {
				log.info("[edocRedTest] 失败 code=" + code);
				msg = "FileZ返回异常-code:" + code;
			}

		} catch (Exception e) {
			msg = "套红异常:" + e.getMessage();
			log.error("edocRedTest", e);
		}

		result.put("msg", msg);
		result.put("debugArgsCount", debugArgs.size());
		result.put("debugArgs", debugArgs);
		return result;
	}

	// ======================== 工具方法 ========================

	/**
	 * 根据 contentType 获取文件扩展名。
	 * <pre>
	 * 41: OfficeWord  → .docx
	 * 43: WpsWord    → .wps
	 * 42: OfficeExcel → .xls
	 * 44: WpsExcel   → .et
	 * 45: Pdf        → .pdf
	 * </pre>
	 */
	private String getFileType(String contentType) {
		String ext = "";
		if ("43".equals(contentType)) {
			ext = ".wps";
		} else if ("41".equals(contentType)) {
			ext = ".docx";
		} else if ("44".equals(contentType)) {
			ext = ".et";
		} else if ("42".equals(contentType)) {
			ext = ".xls";
		} else if ("45".equals(contentType)) {
			ext = ".pdf";
		}
		return ext;
	}

}
