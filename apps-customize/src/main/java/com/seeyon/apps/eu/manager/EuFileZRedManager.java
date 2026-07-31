package com.seeyon.apps.eu.manager;

import java.util.Map;

/**
 * FileZ公文套红专用管理器接口。
 *
 * @author gjx
 * @since 2026-06-12
 */
public interface EuFileZRedManager {

	/**
	 * 当前生效的套红入口：FileZ一次处理正文DOC参数和动态配置的TEXT字段参数。
	 * @param param 包含 id(模板ID) 和 affairId(公文事项ID)
	 * @return 包含 msg(结果消息) 和 debugArgs(调试信息)
	 */
	Map<String, Object> edocRedTest(Map<String, Object> param);
}
