package com.seeyon.ctp.rest.resources;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.seeyon.apps.eu.manager.EuFileZManager;
import com.seeyon.apps.euc.dao.SeeyonDao;
import com.seeyon.apps.euc.util.my.EuUtil;
import com.seeyon.apps.euc.vo.result.Result;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.filemanager.manager.AttachmentManager;
import com.seeyon.ctp.common.po.filemanager.Attachment;
import com.seeyon.ctp.common.usermessage.MessageContent;
import com.seeyon.ctp.common.usermessage.MessageReceiver;
import com.seeyon.ctp.common.usermessage.UserMessageManager;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.Strings;

@Path("/euFileZ")
@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
public class EuFileZResource extends BaseResource {
    private static Log log = LogFactory.getLog(EuFileZResource.class);
    private EuFileZManager euFileZManager = (EuFileZManager) AppContext.getBean("euFileZManager");

    //获取获取fileZ浏览 编辑地址
    @POST
    @Produces({ "application/json" })
    @Path("fileZInit")
    public Response getUrlInfo(Map<String, Object> params) throws Exception {
        Map<String, Object> fileZInit = euFileZManager.fileZInit(params);
        return ok(fileZInit);
    }
    
    //根据文件id 获取下载地址 用来解析正文数据
    @POST
    @Produces({ "application/json" })
    @Path("getUrlById")
    public Response getUrlById(Map<String, Object> params) throws Exception {
    	Map<String, Object> fileZInit = euFileZManager.getUrlById(params);
    	return ok(fileZInit);
    }
    
}
