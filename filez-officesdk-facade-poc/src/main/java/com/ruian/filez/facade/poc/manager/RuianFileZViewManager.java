package com.ruian.filez.facade.poc.manager;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.ConfigException;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.FacadePolicy;
import com.ruian.filez.facade.poc.service.FilezViewSessionService;
import com.ruian.filez.facade.poc.service.FilezViewSessionService.CreateResult;
import com.ruian.filez.facade.poc.service.FilezViewSessionService.FacadeException;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.util.annotation.AjaxAccess;

/**
 * Narrow AJAX surface used by the browser facade.
 */
public class RuianFileZViewManager {

    private static final Log LOG =
            LogFactory.getLog(RuianFileZViewManager.class);
    private static final String CODE_INVALID_ARGUMENT = "INVALID_ARGUMENT";

    private final FilezRuntimeConfig runtimeConfig = new FilezRuntimeConfig();
    private FilezViewSessionService ruianFileZViewSessionService;

    @AjaxAccess
    public Map<String, Object> createViewSession(Map<String, Object> parameters) {
        HttpServletRequest request = currentRequest();
        if (request == null || !"POST".equalsIgnoreCase(request.getMethod())) {
            return failure(
                    FilezViewSessionService.CODE_METHOD_NOT_ALLOWED,
                    "Read-only session creation requires POST");
        }
        if (!isSameOriginWhenPresent(request)) {
            return failure(
                    FilezViewSessionService.CODE_FORBIDDEN,
                    "Request origin is not allowed");
        }
        if (ruianFileZViewSessionService == null) {
            return failure(
                    FilezViewSessionService.CODE_INTERNAL,
                    "FileZ read-only facade is not initialized");
        }

        try {
            User user = currentUser();
            CreateResult created =
                    ruianFileZViewSessionService.createViewSession(
                            parameters, user, request.getContextPath());
            Map<String, Object> data = new LinkedHashMap<String, Object>();
            data.put("viewUrl", created.getViewUrl());
            data.put("sessionId", created.getSessionId());
            data.put("expiresAt", Long.valueOf(created.getExpiresAt()));
            data.put("readyProtocol", "postMessage-v1");
            data.put("nonce", created.getNonce());

            Map<String, Object> result = new LinkedHashMap<String, Object>();
            result.put("success", Boolean.TRUE);
            result.put("code", "OK");
            result.put("data", data);
            return result;
        } catch (FacadeException e) {
            LOG.warn("FileZ view session rejected: " + e.getCode());
            return failure(e.getCode(), e.getMessage());
        } catch (Throwable e) {
            LOG.error("FileZ view session failed", e);
            return failure(
                    FilezViewSessionService.CODE_INTERNAL,
                    "Unable to create FileZ read-only session");
        }
    }

    /**
     * Returns only the effective policy. Connection parameters and secrets
     * are intentionally outside this administration API.
     */
    @AjaxAccess
    public Map<String, Object> getFacadePolicy(
            Map<String, Object> parameters) {
        Map<String, Object> denied = policyAccessFailure();
        if (denied != null) {
            return denied;
        }
        return policySuccess(runtimeConfig.loadFacadePolicy());
    }

    /**
     * Changes the server-authoritative facade policy. Both reading and
     * writing use POST and require an authenticated A8 system administrator.
     */
    @AjaxAccess
    public Map<String, Object> setFacadePolicy(
            Map<String, Object> parameters) {
        Map<String, Object> denied = policyAccessFailure();
        if (denied != null) {
            return denied;
        }
        if (parameters == null
                || !(parameters.get("enabled") instanceof Boolean)
                || !(parameters.get("mode") instanceof String)) {
            return failure(
                    CODE_INVALID_ARGUMENT,
                    "enabled must be boolean and mode must be a canonical value");
        }

        boolean enabled =
                ((Boolean) parameters.get("enabled")).booleanValue();
        String mode = (String) parameters.get("mode");
        if (!FilezRuntimeConfig.MODE_OFF.equals(mode)
                && !FilezRuntimeConfig.MODE_SHADOW.equals(mode)
                && !FilezRuntimeConfig.MODE_VIEW.equals(mode)) {
            return failure(
                    CODE_INVALID_ARGUMENT,
                    "mode must be off, shadow, or view");
        }

        try {
            FacadePolicy policy =
                    runtimeConfig.updateFacadePolicy(enabled, mode);
            LOG.info(
                    "FileZ facade policy updated: enabled="
                    + policy.isEnabled()
                    + ", mode="
                    + policy.getMode());
            return policySuccess(policy);
        } catch (ConfigException e) {
            LOG.error("FileZ facade policy update failed");
            return failure(
                    FilezViewSessionService.CODE_INTERNAL,
                    "Unable to update FileZ facade policy");
        }
    }

    private Map<String, Object> policyAccessFailure() {
        HttpServletRequest request = currentRequest();
        if (request == null || !"POST".equalsIgnoreCase(request.getMethod())) {
            return failure(
                    FilezViewSessionService.CODE_METHOD_NOT_ALLOWED,
                    "Facade policy access requires POST");
        }
        if (!isSameOriginWhenPresent(request)) {
            return failure(
                    FilezViewSessionService.CODE_FORBIDDEN,
                    "Request origin is not allowed");
        }

        User user = currentUser();
        if (user == null) {
            return failure(
                    FilezViewSessionService.CODE_AUTH_REQUIRED,
                    "Authentication is required");
        }
        if (!user.isSystemAdmin()) {
            return failure(
                    FilezViewSessionService.CODE_FORBIDDEN,
                    "System administrator permission is required");
        }
        return null;
    }

    private static Map<String, Object> policySuccess(FacadePolicy policy) {
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("enabled", Boolean.valueOf(policy.isEnabled()));
        data.put("mode", policy.getMode());

        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("success", Boolean.TRUE);
        result.put("code", "OK");
        result.put("data", data);
        return result;
    }

    private static Map<String, Object> failure(String code, String message) {
        Map<String, Object> result = new LinkedHashMap<String, Object>();
        result.put("success", Boolean.FALSE);
        result.put("code", code);
        result.put("message", message);
        return result;
    }

    private static boolean isSameOriginWhenPresent(HttpServletRequest request) {
        String origin = request.getHeader("Origin");
        if (origin == null || origin.trim().length() == 0) {
            return true;
        }
        if ("null".equalsIgnoreCase(origin.trim())) {
            return false;
        }
        try {
            URI uri = new URI(origin.trim());
            int originPort = normalizedPort(uri.getScheme(), uri.getPort());
            int requestPort =
                    normalizedPort(request.getScheme(), request.getServerPort());
            return request.getScheme().equalsIgnoreCase(uri.getScheme())
                    && request.getServerName().equalsIgnoreCase(uri.getHost())
                    && originPort == requestPort
                    && (uri.getPath() == null || uri.getPath().length() == 0
                            || "/".equals(uri.getPath()))
                    && uri.getRawUserInfo() == null
                    && uri.getRawQuery() == null
                    && uri.getRawFragment() == null;
        } catch (Exception e) {
            return false;
        }
    }

    private static int normalizedPort(String scheme, int port) {
        if (port >= 0) {
            return port;
        }
        return "https".equalsIgnoreCase(scheme) ? 443 : 80;
    }

    public void setRuianFileZViewSessionService(
            FilezViewSessionService ruianFileZViewSessionService) {
        this.ruianFileZViewSessionService = ruianFileZViewSessionService;
    }

    public void setConfigManager(ConfigManager configManager) {
        runtimeConfig.setConfigManager(configManager);
    }

    /**
     * Seams kept protected so the security checks can be smoke-tested without
     * mutating A8's global thread context.
     */
    protected HttpServletRequest currentRequest() {
        return AppContext.getRawRequest();
    }

    protected User currentUser() {
        return AppContext.getCurrentUser();
    }
}
