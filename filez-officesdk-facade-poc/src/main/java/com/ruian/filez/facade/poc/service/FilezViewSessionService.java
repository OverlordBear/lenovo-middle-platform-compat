package com.ruian.filez.facade.poc.service;

import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.ConfigException;
import com.ruian.filez.facade.poc.filez.DriverUrlBuilder;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.CapabilityException;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.FileBinding;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.Grant;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.IssuedCapability;
import com.seeyon.apps.edoc.api.EdocApi;
import com.seeyon.apps.edoc.bo.EdocBodyBO;
import com.seeyon.ctp.common.AppContext;
import com.seeyon.ctp.common.ModuleType;
import com.seeyon.ctp.common.affair.manager.AffairManager;
import com.seeyon.ctp.common.affair.util.AffairUtil;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.content.affair.constants.StateEnum;
import com.seeyon.ctp.common.content.mainbody.MainbodyManager;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.po.affair.CtpAffair;
import com.seeyon.ctp.common.po.content.CtpContentAll;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.organization.dao.OrgHelper;
import com.seeyon.ctp.secret.bo.FileSecretLevel;
import com.seeyon.ctp.secret.manager.AppSecretLevelManager;
import com.seeyon.ctp.secret.manager.CtpDeviceSecretManager;
import com.seeyon.v3x.common.security.SecurityCheck;
import com.seeyon.v3x.common.security.SecurityCheckParam;

/**
 * Performs authenticated object authorization and creates read-only sessions.
 */
public class FilezViewSessionService {

    private static final Log LOG =
            LogFactory.getLog(FilezViewSessionService.class);

    public static final String CODE_AUTH_REQUIRED = "AUTH_REQUIRED";
    public static final String CODE_FORBIDDEN = "FORBIDDEN";
    public static final String CODE_FILE_NOT_BODY = "FILE_NOT_BODY";
    public static final String CODE_CONFIG_MISSING = "CONFIG_MISSING";
    public static final String CODE_FILE_FORMAT_UNSUPPORTED =
            "FILE_FORMAT_UNSUPPORTED";
    public static final String CODE_METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED";
    public static final String CODE_INTERNAL = "INTERNAL";
    public static final String CODE_CONFLICT = "CONFLICT";

    private static final Set<Integer> ALLOWED_AFFAIR_APPS =
            new HashSet<Integer>(Arrays.asList(
                    Integer.valueOf(ApplicationCategoryEnum.govdoc.key()),
                    Integer.valueOf(ApplicationCategoryEnum.govdocSend.key()),
                    Integer.valueOf(ApplicationCategoryEnum.govdocRec.key()),
                    Integer.valueOf(ApplicationCategoryEnum.govdocExchange.key()),
                    Integer.valueOf(ApplicationCategoryEnum.govdocSign.key()),
                    Integer.valueOf(ApplicationCategoryEnum.edoc.key()),
                    Integer.valueOf(ApplicationCategoryEnum.edocSend.key()),
                    Integer.valueOf(ApplicationCategoryEnum.edocRec.key()),
                    Integer.valueOf(ApplicationCategoryEnum.edocSign.key())));

    private final FilezRuntimeConfig runtimeConfig = new FilezRuntimeConfig();
    private final DriverUrlBuilder driverUrlBuilder = new DriverUrlBuilder();

    private AffairManager affairManager;
    private FileManager fileManager;
    private EdocApi edocApi;
    private MainbodyManager ctpMainbodyManager;
    private AppSecretLevelManager appSecretLevelManager;
    private CtpDeviceSecretManager ctpDeviceSecretManager;
    private FilezCapabilityService ruianFileZCapabilityService;

    public CreateResult createViewSession(
            Map<String, Object> parameters,
            User user,
            String contextPath) throws FacadeException {
        long startedAt = System.nanoTime();
        long checkpoint = startedAt;
        long validationMs;
        long configMs;
        long affairMs;
        long authorizationMs;
        long bodyMs;
        long fileMs;
        long capabilityMs;

        requireAuthenticated(user);
        requireDependencies();

        long affairId = parseSignedLong(value(parameters, "affairId"), "affairId");
        long fileId = parseSignedLong(value(parameters, "fileId"), "fileId");
        String fileType = normalizeFileType(value(parameters, "fileType"));
        String category = stringValue(value(parameters, "category"));
        String mode = stringValue(value(parameters, "mode")).toLowerCase(Locale.ENGLISH);

        if (!"4".equals(category) || !"view".equals(mode)) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Request is outside the read-only govdoc scope");
        }
        if (!isOfficeBodyExtension(fileType)) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "Only Word/Excel-format bodies are supported");
        }
        validationMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();

        FilezRuntimeConfig.Snapshot config = loadConfig();
        configMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();
        CtpAffair affair = loadAffair(affairId);
        affairMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();
        authorizeAffair(affair, user);
        authorizationMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();

        Long summaryIdValue = affair.getObjectId();
        if (summaryIdValue == null || summaryIdValue.longValue() == 0L) {
            throw new FacadeException(CODE_FORBIDDEN, "Affair has no valid object");
        }
        long summaryId = summaryIdValue.longValue();

        AuthorizedBody body = findAuthorizedBody(summaryId, fileId);
        bodyMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();
        V3XFile file = loadFile(fileId);
        if (!isSupportedOfficeBody(body, file, fileType)) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "The authorized body does not match the requested Word/Excel format");
        }
        if (file.getSize() != null
                && file.getSize().longValue() > config.getMaxFileBytes()) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "The authorized body exceeds the read-only size limit");
        }
        fileMs = elapsedMillis(checkpoint);
        checkpoint = System.nanoTime();

        String serverFileName = chooseServerFileName(file, body, fileType);
        FileBinding binding = new FileBinding(
                affairId,
                summaryId,
                fileId,
                serverFileName,
                file.getMimeType(),
                body.getContentType(),
                file.getCreateDate(),
                file.getUpdateDate(),
                config.getMaxFileBytes(),
                safeUserValue(user.getName()),
                safeUserValue(user.getLoginName()));

        String sessionId = ruianFileZCapabilityService.newSessionId();
        String nonce = ruianFileZCapabilityService.newNonce();
        IssuedCapability wrapper;
        try {
            wrapper = ruianFileZCapabilityService.issueWrapper(
                    binding,
                    user.getId().longValue(),
                    sessionId,
                    nonce,
                    config.getWrapperTicketTtlSeconds());
        } catch (CapabilityException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to allocate a read-only session", e);
        }
        capabilityMs = elapsedMillis(checkpoint);

        String normalizedContext = normalizeContextPath(contextPath);
        String viewUrl = normalizedContext
                + "/ruianFileZView.do?method=wrapper&ticket="
                + wrapper.getToken();
        CreateResult result = new CreateResult(
                viewUrl,
                sessionId,
                nonce,
                wrapper.getExpiresAt());
        LOG.info(
                "FileZ view session timing: totalMs="
                + elapsedMillis(startedAt)
                + ", validationMs=" + validationMs
                + ", configMs=" + configMs
                + ", affairMs=" + affairMs
                + ", authorizationMs=" + authorizationMs
                + ", bodyMs=" + bodyMs
                + ", fileMs=" + fileMs
                + ", capabilityMs=" + capabilityMs);
        return result;
    }

    /**
     * Reuses the proven govdoc object checks for the independently packaged
     * edit service.  Editing is deliberately narrower than viewing: only a
     * current pending or wait-send affair may authorize an existing body.
     */
    public FileBinding authorizeExistingEditBody(
            Map<String, Object> parameters,
            User user) throws FacadeException {
        requireAuthenticated(user);
        requireDependencies();
        if (!runtimeConfig.isEditEnabled()) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "FileZ edit mode is disabled");
        }

        long affairId = parseSignedLong(value(parameters, "affairId"), "affairId");
        long fileId = parseSignedLong(value(parameters, "fileId"), "fileId");
        String fileType = normalizeFileType(value(parameters, "fileType"));
        String category = stringValue(value(parameters, "category"));
        String mode = stringValue(value(parameters, "mode"))
                .toLowerCase(Locale.ENGLISH);
        if (!"4".equals(category) || !"edit".equals(mode)) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Request is outside the editable govdoc scope");
        }
        if (!isOfficeBodyExtension(fileType)) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "Only Word/Excel-format bodies are supported");
        }

        FilezRuntimeConfig.Snapshot config = loadConfig();
        CtpAffair affair = loadAffair(affairId);
        authorizeAffair(affair, user);
        Integer affairState = affair.getState();
        if (affairState == null
                || (affairState.intValue() != StateEnum.col_waitSend.key()
                    && affairState.intValue() != StateEnum.col_pending.key())) {
            throw new FacadeException(
                    CODE_FORBIDDEN,
                    "The current govdoc affair is not in an editable state");
        }

        Long summaryIdValue = affair.getObjectId();
        if (summaryIdValue == null || summaryIdValue.longValue() == 0L) {
            throw new FacadeException(CODE_FORBIDDEN, "Affair has no valid object");
        }
        long summaryId = summaryIdValue.longValue();
        AuthorizedBody body = findAuthorizedBody(summaryId, fileId);
        V3XFile file = loadFile(fileId);
        if (!isSupportedOfficeBody(body, file, fileType)) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "The authorized body does not match the requested Word/Excel format");
        }
        if (file.getSize() != null
                && file.getSize().longValue() > config.getMaxFileBytes()) {
            throw new FacadeException(
                    CODE_FILE_FORMAT_UNSUPPORTED,
                    "The authorized body exceeds the edit size limit");
        }

        return new FileBinding(
                affairId,
                summaryId,
                fileId,
                chooseServerFileName(file, body, fileType),
                file.getMimeType(),
                body.getContentType(),
                file.getCreateDate(),
                file.getUpdateDate(),
                config.getMaxFileBytes(),
                safeUserValue(user.getName()),
                safeUserValue(user.getLoginName()));
    }

    private static long elapsedMillis(long startedAt) {
        return (System.nanoTime() - startedAt) / 1000000L;
    }

    public WrapperPayload openWrapper(
            String wrapperTicket,
            User user,
            String contextPath) throws FacadeException {
        requireAuthenticated(user);
        requireDependencies();
        FilezRuntimeConfig.Snapshot config = loadConfig();

        Grant wrapper = ruianFileZCapabilityService.consumeWrapper(
                wrapperTicket, user.getId().longValue());
        if (wrapper == null) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Read-only session is invalid or expired");
        }

        IssuedCapability content;
        try {
            content = ruianFileZCapabilityService.issueContent(
                    wrapper, config.getContentTokenTtlSeconds());
        } catch (CapabilityException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to allocate content access", e);
        }

        try {
            String downloadUrl =
                    config.buildDownloadUrl(normalizeContextPath(contextPath));
            String driverUrl = driverUrlBuilder.buildViewUrl(
                    config,
                    wrapper.getBinding(),
                    user.getId().longValue(),
                    content.getToken(),
                    downloadUrl);
            return new WrapperPayload(
                    driverUrl,
                    config.getFilezOrigin(),
                    wrapper.getSessionId(),
                    wrapper.getNonce(),
                    content.getExpiresAt());
        } catch (ConfigException e) {
            throw new FacadeException(
                    CODE_CONFIG_MISSING,
                    "FileZ callback configuration is invalid",
                    e);
        } catch (RuntimeException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to construct FileZ view", e);
        }
    }

    private CtpAffair loadAffair(long affairId) throws FacadeException {
        try {
            CtpAffair affair = affairManager.get(Long.valueOf(affairId));
            if (affair == null) {
                affair = affairManager.getByHis(Long.valueOf(affairId));
            }
            if (affair == null) {
                throw new FacadeException(CODE_FORBIDDEN, "Affair was not found");
            }
            return affair;
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(CODE_INTERNAL, "Unable to load affair", e);
        }
    }

    private void authorizeAffair(CtpAffair affair, User user)
            throws FacadeException {
        if (Boolean.TRUE.equals(affair.isDelete())
                || !AffairUtil.isAfffairValid(affair)) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Affair is deleted, cancelled, or no longer valid");
        }

        Integer app = affair.getApp();
        if (app == null || !ALLOWED_AFFAIR_APPS.contains(app)) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Affair is not a govdoc object");
        }

        Long userId = user.getId();
        boolean member = sameId(userId, affair.getMemberId());
        boolean proxy = sameId(userId, affair.getProxyMemberId());
        boolean transactor = sameId(userId, affair.getTransactorId());
        if (!member && !proxy && !transactor) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "Current user is not a participant in the affair");
        }

        SecurityCheckParam security =
                new SecurityCheckParam(
                        ApplicationCategoryEnum.edoc,
                        user,
                        affair.getObjectId());
        security.setAffair(affair);
        // Use a fixed ordinary govdoc entry mode. It passes A8's enum
        // validation without trusting client-supplied openFrom values or
        // activating any of the native special-purpose bypass branches.
        security.addExt("openFrom", "sended");
        if (!SecurityCheck.isLicit(security)) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "A8 security control rejected this govdoc");
        }

        enforceSecretLevel(affair);
    }

    private void enforceSecretLevel(CtpAffair affair) throws FacadeException {
        try {
            if (!OrgHelper.isSecretLevelEnable()) {
                return;
            }

            Long summaryId = affair.getObjectId();
            FileSecretLevel level =
                    appSecretLevelManager.getSecretLevelById(summaryId);
            if (level == null) {
                return;
            }
            if (!appSecretLevelManager.checkSecretLevelById(summaryId)) {
                throw new FacadeException(
                        CODE_FORBIDDEN,
                        "Current user cannot access this govdoc security level");
            }

            HttpServletRequest request = AppContext.getRawRequest();
            if (request == null
                    || !Boolean.TRUE.equals(
                            ctpDeviceSecretManager.isEnableFileSecByAddress(
                                    request, level.getValue()))) {
                throw new FacadeException(
                        CODE_FORBIDDEN,
                        "Current device cannot access this govdoc security level");
            }
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            // Security checks are fail-closed: an unavailable policy service
            // must never result in an anonymous content capability.
            throw new FacadeException(
                    CODE_FORBIDDEN, "Unable to validate govdoc security level", e);
        }
    }

    private AuthorizedBody findAuthorizedBody(long summaryId, long fileId)
            throws FacadeException {
        List<CtpContentAll> contents;
        try {
            contents =
                    ctpMainbodyManager.getContentListByModuleIdAndModuleType(
                            ModuleType.edoc,
                            Long.valueOf(summaryId),
                            true);
        } catch (RuntimeException e) {
            throw new FacadeException(
                    CODE_INTERNAL,
                    "Unable to load the A8 mainbody records",
                    e);
        }

        if (contents != null && !contents.isEmpty()) {
            CtpContentAll canonicalBody = null;
            int canonicalCount = 0;
            for (CtpContentAll content : contents) {
                if (isCanonicalOfficeContent(content, summaryId)) {
                    canonicalBody = content;
                    canonicalCount++;
                }
            }

            // CtpContentAll is authoritative whenever the govdoc has any
            // modern content rows. Requiring exactly one sort=1 Word/Excel body
            // prevents stale or duplicate mainbody records from authorizing a
            // file merely because its ID appeared somewhere in the history.
            if (canonicalCount == 1
                    && matchesOfficeContent(canonicalBody, summaryId, fileId)) {
                return new AuthorizedBody(
                        String.valueOf(canonicalBody.getContentType()),
                        canonicalBody.getTitle());
            }
            throw new FacadeException(
                    CODE_FILE_NOT_BODY,
                    "Requested file is not the unique current body of the authorized govdoc");
        }

        // Compatibility path for installations whose govdoc body has not
        // migrated to CtpContentAll. The legacy file binding must still match
        // the requested file ID exactly.
        List<EdocBodyBO> bodies;
        try {
            bodies = edocApi.getEdocBodysByPlugin(Long.valueOf(summaryId));
        } catch (RuntimeException e) {
            throw new FacadeException(CODE_INTERNAL, "Unable to load govdoc bodies", e);
        }
        if (bodies != null) {
            for (EdocBodyBO body : bodies) {
                if (body == null) {
                    continue;
                }
                Long bodyFileId = tryParseSignedLong(body.getContent());
                if (bodyFileId != null && bodyFileId.longValue() == fileId) {
                    return new AuthorizedBody(
                            body.getContentType(),
                            body.getContentName());
                }
            }
        }
        throw new FacadeException(
                CODE_FILE_NOT_BODY,
                "Requested file is not a body of the authorized govdoc");
    }

    private static boolean isCanonicalWordContent(
            CtpContentAll content, long summaryId) {
        return isCanonicalBodyRecord(content, summaryId)
                && content.getContentType() != null
                && (content.getContentType().intValue() == 41
                    || content.getContentType().intValue() == 43);
    }

    private static boolean isCanonicalOfficeContent(
            CtpContentAll content, long summaryId) {
        return isCanonicalBodyRecord(content, summaryId)
                && content.getContentType() != null
                && (content.getContentType().intValue() == 41
                    || content.getContentType().intValue() == 42
                    || content.getContentType().intValue() == 43
                    || content.getContentType().intValue() == 44);
    }

    private static boolean isCanonicalBodyRecord(
            CtpContentAll content, long summaryId) {
        return content != null
                && content.getModuleId() != null
                && content.getModuleId().longValue() == summaryId
                && content.getModuleType() != null
                && content.getModuleType().intValue() == ModuleType.edoc.getKey()
                && content.getSort() != null
                && content.getSort().intValue() == 1;
    }

    static boolean matchesWordContent(
            CtpContentAll content, long summaryId, long fileId) {
        if (!isCanonicalWordContent(content, summaryId)) {
            return false;
        }

        Long contentFileId = tryParseSignedLong(content.getContent());
        return contentFileId != null && contentFileId.longValue() == fileId;
    }

    static boolean matchesOfficeContent(
            CtpContentAll content, long summaryId, long fileId) {
        if (!isCanonicalOfficeContent(content, summaryId)) {
            return false;
        }

        Long contentFileId = tryParseSignedLong(content.getContent());
        return contentFileId != null && contentFileId.longValue() == fileId;
    }

    private V3XFile loadFile(long fileId) throws FacadeException {
        try {
            V3XFile file = fileManager.getV3XFile(Long.valueOf(fileId));
            if (file == null) {
                throw new FacadeException(
                        CODE_FILE_NOT_BODY, "Authorized body file was not found");
            }
            return file;
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(CODE_INTERNAL, "Unable to load body file", e);
        }
    }

    private FilezRuntimeConfig.Snapshot loadConfig() throws FacadeException {
        try {
            return runtimeConfig.loadValidated();
        } catch (ConfigException e) {
            throw new FacadeException(
                    CODE_CONFIG_MISSING,
                    "FileZ read-only configuration is incomplete or disabled",
                    e);
        }
    }

    private void requireAuthenticated(User user) throws FacadeException {
        if (user == null
                || user.getId() == null
                || Boolean.TRUE.equals(user.isGuest())) {
            throw new FacadeException(
                    CODE_AUTH_REQUIRED, "An authenticated A8 user is required");
        }
    }

    private void requireDependencies() throws FacadeException {
        if (affairManager == null
                || fileManager == null
                || edocApi == null
                || ctpMainbodyManager == null
                || appSecretLevelManager == null
                || ctpDeviceSecretManager == null
                || ruianFileZCapabilityService == null) {
            throw new FacadeException(
                    CODE_INTERNAL, "FileZ read-only facade is not initialized");
        }
    }

    private static boolean isSupportedOfficeBody(
            AuthorizedBody body, V3XFile file, String requestedFileType) {
        return matchesOfficeFamily(
                body.getContentType(),
                file.getFilename(),
                file.getMimeType(),
                requestedFileType);
    }

    static boolean matchesOfficeFamily(
            String bodyType,
            String fileName,
            String mimeType,
            String requestedFileType) {
        int bodyFamily = familyForBodyType(bodyType);
        int requestedFamily = familyForFileType(requestedFileType);
        if (bodyFamily == 0 || bodyFamily != requestedFamily) {
            return false;
        }

        // Filename and MIME metadata may confirm a body already authorized by
        // A8's content type, but can never turn another family into a match.
        int fileNameFamily = familyForFileName(fileName);
        int mimeFamily = familyForMime(mimeType);
        if ((fileNameFamily != 0 && fileNameFamily != bodyFamily)
                || (mimeFamily != 0 && mimeFamily != bodyFamily)) {
            return false;
        }
        return fileNameFamily == bodyFamily || mimeFamily == bodyFamily;
    }

    private static String chooseServerFileName(
            V3XFile file, AuthorizedBody body, String requestedFileType) {
        String name = sanitizeFileName(file.getFilename());
        if (name.length() == 0) {
            name = sanitizeFileName(body.getContentName());
        }
        if (name.length() == 0) {
            name = "document";
        }
        int bodyFamily = familyForBodyType(body.getContentType());
        if (familyForFileName(name) != bodyFamily) {
            name += defaultExtension(body.getContentType(), requestedFileType);
        }
        if (name.length() > 180) {
            name = name.substring(name.length() - 180);
        }
        return name;
    }

    private static String sanitizeFileName(String input) {
        String value = input == null ? "" : input.trim();
        int slash = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
        if (slash >= 0) {
            value = value.substring(slash + 1);
        }
        StringBuilder result = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c < 0x20 || c == 0x7f || c == '"' || c == ';') {
                result.append('_');
            } else {
                result.append(c);
            }
        }
        return result.toString().trim();
    }

    private static String normalizeFileType(Object value) {
        String result = stringValue(value).toLowerCase(Locale.ENGLISH);
        while (result.startsWith(".")) {
            result = result.substring(1);
        }
        return result;
    }

    private static boolean isOfficeBodyExtension(String value) {
        return familyForFileType(value) != 0;
    }

    private static int familyForBodyType(String value) {
        String bodyType = value == null ? "" : value.trim();
        if ("41".equals(bodyType)
                || "43".equals(bodyType)
                || "OfficeWord".equalsIgnoreCase(bodyType)
                || "WpsWord".equalsIgnoreCase(bodyType)) {
            return 1;
        }
        if ("42".equals(bodyType)
                || "44".equals(bodyType)
                || "OfficeExcel".equalsIgnoreCase(bodyType)
                || "WpsExcel".equalsIgnoreCase(bodyType)) {
            return 2;
        }
        return 0;
    }

    private static int familyForFileType(String value) {
        if ("doc".equals(value) || "docx".equals(value) || "wps".equals(value)) {
            return 1;
        }
        if ("xls".equals(value) || "xlsx".equals(value) || "et".equals(value)) {
            return 2;
        }
        return 0;
    }

    private static int familyForFileName(String value) {
        String fileName = value == null
                ? "" : value.toLowerCase(Locale.ENGLISH).trim();
        int dot = fileName.lastIndexOf('.');
        return dot < 0 ? 0 : familyForFileType(fileName.substring(dot + 1));
    }

    private static int familyForMime(String value) {
        String mime = value == null
                ? "" : value.toLowerCase(Locale.ENGLISH).trim();
        if (mime.contains("spreadsheet")
                || mime.contains("ms-excel")
                || mime.contains("wps-office.et")
                || mime.contains("kingsoft.et")) {
            return 2;
        }
        if (mime.contains("wordprocessing")
                || mime.contains("msword")
                || mime.contains("ms-word")
                || mime.contains("wps-office.wps")
                || mime.contains("kingsoft.writer")) {
            return 1;
        }
        return 0;
    }

    private static String defaultExtension(
            String bodyTypeValue, String requestedFileType) {
        String bodyType = bodyTypeValue == null ? "" : bodyTypeValue.trim();
        if ("43".equals(bodyType) || "WpsWord".equalsIgnoreCase(bodyType)) {
            return ".wps";
        }
        if ("44".equals(bodyType) || "WpsExcel".equalsIgnoreCase(bodyType)) {
            return ".et";
        }
        if (familyForBodyType(bodyType) == 2) {
            return "xls".equals(requestedFileType) ? ".xls" : ".xlsx";
        }
        return "doc".equals(requestedFileType) ? ".doc" : ".docx";
    }

    private static Object value(Map<String, Object> parameters, String key)
            throws FacadeException {
        if (parameters == null || !parameters.containsKey(key)) {
            throw new FacadeException(CODE_FORBIDDEN, "Required request field is missing");
        }
        return parameters.get(key);
    }

    private static long parseSignedLong(Object value, String field)
            throws FacadeException {
        Long parsed = tryParseSignedLong(value);
        if (parsed == null || parsed.longValue() == 0L) {
            throw new FacadeException(CODE_FORBIDDEN, field + " is invalid");
        }
        return parsed.longValue();
    }

    private static Long tryParseSignedLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Byte
                || value instanceof Short
                || value instanceof Integer
                || value instanceof Long) {
            return Long.valueOf(((Number) value).longValue());
        }
        String text = String.valueOf(value).trim();
        if (!text.matches("-?[0-9]{1,19}")) {
            return null;
        }
        try {
            return Long.valueOf(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static String safeUserValue(String value) {
        String result = value == null ? "" : value.trim();
        return result.length() > 128 ? result.substring(0, 128) : result;
    }

    private static boolean sameId(Long left, Long right) {
        return left != null && right != null
                && left.longValue() == right.longValue();
    }

    private static String normalizeContextPath(String contextPath) {
        String result = contextPath == null ? "" : contextPath.trim();
        if (result.length() > 0 && !result.startsWith("/")) {
            result = "/" + result;
        }
        while (result.endsWith("/") && result.length() > 1) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    public void setAffairManager(AffairManager affairManager) {
        this.affairManager = affairManager;
    }

    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setEdocApi(EdocApi edocApi) {
        this.edocApi = edocApi;
    }

    public void setCtpMainbodyManager(MainbodyManager ctpMainbodyManager) {
        this.ctpMainbodyManager = ctpMainbodyManager;
    }

    public void setAppSecretLevelManager(
            AppSecretLevelManager appSecretLevelManager) {
        this.appSecretLevelManager = appSecretLevelManager;
    }

    public void setCtpDeviceSecretManager(
            CtpDeviceSecretManager ctpDeviceSecretManager) {
        this.ctpDeviceSecretManager = ctpDeviceSecretManager;
    }

    public void setConfigManager(ConfigManager configManager) {
        this.runtimeConfig.setConfigManager(configManager);
    }

    public void setRuianFileZCapabilityService(
            FilezCapabilityService ruianFileZCapabilityService) {
        this.ruianFileZCapabilityService = ruianFileZCapabilityService;
    }

    private static final class AuthorizedBody {
        private final String contentType;
        private final String contentName;

        private AuthorizedBody(String contentType, String contentName) {
            this.contentType = contentType;
            this.contentName = contentName;
        }

        private String getContentType() {
            return contentType;
        }

        private String getContentName() {
            return contentName;
        }
    }

    public static final class CreateResult {
        private final String viewUrl;
        private final String sessionId;
        private final String nonce;
        private final long expiresAt;

        private CreateResult(
                String viewUrl, String sessionId, String nonce, long expiresAt) {
            this.viewUrl = viewUrl;
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.expiresAt = expiresAt;
        }

        public String getViewUrl() {
            return viewUrl;
        }

        public String getSessionId() {
            return sessionId;
        }

        public String getNonce() {
            return nonce;
        }

        public long getExpiresAt() {
            return expiresAt;
        }
    }

    public static final class WrapperPayload {
        private final String driverUrl;
        private final String filezOrigin;
        private final String sessionId;
        private final String nonce;
        private final long expiresAt;

        private WrapperPayload(
                String driverUrl,
                String filezOrigin,
                String sessionId,
                String nonce,
                long expiresAt) {
            this.driverUrl = driverUrl;
            this.filezOrigin = filezOrigin;
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.expiresAt = expiresAt;
        }

        public String getDriverUrl() {
            return driverUrl;
        }

        public String getFilezOrigin() {
            return filezOrigin;
        }

        public String getSessionId() {
            return sessionId;
        }

        public String getNonce() {
            return nonce;
        }

        public long getExpiresAt() {
            return expiresAt;
        }
    }

    public static final class FacadeException extends Exception {
        private static final long serialVersionUID = 1L;
        private final String code;

        public FacadeException(String code, String message) {
            super(message);
            this.code = code;
        }

        public FacadeException(String code, String message, Throwable cause) {
            super(message, cause);
            this.code = code;
        }

        public String getCode() {
            return code;
        }
    }
}
