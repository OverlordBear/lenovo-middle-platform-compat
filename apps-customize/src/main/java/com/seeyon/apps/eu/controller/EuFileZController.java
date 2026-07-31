package com.seeyon.apps.eu.controller;

import java.io.*;
import java.net.URI;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.seeyon.apps.eu.util.FileZUtil;
import com.seeyon.apps.eu.manager.EuFileZManager;
import com.seeyon.apps.eu.util.EuFileUnpackUtil;
import com.seeyon.apps.euc.util.seeyon.DesUtil;
//gjx-start：2026-07-09 配置中心依赖（ConfigManager 读写 + EuConfig 热更新）
import com.seeyon.apps.eu.config.EuConfig;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.po.config.ConfigItem;
import com.seeyon.ctp.util.UUIDLong;
//gjx-end
//gjx-start：2026-07-15 套红字段动态配置依赖（发文单/字段读取 + 配置存取）
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import com.seeyon.apps.eu.util.EuRedFieldConfigUtil;
import com.seeyon.ctp.util.JDBCAgent;
import com.seeyon.ctp.util.Strings;
//gjx-end
import com.seeyon.ctp.common.controller.BaseController;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.file.model.CtpFile;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.filemanager.manager.PartitionManager;
import com.seeyon.ctp.common.fileupload.util.FileUploadUtil;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.organization.bo.V3xOrgMember;
import com.seeyon.ctp.organization.manager.OrgManager;
import com.seeyon.ctp.util.DateUtil;
import com.seeyon.ctp.util.json.JSONUtil;

public class EuFileZController extends BaseController {
    private final static Log log = LogFactory.getLog(EuFileZController.class);
    private FileManager fileManager;
    private OrgManager orgManager;
    private PartitionManager partitionManager;
    private EuFileZManager euFileZManager;
    //gjx-start：2026-07-09 配置中心（照搬 AAAZSbankCommonConfig 的 ConfigManager 模式）
    /** 配置分类与键清单，键与 config.jsp 页面字段一一对应 */
    private static final String[] CONFIG_KEYS = {
            "filez.oaUrl", "filez.fileZurl", "filez.repoId",
            "filez.secret", "filez.redStrings", "filez.redTableStrings"
    };
    private static final Object CONFIG_SAVE_LOCK = new Object();

    private EuConfig euConfig;

    public void setEuConfig(EuConfig euConfig) {
        this.euConfig = euConfig;
    }

    /**
     * 配置读取：GET /seeyon/euFileZ.do?method=configData
     * 返回 JSON。取值优先级：DB(ctp_config_item) > EuConfig 当前生效值 > 空串
     * （secret 特殊：只返回掩码；完整值仅在管理员主动进入编辑时通过 configSecret 获取）
     */
    public ModelAndView configData(HttpServletRequest request, HttpServletResponse response) {
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> data = new HashMap<String, Object>();
        synchronized (CONFIG_SAVE_LOCK) {
            try {
                ConfigManager cm = (ConfigManager) AppContext.getBean("configManager");
                for (String key : CONFIG_KEYS) {
                    if ("filez.secret".equals(key)) {
                        data.put("filez.secretMasked", maskSecret(getEffectiveSecret(cm)));
                        continue;
                    }
                    String val = getConfigValue(cm, key);
                    if ("".equals(val)) {
                        val = getRuntimeFallback(key);
                    }
                    data.put(key, val);
                }
            } catch (Exception e) {
                log.error("configData", e);
            }
        }
        writeJson(response, data);
        return null;
    }

    /**
     * 管理员主动进入编辑模式时读取完整密钥。
     * 该响应禁止缓存，普通 configData 接口永不包含明文。
     */
    public ModelAndView configSecret(HttpServletRequest request, HttpServletResponse response) {
        if (!ensurePost(request, response)) {
            return null;
        }
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> result = new HashMap<String, Object>();
        synchronized (CONFIG_SAVE_LOCK) {
            try {
                ConfigManager cm = (ConfigManager) AppContext.getBean("configManager");
                result.put("success", true);
                result.put("secret", getEffectiveSecret(cm));
                User user = AppContext.getCurrentUser();
                log.info("[FileZ配置] 管理员读取完整HMAC密钥, userId="
                        + (user == null ? "" : user.getId()));
            } catch (Exception e) {
                log.error("configSecret", e);
                result.put("success", false);
                result.put("message", "读取签名密钥失败");
            }
        }
        writeJson(response, result);
        return null;
    }

    /**
     * 配置保存：POST /seeyon/euFileZ.do?method=saveConfig（JSON body）
     * 固定 OA/FileZ 地址与公共配置保存后立即更新当前节点。
     */
    public ModelAndView saveConfig(HttpServletRequest request, HttpServletResponse response) {
        if (!ensurePost(request, response)) {
            return null;
        }
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> result = new HashMap<String, Object>();
        synchronized (CONFIG_SAVE_LOCK) {
            synchronized (euConfig == null ? CONFIG_SAVE_LOCK : euConfig) {
            try {
                String body = getBody(request);
                @SuppressWarnings("unchecked")
                Map<String, Object> params = JSON.parseObject(body, Map.class);
                if (params == null) {
                    params = new HashMap<String, Object>();
                }

                log.info("[FileZ配置] 收到保存请求, keys=" + params.keySet());

                String oaUrl = validateBaseUrl(
                        nonBlankSubmittedOrCurrent(params, "filez.oaUrl", euConfig.getOaUrl()),
                        "OA 服务地址");
                String fileZUrl = validateBaseUrl(
                        nonBlankSubmittedOrCurrent(params, "filez.fileZurl", euConfig.getFileZurl()),
                        "FileZ 中台地址");
                if (params.containsKey("filez.secret")
                        && trimOf(params.get("filez.secret")).contains("******")) {
                    throw new IllegalArgumentException("签名密钥不能包含页面掩码");
                }

                ConfigManager cm = (ConfigManager) AppContext.getBean("configManager");
                for (String key : CONFIG_KEYS) {
                    if (params.containsKey(key)) {
                        if ("filez.secret".equals(key)
                                && trimOf(params.get(key)).length() == 0) {
                            continue;
                        }
                        if ("filez.repoId".equals(key)
                                && trimOf(params.get(key)).length() == 0) {
                            continue;
                        }
                        Object v = params.get(key);
                        String value = v == null ? "" : String.valueOf(v);
                        if ("filez.oaUrl".equals(key)) {
                            value = oaUrl;
                        } else if ("filez.fileZurl".equals(key)) {
                            value = fileZUrl;
                        }
                        saveConfigValue(cm, key, value);
                    }
                }

                if (params.containsKey("filez.repoId")) {
                    String repoId = trimOf(params.get("filez.repoId"));
                    if (repoId.length() > 0) {
                        euConfig.setRepoId(repoId);
                    }
                }
                if (params.containsKey("filez.secret")) {
                    String secret = trimOf(params.get("filez.secret"));
                    if (secret.length() > 0) {
                        euConfig.setSecret(secret);
                    }
                }
                if (params.containsKey("filez.redStrings")) {
                    euConfig.setRedStrings(trimOf(params.get("filez.redStrings")));
                }
                if (params.containsKey("filez.redTableStrings")) {
                    euConfig.setRedTableStrings(trimOf(params.get("filez.redTableStrings")));
                }

                euConfig.setOaUrl(oaUrl);
                euConfig.setFileZurl(fileZUrl);

                result.put("success", true);
                result.put("message", "配置已保存并在当前节点热生效");
                log.info("[FileZ配置] 保存成功");
            } catch (Exception e) {
                log.error("saveConfig", e);
                result.put("success", false);
                result.put("message", "保存失败: " + e.getMessage());
            }
            }
        }
        writeJson(response, result);
        return null;
    }

    private String trimOf(Object v) {
        return v == null ? "" : String.valueOf(v).trim();
    }

    private String nonBlankSubmittedOrCurrent(
            Map<String, Object> params, String key, String current) {
        if (!params.containsKey(key)) {
            return nvl(current);
        }
        String submitted = trimOf(params.get(key));
        return submitted.length() == 0 ? nvl(current) : submitted;
    }

    private String validateBaseUrl(String value, String label) {
        String normalized = EuConfig.normalizeBaseUrl(value);
        try {
            URI uri = new URI(normalized);
            String scheme = uri.getScheme();
            boolean http = "http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme);
            if (!http || uri.getHost() == null || uri.getHost().trim().length() == 0
                    || uri.getRawUserInfo() != null || uri.getRawQuery() != null
                    || uri.getRawFragment() != null) {
                throw new IllegalArgumentException();
            }
            return normalized;
        } catch (Exception e) {
            throw new IllegalArgumentException(label + "必须是有效的 http/https 根地址");
        }
    }

    private String getEffectiveSecret(ConfigManager cm) {
        String secret = getConfigValue(cm, "filez.secret");
        if (secret == null || secret.trim().length() == 0) {
            secret = euConfig == null ? "" : euConfig.getSecret();
        }
        if (secret == null || secret.trim().length() == 0) {
            secret = FileZUtil.getSecret();
        }
        return secret == null ? "" : secret.trim();
    }

    private String maskSecret(String secret) {
        String value = secret == null ? "" : secret.trim();
        if (value.length() == 0) {
            return "";
        }
        if (value.length() <= 2) {
            return "******";
        }
        int visible = value.length() <= 8 ? 1 : 4;
        return value.substring(0, visible) + "******"
                + value.substring(value.length() - visible);
    }

    private boolean ensureConfigAdmin(
            HttpServletRequest request, HttpServletResponse response) {
        User user = AppContext.getCurrentUser();
        if (user != null && user.isSystemAdmin()) {
            return true;
        }
        setNoStoreHeaders(response);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("success", false);
        result.put("message", "无权访问 FileZ 配置");
        log.warn("[FileZ配置] 拒绝非管理员访问, remoteAddr=" + request.getRemoteAddr());
        writeJson(response, result);
        return false;
    }

    private boolean ensurePost(
            HttpServletRequest request, HttpServletResponse response) {
        if ("POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        setNoStoreHeaders(response);
        response.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        response.setHeader("Allow", "POST");
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("success", false);
        result.put("message", "该接口只允许 POST 请求");
        writeJson(response, result);
        return false;
    }

    private void setNoStoreHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control",
                "private, no-store, no-cache, max-age=0, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0L);
    }

    /** DB 无值时的运行时回退值 */
    private String getRuntimeFallback(String key) {
        if (euConfig == null) return "";
        if ("filez.oaUrl".equals(key)) return nvl(euConfig.getOaUrl());
        if ("filez.fileZurl".equals(key)) return nvl(euConfig.getFileZurl());
        if ("filez.repoId".equals(key)) return nvl(euConfig.getRepoId());
        if ("filez.redStrings".equals(key)) return nvl(euConfig.getRedStrings());
        if ("filez.redTableStrings".equals(key)) return nvl(euConfig.getRedTableStrings());
        return "";
    }

    private String nvl(String v) {
        return v == null ? "" : v;
    }

    private String getConfigValue(ConfigManager cm, String key) {
        ConfigItem item = cm.getConfigItem(EuConfig.CONFIG_CATEGORY, key);
        return (item != null && item.getConfigValue() != null) ? item.getConfigValue() : "";
    }

    private void saveConfigValue(ConfigManager cm, String key, String value) {
        ConfigItem item = cm.getConfigItem(EuConfig.CONFIG_CATEGORY, key);
        if (item == null) {
            item = new ConfigItem();
            item.setId(UUIDLong.longUUID());
            item.setConfigCategory(EuConfig.CONFIG_CATEGORY);
            item.setConfigItem(key);
            item.setConfigValue(value);
            cm.addConfigItem(item);
        } else {
            item.setConfigValue(value);
            cm.updateConfigItem(item);
        }
    }

    private void writeJson(HttpServletResponse response, Map<String, Object> data) {
        try {
            response.setCharacterEncoding("utf-8");
            response.setContentType("application/json;charset=utf-8");
            PrintWriter out = response.getWriter();
            out.println(JSONUtil.toJSONString(data));
        } catch (Exception e) {
            log.error("writeJson", e);
        }
    }
    //gjx-end

    public ModelAndView fileZInitDialog(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("apps/eu/fileZInitDialog");
        return mav;
    }

    public ModelAndView selectRedTemplate(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("apps/eu/selectRedTemplate");
        return mav;
    }

    //编辑sdk入口页面
    public ModelAndView fileZsdkEdit(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("apps/eu/fileZsdkEdit");
        String fileZurl = request.getParameter("fileZurl");
        mav.addObject("fileZurl", fileZurl);
        return mav;
    }

    //浏览sdk入口页面 给h5用的 h5不支持直接跳转
    public ModelAndView fileZsdkView(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("apps/eu/fileZsdkView");
        String fileZurl = request.getParameter("fileZurl");
        mav.addObject("fileZurl", fileZurl);
        return mav;
    }

    //套红sdk入口页面
    public ModelAndView fileZsdkShow(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ModelAndView mav = new ModelAndView("apps/eu/fileZsdkShow");
        String fileZurl = request.getParameter("fileZurl");
        String redJson = request.getParameter("redJson");
        String redTableJSON = request.getParameter("redTableJSON");
        mav.addObject("fileZurl", fileZurl);
        mav.addObject("redJson", redJson);
        mav.addObject("redTableJSON", redTableJSON);
        return mav;
    }

    public ModelAndView download(HttpServletRequest request, HttpServletResponse response) throws Exception {
        //注意，此次更新兼容2016-2022期间的历史老公文 2026/6/3
        String sfileId = request.getParameter("fileId");
        String fileName = request.getParameter("fileName");
        String desFileName = DesUtil.decode(fileName, "123456");

        V3XFile v3xFile = fileManager.getV3XFile(NumberUtils.toLong(sfileId));
        Date createDate = new Date();
        if (v3xFile != null) {
            createDate = v3xFile.getCreateDate();
        }

        File downloadFile = fileManager.getFile(NumberUtils.toLong(sfileId), createDate);

        if (downloadFile != null && downloadFile.exists()) {
            byte[] fileBytes = FileUtils.readFileToByteArray(downloadFile);

            //gjx-start：2026-07-10 智能解包逻辑提取到 EuFileUnpackUtil
            fileBytes = EuFileUnpackUtil.smartUnpack(fileBytes);
            //gjx-end

            // 推流给前端或 FileZ
            InputStream is = new ByteArrayInputStream(fileBytes);
            request.setAttribute("filename", desFileName);
            FileUploadUtil.downLoadStream(request, response, is);
        } else {
            log.error("【下载接口】找不到物理文件，fileId:" + sfileId);
        }

        return null;
    }

    //gjx-start：2026-07-10 老公文页面"正文下载"按钮的下载入口
    // 与 download() 的区别：fileName 为明文（不做 DES 解码，供前端按钮直接拼接）；
    // 复用同一套"智能解包"逻辑（裸金格 DIRG / 致远 ZIP 包裹的金格或 .doc），
    // 保证 2016-2022 期间的历史老公文也能下到干净可打开的文件。
    // 前端调用：window.open 或隐藏 iframe 指向
    //   /seeyon/euFileZ.do?method=gjxFileDownload&fileId=<正文fileId>&fileName=<标题.扩展名>
    public ModelAndView gjxFileDownload(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String sfileId = request.getParameter("fileId");
        String fileName = request.getParameter("fileName");

        if (sfileId == null || sfileId.trim().length() == 0) {
            log.error("【正文下载】缺少 fileId 参数");
            return null;
        }
        // 文件名兜底
        if (fileName == null || fileName.trim().length() == 0) {
            fileName = "正文";
        }

        long fileId = NumberUtils.toLong(sfileId);
        V3XFile v3xFile = fileManager.getV3XFile(fileId);
        Date createDate = new Date();
        if (v3xFile != null) {
            createDate = v3xFile.getCreateDate();
            // 前端未带扩展名时，从 V3XFile 记录的原始文件名提取扩展名兜底
            if (fileName.indexOf('.') < 0) {
                String realName = v3xFile.getFilename();
                if (realName != null && realName.lastIndexOf('.') > -1) {
                    fileName = fileName + realName.substring(realName.lastIndexOf('.'));
                }
            }
        }

        File downloadFile = fileManager.getFile(fileId, createDate);
        if (downloadFile == null || !downloadFile.exists()) {
            log.error("【正文下载】找不到物理文件，fileId:" + sfileId);
            return null;
        }

        byte[] fileBytes = FileUtils.readFileToByteArray(downloadFile);

        // ===== 智能解包（金格/ZIP壳，统一走 EuFileUnpackUtil）=====
        fileBytes = EuFileUnpackUtil.smartUnpack(fileBytes);

        // ===== 附件下载：downLoadStream 依据 request 属性 filename 设置 Content-Disposition =====
        InputStream is = new ByteArrayInputStream(fileBytes);
        request.setAttribute("filename", fileName);
        FileUploadUtil.downLoadStream(request, response, is);
        log.info("【正文下载】完成，fileId:" + sfileId + ", fileName:" + fileName + ", size:" + fileBytes.length);
        return null;
    }
    //gjx-end

    public ModelAndView uploadFile(HttpServletRequest request, HttpServletResponse response) throws Exception {
        MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
        String fileId = multipartRequest.getParameter("fileId");
        String fileName = multipartRequest.getParameter("fileName");
        String desFileName = DesUtil.decode(fileName, "123456");
        String memberId = multipartRequest.getParameter("memberId");
        MultipartFile file = multipartRequest.getFile("file");
        long size = file.getSize();
        log.info("fileId:" + fileId);
        long sourceId = NumberUtils.toLong(fileId);
        V3XFile v3xFile = fileManager.getV3XFile(sourceId);
        Date date = new Date();
        if (v3xFile != null) {
            fileName = v3xFile.getFilename();
            v3xFile.setUpdateDate(date);
            v3xFile.setSize(size);
            fileManager.save(v3xFile);
            //另一个路径也要替换 不影响下载
            CtpFile cacheFile2 = new CtpFile(getNewFilepath(v3xFile.getCreateDate(), v3xFile.getId()));
            FileUtils.copyToFile(file.getInputStream(), cacheFile2);
        } else {
            //还没入库 要从 file里取
            CtpFile cacheFile = fileManager.getFile(NumberUtils.toLong(fileId), new Date());
            FileUtils.copyToFile(file.getInputStream(), cacheFile);
            //另一个路径也要替换 不影响下载
            CtpFile cacheFile2 = new CtpFile(getNewFilepath(new Date(), NumberUtils.toLong(fileId)));
            FileUtils.copyToFile(file.getInputStream(), cacheFile2);
        }
        V3xOrgMember member = orgManager.getMemberById(NumberUtils.toLong(memberId));
        Map<String, Object> metaMap = new HashMap<String, Object>();
        metaMap.put("id", fileId);
        metaMap.put("name", desFileName);
        metaMap.put("modified_at", DateUtil.format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"));//最后 修改时间
        Map<String, Object> created_by = new HashMap<String, Object>();
        created_by.put("id", member.getId() + "");
        created_by.put("name", member.getName());
        metaMap.put("created_by", created_by);
        Map<String, Object> permissions = new HashMap<String, Object>();
        permissions.put("write", true);
        permissions.put("read", true);
        metaMap.put("permissions", permissions);//是否有读权限
        rendText(response, JSONUtil.toJSONString(metaMap));
        return null;
    }

    private String getNewFilepath(Date createDate, Long newFileId) throws Exception {
        return getFolder(createDate, true) + File.separator + newFileId;
    }

    private String getFolder(Date createDate, boolean createWhenNoExist) throws Exception {
        return partitionManager.getFolder(createDate, createWhenNoExist);
    }

    //fileZ套红回调 通知
    public ModelAndView fileZredReturn(HttpServletRequest request, HttpServletResponse response) {
        try {
            String body = getBody(request);
            //{"taskId":"ac077fcb-409a-4edf-acb2-605ce4c751b5","code":"TaskSuccessNotify","detail":{"taskStatus":"SUCCESS","defaultDownloadPath":"/docs/publicapi/v1/download","contentId":"67d2be584f0b0e8065629183","startTime":1741864533653,"endTime":1741864536073,"filename":"日报.docx"}}
            log.info("Filez附件回调的body参数" + body);
            Map<String, Object> startMap = JSON.parseObject(body, Map.class);
            euFileZManager.saveRed(startMap);
            Map<String, Object> edocReturn = new HashMap<String, Object>();
            edocReturn.put("code", "0");
            edocReturn.put("msg", "成功");
            response.setCharacterEncoding("utf-8");
            response.setContentType("application/json;charset=utf-8");// json
            PrintWriter out = response.getWriter();
            String res = JSONUtil.toJSONString(edocReturn);
            log.info("套红回调OA返回值" + res);
            out.println(res);
        } catch (Exception e) {
            log.error("fileZredReturn", e);
        }
        return null;
    }

    //fileZ转pdf调 通知
    public ModelAndView fileZpdfReturn(HttpServletRequest request, HttpServletResponse response) {
        try {
            String body = getBody(request);
            //{"taskId":"ac077fcb-409a-4edf-acb2-605ce4c751b5","code":"TaskSuccessNotify","detail":{"taskStatus":"SUCCESS","defaultDownloadPath":"/docs/publicapi/v1/download","contentId":"67d2be584f0b0e8065629183","startTime":1741864533653,"endTime":1741864536073,"filename":"日报.docx"}}
            log.info("Filez转pdf回调的body参数" + body);
            Map<String, Object> startMap = JSON.parseObject(body, Map.class);
            euFileZManager.savePdf(startMap);
            Map<String, Object> edocReturn = new HashMap<String, Object>();
            edocReturn.put("code", "0");
            edocReturn.put("msg", "成功");
            response.setCharacterEncoding("utf-8");
            response.setContentType("application/json;charset=utf-8");// json
            PrintWriter out = response.getWriter();
            String res = JSONUtil.toJSONString(edocReturn);
            log.info("转pdf回调OA返回值" + res);
            out.println(res);
        } catch (Exception e) {
            log.error("fileZpdfReturn", e);
        }
        return null;
    }

    //gjx-start：2026-07-14 fileZ清稿回调 通知（ClearDoc 任务完成后 FileZ 回调此端点，转交 saveClear 落盘）
    public ModelAndView fileZclearReturn(HttpServletRequest request, HttpServletResponse response) {
        try {
            String body = getBody(request);
            //{"taskId":"...","code":"TaskSuccessNotify","detail":{"taskStatus":"SUCCESS","defaultDownloadPath":"/docs/publicapi/v1/download","contentId":"...","filename":"正文.docx"}}
            log.info("Filez清稿回调的body参数" + body);
            Map<String, Object> startMap = JSON.parseObject(body, Map.class);
            euFileZManager.saveClear(startMap);
            Map<String, Object> edocReturn = new HashMap<String, Object>();
            edocReturn.put("code", "0");
            edocReturn.put("msg", "成功");
            response.setCharacterEncoding("utf-8");
            response.setContentType("application/json;charset=utf-8");// json
            PrintWriter out = response.getWriter();
            String res = JSONUtil.toJSONString(edocReturn);
            log.info("清稿回调OA返回值" + res);
            out.println(res);
        } catch (Exception e) {
            log.error("fileZclearReturn", e);
        }
        return null;
    }
    //gjx-end

    //fileZ水印回调 通知
    public ModelAndView fileZwaterReturn(HttpServletRequest request, HttpServletResponse response) {
        try {
            String body = getBody(request);
            //{"taskId":"ac077fcb-409a-4edf-acb2-605ce4c751b5","code":"TaskSuccessNotify","detail":{"taskStatus":"SUCCESS","defaultDownloadPath":"/docs/publicapi/v1/download","contentId":"67d2be584f0b0e8065629183","startTime":1741864533653,"endTime":1741864536073,"filename":"日报.docx"}}
            log.info("Filez水印回调的body参数" + body);
            Map<String, Object> startMap = JSON.parseObject(body, Map.class);
            euFileZManager.saveWater(startMap);
            Map<String, Object> edocReturn = new HashMap<String, Object>();
            edocReturn.put("code", "0");
            edocReturn.put("msg", "成功");
            response.setCharacterEncoding("utf-8");
            response.setContentType("application/json;charset=utf-8");// json
            PrintWriter out = response.getWriter();
            String res = JSONUtil.toJSONString(edocReturn);
            log.info("水印回调OA返回值" + res);
            out.println(res);
        } catch (Exception e) {
            log.error("fileZwaterReturn", e);
        }
        return null;
    }

    public String getBody(HttpServletRequest request) {
        StringBuilder sb = new StringBuilder();
        BufferedReader br = null;
        try {
            br = new BufferedReader(new InputStreamReader(request.getInputStream(), "utf-8"));
            String line = null;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            log.error(e);
        } finally {
            IOUtils.closeQuietly(br);
        }
        return sb.toString();
    }


    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setOrgManager(OrgManager orgManager) {
        this.orgManager = orgManager;
    }

    public void setPartitionManager(PartitionManager partitionManager) {
        this.partitionManager = partitionManager;
    }

    public void setEuFileZManager(EuFileZManager euFileZManager) {
        this.euFileZManager = euFileZManager;
    }

    //gjx-start：2026-07-15 套红字段动态配置（配置页"套红字段"页签三接口）

    /** 发文单主表固定系统列，不参与套红配置 */
    private static final Set<String> RF_SYSTEM_FIELDS = new HashSet<String>(Arrays.asList(
            "id", "state", "start_member_id", "start_date", "approve_member_id", "approve_date",
            "finishedflag", "ratifyflag", "ratify_member_id", "ratify_date", "sort",
            "modify_member_id", "modify_date"));

    /** 意见类元素绑定：值在意见表而非表单数据表，v1 不支持套入（配置页置灰） */
    private static final Set<String> RF_OPINION_MAPPINGS = new HashSet<String>(Arrays.asList(
            "qianfa", "huiqian", "shenhe", "fuhe"));

    /**
     * 发文单列表：GET /seeyon/euFileZ.do?method=redFieldForms
     * 返回 {success, forms:[{id, name, configured}]}；id 用字符串防 JS long 精度丢失。
     */
    public ModelAndView redFieldForms(HttpServletRequest request, HttpServletResponse response) {
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> result = new HashMap<String, Object>();
        List<Map<String, Object>> forms = new ArrayList<Map<String, Object>>();
        JDBCAgent jdbc = new JDBCAgent();
        try {
            jdbc.execute("select ID, NAME from form_definition where FORM_TYPE = 6 and DELETE_FLAG = 0 order by MODIFY_TIME desc");
            ResultSet rs = jdbc.getQueryResult();
            while (rs.next()) {
                long id = rs.getLong(1);
                Map<String, Object> row = new HashMap<String, Object>();
                row.put("id", String.valueOf(id));
                row.put("name", rs.getString(2));
                int cfgCount = EuRedFieldConfigUtil.loadConfig(Long.valueOf(id)).size();
                row.put("configured", cfgCount > 0);
                row.put("configuredCount", Integer.valueOf(cfgCount));
                forms.add(row);
            }
            result.put("success", true);
        } catch (Exception e) {
            log.error("redFieldForms", e);
            result.put("success", false);
            result.put("message", "读取发文单列表失败: " + e.getMessage());
        } finally {
            try { jdbc.close(); } catch (Exception ignored) { }
        }
        result.put("forms", forms);
        writeJson(response, result);
        return null;
    }

    /**
     * 字段实时对账：GET /seeyon/euFileZ.do?method=redFieldList&formId=xxx
     * 实时解析 form_definition.FIELD_INFO 主表字段，与已存配置合并：
     * 新字段未勾选出现、显示名变更提示、字段已删标 missing、意见/附件置灰。
     */
    public ModelAndView redFieldList(HttpServletRequest request, HttpServletResponse response) {
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> result = new HashMap<String, Object>();
        try {
            long formId = Long.parseLong(request.getParameter("formId"));

            String fieldInfo = null;
            String formName = null;
            JDBCAgent jdbc = new JDBCAgent();
            try {
                List<Object> args = new ArrayList<Object>();
                args.add(Long.valueOf(formId));
                jdbc.execute("select NAME, FIELD_INFO from form_definition where ID = ? and DELETE_FLAG = 0", args);
                ResultSet rs = jdbc.getQueryResult();
                if (rs.next()) {
                    formName = rs.getString(1);
                    fieldInfo = rs.getString(2);
                }
            } finally {
                try { jdbc.close(); } catch (Exception ignored) { }
            }
            if (Strings.isBlank(fieldInfo)) {
                result.put("success", false);
                result.put("message", "未找到该发文单或其字段定义为空");
                writeJson(response, result);
                return null;
            }

            // 意见/附件类字段不支持文本套入：直接不进列表（页面有统一文案说明）
            List<Map<String, Object>> fields = new ArrayList<Map<String, Object>>();
            for (Map<String, Object> f : parseMasterFields(fieldInfo)) {
                String mapping = f.get("mappingField") == null ? "" : String.valueOf(f.get("mappingField"));
                if (RF_OPINION_MAPPINGS.contains(mapping) || "attachments".equals(mapping)) {
                    continue;
                }
                fields.add(f);
            }

            // 实时字段 ⊕ 已存配置 对账
            List<Map<String, Object>> cfgRows = EuRedFieldConfigUtil.loadConfig(Long.valueOf(formId));
            Map<String, Map<String, Object>> cfgByField = new LinkedHashMap<String, Map<String, Object>>();
            for (Map<String, Object> c : cfgRows) {
                cfgByField.put(String.valueOf(c.get("fieldName")), c);
            }

            for (Map<String, Object> f : fields) {
                String fieldName = String.valueOf(f.get("fieldName"));
                String display = String.valueOf(f.get("display"));

                Map<String, Object> c = cfgByField.remove(fieldName);
                f.put("checked", c != null);
                f.put("bookmark", c != null ? String.valueOf(c.get("bookmark")) : display);
                f.put("status", "normal");
                if (c != null) {
                    String oldDisplay = c.get("display") == null ? "" : String.valueOf(c.get("display"));
                    if (Strings.isNotBlank(oldDisplay) && !oldDisplay.equals(display)) {
                        f.put("status", "renamed");
                        f.put("oldDisplay", oldDisplay);
                    }
                }
            }

            // 配置里有、表单里已不存在的字段：标失效（运行时会自动跳过；保存时若未勾选即被清理）
            for (Map.Entry<String, Map<String, Object>> entry : cfgByField.entrySet()) {
                Map<String, Object> c = entry.getValue();
                Map<String, Object> f = new LinkedHashMap<String, Object>();
                f.put("fieldName", entry.getKey());
                f.put("display", c.get("display") == null ? entry.getKey() : c.get("display"));
                f.put("fieldType", "");
                f.put("mappingField", "");
                f.put("checked", true);
                f.put("bookmark", c.get("bookmark"));
                f.put("status", "missing");
                fields.add(f);
            }

            result.put("success", true);
            result.put("formId", String.valueOf(formId));
            result.put("formName", formName);
            result.put("fields", fields);
        } catch (Exception e) {
            log.error("redFieldList", e);
            result.put("success", false);
            result.put("message", "读取字段失败: " + e.getMessage());
        }
        writeJson(response, result);
        return null;
    }

    /**
     * 保存配置：POST /seeyon/euFileZ.do?method=redFieldSave
     * body: {formId:"xxx", items:[{fieldName, display, bookmark, sort}]}
     * 差量写 ctp_config（category=eu_filez_red_fields），即存即生效；items 为空 = 清空该表单配置。
     */
    @SuppressWarnings("unchecked")
    public ModelAndView redFieldSave(HttpServletRequest request, HttpServletResponse response) {
        if (!ensurePost(request, response)) {
            return null;
        }
        if (!ensureConfigAdmin(request, response)) {
            return null;
        }
        setNoStoreHeaders(response);
        Map<String, Object> result = new HashMap<String, Object>();
        try {
            String body = getBody(request);
            log.info("[套红字段配置] 保存请求: " + body);
            Map<String, Object> params = JSON.parseObject(body, Map.class);
            long formId = Long.parseLong(String.valueOf(params.get("formId")));
            List<Map<String, Object>> items = (List<Map<String, Object>>) (List<?>) params.get("items");

            // 服务端校验：书签名非空且同表单内不重复
            Set<String> seen = new HashSet<String>();
            if (items != null) {
                for (Map<String, Object> it : items) {
                    String bm = it.get("bookmark") == null ? "" : String.valueOf(it.get("bookmark")).trim();
                    if (bm.length() == 0) {
                        result.put("success", false);
                        result.put("message", "存在书签名为空的勾选字段: " + it.get("display"));
                        writeJson(response, result);
                        return null;
                    }
                    if (!seen.add(bm)) {
                        result.put("success", false);
                        result.put("message", "书签名重复: " + bm);
                        writeJson(response, result);
                        return null;
                    }
                }
            }

            Map<String, Object> stat = EuRedFieldConfigUtil.saveConfig(Long.valueOf(formId), items);
            result.put("success", true);
            result.put("message", "已保存并即时生效（新增" + stat.get("added")
                    + "、更新" + stat.get("updated") + "、移除" + stat.get("removed") + "）");
        } catch (Exception e) {
            log.error("redFieldSave", e);
            result.put("success", false);
            result.put("message", "保存失败: " + e.getMessage());
        }
        writeJson(response, result);
        return null;
    }

    /** 解析 FIELD_INFO XML，取主表(tabletype=master)业务字段（跳过系统列与主键） */
    private List<Map<String, Object>> parseMasterFields(String fieldInfoXml) throws Exception {
        List<Map<String, Object>> out = new ArrayList<Map<String, Object>>();
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        try {
            dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        } catch (Exception ignored) { }
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(new InputSource(new StringReader(fieldInfoXml)));
        NodeList tables = doc.getElementsByTagName("Table");
        for (int i = 0; i < tables.getLength(); i++) {
            Element table = (Element) tables.item(i);
            if (!"master".equalsIgnoreCase(table.getAttribute("tabletype"))) {
                continue;
            }
            NodeList fieldNodes = table.getElementsByTagName("Field");
            for (int j = 0; j < fieldNodes.getLength(); j++) {
                Element f = (Element) fieldNodes.item(j);
                String name = f.getAttribute("name");
                if (Strings.isBlank(name) || RF_SYSTEM_FIELDS.contains(name)
                        || "true".equalsIgnoreCase(f.getAttribute("is_primary"))) {
                    continue;
                }
                Map<String, Object> row = new LinkedHashMap<String, Object>();
                row.put("fieldName", name);
                row.put("display", f.getAttribute("display"));
                row.put("fieldType", f.getAttribute("fieldtype"));
                row.put("mappingField", f.getAttribute("mappingField"));
                out.add(row);
            }
        }
        return out;
    }
    //gjx-end

}
