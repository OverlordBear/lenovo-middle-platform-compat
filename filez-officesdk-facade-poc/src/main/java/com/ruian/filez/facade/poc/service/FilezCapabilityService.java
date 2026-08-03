package com.ruian.filez.facade.poc.service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import com.ruian.filez.facade.poc.security.FilezCrypto;

/**
 * In-memory, short-lived, object-scoped capabilities.
 *
 * <p>Only SHA-256 digests are stored as map keys. Raw bearer values are
 * returned once to the caller and must not be logged.</p>
 */
public class FilezCapabilityService {

    private static final int MAX_ACTIVE_CAPABILITIES = 4096;
    private static final int TOKEN_BYTES = 32;
    private static final int CONTENT_MAX_USES = 3;

    private final ConcurrentHashMap<String, Grant> grants =
            new ConcurrentHashMap<String, Grant>();

    public void warmUp() {
        FilezCrypto.warmUp();
    }

    public IssuedCapability issueWrapper(
            FileBinding binding,
            long userId,
            String sessionId,
            String nonce,
            int ttlSeconds) throws CapabilityException {
        long expiresAt = expiry(ttlSeconds);
        Grant grant = new Grant(
                Purpose.WRAPPER,
                binding,
                Long.valueOf(userId),
                sessionId,
                nonce,
                expiresAt,
                1);
        return issue(grant);
    }

    public IssuedCapability issueContent(
            Grant wrapperGrant,
            int ttlSeconds) throws CapabilityException {
        if (wrapperGrant == null || wrapperGrant.getPurpose() != Purpose.WRAPPER) {
            throw new CapabilityException("Invalid wrapper capability");
        }
        long expiresAt = expiry(ttlSeconds);
        Grant grant = new Grant(
                Purpose.CONTENT,
                wrapperGrant.getBinding(),
                null,
                wrapperGrant.getSessionId(),
                wrapperGrant.getNonce(),
                expiresAt,
                CONTENT_MAX_USES);
        return issue(grant);
    }

    public Grant consumeWrapper(String rawToken, long currentUserId) {
        return consume(
                rawToken, Purpose.WRAPPER, Long.valueOf(currentUserId));
    }

    public Grant consumeContent(String rawToken) {
        return consume(rawToken, Purpose.CONTENT, null);
    }

    public String newSessionId() {
        return FilezCrypto.randomToken(18);
    }

    public String newNonce() {
        return FilezCrypto.randomToken(24);
    }

    private IssuedCapability issue(Grant grant) throws CapabilityException {
        cleanupExpired();
        if (grants.size() >= MAX_ACTIVE_CAPABILITIES) {
            throw new CapabilityException("Capability store is full");
        }

        for (int attempt = 0; attempt < 4; attempt++) {
            String rawToken = FilezCrypto.randomToken(TOKEN_BYTES);
            String digest = FilezCrypto.sha256Hex(rawToken);
            if (grants.putIfAbsent(digest, grant) == null) {
                return new IssuedCapability(rawToken, grant.getExpiresAt());
            }
        }
        throw new CapabilityException("Unable to allocate a capability");
    }

    private Grant consume(
            String rawToken,
            Purpose expectedPurpose,
            Long requiredUserId) {
        if (rawToken == null || !rawToken.matches("[A-Za-z0-9_-]{43}")) {
            return null;
        }

        String digest = FilezCrypto.sha256Hex(rawToken);
        Grant grant = grants.get(digest);
        if (grant == null) {
            return null;
        }
        if (grant.getExpiresAt() <= System.currentTimeMillis()) {
            grants.remove(digest, grant);
            return null;
        }
        if (grant.getPurpose() != expectedPurpose) {
            return null;
        }
        if (requiredUserId != null
                && (grant.getUserId() == null
                        || grant.getUserId().longValue()
                                != requiredUserId.longValue())) {
            return null;
        }
        if (grant.getExpiresAt() <= System.currentTimeMillis()) {
            grants.remove(digest, grant);
            return null;
        }

        while (true) {
            int remaining = grant.remainingUses.get();
            if (remaining <= 0) {
                grants.remove(digest, grant);
                return null;
            }
            if (grant.remainingUses.compareAndSet(remaining, remaining - 1)) {
                if (remaining == 1) {
                    grants.remove(digest, grant);
                }
                return grant;
            }
        }
    }

    private void cleanupExpired() {
        long now = System.currentTimeMillis();
        for (Map.Entry<String, Grant> entry : grants.entrySet()) {
            Grant grant = entry.getValue();
            if (grant.getExpiresAt() <= now || grant.remainingUses.get() <= 0) {
                grants.remove(entry.getKey(), grant);
            }
        }
    }

    private static long expiry(int ttlSeconds) throws CapabilityException {
        if (ttlSeconds <= 0 || ttlSeconds > 3600) {
            throw new CapabilityException("Capability TTL is invalid");
        }
        return System.currentTimeMillis() + ttlSeconds * 1000L;
    }

    public enum Purpose {
        WRAPPER,
        CONTENT
    }

    public static final class FileBinding {
        private final long affairId;
        private final long summaryId;
        private final long fileId;
        private final String fileName;
        private final String mimeType;
        private final String bodyType;
        private final Date createDate;
        private final Date updateDate;
        private final long maxFileBytes;
        private final String userDisplayName;
        private final String userLoginName;

        public FileBinding(
                long affairId,
                long summaryId,
                long fileId,
                String fileName,
                String mimeType,
                String bodyType,
                Date createDate,
                Date updateDate,
                long maxFileBytes,
                String userDisplayName,
                String userLoginName) {
            this.affairId = affairId;
            this.summaryId = summaryId;
            this.fileId = fileId;
            this.fileName = fileName;
            this.mimeType = mimeType;
            this.bodyType = bodyType;
            this.createDate = copy(createDate);
            this.updateDate = copy(updateDate);
            this.maxFileBytes = maxFileBytes;
            this.userDisplayName = userDisplayName;
            this.userLoginName = userLoginName;
        }

        public long getAffairId() {
            return affairId;
        }

        public long getSummaryId() {
            return summaryId;
        }

        public long getFileId() {
            return fileId;
        }

        public String getFileName() {
            return fileName;
        }

        public String getMimeType() {
            return mimeType;
        }

        public String getBodyType() {
            return bodyType;
        }

        public Date getCreateDate() {
            return copy(createDate);
        }

        public Date getUpdateDate() {
            return copy(updateDate);
        }

        public long getMaxFileBytes() {
            return maxFileBytes;
        }

        public String getUserDisplayName() {
            return userDisplayName;
        }

        public String getUserLoginName() {
            return userLoginName;
        }

        private static Date copy(Date value) {
            return value == null ? null : new Date(value.getTime());
        }
    }

    public static final class Grant {
        private final Purpose purpose;
        private final FileBinding binding;
        private final Long userId;
        private final String sessionId;
        private final String nonce;
        private final long expiresAt;
        private final AtomicInteger remainingUses;

        private Grant(
                Purpose purpose,
                FileBinding binding,
                Long userId,
                String sessionId,
                String nonce,
                long expiresAt,
                int maxUses) {
            this.purpose = purpose;
            this.binding = binding;
            this.userId = userId;
            this.sessionId = sessionId;
            this.nonce = nonce;
            this.expiresAt = expiresAt;
            this.remainingUses = new AtomicInteger(maxUses);
        }

        public Purpose getPurpose() {
            return purpose;
        }

        public FileBinding getBinding() {
            return binding;
        }

        public Long getUserId() {
            return userId;
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

    public static final class IssuedCapability {
        private final String token;
        private final long expiresAt;

        private IssuedCapability(String token, long expiresAt) {
            this.token = token;
            this.expiresAt = expiresAt;
        }

        public String getToken() {
            return token;
        }

        public long getExpiresAt() {
            return expiresAt;
        }
    }

    public static final class CapabilityException extends Exception {
        private static final long serialVersionUID = 1L;

        public CapabilityException(String message) {
            super(message);
        }
    }
}
