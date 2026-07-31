<template>
  <div class="attachment">
    <div class="list">
      <div class="header">
        <div class="button-area">
          <div class="common-btn">
            <a-button v-if="showSelectCount && selectedNum" @click="actionEvent('cancelSelect')">
              <iconFont type="cap-icon-guanbi"></iconFont>
              <a-divider type="vertical" />
              <span>{{ selectedNum }}/{{ totalNum }}条</span>
            </a-button>
            <a-button
              v-if="canUploadAttachment"
              class="upload-att"
              v-on:click="actionEvent('upload')">
              {{ $i18n('govdoc.upload.attachment') }}
              ({{ attNum }})
            </a-button>

            <a-button
              v-if="canRelateAttachment"
              class="relate-att"
              v-on:click="actionEvent('relateAtt')">
              {{ $i18n('common.toolbar.insert.relateAttachment.label') }}
            </a-button>

            <a-button
              v-if="canUploadRelDoc"
              class="relate-doc"
              v-on:click="actionEvent('relateDoc')">
              {{ $i18n('govdoc.sender.postscript.correlationDocument') }}
              ({{ docNum }})
            </a-button>

            <a-button
              v-if="canDelete"
              :disabled="!selectedNum"
              class="batch-delete"
              v-on:click="actionEvent('batchDelete')">
              {{ $i18n('template.supervise.toolbar.batch.delete.js') }}
            </a-button>
            <!-- 批量下载 -->
            <a-button
              v-if="canBatchDownload"
              :disabled="!selectedNum"
              v-on:click="actionEvent('batchDownload')">
              {{ $i18n('collaboration.summary.attachment.batchDown') }}
            </a-button>
            <!-- 修改附件 -->
            <a-button v-if="canEdit" v-on:click="actionEvent('edit')">
              {{ $i18n('govdoc.summary.updateAtt') }}
            </a-button>
          </div>
          <div class="other-btn">
            <!-- 搜索 -->
            <a-input-search
              v-if="canSearch"
              class="btn-search"
              placeholder="请输入附件名称关键字"
              style="width: 280px"
              @search="onSearch" />
          </div>
        </div>
      </div>
      <div class="content">
        <div class="list">
          <div class="header">
            <div class="row">
              <div class="col sort" v-if="sortable"></div>
              <div class="col key">
                <a-checkbox
                  :checked="checkAll"
                  :indeterminate="indeterminate"
                  @change="actionEvent('clickAll')"></a-checkbox>
              </div>
              <div class="col type" v-if="showType" :title="$i18n('system.resource.menuResource.import.type')">{{ $i18n('system.resource.menuResource.import.type') }}</div>
              <div class="col name" :title="$i18n('common.name.label')">{{ $i18n('common.name.label') }}</div>
              <div class="col creator" :title="$i18n('govdoc.upload.att.creator.relator')">{{ $i18n('govdoc.upload.att.creator.relator') }}</div>
              <div class="col size" :title="$i18n('cap4.form.business.app.export.size')">{{ $i18n('cap4.form.business.app.export.size') }}</div>
              <div class="col sendTo" v-if="hasAttachmentAssignDetail" :title="$i18n('govdoc.attachmentAssign.unit')">{{ $i18n('govdoc.attachmentAssign.unit') }}</div>
              <div class="col source" v-if="showSource" :title="$i18n('govdoc.att.source')">{{ $i18n('govdoc.att.source') }}</div>
              <div class="col operation" :title="$i18n('govdoc.pishi.action')">{{ $i18n('govdoc.pishi.action') }}</div>
            </div>
          </div>
          <div class="body" v-show="this.attachments.length > 0">
            <!-- 附件 -->
            <div ref="dragArea" class="att-list">
              <div v-for="item in attList" :key="item.fileUrl" class="row">
                <div class="col sort" v-if="sortable"><icon-font type="cap-icon-drag" /></div>
                <div class="col key">
                  <a-checkbox v-model="item.checked" @change="change(item)"></a-checkbox>
                </div>
                <div class="col type" v-if="showType" :title="showTypeFun(item.type)">{{ showTypeFun(item.type) }}</div>
                <div
                  :title="item.fileName"
                  class="col name"
                  v-on:click="actionEvent('preview', item)">
                  <span :class="getIconClass(item)"></span>
                  <span v-if="getSecretName(item)" style="color: red"
                    >[{{ item.secretLevelName }}]</span
                  >
                  {{ item.fileName.replace('/&nbsp;/g', '') }}
                </div>
                <div :title="item.creator || creator" class="col creator">{{ item.creator || creator }}</div>
                <div class="col size" :title="showSize(item.size)">{{ showSize(item.size) }}</div>
                <div class="col sendTo" v-if="hasAttachmentAssignDetail" :title="item.sendTo">{{ item.sendTo }}</div>
                <div class="col source" v-if="showSource" :title="showSourceFun(item.category)">{{ showSourceFun(item.category) }}</div>
                <div class="col operation">
                  <!-- 预览 -->
                  <!--gjx-start：预览改走联想文档中台（放开原 canPreview 条件，zip/txt 等也可由 FileZ 预览）-->
                  <a v-on:click="gjxView(item)">{{
                    $i18n('govdoc.resource.resourceConfig.Preview')
                  }}</a>
                  <!--gjx-end-->
                  <!--gjx-start：以下为致远原版预览入口，由上方 FileZ 预览取代，仅注释保留
                  <a v-if="canPreview(item)" v-on:click="actionEvent('preview', item)">{{
                    $i18n('govdoc.resource.resourceConfig.Preview')
                  }}</a>
                  gjx-end-->

                  <!-- 删除 -->
                  <a v-if="canDelete" v-on:click="actionEvent('delete', item)">{{
                    $i18n('govdoc.opinion.del')
                  }}</a>
                  <!-- 下载 -->
                  <a v-if="canBatchDownload && item.category != '2'" v-on:click="actionEvent('download', item)">
                    {{ $i18n('govdoc.download.label') }}
                  </a>
                  <!-- 收藏 -->
                  <a v-if="canFavorite && !item.collect" @click="actionEvent('favorite', item)">{{
                      $i18n('common.collection.label')
                    }}</a>
                  <!-- 取消收藏 -->
                  <a
                    v-if="canFavorite && item.collect"
                    @click="actionEvent('cancelFavorite', item)"
                  >{{ $i18n('common.cancel.collection.label') }}</a
                  >
                </div>
              </div>
            </div>
            <!-- 文档 -->
            <div class="doc-list">
              <div v-for="item in docList" :key="item.fileUrl" class="row">
                <div class="col sort" v-if="sortable"></div>
                <div class="col key">
                  <a-checkbox :disabled="item.type == '2' && !canSelectDoc" v-model="item.checked" @change="change(item)"></a-checkbox>
                </div>
                <div class="col type" v-if="showType" :title="showTypeFun(item.type)">{{ showTypeFun(item.type) }}</div>
                <div
                  :title="item.fileName"
                  class="col name"
                  v-on:click="actionEvent('preview', item)">
                  <span :class="getIconClass(item)"></span>
                  <span v-if="getSecretName(item)" style="color: red"
                    >[{{ item.secretLevelName }}]</span
                  >
                  {{ item.fileName.replace('/&nbsp;/g', '') }}
                </div>
                <div :title="item.creator" class="col creator">{{ item.creator }}</div>
                <div class="col size"></div>
                <div class="col sendTo" v-if="hasAttachmentAssignDetail"></div>
                <div class="col source" v-if="showSource" :title="showSourceFun(item.category)">{{ showSourceFun(item.category) }}</div>
                <div class="col operation">
                  <!-- 查看 -->
                  <a v-if="canPreview(item)" v-on:click="actionEvent('preview', item)">
                    {{ $i18n('govdoc.lookOver') }}
                  </a>
                  <!-- 删除 -->
                  <a v-if="canDelete" v-on:click="actionEvent('delete', item)">{{
                    $i18n('govdoc.opinion.del')
                  }}</a>
                </div>
              </div>
            </div>
          </div>
          <div class="empty" v-show="this.attachments.length <= 0">
            <a-empty />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- FIXME 待拆分。。-->
<script>
  import Sortable from 'sortablejs';
  import preview from '@/components/upload-att/preview';
  import { openRelateDocDialog } from '@/utils/relateDoc.js';
  import actions from '@/store/actions';
  import { transRelateObj, transAttachment, downloadFileByUrl } from '@/utils/operate-file';
  //gjx-start：联想文档中台附件预览（客开，实现见 src/custom/filez/）
  import { getFileZEditorUrl } from '@/custom/filez/filez-adapter';
  //gjx-end

  export default {
    name: 'UploadAtt',
    components: {
      preview
    },
    props: {
      attachments: {
        type: Array,
        default: []
      },
      canPreviewFileTypes: {
        type: Array,
        default: () => []
      },
      attachmentInfo: {
        type: Object,
        default: {}
      },
      secretLevel: {
        type: String
      },
      isSecretLevelEnable: {
        type: Boolean | String
      },
      summaryId: {
        type: String
      },
      canRelateAttachment: {
        type: Boolean,
        default: false
      },
      canUploadAttachment: {
        type: Boolean,
        default: false
      },
      canUploadRelDoc: {
        type: Boolean,
        default: false
      },
      canFavorite: {
        type: Boolean,
        default: false
      },
      hasAttachmentAssignDetail:{
        type: Boolean,
        default: false
      },
      canDelete: {
        type: Boolean,
        default: true
      },
      canBatchDownload: {
        type: Boolean,
        default: false
      },
      showSelectCount: {
        type: Boolean,
        default: false
      },
      canEdit: {
        type: Boolean,
        default: false
      },
      sortable: {
        type: Boolean,
        default: false
      },
      canSelectDoc: {
        type: Boolean,
        default: false
      },
      canSearch: {
        type: Boolean,
        default: true
      },
      showSource: {
        type: Boolean,
        default: true
      },
      showType: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        // 选中的附件id
        checkAll: false,
        indeterminate: false,
        searchValue: '',
        creator: window._currentUser.name
      };
    },
    watch: {
      secretLevel: {
        handler(newValue, oldValue) {
          this.actionEvent('changeSecretLevel', { newValue, oldValue });
        }
      }
    },
    computed: {
      totalNum() {
        return this.allList.length;
      },
      selectedAtts() {
        return this.allList.filter((item) => item.checked);
      },
      selectedNum() {
        return this.selectedAtts.length;
      },
      allList() {
        return this.attList.concat(this.docList);
      },
      attList() {
        let list = this.attachments.filter((item) => item.type == '0');
        if (this.searchValue) {
          list = list.filter((item) => item.fileName.indexOf(this.searchValue) > -1);
        }
        return list;
      },
      docList() {
        let list = this.attachments.filter((item) => item.type == '2');
        if (this.searchValue) {
          list = list.filter((item) => item.fileName.indexOf(this.searchValue) > -1);
        }
        return list;
      },
      attNum() {
        if (!this.allList) {
          return 0;
        }
        const attList = this.allList.filter((item) => item.type == '0');
        return attList.length;
      },
      docNum() {
        if (!this.allList) {
          return 0;
        }
        const docList = this.allList.filter((item) => item.type == '2');
        return docList.length;
      }
    },
    mounted() {
      this.sortable && this.initSort();
    },
    methods: {
      //gjx-start：联想文档中台附件预览
      async gjxView(param) {
        const fileZUrl = await getFileZEditorUrl({
          fileId: param.fileUrl,
          createDate: param.createDate,
          fileName: param.fileName,
          state: 'view',
        });
        if (fileZUrl) {
          window.open(fileZUrl, '_blank',
            'top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes');
        } else {
          $.alert('获取预览地址失败，文件可能已损坏或后台未返回地址。');
        }
      },
      //gjx-end
      actionEvent(type, param) {
        switch (type) {
          case 'upload': // 上传附件
            this.upload();
            break;
          case 'relateAtt': // 关联附件
            this.relateAtt();
            break;
          case 'relateDoc': // 关联文档
            this.relateDoc();
            break;
          case 'preview': // 预览
            // this.preview(param);
            if (this.canPreview(param)) {
              this.$emit('preview', param);
            }
            break;
          case 'back': // 返回
            this.back();
            break;
          case 'clickRow': // 选中或取消一行
            this.clickRow(param);
            break;
          case 'clickAll': // 选中或取消所有行
            this.clickAll();
            break;
          case 'changeSecretLevel': // 密级切换后
            this.changeSecretLevel(param);
            break;
          case 'sort': // 排序
            this.sort(param);
            break;
          case 'batchDelete': // 批量删除
            this.batchDelete(param);
            break;
          case 'delete': // 删除一行
            this.delete(param);
            break;
          case 'addAttachment': // 上传附件添加附件
            this.addAttachment(param);
            break;
          case 'batchAddDoc': // 批量添加关联文档
            this.batchAddDoc(param);
            break;
          case 'batchAddAtt': // 批量添加附件
            this.batchAddAtt(param);
            break;
          case 'favorite': // 收藏
            this.favorite(param);
            break;
          case 'cancelFavorite': // 取消收藏
            this.cancelFavorite(param);
            break;
          case 'batchDownload': // 批量下载
            this.batchDownload();
            break;
          case 'edit': // 修改附件
            this.$emit('edit');
            break;
          case 'download':
            this.download(param);
            break;
          case 'cancelSelect':
            this.cancelSelect();
            break;
          default:
            break;
        }
      },
      getSecretName(item) {
        return this.isSecretLevelEnable && item.secretLevel && item.secretLevelName;
      },
      showSize(size) {
        if (!size || size == '' || size == '0') {
          return '0KB';
        }
        if (typeof size === 'string') {
          size = parseInt(size);
        }
        if (size > 1048576) {
          // 1024 * 1024
          return `${(size / 1048576).toFixed(2)}M`;
        }
        return `${Math.round(size / 1024)}KB`;
      },
      showTypeFun(type) {
        if (type == '0'){
          return this.$i18n('common.attachmentClassification.label.form');
        }else if(type == '2'){
          return this.$i18n('common.toolbar.insert.mydocument.label');
        }
        return "";
      },
      showSourceFun(category){
        if (category == '2'){
          return this.$i18n('govdoc.att.source.form');
        }
        return this.$i18n('govdoc.att.source.list');
      },
      getIconClass(att) {
        if (!att.icon) {
          return '';
        }
        return `ico16 ${att.icon.substring(0, att.icon.indexOf('.'))}_16 margin_r_2`;
      },
      changeSecretLevel(param) {
        if (!!!this.isSecretLevelEnable) {
          // 没有开启密级，处理
          return;
        }
        let { newValue, oldValue } = param;
        newValue = parseInt(newValue) || 0;
        oldValue = parseInt(oldValue) || 0;
        const that = this;
        if (newValue < oldValue && this.attachments.length !== 0) {
          this.$info({
            title: this.$i18n('common.system.hint.label'),
            content: this.$i18n('common.attachment.fileSecretLevel.lowerTip'),
            okText: this.$i18n('common.button.ok.label'),
            icon: 'info-circle',
            onOk() {
              that.actionEvent('batchDelete', true);
            }
          });
        }
      },
      change(item) {
        this.updateCheckAllStatus();
      },
      cancelSelect() {
        this.clickAll(false);
      },
      clickAll(flag) {
        if (typeof flag === 'boolean') {
          this.checkAll = flag;
          this.indeterminate = flag;
        } else {
          this.checkAll = !this.checkAll;
          this.indeterminate = false;
        }
        const attachments = JSON.parse(JSON.stringify(this.attachments));
        if (!attachments) {
          return;
        }
        attachments.forEach((item) => {
          if (this.checkAll && (item.type != "2" || this.canSelectDoc)) {
            item.checked = true;
          } else {
            item.checked = false;
          }
        });
        actions.updateAllAttachment && actions.updateAllAttachment(attachments);
        !this.canSelectDoc && this.$emit('updateData', attachments)
        // this.updateCheckAllStatus();
      },
      sort(params) {
        const { oldIndex, newIndex } = params;
        const newAttachments = JSON.parse(JSON.stringify(this.attachments));
        const moveItem = JSON.parse(JSON.stringify(newAttachments[oldIndex]));
        newAttachments.splice(oldIndex, 1);
        newAttachments.splice(newIndex, 0, moveItem);
        actions.updateAllAttachment(newAttachments);
        this.$emit("updateAttachmentInfo");
      },
      initSort: function () {
        const that = this;
        new Sortable(this.$refs.dragArea, {
          animation: 150,
          ghostClass: 'blue-background-class',
          onEnd: function (evt) {
            that.actionEvent('sort', evt);
          }
        });
      },
      // 是否显示预览
      canPreview(att) {
        const canPreviewFileTypes = this.canPreviewFileTypes;
        // 关联文档
        if (att.type === '2') {
          return true;
        }
        if (!att.canPreview) {
          // 权限密级校验
          return false;
        }
        if (canPreviewFileTypes.indexOf(att.extension) === -1) {
          return false;
        }
        return true;
      },
      updateCheckAllStatus() {
        const checkedLength = this.selectedNum;
        if (!this.allList || !this.allList.length) {
          this.checkAll = false;
          this.indeterminate = false;
          return;
        }
        if (checkedLength === this.allList.length) {
          this.checkAll = true;
          this.indeterminate = false;
        } else {
          if (checkedLength !== 0) {
            this.indeterminate = true;
          } else {
            this.indeterminate = false;
          }
          this.checkAll = false;
        }
      },
      addAttachment(params) {
        const attachment = transAttachment(params);
        actions.addAttachment(attachment);
        this.updateCheckAllStatus();
        this.$emit('updateAttachmentInfo');
      },
      getCheckedLength() {
        return this.attList.filter((item) => item.checked).length;
      },
      batchDelete(clearAll) {
        const batchDeleteFun = () => {
          const attachments = JSON.parse(JSON.stringify(this.attachments));
          // 是否删除了附件
          let isDelAtt = false;
          for (const att of this.attachments) {
            if (clearAll === true || att.checked) {
              if (att.type == '0') {
                isDelAtt = true;
              }
              const index = attachments.findIndex((item) => item.fileUrl === att.fileUrl);
              attachments.splice(index, 1);
            }
          }
          actions.updateAllAttachment(attachments);
          this.updateCheckAllStatus();
          if (isDelAtt) {
            this.$emit('updateAttachmentInfo');
          }
        };
        if (clearAll) {
          batchDeleteFun();
        } else {
          this.$confirm({
            title: this.$i18n('common.system.hint.label'),
            content: '确认删除这些附件或文档',
            okText: this.$i18n('common.button.ok.label'),
            cancelText: this.$i18n('common.button.cancel.label'),
            onOk: batchDeleteFun,
            onCancel: () => {}
          });
        }
      },
      delete(att) {
        this.$confirm({
          title: this.$i18n('common.system.hint.label'),
          content: this.$i18n('V3XLang.attachment_delete_alert', att.fileName),
          okText: this.$i18n('common.button.ok.label'),
          cancelText: this.$i18n('common.button.cancel.label'),
          onOk: () => {
            const attachments = this.attachments;
            const index = attachments.findIndex((item) => item.fileUrl === att.fileUrl);
            const attachment = attachments[index];
            actions.deleteAttachment(attachment);
            this.updateCheckAllStatus();
            if (attachment.type == '0') {
              // 删除附件
              this.$emit('updateAttachmentInfo');
            }
          },
          onCancel: () => {}
        });
      },
      upload() {
        const secretLevelEnable = this.isSecretLevelEnable;
        const secretLevel = this.secretLevel;
        if (secretLevelEnable && (!secretLevel || secretLevel == '0')) {
          // 开启密级，没有设置需要提示
          this.$error({
            title: this.$i18n('common.system.hint.label'),
            content: this.$i18n('form.setSecretLevel.uploadAttachment'),
            okText: this.$i18n('common.button.ok.label'),
            icon: 'info-circle',
            onOk() {}
          });
          return;
        }
        const that = this;
        let uploadParams = {
          minAttachment: 0,
          applicationCategory: '4', // 公文
          isEncrypt: 'true',
          isSetSecretLevel: `${secretLevelEnable}`, // 密级开关
          secretLevel: secretLevel, // 密级值
          takeOver: true, // 不需要回填
          addAttachmentPoi: (...params) => {
            // 添加附件后回调
            transRelateObj(params);
            that.actionEvent('addAttachment', params);
          }
        };
        new CtpUiUploadFullScreenDrag('clickNow', uploadParams);
      },
      relateAtt() {
        const that = this;
        const poi = 'Doc1';
        let attachments = JSON.parse(JSON.stringify(this.attachments));
        attachments = attachments
          .filter((item) => item.type === '2')
          .map((item) => {
            let att = new Attachment();
            Object.assign(att, item);
            att.filename = item.fileName;
            att.showArea = poi;
            return att;
          });
        openRelateDocDialog({
          poi,
          relateAttachment: true,
          exAssModules: '3,6',
          secretLevel: this.secretLevel,
          summaryId: this.summaryId,
          isSecretLevelEnable: this.isSecretLevelEnable,
          fileUploadAttachments: attachments,
          callback: function (attList) {
            that.actionEvent('batchAddAtt', attList);
          }
        });
      },
      relateDoc() {
        const that = this;
        const poi = 'Doc1';
        let attachments = JSON.parse(JSON.stringify(this.attachments));
        attachments = attachments
          .filter((item) => item.type === '2')
          .map((item) => {
            let att = new Attachment();
            Object.assign(att, item);
            att.filename = item.fileName;
            att.showArea = poi;
            att.fileUrl2 = item.fileUrl2
            return att;
          });
        openRelateDocDialog({
          poi,
          secretLevel: this.secretLevel,
          summaryId: this.summaryId,
          isSecretLevelEnable: this.isSecretLevelEnable,
          fileUploadAttachments: attachments,
          callback: function (docList) {
            that.actionEvent('batchAddDoc', docList);
          }
        });
      },
      batchAddAtt(attList) {
        for (let att of attList) {
          const attachment = transRelateObj(att);
          actions.addAttachment(attachment);
        }
        this.updateCheckAllStatus();
        this.$emit('updateAttachmentInfo');
      },
      batchAddDoc(docList) {
        const docs = this.allList.filter(item => item.type == 2)
        docs.forEach(item => {
          actions.deleteAttachment(item);
        })
        for (let doc of docList) {
          this.addDoc(doc);
        }
      },
      addDoc(doc) {
        const attachment = transRelateObj(doc);
        const fileUrl = attachment.fileUrl;
        const index = this.attachments.findIndex((item) => item.fileUrl == fileUrl);
        if (index !== -1) {
          // 如果已经有不重复添加
          return;
        }
        actions.addAttachment(attachment);
        this.updateCheckAllStatus();
      },
      onSearch(v) {
        this.searchValue = v;
        window.batchDownload = this.batchDownload;
      },
      batchDownload() {
        const ids = this.selectedAtts.map((item) => item.fileUrl).join(',');
        const url =
          _ctxPath +
          '/rest/attachment/file/batchDownload/' +
          ids +
          '?zipFileName=' +
          new Date().format('yyyyMMddHHmm').toString();

        downloadFileByUrl(url);
        actions.batchDownloadProcessLog(ids);
      },
      favorite(item) {
        favorite(1, item.fileUrl, false, 4, null, null, null, () => {
          item.collect = true;
        }, item.v);
      },
      cancelFavorite(item) {
        cancelFavorite(1, item.fileUrl, false, 4);
        item.collect = false;
      },
      download(att) {
        var url =
          _ctxPath +
          '/fileDownload.do?method=download&v=' +
          att.v +
          '&fileId=' +
          att.fileUrl +
          '&createDate=' +
          att.createDate +
          '&filename=' +
          encodeURIat(att.fileName);
        if ($.trim(att.fileType) !== '') {
          url += '.' + fileType;
        }
        downloadFileByUrl(url);
      }
    }
  };
</script>

<style lang="scss" scoped>
  .attachment {
    color: #000000;
    height: 100%;
    .button-area {
      display: flex;
      .common-btn {
        flex: 1;
      }
    }
    .list {
      overflow: hidden;
      position: relative;
      height: 100%;
      .header {
        .button-area {
          display: flex;
          line-height: 32px;
          margin-bottom: 12px;
          gap: 10px;
        }
        .common-btn {
          display: flex;
          gap: 10px;
        }
      }

      .content {
        position: absolute;
        top: 44px;
        left: 0;
        bottom: 0;
        right: 0;

        .list {
          height: 100%;

          .header {
            background: #fafafa;

            .row {
              cursor: default;

              &:hover {
                background: #fafafa;
              }
            }
          }

          .body {
            height: calc(100% - 40px);
            overflow: auto;
          }

          .empty{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #d9d9d9;
            text-align: center;
          }

          .row {
            display: flex;
            border-bottom: 1px solid #e8e8e8;

            &.blue-background-class {
              background-color: #c8ebfb;
            }

            &:hover {
              background: #e6f6ff;
              background: var(--theme-brand1, #e6f6ff);
              cursor: pointer;
            }

            .col {
              box-sizing: border-box;
              height: 40px;
              padding: 10px 8px 10px 16px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;

              &.sort {
                width: 30px;
              }
              &.key {
                flex: 0 0 40px;
              }
              &.type, &.source {
                width: 80px;
              }
              &.name {
                flex: 1 1 140px;
              }

              &.creator {
                width: 100px;
              }

              &.size {
                width: 10%;
              }

              &.sendTo{
                width: 12%;
              }

              &.operation {
                flex: 0 0 155px;

                a {
                  margin-right: 12px;
                  color: #1890ff;
                  color: var(--theme-brand6, #1890ff);
                }
              }
            }
          }
        }
      }
    }

    .preview {
      position: relative;
      width: 100%;
      height: 100%;

      .header {
        box-sizing: border-box;
        display: flex;
      }

      .content {
        position: absolute;
        top: 40px;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
  }
  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
    border-radius: 5px;
  }
</style>
