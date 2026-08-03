package com.ruian.filez.facade.poc.web;

import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.TimeZone;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Cookie;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.ruian.filez.facade.poc.service.FilezEditSessionService;
import com.ruian.filez.facade.poc.service.FilezEditSessionService.FacadeException;
import com.ruian.filez.facade.poc.service.FilezEditSessionService.SaveResult;
import com.seeyon.ctp.common.controller.BaseController;
import com.seeyon.ctp.util.annotation.NeedlessCheckLogin;

/** FileZ multipart callback protected by an edit-upload capability. */
public class FilezEditContentController extends BaseController {

    private static final Log LOG =
            LogFactory.getLog(FilezEditContentController.class);
    private static final String TOKEN_NAME = "x-ruian-filez-upload-token";

    private FilezEditSessionService ruianFileZEditSessionService;

    @Override
    @NeedlessCheckLogin
    public ModelAndView index(
            HttpServletRequest request,
            HttpServletResponse response) {
        return upload(request, response);
    }

    @NeedlessCheckLogin
    public ModelAndView upload(
            HttpServletRequest request,
            HttpServletResponse response) {
        setSecurityHeaders(response);
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setHeader("Allow", "POST");
            return null;
        }
        if (ruianFileZEditSessionService == null) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            return null;
        }
        if (!(request instanceof MultipartHttpServletRequest)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return null;
        }

        String token = extractUnambiguousToken(request);
        if (token == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return null;
        }

        try {
            MultipartFile file =
                    ((MultipartHttpServletRequest) request).getFile("file");
            SaveResult saved =
                    ruianFileZEditSessionService.commitUpload(token, file);
            writeSuccess(response, saved);
        } catch (FacadeException e) {
            LOG.warn("FileZ edit upload rejected: " + e.getCode());
            response.setStatus(statusFor(e.getCode()));
        } catch (Throwable e) {
            LOG.error("FileZ edit upload failed", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return null;
    }

    private static String extractUnambiguousToken(HttpServletRequest request) {
        Set<String> values = new LinkedHashSet<String>();
        addToken(values, request.getHeader(TOKEN_NAME));
        String[] parameters = request.getParameterValues(TOKEN_NAME);
        if (parameters != null) {
            for (String parameter : parameters) {
                addToken(values, parameter);
            }
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie != null
                        && TOKEN_NAME.equalsIgnoreCase(cookie.getName())) {
                    addToken(values, cookie.getValue());
                }
            }
        }
        if (values.size() != 1) {
            return null;
        }
        String token = values.iterator().next();
        return token.matches("[A-Za-z0-9_-]{43}") ? token : null;
    }

    private static void addToken(Set<String> values, String value) {
        if (value != null && value.trim().length() > 0) {
            values.add(value.trim());
        }
    }

    private static void writeSuccess(
            HttpServletResponse response,
            SaveResult saved) throws Exception {
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.write("{\"id\":");
        out.write(jsonString(String.valueOf(saved.getFileId())));
        out.write(",\"name\":");
        out.write(jsonString(saved.getFileName()));
        out.write(",\"modified_at\":");
        out.write(jsonString(formatUtc(saved.getModifiedAt())));
        out.write(",\"permissions\":{\"read\":true,\"write\":true,"
                + "\"download\":false,\"print\":false},\"revision\":");
        out.write(String.valueOf(saved.getRevision()));
        out.write(",\"contentLength\":");
        out.write(String.valueOf(saved.getContentLength()));
        out.write("}");
        out.flush();
    }

    private static int statusFor(String code) {
        if (FilezEditSessionService.CODE_FORBIDDEN.equals(code)) {
            return HttpServletResponse.SC_FORBIDDEN;
        }
        if (FilezEditSessionService.CODE_CONFLICT.equals(code)) {
            return HttpServletResponse.SC_CONFLICT;
        }
        if (FilezEditSessionService.CODE_INVALID_ARGUMENT.equals(code)) {
            return HttpServletResponse.SC_BAD_REQUEST;
        }
        if (FilezEditSessionService.CODE_CONFIG_MISSING.equals(code)) {
            return HttpServletResponse.SC_SERVICE_UNAVAILABLE;
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

    private static String jsonString(String value) {
        String text = value == null ? "" : value;
        StringBuilder result = new StringBuilder(text.length() + 16);
        result.append('"');
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (c == '"' || c == '\\') {
                result.append('\\').append(c);
            } else if (c == '\n') {
                result.append("\\n");
            } else if (c == '\r') {
                result.append("\\r");
            } else if (c == '\t') {
                result.append("\\t");
            } else if (c < 0x20) {
                result.append(String.format("\\u%04x", (int) c));
            } else {
                result.append(c);
            }
        }
        result.append('"');
        return result.toString();
    }

    private static void setSecurityHeaders(HttpServletResponse response) {
        response.setHeader(
                "Cache-Control",
                "private, no-store, no-cache, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0L);
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Security-Policy", "default-src 'none'");
        response.setHeader("Referrer-Policy", "no-referrer");
    }

    public void setRuianFileZEditSessionService(
            FilezEditSessionService ruianFileZEditSessionService) {
        this.ruianFileZEditSessionService = ruianFileZEditSessionService;
    }
}
