package com.seeyon.apps.eu.manager;

import java.util.Map;

import com.seeyon.ctp.util.FlipInfo;

public interface EuFileZManager {
	Map<String, Object> fileZInit(Map<String, Object> param);

	Map<String, Object> getRedStrings(Map<String, Object> param);

	FlipInfo getEdocDocTemplateList(FlipInfo fi, Map<String, Object> params);

	Map<String, Object> saveRed(Map<String, Object> param);

	Map<String, Object> edocPdf(Map<String, Object> param);

	//gjx-start：2026-07-14 清稿（接受正文全部修订）——提交任务 + 回调落盘 + 恢复清稿前备份
	Map<String, Object> edocClear(Map<String, Object> param);

	Map<String, Object> saveClear(Map<String, Object> param);

	Map<String, Object> edocClearRestore(Map<String, Object> param);
	//gjx-end

	Map<String, Object> savePdf(Map<String, Object> param);

	Map<String, Object> saveWater(Map<String, Object> param);

	Map<String, Object> createDefaultFile(Map<String, Object> param);

	Map<String, Object> getUrlById(Map<String, Object> param);

	Map<String, Object> isFileContentNotEmpty(Map<String, Object> param);
	Map<String, Object> checkPdfStatus(Map<String, Object> param);
}
