function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function wpsPlugin(params) {
  this.isAvailable = null; // 加载项是否可用，为false情况可能是没安装、没启动

  this.setOptions(params);
}

String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
};

var wpsUtils = {
  /**
   * 获取令牌
   * @returns {string|undefined}
   */
  getVerification: function () {
    var _getVerification = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var url, tolen;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // 访问后台获取认证 只要是controller就行，不会进入方法，wpsAssistController
              url = OfficeUtils.getWebRoot() + "/wpsAssistController.do?tko=WPS_ASSIST&m=k&_t=" + new Date().getTime();
              _context.next = 3;
              return xhrLoad(url, false);

            case 3:
              tolen = _context.sent;
              // 增加维持的心跳, 否则tolen会很快失效
              setInterval(function () {
                xhrLoad(OfficeUtils.getWebRoot() + "/wpsAssistController.do?tko=WPS_ASSIST&m=u&_t=" + new Date().getTime() + "&tolen=" + tolen, true);
              }, 10 * 1000);
              return _context.abrupt("return", tolen);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function getVerification() {
      return _getVerification.apply(this, arguments);
    }

    return getVerification;
  }(),

  /**
   * wps保存后，真实保存把临时文件入库
   * @param param
   * @returns {*}
   */
  oaCopyToTrans: function oaCopyToTrans(param) {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxWpsAssistManager", "oaCopyToTrans", false);
    requestCaller.addParameter("1", "String", param);
    var ds = requestCaller.serviceRequest();
    return ds.instance;
  },

  /**
   * 上传最大文件大小
   * @returns {*}
   */
  getFileMaxSize: function getFileMaxSize() {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxWpsAssistManager", "getFileMaxSize", false);
    var ds = requestCaller.serviceRequest();
    return ds.instance;
  },

  /**
   * 注意：cap4表单关联关系只能在oa端保存，因为依赖session
   * @param param
   * @returns {*}
   */
  addWordInjectionCtrl4Changed: function addWordInjectionCtrl4Changed(param) {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxWpsAssistManager", "addWordInjectionCtrl4Changed", false);
    requestCaller.addParameter("1", "String", param.formDataId);
    requestCaller.addParameter("2", "String", param.privateId);
    var ds = requestCaller.serviceRequest();
    return ds.instance;
  },

  /**
   * 将字符串转换为对应对象（原本期望字符串类型则不能调用！！！）
   * @param str
   * @returns {any}
   */
  strToObj: function strToObj(str) {
    if (!str) {
      return str;
    }

    return eval('(' + str + ')');
  },
  transAttribute: function transAttribute(canEdit, canCopy, hasTrail, editType) {
    try {
      if (canEdit == true || canEdit == "true") {
        canEdit = "1";
      }

      if (canEdit == false || canEdit == "false") {
        canEdit = "0";
      }

      var result,
          type = "";

      if (editType != null && editType != "") {
        return editType;
      }

      if (typeof type == "undefined") {
        type = "";
      }

      var arr = type.split(",");

      if (arr) {
        if (canEdit == "0" && canCopy == "0") {
          arr[0] = "0";
        } else if (canEdit == "0" && canCopy == "1") {
          arr[0] = "4";
        } else if (canEdit == "1") {
          arr[0] = "1";
        }

        if (typeof hasTrail != "undefined" && (hasTrail == "0" || hasTrail == "1")) {
          arr[1] = hasTrail;
        } else {
          arr[1] = 0;
        }

        result = arr[0] + "," + arr[1];
      }

      return result;
    } catch (e) {}

    return editType;
  },

  /**
   * office正文"保存文件"到本地时，替换标题中包含office标题不支持的特殊字符
   * office标题不支持{ \ / : * ? " <> | },协同标题不支持{ }，还有{? : * /}需要校验<br>
   * @return
   */
  subjectVerify: function subjectVerify(subject) {
    var ret = "";

    try {
      if (typeof subject == 'string' && subject.constructor == String) {
        ret = subject;
      } else if (_typeof(subject) == 'object') {
        ret = subject.value;
      } else {
        return ret;
      }
    } catch (e) {
      return "";
    }

    try {
      ret = ret.replaceAll("<br/>", ''); // 放开对“：”的限制

      while (ret.indexOf("?") >= 0 || ret.indexOf(":") >= 0 || ret.indexOf("*") >= 0 || ret.indexOf("/") >= 0 || ret.indexOf("\"") >= 0 || ret.indexOf("|") >= 0 || ret.indexOf("\\") >= 0 || ret.indexOf("<") >= 0 || ret.indexOf(">") >= 0 || ret.indexOf("\t") >= 0 || ret.indexOf("\xA0") >= 0 || ret.indexOf("\r") >= 0 || ret.indexOf("\n") >= 0 || ret.indexOf("•") >= 0) {
        ret = ret.replace("?", "").replace(":", "：").replace("*", "").replace("\t", "").replace("\"", "").replace("|", "").replace("/", "").replace("\\", "").replace("<", "").replace(">", "").replace("\xA0", "\x20").replace("\r", "").replace("\n", "").replace("•", "");
      }
    } catch (e) {
      ret = subject;

      while (ret.indexOf("?") >= 0) {
        ret = ret.replace("?", "");
      }

      while (ret.indexOf(":") >= 0) {
        ret = ret.replace(":", "：");
      }

      while (ret.indexOf("*") >= 0) {
        ret = ret.replace("*", "");
      }

      while (ret.indexOf("/") >= 0) {
        ret = ret.replace("/", "");
      }

      while (ret.indexOf("\\") >= 0) {
        ret = ret.replace("\\", "");
      }

      while (ret.indexOf("<") >= 0) {
        ret = ret.replace("<", "");
      }

      while (ret.indexOf(">") >= 0) {
        ret = ret.replace(">", "");
      }

      while (ret.indexOf("\t") >= 0) {
        ret = ret.replace("\t", "");
      }

      while (ret.indexOf("\xA0") >= 0) {
        ret = ret.replace("\xA0", "\x20");
      }

      while (ret.indexOf("\"") >= 0) {
        ret = ret.replace("\"", "");
      }

      while (ret.indexOf("|") >= 0) {
        ret = ret.replace("|", "");
      }

      while (ret.indexOf("\r") >= 0) {
        ret = ret.replace("\r", "");
      }

      while (ret.indexOf("\n") >= 0) {
        ret = ret.replace("\n", "");
      }

      while (ret.indexOf("•") >= 0) {
        ret = ret.replace("•", "");
      }
    }

    return ret;
  },

  /**
   * wps加载过的文档id，格式id:时间戳（用于关闭浏览器时同步关闭wps的页签）
   */
  wpsOpenedFileIds: {},

  /**
   * 添加wps打开过的文件id
   * @param {Object} fileId：文件id. fileType 文件类型
   */
  addWpsOpenFileId: function addWpsOpenFileId(param) {
    //空判断
    if (!param || !param.fileId) {
      return;
    } //放入id


    wpsUtils.wpsOpenedFileIds[param.fileId] = param.fileType;
  },

  /**
   * 判断浏览器是否是IE
   * @returns {boolean}
   */
  isIE: function isIE() {
    var r = navigator.userAgent;
    return r.indexOf("MSIE") > 0 || r.toLocaleLowerCase().indexOf("trident") > -1;
  },
  isFirefox: function isFirefox() {
    var r = navigator.userAgent;
    return r.toLocaleLowerCase().indexOf("firefox") > -1;
  }
};
/**
 * 初始化Office插件
 * 一般正文组件会自动调用这个方法，如果没有使用正文组件，仅仅是引用baseOffice.js来使用Office插件，则需要手动调用此方法
 */

wpsPlugin.prototype.initOffice = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(params) {
    var _fileName;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (typeof params.isLoadOfficeImmediate == "undefined" || params.isLoadOfficeImmediate == null) {
              // wps 默认不打开
              params.isLoadOfficeImmediate = true;
            }

            if (typeof params.handWriteCurrentUserId == "undefined" || params.handWriteCurrentUserId == null) {
              params.handWriteCurrentUserId = params.userId;
            }

            if (typeof params.canEditContent == 'undefined' || params.canEditContent == null) {
              params.canEditContent = OfficeUtils.getCanEditContent();
            }

            if (typeof params.currentUserName == 'undefined' || params.currentUserName == null) {
              params.currentUserName = OfficeUtils.getCurrentUserName();
            }

            if (typeof params.currentLanguage == 'undefined' || params.currentLanguage == null) {
              params.currentLanguage = OfficeUtils.currentLanguage();
            }

            if (typeof params.extendParams == 'undefined' || params.extendParams == null) {
              params.extendParams = [];
            }

            if (typeof params.webRoot == 'undefined') {
              params.webRoot = OfficeUtils.getWebRoot();
            }

            if (!params.isLoadOfficeImmediate) {
              //如果传递的参数为不为null并且为false时进行处理.
              if (params.fileId && params.originalFileId) {
                params.isLoadOfficeImmediate = true;
              }

              if (typeof params.realFileName != "undefined" && params.realFileName != "") {
                //文件真实名是否存在，一般用于预览
                params.isLoadOfficeImmediate = true;
              }

              if (typeof params.isOpen != "undefined") {
                //是否打开文件
                params.isLoadOfficeImmediate = params.isOpen;
              }
            } // wps加载项独有参数，判断是否立即加载文件，用于公文一屏布局


            if (typeof params.wpsIsLoadOfficeImmediate != "undefined" && params.wpsIsLoadOfficeImmediate === false) {
              params.isLoadOfficeImmediate = false;
            }

            _fileName = "";

            if (typeof i18n == "function") {
              _fileName = i18n("wpsplugin.label.content");
            } else if ($ && $.i18n) {
              _fileName = $.i18n("wpsplugin.label.content");
            } else {
              _fileName = "正文";
            }

            if (!params.fileName || params.fileName == 'null') params.fileName = _fileName;
            OfficeAPI.options = OfficeUtils.extend(OfficeAPI.defaultOptions, params); //对象合并

            if (!params.isLoadOfficeImmediate) {
              _context2.next = 16;
              break;
            }

            _context2.next = 16;
            return this.loadOffice();

          case 16:
            if (params.initWithoutLoadCallback) {
              params.initWithoutLoadCallback();
            } // cap4兼容wps，打开wps后需要关闭cap的加载层


            if (params.forceSaved && params.wpsOpened) {
              params.wpsOpened();
            }

            return _context2.abrupt("return", true);

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * 构造在线打开文档参数
 * @return params 参数
 */


wpsPlugin.prototype.buildOnlineEditDocParams = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
  var params, jsLocalLanguage, verification;
  return regeneratorRuntime.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          params = this.initOptions(OfficeAPI.options); // 初始化参数;

          params.userName = params.currentUserName;

          if (!params.sessionId) {
            params.sessionId = getSessionId();
          }

          if (!params.webRoot) {
            params.webRoot = OfficeUtils.getWebRoot();
          }

          jsLocalLanguage = "EN";

          if (this.currentLanguage == "zh-cn" || this.currentLanguage == "zh_CN") {
            //中文简体
            jsLocalLanguage = "CH";
          } else if (this.currentLanguage == "zh-tw" || this.currentLanguage == "zh_TW") {
            //中文繁体
            jsLocalLanguage = "TW";
          }

          params.language = jsLocalLanguage;
          params.CATEGORY = "1";
          _context3.next = 10;
          return wpsUtils.getVerification();

        case 10:
          verification = _context3.sent;

          if (!(verification == null)) {
            _context3.next = 14;
            break;
          }

          window.console && console.warn && console.warn("获取令牌失败");
          return _context3.abrupt("return");

        case 14:
          params.verification = verification; // 文件大小

          params.wpsFileMaxSize = wpsUtils.getFileMaxSize();

          if (!WpsConstent.uniquekey) {
            WpsConstent.setUniquekey(params.fileId + "_" + new Date().getTime());
          }

          WpsConstent.setFieldValue("officeType", OfficeAPI.officeType);
          params['uniquekey'] = WpsConstent.uniquekey; // 判断类型

          params.ClientType = getClientType(params.fileType); // canTransFileType 如果为"wps""et"则保存后无需转换

          params.canTransFileType = params.fileType.replace('.', '');
          OfficeAPI.defaultOptions.ClientType = params.ClientType; // 构造editType

          params.editType = wpsUtils.transAttribute(params.canEdit, params.canCopy, params.hasTrail, params.editType); //设置转版权限(定义在公文的summary.jsp文件中)

          if (typeof canTransToPdf != "undefined") {
            params.canTransToPdf = canTransToPdf;
          }

          if (typeof canTransToOfd != "undefined") {
            params.canTransToOfd = canTransToOfd;
          } //拟文添加是否为快速发文的参数


          if (typeof isQuickSend != "undefined") {
            params.isQuickSend = isQuickSend;
          } //添加是否校验正文为空参数


          params.checkWordEmpty = OfficeAPI.checkWordEmpty; // 打开文件id

          OfficeAPI.options.openFileId = params.fileId;
          return _context3.abrupt("return", params);

        case 29:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, this);
}));
/**
 * 初始设置参数
 * @param params 全局参数OfficeAPI.options
 * @return 需要的参数对象
 */

wpsPlugin.prototype.initOptions = function (params) {
  var newWpsParams = {};
  newWpsParams.fileType = params.fileType; // 文档类型

  newWpsParams.webRoot = params.webRoot;
  newWpsParams.fileId = params.fileId;
  newWpsParams.contentId = params.fileId;
  newWpsParams.currentLanguage = params.currentLanguage;
  newWpsParams.createDate = params.createDate;
  newWpsParams.originalCreateDate = ""; // params.originalCreateDate;

  newWpsParams.originalFileId = params.originalFileId; // 原始文件类型

  newWpsParams.needCloneFile = ""; // params.needCloneFile;

  newWpsParams.needReadFile = params.needReadFile;
  newWpsParams.userId = params.handWriteCurrentUserId;
  newWpsParams.currentUserName = params.currentUserName;
  newWpsParams.affairMemberId = params.affairMemberId;
  newWpsParams.affairMemberName = params.affairMemberName;
  newWpsParams.officeFileRealSize = params.officeFileRealSize;
  newWpsParams.officeOcxUploadMax = params.officeOcxUploadMax;
  newWpsParams.officecanPrint = params.officecanPrint; // 是否可以打印

  newWpsParams.officecanSaveLocal = params.officecanSaveLocal; // 是否可以保存到本地

  newWpsParams.hasPDF417Manager = params.hasPDF417Manager; // 是否有二维码插件

  newWpsParams.hasAdvanceOcx = params.hasAdvanceOcx; // 是否为高级office控件

  newWpsParams.isNewOfficeFilePage = params.isNewOfficeFilePage; // 是否是新建页面

  newWpsParams.isLoadOfficeImmediate = params.isLoadOfficeImmediate;
  newWpsParams.canEditContent = params.canEditContent; // 是否可以修改正文

  newWpsParams.canTaohong = params.canTaohong; // 是否可以进行套红（表单套红）

  newWpsParams.formDataId = params.formDataId;
  newWpsParams.privateId = params.privateId;
  newWpsParams.currentPage = params.currentPage;
  newWpsParams.showHl = params.showHl;
  newWpsParams.actionCanSign = params.actionCanSign;
  newWpsParams.isRemoveTrace = params.isRemoveTrace; //保存本地时是否强制清除痕迹

  newWpsParams.sign = params.sign;
  newWpsParams.btnSign = params.btnSign;
  newWpsParams.isAdmin = params.isAdmin; //是否管理员

  /*
   * 第一位 “0” 只读、且不能拷贝， “1” 起草编辑[可写无痕迹保留]， “2” 编辑[有痕迹保留，不可以修订]， “3” 审核[有修订菜单]，“4” 只读、可以复制文档内容。
   * 第二位 0不可手写批注，1可以手写批注。
   */

  newWpsParams.editType = params.editType;
  newWpsParams.canEdit = params.canEdit; // 是否能够编辑

  newWpsParams.canWrite = params.canWrite; // 是否可以进行手写批注

  newWpsParams.hasTrail = params.hasTrail; // 是否显示保留痕迹

  newWpsParams.isSaveModifyMark = params.isSaveModifyMark;
  newWpsParams.setSignatureBlack = params.setSignatureBlack; // 是否设置印章为灰色

  newWpsParams.initOfficeSucessCallback = params.initOfficeSucessCallback; // 表单套红判断正文是否加载完成的回调

  newWpsParams.initOfficeErrorCallback = params.initOfficeErrorCallback;
  newWpsParams.initOfficeCloseCallback = params.initOfficeCloseCallback;
  newWpsParams.callback = params.callback;
  newWpsParams.originalNeedClone = params.originalNeedClone;
  newWpsParams.needSave = params.needSave;
  newWpsParams.isFullSize = params.isFullSize;
  newWpsParams.extendParams = params.extendParams;
  newWpsParams.extParams = params.extParams;
  newWpsParams.fileName = wpsUtils.subjectVerify(params.fileName);
  newWpsParams.newGovdocView = typeof params.newGovdocView != "undefined" ? params.newGovdocView : "0";
  newWpsParams.originalContentId = params.originalContentId; //原正文

  newWpsParams.realFileType = params.realFileType;
  newWpsParams.etRealFileType = params.etRealFileType || "";
  newWpsParams.wpsRealFileType = params.wpsRealFileType || "";
  newWpsParams.realFileName = wpsUtils.subjectVerify(params.realFileName);
  newWpsParams.wordTextContent = ""; // 保存word的文字内容,盖章后可以移动印章,修改文字,保存的时候判断文字是否被修改,如果修改了禁止保存;

  newWpsParams.curDataID = ""; // 记录当前版本对应数据的ID

  newWpsParams.curMenuID = 0; // 记录当前版本菜单ID,用于菜单变灰控制

  newWpsParams.curMenuEditType = ""; // 记录当前版本的编辑模式,用于控制菜单

  newWpsParams.backupIds = ""; // 记录备份文件id

  newWpsParams.isLoadOfficeFile = true; // 是否加载了load Office正文

  newWpsParams.isSignOperation = false; // 是否是签章操作的状态，即页面上执行了签章操作。如果执行了签章操作，即为修改状态。
  // 系统参数，是否保存痕迹

  newWpsParams.isRetainedTraces = typeof params.isRetainedTraces != "undefined" ? params.isRetainedTraces : false;
  newWpsParams.isShowHualian = false; // 是否显示花脸

  newWpsParams.canCopy = 1; // 是否能够复制

  newWpsParams.subjectValue = ""; // 获取到的标题

  newWpsParams.reWrite = false; // 文档掉入之后，是否进行过重新批注

  newWpsParams.isShowShenYueMenu = true; // 是否显示审阅菜单

  newWpsParams.isToPdf = false; // 是否转换成pdf

  newWpsParams.newPdfId; // 新生成的pdfid

  newWpsParams.page_OcxState = ""; // office控件是否加载完成

  newWpsParams.loadBackFile = false;
  newWpsParams.loadOfficeSuccess = false;
  newWpsParams.contentUpdate = false;
  newWpsParams.updateOcx = false;
  newWpsParams.isSave = false; // 控制wps是否置顶，N:不置顶，其他置顶

  newWpsParams.wpsPopupFlag = params.wpsPopupFlag || ""; //控制wps保存是否强制保存到upload

  newWpsParams.forceSaved = params.forceSaved || ""; //是否为编辑附件

  newWpsParams.isEditAtt = params.isEditAtt || false; // 是否需要下载时强制清除痕迹

  newWpsParams.needClearTrace = params.needClearTrace || false;
  seti18n2wps(newWpsParams); //从OA缓存获取WPS国际化对象

  return newWpsParams;
};
/**
 * 设置参数
 * @param _options
 */


wpsPlugin.prototype.setOptions = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_options) {
    var isDelete, newFileId;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            isDelete = false; // 增加判断防止多次打开wps

            if (!(!_options["fileId"] && _options.openFileId)) {
              _context4.next = 6;
              break;
            }

            _context4.next = 4;
            return UpdateWpsParams(_options);

          case 4:
            _context4.next = 9;
            break;

          case 6:
            newFileId = _options["fileId"];

            if (OfficeAPI.options["fileId"]) {
              delete _options["fileId"];
              isDelete = true;
            }

            _options["wpsNewFileId"] = newFileId;

          case 9:
            OfficeAPI.options = OfficeUtils.extend(OfficeAPI.options, _options); //对象合并

            if (isDelete) {
              _options.fileId = _options["wpsNewFileId"];
            }

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x2) {
    return _ref3.apply(this, arguments);
  };
}();
/**
 * 获取seession
 * @returns 
 */


function getSessionId() {
  var requestCaller = new XMLHttpRequestCaller(this, "ajaxHandWriteManager", "ajaxGetSessionId", false);
  var ds = requestCaller.serviceRequest();
  return ds;
}
/**
 * WPS打开Office正文
 *
 */


wpsPlugin.prototype.loadOffice = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
  var params;
  return regeneratorRuntime.wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return this.buildOnlineEditDocParams();

        case 2:
          params = _context5.sent;
          _context5.next = 5;
          return OnlineEditDoc(params);

        case 5:
          //如果有初始化成功回调
          if (params.initOfficeSucessCallback) {
            params.initOfficeSucessCallback("wps"); //设置成功回调为空，防止下次继续调用

            OfficeAPI.options.initOfficeSucessCallback = null;
          }

          OfficeAPI.options.isLoadOfficeFile = true; //混网选择是  wps加载项 新建时 office转换 页面被刷新了，预期不刷新

          OfficeAPI.internalParam.isLoad = true;
          return _context5.abrupt("return", true);

        case 9:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5, this);
}));

wpsPlugin.prototype.fullSize = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(canModify) {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (typeof OfficeAPI.options.editType == "undefined" || canModify && OfficeAPI.options.editType.substr(0, 1) != "1" && OfficeAPI.options.editType.substr(0, 1) != "2") {
              OfficeAPI.options.editType = "2,0";
            }

            _context6.next = 3;
            return this.checkOpenState();

          case 3:
            if (_context6.sent) {
              _context6.next = 5;
              break;
            }

            return _context6.abrupt("return");

          case 5:
            _context6.next = 7;
            return UpdateParams({
              editType: OfficeAPI.options.editType
            });

          case 7:
            _context6.next = 9;
            return this.activeOfficeOcx();

          case 9:
            return _context6.abrupt("return", true);

          case 10:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x3) {
    return _ref5.apply(this, arguments);
  };
}();

wpsPlugin.prototype.openFile = function (isForceRefresh) {
  var openDoc = _wps['openDoc'].action;
  return openDoc();
};
/**
 * 获取wps当前版本号，用于判断是否支持静默加载
 */


wpsPlugin.prototype.getWpsClientBuild = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
  var clientType,
      res,
      build,
      _args7 = arguments;
  return regeneratorRuntime.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          clientType = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : "wps";
          // 获取存储的wps版本信息，不再多次请求wps
          res = OfficeUtils.getPluginStroageInfo({
            storage: OfficeAPI.internalParam.wpsCurrentBuild
          });

          if (!res) {
            _context7.next = 4;
            break;
          }

          return _context7.abrupt("return", res.wpsBuild);

        case 4:
          _context7.next = 6;
          return GetWpsClientBuild(clientType);

        case 6:
          build = _context7.sent;

          if (build) {
            _context7.next = 11;
            break;
          }

          _context7.next = 10;
          return GetWpsClientBuild(clientType);

        case 10:
          build = _context7.sent;

        case 11:
          if (build) {
            OfficeUtils.setPluginStroageInfo({
              storage: OfficeAPI.internalParam.wpsCurrentBuild,
              info: {
                wpsBuild: build
              }
            });
          }

          return _context7.abrupt("return", build);

        case 13:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
}));
/**
 * 保存Office正文
 */

wpsPlugin.prototype.saveOffice = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
  var cache, stringifyCircularHandler, oaParams, forceSaveParam, coptyParam, docIsEmpty, isContinue, docExistFlag;
  return regeneratorRuntime.wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          stringifyCircularHandler = function _stringifyCircularHan(key, value) {
            if (typeof value === "function") return;
            if (key === "officeDom") return;

            if (_typeof(value) === 'object' && value !== null) {
              if (cache.indexOf(value) !== -1) {
                return;
              }

              cache.push(value);
            }

            return value;
          };

          // 参数过滤方法
          cache = [];
          oaParams = OfficeAPI.options;

          if (!(WpsConstent.renderWpsFlag == ConstantEnum.YES)) {
            _context8.next = 39;
            break;
          }

          forceSaveParam = {
            openFileId: oaParams.fileId,
            newFileId: oaParams.wpsNewFileId
          }; // 通过wps进行保存

          coptyParam = JSON.parse(JSON.stringify(WpsConstent.wpsBackParams, stringifyCircularHandler));

          if (!isEmptyObject(coptyParam)) {
            _context8.next = 11;
            break;
          }

          _context8.next = 9;
          return this.checkOpenState();

        case 9:
          if (_context8.sent) {
            _context8.next = 11;
            break;
          }

          return _context8.abrupt("return", false);

        case 11:
          if (!(window.top.wpsCanUseSlient && oaParams.checkWordEmpty)) {
            _context8.next = 28;
            break;
          }

          _context8.next = 14;
          return this.checkOpenState();

        case 14:
          if (_context8.sent) {
            _context8.next = 16;
            break;
          }

          return _context8.abrupt("return", false);

        case 16:
          _context8.next = 18;
          return CheckDocIsEmpty();

        case 18:
          docIsEmpty = _context8.sent;

          if (!docIsEmpty) {
            _context8.next = 28;
            break;
          }

          _context8.next = 22;
          return this.confirmAsync($.i18n("wpsplugin.wpstab.bodyConIsEmpty"));

        case 22:
          isContinue = _context8.sent;

          if (!isContinue) {
            _context8.next = 27;
            break;
          }

          forceSaveParam.checkWordEmpty = false;
          _context8.next = 28;
          break;

        case 27:
          return _context8.abrupt("return", false);

        case 28:
          _context8.next = 30;
          return ForceSaveDoc(forceSaveParam);

        case 30:
          docExistFlag = _context8.sent;

          if (!(window.top.wpsCanUseSlient && docExistFlag === ConstantEnum.YES)) {
            _context8.next = 35;
            break;
          }

          WpsConstent.closeClientComplete = false;
          _context8.next = 35;
          return CloseDocCallbackInfo();

        case 35:
          sleep(1000);

          if (!(docExistFlag == false)) {
            _context8.next = 38;
            break;
          }

          return _context8.abrupt("return", false);

        case 38:
          if (docExistFlag == ConstantEnum.NO) {
            if (oaParams.wpsNewFileId && oaParams.wpsNewFileId != WpsConstent.wpsBackParams.fileId) {
              coptyParam["fileId"] = forceSaveParam.openFileId;
              coptyParam["newFileId"] = oaParams.wpsNewFileId;
            } else if (oaParams.wpsNewFileId && oaParams.wpsNewFileId != forceSaveParam.openFileId) {
              // 存为模板后，保存待发
              coptyParam["fileId"] = forceSaveParam.openFileId;
              coptyParam["newFileId"] = oaParams.wpsNewFileId;
            } else {
              coptyParam["newFileId"] = "";
            }

            wpsUtils.oaCopyToTrans(JSON.stringify(coptyParam));
          } else {
            if (oaParams.wpsNewFileId && oaParams.wpsNewFileId != oaParams.fileId) {
              oaParams.fileId = oaParams.wpsNewFileId;
            }

            WpsConstent.saveFileCallback(oaParams, ConstantEnum.NO);
          }

        case 39:
          return _context8.abrupt("return", true);

        case 40:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8, this);
}));
/**
 * 修改正文
 */

wpsPlugin.prototype.modifyContent = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(canSign) {
    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return onBtnEditContent();

          case 2:
            return _context9.abrupt("return", true);

          case 3:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function (_x4) {
    return _ref8.apply(this, arguments);
  };
}();
/**
 * 签章
 */


wpsPlugin.prototype.doSignature = function () {};
/**
 * 删除Office文档中的批注
 */


wpsPlugin.prototype.delComments = function () {};
/**
 * Office文档是否有批注，备注：批注是Office软件自身的批注，和老插件的手写批注不是一个东西，和痕迹也不是一个东西；
 */


wpsPlugin.prototype.hasComment = function () {};
/**
 * 清除Office文档中的痕迹
 */


wpsPlugin.prototype.removeTrail = function () {};
/**
 * Word 转 PDF
 * @param  newPdfID 转化后的PDF的正文的ID
 */


wpsPlugin.prototype.transformWordToPdf = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(newPdfID) {
    var ret;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context10.sent) {
              _context10.next = 4;
              break;
            }

            return _context10.abrupt("return", false);

          case 4:
            _context10.next = 6;
            return _WpsInvoke({
              "TransFileFormat": {
                fileId: newPdfID,
                forceFlag: ConstantEnum.YES,
                // 强制关闭
                suffix: ".pdf"
              }
            }, "wps", false);

          case 6:
            ret = _context10.sent;
            _context10.next = 9;
            return oaMessageCallback({
              key: "saveOriginalContentIdComplete",
              value: true
            });

          case 9:
            return _context10.abrupt("return", wpsUtils.strToObj(ret));

          case 10:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function (_x5) {
    return _ref9.apply(this, arguments);
  };
}();
/**
 * Word 转 OFD
 * @param  newOfdID 转化后的ofd的正文的ID
 */


wpsPlugin.prototype.transformWordToOfd = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(newOfdID) {
    var ret;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context11.sent) {
              _context11.next = 4;
              break;
            }

            return _context11.abrupt("return", false);

          case 4:
            _context11.next = 6;
            return _WpsInvoke({
              "TransFileFormat": {
                fileId: newOfdID,
                forceFlag: ConstantEnum.YES,
                // 强制关闭
                suffix: ".ofd"
              }
            }, "wps", false);

          case 6:
            ret = _context11.sent;
            _context11.next = 9;
            return oaMessageCallback({
              key: "saveOriginalContentIdComplete",
              value: true
            });

          case 9:
            return _context11.abrupt("return", wpsUtils.strToObj(ret));

          case 10:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this);
  }));

  return function (_x6) {
    return _ref10.apply(this, arguments);
  };
}();
/**
 * 获取WPS已安装插件列表
 * @param callback
 */


wpsPlugin.prototype.getPublishlist = function (callback, async) {
  var _this = this;

  WpsAddonMgr.getAllConfig(function (data) {
    var pluginList = [];
    var isRuning = true;

    if (data.status == 0 && data.response != "") {
      pluginList = JSON.parse(data.response);
    } else if (data.status == 2) {
      isRuning = false;
    }

    _this.isAvailable = isRuning;
    callback(pluginList, isRuning);
  });
};
/**
 * WPS加载项 是否可以用
 */


wpsPlugin.prototype.isOfficeAvailable = function () {
  var _this2 = this;

  return new Promise(function (resolve, reject) {
    var wpsCanUse = true;

    _this2.getPublishlist(function (pluginList) {
      if (!pluginList || pluginList.length == 0) {
        wpsCanUse = false;
      } else {
        var webRoot = OfficeUtils.getWebRoot();

        for (var i = 0, k = pluginList.length; i < k; i++) {
          var pluginURL = pluginList[i].url || "";
          var name = pluginList[i].name || "";
          var enable = pluginList[i].enable; // oa加载项只有这2个“EtOAAssist”“WpsOAAssist”，其他加载项无需考虑

          if (name != 'EtOAAssist' && name != "WpsOAAssist") {
            console.warn("注意：WPS 存在其他加载项，可能导致数据错误！name=" + name + ";pluginURL=" + pluginURL);
            continue;
          }

          if (enable == "false" || pluginURL.indexOf(webRoot) == -1) {
            wpsCanUse = false;
            break;
          }
        }
      }

      resolve(wpsCanUse);
    }, true);
  });
};
/**
 * wps服务是否启动当中 通过判断版本号
 * @param {*} params 
 * @returns 
 */


wpsPlugin.prototype.getVersion = function () {
  return new Promise(function (resolve) {
    WpsInvoke.GetVersion(function (res) {
      if (res && res.status == 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
/**
 * 启用加载项【单个】
 * @param {*} pluginDatas
 */


wpsPlugin.prototype.enable = function () {
  var pluginData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new Promise(function (resolve) {
    WpsAddonMgr.enable(pluginData, function (res) {
      if (res && res.status == 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
/**
 * 禁用加载项【单个】
 * @param {*} pluginDatas
 */


wpsPlugin.prototype.disable = function () {
  var pluginData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new Promise(function (resolve) {
    WpsAddonMgr.disable(pluginData, function (res) {
      if (res && res.status == 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
/**
 * 禁用加载项【批量】
 * @param {*} pluginDatas
 */


wpsPlugin.prototype.disableall = function () {
  var pluginData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new Promise(function (resolve) {
    WpsAddonMgr.disableall(pluginData, function (res) {
      if (res && res.status == 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};
/**
 * 启用/禁用加载项【批量】
 * @param {*} pluginDatas
 * @param {*} type
 */


wpsPlugin.prototype.WpsAddonHandleEx = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
  var pluginDatas,
      type,
      addonEnable,
      i,
      pluginData,
      enable,
      _i,
      _pluginData,
      disable,
      _i2,
      _pluginData2,
      _disable,
      _args12 = arguments;

  return regeneratorRuntime.wrap(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          pluginDatas = _args12.length > 0 && _args12[0] !== undefined ? _args12[0] : [];
          type = _args12.length > 1 && _args12[1] !== undefined ? _args12[1] : "enable";
          addonEnable = true;
          _context12.t0 = type;
          _context12.next = _context12.t0 === "enable" ? 6 : _context12.t0 === "disable" ? 19 : _context12.t0 === "disableall" ? 32 : 45;
          break;

        case 6:
          i = 0;

        case 7:
          if (!(i < pluginDatas.length)) {
            _context12.next = 18;
            break;
          }

          pluginData = pluginDatas[i];
          _context12.next = 11;
          return this.enable(pluginData);

        case 11:
          enable = _context12.sent;

          if (enable) {
            _context12.next = 15;
            break;
          }

          addonEnable = false;
          return _context12.abrupt("break", 18);

        case 15:
          i++;
          _context12.next = 7;
          break;

        case 18:
          return _context12.abrupt("break", 46);

        case 19:
          _i = 0;

        case 20:
          if (!(_i < pluginDatas.length)) {
            _context12.next = 31;
            break;
          }

          _pluginData = pluginDatas[_i];
          _context12.next = 24;
          return this.disable(_pluginData);

        case 24:
          disable = _context12.sent;

          if (disable) {
            _context12.next = 28;
            break;
          }

          addonEnable = false;
          return _context12.abrupt("break", 31);

        case 28:
          _i++;
          _context12.next = 20;
          break;

        case 31:
          return _context12.abrupt("break", 46);

        case 32:
          _i2 = 0;

        case 33:
          if (!(_i2 < pluginDatas.length)) {
            _context12.next = 44;
            break;
          }

          _pluginData2 = pluginDatas[_i2];
          _context12.next = 37;
          return this.disableall(_pluginData2);

        case 37:
          _disable = _context12.sent;

          if (_disable) {
            _context12.next = 41;
            break;
          }

          addonEnable = false;
          return _context12.abrupt("break", 44);

        case 41:
          _i2++;
          _context12.next = 33;
          break;

        case 44:
          return _context12.abrupt("break", 46);

        case 45:
          return _context12.abrupt("break", 46);

        case 46:
          return _context12.abrupt("return", addonEnable);

        case 47:
        case "end":
          return _context12.stop();
      }
    }
  }, _callee12, this);
}));
/**
 * 统计正文中的书签的数量
 */

wpsPlugin.prototype.countBookmarks = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
  var count;
  return regeneratorRuntime.wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          if (!(OfficeAPI.defaultOptions.ClientType == 'wps')) {
            _context13.next = 9;
            break;
          }

          _context13.next = 3;
          return this.checkOpenState();

        case 3:
          if (_context13.sent) {
            _context13.next = 5;
            break;
          }

          return _context13.abrupt("return", 0);

        case 5:
          _context13.next = 7;
          return GetBookmarkFieldCount(OfficeAPI.options.fileId, OfficeAPI.defaultOptions.ClientType);

        case 7:
          count = _context13.sent;
          return _context13.abrupt("return", count);

        case 9:
          return _context13.abrupt("return", 0);

        case 10:
        case "end":
          return _context13.stop();
      }
    }
  }, _callee13, this);
}));
/**
 * 删除书签
 */

wpsPlugin.prototype.delBookMarks = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
  return regeneratorRuntime.wrap(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          if (!(OfficeAPI.defaultOptions.ClientType == 'wps')) {
            _context14.next = 7;
            break;
          }

          _context14.next = 3;
          return this.checkOpenState();

        case 3:
          if (_context14.sent) {
            _context14.next = 5;
            break;
          }

          return _context14.abrupt("return", false);

        case 5:
          _context14.next = 7;
          return DeleteBookMarks(OfficeAPI.options.fileId);

        case 7:
          return _context14.abrupt("return", true);

        case 8:
        case "end":
          return _context14.stop();
      }
    }
  }, _callee14, this);
}));
/**
 * 获取文件大小
 */

wpsPlugin.prototype.getFileSize = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
  var _OfficeAPI$options, webRoot, fileId, xhrFun;

  return regeneratorRuntime.wrap(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _OfficeAPI$options = OfficeAPI.options, webRoot = _OfficeAPI$options.webRoot, fileId = _OfficeAPI$options.fileId;
          xhrFun = $.ajax ? $.ajax : window.top.jQuery.ajax;
          return _context15.abrupt("return", new Promise(function (resolve) {
            xhrFun({
              url: "".concat(webRoot, "/rest/office/file/info?fileId=").concat(fileId),
              type: 'GET',
              success: function success(msg) {
                if (msg.code == 0 && msg.data) {
                  var size = msg.data.size; // Byte

                  // Byte
                  var fileSize = Math.round(size / 1024); // Kb

                  // Kb
                  resolve(fileSize);
                } else {
                  //文件可能为空
                  resolve(0);
                }
              },
              error: function error(err) {
                resolve(0);
              }
            });
          }));

        case 3:
        case "end":
          return _context15.stop();
      }
    }
  }, _callee15);
}));
/**
 * office正文打印
 */

wpsPlugin.prototype.officePrint = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
  return regeneratorRuntime.wrap(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _context16.next = 2;
          return this.checkOpenState();

        case 2:
          if (_context16.sent) {
            _context16.next = 4;
            break;
          }

          return _context16.abrupt("return", false);

        case 4:
          wpsOfficePrint(OfficeAPI.options.fileId);
          return _context16.abrupt("return", true);

        case 6:
        case "end":
          return _context16.stop();
      }
    }
  }, _callee16, this);
}));
/**
 * 是否有专业签章
 */

wpsPlugin.prototype.hasSpecialSignature = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
  var result;
  return regeneratorRuntime.wrap(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _context17.next = 2;
          return this.checkOpenState();

        case 2:
          if (_context17.sent) {
            _context17.next = 4;
            break;
          }

          return _context17.abrupt("return", false);

        case 4:
          _context17.next = 6;
          return HasSpecialSignature(OfficeAPI.options.fileId, OfficeAPI.defaultOptions.ClientType);

        case 6:
          result = _context17.sent;
          return _context17.abrupt("return", result);

        case 8:
        case "end":
          return _context17.stop();
      }
    }
  }, _callee17, this);
}));
/**
 * 是否有图片签章
 *
 * @param sign  true/false true：签章 false:签名
 */

wpsPlugin.prototype.countSignatures = /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(sign) {
    var result;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _context18.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context18.sent) {
              _context18.next = 4;
              break;
            }

            return _context18.abrupt("return", false);

          case 4:
            _context18.next = 6;
            return HasPicSignature(OfficeAPI.options.fileId, OfficeAPI.defaultOptions.ClientType);

          case 6:
            result = _context18.sent;
            return _context18.abrupt("return", result);

          case 8:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, this);
  }));

  return function (_x7) {
    return _ref17.apply(this, arguments);
  };
}();
/**
 * 文档是否加载完成
 */


wpsPlugin.prototype.isDocomentLoaded = function () {
  if (OfficeAPI.options) {
    return OfficeAPI.options.isLoadOfficeFile;
  }

  return false;
};
/**
 * 是否Office插件加载完成
 */


wpsPlugin.prototype.isOfficeReady = function () {};
/**
 * Office组件提供的确认对话框，确保弹出框在Office控件的前面不会跑到后面去
 */


wpsPlugin.prototype.confirm = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19(confirmText) {
    return regeneratorRuntime.wrap(function _callee19$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            _context19.next = 2;
            return this.confirmAsync(confirmText);

          case 2:
            return _context19.abrupt("return", _context19.sent);

          case 3:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee19, this);
  }));

  return function (_x8) {
    return _ref18.apply(this, arguments);
  };
}();
/**
 * 异步方式使用组件$.confirm
 * @param {*} confirmText 
 */


wpsPlugin.prototype.confirmAsync = function (confirmText) {
  if ($ && $.confirm) {
    return new Promise(function (resolve, rejcet) {
      var confirm = $.confirm({
        msg: confirmText,
        ok_fn: function ok_fn() {
          confirm.close();
          resolve(true);
        },
        cancel_fn: function cancel_fn() {
          confirm.close();
          resolve(false);
        }
      });
    });
  } else {
    return this.confirm(confirmText);
  }
};
/**
 * Office组件提供的提示框，确保弹出框在Office控件的前面不会跑到后面去
 */


wpsPlugin.prototype.alert = function (alertText) {
  return alert(alertText);
};
/**
 * 文件是否被修改
 */


wpsPlugin.prototype.bodyIsModified = function () {
  // 验证wps是已经保存
  if (window.WpsConstent.changeFlag == ConstantEnum.YES) {
    return true;
  }

  return false;
};
/**
 * 公文套红更新书签值
 */


wpsPlugin.prototype.refreshEdocTaohong = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20(dataForm, docMarkVal, activeWpsOffice) {
    var allData, i, oneData, label, dataValue, child, inputNode, tagN, fieldVal, comp, editData, parentData, f, keys, index, a, tagName, opinionArr, wpsTaohongParam;
    return regeneratorRuntime.wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            isAlertProtectFile = false;
            allData = dataForm.find("[id^=field]");
            i = 0;

          case 3:
            if (!(i < allData.length)) {
              _context20.next = 30;
              break;
            }

            oneData = allData[i];
            label = oneData.getAttribute("mappingField");
            dataValue = oneData.getAttribute("text");

            if (undefined == dataValue || null == dataValue || "" == dataValue) {
              dataValue = oneData.innerText;
            }

            if (undefined == dataValue || null == dataValue || "" == dataValue) {
              dataValue = oneData.value;
            } //公文模板中绑定套红模板，拟文时提示是否自动更新文单中书签内容，点取消，只更新一部分书签


            if (undefined == dataValue || null == dataValue || "" == dataValue) {
              child = oneData.childNodes;

              if (child != null && child.length > 0) {
                inputNode = child.item(0);
                tagN = inputNode.nodeName;

                if (tagN != "undefined" && (tagN == "INPUT" || tagN == "inputs")) {
                  dataValue = inputNode.value;
                }
              }
            }

            fieldVal = oneData.getAttribute("fieldVal");
            comp = oneData.getAttribute("comp");
            editData = oneData.children.item(0);

            if (undefined != fieldVal) {
              fieldVal = eval('(' + fieldVal + ')');
            }

            tagN = oneData.nodeName;

            if (!(tagN != "undefined" && (tagN == "INPUT" || tagN == "inputs"))) {
              _context20.next = 23;
              break;
            }

            //如果是编辑状态的意见
            parentData = oneData.parentNode.parentNode;

            if (!("undefined" != parentData && (parentData.nodeName == "SPAN" || parentData.nodeName == "span"))) {
              _context20.next = 23;
              break;
            }

            f = parentData.getAttribute("fieldVal");

            if (!("undefined" != f && null != f)) {
              _context20.next = 23;
              break;
            }

            f = eval('(' + f + ')');

            if (!(f.inputType == 'edocflowdealoption')) {
              _context20.next = 23;
              break;
            }

            return _context20.abrupt("continue", 27);

          case 23:
            keys = ["请选择机构代字", "請選擇機構代字", "请选择内部文号", "請選擇內部文號", "please choose innser mark", "请选择公文文号", "請選擇公文文號", "please choose mark"];

            if (tagN != "undefined" && (tagN == "SELECT" || tagN == "select")) {
              index = oneData.selectedIndex;
              dataValue = oneData.options[index].text;

              if (label == 'serial_no') {
                //当内部文号为空时不设置书签
                if (inArray(dataValue, keys) > -1) {
                  dataValue = "";
                } else {
                  if (typeof index != "undefined" && undefined != oneData.options[index] && null != oneData.options[index]) {
                    dataValue = oneData.options[index].value;

                    if (dataValue && dataValue != "") {
                      a = dataValue.split("|");

                      if (a.length > 1) {
                        dataValue = a[1];
                      } else {
                        dataValue = oneData.options[index].value;
                      }
                    }
                  }
                }
              }

              if (label == 'doc_mark') {
                //当来文文号为空时不设置书签
                if (inArray(dataValue, keys) > -1) {
                  dataValue = "";
                } else {
                  if (typeof index != "undefined" && undefined != oneData.options[index] && null != oneData.options[index]) {
                    dataValue = oneData.options[index].value;

                    if (dataValue && dataValue != "") {
                      a = dataValue.split("|");

                      if (a.length > 1) {
                        dataValue = a[1];
                      } else {
                        dataValue = oneData.options[index].value;
                      }
                    }
                  }
                }

                if (typeof docMarkVal != 'undefined' && null != docMarkVal) {
                  dataValue = docMarkVal;
                }
              }
            }

            if (undefined != fieldVal) {
              if (undefined == label) {
                label = fieldVal.name;
              }

              if (undefined != editData) {
                tagName = editData.nodeName;

                if (tagName != "undefined" && (tagName == "SELECT" || tagName == "select")) {
                  index = editData.selectedIndex;

                  if (index) {
                    dataValue = editData.options[index].text;
                  }
                }

                if (fieldVal.inputType == 'edocflowdealoption' && tagName != "undefined" && (tagName == "DIV" || tagName == "div")) {
                  a = editData.innerText;
                  a = a.replace(/\s+/g, "");

                  if (a == "") {
                    dataValue = "";
                  }
                }

                if (fieldVal.fieldType == 'TIMESTAMP' && tagName != "undefined" && (tagName == "INPUT" || tagName == "input")) {
                  dataValue = editData.getAttribute("value");
                }

                if ((fieldVal.inputType == 'member' || fieldVal.inputType == 'account' || fieldVal.inputType == 'department' || fieldVal.inputType == 'post') && tagName != "undefined" && (tagName == "INPUT" || tagName == "input")) {
                  dataValue = editData.getAttribute("title");
                }

                if (fieldVal.inputType == 'edocDocMark' || fieldVal.inputType == 'edocInnerMark') {
                  editData = oneData.children.item(0);

                  if (undefined != editData && null != editData) {
                    if (undefined != editData && (tagName == "SELECT" || tagName == 'select')) {
                      index = editData.selectedIndex;

                      if (index) {
                        dataValue = editData.options[index].text;
                      }
                    }
                  }
                }
              }
            }

            if (undefined != dataValue && null != dataValue && label != null) {
              try {
                setLable(label, dataValue);
                /**
                 *  V5-20603 wps加载项 :预置套红模板公文域套红后，修改文单更新书签-签发人不更新 
                 *  增加中文名称映射
                 */

                setAllLabel4chinese(label, dataValue);
              } catch (e) {
                alert(e);
              }
            }

          case 27:
            i++;
            _context20.next = 3;
            break;

          case 30:
            //old意见套红
            taohongOpinionOld("edoc");

            try {
              // 修改正文刷新书签
              opinionArr = getGovdocOpinionsForTaoHong("govdoc");
              taohongOpinion(opinionArr);
            } catch (e) {
              window.console && console.warn && console.warn("refreshEdocTaohong方法", e);
            }

            wpsTaohongParam = {
              // 执行操作
              fileId: OfficeAPI.options.fileId,
              handleType: HANDLE_TYPE.FormInsertRed,
              isClearDocument: ConstantEnum.NO,
              // 模版id,刷新套红不需要
              templateUrl: "",
              redFileElement: redFileElement,
              editType: "1,0"
            };
            _context20.next = 35;
            return this.checkOpenState();

          case 35:
            if (_context20.sent) {
              _context20.next = 37;
              break;
            }

            return _context20.abrupt("return", false);

          case 37:
            _context20.next = 39;
            return InsertRedHead(wpsTaohongParam);

          case 39:
            if (!(activeWpsOffice != 'N')) {
              _context20.next = 42;
              break;
            }

            _context20.next = 42;
            return this.activeOfficeOcx();

          case 42:
            return _context20.abrupt("return", true);

          case 43:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, this);
  }));

  return function (_x9, _x10, _x11) {
    return _ref19.apply(this, arguments);
  };
}();
/**
 * 老公文套红意见
 * @param type
 */


function taohongOpinionOld(type) {
  try {
    var opinionArr = getOpinionsForTaoHong(type);
    var opinions = opinionArr[0];
    var senderOpinion = opinionArr[1];

    if (opinions) {
      for (var i = 0; i < opinions.length; i++) {
        oldsetLable(opinions[i][0], opinions[i][1].replace(/(\n)+|(\r\n)+/g, "\r\n"));
      }
    }

    if (senderOpinion) {
      oldsetLable("niwen", senderOpinion);
      oldsetLable("dengji", senderOpinion);
    }
  } catch (e) {}
}

function oldsetLable(mylable, mycontent) {
  if (mylable.search("date") != -1) {
    //名称中包括了data就为date数据类型
    if (mylable == "signing_date") {
      //签发日期根据公文开关转化为大小写。
      var isSwitch = false;

      if (contentIframe) {
        var sendForm = contentIframe.document.getElementById("sendForm");

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
        mycontent = date2chinese0(mycontent);
      } else {
        mycontent = date2chinese1(mycontent);
      }
    } else {
      mycontent = date2chinese1(mycontent);
    }
  } //套红时发文单位显示格式


  if (mylable.search("send_unit") != -1) {
    if (contentIframe) {
      var sendForm = contentIframe.document.getElementById("sendForm");

      if (sendForm.taohongSendUnitType && sendForm.taohongSendUnitType.value == 1) {
        var sendUnitName = getSendUnitName(mylable);

        if (sendUnitName != null && sendUnitName != "") {
          mycontent = sendUnitName;
        }
      }
    }
  }

  try {
    redFileElement[mylable] = mycontent;
  } catch (e) {
    alert(e);
  }
} //新公文 刷新Office中文中的Label.


wpsPlugin.prototype.refreshEdocOfficeLable = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(sendForm) {
    return regeneratorRuntime.wrap(function _callee21$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            _context21.next = 2;
            return this.refreshEdocTaohong(sendForm);

          case 2:
            return _context21.abrupt("return", _context21.sent);

          case 3:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee21, this);
  }));

  return function (_x12) {
    return _ref20.apply(this, arguments);
  };
}();
/**
 * 激活WPS控件
 * @returns 
 */


wpsPlugin.prototype.activeOfficeOcx = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
  return regeneratorRuntime.wrap(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          _context22.next = 2;
          return WpsConstent.popUpWps();

        case 2:
          return _context22.abrupt("return", _context22.sent);

        case 3:
        case "end":
          return _context22.stop();
      }
    }
  }, _callee22);
}));
/**
 * 表单套红,不套入正文
 * @param {*} params 
 * @param {*} templateUrl 
 * @returns 
 */

wpsPlugin.prototype.formTaohong = /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23(params, templateUrl) {
    var i, type, book, val, imgValObj, valArray, imgVal, str, tables, _i3, len, tableData, wpsTaohongParam;

    return regeneratorRuntime.wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < params.length)) {
              _context23.next = 20;
              break;
            }

            type = params[i].inputType;
            book = params[i].target;
            val = params[i].value; // if(type == "handwrite" && isChinaOs()){//国产化不支持签章
            //     continue;
            // }

            if (!(type == "image" || type == "handwrite" || type == "barcode")) {
              _context23.next = 16;
              break;
            }

            imgValObj = {
              inputType: type
            };

            if (type == "image" && val) {
              valArray = val.split("_");
              val = valArray[0];
              imgValObj["createDate"] = valArray[1];
            }

            if (!(book == "" || val == "")) {
              _context23.next = 10;
              break;
            }

            return _context23.abrupt("continue", 17);

          case 10:
            imgValObj["value"] = val;
            imgValObj["isSignatrue"] = "false";
            imgVal = [["imgsign", imgValObj]];
            redFileElement[book] = imgVal;
            _context23.next = 17;
            break;

          case 16:
            if (type == "flowdealoption") {
              if (val && val.indexOf("@signet@") != -1) {
                str = val.match(/@signet@(\S*)@signet@/);

                if (str && str.length > 0) {
                  val = val.replace(str[0], "");
                }
              }

              redFileElement[book] = val;
            } else if (type === 'table' && val.type === 'table') {
              // 因为明细表的数据结构稍微不同需要整理兼容数据结构
              tables = val.tables || [];

              for (_i3 = 0, len = tables.length; _i3 < len; _i3++) {
                tableData = tables[_i3];
                redFileElement[tableData.orgName] = _objectSpread({
                  type: 'table'
                }, tableData);
              }
            } else {
              redFileElement[book] = val;
            }

          case 17:
            i++;
            _context23.next = 1;
            break;

          case 20:
            wpsTaohongParam = {
              fileId: OfficeAPI.options.fileId,
              // 执行操作
              handleType: HANDLE_TYPE.FormInsertRed,
              isClearDocument: ConstantEnum.NO,
              // 模版id
              templateUrl: templateUrl,
              redFileElement: redFileElement,
              editType: "1,0"
            };
            _context23.next = 23;
            return this.checkOpenState();

          case 23:
            if (_context23.sent) {
              _context23.next = 25;
              break;
            }

            return _context23.abrupt("return", false);

          case 25:
            _context23.next = 27;
            return InsertRedHead(wpsTaohongParam);

          case 27:
            _context23.next = 29;
            return this.activeOfficeOcx();

          case 29:
            return _context23.abrupt("return", true);

          case 30:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, this);
  }));

  return function (_x13, _x14) {
    return _ref22.apply(this, arguments);
  };
}(); // 文单套红


wpsPlugin.prototype.taoHong4Form = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24(taoHongCallBack) {
    var displayNameStr;
    return regeneratorRuntime.wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            _context24.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context24.sent) {
              _context24.next = 4;
              break;
            }

            return _context24.abrupt("return", false);

          case 4:
            _context24.prev = 4;
            _context24.next = 7;
            return GetDocFieldOrBookMarksNames(OfficeAPI.options.fileId);

          case 7:
            displayNameStr = _context24.sent;

            if (displayNameStr) {
              taoHongCallBack(OfficeAPI.options.formDataId, displayNameStr);
            }

            _context24.next = 14;
            break;

          case 11:
            _context24.prev = 11;
            _context24.t0 = _context24["catch"](4);
            window.console && console.log && console.log(_context24.t0);

          case 14:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, this, [[4, 11]]);
  }));

  return function (_x15) {
    return _ref23.apply(this, arguments);
  };
}();

wpsPlugin.prototype.taoHongHt = /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25(formdata, activeWpsOffice) {
    var i, formBean, beanVal, beanName, beanType, imgValObj, valArray, imgVal, str, wpsTaohongParam;
    return regeneratorRuntime.wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _context25.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context25.sent) {
              _context25.next = 4;
              break;
            }

            return _context25.abrupt("return", false);

          case 4:
            i = 0;

          case 5:
            if (!(i < formdata.data.length)) {
              _context25.next = 26;
              break;
            }

            formBean = formdata.data[i];

            if (!formBean) {
              _context25.next = 23;
              break;
            }

            beanVal = formBean.val;
            beanName = formBean.name;
            beanType = formBean.type;

            if (!(beanType == "image" || beanType == "handwrite" || beanType == "barcode" || beanType == "mapphoto")) {
              _context25.next = 22;
              break;
            }

            imgValObj = {
              inputType: beanType
            };

            if ((beanType == "image" || beanType == "mapphoto") && beanVal) {
              valArray = beanVal.split("_");
              beanVal = valArray[0];
              imgValObj["createDate"] = valArray[1];
            }

            if (!(beanName == "" || beanVal == "")) {
              _context25.next = 16;
              break;
            }

            return _context25.abrupt("continue", 23);

          case 16:
            imgValObj["value"] = beanVal;
            imgValObj["isSignatrue"] = "false";
            imgVal = [["imgsign", imgValObj]];
            redFileElement[beanName] = imgVal;
            _context25.next = 23;
            break;

          case 22:
            if (beanType == "flowdealoption") {
              // 套签章？
              if (beanVal && beanVal.indexOf("@signet@") != -1) {
                str = beanVal.match(/@signet@(\S*)@signet@/);

                if (str && str.length > 0) {
                  beanVal = beanVal.replace(str[0], "");
                }
              }

              redFileElement[beanName] = beanVal;
            } else {
              redFileElement[beanName] = beanVal;
            }

          case 23:
            i++;
            _context25.next = 5;
            break;

          case 26:
            wpsTaohongParam = {
              fileId: OfficeAPI.options.fileId,
              isClearDocument: ConstantEnum.NO,
              // 执行操作
              handleType: HANDLE_TYPE.FormInsertRed,
              // 模版id
              templateUrl: "",
              redFileElement: redFileElement,
              //插入正文对应的元素
              bkInsertFile: 'Content',
              //Content
              zhInsertFile: '正文',
              //正文
              editType: OfficeAPI.options.editType || "1,0"
            };
            _context25.next = 29;
            return InsertRedHead(wpsTaohongParam);

          case 29:
            if (!(activeWpsOffice != ConstantEnum.NO)) {
              _context25.next = 32;
              break;
            }

            _context25.next = 32;
            return this.activeOfficeOcx();

          case 32:
            return _context25.abrupt("return", true);

          case 33:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, this);
  }));

  return function (_x16, _x17) {
    return _ref24.apply(this, arguments);
  };
}(); //office正文套红


wpsPlugin.prototype.edocTaohong = /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26(dataForm, templateUrl, templateType, dataList, opinionArr, isFullSize, isold, addParams) {
    return regeneratorRuntime.wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            if (!(typeof isold != 'undefined' && isold)) {
              _context26.next = 4;
              break;
            }

            alert("加载项不支持"); // if(templateType=="edoc"){
            //     this.oldTaoHongEdocContent(dataForm,templateUrl,templateType,dataList);
            // }else{
            //     this.oldTaohongForm(dataForm,templateUrl,templateType,dataList);
            // }

            _context26.next = 7;
            break;

          case 4:
            _context26.next = 6;
            return this.taohong(dataForm, templateUrl, templateType, dataList, opinionArr, isFullSize, addParams);

          case 6:
            return _context26.abrupt("return", _context26.sent);

          case 7:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, this);
  }));

  return function (_x18, _x19, _x20, _x21, _x22, _x23, _x24, _x25) {
    return _ref25.apply(this, arguments);
  };
}();
/**
 * 检查当前wps有没有加载正文，没有则加载，加载成功后返回true
 * @returns {boolean}
 */


wpsPlugin.prototype.checkOpenState = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
  var param, clientType;
  return regeneratorRuntime.wrap(function _callee27$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          if (!WpsConstent.invokeIsLoading) {
            _context27.next = 2;
            break;
          }

          return _context27.abrupt("return", new Promise(function (reslve, rejcet) {
            var interval = setInterval(function () {
              if (WpsConstent.invokeIsLoading === false) {
                clearInterval(interval);
                reslve(true);
              }
            }, 100);
          }));

        case 2:
          _context27.next = 4;
          return this.isOfficeAvailable();

        case 4:
          if (_context27.sent) {
            _context27.next = 6;
            break;
          }

          return _context27.abrupt("return", false);

        case 6:
          _context27.prev = 6;
          param = {
            fileId: OfficeAPI.options.fileId
          }; // 兼容实例没有初始化时进行操作

          if (typeof wpsClient != "undefined" && wpsClient === null && OfficeAPI.options.fileType) {
            clientType = getClientType(OfficeAPI.options.fileType);
            wpsClient = new WpsClient(clientType); //初始化一个多进程对象，多进程时才需要
          } // WPS没有打开文档，并且发送请求不阻塞


          _context27.next = 11;
          return IsOpenDocForFileId(param, getClientType(OfficeAPI.options.fileType || OfficeAPI.fileType));

        case 11:
          if (_context27.sent) {
            _context27.next = 22;
            break;
          }

          if (!(WpsConstent.sendWpsFailture != ConstantEnum.YES)) {
            _context27.next = 21;
            break;
          }

          this.isLoadOfficeFile = true;
          OfficeAPI.options.wpsPopupFlag = ConstantEnum.NO;
          _context27.next = 17;
          return this.loadOffice();

        case 17:
          // 静默加载不再清空参数
          if (!window.top.wpsCanUseSlient) {
            OfficeAPI.options.wpsPopupFlag = "";
          }

          return _context27.abrupt("return", true);

        case 21:
          return _context27.abrupt("return", false);

        case 22:
          return _context27.abrupt("return", true);

        case 25:
          _context27.prev = 25;
          _context27.t0 = _context27["catch"](6);
          window.console && console.log && console.log("WPS加载项未正常启用！" + _context27.t0);
          return _context27.abrupt("return", false);

        case 29:
        case "end":
          return _context27.stop();
      }
    }
  }, _callee27, this, [[6, 25]]);
}));
/**
 * 套红-获取文号流水号-按文号长度填充文号，如文号"1"长度为4，则返回"0001"
 */

function getFullMarkNumber(markFullNumber, markLength) {
  if (-1 == markFullNumber) {
    return "";
  }

  var str = "";

  if (markFullNumber) {
    markFullNumber = parseInt(markFullNumber) + "";
    markLength = parseInt(markLength);

    if (markFullNumber.length < markLength) {
      for (var i = 0; i < markLength - markFullNumber.length; i++) {
        str += "0";
      }
    } else if (markLength > 0 && markFullNumber.length > markLength) {
      markFullNumber = markFullNumber.slice(-markLength);
    }

    str += markFullNumber;
  }

  return str;
}

function setAllLable(dataForm, templateType, dataList, opinionArr) {
  if (templateType == "edoc") {
    // 正文套红
    edocTaoHong(dataForm, templateType, dataList, false);
  } else {
    // 文单套红
    edocTaoHong(dataForm, templateType, dataList, true);
  }

  taohongOpinion(opinionArr);
} // 从DOM中解析发文文号数据


function parseDocMarkFromDOM(dom) {
  var yearenabled = dom.getAttribute('yearenabled') === 'true' ? true : false;
  var suffix = dom.getAttribute("suffix") || '';
  var wordNo = dom.getAttribute("wordNo") || dom.getAttribute("title") || ''; //机构代字

  var yearNo = yearenabled ? dom.getAttribute("yearNo") : ''; //年号

  var markNumbe = (getFullMarkNumber(dom.getAttribute("markNumber"), dom.getAttribute("markLength")) || '') + suffix; //流水号

  var dataValue = wordNo + '〔' + yearNo + '〕' + markNumbe;
  return dataValue;
}

var isAlertProtectFile = false; //正文盖章后，套红时，弹出提示语“不允许您编辑此内容，因为它受保护”，这个变量用于是否弹出这个提示语

function edocTaoHong(dataForm, templateType, dataList, isOrNotEdoc) {
  isAlertProtectFile = false; //正文盖章后，套红时，弹出提示语“不允许您编辑此内容，因为它受保护”，这个变量用于是否弹出这个提示语

  var allData = dataForm.find("[id^=field]"); // 设置中文附件书签数据

  setAttachment4chinese();

  for (var i = 0; i < allData.length; i++) {
    var oneData = allData[i];
    var label = oneData.getAttribute("mappingField");
    var dataValue = oneData.getAttribute("text");

    if (undefined == dataValue || null == dataValue || "" == dataValue) {
      dataValue = oneData.value;
    }

    if (undefined == dataValue || null == dataValue || "" == dataValue) {
      dataValue = oneData.innerText;
    } // 公文模板中绑定套红模板，拟文时提示是否自动更新文单中书签内容，点取消，只更新一部分书签


    if (undefined == dataValue || null == dataValue || "" == dataValue) {
      var child = oneData.childNodes;

      if (child != null && child.length > 0) {
        var inputNode = child.item(0);
        var tagN = inputNode.nodeName;

        if (tagN != "undefined" && (tagN == "INPUT" || tagN == "inputs")) {
          dataValue = inputNode.value;
        }
      }
    }

    var fieldVal = oneData.getAttribute("fieldVal");
    var comp = oneData.getAttribute("comp");
    var editData = oneData.children.item(0);

    if (undefined != comp) {
      try {
        comp = eval('({' + comp + '})');
      } catch (e) {}
    }

    if (undefined != fieldVal) {
      fieldVal = eval('(' + fieldVal + ')');
    }

    if (undefined != label) {
      if (isOrNotEdoc) {
        //文单套红只是不套正文的内容，其他的都要套。
        if (label == "Content") {
          continue;
        }
      }
    }

    var tagN = oneData.nodeName;

    if (tagN != "undefined" && (tagN == "INPUT" || tagN == "inputs")) {
      var parentData = oneData.parentNode.parentNode;

      if ("undefined" != parentData && (parentData.nodeName == "SPAN" || parentData.nodeName == "span")) {
        //如果是编辑状态的意见
        var f = parentData.getAttribute("fieldVal");

        if ("undefined" != f && null != f) {
          f = eval('(' + f + ')');

          if (f.inputType == 'edocflowdealoption') {
            continue;
          }
        }
      }
    }

    if (tagN != "undefined" && (tagN == "SELECT" || tagN == "select")) {
      var index = oneData.selectedIndex;

      if (typeof index != "undefined" && oneData.options[index]) {
        dataValue = oneData.options[index].text;
      }

      if (label == 'serial_no') {
        //当内部文号为空时不设置书签
        if (dataValue == '请选择内部文号' || dataValue == '請選擇內部文號' || dataValue == 'please choose innser mark') {
          dataValue = "";
        } else {
          dataValue = oneData.value;
        }
      }

      if (label == 'doc_mark') {
        //当来文文号为空时不设置书签
        if (dataValue == '请选择机构代字' || dataValue == '請選擇機構代字' || dataValue == 'please choose mark') {
          dataValue = "";
        } else {
          dataValue = oneData.value;
        }
      }
    }

    if (undefined != fieldVal) {
      if (undefined == label) {
        label = fieldVal.name;
      }

      if (undefined != editData) {
        var tagName = editData.nodeName;

        if (tagName != "undefined" && (tagName == "SELECT" || tagName == "select") || fieldVal.inputType == "SElECT" || fieldVal.inputType == "select") {
          var index = editData.selectedIndex;

          if (typeof index != "undefined" && editData.options[index]) {
            dataValue = editData.options[index].text;
          }
        }

        if (fieldVal.inputType == 'edocflowdealoption' && tagName != "undefined" && (tagName == "DIV" || tagName == "div")) {
          var a = editData.innerText;
          a = a.replace(/\s+/g, "");

          if (a == "") {
            dataValue = "";
          }
        }

        if (fieldVal.fieldType == 'TIMESTAMP' && tagName != "undefined" && (tagName == "INPUT" || tagName == "input")) {
          dataValue = editData.getAttribute("value");
        }

        if ((fieldVal.inputType == 'member' || fieldVal.inputType == 'account' || fieldVal.inputType == 'department' || fieldVal.inputType == 'post') && tagName != "undefined" && (tagName == "INPUT" || tagName == "input")) {
          dataValue = editData.getAttribute("title");
        }

        if (fieldVal.inputType == 'edocDocMark' || fieldVal.inputType == 'edocInnerMark') {
          editData = oneData.children.item(0);

          if (undefined != editData && null != editData) {
            if (undefined != editData && (tagName === "SELECT" || tagName === 'select')) {
              var index = editData.selectedIndex;

              if (index && undefined != editData.options[index] && null != editData.options[index]) {
                dataValue = editData.options[index].value;

                if (dataValue && dataValue != "") {
                  var selectObj = editData.options[index];
                  dataValue = parseDocMarkFromDOM(selectObj);
                }
              }
            }
          }
        }

        if (editData.getAttribute("type") == 'checkbox' && tagName != "undefined" && (tagName == "INPUT" || tagName == "input")) {
          if (editData.getAttribute("newValue") == '1') {
            dataValue = editData.getAttribute("newDisplay");
          } else if (editData.getAttribute("newValue") == '0') {
            dataValue = "";
          }
        } //添加radio 控件


        if (fieldVal.inputType == 'radio') {
          var nodeHtml = oneData.childNodes; //先置为空，有选中则赋值，反之则为空

          dataValue = "";

          for (var p = 0; p < nodeHtml.length; p++) {
            try {
              if (nodeHtml[p].document.getElementsByTagName("input")[p].checked) {
                dataValue = nodeHtml[p - 1].innerText;
                break;
              }
            } catch (e) {
              //兼容IE11
              try {
                var inputs = nodeHtml[p].childNodes;

                if ((inputs[0].nodeName == "input" || inputs[0].nodeName == "INPUT") && (inputs[0].getAttribute("checked") == "true" || inputs[0].checked || inputs[0].checked == 'true')) {
                  dataValue = nodeHtml[p].innerText;
                  break;
                }
              } catch (e) {}
            }
          }
        }

        if (fieldVal.inputType == "attachment") {
          var attsarr = new Array();
          getA8Top().$(oneData).find("div[id^='attachmentDiv_']").each(function () {
            attsarr.push(getA8Top().$(this).text().replace(/^[\s　]+|[\s　]+$/g, ''));
          });
          dataValue = attsarr.join("\n");
        }
      }
    } else if (label === 'doc_mark' && oneData.options) {
      // V5-16062 兼容无年份公文文号配置
      dataValue = oneData.options[index].value;

      if (dataValue && dataValue != "") {
        var _selectObj = oneData.options[index];
        dataValue = parseDocMarkFromDOM(_selectObj);
      }
    } else if (label === 'doc_mark' && oneData.nodeName === 'SPAN') {
      // fix-V5-16311 兼容只读模式下发文文号DOM不一致导致的数据获取偏差
      dataValue = parseDocMarkFromDOM(oneData);
    } else {
      if (oneData.getAttribute("type") == 'checkbox') {
        if (oneData.getAttribute("newValue") == '1') {
          label = oneData.id;
          dataValue = oneData.getAttribute("newDisplay");
        } else if (oneData.getAttribute("newValue") == '0') {
          label = oneData.id;
          dataValue = "";
        }
      }
    }

    if (label) {
      var tempLabel = label.toString().toLowerCase(); // 临时变量，转小写的label，解决含大写的Date不能通过下面的日期类型判断，导致取值格式不对
      //除签收日期外，其他日期要根据文单设置的显示方法进行显示(可编辑状态下有问题)

      if (tempLabel && tempLabel.search("date") != -1 && tempLabel != "signing_date") {
        var fieldTxt = oneData.id;

        if (fieldTxt) {
          var inputDate = dataForm.find("[id=" + fieldTxt + "_txt]");

          if (inputDate && inputDate.length > 0 && inputDate[0].value) {
            dataValue = inputDate[0].value;
          }
        }
      }
    } //意见无法换行，获取对于id_span的内容才可显示换行


    if (undefined != comp && comp.type == 'edocFlowOpinion' && dataValue && dataValue.indexOf("\r\n") == -1) {
      var optionSpan = dataForm.find("[id=" + oneData.id + "_span]");

      if (optionSpan && optionSpan.length > 0 && optionSpan[0].innerText) {
        dataValue = optionSpan[0].innerText;
      }
    } //}


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
        setLable(label, dataValue);
        setAllLabel4chinese(label, dataValue);
      } catch (e) {
        window.console && console.warn && console.warn(e);
      }
    }
  }
}
/**
 * 附件中文字符 设置值到对应的 公文域或书签中
 */


function setAttachment4chinese() {
  // 有多个序号的特殊字段，如请假、附件、FJ_标题、FJ_正文  （仅套附件正文类型为doc/docx/wps附件）
  var getAllFJ = window.getAllFJ || function () {
    return [];
  };

  var fileList = getAllFJ(true) || [];
  if (!fileList.length) return;
  var attr = fileList.filter(function (a) {
    return ['.doc', '.wps', '.docx'].indexOf(a.filename.substr(a.filename.lastIndexOf("."))) != -1;
  }); // 文单内的附件

  for (var i = 0, len = attr.length; i < len; i++) {
    var att = attr[i];
    var fileType = att.filename.substr(att.filename.lastIndexOf(".")); // fix-V5-16867 兼容老系统
    // 需求变更：公文域套红,公文域书签开始顺序 FJ_标题 FJ_标题_1 FJ_标题_2 ....

    if (i === 0) {
      redFileElement["附件"] = "附件";
      redFileElement["FJ_标题"] = att.filename;
      redFileElement["FJ_正文"] = {
        "FJContent": att.fileUrl,
        "fileName": att.filename,
        "fileType": fileType
      };
    } else {
      redFileElement["附件_" + i] = "附件" + i;
      redFileElement["FJ_标题_" + i] = att.filename;
      redFileElement["FJ_正文_" + i] = {
        "FJContent": att.fileUrl,
        "fileName": att.filename,
        "fileType": fileType
      };
    }
  }
}
/**
 * 中文字符 设置值到对应的 公文域或书签中
 * @param label  英文字符
 * @param dataValue  对应的value
 */


function setAllLabel4chinese(label, dataValue) {
  var bookMarks = OfficeUtils.getBookmarkByName(label);

  for (var i = 0; i < bookMarks.length; i++) {
    var bookMark = bookMarks[i];
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
        _dataValue = transToChinese4Date(_dataValue);
      } else if (bookMark.zhBookmark == "纪要标志") {
        _dataValue = _dataValue + "会议纪要";
      } else if (['纪要编号', '令号'].indexOf(bookMark.zhBookmark) > -1) {
        _dataValue = _dataValue.replace('〔〕', '');
      }

      redFileElement[bookMark.zhBookmark] = _dataValue;
    } // 有多个序号类型的字段


    if (bookMark.type == 2) {
      if (bookMark.isFirstMerge) {
        redFileElement[bookMark.zhBookmark] = _dataValue;
      }

      var valueList = _dataValue.split(/,|、/g);

      for (var _i4 = 0; _i4 < valueList.length; _i4++) {
        var value = valueList[_i4];
        redFileElement[bookMark.zhBookmark + "_" + (_i4 + 1)] = value;
      }
    } // 公文文号拆分三段


    if (bookMark.type == 7) {
      if (_dataValue.indexOf("〔") > -1 && bookMark.zhBookmark == "发文机关代字") {
        // 发文机关代字
        var str1 = _dataValue.substring(0, _dataValue.indexOf("〔"));

        if (str1 != '') {
          redFileElement[bookMark.zhBookmark] = str1;
        }
      } else if (_dataValue.indexOf("〔") > -1 && _dataValue.indexOf("〕") > -1 && bookMark.zhBookmark == "年份") {
        // 年份
        var str2 = _dataValue.substring(_dataValue.indexOf("〔") + 1, _dataValue.indexOf("〕"));

        if (str2 != '') {
          redFileElement[bookMark.zhBookmark] = str2;
        }
      } else if (_dataValue.indexOf("〕") > -1 && bookMark.zhBookmark == "发文顺序号") {
        // 发文顺序号
        var str3 = _dataValue.substring(_dataValue.indexOf("〕") + 1) || '';
        str3 = str3.replace(/\D/ig, '');

        if (str3 != '') {
          redFileElement[bookMark.zhBookmark] = str3;
        }
      }
    }
  }
} //套红意见。


function taohongOpinion(opinionArr) {
  try {
    var opinions = opinionArr[0];
    var senderOpinion = opinionArr[1];

    if (opinions) {
      // 意见套红套入签章与签批图片   开始
      for (var i = 0; i < opinions.length; i++) {
        var content = "";
        var imgArr = new Array();
        var parentKey = opinions[i][0];

        for (var j = 1; j < opinions[i].length; j++) {
          if (opinions[i][j].indexOf("id=") != -1) {
            content = content + "\r\nimg"; //img 为图片的占位符

            imgArr.push(opinions[i][j].split("=")[1]);
          } else if (opinions[i][j].indexOf("writeGIF") != -1) {
            content = content + "\r\nimg";
            imgArr.push(opinions[i][j]);
          } else {
            content = content + opinions[i][j];
          }
        }

        var img = new Array(); //反转数组

        for (var j = imgArr.length - 1; j >= 0; j--) {
          img.push(imgArr[j]);
        }

        var ta = content.split("img"); //

        var item = null;
        var myRange = null;
        var c = 0; //书签下标
        //反向插入  正向插入  意见元素是倒向的

        var index = 0; //图片数组下标

        var parentValue = [];

        for (var j = ta.length - 1; j >= 0; j--) {
          // 插入文字
          try {
            parentValue.push(["sign" + i + c, ta[j]]); // 插入图片

            if (index < imgArr.length) {
              parentValue.push(["imgsign" + i + c, {
                value: img[index++]
              }]);
            }

            c++;
          } catch (e) {}
        }

        setLable(parentKey, parentValue);
      } //意见套红套入签章与签批图片  结束

    }

    if (senderOpinion) {
      setLable("niwen", senderOpinion);
      setLable("dengji", senderOpinion);
    }
  } catch (e) {}
}
/**
 * 日期中文转换
 * @param mycontent
 * @returns {*}
 */


function transToChinese4Date(mycontent) {
  if (OfficeAPI.options.extendParams.isSwitch) {
    if (mycontent.indexOf("年") != -1) {
      mycontent = mycontent.replace("年", "-");
      mycontent = mycontent.replace("月", "-");
      mycontent = mycontent.replace("日", "");
    }

    mycontent = date2chinese0(mycontent);
  } else {
    if (mycontent.indexOf("年") == -1) {
      mycontent = date2chinese1(mycontent);
    }
  }

  return mycontent;
}

function setLable(mylable, mycontent) {
  if (!mylable) {
    return;
  }

  if (mylable === 'doc_mark') {
    mycontent = mycontent.replace('〔〕', '');
  }

  if (mylable.search("date") != -1) {
    //名称中包括了data就为date数据类型
    if (mycontent) {
      mycontent = lrtrim(mycontent);
    }

    if (mylable == "signing_date") {
      //签发日期根据公文开关转化为大小写。
      //时间值为空的，不进行转换
      if (mycontent && mycontent != "") {
        mycontent = transToChinese4Date(mycontent);
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
        mycontent = date2chinese1(mycontent);
      }
    }
  } else if (_typeof(mycontent) == "object") {
    $.each(mycontent, function (i, item) {
      var value = item[1];

      if (typeof value == "string") {
        value = lrtrim(value);
      }

      mycontent[i] = [item[0], value];
    });
  } //公文合规：多部门多单位顿号变逗号，并且结尾加句号


  if (OfficeUtils && OfficeUtils.isMulti(mylable)) {
    mycontent = OfficeUtils.convertMultiFormat(mycontent, ofdMetadata);
  }

  try {
    // V5-38688
    // 书签套红，正文套红/文单套红时，多个附件控件中有同文件名的文件，套红后，只套出1个
    // 原因：多附件控件表单, 套红时如果按原逻辑只会套如最后一个附件控件中的附件信息。
    if (mylable === 'attachments' && typeof redFileElement[mylable] !== "undefined" && redFileElement[mylable] !== "") {
      redFileElement[mylable] = redFileElement[mylable] + "\n" + mycontent;
    } else {
      redFileElement[mylable] = mycontent;
    }
  } catch (e) {
    if (!isAlertProtectFile) {
      isAlertProtectFile = true;
    }
  }
} //用正则表达式将前后空格
// 用空字符串替代。


var lrtrim = function lrtrim(str) {
  return str.replace(/(^\s*)|(\s*$)/g, "");
};

function date2chinese0(s) {
  var ns = date2chinese(s) || '';
  ns = ns.replace(/零/g, "〇");
  return ns;
}

function date2chinese1(s) {
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
}

function date2chinese(s) {
  //验证输入的日期格式.并提取相关数字.
  var datePat = /^(\d{2}|\d{4})(\/|-)(\d{1,2})(\2)(\d{1,2})$/;
  var matchArray = s.match(datePat);
  var ok = "";
  if (matchArray == null) return false;

  for (var i = 1; i < matchArray.length; i = i + 2) {
    ok += n2c(matchArray[i] - 0) + ydm[(i - 1) / 2];
  }

  return ok;
}

var redFileElement = {}; // 书签或者公文域元素

/**
 *套红的公用方法，所有的套红都走这个接口，不满足直接改造，不要新加接口！！！
 * @param data js数组对象[{name,val,type},{name,val,type},{name,val,type}...]
 *             name : 数据的名字，和书签名字一一对应
 *             val:   数据的值，需要套红的值，组件不进行转换，直接套到书签的位置
 *             type:  string/img 不传值的话默认为string。是图片或者图片类型(例如二维码、签章等)需要传值为img
 *
 * @param templateURL : 套红模板URL， 如果传值了，则从服务器加载套红模板重新套红，
 * 						如果没有值，但是data有值，则刷新正文中的书签，不重新加载
 */

wpsPlugin.prototype.taohong = /*#__PURE__*/function () {
  var _ref27 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28(dataForm, templateUrl, templateType, dataList, opinionArr, isFullSize, addParams) {
    var wpsTaohongParam;
    return regeneratorRuntime.wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            _context28.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context28.sent) {
              _context28.next = 4;
              break;
            }

            return _context28.abrupt("return", false);

          case 4:
            setAllLable(dataForm, templateType, dataList, opinionArr);
            wpsTaohongParam = {
              fileId: OfficeAPI.options.fileId,
              // 执行操作
              handleType: templateType == "edoc" ? HANDLE_TYPE.BodyInsertRed : HANDLE_TYPE.FormInsertRed,
              // 模版id
              templateUrl: templateUrl,
              redFileElement: redFileElement,
              //插入正文对应的元素
              bkInsertFile: 'Content',
              //Content
              zhInsertFile: '正文',
              //正文
              editType: "1,0",
              istaohong: true
            };

            if (!isEmptyObject(addParams)) {
              if (addParams["useOriginContentTaohong"] == true) {
                // 原正文套红
                wpsTaohongParam["useOriginContentTaohong"] = addParams["useOriginContentTaohong"];
                wpsTaohongParam["originContentId"] = addParams["originContentId"];
              } else {
                // 文单套红，可修改，但不能保存到oa，直接不清稿操作
                wpsTaohongParam["isClearDocument"] = ConstantEnum.NO;
                wpsTaohongParam["wpsFileSaveToServer"] = addParams.wpsFileSaveToServer || '';
                wpsTaohongParam["isFromDocTaoHong"] = true; //是否来于文单套红
              }
            } //信息报送-期刊套红


            try {
              if (dataForm[0].category == "32") {
                wpsTaohongParam.category = "32";

                if (dataList && (dataList.length > 0 || Object.keys(dataList).length > 0)) {
                  wpsTaohongParam.dataList = dataList;
                }
              }
            } catch (e) {}

            _context28.next = 10;
            return InsertRedHead(wpsTaohongParam);

          case 10:
            _context28.next = 12;
            return this.activeOfficeOcx();

          case 12:
            //套红后，隐藏痕迹，设置痕迹控制菜单
            if (templateType == "edoc") {
              this.contentUpdate = true;
            }

            return _context28.abrupt("return", true);

          case 14:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, this);
  }));

  return function (_x26, _x27, _x28, _x29, _x30, _x31, _x32) {
    return _ref27.apply(this, arguments);
  };
}(); //office 签章


wpsPlugin.prototype.WebOpenSignature = /*#__PURE__*/function () {
  var _ref28 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29(isFullSize) {
    return regeneratorRuntime.wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context29.sent) {
              _context29.next = 4;
              break;
            }

            return _context29.abrupt("return", false);

          case 4:
            _context29.next = 6;
            return this.setEditType("1,0");

          case 6:
            if (!isFullSize) {
              _context29.next = 11;
              break;
            }

            _context29.next = 9;
            return this.fullSize(true);

          case 9:
            _context29.next = 13;
            break;

          case 11:
            _context29.next = 13;
            return activeWps(OfficeAPI.defaultOptions.fileId);

          case 13:
            _context29.next = 15;
            return UpdateParams({
              btnSign: true
            });

          case 15:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, this);
  }));

  return function (_x33) {
    return _ref28.apply(this, arguments);
  };
}(); //修改office正文状态


wpsPlugin.prototype.updateOfficeState = function (state) {
  OfficeAPI.options.editType = state;
}; //刷新Office中文中的Label.


wpsPlugin.prototype.refreshOfficeLable = function (sendForm) {}; //是否读取office正文是否成功


wpsPlugin.prototype.loadOfficeSuccess = function () {}; //设置office正文Id


wpsPlugin.prototype.setOfficeOcxRecordID = function (recordId) {
  OfficeAPI.options.RecordID = recordId;
  OfficeAPI.options.contentId = recordId;
  OfficeAPI.options.isLoadOfficeFile = false;
}; //获取office正文id


wpsPlugin.prototype.getOfficeOcxRecordID = function () {
  return OfficeAPI.options.fileId;
};

wpsPlugin.prototype.getOfficeOcxCurVerRecordID = function () {};

wpsPlugin.prototype.setEditType = /*#__PURE__*/function () {
  var _ref29 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30(editType) {
    return regeneratorRuntime.wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            OfficeAPI.options.editType = editType; //wps端也得修改此参数

            _context30.next = 3;
            return UpdateParams({
              editType: editType
            });

          case 3:
            return _context30.abrupt("return", _context30.sent);

          case 4:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30);
  }));

  return function (_x34) {
    return _ref29.apply(this, arguments);
  };
}();
/**
 * 更新WPS参数(wps没有打开需要强制打开)
 * @param param
 */


wpsPlugin.prototype.updateWpsParams = /*#__PURE__*/function () {
  var _ref30 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31(openFileId, param) {
    var paramTmp;
    return regeneratorRuntime.wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            _context31.next = 2;
            return this.checkOpenState();

          case 2:
            if (_context31.sent) {
              _context31.next = 4;
              break;
            }

            return _context31.abrupt("return", false);

          case 4:
            //wps端也得修改此参数
            paramTmp = {
              openFileId: openFileId
            };
            paramTmp = OfficeUtils.extend(paramTmp, param);
            _context31.next = 8;
            return UpdateWpsParams(paramTmp);

          case 8:
            return _context31.abrupt("return", _context31.sent);

          case 9:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31, this);
  }));

  return function (_x35, _x36) {
    return _ref30.apply(this, arguments);
  };
}(); //判断是否盖章


wpsPlugin.prototype.getIsSignOperation = function () {};

wpsPlugin.prototype.setFormDataId = function (formDataId) {
  OfficeAPI.options.formDataId = formDataId;
};

wpsPlugin.prototype.needUpdateOcx = function () {};

wpsPlugin.prototype.showOffice = /*#__PURE__*/function () {
  var _ref31 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee32(param) {
    return regeneratorRuntime.wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            _context32.next = 2;
            return this.loadOffice(param);

          case 2:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, this);
  }));

  return function (_x37) {
    return _ref31.apply(this, arguments);
  };
}();

wpsPlugin.prototype.previewDoc = function (backData) {
  if (backData.type != "saveFile" || backData.args.officeTransResultFlag != "Y") {
    return;
  }

  var webRoot = OfficeUtils.getWebRoot();
  var createDate = formatDate(new Date());
  var fileId = backData.args.fileId;
  var fileType = backData.args.realFileType;
  var fileName = backData.args.fileName || fileId + fileType;
  var digestId = backData.args.digestId; //var needEdit = backData.args.newFileFlag == "Y" ? "true" : "false";

  var needEdit = "true";
  var dcsFileName = fileName;

  if (fileName.indexOf(".") === -1) {
    dcsFileName = dcsFileName + (fileType ? fileType.indexOf(".") > -1 ? fileType : "." + fileType : "");
  }

  var dcsDownLoad = "&dcs_isDownload=1";

  if (window.top.dcs_isDownload === 0) {
    dcsDownLoad = "&dcs_isDownload=0";
  }

  var previewURL = webRoot + "/officeTrans.do?method=preview&needEdit=" + needEdit + "&fileCreateDate=" + createDate + dcsDownLoad + "&dcs_isPrint=1&dcs_isHeaderBar=1&dcs_fileName=" + encodeURIComponent(dcsFileName) + "&fileId=" + fileId + "&filename=" + encodeURIComponent(fileName) + "&v=" + digestId + "&fileType=" + fileType + "&rnd=" + Math.random();

  if (document.querySelector("#officeTransIframe")) {
    document.querySelector("#officeTransIframe").setAttribute('src', previewURL);
  } else if (document.querySelector("#officeEditorFrame")) {
    // 智能纠错时, 使用WPS加载项后不重新加载OfficeTrans;
    var aiCorrector = window.aiCorrector || parent.aiCorrector;

    if (typeof aiCorrector == 'undefined' || typeof aiCorrector.data === "undefined" || aiCorrector.data === null) {
      document.querySelector("#officeEditorFrame").setAttribute('src', previewURL);
    } else {
      // 智能纠错纠错 一屏C，刷新officetrance视图
      var $govdocView = window.newGovdocView ? window.newGovdocView : parent.window.opener.newGovdocView;
      var IS_CLASSIC = window.IS_CLASSIC ? window.IS_CLASSIC : parent.IS_CLASSIC;

      if (typeof $govdocView != 'undefined' && $govdocView == '3') {
        if (typeof IS_CLASSIC != "undefined" && IS_CLASSIC) {
          parent.window.opener.document.getElementById('officeEditorFrame').contentWindow.location.reload(true);
        } else {
          document.querySelector("#officeEditorFrame").setAttribute('src', previewURL);
        }
      }
    }
  }
};

wpsPlugin.prototype.setLable4Magazine = function (mylable, mycontent) {
  setLable(mylable, mycontent);
};

wpsPlugin.prototype.infoTaohong = function (dataForm, templateUrl, templateType, jsonData) {
  if (jsonData != null) {
    setInfoMagazineLable(dataForm[0]);
  }

  try {
    dataForm[0].category = "32";
  } catch (e) {}

  this.taohong(dataForm, templateUrl, templateType, jsonData, null, true, null);
};
/**
 * 是否存在具体某个书签
 * @param {*} name 
 * @returns 
 */


wpsPlugin.prototype.isExistsBookmark = /*#__PURE__*/function () {
  var _ref32 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee33(name) {
    var params;
    return regeneratorRuntime.wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            params = {
              "name": name
            };
            _context33.next = 3;
            return isExistsBookmark(params);

          case 3:
            return _context33.abrupt("return", _context33.sent);

          case 4:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33);
  }));

  return function (_x38) {
    return _ref32.apply(this, arguments);
  };
}();
/**
 * 隐藏Office控件
 */


wpsPlugin.prototype.hideOcx = function (menuName, state) {//空实现，加载项不需要隐藏
}; // 获取wps需要的类型


function getClientType(fileType) {
  var clientType = 'wps';

  if (typeof fileType != "undefined") {
    switch (fileType.replace('.', '')) {
      case 'doc':
      case 'docx':
      case 'dot':
      case 'wps':
        clientType = 'wps';
        break;

      case 'xls':
      case 'xlsx':
      case 'xlt':
      case 'et':
        clientType = 'et';
        break;

      default:
        break;
    }
  }

  return clientType;
}

function formatDate(today) {
  today = new Date(today);
  var year = today.getFullYear();
  var month = today.getMonth() + 1;
  var date = today.getDate();
  return String(year) + (month < 10 ? "0" + month : String(month)) + (date < 10 ? "0" + date : String(date));
}

function inArray(elem, arr, i) {
  var len = arr.length;
  i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

  for (; i < len; i++) {
    if (i in arr && arr[i] === elem) {
      return i;
    }
  }

  return -1;
} //操作系统


function isChinaOs() {
  if (getA8Top().v3x) {
    return getA8Top().v3x.isCurrentSysLinux();
  } //如果获取不到v3x，则判断一下


  var isChina = false;
  var ua = navigator.userAgent;
  var isMSIE = navigator.appName == "Microsoft Internet Explorer" || ua.indexOf('Trident') != -1;

  if (!isMSIE) {
    isChina = String(navigator.platform).indexOf("Linux") > -1;
  }

  return isChina;
}
/**
 * 对象是否为空
 * @param obj
 * @returns {boolean}
 */


function isEmptyObject(obj) {
  for (var name in obj) {
    return false;
  }

  return true;
}
/**
 * 绑定onunload事件
 */


var isTriggerOnbeforeunload = false;

function bindOnunloadFunc() {
  return _bindOnunloadFunc.apply(this, arguments);
}
/**
 * 绑定onbeforeunload事件
 */


function _bindOnunloadFunc() {
  _bindOnunloadFunc = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
    var oldFunc;
    return regeneratorRuntime.wrap(function _callee35$(_context35) {
      while (1) {
        switch (_context35.prev = _context35.next) {
          case 0:
            // 1:onunload事件
            oldFunc = window.onunload;

            if (!oldFunc || oldFunc.name != "closeWps") {
              window.onunload = /*#__PURE__*/function () {
                var _closeWps = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee34(e) {
                  return regeneratorRuntime.wrap(function _callee34$(_context34) {
                    while (1) {
                      switch (_context34.prev = _context34.next) {
                        case 0:
                          if (typeof oldFunc == "function") {
                            oldFunc(e);
                          }

                          if (isTriggerOnbeforeunload) {
                            _context34.next = 5;
                            break;
                          }

                          _context34.next = 4;
                          return beginCloseDocument();

                        case 4:
                          sleep(400);

                        case 5:
                          // 兼容火狐重复执行的问题
                          window.onunload = "";

                        case 6:
                        case "end":
                          return _context34.stop();
                      }
                    }
                  }, _callee34);
                }));

                function closeWps(_x39) {
                  return _closeWps.apply(this, arguments);
                }

                return closeWps;
              }();
            } // 2：兼容ie 绑定onbeforeunload


            _context35.next = 4;
            return bindOnbeforeunloadFunc();

          case 4:
          case "end":
            return _context35.stop();
        }
      }
    }, _callee35);
  }));
  return _bindOnunloadFunc.apply(this, arguments);
}

function bindOnbeforeunloadFunc() {
  return _bindOnbeforeunloadFunc.apply(this, arguments);
}
/**
 * 开始关闭逻辑
 */


function _bindOnbeforeunloadFunc() {
  _bindOnbeforeunloadFunc = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
    var oldFunc;
    return regeneratorRuntime.wrap(function _callee36$(_context36) {
      while (1) {
        switch (_context36.prev = _context36.next) {
          case 0:
            oldFunc = window.onbeforeunload;

            if (!oldFunc || oldFunc.name != "closeWps") {
              window.onbeforeunload = function closeWps(e) {
                if (typeof oldFunc == "function") {
                  oldFunc(e);
                }

                beginCloseDocument().then(function () {
                  isTriggerOnbeforeunload = true;
                  window.onbeforeunload = "";
                  sleep(400);
                });
              };
            }

          case 2:
          case "end":
            return _context36.stop();
        }
      }
    }, _callee36);
  }));
  return _bindOnbeforeunloadFunc.apply(this, arguments);
}

function beginCloseDocument() {
  return _beginCloseDocument.apply(this, arguments);
}

function _beginCloseDocument() {
  _beginCloseDocument = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
    var wpsIds, etIds, key, clientType;
    return regeneratorRuntime.wrap(function _callee37$(_context37) {
      while (1) {
        switch (_context37.prev = _context37.next) {
          case 0:
            if (!OfficeAPI.defaultOptions.ClientType) {
              _context37.next = 11;
              break;
            }

            // 特殊处理附件关闭逻辑
            wpsIds = "";
            etIds = "";

            if (OfficeAPI.defaultOptions.fileId) {
              if (OfficeAPI.defaultOptions.ClientType == "wps") {
                wpsIds = OfficeAPI.defaultOptions.fileId + ",";
              } else {
                etIds = OfficeAPI.defaultOptions.fileId + ",";
              }
            }

            for (key in wpsUtils.wpsOpenedFileIds) {
              clientType = getClientType(wpsUtils.wpsOpenedFileIds[key]);

              if (clientType == 'wps') {
                if (wpsIds.indexOf(key) < 0) {
                  wpsIds += key + ",";
                }
              } else {
                if (etIds.indexOf(key) < 0) {
                  etIds += key + ",";
                }
              }
            }

            if (!wpsIds) {
              _context37.next = 8;
              break;
            }

            _context37.next = 8;
            return CloseDocumentByFileId(wpsIds, 'wps');

          case 8:
            if (!etIds) {
              _context37.next = 11;
              break;
            }

            _context37.next = 11;
            return CloseDocumentByFileId(etIds, 'et');

          case 11:
          case "end":
            return _context37.stop();
        }
      }
    }, _callee37);
  }));
  return _beginCloseDocument.apply(this, arguments);
}

function xhrLoad(url, sync) {
  return new Promise(function (resolve, reject) {
    // 先声明一个异步请求对象
    var xmlHttpReg = WpsInvoke.CreateXHR();
    var result = null;

    if (xmlHttpReg != null) {
      xmlHttpReg.onreadystatechange = function () {
        if (xmlHttpReg.readyState == 4 && xmlHttpReg.status == 200) {
          //4代表执行完成
          result = xmlHttpReg.responseText;
          var responseHeaders = typeof xmlHttpReg.getAllResponseHeaders != "undefined" ? xmlHttpReg.getAllResponseHeaders() : "";
          resolve(xhrGetHeaderToken(responseHeaders));
        }
      };

      xmlHttpReg.open("get", url); // false:同步

      xmlHttpReg.send();
    }
  });
}
/**
 * 获取xhr响应中返回的token
 * @param headers
 */


function xhrGetHeaderToken(headers) {
  try {
    var arr = headers.trim().split(/[\r\n]+/);
    var headerMap = {};
    arr.forEach(function (line) {
      var parts = line.split(': ');
      var header = parts.shift();
      var value = parts.join(': ');
      headerMap[header] = value;
    });
    return headerMap["tolen"]; // 和后端返回保持一致
  } catch (ex) {
    window.console && console.log && console.log(ex);
    return "";
  }
}
/**
 * 暂停一会儿ms(1、浏览器关闭时会阻止ajax请求发出，等一会执行后续逻辑)
 * @param delay
 */


function sleep(delay) {
  var start = new Date().getTime();

  while (new Date().getTime() - start < delay) {}
}

function setInfoMagazineLable(dataForm) {
  var len = dataForm.elements.length;

  for (var i = 0; i < len; i++) {
    var name = dataForm.elements[i].name;
    var taohongAttr = dataForm.elements[i].attributes["_taohong"];
    if (!name || !taohongAttr || taohongAttr.value.toLocaleLowerCase() != "true") continue;
    var label = name;
    var value = dataForm.elements[name].value;
    setLable(label, value);
  }
}