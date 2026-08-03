package com.ruian.filez.facade.poc.web;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.LinkedHashMap;
import java.util.Map;

import com.ruian.filez.facade.poc.TestConfigManager;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;

public final class FilezFacadePocGlobalJsExtendSmokeTest {

    public static void main(String[] args) {
        Map<String, String> values = new LinkedHashMap<String, String>();
        values.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.ENABLED),
                "true");
        values.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.FACADE_MODE),
                FilezRuntimeConfig.MODE_VIEW);
        FilezFacadePocGlobalJsExtend extension =
                new FilezFacadePocGlobalJsExtend(
                        TestConfigManager.create(values, null));
        HttpServletRequest request = requestWithContextPath("/seeyon");

        String pc = extension.getJsSegment(request);
        assertContains(
                pc,
                "/seeyon/apps_res/ruian-filez-facade-poc/bootstrap.js?v=0.6.1"
        );
        assertContains(pc, "GLOBAL_ENV_PC");
        assertContains(pc, "ruian-filez-facade-poc-bootstrap");
        assertContains(pc, "var mode='view'");
        assertContains(pc, "data-ruian-mode");

        String mobile = extension.getMBJsSegment(request);
        assertContains(mobile, "GLOBAL_ENV_MOBILE");
        assertContains(mobile, "var mode='off'");

        String noRequest = extension.getJsSegment(null);
        assertContains(
                noRequest,
                "/apps_res/ruian-filez-facade-poc/bootstrap.js?v=0.6.1"
        );

        assertMode(
                new LinkedHashMap<String, String>(),
                false,
                FilezRuntimeConfig.MODE_VIEW);

        Map<String, String> edit = new LinkedHashMap<String, String>();
        edit.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.ENABLED),
                "true");
        edit.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.FACADE_MODE),
                FilezRuntimeConfig.MODE_EDIT);
        assertMode(edit, false, FilezRuntimeConfig.MODE_EDIT);

        Map<String, String> enabledOnly =
                new LinkedHashMap<String, String>();
        enabledOnly.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.ENABLED),
                "true");
        assertFailClosed(enabledOnly, false);

        Map<String, String> modeOnly =
                new LinkedHashMap<String, String>();
        modeOnly.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.FACADE_MODE),
                FilezRuntimeConfig.MODE_VIEW);
        assertFailClosed(modeOnly, false);

        Map<String, String> invalid = new LinkedHashMap<String, String>();
        invalid.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.ENABLED),
                "TRUE");
        invalid.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.FACADE_MODE),
                "VIEW");
        assertFailClosed(invalid, false);
        assertFailClosed(new LinkedHashMap<String, String>(), true);

        System.out.println(
                "FilezFacadePocGlobalJsExtend smoke test passed."
        );
    }

    private static void assertFailClosed(
            Map<String, String> values, boolean failReads) {
        assertMode(values, failReads, FilezRuntimeConfig.MODE_OFF);
    }

    private static void assertMode(
            Map<String, String> values,
            boolean failReads,
            String expectedMode) {
        FilezFacadePocGlobalJsExtend extension =
                new FilezFacadePocGlobalJsExtend(
                        TestConfigManager.create(values, null, failReads));
        assertContains(
                extension.getJsSegment(requestWithContextPath("/seeyon")),
                "var mode='" + expectedMode + "'");
    }

    private static HttpServletRequest requestWithContextPath(
            final String contextPath
    ) {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                if ("getContextPath".equals(method.getName())) {
                    return contextPath;
                }
                Class<?> returnType = method.getReturnType();
                if (returnType == boolean.class) {
                    return false;
                }
                if (returnType == byte.class) {
                    return (byte) 0;
                }
                if (returnType == short.class) {
                    return (short) 0;
                }
                if (returnType == int.class) {
                    return 0;
                }
                if (returnType == long.class) {
                    return 0L;
                }
                if (returnType == float.class) {
                    return 0F;
                }
                if (returnType == double.class) {
                    return 0D;
                }
                if (returnType == char.class) {
                    return '\0';
                }
                return null;
            }
        };
        return (HttpServletRequest) Proxy.newProxyInstance(
                FilezFacadePocGlobalJsExtendSmokeTest.class.getClassLoader(),
                new Class<?>[]{HttpServletRequest.class},
                handler
        );
    }

    private static void assertContains(String actual, String expected) {
        if (actual == null || !actual.contains(expected)) {
            throw new AssertionError(
                    "Expected generated JavaScript to contain: " + expected
            );
        }
    }
}
