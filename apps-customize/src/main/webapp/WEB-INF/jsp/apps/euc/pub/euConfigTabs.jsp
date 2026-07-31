<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/apps/euc/pub/eucHeader.jsp"%>
<html class="h100b over_hidden">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>标题</title>
</head>
<body id="body" class="h100b over_hidden">
 <div id="tabs" class="comp" comp="type:'tab',parentId:'body'">
  <div id="tabs_head" class="common_tabs clearfix">
   <ul class="left">
    <li class="current"><a hidefocus="true" href="javascript:void(0)" tgt="tab0"><span>参数配置</span></a></li>
    <li><a hidefocus="true" href="javascript:void(0)" tgt="tab1"><span>客开集成配置</span></a></li>
    <li><a hidefocus="true" href="javascript:void(0)" tgt="tab2"><span>身份报文日志</span></a></li>
    <li><a hidefocus="true" href="javascript:void(0)" tgt="tab2"><span>会议报文日志</span></a></li>
   </ul>
  </div>
  <div id="tabs_body" class="common_tabs_body">
   <iframe id="tab0" width="100%" src="/seeyon/euc.do?method=config" frameborder="no" border="0" class="hidden"></iframe>
   <iframe id="tab1" width="100%" src="/seeyon/euMeetSf.do?method=sfLog" frameborder="no" border="0" class="hidden"></iframe>
   <iframe id="tab2" width="100%" src="/seeyon/euMeetSf.do?method=meetLog" frameborder="no" border="0" class="hidden"></iframe>
  </div>
 </div>
</body>
</html>