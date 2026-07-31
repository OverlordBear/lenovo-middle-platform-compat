package com.seeyon.apps.eu.util;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

/**
 * gjx-start：2026-07-14 docx 格式类修订残留清理（清稿"解毒"）
 *
 * 背景（联想 FileZ 两个实测缺陷，已提工单）：
 *  1. 服务端 ClearDoc(acceptAllTrack) 只接受 w:ins/w:del，漏清格式类修订 w:rPrChange 等；
 *  2. /content/update 管道会剥离修订作者身份（w:author 的 _@_令牌、w:uid）和寻址 ID（w:id），
 *     幸存的格式修订从此变成编辑器都无法接受删除的"绿色幽灵"。
 *
 * 依据 OOXML 规范：接受一条格式修订 == 删除对应的 *PrChange 记录节点（当前格式本已生效），
 * 因此对 word/document.xml、word/styles.xml 做节点删除即等价于"彻底接受全部格式修订"。
 */
public class EuDocxCleanUtil {
	private final static Log log = LogFactory.getLog(EuDocxCleanUtil.class);

	/** 需要清除的格式类修订记录标签（运行属性/段落属性/节属性/表格属性等变更记录） */
	private static final String[] CHANGE_TAGS = {
			"rPrChange", "pPrChange", "sectPrChange", "tblPrChange",
			"tblGridChange", "tcPrChange", "trPrChange", "numberingChange"
	};

	/** 判断字节流是否 ZIP（docx）格式 */
	public static boolean isZip(byte[] bytes) {
		return bytes != null && bytes.length > 4 && bytes[0] == 0x50 && bytes[1] == 0x4B;
	}

	/**
	 * 删除 docx 内所有格式类修订记录节点，返回处理后的字节。
	 * 非 docx（如 wps/doc 二进制）或处理异常时原样返回，绝不破坏原文件。
	 */
	public static byte[] stripFormatChangeNodes(byte[] docxBytes) {
		if (!isZip(docxBytes)) {
			return docxBytes;
		}
		ZipInputStream zis = null;
		ZipOutputStream zos = null;
		try {
			ByteArrayOutputStream bos = new ByteArrayOutputStream(docxBytes.length);
			zis = new ZipInputStream(new ByteArrayInputStream(docxBytes));
			zos = new ZipOutputStream(bos);
			ZipEntry entry;
			int strippedParts = 0;
			while ((entry = zis.getNextEntry()) != null) {
				byte[] data = IOUtils.toByteArray(zis);
				String name = entry.getName();
				if ("word/document.xml".equals(name) || "word/styles.xml".equals(name)) {
					String xml = new String(data, "UTF-8");
					String before = xml;
					for (String tag : CHANGE_TAGS) {
						// 自闭合形式 <w:xxxChange .../>（FileZ 管道产出的幽灵就是这种）
						xml = xml.replaceAll("<w:" + tag + "\\b[^>]*/>", "");
						// 成对形式 <w:xxxChange ...>…</w:xxxChange>（内部不会嵌套同名节点，非贪婪安全）
						xml = xml.replaceAll("<w:" + tag + "\\b[^>]*>[\\s\\S]*?</w:" + tag + ">", "");
					}
					if (!before.equals(xml)) {
						strippedParts++;
						data = xml.getBytes("UTF-8");
					}
				}
				zos.putNextEntry(new ZipEntry(name));
				zos.write(data);
				zos.closeEntry();
			}
			zos.close();
			zos = null;
			if (strippedParts > 0) {
				log.info("[清稿解毒] 已删除格式类修订残留节点，涉及部件数:" + strippedParts);
			}
			return bos.toByteArray();
		} catch (Exception e) {
			log.error("[清稿解毒] docx 处理异常，返回原文件", e);
			return docxBytes;
		} finally {
			IOUtils.closeQuietly(zis);
			IOUtils.closeQuietly(zos);
		}
	}
}
//gjx-end
