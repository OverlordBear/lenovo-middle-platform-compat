<%--
 $Author: muyx $
 $Rev: 1.0 $
 $Date:: 2012-12-12 上午10:55:54#$:

 Copyright (C) 2012 Seeyon, Inc. All rights reserved.
 This software is the proprietary information of Seeyon, Inc.
 Use is subject to license terms.
--%>
<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/common/common.jsp"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt"%>
<%@ page import="java.util.*"%>
<!DOCTYPE html>
<html class="h100b over_hidden">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>${ctp:i18n('doc.jsp.knowledge.docopendialogonlyid.title')}</title>
<!--[if IE 8]>
    <style type="text/css">
    .     #layout_hhh{
              border-bottom:1px solid #d4d4d4;
           }
    </style>
<![endif]-->
<style type="text/css" theme-data>
    #layout_hhh{
        box-shadow: 0 0 1px 0px rgba(0,0,0,0.3), 0 0 6px 2px rgba(0,0,0,0.15);
        background: rgba(255,255,255,0.94);
    }
    #iframe_area{
         margin-top: 6px;
    }


    .stadic_head_height {
    height: 100px;
}
.stadic_body_top_bottom {
    bottom: 0;
    top: 145px;
}
.stadic_head_height2 {
    height: 310px;
}
.stadic_body_top_bottom2 {
    bottom: 0;
    top: 205px;
}
.common_toolbar_box {
  padding-top: 0;
  background:none;
  height:30px;
}
#toolbar .toolbar_l a {
    border: none;
    background: inherit;
    color: #666666;
}

#toolbar .toolbar_l a:hover, td.common_toolbar_box > a:hover {
    color: #1F85EC;color:var(--theme-brand6,#1F85EC);
}

ul#toolbar_more_ul {
    border-color: #E4E7ED !important;
    border-radius: 4px;
    background: rgba(255,255,255,1);
    box-shadow:0px 2px 12px 0px rgba(0,0,0,0.06);
    border:1px solid rgba(228,231,237,1);
}

div#toolbar_more {
    border-radius: 4px;
    max-width: 120px;
}
td.common_toolbar_box > a {
    margin-left: 23px;
    color: #666;
}
li > div > .time_reply > .time_span,li:hover > div > .time_reply > .reply_span {
    display: block;
}

li:hover > div > .time_reply > .time_span,li > div > .time_reply > .reply_span {
    display: none;
}
.child_reply {
    background: rgba(255,255,255,1);
    border:1px solid rgba(230,230,230,1);
    padding: 5px;
    margin-top: 5px;
    border-radius: 3px;
    margin-bottom: 5px;
    position: relative;
}
.child_reply > div {
    position: relative;
    padding: 10px 0;
}
.child_reply > div:last-child {
    border-bottom: none;
}
.child_reply > div > .time_reply{
    position: absolute;
    top: 12px;
    right: 5px;
}
.child_reply > div > .time_reply > .time_span, .child_reply > div:hover > .time_reply > .reply_span {
    display: block;
}

.child_reply > div:hover > .time_reply > .time_span,.child_reply > div > .time_reply > .reply_span {
    display: none;
}
li > div .line_height160 a{
    color: #1F85EC;color:var(--theme-brand6,#1F85EC);
}
div#deal_area_tab_head{
    width: 310px !important;
}
div#deal_area_tab_head li {width: 155px;text-align: center;}

div#deal_area_tab_head li a {
}
div#deal_area_tab_head li.current a {
    font-weight: 600;
}
div#deal_area_tab_head li {
    width: 155px;
    text-align: center;
}
div#deal_area_tab_head li a {
    width: 155px;
    max-width: 155px;
    height: 38px;
    font-size: 14px;
    line-height: 38px;
    padding: 0;
}
div#deal_area_tab_head {
    height: 40px;
    background: #F5F6F7;
    border: none;
}
.small_three_jiao {
    position: absolute !important;
    transform: rotate(45deg);
    -ms-transform:rotate(45deg); 	/* IE 9 */
    -moz-transform:rotate(45deg); 	/* Firefox */
    -webkit-transform:rotate(45deg); /* Safari 和 Chrome */
    -o-transform:rotate(45deg); 	/* Opera */
    /*filter:progid:DXImageTransform.Microsoft.Matrix(Dx=4,Dy=-1.65,M11=m11,M12=m12,M21=m21,M22=m22);*/
    /* dx=-width/2*cos(deg)+height/2*sin(deg) + width/2 */
    /* dy=-width/2*sin(deg)-height/2*cos(deg) + height/2 */
    width: 8px;
    height: 8px;
    background: #fff;
    border-top: 1px solid #e6e6e6;
    border-left: 1px solid #e6e6e6;
    top: -5px;
    left: 15px;
    display: none\0;
    padding: 0 !important;
    margin: 0 !important;
}

.info_row {
    height: 30px;
    line-height: 30px;
}

.info_row_label {
    float: left;
    width: 40%;
    text-align: right;
    font-size: 12px;
    color: #333;
}

.info_row_content {
    width: 60%;
    text-align: left;
    float: right;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.info_row_content > span {
    margin-left: 5px;
}
.orderBt{
    position: absolute;
    bottom: 0;
    right: 15px;
}
#remindToolTipAvgSpan{
    position: absolute;
    top: 40px;
    left: 33px;
    z-index: 1;
}
.form_area .common_button.common_button_gray{
    background: #1F85EC;background:var(--theme-brand6,#1F85EC);
    color: #ffffff;color: var(--theme-fc-revert, #fff);
    border: 1px solid #1F85EC;border: 1px solid var(--theme-brand6,#1F85EC);
	
}
</style>
<ctp:skinStyleHandler onlyInvoke="true"/>
<script type="text/javascript" src="${path}/apps_res/collaboration/js/CollaborationApi.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="${path}/apps_res/webmail/js/webmail.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="${path}/apps_res/doc/js/doc.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="${path}/apps_res/doc/js/docFavorite.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="${path}/apps_res/doc/js/knowledgeBrowseUtils.js${v3x:resSuffix()}"></script>
<script type="text/javascript" src="${path}/apps_res/doc/js/docSendTo.js${v3x:resSuffix()}"></script>
<%@include file="/WEB-INF/jsp/apps/doc/js/docUtil_js.jsp"%>
<%@include file="/WEB-INF/jsp/apps/doc/js/knowledgeBrowse_js.jsp"%>
<!-- 致信客户端 -->
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/uc/rongcloud/chat.js${ctp:resSuffix()}"></script>
<script type="text/javascript">


var isGuest = ${isGuest};
var fromGenius = false;
try{
	fromGenius = getA8Top().location.href.indexOf('a8genius.do') > -1;
}catch(e){}

var LockStatus_AppLock = "<%=com.seeyon.apps.doc.util.Constants.LockStatus.AppLock.key()%>";
var LockStatus_ActionLock = "<%=com.seeyon.apps.doc.util.Constants.LockStatus.ActionLock.key()%>";
var LockStatus_DocInvalid = "<%=com.seeyon.apps.doc.util.Constants.LockStatus.DocInvalid.key()%>";
var LockStatus_None = "<%=com.seeyon.apps.doc.util.Constants.LockStatus.None.key()%>";
var LOCK_MSG_NONE = "<%=com.seeyon.apps.doc.util.Constants.LOCK_MSG_NONE%>"

function reStyle(){
	$("#attachmentArea").removeAttr("style");
	$("#attachmentArea").attr("overflow", "auto");
	$("#attachmentArea").attr("overflow-x","hidden");
}

</script>
</head>
<body class="h100b over_hidden page_color" onload="reStyle();">
<c:set var="isOffice" value="${doc.mimeTypeId==23 || doc.mimeTypeId==24 || doc.mimeTypeId==25 || doc.mimeTypeId==26 || doc.mimeTypeId==101 || doc.mimeTypeId==102 || doc.mimeTypeId==120 || doc.mimeTypeId==121}"/>
<!-- 协同保存附件的标题 -->
<input type="hidden" id="subject" name="subject" value="${ctp:toHTML(doc.frNameRemoveOffficeFromat)}">
<div id="fromDiv"></div>
    <div id='layout'  class="comp" comp="type:'layout'">
        <%--右边区域 --%>
        <c:set var="isShow" value="${isGuest?false:true}"/>
        <div class="layout_east over_hidden" id="east" layout="border:false,width:310,maxWidth:310,minWidth:310,spiretBar:{show:${isShow },handlerL:function(){$('#layout').layout().setEast(310);},handlerR:function(){$('#layout').layout().setEast(0);}}">
            <div id="deal_area_show" class="font_size12 align_center h100b hidden hand">
                <span class="ico16 arrow_2_l"></span> ${ctp:i18n('doc.knowledge.operation')}
            </div>
            <div id="deal_area" class="h100b">
                <div id="deal_area_tab" class="comp" comp="parentId:'deal_area',type:'tab',width:310">
                    <div id="deal_area_tab_head" class="common_tabs clearfix">
                        <ul class="left">
                            <li class="current"><a href="javascript:void(0)" tgt="reply_div"><span>${ctp:i18n("doc.jsp.knowledge.evaluation")}</span></a></li>
                            <li><a href="javascript:void(0)" tgt="property_div"><span>${ctp:i18n("doc.menu.admin.properties")}</span></a></li>
                        </ul>
                    </div>
                    <div id="deal_area_tab_body" class="common_tabs_body ">
                        <div id="reply_div">
                            <div class=" font_size12 h100b border_l" style="padding: 0 8px">
                                <div class="stadic_layout h100b" >
                                    <div class="stadic_layout_head stadic_head_height2" layout="height:30,sprit:false,border:false" id="divToolBarId">
                                        <div class="clearFlow font_size14 margin_t_5" id="divAvgSpanId" style="padding-top:10px;height:30px;font-size: 24px;color: #FF9800;">
                                            <span id="spanAvgSpan" class="left line_height160 " style="font-size:16px;">${avgScore}</span>
                                            <span id="starAvgSpan" docId="${ctp:toHTML(doc.id)}" class="${avgScoreCss} left left margin_l_5 hand" style="zoom: 1;margin-top: 6px;" title="${ctp:i18n('doc.knowledge.doc.score')} : ${avgScore}"><table cellpadding="0" cellspacing="0" border="0" width="100%" height="100%" style="font-szie:10px;"><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table></span>
                                            <span id="remindToolTipAvgSpan" class="hidden left bg_color_yellow font_size12 border_all margin_l_10"><span class="tooltip absolute"><em class="tooltip_em" style="left: -6px;top:15px; width: 6px; height: 11px; background-position: -22px -160px; "></em></span><table cellpadding='0' cellspacing='0' border='0' ><tr><td><font>${ctp:i18n('doc.knowledge.remindtooltipavgspan')}</font></td><td><span class='mark_score_tip display_inline-block' /></td></tr></table></span>
                                        </div>
                                        <div class=" ${(doc.commentEnabled && param.openFrom != 'glwd' && (!isGuest)) ? '' :'display_none'}">
                                            <c:set value="onclick='fnPublishComment(this);'" var="clickEvent"/>
                                            <c:set value="${param.versionFlag eq 'HistoryVersion'}" var="isHistoryVersion"/>
                                            <div id="submitPublishCommentId" class="form_area margin_t_5">
                                                <div class="margin_t_5 clearFlow">
                                                    <div class="common_txtbox_wrap">
                                                        <textarea ${isHistoryVersion ? 'disabled="disabled"':''} id="body" class="validate font_size12 ${isHistoryVersion ? 'bg_color_gray':''}"
                                                             style="resize:none; width: 100%; height: 80px; border: 0;padding: 5px" onblur="$('#submitPublishCommentId').resetValidate();"
                                                             validate='name:"${ctp:i18n('doc.jsp.knowledge.evaluation')}",notNull:true,maxLength:500,character:"-!@#$%^~\\]=\{\}\\/;[&*()<>?_+"'></textarea>
                                                    </div>
                                                </div>
                                                <div class="align_right margin_t_5">
                                                    <a id="btnPublish" href="javascript:void(0)" ${isHistoryVersion ? "":clickEvent}
                                                       docId="${ctp:toHTML(doc.id)}" class="common_button common_button_emphasize ${isHistoryVersion ? "common_button_disable":""}">${ctp:i18n('doc.knowledge.public.comment')}</a>
                                                </div>
                                                <div class="hr_heng margin_t_5"></div>
                                                <div class="margin_t_5" style="font-size: 14px;font-weight: 600;">
                                                    ${ctp:i18n('doc.knowledge.current.comment')}(<span id="spanInputForumNum"></span>)
                                                </div>
                                            </div>
                                            <div class="stadic_layout_body stadic_body_top_bottom2 over_y_auto bg_color_white" id="forumsSpace">
                                                <ul id="forumsId" class="clearFlow">
                                                    <%--评论内容位置 --%>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="property_div" class="hidden">
                            <div class=" font_size12 h100b border_l" style="padding: 0 8px">
                                <div class="stadic_layout h100b" >
                                    <div class="info_row" style="margin-top: 50px">
                                        <%-- 内容类型 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.type')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${ctp:toHTML(prop.type)}</span>
                                        </div>
                                    </div>
                                    <c:if test="${secretLevelAble}" >
                                        <div class="info_row">
                                            <%-- 内容类型 --%>
                                            <div class="info_row_label">
                                                <span>${ctp:i18n('doc.knowledge.secretLevel')}:</span>
                                            </div>
                                            <div class="info_row_content">
                                                <span>${ctp:toHTML(prop.secretLevelName)}</span>
                                            </div>
                                        </div>
                                    </c:if>
                                    <div class=" info_row">
                                        <%-- 位置 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.jsp.properties.common.path')}:</span>
                                        </div>
                                        <div class="info_row_content" title="${ctp:toHTML(prop.path)}">
                                            <span>${ctp:toHTML(prop.path)}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 文件大小 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.size')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${prop.size}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 创建人 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.creater')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${ctp:toHTML(prop.createUserName)}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 创建时间 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.createtime')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${v3x:getLimitLengthString(createDateForShow,16,"")}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 修改人 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.lastuser')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${ctp:toHTML(prop.lastUserName)}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 修改时间 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.metadata.def.lastupdate')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${v3x:getLimitLengthString(updateDateForShow,16,"")}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 你是我的关键词 --%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.jsp.knowledge.query.key')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span><c:out value='${prop.keywords}' escapeXml='true' /></span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 众里寻她千百度 梦回相见凡几数？--%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.jsp.properties.common.accesscount')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${prop.accessCount}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 下载--%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.knowledge.download.count')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${doc.downloadCount}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 收藏--%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.knowledge.collect.count')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span id="collectCount">${doc.collectCount}</span>
                                        </div>
                                    </div>
                                    <div class=" info_row">
                                        <%-- 推荐--%>
                                        <div class="info_row_label">
                                            <span>${ctp:i18n('doc.jsp.properties.common.recommendcount')}:</span>
                                        </div>
                                        <div class="info_row_content">
                                            <span>${doc.recommendCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <div class="layout_center over_hidden h100b"  id="center" layout="border:false">
            <!--查看区域-->
            <div class="h100b stadic_layout border_r" style="overflow: hidden;">
                <div id="layout_hhh" class="stadic_layout_head stadic_head_height  h100b" layout="border:false">
                    <!--标题+附件区域-->
                    <div id="docPrintTitle" class="newinfo_area title_view">
                       <table border="0" cellspacing="0" cellpadding="0" width="100%" style="table-layout : fixed;">
                        <tr height="2">
                        <td width="65"></td>
                        <td width=""></td>
                        </tr>
                            <tr style="height:35px;">
                                <%--<td width="80" title="${ctp:toHTML(doc.frName)}" id="frName"> --%>
                                    <%--<div class="color_gray2 align_right">${ctp:i18n('doc.jsp.open.body.name')}:</div>--%>
                                <%--</td>--%>
                                <td colspan="2" class="text_overflow w100b" style="padding-left:20px;font-size:18px;font-weight:bold;" title="${ctp:i18n('doc.knowledge.doc.title')} : ${ctp:toHTML(doc.frName)}"><b>${ctp:toHTML(doc.frName)}</b></td>
                            </tr>
                            <tr>
                                <td>
                                    <div class="color_gray2 align_left" style="padding-left:20px;font-size: 12px">${ctp:i18n('common.creater.label')}:</div>
                                </td>
                                <td style="font-size: 12px">
                                    <c:choose>
                                        <c:when test="${createUserValid}">
                                            <a onclick="fnPersonCard();" title="${ctp:i18n('doc.click.show.person')}" style="font-size: 12px">${createUserName}</a>
                                        </c:when>
                                        <c:otherwise>
                                            <a class="disabled_color" title="${ctp:i18n('doc.click.unable.show.person')}" style="font-size: 12px">${createUserName}</a>
                                        </c:otherwise>
                                    </c:choose>
                                    (${ctp:formatDateByPattern(isHistory ? doc.lastUpdate:doc.createTime,'yyyy-MM-dd HH:mm:ss')})
                                </td>
                            </tr>
                            <c:if test="${!isGuest}">
                            <tr id="attachmentTR" style="display:none;">
                                <td id="attachment2" colspan="2">
                                    <div class="affix_area" style="overflow: inherit">
                                        <div id="docAttachment">
                                            <span class="ico16 affix_16 margin_t_5 margin_l_20" style="display: inline-block;float: left;"></span>
                                            <span class="attachment_block_number left margin_t_5">(<span id="attachmentNumberDiv"></span>)</span>
                                            <div class="comp" comp="type:'fileupload',canFavourite:true,takeOver:false,applicationCategory:'1',canDeleteOriginalAtts:false,originalAttsNeedClone:false,isEncrypt:false,quantity:5" attsdata='${attachmentsJSON}'>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr id="attachment2TRposition1" style="display:none;">
                                <td id="attachment1" colspan="2">
                                    <div class="affix_area">
                                        <span class="ico16 relate_file_16 margin_t_5 margin_l_20" style="display: inline-block;float: left;"></span>
                                        <span class="attachment_block_number left margin_t_5">
                                            <span>(<span id="attachment2NumberDivposition1"></span>)</span>
                                        </span>
                                        <div id="relaAttachment">
                                            <div class="comp"  comp="type:'assdoc', showRelateDocSecret:'true',noMaxheight:true,canDeleteOriginalAtts:false, attachmentTrId:'position1', modids:'1,3'" attsdata='${attachmentsJSON}'></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            </c:if>
                        </table>
                    </div>
                    <!--命令按钮区域-->
                    <div id="docPrintTitle2" style="display: none; width: 0px; height: 0px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" height="50" align="center">
                <tr>
                    <td height="10" class="detail-summary">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="sort ellipsis" align="center">

                            <tr>
                                <td id="nameLabelTD" width="90" height="28" valign="top" nowrap class="bg-gray font-size-12 detail-subject align_right">
                                    ${ctp:i18n('doc.jsp.open.body.name')}:
                                </td>
                                <td id="nameValueTD" title="${v3x:toHTML(doc.frName)}" class="detail-subject font-size-12 breakWord">
                                    <c:out value="${v3x:toHTML(doc.frName)}" escapeXml="true" />
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td id="createrLabelTD" height="22" nowrap class="bg-gray font-size-12 align_right">
                                    ${ctp:i18n('common.creater.label')}:
                                </td>
                                <td id="createrValueTD" height="22" nowrap class="font-size-12">
                                    <span class="cursor-hand" onclick="showV3XMemberCard('${doc.createUserId}')">${v3x:showMemberName(doc.createUserId)}</span>
                                    (<fmt:formatDate value='${isHistory ? doc.lastUpdate : doc.createTime}' pattern='yyyy-MM-dd HH:mm:ss' />)
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
            <div class="orderBt right margin_r_10">
                <table  cellSpacing="0" cellPadding="0" border="0">
                    <tr>
                        <td class="common_toolbar_box">
	                         <c:if test="${!isGuest && isAllowShareUC == 'true' && !isLink && !isCollect}">
	                            <a href="javascript:void(0);" onclick="openUc('${resId}');" class="margin_l_5" title="${ctp:i18n("doc.jsp.connect.zhixin")}">
	                                <span class="syIcon sy-m3-zhixin-fill" ></span>
	                            </a>
                             </c:if>
                            <c:if test="${knowledgeCanDownLoad}">
                                <%-- 下载 --%>
                                <a href="#" onclick="fnDocDownLoad();" class="margin_l_5" title="${ctp:i18n('common.download.label')}">
                                    <span class="syIcon sy-download"></span>
                                </a>
                            </c:if>
                            <c:if test="${knowledgeCanFavorite}">
                                <a id="favoriteSpan${doc.id}" class="margin_l_5 ${isCollect ?'display_none':''}"  href="#" onclick="favorite('3','${doc.id}',false,3, null, null, null, null, '${doc.favoriteV}');" title="${ctp:i18n('common.collection.label')}">
                                    <span class="syIcon sy-collect"></span>
                                </a>
                                <a id="cancelFavorite${doc.id}" class="margin_l_5 ${!isCollect ?'display_none':''}" href="#" onclick="cancelFavorite('3','${doc.id}',false,3);" title="${ctp:i18n('common.cancel.collection.label')}">
                                    <span class="syIcon sy-collect-fill"></span>
                                </a>
                            </c:if>
                            <c:if test="${knowledgeCanRecommend}">
                                <%-- 推荐 --%>
                                <a id="recommend" href="#" class="margin_l_5" title="${ctp:i18n('doc.jsp.knowledge.recommend')}" onClick="fnCommend('${ctp:toHTML(doc.id)}', '${doc.recommendEnable}');">
                                    <span class="syIcon sy-circulated"></span>
                                </a>
                            </c:if>
                            <c:if test="${knowledgeCanViewOriginal &&( !(doc.mimeTypeId==25 || doc.mimeTypeId==26 || doc.mimeTypeId==120 || doc.mimeTypeId==121) || isEnableOnlineView)}">
                                <%-- 查看源文档 --%>
                                <a href="#" onClick="popupContentWin()" title="${ctp:i18n('doc.show.original.document')}">
                                    <span class="syIcon sy-call_template"></span>
                                </a>
                            </c:if>
                            <c:if test="${knowledgeCanPrint}">
                                <%-- 打印 --%>
                                <a href="#" onClick="printDocLog();" title="${ctp:i18n('common.toolbar.print.label')}">
                                    <span class="syIcon sy-print"></span>
                                </a>
                            </c:if>
                            <c:if test="${knowledgeCanEdit && !isShareAndBorrowRoot}">
                                <%-- 编辑 --%>
                                <a href="#" onClick="toolBarEditDoc();" title="${ctp:i18n('common.operate.edit')}">
                                    <span class="syIcon sy-modify_text"></span>
                                </a>
                            </c:if>
                        </td>
                        <td>
                            <div id="toolbar"></div>
                        </td>
                    </tr>
                </table>
            </div>
            </div>
                <div id="iframe_area" class="stadic_layout_body stadic_body_top_bottom bg_color_white" layout="border:false">
                    <c:choose>
                        <%-- ============ 客开s wzl,gjx：优先判断是否有FileZ预览地址 ============ --%>
                        <c:when test="${not empty fileZshowUrl}">
                            <iframe id="docOpenBodyFrame" src="${fileZshowUrl}" width="100%" height="100%" frameborder="0" scrolling="yes" style="overflow: hidden;"></iframe>
                        </c:when>
                        <%-- ============ 客开e ============ --%>

                        <c:when test="${isHistory}">
                            <%-- 修正点1：补全了历史版本的完整参数 --%>
                            <iframe id="docOpenBodyFrame" src="${path}/doc.do?method=docOpenBody&versionFlag=${param.versionFlag}&docVersionId=${param.docVersionId}&docLibId=${ctp:toHTML(doc.docLibId)}&docLibType=${ctp:toHTML(docLibType)}&all=${ctp:toHTML(docPotent.allAcl)}&edit=${ctp:toHTML(docPotent.editAcl)}&read=${ctp:toHTML(docPotent.readAcl)}&download=${ctp:toHTML(docPotent.downloadAcl)}&print=${ctp:toHTML(docPotent.printAcl)}&openFrom=${ctp:toHTML(param.openFrom)}&isLink=${ctp:toHTML(isLink)}&entranceType=${ctp:toHTML(param.entranceType)}${v3x:csrfSuffix()}" width="100%" height="100%" frameborder="0" scrolling="no" style="overflow: hidden;"></iframe>
                        </c:when>
                        <c:when test="${!isIE && isOffice}">
                            <span class="">${ctp:i18n('doc.alert.office.nonsupport')}</span>
                        </c:when>
                        <c:otherwise>
                            <%-- 修正点2：补全了正常浏览的完整参数 --%>
                            <iframe id="docOpenBodyFrame" src="${path}/doc.do?method=docOpenBody&docResId=${ctp:toHTML(doc.id)}&docLibId=${ctp:toHTML(doc.docLibId)}&docLibType=${ctp:toHTML(docLibType)}&all=${ctp:toHTML(docPotent.allAcl)}&edit=${ctp:toHTML(docPotent.editAcl)}&read=${ctp:toHTML(docPotent.readAcl)}&download=${ctp:toHTML(docPotent.downloadAcl)}&print=${ctp:toHTML(docPotent.printAcl)}&openFrom=${ctp:toHTML(param.openFrom)}&isLink=${ctp:toHTML(isLink)}&entranceType=${ctp:toHTML(param.entranceType)}${v3x:csrfSuffix()}" width="100%" height="100%" frameborder="0" scrolling="no" style="overflow: hidden;"></iframe>
                        </c:otherwise>
                    </c:choose>
                </div>
            </div>
        </div>
    </div>
    <iframe id="iframe_empty" name="empty" frameborder="0" height="0" width="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
</body>
<script type="text/javascript">
    window.onload = function () {
        if (isGuest) {
            var layout = $("#layout").layout();
            layout.setEast(0);
        }
    }
</script>
</html>
