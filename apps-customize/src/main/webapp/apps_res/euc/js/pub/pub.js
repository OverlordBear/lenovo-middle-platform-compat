function openWin(url,title,winOK,winArgs,w,h){
	var win = $(window);
	
	var width = w ? w : win.width();
	var height = h ? h : win.height() * 0.95;
	
	if (w && w > 100) {
		 width = w;
	}
	
	if (h && h > 100) {
		 height = h;
	}

	if (w <= 1) {
		 width = win.width() * w;
	}
	
	if(h && h < 1){
		height = win.height() * h;
	}
	
	var defalut = {
	    "id" : "_eu_ctp_dialog_",
	    "url" : url,
	    "targetWindow" : getCtpTop(),
	    "width":width,
	    "height":height,
	    "transParams":winArgs,
	    "title":title,
	    "buttons":[{
	      "text":"确定",
	      "isEmphasize":true,
	      "handler" : function() {
	          if (typeof (winOK) !== 'undefined') {
	              winOK(dialog.getReturnValue(), dialog);
	          } else {
	              dialog.close();
	          }
	      }
	    },{
	      "text":"取消",
	      "handler" : function() {
	        if (typeof (winCancel) !== 'undefined') {
	          winCancel(dialog.getReturnValue(),dialog);
	        } else {
	          dialog.close();
	        }
	      }
	    }]
	};
	
	var options = defalut;
	if (winArgs) {
	  options = $.extend(defalut,winArgs);
  }
	
	var dialog = $.dialog(options);
}

/**
 * 关闭窗口
 */
function closeWin() {
	var dialog = null;
	var topWin = getCtpTop();
	if(topWin._officeWin){
		dialog = topWin._officeWin;
		topWin._officeWin = null;
	}
	
	if (window.parentDialogObj) {
		if(!dialog){
			dialog = window.parentDialogObj["_eu_ctp_dialog_id"];
		}
	}
	
	if (dialog) {
		try {
			dialog.close();
		} catch (e) {
		}
	}else{
		try {//刷新栏目
			if(window.opener && window.opener.getCtpTop() && window.opener.getCtpTop().main.sectionHandler && window.opener.getCtpTop().main.sectionHandler.reload) {
				window.opener.getCtpTop().main.sectionHandler.reload("pendingSection", true);
			}else if(window.opener && window.opener.getCtpTop().main 
					&& (window.opener.getCtpTop().main.location.href.indexOf("Agent")!=-1
				  ||window.opener.getCtpTop().main.location.href.indexOf("morePending")!=-1)){//刷新代理
				window.opener.getCtpTop().main.location.reload(true);
			}
			//关闭打开窗口
			if(topWin._officeWinW){
				topWin._officeWinW.opener = null;
				topWin._officeWinW.close();
			}else{
				parent.window.close();
				window.close();
			}
		} catch (e) {
		}
	}
}

//0-ok,1-error,2alert-感叹号,del3-删除,confirm-询问
function msgBox(msg,type,fn){
	var opt = {ok:0,error:1,alert:2,del:3,confirm:4};
	var _type = 0;
	if (type && opt[type] != undefined) {
		_type = opt[type];
	}
	var msbox = getA8Top().$.messageBox({
		'type' : 100,
		'msg' : msg,
		title:$.i18n('office.system.title.js'),
		imgType : _type,
		buttons : [ {
			id : 'btn1008',
			text : "确定",
			handler : fn
		} ]
	});
}

/**
 * 刷新列表页面
 * {page:pageId,args:args}
 */
function fnReloadPagePub(opt) {
	var main = getCtpTop().frames["main"];
	var targetWin = null;
	if (main) {
		targetWin = main;
		if (opt.page) {
			var index = opt.page.indexOf("Edit");
			if (index != -1 && ((index + 4) == opt.page.length)){
				var listWin = targetWin.frames[opt.page.substr(0, index)];
				if(listWin && listWin.frames[opt.page] 
					&& listWin.frames[opt.page].fnPageReload){
					listWin.frames[opt.page].fnPageReload();
				}
			}else if (targetWin.frames && targetWin.frames[opt.page]&& targetWin.frames[opt.page].fnPageReload) {//ie
				targetWin.frames[opt.page].fnPageReload(opt.args);
			}else if(targetWin.contentWindow && targetWin.contentWindow.frames[opt.page]&& targetWin.contentWindow.frames[opt.page].contentWindow.fnPageReload){//fireFox,google
				targetWin.contentWindow.frames[opt.page].contentWindow.fnPageReload(opt.args);
			}else if(targetWin.frames[opt.page]&& targetWin.frames[opt.page].contentWindow.fnPageReload){
				targetWin.frames[opt.page].contentWindow.fnPageReload(opt.args);
			}
		} else if (targetWin.fnPageReload) {
			targetWin.fnPageReload(opt.args);
		}
	}
}

/**
 * 隐藏左边导航
 */
function hideLeftNav() {
	if (getA8Top()) {
		if (getA8Top().hideLeftNavigation) {
			getA8Top().hideLeftNavigation();
		}
	}
}

/**
 * JS对象深度克隆对象
 */
function clonePub(obj) {
	var o = obj.constructor === Array ? [] : {};
	for ( var i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === "object" ? cloneObject(obj[i]) : obj[i];
		}
	}
	return o;
}

/**
 * 开启进度条
 */
function openProce(text) {
	try {
	  if(!text){
	    text = "请稍后..";
	  }
		getCtpTop().proce = $.progressBar({"text":text});
	} catch (e) {
	}
}


/**
 * 关闭滚动条
 */
function closeProce() {
	try {
		getCtpTop().proce.close();
		getCtpTop().proce = null;
	} catch (e) {
	}
}


/**
 * 获取URL参数指定的name的值
 */
function getURLParamPub(url,name) {
	var value = url.search.match(new RegExp("[?&]" + name
			+ "=([^&]*)(&?)", "i"));
	return value ? decodeURIComponent(value[1]) : value;
}

function setURLParamPub(name, value, url) {
	var newUrl = new String();
	var _url = url;
	if (_url.indexOf("?") != -1) {
		_url = _url.substr(_url.indexOf("?") + 1);
		if (_url.toLowerCase().indexOf(name.toLowerCase()) == -1) {
			newUrl = url + "&" + name + "=" + value;
			return newUrl;
		} else {
			var aParam = _url.split("&");
			for ( var i = 0; i < aParam.length; i++) {
				if (aParam[i].substr(0, aParam[i].indexOf("=")).toLowerCase() == name
						.toLowerCase()) {
					aParam[i] = aParam[i].substr(0, aParam[i].indexOf("=")) + "=" + value;
				}
			}
			newUrl = url.substr(0, url.indexOf("?") + 1) + aParam.join("&");
			return newUrl;
		}
	} else {
		_url += "?" + name + "=" + value;
		return _url
	}
}

/**
 * 新建option
 * @param items 对象数组[{value:xx,txt:xx},..]
 * <option value='value'>text</option>
 * @param 显示最大长度
 */
function fnNewOptionPub(items,option,fn) {
	var options = "";
	var opt = {
		maxLen : 35,
		hasNullOption : true,
		nullOptionValue : "-1",
		nullOptionText : "--"+$.i18n('office.asset.query.select.js')+"--"
	};
	
	var _opt = $.extend(true, opt, option);
	
	var onclick ='';
	if(fn){
		onclick = "onclick='"+fn+"(this);'";
	}
	
	if (_opt.hasNullOption) {
		options += "<option value='" + _opt.nullOptionValue + "' "+onclick+">" + _opt.nullOptionText + "</option>";
	}
	
	if(items && $.isArray(items)) {
		for ( var i = 0; i < items.length; i++) {
			var txt = items[i].text;
			if (txt == null) {
				txt = "";
			}
			options += "<option value='" + items[i].value + "' title='"+txt+"' "+onclick+">" 
			+ txt.getLimitLength(_opt.maxLen,'..') + "</option>";
		}
	}
	return options;
}

/**
 * @param $div radio的jquery对象
 * @param fdata 填写的数据
 */
function fnFillRadioPub($div, fdata) {
	$div.find(":radio").each(
		function() {
			if ((fdata[this.id] != null || fdata[this.name] != null)
					&& (fdata[this.id] == this.value || fdata[this.name] == this.value)
					&& !this.checked) {
				this.checked = true;
			}
	 });
}


/**
 * 人员卡片
 */
function memberCard(userId) {
	$.PeopleCard({
		targetWindow : getCtpTop(),
		memberId : userId
	});
}

/**
 * 字符串转换成日期对象
 */
function fnParseDatePub(str) {
	var date = new Date();
	try {
		if (str instanceof Date) {
			return str;
		} else {
			var year = 1900, month = 0, day = 1, hour = 0, minute = 0, second = 0, dateStrs = '', timeStrs = '';
			var tempStrs = str.split(" ");
			if (tempStrs.length >= 1 && tempStrs[0].length == 10) {
				dateStrs = tempStrs[0].split("-");
				year = parseInt(dateStrs[0], 10);
				month = parseInt(dateStrs[1], 10) - 1;
				day = parseInt(dateStrs[2], 10);
			}
			
			if (tempStrs.length >= 2 && (tempStrs[1].length == 5 || tempStrs[1].length == 8)) {
				timeStrs = tempStrs[1].split(":");
				hour = parseInt(timeStrs[0], 10);
				minute = parseInt(timeStrs[1], 10);
				if (tempStrs[1].length == 8) {
					second = parseInt(timeStrs[2], 10);
				}
			}
		}
		date = new Date(year, month, day, hour, minute, second);
	} catch (e) {
	}
	return date;
}

function  fnTabToggle(_this){
	var tgt = $(_this).attr("tgt");
	var src = $("#" + tgt).attr("src");
	$("#" + tgt).attr("src", src);
}

//将不存在的元素回填为""
function fillFormNull(data, useArea) {
  var inputs = useArea.find(":input");
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var id = input.attr("id");
    if(!data[id]){
      data[id] = "";
    }
  }
}

//主要是回填radio  checkbox  select
function fillForm(useArea, data) {
//  useArea.fillform(data);//回填
  var inputs = useArea.find(":input");
  for ( var i = 0; i < inputs.length; i++) {
    var input = $(inputs[i]);
    var id = input.attr("id");
    if (id && data[id]) {
      input.val(data[id]);
    }
  }
  
  var radios = useArea.find(":input[type=radio]");
  for ( var i = 0; i < radios.length; i++) {
    var radio = radios[i];
    var name = radio.name;
    if (name && data[name] && radio.value == data[name]) {
      radio.checked = true;
    }
  }
  var checkboxs = useArea.find(":input[type=checkbox]");
  for ( var i = 0; i < checkboxs.length; i++) {
    var checkbox = checkboxs[i];
    checkbox.checked = false;
    var name = checkbox.name;
    if (name && data[name]) {
      var datas = data[name];
      if(datas!="" &&  typeof datas == "string"){
        datas = $.parseJSON(datas);
      }
      for (var j = 0; j < datas.length; j++) {
        if (datas[j] == checkbox.value) {
          checkbox.checked = true;
        }
      }
    }
  }
}

function getForm(useArea) {
  var data = useArea.formobj();
  var radios = useArea.find(":input[type=radio]");
  for ( var i = 0; i < radios.length; i++) {
    var radio = radios[i];
    var name = radio.name;
    if (name && radio.checked) {
      data[name] = radio.value;
    }
  }
  
  var checkboxs = useArea.find(":input[type=checkbox]");
  for ( var i = 0; i < checkboxs.length; i++) {
    var checkbox = checkboxs[i];
    var name = checkbox.name;
    if (name && checkbox.checked) {
      if (!data[name]) {
        data[name] = [];
      }
      data[name].push(checkbox.value);
    }
  }
  return data;
}

//提交到ctrl
function submit(url,param){
  $("body").jsonSubmit({
    action : url,
    paramObj:param,
    callback: function(rval) {
    }
  });
}