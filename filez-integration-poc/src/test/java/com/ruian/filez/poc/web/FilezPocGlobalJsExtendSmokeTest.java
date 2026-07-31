package com.ruian.filez.poc.web;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public final class FilezPocGlobalJsExtendSmokeTest {

    public static void main(String[] args) {
        FilezPocGlobalJsExtend extension = new FilezPocGlobalJsExtend();
        HttpServletRequest request = requestWithContextPath("/seeyon");

        String pc = extension.getJsSegment(request);
        assertContains(pc, "/seeyon/apps_res/ruian-filez-poc/bootstrap.js?v=0.1.0");
        assertContains(pc, "GLOBAL_ENV_PC");
        assertContains(pc, "ruian-filez-poc-bootstrap");

        String mobile = extension.getMBJsSegment(request);
        assertContains(mobile, "GLOBAL_ENV_MOBILE");

        String noRequest = extension.getJsSegment(null);
        assertContains(noRequest, "/apps_res/ruian-filez-poc/bootstrap.js?v=0.1.0");

        if (pc.contains("window.OfficeSDK=") || pc.contains("w.OfficeSDK=")) {
            throw new AssertionError("The bootstrap must not replace OfficeSDK.");
        }

        System.out.println("FilezPocGlobalJsExtend smoke test passed.");
    }

    private static HttpServletRequest requestWithContextPath(final String contextPath) {
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
                FilezPocGlobalJsExtendSmokeTest.class.getClassLoader(),
                new Class<?>[]{HttpServletRequest.class},
                handler
        );
    }

    private static void assertContains(String actual, String expected) {
        if (actual == null || !actual.contains(expected)) {
            throw new AssertionError("Expected generated JavaScript to contain: " + expected);
        }
    }
}
