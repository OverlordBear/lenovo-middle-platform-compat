/*
 * Copyright (c) 2024 Seeyon, Inc.
 * All rights reserved.
 *
 * This software is the proprietary information of Seeyon, Inc.
 * Use is subject to license terms.
 *
 * @date 2024-11-25 11:17:59
 * @company seeyon.com
 * @author shuqi
 * @since V5 V9.x
 */
import state from '@/store/state'
import Vue from "vue";
import {viewMode} from "@/enum";

/**
 * @description: 初始化正文数据
 */
export const initEdocContent = (params, queryParam) => {
  let typeMap = {};
  let {typeList} = params;
  typeList.forEach(o => typeMap[o.mainbodyType] = o.name);
  params.typeMap = typeMap;

  //gjx-start：新建公文默认标准正文 HTML（客开，与 FileZ 无关，2026-06-17 引入）
  // 发文页面默认显示标准正文（HTML），而不是Word正文；
  // 仅在全新新建公文（无 summaryId/affairId、非模板/待发加载）时生效。
  // ⚠️ 维护记录：2026-07-16 曾按"与管理端默认正文类型配置重复"的假设删除本块，
  // 实测服务端对空白新建返回的默认类型是 Word，发文页行为回归，遂恢复。
  // 除非在 OA 管理端找到等效配置并实测生效，否则不要删除本块。
  const isNewDoc = queryParam?.method === 'newGovdoc'
    && !queryParam?.summaryId
    && !queryParam?.affairId
    && !queryParam?.forwardAffairId
    && queryParam?.from !== 'template'
    && queryParam?.from !== 'waitSend';
  const hasHtmlType = typeList.some(item => String(item.mainbodyType) === '10');
  const isNonHtmlContent = String(params.contentType) !== '10' || params.bodyType !== 'HTML';

  if (isNewDoc && hasHtmlType && isNonHtmlContent) {
    console.warn('[initEdocContent] 强制默认正文类型为标准正文(HTML)，原类型:', params.contentType, params.bodyType);
    params.contentType = '10';
    params.bodyType = 'HTML';
    params.fileType = '';
    params.content = '';
  }
  //gjx-end

  if (typeMap[params.contentType]) {
    params.contentTypeName = typeMap[params.contentType];
  } else {
    params.contentTypeName = typeMap[typeList[0].mainbodyType];
  }

  let defaultTab = "content";
  if (queryParam?.method === "summary") {
    if (!!params.pdfFileId) {
      defaultTab = 'pdfContent'
    }
    if (!!params.ofdFileId) {
      defaultTab = 'ofdContent'
    }
  }else {
    params.viewMode = viewMode.edit;
  }
  params.activeTab = defaultTab;
  state.edocContent = {...state.edocContent, ...params};
};

/**
 * 切换正文页签
 * @param activeTab {string} 页签key ["content"|"ofdContent"|"pdfContent"]
 */
const changeContentActiveTab = (activeTab) => {
  state.edocContent.activeTab = activeTab;
}

// 设置是否可以下载
const setContentDownloadState = (flag) => {
  state.edocContent.canDownload = flag;
}

/**
 * 转Ofd文件后更新文件数据
 */
const changeOfdFileId = ({ofdFileId, ofdCreateDate, ofdHasBodyFile}) => {
  state.edocContent.ofdFileId = ofdFileId;
  state.edocContent.ofdCreateDate = ofdCreateDate;
  state.edocContent.ofdHasBodyFile = ofdHasBodyFile;
}

/**
 * 转pdf文件后更新文件数据
 */
const changePdfFileId = ({pdfFileId, pdfCreateDate, pdfHasBodyFile}) => {
  state.edocContent.pdfFileId = pdfFileId;
  state.edocContent.pdfCreateDate = pdfCreateDate;
  state.edocContent.pdfHasBodyFile = pdfHasBodyFile;
}


const changeEditorWait = (editorWait) => {
  state.edocContent.editorWait = editorWait;
}
/**
 * 将正文状态改为修改模式
 * @param viewMode 模式
 */
const changeToEditSate = (viewMode) => {
  state.edocContent.viewMode = viewMode;
  return new Promise(resolve => {
    setTimeout(() => {
      Vue.nextTick(async function () {
        if (!state.edocContent.editorWait) {
          resolve();
        }
        await state.edocContent.editorWait;
        resolve();
      });

    }, 1000);
  });
}

/**
 * 添加写死成功
 */
const contentWriteLockSuccess = () => {
  state.edocContent.isWriteLockContent = true;
}
/**
 * 添加写死成功
 */
const contentReadLockSuccess = () => {
  state.edocContent.isReadLockContent = true;
}

const setOpenBeforeFun = (openBeforeFun) => {
  state.edocContent.openBeforeFun = openBeforeFun;
}

const getOpenBeforeFun = () => {
  return state.edocContent.openBeforeFun;
}

export default {
  changeOfdFileId,
  changePdfFileId,
  changeContentActiveTab,
  setContentDownloadState,

  changeEditorWait,
  changeToEditSate,

  contentWriteLockSuccess,
  contentReadLockSuccess,
  setOpenBeforeFun,
  getOpenBeforeFun
}