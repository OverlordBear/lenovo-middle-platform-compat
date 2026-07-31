<!--
 * @Description: 按钮上面的操作
-->

<template>
    <ul :class="[isNewMode ? 'file-handle-list-new' : 'file-handle-list']">
        <li v-if="file.canFavorite">
            <a-tooltip :title="file.hasFavorite ? $i18n('common.cancel.collection.label') : $i18n('common.collection.label')">
                <div @click="toggleFavorite">
                    <i v-if="isNewMode" :class="['syIcon', file.hasFavorite ? `sy-collect-fill ${favoriteClass}` : 'sy-collect']"></i>
                    <span v-else :class="['ico24', file.hasFavorite ? 'stored_24' : 'unstore_24']"></span>
                </div>
            </a-tooltip>
        </li>
        <li>
            <a-tooltip :title="isNewMode ? $i18n('common.download.label') : file.filename">
                <DownloadAtt :file="file">
                    <icon-font v-if="isNewMode" type="cap-icon-xiazai" />
                    <span v-else class="ico24 download_24"></span>
                </DownloadAtt>
            </a-tooltip>
        </li>
        <!--修改附件添加进来的 hasSaved为false 只展示下载-->
        <li v-if="(canLook || isImg || isPdfButNoTrans) && file.hasSaved !== false" class="preview-file">
            <a-tooltip :title="$i18n('common.operate.view')">
                <!--gjx-start：附件查看统一走 FileZ 文档中台（含图片/PDF）-->
                <a :href="getPreviewUrl()" target="openFrame">
                    <icon-font v-if="isNewMode" type="cap-icon-chakan" />
                    <span v-else class="ico24 preview_24"></span>
                </a>
                <!--gjx-end-->
            </a-tooltip>
        </li>
    </ul>
</template>
<script>
    import DownloadAtt from '../download-att';
    import { useBaseInfoStore } from '@/store/modules/base-info';
    import { mapState, mapActions } from 'pinia';
    import favorite from 'helper/favorite';
    import globalData from 'plugins/data';
    import globalMethods from 'plugins/methods';
    import emitter from "utils/emitter";
    // gjx-start：FileZ 附件预览白名单判断
    import { isFileZPreviewFile } from '@/custom/filez/config';
    // gjx-end

    export default {
        name: 'FileHandleList',
        components: {
            DownloadAtt,
        },
        props: {
            file: {
                type: Object,
            },
            isNewMode: { // 是否为新组件模式
                type: Boolean,
                default: false,
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
            //创建时间适配
            createDate: '',
            // 开启转换
            allowTrans: false,
            // 可转换类型
            isAllowTrans: false,
            // 是pdf类型但是没有开启转换
            isPdfButNoTrans: false,
            // 是否可查看预览，由后端已经判断是否可预览、是否开启office转换
            canLook: false
        }),
        computed: {
            ...mapState(useBaseInfoStore, ['$previewImg']),
        },
        created() {
            console.log('file:', this.file);
            //初始化一些字段
            //是否检查类型。屏蔽0和3
            /*   FILE 0, //本地上传的文件，将在附件区显示
                IMAGE 1, //正文中的图片，不在附件区显示
                DOCUMENT 2, //关联文档
                FormFILE 3, //表单中的附件
                FormDOCUMENT 4, //表单中的关联文档
                NewsImage 5, //新闻图片
                BUZ_CUSTOM 6, //业务自定义.系统自动补偿录得的.(业务直接向upload中写入文件.后续要收口)
            * */
            const isCheckType = this.file.type == 0 || this.file.type == 3 || this.file.type == 1;
            const filename = this.file.filename.toLowerCase();
            //是否是图片
            this.isImg = isCheckType && /\.(jpg|jpeg|png|gif|bmp)$/.test(filename);
            // 把图片类型的附件单独存储
            this.isImg && this.$emit('addImgFile');
            //是否是pdf
            this.isPdf = isCheckType && /\.pdf$/.test(filename);
            //创建时间
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
            //附件多区域同数据展示状态问题
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
                //发布事件通知收藏变化
                emitter.publish("fileFavoriteChange", {
                    hasFavorite: this.file.hasFavorite,
                    fileUrl
                });
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
                console.log(this.file);

                const { filename, fileUrl, v } = this.file;

                const url = `${
                    globalData.ctxPath
                }/fileDownload.do?method=doDownload4Office&type=Pdf&isOpenFile=true&fileId=${fileUrl}&createDate=${
                    this.createDate
                }&filename=${encodeURIComponent(filename)}&v=${v}${CsrfGuard.getUrlSurffix()}`;

                const dialog = globalMethods.fullDialog({
                    url,
                    title: this.$i18n('common.operate.view'),
                    footer: null,
                    onCancel() {
                        dialog.close();
                    },
                });
            },
            /**
             * @description 预览图片
             */
            preViewImg() {
              this.$emit('viewImg');
            },
            initAttachmentImageShow() {
                // initAttachmentImageShow(this);
                this.$previewImg.initOfficeObj();
            },
            leaveAttachmentImageShow() {
                leaveAttachmentImageShow(this);
            },
        },
    };
</script>
<style lang="scss" scoped>
    .file-handle-list {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 99;
        display: none;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 2px;

        > li {
            text-align: center;
            cursor: pointer;
            flex: 1;

            &:hover {
                background-color: rgba(0, 0, 0, 0.5);
            }

            a {
                display: block;
                height: 100%;
            }
        }
    }

    .file-handle-list-new {
        display: flex;
        align-items: center;

        > li {
            margin-left: 10px;
            display: flex;
            align-items: center;
            .syIcon {
                cursor: pointer;
                font-size: 14px;
            }
            .sy-collect {
                color: #333;
                vertical-align: middle;
            }
            .sy-collect:hover {
                color: #318ed9;
                color: var(--theme-brand4,#318ed9);
            }
            .sy-collect-fill {
                color: #EBB01E;
            }
            a {
                > i {
                    vertical-align: middle;
                }
            }
            
        }
        .preview-file {
            a {
                > i {
                    margin-top: 1px;
                }
            }
        }
    }
</style>
