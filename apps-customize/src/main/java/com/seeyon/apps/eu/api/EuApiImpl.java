package com.seeyon.apps.eu.api;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.seeyon.apps.eu.manager.EuFileZManager;

public class EuApiImpl implements EuApi{
	private final static Log log = LogFactory.getLog(EuApiImpl.class);
	private EuFileZManager euFileZManager;

	@Override
	public Map<String, Object> fileZInit(Map<String, Object> param) {
		return euFileZManager.fileZInit(param);
	}

	public void setEuFileZManager(EuFileZManager euFileZManager) {
		this.euFileZManager = euFileZManager;
	}
	
}

