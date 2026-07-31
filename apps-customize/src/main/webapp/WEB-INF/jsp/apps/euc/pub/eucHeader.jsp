<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/common/common.jsp"%>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/euc/js/pub/pub.js${ctp:resSuffix()}"></script>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/euc/js/pub/tab.js${ctp:resSuffix()}"></script>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/euc/js/pub/searchBar.js${ctp:resSuffix()}"></script>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/euc/js/pub/toolBar.js${ctp:resSuffix()}"></script>
<script type="text/javascript" charset="UTF-8" src="${path}/apps_res/euc/js/pub/tree.js${ctp:resSuffix()}"></script>
<%-- 全局的js对象，缓存页面公共变量，以及需要处理的内容 --%>
<script type="text/javascript">
  var pageX = {jval:'${jval}'};
</script>