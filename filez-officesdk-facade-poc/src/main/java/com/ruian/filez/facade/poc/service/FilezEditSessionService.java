package com.ruian.filez.facade.poc.service;

import java.util.Date;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.multipart.MultipartFile;

import com.ruian.filez.facade.poc.config.FilezRuntimeConfig;
import com.ruian.filez.facade.poc.config.FilezRuntimeConfig.ConfigException;
import com.ruian.filez.facade.poc.filez.DriverUrlBuilder;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.CapabilityException;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.FileBinding;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.Grant;
import com.ruian.filez.facade.poc.service.FilezCapabilityService.IssuedCapability;
import com.seeyon.apps.officePlugins.manager.OfficeFileManager;
import com.seeyon.ctp.common.authenticate.domain.User;
import com.seeyon.ctp.common.config.manager.ConfigManager;
import com.seeyon.ctp.common.constants.ApplicationCategoryEnum;
import com.seeyon.ctp.common.file.model.CtpLocalFile;
import com.seeyon.ctp.common.filemanager.manager.FileManager;
import com.seeyon.ctp.common.po.filemanager.V3XFile;
import com.seeyon.ctp.util.UUIDLong;

/**
 * Creates short-lived FileZ edit sessions and commits FileZ uploads through
 * A8's own OfficeFileManager lifecycle.
 *
 * <p>Existing files are accepted only after the govdoc object authorization
 * in {@link FilezViewSessionService}.  A genuinely new page never gets to
 * choose the persistent file id: the server reserves it and the browser must
 * write that id back to A8's contentAPI before the editor is shown.</p>
 */
public class FilezEditSessionService {

    private static final Log LOG =
            LogFactory.getLog(FilezEditSessionService.class);

    public static final String CODE_AUTH_REQUIRED = "AUTH_REQUIRED";
    public static final String CODE_FORBIDDEN = "FORBIDDEN";
    public static final String CODE_CONFIG_MISSING = "CONFIG_MISSING";
    public static final String CODE_CONFLICT = "CONFLICT";
    public static final String CODE_INVALID_ARGUMENT = "INVALID_ARGUMENT";
    public static final String CODE_INTERNAL = "INTERNAL";

    private static final int MAX_ACTIVE_EDIT_SESSIONS = 1024;
    private static final String READY_PROTOCOL = "postMessage-v1";

    private final FilezRuntimeConfig runtimeConfig = new FilezRuntimeConfig();
    private final DriverUrlBuilder driverUrlBuilder = new DriverUrlBuilder();
    private final ConcurrentHashMap<String, EditState> editStates =
            new ConcurrentHashMap<String, EditState>();

    private FilezCapabilityService ruianFileZCapabilityService;
    private FilezViewSessionService ruianFileZViewSessionService;
    private FileManager fileManager;
    private OfficeFileManager officeFileManager;

    public CreateResult createEditSession(
            Map<String, Object> parameters,
            User user,
            String contextPath) throws FacadeException {
        requireAuthenticated(user);
        requireDependencies();
        if (!runtimeConfig.isEditEnabled()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit mode is disabled");
        }

        FilezRuntimeConfig.Snapshot config = loadConfig();
        String fileType = normalizeFileType(value(parameters, "fileType"));
        String mode = stringValue(value(parameters, "mode"))
                .toLowerCase(Locale.ENGLISH);
        String surface = stringValue(value(parameters, "surface"))
                .toUpperCase(Locale.ENGLISH);
        boolean newDocument = booleanValue(parameters.get("newDocument"));
        if (!"edit".equals(mode)
                || !isOfficeBodyExtension(fileType)
                || !isAllowedSurface(surface)) {
            throw new FacadeException(
                    CODE_INVALID_ARGUMENT,
                    "The request is outside the supported FileZ edit scope");
        }

        FileBinding binding;
        ApplicationCategoryEnum category;
        boolean createdNew;
        if (newDocument) {
            category = categoryFor(surface);
            binding = reserveNewFile(parameters, user, fileType, category, config);
            createdNew = true;
        } else {
            try {
                binding = ruianFileZViewSessionService
                        .authorizeExistingEditBody(parameters, user);
            } catch (FilezViewSessionService.FacadeException e) {
                throw new FacadeException(e.getCode(), e.getMessage(), e);
            }
            category = ApplicationCategoryEnum.edoc;
            createdNew = false;
        }

        cleanupExpired();
        if (editStates.size() >= MAX_ACTIVE_EDIT_SESSIONS) {
            throw new FacadeException(
                    CODE_INTERNAL, "The FileZ edit session store is full");
        }

        String sessionId = ruianFileZCapabilityService.newSessionId();
        String nonce = ruianFileZCapabilityService.newNonce();
        long editExpiresAt = System.currentTimeMillis()
                + config.getEditTokenTtlSeconds() * 1000L;
        EditState state = new EditState(
                sessionId,
                nonce,
                user.getId().longValue(),
                binding,
                category,
                createdNew,
                editExpiresAt,
                effectiveDate(binding),
                currentFileSize(binding.getFileId()));

        IssuedCapability wrapper;
        try {
            wrapper = ruianFileZCapabilityService.issueEditWrapper(
                    binding,
                    user.getId().longValue(),
                    sessionId,
                    nonce,
                    config.getWrapperTicketTtlSeconds());
        } catch (CapabilityException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to allocate a FileZ edit session", e);
        }

        if (editStates.putIfAbsent(sessionId, state) != null) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to register a FileZ edit session");
        }

        String editUrl = normalizeContextPath(contextPath)
                + "/ruianFileZEdit.do?method=wrapper&ticket="
                + wrapper.getToken();
        LOG.info(
                "FileZ edit session created: sessionId=" + sessionId
                + ", createdNew=" + createdNew
                + ", surface=" + surface);
        return new CreateResult(
                editUrl,
                sessionId,
                nonce,
                wrapper.getExpiresAt(),
                binding.getFileId(),
                createdNew,
                state.contentLength);
    }

    public WrapperPayload openWrapper(
            String wrapperTicket,
            User user,
            String contextPath) throws FacadeException {
        requireAuthenticated(user);
        requireDependencies();
        if (!runtimeConfig.isEditEnabled()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit mode is disabled");
        }
        FilezRuntimeConfig.Snapshot config = loadConfig();
        Grant wrapper = ruianFileZCapabilityService.consumeEditWrapper(
                wrapperTicket, user.getId().longValue());
        if (wrapper == null) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "FileZ edit session is invalid or expired");
        }
        EditState state = requireState(
                wrapper.getSessionId(),
                wrapper.getNonce(),
                user.getId().longValue());
        if (state.binding.getFileId() != wrapper.getBinding().getFileId()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit binding changed");
        }

        int ttl = remainingTtlSeconds(state.expiresAt);
        IssuedCapability download;
        IssuedCapability upload;
        try {
            download = ruianFileZCapabilityService.issueEditDownload(
                    wrapper, ttl);
            upload = ruianFileZCapabilityService.issueEditUpload(
                    wrapper, ttl);
        } catch (CapabilityException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to allocate FileZ edit callbacks", e);
        }

        try {
            String normalizedContext = normalizeContextPath(contextPath);
            String downloadUrl = config.buildDownloadUrl(normalizedContext);
            String uploadUrl = config.buildEditUploadUrl(normalizedContext);
            String driverUrl = driverUrlBuilder.buildEditUrl(
                    config,
                    state.binding,
                    user.getId().longValue(),
                    download.getToken(),
                    upload.getToken(),
                    downloadUrl,
                    uploadUrl);
            return new WrapperPayload(
                    driverUrl,
                    config.getFilezOrigin(),
                    state.sessionId,
                    state.nonce,
                    state.expiresAt,
                    state.binding.getFileId(),
                    state.revision,
                    state.contentLength);
        } catch (ConfigException e) {
            throw new FacadeException(
                    CODE_CONFIG_MISSING,
                    "FileZ callback configuration is invalid",
                    e);
        } catch (RuntimeException e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to construct the FileZ editor", e);
        }
    }

    public SaveResult commitUpload(
            String rawUploadToken,
            MultipartFile upload) throws FacadeException {
        requireDependencies();
        if (!runtimeConfig.isEditEnabled()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit mode is disabled");
        }
        Grant grant = ruianFileZCapabilityService.consumeEditUpload(rawUploadToken);
        if (grant == null) {
            throw new FacadeException(
                    CODE_FORBIDDEN, "FileZ upload capability is invalid or expired");
        }
        EditState state = requireState(
                grant.getSessionId(), grant.getNonce(), null);
        if (grant.getBinding().getFileId() != state.binding.getFileId()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ upload binding changed");
        }
        if (upload == null || upload.isEmpty()) {
            throw new FacadeException(CODE_INVALID_ARGUMENT, "FileZ upload is empty");
        }
        if (upload.getSize() > state.binding.getMaxFileBytes()) {
            throw new FacadeException(
                    CODE_INVALID_ARGUMENT, "FileZ upload exceeds the configured limit");
        }
        validateUploadedName(upload.getOriginalFilename(), state.binding.getFileName());

        CtpLocalFile temporary = null;
        try {
            temporary = CtpLocalFile.createTempFile(
                    "ruian-filez-", suffixOf(state.binding.getFileName()));
            upload.transferTo(temporary);
            synchronized (state.monitor) {
                ensureCurrentRevision(state);
                V3XFile saved = officeFileManager.controlAfterSave(
                        temporary,
                        String.valueOf(state.binding.getFileId()),
                        state.binding.getFileName(),
                        state.category);
                if (saved == null
                        || saved.getId() == null
                        || saved.getId().longValue() != state.binding.getFileId()) {
                    throw new FacadeException(
                            CODE_INTERNAL, "A8 did not confirm the FileZ save");
                }
                state.expectedUpdateDate = effectiveDate(saved);
                state.contentLength = saved.getSize() == null
                        ? upload.getSize()
                        : Math.max(0L, saved.getSize().longValue());
                state.revision++;
                LOG.info(
                        "FileZ edit committed: sessionId=" + state.sessionId
                        + ", revision=" + state.revision
                        + ", bytes=" + upload.getSize());
                return new SaveResult(
                        state.binding.getFileId(),
                        state.binding.getFileName(),
                        state.revision,
                        copy(state.expectedUpdateDate),
                        state.contentLength);
            }
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to commit the FileZ upload through A8", e);
        } finally {
            if (temporary != null && temporary.exists() && !temporary.delete()) {
                LOG.warn("Unable to delete a FileZ temporary upload");
            }
        }
    }

    public StatusResult getStatus(
            String sessionId,
            String nonce,
            User user) throws FacadeException {
        requireAuthenticated(user);
        if (!runtimeConfig.isEditEnabled()) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit mode is disabled");
        }
        EditState state = requireState(
                sessionId, nonce, user.getId().longValue());
        synchronized (state.monitor) {
            return new StatusResult(
                    state.binding.getFileId(),
                    state.revision,
                    copy(state.expectedUpdateDate),
                    state.expiresAt,
                    state.contentLength);
        }
    }

    private FileBinding reserveNewFile(
            Map<String, Object> parameters,
            User user,
            String fileType,
            ApplicationCategoryEnum category,
            FilezRuntimeConfig.Snapshot config) throws FacadeException {
        long fileId = UUIDLong.absLongUUID();
        String fileName = normalizedFileName(
                stringValue(parameters.get("fileName")), fileType);
        try {
            officeFileManager.createV3XFileAndDefaultBlankFile(
                    Long.valueOf(fileId), fileType, Integer.valueOf(category.key()));
            V3XFile file = fileManager.getV3XFile(Long.valueOf(fileId));
            if (file == null) {
                throw new FacadeException(
                        CODE_INTERNAL, "A8 did not create the reserved body file");
            }
            if (file.getSize() != null
                    && file.getSize().longValue() > config.getMaxFileBytes()) {
                throw new FacadeException(
                        CODE_INTERNAL, "The A8 blank body exceeds the edit limit");
            }
            if (!fileName.equals(file.getFilename())) {
                file.setFilename(fileName);
                fileManager.update(file);
                file = fileManager.getV3XFile(Long.valueOf(fileId));
                if (file == null) {
                    throw new FacadeException(
                            CODE_INTERNAL,
                            "A8 lost the reserved body after its name was updated");
                }
            }
            return new FileBinding(
                    0L,
                    0L,
                    fileId,
                    fileName,
                    file.getMimeType(),
                    bodyTypeFor(fileType),
                    file.getCreateDate(),
                    file.getUpdateDate(),
                    config.getMaxFileBytes(),
                    safeUserValue(user.getName()),
                    safeUserValue(user.getLoginName()));
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to reserve an A8 body file", e);
        }
    }

    private void ensureCurrentRevision(EditState state) throws FacadeException {
        try {
            V3XFile current = fileManager.getV3XFile(
                    Long.valueOf(state.binding.getFileId()));
            if (current == null) {
                throw new FacadeException(
                        CODE_CONFLICT, "The A8 body file no longer exists");
            }
            if (!sameDate(effectiveDate(current), state.expectedUpdateDate)) {
                throw new FacadeException(
                        CODE_CONFLICT,
                        "The A8 body changed after this FileZ session opened");
            }
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to verify the A8 body revision", e);
        }
    }

    private long currentFileSize(long fileId) throws FacadeException {
        try {
            V3XFile current = fileManager.getV3XFile(Long.valueOf(fileId));
            if (current == null) {
                throw new FacadeException(
                        CODE_CONFLICT, "The A8 body file no longer exists");
            }
            return current.getSize() == null
                    ? 0L
                    : Math.max(0L, current.getSize().longValue());
        } catch (FacadeException e) {
            throw e;
        } catch (Exception e) {
            throw new FacadeException(
                    CODE_INTERNAL, "Unable to read the A8 body size", e);
        }
    }

    private EditState requireState(
            String sessionId,
            String nonce,
            Long requiredUserId) throws FacadeException {
        if (sessionId == null || nonce == null) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit state is missing");
        }
        EditState state = editStates.get(sessionId);
        if (state == null
                || !state.nonce.equals(nonce)
                || state.expiresAt <= System.currentTimeMillis()
                || (requiredUserId != null
                    && state.userId != requiredUserId.longValue())) {
            if (state != null && state.expiresAt <= System.currentTimeMillis()) {
                editStates.remove(sessionId, state);
            }
            throw new FacadeException(
                    CODE_FORBIDDEN, "FileZ edit state is invalid or expired");
        }
        return state;
    }

    private void cleanupExpired() {
        long now = System.currentTimeMillis();
        for (Map.Entry<String, EditState> entry : editStates.entrySet()) {
            if (entry.getValue().expiresAt <= now) {
                editStates.remove(entry.getKey(), entry.getValue());
            }
        }
    }

    private FilezRuntimeConfig.Snapshot loadConfig() throws FacadeException {
        try {
            return runtimeConfig.loadValidated();
        } catch (ConfigException e) {
            throw new FacadeException(
                    CODE_CONFIG_MISSING,
                    "FileZ edit configuration is incomplete or disabled",
                    e);
        }
    }

    private void requireDependencies() throws FacadeException {
        if (ruianFileZCapabilityService == null
                || ruianFileZViewSessionService == null
                || fileManager == null
                || officeFileManager == null) {
            throw new FacadeException(
                    CODE_INTERNAL, "FileZ edit facade is not initialized");
        }
    }

    private static void requireAuthenticated(User user) throws FacadeException {
        if (user == null
                || user.getId() == null
                || Boolean.TRUE.equals(user.isGuest())) {
            throw new FacadeException(
                    CODE_AUTH_REQUIRED, "An authenticated A8 user is required");
        }
    }

    private static int remainingTtlSeconds(long expiresAt)
            throws FacadeException {
        long remaining = expiresAt - System.currentTimeMillis();
        if (remaining <= 0L) {
            throw new FacadeException(CODE_FORBIDDEN, "FileZ edit session expired");
        }
        return (int) Math.max(1L, Math.min(3600L, (remaining + 999L) / 1000L));
    }

    private static Object value(Map<String, Object> values, String key)
            throws FacadeException {
        if (values == null || !values.containsKey(key)) {
            throw new FacadeException(
                    CODE_INVALID_ARGUMENT, "Required edit field is missing: " + key);
        }
        return values.get(key);
    }

    private static boolean booleanValue(Object value) {
        return Boolean.TRUE.equals(value)
                || "true".equalsIgnoreCase(stringValue(value));
    }

    private static String normalizeFileType(Object value) {
        String result = stringValue(value).toLowerCase(Locale.ENGLISH);
        while (result.startsWith(".")) {
            result = result.substring(1);
        }
        return result;
    }

    static boolean isOfficeBodyExtension(String value) {
        return "doc".equals(value)
                || "docx".equals(value)
                || "wps".equals(value)
                || "xls".equals(value)
                || "xlsx".equals(value)
                || "et".equals(value);
    }

    static String bodyTypeFor(String fileType) {
        if ("wps".equals(fileType)) {
            return "43";
        }
        if ("xls".equals(fileType) || "xlsx".equals(fileType)) {
            return "42";
        }
        if ("et".equals(fileType)) {
            return "44";
        }
        return "41";
    }

    private static boolean isAllowedSurface(String value) {
        return "GOVDOC".equals(value)
                || "COLLABORATION".equals(value)
                || "DOCUMENT".equals(value);
    }

    private static ApplicationCategoryEnum categoryFor(String surface) {
        if ("GOVDOC".equals(surface)) {
            return ApplicationCategoryEnum.edoc;
        }
        if ("DOCUMENT".equals(surface)) {
            return ApplicationCategoryEnum.doc;
        }
        return ApplicationCategoryEnum.collaboration;
    }

    private static String normalizedFileName(String raw, String fileType) {
        String name = raw == null ? "" : raw.trim();
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        name = name.replaceAll("[\\x00-\\x1f\\x7f\";]", "_");
        if (name.length() == 0) {
            name = "body";
        }
        String lower = name.toLowerCase(Locale.ENGLISH);
        if (!lower.endsWith("." + fileType)) {
            int dot = name.lastIndexOf('.');
            if (dot > 0) {
                name = name.substring(0, dot);
            }
            name += "." + fileType;
        }
        if (name.length() > 180) {
            name = name.substring(name.length() - 180);
        }
        return name;
    }

    private static void validateUploadedName(String uploaded, String expected)
            throws FacadeException {
        String actualSuffix = suffixOf(uploaded).toLowerCase(Locale.ENGLISH);
        String expectedSuffix = suffixOf(expected).toLowerCase(Locale.ENGLISH);
        if (actualSuffix.length() > 0 && !actualSuffix.equals(expectedSuffix)) {
            throw new FacadeException(
                    CODE_INVALID_ARGUMENT,
                    "FileZ cannot change the document type during save");
        }
    }

    static String suffixOf(String value) {
        String text = value == null ? "" : value.trim();
        int dot = text.lastIndexOf('.');
        if (dot < 0 || dot == text.length() - 1) {
            return "";
        }
        return text.substring(dot);
    }

    private static String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static String safeUserValue(String value) {
        String result = value == null ? "" : value.trim();
        return result.length() > 128 ? result.substring(0, 128) : result;
    }

    private static Date effectiveDate(FileBinding binding) {
        Date value = binding.getUpdateDate();
        return value == null ? binding.getCreateDate() : value;
    }

    private static Date effectiveDate(V3XFile file) {
        Date value = file.getUpdateDate();
        return value == null ? file.getCreateDate() : value;
    }

    private static boolean sameDate(Date left, Date right) {
        return left == null ? right == null
                : right != null && left.getTime() == right.getTime();
    }

    private static Date copy(Date value) {
        return value == null ? null : new Date(value.getTime());
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

    public void setConfigManager(ConfigManager configManager) {
        runtimeConfig.setConfigManager(configManager);
    }

    public void setRuianFileZCapabilityService(
            FilezCapabilityService ruianFileZCapabilityService) {
        this.ruianFileZCapabilityService = ruianFileZCapabilityService;
    }

    public void setRuianFileZViewSessionService(
            FilezViewSessionService ruianFileZViewSessionService) {
        this.ruianFileZViewSessionService = ruianFileZViewSessionService;
    }

    public void setFileManager(FileManager fileManager) {
        this.fileManager = fileManager;
    }

    public void setOfficeFileManager(OfficeFileManager officeFileManager) {
        this.officeFileManager = officeFileManager;
    }

    private static final class EditState {
        private final Object monitor = new Object();
        private final String sessionId;
        private final String nonce;
        private final long userId;
        private final FileBinding binding;
        private final ApplicationCategoryEnum category;
        private final boolean createdNew;
        private final long expiresAt;
        private Date expectedUpdateDate;
        private long revision;
        private long contentLength;

        private EditState(
                String sessionId,
                String nonce,
                long userId,
                FileBinding binding,
                ApplicationCategoryEnum category,
                boolean createdNew,
                long expiresAt,
                Date expectedUpdateDate,
                long contentLength) {
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.userId = userId;
            this.binding = binding;
            this.category = category;
            this.createdNew = createdNew;
            this.expiresAt = expiresAt;
            this.expectedUpdateDate = copy(expectedUpdateDate);
            this.contentLength = contentLength;
        }
    }

    public static final class CreateResult {
        private final String editUrl;
        private final String sessionId;
        private final String nonce;
        private final long expiresAt;
        private final long fileId;
        private final boolean createdNew;
        private final long contentLength;

        private CreateResult(
                String editUrl,
                String sessionId,
                String nonce,
                long expiresAt,
                long fileId,
                boolean createdNew,
                long contentLength) {
            this.editUrl = editUrl;
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.expiresAt = expiresAt;
            this.fileId = fileId;
            this.createdNew = createdNew;
            this.contentLength = contentLength;
        }

        public String getEditUrl() { return editUrl; }
        public String getSessionId() { return sessionId; }
        public String getNonce() { return nonce; }
        public long getExpiresAt() { return expiresAt; }
        public long getFileId() { return fileId; }
        public boolean isCreatedNew() { return createdNew; }
        public long getContentLength() { return contentLength; }
    }

    public static final class WrapperPayload {
        private final String driverUrl;
        private final String filezOrigin;
        private final String sessionId;
        private final String nonce;
        private final long expiresAt;
        private final long fileId;
        private final long revision;
        private final long contentLength;

        private WrapperPayload(
                String driverUrl,
                String filezOrigin,
                String sessionId,
                String nonce,
                long expiresAt,
                long fileId,
                long revision,
                long contentLength) {
            this.driverUrl = driverUrl;
            this.filezOrigin = filezOrigin;
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.expiresAt = expiresAt;
            this.fileId = fileId;
            this.revision = revision;
            this.contentLength = contentLength;
        }

        public String getDriverUrl() { return driverUrl; }
        public String getFilezOrigin() { return filezOrigin; }
        public String getSessionId() { return sessionId; }
        public String getNonce() { return nonce; }
        public long getExpiresAt() { return expiresAt; }
        public long getFileId() { return fileId; }
        public long getRevision() { return revision; }
        public long getContentLength() { return contentLength; }
    }

    public static final class SaveResult {
        private final long fileId;
        private final String fileName;
        private final long revision;
        private final Date modifiedAt;
        private final long contentLength;

        private SaveResult(
                long fileId,
                String fileName,
                long revision,
                Date modifiedAt,
                long contentLength) {
            this.fileId = fileId;
            this.fileName = fileName;
            this.revision = revision;
            this.modifiedAt = copy(modifiedAt);
            this.contentLength = contentLength;
        }

        public long getFileId() { return fileId; }
        public String getFileName() { return fileName; }
        public long getRevision() { return revision; }
        public Date getModifiedAt() { return copy(modifiedAt); }
        public long getContentLength() { return contentLength; }
    }

    public static final class StatusResult {
        private final long fileId;
        private final long revision;
        private final Date modifiedAt;
        private final long expiresAt;
        private final long contentLength;

        private StatusResult(
                long fileId,
                long revision,
                Date modifiedAt,
                long expiresAt,
                long contentLength) {
            this.fileId = fileId;
            this.revision = revision;
            this.modifiedAt = copy(modifiedAt);
            this.expiresAt = expiresAt;
            this.contentLength = contentLength;
        }

        public long getFileId() { return fileId; }
        public long getRevision() { return revision; }
        public Date getModifiedAt() { return copy(modifiedAt); }
        public long getExpiresAt() { return expiresAt; }
        public long getContentLength() { return contentLength; }
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

        public String getCode() { return code; }
    }
}
