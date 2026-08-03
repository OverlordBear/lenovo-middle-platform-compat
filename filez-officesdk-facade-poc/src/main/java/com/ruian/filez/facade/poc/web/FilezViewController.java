package com.ruian.filez.facade.poc.web;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;

import com.ruian.filez.facade.poc.security.FilezCrypto;
import com.ruian.filez.facade.poc.service.FilezViewSessionService;
import com.ruian.filez.facade.poc.service.FilezViewSessionService.FacadeException;
import com.ruian.filez.facade.poc.service.FilezViewSessionService.WrapperPayload;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.controller.BaseController;

/**
 * Same-origin authenticated wrapper around the independently packaged FileZ SDK.
 */
public class FilezViewController extends BaseController {

    private static final Log LOG =
            LogFactory.getLog(FilezViewController.class);

    private FilezViewSessionService ruianFileZViewSessionService;

    public ModelAndView wrapper(
            HttpServletRequest request,
            HttpServletResponse response) {
        long startedAt = System.nanoTime();
        setNoStoreHeaders(response);
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setHeader("Allow", "GET");
            return null;
        }
        if (ruianFileZViewSessionService == null) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            return null;
        }

        try {
            User user = AppContext.getCurrentUser();
            WrapperPayload payload =
                    ruianFileZViewSessionService.openWrapper(
                            request.getParameter("ticket"),
                            user,
                            request.getContextPath());
            writeWrapper(response, request.getContextPath(), payload);
            LOG.info(
                    "FileZ wrapper served: durationMs="
                    + ((System.nanoTime() - startedAt) / 1000000L));
        } catch (FacadeException e) {
            LOG.warn("FileZ wrapper rejected: " + e.getCode());
            response.setStatus(statusFor(e.getCode()));
        } catch (Throwable e) {
            LOG.error("FileZ wrapper failed", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return null;
    }

    private static void writeWrapper(
            HttpServletResponse response,
            String contextPath,
            WrapperPayload payload) throws Exception {
        String cspNonce = FilezCrypto.randomToken(18);
        String sdkPath = normalizeContextPath(contextPath)
                + "/apps_res/ruian-filez-facade-poc/filez-sdk.js?v=0.6.1";

        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html;charset=UTF-8");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader(
                "Content-Security-Policy",
                "default-src 'none'; "
                + "script-src 'self' 'nonce-" + cspNonce + "'; "
                + "style-src 'unsafe-inline'; "
                + "img-src 'self' data: " + payload.getFilezOrigin() + "; "
                + "frame-src " + payload.getFilezOrigin() + "; "
                + "connect-src " + payload.getFilezOrigin() + "; "
                + "frame-ancestors 'self'; base-uri 'none'; form-action 'none'");

        PrintWriter out = response.getWriter();
        out.write("<!doctype html><html><head><meta charset=\"utf-8\">");
        out.write("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
        out.write("<title>FileZ read-only view</title>");
        out.write("<style>html,body,#ruian-filez-view-root{width:100%;height:100%;"
                + "margin:0;overflow:hidden;background:#fff}</style>");
        out.write("</head><body><div id=\"ruian-filez-view-root\"></div>");
        out.write("<script src=\"");
        out.write(htmlAttribute(sdkPath));
        out.write("\"></script>");
        out.write("<script nonce=\"");
        out.write(cspNonce);
        out.write("\">(function(){'use strict';");
        out.write("var driverUrl=");
        out.write(jsString(payload.getDriverUrl()));
        out.write(",nonce=");
        out.write(jsString(payload.getNonce()));
        out.write(",sessionId=");
        out.write(jsString(payload.getSessionId()));
        out.write(",sent=false;");
        out.write("function notify(type,code){if(sent){return;}sent=true;"
                + "var message={channel:'ruian-filez-view',"
                + "protocol:'postMessage-v1',type:type,nonce:nonce,"
                + "sessionId:sessionId};if(code){message.code=code;}"
                + "window.parent.postMessage(message,window.location.origin);}");
        out.write("if(!window.ZOfficeSDK||typeof window.ZOfficeSDK.mount!=='function'){"
                + "notify('FAILED','SDK_MISSING');return;}");
        out.write("var timeout=new Promise(function(resolve){window.setTimeout("
                + "function(){resolve(null);},60000);});");
        out.write("Promise.race([window.ZOfficeSDK.mount(driverUrl,"
                + "'#ruian-filez-view-root',true),timeout])"
                + ".then(function(app){if(app){notify('READY');}"
                + "else{notify('FAILED','SDK_MOUNT_FAILED');}})"
                + ".catch(function(){notify('FAILED','SDK_MOUNT_FAILED');});");
        out.write("})();</script></body></html>");
        out.flush();
    }

    private static int statusFor(String code) {
        if (FilezViewSessionService.CODE_AUTH_REQUIRED.equals(code)) {
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
        if (FilezViewSessionService.CODE_CONFIG_MISSING.equals(code)) {
            return HttpServletResponse.SC_SERVICE_UNAVAILABLE;
        }
        if (FilezViewSessionService.CODE_FORBIDDEN.equals(code)) {
            return HttpServletResponse.SC_FORBIDDEN;
        }
        return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
    }

    private static void setNoStoreHeaders(HttpServletResponse response) {
        response.setHeader(
                "Cache-Control",
                "private, no-store, no-cache, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0L);
    }

    private static String normalizeContextPath(String contextPath) {
        String result = contextPath == null ? "" : contextPath.trim();
        if (result.length() > 0 && !result.startsWith("/")) {
            result = "/" + result;
        }
        while (result.endsWith("/") && result.length() > 1) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    private static String htmlAttribute(String value) {
        return value.replace("&", "&amp;")
                .replace("\"", "&quot;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }

    private static String jsString(String value) {
        StringBuilder result = new StringBuilder(value.length() + 16);
        result.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"':
                    result.append("\\\"");
                    break;
                case '\\':
                    result.append("\\\\");
                    break;
                case '\n':
                    result.append("\\n");
                    break;
                case '\r':
                    result.append("\\r");
                    break;
                case '\t':
                    result.append("\\t");
                    break;
                case '<':
                    result.append("\\u003c");
                    break;
                case '>':
                    result.append("\\u003e");
                    break;
                case '&':
                    result.append("\\u0026");
                    break;
                case '\u2028':
                    result.append("\\u2028");
                    break;
                case '\u2029':
                    result.append("\\u2029");
                    break;
                default:
                    if (c < 0x20) {
                        result.append(String.format("\\u%04x", (int) c));
                    } else {
                        result.append(c);
                    }
            }
        }
        result.append('"');
        return result.toString();
    }

    public void setRuianFileZViewSessionService(
            FilezViewSessionService ruianFileZViewSessionService) {
        this.ruianFileZViewSessionService = ruianFileZViewSessionService;
    }
}
