package com.seeyon.apps.eu.manager;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.seeyon.apps.eu.config.EuConfig;
import com.seeyon.ctp.util.*;
import org.apache.commons.io.FileUtils;
//gjx-start：2026-07-14 清稿落盘需要字节数组中转（双路径写同一份内容）
import org.apache.commons.io.IOUtils;
//gjx-end
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import com.alibaba.fastjson.JSON;
import com.seeyon.apps.collaboration.po.ColSummary;
import com.seeyon.apps.eu.po.EuEdocRecordPO;
import com.seeyon.apps.eu.util.FileZUtil;
import com.seeyon.apps.euc.base.EucBaseManager;
import com.seeyon.apps.euc.util.seeyon.DesUtil;
import com.seeyon.apps.govdoc.manager.GovdocDocTemplateManager;
import com.seeyon.apps.officePlugins.manager.OfficeFileManager;
import com.seeyon.cap4.form.bean.FormBean;
import com.seeyon.cap4.form.bean.FormDataMasterBean;
import com.seeyon.cap4.form.bean.FormFieldBean;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.content.mainbody.MainbodyType;
import com.seeyon.ctp.common.file.model.CtpFile;
import com.seeyon.ctp.common.filemanager.manager.AttachmentManager;
import com.seeyon.ctp.common.filemanager.manager.PartitionManager;
import com.seeyon.ctp.common.po.affair.CtpAffair;
import com.seeyon.ctp.common.po.content.CtpContentAll;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.organization.bo.V3xOrgEntity;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.util.annotation.AjaxAccess;
import com.seeyon.ctp.util.json.JSONUtil;
import com.seeyon.v3x.edoc.domain.EdocSummary;
import com.seeyon.v3x.edoc.manager.EdocSummaryManager;
import org.jasypt.contrib.org.apache.commons.codec_1_3.binary.Base64;

public class EuFileZManagerImpl extends EucBaseManager implements EuFileZManager{
	private final static Log log = LogFactory.getLog(EuFileZManagerImpl.class);
	private EuConfig euConfig;
	private GovdocDocTemplateManager govdocDocTemplateManager;
	private AttachmentManager attachmentManager;
	private OfficeFileManager officeFileManager;
	private PartitionManager partitionManager;
	private EdocSummaryManager edocSummaryManager;
	
	@Override
	@AjaxAccess
	public Map<String, Object> fileZInit(Map<String, Object> param) {
		Map<String,Object> result=new HashMap<String, Object>();
		try {
			String fileId=ParamUtil.getString(param, "fileId");
			String createDate=ParamUtil.getString(param, "createDate");
			String fileName=ParamUtil.getString(param, "fileName");
			String state=ParamUtil.getString(param, "state");
			if(Strings.isNotBlank(fileId)&&Strings.isNotBlank(createDate)&&Strings.isNotBlank(fileName)) {
				String fileZUrl="";
				V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(fileId));
				if(v3xFile!=null) {
					String realName=fileName;
					if(Strings.isBlank(fileName)) {
						realName=v3xFile.getFilename();
					}
					// 【gjx修改点】：加入时间的非空保底判断，防止老旧公文没有 updateDate 导致 JSON 丢字段
					Date targetDate = v3xFile.getUpdateDate();
					if (targetDate == null) {
						targetDate = v3xFile.getCreateDate();
					}
					if (targetDate == null) {
						targetDate = new Date();
					}
					String timeStr = DateUtil.format(targetDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");

					fileZUrl = getFileZUrl(fileId+"", realName, timeStr, state);
				}else {
					fileZUrl = getFileZUrl(fileId+"",fileName, DateUtil.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),state);
				}
				result.put("url", fileZUrl);
			}
		} catch (Exception e) {
			log.error("fileZInit", e);
		}
		return result;
	}
	
	private String  getFileZUrl(String fileId,String fileName,String updateDate,String action) {
		String jumpUrl="";
		try {
			User currentUser = AppContext.getCurrentUser();
			V3xOrgMember member = orgManager.getMemberById(currentUser.getId());
			Map<String,Object> userInfoMap=new HashMap<String, Object>();
    		userInfoMap.put("id", member.getId()+"");
    		userInfoMap.put("display_name", member.getName());
    		userInfoMap.put("email", member.getId()+"");
    		String userInfoJson = JSONUtil.toJSONString(userInfoMap);
    		byte[] userInfoByte = userInfoJson.getBytes("UTF-8");
    		String fileBase64Str =new String(Base64.encodeBase64(userInfoByte),"UTF-8");
    		String userInfo = URLEncoder.encode(fileBase64Str, "UTF-8");
    		Map<String,Object> metaMap=new HashMap<String, Object>();
    		metaMap.put("id", fileId);
    		metaMap.put("name", fileName);
    		metaMap.put("modified_at", updateDate);//最后 修改时间 
    		Map<String,Object> created_by=new HashMap<String, Object>();
    		created_by.put("id", member.getId()+"");
    		created_by.put("name", member.getName());
    		metaMap.put("created_by", created_by);
    		Map<String,Object> permissions=new HashMap<String, Object>();
    		permissions.put("write", true);
    		permissions.put("read", true);
    		permissions.put("download", true);
    		permissions.put("print", true);
    		metaMap.put("permissions", permissions);//是否有读权限
    		String metaJson = JSONUtil.toJSONString(metaMap);
    		byte[] metaByte = metaJson.getBytes("UTF-8");
    		String metaBase64Str =new String(Base64.encodeBase64(metaByte),"UTF-8");
    		String meta = URLEncoder.encode(metaBase64Str, "UTF-8");
    		String docId=fileId;
//    		String fileNameBase64 = Base64Util.encode(fileName);
    		String desName=DesUtil.encode(fileName, "123456");
    		String params="fileId="+fileId+";memberId="+member.getId()+";fileName="+desName;
    		String oaUrl=euConfig.getOaUrl();
    		String downloadUrl=oaUrl+"/seeyon/euFileZ.do?method=download";
    		String uploadUrl="";
    		if("edit".equals(action)) { 
    			uploadUrl=oaUrl+"/seeyon/euFileZ.do?method=uploadFile";
    		}
    		downloadUrl=URLEncoder.encode(downloadUrl, "UTF-8");
    		uploadUrl=URLEncoder.encode(uploadUrl, "UTF-8");
    		String repoId="OA1";
    		repoId=euConfig.getRepoId();
    		String url="/docs/app/driver-callback?repoId="+repoId+"&docId="+docId+"&action="+action+"&userinfo="+userInfo+"&meta="+meta+"&downloadUrl="+downloadUrl+"&uploadUrl="+uploadUrl+"&params="+params;
    		url=FileZUtil.getPathWithHmac(url);
    		String fileZurl=euConfig.getFileZurl();
    		jumpUrl=fileZurl+url;
		} catch (Exception e) {
			log.error("getFileZUrl", e);
		}
		return jumpUrl;
	}

	@Override
	@AjaxAccess
	public Map<String, Object> getRedStrings(Map<String, Object> param) {
		Map<String, Object> result=new HashMap<String, Object>();
		try {
			String redStrings="交付方式;代购总价合计;代购标准价合计;合同金额";
			redStrings=euConfig.getRedStrings();
			result.put("readStrings", redStrings);
			String redTableStrings="付款明细表=收款期数,款项内容,收款条件,软件服务费,实施服务费,客开服务费,预计收款日期,备注;aaa=代购名称,代购属性,规格型号或内容说明";
			redTableStrings=euConfig.getRedTableStrings();
			result.put("redTableStrings", redTableStrings);
		} catch (Exception e) {
			log.error("getRedStrings", e);
		}
		return result;
	}

	@Override
	@AjaxAccess
	public FlipInfo getEdocDocTemplateList(FlipInfo fi, Map<String, Object> params) {
		try {
			String name=ParamUtil.getString(params, "value");
			User user = AppContext.getCurrentUser();
			Map<String, Object> tempParams=new HashMap<String, Object>();
			String ids =orgManager.getUserIDDomain(user.getId(), V3xOrgEntity.VIRTUAL_ACCOUNT_ID, V3xOrgEntity.ORGENT_TYPE_ACCOUNT, V3xOrgEntity.ORGENT_TYPE_DEPARTMENT);
			StringBuilder sql = new StringBuilder("select template from EdocDocTemplate as template");
			sql.append(", EdocDocTemplateAcl as tempAcl where template.id = tempAcl.templateId and template.type = :templateType");
			if(ids != null) {
				List<Long> idList = new ArrayList<Long>();
				String[] tmps = ids.split(",");
				for(String id : tmps) {
					idList.add(Long.valueOf(id));
				}
				sql.append(" and tempAcl.depId in (:ids)");
				tempParams.put("ids", idList);
			}
			if(Strings.isNotBlank(name)) {
				sql.append(" and template.name like :name");
				tempParams.put("name", "%"+name+"%");
			}
			sql.append(" and template.type = :templateType");
			tempParams.put("templateType", 0);
			sql.append(" order by template.createTime");
			List findTemplate = DBAgent.find(sql.toString(), tempParams,fi);
		} catch (Exception e) {
			log.error("getEdocDocTemplateList", e);
		}
		return fi;
	}
	
	@Override
	public Map<String, Object> saveRed(Map<String, Object> param) {
		try {
			String code=ParamUtil.getString(param, "code");
			if("TaskSuccessNotify".equals(code)) {//完成状态
				String taskId=ParamUtil.getString(param, "taskId");
				EuEdocRecordPO recordPO = findTaskRecord(taskId);
				if (!isKnownTask(recordPO, taskId)) {
					return null;
				}
				Map<String, Object> detail=(Map<String, Object>) param.get("detail");
				if (detail == null) {
					log.error("[套红回调] detail为空, taskId:" + taskId);
					return null;
				}
				String contentId=ParamUtil.getString(detail, "contentId");
				String downUrl=euConfig.getFileZurl()+"/docs/publicapi/v1/download?&taskId="+taskId+"&contentId="+contentId;
				log.info("[套红回调] 使用固定FileZ地址下载结果, taskId:"+taskId);
				InputStream inputStream = null;
				try {
					inputStream = FileZUtil.httpGet(downUrl, null);
					if(inputStream!=null) {
						//当前表的 id 是 ctp_content_all.id；后续独立任务表升级前保持该兼容语义
						CtpContentAll content = seeyonDao.getById(CtpContentAll.class, recordPO.getId());
						if(content!=null) {
							String fileId = content.getContent();
							V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(fileId));
							CtpFile cacheFile2 = new CtpFile(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()));
							FileUtils.copyInputStreamToFile(inputStream, cacheFile2);
							v3xFile.setUpdateDate(new Date());
							seeyonDao.saveOrUpdate(v3xFile);
						}
					}else {
						log.info("[套红回调] 下载异常, taskId:"+taskId);
					}
				} finally {
					IOUtils.closeQuietly(inputStream);
				}
			}
		} catch (Exception e) {
			log.error("saveRed", e);
		}
		return null;
	}
	
	@Override
	public Map<String, Object> savePdf(Map<String, Object> param) {
		//odf文件返回 生成pdf正文
		try {
			String code=ParamUtil.getString(param, "code");
			if("TaskSuccessNotify".equals(code)) {//完成状态
				String taskId=ParamUtil.getString(param, "taskId");
				EuEdocRecordPO recordPO = findTaskRecord(taskId);
				if (!isKnownTask(recordPO, taskId)) {
					return null;
				}
				Map<String, Object> detail=(Map<String, Object>) param.get("detail");
				if (detail == null) {
					log.error("[PDF回调] detail为空, taskId:" + taskId);
					return null;
				}
				String contentId=ParamUtil.getString(detail, "contentId");
				String downUrl=euConfig.getFileZurl()+"/docs/publicapi/v1/download?&taskId="+taskId+"&contentId="+contentId;
				log.info("[PDF回调] 使用固定FileZ地址下载结果, taskId:"+taskId);
				InputStream inputStream = null;
				try {
					inputStream = FileZUtil.httpGet(downUrl, null);
					if(inputStream!=null) {
						V3XFile v3xFile = fileManager.save(inputStream, ApplicationCategoryEnum.office, "正文.pdf", new Date(), true);
						v3xFile.setMimeType("application/pdf");//添加类型 要不m3 pdf正文
						fileManager.save(v3xFile);
						CtpContentAll content = seeyonDao.getById(CtpContentAll.class, recordPO.getId());
						if(content!=null) {
                			//如果已经有了pdf正文进行替换
							Map<String,Object> contentMap=new HashMap<String, Object>();
							contentMap.put("moduleId", content.getModuleId());
							contentMap.put("contentType", 45);
							CtpContentAll contentPdf = seeyonDao.findUniqeBy(CtpContentAll.class, contentMap);
							if(contentPdf!=null) {
								Map<String,Object> updateParam=new HashMap<String, Object>();
								updateParam.put("content", v3xFile.getId()+"");
								Map<String,Object> cndParam=new HashMap<String, Object>();
								cndParam.put("id", contentPdf.getId());
								int updateSum = seeyonDao.updateBy(CtpContentAll.class, updateParam, cndParam);
								log.info("更新结果："+updateSum);
							}else {
								//新增
								log.info("新建pdf正文");
								EdocSummary edocSummary = edocSummaryManager.findById(content.getModuleId());
								if(edocSummary!=null) {
									CtpContentAll newContent=new CtpContentAll();
									newContent.setNewId();
									newContent.setCreateId(edocSummary.getStartUserId());
									newContent.setCreateDate(new Date());
									newContent.setModifyId(edocSummary.getStartUserId());
									newContent.setModifyDate(new Date());
									newContent.setModuleType(ApplicationCategoryEnum.edoc.key());
									newContent.setModuleId(edocSummary.getId());
									newContent.setModuleTemplateId(0l);
									newContent.setContentType(MainbodyType.Pdf.getKey());
									newContent.setContent(v3xFile.getId()+"");
									newContent.setContentTemplateId(0l);
									newContent.setHasHtmlSignature(0);
									newContent.setSort(3);
									seeyonDao.save(newContent);
								}else {
									log.info("summaryId数据错误："+content.getModuleId());
								}
							}
						}
					}else {
						log.info("[PDF回调] 下载异常, taskId:"+taskId);
					}
				} finally {
					IOUtils.closeQuietly(inputStream);
				}
			}
		} catch (Exception e) {
			log.error("savePdf", e);
		}
		return null;
	}
	
	@Override
	public Map<String, Object> saveWater(Map<String, Object> param) {
		//水印
		try {
			String code=ParamUtil.getString(param, "code");
			if("TaskSuccessNotify".equals(code)) {//完成状态
				String taskId=ParamUtil.getString(param, "taskId");
				EuEdocRecordPO recordPO = findTaskRecord(taskId);
				if (!isKnownTask(recordPO, taskId)) {
					return null;
				}
				Map<String, Object> detail=(Map<String, Object>) param.get("detail");
				if (detail == null) {
					log.error("[水印回调] detail为空, taskId:" + taskId);
					return null;
				}
				String contentId=ParamUtil.getString(detail, "contentId");
				String filename=ParamUtil.getString(detail, "filename");
				String downUrl=euConfig.getFileZurl()+"/docs/publicapi/v1/download?&taskId="+taskId+"&contentId="+contentId;
				log.info("[水印回调] 使用固定FileZ地址下载结果, taskId:"+taskId);
				InputStream inputStream = null;
				try {
					inputStream = FileZUtil.httpGet(downUrl, null);
					if(inputStream!=null) {
						V3XFile v3xFile = fileManager.save(inputStream, ApplicationCategoryEnum.office, filename, new Date(), true);
						v3xFile.setMimeType("*/*");//添加类型 要不m3 pdf正文
						fileManager.save(v3xFile);
						//水印的情况 id 存的是 summaryId
						Long summaryId = recordPO.getId();//colsummaryId
                		ColSummary summary = colManager.getSummaryById(summaryId);
						if (summary == null) {
							log.error("[水印回调] 找不到协同事项, taskId:"+taskId+", summaryId:"+summaryId);
							return null;
						}
                		Long formApp = summary.getFormAppid();
						FormBean form = cap4FormManager.getForm(formApp);
						Long formId = summary.getFormAppid();
						Long masterId = summary.getFormRecordid();
						FormDataMasterBean formData = formApi4Cap4.findDataById(masterId, formId, null);
						Long subReferenceId=UUIDLong.absLongUUID();
						FormFieldBean waterFileBean = form.getFieldBeanByDisplay("水印文件");
						if (waterFileBean != null) {
							String waterFileSubRef = (String) formData.getFieldValue(waterFileBean.getName());
							if(Strings.isNotBlank(waterFileSubRef)) {
								subReferenceId=NumberUtils.toLong(waterFileSubRef);
							}
						}
						attachmentManager.deleteByReference(summaryId,subReferenceId);
						Long[] contentAttIds={v3xFile.getId()};
						attachmentManager.create(contentAttIds, ApplicationCategoryEnum.cap4Form, summary.getId(),subReferenceId);
					}else {
						log.info("[水印回调] 下载异常, taskId:"+taskId);
					}
				} finally {
					IOUtils.closeQuietly(inputStream);
				}
			}
		} catch (Exception e) {
			log.error("saveWater", e);
		}
		return null;
	}
	
	@Override
	@AjaxAccess
	public Map<String, Object> edocPdf(Map<String, Object> param) {//正文转pdf
		Map<String,Object> result=new HashMap<String, Object>();
		String msg="转pdf失败";
		try {
			Long affairId = ParamUtil.getLong(param, "affairId");//获取正文
			CtpAffair affair = colManager.getAffairById(affairId);
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("moduleId", affair.getObjectId());
			List<CtpContentAll> contentList = seeyonDao.findBy(CtpContentAll.class, params);
			String oaUrl=euConfig.getOaUrl();
			String fileZUrl=euConfig.getFileZurl();
			Map<String, Object> sendParam=new HashMap<String, Object>();
			for (CtpContentAll content : contentList) {
				Long fileId = NumberUtils.toLong(content.getContent());
				V3XFile v3xFile = fileManager.getV3XFile(fileId);
				if (v3xFile != null) {
					String edocType = getFileType(content.getContentType() + "");
					if(".docx".equals(edocType)||".wps".equals(edocType)) {//其余类型不参与
						String desName=DesUtil.encode("正文.docx", "123456");
						String downloadUrl=oaUrl+"/seeyon/euFileZ.do?method=download&fileId="+fileId+"&fileName="+desName;
						sendParam.put("fileUrl", downloadUrl);
						sendParam.put("filename", "正文.docx");
						sendParam.put("targetFilename", "正文.pdf");
						sendParam.put("callback", oaUrl+"/seeyon/euFileZ.do?method=fileZpdfReturn");//回调
						String changePdf = FileZUtil.changePdf(
								JSONUtil.toJSONString(sendParam), fileZUrl);
						Map<String, Object> startMap=JSON.parseObject(changePdf, Map.class);
						String code = ParamUtil.getString(startMap, "code");
						if("Ok".equals(code)) {
							msg="";
							String taskId = ParamUtil.getString(startMap, "taskId");
							if (Strings.isBlank(taskId)) {
								msg = "PDF任务提交失败：FileZ未返回taskId";
								log.error("[PDF] FileZ返回Ok但taskId为空");
							} else {
								//把文件id跟taskId存一起 回调后 替换附件
								EuEdocRecordPO po=new EuEdocRecordPO();
								po.setId(content.getId());
								po.setOldFileId(fileId);
								po.setTaskId(taskId);
								seeyonDao.saveOrUpdate(po);
							}
						}
					}
				}
			}
		} catch (Exception e) {
			log.error("edocPdf", e);
		}
		result.put("msg", msg);
		return result;
	}

	//gjx-start：2026-07-14 清稿——调 FileZ ClearDoc(acceptAllTrack) 接受正文全部修订，
	// 解决"打包下载/归档拿到的正文带未接受修订（花脸）"问题。
	// 链路与套红/转pdf完全同构：提交任务 → FileZ 异步处理 → 回调 fileZclearReturn → saveClear 覆盖原正文文件。
	// 注意：官方限制 ClearDoc 不能与 UpdateBookmarkRef 混在同一 ops，必须独立任务。
	@Override
	@AjaxAccess
	public Map<String, Object> edocClear(Map<String, Object> param) {
		Map<String,Object> result=new HashMap<String, Object>();
		String msg="清稿失败：未找到Word正文";
		try {
			Long affairId = ParamUtil.getLong(param, "affairId");
			CtpAffair affair = colManager.getAffairById(affairId);
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("moduleId", affair.getObjectId());
			List<CtpContentAll> contentList = seeyonDao.findBy(CtpContentAll.class, params);
			String oaUrl=euConfig.getOaUrl();
			String fileZUrl=euConfig.getFileZurl();
			for (CtpContentAll content : contentList) {
				Long fileId = NumberUtils.toLong(content.getContent());
				V3XFile v3xFile = fileManager.getV3XFile(fileId);
				if (v3xFile != null) {
					String edocType = getFileType(content.getContentType() + "");
					if(".docx".equals(edocType)||".wps".equals(edocType)) {//其余类型不参与
						String fileName="正文"+edocType;
						String desName=DesUtil.encode(fileName, "123456");
						List<Map<String, Object>> ops=new ArrayList<Map<String,Object>>();
						Map<String, Object> op=new HashMap<String, Object>();
						op.put("actId", "ClearDoc");
						Map<String, Object> options=new HashMap<String, Object>();
						List<String> args=new ArrayList<String>();
						args.add("acceptAllTrack");//只接受修订，不动批注；要连批注一起清则追加 removeAllComment
						options.put("args", args);
						op.put("options", options);
						ops.add(op);
						Map<String, Object> sendParam=new HashMap<String, Object>();
						sendParam.put("fileUrl", oaUrl+"/seeyon/euFileZ.do?method=download&fileId="+fileId+"&fileName="+desName);
						sendParam.put("filename", fileName);
						sendParam.put("callback", oaUrl+"/seeyon/euFileZ.do?method=fileZclearReturn");//回调
						sendParam.put("ops", ops);
						String clearReturn = FileZUtil.publicapiUpdate(
								JSONUtil.toJSONString(sendParam), fileZUrl);
						Map<String, Object> startMap=JSON.parseObject(clearReturn, Map.class);
						String code = ParamUtil.getString(startMap, "code");
						if("Ok".equals(code)) {
							msg="";
							String taskId = ParamUtil.getString(startMap, "taskId");
							if (Strings.isBlank(taskId)) {
								msg = "清稿任务提交失败：FileZ未返回taskId";
								log.error("[清稿] FileZ返回Ok但taskId为空");
							} else {
								//contentId跟taskId存一起，回调后按taskId找回正文文件（与套红/转pdf共用记录表）
								EuEdocRecordPO po=new EuEdocRecordPO();
								po.setId(content.getId());
								po.setOldFileId(fileId);
								po.setTaskId(taskId);
								seeyonDao.saveOrUpdate(po);
								log.info("[清稿] 任务已提交, taskId:"+taskId+", fileId:"+fileId);
							}
						}else {
							msg="清稿任务提交失败";
							log.error("[清稿] FileZ返回异常:"+clearReturn);
						}
					}
				}
			}
		} catch (Exception e) {
			msg="清稿异常";
			log.error("edocClear", e);
		}
		result.put("msg", msg);
		return result;
	}

	@Override
	public Map<String, Object> saveClear(Map<String, Object> param) {
		//清稿结果回调：下载已接受全部修订的正文，覆盖原正文物理文件（fileId不变，前端指纹轮询靠updateDate感知）
		try {
			String code=ParamUtil.getString(param, "code");
			if("TaskSuccessNotify".equals(code)) {//完成状态
				String taskId=ParamUtil.getString(param, "taskId");
				EuEdocRecordPO recordPO = findTaskRecord(taskId);
				if (!isKnownTask(recordPO, taskId)) {
					return null;
				}
				Map<String, Object> detail=(Map<String, Object>) param.get("detail");
				if (detail == null) {
					log.error("[清稿回调] detail为空, taskId:" + taskId);
					return null;
				}
				String contentId=ParamUtil.getString(detail, "contentId");
				String downUrl=euConfig.getFileZurl()+"/docs/publicapi/v1/download?&taskId="+taskId+"&contentId="+contentId;
				log.info("[清稿回调] 使用固定FileZ地址下载结果, taskId:"+taskId);
				InputStream inputStream = null;
				try {
					inputStream = FileZUtil.httpGet(downUrl, null);
					if(inputStream!=null) {
						CtpContentAll content = seeyonDao.getById(CtpContentAll.class, recordPO.getId());
						if(content!=null) {
							String fileId = content.getContent();
							V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(fileId));
							//恢复原文档用：仅第一次清稿时备份为 <路径>.qgbak，之后永不覆盖——
							//保证"恢复原文档"永远回到第一次清稿前的最初版
							try {
								File bakFile = new File(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()) + ".qgbak");
								if (!bakFile.exists()) {
									File bakSrc = fileManager.getFile(v3xFile.getId(), v3xFile.getCreateDate());
									if (bakSrc == null || !bakSrc.exists()) {
										bakSrc = new File(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()));
									}
									if (bakSrc.exists()) {
										FileUtils.copyFile(bakSrc, bakFile);
										log.info("[清稿] 已备份最初版正文, fileId:" + fileId);
									}
								}
							} catch (Exception e) {
								log.error("[清稿] 备份原文档失败（不影响清稿继续）", e);
							}
							//对齐 uploadFile 的双路径写法：两个物理路径都覆盖，避免部分入口读到旧文件
							byte[] fileBytes = IOUtils.toByteArray(inputStream);
							//解毒：ClearDoc 漏清的格式类修订（w:rPrChange 等幽灵节点）在 XML 层面物理删除
							fileBytes = com.seeyon.apps.eu.util.EuDocxCleanUtil.stripFormatChangeNodes(fileBytes);
							CtpFile cacheFile = fileManager.getFile(v3xFile.getId(), v3xFile.getCreateDate());
							if(cacheFile!=null) {
								FileUtils.writeByteArrayToFile(cacheFile, fileBytes);
							}
							CtpFile cacheFile2 = new CtpFile(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()));
							FileUtils.writeByteArrayToFile(cacheFile2, fileBytes);
							v3xFile.setUpdateDate(new Date());
							v3xFile.setSize((long) fileBytes.length);
							seeyonDao.saveOrUpdate(v3xFile);
							log.info("[清稿] 正文已覆盖为定稿版, fileId:"+fileId+", size:"+fileBytes.length);
						}
					}else {
						log.info("[清稿] 结果下载异常, taskId:"+taskId);
					}
				} finally {
					IOUtils.closeQuietly(inputStream);
				}
			}
		} catch (Exception e) {
			log.error("saveClear", e);
		}
		return null;
	}
	//恢复原文档：把正文还原到第一次清稿前的最初版备份（.qgbak 仅首次清稿写入、永不覆盖），清稿的"后悔药"
	@Override
	@AjaxAccess
	public Map<String, Object> edocClearRestore(Map<String, Object> param) {
		Map<String,Object> result=new HashMap<String, Object>();
		String msg="恢复失败：未找到Word正文";
		try {
			Long affairId = ParamUtil.getLong(param, "affairId");
			log.info("[清稿恢复] 收到恢复请求, affairId:" + affairId);
			CtpAffair affair = colManager.getAffairById(affairId);
			Map<String, Object> params = new HashMap<String, Object>();
			params.put("moduleId", affair.getObjectId());
			List<CtpContentAll> contentList = seeyonDao.findBy(CtpContentAll.class, params);
			for (CtpContentAll content : contentList) {
				Long fileId = NumberUtils.toLong(content.getContent());
				V3XFile v3xFile = fileManager.getV3XFile(fileId);
				if (v3xFile != null) {
					String edocType = getFileType(content.getContentType() + "");
					if(".docx".equals(edocType)||".wps".equals(edocType)) {//其余类型不参与
						File bakFile = new File(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()) + ".qgbak");
						if (!bakFile.exists()) {
							msg="没有可恢复的备份（该正文尚未清过稿）";
							log.info("[清稿恢复] 无备份可恢复, fileId:" + fileId);
							continue;
						}
						byte[] fileBytes = FileUtils.readFileToByteArray(bakFile);
						//与 saveClear 同样的双路径落盘
						CtpFile cacheFile = fileManager.getFile(v3xFile.getId(), v3xFile.getCreateDate());
						if (cacheFile != null) {
							FileUtils.writeByteArrayToFile(cacheFile, fileBytes);
						}
						CtpFile cacheFile2 = new CtpFile(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()));
						FileUtils.writeByteArrayToFile(cacheFile2, fileBytes);
						v3xFile.setUpdateDate(new Date());
						v3xFile.setSize((long) fileBytes.length);
						seeyonDao.saveOrUpdate(v3xFile);
						msg="";
						log.info("[清稿恢复] 正文已还原到清稿前, fileId:" + fileId + ", size:" + fileBytes.length);
					}
				}
			}
		} catch (Exception e) {
			msg="恢复异常";
			log.error("edocClearRestore", e);
		}
		result.put("msg", msg);
		return result;
	}
	//gjx-end

	@Override
	@AjaxAccess
	public Map<String, Object> createDefaultFile(Map<String, Object> param) {
		try {
			String fileIdStr = ParamUtil.getString(param, "fileId");
			String fileType = ParamUtil.getString(param, "fileType");
			String fileName = ParamUtil.getString(param, "fileName");
			String category = ParamUtil.getString(param, "category");
			Long fileId = NumberUtils.toLong(fileIdStr);

			log.info("【gjx客开】开始执行 createDefaultFile，准备强制换血...");

			// 1. 生成基础占位 (此时会生成那个 9KB 的损坏假文件)
			try {
				officeFileManager.createV3XFileAndDefaultBlankFile(fileId, fileType,
						"4".equals(category) ? ApplicationCategoryEnum.edoc.key() : null);
			} catch (Exception e) {
				log.error("【gjx客开】调用底层占位异常", e);
			}

			// 2. 终极修复：无条件强制覆盖！把损坏的假文件替换成真实的模板！
			try {
				V3XFile v3xFile = fileManager.getV3XFile(fileId);
				if (v3xFile != null && Strings.isNotBlank(fileName)) {
					v3xFile.setFilename(fileName);
					fileManager.update(v3xFile);
				}

				CtpFile file = fileManager.getFile(fileId);
				if (file != null && file.exists()) {
					String templatePath = AppContext.getCfgHome() + File.separator + "base" + File.separator + "office" + File.separator;
					String templateFileName = "blank." + fileType;
					File templateFile = new File(templatePath + templateFileName);

					if (templateFile.exists()) {
						// 暴力覆盖：用真实的 blank.doc 替换掉那个 9KB 的假文件
						FileUtils.copyFile(templateFile, file);
						log.info("【gjx客开】大牛逼！成功使用真实模板 " + templateFileName + " 强制覆盖了异常占位文件！");
					} else {
						log.error("【gjx客开】严重警告：服务器上缺少真实模板: " + templateFile.getAbsolutePath());
					}
				}
			} catch (Exception e) {
				log.error("【gjx客开】强制覆盖占位文件时发生异常", e);
			}
		} catch (Exception e) {
			log.error("【gjx客开】createDefaultFile 最外层异常", e);
		}
		return null;
	}
	
	@Override
	@AjaxAccess
	public Map<String, Object> isFileContentNotEmpty(Map<String, Object> param) {
		Map<String,Object> result=new HashMap<String, Object>();
		boolean fileContentNotEmpty=false;
		try {
			String fileId=ParamUtil.getString(param, "fileId");
			Long fileIdLong = NumberUtils.toLong(fileId);
			V3XFile v3xFile = fileManager.getV3XFile(fileIdLong);
			if (v3xFile == null) {
				result.put("isNull", true);
				return result;
			}
			CtpFile file = fileManager.getFile(fileIdLong);
			fileContentNotEmpty = isFileContentNotEmpty(file.getAbsolutePath());
		} catch (Exception e) {
			log.error("createDefaultFile", e);
		}
		result.put("isNull", fileContentNotEmpty);
		return result;
	}
	
	//判断文件是否为空
	public static boolean isFileContentNotEmpty(String filePath){
		boolean state=true;
		try {
			File file = new File(filePath);
			try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
				String line;
				while ((line = reader.readLine()) != null) {
					if (!line.trim().isEmpty()) {
						state=false;
					}
				}
			}

		} catch (Exception e) {
			log.error("isFileContentNotEmpty", e);
			state=false;
		}
		return state;
	}
	
	@Override
	@AjaxAccess
	public Map<String, Object> getUrlById(Map<String, Object> param) {
		Map<String,Object> result=new HashMap<String, Object>();
		try {
			String fileId=ParamUtil.getString(param, "fileId");
			String state=ParamUtil.getString(param, "state");
			if(Strings.isNotBlank(fileId)&&Strings.isNotBlank(state)) {
				String fileZUrl="";
				V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(fileId));
				if(v3xFile!=null) {
					fileZUrl = getFileZUrl(fileId+"",v3xFile.getFilename(), DateUtil.format(v3xFile.getUpdateDate(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),state);
					result.put("url", fileZUrl);
				}
			}
		} catch (Exception e) {
			log.error("getUrlById", e);
		}
		return result;
	}

	private EuEdocRecordPO findTaskRecord(String taskId) {
		if (Strings.isBlank(taskId)) {
			log.error("[FileZ回调] taskId为空，拒绝处理");
			return null;
		}
		Map<String,Object> recordParam=new HashMap<String, Object>();
		recordParam.put("taskId", taskId);
		return seeyonDao.findUniqeBy(EuEdocRecordPO.class, recordParam);
	}

	private boolean isKnownTask(EuEdocRecordPO recordPO, String taskId) {
		if (recordPO == null) {
			log.error("[FileZ回调] 找不到任务记录，拒绝下载结果, taskId:" + taskId);
			return false;
		}
		return true;
	}
	
	 private String getNewFilepath(Date createDate, Long newFileId) throws Exception {
		 return getFolder(createDate, true) + File.separator + newFileId;
	 }
	 
	 private String getFolder(Date createDate, boolean createWhenNoExist) throws Exception {
		 return partitionManager.getFolder(createDate, createWhenNoExist);
	 }
	
	
	// 得到文件格式
	private String getFileType(String contentType) {
		/*
		 * 10：HTML 20：表单格式正文 30：text正文 41：OfficeWord 42：OfficeExcel 43：WpsWord
		 * 44：WpsExcel 45：Pdf 46：Ofd 90：THIRD 第三方正文
		 */
		String ext = "";
		if ("43".equals(contentType)) {
			ext = ".wps";
		} else if ("41".equals(contentType)) {
			ext = ".docx";
		} else if ("44".equals(contentType)) {
			ext = ".et";
		} else if ("42".equals(contentType)) {
			ext = ".xls";
		} else if ("45".equals(contentType)) {
			ext = ".pdf";
		}
		return ext;
	}

	@Override
	@AjaxAccess
	public Map<String, Object> checkPdfStatus(Map<String, Object> param) {
		Map<String, Object> result = new HashMap<String, Object>();
		// 默认状态：还没准备好
		result.put("isReady", false);

		try {
			Long affairId = ParamUtil.getLong(param, "affairId");
			if (affairId == null) {
				return result;
			}

			CtpAffair affair = colManager.getAffairById(affairId);
			if (affair == null) {
				return result;
			}

			// 查找是否已经生成了 PDF 正文 (contentType = 45)
			Map<String, Object> contentMap = new HashMap<String, Object>();
			contentMap.put("moduleId", affair.getObjectId());
			contentMap.put("contentType", MainbodyType.Pdf.getKey()); // 获取PDF类型的正文
			CtpContentAll contentPdf = seeyonDao.findUniqeBy(CtpContentAll.class, contentMap);

			if (contentPdf != null && Strings.isNotBlank(contentPdf.getContent())) {
				// 找到了！说明回调已经处理完，PDF生成成功了
				String fileId = contentPdf.getContent();
				V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(fileId));

				if (v3xFile != null) {
					Date createDate = v3xFile.getCreateDate();
					if (createDate == null) {
						createDate = new Date();
					}
					Date versionDate = v3xFile.getUpdateDate();
					if (versionDate == null) {
						versionDate = createDate;
					}
					String updateDate = DateUtil.format(versionDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
					String fileName = v3xFile.getFilename();
					if (Strings.isBlank(fileName)) {
						fileName = "正文.pdf";
					}

					// 复用你现有的组装 FileZ 预览 URL 的方法，状态传 "view"
					String fileZUrl = getFileZUrl(fileId, fileName, updateDate, "view");

					// 返回给前端
					result.put("isReady", true);
					result.put("url", fileZUrl);
					// fileId 保持字符串，避免 JavaScript 对 Long 类型主键产生精度丢失
					result.put("fileId", fileId);
					result.put("createDate", DateUtil.format(createDate, "yyyy-MM-dd"));
					result.put("fileName", fileName);
					result.put("hasBodyFile", true);
					log.info("666666666666PDF转版检查完毕，已生成访问链接：" + fileZUrl);
				}
			}
		} catch (Exception e) {
			log.error("666666666666666checkPdfStatus异常", e);
		}

		return result;
	}
	
	public void setEuConfig(EuConfig euConfig) {
		this.euConfig = euConfig;
	}

	public void setPartitionManager(PartitionManager partitionManager) {
		this.partitionManager = partitionManager;
	}

	public void setGovdocDocTemplateManager(GovdocDocTemplateManager govdocDocTemplateManager) {
		this.govdocDocTemplateManager = govdocDocTemplateManager;
	}

	public void setAttachmentManager(AttachmentManager attachmentManager) {
		this.attachmentManager = attachmentManager;
	}

	public void setOfficeFileManager(OfficeFileManager officeFileManager) {
		this.officeFileManager = officeFileManager;
	}

	public void setEdocSummaryManager(EdocSummaryManager edocSummaryManager) {
		this.edocSummaryManager = edocSummaryManager;
	}


}
