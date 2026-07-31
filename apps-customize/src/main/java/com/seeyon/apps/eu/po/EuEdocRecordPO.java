package com.seeyon.apps.eu.po;

import com.seeyon.ctp.common.po.BasePO;

public class EuEdocRecordPO extends BasePO{
    private static final long serialVersionUID = -7984802369236419931L;

    private Long oldFileId;
    private Long newFileId;
    private String taskId;
	public Long getOldFileId() {
		return oldFileId;
	}
	public void setOldFileId(Long oldFileId) {
		this.oldFileId = oldFileId;
	}
	public Long getNewFileId() {
		return newFileId;
	}
	public void setNewFileId(Long newFileId) {
		this.newFileId = newFileId;
	}
	public String getTaskId() {
		return taskId;
	}
	public void setTaskId(String taskId) {
		this.taskId = taskId;
	}
}
