package com.ruian.filez.poc.web;

import com.seeyon.ctp.common.web.GlobalJsExtend;

import javax.servlet.http.HttpServletRequest;

/**
 * A read-only bootstrap used to prove that a customer JAR can contribute
 * JavaScript without changing Seeyon product sources.
 */
public final class FilezPocGlobalJsExtend implements GlobalJsExtend {

    public static final String VERSION = "0.1.0";
    private static final String RESOURCE_PATH =
            "/apps_res/ruian-filez-poc/bootstrap.js?v=" + VERSION;

    @Override
    public String getJsSegment(HttpServletRequest request) {
        return bootstrapSegment(request, "GLOBAL_ENV_PC");
    }

    @Override
    public String getMBJsSegment(HttpServletRequest request) {
        return bootstrapSegment(request, "GLOBAL_ENV_MOBILE");
    }

    private String bootstrapSegment(HttpServletRequest request, String source) {
        String contextPath = request == null ? "" : request.getContextPath();
        String resourceUrl = escapeJavaScriptString(contextPath + RESOURCE_PATH);
        String escapedSource = escapeJavaScriptString(source);

        return "(function(w,d){"
                + "var source='" + escapedSource + "';"
                + "if(w.__RUIAN_FILEZ_POC_NOTE_SOURCE__){"
                + "w.__RUIAN_FILEZ_POC_NOTE_SOURCE__(source);return;"
                + "}"
                + "var id='ruian-filez-poc-bootstrap';"
                + "if(d.getElementById(id)){return;}"
                + "var s=d.createElement('script');"
                + "s.id=id;"
                + "s.async=false;"
                + "s.setAttribute('data-ruian-source',source);"
                + "s.src='" + resourceUrl + "';"
                + "s.onerror=function(){"
                + "w.__RUIAN_FILEZ_POC_LOAD_ERROR__={"
                + "source:source,at:new Date().toISOString()"
                + "};"
                + "};"
                + "(d.head||d.documentElement).appendChild(s);"
                + "})(window,document)";
    }

    private String escapeJavaScriptString(String value) {
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
