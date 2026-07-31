import * as lang from '@/shared/lib/lang';
const { noop } = lang;

const isShell = !!cmp.platform.CMPShell;
const isDD = !!cmp.platform.DDShell
const isWxWork = !!cmp.platform.wxwork
const isLark = !!cmp.platform.lark
const isHarmony = !!cmp.platform.harmony;
export const isApp = () => isShell || isHarmony;
export const isShellApp = () => isShell;
export const isPad = () => cmp.util.deviceType().match(/IPAD|ANDROIDPAD/);
export const env = () => {
  return { ...cmp.platform, ...cmp.os };
};
export const host = () => cmp.serverIp;
export const ctxPath = () => cmp.seeyonbasepath;
export const isSecure = () => /^https:\/\//.test(cmp.serverIp);

const CAP4_MODE = 'native';
const CAP4_UNFLOW_FORM_URL = isShell
  ? `http://cap4.v5.cmp/v1.0.0/htmls/${CAP4_MODE}/form`
  : `/seeyon/m3/apps/v5/cap4/htmls/${CAP4_MODE}/form`;
const CAP3_UNFLOW_FORM_URL = isShell
  ? 'http://unflowform.v5.cmp/v1.0.0/html/info.html'
  : '/seeyon/m3/apps/v5/unflowform/html/info.html';
const BASE_URL = CAP4_UNFLOW_FORM_URL;
const FILE_URL =
  '/rest/attachment?token=&firstSave=true&applicationCategory=13&option.n_a_s=1';

/**
 * @description 各应用包地址
 */
export const URLS = {
  unflow3: isShell
    ? 'http://unflowform.v5.cmp/v1.0.0'
    : '/seeyon/m3/apps/v5/unflowform', // cap3无流程
  c4unflow: isShell ? 'http://cap4.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/cap4', // cap4无流程
  collaboration: isShell
    ? 'http://collaboration.v5.cmp/v1.0.0'
    : '/seeyon/m3/apps/v5/collaboration', // 协同
  meeting: isShell
    ? 'http://meeting.v5.cmp/v1.0.0'
    : '/seeyon/m3/apps/v5/meeting', // 会议
  edoc: isShell ? 'http://edoc.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/edoc', // 公文
  news: isShell ? 'http://news.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/news', // 新闻
  bulletin: isShell
    ? 'http://bulletin.v5.cmp/v1.0.0'
    : '/seeyon/m3/apps/v5/bulletin', // 公告
  inquiry: isShell
    ? 'http://inquiry.v5.cmp/v1.0.0'
    : '/seeyon/m3/apps/v5/inquiry', // 调查
  bbs: isShell ? 'http://bbs.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/bbs', // 讨论
  doc: isShell ? 'http://doc.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/doc' // doc
};

export const path = {
  base: isShell ? 'http://cap4.v5.cmp/v1.0.0' : '/seeyon/m3/apps/v5/cap4'
};

/**
 * @description app提供的api已就绪
 * @param {Function} handle
 */
export const ready = (handle) => {
  cmp.ready(handle);
};

// ==== webview相关 ====

/**
 * @description 查看表单详情(兼容[有/无]流程/cap[3|4])
 */
export const viewForm = (opts, ignore) => {
  if (ignore === undefined) ignore = isShell || isHarmony;
  if (opts.summaryId) {
    const url = URLS.collaboration + '/html/details/summary.html';
    return openWebView(url, opts, 'all', ignore);
  } else if (opts.version === 'cap3') {
    // CAP3无流程
    return openWebView(CAP3_UNFLOW_FORM_URL, opts, 'all', ignore);
  } else {
    return openWebView('formmain', opts, null, ignore);
  }
};

/**
 * @description 新建表单(兼容[有/无]流程/cap[3|4])
 */
export const newForm = (opts, ignore) => {
  if (ignore === undefined) ignore = isShell || isHarmony;
  if (!opts.formType) {
    const url =
      URLS.collaboration +
      `/html/newCollaboration.html?ref=${opts.mappingDataKey}`;
    return openWebView(url, { templateId: opts.templateId }, 'all', ignore);
  } else {
    return openWebView('formmain', opts, null, ignore);
  }
};

/**
 * @description 打开第三方url(带原生返回按钮头部)
 * @param {String} url
 * @param {Boolean} ignore 是否缓存数据
 */
export const openExternalUrl = (url, ignore = false) => {
  const done = () => {
    if (isShell || isHarmony) {
      cmp.href.next(url, {}, { openWebViewCatch: 1 });
    } else {
      cmp.href.next(url, {});
    }
  };
  if (ignore) return done();
  // NOTE: 在m3里使用beforeviewleave防止和有流程事件冲突
  const event = (isShell || isHarmony) ? 'beforeviewleave' : 'beforepageredirect';
  cmp.event.trigger(event, document, {
    location: 'store',
    done: done
  });
};

const idbGuardTime = 100;
/**
 * @description url跳转
 * @param {String} route
 * @param {Object} data
 * @param {String} type
 * @param {Boolean} ignore 是否缓存数据
 */
export const openWebView = (route, data, type, ignore = false) => {
  let url = route;
  if (type !== 'all') {
    let filename = 'index';
    if (/formson|record/.test(route)) {
      filename = 'record';
    } else if (/relation|assoc/.test(route)) {
      filename = 'assoc';
    }
    url = `${BASE_URL}/${filename}.html`;
  }
  const next = () => {
    const opt = (isShell || isHarmony) ? { openWebViewCatch: 1 } : {};
    setTimeout(() => cmp.href.next(url, data, opt), idbGuardTime);
  };
  if (ignore) return next();
  // NOTE: 在m3里使用beforeviewleave防止和有流程事件冲突
  const event = (isShell || isHarmony) ? 'beforeviewleave' : 'beforepageredirect';
  cmp.event.trigger(event, document, {
    scope: data.scope,
    location: 'store',
    done: next
  });
};

/**
 * @description 关闭webview
 */
export const closeWebView = (backStep = 1) => {
  // NOTE: indexeddb数据可能写入了操作系统缓存还未写入磁盘，延迟关闭页面
  var winPageParams = cmp.href.getParam() || {};
  // 不太明白为啥这里的winPageParams参数中关于smartCode的参数结构不一致，pc菜单智码管理扫码进来的数据位于winPageParams.params，表单内扫码进来的数据位于winPageParams
  var smartCodeParams = winPageParams.randomCode ? winPageParams : winPageParams.params
  if (smartCodeParams && smartCodeParams['randomCode']) {
    var randomCode = smartCodeParams['randomCode'] || '';
    var scanChannel = smartCodeParams['scanChannel'] || '';
    var scanType = smartCodeParams['scanType'] || '';
    var handleOperationId = smartCodeParams['handleOperationId'] || '';
    var originPage = smartCodeParams['originPage'] || 'operatePage';
    var backParams = {
      continueScan: false,
      randomCode,
      scanChannel,
      scanType,
      handleOperationId,
    }
    setTimeout(() => {
      cmp.href.notify(originPage, backParams)
      cmp.href.back(1, backParams)
    }, idbGuardTime);
  } else {
    setTimeout(() => {
      cmp.href.back(backStep)
    }, idbGuardTime);
  }
};

/**
 * @description 监听物理返回键
 */
export const tapBack = (cb = noop, mode) => {
  if (mode === 1) {
    cmp.backbutton.push(function () {
      cb();
      cmp.backbutton.pop();
    });
  } else {
    cmp.backbutton.push(cb);
  }
};

/**
 * @description 方向切换
 */
export const tapOrientation = (cb = noop) => {
  cmp.event.orientationChange(cb);
};

//鸿蒙系统 折叠屏展开和收起会出现样式错乱问题
export const tapFold = (cb) => {
  let isFolded = null;
  cmp.platform.harmony && window.addEventListener("resize", function () {
    cmp.sdk.getDeviceScreenInfo(function (result) {
      // result.data:{
      //     deviceType: 'fold', //fold:折叠屏 phone:可折叠手机 table:平板
      //     isFolded: '2', //折叠状态:2是折叠，1是展开，3是半展开
      //     screenStatus: '0' //屏幕状态:0是竖屏，1是横屏，2是竖屏翻转，3是横屏翻转
      // }
      if (result.data.deviceType !== 'fold') return;//非折叠设备不进行该操作。
      if (isFolded !== result.data.isFolded) {
        cb();
      }
      isFolded = result.data.isFolded;
    });

  });
}
/**
 * @description 上一级页面传递webview的参数
 */
export const getForward = () => {
  const opt = cmp.href.getParam();
  if (typeof opt === 'string') {
    // 兼容从url取参数, cmp.href.getParam取url参数时已做解码处理
    opt.params = JSON.parse(opt.params);
  }
  return opt;
};

/**
 * @description 下一级页面传递给webview的参数
 */
export const getBack = () => cmp.href.getBackParam();

/**
 * @description url上携带的get参数
 */
export const getQuery = lang.queryToObject;

// ==== 提示/loading管理 ====
// 增加loading隐藏延迟，防止连续调用/关闭loading导致页面闪烁

/**
 * @description 开启loading
 */
export const openLoading = (msg) => {
  // console.log('loading->start')
  cmp.dialog.loading(msg);
};

/**
 * @description 关闭loading
 */
export const closeLoading = () => {
  if (ajaxLoading > 0) return; // 还有开启loading的ajax请求未完成
  // console.log('loading->end')
  if (cmp.dialog.__opened) {
    cmp.dialog.__opened = false;
  } else {
    cmp.dialog.loading(false);
  }
};

/**
 * @description 轻量提示框
 */
export const toast = (text, position = 'center', time = 1500, type = 0) => {
  return cmp.notification.toast(text, position, time, type);
};

/**
 * @description 警告框
 */
export const alert = ({
  callback = noop,
  text = '',
  title = cmp.i18n('cap.form.hint'),
  button = cmp.i18n('cap.form.ensure')
}) => {
  return cmp.notification.alert(
    text,
    (...args) => callback(...args),
    title,
    button,
    false // 物理返回键直接后退而不是关闭提示框
  );
};

/**
 * @description 确认对话框
 */
export const confirm = ({
  callback = noop,
  text = cmp.i18n('cmp.form.confirmContinue'),
  title = null,
  buttons = [cmp.i18n('cap.form.cancel'), cmp.i18n('cap.form.confirm')],
  icon = null, // 1-4 成功/失败/异常/警告
  closeable = false
}) => {
  return cmp.notification.confirm(
    text,
    (...args) => callback(...args),
    title,
    buttons,
    icon,
    closeable,
    buttons.length - 1 // 默认物理返回键触发第二个按钮的回调
  );
};

/**
 * @description 可输入对话框
 */
export const prompt = ({
  callback = noop,
  title = null,
  placeholder = '',
  value = '',
  // 默认1，其中，1，text ，2，password，3，number,4 textarea
  inputType = 4,
  buttons = [cmp.i18n('cap.form.cancel'), cmp.i18n('cap.form.confirm')],
  closeable = false
}) => {
  return cmp.notification.prompt(
    title,
    (...args) => callback(...args),
    buttons,
    placeholder,
    value,
    inputType,
    closeable,
    0
  );
};

export const actionSheet = ({ items, callback = noop }) => {
  return cmp.dialog.actionSheet(
    items,
    cmp.i18n('cap.form.cancel'),
    callback,
    callback
  );
};

/**
 * @description 关闭提示框
 */
export const closeDialog = () => {
  cmp.notification.close();
};

// ==== 事件/通信 ====

/**
 * @description 发出事件
 */
//现在不存在多个页面所以不判断原生了，用下面这个
export const emit = (type, data) => {
  lang.emit(type, { eventType: 'hub-event', type, data });
  return undefined;
};

/**
 * @description 监听事件
 */

//现在不存在多个页面所以不判断原生了，用下面这个
export const on = (type, handler) => {
  lang.on(type, handler);
  return undefined;
};


//多页面使用的（目前就是无流程列表）
export const windowEmit = (isShell || isHarmony)
  ? (type, data = {}) => {
    // cmp.webViewListener.fire({ type, data });
    // NOTE: cmp.webViewListener目前测试可能存在bug，暂时替换为StorageEvent替代
    localStorage.setItem(
      'cap-form-event-hub',
      JSON.stringify({ type, ts: Date.now() + Math.random(), data })
    );
    return undefined;
  }
  : (type, data) => {
    lang.emit(type, { eventType: 'hub-event', type, data });
    return undefined;
  };

//多页面使用的（目前就是无流程列表）
export const windowOn = (isShell || isHarmony)
  ? (type, handler = noop) => {
    // cmp.webViewListener.add({ type });
    // document.addEventListener(type, handler);
    // NOTE: cmp.webViewListener目前测试可能存在bug，暂时替换为StorageEvent替代
    window.addEventListener('storage', (storeEvt) => {
      let evt;
      try {
        evt = JSON.parse(storeEvt.newValue);
      } catch (ex) {
        console.info(ex);
      }
      if (evt && evt.type === type) {
        handler(evt);
      }
    });
  }
  : (type, handler) => {
    lang.on(type, handler);
    return undefined;
  };


// ==== ajax方法 ====

let ajaxLoading = 0;
export const ajax = ({
  data,
  url,
  loading = ' ',
  type = 'POST',
  timeout = '60000',
  success = noop,
  error = noop
}) => {
  if (loading) {
    ajaxLoading += 1;
    openLoading(loading);
  }
  let restUrl = url;
  // 钉钉环境cmp.seeyonbasepath/cmp.util.getSeeyonPath()返回的结果不带域名+端口
  if (isShell) {
    // m3中必须用全路径发送ajax请求
    // restUrl =
    // url.indexOf(cmp.serverIp) > -1 ? url : `${cmp.seeyonbasepath}/${url}`;
    restUrl = url.indexOf('/seeyon') > 0 ? url : `${cmp.seeyonbasepath}/${url}`;
  } else {
    // 微协同
    restUrl =
      url.indexOf(cmp.seeyonbasepath) > -1
        ? url
        : `${cmp.seeyonbasepath}/${url}`;
  }
  cmp.ajax({
    type,
    data: JSON.stringify(data),
    url: restUrl,
    timeout,
    dataType: 'json',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept-Language': cmp.language,
      thirdSessionId: encodeURIComponent(
        window.localStorage.getItem('thirdSessionId') || ''
      ),
      mpToken: encodeURIComponent(window.localStorage.getItem('mpToken') || ''),
      token: cmp.token || ''
    },
    success: (...args) => {
      if (loading) {
        ajaxLoading -= 1;
        closeLoading();
      }
      success(...args);
    },
    error: (...args) => {
      if (loading) {
        ajaxLoading -= 1;
        closeLoading();
      }
      error(...args);
    }
  });
};

// >>> CMP组件调用二次封装 <<<

/**
 * @description 日期/事件选择器
 */
export const datePicker = ({ type, value }, callback) => {
  if (type === 'date') {
    type = 'dateCalender';
  } else {
    type = 'dateTimeCalender';
  }
  cmp.DtPickerCalender({
    type,
    value,
    group: false,
    callback: (result) => {
      callback(null, result.value);
    }
  });
};

/**
 * @description 组织控件
 */
export const organizePicker = (
  { id, selected, excluded, orgType, maxSize, compCode, appParams },
  callback = noop,
  abortback = noop
) => {
  //如果注册了选人事件，则由extends控制选人
  if (window.csdk && window.csdk.extends && window.csdk.extends.selectOrg) {
    return window.csdk.extends.selectOrg(
      { id, selected, excluded, orgType, maxSize },
      callback,
      abortback
    );
  }

  // 适配cap组织包含子部门
  let isShowCheckboxTree = false;
  let departmentList = ['account_department', 'department'];
  if (orgType && departmentList.includes(orgType)) {
    isShowCheckboxTree = true;
  }
  const orgParam = {
    type: 2,
    minSize: -1,
    maxSize,
    selectType: orgType,
    multitype: false,
    lightOptsChange: false,
    showBusinessOrganization: true,
    fillback: null,
    label: ['dept', 'org', 'post', 'team', 'extP', 'vjOrg'],
    fillBackData: selected,
    excludeData: excluded,
    // 自定义选人组件唯一标识
    compCode,
    // cap4适配自定义选人控件参数
    appParams,

    permission: true,
    lightMemberPermission: false,
    isNeedCheckLevelScope: false,

    vj: /department_vj/.test(orgType),
    callback: (result) => {
      cmp.selectOrgDestory(id);
      callback(null, JSON.parse(result).orgResult);
    },
    closeCallback: () => {
      cmp.selectOrgDestory(id);
      abortback();
    }
  };
  // 判断符合条件传入 isShowCheckboxTree 状态
  if (isShowCheckboxTree) {
    orgParam.isShowCheckboxTree = true;
  }

  if (orgType === "account_department") {
    // 多单位多部门不显示最近
    orgParam.notShowRecent = true;
  }
  cmp.selectOrg(id, orgParam);
};

// ==== 附件相关 ====

/**
 * @description 上传图片
 */
export const uploadImage = (
  { maxSize, count },
  beforeUpload = noop,
  callback = noop
) => {
  const opts = {
    compress: true,
    quality: 100,
    targetWidth: -1,
    targetHeight: -1,
    saveToPhotoAlbum: false,
    destinationType: 1,
    sourceType: 1,
    encodingType: 0,
    pictureNum: maxSize - count,
    beforeUpload,
    success: ({ files }) => {
      cmp.att.upload({
        url: `${ctxPath()}${FILE_URL}`,
        fileList: files,
        title: '',
        extData: '',
        isMultiple: true,
        success: (result) => {
          callback(null, { atts: result.atts });
        },
        error: (err) => callback(err)
      });
    }
  };
  cmp.dialog.actionSheet(
    [
      {
        name: cmp.i18n('cap.form.photograph'),
        inputType: 'photo',
        actionCMPApi: 'cmp.camera.getPictures',
        config: { ...opts, sourceType: 1 }
      },
      {
        name: cmp.i18n('cap.form.localImages'),
        inputType: 'picture',
        actionCMPApi: 'cmp.camera.getPictures',
        config: { ...opts, sourceType: 2 }
      }
    ],
    cmp.i18n('cap.form.cancel'),
    noop,
    noop
  );
};

/**
 * @description 浏览图片
 * @param {Object} param
 */
export const browseImage = ({ images, index = 0 }) => {
  // OA-216908: 直接显示原图
  images = images.map((i) => {
    const url = i.replace('&showType=small', '');
    return { small: url, big: url };
  });
  cmp.imageViewer(images, index, { from: cmp.i18n('cap.form.bizApp') });
};

/**
 * @description 上传附件
 */
export const uploadAttachment = (
  { maxFileSize = 5 * 1024 * 1024, maxNumber = 9 },
  beforeUpload = noop,
  callback = noop
) => {
  let opts = {};
  if (maxFileSize == '') {
    opts = {
      pictureNum: maxNumber,
      initDocData: null,
      // maxFileSize, // 放开限制,cmp统一控制
      /* 2018-12-5 BUG #OA-162344 移动端调用表单，附件控件中上传附件后，点击【X】无法删除，切换轻/原表单或保存后就能删除了。
      后台7.0SP3修改了逻辑，需要附件的id，此处加入firstSave参数，是为了让后台接口在上传附件的时候返回id*/
      extData: { firstSave: true },
      beforeUpload,
      success: (result) => {
        callback(null, { atts: result.atts });
      },
      error: (err) => callback(err),
      cancel: noop
    };
  } else {
    opts = {
      pictureNum: maxNumber,
      initDocData: null,
      maxFileSize, // 放开限制,cmp统一控制
      /* 2018-12-5 BUG #OA-162344 移动端调用表单，附件控件中上传附件后，点击【X】无法删除，切换轻/原表单或保存后就能删除了。
    后台7.0SP3修改了逻辑，需要附件的id，此处加入firstSave参数，是为了让后台接口在上传附件的时候返回id*/
      extData: { firstSave: true },
      beforeUpload,
      success: (result) => {
        callback(null, { atts: result.atts });
      },
      error: (err) => callback(err),
      cancel: noop
    };
  }
  const items = [
    {
      name: cmp.i18n('cap.form.photograph'),
      inputType: 'photo',
      actionCMPApi: 'cmp.att.suite',
      config: {
        sourceType: 3, //8.2版本需求，上传附件情况下的拍照，需要同时能拍视频
        ...opts
      }
    },
    {
      name: cmp.i18n('cap.form.voice'),
      inputType: 'voice',
      actionCMPApi: 'cmp.att.suite',
      config: { ...opts }
    },
    {
      name: cmp.i18n('cap.form.localFiles'),
      inputType: 'localFile',
      actionCMPApi: 'cmp.att.suite',
      config: { ...opts, isMultiple: true }
    },
    {
      name: cmp.i18n('cap.form.localImages'),
      inputType: 'picture',
      actionCMPApi: 'cmp.att.suite',
      config: {
        sourceType: 4, //V8.2新增，相册模式，既可以选图片也可以选视频 --共建项，标准产品需要这样适配
        ...opts,
        isMultiple: true
      }
    }
  ];
  // 2018-5-31 在微协同不支持语音
  if (!(isShell || isHarmony)) {
    items.splice(1, 1);
  }
  cmp.dialog.actionSheet(items, cmp.i18n('cap.form.cancel'), noop, noop);
};

/**
 * @description 浏览附件
 * @param {Object} params
 */
export const browseAttachment = async (params) => {
  var att = params.att;
  var fileName = params.filename;
  var fileId = params.fileId;
  var lastModified = params.lastModified || params.createDate || params.createdate;
  var suffix = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
  var officeTransformEnable = params.officeTransformEnable === 'enable';
  var filePath = cmp.origin + '/rest/attachment/file/' + fileId;

  var sdkConfig = (OfficeSDK.utils.getWebOfficeConfig && await OfficeSDK.utils.getWebOfficeConfig()) || {};  //获取webofficeconfig
  var docType = OfficeSDK.utils.getDocType(att['extension']);
  console.log("dxxxxxxxxxxxxxxxx", docType);
  if (sdkConfig[docType] && sdkConfig[docType].EDIT != "NONE") {
    att.viewMode = "edit";
    att.canUseOfficeSdkEdit = true;
  }

  if (att.officeTransformEnable === 'enable' && sdkConfig[docType] && sdkConfig[docType].VIEW != "NONE") {
    att.viewMode = "view";
    att.canUseOfficeSdkVIEW = true;
  }

  let items = [];
  if (params.field.isFileDownload == '1') {
    items = [
      {
        key: 'save',
        name: cmp.i18n('cap.form.save')
      }
    ];
  }

  if (!isShell && cmp.os.ios) {
    items.pop();
  }

  if (isShell && cmp.os.ios) {
    items.unshift({
      key: 'thirdApp',
      name: cmp.i18n('cap.form.openWithThridApp')
    });
  }

  if (officeTransformEnable || cmp.att.canSee(suffix)) {
    items.unshift({
      key: 'see',
      name: cmp.i18n('cap.form.see')
    });
  }

  cmp.dialog.actionSheet(
    items,
    cmp.i18n('cap.form.cancel'),
    function (item) {
      var fileId = att.fileUrl, fileName = att.filename;
      var lastModified = att.lastModified || att.createDate || att.createdate;
      var filePath = cmp.origin + "/rest/attachment/file/" + fileId;
      filePath = encodeURI(encodeURI(filePath));
      if (item.key == 'see') {
        //客开wzl,gjx 调整查看方式
        var paramData={"fileId":att.fileUrl,"createDate":att.createdate,"fileName":att.filename,"state":"view"};
        SeeyonApi.Rest.post('euFileZ/fileZInit', {}, paramData, {
          success:function(result){
            if(result && result.url){
              var fileZUrl="/seeyon/euFileZ.do?method=fileZsdkView&fileZurl="+encodeURIComponent(result.url);
              cmp.href.open(fileZUrl);
            }else{
              alert("fileZ请求异常");
            }
          },error : function(err){
            alert("fileZ异常");
          }
        });
        return;
        //客开e
        var officeTransformEnable = att.officeTransformEnable;//支持在线预览
        var bodyType = window.attachmentWeboffice.BODY_TYPES[att['extension']] || att['extension'];
        var imgType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tiff', 'tif', 'jfif', 'pjpeg', 'pjp'];
        if ((att.canUseOfficeSdkEdit || att.canUseOfficeSdkVIEW) && !imgType.includes(bodyType)) { // 永中pdf走其他查看
          var option = {
            "bodyType": bodyType,
            "content": fileId,
            "lastModified": lastModified,
            "moduleType": att.category,
            "allowTrans": false,
            "fileName": att.filename,
            "ext": {
              "reference": att.reference
            },
            "viewMode": att.viewMode,
          };
          window.attachmentWeboffice.openWithWebOffice(option);
        }
        else {
          // 这个下面保留原始逻辑
          _readFileLocal(
            fileId,
            filePath,
            fileName,
            lastModified,
            att
          );
        }
      } else if (item.key === 'thirdApp') {
        cmp.att.openByThirdApp({
          path: filePath,
          filename: fileName,
          extData: { fileId, lastModified },
          success: noop,
          fail: () => {
            cmp.notification.alert(
              cmp.i18n('cap.form.operationFailure'),
              noop,
              cmp.i18n('cap.form.hint'),
              cmp.i18n('cap.form.confirm')
            );
          }
        });
      } else if (item.key == 'save') {
        cmp.dialog.loading();
        cmp.att.download({
          url: filePath,
          title: fileName,
          from: cmp.i18n('cap.form.bizApp'),
          extData: {
            lastModified: lastModified,
            fileId: fileId,
            origin: cmp.origin
          },
          progress: function () {
            cmp.dialog.loading(false);
          },
          success: function () {
            var msg = '';
            if (/jpg|jpeg|bmp|png/gi.test(suffix)) {
              // 图片
              msg = cmp.i18n('cap.form.viewImagesOffline');
            } else {
              msg = cmp.i18n('cap.form.viewFilesOffline');
            }
            cmp.notification.alert(
              msg,
              function () {
                cmp.dialog.loading(false);
              },
              cmp.i18n('cap.form.hint'),
              cmp.i18n('cap.form.confirm')
            );
          },
          error: function (e) {
            cmp.notification.alert(
              cmp.i18n('cap.form.fileNotExist'),
              function () {
                cmp.dialog.loading(false);
              },
              cmp.i18n('cap.form.hint'),
              cmp.i18n('cap.form.confirm')
            );
          }
        });
      }
    },
    function () {
      // 点击取消
    }
  );
};

/*直接从小强的SeeyonAttachment.s3js中复制来*/
function _playFile(id, filePath, fileName, lastModified) {
  cmp.dialog.loading(cmp.i18n('cap.form.fileDownloading'));
  cmp.att.download({
    url: filePath,
    title: fileName,
    from: cmp.i18n('cap.form.bizApp'),
    extData: {
      lastModified: lastModified,
      fileId: id,
      origin: cmp.origin
    },
    progress: function (result) { },
    success: function (result) {
      var localPath = result['target'];
      localPath = 'file://' + localPath;
      cmp.dialog.loading(false);
      cmp.audio.play({
        filepath: localPath,
        filename: fileName
      });
    },
    error: function (e) {
      cmp.notification.alert(
        e,
        function () {
          cmp.dialog.loading(false);
        },
        cmp.i18n('cap.form.hint'),
        cmp.i18n('cap.form.confirm')
      );
    }
  });
}

function _readFileOnline(id, fileName, lastModified, attachment) {
  cmp.att.readOnline({
    fileUrl: id, // 文件fileUrl，必填
    filename: fileName, // 必填
    createDate: lastModified, // 必填
    lastModifyDate: lastModified, // 必填，文件最后修改时间，用于缓冲管理
    v: attachment.v,
    success: noop,
    error: function () {
      toast(cmp.i18n('cmp.form.fileNotExist'));
    }
  });
}

function _readFileLocal(id, filePath, fileName, lastModified, attachment) {
  cmp.dialog.loading();
  cmp.att.read({
    path: filePath,
    filename: fileName,
    attachment: attachment,
    v: attachment.v,
    from: cmp.i18n('cap.form.bizApp'),
    extData: {
      fileId: id,
      lastModified: lastModified,
      origin: cmp.origin
    },
    success: function (result) {
      cmp.dialog.loading(false);
    },
    error: function (e) {
      cmp.dialog.loading(false);
      cmp.notification.alert(
        cmp.i18n('cap.form.fileNotExist'),
        function () {
          cmp.dialog.loading(false);
        },
        cmp.i18n('cap.form.hint'),
        cmp.i18n('cap.form.confirm')
      );
    }
  });
}

export const downloadAttachment = (params) => {
  var fileName = params.filename;
  var fileId = params.fileId;
  var lastModified =
    params.lastModified || params.createDate || params.createdate;
  var suffix = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
  let filePath = cmp.origin + '/rest/attachment/file/' + fileId;
  cmp.dialog.loading();
  filePath = encodeURI(encodeURI(filePath));
  cmp.att.download({
    url: filePath,
    title: fileName,
    from: cmp.i18n('cap.form.bizApp'),
    extData: {
      lastModified: lastModified,
      fileId: fileId,
      origin: cmp.origin
    },
    progress: function () {
      cmp.dialog.loading(false);
    },
    success: function () {
      var msg = '';
      if (/jpg|jpeg|bmp|png/gi.test(suffix)) {
        // 图片
        msg = cmp.i18n('cap.form.viewImagesOffline');
      } else {
        msg = cmp.i18n('cap.form.viewFilesOffline');
      }
      cmp.notification.alert(
        msg,
        function () {
          cmp.dialog.loading(false);
        },
        cmp.i18n('cap.form.hint'),
        cmp.i18n('cap.form.confirm')
      );
    },
    error: function (e) {
      cmp.notification.alert(
        cmp.i18n('cap.form.fileNotExist'),
        function () {
          cmp.dialog.loading(false);
        },
        cmp.i18n('cap.form.hint'),
        cmp.i18n('cap.form.confirm')
      );
    }
  });
};

// ==== LBS相关 ====

/**
 * @description 获取定位
 */
export const getLocation = (param, callback = noop) => {
  cmp.lbs.getLocationInfo({
    success: (result) => {
      ajax({
        data: result,
        url: `${ctxPath()}/rest/cmplbs/save`,
        success: (data) =>
          callback(null, {
            id: data.value,
            summary: result
          }),
        error: (err) => callback(err)
      });
    },
    error: (err) => callback(err)
  });
};

/**
 * @description 查看定位
 */
export const showLocation = ({ loc }, callback = noop) => {
  cmp.lbs.showLocationInfo({
    lbsUrl: `${ctxPath()}/rest/cmplbs/${loc}`,
    success: (result) => callback(null, result)
  });
};

/**
 * @description 地图标注
 */
export const markLocation = (param, callback = noop) => {
  cmp.lbs.markLocation({
    success: (result) => {
      ajax({
        data: result,
        url: `${ctxPath()}/rest/cmplbs/save`,
        success: (data) =>
          callback(null, {
            id: data.value,
            summary: result
          }),
        error: (err) => callback(err)
      });
    },
    error: (err) => callback(err)
  });
};

/**
 * @description 拍照定位
 */
export const photoLocation = (param, beforeUpload = noop, callback = noop) => {
  const basePath = ctxPath();
  cmp.lbs.takePicture({
    userName: cmp.member.name,
    uploadPicUrl: `${basePath}${FILE_URL}`,
    serverDateUrl: `${basePath}/rest/cmplbs/servertime`,
    location: '',
    success: (result) => {
      beforeUpload();
      ajax({
        type: 'POST',
        data: result,
        url: `${basePath}/rest/cmplbs/save`,
        success: (data) => {
          if (data.success && data.value) {
            callback(null, {
              id: data.value,
              summary: result
            });
          } else {
            callback({ message: cmp.i18n('cap.form.failedToSaveLoc') });
          }
        },
        error: (err) => callback(err)
      });
    },
    error: (err) => callback(err),
    cancel: noop
  });
};

// ==== 关联文档 ====

/**
 * @description 关联文档
 */
export const accdocPicker = (
  { id, selected },
  callback = noop,
  abortback = noop
) => {
  return cmp.accDoc(id, {
    _penetration: true,
    fillbackData: selected,
    callback: (result) => {
      try {
        // 神奇的数据格式
        const items = JSON.parse(result).map((i) => JSON.parse(i));
        callback(null, items);
      } catch (err) {
        callback(err);
      }
    },
    closeCallback: abortback
  });
};

/**
 * @description 查看关联文档
 */
export const browseAccDoc = (docResourceId, loadParam, att) => {
  // 照搬协同穿透的代码，3次请求，很坑的逻辑，据协同说，他也是照搬前作者的
  const basePath = ctxPath();
  const notSupport = () => toast(cmp.i18n('cap.form.notSupportView'));
  ajax({
    type: 'GET',
    url: `${basePath}/rest/doc/${docResourceId}?option.n_a_s=1`,
    success: (ret1) => {
      let { frType, pigeonholeType, sourceId } = ret1 || {};
      if (typeof frType === 'undefined') {
        return notSupport();
      }

      // 不清楚为什么entranceType是8，之前写死的逻辑
      ajax({
        type: 'GET',
        url: `${basePath}/rest/doc/canOppen?drId=${docResourceId}&frType=${frType}&entranceType=8&option.n_a_s=1`,
        success: (ret2) => {
          if (ret2 == '1') {
            return notSupport();
          } else {
            if (frType == '51') {
              //映射文件
              ajax({
                type: 'GET',
                url: `${basePath}/rest/doc/docView?drId=${docResourceId}&option.n_a_s=1`,
                success: (ret3) => {
                  sourceId = ret3.sourceId;
                  docResourceId = ret3.id;
                  frType = ret3.frType;
                  openDoc(
                    sourceId,
                    docResourceId,
                    frType,
                    pigeonholeType,
                    loadParam,
                    att
                  );
                },
                error: notSupport
              });
            } else {
              openDoc(
                sourceId,
                docResourceId,
                frType,
                pigeonholeType,
                loadParam,
                att
              );
            }
          }
        },
        error: notSupport
      });
    },
    error: notSupport
  });
};

function openDoc(
  sourceId,
  docResourceId,
  frType,
  pigeonholeType,
  loadParam,
  att
) {
  var tempDoc = loadParam.document || document;
  var att = att || {};
  var url;

  if (frType == 1 || frType == 9) {
    // 协同、表单
    var paramData = {
      openFrom: 'docLib',
      affairId: sourceId,
      pigeonholeType: pigeonholeType || '',
      docResId: docResourceId,
      baseApp: att.category || '',
      baseObjectId: att.reference || ''
    };

    url = `${URLS.collaboration}/html/details/summary.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 2) {
    // 公文
    var paramData = {
      listType: 'glwd',
      openFrom: 'docLib',
      summaryId: sourceId,
      docResId: docResourceId,
      baseApp: att.category || '',
      baseObjectId: att.reference || ''
    };

    url = `${URLS.edoc}/html/edocSummary.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 4) {
    // 会议
    var paramData = {
      listType: 'glwd',
      openFrom: 'docLib',
      meetingId: sourceId,
      docResId: docResourceId,
      baseApp: att.category || '',
      baseObjectId: att.reference || ''
    };

    url = `${URLS.meeting}/html/meetingDetail.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 5) {
    // 新闻
    var paramData = {
      comeFrom: 1,
      newsId: sourceId,
      pageInfo: loadParam.pageInfo
    };

    url = `${URLS.news}/html/newsView.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 6) {
    // 公告
    var paramData = {
      comeFrom: 1,
      bulId: sourceId,
      pageInfo: loadParam.pageInfo
    };

    url = `${URLS.bulletin}/html/bulView.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 7) {
    // 调查
    var paramData = {
      comeFrom: 1,
      inquiryId: sourceId,
      pageInfo: loadParam.pageInfo
    };

    url = `${URLS.inquiry}/html/inquiryView.html`;
    openWebView(url, paramData, 'all');
  } else if (frType == 8) {
    // 讨论
    var paramData = {
      from: 'pigeonhole',
      bbsId: sourceId,
      pageInfo: loadParam.pageInfo
    };

    url = `${URLS.bbs}/html/bbsView.html`;
    openWebView(url, paramData, 'all');
  } else if (
    (frType >= 101 && frType <= 122) ||
    (frType >= 21 && frType <= 26)
  ) {
    var paramData = {
      drId: docResourceId,
      pageInfo: loadParam.pageInfo,
      baseObjectId: att.reference || '',
      baseApp: att.category || '',
      glwd: true
    };

    url = `${URLS.doc}/html/docView.html`;
    openWebView(url, paramData, 'all');
  } else {
    toast(cmp.i18n('cap.form.notSupportView'));
  }
}

// ==== 二维码 ====

/**
 * @description 扫描二维码
 */
export const scanQRCode = (callback) => {
  // m3、钉钉可扫码
  if (!isShell && !isDD && !isWxWork && !isLark && !isHarmony) {
    return toast(cmp.i18n('cap.form.wechatNotSupportScanQRcode'));
  }
  if (isShell || isHarmony) {
    cmp.barcode.scan({
      success: function (result) {
        //result:为扫描到的二维码字符串
        callback(null, result);
      },
      error: function (err) {
        //TODO 18005是取消的状态，先屏蔽，后续让M3开发修改
        console.log(err);
        if (String(err.code) !== '18005') {
          callback({ message: cmp.i18n('cap.form.qrcodeScanError') });
        }
      }
    });
  } else {
    var scanChannel = 1;
    if (isDD) {
      scanChannel = 4;
    }
    if (isWxWork) {
      scanChannel = 3;
    }
    if (isLark) {
      scanChannel = 5;
    }
    cmp.api.scanQRCode({
      type: "all",
      needResult: 1,
      scanType: ["qrCode", "barCode"],
      success: function (result) {
        callback(null, result, scanChannel);
      },
      error: function (res) {
        callback({ message: cmp.i18n('cap.form.qrcodeScanError') });
        console.log(res)
      }
    });
  }

};

// ==== 缩放 =====

/**
 * @description 缩放
 */
export const zoom = (el, options) => {
  return new IScroll(el, options);
};

/**
 * @description 原生头部
 */
export const header = (show) => {
  if (show) {
    cmp.api.showNativeHeader();
  } else {
    cmp.api.hiddenNativeHeader();
  }
};

/**
 * @description 屏幕方向
 */
export const orientation = (orient, callback = noop) => {
  if (typeof orient === 'undefined') {
    return cmp.device.orientation();
  }
  const nameDict = {
    landscape: cmp.i18n('cap.form.landscape'),
    portrait: cmp.i18n('cap.form.portrait'),
    auto: ''
  };
  const dirDict = { landscape: 0, portrait: 1, auto: 'auto' };
  cmp.api.setOrientation(
    dirDict[orient],
    () => callback(),
    () =>
      callback({
        message: cmp.i18n('cap.form.failedToTurnOrient', [nameDict[orient]])
      })
  );
};

export const tapFullScreen = (callback = noop) => {
  return cmp.screen.fullScreenChangeListener(callback);
};

export const enterFullScreen = () => {
  return cmp.screen.setFullScreen(1);
};

export const cancelFullScreen = () => {
  return cmp.screen.setFullScreen(0);
};

export const i18n = (...args) => {
  return cmp.i18n(...args) || args[0];
};

export const touchButton = ({
  loc = 'header',
  index = 0,
  items = [],
  callback = noop
}) => {
  if ((loc = 'header')) {
    cmp.header.insertRightBtn({ index, items, callback });
  }
};

export const print = ({
  path,
  fileType = 'pdf',
  lastModified,
  callback = noop
}) => {
  lastModified = lastModified || Date.now();
  cmp.api.print({
    path,
    fileType,
    lastModify: lastModified,
    success: () => callback(null),
    fail: (err) => callback(err)
  });
};

export const getCacheFormKey = () => {
  let _currentUser = cmp.member;
  let cacheFormKey = null;
  let { moduleId, moduleType, formTemplateId, operateType, rightId, btnId, affairId } = window.$cap_global.payload.params;

  if (moduleType === '42') {
    // 无流程
    if (operateType === '0') {
      // 新建
      let ids = [_currentUser.id, moduleId, formTemplateId];
      let idstr = ids.reduce((a, b) => {
        if (b) {
          return `${a}_${b}`;
        }
        return a;
      });
      cacheFormKey = `mb-unflow-cap4_${idstr}`;
    } else {
      let ids = [_currentUser.id, moduleId, formTemplateId, rightId, btnId];
      let idstr = ids.reduce((a, b) => {
        if (b) {
          return `${a}_${b}`;
        }
        return a;
      });
      cacheFormKey = `mb-unflow-cap4_${idstr}`;
    }
  } else {
    if (operateType === '0') {
      // 新建
      cacheFormKey = `mb-flow-cap4_${_currentUser.id}_${moduleId}`;
    } else {
      // 流程中
      cacheFormKey = `mb-flow-cap4_${_currentUser.id}_${moduleId}_${affairId}`;
    }
  }

  return cacheFormKey;
};


// 检测请求url 是否需要缓存一条空对象数据用来标识当前有缓存
// 缓存一条空对象数据,用来标识当前表单有缓存
export const saveNullCacheForm = (params = {}) => {
  let dataOfflineCaching = window?.ctpEnv?.dataOfflineCaching;
  if (!dataOfflineCaching) {
    return;
  }
  const { url } = params;
  // 附件form/addOrDelAttachment
  const cacheUrlList = [
    'form/calculate', // 计算
    'form/saveOrUpdate', // 保存
    'form/addOrDelDataSubBean',
    'form/dealSelectedRelationData',
    'form/refreshSubData',
    'form/copyFormData',
    'form/cleanRelationData',
    'form/detail/pageData'
  ];

  // 没有数据新增的接口
  const noDataCacheUrlList = [
    'form/saveOrUpdate',
    'form/detail/pageData'
  ]
  let reg = cacheUrlList.some((item) => {
    return url.endsWith(item);
  });

  let noDataReg = noDataCacheUrlList.some((item) => {
    return url.endsWith(item);
  });
  if (!window.$cap_global.cacheStoreData && noDataReg) {
    return;
  }

  if (!reg) {
    return;
  }
  let cacheStore = window.SY.base.cache;
  let key = getCacheFormKey();
  window.$cap_global.cacheStoreData = null;
  return cacheStore.setItem(key, {
    mergeData: {},
    cacheRecoveryId: window.$cap_global.cacheRecoveryId
  });
};

export const clearCacheForm = (params) => {
  let cacheStore = window.SY.base.cache;
  let key = getCacheFormKey();
  window.$cap_global.cacheStoreData = null;
  return cacheStore.removeItem(key);
};


// 成功发送表单后禁止缓存数据
export const successSaveForm = (params) => {
  window.$cap_global.isSuccessSaveForm = true;
  window.$cap_global.cacheStoreData = null;
  // 重新生成id
  window.$cap_global.cacheRecoveryId = generateNumberUUID();

  return clearCacheForm();
};

// 表单缓存弹框
export const getCacheFormModal = (params = {}) => {
  let key = getCacheFormKey();
  const { option, callback } = params;
  let dataOfflineCaching = window?.ctpEnv?.dataOfflineCaching;
  if (!dataOfflineCaching) {
    // 关闭开关的情况下不读取缓存
    callback && callback();
    return;
  }
  if (option?.isCache) {
    callback && callback();
    return;
  }

  if (option.moduleType === '42' && option.operateType === '2') {
    // 无流程浏览情况下不读取缓存
    callback && callback();
    return;
  }

  const cacheStore = window.SY.base.cache;

  cacheStore.getItem(key).then(async (response = {}) => {
    let { value: res } = response;
    // 是否存在协同缓存
    let hasColCache = false;
    if (option.operateType === '2') {
      // 浏览情况下，表单不读取缓存，值为空
      res = null;
    }
    if (option.moduleType !== '42') {
      let callbackResolve = null;
      let callbackPromise = new Promise((resolve, reject) => {
        callbackResolve = resolve;
      })
      let callback = (val) => {
        callbackResolve(val);
      }

      if (window?.collaborationApi?.getHasCacheData) {
        window.collaborationApi.getHasCacheData(callback);
        hasColCache = await callbackPromise;
      }

      callbackPromise = null;
    }
    let i18n = cmp.i18n;
    let msgText = '';
    if (option.moduleType === '42') {
      if (option.operateType !== '0') {
        msgText = i18n('cap.form.cache.unflow.msg.edit', '');
      } else {
        msgText = i18n('cap.form.cache.unflow.msg.create', '');
      }
    } else {
      let templateName = '';

      cmp.event.trigger("getTemplateInfo", document, {
        callback: (val) => {
          templateName = val?.subject;
        }
      });
      if (templateName) {
        templateName = `"${templateName}"`
      }
      if (option.operateType !== '0') {
        msgText = i18n('cap.form.cache.col.msg.edit', templateName);
      } else {
        msgText = i18n('cap.form.cache.col.msg.create', templateName);
      }
    }

    window.$cap_global.cacheRecoveryId = res?.cacheRecoveryId || generateNumberUUID();
    if (res || hasColCache) {
      confirm({
        text: msgText,
        buttons: [i18n('cap.form.cache.nomsg'), i18n('cap.form.cache.msg')],
        callback: index => {
          if (index === 1) {
            if (res) {
              cacheStore.setItem(key, {
                mergeData: {},
                cacheRecoveryId: window.$cap_global.cacheRecoveryId
              });
              window.$cap_global.cacheStoreData = {};
            }

            if (option.moduleType !== '42') {
              cmp.event.trigger("restoreCacheData", document);
            }

            callback && callback({
              ...res,
              cacheRecoveryId: window.$cap_global.cacheRecoveryId
            });
          } else {
            cacheStore.removeItem(key);
            window.$cap_global.cacheRecoveryId = generateNumberUUID();
            if (option.moduleType !== '42') {
              cmp.event.trigger("cancelRestoreCacheData", document);
            }
            callback && callback({
              cacheRecoveryId: window.$cap_global.cacheRecoveryId
            });
          }
        }
      });
    } else {
      callback && callback({
        cacheRecoveryId: window.$cap_global.cacheRecoveryId
      });
    }
  });
};

// 生成uuid
export function generateNumberUUID(length = 19) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
