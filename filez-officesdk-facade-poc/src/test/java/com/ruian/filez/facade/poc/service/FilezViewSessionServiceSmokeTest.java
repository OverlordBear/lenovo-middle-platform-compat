package com.ruian.filez.facade.poc.service;

import com.seeyon.ctp.common.ModuleType;
import com.seeyon.ctp.common.po.content.CtpContentAll;

/**
 * Verifies the exact A8 mainbody-to-file authorization binding.
 */
public final class FilezViewSessionServiceSmokeTest {

    private static final long SUMMARY_ID = 422162436790765426L;
    private static final long FILE_ID = 17853049371670L;

    private FilezViewSessionServiceSmokeTest() {
    }

    public static void main(String[] args) {
        assertEquals(
                "41",
                FilezEditSessionService.bodyTypeFor("docx"),
                "DOCX reserves an OfficeWord body");
        assertEquals(
                "43",
                FilezEditSessionService.bodyTypeFor("wps"),
                "WPS reserves a WpsWord body");
        assertEquals(
                "42",
                FilezEditSessionService.bodyTypeFor("xlsx"),
                "XLSX reserves an OfficeExcel body");
        assertEquals(
                "44",
                FilezEditSessionService.bodyTypeFor("et"),
                "ET reserves a WpsExcel body");
        assertTrue(
                FilezEditSessionService.isOfficeBodyExtension("xls"),
                "XLS is in the FileZ body scope");
        assertFalse(
                FilezEditSessionService.isOfficeBodyExtension("pdf"),
                "PDF remains outside the FileZ body scope");
        assertFalse(
                FilezEditSessionService.isOfficeBodyExtension("pptx"),
                "PowerPoint remains outside the FileZ body scope");
        assertEquals(
                ".xlsx",
                FilezEditSessionService.suffixOf("budget.xlsx"),
                "Excel uploads preserve their real suffix");
        assertEquals(
                "",
                FilezEditSessionService.suffixOf("upload-without-extension"),
                "a missing upload suffix is not relabeled as DOCX");

        CtpContentAll word = record(41, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesOfficeContent(
                        word, SUMMARY_ID, FILE_ID),
                "OfficeWord content must bind to its exact V3XFile");

        CtpContentAll wps = record(43, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesOfficeContent(
                        wps, SUMMARY_ID, FILE_ID),
                "WpsWord content must bind to its exact V3XFile");

        CtpContentAll excel = record(42, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesOfficeContent(
                        excel, SUMMARY_ID, FILE_ID),
                "OfficeExcel content must bind to its exact V3XFile");
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        excel, SUMMARY_ID, FILE_ID),
                "Excel content must not be relabeled as Word");

        CtpContentAll et = record(44, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesOfficeContent(
                        et, SUMMARY_ID, FILE_ID),
                "WpsExcel content must bind to its exact V3XFile");

        CtpContentAll contentDataOnly = record(
                41, "", Long.valueOf(FILE_ID));
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        contentDataOnly, SUMMARY_ID, FILE_ID),
                "contentDataId must not replace the canonical content binding");

        CtpContentAll missingSort = record(
                41, String.valueOf(FILE_ID), null);
        missingSort.setSort(null);
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        missingSort, SUMMARY_ID, FILE_ID),
                "a body without the canonical sort must be rejected");

        CtpContentAll pdf = record(45, String.valueOf(FILE_ID), null);
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        pdf, SUMMARY_ID, FILE_ID),
                "PDF content must not authorize the Office-body facade");

        CtpContentAll ofd = record(46, String.valueOf(FILE_ID), null);
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        ofd, SUMMARY_ID, FILE_ID),
                "OFD content must not authorize the Office-body facade");

        CtpContentAll presentation = record(47, String.valueOf(FILE_ID), null);
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        presentation, SUMMARY_ID, FILE_ID),
                "presentation content must not authorize the body facade");

        CtpContentAll otherSummary = record(
                41, String.valueOf(FILE_ID), null);
        otherSummary.setModuleId(Long.valueOf(SUMMARY_ID + 1L));
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        otherSummary, SUMMARY_ID, FILE_ID),
                "another govdoc must not authorize the requested file");

        CtpContentAll otherFile = record(
                41, String.valueOf(FILE_ID + 1L), null);
        assertFalse(
                FilezViewSessionService.matchesOfficeContent(
                        otherFile, SUMMARY_ID, FILE_ID),
                "another body file must not be accepted");

        assertTrue(
                FilezViewSessionService.matchesOfficeFamily(
                        "42",
                        "budget.xlsx",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        "xlsx"),
                "Excel request, body type, filename and MIME must agree");
        assertTrue(
                FilezViewSessionService.matchesOfficeFamily(
                        "WpsExcel",
                        "budget.et",
                        "application/octet-stream",
                        "et"),
                "an ET filename may confirm WpsExcel when MIME is generic");
        assertFalse(
                FilezViewSessionService.matchesOfficeFamily(
                        "41",
                        "document.docx",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "xlsx"),
                "an Excel request must not open a Word body");
        assertFalse(
                FilezViewSessionService.matchesOfficeFamily(
                        "42",
                        "document.docx",
                        "application/vnd.ms-excel",
                        "xlsx"),
                "conflicting filename metadata must fail closed");
        assertFalse(
                FilezViewSessionService.matchesOfficeFamily(
                        "42",
                        "body.bin",
                        "application/octet-stream",
                        "xlsx"),
                "unconfirmed Office metadata must fail closed");

        System.out.println("FileZ mainbody authorization smoke tests passed.");
    }

    private static CtpContentAll record(
            int contentType, String content, Long contentDataId) {
        CtpContentAll result = new CtpContentAll();
        result.setModuleType(Integer.valueOf(ModuleType.edoc.getKey()));
        result.setModuleId(Long.valueOf(SUMMARY_ID));
        result.setContentType(Integer.valueOf(contentType));
        result.setContent(content);
        result.setContentDataId(contentDataId);
        result.setSort(1);
        return result;
    }

    private static void assertTrue(boolean condition, String label) {
        if (!condition) {
            throw new AssertionError(label);
        }
    }

    private static void assertFalse(boolean condition, String label) {
        assertTrue(!condition, label);
    }

    private static void assertEquals(
            Object expected, Object actual, String label) {
        if (expected == null ? actual != null : !expected.equals(actual)) {
            throw new AssertionError(
                    label + ": expected=" + expected + ", actual=" + actual);
        }
    }
}
