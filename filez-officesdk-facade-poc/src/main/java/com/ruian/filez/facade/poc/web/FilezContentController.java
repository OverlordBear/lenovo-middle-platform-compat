package com.ruian.filez.facade.poc.web;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker.Result;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker.UnpackException;
import com.ruian.filez.facade.poc.service.FilezCapabilityService;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.FileBinding;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.Grant;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.Purpose;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.controller.BaseController;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.util.annotation.NeedlessCheckLogin;

/**
 * Anonymous-by-routing, capability-protected FileZ body download endpoint.
 */
public class FilezContentController extends BaseController {

    private static final Log LOG =
            LogFactory.getLog(FilezContentController.class);
    private static final String TOKEN_NAME = "x-ruian-filez-token";
    private static final String EDIT_DOWNLOAD_TOKEN_NAME =
            "x-ruian-filez-download-token";

    private final LegacyBodyUnpacker unpacker = new LegacyBodyUnpacker();
    private final FilezRuntimeConfig runtimeConfig = new FilezRuntimeConfig();

    private FilezCapabilityService ruianFileZCapabilityService;
    private FileManager fileManager;

    /**
     * FileZ requires the download URL itself to have no query string. A8
     * resolves such controller requests to {@code index}, so this method is
     * the canonical capability-protected download entry point.
     */
    @Override
    @NeedlessCheckLogin
    public ModelAndView index(
            HttpServletRequest request,
            HttpServletResponse response) {
        return download(request, response);
    }

    @NeedlessCheckLogin
    public ModelAndView download(
            HttpServletRequest request,
            HttpServletResponse response) {
        long startedAt = System.nanoTime();
        setSecurityHeaders(response);
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            response.setHeader("Allow", "GET");
            return null;
        }
        /*
         * Re-read the authoritative switch before consuming the capability.
         * This denies use while view is disabled, but does not delete the
         * in-memory grant. A production implementation still needs a policy
         * epoch so an old token cannot become valid again after re-enabling.
         */
        if (!runtimeConfig.isViewEnabled()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return null;
        }
        if (ruianFileZCapabilityService == null || fileManager == null) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            return null;
        }

        String token = extractUnambiguousToken(request, TOKEN_NAME);
        Grant grant = token == null
                ? null : ruianFileZCapabilityService.consumeContent(token);
        if (grant == null) {
            token = extractUnambiguousToken(request, EDIT_DOWNLOAD_TOKEN_NAME);
            grant = token == null
                    ? null
                    : ruianFileZCapabilityService.consumeEditDownload(token);
        }
        if (grant == null) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return null;
        }

        FileBinding binding = grant.getBinding();
        InputStream input = null;
        try {
            V3XFile current =
                    fileManager.getV3XFile(Long.valueOf(binding.getFileId()));
            if (current == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return null;
            }
            long declaredSize = current.getSize() == null
                    ? -1L : current.getSize().longValue();
            if (declaredSize > binding.getMaxFileBytes()) {
                response.setStatus(HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE);
                return null;
            }

            Date sourceDate = grant.getPurpose() == Purpose.EDIT_DOWNLOAD
                    ? current.getCreateDate() : binding.getCreateDate();
            if (sourceDate == null) {
                input = fileManager.getFileInputStream(
                        Long.valueOf(binding.getFileId()));
            } else {
                input = fileManager.getFileInputStream(
                        Long.valueOf(binding.getFileId()),
                        sourceDate);
            }

            Result result = unpacker.unpack(
                    input,
                    declaredSize,
                    binding.getMaxFileBytes(),
                    binding.getMimeType(),
                    binding.getFileName());
            byte[] bytes = result.getBytes();
            String fileName = outputFileName(
                    binding.getFileName(), result.getSuggestedExtension());

            response.setContentType(result.getContentType());
            response.setHeader(
                    "Content-Disposition", contentDisposition(fileName));
            response.setContentLength(bytes.length);
            OutputStream output = response.getOutputStream();
            output.write(bytes);
            output.flush();
            LOG.info(
                    "FileZ content callback served: bytes="
                    + bytes.length
                    + ", transformed=" + result.isTransformed()
                    + ", durationMs="
                    + ((System.nanoTime() - startedAt) / 1000000L));
        } catch (UnpackException e) {
            LOG.error("FileZ historic body decoding failed", e);
            if (!response.isCommitted()) {
                response.setStatus(HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE);
            }
        } catch (Throwable e) {
            LOG.error("FileZ capability download failed", e);
            if (!response.isCommitted()) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (Exception ignored) {
                    // The response status already describes the primary operation.
                }
            }
        }
        return null;
    }

    private static String extractUnambiguousToken(
            HttpServletRequest request, String tokenName) {
        Set<String> values = new LinkedHashSet<String>();
        addToken(values, request.getHeader(tokenName));

        String[] parameters = request.getParameterValues(tokenName);
        if (parameters != null) {
            for (String parameter : parameters) {
                addToken(values, parameter);
            }
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie != null && tokenName.equalsIgnoreCase(cookie.getName())) {
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

    private static void setSecurityHeaders(HttpServletResponse response) {
        response.setHeader(
                "Cache-Control",
                "private, no-store, no-cache, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0L);
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Security-Policy", "default-src 'none'");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Accept-Ranges", "none");
    }

    private static String outputFileName(
            String original, String suggestedExtension) {
        String result = original == null ? "document" : original.trim();
        if (result.length() == 0) {
            result = "document";
        }
        if (suggestedExtension != null && suggestedExtension.length() > 0) {
            String lower = result.toLowerCase(Locale.ENGLISH);
            if (lower.endsWith(".docx") || lower.endsWith(".xlsx")) {
                result = result.substring(0, result.length() - 5);
            } else if (lower.endsWith(".doc")
                    || lower.endsWith(".wps")
                    || lower.endsWith(".xls")) {
                result = result.substring(0, result.length() - 4);
            } else if (lower.endsWith(".et")) {
                result = result.substring(0, result.length() - 3);
            }
            result += suggestedExtension;
        }
        return result;
    }

    private static String contentDisposition(String fileName) {
        StringBuilder ascii = new StringBuilder();
        for (int i = 0; i < fileName.length(); i++) {
            char c = fileName.charAt(i);
            if (c >= 0x20 && c <= 0x7e && c != '"' && c != '\\' && c != ';') {
                ascii.append(c);
            } else {
                ascii.append('_');
            }
        }
        if (ascii.length() == 0) {
            ascii.append("document");
        }
        return "attachment; filename=\"" + ascii.toString()
                + "\"; filename*=UTF-8''" + rfc5987(fileName);
    }

    private static String rfc5987(String value) {
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        StringBuilder encoded = new StringBuilder(bytes.length * 3);
        for (byte item : bytes) {
            int c = item & 0xff;
            if ((c >= 'a' && c <= 'z')
                    || (c >= 'A' && c <= 'Z')
                    || (c >= '0' && c <= '9')
                    || c == '-' || c == '.' || c == '_' || c == '~') {
                encoded.append((char) c);
            } else {
                encoded.append('%');
                String hex = Integer.toHexString(c).toUpperCase(Locale.ENGLISH);
                if (hex.length() == 1) {
                    encoded.append('0');
                }
                encoded.append(hex);
            }
        }
        return encoded.toString();
    }

    public void setRuianFileZCapabilityService(
            FilezCapabilityService ruianFileZCapabilityService) {
        this.ruianFileZCapabilityService = ruianFileZCapabilityService;
    }

    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setConfigManager(ConfigManager configManager) {
        runtimeConfig.setConfigManager(configManager);
    }
}
