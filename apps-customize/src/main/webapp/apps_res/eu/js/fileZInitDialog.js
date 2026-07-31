var fileZInitDialogSet = window.parentDialogObj["fileZInitDialog"].getTransParams();
$(function() {
	var createDates=fileZInitDialogSet.createDates;
	var fileIds=fileZInitDialogSet.fileIds;
	var fileNames=fileZInitDialogSet.fileNames;
	var html="";
	for(var i=0;i<createDates.length;i++){
		html+="<div fileName='"+fileNames[i]+"' fileId='"+fileIds[i]+"' createdates='"+createDates[i]+"'>"+fileNames[i]+" <button class='common_button common_button_emphasize filezshow'>查看</button> <button class='common_button common_button_emphasize filezedit'>编辑</button> <button class='common_button common_button_emphasize filezredPrint'>套红</button></div><hr>";
	}
	$(".fileZ").html(html);
	
	$('.filezshow').click(function() {
	    // 获取当前点击元素的父级元素
	    var fileid = $(this).parent().attr("fileid");
	    var createdates = $(this).parent().attr("createdates");
	    var fileName = $(this).parent().attr("fileName");
	    var showUrl=getUrl(fileid,createdates,fileName,"view");
	    window.open(
				showUrl,
				"_blank",
				"top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
		);
	});
	$('.filezedit').click(function() {
		 // 获取当前点击元素的父级元素
	    var fileid = $(this).parent().attr("fileid");
	    var createdates = $(this).parent().attr("createdates");
	    var fileName = $(this).parent().attr("fileName");
	    var showUrl=getUrl(fileid,createdates,fileName,"edit");
	    window.open(
				showUrl,
				"_blank",
				"top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
		);
	});
	$('.filezredPrint').click(function() {
		 // 获取当前点击元素的父级元素
	    var fileid = $(this).parent().attr("fileid");
	    var createdates = $(this).parent().attr("createdates");
	    var fileName = $(this).parent().attr("fileName");
	    var showUrl=getUrl(fileid,createdates,fileName,"edit");
	    var redParamList=fileZInitDialogSet.redParamList;
	    var allSubDataMap=fileZInitDialogSet.allSubDataMap;
	    var redJson=JSON.stringify(redParamList);
	    var redTableJSON=JSON.stringify(allSubDataMap);
	    var fileZUrl="/seeyon/euFileZ.do?method=fileZsdkShow&fileZurl="+encodeURIComponent(showUrl)+"&redJson="+encodeURIComponent(redJson)+"&redTableJSON="+encodeURIComponent(redTableJSON);
		window.open(
				fileZUrl,
				"_blank",
				"top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
		);
	});
	
	function getUrl(fileid,createdates,fileName,state){
		var paramData={"fileId":fileid,"createDate":createdates,"fileName":fileName,"state":state}
	    var fileZRavl=callBackendMethod("euFileZManager","fileZInit",paramData);
	    if(fileZRavl!=null){
	    	var showUrl=fileZRavl.url;
	    	if(showUrl!=null&&showUrl!=""){
	    		return showUrl;
	    	}else{
	    		$.alert("后台异常");
	    	}
	    }
	}
});


