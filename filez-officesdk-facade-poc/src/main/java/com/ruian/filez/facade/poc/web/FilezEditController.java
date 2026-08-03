package com.ruian.filez.facade.poc.web;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;

import com.ruian.filez.facade.poc.security.FilezCrypto;
import com.ruian.filez.facade.poc.service.FilezEditSessionService;
import com.ruian.filez.facade.poc.service.FilezEditSessionService.FacadeException;
import com.ruian.filez.facade.poc.service.FilezEditSessionService.WrapperPayload;
import com.ruian.filez.facade.poc.service.FilezEditSessionService.StatusResult;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.controller.BaseController;

/**
 * Same-origin authenticated wrapper around the independently packaged FileZ
 * editor SDK.
 */
public class FilezEditController extends BaseController {

    private static final Log LOG =
            LogFactory.getLog(FilezEditController.class);

    private FilezEditSessionService ruianFileZEditSessionService;

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
        if (ruianFileZEditSessionService == null) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            return null;
        }

        try {
            User user = AppContext.getCurrentUser();
            WrapperPayload payload =
                    ruianFileZEditSessionService.openWrapper(
                            request.getParameter("ticket"),
                            user,
                            request.getContextPath());
            writeWrapper(response, request.getContextPath(), payload);
            LOG.info(
                    "FileZ edit wrapper served: sessionId="
                    + payload.getSessionId()
                    + ", fileId=" + payload.getFileId()
                    + ", durationMs="
                    + ((System.nanoTime() - startedAt) / 1000000L));
        } catch (FacadeException e) {
            LOG.warn("FileZ edit wrapper rejected: " + e.getCode());
            response.setStatus(statusFor(e.getCode()));
        } catch (Throwable e) {
            LOG.error("FileZ edit wrapper failed", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return null;
    }

    /** Same-origin, authenticated save-revision probe used by the wrapper. */
    public ModelAndView status(
            HttpServletRequest request,
            HttpServletResponse response) {
        setNoStoreHeaders(response);
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setHeader("Allow", "GET");
            return null;
        }
        if (ruianFileZEditSessionService == null) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            return null;
        }
        try {
            StatusResult status = ruianFileZEditSessionService.getStatus(
                    request.getHeader("X-Ruian-FileZ-Session"),
                    request.getHeader("X-Ruian-FileZ-Nonce"),
                    AppContext.getCurrentUser());
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            PrintWriter out = response.getWriter();
            out.write("{\"success\":true,\"fileId\":");
            out.write(jsString(String.valueOf(status.getFileId())));
            out.write(",\"revision\":");
            out.write(String.valueOf(status.getRevision()));
            out.write(",\"contentLength\":");
            out.write(String.valueOf(status.getContentLength()));
            out.write(",\"modifiedAt\":");
            out.write(jsString(formatUtc(status.getModifiedAt())));
            out.write(",\"expiresAt\":");
            out.write(String.valueOf(status.getExpiresAt()));
            out.write("}");
            out.flush();
        } catch (FacadeException e) {
            response.setStatus(statusFor(e.getCode()));
        } catch (Throwable e) {
            LOG.error("FileZ edit status failed", e);
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
                + "/apps_res/ruian-filez-facade-poc/filez-sdk.js?v=1.8.2";

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
                + "connect-src 'self' " + payload.getFilezOrigin() + "; "
                + "frame-ancestors 'self'; base-uri 'none'; form-action 'none'");

        PrintWriter out = response.getWriter();
        out.write("<!doctype html><html><head><meta charset=\"utf-8\">");
        out.write("<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">");
        out.write("<title>FileZ editor</title>");
        out.write("<style>html,body,#ruian-filez-edit-root{width:100%;height:100%;"
                + "margin:0;overflow:hidden;background:#fff}</style>");
        out.write("</head><body><div id=\"ruian-filez-edit-root\"></div>");
        out.write("<script src=\"");
        out.write(htmlAttribute(sdkPath));
        out.write("\"></script>");
        out.write("<script nonce=\"");
        out.write(cspNonce);
        out.write("\">(function(){'use strict';");
        out.write("var CHANNEL='ruian-filez-edit',PROTOCOL='postMessage-v1',"
                + "CONTENT_CHANGE_EVENT='IDocs.Event.ContentChange',"
                + "driverUrl=");
        out.write(jsString(payload.getDriverUrl()));
        out.write(",nonce=");
        out.write(jsString(payload.getNonce()));
        out.write(",sessionId=");
        out.write(jsString(payload.getSessionId()));
        out.write(",fileId=");
        out.write(jsString(String.valueOf(payload.getFileId())));
        out.write(",expiresAt=");
        out.write(jsString(String.valueOf(payload.getExpiresAt())));
        out.write(",revision=");
        out.write(String.valueOf(payload.getRevision()));
        out.write(",contentLength=");
        out.write(String.valueOf(payload.getContentLength()));
        out.write(",statusUrl=");
        out.write(jsString(normalizeContextPath(contextPath)
                + "/ruianFileZEdit.do?method=status"));
        out.write(",app=null,savePromise=null;");
        out.write("function notify(type,detail,requestId){"
                + "var message={channel:CHANNEL,protocol:PROTOCOL,type:type,"
                + "nonce:nonce,sessionId:sessionId,fileId:fileId,expiresAt:expiresAt,"
                + "revision:revision,contentLength:contentLength};"
                + "detail=detail||{};for(var key in detail){"
                + "if(Object.prototype.hasOwnProperty.call(detail,key)){message[key]=detail[key];}}"
                + "if(requestId){message.requestId=requestId;}"
                + "window.parent.postMessage(message,window.location.origin);}");
        out.write("function requestIdOf(data){"
                + "var value=data&&data.requestId;"
                + "return typeof value==='string'||typeof value==='number'"
                + "?String(value).substring(0,128):'';}");
        out.write("function saveTarget(){var names=['ActiveDocument',"
                + "'ActiveWorkbook','ActivePresentation'];"
                + "for(var i=0;i<names.length;i+=1){try{"
                + "var target=app&&app[names[i]];"
                + "if(target&&typeof target.save==='function'){return target;}"
                + "}catch(ignore){}}return null;}");
        out.write("function readStatus(){return fetch(statusUrl,{method:'GET',"
                + "credentials:'same-origin',cache:'no-store',headers:{"
                + "Accept:'application/json','X-Ruian-FileZ-Session':sessionId,"
                + "'X-Ruian-FileZ-Nonce':nonce}}).then(function(response){"
                + "if(!response.ok){throw new Error('STATUS_'+response.status);}"
                + "return response.json();});}");
        out.write("function acceptStatus(status){"
                + "var next=Number(status&&status.revision),length=Number(status&&status.contentLength);"
                + "if(!status||status.success!==true||String(status.fileId)!==fileId||"
                + "!isFinite(next)||next<0||!isFinite(length)||length<0){"
                + "throw new Error('INVALID_SAVE_STATUS');}"
                + "revision=next;contentLength=length;return status;}");
        out.write("function waitForCommit(baseRevision,deadline){return readStatus()"
                + ".then(function(status){status=acceptStatus(status);"
                + "if(revision>baseRevision){return status;}"
                + "if(Date.now()>=deadline){throw new Error('SAVE_CONFIRM_TIMEOUT');}"
                + "return new Promise(function(resolve){setTimeout(resolve,300);})"
                + ".then(function(){return waitForCommit(baseRevision,deadline);});});}");
        out.write("function failSave(code,requestId){notify('SAVE_RESULT',{"
                + "success:false,code:code||'SAVE_FAILED'},requestId);}");
        out.write("function successSave(status,requestId,modified){notify('SAVE_RESULT',{"
                + "success:true,modified:modified,fileId:fileId,revision:revision,"
                + "contentLength:contentLength,modifiedAt:status&&status.modifiedAt},requestId);}");
        out.write("function requestSave(data){var requestId=requestIdOf(data),"
                + "requestedFileId=String(data&&data.fileId||''),"
                + "targetFileId=String(data&&data.targetFileId||"
                + "data&&data.params&&data.params.fileId||'');"
                + "if(!requestId){failSave('REQUEST_ID_REQUIRED','');return;}"
                + "if(requestedFileId!==fileId){failSave('FILE_ID_MISMATCH',requestId);return;}"
                + "if(targetFileId&&targetFileId!==fileId){"
                + "failSave('SAVE_AS_UNSUPPORTED',requestId);return;}"
                + "if(!app){failSave('EDITOR_NOT_READY',requestId);return;}"
                + "if(savePromise){failSave('SAVE_IN_PROGRESS',requestId);return;}"
                + "savePromise=readStatus().then(acceptStatus).then(function(status){"
                + "var target,baseRevision=revision;"
                + "if(data.modified===false){return {status:status,modified:false};}"
                + "target=saveTarget();if(!target){throw new Error('SDK_SAVE_UNAVAILABLE');}"
                + "return Promise.resolve().then(function(){return target.save();})"
                + ".then(function(){return waitForCommit(baseRevision,Date.now()+45000);})"
                + ".then(function(committed){return {status:committed,modified:true};});"
                + "}).then(function(result){successSave(result.status,requestId,result.modified);"
                + "}).catch(function(error){"
                + "failSave(error&&error.message||'SAVE_NOT_COMMITTED',requestId);"
                + "}).then(function(){savePromise=null;},"
                + "function(){savePromise=null;});}");
        out.write("function validParentMessage(event,data){return "
                + "event.source===window.parent&&event.origin===window.location.origin&&"
                + "data&&data.channel===CHANNEL&&data.protocol===PROTOCOL&&"
                + "data.nonce===nonce&&data.sessionId===sessionId;}");
        out.write("window.addEventListener('message',function(event){"
                + "var data=event.data;"
                + "if(!validParentMessage(event,data)){return;}"
                + "if(String(data.type||'').toUpperCase()==='SAVE'){"
                + "requestSave(data);}},false);");
        out.write("function listenForChanges(){"
                + "if(!app||typeof app.addListener!=='function'){return;}"
                + "try{var registration=app.addListener(CONTENT_CHANGE_EVENT,"
                + "function(){notify('CONTENT_MODIFIED',{modified:true});});"
                + "if(registration&&typeof registration.catch==='function'){"
                + "registration.catch(function(){"
                + "notify('FAILED',{code:'CONTENT_CHANGE_LISTENER_FAILED'});});}}"
                + "catch(error){notify('FAILED',{code:'CONTENT_CHANGE_LISTENER_FAILED'});}} ");
        out.write("if(!window.ZOfficeSDK||typeof window.ZOfficeSDK.mount!=='function'){"
                + "notify('FAILED',{code:'SDK_MISSING'});return;}");
        out.write("var timeout=new Promise(function(resolve){window.setTimeout("
                + "function(){resolve(null);},60000);});");
        out.write("Promise.race([window.ZOfficeSDK.mount(driverUrl,"
                + "'#ruian-filez-edit-root',true),timeout])"
                + ".then(function(mountedApp){if(!mountedApp){"
                + "notify('FAILED',{code:'SDK_MOUNT_FAILED'});return;}"
                + "app=mountedApp;listenForChanges();notify('READY',{success:true});})"
                + ".catch(function(){notify('FAILED',{code:'SDK_MOUNT_FAILED'});});");
        out.write("})();</script></body></html>");
        out.flush();
    }

    private static int statusFor(String code) {
        if (FilezEditSessionService.CODE_AUTH_REQUIRED.equals(code)) {
            return HttpServletResponse.SC_UNAUTHORIZED;
        }
        if (FilezEditSessionService.CODE_CONFIG_MISSING.equals(code)) {
            return HttpServletResponse.SC_SERVICE_UNAVAILABLE;
        }
        if (FilezEditSessionService.CODE_FORBIDDEN.equals(code)) {
            return HttpServletResponse.SC_FORBIDDEN;
        }
        if (FilezEditSessionService.CODE_CONFLICT.equals(code)) {
            return HttpServletResponse.SC_CONFLICT;
        }
        if (FilezEditSessionService.CODE_INVALID_ARGUMENT.equals(code)) {
            return HttpServletResponse.SC_BAD_REQUEST;
        }
        return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
    }

    private static String formatUtc(Date date) {
        Date value = date == null ? new Date(0L) : date;
        SimpleDateFormat format =
                new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return format.format(value);
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
        String safeValue = value == null ? "" : value;
        StringBuilder result = new StringBuilder(safeValue.length() + 16);
        result.append('"');
        for (int i = 0; i < safeValue.length(); i++) {
            char c = safeValue.charAt(i);
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

    public void setRuianFileZEditSessionService(
            FilezEditSessionService ruianFileZEditSessionService) {
        this.ruianFileZEditSessionService = ruianFileZEditSessionService;
    }
}
