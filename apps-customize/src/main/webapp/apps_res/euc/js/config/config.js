// js开始处理
$(function() {
  pageX.jval = $.parseJSON(pageX.jval);
  pageX.useArea = $("#useArea");
  pageX.ajaxM = new eucConfigManager();
  init();
});

function delRow(_this){
  var size = $("#docFieldSetTable").find(".erow1").size();
  if (size > 1) {
    var tr = $(_this).parents("tr");
    var siblings = tr.siblings();
    tr.remove();
    if (siblings) {
      for (var i = 0; i < siblings.length; i++) {
        $(siblings[i]).find("#indexRow").html(i+1);
      }
    }
  }
}

function addRow(){
  var trHtml = $("#docFieldSetTemplate tr").parent().html();
  $("#docFieldSetTable").find(".erow1:last").after(trHtml);
  $("#docFieldSetTable").find(".erow1:last").find("#indexRow").html($("#docFieldSetTable").find(".erow1").size());
}

function hideOrShow(){
	$("#docFieldSetTable tbody").toggle();
	var display = $("#docFieldSetTable tbody").css('display');
	var flag = display == "none" ? "b" : "t";
	$("#hideOrShowIcon").attr("class", "ico16 arrow_2_"+ flag +" margin_r_5 margin_t_5 right");
}

function getDocFieldSet(){
	var area = $("#docFieldSetTable");
  var trs = area.find(".erow1");
  var datas = [];
  for (var i = 0; i < trs.length; i++) {
    var tr = trs[i];
    var inputs = $(tr).find("input");
    var textareas = $(tr).find("textarea");
    var data = {};
    for (var j = 0; j < inputs.length; j++) {
      var input = $(inputs[j]);
      data[input.attr("id")] = input.val();
    }
    for (var j = 0; j < textareas.length; j++) {
      var textarea = $(textareas[j]);
      data[textarea.attr("id")] = textarea.val();
    }
    datas.push(data);
  }
	return datas;
}

function setDocFieldSet(docFieldJSON){
	var area = $("#docFieldSetTable");
	var datas = $.parseJSON(docFieldJSON) ? $.parseJSON(docFieldJSON) : [];
  for (var i = 0; i < datas.length; i++) {
    var data = datas[i];
    if(data){
      var tr = area.find(".erow1:last");
      for ( var name in data) {
        var val = data[name];
        tr.find("#"+name).val(val);
      }
    }
    
    if((i+1)<datas.length){
      addRow();
    }
  }
}

function init() {
  openProce();
  pageX.areas = pageX.useArea.find("fieldset[type=area]");
  pageX.tabAreas = pageX.useArea.find("fieldset[type=table]");
  pageX.areaIds = [];
  pageX.tableIds = [];
  
  for (var i = 0; i < pageX.areas.length; i++) {
    var area = $(pageX.areas[i]);
    var areaId = area.attr("id");
    if (areaId) {
      pageX.areaIds.push(areaId);// 初始化
      var data = pageX.jval[areaId];
      if (data) {
        fillForm(area, data);
      }
    }
  }

	setDocFieldSet(pageX.jval.docFieldSetJSON);
  
  //选人回填
//  for ( var key in memberKeys) {
//    if(pageX.json[memberKeys[key]]){
//      pageX.useArea.find("#"+key +"_txt").val(pageX.json[memberKeys[key]][key+"_txt"]);
//      pageX.useArea.find("#"+key).val(pageX.json[memberKeys[key]][key]);
//    }
//  }

  for (var i = 0; i < pageX.tabAreas.length; i++) {
    var table = $(pageX.tabAreas[i]);
    var id = table.attr("id");
    if (id) {
      pageX.tableIds.push(id);
      var datas = pageX.jval[id];
      if (datas) {
        tableInit(table, datas);
      }
    }
  }

  closeProce();
}

function fnOK() {
  openProce();
  var submitJson = {};
  // 普通地方
  for (var i = 0; i < pageX.areaIds.length; i++) {
    var areaId = pageX.areaIds[i];
    var area = pageX.useArea.find("#" + areaId);
    submitJson[areaId] = getForm(area);
  }

	submitJson.docFieldSetJSON = $.toJSON(getDocFieldSet())

  // 表格
  for (var i = 0; i < pageX.tableIds.length; i++) {
    var tableId = pageX.tableIds[i];
    var trs = pageX.useArea.find("#" + tableId).find("tr");
    var rows = [];
    for (var i = 0; i < trs.length; i++) {
      var tr = $(trs[i]);
      var inputs = tr.find("input");
      if (inputs.length > 0) {
        rows.push(getForm(tr));
      }
    }
    submitJson[tableId] = rows;
  }

  pageX.ajaxM.updateConfigBy(submitJson,pageX.jval.mode,pageX.jval.userId, {
    success : function(rval) {
      var msg = "配置成功！", type = 'ok';
      msgBox(msg, type, function() {
        closeProce();
      });
    },
    error : function(rval) {
      var msg = "配置失败！", type = 'error';
      msgBox(msg, type, function() {
        closeProce();
      });
    }
  });
}

function tableInit(table, rows) {
  var lastTr = $(table.find("tr:last"));
  var trHtml = table.find("tr:last").prop("outerHTML");
  if (rows && trHtml) {
    fillTrBy(table, lastTr, trHtml, rows);
  }
  lastTr.closest("tr").remove();//删除模板列
}

// 回填table
function fillTrBy(table, lastTr, trHtml, rows) {
  var html = "";
  for (var i = 0; i < rows.length; i++) {
    lastTr.after(trHtml);
    lastTr = $(table.find("tr:last"));
    fillForm(lastTr, rows[i]);
  }
}

function addTr(_this) {
  var tab = $(_this).parents("table");
  var trHtml = table.find("tr:last").prop("outerHTML");
  tab.find("tr:last").after(trHtml);
}

function delTr(_this) {
  if ($(_this).parents("table").find("tr").size() > 1) {
    $(_this).parents("tr").remove();
  }
}

function fnCancel() {
  //window.locaiton.href = "/seeyon/main.do?method=managementMain&from=backToHome";
//  window.history.back();//返回上一页
  getA8Top().backToHome();
}

// 固定映射配置
function getTemplateConfig(tabId, data) {
  var config = {
    "writeToDbTab" : "billCode=;lineCode=;money=;paymentType=;currency=;applyDate=;applyPerson=;financePerson=;tobfsTime=;bfsDealResult=;bfsResultTime=;company=;receivables=;u9code=;oaBilltype=;oaDepartment=;oaApprovetime=",
    "writeOtherTab" : "forsonName=;account=;accountId=;type=;reBackTime=;isNotNull=;payType=",
    "scanTab" : "第0列=;第1列=;第2列=;第3列=;第4列=;第5列=;第6列=;第7列=",
    "beforToDbTab" : "sendTime=;message=;status="
  };
  var rVal = "";
  var cData = config[tabId];
  if (cData) {
    var customMap = {};
    if (data) {
      var customData = data.split(";");
      for (var i = 0; i < customData.length; i++) {
        var oaFile2dbFiles = customData[i].split("=");
        if (oaFile2dbFiles && oaFile2dbFiles.length > 1 && oaFile2dbFiles[0]) {
          customMap[oaFile2dbFiles[0]] = oaFile2dbFiles[1];
        }
      }
    }
    var rDatas = cData.split(";");
    for (var i = 0; i < rDatas.length; i++) {
      if (i > 0) {
        rVal += ";";
      }
      var oaFile2dbFiles = rDatas[i].split("=");
      if (oaFile2dbFiles && oaFile2dbFiles.length == 2) {
        if (customMap[oaFile2dbFiles[0]]) {
          rVal += oaFile2dbFiles[0] + "=" + customMap[oaFile2dbFiles[0]];
        } else {
          rVal += oaFile2dbFiles[0] + "=" + oaFile2dbFiles[1];
        }
      } else {
        $.alert("模板配置错误,请检查！");
      }
    }
  } else {
    rVal = data;
  }
  return rVal;
}

function jsonToMap(arr) {
  var map = "";
  if (arr) {
    for (var i = 0; i < arr.length; i++) {
      var o = arr[i];
      if (o.formField && o.otherField) {
        if (map.length > 0 && map.lastIndexOf(";") != (map.length - 1)) {
          map += ";";
        }
        map += o.formField + "=" + o.otherField;
      }
    }
  }
  return map;
}

function mapToJson(map) {
  var json = "[";
  if (map) {
    var arr = map.split(";");
    for (var i = 0; i < arr.length; i++) {
      if (i > 0) {
        json += ","
      }
      var o = arr[i].split("=");
      json += "{\"formField\":\"" + o[0] + "\",\"otherField\":\"" + o[1] + "\"}";
    }
  }
  json += "]";
  return json;
}

function fillIntNum(_this) {
  var pattern = /^([1-9])([\d]{0,7}|0)?$/;
  var val = _this.value;
  if (val != "" && !pattern.test(val)) {
    var v = val.replace(/\D+/g, '');
    _this.value = v;
  }
}