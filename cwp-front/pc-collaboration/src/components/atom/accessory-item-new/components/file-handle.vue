<template>
  <ul class="file-handle-container">
      <li v-if="file.canFavorite">
          <a-tooltip :title="file.hasFavorite ? $i18n('common.cancel.collection.label') : $i18n('common.collection.label')">
              <a @click="toggleFavorite">
                  <i :class="['syIcon', file.hasFavorite ? `sy-collect-fill ${favoriteClass}` : 'sy-collect']"></i>
              </a>
          </a-tooltip>
      </li>
      <li>
          <a-tooltip :title="$i18n('common.download.label')">
              <DownloadAtt :file="file">
                  <icon-font type="cap-icon-xiazai" />
              </DownloadAtt>
          </a-tooltip>
      </li>
      <!-- 修改附件添加进来的 hasSaved为false 只展示下载 -->
      <li v-if="(canLook || isImg || isPdfButNoTrans) && file.hasSaved !== false">
          <a-tooltip :title="$i18n('common.operate.view')">
              <!--gjx-start：附件查看统一走 FileZ 文档中台（含图片/PDF）-->
              <a
                @click="onPreviewOffice"
                class="view-icon"
              >
                  <icon-font type="cap-icon-chakan" />
              </a>
              <!--gjx-end-->
          </a-tooltip>
      </li>
  </ul>
</template>

<script>
  /* global CsrfGuard, leaveAttachmentImageShow */
  import { useBaseInfoStore } from '@/store/modules/base-info';
  import { mapState } from 'pinia';
  import favorite from 'helper/favorite';
  import globalData from 'plugins/data';
  import globalMethods from 'plugins/methods';
  import emitter from "utils/emitter";
  import DownloadAtt from './download-att';
  // gjx-start：FileZ 附件预览白名单判断
  import { isFileZPreviewFile } from '@/custom/filez/config';
  // gjx-end

  export default {
      name: 'FileHandle',
      components: {
          DownloadAtt,
      },
      props: {
          file: {
              type: Object,
          },
          favoriteClass: {
              type: String,
              default: '',
          },
      },
      data: () => ({
          // 是否是图片
          isImg: false,
          // 是否是pdf
          isPdf: false,
          // 创建时间适配
          createDate: '',
          // 开启转换
          allowTrans: false,
          // 可转换类型
          isAllowTrans: false,
          // 是pdf类型但是没有开启转换
          isPdfButNoTrans: false,
          // 是否可查看预览，由后端已经判断是否可预览、是否开启office转换
          canLook: false,
      }),
      computed: {
          ...mapState(useBaseInfoStore, ['$previewImg']),
      },
      created() {
          // 初始化一些字段
          // 是否检查类型。屏蔽0和3
          const isCheckType = this.file.type == 0 || this.file.type == 3;
          const filename = this.file.filename.toLowerCase();
          //  是否是图片
          this.isImg = isCheckType && /\.(jpg|jpeg|png|gif|bmp)$/.test(filename);
          // 把图片类型的附件单独存储
          this.isImg && this.$emit('addImgFile');
          // 是否是pdf
          this.isPdf = isCheckType && /\.pdf$/.test(filename);
          // 创建时间
          this.createDate =
              this.file.createDate?.substring(0, 10) ||
              globalMethods.getDateString(this.file.createdate, 'YYYY-MM-DD');
          // gjx-start：后端未开启致远转换时，FileZ 白名单类型仍显示查看按钮
          this.canLook = this.file.canLook || isFileZPreviewFile(this.file);
          // gjx-end
          // 是pdf类型但是没有开启转换
          this.isPdfButNoTrans = this.isPdf && !this.canLook;
      },
      mounted() {
          // 附件多区域同数据展示状态问题
          emitter.subscribe("fileFavoriteChange", ({hasFavorite, fileUrl}) => {
              const file = this.file;

              if (file.fileUrl === fileUrl) {
                  file.hasFavorite = hasFavorite;
                  console.log("fileFavoriteChange", file.hasFavorite);
              }
          })
      },
      methods: {
          /**
           * @description 收藏
           */
          async toggleFavorite() {
              const { category, fileUrl, v } = this.file;

              await favorite(this.file, category, fileUrl, 4, false, v);
              // 发布事件通知收藏变化
              emitter.publish("fileFavoriteChange", {
                  hasFavorite: this.file.hasFavorite,
                  fileUrl
              });
          },
          onPreviewOffice() {
            const iframe = $('#myIframe')[0]
            iframe.src = this.getPreviewUrl()
          },
          /**
           * @description 预览、查看链接
           */
          getPreviewUrl() {
              const { filename, fileUrl, v } = this.file;
              console.log(
                  'this.getPreviewUrl - this.createDate',
                  this.createDate,
                  this.file.createDate,
                  this.file
              );

              return `${globalData.ctxPath}/officeTrans.do?method=view&fileId=${fileUrl}&createDate=${
                  this.createDate
              }&needDownload=true&filename=${encodeURIComponent(filename)}&v=${v}${CsrfGuard.getUrlSurffix()}`;
          },
          /**
           * @description: 预览弹窗
           * @param {*}
           * @return {*}
           */
          preViewDialog() {
              const { filename, fileUrl, v } = this.file;
              const url = `${
                  globalData.ctxPath
              }/fileDownload.do?method=doDownload4Office&type=Pdf&isOpenFile=true&fileId=${fileUrl}&createDate=${
                  this.createDate
              }&filename=${encodeURIComponent(filename)}&v=${v}${CsrfGuard.getUrlSurffix()}`;
              let { dialogWidth, dialogHeight} = this.getDialogSize();
              const dialog = globalMethods.legacyDialog({
                  url,
                  title: this.$i18n('common.operate.view'),
                  bodyStyle: { padding: '0' },
                  footer: null,
                  width: dialogWidth,
                  height: dialogHeight,
              });
          },
          getDialogSize() {
            let topWindow = getCtpTop() || window.top;
            let bodyWidth = null;
            let bodyHeight = null;
            if(topWindow.document.body){
              bodyWidth = topWindow.document.body.offsetWidth;
              bodyHeight = topWindow.document.body.offsetHeight;
              if(!bodyWidth){
                bodyWidth = topWindow.document.body.clientWidth;
              }
              if(!bodyHeight){
                bodyHeight = topWindow.document.body.clientHeight;
              }
            }
            let dialogWidth = topWindow.document.body ? Math.floor((parseInt(bodyWidth, 10) * 0.85)) : 1100;
            let dialogHeight = topWindow.document.body ? Math.floor(parseInt(bodyHeight, 10) * 0.85) : 700;
            dialogHeight -= 30;
            return {dialogWidth, dialogHeight}
          },
          /**
           * @description 预览图片
           */
          preViewImg() {
              this.$emit('viewImg');
          },
          initAttachmentImageShow() {
              this.$previewImg.initOfficeObj();
          },
          leaveAttachmentImageShow() {
              leaveAttachmentImageShow(this);
          },
      },
  };
</script>
<style lang="scss" scoped>
  .file-handle-container {
      display: flex;
      align-items: center;

      > li {
          margin-left: 10px;
        
          .syIcon {
              cursor: pointer;
              font-size: 14px;
              position: relative;
              top: 1px;
          }

          .sy-collect-fill {
              color: #EBB01E;
          }

          .view-icon {
            position: relative;
            top: 1px;
          }
      }

      > li:first-child {
        margin-left: 0;
      }
  }
</style>
