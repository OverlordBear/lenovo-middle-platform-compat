var _contentType = '';
var officeSDK = null;

//测试
/**
 *
 * 正文组件
 *
 * 组件依赖 IScroll 5.2.0
 *
 *
 * API
 *
 * SeeyonContent.init(config) 初始化正文
 * SeeyonContent.getBodyCode(type) 通过正文类型获取正文code，例如传入HTML返回10
 * SeeyonContent.getBodyType(code) 通过正文code获取正文类型，例如传入10返回HTML
 * SeeyonContent.refresh(targetId) 如果初始化时外层容器宽度为0的时候， 正文组件不会进行宽高设置
 * SeeyonContent.clearCache() 清楚页面里所有正文组件的缓存
 * SeeyonContent.print(targetId, params, fn, scope) 打印正文,targetId正文容器标识，params参数，fn回调函数，scope回调函数所在域
 * SeeyonContent.getPrintParam(targetId, params, fn, scope) 获取打印参数，params参数，fn回调函数，scope回调函数所在域
 *
 *
 * @author xuqw
 *
 */
var SeeyonContent = (function ($) {
	var isInArray = function(array, value) {
		var ret = false;
		if (array && array.length > 0) {
			for (var i = 0; i < array.length; i++) {
				if (value == array[i]) {
					ret = true;
					break;
				}
			}
		}
		return ret;
	}
	/**
	 * 继承
	 */
	var extend = function (child, parent) {
			for (var key in parent) {
				if (hasProp.call(parent, key)) child[key] = parent[key];
			}
			function ctor() {
				this.constructor = child;
			}
			ctor.prototype = parent.prototype;
			child.prototype = new ctor();
			child.__super__ = parent.prototype;
			return child;
		},
		hasProp = {}.hasOwnProperty,
		deviceDPI = [96, 96];

	function _getDPI() {
		if (deviceDPI == null) {
			deviceDPI = new Array();
			if (window.screen.deviceXDPI) {
				deviceDPI[0] = window.screen.deviceXDPI;
				deviceDPI[1] = window.screen.deviceYDPI;
			} else {
				var tmpNode = document.createElement('DIV');
				tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
				document.body.appendChild(tmpNode);
				deviceDPI[0] = parseInt(tmpNode.offsetWidth);
				deviceDPI[1] = parseInt(tmpNode.offsetHeight);
				tmpNode.parentNode.removeChild(tmpNode);
			}
		}
		return deviceDPI;
	}

	function pt2px(ptValue) {
		//pt = px * dpi / 72
		var dpi = _getDPI();
		return (ptValue * dpi[0]) / 72;
	}

	function getEleTextIndent(ele) {
		var textIndent = 0,
			ti,
			reg = /(-?\d+)(pt|px)/i;
		if (ele && ele.tagName.toLowerCase() !== 'body') {
			ti = ele.style.textIndent;
			if (ti && (r = ti.replace(/(\d+)\.\d+([a-zA-Z]+)/, '$1$2').match(reg))) {//小数点后数值大小显示在页面并无差异，做整数化
				textIndent = parseInt(r[1], 10);
				if (textIndent < 0) {
					ele.style.textIndent = '0px';
					textIndent = 0;
				} else {
					var u = (r[2] || '').toLowerCase();
					if (u == 'pt') {
						textIndent = pt2px(textIndent);
					}
				}
			} else {
				textIndent += getEleTextIndent(ele.parentNode);
			}
		}
		return textIndent;
	}

	function _getRuntimeStyle(obj, k) {
		var v = null;
		if (obj.currentStyle) {
			v = obj.currentStyle[k];
		} else {
			v = window.getComputedStyle(obj, null).getPropertyValue(k);
		}
		return v;
	}

	function _print(url, fileType, fn, scope) {
		cmp.api.print({
			path: url,
			fileType: fileType,
			success: function () {
				if (fn) {
					fn.call(scope || this);
				}
			},
			fail: function () {
				if (fn) {
					fn.call(scope || this);
				}
			},
		});
	}

	var App = (function () {
		function App() {
			this.config = {
				target: null, //目标容器
				bodyType: '', //正文类型，MainbodyType
				// HTML(10),FORM(20),TXT(30),OfficeWord(41),OfficeExcel(42),
				// WpsWord(43), WpsExcel(44),Pdf(45);
				subfix: '', //后缀名
				lastModified: '', //最后更新时间
				title: '', //名称
				padding: '10', //自定义边距
				content: '', //正文内容/Office正文ID/表单ID
				moduleType: '1', //模块，1 - 协同

				canDownLoad: true, // M3 IOS 端是否支持正文下载, 产品经理强烈要求加的，只支持IOS M3端，其他端无效果
				useZoom: true, //是否使用缩放组件
				zoomType: 'iscroll', //缩放模式, 使用iscroll缩放, zoom使用zoom缩放
				momentum: false, //是否使用惯性滑动
				zoomMin: 1, //最小缩放比例
				zoomMax: 5, //最大缩放比例
				ext: {}, //扩展参数，如表单有权限ID等等
				ext2: '', //公告打印标志
				state: '', //新闻状态，暂用来判断是否显示打印（已发布的就显示）
				onScrollAuto: false, //滚动到头和尾按照原生滚动
				appName: '', // 模块名字，用于M3附件显示模块名字

				onload: null, //加载完成后事件
				tapImg: null, //图片点击事件， 只用于HTML正文
				onScrollBottom: null, //{Function}滚动到底部
				onScrollTop: null, //{Function} 滚动到头的时候触发
				onScrollLeft: null, //{Function} 滚动到最左时触发
				onScrollRight: null, //{Function} 滚动到最右时触发
				onScroll: null, //{Function} function (top, directionY)滚动事件，   directionY : -1下拉， 1上拉, top 距离顶部的高度
				onScrollEnd: null, //滚动结束
				allowTrans: false, //是否允许转换
				isShowLoadViewBtn: true, //是否显示下载查看按钮
				defaultLoad: true, //默认加载方式，true：以office转换的方式加载，false：以点击的方式查看
				m3ShowOffice:true,
				ofdWpsWaterMark: "0",//wps中台，OFD预览显示水印(在之前的中台版本中OFD预览 水印存在bug,所以默认不带水印，由oa自己实现)
				isOldEdoc: false, // 用于老公文使用，不影响协同等其他模块
				viewMode: null, //打开正文方式，edit:编辑器  view:office转换 外层必须传递
				defaultFullScreen: false, //是否默认打开全屏
				fullScreenId:null, //查看全屏按钮容器
				canCopy: null, //允许Copy正文
			};

			//初始化的正文列表
			this.contents = {};

			//是否加载了国际化
			this.initI18N = false;
			//WPS的授权
			this.officeLicense = '';
		}

		App.prototype.WORD_BODY_TYPES = {
			10: 'HTML',
			20: 'form',
			30: 'txt',
			41: 'doc',
			42: 'xls',
			43: 'wps',
			44: 'et',
			45: 'pdf',
			46: 'ofd',
			47: 'ppt',
			90: 'third',
		};

		App.prototype.BODY_TYPES = {
			html: '10',
			form: '20',
			officeword: '41',
			doc: '41',
			docx: '41',
			officeexcel: '42',
			xlsx: '42',
			xls: '42',
			wpsword: '43',
			wps: '43',
			wpsexcel: '44',
			pdf: '45',
			ofd: '46',
			ppt: '47',
			third: '90',
		};

		/**
		 * 同类型的类型
		 */
		App.prototype.BODY_EQUAL_TYPES = {
			docx: 'doc',
			xlsx: 'xls',
			pptx: 'ppt',
		};

		/**
		 * 打开关联文档或下载附件
		 */
		App.prototype.openEditorAssociate = function (id, mimeType, description, reference, category, createDate, filename, v) {
			var obj = {};
			obj.id = id;
			if (id && id != 'undefined') {
				obj.fileUrl = id;
			}
			obj.mimeType = mimeType;
			obj.description = description;
			obj.reference = reference;
			obj.category = category;
			obj.createDate = createDate;
			obj.filename = filename;
			obj.v = v;

			// 适配正文附件预览参数extension
			var fileType = ''
			var index = filename && filename.length && filename.lastIndexOf(".") || -1
			if(index !== -1) {
				fileType = filename.substring(index + 1, filename.length);
				fileType && (obj.extension = fileType)
			}

			this.clickAtt(obj);
		};

		/**
		 * 点击附件事件
		 */
		App.prototype.clickAtt = function (att, from) {
			/*if(cmp.system.filePermission()){*/
			SeeyonAttachment.openRelatedDoc({ att: att, from: from || '' });
			/*}else{
              var attTypeMsg = cmp.i18n("commons.file.downloadOrView");
              switch (att.mimeType) {
                case "collaboration":
                case "edoc":
                case "meeting":
                case "km":
                    attTypeMsg = cmp.i18n("commons.file.current.view");
                    cmp.notification.toast(cmp.i18n("commons.client.notSupport") + attTypeMsg, 'top', 1000);
                    break;
                default:
                    SeeyonAttachment.openRelatedDoc({"att" : att});
                    break;
                }
          }*/
		};

		/**
		 * 合并配置信息
		 */
		App.prototype._mergeConfig = function (userConfig) {
			var newConfig = {};
			for (var key in this.config) {
				if (userConfig && userConfig.hasOwnProperty(key)) {
					newConfig[key] = userConfig[key];
				} else {
					newConfig[key] = this.config[key];
				}
			}
			return newConfig;
		};

		App.prototype.init = function (config) {
			/*config.allowTrans = false;
          config.title = "测试正文.docx";
          config.subfix = "doc";*/

			var content = this.instance(config['target']);
			if (content && content.config && config.content == content.config.content) {
				this.refresh(config['target'],config);
			} else {
				var newConfig = this._mergeConfig(config);

				newConfig.bodyType = newConfig.bodyType + '';

				switch (newConfig.bodyType) {
					case '10':
						content = new HTMLContent();
						break;
					case 'cap4-Forward':
						content = new FormContent();
						break;
					case '20':
						content = new FormContent();
						break;
					case '20-Forward':
						content = new ForwardFormContent();
						break;
					case '41':
					case '42':
					case '43':
					case '44':
					case '45':
						content = new OfficeContent();
						window._fileContent = content;
						break;
					case '90':
						content = new ThirdContent();
						break;
					case '99':
						content = new EdocContent();
						break;
					default:
						/*$.notification.alert("未适配正文类型" + newConfig.bodyType);
                    return null;*/
						content = new OfficeContent();
						window._fileContent = content;
						break;
				}
				content.init(newConfig, this);

				this.contents[newConfig['target']] = content;
			}
			return content;
		};

		/**
		 * 通过正文类型获取正文code
		 */
		App.prototype.getBodyCode = function (type) {
			return this.BODY_TYPES[type && type.toLowerCase()];
		};

		/**
		 * 通过正文code获取正文type
		 */
		App.prototype.getBodyType = function (code) {
			return this.WORD_BODY_TYPES[code];
		};

		/**
		 * 刷新正文组件
		 */
		App.prototype.refresh = function (targetId,config,needRefresh) {
			var _this = this;
			setTimeout(function () {
				_this.instance(targetId).refresh(false, needRefresh);
				config && (_this.instance(targetId).config = config);
			}, 10);
		};

		App.prototype.reLayout = function (targetId) {
			var _args, ins;
			_args = arguments;
			ins = this.instance(targetId);
			if (ins) {
				ins.reLayout.apply(ins, Array.prototype.slice.call(_args, 1));
			}
		};

		/**
		 * 获取正文实例
		 */
		App.prototype.instance = function (targetId) {
			return this.contents[targetId];
		};
		App.prototype.clearInstance = function (targetId) {
			this.contents[targetId] = null;
		};
		/**
		 * 打印
		 */
		App.prototype.print = function (targetId, params, fn, scope) {
			var ins = this.instance(targetId);
			if (ins) {
				ins.print(params, fn, scope);
			}
		};

		App.prototype.getPrintParam = function (targetId, params, fn, scope) {
			var ins = this.instance(targetId);
			if (ins) {
				return ins.getPrintParam(params, fn, scope);
			}
		};
		/**
		 * 清除缓存
		 */
		App.prototype.clearCache = function () {
			for (var key in this.contents) {
				this.contents[key].clearCache();
			}
		};

		return App;
	})();

	var Content = (function () {
		function Content() {
			this.config = null;
			this.app = null;
			this.outer = null; //外部容器

			this.pointSY = 0;
			this.pointY = 0;

			var dummyStyle = document.createElement('div').style,
				vendor = (function () {
					var vendors = 't,webkitT,MozT,msT,OT'.split(','),
						t,
						i = 0,
						l = vendors.length;

					for (; i < l; i++) {
						t = vendors[i] + 'ransform';
						if (t in dummyStyle) {
							return vendors[i].substr(0, vendors[i].length - 1);
						}
					}
					return false;
				})(),
				cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '';

			this.vendor = vendor;

			this.transform = this.prefixStyle('transform');
		}

		Content.prototype.prefixStyle = function (style) {
			if (this.vendor === '') return style;

			style = style.charAt(0).toUpperCase() + style.substr(1);
			return this.vendor + style;
		};

		/**
		 * 初始化
		 *
		 */
		Content.prototype.init = function (config, app) {
			//业务参数
			var target = config.target;
			this.outer = document.querySelector('#' + target);

			if (this.outer == null) {
				this.alert('cannot find document, id:' + target);
				return;
			}

			var _this = this;

			if (!app.initI18N) {
				//加载国际化
				cmp.i18n.load(__m3_v5_commons_path__ + '/i18n/', 'Commons', function () {
					app.initI18N = true;
					_this._init_(config, app);
				});
			} else {
				this._init_(config, app);
			}
		};

		Content.prototype._init_ = function (config, app) {
			if (!config.subfix || config.subfix == 'undefined') {
				config.subfix = app.getBodyType(config.bodyType);
			}
			//获取后缀名
			if (!config.subfix && config.title) {
				var index = config.title.lastIndexOf('.');
				if (index != -1) {
					var tempSubfix = config.title.substring(index + 1).toLowerCase();
					if (!config.subfix) {
						config.subfix = tempSubfix;
					} else if (app.BODY_EQUAL_TYPES[tempSubfix] == config.subfix.toLowerCase()) {
						config.subfix = tempSubfix;
					}
				}
			}

			App.prototype.BODY_EQUAL_TYPES = {
				docx: 'doc',
				xlsx: 'xls',
				pptx: 'ppt',
			};

			this.config = config;
			this.app = app;

			this.isDebug = false;

			//初始化正文
			this.initAttribute();
			this.initContent();
		};

		/**
		 * 初始化属性
		 */
		Content.prototype.initAttribute = function () {};

		/**
		 * 销毁
		 */
		Content.prototype.destroy = function (targetId) {};

		/**
		 * 刷新
		 */
		Content.prototype.refresh = function (isInit) {};

		/**
		 * 清除缓存
		 */
		Content.prototype.clearCache = function () {};

		/**
		 * 重新布局
		 */
		Content.prototype.reLayout = function () {};

		/**
		 * 打印
		 */
		Content.prototype.print = function (params, fn, scope) {
			this.alert($.i18n('commons.content.print.notSupport'));
			if (fn) {
				fn.call(scope || this);
			}
		};
		// 音视频 初始化
		Content.prototype.initMedia = function () {
			// var mediaDom = document.querySelectorAll('video.video-js');
			// var idArr=[];
			// for(var i=0,len= mediaDom.length;i<len;i++){

			// }
			try {
				var mediaID = document.querySelector('video.video-js').getAttribute('data-id');
				if (!mediaID && !window.videojs) {
					return;
				}
				var _this = this;
				SeeyonApi.Rest.get('media/info/' + mediaID, {}, '', {
					async: false,
					success: function (media) {
						var data = media.data;
						if (!data) {
							// 获取媒体信息失败
							_this.alert($.i18n('commons.media.info.fail'));
							return;
						}
						var playUrl = '';
						if (data.mediaType == 'audio') {
							// 音频
							playUrl = data.mp3PlayUrl;
						} else {
							// 视频
							playUrl = data.hlsPlayUrl;
						}
						var play = videojs('#video_' + mediaID, {
							controls: true,
							autoplay: false,
							preload: 'auto',
							loop: false,
							poster: data.posterUrl,
							sources: [
								{
									src: playUrl,
									type: data.mediaType == 'video' ? 'application/x-mpegURL' : 'audio/mpeg',
								},
							],
							nativeControlsForTouch: data.mediaType == 'video' ? true : false,
							controlBar: {
								volumePanel: {
									inline: false, //默认是true,横着的
								},
							},
						});
						play.handleTechDoubleClick_ = function () {};
					},
					error: function (e) {
						// 获取媒体信息失败
						_this.alert($.i18n('commons.media.info.fail'));
					},
				});
			} catch (e) {}
		};

		/**
		 * 触发事件
		 */
		Content.prototype.fire = function (event, data) {
			switch (event) {
				case 'load':
					//正文区域加载完成后事件
					if (this.config.onload) {
						this.config.onload.call(this, _contentType);
					}
					// this.initMedia();
					break;
				case 'scrollTop':
					if (this.config.onScrollTop) {
						this.config.onScrollTop.call(this);
					}
					break;
				case 'scrollBottom':
					if (this.config.onScrollBottom) {
						this.config.onScrollBottom.call(this);
					}
					break;
				case 'scrollLeft':
					if (this.config.onScrollLeft) {
						this.config.onScrollLeft.call(this);
					}
					break;
				case 'scrollRight':
					if (this.config.onScrollRight) {
						this.config.onScrollRight.call(this);
					}
					break;
				case 'scroll':
					//滚动事件
					if (this.config.onScroll) {
						var top = data.top, //影藏的区域的高度， 是一个负数
							directionY = data.directionY, //方向: -1:手指向下滑动/1:手指向上滑动
							scrollH = data.scrollH; //获取滚动区高度参数
						this.config.onScroll.call(this, -top, directionY, scrollH);
					}
					break;
				case 'scrollEnd':
					//滚动事件
					if (this.config.onScrollEnd) {
						var top = data.top, //影藏的区域的高度， 是一个负数
							directionY = data.directionY; //方向: -1:手指向下滑动/1:手指向上滑动
						this.config.onScrollEnd.call(this, -top, directionY);
					}
					break;
				default:
					break;
			}
		};

		/**
		 * 增加样式
		 */
		Content.prototype._addClass = function (el, className) {
			var eClass = el.classList;

			if (!eClass.contains(className)) {
				eClass.add(className);
			}
		};

		/**
		 * 原生滚动事件
		 */
		Content.prototype._scroll = function () {
			var outerHeight = this.outer.scrollHeight,
				clientHeight = this.outer.clientHeight,
				scrollTop = this.outer.scrollTop;

			if (this.isDebug) {
				console.log(outerHeight + '/' + clientHeight + '/' + scrollTop);
			}

			if (scrollTop == 0) {
				this.fire('scrollTop');
			} else if (scrollTop + clientHeight == outerHeight) {
				this.fire('scrollBottom');
			}
		};

		/**
		 * 触摸开始事件
		 */
		Content.prototype._touchstart = function (e) {
			this.pointY = e.touches[0].pageY;
			this.pointSY = this.pointY;
		};

		/**
		 * 触摸中间事件
		 */
		Content.prototype._touchmove = function (e) {
			var scrollTop = 0,
				directionY = 0,
				nowPointY = e.touches[0].pageY;

			scrollTop = this.outer.scrollTop;
			directionY = this.pointY - nowPointY;
			if (directionY != 0) {
				directionY = directionY / Math.abs(directionY);
			}

			this.pointY = nowPointY;

			this.fire('scroll', {
				top: -scrollTop,
				directionY: directionY,
			});
		};

		/**
		 * 触摸结束事件
		 */
		Content.prototype._touchend = function (e) {
			var scrollTop = 0,
				directionY = 0;

			scrollTop = this.outer.scrollTop;
			directionY = this.pointSY - this.pointY;
			if (directionY != 0) {
				directionY = directionY / Math.abs(directionY);
			}

			this.fire('scrollEnd', {
				top: -scrollTop,
				directionY: directionY,
			});

			if (this.pointY > this.pointSY) {
				if (this.outer.scrollHeight == this.outer.clientHeight) {
					this.fire('scrollTop');
				} else {
					//ios滚动条到底不后还可以再拖动
					if (scrollTop <= 0) {
						this.fire('scrollTop');
					}
				}
			} else if (this.pointY < this.pointSY) {
				//没有滚动条的情况
				if (this.outer.scrollHeight == this.outer.clientHeight) {
					this.fire('scrollBottom');
				} else {
					var outerHeight = this.outer.scrollHeight,
						clientHeight = this.outer.clientHeight,
						scrollTop = this.outer.scrollTop;
					//ios滚动条到底不后还可以再拖动
					if (scrollTop + clientHeight >= outerHeight) {
						this.fire('scrollBottom');
					}
				}
			}
		};

		/**
		 * 提示框
		 */
		Content.prototype.alert = function (msg, callback, title, btnName) {
			if (!title) {
				title = $.i18n('commons.label.note'); //提示
			}
			if (!btnName) {
				btnName = $.i18n('commons.label.ok'); //确定
			}
			$.notification.alert(msg, callback, title, btnName);
		};
		return Content;
	})();

	/**
	 * 表单正文
	 */
	var FormContent = (function (superClass) {
		extend(FormContent, superClass);

		function FormContent() {
			return FormContent.__super__.constructor.apply(this, arguments);
		}

		/**
		 * 初始化正文
		 */
		FormContent.prototype.initContent = function () {
			this.reachTop = true;
			this.reachBottom = false;
			this.reachLeft = true;
			this.reachRight = false;
			this.options = null; //表单配置信息
			this.hasListener = false;
			this.viewIndex = this.config.ext.indexParam || '0';
			this.isLoading = false;
			this.isSubmiting = false;
			this.lastTapTime = 0;

			//业务参数
			var _this = this;

			if (typeof this.config.ext.isLightForm === 'undefined') {
				//默认为轻表单
				this.config.ext.isLightForm = true;
			}

			/*this._addClass(this.outer, "content_ios_scroll"); */
			this.outer.addEventListener('tap', this);
			/*
             * 这个有问题，直接导致 表单字段不能聚焦
             * cmp.event.click(this.outer, function(e){
                var selfEv = {
                    "type" : "tap",
                    "target" : e.target
                }
                _this.handleEvent(selfEv);
            });*/

			this.loadForm(this.viewIndex, {
				callback: function (contentList) {
					if (_this.config.ext.showFormView && typeof _this.config.ext.showFormView == 'function') {
						_this.config.ext.showFormView(contentList);
					}
					//_this.fire("load");
				},
				loadCallback: function () {
					_this.fire('load');
				},
				isInit: true,
			});

			//重新渲染
			var _this = this;
			document.addEventListener('refreshWebView', function (e) {
				if ($.sui && $.sui.refreshWhenWebViewShow) {
					$.sui.refreshWhenWebViewShow(_this.options, function () {
						//console.log("refreshWebView - 刷新表单成功...");
					});
				}
			});
		};

		/**
		 * 清除缓存
		 */
		FormContent.prototype.clearCache = function () {
			if (this.options != null) {
				$.sui.clearCache(this.options);
			}
		};

		/**
		 * 重新布局
		 */
		FormContent.prototype.reLayout = function (height) {
			if (this.options != null && $.sui.refreshIScroll) {
				$.sui.refreshIScroll();
			}
		};

		/**
		 * 加载表单视图
		 */
		FormContent.prototype.loadForm = function (index, moreParam) {
			if (this.isLoading) {
				//console.log("暴击...");
				return;
			}
			this.isLoading = true;

			//开始转圈
			cmp.dialog.loading();

			moreParam = moreParam || {};

			var _this = this,
				callback = moreParam.callback,
				containerId = this.config.target,
				loadCallback = moreParam.loadCallback,
				isInit = moreParam.isInit;

			var isLightForm = _this.config.ext.isLightForm;
			if (typeof moreParam.isLightForm == 'boolean') {
				isLightForm = !!moreParam.isLightForm;
			}

			function _doLoadForm() {
				if (typeof index === 'string') {
					index = parseInt(index, 10);
				}

				_this.config.ext.isLightForm = isLightForm;
				var canScanCode=false
				if(typeof summaryBO !='undefined'&&!!summaryBO){
					canScanCode=summaryBO.canScanCode=== "1" && !(cmp.util.webkitType() === 'm3' || (cmp.platform.DDShell && pageX.cache.isCAP4))
				}
				if(!!pageX.cache.summary){
					canScanCode=pageX.cache.summary.canScanCode=== "1" && !(cmp.util.webkitType() === 'm3' || (cmp.platform.DDShell && pageX.cache.isCAP4))
				}
				//表单
				var options = {
					containerId: containerId, //渲染的div根节点id
					moduleId: _this.config.content,
					moduleType: _this.config.moduleType,
					rightId: _this.config.ext.rightId,
					viewState: _this.config.ext.viewState,
					allowQRScan: canScanCode,
					indexParam: _this.viewIndex,
					affairId: _this.config.ext.affairId || '-1',
					subState: _this.config.ext.subState,
					activeView: _this.config.ext.activeView,
					desktopView: _this.config.ext.desktopView,
					mobileView: _this.config.ext.mobileView,
					mappingDataKey: _this.config.ext.mappingDataKey || '',
					// cap 第三方扩展，cap接收的是sourceType/sourceId；但传递给协同的参数是capSourceType/capSourceId
					sourceType: _this.config.ext.capSourceType || '',
					sourceId: _this.config.ext.capSourceId || '',
					/*******************移动端收文登记适配*******************开始*****/
					distributeContentDataId: _this.config.ext.distributeContentDataId || '-1',
					distributeContentTemplateId: _this.config.ext.distributeContentTemplateId || '-1',
					distributeAffairId: _this.config.ext.distributeAffairId || '-1',
					signSummaryId: _this.config.ext.signSummaryId || '-1',
					formId: _this.config.ext.formId || '-1'
					/*******************移动端收文登记适配*******************结束*****/
				};
				/*******************移动端收文登记适配*******************开始*****/
				if(_this.config.moduleType == '4'){
					options.isNew = _this.config.ext.isNew || 'false';
				}

				if(_this.config.moduleType == '4' && (options.isNew == true || options.isNew =="true")){
					options.contentType = _this.config.ext.contentType || '-1';
					options.templateId = _this.config.ext.templateId || '';
				}

				if(_this.config.moduleType == '4' && _this.config.ext.openFrom=="new"){
					// 移动端收文登记 - 新建
					options.openFrom = "new";
					delete options.distributeContentDataId;
					delete options.distributeContentTemplateId;
					delete options.distributeAffairId;
				}
				/*******************移动端收文登记适配*******************结束*****/
				//CAP4适配
				options.operateType = options.viewState;
				options.cacheKey = options.moduleId;

				if (_this.config.ext.summaryId) {
					options.summaryId = _this.config.ext.summaryId;
					options.cacheKey = _this.config.ext.summaryId;
				}

				//CAP4表单, 视图切换进行托管
				if (_this.config.ext.isCAP4 === true && _this.config.ext.onChangeViewEvent) {
					options.onChangeViewEvent = _this.config.ext.onChangeViewEvent;
				}

				_this.options = options;

				if (callback) {
					options.callback = callback;
				}

				if (_this.config.ext.isLightForm) {
					options.templateType = 'lightForm';

					if (_this.config.ext.isCAP4 === true) {
						if (_this.config.onScroll) {
							options.onScroll = _this.config.onScroll;
						}
					}

					function _loadFormCallback() {
						_this.isLoading = false;
						cmp.dialog.loading(false);

						if (loadCallback) {
							loadCallback();
						}
					}

					if (_this.config.ext.isCAP4 === true) {
						cmp.sui.ready(function () {
							$.sui.loadForm(options, _loadFormCallback);
						});
					} else {
						$.sui.loadForm(options, _loadFormCallback);
					}

					// CAP4 自己实现滚动
					if (_this.config.ext.isCAP4 !== true) {
						if (!_this.hasListener) {
							_this.outer.style.overflow = 'auto';
							_this._listener();
							_this.hasListener = true;
						}
					}
				} else {
					if (_this.config.onScrollBottom) {
						options.onScrollBottom = _this.config.onScrollBottom;
					}

					if (_this.config.onScroll) {
						options.onScroll = _this.config.onScroll;
					}

					options.templateType = 'infopath';

					function _loadFormCallback() {
						_this.isLoading = false;
						cmp.dialog.loading(false);

						if (loadCallback) {
							loadCallback();
						}
					}
					if (_this.config.ext.isCAP4 === true) {
						cmp.sui.ready(function () {
							$.sui.loadForm(options, _loadFormCallback);
						});
					} else {
						$.sui.loadForm(options, _loadFormCallback);
					}

					// CAP4 自己实现滚动
					if (_this.config.ext.isCAP4 !== true) {
						if (_this.hasListener) {
							_this.outer.style.overflow = 'hidden';
							_this.destroy();
							_this.hasListener = false;
						}
					}
				}
			}

			var switchFormType = this.viewIndex == index;
			var needSubmit = _this.config.ext.viewState != '2' && !switchFormType && this.viewIndex == '0' && isInit !== true;
			//更新视图
			this.viewIndex = index;

			if (needSubmit) {
				var submitSource = 'pc';
				if (_this.config.ext.isLightForm === true) {
					submitSource = 'mobile';
				}

				$.sui.submit(
					{
						moduleId: _this.config.content,
						needCheckRule: false,
						notSaveDB: true,
						rightId: _this.config.ext.rightId,
						needSn: false,
						submitSource: submitSource, //预提交， 直接是手机端
					},
					function (err, data) {
						if (err) {
							_this.isLoading = false;
							cmp.dialog.loading(false);

							//页面有错误提示， 这里不再进行提示
							//$.notification.toast(err.message,"center");
						} else {
							LazyUtil.addLoadedFn('lazy_form', _doLoadForm);
						}
					}
				);
			} else {
				//轻原表单切换
				if (isInit !== true && switchFormType) {
					$.sui.cacheFormData(function () {
						LazyUtil.addLoadedFn('lazy_form', _doLoadForm);
					});
				} else {
					LazyUtil.addLoadedFn('lazy_form', _doLoadForm);
				}
			}
		};

		FormContent.prototype._tap = function (e) {
			var nowTime = new Date().getTime();

			//ios会执行两次
			if (nowTime - this.lastTapTime < 1000) {
				this.lastTapTime = nowTime;
				return;
			}
			this.lastTapTime = nowTime;

			var srcEle = e.target;

			// 附件
			if (srcEle.classList.contains('allow-click-attachment')) {
				var attData = srcEle.getAttribute('see-att-data');
				SeeyonContent.clickAtt($.parseJSON(attData), this.config.appName || '');
			} else if (srcEle.classList.contains('allow-click-relationform')) {
				// 关联表单
				var relData = srcEle.getAttribute('see-att-data');
				relData = $.parseJSON(relData);

				if (relData.formType == '1') {
					// 流程表单
					var paramData = {
						openFrom: 'formRelation',
						summaryId: relData.dataId,
						operationId: relData.rightId || '',
					};

					//人间处处是坑， PC就是这样坑的~~
					if (window.summaryBO && summaryBO.summary) {
						paramData.baseObjectId = summaryBO.summary.id;
						paramData.baseApp = '1';
					}

					//触发页面数据缓存
					$.event.trigger('beforepageredirect', document);

					var tempRoot = window._collPath;
					if (window._formEdoc) {
						// 公文重新定义了 _collPath,  _coll 和协同页面的 _collPath 是一样的
						tempRoot = window._coll;
					}

					$.href.next(tempRoot + '/html/details/summary.html?_rand=' + new Date().getTime(), paramData);
				} else {
					//无流程表单
					var paramData = {
						moduleId: relData.dataId,
						name: relData.title,
						rightId: relData.rightId,
						viewState: '2',
					};

					var recordInfo = relData.record;
					if (recordInfo) {
						recordInfo = $.parseJSON(recordInfo);
						paramData.moduleType = recordInfo.formType;
					}
					$.openUnflowFormData(paramData);
				}
			} else if (srcEle.classList.contains('sui-input-url')) {
				//连接
				var aHref = srcEle.getAttribute('url');
				if (aHref) {
					// 不区分微信端使用链接
					var tTitle = srcEle.innerText || $.i18n('commons.label.link'); // 连接
					$.href.open(aHref, tTitle);

					// 普通连接，直接弹出查看
					// if ($.platform.CMPShell) {
					// 	var tTitle = srcEle.innerText || $.i18n('commons.label.link'); // 连接
					// 	$.href.open(aHref, tTitle);
					// } else {
					// 	$.notification.toast($.i18n('commons.note.notsuport1'), 'top', 1000); // 微信端暂不支持超链接跳转!
					// }
				}
			} else if (srcEle.tagName.toLowerCase() === 'img') {
				if ($.platform.CMPShell || $.platform.harmony) {
					//图片
					var path = srcEle.getAttribute('url'),
						filename = srcEle.getAttribute('filename') || '';
					var fileId = srcEle.getAttribute('fileid');
					if (!fileId) {
						//表单意见里面签名图片不支持打开
						return;
					}
					cmp.dialog.loading();
					$.att.read({
						filename: filename,
						from: this.config.appName || '',
						path: path, // 文件路径
						extData: {
							fileId: fileId,
							lastModified: '1',
						},
						success: function (res) {
							cmp.dialog.loading(false);
						},
						error: function (err) {
							cmp.dialog.loading(false);
							this.alert($.i18n('commons.note.readpicerror', [err])); //读取图片失败, 请稍重试.错误信息:
						},
					});
				} else if (summaryBO && summaryBO.content && summaryBO.content.isCAP4) {
					// cap4不做任何处理
				} else {
					$.notification.toast($.i18n('commons.note.notsuport2'), 'top', 1000); //微信端暂不支持图片查看!
				}
			}
		};

		/**
		 * 添加监听
		 */
		FormContent.prototype._listener = function (e) {
			if (this.config.onScrollBottom || this.config.scrollEnd || this.config.onScroll) {
				this.outer.addEventListener('touchstart', this);
				this.outer.addEventListener('touchmove', this);
				this.outer.addEventListener('touchend', this);
			}
		};

		/**
		 * 销毁
		 */
		FormContent.prototype.destroy = function (e) {
			if (this.config.onScrollBottom || this.config.scrollEnd || this.config.onScroll) {
				this.outer.removeEventListener('touchstart', this);
				this.outer.removeEventListener('touchmove', this);
				this.outer.removeEventListener('touchend', this);
			}
		};

		FormContent.prototype.handleEvent = function (e) {
			switch (e.type) {
				case 'scroll':
					this._scroll(e);
					break;
				case 'touchstart':
					this._touchstart(e);
					break;
				case 'touchmove':
					this._touchmove(e);
					break;
				case 'touchend':
					this._touchend(e);
					break;
				case 'tap':
					this._tap(e);
					break;
				default:
					break;
			}
		};

		/**
		 * 正文打印
		 */
		FormContent.prototype.print = function (params, fn, scope) {
			cmp.sui.getPdfFormat(function (pdfPath) {
				if (pdfPath) {
					_print(pdfPath, 'pdf', fn, scope);
				} else {
					// cap那边有提示
					if (fn) {
						fn.call(scope || this);
					}
				}
			});
		};

		FormContent.prototype.getPrintParam = function (params, fn, scope) {
			cmp.sui.getPdfFormat(function (pdfPath) {
				if (fn) {
					fn.call(scope || this, {
						path: pdfPath,
						fileType: 'pdf',
					});
				}
			});
		};

		return FormContent;
	})(Content);

	/**
	 * HTML正文
	 */
	var HTMLContent = (function (superClass) {
		extend(HTMLContent, superClass);

		function HTMLContent() {
			return HTMLContent.__super__.constructor.apply(this, arguments);
		}

		/**
		 * 初始化HTML正文
		 */
		 HTMLContent.prototype.initContent = function () {

			// 加载OfficeSDK兼容HTML正文+附件场景预览附件问题
			this.loadOfficeSDK();
		}

		HTMLContent.prototype.loadOfficeSDK=function (){
			_this=this;
			_this.load([_commonsPath + '/jquery/jquery-2.1.4.min.js', _commonsPath + '/js/polyfill.min.js'], [], function () {
				_this.load(
          [
            // _officepluginsPath + '/js/webOffice/yozoOfficeBaseOffice.js',
            // _officepluginsPath + '/js/webOffice/baseOffice.js',
            _officepluginsPath + '/js/webOffice/officeSDK.js'
          ],
          [],
          function () {
            _this.doInitContent();
          }
        );
			});
		}

		HTMLContent.prototype.doInitContent  = function () {
			
			this.inner = null; // 正文区域，动态创建的
			this.imgCounts = 0;
			this.imgGroupKey = ''; // 正文区域图片组key
			this.imgSrcs = [];
			this.showImgs = []; // 查看大图所需的图片格式
			this.tableLastTap = 0;
			this.tableLastIndex = -1;
			this.imgLastTap = 0;
			this.imgLastIndex = -1;
			this.loadAllImg = false; // 所有图片是否已经加载完成
			this.exeLoadAllImg = false; //是否执行了图片全部加载完成后的事件
			this.hasTable = false;

			this.iScroll = null; // iScoll对象
			this.isZoom = false; // 是否可以缩放
			this.reachTop = true;
			this.reachBottom = false;
			this.reachLeft = true;
			this.reachRight = false;
			this.scrollBeginTime = 0; // 滚动开始时间点
			this.scrollStartY = 0;
			this.startAtBottom = false; // 上拉时本身在底部

			this.outerWidth = 0; // 外层数据宽度
			this.innerWidth = 0; // 内层数据宽度
			this.innerHeight = 0; // 内层数据高度

			this.scaleWidth = 710; // 缩放临界点

			this.imgGroupKey = this.config.target + '_imgs';
			this._addClass(this.outer, 'content-widget');

			this.inner = document.createElement('DIV');
			this.inner.style.width = "100%";
			this.inner.style.textAlign = "initial";
			this.inner.innerHTML = this._preReplace(this.config.content);

			// a 标签 重置 onclick事件
			var aTags = this.inner.querySelectorAll('a');
			if (aTags) {
				for (var j = 0; j < aTags.length; j++) {
					if (aTags[j]) {
						aTags[j].setAttribute('onclick', 'return false;');
					}
				}
			}
			this._addClass(this.inner, 'ct-inner-container');
			this.outer.innerHTML="";
			this.outer.appendChild(this.inner);

			/**
			 * 加载图片
			 */
			if (this.imgCounts > 0) {
                // 这里加refresh 主要是解决，第二次进入时有图片后，会有outerWidth,导致后面的滚动问题V5-33063【UE应用检查-微协同讨论】 1、第二次进入讨论帖子时，无法滚动内容。 
                this.refresh(true);
				SeeyonImgReady.load(this.imgGroupKey);
			} else {
				this.initImgs = true;
				this.loadAllImg = true;
			}

			// 释放正文内容内存
			this.config.content = null;

			// 刷新正文内容，计算高度宽度等
			this.refresh(true);

			// 添加点击事件
			this._listenTap();

			// 触发加载完成
			this.fire('load');
		}

		HTMLContent.prototype.load=function(js, css, callback) {
			if (css && css.length) {
				cmp.require(css || [], '', 'css');
			}

			if (js && js.length) {
				cmp.require(js || [], callback, 'js');
			} else {
				callback && callback();
			}
		}

		/**
		 * 监听点击事件， 处理附件
		 */
		HTMLContent.prototype._listenTap = function () {
			var _this = this;
			this.inner.addEventListener('tap', function (e) {
				var srcEle = e.target,
					tagName = srcEle.tagName.toLowerCase();
				if (tagName === 'a') {
					e.preventDefault();
					_this._tapA(srcEle);
				} else if ((tagName === 'div' || tagName === 'img') && 'media' === srcEle.getAttribute('data-type')) {
					// 判定IMG主要是有个播放按钮
					_this._playMedia(srcEle); // 如果是媒体资源，播放
				} else {
					var breakImg = false;

					//a标签下面还有内容
					var path = e.path || (e.composedPath && e.composedPath());
					if (path) {
						for (var i = 0, len = path.length; i < len; i++) {
							var nTag = path[i];
							if (nTag.getAttribute('id') == _this.config.target) {
								break;
							} else {
								var _tagName = nTag.tagName.toLowerCase();
								if (_tagName === 'a') {
									breakImg = true;
									e.preventDefault();
									_this._tapA(nTag);
									break;
								} else if (_tagName === 'table' && nTag.getAttribute('_scaleTable') === 'true') {
									var tIndex = nTag.getAttribute('_scaleTableIndex'),
										nowDate = new Date().getTime();

									if (_this.tableLastIndex == tIndex && nowDate - _this.tableLastTap < 300) {
										e.preventDefault();

										breakImg = true;
										var newT = nTag.cloneNode(true);
										newT.style.webkitTransform = '';
										newT.style.transform = '';

										new HTMLViewer({
											type: 'html',
											html: newT,
										});
									}
									_this.tableLastIndex = tIndex;
									_this.tableLastTap = nowDate;
									break;
								}
							}
						}
					}

					if (!breakImg && tagName === 'img') {
						if (typeof _this.config.tapImg === 'function') {
							_this.config.tapImg.call(srcEle, e);
						} else if (cmp.imageViewer) {
							var i = srcEle.getAttribute('_imgIndex'),
								isShow = srcEle.getAttribute('data-show'); // 是否允许大图查看, 没有默认可以大图查看
							if (i) {
								i = parseInt(i, 10);
							} else {
								i = 0;
							}

							if (isShow != 'false') {
								cmp.imageViewer(_this.showImgs, i);
							}
						}
					}
				}
			});
		};

		/**
		 * 播放媒体资源
		 */
		HTMLContent.prototype._playMedia = function (srcEle) {
			var _this = this;

			// welink 微协同不支持音视频播放
			if (cmp.util.webkitType() === 'welink') {
				_this.alert($.i18n('commons.media.play.notsuport')); // 暂不支持音视频播放
				return;
			}

			SeeyonApi.Rest.get('media/info/' + srcEle.getAttribute('data-mediaId'), {}, '', {
				async: false,
				success: function (media) {
					var data = media.data;
					if (!data) {
						// 获取媒体信息失败
						_this.alert($.i18n('commons.media.info.fail'));
						return;
					}
					var playUrl = '',
						fileName = data.mediaName;
					if (data.mediaType == 'audio') {
						// 音频
						playUrl = data.mp3PlayUrl;
					} else {
						// 视频
						playUrl = data.mp4PlayUrl;
						if (data.mediaName) {
							// 因为playUrl取的mp4，把名称也改成mp4后缀
							fileName = data.mediaName.substr(0, data.mediaName.lastIndexOf('.')) + '.mp4';
						}
					}
					cmp.att.read({
						path: playUrl, //文件的服务器地址
						filename: fileName, //附件名称
						imageUrl: srcEle.getAttribute('data-posterUrl'), // 背景图片
						onlinePlay: true,
						canPlayOnWeb: true,
						videoMenuKey: {
							// 长按视频唤起的功能
							collect: false,
							save: false,
							share: false,
						},
						edit: false, //是否可以进行修改编辑
						extData: {
							fileSize: data.mediaSize,
						},
						success: function (ret) {},
						error: function (error) {
							// 播放失败
							_this.alert($.i18n('commons.media.play.fail'));
						},
					});
				},
				error: function (e) {
					// 获取媒体信息失败
					_this.alert($.i18n('commons.media.info.fail'));
				},
			});
		};

		/**
		 * 点击A标签
		 * @param aTag
		 */
		HTMLContent.prototype._tapA = function (aTag) {
			var _this = this,
				aHref = aTag.getAttribute('href');
			if (aHref) {
				if (aHref.indexOf('openEditorAssociate') != -1) {
					// 附件类型
					var attReg = /openEditorAssociate\((.*)\)/gi,
						m = attReg.exec(aHref),
						args = null;
					if (m != null) {
						args = new Function('return ' + ('[' + m[1] + ']'))();
						SeeyonContent.openEditorAssociate(
							args[0],
							args[1],
							args[2],
							args[3] || _this.config.ext.reference,
							args[4] || _this.config.moduleType,
							args[5],
							args[6],
							args[7]
						);
					}
				} else {
					// 临时放开超链接
					var tTitle = aTag.innerText || $.i18n('commons.label.link'); // 连接
						$.href.open(aHref, tTitle);

					// 普通连接，直接弹出查看
					// if ($.platform.CMPShell) {
					// 	var tTitle = aTag.innerText || $.i18n('commons.label.link'); // 连接
					// 	$.href.open(aHref, tTitle);
					// } else {
					// 	$.notification.toast($.i18n('commons.note.notsuport1'), 'top', 1000); // 微信端暂不支持超链接跳转!
					// }
				}
			}
		};

		/**
		 * 对HTML正文进行预处理
		 */
		HTMLContent.prototype._preReplace = function (html) {
			var _this = this,
				flushNote = '<p style="color:red">' + $.i18n('commons.note.flashnotsuport') /* 该处为flash，暂不支持查看！ */ + '</p>';

			//替换恶心的margin负值
			var marginPaddingReg = /(?:margin|padding)[^;]*?:-\d+\.?(?:\d+)?(?:px|pt|cm)/gi;

			// flush替换
			html = html.replace(/<[^<]*?class=FCK__Flash[^<]*?>/gi, flushNote);
			html = html.replace(/<embed[^<]*?(\/>|><\/embed>|>)/gi, flushNote);

			/*this.hasTable = html.indexOf("<table ") != -1;*/

			if (this.config.useZoom) {
				// 图片进行预加载处理
				var imgReg = /<img [^<]*?(?=\/>|><\/img>|>)/gi,
					srcReg = / src[ ]*?=[ ]*?["']([^>]+?)["']/i,
					styleReg = / style[ ]*?=[ ]*?[^>]+?["']/i,
					idReg = / id[ ]*?=[ ]*?[^>]+?["']/i;

				var newHtml = html;
				var ret,
					imgArray = [];
				while ((ret = imgReg.exec(html)) != null) {
					var imgStr = ret[0],
						imgSrc = srcReg.exec(imgStr),
						imgStyle = styleReg.exec(imgStr),
						imgId = idReg.exec(imgStr);

					if (imgSrc) {
						var newImgSrc = imgSrc[1].replace(/&amp;/g, '&');
						//兼容新闻正文为HTML时内有图片时分享到微信，微信端不能查看到图片的问题
						newImgSrc = newImgSrc.replace('fileUpload.do?method=showRTE&fileId=', 'rest/commonImage/showImage?id=');
						if ($.platform.CMPShell && newImgSrc.indexOf('/') == 0) {
							// cmp壳需要进行路径替换
							newImgSrc = $.util.serverPath + newImgSrc;
						}
						// 如果是打开ocip外部待办，header无效故添加参数
						if (typeof summaryBO != 'null' && typeof summaryBO != 'undefined' && summaryBO.ocipConfig) {
							newImgSrc = newImgSrc + '&forwardto=' + summaryBO.ocipConfig;
						}

						// 小程序处理（飞书）
						if (cmp.platform.miniprogram || cmp.platform.lark) {
							newImgSrc = cmp.util.setUrlToken(newImgSrc);
						}

						this.imgSrcs.push(newImgSrc);
						var tag = newImgSrc.match(/\?/) ? '&' : '?'						
						this.showImgs.push({
							small: newImgSrc + tag + 'size=source',
							big: newImgSrc + tag + 'size=source',
						});

						imgSrc = imgSrc[0];
						imgStr = imgStr.replace(imgSrc, '');

						if (imgId) {
							imgStr = imgStr.replace(imgId[0], '');
						}

						var styleAtt = null,
							srcStyleWidth = '0',
							srcStyleHeight = '0';

						if (imgStyle) {
							imgStyle = imgStyle[0];
							var styleCssReg = /([ ;"'])(width|height|display)[ ]*?:[ ]*?([^;"']+)/gi;
							//提取原始的宽度和高度设置
							while ((styleAtt = styleCssReg.exec(imgStyle)) != null) {
								if (styleAtt[2].toLowerCase() == 'width') {
									srcStyleWidth = styleAtt[3];
								} else if (styleAtt[2].toLowerCase() == 'height') {
									srcStyleHeight = styleAtt[3];
								}
							}
							var newImgStyle = imgStyle.replace(styleCssReg, '$1');

							newImgStyle =
								newImgStyle.substring(0, newImgStyle.length - 1) +
								';display:none;' +
								newImgStyle.charAt(newImgStyle.length - 1);
							imgStr = imgStr.replace(imgStyle, newImgStyle);
						} else {
							imgStr += '  style="display:none"';
						}

						var newImgId = this.imgGroupKey + '_' + this.imgCounts;

						imgStr =
							"<span srcStyleWidth='" +
							srcStyleWidth +
							"' srcStyleHeight='" +
							srcStyleHeight +
							"' id='" +
							newImgId +
							"_span' >" +
							$.i18n('commons.label.loading') /* 图片加载中... */ +
							'</span>' +
							imgStr +
							' _imgIndex="' +
							this.imgCounts +
							'" id="' +
							newImgId +
							'"';

						// 创建预加载对象
						SeeyonImgReady.addImg(this.imgGroupKey, {
							src: newImgSrc,
							load: function (imgObj, loadAll) {
								_this._onImgLoad(imgObj, loadAll);
							},
							error: function (imgObj, loadAll) {
								_this._onImgLoad(imgObj, loadAll);
							},
							newImgId: newImgId,
						});

						// 只替换一个
						newHtml = newHtml.replace(ret[0], imgStr);

						this.imgCounts++;
					}
				}

				// 处理音视频
				var mediaReg = /<iframe.*?myCtpVideoIframe.*?<\/iframe>/gi,
					mediaIdReg = /mediaId[\s]*?=[\s]*?(-?\d+)/i,
					mediaSrcReg = /\ssrc[\s]*?=[\s]*?["']([^>]+?)["']/i,
					mediaImgSrcReg = /\sdata-posterurl[\s]*?=[\s]*?["']([^>]+?)["']/i,
					mediaWidthReg = /width[\s]*?=[\s]*?(\d+)/i,
					mediaHeightReg = /height[\s]*?=[\s]*?(\d+)/i,
					mediaRet;

				while ((mediaRet = mediaReg.exec(html)) != null) {
					var mediaIframeStr = mediaRet[0],
						mediaSrc = mediaSrcReg.exec(mediaIframeStr),
						mediaImgSrc = mediaImgSrcReg.exec(mediaIframeStr),
						mediaIdStr = mediaIdReg.exec(mediaSrc[0]),
						mediaWidth = mediaWidthReg.exec(mediaSrc[0]),
						mediaHeight = mediaHeightReg.exec(mediaSrc[0]);

					if (mediaIdStr) {
						// 构建图片
						var mediaId = mediaIdStr[1], // mediaId=1234;
							newImgId = mediaId + '_img',
							width = mediaWidth[1],
							height = mediaHeight[1],
							newWidth,
							newHeight,
							outerWidth = this.outerWidth;

						// 进行缩放
						if (!outerWidth) {
							outerWidth = window.innerWidth;
						}

						if (outerWidth > 0) {
							newWidth = outerWidth - 20;
							newHeight = Math.floor(height * (newWidth / width) * 10) / 10.0;
						}

						// 处理路径的区别
						var newMedia;
						var newMediaImgSrc = mediaImgSrc[1].replace(/&amp;/g, '&');
						if ($.platform.CMPShell && newMediaImgSrc.indexOf('/') == 0) {
							// cmp壳需要进行路径替换
							newMediaImgSrc = $.util.serverPath + newMediaImgSrc;
						}
						//                        else { // 微协同， 方案调整，暂不用该方式
						//                        	newMedia = '<video width="' + newWidth + '" height="'+ newHeight +'" id="video_' + mediaId + '" class="video-js vjs-default-skin vjs-big-play-centered" data-id="' + mediaId + '"></video>';
						//                        }

						newMedia =
							'<div data-mediaId="' +
							mediaId +
							'" data-type="media" data-posterUrl="' +
							newMediaImgSrc +
							'"' +
							'style="width:' +
							newWidth +
							'px;height:' +
							newHeight +
							'px;' +
							'background:#000000 url(' +
							newMediaImgSrc +
							') center no-repeat;background-size: contain;position:relative;">' +
							'<img width="42" height="42" data-mediaId="' +
							mediaId +
							'" data-type="media" data-posterUrl="' +
							newMediaImgSrc +
							'" src="' +
							__m3_v5_commons_path__ +
							'/images/play.png" alt="" data-show="false" style="height:42px; width:42px; position: absolute;left: 50%;top: 50%;margin: -21px 0 0 -21px;">' +
							'</div>';

						newHtml = newHtml.replace(mediaIframeStr, newMedia);
					}
				}

				return newHtml.replace(marginPaddingReg, '');
			} else {
				if ($.platform.CMPShell) {
					// cmp壳需要进行路径替换
					html = html.replace(/(<img[^<]*?src=)(["'])\/([^<]*?)\2/gi, '$1$2' + $.util.serverPath + '/$3$2');
				}

				return html.replace(marginPaddingReg, '');
			}
		};

		/**
		 * 图片加载完成后执行方法
		 */
		HTMLContent.prototype._onImgLoad = function (imgObj, loadAll) {
			this.loadAllImg = loadAll;
            this.outerWidth = this.outerWidth || this.outer.clientWidth;
			if (this.outerWidth > 0 && !imgObj.__initDom) {
				// 标记已经初始化了
				imgObj.__initDom = true;

				var iSpan = document.getElementById(imgObj.config.newImgId + '_span'),
					img = document.getElementById(imgObj.config.newImgId),
					imgH = imgObj.height,
					imgW = imgObj.width;

				// 记住图片的偏移位置，要算到最终的宽度中
				var spanLeft = iSpan ? iSpan.offsetLeft : 0;

				iSpan.remove();

				var srcStyleWidth = '0',
					srcStyleHeight = '0';
				srcStyleWidth = iSpan.getAttribute('srcStyleWidth');
				srcStyleHeight = iSpan.getAttribute('srcStyleHeight');

				srcStyleWidth = srcStyleWidth || img.getAttribute('width');
				srcStyleHeight = srcStyleHeight || img.getAttribute('height');

				if (srcStyleWidth && (srcStyleWidth = srcStyleWidth.toLowerCase()) != 'auto') {
					//百分比
					if (srcStyleWidth.indexOf('%') == -1) {
						srcStyleWidth = parseInt(srcStyleWidth, 10);
						if (srcStyleWidth > 0) {
							imgW = Math.min(srcStyleWidth, imgW);
						}
					} else {
						srcStyleWidth = parseInt(srcStyleWidth, 10);
						var parentWidth = _getRuntimeStyle(img.offsetParent || img.parentElement, 'width');
						if (parentWidth) {
							parentWidth = parseInt(parentWidth + '', 10);
							imgW = Math.floor(parentWidth * (srcStyleWidth / 100) * 10) / 10.0;
						}
					}
				}

				if (srcStyleHeight && (srcStyleHeight = srcStyleHeight.toLowerCase()) != 'auto') {
					srcStyleHeight = srcStyleHeight.toLowerCase();
					if (srcStyleHeight.indexOf('%') == -1 && srcStyleHeight.indexOf('auto') == -1) {
						srcStyleHeight = parseInt(srcStyleHeight, 10);
						if (srcStyleHeight > 0) {
							imgH = Math.min(srcStyleHeight, imgH);
						}
					} else {
						srcStyleHeight = parseInt(srcStyleHeight, 10);
						var parentHeight = _getRuntimeStyle(img.offsetParent || img.parentElement, 'height');
						if (parentHeight) {
							parentHeight = parseInt(parentHeight + '', 10);
							imgH = Math.floor(parentHeight * (srcStyleHeight / 100) * 10) / 10.0;
						}
					}
				}

				//设置了原始高度， 需要按比例进行缩放一下
				if (srcStyleWidth && !srcStyleHeight) {
					//有宽度没有高度， 按照宽度保证长宽比例缩放
					imgH = Math.floor(imgH * (imgW / imgObj.width) * 10) / 10.0;
				}
				if (srcStyleHeight && !srcStyleWidth) {
					//有高度没有宽度， 按照宽度保证长宽比例缩放
					imgW = Math.floor(imgW * (imgH / imgObj.height) * 10) / 10.0;
				}

				newWidth = imgW;
				newHeight = imgH;

				var imgMargin = 0,
					imgMarginLeft,
					imgMarginRight,
					textIndent;
				imgMarginLeft = _getRuntimeStyle(img, 'margin-left');
				imgMarginRight = _getRuntimeStyle(img, 'margin-right');

				if (imgMarginLeft && imgMarginLeft.match(/-?\d+/)) {
					imgMargin += parseInt(imgMarginLeft, 10);
				}
				if (imgMarginRight && imgMarginRight.match(/-?\d+/)) {
					imgMargin += parseInt(imgMarginRight, 10);
				}

				//首行缩进
				imgMargin += getEleTextIndent(img);

				imgW += imgMargin + spanLeft;

				// 缩放
				if (imgW > this.outerWidth && !this._hasParent(img, 'td') /*&& !this.hasTable*/) {
					var srcImgWidth = newWidth;
					newWidth = this.outerWidth - 20 - imgMargin - spanLeft;
					newHeight = Math.floor(imgH * (newWidth / srcImgWidth) * 10) / 10.0;
				}

				img.style.height = newHeight + 'px';
				img.style.width = newWidth + 'px'; // 20是padding

				img.src = imgObj.config.src;
				img.style.display = '';

				// 刷新
				if (/*loadAll && */ !this.exeLoadAllImg) {
					if (loadAll) {
						this.exeLoadAllImg = true;
						this._scaleTable();
						var currentPageDom = document.querySelector(".ct-inner-container");
                        currentPageDom.style.height = "auto";
                        var tempScrollHeight = currentPageDom.scrollHeight;
                        var tempClientHeight = currentPageDom.clientHeight;
                        currentPageDom.style.height = Math.max(tempScrollHeight, tempClientHeight) + 'px';
					}
					// 处理微协同内容高度不正常，做延迟更新内容区
					var _this = this;
					setTimeout(function() {
						_this.reLayout();
					}, 300);
				}
			}
		};

		/**
		 * 处理表格
		 */
		HTMLContent.prototype._scaleTable = function () {
			var tables = this.inner.querySelectorAll('table');
			if (tables && tables.length > 0) {
				for (var i = 0, len = tables.length; i < len; i++) {
					var t = tables[i];

					//内层的table不做处理
					if (!this._hasParent(t, 'td')) {
						var w, h, newW, newH, tI, scaleSize;
						w = t.offsetWidth;
						h = t.offsetHeight;
					    if(t.align && t.align !== 'left'){
					    	t.align = 'left'
						}
						//设置标记，用于放大显示
						t.setAttribute('_scaleTable', 'true');
						t.setAttribute('_scaleTableIndex', i);

						//缩进， word里面编辑经常这样写
						tI = getEleTextIndent(t);
						if (w + tI > this.outerWidth) {
							var pLeft = _getRuntimeStyle(this.outer, 'padding-left') || '0';
							pRight = _getRuntimeStyle(this.outer, 'padding-right') || '0';

							var innerPading = 20;
							if (this.config.padding) {
								innerPading = parseInt(this.config.padding, 10) * 2;
							}
							newW = this.outerWidth - innerPading - (parseInt(pLeft, 10) + parseInt(pRight, 10)) - tI;

							//缩放比列
							scaleSize = (Math.floor((newW / w) * 100) - 1) / 100.0; //保留2位有效数字
							newH = Math.ceil(h * scaleSize);

							//在外面套上一层DIV
							var tOuter,
								tParent = t.parentNode;
							tOuter = document.createElement('div');
							with (tOuter.style) {
								width = newW + 'px';
								height = newH + 'px';
								overflow = 'hidden';
							}

							//置换
							tParent.insertBefore(tOuter, t);
							tParent.removeChild(t);
							tOuter.appendChild(t);

							t.style.width = w + 'px';
							t.style.webkitTransform = 'scale(' + scaleSize + ')';
							t.style.transform = 'scale(' + scaleSize + ')';
							t.style.webkitTransformOrigin = '0px 0px 0px';
							t.style.transformOrigin = '0px 0px 0px';
							//t.style.zoom = scaleSize;
							t.style.margin = '0px';
						}
					}
				}
			}
		};

		/**
		 * ele是否有tag类型的父节点
		 */
		HTMLContent.prototype._hasParent = function (ele, tag) {
			var ret = false,
				p,
				parentTag;
			p = ele.parentNode;

			if (p && (parentTag = p.tagName.toLowerCase()) !== 'body') {
				ret = parentTag === tag;
				if (!ret) {
					ret = this._hasParent(p, tag);
				}
			}
			return ret;
		};

		/**
		 * 刷新列表
		 */
		HTMLContent.prototype.refresh = function (isInit,needRefresh) {
			if (this.outerWidth == 0 || needRefresh) {
				this.outerWidth = this.outer.clientWidth;

				if (this.outerWidth != 0) {
					var innerMinWidth = this.clientWidth + 'px';
					if (this.outerWidth == 0) {
						innerMinWidth = '100%';
					}
					if (this.hasTable) {
						//有表格需要进行页面撑开
						/*this.inner.classList.add("ct-inner-c-auto");
                        this.inner.style.width = "auto";*/
					}

					this.inner.style.minWidth = innerMinWidth;
					if (this.config.padding) {
						this.inner.style.padding = this.config.padding + 'px';
					}

					// 图片宽度初始化
					var imgObjs = SeeyonImgReady.getImgs(this.imgGroupKey);
					if (imgObjs && imgObjs.length > 0) {
						var loadFlag = this.loadAllImg;
						for (var i = 0, len = imgObjs.length; i < len; i++) {
							var iObj = imgObjs[i];
							if (iObj.loaded) {
								this._onImgLoad(iObj, (this.loadAllImg || loadFlag) && loadFlag && i == len - 1);
							}
						}
						if (loadFlag) {
							this.loadAllImg = loadFlag;
						}
					} else {
						//缩放表格
						this._scaleTable();
					}

					var _this = this;
					setTimeout(function () {
						// 有表格的时候浏览器布局有问题
						_this.innerWidth = _this.inner.offsetWidth;
						var height = _this.inner.style.height;
						height !== '100%' && (_this.inner.style.height = '');
						_this.innerHeight = Math.max(_this.inner.offsetHeight, _this.inner.scrollHeight);
						if (_this.innerHeight > 0) {
							// 有内容的时候，设置container样式，这样标准正文才能正常滑动。
                            // _this.inner.style.height = "100%";
							// _this.inner.style.overflow = "scroll";
							_this.inner.style.height = _this.innerHeight + 'px';
						} else {
							_this.inner.style.height = height;
						}

						_this._initZoom();
					}, 100);
				}
			}
		};

		/**
		 * 更新layout
		 */
		HTMLContent.prototype.reLayout = function () {
			var _this = this;

			//赋初始值
			_this.__relayoutCount = _this.__relayoutCount || 0;

			if (!_this.config && _this.__relayoutCount < 20) {
				_this.__relayoutCount++;

				setTimeout(function () {
					_this.reLayout();
				}, 300);
			} else {
				_this.__relayoutCount = 0;

				
				// // V5-33063屏蔽的代码先恢复，影响了图片设置后的高度限定
				// if (this.config.zoomType == 'iscroll') {
				// 	//重新设置高度
				// 	var height = this.inner.style.height;
				// 	height !== '100%' && (this.inner.style.height = '');
				// 	this.innerHeight = Math.max(this.inner.offsetHeight, this.inner.scrollHeight);
				// 	if (this.innerHeight > 0) {
				// 		this.inner.style.height = this.innerHeight + 'px';
				// 	} else {
				// 		this.inner.style.height = height;
				// 	}
				// 	// this.iScroll.refresh();
				// }

				if (this.config.zoomType == 'iscroll') {
					if (this.iScroll != null) {
						//重新设置高度
						var height = this.inner.style.height;
						height !== '100%' && (this.inner.style.height = '');
						this.innerHeight = Math.max(this.inner.offsetHeight, this.inner.scrollHeight);
						if (this.innerHeight > 0) {
							this.inner.style.height = this.innerHeight + 'px';
						} else {
							this.inner.style.height = height;
						}
						this.iScroll.refresh();
					}
				}
			}
		};

		/**
		 * 初始化滚动区域
		 */
		HTMLContent.prototype._initZoom = function () {
			if (!this.config.useZoom) {
				return;
			}

			var _this = this;

			if (this.config.zoomType == 'iscroll') {
				this.outer.style.overflow = 'hidden';

				this.isZoom = true;

				var iscrollConfig = {
					zoom: true,
					zoomMin: this.config.zoomMin,
					zoomMax: this.config.zoomMax,
					startZoom: this.config.zoomMin,
					preventDefault: false,
					disableMouse: true,
					disablePointer: true,
					// INSERT POINT: OPTIONS
					disableTouch: false, //utils.hasPointer || !utils.hasTouch,
					scrollY: true,
					scrollX: true,
					/*eventPassthrough : true,*/
					momentum: this.config.momentum,
					bounce: false,
				};

				//事件绑定在容器上面
				if (this.config.onScrollAuto) {
					iscrollConfig.bindToWrapper = true;
				}

				this.iScroll = new IScroll(this.outer, iscrollConfig);

				if (_this.config.onScrollAuto) {
					this.iScroll.on('beforeScrollStartBegin', function (e) {
						//开始就到底部了
						if (_this.iScroll.y == _this.iScroll.maxScrollY && _this.iScroll.y == 0) {
							_this.iScroll.resetPassthrough(true);
						}
					});

					this.iScroll.on('beforeScrollMove', function (e) {
						//向上滑动
						if (this.verticalDir == 1) {
							if (this.y == 0) {
								this.resetPassthrough(false); //启用iscroll
							}

							if (this.y == this.maxScrollY) {
								this.resetPassthrough(true); //禁用iscroll
							}
						} else if (this.verticalDir == -1) {
							//向下滑动

							if (this.y == this.maxScrollY) {
								this.resetPassthrough(false); //启用iscroll
							}

							//滚动到头
							if (this.y == 0) {
								this.resetPassthrough(true); //禁用iscroll
							}
						}
					});
				} else {
					this.iScroll.on('beforeScrollStart', function () {
						_this.scrollBeginTime = new Date().getTime();
						_this.scrollStartY = _this.iScroll.pointY;
						_this.startAtBottom = _this.iScroll.y == _this.iScroll.maxScrollY;
					});

					//自动滚动
					this.iScroll.on('scrollEnd', function () {
						_this._onScrollEnd();
					});

					this.iScroll.on('scroll', function (e) {
						_this.fire('scroll', {
							top: this.y,
							directionY: this.directionY,
							scrollH: this,
						});
					});
				}
			}
		};

		/**
		 * 添加事件
		 */
		HTMLContent.prototype._listen = function () {
			this.inner.addEventListener('touchstart', this, false);
			this.inner.addEventListener('touchmove', this, false);
			//this.inner.addEventListener("touchend", this, false);
		};

		HTMLContent.prototype.handleEvent = function (e) {
			//事件处理
			if (this.config.zoomType == 'iscroll') {
			} else {
			}
		};

		/**
		 * 获取两个触碰点的距离
		 */
		HTMLContent.prototype._getTouchDist = function (e) {
			var x1 = 0,
				y1 = 0,
				x2 = 0,
				y2 = 0,
				dist = 0;

			var tPoints = e.touches;
			if (tPoints && tPoints.length > 1) {
				x1 = tPoints[0].pageX;
				y1 = tPoints[0].pageY;

				x2 = tPoints[1].pageX;
				y2 = tPoints[1].pageY;

				//计算两点间的距离
				dist = Math.ceil(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
			}
			return dist;
		};

		/**
		 * 触发滚动到最右
		 */
		HTMLContent.prototype._onScrollEnd = function () {
			if (this.scrollBeginTime == 0) {
				return;
			}

			this.scrollBeginTime = 0;

			var _this = this;

			this.fire('scrollEnd', {
				top: _this.iScroll.y,
				directionY: _this.iScroll.directionY,
			});

			//到顶事件
			if (_this.iScroll.y == 0 && _this.iScroll.directionY == -1) {
				if (_this.reachTop) {
					_this.reachTop = false;
					_this.fire('scrollTop');
				} else {
					_this.reachTop = true;
				}
			} else {
				_this.reachTop = false;
			}

			if (!_this.iScroll.hasVerticalScroll) {
				if (_this.scrollStartY > _this.iScroll.pointY) {
					_this.fire('scrollBottom');
				}
				_this.reachBottom = false;
			} else {
				//到底事件
				if (_this.iScroll.y == _this.iScroll.maxScrollY && _this.iScroll.directionY == 1) {
					if (_this.reachBottom || _this.startAtBottom) {
						_this.reachBottom = false;
						_this.fire('scrollBottom');
					} else {
						_this.reachBottom = true;
					}
				} else {
					_this.reachBottom = false;
				}
			}

			//到左边事件
			if (_this.iScroll.x == 0 && _this.iScroll.directionX == -1) {
				if (_this.reachLeft) {
					_this.reachLeft = false;
					_this.fire('scrollLeft');
				} else {
					_this.reachLeft = true;
				}
			} else {
				_this.reachLeft = false;
			}

			//到右边事件
			if (_this.iScroll.x == _this.iScroll.maxScrollX && _this.iScroll.directionX == 1) {
				if (_this.reachRight) {
					_this.reachRight = false;
					_this.fire('scrollRight');
				} else {
					_this.reachRight = true;
				}
			} else {
				_this.reachRight = false;
			}
		};

		/**
		 * 销毁
		 */
		HTMLContent.prototype.destroy = function () {
			if (this.iScroll) {
				this.iScroll.destroy();
				this.iScroll = null;
			}
		};

		/**
		 * 打印
		 */
		HTMLContent.prototype.print = function (params, fn, scope) {
			if (params && params.url) {
				// 打印
				_print(params.url, 'pdf', fn, scope);
			}
		};

		HTMLContent.prototype.getPrintParam = function (params, fn, scope) {
			if (fn) {
				fn.call(scope || this, {
					path: params.url,
					fileType: 'pdf',
				});
			}
		};

		return HTMLContent;
	})(Content);

	/**
	 * Edoc HTML正文
	 */
	var EdocContent = (function (superClass) {
		extend(EdocContent, superClass);

		function EdocContent() {
			return EdocContent.__super__.constructor.apply(this, arguments);
		}

		/**
		 * 初始化HTML正文
		 */
		EdocContent.prototype.initContent = function () {
			this.inner = null; //正文区域，动态创建的

			this.imgCounts = 0; // 图片数量
			(this.imgGroupKey = this.config.target + '_imgs'), // 正文区域图片组key
				(this.iScroll = null); //iScoll对象
			this.isZoom = false; //是否可以缩放

			this.scrollBeginTime = 0; //滚动开始时间点
			this.startAtBottom = false; //上拉时本身在底部

			this.outerWidth = 0; //外层数据宽度
			this.innerWidth = 0; //内层数据宽度
			this.innerHeight = 0; //内层数据高度
			this.setTimouttime = 0;
			this.setTimeoutFlag = 0;

			if(this.outer.id == "content_div" &&  this.outer.style.overflow == "auto" && this.outer.className == "infopath"){
				this.outer.style.overflow = 'auto';
			}else{
				this.outer.style.overflow = 'hidden';
			}


			this.inner = document.createElement('DIV');
			with (this.inner.style) {
				overflow = 'hidden';
				display = 'inline-block';
				padding = '10px';
			}

			this.inner.innerHTML = this.config.content;

			this.dealImg(this.config.content);

			this.outer.appendChild(this.inner);

			//释放正文内容内存
			this.config.content = null;

			if (this.imgCounts > 0) {
				SeeyonImgReady.load(this.imgGroupKey);
			} else {
				this.refresh();
			}

			//处理点击事件
			this._listenTap();

			this.fire('load');
		};

		/**
		 * 监听点击事件， 处理附件
		 */
		EdocContent.prototype._listenTap = function () {
			this.inner.addEventListener('tap', this);
		};

		EdocContent.prototype.handleEvent = function (e) {
			switch (e.type) {
				case 'tap':
					this._tap(e);
					break;
				default:
					break;
			}
		};

		EdocContent.prototype._tap = function (e) {
			var srcEle = e.target.parentElement;
			if (srcEle.classList.contains('allow-click-attachment')) {
				var attData = srcEle.getAttribute('see-att-data');
				SeeyonContent.clickAtt($.parseJSON(attData), this.config.appName || '');
			}
		};

		/**
		 * 刷新列表
		 */
		EdocContent.prototype.refresh = function () {
			if (this.outerWidth == 0) {
				this.outerWidth = this.outer.clientWidth;

				if (this.outerWidth != 0) {
					var innerMinWidth = this.outerWidth + 'px';
					if (this.outerWidth == 0) {
						innerMinWidth = '100%';
					}
					this.inner.style.minWidth = innerMinWidth;

					var _this = this;

					//处理加载速度慢，文单无法加载完的问题
					var tempWidth = _this.inner.offsetWidth;
					var tempHeight = _this.inner.offsetHeight;

					if ((_this.innerWidth != tempWidth || _this.innerHeight != tempHeight) && this.setTimouttime < 20) {
						_this.innerWidth = tempWidth;
						_this.innerHeight = tempHeight;
						_this.setTimouttime++;

						clearTimeout(this.setTimeoutFlag);

						this.setTimeoutFlag = setTimeout(function () {
							_this.outerWidth = 0;
							_this.refresh();
						}, 500);
					} else {
						_this._initZoom();
					}
				}
			}
		};

		/**
		 * 初始化滚动区域
		 */
		EdocContent.prototype._initZoom = function () {
			var _this = this,
				startZoom = Math.floor((this.outerWidth / this.innerWidth) * 100) / 100.0;
			this.isZoom = true;

			if (!this.iScroll) {
				this.iScroll = new IScroll(this.outer, {
					zoom: true,
					zoomMin: startZoom,
					zoomMax: this.config.zoomMax,
					startZoom: startZoom,
					disableMouse: true,
					disablePointer: true,
					// INSERT POINT: OPTIONS
					disableTouch: false,
					scrollY: true,
					scrollX: true,
					momentum: this.config.momentum,
					bounce: false,
				});
				this.iScroll.on('beforeScrollStart', function () {
					_this.scrollBeginTime = new Date().getTime();
					_this.startAtBottom = _this.iScroll.y == _this.iScroll.maxScrollY;
				});
				this.iScroll.on('scrollEnd', function () {
					_this._onScrollEnd();
				});
			} else {
				this.iScroll.refresh();
			}
		};

		/**
		 * 触发滚动到底部
		 */
		EdocContent.prototype._onScrollEnd = function () {
			if (this.scrollBeginTime == 0) {
				return;
			}
			this.scrollBeginTime = 0;

			var _this = this;

			if (_this.iScroll.hasVerticalScroll) {
				//到底事件
				if (_this.iScroll.y == _this.iScroll.maxScrollY && _this.iScroll.directionY == 1) {
					if (_this.reachBottom || _this.startAtBottom) {
						_this.reachBottom = false;
						_this.fire('scrollBottom');
					} else {
						_this.reachBottom = true;
					}
				} else {
					_this.reachBottom = false;
				}
			}
		};

		/**
		 * 销毁
		 */
		EdocContent.prototype.destroy = function () {
			if (this.iScroll) {
				this.iScroll.destroy();
				this.iScroll = null;
			}
		};

		/**
		 * 获取数量以及预加载图片
		 */
		EdocContent.prototype.dealImg = function (html) {
			var _this = this;
			var imgReg = /<img [^<]*?(?=\/>|><\/img>|>)/gi,
				srcReg = /src[ ]*?=[ ]*?["']([^>]+?)["']/i;
			while ((ret = imgReg.exec(html)) != null) {
				var imgStr = ret[0],
					imgSrc = srcReg.exec(imgStr);

				var newImgSrc = imgSrc[1].replace(/&amp;/g, '&');
				if ($.platform.CMPShell && newImgSrc.indexOf('/') == 0) {
					// cmp壳需要进行路径替换
					newImgSrc = $.util.serverPath + newImgSrc;
				}
				if (imgStr) {
					this.imgCounts++;

					// 创建预加载对象
					SeeyonImgReady.addImg(this.imgGroupKey, {
						src: newImgSrc,
						load: function (imgObj, loadAll) {
							if (loadAll) {
								_this.refresh();
							}
						},
						error: function (imgObj, loadAll) {
							if (loadAll) {
								_this.refresh();
							}
						},
					});
				}
			}
		};

		return EdocContent;
	})(Content);

	/**
	 * 表单正文
	 */
	var OfficeContent = (function (superClass) {
		extend(OfficeContent, superClass);

		function OfficeContent() {
			return OfficeContent.__super__.constructor.apply(this, arguments);
		}

		OfficeContent.prototype.initAttribute = function () {
			this.inner = null; //
			this.outerWidth = 0;
			this.outerHeight = 0;
			this.innerHeight = 0;

			this.inner = document.createElement('DIV');

			this._addClass(this.outer, 'office-content-widget');
			this.inner.setAttribute('id', 'wdtId');
			this._addClass(this.inner, 'office-content-widget-inner');

			this.inner.style.width = '100%';
			this.inner.style.height = '100%';
			this.callBackOfdCount=0;
		};

		/**
		 * 初始化正文
		 */
		OfficeContent.prototype.initContent = function () {
			console.log('-----------config----------:', this.config);
			console.log(this);
			if (this.inner) { // 先把外层div的子元素清空
				this.inner.innerHTML = "";
			}
			this.doInitContent();
		};
		OfficeContent.prototype.doInitContent= function (){
			
            var _this = this;
            function doLoadCallBack(){
				// _this._initMagnifier();//初始化放大镜 正文放大镜功能
				_this._listener();
                _this.fire('load');
			}
			this.config.canNotUseSDKCallBack = function(){
				//走这个不一定是报错了，也可能是没有购买文档通/数科/金山中台 所以使用wpsApp/下载打开
				_this.initContentForApp();
			}

			/*if(_this.config.isOldEdoc){
				_this.initContentForApp();
			}else{
            	_this.loadOfficeSDK();
            }*/

			_this.loadOfficeSDK();
			// 老公文则不走weboffice 也不走轻阅读   lbq改造，先不考虑老公文 保留原始逻辑
			
			doLoadCallBack();
		};
		OfficeContent.prototype.load=function(js, css, callback) {
			if (css && css.length) {
				cmp.require(css || [], '', 'css');
			}

			if (js && js.length) {
				cmp.require(js || [], callback, 'js');
			} else {
				callback && callback();
			}
		}
		// OfficeContent.prototype.loadWebOffice=function (){
		// 	_this=this;
		// 	_this.load([_commonsPath + '/jquery/jquery-2.1.4.min.js', _commonsPath + '/js/polyfill.min.js'], [], function () {
		// 		_this.load([_officepluginsPath + '/js/webOffice/web-office-sdk.umd.js', _officepluginsPath + '/js/webOffice/webOfficeBaseOffice.js', _officepluginsPath + '/js/webOffice/baseOffice.js', _officepluginsPath + '/js/webOffice/officeSDK.js'], [],function (){
		// 			_this.initContentForWebOffice()});
		// 	});
		// }
		// 修改成调用通用的officeSDK
		OfficeContent.prototype.loadOfficeSDK=function (){
			_this=this;
			// 鸿蒙添加版本号
			_this.load([_commonsPath + '/jquery/jquery-2.1.4.min.js', _commonsPath + '/js/polyfill.min.js',cmp.seeyonbasepath + '/rest/global/v1/mobile-env?v=' + new Date().getTime()], [], function () {
				_this.load(
          [
            // _officepluginsPath + '/js/webOffice/yozoOfficeBaseOffice.js',
            // _officepluginsPath + '/js/webOffice/baseOffice.js',
            _officepluginsPath + '/js/webOffice/officeSDK.js'
          ],
          [],
          function () {
            _this.initContentForWebOffice();
          }
        );
			});
		}
		// OfficeContent.prototype.loadLightRead=function (){
		// 	var _this=this;
		// 	_this.load([_commonsPath + '/jquery/jquery-2.1.4.min.js', _commonsPath + '/js/polyfill.min.js'], [], function () {
		// 		_this.load([ _officepluginsPath + '/js/lightRead/dj_lightRead.js',_officepluginsPath + '/js/lightRead/sk_lightRead.js', _officepluginsPath + '/js/lightRead/baseLightRead.js'], [],function (){
		// 			_this.initContentForLightRead();
        //         });
		// 	});
		// }
        OfficeContent.prototype.initContentForLightRead = function () {
            this.outer.innerHTML = "";
            this.outer.appendChild(this.inner);
            var config = this.config;
            var officeParams = {
                fileId: config.content,
                fileName: config.title,
                fileType: this.app.WORD_BODY_TYPES[config.bodyType] || config.bodyType,
                category: config.moduleType, //1：协同；2：表单；4：公文
                canEdit: false,
                canSign: false,
                officecanPrint: false,
                officecanSaveLocal: false,
                targetDom: this.inner,
				embedded: true, // 嵌入式的打开
            };
            LightReadAPI.open(officeParams);
        };

		OfficeContent.prototype.initContentForWebOffice = async function () {
			if (this.inner) { // 先把外层div的子元素清空
				this.inner.innerHTML = "";
			}
			// 在线预览开关（正文、附件）原officeTrans废弃（正文此处统一拦截）
			var config = await OfficeSDK.utils.getConfig("ONLINE_PREVIEW_OPEN");
			var isOnlinePreviewOpen = config && config.value && config.value === "true";
			if (isOnlinePreviewOpen) {
				this.config.allowTrans = true;
			} else {
				this.config.allowTrans = false;
				this.config.isShowLoadViewBtn = false;// 没开正文、附件预览按钮不会渲染置为false
			}

			// 从业务处传递 viewMode  view/edit/sign  用于控制编辑器的打开方式（特殊说明：业务侧多由后端直接返回allowTrans参数控制（原逻辑：有预览走view，没有预览默认走edit））
			if('view' === this.config.viewMode){// 保留原始逻辑
				// 走预览，用参数控制
				if (this.config.defaultLoad && this.config.allowTrans){
					// 初始化下载查看、放大按钮
					this.doInitContentDownViewBtn();
				}
			} else if(! this.config.viewMode || '' == this.config.viewMode) {
				// 默认预览态
				this.config.viewMode = "view";
				// 走预览，用参数控制
				if (this.config.defaultLoad && this.config.allowTrans){
					// 初始化下载查看、放大按钮
					this.doInitContentDownViewBtn();
				}
			} else if ('edit' === this.config.viewMode){
				// 走预览，用参数控制
				if (this.config.defaultLoad && this.config.allowTrans){
					this.config.viewMode = "view";
					// 初始化下载查看、放大按钮
					this.doInitContentDownViewBtn();
				}
			} else {// sign等 取业务侧传递的值
				// todo
			}


			this.outer.innerHTML = "";
			this.outer.appendChild(this.inner);
			var config = this.config;
			var createDate = this.config.lastModified;
			if(window.pageX != undefined && pageX.officeOption){
				createDate = pageX.officeOption.extData.lastModified;
			}
			let creatTime = '';
			if (Number(createDate)) {
				creatTime = timestampToString(createDate)//解决公文附件时间为时间戳不显示附件问题
			}else {
				creatTime = createDate;
			}
			var officeParams = {
				webRoot: cmp.seeyonbasepath,
				fileId: config.content,
				fileName: config.title,
                newTitle: config.title,
				// fileType: config.bodyType,             //这里需要转换
				fileType: this.app.WORD_BODY_TYPES[config.bodyType] || config.bodyType,
				category: config.moduleType, //1：协同；2：表单；4：公文
				viewMode: this.config.viewMode,
				isShowLoadViewBtn: this.config.isShowLoadViewBtn,
				canCopy: config.canCopy ? 1 : 0,
				officecanPrint: 'false',
				targetDom: this.inner,
				isOpen: true,
				isMobile: true,
				member:cmp.member,
				createDate:creatTime
			};
			// this.initWebOffice(officeParams);
			
			this.initOfficeSDK(officeParams);
		};
		//gjx-start
		OfficeContent.prototype.initOfficeSDK = async function (officeParams) {
			let domID = 'wdtId';
			let elDom = document.getElementById(domID) || this.inner;

			// 组装 fileZ 的请求参数
			var paramData = {
				"fileId": officeParams.fileId,
				"createDate": "1",
				"fileName": officeParams.fileName+"."+officeParams.fileType,
				"state": "view"
			};

			let self = this;

			SeeyonApi.Rest.post('euFileZ/fileZInit', {}, paramData, {
				success: function(res) {
					if(res && res.url) {
						if (elDom) {
							// 1. 容器初始化设定
							elDom.innerHTML = "";
							elDom.style.display = "block";
							elDom.style.height = "100%";
							elDom.style.width = "100%";
							// 必须设置为 relative，这样 loader 才能精准覆盖在它上面
							elDom.style.position = "relative";
							elDom.style.overflow = "auto";
							elDom.style.WebkitOverflowScrolling = "touch";

							// ================= 炫彩动态 Loading 遮罩层 =================
							var loaderDiv = document.createElement("div");
							loaderDiv.style.position = "absolute";
							loaderDiv.style.top = "0";
							loaderDiv.style.left = "0";
							loaderDiv.style.width = "100%";
							loaderDiv.style.height = "100%";
							loaderDiv.style.backgroundColor = "#ffffff";
							loaderDiv.style.display = "flex";
							loaderDiv.style.justifyContent = "center";
							loaderDiv.style.alignItems = "center";
							loaderDiv.style.zIndex = "999"; // 确保盖住 iframe
							loaderDiv.style.transition = "opacity 0.5s ease"; // 淡出动画过渡

							// 注入流光渐变和呼吸动画的 CSS
							loaderDiv.innerHTML = `
                        <style>
                            @keyframes filez-gradient-shine {
                                0% { background-position: 0% 50%; }
                                100% { background-position: 200% 50%; }
                            }
                            @keyframes filez-pulse {
                                0%, 100% { transform: scale(1); opacity: 1; }
                                50% { transform: scale(0.96); opacity: 0.8; }
                            }
                            .filez-loading-text {
                                font-size: 16px;
                                font-weight: bold;
                                letter-spacing: 2px;
                                /* 紫色到蓝色的渐变 */
                                background: linear-gradient(90deg, #8A2BE2, #4169E1, #00BFFF, #8A2BE2);
                                background-size: 200% auto;
                                color: transparent;
                                -webkit-background-clip: text;
                                background-clip: text;
                                /* 绑定双动画：流光 + 呼吸 */
                                animation: filez-gradient-shine 2.5s linear infinite, filez-pulse 1.5s ease-in-out infinite;
                            }
                        </style>
                        <div class="filez-loading-text">FileZ联想编辑器加载中...</div>
                    `;
							elDom.appendChild(loaderDiv);
							// ==========================================================

							// 2. 注入 iframe
							var iframe = document.createElement("iframe");
							iframe.src = res.url;
							iframe.style.width = "100%";
							iframe.style.height = "100%";
							iframe.style.border = "none";
							iframe.style.display = "block";
							iframe.setAttribute("webkitallowfullscreen", "true");
							iframe.setAttribute("mozallowfullscreen", "true");
							iframe.setAttribute("allowfullscreen", "true");

							// 瞬间关闭致远自带的那个黑乎乎的菊花转圈
							if (window.cmp && cmp.dialog) {
								cmp.dialog.loading(false);
							}

							// 3. 监听 iframe 真实加载完毕
							iframe.onload = function() {
								if(typeof addRefreshEvent === "function"){
									addRefreshEvent(self);
								}
								// 触发淡出效果
								loaderDiv.style.opacity = "0";
								// 等待 500ms 淡出动画播放完毕后，彻底从 DOM 中销毁遮罩层
								setTimeout(function() {
									if (loaderDiv.parentNode) {
										loaderDiv.parentNode.removeChild(loaderDiv);
									}
								}, 500);
							};

							// 将 iframe 放到遮罩层下面
							elDom.appendChild(iframe);
						}
					}
				},
				error: function(err) {
					if (window.cmp && cmp.dialog) cmp.dialog.loading(false);
					cmp.notification.toast("fileZ服务连接失败", "top", 2000);
				}
			});
		}
		//gjx-end

		function _isNeedTipOfficeInitFailed() {
			var formViewsUl = document.getElementById("form_views");
			if (formViewsUl) {
				for (var i = 0; i < formViewsUl.children.length; ++i) {
					var li = formViewsUl.children[i];
					if (li && li.classList.contains('selected') && li.getAttribute('isoffice') != 'true') {
						// 如果当前选中页签不是正文页签，不弹提示
						return false;
					}
				}
			}

			var _contentBtn = document.getElementById("_contentBtn");
			var paraentNode = _contentBtn ? _contentBtn.parentNode : null;
			if (_contentBtn && window.getComputedStyle(paraentNode).display != 'none' && !_contentBtn.classList.contains('Btn_active')) {
				// 如果当前选中页签不是正文页签，不弹提示 (经典布局、布局A（新布局))
				return false;
			}

			return true;
		}

		function timestampToString (timestampStr) {
			if(timestampStr === '') {
				const newDate = new Date();
				// 获取年、月、日、时、分、秒
				const year = newDate.getFullYear();
				const month = ('0' + (newDate.getMonth() + 1)).slice(-2); // getMonth返回的月份是从0开始的，所以需要+1
				const day = ('0' + newDate.getDate()).slice(-2);
				const hours = ('0' + newDate.getHours()).slice(-2);
				const minutes = ('0' + newDate.getMinutes()).slice(-2);
				const seconds = ('0' + newDate.getSeconds()).slice(-2);

				// 拼接成指定格式的字符串
				const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

				return formattedDate;
			}else {
				// 将时间戳字符串转换为毫秒时间戳
				const timestamp = parseInt(timestampStr, 10);

				// 创建Date对象
				const date = new Date(timestamp);

				// 获取年、月、日、时、分、秒
				const year = date.getFullYear();
				const month = ('0' + (date.getMonth() + 1)).slice(-2); // getMonth返回的月份是从0开始的，所以需要+1
				const day = ('0' + date.getDate()).slice(-2);
				const hours = ('0' + date.getHours()).slice(-2);
				const minutes = ('0' + date.getMinutes()).slice(-2);
				const seconds = ('0' + date.getSeconds()).slice(-2);

				// 拼接成指定格式的字符串
				const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

				return formattedDate;
			}
		}

		function addRefreshEvent(self){
			// 打开了编辑器，注册一个监听事件，用于修改后，刷新正文 
			var _this=this;
			cmp.href.addWebviewListener('activeImmediatelyEditEvent', function(param) {
				// 当前为正文预览的时候，才刷新
				if(self.config && self.config.content !== param.data.fileId){
					cmp.event.trigger("refreshContentEditAfterEvent",document);
				}else if(_this.officeSDK && _this.officeSDK.params.fileId !== param.data.fileId){
					cmp.event.trigger("refreshContentEditAfterEvent",document);
				} else{
					// 协同和公文刷新预览还不一样, 用一套还不一样也是醉了
					if(typeof self.refresh !== "undefined"){
						self.refresh();
					}else if(typeof _this._fileContent.refresh !== "undefined"){
						_this._fileContent.refresh();
					}
				}
			});
		}

		OfficeContent.prototype.initContentForApp = function () {
			var type = this.config.subfix;
			var that=this;
			setTimeout(function (){
				if(!document.getElementById('form_body')){
					$cmp(that.inner).css("padding-top","40%;");
				}else{
					var pHeight=document.getElementById('form_body').offsetHeight;
					var iconHeight=document.getElementById('icon_view').offsetHeight;
					var offset=(pHeight-iconHeight)/2;
                    // 这里窗口高度小于550，padding-top值设为0,主要是解决横屏时，窗口高度过小，导致展示的图标区域显示不全
					$cmp(that.inner).css("padding-top",offset > 0 && window.innerHeight >= 550 ? offset : 0+"px;");
				}
				document.getElementById('icon_view').style.visibility='';
			},200);
			var noteHTML = '<div id="icon_view" style="visibility: hidden"><div style="font-size:80px;" class="' + this.iconCss(type || '') + ' office-content-icon"></div>';
			noteHTML +=
				'<p class="office-content-text cmp-cont-fc">' +
				(this.config.title || $.i18n('commons.label.bodyType', [type])) /* 该正文为xx格式，请点击按钮查看. */ +
				'</p>';
				if(this.config.m3ShowOffice){
					noteHTML +=
						'<button type="button" id="contentBtn" class="office-content-btn cmp-white-bg" style="padding:0!important;width:160px">' +
						$.i18n('commons.view.content') /* 查看 */ +
						'</button>';
				}else{
					noteHTML +=
						'<button type="button" id="contentBtn" class="office-content-btn cmp-white-bg" style="padding:0!important;width:160px;display: none">' +
						$.i18n('commons.view.content') /* 查看 */ +
						'</button>';
				}

			if (cmp.os.ios && $.platform.CMPShell && this.config.isShowLoadViewBtn) {
				noteHTML +=
					'</br><button type="button" id="contentBtnForApp" style="top:6px;padding:0!important;width:160px" class="office-content-btn cmp-white-bg">' +
					$.i18n('commons.content.openForWPS') +
					'</button>';
			}
			noteHTML+="</div>";
			this.inner.innerHTML = noteHTML;
			this.outer.innerHTML = "";
			this.outer.appendChild(this.inner);
			var _this = this;
			// this.inner.querySelector('#contentBtn').addEventListener('tap', function (e) {
			// 	if (!window.contentTimer) {
			// 		showContent();
			// 		window.contentTimer = setTimeout(function() {
			// 			clearTimeout(window.contentTimer);
			// 			window.contentTimer = null;
			// 		}, 10000)
			// 	}else {
			// 		_this.alert("请勿频繁点击!");
			// 	}
			// });

			this.inner.querySelector('#contentBtn').addEventListener('tap', debounce(function(){
				showContent();
			},3000));

			function debounce(fn, wait) {
				var timeout = null;
				return function() {
					var context = this;
					var args = arguments;
					if (timeout) clearTimeout(timeout);
					var callNow = !timeout;
					timeout = setTimeout(function() {
						timeout = null;
					}, wait);
					if (callNow) fn.apply(context, args);
				};
			}

			function showContent(){
				if (window.summaryBO && window.summaryBO.content) {
					var contentType = summaryBO.content.contentType;
					var officeObj = window.contentListComponent ? window.contentListComponent.getOfficeContentObject(summaryBO.content.contentList) : {};
					contentType = window.contentListComponent ? window.contentListComponent.getContentType(officeObj, contentType) : null;
					if(summaryBO.content
						&& summaryBO.pageConfig.canEditContent
						&& contentType !="20"
						&& summaryBO.content.fileId
						&& CollUtils.isCMPShell()
						&& cmp.os.android
						&& summaryBO.summary.govdocType){
						// 调用actionSheet的调用修改正文方法
						seeGovDocContent(function() {
							_this.loadSourceFile(_this, true);
						}, contentType);
					}else {
						if (cmp.os.ios && $.platform.CMPShell) {
							_this.loadSourceFile(_this, false);
						} else {
							_this.loadSourceFile(_this, true);
						}
					}
				} else {
					if (cmp.os.ios && $.platform.CMPShell) {
						_this.loadSourceFile(_this, false);
					} else {
						_this.loadSourceFile(_this, true);
					}
				}
			}

			if (cmp.os.ios && $.platform.CMPShell && this.config.isShowLoadViewBtn) {
				this.inner.querySelector('#contentBtnForApp').addEventListener('tap', function (e) {
					_this.loadSourceFile(_this, true);
				});
			}
		};

		OfficeContent.prototype.loadSourceFile = function (_this, forApp) {
			_this.__initContentToWps(_this, forApp);
		};

		/**
		 * 获取权限需要的v
		 */
		// 有越权问题，接口已废弃不能调用
		// OfficeContent.prototype._fileDigestv = function (callback) {
		// 	var _this = this;

		// 	if (!this.v) {
		// 		var seeyonApi = SeeyonApi || null;
		// 		if(seeyonApi == null) return;

		// 		seeyonApi.Rest.get(
		// 			'attachment/digestv/' + this.config.content,
		// 			{},
		// 			'',
		// 			cmp.extend(
		// 				{},
		// 				{
		// 					success: function (ret) {
		// 						_this.v = ret.data;
		// 						callback.call(_this, ret.data);
		// 					},
		// 					error: function (e) {
		// 						callback.call(_this, '');
		// 					},
		// 				}
		// 			)
		// 		);
		// 	} else {
		// 		callback.call(_this, this.v);
		// 	}
		// };
		/**
		 * 用户临时新正文文件ID的缓存，用于修改正文后判断最新的正文内容
		 * @param contentId
		 */
		OfficeContent.prototype.getContentNewTempIdCache = function () {
			return window.contentNewTempIdCache;
		};

		/**
		 * 获取金山文档中台阅读url地址
		 */
		 OfficeContent.prototype.getKingSoftLightReadUrl = function(params = {},type) {
			var param = {
	            webRoot: params.webRoot
	        }
	        var _url = "/rest/kingsoft/preview/v1/getPreviewUrl";
	        return new Promise(resolve => {
	            cmp.ajax(
	                {
	                    url: params.webRoot + _url,
	                    type: "GET",
	                    data: {
	                        fileId: params.fileId,
	                        fileName: params.fileName + "." + params.fileType,
	                        fileSuffix: params.fileType,
	                        fileCreateDate: ''
	                    },
	                    success: function (res) {
	                        if (res && typeof (res.code) !== "undefined" && res.code === 0) {
	                            resolve(res.data);
	                        } else {
	                            resolve("");
	                        }
	                    },
	                    error: function () {
	                        resolve("");
	                    }
	                }
	            )
	        });
		}

		/**
		 * 获取数科阅读器url地址
		 */
		 OfficeContent.prototype.getLightReadUrl = function(params = {},type) {
			return new Promise((resolve, reject) => {
				cmp.ajax({
					url: `${params.webRoot}/rest/skResource/${type}/url`,
					type: 'POST',
					async: true,
					contentType: 'application/json',
					data: JSON.stringify(params),
					success: function (res) {
					typeof (window.console) != "undefined" && typeof (window.console.log) != "undefined" && window.console.log('=====', res);
					if (res && res.code === 0) {
						resolve(res.data)
					}
					},
					error: function (e) {
					var info = JSON.parse(e.responseText);
					resolve("");
					alert(info.message);
					}
				});
			})
		}

		OfficeContent.prototype.doInitContentDownViewBtn = async function () {

			var dateStr = '';
			var fileCreateDate = '';
			if (typeof this.config.lastModified != 'undefined' && this.config.lastModified) {
				if (this.config.lastModified.length > 10) {
					if(!isNaN(Number(this.config.lastModified))){
						//lastModified 参数一会是字符串一会是数字 真的好烦 做适配
						var date = new Date(Number(this.config.lastModified));
						var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
						var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
						fileCreateDate = date.getFullYear() + '-' + month + '-' + day;
					}
					var a = this.config.lastModified.substring(0, this.config.lastModified.indexOf(' '));
					if (a.length > 5) {
						dateStr = a.replace(/-/g, '');
					}
				}else if(this.config.lastModified.toString().length === 10){
					//lastModified 参数一会是字符串一会是数字 真的好烦 做适配
					if(!isNaN(Number(this.config.lastModified))){
						var date = new Date(Number(this.config.lastModified)*1000);
						var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
						var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
						fileCreateDate = date.getFullYear() + '-' + month + '-' + day;
					}
					this.config.lastModified = this.config.lastModified + "000"; // 补全毫秒
				}
			}
			if(fileCreateDate == ''){
				var date = new Date();
				var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
				var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
				fileCreateDate = date.getFullYear() + '-' + month + '-' + day;
			}
			if (dateStr == '') {
				var nowDate = new Date();
				var month = nowDate.getMonth() + 1 < 10 ? '0' + (nowDate.getMonth() + 1) : nowDate.getMonth() + 1;
				var day = nowDate.getDate() < 10 ? '0' + nowDate.getDate() : nowDate.getDate();
				dateStr = nowDate.getFullYear() + '' + month + '' + day;
			}

			cmp.dialog.loading(true);
			
			var innerHtml = '';
			var __this = this;
			// 放大镜功能
			var dragId = 'jump-main-body';
			var innerHtml =
				'<div id=' +
				dragId +
				' class="cmp-icon see-icon-search"></div>';
			var downLoadHtml;

			window.iframe_afterLoadDoc = async function () {
				// 在线编辑开关
		        var onlineEdit= await OfficeSDK.utils.getConfig("ONLINE_EDIT_ENABLE");
		        var isOnlineEdit = onlineEdit && onlineEdit.value && onlineEdit.value === "true";
				if (isOnlineEdit) {
					__this.config.isOnlineEdit = true;
					await _this.initContentForWebOffice();
					_afterLoadDoc(__this.config.isShowLoadViewBtn, __this.config);


				} else {
					var isWPSWebOffice = cmp.storage.get('isWPSWebOffice', true);
					if (typeof isWPSWebOffice != 'undefined' && isWPSWebOffice != null) {
						__this.config.isWPSWebOffice = JSON.parse(isWPSWebOffice);
						_afterLoadDoc(__this.config.isShowLoadViewBtn, __this.config);
					} else {
						cmp.ajax({
							url: cmp.seeyonbasepath + '/rest/officeTransType/isWps', //判断是否支持wps，由郝齐鹏提供接口
							type: 'GET',
							success: function (data) {
								var isWPSWebOffice = data.data;
								cmp.storage.save('isWPSWebOffice', isWPSWebOffice, true);
								__this.config.isWPSWebOffice = isWPSWebOffice;
								_afterLoadDoc(__this.config.isShowLoadViewBtn, __this.config);
							},
							error: function (e) {
								console.log(e);
								_afterLoadDoc(__this.config.isShowLoadViewBtn, __this.config);
							},
						});
					}
				}
			};
			cmp.dialog.loading(false);
			
      setTimeout(async function() {
			// this._fileDigestv(async function (v) {
				// var vParam = '&v=' + ((window.contentNewTempVCache ? window.contentNewTempVCache : v) || '');
				// var contentId =
				// 	!!this.getContentNewTempIdCache() && this.getContentNewTempIdCache() != '-1'
				// 		? this.getContentNewTempIdCache()
				// 		: this.config.content;

				var newFileName = __this.config.title;
				var newSuffix = __this.config.subfix;
				if (newFileName) {
					//获取后缀名, 替换wps相关文件的后缀名，  ios不认识
					var dotIndex = newFileName.lastIndexOf('.');
					if (dotIndex == -1) {
						newFileName = newFileName + '.' + newSuffix;
					} else {
						var fileSuffix = newFileName.substring(dotIndex + 1);
						if (newSuffix && newSuffix != fileSuffix) {
							//文件名中带有.  实际是没有后缀名的
							newFileName = newFileName + '.' + newSuffix;
						} else {
							newSuffix = fileSuffix;
						}
					}
				}
				// 是否是查看附件文件
				// var isAttachmentFile = __this.config.target == 'attchmentFile';
				
				var	fileSuffix = newSuffix;
				// var fileName = 	contentId;

				if (__this.config.isShowLoadViewBtn) {
					downLoadHtml =
						'<span  id="loadSourceFile" style="float:right;height:40px;line-height:40px;margin-right:4px;color:#297FFB;color: var(--theme-brand6,#297FFB);font-size:14px;">' +
						$.i18n('commons.content.download') +
						'</span>';
				}
				var isLoadSourceFile = document.getElementById('loadSourceFile');
				var container =null;
				if (__this.config.fullScreenId) {
					document.getElementById(__this.config.fullScreenId).innerHTML = innerHtml;
					if (downLoadHtml && !isLoadSourceFile) {
						container = document.createElement('div');
						container.innerHTML = downLoadHtml;
					}
				} else {
					container = document.createElement('div');
					container.innerHTML = innerHtml + (downLoadHtml || '');
				}
				if (container) {
					var element = container.children;
					for (var i = element.length-1; i >=0; i--) {
							if(__this.inner.firstChild){
								__this.inner.insertBefore(element[i], __this.inner.firstChild);
						}else{
								__this.inner.appendChild(element[i]);
						}
					}
				}

					if (__this.inner.querySelector('#loadSourceFile') != null) {
						__this.inner.querySelector('#loadSourceFile').addEventListener('tap', function (e) {
						showReadContent();
					});
				}
				function saveProcessLog(actionId) {
					if (window.summaryBO) {
						var processId = window.summaryBO.summary.processId;
						var subject = window.summaryBO.summary.subject;
						var activityId = window.summaryBO.summary.activityId;
						var data = {
							"processId": processId,
							"activityId": activityId?activityId:0,
							"actionId": actionId,
							"appActionId": 0,
							"userId": "",
							"attType": 0,
							"attName": "",
							"attId": "",
							"oldSecretLevel": "",
							"newSecretLevel": "",
							"processName": subject,
							"folderName": "",
							"category": 4,
							"fileId": "",
							"includeAppLog": true
						}
						cmp.ajax({
							type: 'POST',
							url: cmp.origin + '/rest/workflow/log/processDoLog',
							contentType: 'application/json',
							data: JSON.stringify(data),
							success: function (msg) {

							},
							error: function (e) {

							}
						});
					}
				}

				// 下载查看正文
				function showReadContent(){
					if (window.summaryBO && window.summaryBO.content) {
						var contentType = summaryBO.content.contentType;
						var officeObj = window.contentListComponent ? window.contentListComponent.getOfficeContentObject(summaryBO.content.contentList) : {};
						contentType = window.contentListComponent ? window.contentListComponent.getContentType(officeObj, contentType) : null;
						if(summaryBO.content
							&& summaryBO.pageConfig.canEditContent
							&& contentType !="20"
							&& summaryBO.content.fileId
							&& CollUtils.isCMPShell()
							&& cmp.os.android
							&& summaryBO.summary.govdocType){
								// ofd走优化逻辑
								/*if (contentType == '46') {
									// 调用actionSheet的调用修改正文方法
									seeGovDocContent(function() {
										__this.loadSourceFile(__this, true);
									}, contentType, true);
								} else {
									__this.loadSourceFile(__this, true);
								}*/
								__this.loadSourceFile(__this, true);
						}else {
							if (cmp.os.ios && $.platform.CMPShell) {
								__this.loadSourceFile(__this, false);
							} else {
								// 微协同不支持下载查看ofd文件
								if (cmp.platform.wechatOrDD && contentType === '46') {
									cmp.notification.alert(cmp.i18n("commns.weboffice.ofd.tips"));
								}else {
									__this.loadSourceFile(__this, true);
								}
							}
						}
					} else {
						if (cmp.os.ios && $.platform.CMPShell) {
							__this.loadSourceFile(__this, false);
						} else {
							__this.loadSourceFile(__this, true);
						}
					}
					saveProcessLog(-32)
				}


				//绑定拖拽事件
				var dragDiv = document.getElementById(dragId);
				if (!__this.config.fullScreenId) {
				
					dragDiv.ontouchstart = function drag() {
						dragDiv.ontouchmove= function (e) {
							e && e.preventDefault && e.preventDefault();
							e && e.stopPropagation();
							if (e.targetTouches.length == 1) {
								var touch = e.targetTouches[0];
								var newTop = touch.pageY - 0;
								var newleft = touch.pageX - 16;
								console.log(newTop, newleft);
								var containerDom = document.getElementById('main_text_container_div');
								newleft = Math.max(newleft, 16);
								newleft = Math.min(newleft, containerDom.offsetWidth - 32 - 16);
								var topVal = containerDom.offsetTop;
								newTop = newTop - topVal;
								newTop = Math.max(newTop, 19);
								newTop = Math.min(newTop, containerDom.offsetHeight - 64);
								dragDiv.style.top = newTop + 'px';
								dragDiv.style.left = newleft + 'px';
							}
						};
						document.ontouchend = function () {
							document.ontouchstart = null;
							document.ontouchmove = null;
							document.ontouchend = null;
						};
					};
				}
				//点击打开预览的页面
				if(dragDiv){
					dragDiv.addEventListener('tap',__this.__handleShowDetailPage.bind(__this))
					if (__this.config.defaultFullScreen) {
						__this.__handleShowDetailPage();
						__this.config.defaultFullScreen = false;
					}
				}


			// });
			}, 0);

			// this.outer.innerText = '';
			// this.outer.appendChild(this.inner);
			
		}
		OfficeContent.prototype.__handleShowDetailPage = async function(){
			var __this = this;
			function formatDate13(timestampStr) {
				// 确保timestamp是数字
				var timestamp = Number(timestampStr);
				if (typeof timestamp !== 'number') {
					console.error('The timestamp is not a number');
					return null;
				}

				// 如果是毫秒级的时间戳，转换为秒级
				var date = new Date(timestamp); // 乘以1000转换为毫秒

				// 获取年月日时分秒
				var year = date.getFullYear();
				var month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以需要+1
				var day = String(date.getDate()).padStart(2, '0');
				var hours = String(date.getHours()).padStart(2, '0');
				var minutes = String(date.getMinutes()).padStart(2, '0');
				var seconds = String(date.getSeconds()).padStart(2, '0');
				// 拼接成指定格式

				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			}


			function formatDate10(timestampStr) {
				// 确保timestamp是数字
				var timestamp = Number(timestampStr);
				if (typeof timestamp !== 'number') {
					console.error('The timestamp is not a number');
					return null;
				}

				// 创建Date对象
				var date = new Date(timestamp * 1000); // 注意这里虽然乘以了1000，但因为timestamp已经是秒级，所以实际上没有影响

				// 获取年月日时分秒
				var year = date.getFullYear();
				var month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以需要+1
				var day = String(date.getDate()).padStart(2, '0');
				var hours = String(date.getHours()).padStart(2, '0');
				var minutes = String(date.getMinutes()).padStart(2, '0');
				var seconds = String(date.getSeconds()).padStart(2, '0');

				// 注意：这里使用了toLocaleString来根据本地时区获取小时（12小时制或24小时制）
				// 如果需要固定为24小时制，可以直接使用getHours()方法如上所示
				// 如果需要考虑时区，可以引入专门的库，如moment.js

				// 拼接成指定格式
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			}
			var createDate = "";
			if(__this.config.lastModified && __this.config.lastModified.length === 13){
				createDate = formatDate13(__this.config.lastModified);
			}else if(__this.config.lastModified && __this.config.lastModified.length === 10){
				createDate = formatDate10(__this.config.lastModified);
			}else {
				createDate = __this.config.lastModified;
			}
			// 打开文件的相关参数
			if (__this.config.subfix === '') {
				__this.config.subfix = __this.app.WORD_BODY_TYPES ? __this.app.WORD_BODY_TYPES[__this.config.bodyType] :'doc';
			}
      var isCanEdit = (summaryBO && summaryBO.pageConfig && summaryBO.pageConfig.canEditContent) ? true : false; 
			const openParams = {
				fileId: __this.config.content,
				webRoot: cmp.seeyonbasepath,
				originalFileId:'',
				readNewFile: false,
				fileType: __this.config.subfix.toLowerCase(),
				fileName: __this.config.title, //文件另存为文件名
				canEdit:false, //通过transforPermission获取
				canSign: false,
				createDate:createDate,
        summaryBO: isCanEdit ? summaryBO : {},
        pageX: isCanEdit ? pageX : {},
			};
      console.log("window summaryBO:", window.summaryBO, "summaryBO:", summaryBO)
			cmp.href.next(__m3_v5_commons_path__ + '/html/draftPreview.html', openParams , {openWebViewCatch: 1});
			window._CMPBackNotReload = false;
		}
		OfficeContent.prototype.__initContentToWps = function (_this, forApp) {
			var suffixMap = {
				wps: 'doc',
				et: 'xls',
			};

			var newFileName = _this.config.title.replace(/\n/g, "");
			var newSuffix = _this.config.subfix; //suffixMap[_this.config.subfix] ||

			if (newFileName) {
				//获取后缀名, 替换wps相关文件的后缀名，  ios不认识
				var dotIndex = newFileName.lastIndexOf('.');
				if (dotIndex == -1) {
					newFileName = newFileName + '.' + newSuffix;
				} else {
					var fileSuffix = newFileName.substring(dotIndex + 1);
					if (newSuffix && newSuffix != fileSuffix) {
						//文件名中带有.  实际是没有后缀名的
						newFileName = newFileName + '.' + newSuffix;
					} else {
						newSuffix = fileSuffix;
					}
				}
			}
			var fileName = newFileName || cmp.i18n('commons.label.defTitle') + _this.config.content + '.' + newSuffix;

			// 封装ajax请求
			function sendAjaxRequest(url, postData, successCallback, errorCallback) {
				cmp.ajax({
					url: url,
					type: 'POST',
					data: JSON.stringify(postData),
					success: successCallback,
					error: errorCallback
				});
			}

			// 处理文件打开逻辑
			function handleFileOpen(opt, newSuffix, forApp) {
				if (cmp.os.ios) {
					if (forApp) {
						$.att.openByThirdApp(opt); //ios的第三方APP打开的接口
					} else if (newSuffix && suffixMap[newSuffix.toLowerCase()]) {
						//et 和WPS格式
						_this.getAuthKey(function (authKey) {
							if (authKey && authKey.officeAuth == 'true' && authKey.iosWpsKey) {
								_this.openFileByWPS(_this, fileName, newSuffix, authKey);
							} else {
								$.att.openByThirdApp(opt); //ios的第三方APP打开的接口
							}
						});
					} else {
						if ("ofd" === newSuffix) {
							_this.dealOFd(opt);
						} else {
							$.att.read(opt);
						}
					}
				} else {
					//福昕ofd不提示下载
					if ("ofd" === newSuffix) {
						_this.dealOFd(opt);
					} else {
						// 打开普通文件
						$.att.read(opt);
					}
				}
			}

			// 添加事件
			if ($.platform.CMPShell) {
				var opt = _this.openFileParams(_this, fileName, newSuffix);
				var postData = {
					documentInfo: { fileId: _this.config.content, fileType: newSuffix }
				};

				sendAjaxRequest(
					cmp.seeyonbasepath + '/rest/office/file/decryptSeal',
					postData,
					function (res) {
						if (res.code === 0 && res.data) {
							opt = _this.openFileParamsDecryptSeal(opt, res.data.fileId);
						}else if (res.code === -1) {
							cmp.notification.alert(res.message, null, " ", cmp.i18n('commons.label.ok'));
							cmp.dialog.loading(false);
							return;
						}
						handleFileOpen(opt, newSuffix, forApp);
					},
					function (e) {
						console.log(e);
						handleFileOpen(opt, newSuffix, forApp);
					}
				);
			} else {
				newFileName = fileName;
				var dotIndex = newFileName.lastIndexOf('.');
				if (dotIndex != -1) {
					// 微协同要转换格式
					var pureName = newFileName.substring(0, dotIndex);
					var fileSuffix = newFileName.substring(dotIndex + 1);
					if (fileSuffix) {
						for (var subType in suffixMap) {
							if (fileSuffix.toLowerCase() == subType) {
								fileName = pureName + '.' + suffixMap[subType];
								break;
							}
						}
					}
				}

				var srcFileName = fileName || cmp.i18n('commons.label.defTitle') + _this.config.content + '.' + newSuffix;
				var opt = _this.openFileParams(_this, srcFileName, newSuffix);

				var postData = {
					documentInfo: { fileId: _this.config.content, fileType: newSuffix }
				};

				sendAjaxRequest(
					cmp.seeyonbasepath + '/rest/office/file/decryptSeal',
					postData,
					function (res) {
						if (res.code === 0 && res.data) {
							opt = _this.openFileParamsDecryptSeal(opt, res.data.fileId);
						}else if (res.code === -1) {
							cmp.notification.alert(res.message, null, " ", cmp.i18n('commons.label.ok'));
							cmp.dialog.loading(false);
							return;
						}
						$.att.read(opt);
					},
					function (e) {
						console.log(e);
						$.att.read(opt);
					}
				);
			}
		};
		OfficeContent.prototype.dealOFd=function (opt){
			//初始化是否使用福昕ofd
			if(window.top.isFoxit==null){
				OfdSummaryApi.getOfdAuthKey(function (res){
					window.top.isFoxit=res.ofdAuth&&res.reader==="fx";
					if(window.top.isFoxit){
						cmp.notification.toast(cmp.i18n('commons.ofd.foxit.nosupport'),'bottom','',2000);
						cmp.dialog.loading(false);
					}else{
						$.att.read(opt);
					}
				})
			}else if(window.top.isFoxit){
				cmp.notification.toast(cmp.i18n('commons.ofd.foxit.nosupport'),'bottom','',2000);
				cmp.dialog.loading(false);
			}else {
				$.att.read(opt);
			}
		}
		OfficeContent.prototype.openFileByWPS = function (_this, fileName, newSuffix, authKey) {
			var option = _this.openFileParams(_this, fileName, newSuffix);
			if (authKey && authKey.iosWpsKey && cmp.os.ios) {
				option.extData.iOSWpsKey = authKey.iosWpsKey;
			}
			//openWpsByJinge方法中原生存在loading图标,因此在这里先关闭,不然会出现两个加载中图标
			cmp.dialog.loading(false);
			cmp.att.openWithWps(
				option,
				function (e) {
					//成功回调
				},
				function (err) {
					//失败回调
					if (err.code == 17002) {
						_this.alert($.i18n('commons.note.file.notorremoved'));
					} else if (err.code == 500) {
						if (err.message) {
							_this.alert(err.message);
						} else {
							_this.alert($.i18n('commons.server.error.tip'));
						}
					} else {
						_this.alert($.i18n('commons.note.readcontenterror', [JSON.stringify(err)])); //读取正文失败, 请稍重试.错误信息:
					}
				}
			);
		};

		OfficeContent.prototype.getAuthKey = function (callback) {
			var seeyonApi = SeeyonApi || null;
			if(seeyonApi == null) return;
			seeyonApi.Rest.post(
				'editContent/getOfficeAuthKey',
				{},
				'',
				cmp.extend(
					{},
					{
						success: function (ret) {
							callback(ret);
						},
						error: function (e) {
							console.info('查询授权出错----------');
						},
					}
				)
			);
		};

		OfficeContent.prototype.openFileParams = function (_this, fileName, newSuffix) {
			// IOS 端[]这个符号会被转义两次 传到服务器去也是 [], 服务器不认识
			var downFilePath =
				$.origin + '/rest/attachment/v_file/' + _this.config.content + '?fileName=' + encodeURI(fileName.replace(/[\[\]]/g, ''));
			var moduleType = _this.config.moduleType; //1:协同，6:会议/会议纪要，7:公告，8:新闻
			var canPrint = false;
			if ('1' == moduleType) {
				canPrint = summaryBO.pageConfig.nodeActions.indexOf('Print') != -1; //协同-权限：基础
			} else if ('6' == moduleType) {
				canPrint = true; //会议/会议纪要默认都打印
			} else if ('7' == moduleType) {
				canPrint = _this.config.ext2 == '1'; //显示打印,0:不打印，1：打印
			} else if ('8' == moduleType) {
				canPrint = _this.config.state == '30' || true; //30：已发布（手机端可以默认全部显示打印，都是已发布的）
			}

			var option = {
				path: downFilePath,
				filename: fileName,
				from: _this.config.appName || '',
				reload:false,
				extData: {
					fileId: _this.config.content,
					lastModified: _this.config.lastModified,
					isClearTrace: true,
					origin: $.origin,
					download: _this.config.canDownLoad === false ? '0' : '1', // 控制M3 IOS端是否能下载
					canPrint: canPrint, //是否显示打印（数科）
				},
			};

			option.success = function (res) {
				cmp.dialog.loading(false);
			};

			option.error = function (err) {
				cmp.dialog.loading(false);

				if (err.code == 17002) {
					_this.alert($.i18n('commons.note.file.notorremoved'));
				} else if (err.code == 500) {
					if (err.message) {
						_this.alert(err.message);
					} else {
						_this.alert($.i18n('commons.server.error.tip'));
					}
				} else {
					_this.alert($.i18n('commons.note.readcontenterror', [JSON.stringify(err)])); //读取正文失败, 请稍重试.错误信息:
				}
			};

			cmp.dialog.loading();

			if (typeof summaryBO != 'undefined') {
				//如果当前修改过正文，取修改正文后的文件，但是多正文中版式文件路径不能替换成修改正文之后的文件
				if(summaryBO.content && summaryBO.content.contentList){
					var contentList = summaryBO.content.contentList;
					var contentCount = 0; // 正文数量
					if (contentList.length >= 2) {
						for (var i = 0; i < contentList.length; ++i) {
							if (contentList[i].isOffice) {
								contentCount++;
							}
						}
					}
					// 多正文中版式文件路径不用替换
					if (contentCount > 1 && (newSuffix == 'ofd' || newSuffix == 'pdf')) {
						return option;
					}
				}

				if (summaryBO.editParam && summaryBO.editParam.filepath) {
					option.path = summaryBO.editParam.filepath;
				}
			}

			return option;
		};

		OfficeContent.prototype.openFileParamsDecryptSeal = function (option, fileId) {
			// IOS 端[]这个符号会被转义两次 传到服务器去也是 [], 服务器不认识
			option.path = $.origin + '/rest/attachment/v_file/' + fileId + '?fileName=' + encodeURI(option.filename.replace(/[\[\]]/g, ''));
			option.extData.fileId = fileId;
			return option;
		};
		//参照的cmp-att.js
		OfficeContent.prototype.iconCss = function (type) {
			type = type.toLowerCase();
			var className = 'cmp-icon-document ';
			switch (type) {
				case 'gif':
				case 'jpg':
				case 'jpeg':
				case 'bmp':
				case 'png':
					className += 'img';
					break;
				case 'txt':
					className += 'txt';
					break;
				case 'doc':
				case 'docx':
					className += 'doc';
					break;
				case 'xls':
				case 'xlsx':
					className += 'xls';
					break;
				case 'ppt':
				case 'pptx':
					className += 'ppt';
					break;
				case 'pdf':
					className += 'pdf';
					break;
				case 'xml':
					className += 'xml';
					break;
				case 'html':
				case 'htm':
				case 'xhtml':
					className += 'html';
					break;
				case 'et':
					className += 'et';
					break;
				case 'wps':
					className += 'wps';
					break;
				case 'mp3':
				case 'rm':
				case 'wav':
				case 'wma':
				case 'mp4':
				case 'amr':
					className += 'music';
					break;
				case '3gp':
				case 'rmvb':
				case 'avi':
					className += 'video';
					break;
				case 'collaboration': // 协同应用
					className += 'synergy';
					break;
				case 'form': // 表单
					className += 'squares';
					break;
				case 'edoc': // 公文
					className += 'flag';
					break;
				case 'plan': //计划
					className += 'cal';
					break;
				case 'meeting': // 会议
					className += 'meet';
					break;
				case 'bulletin': // 公告
					className += 'minvideo';
					break;
				case 'news': // 新闻
					className += 'news';
					break;
				case 'bbs': //讨论
					className += 'message';
					break;
				case 'inquiry': //调查
					className += 'confirm';
					break;
				case 'link': //映射文件
					className += 'link';
					break;
				case 'zip': //zip
				case 'rar':
					className += 'rar';
					break;
				case 'cvs':
					className += 'cvs';
					break;
				case '':
					className += 'synergy';
					break;
				case 'ofd':
					className += 'ofd';
					break;
				default:
					className += 'emptyfile';
					break;
			}
			return className;
		};

		OfficeContent.prototype._listener = function (e) {
			if (this.config.onScrollBottom) {
				this.outer.addEventListener('touchstart', this);
				this.outer.addEventListener('touchmove', this);
				this.outer.addEventListener('touchend', this);
			}
		};

		OfficeContent.prototype.handleEvent = function (e) {
			switch (e.type) {
				case 'touchstart':
					this._touchstart(e);
					break;
				case 'touchmove':
					this._touchmove(e);
					break;
				case 'touchend':
					this._touchend(e);
					break;
				default:
					break;
			}
		};

		/**
		 * 打印
		 */
		OfficeContent.prototype.print = function (params, fn, scope) {
			// V5-9014【金山预览】移动端M3，word正文的协同，移动端打印时，打印预览出现痕迹
			// 暂时屏蔽打印功能
			fn.apply(scope);
			cmp.notification.toast(cmp.util.i18n.getValue('cmp.notification.printNotSup'), 'center');
			return;
			var suffixMap = {
				wps: 'doc',
				et: 'xls',
			};
			var newFileName = this.config.title;
			var newSuffix = suffixMap[this.config.subfix] || this.config.subfix;
			var fileName = newFileName || cmp.i18n('commons.label.defTitle') + '.' + newSuffix;

			if (!/pdf/i.test(newSuffix) && cmp.os.android) {
				// android打印office 需要转换成pdf
				var date = this.config.lastModified ? new Date(this.config.lastModified).getTime() : new Date().getTime();
				var url = $.origin + '/rest/product/trans/document2Pdf?fileId=' + this.config.content + '&fileCreateDate=' + date;
				_print(url, 'pdf', fn, scope);
			} else {
				// IOS可以直接打印
				var url = $.origin + '/rest/attachment/file/' + this.config.content + '?fileName=' + encodeURI(fileName);
				_print(url, newSuffix, fn, scope);
			}
		};

		OfficeContent.prototype.getPrintParam = function (params, fn, scope) {
			var suffixMap = {
				wps: 'doc',
				et: 'xls',
			};
			var newFileName = this.config.title;
			var newSuffix = suffixMap[this.config.subfix] || this.config.subfix;
			var fileName = newFileName || cmp.i18n('commons.label.defTitle') + this.config.content + '.' + newSuffix;

			if (!/pdf/i.test(newSuffix) && cmp.os.android) {
				// android打印office 需要转换成pdf
				var date = this.config.lastModified ? new Date(this.config.lastModified).getTime() : new Date().getTime();
				var url = $.origin + '/rest/product/trans/document2Pdf?fileId=' + this.config.content + '&fileCreateDate=' + date;
			} else {
				// IOS可以直接打印
				var url = $.origin + '/rest/attachment/v_file/' + this.config.content + '?fileName=' + encodeURI(fileName);
			}
			if (fn) {
				fn.call(scope || this, {
					path: url,
					fileType: newSuffix,
				});
			}
		};

		OfficeContent.prototype.refresh = function () {
			this.initContent();
		};
		return OfficeContent;
	})(Content);

	/**
	 * 转发表单协同
	 */
	var ForwardFormContent = (function (superClass) {
		extend(ForwardFormContent, superClass);

		function ForwardFormContent() {
			return ForwardFormContent.__super__.constructor.apply(this, arguments);
		}

		/**
		 * 初始化正文
		 */
		ForwardFormContent.prototype.initContent = function () {
			var _this = this;
			LazyUtil.addLoadedFn('lazy_form', function () {
				//表单
				var options = {
					containerId: _this.config.target, //渲染的div根节点id
					moduleId: _this.config.content,
					moduleType: _this.config.moduleType,
					rightId: _this.config.ext.rightId,
					viewState: _this.config.ext.viewState,
					allowQRScan: false,
					indexParam: '0',
					affairId: _this.config.ext.affairId || '-1',
					templateType: 'lightForm',
				};

				if (_this.config.onScrollBottom) {
					options.onScrollBottom = _this.config.onScrollBottom;
				}

				if (_this.config.onScroll) {
					options.onScroll = _this.config.onScroll;
				}

				$.sui.loadForm(options, function () {
					_this.fire('load');
				});
			});
		};

		/**
		 * 打印
		 */
		ForwardFormContent.prototype.print = function (params, fn, scope) {
			cmp.sui.getPdfFormat(function (pdfPath) {
				if (pdfPath) {
					_print(pdfPath, 'pdf', fn, scope);
				} else {
					// cap那边有失败提示语
					if (fn) {
						fn.call(scope || this);
					}
				}
			});
		};
		ForwardFormContent.prototype.getPrintParam = function (params, fn, scope) {
			cmp.sui.getPdfFormat(function (pdfPath) {
				if (fn) {
					fn.call(scope || this, {
						path: pdfPath,
						fileType: 'pdf',
					});
				}
			});
		};

		return ForwardFormContent;
	})(Content);

	/**
	 * 第三方正文
	 */
	var ThirdContent = (function (superClass) {
		extend(ThirdContent, superClass);

		function ThirdContent() {
			return ThirdContent.__super__.constructor.apply(this, arguments);
		}

		/**
		 * 初始化正文
		 */
		ThirdContent.prototype.initContent = function () {
			// 第一种方式采用iframe的方式
			var innerHtml = null;
			var me = this;
			if (this.config.content) {
				var content = $.parseJSON(this.config.content);

				if ('IFRAME' == content.renderType) {
					// iframe模式
					var url = content.url;
					// 以http、https开头的url直接呈现，否则以/开始的拼接上应用路径
					if (url && !url.startsWith('http')) {
						url = cmp.origin + url;
					}
					innerHtml =
						'<iframe  id="thirdContent" style="border:0;width:100%;height:100%;" scrolling="auto" src="' + url + '"></iframe>';
					me._addContent(innerHtml);
				} else {
					// 自定义实现

					var cmpFilePrefix = content.cmpFilePrefix;
					var wechatFilePrefix = content.wechatFilePrefix;
					var jsFilePath = content.jsFilePath;

					if ($.platform.CMPShell) {
						// CMP 壳
						jsFilePath = cmpFilePrefix + jsFilePath;
					} else {
						jsFilePath = wechatFilePrefix + jsFilePath;
					}

					LazyUtil.addLazyStack({
						code: 'lazy_third_content',
						groups: 'lazy_third_content',
						js: [jsFilePath],
					});
					LazyUtil.startLazy('lazy_third_content');
					LazyUtil.addLoadedFn('lazy_third_content', function () {
						var namespace = content.namespace;
						var methodName = content.methodName;
						var params = content.extParam;
						window[namespace][methodName](params, function (html) {
							me._addContent(html);
						});
					});
				}
			}
		};

		ThirdContent.prototype._addContent = function (htmlContent) {
			this.inner = document.createElement('DIV');

			this.inner.innerHTML = htmlContent;

			this.outer.appendChild(this.inner);
			// 释放正文内容内存
			this.config.content = null;
			// 刷新正文内容，计算高度宽度等
			this.refresh(true);

			// 触发加载完成
			this.fire('load');
		};

		/**
		 * 刷新列表
		 */
		ThirdContent.prototype.refresh = function (isInit) {
			if (!this.outerWidth) {
				this.outerWidth = this.outer.clientWidth;

				if (this.outerWidth != 0) {
					var innerMinWidth = this.clientWidth ? this.clientWidth + 'px' : this.outerWidth;
					if (this.outerWidth == 0) {
						innerMinWidth = '100%';
					}

					this.inner.style.minWidth = innerMinWidth;
					if (this.config.padding) {
						this.inner.style.padding = this.config.padding + 'px';
					}

					var _this = this;
					setTimeout(function () {
						// 有表格的时候浏览器布局有问题
						_this.innerWidth = _this.inner.offsetWidth;

						_this.innerHeight = Math.max(_this.inner.offsetHeight, _this.outer.clientHeight);
						if (_this.innerHeight > 0) {
							// 有内容的时候，设置container样式，这样标准正文才能正常滑动。
                            _this.inner.style.height = "100%";
							_this.inner.style.overflow = "scroll";
						}
					}, 100);
				}
			}
		};

		return ThirdContent;
	})(Content);
	return new App();
})(cmp);

/**
 * HTML片段查看器
 */
var HTMLViewer = (function ($, win) {
	/**
	 *
	 * config.type : html/img
	 *
	 * config.html : html片段， type为html时使用
	 * config.imgSrc : 图片src, type为img时使用
	 * config.width : 原始宽度
	 * config.height : 原始高度
	 *
	 */
	var Viewer = function (config) {
		var blockdiv,
			innerDiv,
			html,
			winW,
			winH,
			scaleSize = 1,
			iScroll,
			_this = this;

		winW = document.documentElement.clientWidth;
		winH = document.documentElement.clientHeight;

		html = config.html;

		blockdiv = document.createElement('div');
		blockdiv.className = 'content-viewer content-widget cmp-white-bg';
		with (blockdiv.style) {
			width = winW + 'px';
			height = winH + 'px';
		}

		document.body.appendChild(blockdiv);

		innerDiv = document.createElement('div');
		innerDiv.className = 'content-viewer-scorller';

		if (typeof html === 'string') {
			innerDiv.innerHTML = html;
		} else {
			innerDiv.appendChild(html);
		}
		blockdiv.appendChild(innerDiv);

		//居中显示
		var innerHeight = innerDiv.offsetHeight;
		var innerWidth = innerDiv.offsetWidth;

		var paddingTB = 20,
			paddingLR = 0;
		if (innerHeight + paddingTB * 2 < winH) {
			paddingTB = (winH - innerHeight) / 2;
		}
		if (innerWidth < winW) {
			paddingLR = (winW - innerWidth) / 2;
		}
		innerDiv.style.padding = paddingTB + 'px ' + paddingLR + 'px';

		if (innerWidth > winW) {
			//缩放比列
			scaleSize = Math.floor((winW / innerWidth) * 10000) / 10000.0; //保留四位有效数字
		}
		iScroll = new IScroll(blockdiv, {
			zoom: true,
			zoomMin: scaleSize,
			zoomMax: 5,
			startZoom: 1,
			disableMouse: true,
			disablePointer: true,
			// INSERT POINT: OPTIONS
			disableTouch: false, //utils.hasPointer || !utils.hasTouch,
			scrollY: true,
			scrollX: true,
			momentum: true,
			bounce: false,
		});

		/*iScroll.on("zoomEnd", function(e){
            console.log("缩放情况：" + iScroll.maxScrollY + ", " + iScroll.maxScrollX);
        });*/

		//向cmp压堆栈
		cmp.backbutton.push(function () {
			_this.destory();
		});
		this.init = function () {
			blockdiv.addEventListener('tap', this);
		};
		this.destory = function () {
			//cmp 返回键注销事件
			cmp.backbutton.pop();

			blockdiv.removeEventListener('type', this);
			blockdiv.remove();
			iScroll.destroy();

			blockdiv = null;
			innerDiv = null;
			iScroll = null;
			_this = null;
		};

		/**
		 * 处理事件
		 */
		this.handleEvent = function (e) {
			switch (e.type) {
				case 'tap':
					e.stopPropagation();
					this.destory();
					break;
				default:
					break;
			}
		};

		this.init();
	};

	return Viewer;
})(cmp);

/**
 * 图片预加载组件
 *
 * Api
 *
 * SeeyonImgReady.load(config) 预加载一张图片
 * SeeyonImgReady.loadAll(config) 批量预加载图片
 * SeeyonImgReady.getImgs(groupKey) 获取图片数组
 *
 */
var SeeyonImgReady = (function ($) {
	var ImgLoader = function (config, group) {
		this.img = null;
		this.config = config;
		this.width = 0;
		this.height = 0;
		this.loaded = false;
		this.isError = false;
		this.group = group;

		/**
		 * 加载图片
		 */
		this.loadImg = function () {
			var _this = this;

			this.img = new Image();
			this.img.onerror = function () {
				_this.error();
			};

			this.img.onload = function () {
				_this.load();
			};

			this.img.src = this.config.src;

			// 如果图片被缓存，则直接返回缓存数据
			if (this.img.complete) {
				this.load();
				return;
			}
		};

		this.load = function () {
			if (this.img) {
				this.width = this.img.width;
				this.height = this.img.height;
			}

			var ret = this.finish();

			if (this.config.load) {
				this.config.load(this, ret);
			}
		};

		this.error = function () {
			this.isError = true;
			var ret = this.finish();
			if (this.config.error) {
				this.config.error(this, ret);
			}
		};

		this.finish = function () {
			this.loaded = true;
			this.destoryImg();

			var finish = true;

			if (this.group) {
				for (var i = 0; i < this.group.length; i++) {
					if (!this.group[i].loaded) {
						// 还有图片没有加载完
						finish = false;
						break;
					}
				}
			}

			return finish;
		};

		this.destoryImg = function () {
			this.img = this.img.onload = this.img.onerror = null;
		};
	};

	var ImgReady = function () {
		// 预加载进行分组
		this.imgList = {};

		/**
		 * 加载图片
		 * config.src {String} 图片路径
		 * config.load(config) {Function} 加载完毕
		 * config.error(config) {Function} 加载错误
		 */
		this.addImg = function (loadKey, config) {
			var list = this.imgList[loadKey];
			if (!list) {
				list = [];
			}

			var imgLoader = new ImgLoader(config, list);

			list.push(imgLoader);
			this.imgList[loadKey] = list;
		};

		/**
		 * 获取图片数组
		 */
		this.getImgs = function (loadKey) {
			return this.imgList[loadKey];
		};

		/**
		 * 批量加载图片
		 */
		this.addAllImg = function (loadKey, configs) {
			if (configs && configs.length > 0) {
				for (var i = 0; i < configs.length; i++) {
					this.load(loadKey, configs[i]);
				}
			}
		};

		this.load = function (loadKey) {
			var list = this.imgList[loadKey];
			if (list) {
				for (var i = 0; i < list.length; i++) {
					if (!list[i].loaded) {
						list[i].loadImg();
					}
				}
			}
		};
	};

	return new ImgReady();
})(cmp);
