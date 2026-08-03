function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator.return && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, catch: function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
(function (window, undefined) {
  if (window.OfficeSDK) {
    return;
  }
  // 三方库收集器
  var pluginManager = {};
  var ajax = $.ajax ? $.ajax : window.top.jQuery.ajax;

  /**
   * 三方插件的url映射, 通过当前插件类型判,以及当前使用的厂商, 返回对应的插件url
   * @type {{ONLINE_SIGN: {}, ONLINE_PREVIEW: {}, ONLINE_EDIT: {WDT: string[], KINGSOFT: string[]}}}
   */
  var sdk_url_maps = {
    'ONLINE_EDIT': {
      'WDT': ["/common/office/js/docWebOffice/wdtAdapter.js"],
      'KINGSOFT': ["/common/office/js/kingSoftAdapter/kingSoftAdapter.js"],
      'KINGSOFT_WPS': ["/common/office/js/wpsAdapter/wpsAdapter.js"]
    },
    'ONLINE_PREVIEW': {
      'KINGSOFT': [''],
      'SUWELL': ["/common/office/js/skLightRead/skAdapter.js"]
    },
    'ONLINE_SIGN': {
      'SUWELL': ['/common/office/js/skLightRead/skAdapter.js']
    }
  };
  var ADAPTER_KEY = {
    'ONLINE_EDIT_WDT': ["/common/office/js/docWebOffice/wdtAdapter.js"],
    'ONLINE_EDIT_KINGSOFT': ["/common/office/js/kingSoftAdapter/kingSoftAdapter.js"],
    'ONLINE_EDIT_KINGSOFT_WPS': ["/common/office/js/wpsAdapter/wpsAdapter.js"],
    'ONLINE_PREVIEW_KINGSOFT': ['/common/office/js/kingSoftAdapter/kingsoftPreviewAdapter.js'],
    'ONLINE_PREVIEW_SUWELL': ["/common/office/js/skLightRead/skAdapter.js"],
    'ONLINE_SIGN_SUWELL': ['/common/office/js/skLightRead/skAdapter.js'],
    'ONLINE_PREVIEW_ASPOSE': ['/common/office/js/asposeAdapter/asposePreviewAdapter.js']
  };

  // RUIAN-FILEZ-ADAPTER-RESOLVER-BEGIN
  // A deliberately small extension point for independently packaged OfficeSDK
  // adapters. Resolver failures are isolated and always fall back to Seeyon's
  // native provider mapping.
  var officeAdapterResolvers =
    window.__SEEYON_OFFICE_ADAPTER_RESOLVERS__;
  if (Object.prototype.toString.call(officeAdapterResolvers) !== '[object Array]') {
    officeAdapterResolvers = [];
    window.__SEEYON_OFFICE_ADAPTER_RESOLVERS__ = officeAdapterResolvers;
  }
  // RUIAN-FILEZ-ADAPTER-RESOLVER-END

  // mode 的枚举类型 VIEW、EDIT、SIGN
  OfficeSDK.ENUM_MODE_TYPE = {
    VIEW: 'VIEW',
    EDIT: 'EDIT',
    SIGN: 'SIGN'
  };

  // 事件枚举
  OfficeSDK.ENUM_EVENT_TYPE = {
    REUPLOADFILE: 'ReUploadFile',
    // 重新上传文件
    CONTENT_MODIFIED: 'contentModified',
    // 内容被修改
    SELECTION_CHANGE: 'selectionChange',
    // 选中区域发生改变
    EXCEL_CHANGE: 'excelChange' // 表格发生改变，如：插入、删除、重命名表格，复制、移动、隐藏、保护
  };
  var tips = {
    alert: '正文插件初始化失败，请联系管理员解决！ '
  };

  /**
   * OfficeSDK 抽象类，封装标准API
   * @param {*} params 
   */
  function OfficeSDK(params) {
    this.defaultOptions = {
      /** 文件ID */
      fileId: "",
      /** 文件保存到本地时候的文件名字*/
      fileName: "",
      /** 创建时间 */
      createDate: "",
      /** 应用的URL，例如http://127.0.0.1/seeyon */
      webRoot: OfficeSDK.utils.getWebRoot(),
      /** 文档类型 .doc,.docx,.xls,.xlsx*/
      fileType: "",
      //文档类型
      /** */
      contentId: "",
      category: undefined,
      // 业务模块类型 (1:协同、4:公文、7:公告、8:新闻 。。。)
      /** */
      editType: "",
      /** 系统配置的最大的文件上传大小 */
      officeOcxUploadMax: "",
      /**文件是否可以打印 */
      officecanPrint: undefined,
      /** 文件是否可以保存到本地*/
      officecanSaveLocal: "false",
      /** 当前的国际化语言环境 */
      currentLanguage: OfficeSDK.utils.currentLanguage(),
      /** 原始文件的创建时间，例如调用模板的时候，模板文件的创建时间*/
      originalCreateDate: "",
      /** 原始文件的文件ID，例如调用模板的时候，模板文件的文件的ID*/
      originalFileId: "",
      /**当前用户ID */
      userId: "",
      // 是否能够复制
      canCopy: 1,
      /** 当前用户的name */
      currentUserName: "",
      /** affair的人员ID，用于盖图片章时获取签章列表*/
      affairMemberId: "",
      /** affair的人员名，用于盖图片章时获取签章列表*/
      affairMemberName: "",
      /** 文件大小 */
      officeFileRealSize: "",
      /** //是否是新建页面*/
      isNewOfficeFilePage: "",
      // 跟业务耦合了。
      /** 是否需要马上加载Office插件*/
      isLoadOfficeImmediate: true,
      /** 是否可以修改正文*/
      canEditContent: OfficeSDK.utils.getCanEditContent(),
      /** 是否可以进行套红（表单套红）*/
      canTaohong: "",
      /** 表单数据ID*/
      formDataId: "",
      /** 当前页面是那个页面*/
      currentPage: "",
      /** 是否显示花脸*/
      showHl: "",
      /** 是否能签章*/
      actionCanSign: "",
      /**是否能够编辑 */
      canEdit: "",
      /** 是否显示保留痕迹*/
      hasTrail: "",
      /** 是否设置印章为灰色，部门归档的文件需要显示为灰色*/
      setSignatureBlack: "",
      /** */
      originalNeedClone: "",
      /** */
      needSave: "",
      /**文件已经加载*/
      isLoadOfficeFile: false,
      /** 是否需要全屏 */
      isFullSize: "",
      /** */
      extendParams: {},
      // 打开正文的方式 VIEW：预览，EDIT：编辑，SIGN：签章
      mode: OfficeSDK.ENUM_MODE_TYPE.VIEW,
      // 编辑器内转OFD按钮能否使用
      canTransOfd: undefined,
      // 编辑器内转PDF按钮能否使用
      canTransPdf: undefined,
      // 编辑器内下载按钮能够使用
      canDownload: undefined,
      // 编辑器内能上传按钮能使用
      canUpload: undefined,
      // 编辑器内打印按钮能够使用
      canPrint: undefined,
      /** 当前打开，修改保存Office文档是否保留痕迹。某些情况下可能不需要保留痕迹，例如协同公文的新建*/
      // 编辑器内的盖章按钮能够使用
      canSign: undefined,
      // 编辑器内的验章按钮能够使用,验证按钮默认不受控制
      canCheckSign: undefined,
      // 编辑器内的清稿按钮能够使用
      canClearTrail: undefined,
      // 痕迹按钮是否显示
      isShowTrailBtn: undefined,
      // 编辑正文时是否开启修订模式(保留修改痕迹)
      canRevise: undefined,
      // 关闭弹窗的回调函数
      dialogCloseCallback: null,
      // 下载按钮显示是否受图片章控制（数科加载正文时，有图片章的情况，不允许下载）
      isNeedCheckSignDownload: undefined,
      // 添加对应的流程Id
      processId: typeof processId != "undefined" ? processId : typeof parent.processId != "undefined" ? parent.processId : parent.parent.processId,
      // 事件触发后的回调函数
      eventTriggerCallback: null,
      // 转PDF按钮被点击触发的回调事件
      doTransToPdfWebofficeCallback: null,
      // 转OFD按钮被点击触发的回调事件
      doTransToOfdWebofficeCallback: null
    };

    // 获取的流程Id默认值，可能是个界面元素input输入框。如果是，需要取它的value值
    if (this.defaultOptions.processId && this.defaultOptions.processId.value) {
      this.defaultOptions.processId = this.defaultOptions.processId.value;
    }

    // 合并参数
    this.params = _extend(this.defaultOptions, params);
    // webRoot统一前端获取，不再接收后端传过来的值
    this.params.webRoot = OfficeSDK.utils.getWebRoot();
    try {
      this.params.fileName = this.params.fileName && decodeURIComponent(this.params.fileName);
    } catch (e) {
      this.params.fileName = this.params.fileName;
    }
    this.Adapter = null; // 适配器的类
    this.adapterInstance = null; // 适配器的实例
    this.SDKPlugins = {}; // 缓存三方adapter的构造器
    this.adapter = {}; //缓存三方aapter的实例
    /*office转版套红盖章能力 {PICTURE_SIGN: "ONLINE_PREVIEW_SUWELL" // 盖章
    * TEMPLATE: "ONLINE_PREVIEW_SUWELL"// 套红	  
    * TRANSFORM: "ONLINE_PREVIEW_SUWELL" // 转版  }*/
    this.cacheAbilityMapping = {};
    this.pluginName = null;
    this.productName = null;
    this.pluginKey = null;
    this.cacheAdapterMapping = {};
  }

  /**
   * 三方adapter 需要实现的api接口,三方没有实现的接口，给提示
   */
  OfficeSDK.API = {
    contentIsModified: function contentIsModified() {
      return false;
    },
    active: function active(params, callback) {
      callback && callback(null, true);
      console.warn('当前插件未实现 active 方法！');
    },
    // 编辑器是否可用
    isAvailable: function isAvailable() {
      $.alert('当前插件不支持 isAvailable 方法！');
    },
    // 文档是否加载完成
    isContentLoaded: function isContentLoaded() {
      $.alert('当前插件不支持 isContentLoaded 方法！');
    },
    // 保存文档
    saveFile: function saveFile() {
      $.alert('当前插件不支持 saveFile 方法！');
    },
    // 文档是否被修改
    isModified: function isModified() {
      $.alert('当前插件不支持 isModified 方法！');
    },
    // 打印
    print: function print() {
      $.alert('当前插件不支持 print 方法！');
    },
    // 删除文档批注
    delAnnotations: function delAnnotations() {
      $.alert('当前插件不支持 delAnnotations 方法！');
    },
    // 保存花脸
    saveHuaLian: function saveHuaLian() {
      $.alert('当前插件不支持 saveHuaLian 方法！');
    },
    // 清稿
    clearTrail: function clearTrail() {
      $.alert('当前插件不支持 clearTrail 方法！');
    },
    // 高亮、定位跳转到书签
    bookmarkHighlight: function bookmarkHighlight() {
      $.alert('当前插件不支持 bookmarkHighlight 方法！');
    },
    // 正文套红(替换书签内容+文档合并)
    taohong: function taohong() {
      $.alert('当前插件不支持 taohong 方法！');
    },
    // 流转版PDF
    transform: function transform() {
      $.alert('当前插件不支持 transform 方法！');
    },
    // 获取书签列表
    getBookmarkList: function getBookmarkList() {
      $.alert('当前插件不支持 getBookmarkList 方法！');
    },
    // 删除书签
    delBookmarks: function delBookmarks() {
      $.alert('当前插件不支持 delBookmarks 方法！');
    },
    // 获取文档大小
    contentLength: function contentLength() {
      $.alert('当前插件不支持 contentLength 方法！');
    },
    // 获取文档大小和创建日期
    contentLengthAndCreateDate: function contentLengthAndCreateDate() {
      $.alert('当前插件不支持 contentLengthAndCreateDate 方法！');
    },
    // 签章
    signature: function signature() {
      $.alert('当前插件不支持 signature 方法！');
    },
    // 是否有专业签章
    hasProfessionalSign: function hasProfessionalSign() {
      $.alert('当前插件不支持 hasProfessionalSign 方法！');
    },
    // 获取签章数量
    countSignatures: function countSignatures() {
      $.alert('当前插件不支持 countSignatures 方法！');
    },
    // 下载正文
    download: function download() {
      $.alert('当前插件不支持 download 方法！');
    },
    // 正文预览
    preview: function preview() {
      $.alert('当前插件不支持 preview 方法！');
    },
    // 解析图片
    analyzing: function analyzing() {
      $.alert('当前插件不支持 analyzing 方法！');
    },
    // 判断正文是否为空
    isEmpty: function isEmpty(params, callback) {
      console.warn('当前插件未实现 isEmpty 方法！');
      callback && callback(null, false);
      return false;
    },
    // 是否支持多人编辑
    supportMultiEditing: function supportMultiEditing() {
      $.alert('当前插件不支持 supportMultiEditing 方法！');
    },
    //批量替换书签内容
    batchSwap: function batchSwap() {
      $.alert('当前插件不支持 batchSwap 方法！');
    },
    //替换书签内容不高亮
    swapWithoutHighlight: function swapWithoutHighlight() {
      $.alert('当前插件不支持 swapWithoutHighlight 方法！');
    },
    //删除指定书签
    batchDeleteBM: function batchDeleteBM() {
      $.alert('当前插件不支持 batchDeleteBM 方法！');
    },
    // 印章置灰
    decryptSeal: function decryptSeal() {
      $.alert('当前插件不支持 decryptSeal 方法！');
    },
    // 是否为客户端。例如wps加载项
    isClientApp: function isClientApp() {
      console.warn('当前插件未实现 isClientApp 方法！');
      return false;
    },
    isAllowSignature: function isAllowSignature() {
      console.warn('当前插件未实现 isAllowSignature 方法！');
      return true;
    },
    isAllowTransform: function isAllowTransform() {
      console.warn('当前插件未实现 isAllowTransform 方法！');
      return true;
    },
    setOptions: function setOptions() {
      $.alert('当前插件不支持 setOptions 方法！');
    },
    closeFile: function closeFile() {
      $.alert('当前插件不支持 closeFile 方法！');
    },
    hide: function hide() {
      // $.alert('当前插件不支持 hide 方法！');
      console.warn("当前插件未实现 hide 方法");
    },
    insertText: function insertText() {
      // $.alert('当前插件不支持 hide 方法！');
      console.warn("当前插件未实现 insertText 方法");
    },
    getThirdInstance: function getThirdInstance() {
      console.warn("当前插件未实现 getThirdInstance 方法");
    },
    // 获取当前选中的区域
    getCurrentSelection: function getCurrentSelection() {
      console.warn("当前插件未实现 getCurrentSelection 方法");
    },
    // 打开签章页面  
    openSignaturePage: function openSignaturePage(params, callback) {
      console.warn("当前插件未实现 getCurrentSelection 方法");
      callback && callback(null, "");
    },
    // 获取正文内容的尺寸信息
    getContainerAttributes: function getContainerAttributes(params, callback) {
      console.warn('当前插件未实现 GetContainerAttributes方法');
    },
    // 滚动正文容器到指定位置
    setScrollTo: function setScrollTo(params, callback) {
      console.warn('当前插件未实现setScrollTo方法');
    }
  };

  /**
   * 将OfficeSDK.API 合并到adapter 构造器的prototype 上
   * @param {Object} targetProto 
   */
  OfficeSDK.mergePrototype = function (targetProto) {
    Object.getOwnPropertyNames(OfficeSDK.API).forEach(function (method) {
      if (!targetProto.hasOwnProperty(method)) {
        targetProto[method] = OfficeSDK.API[method];
      }
    });
    return targetProto;
  };

  /**
   * 注册三方实例
   * @param {string} sdkName 
   * @param {Object} adapterInstance 
   * @returns {void}  
   */
  OfficeSDK.register = function (name, plugin) {
    if (!pluginManager[name]) {
      pluginManager[name] = plugin;
    }
  };

  // RUIAN-FILEZ-ADAPTER-RESOLVER-API-BEGIN
  OfficeSDK.registerAdapterResolver = function (name, resolver) {
    var normalizedName = typeof name === 'string' ? name.replace(/^\s+|\s+$/g, '') : '';
    var i;
    if (!normalizedName || typeof resolver !== 'function') {
      return false;
    }
    for (i = 0; i < officeAdapterResolvers.length; i += 1) {
      if (officeAdapterResolvers[i] && officeAdapterResolvers[i].name === normalizedName) {
        officeAdapterResolvers[i] = {
          name: normalizedName,
          resolve: resolver
        };
        return true;
      }
    }
    officeAdapterResolvers.push({
      name: normalizedName,
      resolve: resolver
    });
    return true;
  };

  OfficeSDK.unregisterAdapterResolver = function (name) {
    var normalizedName = typeof name === 'string' ? name.replace(/^\s+|\s+$/g, '') : '';
    var i;
    for (i = officeAdapterResolvers.length - 1; i >= 0; i -= 1) {
      if (officeAdapterResolvers[i] && officeAdapterResolvers[i].name === normalizedName) {
        officeAdapterResolvers.splice(i, 1);
      }
    }
  };
  // RUIAN-FILEZ-ADAPTER-RESOLVER-API-END

  /**
   *  获取三方 adapter 对象
   * @param {String} name 注册时候的key值
   * @returns 
   */
  OfficeSDK.getAdapter = function (name) {
    return pluginManager[name] ? pluginManager[name] : null;
  };

  /**  
   * 初始化 SDK 插件函数  
   * @param {Object} params - 初始化插件所需的参数对象，可以为空对象。  
   * @param {string} params.domId - 插件加载的目标 DOM 元素的 ID。  
   * @param {string} params.fileType - 文档类型  //'docx', 'doc', 'wps', 'xlsx', 'xls', 'et', 'ods', 'csv', 'pptx', 'ppt', 'dps', 'odp'。
   * @param {string} params.mode - 模式 DOM  VIEW、EDIT、SIGN 三选一
   * @param {Function} callBack - 初始化完成后的回调函数，可选参数。
   * @returns {void}  
   */
  OfficeSDK.prototype.init = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callBack = arguments.length > 1 ? arguments[1] : undefined;
    var _self = this;
    return new Promise(function (resolve, reject) {
      // 初始化的时候合并参数
      _self.params = _extend(_self.params, params);
      // webRoot统一前端获取，不再接收后端传过来的值
      _self.params.webRoot = OfficeSDK.utils.getWebRoot();
      var fileType = _self.params.fileType;
      var liushiArray = ['docx', 'doc', 'wps'];
      if (liushiArray.indexOf(fileType) === -1) {
        _self.params.isShowTrailBtn = undefined;
        _self.params.canClearTrail = undefined;
      }

      // 获取用户信息
      OfficeSDK.utils.getUserInfo.call(_self);
      // 获取在线预览态（正文和附件）是否开启
      OfficeSDK.utils.getConfig("ONLINE_PREVIEW_OPEN").then(function (previewOpenData) {
        // 获取在线预览是否开启的状态
        var isOnlinePreviewOpen = previewOpenData && previewOpenData.value && previewOpenData.value === "true";
        // 将此状态重新添加到params中传递给数科Adapter中
        _self.params.isOnlinePreviewOpen = isOnlinePreviewOpen;

        // 获取流版签全量的配置信息
        // 1、先判断本地存储有吗，如果没有，需要等待请求，如果有，异步获取配置然后更新本地配置
        // 2、根据业务调用传入的mode 和 fileType 找到对应的能力
        // 3、通过能力去匹配对应的adapter js 路径

        var configObj; // JSON.parse(localStorage.getItem('officeSDK_config'))

        OfficeSDK.getOfficeSDKConfig().then( /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(res) {
            var hasSign, mapObj, adapterUrl, msg;
            return _regeneratorRuntime().wrap(function _callee$(_context) {
              while (1) switch (_context.prev = _context.next) {
                case 0:
                  configObj = res.data;
                  _self.cacheAdapterMapping = configObj;
                  _context.next = 4;
                  return hasSignAuth();
                case 4:
                  hasSign = _context.sent;
                  mapObj = getAdapterMap.call(_self, _self.params, configObj);
                  adapterUrl = mapObj.url;
                  if (!(!adapterUrl || typeof adapterUrl == "undefined")) {
                    _context.next = 11;
                    break;
                  }
                  msg = "正文插件初始化失败，请联系管理员解决！";
                  if (!_self.params.fileType || !_self.params.mode) {
                    console.log('缺少officeSDK参数，请排查调用地方!');
                    msg = "正文插件初始化失败：缺少初始化参数！";
                    // OfficeSDK.utils.alert(msg);
                    callBack && callBack({
                      code: 1,
                      msg: msg,
                      data: {
                        liushi: configObj.WORD.EDIT,
                        banshi: configObj.PDF.SIGN
                      }
                    });
                    reject({
                      code: 1,
                      msg: msg,
                      data: {
                        liushi: configObj.WORD.EDIT,
                        banshi: configObj.PDF.SIGN
                      }
                    });
                  } else {
                    console.log('正文插件初始化失败：不支持打开文件!');
                    msg = '当前插件不支持打开' + _self.params.fileType + '类型的文件！';
                    OfficeSDK.utils.getAbilityMapping().then(function (result) {
                      callBack && callBack({
                        code: 1,
                        msg: msg,
                        data: {
                          liushi: configObj.WORD.EDIT,
                          banshi: configObj.PDF.SIGN,
                          ability: result,
                          signAuth: hasSign
                        }
                      });
                      reject({
                        code: 1,
                        msg: msg,
                        data: {
                          liushi: configObj.WORD.EDIT,
                          banshi: configObj.PDF.SIGN,
                          ability: result,
                          signAuth: hasSign
                        }
                      });
                    });
                  }
                  return _context.abrupt("return");
                case 11:
                  if (!(mapObj.key == "ONLINE_SIGN_SUWELL")) {
                    _context.next = 16;
                    break;
                  }
                  if (hasSign) {
                    _context.next = 16;
                    break;
                  }
                  callBack && callBack({
                    code: 2,
                    msg: $.i18n('office.config.suwell.sign.auth.no.support1')
                  });
                  reject({
                    code: 2,
                    msg: $.i18n('office.config.suwell.sign.auth.no.support1')
                  });
                  return _context.abrupt("return");
                case 16:
                  // 缓存能力配置
                  OfficeSDK.utils.getAbilityMapping().then(function (result) {
                    _self.cacheAbilityMapping = result;

                    // 合并扩展属性
                    var extendParams = JSON.parse(result.extendParams);
                    _self.params.extendParams = _extend(_self.params.extendParams, extendParams);

                    //
                    _self.params.isRetainedTraces = result.isRetainedTraces === "true" || result.isRetainedTraces === true;
                    if (_self.adapterInstance) {
                      _self.adapterInstance.destroy();
                      _self.adapterInstance = null;
                    }
                    try {
                      loadPlugin(_self, {
                        webRoot: _self.params.webRoot,
                        adapterUrl: adapterUrl,
                        fileType: _self.params.fileType
                      }, function (err, result) {
                        if (err) {
                          callBack && callBack(err);
                          reject(err);
                        } else {
                          callBack && callBack(null, result);
                          resolve(result);
                        }
                      });
                    } catch (err) {
                      callBack && callBack(err);
                      reject(err);
                    }
                  });
                case 17:
                case "end":
                  return _context.stop();
              }
            }, _callee);
          }));
          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }()).catch(function (error) {
          var err = {
            code: 1,
            msg: '正文插件初始化失败：缺少初始化参数！',
            data: error
          };
          callBack && callBack(err, null);
          reject(err);
        });
      });
    });
  };

  /**  
   * 切换adapter 
   * @param {Object} params - 初始化插件所需的参数对象，可以为空对象。  
   * @param {string} params.fileType - 文档类型  //'docx', 'doc', 'wps', 'xlsx', 'xls', 'et', 'ods', 'csv', 'pptx', 'ppt', 'dps', 'odp'。
   * @param {string} params.mode - 模式 DOM  VIEW、EDIT、SIGN 三选一
   * @returns {void}  
   */
  OfficeSDK.prototype.switchProvider = function (params, callback) {
    var _self = this;
    return new Promise(function (resolve, reject) {
      _self.init(params, function (err, res) {
        if (err) {
          callback && callback(err);
          reject(err);
        } else {
          callback && callback(null, res);
          resolve(res);
        }
      });
    });
  };

  /**
   * 文档是否加载完成 
   */
  OfficeSDK.prototype.isContentLoaded = function () {
    if (this.adapterInstance === null) {
      // OfficeSDK.utils.alert(tips.alert);
      return false;
    }
    return this.adapterInstance.isContentLoaded();
  };

  /**
   * 更改adapter实例的公共参数
   * @param params
   * @param callBack
   * @returns {Promise<void>}
   */
  OfficeSDK.prototype.setOptions = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 ? arguments[1] : undefined;
    var _self = this;
    return new Promise(function (resolve, reject) {
      if (_self.adapterInstance === null) {
        callback && callback(tips.alert, null);
        reject(tips.alert);
        return;
      }
      if (params && params.webRoot) {
        // webRoot统一前端获取，不再接收后端传过来的值
        params.webRoot = OfficeSDK.utils.getWebRoot();
      }
      _self.params = _extend(_self.params, params);
      _self.adapterInstance.setOptions(params, function (err, result) {
        callback && callback(err, result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  /**
   * 销毁弹窗 dom结构中移除弹窗元素
   */
  OfficeSDK.prototype.destroy = function (params, callback) {
    if (this.adapterInstance === null) {
      // OfficeSDK.utils.alert(tips.alert);
      callback && callback({
        code: 1,
        msg: tips.alert
      });
      return;
    }
    return this.adapterInstance.destroy(params, callback);
  };

  /**
   * 打开文件
   * @param {object} params
   * {
   *     @param {Boolean} isDialog 是否是弹窗打开
   *     @param {Boolean} isHide 是否隐藏式打开
   *     @param {String} showDialogTitle 弹窗标题
   *     @param {true} noTransFlag true: wps点保存时不转换
   *     
   * }
   */
  OfficeSDK.prototype.openFile = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 ? arguments[1] : undefined;
    if (params && params.webRoot) {
      // webRoot统一前端获取，不再接收后端传过来的值
      params.webRoot = OfficeSDK.utils.getWebRoot();
    }
    return _promiseDecorator(this, 'openFile', params, callback);
  };

  /**
   * 打开盖章页面
   * @param params
   * @param callback
   * @returns {Promise<unknown>}
   */
  OfficeSDK.prototype.openSignaturePage = function () {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 ? arguments[1] : undefined;
    return _promiseDecorator(this, 'openSignaturePage', params, callback);
  };

  /**
   * 关闭文件 无参数 无返回
   */
  OfficeSDK.prototype.closeFile = function (params, callback) {
    return _promiseDecorator(this, 'closeFile', params, callback);
  };

  /**
   * 保存文档
   * @param {Object} params 保存文档所需的参数对象，必填参数。
   * {
   *   @param {string}  fileId        文件ID
   *   @param {boolean} isAsync       是否异步保存
   *   @param {boolean} noTransFlag   true //wps保存后不触发转换
   *   @param {boolean} isNotCloseDoc true //wps保存后不关闭文档
   * }
   * @param {function} callback 保存文档完成后的回调函数，可选参数。
   * 
   */
  OfficeSDK.prototype.saveFile = function (params, callback) {
    return _promiseDecorator(this, 'saveFile', params, callback);
  };

  // [
  //   {// 文件类型
  //     "bookmark": "正文",
  //     "type": "DOCUMENT",
  //     "fileInfo": {
  //         "fileId": "-7384785898411833787",
  //         "fileType": "doc"
  //     }
  //   },
  //   {// 图片类型（签章图片）
  //     "bookmark": "otherOpinion",
  //     "text": "",
  //     "type": "IMAGE",
  //     "imgInfo": {
  //       "inputType": "handwrite",
  //       "imgId": "ZmllbGQwMDA0Xy0xNzExMjM0NDY3MzExNTAwNjE4",
  //       "createDate": 1718160221039,
  //       "isSignatrue": "false"
  //     }
  //   },
  //   {// 文本类型
  //     "bookmark": "subject",
  //     "type": "TEXT",
  //     "text": "XXX市政府发〔2024〕39号"
  //   },
  //   {// 文本类型（文字+图片）
  //     "bookmark": "审核",
  //     "type": "TEXT",
  //     "text": "\r\nmethod=writeGIF&RECORDID=-5233516689560812598&FIELDNAME=hwfield0007&isNewImg=true&affairId=-5164439125938910211&r=0.7612057814412851\r\n【同意】123123\r\n办公室 \r\nid=4389292179557270444 2024-06-11 17:03\r\n"
  //   }
  // ]
  /**
   * 正文套红(替换书签内容+文档合并)
   * @param params
   * {
   *   @param {Array} allBoomark //套红书签对象 
   *   {
   *      @param {string} bookmark // 书签名称
   *      @param {string} type     // 值类型 ('TEXT': 文本，'IMAGE': 图片，'DOCUMENT': 文件)
   *      @param {string} text     // 书签值
   *      @param {object} fileInfo // 文件信息（文件类型的书签使用） 
   *      @param {object} imgInfo  // 图片信息（图片类型的书签使用）
   *   }
   *   @param {string} templateUrl  // 模板id
   *   @param {string} templateType // 套红类型（'edoc': 正文套红-对当前正文进行套红，'script': 文单套红-加载模版文件进行套红）
   *   @param {Object} extParam     // 扩展参数 
   * @param callback
   * @returns {Promise<unknown>}
   * 
   */
  OfficeSDK.prototype.taohong = function (params, callback) {
    var _self = this;
    return new Promise(function (resolve, reject) {
      if (_self.adapterInstance === null) {
        var result = {
          code: 1,
          msg: tips.alert
        };
        callback && callback(result);
        resolve(result);
        return;
      }
      _self.adapterInstance.taohong(params, function (err, result) {
        callback && callback(err, result);
        if (err) {
          resolve(err);
        } else {
          resolve(result);
        }
      });
    });
  };

  /**  
   * 编辑器是否可用 
   * @param {Object} params - 初始化插件所需的参数对象，可选参数。  
   * @param {Function} callBack - 初始化完成后的回调函数，可选参数。  
   * @returns {Boolean}  返回一个布尔值，表示编辑器是否可用。
   */
  OfficeSDK.prototype.isAvailable = function (params, callback) {
    if (this.adapterInstance === null) {
      // OfficeSDK.utils.alert(tips.alert);
      return false;
    }
    return this.adapterInstance.isAvailable();
  };

  /**
   * 文档是否被修改
   */
  OfficeSDK.prototype.isModified = function (params, callback) {
    return _promiseDecorator(this, 'isModified', params, callback);
  };

  /**
   * 打印
   */
  OfficeSDK.prototype.print = function (params, callback) {
    return _promiseDecorator(this, 'print', params, callback);
  };

  /**
   * 删除文档批注
   */
  OfficeSDK.prototype.delAnnotations = function (params, callback) {
    return _promiseDecorator(this, 'delAnnotations', params, callback);
  };

  /**
   * 保存花脸
   */
  OfficeSDK.prototype.saveHuaLian = function (params, callback) {
    return _promiseDecorator(this, 'saveHuaLian', params, callback);
  };

  /**
   * 清稿
   */
  OfficeSDK.prototype.clearTrail = function (params, callback) {
    return _promiseDecorator(this, 'clearTrail', params, callback);
  };

  /**
   * 高亮、定位跳转到书签  
   */
  OfficeSDK.prototype.bookmarkHighlight = function (params, callback) {
    return _promiseDecorator(this, 'bookmarkHighlight', params, callback);
  };

  /**
   * 统计正文中的书签的数量
   */
  OfficeSDK.prototype.countBookmarks = function (params, callback) {
    return _promiseDecorator(this, 'countBookmarks', params, callback);
  };

  /**
   * 获取书签列表
   * @returns { Array }
   */
  OfficeSDK.prototype.getBookmarkList = function (params, callback) {
    return _promiseDecorator(this, 'getBookmarkList', params, callback);
  };

  /**
   * 删除书签
   * @param {object} params 传入的参数 (bookMarkList不传值或者传入空数组，就删除所有书签)
   * {
   *    @param {Array} bookMarkList 删除的书签名称 ['书签1','书签2']
   * }
   */
  OfficeSDK.prototype.delBookmarks = function (params, callback) {
    return _promiseDecorator(this, 'delBookmarks', params, callback);
  };

  /**
   * 获取文档大小
   * 
   * @returns{string} 文件大小的数字字符串  如：'1200'
   */
  OfficeSDK.prototype.contentLength = function (params, callback) {
    return _promiseDecorator(this, 'contentLength', params, callback);
  };

  /**
   * 获取文档大小日期
   *
   * @returns {object} 文件大小和文件创建日期
   * 如：
   * {
   *     fileSize: "123",
   *     createDate: "2023-01-12 10:22:23"
   * }
   */
  OfficeSDK.prototype.contentLengthAndCreateDate = function (params, callback) {
    return _promiseDecorator(this, 'contentLengthAndCreateDate', params, callback);
  };

  /**
   * 签章
   */
  OfficeSDK.prototype.signature = function (params, callback) {
    return _promiseDecorator(this, 'signature', params, callback);
  };

  /**
   * 是否有专业签章 
   */
  OfficeSDK.prototype.hasProfessionalSign = function (params, callback) {
    return _promiseDecorator(this, 'hasProfessionalSign', params, callback);
  };

  /**
   * 获取签章数量(包括专业章)
   */
  OfficeSDK.prototype.countSignatures = function (params, callback) {
    return _promiseDecorator(this, 'countSignatures', params, callback);
  };

  /**
   * 下载正文 
   */
  OfficeSDK.prototype.download = function (params, callback) {
    return _promiseDecorator(this, 'download', params, callback);
  };

  /**
   * 正文预览
   */
  OfficeSDK.prototype.preview = function (params, callback) {
    return _promiseDecorator(this, 'preview', params, callback);
  };

  /**
   * 解析图片
   */
  OfficeSDK.prototype.analyzing = function (params, callback) {
    return _promiseDecorator(this, 'analyzing', params, callback);
  };

  /**
   * 判断正文是否为空
   */
  OfficeSDK.prototype.isEmpty = function (params, callback) {
    return _promiseDecorator(this, 'isEmpty', params, callback);
  };

  /**
   * 是否支持多人编辑
   */
  OfficeSDK.prototype.supportMultiEditing = function (params, callback) {
    return _promiseDecorator(this, 'supportMultiEditing', params, callback);
  };

  /**
   * 批量替换书签内容
   * @param swapList 书签列表 [
   * 		{
   * 		 	bmName : 书签名称,
   * 		 	newVal : 替换的内容
   * 		},
   * ]
   */
  OfficeSDK.prototype.batchSwap = function (params, callback) {
    return _promiseDecorator(this, 'batchSwap', params, callback);
  };
  /**
   * 替换单个书签内容, 不高亮内容， 用于批量修改
   * @param bmName
   * @param newVal
   */
  OfficeSDK.prototype.swapWithoutHighlight = function (bmName, newVal, callback) {
    var _params = {
      bmName: bmName,
      newVal: newVal
    };
    return _promiseDecorator(this, 'swapWithoutHighlight', _params, callback);
  };
  /**
   * 删除书签
   * @param {object} params {'bmName1','bmName2','bmName3'}
   */
  OfficeSDK.prototype.batchDeleteBM = function (params, callback) {
    return _promiseDecorator(this, 'batchDeleteBM', params, callback);
  };
  /**
   * 流转版PDF
   * @param {object} params 
   * @param {string} newPdfFileId
   * @param {string} type  'pdf' 'ofd
   * @param {*} callback 
   * @returns 
   */
  OfficeSDK.prototype.transform = function (params, callback) {
    if (this.adapterInstance === null) {
      // OfficeSDK.utils.alert(tips.alert);
      callback && callback({
        code: 1,
        msg: tips.alert
      });
      return false;
    }
    var newFileId = params.newFileId;
    var type = params.type;
    //加载loading
    try {
      if (typeof progressBar != "undefined" && progressBar) {
        //如果有遮罩，先关闭
        progressBar.close();
      }
      progressBar = getA8Top().$.progressBar({
        text: '转换中...'
      });
    } catch (e) {
      console.log(e);
    }
    var _self = this;
    return new Promise(function (resolve, reject) {
      // 能力不支持转换
      if (_self.cacheAbilityMapping && _self.cacheAbilityMapping.TRANSFORM === "NONE") {
        if (progressBar) {
          progressBar.close();
        }
        callback && callback(null, false);
        resolve(false);
      }
      /* TODO 存在bug: wdt+金山预览组合时，转版业务都是先打开编辑态，再转版。
      * 这里少了判断，直接走了编辑的adapter 导致无法使用金山预览转版。后续需要修改
       */
      if (_self.cacheAbilityMapping && _self.cacheAbilityMapping.TRANSFORM === "ONLINE_PREVIEW_SUWELL") {
        var originalFileId = _self.params.originalFileId ? params.originalFileId : 0;
        var param = {
          webRoot: _self.params.webRoot,
          fileId: _self.params.fileId,
          fileName: _self.params.fileName,
          fileType: _self.params.fileType,
          originalFileId: originalFileId,
          targetType: type,
          needClearDocument: true,
          resultFileId: newFileId
        };
        transFormWordToCeb(param, function (err, result) {
          if (progressBar) {
            progressBar.close();
          }
          callback && callback(err, result);
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } else {
        _self.adapterInstance.transform(params, function (err, result) {
          if (progressBar) {
            progressBar.close();
          }
          callback && callback(err, result);
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }
    });
  };

  /**
   * 修改正文
   */
  OfficeSDK.prototype.modifyContent = function (params, callback) {
    return _promiseDecorator(this, 'modifyContent', params, callback);
  };

  /**
   * 获取office正文id
   * @param params
   * @param callback
   * @returns {*}
   */
  OfficeSDK.prototype.getFileId = function (params, callback) {
    return this.params.fileId;
  };

  /**
   * 设置客户端最小化（WPS）
   * @param params
   * @param callback
   * @returns {Promise<unknown>}
   */
  OfficeSDK.prototype.hide = function (params, callback) {
    return _promiseDecorator(this, 'hide', params, callback);
  };
  /**
   * 激活wps
   * @param params
   * @param callback
   * @returns {Promise<unknown>}
   */
  OfficeSDK.prototype.active = function (params, callback) {
    return _promiseDecorator(this, 'active', params, callback);
  };

  /**
   * 判断文件是否存在（版式用）
   */
  OfficeSDK.prototype.fileExists = function (params, callback) {
    return _promiseDecorator(this, 'fileExists', params, callback);
  };

  /**
   * 控制打印分数
   * @param {*} params 
   * @param {*} callback 
   * @returns 
   */
  OfficeSDK.prototype.decryptSeal = function (params, callback) {
    return _promiseDecorator(this, 'decryptSeal', params, callback);
  };

  /**
   * 导出qpJson
   * @returns {String} qpJson
   */
  OfficeSDK.prototype.getQpJson = function () {
    if (this.adapterInstance === null) {
      return null;
    }
    return this.adapterInstance.getQpJson();
  };

  /**
   * 设置qpJson
   * @param {String} json qpJson
   * @returns
   */
  OfficeSDK.prototype.setQpJson = function (json) {
    if (this.adapterInstance === null) {
      return false;
    }
    return this.adapterInstance.setQpJson(json);
  };
  /**
   * 是否为客户端app，例如WPS
   * @returns
   */
  OfficeSDK.prototype.isClientApp = function () {
    if (this.adapterInstance === null) {
      return null;
    }
    return this.adapterInstance.isClientApp();
  };
  OfficeSDK.prototype.isAllowSignature = function () {
    if (this.adapterInstance === null) {
      return false;
    }
    return this.adapterInstance.isAllowSignature();
  };
  OfficeSDK.prototype.isAllowTransform = function () {
    if (this.adapterInstance === null) {
      return false;
    }
    return this.adapterInstance.isAllowTransform();
  };
  /**
   * 正文是否修改
   * @returns {boolean}
   */
  OfficeSDK.prototype.contentIsModified = function () {
    if (this.adapterInstance === null) {
      return false;
    }
    return this.adapterInstance.contentIsModified();
  };
  /**
   * 在光标处插入文本内容
   * @param {Object} params 
   * {
   *     @param {string} content // 文本内容
   * }
   * @param {Function} callback 
   * @returns {Promise}
   */
  OfficeSDK.prototype.insertText = function (params, callback) {
    return _promiseDecorator(this, 'insertText', params, callback);
  };

  /**
   * 直接调用三方原生接口
   * @param {Object} params 
   * {
   * }
   */
  OfficeSDK.prototype.getThirdInstance = function (params, callback) {
    return _promiseDecorator(this, 'getThirdInstance', params, callback);
  };

  /**
   * 获取当前选中的区域
   * @param {*} params 
   * @param {*} callback 
   * @returns 
   */
  OfficeSDK.prototype.getCurrentSelection = function (params, callback) {
    return _promiseDecorator(this, 'getCurrentSelection', params, callback);
  };
  OfficeSDK.prototype.getContainerAttributes = function (params, callback) {
    return _promiseDecorator(this, 'getContainerAttributes', params, callback);
  };
  OfficeSDK.prototype.setScrollTo = function (params, callback) {
    return _promiseDecorator(this, 'setScrollTo', params, callback);
  };
  OfficeSDK.prototype.setContent = function (params, callback) {
    return _promiseDecorator(this, 'setContent', params, callback);
  };
  OfficeSDK.prototype.setDocFieldContent = function (params, callback) {
    return _promiseDecorator(this, 'setDocFieldContent', params, callback);
  };
  OfficeSDK.prototype.getSelectionText = function (params, callback) {
    return _promiseDecorator(this, 'getSelectionText', params, callback);
  };
  OfficeSDK.prototype.getBookmarkContent = function (params, callback) {
    return _promiseDecorator(this, 'getBookmarkContent', params, callback);
  };
  OfficeSDK.prototype.getDocFieldList = function (params, callback) {
    return _promiseDecorator(this, 'getDocFieldList', params, callback);
  };
  OfficeSDK.prototype.getDocFieldContent = function (params, callback) {
    return _promiseDecorator(this, 'getDocFieldContent', params, callback);
  };
  OfficeSDK.prototype.deleteBookmark = function (params, callback) {
    return _promiseDecorator(this, 'deleteBookmark', params, callback);
  };
  OfficeSDK.prototype.cleanAllContent = function (params, callback) {
    return _promiseDecorator(this, 'cleanAllContent', params, callback);
  };
  OfficeSDK.prototype.newLine = function (params, callback) {
    return _promiseDecorator(this, 'newLine', params, callback);
  };
  OfficeSDK.prototype.newLineOnEnd = function (params, callback) {
    return _promiseDecorator(this, 'newLineOnEnd', params, callback);
  };
  OfficeSDK.prototype.continueWriteWithNewLine = function (params, callback) {
    return _promiseDecorator(this, 'continueWriteWithNewLine', params, callback);
  };
  OfficeSDK.prototype.getAllContent = function (params, callback) {
    return _promiseDecorator(this, 'getAllContent', params, callback);
  };
  OfficeSDK.prototype.hasDocField = function (params, callback) {
    return _promiseDecorator(this, 'hasDocField', params, callback);
  };

  /**
   * 获取配置信息 静态方法
   * @param {String} fileType
   * @param {String} mode
   * @param {Function} callback
   * @returns
   */
  OfficeSDK.getConfig = function (fileType, mode, callback) {
    var ctxPath = OfficeSDK.utils.getWebRoot();
    return new Promise(function (resolve, reject) {
      ajax({
        url: ctxPath + '/rest/office/config/adapter/init_info',
        type: 'GET',
        data: {
          fileType: fileType,
          mode: mode
        },
        success: function success(res) {
          callback && callback(null, res);
          resolve(res);
        },
        error: function error(err) {
          callback && callback(err, null);
          reject(false);
        }
      });
    });
  };
  OfficeSDK.getOfficeSDKConfig = function (callback) {
    var ctxPath = OfficeSDK.utils.getWebRoot();
    return new Promise(function (resolve, reject) {
      ajax({
        url: ctxPath + '/rest/office/config/adapter/mapping',
        type: 'GET',
        success: function success(res) {
          if (res.code == 0) {
            callback && callback(null, res);
            resolve(res);
          } else {
            callback && callback(false, null);
            reject(false);
          }
        },
        error: function error(err) {
          callback && callback(err, null);
          reject(false);
        }
      });
    });
  };

  /**
   * 各个三方adapter 使用的公共方法
   */
  OfficeSDK.utils = {
    alert: function alert(message) {
      return AlertManager.cusAlert(message);
    },
    /**
     * 判断是否是移动端
     * @returns {boolean} true: mobile  false:pc 
     */
    isMobile: function isMobile() {
      var userAgent = navigator.userAgent;
      // 判断用户代理字符串中的关键词
      var mobileKeywords = ['Mobi', 'Android', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
      var isMobileByUserAgent = mobileKeywords.some(function (keyword) {
        return userAgent.indexOf(keyword) > -1;
      });
      // 综合判断，至少满足其中一个条件视为移动端
      return isMobileByUserAgent;
    },
    /**
     * 判断文件是版式还是流式
     * @param {string} fileType 
     * @returns 'LIUSHI' 'BANSHI' null
     */
    docType: function docType(fileType) {
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
    },
    /**
     * 判断文件下载是否置灰设置
     *
     * @param fileType
     * @param grayConfig
     * @returns {boolean}
     */
    grayStyle: function grayStyle(fileType, grayConfig) {
      var docType = this.docType(fileType);
      if (docType === 'LIUSHI') {
        return grayConfig.liushi === "0";
      } else if (docType === 'BANSHI') {
        return grayConfig.banshi === "0";
      }
      return false;
    },
    /**
     * 枚举所有的actionId，以便在各个adapter中使用
     */
    ActionIds: {
      /** 枚举项：新增附件 */
      ATTACHMENT_ADD: "-24",
      /** 枚举项：修改附件 */
      ATTACHMENT_MODIFY: "-25",
      /** 枚举项：删除附件 */
      ATTACHMENT_DELETE: "-26",
      /** 枚举项：修改附件-重命名 */
      ATTACHMENT_RENAME: "-27",
      /** 枚举项：附件打印 */
      ATTACHMENT_PRINT: "-39",
      /** 枚举项：附件下载 */
      ATTACHMENT_DOWNLOAD: "-28",
      /** 枚举项：修改附件密级 */
      ATTACHMENT_MODIFY_SECURITY: "-29",
      /** 枚举项：附件另存 */
      ATTACHMENT_SAVE_AS: "-30",
      /** 枚举项：修改正文 */
      CONTENT_MODIFY: "-37",
      /** 枚举项：正文打印 */
      CONTENT_PRINT: "-31",
      /** 枚举项：OFD正文打印（控） */
      OFD_CONTENT_PRINT: "88",
      /** 枚举项：正文保存本地 */
      CONTENT_SAVE_LOCALLY: "-32",
      /** 枚举项：表单文单打印 */
      FORM_PRINT: "-33",
      /** 枚举项：盖章 */
      SEAL: "-34",
      /** 枚举项：归档 */
      ARCHIVE: "-35",
      /** 枚举项：预归档 */
      PRE_ARCHIVE: "-38",
      /** 枚举项：生成签批件 */
      CREATE_SIGNATURE: "44",
      /** 枚举项：下载签批件 */
      DOWNLOAD_SIGNATURE: "450",
      /** 枚举项：转办 */
      FORWARD: "-36",
      /** 枚举项：正文转PDF */
      CONTENT_TO_PDF: "-40",
      /** 枚举项：正文转OFD */
      CONTENT_TO_OFD: "-41",
      /** 枚举项：公文打包下载 */
      DOCUMENT_PACK_DOWNLOAD: "204"
    },
    /**
     * 是否国产操作系统
     * @returns {boolean}
     */
    isChinaOs: function isChinaOs() {
      var isChina = false;
      var ua = navigator.userAgent;
      var isMSIE = navigator.appName == "Microsoft Internet Explorer" || ua.indexOf('Trident') != -1;
      if (!isMSIE) {
        isChina = String(navigator.platform).indexOf("Linux") > -1;
      }
      return isChina; // return true;
    },
    getWebRoot: function getWebRoot() {
      if (typeof window.location.origin == 'undefined') {
        basePath = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + "/seeyon";
      } else {
        var ctxPath = typeof _ctxPath != 'undefined' && _ctxPath != null ? _ctxPath : "/seeyon";
        basePath = window.location.origin + ctxPath;
      }
      return basePath;
    },
    /**
     * 检测Promise对象是否超时，超时执行超时reject
     * @param {*} promise 需要检测的promise对象
     * @param {*} delay 超时时间
     * @param {*} reBackData 自定义返回超时返回内容
     * @returns
     */
    checkTimeoutPromise: function checkTimeoutPromise(promise, delay) {
      var reBackData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        status: false
      };
      var timeout = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(reBackData);
        }, delay);
      });
      return Promise.race([promise, timeout]);
    },
    /**
     * 是否是火狐浏览器
     * @returns
     */
    isFirefox: function isFirefox() {
      return navigator.userAgent.indexOf('Firefox') != -1;
    },
    /**
     * 获取浏览器的大版本号
     * @returns
    */
    getBrowseVersion: function getBrowseVersion() {
      var engine = {
        '360SE': /360SE\/([\d.]+)/,
        'OPR': /OPR\/([\d.]+)/,
        'Edge': /Edge\/([\d.]+)/,
        'Chrome': /Chrome\/([\d.]+)/,
        'Firefox': /Firefox\/([\d.]+)/,
        'Safari': /Version\/([\d.]+).*Safari/,
        'IE': /Trident\/.*rv:([\d.]+)/
      };
      var versionArr = [];
      for (var key in engine) {
        if (navigator.userAgent.indexOf(key) !== -1) {
          var version = navigator.userAgent.match(engine[key]);
          if (version) {
            versionArr.push({
              name: key,
              version: version[1].split(".")[0] //只获取大版本号
            });
          }
        }
      }
      versionArr.push({
        name: "unknown",
        version: 0 //只获取大版本号
      });
      return versionArr;
    },
    /**
     * Office组件提供的确认对话框，确保弹出框在Office控件的前面不会跑到后面去
     */
    confirm: function confirm(confirmText) {
      return this.confirmAsync(confirmText);
    },
    /**
     * 异步方式使用组件$.confirm
     * @param {*} confirmText
     */
    confirmAsync: function confirmAsync(confirmText) {
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
        return OfficeSDK.utils.confirm(confirmText);
      }
    },
    /**
     * 组装日志参数
     * @param params
     */
    assemblingAuditLogParams: function assemblingAuditLogParams(params) {
      var category = params.category;
      if (category === 4 || category === "4") {
        var actionId = params.actionId;
        var processId = params.processId ? params.processId : '';
        var userId = params.userId;
        var fileId = params.fileId;
        var processName = params.fileName;
        var attName = "";
        var activeId = 0;
        try {
          // 兼容表单内修改附件时获取 activeId 需要从父层的父层获取
          activeId = document.getElementById('currentNodeId') != null ? document.getElementById('currentNodeId').value : parent.document.getElementById('currentNodeId') != null ? parent.document.getElementById('currentNodeId').value : parent.parent.document.getElementById('currentNodeId').value;
          if ("start" == activeId) {
            activeId = 0;
          }
        } catch (e) {
          console.log(e);
        }
        var paramData = {
          "processId": processId,
          // 流程ID
          "activityId": activeId,
          //节点ID
          "actionId": actionId,
          // 操作枚举ID
          "category": category,
          // 模块类型
          "userId": userId,
          // 用户ID 有就传递，没有就不传
          "fileId": fileId,
          // 文件ID
          "processName": processName,
          // 流程标题名称或文件名
          "attName": attName,
          //附件名称 针对附件才传递
          "appActionId": 0,
          // 应用操作ID
          "includeAppLog": true // 是否包含应用操作日志
        };
        this.saveAuditLog(paramData);
      }
    },
    /**
     * 保存安全审计日志
     * @param {*} processId 流程ID
     * @param {*} activityId 节点ID
     * @param {*} actionId 操作枚举ID
     * @param {*} category 模块类型
     * @param {*} userId 用户ID 有就传递，没有就不传
     * @param {*} fileId 文件ID
     * @param {*} processName 流程标题名称或文件名
     * @param {*} attName 附件名称 针对附件才传递
     */
    saveAuditLog: function saveAuditLog(params) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      $.ajax({
        url: webRoot + '/rest/workflow/log/processDoLog',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(params),
        success: function success() {
          console.log("saveProcessLog=success");
        },
        error: function error() {
          console.log("saveProcessLog=error");
        }
      });
    },
    getCanEditContent: function getCanEditContent() {
      try {
        if (typeof getCanEdit !== "undefined") {
          return getCanEdit();
        }
        return parent.getCanEdit();
      } catch (e) {}
      return false;
    },
    currentLanguage: function currentLanguage() {
      if (typeof v3x == "undefined") {
        v3x = new V3X();
      }
      if (v3x.currentLanguage) {
        return v3x.currentLanguage;
      }
      if (typeof _locale != "undefined") {
        return _locale;
      }
      return "";
    },
    /**
     * 获取当前用户名
     * @returns
     */
    getCurrentUserName: function getCurrentUserName() {
      var _currUserName = "";
      if (typeof getA8Top == "function" && typeof getA8Top().$ != 'undefined' && typeof getA8Top().$.ctx != 'undefined' && typeof getA8Top().$.ctx.CurrentUser != 'undefined') {
        _currUserName = getA8Top().$.ctx.CurrentUser.name;
      } else if (typeof getCtpTop == "function" && typeof getCtpTop().$ != 'undefined' && typeof getCtpTop().$.ctx != 'undefined' && typeof getA8Top().$.ctx.CurrentUser != 'undefined') {
        _currUserName = getCtpTop().$.ctx.CurrentUser.name;
      } else if (typeof currUserName != "undefined") {
        _currUserName = currUserName;
      } else if (typeof currentUserName != "undefined") {
        _currUserName = currentUserName;
      }
      return _currUserName;
    },
    /**
     * 获取ajax方法
     * @returns ajax的对象
    */
    getAjaxFunc: function getAjaxFunc() {
      if (typeof getA8Top == 'function') {
        var _A8TopWindow = getA8Top();
        if (_A8TopWindow.$ && _A8TopWindow.$.ajax) {
          return _A8TopWindow.$.ajax;
        }
      }
      return $.ajax ? $.ajax : window.top.jQuery.ajax;
    },
    /**
     * 获取流版签后台配置
     * @param {String} code 参考 OfficeConfigEnum
     * @returns {Promise<void>}
     */
    getConfig: function getConfig(code) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/office/config/query',
          type: 'GET',
          data: {
            code: code
          },
          success: function success(res) {
            if (res && typeof res.code !== "undefined" && res.code === 0) {
              resolve(res.data);
            } else {
              resolve(null);
            }
          },
          error: function error() {
            resolve(null);
          }
        });
      });
    },
    /**
     * 获取流版签能力配置(转版，套红，盖章等)
     * @returns {Promise<void>} {TRANSFORM: "ONLINE_PREVIEW_SUWELL" // 转版
     *    TEMPLATE: "ONLINE_PREVIEW_SUWELL"// 套红
    *   PICTURE_SIGN: "ONLINE_PREVIEW_SUWELL" // 盖章}
     */
    getAbilityMapping: function getAbilityMapping() {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/office/config/ability/mapping',
          type: 'GET',
          success: function success(res) {
            if (res && typeof res.code !== "undefined" && res.code === 0) {
              resolve(res.data);
            } else {
              resolve(null);
            }
          },
          error: function error() {
            resolve(null);
          }
        });
      });
    },
    /**
     * 获取当前用户信息
     */
    getUserInfo: function getUserInfo() {
      var webRoot = OfficeSDK.utils.getWebRoot();
      var that = this;
      ajax({
        url: webRoot + '/rest/office/config/cur_user_info',
        type: 'GET',
        success: function success(res) {
          if (res && typeof res.code !== "undefined" && res.code === 0) {
            that.params.userId = res.data.userId;
            that.params.currentUserName = res.data.userName;
          }
        },
        error: function error() {}
      });
    },
    getSeeyonTop: function getSeeyonTop() {
      try {
        if (typeof getA8Top === 'function') {
          return getA8Top();
        } else if (typeof getCtpTop === 'function') {
          return getCtpTop();
        } else {
          return top;
        }
      } catch (e) {
        window.console && window.console.log(e.message);
        return top;
      }
    },
    getSeeyonIndex: function getSeeyonIndex() {
      var _window = this.getSeeyonTop();
      if (typeof _window.getMaxZindex === 'function') {
        return _window.getMaxZindex(0);
      } else {
        return getMaxDialogZindex();
      }
    },
    showDialog: function showDialog(adapter, fileId, isHide, title) {
      //获取当前弹窗的zIndex 
      var zIndex = this.getSeeyonIndex();
      var seeyonTop = this.getSeeyonTop();
      var _zindex = zIndex;
      var _opacity = 1;
      if (isHide) {
        _zindex = -100;
        _opacity = 0;
      }
      var headerTitle = title ? title : '正文';
      // var dialogElement = window.top.document.getElementById(`dialog_${fileId}`)
      var dialogElement = adapter.dialogContainer;
      // 如果之前有弹窗，就显示 
      if (dialogElement) {
        dialogElement.style.zIndex = _zindex;
        dialogElement.style.opacity = _opacity;
      } else {
        // window.top.document.body.insertAdjacentHTML('beforeend', dialogContent);
        var dialogContent = document.createElement('div');
        adapter.dialogContainer = dialogContent;
        dialogContent.style.opacity = _opacity;
        dialogContent.style.zIndex = _zindex;
        // 设置 div 元素的 ID
        dialogContent.id = "dialog_".concat(fileId);
        // 设置 div 元素的样式
        dialogContent.style.position = 'fixed';
        dialogContent.style.top = '0';
        dialogContent.style.left = '0';
        dialogContent.style.width = '100%';
        dialogContent.style.height = '100%';
        var dialogHtml = "\n            <div style=\"width: 100%;height: 100%;background-color: #000;opacity: 0.3;\"></div>\n            <div style=\"display: flex;flex-direction: column;position: absolute;width: 90vw;height: 90vh;top: 5vh;left: 5vw; background-color: #fff;box-shadow: 0 0 10px #333;transform:translate3d( 0, 0, 0)\" id=\"office_sdk_content\" class=\"office_sdk_content\">\n              <div style=\"display: flex; flex-direction: row;justify-content: space-between;align-items: center;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;cursor: move;background: #fff;color: #000; padding: 0 20px 0 20px;height: 49px;line-height: 50px;font-size: 14px;box-sizing: content-box;border-bottom: 1px solid #f1f1f1; border-bottom: 1px solid rgba(0, 0, 0, .06);font-weight: 500;\" id=\"office_sdk_draggable\" class=\"office_sdk_draggable\" >\n                  <span class=\"layer_title\">".concat(headerTitle, "</span>\n                  <div id='office_sdk_close' class='office_sdk_close'  style=\"cursor: pointer;position: relative;width: 20px;height: 20px;display: inline-block;vertical-align: middle;transform: rotate(45deg);\">\n                      <div  style=\"position: absolute;background-color: #000;transition: background-color 0.3s ease;width: 100%;height: 1px;top: 50%;left: 0;transform: translateY(-50%);\">\n                      </div>\n                      <div  style=\"position: absolute; background-color: #000; transition: background-color 0.3s ease; width: 1px;height: 100%; top: 0; left: 50%;transform: translateX(-50%);\">\n                      </div>\n                    </div>\n              </div>\n              <div class=\"layer_content\" style=\"flex: 1;\">\n                <div id=\"contentContainer\" style=\"width: 100%;height: 100%;\">\n                </div>\n              </div>\n            </div>\n        ");
        dialogContent.innerHTML = dialogHtml;
        seeyonTop.document.body.appendChild(dialogContent);
      }

      // 等待DOM更新（现代浏览器通常不需要此步，但为了确保DOM已加载可以使用setTimeout或requestAnimationFrame）
      parent.window.requestAnimationFrame(function () {
        if (!adapter.dialogContainer) {
          // 业务上创建了流版签对象，马上就做了卸载，这里的dialogContainer就会被置空，后续的逻辑会报错，所以直接返回
          return;
        }
        // 弹窗唯一id
        var dialogEle = adapter.dialogContainer; // window.top.document.getElementById(`dialog_${fileId}`)
        // 关闭按钮
        var closeEle = dialogEle.querySelector('.office_sdk_close');
        // 拖拽区域
        var draggableElement = dialogEle.querySelector('.office_sdk_draggable');
        // 弹窗区域
        var contentElement = dialogEle.querySelector('.office_sdk_content');
        var isDragging = false;
        var currentX,
          currentY,
          initialX,
          initialY,
          offsetX = 0,
          offsetY = 0;

        // 弹窗关闭按钮事件
        function handleCloseHandler() {
          if (adapter.params.isLoadingFile) {
            // 正在打开文件时，不允许关闭弹窗
            return;
          }

          // 因为部分三方的保存方法很慢，加一个loading
          var processBar = undefined;
          var ctpTop = getA8Top();
          var getProgressBarFunc = ctpTop && ctpTop.$ ? ctpTop.$.progressBar : $ ? $.progressBar : undefined;
          if (adapter.params.mode != OfficeSDK.ENUM_MODE_TYPE.VIEW && getProgressBarFunc) {
            processBar = getProgressBarFunc({
              text: '正在保存正文...'
            });
          }
          adapter.saveFile({
            isAsync: false
          }, function (err, res) {
            processBar && processBar.close();
            processBar = undefined;
            dialogEle.style.zIndex = -100;
            dialogEle.style.opacity = 0;
            if (typeof adapter.params.dialogCloseCallback === 'function') {
              var flag = adapter.params.dialogCloseCallback();
              if (flag) {
                if (typeof adapter.destroy === 'function') {
                  adapter.destroy();
                }
              }
            } else {
              if (typeof adapter.destroy === 'function') {
                adapter.destroy();
              }
            }
          });
          // adapter.closeDialogCallback({ isAsync: true }, (err, res) => {
          //   adapter.dialogContainer.style.zIndex = -100;
          // });
        }
        function handleMouseDown(e) {
          isDragging = true;
          initialX = e.clientX - offsetX;
          initialY = e.clientY - offsetY;
          if (e.target === draggableElement) {
            addEvent(seeyonTop.document, 'mousemove', handleMouseMove);
            addEvent(seeyonTop.document, 'mouseup', handleMouseUp);
          }
        }
        function handleMouseMove(e) {
          if (!isDragging) return;
          e.preventDefault();
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
          offsetX = currentX;
          // 弹窗拖动区域不能超出屏幕顶部
          var minTop = -parseInt(dialogEle.clientHeight * 0.05);
          currentY = currentY < minTop ? minTop : currentY;
          offsetY = currentY;
          setTranslate(currentX, currentY, contentElement);
        }
        function handleMouseUp(e) {
          if (!isDragging) return;
          isDragging = false;
          removeEvent(seeyonTop.document, 'mousemove', handleMouseMove);
          removeEvent(seeyonTop.document, 'mouseup', handleMouseUp);
          initialX = currentX;
          initialY = currentY;
        }

        // 拖拽实时设置元素的位置
        function setTranslate(xPos, yPos, el) {
          el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
        }

        // 绑定事件
        function addCustomEventListener(element, eventType, handler) {
          if (!adapter.eventRegistry[fileId]) {
            adapter.eventRegistry[fileId] = {};
          }
          if (!adapter.eventRegistry[fileId][eventType]) {
            adapter.eventRegistry[fileId][eventType] = [];
          }
          addEvent(element, eventType, handler);
          adapter.eventRegistry[fileId][eventType].push(handler);
        }

        // 判断给当前元素是否绑定过某种事件
        function hasEventListener(fileId, eventType) {
          return adapter.eventRegistry[fileId] && adapter.eventRegistry[fileId][eventType] && adapter.eventRegistry[fileId][eventType].length > 0;
        }

        // 避免 绑定多次事件，
        if (!hasEventListener(fileId, 'mousedown')) {
          // 绑定拖拽事件
          addCustomEventListener(draggableElement, 'mousedown', handleMouseDown);

          // 绑定弹窗关闭按钮事件
          var newCloseEle = closeEle.cloneNode(true); // 克隆一个元素，克隆出来的元素没有任何监听事件
          closeEle.parentNode.replaceChild(newCloseEle, closeEle); // 替换原来的元素，相当于去掉元素的所有监听事件
          closeEle = newCloseEle;
          addCustomEventListener(closeEle, 'click', handleCloseHandler);
        }
      });
    },
    /**
     * 拷贝文件，
     * @param fileId source文件id
     * @param originalFileId 目标文件id
     * @param isCover 是否覆盖目标文件 1：覆盖，0：目标文件存在则拷贝失败
     * @returns {Promise<unknown>}
     */
    copyWebOffice: function copyWebOffice(fileId, originalFileId) {
      var isCover = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/office/file/copyFile',
          type: 'GET',
          data: {
            sourceId: fileId,
            targetId: originalFileId,
            isCover: isCover
          },
          success: function success(msg) {
            if (msg.code == 0) {
              resolve(msg.data.targetId);
            } else {
              resolve(false);
            }
          },
          error: function error() {
            resolve(false);
          }
        });
      });
    },
    /**
     * 判断挂载点是否存在
     */
    checkOfficeFrameIsExit: function checkOfficeFrameIsExit(tagName) {
      return document.getElementById(tagName) ? true : false;
    },
    // createOfficeFrameHTMLInsert: function (param) {
    //   var attHTML = param.targetDom;
    //   var name = document.createElement('div');
    //   name.setAttribute("type", "String");
    //   name.setAttribute("name", "officeFrameDiv");
    //   if (param.frameDiv) {
    //     name.setAttribute("id", param.frameDiv);
    //   } else {
    //     name.setAttribute("id", "officeFrameDiv");
    //   }
    //   name.style.width = "100%";
    //   name.style.height = "100%";
    //   name.style.display = "inline-block";
    //   name.innerHTML = "<iframe id='officeEditorFrame' name='officeEditorFrame' frameborder=\"0\" height=\"100%\" width=\"100%\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\"></iframe>";
    //   attHTML.appendChild(name);
    // },
    // createOfficeFrameHTML: function (param) {
    //   var attHTML = param.officeDom;
    //   var name = document.createElement('div');
    //   name.setAttribute("type", "String");
    //   name.setAttribute("name", "officeFrameDiv");
    //   if (param.frameDiv) {
    //     name.setAttribute("id", param.frameDiv);
    //   } else {
    //     name.setAttribute("id", "officeFrameDiv");
    //   }
    //   name.style.width = "2px";
    //   name.style.height = "2px";
    //   name.style.display = "inline-block";
    //   name.innerHTML = "<iframe id='officeEditorFrame' name='officeEditorFrame' frameborder=\"0\" height=\"2\" width=\"2\" scrolling=\"no\" marginheight=\"0\" marginwidth=\"0\"></iframe>";
    //   attHTML.appendChild(name);
    // },
    /**
     *  判断文件类型
     */
    getMimeType: function getMimeType(mimeType) {
      if (mimeType == "application/msword") {
        return "OfficeWord";
      } else if (mimeType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        return "OfficeWord";
      } else if (mimeType == ".doc" || mimeType == "doc") {
        return "OfficeWord";
      } else if (mimeType == ".docx" || mimeType == "docx") {
        return "OfficeWord";
      } else if (mimeType == "application/kswps") {
        return "OfficeWord";
      } else if (mimeType == ".wps" || mimeType == "wps") {
        return "OfficeWord";
      } else {
        return mimeType;
      }
    },
    taohong: function taohong(params, callback) {
      var extParam = params.extParam;
      var originContentId = null;
      var useOriginContentTaohong = false;
      if (extParam != null) {
        originContentId = extParam.originContentId;
        useOriginContentTaohong = extParam.useOriginContentTaohong;
      }
      var data = {};
      if (typeof params.templateType != "undefined") {
        var refreshBookMarkText = false;
        if (typeof params.refreshBookMarkText != "undefined") {
          refreshBookMarkText = true;
        }
        if (params.templateType === "edoc") {
          data = {
            templateUrl: params.templateUrl,
            taohongType: "BODY",
            fileId: params.fileId,
            fileType: params.fileType,
            originContentId: originContentId,
            useOriginContentTaohong: useOriginContentTaohong,
            refreshBookMarkText: refreshBookMarkText
          };
        } else if (params.templateType === "script") {
          data = {
            templateUrl: params.templateUrl,
            taohongType: "FORM"
          };
        }
      } else {
        if (params.taohongType === "FORM") {
          data = {
            needClearDocument: params.needClearDocument,
            // 表单转文档后端套红不保留痕迹
            documentInfo: params.documentInfo,
            taohongType: "FORM",
            fileId: params.fileId,
            fileType: "doc"
          };
        } else {
          data = {
            fileId: params.fileId
          };
        }
      }
      params.allBookMark && params.allBookMark.forEach(function (item) {
        if (item.type == "IMAGE") {
          var imgInfo = item.imgInfo;
          if (typeof imgInfo != "undefined") {
            var imgValObj = {
              inputType: imgInfo.inputType,
              imgId: imgInfo.imgId,
              createDate: imgInfo.createDate,
              isSignatrue: imgInfo.isSignatrue
            };
            item.imgInfo = imgValObj;
          }
        }
      });
      data.bookMarkInfoList = params.allBookMark;
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/suWellTaoHong/taohong',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function success(res) {
            if (res.code === 0) {
              sessionStorage.setItem("hasTaohong", "true");
              callback && callback(null, res.data);
              resolve(res.data);
            } else {
              sessionStorage.removeItem("hasTaohong");
              callback && callback(res, null);
              resolve(res);
            }
          },
          error: function error(e) {
            callback && callback(e, null);
            sessionStorage.removeItem("hasTaohong");
            reject(e);
          }
        });
      });
    },
    /**
     * 获取表单转文档后端套红需要的数据,只提供给表单转文档使用
     * @param {*} formDatas 传递的书签数据
     * @param {*} fileId 正文id
     */
    // getFormData: function (formDatas, fileId) {
    //   //处理文单中的数据
    //   var datas = [];
    //   if (formDatas && formDatas.length > 0) {
    //     for (var item of formDatas) {
    //       if (item.source && item.value && item.target && item.inputType) {
    //         var dataType = item.inputType; // 套入类型['TEXT,'IMAGE','DOCUMENT']
    //         var fieldName = item.source; // 表单制作时绑定的映射值
    //         var mappingName = item.target; //书签名
    //         var dataValue = item.value;
    //         var obj = { "fieldName": fieldName, "mappingName": mappingName, "dataType": dataType, "dataValue": dataValue };
    //         if (dataType === 'image' || dataType == "handwrite" || dataType == "barcode") {
    //           obj.imgId = dataValue;
    //           if (dataType == "image" && dataValue) {
    //             var valArray = dataValue.split("_");
    //             obj.createDate = valArray[1];
    //             obj.imgId = valArray[0];
    //           }
    //         } else if (dataType == 'DOCUMENT' && item.fileId) {
    //           obj.fileId = item.fileId;
    //           obj.fileType = item.fileType;
    //         }
    //         datas.push(obj);
    //       }
    //     }
    //   }
    //   var bookMarkInfoList = [];
    //   // 格式化数据
    //   for (var i = 0, len = datas.length; i < len; i++) {
    //     var item = datas[i] || {};

    //     // 没有书签名的不统计在内
    //     if (!item.mappingName || item.dataType === 'table') continue;
    //     var bookmarkInfo = {
    //       bookmark: item['mappingName'],
    //       text: (item['imgId'] || item['fileId']) ? '' : item['dataValue'],
    //       type: 'TEXT',
    //     };

    //     //套图片
    //     if (item.imgId) {
    //       bookmarkInfo['type'] = 'IMAGE';
    //       bookmarkInfo['imgInfo'] = {
    //         imgId: btoa(item.imgId),
    //         inputType: item.dataType,
    //         createDate: item.createDate ? item.createDate : new Date().getTime(),
    //         isSignatrue: "false",
    //         value: item.imgId
    //       }
    //     }

    //     //套文本
    //     if (item.fileId) {
    //       bookmarkInfo['type'] = 'DOCUMENT';
    //       bookmarkInfo['fileInfo'] = {
    //         fileId: item.fileId,
    //         fileType: item.fileType
    //       }
    //     }
    //     bookMarkInfoList.push(bookmarkInfo);
    //   }
    //   //拼接后端套红数据
    //   return {
    //     templateUrl: "",
    //     taohongType: "FORM",
    //     needClearDocument: true,// 表单转文档后端套红不保留痕迹
    //     documentInfo: {
    //       fileId: fileId,
    //       fileType: "doc",
    //       originalFileId: ""
    //     },
    //     fileId: fileId,
    //     fileType: "doc",
    //     allBookMark: bookMarkInfoList
    //   };
    // },
    removeOfficeFrameHTML: function removeOfficeFrameHTML(parentDom, id) {
      if (!parentDom) return;
      if (!id) {
        id = "officeFrameDiv";
      } else if (parentDom.id.indexOf(id) != -1) {
        id = parentDom.id + "officeFrameDiv";
      } else {
        id += "officeFrameDiv";
      }
      var childs = parentDom.children;
      if (childs) {
        //必须异步remove，不然会卡死控件
        setTimeout(function () {
          for (var i = 0; i < childs.length; i++) {
            if (id == childs[i].id) {
              parentDom.removeChild(childs[i]);
            }
          }
        }, 100);
      }
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
        ret = ret.replaceAll("<br/>", '');
        // 放开对“：”的限制
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
    allProductType: function allProductType() {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: webRoot + "/rest/office/config/all_product_type",
          method: "GET",
          success: function success(data) {
            resolve(data.data);
          }
        });
      });
    },
    isExcel: function isExcel(bodyTye) {
      var EXCEL = ['xls', 'xlsx', 'xlt', 'xltm', 'xltx', 'xlsm', 'xlsb', 'et', 'ett', 'csv'];
      return EXCEL.indexOf(bodyTye) !== -1;
    },
    isMultipleTabsExcel: function isMultipleTabsExcel(fileId) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: webRoot + "/rest/officeTrans/isMultipleTabsExcel/" + fileId,
          method: "GET",
          success: function success(data) {
            resolve(data.data);
          }
        });
      });
    },
    clearOfficeTransCache: function clearOfficeTransCache(fileId) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        $.ajax({
          url: webRoot + "/rest/officeTrans/clearOfficeTransCache/" + fileId,
          method: "GET",
          success: function success(data) {
            resolve(data.data);
          }
        });
      });
    },
    /**
     * 获取随机密码
     * @returns
     */
    getProtectPassword: function getProtectPassword() {
      var pwd_length = 50;
      var pwd_arr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      var pwd = "";
      for (var i = 0; i < pwd_length; i++) {
        pwd += pwd_arr[Math.floor(Math.random() * pwd_arr.length)];
      }
      return pwd;
    },
    countSignatures: function countSignatures(params, callback) {
      return new Promise(function (resolve, reject) {
        var count = 0;
        var data = {
          fileId: params.fileId,
          fileType: params.fileType
        };
        ajax({
          url: OfficeSDK.utils.getWebRoot() + '/rest/office/file/getImageProperty',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data),
          success: function success(msg) {
            if (msg.data && msg.data.end) {
              var imgArr = [];
              if ('doc,docx,wps'.indexOf(data.fileType) > -1) {
                // 文字
                imgArr = msg.data.exportData.getimageproperty;
              } else {
                // 表格
                var sheetObj = msg.data.exportData.getimageproperty;
                for (var k in sheetObj) {
                  var _imgArr;
                  (_imgArr = imgArr).push.apply(_imgArr, _toConsumableArray(sheetObj[k]));
                }
              }
              for (var i = 0; i < imgArr.length; i++) {
                var res = imgArr[i];
                var alternativeText = res.AlternativeText;
                if (alternativeText && alternativeText.indexOf("DBSTEP_MARK") !== -1) {
                  var stringArray = alternativeText.split(/[(\r\n)\r\n]+/);
                  var map = new Map();
                  for (j = 0; j < stringArray.length; j++) {
                    var s = stringArray[j];
                    if (s.indexOf("=") !== -1) {
                      map.set(s.substr(0, s.indexOf("=")), s.substr(s.indexOf("=") + 1));
                    }
                  }
                  if (map.get("FILENAME") && map.get("MARKNAME") && map.get("USERNAME") && map.get("DATETIME") && map.get("MARKGUID")) {
                    if (map.get("MARKNAME").trim() !== "手写签名" && map.get("MARKNAME").trim() !== "Handwritten") {
                      count++;
                    }
                  }
                }
              }
              callback && callback(null, count);
              resolve(count);
            } else {
              callback && callback(null, count);
              resolve(count);
            }
          },
          error: function error(err) {
            console.log(err);
            callback && callback(null, count);
            resolve(count);
          }
        });
      });
    },
    showDefaultPage: function showDefaultPage(params) {
      var options = {
        fileId: params.fileId ? params.fileId : -1,
        originalFileId: params.originalFileId ? params.originalFileId : -1
      };
      return new Promise(function (resolve, reject) {
        ajax({
          url: params.webRoot + "/rest/office/file/showDefaultPage/" + options.fileId + "/" + options.originalFileId,
          type: 'GET',
          async: true,
          success: function success(res) {
            if (res && res.code === 0) {
              resolve(res.data);
            } else {
              resolve(false);
            }
          },
          error: function error(e) {
            console.info(JSON.parse(e.responseText));
            reject(JSON.parse(e.responseText));
          }
        });
      });
    },
    // 判断如果是否为空文件,若为空文件,则对应的的显示为能上传文件的缺省页或者是不能上传的缺省页
    showUploadContent: function showUploadContent(adapter, readerIframeDom) {
      // 如果是当前是版式文件且文件大小为空。同时以预览打开时不希望展示对应的缺省页,则展示另一种提示,当前文件为空
      if (typeof adapter.params.showEmptyPage === "boolean" && adapter.params.showEmptyPage) {
        readerIframeDom.getElementById("showNotUploadContent").style.display = "";
      } else {
        // 展示缺省页的情况,即普通的切换到版式文件后进行展示
        readerIframeDom.getElementById("uploadContent").style.display = "";
      }
    },
    /**
     * 拷贝文件，
     * @param fileId source文件id
     * @param originalFileId 目标文件id
     * @param isCover 是否覆盖目标文件 1：覆盖，0：目标文件存在则拷贝失败
     * @returns {Promise<unknown>}
     */
    copyWebOfficeAndBakFile: function copyWebOfficeAndBakFile(sourceId, targetId) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/office/file/copyWebOfficeAndBakFile',
          type: 'GET',
          data: {
            sourceId: sourceId,
            targetId: targetId
          },
          success: function success(msg) {
            if (msg.code == 0) {
              resolve(msg.data.targetId);
            } else {
              resolve(false);
            }
          },
          error: function error() {
            resolve(false);
          }
        });
      });
    },
    /**
     * 获取历史版本文件数量
     * @param fileId source文件id
     * @param originalFileId 目标文件id
     * @param isCover 是否覆盖目标文件 1：覆盖，0：目标文件存在则拷贝失败
     * @returns {Promise<unknown>}
     */
    getHistoryFileListCount: function getHistoryFileListCount(fileId) {
      var webRoot = OfficeSDK.utils.getWebRoot();
      return new Promise(function (resolve, reject) {
        ajax({
          url: webRoot + '/rest/office/file/getHistoryFileListCount',
          type: 'GET',
          data: {
            fileId: fileId
          },
          success: function success(msg) {
            if (msg.code == 0) {
              resolve(msg.data);
            } else {
              resolve(0);
            }
          },
          error: function error() {
            resolve(0);
          }
        });
      });
    },
    reportFileBannedWord: function reportFileBannedWord(report) {
      return new Promise(function (resolve, reject) {
        ajax({
          url: OfficeSDK.utils.getWebRoot() + '/rest/office/file/reportFile',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(report),
          success: function success(msg) {},
          error: function error(err) {
            $.alert(err);
          }
        });
      });
    },
    /**
     * 退出全屏
     */
    exitFullScreen: function exitFullScreen() {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          /* Firefox */
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          /* IE/Edge */
          document.msExitFullscreen();
        }
      }
    }
  };

  // 定义一个模块来处理alert组件的选择和调用
  var AlertManager = function () {
    var alertFunc;
    // 初始化 alert()
    function init() {
      // 判断当前环境是PC还是Mobile
      var isMobileEnv = OfficeSDK.utils.isMobile();
      // 根据环境初始化alertFunc
      if (isMobileEnv) {
        // Mobile环境，使用cmp.notification.alert
        if (window.parent && window.parent.cmp) {
          alertFunc = window.parent.cmp.notification.alert;
        } else if (window.cmp) {
          alertFunc = window.cmp.notification.alert;
        } else {
          alertFunc = $.alert || window.top.$.alert || window.alert; // 添加浏览器原生alert作为兜底
        }
      } else {
        // PC环境，使用$.alert或window.top.$.alert
        alertFunc = $.alert || window.top.$.alert || window.alert; // 添加浏览器原生alert作为兜底
      }
    }
    function cusAlert(message) {
      // 调用已初始化的alertFunc
      alertFunc(message);
    }
    return {
      init: init,
      cusAlert: cusAlert
    };
  }();

  // 在项目初始化时调用AlertManager.init()
  AlertManager.init();

  /*************  公共方法 ****************** */
  /**
   * 事件绑定方法
   * @param {HTMLElement} element 
   * @param {string} eventName 
   * @param {Function} handler 
   */
  function addEvent(element, eventName, handler) {
    if (element.addEventListener) {
      // 支持标准事件绑定的浏览器（如现代浏览器）
      element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) {
      // 支持IE特有事件绑定的浏览器（如IE8及以下）
      element.attachEvent("on".concat(eventName), function () {
        // 为确保this指向正确，需要在这里手动绑定
        handler.call(element);
      });
    } else {
      // 对于不支持以上两种方法的古老浏览器，可以尝试使用旧的DOM0级事件绑定方式
      element["on".concat(eventName)] = handler;
    }
  }

  /**
  * 移除事件监听
  * @param { Object } element
  * @param { String } eventName
  * @param { Function } handler
  */
  function removeEvent(element, eventName, handler) {
    if (element.removeEventListener) {
      // 支持标准事件移除的浏览器（如现代浏览器）
      element.removeEventListener(eventName, handler, false);
    } else if (element.detachEvent) {
      // 支持IE特有事件移除的浏览器（如IE8及以下）
      element.detachEvent("on".concat(eventName), handler);
    } else {
      // 对于不支持以上两种方法的古老浏览器，可以尝试直接删除事件处理器属性
      element["on".concat(eventName)] = null;
    }
  }

  /**
   * @param {object} params 
   * @param {object} config 
   * @returns 
   */
  function getAdapterMap(params, config) {
    var fileType = params.fileType.toLowerCase().replace(".", "");
    var that = this;
    var wordArray = ['docx', 'doc', 'wps'];
    var cellArray = ['xlsx', 'xls', 'et', 'ods', 'csv'];
    var pdfArray = ['pdf', 'Pdf', "aip"];
    var ofdArray = ['ofd', 'Ofd'];
    var pptArray = ['pptx', 'ppt', 'dps', 'pps'];
    var textArray = ['log', 'txt', 'ini', 'yml', 'xml', 'cpp', 'cmd', 'java', 'js', 'css', 'h', 'asm', 'asp', 'bas', 'prg', 'c', 's', 'epub', 'md', 'inf', "html"];
    var imgArray = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "psd", "svg", "tiff", "tif", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2", "j2k", "jpf", "jpx", "jpm", "mj2", "jxr", "wdp", "hdp", "webp", "bpg", "jp2"];
    var zipArray = ["zip", "rar", "7z"];
    var docType = '';
    var mode = params.mode;
    if (wordArray.indexOf(fileType) > -1) {
      docType = 'WORD';
    } else if (cellArray.indexOf(fileType) > -1) {
      docType = 'EXCEL';
    } else if (pdfArray.indexOf(fileType) > -1) {
      docType = 'PDF';
    } else if (ofdArray.indexOf(fileType) > -1) {
      docType = 'OFD';
    } else if (pptArray.indexOf(fileType) > -1) {
      docType = 'PPT';
    } else if (textArray.indexOf(fileType) > -1) {
      docType = 'TEXT';
    } else if (imgArray.indexOf(fileType) > -1) {
      docType = 'IMG';
    } else if (zipArray.indexOf(fileType) > -1) {
      docType = "ZIP";
    } else {
      console.log("不支持的文件类型" + fileType + ", 请联系管理员");
      return false;
    }
    var key;
    try {
      key = config[docType][mode];
      that.pluginKey = key;
    } catch (err) {
      console.log(err);
      return false;
    }
    return resolveAdapterMap(that, params, {
      key: key,
      url: ADAPTER_KEY[key]
    });
  }

  /**
   * 加载adapter 
   * @param {Object} params 
   * @param {*} webRoot   根地址+'/seeyon'
   * @param {*} adapterUrl adapter.js 相对路径
   * @param {*} callBack 
   * @returns 
   */
  // RUIAN-FILEZ-ADAPTER-RESOLVER-RUNTIME-BEGIN
  function isAllowedAdapterUrl(url) {
    var normalized = typeof url === 'string' ? url.replace(/^\s+|\s+$/g, '') : '';
    return (
      normalized.length > 0 &&
      normalized.indexOf('..') < 0 &&
      normalized.indexOf('\\') < 0 &&
      normalized.indexOf('//') !== 0 &&
      (
        normalized.indexOf('/apps_res/') === 0 ||
        normalized.indexOf('/common/') === 0
      )
    );
  }

  function isAllowedAdapterUrlList(url) {
    var i;
    if (typeof url === 'string') {
      return isAllowedAdapterUrl(url);
    }
    if (
      Object.prototype.toString.call(url) !== '[object Array]' ||
      url.length === 0
    ) {
      return false;
    }
    for (i = 0; i < url.length; i += 1) {
      if (!isAllowedAdapterUrl(url[i])) {
        return false;
      }
    }
    return true;
  }

  function resolveAdapterMap(instance, params, nativeMap) {
    var i;
    var entry;
    var resolved;
    for (i = 0; i < officeAdapterResolvers.length; i += 1) {
      entry = officeAdapterResolvers[i];
      if (!entry || typeof entry.resolve !== 'function') {
        continue;
      }
      try {
        resolved = entry.resolve(instance, params, {
          key: nativeMap.key,
          url: nativeMap.url
        });
        if (
          resolved &&
          typeof resolved.key === 'string' &&
          /^[A-Z0-9_]{1,80}$/.test(resolved.key) &&
          isAllowedAdapterUrlList(resolved.url)
        ) {
          instance.pluginKey = resolved.key;
          return {
            key: resolved.key,
            url: resolved.url
          };
        }
      } catch (error) {
        if (window.console && typeof window.console.warn === 'function') {
          window.console.warn(
            '[OfficeSDK] adapter resolver failed: ' + (entry.name || 'anonymous'),
            error
          );
        }
      }
    }
    return nativeMap;
  }
  // RUIAN-FILEZ-ADAPTER-RESOLVER-RUNTIME-END

  function loadPlugin(instance) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var callBack = arguments.length > 2 ? arguments[2] : undefined;
    var url = params.webRoot + params.adapterUrl;
    return new Promise(function (resolve, reject) {
      loadAdapterJs(url, function (err, result) {
        if (err) {
          callBack && callBack(err);
          reject(err);
        } else {
          initAdapter(instance, {}, function (err, res) {
            if (err) {
              callBack && callBack({
                err: '实例化adapter失败'
              });
              reject(err);
            } else {
              callBack && callBack(null, res);
              resolve(result);
            }
          });
        }
      }).catch(function () {
        // The callback above settles the public init promise. Consume the
        // internal loader rejection to avoid a duplicate unhandled rejection.
      });
    });
  }

  /**
  * 实例化adapter
  * @param {*} params 
  * @param {*} callback 
  */
  function initAdapter(instance, params, callback) {
    // var Adapter = OfficeSDK.getAdapter(`${instance.pluginName}_${instance.productName}`)
    var Adapter = OfficeSDK.getAdapter("".concat(instance.pluginKey));
    if (Adapter) {
      instance.Adapter = Adapter;
      // 将 OfficeSDK.API 合并到adapter 中
      OfficeSDK.mergePrototype(Adapter.prototype);
      instance.adapterInstance = new Adapter(instance.params, OfficeSDK.utils, instance);
      if (instance.adapterInstance.init) {
        instance.adapterInstance.init(params, callback);
      } else {
        callback && callback(null, true);
      }
    } else {
      callback && callback({
        err: '实例化adapter失败'
      }, true);
    }
  }

  /**
   * 加载adapter.js
   * @param {String} url js地址 必填
   * @param {Function} callBack 回调函数 可填
   * @returns 
   */
  function loadAdapterJs(url, callBack) {
    return new Promise(function (resolve, reject) {
      return loadJS(url, function (err, result) {
        callBack && callBack(err, result);
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  /**
   * 动态加载js文件
   * @param { Array } urls
   * @param {*} callback 
   */
  function loadJS(urls, callback) {
    var queue = [];
    urls = typeof urls === 'string' ? [urls] : urls.concat();
    var urlLen = urls.length;
    for (var i = 0; i < urlLen; ++i) {
      queue.push({
        url: urls[i],
        callback: i === urlLen - 1 ? callback : null // 只有最后一个元素执行callback函数
      });
    }
    queue.forEach(function (item) {
      var url = item.url;
      var callback = item.callback; // 只有最后一个有值，其余都为null
      var script = createNode('script', {
        src: url
      });
      script.async = false;
      script.setAttribute('charset', 'utf-8');
      script.type = 'text/javascript';

      //IE
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState === 'loaded' || script.readyState === 'complete') {
            script.onreadystatechange = null;
            callback && callback();
          }
        };
      } else {
        //其他浏览器
        script.onload = function () {
          callback && callback();
        };
      }
      script.onerror = function () {
        callback && callback(
          new Error('OfficeSDK adapter script failed to load: ' + url)
        );
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }

  /**
  * 创建节点
  * @param {*} name 
  * @param {*} attrs 
  * @returns 
  */
  function createNode(name, attrs) {
    var node = document.createElement(name),
      attr;
    for (attr in attrs) {
      if (attrs.hasOwnProperty(attr)) {
        node.setAttribute(attr, attrs[attr]);
      }
    }
    return node;
  }

  /**
   * 获取当前所有dialog最大的zIndex
   * @returns number 
   */
  function getMaxDialogZindex() {
    var $ = window.top.$ || window.top.jQuery;
    var maxZindex = 1000;
    $('div[laytype="dialog"]').each(function () {
      var zindex = $(this).css('z-index');
      if (zindex > maxZindex) {
        maxZindex = zindex;
      }
    });

    // 适配antd弹窗的zIndex
    $('div[role="dialog"]').each(function () {
      var zindex = $(this).css('z-index');
      if (zindex > maxZindex) {
        maxZindex = zindex;
      }
    });
    return maxZindex;
  }

  /**
  * 在线编辑是否允许有下载按钮
  * @param {object} params 初始化的参数
  * @return {boolean}
  */
  function _canUseDownloadBtn(params) {
    //不受任何权限控制的模块允许有下载权限
    var allowPageName = ["meeting",
    //会议、会议纪要
    "plan",
    //计划
    "fileReport",
    //文件报表
    // 'template',//公文流程设置-正文
    '常用格式配置' //常用格式配置
    ];
    //不允许使用下载功能的模块
    var refusePageName = [
      //"news",//新闻
    ];
    if (allowPageName.indexOf(window.top.pageName) !== -1) {
      return true;
    }
    if (refusePageName.indexOf(window.top.pageName) !== -1) {
      return false;
    }
    //公告模块，有打印权限允许下载文件
    if (window.top.pageName === 'bul' && (params.officecanPrint === 'true' || params.officecanPrint === true || params.canPrint === true)) {
      return true;
    }
    //除了上述特殊情况具有保存正文权限运行下载
    if (params.officecanSaveLocal === 'false' || params.officecanSaveLocal === false || params.officecanSaveLocal === 'false') {
      return false;
    }
    return true;
  }

  /**
   * 转版式
   * @param params
   * @param callback
   */
  function transFormWordToCeb(params, callback) {
    var webRoot = OfficeSDK.utils.getWebRoot();
    var url = webRoot + "/rest/skResource/convert";
    var postData = {
      fileId: params.fileId,
      fileName: params.fileName,
      fileType: params.fileType,
      originalFileId: params.originalFileId,
      targetType: params.targetType,
      needClearDocument: params.needClearDocument,
      resultFileId: params.resultFileId
    };
    ajax({
      url: url,
      type: 'POST',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify(postData),
      success: function success(msg) {
        if (msg.code == 0) {
          callback && callback(null, true);
        } else {
          console.log("\u8F6C\u7248\u5931\u8D25\uFF1A".concat(msg.message));
          callback && callback(null, false);
        }
      },
      error: function error(e) {
        console.info(e);
        callback && callback(e, false);
      }
    });
  }

  /**
   * adapter方法调用装饰器
   * @param {OfficeSDK} context OfficeSDK实例
   * @param {string} fnName 需要执行adapter的方法名称
   * @param {object} params 
   * @param {function} callback 
   * @returns 
   */
  function _promiseDecorator(context, fnName, params, callback) {
    return new Promise(function (resolve, reject) {
      if (!context.adapterInstance) {
        var err = new Error(tips.alert);
        var msg = '当前插件不支持打开' + context.params.fileType + '类型的文件！';
        var result = {
          code: 1,
          msg: msg,
          data: err
        };
        callback && callback(result);
        reject(result);
        return;
      }
      context.adapterInstance[fnName](params, function (error, result) {
        if (error) {
          callback && callback(error);
          reject(error);
        } else {
          callback && callback(null, result);
          resolve(result);
        }
      });
    });
  }

  /**
   * 合并对象
   * @param {*} targetObj 原对象
   * @param {*} newObj    新的对象
   */
  function _extend(targetObj, newObj) {
    var _jquerySDK = $ && $.extend ? $ : window.parent.$ && window.parent.$.extend ? window.parent.$ : null;
    if (_jquerySDK) {
      return _jquerySDK.extend(true, targetObj, newObj);
    } else {
      for (var k in newObj) {
        var value = newObj[k];
        // 需要先处理 数组/函数，再处理Object格式
        if (value instanceof Array) {
          targetObj[k] = value;
        } else if (typeof value == 'function') {
          targetObj[k] = value;
        } else if (value instanceof Object) {
          var oldValue = targetObj[k];
          // 需要先处理 空值/数组/函数，再处理Object格式
          if (!oldValue) {
            targetObj[k] = value;
          } else if (oldValue instanceof Array) {
            targetObj[k] = value;
          } else if (typeof oldValue == 'function') {
            targetObj[k] = value;
          } else if (oldValue instanceof Object) {
            targetObj[k] = _extend(oldValue, value);
          } else {
            targetObj[k] = value;
          }
        } else {
          targetObj[k] = value;
        }
      }
      return targetObj;
    }
  }

  /**
   * 判断是否有数科签章权限
   * @returns {Promise<unknown>}
   */
  function hasSignAuth() {
    return _hasSignAuth.apply(this, arguments);
  }
  function _hasSignAuth() {
    _hasSignAuth = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
      var webRoot;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            webRoot = OfficeSDK.utils.getWebRoot();
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              ajax({
                url: webRoot + '/rest/skResource/hasSignAuth',
                type: 'GET',
                success: function success(res) {
                  if (res.code === 0) {
                    resolve(res.data);
                  } else {
                    resolve(null);
                  }
                },
                error: function error() {
                  resolve(null);
                }
              });
            }));
          case 2:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return _hasSignAuth.apply(this, arguments);
  }
  window.OfficeSDK = window.$SDK = OfficeSDK;
})(window);
//# sourceMappingURL=officeSDK.js.map
