package com.ruian.filez.facade.poc;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.ConfigException;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.FacadePolicy;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.Snapshot;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker.Result;
import com.ruian.filez.facade.poc.file.LegacyBodyUnpacker.UnpackException;
import com.ruian.filez.facade.poc.filez.DriverUrlBuilder;
import com.ruian.filez.facade.poc.manager.RuianFileZViewManager;
import com.ruian.filez.facade.poc.security.FilezCrypto;
import com.ruian.filez.facade.poc.service.FilezCapabilityService;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.FileBinding;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.Grant;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.IssuedCapability;
import com.ruian.filez.facade.poc.web.FilezContentController;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.filemanager.manager.FileManager;

/**
 * Pure-Java smoke tests for security-sensitive facade primitives.
 */
public final class FilezCoreSmokeTest {

    private FilezCoreSmokeTest() {
    }

    public static void main(String[] args) throws Exception {
        testCrypto();
        testCapabilities();
        testViewTicketBindingAndExpiry();
        testDriverCallbackUrlContract();
        testLegacyBodyUnpacking();
        testQuerylessDownloadEntryPoint();
        testServerAuthoritativePolicy();
        testPolicyAdministrationSecurity();
        testContentPolicyRecheck();
        System.out.println("FileZ core smoke tests passed.");
    }

    private static void testCrypto() {
        assertEquals(
                "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8",
                FilezCrypto.hmacSha256Hex(
                        "key", "The quick brown fox jumps over the lazy dog"),
                "HMAC-SHA256 known vector");
        assertTrue(
                FilezCrypto.constantTimeEquals("same-value", "same-value"),
                "constant-time equality accepts equal input");
        assertFalse(
                FilezCrypto.constantTimeEquals("same-value", "different"),
                "constant-time equality rejects different input");
        assertFalse(
                FilezCrypto.constantTimeEquals(null, "different"),
                "constant-time equality rejects null input");
    }

    private static void testCapabilities() throws Exception {
        FilezCapabilityService service = new FilezCapabilityService();
        FileBinding binding = binding();

        IssuedCapability wrapper = service.issueWrapper(
                binding, 42L, "session-a", "nonce-a", 30);
        assertTrue(
                wrapper.getToken().matches("[A-Za-z0-9_-]{43}"),
                "capability is an opaque 256-bit base64url value");
        assertNull(
                service.consumeContent(wrapper.getToken()),
                "wrapper capability cannot be used as content capability");

        Grant wrapperGrant = service.consumeWrapper(wrapper.getToken(), 42L);
        assertNotNull(wrapperGrant, "correct user consumes wrapper capability");
        assertNull(
                service.consumeWrapper(wrapper.getToken(), 42L),
                "wrapper capability is one-use");

        IssuedCapability content = service.issueContent(wrapperGrant, 30);
        assertNull(
                service.consumeWrapper(content.getToken(), 42L),
                "content capability cannot be used as wrapper capability");
        assertNotNull(
                service.consumeContent(content.getToken()),
                "content capability use one succeeds");
        assertNotNull(
                service.consumeContent(content.getToken()),
                "content capability use two succeeds");
        assertNotNull(
                service.consumeContent(content.getToken()),
                "content capability use three succeeds");
        assertNull(
                service.consumeContent(content.getToken()),
                "content capability is rejected after its usage budget");
        assertNull(
                service.consumeContent(
                        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
                "unknown well-formed capability is rejected");
    }

    private static void testViewTicketBindingAndExpiry() throws Exception {
        FilezCapabilityService service = new FilezCapabilityService();
        FileBinding binding = binding();

        IssuedCapability wrongUserTicket = service.issueWrapper(
                binding, 42L, "session-user", "nonce-user", 30);
        assertNull(
                service.consumeWrapper(wrongUserTicket.getToken(), 43L),
                "view ticket is bound to the authenticated user");
        assertNotNull(
                service.consumeWrapper(wrongUserTicket.getToken(), 42L),
                "a wrong-user probe must not consume the bound view ticket");

        IssuedCapability correctUserTicket = service.issueWrapper(
                binding, 42L, "session-correct", "nonce-correct", 30);
        Grant grant =
                service.consumeWrapper(correctUserTicket.getToken(), 42L);
        assertNotNull(grant, "bound user can consume view ticket");
        assertEquals(
                "session-correct",
                grant.getSessionId(),
                "view ticket preserves session id");
        assertEquals(
                "nonce-correct",
                grant.getNonce(),
                "view ticket preserves postMessage nonce");

        IssuedCapability expiringTicket = service.issueWrapper(
                binding, 42L, "session-expired", "nonce-expired", 1);
        Thread.sleep(1200L);
        assertNull(
                service.consumeWrapper(expiringTicket.getToken(), 42L),
                "expired view ticket is rejected");
    }

    private static void testDriverCallbackUrlContract() throws Exception {
        Constructor<Snapshot> constructor = Snapshot.class.getDeclaredConstructor(
                String.class,
                String.class,
                String.class,
                String.class,
                int.class,
                int.class,
                long.class,
                String.class);
        constructor.setAccessible(true);
        Snapshot config = constructor.newInstance(
                "http://filez.test:8001",
                "http://oa.test",
                "OA2",
                "unit-test-secret",
                120,
                120,
                1024L * 1024L,
                "unit-test");

        String driverUrl = new DriverUrlBuilder().buildViewUrl(
                config,
                binding(),
                42L,
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                "http://oa.test/seeyon/ruianFileZContent.do");

        assertTrue(
                driverUrl.contains(
                        "&downloadUrl=http://oa.test/seeyon/"
                        + "ruianFileZContent.do&uploadUrl=&params="),
                "FileZ callback URL stays plain, queryless, and precedes params");
    }

    private static void testLegacyBodyUnpacking() throws Exception {
        LegacyBodyUnpacker unpacker = new LegacyBodyUnpacker();

        byte[] docx = zip(
                new String[] { "[Content_Types].xml", "word/document.xml" },
                new byte[][] {
                    "<?xml version=\"1.0\"?><Types/>".getBytes("UTF-8"),
                    "<w:document/>".getBytes("UTF-8")
                });
        Result docxResult = unpacker.unpack(
                new ByteArrayInputStream(docx),
                docx.length,
                1024L * 1024L,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        assertFalse(
                docxResult.isTransformed(),
                "standard multi-entry DOCX is not peeled");
        assertArrayEquals(docx, docxResult.getBytes(), "standard DOCX bytes");

        byte[] ole = new byte[] {
                (byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0,
                (byte) 0xa1, (byte) 0xb1, 0x1a, (byte) 0xe1
        };
        Result rawOleResult = unpacker.unpack(
                new ByteArrayInputStream(ole),
                ole.length,
                1024L,
                "application/msword");
        assertFalse(rawOleResult.isTransformed(), "raw OLE is passed through");
        assertArrayEquals(ole, rawOleResult.getBytes(), "raw OLE bytes");

        byte[] wrappedOle = zip(
                new String[] { "body.bin" },
                new byte[][] { ole });
        Result wrappedResult = unpacker.unpack(
                new ByteArrayInputStream(wrappedOle),
                wrappedOle.length,
                1024L,
                "application/octet-stream");
        assertTrue(
                wrappedResult.isTransformed(),
                "single-entry A8 ZIP wrapper is peeled");
        assertArrayEquals(ole, wrappedResult.getBytes(), "wrapped OLE bytes");
        assertEquals(
                ".doc",
                wrappedResult.getSuggestedExtension(),
                "wrapped OLE output extension");

        boolean bounded = false;
        try {
            unpacker.unpack(
                    new ByteArrayInputStream(new byte[9]),
                    -1L,
                    8L,
                    "application/octet-stream");
        } catch (UnpackException expected) {
            bounded = true;
        }
        assertTrue(bounded, "input exceeding the configured bound is rejected");
    }

    private static void testQuerylessDownloadEntryPoint() throws Exception {
        assertEquals(
                FilezContentController.class,
                FilezContentController.class.getDeclaredMethod(
                        "index",
                        HttpServletRequest.class,
                        HttpServletResponse.class).getDeclaringClass(),
                "queryless FileZ callback resolves to the plugin index method");
    }

    private static void testServerAuthoritativePolicy() throws Exception {
        Map<String, String> values = new LinkedHashMap<String, String>();
        List<String> writes = new ArrayList<String>();
        putConnection(values, FilezRuntimeConfig.LEGACY_CATEGORY);

        FilezRuntimeConfig runtime = new FilezRuntimeConfig();
        runtime.setConfigManager(TestConfigManager.create(values, writes));

        assertEquals(
                FilezRuntimeConfig.MODE_OFF,
                runtime.getEffectiveFacadeMode(),
                "legacy connection values cannot enable the facade");
        assertLoadRejected(
                runtime,
                "legacy connection values alone are rejected");

        putPolicy(values, "true", FilezRuntimeConfig.MODE_VIEW);
        Snapshot legacy = runtime.loadValidated();
        assertEquals(
                FilezRuntimeConfig.LEGACY_CATEGORY,
                legacy.getSourceCategory(),
                "policy-only new category still uses legacy connections");

        putPolicy(values, "TRUE", FilezRuntimeConfig.MODE_VIEW);
        assertEquals(
                FilezRuntimeConfig.MODE_OFF,
                runtime.getEffectiveFacadeMode(),
                "enabled must be the exact lowercase value true");

        putPolicy(values, "true", "VIEW");
        assertEquals(
                FilezRuntimeConfig.MODE_OFF,
                runtime.getEffectiveFacadeMode(),
                "mode must be an exact canonical lowercase value");

        putPolicy(values, "true", FilezRuntimeConfig.MODE_SHADOW);
        FacadePolicy shadow = runtime.loadFacadePolicy();
        assertTrue(shadow.isEnabled(), "valid shadow policy is observable");
        assertEquals(
                FilezRuntimeConfig.MODE_SHADOW,
                shadow.getMode(),
                "valid shadow policy is preserved");
        assertLoadRejected(
                runtime,
                "shadow does not authorize server-side view operations");

        putPolicy(values, "true", FilezRuntimeConfig.MODE_OFF);
        assertLoadRejected(
                runtime,
                "off does not authorize server-side view operations");

        FilezRuntimeConfig failedReads = new FilezRuntimeConfig();
        failedReads.setConfigManager(
                TestConfigManager.create(
                        new LinkedHashMap<String, String>(),
                        null,
                        true));
        assertEquals(
                FilezRuntimeConfig.MODE_OFF,
                failedReads.getEffectiveFacadeMode(),
                "configuration exceptions fail closed");

        writes.clear();
        runtime.updateFacadePolicy(true, FilezRuntimeConfig.MODE_VIEW);
        assertEquals(
                Arrays.asList(
                        "filez.enabled=false",
                        "filez.facadeMode=view",
                        "filez.enabled=true"),
                writes,
                "enabling first disables, then writes mode, then enables");

        writes.clear();
        runtime.updateFacadePolicy(false, FilezRuntimeConfig.MODE_SHADOW);
        assertEquals(
                Arrays.asList(
                        "filez.enabled=false",
                        "filez.facadeMode=off"),
                writes,
                "disabling writes enabled=false before mode=off");

        Map<String, String> partialWriteValues =
                new LinkedHashMap<String, String>();
        putPolicy(
                partialWriteValues,
                "true",
                FilezRuntimeConfig.MODE_SHADOW);
        FilezRuntimeConfig partialWriteRuntime = new FilezRuntimeConfig();
        partialWriteRuntime.setConfigManager(
                TestConfigManager.create(
                        partialWriteValues,
                        null,
                        false,
                        3));
        try {
            partialWriteRuntime.updateFacadePolicy(
                    true, FilezRuntimeConfig.MODE_VIEW);
            throw new AssertionError(
                    "partial elevation must report a configuration failure");
        } catch (ConfigException expected) {
            assertEquals(
                    FilezRuntimeConfig.MODE_OFF,
                    partialWriteRuntime.getEffectiveFacadeMode(),
                    "partial elevation is forced back to off");
        }

        putPolicy(values, "true", FilezRuntimeConfig.MODE_VIEW);
        values.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY, "filez.fileZurl"),
                "http://new-filez.test");
        assertLoadRejected(
                runtime,
                "one new connection key selects the new category and fails incomplete");
    }

    private static void testPolicyAdministrationSecurity() throws Exception {
        Map<String, String> values = new LinkedHashMap<String, String>();
        List<String> writes = new ArrayList<String>();
        ConfigManager configManager =
                TestConfigManager.create(values, writes);
        TestPolicyManager manager = new TestPolicyManager();
        manager.setConfigManager(configManager);

        manager.setRequest(request(
                "GET", "http://oa.test", "oa.test", 80, null));
        manager.setUser(systemAdmin());
        assertEquals(
                "METHOD_NOT_ALLOWED",
                resultCode(manager.getFacadePolicy(null)),
                "policy reads require POST");

        manager.setRequest(request(
                "POST", "http://evil.test", "oa.test", 80, null));
        assertEquals(
                "FORBIDDEN",
                resultCode(manager.getFacadePolicy(null)),
                "cross-origin policy reads are rejected");

        manager.setRequest(request(
                "POST", "http://oa.test", "oa.test", 80, null));
        manager.setUser(null);
        assertEquals(
                "AUTH_REQUIRED",
                resultCode(manager.getFacadePolicy(null)),
                "policy reads require authentication");

        manager.setUser(nonSystemAdmin());
        assertEquals(
                "FORBIDDEN",
                resultCode(manager.getFacadePolicy(null)),
                "policy reads require a system administrator");

        manager.setUser(systemAdmin());
        Map<String, Object> invalid = new LinkedHashMap<String, Object>();
        invalid.put("enabled", Boolean.TRUE);
        invalid.put("mode", "VIEW");
        writes.clear();
        assertEquals(
                "INVALID_ARGUMENT",
                resultCode(manager.setFacadePolicy(invalid)),
                "invalid policy values are rejected");
        assertTrue(writes.isEmpty(), "invalid policy values are not persisted");

        Map<String, Object> enable = new LinkedHashMap<String, Object>();
        enable.put("enabled", Boolean.TRUE);
        enable.put("mode", FilezRuntimeConfig.MODE_VIEW);
        Map<String, Object> enabled = manager.setFacadePolicy(enable);
        assertEquals("OK", resultCode(enabled), "admin can enable view");
        assertFalse(
                enabled.toString().toLowerCase().contains("secret"),
                "policy response never exposes secrets");

        Map<String, Object> read = manager.getFacadePolicy(null);
        assertEquals("OK", resultCode(read), "admin can read policy");
        Map<?, ?> data = (Map<?, ?>) read.get("data");
        assertEquals(Boolean.TRUE, data.get("enabled"), "enabled response");
        assertEquals(
                FilezRuntimeConfig.MODE_VIEW,
                data.get("mode"),
                "mode response");

        Map<String, Object> disable = new LinkedHashMap<String, Object>();
        disable.put("enabled", Boolean.FALSE);
        disable.put("mode", FilezRuntimeConfig.MODE_VIEW);
        writes.clear();
        assertEquals(
                "OK",
                resultCode(manager.setFacadePolicy(disable)),
                "admin can disable facade");
        assertEquals(
                Arrays.asList(
                        "filez.enabled=false",
                        "filez.facadeMode=off"),
                writes,
                "admin disable follows fail-closed write order");
    }

    private static void testContentPolicyRecheck() {
        Map<String, String> values = new LinkedHashMap<String, String>();
        putPolicy(values, "false", FilezRuntimeConfig.MODE_OFF);
        ConfigManager configManager =
                TestConfigManager.create(values, null);

        CountingCapabilityService capabilities =
                new CountingCapabilityService();
        FilezContentController controller = new FilezContentController();
        controller.setConfigManager(configManager);
        controller.setRuianFileZCapabilityService(capabilities);
        controller.setFileManager(fileManagerProxy());

        HttpServletRequest request = request(
                "GET",
                null,
                "oa.test",
                80,
                "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        int[] status = new int[] { 0 };
        controller.download(request, response(status));
        assertEquals(
                Integer.valueOf(HttpServletResponse.SC_FORBIDDEN),
                Integer.valueOf(status[0]),
                "content is denied while view policy is off");
        assertEquals(
                Integer.valueOf(0),
                Integer.valueOf(capabilities.consumeCalls),
                "off policy is checked before an existing token is consumed");

        putPolicy(values, "true", FilezRuntimeConfig.MODE_VIEW);
        status[0] = 0;
        controller.download(request, response(status));
        assertEquals(
                Integer.valueOf(1),
                Integer.valueOf(capabilities.consumeCalls),
                "view policy permits capability consumption");
        assertEquals(
                Integer.valueOf(HttpServletResponse.SC_FORBIDDEN),
                Integer.valueOf(status[0]),
                "the counting service's unknown token remains rejected");
    }

    private static void assertLoadRejected(
            FilezRuntimeConfig runtime, String label) {
        boolean rejected = false;
        try {
            runtime.loadValidated();
        } catch (ConfigException expected) {
            rejected = true;
        }
        assertTrue(rejected, label);
    }

    private static void putPolicy(
            Map<String, String> values, String enabled, String mode) {
        values.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.ENABLED),
                enabled);
        values.put(
                TestConfigManager.key(
                        FilezRuntimeConfig.CATEGORY,
                        FilezRuntimeConfig.FACADE_MODE),
                mode);
    }

    private static void putConnection(
            Map<String, String> values, String category) {
        values.put(
                TestConfigManager.key(category, "filez.fileZurl"),
                "http://filez.test:8001");
        values.put(
                TestConfigManager.key(category, "filez.oaUrl"),
                "http://oa.test");
        values.put(
                TestConfigManager.key(category, "filez.repoId"),
                "OA2");
        values.put(
                TestConfigManager.key(category, "filez.secret"),
                "unit-test-secret");
    }

    private static String resultCode(Map<String, Object> result) {
        return result == null ? null : (String) result.get("code");
    }

    private static User systemAdmin() {
        return new User() {
            private static final long serialVersionUID = 1L;

            @Override
            public boolean isSystemAdmin() {
                return true;
            }
        };
    }

    private static User nonSystemAdmin() {
        return new User() {
            private static final long serialVersionUID = 1L;

            @Override
            public boolean isSystemAdmin() {
                return false;
            }
        };
    }

    private static HttpServletRequest request(
            final String method,
            final String origin,
            final String serverName,
            final int serverPort,
            final String token) {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method called, Object[] args) {
                String name = called.getName();
                if ("getMethod".equals(name)) {
                    return method;
                }
                if ("getScheme".equals(name)) {
                    return "http";
                }
                if ("getServerName".equals(name)) {
                    return serverName;
                }
                if ("getServerPort".equals(name)) {
                    return Integer.valueOf(serverPort);
                }
                if ("getContextPath".equals(name)) {
                    return "/seeyon";
                }
                if ("getHeader".equals(name) && args != null) {
                    if ("Origin".equalsIgnoreCase(String.valueOf(args[0]))) {
                        return origin;
                    }
                    if ("x-ruian-filez-token".equalsIgnoreCase(
                            String.valueOf(args[0]))) {
                        return token;
                    }
                }
                return defaultValue(called.getReturnType());
            }
        };
        return (HttpServletRequest) Proxy.newProxyInstance(
                FilezCoreSmokeTest.class.getClassLoader(),
                new Class<?>[] { HttpServletRequest.class },
                handler);
    }

    private static HttpServletResponse response(final int[] status) {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method called, Object[] args) {
                if ("setStatus".equals(called.getName())
                        && args != null
                        && args.length > 0) {
                    status[0] = ((Integer) args[0]).intValue();
                    return null;
                }
                if ("isCommitted".equals(called.getName())) {
                    return Boolean.FALSE;
                }
                return defaultValue(called.getReturnType());
            }
        };
        return (HttpServletResponse) Proxy.newProxyInstance(
                FilezCoreSmokeTest.class.getClassLoader(),
                new Class<?>[] { HttpServletResponse.class },
                handler);
    }

    private static FileManager fileManagerProxy() {
        return (FileManager) Proxy.newProxyInstance(
                FilezCoreSmokeTest.class.getClassLoader(),
                new Class<?>[] { FileManager.class },
                new InvocationHandler() {
                    @Override
                    public Object invoke(
                            Object proxy, Method called, Object[] args) {
                        return defaultValue(called.getReturnType());
                    }
                });
    }

    private static Object defaultValue(Class<?> type) {
        if (!type.isPrimitive()) {
            return null;
        }
        if (type == boolean.class) {
            return Boolean.FALSE;
        }
        if (type == byte.class) {
            return Byte.valueOf((byte) 0);
        }
        if (type == short.class) {
            return Short.valueOf((short) 0);
        }
        if (type == int.class) {
            return Integer.valueOf(0);
        }
        if (type == long.class) {
            return Long.valueOf(0L);
        }
        if (type == float.class) {
            return Float.valueOf(0F);
        }
        if (type == double.class) {
            return Double.valueOf(0D);
        }
        if (type == char.class) {
            return Character.valueOf('\0');
        }
        return null;
    }

    private static final class TestPolicyManager
            extends RuianFileZViewManager {
        private HttpServletRequest request;
        private User user;

        private void setRequest(HttpServletRequest request) {
            this.request = request;
        }

        private void setUser(User user) {
            this.user = user;
        }

        @Override
        protected HttpServletRequest currentRequest() {
            return request;
        }

        @Override
        protected User currentUser() {
            return user;
        }
    }

    private static final class CountingCapabilityService
            extends FilezCapabilityService {
        private int consumeCalls;

        @Override
        public Grant consumeContent(String rawToken) {
            consumeCalls++;
            return null;
        }
    }

    private static FileBinding binding() {
        return new FileBinding(
                -11L,
                -22L,
                -33L,
                "document.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "41",
                new Date(1000L),
                new Date(2000L),
                1024L * 1024L,
                "Test User",
                "test.user");
    }

    private static byte[] zip(String[] names, byte[][] values)
            throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(bytes);
        try {
            for (int i = 0; i < names.length; i++) {
                zip.putNextEntry(new ZipEntry(names[i]));
                zip.write(values[i]);
                zip.closeEntry();
            }
        } finally {
            zip.close();
        }
        return bytes.toByteArray();
    }

    private static void assertTrue(boolean condition, String label) {
        if (!condition) {
            throw new AssertionError(label);
        }
    }

    private static void assertFalse(boolean condition, String label) {
        assertTrue(!condition, label);
    }

    private static void assertNull(Object value, String label) {
        assertTrue(value == null, label);
    }

    private static void assertNotNull(Object value, String label) {
        assertTrue(value != null, label);
    }

    private static void assertEquals(
            Object expected, Object actual, String label) {
        if (expected == null ? actual != null : !expected.equals(actual)) {
            throw new AssertionError(
                    label + ": expected=" + expected + ", actual=" + actual);
        }
    }

    private static void assertArrayEquals(
            byte[] expected, byte[] actual, String label) {
        if (!Arrays.equals(expected, actual)) {
            throw new AssertionError(label);
        }
    }
}
