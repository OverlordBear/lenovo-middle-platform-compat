package com.ruian.filez.facade.poc;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;

import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.po.config.ConfigItem;

/**
 * Small in-memory ConfigManager proxy shared by the Java smoke tests.
 */
public final class TestConfigManager {

    private TestConfigManager() {
    }

    public static ConfigManager create(
            final Map<String, String> values,
            final List<String> writes) {
        return create(values, writes, false);
    }

    public static ConfigManager create(
            final Map<String, String> values,
            final List<String> writes,
            final boolean failReads) {
        return create(values, writes, failReads, -1);
    }

    public static ConfigManager create(
            final Map<String, String> values,
            final List<String> writes,
            final boolean failReads,
            final int failOnWriteAttempt) {
        final int[] writeAttempts = new int[] { 0 };
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) {
                String name = method.getName();
                if ("getConfigItem".equals(name)
                        && args != null
                        && args.length == 2
                        && args[0] instanceof String
                        && args[1] instanceof String) {
                    if (failReads) {
                        throw new IllegalStateException("simulated read failure");
                    }
                    String category = (String) args[0];
                    String itemName = (String) args[1];
                    String value = values.get(key(category, itemName));
                    return value == null
                            ? null : item(category, itemName, value);
                }
                if ("addConfigItem".equals(name)
                        && args != null
                        && args.length == 3
                        && args[0] instanceof String) {
                    failWriteWhenRequested(
                            writeAttempts, failOnWriteAttempt);
                    String category = (String) args[0];
                    String itemName = (String) args[1];
                    String value = (String) args[2];
                    values.put(key(category, itemName), value);
                    noteWrite(writes, itemName, value);
                    return item(category, itemName, value);
                }
                if ("updateConfigItem".equals(name)
                        && args != null
                        && args.length == 1
                        && args[0] instanceof ConfigItem) {
                    failWriteWhenRequested(
                            writeAttempts, failOnWriteAttempt);
                    ConfigItem item = (ConfigItem) args[0];
                    values.put(
                            key(item.getConfigCategory(), item.getConfigItem()),
                            item.getConfigValue());
                    noteWrite(
                            writes,
                            item.getConfigItem(),
                            item.getConfigValue());
                    return null;
                }
                if ("getConfigValue".equals(name)
                        && args != null
                        && args.length == 2) {
                    return values.get(key((String) args[0], (String) args[1]));
                }
                if ("toString".equals(name)) {
                    return "TestConfigManager";
                }
                if ("hashCode".equals(name)) {
                    return Integer.valueOf(System.identityHashCode(proxy));
                }
                if ("equals".equals(name)) {
                    return Boolean.valueOf(proxy == args[0]);
                }
                return defaultValue(method.getReturnType());
            }
        };
        return (ConfigManager) Proxy.newProxyInstance(
                TestConfigManager.class.getClassLoader(),
                new Class<?>[] { ConfigManager.class },
                handler);
    }

    private static void failWriteWhenRequested(
            int[] writeAttempts, int failOnWriteAttempt) {
        writeAttempts[0]++;
        if (writeAttempts[0] == failOnWriteAttempt) {
            throw new IllegalStateException("simulated write failure");
        }
    }

    public static String key(String category, String item) {
        return category + "\u0000" + item;
    }

    private static ConfigItem item(
            String category, String itemName, String value) {
        ConfigItem item = new ConfigItem();
        item.setConfigCategory(category);
        item.setConfigItem(itemName);
        item.setConfigValue(value);
        return item;
    }

    private static void noteWrite(
            List<String> writes, String itemName, String value) {
        if (writes != null) {
            writes.add(itemName + "=" + value);
        }
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
}
