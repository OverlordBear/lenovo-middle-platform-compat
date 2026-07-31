<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/apps/euc/pub/eucHeader.jsp"%>
<html class="h100b over_hidden">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>选择套红模板</title>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/eu/js/selectRedTemplate.js${ctp:resSuffix()}"></script>
</head>
<body class="h100b over_hidden">
 <div id='layout' class="comp page_color" comp="type:'layout'">
  <div class="layout_north" layout="height:40,sprit:false,border:false">
   <div id="toolbar"></div>
  </div>
  <div class="layout_center page_color over_hidden" layout="border:false">
   <table id="useTable" class="flexme3" style="display: none;"></table>
  </div>
 </div>
</body>
</html>