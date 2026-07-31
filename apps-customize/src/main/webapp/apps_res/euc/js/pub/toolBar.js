/**
 * 对toolbar的封装 根据菜单id生成toolbar对象，并对插件的存在性做了统一判定；
 * 
 * @param id toolbar的div的id
 * @param items 数组，对应argsBuilder中的_toolbarDefault对象的id
 * @returns toolbar对象 测试参考： pageX.tBar = toolBar().addAll(["new", "edit", "del"]);
 */
function toolBar(id) {
    var tBar = {
    	"id" : id,
        "init" : init,
        "addAll" : addAll,
        "argsBuilder" : argsBuilder,
        "items" : new ArrayList(),
        "toolBar" : null,
        "tArg":null
    };
    
    function defaultArgs() {
        return {
            "new": {"id":"new","name":"新建","className" : "ico16","click" : function(){fnNew();}},
            "edit":{"id":"edit","name":"编辑","className" : "ico16 editor_16",click : function(){fnEdit();}},
            "modify" : {"id" : "modify","name" : "修改","className" : "ico16 editor_16","click" : function(){fnModify();}},
            "del" : {"id" : "del","name" : "删除","className" : "ico16 del_16","click" :function(){fnDel();}},
            "print" : {"id" : "print","name" : "打印","className" : "ico16 print_16",click :function(){fnPrint();}},
            "export" : {"id" : "export","name" : "导出","className" :"ico16 export_excel_16","click" :function(){fnExp();}},
            "imp" : {"id" : "imp","name" : "导入","className" :"ico16 import_16","click" :function(){fnImp();}},
            "showPending" : {"id" : "showPending","name" : "待办","className" :"ico16 editor_16","click" :function(){showPending();}},
            "showDone" : {"id" : "showDone","name" : "已办","className" :"ico16 editor_16","click" :function(){showDone();}},
            "templateDown" : {"id" : "templateDown","name" : "模板下载","className" :"ico16 text_type_template_16","click" :function(){templateDown();}},
            "imp2exp" :{id : "imp2exp","name" : "批量操作","className" : "ico16 import_16",
            	 "subMenu" :[{"name": "模板下载","click": function(){downTemplate();}},
            	             {"name": "导入","click":function(){fnImp();}},
						     {"name": "导出","click": function(){fnExp();}    }]}  
        };
    }

    function init(fnItems) {
        tBar.toolBar = $("#" + id).toolbar(argsBuilder(fnItems));
        return tBar;
    }

    /**
     * 菜单参数构造器的便捷方法，可以多次增加菜单项数组，用于动态增加菜单项
     * @param items 菜单项id的数组
     * @returns 菜单对象_toolBar
     */
    function addAll(items) {
		if (items instanceof String) {
			tBar.items.add(items);
		} else if (items instanceof Array) {
			tBar.items.addAll(items);
		}
		return tBar;
	}

    /**
	 * toolbar的参数构造器
	 * 
	 * @param items
	 *            菜单项的id数组
	 * @returns toolbar的参数数组
	 */
    function argsBuilder(toolBarArgs) {
        var _toolbarDefault = defaultArgs();
        if(toolBarArgs instanceof Function){
        	_toolbarDefault = _toolBarArgs = $.extend(true , _toolbarDefault , toolBarArgs());
        }
        var _items = new ArrayList();
        var items = tBar.items.toArray();
        // 解析参数，构造参数对象，在构造过程中，对office插件判定判定
        for (var int1 = 0; int1 < items.length; int1++) {
            // 如果是string类型，则表示存放id，如果是object或者数组类型，表示存放的是构造参数
            var item = items[int1];
            if (typeof (item) === "string") {
                if (_toolbarDefault[item]) {
                    _items.add(_toolbarDefault[item]);
                } else {
                    $.alert("[id=" + item + "] 未在officeToolbar.js中注册！");
                }
            } else if (typeof (item) === "object") {// 处理新建时插件的判定以及其它的规则
                // 第一个属性为父菜单，第二个属性为子菜单值
                for (var menuName in item) {
                    var childMenu = _toolbarDefault[menuName];
                    if (childMenu) {
                        var aChildMenus = item[menuName];// 子菜单数组
                        if (typeof (aChildMenus) === "object" && (aChildMenus instanceof Array) && aChildMenus.length > 0) {
                            var childMenuArray = new ArrayList();
                            for ( var int2 = 0; int2 < aChildMenus.length; int2++) {
                                var sChildMenuName = aChildMenus[int2];
                                if (_toolbarDefault[sChildMenuName]) {
                                    // 插件判定
                                    childMenuArray.add(_toolbarDefault[sChildMenuName]);
                                } else {
                                    $.alert("[id=" + menuName + "] 未在officeToolbar.js中注册！");
                                }
                            }

                            if (childMenuArray.size() > 0) {
                                childMenu.subMenu = childMenuArray.toArray();
                            }
                        } else {
                            $.alert("子菜单数据格式错误，需要格式为{父菜单id:[子菜单id非空列表]}！");
                        }
                        _items.add(childMenu);// 增加subMenu属性
                    } else {
                        $.alert("[id=" + menuName + "] 未在officeToolbar.js中注册！");
                    }
                }
            } else {// 根据平台规则，自定义参数
                _items.add(item);
            }
        }
        

		if (items.length == 0 && toolBarArgs instanceof Function) {
        	var datas = toolBarArgs();
        	for ( var n in datas) {
        		_items.add(datas[n]);
			}
        }
        
        var _toolBarArgs = {
            "toolbar" : _items.toArray(),
            "isPager" : false
        };
        
        if(toolBarArgs instanceof Array){
        	_toolBarArgs = $.extend(true , _toolBarArgs , toolBarArgs);
        }        
        return _toolBarArgs;
    }
    return tBar;
}