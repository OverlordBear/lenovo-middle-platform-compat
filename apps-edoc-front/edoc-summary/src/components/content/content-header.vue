<!--
  - Copyright (c) 2024-2024 Seeyon, Inc.
  - All rights reserved.
  -
  - This software is the proprietary information of Seeyon, Inc.
  - Use is subject to license terms.
  -
  - @date 2024-10-20 14:59:19
  - @company seeyon.com
  - @author shuqi
  - @since V5 V9.0SP1
  -->
<template>
  <div class="content-header" v-show="btnList.length || aiEdoc.show || edocContent.typeList.length">
    <toolbar-button
      ref="btn"
      v-if="btnList.length || aiEdoc.show || edocContent.typeList.length"
      autoCalculated
      align="center"
      :list="btnList"
      class="header-toolbar"
      @btnClick="onBtnClick"
      :moreBtnStyle="2">
      <a-dropdown
        slot="before"
        ref="contentBtn"
        v-if="queryParam.method === 'newGovdoc'"
        :disabled="!edocContent.canChooseContentType">
        <a-menu slot="overlay" @click="changeType">
          <a-menu-item v-for="item in edocContent.typeList" :key="item.mainbodyType">
            {{ item.name }}
          </a-menu-item>
        </a-menu>
        <a-button>
          {{ edocContent.contentTypeName }}
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-alert
        slot="before"
        v-if="queryParam.method === 'summary' && edocContent.showTHOrGZAlert"
        message="请确认当前正文是否套红或盖章！"
        style="flex-shrink: 0"
        id="th-gz-alert"
        banner
        closable
        afterClose="hideAlert" />
      <a-dropdown slot="after" ref="aiBtn" v-if="aiEdoc.show">
        <a-menu slot="overlay">
          <!--gjx-start：AI 智能创作入口（客开，与 FileZ 无关）——跳转独立 AI 创作页面-->
<!--          <a-menu-item-->
<!--            @click="openAiDocGeneratorPage"-->
<!--            key="ai-generator">-->
<!--            <span style="color: #722ed1; font-weight: 500;">-->
<!--              ✨ AI智能创作-->
<!--            </span>-->
<!--            <a-tag color="purple" style="margin-left: 8px; font-size: 10px;">NEW</a-tag>-->
<!--          </a-menu-item>-->
          <a-menu-divider />
          <!--gjx-end-->
          <a-menu-item
            @click="onBtnClick({ id: 'openAiEdocWriting', nav: 'smartEcsNav' })"
            v-if="aiEdoc.canSmartWrite">
            智能拟文
          </a-menu-item>
          <a-menu-item
            @click="onBtnClick({ id: 'openAiEdocWriting', nav: 'smartEcsOptimizeNav' })"
            v-if="aiEdoc.canSmartWritingOptimize">
            写作优化
          </a-menu-item>
          <a-menu-item
            @click="onBtnClick({ id: 'openAiEdocWriting', nav: 'smartEcsSearchNav' })"
            v-if="aiEdoc.canSmartEcsSearch">
            公文检索
          </a-menu-item>
          <a-menu-item
            @click="onBtnClick({ id: 'openAiEdocAssistRead' })"
            v-if="aiEdoc.canSmartEcsAssist">
            辅助阅读
          </a-menu-item>
          <a-menu-item
            @click="onBtnClick({ id: 'openAiEdocWriting', nav: 'smartEcsAssistNav' })"
            v-if="aiEdoc.canSmartEcsAssist">
            辅助审批
          </a-menu-item>
          <a-menu-item @click="onBtnClick({ id: 'aIEdocCorrect' })" v-if="aiEdoc.canAiEdocCorrect">
            公文政治审校
          </a-menu-item>
          <a-menu-item
            @click="onBtnClick({ id: 'aIEdocSensitiveWord' })"
            v-if="aiEdoc.canAiSensitiveWordCheck">
            敏感词检查
          </a-menu-item>
          <a-menu-item @click="onBtnClick({ id: 'aIEdocOCR' })" v-if="aiEdoc.canAiEdocOcr">
            OCR识别
          </a-menu-item>
        </a-menu>
        <a-button class="ai-btn">
          <i class="icon icon-ai" />
          智能公文
        </a-button>
      </a-dropdown>
    </toolbar-button>
  </div>
</template>
<script>
  import { destroyOfficeEditor, initOfficeEditor } from '@/components/content/office-content';
  import { handles as handlers } from '@/handles';
  import logger from '@/utils/logger';
  import ContentTypeConvert from '@/utils/content-type-convert';
  import { getOfficeEditor } from '@/store/instance';
  import { contentFrame } from '@/enum';
  //gjx-start：AI 智能创作所需导入（客开，与 FileZ 无关）
  import { viewMode } from '@/enum';
  import state from '@/store/state';
  import api from '@/api';
  //gjx-end
  import actions from '@/store/actions';
  import { initCkEditor } from '@/components/content/html-content';
  import ToolbarButton from '@/components/toolbar-button';
  import Logger from '@/utils/logger';

  const navMaps = {
    smartEcsNav: '智能拟文',
    smartEcsOptimizeNav: '写作优化',
    smartEcsSearchNav: '公文检索',
    smartEcsAssistNav: '辅助审批'
  };

  export default {
    name: 'contentHeader',
    components: {
      ToolbarButton
    },
    props: {
      queryParam: Object,
      aiEdoc: Object,
      baseInfo: Object,
      edocContent: Object,
      fullScreen: {
        type: Boolean,
        default: true
      },
      showSmartDecision: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {};
    },
    computed: {
      //是否有正文
      hasBodyFile() {
        let hasBodyFile = this.edocContent.hasBodyFile;
        if (hasBodyFile) {
          return hasBodyFile;
        }
        let contentType = ['Pdf', 'Ofd'];
        return !contentType.includes(this.edocContent.bodyType);
      },
      canContentPrint() {
        let canMap = this.baseInfo.nodePolicy.canMap;
        let canPrintContentAcc = canMap.canPrintContentAcc;
        if (canPrintContentAcc) {
          if (this.queryParam.method === 'newGovdoc') {
            if (this.edocContent.bodyType === 'HTML') {
              return false;
            }
            if (this.queryParam.sub_app != 2) {
              if (this.edocContent.bodyType === 'Pdf') {
                return !!this.edocContent.content;
              }
              if (this.edocContent.bodyType === 'Ofd') {
                return !!this.edocContent.content;
              }
            }
            return true;
          }
        }
        return canPrintContentAcc;
      },
      // 是否可以转换ofd/pdf
      btnList() {
        // 是否有板式正文
        let hasOFDorPDF = this.edocContent.ofdFileId || this.edocContent.pdfFileId;
        // 归档后只显示正文
        if (this.baseInfo?.basicInfo?.onlySeeContent) {
          return [];
        }
        let canMap = this.baseInfo.nodePolicy.canMap;

        let list = [];

        // 查看原文档
        {
          const openFrom = this.queryParam.openFrom;
          let nodePolicyCode = this.baseInfo?.nodePolicy?.nodePolicyCode;
          let isOfficeTran = this.baseInfo?.basicInfo?.isOfficeTrans;
          let contentType = ['OfficeWord', 'OfficeExcel', 'WpsWord', 'WpsExcel', 'Pdf', 'Ofd'];
          let contentType1 = ['OfficeWord', 'WpsWord'];
          if (
            contentType.includes(this.edocContent.bodyType) &&
            !(nodePolicyCode == 'fengfa' && contentType1.includes(this.edocContent.bodyType)) &&
            isOfficeTran &&
            openFrom != 'assist'
          ) {
            const viewOriginalContent = {
              id: 'viewOriginalContent',
              icon: 'xicon-form-text',
              label: $.i18n('collaboration.content.viewOriginalContent'),
              _label: $.i18n('collaboration.content.viewOriginalContent')
            };
            list.push(viewOriginalContent);
          }
        }
        // 上传正文
        let isFenBan = this.baseInfo.basicInfo.isFenBan; // 分办不能上传正文
        if (this.queryParam.method === 'newGovdoc' && !isFenBan && !this.queryParam.signSummaryId) {
          const uploadFile = {
            id: 'uploadContentFile',
            icon: 'xicon-xia',
            label: '上传正文',
            _label: '上传正文'
          };
          list.push(uploadFile);
        }
        // 打印正文
        if (this.canContentPrint && this.hasBodyFile) {
          const printContent = {
            id: 'contentPrint',
            icon: 'xicon-LinedOfficeSupplies',
            label: '正文打印',
            _label: '正文打印'
          };
          list.push(printContent);
        }
        // 正文下载
        if (canMap.canSaveContentAcc && this.edocContent.canDownload && this.hasBodyFile) {
          const downloadContent = {
            id: 'downloadContent',
            icon: 'xicon-download',
            label: '正文下载',
            _label: '正文下载'
          };
          list.push(downloadContent);
        }

        let canTrans =
          this.edocContent.bodyType === 'OfficeWord' || this.edocContent.bodyType === 'WpsWord';
        // 正文转PDF
        if (canTrans && (canMap.canContentGovdocPdf || canMap.canTanstoPDF)) {
          const tanstoPDF = {
            id: 'tanstoPDF',
            icon: 'sy-LinedConvertToPdf',
            label: '正文转PDF',
            _label: '正文转PDF'
          };
          list.push(tanstoPDF);
        }
        // 正文转OFD
        if (canTrans && (canMap.canContentGovdocOfd || canMap.canTransToOfd)) {
          const transToOfd = {
            id: 'transToOfd',
            icon: 'sy-LinedConvertToOfd',
            label: '正文转OFD',
            _label: '正文转OFD'
          };
          list.push(transToOfd);
        }
        // 正文套红、智能排版
        if (canMap.canEdocTemplate || canMap.canTypeSetting) {
          let label = canMap.canTypeSetting ? '智能排版' : '正文套红';
          const sendTaohong = {
            id: 'sendTaohong',
            icon: 'syIcon sy-body-red',
            label: label,
            _label: label
          };
          list.push(sendTaohong);
        }
        // 修改正文
        if (canMap.canEdit) {
          const editContent = {
            id: 'edit',
            icon: 'syIcon sy-modify_text',
            label: '修改正文',
            _label: '修改正文'
          };
          list.push(editContent);
        }
        // 正文盖章
        // 快速发文转板式文件后，去掉正文盖章
        if (
          canMap.canContentSign &&
          this.hasBodyFile &&
          (!this.queryParam.isQuickSend || !hasOFDorPDF)
        ) {
          const contentSign = {
            id: 'ContentSign',
            icon: 'syIcon sy-signa',
            label: '正文盖章',
            _label: '正文盖章'
          };
          list.push(contentSign);
        }
        return list;
      },
      // 是否是多正文
      isMultipleTexts() {
        const { content, ofdFileId, pdfFileId } = this.edocContent;
        const count = [!!content, !!ofdFileId, !!pdfFileId].filter(Boolean).length;
        // 如果有流式正文、OFD正文、PDF正文中的任意两个或以上，则认为是多正文
        return count >= 2;
      }
    },
    mounted() {
      console.log(this.aiEdoc, 'aiEdoc-----');
      //gjx-start：AI 智能创作（客开）——监听独立 AI 创作页面的 postMessage 推送
      this._aiDocxMessageHandler = (event) => {
        if (event.data && event.data.type === 'AI_DOCX_APPLY') {
          this.handleAiDocxApply(event.data);
        }
      };
      window.addEventListener('message', this._aiDocxMessageHandler);
      //gjx-end
    },
    //gjx-start：AI 智能创作（客开）——组件销毁时移除 postMessage 监听
    beforeDestroy() {
      if (this._aiDocxMessageHandler) {
        window.removeEventListener('message', this._aiDocxMessageHandler);
      }
    },
    //gjx-end
    methods: {
      //gjx-start：AI 智能创作（客开，与 FileZ 无关）
      // 跳转到独立的 AI 智能公文创作页面
      openAiDocGeneratorPage() {
        const aiPageUrl = 'http://101.35.43.199:8081';
        window.open(aiPageUrl, '_blank');
      },

      // 接收独立 AI 创作页面发来的 docx，自动上传到 OA 并应用为正文
      async handleAiDocxApply(msgData) {
        const { docxUrl, filename, title } = msgData;
        Logger.info('[AI应用] 收到 docx 推送，准备上传到 OA 编辑器', filename);
        try {
          // 步骤1：从 AI 后端下载 docx 文件
          const resp = await fetch(docxUrl);
          if (!resp.ok) throw new Error(`下载文件失败：HTTP ${resp.status}`);
          const blob = await resp.blob();

          // 步骤2：上传到 OA 服务器（与 CtpUiUploadFullScreenDrag 相同端点）
          const file = new File([blob], filename, {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          const attachment = await this._uploadFileToOA(file);

          // 步骤3：调用 OA 的上传正文后续流程（注册文件 + 初始化编辑器）
          await this._applyUploadedFileToEditor(attachment);

          this.$message.success(`AI 公文「${title || filename}」已应用至正文编辑器`);
        } catch (err) {
          Logger.error('[AI应用] 失败：', err);
          this.$message.error(`AI 公文应用失败：${err.message}`);
        }
      },

      // 上传文件到 OA 服务器
      async _uploadFileToOA(file) {
        const ctxPath = window.ctpEnv ? window.ctpEnv.ctxPath : '/seeyon';
        const uploadUrl = `${ctxPath}/fileUpload.do?method=processUploadForH5`;

        const formData = new FormData();
        const now = Date.now();
        formData.append('file', file);
        formData.append('method', 'processUploadForH5');
        formData.append('fileSize', String(file.size));
        formData.append('maxSize', String(100 * 1024 * 1024));
        formData.append('currentPageId', `ai_apply_${now}_${Math.random()}`);
        formData.append('lastModifiedDate', String(now));
        formData.append('startIndex', '0');
        formData.append('fileName', file.name);
        formData.append('fileNameEncode', encodeURI(file.name));
        formData.append('extensions', 'doc,docx,wps,xls,xlsx,et,pdf,ofd');
        formData.append('inOrExcludeFormat', '');
        formData.append('isEncrypt', 'true');
        formData.append('type', '4');
        formData.append('firstSave', 'true');
        formData.append('secretLevel', '');
        formData.append('secretLevelName', '');

        const csrfToken = window.CsrfGuard ? window.CsrfGuard.getToken() : '';
        const resp = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: csrfToken ? {
            'X-Requested-With': 'XMLHttpRequest',
            'CSRFTOKEN': csrfToken,
          } : {},
        });
        if (!resp.ok) {
          throw new Error(`OA 文件上传失败：HTTP ${resp.status}`);
        }
        const data = await resp.json();
        Logger.info('[AI应用] 上传响应', data);
        if (data.status && String(data.status) !== '200') {
          throw new Error(data.message || `上传失败：status=${data.status}`);
        }
        const att = data.att || data;
        return {
          fileUrl: att.fileUrl || att.file_url || att.id,
          filename: att.filename || att.fileName || file.name,
          extension: att.extension || att.ext || file.name.split('.').pop(),
          size: att.size || att.fileSize || file.size,
          createDate: att.createDate || att.create_date || new Date().toISOString(),
        };
      },

      // 将已上传的文件应用到编辑器。
      // 说明：Word/Excel（FileZ 目标类型）由 src/custom/filez 的 OfficeSDK 类劫持
      // 在 initOfficeEditor 内自动接管渲染，这里无需区分 FileZ 与原生。
      async _applyUploadedFileToEditor(attachment) {
        const ext = attachment.extension.toLowerCase();
        const validExts = ['doc', 'docx', 'wps', 'xls', 'xlsx', 'et', 'pdf', 'ofd'];
        if (!validExts.includes(ext)) {
          throw new Error(`不支持的文件类型：${ext}`);
        }

        // 1. 调用 OA 后端注册文件
        await api.createV3XFile4UploadContent(
          attachment.fileUrl,
          attachment.extension,
          attachment.size
        );

        // 2. 类型转换
        const bodyType = ContentTypeConvert.suffix2BodyType(ext);
        const contentType = ContentTypeConvert.bodyType2ContentType(bodyType);
        const contentInfo = state.edocContent;

        // 3. 销毁旧编辑器实例
        await destroyOfficeEditor({
          instance: [
            contentFrame.pdfContent,
            contentFrame.ofdContent,
            contentFrame.content,
          ],
        });

        // 4. 更新状态
        actions.changeContentType({
          contentType,
          bodyType,
          contentTypeName: contentInfo.typeMap[contentType],
          fileType: ext,
          content: attachment.fileUrl,
          createDate: attachment.createDate,
          hasBodyFile: true,
        });

        // 5. 初始化编辑器
        const editorParams = {
          bodyType,
          isRevertContent: true,
          from: 'upload',
          viewMode: viewMode.edit,
          fileId: attachment.fileUrl,
          createDate: attachment.createDate,
          hasBodyFile: true,
          contentType,
          fileType: ext,
          domId: contentFrame.content,
          showOptimizeMenu: state.aiEdoc.canSmartWritingOptimize,
          showSearchMenu: state.aiEdoc.canSmartEcsSearch,
        };
        await initOfficeEditor(state.edocContent, state.queryParam, editorParams);
        Logger.info('[AI应用] 编辑器初始化完成');
      },
      //gjx-end
      hideAlert() {
        actions.showTHOrGZAlert(false);
      },
      changeType(e) {
        let contentType = e.key;
        if (contentType === this.edocContent.contentType) {
          return;
        }
        let confirm = $.confirm({
          msg: $.i18n('content.switchtype.message'),
          ok_fn: async () => {
            logger.info('changeType', e);
            await this.changeContentType(e.key);
          },
          cancel_fn: () => {
            confirm.close();
          }
        });
      },
      async changeContentType(contentType) {
        logger.info('changeContentType', contentType);
        const edocContent = this.edocContent;

        let typeName = edocContent.typeMap[contentType];
        let bodyType = ContentTypeConvert.contentType2BodyType(contentType);
        let fileType = ContentTypeConvert.bodyType4Suffix(bodyType);
        let newFileId = window.getUUID();

        // 正文上传走到这里已经上传成功了，设置新建状态下正文存在状态为true;\
        let officeInstance = getOfficeEditor();
        if (officeInstance && officeInstance.isClientApp()) {
          await officeInstance.closeFile();
        }
        // 销毁之前的实例
        await destroyOfficeEditor({
          instance: [contentFrame.pdfContent, contentFrame.ofdContent, contentFrame.content]
        });
        if (bodyType === 'HTML') {
          // bodyType
          actions.changeContentType({
            contentType,
            bodyType,
            contentTypeName: typeName,
            fileType,
            content: '',
            createDate: new Date().format('yyyy-MM-dd'),
            hasBodyFile: false
          });
          initCkEditor('content', this.fullScreen).then((content) => {
            logger.info('content init ok!', content);
          });
        } else {
          // bodyType
          actions.changeContentType({
            contentType,
            bodyType,
            contentTypeName: typeName,
            content: newFileId,
            createDate: new Date().format('yyyy-MM-dd'),
            hasBodyFile: false,
            fileType
          });

          let editorParams = {};
          editorParams.bodyType = bodyType;
          editorParams.isRevertContent = true;
          editorParams.from = 'change';
          editorParams.viewMode = 'edit';
          //如果切换正文类型
          editorParams.fileId = newFileId;
          editorParams.createDate = edocContent.content;
          editorParams.hasBodyFile = edocContent.hasBodyFile;
          editorParams.contentType = edocContent.contentType;
          editorParams.bodyType = edocContent.bodyType;
          editorParams.fileType = fileType.toLowerCase();
          editorParams.domId = contentFrame.content;

          await initOfficeEditor(edocContent, this.queryParam, editorParams);
        }
      },
      async onBtnClick(item) {
        let funName = item.id;
        let nav = item.nav;
        if (['smartEcsNav', 'smartEcsOptimizeNav', 'smartEcsSearchNav', 'smartEcsAssistNav'].includes( nav)) {
          // 针对多正文的场景，获取对应的正文实例
          const cacheKey = contentFrame[this.edocContent.activeTab];
          const targetSDK = getOfficeEditor(cacheKey);
          const contentEditorInstance = getOfficeEditor();
          // 全局state中并未找到能获取当前编辑器的相关key，只能从SDK中获取
          const currentPluginKey = targetSDK && targetSDK.pluginKey;
          const isFenBan = this.baseInfo.basicInfo.isFenBan;
          // 智能拟文
          if (nav === 'smartEcsNav') {
            if (!['WpsWord', 'OfficeWord'].includes(this.edocContent.bodyType) || (currentPluginKey !== 'ONLINE_EDIT_WDT' && currentPluginKey !== 'ONLINE_EDIT_KINGSOFT')) {
              this.$message.warning(`目前${navMaps[nav]}功能，只支持在线编辑插件是文档通或金山在线编辑，且正文格式为Word正文、Wps文字。`);
              return;
            }
          }
          // 写作优化
          if (nav === 'smartEcsOptimizeNav') {
            const { pluginKey, cacheAdapterMapping } = contentEditorInstance || {};
            const contentPluginKey = pluginKey;
            if (this.isMultipleTexts && !contentEditorInstance) {
              this.$message.warning('请先点击页面上的“正文”按钮，打开流式正文后，再操作。');
              return;
            }
            const targetEditType = cacheAdapterMapping && cacheAdapterMapping.WORD && cacheAdapterMapping.WORD.EDIT; // 获取当前编辑类型
            const isSummary = this.queryParam.method === 'summary'; // 是否是处理节点
            // 当前编辑器是不是文档通或金山在线编辑
            const isWdtOrKingSoft = ['ONLINE_EDIT_WDT', 'ONLINE_EDIT_KINGSOFT'].includes(contentPluginKey);
            // 是否存在编辑类型为文档通或金山在线编辑
            const isExistEditType = ['ONLINE_EDIT_WDT', 'ONLINE_EDIT_KINGSOFT'].includes(targetEditType);
            if (!['WpsWord', 'OfficeWord'].includes(this.edocContent.bodyType) || (!isWdtOrKingSoft && !isSummary) || (!isExistEditType && isSummary)) {
              this.$message.warning(`目前${navMaps[nav]}功能，只支持在线编辑插件是文档通或金山在线编辑，且正文格式为Word正文、Wps文字。`);
              return;
            }
          }
          // 公文检索
          if (nav === 'smartEcsSearchNav') {
            if (!['Ofd', 'Pdf', 'WpsWord', 'OfficeWord'].includes(this.edocContent.bodyType)) {
              this.$message.warning(`目前${navMaps[nav]}功能，仅支持格式为word、WPS、pdf、ofd正文。`);
              return;
            }
          }

          // 辅助审批
          if (nav === 'smartEcsAssistNav') {
            if (!['Ofd', 'Pdf', 'WpsExcel', 'WpsWord', 'OfficeExcel', 'OfficeWord'].includes(this.edocContent.bodyType)) {
              this.$message.warning(`目前${navMaps[nav]}功能，仅支持Word、Excel、WPS文字、WPS表格、PDF、OFD文件`);
              return;
            }
          }

          // 【分办不能使用【智能拟文】【写作优化】
          if (['smartEcsNav', 'smartEcsOptimizeNav'].includes(nav) && isFenBan) {
            this.$message.warning('当前公文不能修改，不支持该功能');
            return;
          }
        }
        if (this?.[funName] && typeof this[funName] === 'function') {
          return await this[funName]();
        }
        if (handlers[funName] && typeof handlers[funName] === 'function') {
          return await handlers[funName](nav);
        }
        Logger.warn('onBtnClick', JSON.stringify(item));
      },
      sendTaohong() {
        let canMap = this.baseInfo.nodePolicy.canMap;
        handlers.sendTaohong({
          templateType: 'govdoc',
          typeSetting: !!canMap.canTypeSetting
        });
      }
    }
  };
</script>
<style lang="scss">
  .content-header {
    display: flex;
    padding: 12px 19px;
    border-bottom: 1px solid #ececec;

    #th-gz-alert {
      flex-shrink: 0;
      height: 30px;
      line-height: 1;

      .ant-alert-icon {
        top: 7px;
      }
      .ant-alert-close-icon {
        top: 5px;
      }
    }

    .ai-btn {
      min-width: 118px;
    }
    .ai-btn.ant-btn {
      padding: 0 15px 0 13px;
      background: linear-gradient(
        136.55deg,
        #fff5d9 0%,
        #f4e1ff 31.77%,
        #e7f2ff 79.91%,
        rgba(193, 222, 255, 0.13) 104.25%
      ) !important;

      &:focus,
      &:active,
      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }
    }

    .icon-ai {
      height: 24px;
      width: 26px;
      background-image: url(/seeyon/portal/images/uploadImg/ai-entry-icon.png);
      background-size: cover;
      margin-right: 8px;
      float: left;
    }
    .ant-btn {
      background: rgb(247, 247, 247);
      border: none;
      box-shadow: 0 2px 0 rgba(247, 247, 247, 0.015);
    }
    .header-toolbar {
      flex: 1;
      .button .button-wrap.ant-btn-link,
      .toolbar-more-btn-link {
        padding: 0 15px;
      }
    }
  }
</style>
