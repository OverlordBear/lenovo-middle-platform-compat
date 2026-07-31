package com.seeyon.apps.eu.util;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.alibaba.fastjson.JSON;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.po.config.ConfigItem;
import com.seeyon.ctp.util.Strings;

/**
 * 套红字段动态配置的存取工具（gjx 2026-07-15 新增）。
 *
 * <p>存储沿用本项目配置中心同款通道：ctp ConfigManager（ctp_config 表）。
 * 因 CONFIG_VALUE 列实测为 varchar(1000)，采用<b>一个字段一行</b>而非整表单一个 JSON：</p>
 * <pre>
 *   CONFIG_CATEGORY = eu_filez_red_fields
 *   CONFIG_ITEM     = &lt;formId&gt;.&lt;fieldName&gt;      如 9144683112441201463.field0015
 *   CONFIG_VALUE    = {"display":"抄送单位","bookmark":"抄送单位","sort":5}
 * </pre>
 *
 * <p>锚点是物理字段名 fieldName（field00xx）：管理员在表单设计器里改"数据域名"
 * 不会丢配置；display 仅作留档用于配置页对账提示"显示名已变更"。</p>
 */
public final class EuRedFieldConfigUtil {

	private static final Log log = LogFactory.getLog(EuRedFieldConfigUtil.class);

	/** ctp_config 分类名（独立分类，与连接配置 eu_filez_config 分开） */
	public static final String CONFIG_CATEGORY = "eu_filez_red_fields";

	private EuRedFieldConfigUtil() {
	}

	private static ConfigManager cm() {
		return (ConfigManager) AppContext.getBean("configManager");
	}

	/**
	 * 读取某表单的套红字段配置。
	 *
	 * @param formId 发文单 form_definition.ID（null 返回空列表）
	 * @return 配置行列表（按 sort 升序），每行含 fieldName/display/bookmark/sort；
	 *         空列表 = 该表单未配置（调用方应回退老 17 书签逻辑）
	 */
	public static List<Map<String, Object>> loadConfig(Long formId) {
		List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
		if (formId == null) {
			return rows;
		}
		String prefix = formId + ".";
		try {
			List<ConfigItem> items = cm().listAllConfigByCategory(CONFIG_CATEGORY);
			if (items == null) {
				return rows;
			}
			for (ConfigItem item : items) {
				String key = item.getConfigItem();
				if (key == null || !key.startsWith(prefix)) {
					continue;
				}
				String fieldName = key.substring(prefix.length());
				if (Strings.isBlank(fieldName)) {
					continue;
				}
				Map<String, Object> row = parseRow(item.getConfigValue());
				if (row == null) {
					log.info("[套红字段配置] 配置值解析失败, 跳过: " + key + " = " + item.getConfigValue());
					continue;
				}
				row.put("fieldName", fieldName);
				rows.add(row);
			}
			Collections.sort(rows, new Comparator<Map<String, Object>>() {
				@Override
				public int compare(Map<String, Object> a, Map<String, Object> b) {
					return sortOf(a) - sortOf(b);
				}
			});
		} catch (Exception e) {
			log.error("[套红字段配置] 读取异常 formId=" + formId, e);
		}
		return rows;
	}

	/**
	 * 差量保存某表单的套红字段配置：入参为全量勾选清单，
	 * 与库中现状对比后新增/更新/删除；传空列表 = 清空该表单配置（运行时回退老逻辑）。
	 *
	 * @param formId 发文单 ID
	 * @param items  勾选行，每行需含 fieldName/bookmark，可选 display/sort
	 * @return 变更统计信息（added/updated/removed）
	 */
	public static Map<String, Object> saveConfig(Long formId, List<Map<String, Object>> items) {
		Map<String, Object> stat = new HashMap<String, Object>();
		int added = 0, updated = 0, removed = 0;

		String prefix = formId + ".";
		ConfigManager cm = cm();

		// 现状快照
		Map<String, ConfigItem> existing = new HashMap<String, ConfigItem>();
		List<ConfigItem> all = cm.listAllConfigByCategory(CONFIG_CATEGORY);
		if (all != null) {
			for (ConfigItem item : all) {
				if (item.getConfigItem() != null && item.getConfigItem().startsWith(prefix)) {
					existing.put(item.getConfigItem(), item);
				}
			}
		}

		Set<String> incomingKeys = new HashSet<String>();
		if (items != null) {
			int seq = 0;
			for (Map<String, Object> row : items) {
				String fieldName = str(row.get("fieldName"));
				String bookmark = str(row.get("bookmark"));
				if (Strings.isBlank(fieldName) || Strings.isBlank(bookmark)) {
					continue;
				}
				String key = prefix + fieldName;
				incomingKeys.add(key);

				Map<String, Object> val = new HashMap<String, Object>();
				val.put("display", str(row.get("display")));
				val.put("bookmark", bookmark.trim());
				val.put("sort", row.get("sort") instanceof Number ? ((Number) row.get("sort")).intValue() : seq);
				String json = JSON.toJSONString(val);

				ConfigItem item = existing.get(key);
				if (item == null) {
					cm.addConfigItem(CONFIG_CATEGORY, key, json);
					added++;
				} else if (!json.equals(item.getConfigValue())) {
					item.setConfigValue(json);
					cm.updateConfigItem(item);
					updated++;
				}
				seq++;
			}
		}

		// 删除未勾选的存量行
		for (Map.Entry<String, ConfigItem> entry : existing.entrySet()) {
			if (!incomingKeys.contains(entry.getKey())) {
				cm.deleteConfigItem(CONFIG_CATEGORY, entry.getKey());
				removed++;
			}
		}

		stat.put("added", added);
		stat.put("updated", updated);
		stat.put("removed", removed);
		log.info("[套红字段配置] 保存完成 formId=" + formId
				+ " 新增" + added + " 更新" + updated + " 删除" + removed);
		return stat;
	}

	// ---------------- 内部小工具 ----------------

	@SuppressWarnings("unchecked")
	private static Map<String, Object> parseRow(String json) {
		if (Strings.isBlank(json)) {
			return null;
		}
		try {
			Map<String, Object> row = JSON.parseObject(json, Map.class);
			if (row == null || Strings.isBlank(str(row.get("bookmark")))) {
				return null;
			}
			return row;
		} catch (Exception e) {
			return null;
		}
	}

	private static int sortOf(Map<String, Object> row) {
		Object v = row.get("sort");
		if (v instanceof Number) {
			return ((Number) v).intValue();
		}
		return Integer.MAX_VALUE;
	}

	private static String str(Object v) {
		return v == null ? "" : String.valueOf(v);
	}
}
