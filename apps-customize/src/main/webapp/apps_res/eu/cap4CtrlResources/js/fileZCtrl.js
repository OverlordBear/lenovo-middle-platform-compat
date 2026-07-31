(function(allVariable) {
	var privateNamespace ='field_324591185229988128';
	var _self = allVariable;
	var fileDisPlay="送审文件";

	//自定义控件渲染初始化方法
	_self.init = function(res) {
		var adaptation = res.adaptation;
		var privateId = res.privateId;
		var messageObj = adaptation.childrenGetData(privateId);//获取自定义控件值对象
//		if("edit"==messageObj.auth){//编辑状态才能显示
			var showHTML = '<Button id="click_edit" href="javascript:showMessageBox1()" class="common_button common_button_emphasize">选择操作方式</Button>';
			var div = document.getElementById(privateId);
			if (div) {
				div.innerHTML = showHTML;
			}
			document.querySelector('#click_edit').addEventListener('click', function() {
				_self.edit(privateId, messageObj, adaptation);
			});
//		}
	}

	_self.edit = function(privateId, messageObj, adaptation) {
		var fileIds=[];
		var fileNames=[];
		var createDates=[];
		var fileFieldId="";
		//获取套红所需字段
		var redRavl=callBackendMethod("euFileZManager","getRedStrings",{});
		var redPlays=[];
		var redTablePlays=[];
		var redParamList=[];
		var form = csdk.core.getFormData();
	    var formsons = csdk.core.getFormData().formsons;
		var mainInfo=form.metadata.tableInfo.formmain.fieldInfo;
		if(redRavl!=null&&redRavl!=""){
			var readStrings=redRavl.readStrings;
			var redTableStrings=redRavl.redTableStrings;
			var reads = readStrings.split(";");
			for(var i=0;i<reads.length;i++){
				redPlays.push(reads[i]);
			}
			var redTables = redTableStrings.split(";");
			var allSubDataMap={};
			for(var i=0;i<redTables.length;i++){
				var singleTable=redTables[i];
				var keySign=singleTable.split("=")[0];//key值
				var valueList=singleTable.split("=")[1];
				if(valueList!=null){
					var valueLists=valueList.split(",");//明细字段
					var singleSubRelations=changeDisplay(valueLists);
					//按着顺序获取明细字段所有的值
					var subDatas=[];
					for ( var frontson in formsons) {
						var front=formsons[frontson];
						var frontRecords=front.records;
						for(var ia=0;ia<frontRecords.length;ia++){
							var singleSubDatas=[];
							var frontRe=frontRecords[ia];
							if(frontRe!=null){
								var recordId=frontRe.recordId;
								var frontLists=frontRe.lists;
								for(var fieldN in frontLists){
									for(var n=0;n<singleSubRelations.length;n++){
										if(fieldN==singleSubRelations[n].split(";")[0]){ //表;字段
											var param={
													"fieldId":singleSubRelations[n].split(";")[0],
													"tableName":singleSubRelations[n].split(";")[1],
													"recordId":recordId
											}
											var singleSubData = csdk.core.getFieldData(param);
											singleSubDatas.push(singleSubData.showValue);
										}
									}
								}
								if(singleSubDatas.length>0){
									subDatas.push(singleSubDatas);
								}
							}
						}
					}
					allSubDataMap[keySign]=subDatas;
				}
		}
		}
		for(var mainField in mainInfo){//主表数据获取
			var mainBean=mainInfo[mainField];
			if(mainBean.display==fileDisPlay){
				fileFieldId=mainBean.name;
			}
			if(redPlays.indexOf(mainBean.display)>-1){
				var redFieldId=mainBean.name;
				var param={
						"fieldId":redFieldId
				}
				var redFieldData = csdk.core.getFieldData(param);
				var redValue=redFieldData.value;
				var redParam={"key":mainBean.display,"val":redValue}
				redParamList.push(redParam);
			}
		}
		var param={
				"fieldId":fileFieldId
		}
		var fileData = csdk.core.getFieldData(param);
		var atts=fileData.attachmentInfo.attachmentInfos;
		atts.forEach(function(value, key, atts) {
			var att=value;
			if(att!=null){
				fileIds.push(att.fileUrl);
				fileNames.push(att.filename);
				createDates.push(att.createdate);
			}
		});
		if(fileIds.length>0){
			var sendParam={
					"fileIds":fileIds,
					"fileNames":fileNames,
					"createDates":createDates,
					"redParamList":redParamList,
					"allSubDataMap":allSubDataMap
			};
			var dialog=$.dialog({
				  id: 'fileZInitDialog',
				  url: '/seeyon/euFileZ.do?method=fileZInitDialog',
				  width: 700,
				  height: 350,
				  transParams: sendParam,
				  title: '选择操作方式',
				  type: 'panel',
				  checkMax: true,
				  closeParam: {
					  'show': true,
					  autoClose: false,
					  handler: function() {
						  dialog.close();
					  }
				  },
				  buttons: [ {
					  text: "关闭",
					  handler: function() {
						  dialog.close();
					  }
				  }]
			  });
		}else{
			$.alert("请上传至少一个附件");
		}
	}
	

	function changeDisplay(displays){
		var relations=[];
		var form = csdk.core.getFormData();
		var formsons = csdk.core.getFormData().formsons;
		var subFormList=form.metadata.tableInfo.formson;//明细表 表单字段
		for (var i=0;i<subFormList.length;i++) {
			var subDatas=subFormList[i].fieldInfo;
			var tableName=subFormList[i].tableName;
			for(var k=0;k<displays.length;k++){
				var display=displays[k];
				for(var frontSub in subDatas){
					var subData2=subDatas[frontSub];
					if(subData2.display==display){
						var fieldName=subData2.name;
						var subRelation=fieldName+";"+tableName
						relations.push(subRelation);
					}
				}
			}
		}
		return relations;
	}
	
	/**
	 * 关闭滚动条
	 */
	function closeProcePub() {
		try {
			if (getCtpTop().proce) {
				getCtpTop().proce.close();
			}
			getCtpTop().proce = null;
		} catch (e) {
		}
	}

	/**
	 * 开启进度条
	 */
	function openProcePub() {
		try {
			getCtpTop().proce = parent.$.progressBar();
		} catch (e) {
		}
	}


	window[privateNamespace] = allVariable;
})({});