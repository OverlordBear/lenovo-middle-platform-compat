package com.ruian.filez.facade.poc.filez;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Base64;
import java.util.Date;
import java.util.TimeZone;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.security.FilezCrypto;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.FileBinding;

/**
 * Builds the FileZ active-integration read-only driver URL.
 */
public final class DriverUrlBuilder {

    private static final String DRIVER_PATH = "/docs/app/driver-callback";
    private static final String TOKEN_PARAMETER = "x-ruian-filez-token";

    public String buildViewUrl(
            FilezRuntimeConfig.Snapshot config,
            FileBinding binding,
            long userId,
            String contentToken,
            String downloadUrl) {
        if (downloadUrl == null
                || downloadUrl.indexOf('?') >= 0
                || downloadUrl.indexOf('#') >= 0
                || downloadUrl.indexOf('&') >= 0) {
            throw new IllegalArgumentException(
                    "FileZ download URL must not contain query or fragment");
        }
        if (contentToken == null
                || !contentToken.matches("[A-Za-z0-9_-]{43}")) {
            throw new IllegalArgumentException("Invalid content capability");
        }

        String docId = String.valueOf(binding.getFileId());
        String userInfoJson = buildUserInfoJson(binding, userId);
        String metaJson = buildMetaJson(binding, userId, docId);

        StringBuilder path = new StringBuilder(1024);
        path.append(DRIVER_PATH)
                .append("?repoId=").append(urlEncode(config.getRepoId()))
                .append("&docId=").append(urlEncode(docId))
                .append("&action=view")
                .append("&userinfo=").append(base64UrlParameter(userInfoJson))
                .append("&meta=").append(base64UrlParameter(metaJson))
                // FileZ requires a plain, queryless callback URL here; request
                // authorization is carried separately in the params field.
                .append("&downloadUrl=").append(downloadUrl)
                .append("&uploadUrl=")
                .append("&params=").append(TOKEN_PARAMETER)
                .append('=').append(contentToken)
                .append("&ts=").append(System.currentTimeMillis());

        String unsignedPath = path.toString();
        path.append("&HMAC=")
                .append(FilezCrypto.hmacSha256Hex(
                        config.getSecret(), unsignedPath));
        return config.getFilezBaseUrl() + path.toString();
    }

    private static String buildUserInfoJson(FileBinding binding, long userId) {
        String displayName = safeText(binding.getUserDisplayName(), 128);
        String loginName = safeText(binding.getUserLoginName(), 128);
        if (loginName.length() == 0) {
            loginName = String.valueOf(userId);
        }
        return "{"
                + "\"id\":" + jsonString(String.valueOf(userId)) + ","
                + "\"display_name\":" + jsonString(displayName) + ","
                + "\"email\":" + jsonString(loginName)
                + "}";
    }

    private static String buildMetaJson(
            FileBinding binding, long userId, String docId) {
        Date modified = binding.getUpdateDate();
        if (modified == null) {
            modified = binding.getCreateDate();
        }
        if (modified == null) {
            modified = new Date(0L);
        }
        return "{"
                + "\"id\":" + jsonString(docId) + ","
                + "\"name\":" + jsonString(safeText(binding.getFileName(), 180)) + ","
                + "\"modified_at\":" + jsonString(formatUtc(modified)) + ","
                + "\"created_by\":{"
                + "\"id\":" + jsonString(String.valueOf(userId)) + ","
                + "\"name\":" + jsonString(
                        safeText(binding.getUserDisplayName(), 128))
                + "},"
                + "\"permissions\":{"
                + "\"read\":true,"
                + "\"write\":false,"
                + "\"download\":false,"
                + "\"print\":false"
                + "}"
                + "}";
    }

    private static String formatUtc(Date date) {
        SimpleDateFormat format =
                new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        format.setTimeZone(TimeZone.getTimeZone("UTC"));
        return format.format(date);
    }

    private static String base64UrlParameter(String json) {
        String encoded = Base64.getEncoder().encodeToString(
                json.getBytes(StandardCharsets.UTF_8));
        return urlEncode(encoded);
    }

    private static String urlEncode(String value) {
        try {
            return URLEncoder.encode(value, "UTF-8");
        } catch (Exception e) {
            throw new IllegalStateException("UTF-8 URL encoding is unavailable", e);
        }
    }

    private static String safeText(String value, int maxLength) {
        String result = value == null ? "" : value.trim();
        if (result.length() > maxLength) {
            result = result.substring(0, maxLength);
        }
        return result;
    }

    private static String jsonString(String value) {
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
                case '\b':
                    result.append("\\b");
                    break;
                case '\f':
                    result.append("\\f");
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
}
