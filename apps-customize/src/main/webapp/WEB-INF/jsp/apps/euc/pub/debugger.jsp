<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ include file="/WEB-INF/jsp/common/common.jsp"%>
<html class="h100b over_hidden">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css">
input[type="text"] {
	height: 20px;
	line-height: 20px;
}

.common_txtbox_wrap input {
	height: 20px;
	line-height: 20px;
}

.only_table td {
	height: 20px;
	line-height: 20px;
}
</style>
<title>调试信息</title>
<script type="text/javascript">
  var pageX = {
    "jval" : '${jval}'
  };
</script>
</head>
<body class="h100b over_hidden">
	<div id='layout' class="comp" comp="type:'layout'">
         <div class="layout_north" layout="height:25,maxHeight:25,minHeight:25,border:false,sprit:false">
            <div class="font_size12 margin_t_5 margin_l_5"><span class="${result.code eq '0' ? 'green':'color_red'} margin_lr_5" >${result.code eq '0'?'成功':'失败'}</span>${result.message}</div>   
        </div>
		<div id="useArea" class="layout_center over_y_auto" layout="border:false,sprit:false">
			<table width="100%" border="0" cellspacing="0" cellpadding="0" class="only_table">
				<thead>
					<tr>
						<th width="30">序号</th>
						<th width="60">时间</th>
						<th width="50">状态</th>
						<th>消息</th>
						<th>步骤</th>
					</tr>
				</thead>
				<tbody>
					<c:forEach items="${result.results}" var="row" varStatus="vs">
						<tr class="erow ${row.code eq '0'?'green':'color_red'}">
							<td>${vs.count}</td>
							<td>${row.time}</td>
							<td>${row.code eq '0'?'成功':'失败'}</td>
							<td>${row.message}</td>
							<td>
							<c:forEach items="${row.steps}" var="step" varStatus="vs1">
								<span>(${vs1.count})、${step}</span>
								<br>
							</c:forEach></td>
						</tr>
					</c:forEach>
				</tbody>
			</table>
		</div>
	</div>
</body>
</html>