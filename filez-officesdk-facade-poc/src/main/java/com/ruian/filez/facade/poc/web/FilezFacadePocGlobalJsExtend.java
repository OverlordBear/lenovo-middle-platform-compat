package com.ruian.filez.facade.poc.web;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.web.GlobalJsExtend;

import javax.servlet.http.HttpServletRequest;

/**
 * Loads the independently deployed FileZ adapter through the small, generic
 * resolver extension installed in Seeyon's OfficeSDK.
 *
 * <p>The Java provider contributes a versioned script tag and the
 * server-authoritative mode. Browser parameters cannot elevate that mode.
 * Mobile and all configuration failures are forced to {@code off}.</p>
 */
public final class FilezFacadePocGlobalJsExtend implements GlobalJsExtend {

    public static final String VERSION = "0.6.1";
    private static final String RESOURCE_PATH =
            "/apps_res/ruian-filez-facade-poc/bootstrap.js?v=" + VERSION;

    private final ConfigManager testConfigManager;

    public FilezFacadePocGlobalJsExtend() {
        this(null);
    }

    FilezFacadePocGlobalJsExtend(ConfigManager testConfigManager) {
        this.testConfigManager = testConfigManager;
    }

    @Override
    public String getJsSegment(HttpServletRequest request) {
        return bootstrapSegment(
                request,
                "GLOBAL_ENV_PC",
                resolveServerMode());
    }

    @Override
    public String getMBJsSegment(HttpServletRequest request) {
        return bootstrapSegment(
                request,
                "GLOBAL_ENV_MOBILE",
                FilezRuntimeConfig.MODE_OFF);
    }

    private String bootstrapSegment(
            HttpServletRequest request, String source, String mode) {
        String contextPath = request == null ? "" : request.getContextPath();
        String resourceUrl = escapeJavaScriptString(contextPath + RESOURCE_PATH);
        String escapedSource = escapeJavaScriptString(source);
        String escapedMode = escapeJavaScriptString(mode);

        return "(function(w,d){"
                + "var source='" + escapedSource + "';"
                + "var mode='" + escapedMode + "';"
                + "if(w.__RUIAN_FILEZ_FACADE_NOTE_SOURCE__){"
                + "w.__RUIAN_FILEZ_FACADE_NOTE_SOURCE__(source);return;"
                + "}"
                + "var id='ruian-filez-facade-poc-bootstrap';"
                + "if(d.getElementById(id)){return;}"
                + "var s=d.createElement('script');"
                + "s.id=id;"
                + "s.async=false;"
                + "s.setAttribute('data-ruian-source',source);"
                + "s.setAttribute('data-ruian-mode',mode);"
                + "s.src='" + resourceUrl + "';"
                + "s.onerror=function(){"
                + "w.__RUIAN_FILEZ_FACADE_LOAD_ERROR__={"
                + "source:source,at:new Date().toISOString()"
                + "};"
                + "};"
                + "(d.head||d.documentElement).appendChild(s);"
                + "})(window,document)";
    }

    private String resolveServerMode() {
        try {
            ConfigManager manager = testConfigManager;
            if (manager == null) {
                Object bean = AppContext.getBean("configManager");
                if (!(bean instanceof ConfigManager)) {
                    return FilezRuntimeConfig.MODE_OFF;
                }
                manager = (ConfigManager) bean;
            }
            FilezRuntimeConfig runtime = new FilezRuntimeConfig();
            runtime.setConfigManager(manager);
            return runtime.getEffectiveFacadeMode();
        } catch (Throwable ignored) {
            return FilezRuntimeConfig.MODE_OFF;
        }
    }

    private static String escapeJavaScriptString(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\r", "\\r")
                .replace("\n", "\\n")
                .replace("\u2028", "\\u2028")
                .replace("\u2029", "\\u2029");
    }
}
