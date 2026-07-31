<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/apps/euc/pub/eucHeader.jsp"%>
<html class="h100b over_hidden">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>fileZ</title>
<script type="text/javascript" charset="UTF-8"
	src="${path}/apps_res/eu/js/fileZsdk.js${ctp:resSuffix()}"></script>
<script type="text/javascript" charset="UTF-8"
	src="${path}/apps_res/eu/js/fileZsdkShow.js${ctp:resSuffix()}"></script>
<script type="text/javascript">
            var fileZurl = '${fileZurl}';
            var redJson = '${redJson}';
            var redTableJSON = '${redTableJSON}';
        </script>
<style>
#doc1 { /* div的CSS样式 */
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
</head>
<body class="h100b over_hidden">
	<div id="doc1" class="doc-container"></div>
</body>
</html>