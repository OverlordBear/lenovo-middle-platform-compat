package com.seeyon.apps.eu.event;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import com.alibaba.fastjson.JSON;
import com.seeyon.apps.collaboration.manager.ColManager;
import com.seeyon.apps.eu.config.EuConfig;
import com.seeyon.apps.eu.po.EuEdocRecordPO;
import com.seeyon.apps.eu.util.FileZUtil;
import com.seeyon.apps.euc.dao.SeeyonDao;
import com.seeyon.apps.euc.util.seeyon.DesUtil;
import com.seeyon.cap4.form.service.CAP4FormManager;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.ctpenumnew.manager.EnumManager;
import com.seeyon.ctp.common.filemanager.manager.AttachmentManager;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.po.ctpenumnew.CtpEnumItem;
import com.seeyon.ctp.common.po.filemanager.Attachment;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.common.template.manager.TemplateManager;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.ParamUtil;
import com.seeyon.ctp.util.Strings;
import com.seeyon.ctp.util.json.JSONUtil;
import com.seeyon.ctp.workflow.event.AbstractWorkflowEvent;
import com.seeyon.ctp.workflow.event.WorkflowEventData;
import com.seeyon.ctp.workflow.event.WorkflowEventResult;

//fileZ加水印
public class WatermarkEvent extends AbstractWorkflowEvent {
    private final static Log log = LogFactory.getLog(WatermarkEvent.class);
    private ColManager colManager;
    private SeeyonDao seeyonDao;
    private FileManager fileManager;
    private CAP4FormManager cap4FormManager;
    private OrgManager orgManager;
    private TemplateManager templateManager;
    private AttachmentManager attachmentManager;
    private EuConfig euConfig;
	private EnumManager enumManagerNew;
    
    public WorkflowEventResult onBeforeFinishWorkitem(WorkflowEventData data) {//处理前
        WorkflowEventResult workflowEventResult=new WorkflowEventResult();
        String msg="";
        try {
        	long summaryId = data.getSummaryId();
			Map<String, Object> businessData = data.getBusinessData();
			Long fileId = ParamUtil.getLong(businessData, "水印文件");
			Long picLong = ParamUtil.getLong(businessData,"水印图片");//限制只能传一个
			int picScale = ParamUtil.getInt(businessData,"图片缩放比例");
			Long isErosion = ParamUtil.getLong(businessData,"是否有冲蚀效果");//枚举
			int transparent = ParamUtil.getInt(businessData,"水印透明度");
			int rotation = ParamUtil.getInt(businessData,"图片旋转角度");
			Long position = ParamUtil.getLong(businessData,"水印位置");//枚举
			int widthInCm =ParamUtil.getInt(businessData,"图片宽度");
			int heightInCm = ParamUtil.getInt(businessData,"图片高度");
			if(fileId!=null){
				List<Attachment> fileAttach = attachmentManager.getByReference(summaryId,fileId);
				if(fileAttach.size()==1) {
					Attachment singleFile = fileAttach.get(0);
					V3XFile v3xFile = fileManager.getV3XFile(singleFile.getFileUrl());
					if(v3xFile!=null) {
						String oaUrl=euConfig.getOaUrl();
						String fileZUrl=euConfig.getFileZurl();
						List<Map<String, Object>> ops=new ArrayList<Map<String,Object>>();
						Map<String, Object> op=new HashMap<String, Object>();
						op.put("actId", "ApplyPicWatermark");
						Map<String, Object> options=new HashMap<String, Object>();
						List<Attachment> picAttach = attachmentManager.getByReference(summaryId,picLong);
						if(picAttach.size()==1) {//图片
							Long fileUrl = picAttach.get(0).getFileUrl();
							V3XFile v3xFilePic = fileManager.getV3XFile(fileUrl);
							String desPicName=DesUtil.encode(v3xFilePic.getFilename(), "123456");
							String picUrl=oaUrl+"/seeyon/euFileZ.do?method=download&fileId="+fileUrl+"&fileName="+desPicName;
							options.put("picUrl", picUrl);
							options.put("picName", v3xFilePic.getFilename());
							if(picScale!=0l) {
								options.put("picScale", picScale);
							}
							if(isErosion!=null) {
								CtpEnumItem isErosionItem = enumManagerNew.getCtpEnumItem(isErosion);
								String showvalue = isErosionItem.getShowvalue();
								if(showvalue.equals("是")) {
									options.put("isErosion", true);
								}else {
									options.put("isErosion", false);
								}
							}
							if(transparent!=0l) {
								options.put("transparent", transparent);
							}
							if(rotation!=0l) {
								options.put("rotation", rotation);
							}
							if(position!=null) {
								CtpEnumItem positionItem = enumManagerNew.getCtpEnumItem(position);
								String showvalue = positionItem.getShowvalue();
								if(showvalue.equals("顶部靠左")) {
									options.put("position", "TOP_LEFT");
								}else if(showvalue.equals("顶部中间")) {
									options.put("position", "TOP_CENTER");
								}else if(showvalue.equals("顶部靠右")) {
									options.put("position", "TOP_RIGHT");
								}else if(showvalue.equals("中间靠左")) {
									options.put("position", "CENTER_LEFT");
								}else if(showvalue.equals("正中")) {
									options.put("position", "CENTER");
								}else if(showvalue.equals("中间靠右")) {
									options.put("position", "CENTER_RIGHT");
								}else if(showvalue.equals("底部靠左")) {
									options.put("position", "BOTTOM_LEFT");
								}else if(showvalue.equals("底部中间")) {
									options.put("position", "BOTTOM_CENTER");
								}else if(showvalue.equals("底部靠右")) {
									options.put("position", "BOTTOM_RIGHT");
								}
							}
							if(widthInCm!=0l) {
								options.put("widthInCm", widthInCm);
							}
							if(heightInCm!=0l) {
								options.put("heightInCm", heightInCm);
							}
							op.put("options", options);
							ops.add(op);
							Map<String,Object> sendParam=new HashMap<String, Object>();
				    		String desRedName=DesUtil.encode(v3xFile.getFilename(), "123456");
				    		String downloadRedUrl=oaUrl+"/seeyon/euFileZ.do?method=download&fileId="+v3xFile.getId()+"&fileName="+desRedName;
							sendParam.put("fileUrl", downloadRedUrl);
							sendParam.put("filename", v3xFile.getFilename());
							sendParam.put("callback", oaUrl+"/seeyon/euFileZ.do?method=fileZwaterReturn");//回调
							sendParam.put("ops", ops);
							String publicapiUpdate = FileZUtil.publicapiUpdate(
									JSONUtil.toJSONString(sendParam), fileZUrl);
							Map<String, Object> startMap=JSON.parseObject(publicapiUpdate, Map.class);
							//{"taskId":"d894abd4-868a-49d3-8d08-4cb453dc0959","code":"Ok","detail":{"taskStatus":"IN_QUEUE"}}
							String code = ParamUtil.getString(startMap, "code");
							if("Ok".equals(code)) {
								String taskId = ParamUtil.getString(startMap, "taskId");
								if (Strings.isBlank(taskId)) {
									msg = "水印任务提交失败：FileZ未返回taskId";
									log.error("[水印] FileZ返回Ok但taskId为空");
								} else {
									//把文件id跟taskId存一起 回调后 替换附件
									EuEdocRecordPO po=new EuEdocRecordPO();
									po.setId(summaryId);
									po.setOldFileId(v3xFile.getId());
									po.setTaskId(taskId);
									seeyonDao.saveOrUpdate(po);
								}
							}else {
								msg=publicapiUpdate;
							}
						}
					}else {
						msg="附件异常";
					}
				}else {
					msg="请上传一个文件";
				}
			}
		} catch (Exception e) {
			log.error("节点加水印", e);
		}
        workflowEventResult.setAlertMessage(msg);
        return workflowEventResult;
    }
    
    
    @Override
    public ApplicationCategoryEnum getAppName() {
        return ApplicationCategoryEnum.form;
    }
    
    @Override
    public String getId() {
        return "3197280925680158946";
    }

    @Override
    public String getLabel() {
        return "fileZ加水印";
    }

    public void setColManager(ColManager colManager) {
        this.colManager = colManager;
    }

    public void setSeeyonDao(SeeyonDao seeyonDao) {
        this.seeyonDao = seeyonDao;
    }

    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setCap4FormManager(CAP4FormManager cap4FormManager) {
        this.cap4FormManager = cap4FormManager;
    }

    public void setOrgManager(OrgManager orgManager) {
        this.orgManager = orgManager;
    }

    public void setTemplateManager(TemplateManager templateManager) {
        this.templateManager = templateManager;
    }

	public void setAttachmentManager(AttachmentManager attachmentManager) {
		this.attachmentManager = attachmentManager;
	}

	public void setEuConfig(EuConfig euConfig) {
		this.euConfig = euConfig;
	}

	public void setEnumManagerNew(EnumManager enumManagerNew) {
		this.enumManagerNew = enumManagerNew;
	}
    
}
