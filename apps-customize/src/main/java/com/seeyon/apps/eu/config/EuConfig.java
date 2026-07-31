package com.seeyon.apps.eu.config;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.seeyon.apps.eu.util.FileZUtil;
import com.seeyon.apps.euc.base.EucBaseConfig;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.po.config.ConfigItem;

public class EuConfig extends EucBaseConfig {
	//gjx-start：2026-07-09 配置存取迁移到 ctp ConfigManager（ctp_config_item 表）
	private static final Log log = LogFactory.getLog(EuConfig.class);

	/** 配置分类（ctp_config_item.config_category），须与 EuFileZController 保持一致 */
	public static final String CONFIG_CATEGORY = "eu_filez_config";
	//gjx-end

	private volatile String redStrings;
	private volatile String redTableStrings;
	private volatile String fileZurl;
	private volatile String oaUrl;
	private volatile String repoId;
	//gjx-start：FileZ HMAC 签名密钥。原硬编码在 FileZUtil 中，换密钥必须重启服务器；现支持配置界面热更新
	private volatile String secret;
	//gjx-end
	//gjx-start：2026-07-09 reload 改为空操作——切断 euc 旧配置通道
	// euc 框架（eucConfigManager.initConfig）启动时仍会回调本方法，若继续 mapToBean
	// 会用 ctp_customize 里的陈旧数据覆盖 initFromDb 加载的新配置，故置空。
	public void reload(Map<String, Object> data) {
		// 配置已迁移至 ConfigManager（见 initFromDb），euc 旧通道数据不再采用
	}
	//gjx-end

	//gjx-start：2026-07-09 启动加载：DB 优先，无值回退 FileZUtil 当前内置值
	/**
	 * Spring init-method（见 spring-eu-manager.xml euConfig bean 定义）。
	 * 服务启动时从 ConfigManager 加载配置并推送到 FileZUtil；
	 * 配置界面保存时由 EuFileZController.saveConfig 再次热更新。
	 */
	public synchronized void initFromDb() {
		try {
			ConfigManager cm = (ConfigManager) AppContext.getBean("configManager");

			this.oaUrl = normalizeBaseUrl(effectiveValue(cm, "filez.oaUrl", FileZUtil.getOaUrl()));
			this.fileZurl = normalizeBaseUrl(effectiveValue(cm, "filez.fileZurl", FileZUtil.getFileZurl()));
			FileZUtil.setOaUrl(this.oaUrl);
			FileZUtil.setFileZurl(this.fileZurl);

			this.repoId = effectiveValue(cm, "filez.repoId", FileZUtil.getRepoId());
			FileZUtil.setRepoId(this.repoId);

			// secret：DB 无值时保持 FileZUtil 内置默认（不回写，避免密钥泄露到页面回显之外的场景）
			String dbSecret = effectiveValue(cm, "filez.secret", "");
			if (dbSecret.trim().length() > 0) {
				this.secret = dbSecret;
				FileZUtil.setSecret(dbSecret.trim());
			}

			this.redStrings = effectiveValue(cm, "filez.redStrings", this.redStrings == null ? "" : this.redStrings);
			this.redTableStrings = effectiveValue(cm, "filez.redTableStrings", this.redTableStrings == null ? "" : this.redTableStrings);

			log.info("[EuConfig] 配置加载完成: oaUrl=" + this.oaUrl + ", fileZurl=" + this.fileZurl
					+ ", repoId=" + this.repoId + ", secret=" + (dbSecret.trim().length() > 0 ? "(已配置)" : "(内置默认)"));
		} catch (Exception e) {
			log.error("[EuConfig] initFromDb 加载配置异常（沿用 FileZUtil 内置默认值）", e);
		}
	}

	/**
	 * 取生效值：DB 有值用 DB，否则用默认值
	 */
	private String effectiveValue(ConfigManager cm, String key, String defaultValue) {
		try {
			ConfigItem item = cm.getConfigItem(CONFIG_CATEGORY, key);
			if (item != null && item.getConfigValue() != null && item.getConfigValue().trim().length() > 0) {
				return item.getConfigValue();
			}
		} catch (Exception e) {
			log.error("[EuConfig] 读取配置项异常: " + key, e);
		}
		return defaultValue == null ? "" : defaultValue;
	}
	//gjx-end


	public String getRedTableStrings() {
		return redTableStrings;
	}


	public void setRedTableStrings(String redTableStrings) {
		this.redTableStrings = redTableStrings;
	}


	public String getRedStrings() {
		return redStrings;
	}

	public void setRedStrings(String redStrings) {
		this.redStrings = redStrings;
	}

	public String getFileZurl() {
		return fileZurl;
	}


	public synchronized void setFileZurl(String fileZurl) {
		this.fileZurl = normalizeBaseUrl(fileZurl);
		FileZUtil.setFileZurl(this.fileZurl);
	}


	public String getOaUrl() {
		return oaUrl;
	}


	public synchronized void setOaUrl(String oaUrl) {
		this.oaUrl = normalizeBaseUrl(oaUrl);
		FileZUtil.setOaUrl(this.oaUrl);
	}

	/**
	 * 固定服务根地址统一去除首尾空白和末尾斜杠，避免后续拼接产生双斜杠。
	 */
	public static String normalizeBaseUrl(String value) {
		String normalized = value == null ? "" : value.trim();
		while (normalized.endsWith("/") && !normalized.endsWith("://")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		return normalized;
	}


	public String getRepoId() {
		return repoId;
	}


	public void setRepoId(String repoId) {
		FileZUtil.setRepoId(repoId);
		this.repoId = repoId;
	}

	//gjx-start：secret 热更新（非空即推送 FileZUtil；页面留空不会调用本 setter，因此保持当前密钥）
	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
		if (secret != null && secret.trim().length() > 0) {
			FileZUtil.setSecret(secret.trim());
		}
	}
	//gjx-end

}
