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
        CtpContentAll word = record(41, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesWordContent(
                        word, SUMMARY_ID, FILE_ID),
                "OfficeWord content must bind to its exact V3XFile");

        CtpContentAll wps = record(43, String.valueOf(FILE_ID), null);
        assertTrue(
                FilezViewSessionService.matchesWordContent(
                        wps, SUMMARY_ID, FILE_ID),
                "WpsWord content must bind to its exact V3XFile");

        CtpContentAll contentDataOnly = record(
                41, "", Long.valueOf(FILE_ID));
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        contentDataOnly, SUMMARY_ID, FILE_ID),
                "contentDataId must not replace the canonical content binding");

        CtpContentAll missingSort = record(
                41, String.valueOf(FILE_ID), null);
        missingSort.setSort(null);
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        missingSort, SUMMARY_ID, FILE_ID),
                "a body without the canonical sort must be rejected");

        CtpContentAll pdf = record(45, String.valueOf(FILE_ID), null);
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        pdf, SUMMARY_ID, FILE_ID),
                "PDF content must not authorize the Word facade");

        CtpContentAll otherSummary = record(
                41, String.valueOf(FILE_ID), null);
        otherSummary.setModuleId(Long.valueOf(SUMMARY_ID + 1L));
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        otherSummary, SUMMARY_ID, FILE_ID),
                "another govdoc must not authorize the requested file");

        CtpContentAll otherFile = record(
                41, String.valueOf(FILE_ID + 1L), null);
        assertFalse(
                FilezViewSessionService.matchesWordContent(
                        otherFile, SUMMARY_ID, FILE_ID),
                "another body file must not be accepted");

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
}
