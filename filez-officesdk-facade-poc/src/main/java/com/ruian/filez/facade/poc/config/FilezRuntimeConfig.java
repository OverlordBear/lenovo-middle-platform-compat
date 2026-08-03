package com.ruian.filez.facade.poc.config;

import java.net.URI;

import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.po.config.ConfigItem;

/**
 * Server-authoritative runtime configuration.
 *
 * <p>The facade policy always comes from {@code ruian_filez_view}. Existing
 * {@code eu_filez_config} values may supply connection parameters only; they
 * can never enable the facade.</p>
 */
public final class FilezRuntimeConfig {

    public static final String CATEGORY = "ruian_filez_view";
    public static final String LEGACY_CATEGORY = "eu_filez_config";

    public static final String ENABLED = "filez.enabled";
    public static final String FACADE_MODE = "filez.facadeMode";
    public static final String MODE_OFF = "off";
    public static final String MODE_SHADOW = "shadow";
    public static final String MODE_VIEW = "view";
    public static final String MODE_EDIT = "edit";

    private static final String FILEZ_URL = "filez.fileZurl";
    private static final String OA_URL = "filez.oaUrl";
    private static final String REPO_ID = "filez.repoId";
    private static final String SECRET = "filez.secret";
    private static final String WRAPPER_TTL = "filez.browserTicketTtlSeconds";
    private static final String CONTENT_TTL = "filez.contentTokenTtlSeconds";
    private static final String EDIT_TTL = "filez.editTokenTtlSeconds";
    private static final String MAX_FILE_BYTES = "filez.maxFileBytes";

    private static final int DEFAULT_WRAPPER_TTL_SECONDS = 60;
    private static final int DEFAULT_CONTENT_TTL_SECONDS = 300;
    private static final int DEFAULT_EDIT_TTL_SECONDS = 1800;
    private static final long DEFAULT_MAX_FILE_BYTES = 50L * 1024L * 1024L;
    private static final Object POLICY_WRITE_LOCK = new Object();

    private ConfigManager configManager;

    public void setConfigManager(ConfigManager configManager) {
        this.configManager = configManager;
    }

    /**
     * Returns the effective server policy. A fresh installation with neither
     * policy item present defaults to {@code enabled=true, mode=view}. Once
     * either policy item exists, both values must be complete and canonical;
     * an incomplete/invalid value, a missing configuration service, or a read
     * failure still collapses to {@code enabled=false, mode=off}.
     */
    public FacadePolicy loadFacadePolicy() {
        if (configManager == null) {
            return FacadePolicy.off();
        }
        try {
            ConfigItem enabledItem =
                    configManager.getConfigItem(CATEGORY, ENABLED);
            ConfigItem modeItem =
                    configManager.getConfigItem(CATEGORY, FACADE_MODE);
            if (enabledItem == null && modeItem == null) {
                return FacadePolicy.view();
            }
            String enabled = valueOf(enabledItem);
            String mode = valueOf(modeItem);
            if (!"true".equals(enabled) || !isValidMode(mode)) {
                return FacadePolicy.off();
            }
            return new FacadePolicy(true, mode);
        } catch (Throwable ignored) {
            return FacadePolicy.off();
        }
    }

    public String getEffectiveFacadeMode() {
        return loadFacadePolicy().getMode();
    }

    public boolean isViewEnabled() {
        String mode = getEffectiveFacadeMode();
        return MODE_VIEW.equals(mode) || MODE_EDIT.equals(mode);
    }

    public boolean isEditEnabled() {
        return MODE_EDIT.equals(getEffectiveFacadeMode());
    }

    /**
     * Updates the two policy keys in a fail-closed order. Every elevation
     * first writes {@code enabled=false}, then the requested mode, and only
     * writes {@code enabled=true} after both values are safe. The effective
     * value is read back before success is reported. Any write/readback
     * failure makes a best-effort attempt to force both keys to OFF.
     */
    public FacadePolicy updateFacadePolicy(
            boolean enabled, String mode) throws ConfigException {
        if (configManager == null) {
            throw new ConfigException("A8 configuration service is unavailable");
        }
        if (!isValidMode(mode)) {
            throw new ConfigException("FileZ facade mode is invalid");
        }
        try {
            synchronized (POLICY_WRITE_LOCK) {
                if (enabled) {
                    write(CATEGORY, ENABLED, "false");
                    write(CATEGORY, FACADE_MODE, mode);
                    write(CATEGORY, ENABLED, "true");
                } else {
                    write(CATEGORY, ENABLED, "false");
                    write(CATEGORY, FACADE_MODE, MODE_OFF);
                }
                FacadePolicy persisted = loadFacadePolicy();
                String expectedMode = enabled ? mode : MODE_OFF;
                if (persisted.isEnabled() != enabled
                        || !expectedMode.equals(persisted.getMode())) {
                    forceOffBestEffort();
                    throw new ConfigException(
                            "FileZ facade policy readback did not match");
                }
                return persisted;
            }
        } catch (ConfigException e) {
            throw e;
        } catch (Throwable e) {
            forceOffBestEffort();
            throw new ConfigException("Unable to update FileZ facade policy");
        }
    }

    private void forceOffBestEffort() {
        try {
            write(CATEGORY, ENABLED, "false");
        } catch (Throwable ignored) {
            // Continue: mode=off also makes an exact enabled=true policy safe.
        }
        try {
            write(CATEGORY, FACADE_MODE, MODE_OFF);
        } catch (Throwable ignored) {
            // The caller still receives a failure and must treat the state as unknown.
        }
    }

    public Snapshot loadValidated() throws ConfigException {
        if (configManager == null) {
            throw new ConfigException("A8 configuration service is unavailable");
        }
        if (!isViewEnabled()) {
            throw new ConfigException("FileZ facade is disabled");
        }

        boolean newCategoryPresent =
                has(CATEGORY, FILEZ_URL)
                || has(CATEGORY, OA_URL)
                || has(CATEGORY, REPO_ID)
                || has(CATEGORY, SECRET);

        String category = newCategoryPresent ? CATEGORY : LEGACY_CATEGORY;

        String filezBaseUrl = validateBaseUrl(read(category, FILEZ_URL), "FileZ URL");
        String oaPublicBaseUrl = validateBaseUrl(read(category, OA_URL), "OA public URL");
        String repoId = requireSimple(read(category, REPO_ID), "FileZ repository id", 128);
        String secret = requireNonBlank(read(category, SECRET), "FileZ HMAC secret", 4096);

        int wrapperTtl = parseBoundedInt(
                read(CATEGORY, WRAPPER_TTL),
                DEFAULT_WRAPPER_TTL_SECONDS, 15, 120);
        int contentTtl = parseBoundedInt(
                read(CATEGORY, CONTENT_TTL),
                DEFAULT_CONTENT_TTL_SECONDS, 30, 600);
        int editTtl = parseBoundedInt(
                read(CATEGORY, EDIT_TTL),
                DEFAULT_EDIT_TTL_SECONDS, 300, 3600);
        long maxFileBytes = parseBoundedLong(
                read(CATEGORY, MAX_FILE_BYTES),
                DEFAULT_MAX_FILE_BYTES,
                1024L * 1024L,
                200L * 1024L * 1024L);

        return new Snapshot(
                filezBaseUrl,
                oaPublicBaseUrl,
                repoId,
                secret,
                wrapperTtl,
                contentTtl,
                editTtl,
                maxFileBytes,
                category);
    }

    private boolean has(String category, String key) {
        ConfigItem item = configManager.getConfigItem(category, key);
        return item != null && item.getConfigValue() != null
                && item.getConfigValue().trim().length() > 0;
    }

    private String read(String category, String key) {
        ConfigItem item = configManager.getConfigItem(category, key);
        return valueOf(item);
    }

    private static String valueOf(ConfigItem item) {
        return item == null || item.getConfigValue() == null
                ? "" : item.getConfigValue().trim();
    }

    private void write(String category, String key, String value) {
        ConfigItem item = configManager.getConfigItem(category, key);
        if (item == null) {
            configManager.addConfigItem(category, key, value);
        } else {
            item.setConfigValue(value);
            configManager.updateConfigItem(item);
        }
    }

    private static boolean isValidMode(String mode) {
        return MODE_OFF.equals(mode)
                || MODE_SHADOW.equals(mode)
                || MODE_VIEW.equals(mode)
                || MODE_EDIT.equals(mode);
    }

    private static String validateBaseUrl(String value, String label)
            throws ConfigException {
        String normalized = requireNonBlank(value, label, 2048);
        while (normalized.endsWith("/") && !normalized.endsWith("://")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        try {
            URI uri = new URI(normalized);
            String scheme = uri.getScheme();
            if ((!"http".equalsIgnoreCase(scheme)
                    && !"https".equalsIgnoreCase(scheme))
                    || uri.getHost() == null
                    || uri.getHost().trim().length() == 0
                    || uri.getRawUserInfo() != null
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null) {
                throw new ConfigException(label + " must be a plain http/https base URL");
            }
            return normalized;
        } catch (ConfigException e) {
            throw e;
        } catch (Exception e) {
            throw new ConfigException(label + " is invalid");
        }
    }

    private static String requireSimple(String value, String label, int maxLength)
            throws ConfigException {
        String result = requireNonBlank(value, label, maxLength);
        if (!result.matches("[A-Za-z0-9._-]+")) {
            throw new ConfigException(label + " contains unsupported characters");
        }
        return result;
    }

    private static String requireNonBlank(String value, String label, int maxLength)
            throws ConfigException {
        String result = value == null ? "" : value.trim();
        if (result.length() == 0) {
            throw new ConfigException(label + " is missing");
        }
        if (result.length() > maxLength) {
            throw new ConfigException(label + " is too long");
        }
        return result;
    }

    private static int parseBoundedInt(
            String value, int fallback, int minimum, int maximum)
            throws ConfigException {
        if (value == null || value.trim().length() == 0) {
            return fallback;
        }
        try {
            int result = Integer.parseInt(value.trim());
            if (result < minimum || result > maximum) {
                throw new ConfigException("FileZ TTL is outside the allowed range");
            }
            return result;
        } catch (NumberFormatException e) {
            throw new ConfigException("FileZ TTL is invalid");
        }
    }

    private static long parseBoundedLong(
            String value, long fallback, long minimum, long maximum)
            throws ConfigException {
        if (value == null || value.trim().length() == 0) {
            return fallback;
        }
        try {
            long result = Long.parseLong(value.trim());
            if (result < minimum || result > maximum) {
                throw new ConfigException("FileZ file-size limit is outside the allowed range");
            }
            return result;
        } catch (NumberFormatException e) {
            throw new ConfigException("FileZ file-size limit is invalid");
        }
    }

    public static final class Snapshot {
        private final String filezBaseUrl;
        private final String oaPublicBaseUrl;
        private final String repoId;
        private final String secret;
        private final int wrapperTicketTtlSeconds;
        private final int contentTokenTtlSeconds;
        private final int editTokenTtlSeconds;
        private final long maxFileBytes;
        private final String sourceCategory;

        private Snapshot(
                String filezBaseUrl,
                String oaPublicBaseUrl,
                String repoId,
                String secret,
                int wrapperTicketTtlSeconds,
                int contentTokenTtlSeconds,
                int editTokenTtlSeconds,
                long maxFileBytes,
                String sourceCategory) {
            this.filezBaseUrl = filezBaseUrl;
            this.oaPublicBaseUrl = oaPublicBaseUrl;
            this.repoId = repoId;
            this.secret = secret;
            this.wrapperTicketTtlSeconds = wrapperTicketTtlSeconds;
            this.contentTokenTtlSeconds = contentTokenTtlSeconds;
            this.editTokenTtlSeconds = editTokenTtlSeconds;
            this.maxFileBytes = maxFileBytes;
            this.sourceCategory = sourceCategory;
        }

        public String getFilezBaseUrl() {
            return filezBaseUrl;
        }

        public String getOaPublicBaseUrl() {
            return oaPublicBaseUrl;
        }

        public String getRepoId() {
            return repoId;
        }

        public String getSecret() {
            return secret;
        }

        public int getWrapperTicketTtlSeconds() {
            return wrapperTicketTtlSeconds;
        }

        public int getContentTokenTtlSeconds() {
            return contentTokenTtlSeconds;
        }

        public int getEditTokenTtlSeconds() {
            return editTokenTtlSeconds;
        }

        public long getMaxFileBytes() {
            return maxFileBytes;
        }

        public String getSourceCategory() {
            return sourceCategory;
        }

        public String getFilezOrigin() throws ConfigException {
            try {
                URI uri = new URI(filezBaseUrl);
                int port = uri.getPort();
                StringBuilder result = new StringBuilder();
                result.append(uri.getScheme()).append("://").append(uri.getHost());
                if (port >= 0) {
                    result.append(':').append(port);
                }
                return result.toString();
            } catch (Exception e) {
                throw new ConfigException("FileZ URL origin is invalid");
            }
        }

        public String buildDownloadUrl(String contextPath) throws ConfigException {
            String context = contextPath == null ? "" : contextPath.trim();
            if (context.length() > 0 && !context.startsWith("/")) {
                context = "/" + context;
            }
            while (context.endsWith("/") && context.length() > 1) {
                context = context.substring(0, context.length() - 1);
            }

            String base = oaPublicBaseUrl;
            try {
                URI uri = new URI(base);
                String path = uri.getPath();
                String normalizedPath = path == null ? "" : path;
                while (normalizedPath.endsWith("/") && normalizedPath.length() > 1) {
                    normalizedPath =
                            normalizedPath.substring(0, normalizedPath.length() - 1);
                }
                if (context.length() > 0
                        && !normalizedPath.equals(context)
                        && !normalizedPath.endsWith(context)) {
                    base += context;
                }
                return base + "/ruianFileZContent.do";
            } catch (Exception e) {
                throw new ConfigException("OA public URL cannot form a download URL");
            }
        }

        public String buildEditUploadUrl(String contextPath) throws ConfigException {
            String downloadUrl = buildDownloadUrl(contextPath);
            int slash = downloadUrl.lastIndexOf('/');
            if (slash < 0) {
                throw new ConfigException("OA public URL cannot form an upload URL");
            }
            return downloadUrl.substring(0, slash + 1)
                    + "ruianFileZEditContent.do";
        }
    }

    /**
     * Sanitized policy value suitable for an administrator response. It never
     * contains connection details or secrets.
     */
    public static final class FacadePolicy {
        private final boolean enabled;
        private final String mode;

        private FacadePolicy(boolean enabled, String mode) {
            this.enabled = enabled;
            this.mode = mode;
        }

        private static FacadePolicy off() {
            return new FacadePolicy(false, MODE_OFF);
        }

        private static FacadePolicy view() {
            return new FacadePolicy(true, MODE_VIEW);
        }

        public boolean isEnabled() {
            return enabled;
        }

        public String getMode() {
            return mode;
        }
    }

    public static final class ConfigException extends Exception {
        private static final long serialVersionUID = 1L;

        public ConfigException(String message) {
            super(message);
        }
    }
}
