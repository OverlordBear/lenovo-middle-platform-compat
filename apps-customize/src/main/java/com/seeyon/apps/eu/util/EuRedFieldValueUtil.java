package com.seeyon.apps.eu.util;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

//gjx：2026-07-15 联调勘误——发文单走 ctp.form 引擎（form_definition），非 cap4（cap_form_definition）
import com.seeyon.ctp.form.bean.FormFieldBean;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.organization.bo.V3xOrgAccount;
import com.seeyon.ctp.organization.bo.V3xOrgDepartment;
import com.seeyon.ctp.organization.bo.V3xOrgEntity;
import com.seeyon.ctp.organization.bo.V3xOrgLevel;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.bo.V3xOrgPost;
import com.seeyon.ctp.organization.bo.V3xOrgTeam;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.Strings;

/**
 * 套红字段"原值 → 可套入文本"转换器（gjx 2026-07-15 新增）。
 *
 * <p>取值来源是公文表单（ctp.form 引擎）formmain 物理表的原始值，各类型原始形态（本地 v1 库实测）：</p>
 * <pre>
 *   组织多选:  Account|4106410770526849021,Department|-8568206076896065230
 *             （手工输入时也可能是纯文本，如 "乐迪超级飞侠集团"，两种形态都要兜）
 *   日期:      java.util.Date/Timestamp 或 "2026-05-09 00:00:00" 字符串
 *   数字:      BigDecimal（printCopies=3 存 3 或 3.00）
 *   枚举:      枚举项 id（数字），由表单控件层解析
 * </pre>
 *
 * <p>转换策略：日期类字段直接格式化为中文年月日（红头惯例）；其余优先走产品
 * {@link FormFieldBean#getDisplayValue(Object, boolean)}（表单列表渲染同款、按控件
 * 类型路由，天然覆盖枚举/组织/人员），异常或空结果时降级为本地手工解析。</p>
 */
public final class EuRedFieldValueUtil {

	private static final Log log = LogFactory.getLog(EuRedFieldValueUtil.class);

	private static final String LOG_PREFIX = "[套红字段取值]";

	/** 组织实体存储形态: 类型|id，如 Department|-8568206076896065230 */
	private static final Pattern ORG_TOKEN = Pattern.compile("^(Member|Department|Account|Post|Level|Team)\\|(-?\\d+)$");

	/** 日期字符串形态: 2026-05-09 或 2026-05-09 00:00:00 */
	private static final Pattern DATE_TEXT = Pattern.compile("^(\\d{4})-(\\d{1,2})-(\\d{1,2})([ T].*)?$");

	private EuRedFieldValueUtil() {
	}

	/**
	 * 将字段原始值转换为可写入 Word 书签的显示文本。
	 *
	 * @param field 字段定义（可为 null，null 时仅做通用兜底转换）
	 * @param raw   formmain 原始值
	 * @return 显示文本；无值返回空串（调用方按空串跳过该书签）
	 */
	public static String convert(FormFieldBean field, Object raw) {
		if (raw == null) {
			return "";
		}
		String rawStr = String.valueOf(raw).trim();
		if (rawStr.length() == 0) {
			return "";
		}

		try {
			// 1. 日期类：直接中文年月日（不走 getDisplayValue，其输出为 yyyy-MM-dd）
			if (isDateField(field) || raw instanceof Date) {
				String d = formatDate(raw, rawStr);
				if (d != null) {
					return d;
				}
			}

			// 2. 产品控件层转换（枚举/组织/人员等，表单列表渲染同款）
			if (field != null) {
				String display = tryDisplayValue(field, raw, rawStr);
				if (Strings.isNotBlank(display)) {
					return display;
				}
			}

			// 3. 手工兜底：组织串 / 数字 / 纯文本
			return manualConvert(raw, rawStr);
		} catch (Exception e) {
			log.error(LOG_PREFIX + " 字段[" + (field == null ? "?" : field.getDisplay()) + "]转换异常, 回退原值", e);
			return rawStr;
		}
	}

	// ---------------- 分支实现 ----------------

	private static boolean isDateField(FormFieldBean field) {
		if (field == null) {
			return false;
		}
		String t = field.getFieldType();
		if (t == null) {
			return false;
		}
		t = t.toUpperCase();
		return t.contains("TIME") || "DATE".equals(t);
	}

	/** Date 对象或 yyyy-MM-dd 形态字符串 → yyyy年M月d日；非日期形态返回 null */
	private static String formatDate(Object raw, String rawStr) {
		if (raw instanceof Date) {
			return new SimpleDateFormat("yyyy年M月d日").format((Date) raw);
		}
		Matcher m = DATE_TEXT.matcher(rawStr);
		if (m.matches()) {
			return Integer.parseInt(m.group(1)) + "年"
					+ Integer.parseInt(m.group(2)) + "月"
					+ Integer.parseInt(m.group(3)) + "日";
		}
		return null;
	}

	/**
	 * 产品控件层转换。返回数组各元素形态未有公开文档，
	 * 取第一个"非空且不同于原值"的字符串；全同于原值则返回原值本身（视为文本字段）。
	 */
	private static String tryDisplayValue(FormFieldBean field, Object raw, String rawStr) {
		try {
			Object[] dv = field.getDisplayValue(raw, false);
			if (dv == null || dv.length == 0) {
				return null;
			}
			if (log.isDebugEnabled()) {
				StringBuilder sb = new StringBuilder();
				for (Object o : dv) {
					sb.append('[').append(o).append(']');
				}
				log.debug(LOG_PREFIX + " getDisplayValue(" + field.getName() + ") -> " + sb);
			}
			String same = null;
			for (Object o : dv) {
				if (!(o instanceof String)) {
					continue;
				}
				String s = ((String) o).trim();
				if (s.length() == 0) {
					continue;
				}
				if (!s.equals(rawStr)) {
					return s; // 控件真的做了转换
				}
				same = s;
			}
			return same;
		} catch (Exception e) {
			log.info(LOG_PREFIX + " getDisplayValue失败(" + field.getName() + "), 走手工兜底: " + e.getMessage());
			return null;
		}
	}

	/** 手工兜底：组织 Type|id 串 → 名称顿号拼接；BigDecimal 去尾零；其余原样 */
	private static String manualConvert(Object raw, String rawStr) {
		// 数字：去掉 3.00 的尾零
		if (raw instanceof BigDecimal) {
			return ((BigDecimal) raw).stripTrailingZeros().toPlainString();
		}

		// 组织串：至少命中一个 Type|id token 才按组织处理，否则原样返回（纯文本）
		String[] tokens = rawStr.split(",");
		boolean anyOrg = false;
		List<String> names = new ArrayList<String>();
		for (String token : tokens) {
			String t = token.trim();
			if (t.length() == 0) {
				continue;
			}
			Matcher m = ORG_TOKEN.matcher(t);
			if (m.matches()) {
				anyOrg = true;
				String name = orgName(m.group(1), Long.parseLong(m.group(2)));
				if (Strings.isNotBlank(name)) {
					names.add(name);
				}
			} else {
				names.add(t); // 混存的手输文本
			}
		}
		if (anyOrg) {
			StringBuilder sb = new StringBuilder();
			for (String name : names) {
				if (sb.length() > 0) {
					sb.append('、'); // 公文惯例顿号分隔
				}
				sb.append(name);
			}
			return sb.toString();
		}
		return rawStr;
	}

	/** 按实体类型解析组织名称，查不到返回空串并留日志 */
	private static String orgName(String type, long id) {
		try {
			OrgManager orgManager = (OrgManager) AppContext.getBean("orgManager");
			Class<? extends V3xOrgEntity> clazz;
			if ("Member".equals(type)) {
				clazz = V3xOrgMember.class;
			} else if ("Department".equals(type)) {
				clazz = V3xOrgDepartment.class;
			} else if ("Account".equals(type)) {
				clazz = V3xOrgAccount.class;
			} else if ("Post".equals(type)) {
				clazz = V3xOrgPost.class;
			} else if ("Level".equals(type)) {
				clazz = V3xOrgLevel.class;
			} else {
				clazz = V3xOrgTeam.class;
			}
			V3xOrgEntity entity = orgManager.getEntityById(clazz, Long.valueOf(id));
			if (entity != null) {
				return entity.getName();
			}
			// 部分历史数据实体可能已删除
			log.info(LOG_PREFIX + " 组织实体不存在: " + type + "|" + id);
			return "";
		} catch (Exception e) {
			log.error(LOG_PREFIX + " 解析组织实体失败: " + type + "|" + id, e);
			return "";
		}
	}
}
