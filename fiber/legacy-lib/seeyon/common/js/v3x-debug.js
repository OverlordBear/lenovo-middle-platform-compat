var messageRegEx_0 = /\{0\}/g;
var messageRegEx_1 = /\{1\}/g;
var messageRegEx_2 = /\{2\}/g;
var messageRegEx_3 = /\{3\}/g;
var messageRegEx_4 = /\{4\}/g;
var messageRegEx_5 = /\{5\}/g;
var messageRegEx_6 = /\{6\}/g;
var messageRegEx_7 = /\{7\}/g;
var messageRegEx_8 = /\{8\}/g;
var messageRegEx_9 = /\{9\}/g;
var messageRegEx_10 = /\{10\}/g;
var messageRegEx_11 = /\{11\}/g;
var messageRegEx_12 = /\{12\}/g;
var messageRegEx_13 = /\{13\}/g;
var messageRegEx_14 = /\{14\}/g;
var messageRegEx_15 = /\{15\}/g;

var portalOfA8IframeStr = "top.frames['frame_A8']";

var useWebOffice = false;
var canUseWebOffice = false;

/**
 * author liaojl
 * 此方法同时存在于front_common.js、v3x.js、v3x-debug.js，分别供首页、老模块（公文、会议、文档中心等）、新模块使用，如要修改，请同步更新
 * thisWindowZindex 默认值从600开始，页面元素的z-index应该控制在600以下
 * 根据现有的最高z-index层级计算出新的值
 * 不传值或传入1，默认增长1位
 * 传入的值>1 则按照传入的值留出空位，并返回原来的值+1
 * antd 气泡框1030的基数
 *
 *
 **/
var thisWindowZindex = 1030;
var getPageMaxIndex = function () {
    var currentIndex = thisWindowZindex;
    var DomList = [].slice.call(getCtpTop().document.getElementsByTagName('*'));
    for (var i = 0, len = DomList.length; i < len; i++) {
        var curZIndex = Number($(DomList[i]).css('z-index'));
        if (/^\d+$/.test(curZIndex)) {
            if (curZIndex > currentIndex)
                currentIndex = curZIndex;
        }
    }
    var currentDomList = [].slice.call(document.getElementsByTagName("*"));
    for (var j = 0, len = currentDomList.length; j < len; j++) {
        var curDocZIndex = Number($(currentDomList[j]).css('z-index'));
        if (/^\d+$/.test(curDocZIndex)) {
            if (curDocZIndex > currentIndex)
                currentIndex = curDocZIndex;
        }
    }
    // 特殊处理获取的情况
    thisWindowZindex = currentIndex;
    return currentIndex;
};

var getMaxZindex = function (increaseNum) {
    if (typeof (increaseNum) != "undefined") {
        increaseNum = Number(increaseNum);
        if (isNaN(Number(increaseNum))) $.alert($.i18n('v3x.getMaxZindex.msg'));
    }
    if (typeof (increaseNum) == "undefined" || increaseNum == 1) {
        thisWindowZindex = thisWindowZindex + 1;
        return thisWindowZindex;
    } else {
        thisWindowZindex = thisWindowZindex + increaseNum;
        return (thisWindowZindex - increaseNum + 1);
    }
}

/**
 * 扩展其它浏览器DOM元素的outerHTML属性
 */
if (!window.ActiveXObject) {
    if (typeof (HTMLElement) != "undefined") {
        HTMLElement.prototype.__defineSetter__("outerHTML", function (s) {
            var r = this.ownerDocument.createRange();
            r.setStartBefore(this);
            var df = r.createContextualFragment(s);
            this.parentNode.replaceChild(df, this);
            return s;
        });
        HTMLElement.prototype.__defineGetter__("outerHTML", function () {
            var a = this.attributes, str = "<" + this.tagName, i = 0;
            for (; i < a.length; i++)
                if (a[i].specified)
                    str += " " + a[i].name + '="' + a[i].value + '"';
            if (!this.canHaveChildren)
                return str + " />";
            return str + ">" + this.innerHTML + "</" + this.tagName + ">";
        });

        HTMLElement.prototype.__defineGetter__("canHaveChildren", function () {
            return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/.test(this.tagName.toLowerCase());
        });
    }
}

if (!window.ActiveXObject) {
    /**
     * 扩展其它浏览器DOM元素的innerText属性
     */
    if (!!document.getBoxObjectFor || window.mozInnerScreenX != null) {
        HTMLElement.prototype.__defineSetter__("innerText", function (sText) {
            var parsedText = document.createTextNode(sText);
            this.innerHTML = "";
            this.appendChild(parsedText);
            return parsedText;
        });
        HTMLElement.prototype.__defineGetter__("innerText", function () {
            var r = this.ownerDocument.createRange();
            r.selectNodeContents(this);
            return r.toString();
        });
    }

    /**
     * 扩展其它浏览器DOM元素的outerText属性
     */
    if (!!document.getBoxObjectFor || window.mozInnerScreenX != null) {
        HTMLElement.prototype.__defineSetter__("outerText", function (sText) {
            var parsedText = document.createTextNode(sText);
            this.parentNode.replaceChild(parsedText, this);
            return parsedText;
        });
        HTMLElement.prototype.__defineGetter__("outerText", function () {
            var r = this.ownerDocument.createRange();
            r.selectNodeContents(this);
            return r.toString();
        });
    }
}

String.prototype.getBytesLength = function () {
    var cArr = this.match(/[^\x00-\xff]/ig);
    return this.length + (cArr == null ? 0 : cArr.length);
};

String.prototype.getLimitLength = function (maxlengh, symbol) {
    if (!maxlengh || maxlengh < 0) {
        return this;
    }
    var len = this.getBytesLength();

    if (len <= maxlengh) {
        return this;
    }

    symbol = symbol == null ? ".." : symbol;
    maxlengh = maxlengh - symbol.length;

    var a = 0;
    var temp = '';

    for (var i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) > 255) a += 2;
        else
            a++;

        temp += this.charAt(i);

        if (a >= maxlengh) {
            return temp + symbol;
        }
    }

    return this;
};

String.prototype.escapeHTML = function (isEscapeSpace, isEscapeBr) {
    try {
        return escapeStringToHTML(this, isEscapeSpace, isEscapeBr);
    } catch (e) {
    }

    return this;
};
String.prototype.escapeHTMLWithoutBr = function (isEscapeSpace) {
    try {
        return escapeStringToHTMLWithoutBr(this, isEscapeSpace);
    } catch (e) {
    }

    return this;
};
String.prototype.escapeUrl = function (isEscapeSpace) {
    try {
        return escapeStringToHTML(this.replace(/\n/g, ''), isEscapeSpace);
    } catch (e) {
    }

    return this;
};
String.prototype.escapeJavascript = function () {
    return escapeStringToJavascript(this);
};

String.prototype.escapeSpace = function () {
    return this.replace(/ /g, "&nbsp;");
};

String.prototype.escapeSameWidthSpace = function () {
    return this.replace(/ /g, "&nbsp;&nbsp;");
};

String.prototype.escapeXML = function () {
    return this.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\"/g, "&quot;");
};
String.prototype.escapeQuot = function () {
    return this.replace(/\'/g, "&#039;").replace(/"/g, "&#034;");
};
String.prototype.startsWith = function (prefix) {
    return this.indexOf(prefix) == 0;
};
String.prototype.endsWith = function (subfix) {
    if (!Array.prototype.lastIndexOf) {
        Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
            'use strict';

            if (this === void 0 || this === null) {
                throw new TypeError();
            }

            var n, k,
                t = Object(this),
                len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }

            n = len - 1;
            if (arguments.length > 1) {
                n = Number(arguments[1]);
                if (n != n) {
                    n = 0;
                } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }

            for (k = n >= 0
                ? Math.min(n, len - 1)
                : len - Math.abs(n); k >= 0; k--) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    var pos = this.lastIndexOf(subfix);
    return pos > -1 && pos == this.length - subfix.length;
};

/**
 * 去掉空格
 */
String.prototype.trim = function () {
    var chs = this.toCharArray();

    var st = 0;
    var off = chs.length;

    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c == ' ') {
            st++;
        } else {
            break;
        }
    }

    if (st == this.length) {
        return "";
    }

    for (var i = chs.length; i > 0; i--) {
        var c = chs[i - 1];
        if (c == ' ') {
            off--;
        } else {
            break;
        }
    }

    return this.substring(st, off);
};

/**
 * 将字符串转成数组
 */
String.prototype.toCharArray = function () {
    var array = [];

    for (var i = 0; i < this.length; i++) {
        array[i] = this.charAt(i);
    }

    return array;
};

/**
 *
 */
//BUG_重要_V9.0sp1_VIP1星卡_中山凯中有限公司_表单打开慢，然后后台日志里面还有警告，这种警告启动的时候也有_BUG2024102831608
/*Array.prototype.indexOf = function(object){
	for(var i = 0; i < this.length; i++) {
		if(this[i] == object){
			return i;
		}
	}

	return -1;
}*/

/**
 * 日志
 */
var log = {
    rootLogger: "info",

    debugLevel: {debug: true, info: true, warn: true, error: true},
    infoLevel: {debug: false, info: true, warn: true, error: true},
    warnLevel: {debug: false, info: false, warn: true, error: true},
    errorLevel: {debug: false, info: false, warn: false, error: true},

    debug: function (message) {
        if (this.isDebugEnabled())
            alert("Debug : " + message)
    },
    info: function (message) {
        if (this.isInfoEnabled())
            alert("Info : " + message)
    },
    warn: function (message) {
        if (this.isWarnEnabled())
            alert("Warn : " + message)
    },
    error: function (message, exception) {
        if (this.isErrorEnabled())
            alert("Error : " + message + "\n\n" + exception.message)
    },

    isDebugEnabled: function () {
        return eval("this." + this.rootLogger + "Level.debug");
    },
    isInfoEnabled: function () {
        return eval("this." + this.rootLogger + "Level.info");
    },
    isWarnEnabled: function () {
        return eval("this." + this.rootLogger + "Level.warn");
    },
    isErrorEnabled: function () {
        return eval("this." + this.rootLogger + "Level.error");
    }
}

var UUID_seqence = 0;

/**
 * 产生UUID，返回类型是String
 */
function getUUID() {
    var UUIDConstants_Time = new Date().getTime() + "" + (UUID_seqence++);
    if (UUID_seqence >= 100000) {
        UUID_seqence = 0;
    }

    return UUIDConstants_Time;
}


var EmptyArrayList = new ArrayList();

/**
 * ArrayList like java.util.ArrayList
 */
function ArrayList() {
    this.instance = new Array();
}

ArrayList.prototype.size = function () {
    return this.instance.length;
}
/**
 * 在末尾追加一个
 */
ArrayList.prototype.add = function (o) {
    this.instance[this.instance.length] = o;
}
/**
 * 当list中不存在该对象时才添加
 */
ArrayList.prototype.addSingle = function (o) {
    if (!this.contains(o)) {
        this.instance[this.instance.length] = o;
    }
}
/**
 * 在指定位置增加元素
 * @param posation 位置， 从0开始
 * @param o 要增加的元素
 */
ArrayList.prototype.addAt = function (position, o) {
    if (position >= this.size() || position < 0 || this.isEmpty()) {
        this.add(o);
        return;
    }

    this.instance.splice(position, 0, o);
}

/**
 * Appends all of the elements in the specified Collection to the end of
 * this list, in the order that they are returned by the
 * specified Collection's Iterator.  The behavior of this operation is
 * undefined if the specified Collection is modified while the operation
 * is in progress.  (This implies that the behavior of this call is
 * undefined if the specified Collection is this list, and this
 * list is nonempty.)
 */
ArrayList.prototype.addAll = function (array) {
    if (!array || array.length < 1) {
        return;
    }

    this.instance = this.instance.concat(array);
}

/**
 * 追加一个List在队尾
 */
ArrayList.prototype.addList = function (list) {
    if (list && list instanceof ArrayList && !list.isEmpty()) {
        this.instance = this.instance.concat(list.instance);
    }
}

/**
 * @return the element at the specified position in this list.
 */
ArrayList.prototype.get = function (index) {
    if (this.isEmpty()) {
        return null;
    }

    if (index > this.size()) {
        return null;
    }

    return this.instance[index];
}

/**
 * 最后一个
 */
ArrayList.prototype.getLast = function () {
    if (this.size() < 1) {
        return null;
    }

    return this.instance[this.size() - 1];
}

/**
 * Replace the element at the specified position in the list with the specified element
 * @param index int index of element to replace
 * @param obj Object element to be stored at the specified posotion
 * @return Object the element previously at the specified posotion
 * @throws IndexOutOfBoundException if index out of range
 */
ArrayList.prototype.set = function (index, obj) {
    if (index >= this.size()) {
        throw "IndexOutOfBoundException : Index " + index + ", Size " + this.size();
    }

    var oldValue = this.instance[index];
    this.instance[index] = obj;

    return oldValue;
}

/**
 * Removes the element at the specified position in this list.
 * Shifts any subsequent elements to the left (subtracts one from their
 * indices).
 */
ArrayList.prototype.removeElementAt = function (index) {
    if (index > this.size() || index < 0) {
        return;
    }

    this.instance.splice(index, 1);
}
/**
 * Removes the element in this list.
 */
ArrayList.prototype.remove = function (o) {
    var index = this.indexOf(o);
    this.removeElementAt(index);
}
/**
 * @return <tt>true</tt> if this list contains the specified element.
 */
ArrayList.prototype.contains = function (o, comparatorProperies) {
    return this.indexOf(o, comparatorProperies) > -1;
}
/**
 * Searches for the first occurence of the given argument, testing
 * for equality using the <tt>==</tt> method.
 */
ArrayList.prototype.indexOf = function (o, comparatorProperies) {
    for (var i = 0; i < this.size(); i++) {
        var s = this.instance[i];
        if (s == o) {
            return i;
        } else if (comparatorProperies != null && s != null && o != null && s[comparatorProperies] == o[comparatorProperies]) {
            return i;
        }
    }

    return -1;
}
/**
 * Returns the index of the last occurrence of the specified object in this list.
 * @return the index of the last occurrence of the specified object in this list;
 *         returns -1 if the object is not found.
 */
ArrayList.prototype.lastIndexOf = function (o, comparatorProperies) {
    for (var i = this.size() - 1; i >= 0; i--) {
        var s = this.instance[i];
        if (s == o) {
            return i;
        } else if (comparatorProperies != null && s != null && o != null && s[comparatorProperies] == o[comparatorProperies]) {
            return i;
        }
    }

    return -1;
}

/**
 * Returns a view of the portion of this list between
 * fromIndex, inclusive, and toIndex, exclusive.
 * @return a view of the specified range within this list.
 */
ArrayList.prototype.subList = function (fromIndex, toIndex) {
    if (fromIndex < 0) {
        fromIndex = 0;
    }

    if (toIndex > this.size()) {
        toIndex = this.size();
    }

    var tempArray = this.instance.slice(fromIndex, toIndex);

    var temp = new ArrayList();
    temp.addAll(tempArray);

    return temp;
}
/**
 * Returns an array containing all of the elements in this list in the correct order;
 *
 * @return Array
 */
ArrayList.prototype.toArray = function () {
    return this.instance;
}

/**
 * Tests if this list has no elements.
 *
 * @return <tt>true</tt> if this list has no elements;
 */
ArrayList.prototype.isEmpty = function () {
    return this.size() == 0;
}
/**
 * Removes all of the elements from this list.  The list will
 * be empty after this call returns.
 */
ArrayList.prototype.clear = function () {
    this.instance = new Array();
}
/**
 * show all elements
 */
ArrayList.prototype.toString = function (sep) {
    sep = sep || ", ";
    return this.instance.join(sep);
}


var EmptyProperties = new Properties();

/**
 *
 */
function Properties(jsProps) {
    this.instanceKeys = new ArrayList();
    this.instance = {};

    if (jsProps) {
        this.instance = jsProps;
        for (var i in jsProps) {
            this.instanceKeys.add(i);
        }
    }
}

/**
 * changePostion Object position
 * @param oldPosition   old position
 * @param newPosition   new position
 * @return Object
 */
Properties.prototype.changePostion = function (oldPosition, newPosition) {
    var preObj = this.instanceKeys.get(oldPosition);
    this.instanceKeys.removeElementAt(oldPosition);
    this.instanceKeys.addAt(newPosition, preObj);
    return this.instance[preObj];
}

/**
 * Returns the number of keys in this Properties.
 * @return int
 */
Properties.prototype.size = function () {
    return this.instanceKeys.size();
}

/**
 * Returns the value to which the specified key is mapped in this Properties.
 * @return value
 */
Properties.prototype.get = function (key, defaultValue) {
    if (key == null) {
        return null;
    }

    var returnValue = this.instance[key];

    if (returnValue == null && defaultValue != null) {
        return defaultValue;
    }

    return returnValue;
}
/**
 * Removes the key (and its corresponding value) from this
 * Properties. This method does nothing if the key is not in the Properties.
 */
Properties.prototype.remove = function (key) {
    if (key == null) {
        return null;
    }
    this.instanceKeys.remove(key);
    delete this.instance[key]
}
/**
 * Maps the specified <code>key</code> to the specified
 * <code>value</code> in this Properties. Neither the key nor the
 * value can be <code>null</code>. <p>
 *
 * The value can be retrieved by calling the <code>get</code> method
 * with a key that is equal to the original key.
 */
Properties.prototype.put = function (key, value) {
    if (key == null) {
        return null;
    }

    if (this.instance[key] == null) {
        this.instanceKeys.add(key);
    }

    this.instance[key] = value;
}

/**
 * 直接追加，不考虑重复key
 */
Properties.prototype.putRef = function (key, value) {
    if (key == null) {
        return null;
    }

    this.instanceKeys.add(key);
    this.instance[key] = value;
}

/**
 * Tests if the specified object is a key in this Properties.
 * @return boolean
 */
Properties.prototype.containsKey = function (key) {
    if (key == null) {
        return false;
    }

    return this.instance[key] != null;
}

/**
 * Returns an ArrayList of the keys in this Properties.
 * @return ArrayList
 */
Properties.prototype.keys = function () {
    return this.instanceKeys;
}

/**
 * Returns an ArrayList of the values in this Properties.
 * @return ArrayList
 */
Properties.prototype.values = function () {
    var vs = new ArrayList();
    let files = []
    for (const key in this.instance) {
        files.push(this.instance[key])
    }
    // 超过两个并且有排序，才对值做处理
    if (files.length > 1 && files[files.length - 1].sortNo) {
        this.instanceKeys.instance = files.sort((a, b) => a.sortNo - b.sortNo).map(item => item.fileUrl2)
    }

    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);

        if (key) {
            var value = this.instance[key];
            vs.add(value);
        }
    }

    return vs;
}

/**
 * Tests if this Properties maps no keys to values.
 * @return boolean
 */
Properties.prototype.isEmpty = function () {
    return this.instanceKeys.isEmpty();
}

/**
 * Clears this Properties so that it contains no keys.
 */
Properties.prototype.clear = function () {
    this.instanceKeys.clear();
    this.instance = {};
}
/**
 * exchange entry1(key1-value1) with entry2(key2-value2)
 */
Properties.prototype.swap = function (key1, key2) {
    if (!key1 || !key2 || key1 == key2) {
        return;
    }

    var index1 = -1;
    var index2 = -1;

    for (var i = 0; i < this.instanceKeys.instance.length; i++) {
        if (this.instanceKeys.instance[i] == key1) {
            index1 = i;
        } else if (this.instanceKeys.instance[i] == key2) {
            index2 = i;
        }
    }

    this.instanceKeys.instance[index1] = key2;
    this.instanceKeys.instance[index2] = key1;
}

Properties.prototype.entrySet = function () {
    var result = [];

    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);
        var value = this.instance[key];

        if (!key) {
            continue;
        }

        var o = new Object();
        o.key = key;
        o.value = value;

        result[result.length] = o;
    }

    return result;
}

/**
 *
 */
Properties.prototype.toString = function () {
    var str = "";

    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);
        str += key + "=" + this.instance[key] + "\n";
    }

    return str;
}
/**
 * 转换成key1=value1;key2=value2;的形式
 * token1 -- 对应第一层分隔符  如上式的";"
 * token2 -- 对应第二层分隔符  如上式的"="
 */
Properties.prototype.toStringTokenizer = function (token1, token2) {
    token1 = token1 == null ? ";" : token1;
    token2 = token2 == null ? "=" : token2;
    var str = "";

    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);
        var value = this.instance[key];

        if (!key) {
            continue;
        }

        if (i > 0) {
            str += token1;
        }
        str += key + token2 + value;
    }

    return str;
}

Properties.prototype.toQueryString = function () {
    if (this.size() < 1) {
        return "";
    }

    var str = "";
    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);
        var value = this.instance[key];

        if (!key) {
            continue;
        }

        if (i > 0) {
            str += "&";
        }

        if (typeof value == "object") {

        } else {
            str += key + "=" + encodeURIat(value);
        }
    }

    return str;
}


function encodeURIat(inputStr) {
    if ((typeof inputStr) !== "string") {
        return "";
    }
    inputStr = encodeURI(inputStr);
    var reg = /&|\/|\+|\?|\s|%|#|=/g;
    if (reg.test(inputStr)) {
        // inputStr = inputStr.replace( /(%)/g, "%25");
        inputStr = inputStr.replace(/(\/)/g, "%2F");
        inputStr = inputStr.replace(/(&)/g, "%26");
        inputStr = inputStr.replace(/(\+)/g, "%2B");
        inputStr = inputStr.replace(/(\?)/g, "%3F");
        inputStr = inputStr.replace(/(#)/g, "%23");
        // inputStr = inputStr.replace( /(\s)/g, "%20");
        inputStr = inputStr.replace(/(=)/g, "%3D");
    }
    return inputStr;
};


Properties.prototype.toInputString = function () {
    if (this.size() < 1) {
        return "";
    }

    var str = "";
    for (var i = 0; i < this.instanceKeys.size(); i++) {
        var key = this.instanceKeys.get(i);
        var value = this.instance[key];

        if (!key) {
            continue;
        }

        if (typeof value == "object") {

        } else {
            str += "<input type='hidden' name=\"" + key + "\" value=\"" + encodeURI(value) + ">";
        }
    }

    return str;
}


function SetList() {
    this.instance = new Array();
    this.key = {}
}


SetList.prototype.add = function () {
    if (arguments == null || arguments.length < 1) {
        throw "arguments is null";
    }

    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        if (!this.contains(a)) { //存在
            this.instance[this.size()] = a;
            this.key[a] = "A8"; //随便给个值
        }
    }
}

SetList.prototype.size = function () {
    return this.instance.length;
}

SetList.prototype.contains = function (o) {
    return this.key[o] != null;
}

SetList.prototype.isEmpty = function () {
    return this.size() == 0;
}

SetList.prototype.clear = function () {
    this.instance = new Array();
    this.key = {}
}

SetList.prototype.get = function (index) {
    if (this.isEmpty()) {
        return null;
    }

    if (index > this.size()) {
        return null;
    }

    return this.instance[index];
}

SetList.prototype.toArray = function () {
    return this.instance;
}
SetList.prototype.toString = function () {
    return this.instance.join(', ');
}


/**
 * StringStringBuffer对象
 */
function StringBuffer() {
    this._strings_ = new Array();
}

StringBuffer.prototype.append = function (str) {
    if (str) {
        if (str instanceof Array) {
            this._strings_ = this._strings_.concat(str);
        } else {
            this._strings_[this._strings_.length] = str;
        }
    }

    return this;
}
StringBuffer.prototype.reset = function (newStr) {
    this.clear();
    this.append(newStr);
}
StringBuffer.prototype.clear = function () {
    this._strings_ = new Array();
}
StringBuffer.prototype.isBlank = function () {
    return this._strings_.length == 0;
}

StringBuffer.prototype.toString = function (sp) {
    sp = sp == null ? "" : sp;
    if (this._strings_.length == 0)
        return "";
    return this._strings_.join(sp);
}

function V3X() {
    this.windowArgs = new Array();
    this.lastWindow = null;
    // Browser check
    var ua = navigator.userAgent;
    this.isMSIE = (navigator.appName == "Microsoft Internet Explorer") || ua.indexOf('Trident') != -1;
    this.isMSIE5 = this.isMSIE && (ua.indexOf('MSIE 5') != -1);
    this.isMSIE5_0 = this.isMSIE && (ua.indexOf('MSIE 5.0') != -1);
    this.isMSIE6 = this.isMSIE && (ua.indexOf('MSIE 6') != -1);
    this.isMSIE7 = this.isMSIE && (ua.indexOf('MSIE 7') != -1);
    this.isMSIE8 = this.isMSIE && (ua.indexOf('MSIE 8') != -1);
    this.isMSIE9 = this.isMSIE && (ua.indexOf('MSIE 9') != -1);
    this.isMSIE10 = this.isMSIE && (ua.indexOf('MSIE 10') != -1);
    this.isMSIE11 = this.isMSIE && (ua.indexOf('rv:11') != -1);
    this.isGecko = ua.indexOf('Gecko') != -1;
    this.isGecko18 = ua.indexOf('Gecko') != -1 && ua.indexOf('rv:1.8') != -1;
    this.isSafari = ua.indexOf('Safari') != -1;
    this.isOpera = ua.indexOf('Opera') != -1;
    this.isFirefox = ua.indexOf('Firefox') != -1;
    this.isMac = ua.indexOf('Mac') != -1;
    this.isNS7 = ua.indexOf('Netscape/7') != -1;
    this.isNS71 = ua.indexOf('Netscape/7.1') != -1;
    this.isIpad = ua.indexOf('iPad') != -1;
    this.isChrome = ua.indexOf('Chrome') != -1;
    //IE6/7/8、IE9、FireFox、iPad、Chrome、Safari、Opera
    this.currentBrowser = "";
    //引用if(v3x.getBrowserFlag('selectPeople')){}
    this.browserFlag = {
        //弹出模态窗口还是正常窗口,true:模态对话框 ；false：正常窗口 -- 首页打开、处理协同
        openWindow: [true, true, false, false, false, false, false],
        //首页栏目是否用模态对话框打开，只有ipad用open window
        sectionOpenDetail: [true, true, true, false, true, true, false],
        //选人界面 true pc false ipad -- 选人界面内部
        selectPeople: [true, true, true, false, true, true, false],
        //不支持富文本，只提供纯文本编辑框,true:支持富文本，false不支持 -- 问本编辑器
        htmlEditer: [true, true, true, false, true, true, false],
        //菜单 -- 系统内部toolbar
        hideMenu: [true, true, true, false, true, true, false],
        //使用flash 新建流程图
        newFlash: [true, true, true, false, true, false, false],
        //签章,true支持 false不支持 -- 签章
        signature: [true, true, false, false, false, false, false],
        //新建流程 true pc模式 false 只新建一次 --
        createProcess: [true, true, true, false, true, true, false],
        //flash  pc模式 false html5 --
        flash: [true, true, true, false, true, true, false],
        //是否允许下载 true 允许下载 false 屏蔽下载  -- 系统内部toolbar
        downLoad: [true, true, true, false, true, true, false],
        //打印 true pc false ipad -- 系统内部toolbar/功能
        print: [true, true, true, false, true, true, false],
        //导出Excel  true pc false ipad -- 隐藏导出功能
        exportExcel: [true, true, true, false, true, true, false],
        //是否显示上下结构,true:显示上下结构;false:纯列表显示 -- 上下结构
        pageBreak: [true, true, true, false, true, true, false],
        //菜单定位只准对ipad -- 空间栏目下拉菜单
        menuPosition: [false, false, false, true, false, false, false],
        //office插件 --
        officeMenu: [true, true, true, false, true, false, false],
        //选人界面内部div改造 -- 选人界面select list ipad 不能展开
        selectPeopleShowType: [true, true, true, false, true, true, false],
        //div实现模态窗口 -- div实现模态
        OpenDivWindow: [true, true, true, false, true, true, false],
        //select div改造
        selectDivType: [true, true, true, false, true, true, false],
        //ipad不支持双击事件
        onDbClick: [true, true, true, false, true, true, true],
        //safari 下需要模态
        needModalWindow: [true, true, true, false, true, true, false],
        //只有ie
        onlyIe: [true, true, false, false, false, false, false]
    }
    this.isOfficeSupport = function () {
        return this.getBrowserFlag("officeMenu") == true;
    }
    this.dialogCounter = 0;

    this.defaultLanguage = "en";
    this.currentLanguage = "";
    this.baseURL = "";
    this.loadedFiles = new Array();
    this.workSpaceTop = 130;
    if (this.isMSIE8) {
        this.workSpaceTop = 140;
    }
    if (!this.isMSIE7 && !this.isMSIE8) {
        this.workSpaceTop = 130;
    }
    this.workSpaceLeft = 0;
    this.workSpaceWidth = screen.width - this.workSpaceLeft;
    this.workSpaceheight = screen.height - this.workSpaceTop - 20 - (this.isMSIE7 ? 35 : 0);

    // Fake MSIE on Opera and if Opera fakes IE, Gecko or Safari cancel those
    if (this.isOpera) {
        this.isMSIE = true;
        this.isGecko = false;
        this.isSafari = false;
    }

    this.settings = {
        dialog_type: "modal",
        resizable: "yes",
        scrollbars: "yes"
    };
}

V3X.prototype.init = function (contextPath, language) {
    if (contextPath) {
        this.baseURL = contextPath;
    }

    this.currentLanguage = language;
//	this.loadLanguage("/common/js/i18n");

    //this.loadScriptFile(this.baseURL + "/common/office/license.js?V=5_0_5_30");
    this.getCurrentBrowser();
}


V3X.prototype.getCurrentBrowser = function () {

    ////IE6/7/8、IE9、FireFox、iPad、Chrome、Safari、Opera

    if (this.isMSIE || this.isMSIE5 || this.isMSIE5_0 || this.isMSIE7 || this.isMSIE8) this.currentBrowser = 'MSIE';

    if (this.isMSIE9) this.currentBrowser = 'MSIE9';

    if (this.isFirefox) this.currentBrowser = 'FIREFOX';

    if (this.isSafari) this.currentBrowser = 'SAFARI';

    if (this.isChrome) this.currentBrowser = 'CHROME';

    if (this.isIpad) this.currentBrowser = 'IPAD';

    if (this.isOpera) this.currentBrowser = 'OPERA';


}

V3X.prototype.getBrowserFlag = function (name) {

    ////IE6/7/8、IE9、FireFox、iPad、Chrome、Safari、Opera
    if (name != null && name != '') {

        var i = 0;

        if (this.currentBrowser == 'MSIE') i = 0;

        if (this.currentBrowser == 'MSIE9') i = 1;

        if (this.currentBrowser == 'FIREFOX') i = 2;

        if (this.currentBrowser == 'IPAD') i = 3;

        if (this.currentBrowser == 'CHROME') i = 4;

        if (this.currentBrowser == 'SAFARI') i = 5;

        if (this.currentBrowser == 'OPERA') i = 6;

        return this.browserFlag[name][i];

    }

}
V3X.prototype.isCurrentSysWindows = function () {
    return this.getCurrentSysPlatform().indexOf("Win") == 0;
}
V3X.prototype.isCurrentSysLinux = function () {
    return this.getCurrentSysPlatform().indexOf("Linux") == 0;
}
V3X.prototype.getCurrentSysPlatform = function () {
    var sUserAgent = navigator.userAgent;
    var isWin = (navigator.platform == "Win32")
        || (navigator.platform == "Windows");
    var isMac = (navigator.platform == "Mac68K")
        || (navigator.platform == "MacPPC")
        || (navigator.platform == "Macintosh")
        || (navigator.platform == "MacIntel");
    if (isMac)
        return "Mac";
    var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
    if (isUnix)
        return "Unix";
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    if (isLinux)
        return "Linux";
    if (isWin) {
        var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1
            || sUserAgent.indexOf("Windows 2000") > -1;
        if (isWin2K)
            return "Win2000";
        var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1
            || sUserAgent.indexOf("Windows XP") > -1;
        if (isWinXP)
            return "WinXP";
        var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1
            || sUserAgent.indexOf("Windows 2003") > -1;
        if (isWin2003)
            return "Win2003";
        var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1
            || sUserAgent.indexOf("Windows Vista") > -1;
        if (isWinVista)
            return "WinVista";
        var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1
            || sUserAgent.indexOf("Windows 7") > -1;
        if (isWin7)
            return "Win7";
        var isWin8 = sUserAgent.indexOf("Windows NT 6.1") > -1
            || sUserAgent.indexOf("Windows 8") > -1;
        if (isWin8)
            return "Win8";
    }
    return "Win";
}
//div窗口
V3X.prototype.openDialog = function (json) {
    return new MxtWindow(json);
}
//获得event,兼容多浏览器
V3X.prototype.getEventCallerList = [];
V3X.prototype.getEvent = function () {
    if (this.isMSIE) {
        return window.event;//如果是ie
    }
    V3X.prototype.getEventCallerList = [];
    func = v3x.getEvent.caller;
    while (func != null) {
        var arg0 = func.arguments[0];
        if (arg0) {
            if ((arg0.constructor == Event || arg0.constructor == MouseEvent) || (typeof (arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                V3X.prototype.getEventCallerList = [];
                return arg0;
            }
        }
        // 如果已经发生死循环，则跳出
        if (V3X.prototype.getEventCallerList.indexOf(func.caller) >= 0) {
            V3X.prototype.getEventCallerList = [];
            return null;
        } else {
            func = func.caller;
            V3X.prototype.getEventCallerList.push(func);
        }
    }
    V3X.prototype.getEventCallerList = [];
    return null;
}
/**
 *
 var args = new Array();

 args['file']   = 'about.htm';
 args['width']  = 480;
 args['height'] = 380;

 v3x.openWindow(args});
 */
V3X.prototype.openWindow = function (args) {
    var html, width, height, x, y, resizable, scrollbars, url;

    this.windowArgs = args;

    html = args['html'];

    if (args["FullScrean"]) {
        width = this.workSpaceWidth;
        height = this.workSpaceheight + this.workSpaceTop;
        width = width - 20;

        x = 0;
        y = 0;
    } else if (args["workSpace"]) {
        width = this.workSpaceWidth;
        height = this.workSpaceheight;

        width = width - 30;
        x = this.workSpaceLeft;
        y = this.workSpaceTop;
        //if(this.isSafari){
        //所有浏览器，减去任务栏高度
        y = y - 40;
        //}
    } else if (args["workSpaceRight"]) {
        width = this.workSpaceWidth - 155;
        height = this.workSpaceheight;
        if (this.isMSIE8) {
            height = this.workSpaceheight - 48;
        }
        if (!this.isMSIE7 && !this.isMSIE8) {
            width = this.workSpaceWidth - 165;
            height = this.workSpaceheight - 35;
        }
        x = 140;
        y = this.workSpaceTop;
    } else {
        width = args['width'] || 320;
        height = args['height'] || 200;

        width = parseInt(width);
        height = parseInt(height);

        if (this.isMSIE) {
            if (this.isMSIE7 || this.isMSIE8) {
                height -= 6;
            } else {
                height += 20;
            }
        }

        x = args["left"] || parseInt(screen.width / 2.0) - (width / 2.0);
        y = args["top"] || parseInt(screen.height / 2.0) - (height / 2.0);
    }

    resizable = args['resizable'] || this.settings["resizable"];
    scrollbars = args['scrollbars'] || this.settings["scrollbars"];

    url = args['url'];
    if (url.indexOf('CSRFTOKEN=') < 0) {
        url = url + CsrfGuard.getUrlSurffix(url);
    }
    if (html) {
        var win = window.open("", "v3xPopup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,minimizable=" + resizable + ",modal=yes,width=" + width + ",height=" + height + ",resizable=" + resizable);
        if (win == null) {
            return;
        }

        win.document.write(html);
        win.document.close();
        win.resizeTo(width, height);
        win.focus();

        return win;
    } else {
        var dialog_type = args["dialogType"] || this.settings["dialog_type"];

        if (dialog_type == "modal" && window.showModalDialog) {
            var features = "resizable:" + resizable
                + ";scroll:"
                + scrollbars + ";status:no;help:no;dialogWidth:"
                + width + "px;dialogHeight:" + height + "px;";

            if (args["workSpace"] || args["workSpaceRight"] || (args["left"] && args["top"])) {
                features += "dialogTop:" + y + "px;dialogLeft:" + x + "px;";
            } else {
                var cw = (parseInt(getA8Top().document.body.offsetWidth) - width) / 2;
                var ch = (parseInt(getA8Top().document.body.offsetHeight) - height) / 2;
                if (cw == null || ch == null || cw < 0 || ch < 0) {
                    cw = 200;
                    ch = 200;
                }
                features += this.isMSIE ? "center:yes;" : "dialogTop:" + ch + "px;dialogLeft:" + cw + "px;";
            }
            if (url.indexOf('?') != -1)
                url += '&';
            else
                url += '?';
            url += '_isModalDialog=true';
            var rv = window.showModalDialog(url, window, features);

            var temp = null;
            if (this.ModalDialogResultValue == undefined) {
                temp = rv;
            } else {
                temp = this.ModalDialogResultValue;
                this.ModalDialogResultValue = undefined;
            }
            return temp;
        } else {
            var rv = null;
            var modal = (resizable == "yes") ? "no" : "yes";

            if (this.isGecko && this.isMac)
                modal = "no";

            if (args['closePrevious'] != "no")
                try {
                    this.lastWindow.close();
                } catch (ex) {
                }
            if (window.dialogArguments && args["workSpace"]) {
                y -= 5;
                height -= 25;
            }
            var win = window.open(url, "v3xPopup" + new Date().getTime(), "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=" + modal + ",minimizable=" + resizable + ",modal=" + modal + ",width=" + width + ",height=" + height + ",resizable=" + resizable);
            if (win == null) {
                return;
            }

            if (args['closePrevious'] != "no")
                this.lastWindow = win;

//			eval('try { win.resizeTo(width, height); } catch(e) { }');

            // Make it bigger if statusbar is forced
            if (this.isGecko && !this.isMSIE && !this.isFirefox) {
                if (win.document.defaultView.statusbar.visible)
                    win.resizeBy(0, this.isMac ? 10 : 24);
            }

            win.focus();

            return win;
        }
    }
}

V3X.prototype.setResultValue = function (obj) {
    this.getParentWindow().v3x.ModalDialogResultValue = obj;
}

V3X.prototype.closeWindow = function (win) {
    win.close();
}

/**
 * 得到弹出当前窗口的直接父窗口
 */
V3X.prototype.getParentWindow = function (win) {
    win = win || window;
    if (win.dialogArguments) {
        return win.dialogArguments;
    } else {
        return win.opener || win;
    }
}

V3X.prototype.loadLanguage = function (url) {
    this.loadScriptFile(this.baseURL + url + "/" + this.currentLanguage + ".js?V=3_50_2_29");
}

/**
 * JS的国际化
 */
V3X.prototype.getMessage = function (key) {
    var values = Array.prototype.slice.call(arguments, 1);
    var langMap, localeName, localeMap, i18nSuffix;

    // 尝试读取国际化对象, 读取parent/top可能跨域这里用try/catch处理
    try {
        var pp = window.parent;
        var tt = window.top;
        langMap = window.CTPLang || pp.CTPLang || tt.CTPLang;
        localeName = window._locale || pp._locale || tt._locale;
        i18nSuffix = window._editionI18nSuffix || pp._editionI18nSuffix || tt._editionI18nSuffix;
    } catch (ex) {
        console.log(ex);
    } finally {
        i18nSuffix = i18nSuffix || '';
        localeName = localeName || (window.vPortal && window.vPortal.locale) || 'zh_CN';
    }

    // 加载国际化文件
    if (!langMap) {
        var _myResSuffix = window._resSuffix || '?v=902_20240708';
        // i18n_${locale}.js 已经配置了304
        $.ajax({
            url: _ctxPath + "/i18n_" + localeName + ".js" + _myResSuffix,
            async: false,
            beforeSend: CsrfGuard.beforeAjaxSend,
            dataType: "script",
            cache: true
        });
        langMap = window.CTPLang;
    }

    // 国际化加载失败，返回原始key
    localeMap = langMap ? langMap[localeName] : '';
    if (!localeMap) return key;

    // 国际化版本兼容、变量替换
    var msg = i18nSuffix && (localeMap[key + i18nSuffix.toUpperCase()] || localeMap[key + i18nSuffix.toLowerCase()]) || localeMap[key];
    if (msg && values.length) {
        // 将values中的$_替换为$$_ ???
        for (var i = 0, l = values.length; i < l; ++i) {
            var val = values[i] + '';
            if (val.indexOf('$_') > -1) {
                values[i] = val.replace('$_', '$$_');
            }
        }
        // 替换变量
        msg = msg.replace(/\{(\d+)\}/g, function (expr, index) {
            index = parseInt(index);
            return values[index] + "";
        });
    }

    return msg || key;
};


/**
 *
 */
V3X.prototype.loadScriptFile = function (url) {
    for (var i = 0; i < this.loadedFiles.length; i++) {
        if (this.loadedFiles[i] == url)
            return;
    }

    document.write('<script language="javascript" type="text/javascript" charset="UTF-8" src="' + url + '"></script>');

    this.loadedFiles[this.loadedFiles.length] = url;
};
/* 作者:dengwei 时间2020-10-10 功能判断是否需要ofd打开PDF start*/
V3X.prototype.needOpenPdfByOfd = function () {
    //先判断a8Top
    if (getA8Top().useOfdOpenPdf) {
        return true;
    }
    //sessionId
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxHandWriteManager", "ajaxGetSession", false);
    var ds = requestCaller.serviceRequest();
    var storageKey = "useOfdOpenPdf_" + JSON.parse(ds).JSESSIONID;
    //遍历localStorage
    var obj = null;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i); //获取本地存储的Key
        //找到匹配key
        if (key == storageKey) {
            obj = localStorage.getItem(key);
        }
        //删除相似无效数据
        else if (key.indexOf("useOfdOpenPdf_") != -1) {
            localStorage.removeItem(key);
        }
    }
    if (obj == null) {
        return false;
    }
    //转换为json
    var obj_json = JSON.parse(obj);
    var res = false;
    if (obj_json.useOfdOpenPdf) {
        res = true;
        //a8Top放入，保证本页面不刷新一直有效
        getA8Top().useOfdOpenPdf = true;
    }
    //如果不再提醒为false
    if (!obj_json.notRemind) {
        //移除数据，保证下次提醒
        localStorage.removeItem(storageKey);
    }
    return res;
};
/* 作者:dengwei 时间2020-10-10 功能判断是否需要ofd打开PDF end*/
V3X.prototype.getElementPosition = function (el) {
    var ua = navigator.userAgent.toLowerCase();
    var isOpera = (ua.indexOf('opera') != -1);
    var isIE = (ua.indexOf('msie') != -1 && !isOpera);
    // not opera spoof
    if (el.parentNode === null || el.style.display == 'none') {
        return false;
    }
    var parent = null;
    var pos = [];
    var box;
    if (el.getBoundingClientRect) {//IE
        box = el.getBoundingClientRect();
        var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
        var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
        return {x: box.left + scrollLeft, y: box.top + scrollTop};
    } else if (document.getBoxObjectFor) { // gecko
        box = document.getBoxObjectFor(el);
        var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
        var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
        pos = [box.x - borderLeft, box.y - borderTop];
    } else {// safari & opera
        pos = [el.offsetLeft, el.offsetTop];
        parent = el.offsetParent;
        if (parent != el) {
            while (parent) {
                pos[0] += parent.offsetLeft;
                pos[1] += parent.offsetTop;
                parent = parent.offsetParent;
            }
        }
        if (ua.indexOf('opera') != -1 || (ua.indexOf('safari') != -1 && el.style.position == 'absolute')) {
            pos[0] -= document.body.offsetLeft;
            pos[1] -= document.body.offsetTop;
        }
    }
    if (el.parentNode) {
        parent = el.parentNode;
    } else {
        parent = null;
    }
    while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors
        pos[0] -= parent.scrollLeft;
        pos[1] -= parent.scrollTop;
        if (parent.parentNode) {
            parent = parent.parentNode;
        } else {
            parent = null;
        }
    }
    return {x: pos[0], y: pos[1]};
}
/**
 * 获取ie版本
 * @returns {number} 版本号
 * @constructor
 */
V3X.prototype.IEVersion = function () {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //判断是否IE的Edge浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    if (isIE) {
        var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
        reIE.test(userAgent);
        var fIEVersion = parseFloat(RegExp["$1"]);
        if (fIEVersion == 7) {
            return 7;
        } else if (fIEVersion == 8) {
            return 8;
        } else if (fIEVersion == 9) {
            return 9;
        } else if (fIEVersion == 10) {
            return 10;
        } else {
            return 6; //IE版本<=7
        }
    } else if (isEdge) {
        return 20; //edge
    } else if (isIE11) {
        return 11; //IE11
    } else {
        return 30; //不是ie浏览器
    }
}

/**
 * 是按钮失效，参数button支持id，和object
 *
 */
function disableButton(button, height) {
    height = height || "100%";
    if (!button) {
        return false;
    }

    var el = null;
    if (typeof button == "string") {
        el = document.getElementById(button);
    } else {
        el = button;
    }

    if (!el) {
        return false;
    }

    if (document.readyState != "complete") {
        if (typeof button == "string") {
            window.setTimeout("disableButton('" + button + "')", 2500);
        } else {
            window.setTimeout("disableButton(" + button + ")", 2500);
        }

        return;
    }

    var cDisabled = el.cDisabled;
    cDisabled = (cDisabled != null);
    if (!cDisabled) {
        el.cDisabled = true;

        if (document.getElementsByTagName) {
            var str = "<span style='background: buttonshadow; filter: chroma(color=white) dropshadow(color=buttonhighlight, offx=1, offy=1); height: " + height + ";'>";
            str += "  <span style='filter: mask(color=white); height: " + height + "'>";
            str += el.innerHTML
            str += "  </span>";
            str += "</span>";

            el.innerHTML = str;
        } else {
            el.innerHTML = '<span style="background: buttonshadow; width: 100%; height: 100%; text-align: center;">' + '<span style="filter:Mask(Color=buttonface) DropShadow(Color=buttonhighlight, OffX=1, OffY=1, Positive=0); height: 100%; width: 100%; text-align: center;">' + el.innerHTML + '</span>' + '</span>';
        }

        if (el.onclick != null) {
            el.cDisabled_onclick = el.onclick;
            el.onclick = null;
        }

        if (el.onmouseover != null) {
            el.cDisabled_onmouseover = el.onmouseover;
            el.onmouseover = null;
        }

        if (el.onmouseout != null) {
            el.cDisabled_onmouseout = el.onmouseout;
            el.onmouseout = null;
        }
    }
}

/**
 * 使按钮生效
 */
function enableButton(button) {
    if (!button) {
        return false;
    }

    var el = null;
    if (typeof button == "string") {
        el = document.getElementById(button);
    } else {
        el = button;
    }

    if (!el) {
        return false;
    }

    var cDisabled = el.cDisabled;
    cDisabled = (cDisabled != null);

    if (cDisabled) {
        el.cDisabled = null;
        el.innerHTML = el.children[0].children[0].innerHTML;

        if (el.cDisabled_onclick != null) {
            el.onclick = el.cDisabled_onclick;
            el.cDisabled_onclick = null;
        }

        if (el.cDisabled_onmouseover != null) {
            el.onmouseover = el.cDisabled_onmouseover;
            el.cDisabled_onmouseover = null;
        }

        if (el.cDisabled_onmouseout != null) {
            el.onmouseout = el.cDisabled_onmouseout;
            el.cDisabled_onmouseout = null;
        }

    }
}


/*************************************   附件  **********************************************************/

var attachmentConstants = {
    height: 22
}

function downloadAttachment() {
}

/**
 *
 * @param {*} v ：附件版本
 * @param {*} fileId ：附件fileUrl
 * @param {*} createDate ：创建时间
 * @param {*} filename ：附件名称
 * @returns
 */
function downloadAttachmentNew(v, fileId, createDate, filename) {
    if (fileId) {
        var checkResult = callBackendMethod('secretAjaxManager', 'checkUserSecretLevel', fileId);
        if (checkResult && checkResult.length > 0) {
            $.alert(checkResult);
            return;
        }
    }
    var downloadOrUploadStr = v ? '/fileDownload.do' : '/fileUpload.do';
    var methodStr = '?method=download';
    var fileIdStr = '&fileId=' + fileId;
    var versionStr = v ? '&v=' + v : '';
    var createDateStr = '&createDate=' + createDate.substring(0, 10);
    var fileNameStr = '&filename=' + encodeURIComponent(filename);
    var suffixStr = CsrfGuard.getUrlSurffix();
    var src =
        _ctxPath +
        downloadOrUploadStr +
        methodStr +
        fileIdStr +
        versionStr +
        createDateStr +
        fileNameStr +
        suffixStr;
    var iframe = document.createElement('iframe');
    iframe.style.height = 0;
    iframe.style.width = 0;
    iframe.style.opacity = 0; // 节点设置不可见
    document.body.appendChild(iframe);
    var timer = setInterval(function () {
        if (iframe) {
            if (iframe.contentWindow.document.readyState === 'complete') {
                setTimeout(function () {
                    iframe.parentNode.removeChild(iframe);
                    iframe = null;
                }, 10000);
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                }
            }
        }
    }, 2000);
    iframe.src = src;

    // setTimeout(function() {
    //     iframe.parentNode.removeChild(iframe);
    //     //frame.remove();//删除iframe
    //     iframe=null;
    //     // iframe.remove();
    // }, 1000);
}

/**
 *
 * @param {*} v ：附件版本
 * @param {*} fileId ：附件fileUrl
 * @param {*} createDate ：创建时间
 * @param {*} filename ：附件名称
 * @returns
 */
function newHrefStr(v, fileId, createDate, filename) {
    var downloadOrUploadStr = v ? "/fileDownload.do" : "/fileUpload.do";
    var methodStr = '?method=download';
    var fileIdStr = '&fileId=' + fileId;
    var versionStr = v ? ("&v=" + v) : "";
    var createDateStr = '&createDate=' + createDate.substring(0, 10);
    var fileNameStr = '&filename=' + escapeStringToHTML(encodeURIComponent(filename));
    var suffixStr = CsrfGuard.getUrlSurffix();
    return _ctxPath + downloadOrUploadStr + methodStr + fileIdStr + versionStr + createDateStr + fileNameStr + suffixStr
}


/**
 * 附件对象
 * 特别说明：needClone 是指，该附件需要复制，如：转发协同的原有附件需要复制一份
 *
 */
function Attachment(id, reference, subReference, category, type, filename, mimeType, createDate, size, fileUrl, description, needClone, extension, icon, onlineView, isCanTransform, v, secretLevel, secretLevelName, isEnableOnlineView) {
    this.id = id;
    this.reference = reference;
    this.subReference = subReference;
    this.category = category;
    this.type = type;
    this.filename = filename;
    this.mimeType = mimeType;
    this.createDate = createDate;
    this.size = size;
    this.fileUrl = fileUrl;
    this.description = description || "";
    this.needClone = needClone;
    this.extension = extension;

    this.icon = icon;

    //office永中转换开关判断参数
    this.isCanTransform = isCanTransform == 'enable' ? true : false;

    this.enableOnlineView = isEnableOnlineView;
    this.onlineView = onlineView == null ? true : onlineView;

    this.extReference = ""; //扩展Reference，在保存附件表的时候，Reference字段以这个值为准（前提是不空），否则以接口传来的参数为准
    this.extSubReference = ""; //扩展subReference，在保存附件表的时候，subReference字段以这个值为准（前提是不空），否则以接口传来的参数为准
    this.showArea = "";
    this.embedInput = ""; //内嵌inputid值
    this.hasSaved = false;
    this.v = v;
    this.canFavourite = true;
    this.isShowImg = false;
    this.fileUrl2 = fileUrl;//fileUrl2 用于备份旧的fileUrl，当编辑office时，会产生一个新的fileUrl，此时将旧的fileUrl备份，fileUrl变量中始终存储的是最新值
    this.businessId = "";// 关联文档主业务数据ID， 比如协同待办关联数据的 summaryId
    this.secretLevel = secretLevel; // 附件密级枚举值
    this.secretLevelName = secretLevelName// 附件密级名称
}


var pw = new Object();

function loadInit() {
    var cacheKey = 'ActiveXObject.Kinggrid.iWebOffice';
    var storage = window.sessionStorage;

    if (storage) {
        var cachedItem = storage.getItem(cacheKey)
        if (cachedItem != undefined && (typeof JSON != 'undefined')) {
            pw = JSON.parse(cachedItem);
        }
    }

    if (!pw.inited || !pw.attFileType) {
        try {
            var ocxObj = "";
            if (navigator.cpuClass.indexOf("x86") != -1) {
                ocxObj = new ActiveXObject("Kinggrid.iWebOffice");
            } else {
                ocxObj = new ActiveXObject("Kinggrid.iWebOffice_x64");
            }
            pw.installDoc = ocxObj.WebApplication(".doc");
            pw.installXls = ocxObj.WebApplication(".xls");
            pw.installWps = ocxObj.WebApplication(".wps");
            pw.installEt = ocxObj.WebApplication(".et");
            pw.installEt = ocxObj.WebApplication(".ppt");
        } catch (e) {
            pw.installDoc = true;
            pw.installXls = true;
            pw.installWps = true;
            pw.installEt = true;
            pw.installPpt = true;
        }

        if (pw.installDoc) {
            attFileType.put("application/msword", "OfficeWord");
            attFileType.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "OfficeWord");
            attFileType.put(".doc", "OfficeWord");
            attFileType.put(".docx", "OfficeWord");
            attFileType.put("application/kswps", "OfficeWord");
            attFileType.put(".wps", "OfficeWord");
        }
        if (pw.installXls) {
            attFileType.put("application/vnd.ms-excel", "OfficeExcel");
            attFileType.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "OfficeExcel");
            attFileType.put(".xls", "OfficeExcel");
            attFileType.put(".xlsx", "OfficeExcel");
            attFileType.put("application/kset", "OfficeExcel");
            attFileType.put(".et", "OfficeExcel");
        }
        if (pw.installWps) {
            attFileType.put("application/kswps", "OfficeWord");
            attFileType.put(".wps", "OfficeWord");
            attFileType.put("application/msword", "OfficeWord");
            attFileType.put("application/vnd.openxmlformats-officedocument.wordprocessingml.document", "OfficeWord");
            attFileType.put(".doc", "OfficeWord");
            attFileType.put(".docx", "OfficeWord");
        }
        if (pw.installEt) {
            attFileType.put("application/kset", "OfficeExcel");
            attFileType.put(".et", "OfficeExcel");
            attFileType.put("application/vnd.ms-excel", "OfficeExcel");
            attFileType.put("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "OfficeExcel");
            attFileType.put(".xls", "OfficeExcel");
            attFileType.put(".xlsx", "OfficeExcel");
        }
        if (pw.installPpt) {
            attFileType.put("application/kset", "OfficePowerPoint");
            attFileType.put("application/vnd.ms-powerpoint", "OfficePowerPoint");
            attFileType.put("application/vnd.openxmlformats-officedocument.presentationml.presentation", "OfficePowerPoint");
            attFileType.put(".ppt", "OfficePowerPoint");
            attFileType.put(".pptx", "OfficePowerPoint");
        }
        pw.attFileType = attFileType;
    } else if (pw.attFileType) {
        attFileType = pw.attFileType;
        attFileType.get = function (key) {
            return new Properties().get.call(this, key)
        };
    }
    pw.inited = true;
    if (typeof storage !== 'undefined' && (typeof JSON != 'undefined')) {
        storage.setItem(cacheKey, JSON.stringify(pw));
    }
}

function getMimeType(mimeType, name) {
    var filename = name.toLocaleLowerCase();
    var point = filename.lastIndexOf(".");
    if (point != -1) {
        filename = filename.substring(point);
    }
    if (attFileType) {
        if (attFileType.get(mimeType)) {
            return attFileType.get(mimeType);
        }
        if (attFileType.get(filename)) {
            return attFileType.get(filename);
        }
    }
    return null;
}

/**
 * 在附件区显示附件
 */
Attachment.prototype.show = function (isShowLink, isShowClose, onlineEdit) {
    document.write(this.toString(isShowLink, isShowClose, onlineEdit));
}

window.top.isWpsTransType = function () {
    $.ajax({
        url: _ctxPath + "/rest/officeTransType/isWps",
        async: false,
        method: "GET",
        success: function (data, status) {
            if ("success" === status) {
                if (0 === data.code && data.data === true) {
                    window.top.isWpsTransTypeResult = true;
                }
            }
        }
    });
    if (window.top.isWpsTransTypeResult === undefined) {
        window.top.isWpsTransTypeResult = false;
    }
    return window.top.isWpsTransTypeResult;
}
var allowTransType;

function getAllowTransType() {
    if (!allowTransType) {
        var officeTransType = this.getOfficeTransType();
        if (officeTransType) {
            allowTransType = officeTransType.allowTransTypes;
        } else {
            allowTransType = ["doc", "docx", "xls", "xlsx", "ppt", "pptx", "rtf", "eio"];
        }
    }
    return allowTransType;
}

function isWpsTransTypeV2() {
    var result = false;
    $.ajax({
        url: _ctxPath + "/rest/officeTransType/isWps",
        async: false,
        method: "GET",
        success: function (data, status) {
            if ("success" === status) {
                if (0 === data.code && data.data === true) {
                    result = true;
                }
            }
        }
    });
    return result;
}

/**
 * 系统使用的文件转换类型及支持格式
 * @returns 对象数据 {"isOpen":true/false,"officeTransType":"aspose、wps、永中DCS","allowTransTypes":["doc","xls","pdf"]}
 */
var officeTransResult;

function getOfficeTransType() {
    // officeTransResult值不为undefined表示已经请求过，不再多次请求
    if (typeof officeTransResult != 'undefined') {
        return officeTransResult;
    }
    var result = null;
    $.ajax({
        url: _ctxPath + "/rest/officeTransType/getOfficeTransType",
        async: false,
        method: "GET",
        success: function (data, status) {
            if ("success" === status) {
                if (0 === data.code && data.data) {
                    result = {};
                    // 在线预览 seeyon config开关及插件是否开启
                    result.isOpen = data.data.isOpen;
                    // 在线预览转换类型  aspose、wps、永中DCS
                    result.officeTransType = data.data.officeTransType;
                    // 在线预览允许转换的文件类型后缀集合 数组集合[]
                    result.allowTransTypes = data.data.allowTransTypes;
                }
            }
        }
    });
    officeTransResult = result;
    return result;
}


Attachment.prototype.allowTrans = function () {
    if (this.type != 0 && this.type != 3) {
        return false;
    }
    // 后台已判断
    /*	if(parseInt(this.size) > 5242880){
		return false;
	}*/
    getAllowTransType();
    var filename = this.filename.toLowerCase();
    for (var i = 0; i < allowTransType.length; i++) {
        if (filename.endsWith("." + allowTransType[i])) {
            return true;
        }
    }

    return false;
};
var imgType = ["jpg", "gif", "jpeg", "png", "bmp"];

Attachment.prototype.isImg = function () {
    if (this.type != 0 && this.type != 3) {
        return false;
    }

    var filename = this.filename.toLowerCase();
    var filenameTypeStr = filename.lastIndexOf(".");
    filenameTypeStr = filename.substring(filenameTypeStr + 1);
    for (var i = 0; i < imgType.length; i++) {
        if (filenameTypeStr == imgType[i]) {
            return true;
        }
    }
    return false;
}

function leaveAttachmentImageShow(t) {
    var _this = $(t);
    _this.parents(".attachment_block").find(".attachment_operate_btn_bg div").hide();
}

function initAttachmentImageShow(t) {
    var fileUrl2 = $(t).attr('id');
    if (fileUrl2) {
        var checkResult = callBackendMethod("secretAjaxManager", "checkUserSecretLevel", fileUrl2);
        if (checkResult && checkResult.length > 0) {
            $.alert(checkResult);
            return;
        }
    }
    var _this = $(t);
    _this.parents(".attachment_block ").find(".attachment_operate_btn_bg div").eq(_this.parent().index()).show();
    var $show = _this.parents(".attachment_block").parent().find(".attachmentImageShow");
    if (_this.parents(".attachment_area_block").length) {
        // 公文奇葩场景
        $show = _this.parents(".attachment_area_block").find(".attachmentImageShow");
    }
    //通过length去判断是否全部init
    if ($show.length > 0 && $show.length == $show.attr("imgLength")) {
        return;
    }

    function init() {

        function isImg(att) {
            if (att.type != 0 && att.type != 3) {
                return false;
            }

            var filename = att.filename.toLowerCase();
            var filenameTypeStr = filename.lastIndexOf(".");
            filenameTypeStr = filename.substring(filenameTypeStr + 1);
            for (var i = 0; i < imgType.length; i++) {
                if (filenameTypeStr == imgType[i]) {
                    return true;
                }
            }

            return false;
        }

        var data = new Array();
        var map = {};
        $(".comp").each(function () {
            var t = $(this);
            if (t.attrObj("_comp"))
                t = t.attrObj("_comp");
            var tc = t.attr("comp"), tj, tp;
            if (tc) {
                tj = $.parseJSON('{' + tc + '}');
                tp = tj.type;
            }

            if ('fileupload' === tp) {
                var atts = tj.attsdata ? tj.attsdata : t.attr("attsdata") ? $.parseJSON(t.attr("attsdata")) : null;
                if (atts && atts instanceof Array) {
                    var att;
                    for (var i = 0; i < atts.length; i++) {
                        att = atts[i];
                        if (att.type == 2)
                            continue;
                        if (isImg(att)) {
                            map[att.fileUrl] = {
                                "dataId": att.fileUrl,
                                "src": _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + att.fileUrl + "&createDate=" + att.createdate.substring(0, 10) + "&filename=" + encodeURIComponent(att.filename)
                            };
                        }
                    }
                }
            }
        });

        // office控件影响图片查看
        var _officeIframeObj;
        var _officeIframeId = ['officeFrameDiv', 'zwIframe', 'mainbodyFrame', 'officeDivInner'];
        for (var i = 0; i < _officeIframeId.length; i++) {
            var _tempid = _officeIframeId[i];
            var _obj = document.getElementById(_tempid);
            if (_obj) {
                _officeIframeObj = _obj;
                break;
            }
        }

        $show.each(function () {
            var v = map[this.id];
            if (v !== undefined) {
                data.push(v);
            }
        }).attr("imgLength", data.length);

        if (data.length > 0) {

            var touchid = "";
            $show.each(function (index, el) {
                var tid = el.getAttribute("touchid");
                if (typeof tid != 'undefined' && tid != null) {
                    touchid = tid;
                    return;
                }
            });

            if (touchid == "") {
                var dataTimestamp = new Date().getTime();
                //加时间戳，避免ID重复  OA-101976
                touchid = data[0].dataId + dataTimestamp;
            }

            $show.attr("touchid", touchid);

            $show.touch({
                id: touchid,//查看器ID，唯一
                //直接使用数据的JSON
                datas: data,  //图片数据
                targetWindow: getCtpTop(),
                onShow: function () {
                    if (_officeIframeObj) {
                        _officeIframeObj.style.visibility = 'hidden';
                    }
                    if (hideOfficeObj) hideOfficeObj();

                },
                onHide: function () {
                    if (_officeIframeObj) {
                        _officeIframeObj.style.visibility = 'visible';
                    }
                    if (showOfficeObj) showOfficeObj();
                }
            });
        }
    }

    init();
}

var pdfType = ["pdf"];

Attachment.prototype.isPdf = function () {
    if (this.type != 0 && this.type != 3) {
        return false;
    }

    var filename = this.filename.toLowerCase();
    for (var i = 0; i < pdfType.length; i++) {
        if (filename.endsWith("." + pdfType[i])) {
            return true;
        }
    }
    return false;
}
/**
 * 金格插件只能编辑如下格式的文件
 */
Attachment.prototype.canEditOnline = function () {
    if (!($.ctx.hasPlugin('officeOnlineEdit') || $.ctx.hasPlugin('officeOnlinePreview'))) {
        return false
    }
    if (this.type != 0) {
        return false;
    }
    var mimetype = getMimeType(this.mimeType, this.filename);
    if (mimetype) {
        return true;
    }
    return false;
}


/**
 * @param isShowLink
 * @param isShowDelete
 * @param onlineEdit
 * @param notShowSecretLevel 不需要展示附件密级，修改附件的列表中不需要展示
 * @param notSplitTitle 附件展示不截取标题
 */
Attachment.prototype.toString = function (isShowLink, isShowDelete, onlineEdit, width, notShowSecretLevel, notSplitTitle, isAssdoc) {
    //传进来有可能是undefined，将notShowSecretLevel转成boolean类型
    notShowSecretLevel = !!notShowSecretLevel;
    notSplitTitle = !!notSplitTitle;
    var contextPath = _ctxPath;
    loadInit();
//	var contextPath = v3x.baseURL;
    var str = "";
    //换行
    var t = null;
    if (this.type != 2) {
        t = $("#attachmentArea" + this.showArea).prev();
    } else {
        t = $("#attachment2Area" + this.showArea).prev();
    }
    var df = "left";
    var formVisible = ";height: " + attachmentConstants.height + "px; ";
    var noWrapStr = "noWrap";
    var whiteSpaceStr = "";
    if (t && t.attr("comp") != undefined) {
        var tj = $.parseJSON('{' + t.attr("comp") + '}');
        //现在没有换行显示附件的情况，此参数已废
        // df=((tj.isBR == undefined) ? false : tj.isBR) ? "none" : "left";
        formVisible = ((tj.displayMode == undefined) ? formVisible : ";");
        noWrapStr = ((tj.displayMode == undefined) ? noWrapStr : "");
        if (!v3x.isMSIE8) {
            whiteSpaceStr = ((tj.displayMode == undefined) ? whiteSpaceStr : "word-wrap:break-word; word-break:break-all;");
        } else {
            if (tj.type != "fileupload") {
                whiteSpaceStr = ((tj.displayMode == undefined) ? whiteSpaceStr : "word-wrap:break-word; word-break:break-all;");
            } else {
                if (tj.canDeleteOriginalAtts == true) {
                    whiteSpaceStr = ((tj.displayMode == undefined) ? whiteSpaceStr : "word-wrap:break-word; word-break:break-all;");
                }
            }
        }
    }
    this.filename = this.filename.replace(/&nbsp;/g, ' ');
    //显示删除
    var _isShowDelete = "";
    if (isShowDelete) {
        _isShowDelete = "attachmentShowDelete";
    }
    //单个附件区域的最大宽度
    if ($("#attachmentArea" + this.showArea).width() == 0) {
        var singleMaxWidth = "auto";
    } else {
        var singleMaxWidth = "100%";
    }

    // 默认颜色
    var wrapperColor = '#e6eef7';
    if (window.themeJsVariables) {
        // 如果存在主题色，则使用主题色
        wrapperColor = window.themeJsVariables.themeBrand1;
    }

    str += "<div id='attachmentDiv_" + this.fileUrl2 + "' class='attachment_block "
        + _isShowDelete + "' style='color: #333;margin-bottom: 4px;font-size:12px; max-width:" + singleMaxWidth + "; float:" + df + formVisible + " line-height:22px;*line-height:22px;background:" + wrapperColor + ";padding:2px 5px;border-radius:3px; overflow:hidden;" + whiteSpaceStr + "' " + noWrapStr
        + ' onmouseenter="onAttachmentMouseEnter(this)" onmouseleave="onAttachmentMouseLeave(this)"'
        + ">";

    //文件类型图标
    var iconSpan = '';
    if (this.type != 1 && !this.isShowImg) {
        if (this.mimeType == 'uc') {
            // 致信的做特殊判断
            iconSpan +=
                `&nbsp;<i style="vertical-align: middle;font-size: 16px;" class="syDoc zhi_chat margin_r_2"></i>`;
        } else {
            if (tj?.isFormTable) {
                iconSpan +=
                    `&nbsp;<span style="word-wrap:break-word; word-break:break-all;position:relative;flex-shrink:0;" class="ico16 ${this.icon.substring(0, this.icon.indexOf('.'))}_16 margin_r_2"></span>`;
            } else {
                iconSpan +=
                    `&nbsp;<span style="word-wrap:break-word; word-break:break-all;position:relative;top:-1px;min-width: 16px;" class="ico16 ${this.icon.substring(0, this.icon.indexOf('.'))}_16 margin_r_2"></span>`;
            }
        }
    }

    let flex = 0;
    let fontSize = '12px'
    let nameWidth = 0
    if (tj?.dragTemplate && !isAssdoc) {
        flex = 1;
        fontSize = '14px'
        if (tj?.isFormTable) {
            nameWidth = '360px'
        }
    }
    //显示附件、关联文档名称及超链接
    var attNamehref = '';
    var attShowName = '';
    if (this.isShowImg) {
        str +=
            `<img style="CURSOR: pointer" onclick="openCtpWindow({'url':$(this).attr('src') + '&showType=small'})" src="${contextPath}/fileUpload.do?method=showRTE&fileId=${this.fileUrl2}&createDate=${this.createDate.substring(0, 10)}&type=image">`;
    } else if (isShowLink && (this.type == 0 || this.type == 3 || this.type == 5)) {
        //downloadURL
        var newHref = newHrefStr(this.v, this.fileUrl2, this.createDate, this.filename);
        if (this.type == 3) {
            attNamehref +=
                `<a _temp='${newHref}' _createdatestr='${this.createdateStr}' _id='${this.fileUrl2}' onclick='downloadAttachment("${this.fileUrl2}","${this.createDate.substring(0, 10)}","${escapeStringToHTML(this.filename)}")' title="${escapeStringToHTML(this.filename)}" target='downloadFileFrame' style='text-overflow: ellipsis;white-space: nowrap;overflow: hidden;font-size:${fontSize};color:#333;display: inline-flex;${nameWidth ? 'max-width:' + nameWidth : ''} class='like-a'>`;
        } else {
            //   attNamehref += "<a href=\"" + contextPath + "/file" + (this.v?"Download":"Upload") + ".do?method=download&fileId=" + this.fileUrl2 + (this.v?("&v=" + this.v):"") + "&createDate=" + this.createDate.substring(0, 10) + "&filename=" + encodeURIComponent(this.filename) + CsrfGuard.getUrlSurffix() + "\" title=\"" +escapeStringToHTML(this.filename) + "\" target='downloadFileFrame' style='font-size:12px;color:#333;'>";
            attNamehref +=
                `<a _temp='${newHref}' _createdatestr='${this.createdateStr}' _id='${this.fileUrl2}' onClick='downloadAttachmentNew("${this.v}","${this.fileUrl2}","${this.createDate}","${escapeStringToHTML(this.filename)}")'  title="${escapeStringToHTML(this.filename)}" target='downloadFileFrame' style='text-overflow: ellipsis;white-space: nowrap;overflow: hidden;font-size:${fontSize};color:#333;display: inline-flex;${nameWidth ? 'max-width:' + nameWidth : ''}'>`;
        }
    }
    if (onlineEdit && this.category != 2) {
        str +=
            `<a onclick="editOfficeOnline('${this.id}')" title="${escapeStringToHTML(this.filename)}" target='downloadFileFrame' style='font-size:12px;color:#333;flex: ${flex}' class='like-a'>`;
        isShowLink = true;
    }
    if ((this.type == 2 || this.type == 4) && this.description && (onlineEdit != false)) {	//文档
        var click = "";
        var suffix = ""; //表单子流程中的关联文档 关联的是主流程id，需要在此传入子流程id，用于判断权限.
        if (this.type == 4) {
            try {
                if (parent.parent.openerSummaryId && parent.parent.openerSummaryId != this.reference) {
                    suffix = "&openerSummaryId=" + parent.parent.openerSummaryId;
                } else {
                    if (noFlowRecordId) {
                        suffix = "&noFlowRecordId=" + noFlowRecordId;
                    }
                }
            } catch (e) {
            }
        }
        if (this.mimeType == "collaboration") {
            click = "openDetailURL('" + contextPath + "/collaboration/collaboration.do?method=summary&openFrom=glwd&type=&affairId=" + this.description + "&baseObjectId=" + this.reference + "&baseApp=" + this.category + CsrfGuard.getUrlSurffix() + "')";
        }
        if (this.mimeType == "edoc") {
            click = "openDetailURL('" + contextPath + "/edocController.do?method=detailIFrame&from=Done&openFrom=glwd&affairId=" + this.description + "&isQuote=true&baseObjectId=" + this.reference + "&baseApp=" + this.category + CsrfGuard.getUrlSurffix() + "')";
        } else if (this.mimeType == "km") {
            click = "openDetailURL('" + contextPath + "/doc.do?method=docOpenIframeOnlyId&openFrom=glwd&docResId=" + this.description + "&baseObjectId=" + this.reference + "&baseApp=" + this.category + suffix + CsrfGuard.getUrlSurffix() + "')";
        } else if (this.mimeType == "meeting") {
            click = "openDetailURL('" + contextPath + "/meeting.do?method=view&meetingId=" + this.description + "&isQuote=true&baseObjectId=" + this.reference + "&baseApp=" + this.category + CsrfGuard.getUrlSurffix() + "&state=10')";
        } else if (this.mimeType == "info") {
            click = "openDetailURL('" + contextPath + "/info/infoDetail.do?method=summary&baseObjectId=" + this.reference + "&refAffairId=" + this.description + CsrfGuard.getUrlSurffix() + "')";
        } else if (this.mimeType == "uc") {
            click = "openZxchatMessage('" + this.description + "')";
        }

        attNamehref += "<a class=\"hand\" onclick=\"" + click + "\" title=\"" + escapeStringToHTML(this.filename) + "\" style='color:#333;cursor: hand;font-size:" + fontSize + ";'>";
        isShowLink = true;
    }
    /* 对名称不再截断
     * if(this.type != 1 && (this.embedInput==null || this.embedInput=='' || this.category !=2 )){ */
    //改为表单组不截断，其他都截断
    var len = 10;
    if (tj?.dragTemplate && !isAssdoc) {
        len = 40;

        if (tj?.isFormTable) {
            len = 20;
        }
    }

    /* 代码开始：解决V5-2774- 文单处理意见时（控件相对较窄），上传附件后无法删除*/
    var attDom = document.getElementById('attachmentTRyijian'); // 解决意见区附件问题
    if (attDom && attDom.clientWidth < 250) {
        len = 10;
    }
    /* 代码结束 */

    if (!this.isShowImg) {
        //attShowName += this.filename.getLimitLength(len).escapeHTML();
        if (this.filename.length > len && !notSplitTitle) {
            attShowName += this.filename.substring(0, len).escapeHTML() + "..";
        } else {
            attShowName += this.filename.escapeHTML();
        }
    }

    if (this.size && this.type == 0) {
        if (!this.isShowImg) {
            var sizeStr = "";
            if (this.size >= 1048576) {
                sizeStr = (parseInt(this.size / 1048576) + 1) + "MB";
            } else {
                sizeStr = (parseInt(this.size / 1024) + 1) + "KB";
            }
            attShowName += "(" + sizeStr + ")";
        }
    } // 名称及超链end
    if (!this.isShowImg && this.embedInput != null && this.embedInput.indexOf('field') >= 0) {
        if (tj?.isFormTable && !isAssdoc) {
            //表单附件
            attShowName =
                `<span id='${this.embedInput}_txt' style='line-height:normal;max-width: 439px; height: 100%; width: auto; display: flex; align-items: center; border: none;'>${attShowName}</span>`; //继承infopath样式
        } else {
            //表单附件
            attShowName =
                `<span id='${this.embedInput}_txt' style='line-height:normal'>${attShowName}</span>`; //继承infopath样式
        }
    }
    //浮动菜单中响应超链
    var officetransTd = '';
    var downloadTd = '';
    var favoriteTd = '';
    var tdEventStr = ' onmouseenter="onAttachmentButtonMouseenter(this)"  onmouseleave="onAttachmentButtonMouseleave(this)" '
    //下载
    if (isShowLink && this.hasSaved && !this.isShowImg) {
        downloadTd = '<td align="center"' + tdEventStr + '>' + attNamehref + '<span class="ico24 download_24"> </span></a></td>';
    }
    if (typeof ($.ctx) !== "undefined") {
        var hasOfficeTransPlugin = $ && $.ctx && $.ctx.plugins && $.ctx.plugins.contains("baseOfficeTrans") || $ && $.ctx && $.ctx.plugins && $.ctx.plugins.contains("yongzhongOfficeTrans");
    }
    if (typeof (vPortal) !== "undefined") {
        var hasOfficeTransPlugin = vPortal && vPortal.plugins.contains("baseOfficeTrans") || vPortal && vPortal.plugins && vPortal.plugins.contains("yongzhongOfficeTrans");
    }
    var hasOfficeTransPlugin = ($ && $.ctx && $.ctx.plugins && $.ctx.plugins.contains("baseOfficeTrans") || $ && $.ctx && $.ctx.plugins && $.ctx.plugins.contains("yongzhongOfficeTrans"));
    //officetrans 查看
    if (this.isImg()) {
        officetransTd += "<td align='center'><a id =" + this.fileUrl2 + " onmouseleave='leaveAttachmentImageShow(this)' onmouseenter='initAttachmentImageShow(this);' class ='attachmentImageShow' style='font-size:12px;color:#333;' title='" + $.i18n("common.operate.view") + "'><span class='ico24 preview_24'></span></a></td>";
    } else if (isShowLink && this.enableOnlineView && this.allowTrans()) {
        if (this.isImg()) {
            officetransTd += "<td align='center'><a id =" + this.fileUrl2 + " onmouseleave='leaveAttachmentImageShow(this)' onmouseenter='initAttachmentImageShow(this);' class ='attachmentImageShow' style='font-size:12px;color:#333;' title='" + $.i18n("common.operate.view") + "'><span class='ico24 preview_24'></span></a></td>";
        } else {
            officetransTd += "<td align='center'" + tdEventStr + "><a href=\"" + contextPath + "/officeTrans.do?method=view&fileId=" + this.fileUrl2 + "&createDate=" + this.createDate.substring(0, 10) + "&filename=" + encodeURIComponent(this.filename) + "&v=" + this.v + "&needDownload=" + (isShowLink && this.hasSaved) + "&dcs_isDownload=1" + "&dcs_fileName=" + encodeURIComponent(this.filename) + "&dcs_isHeaderBar=1\" target='downloadFileFrame' style='font-size:12px;color:#333;' title='" + $.i18n("common.operate.view") + "'><span class='ico24 preview_24'></span></a></td>";
        }
    } else if (this.hasSaved && this.isPdf()) {
        if (isWpsTransTypeV2()) {
            officetransTd += "<td align='center'" + tdEventStr + "><a href=\"" + contextPath + "/officeTrans.do?method=view&fileId=" + this.fileUrl2 + "&createDate=" + this.createDate.substring(0, 10) + "&filename=" + encodeURIComponent(this.filename) + "&v=" + this.v + ("&dcs_isDownload=" + (isShowLink ? "1" : "0")) + "&dcs_fileName=" + encodeURIComponent(this.filename) + "&dcs_isHeaderBar=1\" target='downloadFileFrame' style='font-size:12px;color:#333;' title='" + $.i18n("common.operate.view") + "'><span class='ico24 preview_24'></span></a></td>";
        } else {
            officetransTd += "<td align='center'><a onclick=preViewDialog(\"" + contextPath + "/fileDownload.do?method=doDownload4Office&type=Pdf&isOpenFile=true&fileId=" + this.fileUrl2 + "&createDate=" + this.createDate.substring(0, 10) + "&filename=" + encodeURIComponent(this.filename) + "&v=" + this.v + "\")   style='font-size:12px;color:#333;' title='" + $.i18n("common.operate.view") + "'><span class='ico24 preview_24'></span></a></td>";
        }
    }

    //因和5.0的doamin提交冲突，先屏蔽，
    //str += "&nbsp;<input type=\"hidden\" name=\"input_file_id\"   value=\""+ this.fileUrl +"\" / >&nbsp;";

    //显示附件收藏
    if (typeof ($.ctx) !== "undefined" && typeof ($.ctx.plugins) !== "undefined") {
        var hasDocPlugin = $.ctx.plugins.contains('doc');
    }
    if (typeof (vPortal) !== "undefined" && typeof (vPortal.plugins) !== "undefined") {
        var hasDocPlugin = vPortal.plugins.contains("doc");
    }
    if (hasDocPlugin && seeyonProductId > 0 && this.hasSaved && this.canFavourite && this.type != 2 && !this.isShowImg) {
        var sHide = 'style="display: none;"', sShow = '';
        if (this.hasFavorite) {
            sShow = sHide;
            sHide = '';
        }
        favoriteTd += '<td align="center"' + tdEventStr + '><span id="favoriteSpan' + this.fileUrl2 + '" class="ico24 unstore_24" ' + sShow + ' title="' + $.i18n("common.collection.label") + '" onclick="favorite(\'' + this.category + '\', \'' + this.fileUrl2 + '\',false,4, null, null, null, null, \'' + this.v + '\')" > </span>';
        favoriteTd += '<span id="cancelFavorite' + this.fileUrl2 + '" class="ico24 stored_24" ' + sHide + ' title="' + $.i18n("common.cancel.collection.label") + '" onclick="cancelFavorite(\'' + this.category + '\', \'' + this.fileUrl2 + '\',false,4)" > </span></td>';
    }
    //gjx-放开审批页面的附件权限
    if (this.type == 0) {
        console.log("成功进入审批页面的附件权限代码")
        // 因为这里不像下面有现成的 att 变量，我们需要手动构造一个 JSON 传给你的 previewAttachment
        var mockAttObj = {
            type: "0",
            fileUrl: this.fileUrl2 || this.fileUrl, // 兼容不同的附件id取值
            filename: this.filename,
            createDate: this.createDate
        };
        // 严谨转义，防止文件名里的特殊字符把 HTML 标签撑爆
        var mockAttJsonStr = JSON.stringify(mockAttObj).replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\\/g, '\\\\');

        // 强行覆盖 officetransTd，不管前面致远怎么判断，到这里统统听我们的！
        officetransTd = '<td align="center"' + tdEventStr + '><a onclick="previewAttachment(\'' + mockAttJsonStr + '\')" style="cursor:pointer; display:block; width:100%; height:100%;" title="在线预览"><span class="ico24 preview_24"></span></a></td>';
    }
    //gjx-end


    //浮动菜单
    if (!isShowDelete && !this.isShowImg && !onlineEdit && this.type != 2) {
        str += '<div class="attachment_operate">';
        str +=
            '<table class="attachment_operate_btn"  title="' +
            escapeStringToHTML(this.filename) +
            '"  border="0" cellpadding="0" cellspacing="0">';
        str += '<tr>';
        str += favoriteTd;
        str += downloadTd;
        str += officetransTd;
        str += '</tr>';
        str += '</table>';
        str += '<table class="attachment_operate_btn_bg" border="0" cellpadding="0" cellspacing="0">';
        str += '<tr>';
        if (favoriteTd.length > 0)
            str += '<td align="center"><div>&nbsp;</div></td>';
        if (downloadTd.length > 0)
            str += '<td align="center"><div>&nbsp;</div></td>';
        if (officetransTd.length > 0)
            str += '<td align="center"><div>&nbsp;</div></td>';
        str += '</tr>';
        str += '</table>';
        str += '<div class="attachment_operate_bg">&nbsp;</div>';
        str += '</div>';
        // bindMouseenterFunction();
    }

    if (this.type != 1 && !this.isShowImg) {
        str += iconSpan;
    }
    !notShowSecretLevel && this.secretLevelName && (str += '<span style="color:#FF4141;margin-right: 2px">[' + this.secretLevelName + ']</span>')

    if (isShowDelete) {
        str += attNamehref;
    } else if (this.type == 2) {
        str += attNamehref;
    }
    str += attShowName;

    //显示删除
    if (isShowDelete) {
        str += '</a><span class="ico16 affix_del_16" title="' + $.i18n("common.toolbar.delete.label") + '" onclick="deleteAttachment(\'' + this.fileUrl2 + '\')" ></span>';
    } else {
        str += '</a>';
    }

    //在线编辑office文档
    if (isShowDelete && this.canEditOnline() && this.id != undefined && this.category == 2) {
        str += '<iframe id=\'officeEditorIframe\' name=\'officeEditorIframe\' frameborder="0" height="0" width="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>';
        str += `<span id="editOnline_${this.id}" > <a class="hand" title = "${$.i18n('common.operate.edit')}" onclick="editOfficeOnline4Form('${this.id}','${this.fileUrl}','${escapeStringToJavascript(this.filename)}','${this.mimeType}','${this.category}','${this.createDate}','${this.fileUrl2}')"><span class="ico16 editor_16"></span></a></span>`;
    }

    str += '&nbsp;</div>';


    if (tj?.dragTemplate && !isAssdoc) {
        let att = JSON.stringify(this).replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/\\/g, '\\\\');
        str = '';
        if (tj?.isFormTable) {
            str +=
                `<div id='attachmentDiv_${this.fileUrl2}' class='attachment_block ${_isShowDelete}' style='margin:5px 0px;display: flex;align-items: center;font-size:12px; max-width:${singleMaxWidth}; ${formVisible} line-height:22px;*line-height:22px;background:${wrapperColor};padding:2px 5px;border-radius:3px; overflow:hidden;${whiteSpaceStr}' ${noWrapStr} onmouseenter="onAttachmentMouseEnterNew(this)" onmouseleave="onAttachmentMouseLeaveNew(this)">`;
        } else {
            str +=
                `<div id='attachmentDiv_${this.fileUrl2}' class='attachment_block ${_isShowDelete}' style='height: 38px; background: none; border-bottom: 1px solid #F0F0F0;display: flex;align-items: center;font-size:12px; max-width:${singleMaxWidth};line-height:22px;*line-height:22px;padding:2px 5px;border-radius:3px; overflow:hidden;${whiteSpaceStr}' ${noWrapStr} onmouseenter="onAttachmentMouseEnter(this)" onmouseleave="onAttachmentMouseLeave(this)">`;
        }
        // str = '';

        if (Number(this.type) !== 2) {
            str += `<img src='${contextPath}/common/image/img/dragIcon.png' alt="" style='width:16px;height:16px;cursor: pointer;'>`;
        }

        str += '<div style="display: flex;align-items: center; position: relative;flex: 1;width: calc(100% - 100px);">';
        str += iconSpan;
        str += attNamehref;
        str += this.filename + '</a>';
        if (sizeStr) {
            str += "(" + sizeStr + ")"
        }

        if (tj?.isFormTable) {
            console.log("==== 附件开始渲染啦 ====", this.filename, this);
            let downLoadHref = attNamehref.replace('flex: 1', '')
            downLoadHref = downLoadHref.replace('max-width: 360px', '')
            officetransTd = `<a id =${this.fileUrl2} onmouseleave='leaveAttachmentImageShow(this)' onmouseenter='initAttachmentImageShow(this);' style='font-size:12px;color:#333;' title='${$.i18n('common.operate.view')}'><span class='ico24 preview_24'></span></a>`;
            str += `<div class="operatingArea" style="border-radius: 4px;display: none;align-items: center;position: absolute;top: 0; bottom: 0;left: 0;right: 0; background: rgba(0, 0, 0, .5);color: #fff;">`;
            // 下载
            str += `<span style="flex: 1;display: flex;align-items: center;    justify-content: center; cursor: pointer;">${downLoadHref}<span class="ico24 download_24"></span></a></span>`;
            // 预览
            // --- gjx-start强行注入 FileZ 预览按钮 ---
            // 重新手写一个 a 标签，并加上 !important 防止被致远的 CSS 隐藏，顺便把字色改白适配黑底
            let forcePreviewHtml = `<a title='在线预览' style='cursor:pointer;'><span class='ico24 preview_24' style='display: inline-block !important; filter: brightness(0) invert(1);'></span></a>`;

            // 不加任何 if 判断，只要渲染了工具栏，就给我塞进去！
            str += `<span style="flex: 1;display: flex;align-items: center;justify-content: center;" onclick="previewAttachment('${att}')">${forcePreviewHtml}</span>`;
            // gjx-end------------------------------
            // 删除
            if (isShowDelete) {
                str += `<span style="flex: 1;display: flex;align-items: center;justify-content: center;">`;
                str += `<span class="" style="display: flex;align-items: center;justify-content: center;" title="${$.i18n('common.toolbar.delete.label')}" onclick="deleteAttachment('${this.fileUrl2}','${this.showArea}')" >`;
                str += `<img src='${contextPath}/common/image/img/delete.png' style='width:24px;height:24px;cursor: pointer;'>`;
                str += `</span></span>`;
            }
            //在线编辑office文档
            if (isShowDelete && this.canEditOnline() && this.id != undefined && this.category == 2) {
                str += `<span style="flex: 1;display: flex;align-items: center;justify-content: center;">`;
                str += '<iframe id=\'officeEditorIframe\' name=\'officeEditorIframe\' frameborder="0" height="0" width="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>';
                str += `<span id="editOnline_${this.id}" > 
		<a class="hand" title = "${$.i18n('common.operate.edit')}" onclick="editOfficeOnline4Form('${this.id}','${this.fileUrl}','${escapeStringToJavascript(this.filename)}','${this.mimeType}','${this.category}','${this.createDate}','${this.fileUrl2}')">
		<span class="ico16 editor_16" style="color: #fff !important;"></span>
		</a></span>`;
                str += `</span>`;
            }
            // operatingArea
            str += '</div>';
            str += '</div>';
        } else {
            str += '</div>';
            if (Number(this.type) !== 2) {
                str += `<div>
				<span style="margin-left: 10px;color: var(--theme-brand6, #296fbe);font-size: 14px; cursor: pointer;" onclick="previewAttachment('${att}')">${$.i18n('common.toolbar.preview.label')}</span>
				<span style="margin-left: 10px;color: var(--theme-brand6, #296fbe);font-size: 14px; cursor: pointer;" onclick="deleteAttachment('${this.fileUrl2}','${this.showArea}')">${$.i18n('common.toolbar.delete.label')}</span>
			</div>`;
            } else {
                str += `<div><span style="margin-left: 10px;color: var(--theme-brand6, #296fbe);font-size: 14px; cursor: pointer;" onclick="deleteAttachment('${this.fileUrl2}','${this.showArea}')">${$.i18n('common.toolbar.delete.label')}</span></div>`;
            }
        }
    }
    return str;
};

//判断是否图片附件
function isImgType(att) {
    if (att.type != 0 && att.type != 3) {
        return false;
    }
    var filename = att.filename.toLowerCase();
    var filenameTypeStr = filename.lastIndexOf(".");
    filenameTypeStr = filename.substring(filenameTypeStr + 1);
    for (var i = 0; i < imgType.length; i++) {
        if (filenameTypeStr == imgType[i]) {
            return true;
        }
    }
    return false;
}

function previewAttachment(e) {
    //gjx-start
    // 【日志 1：拦截起点】
    console.log("=== [FileZ Preview] 触发自定义预览拦截 ===");
    console.log("[FileZ Preview] 原始入参 e (JSON字符串):", e);

    try {
        // 1. 解析附件数据
        let att = JSON.parse(e);
        console.log("[FileZ Preview] 解析后的附件对象 att:", att);

        const type = att.type;

        // ==========================================
        // 拦截核心：type == '0' 普通文件附件走 FileZ
        // ==========================================
        if (type == '0') {
            console.log("[FileZ Preview] 识别为普通附件(type=0)，进入 FileZ 预览流程");

            // 提取所需的关键参数，致远的 att.fileUrl 其实就是我们要的 fileId
            let fileId = att.fileUrl;
            let fileName = att.filename;
            let createDate = att.createDate;

            console.log(`[FileZ Preview] 提取参数 -> fileId: ${fileId}, fileName: ${fileName}, createDate: ${createDate}`);

            // 构造 FileZ 请求参数
            var paramData = {
                "fileId": fileId,
                "createDate": createDate,
                "fileName": fileName,
                "state": "view"
            };

            console.log("[FileZ Preview] 准备调用接口 euFileZManager.fileZInit, 请求参数:", paramData);

            // 调用客开接口获取 URL
            var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);
            console.log("[FileZ Preview] 后台接口返回结果:", fileZRavl);

            if (fileZRavl != null) {
                var showUrl = fileZRavl.url;
                if (showUrl != null && showUrl !== "") {
                    console.log("[FileZ Preview] 获取 URL 成功，新窗口打开:", showUrl);
                    window.open(
                        showUrl,
                        "_blank",
                        "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
                    );
                } else {
                    console.warn("[FileZ Preview] 警告: 接口返回成功，但 url 为空。");
                    $.alert("获取预览地址失败，文件可能已损坏或后台未返回地址。");
                }
            } else {
                console.error("[FileZ Preview] 错误: 后台接口返回 null。");
                $.alert("后台异常，无法获取预览信息。");
            }

            // 【关键】处理完毕，直接 return，截断致远原生后续那一大堆弹窗逻辑
            console.log("=== [FileZ Preview] 普通附件预览处理完毕，截断原生逻辑 ===");
            return;
        }

        // ==========================================
        // 保留逻辑：type == '2' 关联文档，保持原生跳转
        // ==========================================
        if (type == '2') {
            console.log("[FileZ Preview] 识别为关联文档(type=2)，保留致远原生跳转逻辑");

            if (att.mimeType === 'collaboration') {
                openDetailURL(
                    `${_ctxPath}/collaboration/collaboration.do?method=summary&openFrom=glwd&type=&affairId=${att.description}` +
                    `&baseObjectId=${att.reference}&baseApp=${att.category}${CsrfGuard.getUrlSurffix()}`
                );
            } else if (att.mimeType === 'edoc') {
                openDetailURL(
                    `${_ctxPath}/edocController.do?method=detailIFrame&from=Done&openFrom=glwd&affairId=${att.description}` +
                    `&isQuote=true&baseObjectId="${att.reference}&baseApp=${
                        att.category
                    }${CsrfGuard.getUrlSurffix()}`
                );
            } else if (att.mimeType === 'km') {
                openDetailURL(
                    `${_ctxPath}/doc.do?method=docOpenIframeOnlyId&openFrom=glwd&docResId=${att.description}` +
                    `&baseObjectId=${att.reference}&baseApp=${att.category}${CsrfGuard.getUrlSurffix()}`
                );
            } else if (att.mimeType === 'meeting') {
                openDetailURL(
                    `${_ctxPath}/meeting.do?method=view&meetingId=${att.description}&isQuote=true&` +
                    `baseObjectId=${att.reference}&baseApp=${
                        att.category
                    }${CsrfGuard.getUrlSurffix()}&state=10`
                );
            } else if (att.mimeType === 'info') {
                openDetailURL(
                    `${_ctxPath}/info/infoDetail.do?method=summary&baseObjectId=${att.reference}` +
                    `&refAffairId=${att.description}${CsrfGuard.getUrlSurffix()}`
                );
            } else if (att.mimeType === 'uc') {
                openZxchatMessage(att.description);
            }
        }

    } catch (error) {
        // 异常捕获，防止 JSON.parse 或者接口报错导致前端死掉
        console.error("[FileZ Preview] 发生未捕获的运行时异常:", error);
        $.alert("预览执行报错，请打开 F12 查看控制台日志。");
    }
}
//gjx-end

// $(function () {
// 	if (!onlineEdit) {
// 		bindMouseenterFunction();
// 	};
// });
//延迟初始化附件收藏图标状态
var isAttachmentFavoriteStateInited = false;

function initAttachmentFavoriteState() {
    if (isAttachmentFavoriteStateInited) {
        return;
    }
    var ids = [];
    $(".attachment_block").each(function () {
        var arr = this.id.split('_');
        if (arr.length == 2) {
            ids.push(arr[1]);
        }

    });
    callBackendMethod("knowledgeFavoriteManager", "hasFavoriteByIds", ids, {
        success: function (rs) {
            if (rs != null) {
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    if (rs[i]) {
                        var favoriteObjs = document.querySelectorAll("#favoriteSpan" + id);
                        var cancelFavoriteObjs = document.querySelectorAll("#cancelFavorite" + id);

                        showHideFavorite(favoriteObjs, false);
                        showHideFavorite(cancelFavoriteObjs, true);
                    }
                }
            }
        },
        error: function (e) {
            if (typeof (console) !== "undefined" && typeof (console.log) !== "undefined") {
                console.log("Ajax Failed: knowledgeFavoriteManager--->hasFavoriteByIds");
            }
        }
    });
    isAttachmentFavoriteStateInited = true;
}

/**
 * 显示或隐藏收藏图标
 * @param objs
 * @param isShow
 */
function showHideFavorite(objs, isShow, disabled) {
    if (!objs || !objs.length) {
        return;
    }
    objs.forEach(function (item) {
        if (isShow) {
            $(item).show();
        } else {
            $(item).hide();
        }
        if (disabled) {
            $(item).removeAttr("disabled");
        }
    });
}

// 鼠标移动到附件链接上显示浮动菜单
function onAttachmentMouseEnter(t) {
    initAttachmentFavoriteState();
    var _this = $(t);
    //火狐的诡异问题需要设置宽度
    if (navigator.userAgent.indexOf("Firefox") > -1 && _this.attr("isSetWidth") != "yes") {
        //需要加上1 因为可能向下取整 导致少一个像素 而导致中文显示不全， 需要添加1像素
        _this.width(parseFloat(_this.width()) + 1).attr("isSetWidth", "yes");//加标记，只是计算一次
        var oldSpace = _this.css("white-space");
        if (oldSpace != null) {
            _this.css("white-space", oldSpace);
        }
    }
    var n = _this.find(".attachment_operate_btn td").size();
    _this.find("td").width(_this.width() / n);
    _this.find(".attachment_operate").show();
    _this.find(".attachment_operate_bg").css("filter", "alpha(opacity = 30)");
    _this.find(".attachment_operate a").css("display", "block");
}

function onAttachmentMouseLeave(t) {
    $(t).find(".attachment_operate").hide();
}

function onAttachmentMouseEnterNew(t) {
    t.querySelector('.operatingArea').style.display = 'flex';
}

function onAttachmentMouseLeaveNew(t) {
    t.querySelector('.operatingArea').style.display = 'none';
}

// 鼠标移动到浮动菜单Button上动态效果
function onAttachmentButtonMouseenter(t) {
    var _this = $(t);
    _this.parent().closest(".attachment_block").find(".attachment_operate_btn_bg div").eq(_this.index()).show();
}

function onAttachmentButtonMouseleave(t) {
    var _this = $(t);
    _this.parent().closest(".attachment_block").find(".attachment_operate_btn_bg div").hide();
}

var _id;
var _fileId = "";
var _tmpFileId = null;

//编辑 Office的附件
function editOfficeOnline4Form(id, fileUrl, filename, mimeType, category, createDate, fileUrl2) {
    //gjx666 start 2026-03-24 添加
    var paramData = {
        "fileId": fileUrl,
        "createDate": createDate,
        "fileName": filename,
        "state": "edit"
    };
    console.log("[FileZ Edit] 准备调用接口 euFileZManager.fileZInit, 请求参数:", paramData);
    var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);
    console.log("[FileZ Edit] 后台接口返回结果:", fileZRavl);
    if (fileZRavl != null) {
        var showUrl = fileZRavl.url;
        if (showUrl != null && showUrl !== "") {
            console.log("[FileZ Edit] 获取 URL 成功，新窗口打开:", showUrl);
            window.open(
                showUrl,
                "_blank",
                "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
            );
        } else {
            console.warn("[FileZ Edit] 警告: 接口返回成功，但 url 为空。");
            $.alert("获取预览地址失败，文件可能已损坏或后台未返回地址。");
        }
    } else {
        console.error("[FileZ Edit] 错误: 后台接口返回 null。");
        $.alert("后台异常，无法获取预览信息。");
    }

    // 【关键】处理完毕，直接 return，截断致远原生后续那一大堆弹窗逻辑
    console.log("=== [FileZ Edit] 普通附件编辑处理完毕，截断原生逻辑 ===");
    return;
    //gjx666 end

    if (fileUrl2) {
        var checkResult = callBackendMethod("secretAjaxManager", "checkUserSecretLevel", fileUrl2);
        if (checkResult && checkResult.length > 0) {
            $.alert(checkResult);
            return;
        }
    }
    getCtpTop().needShowContent = true;
    var bodyType = getMimeType(mimeType, filename);
    filename = encodeURIComponent(filename);
    var str = getOfficeMustParams(fileUrl);
    var strArray = str.split("|");
    //如果第一次加载 并且 OfficeAPI对象找不到，则动态引入office相关js
    if (_fileId == "" && typeof (OfficeAPI) == "undefined") {
        var head1 = document.getElementsByTagName('head')[0];

        // TODO：以下代码本来也应该移除，由于业务还在使用OfficeAPI，为了930版本稳定，放到1230版本移除
        var script1 = document.createElement('script');
        script1.src = _ctxPath + "/common/office/js/baseOffice.js";
        script1.type = 'text/javascript';
        head1.appendChild(script1);

        // 如果第一次加载， 存在旧的修改附件的记录需求清除掉
        if (sessionStorage.getItem("modifiedAttsInfo")) {
            sessionStorage.removeItem("modifiedAttsInfo");
        }
    }
    var fileType = getExactFileType4Ocx({filename: filename, _fileType: strArray[0]});
    _id = id;
    _fileId = strArray[4];
    if (_tmpFileId) {
        _fileId = _tmpFileId;
    }
    //npapi定制
    if (useWpsOcx(clientMixNet, domesticModel)) {
        var paras = {};
        paras["fileId"] = _fileId;
        paras["originalFileId"] = fileUrl;
        paras["isNeedInit"] = true;
        paras["canEdit"] = true;
        paras["webRoot"] = _ctxServer;
        paras["isDomestic"] = true;
        paras["popWinName"] = "WPSzhengWen";
        paras["loadFileType"] = bodyType;
        paras["dialogType"] = "editAtt";
        paras["isAttr"] = "1";
        paras["officecanPrint"] = true;
        paras["officecanSaveLocal"] = true;
        paras["clientMixNet"] = clientMixNet;
        paras["domesticModel"] = domesticModel;
        paras["closeWinFunc"] = function () {
            window.WPSzhengWen.close();
        };

        paras["originalFileId"] = fileUrl;
        //paras["saveAsFunc"]= saveLog;

        paras["saveFunc"] = function () {
            updateAttachmentInfo(_id, _fileId, getNowFormatDate(), '');
        };
        var needResizeForm = false;
        if (v3x.isChrome && v3x.isCurrentSysLinux()) {
            needResizeForm = true;
        }
        var paramsResult = {};
        if (needResizeForm) {
            paramsResult["govDocZwIframe"] = "";
            paramsResult["componentDiv"] = "";
            paramsResult["content_workFlow"] = "";
            paramsResult["transPdfIframe"] = "";
            paramsResult["transOfdIframe"] = "";
            paramsResult["officeEditorFrame"] = "";
            paramsResult["officeTransIframe"] = "";
            //paramsResult["edocContentDiv"] = "";
            paramsResult["htmlBodyIframe"] = "";
            paramsResult["iframeright"] = "";

            for (var id in paramsResult) {
                var result = ($("#" + id, parent.window.document).css("width") + "," + $("#" + id, parent.window.document).css("height"));
                paramsResult[id] = result;
                $("#" + id, parent.window.document).css("width", "1px");
                $("#" + id, parent.window.document).css("height", "1px");
            }
        }
        window.WPSzhengWen = getA8Top().$.dialog({
            title: $.i18n("govdoc.nodePerm.allowUpdateAttachment"),
            transParams: paras,
            url: _ctxPath + "/common/wps/wps.html",
            targetWindow: getA8Top(),
            width: getA8Top().screen.availWidth,
            height: getA8Top().screen.availHeight,
            closeParam: {
                show: true,
                autoClose: false,
                handler: function () {
                    var rv = window.WPSzhengWen.getClose();
                    if (needResizeForm) {
                        for (var id in paramsResult) {
                            $("#" + id, parent.window.document).css("width", paramsResult[id].split(",")[0]);
                            $("#" + id, parent.window.document).css("height", paramsResult[id].split(",")[1]);
                        }
                    }
                    return true;
                }
            }
        });

    } else {
        var dialogCloseCallback = function (backParams, func) {
            officeSDKInstance.saveFile({isAsync: false}, function (error, result) {
                if (!error) {
                    officeSDKInstance.contentLength({}, function (error, fileSize) {
                        // 关闭弹窗
                        officeSDKInstance.destroy();
                        if (typeof func == "function") {
                            func({success: success, size: size});
                        }
                        if (fileSize) {
                            setTimeout(function () {
                                updateAttachmentInfo(_id, _fileId, getNowFormatDate(), fileSize);
                            }, 1000);
                        }
                    });
                } else {
                    func && func({success: false});
                }
            });
        };

        _fileId = fileUrl2;

        if (OfficeSDK) {
            var params = {
                mode: OfficeSDK.ENUM_MODE_TYPE.EDIT,
                fileId: _fileId,
                fileName: decodeURIComponent(filename),
                originalFileId: fileUrl,
                createDate: createDate,
                officeOcxUploadMax: strArray[1],
                handWriteCurrentUserId: strArray[3],
                webRoot: getWebRoot(),
                officeDom: document.getElementById("editOnline_" + id),
                fileType: fileType,
                editType: "1,0",
                isFullSize: true,
                needReadFile: true,
                locale: v3x.currentLanguage ? v3x.currentLanguage : strArray[2],
                dialogCloseCallback: dialogCloseCallback,
                forceSaved: true,
                isEditAtt: true,
                canPrint: true,
                canDownload: true,
                canRevise: true,
                isShowTrailBtn: true,
                canClearTrail: true,
            };

            var officeSDKInstance = new OfficeSDK(params);
            officeSDKInstance.init(params, function (err, result) {
                if (err != null) {
                    if ($ && $.alert) {
                        $.alert("当前配置，不支持操作" + params.fileType + "类型文件");
                    } else {
                        alert("当前配置，不支持操作" + params.fileType + "类型文件");
                    }
                    return;
                } else {
                    officeSDKInstance.openFile({isDialog: true, showDialogTitle: '修改附件'}); //todo 国际化
                }
            });
        } else {
            console && console.error && console.error("no officeSDK");
        }

    }

    try {
        var logList = new ArrayList();
        var log = new ActionLog(1, (new Date()).format("yyyy-MM-dd HH:mm"), decodeURIComponent(filename), _fileId);
        logList.add(log);
        // edocXdesign 公文新模版适配
        var _summaryId = parent.edocXdesign ? parent.edocSdk.getSummaryInfo().id : parent._summaryId;
        var attFormActionLog = new AttActionLog(_summaryId, _summaryId, null, null);
        attFormActionLog.logs = logList;
        if (parent.edocXdesign) {
            parent.edocSdk.saveFormAttachmentActionLog(attFormActionLog);
        } else {
            parent.parent.saveFormAttachmentActionLog(attFormActionLog);
        }
    } catch (e) {
        //alert(e);
    }

}

/**
 *  保存修改正文附件的记录
 * @param fileUrl
 * @param filename
 */
function setAttModifyInfo(fileUrl, filename) {
    try {
        var modifiedAttsInfo = sessionStorage.getItem("modifiedAttsInfo") ? JSON.parse(sessionStorage.getItem("modifiedAttsInfo")) : [];
        var processId = typeof OfficeAPI.defaultOptions.processId != "undefined" ? OfficeAPI.defaultOptions.processId : "";
        var currentAtt = {
            fileId: fileUrl,
            fileName: decodeURIComponent(filename),
            processId: processId,
            userId: CurrentUserId
        };
        // 如果当前修改的附件已经存在记录中，则不重复添加
        var notExist = true;
        for (var i = 0; i < modifiedAttsInfo.length; i++) {
            if (fileUrl == modifiedAttsInfo[i].fileId) {
                notExist = false;
                break;
            }
        }
        if (notExist) {
            modifiedAttsInfo[modifiedAttsInfo.length] = currentAtt;
            sessionStorage.setItem("modifiedAttsInfo", JSON.stringify(modifiedAttsInfo));
        }
    } catch (e) {
        console.log(e);
    }
}

function callback(backParams, func) {
    return OfficeAPI.saveOfficeSync(function (success) {
        if (success) {
            OfficeAPI.getFileSizeSync(function (size) {
                if (typeof func == "function") {
                    func({success: success, size: size});
                }
                setTimeout(function () {
                    updateAttachmentInfo(_id, _fileId, getNowFormatDate(), size);
                }, 1000);
            });
        }
        return;
    });
}

function wpsAttModifySavedCallback(backParams, func) {
    if (typeof backParams != "undefined" && backParams.size) {
        var size = backParams.size;
        if (typeof func == "function") {
            func({
                size: size
            });
        }
        setTimeout(function () {
            updateAttachmentInfo(_id, _fileId, getNowFormatDate(), size);
        }, 1000);
    } else {
        return OfficeAPI.getFileSizeSync(function (size) {
            if (typeof func == "function") {
                func({size: size});
            }
            setTimeout(function () {
                updateAttachmentInfo(_id, _fileId, getNowFormatDate(), size);
            }, 1000);
        });
    }
}

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}

function getWebRoot() {
    if (typeof (window.location.origin) == 'undefined') {
        basePath = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + _ctxPath;
    } else {
        basePath = window.location.origin + _ctxPath;
    }
    return basePath;
}

function getOfficeMustParams(fileId) {
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxHandWriteManager", "ajaxGetOfficeMustParams", false);
    requestCaller.addParameter(1, "String", fileId);
    var ds = requestCaller.serviceRequest();
    return ds;

}

function getOfficeExtension(exactFileType, fileType) {
    if (exactFileType == "doc" || exactFileType == "xls") {
        if (fileType == 'docx' || fileType == 'doc' || fileType == 'xls' || fileType == 'xlsx') {
            exactFileType = fileType;
        }
    }
    return exactFileType;
}

function getExactFileType4Ocx(param, fileType) {
    var exactFileType = getFileTypeByFilename(param);
    if (exactFileType != 'docx' && exactFileType != 'xlsx' && exactFileType != 'pptx') {
        exactFileType = getOfficeExtension(exactFileType, fileType)
    }
    return exactFileType;
}

function getFileTypeByFilename(param) {
    var fileType = "";
    var filename = param.filename;
    if (filename != "") {
        var index1 = filename.lastIndexOf(".");
        var index2 = filename.length;
        var suffix = filename.substring(index1 + 1, index2);//后缀名
        if (suffix != null) {
            if ("docx" == suffix || "DOCX" == suffix) {
                fileType = "docx";
            } else if ("xlsx" == suffix || "XLSX" == suffix) {
                fileType = "xlsx";
            } else if ("pptx" == suffix || "PPTX" == suffix) {
                fileType = "pptx";
            } else {
                fileType = suffix;
            }
        }
    }
    return fileType;
}

function deleteAtt4Form(obj) {
    var fileUrl = obj.getAttribute ? obj.getAttribute("fileUrl") : obj.fileUrl;
    var fileName = obj.getAttribute ? obj.getAttribute("fileName") : obj.fileName;
    deleteAttachmentForForm(fileUrl, fileName);
}

function openDetailURL(_url) {
    var rv = v3x.openWindow({
        url: _url,
        dialogType: 'open',
        workSpace: 'yes',
        closePrevious: 'no'
    });
}

function openZxchatMessage(chatMessageId) {
    url = _ctxPath + '/zx/chatmessage.do?method=showChatMessage&chatMessageId=' + chatMessageId;
    callBackendMethod("zxChatMessageManager", "getTitle", chatMessageId, {
        success: function (returnVal) {
            var dialog = $.dialog({
                url: url,
                width: 656,
                height: 514,
                isDrag: false,
                title: returnVal,
                targetWindow: getCtpTop(),
                buttons: [{
                    id: "btncancel",
                    text: $.i18n('common.button.close.label'),
                    handler: function () {
                        dialog.close();
                    }
                }]
            });
        }, error: function (returnVal) {
            if (typeof (console) !== "undefined" && typeof (console.log) !== "undefined") {
                console.log(returnVal);
            }
        }
    });
}


/**
 * 将附件对象转换成数据框
 */
Attachment.prototype.toInput = function () {
    var str = "";
    str += "<input type='hidden' name='attachment_id' value='" + this.id + "'>";
    str += "<input type='hidden' name='attachment_reference' value='" + this.reference + "'>";
    str += "<input type='hidden' name='attachment_subReference' value='" + this.subReference + "'>";
    str += "<input type='hidden' name='attachment_category' value='" + this.category + "'>";
    str += "<input type='hidden' name='attachment_type' value='" + this.type + "'>";
    str += "<input type='hidden' name='attachment_filename' value='" + escapeStringToHTML(this.filename) + "'>";
    str += "<input type='hidden' name='attachment_mimeType' value='" + this.mimeType + "'>";
    str += "<input type='hidden' name='attachment_createDate' value='" + this.createDate + "'>";
    str += "<input type='hidden' name='attachment_size' value='" + this.size + "'>";
    if (this.fileUrl2) {
        str += "<input type='hidden' name='attachment_fileUrl' value='" + this.fileUrl2 + "'>";
    } else {
        str += "<input type='hidden' name='attachment_fileUrl' value='" + this.fileUrl + "'>";
    }
    str += "<input type='hidden' name='attachment_description' value='" + this.description + "'>";
    str += "<input type='hidden' name='attachment_needClone' value='" + this.needClone + "'>";
    str += "<input type='hidden' name='attachment_extReference' value='" + this.extReference + "'>";
    str += "<input type='hidden' name='attachment_extSubReference' value='" + this.extSubReference + "'>";
    str += "<input type='hidden' name='attachment_secretLevel' value='" + this.secretLevel + "'>";
    str += "<input type='hidden' name='attachment_secretLevelName' value='" + this.secretLevelName + "'>";
    // 防止文件没有这个值，用undefined判断是因为sortNo可能为0，不能直接this.sortNo判断
    if (this.sortNo !== undefined) {
        str += "<input type='hidden' name='attachment_sortNo' value='" + this.sortNo + "'>";
    }
    return str;
}
/**
 * 将附件对象转换成数据框(正文附件)
 */
Attachment.prototype.toContentInput = function () {
    var str = "";
    str += "<input type='hidden' name='content_attachment_id' value='" + this.id + "'>";
    str += "<input type='hidden' name='content_attachment_reference' value='" + this.reference + "'>";
    str += "<input type='hidden' name='content_attachment_subReference' value='" + this.subReference + "'>";
    str += "<input type='hidden' name='content_attachment_category' value='" + this.category + "'>";
    str += "<input type='hidden' name='content_attachment_type' value='" + this.type + "'>";
    str += "<input type='hidden' name='content_attachment_filename' value='" + escapeStringToHTML(this.filename) + "'>";
    str += "<input type='hidden' name='content_attachment_mimeType' value='" + this.mimeType + "'>";
    str += "<input type='hidden' name='content_attachment_createDate' value='" + this.createDate + "'>";
    str += "<input type='hidden' name='content_attachment_size' value='" + this.size + "'>";
    str += "<input type='hidden' name='content_attachment_fileUrl' value='" + this.fileUrl + "'>";
    str += "<input type='hidden' name='content_attachment_description' value='" + this.description + "'>";
    str += "<input type='hidden' name='content_attachment_needClone' value='" + this.needClone + "'>";

    return str;
}
/**
 * 将附件转化为json数据
 */
Attachment.prototype.toJson = function () {
    return "{id:\"" + this.id + "\", reference:\"" + this.reference + "\", subReference:\"" + this.subReference + "\", category:\"" + this.category + "\", type:\"" + this.type + "\", filename:\"" + escapeStringToHTML(this.filename) + "\", mimeType:\"" + this.mimeType + "\", createDate:\"" + this.createDate + "\", size:\"" + this.size + "\", fileUrl:\"" + this.fileUrl + "\", description:\"" + this.description + "\", needClone:\"" + this.needClone + "\",extension:\"" + this.extension + "\",icon:\"" + this.icon + "\",extReference:\"" + this.extReference + "\",extSubReference:\"" + this.extSubReference + "\"}";
}

/**
 * 显示附件
 */
function showAttachment(subRef, type, attachmentTrId, numberDivId, showAttachmentArea) {
    try {
        if (!theToShowAttachments) {
            return;
        }
        var attachmentNumber = 0;
        var str = "";
        for (var i = 0; i < theToShowAttachments.size(); i++) {
            var att = theToShowAttachments.get(i);

            if (att.subReference == subRef && att.type == type) {
                str += att.toString(true, false);

                attachmentNumber++;
            }
        }
        if (!showAttachmentArea) {
            document.write(str);
            document.close();
        } else {
            var inAtt = document.getElementById(showAttachmentArea);
            inAtt.innerHTML = str;
        }

        if (attachmentNumber > 0) {
            if (attachmentTrId) {
                var attachmentTr = document.getElementById(attachmentTrId);

                if (attachmentTr) {
                    attachmentTr.style.display = "";
                }
            }
            if (numberDivId) {
                var attachmentNumberDiv = document.getElementById(numberDivId);
                if (attachmentNumberDiv) {
                    attachmentNumberDiv.innerHTML = "" + attachmentNumber;
                }
            }
        } else {
            if (attachmentTrId) {
                var attachmentTr = document.getElementById(attachmentTrId);
                if (attachmentTr) {
                    attachmentTr.style.display = "none";
                }
            }
        }
        if (numberDivId) {
            var attachmentNumberDiv = document.getElementById(numberDivId);
            if (attachmentNumberDiv) {
                attachmentNumberDiv.innerHTML = "" + attachmentNumber;
            }
        }
    } catch (e) {
    }
}

/**
 * 展开附件区域
 */
function exportAttachment(obj) {
    if (obj.getAttribute('expand')) {
        return;
    }

    var originalClassName = obj.className;
    obj.className = 'div-float';

    var h = obj.scrollHeight;
    if (h >= (attachmentConstants.height * 2)) {
        obj.className = 'attachment-all-80';
    } else {
        obj.className = originalClassName;
    }

    obj.setAttribute('expand', "yes");
}

/**********************************************/
/* 以下方法用于上传
/**********************************************/
var fileUploadAttachments = new Properties();
//即时上传 不用长期保留的附件
var fileUploadAttachment = null;
// 上传数量
var fileUploadQuantity = 5;
//显示附件的区域
var attachObject = '';
//显示附件的类型
var atttachTr = '';
//是否显示附件 删除按钮
var attachDelete;
//显示附件的个数的区域
var attachCount = true;
//表单正文中的已经删除的附件
var theHasDeleteAtt = new Properties();
//附件mineType对应a8文件类型
var attFileType = new Properties();

/**
 * 是否上传了附件
 */
function isUploadAttachment() {
    return !fileUploadAttachments.isEmpty();
}

/**
 * attObj 附件显示的区域
 * attachTr 附件类型显示的区域
 * attachDe 是否显示删除按钮
 * attachC  是否显示附件个数
 */
function resetAttachment(attObj, attachTr, attachDe, attachC) {
    attachObject = attObj;
    atttachTr = attachTr;
    attachDelete = attachDe;
    attachCount = attachC;
    fileUploadAttachment = new Properties();
}

function clearUploadAttachments() {
    attachObject = '';
    atttachTr = '';
    attachDelete = null;
    attachCount = true;
    fileUploadAttachment.clear();
    fileUploadAttachment = null;
}

/**
 * 将附件转成input
 */
function saveAttachment(inputObj, saveEditLog) {
    var atts = null;
    if (fileUploadAttachment != null) {
        atts = fileUploadAttachment.values();
    } else {
        atts = fileUploadAttachments.values();
    }

    var attachmentInputsObj = inputObj || document.getElementById("attachmentInputs") || document.getElementById("attachmentEditInputs");

    var attInputStr = "";
    for (var i = 0; i < atts.size(); i++) {
        attInputStr += atts.get(i).toInput();
    }
    if (attachmentInputsObj) {
        attachmentInputsObj.innerHTML = attInputStr;
        //保存编辑后的附件
        if (!saveEditLog || saveEditLog != 'false') {
            if (attActionLog && !fileUploadAttachments.isEmpty()) {
//				attachmentInputsObj.innerHTML += attActionLog.toInput();
                attachmentInputsObj.innerHTML += "<input type='hidden' name='isEditAttachment' value='1'/>";
            }
        }
    } else {
        alert("Warn: Save attachments unsuccessful")
        return false;
    }

    return true;
}

/**
 * 获取当前组件提交的附件数据。对于一页存在多个上传组件，每个组件所在区域单独处理附件时（即只处理本区域附件，其他区域附件不处理），
 * 使用该方法，可以把该组件上传的附件数据，存放到以组件ID为domainid的区域内。
 * inputDomainId 上传组件id
 */
function saveAttachmentPart(inputDomainId) {
    var atts = null;
    if (fileUploadAttachment != null) {
        atts = fileUploadAttachment.values();
    } else {
        atts = fileUploadAttachments.values();
    }
    if (inputDomainId) {
        var t = $("#" + inputDomainId);
        var tj = $.parseJSON('{' + t.attr("comp") + '}');
        var attachmentTrId = tj.attachmentTrId;
        var attInputStr = "";

        for (var i = 0; i < atts.size(); i++) {
            if (attachmentTrId == atts.get(i).showArea) {
                attInputStr += atts.get(i).toInput();
            }
        }
        t.append($(attInputStr));

    } else {
        alert($.i18n('v3x.saveAttachmentPart.msg'))
        return false;
    }
    return true;
}

function saveContentAttachment(inputObj) {
    var atts = null;
    if (fileUploadAttachment != null) {
        atts = fileUploadAttachment.values();
    } else {
        atts = fileUploadAttachments.values();
    }

    //删除附件的时候也要能够保存，所以将下面的注释掉
    //if(!atts || atts.size()<=0){
    //return true;
    //}

    var attInputStr = "";
    for (var i = 0; i < atts.size(); i++) {
        attInputStr += atts.get(i).toContentInput();
    }

    var attachmentInputsObj = inputObj || parent.detailRightFrame.document.getElementById("contentAttachmentInputs");
    if (attachmentInputsObj) {
        attachmentInputsObj.innerHTML = attInputStr;
        attachmentInputsObj.innerHTML += "<input type='hidden' name='isContentAttchmentChanged' value='1'>";
    } else {
        alert("Warn: Save attachments unsuccessful")
        return false;
    }

    return true;
}

/**
 * 将附件转成input返回
 */
function getAttachmentsToMap() {
    var atts = fileUploadAttachments.values();

    if (!atts || atts.isEmpty()) {
        return true;
    }

    var attInputStr = "";
    for (var i = 0; i < atts.size(); i++) {
        attInputStr += atts.get(i).toMap();
    }
    if (attInputStr != null) {
        return attInputStr;
    }

}

/**
 * 将附件对象转换成数据框
 */
Attachment.prototype.toMap = function () {
    var str = "#attachment_id=" + this.id + ";";
    str += "attachment_reference" + this.reference + ";";
    str += "attachment_subReference=" + this.subReference + ";";
    str += "attachment_category=" + this.category + ";";
    str += "attachment_type=" + this.type + ";";
    str += "attachment_filename=" + escapeStringToHTML(this.filename) + ";";
    str += "attachment_mimeType=" + this.mimeType + ";";
    str += "attachment_createDate=" + this.createDate + ";";
    str += "attachment_size=" + this.size + ";";
    str += "attachment_fileUrl=" + this.fileUrl + ";";
    str += "attachment_description=" + this.description + ";";
    str += "attachment_needClone=" + this.needClone + ";";

    return str;
}

/**
 * 设置附件的是否复制属性
 */
function cloneAllAttachments() {
    var atts = fileUploadAttachments.values();

    for (var i = 0; i < atts.size(); i++) {
        atts.get(i).needClone = true;
    }
}

function _deleteDomByFIleId(fileUrl) {
//如果大于1 表示存在多个相同一样的附件 协同V5OA-220121
    if ($(".attachment_block[id='attachmentDiv_" + fileUrl + "']").length > 1) {
        var evt = v3x.getEvent();
        var attachEl = null;
        if (evt != null) {
            if (evt.currentTarget != null) {
                attachEl = $(evt.currentTarget).closest(".attachment_block");
                attachEl.remove();
            }
        }
    } else {
        var dom = document.getElementById("attachmentDiv_" + fileUrl);
        if (dom) {
            dom.parentNode.removeChild(dom);
        }
    }
}

/**
 * 删除附件
 */
function deleteAttachment(fileUrl, showAlert) {
    var file = fileUploadAttachments.get(fileUrl);
    if (file == null) {
        return;
    }

    if (showAlert != false) {
        hideOfficeObj()
        if (file.type == 2) {
            if (!confirm($.i18n("assdoc.isdeletesomeone.mesg").format(file.filename))) {
                showOfficeObj()
                return 1;
            }
        } else {
            if (!confirm($.i18n("common.isdeletesomeone.label").format(file.filename))) {
                showOfficeObj()
                return 1;
            }
        }
    }

//	editAttachments();
//	attActionLog = new AttActionLog();
    showOfficeObj()
    fileUploadAttachments.remove(fileUrl);
    try {
        var showAreaStr = '';
        if (file.showArea != null) {
            showAreaStr = file.showArea;
        }
        var pid = $("#attachmentTR" + showAreaStr).attr("data-removePid");
        if (!pid) {
            pid = $("#attachment2TR" + showAreaStr).attr("data-removePid");
        }
        if (pid) {
            document.querySelector('#' + pid + ' #attachmentDiv_' + fileUrl).parentNode.removeChild(document.querySelector('#' + pid + ' #attachmentDiv_' + fileUrl));
        } else {
            _deleteDomByFIleId(fileUrl);
        }
    } catch (e) {
        _deleteDomByFIleId(fileUrl);
    }
    //更新附件、关联文档隐藏域
    //因为只记录位置信息，非业务信息，可以不清除
    /*	 if( $("#"+file.embedInput).size()>0){

             var  assArray=$("#attachmentArea"+file.showArea).prev().children("#"+file.embedInput).attr("value").split(",");
             var n=assArray.indexOf(file.fileUrl);
             assArray=assArray.slice(0,n).concat(assArray.slice(n+1,assArray.length));
             $("#attachmentArea"+file.showArea).prev().children("#"+file.embedInput).attr("value",assArray);
         }*/
    showAttachmentNumber(file.type, file);

    var num = getFileAttachmentNumber(file.type, file.showArea);
    if (num < 1) {
        if (!(typeof (_updateAttachmentState) != "undefined" && _updateAttachmentState))
            showAtachmentTR(file.type, "none", file.showArea);
    }
    try {
        // 同步正文上方的附件信息
        document.getElementById("attachmentDiv_" + fileUrl).parentNode.removeChild(document.getElementById("attachmentDiv_" + fileUrl));
        // 附件信息删除完毕后，恢复正文位置
        if (num <= 0) {
            $('#contentDiv').css({"top": "", "height": ""});
        }
    } catch (e) {
    }
    //只有是已发送中递过来的才马上提交。
    var attachmentInputsObj = document.getElementById("attachmentInputs");
    var canUpdateAttachmentFromSended = document.getElementById("canUpdateAttachmentFromSended");
    if (canUpdateAttachmentFromSended && canUpdateAttachmentFromSended.value == "submit")
        updateAttachment('del', attachmentInputsObj);
    //是否执行了删除操作。
    if (typeof (removeChanged) != 'undefined') removeChanged = true;
    try {
        var logList = new ArrayList();
        var log = new ActionLog(2, (new Date()).format("yyyy-MM-dd HH:mm"), file.filename, fileUrl);
        logList.add(log);
        // edocXdesign 公文新模版适配
        var _summaryId = parent.edocXdesign ? parent.edocSdk.getSummaryInfo().id : parent._summaryId;
        var attFormActionLog = new AttActionLog(_summaryId, _summaryId, null, null);
        attFormActionLog.logs = logList;
        if (parent.edocXdesign) {
            parent.edocSdk.saveFormAttachmentActionLog(attFormActionLog);
        } else {
            parent.parent.saveFormAttachmentActionLog(attFormActionLog);
        }
    } catch (e) {
        //alert(e);
    }
    ///
    try {
        quoteDocumentFrame.window.deselectItem(fileUrl, file, fileUploadAttachments);
    } catch (e) {
    }
    //在删除时回调
    try {
        var attdiv = "attachment2Area";
        if (file.showArea != null)
            attdiv += file.showArea;
        eval($("#" + attdiv).attr("callMethod"))();
    } catch (e) {
    }
    if (typeof (addScrollForDocument) == "function") {
        addScrollForDocument();
    }
    try {
        var attdiv = "attachmentArea";
        if (file.showArea != null)
            attdiv += file.showArea;
        eval($("#" + attdiv).attr("delCallMethod"))(fileUrl);
    } catch (e) {
    }
}

//删除附件并重置其他数据 -- 用于新闻图片的添加
function deleteAttachmentForImage(fileUrl, showAlert) {
    deleteAttachment(fileUrl, showAlert);
    var imageId = document.getElementById("imageId");
    if (imageId) {
        imageId.value = "";
    }
}

/**
 * locationElementid, 位置id，放置上传组件的位置，比如div的id（"dyncid"）：<div id="dyncid"> </div>
 * applicationCategory, 应用模块id
 * extensions, 文件扩展名，逗号分隔的字符串
 * quantity, 最多上传的文件数
 * isEncrypt, 是否加密
 * callMethod, 回调方法名
 *  attachmentTrId, 同一页多个上传组件的区分id
 *  firstSave，是否先保存附件表信息，默认false：后保存。
 *  atts 附件数据
 *  canDeleteOriginalAtts 是否可删除附件
 *  originalAttsNeedClone 是否需要克隆
 *  takeOver 回调方法是否接管后续逻辑，默认值（null）为接管。
 */
function dymcCreateFileUpload(locationElementid, applicationCategory, extensions, quantity, isEncrypt, callMethod, attachmentTrId, firstSave, canDeleteOriginalAtts, atts, originalAttsNeedClone, takeOver, maxSize, canFavourite, selectRepeatSkipOrCover, isSetSecretLevel) {
    var downloadURL = _ctxPath + "/fileUpload.do?type="
        + ((firstSave == null) ? '' : ("&firstSave=" + firstSave))
        + "&applicationCategory=" + applicationCategory + "&extensions="
        + ((extensions == null) ? '' : extensions)
        + ((quantity == null) ? '' : ("&quantity=" + quantity))
        + ((isEncrypt == null) ? '' : ("&isEncrypt=" + isEncrypt))
        //+ "&popupTitleKey=&isA8geniusAdded=" + isA8geniusAdded
        + ((attachmentTrId == null) ? '' : ("&attachmentTrId=" + attachmentTrId))
        + ((callMethod == null) ? '' : ("&callMethod=" + callMethod))
        + ((maxSize == null) ? '' : ("&maxSize=" + maxSize))
        + ((takeOver == null) ? '' : ("&takeOver=" + takeOver))
        + ((selectRepeatSkipOrCover == null) ? '' : ("&selectRepeatSkipOrCover=" + selectRepeatSkipOrCover))
        + ((isSetSecretLevel == null) ? '' : ("&isSetSecretLevel=" + isSetSecretLevel));

    //精灵上传附件
    var isA8geniusAdded = false;
//  try{
//    var ufa = new ActiveXObject('UFIDA_Upload.A8Upload.2');
//    ufa.SetLimitFileSize(1024);
//    isA8geniusAdded = true;
//  }catch(e){
//    isA8geniusAdded = false;
//  }
    downloadURL += ((!isA8geniusAdded) ? '' : ("&isA8geniusAdded=" + isA8geniusAdded));

    var showAreaDiv = "<div id='attachmentArea" + ((attachmentTrId == null) ? '' : attachmentTrId) + "' style=\"overflow: auto;\" requrl='" + downloadURL + "'></div>";

    if ($("#downloadFileFrame").length == 0) {
        showAreaDiv = showAreaDiv +
            "<div style=\"display:none;\"><iframe name=\"downloadFileFrame\" id=\"downloadFileFrame\" frameborder=\"0\" width=\"0\" height=\"0\"></iframe></div>";
    }
    $("#" + locationElementid).replaceWith(showAreaDiv);

    parseAttData(atts, attachmentTrId, true, canDeleteOriginalAtts, originalAttsNeedClone, canFavourite);
}

function parseAttData(atts, attachmentTrId, isAtt, canDeleteOriginalAtts, originalAttsNeedClone, canFavourite) {
    if (atts != null && atts != '') {
        atts = $.parseJSON(atts);
    }

    if (atts && atts instanceof Array) {
        var att;
        for (var i = 0; i < atts.length; i++) {
            att = atts[i];
            if (isAtt) {
                if (att.type == 2)
                    continue;
            } else {
                if (att.type != 2)
                    continue;
            }
            if (canFavourite == null)
                canFavourite = true;

            if (attachmentTrId) {
                addAttachmentPoi(att.type, att.filename, att.mimeType,
                    att.createdate ? att.createdate.toString() : null, att.size,
                    att.fileUrl, canDeleteOriginalAtts, originalAttsNeedClone,
                    att.description, att.extension, att.icon, attachmentTrId,
                    att.reference, att.category, false, null, '', true, att.officeTransformEnable, att.v, canFavourite, null, null, null, null, att.secretLevel, att.secretLevelName);
            } else {
                addAttachment(att.type, att.filename, att.mimeType,
                    att.createdate ? att.createdate.toString() : null, att.size,
                    att.fileUrl, canDeleteOriginalAtts, originalAttsNeedClone,
                    att.description, att.extension, att.icon, att.reference,
                    att.category, false, null, true, att.officeTransformEnable, att.v, canFavourite, null, att.secretLevel, att.secretLevelName);
            }
        }
    }
}

/**
 * locationElementid, 位置id，放置关联组件的位置，比如div的id（"dyncid"）：<div id="dyncid"> </div>
 *  attachmentTrId, 同一页多个关联组件的区分id
 *  atts 关联文档数据
 *  referenceId 只当前页面正在编辑的业务ID,例如，当前正在编辑协同页面，在该页面需要引入关联文档，  此时的referenceId 为正在编辑的协同Id
 *  applicationCategory 当前应用id
 *  modids 应用id字符串为逗号（,）分隔，id值为全系统统一编号
 */
function dymcCreateAssdoc(locationElementid, attachmentTrId, modids, atts, referenceId, applicationCategory) {
    var showAreaDiv = '<div id="attachment2Area'
        + (attachmentTrId ? attachmentTrId : '') + '" poi="'
        + (attachmentTrId ? attachmentTrId : '') + '" requestUrl="'
        + _ctxPath + '/ctp/common/associateddoc/assdocFrame.do?isBind='
        + (modids ? modids : '')
        + '&referenceId=' + (referenceId ? referenceId : '')
        + '&applicationCategory=' + (applicationCategory ? applicationCategory : '')
        + '&poi='
        + (attachmentTrId ? attachmentTrId : '')
        + '" style="overflow: auto;"></div>';

    $("#" + locationElementid).replaceWith(showAreaDiv);
    parseAttData(atts, attachmentTrId, false);
}

/**
 * 按钮事件
 */
function insertAttachment(targetAction, importExplain, secretObj) {
//	var url = downloadURL + "&quantity=" + fileUploadQuantity;
//  改成由程序员控制

//从组件中获取此区域的是上传url
    var url = $("#attachmentArea").attr("requrl");

    /*   在应用模块中实现，不能修改标准过程
	 *  if(arguments && arguments[0]){
	      url += "&selectRepeatSkipOrCover=" + arguments[0];
	    }*/
    if (targetAction != null && targetAction != '') {
        url += "&targetAction=" + targetAction;
    }
    //是否显示表单导入规则说明
    if (importExplain) {
        url += "&importExplain=" + importExplain;
    }
    if (secretObj) {
        if (secretObj.isSetSecretLevel && secretObj.secretLevel == '') {
            $.alert($.i18n('common.attachment.fileSecretLevel.mustTip'))
            return
        }
        if (!/isSetSecretLevel/.test(url)) {
            url += "&isSetSecretLevel=" + secretObj.isSetSecretLevel;
        }
        url += "&secretLevel=" + secretObj.secretLevel;
    }
    var urlParams = getQueryParams(url);
    var selectRepeatSkipOrCover = urlParams.selectRepeatSkipOrCover;
    // 业务生成器，基础数据不适配新的上传组件
    if (selectRepeatSkipOrCover === 'true') {
        getCtpTop().addattachDialog = null;
        getCtpTop().addattachDialog = getCtpTop().$.dialog({
            title: $.i18n("fileupload.page.title"),
            transParams: {'parentWin': window},
            url: url + CsrfGuard.getUrlSurffix(url),
            width: 400,
            height: 250
        });
    } else {
        openUpload(url);
    }
}

/**
 * 附件上传
 */
function openUpload(url, needSave) {
    checkUploadScript(function () {
        var params = {
            isDrag: false,
            isInsertAttachment: addAttachment,
            poi: 'atts1',
            firstSave: needSave,
        };
        var urlParams = getQueryParams(url);
        var uploadParamsKeys = ['type', 'applicationCategory', 'extensions', 'isEncrypt', 'quantity', 'firstSave', 'callMethod', 'attachmentTrId', 'embedInput', 'takeOver', 'targetAction', 'repeat', 'isSetSecretLevel', 'secretLevel']
        for (var i = 0; i < uploadParamsKeys.length; i++) {
            var res = urlParams[uploadParamsKeys[i]];
            if (res) {
                if (uploadParamsKeys[i] == 'extensions') {
                    params['fileExtensions'] = res;
                } else if (uploadParamsKeys[i] == 'quantity') {
                    params['filesNum'] = res;
                } else if (uploadParamsKeys[i] == 'type') {
                    params['fileType'] = res;
                } else if (uploadParamsKeys[i] == 'attachmentTrId') {
                    delete params.isInsertAttachment;
                    params['poi'] = res;
                } else if (uploadParamsKeys[i] == 'callMethod') {
                    try {
                        params['callMethod'] = eval(res);
                    } catch (e) {
                        console.log(e)
                    }
                } else {
                    params[uploadParamsKeys[i]] = res;
                }
            }
        }
        if (typeof params.firstSave === 'undefined') {
            params.firstSave = false;
        }
        params.isShowImg = urlParams.isShowImg;
        new CtpUiUploadFullScreenDrag('clickNow', params)
    })
}

function preViewDialog(url) {
    var params = url.split('?')[1];
    var paramsList = params.split('&');
    var fileId = '';
    for (var i = 0; i < paramsList.length; i++) {
        var paramsItem = paramsList[i];
        var paramsItemList = paramsItem.split('=');
        if (paramsItemList[0] === 'fileId') {
            fileId = paramsItemList[1];
            break
        }
    }
    if (fileId) {
        var checkResult = callBackendMethod("secretAjaxManager", "checkUserSecretLevel", fileId);
        if (checkResult && checkResult.length > 0) {
            $.alert(checkResult);
            return;
        }
    }


    getCtpTop().addattachDialog = null;
    getCtpTop().addattachDialog = getCtpTop().$.dialog({
        title: $.i18n("common.operate.view"),
        transParams: {'parentWin': window},
        url: url,
        width: 1280,
        height: 800,
        closeParam: {
            'show': true,
            handler: function () {
                try {
                    var _tpWin = getCtpTop();
                    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0) {
                        for (var i = 0; i < _tpWin.officeObj.length; i++) {
                            var _temp = _tpWin.officeObj[i];
                            if (_temp && _temp.style) {
                                try {
                                    if (v3x.isChrome) {
                                        _temp.HidePlugin(1);
                                        _temp.FuncExtModule.ShowToolBar = "1";
                                    } else {
                                        _temp.Hide(1);
                                    }
                                } catch (e) {
                                    if (!v3x.isChrome) {
                                        _temp.style.display = "";
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                }
            }
        }
    });
}

/**
 * 打开特定的上传组件
 */
function insertAttachmentPoi(divid, secretLevelAble, secretLevel, needSave, attSort) {
    attSort = attSort
    //从组件中获取此区域的是上传url
    var attdiv = "attachmentArea" + divid;
    var url = $("#" + attdiv).attr("requrl");
    if (secretLevelAble === 'true') {
        var param = {};
        var paramStr = '';
        var urlList = url.split("?");
        var strs = urlList[1].split("&");
        for (var i = 0; i < strs.length; i++) {
            var con = strs[i].split("=");
            param[con[0]] = decodeURIComponent(con[1]);
        }
        param.isSetSecretLevel = secretLevelAble;
        param.secretLevel = secretLevel;
        for (var key in param) {
            paramStr += key + '=' + decodeURI(param[key]) + '&'
        }
        url = urlList[0] + '?' + paramStr
    }
    openUpload(url, needSave);
}

var checkUploadScript = (function () {
    var btn_click = false; // 防止异步加载资源过程中按钮多次点击
    return function (callback) {
        if (btn_click) return;
        btn_click = true;
        if (typeof CtpUiUploadFullScreenDrag === 'undefined') {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = window.location.origin + '/seeyon/common/ctpUi/dist/js/uploadFullScreenDrag.js';
            document.getElementsByTagName('head')[0].appendChild(script);
            document.head.appendChild(script);
            script.onload = function () {
                callback();
                btn_click = false;
            }
        } else {
            callback();
            btn_click = false;
        }
    }
})()

/**
 * 打开关联文档对话框
 */
function quoteDocument(divid, dividHeader) {
    //关联附件优先判断业务密级是否设置
    if (divid == "attachmentArea") {
        var secretLevelAble = window["secretLevelAble"] || parent.secretLevelAble
        var secretLevel = ''
        if (secretLevelAble === 'true') {
            if (window["getAccessFileSecretLevel"]) {
                //协同
                secretLevel = window["getAccessFileSecretLevel"].apply();
            } else {
                //公文
                secretLevel = $(parent.document).find('#secretLevel').val() || $(parent.parent.document).find('#secretLevel').val()
            }
            if (secretLevel == '' || secretLevel == '0' || secretLevel == null) {
                $.alert($.i18n('form.setSecretLevel.uploadAttachment'));
                return
            }
        }
    }
    if (v3x.getBrowserFlag('OpenDivWindow') == true) {
        /*    if(isBind !="isBind"){
              isBind="";//流程表单绑定界面不显示协同
            }*/
        var attdiv = divid && divid.indexOf("attachmentAreaattachmentArea_") != -1 ? "" : "attachment2Area";
        if (dividHeader != undefined)
            attdiv = dividHeader;
        if (divid != undefined)
            attdiv += divid;
        //关联文档与关联附件url不一致，由不同的id获取url
        var url = $("#" + attdiv).attr("requestUrl") || top.$("#" + attdiv).attr("requestUrl");

        /*
        var atts = v3x.openWindow({
            url:  url,
            height: 500,
            width: 800
        }); */
        try {
            hideOfficeObj();
        } catch (e) {
        }
        var titleName = $.i18n("common.toolbar.insert.mydocument.label");
        if (url.indexOf("relateAttachment=true") > 0) {
            titleName = $.i18n("common.toolbar.insert.relateAttachment.label");
        }
        //V5-35400 【关联附件】节点权限同时配置关联文档和关联附件时，在意见区回复选择关联文档，实际打开的是关联附件
        // 不要将关联附件和关联文档用同一个id去存放请求url地址
        if (divid && divid.indexOf("doc_") == 0) {
            divid = divid.replace("doc_", "");//此id为确认后，填充附件对象到页面的domId
        }
        getCtpTop().addassDialog = getCtpTop().$.dialog({
            title: titleName,
            transParams: {'parentWin': window, 'divid': divid},
            url: url + CsrfGuard.getUrlSurffix(url),
            width: 1000,
            height: 800
        });

    }
}

function quoteDocumentCallback(atts, divid, relateAttachment) {
    var attdiv = divid && divid.indexOf("attachmentAreaattachmentArea_") != -1 ? "" : "attachment2Area";
    if (divid != undefined)
        attdiv += divid;

    if (atts) {
        if (relateAttachment) {
            for (var i = 0; i < atts.length; i++) {
                var att = atts[i]
                var poi = $("#" + attdiv).attr("poi");
                addAttachmentPoi(att.type, att.filename, att.mimeType, att.createdate, att.size, att.fileUrl, true, false, att.description, null, att.icon, poi, att.reference, att.category, null, null, $("#" + attdiv).attr("embedInput"), null, null, att.v, null, null, null, null, null, att.secretLevel, att.secretLevelName);
            }
        } else {
            deleteAllAttachment(2, $("#" + attdiv).attr("poi"));
            for (var i = 0; i < atts.length; i++) {
                var att = atts[i]
                //addAttachment(type, filename, mimeType, createDate, size, fileUrl, canDelete, needClone, description)
                if ($("#" + attdiv).attr("poi") == att.showArea) {
                    addAttachmentPoi(att.type, att.filename, att.mimeType, att.createDate, att.size, att.fileUrl, true, false, att.description, null, att.mimeType + ".gif", $("#" + attdiv).attr("poi"), att.reference, att.category, null, null, $("#" + attdiv).attr("embedInput"), null, null, null, null, null, null, null, null, att.secretLevel, att.secretLevelName)
                }
            }
        }
        if ($("#" + attdiv).attr("callMethod")) {
            try {
                eval($("#" + attdiv).attr("callMethod"))();
            } catch (e) {
            }
        }
    }
    if (typeof (setCssOverFlow) == 'function') {
        setCssOverFlow();
    }
}

/**
 * 收藏
 */
function favorite(appName, id, hasAtts, type, index, offsetTop, offsetLeft, callback, favoriteV) {
    var checkResult = callBackendMethod("secretAjaxManager", "checkUserSecretLevel", id);
    if (checkResult && checkResult.length > 0) {
        $.alert(checkResult);
        return;
    }
    getA8Top().dialog = $.dialog({
        id: "docFavoriteDialog",
        url: _ctxPath + "/doc/knowledgeController.do?method=toFavorite&sourceId=" + id + "&appName=" + appName + "&hasAtts=" + hasAtts + "&favoriteType=" + type + "&v=" + favoriteV + "&t=" + getUUID(),
        isClear: false,
        targetWindow: getA8Top(),
        width: 300,
        height: 95,
        closeParam: {
            'show': true, handler: function () {
                try {
                    hideMask();
                } catch (e) {
                }
                //刷新页面
                getA8Top().dialog.getReturnValue();
            }
        },
        title: $.i18n('doc.collect'),
        transParams: {
            changeTip: function () {
                favoriteTip(true, id, index, null, offsetTop, offsetLeft);
                if (callback) {
                    callback(id);
                }
            }
        }
    });
    //  favoriteTip(true,id,index,null,offsetTop,offsetLeft);
}

/**
 * 取消收藏
 */
function cancelFavorite(appName, sourceId, hasAtts, type, index, offsetTop, offsetLeft, callback) {
    if (typeof (index) === 'undefined') {
        index = '';
    }
    var cancelFavorite = $("#cancelFavorite" + String(sourceId) + String(index));
    cancelFavorite.attr("disabled", "disabled");
    cancelFavorite.jsonSubmit({
        action: _ctxPath + "/doc/knowledgeController.do?method=favoriteCancel",
        paramObj: {'docId': -1, 'sourceId': sourceId},
        callback: function (oReturn) {
            //协同页面设计器自定义弹窗回调
            if (typeof appName === 'function') {
                appName($.i18n("doc.cancel.collect.success.js"))
            } else {
                favoriteTip(false, sourceId, index, null, offsetTop, offsetLeft);
            }
            if (callback) {
                callback(sourceId);
            }
            if (typeof fnReloadSquarePublicity != "undefined") {
                fnReloadSquarePublicity();
            }
            if (typeof fnReloadPersonalKnowledgeCenter != "undefined") {
                fnReloadPersonalKnowledgeCenter();
            }
            if (typeof fnReloadKnowledgeBrowse != "undefined") {
                fnReloadKnowledgeBrowse();
            }
            if (typeof fnReloadAttachmentList != "undefined") {
                fnReloadAttachmentList();
            }
        }
    });
}

//刷新知识查看
function fnReloadKnowledgeBrowse() {
    if (getA8Top().docOpenDialogOnlyId_main_iframe && getA8Top().docOpenDialogOnlyId_main_iframe.fnReloadKnowledgeBrowse) {
        getA8Top().docOpenDialogOnlyId_main_iframe.fnReloadKnowledgeBrowse();
    }
    //老界面刷新
    var oldIframe = $(".mxt-window-body-iframe", getA8Top().document.body);
    if (oldIframe[0] && oldIframe[0].contentWindow && oldIframe[0].contentWindow.fnReloadKnowledgeBrowse) {
        oldIframe[0].contentWindow.fnReloadKnowledgeBrowse();
    }
}

//刷新个人知识中心
function fnReloadPersonalKnowledgeCenter() {
    if (typeof (getA8Top().mainIframe) != "undefined" && getA8Top().mainIframe.window && getA8Top().mainIframe.window.fnReload) {
        getA8Top().mainIframe.window.fnReload();
    }
}

//刷新知识广场
function fnReloadSquarePublicity() {
    if (typeof (getA8Top().mainIframe) != "undefined" && getA8Top().mainIframe.window && getA8Top().mainIframe.window.fnPageDataLoad) {
        getA8Top().mainIframe.window.fnPageDataLoad(true);
    }
}

/**
 * 收藏的tip
 */
function favoriteTip(isFavorite, id, index, msg, offsetTop, offsetLeft, notAlert) {
    if (typeof (id) === 'undefined') {
        id = '';
    }

    if (typeof (index) !== 'undefined' && index !== null) {
        id = String(id) + String(index);
    }

    if (!msg) {
        msg = $.i18n('doc.cancel.collect.success.js');
    }

    if (typeof (offsetTop) === 'undefined' || offsetTop === null) {
        offsetTop = -30;
    }
    if (typeof (offsetLeft) === 'undefined' || offsetLeft === null) {
        offsetLeft = 0;
    }

    var favoriteObjs = document.querySelectorAll("#favoriteSpan" + id);
    var cancelFavoriteObjs = document.querySelectorAll("#cancelFavorite" + id);
    if (isFavorite) {
        showHideFavorite(favoriteObjs, false);
        showHideFavorite(cancelFavoriteObjs, true);
    } else {
        if (typeof (CtpUiMessage) === "function") {
            if (notAlert !== true) {
                new CtpUiMessage({
                    title: msg,
                    type: "success"
                });
            }
            showHideFavorite(favoriteObjs, true);
            showHideFavorite(cancelFavoriteObjs, false, true);
            $("#cancelFavorite" + id).removeAttr("disabled");
        } else {
            if (notAlert !== true) {
                new MxtTip({
                    targetId: "cancelFavorite" + id,
                    content: msg,
                    offsetTop: offsetTop,
                    offsetLeft: offsetLeft,
                    targetWindow: getA8Top(),
                    beforeShowCallBack: function () {
                        showHideFavorite(favoriteObjs, true);
                        showHideFavorite(cancelFavoriteObjs, false, true);
                    }
                });
            } else {
                showHideFavorite(favoriteObjs, true);
                showHideFavorite(cancelFavoriteObjs, false, true);
            }
        }
    }
    return;
}

/**
 * 添加附件
 */
function addAttachment(type, filename, mimeType, createDate, size, fileUrl, canDelete, needClone, description, extension, icon, reference, category, onlineView, width, hasSaved, isCanTransform, v, canFavourite, hasFavorite, secretLevel, secretLevelName, enableOnlineView) {
    canDelete = canDelete == null ? true : canDelete;
    needClone = needClone == null ? false : needClone;
    description = description == null ? "" : description;
    if (attachDelete != null) canDelete = attachDelete;

    if (!reference) {
        reference = "";
    }
    if (!category) {
        category = "";
    }
    if (fileUrl == null) {
        fileUrl = filename;
    }
    var attachment = new Attachment('', reference, '', category, type, filename, mimeType, createDate, size, fileUrl, description, needClone, extension, icon, onlineView, isCanTransform, v, secretLevel, secretLevelName, enableOnlineView);
    attachment.hasSaved = hasSaved;
    attachment.hasFavorite = hasFavorite;
    attachment.secretLevel = secretLevel;
    attachment.secretLevelName = secretLevelName;
    if (canFavourite != null) attachment.canFavourite = canFavourite;

    if (fileUploadAttachment != null) {
        if (fileUploadAttachment.containsKey(fileUrl)) {
            return;
        }
        fileUploadAttachment.put(fileUrl, attachment);
    } else {
        if (fileUploadAttachments.containsKey(fileUrl)) {
            return;
        }
        fileUploadAttachments.put(fileUrl, attachment);
    }
    showAtachmentObject(attachment, canDelete, width);
    showAtachmentTR(type, '', '');
    if (attachCount)
        showAttachmentNumber(type, attachment);
    if (typeof (addScrollForDocument) == "function") {
        addScrollForDocument();
    }
}

function _getUuid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return ("id_" + S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

/**
 * 向具体位置中增加附件
 */
function addAttachmentPoi(type, filename, mimeType, createDate, size, fileUrl, canDelete, needClone,
                          description, extension, icon, poi, reference, category, onlineView, width, embedInput, hasSaved,
                          isCanTransform, v, canFavourite, isShowImg, id, hasFavorite, businessId, secretLevel, secretLevelName, enableOnlineView) {
    canDelete = canDelete == null ? true : canDelete;
    needClone = needClone == null ? false : needClone;
    description = description == null ? "" : description;
    if (attachDelete != null) canDelete = attachDelete;
    /*  if(!reference){
    reference = "";
  }
  if(!category){
    category = "";
  }*/

    if (fileUrl == null) {
        if (description != null && description != "") {
            fileUrl = description;
        } else {
            fileUrl = filename;
        }
    }


    var attachment = new Attachment(id, reference, poi, category, type, filename, mimeType, createDate, size, fileUrl, description, needClone, extension, icon, false, isCanTransform, v);
    attachment.showArea = poi;
    attachment.embedInput = embedInput;
    attachment.hasSaved = hasSaved;
    attachment.hasFavorite = hasFavorite;
    attachment.businessId = businessId;
    attachment.secretLevel = secretLevel;
    attachment.secretLevelName = secretLevelName;
    attachment.enableOnlineView = enableOnlineView;
    if (canFavourite != null) attachment.canFavourite = canFavourite;
    if (isShowImg != null) attachment.isShowImg = isShowImg;
    if (fileUploadAttachment != null) {
        if (fileUploadAttachment.containsKey(fileUrl)) {
            return;
        }
        fileUploadAttachment.put(fileUrl, attachment);
    } else {
        if (fileUploadAttachments.containsKey(fileUrl)) {
            fileUrl += poi;
            /*	if(!fileUploadAttachments.containsKey(fileUrl+poi)){ // 允许添加重复的关联文档这种需求有待商榷，目前尚未定论，暂时按测试的要求进行修改
	    fileUrl+=poi;
	}else{
	    return;
	}*/
        }
        fileUploadAttachments.put(fileUrl, attachment);
    }
    showAtachmentObject(attachment, canDelete, null);


    //更新附件、关联文档隐藏域
    var file = attachment;
    if (file.embedInput && $("#" + file.embedInput).size() > 0) {
        $("#attachmentArea" + file.showArea).prev().children("#" + file.embedInput).attr("value", poi);//附件
        $("#attachment2Area" + file.showArea).prev().children("#" + file.embedInput).attr("value", poi);//关联文档
    }
    showAtachmentTR(type, '', poi);

    if (attachCount)
        showAttachmentNumber(type, attachment);
    if (typeof (addScrollForDocument) == "function") {
        addScrollForDocument();
    }
}

//start by dongyj --附件编辑
//action 0.添加 1.修改 2.删除
function AttActionLog(reference, subReference, logs, editAtt) {
    this.reference = reference;
    this.subReference = subReference;
    this.logs = logs;
    this.editAtt = editAtt;
}

AttActionLog.prototype.toInput = function () {
    var result = "";
    if (this.logs && !this.logs.isEmpty()) {
        result += "<input type='hidden' name='reference' value='" + this.reference + "'>";
        result += "<input type='hidden' name='subReference' value='" + this.subReference + "'>";
        result += "<input type='hidden' name='isEditAttachment' value='1'/>";
        result += "<input type='hidden' name='editAttachmentSize' value='" + this.editAtt.size() + "'/>";
        //记录log attachment
        for (var i = 0; i < this.logs.size(); i++) {
            result += this.logs.get(i).toInput();
        }
        for (var i = 0; i < this.editAtt.size(); i++) {
            result += this.editAtt.get(i).toInput();
        }
    }
    return result;
}

function ActionLog(action, createDate, description, fileId) {
    this.action = action;
    this.createDate = createDate;
    this.des = description;
    this.fileId = fileId;

}

ActionLog.prototype.toInput = function () {
    var str = "";
    str += "<input type='hidden' name='logAction' value='" + this.action + "'>"
    str += "<input type='hidden' name='logCreateDate' value='" + this.createDate + "'>"
    str += "<input type='hidden' name='logDesc' value='" + this.des + "'>"
    str += "<input type='hidden' name='logFileId' value='" + this.fileId + "'>"

    return str;
}

function copyActionLog(actionLog) {
    var result = new ActionLog(actionLog.action, actionLog.createDate, actionLog.des, actionLog.fileId);
    return result;
}

function copyAttachment(attachment) {
    var result = new Attachment(attachment.id, attachment.reference, attachment.subReference, attachment.category, attachment.type, attachment.filename, attachment.mimeType, attachment.createDate, attachment.size, attachment.fileUrl, attachment.description, attachment.needClone, attachment.extension, attachment.icon);
    result.onlineView = attachment.onlineView;
    result.extReference = attachment.extReference;
    result.v = attachment.v;
    result.extSubReference = attachment.extSubReference;
    result.secretLevel = attachment.secretLevel;
    result.secretLevelName = attachment.secretLevelName;
    result.enableOnlineView = attachment.enableOnlineView;
    return result;
}

var attActionLog = null;

/**
 * 显示修改附件页面 编辑成功，返回受过编辑的页面。不成功，返回null
 * @param atts 需要编辑的附件
 * @param reference 关联id  not null
 * @param subReference 次关联id not null
 * @param category 所属应用;关联文档协同1，公文4
 */
function editAttachments(atts, reference, subReference, category) {
    if (attActionLog == null) {
        attActionLog = new AttActionLog(reference, subReference, null, atts);
    }
    reference = reference || "";
    subReference = subReference || "";
    var result = v3x.openWindow({
        url: getA8Top().v3x.baseURL + "/genericController.do?ViewPage=apps/collaboration/fileUpload/attEdit&category=" + category + "&reference=" + reference + "&subReference=" + subReference + "&_isModalDialog=true",
        width: 550,
        height: 430,
        resizable: "yes"
    });
    if (result) {
        var attachmentList = new ArrayList();
        var inst = result[0].instance;
        for (var i = 0; i < inst.length; i++) {
            var att = copyAttachment(inst[i]);
            att.onlineView = false;
            attachmentList.add(att);
        }
        var logList = new ArrayList();
        inst = result[1].instance;
        if (inst.length == 0) return false;
        for (var i = 0; i < inst.length; i++) {
            var att = copyActionLog(inst[i]);
            logList.add(att);
        }
        var save = saveEditAttachments(logList, attachmentList);
        if (!save) {
            return null;
        }
        return attActionLog.editAtt;
    }
    return null;
}

function saveEditAttachments(logs, attList) {
    if (!attActionLog || logs.size() == 0) {
        return false;
    }
    if (attActionLog.logs) {
        attActionLog.logs.addList(logs);
    } else {
        attActionLog.logs = logs;
    }
    attActionLog.editAtt = attList;
    return true;
}

/**
 * 根据4个参数得到本地存放的附件
 * @param category所属应用
 * @param reference 关联id 不指定为不限制
 * @param subReference 次关联id 不指定为不限制
 * @param type 类型（本地文档、关联文档）;多种有","隔开，不指定为不限制
 */
function getAttachment(reference, subReference, type) {
    var result = new ArrayList();
    for (var i = 0; i < theToShowAttachments.size(); i++) {
        var att = theToShowAttachments.get(i);
        if (((reference && att.reference == reference) || !reference) && ((subReference && att.subReference == subReference) || !subReference) && ((type && att.type == type) || !type)) {
            result.add(att);
        }
    }
    return result;
}

/**
 * 更新本地的附件
 * @param attList 更新后附件List<Attachment>
 * @param reference 关联id
 * @param subReference 次关联id
 * @param type 类型（本地文档、关联文档）;
 */
function updateAttachmentMemory(attList, reference, subReference, type) {
    //本地删除 clinetAttList
    var clinetAttList = getAttachment(reference, subReference, type);
    for (var i = 0; i < clinetAttList.size(); i++) {
        var att = clinetAttList.get(i);
        theToShowAttachments.remove(att);
    }
    //内存保存修改后的附件列表 attList
    for (var i = 0; i < attList.size(); i++) {
        theToShowAttachments.add(attList.get(i));
    }
}

//end by dongyj 附件编辑
//type:操作类型，添加(add)/删除(del)
//attachmentInputsObj:插入的区域
function updateAttachment(type, attachmentInputsObj) {
    //1.保存附件
    saveContentAttachment(attachmentInputsObj);
    updateAttachmentOnly(type);
}

//公文发起人修改附件
//type:操作类型，增加或者删除
function updateAttachmentOnly(type) {
    //2.向后台更新附件的变化情况
    $('#attchmentForm').ajaxSubmit({
        url: genericURL + "?method=updateAttachment&edocSummaryId=" + edocSummaryId + "&affairId=" + affairId,
        type: 'POST',
        success: function (data) {
            //在已发中修改附件给出提示，是否成功或者失败。
//	        	if(_form=="sended"){
//		        	if(data=="SUCCESS"){//成功
//		        		if(type=="add"){
//		        			alert(_("V3XLang.attachment_prompt_add_success"));
//		        		}else if(type=="del"){
//		        			alert(_("V3XLang.attachment_prompt_delete_success"));
//		        		}
//		        	}else{//失败
//	        			if(type=="add"){
//	        				alert(_("V3XLang.attachment_prompt_add_error"));
//	        			}else if(type=="del"){
//	        				alert(_("V3XLang.attachment_prompt_delete_error"));
//	        			}
//		        	}
//	        	}
        }
    })

}

function deleteAllAttachment(uploadNum, poi) {
    var keys = fileUploadAttachments.keys();
    for (var i = 0; i < keys.size(); i++) {
        var att = fileUploadAttachments.get(keys.get(i));
        if (att.type == uploadNum) {
            if (poi != undefined && poi != att.showArea) {
                continue;
            }
            fileUploadAttachments.remove(keys.get(i));
            i -= 1;
        }
    }

    var id = "attachmentArea";
    if (uploadNum != 0) {
        id = "attachment" + uploadNum + "Area";
    }
    if (poi != undefined)
        id = id + poi;

    var attachmentAreaObj = document.getElementById(id);
    if (attachmentAreaObj) {
        attachmentAreaObj.style.display = "";
        attachmentAreaObj.innerHTML = "";
    }

    var id = "attachmentTR";
    if (uploadNum != 0) {
        id = "attachment" + uploadNum + "TR";
    }
    if (poi != undefined)
        id = id + poi;

    var attachmentTRObj = document.getElementById(id);
    if (attachmentTRObj) {
        //_display = _display || "";
        attachmentTRObj.style.display = "none";
        //attachmentTRObj.innerHTML="";
    }
    if (poi) {
        showAttachmentNumber(uploadNum, {showArea: poi})
    }
}

//显示增加附件的按钮和删除附件的按钮。
function showUpdateAttachment(type) {
    //已经处于附件修改状态不需要执行此操作
    if (_updateAttachmentState) return;

    //1.显示“插入附件”的行
    var attachmentTr = document.getElementById("attachmentTr");
    if (attachmentTr) attachmentTr.style.display = "";
    var normalText = document.getElementById("normalText");
    if (normalText) normalText.style.display = "none";
    var uploadAttachmentTR = document.getElementById("uploadAttachmentTR");
    if (uploadAttachmentTR) uploadAttachmentTR.style.display = "";

    if (!theToShowAttachments) return;

    var attachmentAreaObj = document.getElementById("attachmentArea");
    var attachmentArea2Obj = document.getElementById("attachment2Area");
//	var contextPath = v3x.baseURL;
    var contextPath = _ctxPath;
    for (var i = 0; i < theToShowAttachments.size(); i++) {
        var att = theToShowAttachments.get(i);
        if (att.type == 0 && att.type == type) {
            //本地附件
            var attDiv = document.getElementById("attachmentDiv_" + att.fileUrl);
            if (attDiv) {
                var a = attDiv.getElementsByTagName("a");
                if (a) {
//					var delImg = "<img src='" + contextPath + "/common/images/attachmentICON/delete.gif' onclick='deleteAttachment(\"" + att.fileUrl + "\")' class='cursor-hand' title='" +$.i18n('common.toolbar.delete.label') + "' height='11' align='absmiddle'>";
                    var delImg = '<span class="ico16 affix_del_16" onclick="deleteAttachment(\'' + att.fileUrl + '\')" ></span>';
                    a[0].insertAdjacentHTML("afterEnd", delImg);
                }
            }
        } else if (att.type == 2 && att.type == type) {
            //关联文档
            var attDiv = document.getElementById("attachmentDiv_" + att.fileUrl);
            if (attDiv) {
                var a = attDiv.getElementsByTagName("a");
                if (a) {
//					var delImg = "<img src='" + contextPath + "/common/images/attachmentICON/delete.gif' onclick='deleteAttachment(\"" + att.fileUrl + "\")' class='cursor-hand' title='" +$.i18n('common.toolbar.delete.label') + "' height='11' align='absmiddle'>";
                    var delImg = '<span class="ico16 affix_del_16" onclick="deleteAttachment(\'' + att.filename + '\')" ></span>';
                    a[0].insertAdjacentHTML("afterEnd", delImg);
                }
            }
        }
    }
    _updateAttachmentState = true;
}

/**
 * 显示附件对象
 */
function showAtachmentObject(attachment, canDelete, width, isAssdoc) {
    if (!attachment) {
        return
    }
    var id = "attachmentArea";
    if (attachment.type != 0) {
        id = "attachment" + attachment.type + "Area";
    }
    if (attachment.showArea != '') {
        id = id + attachment.showArea;
    }
    if (attachObject) {
        id = attachObject;
    }
    var attachmentAreaObj = document.getElementById(id);
    var attAreas = $("div[id='" + id + "']");
    if (attAreas.length > 1) {
        attAreas[attAreas.length - 1].style.display = "";
        attAreas[attAreas.length - 1].innerHTML += attachment.toString(true, canDelete, undefined, width, undefined, undefined, isAssdoc);
    } else {
        if (attachmentAreaObj) {
            attachmentAreaObj.style.display = "";
            attachmentAreaObj.innerHTML += attachment.toString(true, canDelete, undefined, width, undefined, undefined, isAssdoc);
            //ie8下上传附件之后被回填的附件html会被外面的标签遮盖了，很奇怪
            if ($.browser.msie && (parseInt($.browser.version, 10) < 9) && $(attachmentAreaObj).parent(".edit_class").length > 0) {
                setTimeout(function () {
                    $(attachmentAreaObj).css("display", "inline-block");
                }, 300);
            }
        }
        $('.attachment_operate td>a').each(function () {
            $(this).css({display: 'inline-block', width: '100%', height: '100%'});
        });
    }
    var t = null;
    if (attachment.type != 2) {
        t = $('#attachmentArea' + attachment.showArea).prev();
    } else {
        t = $('#attachment2Area' + attachment.showArea).prev();
    }

    if (t && t.attr('comp') != undefined) {
        let tj = $.parseJSON('{' + t.attr('comp') + '}');
        if (!isAssdoc && tj?.dragTemplate && Number(attachment.type) !== 2) {
            // 新的进来给个序号
            var files = fileUploadAttachments.values();
            files.instance[files.instance.length - 1].sortNo = files.instance.length - 1;

            // str = '';
            let src = _ctxPath + '/common/js/Sortable.min.js';
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement('script');
                script.src = src;
                document.querySelector('body').appendChild(script);
                attachmentAreaObj.setAttribute('isSortable', true);

                script.onload = () => {
                    creatSort(id);
                };
            } else {
                if (!attachmentAreaObj.getAttribute('isSortable')) {
                    attachmentAreaObj.setAttribute('isSortable', true);
                    if (document.querySelector(`script[src="${src}"]`)) {
                        creatSort(id);
                    }
                }
            }
        }
    }
}

var attSort = () => {
}

function creatSort(id) {
    setTimeout(() => {
        let el = document.getElementById(id);
        new Sortable(el, {
            animation: 150,
            ghostClass: 'blue-background-class',
            onEnd: function (evt) {
                var files = fileUploadAttachments.values();
                evt.from.childNodes.forEach((item, index) => {
                    for (let i = 0; i < files.instance.length; i++) {
                        let file = files.instance[i];
                        if (item.id.includes(file.fileUrl2)) {
                            file.sortNo = index;
                        }
                    }
                });
                attSort();
            }
        });
    }, 1000);
}

/**
 * 显示附件行
 * @type 附件类型
 * @param _display style.display值，默认显示
 */
function showAtachmentTR(type, _display, poi) {
    var id = "attachmentTR";
    if (type != 0) {
        id = "attachment" + type + "TR";
    }
    if (atttachTr) {
        id = atttachTr;
    }
    if (poi != '')
        id += poi;

    var attachmentTRObj = document.getElementById(id);
    if (attachmentTRObj) {
        _display = _display || "";
        attachmentTRObj.style.display = _display;
    }
}

/**
 * 显示文件附件的数量
 */
function showAttachmentNumber(type, file) {
    var id = "attachmentNumberDiv";
    if (type != 0) {
        id = "attachment" + type + "NumberDiv";
    }
    if (file.showArea != '') {
        id = id + file.showArea;
    }
    var attachmentNumberDivObj = document.getElementById(id);
    if (attachmentNumberDivObj) {
        try {
            attachmentNumberDivObj.innerText = getFileAttachmentNumber(type, file.showArea);
        } catch (e) {
        }
    }
}

/**
 * 文件附件的数量
 */
function getFileAttachmentNumber(type, showArea) {
    var number = 0;
    var files = fileUploadAttachments.values();
    if (!files) {
        return number;
    }

    var jsonobj = {};
    for (var i = 0; i < files.size(); i++) {
        if (files.get(i) == null) {
            continue;
        }
        if (files.get(i).type == type && files.get(i).showArea == showArea) {
            //如果新增这里的id为空 需要排除
            if (files.get(i).id != null && files.get(i).id != "" && files.get(i).id != -1) {
                jsonobj[files.get(i).id] = files.get(i);
            } else {
                jsonobj[getUUID()] = files.get(i);
            }
            number++;
        }
    }
    var fileNumber = 0;
    //计算实际的附件数量
    for (var prop in jsonobj) {
        ++fileNumber;
    }
    //如果实际数量跟实例数量不统一 则表示存在重复的附件
    if (number != fileNumber && fileNumber > 0) {
        return fileNumber;
    }
    return number;
}

/**
 * 文件附件的名称
 */
function getFileAttachmentName(type, showArea) {
    var atts = fileUploadAttachments.values();
    if (!atts) {
        return "";
    }
    var str = "";
    for (var i = 0; i < atts.size(); i++) {
        var att = atts.get(i);
        if (showArea != null && att.showArea != showArea) {
            continue;
        }
        if (att.type == type) {
            //str += "<div id='attachmentDiv_" + att.fileUrl + "' style='float: left;height: " +  attachmentConstants.height +
            str += "<div id='attachmentDiv_" + att.fileUrl + "' style='float: left;font-size:12px; line-height: 14px;' noWrap>";   //支持超长文件名显示，原先使用上面值
            str += "<img src='" + v3x.baseURL + "/common/images/attachmentICON/" + att.icon + "' border='0' height='16' width='16'                                                    align='absmiddle' style='margin-right: 3px;'/>";
            str += escapeStringToHTML(att.filename);
            str += "&nbsp;</div>";

        }
    }


    return str;
}

/**
 * 发送协同用文件附件的名称
 */
function getSenderAttachmentName(subRef, type) {
    var atts = parent.theToShowAttachments;
    if (!atts) {
        return "";
    }
    var str = "";
    for (var i = 0; i < atts.size(); i++) {
        var att = atts.get(i);
        if (att.type == type && att.subReference == subRef) {
            str += "<div id='attachmentDiv_" + att.fileUrl + "' style='float: left;height: " +
                attachmentConstants.height + "px; line-height: 14px;' noWrap>";
            str += "<img src='" + v3x.baseURL + "/common/images/attachmentICON/" + att.icon + "' border='0' height='16' width='16'                                                    align='absmiddle' style='margin-right: 3px;'/>";
            str += att.filename;
            str += "&nbsp;</div>";

        }
    }


    return str;
}


/********************************************  选人界面实体 **************************************************
 * @param type 实体类型：Member/Department/Post/Level
 * @param id 对应的实体InternalId
 * @param name 实体名称
 * @param typeName 实体类型名称：人员/部门/岗位/职务级别
 * @param acountId 所属单位id
 * @param accountShortname 所属单位别名
 * @param excludeChildDepartment 是否不包含子部门，true：不包含
 * @author tanmf
 * Select People Element
 */
var _Element = Element;
var PeopleElement = function (type, id, name, typeName, accountId, accountShortname, description, memberId, memberName, departmentId, departmentName, postId, postName) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.typeName = typeName;
    this.accountId = accountId || "";
    this.accountShortname = accountShortname || "";
    this.description = description;
    this.externalType = "0";//OrgConstants.ExternalType
    this.entity = null;
    this.isEnabled = true;
    this.excludeChildDepartment = false;

    this.memberId = memberId;
    this.memberName = memberName;
    this.departmentId = departmentId;
    this.departmentName = departmentName;
    this.postId = postId;
    this.postName = postName;
}

PeopleElement.prototype.copy = function (anth) {
    this.type = anth.type;
    this.id = anth.id;
    this.name = anth.name;
    this.typeName = anth.typeName;
    this.accountId = anth.accountId;
    this.accountShortname = anth.accountShortname;
    this.description = anth.description;
    this.externalType = anth.externalType;
    this.isEnabled = anth.isEnabled
    this.excludeChildDepartment = anth.excludeChildDepartment;
}

PeopleElement.prototype.toString = function () {
    return this.type + "\t" + this.id + "\t" + this.name + "\t" + this.typeName + "\t" + this.accountId + "\t" + this.accountShortname;
}
var Element = function () {
    return new PeopleElement(...arguments);
}
// ie8没有此对象
if (_Element) {
    Element.prototype = _Element.prototype;
} else {
    Element = PeopleElement;
}

/**
 * 得到Element[] 的所有名称，格式为: 谭敏锋,李立,开发部
 */
function getNamesString(elements, _sp) {
    if (!elements) {
        return "";
    }

    var sp = v3x.getMessage("common.separator.label") || _sp;

    var names = [];
    for (var i = 0; i < elements.length; i++) {
        var e = elements[i];
        var _name = null;
        var showShortAccount = true;
        if (typeof e.loginAccountId !== "undefined") {
            // 兼容新组件默认会返回 accountShortname
            var accountId = e.accountId, loginAccountId = e.loginAccountId;
            showShortAccount = !(accountId === loginAccountId)
        }
        if (e.accountShortname && showShortAccount && e.type != 'Account' && e.type != 'OrgMetadataTag') {
            _name = e.name + "(" + e.accountShortname + ")";
        } else {
            _name = e.name;
        }

        names[names.length] = _name;
    }

    return names.join(sp);
}

/**
 * 得到Element[] 的所有名称，格式为: 谭敏锋,李立,开发部
 */
function getFullNamesString(elements) {
    if (!elements) {
        return "";
    }

    var sp = v3x.getMessage("common.separator.label");

    var deptNames = [];
    var str = "";
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].type == "Department") {
            str += elements[i].id + ",";
        }
    }
    if (str != "") {
        str = str.substring(0, str.length - 1);
        var orgAccountId = document.getElementById("orgAccountId");
        var requestCaller = new XMLHttpRequestCaller(this, "ajaxOrgManager", "getParentDepartmentFullName", false);
        requestCaller.addParameter(1, "String", str);
        requestCaller.addParameter(2, "long", orgAccountId.value);
        var rs = requestCaller.serviceRequest();
        if (rs != null) {
            deptNames = rs.split(",");
        }
    }
    var k = 0;
    var names = [];
    for (var i = 0; i < elements.length; i++) {
        var e = elements[i];
        var _name = null;
        if (e.type == "Department") {
            _name = deptNames[k];
            k++;
        } else {
            if (e.accountShortname) {
                var appName = document.getElementById("appName");
                if (appName && appName.value == "4") {
                    if (e.type == "Account" || (orgAccountId && orgAccountId.value == e.accountId)) {
                        _name = e.name;
                    } else {
                        _name = e.accountShortname + e.name;
                    }
                } else {
                    _name = e.name + "(" + e.accountShortname + ")";
                }
            } else {
                _name = e.name;
            }
        }
        names[names.length] = _name;
    }

    return names.join(sp);
}

/**
 * 得到Element[] 的所有Id，格式为: <br>
 * 1、如果：needType 为 true
 * Member|0977614325432,Member|23456754365745,Department|3451234132<br>
 * 2、如果：needType 为 false
 * 0977614325432,23456754365745,3451234132<br>
 * 3、如果部门不包含子部门，后面多一个1： Member|0977614325432,Department|23456754365745,Department|3451234132|1或者123412341234|1,3451234123|1,1234123
 *
 * @needType 是否要类型标示 默认为true
 */
function getIdsString(elements, needType) {
    if (!elements) {
        return "";
    }

    if (needType == null) {
        needType = true;
    }

    var names = [];
    for (var i = 0; i < elements.length; i++) {
        var a = null
        if (needType) {
            a = elements[i].type + "|" + elements[i].id;
        } else {
            a = elements[i].id;
        }

        names[names.length] = a + (elements[i].excludeChildDepartment ? "|1" : "");
    }

    return names.join(",");
}

/**
 * 将Member|0977614325432|谭敏锋|123412,Department|3451234132|开发部|1234123格式的人员数据转换成Element[]
 * 该方法只用在回显选人界面数据
 *
 * e.g
 * String people = "Member|0977614325432|谭敏锋|123412,Department|3451234132|开发部|1234123";
 * <script>
 * elements_${选人组件id} = parseElements(people);
 * </script>
 *
 * @param idsString 格式为 EntityType|EntityId|EntityName|AccountId
 * @param type 数据类型
 * @return Element[]，但不解释现实的名称，
 */
function parseElements(idsString) {
    if (!idsString || idsString == "null") {
        return null;
    }

    var elements = [];

    var enteries = idsString.split(",");
    for (var i = 0; i < enteries.length; i++) {
        if (!enteries[i]) {
            continue;
        }

        var e = enteries[i].split("|");
        if (e.length > 3) {
            var element = new Element(e[0], e[1], e[2], null, e[3], null, '');

            if (e.length > 4) {
                element.isEnabled = (e[4] == "true");
            }

            elements[elements.length] = element;
        }

    }

    return elements;
}

/**
 * parseElements4Exclude("Member|0977614325432,Department|3451234132");
 * parseElements4Exclude("0977614325432,3451234132", "Member");
 *
 * @param idsString Member|0977614325432,Department|3451234132
 * @param type 指定类型
 */
function parseElements4Exclude(idsString, type) {
    if (!idsString || idsString == "null") {
        return null;
    }

    var elements = [];

    var enteries = idsString.split(",");
    for (var i = 0; i < enteries.length; i++) {
        if (!enteries[i]) {
            continue;
        }

        if (type) {
            elements[elements.length] = new Element(type, enteries[i]);
        } else {
            var e = enteries[i].split("|");
            if (e.length == 2) {
                var element = new Element(e[0], e[1]);

                elements[elements.length] = element;
            }
        }
    }

    return elements;
}

/**
 * 得到Element[] 的所有Id专程input，如：
 * 1、如果：needType 为 true
 * <input type='hidden' name='person' value="Member|43265345643564356">
 * <input type='hidden' name='person' value="Member|56732452435345234">
 * <input type='hidden' name='person' value="Department|-445652435345234">
 * 2、如果：needType 为 false
 * <input type='hidden' name='person' value="43265345643564356">
 * <input type='hidden' name='person' value="56732452435345234">
 * <input type='hidden' name='person' value="-445652435345234">
 *
 * @needType 是否要类型标示 默认为true
 */
function getIdsInput(elements, inputName, needType) {
    if (!elements) {
        return "";
    }

    if (needType == null) {
        needType = true;
    }

    var str = "";
    for (var i = 0; i < elements.length; i++) {
        if (needType) {
            str += "<input type='hidden' name='" + inputName + "' value=\"" + elements[i].type + "|" + elements[i].id + "\">";
        } else {
            str += "<input type='hidden' name='" + inputName + "' value=\"" + elements[i].id + "\">";
        }
    }

    return str;
}

/***************************************************  AJAX ******************************************************/

var AJAX_XMLHttpRequest_DEFAULT_METHOD = "POST";

var AJAX_XMLHttpRequest_DEFAULT_async = true; //默认异步

var AJAX_RESPONSE_XML_TAG_BEAN = "B";
var AJAX_RESPONSE_XML_TAG_LIST = "L";
var AJAX_RESPONSE_XML_TAG_Value = "V";
var AJAX_RESPONSE_XML_TAG_Property = "P";
var AJAX_RESPONSE_XML_TAG_Name = "n";


/**
 * AJAX Service Parameter
 */
function AjaxParameter() {
    this.instance = [];
};

AjaxParameter.prototype.put = function (index, type, value) {
    var isArray = type.indexOf("[]") > -1;

    this.instance[this.instance.length] = {
        index: index,
        type: isArray ? type.substring(0, type.length - 2) : type,
        value: value,
        isArray: isArray
    };
};

/**
 *
 */
AjaxParameter.prototype.toAjaxParameter = function (serviceName, methodName, needCheckLogin, returnValueType) {
    needCheckLogin = needCheckLogin == null ? "false" : needCheckLogin;
    if (!serviceName || !methodName) {
        return null;
    }

    var str = "";
    str += "S=" + serviceName;
    str += "&M=" + methodName;
    str += "&CL=" + needCheckLogin;
    str += "&RVT=" + returnValueType;

    if (this.instance != null && this.instance.length > 0) {
        for (var i = 0; i < this.instance.length; i++) {
            var obj = this.instance[i];

            var paramterName = "P_" + obj.index + "_" + obj.type;

            if (obj.isArray) {//数组
                if (obj.value == null || obj.value.length == 0) {
                    str += "&" + paramterName + "_A_N=";
                } else if (obj.value instanceof Array) {
                    for (var k = 0; k < obj.value.length; k++) {
                        str += "&" + paramterName + "_A=" + encodeURIComponent(obj.value[k]);
                    }
                }
            } else {
                var v = obj.value == null ? "" : obj.value;
                str += "&" + paramterName + "=" + encodeURIComponent(v);
            }
        }
    }

    return str;
};

/**
 * Browser independent XMLHttpRequestLoader
 *
 * @param _caller d
 */
function XMLHttpRequestCaller(_caller, serviceName, methodName, async, method, needCheckLogin, actionUrl) {
    if ((!serviceName || !methodName) && !actionUrl) {
        alert("AJAX Service name or method, actionUrl is not null.");
        throw new Error(3, "AJAX Service name or method is not null.");
    }

    this.params = new AjaxParameter();
    this.serviceName = serviceName;
    this.methodName = methodName;
    this.needCheckLogin = needCheckLogin == null ? "true" : needCheckLogin;
    this.returnValueType = "XML"; //XML TEXT

    this.method = method || AJAX_XMLHttpRequest_DEFAULT_METHOD;
    this.async = (async == null ? AJAX_XMLHttpRequest_DEFAULT_async : async);
    this._caller = _caller;
    this.actionUrl = actionUrl;

    this.filterLogoutMessage = true;
    this.closeConnection = false;
};

/**
 *
 * caller.addParameter(1, "String", "a8");
 * caller.addParameter(2, "Long", 2345234);
 * caller.addParameter(3, "String[]", ["tanmf", "jicnm", "maok", ""]);
 * caller.addParameter(4, "date", "2007-01-01 12:25:23");
 *
 * @param index 参数顺序，从1开始
 * @param type 参数类型 当前支持byte Byte short Short int Integer long Long double Double float Float boolean Boolean char character String date datetime
 * @param value 参数值 可以是数组
 */
XMLHttpRequestCaller.prototype.addParameter = function (index, type, value) {
    this.params.put(index, type, value);
};

/**
 * 发出请求
 */
XMLHttpRequestCaller.prototype.serviceRequest = function () {
    var url = null;
    var sendContent = null;
    if (this.actionUrl) {
        url = getBaseURL() + this.actionUrl;
        sendContent = this.sendData;
    } else {
        var _url = getBaseURL() + "/getAjaxDataServlet"
        var _queryString = this.params.toAjaxParameter(this.serviceName, this.methodName, this.needCheckLogin, this.returnValueType);
        if (this.methodName == "waterMarkInfo") {
            _queryString += "&t=" + getUUID()
        }
        if (!_queryString) {
            throw new Error(5, $.i18n('v3x.serviceRequest.msg'));
        }

        if (_queryString.length < 500) {
            this.method = "GET";
        }

        if (this.method.toUpperCase() == "POST") {
            url = _url;
            sendContent = _queryString;
        } else if (this.method.toUpperCase() == "GET") {
            url = _url + "?" + _queryString
        }
    }

    var xmlRequest = getHTTPObject();
    var c = (typeof this.invoke != 'undefined') ? this : this._caller;

    var flm = this.filterLogoutMessage;

    if (!xmlRequest) {
        throw new Error(2, $.i18n('v3x.serviceRequest.msg1'));
    }

    if (this.async) {	//异步
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState == 4) {
                if (xmlRequest.status == 200) {
                    var returnValue = getXMLHttpRequestData(xmlRequest, flm);
                    c.invoke(returnValue);	//回调主函数
                } else {
                    if (c && c.showAjaxError) {
                        c.showAjaxError(xmlRequest.status);
                    } else {
                        c.invoke(null);
                    }
                }
            }
        };
    }

    xmlRequest.open(this.method, url, this.async);
    xmlRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
    xmlRequest.setRequestHeader("RequestType", "AJAX");
    if (this.closeConnection) {
        xmlRequest.setRequestHeader("Connection", "close");
    }

    CsrfGuard.beforeAjaxSend(xmlRequest);
    // xmlRequest.send(sendContent);
    var isSendBeacon = false;
    try {
        xmlRequest.send(sendContent);
    } catch (e) {
        // Chrome 禁止了在 unload的时候发送同步请求， 这里兼容一下
        if (!this.async && navigator.sendBeacon) {
            var headers = {
                "type": 'application/x-www-form-urlencoded;charset=UTF-8'
            };
            var param = {};
            if (sendContent && sendContent.length > 0) {
                var strs = sendContent.split("&");
                for (var i = 0; i < strs.length; i++) {
                    var con = strs[i].split("=");
                    param[con[0]] = decodeURIComponent(con[1]);
                }
            }
            var blob = new Blob([param], headers);
            var tempStatus = navigator.sendBeacon(url + CsrfGuard.getUrlSurffix(), blob);
            isSendBeacon = true;
        } else {
            throw e;
        }
    }

    if (!isSendBeacon && !this.async) { //同步
        if (xmlRequest.readyState == 4) {
            if (xmlRequest.status == 200) {
                return getXMLHttpRequestData(xmlRequest, flm);
            } else {
//				throw "There was a problem retrieving the XML data:\n" + xmlRequest.statusText + " for AjAX Service: \n" + this.serviceName + "." + this.methodName;
            }
        }
    }
};

function getXMLHttpRequestData(xmlRequest, filterLogoutMessage) {
    var ct = xmlRequest.getResponseHeader("content-type");
    var isXML = ct && ct.indexOf("xml") >= 0;
    var data = isXML ? xmlRequest.responseXML : xmlRequest.responseText;

    //window.clipboardData.setData("text", data);
    if (isXML) {
        data = xmlHandle(data) || xmlRequest.responseText;
    }

    //不需要过滤[logout]，默认都要过滤
    if (filterLogoutMessage == true && data != null && data.toString().indexOf("[LOGOUT]") == 0) {
        return null;
    }

    return data;
}

/**
 * 解析XML
 */
function xmlHandle(xmlDom) {
    if (!xmlDom) {
        return null;
    }

    try {
        var root = xmlDom.documentElement;
        if (null != root) {
            var type = root.nodeName;

            if (type == AJAX_RESPONSE_XML_TAG_BEAN) {
                return beanXmlHandle(root);//bean xml
            } else if (type == AJAX_RESPONSE_XML_TAG_LIST) {
                return listXmlHandle(root);//bean xml
            } else if (type == AJAX_RESPONSE_XML_TAG_Value) {
                return root.firstChild.nodeValue;
            }
        }
    } catch (e) {
        throw e.message;
    }

    return null;
};

/**
 * 解析
 * @return Properties
 */
function beanXmlHandle(_node) {
    if (!_node) {
        return null;
    }

    var properties = new Properties();
    properties.type = "";

    var propertys = _node.childNodes;

    if (propertys != null && propertys.length > 0) {
        for (var i = 0; i < propertys.length; i++) {
            var key = propertys[i].attributes.getNamedItem(AJAX_RESPONSE_XML_TAG_Name).nodeValue;
            var value = "";

            var fChild = propertys[i].firstChild;

            if (fChild != null) {
                if (fChild.childNodes != null && fChild.childNodes.length > 0) { //有子节点
                    var type = fChild.nodeName;

                    if (type == AJAX_RESPONSE_XML_TAG_BEAN) {
                        value = beanXmlHandle(fChild);
                    } else if (type == AJAX_RESPONSE_XML_TAG_LIST) {
                        value = listXmlHandle(fChild);
                    } else if (type == AJAX_RESPONSE_XML_TAG_Value) {
                        value = fChild.firstChild.nodeValue;
                    }
                } else {
                    value = fChild.nodeValue;
                }
            }

            properties.putRef(key, (value));
        }
    }

    return properties;
};

/**
 *
 * @return Array Properties[]
 */
function listXmlHandle(_node) {
    var list = new Array();

    if (_node != null) {
        var properties = new Properties();
        var beans = _node.childNodes;

        if (beans != null && beans.length > 0) {
            for (var i = 0; i < beans.length; i++) {
                var type = beans[i].nodeName;
                var returnVal = "";

                if (type == AJAX_RESPONSE_XML_TAG_BEAN) {
                    returnVal = beanXmlHandle(beans[i]);
                } else if (type == AJAX_RESPONSE_XML_TAG_LIST) {
                    returnVal = listXmlHandle(beans[i]);
                } else if (type == AJAX_RESPONSE_XML_TAG_Value) {
                    returnVal = beans[i].firstChild.nodeValue;
                }

                list[i] = returnVal;
            }
        }
    }

    return list;
};


/** Cross browser XMLHttpObject creator */
function getHTTPObject() {
    var xmlhttp;
    /*@cc_on
  @if (@_jscript_version >= 5)
    try {
      xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e) {
      try {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
      catch (E) {
        xmlhttp = false;
      }
    }
  @else
  xmlhttp = false;
  @end @*/
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        try {
            xmlhttp = new XMLHttpRequest();
        } catch (e) {
            xmlhttp = false;
        }
    }
    return xmlhttp;
};


function getBaseURL() {
    try {
        try {
            if (typeof (v3x) == 'undefined') {
                v3x = undefined;
            }
        } catch (e) {
        }
        if (v3x && v3x.baseURL && v3x.baseURL != '') {
            return v3x.baseURL;
        } else if (parent.v3x && parent.v3x.baseURL && parent.v3x.baseURL != '') {
            return parent.v3x.baseURL;
        } else if (getA8Top() && getA8Top().v3x && getA8Top().v3x.baseURL && getA8Top().v3x.baseURL != '') {
            return getA8Top().v3x.baseURL;
        } else if (getA8Top() && getA8Top().conextPath && getA8Top().conextPath != '') {
            return getA8Top().conextPath;
        } else {
            return _ctxPath;
        }
    } catch (e) {
    }

    return "/seeyon";
};


////////////**************************Ajax 方式 直接提交Form数据时，把form中的数据转换成request 格式的ajax参数  zhangh add************************////////////////////
//formObj:form对象
AjaxParameter.prototype.FormToAjaxParameter = function (formObj) {
    var submitData = "";
    var ds = new Properties();
    var i;
    var obj, objValue;
    var tempValue;
    var access;
    for (i = 0; i < formObj.elements.length; i++) {
        obj = formObj.elements[i];
        //公文元素是否可编辑，如果可编辑就要提交数据
        access = obj.getAttribute("canSubmit");
        if (obj.disabled || (obj.readOnly && access != "true")) {
            continue;
        }
        if (obj.type == "select-one" || obj.type == "hidden" || obj.type == "password" || obj.type == "text" || obj.type == "textarea") {
            ds.put(obj.name, obj.value);
        } else if (obj.type == "select-multiple" || obj.type == "checkbox" || obj.type == "radio") {
            objValue = ds.get(obj.name);
            tempValue = getFormInputValue(obj);
            if (tempValue != "") {
                if (objValue != null && objValue != "") {
                    objValue += ",";
                } else {
                    objValue = tempValue;
                }
            }
            if (objValue == null) {
                objValue = "";
            }
            ds.put(obj.name, objValue);
        }
        submitData = ds.toQueryString();
    }
    return submitData;
};

function getFormInputValue(inputObj) {
    var tempValue = "";
    var i;
    var objs;
    if (inputObj.type == "select-multiple") {
        for (i = 0; i < inputObj.options.length; i++) {
            if (inputObj.options[i].selected == true) {
                if (tempValue != "") {
                    tempValue += ",";
                }
                tempValue += inputObj.options[i].value;
            }
        }
    } else if (inputObj.type == "checkbox" || inputObj.type == "radio") {
        objs = document.getElementsByName(inputObj.name);
        for (i = 0; i < objs.length; i++) {
            if (objs[i].checked == true) {
                if (tempValue != "") {
                    tempValue += ",";
                }
                tempValue += objs[i].value;
            }
        }
    }
    return tempValue;
};
///////////***************************Ajax 方式 直接提交Form数据时，把form中的数据转换成ajax参数 结束***********************************************/////////////////
/**********************************************  表格排序  *****************************************************/

var dom = (document.getElementsByTagName) ? true : false;
var ie5 = (document.getElementsByTagName && document.all) ? true : false;

var arrowUp, arrowDown;

if (ie5 || dom)
    initSortTable();

function initSortTable() {
//	arrowUp = document.createElement("SPAN");
//	var tn = document.createTextNode("5");
//	arrowUp.appendChild(tn);
//	arrowUp.className = "arrow";
//
//	arrowDown = document.createElement("SPAN");
//	var tn = document.createTextNode("6");
//	arrowDown.appendChild(tn);
//	arrowDown.className = "arrow";
//	arrowUp = document.createElement("img");
//	arrowUp.style.width='9px';
//	arrowUp.style.height='4px';
//	arrowUp.src=this.baseURL+"/common/images/asc.gif";
//
//	arrowDown = document.createElement("img");
//	arrowDown.style.width='9px';
//	arrowDown.style.height='4px';
//	arrowDown.src=this.baseURL+"/common/images/desc.gif";


    arrowUp = document.createDocumentFragment("SPAN");
    arrowUp.className = "arrowAsc";
    arrowUp.innerHTML = "&nbsp;&nbsp;"

    arrowDown = document.createDocumentFragment("SPAN");
    arrowDown.className = "arrowDesc";
    arrowDown.innerHTML = "&nbsp;&nbsp;"
};

function getNextSibByClass(el, className) {
    if (el == null) return null;
    else if (el.nodeType == 1 && el.className == className)
        return el;
    else
        return getNextSibByClass(el.nextSibling, className);
};

function getParentByClass(el, className) {
    if (el == null) return null;
    else if (el.nodeType == 1 && el.className == className)
        return el;
    else
        return getParentByClass(el.parentNode, className);
};

function sortTable(tableNode, nCol, bDesc, sType, dragable) {
    var tBody;
    //v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
    if (dragable) {
        var divHead = getParentByClass(tableNode, 'hDiv');
        var divBody = getNextSibByClass(divHead, 'bDiv');
        tBody = divBody.childNodes[0].childNodes[0];
    } else {
        tBody = tableNode.tBodies[0];
    }
    var trs = tBody.rows;
    var a = new Array();

    //供WEBIM显示离线人员时排序使用
    var b = new Array();

    for (var i = 0; i < trs.length; i++) {
        var col = trs[i];
        if (col.id.indexOf("off") != -1) {
            b[b.length] = trs[i];
        } else {
            a[a.length] = trs[i];
        }
    }
    a.sort(compareByColumn(nCol, bDesc, sType));
    b.sort(compareByColumn(nCol, bDesc, sType));

    for (var i = 0; i < a.length; i++) {
        if (i % 2 == 0) {
            a[i].className = "erow";
        } else {
            a[i].className = "";
        }
        tBody.appendChild(a[i]);
    }
    for (var i = 0; i < b.length; i++) {
        tBody.appendChild(b[i]);
    }
};

function CaseInsensitiveString(s) {
    return String(s).toLocaleString();
};

function parseDate(s) {
    return Date.parse(s.replace(/\-/g, '/'));
}

function toNumber(s) {
    return Number(s.replace(/[^0-9\.]/g, ""));
};

function compareByColumn(nCol, bDescending, sType) {
    var c = nCol;
    var d = bDescending;

    var fTypeCast = String;

    if (sType == "Number")
        fTypeCast = parseInt;
    else if (sType == "Date")
        fTypeCast = compareMyDate; //显作为字符串
    else if (sType == "CaseInsensitiveString")
        fTypeCast = CaseInsensitiveString;
    else if (sType == "Size")
        fTypeCast = compareSize;
    else if (sType == "Percent")
        fTypeCast = comparePercent;
    else if (sType == "Month")
        fTypeCast = compareMonth
    else if (sType == "Number")
        fTypeCast = compareNumber
    return function (n1, n2) {
        if (fTypeCast == String || fTypeCast == CaseInsensitiveString) {
            var f = fTypeCast(getInnerText(n1.cells[c])).localeCompare(fTypeCast(getInnerText(n2.cells[c])));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else if (fTypeCast == compareMyDate) {
            var f = fTypeCast(getInnerText(n1.cells[c]), getInnerText(n2.cells[c]));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else if (fTypeCast == compareSize) {
            var f = fTypeCast(getInnerText(n1.cells[c]), getInnerText(n2.cells[c]));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else if (fTypeCast == comparePercent) {
            var f = fTypeCast(getInnerText(n1.cells[c]), getInnerText(n2.cells[c]));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else if (fTypeCast == compareMonth) {
            var f = fTypeCast(getInnerText(n1.cells[c]), getInnerText(n2.cells[c]));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else if (fTypeCast == compareNumber) {
            var f = fTypeCast(getInnerText(n1.cells[c]), getInnerText(n2.cells[c]));
            if (d) {
                return f * -1;
            } else {
                return f;
            }
        } else {
            if (fTypeCast(getInnerText(n1.cells[c])) > fTypeCast(getInnerText(n2.cells[c])))
                return d ? -1 : +1;
            if (fTypeCast(getInnerText(n1.cells[c])) < fTypeCast(getInnerText(n2.cells[c])))
                return d ? +1 : -1;
            return 0;
        }
    };
};

function compareNumber(n1, n2) {
    if ((n1 == null || n1 == '  ') && (n2 != null && n2 != '  ')) {
        return -1;
    }
    if ((n2 == null || n2 == '  ') && (n1 != null && n1 != '  ')) {
        return 1;
    }
    if ((n1 == null || n1 == '  ') && (n2 == null || n2 == '  ')) {
        return 0;
    }

    var N1 = parseFloat(n1);
    var N2 = parseFloat(n2);
    if (N1 > N2) {
        return 1;
    } else if (N1 < N2) {
        return -1;
    } else {
        return 0;
    }
}

function compareMonth(m1, m2) {
    //2009-08
    if ((m1 == null || m1 == '  ') && (m2 != null && m2 != '  ')) {
        return -1;
    }
    if ((m2 == null || m2 == '  ') && (m1 != null && m1 != '  ')) {
        return 1;
    }
    if ((m1 == null || m1 == '  ') && (m2 == null || m2 == '  ')) {
        return 0;
    }
    var a1 = m1.split('-');
    var a2 = m2.split('-');
    var y1 = a1[0];
    var y2 = a2[0];
    var M1 = parseInt(parseFloat(a1[1]));
    var M2 = parseInt(parseFloat(a2[1]));
    if (y1 > y2) {
        return 1;
    }
    if (y1 < y2) {
        return -1;
    }
    if (y1 == y2) {
        if (M1 > M2) {
            return 1;
        } else if (M1 < M2) {
            return -1;
        } else {
            return 0;
        }
    }


}

function compareSize(s1, s2) {
    if ((s1 == null || s1 == '  ') && (s2 != null && s2 != '  ')) {
        return -1;
    }
    if ((s2 == null || s2 == '  ') && (s1 != null && s1 != '  ')) {
        return 1;
    }
    if ((s1 == null || s1 == '  ') && (s2 == null || s2 == '  ')) {
        return 0;
    }
    var size1 = initSize(s1);
    var size2 = initSize(s2);
    if (size1 - size2 > 0) {
        return 1;
    } else if (size1 - size2 < 0) {
        return -1;
    } else {
        return 0;
    }

    function initSize(s) {
        if (s.indexOf('MB') > -1) {
            return parseFloat(s) * 1000;
        } else if (s.indexOf('KB') > -1) {
            return parseFloat(s);
        }
    }
}

function comparePercent(s1, s2) {
    if ((s1 == null || s1 == '  ') && (s2 != null && s2 != '  ')) {
        return -1;
    }
    if ((s2 == null || s2 == '  ') && (s1 != null && s1 != '  ')) {
        return 1;
    }
    if ((s1 == null || s1 == '  ') && (s2 == null || s2 == '  ')) {
        return 0;
    }
    var size1 = initPercent(s1);
    var size2 = initPercent(s2);
    if (size1 - size2 > 0) {
        return 1;
    } else if (size1 - size2 < 0) {
        return -1;
    } else {
        return 0;
    }

    function initPercent(s) {
        if (s.indexOf('%') > -1) {
            return parseFloat(s) * 10000;
        }

        return 0;
    }
}

//日期排序
function compareMyDate(d1, d2) {
    //没日期的是两个空格郁闷
    if ((d1 == null || d1 == '  ' || d1 == ' ') && (d2 != null && d2 != '  ' && d2 != ' ')) {
        return -1;
    }
    if ((d2 == null || d2 == '  ' || d2 == ' ') && (d1 != null && d1 != '  ' && d1 != ' ')) {
        return 1;
    }
    if ((d1 == null || d1 == '  ' || d1 == ' ') && (d2 == null || d2 == '  ' || d2 == ' ')) {
        return 0;
    }
    var date1 = initDate(d1);
    var date2 = initDate(d2);

    if (date1 - date2 > 0) {
        return 1;
    } else if (date1 - date2 < 0) {
        return -1;
    } else {
        return 0;
    }
}

//初始化日期
function initDate(d) {
    // 09/08/28 12:54
    if (d.indexOf('/') > -1 && d.indexOf(':') > -1) {
        var sYear = parseFloat(d.substr(0, 2));
        var sMounth = parseFloat(d.substr(3, 2));
        var sDay = parseFloat(d.substr(6, 2));
        var oHH = parseFloat(d.substr(9, 2));
        var oMIN = parseFloat(d.substr(12, 2));
        var oSS = 0;
        return new Date(sYear, sMounth, sDay, oHH, oMIN, oSS);

    } else if (d.indexOf('-') > -1 && d.indexOf(':') > -1) {//yyyy-mm-dd hh:mm:ss
        d = d.trim();
        var oDateArry = d.split(' ');
        var oYMDArry = oDateArry[0].split('-');
        var oHMSArry = oDateArry[1].split(':');
        var oMM = parseInt(oYMDArry[1]);
        if (oYMDArry[1].length == 2 && oYMDArry[1].substr(0, 1) == '0') {
            oMM = parseInt(oYMDArry[1].substr(1, 1));
        }
        var oDD = parseInt(oYMDArry[2]);
        if (oYMDArry[2].length == 2 && oYMDArry[2].substr(0, 1) == '0') {
            oDD = parseInt(oYMDArry[2].substr(1, 1));
        }
        var oHH = parseInt(oHMSArry[0]);
        if (oHMSArry[0].length == 2 && oHMSArry[0].substr(0, 1) == '0') {
            oHH = parseInt(oHMSArry[0].substr(1, 1));
        }
        var oMin = parseInt(oHMSArry[1]);
        if (oHMSArry[1].length == 2 && oHMSArry[1].substr(0, 1) == '0') {
            oMin = parseInt(oHMSArry[1].substr(1, 1));
        }
        var oSS = 0;
        if (oHMSArry.length == 3 && oHMSArry[2].length > 0) {
            oSS = parseInt(oHMSArry[2]);
            if (oHMSArry[2].length == 2 && oHMSArry[2].substr(0, 1) == '0') {
                oSS = parseInt(oHMSArry[2].substr(1, 1));
            }
        }
        return new Date(parseInt(oYMDArry[0]), oMM - 1, oDD, oHH, oMin, oSS);
    } else if (d.indexOf('-') > -1 && d.indexOf(':') == -1) {
        //yyyy-mm-dd
        var oDateArry = d.split('-');
        var oMM = parseInt(oDateArry[1]);
        if (oDateArry[1].length == 2 && oDateArry[1].substr(0, 1) == '0') {
            oMM = parseInt(oDateArry[1].substr(1, 1));
        }
        var oDD = parseInt(oDateArry[2]);
        if (oDateArry[2].length == 2 && oDateArry[2].substr(0, 1) == '0') {
            oDD = parseInt(oDateArry[2].substr(1, 1));
        }
        return new Date(parseInt(oDateArry[0]), oMM - 1, oDD, 0, 0, 0);
    } else if (isChina(d)) {
        var sYear = d.substr(0, 4);
        var sMounth = null;
        var sDay = null;
        //yyyy年m月d日
        if (isChina(d.substr(6, 1)) && isChina(d.substr(8, 1))) {
            sMounth = d.substr(5, 1);
            sDay = d.substr(7, 1);
        } else if (isChina(d.substr(6, 1)) && isChina(d.substr(9, 1))) {
            sMounth = d.substr(5, 1);//yyyy年m月dd日
            sDay = d.substr(7, 2);
        } else if (isChina(d.substr(7, 1)) && isChina(d.substr(9, 1))) {
            sMounth = d.substr(5, 2);//yyyy年mm月d日
            sDay = d.substr(8, 1);
        } else if (isChina(d.substr(7, 1)) && isChina(d.substr(10, 1))) {
            sMounth = d.substr(5, 2);//yyyy年mm月dd日
            sDay = d.substr(8, 2);
        }
        return new Date(parseInt(sYear), parseInt(sMounth) - 1, parseInt(sDay), 0, 0, 0);
    }

}

function isChina(str) {
    var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
    if (!patrn.exec(str)) {
        return false;
    } else {
        return true;
    }
}

//v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
function sortColumn(e, isChangeTRColor, dragable) {
    try {
        var tmp, el;

        if (ie5)
            tmp = e.srcElement;
        else if (dom)
            tmp = e.target;
        //v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
        if (dragable) {
            el = getParent(tmp, "TH");
        } else {
            el = getParent(tmp, "TD");
        }


        var orderByColumn = el.orderBy;

        if (el == null || orderByColumn == null || orderByColumn == "") {
            sortColumnCurrentPage(e, isChangeTRColor, dragable);
        } else {
            sortColumnAll(el, orderByColumn, dragable);
        }
    } catch (e) {
    }
}

function sortColumnAll(el, orderByColumn, dragable) {
    if (!pageQueryMap) {
        var pageQueryMap = new Properties();
    }
    var oldOrderByColumn = pageQueryMap.get("orderByColumn");
    var orderByDESC = pageQueryMap.get("orderByDESC");

    if (orderByDESC == null) {
        orderByDESC = "ASC";
    } else if (orderByColumn != oldOrderByColumn) {
        orderByDESC = "ASC";
        pageQueryMap.put("page", 1);
    } else {
        orderByDESC = orderByDESC == "DESC" ? "ASC" : "DESC";
    }

    pageQueryMap.put("orderByColumn", orderByColumn);
    pageQueryMap.put("orderByDESC", orderByDESC);
    getPageAction(el);
}

function sortColumnCurrentPage(e, isChangeTRColor, dragable) {
    var tmp, el, tHeadParent, dragable, tTable;

    if (ie5)
        tmp = e.srcElement;
    else if (dom)
        tmp = e.target;

    tTable = getParent(tmp, "TABLE");
    tHeadParent = getParent(tmp, "THEAD");

    //v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
    if (dragable) {
        //可拖动列表点击选中(背景更改)在后台设置，直接调用selectRow(tmp);
        //list.table.body.td.html.true= <td onclick="selectRow(this)"><div {0} style="text-align:{2}; width: 229px;">{1}</div></td>
        el = getParent(tmp, "TH");
    } else {
        var tFooterParent = getParent(tmp, "TFOOT");
        if (tmp.tagName == "TD" && tFooterParent == null && tHeadParent == null && isChangeTRColor == true) {	//如果点击的是表格中的数据单元格，则选择该行
            selectRow(tmp);
        }
        el = getParent(tmp, "TD");
    }

    if (el == null || el.getAttribute('type') == null || el.getAttribute('type') == "") {
        return;
    }

    if (tHeadParent == null)
        return;

    if (!pageQueryMap) {
        var pageQueryMap = new Properties();
    }

    var orderByColumn = pageQueryMap.get("orderByColumn");
    if (orderByColumn) {
        var orderByColumnSpanObj = document.getElementById("OrderByColumn_" + orderByColumn);
        if (orderByColumnSpanObj) {
            orderByColumnSpanObj.parentNode.removeChild(orderByColumnSpanObj);
        }
    }

    if (el != null) {
        var p = el.parentNode;
        var i;

        if (el._descending)	// catch the null
            el._descending = false;
        else
            el._descending = true;

        if (tHeadParent.arrow != null) {
            //v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
            if (dragable) {
                tHeadParent.arrow.className = '';
            } else {
                if (tHeadParent.arrow.parentNode == null) {
                    tHeadParent.arrow = null;
                } else {
                    if (tHeadParent.arrow.parentNode != el) {
                        tHeadParent.arrow.parentNode._descending = null;	//reset sort order
                    }
                    tHeadParent.arrow.parentNode.removeChild(tHeadParent.arrow);
                }
            }
        }

        var oDiv = el.firstChild;
        //v3x:table有两种属性1：表头固定+列宽拖动（div）2:表格(table)
        if (dragable) {
            if (el._descending) {
                oDiv.className = 'sdesc';
            } else {
                oDiv.className = 'sasc';
            }
            tHeadParent.arrow = oDiv;
        } else {
            if (el._descending) {
                tHeadParent.arrow = arrowDown.cloneNode(true);
            } else {
                tHeadParent.arrow = arrowUp.cloneNode(true);
            }
            el.appendChild(tHeadParent.arrow);
        }

        // get the index of the td
        for (i = 0; i < p.cells.length; i++) {
            if (p.cells[i] == el) break;
        }

        var table = getParent(el, "TABLE");
        // can't fail

        sortTable(table, i, el._descending, el.getAttribute("type"), dragable);
    }
};


function getInnerText(el) {
    if (ie5) return el.innerText;	//Not needed but it is faster

    var str = "";

    for (var i = 0; i < el.childNodes.length; i++) {
        switch (el.childNodes.item(i).nodeType) {
            case 1: //ELEMENT_NODE
                str += getInnerText(el.childNodes.item(i));
                break;
            case 3:	//TEXT_NODE
                str += el.childNodes.item(i).nodeValue;
                break;
        }
    }

    return str;
};

function getParent(el, pTagName) {
    if (el == null) return null;
    else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase())	// Gecko bug, supposed to be uppercase
        return el;
    else
        return getParent(el.parentNode, pTagName);
};


function clearSiblingStyle(objTr) {
    var siblings = objTr.parentNode.childNodes;

    if (siblings != null) {
        for (var i = 0; i < siblings.length; i++) {
            var o = siblings[i];
            redoStyle(o);
        }
    }
};


/********************************** 表单验证 *****************************************/
/**
 * 常量定义
 */
var formValidate = {
    unCharactor: "\"\\/|><:*?'&%$",
    integerDigits: "10",
    decimalDigits: "0"
}

/**
 * 表单验证
 */
V3X.prototype.checkFormAdvanceAttribute = "";

function checkForm(formObj) {
    var elements = formObj.elements;

    var clearValueElements = [];

    if (elements != null) {
        for (var i = 0; i < elements.length; i++) {
            var e = elements[i];
            var clearValue = e.getAttribute("clearValue");

            if (clearValue == "true") {
                clearValueElements[clearValueElements.length] = e;
                continue;
            }
            V3X.checkFormAdvanceAttribute = e.getAttribute("advance");
            var validateAtt = e.getAttribute("validate");
            if (validateAtt != null && validateAtt != "" && validateAtt != "undefined") {
                var validateFuns = validateAtt.split(",");

                var shadowElements = [];
                if (e["data-i18n"] === true) {
                    // 被国际化控件包装了一层
                    var allLanguage = e["data-allLanguageValue"];
                    if (allLanguage) {
                        allLanguage = $.parseJSON(allLanguage);
                        for (var key in allLanguage) {
                            if (allLanguage[key]) {
                                var shadowEle = e.cloneNode();
                                shadowEle.value = allLanguage[key];
                                shadowElements.push(shadowEle);
                            }
                        }
                    } else {
                        shadowElements.push(e);
                    }
                } else {
                    shadowElements.push(e);
                }

                for (var se = 0; se < shadowElements.length; se++) {
                    var shadowElement = shadowElements[se];

                    for (var f = 0; f < validateFuns.length; f++) {
                        var fun = validateFuns[f];
                        if (fun) {
                            var result = eval(fun + "(shadowElement)");

                            if (!result) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
    }

    for (var j = 0; j < clearValueElements.length; j++) {
        clearDefaultValueWhenSubmit(clearValueElements[j]);
    }

    return true;
};

/**
 * 执行正则表达式
 */
function testRegExp(text, re) {
    return new RegExp(re).test(text);
};

/**
 * 在提交的时候，清除掉默认值
 */
function clearDefaultValueWhenSubmit(element) {
    var defaultValue = getDefaultValue(element);

    var v = element.value;

    if (v == defaultValue) {
        element.value = "";
    }
};

/**
 * 打印出提示消息，并聚焦
 */
function writeValidateInfo(element, message) {
    alert(message);

    var onAfterAlert = element.getAttribute("onAfterAlert");
    if (onAfterAlert) {
        try {
            eval(onAfterAlert);
        } catch (e) {
        }
    } else {
        try {
            element.focus();
            element.select();
        } catch (e) {
        }
    }
};

function notSpecChar(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");
    //修改[]之间的内容，其它部分不许修改
    if (/^[^\|\\"'<>]*$/.test(value)) {
        return true;
    } else {
        writeValidateInfo(element, $.i18n("formValidate_specialCharacter", inputName));
        return false;
    }
}

function notSpecCharWithoutApos(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");
    //修改[]之间的内容，其它部分不许修改
    if (/^[^\|\\\/"<>]*$/.test(value)) {
        return true;
    } else {
        writeValidateInfo(element, $.i18n("formValidate_specialCharacter_withoutApos", inputName));
        return false;
    }
}

/**
 * 验证是否为空，不允许空格
 */
function notNull(element) {
    var value = element.value;
    value = value.replace(/[\r\n]/g, "");
    var inputName = element.getAttribute("inputName");

    if (value == null || value == "" || value.trim() == "" || value == $.i18n('section.hasNoSet')) {
        writeValidateInfo(element, $.i18n("formValidate_notNull", inputName));
        return false;
    }

    var maxLength = element.getAttribute("maxSize");

    if (maxLength && value.length > maxLength) {
        writeValidateInfo(element, $.i18n("formValidate_maxLength", inputName, maxLength, value.length));
        return false;
    }

    return true;
};

/**
 * 检测长度
 */
function maxLength(element) {
    var value = element.value;
    if (!value) {
        return true;
    }

    var inputName = element.getAttribute("inputName");

    var maxLength = element.getAttribute("maxSize");

    if (maxLength && value.length > maxLength) {
        writeValidateInfo(element, $.i18n("formValidate_maxLength", inputName, maxLength, value.length));
        return false;
    }

    return true;
};

/**
 *  检测最小长度
 */
function minLength(element) {
    var value = element.value;
    if (!value) {
        return true;
    }

    var inputName = element.getAttribute("inputName");

    var minLength = element.getAttribute("minLength");

    if (minLength && value.length < minLength) {
        writeValidateInfo(element, $.i18n("formValidate_minLength", inputName, minLength, value.length));
        return false;
    }

    return true;
};

/**
 * 是否为数字
 */
function isNumber(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var integerDigits = element.getAttribute("integerDigits") || formValidate.integerDigits;
    var decimalDigits = element.getAttribute("decimalDigits") || formValidate.decimalDigits;
    var integerMax = element.getAttribute("integerMax");
    var integerMin = element.getAttribute("integerMin");

    if (value == "0") {
        return true;
    }

    if (!testRegExp(value, "^-?[0-9]{0," + integerDigits + "}\\.?[0-9]{0," + decimalDigits + "}$")) {
        writeValidateInfo(element, $.i18n("formValidate_isNumber", inputName));
        return false;
    }

    if (integerMax && parseInt(value) > integerMax) {
        writeValidateInfo(element, $.i18n("formValidate_too_max", inputName, integerMax, value));
        return false;
    }

    if (integerMin && parseInt(value) < integerMin) {
        writeValidateInfo(element, $.i18n("formValidate_too_min", inputName, integerMin, value));
        return false;
    }

    return true;
};

/**
 * 校验输入的数字是否为正数，必须大于0
 */
function positive(element) {
    var str = element.value.trim();
    if (str != '') {
        var value = parseFloat(element.value.trim());
        var inputName = element.getAttribute("inputName");
        if (value <= 0) {
            writeValidateInfo(element, $.i18n("formValidate_positive", inputName));
            return false;
        }
    }
    return true;
}

/**
 * 校验输入的百分比，必须在0~100之间
 */
function percent(element) {
    var str = element.value.trim();
    if (str != '') {
        var value = parseFloat(element.value.trim());
        var inputName = element.getAttribute("inputName");
        if (value < 0 || value > 100) {
            writeValidateInfo(element, $.i18n("formValidate_percent", inputName, str));
            return false;
        }
    }
    return true;
}

/**
 *
 */
function notNum(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var integerDigits = element.getAttribute("integerDigits") || formValidate.integerDigits;
    var decimalDigits = element.getAttribute("decimalDigits") || formValidate.decimalDigits;

    if (value == "0") {
        return true;
    }
    if (testRegExp(value, "^-?[0-9]{0," + integerDigits + "}\\.?[0-9]{0," + decimalDigits + "}$")) {
        writeValidateInfo(element, $.i18n("formValidate_isNotNumber", inputName));
        return false;
    }

    return true;


}

/**
 * 检测是否是邮箱
 */
function isEmail(element) {
    var value = element.value;
    if (!value) {
        return true;
    }

    var inputName = element.getAttribute("inputName");

    if (value.indexOf("@") == -1 || value.indexOf(".") == -1) {
        writeValidateInfo(element, $.i18n("formValidate_isEmail", inputName));
        return false;
    }

    return true;
};

/**
 * 验证是否为空，允许空格
 */
function notNullWithoutTrim(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    if (value == null || value == "") {
        writeValidateInfo(element, $.i18n("formValidate_notNull", inputName));
        return false;
    }

    var maxLength = element.getAttribute("maxLength");
    if (maxLength && value.length > maxLength) {
        writeValidateInfo(element, $.i18n("formValidate_maxLength", inputName, maxLength));
        return false;
    }

    return true;
};

/**
 * 验证是否为整数，并验证max和min
 */
function isInteger(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var max = element.getAttribute("max");
    var min = element.getAttribute("min");

    if (value != "0" && (isNaN(value) || value.indexOf("0") == 0 || !testRegExp(value, "^-?[0-9]*$"))) {
        writeValidateInfo(element, $.i18n("formValidate_isInteger", inputName));
        return false;
    }

    if (max != null && max != "" && parseInt(value) > parseInt(max)) {
        writeValidateInfo(element, $.i18n("formValidate_isInteger_max", inputName, max));
        return false;
    }

    if (min != null && min != "" && parseInt(value) < parseInt(min)) {
        writeValidateInfo(element, $.i18n("formValidate_isInteger_min", inputName, min));
        return false;
    }

    return true;
};

/**
 * 是否为正常的字符串，不允许特殊字符，如：/ character
 */
function isWord(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var character = element.getAttribute("character") || formValidate.unCharactor;

    var _c = "";
    for (var i = 0; i < character.length; i++) {
        if (value.indexOf(character.charAt(i)) > -1) {
            _c += character.charAt(i);
        }
    }

    if (_c.length > 0) {
        writeValidateInfo(element, $.i18n("formValidate_isWord", inputName, _c, character));
        return false;
    }

    return true;
};

/**
 * 是否为正常的字符串，不允许特殊字符，如：/ character
 * add by wangchw
 */
function isSepcialWord(element, needAlert) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var character = element.getAttribute("character") || "\\!@#$|%^&*?:<>\/\'";

    var _c = "";
    for (var i = 0; i < character.length; i++) {
        if (value.indexOf(character.charAt(i)) > -1) {
            _c += character.charAt(i);
        }
    }

    if (_c.length > 0) {
        if (typeof (needAlert) == "undefined") {
            writeValidateInfo(element, $.i18n("formValidate_isWord", inputName, _c, character));
        }
        return false;
    }

    return true;
};

/**
 * 是否是数字、字母、下划线
 */
function isCriterionWord(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    if (!testRegExp(value, '^[\\w-]+$')) {
        writeValidateInfo(element, $.i18n("formValidate_isCriterionWord", inputName));
        return false;
    }

    return true;
};

/**
 * 判断是否符合url格式
 */
function isUrl(element) {
    var value = element.value;
    if (!value) {
        return true;
    }
    var inputName = element.getAttribute("inputName");
    //之前：^http://{1}([\w-]+\.)+[\w-]+     匹配http://www.********
    //     ^http://{1}([\\w-]+\.)+[\\w-]+   匹配http://***********
    if (!testRegExp(value, "^http://{1}([\\w-]+\.)+[\\w-]+")) {
        writeValidateInfo(element, $.i18n("formValidate_isUrl", inputName));
        return false;
    }
    return true;
}

/**
 * 以指定文本开头
 */
function startsWith(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var prefix = element.getAttribute("prefix");

    if (value.indexOf(prefix) != 0) { // prefix是扩展的属性
        writeValidateInfo(element, $.i18n("formValidate_startsWith", inputName, prefix));
        return false;
    }

    return true;
};


function isDefaultValue(element) {
    var value = element.value;
    var inputName = element.getAttribute("inputName");

    var defaultValue = getDefaultValue(element);

    if (value == defaultValue) {
        writeValidateInfo(element, $.i18n("formValidate_notNull", inputName));
        return false;
    }

    return true;
};

/*********************************  日期选择器 *********************************************/
var __addDataEventObject = null;

/**
 * e.g whenstart('${pageContext.request.contextPath}', this, 575, 140);
 *
 * @param contextPath 跟路径 ${pageContext.request.contextPath}
 * @param whoClick 要赋值的Object，如果为null，则返回日期数据
 * @param myLeft 距屏幕左面距离(废弃，去鼠标点击的位置)
 * @param myTop 距屏幕上面距离(废弃，去鼠标点击的位置)
 * @param type 选择类型 date datetime 默认 date
 * @param allowEmpty 是否允许空
 * @param
 */
function whenstart(contextPath, whoClick, myLeft, myTop, type, allowEmpty, width, height) {
    type = type || "date";
    if (allowEmpty == null) {
        allowEmpty = true;
    }
    __addDataEventObject = whoClick;
    var evt = v3x.getEvent();
    if (v3x.getBrowserFlag('openWindow') == false || typeof (window.showModalDialog) == "undefined") {
        var clickTarget = evt.currentTarget;
        var date_win = new MxtWindow({
            id: 'date_win',
            title: v3x.getMessage("V3XLang.calendar_page_title"),
            url: contextPath + "/common/js/addDate/date.jsp?type=" + type + "&allowEmpty=" + allowEmpty + "&showButton=false",
            height: height + 5 || 320,
            width: width + 5 || 320,
            relativeElement: whoClick,
            targetWindow: getA8Top(),
            type: 'window',//类型window和panel为panel的时候title不显示
            isDrag: false,//是否允许拖动
            buttons: [{
                id: 'btn1',
                text: $.i18n('common.button.ok.label'),
                handler: function () {
                    var rv = date_win.getReturnValue();
                    if (rv) {
                        clickTarget.value = rv;
                    }
                    date_win.close();
                }
            }, {
                id: 'btn2',
                text: $.i18n('common.button.clear.label'),
                handler: function () {
                    clickTarget.value = "";
                    date_win.close();
                }
            }]
        });
    } else {
        var rv = v3x.openWindow({
            url: contextPath + "/common/js/addDate/date.jsp?type=" + type + "&allowEmpty=" + allowEmpty + "&showButton=true",
            height: 230,
            width: 250,
            'top': evt.screenY + 20,
            left: evt.screenX - 50
        });
        if (rv == null)
            rv = "";
        if (!whoClick && rv) {
            return rv;
        }
        return rv;
    }
}

//功能:判断是否为合法的日期字符串
//参数:必须是年月日格式，年要求四位，月日可以是长类型或者短类型，必须以'-'或者'/'作为分隔符
//     isSave为true时合法日期保存到当前日期对象
Date.prototype.isDate = function (szDate, isSave) {
    var re, regu;
    var splitChar, Year, Month, Day;
    var szArry;
    var strObj = new String(szDate);
    if (strObj.length < 8 || strObj.length > 10) return false;//判断日期的长度，完整的年，长短日期格式
    regu = "^([0-9]){4}(-|/)([0-9]){1,2}(-|/)([0-9]){1,2}$";//日期模板校验(以‘－’或者‘/’分割的日期)
    re = new RegExp(regu);
    if (strObj.search(re) == -1) return false;
    splitChar = strObj.charAt(4);//年必须输入四位数字
    szArry = strObj.split(splitChar);
    if (szArry.length != 3) return false;
    Year = parseInt(szArry[0], 10);
    Month = parseInt(szArry[1], 10);
    Day = parseInt(szArry[2], 10);
    if (Year < 1900 || Year > 2500) return false;
    if (Month < 1 || Month > 12) return false;//月必须在１－－１２之间
    if (Day < 1 || Day > 31) return false;//日必须在１－３１之间
    switch (Month) {
        case 4:
        case 6:
        case 9:
        case 11:
            if (Day > 30) return false;
            break;
        case 2:
            if ((Year % 4 == 0 && Year % 100 != 0) || Year % 400 == 0)//润年2月份29天
            {
                if (Day > 29) return false;
            } else {
                if (Day > 28) return false;
            }
            break;
        default:
            break;
    }
    if (isSave) {
        /**
         * 设值顺序改为：先设定日、再设定月、再设定年，避免出现如下Bug：
         * 日期变量2010-01-30调用此方法，参数为('2010-02-01', true)后日期变量会变为2010-03-01(应该为2010-02-01)
         * 因为先设定月，再设定日，此时该值为2010-02-30，超出2月天数，此时系统自动将其月份改为3月
         */
        this.setDate(Day);
        this.setMonth(Month - 1);
        this.setYear(Year);
    }
    return true;
}

/**
 * 将日期字符串转换成日期对象
 */
function parseDate(dateStr) {
    var ds = dateStr.split("-");
    var y = parseInt(ds[0], 10);
    var m = parseInt(ds[1], 10) - 1;
    var d = parseInt(ds[2], 10);

    return new Date(y, m, d);
}

//功能:得到输入日期前几天或者后几天的日期

Date.prototype.dateAdd = function (curDateStr, iPassNum) {
    var dateObj;
    var sNewDate = curDateStr;
    var y, m, d;
    var sDate;
    var bUpChange = false;
    var splitChar;
    var szArry;
    var strObj;
    if (this.isDate(curDateStr, true) == false) {
        //alert("当前日期错误!");
        return curDateStr;
    }
    strObj = new String(curDateStr);
    splitChar = strObj.charAt(4);//年必须输入四位数字
    szArry = strObj.split(splitChar);
    y = parseInt(szArry[0], 10);
    m = parseInt(szArry[1], 10);
    d = parseInt(szArry[2], 10);

    while (iPassNum != 0) {
        //设置日期
        if (iPassNum > 0) d++;
        else d--;
        if (d <= 0 || d > 31) {
            bUpChange = true;
            if (d <= 0) d = 31;
            else d = 1;
        } else {
            bUpChange = false;
        }
        //设置月
        if (bUpChange) {
            if (iPassNum > 0) m++;
            else m--;
            if (m <= 0 || m > 12) {
                bUpChange = true;
                if (m <= 0) m = 12;
                else m = 1;
            } else {
                bUpChange = false;
            }
        }
        //设置年
        if (bUpChange) {
            if (iPassNum > 0) y++;
            else y--;
        }
        sNewDate = y + "-" + m + "-" + d;
        if (this.isDate(sNewDate, false)) {
            if (iPassNum > 0) iPassNum--;
            else iPassNum++;
        }
    }
    return sNewDate;
}
//功能:得到输入日期所在的星期的开始日期(星期一)和结束日期(星期五)
Date.prototype.getWeekStart = function (dateStr) {
    this.isDate(dateStr, true);
    var iWeek = this.getDay();

    //一周的第一天这里定为周日
    var iPassNum = iWeek;
    if (iPassNum != 0) iPassNum = -iPassNum;
    return formatDate(this.dateAdd(dateStr, iPassNum));
}

Date.prototype.getWeekEnd = function (dateStr) {
    this.isDate(dateStr, true);
    var iWeek = this.getDay();
    //alert(dateStr+"|||"+this.getYear()+"-"+m+"-"+this.getDate());
    //alert("iWeek:"+iWeek);
    //if(iWeek==0) iWeek=7;
    var iPassNum = 6 - iWeek;
    return formatDate(this.dateAdd(dateStr, iPassNum));
}

//功能:得到输入日期所在的月份的开始日期和结束日期
Date.prototype.getMonthStart = function (dateStr) {
    this.isDate(dateStr, true);
    dateStr = this.getFullYear() + "-" + (this.getMonth() + 1) + "-1";
    return formatDate(dateStr);
}
Date.prototype.getMonthEnd = function (dateStr) {
    this.isDate(dateStr, true);
    var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    //this.isDate(dateStr,true);
    var iYear = this.getFullYear();
    var iMonth = this.getMonth() + 1;

    var iDay = months[this.getMonth()];

    if (iYear % 4 == 0 && iMonth == 2) {
        iDay++;
    }
    dateStr = iYear + "-" + iMonth + "-" + iDay;
    return formatDate(dateStr);
}
//功能:得到输入日期所在的季度的开始日期和结束日期
Date.prototype.getSeasonStart = function (dateStr) {
    var a = [1, 1, 1, 4, 4, 4, 7, 7, 7, 10, 10, 10];
    this.isDate(dateStr, true);
    dateStr = this.getFullYear() + "-" + a[this.getMonth()] + "-1";
    return formatDate(dateStr);
}
Date.prototype.getSeasonEnd = function (dateStr) {
    this.isDate(dateStr, true);
    var a = [3, 3, 3, 6, 6, 6, 9, 9, 9, 12, 12, 12];
    var m = [31, 31, 31, 30, 30, 30, 30, 30, 30, 31, 31, 31];
    this.isDate(dateStr, true);
    dateStr = this.getFullYear() + "-" + a[this.getMonth()] + "-" + m[this.getMonth()];
    return formatDate(dateStr);
}
//得到这个月的第几周
Date.prototype.getWeekOfMonth = function () {
    var w = this.getDay();
    var d = this.getDate();
    return Math.ceil((d + 6 - w) / 7);
}

function formatDate(dateStr) {
    var d = dateStr.split("-");
    var month = parseInt(d[1], 10);
    var date = parseInt(d[2], 10);

    return d[0] + "-" + (month < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date);
}

/**
 * 日期格式化
 */
Date.prototype.format = function (pattern) {
    var hour = this.getHours();
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "H+": hour,   //hour
        "h+": (hour > 12 ? hour - 12 : hour),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(pattern)) {
        pattern = pattern.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) if (new RegExp("(" + k + ")").test(pattern)) {
        pattern = pattern.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }

    return pattern;
}

/**
 * 比较两个字符串日期的前后，不比较时间
 *
 * @param dateStr1 日期1 字符串
 * @param dateStr2 日期2 字符串
 * @return 负整数、零或正整数，根据此对象是小于、等于还是大于
 */
function compareDate(dateStr1, dateStr2) {
    return Date.parse(dateStr1.replace(/\-/g, '/')) - Date.parse(dateStr2.replace(/\-/g, '/'));
}

/*************************************以下为日期格式转换函数*******************************/

/*
功能:YYYY-MM-DD 数字日期转化为汉字
例:2008-3-7 -> 二零零八年三月七日
调用:date2chinese1("2008-3-7")

date2chinese0("2008-5-8"); －－》 二〇〇八年三月七日

date2chinese("2008-05-8"); －－》 2008年5月8日


*/
var chinese = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
var len = ["十"];
var ydm = ["年", "月", "日"];

function num2chinese(s) {

//将单个数字转成中文.
    s = "" + s;
    slen = s.length;
    var result = "";
    for (var i = 0; i < slen; i++) {
        result += chinese[s.charAt(i)];
    }
    return result;
}


function n2c(s) {
//对特殊情况进行处理.
    s = "" + s;
    var result = "";
    if (s.length == 2) {
        if (s.charAt(0) == "1") {
            if (s.charAt(1) == "0") return len[0];
            return len[0] + chinese[s.charAt(1)];
        }
        if (s.charAt(1) == "0") return chinese[s.charAt(0)] + len[0];
        return chinese[s.charAt(0)] + len[0] + chinese[s.charAt(1)];
    }
    return num2chinese(s)
}

function date2chinese0(s) {
    var ns = date2chinese(s);
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


function getA8Top() {
    try {
        var A8TopWindow = getA8ParentWindow(window);
        if (A8TopWindow) {
            return A8TopWindow;
        } else {
            return top;
        }
    } catch (e) {
        return top;
    }
}

function getA8ParentWindow(win) {
    var currentWin = win;
    for (var i = 0; i < 20; i++) {
        if (typeof currentWin.isCtpTop != 'undefined' && currentWin.isCtpTop) {
            return currentWin;
        } else {
            //当window.top没有isCtpTop标记的时候,优化下，避免取20次的问题 【新开窗口基本上都是这种场景】
            if (currentWin == window.top) break;
            currentWin = currentWin.parent;
        }
    }
}

function getRealFileType(flag, params) {
    var FileTypeObj = {
        'OfficeWord': 'doc',
        'OfficeExcel': 'xls',
        'WpsWord': 'wps',
        'WpsExcel': 'et',
        'Pdf': 'pdf',
        'Ofd': 'ofd',
        'HTML': 'HTML'
    }
    if (params.fileType) {
        return params.fileType;
    } else {
        return FileTypeObj[flag];
    }
}

function getWebRoot() {
    var ctxPath = typeof _ctxPath != 'undefined' && _ctxPath != null ? _ctxPath : "/seeyon";
    if (typeof (window.location.origin) == 'undefined') {
        basePath = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + ctxPath;
    } else {
        basePath = window.location.origin + ctxPath;
    }
    return basePath;
}

/**
 * 显示编辑器
 */
function showEditor(flag, isRevertContent, params) {
    params.webRoot = _ctxServer = getWebRoot();
    //是否还原正文，默认为true
    isRevertContent = isRevertContent == null ? true : false;
    params.fileType = getRealFileType(flag, params);

    // 1、实例化对象
    if (officeSDK === null) {
        officeSDK = new OfficeSDK(params)
    }
    var _currentPage = typeof currentPage === 'undefined' ? '' : currentPage;
    // 2、初始化三方控件
    officeSDK.init({
        webRoot: _ctxServer,
        fileType: params.fileType,
        domId: 'officeFrameDiv',
        mode: "EDIT",
        canRevise: _currentPage === 'knowledgeBrowseEdit' ? true : undefined,
        isShowTrailBtn: _currentPage === 'knowledgeBrowseEdit' ? true : undefined,
    }, function (err, result) {
        if (err != null) {
            if ($ && $.alert) {
                $.alert("当前配置，不支持操作" + params.fileType + "类型文件");
            } else {
                alert("当前配置，不支持操作" + params.fileType + "类型文件");
            }
            return;
        } else {
            var officeFrameDiv = window.document.getElementById('officeFrameDiv');
            officeFrameDiv.style.display = 'block';
            officeFrameDiv.style.overflow = "hidden";
            // 3、打开文件
            officeSDK.openFile({isDialog: false});

            /* 作者:dengwei 时间2020-09-15 功能新闻兼容ofd文件之展示ofd文件 end*/
            var bodyTypeObj = document.getElementById("bodyType");
            if (bodyTypeObj) {
                if (window.setContentTypeState) {
                    setContentTypeState(bodyTypeObj.value, flag);
                }
                bodyTypeObj.value = flag;
            }
            //公告新闻预览屏蔽（如果是WORD或者EXCEL）
            try {
                var bulBottPre = document.getElementById("bulBottPre").value;
                if (bulBottPre && bulBottPre == '1') {
                    if (flag == 'HTML') {
                        myBar.enabled('preview');
                    } else {
                        myBar.disabled('preview');
                    }
                }
            } catch (e) {
            }
        }
    })
}

/****************************************/
function getInstallOfficeStatus() {
    var status = {};
    try {
        var isMSIE = (navigator.appName == "Microsoft Internet Explorer") || ua.indexOf('Trident') != -1;
        if (isMSIE) {
            //没有安装office插件
            var ocxObj = "";
            if (navigator.cpuClass.indexOf("x86") != -1) {
                ocxObj = new ActiveXObject("Kinggrid.iWebOffice");
            } else {
                ocxObj = new ActiveXObject("Kinggrid.iWebOffice_x64");
            }
            status.installDoc = ocxObj.WebApplication(".doc");
            status.installWps = ocxObj.WebApplication(".wps");
        } else {
            status.installDoc = true;
            status.installWps = true;
        }
    } catch (e) {
        status.installDoc = true;
        status.installWps = true;
    }
    return status;
}

/************ 列表页面的精确查找 ***********/

/****************************************/
function showNextCondition(conditionObject) {
    if (!conditionObject)
        return;
    var options = conditionObject.options;

    for (var i = 0; i < options.length; i++) {
        var d = document.getElementById(options[i].value + "Div");
        if (d) {
            d.style.display = "none";
        }
    }
    if (!document.getElementById(conditionObject.value + "Div")) return;
    document.getElementById(conditionObject.value + "Div").style.display = "block";
}

/**
 * 当使用到搜索时，显示前端
 */
function showCondition(conditionValue, textfieldValue, textfield1Value) {

    if (!conditionValue) {
        return;
    }
    var conditionObj = document.getElementById("condition")

    selectUtil(conditionObj, conditionValue); //选择条件
    showNextCondition(conditionObj); //显示条件值区�?

    var theDiv = document.getElementById(conditionValue + "Div");

    if (theDiv) {
        var nodes = theDiv.childNodes;

        if (nodes) {
            for (var j = 0; j < nodes.length; j++) {
                var node = nodes.item(j);
                if (node.tagName == "INPUT") {
                    eval("node.value = " + node.name + "Value;")
                } else if (node.tagName == "SELECT") {
                    eval("selectUtil(node, " + node.name + "Value)")
                }
            }
        }
    }
}


/**
 * 根据后端的值，将下拉按钮对应的项置于选中状�?
 */
function selectUtil(selectObj, selectedValue) {
    if (!selectObj) {
        return false;
    }

    var ops = selectObj.options;

    for (var i = ops.length - 1; i >= 0; i--) {
        if (ops[i].value == selectedValue) {
            selectObj.selectedIndex = i;
            return true;
        }
    }

    return false;
}

/**
 * 调用该方法之前,请先把当前页面的开始时间和结束时间的选择框命名为startdate和enddate
 * @return {Boolean}
 */
function dateCheck() {
    var startdate = document.getElementById('startdate').value;
    var enddate = document.getElementById('enddate').value;
    if (compareDate(startdate, enddate) > 0) {
        window.alert($.i18n("calendar_endTime_startTime"));
        return false;
    }
    doSearch();
}

var SearchEnter = {
    submitCount: 0
}

/**
 * 搜索按钮事件
 */
function doSearch() {
    var theForm = document.getElementsByName("searchForm")[0];
    var searchDate = document.getElementById('createDateDiv');

    if (theForm) {
        //FIXME 防止在选择条件时候按住回车，狂发请求。
        if (SearchEnter.submitCount > 2) {
            return;
        }
        var options = theForm.condition.options;

        for (var i = 0; i < options.length; i++) {
            if (theForm.condition.value == options[i].value) {
                var passCheck = true;
                if ('createDate' == theForm.condition.value) {
                    var searchDateDiv = document.getElementById(options[i].value + "Div");
                    //加入对搜索时，时间的check
                    var seachDateChildNods;
                    if (searchDateDiv != null) {
                        seachDateChildNods = searchDateDiv.childNodes;
                    }
                    var timeChildNodes = new Array();
                    if (seachDateChildNods != null) {
                        seachDateChildNods = searchDate.childNodes;
                        for (var j = 0; j < seachDateChildNods.length; j++) {
                            var tempChildNode = seachDateChildNods[j];
                            if (tempChildNode.type == "text") {
                                timeChildNodes.push(tempChildNode);
                            }
                        }
                    }
                    if ((timeChildNodes.length > 0) && (timeChildNodes.length < 3)) {
                        var beginTimeStr = timeChildNodes[0].value;
                        var beginTimeStrs = beginTimeStr.split("-");
                        var beginTimeDate = new Date();
                        beginTimeDate.setFullYear(beginTimeStrs[0], beginTimeStrs[1] - 1, beginTimeStrs[2]);
                        var endTimeStr = timeChildNodes[1].value;
                        var endTimeStrs = endTimeStr.split("-");
                        var endTimeDate = new Date();
                        endTimeDate.setFullYear(endTimeStrs[0], endTimeStrs[1] - 1, endTimeStrs[2]);
                        if (endTimeDate < beginTimeDate) {
                            passCheck = false;
                        }
                    }
                }
                if (passCheck) {
                    continue;
                } else {
                    //window.alert($.i18n("calendar_endTime_startTime"));
                    return;
                }
            }

            var d = document.getElementById(options[i].value + "Div");
            if (d) {
                d.innerHTML = "";
            }
        }
        theForm.target = theForm.target || "_self";
        SearchEnter.submitCount++;
        //把grid的分页参数传过去
        if (pageQueryMap) {
            var inputPage = document.createElement("input");
            inputPage.setAttribute("name", "page");
            inputPage.setAttribute("type", "hidden");
            inputPage.setAttribute("value", pageQueryMap.get("page"));
            theForm.appendChild(inputPage);

            var inputPageSize = document.createElement("input");
            inputPageSize.setAttribute("name", "pageSize");
            inputPageSize.setAttribute("type", "hidden");
            inputPageSize.setAttribute("value", pageQueryMap.get("pageSize"));
            theForm.appendChild(inputPageSize);

        }
        theForm.submit();
    }
}

function doSearchEnter() {
    var evt = v3x.getEvent();
    if (evt.keyCode == 13) {
        doSearch();
    }
}

/**
 * 弹出窗口的关闭时间
 * <body onkeypress="listenerKeyESC()">
 */
function listenerKeyESC() {
    var evt = v3x.getEvent();
    if (evt.keyCode == 27) {
        window.close();
    }
}

/**
 * 检测checkbox是否被选择
 * @return 0 - 表示选择  否则返回选择的个数
 */
function validateCheckbox(checkboxName) {
    checkboxName = checkboxName || "id";
    var id_checkbox = document.getElementsByName(checkboxName);
    if (!id_checkbox) {
        return 0;
    }

    var selectedCount = 0;
    var len = id_checkbox.length;
    for (var i = 0; i < len; i++) {
        if (id_checkbox[i].checked) {
            selectedCount++;
        }
    }

    return selectedCount;
}

/**
 * 取checkbox的第一个选择值
 */
function getCheckboxSingleValue(checkboxName) {
    var o = getCheckboxSingleObject(checkboxName);

    return o == null ? null : o.value;
}

/**
 * 对标题默认值的切换
 * @param isShowBlack 去掉为默认值，显示空白，用在onFocus
 */
function checkDefSubject(obj, isShowBlack) {
    var dv = getDefaultValue(obj);
    if (isShowBlack && obj.value == dv) {
        obj.value = "";
    } else if (!obj.value) {
        obj.value = dv;
    }
}

/**
 * 取checkbox的第一个选择对象
 */
function getCheckboxSingleObject(checkboxName) {
    checkboxName = checkboxName || "id";
    var id_checkbox = document.getElementsByName(checkboxName);
    if (!id_checkbox) {
        return 0;
    }

    var selectedCount = 0;
    var len = id_checkbox.length;
    for (var i = 0; i < len; i++) {
        if (id_checkbox[i].checked) {
            return id_checkbox[i];
        }
    }

    return null;
}

/**
 * 从input中读取属性为defaultValue的值
 */
function getDefaultValue(obj) {
    if (!obj) {
        return null;
    }
    var def = obj.attributes.getNamedItem("defaultValue");
    if (!def) {
        def = obj.attributes.getNamedItem("deaultValue"); //兼容以前错误的写法
    }

    if (def) {
        return def.nodeValue;
    }

    return null;
}

/***********************************************
 * 处理界面的按钮切换
 */
function Panel(id, label, onclick) {
    this.id = id;
    this.label = label;
    this.onclick = onclick || "";
}

Panel.prototype.toString = function () {
    //return "<div id='button" + this.id + "' onClick=\"changeLocation('" + this.id + "');" + this.onclick + "\" class=\"sign-button\">" + this.label + "</div>" +
    //       "<div class=\"sign-button-line\"></div>";
    return "<div id='button-L" + this.id + "' class=\"sign-button-L\"></div><div id='button" + this.id + "' onClick=\"changeLocation('" + this.id + "');" + this.onclick + "\" class=\"sign-button-M\">" + this.label + "</div>" +
        "<div id='button-R" + this.id + "' class=\"sign-button-R\"></div><div class=\"sign-button-line\"></div>";
}

Panel.prototype.toMinString = function () {
    return "<div class=\"sign-min-label\" onclick=\"changeLocation('" + this.id + "');" + this.onclick + "\" title=\"" + this.label + "\">" + this.label + "</div><div class=\"separatorDIV\"></div>"
}

function showPanels(isShowHiddenButton) {
    if (isShowHiddenButton != false) {
        document.write('<div id="hiddenPrecessAreaDiv" onclick="hiddenPrecessArea()" title="' + v3x.getMessage("V3XLang.common_hiddenPrecessArea") + '"></div>');
    }

    for (var i = 0; i < panels.size(); i++) {
        document.write(panels.get(i).toString());
    }
    document.close();
}

function showMinPanels() {
    for (var i = 0; i < panels.size(); i++) {
        document.write(panels.get(i).toMinString());
    }
    document.close();
    setNoOrResize(true);
}

function setNoOrResize(state) {
    try {
        var oNoResize = parent.document.getElementById('detailRightFrame');
        if (oNoResize) {
            oNoResize.noResize = state;
        } else {
            return;
        }
    } catch (e) {
    }
}

function changeLocation(id) {

    for (var i = 0; i < panels.size(); i++) {
        var id_ = panels.get(i).id;
        if (id_ == id) continue;
        document.getElementById('button-L' + id_).className = "sign-button-L";
        document.getElementById('button' + id_).className = "sign-button-M";
        document.getElementById('button-R' + id_).className = "sign-button-R";
        var o = document.getElementById(id_ + "TR");
        if (o) {
            o.style.display = "none";
        }
    }

    var bObj = document.getElementById("button" + id);
    if (bObj) {
        document.getElementById('button-L' + id).className = "sign-button-L-sel";
        bObj.className = "sign-button-M-sel";
        document.getElementById('button-R' + id).className = "sign-button-R-sel";
    }

    var trObj = document.getElementById(id + "TR");
    if (trObj) {
        trObj.style.display = "";
    }
    setNoOrResize(false);
}

/**
 * 将字符串转换成HTML代码
 */
function escapeStringToHTML(str, isEscapeSpace, isEscapeBr) {
    if (!str) {
        return "";
    }
    str = str + "";
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/\r/g, "");
    if (typeof (isEscapeBr) == 'undefined' || (isEscapeBr == true || isEscapeBr == "true")) {
        str = str.replace(/\n/g, "<br/>");
    }
    str = str.replace(/\'/g, "&#039;");
    str = str.replace(/"/g, "&#034;");

    if (typeof (isEscapeSpace) != 'undefined' && (isEscapeSpace == true || isEscapeSpace == "true")) {
        str = str.replace(/ /g, "&nbsp;");
    }

    return str;
}

/**
 * 将字符串转换成HTML代码  \n不转，用于title
 */
function escapeStringToHTMLWithoutBr(str, isEscapeSpace) {
    if (!str) {
        return "";
    }

    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/\r/g, "");
    str = str.replace(/\'/g, "&#039;");
    str = str.replace(/"/g, "&#034;");

    if (typeof (isEscapeSpace) != 'undefined' && (isEscapeSpace == true || isEscapeSpace == "true")) {
        str = str.replace(/ /g, "&nbsp;");
    }

    return str;
}

function escapeStringToJavascript(str) {
    if (!str) {
        return str;
    }
    str = str + "";
    str = str.replace(/\\/g, "\\\\");
    str = str.replace(/\r/g, "");
    str = str.replace(/\n/g, "");
    str = str.replace(/\'/g, "\\\'");
    str = str.replace(/"/g, "\\\"");

    return str;
}

/**
 * 获取QueryString参数
 */
function getParameter(name1) {
    var queryString = document.location.search;

    if (queryString) {
        queryString = queryString.substring(1);

        var params = queryString.split("&");

        for (var i = 0; i < params.length; i++) {
            var items = params[i].split("=");

            if (name1 == items[0]) {
                return items[1];
            }
        }
    }
}

/**
 * 给选择列表设置选择项
 * @param selectId 选择列表的Id
 * @param value 选择的值
 */
function setSelectValue(selectId, value) {
    var object = document.getElementById(selectId);
    if (!object) {
        return;
    }

    var os = object.options;
    if (!os) {
        return;
    }

    for (var i = 0; i < os.length; i++) {
        var o = os[i];
        if (o.value == value) {
            o.selected = true;
            break;
        }
    }
}

var sxUpConstants = {
    status_0: "0,*",
    status_1: "35%,*"
}
var sxDownConstants = {
    status_0: "*,9",
    status_1: "35%,*"
}
var sxMiddleConstants = {
    status_0: "35%,*",
    status_1: "35%,*"
}
var indexFlag = 0;

function previewFrame(direction) {
    if (!direction) return;
    var obj = parent.parent.document.getElementById('sx');
    if (obj == null) {
        obj = parent.document.getElementById('sx');
        ;
    }

    if (obj == null) {
        return;
    }

    if (indexFlag > 1) {
        indexFlag = 0;
    }

    var status = eval("sx" + direction + "Constants.status_" + indexFlag);
    obj.rows = status;

    if (direction != "Middle") {
        indexFlag++;
    }
}

function checkImageSize(img) {
    if (img.width > 540) {
        img.width = 540;
    }
}

/**
 * 得到上下框架的中间横条
 * @param isShowButton 是否显示中间的按钮
 */
function getDetailPageBreak(isShowButton, direction) {
    var showButtonFlag = true;
    if (isShowButton != true && (getA8Top().window.dialogArguments || window.opener)) {
        showButtonFlag = false;
    }
    var contentP = "";
    try {
        contentP = v3x == null ? "" : v3x.baseURL + "/common/";
    } catch (e) {
    }

    document.write("<table id='pagebreakspare' border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"  height=\"10\" align=\"center\">");
    document.write("<tr align=\"center\">");
    document.write("<td style='height:10px; overflow:hidden;' class=\"detail-top\">");
    if (showButtonFlag) {
        //document.write("<img src=\"" + contentP + "images/button.preview.up.gif\" border='0' height=\"10\" onclick=\"previewFrame('Up')\" class=\"cursor-hand\">");
        //document.write("<img src=\"" + contentP + "images/button.preview.down.gif\" border='0' height=\"10\" onclick=\"previewFrame('Down')\" class=\"cursor-hand\">");

        document.write("<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\"  height=\"10\">");
        document.write("<tr>");
        document.write("<td>");
        document.write("<div class='break-up' onclick=\"previewFrame('Up')\"></div>");
        document.write("</td>");
        document.write("<td>");
        document.write("<div class='break-down' onclick=\"previewFrame('Down')\"></div>");
        document.write("</td>");
        document.write("</tr>");
        document.write("</table>");

    } else {
        document.write("&nbsp;");
    }
    document.write("</td>");
    document.write("</tr>");
    document.write("</table>");
    document.close();
    if (direction == 'Down') {
        previewFrame('Down');
    } else {
        previewFrame('Middle');
    }

}

function getLimitLength(text, maxlengh, symbol) {
    return text.getLimitLength(maxlengh, symbol);
}

function changeMenuTab(clickDiv) {
    var menuDiv = document.getElementById("menuTabDiv");
    var clickDivStyle = clickDiv.className;
    if (clickDivStyle == "tab-tag-middel-sel") {
        return;
    }
    var divs = menuDiv.getElementsByTagName("div");
    var i;
    for (i = 0; i < divs.length; i++) {
        clickDivStyle = divs[i].className;
        if (clickDivStyle.substr(clickDivStyle.length - 4) == "-sel") {
            divs[i].className = clickDivStyle.substr(0, clickDivStyle.length - 4);
        }
    }
    for (i = 0; i < divs.length; i++) {
        if (clickDiv == divs[i]) {
            divs[i - 1].className = divs[i - 1].className + "-sel";
            divs[i].className = divs[i].className + "-sel";
            divs[i + 1].className = divs[i + 1].className + "-sel";
        }
    }
    var detailIframe = document.getElementById('detailIframe').contentWindow;
    detailIframe.location.href = clickDiv.getAttribute('url');
}

function setDefaultTab(pos) {
    var menuDiv = document.getElementById("menuTabDiv");
    var divs = menuDiv.getElementsByTagName("div");
    divs[pos * 4].className = divs[pos * 4].className + "-sel";
    divs[pos * 4 + 1].className = divs[pos * 4 + 1].className + "-sel";
    divs[pos * 4 + 2].className = divs[pos * 4 + 2].className + "-sel";
    var detailIframe = document.getElementById('detailIframe').contentWindow;
    detailIframe.location.href = divs[pos * 4 + 1].getAttribute('url');
}

function getRadioValue(radioName) {
    var radios = document.getElementsByName(radioName);
    if (!radios) {
        return null;
    }

    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }

    return null;
}

var sx_variable = {
    detailFrameName: "",
    title: "",
    imgSrc: "",
    count: 0,
    description: "",

    isShow: false
}

/**
 * 上下结构的页面，显示下面的图片、总数、描述
 *
 * @param detailFrameName 下面页面的frame的名称
 * @param title 显示的标题 要国际化哦
 * @param imgSrc 显示的图标名称，统一放在/common/images/detailBannner下，比如：/common/images/detailBannner/101.gif
 * @param count 显示的总数，如果为null或者为负数，表示不显示总数
 * @param description 显示的描述
 */
function showDetailPageBaseInfo(detailFrameName, title, imgSrc, count, description) {
    parent.sx_variable.detailFrameName = detailFrameName;
    parent.sx_variable.title = title;
    parent.sx_variable.imgSrc = imgSrc;
    parent.sx_variable.count = count;
    parent.sx_variable.description = description;

    parent.doDetailPageBaseInfo();
}

function doDetailPageBaseInfo() {
    if (!sx_variable.detailFrameName) {
        return;
    }

    var detailDocument = null;
    try {
        detailDocument = document.getElementById(sx_variable.detailFrameName).contentWindow;
    } catch (e) {
    }

    if (detailDocument && detailDocument.document.readyState == "complete") { //下面的页面已经加载完了
        var flag = eval("detailDocument.detailPageBaseInfoFlag");
        if (!flag) {
            detailDocument.location.href = v3x.baseURL + "/common/detail.jsp";
            window.setTimeout("doDetailPageBaseInfo()", 500);
            return;
        }

        detailDocument.document.getElementById("titlePlace").innerHTML = sx_variable.title;

        if (sx_variable.count != null && sx_variable.count >= 0) {
            detailDocument.document.getElementById("countPlace").innerHTML = v3x.getMessage("V3XLang.common_detailPage_count_label", "<span class='countNumber'>" + sx_variable.count + "</span>");
        }

        detailDocument.document.getElementById("descriptionPlace").innerHTML = sx_variable.description || "";

        detailDocument.document.getElementById("allDiv").style.display = "";
    } else {
        window.setTimeout("doDetailPageBaseInfo()", 500);
    }
}

/*************************************** 归档 ******************************************************
 * appName:应用 枚举key;
 * ids:要归档的源数据id串，以逗号分割          如 12345,98754
 * atts：逗号分割的是否有附件标记串，和ids顺序一致，默认false     如  true,false
 * validAcl: 是否验证写入权限（一般管理员调用进行预归档），true或false，默认true（验证）
 * type: 归档类型。暂时公文使用，用来区别是部门归档，还是公文归档，还是模板预归档
 */
var newIdes;
var pigeonholeItem = {};

function pigeonhole(appName, ids, atts, validAcl, type, collBackFuns) {
    pigeonholeItem.collBackFuns = collBackFuns;
    newIdes = ids;
    if (typeof (type) == 'undefined') type = "";//没有传递这个参数的时候设置为空，否则向后台传递的参数为undefined
    if (typeof (collBackFuns) != 'undefined') {
        // fix: BUG2022091612449
        getA8Top().transParams = {
            parentWin: window
        };
        getA8Top().pigeonholeWin = getA8Top().$.dialog({
            title: getA8Top().$.i18n("doc.tree.move.title"),
            transParams: {'parentWin': window},
            closeParam: {
                'show': true, handler: function () {
                    pigeonholeChromeCollBack("cancel");
                }
            },
            url: v3x.baseURL + "/doc.do?method=docPigeonhole&appName=" + appName + "&atts=" + atts + "&validAcl=" + validAcl + "&pigeonholeType=" + type + CsrfGuard.getUrlSurffix(),
            width: 500,
            height: 500,
            isDrag: true
        });
    } else {
        var returnval = v3x.openWindow({
            url: v3x.baseURL + "/doc.do?method=docPigeonhole&appName=" + appName + "&atts=" + atts + "&validAcl=" + validAcl + "&pigeonholeType=" + type + CsrfGuard.getUrlSurffix(),
            width: "500",
            height: "500",
            resizable: "true",
            scrollbars: "true"
        });
        if (returnval == undefined)
            returnval = "cancel";
        return returnval;
    }
}

function pigeonholeChromeCollBack(returnValue) {
    //关闭归档窗口后显示被隐藏的office控件
    var officeFrameDiv = $("#officeFrameDiv");
    if (officeFrameDiv.length > 0) {
        officeFrameDiv.css("visibility", "visible");
    }
    getA8Top().pigeonholeWin.close();
    var func = new Function(pigeonholeItem.collBackFuns + "('" + returnValue + "');");
    func();
}

function projectPigeonhole(appName, ids, projectId, atts) {
    var returnval = v3x.openWindow({
        url: _ctxPath + "/doc.do?method=docTreeProjectIframe&appName=" + appName + "&ids=" + ids + "&projectId=" + projectId + "&atts=" + atts,
        width: "500",
        height: "500",
        resizable: "true",
        scrollbars: "true"
    });

    if (returnval == undefined)
        returnval = "cancel";

    return returnval;
}

/**
 * 新建，修改取消按钮返回公用函数
 * 参数可以为空，返回说明页面
 * cancelOk({'page':'edit','hidden':['hideObj'],'enable':['itemName','commonOperation']})
 * page:是新建还是修改,不能为空,取值'new','edit'
 * hidden:隐藏的控件id数组.如果page为new(新建),hidden和enable无作用
 * enable:可用的控件id数组.如果page为new(新建),hidden和enable无作用
 * macj--09-05-07
 * */
function cancelOk() {
    try {
        var json = arguments[0];//传入的json格式参数
        if (json != null) {//不为空
            if (json.page != null && json.page == 'new') {
                window.location.href = v3x.baseURL + "/common/detail.jsp";
            } else if (json.page != null && json.page == 'edit') {
                var oForms = document.forms;//页面form
                for (var i = 0; i < oForms.length; i++) {//循环form
                    for (var j = 0; j < oForms[i].length; j++) {//循环form元素
                        if (json.enable != null) {//是否有可用id,有循环，跳出
                            for (var t = 0; t < json.enable.length; t++) {
                                if (oForms[i][j].id == json.enable[t]) {
                                    break;
                                } else {
                                    oForms[i][j].disabled = true;//其他不可用
                                }
                            }
                        } else {
                            oForms[i][j].disabled = true;
                        }
                    }
                }
                if (json.hidden != null) {//隐藏id
                    for (var g = 0; g < json.hidden.length; g++) {
                        document.getElementById(json.hidden[g]).style.display = "none";
                    }
                }
            } else {
                window.close();
            }
        } else {//json为空跳转到说明页面
            window.location.href = v3x.baseURL + "/common/detail.jsp";
        }
    } catch (e) {

    }
}

function canShowPeopleCard(memberId) {
    var canShowPeopleCard = false;
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxOrgManager", "canShowPeopleCard", false);
    requestCaller.addParameter(1, "Long", null);
    requestCaller.addParameter(2, "Long", memberId);
    var rs = requestCaller.serviceRequest();
    if (rs == true || rs == "true") {
        canShowPeopleCard = true;
    }
    return canShowPeopleCard;
}

/**
 * 显示人员信息
 */
function showV3XMemberCard(memberId, targetWindowParam) {
    if (!canShowPeopleCard(memberId)) {
        return;
    }
    //新的大卡片
    newPeopleCardDialog = getA8Top().$.dialog({
        id: 'newPeopleCardDialog',
        transParams: {'parentWin': window},
        title: ' ',
        isHead: false,
        url: getBaseURL() + "/organization/peopleCard.do?method=showPeoPleCard&type=withbutton&memberId=" + memberId + CsrfGuard.getUrlSurffix(),
        width: 455,
        height: 530,
        top: 50,
        closeParam: {'show': false}
    });


}

/**
 * 显示人员信息
 */
function showV3XMemberCardWithOutButton(memberId, targetWindowParam) {
    if (!canShowPeopleCard(memberId)) {
        return;
    }

    if (getA8Top().isCtpTop) {
        getA8Top().newPeopleCardWithoutButtonDialog = getA8Top().$.dialog({
            id: 'newPeopleCardWithoutButtonDialog',
            transParams: {'parentWin': window},
            title: ' ',
            isHead: false,
            url: getBaseURL() + "/organization/peopleCard.do?method=showPeoPleCard&type=withoutbutton&memberId=" + memberId + CsrfGuard.getUrlSurffix(),
            width: 455,
            height: 465,
            top: 50,
            closeParam: {'show': false}
        });
    } else {
        getA8Top().newPeopleCardWithoutButtonDialog = v3x.openDialog({
            id: 'newPeopleCardWithoutButtonDialog',
            title: " ",
            isHead: false,
            transParams: {'parentWin': window},
            targetWindow: targetWindowParam == undefined ? getA8Top() : targetWindowParam,
            url: getBaseURL() + "/organization/peopleCard.do?method=showPeoPleCard&type=withoutbutton&memberId=" + memberId + CsrfGuard.getUrlSurffix(),
            width: 455,
            height: 515,
            // top:50, //不传入top值和left值，让生产dialog的时候自动计算
            // left:500,
            closeParam: {'show': false}
        });
    }

}

/**
 *ajax判断某用户是否有待发送和待签收的事项 true(有待办事项) false (无待办事项)
 *userId :要删除的公文收发员的ID
 *username : a.收发员名字  b.当username为空的时候表示没有指定的用户名，删除全部，用新的提示语
 */
function ajaxCheckAccountExchangePendingAffair(userId, userName) {
    try {
        var requestCaller = new XMLHttpRequestCaller(this, "ajaxEdocExchangeManager", "checkEdocExchangeHasPendingAffair", false);
        requestCaller.addParameter(1, "Long", userId);
        var rs = requestCaller.serviceRequest();
        if (rs != "0") {

            if (userName != '') {
                //{0}尚有待发送或待签收公文未处理，请先处理.
                alert(v3x.getMessage("MainLang.edoc_alert_hasExchangePendingAffair", userName));
            } else {
                //有待发送或待签收公文未处理，不能取消所有的公文收发员，请先处理.
                alert(v3x.getMessage("MainLang.edoc_alert_notdelteAllExchanger"));
            }
            return true;
        }
        return false;
    } catch (ex1) {
        alert("Exception : " + ex1);
        return false;
    }
}

// 判断当前窗口是否是从精灵打开
function isOpenFromGenius() {
    var fromGenius = false;
    try {
        fromGenius = getA8Top().location.href.indexOf('a8genius.do') > -1;
    } catch (e) {
        alert(e);
    }
    return fromGenius;
}

//ipad窗口高度过高
if (navigator.userAgent.indexOf('iPad') != -1) {
    window.addEventListener('load', function () {
        getA8Top().document.body.style.height = "690px";
    });
}

//设置ff下grid没有滚动条
function setFFGrid(htmlID, dragable) {
    //ipad隐藏上下结构下部
    if (htmlID == '' || dragable == false) {
        return;
    }
    if (document.all) {
        window.attachEvent('onload', function () {
            mxtgrid(htmlID);
        });
        window.attachEvent("onresize", function () {
            resizeGrid(htmlID, dragable);
        });
    } else {
        mxtgrid(htmlID);
        window.addEventListener("resize", function () {
            resizeGrid(htmlID, dragable);
        }, false);
    }
}


//ipad滚动条问题
function initIpadScroll(id, height, width) {
    if (v3x.isIpad) {
        var oHtml = document.getElementById(id);
        if (oHtml) {
            if (height) {
                oHtml.style.height = height + "px";
            }
            if (width) {
                oHtml.style.width = width + "px";
            }
            oHtml.style.overflow = "auto";
            touchScroll(id);
        }
    }
}

function initIe10AutoScroll(id, sub) {
    var mainObj = window.top.document.getElementById("main");
    var oHeight = mainObj != null ? mainObj.offsetHeight - sub : parseInt(window.top.document.body.offsetHeight) - sub;
    if (oHeight < 0) {
        return;
    }
    initIe10Scroll(id, oHeight);

}

//ie10滚动条问题
function initIe10Scroll(id, height, width) {
    // if (v3x.isMSIE10) {
    var oHtml = document.getElementById(id);
    if (oHtml) {
        if (height) {
            oHtml.style.height = height + "px";
        }
        if (width) {
            oHtml.style.width = width + "px";
        }
    }
    // }
}

//ff滚动条问题
function initFFScroll(id, height, width) {
    if (v3x.isFirefox) {
        var oHtml = document.getElementById(id);
        if (oHtml) {
            if (height) {
                oHtml.style.height = height + "px";
            }
            if (width) {
                oHtml.style.width = width + "px";
            }
            oHtml.style.overflow = "auto";
        }
    }
}

//safaria滚动条问题
function initSafariScroll(id, height, width) {
    if (v3x.isSafari) {
        var oHtml = document.getElementById(id);
        if (oHtml) {
            if (height) {
                oHtml.style.height = height + "px";
            }
            if (width) {
                oHtml.style.width = width + "px";
            }
            oHtml.style.overflow = "auto";
        }
    }
}

//chrome滚动条问题
function initChromeScroll(id, height, width) {
    if (v3x.isChrome) {
        var oHtml = document.getElementById(id);
        if (oHtml) {
            if (height) {
                oHtml.style.height = height + "px";
            }
            if (width) {
                oHtml.style.width = width + "px";
            }
            oHtml.style.overflow = "auto";
        }
    }
}

/**
 * 是否为数字，不能以.结尾
 */
function isDecimal(value, inputName, integerDigits, decimalDigits) {
    if (!testRegExp(value, "^-?[0-9]{0," + (integerDigits ? integerDigits : "") + "}\\.?[0-9]{1," + (decimalDigits ? decimalDigits : "") + "}$")) {
        if (inputName)
            alert($.i18n("formValidate_isNumber", inputName));
        return false;
    }

    return true;
}


/**
 * 发送短信窗口
 */
function sendSMSV3X(receiverIds) {
    var linkURL = getBaseURL() + "/message.do?method=showSendSMSDlg";
    if (receiverIds) {
        linkURL += "&receiverIds=" + receiverIds;
    }
    if (getA8Top().isCtpTop) {
        getA8Top().senSmsWin = getA8Top().$.dialog({
            title: $.i18n('common.send.sms.label'),
            transParams: {'parentWin': window},
            url: linkURL,
            width: 420,
            height: 280,
            isDrag: false
        });
    } else {
        getA8Top().senSmsWin = v3x.openDialog({
            title: $.i18n('common.send.sms.label'),
            transParams: {'parentWin': window},
            url: linkURL,
            width: 420,
            height: 280,
            isDrag: false
        });
    }
}

function sendSmsCollBack(sendResult) {
    getA8Top().senSmsWin.close();
    if (!sendResult) {
        return;
    }
    alert(sendResult);
}

/**
 * 其它模块转发协同操作：公用接口
 */
function forwardColV3X(summaryId, affairId, forwardType) {
    var rv = v3x.openWindow({
        url: _ctxPath + "/collaboration.do?method=showForward&showType=model&data=" + summaryId + "_" + affairId,
        width: 511,
        height: 400
    });

    if (forwardType == "self") {//后边按钮直接转发协同
        if (rv == "true") {
            document.location.reload(true);
        }
    } else if (forwardType == "list") {//列表下菜单中转发协同
        if (rv && rv == "true" && (getParameter("method") == "listSent")) {
            document.location.reload(true);
        }
    }
}

// CTP Adapter
function showCtpLocation(code, options) {
    var ctpTop = typeof getCtpTop === "function" ? getCtpTop() : (typeof getA8Top === "function" ? getA8Top() : parent);
    if (!ctpTop) return;
    if (options && options.html) {
        if (ctpTop.showLocation) {
            var icon = "vp-personal";
            var html = '<i class="vportal ' + icon + '"></i>';
            options.html = html + options.html;
            top.showLocation(options.html);
        }
        return;
    }
    // 改造前：多个文件都在定义showBreadcrumb，改造后：统一调用顶层门户的，这里只保留入口
    options = typeof options === "object" ? options : {};
    options.code = code;
    try {
        ctpTop.breadcrumbHander && (typeof ctpTop.breadcrumbHander.showBreadcrumb === "function") && ctpTop.breadcrumbHander.showBreadcrumb(options);
    } catch (e) {
        /** 避免跨域等情况，没啥用 **/
    }
}

/**
 * 清除当前位置。
 */
function resetCtpLocation() {
    var top = getA8Top();
    if (top) {
        top.showLocation('');
    }
}

// 打开正文编辑器插入的关联
function openEditorAssociate(id, mimeType, description, reference, category, createDate, filename, v) {
    function getContextPath() {
        if (v3x) {
            return v3x.baseURL ? v3x.baseURL : parent._ctxPath;
        }
        return getBaseURL();
    }

    var url;
    var isDownload = false;
    var moduleId = document.getElementById('moduleId');
    if (moduleId != null) {
        reference = moduleId.value;
    } else if (typeof (summary_id) !== undefined && (typeof (summary_id) !== 'undefined')) {
        reference = summary_id;
    }
    if (typeof (_baseObjectId) !== undefined && (typeof (_baseObjectId) !== 'undefined')) {
        reference = _baseObjectId;
    }
    var moduleType = document.getElementById('moduleType');
    if (moduleType != null) {
        category = moduleType.value;
    } else if (typeof (_baseApp) !== undefined && (typeof (_baseApp) !== 'undefined')) {
        category = _baseApp;
    }
    if (mimeType == "collaboration") {
        url = "collaboration/collaboration.do?method=summary&openFrom=glwd&type=&affairId=" + description + "&baseObjectId=" + reference + "&baseApp=" + category;
    } else if (mimeType == "edoc") {
        url = "edocController.do?method=detailIFrame&from=Done&openFrom=glwd&affairId=" + description + "&isQuote=true&baseObjectId=" + reference + "&baseApp=4";//+ category;
    } else if (mimeType == "km") {
        url = "doc.do?method=docOpenIframeOnlyId&openFrom=glwd&docResId=" + description + "&baseObjectId=" + reference + "&baseApp=" + category;
    } else if (mimeType == "meeting") {
        url = "meeting.do?method=view&meetingId=" + description + "&isQuote=true&baseObjectId=" + reference + "&baseApp=" + category + "&state=10";
    } else {
        isDownload = true;
        url = 'fileUpload.do?method=download&fileId=' + id + '&createDate=' + createDate.substring(0, 10) + '&filename=' + encodeURI(filename) + '&v=' + v;
    }
    url = url + '&fromEditor=1';
    url = getContextPath() + '/' + url;
    if (isDownload) {
        var downloadFileFrame = document.getElementById('downloadFileFrame');
        if (downloadFileFrame) {
            downloadFileFrame.src = url;
        } else {
            window.open(url, '_blank');
        }
    } else {
        openDetailURL(url);
    }
}

function closeAllDialog(tw) {
    var targetWindow = window;
    if (tw) {
        targetWindow = tw;
    }
    targetWindow.$('.mask').remove();
    targetWindow.$('.dialog_box').remove();
    targetWindow.$('.shield').remove();
    targetWindow.$('.mxt-window').remove();
}

/**
 * 客户端安装的是永中Office软件
 */
function isYoZoOffice() {
    var isEIO = false;
    try {
        var ocxObj = "";
        if (navigator.cpuClass.indexOf("x86") != -1) {
            ocxObj = new ActiveXObject("Kinggrid.iWebOffice");
        } else {
            ocxObj = new ActiveXObject("Kinggrid.iWebOffice_x64");
        }
        isEIO = ocxObj.WebApplication(".eio");
    } catch (e) {

    }
    return isEIO;
}

/**
 * 清除所有office标志
 */
function clearOfficeFlag() {
    try {
        var _tpWin = getA8Top();
        _tpWin.isOffice = false;
        _tpWin.officeObj = null;
    } catch (e) {
    }
}

/**
 * 判断对象是否还有访问权限
 * @param obj dom对象
 * @returns {boolean}
 */
function officeFlagExist(obj) {
    try {
        if (obj.id) {
            return true;
        }
    } catch (e) {
    }
    return false;
}

/**
 * 设置office标志，用于隐藏/显示控件
 * @param flag 是否为office控件
 * @param offObj 控件对象
 */
function setOfficeFlag(flag, offObj) {
    try {
        var ua = navigator.userAgent;
        var isMSIE = (navigator.appName == "Microsoft Internet Explorer") || ua.indexOf('Trident') != -1;
        if (isMSIE) { //ie 下 当有弹出窗时，针对office正文进行隐藏
            var _tpWin = getA8Top();
            _tpWin.isOffice = flag;
            if (_tpWin.officeObj && typeof _tpWin.officeObj == 'object' && '[object Array]' == Object.prototype.toString.call(_tpWin.officeObj)) {
                // ie9 下兼容“不能执行已释放的Script代码”
                var tmp = [];
                for (var f = 0; f < _tpWin.officeObj.length; f++) {
                    tmp.push(_tpWin.officeObj[f]);
                }
                tmp.push(offObj);
                _tpWin.officeObj = tmp;
            } else {
                _tpWin.officeObj = [];
                _tpWin.officeObj.push(offObj);
            }
            return;
        }
        var _tpWin = getA8Top();
        _tpWin.isOffice = flag;
        if (_tpWin.officeObj && typeof _tpWin.officeObj == 'object' && '[object Array]' == Object.prototype.toString.call(_tpWin.officeObj)) {
            _tpWin.officeObj.push(offObj);
        } else {
            _tpWin.officeObj = [];
            _tpWin.officeObj.push(offObj);
        }
    } catch (e) {
    }
}


/**
 隐藏文单上的手写签批
 * OA-231419 文单签批的印章，切换页签查看后消失
 */
function hideIwebRevisionObj() {
    var ua = navigator.userAgent;
    var isMSIE = (navigator.appName == "Microsoft Internet Explorer") || ua.indexOf('Trident') != -1;
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    // if(isMSIE)return;
    var _tpWin = getA8Top();
    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && !isLinux) {
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp && _temp.id && _temp.id.match(new RegExp("hwfield", "i"))) {
                    if (isMSIE) {
                        if (_temp.id == "WebPDF") {
                            _temp.iWebPDFFun.Hide = 0;
                        } else {
                            _temp.Hide(0);
                        }
                    } else {
                        _temp.HidePlugin(0);
                    }
                }
            } catch (e) {
                if (isMSIE && _temp && _temp.id && _temp.id.match(new RegExp("hwfield", "i"))) {
                    _temp.style.display = "none";
                }
            }
        }
    }
}

/**
 显示文单上的手写签批
 * OA-231419 文单签批的印章，切换页签查看后消失
 */
function showIwebRevisionObj(dialogFlag) {
    var isChrome = navigator.userAgent.toLowerCase().match(/chrome/) != null;
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    var _tpWin = getCtpTop();
    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && !isLinux) {
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp && _temp.id && _temp.id.match(new RegExp("hwfield", "i"))) {
                    if (isChrome) {
                        _temp.HidePlugin(1);
                        _temp.FuncExtModule.ShowToolBar = "1";
                    } else {
                        if (_temp.id == "WebPDF") {
                            _temp.iWebPDFFun.Hide = 1;
                        } else {
                            _temp.Hide(1);
                        }
                    }
                }
            } catch (e) {
                if (!isChrome) {
                    if (_temp && _temp.style && typeof (_temp.style.display) != "undefined") {
                        _temp.style.display = "";
                    }
                }
            }
        }
    }
}


function hideOfficeObj() {
    var ua = navigator.userAgent;
    var isMSIE = (navigator.appName == "Microsoft Internet Explorer") || ua.indexOf('Trident') != -1;
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    // if(isMSIE)return;
    var _tpWin = getA8Top();

    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && !isLinux) {
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp && _temp.style && !_tpWin.spreadControlState || (_tpWin.spreadControlState && _temp.id.match(new RegExp(_tpWin.spreadControlState, "i")))
                    //文单签章特殊判断方式
                    || _temp.id.match(new RegExp("hwfield", "i"))
                ) {
                    if (isMSIE) {
                        if (_temp.id == "WebPDF") {
                            _temp.iWebPDFFun.Hide = 0;
                        } else {
                            _temp.Hide(0);
                        }
                    } else {
                        _temp.HidePlugin(0);
                    }
                }
            } catch (e) {
                if (_temp && _temp.style && typeof (_temp.style.display) != "undefined") {
                    if (_temp.id.substring(0, 3) !== "ofd" && _temp.id != 'WebOffice') {
                        _temp.style.display = "none";//V5-5744:致信发起ofd正文类型的协同，编辑流程时，界面样式不对
                    } else {
                        _temp.style.width = "1px";
                        _temp.style.height = "1px";
                    }
                }
            }
        }
    }
    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && isLinux) {  //中标麒麟
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp) {
                    _temp.style.width = "1px";
                    _temp.style.height = "1px";
                }
            } catch (e) {
            }
        }
    }
    //V5-5744:致信发起ofd正文类型的协同，编辑流程时，界面样式不对
    if (_tpWin.hideSpreadFunc) {
        _tpWin.hideSpreadFunc && _tpWin.hideSpreadFunc();
    } else {
        _tpWin.document.mainIframe && _tpWin.document.mainIframe.hideSpreadFunc && _tpWin.document.mainIframe.hideSpreadFunc();
    }
}

/**
 * 自定义 显示或者隐藏offfice控件
 */
var OfficeObjExt = {
    iframeId: null,
    /**
     * 提供对弹出窗中的office正文 页面中，再次弹出窗 显示office正文的接口，提供外部重写
     */
    showDialogOffice: function () {
    },
    /**
     * 提供使用office控件的jsp页面中脚本调用,目的是将office所在的iframe的id引入，如果jsp中没有重写OfficeObjExt.showExt函数，将
     * 按照默认方法执行显示或者隐藏office控件,必须调用
     */
    setIframeId: function (id) {
        OfficeObjExt.iframeId = id;
    },
    firstHeight: null,
    showExt: function () {
        //debugger;
        //var iframe = document.getElementById("zwIframe");
        if (OfficeObjExt.iframeId == null) {
            return;
        }
        //alert(OfficeObjExt.iframeId);
        var iframe = document.getElementById(OfficeObjExt.iframeId);

        var h;
        if (OfficeObjExt.firstHeight == null) {
            h = iframe.style.height;
            OfficeObjExt.firstHeight = h;
        } else {
            h = OfficeObjExt.firstHeight;
        }
        h = h + "";
        //alert(h);
        var height = h;
        if (h.indexOf("%") > 0) {
            height = h.substring(0, h.length - 1);
            iframe.style.height = height + "%";
        } else if (h.indexOf("px") > 0) {
            height = h.substring(0, h.length - 2);
            iframe.style.height = height + "px";
        } else {

            h = $(iframe).height();
            OfficeObjExt.firstHeight = h + "px";
            iframe.style.height = h + "px";
        }
        window.setTimeout(function () {
            iframe.style.height = h;
        }, 2);
    },
    /**
     * 公共显示 OfficeObject的方法
     firstAttr: 指定能唯一对应Office Object 的key值，该值在第一次渲染时会进行高度获取，并缓存高度，第二次渲染回填原值
     iframe: 可以指定Office Object的对象，也可以指定为Office Object的上层Iframe对象
     callback
     */
    showIfame: function (cfg) {
        var firstAttr, iframe, callback;
        firstAttr = cfg.firstAttr;
        iframe = cfg.iframe;
        callback = cfg.callback || function () {
        };
        var h;
        if (OfficeObjExt[firstAttr] == null) {
            //v5-955:鲲鹏uos 金格控件v132 新建协同 上传附件后会把正文遮挡
            window.setTimeout(function () {
                h = iframe.style.height;
                OfficeObjExt[firstAttr] = h;
            }, 20)
        } else {
            h = OfficeObjExt[firstAttr];
        }
        h = h + "";
        //alert(h);
        var height = h;
        if (h.indexOf("%") > 0) {
            height = h.substring(0, h.length - 1);
            iframe.style.height = height + "%";
        } else if (h.indexOf("px") > 0) {
            height = h.substring(0, h.length - 2);
            iframe.style.height = height + "px";
        } else {
            h = $(iframe).height();
            OfficeObjExt[firstAttr] = h + "px";
            iframe.style.height = h + "px";
        }
        window.setTimeout(function () {
            //iframe.style.height = h;
            window.setTimeout(cfg.callback, 1);
        }, 2);
    }
};

/**
 *内部请使用jQuery，不要使用$,且需要保持3个文件（front_common、v3x、v3x-debug）内的同名方法一致
 **/
function showOfficeObj(dialogFlag) {
    try {
        //OA-230328 office：uos鲲鹏+wps，打开公文待办，切换到全文签批单，再切换到流程页面，流程页面仍显示的是全文签批单
        if ($('#workflow_view_li').hasClass('current') && $("#iframeright").size() > 0) {
            $("#iframeright").removeAttr('style').css('display', 'inline');
        }
        var dataRelation = document.getElementById("guanlian_info_div");
        if (dataRelation && dataRelation.getAttribute("dataRelation") == "true") {
            return;
        }
        if ($("#signFile_view_li").hasClass("selectStyle")) {
            return;
        }
    } catch (e) {
    }
    var isChrome = navigator.userAgent.toLowerCase().match(/chrome/) != null;
    var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
    var _tpWin = getCtpTop();
    var isLayuiLayerDialog = _tpWin.jQuery(".layui-layer").length > 0;
    var newgovdocCallTemplate = typeof (_tpWin.currentPageName) != "undefined" && _tpWin.currentPageName == "newGov" && typeof (_tpWin.hasShowCallTemplate) != "undefined" && _tpWin.hasShowCallTemplate == true;
    if (newgovdocCallTemplate) {
        // 特殊场景：公文新建调用模板的时候隐藏后需要显示控件
        isLayuiLayerDialog = false;
    }
    //判断是否存在窗口 如果窗口存在则不能显示office
    if ((_tpWin.jQuery(".layui-layer").length > 0 || _tpWin.jQuery(".dialog_main").length > 0 || _tpWin.jQuery(".selectorg").length > 0) && dialogFlag != true) {
        return void (0);
    }
    // 兼容金格控件公共组件中show hide方法
    try {
        if ((typeof top.newGovdocView != 'undefined' && top.newGovdocView == '0') && dialogFlag != true) {
            if (_tpWin.showSpreadFunc) {
                _tpWin.showSpreadFunc && _tpWin.showSpreadFunc();
            } else {
                _tpWin.document.mainIframe && _tpWin.document.mainIframe.showSpreadFunc && _tpWin.document.mainIframe.showSpreadFunc();
            }
            return void (0);
        }
    } catch (e) {
        window.console && window.console.log(e);
    }
    try {
        if (_tpWin.jQuery('.shield').size() >= 1) {
            return
        }
    } catch (e) {
    }

    try {
        if ((_tpWin.jQuery('.mask').size() > 0 && _tpWin.jQuery('.mask').css('display') != 'none') || (_tpWin.jQuery('.shield').size() > 0 && _tpWin.jQuery('.shield').css('display') != 'none')) {
            if (typeof OfficeObjExt.showDialogOffice == 'undefined') {
                return;
            }
            OfficeObjExt.showDialogOffice();
            // return;
        }
    } catch (e) {
    }
    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && !isLinux) {
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp && _temp.style && !_tpWin.spreadControlState || (_tpWin.spreadControlState && _temp.id.match(new RegExp(_tpWin.spreadControlState, "i")))
                    //文单签章特殊判断方式
                    || _temp.id.match(new RegExp("hwfield", "i"))
                ) {
                    if (isChrome) {
                        _temp.HidePlugin(1);
                        _temp.FuncExtModule.ShowToolBar = "1";
                    } else {
                        if (_temp.id == "WebPDF") {
                            _temp.iWebPDFFun.Hide = 1;
                        } else {
                            _temp.Hide(1);
                        }
                    }
                }
            } catch (e) {
                if (_temp.id.substring(0, 3) !== "ofd" && _temp.id != 'WebOffice') {
                    if (_temp && _temp.style && typeof (_temp.style.display) != "undefined") {
                        _temp.style.display = "";
                    }
                } else {
                    _temp.style.width = "100%";
                    _temp.style.height = "100%";
                }
            }
        }
    }
    if (_tpWin.isOffice && _tpWin.officeObj && _tpWin.officeObj.length > 0 && isLinux) { //中标麒麟
        for (var i = 0; i < _tpWin.officeObj.length; i++) {
            var _temp = _tpWin.officeObj[i];
            //判断对象是否还存在、有无访问权限
            if (!officeFlagExist(_temp)) {
                _tpWin.officeObj[i] = null;
                continue;
            }
            try {
                if (_temp) {
                    _temp.style.width = "100%";
                    _temp.style.height = "100%";
                }
            } catch (e) {
            }
        }
    }
    //V5-5744:致信发起ofd正文类型的协同，编辑流程时，界面样式不对
    if (_tpWin.showSpreadFunc) {
        _tpWin.showSpreadFunc && _tpWin.showSpreadFunc();
    } else {
        _tpWin.document.mainIframe && _tpWin.document.mainIframe.showSpreadFunc && _tpWin.document.mainIframe.showSpreadFunc();
    }
}

/**
 * 通过iframeId找到指定的iframe节点进行展示，不在走全局进行显示控件
 * 对单个控件进行操作
 * @param {*} iframeNode
 */
function showOfficeObjByIframe(iframeNode) {
    // 判断是否是iframe节点
    var isIframe = function (input) {
        return input !== null && input.tagName === 'IFRAME';
    }
    if (isIframe(iframeNode) && iframeNode.contentWindow) {
        try {
            // 显示金格控件【office】
            if (iframeNode.contentWindow.OfficeAPI && iframeNode.contentWindow.OfficeAPI.options.isLoadOfficeFile) {
                iframeNode.contentWindow.OfficeAPI.showOcx();
            }
            // 显示金格控件【pdf】
            if (iframeNode.contentWindow.PdfAPI && iframeNode.contentWindow.PdfAPI.options.isLoadPdfFile) {
                iframeNode.contentWindow.PdfAPI.showPdfOcx();
            }
        } catch (error) {
        }
    }
}

/**
 * 通过iframeId找到指定的iframe节点进行隐藏，不在走全局进行显示控件
 * 对单个控件进行操作
 * @param {*} iframeNode
 */
function hideOfficeObjByIframe(iframeNode) {
    // 判断是否是iframe节点
    var isIframe = function (input) {
        return input !== null && input.tagName === 'IFRAME';
    }
    if (isIframe(iframeNode) && iframeNode.contentWindow) {
        try {
            // 显示金格控件【office】
            if (iframeNode.contentWindow.OfficeAPI && iframeNode.contentWindow.OfficeAPI.options.isLoadOfficeFile) {
                iframeNode.contentWindow.OfficeAPI.hideOcx();
            }
            // 显示金格控件【pdf】
            if (iframeNode.contentWindow.PdfAPI && iframeNode.contentWindow.PdfAPI.options.isLoadPdfFile) {
                iframeNode.contentWindow.PdfAPI.hidePdfOcx();
            }
        } catch (error) {
        }
    }
}

//掉线处理
var offlineFun = function () {
    alert($.i18n("loginUserState.unknown") + ',原因:检测到用户掉线!');
    var _openerWin = window.opener;
    if (_openerWin !== null && _openerWin !== undefined) {  //通过openCtpWindow或window.open打开的页面，关闭它，并对window.opener作登出操作
        if (typeof (_openerWin.getCtpTop) === "function") {
            var _openerWinCtpTop = _openerWin.getCtpTop();
            if (_openerWinCtpTop && _openerWinCtpTop["removeOnbeforeunload"] != null) {
                _openerWinCtpTop["removeOnbeforeunload"]();
            }
            _openerWin.location.href = encodeURI(_ctxPath + '/main.do?method=logout');
            window.close();
        }
    } else {  //不是通过openCtpWindow或window.open打开的页面，作登出操作
        if (typeof (getCtpTop) === "function") {
            var _ctpTop = getCtpTop();
            if (_ctpTop["removeOnbeforeunload"] != null) {
                _ctpTop["removeOnbeforeunload"]();
            }
            getCtpTop().location.href = encodeURI(_ctxPath + '/main.do?method=logout');
        }
    }
};


/**
 * 获取url后边的参数
 * @returns
 */
function getQueryParams(url) {
    var search = url ? url : location.search;
    var param = {};
    if (search.length > 0) {
        var strs = search.split("?")[1].split("&");
        for (var i = 0; i < strs.length; i++) {
            var con = strs[i].split("=");
            param[con[0]] = decodeURIComponent(con[1]);
        }
    }
    return param;
}

function lockAllScreen() {
    //防护没解锁时，心跳每次判断为离开，每次都添加iframe
    if (typeof (getCtpTop().window.frames["screenLockMask_iframe_shadow"]) != "undefined") {
        return;
    }
    lockScreen();
    if (getCtpTop()._windowsMap != null) {
        var values = getCtpTop()._windowsMap.values();
        for (var i = 0; i < values.size(); i++) {
            var win = values.get(i);
            if (typeof (win.unlockScreen) != 'undefined') {
                win.lockScreen();
            }
            //子窗口，再打开的window也需要锁屏
            if (win._windowsMap != null) {
                var _values = win._windowsMap.values();
                for (var j = 0; j < _values.size(); j++) {
                    var _win = _values.get(j);
                    if (typeof (_win.unlockScreen) != 'undefined') {
                        _win.lockScreen();
                    }
                }
            }
        }
    }

}

function unlockAllScreen() {
    try {
        var _this = window;
        unlockScreen();
        if (getCtpTop()._windowsMap != null) {
            var values = getCtpTop()._windowsMap.values();
            for (var i = 0; i < values.size(); i++) {
                var win = values.get(i);
                if (typeof (win.unlockScreen) != 'undefined') {
                    try {
                        win.unlockScreen();
                    } catch (e) {
                    }
                }
                //子窗口，再打开的window也需要解锁屏幕
                if (win._windowsMap != null) {
                    var _values = win._windowsMap.values();
                    for (var j = 0; j < _values.size(); j++) {
                        var _win = _values.get(j);
                        if (typeof (_win.unlockScreen) != 'undefined') {
                            try {
                                _win.unlockScreen();
                            } catch (e) {
                            }
                        }
                    }
                }
            }
        }
        if (_this != getCtpTop()) {
            getCtpTop().unlockScreen();
        }
        //在子窗口解锁的时候，父级窗口也要解锁
        if (window.opener && typeof (window.opener.unlockScreen) != 'undefined') {
            window.opener.unlockScreen();
        }
    } catch (e) {
    }
}

function lockScreen() {
    var pageWindow = getCtpTop();
    var maxIndex = getMaxZindex() || 8000;
    pageWindow.$("body").append('<iframe class="absolute iframe_shadow" id="screenLockMask_iframe_shadow" style="border: 0px currentColor; border-image: none; top: 0px; width: 100%; height: 100%; z-index:' + maxIndex + ';"></iframe>');
    var id = 'screenLockMask';
    var mask = pageWindow.document.getElementById(id);
    if (mask == null) {
        mask = pageWindow.document.createElement('div');
        mask.id = id;
        $(mask).css({
            'width': '100%',
            'height': '100%',
            'left': '0px',
            'top': '0px',
            'z-index': maxIndex,
            'position': 'fixed',
            'background-color': '#fff',
            'background-image': 'url(' + _ctxPath + '/skin/dist/images/lockScreenBg1.jpg)',
            'background-repeat': 'no-repeat',
            'background-position': 'center bottom'
        });
        pageWindow.document.body.appendChild(mask);

        var id1 = 'promtInfo';
        var div = pageWindow.document.getElementById(id1);
        if (div == null) {
            div = pageWindow.document.createElement("div");
            div.id = id1;
            $(div).css({
                'z-index': maxIndex,
                'top': '50%',
                'left': '50%',
                'width': '990px',
                'height': '500px',
                'margin-top': '-250px',
                'margin-left': '-495px',
                'align': 'center',
                'position': 'absolute'
            });
            mask.appendChild(div);
        }

        var lockTime = callBackendMethod("loginUserManager", "getLockTime");
        div.innerHTML = '<div style="text-align:center;margin-top:40px;margin-bottom:20px;font-size:14px;font-weight:bold;color:#fff" class= "promptInfo">' + $.i18n("login.label.lock.prompt") + '</div><div style="width:350px;height:310px;margin:0 auto;border:solid 1px transparent;background-image:url(' + _ctxPath + '/skin/dist/images/lockScreenBg2.png);background-repeat:no-repeat;background-position:center 50px;"><div style="width:100%;height:240px;margin:35px 0;border:solid 1px transparent;"><div style="height:20px;line-height:20px;margin-top:175px;text-align:center;font-size:14px;font-weight:bold;color:#fff" id="lockPrompt2"></div></div></div>';
        $("#lockPrompt2").html($.i18n("login.label.lock.prompt1", lockTime));
        mask.onclick = isLeave;
    }
    setTimeout(function () {
        hideOfficeObj();
    }, 100);
    // top.localStorage.setItem('A8.Locked','1');
}

function unlockScreen() {
    var pageWindow = getCtpTop();
    removeNode('screenLockMask_iframe_shadow');
    removeNode('screenLockMask');
    removeNode('authenticationDialog');

    function removeNode(id) {
        var mask = pageWindow.document.getElementById(id);
        if (mask != null) {
            mask.parentNode.removeChild(mask);
        }
    }

    // '1' === top.localStorage.getItem('A8.Locked') && showOfficeObj();
    // top.localStorage.setItem('A8.Locked','0');
}

var Base_64 = {
    _keyStrSeed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base_64._utf8Encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStrSeed.charAt(s) + this._keyStrSeed.charAt(o) + this._keyStrSeed.charAt(u) + this._keyStrSeed.charAt(a)
        }
        return t
    }, decode: function (e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9+/=]/g, "");
        while (f < e.length) {
            s = this._keyStrSeed.indexOf(e.charAt(f++));
            o = this._keyStrSeed.indexOf(e.charAt(f++));
            u = this._keyStrSeed.indexOf(e.charAt(f++));
            a = this._keyStrSeed.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base_64._utf8Decode(t);
        return t
    }, _utf8Encode: function (e) {
        e = e.replace(/rn/g, "n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    }, _utf8Decode: function (e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
}

function authenticate() {
    var dogSessionId = getDogSessionId();
    var pageWindow = getCtpTop();
    $.ajax({
        type: "post",
        url: _ctxPath + "/main.do?method=authenticate",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        data: $.param({
            'login_password': Base_64.encode(pageWindow.document.getElementById('login_password').value),
            'dogSessionId': dogSessionId
        }),
        success: function (result) {
            if (result.logout) {
                pageWindow.document.getElementById('authenticateMessage').innerHTML = $.i18n('login.label.exitCode') + '';
//                pageWindow.document.getElementById("logoutId").innerHTML='<a class="common_button common_button_emphasize" href="javascript:exitCurrentSystem()">'+$.i18n("login.label.logout.current.user")+'</a>';
                pageWindow.document.getElementById("login_password").style.background = "#DCDCDC";
                pageWindow.document.getElementById("login_password").disabled = true;
                pageWindow.document.getElementById("submitButton").href = "javascript:return false;";
                pageWindow.document.getElementById("submitButton").style.opacity = 0.5;
                //失败次数达到最大值移除click事件
                $("#screenLockMask").removeAttr("onclick");
                return;

            }
            if (result.success) {
                unlockAllScreen();
                //word正文显示
                showOfficeObj();
            } else {

                var msg = result.message;
                if (typeof (msg) == 'undefined') {
                    msg = $.i18n('login.label.lose.connection.desc');
                }
                pageWindow.document.getElementById('authenticateMessage').innerHTML = msg;
            }
        },
        error: function () {

        }
    });
}

function showAuthenticationDialog(options) {
    var pageWindow = getCtpTop();
    var maxIndex = getMaxZindex() || 8000;
    //移除提示信息
    var promptInfo = pageWindow.document.getElementById("promtInfo");
    if (promptInfo != null) {
        promptInfo.parentNode.removeChild(promptInfo);
    }

    var id = 'authenticationDialog';
    var div = pageWindow.document.getElementById(id);
    if (div == null) {
        div = pageWindow.document.createElement("div");
        div.id = id;
        $(div).css({
            'z-index': maxIndex,
            'position': 'absolute',
            'width': '350px',
            'height': '310px',
            'top': '50%',
            'margin-top': '-155px',
            'left': '50%',
            'margin-left': '-175px'
        });
        pageWindow.document.body.appendChild(div);
    }
    div.innerHTML = '<div style="text-align:center;margin:0 35px 35px;margin-bottom:20px;"><img src="' + options.avatar + '" style="width:90px;border-radius:50%;box-shadow:0px 6px 20px 0px rgba(0,0,0,0.25);"/></div>' + '<div id="authenticateMessage" style="height:20px;line-height:20px;overflow:hidden;margin-top:20px;margin-bottom:20px;color:red;text-align:center;">&nbsp</div>' + '<form action="javascript:authenticate()"> <div class="password" align="center"><div style="margin-bottom:25px;width:255px;height:auto;padding:10px;border:solid 1px rgb(51,108,251);border-radius:25px;background-color:#fff;"><i class="syIcon sy-lock" style="color:#336CFB;font-size:24px;position:relative;top:2px;"></i><input id="login_password" autocomplete="off" name="login_password" type="password" placeholder=' + $.i18n("sys.password.lable.view.lable") + ' style="height:30px;line-height:30px;border:none;outline:none;position:relative;top:-2px;"/></div><div><span id="submitButton" class="common_button common_button_emphasize radius3px" style="width:255px;height:30px;line-height:30px;padding:10px;max-width:255px;border-radius:25px;font-size:22px;letter-spacing:5px;box-shadow:0px 10px 20px 0px rgba(0,0,0,0.1);" onclick="javascript:authenticate()">' +
        $.i18n("common.button.ok.label") + '</span></div><div style="margin-top:20px" id="logoutId" style="text-align:center"></div> </div></form>';
    pageWindow.document.getElementById("logoutId").innerHTML = '<span style="color:#666;font-size:14px;cursor:pointer;color:#fff;" onclick="javascript:exitCurrentSystem()">' + $.i18n("login.label.logout.current.user") + '</span>';
    $("#login_password").focus();
}

var isDoubleCommit = false;

function isLeave() {
    if (!isDoubleCommit) {
        isDoubleCommit = true;
        callBackendMethod("loginUserManager", "isLeave", getDogSessionId(), {
            success: function (result) {
                if (result == "__LOGOUT") {
                    alert($.i18n('loginUserState.unknown') + ',原因:检测到用户已退出!');//loginUserState.unknown
                    exitCurrentSystem();
                } else if (result.isLeave == true) {
                    showAuthenticationDialog({'avatar': result.avatar});
                } else {
                    unlockAllScreen();
                }
                isDoubleCommit = false;
            },
            error: function (request, settings, e) {
                $.alert($.i18n('login.label.lose.connection.desc'));
                isDoubleCommit = false;
            }
        });
    }
}

function exitCurrentSystem() {
    var top = getCtpTop();
    try {
        if (!top._windowsMap) {
            top = top.opener;
        }
        if (top && top._windowsMap != null) {
            var values = top._windowsMap.values();
            for (var i = 0; i < values.size(); i++) {
                var win = values.get(i);
                win.close();
            }
        }
        top.location.href = _ctxPath + "/main.do?method=logout";

    } catch (error) {

    }
}

function getDogSessionId() {
    var sessionid = "";
    try {
        var usbKeyObject = new ActiveXObject("A8identifyDog.A8Identify");
        if (usbKeyObject) {
            sessionid = usbKeyObject.getDogID();
        }
    } catch (error) {
        return "";
    }

    return sessionid;
}


/**
 * 判断浏览器是否支持h5的批量下载
 * @returns
 */
function canH5BatchDownload() {
    var is360 = false;
    var mimeTypes = navigator.mimeTypes;
    if (mimeTypes.length > 0) {
        for (var mt in mimeTypes) {
            if (mimeTypes[mt]["type"] == "application/vnd.chromium.remoting-viewer") {
                is360 = true;
                break;
            }
        }
    }
    var isWinXp = (navigator.userAgent.indexOf("Windows NT 5.1") > -1 || navigator.userAgent.indexOf("Windows XP") > -1);
    if (is360 == true && isWinXp == true) {
        return false;
    }
    return !v3x.isMSIE && (v3x.isChrome || v3x.isFirefox);
}

/**
 * h5批量下载
 * @param objs [{src:"/doDownload.....",fileName:"文档.docx"},
 *                {src:"/doDownload.....",fileName:"文档1.docx"}]
 * @returns
 */
function batchDownload(objs, fileName) {
    if (!objs || objs.length < 1) {
        alrt("param error!");
        return;
    }

    // var ids="";
    // for(var i=0;i<objs.length;i++){
    // 	 ids = ids + objs[i].fileId;
    //     if(i<objs.length-1){
    //         ids = ids +",";
    //     }
    // }

    if (typeof (fileName) == "undefined" || fileName == "") {
        fileName = new Date().format("yyyyMMddHHmm").toString();
    } else {
        fileName += new Date().format("yyyyMMddHHmm").toString();
    }

    var idArray = [];
    var vArray = [];
    for (var i = 0; i < objs.length; i++) {
        idArray.push(objs[i].fileId);
        vArray.push(objs[i].v);
    }

    $.ajax({
        url: _ctxPath + "/rest/attachment/v_file/batchDownload/getFlag",
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify({
            fileIds: idArray,
            fileVs: vArray
        }),
        success: function (result) {
            if (result.code * 1 === 0) {
                var url = _ctxPath + "/rest/attachment/v_file/batchDownloadByFlag/" + result.data.flag + "?zipFileName=" + encodeURIComponent(fileName) + "&v=" + result.data.v;
                $("#batchDownloadResult").attr("href", url);
                $("#batchDownloadResult").attr("download", Date.now() + ".zip");
                $("#batchDownloadResultSpan").trigger("click");
            }
            console.log(result);
        },
        error: function (result) {
            console.error(result);
        }
    })

    // var url = _ctxPath+"/rest/attachment/file/batchDownload/"+ids+"?zipFileName=" + encodeURIComponent(fileName);
    //   $("#batchDownloadResult").attr("href",url);
    //   $("#batchDownloadResult").attr("download",Date.now()+".zip");
    //   $("#batchDownloadResultSpan").trigger("click");

}

/**
 * H5下载文件
 * @param src 下载地址
 * @param fileName 文件名
 * @returns
 */
function doDownload(src, fileName) {
    if (!fileName) {
        fileName = "";
    }
    var a = document.createElement('a'); // 创建a标签
    var e = document.createEvent('MouseEvents'); // 创建鼠标事件对象
    e.initEvent('click'); // 初始化事件对象
    a.href = src; // 设置下载地址
    a.download = fileName; // 设置下载文件名
    a.dispatchEvent(e);
}

//开始进度条
var commonProgressbar = null;

function startProc(title) {
    try {
        var options = {
            text: title
        };
        if (title == undefined) {
            options = {};
        }
        if (commonProgressbar != null) {
            commonProgressbar.start();
        } else {
            commonProgressbar = new MxtProgressBar(options);
        }
    } catch (e) {
    }
}

//结束进度条
function endProc() {
    try {
        if (commonProgressbar) commonProgressbar.close();
        commonProgressbar = null;
    } catch (e) {
    }
}

//刷新操作
function reFlesh() {
    if (document.getElementById("mainIframe")) {
        document.getElementById("mainIframe").contentWindow.location.reload();
    } else {
        getCtpTop().location.reload();
    }
}

//面包屑
function showLocation() {
    var _breadcrumbDom = document.getElementById("breadcrumb");
    if (_breadcrumbDom && html && html != "") {
        _breadcrumbDom.innerHTML = html;
        _breadcrumbDom.style.display = "block";

    }
}

function hideLocation() {
    var _breadcrumbDom = document.getElementById("breadcrumb");
    if (_breadcrumbDom) {
        _breadcrumbDom.innerHTML = "";
        _breadcrumbDom.style.display = "none";
    }
}

function webConfig() {
    var webConfig = {

        /**
         * 后端请求过来的阈值对象
         */
        potalThresholdVO: null,

        /**
         * 初始化阈值对象的方法
         * @param callback
         */
        initPortalThreshold: function () {
            if (this.potalThresholdVO != null) {
                return;
            }
            var that = this;
            $.ajax({
                url: _ctxPath + "/rest/webConfig/portal/threshold",
                async: false,
                method: "GET",
                success: function (data, status) {
                    if ("success" === status) {
                        that.potalThresholdVO = data.data;
                    }
                }
            });
        },

        /**
         * 超阈值显示内容
         * @param count 显示数量
         * @returns {*}
         */
        overThresholdShow: function (count) {
            if (this.potalThresholdVO == null) {
                this.initPortalThreshold();
            }
            if (count > this.potalThresholdVO.threshold) {
                return this.potalThresholdVO.overThresholdShow;
            }
            return count + "";
        }
    }
    return webConfig;
}


/**
 * wpsocx控件定制 在未加载控件的情况下判断是否使用wpsocx控件
 * @param clientMixNet 混网开关
 * @param domesticModel 国标office模式
 * @returns {boolean}
 */
function useWpsOcx(clientMixNet, domesticModel) {
    //参数为空，则直接返回false
    if (!clientMixNet || !domesticModel) {
        return false;
    }
    //客户端混网，没有购买国标office插件，就走金格
    if (clientMixNet == "nochinaoffice") {
        return false;
    }
    //使用jsapi模式
    if (domesticModel == "jsapi") {
        return false;
    }
    //不允许混网，且混网模式是npapi
    if (clientMixNet == "disable" && domesticModel == "npapi") {
        return true;
    }

    //进行金格控件/wpsocx检测
    var _mainbodyOcxObj = null;
    var _mainbodyOcxObj64 = null;
    var _mainbodyOcxObjWPS = null;
    try {
        _mainbodyOcxObj = new ActiveXObject("Kinggrid.iWebOffice");
    } catch (e) {
        _mainbodyOcxObj = null;
    }
    try {
        _mainbodyOcxObj64 = new ActiveXObject("Kinggrid.iWebOffice_x64");
    } catch (e) {
        _mainbodyOcxObj64 = null;
    }
    try {
        _mainbodyOcxObjWPS = new ActiveXObject("WPSDocFrame.Frame");
    } catch (e) {
        _mainbodyOcxObjWPS = null;
    }
    if (_mainbodyOcxObj == null && _mainbodyOcxObj64 == null && _mainbodyOcxObjWPS != null) {
        return true;
    }
    return false;
}

/**
 * 保存安全审计日志
 * @param params
 */
function saveProcessLog(params) {
    try {
        // 保存日志所需要的参数 如果有传入就使用传入的，如果没有传入就直接从当前层级或者父级获取
        let category = (typeof (params.category) != "undefined" && params.category != "" && params.category != null) ? params.category : officeSDK.params.category;
        if (typeof category == "undefined") {
            category = parent.parent.officeParamsVo.category;
        }
        if (category == 4) {
            let xhrFun = $.ajax ? $.ajax : window.top.jQuery.ajax;
            let ctxPath = typeof (_ctxPath) != "undefined" ? _ctxPath : window.top._ctxPath;

            let processId = (typeof officeSDK.params.processId != "undefined") ? officeSDK.params.processId : "";
            let userId = (typeof (params.userId) != "undefined" && params.userId != "" && params.userId != null) ? params.userId : officeSDK.params.userId;
            if (userId == "") {
                userId = (typeof parent.officeSDK != "undefined") ? parent.officeSDK.params.userId : CurrentUserId;
            }
            let fileId = (typeof (params.fileId) != "undefined" && params.fileId != "" && params.fileId != null) ? params.fileId : officeSDK.params.fileId;
            let processName = (typeof (params.fileName) != "undefined" && params.fileName != "" && params.fileName != null) ? params.fileName : officeSDK.params.fileName;
            let attName = "";
            let activId = "";
            try {
                // 兼容表单内修改附件时获取 activId 需要从父层的父层获取
                activId = document.getElementById('currentNodeId') != null ? document.getElementById('currentNodeId').value
                    : (parent.document.getElementById('currentNodeId') != null ? parent.document.getElementById('currentNodeId').value
                        : parent.parent.document.getElementById('currentNodeId').value);
            } catch (e) {
                OfficeUtils.consoleLog(e);
            }
            let actionId = params.actionId;

            if (OfficeAPI.options.isEditAtt) {
                actionId = actionId == -31 ? -39 : (actionId + 4);
                fileId = (typeof (params.originalFileId) != "undefined" && params.originalFileId != "" && params.originalFileId != null) ? params.originalFileId : officeSDK.params.originalFileId;
                attName = (typeof (params.attName) != "undefined" && params.attName != "" && params.attName != null) ? params.attName : processName;
            }
            if (typeof activId == "string") {
                activId = 0;
            }

            let paramData = {
                processId: processId, // 流程ID
                activityId: activId, //节点ID
                actionId: actionId, // 操作枚举ID
                category: category, // 模块类型
                userId: userId, // 用户ID 有就传递，没有就不传
                fileId: fileId, // 文件ID
                processName: processName, // 流程标题名称或文件名
                attName: attName //附件名称 针对附件才传递
            };
            console.log("paramData= processId=" + paramData.processId + " actionId=" + paramData.actionId + " activityId=" + paramData.activityId
                + " userId=" + paramData.userId + " fileId=" + paramData.fileId + " processName=" + paramData.processName + " category=" + paramData.category)
            xhrFun({
                url: ctxPath + '/rest/workflow/log/processDoLog',
                method: 'POST',
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                data: JSON.stringify(paramData),
                success: function () {
                    console.log("saveProcessLog=success")
                },
                error: function () {
                    console.log("saveProcessLog=error")
                }
            })
        }
    } catch (e) {
        console.log(e);
    }
}

//客开s gjx666
/**
 * 调用 FileZ 进行在线预览
 * @param {String} fileId - 附件的ID (原代码中的 fileUrl)
 * @param {String} fileName - 附件名称
 * @param {String} createDate - 附件创建时间 (重要：需确认格式)
 */
function openFileZPreview(fileId, fileName, createDate) {
    try {
        var paramData = {
            "fileId": fileId,
            "createDate": createDate,
            "fileName": fileName,
            "state": "view"
        };
        // 调用后台方法获取 FileZ 地址
        var fileZRavl = callBackendMethod("euFileZManager", "fileZInit", paramData);

        if (fileZRavl != null && fileZRavl.url) {
            window.open(
                fileZRavl.url,
                "_blank",
                "top=200,left=200,width=1300,height=600,menubar=no,toolbar=no,status=no,scrollbars=yes"
            );
        } else {
            $.alert("FileZ后台预览接口返回异常或无URL");
        }
    } catch (e) {
        console.error("FileZ预览调用失败:", e);
        $.alert("预览请求失败，请检查网络或控制台报错");
    }
}
//客开e