// gjx核心思路：重写系统原生的 $.alert，精准拦截那个讨厌的提示
(function () {
    // 检查当前环境是否已经准备好了 $ 和 $.alert
    if (typeof $ !== 'undefined' && typeof $.alert === 'function') {
        
        // 保存原生的 $.alert 方法
        var originalAlert = $.alert;
        
        // 覆盖为我们的代理方法
        $.alert = function (msg) {
            // 如果弹窗内容包含“不支持操作”，直接静默拦截
            if (msg && typeof msg === 'string' && msg.indexOf("不支持操作") !== -1 && msg.indexOf("类型文件") !== -1) {
                console.log("【客制化拦截】靶点命中！已成功屏蔽不支持弹窗！");
                return;
            }
            // 否则，正常弹出其他系统提示
            return originalAlert.apply(this, arguments);
        };
        
        console.log("【客制化拦截】$.alert 代理挂载成功，等待猎物出现！");
        
    } else {
        // 如果打印了这句话，说明你的 JS 执行得太早了，或者当前页面没有 $
        console.error("【客制化拦截异常】当前环境还未加载 $ 或 $.alert，无法挂载拦截器！");
    }
})();



var _edocTaohongHandler;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var edocObj = {};
edocObj._obj = "";
edocObj.docMark = "";
edocObj.innerMark = "";
edocObj.docMark2 = "";
edocObj._processId = null;
edocObj.currentUserId = "";
edocObj.affairId = "";
edocObj.theForm = null;
edocObj.state = "";
edocObj.edocType = ""; //遍历页面中span中属性xd:binding，放到js的hashtable中，便于以后读取

var opinionSpans = null; //记录是否进行了正文修改

var contentUpdate = false;
var supervised = false;
var canUpdateContent = true; //正文是否允许修改

var hasTaohong = false; //套红记录

var changeWord = false; //正文修改，主要用于区别套红 签章操作与修改正文

var changeSignature = false; //签章
//全局变量，公文单是否修改标志

var isUpdateEdocForm = false;
/* 是否为下拉提示，默认为不是，用于修改文号处,控制wordNoChange()方法多次调用 */

var isEdocLike = false;

try {
  if (getA8Top() != null && typeof getA8Top().showLocation != "undefined") {
    getA8Top().endProc();
  }
} catch (e) {}

function setMenuState(menu_id) {
  var menuDiv = document.getElementById(menu_id);

  if (menuDiv != null) {
    menuDiv.className = 'webfx-menu--button-sel';
    menuDiv.firstChild.className = "webfx-menu--button-content-sel";
    menuDiv.onmouseover = "";
    menuDiv.onmouseout = "";
  }
}

function addReplySenderOpinion() {
  initHtmlReplyOpinion = document.getElementById("replyDivsenderOpinion").innerHTML;
  document.getElementById("replyDivsenderOpinion").style.display = "block";
  var theForm = document.getElementsByName("repform")[0];
  theForm.postscriptContent.focus();
}

function replyCommentOK(date) {
  parent.parent.parent.location.href = parent.parent.parent.location.href;
  /*
   var theForm = document.getElementsByName("repform")[0];
  
  
     var str = "";
     str += '<div class="div-float-clear" style="width: 100%">';
     str += '  <div class="sendOptionWriterName">' + date + '</div>';
     str += '  <div class="optionContent wordbreak">' + theForm.postscriptContent.value + '</div>';
  
     if(!fileUploadAttachments.isEmpty()){
       var atts = fileUploadAttachments.values();
       str += '  <div class="div-float attsContent">';
       str += '    <div class="atts-label">' + attachmentLabel + ' :&nbsp;&nbsp;</div>';
  
       for(var i = 0; i < atts.size(); i++) {
         str += atts.get(i).toString(true, false);
       }
  
       str += '  </div>';
     }
     str += '</div>';
  
     document.getElementById("replyDivsenderOpinionDIV").innerHTML += str;
     document.getElementById("replyDivsenderOpinion").innerHTML=initHtmlReplyOpinion;
     document.getElementById("replyDivsenderOpinion").style.display = "none";
  
   fileUploadAttachments.clear();
   */
}
/**
 * 流程节点处理明细,直接调用协同的方法
 */


function showFlowNodeDetail() {
  var rv = getA8Top().v3x.openWindow({
    url: colWorkFlowURL + "?method=showFlowNodeDetailFrame&summaryId=" + summary_id + "&appName=4&appTypeName=" + NPSAppName,
    dialogType: v3x.getBrowserFlag('openWindow') == true ? "modal" : "1",
    width: "800",
    height: "600"
  });
}

function getIEVersion() {
  var version = navigator.userAgent;

  if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
    return 6;
  }

  if (navigator.userAgent.indexOf("MSIE 7.0") > 0) {
    return 7;
  }

  if (navigator.userAgent.indexOf("MSIE 8.0") > 0) {
    return 8;
  }

  if (navigator.userAgent.indexOf("MSIE 9.0") > 0) {
    return 9;
  }

  return 10;
} //打印autocomplete文号


function printAutoCompleteEdocMark() {
  var printWindowsV = window.contentIframe;

  if (!printWindowsV) {
    printWindowsV = parent.detailMainFrame.contentIframe;
  } //当IE8以上浏览器时，才需要以下操作


  var doc_mark_autocomplete = printWindowsV.document.getElementById("my:doc_mark_autocomplete");
  var doc_mark2_autocomplete = printWindowsV.document.getElementById("my:doc_mark2_autocomplete");
  var serial_no_autocomplete = printWindowsV.document.getElementById("my:serial_no_autocomplete");
  var doc_mark = printWindowsV.document.getElementById("my:doc_mark");
  var doc_mark2 = printWindowsV.document.getElementById("my:doc_mark2");
  var serial_no = printWindowsV.document.getElementById("my:serial_no");

  if (getIEVersion() > 8) {
    if (doc_mark_autocomplete && doc_mark.value != "") {
      var $doc_mark_autocomplete = $(doc_mark_autocomplete);
      var doc_mark_autocomplete_css = $doc_mark_autocomplete.attr("style");

      if ("string" != typeof doc_mark_autocomplete_css) {
        doc_mark_autocomplete_css = doc_mark_autocomplete.style.cssText; //OA-66161 360浏览器返回的是对象
      }

      $doc_mark_autocomplete.after("<span id='my:doc_markSpan' class='xdTextBox' style='" + doc_mark_autocomplete_css + ";height:auto;'>" + $doc_mark_autocomplete.val() + "</span>");
      $doc_mark_autocomplete.css("display", "none");
    }

    if (doc_mark2_autocomplete && doc_mark2.value != "") {
      var $doc_mark_autocomplete = $(doc_mark2_autocomplete);
      var doc_mark_autocomplete_css = $doc_mark_autocomplete.attr("style");

      if ("string" != typeof doc_mark_autocomplete_css) {
        doc_mark_autocomplete_css = doc_mark2_autocomplete.style.cssText; //OA-66161 360浏览器返回的是对象
      }

      $doc_mark2_autocomplete.after("<span id='my:doc_mark2Span' class='xdTextBox' style='" + doc_mark_autocomplete_css + ";height:auto;'>" + $doc_mark2_autocomplete.val() + "</span>");
      $doc_mark2_autocomplete.css("display", "none");
    }

    if (serial_no_autocomplete && serial_no.value != "") {
      var $serial_no_autocomplete = $(serial_no_autocomplete);
      var doc_mark_autocomplete_css = $serial_no_autocomplete.attr("style");

      if ("string" != typeof doc_mark_autocomplete_css) {
        doc_mark_autocomplete_css = serial_no_autocomplete.style.cssText; //OA-66161 360浏览器返回的是对象
      }

      $serial_no_autocomplete.after("<span id='my:serial_noSpan' class='xdTextBox' style='" + doc_mark_autocomplete_css + ";height:auto;'>" + $serial_no_autocomplete.val() + "</span>");
      $serial_no_autocomplete.css("display", "none");
    }
  } //当没有选择文号时，必须要做特殊处理，不然打印时会显示autocomplete="off"


  var dataAttr = [];

  if (doc_mark && doc_mark.value == "" && doc_mark_autocomplete) {
    doc_mark_autocomplete.value = "";
  }

  if (doc_mark2 && doc_mark2.value == "" && doc_mark2_autocomplete) {
    doc_mark2_autocomplete.value = "";
  }

  if (serial_no && serial_no.value == "" && serial_no_autocomplete) {
    serial_no_autocomplete.value = "";
  }

  if (doc_mark) {
    $("img", $(doc_mark).parent()).css("display", "none");
    $("button", $(doc_mark).parent()).css("display", "none");
    $(doc_mark).removeAttr("onpropertychange");
  }

  if (doc_mark2) {
    $("img", $(doc_mark2).parent()).css("display", "none");
    $("button", $(doc_mark2).parent()).css("display", "none");
    $(doc_mark2).removeAttr("onpropertychange");
  }

  if (serial_no) {
    $("img", $(serial_no).parent()).css("display", "none");
    $("button", $(serial_no).parent()).css("display", "none");
    $(serial_no).removeAttr("onpropertychange");
  }
}

function clearAutoCompleteEdocMarkSpan() {
  var printWindowsV = window.contentIframe;

  if (!printWindowsV) {
    printWindowsV = parent.detailMainFrame.contentIframe;
  }

  if (getIEVersion() > 8) {
    //恢复autocomplete的显示，将span删掉
    var doc_markSpan = printWindowsV.document.getElementById("my:doc_markSpan");

    if (doc_markSpan) {
      var doc_mark_autocomplete = printWindowsV.document.getElementById("my:doc_mark_autocomplete");
      $(doc_mark_autocomplete).css("display", "");
      $(doc_markSpan).remove();
    }

    var doc_mark2Span = printWindowsV.document.getElementById("my:doc_mark2Span");

    if (doc_mark2Span) {
      var doc_mark2_autocomplete = printWindowsV.document.getElementById("my:doc_mark2_autocomplete");
      $(doc_mark2_autocomplete).css("display", "");
      $(doc_mark2Span).remove();
    }

    var serial_noSpan = printWindowsV.document.getElementById("my:serial_noSpan");

    if (serial_noSpan) {
      var serial_no_autocomplete = printWindowsV.document.getElementById("my:serial_no_autocomplete");
      $(serial_no_autocomplete).css("display", "");
      $(serial_noSpan).remove();
    }
  }

  var doc_mark = printWindowsV.document.getElementById("my:doc_mark");

  if (doc_mark) {
    $("img", $(doc_mark).parent()).css("display", "");
    $("button", $(doc_mark).parent()).css("display", "");
    $(doc_mark).attr("onpropertychange", "edocMarkValueChange(this)");
  }

  var doc_mark2 = printWindowsV.document.getElementById("my:doc_mark2");

  if (doc_mark2) {
    $("img", $(doc_mark2).parent()).css("display", "");
    $("button", $(doc_mark2).parent()).css("display", "");
    $(doc_mark2).attr("onpropertychange", "edocMarkValueChange(this)");
  }

  var serial_no = printWindowsV.document.getElementById("my:serial_no");

  if (serial_no) {
    $("img", $(serial_no).parent()).css("display", "");
    $("button", $(serial_no).parent()).css("display", "");
    $(serial_no).attr("onpropertychange", "edocMarkValueChange(this)");
  }
}
/**
 * 打印时，如果文单有背景颜色且input元素写定义了宽度为固定值，切换到打印页面是为一条空白线
 * @param changeInputs 对象
 * @param doc 文档对象
 */


function fixBlankInputWidthWhenPrint(doc) {
  if (!doc) {
    return null;
  }

  var myInputs = doc.getElementsByTagName("input");
  var changeInputs = {};

  if (myInputs) {
    for (var i = 0; i < myInputs.length; i++) {
      var myInput = myInputs[i];

      if ((!myInput.type || myInput.type == "text") && myInput.id && myInput.id.indexOf("my:") != -1 && myInput.value == "") {
        //&& myInput.style.width &&
        //(myInput.style.width + "").indexOf("px") != -1){
        var tempObj = {};
        tempObj.ele = myInput;

        if (myInput.style.backgroundColor) {
          tempObj.backgroundColor = myInput.style.backgroundColor;
        }

        changeInputs[myInput.id] = tempObj;
        myInput.style.backgroundColor = "transparent"; //设置背景透明
      }
    }
  }

  return changeInputs;
} //刷新input/select域值


function refreshFormData(parent) {
  var $parent = $(parent);
  var $selects = $("select", $parent);

  if ($selects && $selects.length > 0) {
    for (var i = 0, len = $selects.length; i < len; i++) {
      var select = $selects[i];
      var options = select.options;

      if (options && options.length > 0) {
        for (var j = 0, len2 = options.length; j < len2; j++) {
          var o = options[j];

          if (o.selected) {
            o.setAttribute("selected", "selected");
            break;
          }
        }
      }
    }
  }

  var $inputs = $("input", $parent);

  if ($inputs && $inputs.length > 0) {
    for (var i = 0, len = $inputs.length; i < len; i++) {
      var input = $inputs[i];

      if (input.type == "text") {
        input.setAttribute("value", input.value);
      }
    }
  }
}

; //打印

function colPrint() {
  if (window.contentIframe && window.contentIframe.document) {
    $(".zhutici", window.contentIframe.document).hide();
  }

  try {
    //因采用autocomplete组件，这里打印时，要显示出选择的公文文号，需要将autocomplete中选择的值设置到一个新创建的span中，然后将autocomplete隐藏掉
    printAutoCompleteEdocMark();
    var printEdocBody = v3x.getMessage("edocLang.edoc_form"); //打印不需要title标示，避免特殊字符导致乱码 OA-50736

    if (window.contentIframe && window.contentIframe.document && contentIframe.document.getElementById("my:subject")) {
      contentIframe.document.getElementById("my:subject").title = "";
    } else if (parent.detailMainFrame && parent.detailMainFrame.contentIframe) {
      parent.detailMainFrame.contentIframe.document.getElementById("my:subject").title = "";
    }

    var edocBody = "";
    var changeInputs = null; //保存textarea计算后的高度

    var htmlEle = null; //OA-21166  公文督办，点击一条公文，显示在页面下方，然后点击打印，打印页面中文单没有显示。只有打印预览之类的几个按钮。

    if (parent.detailMainFrame && parent.detailMainFrame.contentIframe) {
      //打印时，如果文单有背景颜色且input元素写定义了宽度为固定值，切换到打印页面是为一条空白线
      changeInputs = fixBlankInputWidthWhenPrint(parent.detailMainFrame.contentIframe.document);
      htmlEle = parent.detailMainFrame.contentIframe.document.getElementById("html");
    } //在督办详细信息中 点打印时，要通过下面的方式才能获得文单信息
    else {
      //打印时，如果文单有背景颜色且input元素写定义了宽度为固定值，切换到打印页面是为一条空白线
      changeInputs = fixBlankInputWidthWhenPrint(parent.detailMainFrame.contentIframe.document);
      htmlEle = contentIframe.document.getElementById("html");
    } //重新设置select/input的值， innerHTML获取不到


    refreshFormData(htmlEle);
    edocBody = htmlEle.innerHTML;
    var srcStr1 = /selSendUnit.gif\"/g;
    var srcStr2 = /selSendUnit.gif/g;
    var disSrcStr1 = "selSendUnit.gif\"  style=\"display:none\"";
    var disSrcStr2 = "selSendUnit.gif  style=display:none";

    if (edocBody.indexOf("selSendUnit.gif\"") > -1) {
      edocBody = edocBody.replace(srcStr1, disSrcStr1);
    } else {
      edocBody = edocBody.replace(srcStr2, disSrcStr2);
    } //打印隐藏主送和抄送单位选择图标


    var imgSrcStr1 = /wordnochange.gif\"/g;
    var imgSrcStr2 = /wordnochange.gif/g;
    var imgDisSrcStr1 = "wordnochange.gif\"  style=\"display:none\"";
    var imgDisSrcStr2 = "wordnochange.gif  style=display:none";

    if (edocBody.indexOf("wordnochange.gif\"") > -1) {
      edocBody = edocBody.replace(imgSrcStr1, imgDisSrcStr1);
    } else {
      edocBody = edocBody.replace(imgSrcStr2, imgDisSrcStr2);
    } //还原修改宽度的元素


    if (changeInputs) {
      for (var key in changeInputs) {
        var tempEle = changeInputs[key]; //tempEle["ele"].style.width = tempEle["width"];

        if (tempEle["backgroundColor"]) {
          tempEle["ele"].style.backgroundColor = tempEle["backgroundColor"];
        } else {
          tempEle["ele"].style.backgroundColor = "";
        }
      }
    } //OA-50364 打印公共文单，文单标题显示不全！
    //是否为IE11


    if (navigator.userAgent.indexOf("rv:11") > -1) {
      edocBody = "<br>" + edocBody;
    } //OA-31924 lixsh处理公文时点击打印，打印页面仍有意见框显示，可以选择态度，不可插入附件和常用语
    //去掉意见框，态度，插入附件和常用语


    var isOtherOp = 0,
        np,
        contentOP;

    try {
      np = contentIframe.document.getElementById("notPrint").innerHTML;
      var opEle = contentIframe.document.getElementById("contentOP");
      contentOP = opEle.value;
      var proAtt1 = contentIframe.document.getElementById("processatt1").outerHTML;
      var proAtt2 = contentIframe.document.getElementById("processatt2").outerHTML;
      contentOP = contentOP.replace(/\r\n|\n/gm, '<br/>').replace(/\s/gm, '&nbsp;');
      var tOpEleStyle = opEle.getAttribute("style");

      if (tOpEleStyle && "string" != typeof tOpEleStyle) {
        tOpEleStyle = opEle.style.cssText; //IE8 返回的是对象
      }

      contentOP = "<div class='xdTextBox' style='" + tOpEleStyle + ";width:98%;'>" + contentOP + "</div>" + proAtt1 + proAtt2; //如果文单没有绑定意见，那么意见显示在文单之外，在最下面，那么将isOtherOp = 1

      if (!(/id="notPrint"/.test(edocBody) || /id=notPrint/.test(edocBody))) isOtherOp = 1; //没有绑定意见，在最下面显示
      else {
        edocBody = edocBody.replace(np, contentOP);
      }
    } catch (e) {} //某些Input设置了white-space: nowrap，导致了打印时不能换行


    var whiteSpaceRegExp = /<input(.+?)style[ ]*?=[ ]*?(['"]{1})(.*?)\2(.*?)>/ig;
    edocBody = edocBody.replace(whiteSpaceRegExp, "<input$1style=$2$3;white-space:normal;height:auto;$2$4>");
    var re = /disabled/g;
    edocBody = edocBody.replace(re, " READONLY=\"READONLY\"");
    re = /INPUT/g;
    edocBody = edocBody.replace(re, "INPUT style=\"border:0\"");
    var a = edocBody.split("</SELECT>");
    var result = "";

    for (var i = 0; i < a.length; i++) {
      var aa = a[i]; //var b = aa.substring(aa.indexOf("<SELECT"),aa.length+9);
      //var bb = b.substring(b.indexOf("selected>")+9,b.length);
      //var c = bb.substring(0,bb.indexOf("</OPTION>"));

      var n = "";

      if (aa.indexOf("<SELECT") != -1) {
        n = aa.replace("<SELECT", "<SELECT style=\"border:0;\"") + "</SELECT>";
      } else {
        n = aa;
      }

      result += n;
    } //xiangfan 添加


    re = /请选择公文文号/g;
    result = result.replace(re, "");
    re = /请选择内部文号/g;
    result = result.replace(re, ""); //替换多行文本的回车,以及空格符号，让打印预览的页面的多行文本也有回车换行及空格的效果
    //OA-48805	text元素，输入的是换行的内容，打印处理的不是换行的，变成一行了

    var textAreas = result.split(/<\/textarea>/gi);
    var styleRex = /style="(.*?)"/i;

    for (var i = 0; i < textAreas.length; i++) {
      var index = textAreas[i].indexOf("<textarea");
      var index_2 = textAreas[i].indexOf("<TEXTAREA"); //indexOf不能用正则，所以分开大小写

      var subIndex = -1;

      if (index != -1) {
        subIndex = index;
      } else if (index_2 != -1) {
        subIndex = index_2;
      }

      if (subIndex != -1) {
        var textArea = textAreas[i].substring(subIndex);
        var ind = textArea.lastIndexOf(">");
        var textAreaInnerHtml = textArea.substring(ind);

        if (textAreaInnerHtml != ">") {
          var textAreaResult = textAreaInnerHtml.replace(/\r\n|\n/gm, '<br/>').replace(/\s/gm, '&nbsp;');
          var alignValue = "";

          if (textArea.indexOf("text-align") == -1) {
            alignValue = alignValue + " align=\"left\" ";
          }

          if (textArea.indexOf("class=") == -1) {
            alignValue = alignValue + " class=\"xdTextBox\" ";
          } //高度设置


          var attrStr = textArea.substring(0, ind);

          if (styleRex.test(attrStr)) {
            attrStr = attrStr.replace(styleRex, "style=\"$1;height:auto\"");
          } else {
            alignValue += " style=\"height:auto\"";
          }

          result = result.replace(textArea, attrStr + alignValue + textAreaResult);
        }
      }
    }

    var styleStr = result.split("style=\"");
    var newResult = styleStr[0];

    for (var i = 1; i < styleStr.length; i++) {
      var a = styleStr[i];
      var inde = a.indexOf("\"");
      var style = a.substring(0, inde);
      a = "style=\"" + a;

      if (a.indexOf("name") != -1) {
        a = "align=\"left\" " + a; //xiangfan 添加 修复GOV-4690
      }

      newResult += a;
    }

    result = newResult; //textarea改成div

    result = result.replace(new RegExp("textarea", 'igm'), 'div'); //39413 打印出来的控件内的内容为黑色。

    result = result.replace(/link-blue/gm, '');
    $('.AAAAAA').each(function () {
      $(this)[0].style.display = "none";
    }); //32718 处理意见过长，公文单打印异常。

    result = result.replace(/<span[^<]*?showV3XMemberCard[^<]*?>([\s\S]*?)<\/span>/ig, "$1");
    var flag = false,
        tags = ["SPAN"];

    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];

      if (!flag) {
        var a = result;
        var index = -1;

        while ((index = a.indexOf("<" + tag)) != -1) {
          flag = true;
          a = a.substring(index + 1);
          var index2 = a.indexOf(">");
          var span = a.substring(0, index2);

          if (span.indexOf("shenpi") != -1 || span.indexOf("niwen") != -1 || span.indexOf("shenhe") != -1 || span.indexOf("fuhe") != -1 || span.indexOf("fengfa") != -1 || span.indexOf("huiqian") != -1 || span.indexOf("qianfa") != -1 || span.indexOf("zhihui") != -1 || span.indexOf("yuedu") != -1 || span.indexOf("banli") != -1 || span.indexOf("dengji") != -1 || span.indexOf("niban") != -1 || span.indexOf("keyword") != -1 || span.indexOf("wenshuguanli") != -1 || span.indexOf("chengban") != -1 || span.indexOf("otherOpinion") != -1 || span.indexOf("opinion") != -1) {
            var endIndex = -1,
                spanLevel = 0;

            while (endIndex == -1) {
              var index3 = a.indexOf("<" + tag, index2);
              var index4 = a.indexOf("</" + tag + ">", index2);

              if (index3 == -1) {
                endIndex = index4;
              } else if (index3 > index4) {
                if (spanLevel == 0) {
                  endIndex = index4;
                } else {
                  spanLevel = spanLevel - 1;
                  index2 = index4 + 1;
                }
              } else {
                //中间有包含关系
                index2 = index3 + 1;
                spanLevel = spanLevel + 1;
              }
            }

            var oldSapn = "<" + a.substring(0, endIndex);
            a = a.substring(endIndex + tag.length + 3);
            var aft = oldSapn.replace("<" + tag, "<DIV") + "</DIV>";
            result = result.replace(oldSapn, aft);
          }
        }
      }
    } //去掉ie9下黑框


    var tempRegExp = /class="xdLayout"/ig;
    result = result.replace(tempRegExp, "class=\"xdLayout xdLayout2\""); //修改select框样式

    result = result.replace(/class=\"xdComboBox xdBehavior_Select\"/g, "class=\"xdTextBox\""); //该种字体打印有乱码

    result = result.replace(/仿宋_GB2312/ig, "仿宋"); //本次还原，打印时不再替换

    /*
      if(isOtherOp == 1){
          var senderOp = contentIframe.document.getElementById("printSenderOpinionsTable").innerHTML;
        result += senderOp;
        var opContent = contentIframe.document.getElementById("printOtherOpinionsTable").innerHTML;
        opContent = opContent.replace(np,contentOP);
        result += opContent;
      }*/

    var edocBodyFrag = new PrintFragment(printEdocBody, result);
  } catch (e) {}

  var cssList = new ArrayList();
  var pl = new ArrayList();
  pl.add(edocBodyFrag);
  var setHidden = false;
  var hiddenReplay = false;

  try {
    //增加发起人意见,处理意见打印
    var contentDoc = parent.detailMainFrame.contentIframe.document;
    var sendOpinionTitleObj = contentDoc.getElementById("sendOpinionTitle");
    var repDiv = contentDoc.getElementById("replyDivsenderOpinion");

    if (repDiv != null && repDiv.style.display == "block") {
      repDiv.style.display = "none";
      hiddenReplay = true;
    }

    if (contentDoc.getElementById("addSenderOpinionDiv") != null) {
      setHidden = true;
      contentDoc.getElementById("addSenderOpinionDiv").style.visibility = "hidden";
    }

    if (sendOpinionTitleObj != null) {
      var sendOpinionTitleFrag = new PrintFragment(sendOpinionTitleObj.innerHTML, contentDoc.getElementById("printSenderOpinionsTable").outerHTML);
      pl.add(sendOpinionTitleFrag);
    }

    var dealOpinionTitleObj = contentDoc.getElementById("dealOpinionTitle");

    if (sendOpinionTitleObj != null) {
      //OA-31924  lixsh处理公文时点击打印，打印页面仍有意见框显示，可以选择态度，不可插入附件和常用语
      var printOtherOp = contentDoc.getElementById("printOtherOpinionsTable").outerHTML;

      if (isOtherOp == 1) {
        np = contentIframe.document.getElementById("notPrint").innerHTML;
        contentOP = contentIframe.document.getElementById("contentOP").value;
        var proAtt1 = contentIframe.document.getElementById("processatt1").outerHTML;
        var proAtt2 = contentIframe.document.getElementById("processatt2").outerHTML;
        contentOP = contentOP.replace(/\r\n|\n/gm, '<br/>').replace(/\s/gm, '&nbsp;');
        contentOP = "<div class='xdTextBox' style='width:98%;'>" + contentOP + "</div>" + proAtt1 + proAtt2 + '<br/>';
        printOtherOp = printOtherOp.replace(np, contentOP);
      }

      var dealOpinionTitleFrag = new PrintFragment(dealOpinionTitleObj.innerHTML, printOtherOp);
      pl.add(dealOpinionTitleFrag);
    }

    $(".zhutici", window.contentIframe.document).show();
  } catch (e) {}

  cssList.add(v3x.baseURL + "/apps_res/form/css/SeeyonForm.css");
  cssList.add(v3x.baseURL + "/apps_res/edoc/css/edoc.css"); //打印组件引入两个样式，保证文单打印效果

  cssList.add(v3x.baseURL + "/common/all-min.css");
  cssList.add(v3x.baseURL + "/common/RTE/editor/css/fck_editorarea4Show.css");
  cssList.add(v3x.baseURL + "/common/css/default.css");
  cssList.add(v3x.baseURL + "/apps_res/edoc/css/edocDisplay.css");
  cssList.add(v3x.baseURL + "/apps_res/edoc/css/edocPrintDisplay.css");

  if (v3x.isMSIE9) {
    cssList.add(v3x.baseURL + "/apps_res/edoc/css/edocPrintBorder_IE9.css");
  }

  printList(pl, cssList);

  try {
    if (setHidden) {
      contentDoc.getElementById("addSenderOpinionDiv").style.visibility = "inherit";
    }

    if (hiddenReplay) {
      contentDoc.getElementById("replyDivsenderOpinion").style.display = "block";
    }
  } catch (e) {} //打印文号后，还原文单中文号


  clearAutoCompleteEdocMarkSpan();
}

function compareTime(selObj) {
  var newCollForm = document.getElementsByName("sendForm")[0];
  var advanceRemind = newCollForm.advanceRemind.options[newCollForm.advanceRemind.selectedIndex];
  var deadline = newCollForm.deadline.options[newCollForm.deadline.selectedIndex];
  var advanceRemindTime = new Number(advanceRemind.value);
  var deadLineTime = new Number(deadline.value); // 目前ctp_enum_item表中 提醒默认为无 值改为0了，因此要排除都为0的情况

  if (deadLineTime == 0 && advanceRemindTime == 0) return;

  if (deadLineTime <= advanceRemindTime) {
    var mycal = $("#deadLineDateTimeInput"); //发送的时候需要重新验证流程期限

    if (typeof mycal.val() != "undefined") {
      if (mycal.val() != "" && advanceRemindTime != 0 && getDateTimeValue(advanceRemindTime) >= mycal.val()) {
        // 未设置流程期限或流程期限小于,等于提前提醒时间
        alert(v3x.getMessage("edocLang.remindTimeLessThanDeadLine"));
        return false;
      }
    } else {
      alert(v3x.getMessage("edocLang.remindTimeLessThanDeadLine"));

      try {
        selObj.selectedIndex = 0;
      } catch (e) {}

      return false;
    }
  }

  return true;
}
/**
 *获取指定分钟数后的日期
 *sc 单位分钟
 */


function getDateTimeValue(sc) {
  // 参数表示在当前日期下要增加的天数
  var now = new Date();

  if (sc) {
    switch (sc) {
      case '5':
      case '10':
      case '15':
      case '30':
      case '60':
      case '120':
      case '180':
      case '240':
      case '300':
      case '360':
      case '420':
      case '480':
      case '720':
      case '1440':
      case '2880':
      case '4320':
      case '5760':
      case '7200':
      case '8640':
      case '10080':
      case '14400':
      case '20160':
      case '21600':
      case '30240':
      case '43200':
      case '86400':
      case '129600':
        return ajaxCalcuteWorkDatetime(sc);
        break;

      default:
        return new Date(now).format("yyyy-MM-dd HH:mm");
    }
  } //2014-03-20 01:10 返回值格式

}

function ajaxCalcuteWorkDatetime(minutes) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "calculateWorkDatetime", false);
  requestCaller.addParameter(1, "String", minutes);
  return requestCaller.serviceRequest();
} //按自然时间计算


function ajaxCalcuteNatureDatetime(datetime, minutes) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "ajaxCalcuteNatureDatetime", false);
  requestCaller.addParameter(1, "String", datetime);
  requestCaller.addParameter(2, "Long", minutes);
  return requestCaller.serviceRequest();
} //added by lius. 得到国际化字符串的简易表达，�?_("i18n key")
//_ = v3x.getMessage;

/**
 * 按map中的内容当成数据提交
 * 注意:javascript调用时最好用return false,以免默认的Form也被提交
 * target默认是_self,method默认是post
 */


function submitMap(map, action, target, method) {
  var form = document.createElement("form");
  form.setAttribute('method', method ? method : 'post');
  form.setAttribute('action', action);
  form.setAttribute('target', target ? target : '');
  document.body.appendChild(form);

  for (var item in map) {
    //自定义元素的
    if (_typeof(map[item]) == "object" && "toFields" in map[item]) {
      var fields = map[item].toFields(); //need jquery support

      $(form).append(fields);
    } else if (!(map[item] instanceof Array)) {
      var value = map[item];
      var field = document.createElement('input');
      field.setAttribute('type', 'hidden');
      field.setAttribute('name', item);
      field.setAttribute('value', value);
      form.appendChild(field);
    } else {
      var arr = map[item];

      for (var i = 0; i < arr.length; i++) {
        var value = arr[i];
        var field = document.createElement('input');
        field.setAttribute('type', 'hidden');
        field.setAttribute('name', item);
        field.setAttribute('value', value);
        form.appendChild(field);
      }
    }
  }

  try {
    var tempInput = document.createElement('INPUT');
    tempInput.setAttribute('type', 'hidden');
    tempInput.setAttribute('name', 'appName');
    tempInput.setAttribute('value', '4');
    form.appendChild(tempInput);
    var edocType = document.getElementById('theform')['edocType'].value;
    var tempInput2 = document.createElement('INPUT');
    tempInput2.setAttribute('type', 'hidden');
    tempInput2.setAttribute('name', 'edocType');
    tempInput2.setAttribute('value', edocType);
    form.appendChild(tempInput2);
  } catch (e) {}

  form.submit();
}

function map2params(map) {
  var container = [];

  for (var item in map) {
    if (!(map[item] instanceof Array)) {
      var value = map[item];
      var str = item + "=" + escape(value);
      container[container.length] = str;
    } else {
      var arr = map[item];

      for (var index in arr) {
        var value = arr[index];
        var str = item + "=" + escape(value);
        container[container.length] = str;
      }
    }
  }

  var result = container.join("&");
  return result;
}

var hasWorkflow = false; //var workitemSelected = [];
//isFromTemplate
//通过ajax加载了模板的选人界面，并手工选了人。

var loadAndManualSelectedPreSend = false;
var isAllMember = true;
var isCheckNodePolicyFlag = false; //Ajax判断文号定义是否被删除，并且判断内部文号是否已经存在

function checkMarkDefinitionExsit(definitionId, doc_mark, num, selectMode, summaryId) {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkEdocMark", false);
    requestCaller.addParameter(1, "Long", definitionId);
    requestCaller.addParameter(2, 'String', doc_mark);
    requestCaller.addParameter(3, 'Integer', selectMode);
    requestCaller.addParameter(4, 'String', summaryId);
    var rs = requestCaller.serviceRequest(); //rs:0,0 (返回以,连接的两个整数)   （0：已删除文号定义 1：未删除文号定义）|(0:未使用内部文号 | 1：已使用该内部文号)

    var ret = rs.split(",");

    if (ret[0] == "0") {
      //已经被删除
      if (num == 1) {
        alert(_("edocLang.doc_mark_definition_alter_deleted"));
      } else if (num == 2) {
        alert(_("edocLang.doc_innermark_definition_alter_deleted"));
      }

      return false;
    }

    if (num == 2) {
      //内部文号
      if (ret[1] == "1") {
        //内部文号已经存在
        //GOV-4927 公文管理，发文内部文号重复时，提示错误！
        var type = 0;

        if (document.getElementById("edocType_mark")) {
          if (document.getElementById("edocType_mark").value == 1) {
            type = 1;
          }
        }

        if (type == 0) {
          alert(_("mark.serialno.used.alert"));
        } else {
          alert(_("edocLang.doc_innermark_used"));
        }

        return false;
      }
    }

    return true;
  } catch (ex1) {
    alert("Exception : " + ex1);
    return false;
  }
} //检查文号是否是格式良好的。


function isEdocMarkWellFormated(edocmark) {
  var re = /['@#￥%"\\]/;
  var arr = edocmark.split("\|");

  if (re.test(edocmark) || !(arr.length == 4 || arr.length == 1)) {
    //直接登记的时候是1
    alert(_("edocLang.edoc_mark_isnotwellformated"));
    return false;
  }

  return true;
}

function checkMarkDefinition(theForm) {
  //下拉："-2835738348978420994|不按年度]第0001号|1|1"
  //断号： "-4856736416063797664|BB]第0001号||2"
  //输入: "0|9999||3
  var summaryId = document.getElementsByName("summaryId")[0].value;
  var edocMarkObj = theForm.elements["my:doc_mark"];

  if (edocMarkObj) {
    var edocmark = edocMarkObj.value;

    if (edocmark == null || typeof edocmark == 'undefined') {
      edocmark = $("input[id='my:doc_mark']").val();
    }

    if (edocmark) {
      var definitionId = edocmark.substring(0, edocmark.indexOf("|")); //文号定义ID

      var selectMode = edocmark.substring(edocmark.length - 1);

      if (definitionId != 0) {
        if (!checkMarkDefinitionExsit(definitionId, null, 1, selectMode, summaryId)) {
          return false;
        }
      }
    }
  }

  var edocMarkObj = theForm.elements["my:doc_mark2"];

  if (edocMarkObj) {
    var edocmark = edocMarkObj.value;
    var definitionId = edocmark.substring(0, edocmark.indexOf("|")); //文号定义ID

    var selectMode = edocmark.substring(edocmark.length - 1);

    if (definitionId != 0) {
      if (!checkMarkDefinitionExsit(definitionId, null, 1, selectMode, summaryId)) {
        return false;
      }
    }
  }

  var edocMarkObj = theForm.elements["my:serial_no"];

  if (edocMarkObj) {
    var edocmark = edocMarkObj.value;
    var definitionId = edocmark.substring(0, edocmark.indexOf("|")); //文号定义ID

    var edocmarkString = edocmark.substring(edocmark.indexOf("|") + 1);
    var serial_no = edocmarkString.substring(0, edocmarkString.indexOf("|")); //文号

    var selectMode = edocmark.substring(edocmark.length - 1);

    if (serial_no != "") {
      if (!checkMarkDefinitionExsit(definitionId, serial_no, 2, selectMode, summaryId)) {
        return false;
      }
    }
  }

  return true;
}
/* xiangfan 添加 start */


function validFieldData_gov() {
  var value;
  var msg = "";
  var inputObj;
  var aField;
  fieldInputListArray.push(document.getElementById("my:subject")); //xiangfan 添加 标题修改成了多行文本（textarea），需要手动添加进行，修复GOV-4531

  var keywordObj = document.getElementById("my:keyword");
  if (keywordObj && keywordObj.tagName == "textarea") fieldInputListArray.push(keywordObj); //xiangfan 添加 主题词修改为多行文本，需要添加到数组内，修复GOV-5122

  for (var i = 0; i < fieldInputListArray.length; i++) {
    aField = fieldInputListArray[i];

    if (aField == null) {
      continue;
    }

    if (!aField || !aField.fieldName) {
      continue;
    }

    if (aField instanceof Seeyonform_text || aField.fieldName == "my:subject" || aField.fieldName == "my:keyword") {
      inputObj = document.getElementById(aField.fieldName);

      if (inputObj == null || inputObj.disabled == true || inputObj.readOnly == true) {
        continue;
      }

      msg = validField_gov(aField, inputObj.value, msg);

      if (msg != "") {
        alert(msg);
        inputObj.focus();
        return false;
      }
    } else if (aField.fieldName == "my:send_to" || aField.fieldName == "my:copy_to" || aField.fieldName == "my:report_to" || aField.fieldName == "my:send_to2" || aField.fieldName == "my:copy_to2" || aField.fieldName == "my:report_to2") {
      inputObj = document.getElementById(aField.fieldName);

      if (inputObj == null || inputObj.disabled == true) {
        continue;
      }

      msg = validField_gov(aField, inputObj.value, msg);

      if (msg != "") {
        alert(msg);
        return false;
      }
    }
  }

  return true;
} //设置数据域长度校验时候的长度。


function getValidateLength_gov(fieldName, initialValue) {
  if (fieldName == "my:subject") return 750;
  if (fieldName == "my:send_unit") return 6002;
  return initialValue;
}

function validField_gov(aField, inputValue, aMsg) {
  var msg = aMsg;

  if (aField.fieldtype == "varchar" || aField.fieldName == "my:subject" || aField.fieldName == "my:keyword") {
    var fieldName = "";
    if (aField.fieldName == "my:serial_no") fieldName = V5_Edoc().$.i18n("edoc.docmark.inner.title"); //内部文号
    else if (aField.fieldName == "my:doc_mark") fieldName = V5_Edoc().$.i18n("common.edoc.mark.number.label"); //公文文号
    else fieldName = aField.fieldName;

    if (fieldName.indexOf("my:") != -1) {
      fieldName = v3x.getMessage("V3XLang.edoc_element") + "(" + fieldName.substring(3) + ")";
    }

    msg = validFieldLength(inputValue.trim(), getValidateLength_gov(aField.fieldName, 255), fieldName, msg);
  }

  if (aField.fieldtype == "int" || aField.fieldtype == "decimal") {
    var old = msg;
    msg = IsNum(inputValue.trim(), aField.fieldName, msg);

    if (old == msg) {
      //暂不提交
      if (aField.fieldtype == "int") {
        msg = validDigit(inputValue.trim(), 9, aField.digit, aField.fieldName, msg);

        if (msg != "" && (aField.fieldName == "my:copies" || aField.fieldName == "my:copies2")) {
          //xiangfan 添加 修复GOV-4624
          var fieldName = V5_Edoc().$.i18n("edoc.element.copies"); //印发份数

          msg = fieldName + msg;
        }
      } else if (aField.fieldtype == "decimal") {
        msg = validDigit(inputValue.trim(), 16, 4, aField.fieldName, msg);
      }
    }
  }

  if (aField.fieldtype == "TIMESTAMP" || aField.fieldtype == "date") {
    msg = isDate(inputValue.trim(), aField.fieldName, msg);
  }

  var tempAFieldEle = document.getElementById(aField.fieldName);

  if (tempAFieldEle && tempAFieldEle.tagName == "TEXTAREA" && aField.fieldName != "my:subject") {
    //TODO 需要做国际化
    var fieldName = V5_Edoc().$.i18n("edoc.element.sendtounit"); //主送单位

    if (aField.fieldName == "my:copy_to") fieldName = V5_Edoc().$.i18n("edoc.element.copytounit"); //抄送单位
    else if (aField.fieldName == "my:report_to") fieldName = V5_Edoc().$.i18n("edoc.element.copy.reportunit"); //抄报单位
    else if (aField.fieldName == "my:send_to2") fieldName = V5_Edoc().$.i18n("edoc.element.sendtounitB"); //主送单位2
    else if (aField.fieldName == "my:copy_to2") fieldName = V5_Edoc().$.i18n("edoc.element.copytounitB"); //抄送单位2
    else if (aField.fieldName == "my:report_to2") fieldName = V5_Edoc().$.i18n("edoc.element.copy.reportunitB"); //抄报单位2

    msg = validTextareaLength_gov(inputValue.trim(), 4000, fieldName, msg);
  }

  return msg;
} //判断大文本是否超长


function validTextareaLength_gov(aFieldValue, aFieldLength, aFieldName, aMsg) {
  if (aFieldValue == "" || aFieldValue.length == 0) return aMsg;
  var l = aFieldValue.length;
  var blen = 0;

  for (i = 0; i < l; i++) {
    if ((aFieldValue.charCodeAt(i) & 0xff00) != 0) {
      blen = blen + 2;
    }

    blen++;
  }

  if (blen > parseInt(aFieldLength)) {
    var characterLength = Math.floor(parseInt(aFieldLength) / 3);
    aMsg += V5_Edoc().$.i18n("edoc.alert.less.length", aFieldName, characterLength) + "\r\n"; //aFieldName长度不能超过characterLength
  }

  return aMsg;
}
/**
 * 检查模板是否可用 --xiangfan
 */


function checkTempleteDisabled(templeteId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkTempleteDisabled", false);
  requestCaller.addParameter(1, "Long", templeteId);
  var rs = requestCaller.serviceRequest();

  if (rs == "true") {
    return true;
  } else {
    return false;
  }
}
/* wangwei 流程发送节点匹配弹出框，回调send()方法  */


var sendCallBackCallbackParam = {};

function sendCallBack(_x) {
  return _sendCallBack.apply(this, arguments);
}
/**
 * 分发验证回调函数
 *
 * @returns {Boolean}
 */


function _sendCallBack() {
  _sendCallBack = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(isAlertPersonFrame) {
    var theForm, sendIsQuickSend, copies, templeteId, _edocType;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            theForm = document.getElementsByName("sendForm")[0];

            if (theForm) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return");

          case 3:
            //快速发文的标识
            sendIsQuickSend = false;

            if (document.getElementById("isQuickSend") && document.getElementById("isQuickSend").checked) {
              sendIsQuickSend = true;
            } //验证工作流是否为空
            // OA-29541
            // 后台设置不允许自建流程，前台拟文时关闭了模版的选择界面，填写标题，然后发送，这时正常弹出了无流程的提示，单击提示的确定，继续弹出了流程的选人界面
            // 从拟文页面传入isAlertPersonFrame参数表示，在没有编辑流程时，是否弹出选人界面


            if (!(!sendIsQuickSend && !checkSelectWF(isAlertPersonFrame))) {
              _context2.next = 7;
              break;
            }

            return _context2.abrupt("return");

          case 7:
            if (checkSubject(theForm)) {
              _context2.next = 9;
              break;
            }

            return _context2.abrupt("return");

          case 9:
            if (valiFuyan()) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return");

          case 11:
            //OA-19454 新建发文，元素：印发分数为负数，能正常发送出去
            copies = document.getElementById("my:copies");

            if (checkCopies(copies)) {
              _context2.next = 14;
              break;
            }

            return _context2.abrupt("return");

          case 14:
            //公文文号不能有特殊字符
            //OA-21307  新建发文，收到输入特殊字符的公文文号，单击发送，过1-2分钟后才弹出错误，点击error的close，报js
            //if(!checkEdocMark()) return;

            /** 打开进度条 */
            //try { getA8Top().startProc(); } catch(e) {}

            /* xiangfan 添加 修复GOV-4824 */
            templeteId = document.getElementById("templeteId").value;

            if (!(null != templeteId && templeteId != "")) {
              _context2.next = 19;
              break;
            }

            if (!checkTempleteDisabled(templeteId)) {
              _context2.next = 19;
              break;
            }

            alert(_("edocLang.edoc_template_notuse"));
            return _context2.abrupt("return");

          case 19:
            if (!(validFieldData_gov() == false)) {
              _context2.next = 21;
              break;
            }

            return _context2.abrupt("return");

          case 21:
            /* xiangfan 添加 修复GOV-4824 */
            // ***快速发文**文号为空、交换类型的验证--start
            sendCallBackCallbackParam.sendIsQuickSend = sendIsQuickSend;
            _edocType = document.getElementById("edocType").value;

            if (!(_edocType == 0 && sendIsQuickSend)) {
              _context2.next = 27;
              break;
            }

            checkExchangeRole({
              "callbackFn": sendCallBackCheckExchangeRoleCallback
            });
            _context2.next = 29;
            break;

          case 27:
            _context2.next = 29;
            return sendCallBackCheckExchangeRoleCallback(true);

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _sendCallBack.apply(this, arguments);
}

function sendCallBackCheckExchangeRoleCallback(_x2) {
  return _sendCallBackCheckExchangeRoleCallback.apply(this, arguments);
} //调用工作流API需要的win对象


function _sendCallBackCheckExchangeRoleCallback() {
  _sendCallBackCheckExchangeRoleCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(value) {
    var sendIsQuickSend, theForm, bool, phoneValue, choose, msg, inputObj, aField, strTmp, i, edocMarkObj, edocMark, edocType, summaryId, orgAccountId, edocJsonStr, templeteProcessId, processId, caseProcessXML, top2, mId, mIdNumber, tmpId, options;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (value) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return");

          case 2:
            sendIsQuickSend = sendCallBackCallbackParam.sendIsQuickSend;
            theForm = document.getElementsByName("sendForm")[0]; //***快速发文**文号为空、交换类型的验证--end
            // 增加对公文文号长度校验，最大长度不能超过66，主要考虑归档时，doc_metadata表长度200

            if (checkEdocMark()) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return");

          case 6:
            if (checkMarkDefinition(theForm)) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt("return", false);

          case 8:
            //验证交换单位是否有重复 -- start --
            bool = checkExchangeAccountIsDuplicatedOrNot();

            if (!(bool == false)) {
              _context3.next = 12;
              break;
            }

            alert(_("edocLang.exchange_unit_duplicated"));
            return _context3.abrupt("return");

          case 12:
            if (!(checkDeadline() == false)) {
              _context3.next = 14;
              break;
            }

            return _context3.abrupt("return");

          case 14:
            if (!(!sendIsQuickSend && compareTime() == false)) {
              _context3.next = 16;
              break;
            }

            return _context3.abrupt("return");

          case 16:
            //验证联系电话的长度不能超过数据库字段50的长度
            phoneValue = document.getElementById("my:phone");

            if (!(phoneValue && phoneValue.value.length > 85)) {
              _context3.next = 20;
              break;
            }

            alert(_("edocLang.edoc_phone_less_than"));
            return _context3.abrupt("return");

          case 20:
            //如果是退回拟稿人操作，拟稿人重新发起，action在sendBackToDraft方法中指定
            choose = document.getElementById("draftChoose");
            if (!choose || choose.value == "") theForm.action = genericURL + "?method=send" + getA8Top().CsrfGuard.getUrlSurffix();

            if (!checkForm(theForm)) {
              _context3.next = 46;
              break;
            }

            //文单元素非空验证 wangjingjing begin
            msg = "";
            i = 0;

          case 25:
            if (!(i < fieldInputListArray.length)) {
              _context3.next = 37;
              break;
            }

            aField = fieldInputListArray[i];
            inputObj = document.getElementById(aField.fieldName);

            if (!(inputObj == null || inputObj.disabled == true)) {
              _context3.next = 30;
              break;
            }

            return _context3.abrupt("continue", 34);

          case 30:
            if (!(aField.required == "true" && aField.access == "edit" && inputObj.value.length == 0)) {
              _context3.next = 34;
              break;
            }

            alert(_("edocLang.edoc_alter_required_not_null")); // 文号做了输入，真正的文号input被hidden了，不可见的input.focus在IE8下报异常，所以捕获

            try {
              document.getElementById(aField.fieldName).focus();
            } catch (e) {}

            return _context3.abrupt("return", false);

          case 34:
            i++;
            _context3.next = 25;
            break;

          case 37:
            //BUG-公文标题末尾带有换行符，导致PDF正文在IE8等低版本的IE中对正文另存为操作时不弹出保存窗口
            if ("my:subject" == aField.fieldName) {
              document.getElementById(aField.fieldName).value = document.getElementById(aField.fieldName).value.replace(/[\r\n]/g, "");
            } //暂时屏蔽，必填项的提醒因为自定义的公文元素提取名称修改代价大，所以只需要提醒有必填项未填即可。
            //      if(msg.length > 0){
            //        alert(msg);
            //        return;
            //      }
            //暂时屏蔽，必填项的提醒因为自定义的公文元素提取名称修改代价大，所以只需要提醒有必填项未填即可。-end
            // changyi 将以前的主送单位不能为空的判断取消，因为wangjingjing已经在上面加上了表单元素的判断了
            // 检查主送单位、主送单位2的是否设置有值
            //if(!checkSendUnitAndSendUnit2(theForm)){return;}
            //检查签报公文文号是否已使用


            edocMarkObj = document.getElementById("my:doc_mark");

            if (!edocMarkObj) {
              _context3.next = 46;
              break;
            }

            edocMark = _getWordNoValue(edocMarkObj);
            edocType = document.getElementById("edocType").value;
            summaryId = document.getElementById("summaryId").value;
            orgAccountId = document.getElementById("orgAccountId").value;

            if (!(edocType == "2" && edocMark != "" && !loadAndManualSelectedPreSend && checkMarkHistoryExist(0, edocMark, summaryId, orgAccountId))) {
              _context3.next = 46;
              break;
            }

            return _context3.abrupt("return");

          case 46:
            edocJsonStr = edocSubmitJsonStrValues(); //edocJsonStrValues();

            templeteProcessId = document.getElementById("templeteProcessId").value;
            processId = document.getElementById("processId").value;
            caseProcessXML = document.getElementById("process_xml").value;
            top2 = getWorkFlowTopWin();

            if (sendIsQuickSend) {
              _context3.next = 57;
              break;
            }

            mId = document.getElementById("supervisorId");
            mIdNumber = mId.value.split(",");

            if (!(mIdNumber.length > 10)) {
              _context3.next = 57;
              break;
            }

            alert(_("collaborationLang.col_supervise_supervisor_overflow"));
            return _context3.abrupt("return");

          case 57:
            if (!sendIsQuickSend) {
              _context3.next = 62;
              break;
            }

            _context3.next = 60;
            return send();

          case 60:
            _context3.next = 69;
            break;

          case 62:
            if (top2.executeWorkflowBeforeEvent("BeforeStart", "", "", templeteProcessId, processId, "start", edocJsonStr, "sendEdoc")) {
              _context3.next = 64;
              break;
            }

            return _context3.abrupt("return");

          case 64:
            tmpId = templeteProcessId;

            if (processId && processId != "-1" && processId != 0 && window.subState == '16') {
              //指定回退直接提交给我这种场景，直接流程从走
              tmpId = "";
            }

            options = {
              tWindow: top2,
              workitemId: "-1",
              processTemplateId: tmpId,
              processId: processId,
              activityId: "start",
              currentUserId: currentUserId,
              caseId: caseId,
              currentAccountId: currentUserAccountId,
              formData: edocJsonStr,
              appName: "edoc",
              processXml: caseProcessXML,
              vWindow: window,
              fn: send
            }; // todo 获取发起者数据id待优化

            try {
              options.senderId = senderId;
            } catch (e) {
              options.senderId = '';
            }

            top2.preSendOrHandleWorkflow(options);

          case 69:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _sendCallBackCheckExchangeRoleCallback.apply(this, arguments);
}

function getWorkFlowTopWin() {
  return window.parent.parent.parent;
}

function checkDocMarkIsUsedByRec(docMark) {
  var flag = false;
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkDocMarkIsUsedByRec", false);
  requestCaller.addParameter(1, "String", docMark);
  var rs = requestCaller.serviceRequest();

  if (rs == "used") {
    flag = true;
  }

  return flag;
}

var sendCount = 0;

function send() {
  return _send.apply(this, arguments);
} //检查标题是否含有特殊字符并且不能为空


function _send() {
  _send = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var isQuickSend, commOjb, theForm, bodyType, edocType, templeteBodyTyep, isSystemTemplate, docMark, isLastNode, _edocType, sendIsQuickSend, _progressBar_1, _progressBar_2, taohongParams, branchNodes, finput, hidden, i, party, administrative;

    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            //快速发文的标识
            isQuickSend = false;

            if (document.getElementById("isQuickSend") && document.getElementById("isQuickSend").checked) {
              isQuickSend = true;
            }

            commOjb = document.getElementById("comm"); // 检查流程期限是不是比当前日期早

            if (!(!isQuickSend && checkDeadlineDatetime())) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return");

          case 5:
            theForm = document.getElementsByName("sendForm")[0]; //保存正文
            // checkExistBody();
            // wangwei拟文套红,只有发送后才有效果

            fileId = newEdocBodyId;
            bodyType = document.getElementById("bodyType");
            edocType = document.getElementById("edocType"); //收文的时候不能刷新

            templeteBodyTyep = document.getElementById("templeteBodyTyep").value;
            isSystemTemplate = document.getElementById("isSystemTemplate").value;
            /*收文登记时来文文号若有重复需要给出提醒*/

            if (!(edocType.value == 1)) {
              _context5.next = 18;
              break;
            }

            docMark = document.getElementById("my:doc_mark");

            if (!(docMark && docMark.value != "")) {
              _context5.next = 18;
              break;
            }

            if (!checkDocMarkIsUsedByRec(docMark.value)) {
              _context5.next = 18;
              break;
            }

            if (confirm(_("edocLang.rec_edoc_mark_is_used"))) {
              _context5.next = 18;
              break;
            }

            docMark.focus();
            return _context5.abrupt("return");

          case 18:
            isLastNode = document.getElementById("workflow_last_input").value;
            _edocType = document.getElementById("edocType").value;
            sendIsQuickSend = sendCallBackCallbackParam.sendIsQuickSend; //发文的快速发文和流程结束节点需要判断文号

            if (!(_edocType == 0 && (isLastNode == 'true' && checkEdocMarkIsRequireAndIsNotNull() || sendIsQuickSend))) {
              _context5.next = 24;
              break;
            }

            if (!(checkEdocWordNo() == false)) {
              _context5.next = 24;
              break;
            }

            return _context5.abrupt("return");

          case 24:
            if (!(edocType && edocType.value != 1 && bodyType && (bodyType.value == "OfficeWord" || bodyType.value == "WpsWord"))) {
              _context5.next = 59;
              break;
            }

            //验证有没有安装office，当前正文是否包含书签，提示套红是否清除，确定后再刷新套红正文
            //OA-34697新建公文，正文为打开本地的一个含有书签的word正文，待办进行撤销，待发重新编辑时将文号去掉了，新发送出去查看公文的正文内容，仍然保留的上传的文号
            //	if(isLoadOffice()){此处如果不屏蔽，当编辑发送带有书签的正文时，不激活正文，则不会更新正文书签，此处代码保留原3.50客户bug修复包后的版本
            _progressBar_1 = getA8Top().$.progressBar();
            _context5.prev = 26;
            _context5.next = 29;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 29:
            _context5.next = 36;
            break;

          case 31:
            _context5.prev = 31;
            _context5.t0 = _context5["catch"](26);

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context5.abrupt("return");

          case 36:
            _context5.next = 38;
            return _officeSDK.openFile({
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            });

          case 38:
            _context5.next = 40;
            return _officeSDK.countBookmarks();

          case 40:
            _context5.t1 = _context5.sent;

            if (!(_context5.t1 > 0)) {
              _context5.next = 58;
              break;
            }

            _progressBar_1.close();

            if (!confirm(_("edocLang.edoc_deleteBookMark"))) {
              _context5.next = 48;
              break;
            }

            _context5.next = 46;
            return _officeSDK.delBookmarks();

          case 46:
            _context5.next = 56;
            break;

          case 48:
            _progressBar_2 = getA8Top().$.progressBar();
            edocTaohongHandler.setAllLable(contentIframe.document.getElementsByName("sendForm")[0], 'edoc', null);
            edocTaohongHandler.bookMarkMapToBookMarkList(edocTaohongHandler.allBM);
            taohongParams = {
              allBookMark: edocTaohongHandler.bookMarkList,
              templateType: "edoc",
              fileType: "doc",
              fileId: _officeSDK.params.fileId,
              refreshBookMarkText: true
            };
            _context5.next = 54;
            return _officeSDK.setOptions({
              isDialog: true,
              canClearTrail: false,
              canRevise: false,
              isShowTrailBtn: undefined,
              notChangeState: true //wps调用openFile，文件状态设置为未修改，这里套红后不应该改状态

            });

          case 54:
            _context5.next = 56;
            return _officeSDK.taohong(taohongParams, /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(err, result) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _progressBar_2.close();

                        if (!err) {
                          _context4.next = 5;
                          break;
                        }

                        console.log("套红失败", err);
                        $.alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
                        return _context4.abrupt("return");

                      case 5:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x33, _x34) {
                return _ref.apply(this, arguments);
              };
            }());

          case 56:
            _context5.next = 59;
            break;

          case 58:
            _progressBar_1.close();

          case 59:
            _context5.next = 61;
            return saveOcx();

          case 61:
            if (_context5.sent) {
              _context5.next = 64;
              break;
            }

            enableButtons();
            return _context5.abrupt("return");

          case 64:
            //升级后，待发送的记录（PDF正文）进行登记时edocbody的content没值
            if (currentPage == 'newEdoc') {
              document.getElementById("content").value = fileId;
            }

            saveAttachment();
            disableButtons();
            isFormSumit = true;
            branchNodes = document.getElementById("allNodes");

            if (branchNodes && branchNodes.value) {
              theForm.action += "&branchNodes=" + branchNodes.value;
            }

            theForm.target = "_self";

            try {
              finput = adjustReadFormForSubmit();
            } catch (e) {}

            if (nodes != null && nodes.length > 0) {
              for (i = 0; i < nodes.length; i++) {
                hidden = document.createElement('<INPUT TYPE="hidden" name="policys" value="' + policys[nodes[i]].name + '" />');
                theForm.appendChild(hidden);
                hidden = document.createElement('<INPUT TYPE="hidden" name="itemNames" value="' + policys[nodes[i]].value + '" />');
                theForm.appendChild(hidden);
              }
            }

            party = document.getElementById("my:party");

            if (party) {
              document.getElementById("edocGovType").value = "party";
            }

            administrative = document.getElementById("my:administrative");

            if (administrative) {
              document.getElementById("edocGovType").value = "administrative";
            }

            if (taohongFileUrl && taohongFileUrl != "" && document.getElementById("fileUrl")) {
              document.getElementById("fileUrl").value = taohongFileUrl;
            } //按钮还原


            myBar.enabled("isQuickS");

            if (document.getElementById("isQuickSend")) {
              document.getElementById("isQuickSend").disabled = false; //正文套红后变成disable
            } //重复点击发送验证 begin


            sendCount++;

            if (!(sendCount > 1)) {
              _context5.next = 85;
              break;
            }

            alert(V5_Edoc().$.i18n("edoc.alert.repeat.click.js")); //请不要重复点击！

            sendCount = 0;
            return _context5.abrupt("return");

          case 85:
            _context5.prev = 85;
            theForm.submit();
            _context5.next = 94;
            break;

          case 89:
            _context5.prev = 89;
            _context5.t2 = _context5["catch"](85);
            reductClick(false);
            topLinkClick(false);
            return _context5.abrupt("return");

          case 94:
            //getA8Top().startProc('');
            reductClick(false);
            topLinkClick(false); //调用已经封装好的 还原枚举下拉样式的 公文元素显示值

            replaceSelectBack(finput);

          case 97:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[26, 31], [85, 89]]);
  }));
  return _send.apply(this, arguments);
}

function checkSubject(theForm) {
  if (theForm.elements["my:subject"] == null || theForm.elements["my:subject"] == undefined) {
    alert(_("edocLang.edoc_inputSubject"));
    return false;
  }

  if (theForm.elements["my:subject"].value.trim() == "") {
    alert(_("edocLang.edoc_inputSubject"));

    if (theForm.elements["my:subject"].disabled == true) {
      alert(_("edocLang.edoc_alertSetPerm"));
      return false;
    }

    theForm.elements["my:subject"].focus();
    return false;
  }

  if (!/^[^\\\|"']*$/.test(theForm.elements["my:subject"].value)) {
    alert(_("edocLang.edoc_inputSpecialChar"));

    if (theForm.elements["my:subject"].disabled == true) {
      alert(_("edocLang.edoc_alertSetPerm"));
      return false;
    }

    theForm.elements["my:subject"].focus();
    return false;
  }

  return true;
} //检查模板中的公文标题是否含有特殊字符


function checkEdocSubject(theForm) {
  if (theForm.elements["my:subject"] == null || theForm.elements["my:subject"] == undefined) {
    alert(_("edocLang.edoc_inputSubject"));
    return false;
  }

  if (!/^[^\|"']*$/.test(theForm.elements["my:subject"].value)) {
    alert(_("edocLang.edoc_inputSpecialChar"));

    if (theForm.elements["my:subject"].disabled == true) {
      alert(_("edocLang.edoc_alertSetPerm"));
      return false;
    }

    theForm.elements["my:subject"].focus();
    return false;
  }

  return true;
} //检查主送单位、主送单位2的是否设置有值


function checkSendUnitAndSendUnit2(theForm) {
  var sendAccount = document.getElementById("my:send_to");

  if (sendAccount && jsEdocType == 0) {
    if (theForm.elements["my:send_to"].value.trim() == "") {
      alert(_("edocLang.edoc_inputSendTo"));

      if (theForm.elements["my:send_to"].disabled == true) {
        alert(_("edocLang.edoc_alertSetSendTo"));
        return false;
      }

      theForm.elements["my:send_to"].focus();
      return false;
    }
  }

  var sendAccount2 = document.getElementById("my:send_to2");

  if (sendAccount2 && jsEdocType == 0) {
    if (theForm.elements["my:send_to2"].value.trim() == "") {
      alert(_("edocLang.edoc_inputSendTo2"));

      if (theForm.elements["my:send_to2"].disabled == true) {
        alert(_("edocLang.edoc_alertSetSendTo"));
        return false;
      }

      theForm.elements["my:send_to2"].focus();
      return false;
    }
  }

  return true;
} //验证流程期限是小于当前系统时间


function checkDeadlineDatetime() {
  var calDateTime = $("#deadLineDateTimeInput");
  var nowDatetime = new Date();

  if (calDateTime[0]) {
    if (calDateTime.val() != "" && nowDatetime.getTime() + server2LocalTime > new Date(calDateTime.val().replace(/-/g, "/")).getTime()) {
      alert(_("edocLang.edoc_deadlineError"));
      return true;
    }
  }

  return false;
}
/**
 * 保存待发
 */


function saveWaitSent() {
  return _saveWaitSent.apply(this, arguments);
}

function _saveWaitSent() {
  _saveWaitSent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
    var theForm, calDateTime, nowDatetime, dateTimeObj, bool, edocMarkObj, edocMark, edocType, summaryId, orgAccountId, bodyType;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            //保存待发也需要校验段号
            theForm = document.getElementsByName("sendForm")[0];

            if (checkMarkDefinition(theForm)) {
              _context6.next = 3;
              break;
            }

            return _context6.abrupt("return");

          case 3:
            // 设置流程期限值
            clickFlag = false;
            calDateTime = $("#deadLineDateTimeInput");
            nowDatetime = new Date().format("yyyy-MM-dd HH:mm");
            dateTimeObj = $("#deadLineDateTime");

            if (calDateTime && dateTimeObj) {
              dateTimeObj.val(calDateTime.val());
            } // if (!checkEdocMark())
            // return;
            // 验证交换单位是否有重复 -- start --


            bool = checkExchangeAccountIsDuplicatedOrNot();

            if (!(bool == false)) {
              _context6.next = 12;
              break;
            }

            alert(_("edocLang.exchange_unit_duplicated"));
            return _context6.abrupt("return");

          case 12:
            theForm = document.getElementsByName("sendForm")[0];
            theForm.action = genericURL + "?method=save" + getA8Top().CsrfGuard.getUrlSurffix();

            if (!(validFieldData_gov() == false)) {
              _context6.next = 16;
              break;
            }

            return _context6.abrupt("return");

          case 16:
            if (!(compareTime() == false)) {
              _context6.next = 18;
              break;
            }

            return _context6.abrupt("return");

          case 18:
            if (valiFuyan()) {
              _context6.next = 20;
              break;
            }

            return _context6.abrupt("return");

          case 20:
            if (!checkForm(theForm)) {
              _context6.next = 47;
              break;
            }

            if (checkSubject(theForm)) {
              _context6.next = 23;
              break;
            }

            return _context6.abrupt("return");

          case 23:
            // lijl注销---------------------------Start(和康雪确认过需求,在保存到草稿箱的时候无论文单定议的时候是否勾选都不需要判断这两项)
            // 检查主送单位、主送单位2的是否设置有值
            // if(!checkSendUnitAndSendUnit2(theForm)){return;}
            // 检查是否设置了工作流
            // if (!checkSelectWF()) {
            // return;
            // }
            // lijl注销---------------------------End(和康雪确认过需求,在保存到草稿箱的时候无论文单定议的时候是否勾选都不需要判断这两项)
            // 检查签报公文文号是否已使用
            edocMarkObj = document.getElementById("my:doc_mark");

            if (!edocMarkObj) {
              _context6.next = 31;
              break;
            }

            edocMark = _getWordNoValue(edocMarkObj);
            edocType = document.getElementById("edocType").value;
            summaryId = document.getElementById("summaryId").value;
            orgAccountId = document.getElementById("orgAccountId").value;

            if (!(edocType == "2" && edocMark != "" && !loadAndManualSelectedPreSend && checkMarkHistoryExist(0, edocMark, summaryId, orgAccountId))) {
              _context6.next = 31;
              break;
            }

            return _context6.abrupt("return");

          case 31:
            // 保存正文
            // checkExistBody();
            fileId = newEdocBodyId;
            /** 打开进度条 */
            // try { getA8Top().startProc(); } catch(e) {}

            _context6.next = 34;
            return saveOcx();

          case 34:
            if (_context6.sent) {
              _context6.next = 36;
              break;
            }

            return _context6.abrupt("return");

          case 36:
            //升级后，待发送的记录（PDF正文）进行登记时edocbody的content没值
            bodyType = document.getElementById("bodyType");

            if (currentPage == 'newEdoc' && (bodyType.value == "Pdf" || bodyType.value == "OfficeWord")) {
              document.getElementById("content").value = fileId;
            }

            saveAttachment(); //保存待发，将按钮置灰，防止多次点击

            document.getElementById("save").disabled = true;
            isFormSumit = true;
            theForm.target = "_self";

            try {
              adjustReadFormForSubmit();
            } catch (e) {}

            try {
              if (window.dialogArguments) {
                theForm.target = "formIframe";
              }

              if (taohongFileUrl && taohongFileUrl != "" && document.getElementById("fileUrl")) {
                document.getElementById("fileUrl").value = taohongFileUrl;
              } // 按钮还原


              myBar.enabled("isQuickS");

              if (document.getElementById("isQuickSend")) {
                document.getElementById("isQuickSend").disabled = false; //正文套红后变成disable
              }

              theForm.submit();
            } catch (e) {
              reductClick(false);
              topLinkClick(false);
            } // 转发 中点击保存进草稿箱，就不调用进度条了，因为新打开的窗口无法调用


            if (transmitSend == 0) {
              if (getA8Top() != null && typeof getA8Top().showLocation != "undefined") {
                getA8Top().startProc('');
              }
            }

            reductClick(false);
            topLinkClick(false);

          case 47:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _saveWaitSent.apply(this, arguments);
}

function saveOcx() {
  return _saveOcx.apply(this, arguments);
}

function _saveOcx() {
  _saveOcx = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            _context7.next = 3;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 3:
            _context7.next = 5;
            return _officeSDK.openFile({
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            });

          case 5:
            _context7.next = 7;
            return _officeSDK.saveFile();

          case 7:
            return _context7.abrupt("return", _context7.sent);

          case 10:
            _context7.prev = 10;
            _context7.t0 = _context7["catch"](0);
            console && console.log && console.log("正文保存失败", _context7.t0);
            return _context7.abrupt("return", true);

          case 14:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 10]]);
  }));
  return _saveOcx.apply(this, arguments);
}

function resend(from) {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var checkedNum = 0;
  var summaryId = null;
  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      summaryId = id_checkbox[i].value;
      checkedNum++;
    }
  }

  if (checkedNum == 0) {
    alert(_("edocLang.edoc_alertSelectResentItem"));
    return;
  }

  if (checkedNum > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertCanotTurn"));
    return;
  }

  var data = {
    from: from,
    summaryId: summaryId
  };
  var action = collaborationCanstant.resendActionURL;
  var target = "_parent";
  var method = "GET";
  submitMap(data, action, target, method);
}

function checkSelectWF(type, templateType) {
  if (document.getElementById("process_xml").value != "" || //主要是处理从草稿箱中编辑来的公文直接发送时，流程是有的
  document.getElementById("processId").value != "" || document.getElementById("templeteProcessId") && document.getElementById("templeteProcessId").value != "" && document.getElementById("templeteProcessId").value != "0") {
    hasWorkflow = true;
  } //OA-46834新建签报调用格式模版，保存待发 待发编辑，不填写流程，还可以另存为个人模版


  if (document.getElementById("processId").value == "" && document.getElementById("process_xml").value == "" && templateType && templateType == "text") {
    hasWorkflow = false;
  }

  if (!hasWorkflow) {
    if (type != 10) {
      alert(v3x.getMessage("edocLang.edoc_selectWorkflow"));
    } //OA-8532  拟文，填写了标题，没有写流程，发送，在提示后没有弹出选人界面


    if (type == undefined) {
      //当另存为个人模板时，如果没有填写流程则不自动弹出选人界面
      selectPeo();
    } else if (type == 10) {
      alert(_("edocLang.edoc_not_self_create_workflow_alert"));
    }

    if (selfCreateFlow == false) {
      return false;
    } //doWorkFlow("new");


    return false;
  }

  return true;
}

function alertPigeonhole() {
  alert(v3x.getMessage("edocLang.edoc_pigeonhole"));
}

var sendFromWaitSendCallbackParma = {};

function sendFromWaitSend(edocType) {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var hasMoreElement = false;
  var isSendImmediate = false;
  var len = id_checkbox.length;
  var caseId = "";
  var processId = "";
  var hasTemplete = false;
  var substate = ""; // 待发子状态 1：草稿，2：回退 3：撤销

  var isquickSend = false; // 快速发文,默认为否

  var deadlineDatetime; // 流程期限

  var dockMark = ""; // 收文待发直接发送时，需要判断文号使用已经用了

  var summaryId = "";

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      dockMark = id_checkbox[i].getAttribute("docMark");
      summaryId = id_checkbox[i].value;
      caseId = id_checkbox[i].getAttribute("caseId");
      substate = id_checkbox[i].getAttribute("substate");
      isquickSend = id_checkbox[i].getAttribute("isQuickSend");
      deadlineDatetime = id_checkbox[i].getAttribute("deadlineDatetime");

      if (isSendImmediate) {
        // alert(v3x.getMessage("edocLang.edoc_alertDontSelectMulti"));
        alert(v3x.getMessage("edocLang.edoc_only_select_one_send"));
        return;
      } // 检查流程期限是不是比当前日期早


      if (typeof deadlineDatetime != "undefined") {
        deadlineDatetime = deadlineDatetime.substring(0, deadlineDatetime.indexOf("."));
        var nowDatetime = new Date();

        if (deadlineDatetime && nowDatetime.getTime() + server2LocalTime > new Date(deadlineDatetime.replace(/-/g, "/")).getTime()) {
          alert(_("edocLang.edoc_deadlineError"));
          return;
        }
      } // 草稿在没有拟文权限的情况下，不再允许发送


      if (isEdocCreateRole == false) {
        // && substate==1
        // 现在是只要没有发起权，就不能发送了
        alert(v3x.getMessage("edocLang.alert_not_edoccreate"));
        return;
      }
      /*
                * if(substate == 4){ //退回拟稿人不允许直接发送
                * alert(v3x.getMessage("edocLang.edoc_alertUseModify")); return; }
                */


      processId = id_checkbox[i].getAttribute("processId");
      hasTemplete = id_checkbox[i].getAttribute("templeteId") != "";

      if (hasTemplete) {
        alert(v3x.getMessage("edocLang.edoc_alertPleaseDoubleClick"));
        return;
      }

      hasMoreElement = true;
      isSendImmediate = true; //验证内部文号是否被占用

      var serialNoValue = id_checkbox[i].getAttribute("serialNo");

      if (serialNoValue) {
        var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkSerialNoExcludeSelf", false);
        requestCaller.addParameter(1, "String", summaryId);
        requestCaller.addParameter(2, "String", serialNoValue);
        var rs = requestCaller.serviceRequest(); //(0:未使用内部文号 | 1：已使用该内部文号)

        if (rs == "1") {
          //已经被占用
          alert(_("edocLang.doc_send_innermark_used"));
          return false;
        }
      } //校验公文文号是否被占用


      dockMark = id_checkbox[i].getAttribute("docMark");

      if (dockMark) {
        if (edocType == 2) {
          //签报
          var isUsed = _checkEdocMarkIsUsed(dockMark, summaryId, currentUserAccountId);

          if (isUsed) {
            alert(_("edocLang.doc_mark_alter_used"));
            return false;
          }
        }
      }
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertSentItem"));
    return;
  }

  if (!isquickSend && (processId == null || processId == '')) {
    alert(v3x.getMessage("edocLang.edoc_send_noflow"));
    return;
  }

  sendFromWaitSendCallbackParma.edocType = edocType;
  sendFromWaitSendCallbackParma.isquickSend = isquickSend;
  sendFromWaitSendCallbackParma.dockMark = dockMark;
  sendFromWaitSendCallbackParma.summaryId = summaryId;

  if (isquickSend == 'true') {
    if (edocType == 0) {
      alert(v3x.getMessage("edocLang.edoc_send_isquickSend"));
      return;
    } else if (edocType == 1) {
      alert(v3x.getMessage("edocLang.edoc_send_isquickEdocRec"));
      return;
    } // 进行交换部门选择
    // checkExchangeRole_fromWaitSend(summaryId, currentUserAccountId,{"callbackFn" : sendFromWaitSendCheckExchangeRoleCallback});

  } else {
    sendFromWaitSendCheckExchangeRoleCallback(true);
  }
}
/**
 * checkExchangeRole_fromWaitSend验证为true时回调函数
 *
 * @returns {Boolean}
 */


function sendFromWaitSendCheckExchangeRoleCallback(value) {
  if (!value) {
    return;
  }

  var edocType = sendFromWaitSendCallbackParma.edocType;
  var isquickSend = sendFromWaitSendCallbackParma.isquickSend;
  var dockMark = sendFromWaitSendCallbackParma.dockMark;
  var summaryId = sendFromWaitSendCallbackParma.summaryId;
  var id_checkbox = document.getElementsByName("id");
  var theForm = document.getElementsByName("listForm")[0];

  if (!loadAndManualSelectedPreSend) {
    disableButtons();
  } //快速发文的文号判断


  if (edocType == 0 && isquickSend == 'true' && !checkEdocWordNo_fromWaitSend(dockMark, summaryId, currentUserAccountId)) {
    return false;
  }

  if (edocType == 1) {
    if (dockMark != "") {
      if (checkDocMarkIsUsedByRec(dockMark)) {
        if (!confirm(_("edocLang.rec_edoc_mark_is_used"))) {
          return;
        }
      }
    }
  }

  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      var affairId = id_checkbox[i].getAttribute("affairId");
      var c = document.createElement("input");
      c.setAttribute('type', 'hidden');
      c.setAttribute('name', 'affairId');
      c.setAttribute('value', affairId);
      theForm.appendChild(c);
    }
  }

  theForm.method = "post";
  theForm.action = genericURL + "?method=sendImmediate";
  theForm.target = "_parent";
  disableButtons();

  if (getA8Top() != null && typeof getA8Top().showLocation != "undefined") {
    getA8Top().startProc('');
  }

  theForm.submit();
}

function serializeElements(_elements) {
  function SerializableElement(_elements) {
    var elements = _elements;

    this.toFields = function () {
      if (!elements) {
        return "";
      }

      var personList = elements && elements.length == 2 ? elements[0] : [];
      var flowType = elements && elements.length == 2 ? elements[1] : 0;
      var str = "";

      for (var i = 0; i < personList.length; i++) {
        var person = personList[i];
        str += '<input type="hidden" name="userType" value="' + person.type + '" />';
        str += '<input type="hidden" name="userId" value="' + person.id + '" />'; //        workFlowContent += person.name + ",";
      }

      str += '<input type="hidden" name="flowType" value="' + flowType + '" />';
      return str;
    };

    return this;
  }

  return SerializableElement(_elements);
}

function serializeElementsNoType(_elements) {
  function SerializableElement(_elements) {
    var elements = _elements;

    this.toFields = function () {
      if (!elements) {
        return "";
      }

      var str = "";
      var isShowShortName = false;

      if (document.getElementById("currentLoginAccountId")) {
        var loginAccountId = document.getElementById("currentLoginAccountId").value;

        for (var i = 0; i < elements.length; i++) {
          var person = elements[i];

          if (person.accountId != loginAccountId) {
            isShowShortName = true;
            break;
          }
        }
      }

      for (var i = 0; i < elements.length; i++) {
        var person = elements[i];
        str += '<input type="hidden" name="userType" value="' + person.type + '" />';
        str += '<input type="hidden" name="userId" value="' + person.id + '" />';
        str += '<input type="hidden" name="userName" value="' + person.name + '" />';
        str += '<input type="hidden" name="accountId" value="' + person.accountId + '" />';
        str += '<input type="hidden" name="accountShortname" value="' + person.accountShortname + '" />';
      }

      str += '<input type="hidden" name="isShowShortName" value="' + isShowShortName + '" />';
      return str;
    };

    return this;
  }

  return SerializableElement(_elements);
}

function serializePeople(elements) {
  if (!elements) {
    return "";
  }

  var personList = elements && elements.length == 2 ? elements[0] : [];
  var flowType = elements && elements.length == 2 ? elements[1] : 0;
  var arr = []; //    var str = "";
  //    var workFlowContent = "";

  for (var i = 0; i < personList.length; i++) {
    var person = personList[i]; //        str += '<input type="hidden" name="userType" value="' + person.type + '" />';
    //        str += '<input type="hidden" name="userId" value="' + person.id + '" />';

    var obj = new Object();
    obj.name = "userType";
    obj.value = person.type;
    arr.add(obj);
    obj = new Object();
    obj.name = "userId";
    obj.value = person.id;
    arr.add(obj); //        workFlowContent += person.name + ",";
  } //    str += '<input type="hidden" name="flowType" value="' + flowType + '" />';


  var obj = new Object();
  obj.name = "flowType";
  obj.value = flowType;
  arr.add(obj);
  hasWorkflow = true;
  return arr;
} //加签选人后的回调


function selectInsertPeople(elements) {
  document.getElementById("selectPeoplePanel").innerHTML = "";

  if (!elements) {
    return false;
  }

  var personList = elements[0] || [];
  var flowType = elements[1] || 0;
  var str = "";
  var workFlowContent = "";

  for (var i = 0; i < personList.length; i++) {
    var person = personList[i];
    str += '<input type="hidden" name="userType" value="' + person.type + '" />';
    str += '<input type="hidden" name="userId" value="' + person.id + '" />';
    str += '<input type="hidden" name="userName" value="' + person.name + '" />';
    str += '<input type="hidden" name="accountId" value="' + person.accountId + '" />';
    str += '<input type="hidden" name="accountShortname" value="' + person.accountShortname + '" />';
    str += '<input type="hidden" name="flowcomm" value="add" />';
    workFlowContent += person.name + ",";
  }

  str += '<input type="hidden" name="flowType" value="' + flowType + '" />';
  document.getElementById("process_desc_by").value = "people";
  document.getElementById("selectPeoplePanel").innerHTML = str;
  hasWorkflow = true;

  try {//getA8Top().startProc('');
  } catch (e) {}

  var form = document.forms.theform;
  form.action = genericURL + "?method=insertPeople";
  form.target = "showDiagramFrame";
  form.submit();
  return false;
} //减签辅助函数 - 提交减签人员名单


function commitDeletePeople(summary_id, affairId) {
  var people = [];
  var userName = [];
  var userType = [];
  var accountId = [];
  var accountShortname = [];
  var data = {
    userId: [],
    summary_id: summary_id,
    affairId: affairId,
    userName: [],
    userType: [],
    accountId: [],
    accountShortname: []
  };
  $("INPUT").each(function () {
    if (this.name == "deletePeople" && this.checked) {
      people[people.length] = this.value;
      userName[userName.length] = this.pname;
      userType[userType.length] = this.ptype;
      accountId[accountId.length] = this.paccountId;
      accountShortname[accountShortname.length] = this.paccountShortName;
    }
  });

  if (people.length == 0) {
    alert(v3x.getMessage("edocLang.eodc_least_select_singleton"));
    return false;
  }

  data.userId = people;
  data.userName = userName;
  data.userType = userType;
  data.accountId = accountId;
  data.accountShortname = accountShortname;

  try {//getA8Top().startProc('');
  } catch (e) {}

  submitMap(data, genericURL + "?method=deletePeople", "showDiagramFrame"); //    $("#deletePeoplePanel").html("").css("display", "none");

  $("#deletePeoplePanel").hide(); //("").css("display", "none");
  //    $("#darkbox").hide();
} //取消减签


function cancelDeletePeople() {
  $("#deletePeoplePanel").html("").css("display", "none");
  $("#darkbox").hide(); //hide("fast");
} //终止,要求保存终止的意见,附件信息


function stepStop(_x3) {
  return _stepStop.apply(this, arguments);
} //公文转发为，主要应用是收文转发文，发文也转发文


function _stepStop() {
  _stepStop = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(theForm) {
    var contentOP, content, opinionPolicy, cancelOpinionPolicy, disAgreeOpinionPolicy, childrenPageAttitude, i, puobj, re, result, affairId, ret, edocJsonStr, summaryId, currentNodeId;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            disabledPrecessButtonEdoc();

            if (isAffairValid(affair_id)) {
              _context8.next = 4;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 4:
            //GOV-4932 终止后的公文，终止给出的意见不显示 start
            contentOP = contentIframe.document.getElementById("contentOP");

            if (!contentOP) {
              _context8.next = 28;
              break;
            }

            content = contentOP.value;
            document.getElementById("contentOP").value = content;
            opinionPolicy = document.getElementById("opinionPolicy");
            cancelOpinionPolicy = document.getElementById("cancelOpinionPolicy");
            disAgreeOpinionPolicy = document.getElementById("disAgreeOpinionPolicy");

            if (!(opinionPolicy && opinionPolicy.value == 1 && contentOP)) {
              _context8.next = 18;
              break;
            }

            if (!(content.trim() == '')) {
              _context8.next = 16;
              break;
            }

            enablePrecessButtonEdoc();
            alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
            return _context8.abrupt("return");

          case 16:
            _context8.next = 28;
            break;

          case 18:
            if (!(cancelOpinionPolicy && cancelOpinionPolicy.value == 1 && contentOP)) {
              _context8.next = 23;
              break;
            }

            if (!(content.trim() == '')) {
              _context8.next = 23;
              break;
            }

            enablePrecessButtonEdoc();
            alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
            return _context8.abrupt("return");

          case 23:
            if (!(disAgreeOpinionPolicy && disAgreeOpinionPolicy.value == 1 && contentOP)) {
              _context8.next = 28;
              break;
            }

            if (!(content.trim() == '' && isDisAgreeChecked(contentIframe))) {
              _context8.next = 28;
              break;
            }

            enablePrecessButtonEdoc();
            alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
            return _context8.abrupt("return");

          case 28:
            childrenPageAttitude = contentIframe.document.getElementsByName("attitude");

            if (childrenPageAttitude) {
              for (i = 0; i < childrenPageAttitude.length; i++) {
                if (childrenPageAttitude[i].checked == true) {
                  document.getElementsByName("attitude")[i].checked = true;
                }
              }
            } //GOV-4932 终止后的公文，终止给出的意见不显示 end
            //回退的时候清除匹配人员,避免因为下一节点没有匹配到人员禁止回退


            $('#processModeSelectorContainer').html("");

            if (checkForm(theForm)) {
              _context8.next = 34;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 34:
            puobj = getProcessAndUserId(); //终止加锁

            re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser, EdocLock.STEP_STOP);

            if (!(re[0] == "false")) {
              _context8.next = 40;
              break;
            }

            enablePrecessButtonEdoc();
            parent.parent.$.alert(re[1]);
            return _context8.abrupt("return");

          case 40:
            // var result= canChangeNode(puobj.workitemId);
            result = canStopFlow(puobj.caseId);

            if (!(result[0] != 'true')) {
              _context8.next = 45;
              break;
            }

            enablePrecessButtonEdoc();
            alert(result[1]);
            return _context8.abrupt("return");

          case 45:
            //判断公文affair事项是否还在待办中
            affairId = document.getElementById("affair_id").value;
            ret = canHandle(affairId);

            if (!(ret != 'canHandle')) {
              _context8.next = 50;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 50:
            edocJsonStr = edocSubmitJsonStrValues();
            summaryId = document.getElementById("summary_id").value;
            currentNodeId = document.getElementById("currentNodeId").value;

            if (executeWorkflowBeforeEvent("BeforeStop", summaryId, affairId, puobj.processId, puobj.processId, currentNodeId, edocJsonStr, "sendEdoc")) {
              _context8.next = 56;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 56:
            if (window.confirm(_("edocLang.edoc_confirmStepStopItem"))) {
              _context8.next = 60;
              break;
            }

            enablePrecessButtonEdoc();
            EdocLock.releaseWorkflowByAction(puobj.processId, puobj.currentUser, EdocLock.STEP_STOP);
            return _context8.abrupt("return");

          case 60:
            if (parent.detailMainFrame.contentIframe.saveEdocForm("stepstop")) {
              _context8.next = 63;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 63:
            _context8.next = 65;
            return saveContent();

          case 65:
            if (_context8.sent) {
              _context8.next = 68;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 68:
            if (parent.detailMainFrame.contentIframe.saveHwData()) {
              _context8.next = 71;
              break;
            }

            enablePrecessButtonEdoc();
            return _context8.abrupt("return");

          case 71:
            theForm.action = genericURL + "?method=stepStop";
            saveAttachment();
            document.getElementById("processButton").disabled = true;

            try {
              document.getElementById("zcdbButton").disabled = true;
            } catch (e) {}

            try {
              //如果是弹出窗口，则不能显示“处理中”
              getA8Top().startProc('');
            } catch (e) {}

            cancelConfirm();
            disableButton("stepStopSpan");
            disableButton("stepBackSpan");
            theForm.submit();

          case 80:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _stepStop.apply(this, arguments);
}

function transmitSend(summaryId, affairId, edocType) {
  cancelConfirm();

  if (isGovdocCreateRole != "true") {
    //没有公文发起权
    alert(_("edocLang.alert_not_edoccreate"));
    return;
  }

  var url = _ctxPath + "/govdoc/govdoc.do?method=newGovdoc&app=4&sub_app=1&forwardAffairId=" + affairId + "&from=oldForward";
  window.open(url);
  window.close();
}

function getProcessAndUserId() {
  var obj = {};
  var processId = document.getElementById("processId").value;
  var currentUser = document.getElementById("ajaxUserId").value;
  var workitemId = document.getElementById("workitemId").value;
  var caseId = document.getElementById("caseId").value;
  var summaryIdObj = document.getElementById("summary_id");

  if (summaryIdObj) {
    obj.summaryId = summaryIdObj.value;
  }

  obj.processId = processId;
  obj.currentUser = currentUser;
  obj.workitemId = workitemId;
  obj.caseId = caseId;
  return obj;
} //回退,要求保存回退的意�?附件信息


function stepBack(theForm) {
  disabledPrecessButtonEdoc(); //OA-31424 节点权限签报审批设置了意见必填，待办进行回退时未判断是否意见必填 start

  var content = contentIframe.document.getElementById("contentOP");
  var opinionPolicy = document.getElementById("opinionPolicy");
  var cancelOpinionPolicy = document.getElementById("cancelOpinionPolicy");
  var disAgreeOpinionPolicy = document.getElementById("disAgreeOpinionPolicy");

  if (opinionPolicy && opinionPolicy.value == 1 && content) {
    if (content.value.trim() == '') {
      enablePrecessButtonEdoc();
      alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
      return;
    }
  } else {
    if (cancelOpinionPolicy && cancelOpinionPolicy.value == 1 && content) {
      if (content.value.trim() == '') {
        enablePrecessButtonEdoc();
        alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
        return;
      }
    } //意见不同意，校验意见内容


    if (disAgreeOpinionPolicy && disAgreeOpinionPolicy.value == 1 && content) {
      if (content.value.trim() == '' && isDisAgreeChecked(contentIframe)) {
        enablePrecessButtonEdoc();
        alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
        return;
      }
    }
  }

  if (!isAffairValid(affair_id)) {
    enablePrecessButtonEdoc();
    return;
  } //OA-31424 节点权限签报审批设置了意见必填，待办进行回退时未判断是否意见必填 end


  var puobj = getProcessAndUserId(); //回退加锁

  var re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser, EdocLock.STEP_BACK);

  if (re[0] == "false") {
    enablePrecessButtonEdoc();
    parent.parent.$.alert(re[1]);
    return;
  } //回退的时候清除匹配人员,避免因为下一节点没有匹配到人员禁止回退


  $('#processModeSelectorContainer').html("");

  if (!checkForm(theForm)) {
    enablePrecessButtonEdoc();
    return;
  } //加验证——————是否可以进行退回操作


  var canObj = getCanTakeBacData();
  var re = edocCanStepBack(canObj.workitemId, canObj.processId, canObj.nodeId, canObj.caseId);

  if (re[0] != 'true') {
    enablePrecessButtonEdoc();
    alert(re[1]);
    return;
  }

  var edocJsonStr = edocSubmitJsonStrValues();

  if (!executeWorkflowBeforeEvent("BeforeStepBack", summaryId, affair_id, canObj.processId, canObj.processId, canObj.nodeId, edocJsonStr, "sendEdoc")) {
    enablePrecessButtonEdoc();
    return;
  } //        if (!window.confirm(_("edocLang.edoc_confirmStepBackItem")+"555555555555555555555555"))
  //        {
  //           return;
  //        }

  /**开始**/


  var dialog = parent.parent.$.dialog({
    targetWindow: parent.parent.getCtpTop(),
    id: 'stepbackdialog',
    url: jsContextPath + "/collaboration/stepBack.do?method=stepBackDialog&affairId=" + affair_id + "&nodeattitude=" + $("#nodeattitude").val(),
    width: 400,
    height: 150,
    title: v3x.getMessage("common.system.hint.label"),
    //系统提示
    closeParam: {
      show: true,
      autoClose: true,
      handler: function handler() {
        enablePrecessButtonEdoc();
        EdocLock.releaseWorkflowByAction(puobj.processId, puobj.currentUser, EdocLock.STEP_BACK);
      }
    },
    buttons: [{
      text: v3x.getMessage("common.confirm.label"),
      //确定
      handler: function () {
        var _handler = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var rv, trackWorkflowType, optionType;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  rv = dialog.getReturnValue();

                  if (rv) {
                    _context.next = 3;
                    break;
                  }

                  return _context.abrupt("return");

                case 3:
                  trackWorkflowType = rv[0];
                  dialog.close();
                  /**copy进来开始**/

                  if (typeof beforeSubmitButton === "undefined" ? "undefined" : _typeof(beforeSubmitButton)) beforeSubmitButton();

                  if (contentIframe.saveEdocForm("stepback")) {
                    _context.next = 8;
                    break;
                  }

                  return _context.abrupt("return");

                case 8:
                  _context.next = 10;
                  return saveContent();

                case 10:
                  if (_context.sent) {
                    _context.next = 12;
                    break;
                  }

                  return _context.abrupt("return");

                case 12:
                  if (contentIframe.saveHwData()) {
                    _context.next = 14;
                    break;
                  }

                  return _context.abrupt("return");

                case 14:
                  optionType = document.getElementById("optionType").value; //这里在url后加上意见内容，不然controller中无法获得

                  /*var contentOP = "";
                            //意见不一定能填写
                            if(contentIframe.document.getElementById("contentOP")){
                              contentOP=contentIframe.document.getElementById("contentOP").value;
                            }*/

                  theForm.action = genericURL + "?method=stepBack&optionType=" + optionType + "&trackWorkflowType=" + trackWorkflowType;
                  saveAttachment();
                  document.getElementById("processButton").disabled = true;

                  try {
                    document.getElementById("zcdbButton").disabled = true;
                  } catch (e) {}

                  try {
                    //如果是弹出窗口，则不能显示“处理中”
                    getA8Top().startProc('');
                  } catch (e) {}

                  disableButton("stepStopSpan");
                  disableButton("stepBackSpan");
                  theForm.submit();
                  /**copy进来结束**/

                case 23:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function handler() {
          return _handler.apply(this, arguments);
        }

        return handler;
      }()
    }, {
      text: v3x.getMessage("common.button.cancel.label"),
      //取消
      handler: function handler() {
        enablePrecessButtonEdoc();
        EdocLock.releaseWorkflowByAction(puobj.processId, puobj.currentUser, EdocLock.STEP_BACK);
        dialog.close();
      }
    }]
  });
  cancelConfirm();
}
/**详细界面 增加流程追溯的按钮 add by libing 开始**/


function showOrCloseWorkflowTrace_edoc() {
  var dialog = parent.parent.$.dialog({
    //流程追溯
    targetWindow: parent.parent.getCtpTop(),
    id: 'workflowTrace',
    url: jsContextPath + "/trace/traceWorkflow.do?method=showWorkflowDetail&affairId=" + affair_id + "&app=4",
    width: 800,
    height: 420,
    title: V5_Edoc().$.i18n("edoc.title.back.track.flow")
  });
}
/**详细界面 增加流程追溯的按钮 add by libing 结束**/
//会签


function selectColAssign(elements) {
  if (!checkModifyingProcessAndLock(process_Id, summary_id)) {
    return;
  }

  if (!elements || elements == undefined) return;
  var people = serializeElementsNoType(elements);

  if (!people) {
    return;
  }

  var data = {
    summary_id: summary_id,
    affairId: affairId,
    people: people,
    flowcomm: "col"
  };

  try {
    getA8Top().startProc('');
  } catch (e) {}

  submitMap(data, genericURL + "?method=colAssign", "showDiagramFrame", "post");
} //传阅选人回调函数


function selectPassRead(elements) {
  if (!checkModifyingProcessAndLock(process_Id, summary_id)) {
    return;
  }

  if (!elements || elements == undefined) return;
  var people = serializeElementsNoType(elements);

  if (!people) {
    return;
  }

  var data = {
    summary_id: summary_id,
    affairId: affairId,
    people: people,
    flowcomm: "chuanyue"
  };

  try {
    getA8Top().startProc('');
  } catch (e) {}

  submitMap(data, genericURL + "?method=addPassRead", "showDiagramFrame");
} //会签


function colAssign(_summary_id, _processId, _affairId) {
  if (!checkModifyingProcessAndLock(_processId, _summary_id)) {
    return;
  } //检测xmls是否已经被加载


  initCaseProcessXML(); //设置成全局变量

  summary_id = _summary_id;
  affairId = _affairId;
  process_Id = _processId;
  selectPeopleFun_colAssign();
} //传阅


function addPassInform(_summary_id, _processId, _affairId) {
  if (!checkModifyingProcessAndLock(_processId, _summary_id)) {
    return;
  } //检测xmls是否已经被加载


  initCaseProcessXML();

  if (v3x.getBrowserFlag('pageBreak')) {
    //设置成全局变量
    summary_id = _summary_id;
    affairId = _affairId;
    process_Id = _processId;
    selectPeopleFun_passRead();
  } else {
    var app = document.getElementById("appName");
    var appName = "";

    if (app) {
      appName = app.value;
    }

    var divObj = "<div id=\"addInformWin\" closed=\"true\">" + "<iframe id=\"addInformWin_Iframe\" name=\"addInformWin_Iframe\" width=\"100%\" height=\"100%\" scrolling=\"no\" frameborder=\"0\"></iframe>" + "</div>";
    $(divObj).appendTo("body");
    $("#addInformWin").dialog({
      title: v3x.getMessage("common.portal.section.affair.select.people.label"),
      top: 50,
      left: 50,
      width: 630,
      height: 450,
      closed: false,
      modal: true,
      buttons: [{
        text: v3x.getMessage("common.button.ok.label"),
        handler: function handler() {
          var rv = $("#addInformWin_Iframe").get(0).contentWindow.OK();
          $('#addInformWin').dialog('destroy');
        }
      }, {
        text: v3x.getMessage("common.button.cancel.label"),
        handler: function handler() {
          $('#addInformWin').dialog('destroy');
        }
      }]
    });
    $("#addInformWin_Iframe").attr("src", colWorkFlowURL + "?method=preAddInform&summaryId=" + _summary_id + "&affairId=" + _affairId + "&processId=" + _processId + "&appName=" + appName);
  }
}

function setPeopleFields(elements, frameNames) {
  var theForm = document.getElementsByName("sendForm")[0];
  document.getElementById("people").innerHTML = "";

  if (!elements) {
    return false;
  }

  var personList = elements[0] || [];
  var flowType = elements[1] || 0;
  var isShowShortName = elements[2];
  var isShowWorkflow = flowType == "2"; //多层

  if (isShowWorkflow) {
    flowType = 0;
    elements[1] = 0;
  }

  var str = "";
  var workFlowContent = "";

  for (var i = 0; i < personList.length; i++) {
    if (i > 0) {
      workFlowContent += ",";
    }

    var person = personList[i];
    str += '<input type="hidden" name="userType" value="' + person.type + '" />';
    str += '<input type="hidden" name="userId" value="' + person.id + '" />';
    str += '<input type="hidden" name="userName" value="' + escapeStringToHTML(person.name) + '" />';
    str += '<input type="hidden" name="accountId" value="' + person.accountId + '" />';
    str += '<input type="hidden" name="accountShortname" value="' + escapeStringToHTML(person.accountShortname) + '" />';
    workFlowContent += person.name + "(" + defaultPermName + ")";
  }

  str += '<input type="hidden" name="flowType" value="' + flowType + '" />';
  document.getElementById("people").innerHTML = str;
  hasWorkflow = true;
  isFromTemplate = false;
  document.getElementById("workflowInfo").value = workFlowContent;
  theForm.process_desc_by.value = 'people';
  window.selectedElements = elements;

  if (isShowWorkflow) {
    //显示流程
    designWorkFlow(frameNames);
  }

  return true;
}

var _openDetailLastTime = 0;

function openDetail(subject, _url) {
  //该方法执行时间间隔设置成300ms, 防止快速点击, 特列，ff下双击执行的是两次单击
  var tempNow = new Date();
  var currentTime = tempNow.getTime();

  if (_openDetailLastTime == 0) {
    _openDetailLastTime = currentTime;
  } else {
    var interval = currentTime - _openDetailLastTime; //时间差

    _openDetailLastTime = currentTime;

    if (interval < 300) {
      return;
    }
  }

  _url += CsrfGuard.getUrlSurffix(); // 'subject'判断是否是交换公文

  if (subject == 'exchange') {
    //在代码没有找到相关代码，应该废弃了，written by xuqiangwei
    _url = _url;
  } else {
    _url = genericURL + "?method=detailIFrame&" + _url;

    if ("listPending" == subject || "listReading" == subject || "" == subject) {
      var rv = v3x.openWindow({
        url: _url,
        workSpaceFull: 'yes',
        dialogType: 'open'
      });
    } else {
      var rv = v3x.openWindow({
        url: _url,
        workSpaceFull: 'yes',
        dialogType: 'open'
      });
    }
  } //mark by xuqiangwei 修改Chrome37这里可能会有问题


  if (rv == "true") {
    //当从待办和待阅列表中打开处理页面提交后，只刷新列表页面不刷新整个框架页面
    //不然从待登记中 转发文的公文，进行处理后会刷新整个框架转到收文待办
    if (subject == 'listReading' || subject == 'listPending') {
      document.location.reload();
    } else {
      try {
        getA8Top().reFlesh();
      } catch (e) {
        document.location.reload();
      }
    } //        parent.location.href = '../../../portal/_ns:YVAtMTBkZjFmNmRjMWItMTAwMDF8YzB8ZDB8ZV9zcGFnZT0xPS9jb2xsYWJvcmF0aW9uLmRv/seeyon/collaboration.psml?method=collaborationFrame&from=Pending'
    //        top.showPanel('collaboration_pending');

  }
} //打开收文关联的发文


function openRelationSendV(recEdocId, recType, forwardType) {
  var url = "edocController.do?method=relationNewEdoc&recEdocId=" + recEdocId + "&recType=" + recType + "&forwardType=" + forwardType + "&newDate=" + new Date().getTime();
  window.openRelationSendVWin = getA8Top().$.dialog({
    title: '',
    transParams: {
      'parentWin': window
    },
    url: url,
    targetWindow: getA8Top(),
    width: "600",
    height: "600"
  }); //不知为何有返回参数，修改Chrome37时注释

  if (rv == "true") {
    getA8Top().reFlesh();
  }
}
/**
 * 删除
 */


function deleteIt() {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      break;
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertDeleteItem"));
    return;
  }

  if (window.confirm(v3x.getMessage("edocLang.edoc_confirmDeleteItem"))) {
    theForm.action = deleteActionURL;
    disableButtons();
    theForm.target = "_self";
    theForm.submit();
  }
}

var page_types = {
  'draft': 'draft',
  'sent': 'sent',
  'pending': 'pending',
  'finish': 'finish'
};

function deleteItems(pageType) {
  if (!pageType || !page_types[pageType]) {
    alert('pageType is illegal:' + pageType);
    return false;
  }

  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return true;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length; //收文 待发/分发待发 电子登记不允许删除

  var _alertMsg = V5_Edoc().$.i18n("edoc.noDelete.electronic.documents"); //以下公文为电子公文，不能进行删除操作, 您可以进行回退操作


  var _eConut = 0; //待发中如果是指定退回，直接提交给我的数据不允许删除

  var deleteConfirm = V5_Edoc().$.i18n("edoc.noDelete.assigned.return"); //以下流程处于指定回退状态，不允许做删除操作

  var deleteConunt = 0;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      var tempSubject = "\r " + V5_Edoc().$.i18n("edoc.symbol.opening.chevron") + id_checkbox[i].getAttribute("subject") + V5_Edoc().$.i18n("edoc.symbol.closing.chevron");

      if (id_checkbox[i].getAttribute("substate") == 16) {
        deleteConfirm += tempSubject;
        deleteConunt++;
      } //电子公文不允许删除, 只对待发进行判断


      if (pageType == 'draft') {
        var isAutoRegister = id_checkbox[i].getAttribute("autoRegister");
        var tempReceiveId = id_checkbox[i].getAttribute("receiveId");
        var registerType = id_checkbox[i].getAttribute("registerType");

        if (!((isAutoRegister == "1" || isAutoRegister == "") && (!tempReceiveId || tempReceiveId == "0" || tempReceiveId == "1")) //2015年8月28日 修改isOpenRegister判断  简化公文交换环节，以前开关只有两个选项，是boolean类型，现在有三个选项，修改判断 xiex
        && !(window.isG6 == "true" && window._isOpenRegister != "1" && registerType != 1)) {
          _alertMsg += tempSubject;
          _eConut++;
        }
      }
    }
  }

  if (deleteConunt != 0) {
    alert(deleteConfirm);
    return false;
  }

  if (_eConut > 0) {
    alert(_alertMsg);
    return false;
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertDeleteItem"));
    return true;
  }

  if (window.confirm(v3x.getMessage("edocLang.edoc_confirmDeleteItem"))) {
    theForm.action = collaborationCanstant.deleteActionURL;
    disableButtons();

    for (var i = 0; i < id_checkbox.length; i++) {
      var checkbox = id_checkbox[i];
      if (!checkbox.checked) continue;
      var affairId = checkbox.getAttribute("affairId"); //var element = document.createElement("<INPUT TYPE=HIDDEN NAME=affairId value='" + affairId + "' />");

      var element = document.createElement("input");
      element.setAttribute('type', 'hidden');
      element.setAttribute('name', 'affairId');
      element.setAttribute('value', affairId);
      theForm.appendChild(element);
    } //var element = document.createElement("<INPUT TYPE=HIDDEN NAME=pageType value='" + pageType + "' />");


    var element2 = document.createElement("input");
    element2.setAttribute('type', 'hidden');
    element2.setAttribute('name', 'pageType');
    element2.setAttribute('value', pageType);
    theForm.appendChild(element2);
    theForm.target = "tempIframe";
    theForm.method = "POST";
    theForm.submit();
    return true;
  }
} //取回


var clickCount = 0; //取回重复点击计数

function takeBack(pageType) {
  clickCount++;

  if (clickCount > 1) {
    //重复点击给出提示
    var msg = v3x.getMessage("edocLang.edoc_click_alert");
    alert(msg);
    clickCount = 0;
    return;
  }

  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    clickCount = 0;
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    clickCount = 0;
    return true;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length;
  var countChecked = 0;
  var obj;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      obj = id_checkbox[i];
      hasMoreElement = true;
      countChecked++;
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertTakeBackItem"));
    clickCount = 0;
    return true;
  }

  if (countChecked > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectTakeBackOnlyOne"));
    clickCount = 0;
    return true;
  }

  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "canTakeBack", false);
  requestCaller.addParameter(1, "String", "edoc");
  requestCaller.addParameter(2, 'String', obj.getAttribute("processId"));
  requestCaller.addParameter(3, 'String', obj.getAttribute("activityId"));
  requestCaller.addParameter(4, 'String', obj.getAttribute("workitemId"));
  requestCaller.addParameter(5, 'String', obj.getAttribute("affairId"));
  var state = requestCaller.serviceRequest();

  if (state == "-1") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve0");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "1") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve1");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "2") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve2");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "3") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve3");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "4") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve4");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "5") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve5");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "6") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve6");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "7") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve7");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "8") {
    str = v3x.getMessage("edocLang.edoc_flow_Retrieve8");
    alert(str);
    clickCount = 0;
    return;
  } else if (state == "11") {
    str = v3x.getMessage("edocLang.edoc_cancel_takeback");
    alert(str);
    document.location.reload();
    clickCount = 0;
    return;
  } else if (state == "12") {
    str = v3x.getMessage("edocLang.edoc_stepback_takeback");
    alert(str);
    document.location.reload();
    clickCount = 0;
    return;
  }

  if (obj.nodePolicy == "zhihui" || obj.nodePolicy == "inform") {
    alert(v3x.getMessage("collaborationLang.collaboration_zhihuiTakeBackItem"));
    clickCount = 0;
    return;
  } //由主流程自动触发的新流程不可撤销


  if (obj.isNewflow == "true") {
    alert(v3x.getMessage("collaborationLang.warn_workflowIsNewflow_cannotTakeBack"));
    clickCount = 0;
    return;
  }

  var summaryId = obj.value; //取回加锁

  var re = EdocLock.lockWorkflow(obj.getAttribute("processId"), document.getElementById("currentUserId").value, EdocLock.TAKE_BACK);

  if (re[0] == "false") {
    parent.parent.parent.$.alert(re[1]);
    clickCount = 0;
    return;
  }

  if (!executeWorkflowBeforeEvent("BeforeTakeBack", summaryId, obj.getAttribute("affairId"), obj.getAttribute("processId"), obj.getAttribute("processId"), obj.getAttribute("activityId"), "", "")) {
    clickCount = 0;
    return;
  } //判断是否已经被发送


  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "isBeSended", false);
  requestCaller.addParameter(1, "Long", summaryId);
  var rs = requestCaller.serviceRequest();

  if (rs == 'true') {
    var msg = v3x.getMessage("edocLang.edoc_state_end_takeback_sendalert") + V5_Edoc().$.i18n("edoc.symbol.opening.chevron") + obj.getAttribute("subject") + V5_Edoc().$.i18n("edoc.symbol.closing.chevron") + "\n";
    alert(msg);
    clickCount = 0;
    return false;
  }

  if (window.confirm(v3x.getMessage("edocLang.edoc_confirmTakeBackItem"))) {
    theForm.action = collaborationCanstant.takeBackURL;
    disableButtons();
    var affairId = obj.getAttribute("affairId"); //var element = document.createElement("<INPUT TYPE=HIDDEN NAME=affairId value='" + affairId + "' />");

    var element = document.createElement('input');
    element.setAttribute('type', 'hidden');
    element.setAttribute('name', 'affairId');
    element.setAttribute('value', affairId); // var element1 = document.createElement("<INPUT TYPE=HIDDEN NAME=summaryId value='" + summaryId + "' />");

    var element1 = document.createElement('input');
    element1.setAttribute('type', 'hidden');
    element1.setAttribute('name', 'summaryId');
    element1.setAttribute('value', summaryId);
    theForm.appendChild(element);
    theForm.appendChild(element1); // var element = document.createElement("<INPUT TYPE=HIDDEN NAME=pageType value='" + pageType + "' />");

    var element3 = document.createElement('input');
    element3.setAttribute('type', 'hidden');
    element3.setAttribute('name', 'pageType');
    element3.setAttribute('value', pageType);
    theForm.appendChild(element3);
    theForm.target = "tempIframe";
    theForm.method = "POST"; //getA8Top().startProc('');

    theForm.submit();
    clickCount = 0; //重复点击计数归零

    return true;
  } else {
    clickCount = 0; //重复点击计数归零

    EdocLock.releaseWorkflowByAction(obj.processId, document.getElementById("currentUserId").value, EdocLock.TAKE_BACK);
  }
} //催办回调


function hastenCallback() {
  $("#flashContainer").children(".information").css("background-color", "yellow").html(_("collaborationLang.operation_completed"));
  setTimeout('$("#flashContainer").children(".information").hide()', 2000);
} //催办提交


function submitHasten() {
  var val = $(".additional_remark");
  val = val[0].value; //[$(".additional_remark").length-1].val();
  //    TB_remove();

  $("#hastenPanel").hide();
  var data = {
    processId: processId,
    activityId: activityId,
    additional_remark: val
  };

  if ($("#flashContainer").children(".information").length == 0) {
    $("#flashContainer").prepend("<div class='information'>" + _("collaborationLang.operation_processing") + "</div>");
  }

  $("#flashContainer").children(".information").css("background-color", "#FF0000").show();
  $.post(collaborationCanstant.hastenActionURL, data, hastenCallback);
} //催办功能的两个全局变量


var processId = null;
var activityId = null; //催办

function hasten(_processId, _activityId) {
  processId = _processId;
  activityId = _activityId; //    TB_show(_("collaborationLang.hasten_caption"),"#TB_inline?width=300&height=400&inlineId=hastenPanel",false);

  $("#hastenPanel").show();
  return false;
} //催办对话框取�?


function cancelHasten() {
  $("#hastenPanel").hide();
} //从待办列表中直接发送的选人界面


function selectPeopleSendImmediate() {
  selectPeopleFun_receive();
}

function selectPeopleFromWaitSend(elements) {
  var str = serializePeople(elements);
}

function forwardItem() {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return true;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return true;
  }

  var selectedCount = 0;
  var summaryId = null;
  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      summaryId = id_checkbox[i].value;
      selectedCount++;
    }
  }

  if (selectedCount == 0) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectForwardItem"));
    return true;
  }

  if (selectedCount > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectForwardOnlyOne"));
    return true;
  }

  var rv = getA8Top().v3x.openWindow({
    url: genericURL + "?method=showForward&summaryId=" + summaryId,
    height: 400,
    width: 360
  });
  return true;
}

function initProcessXml() {
  document.getElementsByName("sendForm")[0].process_xml.value = caseProcessXML;
}

function disableButtons() {
  disableButton("send");
  disableButton("save");
  disableButton("saveAs");
  disableButton("templete");
  disableButton("delete");
}

function enableButtons() {
  enableButton("send");
  enableButton("save");
  enableButton("saveAs");
  enableButton("templete");
  enableButton("delete");
}

function showDetail(detailURL1) {
  //    setTimeout("parent.detailFrame.location.href = '" + detailURL + "'",1000);
  parent.detailFrame.location.href = genericURL + "?method=detail&" + detailURL1;
} //lijl添加2011-10-17,收文列表,点击进入详细信息


function showDetailInfo(detailURL1) {
  //    setTimeout("parent.detailFrame.location.href = '" + detailURL + "'",1000);
  //alert(genericURL + "?method=detail&" + detailURL1);
  parent.detailFrame.location.href = genericURL + "?method=edocRegisterDetail&" + detailURL1;
}

function doWorkFlow(flag) {
  if (flag == "no") {//TODO 清空流程
  } else if (flag == "new") {
    try {
      var result = selectPeopleFun_wf();
    } catch (e) {}
  }
}

function selectPersonToXml() {
  processing = true;
  var url = genericControllerURL + "collaboration/monitor&comm=toxml";
  var toXmlFrame = document.getElementById("toXmlFrame");
  toXmlFrame.src = url;
}
/**
 * 处理后事�?
 */


function doEndSign() {
  if (window.opener) {
    window.opener.location.reload();
    window.close();
  }

  if (window.dialogArguments) {
    window.returnValue = "true";
    getA8Top().close();
  } else {
    parent.location.href = genericURL + '?method=edocFrame&from=listPending&edocType=' + edocType;
    getA8Top().showPanel('collaboration_pending');
  }
}

function doEndSign_dealrepeal(fail) {
  /*参数fail表示：如果不传该参数表示撤销成功，会弹出成功的alert窗口，如果传了fail表示撤销失败*/
  if (fail == undefined) {
    alert(v3x.getMessage("edocLang.operateOk"));
  }

  if (parent.parent.callbackFunction) {
    parent.parent.callbackFunction();
  } else {
    doEndSign_pending();
  }
} //公文暂存待办，提交，回退，终止回调函数，该函数用于关闭公文处理界面及刷新父页面


function doEndSign_pending(affairId) {
  try {
    //办公桌面
    try {
      if (typeof window.top != 'undefined' && typeof window.top.opener != 'undefined' && typeof window.top.opener.getCtpTop != 'undefined' && typeof window.top.opener.getCtpTop().refreshDeskTopPendingList != 'undefined') {
        window.top.opener.getCtpTop().refreshDeskTopPendingList();

        __refreshTopPendList(); //OA-68333无法刷新首页待办数据修改
        //刷新我的提醒栏目


        var _win = window.top.opener.$("#main")[0].contentWindow;

        if (_win != undefined) {
          _win.sectionHandler.reload("collaborationRemindSection", true);
        }

        getA8Top().close();
        return;
      }
    } catch (e) {} //判断当前页面是否是主窗口页面


    if (getA8Top().isCtpTop) {//暂时没有弹出的dialg
    } else {
      __refreshTopPendList(); //删除多窗口记录


      if (affairId) {
        removeCtpWindow(affairId, 2);
      }
    }
  } catch (e) {}

  refreshOpener();
  getA8Top().close();
}
/**
 * 刷新首页待办列表，从doEndSign_pending抽离
 * @param affairId
 */


function __refreshTopPendList() {
  var _win = window.top.opener.$("#main")[0].contentWindow;

  if (_win != undefined) {
    //判断当前是否是首页栏目
    if (_win.sectionHandler != undefined) {
      //首页栏目（当点击了统计图条件后处理）
      if (_win.params != undefined && _win.params.selectChartId != "") {
        _win._collCloseAndFresh(_win.params.iframeSectionId, _win.params.selectChartId, _win.params.dataNameTemp);
      } else {
        //进入首页待办栏目直接处理
        _win.sectionHandler.reload("pendingSection", true);
      }
    } else {
      if (_win.closeAndFresh) {
        //待办栏目更多
        _win.closeAndFresh();
      } else {
        _win.location = _win.location;
      }
    }
  } else {
    //刷新公文待办列表
    _win = window.top.opener;
    /*
      	  代办列表处理后保持分页信息刷新
      	  if(_win && _win.name != "listFrame"){
      	     _win = _win.parent;
      	 }*/

    if (typeof _win != "undefined" && _win.name != "mainIframe") {
      _win = window.top.opener.$("#main")[0];
    } //刷新列表


    if (typeof _win != "undefined") {
      if (_win.closeAndFresh) {
        //待办栏目更多
        _win.closeAndFresh();
      } else {
        _win.location = _win.location;
      }
    }
  }
} //签收后调用方法


function doEndSign(type) {
  location.reload();
}
/**
 * 验证内部文号是否重复，除开自己。
 */


function checkSerialNoExcludeSelf() {
  //  格式：serialNoValue  "0|String||3" 手写输入
  var serialNo = document.getElementById("my:serial_no");

  if (!serialNo) {
    return true;
  }

  var serialNoValueStr = serialNo.value;
  var serialNoValue = "";

  if (serialNoValueStr.indexOf("|") == -1) {
    //非编辑模式下，不是上面那种预期格式
    serialNoValue = serialNoValueStr;
  } else {
    serialNoValueStr = serialNoValueStr.substring(serialNoValueStr.indexOf("|") + 1);
    serialNoValue = serialNoValueStr.substring(0, serialNoValueStr.indexOf("|")); //文号
  } //空的文号不用发请求验证是否被占用


  if (serialNoValue != "") {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkSerialNoExcludeSelf", false);
    requestCaller.addParameter(1, "String", summaryId);
    requestCaller.addParameter(2, "String", serialNoValue);
    var rs = requestCaller.serviceRequest(); //(0:未使用内部文号 | 1：已使用该内部文号)

    if (rs == "1") {
      //已经被占用
      alert(_("edocLang.doc_innermark_used"));
      return false;
    }
  }

  return true;
}

function checkDocMarkExcludeSelf() {
  //  格式：serialNoValue  "0|String||3" 手写输入
  var serialNo = document.getElementById("my:doc_mark");
  var orgAccountId = document.getElementById("orgAccountId").value;
  var serialNoValue = "";

  if (serialNo) {
    var serialNoValueStr = serialNo.value;

    if (serialNoValueStr.indexOf("|") == -1) {
      //非编辑模式下，不是上面那种预期格式
      serialNoValue = serialNoValueStr;
    } else {
      serialNoValueStr = serialNoValueStr.substring(serialNoValueStr.indexOf("|") + 1);
      serialNoValue = serialNoValueStr.substring(0, serialNoValueStr.indexOf("|")); //文号
    }
  }

  var ret = !checkMarkHistoryExist(1, serialNoValue, summaryId, orgAccountId);
  return ret;
}
/**
 * 校验是否已经选择了归档路径
 */


function isSelectPigeonholePath() {
  var selectObj = document.getElementById("archiveId");

  if (selectObj) {
    var archiveId = selectObj.value;

    if (archiveId == '') {
      alert(_("edocLang.edoc_alertPleaseSelectPigeonholePath"));
      return false;
    } //如果设置了预归档路径，Aajax判断归档路径是否存在,没有设置预归档为了性能则不判断。


    if (hasPrepigeonholePath == 'true') {
      if (!checkPigFolder(archiveId)) {
        //设置选择框可见
        var showPrePigeonhole = document.getElementById("showPrePigeonhole");
        var showSelectPigeonholePath = document.getElementById("showSelectPigeonholePath");

        if (showPrePigeonhole && showSelectPigeonholePath) {
          showPrePigeonhole.style.display = "none";
          showSelectPigeonholePath.style.display = "";
        }

        return false;
      }
    }

    return true;
  } else {//TODO 页面没有找到对象
  }

  return false;
}

function checkPigFolder(archiveId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxDocHierarchyManager", "docResourceExist", false);
  requestCaller.addParameter(1, "Long", archiveId);
  var rs = requestCaller.serviceRequest();

  if (rs == 'false') {
    alert(_("edocLang.edoc_alertPigeonholeFolderNotExsit"));
    return false;
  }

  return true;
} //签章


function doSign(_x4, _x5) {
  return _doSign.apply(this, arguments);
}

function _doSign() {
  _doSign = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(theForm, action) {
    var pipeonhole, bool, content, opinionPolicy, requestCaller, ds, optionType, optionId, affairState, summary_id, policy, docMark, docMark2, serialNo, signing_date, reportToSupMsg, isReportToSupAccount, obj, branchNodes;
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            cancelConfirm(); //知会提交和暂存代办

            disabledPrecessButtonEdoc();
            pipeonhole = document.getElementById("pipeonhole");

            if (!(pipeonhole && pipeonhole.checked)) {
              _context9.next = 9;
              break;
            }

            if (isSelectPigeonholePath()) {
              _context9.next = 8;
              break;
            }

            enablePrecessButtonEdoc(); //OA-19615  节点权限设置（审批节点）---意见必填，待办中输入意见后提交报错   （改方法中之间是return的都加上 异常抛出，这样才能够在catch中释放锁）

            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock1"));

          case 8:
            ;

          case 9:
            if (!contentIframe.isUpdateEdocForm) {
              _context9.next = 14;
              break;
            }

            if (contentIframe.checkSerialNoExcludeSelf()) {
              _context9.next = 14;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock2"));

          case 14:
            if (!(canWordNoChange && canWordNoChange != "false" || canUpdateForm && canUpdateForm != "false")) {
              _context9.next = 19;
              break;
            }

            if (contentIframe.checkEdocMark()) {
              _context9.next = 19;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock3"));

          case 19:
            if (!(permKey == 'fengfa')) {
              _context9.next = 24;
              break;
            }

            if (contentIframe.checkDocMarkExcludeSelf()) {
              _context9.next = 24;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(V5_Edoc().$.i18n("edoc.exchange.num.occupied"));

          case 24:
            disabledPrecessButtonEdoc(); //验证交换单位是否有重复 -- start --

            bool = contentIframe.checkExchangeAccountIsDuplicatedOrNot();

            if (!(bool == false)) {
              _context9.next = 31;
              break;
            }

            alert(_("edocLang.exchange_unit_duplicated"));
            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock4"));

          case 31:
            if (!contentIframe.checkEdocFormSendToUnit()) {
              _context9.next = 34;
              break;
            }

            enablePrecessButtonEdoc();
            return _context9.abrupt("return");

          case 34:
            if (checkForm(theForm)) {
              _context9.next = 37;
              break;
            }

            enablePrecessButtonEdoc();
            return _context9.abrupt("return");

          case 37:
            //意见不能为空
            content = document.getElementById("contentOP");
            opinionPolicy = document.getElementById("opinionPolicy");

            if (!(opinionPolicy && opinionPolicy.value == 1 && content)) {
              _context9.next = 45;
              break;
            }

            if (!(content.value.trim() == '')) {
              _context9.next = 45;
              break;
            }

            alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock5"));

          case 45:
            if (contentIframe.saveEdocForm("deal")) {
              _context9.next = 49;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock7"));

          case 49:
            checkExistBody();
            _context9.next = 52;
            return saveContent();

          case 52:
            if (_context9.sent) {
              _context9.next = 56;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock8"));

          case 56:
            //try{if(!convertToPdf(theForm))return false; }catch(e){}
            //GOV-4870 会签节点，竞争执行签章和文单签批前一个人执行后，后面的人再次签章/文单签批，虽然提出了已被人竞争执行，但是还是覆盖了前面的签章
            requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocSummaryManager", "isCompeteOver", false);
            requestCaller.addParameter(1, "String", affair_id);
            ds = requestCaller.serviceRequest();

            if (!(ds == "true")) {
              _context9.next = 64;
              break;
            }

            if (contentIframe.saveHwData()) {
              _context9.next = 64;
              break;
            }

            enablePrecessButtonEdoc();
            throw new Error(v3x.getMessage("edocLang.edoc_Release_lock9"));

          case 64:
            superviseRemindMode(); //保存当前处理人提交的处理意见所带的附件

            saveAttachment();
            optionType = document.getElementById("optionType").value;
            optionId = document.getElementById("optionId").value;
            affairState = document.getElementById("affairState").value;
            summary_id = document.getElementById("summary_id").value;
            policy = document.getElementById("policy").value;
            docMark = ""; //changyi 加上公文文号

            if (contentIframe.document.getElementById("my:doc_mark")) {
              docMark = contentIframe.document.getElementById("my:doc_mark").value;
            }

            docMark2 = "";

            if (contentIframe.document.getElementById("my:doc_mark2")) {
              docMark2 = contentIframe.document.getElementById("my:doc_mark2").value;
            }

            serialNo = "";

            if (contentIframe.document.getElementById("my:serial_no")) {
              serialNo = contentIframe.document.getElementById("my:serial_no").value;
            } //紧急G6BUG_G6_v1.0_徐州市财政局信息中心_处理公文流程，公文单上的公文文号显示乱码_20120802012042
            //公文文号是有中文的，因此不能将其值设在action地址后通过get方式提交，这样会产生乱码
            //现在通过将值设置到隐藏域的方式，通过post提交解决该问题


            document.getElementById("docMark").value = docMark;
            document.getElementById("docMark2").value = docMark2;
            document.getElementById("serialNo").value = serialNo;
            signing_date = "";

            if (contentIframe.document.getElementById("my:signing_date")) {
              signing_date = contentIframe.document.getElementById("my:signing_date").value;
            }

            document.getElementById("signing_date").value = signing_date;
            reportToSupMsg = "&isReportOpinion=false";
            isReportToSupAccount = document.getElementById("isReportToSupAccount");

            if (isReportToSupAccount && isReportToSupAccount.value == 'true') {
              reportToSupMsg = "&isReportOpinion=true"; //如果上级收文流程被撤销了，需要给出提示

              requestCaller = new XMLHttpRequestCaller(this, "edocExchangeTurnRecManager", "isSupEdocCanceled", false);
              requestCaller.addParameter(1, "String", summary_id);
              ds = requestCaller.serviceRequest();

              if (ds == "true") {
                alert(V5_Edoc().$.i18n("edoc.unit.cancle")); //上级单位已将收文流程撤销，您填写的意见上级单位无法看到!
              }
            }

            obj = getProcessAndUserId();
            EdocLock.releaseWorkflowByAction(obj.processId, obj.currentUser, EdocLock.SUBMIT); //14
            //lijl添加,添加参数,意见显示的设置格式

            action += "&optionType=" + optionType + "&summary_id=" + summary_id + reportToSupMsg;
            theForm.action = action;
            branchNodes = document.getElementById("allNodes");

            if (branchNodes && branchNodes.value) {
              theForm.action += "&branchNodes=" + branchNodes.value;
            }

            theForm.method = "POST";
            theForm.target = "_self";
            theForm.submit();
            return _context9.abrupt("return");

          case 96:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this);
  }));
  return _doSign.apply(this, arguments);
}

function refreshOpener() {
  var _win = window.top.opener;

  if (_win != undefined) {
    //判断当前是否是首页栏目
    //判断当前是否是首页栏目
    if (_win.vPortal && _win.vPortal.sectionHandler != undefined) {
      //首页栏目（当点击了统计图条件后处理）
      if (_win.params != undefined && _win.params.selectChartId != "") {
        _win._collCloseAndFresh(_win.params.iframeSectionId, _win.params.selectChartId, _win.params.dataNameTemp);
      } else {
        //进入首页待办栏目直接处理
        _win.vPortal.sectionHandler.reload("pendingSection", true);

        _win.vPortal.sectionHandler.reload("agentSection", true); //表单栏目配置到首页，首页栏目直接处理表单待办协同后该待办没有自动刷新消失


        _win.vPortal.sectionHandler.reload("singleBoardFormBizConfigSection", true);
      }
    } else {
      //刷新列表
      if (_win.loadPendingGrid != undefined) {
        _win.loadPendingGrid();
      } else if (_win.main && _win.main.loadPendingGrid != undefined) {
        _win.main.loadPendingGrid();
      } else if (_win.closeAndFresh != undefined) {
        _win.closeAndFresh();
      }
    }
  }
}

function convertToPdf() {
  return _convertToPdf.apply(this, arguments);
}

function _convertToPdf() {
  _convertToPdf = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
    var productTypeMap, bodyType, ret;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return OfficeSDK.utils.allProductType();

          case 2:
            productTypeMap = _context10.sent;

            if (!(productTypeMap.ONLINE_EDIT === 'WDT' && productTypeMap.ONLINE_PREVIEW === 'ASPOSE')) {
              _context10.next = 6;
              break;
            }

            $.alert('不支持正文转PDF!');
            return _context10.abrupt("return");

          case 6:
            // todo zl
            //只有WORD和WPS具有转PDF的功能
            bodyType = document.getElementById("bodyType").value;

            if (!(bodyType == "OfficeWord" || bodyType == "WpsWord")) {
              _context10.next = 16;
              break;
            }

            _context10.next = 10;
            return convertWordToPdf();

          case 10:
            ret = _context10.sent;

            if (ret) {
              _context10.next = 13;
              break;
            }

            return _context10.abrupt("return", false);

          case 13:
            alert(v3x.getMessage("edocLang.edoc_tans2PdfSuccess"));
            _context10.next = 17;
            break;

          case 16:
            alert(v3x.getMessage("edocLang.edoc_tans2PdfOnlyWordAndWps"));

          case 17:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _convertToPdf.apply(this, arguments);
}

function convertWordToPdf() {
  return _convertWordToPdf.apply(this, arguments);
}

function _convertWordToPdf() {
  _convertWordToPdf = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            return _context12.abrupt("return", new Promise( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(resolve, reject) {
                var newPdfIdFirst, _progressBar, ret;

                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        newPdfIdFirst = document.getElementById("newPdfIdFirst").value;
                        _progressBar = getA8Top().$.progressBar();
                        _context11.prev = 2;
                        _context11.next = 5;
                        return _officeSDK.switchProvider({
                          fileType: _officeSDK.params.fileType,
                          mode: "VIEW",
                          editType: "0,0"
                        });

                      case 5:
                        _context11.next = 12;
                        break;

                      case 7:
                        _context11.prev = 7;
                        _context11.t0 = _context11["catch"](2);

                        _progressBar.close();

                        $.alert(V5_Edoc().$.i18n("当前配置，不支持转版式pdf"));
                        return _context11.abrupt("return");

                      case 12:
                        _context11.next = 14;
                        return saveOcx();

                      case 14:
                        _progressBar.close();

                        _context11.next = 17;
                        return _officeSDK.transform({
                          "newFileId": newPdfIdFirst,
                          type: "pdf"
                        });

                      case 17:
                        ret = _context11.sent;

                        if (!ret) {
                          resolve(false);
                        }

                        document.getElementById("isConvertPdf").value = "isConvertPdf";
                        resolve(true);

                      case 21:
                      case "end":
                        return _context11.stop();
                    }
                  }
                }, _callee11, null, [[2, 7]]);
              }));

              return function (_x35, _x36) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _convertWordToPdf.apply(this, arguments);
}

function edocContentUnLoad() {
  try {
    unLoadHtmlHandWrite();
  } catch (e) {}
}

function superviseCheck() {
  var mId = document.getElementById("supervisorMemberId");
  var sDate = document.getElementById("superviseDate");

  if (mId != null && sDate != null) {
    //首先判断有无督办时间和督办人员的元素
    if (mId.value == "" && sDate.value != "") {
      //如果选择了督办时间,而督办人员没有选,提示
      alert(v3x.getMessage("edocLang.edoc_supervise_select_member"));
      return false;
    }

    if (mId.value != "" && sDate.value == "") {
      //如果选择了督办人员,而督办时间没有选,提示
      alert(v3x.getMessage("edocLang.edoc_supervise_select_date"));
      return false;
    }

    if (mId.value != "" && sDate.value != "") {
      supervised = true; //如果督办时间和督办人员都设置了参数
    }
  }
}

function superviseRemindMode() {
  //暂时为在线
  //督办的提醒方式： 在线是第0位，短信是第1位，电邮是第2位 ， 分别用0,1来表示是否采用了此种提醒方式

  /*
     var online = document.getElementById("online");
     var mobile = document.getElementById("mobile");
     var email = document.getElementById("email");
  
     var primary = "0";
     var second = "0";
     var third = "0";
  
     if(online!=null && mobile!=null && email!=null){
     if(online.checked){
       primary = "1";
     }
     if(mobile.checked){
       second = "1";
     }
     if(email.checked){
       third = "1";
     }
  
     var remindMode = primary+second+third;
     */
  if (document.getElementById("remindMode")) {
    document.getElementById("remindMode").value = "100"; //100为在线,010为手机短信,001为电邮,如此类推
  }
}

function checkCopies(copies) {
  //印发份数不是所有文单都有的公文元素，需要加上判断
  if (copies && copies.value != "") {
    if (!/^(0|([1-9][0-9]*))$/.test(copies.value)) {
      alert(v3x.getMessage("edocLang.edoc_print_validate"));
      return false;
    }
  }

  return true;
}

var isCancelZcdbTime = true; //是否取消或直接关闭暂存待办提醒时间窗口

function doZcdb(_x6) {
  return _doZcdb.apply(this, arguments);
}

function _doZcdb() {
  _doZcdb = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(obj) {
    var copies, puobj, rs, canObj, re;
    return regeneratorRuntime.wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            cancelConfirm();
            edocObj._obj = obj;

            if (isAffairValid(affair_id)) {
              _context13.next = 5;
              break;
            }

            enablePrecessButtonEdoc();
            return _context13.abrupt("return");

          case 5:
            //文号不能有特殊字符
            edocObj.docMark = contentIframe.document.getElementById("my:doc_mark");
            edocObj.innerMark = contentIframe.document.getElementById("my:serial_no");

            if (checkEdocMark(edocObj.docMark, edocObj.innerMark)) {
              _context13.next = 10;
              break;
            }

            enablePrecessButtonEdoc();
            return _context13.abrupt("return");

          case 10:
            //OA-12363 修改文号，公文文号B这个字段保存不了。但是如果是修改文单，这个字段就可以保存。
            edocObj.docMark2 = contentIframe.document.getElementById("my:doc_mark2");

            if (checkEdocMark(edocObj.docMark2, edocObj.innerMark)) {
              _context13.next = 14;
              break;
            }

            enablePrecessButtonEdoc();
            return _context13.abrupt("return");

          case 14:
            if (checkNodeHasExchangeType()) {
              _context13.next = 17;
              break;
            }

            //交换类型检测
            enablePrecessButtonEdoc();
            return _context13.abrupt("return");

          case 17:
            copies = contentIframe.document.getElementById("my:copies");

            if (checkCopies(copies)) {
              _context13.next = 21;
              break;
            }

            enablePrecessButtonEdoc();
            return _context13.abrupt("return");

          case 21:
            puobj = getProcessAndUserId(); //暂存待办时检查锁

            rs = EdocLock.checkWorkflowLock(puobj.processId, puobj.currentUser, EdocLock.SUBMIT);

            if (!(rs != null && rs[0] == 'false')) {
              _context13.next = 27;
              break;
            }

            enablePrecessButtonEdoc(); //OA-20034 遇到有公文锁的时候，暂存代办的提示用的老的提示样式，提交时的提示用的新的div的模式，是否修改成统一的

            parent.parent.$.alert(rs[1]);
            return _context13.abrupt("return");

          case 27:
            //加验证——————是否可以进行暂存代办操作
            canObj = getCanTakeBacData();
            re = edocCanTemporaryPending(canObj.workitemId);

            if (!(re != null && re[0] != 'true')) {
              _context13.next = 33;
              break;
            }

            enablePrecessButtonEdoc();
            alert(re[1]);
            return _context13.abrupt("return");

          case 33:
            _context13.next = 35;
            return doZcdbCallback('true');

          case 35:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13);
  }));
  return _doZcdb.apply(this, arguments);
}

function doZcdbCallback(_x7) {
  return _doZcdbCallback.apply(this, arguments);
}
/**
 * 暂存待办提醒时间窗口
 */


function _doZcdbCallback() {
  _doZcdbCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(rv) {
    var theForm;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            if (!rv) {
              _context14.next = 26;
              break;
            }

            theForm = edocObj._obj.theform;

            if (!theForm) {
              theForm = document.getElementById("theform");
            }
            /*
              if(!checkModifyingProcess(theForm.processId.value, theForm.summary_id.value)){
                return;
              }*/


            if (contentIframe.saveEdocForm("zcdb")) {
              _context14.next = 6;
              break;
            }

            enablePrecessButtonEdoc();
            return _context14.abrupt("return");

          case 6:
            checkExistBody();
            _context14.next = 9;
            return saveContent();

          case 9:
            if (_context14.sent) {
              _context14.next = 12;
              break;
            }

            enablePrecessButtonEdoc();
            return _context14.abrupt("return");

          case 12:
            if (contentIframe.saveHwData()) {
              _context14.next = 15;
              break;
            }

            enablePrecessButtonEdoc();
            return _context14.abrupt("return");

          case 15:
            superviseRemindMode(); //公文待办督办仍然有效
            //保存当前处理人所提交处理意见所带的附件

            saveAttachment(); //执行过"删除"和"插入"操作的时候，保存公文正文的附件。
            //if(hasUploadAtt || removeChanged){
            //   saveContentAttachment();
            //}

            if (contentIframe.checkUpdateHw()) {
              try {
                recordChangeWord(theForm.affair_id.value, theForm.summary_id.value, ",wendanqianp", theForm.ajaxUserId.value);
              } catch (e) {}
            }

            theForm.action = genericURL + "?method=doZCDB";

            if (edocObj.docMark) {
              theForm.action += "&my:doc_mark=" + encodeURIComponent(edocObj.docMark.value);
            }

            if (edocObj.docMark2) {
              theForm.action += "&my:doc_mark2=" + encodeURIComponent(edocObj.docMark2.value);
            }

            if (edocObj.innerMark) {
              theForm.action += "&my:serial_no=" + encodeURIComponent(edocObj.innerMark.value);
            }

            theForm.submit();
            document.getElementById("processButton").disabled = true;
            document.getElementById("zcdbButton").disabled = true;
            disabledPrecessButtonEdoc();

          case 26:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _doZcdbCallback.apply(this, arguments);
}

function openZcdbTime() {
  var url = edocURL + "?method=openZcdbTime";
  getA8Top().win123 = getA8Top().$.dialog({
    title: edocTemporaryTodoRemind,
    transParams: {
      'parentWin': window
    },
    url: url,
    width: 300,
    height: 150
  });
}

function selectUrger(elements) {
  if (!elements) {
    return;
  }

  document.getElementById("urgertext").value = getNamesString(elements);
  document.getElementById("urgerinput").innerHTML = getIdsInput(elements, "urger");
}
/**
 * 检查是否可以修改流程
 *
 * @return true 可以， false 不可以，表示有其他人在修改流程
 */


function checkModifyingProcess(_processId, _summaryId) {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "colCheckAndupdateLock", false);
    requestCaller.addParameter(1, "String", _processId);
    requestCaller.addParameter(2, "Long", _summaryId);
    var ds = requestCaller.serviceRequest();

    if (ds) {
      if (ds.startsWith("--NoSuchSummary--")) {
        alert(v3x.getMessage("edocLang.edoc_hasCancelOrStepback"));
        return false;
      }

      alert(v3x.getMessage("collaborationLang.editing_process", ds));
      return false;
    }
  } catch (e) {
    alert(e.message);
    return false;
  }

  return true;
}
/**
 * 判断流程是否已经被锁定，未被锁定则给该流程加上一个同步锁，为接下来的修改流程做准备
 *
 * @param _processId
 * @param _summaryId
 * @return true 可以， false 不可以，表示有其他人在修改流程
 */


function checkModifyingProcessAndLock(_processId, _summaryId) {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "colCheckAndupdateLock", false);
    requestCaller.addParameter(1, "String", _processId);
    requestCaller.addParameter(2, "Long", _summaryId);
    var ds = requestCaller.serviceRequest();

    if (ds != null && ds != "") {
      if (ds.startsWith("--NoSuchSummary--")) {
        alert(v3x.getMessage("edocLang.edoc_hasCancelOrStepback"));
        return;
      }

      alert(v3x.getMessage("collaborationLang.editing_process", ds));
      return false;
    } else {
      return true;
    }
  } catch (e) {
    alert(e.message);
  }

  return false;
}
/**
 * 修改完流程，解除流程同步锁
 */


function colDelLock(_processId, _summaryId) {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxColManager", "colDelLock", false, "GET", false);
    requestCaller.addParameter(1, "String", _processId);
    requestCaller.addParameter(2, "String", _summaryId);

    if (arguments.length > 2) {
      requestCaller.addParameter(3, "String", arguments[2]);
    }

    requestCaller.serviceRequest();
  } catch (e) {}
}

function checkIsCanBeRepealed(summaryId) {
  var isCanBeRepealedFlag;

  try {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkIsCanBeRepealed", false);
    requestCaller.addParameter(1, 'String', summaryId);
    isCanBeRepealedFlag = requestCaller.serviceRequest();
  } catch (ex1) {
    alert("Exception : " + ex1);
    return false;
  }

  return isCanBeRepealedFlag;
} //检查是否可以发文后取回


function checkIsCanBeTakeBack(summaryId) {
  var isCanBeRepealedFlag;

  try {
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkIsCanBeTakeBack", false);
    requestCaller.addParameter(1, 'String', summaryId);
    isCanBeRepealedFlag = requestCaller.serviceRequest();
  } catch (ex1) {
    alert("Exception : " + ex1);
    return false;
  }

  return isCanBeRepealedFlag;
}
/*
 * 撤销流程
 */


function repealItems(fromPageType) {
  edocObj.theForm = document.getElementsByName("listForm")[0];

  if (!edocObj.theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length;
  var countChecked = 0;
  var summaryId;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      countChecked++;
      edocObj._processId = id_checkbox[i].getAttribute("processId");
      summaryId = id_checkbox[i].value;
      edocObj.affairId = id_checkbox[i].getAttribute("affairId");
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertCancelItem"));
    return;
  }

  if (countChecked > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectCancelOnlyOne"));
    return;
  }
  /*
   if(!checkModifyingProcess(_processId, summaryId)){
     return;
   }*/


  var checkIsCanBeRepealedFlg = checkIsCanBeRepealed(summaryId);

  if ("Y" != checkIsCanBeRepealedFlg) {
    alert(checkIsCanBeRepealedFlg);
    return;
  } //已发撤销加锁


  edocObj.currentUserId = document.getElementById("currentUserId").value;
  var re = EdocLock.lockWorkflow(edocObj._processId, edocObj.currentUserId, EdocLock.REPEAL_ITEM_SENDED); //OA-32530 新建公文，单位管理员在流程管理中对公文进行修改、撤销、终止操作，发起人已发进行撤销，正常应该是提示有锁才对，目前是撤销了

  if (re[0] == "false") {
    parent.parent.parent.$.alert(re[1]);
    return;
  }

  if (!executeWorkflowBeforeEvent("BeforeCancel", summaryId, edocObj.affairId, edocObj._processId, edocObj._processId, "", "", "")) {
    return;
  }

  getA8Top().win123 = getA8Top().$.dialog({
    title: colRepealComment,
    transParams: {
      'parentWin': window
    },
    url: jsContextPath + "/edocController.do?method=repealCommentDialog&affairId=" + edocObj.affairId + CsrfGuard.getUrlSurffix(),
    width: 400,
    height: 250,
    closeParam: {
      show: true,
      autoClose: true,
      handler: function handler() {
        EdocLock.releaseWorkflowByAction(edocObj._processId, edocObj.currentUserId, EdocLock.REPEAL_ITEM_SENDED);
      }
    },
    resizable: true
  });
}

function repealItemsCallback(rv) {
  if (rv) {
    disableButtons(); //var element = document.createElement("<INPUT TYPE=HIDDEN NAME='repealComment' value='" + rv + "' />");

    var element1 = document.createElement("input");
    element1.setAttribute('type', 'hidden');
    element1.setAttribute('name', 'affairId');
    element1.setAttribute('value', edocObj.affairId);
    var element2 = document.createElement("input");
    element2.setAttribute('type', 'hidden');
    element2.setAttribute('name', 'repealComment');
    element2.setAttribute('value', rv[0]);
    edocObj.theForm.appendChild(element1);
    edocObj.theForm.appendChild(element2);
    edocObj.theForm.action = genericURL + "?method=repeal&trackWorkflowType=" + rv[1];
    edocObj.theForm.docBack.value = "cancelColl";
    edocObj.theForm.target = "tempIframe";
    edocObj.theForm.method = "POST";
    edocObj.theForm.submit();
  } else {
    EdocLock.releaseWorkflowByAction(edocObj._processId, edocObj.currentUserId, EdocLock.REPEAL_ITEM_SENDED);
  }
}
/*
  * 撤销流程
  */


function cancelBackEdoc(fromPageType) {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length;
  var countChecked = 0;
  var _processId = null;
  var summaryId;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      countChecked++;
      _processId = id_checkbox[i].processId;
      summaryId = id_checkbox[i].value;
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertCancelItem"));
    return;
  }

  if (countChecked > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectCancelOnlyOne"));
    return;
  }

  var checkIsCanBeRepealedFlg = checkIsCanBeRepealed(summaryId);

  if ("Y" != checkIsCanBeRepealedFlg) {
    alert(checkIsCanBeRepealedFlg);
    return;
  } //mark by xuqiangwei  修改Chrome37 这个方法应该已经废弃了


  var rv = getA8Top().v3x.openWindow({
    url: genericControllerURL + "edoc/repealCommentDialog",
    width: 400,
    height: 300,
    resizable: true
  });

  if (rv) {
    disableButtons(); //var element = document.createElement("<INPUT TYPE=HIDDEN NAME='repealComment' value='" + rv + "' />");

    var element2 = document.createElement("input");
    element2.setAttribute('type', 'hidden');
    element2.setAttribute('name', 'repealComment');
    element2.setAttribute('value', rv);
    theForm.appendChild(element2);
    theForm.action = genericURL + "?method=cancelBackEdoc";
    theForm.docBack.value = "cancelColl";
    theForm.target = "tempIframe";
    theForm.method = "POST";
    theForm.submit();
  }
} //已发取回


function sentTakeBack() {
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return;
  }

  var hasMoreElement = false;
  var len = id_checkbox.length;
  var countChecked = 0;
  var _processId = null;
  var summaryId;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      countChecked++;
      _processId = id_checkbox[i].processId;
      summaryId = id_checkbox[i].value;
    }
  }

  if (countChecked == 0) {
    alert(v3x.getMessage("edocLang.edoc_alertTakeBackItem"));
    return;
  }

  if (countChecked > 1) {
    alert(v3x.getMessage("edocLang.edoc_alertSelectTakeBackOnlyOne"));
    return;
  }

  if (!window.confirm(v3x.getMessage("edocLang.edoc_confirmTakeBackItem"))) {
    return;
  }

  disableButtons(); //var element = document.createElement("<INPUT TYPE=HIDDEN NAME='repealComment' value='" + rv + "' />");

  theForm.action = genericURL + "?method=repeal&docBack=docBack";
  theForm.docBack.value = "docBack";
  theForm.target = "tempIframe";
  theForm.method = "POST";
  theForm.submit();
} //打开发文，收文登记簿页面


function openSendRegister(edocType) {
  //GOV-4811.安全测试：aqc没有单位/部门公文收发员-公文管理-发文管理-分发权限，输入地址却能访问对应界面 start
  var methodName = "sendRegister";

  if (edocType == "1") {
    methodName = "recRegister";
  }

  var url1 = ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocController.do?method=" + methodName + "&edocType=" + edocType + "&ndate=" + new Date().getTime(); //GOV-4811.安全测试：aqc没有单位/部门公文收发员-公文管理-发文管理-分发权限，输入地址却能访问对应界面 end

  var retObj = v3x.openWindow({
    url: url1,
    FullScrean: 'yes',
    dialogType: "open"
  }); //mark by xuqiangwei 修改Chrome37这里可能会有问题

  if (retObj) {
    window.location.reload();
  }
}
/**
 * 判断当前处理公文affair事项是否是待办处理的状态
 */


function canHandle(affairId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "isEdocHandle", false);
  requestCaller.addParameter(1, 'String', affairId);
  var ret = requestCaller.serviceRequest();

  if (ret != 'canHandle') {
    alert(ret);
    parent.doEndSign_pending(affairId);
  }

  return ret;
}
/*
 * 审批节点撤销流程
 */


function repealItem(fromPageType, summaryId) {
  disabledPrecessButtonEdoc();
  var theForm = document.getElementById("theform");

  if (!theForm) {
    enablePrecessButtonEdoc();
    return false;
  }

  if (!isAffairValid(affair_id)) {
    enablePrecessButtonEdoc();
    return;
  } //加验证——————是否可以进行撤销操作


  var canObj = getCanTakeBacData();
  var re = edocCanRepeal(canObj.processId, canObj.nodeId);

  if (re[0] != 'true') {
    enablePrecessButtonEdoc();
    alert(re[1]);
    return;
  } //如果finished为true表示流程结束


  if (finished != 'false') {
    enablePrecessButtonEdoc();
    alert(V5_Edoc().$.i18n("edoc.cancel.cannot", subject_name)); //如下公文已经结束,不允许撤销subject_name

    return;
  } //OA-47179已经被取回的公文，下个节点还能撤销成功
  //判断公文affair事项是否还在待办中


  var affairId = document.getElementById("affair_id").value;
  var ret = canHandle(affairId);

  if (ret != 'canHandle') {
    enablePrecessButtonEdoc();
    return;
  }

  var contentOP = contentIframe.document.getElementById("contentOP");
  var content = ""; // OA-10263  后台设置了意见必填，前台待办进行撤销时要先进行判断是否填写了意见才能提示是否撤销的，现在没有判断是否意见必填

  if (contentOP) {
    content = contentOP.value; //0208  OA-18947 在待办中撤销，是不需要判断意见是否为空的
    //同年0502 OA-33490 审批节点设置意见必填后，处理人不填写意见需要验证。此处还是需要放开

    var opinionPolicy = document.getElementById("opinionPolicy");
    var cancelOpinionPolicy = document.getElementById("cancelOpinionPolicy");
    var disAgreeOpinionPolicy = document.getElementById("disAgreeOpinionPolicy");

    if (opinionPolicy && opinionPolicy.value == 1) {
      if (content.trim() == '') {
        enablePrecessButtonEdoc();
        alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
        return;
      }
    } else {
      if (cancelOpinionPolicy && cancelOpinionPolicy.value == 1 && contentOP) {
        if (content.trim() == '') {
          enablePrecessButtonEdoc();
          alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
          return;
        }
      } //意见不同意，校验意见内容


      if (disAgreeOpinionPolicy && disAgreeOpinionPolicy.value == 1 && contentOP) {
        if (content.trim() == '' && isDisAgreeChecked(contentIframe)) {
          enablePrecessButtonEdoc();
          alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
          return;
        }
      }
    }
  } //OA-19935  客户bug验证：流程是gw1，gw11，m1，串发，m1撤销，gw1在待发直接查看（不是编辑态），文单上丢失了撤销的意见


  var policy = document.getElementById("policy").value;
  var data = {
    page: "dealrepeal",
    docBack: "cancelColl",
    //OA-50543 被待办撤销的公文在首页待发中显示的状态是草稿
    id: [summaryId],
    content: content,
    affairId: affairId,
    policy: policy
  };
  var action = genericURL + "?method=repeal" + CsrfGuard.getUrlSurffix();
  var target = "showDiagramFrame"; //撤销加锁

  var puobj = getProcessAndUserId();
  var re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser, EdocLock.REPEAL_ITEM);

  if (re[0] == "false") {
    enablePrecessButtonEdoc();
    parent.parent.$.alert(re[1]);
    return;
  }

  var dialog = parent.parent.$.dialog({
    targetWindow: parent.parent.getCtpTop(),
    id: 'repealdialog',
    url: jsContextPath + "/edocController.do?method=repealDetailDialog&affairId=" + affairId,
    width: 350,
    height: 120,
    title: V5_Edoc().$.i18n("edoc.system.prompt"),
    //系统提示
    closeParam: {
      show: true,
      autoClose: true,
      handler: function handler() {
        enablePrecessButtonEdoc();
      }
    },
    buttons: [{
      text: V5_Edoc().$.i18n("edoc.form.button.ok"),
      //确定
      handler: function handler() {
        var rv = dialog.getReturnValue();

        if (!rv) {
          return;
        } //


        var needtrackWF = rv[0];
        dialog.close();
        saveAttachment();
        var method;
        var map = data;
        var form = document.createElement("form");
        form.setAttribute('method', method ? method : 'post');
        form.setAttribute('action', action);
        form.setAttribute('target', target ? target : '');
        document.body.appendChild(form);

        for (var item in map) {
          //自定义元素的
          if (_typeof(map[item]) == "object" && "toFields" in map[item]) {
            var fields = map[item].toFields(); //need jquery support

            $(form).append(fields);
          } else if (!(map[item] instanceof Array)) {
            var value = map[item];
            var field = document.createElement('input');
            field.setAttribute('type', 'hidden');
            field.setAttribute('name', item);
            field.setAttribute('value', value);
            form.appendChild(field);
          } else {
            var arr = map[item];

            for (var i = 0; i < arr.length; i++) {
              var value = arr[i];
              var field = document.createElement('input');
              field.setAttribute('type', 'hidden');
              field.setAttribute('name', item);
              field.setAttribute('value', value);
              form.appendChild(field);
            }
          }
        }

        try {
          var tempInput = document.createElement('INPUT');
          tempInput.setAttribute('type', 'hidden');
          tempInput.setAttribute('name', 'appName');
          tempInput.setAttribute('value', '4');
          form.appendChild(tempInput);
          var edocType = document.getElementById('theform')['edocType'].value;
          var tempInput2 = document.createElement('INPUT');
          tempInput2.setAttribute('type', 'hidden');
          tempInput2.setAttribute('name', 'edocType');
          tempInput2.setAttribute('value', edocType);
          form.appendChild(tempInput2);
          var tempInput3 = document.createElement('INPUT');
          tempInput3.setAttribute('type', 'hidden');
          tempInput3.setAttribute('name', 'trackWorkflowType');
          tempInput3.setAttribute('value', rv[0]);
          form.appendChild(tempInput3); //上传撤销附件

          var attInputs = document.getElementById("attachmentInputs").childNodes;

          if (attInputs && attInputs.length > 0) {
            for (var i = 0; i < attInputs.length; i++) {
              var field = document.createElement('input');
              field.setAttribute('type', 'hidden');
              field.setAttribute('name', attInputs[i].name);
              field.setAttribute('value', attInputs[i].value);
              form.appendChild(field);
            }
          }
        } catch (e) {}

        form.submit(); //
      }
    }, {
      text: V5_Edoc().$.i18n("edoc.form.button.cancel"),
      //取消
      handler: function handler() {
        enablePrecessButtonEdoc();
        EdocLock.releaseWorkflowByAction(puobj.processId, puobj.currentUser, EdocLock.REPEAL_ITEM);
        dialog.close();
      }
    }]
  });
  cancelConfirm();
}

function isDisAgreeChecked(contentIframe) {
  var checkBoxs = contentIframe.document.getElementsByName("attitude"); //不同意在最后一个

  return checkBoxs.length - 1 > 0 ? checkBoxs[checkBoxs.length - 1].checked : false;
}

var isShowingDesigner = false;

function designWorkFlow(frameNames, isOnlyView) {
  frameNames = frameNames || "";
  isShowingDesigner = true;
  var onlyView = isOnlyView == "true";
  var rv = getA8Top().v3x.openWindow({
    url: genericControllerURL + "collaboration/monitor&isShowButton=true&frameNames=" + frameNames + "&appName=" + appName + "&isOnlyView=" + onlyView,
    width: "860",
    height: "690",
    resizable: "no"
  });
  isShowingDesigner = false; //mark by xuqiangwei 修改Chrome37这里可能会有问题

  if (rv == true) {
    processing = false;
  }
}

function newColl() {}
/**
 * 另存模板
 */


var tempCategoryId = null;

function saveAsTemplete(type) {
  //如果是书生GD格式，则提示不能另存为个人模板
  if (bodyType == 'gd') {
    alert(_("edocLang.edoc_saveAsTemplete_sursen"));
    return;
  }

  var copies = document.getElementById("my:copies");

  if (!checkCopies(copies)) {
    return;
  }

  clickFlag = false;
  var templeteId = document.getElementById("templeteId").value;

  if (templeteId != "") {
    // 从待发中编辑，当前文单来源于模板时，需要判断系统模板是否存在
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "isHaveSystemTemplate", false);
    requestCaller.addParameter(1, "long", templeteId);
    var ds = requestCaller.serviceRequest();

    if (ds == "false") {
      alert(_("edocLang.system_templete_delete_alert"));
      return;
    }
  } // 检查form


  var theForm = document.getElementsByName("sendForm")[0];

  if (!theForm) {
    return;
  } // OA-48452 后台设置不允许自建流程，前台拟文调用时关闭调用界面，然后单击另存为，弹出选人界面，选人后正常发送了


  var isAlertSelectPerson = undefined; // 不能自建流程的时候，不调用模板 另存为个人模板时，提示需要

  if (!selfCreateFlow) {
    isAlertSelectPerson = 10;
  } // 流程验证
  // if(!hasWorkflow) {
  // OA-46990 调用格式模版另存为时提示要写流程，单击提示的确定后应该直接弹出选人界面来


  if (!checkSelectWF(isAlertSelectPerson, templateType)) {
    // alert(_("edocLang.edoc_alertSelectEdocWorkFlow"));
    return;
  }

  hasWorkflow = true; // 验证附言

  if (!valiFuyan()) {
    return;
  } // 标题不验证


  var subjectObj = document.getElementById("my:subject");

  if (subjectObj) {
    var subject = document.getElementById("subject");

    if (!subject || subject == null) {
      $(theForm).append("<input type='hidden' id='subject' name='subject' value='" + subjectObj.value + "' inputName='" + V5_Edoc().$.i18n("common.subject.label") + "'/>");
      $(theForm).append("<input type='hidden' name='tembodyType' value=''/>");
      $(theForm).append("<input type='hidden' name='formtitle' value=''/>");
      subject = document.getElementById("subject");
    }
  }

  var categoryId;
  var edocType = document.getElementById("edocType").value;

  if (edocType == 0) {
    categoryId = 19;
  } else if (edocType == 1) {
    categoryId = 20;
  } else if (edocType == 2) {
    categoryId = 21;
  }

  tempCategoryId = categoryId; // 打开保存模板界面

  window.saveAsTempleteWin = getA8Top().$.dialog({
    title: V5_Edoc().$.i18n("common.toolbar.saveAs.label"),
    //另存为
    transParams: {
      'parentWin': window
    },
    url: genericControllerURL + "edoc/templete/saveAsTemplate&hasWorkflow=" + hasWorkflow + "&edocType=1&categoryId=" + categoryId,
    targetWindow: getA8Top(),
    width: "350",
    height: "220"
  });
}
/**
 * 另存为模版回调函数
 * @param rv
 */


function saveAsTempleteCallback(_x8) {
  return _saveAsTempleteCallback.apply(this, arguments);
}

function _saveAsTempleteCallback() {
  _saveAsTempleteCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(rv) {
    var over, overId, type, templatename, theForm, atts, i, att, bodyType, selEdoctable, selValue, st, finput;
    return regeneratorRuntime.wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            checkPDFIsNull = true; //验证pdf正文标记，个人模板PDF正文允许为空

            if (rv) {
              _context15.next = 3;
              break;
            }

            return _context15.abrupt("return");

          case 3:
            over = rv[0];
            overId = rv[1];
            type = rv[2];
            templatename = rv[3];
            theForm = document.getElementsByName("sendForm")[0];

            if (!(over == 2)) {
              _context15.next = 10;
              break;
            }

            return _context15.abrupt("return");

          case 10:
            if (!(type != "text")) {
              _context15.next = 13;
              break;
            }

            if (checkSelectWF()) {
              _context15.next = 13;
              break;
            }

            return _context15.abrupt("return");

          case 13:
            // 模板
            if (type == "templete") {
              atts = fileUploadAttachments.values();

              for (i = 0; i < atts.size(); i++) {
                att = atts.get(i);

                if (att.type == '1' || att.type == '3' || att.type == '4') {
                  if (att.subReference != "") {
                    att.extSubReference = att.subReference;
                  } else {
                    att.extSubReference = att.extSubReference;
                  }
                }
              }

              cloneAllAttachments();
              saveAttachment();
            }

            if (!(type != "workflow")) {
              _context15.next = 22;
              break;
            }

            bodyType = document.getElementById("bodyType").value;

            if (!(bodyType != "HTML")) {
              _context15.next = 22;
              break;
            }

            _context15.next = 19;
            return saveOcx();

          case 19:
            if (!_context15.sent) {
              _context15.next = 22;
              break;
            }

            fileId = getUUID();
            if (typeof newEdocBodyId != "undefined") newEdocBodyId = fileId;

          case 22:
            isFormSumit = true;
            theForm.target = "personalTempleteIframe"; // OA-25626 发文拟文，调用普通模板后，文单处于灰色，不可切换的状态。但是保存个人模板后，变成可切换状态了。

            selEdoctable = document.getElementById("edoctable");
            selValue = selEdoctable.value;
            st = selEdoctable.disabled;

            try {
              finput = adjustReadFormForSubmit();
            } catch (e) {}

            if (document.getElementById("isSys")) {
              theForm.isSys.value = 0;
              theForm.categoryId.value = theForm.categoryId.value;
              theForm.categoryType.value = theForm.categoryType.value;
              theForm.templatename.value = templatename;
            } else {
              $(theForm).append("<input type='hidden' name='isSys' id='isSys' value='0'/>");
              $(theForm).append("<input type='hidden' name='categoryId' value='" + tempCategoryId + "'/>");
              $(theForm).append("<input type='hidden' name='categoryType' value='" + tempCategoryId + "'/>");
              $(theForm).append("<input type='hidden' name='type' value='" + type + "'/>");
              $(theForm).append("<input type='hidden' name='templatename' value='" + templatename + "'/>");
            }

            theForm.id.value = overId;
            theForm.action = "edocTempleteController.do?method=saveTemplete" + CsrfGuard.getUrlSurffix();
            theForm.submit(); //getA8Top().startProc('');

            theForm.id.value = theForm.summaryId.value; //将文单的状态 还原为保存个人模板之前的状态

            selEdoctable.disabled = st; //OA-43496 拟文--另存为个人模版时，文号、行文类型等变成数字形式了
            //保存个人模板成功之后，需要将select替换公文元素原来的值(比如 原来公文元素保密期限:普通
            //经过上面adjustReadFormForSubmit处理之后 保密期限设置为value值0，这样是为了提交到后台进行处理，提交之后这里再将保密期限还原回来:普通)

            replaceSelectBack(finput);
            checkPDFIsNull = false; //验证pdf正文标记，个人模板PDF正文允许为空 ,设置后恢复标记状态

          case 36:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15);
  }));
  return _saveAsTempleteCallback.apply(this, arguments);
}

function replaceSelectBack(aInput) {
  var aFieldList = paseFormatXML(getXmlContent(aInput));
  var field;
  var ocxNameList = "";

  for (var i = 0; i < aFieldList.length; i++) {
    field = aFieldList[i];
    var inputObj = document.getElementById(field.fieldName);

    if (inputObj == null) {
      continue;
    }

    var isSel = field instanceof Seeyonform_select; //if(inputObj.disabled==false&&inputObj.readOnly==false){continue;}

    if (ocxNameList.indexOf("[" + field.fieldName + "]") == -1) {
      ocxNameList += "[" + field.fieldName + "]";
    } else {
      if (isSel == false) {
        continue;
      }
    }

    if (isSel && field.access == 'browse') {
      inputObj.value = changeSelectValueBack(inputObj.value, field);
    }
  }
}

function changeSelectValueBack(dis, SeeyonformSelect) {
  var i;
  var ls = SeeyonformSelect.valueList;

  for (i = 0; i < ls.length; i++) {
    if (ls[i].value == dis) {
      return ls[i].label;
    }
  }

  return dis;
}

function _setWorkFlow(_caseProcessXML, _workflowInfo) {
  hasDiagram = true;
  hasWorkflow = true;
  isFromTemplate = true;
  document.getElementsByName("sendForm")[0].process_desc_by.value = 'xml';
  document.getElementsByName("sendForm")[0].process_xml.value = _caseProcessXML;

  if (workflowInfo) {
    document.getElementsByName("sendForm")[0].workflowInfo.value = _workflowInfo;
  }

  document.getElementsByName("sendForm")[0].workflowInfo.disabled = true;
  showMode = 0;
}
/**
 *
 */


function openTemplete(templeteCategory) {
  //window.open(genericControllerURL + "collaboration/templete/index&categoryType="+templeteCategrory);
  //return;
  var comm = document.getElementById("comm").value;
  var orgAccountId = document.getElementById("orgAccountId").value;

  var _url;

  if (comm == "register" || comm == "distribute") _url = genericControllerURL + "collaboration/templete/index&categoryType=" + templeteCategrory + "&subType=isExchangeDocToRegist&accountId=" + orgAccountId;else //_url=genericControllerURL + "collaboration/templete/index&categoryType="+templeteCategrory;
    _url = "template/template.do?method=templateChoose&category=" + templeteCategrory;
  parent.parent.parent.openEdocTemplete(templeteCategory);
}

function getElementLeft(element) {
  //获得某元素在网页中的绝对向左位置
  var actualLeft = element.offsetLeft;
  var current = element.offsetParent;

  while (current !== null) {
    actualLeft += current.offsetLeft;
    current = current.offsetParent;
  }

  return actualLeft;
}

function getElementTop(element) {
  //获得某元素在网页中的绝对顶部位置
  var actualTop = element.offsetTop;
  var current = element.offsetParent;

  while (current !== null) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }

  return actualTop;
} //显示暂存待办并提醒


function zcdbAdviceViews(flag) {
  var zcdbAdviceDIVObj = document.getElementById("zcdbAdviceDIV");
  var zcdbAdviceDivIframe = document.getElementById("zcdbAdviceDivIframe");
  var zcdbAdvice = document.getElementById("zcdbAdvice");
  popViewUtil(flag, zcdbAdviceDIVObj, zcdbAdviceDivIframe, zcdbAdvice);
} //节点权限高级显示


function advanceViews(flag) {
  var processAdvanceDIVObj = document.getElementById("processAdvanceDIV");
  var processAdvanceDivIframe = document.getElementById("processAdvanceDivIframe");
  var processAdvance = document.getElementById("processAdvance");
  popViewUtil(flag, processAdvanceDIVObj, processAdvanceDivIframe, processAdvance);
}

function popViewUtil(flag, advanceDIVObj, advanceDivIframe, advanceObj) {
  if (flag == null) {
    clickClose = false;
  }

  if ((flag || advanceDIVObj.style.display == "none") && !clickClose) {
    advanceDIVObj.style.display = "";

    if (advanceDivIframe) {
      var tempheight = advanceDIVObj.clientHeight;
      advanceDivIframe.style.height = tempheight + "px";
      advanceDivIframe.style.display = "";
    }

    var eleLeft = getElementLeft(advanceObj);
    var eleTop = getElementTop(advanceObj);
    var bodyWidth = document.body.clientWidth;
    var width = 100;

    if (bodyWidth - eleLeft < width) {
      advanceDIVObj.style.left = bodyWidth - width;
      advanceDivIframe.style.left = bodyWidth - width;
    } else {
      advanceDIVObj.style.left = eleLeft + 20;
      advanceDivIframe.style.left = eleLeft + 20;
    }

    advanceDIVObj.style.top = eleTop + 10;
    advanceDivIframe.style.top = eleTop + 10;
  } else {
    advanceDIVObj.style.display = "none";

    if (advanceDivIframe) {
      advanceDivIframe.style.display = "none";
    }
  }
} //显示高级菜单一栏


function showAdvanceViews(flag) {
  var moreOperationDiv = document.getElementById("moreOperationDiv");

  if (!moreOperationDiv.show || moreOperationDiv.show == "false") {
    moreOperationDiv.style.display = "";
    moreOperationDiv.show = "true";
  } else {
    moreOperationDiv.style.display = "none";
    moreOperationDiv.show = "false";
  }
}

function closeAdvance() {
  var processAdvanceDIVObj = document.getElementById("processAdvanceDIV");
  var processAdvanceDivIframe = document.getElementById("processAdvanceDivIframe");

  if (processAdvanceDIVObj) {
    clickClose = true;
    processAdvanceDIVObj.style.display = "none";
    if (processAdvanceDivIframe) processAdvanceDivIframe.style.display = "none";
  }
}

function openNewEditWin() {
  if (canUpdateContent) {
    contentUpdate = true;
  }

  var isFormTemplete = "isFromTemplete"; //来自公文模板打开正文

  popupContentWin(isFormTemplete);
}
/**
 * 修改正文
 */
// todo zl


function modifyBody(_x9, _x10) {
  return _modifyBody.apply(this, arguments);
} // 检查是否有锁


function _modifyBody() {
  _modifyBody = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(summaryId, hasSign) {
    var puobj, bodyType, re, result, params, _progressBar_1, officeSDK, signCount, _progressBar_2, taohongParams;

    return regeneratorRuntime.wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            puobj = getProcessAndUserId(); //修改正文加锁
            //var re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser,EdocLock.UPDATE_CONTENT);
            //正文锁和流程锁分离，这里要传入summaryId

            bodyType = document.getElementById("bodyType").value;

            if (!(bodyType == "gd")) {
              _context17.next = 5;
              break;
            }

            alert(_("edocLang.edoc_gdnofuntion"));
            return _context17.abrupt("return");

          case 5:
            re = EdocLock.lockWorkflow(summaryId, puobj.currentUser, EdocLock.UPDATE_CONTENT);

            if (!(re[0] == "false")) {
              _context17.next = 9;
              break;
            }

            parent.parent.$.alert(re[1]);
            return _context17.abrupt("return");

          case 9:
            puobj = getProcessAndUserId();
            result = canStopFlow(puobj.caseId);

            if (!(result[0] != 'true')) {
              _context17.next = 14;
              break;
            }

            alert(result[1]);
            return _context17.abrupt("return");

          case 14:
            if (!(bodyType == "HTML")) {
              _context17.next = 22;
              break;
            }

            if (!htmlContentIframe.hasHtmlSign()) {
              _context17.next = 18;
              break;
            }

            alert(v3x.getMessage("edocLang.edoc_alertCantModifyBecauseOfIsignature"));
            return _context17.abrupt("return");

          case 18:
            contentUpdate = true;
            popupContentWin();
            _context17.next = 89;
            break;

          case 22:
            // todo zl
            // 隐式打开（判断签章、将文单中的内容更新到正文中）
            // 文档通暂时不支持在打开文件前调整自定义按钮,因此只能editType发生改变时重新new,然后修改内部的权限,在打开文件时自动触发
            if (officeSDK) {
              officeSDK.destroy();
            }

            params = {
              "fileId": officeParams.fileId,
              "fileName": officeParams.fileName,
              "newTitle": officeParams.fileName,
              "fileType": officeParams.fileType,
              "from": "init",
              "isDialog": true
            };
            params.isHide = true;
            params.webRoot = OfficeSDK.utils.getWebRoot();
            params.cookie = officeParams.sessionId;
            params.viewMode = "edit";
            params.canClearTrail = true;
            params.canPrint = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanPrint;
            params.canDownload = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanSaveLocal; // 修改正文  强制设置成允许上传
            // params.canUpload = officeParams.canUpload ? officeParams.canUpload : false;

            officeParams.canUpload = true;
            params.canUpload = true;
            params.officecanPrint = officeParams.officecanPrint;
            params.officecanSaveLocal = officeParams.officecanSaveLocal;
            params.createDate = officeParams.createDate;
            _progressBar_1 = getA8Top().$.progressBar();
            officeSDK = new OfficeSDK(params);
            _context17.prev = 38;
            _context17.next = 41;
            return officeSDK.init({
              webRoot: OfficeSDK.utils.getWebRoot(),
              domId: 'scrollContentTd',
              mode: OfficeSDK.ENUM_MODE_TYPE.EDIT,
              fileType: officeParams.fileType
            });

          case 41:
            _context17.next = 48;
            break;

          case 43:
            _context17.prev = 43;
            _context17.t0 = _context17["catch"](38);

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("当前配置，不支持编辑"));
            return _context17.abrupt("return");

          case 48:
            _context17.next = 50;
            return officeSDK.openFile({
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            });

          case 50:
            _context17.next = 52;
            return officeSDK.countSignatures();

          case 52:
            signCount = _context17.sent;

            if (!(signCount > 0)) {
              _context17.next = 59;
              break;
            }

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("govdoc.alertCantModifyBecauseOfIsignature.text")); //正文已经盖章，不能修改

            return _context17.abrupt("return");

          case 59:
            if (!(signCount < 0)) {
              _context17.next = 65;
              break;
            }

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("office.sign.error"));
            return _context17.abrupt("return");

          case 65:
            if (!(bodyType == "OfficeWord" || bodyType == "WpsWord")) {
              _context17.next = 86;
              break;
            }

            _context17.next = 68;
            return officeSDK.countBookmarks();

          case 68:
            _context17.t1 = _context17.sent;

            if (!(_context17.t1 > 0)) {
              _context17.next = 82;
              break;
            }

            _progressBar_1.close();

            if (!confirm(_("edocLang.edoc_refreshContentAuto"))) {
              _context17.next = 80;
              break;
            }

            //GOV-3632 公文正文套红后，处理公文时进行【修改正文】操作，选中将文单中的内容更新到正文中，结果查看正文中并没有更新，还是显示原来的。
            _progressBar_2 = getA8Top().$.progressBar();
            edocTaohongHandler.setAllLable(contentIframe.document.getElementsByName("sendForm")[0], 'edoc', null);
            edocTaohongHandler.bookMarkMapToBookMarkList(edocTaohongHandler.allBM);
            taohongParams = {
              allBookMark: edocTaohongHandler.bookMarkList,
              templateType: "edoc",
              fileType: "doc",
              fileId: officeSDK.params.fileId,
              refreshBookMarkText: true
            };
            _context17.next = 78;
            return officeSDK.setOptions({
              isDialog: true,
              canClearTrail: false,
              canRevise: false,
              isShowTrailBtn: undefined,
              notChangeState: true //wps调用openFile，文件状态设置为未修改，这里套红后不应该改状态

            });

          case 78:
            _context17.next = 80;
            return officeSDK.taohong(taohongParams, /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16(err, result) {
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                  while (1) {
                    switch (_context16.prev = _context16.next) {
                      case 0:
                        _progressBar_2.close();

                        if (!err) {
                          _context16.next = 5;
                          break;
                        }

                        console.log("套红失败", err);
                        alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
                        return _context16.abrupt("return");

                      case 5:
                      case "end":
                        return _context16.stop();
                    }
                  }
                }, _callee16);
              }));

              return function (_x37, _x38) {
                return _ref3.apply(this, arguments);
              };
            }());

          case 80:
            _context17.next = 83;
            break;

          case 82:
            _progressBar_1.close();

          case 83:
            popupContentWin(false);
            _context17.next = 89;
            break;

          case 86:
            _progressBar_1.close(); // todo zl
            // 修改正文  强制设置成允许上传


            officeParams.canUpload = true;
            popupContentWin(false);

          case 89:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17, null, [[38, 43]]);
  }));
  return _modifyBody.apply(this, arguments);
}

function checkLockWorkflow() {
  contentUpdate = true;
  var puobj = getProcessAndUserId();
  var re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser, EdocLock.QIAN_ZHANG);

  if (re[0] == "false") {
    parent.parent.$.alert(re[1]);
    return true;
  }
}

function openSignature() {
  return _openSignature.apply(this, arguments);
}

function _openSignature() {
  _openSignature = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
    var bodyType, productTypeMap, puobj, re, isUniteSend, curContentNum, curRecordId, newRecordId, tempOfficeSDK, officeSignParam, initSuccess, flag;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            bodyType = document.getElementById("bodyType").value;
            _context18.next = 3;
            return OfficeSDK.utils.allProductType();

          case 3:
            productTypeMap = _context18.sent;

            if (!(bodyType === 'ofd' || bodyType === 'pdf')) {
              _context18.next = 8;
              break;
            }

            if (!(productTypeMap.ONLINE_EDIT === 'WDT' && productTypeMap.ONLINE_PREVIEW === 'ASPOSE')) {
              _context18.next = 8;
              break;
            }

            $.alert('不支持正文盖章!');
            return _context18.abrupt("return");

          case 8:
            if (!(typeof OfficeAPI != "undefined" && OfficeAPI.officeType == "wpsOcx" || useWpsOcx(clientMixNet, domesticModel))) {
              _context18.next = 13;
              break;
            }

            modifyBody(summaryId, hasSign);
            summaryChange();
            isUpdateedContent = true;
            return _context18.abrupt("return");

          case 13:
            /*	//永中office不支持wps正文修改
                   var isYozoWps = checkYozo();
                   if(isYozoWps){
                       return;
                   }*/
            summaryChange(); //修改正文加锁

            if (!(bodyType == "gd")) {
              _context18.next = 17;
              break;
            }

            alert(_("edocLang.edoc_gdnofuntion"));
            return _context18.abrupt("return");

          case 17:
            puobj = getProcessAndUserId();
            re = EdocLock.lockWorkflow(puobj.summaryId, puobj.currentUser, EdocLock.UPDATE_CONTENT);

            if (!(re[0] == "false")) {
              _context18.next = 22;
              break;
            }

            parent.parent.$.alert(re[1]);
            return _context18.abrupt("return");

          case 22:
            //签章加锁
            isCheckContentEdit = false;

            if (!(bodyType == "HTML")) {
              _context18.next = 31;
              break;
            }

            showPrecessAreaTd('content');

            if (htmlContentIframe.isInstallIsignatureHtml()) {
              _context18.next = 28;
              break;
            }

            alert(_("edocLang.edoc_client_not_installed_professional_signature"));
            return _context18.abrupt("return");

          case 28:
            htmlContentIframe.doSignature("", checkLockWorkflow);
            _context18.next = 68;
            break;

          case 31:
            //联合发文套多次正文后，是否进行了保存
            isUniteSend = document.getElementById("isUniteSend").value;

            if (!(isUniteSend == "true")) {
              _context18.next = 42;
              break;
            }

            //GOV-4589 公文复核节点权限点击签章报网页错误（修改引起，跑第一轮用例时没有此问题）
            curContentNum = theform.currContentNum.value;
            curRecordId = contentOfficeId.get(curContentNum, null);

            if (!(curRecordId == null)) {
              _context18.next = 42;
              break;
            }

            if (!(window.confirm(_("edocLang.edoc_contentNoSave")) == false)) {
              _context18.next = 38;
              break;
            }

            return _context18.abrupt("return");

          case 38:
            newRecordId = checkExistBody();
            _context18.next = 41;
            return askUserSave(false);

          case 41:
            contentOfficeId.put(curContentNum, newRecordId);

          case 42:
            if (checkDocMarkBeforeSignature()) {
              _context18.next = 44;
              break;
            }

            return _context18.abrupt("return", false);

          case 44:
            if (firstPDFId) {
              officeSignParam = JSON.parse(JSON.stringify(officeParams));
              officeSignParam.fileId = firstPDFId;
              officeSignParam.fileType = "pdf";
              tempOfficeSDK = new OfficeSDK(officeSignParam);
            } else {
              tempOfficeSDK = new OfficeSDK(officeParams);
            }

            initSuccess = true;
            _context18.prev = 46;
            _context18.next = 49;
            return tempOfficeSDK.init({
              mode: OfficeSDK.ENUM_MODE_TYPE.SIGN
            });

          case 49:
            _context18.next = 56;
            break;

          case 51:
            _context18.prev = 51;
            _context18.t0 = _context18["catch"](46);
            initSuccess = false;

            if (_context18.t0.code == 2) {
              $.alert(_context18.t0.msg);
            } else {
              $.alert(V5_Edoc().$.i18n('office.plugin.notAllow.mainBodySign'));
            }

            return _context18.abrupt("return");

          case 56:
            if (!initSuccess) {
              _context18.next = 60;
              break;
            }

            if (tempOfficeSDK.isAllowSignature()) {
              _context18.next = 60;
              break;
            }

            $.alert(V5_Edoc().$.i18n('office.plugin.notAllow.mainBodySign'));
            return _context18.abrupt("return");

          case 60:
            _context18.next = 62;
            return tempOfficeSDK.openFile({
              isDialog: true,
              from: "sign",
              viewMode: "sign",
              canSign: true,
              canCheckSign: true,
              dialogCloseCallback: function dialogCloseCallback() {
                showPrecessAreaTd('content');
              }
            });

          case 62:
            _context18.next = 64;
            return tempOfficeSDK.signature();

          case 64:
            flag = _context18.sent;

            if (flag) {
              _context18.next = 67;
              break;
            }

            return _context18.abrupt("return");

          case 67:
            /*	await OfficeAPI.WebOpenSignature(true);
                      await OfficeAPI.updateOfficeState("1,0");*/
            //盖章的时候要设置为可编辑状态，否则专业签章的按钮显示不对
            contentUpdate = true;

          case 68:
            changeSignature = true;

          case 69:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[46, 51]]);
  }));
  return _openSignature.apply(this, arguments);
}

function checkDocMarkBeforeSignature() {
  var docMarkObj = contentIframe.document.getElementById("sendForm").elements["my:doc_mark"];
  var docMark2Obj = contentIframe.document.getElementById("sendForm").elements["my:doc_mark2"];
  var summary_id = document.getElementById("summary_id").value;
  var orgAccountId = document.getElementById("orgAccountId").value;

  if (docMarkObj) {
    var _docMarkValue = docMarkObj.value;

    if (_docMarkValue == "" || _docMarkValue == " ") {
      if (!confirm(_("edocLang.edoc_mark_alert_null"))) {
        return false;
      }
    }

    if (_docMarkValue.indexOf("|") > -1) {
      _docMarkValue = _docMarkValue.split("|")[1];
    }

    if (_docMarkValue && _checkEdocMarkIsUsed(0, _docMarkValue, summary_id, orgAccountId)) {
      if (!confirm(_("edocLang.edoc_mark_alert_used"))) {
        return false;
      }
    }
  }

  if (docMark2Obj) {
    var _docMark2Value = docMark2Obj.value;

    if (_docMark2Value != "" || _docMarkValue != " ") {
      if (_docMark2Value.indexOf("|") > -1) {
        _docMark2Value = _docMark2Value.split("|")[1];
      }

      if (_checkEdocMarkIsUsed(0, _docMark2Value, summary_id, orgAccountId)) {
        if (!confirm(_("edocLang.edoc_serial_no_alert_used"))) {
          return false;
        }
      }
    }
  }

  return true;
}

function modifyBodySave() {
  return _modifyBodySave.apply(this, arguments);
}

function _modifyBodySave() {
  _modifyBodySave = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.next = 2;
            return saveOcx();

          case 2:
            if (_context19.sent) {
              _context19.next = 4;
              break;
            }

            return _context19.abrupt("return");

          case 4:
            disableButton("save");
            disableButton("cancel");
            theForm.submit();

          case 7:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19);
  }));
  return _modifyBodySave.apply(this, arguments);
}

function doEndModifyBodySave() {
  window.returnValue = "true";
  window.close();
}
/**
 * 新建 显示发起人附言区域
 */


function showNoteArea() {
  if (document.getElementById("noteAreaTd") != undefined && document.getElementById("noteAreaTd") != null) {
    document.getElementById("noteAreaTd").width = "180px";
    document.getElementById('noteAreaTable').style.display = "";

    var _noteMinDiv = document.getElementById('noteMinDiv');

    _noteMinDiv.style.display = "none"; //_noteMinDiv.style.height = "0px";
    //initIe10AutoScroll('noteMinDiv', 140);
  }
}

function hiddenNoteArea() {
  if (document.getElementById("noteAreaTd") != undefined && document.getElementById("noteAreaTd") != null) {
    document.getElementById("noteAreaTd").width = "30px";
    document.getElementById('noteAreaTable').style.display = "none";

    var _noteMinDiv = document.getElementById('noteMinDiv');

    _noteMinDiv.style.display = ""; //_noteMinDiv.style.height = "100%";
    //initIe10AutoScroll('noteMinDiv', 140);
  }
}
/**
 * 解析流程XML，返回字符串 Meber|1321234
 */


function getWFInfoFromXML(xmlString) {
  if (!xmlString) {
    return "";
  }

  var xmlDom = null;

  try {
    xmlDom = new ActiveXObject("MSXML2.DOMDocument");
  } catch (e) {
    return "";
  }

  try {
    xmlDom.loadXML(xmlString);
    var root = xmlDom.documentElement;

    if (!root) {
      return "";
    }

    var process = root.selectNodes("process");

    if (!process) {
      return "";
    }

    var nodes = process[0].selectNodes("node");

    if (!nodes || nodes.length < 1) {
      return "";
    }

    var partyIds = [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var actors = node.selectNodes("actor");

      if (!actors || actors.length < 1) {
        continue;
      }

      for (var j = 0; j < actors.length; j++) {
        var actor = actors[j];
        var partyId = actor.getAttribute("partyId");
        var partyType = actor.getAttribute("partyType");

        if (partyId && !isNaN(partyId)) {
          partyIds[partyIds.length] = partyType + "|" + partyId;
        }
      }
    }

    return partyIds.join(",");
  } catch (e) {}

  return "";
}

function doForward() {
  var theForm = document.getElementsByName("sendForm")[0];

  if (!theForm) {
    return false;
  }

  if (!hasWorkflow) {
    alert(v3x.getMessage("edocLang.edoc_selectWorkflow"));
    selectPeopleFun_forward();
    return false;
  }

  if (!checkForm(theForm)) {
    return false;
  }

  saveAttachment();
  theForm.b1.disabled = true;
  theForm.b2.disabled = true;
  theForm.submit();
}

function addNote(_isNoteAddOrReply, opinionId) {
  reply(opinionId); //发起人增加附言

  if (_isNoteAddOrReply == 'addnote') {
    var theForm = document.getElementsByName("repform")[0];
    document.getElementById("isHiddenDiv").style.display = "none";
    theForm.isNoteAddOrReply.value = _isNoteAddOrReply;
  }
}
/**
 * 插入关联文档
 *
 * @param appType
 */


function quoteDocumentEdoc(appType) {
  getA8Top().addassDialog = getA8Top().$.dialog({
    title: V5_Edoc().$.i18n("common.toolbar.insert.mydocument.label"),
    //关联文档
    transParams: {
      'parentWin': window
    },
    url: v3x.baseURL + '/ctp/common/associateddoc/assdocFrame.do?isBind=1,3' + CsrfGuard.getUrlSurffix(),
    targetWindow: getA8Top(),
    width: "1000",
    height: "800"
  });
}
/**
 * 插入关联文档窗口回调函数
 */


function quoteDocumentCallback(atts) {
  if (atts) {
    deleteAllAttachment(2);

    for (var i = 0; i < atts.length; i++) {
      var att = atts[i];
      addAttachment(att.type, att.filename, att.mimeType, att.createDate, att.size, att.fileUrl, true, false, att.description, null, att.mimeType + ".gif", att.reference, att.category);
    }
  }

  if (window.quoteDocument_affterFn) {
    window.quoteDocument_affterFn();
    window.quoteDocument_affterFn = null; //清空回调
  }
}

function jumpState(workstate, edocType) {
  var url = edocContorller;

  if (workstate == "darft") {
    url += "?method=edocFrame&from=listWaitSend&edocType=" + edocType;
  } else if (workstate == "sended") {
    url += "?method=edocFrame&from=listSent&edocType=" + edocType;
  } else if (workstate == "pending") {
    url += "?method=edocFrame&from=listPending&edocType=" + edocType;
  } else if (workstate == "done") {
    url += "?method=edocFrame&from=listDone&edocType=" + edocType;
  } else if (workstate == "waitRegister") {
    url += "?method=edocFrame&from=listRegisterPending&edocType=" + edocType;
  } else if (workstate == "doing") {
    url += "?method=edocFrame&from=listZcdb&edocType=" + edocType;
  } else if (workstate == "finish") {
    url += "?method=edocFrame&from=listFinish&edocType=" + edocType;
  }

  parent.location.href = url;
}

function quoteDocumentOK() {
  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return null;
  }

  var atts = [];
  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    var c = id_checkbox[i];

    if (c.checked) {
      var type = "2";
      var filename = c.getAttribute("subject");
      var mimeType = c.getAttribute("documentType");
      var createDate = "0000-00-00 00:00:00";
      var fileUrl = c.getAttribute("url");
      var description = c.getAttribute("url"); //function Attachment(id, reference, subReference, category, type, filename, mimeType, createDate, size, fileUrl, description, needClone)

      atts[atts.length] = new Attachment('', '', '', '', type, filename, mimeType, createDate, '0', fileUrl, description);
    }
  }

  if (!atts || atts.length < 1) {
    alert(getA8Top().v3x.getMessage('edocLang.edoc_alertQuoteItem'));
    return;
  }

  parent.window.returnValue = atts;
  parent.window.close();
}

function newEdoc(edocType) {
  //lijl添加获取checkbox的第一个值-------------Start
  var oCheckbox = document.getElementsByName("id");
  var count = 0;
  var id = "";

  for (var i = 0; i < oCheckbox.length; i++) {
    if (oCheckbox[i].checked) {
      id = oCheckbox[i].value;
      count++;
    }
  } //lijl添加获取checkbox的第一个值-------------End


  if (count == 0) {
    alert(_("edocLang.edoc_alertDontSelectMulti"));
    return;
  } else if (count > 1) {
    alert(_("edocLang.edoc_alertOnlyOneSelectMultiToFenfa"));
    return;
  } else {
    location.href = genericURL + "?method=newEdoc&edocType=" + edocType + "&id=" + id;
  }
} //转发文弹出提示窗口


var tempCheckedId = 0;
var tempRecAffairId = 0;
var tempListType = "";

function showForwardWDTwo(listType) {
  var objcts = document.getElementsByName("id");
  var checked = "";
  var count = 0;
  var newContactReceive = "";
  var summaryBodyType = ""; //用来接收是不是来自GD格式

  for (var i = 0; i < objcts.length; i++) {
    if (objcts[i].checked) {
      checked = '1';
      count++;
      tempCheckedId = objcts[i].value;
      tempRecAffairId = objcts[i].getAttribute("affairId");
      summaryBodyType = objcts[i].getAttribute("summaryBodyType");
    }
  }

  if (summaryBodyType == 'gd') {
    alert(_("edocLang.edoc_forward_sursen"));
    return;
  }

  if (checked != '1') {
    alert(_("edocLang.batch_select_forwardsend"));
    return;
  } else if (count > 1) {
    alert(_("edocLang.batch_select_onlyOne_forwardsend"));
    return;
  } else {
    tempListType = listType;

    var _url = genericURL + "?method=forwordOption&recEdocId=" + tempCheckedId;

    window.showForwardWDTwoWin = getA8Top().$.dialog({
      title: V5_Edoc().$.i18n("edoc.toolbar.Forwarding_text.label"),
      //转发文
      transParams: {
        'parentWin': window
      },
      url: _url,
      targetWindow: getA8Top(),
      width: "300",
      height: "195"
    });
  }
}
/**
 * 转发文回调函数
 */


function showForwardWDTwoCallback(re) {
  if (re == 'True') {
    // 隐藏域的form表单
    var newContactReceive = document.getElementById("newContactReceive");
    var checkOption = checkOption = document.getElementById("forwardCheckOption").value;

    if (newContactReceive != null) {
      newContactReceive = newContactReceive.value;
      var url = "edocController.do?method=listIndex&recAffairId=" + tempRecAffairId + "&listType=newEdoc&edocType=0&comm=forwordtosend&edocId=" + tempCheckedId + "&checkOption=" + checkOption + "&newContactReceive=" + newContactReceive;

      if (tempListType == 'registered') {
        url += "&forwordType=registered";
      } else if (tempListType == 'waitSent') {
        url += "&forwordType=waitSent";
      }

      parent.parent.location.href = url + CsrfGuard.getUrlSurffix();
    } else {
      parent.parent.location.href = "edocController.do?method=listIndex&recAffairId=" + tempRecAffairId + "&listType=newEdoc&edocType=0&comm=forwordtosend&edocId=" + tempCheckedId + "&checkOption=" + checkOption + CsrfGuard.getUrlSurffix();
    }
  }
} //阅转办弹出提示窗口


function showReadToDoneWD() {
  var objcts = document.getElementsByName("id");
  var checked = "";
  var checkedId = 0;
  var count = 0;

  for (var i = 0; i < objcts.length; i++) {
    if (objcts[i].checked) {
      checked = '1';
      count++;
      checkedId = objcts[i].value;
    }
  }

  if (checked != '1') {
    alert(_("edocLang.batch_select_readToDone"));
    return;
  } else if (count > 1) {
    alert(_("edocLang.batch_select_onlyforwardsend"));
    return;
  } else {
    document.getElementById("edocId").value = checkedId;
    document.getElementById("checkOption").value = '3';
    document.checkElementForm.submit();
  }
} //得到弹出窗口的选择值，并赋给父窗口变量, 回调父页面的回调函数


function checkForwdForm() {
  var val = document.getElementById("optionValue").value;
  var newContactReceive = document.getElementsByName("newContactReceive");
  var newContactReceiveVal = "";

  for (var i = 0; i < newContactReceive.length; i++) {
    if (newContactReceive[i].checked) {
      newContactReceiveVal = newContactReceiveVal + newContactReceive[i].value;
      newContactReceiveVal = newContactReceiveVal + ",";
    }
  }

  if (newContactReceiveVal.substring(newContactReceiveVal.length - 1, newContactReceiveVal.length) == ",") {
    newContactReceiveVal = newContactReceiveVal.substring(0, newContactReceiveVal.length - 1);
  } //


  var _parent = transParams.parentWin;
  _parent.document.getElementById("forwardCheckOption").value = val;

  if (newContactReceiveVal != "") {
    _parent.document.getElementById("newContactReceive").value = newContactReceiveVal;
  }

  transParams.parentWin.showForwardWDTwoCallback("True");
  transParams.parentWin.showForwardWDTwoWin.close();
}

var send_unit_value = "";
var send_unit_value2 = "";
var IndexValue = "";

function changeCategory(obj, edocFormId) {
  var jsonObj = $.parseJSON(categroy2Forms);
  var edocCategorySelectObj = document.getElementById("edocCategorySelect");

  if (edocCategorySelectObj) {
    //
    var edocFormSelect = $("#edoctable");
    edocFormSelect.empty();
    var categoryValue = edocCategorySelectObj.value;

    for (var i = 0; i < jsonObj.length; i++) {
      var obj = jsonObj[i];

      if (categoryValue == 'all' || obj.subtype == categoryValue) {
        var option = document.createElement("OPTION");
        option.value = obj.eid;
        option.text = obj.ename;

        if (obj.isdefault == "true") {
          edocFormSelect.append("<option value='" + obj.eid + "' selected >" + obj.ename + "</option>");
        } else {
          edocFormSelect.append("<option value='" + obj.eid + "'>" + obj.ename + "</option>");
        }
      }
    }
  }

  var edocFormObj = document.getElementById("edoctable");
  changeEdocForm(edocFormObj, edocFormId);
}

function changeEdocForm(selectObj, edocFormId) {
  /* xiangfan 添加 切换公文单时 同样需要对字段进行校验  修复GOV-4838 */
  if (IndexValue === "") {
    IndexValue = edocFormId;
  }

  if (validFieldData_gov() == false) {
    for (var i = 0; i < selectObj.options.length; i++) {
      if (selectObj.options[i].value == IndexValue) {
        selectObj.options[i].selected = true; //重新设置为选择前得文单
      }
    }

    return;
  }

  var selectedValue = selectObj.options[selectObj.selectedIndex].value;

  if (selectedValue != edocFormId) {
    IndexValue = selectedValue;
  } else {
    IndexValue = edocFormId;
  }
  /* xiangfan 添加 切换公文单时 同样需要对字段进行校验  修复GOV-4838 */
  //var formId=selectObj.options[selectObj.selectedIndex].value;
  //getEdocFormModel(formId);


  document.sendForm.action = collaborationCanstant.changeEdocFormURL;
  var tempCanUpdateContent = null;

  try {
    tempCanUpdateContent = _canUpdateContent;
  } catch (e) {} //if(tempCanUpdateContent==false)
  //{


  try {
    adjustReadFormForSubmit();
  } catch (e) {} // }


  var retData = ajaxFormSubmit(document.sendForm);
  var xmlObj = document.getElementById("xml"); //yangzd 转移数据中的特殊字符

  temp = new String(retData.get("xml"));
  temp = temp.replace(/&amp;/gi, "&"); //temp = temp.replace(/&lt;/gi,"<");
  //temp = temp.replace(/&gt;/gi,">");

  temp = temp.replace(/<br>/gi, "");
  temp = temp.replace(/&#039;/gi, "\'");
  temp = temp.replace(/&#034;/gi, "\"");
  temp = temp.replace(/&apos;/gi, "\'");
  xmlObj.value = temp; //  xmlObj.value=retData.get("xml");
  //yangzd

  var xlsObj = document.getElementById("xslt");
  xlsObj.value = retData.get("xslt");
  edocFormDisplay();
}

function getEdocFormModel(formId) {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocFormManager", "getEdocFormModel", false);
    requestCaller.addParameter(1, "long", formId);
    requestCaller.addParameter(2, "long", actorId);
    var ds = requestCaller.serviceRequest();
    var xmlObj = document.getElementById("xml");
    xmlObj.value = ds.get("xml");
    var xlsObj = document.getElementById("xslt");
    xlsObj.value = ds.get("xslt");
    edocFormDisplay();
  } catch (ex1) {
    alert("Exception : " + (ex1.number & 0xFFFF) + ex1.description);
  }
} //newEdoc.jsp页面使用


function dealPopupContentWinWhenDraft(contentNum) {
  if (canUpdateContent) {
    contentUpdate = true;
  }

  clickFlag = true;
  dealPopupContentWin(contentNum);
}

function dealPopupContentWin() {
  return _dealPopupContentWin.apply(this, arguments);
}

function _dealPopupContentWin() {
  _dealPopupContentWin = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
    var contentNum, forwordtosend, newOfficeId;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            _context20.prev = 0;

            if (!(window.document.readyState != "complete")) {
              _context20.next = 3;
              break;
            }

            return _context20.abrupt("return", false);

          case 3:
            if (!(bodyType == "HTML" || bodyType == 'Pdf' || bodyType == 'gd')) {
              _context20.next = 15;
              break;
            }

            _context20.next = 6;
            return checkFileIsExist(officeParams.fileId);

          case 6:
            _context20.t0 = !_context20.sent;

            if (!_context20.t0) {
              _context20.next = 9;
              break;
            }

            _context20.t0 = officeParams.originalFileId;

          case 9:
            if (!_context20.t0) {
              _context20.next = 12;
              break;
            }

            _context20.next = 12;
            return copyWebOffice(officeParams.originalFileId, officeParams.fileId);

          case 12:
            popupContentWin();
            _context20.next = 29;
            break;

          case 15:
            contentNum = document.getElementById("currContentNum").value;
            forwordtosend = document.getElementById("forwordtosend"); //办文转起草标识
            //var forwordtosend=document.getElementById("forwordtosend").value;

            newOfficeId = contentOfficeId.get(contentNum, null);

            if (!(newOfficeId && forwordtosend && forwordtosend.value != '1')) {
              _context20.next = 28;
              break;
            }

            officeParams.fileId = newOfficeId;
            _context20.next = 22;
            return checkFileIsExist(officeParams.fileId);

          case 22:
            _context20.t1 = !_context20.sent;

            if (!_context20.t1) {
              _context20.next = 25;
              break;
            }

            _context20.t1 = officeParams.originalFileId;

          case 25:
            if (!_context20.t1) {
              _context20.next = 28;
              break;
            }

            _context20.next = 28;
            return copyWebOffice(officeParams.originalFileId, officeParams.fileId);

          case 28:
            popupContentWin();

          case 29:
            _context20.next = 33;
            break;

          case 31:
            _context20.prev = 31;
            _context20.t2 = _context20["catch"](0);

          case 33:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, null, [[0, 31]]);
  }));
  return _dealPopupContentWin.apply(this, arguments);
}

function checkFileIsExist(fileId) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: _ctxPath + "/rest/office/file/isExist/" + fileId,
      type: 'GET',
      async: true,
      success: function success(res) {
        if (res && res.code === 0) {
          resolve(res.data);
        }
      },
      error: function error(e) {
        resolve(false);
      }
    });
  });
}

function copyWebOffice(sourceId, targetId) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: _ctxPath + '/rest/office/file/copyFile',
      type: 'GET',
      data: {
        targetId: targetId,
        sourceId: sourceId
      },
      success: function success(msg) {
        if (msg.code == 0) {
          resolve(msg.data.originalFileId);
        } else {
          resolve(false);
        }
      },
      error: function error() {
        resolve(false);
      }
    });
  });
}
/**
 * 点击页面按钮的时候加载office插件，但是不全屏，嵌入到页面中
 * @return
 */


function LazyloadOffice(_x11, _x12, _x13, _x14) {
  return _LazyloadOffice.apply(this, arguments);
}
/**
 * 判断文件是版式还是流式
 * @param {string} fileType
 * @returns 'LIUSHI' 'BANSHI' null
 */


function _LazyloadOffice() {
  _LazyloadOffice = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22(contentNum, viewOriginal, currentBodyType, currentFileId) {
    var bodyType, newOfficeId, fileType, contentNumFileId;
    return regeneratorRuntime.wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            _context22.prev = 0;

            if (!(window.document.readyState != "complete")) {
              _context22.next = 3;
              break;
            }

            return _context22.abrupt("return", false);

          case 3:
            bodyType = document.getElementById("bodyType").value;
            newOfficeId = officeParams.fileId;
            fileType = officeParams.fileType; //加载office插件

            if (bodyType != "HTML" && bodyType != 'Pdf' && bodyType != 'gd') {
              contentNumFileId = contentOfficeId.get(contentNum, null);

              if (typeof contentNumFileId !== 'undefined' && contentNumFileId && contentNumFileId !== '') {
                newOfficeId = contentNumFileId;
              }
            }

            if ('pdf' === currentBodyType) {
              bodyType = currentBodyType;
              newOfficeId = currentFileId;
              fileType = currentBodyType;
            }

            window.setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
              var domId, mode, params, officeSDK;
              return regeneratorRuntime.wrap(function _callee21$(_context21) {
                while (1) {
                  switch (_context21.prev = _context21.next) {
                    case 0:
                      // 新预览
                      domId = "scrollContentTd";
                      mode = OfficeSDK.ENUM_MODE_TYPE.VIEW; //文档通暂时不支持在打开文件前调整自定义按钮,因此只能editType发生改变时重新new,然后修改内部的权限,在打开文件时自动触发

                      if (officeSDK) {
                        officeSDK.destroy();
                      }
                      //gjx-start这是新预览

                      params = {
                        "fileId": newOfficeId,
                        "fileName": officeParams.fileName,
                        "newTitle": officeParams.fileName,
                        "fileType": fileType,
                        "category": "4",
                        "viewMode": "view",
                        "isShowLoadViewBtn": false,
                        "targetDom": {},
                        "isOpen": true
                      };
                      params.canPrint = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanPrint;
                      params.canDownload = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanSaveLocal;
                      params.canUpload = officeParams.canUpload ? officeParams.canUpload : false;
                      params.officecanPrint = officeParams.officecanPrint;
                      params.officecanSaveLocal = officeParams.officecanSaveLocal;
                      params.canCheckSign = true;
                      params.createDate = officeParams.createDate; // 适配查看原文档

                      try {
                        if (viewOriginal) {
                          params.isOriginalDoc = "true";
                        }
                      } catch (err) {
                        params.isOriginalDoc = "false";
                      }

                      if (!document.getElementById("scrollContentTd")) {
                        // 兼容弹框方式打开
                        domId = "";
                        params.isDialog = true;
                      }
                      // ==========================================
// 🚀 gjx强行拦截：将正文预览转交给 FileZ (修复版)
// ==========================================
                      try {
                        console.log("666拦截到公文正文加载，参数:", params);

                        var fileZParamData = {
                          "fileId": params.fileId,
                          "createDate": params.createDate,
                          "fileName": params.fileName + '.' + fileType,
                          "state": "view"
                        };

                        var fileZRavl = window.callBackendMethod("euFileZManager", "fileZInit", fileZParamData);

                        if (fileZRavl != null && fileZRavl.url) {
                          // 1. 新窗口打开 FileZ 预览
                          window.open(
                              fileZRavl.url,
                              "_blank",
                              "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
                          );

                          // 2. 🧹 清理可能残留的 Loading 遮罩（gjx修正版 2026-07-10）
                          // 致远进度条实例挂在 getCtpTop().proce（$.progressBar() 的返回值），
                          // 存在则关闭，不存在静默跳过——不再猜测 $.progressBar.close/endProc 等不存在的 API
                          try {
                            if (typeof getCtpTop === 'function' && getCtpTop().proce
                                && typeof getCtpTop().proce.close === 'function') {
                              getCtpTop().proce.close();
                              getCtpTop().proce = null;
                            }
                          } catch (clearErr) { /* 静默：无遮罩无需处理 */ }

                          // 3. 🎨 核心修复：给原本要加载正文的空白区域塞一个友好提示，防止页面塌陷或留白太突兀
                          var tdDom = document.getElementById("scrollContentTd");
                          if (tdDom) {
                            tdDom.innerHTML = "<div style='display:flex; justify-content:center; align-items:center; height:100%; min-height:300px; color:#999; font-size:16px; background:#f5f5f5; border: 1px dashed #ccc;'>" +
                                "<div><p style='margin-bottom:10px;'>📄 正文已在 FileZ 新窗口中打开预览</p>" +
                                "<p style='font-size:12px; color:#aaa;'>若未弹出，请检查浏览器是否拦截了弹窗</p></div>" +
                                "</div>";
                          }

                          // 4. 安全退出，不执行后续的 officeSDK
                          return _context21.abrupt("return");
                        } else {
                          console.warn("FileZ 接口未返回有效 URL，尝试降级回原生 OfficeSDK");
                        }
                      } catch (error) {
                        console.error("FileZ 拦截正文预览失败:", error);
                      }
// ==========================================
                      officeSDK = new OfficeSDK(params);
                      _context21.prev = 14;
                      _context21.next = 17;
                      return officeSDK.init({
                        webRoot: OfficeSDK.utils.getWebRoot(),
                        domId: domId,
                        mode: mode,
                        fileType: fileType
                      });

                    case 17:
                      _context21.next = 23;
                      break;

                    case 19:
                      _context21.prev = 19;
                      _context21.t0 = _context21["catch"](14);
                      $.alert(V5_Edoc().$.i18n("当前配置，不支持预览"));
                      return _context21.abrupt("return");

                    case 23:
                      if (!(viewOriginal && getDocType(fileType) === 'LIUSHI')) {
                        _context21.next = 39;
                        break;
                      }

                      params.mode = "EDIT"; // 查看原正文需要放开“痕迹”按钮

                      params.isShowTrailBtn = true;
                      params.canRevise = true;
                      _context21.prev = 27;
                      _context21.next = 30;
                      return officeSDK.switchProvider(params);

                    case 30:
                      _context21.next = 36;
                      break;

                    case 32:
                      _context21.prev = 32;
                      _context21.t1 = _context21["catch"](27);
                      $.alert(V5_Edoc().$.i18n("当前配置，不支持查看原文档"));
                      return _context21.abrupt("return");

                    case 36:
                      // 查看原文档中的弹窗,关闭后需要立即销毁,因此 dialogCloseCallback设置为null,
                      officeSDK.openFile({
                        dialogCloseCallback: null
                      });
                      _context21.next = 40;
                      break;

                    case 39:
                      officeSDK.openFile();

                    case 40:
                    case "end":
                      return _context21.stop();
                  }
                }
              }, _callee21, null, [[14, 19], [27, 32]]);
            })), 1000);
            _context22.next = 13;
            break;

          case 11:
            _context22.prev = 11;
            _context22.t0 = _context22["catch"](0);

          case 13:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, null, [[0, 11]]);
  }));
  return _LazyloadOffice.apply(this, arguments);
}

function getDocType(fileType) {
  var liushiArray = ['docx', 'doc', 'wps', 'xlsx', 'xls', 'et', 'ods', 'csv', 'pptx', 'ppt', 'dps'];
  var banshiArray = ['ofd', 'Ofd', 'pdf', 'Pdf'];
  var type;

  if (liushiArray.indexOf(fileType) !== -1) {
    type = 'LIUSHI';
  } else if (banshiArray.indexOf(fileType) !== -1) {
    type = 'BANSHI';
  } else {
    type = null;
  }

  return type;
} //正文修改后，提示用户是否修改


function askUserSaveOnly() {
  if (contentUpdate == true) {
    return window.confirm(_("edocLang.edoc_contentConfirmSave"));
  } else {
    return false;
  }
} //正文修改后，提示用户是否修改


function askUserSave(_x15) {
  return _askUserSave.apply(this, arguments);
}
/**
 * 弹出正文窗口
 */
// todo zl


function _askUserSave() {
  _askUserSave = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(isAsk) {
    var isSave;
    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            isSave = true;

            if (!(contentUpdate == true)) {
              _context23.next = 11;
              break;
            }

            if (isAsk) {
              isSave = window.confirm(_("edocLang.edoc_contentConfirmSave"));
            }

            if (!isSave) {
              _context23.next = 11;
              break;
            }

            _context23.next = 6;
            return saveOcx();

          case 6:
            _context23.t0 = _context23.sent;

            if (!(_context23.t0 == false)) {
              _context23.next = 10;
              break;
            }

            alert(_("edocLang.edoc_contentSaveFalse"));
            return _context23.abrupt("return", false);

          case 10:
            contentUpdate = false;

          case 11:
            return _context23.abrupt("return", true);

          case 12:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23);
  }));
  return _askUserSave.apply(this, arguments);
}

function popupContentWin(_x16) {
  return _popupContentWin.apply(this, arguments);
}
/**
 * 修改HTML正文回调函数
 *
 * @param rv
 */


function _popupContentWin() {
  _popupContentWin = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(hasSign) {
    var bodyType,
        isFromTemplete,
        i,
        tempArg,
        tempUrl,
        summaryIdObj,
        domId,
        mode,
        params,
        transParms,
        _subject,
        officeSDK,
        _args24 = arguments;

    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            if (!(window.document.readyState != "complete")) {
              _context24.next = 2;
              break;
            }

            return _context24.abrupt("return", false);

          case 2:
            bodyType = document.getElementById("bodyType").value;

            if (!(bodyType == "HTML")) {
              _context24.next = 23;
              break;
            }

            isFromTemplete = false;
            i = 0;

          case 6:
            if (!(i < _args24.length)) {
              _context24.next = 14;
              break;
            }

            tempArg = _args24[i];

            if (!(tempArg == 'isFromTemplete')) {
              _context24.next = 11;
              break;
            }

            isFromTemplete = true;
            return _context24.abrupt("break", 14);

          case 11:
            i++;
            _context24.next = 6;
            break;

          case 14:
            tempUrl = fullEditorURL;

            if (typeof sendEdocId != "undefined") {
              tempUrl = tempUrl + "&sendEdocId=" + sendEdocId;
            }

            summaryIdObj = document.getElementById("summaryId");

            if (summaryIdObj) {
              tempUrl += "&summaryId=" + summaryIdObj.value;
            }

            if (isFromTemplete) {
              // 来自公文模板，不检查正文是否被并发修改；
              if (contentUpdate == false) {
                tempUrl += "&canEdit=false";
              } else {
                tempUrl += "&canEdit=true";
              }

              tempUrl += "&isFromTemplete=true";
            } else {
              // 非公文模板，检查正文是否被并发修改；
              if (contentUpdate == false || checkConcurrentModifyForHtmlContent(summaryId) && summaryId != -1 && summaryId != 0) {
                tempUrl += "&canEdit=false";
              } else {
                tempUrl += "&canEdit=true";
              }
            }

            if (typeof officecanPrint != "undefined" && officecanPrint != null) {
              tempUrl += "&canPrint=" + officecanPrint;
            } else {
              tempUrl += "&canPrint=true";
            }

            window.popupContentEditWin = getA8Top().$.dialog({
              title: v3x.getMessage("edocLang.edoc_seeyon_software"),
              transParams: {
                'parentWin': window
              },
              url: tempUrl,
              targetWindow: getA8Top(),
              width: getA8Top().screen.availWidth,
              height: getA8Top().screen.availHeight
            });
            _context24.next = 73;
            break;

          case 23:
            // todo zl
            if (bodyType == 'OfficeWord') {
              officeParams.fileType = "doc";
            } else if (bodyType == 'OfficeExcel') {
              officeParams.fileType = "xlsx";
            } else if (bodyType == 'WpsWord') {
              officeParams.fileType = "wps";
            } else if (bodyType == 'WpsExcel') {
              officeParams.fileType = "et";
            } else if (bodyType == 'Pdf') {
              officeParams.fileType = "pdf";
            } else if (bodyType == "Ofd") {
              officeParams.fileType = "ofd";
            } // 新编辑


            domId = "contentContainer";
            mode = OfficeSDK.ENUM_MODE_TYPE.VIEW; //文档通暂时不支持在打开文件前调整自定义按钮,因此只能editType发生改变时重新new,然后修改内部的权限,在打开文件时自动触发

            if (officeSDK) {
              officeSDK.destroy();
            }
            //gjx-start，这估计是老预览


            params = {
              "fileId": officeParams.fileId,
              "fileName": officeParams.fileName,
              "newTitle": officeParams.fileName,
              "fileType": officeParams.fileType,
              "category": "4",
              "viewMode": "view",
              // 需要设置editType的值 '0,0'/'1,0' 预览模式 '2,0'  编辑模式 '4,0' 编辑预览模式(分办、转公告)
              "editType": officeParams.editType ? officeParams.editType : '0,0',
              "isOpen": true,
              "editContent": 0,
              "webRoot": OfficeSDK.utils.getWebRoot(),
              "isDialog": true
            };

            console.log("66666666666666"); // 新编辑

            transParms = {
              "canSign": false,
              "canEdit": false,
              "notModifyWithSign": "false",
              "action": "view",
              "canTransOfd": false,
              "canTransPdf": false,
              "canWrite": "false"
            };
            _subject = "";

            if (typeof summaryObj != "undefined" && summaryObj) {
              _subject = summaryObj.subject;
            }

            transParms.saveAsFileName = _subject; //公文ofd查看正文，不应是编辑状态

            if ('edit' == officeParams.operation || officeParams.canEdit == 'true' || officeParams.canEdit == true) {
              params.viewMode = 'edit';
              mode = OfficeSDK.ENUM_MODE_TYPE.EDIT;
              transParms.canEdit = true;
              transParms.canWrite = "true";
              transParms.action = "edit"; // 有签章，禁止修改正文

              transParms.notModifyWithSign = true;
              transParms.canSign = false;
              transParms.editContent = 1; //修改正文状态

              transParms.canClearTrail = true;
            }

            if (hasSign) {
              mode = OfficeSDK.ENUM_MODE_TYPE.SIGN;
              transParms.canEdit = false;
              transParms.notModifyWithSign = "false";
              transParms.canSign = true;
              transParms.canCheckSign = true; //验章

              transParms.canWrite = "false";
              transParms.action = "sign";
              transParms.editContent = 0; //非修改正文状态
            }

            transParms.isReadNewFile = officeParams.isReadNewFile;
            transParms.needReadFile = officeParams.needReadFile;
            transParms.cookie = officeParams.sessionId;
            transParms.webRoot = OfficeSDK.utils.getWebRoot();
            transParms.fileId = officeParams.fileId;
            transParms.canPrint = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanPrint;
            transParms.canDownload = officeParams.canPrint ? officeParams.canPrint : officeParams.officecanSaveLocal;
            transParms.canUpload = officeParams.canUpload ? officeParams.canUpload : false;
            transParms.isShowTrailBtn = true;
            transParms.canRevise = true; // 新建状态不验证签章

            if (typeof officeParams.currentPageName != 'undefined' && officeParams.currentPage.contains("new")) {
              transParms.notModifyWithSign = false;
            }

            transParms.isLoadOfficeImmediate = true;
            transParms.parentWin = window;
            officeSDK = new OfficeSDK(_objectSpread(_objectSpread({}, params), transParms));
            _context24.prev = 48;
            _context24.next = 51;
            return officeSDK.init({
              webRoot: OfficeSDK.utils.getWebRoot(),
              domId: domId,
              mode: mode,
              fileType: officeParams.fileType
            });

          case 51:
            _context24.next = 57;
            break;

          case 53:
            _context24.prev = 53;
            _context24.t0 = _context24["catch"](48);
            $.alert(V5_Edoc().$.i18n("当前配置，不支持操作" + officeParams.fileType + "类型文件"));
            return _context24.abrupt("return");

          case 57:
            if (!(params.viewMode == 'edit')) {
              _context24.next = 71;
              break;
            }

            _context24.prev = 58;
            _context24.next = 61;
            return officeSDK.switchProvider({
              fileType: params.fileType,
              mode: "EDIT",
              editType: params.editType
            });

          case 61:
            _context24.next = 67;
            break;

          case 63:
            _context24.prev = 63;
            _context24.t1 = _context24["catch"](58);
            $.alert(V5_Edoc().$.i18n("当前配置，不支持操作" + params.fileType + "类型文件"));
            return _context24.abrupt("return");

          case 67:
            _context24.next = 69;
            return officeSDK.modifyContent();

          case 69:
            _context24.next = 73;
            break;

          case 71:
            _context24.next = 73;
            return officeSDK.openFile({
              isDialog: true
            });

          case 73:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, null, [[48, 53], [58, 63]]);
  }));
  return _popupContentWin.apply(this, arguments);
}

function popupContentWinCallback(rv) {
  if (document.getElementById("content") != null && typeof oFCKeditor != "undefined") {
    oFCKeditor.SetContent(rv);
    oFCKeditor.remove(); // 提交的时候不在拷贝编辑区域到输入text;

    CKEDITOR.instances['content'].setData(rv);
  } else {
    if (typeof htmlContentIframe != "undefined") {
      htmlContentIframe.document.getElementById("edoc-contentText").innerHTML = rv;
    } else {
      document.getElementById("edoc-contentText").innerHTML = rv;
    }
  }
}

function getHtmlContent() {
  var content, fckEditor, ckeditor, edocContentText;

  if (typeof htmlContentIframe != "undefined") {
    content = htmlContentIframe.document.getElementById("content");

    if (typeof htmlContentIframe.oFCKeditor != "undefined") {
      fckEditor = htmlContentIframe.oFCKeditor;
      ckeditor = htmlContentIframe.CKEDITOR.instances['content'];
    }

    edocContentText = htmlContentIframe.document.getElementById("edoc-contentText");
  } else {
    content = document.getElementById("content");

    if (typeof oFCKeditor != "undefined") {
      fckEditor = oFCKeditor;
      ckeditor = CKEDITOR.instances['content'];
    }

    edocContentText = document.getElementById("edoc-contentText");
  }

  var str = "";

  if (content != null && typeof fckEditor != "undefined") {
    if (v3x.useFckEditor) {
      str = fckEditor.GetContent();
    } else {
      str = ckeditor.getData();
    }
  } else {
    //浏览状态,正文放到Div里面了
    str = edocContentText.innerHTML;
  }

  return str;
}

function checkEdocFormSendToUnit() {
  var sendToEle = document.sendForm.elements["my:send_to"];

  if (sendToEle == null || sendToEle == undefined) {
    return false;
  }

  var fieldName = V5_Edoc().$.i18n("edoc.element.sendtounit"); //主送单位

  var msg = "";
  msg = validTextareaLength_gov(sendToEle.value.trim(), 4000, fieldName, msg);

  if (msg) {
    //alert(_("edocLang.edoc_alertSendToMax"));
    alert(msg);
    return true;
  }

  return false;
} //处理时保存修改的公文单


function saveEdocForm(operationAction) {
  if (isUpdateEdocForm == false) {
    return true;
  } //标题不能为空并且不含有特殊字符


  if (!checkSubject(document.sendForm)) {
    return;
  }

  document.sendForm.action = collaborationCanstant.updateEdocFormURL;

  if (validFieldData_gov() == false) {
    return false;
  } // 确保发文单位被提交


  if (document.getElementById('my:send_unit')) document.getElementById('my:send_unit').setAttribute('canSubmit', 'true');

  if (typeof summaryId != "undefined") {
    document.sendForm.elements["summaryId"].value = summaryId;
  } else {
    document.sendForm.elements["summaryId"].value = document.getElementById("summaryId").value();
  }

  document.sendForm.elements["operationAction"].value = operationAction;
  var retData = ajaxFormSubmit(document.sendForm);
  var ret;

  if (retData.indexOf("result=true") >= 0) {
    ret = true;
  } else if (retData.indexOf("result=historyMarkExist:") >= 0) {
    //签报时判断文号是否重复
    var position = retData.indexOf(":");
    alert(retData.substring(position + 1));
    ret = false;
  } else {
    ret = false;
  }

  return ret;
} //处理时保存正文


function saveContent() {
  return _saveContent.apply(this, arguments);
}
/**
 * AJax记录流程日志
 */


function _saveContent() {
  _saveContent = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
    var ajaxStr, affair_IdValue, summary_IdValue, ajaxUserId, redFormObj, oldContentUpdate, oldContentUpdate2, oldChangeSignature, redFormValue, bodyType, requestCaller, bodyContentId, ds, redContentValue, submitToRecord;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            submitToRecord = function _submitToRecord() {
              if (ajaxStr != "" && affair_IdValue && summary_IdValue && ajaxUserId) {
                recordChangeWord(affair_IdValue.value, summary_IdValue.value, ajaxStr, ajaxUserId.value);
                ajaxStr = "";
              }
            };

            ajaxStr = ""; //记录的是修改的类型的记录

            affair_IdValue = document.getElementById("affair_id");
            summary_IdValue = document.getElementById("summary_id");
            ajaxUserId = document.getElementById("ajaxUserId");
            redFormObj = document.getElementById("redForm");

            if (typeof getContentUpdate != "undefined") {
              oldContentUpdate = contentUpdate;

              if (contentUpdate == false) {
                try {
                  contentUpdate = getContentUpdate();
                } catch (e) {
                  contentUpdate = oldContentUpdate;
                }
              }

              if (contentUpdate == false) {
                if (typeof contentIsModify != "undefined") {
                  oldContentUpdate2 = contentUpdate;

                  try {
                    contentUpdate = contentIsModify();
                  } catch (e) {
                    contentUpdate = oldContentUpdate2;
                  }
                }
              }
            } else {
              if (contentUpdate == false && typeof _officeSDK != "undefined") {
                // todo zl
                // contentUpdate = _officeSDK.bodyIsModified(); // 暂未实现
                contentUpdate = true;
              }
            }

            if (typeof getIsSignOperation != "undefined") {
              oldChangeSignature = changeSignature;

              if (changeSignature == false) {
                try {
                  changeSignature = getIsSignOperation();
                } catch (e) {
                  changeSignature = oldChangeSignature;
                }
              }
            }

            if (redFormObj) {
              redFormValue = redFormObj.value;

              if (redFormValue == "true" && affair_IdValue && summary_IdValue) {
                ajaxStr = ajaxStr + ",taohongwendan";
              }
            } //Word转Pdf以后，如果PDF加盖了专业签章，保存PDF


            try {// todo zl pdf修改了同时保存PDF正文  暂未实现
              // if ($("#contentIframe")[0].contentWindow.PdfAPI.checkContentModify()) {
              // 	$("#contentIframe")[0].contentWindow.PdfAPI.savePdf();
              // }
            } catch (e) {}

            if (contentUpdate) {
              _context25.next = 13;
              break;
            }

            submitToRecord();
            return _context25.abrupt("return", true);

          case 13:
            bodyType = window.bodyType || document.getElementById("bodyType").value;

            if (!(bodyType == "HTML")) {
              _context25.next = 33;
              break;
            }

            //保存专业签章
            if (htmlContentIframe && htmlContentIframe.isInstallIsignatureHtml()) {
              htmlContentIframe.saveISignatureHtml(3);
            }

            _context25.prev = 16;
            requestCaller = new XMLHttpRequestCaller(this, "edocManager", "updateHtmlBody", false);
            bodyContentId = document.getElementById("bodyContentId").value;
            requestCaller.addParameter(1, "long", bodyContentId);
            requestCaller.addParameter(2, "String", getHtmlContent());
            ds = requestCaller.serviceRequest();
            ajaxStr = ajaxStr + ",contentUpdate";
            submitToRecord();
            return _context25.abrupt("return", ds == "true");

          case 27:
            _context25.prev = 27;
            _context25.t0 = _context25["catch"](16);
            alert("Exception : " + (_context25.t0.number & 0xFFFF) + _context25.t0.description);
            return _context25.abrupt("return", false);

          case 31:
            _context25.next = 40;
            break;

          case 33:
            // todo zl

            /**
             * 记录正文被修改的记录
             */
            if (contentUpdate) {
              if (changeWord) {
                ajaxStr = ajaxStr + ",contentUpdate";
              }
            }
            /**
             * 记录正文套红
             */


            if (hasTaohong) {
              redContentValue = theform.redContent;
              if (redContentValue && redContentValue.value == "true") ajaxStr = ajaxStr + ",taohong";
            }
            /**
             * 签章
             */


            if (changeSignature) {
              ajaxStr = ajaxStr + ",qianzhang";
            }

            _context25.next = 38;
            return saveOcx();

          case 38:
            if (_context25.sent) {
              _context25.next = 40;
              break;
            }

            return _context25.abrupt("return", false);

          case 40:
            /**
             * 修改正文并且导入了新文件，需要记录应用日志
             */
            try {
              if (isLoadNewFileEdoc) {
                ajaxStr = ajaxStr + ",isLoadNewFile";
              }
            } catch (e) {}

            submitToRecord(); // AJax记录操作日志

            return _context25.abrupt("return", true);

          case 43:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this, [[16, 27]]);
  }));
  return _saveContent.apply(this, arguments);
}

function recordChangeWord(affair_IdValue, summary_IdValue, ajaxStr, userId) {
  if (affair_IdValue == "" && summary_IdValue == "" && ajaxStr == "") return;

  try {
    if (affair_IdValue && summary_IdValue) {
      var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "recoidChangeWord", false);
      requestCaller.addParameter(1, "String", affair_IdValue);
      requestCaller.addParameter(2, "String", summary_IdValue);
      requestCaller.addParameter(3, "String", ajaxStr);
      requestCaller.addParameter(4, "String", userId);
      requestCaller.serviceRequest();
    }
  } catch (e) {}
} //调用模板确定后的回调函数


function refTemplete() {
  var id = getParameter("id");
  var rv = [];
  rv[0] = templeteType;

  if (templeteType == 'text') {
    rv[1] = document.getElementById("xslt").value;
    rv[2] = document.getElementById("xml").value;
    rv[3] = edocFormId;
    rv[4] = document.getElementById("bodyType").value;

    if (rv[4] == "HTML") {
      rv[5] = document.getElementById("edoc-contentText").innerHTML;
    } else {
      if (typeof fileId != 'undefined' && fileId) rv[5] = fileId;
      if (typeof createDate != 'undefined' && createDate) rv[6] = createDate;
    }

    rv[7] = id;
  } else if (templeteType == 'workflow') {
    rv[1] = caseProcessXML;
    rv[2] = workflowInfo;
    rv[3] = id; //返回分支条件

    rv[11] = branchs;
    rv[12] = keys;
    rv[13] = team;
    rv[14] = secondpost;
  } else if (templeteType == 'templete') {
    rv[1] = id;
    rv[2] = caseProcessXML;
    rv[3] = workflowInfo;
    /*rv[1] = caseProcessXML;
          rv[2] = workflowInfo;
          rv[3] = edocFormId;
          rv[4] = document.getElementById("xslt").value;
          rv[5] = document.getElementById("xml").value;
        rv[6]=document.getElementById("edoc-contentText").innerHTML;
        */
    //返回分支条件

    rv[11] = branchs;
    rv[12] = keys;
    rv[13] = team;
    rv[14] = secondpost; //返回督办信息

    rv[15] = supervisorId;
    rv[16] = supervisors;
    rv[17] = unCancelledVisor;
    rv[18] = sVisorsFromTemplate;
    rv[19] = awakeDate;
    rv[20] = superviseTitle;
  }

  rv[8] = id;
  getA8Top().window.returnValue = rv;
  getA8Top().close();
} //调用模板确定后的回调函数


function refTempleteIpad() {
  var id = getParameter("id");
  var rv = [];
  rv[0] = templeteType;

  if (templeteType == 'text') {
    rv[1] = document.getElementById("xslt").value;
    rv[2] = document.getElementById("xml").value;
    rv[3] = edocFormId;
    rv[4] = document.getElementById("bodyType").value;

    if (rv[4] == "HTML") {
      rv[5] = document.getElementById("edoc-contentText").innerHTML;
    } else {
      rv[5] = fileId;
      rv[6] = createDate;
    }

    rv[7] = id;
  } else if (templeteType == 'workflow') {
    rv[1] = caseProcessXML;
    rv[2] = workflowInfo;
    rv[3] = id; //返回分支条件

    rv[11] = branchs;
    rv[12] = keys;
    rv[13] = team;
    rv[14] = secondpost;
  } else if (templeteType == 'templete') {
    rv[1] = id;
    rv[2] = caseProcessXML;
    rv[3] = workflowInfo;
    /*rv[1] = caseProcessXML;
          rv[2] = workflowInfo;
          rv[3] = edocFormId;
          rv[4] = document.getElementById("xslt").value;
          rv[5] = document.getElementById("xml").value;
        rv[6]=document.getElementById("edoc-contentText").innerHTML;
        */
    //返回分支条件

    rv[11] = branchs;
    rv[12] = keys;
    rv[13] = team;
    rv[14] = secondpost; //返回督办信息

    rv[15] = supervisorId;
    rv[16] = supervisors;
    rv[17] = unCancelledVisor;
    rv[18] = sVisorsFromTemplate;
    rv[19] = awakeDate;
    rv[20] = superviseTitle;
  }

  rv[8] = id;
  return rv;
} //清空所有的affairId的value;


function clearAffairIdValue() {
  var affairIds = document.getElementsByName("affairId");

  try {
    if (affairIds) {
      for (var i = 0; i < affairIds.length; i++) {
        affairIds[i].value = '';
      }
    }
  } catch (e) {}
} //公文归档


var pigeonholeForEdocParam = {};

function pigeonholeForEdoc(pageType, edocType) {
  // 请空affairId的值，防止上次产生的affairId的值传递到了后台。
  clearAffairIdValue();
  var appName = document.getElementById("appName").value;
  var backTheform = document.getElementsByName("listForm")[0];
  var pigeonholeType = document.getElementById("pigeonholeType").value;

  if (!backTheform) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return true;
  }

  if (pigeonholeType == 0) {
    document.getElementById("pigeonholeType").value = 0; // 部门归档
  } else {
    document.getElementById("pigeonholeType").value = 1; // 单位归档
  }

  var hasMoreElement = false; // 是否直接弹出选择归档路径的对话框，当所有的都没有归档路径的时候就直接弹出，否则就不直接弹出。提交到后台

  var isSelectRedirectly = true;
  var len = id_checkbox.length;

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;
      break;
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItem"));
    return true;
  } // 已办列表，判断是否有归档权限，已发列表不需要判断


  if (pageType == 'finish') {
    var affairIds = "";

    for (var i = 0; i < len; i++) {
      if (id_checkbox[i].checked) {
        if (affairIds == "") {
          affairIds = id_checkbox[i].getAttribute("affairId");
        } else {
          affairIds += "," + id_checkbox[i].getAttribute("affairId");
        }
      }
    }

    var ret = checkHasAclNodePolicyOperation(affairIds, 'Archive');

    if (ret != 'ok') {
      var arr = ret.split("&");
      alert(v3x.getMessage("edocLang.edoc_alertnotaclaccpigeonhole", arr[0]));

      for (var i = 0; i < len; i++) {
        if (id_checkbox[i].checked) {
          if (arr[1].indexOf(id_checkbox[i].getAttribute("affairId")) != -1) {
            id_checkbox[i].checked = false;
          }
        }
      }

      return;
    }
  }

  var _affairId = "";
  var hasArchive = ""; // 已经归档
  // var notFinished = "";//流程未结束

  var tempSummaryIds = ""; //公文ID串

  for (var i = 0; i < id_checkbox.length; i++) {
    var checkbox = id_checkbox[i];
    if (!checkbox.checked) continue; // 判断是否已经归档，并且归档文件夹没有被删除。如果归档文件夹被删除了还要运行归档。

    var docResourceIsExist = '';

    if (checkbox.getAttribute("hasArchive") == "true" || checkbox.getAttribute("archiveId") != "") {
      docResourceIsExist = checkPigholeDocResourceIsExist(checkbox.getAttribute("archiveId"));
    }

    if (checkbox.getAttribute("hasArchive") == "true") {
      if (docResourceIsExist == 'true') {
        hasArchive += V5_Edoc().$.i18n("edoc.symbol.opening.chevron") + checkbox.getAttribute("subject") + V5_Edoc().$.i18n("edoc.symbol.closing.chevron") + "\r\n";
        checkbox.checked = false;
        continue;
      }
    } // 设置了预先归档，并且预归档文件夹存在，就提交到后台


    if (checkbox.getAttribute("archiveId") != "" && docResourceIsExist == 'true') {
      isSelectRedirectly = false;
    }

    var affairId = checkbox.getAttribute("affairId");

    if (tempSummaryIds == "") {
      tempSummaryIds += checkbox.value;
    } else {
      tempSummaryIds += "," + checkbox.value;
    }

    try {
      var element = document.createElement("<INPUT TYPE=HIDDEN NAME=affairId value='" + affairId + "' />"); // ff不支持
    } catch (e) {
      // Firefox处理方式，IE6,7不支持name属性的设置
      var element = document.createElement("INPUT");
      element.name = "affairId";
      element.value = affairId;
      element.type = "HIDDEN";
    }

    backTheform.appendChild(element);
  }

  if (hasArchive != "") {
    alert(_("edocLang.edoc_alertHasPigeonhole", hasArchive));
    return;
  }

  backTheform.action = collaborationCanstant.pigeonholeActionURL;
  disableButtons();

  if (isSelectRedirectly) {
    pigeonholeForEdocParam.backTheform = backTheform;
    pigeonholeForEdocParam.pageType = pageType;
    pigeonholeForEdocParam.edocType = edocType;
    pigeonholeForEdocParam.summaryIds = tempSummaryIds;
    doPigeonhole('new', appName, 'listDone', '', pigeonholeForEdocPart2); //后续代码在pigeonholeForEdocPart2中执行
  } else {
    var element = document.createElement("INPUT");
    element.name = "pageType";
    element.value = pageType;
    element.type = "HIDDEN";
    backTheform.appendChild(element);
    var element = document.createElement("INPUT");
    element.name = "edocType";
    element.value = edocType;
    element.type = "HIDDEN";
    backTheform.appendChild(element);
    backTheform.target = "tempIframe";
    backTheform.method = "POST";
    backTheform.submit();

    try {
      // if(pageType == 'sent'){
      // alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemSucceed"));
      // }
      getA8Top().startProc('');
    } catch (e) {}

    return true;
  }
}
/**
 * 修改Chrome37, pigeonholeForEdoc方法被分成两段执行
 */


function pigeonholeForEdocPart2() {
  var archiveId = document.getElementById('archiveId').value;

  if (archiveId == '') {
    return;
  }

  var app = document.getElementById("appName");
  var appName = "";

  if (app) {
    appName = app.value;
  }

  var backTheform = pigeonholeForEdocParam.backTheform;
  var pageType = pigeonholeForEdocParam.pageType;
  var edocType = pigeonholeForEdocParam.edocType;
  var summaryIds = pigeonholeForEdocParam.summaryIds; //后台验证公文是否已经在这个目下有归档, 这里调用了文档中心的ajax， 文档中心没有提供其他接口，这里可能有问题

  var requestCaller = new XMLHttpRequestCaller(this, "ajaxDocHierarchyManager", "judgeSamePigeonhole", false);
  requestCaller.addParameter(1, "Long", archiveId);
  requestCaller.addParameter(2, "Integer", appName);
  requestCaller.addParameter(3, "String", summaryIds);
  var result = requestCaller.serviceRequest();

  if (result == 'true') {
    //目标文档夹中已有相同名称的记录！
    alert(v3x.getMessage("edocLang.edoc_alert_pigeonhole_same_path"));
    window.location.href = window.location.href; //刷新页面

    return;
  }

  var element = document.createElement("INPUT");
  element.name = "pageType";
  element.value = pageType;
  element.type = "HIDDEN";
  backTheform.appendChild(element);
  var element = document.createElement("INPUT");
  element.name = "edocType";
  element.value = edocType;
  element.type = "HIDDEN";
  backTheform.appendChild(element);
  backTheform.target = "tempIframe";
  backTheform.method = "POST";
  backTheform.submit();

  try {
    // if(pageType == 'sent'){
    // alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemSucceed"));
    // }
    getA8Top().startProc('');
  } catch (e) {}

  return true;
}
/**
 *判断当前事项是否能指定的操作 。
 * @param affairIds  : 个人事项ID
 * @param operationName ： 操作名(如：DepartPigeonhole)
 * @return 当传入的事项都有权限的时候，返回为空值，当传入的某些事项没有指定操作的权限的时候，返回没有权限的事项的标题。
 */


function checkHasAclNodePolicyOperation(affairIds, operationName) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "checkHasAclNodePolicyOperation", false);
  requestCaller.addParameter(1, "String", affairIds);
  requestCaller.addParameter(2, "String", operationName);
  var ds = requestCaller.serviceRequest();
  return ds;
}

function checkPigholeDocResourceIsExist(archiveId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxDocHierarchyManager", "docResourceExist", false);
  requestCaller.addParameter(1, "Long", archiveId);
  var ds = requestCaller.serviceRequest();
  return ds;
} //lijl重写此方法


var pigeonCallbackSummaryId = "";
var pigeonCallbackAffairIds = "";

function listDepartPigeonhole(appName, departPigeonhole) {
  // getA8Top().startProc('');
  var theForm = document.getElementsByName("listForm")[0];

  if (!theForm) {
    return false;
  }

  var id_checkbox = document.getElementsByName("id");

  if (!id_checkbox) {
    return true;
  }

  var len = id_checkbox.length;
  var hasMoreElement = false;
  pigeonCallbackAffairIds = "";

  for (var i = 0; i < len; i++) {
    if (id_checkbox[i].checked) {
      hasMoreElement = true;

      if (pigeonCallbackSummaryId == "") {
        pigeonCallbackSummaryId = id_checkbox[i].value;
      } else {
        pigeonCallbackSummaryId += "," + id_checkbox[i].value;
      }

      if (pigeonCallbackAffairIds == "") {
        pigeonCallbackAffairIds = id_checkbox[i].getAttribute("affairId");
      } else {
        pigeonCallbackAffairIds += "," + id_checkbox[i].getAttribute("affairId");
      }
    }
  }

  if (!hasMoreElement) {
    alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItem"));
    return true;
  } // 判断是否有部门归档的权限


  var ret = checkHasAclNodePolicyOperation(pigeonCallbackAffairIds, 'DepartPigeonhole');

  if (ret != 'ok') {
    var arr = ret.split("&");
    alert(v3x.getMessage("edocLang.edoc_alertnotacldeppigeonhole", arr[0]));

    for (var i = 0; i < len; i++) {
      if (id_checkbox[i].checked) {
        if (arr[1].indexOf(id_checkbox[i].getAttribute("affairId")) != -1) {
          id_checkbox[i].checked = false;
        }
      }
    }

    return;
  } // lijl添加departPigeonhole参数


  var archiveIds = pigeonhole(appName, pigeonCallbackAffairIds, "", "", "", "listDepartPigeonholeCallback");
}
/**
 * listDepartPigeonhole归档回调方法
 */


function listDepartPigeonholeCallback(archiveIds) {
  document.getElementById("pigeonholeType").value = 0; // 部门归档

  if (archiveIds == "cancel") {
    return;
  }

  if (archiveIds == "" || archiveIds == "failure") {// GOV-3991 重复做部门归档的时候提示重复，点击叉会提示归档失败，点击取消就不会
    // alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemFailure"));
  } else {
    try {
      var ajaxUserId = document.getElementById("ajaxUserId");

      if (pigeonCallbackSummaryId && pigeonCallbackAffairIds && ajaxUserId) {
        recordChangeWord(pigeonCallbackAffairIds, pigeonCallbackSummaryId, "depPinghole", ajaxUserId.value);
      }
    } catch (e) {}

    alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemSucceed"));
    window.location.href = window.location.href;
  }
}

function DepartPigeonhole(appName, affairId) {
  window.pigeonholeObjectId = "";

  if (window.summaryId) {
    window.pigeonholeObjectId = window.summaryId; //指定affair的objectId
  }

  var archiveIds = pigeonhole(appName, affairId, "", "", "", "DepartPigeonholeCallback");
}
/**
 * DepartPigeonhole 归档回掉
 * @param archiveIds
 */


function DepartPigeonholeCallback(archiveIds) {
  if (archiveIds == "cancel") {
    return;
  }

  if (archiveIds == "" || archiveIds == "failure") {
    alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemFailure"));
  } else {
    try {
      var affair_IdValue = document.getElementById("affair_id");
      var summary_IdValue = document.getElementById("summary_id");
      var ajaxUserId = document.getElementById("ajaxUserId");

      if (affair_IdValue && summary_IdValue && ajaxUserId) {
        recordChangeWord(affair_IdValue.value, summary_IdValue.value, "depPinghole", ajaxUserId.value);
      }
    } catch (e) {}

    alert(v3x.getMessage("edocLang.edoc_alertPigeonholeItemSucceed"));
  }
}

function timeValidate(begin, end) {
  if (new Date(begin.replace(/-/g, "/")) > new Date(end.replace(/-/g, "/"))) {
    alert(v3x.getMessage("edocLang.edoc_timeValidate"));
    return false;
  }

  return true;
} //双击编辑待发公文单


function editWaitSend(summaryId, affairId, type) {
  var url = genericURL + "?method=newEdoc&summaryId=" + summaryId + "&from=WaitSend" + "&affairId=" + affairId; //从退稿箱中到 拟文编辑页面

  if (type == 1) {
    url += "&backBoxToEdit=true";
  }

  location.href = url;
} //点击编辑图标编辑待发公文单


function editFromWaitSend(type, from) {
  var edocType = document.getElementById("edocType").value;

  if (from == undefined || from == null || from == "") {
    from = "newEdoc";
  }

  try {
    var id_checkbox = document.getElementsByName("id");

    if (!id_checkbox) {
      return;
    }

    var count = validateCheckbox("id");

    if (count == 1) {
      for (var i = 0; i < id_checkbox.length; i++) {
        var idCheckBox = id_checkbox[i];
        var substate = ""; //待发子状态 1：草稿，2：回退 3：撤销

        if (idCheckBox.checked) {
          var summaryId = idCheckBox.value;
          var affairId = idCheckBox.getAttribute("affairId");
          substate = id_checkbox[i].getAttribute("substate"); //草稿在没有拟文权限的情况下，不再允许编辑

          if (isEdocCreateRole == false) {
            //if(isEdocCreateRole==false && substate==1){现在是只要没有发起权，就不能发送了
            alert(v3x.getMessage("edocLang.alert_not_edoccreate"));
            return;
          }

          var isSendBackBox = document.getElementById("isSendBackBox");
          var url = "edocController.do?method=listIndex&from=" + from + "&listType=" + from + "&recListType=listDistribute&summaryId=" + summaryId + "&edocType=" + edocType + "&affairId=" + affairId + (isSendBackBox && isSendBackBox.value ? "&isSendBackBox=" + isSendBackBox.value : ""); //从退稿箱中到 拟文编辑页面
          //if(type == 1 &&(substate==2||substate==16||substate==18)){
          //substate==2表示退回到待发的公文，退回的公文编辑可以调用模板，就不加下面的参数

          if (type == 1 && (substate == 16 || substate == 18)) {
            url += "&backBoxToEdit=true";
          }

          if (type == 1 && substate == 2) {
            url += "&canOpenTemplete=true";
          }

          url += "&comm=" + document.getElementById("comm");
          parent.parent.window.location.href = url;
        }
      }
    } else if (count == 0) {
      alert(v3x.getMessage("edocLang.edoc_alertSelectEditItem"));
      return;
    } else {
      //alert(v3x.getMessage("edocLang.edoc_alertDontSelectMulti"));
      alert(v3x.getMessage("edocLang.edoc_only_select_one_edit"));
      return;
    }
  } catch (e) {}
}
/***************公文单控制部分开始*******************/
//*初始化时全部初始化为只读状态,不根据xml的权限进行控制*//


function initReadSeeyonForm(s, x) {
  //var initStr = "http://127.0.2.84:8080/seeyon/form.do?method=creatformxml&";
  //initStr = initStr + "formOperation=" + formOperation;
  //var str = init(initStr);
  //alert(str);
  var str = s;
  var xslStart = str.indexOf("&&&&&&&  xsl_start  &&&&&&&&");
  var dataStart = str.indexOf("&&&&&&&&  data_start  &&&&&&&&");
  var inputStart = str.indexOf("&&&&&&&&  input_start  &&&&&&&&");
  if (xslStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "xsl"); //没有找到xsl

  if (dataStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "data"); //没有找到data

  if (inputStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "input"); //没有找到input

  var xsl = str.slice(xslStart + 28, dataStart);
  var data = str.slice(dataStart + 30, inputStart);
  var finput = str.slice(inputStart + 31); //替换&字符
  //var reg=/&/g;
  //data=data.replace(reg, "&amp;");

  var html = document.getElementById("html");
  var fnow = transformNode(data, x); //infopath设置了自动换行，转化为html的时候会自动添加下面这个可编辑的属性，导致意见元素可编辑，所以需要替换掉。

  fnow = fnow.replace(/contentEditable=\"true\"/g, "");
  fnow = fixFormStyle4Browser(fnow); //修复样式问题
  //&符号转义-BUG_普通_V5_V5.1sp1_致远客服部_公文单有"<"，在导入的时候会提示“公文单数据出现异常！错误原因：解析XML失败”_20150626010068.在edocFormController有对应转换。搜bug编号

  var reg = /&amp;/g;
  fnow = fnow.replace(reg, "&");
  html.innerHTML = fnow; //边框打印样式问题调整

  _fixTableBorder(html); //字段宽度设置


  window.fixFormParam = window.fixFormParam ? window.fixFormParam : {};

  var _toReloadSpans = window.fixFormParam.reLoadSpans ? true : false;

  var _isPrint = window.fixFormParam.isPrint ? true : false;

  if (_toReloadSpans) {
    window.opinionSpans = null;
  }

  _fixSpanWidth();

  _setFormFieldWidth(_isPrint);

  initReadHtml(finput);
  initJSObject(data);

  try {
    setOpinionSpandefaultHeight();
  } catch (e) {}
} //取到area并进行替换


function initReadHtml(aInput) {
  Init_Image(); //document.onclick = SeeyonForm_BuildDocClickHandler('common');

  var fFiledList = paseFormatXML(getXmlContent(aInput));
  convertReadHtml(fFiledList);
  var repeatTable = new Seeyonform_rtable();
  repeatTable.change();
  var reSection = new Seeyonform_rsection();
  reSection.change();
}

function convertReadHtml(aFieldList) {
  var field;
  var fAreas;

  for (var i = 0; i < aFieldList.length; i++) {
    field = aFieldList[i];
    fAreas = field.findArea(field.fieldName);

    if (fAreas != 0) {
      for (var j = 0; j < fAreas.length; j++) {
        //312sp1 bug 31615 将内部文号独立出来，不根据开关“是否允许修改外来文登记”来控制。后续进行根细化的处理。
        if (field.fieldName == "my:serial_no" && typeof currentPage != "undefined" && currentPage == "newEdoc") {
          if (field.access == "edit" || field.access == null) {
            field.change(fAreas[j]);

            if (firstCanEditElementId == "") {
              firstCanEditElementId = field.fieldName;
            }

            isIncludeCanUpdateElement = true;
          } else {
            field.browse(fAreas[j]);
          }
        } else {
          field.browse(fAreas[j]);
        }
      }
    } else {//throw "页面没有名为"+ field.fieldName +"的span元素";
    }
  }
} //文号修改标志


var edocMarkUpd = false; //修改文单标记

var edocUpdateForm = false;

function addSelectOption(obj, value, dis) {
  if (obj == null || value == "") {
    return;
  }

  var i,
      len = obj.options.length;

  for (i = 0; i < len; i++) {
    if (obj.options[i].value == value) {
      obj.options[i].selected = true;
      return;
    }
  }

  var opt = document.createElement("OPTION");
  obj.options.add(opt);
  opt.value = value;
  opt.text = dis;
  opt.selected = true;
} // 在多人执行时，判断是否有人修改正文。


function checkAndLockEdocEditForm(summaryId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocSummaryManager", "editObjectState", false);
  requestCaller.addParameter(1, "String", summaryId);
  var ds = requestCaller.serviceRequest(); //TODO 这里通过ajax返回的UserUpdateObject 对象是一个字符串了，是不对的，需要平台组来改

  if (ds.get("curEditState") == "true") {
    canUpdateWendan = false;
    var from = ds.get("from");

    if (from == 'pc') {
      alert(_("edocLang.edoc_cannotedit_pc", ds.get("userName")));
    } else {
      alert(_("edocLang.edoc_cannotedit_mobile", ds.get("userName")));
    }

    return true;
  } //新建文档，不需要更新


  if (ds.get("lastUpdateTime") == null) {
    return false;
  }

  return false;
} // 解锁，让别人可以修改文单


function unlockEdocEditForm(summaryId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocSummaryManager", "deleteUpdateObj", false, "GET", false);
  requestCaller.addParameter(1, "String", summaryId);

  if (arguments.length > 1) {
    requestCaller.addParameter(2, "String", arguments[1]);
  }

  requestCaller.serviceRequest();
}

function UpdateEdocForm(summaryId) {
  parent.showPrecessAreaTd('edocform'); // 判断是否有其他用户在修改文单

  if (checkAndLockEdocEditForm(summaryId)) return; //已经是文号修改状态

  if (edocUpdateForm) {
    return;
  }

  var edocMark1 = "";
  var edocMarkDis1 = "";
  var edocMark2 = "";
  var edocMarkDis2 = ""; //检查文号是否修改,避免修改文单后修改文号内容丢失

  if (edocMarkUpd) {
    var obj = document.getElementById("my:doc_mark");

    if (obj != null && obj.tagName == "SELECT") {
      edocMark1 = obj.options[obj.selectedIndex].value;
      edocMarkDis1 = obj.options[obj.selectedIndex].text;
    }

    obj = document.getElementById("my:doc_mark2");

    if (obj != null && obj.tagName == "SELECT") {
      edocMark2 = obj.options[obj.selectedIndex].value;
      edocMarkDis2 = obj.options[obj.selectedIndex].text;
    }
  } //保存手写签批信息，如果修改


  if (checkUpdateHw()) {
    if (window.confirm(_("edocLang.edoc_confirmSaveHw"))) {
      saveHwData();
    }
  }

  var xml = document.getElementById("xml");
  var xsl = document.getElementById("xslt"); //设置修复字段宽度的传参

  window.fixFormParam = {
    "isPrint": true,
    "reLoadSpans": true
  };
  initSeeyonForm(xml.value, xsl.value); //重新生成公文单后，重新显示意见，手写内容

  initSpans();
  dispOpinions(opinions, sendOpinionStr);
  initHandWrite();
  substituteLogo(logoURL);
  setObjEvent();

  if (edocMarkUpd) {
    var obj = document.getElementById("my:doc_mark");

    if (obj != null && obj.tagName == "SELECT") {
      addSelectOption(obj, edocMark1, edocMarkDis1);
    }

    obj = document.getElementById("my:doc_mark2");

    if (obj != null && obj.tagName == "SELECT") {
      addSelectOption(obj, edocMark2, edocMarkDis2);
    }
  }

  try {
    if (firstCanEditElementId != "") {//不让公文标题获得焦点了，因为如果标题在文单的最下方，会导致整个文单向下拉动，上面的按钮看不见了

      /*
               var firstEditObj=document.getElementById(firstCanEditElementId);
               if(firstEditObj!=null)
               {
                 firstEditObj.focus();
               }*/
    }
  } catch (e) {}

  isUpdateEdocForm = true; //记录日志的时候不能区别出是修改了文单还是仅仅修改了文号。加此变量就是为了区别这个 BUG30034

  var isOnlyModifyWordNo = document.getElementById("isOnlyModifyWordNo");
  if (isOnlyModifyWordNo) isOnlyModifyWordNo.value = "false";
  edocUpdateForm = true;
  parent.contentIframe.showEdocMark();
  return;
}

function setWordNoEdit(wordObj) {
  var i;
  var jsObj = null;
  var divObj = null;

  if (wordObj.disabled == true || wordObj.tableName != "SELECT" && wordObj.readOnly == true) {
    for (i = 0; i < fieldInputListArray.length; i++) {
      if (fieldInputListArray[i].fieldName == wordObj.name) {
        jsObj = fieldInputListArray[i];
        break;
      }
    }

    if (jsObj != null) {
      jsObj.change(wordObj);

      if (document.getElementById("my:doc_mark_span")) {
        document.getElementById("my:doc_mark_span").style.width = "0px";
      }

      addEditWordNoImage(document.getElementById(wordObj.id));
    }
  }
}
/**
 *
 * @param obj
 * @return
 */


function getInputJsObject(obj) {
  var jsObj = null;

  for (i = 0; i < fieldInputListArray.length; i++) {
    if (fieldInputListArray[i].fieldName == obj.name) {
      jsObj = fieldInputListArray[i];
      break;
    }
  }

  return jsObj;
}

function setSerialNoEdit(wordObj) {
  var i;
  var jsObj = null;

  if (wordObj.disabled == true || wordObj.tableName != "SELECT" && wordObj.readOnly == true) {
    jsObj = getInputJsObject(wordObj);

    if (jsObj != null) {
      jsObj.change(wordObj);
      if (_isTemplete != true //不是模板
      && personInput == 'true' //允许手写
      && typeof isBoundSerialNo != "undefined" && isBoundSerialNo != "true") //如果是调用模板。模板没有绑定内部文号
        addEditSerialNoImage(document.getElementById(wordObj.id));
    }
  }
}

function isWordNoReadCanEdit(obj) {
  if (obj == null || obj && obj.getAttribute("access") == "browse") {
    return false;
  }

  return true;
}

function isWordNoReadonlyAll() {
  var isAlertEdocMark = true;
  var docMark = document.getElementById("my:doc_mark");
  var docMark2 = document.getElementById("my:doc_mark2");
  var sobj = document.getElementById("my:serial_no");

  if (isWordNoReadCanEdit(docMark) || isWordNoReadCanEdit(docMark2) || isWordNoReadCanEdit(sobj)) {
    isAlertEdocMark = false;
  }

  if (isAlertEdocMark) {
    if (!docMark && !docMark2 && !sobj) {
      alert(_("edocLang.edoc_mark_edit_no_element"));
    } else {
      alert(_("edocLang.edoc_mark_cannot_edit"));
    }

    return true;
  }

  return false;
}
/**
 * 点击修改文号小图片跳转 33469 修改方案：(320) 1、当页面只有公文文号，没有内部文号的时候就采用以前的方式，即弹出断号选择框的方式
 *2、当页面即有公文文号又有内部文号的时候，则不弹出选择框，直接在文单中置成可以修改的形式。让用户点击图标
 */


function WordNoChange(objid) {
  if (typeof isNewColl == "undefined") {
    //新建页面不加锁
    // 判断是否有其他用户在修改文单
    if (checkAndLockEdocEditForm(summaryId)) {
      return;
    }
  } // 都不能编辑的时候提醒不能编辑。


  if (isWordNoReadonlyAll()) {
    return;
  }

  if (!(typeof currentPage != 'undefined' && currentPage == 'newEdoc')) {
    // 不是拟文页面点文号修改先执行页面跳转
    parent.showPrecessAreaTd("edocform");
  }

  var _obj;

  var selDocmark = "my:doc_mark"; // 给选择文号页面传递的参数，用来确定是第一套文号还是第二套文号。

  var templeteIdValue = "";
  var templeteId = document.getElementById("templeteId");

  if (templeteId) {
    templeteIdValue = templeteId.value;
  }

  if (objid == null) {
    _obj = document.getElementById("my:doc_mark");

    if (_obj == null) {
      _obj = document.getElementById("my:doc_mark2");
      selDocmark = "my:doc_mark2";
    }
  } else {
    _obj = document.getElementById(objid);
    selDocmark = objid;
  }

  var serialNoObj = document.getElementById("my:serial_no");
  var docMarkObj = document.getElementById("my:doc_mark");
  var docMark2Obj = document.getElementById("my:doc_mark2");

  if (docMarkObj == null && docMark2Obj == null && serialNoObj == null) {
    alert(_("edocLang.edoc_form_noDocMark"));
    return;
  }

  var docMarkAccess = "1";
  var docMark2Access = "1";
  var serialNoAccess = "1";

  if (parent != null && parent.document.getElementById("docMarkAccess") != null) {
    docMarkAccess = parent.document.getElementById("docMarkAccess").value;
  }

  if (parent != null && parent.document.getElementById("docMark2Access") != null) {
    docMark2Access = parent.document.getElementById("docMark2Access").value;
  }

  if (parent != null && parent.document.getElementById("serialNoAccess") != null) {
    serialNoAccess = parent.document.getElementById("serialNoAccess").value;
  }

  var p1 = docMarkObj != null && docMarkAccess == "1";
  var p2 = docMark2Obj != null && docMark2Access == "1";
  var p3 = serialNoObj != null && serialNoAccess == "1";
  var type = document.getElementById("edocType");

  if (type != null && type.value == "1") {
    // 收文，直接录入文号，不提供断号选择功能
    if (_obj) {
      _obj.readOnly = false;
      _obj.disabled = false;

      _obj.focus();
    }

    if (!objid && serialNoObj != null && p3) {
      // 修改文号的时候不是点图标
      setSerialNoEdit(serialNoObj);
    }

    if (!isEdocLike) {
      showEdocMark();
      isUpdateEdocForm = true;
    }

    return;
  } // 判断页面是否有两个文号


  var twoDocmark = objid == null && document.getElementById("my:doc_mark") != null && document.getElementById("my:doc_mark2") != null;
  var orgAccountId = document.getElementById("orgAccountId");
  var _orgAccountId = "";

  if (orgAccountId) {
    _orgAccountId = orgAccountId.value;
  } //文号弹出规则参见，OA-69577


  if (serialNoObj == null && _obj != null) {
    if (objid == null) {
      showEdocMarkInForm(docMarkObj, serialNoObj, docMark2Obj, p1, p2, p3);
      var tempCanEditForm = true; //有修改文单权限才弹出，其他不弹出

      if (window.parent.canUpdateForm && window.parent.canUpdateForm == 'false') {
        tempCanEditForm = false;
      }

      if (!twoDocmark && tempCanEditForm) {
        //只有一个文号的时候弹出
        openMarkChooseWindow(twoDocmark, selDocmark, _orgAccountId, templeteIdValue);
      }
    } else {
      if (!isEdocLike) {
        showEdocMark();
        isUpdateEdocForm = true;
      }

      if (p1 || p2) {
        openMarkChooseWindow(twoDocmark, selDocmark, _orgAccountId, templeteIdValue);
      }
    }
  } else {
    // 有内部文号的时候不弹出选文号的界面。
    if (!objid) {
      showEdocMarkInForm(docMarkObj, serialNoObj, docMark2Obj, p1, p2, p3);
    } else {
      if (_obj.name == "my:serial_no" && serialNoAccess == "1") {
        setSerialNoEdit(_obj);
      } else {
        if (objid == null && !isEdocLike) {
          showEdocMark();
          isUpdateEdocForm = true;
        } else {
          if (p1 || p2) {
            openMarkChooseWindow(twoDocmark, selDocmark, _orgAccountId, templeteIdValue);
          }
        }
      }
    }
  }
}

function showEdocMarkInForm(docMarkObj, serialNoObj, docMark2Obj, p1, p2, p3) {
  var docMarkValue = "";

  if (docMarkObj) {
    docMarkValue = docMarkObj.value;
  }

  var serialNoValue = "";

  if (serialNoObj) {
    serialNoValue = serialNoObj.value;
  }

  var docMark2Value = "";

  if (docMark2Obj) {
    docMark2Value = docMark2Obj.value;
  }

  if (p1) {
    setWordNoEdit(docMarkObj);
  }

  if (p2) {
    setWordNoEdit(docMark2Obj);
  }

  if (p3) {
    setSerialNoEdit(serialNoObj);
  } // docmark的value需要重新设置一下


  var selectObj = document.getElementById("my:doc_mark");

  if (selectObj && selectObj.length) {
    for (var i = 0; i < selectObj.length; i++) {
      if (selectObj[i].text == docMarkValue) {
        selectObj[i].selected = true;
      }
    }
  } // 内部文号的select需要重新选中


  var selectSerialNo = document.getElementById("my:serial_no");

  if (selectSerialNo && selectSerialNo.length) {
    for (var i = 0; i < selectSerialNo.length; i++) {
      if (selectSerialNo[i].text == serialNoValue) {
        selectSerialNo[i].selected = true;
      }
    }
  } // 公文文号B select需要重新选中


  var selectDocMark2 = document.getElementById("my:doc_mark2");

  if (selectDocMark2 && selectDocMark2.length) {
    for (var i = 0; i < selectDocMark2.length; i++) {
      if (selectDocMark2[i].text == docMark2Value) {
        selectDocMark2[i].selected = true;
      }
    }
  }

  if (!isEdocLike) {
    showEdocMark();
    isUpdateEdocForm = true;
  }
}

function openMarkChooseWindow(twoDocmark, selDocmark, _orgAccountId, templeteIdValue) {
  var markSelectHeight = 440;
  var edocType = $("#edocType").val();

  if (edocType == "0" && (selDocmark == 'my:doc_mark' || selDocmark == 'my:doc_mark2')) {
    markSelectHeight = 540;
  }

  var edocId = -1;

  if ($("#newSummaryId") != null && $("#newSummaryId").size() > 0) {
    edocId = $("#newSummaryId").val() == "" ? -1 : $("#newSummaryId").val();
  } else if ($("#summaryId") != null && $("#summaryId").size() > 0) {
    edocId = $("#summaryId").val();
  } //事项ID


  var tempAffairId = $("#affairId").val();

  if (!tempAffairId) {
    tempAffairId = "";
  }

  window.openMarkChooseWindowWin = getA8Top().$.dialog({
    title: v3x.getMessage('edocLang.edoc_docmark_chooseallmark'),
    transParams: {
      'parentWin': window
    },
    url: edocMarkURL + "?method=docMarkChooseEntry" + "&twoDocmark=" + twoDocmark + "&selDocmark=" + selDocmark + "&orgAccountId=" + _orgAccountId + "&templeteId=" + templeteIdValue + "&edocId=" + edocId + "&edocType=" + edocType + "&affairId=" + tempAffairId,
    targetWindow: getA8Top(),
    width: "450",
    height: markSelectHeight
  });
}
/**
 * 文号选择回调
 */


function openMarkChooseWindowCallback(receivedObj) {
  if (receivedObj != undefined) {
    var id = receivedObj[2];

    var _objMark = document.getElementById(id);

    var _obj = document.getElementById(id + "_autocomplete");

    if (!parent.canUpdateForm || parent.canUpdateForm == "false") {
      var mark = document.getElementById(id);

      if (mark) {
        try {
          var marr = receivedObj[0].split("|");
          mark.value = marr[1];
          mark.title = marr[1]; //设置下拉列表文号内容

          if (_obj) {
            _obj.value = marr[1];
          }
        } catch (e) {}
      }
    }

    var markArray = new Array();
    var item = {
      "value": receivedObj[0],
      "dispaly": receivedObj[3]
    };

    if (id == "my:doc_mark" && docMarkOriginalArr != null) {
      var falsss = true;
      markArray = docMarkOriginalArr;

      for (var i = 0; i < markArray.length; i++) {
        if (markArray[i].dispaly == receivedObj[3]) {
          try {
            if (receivedObj[0].split("|")[3] == "3") {
              //手工输入
              markArray[i].value = receivedObj[0];
            }
          } catch (e) {}

          falsss = false;
          break;
        }
      }

      if (falsss) {
        docMarkOriginalArr.push(item);
        markArray = docMarkOriginalArr;
      }
    } else if (id == "my:doc_mark2" && docMark2OriginalArr != null) {
      docMark2OriginalArr.push(item);
      markArray = docMark2OriginalArr;
    } else if (id == "my:serial_no" && serialNoOriginalArr != null) {
      serialNoOriginalArr.push(item);
      markArray = serialNoOriginalArr;
    }

    if (markArray.length > 0) {
      //解决OA-79685问题，调用了组件的内部方法，现在样处理，有坑后面填
      var tempView = v3xautocomplete._getViewElement(_objMark.id);

      jQuery(tempView).autocomplete("destroy"); //调用销毁方法

      v3xautocomplete.autocomplete(_objMark.id, returnJson(markArray), {
        select: function select(item, inputName) {
          _objMark.value = item.value;
        },
        button: true,
        autoSize: true,
        appendBlank: false,
        value: receivedObj[0]
      });
    }

    isUpdateEdocForm = true;
    edocMarkUpd = true;
  }
} //弹出内部文号录入界面。


function SerialNoChange() {
  var _obj = document.getElementById("my:serial_no"); //判断页面上是否存在内部文号


  if (_obj == null) {
    alert(_("edocLang.edoc_form_noSerialNo"));
    return;
  }

  if (_obj != null) {
    window.serialNoWin = getA8Top().$.dialog({
      title: v3x.getMessage('edocLang.serial_no_input'),
      transParams: {
        'parentWin': window
      },
      url: edocMarkURL + "?method=serialNoInputEntry",
      targetWindow: getA8Top(),
      width: "350",
      height: "200"
    });
  }

  return;
}
/**
 * 内部文号回调
 */


function changeSerialNoCallback(receivedObj) {
  if (receivedObj != undefined) {
    var _objHidden = document.getElementById(receivedObj[2]);

    _obj = document.getElementById(receivedObj[2] + "_autocomplete");
    _objHidden.value = receivedObj[0];
    _obj.value = receivedObj[1];
    isUpdateEdocForm = true;
    edocMarkUpd = true;
  }
}

function initSpans() {
  var i, key;
  var spanObjs = document.getElementsByTagName("span");
  opinionSpans = new Properties();

  for (i = 0; i < spanObjs.length; i++) {
    key = spanObjs[i].getAttribute("xd:binding");

    if (key != null) {
      //记录处理意见录入框的初始化大小，确定手写签批对话框大小;
      spanObjs[i].initWidth = spanObjs[i].style.width;
      spanObjs[i].initHeight = spanObjs[i].style.height;
      opinionSpans.put(key, spanObjs[i]);
    }
  }
}

function extendData(name, value) {
  this.name = name;
  this.value = value;
}

var extendArray = new Array();
/*
 * 处理处理意见和处理人字体大小一致
 */

function changeFontsize(opinion, spanObj) {
  try {
    if (spanObj != null && spanObj != undefined) {
      var cssStr = ""; //修改字体大小

      if (spanObj.style.fontSize != null && spanObj.style.fontSize != "") {
        cssStr += "font-Size:" + spanObj.style.fontSize + ";";
      } //修改字体样式


      if (spanObj.style.fontFamily != null && spanObj.style.fontFamily != "") {
        cssStr += "font-family:" + spanObj.style.fontFamily + ";";
      } //打印预览的时候字体样式变了, 默认的字体定义在seeyonform3.js


      var newStyleStr = EDOC_ELEMENT_DEFAULT_FONT_SIZE + EDOC_ELEMENT_DEFAULT_FONT_FAMILY + _getParentFontInfo(spanObj) + cssStr;
      opinion = _addStyle(opinion, "div", newStyleStr);
      opinion = _addStyle(opinion, "span", newStyleStr);
    }

    return opinion;
  } catch (e) {}
}

function _addStyle(op, tagNode, styleVal) {
  var upTagNode = "<" + tagNode.toUpperCase();
  var lowTagNode = "<" + tagNode.toLowerCase();
  var newStr = op;
  var tempArry = [];
  tempArry[0] = upTagNode;
  tempArry[1] = lowTagNode;

  for (var i = 0; i < tempArry.length; i++) {
    var tempTagNode = tempArry[i];
    var index = op.indexOf(tempTagNode, 0); //从0点开始搜索

    while (index != -1) {
      var tempEnd = op.indexOf(">", index);
      var attrStr = op.substring(index + tempTagNode.length, tempEnd);

      if (attrStr.indexOf("attachmentDiv") == -1) {
        //排除附件DIV
        var newSttStr = attrStr;

        if (newSttStr.match(/style/i)) {
          newSttStr = newSttStr.replace(/style[ ]*?=(["']{1})(.*?)["']{1}/, "style='$2;" + styleVal + ";'");
        } else {
          newSttStr += " style='" + styleVal + "'";
        }

        newStr = newStr.replace(tempTagNode + attrStr + ">", tempTagNode + newSttStr + ">");
      }

      index = op.indexOf(tempTagNode, tempEnd); //从继续搜索
    }
  }

  return newStr;
}
/*显示公文处理意见*/


function dispOpinions(opinions, senderOpinion) {
  try {
    var i;
    var otherOpinion = "";
    var spanObj;
    var isboundSender = false;

    if (opinionSpans == null) {
      initSpans();
    } //附件文字比较长时，字体重叠我呢体OA-66099


    var replaceHeight = /<div([^<]*?)attachmentDiv([^<]*?)style[ ]*?=(['"]{1})(.*?)['"]{1}([^<]*?)>/ig;
    var linkCss = /<a([^<]*?style[ ]*?=[ ]*?['"].*?)(['"].*?)>/ig; //关联文档a标签设置了不换行

    /** 显示意见 **/

    for (i = 0; i < opinions.length; i++) {
      if (opinions[i][0] == "niwen" || opinions[i][0] == 'dengji') {
        isboundSender = true;
      }

      spanObj = opinionSpans.get("my:" + opinions[i][0], null);
      opinions[i][1] = changeFontsize(opinions[i][1], spanObj);

      if (spanObj == null || spanObj == undefined) {
        if (otherOpinion != "") {
          otherOpinion += "<br>";
        }

        var tempInnerHTML = opinions[i][1].replace(replaceHeight, "<div$1attachmentDiv$2style=$3$4height:auto;line-height:normal;float: none;$3$5>");
        tempInnerHTML = tempInnerHTML.replace(/noWrap/ig, "");
        tempInnerHTML = tempInnerHTML.replace(linkCss, "<a$1;white-space:normal;line-height:normal;$2>");
        otherOpinion += tempInnerHTML;
      } else {
        var tempInnerHTML = opinions[i][1].replace(replaceHeight, "<div$1attachmentDiv$2style=$3$4height:auto;line-height:normal;float: none;$3$5>");
        tempInnerHTML = tempInnerHTML.replace(/noWrap/ig, "");
        tempInnerHTML = tempInnerHTML.replace(linkCss, "<a$1;white-space:normal;line-height:normal;$2>");
        spanObj.innerHTML = tempInnerHTML; //  spanObj.title=spanObj.innerText;

        spanObj.style.minHeight = spanObj.style.height;
        spanObj.style.height = "auto" || "100%";
        spanObj.style.border = "0px";
        spanObj.contentEditable = "false";
        spanObj.style.whiteSpace = "normal"; //spanObj.style.overflowY ="auto";

        extendArray.push(new extendData("my:" + opinions[i][0], spanObj.innerText));
        parent.extendArray = extendArray;
      }
    }
    /** 其它意见框 **/


    spanObj = opinionSpans.get("my:otherOpinion", null);

    if (otherOpinion != "" && spanObj == null) {
      //OA-33421  test01在公文督办中查看公文，发起人附言和处理意见没做区分，应在意见前面显示处理意见
      document.getElementById("dealOpinionTitleDiv").style.display = '';
      spanObj = document.getElementById("displayOtherOpinions");

      if (spanObj != null) {
        spanObj.innerHTML = otherOpinion;
        spanObj.style.visibility = "visible"; // spanObj.style.height="100%";

        spanObj.style.whiteSpace = "normal";
        spanObj.contentEditable = "false";
        spanObj.style.border = "0px";
      }
    }
    /** 发起人意见 **/


    spanObj = opinionSpans.get("my:niwen", null);

    if (spanObj == null) {
      spanObj = opinionSpans.get("my:dengji", null);
    } //当有登记意见和拟文意见，则为登记意见（实际的情况是不出现登记和拟文意见同时出现的情况）


    if (opinionSpans.get("my:niwen", null) != null && opinionSpans.get("my:dengji", null) != null) {
      spanObj = opinionSpans.get("my:dengji", null);
    }

    if (spanObj != null && senderOpinion != null && senderOpinion != "") {
      //spanObj.innerHTML=senderOpinion;
      //spanObj.style.height="100%";
      //spanObj.style.whiteSpace = "normal";
      //公文单上面有意见显示位置时，隐藏公文单下面的意见
      spanObj = document.getElementById("displaySenderOpinoinDiv");

      if (spanObj != null && isboundSender) {
        spanObj.innerHTML = "";
      }
    }

    if (senderOpinion == "") {
      //没有发起意见,或者发起意见意见绑定到其它显示位置;
      spanObj = document.getElementById("displaySenderOpinoinDiv");

      if (spanObj != null) {
        spanObj.innerHTML = "";
      }
    }
  } catch (e) {}
}

function hiddeBorder(opn) {
  var ops = opn.split(",");
  var spanObj;

  if (opinionSpans == null) {
    initSpans();
  }

  for (i = 0; i < ops.length; i++) {
    spanObj = opinionSpans.get("my:" + ops[i]);

    if (spanObj != null) {
      spanObj.style.border = "0px";
    }
  } //20090917guoss修改，其它意见不在ops中，将其它意见的文本框也同时去掉


  if (opinionSpans.get("my:otherOpinion") != null) {
    opinionSpans.get("my:otherOpinion").style.border = "0px";
  }
}
/*新建公文，公文提交的时候需要把disable的数据变成可编辑的，否则不能提交到后台
 * 如果已经是修改状态，不做任何修改，如果为disable状态，需要根据数值转换成selet
 *
 */


function adjustReadFormForSubmit() {
  try {
    //公文单下拉不能disable
    var selEdoctable = document.getElementById("edoctable");

    if (selEdoctable != null) {
      selEdoctable.disabled = false;
    }
  } catch (e) {}

  var s = document.getElementById("xml").value;
  var x = document.getElementById("xslt").value;
  var str = s;
  var xslStart = str.indexOf("&&&&&&&  xsl_start  &&&&&&&&");
  var dataStart = str.indexOf("&&&&&&&&  data_start  &&&&&&&&");
  var inputStart = str.indexOf("&&&&&&&&  input_start  &&&&&&&&");
  if (xslStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "xsl"); //没有找到xsl

  if (dataStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "data"); //没有找到data

  if (inputStart == -1) throw V5_Edoc().$.i18n("edoc.alert.no.find", "input"); //没有找到input

  var xsl = str.slice(xslStart + 28, dataStart);
  var data = str.slice(dataStart + 30, inputStart);
  var finput = str.slice(inputStart + 31);
  ajustReadInput(finput);
  return finput;
}

function ajustReadInput(aInput) {
  var fFiledList = paseFormatXML(getXmlContent(aInput));
  adjustConvertReadHtml(fFiledList);
  var repeatTable = new Seeyonform_rtable();
  repeatTable.change();
  var reSection = new Seeyonform_rsection();
  reSection.change();
}

function changeSelectValue(dis, SeeyonformSelect) {
  var i;
  var ls = SeeyonformSelect.valueList;

  for (i = 0; i < ls.length; i++) {
    if (ls[i].label == dis) {
      return ls[i].value;
    }
  }

  return dis;
}

function adjustConvertReadHtml(aFieldList) {
  var field;
  var fAreas;
  var ocxNameList = "";

  for (var i = 0; i < aFieldList.length; i++) {
    field = aFieldList[i];
    var inputObj = document.getElementById(field.fieldName);

    if (inputObj == null) {
      continue;
    }

    var isSel = field instanceof Seeyonform_select;

    if (inputObj.disabled == false && inputObj.readOnly == false) {
      continue;
    }

    if (ocxNameList.indexOf("[" + field.fieldName + "]") == -1) {
      ocxNameList += "[" + field.fieldName + "]";
    } else {
      if (isSel == false) {
        continue;
      }
    } //list自定义元素， 显示值和实际值都是数字的时候就会悲剧， 过滤这种情况


    if (isSel && field.fieldName.indexOf("my:list") != 0) {
      inputObj.value = changeSelectValue(inputObj.value, field);
    }

    inputObj.disabled = false;
    inputObj.canSubmit = "true";
  }
}
/***************公文单控制部分结束*******************/
//----------------------------  公文套红部分中
//套红的时候，如果是联合发文，会用两个单位的套红模板将正文分别套红，形成两套正文。
//套红的时候，如果是联合发文，检查公文的第一套正文或者第二套正文是否已经被创建，没有创建就创建，已经创建就返回当前正文ID
//创建的方式：createContentBody会在后台向edocbody表中添加记录，并且返回新的正文ID（newOfficeID）,
//          并且将newOfficeID赋值给控件的fileID.,这样保存的时候就会创建新的正文，并且向file表中添加新的记录。


function checkExistBody() {
  if (theform == null || theform == 'undefined') {
    theform = document.getElementById('sendForm');
  }

  var isUniteSend = document.getElementById("isUniteSend").value;
  var summaryId = theform.summary_id.value;
  var contentNum = theform.currContentNum.value;
  var bodyType = document.getElementById("bodyType").value;

  if (contentUpdate == false || isUniteSend != "true") {
    return;
  }

  if (contentOfficeId.get(contentNum, null) == null) {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "createContentBody", false);
    requestCaller.addParameter(1, "String", summaryId);
    requestCaller.addParameter(2, "int", contentNum);
    requestCaller.addParameter(3, "String", contentOfficeId.get("0", null));
    requestCaller.addParameter(4, "String", bodyType);
    var ds = requestCaller.serviceRequest();
    fileId = ds;
    contentOfficeId.put(contentNum, ds);
  } else {
    fileId = contentOfficeId.get(contentNum, null);
  }

  return fileId; //setOfficeOcxRecordID(fileId);
}
/**
 * 公文套红处理
 * @type {setAllLable}
 */


var edocTaohongHandler = (_edocTaohongHandler = {
  allBM: {},
  bookMarkList: [],
  setAllLable: function setAllLable(dataForm, templateType, dataList) {
    var _this2 = this;

    var params = {
      taohongDataArray: [],
      senderOpinionDataArray: [],
      opinionDataArray: []
    }; //templateType =="edoc" 正文套红

    params.taohongDataArray = this.buildBm(dataForm, templateType, dataList, templateType != "edoc");
    this.getOpinionDataArrayForEdoc(params);
    params.taohongDataArray = [].concat(_toConsumableArray(params.taohongDataArray), _toConsumableArray(params.senderOpinionDataArray), _toConsumableArray(params.opinionDataArray));
    params.taohongDataArray.forEach(function (element) {
      var label = element.name;
      var dataValue = element.value;

      if (undefined != dataValue && null != dataValue && '' != dataValue) {
        //文单套红，套出来的附件名称之间空格太多
        if (templateType == "script" && label == 'attachments') {
          var atts = dataValue.split("\r\n");
          var txt = "";

          for (var n = 0; n < atts.length; n++) {
            if (atts[n] == '') {
              continue;
            }

            if (txt.length > 0) {
              txt = txt + "\r\n";
            }

            txt = txt + atts[n];
          }

          dataValue = txt;
        }

        try {
          _this2.setLable(label, dataValue);

          _this2.setAllLabel4chinese(label, dataValue);
        } catch (e) {
          window.console && console.warn && console.warn(e);
        }
      }
    });
  },

  /**
   * 构造套红字段
   */
  buildBm: function buildBm(dataForm, templateType, dataList, isOrNotEdoc) {
    var taohongDataMap = {}; // 先从数据域中获取数据

    if (dataList && dataList.length > 0) {
      for (var _i = 0; _i < dataList.length; _i++) {
        var name = dataList[_i].name;
        var value = dataList[_i].value;
        var index = name.indexOf("my:");

        if (index > -1) {
          var bookmarkName = name.substring(3, name.length);
          taohongDataMap[bookmarkName] = {
            name: bookmarkName,
            value: this.getTaohongValueForEdoc(bookmarkName, value)
          };
        }
      }
    } // 再从表单dom中获取数据


    if (dataForm && dataForm.elements && dataForm.elements.length > 0) {
      var length = dataForm.elements.length;

      for (var i = 0; i < length; i++) {
        var name = dataForm.elements[i].name;

        if (!name) {
          continue;
        }

        if (templateType == "script" && name == "Content") {
          // 文单套红时，不套入正文内容，其他都要套入
          continue;
        }

        var index = name.indexOf("my:");

        if (index > -1) {
          var bookmarkName = name.substring(3, name.length);

          if (bookmarkName == "doc_mark" || bookmarkName == "doc_mark2" || bookmarkName == "serial_no") {
            try {
              var docMark = dataForm.elements[name].value;

              if (docMark.indexOf("|") > -1) {
                var docMarkArray = docMark.split("|");

                if (docMarkArray.length > 1) {
                  taohongDataMap[bookmarkName] = {
                    name: bookmarkName,
                    value: this.getTaohongValueForEdoc(bookmarkName, docMarkArray[1])
                  };
                }
              } else {
                taohongDataMap[bookmarkName] = {
                  name: bookmarkName,
                  value: this.getTaohongValueForEdoc(bookmarkName, docMark)
                };
              }

              continue;
            } catch (e) {}
          }

          var tagName = dataForm.elements[name].tagName;

          if (tagName != "undefined" && tagName.toLowerCase() == "select") {
            if (templateType == "edoc" && bookmarkName == "doc_mark") {
              var docMark = dataForm.elements[name].value;
              var docMarkArray = docMark.split("|");

              if (docMarkArray.length > 1) {
                taohongDataMap[bookmarkName] = {
                  name: bookmarkName,
                  value: this.getTaohongValueForEdoc(bookmarkName, docMarkArray[1])
                };
              }
            } else {
              var select = dataForm.elements[i];

              for (var j = 0; j < select.options.length; j++) {
                if (select.options[j].selected == true) {
                  taohongDataMap[bookmarkName] = {
                    name: bookmarkName,
                    value: this.getTaohongValueForEdoc(bookmarkName, select.options[j].text)
                  };
                }
              }
            }
          } else {
            var rvalue = dataForm.elements[name].getAttribute("rvalue");

            if (typeof rvalue != "undefined" && rvalue != null && rvalue != "") {
              taohongDataMap[bookmarkName] = {
                name: bookmarkName,
                value: this.getTaohongValueForEdoc(bookmarkName, rvalue)
              };
            } else {
              taohongDataMap[bookmarkName] = {
                name: bookmarkName,
                value: this.getTaohongValueForEdoc(bookmarkName, dataForm.elements[name].value)
              };
            }
          }
        }
      } // 返回老公文 文单套红和正文套红时的 要套红的数据  书签数据数组 [{name:xxx, value:xxxx}]


      var taohongDataArray = [];

      for (var bookmarkName in taohongDataMap) {
        taohongDataArray.push(taohongDataMap[bookmarkName]);
      }

      return taohongDataArray;
    }
  },
  getTaohongValueForEdoc: function getTaohongValueForEdoc(bookmarkName, value) {
    if (!value) {
      return "";
    } // 名称中包括了data就为date数据类型


    if (bookmarkName.search("date") != -1) {
      // 签发日期根据公文开关转化为大小写。
      if (bookmarkName == "signing_date") {
        var isSwitch = false;
        var sendForm;

        if (typeof contentIframe === 'undefined') {
          sendForm = document.getElementsByName("sendForm")[0];
        } else {
          sendForm = contentIframe.document.getElementById("sendForm");
        }

        if (sendForm) {
          if (sendForm.taohongriqiSwitch && sendForm.taohongriqiSwitch.value == "true") {
            isSwitch = true;
          }
        } else {
          var taohongSwitchObj = document.getElementById("taohongriqiSwitch");

          if (taohongSwitchObj) {
            if (taohongSwitchObj.value && taohongSwitchObj.value == "true") {
              isSwitch = true;
            }
          }
        }

        if (isSwitch) {
          value = this.date2chinese0(value);
        } else {
          value = this.date2chinese1(value);
        }
      } else {
        value = this.date2chinese1(value);
      }
    } // 套红时发文单位显示格式


    if (bookmarkName.search("send_unit") != -1) {
      var sendForm;

      if (typeof contentIframe === 'undefined') {
        sendForm = document.getElementsByName("sendForm")[0];
      } else {
        sendForm = contentIframe.document.getElementById("sendForm");
      }

      if (sendForm) {
        if (sendForm.taohongSendUnitType && sendForm.taohongSendUnitType.value == 1) {
          var sendUnitName = getSendUnitName(bookmarkName);

          if (sendUnitName != null && sendUnitName != "") {
            value = sendUnitName;
          }
        }
      }
    }

    return value;
  },
  getOpinionDataArrayForEdoc: function getOpinionDataArrayForEdoc(params, taoHongType) {
    var opinionArr = null;

    if (typeof getOpinionsForTaoHong != "undefined") {
      opinionArr = getOpinionsForTaoHong(taoHongType);
    } // 从父页面获取数据


    var opinions = opinionArr && opinionArr.length > 0 ? opinionArr[0] : null;
    var opinionDataArray = [];

    if (opinions && opinions.length > 0) {
      // 意见套红套入签章与签批图片   开始
      for (var i = 0; i < opinions.length; i++) {
        var bookmarkName = opinions[i][0];
        var value = opinions[i][1]; // 意见数据格式 [{name:"xxx", value:"xxxx"}]

        opinionDataArray.push({
          name: bookmarkName,
          // 书签名称
          value: this.getTaohongValueForEdoc(value ? value.replace(/(\n)+|(\r\n)+/g, "\r\n") : "") // 意见内容

        });
      }
    } // 发起者意见数据格式 [{name:"xxx", value:"xxxx"}]


    params.opinionDataArray = opinionDataArray;
    var senderOpinion = opinionArr && opinionArr.length > 1 ? opinionArr[1] : null;

    if (senderOpinion != null) {
      params.senderOpinionDataArray.push({
        name: "niwen",
        value: this.getTaohongValueForEdoc("niwen", senderOpinion)
      });
      params.senderOpinionDataArray.push({
        name: "dengji",
        value: this.getTaohongValueForEdoc("dengji", senderOpinion)
      });
    }
  },

  /**
   * 日期中的 零转换为 中文 〇
   * @param s 日期
   * @returns {*}
   */
  date2chinese0: function date2chinese0(s) {
    if (!s) {
      return "";
    }

    var ns = date2chinese(s);

    if (ns) {
      ns = ns.replace(/零/g, "〇");
    }

    return ns;
  },

  /**
   * 日期转换为 中文的 年月日
   * @param s 日期
   * @returns {string|*}
   */
  date2chinese1: function date2chinese1(s) {
    if (!s) {
      return "";
    }

    var str;
    var ns = s.split("-");

    if (ns.length != 3) {
      ns = s.split("/");
    }

    if (ns.length != 3) {
      return s;
    }

    if (ns[1].charAt(0) == "0") {
      ns[1] = ns[1].substr(1);
    }

    if (ns[2].charAt(0) == "0") {
      ns[2] = ns[2].substr(1);
    }

    str = ns[0] + "年" + ns[1] + "月" + ns[2] + "日";
    return str;
  },

  /**
   * 中文字符 设置值到对应的 公文域或书签中
   * @param label  英文字符
   * @param dataValue  对应的value
   */
  setAllLabel4chinese: function setAllLabel4chinese(label, dataValue) {
    var bookMarks = this.getBookmarkByName(label);

    for (var _i2 = 0; _i2 < bookMarks.length; _i2++) {
      var bookMark = bookMarks[_i2];
      var _dataValue = dataValue; // 常规中文字符字段

      if (bookMark.type == 1) {
        // 份号 补齐6位显示
        if (bookMark.bookmark == "copies") {
          var len = _dataValue.length || 0;
          var zeroStr = "";

          if (len > 0) {
            var zerolen = 6 - len;

            for (var z = 0; z < zerolen; z++) {
              zeroStr += "0";
            }
          }

          _dataValue = zeroStr + _dataValue;
        } else if (bookMark.bookmark == "signing_date") {
          _dataValue = this.transToChinese4Date(_dataValue);
        } else if (bookMark.zhBookmark == "纪要标志") {
          _dataValue = _dataValue + "会议纪要";
        } else if (['纪要编号', '令号'].indexOf(bookMark.zhBookmark) > -1) {
          _dataValue = _dataValue.replace('〔〕', '');
        }

        this.allBM[bookMark.zhBookmark] = _dataValue;
      } // 有多个序号类型的字段


      if (bookMark.type == 2) {
        if (bookMark.isFirstMerge) {
          this.allBM[bookMark.zhBookmark] = _dataValue;
        }

        var valueList = _dataValue.split(/,|、/g);

        for (var _i3 = 0; _i3 < valueList.length; _i3++) {
          var value = valueList[_i3];
          this.allBM[bookMark.zhBookmark + "_" + (_i3 + 1)] = value;
        }
      } // 公文文号拆分三段


      if (bookMark.type == 7) {
        if (_dataValue.indexOf("〔") > -1 && bookMark.zhBookmark == "发文机关代字") {
          // 发文机关代字
          var str1 = _dataValue.substring(0, _dataValue.indexOf("〔"));

          if (str1 != '') {
            this.allBM[bookMark.zhBookmark] = str1;
          }
        } else if (_dataValue.indexOf("〔") > -1 && _dataValue.indexOf("〕") > -1 && bookMark.zhBookmark == "年份") {
          // 年份
          var str2 = _dataValue.substring(_dataValue.indexOf("〔") + 1, _dataValue.indexOf("〕"));

          if (str2 != '') {
            this.allBM[bookMark.zhBookmark] = str2;
          }
        } else if (_dataValue.indexOf("〕") > -1 && bookMark.zhBookmark == "发文顺序号") {
          // 发文顺序号
          var str3 = _dataValue.substring(_dataValue.indexOf("〕") + 1) || '';
          str3 = str3.replace(/\D/ig, '');

          if (str3 != '') {
            this.allBM[bookMark.zhBookmark] = str3;
          }
        }
      }
    }
  },

  /**
   * 日期中文转换
   * @param mycontent
   * @returns {*}
   */
  transToChinese4Date: function transToChinese4Date(mycontent) {
    if (typeof officeSDK.options != "undefined" && typeof officeSDK.options.extendParams != "undefined" && officeSDK.options.extendParams.isSwitch) {
      if (mycontent.indexOf("年") != -1) {
        mycontent = mycontent.replace("年", "-");
        mycontent = mycontent.replace("月", "-");
        mycontent = mycontent.replace("日", "");
      }

      mycontent = this.date2chinese0(mycontent);
    } else {
      if (mycontent.indexOf("年") == -1) {
        mycontent = this.date2chinese1(mycontent);
      }
    }

    return mycontent;
  }
}, _defineProperty(_edocTaohongHandler, "date2chinese0", function date2chinese0(s) {
  var ns = date2chinese(s) || '';
  ns = ns.replace(/零/g, "〇");
  return ns;
}), _defineProperty(_edocTaohongHandler, "date2chinese1", function date2chinese1(s) {
  var str;
  var ns = s.split("-");

  if (ns.length != 3) {
    ns = s.split("/");
  }

  if (ns.length != 3) {
    return s;
  }

  if (ns[1].charAt(0) == "0") {
    ns[1] = ns[1].substr(1);
  }

  if (ns[2].charAt(0) == "0") {
    ns[2] = ns[2].substr(1);
  }

  str = ns[0] + "年" + ns[1] + "月" + ns[2] + "日";
  return str;
}), _defineProperty(_edocTaohongHandler, "getBookmarkByName", function getBookmarkByName(mark) {
  var ressult = [];

  if (!mark) {
    return ressult;
  }

  var bookmarkMappings = this.initBookmarkMappings();

  for (var _i4 = 0; _i4 < bookmarkMappings.length; _i4++) {
    if (mark == bookmarkMappings[_i4].bookmark || mark == bookmarkMappings[_i4].zhBookmark) {
      ressult.push(bookmarkMappings[_i4]);
    }
  }

  return ressult;
}), _defineProperty(_edocTaohongHandler, "setLable", function setLable(mylable, mycontent) {
  var _this = this;

  if (!mylable) {
    return;
  }

  if (mylable === 'doc_mark') {
    mycontent = mycontent.replace('〔〕', '');
  }

  if (mylable.search("date") != -1) {
    //名称中包括了data就为date数据类型
    if (mycontent) {
      mycontent = this.lrtrim(mycontent);
    }

    if (mylable == "signing_date") {
      //签发日期根据公文开关转化为大小写。
      //时间值为空的，不进行转换
      if (mycontent && mycontent != "") {
        mycontent = this.transToChinese4Date(mycontent);
      }
    } else {
      //580专版新加公文元素，因为是日期时间型。这里单独处理
      if (mylable == "send_date") {
        if (mycontent && mycontent != "") {
          var ns = mycontent.split("-");

          if (ns.length == 3) {
            mycontent = mycontent.replace("-", "年");
            mycontent = mycontent.replace("-", "月");
            mycontent = mycontent.replace(" ", "日");
          }
        }
      } else {
        mycontent = this.date2chinese1(mycontent);
      }
    }
  } else if (_typeof(mycontent) == "object") {
    $.each(mycontent, function (i, item) {
      var value = item[1];

      if (typeof value == "string") {
        value = _this.lrtrim(value);
      }

      mycontent[i] = [item[0], value];
    });
  } //公文合规：多部门多单位顿号变逗号，并且结尾加句号


  if (this.isMulti(mylable)) {
    mycontent = this.convertMultiFormat(mycontent, ofdMetadata);
  }

  try {
    if (mylable === 'attachments' && typeof redFileElement[mylable] !== "undefined" && redFileElement[mylable] !== "") {
      this.allBM[mylable] = this.allBM[mylable] + "\n" + mycontent;
    } else {
      this.allBM[mylable] = mycontent;
    }
  } catch (e) {
    if (!isAlertProtectFile) {
      isAlertProtectFile = true;
    }
  }
}), _defineProperty(_edocTaohongHandler, "lrtrim", function lrtrim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
}), _defineProperty(_edocTaohongHandler, "setAttachment4chinese", function setAttachment4chinese() {
  // 有多个序号的特殊字段，如请假、附件、FJ_标题、FJ_正文  （仅套附件正文类型为doc/docx/wps附件）
  var getAllFJ = window.getAllFJ || function () {
    return [];
  };

  var fileList = getAllFJ(true) || [];
  if (!fileList.length) return;
  var attr = fileList.filter(function (a) {
    return ['.doc', '.wps', '.docx'].indexOf(a.filename.substr(a.filename.lastIndexOf("."))) != -1;
  }); // 文单内的附件

  for (var _i5 = 0, len = attr.length; _i5 < len; _i5++) {
    var att = attr[_i5];
    var fileType = att.filename.substr(att.filename.lastIndexOf(".")); // fix-V5-16867 兼容老系统
    // 需求变更：公文域套红,公文域书签开始顺序 FJ_标题 FJ_标题_1 FJ_标题_2 ....

    if (_i5 === 0) {
      this.allBM["附件"] = "附件";
      this.allBM["FJ_标题"] = att.filename;
      this.allBM["FJ_正文"] = {
        type: "DOCUMENT",
        fileInfo: {
          fileId: att.fileUrl,
          fileName: att.filename,
          fileType: fileType
        }
      };
    } else {
      this.allBM["附件_" + _i5] = "附件" + _i5;
      this.allBM["FJ_标题_" + _i5] = att.filename;
      this.allBM["FJ_正文_" + _i5] = {
        type: "DOCUMENT",
        fileInfo: {
          fileId: att.fileUrl,
          fileName: att.filename,
          fileType: fileType
        }
      };
    }
  }
}), _defineProperty(_edocTaohongHandler, "convertMultiFormat", function convertMultiFormat(str, ofdMetadata) {
  if (!str) {
    return str;
  }

  if (ofdMetadata == "enable") {
    str = str.replace(/,|、/g, "，"); //str+="。";
  } else {
    str = str.replace(/,|、/g, "、");
  }

  return str;
}), _defineProperty(_edocTaohongHandler, "isMulti", function isMulti(label) {
  if (!label) {
    return false;
  }

  for (var i = 0; i < this.multiLable.length; i++) {
    if (label == this.multiLable[i]) {
      return true;
    }
  }
}), _defineProperty(_edocTaohongHandler, "multiLable", ["send_to", //主送单位
"copy_to", //抄送单位
"report_to" //抄报单位
]), _defineProperty(_edocTaohongHandler, "parseDocMarkFromDOM", function parseDocMarkFromDOM(dom) {
  var yearenabled = dom.getAttribute('yearenabled') === 'true' ? true : false;
  var suffix = dom.getAttribute("suffix") || '';
  var wordNo = dom.getAttribute("wordNo") || dom.getAttribute("title") || ''; //机构代字

  var yearNo = yearenabled ? dom.getAttribute("yearNo") : ''; //年号

  var markNumbe = (getFullMarkNumber(dom.getAttribute("markNumber"), dom.getAttribute("markLength")) || '') + suffix; //流水号

  var dataValue = wordNo + '〔' + yearNo + '〕' + markNumbe;
  return dataValue;
}), _defineProperty(_edocTaohongHandler, "initBookmarkMappings", function initBookmarkMappings() {
  return [{
    "bookmark": 'subject',
    "zhBookmark": "标题",
    "type": 1
  }, {
    "bookmark": 'copies',
    "zhBookmark": "份号",
    "type": 1
  }, {
    "bookmark": 'secret_level',
    "zhBookmark": "密级",
    "type": 1
  }, {
    "bookmark": 'keep_period',
    "zhBookmark": "保密期限",
    "type": 1
  }, {
    "bookmark": 'urgent_level',
    "zhBookmark": "紧急程度",
    "type": 1
  }, {
    "bookmark": 'signing_date',
    "zhBookmark": "成文日期",
    "type": 1
  }, {
    "bookmark": 'print_date',
    "zhBookmark": "印发日期",
    "type": 1
  }, {
    "bookmark": 'Printing_Date',
    "zhBookmark": "印发日期",
    "type": 1
  }, {
    "bookmark": 'print_unit',
    "zhBookmark": "印发机关",
    "type": 1
  }, {
    "bookmark": 'send_unit',
    "zhBookmark": "纪要标志",
    "type": 1
  }, {
    "bookmark": 'doc_mark',
    "zhBookmark": "纪要编号",
    "type": 1
  }, {
    "bookmark": 'filefz',
    "zhBookmark": "附注",
    "type": 1
  }, {
    "bookmark": 'filesm',
    "zhBookmark": "附件说明",
    "type": 1
  }, {
    "bookmark": 'send_unit',
    "zhBookmark": "单位",
    "type": 1
  }, // { "bookmark": 'signing_date', "zhBookmark": "日期", "type": 1 },
  {
    "bookmark": 'doc_mark',
    "zhBookmark": "令号",
    "type": 1
  }, {
    "bookmark": 'send_to',
    "zhBookmark": "主送机关",
    "type": 1
  }, {
    "bookmark": 'send_to',
    "zhBookmark": "BJ_主送机关",
    "type": 2
  }, {
    "bookmark": 'copy_to',
    "zhBookmark": "抄送机关",
    "type": 2
  }, {
    "bookmark": 'send_unit',
    "zhBookmark": "发文机关名称",
    "type": 2,
    isFirstMerge: true
  }, {
    "bookmark": 'send_unit',
    "zhBookmark": "发文机关署名",
    "type": 2,
    isFirstMerge: true
  }, {
    "bookmark": 'issuer',
    "zhBookmark": "签发人",
    "type": 2
  }, {
    "bookmark": 'attendee',
    "zhBookmark": "出席",
    "type": 2
  }, {
    "bookmark": 'to_attend',
    "zhBookmark": "列席",
    "type": 2
  }, {
    "bookmark": 'issuer_level',
    "zhBookmark": "签发人职务",
    "type": 3
  }, {
    "bookmark": 'sign',
    "zhBookmark": "签名章",
    "type": 3
  }, {
    "bookmark": 'suffix_flag',
    "zhBookmark": "后缀标志",
    "type": 3
  }, {
    "bookmark": 'Content',
    "zhBookmark": "正文",
    "type": 4
  }, {
    "bookmark": 'leaver',
    "zhBookmark": "请假",
    "type": 5
  }, {
    "bookmark": 'attachments',
    "zhBookmark": "附件",
    "type": 5
  }, {
    "bookmark": 'FJ_Subject',
    "zhBookmark": "FJ_标题",
    "type": 5
  }, {
    "bookmark": 'FJ_Content',
    "zhBookmark": "FJ_正文",
    "type": 5
  }, {
    "bookmark": 'niwen',
    "zhBookmark": "拟文",
    "type": 6
  }, {
    "bookmark": 'shenpi',
    "zhBookmark": "审批",
    "type": 6
  }, {
    "bookmark": 'shenhe',
    "zhBookmark": "审核",
    "type": 6
  }, {
    "bookmark": 'fuhe',
    "zhBookmark": "复核",
    "type": 6
  }, {
    "bookmark": 'fensong',
    "zhBookmark": "分送",
    "type": 6
  }, {
    "bookmark": 'huiqian',
    "zhBookmark": "会签",
    "type": 6
  }, {
    "bookmark": 'qianfa',
    "zhBookmark": "签发",
    "type": 6
  }, {
    "bookmark": 'zhihui',
    "zhBookmark": "知会",
    "type": 6
  }, {
    "bookmark": 'yuedu',
    "zhBookmark": "阅读",
    "type": 6
  }, {
    "bookmark": 'banli',
    "zhBookmark": "办理",
    "type": 6
  }, {
    "bookmark": 'dengji',
    "zhBookmark": "登记",
    "type": 6
  }, {
    "bookmark": 'niban',
    "zhBookmark": "拟办",
    "type": 6
  }, {
    "bookmark": 'pishi',
    "zhBookmark": "批示",
    "type": 6
  }, {
    "bookmark": 'chengban',
    "zhBookmark": "承办",
    "type": 6
  }, {
    "bookmark": 'otherOpinion',
    "zhBookmark": "处理意见",
    "type": 6
  }, {
    "bookmark": 'wenshuguanli',
    "zhBookmark": "文书管理",
    "type": 6
  }, {
    "bookmark": 'report',
    "zhBookmark": "上级单位意见汇报",
    "type": 6
  }, {
    "bookmark": 'feedback',
    "zhBookmark": "下级单位意见反馈",
    "type": 6
  }, {
    "bookmark": 'doc_mark',
    "zhBookmark": "发文机关代字",
    "type": 7
  }, {
    "bookmark": 'doc_mark',
    "zhBookmark": "年份",
    "type": 7
  }, {
    "bookmark": 'doc_mark',
    "zhBookmark": "发文顺序号",
    "type": 7
  }];
}), _defineProperty(_edocTaohongHandler, "bookMarkMapToBookMarkList", function bookMarkMapToBookMarkList(bookMark) {
  this.bookMarkList = [];

  for (var key in bookMark) {
    var bookMarkInfo = void 0;

    if (bookMark[key].type === "DOCUMENT") {
      bookMarkInfo = {
        bookmark: key,
        type: bookMark[key].type,
        fileInfo: bookMark[key].fileInfo
      };
    } else {
      bookMarkInfo = {
        bookmark: key,
        type: "TEXT",
        text: bookMark[key]
      };
    }

    this.bookMarkList.push(bookMarkInfo);
  }
}), _edocTaohongHandler);
/* xiangfan 添加，修复GOV-4328公文文单套红的时候没有把套红模版中的意见元素抓取过来 Start */

function getOpinionsForTaoHong(templateType) {
  try {
    var ops = new Array();
    var isContainNiwenOrDengji = false;
    var opinions = null;
    var opinionSpans = null;

    if (templateType == "edoc") {
      opinions = contentIframe.opinions;
      opinionSpans = contentIframe.opinionSpans;
    } else {
      var pw = null;

      if (window.dialogArguments) {
        pw = window.dialogArguments;
      } else if (transParams) {
        pw = transParams.parentWin;
      }

      opinions = contentIframe.opinions;
      opinionSpans = contentIframe.opinionSpans;
    }

    for (i = 0; i < opinions.length; i++) {
      spanObj = opinionSpans.get("my:" + opinions[i][0], null);

      if (spanObj != null) {
        var sopin = new Array();
        sopin[0] = opinions[i][0];
        sopin[1] = spanObj.innerText;
        ops.push(sopin);
        if (opinions[i][0] == 'niwen' || opinions[i][0] == 'dengji') isContainNiwenOrDengji = true;
      }
    }

    var opArr = new Array();
    opArr[0] = ops;
    if (isContainNiwenOrDengji == false) {
      if (templateType == "edoc") {
        opArr[1] = contentIframe.sendOpinionStr;
      } else {
        opArr[1] = contentIframe.sendOpinionStr;
      }
    } else opArr[1] = '';
    return opArr;
  } catch (e) {
    return new Array();
  }
}
/* xiangfan 添加，修复GOV-4328公文文单套红的时候没有把套红模版中的意见元素抓取过来 End */
//新建公文模板的时候进行正文套红


var tempIsUniteSend = "";
var tempTemplateType = "";

function taohongWhenTemplate(_x17) {
  return _taohongWhenTemplate.apply(this, arguments);
}
/**
 * 模版进行正文套红回调
 *
 * @param receivedObj
 */


function _taohongWhenTemplate() {
  _taohongWhenTemplate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(templateType) {
    var bodyType, loginAccountId, docMark, docMark2;
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            bodyType = document.getElementById("bodyType").value;
            loginAccountId = document.getElementById("loginAccountId").value;

            if (!(bodyType == "HTML" && templateType == "edoc")) {
              _context26.next = 5;
              break;
            }

            alert(_("edocLang.edoc_htmlnofuntion"));
            return _context26.abrupt("return");

          case 5:
            if (!(bodyType == "OfficeExcel" && templateType == "edoc")) {
              _context26.next = 8;
              break;
            }

            alert(_("edocLang.edoc_excelnofuntion"));
            return _context26.abrupt("return");

          case 8:
            if (!(bodyType == "WpsExcel" && templateType == "edoc")) {
              _context26.next = 11;
              break;
            }

            alert(_("edocLang.edoc_wpsetnofuntion"));
            return _context26.abrupt("return");

          case 11:
            if (!(bodyType == "Pdf" && templateType == "edoc")) {
              _context26.next = 14;
              break;
            }

            alert(_("edocLang.edoc_pdfnofuntion"));
            return _context26.abrupt("return");

          case 14:
            if (!(bodyType == "gd" && templateType == "edoc")) {
              _context26.next = 17;
              break;
            }

            alert(_("edocLang.edoc_gdnofuntion"));
            return _context26.abrupt("return");

          case 17:
            if (hasEdocDocTemplate(loginAccountId, templateType, bodyType)) {
              _context26.next = 20;
              break;
            }

            alert(v3x.getMessage('edocLang.edoc_docTemplate_record_notFound'));
            return _context26.abrupt("return");

          case 20:
            //判断是否是联合发文
            docMark = document.getElementById("my:doc_mark");
            docMark2 = document.getElementById("my:doc_mark2");
            tempIsUniteSend = docMark && docMark2 ? "true" : "false";

            if (!(tempIsUniteSend == "true")) {
              _context26.next = 26;
              break;
            }

            alert(_("edocLang.edoc_UniteSendnofuntion"));
            return _context26.abrupt("return");

          case 26:
            if (!(bodyType.toLowerCase() == "officeword" || bodyType.toLowerCase() == "wpsword" || templateType == "script")) {
              _context26.next = 40;
              break;
            }

            if (!(templateType == "edoc")) {
              _context26.next = 37;
              break;
            }

            if (!confirm(_("edocLang.edoc_alertAutoRevisions"))) {
              _context26.next = 36;
              break;
            }

            _context26.next = 31;
            return removeTrailAndSaveWhenTemplate();

          case 31:
            if (_context26.sent) {
              _context26.next = 34;
              break;
            }

            alert(_("edocLang.edoc_contentSaveFalse"));
            return _context26.abrupt("return");

          case 34:
            _context26.next = 37;
            break;

          case 36:
            return _context26.abrupt("return");

          case 37:
            //设置原始正文的ID
            //保存的时候后台生成的ID才是正文真正的ID，JSP页面生成的ID不起作用。
            if (templateType == "script") {
              bodyType = "";
            }

            window.taohongWhenTemplateWin = getA8Top().$.dialog({
              title: V5_Edoc().$.i18n("templete.select.label"),
              //选择套红模版
              transParams: {
                'parentWin': window
              },
              url: templateURL + "?method=taoHongEntry&templateType=" + templateType + "&bodyType=" + bodyType + "&isUniteSend=" + tempIsUniteSend + "&orgAccountId=" + loginAccountId,
              targetWindow: getA8Top(),
              width: "350",
              height: "250"
            });
            tempTemplateType = templateType;

          case 40:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26);
  }));
  return _taohongWhenTemplate.apply(this, arguments);
}

function taohongWhenTemplateCallback(_x18) {
  return _taohongWhenTemplateCallback.apply(this, arguments);
} //ajax判断是否存在套红模板


function _taohongWhenTemplateCallback() {
  _taohongWhenTemplateCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27(receivedObj) {
    var contentNumObj, taohongTemplateContentType, ts, urlStr, redForm, templateUrl, _progressBar, taohongParams, ret;

    return regeneratorRuntime.wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            if (receivedObj) {
              _context27.next = 2;
              break;
            }

            return _context27.abrupt("return");

          case 2:
            contentNumObj = document.getElementById("currContentNum");
            taohongTemplateContentType = "";

            if (tempIsUniteSend == "true" && tempTemplateType == "edoc") {
              ts = receivedObj[0].split("&");
              taohongTemplateContentType = ts[1];
              receivedObj[0] = ts[0];
            } else {
              ts = receivedObj.split("&");
              taohongTemplateContentType = ts[1];
              receivedObj = ts[0];
            }

            if (taohongTemplateContentType == "officeword") {
              taohongTemplateContentType = "OfficeWord";
            } else if (taohongTemplateContentType == "wpsword") {
              taohongTemplateContentType = "WpsWord";
            }

            if (!(tempTemplateType == "script")) {
              _context27.next = 17;
              break;
            }

            urlStr = genericURL + "?method=wendanTaohongIframe&summaryId=" + document.getElementById("summaryId").value;
            urlStr += "&tempContentType=" + taohongTemplateContentType;
            page_receivedObj = receivedObj;
            page_templateType = tempTemplateType;
            page_extendArray = extendArray; //mark by xuqiangwei 修改Chrome37遗留，不知道那里调用

            v3x.openWindow({
              url: urlStr,
              workSpaceFull: 'yes'
            });
            redForm = parent.parent.detailRightFrame.theform.redForm;

            if (redForm) {
              redForm.value = "true";
            }

            _context27.next = 44;
            break;

          case 17:
            if (tempIsUniteSend != "true") {
              templateUrl = receivedObj;
            } else {
              templateUrl = receivedObj[0];
            }

            _progressBar = getA8Top().$.progressBar();
            edocTaohongHandler.setAllLable(document.getElementsByName("sendForm")[0], tempTemplateType, extendArray);
            edocTaohongHandler.bookMarkMapToBookMarkList(edocTaohongHandler.allBM);
            taohongParams = {
              allBookMark: edocTaohongHandler.bookMarkList,
              templateUrl: templateUrl,
              templateType: tempTemplateType,
              fileId: _officeSDK.params.fileId,
              fileType: _officeSDK.params.fileType,
              extParam: _objectSpread({}, receivedObj.extraParam)
            };
            _context27.prev = 22;
            _context27.next = 25;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 25:
            _context27.next = 32;
            break;

          case 27:
            _context27.prev = 27;
            _context27.t0 = _context27["catch"](22);

            _progressBar.close();

            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context27.abrupt("return");

          case 32:
            _context27.next = 34;
            return _officeSDK.openFile({
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            });

          case 34:
            _context27.next = 36;
            return _officeSDK.saveHuaLian();

          case 36:
            ret = _context27.sent;

            if (ret) {
              _context27.next = 41;
              break;
            }

            _progressBar.close();

            alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
            return _context27.abrupt("return");

          case 41:
            _context27.next = 43;
            return _officeSDK.setOptions({
              isDialog: true,
              canClearTrail: false,
              canRevise: false,
              isShowTrailBtn: undefined,
              notChangeState: true,
              //wps调用openFile，文件状态设置为未修改，这里套红后不应该改状态
              isHide: false
            });

          case 43:
            _officeSDK.taohong(taohongParams, function (err, result) {
              _progressBar.close();

              if (result) {
                contentUpdate = true;
                hasTaohong = true;

                if (!tempIsUniteSend != "true") {
                  contentNumObj.value = receivedObj[1]; //设置此参数，用于保存公文和发送公文时候保存正文。

                  document.getElementById("contentNo").value = receivedObj[1];
                }
              } else {
                console.log("套红失败", err);
                alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
              }
            });

          case 44:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, null, [[22, 27]]);
  }));
  return _taohongWhenTemplateCallback.apply(this, arguments);
}

function hasEdocDocTemplate(orgAccountId, templateType, bodyType) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocDocTemplateController", "hasEdocDocTemplate", false);
  requestCaller.addParameter(1, "Long", orgAccountId);
  requestCaller.addParameter(2, "String", templateType);
  requestCaller.addParameter(3, "String", bodyType);
  var ds = requestCaller.serviceRequest(); //"0":没有，“1”：有

  if (ds == "1") {
    return true;
  } else {
    return false;
  }
} //ajax判断是否签章


function checkIsHaveHtmlSign(summaryId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "isHaveHtmlSign", false);
  requestCaller.addParameter(1, "String", summaryId);
  var ds = requestCaller.serviceRequest();
  return ds;
} //处理过程中的正文套红


var tempTaohongIsUniteSend = "";
var tempTaohongTemplateType = "";

function taohong(_x19) {
  return _taohong.apply(this, arguments);
}

function _taohong() {
  _taohong = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(templateType) {
    var puobj, re, bodyType, orgAccountId, canObj, cacheAbilityMapping, _progressBar_1, params, countSign, _progressBar_2, res;

    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            if (!(templateType == "edoc")) {
              _context28.next = 8;
              break;
            }

            //正文锁
            puobj = getProcessAndUserId();
            re = EdocLock.lockWorkflow(puobj.summaryId, puobj.currentUser, EdocLock.UPDATE_CONTENT);

            if (!(re[0] == "false")) {
              _context28.next = 6;
              break;
            }

            parent.parent.$.alert(re[1]);
            return _context28.abrupt("return");

          case 6:
            _context28.next = 11;
            break;

          case 8:
            if (!(templateType == "script")) {
              _context28.next = 11;
              break;
            }

            if (!checkAndLockEdocEditForm(summaryId)) {
              _context28.next = 11;
              break;
            }

            return _context28.abrupt("return");

          case 11:
            bodyType = document.getElementById("bodyType").value;
            tempTaohongIsUniteSend = document.getElementById("isUniteSend").value;
            orgAccountId = document.getElementById("orgAccountId").value;

            if (!(bodyType == "HTML" && templateType == "edoc")) {
              _context28.next = 17;
              break;
            }

            alert(_("edocLang.edoc_htmlnofuntion"));
            return _context28.abrupt("return");

          case 17:
            if (!(bodyType == "OfficeExcel" && templateType == "edoc")) {
              _context28.next = 20;
              break;
            }

            alert(_("edocLang.edoc_excelnofuntion"));
            return _context28.abrupt("return");

          case 20:
            if (!(bodyType == "WpsExcel" && templateType == "edoc")) {
              _context28.next = 23;
              break;
            }

            alert(_("edocLang.edoc_wpsetnofuntion"));
            return _context28.abrupt("return");

          case 23:
            if (!(bodyType == "Pdf" && templateType == "edoc")) {
              _context28.next = 26;
              break;
            }

            alert(_("edocLang.edoc_pdfnofuntion"));
            return _context28.abrupt("return");

          case 26:
            if (!(bodyType == "gd" && templateType == "edoc")) {
              _context28.next = 29;
              break;
            }

            alert(_("edocLang.edoc_gdnofuntion"));
            return _context28.abrupt("return");

          case 29:
            // 加验证——————是否可以进行提交
            canObj = getCanTakeBacData();
            re = edocCanWorkflowCurrentNodeSubmit(canObj.workitemId);

            if (!(re != null && re[0] != 'true')) {
              _context28.next = 34;
              break;
            }

            alert(re[1]);
            return _context28.abrupt("return");

          case 34:
            if (!(templateType == "edoc")) {
              _context28.next = 37;
              break;
            }

            if (!(contentIframe.checkEdocWordNoIsNull() == false)) {
              _context28.next = 37;
              break;
            }

            return _context28.abrupt("return");

          case 37:
            // Ajax判断是否存在套红模板
            if (templateType == "script") {
              bodyType = "";
            }

            if (hasEdocDocTemplate(orgAccountId, templateType, bodyType)) {
              _context28.next = 41;
              break;
            }

            if (templateType == 'edoc') {
              alert(v3x.getMessage('edocLang.edoc_docTemplate_record_content_notFound', bodyType));
            } else {
              alert(v3x.getMessage('edocLang.edoc_docTemplate_record_notFound'));
            }

            return _context28.abrupt("return");

          case 41:
            if (!(bodyType.toLowerCase() == "officeword" || bodyType.toLowerCase() == "wpsword" || templateType == "script")) {
              _context28.next = 112;
              break;
            }

            if (document.getElementById("bodyType").value.toLowerCase() == "html" && templateType == "script") {
              _context28.next = 54;
              break;
            }

            _context28.prev = 43;
            _context28.next = 46;
            return OfficeSDK.utils.getAbilityMapping();

          case 46:
            cacheAbilityMapping = _context28.sent;

            if (!(cacheAbilityMapping.TEMPLATE == 'NONE')) {
              _context28.next = 50;
              break;
            }

            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context28.abrupt("return");

          case 50:
            _context28.next = 54;
            break;

          case 52:
            _context28.prev = 52;
            _context28.t0 = _context28["catch"](43);

          case 54:
            if (!(templateType == "edoc")) {
              _context28.next = 110;
              break;
            }

            // todo zl
            _progressBar_1 = getA8Top().$.progressBar(); // 判断是否有印章，有印章的时候不允许套红。

            _context28.prev = 56;
            _context28.next = 59;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 59:
            _context28.next = 66;
            break;

          case 61:
            _context28.prev = 61;
            _context28.t1 = _context28["catch"](56);

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context28.abrupt("return");

          case 66:
            params = {
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            };
            _context28.next = 69;
            return _officeSDK.openFile(params);

          case 69:
            _context28.next = 71;
            return _officeSDK.countSignatures();

          case 71:
            countSign = _context28.sent;

            if (!(countSign > 0)) {
              _context28.next = 78;
              break;
            }

            _progressBar_1.close();

            alert(_("edocLang.edoc_notaohong_signature"));
            return _context28.abrupt("return");

          case 78:
            if (!(countSign < 0)) {
              _context28.next = 84;
              break;
            }

            _progressBar_1.close();

            alert(_("office.sign.error"));
            return _context28.abrupt("return");

          case 84:
            _progressBar_1.close();

          case 85:
            if (!confirm(_("edocLang.edoc_alertAutoRevisions"))) {
              _context28.next = 105;
              break;
            }

            _progressBar_2 = getA8Top().$.progressBar();

            if (_officeSDK.isClientApp()) {
              _context28.next = 102;
              break;
            }

            _context28.next = 90;
            return _officeSDK.saveHuaLian();

          case 90:
            res = _context28.sent;

            if (res) {
              _context28.next = 94;
              break;
            }

            _progressBar_2.close();

            return _context28.abrupt("return");

          case 94:
            // weboffice已经加载了正文了，不需要重新加载
            contentUpdate = true; //花脸保存后， 清稿前， sleep 1s保证不会出现Version版本号问题

            _context28.next = 97;
            return sleep(1000);

          case 97:
            _context28.next = 99;
            return removeTrailAndSave();

          case 99:
            if (_context28.sent) {
              _context28.next = 102;
              break;
            }

            _progressBar_2.close();

            return _context28.abrupt("return");

          case 102:
            _progressBar_2.close();

            _context28.next = 106;
            break;

          case 105:
            return _context28.abrupt("return");

          case 106:
            window.taohongWin = getA8Top().$.dialog({
              title: V5_Edoc().$.i18n("templete.select.label"),
              //选择套红模版
              transParams: {
                'parentWin': window,
                "popWinName": "taohongWin",
                "popCallbackFn": window.taohongCallback
              },
              url: templateURL + "?method=taoHongEntry&templateType=" + templateType + "&bodyType=" + bodyType + "&isUniteSend=" + tempTaohongIsUniteSend + "&orgAccountId=" + orgAccountId,
              targetWindow: getA8Top(),
              width: "350",
              height: "250"
            });
            tempTaohongTemplateType = templateType;
            _context28.next = 112;
            break;

          case 110:
            window.taohongWin = getA8Top().$.dialog({
              title: V5_Edoc().$.i18n("templete.select.label"),
              //选择套红模版
              transParams: {
                'parentWin': window,
                "popWinName": "taohongWin",
                "popCallbackFn": window.taohongCallback
              },
              url: templateURL + "?method=taoHongEntry&templateType=" + templateType + "&bodyType=" + bodyType + "&isUniteSend=" + tempTaohongIsUniteSend + "&orgAccountId=" + orgAccountId,
              targetWindow: getA8Top(),
              width: "350",
              height: "250"
            });
            tempTaohongTemplateType = templateType;

          case 112:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, null, [[43, 52], [56, 61]]);
  }));
  return _taohong.apply(this, arguments);
}

function sleep(_x20) {
  return _sleep.apply(this, arguments);
}
/**
 * 删除office正文痕迹
 */


function _sleep() {
  _sleep = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(time) {
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return new Promise(function (resolve) {
              return setTimeout(resolve, time);
            });

          case 2:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29);
  }));
  return _sleep.apply(this, arguments);
}

function removeTrailAndSave() {
  return _removeTrailAndSave.apply(this, arguments);
}

function _removeTrailAndSave() {
  _removeTrailAndSave = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            _context30.prev = 0;
            _context30.next = 3;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 3:
            _context30.next = 9;
            break;

          case 5:
            _context30.prev = 5;
            _context30.t0 = _context30["catch"](0);
            $.alert(V5_Edoc().$.i18n("当前配置，不支持清稿"));
            return _context30.abrupt("return");

          case 9:
            _context30.next = 11;
            return _officeSDK.openFile({
              isDialog: true,
              isHide: true
            });

          case 11:
            _context30.next = 13;
            return _officeSDK.clearTrail();

          case 13:
            // 保存正文
            contentUpdate = true;
            checkExistBody();
            _context30.next = 17;
            return saveOcx();

          case 17:
            if (_context30.sent) {
              _context30.next = 21;
              break;
            }

            return _context30.abrupt("return", false);

          case 21:
            return _context30.abrupt("return", true);

          case 22:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30, null, [[0, 5]]);
  }));
  return _removeTrailAndSave.apply(this, arguments);
}

function removeTrailAndSaveWhenTemplate() {
  return _removeTrailAndSaveWhenTemplate.apply(this, arguments);
}
/**
 * 审批流程时套红回调函数
 */


function _removeTrailAndSaveWhenTemplate() {
  _removeTrailAndSaveWhenTemplate = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            _context31.prev = 0;
            _context31.next = 3;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 3:
            _context31.next = 9;
            break;

          case 5:
            _context31.prev = 5;
            _context31.t0 = _context31["catch"](0);
            $.alert(V5_Edoc().$.i18n("当前配置，不支持清稿"));
            return _context31.abrupt("return");

          case 9:
            _context31.next = 11;
            return _officeSDK.openFile({
              isDialog: true,
              isHide: true
            });

          case 11:
            _context31.next = 13;
            return _officeSDK.removeTrail();

          case 13:
            //保存正文
            contentUpdate = true;
            _context31.next = 16;
            return saveOcx();

          case 16:
            _context31.t1 = _context31.sent;

            if (!(_context31.t1 == false)) {
              _context31.next = 19;
              break;
            }

            return _context31.abrupt("return", false);

          case 19:
            return _context31.abrupt("return", true);

          case 20:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31, null, [[0, 5]]);
  }));
  return _removeTrailAndSaveWhenTemplate.apply(this, arguments);
}

function taohongCallback(_x21) {
  return _taohongCallback.apply(this, arguments);
}

function _taohongCallback() {
  _taohongCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(receivedObj) {
    var contentNumObj, taohongSendUnitType, taohongTemplateContentType, ts, sendUnitTypeInput, redContent, urlStr, redForm, newOfficeId, clearDocumentSaveCallbackParam, _progressBar, taohongParams;

    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            if (receivedObj) {
              _context32.next = 2;
              break;
            }

            return _context32.abrupt("return");

          case 2:
            contentNumObj = document.getElementById("currContentNum");
            taohongSendUnitType = "";
            taohongTemplateContentType = "";

            if (tempTaohongIsUniteSend == "true" && tempTaohongTemplateType == "edoc") {
              ts = receivedObj[0].split("&");
              taohongTemplateContentType = ts[1];
              receivedObj[0] = ts[0];
              taohongSendUnitType = ts[2];
            } else {
              ts = receivedObj.split("&");
              taohongTemplateContentType = ts[1];
              receivedObj = ts[0];
              taohongSendUnitType = ts[2];
            }

            sendUnitTypeInput = document.createElement("input");
            sendUnitTypeInput.id = "taohongSendUnitType";
            sendUnitTypeInput.name = "taohongSendUnitType";
            sendUnitTypeInput.type = "hidden";
            sendUnitTypeInput.value = taohongSendUnitType; // GOV-3253 【公文管理】-【发文管理】-【待办】，处理待办公文时进行'文单套红'出现脚本错误
            // IE7不支持这句，而且在文单套红时也把选择单位或部门的去掉了，所以这里不用了
            // contentIframe.document.getElementsByName("sendForm")[0].appendChild(sendUnitTypeInput);

            if (taohongTemplateContentType == "officeword") {
              taohongTemplateContentType = "OfficeWord";
            } else if (taohongTemplateContentType == "wpsword") {
              taohongTemplateContentType = "WpsWord";
            } // 记录字段值为TRUE，JS用来记录套红操作


            redContent = document.getElementById("redContent");

            if (redContent && tempTaohongTemplateType == "edoc") {
              redContent.value = "true";
            }

            if (!(tempTaohongTemplateType == "script")) {
              _context32.next = 27;
              break;
            }

            urlStr = genericURL + "?method=wendanTaohongIframe&summaryId=" + document.getElementById("summary_id").value;
            urlStr += "&tempContentType=" + taohongTemplateContentType;

            if (typeof officecanPrint != "undefined" && officecanPrint != null) {
              urlStr += "&canPrint=" + officecanPrint;
            } else {
              urlStr += "&canPrint=true";
            }

            if (typeof officecanSaveLocal != "undefined" && officecanSaveLocal != null) {
              urlStr += "&officecanSaveLocal=" + officecanSaveLocal;
            } else {
              urlStr += "&officecanSaveLocal=true";
            }

            page_receivedObj = receivedObj;
            page_templateType = tempTaohongTemplateType;
            page_extendArray = extendArray;
            window.formTaohongWin = getA8Top().$.dialog({
              title: edoc_action_script_template,
              transParams: {
                'parentWin': window,
                "popWinName": "formTaohongWin",
                'wpsHiddenWin': window,
                "popCallbackFn": function popCallbackFn() {}
              },
              url: urlStr,
              targetWindow: getA8Top(),
              width: getA8Top().screen.availWidth,
              height: getA8Top().screen.availHeight
            });
            redForm = document.getElementById("redForm");

            if (redForm) {
              redForm.value = "true";
            }

            _context32.next = 46;
            break;

          case 27:
            // todo zl
            // wps清稿保存后，需要回调，查询原正文id需要的参数
            newOfficeId = contentOfficeId.get("0", null);

            if (_officeSDK.isClientApp()) {
              _context32.next = 38;
              break;
            }

            clearDocumentSaveCallbackParam = {
              currSummaryId: summaryId,
              currNewOfficeId: newOfficeId
            };
            _context32.prev = 30;

            _officeSDK.setOptions(clearDocumentSaveCallbackParam);

            _context32.next = 38;
            break;

          case 34:
            _context32.prev = 34;
            _context32.t0 = _context32["catch"](30);
            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context32.abrupt("return");

          case 38:
            if (tempTaohongIsUniteSend != "true") {
              templateUrl = receivedObj;
            } else {
              templateUrl = receivedObj[0];
              contentNumObj.value = receivedObj[1];
            }

            _progressBar = getA8Top().$.progressBar();
            edocTaohongHandler.setAllLable(contentIframe.document.getElementsByName("sendForm")[0], tempTaohongTemplateType, extendArray);
            edocTaohongHandler.bookMarkMapToBookMarkList(edocTaohongHandler.allBM);
            taohongParams = {
              allBookMark: edocTaohongHandler.bookMarkList,
              templateUrl: templateUrl,
              templateType: tempTaohongTemplateType,
              fileId: _officeSDK.params.fileId,
              fileType: _officeSDK.params.fileType,
              extParam: _objectSpread({}, receivedObj.extraParam)
            };
            _context32.next = 45;
            return _officeSDK.setOptions({
              isDialog: true,
              canClearTrail: false,
              canRevise: false,
              isShowTrailBtn: undefined,
              notChangeState: true,
              //wps调用openFile，文件状态设置为未修改，这里套红后不应该改状态
              isHide: false
            });

          case 45:
            _officeSDK.taohong(taohongParams, function (err, result) {
              _progressBar.close();

              if (result) {
                contentUpdate = true;
                hasTaohong = true;

                if (!tempTaohongIsUniteSend != "true") {
                  contentNumObj.value = receivedObj[1];
                }
              } else {
                console.log("套红失败", err);
                alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
              }
            });

          case 46:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, null, [[30, 34]]);
  }));
  return _taohongCallback.apply(this, arguments);
}

function getSendUnitName(unitname) {
  if (unitname == "send_unit" || unitname == "send_unit2") {
    var sendUnitId = "";
    var sendUnit = contentIframe.document.getElementById("my:" + unitname);

    if (unitname == "send_unit") {
      sendUnitId = contentIframe.document.getElementById("my:send_unit_id");
    } else {
      sendUnitId = contentIframe.document.getElementById("my:send_unit_id2");
    }

    if (sendUnit.value != null && sendUnit.value != "") {
      var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "getSendUnitFullName", false);
      requestCaller.addParameter(1, "int", 1);
      requestCaller.addParameter(2, "String", sendUnit.value);
      requestCaller.addParameter(3, "String", sendUnitId.value);
      requestCaller.addParameter(4, "long", contentIframe.document.getElementsByName("sendForm")[0].orgAccountId.value);
      var ds = requestCaller.serviceRequest();
      return ds;
    }
  }

  return null;
} //-----------------------------------------------


function supervise() {
  document.getElementById("supervise_div_date").className = "";
  document.getElementById("supervise_div_people").className = "";
}

function arrayToArray(array) {
  var r = [];

  if (array != null) {
    for (var i = 0; i < array.length; i++) {
      r[i] = array[i];
    }
  }

  return r;
} //function edocUpdateEdocFlash(processId,activityId,operationType,elements,commandType,manualSelectNodeId,peopleArr,summaryId,conditions,nodes){
//  var rs = null;
//  var str = "";
//
//  var idArr = new Array();
//  var typeArr = new Array();
//  var nameArr = new Array();
//  var accountIdArr = new Array();
//  var accountShortNameArr = new Array();
//  var selecteNodeIdArr = new Array();
//  var _peopleArr = new Array();
//  var conditionArr = new Array();
//  var nodesArr = new Array();
//
//  if(commandType == "addNode" || commandType == "replaceNode"){
//    if (!elements) {
//      return false;
//    }
//
//    var personList = elements[0] || [];
//    var flowType = elements[1] || 0;
//    var isShowShortName = elements[2] || "false";
//    var process_desc_by = "people";
//
//    str = processId + "," + activityId + "," + operationType + "," + flowType + "," + isShowShortName + "," + process_desc_by;
//
//    for (var i = 0; i < personList.length; i++) {
//      var person = personList[i];
//      idArr.push(person.id);
//      typeArr.push(person.type);
//      nameArr.push(person.name);
//      accountIdArr.push(person.accountId);
//      accountShortNameArr.push(person.accountShortname);
//      selecteNodeIdArr = [];
//      _peopleArr = [];
//    }
//  }else if(commandType == "delNode"){
//    str = processId + "," + activityId + "," + operationType + "," + null + "," + null + "," + null;
//    idArr = [];
//    typeArr = [];
//    nameArr = [];
//    accountIdArr = [];
//    accountShortNameArr = [];
//    if(manualSelectNodeId && peopleArr && manualSelectNodeId.length != 0 && peopleArr.length != 0){
//      selecteNodeIdArr = arrayToArray(manualSelectNodeId);
//      _peopleArr = arrayToArray(peopleArr);
//    }else{
//      selecteNodeIdArr = [];
//      _peopleArr = [];
//    }
//    if(conditions && conditions.length!=0){
//      conditionArr = arrayToArray(conditions);
//      nodesArr = arrayToArray(nodes);
//    }else{
//      conditionArr = [];
//      nodesArr = [];
//    }
//  }
//  try {
//    var requestCaller = new XMLHttpRequestCaller(null, "ajaxEdocSuperviseManager", "changeProcess", false, "POST");
//    requestCaller.addParameter(1, "String", str);
//    requestCaller.addParameter(2, "String[]", idArr);
//    requestCaller.addParameter(3, "String[]", typeArr);
//    requestCaller.addParameter(4, "String[]", nameArr);
//    requestCaller.addParameter(5, "String[]", accountIdArr);
//    requestCaller.addParameter(6, "String[]", accountShortNameArr);
//    requestCaller.addParameter(7, "String[]", selecteNodeIdArr);
//    requestCaller.addParameter(8, "String[]", _peopleArr);
//    requestCaller.addParameter(9, "String", summaryId);
//    requestCaller.addParameter(10, "String[]", conditionArr);
//    requestCaller.addParameter(11, "String[]", nodesArr);
//    rs = requestCaller.serviceRequest();
//  }
//  catch (ex1) {
//    alert("Exception : " + ex1);
//  }
//
//    return rs;
//}
//function edocUpdateEdocFlash1(flowProp,policyStr,summaryId){
//  var rs = null;
//  try {
//    var requestCaller = new XMLHttpRequestCaller(null, "ajaxEdocSuperviseManager", "changeProcess1", false, "POST");
//    requestCaller.addParameter(1, "String[]", arrayToArray(flowProp));
//    requestCaller.addParameter(2, "String[]", arrayToArray(policyStr));
//    requestCaller.addParameter(3, "String", summaryId);
//    rs = requestCaller.serviceRequest();
//  }
//  catch (ex1) {
//    alert("Exception : " + ex1);
//  }
//
//    return rs;
//}


function selectAllValues(allButton, targetName) {
  var objcts = document.getElementsByName(targetName);

  if (objcts != null) {
    for (var i = 0; i < objcts.length; i++) {
      if (!objcts[i].disabled) {
        objcts[i].checked = allButton.checked;
      }
    }
  }
}

function _getWordNoValue(inputObj) {
  var markStr = "";
  var inputValue = "";

  if (inputObj.tagName == "INPUT" && (inputObj.type == "text" || inputObj.type == "hidden")) {
    inputValue = inputObj.value;

    if (inputValue && inputValue.indexOf("|") > -1) {
      markStr = inputValue.split("|")[1];
    } else {
      markStr = inputValue;
    }
  } else if (inputObj.tagName == "SELECT") {
    inputValue = inputObj.options[inputObj.selectedIndex].value;

    if (inputValue == "") {
      return "";
    }

    markStr = inputValue.split("|")[1];
  } else if (inputObj.tagName == "TEXTAREA") {
    inputValue = inputObj.value;
    markStr = inputValue;
  }

  return markStr;
}
/*校验是否录入了公文文号*/


function checkEdocWordNo() {
  var markStr = "";
  var inputObj = document.getElementById("my:doc_mark");

  if (inputObj != null) {
    markStr = _getWordNoValue(inputObj);

    if (markStr == "") {
      alert(_("edocLang.doc_mark_alter_not_null"));

      try {
        inputObj.focus();
      } catch (e) {}

      return false;
    }

    var markUsed = checkWordNoUser(markStr);

    if (markUsed) {
      alert(_("edocLang.doc_mark_alter_used"));
      return false;
    }
  } //bug 29522 公文文号封发时判断问题
  //else{//公文单中需要含有公文文号元素且不能为空才可封发。
  //  alert(_("edocLang.doc_mark_alter_include_and_not_null"));
  //  return false;
  //}


  var isUniteSend = document.getElementById("isUniteSend").value;

  if (isUniteSend == "true") {
    inputObj = document.getElementById("my:doc_mark2");

    if (inputObj != null) {
      var markStr1 = markStr;
      markStr = _getWordNoValue(inputObj);

      if (markStr == "") {
        alert(_("edocLang.doc_mark2_alter_not_null"));

        try {
          inputObj.focus();
        } catch (e) {}

        return false;
      } //检查两个文号是否相同


      if (markStr1 == markStr) {
        alert(_("edocLang.two_doc_mark_no_equ"));
        return false;
      }

      var markUsed = checkWordNoUser(markStr);

      if (markUsed) {
        alert(_("edocLang.doc_mark2_alter_used"));
        return false;
      }
    }
  }

  return true;
}

function _checkEdocMarkIsUsed(markTpye, doc_mark, summaryId, orgAccountId) {
  /*var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocMarkManager", "isUsed",false);
     requestCaller.addParameter(1, "String", doc_mark);
     requestCaller.addParameter(2, "String", summaryId);
     requestCaller.addParameter(3, "String", orgAccountId);
     var ds = requestCaller.serviceRequest();
  
     if(ds == "true"){
     	return true;
     }else{
     	return false;
     }*/
  return checkGovdocMarkOldIsUsed(markTpye, doc_mark, summaryId, orgAccountId);
}
/*校验是否录入了公文文号*/


function checkEdocWordNo_fromWaitSend(doc_mark, summaryId, orgAccountId) {
  if (doc_mark != null) {
    if (doc_mark == "" || doc_mark == " ") {
      alert(_("edocLang.doc_mark_alter_not_null"));
      return false;
    }

    if (_checkEdocMarkIsUsed(0, doc_mark, summaryId, orgAccountId)) {
      alert(_("edocLang.doc_mark_alter_used"));
      return false;
    }
  }

  return true;
}

function checkWordNoUser(docMark) {
  if (typeof docMark != "undefined" && !/\S+/g.test(docMark)) {
    return false;
  }

  var _summaryId = document.getElementById("summaryId").value;
  var orgAccountIdObj = document.getElementById("orgAccountId");
  var _orgAccountId = "0";

  if (orgAccountIdObj) {
    _orgAccountId = orgAccountIdObj.value;
  }

  return _checkEdocMarkIsUsed(0, docMark, _summaryId, _orgAccountId);
}
/*判断公文文号是否为空*/


function checkEdocWordNoIsNull() {
  var markStr = "";
  var inputObj = document.getElementById("my:doc_mark");

  if (inputObj != null) {
    markStr = _getWordNoValue(inputObj);

    if (markStr == "") {
      if (confirm(_("edocLang.doc_taohong_mark_alter_not_null"))) {
        return true;
      } else {
        try {
          inputObj.focus();
        } catch (e) {}

        return false;
      }
    }
  }

  return true;
} //处理时候，跟踪，处理后删除校验


var checkMulitSign_hasShowAlert = false;

function checkMulitSign(nowSelected) {
  var afterSignObj = document.getElementsByName("afterSign");

  if (checkMulitSign_hasShowAlert == false) {
    var flag = 0;

    for (var i = 0; i < afterSignObj.length; i++) {
      if (afterSignObj[i].checked) {
        flag++;
      }
    }

    if (flag > 1) {
      alert(_("edocLang.edoc_alertSignAfterOption"));
      checkMulitSign_hasShowAlert = true;
    }
  }

  for (var i = 0; i < afterSignObj.length; i++) {
    if (afterSignObj[i].id == nowSelected.id) {
      continue;
    }

    afterSignObj[i].checked = false;

    if (afterSignObj[i].id == 'isTrack') {
      var all = document.getElementById("trackRange_all");
      var part = document.getElementById("trackRange_part");
      if (all != null) all.checked = false;
      if (part != null) part.checked = false;
    }
  } //当前选择的是处理后归档


  var showPrePigeonhole = document.getElementById("showPrePigeonhole");
  var showSelectPigeonholePath = document.getElementById("showSelectPigeonholePath");

  if (nowSelected.id == 'pipeonhole') {
    if (hasPrepigeonholePath == "true") {
      //有预归档目录
      if (nowSelected.checked) {
        //选择状态，显示，否则隐藏归档路径区域
        showPrePigeonhole.style.display = "";
      } else {
        showPrePigeonhole.style.display = "none";
      }
    } else if (hasPrepigeonholePath == 'false') {
      //模板中没有设置预先归档
      if (nowSelected.checked) {
        showSelectPigeonholePath.style.display = "";
      } else {
        showSelectPigeonholePath.style.display = "none";
      }
    }
  } else if (nowSelected.id == 'isTrack') {
    if (nowSelected.checked) {
      if (showPrePigeonhole) {
        showPrePigeonhole.style.display = "none";
      }

      if (showSelectPigeonholePath) {
        showSelectPigeonholePath.style.display = "none";
      }
    }
  }
}

function chanageHtmlBodyType(contentType) {
  var ret = chanageBodyType(contentType);

  if (ret) {
    //清空office的id
    var contentObj = document.getElementById("content");

    if (contentObj != null) {
      contentObj.value = "";
    }
  }
}

function substituteLogo(logoURL) {
  //substitution of logo 【logo的替换】
  var i, key, style, width, height;
  var spanObjs = document.getElementsByTagName("span");

  for (i = 0; i < spanObjs.length; i++) {
    key = spanObjs[i].getAttribute("xd:binding");
    style = spanObjs[i].getAttribute("style");

    if (style != null) {
      if (typeof style == "string") {
        var _f = style.indexOf('width');

        if (_f != -1) {
          var _f2 = style.indexOf(':', _f);

          var _f3 = style.indexOf(';', _f);

          width = style.substring(_f2 + 1, _f3);
        }

        var _h = style.indexOf('height');

        if (_h != -1) {
          var _h2 = style.indexOf(':', _h);

          var _h3 = style.indexOf(';', _h);

          height = style.substring(_h2 + 1, _h3);
        }
      } else {
        width = style.getAttribute("width");
        height = style.getAttribute("height");
      }

      if (key == 'my:logoimg') {
        logoURL = logoURL.replace('img', 'img width=' + width + ' height=' + height);
        spanObjs[i].outerHTML = logoURL;
      }
    }
  }
}

function checkExchangeAccountIsDuplicatedOrNot() {
  var returnValue = true;
  var sendToIds = getIdsString(selPerElements.get("my:send_to"), false);
  var reportToIds = getIdsString(selPerElements.get("my:report_to"), false);
  var copyToIds = getIdsString(selPerElements.get("my:copy_to"), false); //如果主送，抄报，抄送都存在

  if (sendToIds != null && sendToIds != "" && reportToIds != null && reportToIds != "" && copyToIds != null && copyToIds != "") {
    var tempArray_a = sendToIds.split(",");
    var tempArray_b = reportToIds.split(",");
    var tempArray_c = copyToIds.split(",");

    for (var i = 0; i < tempArray_a.length; i++) {
      for (var j = 0; j < tempArray_b.length; j++) {
        if (tempArray_a[i] == tempArray_b[j]) {
          ;
          returnValue = false;
          break;
        }

        for (var z = 0; z < tempArray_c.length; z++) {
          if (tempArray_b[j] == tempArray_c[z] || tempArray_a[i] == tempArray_c[z]) {
            returnValue = false;
            break;
          }
        }
      }
    }
  } //如果有主送，有抄报，而无抄送
  else if (sendToIds != null && sendToIds != "" && copyToIds != null && copyToIds != "" && (reportToIds == null || reportToIds == "")) {
    var tempArray_a = sendToIds.split(",");
    var tempArray_c = copyToIds.split(",");

    for (var i = 0; i < tempArray_a.length; i++) {
      for (var z = 0; z < tempArray_c.length; z++) {
        if (tempArray_a[i] == tempArray_c[z]) {
          returnValue = false;
          break;
        }
      }
    }
  } //如果有主送，有抄送，而无抄报
  else if (sendToIds != null && sendToIds != "" && reportToIds != null && reportToIds != "" && (copyToIds == null || copyToIds == "")) {
    var tempArray_a = sendToIds.split(",");
    var tempArray_b = reportToIds.split(",");

    for (var i = 0; i < tempArray_a.length; i++) {
      for (var j = 0; j < tempArray_b.length; j++) {
        if (tempArray_a[i] == tempArray_b[j]) {
          returnValue = false;
          break;
        }
      }
    }
  } //如果无主送，有抄送，有抄报
  else if (reportToIds != null && reportToIds != null && copyToIds != null && copyToIds != "" && (sendToIds == null || sendToIds == "")) {
    var tempArray_b = reportToIds.split(",");
    var tempArray_c = copyToIds.split(",");

    for (var i = 0; i < tempArray_b.length; i++) {
      for (var j = 0; j < tempArray_c.length; j++) {
        if (tempArray_b[i] == tempArray_c[j]) {
          returnValue = false;
          break;
        }
      }
    }
  }

  var sendToIds2 = getIdsString(selPerElements.get("my:send_to2"), false);
  var reportToIds2 = getIdsString(selPerElements.get("my:report_to2"), false);
  var copyToIds2 = getIdsString(selPerElements.get("my:copy_to2"), false); //如果主送，抄报，抄送都存在

  if (sendToIds2 != null && sendToIds2 != "" && reportToIds2 != null && reportToIds2 != "" && copyToIds2 != null && copyToIds2 != "") {
    var tempArray_a2 = sendToIds2.split(",");
    var tempArray_b2 = reportToIds2.split(",");
    var tempArray_c2 = copyToIds2.split(",");

    for (var i = 0; i < tempArray_a2.length; i++) {
      for (var j = 0; j < tempArray_b2.length; j++) {
        if (tempArray_a2[i] == tempArray_b2[j]) {
          ;
          returnValue = false;
          break;
        }

        for (var z = 0; z < tempArray_c2.length; z++) {
          if (tempArray_b2[j] == tempArray_c2[z] || tempArray_a2[i] == tempArray_c2[z]) {
            returnValue = false;
            break;
          }
        }
      }
    }
  } //如果有主送，有抄报，而无抄送
  else if (sendToIds2 != null && sendToIds2 != "" && copyToIds2 != null && copyToIds2 != "" && (reportToIds2 == null || reportToIds2 == "")) {
    var tempArray_a2 = sendToIds2.split(",");
    var tempArray_c2 = copyToIds2.split(",");

    for (var i = 0; i < tempArray_a2.length; i++) {
      for (var z = 0; z < tempArray_c2.length; z++) {
        if (tempArray_a2[i] == tempArray_c2[z]) {
          returnValue = false;
          break;
        }
      }
    }
  } //如果有主送，有抄送，而无抄报
  else if (sendToIds2 != null && sendToIds2 != "" && reportToIds2 != null && reportToIds2 != "" && (copyToIds2 == null || copyToIds2 == "")) {
    var tempArray_a2 = sendToIds2.split(",");
    var tempArray_b2 = reportToIds2.split(",");

    for (var i = 0; i < tempArray_a2.length; i++) {
      for (var j = 0; j < tempArray_b2.length; j++) {
        if (tempArray_a2[i] == tempArray_b2[j]) {
          returnValue = false;
          break;
        }
      }
    }
  } //如果无主送，有抄送，有抄报
  else if (reportToIds2 != null && reportToIds2 != null && copyToIds2 != null && copyToIds2 != "" && (sendToIds2 == null || sendToIds2 == "")) {
    var tempArray_b2 = reportToIds2.split(",");
    var tempArray_c2 = copyToIds2.split(",");

    for (var i = 0; i < tempArray_b2.length; i++) {
      for (var j = 0; j < tempArray_c2.length; j++) {
        if (tempArray_b2[i] == tempArray_c2[j]) {
          returnValue = false;
          break;
        }
      }
    }
  }

  return returnValue;
}

function selectInsertPeopleOK() {
  //把流程操作后的数据放到隐藏域中
  try {
    getA8Top().endProc();
  } catch (e) {}

  if (v3x.isFirefox) {
    if (document.getElementById("monitorFrame") != null) {
      document.getElementById("monitorFrame").src = document.getElementById("monitorFrame").src;
    }
  } else {
    monitorFrame.location.href = monitorFrame.location.href;
  } //showPrecessArea();


  this.waitMin = function () {
    showPrecessAreaTd("workflow");
  };

  setTimeout(this.waitMin, 1);
}

function showAttention(object) {
  var divObj = document.getElementById(object);
  var divLeft = event.x;

  if (divLeft + 220 > document.body.clientWidth) {
    divLeft = event.x - 220;
  }

  divObj.style.top = event.y - 50;
  divObj.style.left = divLeft - 150;
  divObj.style.height = 25;
  divObj.style.width = 250;
  divObj.style.display = "block";
}

function hideAttention(object) {
  var divObj = document.getElementById(object);
  divObj.style.display = "none";
}

function showNextSpecialCondition(conditionObject) {
  var options = conditionObject.options;

  for (var i = 0; i < options.length; i++) {
    var d = document.getElementById(options[i].value + "Div"); //alert(d);

    if (d) {
      d.style.display = "none";
    }
  }

  if (document.getElementById(conditionObject.value + "Div") == null) return;
  document.getElementById(conditionObject.value + "Div").style.display = "block";
}
/**
 * 审批时插入关联文档
 */


function quoteDocument() {
  var topicIfram = document.getElementById("contentIframe");

  if (topicIfram && topicIfram.contentWindow) {
    window.quoteDocument_affterFn = topicIfram.contentWindow.reloadParentAtt; //回调后执行函数，因为所有地方的关联文档回调函数都是一样的
  }

  getA8Top().addassDialog = getA8Top().$.dialog({
    title: V5_Edoc().$.i18n("common.toolbar.insert.mydocument.label"),
    //关联文档
    transParams: {
      'parentWin': window
    },
    url: v3x.baseURL + '/ctp/common/associateddoc/assdocFrame.do?isBind=1,3',
    targetWindow: getA8Top(),
    width: "1000",
    height: "800"
  });
}

function quoteDocumentUnSelected(url) {
  deleteAttachment(url, fileUploadAttachments.containsKey(url));
}

function quoteDocumentSelected(obj, subject, documentType, url) {
  if (!obj) {
    return;
  }

  if (!obj.checked) {
    quoteDocumentUnSelected(url);
    return;
  }

  if (!subject || !documentType || !url || fileUploadAttachments.containsKey(url)) {
    return;
  }

  var type = "2";
  var filename = subject;
  var mimeType = documentType;
  var createDate = "2000-01-01 00:00:00";

  if (obj.getAttribute("createDate")) {
    createDate = obj.getAttribute("createDate");
  }

  var fileUrl = url;
  var description = url; //Attachment(id, reference, subReference, category, type, filename, mimeType, createDate, size, fileUrl, description, needClone,extension,icon)
  //atts[atts.length] = new Attachment('', '', '', '', type, filename, mimeType, createDate, '0', fileUrl, description);
  //function addAttachment(type, filename, mimeType, createDate, size, fileUrl, canDelete, needClone, description,extension,icon)

  addAttachment(type, filename, mimeType, createDate, '0', fileUrl, true, null, description, documentType, documentType + ".gif");
}

function quoteDocumentOK() {
  var atts = fileUploadAttachments.values().toArray();

  if (!atts || atts.length < 1) {
    alert(getA8Top().v3x.getMessage('collaborationLang.collaboration_alertQuoteItem'));
    return;
  }

  parent.window.returnValue = atts;
  parent.window.close();
}

function officeOcxOperateOver(opType) {
  if (typeof openFrom == "undefined") {
    return;
  }

  if (openFrom != "lenPotent") {
    return;
  }

  var LogType = "";

  if (opType == "print") {
    LogType = "print";
  } else if (opType == "saveLocal") {
    LogType = "save";
  }

  try {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "writeDocOperateLog", false);
    requestCaller.addParameter(1, "Long", docId);
    requestCaller.addParameter(2, "Long", summaryId);
    requestCaller.addParameter(3, "String", docSubject);
    requestCaller.addParameter(4, "String", LogType);
    var ds = requestCaller.serviceRequest();
  } catch (e) {}
}
/**
 * 打开督办页面（供普通使用）
 */


function openSuperviseWindow() {
  var mId = document.getElementById("supervisorId");
  var sDate = document.getElementById("awakeDate");
  var sNames = document.getElementById("supervisors");
  var title = document.getElementById("superviseTitle");
  var summaryId = document.getElementById("id");
  var fromSend = document.getElementById("fromSend");

  if (summaryId) {
    summaryId = summaryId.value;
  }

  var urlStr = (_ctxPath ? _ctxPath + "/" : "") || ""; //var canModify = document.getElementById("canModifyAwake");

  if (fromSend.value == "true") {
    urlStr += "edocController.do?method=superviseWindowForEdocZCDB";
  } else {
    urlStr += "edocTempleteController.do?method=superviseWindow";
  }

  var unCancelledVisor = document.getElementById("unCancelledVisor");
  var sfTemp = document.getElementById("sVisorsFromTemplate");

  if (mId.value != null && mId.value != "") {
    urlStr += "&supervisorId=" + mId.value + "&supervisors=" + encodeURIComponent(sNames.value) + "&superviseTitle=" + encodeURIComponent(title.value) + "&awakeDate=" + sDate.value + "&sVisorsFromTemplate=" + sfTemp.value + "&unCancelledVisor=" + unCancelledVisor.value;
  }

  urlStr += "&summaryId=" + summaryId + "&isFromEdoc=yes&currentPage=" + currentPage + CsrfGuard.getUrlSurffix();
  getA8Top().win123 = getA8Top().$.dialog({
    title: v3x.getMessage('common.edoc.supervise.label'),
    //
    transParams: {
      'parentWin': window
    },
    url: urlStr,
    width: "465",
    height: "300"
  });
}
/**
 * 打开督办页面回调函数
 *
 */


function openSuperviseWindowCallBack(rv) {
  if (rv != null && rv != "undefined") {
    var mId = document.getElementById("supervisorId");
    var sDate = document.getElementById("awakeDate");
    var sNames = document.getElementById("supervisors");
    var title = document.getElementById("superviseTitle");
    var sv = rv.split("|");

    if (sv.length == 4) {
      mId.value = sv[0]; //督办人的ID(添加标识的，为的是向后台传送)

      sDate.value = sv[1]; //督办时间

      sNames.value = sv[2]; //督办人的姓名

      title.value = sv[3]; //canModify.value = sv[4];
    }
  }
}
/**
 * 打开督办页面（供模板使用）
 */


function openSuperviseWindowForTemplate() {
  var mId = document.getElementById("supervisorId");
  var sDate = document.getElementById("awakeDate");
  var sNames = document.getElementById("supervisors");
  var title = document.getElementById("superviseTitle");
  var role = document.getElementById("superviseRole"); //var canModify = document.getElementById("canModifyAwake");

  var urlStr = ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocTempleteController.do?method=superviseWindowForTemplate"; //追加页面回写的已选督办信息

  urlStr += "&supervisorId=" + mId.value + "&supervisors=" + encodeURIComponent(sNames.value) + "&superviseTitle=" + encodeURIComponent(title.value) + "&awakeDate=" + sDate.value + "&role=" + role.value;
  urlStr += "&isFromEdoc=yes";
  getA8Top().win123 = getA8Top().$.dialog({
    title: v3x.getMessage('common.edoc.supervise.label'),
    //
    transParams: {
      'parentWin': window
    },
    url: urlStr,
    width: "450",
    height: "350"
  });
}
/**
 * 打开督办页面（供模板使用） 回调
 */


function openSuperviseWindowForTemplateCallback(rv) {
  if (rv != null) {
    var mId = document.getElementById("supervisorId");
    var sDate = document.getElementById("awakeDate");
    var sNames = document.getElementById("supervisors");
    var title = document.getElementById("superviseTitle");
    var role = document.getElementById("superviseRole"); //var sv = rv.split("|");

    if (rv.length == 6) {
      mId.value = rv[0]; //督办人的ID(添加标识的，为的是向后台传送)

      sDate.value = rv[1]; //督办时间

      sNames.value = rv[2]; //督办人的姓名

      title.value = rv[3];
      role.value = rv[4]; //canModify.value = sv[4];
    }
  }
}

function showSuperviseWindow() {
  try {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocSuperviseManager", "ajaxCheckIsSummaryOver", false);
    requestCaller.addParameter(1, "Long", summary_id);
    var ds = requestCaller.serviceRequest();

    if (ds == "true") {
      alert(v3x.getMessage('edocLang.edoc_supervise_workflow_over'));
      return;
    }
  } catch (e) {}

  var sVisorsFromTemplate = document.getElementById("sVisorsFromTemplateSupervise").value;
  var unCancelledVisor = document.getElementById("unCancelledVisorSupervise").value;
  window.showSuperviseWindowWin = getA8Top().$.dialog({
    title: v3x.getMessage('common.edoc.supervise.label'),
    transParams: {
      'parentWin': window,
      "popWinName": "showSuperviseWindowWin",
      "popCallbackFn": function popCallbackFn() {}
    },
    url: ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocTempleteController.do?method=edocSuperviseWindowEntry&summaryId=" + summaryId + "&sVisorsFromTemplate=" + sVisorsFromTemplate + "&unCancelledVisor=" + unCancelledVisor + CsrfGuard.getUrlSurffix(),
    targetWindow: getA8Top(),
    width: "465",
    height: "300"
  });
}

function selectCondition() {
  var orgId = document.getElementById("orgId").value;
  var orgName = document.getElementById("orgName").value;

  if (orgId == "" || orgName == "") {
    alert(v3x.getMessage("collaborationLang.branch_selectorg"));
    return;
  }

  var operationSel = document.getElementById("operation");
  var operation = operationSel.options[operationSel.selectedIndex];
  var arr = new Array();
  arr[0] = operation.value;
  arr[1] = operation.value;
  arr[2] = orgId;
  arr[3] = "[" + orgName + "]";
  window.returnValue = arr;
  window.close();
}

function ColBranch() {
  this.id = null;
  this.conditionType = null;
  this.formCondition = null;
  this.conditionTitle = null;
  this.conditionDesc = null;
  this.isForce = null;
  this.conditionBase = null;
}

function initCondition() {
  var scripts = document.getElementsByName("scripts");

  if (scripts && scripts.length > 0) {
    var prefix = "";
    var parentURL = null;
    /*var isFormFlag = false;
      try{
        isFormFlag = isForm=="true" || isForm==true;
      }catch(e){}
        if(isFormFlag){
          if(rootNodeName)
            prefix = rootNodeName;
          else {
            parentURL = "parent.detailMainFrame.contentIframe.";
            prefix = parent.detailMainFrame.contentIframe.rootNodeName;
          }
          prefix = prefix.substring(0,prefix.indexOf(":")+1);
        }*/

    if (typeof isNewColl == "undefined") {
      parentURL = "contentIframe.";
    }

    var reg = new RegExp("[\{][^\{\}]*[\}]", "g");
    var list = new ArrayList();

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i].value;
      var arr = script.match(reg);

      if (arr) {
        for (var j = 0; j < arr.length; j++) {
          script = script.replace(arr[j], (parentURL == null ? "" : parentURL) + "getFieldValueForFlow(\"" + prefix + arr[j].substring(1, arr[j].length - 1) + "\")");
        }
      }

      arr = script.match(/[\[][^\[\]]*[\]]/gi);

      if (arr) {
        for (var j = 0; j < arr.length; j++) {
          if (arr[j].indexOf(":") != -1) script = script.replace(arr[j], "\"" + arr[j].substring(arr[j].indexOf(":") + 1, arr[j].length - 1) + "\"");
        }
      }

      arr = script.match(/include\([^\']*/gi);

      if (arr) {
        //格式：include(team,系统组:'3434328934822');include(secondPost,'4342342345453_-54534534534')
        for (var j = 0; j < arr.length; j++) {
          var data = arr[j].substring(arr[j].indexOf(":") + 1);
          if (data.indexOf("_") != -1) data = data.replace(/_/, ",");
          var con = arr[j].substring(0, arr[j].indexOf(",") + 1) + data;
          script = script.replace(arr[j], con);
        }
      }

      arr = script.match(/exclude\([^\']*/gi);

      if (arr) {
        //格式：exclude(team,系统组:3434328934822)
        for (var j = 0; j < arr.length; j++) {
          var data = arr[j].substring(arr[j].indexOf(":") + 1);
          if (data.indexOf("_") != -1) data = data.replace(/_/, ",");
          var con = arr[j].substring(0, arr[j].indexOf(",") + 1) + data;
          script = script.replace(arr[j], con);
        }
      }

      script = script.replace(/<>/g, "!=");
      eval(script);
    }
  }
}

function initCondition_edoc(isNewColl) {
  var scripts = document.getElementsByName("scripts");

  if (scripts && scripts.length > 0) {
    var prefix = "";
    var parentURL = null;
    /*var isFormFlag = false;
      try{
        isFormFlag = isForm=="true" || isForm==true;
      }catch(e){}
        if(isFormFlag){
          if(rootNodeName)
            prefix = rootNodeName;
          else {
            parentURL = "parent.detailMainFrame.contentIframe.";
            prefix = parent.detailMainFrame.contentIframe.rootNodeName;
          }
          prefix = prefix.substring(0,prefix.indexOf(":")+1);
        }*/

    if (typeof isNewColl == "undefined") {
      parentURL = "_parent.contentIframe.";
    } else {
      parentURL = "_parent.";
    }

    var reg = new RegExp("[\{][^\{\}]*[\}]", "g");
    var list = new ArrayList(); //定义存储计算之前的js字符串

    var beforeScripts = new Array(); //定义从表单页面获的相应值<value,表达式>

    var formDataTrace = new Properties(); //定义存储计算之后的js字符串

    var afterStripts = new Array();

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i].value;

      if (isDebug) {
        //记录下运算之前的js运算字符串
        beforeScripts[i] = script;
      }

      var arr = script.match(reg);

      if (arr) {
        for (var j = 0; j < arr.length; j++) {
          var tempFieldName = prefix + arr[j].substring(1, arr[j].length - 1);
          script = script.replace(arr[j], (parentURL == null ? "" : parentURL) + "getFieldValueForFlow(\"" + tempFieldName + "\")");
          formValue = eval((parentURL == null ? "" : parentURL) + "getFieldValueForFlow(\"" + tempFieldName + "\")");
          formDataTrace.put("" + formValue, "pageData:[\"" + tempFieldName + "\"]");
        }
      }

      arr = script.match(/[\[][^\[\]]*[\]]/gi);

      if (arr) {
        for (var j = 0; j < arr.length; j++) {
          if (arr[j].indexOf(":") != -1) script = script.replace(arr[j], "\"" + arr[j].substring(arr[j].indexOf(":") + 1, arr[j].length - 1) + "\"");
        }
      }

      arr = script.match(/include\([^\']*/gi);

      if (arr) {
        //格式：include(team,系统组:'3434328934822');include(secondPost,'4342342345453_-54534534534')
        for (var j = 0; j < arr.length; j++) {
          var data = arr[j].substring(arr[j].indexOf(":") + 1);
          if (data.indexOf("_") != -1) data = data.replace(/_/, ",");
          var con = arr[j].substring(0, arr[j].indexOf(",") + 1) + data;
          script = script.replace(arr[j], con);
        }
      }

      arr = script.match(/exclude\([^\']*/gi);

      if (arr) {
        //格式：exclude(team,系统组:3434328934822)
        for (var j = 0; j < arr.length; j++) {
          var data = arr[j].substring(arr[j].indexOf(":") + 1);
          if (data.indexOf("_") != -1) data = data.replace(/_/, ",");
          var con = arr[j].substring(0, arr[j].indexOf(",") + 1) + data;
          script = script.replace(arr[j], con);
        }
      }

      script = script.replace(/<>/g, "!=");

      if (isDebug) {
        afterStripts[i] = script;
      }

      eval(script);
    }

    if (isDebug) {
      //跟踪代码开始
      try {
        var requestCaller = new XMLHttpRequestCaller(this, "ajaxColManager", "createBranchLogData", false);
        requestCaller.addParameter(1, "String[]", beforeScripts);
        requestCaller.addParameter(2, "String[]", afterStripts);
        var teamstr = "";

        for (var i in team) {
          teamstr += "[" + i + "],";
        }

        var secondpoststr = "";

        for (var i in secondpost) {
          secondpoststr += "[" + i + "],";
        }

        var startTeamstr = "";

        for (var i in startTeam) {
          startTeamstr += "[" + i + "],";
        }

        var startSecondpoststr = "";

        for (var i in startSecondpost) {
          startSecondpoststr += "[" + i + "],";
        }

        requestCaller.addParameter(3, "String", teamstr);
        requestCaller.addParameter(4, "String", secondpoststr);
        requestCaller.addParameter(5, "String", startTeamstr);
        requestCaller.addParameter(6, "String", startSecondpoststr);
        requestCaller.addParameter(7, "String", formDataTrace.toString());
        requestCaller.addParameter(8, "String", "edoc");
        requestCaller.serviceRequest();
      } catch (e) {
        alert(e);
      } //跟踪代码结束

    }
  }
}

function moreCondition(moreInfo, readonly) {
  var readOnly = readonly ? readonly : false;
  var link = genericControllerURL + "collaboration/templete/moreCondition&moreInfo=" + encodeURIComponent(moreInfo) + "&readonly=" + readOnly; //var link = genericControllerURL + "collaboration/templete/moreCondition&moreInfo="+encodeURIComponent(moreInfo);

  var moreCondition = v3x.openWindow({
    url: link,
    width: 230,
    height: 195,
    scrollbars: "no"
  });
  return moreCondition;
}

function hiddenFailedCondition(nodeId) {
  var showDiv = document.getElementById("d" + nodeId);
  var hiddenDiv = document.getElementById('failedCondition');

  if (showDiv && hiddenDiv) {
    hiddenDiv.innerHTML += showDiv.outerHTML;
    showDiv.outerHTML = "";
  }

  hiddenDiv = document.getElementById('failedConditionSelector');

  if (hiddenDiv) {
    showDiv = document.getElementById("selector" + nodeId);

    if (showDiv) {
      hiddenDiv.innerHTML += showDiv.outerHTML;
      showDiv.outerHTML = "";
    }
  }

  var showDiv = document.getElementById("aDiv");
  if (showDiv && showDiv.style.display == "none") showDiv.style.display = "";
}

function showFailedCondition(labelObj) {
  //获得不符合条件的分支Div标签
  var failedConditionDiv = document.getElementById("failedCondition"); //这个DIV好像没什么作用？

  var failedSelectorDiv = document.getElementById("failedConditionSelector"); //显示不满足条件链接信息

  var aDiv = document.getElementById("aDiv");
  var lgdObj = document.getElementById("lgd");

  if (failedConditionDiv && failedConditionDiv.style.display == "none") {
    failedConditionDiv.style.display = "";

    if (failedSelectorDiv) {
      failedSelectorDiv.style.display = "";
    }

    if (lgdObj) {
      lgdObj.style.display = "none";
    }

    aDiv.innerHTML = hideLabel;
  } else {
    if (failedConditionDiv) {
      failedConditionDiv.style.display = "none";
    }

    if (failedSelectorDiv) {
      failedSelectorDiv.style.display = "none";
    }

    if (lgdObj) {
      lgdObj.style.display = "block";
    }

    aDiv.innerHTML = showLabel;
  }
}

function getFieldValueForFlow(fieldName) {
  if (self.location.href.search("method=showDiagram") != -1) {
    return parent.detailMainFrame.contentIframe.getFieldValueForFlow(fieldName);
  }

  var objValue = "";
  var inputObj = document.getElementById("my:" + fieldName);

  if (inputObj != null) {
    objValue = _getObjValue(inputObj);
  }

  return objValue;
}

function _getObjValue(inputObj) {
  var inputValue = "";

  if (inputObj.tagName == "INPUT" && inputObj.type == "text") {
    if (inputObj.getAttribute("realValue")) inputValue = inputObj.getAttribute("realValue");else inputValue = inputObj.value;
  } else if (inputObj.tagName == "SELECT") {
    inputValue = inputObj.options[inputObj.selectedIndex].value;
  }

  return inputValue;
}

function include(arr, id) {
  if (!arr) return false;

  for (var i in arr) {
    if (i == id) return true;
  }

  return false;
}

function exclude(arr, id) {
  return !include(arr, id);
}
/**
 *发起/处理时显示分支描述
 */


function showBranchDesc(linkId, templateId) {
  if (!templateId) {
    var parentWin = window.dialogArguments;
    var desc = "";

    if (parentWin && parentWin.branchs) {
      var branch = parentWin.branchs[linkId];
      if (branch) desc = branch.conditionDesc;
    }

    moreCondition(desc, true);
  } else {
    //待发时不能从页面取描述信息，只能到数据库中取
    var rv = v3x.openWindow({
      url: templeteURL + "?method=showBranchDesc&readonly=true&linkId=" + linkId + "&templateId=" + templateId,
      width: 230,
      height: 195,
      scrollbars: "no"
    });
  }
} //分枝代码结束


function SendBulltinResult(errMsg) {
  if (errMsg == "") {
    alert(_("edocLang.TransmitBulletin_Success"));
  } else {
    alert(errMsg);
  }
} //检查正文是否被修改


function ocxContentIsModify() {
  var bodyType = document.getElementById("bodyType").value;

  if (bodyType == "HTML" || bodyType == 'Pdf' || bodyType == 'gd') {
    return contentUpdate;
  } else {
    // todo zl 暂时返回false  isModified  不兼容
    return false; // return _officeSDK.isModified();
  }
} //多级会签


function addMoreSign(_summary_id, _processId, _affairId) {
  if (!checkModifyingProcessAndLock(processId, summary_id)) {
    return;
  }

  selectPeopleFun_addMoreSign();
} //多级会签div实现


var addMoreSignResult_win;

function addMoreSignResult(elements) {
  if (v3x.getBrowserFlag('pageBreak')) {
    var rv = v3x.openWindow({
      url: genericURL + "?method=preAddMoreSign&selObj=" + getIdsString(elements) + "&appName=" + NPSAppName + "&summary_id=" + summaryId,
      height: 350,
      width: 500
    });
  } else {
    if (addMoreSign_win) {
      addMoreSign_win.close();
    }

    addMoreSignResult_win = v3x.openDialog({
      id: "addMoreSignResult",
      title: v3x.getMessage("edocLang.morepeople"),
      url: genericURL + "?method=preAddMoreSign&selObj=" + getIdsString(elements) + "&appName=" + NPSAppName + "&summary_id=" + summaryId,
      height: 350,
      width: 500
    });
  }
}

function disabledPrecessButtonEdoc() {
  try {
    disableButton("processButton");
  } catch (e) {}

  try {
    disableButton("zcdbButton");
  } catch (e) {}

  try {
    disableButton("zcdbAdviceA");
  } catch (e) {}

  try {
    disableButton("stepBackSpan");
  } catch (e) {}

  try {
    disableButton("spanSpecifiesReturn");
  } catch (e) {}

  try {
    disableButton("stepStopSpan");
  } catch (e) {}

  try {
    disableButton("divCancelButton");
  } catch (e) {}

  try {
    disableButton("divTurnRecEdocButton");
  } catch (e) {}

  try {
    disableButton("divAddNodeButton");
  } catch (e) {}

  try {
    disableButton("divSuperviseSetButton");
  } catch (e) {}

  try {
    disableButton("divEditButton");
  } catch (e) {}

  try {
    disableButton("divAllowUpdateAttachmentButton");
  } catch (e) {}

  try {
    disableButton("divRemoveNodeButton");
  } catch (e) {}

  try {
    disableButton("divForwardButton");
  } catch (e) {}

  try {
    disableButton("divWordNoChangeButton");
  } catch (e) {}

  try {
    disableButton("divEdocTemplateButton");
  } catch (e) {}

  try {
    disableButton("divReturnButton");
  } catch (e) {}

  try {
    disableButton("divJointSignButton");
  } catch (e) {}

  try {
    disableButton("divInfomButton");
  } catch (e) {}

  try {
    disableButton("divMoreSignButton");
  } catch (e) {}

  try {
    disableButton("divUpdateFormButton");
  } catch (e) {}

  try {
    disableButton("divSignButton");
  } catch (e) {}

  try {
    disableButton("divDepartPigeonholeButton");
  } catch (e) {}

  try {
    disableButton("divScriptTemplateButton");
  } catch (e) {}

  try {
    disableButton("divPassReadButton");
  } catch (e) {}

  try {
    disableButton("divHtmlSignButton");
  } catch (e) {}

  try {
    disableButton("divTransmitBulletinButton");
  } catch (e) {}

  try {
    disableButton("divTanstoPDFButton");
  } catch (e) {}

  try {
    disableButton("divTransformButton");
  } catch (e) {}

  try {
    disableButton("divTransferButton");
  } catch (e) {}
}

function enablePrecessButtonEdoc() {
  try {
    enableButton("processButton");
  } catch (e) {}

  try {
    enableButton("zcdbButton");
  } catch (e) {}

  try {
    enableButton("zcdbAdviceA");
  } catch (e) {}

  try {
    enableButton("stepBackSpan");
  } catch (e) {}

  try {
    enableButton("spanSpecifiesReturn");
  } catch (e) {}

  try {
    enableButton("stepStopSpan");
  } catch (e) {}

  try {
    enableButton("divCancelButton");
  } catch (e) {}

  try {
    enableButton("divTurnRecEdocButton");
  } catch (e) {}

  try {
    enableButton("divAddNodeButton");
  } catch (e) {}

  try {
    enableButton("divSuperviseSetButton");
  } catch (e) {}

  try {
    enableButton("divEditButton");
  } catch (e) {}

  try {
    enableButton("divAllowUpdateAttachmentButton");
  } catch (e) {}

  try {
    enableButton("divRemoveNodeButton");
  } catch (e) {}

  try {
    enableButton("divForwardButton");
  } catch (e) {}

  try {
    enableButton("divWordNoChangeButton");
  } catch (e) {}

  try {
    enableButton("divEdocTemplateButton");
  } catch (e) {}

  try {
    enableButton("divReturnButton");
  } catch (e) {}

  try {
    enableButton("divJointSignButton");
  } catch (e) {}

  try {
    enableButton("divInfomButton");
  } catch (e) {}

  try {
    enableButton("divMoreSignButton");
  } catch (e) {}

  try {
    enableButton("divUpdateFormButton");
  } catch (e) {}

  try {
    enableButton("divSignButton");
  } catch (e) {}

  try {
    enableButton("divDepartPigeonholeButton");
  } catch (e) {}

  try {
    enableButton("divScriptTemplateButton");
  } catch (e) {}

  try {
    enableButton("divPassReadButton");
  } catch (e) {}

  try {
    enableButton("divHtmlSignButton");
  } catch (e) {}

  try {
    enableButton("divTransmitBulletinButton");
  } catch (e) {}

  try {
    enableButton("divTanstoPDFButton");
  } catch (e) {}

  try {
    enableButton("divTransformButton");
  } catch (e) {}

  try {
    enableButton("divTransferButton");
  } catch (e) {}

  if (typeof submitCount != "undefined") {
    submitCount = false;
  }
}

function unescapeHTMLToString(str) {
  if (!str) {
    return "";
  }

  str = str.replace("&amp;", "&");
  str = str.replace("&lt;", "<");
  str = str.replace("&gt;", ">");
  str = str.replace("<br>", "");
  str = str.replace("&#039;", "\'");
  str = str.replace("&#034;", "\"");
  return str;
}

function showProcessLog(processId) {
  var url = processLogURL + "?method=processLogIframe&processId=" + processId;
  var rv = getA8Top().v3x.openWindow({
    url: url,
    dialogType: "open",
    width: "800",
    height: "600"
  });
}

function checkMarkHistoryExist(markType, edocMarkHistory, edocId, orgAccountId) {
  try {
    var _isUsed = _checkEdocMarkIsUsed(markType, edocMarkHistory, edocId, orgAccountId);

    if (_isUsed) {
      alert(_("edocLang.doc_mark_alter_used"));
      return true;
    }
  } catch (ex1) {
    alert("Exception : " + ex1);
    return true;
  }

  return false;
}

function preChangeTrack(affairId, isTrack, isfinish) {
  var trackValue = '0';

  if (isTrack) {
    trackValue = isTrack;
  }

  window.preChangeTrackWin = getA8Top().$.dialog({
    //  url: genericControllerURL + "collaboration/preChangeTrack&affairId="+affairId+"&trackValue="+trackValue,
    title: V5_Edoc().$.i18n("common.track.setting"),
    //跟踪设置
    url: "edocController.do?method=preChangeTrack&affairId=" + affairId + "&trackValue=" + trackValue,
    transParams: {
      'parentWin': window,
      "popWinName": "preChangeTrackWin",
      "popCallbackFn": preChangeTrackCallback
    },
    width: "300",
    height: "185"
  });
}
/**
 * 在列表点击跟踪
 * @param rv
 */


function preChangeTrackCallback(rv) {
  if (!rv) {
    refreshIt();
  }
}

function refreshIt() {
  location.reload(true);
} //检查某人是否是某公文的督办人。。
//0 :被取消了督办权限 。1：仍然是督办人。


function isStillSupervisor(summaryId) {
  alert("isStillSupervisor=" + isStillSupervisor);
  /*try {
     var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocSuperviseManager", "isSupervisorOfOneSummary", false);
     requestCaller.addParameter(1, "String", summaryId);
     var rs = requestCaller.serviceRequest();
     alert(rs);
     if(rs == "0"){
       alert(_("edocLang.edoc_alert_not_supervise"));
       return false;
     }
   }
   catch (ex1) {
     alert("Exception : " + ex1);
     return false;
   } */

  return true;
}
/**
 * 检查正文是否存在并发修改。
 */


function checkConcurrentModifyForHtmlContent(contentId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxHandWriteManager", "editObjectState", false);
  requestCaller.addParameter(1, "String", contentId);
  var ds = requestCaller.serviceRequest();

  if (ds.get("curEditState") == "true") {
    //:(getOfficeLanguage("用户")+ds.get("userName")+getOfficeLanguage("正在编辑此文件，不能修改！"));
    alert(v3x.getMessage("V3XOfficeLang.alert_NotEdit", ds.get("userName")));
    return true;
  }

  return false;
}
/**
 * 解锁HTML正文
 */


function unlockHtmlContent(summaryId) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxHandWriteManager", "deleteUpdateObj", false);
  requestCaller.addParameter(1, "String", summaryId);
  var ds = requestCaller.serviceRequest();
}

function checkEdocMark(edocMarkObj, innerMark) {
  if (!edocMarkObj) {
    edocMarkObj = document.getElementById("my:doc_mark");
  }

  if (edocMarkObj) {
    //文号必填项判断
    if (edocMarkObj.getAttribute('access') == "edit" && edocMarkObj.getAttribute('required') == 'true' && (edocMarkObj.value == " " || edocMarkObj.value == "")) {
      _focusEdocMark(edocMarkObj);

      alert(v3x.getMessage("edocLang.doc_mark_alter_not_null"));
      return false;
    }

    if (!isEdocMarkWellFormated(edocMarkObj.value)) {
      _focusEdocMark(edocMarkObj);

      return false;
    }

    var edocMark = _getWordNoValue(edocMarkObj);

    if (edocMark && edocMark.length > 66) {
      _focusEdocMark(edocMarkObj);

      alert(v3x.getMessage("edocLang.mark_alter_exceed"));
      return false;
    }
  }

  if (!innerMark) {
    edocMarkObj = document.getElementById("my:serial_no");
  } else {
    edocMarkObj = innerMark;
  }

  if (edocMarkObj) {
    //文号必填项判断
    if (edocMarkObj.getAttribute('access') == "edit" && edocMarkObj.getAttribute('required') == 'true' && (edocMarkObj.value == " " || edocMarkObj.value == "")) {
      _focusEdocMark(edocMarkObj);

      alert(v3x.getMessage("edocLang.edoc_serial_no_alter_not_null"));
      return false;
    }
  }

  if (edocMarkObj && edocMarkObj.value) {
    if (!isEdocMarkWellFormated(edocMarkObj.value)) return false;
    var innerMark = "";

    if (edocMarkObj.value.indexOf("|") == -1) {
      innerMark = edocMarkObj.value;
    } else {
      var arr = edocMarkObj.value.split("|");
      if (arr && arr.length > 1) innerMark = arr[1];
    }

    if (innerMark.length > 66) {
      _focusEdocMark(edocMarkObj);

      alert(v3x.getMessage("edocLang.innermark_alter_exceed"));
      return false;
    }
  }

  return true;
}

function _focusEdocMark(edocMarkObj) {
  if (edocMarkObj) {
    var markId = edocMarkObj.getAttribute("id");
    var autoMarkId = markId + "_autocomplete";
    var autoEle = document.getElementById(autoMarkId);

    if (autoEle) {
      autoEle.focus();
    } else {
      edocMarkObj.focus();
    }
  }
}

function updateAtt(summaryId, processId) {
  var puobj = getProcessAndUserId(); //修改正文加锁
  //var re = EdocLock.lockWorkflow(puobj.processId, puobj.currentUser,EdocLock.UPDATE_CONTENT);
  //正文锁和流程锁分离，这里要传入summaryId

  var re = EdocLock.lockWorkflow(summaryId, puobj.currentUser, EdocLock.UPDATE_CONTENT);

  if (re[0] == "false") {
    parent.parent.$.alert(re[1]);
    return;
  }

  var subState = document.getElementById("affState").value;

  if (subState == '15'
  /* || subState=='16' || subState=='17'*/
  ) {
    alert(v3x.getMessage("edocLang.edoc_updateAtt_validate"));
    return;
  }

  var puobj = getProcessAndUserId(); //修改附件加锁

  var re = EdocLock.lockWorkflow(summaryId, puobj.currentUser, EdocLock.UPDATE_ATT);

  if (re[0] == "false") {
    parent.parent.$.alert(re[1]);
    return;
  }

  var attList = getAttachment(summaryId, summaryId);
  editAttachments(attList, summaryId, summaryId, '4', updateAttCallBack); //上传完附件后，关闭窗口后不需要解锁了，需要处理页面关闭后才解锁
}

function updateAttCallBack(result) {
  if (result) {
    updateAttachmentMemory(result, summaryId, summaryId, '');
    showAttachment(summaryId, 2, 'attachment2TrContent', 'attachment2NumberDivContent', 'attachmentHtml2Span');
    showAttachment(summaryId, 0, 'attachmentTrContent', 'attachmentNumberDivContent', 'attachmentHtml1Span'); // changyi add 显示附件(开始没有附件时就不显示)

    if (theToShowAttachments) {
      var attachmentNumber = 0;

      for (var i = 0; i < theToShowAttachments.size(); i++) {
        var att = theToShowAttachments.get(i);

        if (att.subReference == summaryId || att.type == 'checkbox') {
          attachmentNumber++;
        }
      }

      if (attachmentNumber > 0) {
        var tt = document.getElementById("attachment2Tr");

        if (tt) {
          tt.style.display = "";
        }
      }
    }
  }

  if (typeof windowResizeTop != 'undefined') {
    windowResizeTop();
  }
}
/**
 * 对归档Select对象的不同选择做出不同的操作
 *
 * @param obj : 当前下拉选择框对象
 * @param appName : 应用名
 * @param from : 来源（模板、处理页面）
 * @param formObj : form对象
 */


function pigeonholeEvent(obj, appName, from, formObj) {
  switch (obj.selectedIndex) {
    case 0:
      var oldArchiveId = formObj.archiveId.value;

      if (oldArchiveId != "") {
        formObj.archiveId.value = "";
      }

      break;

    case 1:
      doPigeonhole('new', appName, from, formObj, function () {});
      break;

    default:
      formObj.archiveId.value = document.getElementById("prevArchiveId").value;
      return;
  }
}
/**
 * 弹出归档选择文件路径界面
 * @param obj : 当前下拉选择框对象
 * @param appName : 应用名
 * @param from : 来源（模板、处理页面）
 * @param formObj : form对象
 * @param afterMehod : 修改Chrome37后，该方法调用的地方将进行两节处理
 */


var doPigeonholeCallbackformObj = null;
var doPigeonholeCallbackAfterMehod = null;

function doPigeonhole(flag, appName, from, formObj, afterMehod) {
  if (!formObj) // 已办公文页面单位归档
    formObj = document.getElementById("listForm") || document.getElementById("sendForm"); // OA-4808
  // 新建流程模版，设置预归档路径，前台调用，正常显示无，但是置灰了，不能修改

  if (flag == "no") {// TODO 清空信息
  } else if (flag == "new") {
    var result;
    doPigeonholeCallbackformObj = formObj;
    doPigeonholeCallbackAfterMehod = afterMehod;

    if (from == "templete") {
      // 公文模板预归档
      result = pigeonhole(appName, null, false, false, 'EdocTempletePrePigeonhole', 'doPigeonholeCallback');
    } else {
      result = pigeonhole(appName, null, false, true, 'EdocAccountPigoenhole', 'doPigeonholeCallback');
    }
  }
}
/**
 * 归档回调函数
 */


function doPigeonholeCallback(result) {
  if (result == "cancel") {
    var oldPigeonholeId = doPigeonholeCallbackformObj.archiveId.value;
    var selectObj = doPigeonholeCallbackformObj.selectPigeonholePath;

    if (selectObj) {
      // 存在下拉选择框的情况
      if (oldPigeonholeId != "" && selectObj.options.length >= 3) {
        selectObj.options[2].selected = true;
      } else {
        var oldOption = document.getElementById("defaultOption");
        oldOption.selected = true;
      }
    }

    return;
  }

  var pigeonholeData = result.split(",");
  pigeonholeId = pigeonholeData[0];
  pigeonholeName = pigeonholeData[1];

  if (pigeonholeId == "" || pigeonholeId == "failure") {
    doPigeonholeCallbackformObj.archiveName.value = "";
    alert(v3x.getMessage("collaborationLang.collaboration_alertPigeonholeItemFailure"));
  } else {
    var oldPigeonholeId = doPigeonholeCallbackformObj.archiveId.value;
    doPigeonholeCallbackformObj.archiveId.value = pigeonholeId;

    if (document.getElementById("prevArchiveId")) {
      document.getElementById("prevArchiveId").value = pigeonholeId;
    }

    var selectObj = document.getElementById("selectPigeonholePath");

    if (selectObj) {
      var option = document.createElement("OPTION");
      option.id = pigeonholeId;
      option.text = pigeonholeName;
      option.value = pigeonholeId;
      option.selected = true;

      if (oldPigeonholeId == "" && selectObj.options.length <= 2) {
        selectObj.options.add(option, selectObj.options.length);
      } else {
        selectObj.options[selectObj.options.length - 1] = option;
      }
    }
  }

  if (doPigeonholeCallbackAfterMehod) {
    doPigeonholeCallbackAfterMehod();
  }
}
/**
 * 根据文档的逻辑路径取文档的真实路径
 * @param logicalPath :逻辑路径
 */


function showWholePath(logicalPath, callObj) {
  if (logicalPath == '') return;
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "getPhysicalPath", false);
  requestCaller.addParameter(1, "String", logicalPath);
  requestCaller.addParameter(2, 'String', "\\");
  requestCaller.addParameter(3, 'boolean', false);
  requestCaller.addParameter(4, 'int', 0);
  var rs = requestCaller.serviceRequest();
  callObj.title = rs;
} //批处理


function batchEdoc() {
  var checkBoxs = document.getElementsByName("id");

  if (!checkBoxs) {
    alert(_("edocLang.batch_select_affair"));
    return;
  }

  var process = new BatchProcess();

  for (var i = 0; i < checkBoxs.length; i++) {
    if (checkBoxs[i].checked) {
      var affairId = checkBoxs[i].getAttribute("affairId");
      var subject = checkBoxs[i].getAttribute("subject");
      var app = "4";
      process.addData(affairId, checkBoxs[i].value, app, subject);
    }
  }

  if (!process.isEmpty()) {
    var r = process.doBatch("getA8Top().contentFrame.topFrame.refreshWorkspace()");
  } else {
    alert(_("edocLang.batch_select_affair"));
    return;
  }
}

function opinionInputWindow(tempOpinion, canUploadRel, relAttButton, canUploadAttachment, attButton, attContfileUpload, attitude, commonPhrase) {
  var window = "<table id='opinionInputArea' width='100%'  border='0' cellspacing='0' cellpadding='0' class='sign-area'>";
  window += "<tr>";
  window += "<td align='left'>" + attitude + "</td>"; //态度

  window += "<td align='right'>" + commonPhrase + "</td>";
  window += "</tr>";
  window += "<tr><td colspan='2'>";
  window += "<textarea id='content' name='content' rows='5' style='width: 100%' validate='maxLength' maxSize='2000'>" + tempOpinion + "</textarea>";
  window += "</td></tr>"; //推送消息

  window += "<tr><td colspan='2' align='right'>";
  window += pushMessage;
  window += "</td></tr>";

  if (canUploadRel || canUploadAttachment) {
    window += "<tr><td colspan='2' style='padding: 5px 10px;'>";
    window += "<div height='36'>";

    if (canUploadRel) {
      window += relAttButton + "&nbsp;&nbsp;";
    }

    if (canUploadAttachment) {
      window += attButton;
    }

    window += "</div>";
    window += "</td></tr>";
    window += "<tr><td colspan='2'>";
    window += ' <div id="attachment2Area" style="overflow: auto;"></div>';
    window += ' <div id="attachmentInputs"></div>';
    window += attContfileUpload;
    window += '</td></tr></table>';
  }

  return window;
}

function showSupervise(summaryId, openModal) {
  if (v3x.getBrowserFlag('openWindow') == true) {
    window.v3x.openWindow({
      url: genericURL + "?method=superviseDiagram&summaryId=" + summaryId + "&openModal=" + openModal,
      dialogType: "modal",
      width: "350",
      height: "450"
    });
  } else {
    getA8Top().v3x.openWindow({
      url: genericURL + "?method=superviseDiagram&summaryId=" + summaryId + "&openModal=" + openModal,
      dialogType: "1",
      width: "350",
      height: "450"
    });
  }
}
/**
 * 查看属性
 */


function showAttribute(affairId, from) {
  if (window.v3x) {
    window.v3x.openWindow({
      url: ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocController.do?method=getAttributeSettingInfo&openFrom=edoc&affairId=" + affairId + CsrfGuard.getUrlSurffix(),
      dialogType: v3x.getBrowserFlag('openWindow') == true ? "modal" : "1",
      width: "350",
      height: "400"
    });
  } else {
    getA8Top().v3x.openWindow({
      url: ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocController.do?method=getAttributeSettingInfo&openFrom=edoc&affairId=" + affairId + CsrfGuard.getUrlSurffix(),
      dialogType: v3x.getBrowserFlag('openWindow') == true ? "modal" : "1",
      width: "350",
      height: "400"
    });
  }
}
/**
 * 转会议接口，页面之间跳转到新建会议页面
 * @param affairId
 * @param collaborationFrom
 * @param frameObj     需要跳转到新建会议的框架
 * @param closeWin     是否关闭当前窗口，true：关闭；false：不关闭
 */


function createMeeting(affairId, collaborationFrom) {
  var url = _ctxPath + "/meeting.do?method=editor&affairId=" + affairId + "&moduleType=4";
  openCtpWindow({
    "url": url,
    "id": affairId + "createMeeting"
  });
}

function getSelectIds(frame) {
  var ids = frame.document.getElementsByName('id');
  var id = '';

  for (var i = 0; i < ids.length; i++) {
    var idCheckBox = ids[i];

    if (idCheckBox.checked) {
      if (id == '') {
        id = idCheckBox.value;
      } else {
        id += ',' + idCheckBox.value;
      }
    }
  }

  return id;
}
/***阅文批处理**/


function readBatch() {
  var checkBoxs = document.getElementsByName("id"); //if(!checkBoxs){
  //alert(_("collaborationLang.batch_select_affair"));
  //return ;
  //}

  var process = new BatchProcess();

  for (var i = 0; i < checkBoxs.length; i++) {
    if (checkBoxs[i].checked) {
      var affairId = checkBoxs[i].getAttribute("affairId");
      var subject = checkBoxs[i].getAttribute("colSubject");
      var app = checkBoxs[i].getAttribute("category") || "1";
      process.addData(affairId, checkBoxs[i].value, app, subject);
    }
  }

  if (!process.isEmpty()) {
    var r = process.doBatch("getA8Top().contentFrame.topFrame.refreshWorkspace()");
  } else {
    alert(_("collaborationLang.batch_select_affair"));
    return;
  }
}
/***
 * 彈出閱文批量分發界面
 */


function showReadBatchWD(canSelfCreateFlow) {
  var checkObj;
  var checkbox = document.getElementsByName("id");
  var checkedNum = 0;
  var objs = [];
  var len = checkbox.length;

  for (var i = 0; i < len; i++) {
    if (checkbox[i].checked) {
      objs[checkedNum] = checkbox[i];
      checkedNum++;

      if (checkedNum == 1) {
        checkObj = checkbox[i];
      }
    }
  }

  if (objs.length < 1) {
    alert(V5_Edoc().$.i18n("edoc.alert.choose.plff")); //请选择要进行批量分发的数据

    return;
  }

  if (!canSelfCreateFlow) {
    alert(V5_Edoc().$.i18n("edoc.alert.zjlc")); //不允许自建流程

    return;
  }

  var registerStr = "";

  for (var i = 0; i < objs.length; i++) {
    if (registerStr == "") {
      registerStr += objs[i].getAttribute("registerId");
    } else {
      registerStr += "&" + objs[i].getAttribute("registerId");
    }
  }

  var registerObj = $("#registerStr");
  registerObj.val(registerStr);

  var _url = genericURL + "?method=readBatchWDRegist&openType=fenfa";

  var dialogObj = V5_Edoc().$.dialog({
    id: 'edocReadBachRegistDialog',
    htmlId: 'searchId',
    title: V5_Edoc().$.i18n("edoc.title.receicing.batch"),
    //收文批量分发
    url: _url,
    targetWindow: window.parent.top,
    buttons: [{
      id: "okButton",
      text: V5_Edoc().$.i18n("common.button.ok.label"),
      handler: function handler() {
        var retValue = dialogObj.getReturnValue();

        if (retValue != "" && retValue != "-1") {
          // 隐藏域的form表单
          var theForm = $("#readBatchForm");

          var _sendUrl = genericURL + "?method=readBatch";

          theForm.attr("action", _sendUrl);
          theForm.attr("method", "post");
          $("#processXml").attr("value", retValue[0]);
          $("#comment").attr("value", retValue[1]);
          theForm.submit();
          dialogObj.close();
        }
      },
      OKFN: function OKFN() {
        dialogObj.close();
      }
    }, {
      id: "cancelButton",
      text: V5_Edoc().$.i18n("common.button.cancel.label"),
      handler: function handler() {
        dialogObj.close();
      }
    }]
  });
}
/***
 * 彈出阅文批量登记界面
 */


function showReadBatchWDRegist(canSelfCreateFlow) {
  var checkObj;
  var checkbox = document.getElementsByName("id");
  var checkedNum = 0;
  var objs = [];
  var len = checkbox.length;

  for (var i = 0; i < len; i++) {
    if (checkbox[i].checked) {
      objs[checkedNum] = checkbox[i];
      checkedNum++;

      if (checkedNum == 1) {
        checkObj = checkbox[i];
      }
    }
  }

  if (objs.length < 1) {
    alert(V5_Edoc().$.i18n("edoc.alert.pldj")); //请选择要进行批量登记的数据

    return;
  }

  if (!canSelfCreateFlow) {
    alert(V5_Edoc().$.i18n("edoc.alert.zjlc")); //不允许自建流程

    return;
  }

  var registerStr = "";

  for (var i = 0; i < objs.length; i++) {
    if (registerStr == "") {
      registerStr += objs[i].value;
    } else {
      registerStr += "&" + objs[i].value;
    }
  }

  var registerObj = $("#registerStr");
  registerObj.val(registerStr);

  var _url = genericURL + "?method=readBatchWDRegist&openType=dengji";

  var dialogObj = V5_Edoc().$.dialog({
    id: 'edocReadBachRegistDialog',
    htmlId: 'searchId',
    title: V5_Edoc().$.i18n("edoc.toolbar.batchRegist.label"),
    //阅文批量登记
    url: _url,
    buttons: [{
      id: "okButton",
      text: V5_Edoc().$.i18n("common.button.ok.label"),
      handler: function handler() {
        var retValue = dialogObj.getReturnValue();

        if (retValue != "" && retValue != "-1") {
          // 隐藏域的form表单
          var theForm = $("#readBatchRegistForm");

          var _sendUrl = genericURL + "?method=readBatchRegist";

          theForm.attr("action", _sendUrl);
          theForm.attr("method", "post");
          $("#processXml").attr("value", retValue[0]);
          $("#comment").attr("value", retValue[1]);
          theForm.submit();
          dialogObj.close();
        }
      },
      OKFN: function OKFN() {
        dialogObj.close();
      }
    }, {
      id: "cancelButton",
      text: V5_Edoc().$.i18n("common.button.cancel.label"),
      handler: function handler() {
        dialogObj.close();
      }
    }]
  });
}
/**
 * 页面校验
 */


function checkFormBacth() {
  var val = document.getElementById("note").value;
  var valfw = document.getElementById("workflowInfo").value;

  if (valfw == V5_Edoc().$.i18n("govdoc.process.new")) {
    alert(_("edocLang.edoc_selectWorkflow"));
    return;
  }

  var _parent = window.opener;

  if (_parent == null) {
    _parent = window.dialogArguments;
  }

  _parent.document.getElementById("note").value = val;
  window.returnValue = "True";
  window.close();
}

function setBatchPeopleFields(elements, frameNames) {
  //alert(elements);
  //alert(frameNames);
  var _parent = window.opener;

  if (_parent == null) {
    _parent = window.dialogArguments;
  }

  var theForm = _parent.document.getElementsByName("sendForm")[0];

  theForm.document.getElementById("people").innerHTML = "";

  if (!elements) {
    return false;
  }

  var personList = elements[0] || [];
  var flowType = elements[1] || 0;
  var isShowShortName = elements[2];
  var isShowWorkflow = flowType == "2"; //多层

  if (isShowWorkflow) {
    flowType = 0;
    elements[1] = 0;
  }

  var str = "";
  var workFlowContent = "";

  for (var i = 0; i < personList.length; i++) {
    if (i > 0) {
      workFlowContent += ",";
    }

    var person = personList[i];
    str += '<input type="text" name="userType" value="' + person.type + '" />';
    str += '<input type="text" name="userId" value="' + person.id + '" />';
    str += '<input type="text" name="userName" value="' + escapeStringToHTML(person.name) + '" />';
    str += '<input type="text" name="accountId" value="' + person.accountId + '" />';
    str += '<input type="text" name="accountShortname" value="' + escapeStringToHTML(person.accountShortname) + '" />';
    workFlowContent += person.name + "(" + defaultPermName + ")";
  }

  str += '<input type="text" name="flowType" value="' + flowType + '" />';
  _parent.document.getElementById("people").innerHTML = str;
  hasWorkflow = true;
  isFromTemplate = false;
  document.getElementById("workflowInfo").value = workFlowContent;
  _parent.document.getElementById("workflowInfo").value = workFlowContent;
  _parent.theForm.process_desc_by.value = 'people'; //

  window.selectedElements = elements;

  if (isShowWorkflow) {
    //显示流程
    designWorkFlow(frameNames);
  }

  return true;
} //点击归档编辑图标编辑已归档公文单


function editFromArchived(edoctype) {
  //	if(!$.browser.msie){
  //		alert(v3x.getMessage("edocLang.isNotIe"));
  //		return;
  //	}
  try {
    var id_checkbox = document.getElementsByName("id");

    if (!id_checkbox) {
      return;
    }

    var count = validateCheckbox("id");

    if (count == 1) {
      for (var i = 0; i < id_checkbox.length; i++) {
        var idCheckBox = id_checkbox[i];

        if (idCheckBox.checked) {
          //验证正文中是否盖过专业html签章
          //判断公文是否已经分发，已分发的不能修改了
          var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkHasSignaturehtml", false);
          requestCaller.addParameter(1, "long", idCheckBox.value);
          var rs = requestCaller.serviceRequest();

          if (rs == "yes") {
            alert(v3x.getMessage("edocLang.edoc_alertCantModifyBecauseOfIsignature"));
            return;
          }
          /*var finishedValue=idCheckBox.getAttribute("finished");
               if(finishedValue != "true"){
               	alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
               	return;
               }*/


          var noFinishedValue = checkIsCanBeRepealed(idCheckBox.value); //没结束的公文，返回Y（共用撤销的ajax方法来判断）

          if ("Y" == noFinishedValue) {
            alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
            return;
          }

          var hasArchivedValue = idCheckBox.getAttribute("hasArchive");

          if (hasArchivedValue != "true") {
            alert(v3x.getMessage("edocLang.edoc_unitArchivedModify_alter_not_modify"));
            return;
          }

          var summaryId = idCheckBox.value;
          var affairId = idCheckBox.getAttribute("affairId"); //判断公文是否已经分发，已分发的不能修改了

          var requestCaller = new XMLHttpRequestCaller(this, "sendEdocManager", "isCanModifyDoneSummay", false);
          requestCaller.addParameter(1, "long", summaryId);
          var rs = requestCaller.serviceRequest();

          if (rs == "no") {
            alert(V5_Edoc().$.i18n("edoc.alert.modify.exchange")); //公文已经交换了，不能修改!

            return;
          }

          location.href = genericURL + "?method=newEdoc&notOpenSave=true&summaryId=" + summaryId + "&from=archived&affairId=" + affairId + "&edocType=" + edoctype + CsrfGuard.getUrlSurffix();
        }
      }
    } else if (count == 0) {
      alert(v3x.getMessage("edocLang.edoc_alertSelectEditItem"));
      return;
    } else {
      alert(v3x.getMessage("edocLang.edoc_alertDontSelectMulti"));
      return;
    }
  } catch (e) {}
} //点击归档修改历史


function showArchiveModifyLog() {
  try {
    var id_checkbox = document.getElementsByName("id");

    if (!id_checkbox) {
      return;
    }

    var count = validateCheckbox("id");

    if (count == 1) {
      for (var i = 0; i < id_checkbox.length; i++) {
        var idCheckBox = id_checkbox[i];

        if (idCheckBox.checked) {
          /*var finishedValue=idCheckBox.getAttribute("finished");
               if(finishedValue != "true"){
               	alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
               	return;
               }*/
          var noFinishedValue = checkIsCanBeRepealed(idCheckBox.value); //没结束的公文，返回Y（共用撤销的ajax方法来判断）

          if ("Y" == noFinishedValue) {
            alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
            return;
          }

          var hasArchivedValue = idCheckBox.getAttribute("hasArchive");

          if (hasArchivedValue != "true") {
            alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_history"));
            return;
          }

          var summaryId = idCheckBox.value;
          var url = edocURL + "?method=showArchiveModifyLog&summaryId=" + summaryId;
          getA8Top().v3x.openWindow({
            url: edocURL + "?method=showArchiveModifyLog&summaryId=" + summaryId,
            dialogType: v3x.getBrowserFlag('openWindow') == true ? "modal" : "1",
            width: "750",
            height: "500"
          });
        }
      }
    } else if (count == 0) {
      alert(v3x.getMessage("edocLang.edoc_alertSelectShowHistoryItem"));
      return;
    } else {
      alert(v3x.getMessage("edocLang.edoc_alertDontSelectMulti"));
      return;
    }
  } catch (e) {}
} //lijl添加


function showArchiveModifyLog_iframe() {
  try {
    var id_checkbox = document.getElementsByName("id");

    if (!id_checkbox) {
      return;
    }

    var count = validateCheckbox("id");

    if (count == 1) {
      for (var i = 0; i < id_checkbox.length; i++) {
        var idCheckBox = id_checkbox[i];

        if (idCheckBox.checked) {
          /*var finishedValue=idCheckBox.getAttribute("finished");
               if(finishedValue != "true"){
               	alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
               	return;
               }*/
          var noFinishedValue = checkIsCanBeRepealed(idCheckBox.value); //没结束的公文，返回Y（共用撤销的ajax方法来判断）

          if ("Y" == noFinishedValue) {
            alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_finish"));
            return;
          }

          var hasArchivedValue = idCheckBox.getAttribute("hasArchive");

          if (hasArchivedValue != "true") {
            alert(v3x.getMessage("edocLang.edoc_archivedModify_alter_not_history"));
            return;
          }

          var summaryId = idCheckBox.value;
          v3x.openWindow({
            url: edocURL + "?method=showArchiveModifyLog_Iframe&summaryId=" + summaryId,
            dialogType: "open",
            width: "750",
            height: "500"
          });
        }
      }
    } else if (count == 0) {
      alert(v3x.getMessage("edocLang.edoc_alertSelectShowHistoryItem"));
      return;
    } else {
      alert(v3x.getMessage("edocLang.edoc_alertDontSelectMulti"));
      return;
    }
  } catch (e) {}
}
/**
 * 归档修改保存
 */


function saveArchived() {
  return _saveArchived.apply(this, arguments);
} //判断文单是否被修改，只可用于newedoc


function _saveArchived() {
  _saveArchived = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
    var isFormChanged, bool, theForm, edocMarkObj, edocMark, edocType, summaryId, orgAccountId;
    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            isFormChanged = is_form_changed(); //文单是否被修改的标识，放到方法最前面，避免中间过程修改了文单

            if (checkEdocMark()) {
              _context33.next = 3;
              break;
            }

            return _context33.abrupt("return");

          case 3:
            // 验证交换单位是否有重复 -- start --
            bool = checkExchangeAccountIsDuplicatedOrNot();

            if (!(bool == false)) {
              _context33.next = 7;
              break;
            }

            alert(_("edocLang.exchange_unit_duplicated"));
            return _context33.abrupt("return");

          case 7:
            theForm = document.getElementsByName("sendForm")[0];
            theForm.action = genericURL + "?method=saveArchived" + CsrfGuard.getUrlSurffix();

            if (!(validFieldData_gov() == false)) {
              _context33.next = 11;
              break;
            }

            return _context33.abrupt("return");

          case 11:
            if (!(compareTime() == false)) {
              _context33.next = 13;
              break;
            }

            return _context33.abrupt("return");

          case 13:
            if (!checkForm(theForm)) {
              _context33.next = 40;
              break;
            }

            if (checkSubject(theForm)) {
              _context33.next = 16;
              break;
            }

            return _context33.abrupt("return");

          case 16:
            // 检查主送单位、主送单位2的是否设置有值，屏蔽，不需要验证主送单位
            //if(!checkSendUnitAndSendUnit2(theForm)){return;}
            // 检查签报公文文号是否已使用
            edocMarkObj = document.getElementById("my:doc_mark");

            if (!edocMarkObj) {
              _context33.next = 24;
              break;
            }

            edocMark = _getWordNoValue(edocMarkObj);
            edocType = document.getElementById("edocType").value;
            summaryId = document.getElementById("summaryId").value;
            orgAccountId = document.getElementById("orgAccountId").value;

            if (!(edocType == "2" && edocMark != "" && !loadAndManualSelectedPreSend && checkMarkHistoryExist(0, edocMark, summaryId, orgAccountId))) {
              _context33.next = 24;
              break;
            }

            return _context33.abrupt("return");

          case 24:
            // 保存正文
            //checkExistBody();
            //saveOffice();
            if (isFormChanged) {
              //文单修改标识
              document.getElementById("isModifyForm").value = "1";
            }

            if (ocxContentIsModify()) {
              //正文修改标识
              document.getElementById("isModifyContent").value = "1";
            }

            if (is_att_changed()) {
              //附件修改标识
              document.getElementById("isModifyAtt").value = "1";
            }

            fileId = newEdocBodyId;
            _context33.next = 30;
            return saveOcx();

          case 30:
            if (_context33.sent) {
              _context33.next = 32;
              break;
            }

            return _context33.abrupt("return");

          case 32:
            saveAttachment();
            disableButtons();
            isFormSumit = true;
            theForm.target = "_self";

            try {
              adjustReadFormForSubmit();
            } catch (e) {}

            try {
              window.onbeforeunloadEdoc = function () {};

              theForm.submit();
            } catch (e) {
              reductClick(false);
              topLinkClick(false);
            } //getA8Top().startProc('');


            reductClick(false);
            topLinkClick(false);

          case 40:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33);
  }));
  return _saveArchived.apply(this, arguments);
}

function is_form_changed() {
  var formIsChange = false;
  $("input[id^='my:']").each(function () {
    var _v = jQuery(this).attr('_value');

    if (typeof _v == 'undefined') _v = '';

    if (_v != jQuery(this).val()) {
      //alert(_v +"_"+jQuery(this).val());
      formIsChange = true;
    }
  });
  $("select[id^='my:']").each(function () {
    var _v = jQuery(this).attr('_value');

    if (typeof _v == 'undefined') _v = '';

    if (_v != jQuery(this).val()) {
      //alert(_v +"_"+jQuery(this).val());
      formIsChange = true;
    }
  });
  $("textarea[id^='my:']").each(function () {
    var _v = jQuery(this).attr('_value');

    if (typeof _v == 'undefined') _v = '';

    if (_v != jQuery(this).val()) {
      //alert(_v +"_"+jQuery(this).val());
      formIsChange = true;
    }
  });
  return formIsChange;
} //判断附件是否被修改，只可用于newedoc


function is_att_changed() {
  //关联文档
  var _v = $("#attachmentArea").attr('_value');

  var _w = $("#attachmentArea").html();

  if (typeof _v == 'undefined') _v = '';
  if (typeof _w == 'undefined') _w = '';

  if (_v != _w) {
    return true;
  } //附件


  _v = $("#attachment2Area").attr('_value');
  _w = $("#attachment2Area").html();
  if (typeof _v == 'undefined') _v = '';
  if (typeof _w == 'undefined') _w = '';

  if (_v != _w) {
    return true;
  }

  return false;
} //归档修改公文，返回


function returntolist(edocType) {
  location.href = 'edocController.do?method=listDone&edocType=' + edocType + '&list=listDone';
}

var isCombSearchFlag = false; //是否执行了组合查询

/**
 * 组合查询按钮事件,edocType 0:发文，1：收文， 2：签报;  state 1 待发,2已发,3待办,4已办
 */

function combQueryEvent(edocType, state) {
  //打开组合查询界面
  edocObj.state = state;
  openCombQuery(edocType, state);
}

function combQueryEventCallback() {
  if (!isCombSearchFlag) {
    return;
  } else {
    isCombSearchFlag = false;
  } //是否直接关闭了组合查询窗口
  //获取对象参数， 执行查询


  var combform = document.getElementById("combForm");

  if (document.getElementById("isCombSearchFlag") != null) {
    document.getElementById("isCombSearchFlag").value = "true";
  }

  document.getElementById("comb_condition").value = "1";
  document.getElementById("comb_subject").value = combQueryObj.subject;
  document.getElementById("comb_keywords").value = combQueryObj.keywords;
  document.getElementById("comb_docMark").value = combQueryObj.docMark;
  document.getElementById("comb_serialNo").value = combQueryObj.serialNo;

  if (document.getElementById("comb_createPerson") != null) {
    document.getElementById("comb_createPerson").value = combQueryObj.createPerson;
  }

  document.getElementById("comb_createTimeB").value = combQueryObj.createTimeB;
  document.getElementById("comb_createTimeE").value = combQueryObj.createTimeE;
  document.getElementById("comb_sendUnit").value = combQueryObj.sendUnit;
  document.getElementById("comb_secretLevel").value = combQueryObj.secretLevel;
  document.getElementById("comb_urgentLevel").value = combQueryObj.urgentLevel;
  document.getElementById("comb_receiveTimeB").value = combQueryObj.receiveTimeB;
  document.getElementById("comb_receiveTimeE").value = combQueryObj.receiveTimeE;
  document.getElementById("comb_registerDateB").value = combQueryObj.registerDateB;
  document.getElementById("comb_registerDateE").value = combQueryObj.registerDateE;
  document.getElementById("comb_recieveDateB").value = combQueryObj.recieveDateB;
  document.getElementById("comb_recieveDateE").value = combQueryObj.recieveDateE;

  if (document.getElementById("comb_expectprocesstimeB") != null) {
    document.getElementById("comb_expectprocesstimeB").value = combQueryObj.expectprocesstimeB;
  }

  if (document.getElementById("comb_expectprocesstimeE") != null) {
    document.getElementById("comb_expectprocesstimeE").value = combQueryObj.expectprocesstimeE;
  }

  if (document.getElementById("comb_summaryState") != null) {
    document.getElementById("comb_summaryState").value = combQueryObj.summaryState;
  }

  if (document.getElementById("comb_workflowDateB") != null) {
    document.getElementById("comb_workflowDateB").value = combQueryObj.workflowDateB;
  }

  if (document.getElementById("comb_workflowDateE") != null) {
    document.getElementById("comb_workflowDateE").value = combQueryObj.workflowDateE;
  }

  var methodStr = "";

  if (edocObj.state == 2) {
    methodStr = "listSent&edocType=" + edocObj.edocType;
    var listTypeEle = document.getElementById("listType");

    if (listTypeEle && listTypeEle.value) {
      methodStr += "&listType=" + listTypeEle.value;
    }
  } else if (edocObj.state == 3) {
    methodStr = "listPending";
  } else if (edocObj.state == 4) {
    methodStr = "listDone&edocType=" + edocObj.edocType;
    var listTypeEle = document.getElementById("listType");

    if (listTypeEle && listTypeEle.value) {
      methodStr += "&listType=" + listTypeEle.value;
    }
  } else if (edocObj.state == 5) {
    methodStr = "listZcdb";
  } else if (edocObj.state == 6) {
    methodStr = "listFinish";
  } else if (edocObj.state == 7) {
    methodStr = "listReading";
  } else if (edocObj.state == 8) {
    methodStr = "listReaded";
  }
  /** 打开进度条 */
  //try { getA8Top().startProc(); } catch(e) {}


  combform.action = edocNavigationControllerURL + "?method=" + methodStr + CsrfGuard.getUrlSurffix();
  combform.submit();
}
/**
 * 组合查询窗口,edocType 0:发文，1：收文， 2：签报;  state 1 待发,2已发,3待办,4已办
 */


function openCombQuery(edocType, state) {
  edocObj.edocType = edocType;
  var url = edocURL + "?method=openCombQuery&edocType=" + edocType + "&state=" + state + CsrfGuard.getUrlSurffix();
  var height = 190;

  if (edocType == 1) {
    height = 280;
  } else if (edocType == 2 || edocType == 0) {
    //OA-32949 ie9下的组合查询的间距改好了，却把ie8下的间距改坏了
    height = 250;
  }

  getA8Top().win123 = getA8Top().$.dialog({
    title: commonCombsearchLabel,
    transParams: {
      'parentWin': window
    },
    url: url,
    width: 500,
    height: height,
    resizable: "no"
  });
}
/**
 * 组合查询对象
 *
 */


function CombQueryObj(subject, docMark, serialNo, createPerson, createTimeB, createTimeE, secretLevel, urgentLevel, keywords, receiveTimeB, receiveTimeE, sendUnit, registerDateB, registerDateE, recieveDateB, recieveDateE, expectprocesstimeB, expectprocesstimeE, summaryState, workflowDateB, workflowDateE) {
  this.subject = subject; //标题

  this.docMark = docMark; //公文文号

  this.serialNo = serialNo; //内部文号

  this.createPerson = createPerson; //发起人

  this.createTimeB = createTimeB; //发起时间开始

  this.createTimeE = createTimeE; //发起时间结束

  this.secretLevel = secretLevel; //密级

  this.urgentLevel = urgentLevel; //紧急程度
  //以下字段发文待办已办、收文待阅已阅才有

  this.keywords = keywords; //主题词

  this.receiveTimeB = receiveTimeB; //到达时间开始

  this.receiveTimeE = receiveTimeE; //到达时间结束
  //以下收文待办已办才有

  this.sendUnit = sendUnit; //成文单位

  this.registerDateB = registerDateB; //登记时间开始

  this.registerDateE = registerDateE; //登记时间结束

  this.recieveDateB = recieveDateB; //签收时间开始

  this.recieveDateE = recieveDateE; //签收时间结束

  this.expectprocesstimeB = expectprocesstimeB; //处理期限

  this.expectprocesstimeE = expectprocesstimeE; //处理期限

  this.summaryState = summaryState; //流程状态

  this.workflowDateB = workflowDateB; //流程期限开始

  this.workflowDateE = workflowDateE; //流程期限结束
} //组合查询封装查询值对象


function addCombQueryObj(subject, docMark, serialNo, createPerson, createTimeB, createTimeE, secretLevel, urgentLevel, keywords, receiveTimeB, receiveTimeE, sendUnit, registerDateB, registerDateE, recieveDateB, recieveDateE, expectprocesstimeB, expectprocesstimeE, summaryState, workflowDateB, workflowDateE) {
  combQueryObj = new CombQueryObj(subject, docMark, serialNo, createPerson, createTimeB, createTimeE, secretLevel, urgentLevel, keywords, receiveTimeB, receiveTimeE, sendUnit, registerDateB, registerDateE, recieveDateB, recieveDateE, expectprocesstimeB, expectprocesstimeE, summaryState, workflowDateB, workflowDateE);
}

function onbeforeunloadEdoc() {
  if (clickFlag) {
    return "";
  }
}

function saveAsDraft(_x22) {
  return _saveAsDraft.apply(this, arguments);
} //退回拟稿人：拟稿人的发送动作


function _saveAsDraft() {
  _saveAsDraft = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(checkFlag) {
    var theForm, subject;
    return regeneratorRuntime.wrap(function _callee34$(_context34) {
      while (1) {
        switch (_context34.prev = _context34.next) {
          case 0:
            theForm = document.getElementsByName("sendForm")[0];
            subject = document.getElementById("my:subject");
            theForm.action = genericURL + "?method=save";

            if (!(document.getElementById("my:subject") && document.getElementById("my:subject") == "")) {
              _context34.next = 7;
              break;
            }

            document.getElementById("my:subject").value = v3x.getMessage("edocLang.edoc_please_insert_title");
            _context34.next = 10;
            break;

          case 7:
            if (!(subject != null && subject.value.length > 250)) {
              _context34.next = 10;
              break;
            }

            alert(v3x.getMessage("edocLang.edoc_subject_length"));
            return _context34.abrupt("return");

          case 10:
            if (checkSubject(theForm)) {
              _context34.next = 12;
              break;
            }

            return _context34.abrupt("return", false);

          case 12:
            //xiangfan 添加 离开页面保存时需要校验标题的特殊字符 修复GOV-4358
            if (document.getElementById("my:subject") && document.getElementById("my:subject").value == "") {
              document.getElementById("my:subject").value = v3x.getMessage("edocLang.edoc_please_insert_title");
            } //保存正文
            // checkExistBody();


            fileId = newEdocBodyId;
            _context34.next = 16;
            return saveOcx();

          case 16:
            if (_context34.sent) {
              _context34.next = 18;
              break;
            }

            return _context34.abrupt("return");

          case 18:
            saveAttachment();
            disableButtons();
            isFormSumit = true;
            theForm.target = "_self";

            try {
              adjustReadFormForSubmit();
            } catch (e) {}

            theForm.submit();

          case 24:
          case "end":
            return _context34.stop();
        }
      }
    }, _callee34);
  }));
  return _saveAsDraft.apply(this, arguments);
}

function sendBackToDraft(_x23) {
  return _sendBackToDraft.apply(this, arguments);
} //退回拟稿人：拟稿人发送时弹出选择是重新发起还是回到退稿人


function _sendBackToDraft() {
  _sendBackToDraft = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35(theForm) {
    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            if (checkModifyingProcessAndLock(theForm.processId.value, theForm.summary_id.value)) {
              _context35.next = 2;
              break;
            }

            return _context35.abrupt("return");

          case 2:
            $('#processModeSelectorContainer').html("");

            if (!checkForm(theForm)) {
              _context35.next = 24;
              break;
            }

            if (window.confirm(v3x.getMessage("edocLang.edoc_sendBackToDraft_confirm"))) {
              _context35.next = 6;
              break;
            }

            return _context35.abrupt("return");

          case 6:
            if (typeof beforeSubmitButton === "undefined" ? "undefined" : _typeof(beforeSubmitButton)) beforeSubmitButton();

            if (contentIframe.saveEdocForm("stepbacktosender")) {
              _context35.next = 9;
              break;
            }

            return _context35.abrupt("return");

          case 9:
            _context35.next = 11;
            return contentIframe.saveContent();

          case 11:
            if (_context35.sent) {
              _context35.next = 13;
              break;
            }

            return _context35.abrupt("return");

          case 13:
            if (contentIframe.saveHwData()) {
              _context35.next = 15;
              break;
            }

            return _context35.abrupt("return");

          case 15:
            theForm.action = genericURL + "?method=sendBackToDraft";
            saveAttachment();
            document.getElementById("processButton").disabled = true;

            try {
              document.getElementById("zcdbButton").disabled = true;
            } catch (e) {}

            try {
              //如果是弹出窗口，则不能显示“处理中”
              getA8Top().startProc('');
            } catch (e) {}

            disableButton("stepStopSpan");
            disableButton("stepBackSpan");
            disableButton("sendBackToDraftDiv");
            theForm.submit();

          case 24:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35);
  }));
  return _sendBackToDraft.apply(this, arguments);
}

function showDraftChoose() {
  return _showDraftChoose.apply(this, arguments);
} //原左侧导航收起


function _showDraftChoose() {
  _showDraftChoose = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
    var rv, choose, theForm;
    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            rv = getA8Top().v3x.openWindow({
              url: genericControllerURL + "edoc/showDraftChoose",
              dialogType: v3x.getBrowserFlag('openWindow') == true ? "modal" : "1",
              width: "250",
              height: "150"
            });

            if (rv) {
              _context36.next = 5;
              break;
            }

            return _context36.abrupt("return");

          case 5:
            choose = document.getElementById("draftChoose");
            theForm = document.getElementById("sendForm");

            if (!choose) {
              _context36.next = 14;
              break;
            }

            choose.value = rv; //如果返回到回退人，不需要匹配后续分支、人员

            if (rv == "toContinue") {
              loadAndManualSelectedPreSend = true;
            }

            if (!theForm) {
              _context36.next = 14;
              break;
            }

            theForm.action = genericURL + "?method=beforeDraftSendHandle";
            _context36.next = 14;
            return send();

          case 14:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36);
  }));
  return _showDraftChoose.apply(this, arguments);
}

function onLoadLeft() {
  try {
    if (getA8Top().contentFrame.document.getElementById("LeftRightFrameSet").cols != "132,*") {
      getA8Top().contentFrame.leftFrame.closeLeft("yes");
    }
  } catch (e) {}
} //原左侧导航展开


function unLoadLeft() {
  try {
    getA8Top().contentFrame.leftFrame.closeLeft();
  } catch (e) {}
}
/**xiangfan添加  Start*/


function isWrap(flag, edocType, listType, onloadType) {
  //标题是否换行（多行显示） true：是，false：否 ,onloadType:init页面加载，ajax异步设置
  var tbody_childs = document.getElementById("bodyIDpending");
  var index = 3; //发文待办，发文分发

  if (listType == 2 || listType == 3 || listType == 4) {
    //2: 发文-分发 3:收文-签收 4:收文-登记
    tbody_childs = document.getElementById("bodyIDlistTable");
  }

  if (listType == 3) {
    //收文签收
    index = 3;
  } else if (listType == 4 || listType == 5 || listType == 7) {
    //收文登记、分发、待办
    index = 2;
  }

  if (tbody_childs != null && tbody_childs != "undefined") {
    try {
      if (flag) {
        tbody_childs.style.tableLayout = "fixed"; //修复GOV-4526，全字母无法换行显示的错误

        for (var i = 0; i < tbody_childs.childNodes.length; i++) {
          var divObj = tbody_childs.childNodes[i].childNodes[index].childNodes[0];
          tbody_childs.childNodes[i].childNodes[index].style.wordWrap = "break-word"; //修复GOV-4526，全字母无法换行显示的错误

          divObj.style.whiteSpace = "normal";
          divObj.style.height = "auto";
          tbody_childs.childNodes[i].childNodes[index].style.height = "auto";
        }
      } else {
        tbody_childs.style.tableLayout = "";

        for (var i = 0; i < tbody_childs.childNodes.length; i++) {
          var divObj = tbody_childs.childNodes[i].childNodes[index].childNodes[0];
          tbody_childs.childNodes[i].childNodes[index].style.wordWrap = "";
          divObj.style.whiteSpace = "nowrap"; //divObj.style.height= "24";
          //tbody_childs.childNodes[i].childNodes[index].style.height = "24";
        }
      }
    } catch (e) {}
  }

  if (onloadType == "ajax") {
    //初始化页面加载时，不需要异步请求进行设置。 ajax表示需要异步请求进行设置！
    subjectWrapSettingAjax(flag, edocType, listType);
  }
}

function subjectWrapSettingAjax(flag, edocType, listType) {
  var url = "edocController.do?method=subjectWrapSetting&flag=" + flag + "&edocType=" + edocType + "&listType=" + listType;

  if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    req = new ActiveXObject("Microsoft.XMLHTTP");
  }

  req.open("GET", url, true);

  req.onreadystatechange = function () {
    if (req.readyState == 4 && req.status == 200) {//var json = eval(req.responseText);
      //var names ="";
      //names = json[0].flag;
    }
  };

  req.send(null);
}

function showmenu(evt) {//var _event = evt ? evt : event;
  //document.getElementById("showAllSubject").className = "nUL hidden";
  //addEvent(document.body,"mousedown",clickOther)
}

function addEvent(obj, eventType, func) {
  if (obj.attachEvent) {
    obj.attachEvent("on" + eventType, func);
  } else {
    obj.addEventListener(eventType, func, false);
  }
}

function delEvent(obj, eventType, func) {
  if (obj.detachEvent) {
    obj.detachEvent("on" + eventType, func);
  } else {
    obj.removeEventListener(eventType, func, false);
  }
}

function clickOther(el) {
  thisObj = el.target ? el.target : event.srcElement;

  do {
    if (thisObj.id == "showAllSubject") return;

    if (thisObj.tagName == "BODY") {
      hidemenu();
      return;
    }

    ;
    thisObj = thisObj.parentNode;
  } while (thisObj.parentNode);
}

function hidemenu() {
  var light = document.getElementById("showAllSubject");
  delEvent(document.body, "mousedown", showmenu);
  document.getElementById("showAllSubject").className = "nUL hidden";
}
/**xiangfan添加  End*/


function searchDateCheck(theForm) {
  if (theForm.condition && theForm.condition.value == "receiveTime") {
    $("#deduplication").val("false");
  }

  if (theForm.condition && theForm.condition.value == "receiveTime" || theForm.condition.value == "registerDate" || theForm.condition.value == "recieveDate" || theForm.condition.value == "createDate" || theForm.condition.value == "expectprocesstime") {
    var beginTimeStr = $("#" + theForm.condition.value + "Div").find("input").eq(0).val();
    var beginTimeStrs = beginTimeStr.split("-");
    var beginTimeDate = new Date();
    beginTimeDate.setFullYear(beginTimeStrs[0], beginTimeStrs[1] - 1, beginTimeStrs[2]);
    var endTimeStr = $("#" + theForm.condition.value + "Div").find("input").eq(1).val();
    var endTimeStrs = endTimeStr.split("-");
    var endTimeDate = new Date();
    endTimeDate.setFullYear(endTimeStrs[0], endTimeStrs[1] - 1, endTimeStrs[2]);

    if (endTimeDate < beginTimeDate) {
      window.alert(v3x.getMessage("V3XLang.calendar_endTime_startTime"));
      return false;
    }
    /** 打开进度条 */
    //try { getA8Top().startProc(); } catch(e) {}


    doSearch();
  } else {
    /** 打开进度条 */
    //try { getA8Top().startProc(); } catch(e) {}
    doSearch();
  }
} //弹出签收编号录入界面。


function editorialChange() {
  edocObj._obj = document.getElementById("recNo"); //判断页面上是否存在内部文号

  if (edocObj._obj == null) {
    alert(_("edocLang.edoc_form_noSerialNo"));
    return;
  }

  if (edocObj._obj != null) {
    getA8Top().win123 = getA8Top().v3x.openDialog({
      title: _("edocLang.edocEditorialEmptyTitle"),
      //签收编号输入
      transParams: {
        'parentWin': window
      },
      url: ((_ctxPath ? _ctxPath + "/" : "") || "") + "edocMark.do?method=editorialNoInputEntry",
      width: "350",
      height: "200"
    });
  }

  return;
}

function editorialChangeCallback(receivedObj) {
  if (receivedObj != undefined) {
    /*
        _obj = document.getElementById(receivedObj[2]);
        setWordNoEdit(_obj);
        for (var i = 0; i < _obj.options.length; i++) {
          var a = _obj.options[i].value;
          if (a == receivedObj[0]) {
            _obj.options[i].selected = true;
            return;
          }
        }
        var option = document.createElement("OPTION");
        option.value = receivedObj[0];
        option.text = receivedObj[1];
        _obj.options.add(option);
        option.selected = true;
        */
    var _objHidden = document.getElementById(receivedObj[2]);

    edocObj._obj = document.getElementById(receivedObj[2] + "_autocomplete");
    _objHidden.value = receivedObj[0];
    edocObj._obj.value = receivedObj[1];
    isUpdateEdocForm = true;
    edocMarkUpd = true;
  }
} //G6 V1.0 SP1后续功能_流程期限--start


function checkDeadline() {
  var deadline = document.getElementById("deadline");

  if (deadline.disable != true && deadline.options[deadline.selectedIndex].text.length == 16) {
    var now = new Date(); //当前系统时间

    var deadlineText = deadline.options[deadline.selectedIndex].text;
    var deadlineTime = document.getElementById("deadlineTime");
    deadlineTime.value = deadlineText;
    var days = deadlineTime.value.substring(0, deadlineTime.value.indexOf(" "));
    var hours = deadlineTime.value.substring(deadlineTime.value.indexOf(" "));
    var temp = days.split("-");
    var temp2 = hours.split(":");
    var d1 = new Date(parseInt(temp[0], 10), parseInt(temp[1], 10) - 1, parseInt(temp[2], 10), parseInt(temp2[0], 10), parseInt(temp2[1], 10));

    if (d1.getTime() <= now.getTime() + server2LocalTime) {
      alert(v3x.getMessage("edocLang.edoc_flowTime_validate"));
      return false;
    } else {
      var deadlineValue = Math.round((d1.getTime() - now.getTime() - server2LocalTime) / 1000 / 60);
      deadline.options.remove(deadline.options.length - 1);
      deadline.options.add(new Option(deadlineTime.value, deadlineValue));
      deadline.options[deadline.options.length - 1].selected = true;
      deadline.value = deadlineValue;
    }
  }

  return true;
} //G6 V1.0 SP1后续功能_流程期限--end
//5.0对外接口--时间安排，查询某个公文的详细，根据状态判断显示待办还是已办


function openEdocByStatus(affairId, state, contextPath) {
  if (state == '3') {
    //待办
    openDetail_edoc('listPending', 'from=Pending&affairId=' + affairId + '&from=Pending', contextPath);
  } else if (state == '4') {
    //已办
    openDetail_edoc('', 'from=Done&affairId=' + affairId, contextPath);
  } else {}
}

function openDetail_edoc(subject, _url, contextPath) {
  // 'subject'判断是否是交换公文
  if (subject == 'exchange') {
    _url = _url;
  } else {
    _url = contextPath + "/edocController.do" + "?method=detailIFrame&" + _url;

    if ("listPending" == subject || "listReading" == subject || "" == subject) {
      var rv = v3x.openWindow({
        url: _url,
        FullScrean: 'yes',
        dialogType: 'open' //dialogType: v3x.getBrowserFlag('pageBreak') == true ? 'modal' : '1'

      });
    } else {
      var rv = v3x.openWindow({
        url: _url,
        FullScrean: 'yes',
        dialogType: "open"
      });
    }
  }

  if (rv == "true") {
    //当从待办和待阅列表中打开处理页面提交后，只刷新列表页面不刷新整个框架页面
    //不然从待登记中 转发文的公文，进行处理后会刷新整个框架转到收文待办
    if (subject == 'listReading' || subject == 'listPending') {
      document.location.reload();
    } else {
      try {
        getA8Top().reFlesh();
      } catch (e) {
        document.location.reload();
      }
    }
  }
} //归档修改历史打开历史记录


function openDetailFromArchiveModify(archiveModifyId) {
  var _url = jsContextPath + "/edocController.do?method=edocDetailInDoc&openFrom=docLib&isHistory=true&archiveModifyId=" + archiveModifyId; //mark by xuqiangwei 改方法应该被弃用了


  var rv = v3x.openWindow({
    url: _url,
    workSpaceFull: 'yes',
    resizable: "false",
    dialogType: 'modal'
  });

  if (rv == true || rv == 'true') {
    try {
      window.location.href = window.location;
    } catch (e) {}
  }
}

function get$(target, id) {
  return target.document.getElementById(id);
} //在使用编辑工作流flash的页面，首先清除掉5.0工作流所在框架页面中的 流程相关信息


function clearWorkflowResource(target, currentUserId) {
  get$(target, "process_xml").value = "";
  get$(target, "readyObjectJSON").value = "";
  get$(target, "process_info").value = "";
  get$(target, "process_subsetting").value = "";
  get$(target, "moduleType").value = "";
  get$(target, "workflow_newflow_input").value = "";
  get$(target, "process_rulecontent").value = "";
  get$(target, "workflow_node_peoples_input").value = "";
  get$(target, "workflow_node_condition_input").value = "";
  get$(target, "processId").value = "";
  get$(target, "caseId").value = "";
  get$(target, "subObjectId").value = "";
  get$(target, "currentNodeId").value = "";

  if (target.matchRequestToken) {
    //工作流缓存ID
    var randT = new Date().getTime();
    target.matchRequestToken = "PC-" + (currentUserId || randT) + "-t-" + randT;
  }

  try {
    //OA-72918公文：拟文连续发2次自由流程，第2次会显示第一次选择的流程
    //兼容流程变动
    target.tempSelectPeopleElements = null; //页面非全部刷新，清空这个对象
  } catch (e) {}
}

function stepBackToTargetNode1(tWindow, vWindow, workitemId, processId, caseId, activityId, show1, show2, isTemplate) {
  //意见处理
  if (contentIframe.document.getElementById("contentOP")) {
    theform.contentOP.value = contentIframe.document.getElementById("contentOP").value; //意见不能为空

    var content = document.getElementById("contentOP");
    var opinionPolicy = document.getElementById("opinionPolicy");
    var cancelOpinionPolicy = document.getElementById("cancelOpinionPolicy");
    var disAgreeOpinionPolicy = document.getElementById("disAgreeOpinionPolicy");

    if (opinionPolicy && opinionPolicy.value == 1 && content) {
      if (content.value.trim() == '') {
        alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived")); //throw new Error(v3x.getMessage("edocLang.edoc_Release_lock5"));

        return;
      }
    } else {
      if (cancelOpinionPolicy && cancelOpinionPolicy.value == 1 && content) {
        if (content.value.trim() == '') {
          enablePrecessButtonEdoc();
          alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
          return;
        }
      } //意见不同意，校验意见内容


      if (disAgreeOpinionPolicy && disAgreeOpinionPolicy.value == 1 && content) {
        if (content.value.trim() == '' && isDisAgreeChecked(contentIframe)) {
          enablePrecessButtonEdoc();
          alert(v3x.getMessage("edocLang.edoc_opinion_mustbe_gived"));
          return;
        }
      }
    }
  }

  if (!isAffairValid(affair_id)) {
    enablePrecessButtonEdoc();
    return;
  }

  cancelConfirm();
  var stepBakParams = {};
  stepBakParams.tWindow = tWindow;
  stepBakParams.vWindow = vWindow;
  stepBakParams.workitemId = workitemId;
  stepBakParams.processId = processId;
  stepBakParams.caseId = caseId;
  stepBakParams.activityId = activityId;
  stepBakParams.stepBackToTargetNodeCallBackFn = stepBackToTargetNode1CallBackFn;
  stepBakParams.showReGo = show1;
  stepBakParams.showToMe = show2;
  stepBakParams.permissionAccountId = flowPermAccountId;
  stepBakParams.appName = "edoc";
  stepBakParams.NPS = NPSAppName;
  stepBakParams.isTemplate = isTemplate;
  parent.parent.stepBackToTargetNode(stepBakParams);
}

function stepBackToTargetNode1CallBackFn(_x24, _x25, _x26, _x27, _x28, _x29, _x30, _x31) {
  return _stepBackToTargetNode1CallBackFn.apply(this, arguments);
}
/**
 * 查看处理明细及流程日志
 */


function _stepBackToTargetNode1CallBackFn() {
  _stepBackToTargetNode1CallBackFn = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37(workitemId, processId, caseId, activityId, theStepBackNodeId, submitStyle, falshDialog, stepBackNodeName) {
    return regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            if (!window.confirm(v3x.getMessage("edocLang.spefallback"))) {
              _context37.next = 10;
              break;
            }

            falshDialog.close();
            saveAttachment();
            document.getElementById("theform").action = "edocController.do?method=appointStepBack&workitemId=" + workitemId + "&processId=" + processId + "&caseId=" + caseId + "&activityId=" + activityId + "&theStepBackNodeId=" + theStepBackNodeId + "&submitStyle=" + submitStyle + "&summaryId=" + summaryId + CsrfGuard.getUrlSurffix();
            document.getElementById("nodeName_1").value = stepBackNodeName;
            _context37.next = 7;
            return saveContent();

          case 7:
            if (_context37.sent) {
              _context37.next = 9;
              break;
            }

            return _context37.abrupt("return");

          case 9:
            document.getElementById("theform").submit();

          case 10:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37);
  }));
  return _stepBackToTargetNode1CallBackFn.apply(this, arguments);
}

function showDetailAndLog(summaryId, processId, defaultTab, NPSAppName, _title, from) {
  var showFlag = from ? 1 : 2;
  var queryParamsAboutApp = "";
  queryParamsAboutApp = "&appName=4&appTypeName=" + NPSAppName;

  var _url = ((_ctxPath ? _ctxPath + "/" : "") || "") + "detaillog/detaillog.do?method=showDetailLog&summaryId=" + summaryId + "&processId=" + processId + "&showFlag=" + showFlag + "&defaultTab=" + defaultTab + queryParamsAboutApp;

  V5_Edoc().$.dialog({
    url: _url,
    width: 1040,
    height: 590,
    title: _title,
    targetWindow: getA8Top()
  });
}

function edocJsonStrValues() {
  var edocJsonStr = "{"; //获取页面元素值

  var j = 0;

  for (var i = 0; i < fieldInputListArray.length; i++) {
    aField = fieldInputListArray[i];
    inputObj = document.getElementById(aField.fieldName);

    if (inputObj == null || inputObj.disabled == true) {
      continue;
    }

    var inputType = inputObj.type;
    var fileldName = aField.fieldName.substring(3);
    var fileldValue = inputObj.value;
    var fileldType = aField.fieldtype;

    if (j == 0) {
      if ((inputType == 'text' || inputType == 'textarea') && fileldType != 'decimal' && fileldType != 'int') {//公文分支不需要处理中文 edocJsonStr +="\""+fileldName+"\":{\"value\":\""+fileldValue+"\",\"type\":\"varchar\"}";
      } else if (fileldType == 'decimal') {
        j++;
        edocJsonStr += "\"" + fileldName + "\":{\"value\":\"" + fileldValue + "\",\"type\":\"decimal\"}";
      } else {
        j++;
        edocJsonStr += "\"" + fileldName + "\":{\"value\":\"" + fileldValue + "\",\"type\":\"int\"}";
      }
    } else {
      if ((inputType == 'text' || inputType == 'textarea') && fileldType != 'decimal' && fileldType != 'int') {// edocJsonStr +=",\""+fileldName+"\":{\"value\":\""+fileldValue+"\",\"type\":\"varchar\"}";
      } else if (fileldType == 'decimal') {
        edocJsonStr += ",\"" + fileldName + "\":{\"value\":\"" + fileldValue + "\",\"type\":\"decimal\"}";
      } else {
        edocJsonStr += ",\"" + fileldName + "\":{\"value\":\"" + fileldValue + "\",\"type\":\"int\"}";
      }
    }
  }

  edocJsonStr += "}";
  return edocJsonStr;
} //处理时执行


function edocSubmitJsonStrValues() {
  //第一步：解析公文单xml
  var xml = "";

  try {
    //处理页面
    xml = contentIframe.document.getElementById("xml").value;
  } catch (e) {
    //新建页面
    xml = document.getElementById("xml").value;
  }

  var xmlTo = xml.substring(xml.indexOf("<my:myFields"), xml.indexOf("</my:myFields>") + "</my:myFields>".length);
  var xmlInputXml = xml.substring(xml.indexOf("<FieldInputList>"), xml.indexOf("</FieldInputList>") + "</FieldInputList>".length);
  var xmlInputTypeTo = getXMLDoc(xmlInputXml);

  if (xmlInputTypeTo == null || xmlInputTypeTo.documentElement == null) {
    throw v3x.getMessage("edocLang.edoc_Failed_parseXML"); //"解析XML信息失败!";
  }

  var root = xmlInputTypeTo.documentElement;

  if (root.tagName != "FieldInputList") {
    throw v3x.getMessage("edocLang.edoc_xml_error1"); //"XML信息不是SeeyonFormat的格式!找不到 'FieldInputList' 节点";
  }

  var fNodelist = root.childNodes;
  var fien = fNodelist.length;
  var fFieldinput = getXMLNode(fNodelist, "FieldInput");

  if (fFieldinput == null) {
    throw v3x.getMessage("edocLang.edoc_xml_error2"); //"XML信息不是SeeyonFormat的格式!<br>找不到 'FieldInput' 节点";
  } //第二步：获得所有字段类型


  var myMap = new Object();

  for (var i = 0; i < fFieldinput.length; i++) {
    //var attrs = fFieldinput[i].attributes;
    var fFieldinputType111 = fFieldinput[i].getAttribute("branchFieldDbType");
    var fFieldName111 = fFieldinput[i].getAttribute("name").substring(3); //alert(fFieldinputType111+";        fFieldName111:="+fFieldName111);

    myMap[fFieldName111] = fFieldinputType111;
  } //第三步：获得所有字段的值


  var fieldValueObjMap = new Object();
  var formXml = $(xmlTo);

  if (formXml) {
    var childNodes = formXml[0].childNodes;

    for (var i = 0; i < childNodes.length; i++) {
      var myChild = childNodes[i];
      var myKey = myChild.tagName.toLowerCase();

      if (myKey.indexOf("my:") != -1) {
        myKey = myKey.substring(3);
      } //var myKey= myChild.tagName.toLowerCase().substring(3);


      var myValue = $(myChild).html(); //alert("myKey:="+myKey+";  myValue:="+myValue+"; myValueType:="+myMap[myKey]);

      var fileValueObj = new Object();
      fileValueObj["value"] = myValue;
      fileValueObj["valueDbType"] = myMap[myKey];
      fieldValueObjMap[myKey] = fileValueObj;
    }
  } //第四步：合并页面编辑字段数据
  //新建页面不需要判断是否有修改文单的权限，处理页面需要判断有修改文单的权限


  if (typeof canUpdateForm == 'undefined' || typeof canUpdateForm != 'undefined' && canUpdateForm != "false") {
    var fieldInputListArrayNew;

    try {
      //处理页面
      fieldInputListArrayNew = contentIframe.fieldInputListArray;
    } catch (e) {
      //新建页面
      fieldInputListArrayNew = fieldInputListArray;
    }

    for (var i = 0; i < fieldInputListArrayNew.length; i++) {
      aField = fieldInputListArrayNew[i];

      try {
        //处理页面
        inputObj = contentIframe.document.getElementById(aField.fieldName);
      } catch (e) {
        //新建页面
        inputObj = document.getElementById(aField.fieldName);
      }

      if (inputObj && aField.access == "edit") {
        var inputType = inputObj.type;
        var fieldName = aField.fieldName.substring(3);
        var fieldValue = inputObj.value;
        var fieldType = aField.fieldtype;
        var fieldValueObj = new Object();
        fieldValueObj["value"] = fieldValue;
        fieldValueObj["valueDbType"] = fieldType;
        fieldValueObj["inputType"] = inputType;
        fieldValueObjMap[fieldName] = fieldValueObj;
      }
    }
  } //第五步：生成公文分支计算所需要的公文数据json串


  var edocJsonStr = "{";
  var j = 0;

  for (var key in fieldValueObjMap) {
    var fieldValueObj = fieldValueObjMap[key];
    var fieldValue = fieldValueObj["value"];
    var fieldType = fieldValueObj["valueDbType"];
    var fieldInputType = fieldValueObj["inputType"]; //alert(key+"------"+fieldValue+"---"+fieldType+"---"+fieldInputType);
    //特殊字符转换

    if (fieldValue) {
      fieldValue = fieldValue.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    if (j == 0) {
      if (fieldInputType) {
        if ((fieldInputType == 'text' || fieldInputType == 'textarea') && fieldType != 'decimal' && fieldType != 'int') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"varchar\"}";
        } else if (fieldType == 'decimal') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"decimal\"}";
        } else if (fieldType == 'int') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        } else if (fieldType == 'date') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"date\"}";
        } else {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        }
      } else {
        if (fieldType == 'decimal') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"decimal\"}";
        } else if (fieldType == 'int') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        } else if (fieldType == 'varchar') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"varchar\"}";
        } else if (fieldType == 'date') {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"date\"}";
        } else {
          j++;
          edocJsonStr += "\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        }
      }
    } else {
      if (fieldInputType) {
        if ((fieldInputType == 'text' || fieldInputType == 'textarea') && fieldType != 'decimal' && fieldType != 'int') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"varchar\"}";
        } else if (fieldType == 'decimal') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"decimal\"}";
        } else if (fieldType == 'int') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        } else if (fieldType == 'date') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"date\"}";
        } else {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        }
      } else {
        if (fieldType == 'decimal') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"decimal\"}";
        } else if (fieldType == 'int') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        } else if (fieldType == 'varchar') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"varchar\"}";
        } else if (fieldType == 'date') {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"date\"}";
        } else {
          j++;
          edocJsonStr += ",\"" + key + "\":{\"value\":\"" + fieldValue + "\",\"type\":\"int\"}";
        }
      }
    }
  }

  edocJsonStr += "}";
  return edocJsonStr;
} // 是否能进行普通退回


function edocCanStepBack(workitemId, processId, nodeId, caseId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "edocCanStepBack", false);
  requestCaller.addParameter(1, "String", workitemId);
  requestCaller.addParameter(2, "String", processId);
  requestCaller.addParameter(3, "String", nodeId);
  requestCaller.addParameter(4, "String", caseId);
  requestCaller.addParameter(5, "String", flowPermAccountId);
  requestCaller.addParameter(6, "String", NPSAppName);
  var rs = requestCaller.serviceRequest();
  return rs;
} //是否能进行暂存代办


function edocCanTemporaryPending(workitemId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "edocCanTemporaryPending", false);
  requestCaller.addParameter(1, "String", workitemId);
  var rs = requestCaller.serviceRequest();
  return rs;
} //是否能进行撤销


function edocCanRepeal(processId, nodeId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "edocCanRepeal", false);
  requestCaller.addParameter(1, "String", processId);
  requestCaller.addParameter(2, "String", nodeId);
  var rs = requestCaller.serviceRequest();
  return rs;
} //是否能够进行提交


function edocCanWorkflowCurrentNodeSubmit(workitemId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "edocCanWorkflowCurrentNodeSubmit", false);
  requestCaller.addParameter(1, "String", workitemId);
  var rs = requestCaller.serviceRequest();
  return rs;
}

function getCanTakeBacData() {
  var obj = {};
  var processId = document.getElementById("processId").value;
  var workitemId = document.getElementById("workitemId").value;
  var nodeId = document.getElementById("currentNodeId").value;
  var caseId = document.getElementById("caseId").value;
  obj.processId = processId;
  obj.workitemId = workitemId;
  obj.nodeId = nodeId;
  obj.caseId = caseId;
  return obj;
}
/**
 * 考虑到如果客户端没有安装word等软件，默认类型需要调整，查找的顺序是OfficeWord、WpsWord、HTML
 * 由于只有公文是默认word类型，所以不在组件中修改，放在公文代码中
 */


function initBodyType() {
  if (typeof bodyTypeSelector != 'undefined') {
    var bodyTypeObj = document.getElementById("bodyType");
    var bodyType;

    if (bodyTypeObj) {
      bodyType = bodyTypeObj.value;

      if (bodyTypeSelector.contains("menu_bodytype_OfficeWord") && bodyType == 'OfficeWord') {
        bodyTypeObj.value = "OfficeWord";
        bodyTypeSelector.disabled("menu_bodytype_OfficeWord");
      } else if (bodyTypeSelector.contains("menu_bodytype_WpsWord") && bodyType == 'WpsWord') {
        bodyTypeObj.value = "WpsWord";
        bodyTypeSelector.disabled("menu_bodytype_WpsWord");
      } else if (bodyTypeSelector.contains("menu_bodytype_HTML") && bodyType == 'HTML') {
        bodyTypeObj.value = "HTML";
        bodyTypeSelector.disabled("menu_bodytype_HTML");
      } else if (bodyTypeSelector.contains("menu_bodytype_Pdf") && bodyType == 'Pdf') {
        bodyTypeObj.value = "Pdf";
        bodyTypeSelector.disabled("menu_bodytype_Pdf");
      }
    }
  }
}
/**
 * 对事项的状态进行判断，是否是有效的数据，主要是防止同时打开的情况
 */


function canChangeNode(workitemId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "edocCanChangeNode", false);
  requestCaller.addParameter(1, "String", workitemId);
  var rs = requestCaller.serviceRequest();
  return rs;
}

function canStopFlow(workitemId) {
  var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "canStopFlow", false);
  requestCaller.addParameter(1, "String", workitemId);
  var rs = requestCaller.serviceRequest();
  return rs;
}

function edocMarkValueChange(objValue) {
  var propertyName = window.event.propertyName;

  if (propertyName == "value") {
    if (objValue.getAttribute("required") == "true") {
      var objShowInput = document.getElementById(objValue.id + "_autocomplete");

      if (objShowInput) {
        if (objValue.value != "") {
          if (objShowInput.getAttribute("bgColor") != null) {
            objShowInput.style.backgroundColor = objShowInput.getAttribute("bgColor");
          } else {
            objShowInput.style.backgroundColor = "#FFFFFF";
          }
        } else {
          objShowInput.style.backgroundColor = "#FCDD8B";
        }
      }
    }
  }
}
/**
 * 公文文号下拉提示 ： 包括 拟文、新建模版、修改文单、签报等对文号或者文单的修改
 * 对于需要进行下拉提示的公文文号只需要在页面加载完成后调用此方法
 * fromWhere 来自于哪个页面（一般情况不传，只有在新建和修改模板的时候传递"newtemplete"）
 */


function showEdocMark(fromWhere, callBack) {
  var id = "my:doc_mark";
  var docMark = document.getElementById("my:doc_mark");

  if (docMark != null) {
    var style = docMark.style.cssText;
    var requiredValue = docMark.getAttribute("required");
    var accessValue = docMark.getAttribute("access"); //OA-47861当处理者只有文号修改权限时，点击修改文号，文号处没有输入边框，只有下拉箭头
    //input 没有边框导致的

    if (style.indexOf("WIDTH") == -1 && style.indexOf("width") == -1) style = "width:100%;height:24px"; // 公文文号

    var str = "<input id='" + id + "' name='" + id + "' style='" + style + "' type='hidden' access='" + accessValue + "'  value='" + docMark.value + "' required='" + requiredValue + "' onpropertychange ='edocMarkValueChange(this);'/>";
    str += "<input id='" + id + "_autocomplete' name='" + id + "_autocomplete' access='" + accessValue + "'  style='" + style + "' type='text' onclick=\"v3xautocomplete.toggle('" + id + "');\" value='" + v3x.getMessage("edocLang.doc_mark_alter_select_deleted") + "' />";
    /*请选择公文文号*/

    commonMarkChange(docMark, str, fromWhere);
  }

  id = "my:doc_mark2";
  var docMark2 = document.getElementById("my:doc_mark2");

  if (docMark2 != null) {
    // 公文文号
    var style = docMark2.style.cssText;
    var requiredValue = docMark2.getAttribute("required");
    var accessValue = docMark2.getAttribute("access");
    if (style.indexOf("WIDTH") == -1 && style.indexOf("width") == -1) style = "width:100%;height:24px";
    var str = "<input id='" + id + "' name='" + id + "' style='" + style + "' type='hidden' access='" + accessValue + "'  value='" + docMark2.value + "' required='" + requiredValue + "' onpropertychange ='edocMarkValueChange(this);'/>";
    str += "<input id='" + id + "_autocomplete' name='" + id + "_autocomplete' access='" + accessValue + "'  style='" + style + "' type='text' onclick=\"v3xautocomplete.toggle('" + id + "');\" value='" + v3x.getMessage("edocLang.doc_mark_alter_select_internal") + "'/>";
    /*请选择内部文号*/

    commonMarkChange(docMark2, str, fromWhere);
  }

  id = "my:serial_no";
  var docInMark = document.getElementById("my:serial_no");

  if (docInMark != null) {
    var style = docInMark.style.cssText;
    var requiredValue = docInMark.getAttribute("required");
    var accessValue = docInMark.getAttribute("access");
    if (style.indexOf("WIDTH") == -1 && style.indexOf("width") == -1) style = "width:100%;height:24px"; // 内部文号

    var str2 = "<input id='" + id + "' name='" + id + "' style='" + style + "' type='hidden' access='" + accessValue + "'  value='" + docInMark.value + "' required='" + requiredValue + "' onpropertychange ='edocMarkValueChange(this);'/>";
    str2 += "<input id='" + id + "_autocomplete' name='" + id + "_autocomplete' access='" + accessValue + "'  style='" + style + "' type='text' onclick=\"v3xautocomplete.toggle('" + id + "');\" value='" + V5_Edoc().$.i18n("edoc.inmark.empty.label") + "'/>"; //请选择内部文号

    commonMarkChange(docInMark, str2, fromWhere);
  }

  var recNo = document.getElementById("recNo");
  id = "recNo";

  if (recNo != null) {
    var style = "width:200px;position:relative;top:-3px;";
    var str3 = "<input id='" + id + "' name='" + id + "' style='" + style + "' type='hidden' value='" + recNo.value + "' />";
    str3 += "<input id='" + id + "_autocomplete' name='" + id + "_autocomplete' style='" + style + "' type='text' onclick=\"v3xautocomplete.toggle('" + id + "');\" value='" + v3x.getMessage("edocLang.doc_mark_alter_select_sign_number") + "'/>"; //请选择签收编号

    commonMarkChange(recNo, str3, fromWhere, callBack);
  }

  isEdocLike = true;
}

var docMarkOriginalArr = new Array();
var serialNoOriginalArr = new Array();
var docMark2OriginalArr = new Array();
/**
 * 替换拟文、修改文号、修改文单等页面文号的展现风格，支持下拉提示输入
 * markObj  ：文号对象，包括公文文号和内部文号
 * id     ：页面中被替换之前的公文文号或者内部文号的select或者input(收文)表单框的id
 * replaceStr ：替换之后的拼装字符串
 * edocType : 0：发文   1：收文
 * fromWhere 来自于哪个页面（一般情况不传，只有在新建和修改模板的时候传递"newtemplete"）
 */

function commonMarkChange(markObj, replaceStr, fromWhere, callBack) {
  try {
    var edocTypeValue = "";
    var edocType = document.getElementById("edocType");

    if (edocType) {
      edocTypeValue = edocType.value;
    }
    /* 空防护和兼容收文登记(收文登记为文本域) */


    if (markObj == null || markObj.getAttribute("access") == "browse" || edocTypeValue == "1" && (markObj.name == "my:doc_mark" || markObj.name == "my:doc_mark2")) {
      return;
    } //获得文号 文本框中当前的显示


    var value = getDefaultSelectValue(markObj, fromWhere);
    var arr = getOptionsValueToArr(markObj, fromWhere);

    if (value == "" && markObj.name == "recNo") {
      if (markObj.length == 2) {
        value = markObj[1].value;
      }
    }

    var objName = markObj.getAttribute("name");
    var displayDivId = objName + "_div";

    if (objName == "my:doc_mark") {
      docMarkOriginalArr = arr;
    } else if (objName == "my:doc_mark2") {
      docMark2OriginalArr = arr;
    } else if (objName == "my:serial_no") {
      serialNoOriginalArr = arr;
    }

    replaceMarkDivContent(markObj, replaceStr);
    var oDiv = document.getElementById(displayDivId);

    if (oDiv) {
      oDiv.style.display = "none";
    } // 兼容text自己输入修改不显示情况，value默认为 ' '


    if (markObj.type == "text") {
      value = "";
    }

    v3xautocomplete.autocomplete(markObj.id, returnJson(arr), {
      select: function select(item, inputName) {
        markObj.value = item.value;
      },
      button: true,
      autoSize: true,
      appendBlank: false,
      value: value
    });
    /* 为文号的隐藏域赋值:这句语句不能移到自动下拉之前 */

    var hiddenMarkObj = document.getElementById(markObj.id);

    if (hiddenMarkObj) {
      hiddenMarkObj.value = value;
    }
  } catch (e) {
    alert("Exception : " + V5_Edoc().$.i18n("edoc.error.num.option") + e.message); //文号下拉提示错误！
  }

  if (callBack) {
    callBack();
  }
}
/**
 * 替换原始文号所在<div>中内容，markObj：文号对象 replaceStr：替换的内容
 */


function replaceMarkDivContent(markObj, replaceStr) {
  if (markObj == null || replaceStr == "") {
    return;
  }

  var parentNode = markObj.parentNode;

  if (parentNode.hasChildNodes()) {
    var allChildNodes = parentNode.childNodes;

    for (var i = 0; i < allChildNodes.length; i++) {
      if (allChildNodes[i].nodeName.toLowerCase() == 'select') {
        if (allChildNodes[i].getAttribute("name") == markObj.getAttribute("name")) {
          allChildNodes[i].outerHTML = replaceStr;
          break;
        }
      }
    }
  }
}
/**
 * 取得下拉提示框中默认的显示值
 * 拟文、修改文号、修改文单、编辑保存待发、新建公文模版时若公文文号和内部文号有值则显示为默认值，如果没有可选文号显示默认提示，若只有一个文号则显示此文号
 *  * fromWhere 来自于哪个页面（一般情况不传，只有在新建和修改模板的时候传递"newtemplete"）
 */


function getDefaultSelectValue(markObj, fromWhere) {
  var name = markObj.name;
  var value = "";
  var originalMarkValue = "";
  var originalMark2Value = "";
  var originalInMarkValue = "";
  var docMarkValue = document.getElementById("docMarkValue");

  if (docMarkValue) {
    var markValue = docMarkValue.value;

    if (document.getElementById("my:doc_mark")) {
      markValue = document.getElementById("my:doc_mark").value; //文单切换时，才会显示之前选中的文号
    } //当编辑拟文时，显示之前保存的文号


    originalMarkValue = getCompareLabelValue(markValue, markObj);
  }

  var docMarkValue2 = document.getElementById("docMarkValue2");

  if (docMarkValue2) {
    var markValue2 = docMarkValue2.value;

    if (document.getElementById("my:doc_mark2")) {
      markValue2 = document.getElementById("my:doc_mark2").value;
    }

    originalMark2Value = getCompareLabelValue(markValue2, markObj);
  }

  var inMark = document.getElementById("docInmarkValue");

  if (inMark) {
    var inMarkValue = inMark.value;

    if (document.getElementById("my:serial_no")) {
      inMarkValue = document.getElementById("my:serial_no").value;
    }

    originalInMarkValue = getCompareLabelValue(inMarkValue, markObj);
  }
  /* 设置公文文号的默认选中值    规则：当只有一个文号时，默认选中此文号，
                      反之则给出选择提示 ,顺序不能颠倒，默认选择的项要在前面
                      新建模板时设置的文号，在拟文时调用该模板，要使用模板设置的文号
                      */


  if ("my:doc_mark" == name || "my:doc_mark2" == name) {
    if (markObj.type == "select-one") {
      // 当调用模板时文号的select长度变成1了，只显示模板中设置的
      if (fromWhere && fromWhere == "newtemplete") {
        //如果是新建模板和修改模板，默认直接是“请选择文号”OA-46416
        if (originalMarkValue.trim().length > 0 || originalMark2Value.trim().length > 0) {
          // 显示值
          if ("my:doc_mark" == name) value = originalMarkValue;
          if ("my:doc_mark2" == name) value = originalMark2Value;
        } else {
          value = "";
        }
      } else if (markObj.options.length == 1) {
        value = markObj.options[0].value.trim();
      } else if (markObj.options.length == 2) {
        var templeteIdValue = "";
        var templeteId = document.getElementById("templeteId");

        if (templeteId) {
          templeteIdValue = templeteId.value;
        }

        if (getDisplayLabel(markObj.options[0].value) != "" && templeteIdValue == "") value = markObj.options[0].value.trim();else if (getDisplayLabel(markObj.options[0].value) != "" && templeteIdValue != "" && markObj.options[0].selected) value = markObj.options[0].value.trim();else if (getDisplayLabel(markObj.options[1].value) != "" && templeteIdValue == "") value = markObj.options[1].value.trim();else if (getDisplayLabel(markObj.options[1].value) != "" && templeteIdValue != "" && markObj.options[1].selected) value = markObj.options[1].value.trim();
      } else if (originalMarkValue.trim().length > 0 || originalMark2Value.trim().length > 0) {
        // 显示值
        if ("my:doc_mark" == name) value = originalMarkValue;
        if ("my:doc_mark2" == name) value = originalMark2Value;
      } else {
        // 显示提示语
        value = "";
      }
    } else if (markObj.type == "text") {
      return "";
    }
  } else if ("my:serial_no" == name) {
    if (markObj.type == "select-one") {
      markObj = removeBlankSelect(markObj);

      if (fromWhere && fromWhere == "newtemplete") {
        //如果是新建模板和修改模板，默认直接是“请选择文号”OA-46416
        if (originalInMarkValue.trim().length > 0) {
          value = originalInMarkValue;
        } else {
          value = "";
        }
      } else if (markObj.options.length == 1) {
        value = markObj.options[0].value.trim();
      } else if (markObj.options.length == 2) {
        var templeteIdValue = "";
        var templeteId = document.getElementById("templeteId");

        if (templeteId) {
          templeteIdValue = templeteId.value;
        }

        if (getDisplayLabel(markObj.options[0].value) != "" && templeteIdValue == "") value = markObj.options[0].value.trim();else if (getDisplayLabel(markObj.options[1].value) != "" && templeteIdValue == "") value = markObj.options[1].value.trim();
      } else if (originalInMarkValue.trim().length > 0) {
        value = originalInMarkValue;
      } else {
        value = "";
      }
    } else if (markObj.type == "text") {
      return '';
    }
  }

  return value;
}
/**
 * 将文号select对象中每个option值放入数组并返回此数组，并且设置默认提示选项，公文文号与联合发文文号使用同一提示
 * 并且兼容收文登记时文号类型为text情况
 */


function getOptionsValueToArr(markObj, fromWhere) {
  var name = markObj.name;
  var arr = new Array();

  if (fromWhere != "newtemplete") {
    var item = {};

    if ("my:doc_mark" == name && templateMarkJs.docMark == 'false') {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      arr.push(item);
    } else if ("my:doc_mark2" == name && templateMarkJs.docMark2 == 'false') {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      arr.push(item);
    } else if ("my:serial_no" == name && templateMarkJs.serialNo == 'false') {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_internal"); //"请选择内部文号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_internal"); //"请选择内部文号";

      arr.push(item);
    } else if ("recNo" == name) {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_sign_number"); //"请选择签收编号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_sign_number"); //"请选择签收编号";

      arr.push(item);
    }
  } else {
    var item = {};

    if ("my:doc_mark" == name || "my:doc_mark2" == name) {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_deleted"); //"请选择公文文号";

      arr.push(item);
    } else if ("my:serial_no" == name) {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_internal"); //"请选择内部文号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_internal"); //"请选择内部文号";

      arr.push(item);
    } else if ("recNo" == name) {
      item.dispaly = v3x.getMessage("edocLang.doc_mark_alter_select_sign_number"); //"请选择签收编号";

      item.value = v3x.getMessage("edocLang.doc_mark_alter_select_sign_number"); //"请选择签收编号";

      arr.push(item);
    }
  }
  /* mark 对象类型，公文文号：select-one   内部文号：select-one,text */


  var type = markObj.type;

  if (type == "select-one") {
    for (var i = 0; i < markObj.length; i++) {
      if (markObj.options[i].value != '') {
        var item = {};
        item.dispaly = markObj.options[i].text;
        item.value = markObj.options[i].value;
        arr.push(item);
      }
    }
  } else if (type == "text") {
    var item = {};
    item.dispaly = markObj.value;
    item.value = markObj.value;
    arr.push(item);
  }

  return arr;
}
/**
 * 对传过来的公文文号数据进行拆分拼装
 * array    ： 类似于如下数据,例如 123723892792|致远远字(2012)001|1|1,123723892792|致远远字(2012)001|1|1
 * @returns ： 返回 json 对象，内容格式如下：
 *        [{value:"010",label:"Beijing北京"},{value:"020",label:"guangzhou"},{value:"021",label:"shanghai"}]
 */


function returnJson(array) {
  if (array == null) {
    return "";
  }

  var data = [];

  for (var i = 0; i < array.length; i++) {
    var item = array[i];

    if (item.value != "" && item.value != " ") {
      var dataItem = {};
      var flag = item.value.lastIndexOf("|");

      if (flag > 0) {
        var str = item.value.split("|");

        if (str[1] != '') {
          dataItem.value = item.value; // '123723892792|致远远字(2012)001|1|1'

          dataItem.label = item.dispaly || str[1]; // '致远远字(2012)001'
        }
      } else {
        dataItem.value = "";
        dataItem.label = item.dispaly || item.value;
      }

      data.push(dataItem);
    }
  }

  return data;
}
/**
 * 传进来的值和例如如下字符串中[致远远字(2012)001]进行比较，例如：123723892792|致远远字(2012)001|1|1
 * 如果传进来的值与位置2上的值相等，则将字符串返回
 * compareValue : 传进来进行比较的值
 * object   : 下拉框的对象，其value值为类似这样的字符串：123723892792|致远远字(2012)001|1|1
 */


function getCompareLabelValue(compareValue, object) {
  if (!object || object.type != "select-one") return "";

  for (var i = 0; i < object.options.length; i++) {
    var value = object.options[i].value;
    if (value == compareValue) return value;

    if (value.indexOf("|") > -1) {
      var arrs = value.split("|");
      var compareArrs = compareValue.split("|");

      if (arrs.length > 1 && arrs[1] == compareArrs[1] && arrs[1].trim().length > 0) {
        return value;
      }
    }
  }

  return "";
}
/**
 * 得到如下字符串中的显示值，例如：123723892792|致远远字(2012)001|1|1，则返回置为：致远远字(2012)001
 * 如果参数格式不是这种格式则将参数返回
 */


function getDisplayLabel(value) {
  if (value == null) return '';
  var flag = value.lastIndexOf("|");
  if (flag == -1) return value;
  var spStr = value.split("|");
  if (spStr.length >= 2) return spStr[1].trim();else return value;
}
/**
 * 删除对象obj中值为空的option,例如:ojb对象的值为 ''，则会被清除
 * 返回被清除后的 obj
 */


function removeBlankSelect(obj) {
  for (var i = 0; i < obj.options.length; i++) {
    if (obj.options[i].value.trim() != '' && getDisplayLabel(obj.options[i].value) == '') obj.options.remove(i);
  }

  return obj;
}

function checkNodeHasExchangeType() {
  if (hasExchangeType) {
    //交换类型检测
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocManager", "ajaxCheckNodeHasExchangeType", false, "GET", false);
    requestCaller.addParameter(1, "String", edocType);
    requestCaller.addParameter(2, "String", permKey);
    requestCaller.addParameter(3, "String", flowPermAccountId);
    requestCaller.serviceRequest();
    var ds = requestCaller.serviceRequest();

    if (ds) {
      if (ds == "false") {
        alert(V5_Edoc().$.i18n("edoc.alert.no.gwjh")); //该节点已没有公文交换类型操作，请重新进处理页面。

        return false;
      }
    }
  }

  return true;
}

function valiFuyan() {
  //验证附言
  var validateFuyan = document.getElementById("textarea_fy");

  if (null != validateFuyan) {
    var valLength = validateFuyan.value.length;

    if (valLength > 500) {
      alert(V5_Edoc().$.i18n("edoc.common.deafult.commonMaxSize", valLength)); //发起人附言不能超过500

      return false;
    }
  }

  return true;
} //插入修改督办的日志信息


function saveSuperviseLog() {
  var affair_IdValue = document.getElementById('affair_id');
  var summary_IdValue = document.getElementById('summary_id');
  var ajaxUserId = document.getElementById('ajaxUserId');

  if (affair_IdValue && summary_IdValue && ajaxUserId) {
    recordChangeWord(affair_IdValue.value, summary_IdValue.value, "duban", ajaxUserId.value);
  }
} //插入修改督办的日志信息
//快速发文--套红--start


function sendQuick_taohong(_x32) {
  return _sendQuick_taohong.apply(this, arguments);
} //快速发文--套红--end
//快速发文--交换类型检查
//快速发文--交换类型检查


function _sendQuick_taohong() {
  _sendQuick_taohong = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee38(templateType) {
    var bodyType, orgAccountId, _progressBar_1, countSign, _progressBar_2, ret, receivedObj, str, taohongTemplateContentType, ts, sendUnitTypeInput, redContent, _progressBar_3, newOfficeId, clearDocumentSaveCallbackParam, taohongParams;

    return regeneratorRuntime.wrap(function _callee38$(_context38) {
      while (1) {
        switch (_context38.prev = _context38.next) {
          case 0:
            if (!(document.getElementById("fileUrl").value == "")) {
              _context38.next = 2;
              break;
            }

            return _context38.abrupt("return");

          case 2:
            bodyType = document.getElementById("bodyType").value; // var isUniteSend=document.getElementById("isUniteSend").value;
            // var contentNumObj=document.getElementById("currContentNum");

            orgAccountId = document.getElementById("orgAccountId").value;

            if (!(templateType == "edoc")) {
              _context38.next = 28;
              break;
            }

            if (!(bodyType == "HTML")) {
              _context38.next = 9;
              break;
            }

            alert(_("edocLang.edoc_htmlnofuntion"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 9:
            if (!(bodyType == "OfficeExcel")) {
              _context38.next = 13;
              break;
            }

            alert(_("edocLang.edoc_excelnofuntion"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 13:
            if (!(bodyType == "WpsExcel")) {
              _context38.next = 17;
              break;
            }

            alert(_("edocLang.edoc_wpsetnofuntion"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 17:
            if (!(bodyType == "Pdf")) {
              _context38.next = 21;
              break;
            }

            alert(_("edocLang.edoc_pdfnofuntion"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 21:
            if (!(bodyType == "gd")) {
              _context38.next = 25;
              break;
            }

            alert(_("edocLang.edoc_gdnofuntion"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 25:
            if (!(checkEdocWordNoIsNull() == false)) {
              _context38.next = 28;
              break;
            }

            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 28:
            if (hasEdocDocTemplate(orgAccountId, templateType, bodyType)) {
              _context38.next = 32;
              break;
            }

            alert(v3x.getMessage('edocLang.edoc_docTemplate_record_notFound'));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 32:
            if (!(bodyType.toLowerCase() == "officeword" || bodyType.toLowerCase() == "wpsword" || templateType == "script")) {
              _context38.next = 115;
              break;
            }

            if (!(templateType == "edoc")) {
              _context38.next = 115;
              break;
            }

            // 判断是否有印章，有印章的时候不允许套红。
            // todo zl
            _progressBar_1 = getA8Top().$.progressBar();
            _context38.prev = 35;
            _context38.next = 38;
            return _officeSDK.switchProvider({
              fileType: _officeSDK.params.fileType,
              mode: "EDIT",
              editType: "1,0"
            });

          case 38:
            _context38.next = 45;
            break;

          case 40:
            _context38.prev = 40;
            _context38.t0 = _context38["catch"](35);

            _progressBar_1.close();

            $.alert(V5_Edoc().$.i18n("当前配置，不支持套红"));
            return _context38.abrupt("return");

          case 45:
            _context38.next = 47;
            return _officeSDK.openFile({
              dialogCloseCallback: null,
              isDialog: true,
              isHide: true
            });

          case 47:
            _context38.next = 49;
            return _officeSDK.countSignatures();

          case 49:
            countSign = _context38.sent;

            if (!(countSign > 0)) {
              _context38.next = 57;
              break;
            }

            _progressBar_1.close();

            alert(_("edocLang.edoc_notaohong_signature"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 57:
            if (!(countSign < 0)) {
              _context38.next = 64;
              break;
            }

            _progressBar_1.close();

            alert(_("office.sign.error"));
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 64:
            _progressBar_1.close();

          case 65:
            if (!confirm(_("edocLang.edoc_alertAutoRevisions"))) {
              _context38.next = 84;
              break;
            }

            // 清除正文痕迹并且保存
            _progressBar_2 = getA8Top().$.progressBar();
            _context38.next = 69;
            return removeTrailAndSave();

          case 69:
            if (_context38.sent) {
              _context38.next = 73;
              break;
            }

            _progressBar_2.close();

            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 73:
            _context38.next = 75;
            return _officeSDK.saveHuaLian();

          case 75:
            ret = _context38.sent;

            if (ret) {
              _context38.next = 81;
              break;
            }

            _progressBar_2.close();

            return _context38.abrupt("return");

          case 81:
            _progressBar_2.close();

          case 82:
            _context38.next = 86;
            break;

          case 84:
            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 86:
            str = document.getElementById("fileUrl").value;
            receivedObj = str;
            taohongTemplateContentType = "";
            ts = receivedObj.split("&");
            taohongTemplateContentType = ts[1];
            receivedObj = ts[0];
            taohongSendUnitType = ts[2];
            sendUnitTypeInput = document.createElement("input");
            sendUnitTypeInput.id = "taohongSendUnitType";
            sendUnitTypeInput.name = "taohongSendUnitType";
            sendUnitTypeInput.type = "hidden";
            sendUnitTypeInput.value = taohongSendUnitType; // GOV-3253 【公文管理】-【发文管理】-【待办】，处理待办公文时进行'文单套红'出现脚本错误
            // IE7不支持这句，而且在文单套红时也把选择单位或部门的去掉了，所以这里不用了
            // contentIframe.document.getElementsByName("sendForm")[0].appendChild(sendUnitTypeInput);

            if (taohongTemplateContentType == "officeword") {
              taohongTemplateContentType = "OfficeWord";
            } else if (taohongTemplateContentType == "wpsword") {
              taohongTemplateContentType = "WpsWord";
            } // 记录字段值为TRUE，JS用来记录套红操作


            if (!(receivedObj == null)) {
              _context38.next = 104;
              break;
            }

            document.getElementById("fileUrl").value = "";
            return _context38.abrupt("return");

          case 104:
            redContent = document.getElementById("redContent");

            if (redContent && templateType == "edoc") {
              redContent.value = "true";
            }

          case 106:
            // todo zl
            _progressBar_3 = getA8Top().$.progressBar();
            newOfficeId = contentOfficeId.get("0", null);

            if (!_officeSDK.isClientApp()) {
              clearDocumentSaveCallbackParam = {
                currSummaryId: summaryId,
                currNewOfficeId: newOfficeId
              };

              _officeSDK.setOptions(clearDocumentSaveCallbackParam);
            }

            edocTaohongHandler.setAllLable(document.getElementsByName("sendForm")[0], templateType, extendArray);
            edocTaohongHandler.bookMarkMapToBookMarkList(edocTaohongHandler.allBM);
            taohongParams = {
              allBookMark: edocTaohongHandler.bookMarkList,
              templateUrl: receivedObj,
              templateType: templateType,
              fileId: _officeSDK.params.fileId,
              fileType: _officeSDK.params.fileType,
              extParam: {}
            };
            _context38.next = 114;
            return _officeSDK.setOptions({
              isDialog: true,
              canClearTrail: false,
              canRevise: false,
              isShowTrailBtn: undefined,
              notChangeState: true,
              //wps调用openFile，文件状态设置为未修改，这里套红后不应该改状态
              isHide: false
            });

          case 114:
            _officeSDK.taohong(taohongParams, function (err, result) {
              _progressBar_3.close();

              if (result) {
                contentUpdate = true;
                hasTaohong = true;
                taohongFileUrl = document.getElementById("fileUrl").value;
                myBar.disabled("isQuickS");
                document.getElementById("isQuickSend").disabled = true;
              } else {
                console.log("套红失败", err);
                alert(V5_Edoc().$.i18n("govdoc.edocTemplate.error"));
              }
            });

          case 115:
          case "end":
            return _context38.stop();
        }
      }
    }, _callee38, null, [[35, 40]]);
  }));
  return _sendQuick_taohong.apply(this, arguments);
}

var checkExchangeRole_fromWaitSendParam = {};

function checkExchangeRole_fromWaitSend(summaryId, currentUserAccountId, extendParam) {
  extendParam = extendParam || {};

  var callbackFn = extendParam.callbackFn || function () {};

  var checkDeptFlag = false;
  var requestCaller_1 = new XMLHttpRequestCaller(this, "edocSummaryQuickManager", "findBySummaryIdStr", false);
  requestCaller_1.addParameter(1, "String", summaryId);
  var ds_1 = requestCaller_1.serviceRequest(); // 查出edoc_summary_quick对象

  var msgKey = "edocLang.alert_set_departExchangeRole";
  var typeAndIds = "";
  var obj = ds_1.get("exchangeType");
  var selectdExchangeUserId = ds_1.get("exchangeAccountMemberId");

  if (obj == '0') {
    var requestCaller_2 = new XMLHttpRequestCaller(this, "edocManager", "getDeptSenders", false);
    requestCaller_2.addParameter(1, "String", summaryId);
    var ds_2 = requestCaller_2.serviceRequest(); // 查出部门收发员id串

    var list = ds_2;

    if (list != null && list != "undifined" && list != "") {
      var _url = genericControllerURL + "edoc/selectDeptSender&memberList=" + encodeURIComponent(list);

      var listArr = list.split("|");

      if (listArr.length > 1) {
        checkExchangeRole_fromWaitSendParam.callbackFn = callbackFn;
        checkExchangeRole_fromWaitSendParam.msgKey = msgKey;
        checkExchangeRole_fromWaitSendParam.typeAndIds = typeAndIds;
        checkExchangeRole_fromWaitSendParam.selectdExchangeUserId = selectdExchangeUserId;
        checkDeptFlag = true;
        window.checkExchangeRole_fromWaitSendWin = getA8Top().$.dialog({
          title: V5_Edoc().$.i18n("edoc.select.exchangeDept"),
          //选择交换部门
          transParams: {
            'parentWin': window
          },
          url: _url,
          targetWindow: getA8Top(),
          width: "342",
          height: "185"
        });
      } else if (listArr.length == 1) {
        sendUserDepartmentId = listArr[0].split(',')[0];
      }
    }

    if (!checkDeptFlag) {
      typeAndIds = "Department|" + sendUserDepartmentId;
      selectdExchangeUserId = "";
    }
  } else {
    typeAndIds = "Account|" + currentUserAccountId;
    msgKey = "edocLang.alert_set_accountExchangeRole";
  }

  if (!checkDeptFlag) {
    _exeCheckExchangeRole(typeAndIds, selectdExchangeUserId, msgKey, callbackFn);
  }
}
/**
 * 执行交换角色角色检查
 * @param typeAndIds
 * @param selectdExchangeUserId
 * @param msgKey
 * @param callbackFn
 */


function _exeCheckExchangeRole(typeAndIds, selectdExchangeUserId, msgKey, callbackFn) {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocExchangeManager", "checkExchangeRole", false);
  requestCaller.addParameter(1, "String", typeAndIds);
  requestCaller.addParameter(2, "String", selectdExchangeUserId);
  var ds = requestCaller.serviceRequest();

  if (ds == "check ok") {
    callbackFn(true);
  } else if (ds == "changed") {
    // xiangfan 添加逻辑判断
    alert(V5_Edoc().$.i18n("edoc.alert.no.jhryqx")); //选中公文的交换人员权限已被取消，请重新选择公文收发员。

    callbackFn(false);
  } else {
    alert(_(msgKey, ds));
    callbackFn(false);
  }
}
/**
 * 选择分发部门后的回调函数,
 */


function checkExchangeRole_fromWaitSendCallback(retSendUserDepartmentId) {
  var callbackFn = checkExchangeRole_fromWaitSendParam.callbackFn;
  var msgKey = checkExchangeRole_fromWaitSendParam.msgKey;
  var typeAndIds = checkExchangeRole_fromWaitSendParam.typeAndIds;
  var selectdExchangeUserId = checkExchangeRole_fromWaitSendParam.selectdExchangeUserId;

  if (retSendUserDepartmentId == "cancel" || !retSendUserDepartmentId) {
    callbackFn(false);
  } else {
    typeAndIds = "Department|" + retSendUserDepartmentId;
    selectdExchangeUserId = "";

    _exeCheckExchangeRole(typeAndIds, selectdExchangeUserId, msgKey, callbackFn);
  }
} //显示流程图


function showFlowChart(_contextCaseId, _contextProcessId, _templateId, _contextActivityId) {
  var showHastenButton = 'true';
  var supervisorsId = "";
  var isTemplate = false;
  var operationId = "";
  var senderName = "";
  var openType = getA8Top();

  if (_templateId && "undefined" != _templateId) {
    isTemplate = true;
  }

  V5_Edoc().showWFCDiagram(openType, _contextCaseId, _contextProcessId, isTemplate, showHastenButton, supervisorsId, window, 'edoc', false, _contextActivityId, operationId, '', senderName);
} //查看附件列表


function showOrCloseAttachmentList() {
  var ipUrl = window.location.href;
  var startUrl = ipUrl.substring(0, ipUrl.indexOf(v3x.baseURL)) + v3x.baseURL;
  var attachmentListObj = document.getElementById("attachmentList");

  if (attachmentListObj.style.display == "none") {
    attachmentListObj.style.display = "block";
    $("#attachmentList").css("top", $("#hhhhhhh")[0].offsetTop); //var url = genericURL+"/collaboration/collaboration.do?method=findAttachmentListBuSummaryId&summaryId="+summaryId+"&memberId="+_affairMemberId+"&canFavorite="+_canFavorite+"&formAttrId=" + formAttrId+"&attmentList="+attmentList+"&openFromList="+openFrom;

    var url;

    if (typeof contentIframe != "undefined") {
      url = genericURL + "?method=findAttachmentListBySummaryId&summaryId=" + summaryId + "&canFavorite=" + _canFavorite + "&attmentList=" + contentIframe._fileUrlStr + "&typeFlag=edocFlag";
    } else {
      url = genericURL + "?method=findAttachmentListBySummaryId&summaryId=" + summaryId + "&canFavorite=" + _canFavorite + "&typeFlag=edocFlag";
    }

    $("#attachmentList").attr("src", url);
  } else {
    attachmentListObj.style.display = "none";
  }
}
/**
 * 批量下载
 */


function doloadFileFun(userId, $obj) {
  if (xmlDoc == null) {
    alert(_('edocLang.edoc_summary_attachment_title')); //Bulk download control failed to load, please click on the login page of the 'auxiliary program to install' download and install!
    //批量下載控件加載失敗，請點擊登錄頁面的《輔助程序安裝》下載安裝！

    return;
  }

  xmlDoc.AddUserParam(_userLocale, _userLoginName, _sessionId, _curUserId);
  var ipUrl = window.location.href;
  var startUrl = ipUrl.substring(0, ipUrl.indexOf(v3x.baseURL)) + v3x.baseURL; //var ids = $obj;

  var size = 0;
  var pigCount = 0;
  var hasFolder = false; //alert($obj.size());

  for (var i = 0; i < $obj.size(); i++) {
    size += 1;
    var id = $obj[i].value;
    var downloadFrName = $($obj[i]).attr("frName") + '.' + $($obj[i]).attr("frType"); //alert(downloadFrName);

    if (document.getElementById(id + "_Size")) {
      var downloadFrSize = document.getElementById(id + "_Size").value;
    }

    var vForDocDownload = $($obj[i]).attr("frVStr");
    var url;
    var result; //var isBorrow = isShareAndBorrowRoot == "true" && (frType == "102" || frType == "103");

    var isBorrow = false;
    url = startUrl + "/collaboration/collaboration.do?method=checkFile&docId=" + id + "&isBorrow=" + isBorrow + "&v=" + vForDocDownload;
    result = xmlDoc.AddDownloadFile(userId, downloadFrSize, downloadFrName, url);

    if ("FD_STATE_DOWNLOAD_CANCEL" == result) {
      return;
    }
  }
} //单点下载


function downloadAttrList(fileUrl, uploadTime, fileName, fileType, v) {
  var ipUrl = window.location.href;
  var startUrl = ipUrl.substring(0, ipUrl.indexOf(v3x.baseURL)) + v3x.baseURL;
  var url = startUrl + "/fileDownload.do?method=download&v=" + v + "&fileId=" + fileUrl + "&createDate=" + uploadTime + "&filename=" + encodeURIat(fileName);

  if ($.trim(fileType) !== "") {
    url += "." + fileType;
  }

  $("#downloadFileFrame").attr("src", url);
} //ajax判断事项是否可用。


function isAffairValid(affairId) {
  var msg = "";

  try {
    var nodePolicy = document.getElementById("policy").value;
    var requestCaller = new XMLHttpRequestCaller(this, "edocManager", "checkAffairValid", false);
    requestCaller.addParameter(1, 'String', affairId);
    requestCaller.addParameter(2, 'String', nodePolicy);
    msg = requestCaller.serviceRequest();
  } catch (ex) {
    alert("Exception : " + ex);
    return false;
  }

  if (msg === "" || msg === "<V><![CDATA[]]></V>") {
    return true;
  } else {
    alert(escapeStringToJavascript(msg));
  }

  return false;
}

function checkEdocMarkIsRequireAndIsNotNull() {
  var needCheckMark = false;
  var edocMarkObj = document.getElementById("my:doc_mark");

  if (edocMarkObj) {
    //文号必填项判断
    if (edocMarkObj.getAttribute('access') == "edit" && edocMarkObj.getAttribute('required') == 'true') {
      needCheckMark = true;
    } //是否包含文号


    markStr = _getWordNoValue(edocMarkObj);

    if (markStr != "") {
      needCheckMark = true;
    }
  }

  if (!needCheckMark) {
    var edocMarkObj2 = document.getElementById("my:doc_mark2");

    if (edocMarkObj2) {
      //文号必填项判断
      if (edocMarkObj2.getAttribute('access') == "edit" && edocMarkObj2.getAttribute('required') == 'true') {
        needCheckMark = true;
      } //是否包含文号


      var markStr2 = _getWordNoValue(edocMarkObj2);

      if (markStr2 != "") {
        needCheckMark = true;
      }
    }
  }

  return needCheckMark;
}
/*发文最后一个节点判断公文文号是否重复*/


function checkEdocWordNoWfLastInput() {
  var markStr = "";
  var inputObj = document.getElementById("my:doc_mark");

  if (inputObj != null) {
    markStr = _getWordNoValue(inputObj);

    if (markStr == "") {
      alert(_("edocLang.doc_mark_alter_not_null"));

      try {
        inputObj.focus();
      } catch (e) {}

      return false;
    }

    var markUsed = checkWordNoUser(markStr);

    if (markUsed) {
      //alert(_("edocLang.doc_mark_alter_used"));
      if (!confirm(V5_Edoc().$.i18n("govdoc.number.occupy.text"))) {
        return false;
      }
    }
  } //bug 29522 公文文号封发时判断问题
  //else{//公文单中需要含有公文文号元素且不能为空才可封发。
  //  alert(_("edocLang.doc_mark_alter_include_and_not_null"));
  //  return false;
  //}


  var isUniteSend = document.getElementById("isUniteSend").value;

  if (isUniteSend == "true") {
    inputObj = document.getElementById("my:doc_mark2");

    if (inputObj != null) {
      var markStr1 = markStr;
      markStr = _getWordNoValue(inputObj);

      if (markStr == "") {
        alert(_("edocLang.doc_mark2_alter_not_null"));

        try {
          inputObj.focus();
        } catch (e) {}

        return false;
      } //检查两个文号是否相同


      if (markStr1 == markStr) {
        alert(_("edocLang.two_doc_mark_no_equ"));
        return false;
      }

      var markUsed = checkWordNoUser(markStr);

      if (markUsed) {
        alert(_("edocLang.doc_mark2_alter_used"));
        return false;
      }
    }
  }

  return true;
}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
};

function setWpsParamsFormOfficeAPI(params) {
  var result = {};

  for (var i in params) {
    result[i] = params[i];
  }

  return result;
}