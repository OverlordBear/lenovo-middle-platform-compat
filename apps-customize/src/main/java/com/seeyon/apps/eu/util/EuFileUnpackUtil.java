package com.seeyon.apps.eu.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import DBstep.iMsgServer2000;

/**
 * 致远正文文件"智能解包"工具（gjx 2026-07-10 提取）
 *
 * <p>背景：致远存储的 Office 正文文件可能有三种壳，直接下载给用户会打不开：
 * <ol>
 *   <li>裸金格文件 (DIRG 头) —— 金格 iSignature 私有格式，需 iMsgServer2000 脱壳还原 Word</li>
 *   <li>致远 ZIP(PK) 包裹的金格文件 —— 内部是 DIRG，需先解 ZIP 再脱金格壳</li>
 *   <li>致远 ZIP(PK) 包裹的标准 .doc (D0CF11E0) —— 内部是 OLE 复合文档，剥 ZIP 壳即可</li>
 * </ol>
 * 标准 docx/xlsx（本身就是 ZIP）不在上述任一分支，原样放行。</p>
 *
 * <p>原逻辑重复在 EuFileZController 的 download() 与 gjxFileDownload() 两处，现统一到此。</p>
 */
public final class EuFileUnpackUtil {

    private static final Log log = LogFactory.getLog(EuFileUnpackUtil.class);

    private EuFileUnpackUtil() {
    }

    /**
     * 对文件字节流做智能解包，返回可直接下载/打开的真实文件字节。
     * 任何异常都降级为返回原始字节（不抛出），保证下载链路不中断。
     *
     * @param fileBytes 原始文件字节（从物理文件读入）
     * @return 解包后的字节；非上述特征或解包失败时返回原字节
     */
    public static byte[] smartUnpack(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length <= 4) {
            return fileBytes;
        }

        // 场景1：裸金格文件 (DIRG)
        if (fileBytes[0] == 68 && fileBytes[1] == 73 && fileBytes[2] == 82 && fileBytes[3] == 71) {
            log.info("【智能解包】检测到裸金格文件(DIRG)，直接脱壳...");
            try {
                iMsgServer2000 msgObj = new iMsgServer2000();
                byte[] realWordBytes = msgObj.ToDocument(fileBytes);
                if (realWordBytes != null && realWordBytes.length > 0) {
                    return realWordBytes;
                }
            } catch (Exception e) {
                log.error("裸金格文件脱壳异常", e);
            }
            return fileBytes;
        }

        // 场景2：ZIP(PK) 包裹，探查内部结构
        if (fileBytes[0] == 80 && fileBytes[1] == 75 && fileBytes[2] == 3 && fileBytes[3] == 4) {
            log.info("【智能解包】检测到 ZIP (PK) 格式，开始探查内部结构...");
            try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(fileBytes))) {
                ZipEntry entry = zis.getNextEntry();
                if (entry != null) {
                    byte[] innerHead = new byte[4];
                    int readLen = zis.read(innerHead, 0, 4);

                    if (readLen == 4 && innerHead[0] == 68 && innerHead[1] == 73 && innerHead[2] == 82 && innerHead[3] == 71) {
                        // 分支A：内部 DIRG 金格文件
                        log.info("【智能解包】确认为致远包裹的金格ZIP！提取内部 DIRG 并脱壳...");
                        byte[] dirgBytes = readRest(zis, innerHead);
                        iMsgServer2000 msgObj = new iMsgServer2000();
                        byte[] realWordBytes = msgObj.ToDocument(dirgBytes);
                        if (realWordBytes != null && realWordBytes.length > 0) {
                            return realWordBytes;
                        }
                    } else if (readLen == 4 && (innerHead[0] & 0xFF) == 0xD0 && (innerHead[1] & 0xFF) == 0xCF
                            && (innerHead[2] & 0xFF) == 0x11 && (innerHead[3] & 0xFF) == 0xE0) {
                        // 分支B：内部标准 .doc (OLE 复合文档 D0CF11E0)
                        log.info("【智能解包】确认为致远包裹的标准 .doc 文件！提取内部流...");
                        return readRest(zis, innerHead);
                    } else {
                        log.info("【智能解包】内部非 DIRG/DOC 标记，判定为标准 docx/xlsx 文件，放行。");
                    }
                }
            } catch (Exception e) {
                log.error("探查 ZIP 内部异常，降级输出原流", e);
            }
        }

        return fileBytes;
    }

    /**
     * 读出 ZIP 当前 entry 剩余内容，拼在已读的头 4 字节之后。
     */
    private static byte[] readRest(ZipInputStream zis, byte[] head) throws java.io.IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(head);
        byte[] buffer = new byte[4096];
        int len;
        while ((len = zis.read(buffer)) > 0) {
            baos.write(buffer, 0, len);
        }
        return baos.toByteArray();
    }
}
