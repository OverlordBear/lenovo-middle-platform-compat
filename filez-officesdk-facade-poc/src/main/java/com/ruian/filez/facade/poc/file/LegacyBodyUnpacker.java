package com.ruian.filez.facade.poc.file;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Bounded compatibility decoder for historic A8 Office body containers.
 */
public final class LegacyBodyUnpacker {

    private static final byte[] DIRG = new byte[] { 0x44, 0x49, 0x52, 0x47 };
    private static final byte[] ZIP = new byte[] { 0x50, 0x4b, 0x03, 0x04 };
    private static final byte[] OLE = new byte[] {
            (byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0
    };

    public Result unpack(
            InputStream input,
            long declaredSize,
            long maxFileBytes,
            String originalMimeType) throws UnpackException {
        return unpack(
                input,
                declaredSize,
                maxFileBytes,
                originalMimeType,
                null);
    }

    public Result unpack(
            InputStream input,
            long declaredSize,
            long maxFileBytes,
            String originalMimeType,
            String originalFileName) throws UnpackException {
        if (input == null) {
            throw new UnpackException("Stored body stream is unavailable");
        }
        if (maxFileBytes <= 0 || maxFileBytes > Integer.MAX_VALUE - 8L) {
            throw new UnpackException("Configured file-size limit is invalid");
        }
        if (declaredSize > maxFileBytes) {
            throw new UnpackException("Stored body exceeds the configured size limit");
        }

        byte[] original;
        try {
            original = readBounded(input, maxFileBytes);
        } catch (IOException e) {
            throw new UnpackException("Unable to read stored body", e);
        }
        if (original.length == 0) {
            throw new UnpackException("Stored body is empty");
        }

        if (startsWith(original, DIRG)) {
            byte[] decoded = decodeDirg(original, maxFileBytes);
            return transformed(decoded, originalMimeType, originalFileName);
        }

        if (startsWith(original, ZIP)) {
            Result nested = inspectSingleEntryZip(
                    original,
                    maxFileBytes,
                    originalMimeType,
                    originalFileName);
            if (nested != null) {
                return nested;
            }
        }

        return new Result(original, false, normalizeMime(originalMimeType), null);
    }

    private Result inspectSingleEntryZip(
            byte[] original,
            long maxFileBytes,
            String originalMimeType,
            String originalFileName)
            throws UnpackException {
        ZipInputStream zip = null;
        try {
            zip = new ZipInputStream(new ByteArrayInputStream(original));
            ZipEntry firstEntry = zip.getNextEntry();
            if (firstEntry == null || firstEntry.isDirectory()) {
                return null;
            }
            if (firstEntry.getSize() > maxFileBytes) {
                throw new UnpackException("Historic body container exceeds size limit");
            }

            byte[] head = readHead(zip, 4);
            boolean candidateDirg = startsWith(head, DIRG);
            boolean candidateOle = startsWith(head, OLE);
            if (!candidateDirg && !candidateOle) {
                // A normal DOCX is itself a multi-entry ZIP and is returned intact.
                return null;
            }

            byte[] inner = readEntryBounded(zip, head, maxFileBytes);
            if (zip.getNextEntry() != null) {
                // Only the known one-entry A8 wrapper format may be peeled.
                return null;
            }
            if (candidateDirg) {
                return transformed(
                        decodeDirg(inner, maxFileBytes),
                        originalMimeType,
                        originalFileName);
            }
            if (isSpreadsheet(originalMimeType, originalFileName)) {
                return new Result(
                        inner,
                        true,
                        "application/vnd.ms-excel",
                        ".xls");
            }
            return new Result(
                    inner,
                    true,
                    "application/msword",
                    ".doc");
        } catch (UnpackException e) {
            throw e;
        } catch (IOException e) {
            throw new UnpackException("Historic body container is invalid", e);
        } finally {
            if (zip != null) {
                try {
                    zip.close();
                } catch (IOException ignored) {
                    // Nothing else can be recovered from the bounded in-memory copy.
                }
            }
        }
    }

    private byte[] decodeDirg(byte[] bytes, long maxFileBytes)
            throws UnpackException {
        try {
            Class<?> decoderClass = Class.forName("DBstep.iMsgServer2000");
            Object decoder = decoderClass.newInstance();
            Method method = decoderClass.getMethod("ToDocument", byte[].class);
            Object value = method.invoke(decoder, new Object[] { bytes });
            if (!(value instanceof byte[])) {
                throw new UnpackException("Historic body decoder returned no document");
            }
            byte[] decoded = (byte[]) value;
            if (decoded.length == 0 || decoded.length > maxFileBytes) {
                throw new UnpackException(
                        "Decoded historic body is empty or exceeds size limit");
            }
            return decoded;
        } catch (UnpackException e) {
            throw e;
        } catch (ClassNotFoundException e) {
            throw new UnpackException("Historic body decoder is unavailable", e);
        } catch (InvocationTargetException e) {
            throw new UnpackException("Historic body decoder rejected the document", e);
        } catch (Exception e) {
            throw new UnpackException("Unable to decode historic body", e);
        }
    }

    private static Result transformed(
            byte[] decoded, String originalMimeType, String originalFileName) {
        boolean spreadsheet = isSpreadsheet(
                originalMimeType, originalFileName);
        if (startsWith(decoded, ZIP)) {
            if (spreadsheet) {
                return new Result(
                        decoded,
                        true,
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        ".xlsx");
            }
            return new Result(
                    decoded,
                    true,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    ".docx");
        }
        if (spreadsheet) {
            return new Result(
                    decoded,
                    true,
                    "application/vnd.ms-excel",
                    ".xls");
        }
        return new Result(decoded, true, "application/msword", ".doc");
    }

    private static boolean isSpreadsheet(
            String originalMimeType, String originalFileName) {
        String mime = originalMimeType == null
                ? "" : originalMimeType.trim().toLowerCase(java.util.Locale.ENGLISH);
        if (mime.contains("spreadsheet")
                || mime.contains("ms-excel")
                || mime.contains("wps-office.et")
                || mime.contains("kingsoft.et")) {
            return true;
        }
        String fileName = originalFileName == null
                ? "" : originalFileName.trim().toLowerCase(java.util.Locale.ENGLISH);
        return fileName.endsWith(".xls")
                || fileName.endsWith(".xlsx")
                || fileName.endsWith(".et");
    }

    private static byte[] readBounded(InputStream input, long limit)
            throws IOException, UnpackException {
        ByteArrayOutputStream output = new ByteArrayOutputStream(
                (int) Math.min(limit, 64L * 1024L));
        byte[] buffer = new byte[16 * 1024];
        long total = 0L;
        int count;
        while ((count = input.read(buffer)) != -1) {
            if (count == 0) {
                continue;
            }
            total += count;
            if (total > limit) {
                throw new UnpackException(
                        "Stored body exceeds the configured size limit");
            }
            output.write(buffer, 0, count);
        }
        return output.toByteArray();
    }

    private static byte[] readEntryBounded(
            ZipInputStream zip, byte[] head, long limit)
            throws IOException, UnpackException {
        ByteArrayOutputStream output = new ByteArrayOutputStream(
                (int) Math.min(limit, 64L * 1024L));
        output.write(head, 0, head.length);
        long total = head.length;
        byte[] buffer = new byte[16 * 1024];
        int count;
        while ((count = zip.read(buffer)) != -1) {
            if (count == 0) {
                continue;
            }
            total += count;
            if (total > limit) {
                throw new UnpackException(
                        "Historic body container exceeds size limit");
            }
            output.write(buffer, 0, count);
        }
        return output.toByteArray();
    }

    private static byte[] readHead(InputStream input, int length)
            throws IOException {
        byte[] result = new byte[length];
        int offset = 0;
        while (offset < length) {
            int count = input.read(result, offset, length - offset);
            if (count < 0) {
                break;
            }
            if (count > 0) {
                offset += count;
            }
        }
        if (offset == length) {
            return result;
        }
        byte[] shortResult = new byte[offset];
        System.arraycopy(result, 0, shortResult, 0, offset);
        return shortResult;
    }

    private static boolean startsWith(byte[] bytes, byte[] prefix) {
        if (bytes == null || bytes.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if (bytes[i] != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private static String normalizeMime(String mimeType) {
        String value = mimeType == null ? "" : mimeType.trim();
        return value.length() == 0 ? "application/octet-stream" : value;
    }

    public static final class Result {
        private final byte[] bytes;
        private final boolean transformed;
        private final String contentType;
        private final String suggestedExtension;

        private Result(
                byte[] bytes,
                boolean transformed,
                String contentType,
                String suggestedExtension) {
            this.bytes = bytes;
            this.transformed = transformed;
            this.contentType = contentType;
            this.suggestedExtension = suggestedExtension;
        }

        public byte[] getBytes() {
            return bytes;
        }

        public boolean isTransformed() {
            return transformed;
        }

        public String getContentType() {
            return contentType;
        }

        public String getSuggestedExtension() {
            return suggestedExtension;
        }
    }

    public static final class UnpackException extends Exception {
        private static final long serialVersionUID = 1L;

        public UnpackException(String message) {
            super(message);
        }

        public UnpackException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
