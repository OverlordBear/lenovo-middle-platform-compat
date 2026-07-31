<style src="./cap4-attachment.scss" lang="scss"></style>
<template>
  <section class="cap4-attach" :class="showType + ' ' + must + ' ' + contorlChecked">
    <!-- <div class="cap4-attach__left field-title" v-text="data.display"></div> -->
    <div class="cap4-attach__left field-title" :style="{width: curLabelWidth}">
      <cap4-ctrl-label :labelWidth="curLabelWidth" :data="data"></cap4-ctrl-label>
    </div>
    <div class="cap4-attach__right field-content-wrapper"
         :class="data.relationData && data.relationData.imgShow === '1' ? 'is-relation' : ''"
         :style="{'marginLeft':showContentMargin}">
      <!-- 附件浏览态 -->
      <div class="cap4-attach__browse" v-if="data.auth === 'browse' || data.auth === 'hide'" @click="relation('value')"
           :style="[getStyle, getAttachStyle]">
        <div class="cap4-attach__items" v-if="data.auth === 'hide'">***</div>
        <div class="cap4-attach__items" v-else-if="data.value.length">
          <!--客开新增  全部下载按钮 功能-->
          <a class="cap4-attach-downall"
             v-show="downloadAllBtnShow"
             :download="data.display + '.zip'"
             :href="`${basePath()}/rest/attachment/file/batchDownload/${filedIds()}?zipFileName=${encodeURIComponent(data.display)}`">
            <span class="cap4-attach-downall-text"> {{ _$i18n("cap.template.common.file.DownloadAll") }}</span>
          </a>
          <div class="cap4-attach__att" v-for="(item,index) in data.value" :key="index"
               v-show="item.hasOwnProperty('canBrowse') || item.canBrowse === '1'">
            <!-- 附件能否查看 -->
            <div class="cap4-attach__action cap4-attach-action-mantle">
              <div @click="attachEvent('download',index)" v-show="isShowDownload" class="cap4-attach__download">
                <span class="icon CAP cap-icon-download" style="background-position:-48px -240px;"></span>
              </div>
              <!--原有的浏览方式 <div v-if="canView(item,index)" @click="attachEvent('preview',index,FileType(item.name).name)"> -->
              <div class="cap4-attach__search" v-if="canView(item,index)" @click.stop="preview(item,index)">
                <span class="icon CAP cap-icon-search" style="background-position:-72px -240px;"></span>
              </div>
            </div>
            <div class="cap4-attach__aleft">
              <i class="icon iconfont" :class="FileType(item.name).name" :style="{color:FileType(item.name).color}"></i>
            </div>
            <div class="cap4-attach__aright" :style="[getStyle,{'border-width':0}]">
                            <span style="color:#FF4141;" v-if="isShowSecretLevel(index)">
                                {{ secretLevelFormat(index) }}
                            </span>
              <span style="word-break: break-all;">{{ item.name + ' (' + formatSize(item.size) + ')' }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 附件编辑态 -->
      <div class="cap4-attach__cnt field-content" v-else :style="[getStyle, getAttachStyle]">
        <div class="cap4-attach__items">
          <div class="cap4-attach__holder" v-if="!data.value.length" v-text="data.placeHolder"></div>
          <draggable v-model="data.value" handle=".mover" group="itxst" @start="start" @end='end' animation="300" v-else
                     :disabled="!customSortBtnShow">
            <!-- <transition-group name="itxst" tag="div"> -->

            <div class="cap4-attach__att1" v-for="(item,index) in data.value" :key="index"
                 v-show="item.hasOwnProperty('canBrowse') || item.canBrowse === '1'"
                 :class="!customSortBtnShow?'not-custome-btn':'custom-btn'" @mouseenter="mouseenter"
                 @mouseleave="mouseleave"
                 :id="getFieldId(item)">
                            <span class="mover" v-show="customSortBtnShow && data.value.length > 1">
                                <i class="icon CAP cap-icon-tuozhuai"></i>
                            </span>

              <div class="cap4-attach__att">
                <!--客开新增 下载按钮 预览按钮--->
                <div class="cap4-attach__action" style="margin: 0px 0px; flex-wrap: wrap;">
                  <div class="cap4-attach__download" @click.stop="attachEvent('download',index)">
                    <i class="icon CAP cap-icon-download"></i>
                  </div>
                  <!-- 预览图标 -->
                  <!-- <div v-if="canView(item,index)"  @click.stop="attachEvent('preview',index,FileType(item.name).name)">  -->
                  <div class="cap4-attach__search" v-if="canView(item,index)" @click.stop="preview(item,index)">
                    <i class="icon CAP cap-icon-search"></i>
                  </div>
                  <!-- 编辑图标 -->
                  <div class="cap4-attach__modify" v-if="canEdit(item)" @click.stop="attachEvent('edit', index)">
                    <i class="icon CAP cap-icon-xiugai"></i>
                  </div>
                  <!-- 关闭图标 -->
                  <div class="cap4-attach__delete" @click.stop="attachEvent('close',index)">
                    <i class="icon CAP cap-icon-shanchu"></i>
                  </div>
                </div>
                <!--客开新增 下载按钮--->
                <div class="cap4-attach__aleft">
                  <i class="icon iconfont" :class="FileType(item.name).name"
                     :style="{color:FileType(item.name).color}"></i>
                </div>
                <div class="cap4-attach__aright" :style="[getStyle,{'border-width':0}]">
                                    <span style="color:#FF4141;" v-if="isShowSecretLevel(index)">
                                        {{ secretLevelFormat(index) }}
                                    </span>
                  <span style="word-break: break-all;">{{ item.name + ' (' + formatSize(item.size) + ')' }}</span>
                </div>
              </div>
            </div>
            <!-- </transition-group> -->
          </draggable>
        </div>
        <div class="cap4-attach__picker " @mousedown="hideOfficeObj" @click="attachEvent('upload', -1)">
          <div class="icon CAP cap-icon-fujian" style="height: 100%;"></div>
        </div>
      </div>

      <div v-if="isShowDownloadBtn"
           class="cap4-attachment__download"
           ref="downloadIconBtn"
           v-toolTip="{content:_$i18n('cap.form.download.attachment.file'),placement:'bottom'}"
           @click="iframeDowload"
      >

        <span class="icon CAP cap-icon-xiazai download-font"></span>
      </div>
      <div class="cap4-text__relation" v-if="data.relationData && data.relationData.imgShow === '1'"
           @click="relation('icon', $event)">
        <div class="icon CAP cap-icon-zhubiaoxuanzeqi" v-if="data.formType === 'formmain'"></div>
        <div class="icon CAP cap-icon-mingxibiaoxuanzeqi" v-else></div>
      </div>

    </div>
  </section>
</template>
<script>
import FileTypeIcon from './file-type-icon';
import FormatSize from '../../cap-common/format-size';
import FileType from '../../cap-common/getFileType';
import {controlApi} from '../../cap-common/controlApi';
import Base from "../../cap-common/base.js";
import ThemeMixin from '@/mixins/theme';
import {setRenderListener, deleteRenderListener} from '@/lib/lifeCycle.js';

import draggable from 'vuedraggable';

setTimeout(() => {
  setRenderListener("attach-draggable", true);
})
import Config from "@/assets/js/config";

export default {
  mixins: [Base, ThemeMixin],
  name: 'Cap4Attachment',
  props: ['data'],
  components: {draggable},
  data() {
    return {
      FileType,
      canViewType: ['pdf', 'doc', 'ppt', 'xls', 'rtf', 'eio'],
      realtionLimit: false,
      isShowDownloadBtn: false,
      getBaseAttachmentInfo: {}
    }
  },
  created() {
    this.getBaseAttachmentInfo = this.data && this.data.attachmentInfo && this.data.attachmentInfo.baseAttachmentInfo;
    if (this.getBaseAttachmentInfo && this.getBaseAttachmentInfo.templateUrl && !this.isPrint) {
      this.isShowDownloadBtn = true;
    }
    //组织火狐浏览器拖拽打开新页面
    document.body.ondrop = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    if (this.data.auth === 'edit' && this.data.value.length) {
      setRenderListener("attach-draggable", false, {once: true})
    }
  },
  mounted() {
    const _self = this;
    if (window.csdk.core.compGloablEvent.cap4Attachment) {
      window.csdk.core.compGloablEvent.cap4Attachment[_self.data.id] = {
        deleteAll: () => {
          _self.attachEvent("deleteAll")
        }
      }
    } else {
      window.csdk.core.compGloablEvent.cap4Attachment = {};
      window.csdk.core.compGloablEvent.cap4Attachment[_self.data.id] = {
        deleteAll: () => {
          _self.attachEvent("deleteAll")
        }
      }
    }
  },

  computed: {
    encodeDownloadUrl() {
      let url = this.getBaseAttachmentInfo.templateUrl;
      let regex = /[?&]filename=([^&]+)/;
      let match = url.match(regex);
      let value = match && match[1];
      if (value) {
        url = url.replace(value, encodeURIComponent(value));
      }
      return url;
    },
    //客开新增 判断是否显示下载按钮
    isShowDownload() {
      if (this.data && this.data.auth == "browse"
          && this.data.isFileDownload && this.data.isFileDownload == '0') {
        return false;
      }
      return true;
    },
    // 控件样式
    getStyle() {
      return controlApi.getControlStyle(this.data);
    },
    getLabelStyle() {
      return controlApi.getControlLabelStyle(this.data, this);
    },
    showContentMargin() {
      if (this.isFormsonRowEdit) {
        return 0;
      }
      let marginVal = Number(this.curLabelWidth.replace(/(\d+%)|(px)/, '')); // 初始width 70px,margin 77px
      return this.data.ctrlTitleStyle === 'inline' ? marginVal + 7 + 'px' : 0
    },
    //显示类型
    showType() {
      if (this.isFormsonRowEdit) {
        return "is-two"
      }
      return controlApi.ifShowType(this.data);
    },
    // 是否必填
    must() {
      return controlApi.ifHaveMust(this.data);
    },
    // 是否符合校验规则
    contorlChecked() {
      return controlApi.ifContorlChecked(this.data);
    },
    // 返回value数组长度
    valueArrLength() {
      return this.data && this.data.value && this.data.value.length ? this.data.value.length : 0;
    },
    customSortBtnShow() {
      let {attachmentInfo} = this.data;
      let attachAdvanceSet = attachmentInfo.baseAttachmentInfo && attachmentInfo.baseAttachmentInfo.attachAdvanceSet
          && JSON.parse(attachmentInfo.baseAttachmentInfo.attachAdvanceSet);
      return attachAdvanceSet && attachAdvanceSet.attachSortSettings == '3' ? true : false;
    },
    downloadAllBtnShow() {
      let {attachmentInfo} = this.data;
      let attachAdvanceSet = attachmentInfo.baseAttachmentInfo && attachmentInfo.baseAttachmentInfo.attachAdvanceSet
          && JSON.parse(attachmentInfo.baseAttachmentInfo.attachAdvanceSet);
      return this.data.isFileDownload == '1' && this.data.auth == "browse" && attachmentInfo && attachmentInfo.attachmentInfos.length > 1 &&
      attachAdvanceSet && attachAdvanceSet.attachDownloadAll == '1' && !this.isPrint ? true : false;
    },
    showAttList() {
      if (this.data && this.data.value) {
        return this.data.value.filter(item => {
          return !item.canBrowse || item.canBrowse == "1";
        })
      }
      return 0;
    },
    // 新增需求，附件控件如果配置模板需要有下载按钮
    getAttachStyle() {
      // return {width: "calc(100%)",border:"1px dotted #D4D4D4"}
      if (this.isShowDownloadBtn) {
        return {width: "calc(100% - 38px)"}
      } else {
        return {width: "100%"}
      }
    }

  },
  methods: {
    canEdit(item) {
      const {officeType, status} = FileType(item.name)
      const officeEditConfig = windowFormData.viewData.officeConfigInfo;
      //客开s wzl,gjx 去掉office校验
      // return status && officeEditConfig[officeType]?.EDIT.includes('EDIT')
      return status;
      //客开e

    },
    // 解决在ie下a标签下载触发onbeforunload问题
    iframeDowload() {
      let exportIframe = document.createElement('iframe');
      exportIframe.src = `${this.basePath()}/${this.encodeDownloadUrl}`;
      exportIframe.style.display = "none";
      document.body.appendChild(exportIframe);
    },
    getThemeCss(themeColor) {
      return [
        `
                .cap4-attach .cap4-attach__cnt:hover {
                  border-color: ${themeColor} !important;
                }
                `,
        "cap4-attachment"
      ];
    },
    _$i18n(...args) {
      let targetWindow = window.currentWindow || window.top;
      return targetWindow.$.i18n(...args);
    },
    isNeedDownload() {
      if (this.data && this.data.auth == "browse"
          && this.data.isFileDownload && this.data.isFileDownload == '0') {
        return false;
      }
      return true;
    },
    preview(currentItem, index) {//新增批量预览功能
      //客开s wzl,gjx 替换浏览 跳转
      var paramData = {
        "fileId": currentItem.fileUrl,
        "createDate": "111",
        "fileName": currentItem.name,
        "state": "view"
      }
      var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);
      if (fileZRavl != null) {
        var showUrl = fileZRavl.url;
        if (showUrl != null && showUrl != "") {
          window.open(
              showUrl,
              "_blank",
              "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes");
        } else {
          $.alert("后台异常");
        }
      }
      // var innerWidth = window.parent.location.href.indexOf('isUnFlowDrawer=true') != -1 ? window.parent.parent.innerWidth * 0.9: window.parent.innerWidth*0.9;
      // var innerHeight = window && window.getCtpTop() && window.getCtpTop().isMultipleTabs? window.parent.innerHeight*1 : window.parent.innerHeight*0.9;
      // var data = JSON.stringify(this.data.attachmentInfo.attachmentInfos);
      // // 是否存在下载按钮
      // var needDownload = this.isNeedDownload();
      // var subjectDom = parent.document.getElementById("subject");
      // var subject = "";
      // if (subjectDom && subjectDom.value) {
      //   if (subjectDom.value.length > 30) {
      //     subject = subjectDom.value.substring(0, 30) + "...";
      //   }else {
      //     subject = subjectDom.value;
      //   }
      // }
      // var url = _ctxPath + "/common/cap4/template/display/pc/formAttach/dist/index.html?currentItem="+currentItem.fileUrl+'&index='+index+'&fileType='+this.FileType(currentItem.name).name+'&needDownload=' + needDownload + "&subject=" + encodeURIComponent(subject);
      // Config.currentWindow.$.dialog({
      //     id: "attachmentsView",
      //     url: `${url}`,
      //     width: innerWidth,
      //     height: innerHeight,
      //     title: currentWindow.$.i18n("cap4.bind.label.attachment"),
      //     transParams: {
      //         attachmentInfos:data,
      //         parentWin: {
      //             callBk: fileurls => {
      //                 if (typeof callback === 'function') callback(fileurls.instance);
      //             }
      //         }
      //     },
      // });
      //客开e
    },
    // 获取主表控件Id
    getFieldId(item) {
      if (item) {
        return `${item.fileUrl}_attach`;
      }
      return null;
    },
    mouseenter(e) {
      if (this.customSortBtnShow && this.showAttList.length > 1) {
        e.target.style.paddingLeft = "26px"
      }

    },
    mouseleave(e) {
      if (this.customSortBtnShow) {
        e.target.style.paddingLeft = "0px"
      }
    },
    //开始拖拽事件
    start(e) {
    },
    end(e) {
      let attachmentInfos = this.data.attachmentInfo.attachmentInfos;
      let valueObj = {};
      this.data.value.forEach((item, index) => {
        valueObj[item.fileUrl] = index;
      });
      attachmentInfos.forEach(item => {
        item.sort = '' + valueObj[item.fileUrl];
      });
      // 处理附件顺序
      let attLength = attachmentInfos.length;
      let attArr = new Array(attLength).fill({});
      attachmentInfos.forEach(item => {
        attArr[Number(item.sort)] = item;
      });
      this.data.attachmentInfo.attachmentInfos = attArr;
      this.$emit('formControlEvent', 'attachments', this.data, {type: 'sort'});
    },
    basePath() {
      return Config._ctxPath();
    },
    filedIds() {
      let attachsArr = [];
      let attachments = this.data.attachmentInfo.attachmentInfos;
      if (attachments && attachments.length > 1) {

        attachments.forEach(item => {
          attachsArr.push(item.fileUrl);
        })
      }
      return attachsArr && attachsArr.join(',');
    },
    hideOfficeObj() {
      if (typeof window.hideOfficeObj === 'function') window.hideOfficeObj();
    },
    canView(item, index) {
      //客开s wzl,gjx 集成fileZ默认允许查看
      return true;
      //客开e
      let attacType = this.FileType(item.name).name;
      //图片和pdf不做判断..
      if (attacType === "img" || attacType === 'pdf') {
        return true;
      }

      if (this.data.attachmentInfo && this.data.attachmentInfo.attachmentInfos && this.data.attachmentInfo
              .attachmentInfos.length > 0 && this.data.attachmentInfo.attachmentInfos[index].officeTransformEnable ===
          "enable" && (this.canViewType
                  .indexOf(this.FileType(item.name).name) >= 0 &&
              (top && top.$ && Object.prototype.toString.call(top.$.ctx) === '[object Object]' && Object.prototype.toString.call(top.$.ctx.hasPlugin) === '[object Function]'
                  && (top.$.ctx.hasPlugin(
                      "baseOfficeTrans") || top.$.ctx.hasPlugin(
                      "yongzhongOfficeTrans"))
                  || (top.vPortal && ((top.vPortal.resources && this.checkIfSupportOfficeTrans(top.vPortal.resources)) || (top.vPortal.plugins && this.checkIfSupportOfficeTrans(top.vPortal.plugins)))))) || (this.data.attachmentInfo.attachmentInfos[index].isAllowTrans && this.data.attachmentInfo.attachmentInfos[index].isAllowTrans == '1')) {
        return true;
      }

      return false;
    },

    checkIfSupportOfficeTrans(plugins) {
      return plugins.includes("baseOfficeTrans") || plugins.includes("yongzhongOfficeTrans");
    },
    attachEvent(type, index, attType) {
      switch (type) {
        case 'close':
          this.$emit('formControlEvent', 'attachments', this.data, {type, index});
          break;
        case 'download':
          this.$emit('formControlEvent', 'attachments', this.data, {type, index});
          break;
        case 'upload':
          this.$emit('formControlEvent', 'attachments', this.data, {type, 'index': -1});
          break;
        case 'preview':
          //客开s wzl,gjx 替换浏览  跳转
          var currFile = this.data.attachmentInfo.attachmentInfos[index];
          var paramData = {
            "fileId": currFile.fileUrl,
            "createDate": currFile.createdate,
            "fileName": currFile.filename,
            "state": "view"
          }
          var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);
          if (fileZRavl != null) {
            var showUrl = fileZRavl.url;
            if (showUrl != null && showUrl != "") {
              window.open(
                  showUrl,
                  "_blank",
                  "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes");
            } else {
              $.alert("后台异常");
            }
          }
          //this.$emit('formControlEvent', 'attachments', this.data, { type, index, attType });
          break;
        case 'edit':
          //客开s wzl,gjx 替换编辑  跳转
          var currFile = this.data.attachmentInfo.attachmentInfos[index];
          var paramData = {
            "fileId": currFile.fileUrl,
            "createDate": currFile.createdate,
            "fileName": currFile.filename,
            "state": "edit"
          }
          var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);
          if (fileZRavl != null) {
            var showUrl = fileZRavl.url;
            if (showUrl != null && showUrl != "") {
              var fileZUrl = "/seeyon/euFileZ.do?method=fileZsdkEdit&fileZurl=" + encodeURIComponent(showUrl);
              window.open(
                  fileZUrl,
                  "_blank",
                  "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes");
            } else {
              $.alert("后台异常");
            }
          }
          //this.$emit('formControlEvent', 'attachments', this.data, {type, index, attType});
          //客开e
          break;
        case 'deleteAll':
          this.$emit('formControlEvent', 'attachments', this.data, {type});
          break;
        default:
          break;
      }
    },
    // 转换size
    formatSize(size) {
      return FormatSize(size);
    },
    relation(type, event) {
      let _self = this;
      if (_self.realtionLimit) return;
      _self.realtionLimit = true;
      setTimeout(() => {
        _self.realtionLimit = false;
      }, 800);
      this.$emit('formControlEvent', 'relation', this.data, {type}, event);
    },
    secretLevelFormat(index) {
      const {attachmentInfo} = this.data;
      const secretLevelName = attachmentInfo?.attachmentInfos[index].secretLevelName;
      return secretLevelName ? '[' + secretLevelName + ']' : "";
    },
    isShowSecretLevel(index) {
      return this.data?.attachmentInfo?.attachmentInfos[index].secretLevelName
    },

    // 因为overflow的原因，采取动态fixed的布局
    setPosition(el) {
      // 优化，如果此时有tips显示，不执行后面的文件
      if (this.isShowHover || this.isShowUp) {
        return;
      }

      // body的总高度
      const bodyHeight = document.body.clientHeight;
      const currentDomPosition = this.$refs.downloadIconBtn.getBoundingClientRect();
      const domWidth = currentDomPosition.width;
      const domTop = currentDomPosition.top;
      const domLeft = currentDomPosition.left;

      // 加上元素自身的高度加上10px的间隙加上本身要展示的高度
      var showNeedHeight = domTop + 32 + 10 + 30;
      // 这时候显示在上面,可视窗口不足以显示tips提示
      if (showNeedHeight > bodyHeight) {

        this.isShowUp = true;
        let downloadIconUp = this.$refs.downloadIconUp;
        downloadIconUp.style.top = domTop - 38 + 'px';
        downloadIconUp.style.left = domLeft - 46 + domWidth + "px";

      } else {

        this.isShowHover = true;
        let downloadIcon = this.$refs.downloadIcon;
        downloadIcon.style.top = domTop + 42 + 'px';
        downloadIcon.style.left = domLeft - 46 + domWidth + "px";

      }


    },
    // 取消显示
    cancelShow() {
      this.isShowHover = false;
      this.isShowUp = false;
    },
    preventSkip() {

    }
  },
  watch: {
    'valueArrLength': {
      handler(curVal, oldVal) {
        if (curVal !== oldVal) {
          if (this.data.auth !== 'hide') {
            this.data.showValue = this.data.attachmentInfo && this.data.attachmentInfo.baseAttachmentInfo &&
            Object.prototype.toString.call(this.data.attachmentInfo.baseAttachmentInfo) ===
            '[object Object]' ? this.data.attachmentInfo.baseAttachmentInfo.subReference : '';
          }
          //发出事件
          this.$emit('formControlEvent', 'formFieldBlur', this.data);
        }
      },
      deep: true
    }
  },

}
</script>
