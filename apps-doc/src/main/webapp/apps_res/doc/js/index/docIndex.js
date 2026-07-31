function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
    2019-10-10 翻新框架 docindex.jsp 用
 */
$().ready(function () {
  initBreadCrumb();
  $("#chooseAll").change(function () {
    var ischecked = $(this).prop("checked");
    $("#card_ul li").each(function () {
      var tempLi = $(this);
      var potentStr = $(this).attr("da");
      var acl = new DocAcl().initStr(potentStr);
      var noAcl = acl.toPotentString() === "0000000000";

      if (noAcl) {
        $(this).toggleClass("currentChoose", false);
      } else {
        $(this).find(":checkbox.checkboxTag").prop("checked", ischecked);
        $(this).toggleClass("currentChoose", ischecked);
      }
    });
    mergeAcl();
  });

  if (getA8Top()) {
    if (getA8Top().hideLeftNavigation) {
      getA8Top().hideLeftNavigation();
    }
  }

  if (alertNotExist == 'true') {
    $.alert(v3x.getMessage('DocLang.doc_source_folder_no_exist'));
  } else if (docLibAlert != '') {
    $.alert(v3x.getMessage('DocLang.' + docLibAlert));
  } else {
    initLeftTree();
    setTimeout(function () {
      leftTree.expandNode(leftTree.getNodeByParam("id", "20000", null), true, false, false);
      leftTree.expandNode(leftTree.getNodeByParam("id", "30000", null), true, false, false);
      leftTree.expandNode(leftTree.getNodeByParam("id", "40000", null), true, false, false);
    }, 500);
    initBasicData();
    initDrag();
    initBodyEvent();
  }
});
/**
 * 通过ajax 取到当前文件夹下 toolbar list需要用到的权限数据
 */

var count = 0; //防抖

function initBasicData(callbackFunc) {
  ++count;

  if (count > 1) {
    return;
  }

  ajaxDocHierarchyManager.getRightNewAclInfo({
    frType: frType,
    resId: resId,
    docLibId: docLibId,
    docLibType: docLibType,
    isShareAndBorrowRoot: isShareAndBorrowRoot,
    projectTypeId: projectTypeId
  }, {
    success: function success(data) {
      count = 0;
      docLibId = data.docLibId + "";
      projectTypeId = data.projectTypeId + "";
      entranceType = data.entranceType + "";
      isPrivateLib = data.isPrivateLib + "";
      folderEnabled = data.folderEnabled + "";
      a6Enabled = data.a6Enabled + "";
      officeEnabled = data.officeEnabled + ""; //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start

      ofdEnabled = data.ofdEnabled + ""; //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end

      uploadEnabled = data.uploadEnabled + "";
      isGroupLib = data.isGroupLib + "";
      isEdocLib = data.isEdocLib + "";
      isVideoLib = data.isVideoLib + "";
      isAllowArchivePigeonhole = data.isAllowArchivePigeonhole + "";
      docLibColumnEditable = data.docLibColumnEditable;

      if (data.parent) {
        parentPath = data.parent.logicalPath;
        parentCommentEnabled = data.parent.commentEnabled + "";
        parentVersionEnabled = data.parent.versionEnabled + "";
        parentRecommendEnable = data.parent.recommendEnable + "";
        parentBatchDownloadEnable = data.parent.batchDownloadEnabled + "";
        parentScoreEnable = data.parent.scoreEnabled + "";
      }

      if (data.isVideoLib && data.parent.parentFrId === "0") {
        flipInfoForVideo.docLibId = data.parent.id;
        flipInfoForVideo.parentCommentEnabled = data.parent.commentEnabled + "";
        flipInfoForVideo.parentVersionEnabled = data.parent.versionEnabled + "";
        flipInfoForVideo.parentRecommendEnable = data.parent.recommendEnable + "";
        flipInfoForVideo.parentBatchDownloadEnable = data.parent.batchDownloadEnabled + "";
        flipInfoForVideo.parentScoreEnable = data.parent.scoreEnabled + "";
        flipInfoForVideo.folderEnabled = folderEnabled;
        var docLibAllAcl = data.allAcl; //视频库的全部权限

        var docLibListAcl = data.listAcl; //视频库的列表权限

        var docLibAddAcl = data.addAcl; //视频库的新建权限

        var docLibEditAcl = data.editAcl; //视频库的编辑权限

        var docLibDelAcl = data.delAcl; //视频库的删除权限

        flipInfoForVideo.docLibAllAcl = docLibAllAcl;
        flipInfoForVideo.docLibListAcl = docLibListAcl;
        flipInfoForVideo.docLibAddAcl = docLibAddAcl;
        flipInfoForVideo.docLibEditAcl = docLibEditAcl;
        flipInfoForVideo.docLibDelAcl = docLibDelAcl;
      }

      window.allAcl = data.allAcl + "";
      window.listAcl = data.listAcl + "";
      window.readAcl = data.readAcl + "";
      window.addAcl = data.addAcl + "";
      window.editAcl = data.editAcl + "";
      window.delAcl = data.delAcl + "";
      window.lendAcl = data.lendAcl + "";
      window.openToZoneAcl = data.openToZoneAcl + "";
      window.printAcl = data.printAcl + "";
      window.downloadAcl = data.downloadAcl + "";

      if (typeof callbackFunc == "function") {
        callbackFunc();
      } else if (isShareAndBorrowRoot == "true" && resId == "20002") {
        changeRightBlock("other_share_block");
        initRightShareCard();
      } else if (isShareAndBorrowRoot == "false" && isVideoLib == "true") {
        //视频库
        changeRightBlock("video_block");
        initVideoCard("all", false, null, null, null);
      } else if ($(".tableBtn").hasClass("currentLi")) {
        changeRightBlock("card_block");
        initToolBar();
        initRightCard();
      } else {
        changeRightBlock("table_block");
        initToolBar();
        initRightList();
      }

      if (data.breadCrumbList) {
        initDocBreadCrumb(data.breadCrumbList);
      }
    },
    error: function error() {
      count = 0;
    }
  });
}

function initDocBreadCrumb(breadCrumbList) {
  var pathBlock = $(".right_path");
  pathBlock.html("");

  for (var i = 0; i < breadCrumbList.length; i++) {
    var _breadCrumbDom = $("<div class='doc_crumb hand'></div>");

    var _breadCrumb = breadCrumbList[i];
    var pathId = _breadCrumb.drId;
    var pathName = _breadCrumb.frName;
    var pathType = _breadCrumb.frType;
    var pathLibId = _breadCrumb.libId;
    var pathLibType = _breadCrumb.libType;

    _breadCrumbDom.attr("pathId", pathId);

    _breadCrumbDom.text($.i18n(pathName));

    _breadCrumbDom.attr("title", $.i18n(pathName));

    if (pathType) {
      _breadCrumbDom.attr("pathType", pathType);
    }

    if (pathLibId) {
      _breadCrumbDom.attr("pathLibId", pathLibId);
    }

    if (pathLibType) {
      _breadCrumbDom.attr("pathLibType", pathLibType);
    }

    _breadCrumbDom.click(function (e) {
      var pathId = $(this).attr("pathId");
      var pathType = $(this).attr("pathType");
      var pathLibId = $(this).attr("pathLibId");
      var pathLibType = $(this).attr("pathLibType");
      var pathId = $(this).attr("pathId");

      if (isShareAndBorrowRoot) {
        var node = {
          docResource: {
            id: pathId
          }
        };

        if (pathId == "20000") {
          //共享管理，点击无用
          return;
        } else if (pathId == "20001") {
          //我共享的
          node.docResource.frType = "9777";
          shareRootOpenFun("my", node);
        } else if (pathId == "20002") {
          //共享给我的
          node.docResource.frType = "9777";
          shareRootOpenFun("other", node);
        } else {
          node.docResource.frType = pathType;
          node.docLibType = pathLibType;
          node.docResource.docLibId = pathLibId;
          folderOpenFun(node);
        }
      } else {
        var node = {
          docResource: {
            id: pathId
          }
        };
        folderOpenFun(node.data);
      }
    });

    pathBlock.append(_breadCrumbDom);
  }
}

function initLeftTree() {
  $("#docTree").tree({
    onClick: treeClick,
    //1 单击
    //beforeDrag: beforeDrag,//2 拖动事件
    //beforeDrop: beforeDrop,//3 拖动释放事件
    managerName: "docHierarchyManager",
    //4 调用manager
    managerMethod: "getTreeNodesForDocIndex",
    //5 调用manager的方法
    idKey: "id",
    pIdKey: "pId",
    nameKey: "name",
    enableCheck: false,
    //6
    enableEdit: false,
    //7
    enableRename: false,
    //8
    enableRemove: false,
    //9
    showLine: function showLine(node) {
      return node.id != "0";
    },
    asyncParam: {},
    beforeAsync: function beforeAsync(treeId, node, defaultVal) {
      if (node.id == "0") {
        leftTree.setting.async.otherParam = {
          isRoot: "true"
        };
      } else if (node.id == "20000") {
        //共享管理根展开
        leftTree.setting.async.otherParam = {
          isShareRoot: "true"
        };
      } else if (node.id == "30000") {
        //文档库根展开
        leftTree.setting.async.otherParam = {
          isLibRoot: "true"
        };
      } else if (node.id == "40000") {
        //视频文档库根展开
        leftTree.setting.async.otherParam = {
          isVideoRoot: "true"
        };
      } else {
        leftTree.setting.async.otherParam = {
          resId: node.id,
          frType: node.data.docResource.frType,
          projectTypeId: node.data.docResource.projectTypeId,
          isShareAndBorrowRoot: node.data.docResource.isShareAndBorrowRoot
        };
      }
    },
    nodeHandler: function nodeHandler(n) {
      //11
      n.open = true; //12

      n.isParent = true;

      if (n.id != "0") {
        n.id = n.data.docResource.id;
        n.pId = n.data.docResource.parentFrId;
        n.name = $.i18n(n.data.showName);
      }

      if (n.id == "20001" || n.id == "20002" || n.data.docLibType == "7" || n.data.docLibType == "6") {
        //视频库树不往下取
        n.open = false; //12

        n.isParent = false;
        n.iconSkin = "ico_close _";
      }
    }
  }); //根节点

  var rootNode = new Object();
  rootNode.id = "0";
  rootNode.pId = "0";
  rootNode.name = docCenterStr;
  rootNode.isParant = "true";
  leftTree = $("#docTree").treeObj();
  leftTree.addNodes(null, rootNode);
  leftTree.expandNode(leftTree.getNodes()[0], true, false, false);

  function treeClick(e, treeId, node) {
    var openState = node.open;

    if (node.id == "0") {} else if (node.data.isPersonalLib && node.level == 1) {
      //我的文档
      leftTree.expandNode(node, !openState, false, false);
      isShareAndBorrowRoot = "false";
      folderOpenFun(node.data);
    } else if (node.id == "20000") {
      //共享管理根展开
      leftTree.expandNode(node, !openState, false, false);
    } else if (node.id == "30000") {
      //文档库根展开
      isShareAndBorrowRoot = "false";
      leftTree.expandNode(node, !openState, false, false);
    } else if (node.id == "40000") {
      //视频文档库根展开
      isShareAndBorrowRoot = "false";
      leftTree.expandNode(node, !openState, false, false);
    } else if (node.id == "20001") {
      //我共享的
      isShareAndBorrowRoot = "true";
      shareRootOpenFun("my", node.data);
    } else if (node.id == "20002") {
      //共享给我的
      isShareAndBorrowRoot = "true";
      shareRootOpenFun("other", node.data);
    } else {
      var nowLevel = node.level;
      var levelOneNode = null;

      for (var i = 0; i < nowLevel - 1; i++) {
        if (levelOneNode == null) {
          levelOneNode = node.getParentNode();
        } else {
          levelOneNode = levelOneNode.getParentNode();
        }
      }

      isShareAndBorrowRoot = "" + (levelOneNode.id == "20000");

      if (levelOneNode.id == "40000") {
        //视频库打开
        $(".current_folder").toggleClass("current_folder", false);
        var docLibId = node.data.docResource.id; //视频库的id

        var docLibAllAcl = node.data.allAcl; //视频库的全部权限

        var docLibListAcl = node.data.listAcl; //视频库的列表权限

        var docLibAddAcl = node.data.addAcl; //视频库的新建权限

        var docLibEditAcl = node.data.editAcl; //视频库的编辑权限

        var docLibDelAcl = node.data.delAcl; //视频库的删除权限

        flipInfoForVideo = {};
        flipInfoForVideo.docLibId = docLibId;
        flipInfoForVideo.docLibAllAcl = docLibAllAcl;
        flipInfoForVideo.docLibListAcl = docLibListAcl;
        flipInfoForVideo.docLibAddAcl = docLibAddAcl;
        flipInfoForVideo.docLibEditAcl = docLibEditAcl;
        flipInfoForVideo.docLibDelAcl = docLibDelAcl;
      } else {}

      folderOpenFun(node.data);
    } //alert($.toJSON(node.data));
    //node.children[0].data 取第0个子节点的数据对象

  } // $("#selectedBtn").click(function () {
  //     var nodes = $("#tree").treeObj().getSelectedNodes();//15
  //     alert($.toJSON(nodes));
  // });
  // $("#checkedBtn").click(function () {
  //     var nodes = $("#tree").treeObj().getCheckedNodes();//16
  //     alert($.toJSON(nodes));
  // });
  // $("#asyncBtn").click(function () {
  //     $("#tree").treedObj().reAsyncChildNodes(null, "refresh");//17
  // });

} // 新增开始


var rightGrid = null; // 新增方法代码

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function forEach(callback, thisArg) {
    var T, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    var O = Object(this);
    var len = O.length >>> 0;

    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    if (arguments.length > 1) {
      T = thisArg;
    }

    k = 0;

    while (k < len) {
      var kValue;

      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }

      k++;
    }
  };
} // 新增代码结束


var downLoadIsSearch; //用于批量下载时是否是搜索后下载

function initRightList(_condition, _value1, _value2) {
  var aclMap = {};
  var isSearch = _condition ? true : false;
  downLoadIsSearch = isSearch; // 新增代码开始
  // 新增代码结束

  if (!isSearch) {
    initSearch();
  }

  var searchType = isSearch ? _commonSearchObj[_condition] : "";
  ajaxDocHierarchyManager.getRightNewTableHeadInfo({
    resId: resId,
    isShareAndBorrowRoot: isShareAndBorrowRoot,
    isSearch: isSearch + ""
  }, {
    success: function success(data) {
      var colModelList = [{
        display: 'id',
        name: 'id',
        width: 'smallest',
        align: 'center',
        type: 'checkbox'
      }];

      for (var i = 0; i < data.length; i++) {
        var tempCol = data[i];
        var tempColW = tempCol.percent;

        if (tempColW > 379) {
          tempColW = 'big';
          data[i].percent = tempColW;
        } else if (tempColW > 119) {
          tempColW = 'medium';
          data[i].percent = tempColW;
        } else if (tempColW > 79) {
          tempColW = 'small';
          data[i].percent = tempColW;
        } else {
          tempColW = 'smallest';
          data[i].percent = tempColW;
        }

        var tempData = {
          display: tempCol.title,
          name: tempCol.value,
          width: tempColW,
          sortable: true,
          align: tempCol.align
        };

        if (tempCol.docType == 2 || tempCol.docType == 12) {
          tempData.sortType = 'number';
        }

        if (tempData.name == "archiveState" || tempData.name == "archiveTime") {
          if (!$.ctx.hasPlugin("docarchive") || !callBackendMethod("docArchiveManager", "hasArchiveRole")) {
            continue;
          }
        }

        colModelList.push(tempData);
      }

      $("#table_block").html("<table id=\"doc_grid\" style=\"display: none\"></table>");
      rightGrid = $("#doc_grid").ajaxgrid({
        gridType: 'autoGrid',
        customize: false,
        leftWidth: 180,
        //onCurrentPageSort: false,
        click: clk,
        //单击事件
        dblclick: clk,
        //双击事件
        render: rend,
        //function rend(txt,rowData, rowIndex, colIndex,colObj)
        //自定义渲染器，
        //可以对单元格显示数据和样式进行加工展现，据对象，
        //txt为表身渲染单元格文本，rowData为渲染当前行数,rowIndex为当前行，colIndex为当前列,
        //colObj为表头对象的width，name，display，align以及sortType等等
        colModel: colModelList,
        // searchitems : [ {
        //     display : '组织ID',
        //     name : 'orgid'
        // }, {
        //     display : '组织名称',
        //     name : 'orgname'
        // } ],
        width: "100%",
        height: "100%",
        parentId: "table_block",
        resizable: false,
        managerName: "docHierarchyManager",
        managerMethod: "getRightNewListData",
        //dbOrderBy : window.isShareAndBorrowRoot != "true",
        params: {
          entranceType: entranceType,
          isShareAndBorrowRoot: isShareAndBorrowRoot,
          frType: frType,
          resId: resId,
          all: window.allAcl,
          list: window.listAcl,
          read: window.readAcl,
          add: window.addAcl,
          edit: window.editAcl,
          del: window.delAcl,
          lend: window.lendAcl,
          openToZone: window.openToZoneAcl,
          print: window.printAcl,
          download: window.downloadAcl,
          isSearch: isSearch + "",
          searchCondition: _condition,
          searchValue1: _value1,
          searchValue2: _value2,
          projectTypeId: projectTypeId,
          searchType: searchType
        },
        onSuccess: function onSuccess(tableObj) {
          var bDiv = $(tableObj.bDiv);
          bDiv.find("input[value='noAcl']").parents("tr").find(":checkbox").prop("disabled");
          bDiv.find(":checkbox").attr("onchange", "mergeAcl()"); //区分批量下载是文件夹还是文件

          var data = tableObj.options.datas.data;

          for (var i = 0; i < data.length; i++) {
            var obj = data[i].docResource;
            bDiv.find("input[value=" + obj.id + "]").attr({
              isFolder: obj.isFolder,
              parentId: obj.parentFrId
            });
          }
        }
      });

      function rend(txt, rowData, rowIndex, colIndex, colObj) {
        var drId = rowData.id;
        nowPageDr[rowData.id] = rowData;
        var noAcl = !rowData.allAcl && !rowData.listAcl && !rowData.readAcl && !rowData.addAcl && !rowData.editAcl && !rowData.delAcl && !rowData.lendAcl && !rowData.openToZoneAcl && !rowData.printAcl && !rowData.downloadAcl && !rowData.listAcl;

        if (colIndex == 0) {} else {
          // var drObj = rowData["docResource"];
          // var drVal = drObj[colObj.name];
          var grids = rowData["grids"];
          var gridsCol = grids[colIndex - 1];
          var gridsDr = rowData["docResource"];

          if (gridsCol == undefined) {
            gridsCol = {};
          }

          var gridsColIsImg = gridsCol["isImg"];
          var gridsColIsName = gridsCol["isName"];
          var gridsColValue = gridsCol["value"];

          if (gridsColIsImg) {
            var gridsDrIsCheckOut = gridsDr["isCheckOut"];

            if (gridsDrIsCheckOut) {
              gridsColValue = "<i class='syDoc suoding'></i>";
            } else {
              //作者:dengwei 时间2020-09-21 功能文档中心兼容ofd文件之展示ofd文件 start
              if (gridsDr.mimeTypeId == 133) {
                gridsColValue = "<span class='ico16 office46_16'></span>";
              } else {
                gridsColValue = "<i class='syDoc " + gridsColValue + "'></i>";
              } //作者:dengwei 时间2020-09-21 功能文档中心兼容ofd文件之展示ofd文件 end

            }
          } else if (gridsColIsName && !noAcl) {
            var attFlag = gridsDr.hasAttachments;
            var authflag = gridsDr.isRelationAuthority;
            var hasCover = gridsDr.coverImageId && gridsDr.coverImageId != "";
            var nameText = $.i18n(gridsColValue);
            var preFix = "";
            var subFix = "";

            if (rowData.workflowEndState && rowData.workflowState != "") {
              //工作流
              preFix += "<span class='ico16 flow" + rowData.workflowState + "_16'></span>";
            }

            if (attFlag) {
              //有附件
              subFix += "<i class='syIcon sy-attachment'></i>";
            }

            if (authflag) {
              //协同表单授权
              subFix += "<span class='ico16 authorize_16 inline-block'></span>";
            }

            if (hasCover) {
              //有封面
              subFix += " <i class='syDoc img'></i>";
            } //<c:set value="${v3x:_(pageContext, docsRows.value)}" var="theAlt" />


            gridsColValue = "<div class='menu_btn text_overflow'>" + preFix + nameText.escapeHTML() + subFix;

            if (isV5Member) {
              gridsColValue += "<i class='syIcon sy-setting' onclick='docAction(this,\"" + drId + "\",event," + attFlag + ");'></i>";
            }

            gridsColValue += "</div>";

            if (noAcl) {
              gridsColValue += "<input type='hidden' value='noAcl'>";
            }
          } else {
            if (gridsCol.type == "java.util.Date") {
              gridsColValue = gridsColValue.substr(0, 10);
            } else {
              gridsColValue = $.i18n(gridsColValue);
            }
          }

          return gridsColValue;
        }
      }

      function clk(data, r, c) {
        //单击穿透刷新toolbar权限
        mergeAcl();
        var noAcl = !data.allAcl && !data.listAcl && !data.readAcl && !data.addAcl && !data.editAcl && !data.delAcl && !data.lendAcl && !data.openToZoneAcl && !data.printAcl && !data.downloadAcl && !data.listAcl;

        if (noAcl) {// return;
        } else {}

        if (data.docResource.isFolder) {
          //文件夹
          folderOpenFun(data);
        } else {
          var checkResult = callBackendMethod("secretAjaxManager", "checkUserSecretLevel", data.id);

          if (checkResult && checkResult.length > 0) {
            $.alert(checkResult);
            return;
          }

          fileOpenFun(data);
        } //var menuObj = new DocMenu(data);
        //TODO 打开下一级 或 穿透

      }

      function dblclk(data, r, c) {
        $("#txt").val("dblclk:" + $.toJSON(data) + "[" + r + ":" + c + "]");
      }

      $("#doc_grid").ajaxgridLoad();
    }
  }); // $("#btn").click(function() {
  //     var v = $("#mytable").formobj({//获取表格数据对象，用于ajax或其它处理操作,另外，还可以使用$("#mytable").ajaxgridData(objs)手工加载数据，objs结构为{ rows : [], page : 0, total : 0 }，rows为数据对象数组，page为页，total为总记录数
  //         gridFilter : function(data, row) {
  //             return $("input:checkbox", row)[0].checked;
  //         }
  //     });
  //     alert($.toJSON(v));
  // });
}

var refreshCardFlag = false;

function initRightCard(_isPextPage, _condition, _value1, _value2) {
  if (refreshCardFlag) {
    return;
  }

  refreshCardFlag = true;
  $("#chooseAll").prop("checked", false);
  var cardUlWidth = $("#card_ul").width();
  var eachLiWidth = 146;

  if (!_isPextPage) {
    $("#card_ul").html("").append('<div id="addMore" onclick="initRightCard(\'true\')" class="list_more"><span>' + viewMoreI18n + '</span><i class="syIcon  sy-arrow-down"></i></div>');
  }

  var eachRowSize = Math.floor(cardUlWidth / eachLiWidth);
  var pageSize = Math.ceil(50 / eachRowSize) * eachRowSize; //点击下一页

  if (_isPextPage && flipInfoForCard.page) {
    flipInfoForCard.page = flipInfoForCard.page + 1;
    flipInfoForCard.size = pageSize;
  } else {
    flipInfoForCard = {
      page: 1,
      size: pageSize,
      isSearch: false,
      _condition: null,
      _value1: "",
      _value2: ""
    };

    if (_condition) {
      flipInfoForCard._condition = _condition;
      flipInfoForCard._value1 = _value1;
      flipInfoForCard._value2 = _value2;
      flipInfoForCard.isSearch = true;
    }
  }

  getRightCardData();
}

function initRightShareCard(_isPextPage) {
  if (!_isPextPage) {
    $("#other_share_card_ul").html("").append('<div id="addMore" onclick="initRightShareCard(\'true\')" class="list_more"><span>' + viewMoreI18n + '</span><i class="syIcon  sy-arrow-down"></i></div>');
  } //点击下一页


  if (_isPextPage && flipInfoForCard.page) {
    flipInfoForCard = {
      page: flipInfoForCard.page + 1,
      size: 20
    };
  } else {
    flipInfoForCard = {
      page: 1,
      size: 20
    };
  }

  getRightShareCardData();
}
/**
 *
 * @param initType "all"-文件夹+文件 "folder"-文件夹 "doc"-文件夹
 * @param _isNextPage
 * @param _condition
 * @param _value1
 * @param _value2
 */


function initVideoCard(initType, _isNextPage, _condition, _value1, _value2) {
  if (initType == "all" || initType == "doc") {
    if (!_isNextPage) {
      initSearch();
    } //点击下一页


    if (_isNextPage && flipInfoForVideo.page) {
      flipInfoForVideo.page = flipInfoForVideo.page + 1;
      flipInfoForVideo.size = 20;
    } else {
      flipInfoForVideo.page = 1;
      flipInfoForVideo.size = 20;
    }

    if (_condition) {
      flipInfoForVideo._condition = _condition;
      flipInfoForVideo._value1 = _value1;
      flipInfoForVideo._value2 = _value2;
      flipInfoForVideo.isSearch = true;
    } else {
      flipInfoForVideo.isSearch = false;
    }
  }

  if (initType == "all") {
    resId = flipInfoForVideo.docLibId;
    var currentFolderId = $(".current_folder:not(#allVideo)").attr("drid");

    if (!currentFolderId && videoFolderId != "") {
      currentFolderId = videoFolderId;
      videoFolderId = "";
    }

    initVideoFolder(currentFolderId, true);
  }

  if (initType == "folder") {
    resId = flipInfoForVideo.docLibId;
    var currentFolderId = $(".current_folder:not(#allVideo)").attr("drid");
    initVideoFolder(currentFolderId, false);
  }

  if (initType == "doc") {
    getRightVideoData();
    initToolBar();
  }
}

function getRightCardData(_condition, _value1, _value2) {
  var isSearch = flipInfoForCard.isSearch;

  if (!isSearch) {
    initSearch();
  }

  var searchType = isSearch ? _commonSearchObj[flipInfoForCard._condition] : "";
  ajaxDocHierarchyManager.getRightNewListData(flipInfoForCard, {
    entranceType: entranceType,
    isShareAndBorrowRoot: isShareAndBorrowRoot,
    frType: frType,
    resId: resId,
    isSearch: isSearch + "",
    searchCondition: flipInfoForCard._condition,
    searchValue1: flipInfoForCard._value1,
    searchValue2: flipInfoForCard._value2,
    projectTypeId: projectTypeId,
    searchType: searchType
  }, {
    success: function success(rv) {
      //currentChoose
      var actionDiv = isV5Member ? "<div class='dr_action'><i class='syIcon sy-setting'></i></div>" : "";
      var li = $("<li class=''></li>") // .append("<div class='chooseSpan'><div></div><i class='iconfont icon-duigou'></i></div>")
      .append("<span class='ctpUiCheckbox checkboxTag'><input class='checkboxTag' type='checkbox'><label class='checkboxTag'><i class='checkboxTag'></i></label></span>").append(actionDiv).append("<div class='dr_img'></div>").append("<div class='dr_name'></div>");
      var drList = rv.data; // var cardUl = $("#card_ul");

      var cardUl_addMore_before = $("#addMore"); // cardUl.html("");

      if (drList.length > 0) {
        for (var i = 0; i < drList.length; i++) {
          var dr = drList[i];
          nowPageDr[dr.id] = dr;
          var kageBunshin = li.clone();
          var frName = dr.docResource.frName; //列表

          kageBunshin.find(".dr_name").text($.i18n(frName)).attr("title", $.i18n(frName)); //展示图片

          var icons = cardIcon(dr);
          kageBunshin.find(".dr_img").append(icons[0]);
          kageBunshin.find(".dr_img").append(icons[1]); //加drid

          var drId = dr.id;
          var drAcl = new DocAcl().initBoolean(dr.allAcl, dr.listAcl, dr.readAcl, dr.addAcl, dr.editAcl, dr.delAcl, dr.printAcl, dr.downloadAcl, dr.lendAcl, dr.openToZoneAcl);
          var p = drAcl.toPotentString(false);
          var noAcl = drAcl.toPotentString(false) === "0000000000";
          kageBunshin.attr("id", "card_" + drId).attr("drId", drId).attr("da", p);
          kageBunshin.find(".ctpUiCheckbox input").attr("id", "card_" + drId);
          kageBunshin.find(".ctpUiCheckbox label").attr("for", "card_" + drId); //OA-232516 文档中心卡片样式下，不能点击进入文档夹

          kageBunshin.click(function (event) {
            var potentStr = $(this).attr("da");
            var acl = new DocAcl().initStr(potentStr);
            var obj = event.srcElement ? event.srcElement : event.target; //点击的是input

            if (obj && $(obj).attr("class") && $(obj).attr("class").indexOf("checkboxTag") > -1) {
              //选中管理的事件
              if ($(this).hasClass("currentChoose")) {
                $(this).find("input[type='checkbox']").prop('checked', false);
                $(this).removeClass("currentChoose");
              } else {
                $(this).find("input[type='checkbox']").prop('checked', true);
                $(this).addClass("currentChoose");
              }

              mergeAcl();
            } else {
              //依然是点击事件
              var docId = $(this).attr("drId");
              var tempDr = nowPageDr[docId];

              if (!tempDr.docResource.isFolder) {
                //单击打开
                fileOpenFun(tempDr);
              } else {
                folderOpenFun(tempDr);
              }
            }
          });

          if (!noAcl) {
            //小齿轮
            kageBunshin.find(".dr_action i").click(function (event) {
              var docId = $(this).parents("li").attr("drId");
              docAction(this, docId, event);
              event.stopPropagation();
            });
          } else {
            kageBunshin.find(".dr_action").hide();
            kageBunshin.find(".checkboxTag:checkbox").prop("disabled", true);
          } // cardUl.append(kageBunshin);


          cardUl_addMore_before.before(kageBunshin);

          if (drList.length < flipInfoForCard.size) {
            cardUl_addMore_before.hide();
          }
        }
      } else {
        cardUl_addMore_before.hide();
      }

      refreshCardFlag = false;
    },
    error: function error(rv) {
      refreshCardFlag = false;
    }
  });
  /**
   * 返回卡片类的图标
   * @param dr 文档对象
   * @return *[] 第一位是主图片 第二位是类型小图可为空
   */

  function cardIcon(dr) {
    var bigIcon = "<span class='icon64 unknown_3_7_icon64'></span>";
    var miniIcon = "";

    if (dr.docResource.coverImageId && dr.docResource.coverImageId != "") {
      var _defaultSamllPath = _ctxPath + "/apps_res/doc/images/docIcon/";

      var openSquare = dr.openSquare;
      var imgId = dr.docResource.coverImageId;
      var imgUrl = _ctxPath + "/commonimage.do?method=showImage&size=custom&h=64&w=64&id=" + imgId;

      if (dr.docResource.mimeTypeId == "131" || dr.docResource.mimeTypeId == "132") {
        if (imgId == "-1") {
          //视频默认 理论不会出现
          imgUrl = _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + imgId;
        } else if (!imgId || imgId == "-2") {
          //音频默认
          imgUrl = _ctxPath + "/common/images/audio.png";
        } else {
          imgUrl = _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + imgId;
        }
      }

      for (var i = 0; i < dr.grids.length; i++) {
        var grid = dr.grids[i];

        if (grid.isImg) {
          miniIcon = "<img src='" + (_defaultSamllPath + (openSquare ? "share_" : "") + grid.value) + "' width='16' height='16'>";
        }
      }

      bigIcon = "<img src='" + imgUrl + "' width='64' height='64'>";
    } else {
      if (!dr.docResource.isFolder && dr.isImg) {
        var imgId = dr.file.id;
        var imgUrl = _ctxPath + "/commonimage.do?method=showImage&size=custom&h=64&w=64&id=" + imgId;
        bigIcon = "<img src='" + imgUrl + "' width='64' height='64'>";
      } else {
        for (var i = 0; i < dr.grids.length; i++) {
          var grid = dr.grids[i];

          if (grid.isImg) {
            bigIcon = "<i class='syDoc " + grid.value + "'></i>";
          }
        }
      }
    }

    return [bigIcon, miniIcon];
  }
}

function getRightShareCardData() {
  initSearch();
  ajaxDocHierarchyManager.getRightNewListData(flipInfoForCard, {
    entranceType: entranceType,
    isShareAndBorrowRoot: isShareAndBorrowRoot,
    frType: frType,
    resId: resId,
    projectTypeId: projectTypeId
  }, {
    success: function success(rv) {
      var cardUl = $("#other_share_card_ul");
      var cardUl_addMore_before = $("#other_share_card_ul #addMore");
      var other_share_card_ul_W = cardUl.width();
      var cloNum = other_share_card_ul_W > 1200 ? 4 : 3;

      var _liW = (other_share_card_ul_W - 16) / cloNum - 14 - 2;

      _liW = parseInt(_liW); //currentChoose

      var li = $("<li class='other_share_li' style='width:" + _liW + "px;'>").append("<div class='share_head_block'><div class='share_head'><img src=''></div><div class='share_head_name'></div></div>").append("<div class='share_file_block'></div>");
      var docInfoRow = $("<div class='share_file'></div>");
      var drList = rv.data; // cardUl.html("");

      if (drList.length > 0) {
        for (var i = 0; i < drList.length; i++) {
          var shareObj = drList[i];

          var _tempLi = li.clone();

          var _userId = shareObj.userId;
          var _userName = shareObj.userName;

          if (_userId == "0") {
            var _userHead = _ctxPath + "/apps_res/doc/images/dw.jpg";
          } else {
            var _userHead = shareObj.userHead;
          }

          var _userShareList = shareObj.userShareList;

          _tempLi.attr("userId", _userId).find(".share_head img").attr("src", _userHead).end().find(".share_head_name").text(_userName);

          if (_userShareList.length > 0) {
            for (var j = 0; j < _userShareList.length; j++) {
              var _shareDocObj = _userShareList[j];
              var _drId = _shareDocObj.drId;
              var _drName = _shareDocObj.drName;
              var _drIsFolder = _shareDocObj.drIsFolder;

              var _tempDrRow = docInfoRow.clone();

              _tempDrRow.text(_drName).attr("isFolder", _drIsFolder).attr("drId", _drId);

              _tempDrRow.click(function (e) {
                var drRow = $(e.currentTarget);
                var drId = drRow.attr("drId");
                var isFolder = drRow.attr("isFolder");

                if (isFolder == "true") {
                  folderOpenFun({
                    docLibType: "1",
                    docResource: {
                      id: drId,
                      frType: '31',
                      docLibId: ''
                    }
                  });
                } else {
                  var nowEntranceType = window.entranceType;
                  window.entranceType = new entranceEnumData().borrowOrShare;
                  fileOpenFun({
                    id: drId
                  });
                  window.entranceType = nowEntranceType;
                }

                e.stopPropagation();
                return false;
              });

              _tempLi.find(".share_file_block").append(_tempDrRow);
            }
          }

          _tempLi.click(function (e) {
            var liDom = $(e.currentTarget);
            var drId = liDom.attr("userId");
            shareFolderOpenFun(drId);
            e.stopPropagation();
            return false;
          }); // cardUl.append(_tempLi);


          cardUl_addMore_before.before(_tempLi);
        }

        if (drList.length < 20) {
          cardUl_addMore_before.hide();
        }
      } else {
        cardUl_addMore_before.hide();
      }
    }
  });
  /**
   * 返回卡片类的图标
   * @param dr 文档对象
   * @return *[] 第一位是主图片 第二位是类型小图可为空
   */

  function cardIcon(dr) {
    var bigIcon = "<span class='icon64 unknown_3_7_icon64'></span>";
    var miniIcon = "";

    if (dr.docResource.coverImageId && dr.docResource.coverImageId != "") {
      var _defaultSamllPath = _ctxPath + "/apps_res/doc/images/docIcon/";

      var openSquare = dr.openSquare;
      var imgId = dr.docResource.coverImageId;
      var imgUrl = _ctxPath + "/commonimage.do?method=showImage&size=custom&h=64&w=64&id=" + imgId;

      if (dr.docResource.mimeTypeId == "131" || dr.docResource.mimeTypeId == "132") {
        if (imgId == "-1") {
          //视频默认 理论不会出现
          imgUrl = _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + imgId;
        } else if (!imgId || imgId == "-2") {
          //音频默认
          imgUrl = _ctxPath + "/common/images/audio.png";
        } else {
          imgUrl = _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + imgId;
        }
      }

      for (var i = 0; i < dr.grids.length; i++) {
        var grid = dr.grids[i];

        if (grid.isImg) {
          miniIcon = "<img src='" + (_defaultSamllPath + (openSquare ? "share_" : "") + grid.value) + "' width='16' height='16'>";
        }
      }

      bigIcon = "<img src='" + imgUrl + "' width='64' height='64'>";
    } else {
      if (!dr.isUploadFile && dr.docResource.isFolder) {
        bigIcon = "<span class='icon64 folder_2_5_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 116) {
        bigIcon = "<span class='icon64 zip_5_2_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 51) {
        bigIcon = "<span class='icon64 map_3_2_icon64'></span>";
      } else if (!dr.docResource.isFolder && (dr.docResource.mimeTypeId == 23 || dr.docResource.mimeTypeId == 25 || dr.docResource.mimeTypeId == 101)) {
        bigIcon = "<span class='icon64 doc_2_6_icon64'></span>";
      } else if (!dr.docResource.isFolder && (dr.docResource.mimeTypeId == 24 || dr.docResource.mimeTypeId == 26 || dr.docResource.mimeTypeId == 102)) {
        bigIcon = "<span class='icon64 xls_2_7_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 105) {
        bigIcon = "<span class='icon64 txt_3_5_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 119) {
        bigIcon = "<span class='icon64 rar_5_1_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 122) {
        bigIcon = "<span class='icon64 exe_8_1_icon64'></span>";
      } else if (!dr.docResource.isFolder && (dr.docResource.mimeTypeId == 22 || dr.docResource.mimeTypeId == 107 || dr.docResource.mimeTypeId == 108)) {
        bigIcon = "<span class='icon64 html_3_6_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 104) {
        bigIcon = "<span class='icon64 pdf_3_3_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 112) {
        bigIcon = "<span class='icon64 png_4_2_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 109) {
        bigIcon = "<span class='icon64 gif_4_1_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 117) {
        bigIcon = "<span class='icon64 jpg_3_8_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 115) {
        bigIcon = "<span class='icon64 tif_4_3_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 114) {
        bigIcon = "<span class='icon64 tag_4_4_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 106) {
        bigIcon = "<span class='icon64 bmp_4_6_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 110) {
        bigIcon = "<span class='icon64 mpg_4_7_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 113) {
        bigIcon = "<span class='icon64 rm_4_8_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 1) {
        bigIcon = "<span class='icon64 col_1_1_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 2) {
        bigIcon = "<span class='icon64 edoc_1_2_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 3) {
        bigIcon = "<span class='icon64 plan_1_3_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 4) {
        bigIcon = "<span class='icon64 meeting_1_4_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 5) {
        bigIcon = "<span class='icon64 news_1_5_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 6) {
        bigIcon = "<span class='icon64 bul_1_6_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 7) {
        bigIcon = "<span class='icon64 inq_1_8_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 8) {
        bigIcon = "<span class='icon64 bbs_2_1_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 9) {
        bigIcon = "<span class='icon64 form_2_2_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 10) {
        bigIcon = "<span class='icon64 email_2_3_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.docResource.mimeTypeId == 15) {
        bigIcon = "<span class='icon64 info_2_4_icon64'></span>";
      } else if (!dr.docResource.isFolder && dr.isImg) {
        var imgId = dr.file.id;
        var imgUrl = _ctxPath + "/commonimage.do?method=showImage&size=custom&h=64&w=64&id=" + imgId;
        bigIcon = "<img src='" + imgUrl + "' width='64' height='64'>";
      }
    }

    return [bigIcon, miniIcon];
  }
}

function getRightVideoData() {
  var isSearch = flipInfoForVideo.isSearch ? "true" : "false";
  var sortId = $(".video_order_btn.current_order").attr("id");
  var sortPairs = [{
    "sortField": sortId == "videoNewlyOrder" ? "createTime" : "accessCount",
    "sortOrder": "desc"
  }];
  var _resId = resId;
  var isVideoLibList = false;
  var noData = $("<div id='videoListNoData' style='font-size: 14px;color: #666;text-align: center'><span class='noDataIcon noDataIcon1x' style='margin: 150px auto 0 auto;'></span></div>");
  noData.append($.i18n("doc.empty.data"));
  var listMethod = ajaxDocHierarchyManager.getRightNewListData;

  if ($("#allVideo.current_folder").length > 0) {
    _resId = flipInfoForVideo.docLibId;
    isVideoLibList = true; // $("#toolbar").hide();

    var option = {
      success: function success(rv) {
        var _videoCardLiTPL = $("<li class='video_li'>" + "   <div class='video_head_block'>" + "       <div class='video_head'>" + "           <img src=''>" + "           <div class='video_img_cover'>" + "               <div class='video_tag_img'><i class='syIcon sy-video'></i></div>" + "               <div class='video_time'><span>00:00</span></div>" + "           </div>" + "       </div>" + "   </div>" + "   <div class='video_info_block'>" + "       <div class='video_info_name'><span></span></div>" + "       <div class='video_info_read'><i class='syIcon sy-reading'></i><span>0</span></div>" + "       <div class='video_info_comment'><i class='syIcon sy-comment'></i><span>0</span></div>" + "    </div>" + "    <div class=\"dr_action\"><i class=\"syIcon sy-setting\"></i></div>" + "</li>");

        var drList = rv.data;
        var cardUl_addMore_before = $("#addMoreVideo");

        if (flipInfoForVideo.page == 1) {
          $("#video_card_ul > li").remove();

          if (drList.length == 0 && $("#videoListNoData").length == 0) {
            $("#video_card_ul").append(noData);
          }

          if (drList.length > 0) {
            $("#videoListNoData").remove();
          }
        } else {
          $("#videoListNoData").remove();
        }

        if (drList.length > 0) {
          for (var i = 0; i < drList.length; i++) {
            var dr = drList[i];
            nowPageDr[dr.id] = dr;

            var kageBunshin = _videoCardLiTPL.clone();

            var frName = dr.docResource.frName;
            var frCoverId = dr.docResource.coverImageId; //列表

            kageBunshin.find(".video_info_name > span").text($.i18n(frName)).attr("title", $.i18n(frName));
            kageBunshin.find(".video_info_read > span").text(dr.docResource.accessCount);
            kageBunshin.find(".video_info_comment > span").text(dr.docResource.commentCount); //展示图片

            if (!frCoverId || frCoverId == "-2") {
              //音频默认图片
              kageBunshin.find(".video_head img").attr("src", _ctxPath + "/common/images/audio.png");
            } else {
              kageBunshin.find(".video_head img").attr("src", _ctxPath + "/commonimage.do?method=showImage&size=custom&h=128&w=228&id=" + frCoverId); // kageBunshin.find(".video_head img").attr("src",_ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + frCoverId);
            }

            if (dr.docResource.mediaTimeStr != "00:00") {
              kageBunshin.find(".video_img_cover .video_time span").text(dr.docResource.mediaTimeStr);
            } //加drid


            var drId = dr.id;
            var drAcl = new DocAcl().initBoolean(dr.allAcl, dr.listAcl, dr.readAcl, dr.addAcl, dr.editAcl, dr.delAcl, dr.printAcl, dr.downloadAcl, dr.lendAcl, dr.openToZoneAcl);
            var p = drAcl.toPotentString(false);
            var noAcl = drAcl.toPotentString(false) === "0000000000";
            kageBunshin.attr("id", "video_" + drId).attr("drId", drId).attr("da", p); // kageBunshin.find(".dr_action").hide();

            kageBunshin.click(function () {
              if (isVideoLibList) {
                var docId = $(this).attr("drId");
                fileOpenFun({
                  id: docId
                });
              }
            });

            if (!noAcl) {
              //小齿轮
              kageBunshin.find(".dr_action i").click(function (event) {
                var docId = $(this).parents("li").attr("drId");
                docAction(this, docId, event);
                event.stopPropagation();
              });
            } else {
              kageBunshin.find(".dr_action").hide();
              kageBunshin.find(".checkboxTag:checkbox").prop("disabled", true);
            } // cardUl.append(kageBunshin);


            cardUl_addMore_before.before(kageBunshin);

            if (drList.length < 20) {
              cardUl_addMore_before.hide();
            } else {
              cardUl_addMore_before.show();
            }
          }
        } else {
          cardUl_addMore_before.hide();
        }
      }
    };
    ajaxDocHierarchyManager.allFileInVideoLab(flipInfoForVideo, {
      entranceType: entranceType,
      isShareAndBorrowRoot: "false",
      frType: frType,
      resId: _resId,
      isSearch: isSearch,
      searchCondition: flipInfoForVideo._condition,
      searchValue1: flipInfoForVideo._value1,
      searchValue2: flipInfoForVideo._value2,
      projectTypeId: '',
      sortPairs: sortPairs
    }, option);
  } else {
    $("#toolbar").show();
    var option = {
      success: function success(rv) {
        var _videoCardLiTPL = $("<li class='video_li'>" + "   <div class='video_head_block'>" + "   <span class='ctpUiCheckbox checkboxTag'><input class='checkboxTag' type='checkbox'><label class='checkboxTag'><i class='checkboxTag'></i></label></span>" + "       <div class='video_head'>" + "           <img src=''>" + "           <div class='video_img_cover'>" + "               <div class='video_tag_img'><i class='syIcon sy-video'></i></div>" + "               <div class='video_time'><span>00:00</span></div>" + "           </div>" + "       </div>" + "   </div>" + "   <div class='video_info_block'>" + "       <div class='video_info_name'><span></span></div>" + "       <div class='video_info_read'><i class='syIcon sy-reading'></i><span>0</span></div>" + "       <div class='video_info_comment'><i class='syIcon sy-comment'></i><span>0</span></div>" + "    </div>" + "    <div class=\"dr_action\"><i class=\"syIcon sy-setting\"></i></div>" + "</li>");

        var drList = rv.data;
        var cardUl_addMore_before = $("#addMoreVideo");

        if (flipInfoForVideo.page == 1) {
          $("#video_card_ul > li").remove();

          if (drList.length == 0 && $("#videoListNoData").length == 0) {
            $("#video_card_ul").append(noData);
          }

          if (drList.length > 0) {
            $("#videoListNoData").remove();
          }
        } else {
          $("#videoListNoData").remove();
        }

        if (drList.length > 0) {
          for (var i = 0; i < drList.length; i++) {
            var dr = drList[i];
            nowPageDr[dr.id] = dr;

            var kageBunshin = _videoCardLiTPL.clone();

            var frName = dr.docResource.frName;
            var frCoverId = dr.docResource.coverImageId; //列表

            kageBunshin.find(".video_info_name > span").text($.i18n(frName)).attr("title", $.i18n(frName));
            kageBunshin.find(".video_info_read > span").text(dr.docResource.accessCount);
            kageBunshin.find(".video_info_comment > span").text(dr.docResource.commentCount); //展示图片

            if (!frCoverId || frCoverId == "-2") {
              //音频默认图片
              kageBunshin.find(".video_head img").attr("src", _ctxPath + "/common/images/audio.png");
            } else {
              kageBunshin.find(".video_head img").attr("src", _ctxPath + "/commonimage.do?method=showImage&size=custom&h=128&w=228&id=" + frCoverId); // kageBunshin.find(".video_head img").attr("src",_ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + frCoverId);
            } //加drid


            var drId = dr.id;
            var drAcl = new DocAcl().initBoolean(dr.allAcl, dr.listAcl, dr.readAcl, dr.addAcl, dr.editAcl, dr.delAcl, dr.printAcl, dr.downloadAcl, dr.lendAcl, dr.openToZoneAcl);
            var p = drAcl.toPotentString(false);
            var noAcl = drAcl.toPotentString(false) === "0000000000";
            kageBunshin.attr("id", "video_" + drId).attr("drId", drId).attr("da", p);
            kageBunshin.find(".ctpUiCheckbox input").attr("id", "video_" + drId);
            kageBunshin.find(".ctpUiCheckbox label").attr("for", "video_" + drId);

            if (dr.docResource.mediaTimeStr != "00:00") {
              kageBunshin.find(".video_img_cover .video_time span").text(dr.docResource.mediaTimeStr);
            }

            kageBunshin.click(function (event) {
              if (isVideoLibList) {
                var docId = $(this).attr("drId");
                fileOpenFun({
                  id: docId
                });
              } else {
                var obj = event.srcElement ? event.srcElement : event.target; //点击的是input

                if (obj && $(obj).attr("class") && $(obj).attr("class").indexOf("checkboxTag") > -1) {
                  //选中管理的事件
                  var potentStr = $(this).attr("da");
                  var acl = new DocAcl().initStr(potentStr);
                  var noAcl = acl.toPotentString() === "0000000000";

                  if (noAcl) {
                    return;
                  } else {
                    if ($(this).hasClass("video_choose")) {
                      $(this).find("input[type='checkbox']").prop('checked', false);
                      $(this).removeClass("video_choose");
                    } else {
                      $(this).find("input[type='checkbox']").prop('checked', true);
                      $(this).addClass("video_choose");
                    } // $(this).toggleClass("video_choose",!$(this).hasClass("video_choose"));


                    mergeAcl();
                  }
                } else {
                  //依然是点击事件
                  var docId = $(this).attr("drId");
                  fileOpenFun({
                    id: docId
                  });
                }
              }
            });

            if (!noAcl) {
              //小齿轮
              kageBunshin.find(".dr_action i").click(function (event) {
                var docId = $(this).parents("li").attr("drId");
                docAction(this, docId, event);
                event.stopPropagation();
              });
            } else {
              kageBunshin.find(".dr_action").hide();
              kageBunshin.find(".checkboxTag:checkbox").prop("disabled", true);
            } // cardUl.append(kageBunshin);


            cardUl_addMore_before.before(kageBunshin);

            if (drList.length < 20) {
              cardUl_addMore_before.hide();
            } else {
              cardUl_addMore_before.show();
            }
          }
        } else {
          cardUl_addMore_before.hide();
        }
      }
    };
    ajaxDocHierarchyManager.getRightNewListData(flipInfoForVideo, {
      entranceType: entranceType,
      isShareAndBorrowRoot: "false",
      frType: frType,
      resId: _resId,
      isSearch: isSearch,
      searchCondition: flipInfoForVideo._condition,
      searchValue1: flipInfoForVideo._value1,
      searchValue2: flipInfoForVideo._value2,
      projectTypeId: '',
      sortPairs: JSON.stringify(sortPairs)
    }, option);
  }
}
/**
 *
 * @param aclData 权限相关数据
 * 其中所需条件为
 * depAdminSize
 * isAllowArchivePigeonhole
 * isPrivateLib, folderEnabled, a6Enabled, officeEnabled, uploadEnabled, isGroupLib, isEdocLib, isShareAndBorrowRoot,
 */
// 新增代码开始


var topToolBar = null; //新建系列
// 新增代码结束 （原有的initToolBar里面的初始化变量删除）

function initToolBar() {
  var menuList = [];
  $("#toolbar").html("");
  $("#toolbar").css("visibility", "hidden"); // 新增代码开始

  if (topToolBar) topToolBar = null;

  if (document.querySelector && document.querySelector('.toolbar_l')) {
    [].slice.call(document.querySelector('.toolbar_l').getElementsByTagName('*')).forEach(function (v) {
      SeeUtils.removeAttrEl(v, 'onmouseenter');
      SeeUtils.removeAttrEl(v, 'onmouseleave');
      SeeUtils.removeAttrEl(v, 'onclick');
      SeeUtils.removeAttrEl(v, 'bakonmouseenter');
      SeeUtils.removeAttrEl(v, 'bakonmouseleave');
      SeeUtils.removeAttrEl(v, 'bakonmouseover');
      SeeUtils.removeAttrEl(v, 'bakonmouseout');
    });
  } //  新增代码结束
  //新建系列


  var menu_create = {
    id: "new",
    name: $.i18n("common.operate.new"),
    className: "ico16",
    subMenu: [{
      id: "html",
      name: $.i18n("doc.menu.new.document.label"),
      className: "ico16 html_16",
      click: function click() {
        createDoc(10);
      }
    }]
  };

  if (!($.ctx.hasPlugin("officeOnlineEdit") || $.ctx.hasPlugin("officeOnlinePreview")) && !$.ctx.hasPlugin("domestic")) {
    //如果没有office插件
    getA8Top().installDoc = false;
    getA8Top().installXls = false;
    getA8Top().installWps = false;
    getA8Top().installEt = false;
  } else {
    //不在根据注册表控制，直接放开
    getA8Top().installDoc = true;
    getA8Top().installXls = true;
    getA8Top().installWps = true;
    getA8Top().installEt = true;
  }

  var menu_doc = {
    id: "misWord",
    name: $.i18n("doc.menu.new.word.label"),
    className: "ico16 doc_16",
    click: function click() {
      createDoc(41);
    }
  };
  menu_create.subMenu.push(menu_doc);
  var menu_doc = {
    id: "misExcel",
    name: $.i18n("doc.menu.new.excel.label"),
    className: "ico16 doc_16",
    click: function click() {
      createDoc(42);
    }
  };
  menu_create.subMenu.push(menu_doc);
  var menu_doc = {
    id: "wpsword",
    name: $.i18n("common.body.type.wpsword.label"),
    className: "ico16 wps_16",
    click: function click() {
      createDoc(43);
    }
  };
  menu_create.subMenu.push(menu_doc);
  var menu_doc = {
    id: "wpsexcel",
    name: $.i18n("common.body.type.wpsexcel.label"),
    className: "ico16 xls2_16",
    click: function click() {
      createDoc(44);
    }
  };
  menu_create.subMenu.push(menu_doc); //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start

  var menu_doc = {
    id: "Ofd",
    name: $.i18n("doc.menu.new.ofd.label"),
    className: "ico16 office46_16",
    click: function click() {
      createDoc(46);
    }
  }; //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end

  menu_create.subMenu.push(menu_doc);
  var menu_folder = {
    id: "xxxx",
    name: $.i18n("doc.menu.new.folder.label"),
    className: "ico16 xls2_16",
    click: function click() {
      createFolder();
    }
  };
  var menu_folder_edoc = {
    id: "xxxx",
    name: $.i18n("doc.menu.new.folder.edoc"),
    className: "ico16 xls2_16",
    click: function click() {
      createEdocFolder();
    }
  };

  if (isEdocLib == 'true') {
    menu_create.subMenu.push(menu_folder_edoc);
  } else {
    menu_create.subMenu.push(menu_folder);
  } // “发送到”系列


  var menu_sendto = {
    id: "sendto",
    name: $.i18n("doc.menu.sendto.label"),
    className: "ico16 forwarding_16",
    subMenu: []
  };
  var favorite = {
    id: "favorite",
    name: $.i18n("doc.menu.sendto.favorite.label"),
    click: function click() {
      var params = buildSecretParams(sendToDoc);
      dealDeviceSecret(params);
    }
  };
  var deptDoc = {
    id: "deptDoc",
    name: $.i18n("doc.menu.sendto.deptDoc.label"),
    click: function click() {
      var params = buildSecretParams(sendToDeptDoc);
      dealDeviceSecret(params);
    }
  };
  var publish = {
    id: "accountDoc",
    name: $.i18n("doc.menu.sendto.space.label"),
    click: function click() {
      var params = buildSecretParams('sendToDocForAccount');
      dealDeviceSecret(params);
    }
  };
  var group = {
    id: "groupDoc",
    name: $.i18n("doc.menu.sendto.group" + govLabel),
    click: function click() {
      var params = buildSecretParams('sendToDocForGroup');
      dealDeviceSecret(params);
    }
  };
  var learning = {
    id: "learning",
    name: $.i18n("doc.menu.sendto.learning.label"),
    click: function click() {
      var params = buildSecretParams(sendToPersonalLearnForDeviceSecret);
      dealDeviceSecret(params);
    }
  };
  var deptLearn = {
    id: "deptLearn",
    name: $.i18n("doc.menu.sendto.deptLearn.label"),
    click: function click() {
      var params = buildSecretParams(sendToDeptLearn);
      dealDeviceSecret(params);
    }
  };
  var accountLearn = {
    id: "accountLearn",
    name: $.i18n("doc.menu.sendto.accountLearn.label"),
    click: function click() {
      var params = buildSecretParams('sendToLearnForAccount');
      dealDeviceSecret(params);
    }
  };
  var groupLearn = {
    id: "groupLearn",
    name: $.i18n("doc.menu.sendto.group.learning"),
    click: function click() {
      var params = buildSecretParams('sendToLearnForGroup');
      dealDeviceSecret(params);
    }
  };
  var link = {
    id: "link",
    name: $.i18n("doc.menu.sendto.other.label"),
    click: function click() {
      var params = buildSecretParams('link');
      dealDeviceSecret(params);
    }
  };
  menu_sendto.subMenu.push(favorite);
  menu_sendto.subMenu.push(deptDoc);
  menu_sendto.subMenu.push(publish);
  menu_sendto.subMenu.push(group);
  menu_sendto.subMenu.push(learning);
  menu_sendto.subMenu.push(deptLearn);
  menu_sendto.subMenu.push(accountLearn);
  menu_sendto.subMenu.push(groupLearn);
  menu_sendto.subMenu.push(link); // “高级”系列

  var menu_advance = {
    id: "forward",
    name: $.i18n("common.advance.label"),
    className: "ico16 advanced_16",
    subMenu: []
  };
  var col = {
    id: "col",
    name: $.i18n("common.toolbar.transmit.col.label"),
    click: function click() {
      sendToCollFromMenu();
    }
  };
  menu_advance.subMenu.push(col); //A6s去掉转发邮件

  var mail = {
    id: "mail",
    name: $.i18n("common.toolbar.transmit.mail.label"),
    click: function click() {
      sendToMailFromMenu();
    }
  };
  menu_advance.subMenu.push(mail);
  var orderBtn = {
    id: "orderBtn",
    name: $.i18n("doc.menu.sort.label"),
    click: function click() {
      docResourcesOrder(resId, frType);
    }
  };
  menu_advance.subMenu.push(orderBtn);
  var downloadFile = {
    id: "downloadFile",
    name: $.i18n("doc.menu.downloadFile.label"),
    click: function click() {
      var params = buildSecretParams(docBatchDownload);
      dealDeviceSecret(params);
    }
  };
  menu_advance.subMenu.push(downloadFile);
  var pigArchive = {
    id: "pigArchive",
    name: $.i18n("doc.archive.sync.js"),
    click: function click() {
      pigeonholeArchive();
    }
  };
  menu_advance.subMenu.push(pigArchive); //添加文档日志按钮(管理员可以有该权限查看,即所有权限.我的文档不能查看)

  var docAllLogs = {
    id: "docAllLogs",
    name: $.i18n("doc.jsp.log.title"),
    click: function click() {
      logView(resId, 'true');
    }
  };
  menu_advance.subMenu.push(docAllLogs); //添加修改密级按钮

  var menu_setSecretLevel = {
    id: "setSecretLevel",
    name: $.i18n("doc.menu.set.secretLevel"),
    click: function click() {
      var params = buildSecretParams(setSecretLevels);
      dealDeviceSecret(params);
    }
  };
  menu_advance.subMenu.push(menu_setSecretLevel); // “上传”系列

  var menu_upload_all = {
    id: "uploadAll",
    name: $.i18n("doc.upload.all"),
    className: "ico16 advanced_16",
    subMenu: []
  }; // “上传”

  var menu_upload = {
    id: "uploadFile",
    name: $.i18n("common.upload.file.label"),
    click: function click() {
      uploadFileForDoc(null, 'uploadFileForDocCallBack');
    }
  }; // “音视频上传”

  var menu_video_upload = {
    id: "uploadMedia",
    name: $.i18n("doc.media.upload"),
    click: function click() {
      videoUpload();
    }
  };
  menu_upload_all.subMenu.push(menu_upload);
  menu_upload_all.subMenu.push(menu_video_upload); // “移动”

  var menu_move = {
    id: "move",
    name: $.i18n("common.move.label"),
    className: "ico16 move_16",
    click: function click() {
      var params = buildSecretParams('move');
      dealDeviceSecret(params);
    }
  }; // “删除”

  var menu_del = {
    id: "del",
    name: $.i18n("common.toolbar.delete.label"),
    className: "ico16 del_16",
    click: function click() {
      var params = buildSecretParams(delDoc);
      dealDeviceSecret(params); //delF('topOperate','topOperate');
    }
  }; //归档

  var menu_archive = {
    id: "archive",
    name: $.i18n("archive.button.message"),
    className: "ico16 infoArchive_16",
    click: function click() {
      archiveOtherSystem(); //delF('topOperate','topOperate');
    }
  }; // “推送至外系统”

  var push_out_sys = {
    id: "pushOutSys",
    name: $.i18n("doc.push.out.sys"),
    click: function click() {
      pushOutSys(null, 'uploadFileForDocCallBack');
    }
  };

  if (!$.ctx.hasPlugin("ocip")) {
    //ocip插件是否开启
    getA8Top().installOcip = false;
  } else {
    getA8Top().installOcip = true;
  }

  menuList.push(menu_create);
  menuList.push(menu_upload_all);
  menuList.push(menu_sendto);
  menuList.push(menu_move);
  menuList.push(menu_del);
  menuList.push(menu_advance); //导出按钮动态接口埋点

  if (customManage) {
    customManage.methodEmit('app-initDocExport', {
      MenuList: menuList,
      resId: resId
    });
  }

  if (isV5Member && $.ctx.hasPlugin("docarchive")) {
    if (window.resId != "20001" && window.resId != "20002" && window.isShareAndBorrowRoot == "false") {
      var hasArchiveRole = callBackendMethod("docArchiveManager", "hasArchiveRole");
      var hasArchiveConfig = callBackendMethod("docArchiveManager", "hasArchiveConfig");

      if (hasArchiveRole && hasArchiveConfig) {
        menuList.push(menu_archive);
      }
    }
  }

  if (isV5Member && $.ctx.hasPlugin("ocip")) {
    menuList.push(push_out_sys);
  } // “视频库toolbar小齿轮”


  var menu_video_folder = {
    id: "video_folderManage",
    name: $.i18n("doc.menu.videofolder.label"),
    className: "ico16 batch_edit_16",
    subMenu: [{
      id: "video_CreateFolder",
      name: $.i18n("doc.menu.videofolder.new.label"),
      click: function click() {
        createFolder();
      }
    }, {
      id: "video_RenameFolder",
      name: $.i18n("doc.menu.videofolder.rename.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          rename(folderId);
        }
      }
    }, {
      id: "video_DeleteFolder",
      name: $.i18n("doc.menu.videofolder.del.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          delDoc(folderId, flipInfoForVideo.docLibId);
        }
      }
    }, {
      id: "video_SortFolder",
      name: $.i18n("doc.menu.videofolder.sort.label"),
      click: function click() {
        docResourcesOrder(flipInfoForVideo.docLibId, frType);
      }
    }, {
      id: "video_ShareFolder",
      name: $.i18n("doc.menu.videofolder.share.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          var folderObj = nowPageDr[folderId];

          if (folderObj) {
            properties(folderId, "share_pub");
          }
        }
      }
    }, {
      id: "video_Acl",
      name: $.i18n("doc.menu.aclapply.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          var folderObj = nowPageDr[folderId];

          if (folderObj) {
            aclApply(folderId);
          }
        }
      }
    }, {
      id: "video_SubscribeFolder",
      name: $.i18n("doc.menu.subscribe.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          var folderObj = nowPageDr[folderId];

          if (folderObj) {
            alertview(folderId);
          }
        }
      }
    }, {
      id: "video_PropertyFolder",
      name: $.i18n("common.attribute.label"),
      click: function click() {
        var nowFolder = $(".current_folder:not(#allVideo)");

        if (nowFolder.length > 0) {
          var folderId = nowFolder.attr("drid");
          var folderObj = nowPageDr[folderId];

          if (folderObj) {
            properties(folderId, "property");
          }
        }
      }
    }]
  };

  if (isV5Member) {
    menuList.push(menu_video_folder);
  }

  topToolBar = $("#toolbar").toolbar({
    size: 'L',
    toolbar: menuList
  }); //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start

  var params = {
    all: allAcl,
    list: listAcl,
    read: readAcl,
    add: addAcl,
    edit: editAcl,
    del: delAcl,
    lend: lendAcl,
    openToZone: openToZoneAcl,
    print: printAcl,
    download: downloadAcl,
    isPrivateLib: isPrivateLib,
    folderEnabled: folderEnabled,
    a6Enabled: a6Enabled,
    officeEnabled: officeEnabled,
    ofdEnabled: ofdEnabled,
    uploadEnabled: uploadEnabled,
    isGroupLib: isGroupLib,
    isEdocLib: isEdocLib,
    isVideoLib: isVideoLib,
    isShareAndBorrowRoot: isShareAndBorrowRoot,
    onlyA6: onlyA6 + "",
    onlyA6s: onlyA6s + ""
  };
  checkBarAcl(params); //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end
  //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end

  $("#toolbar").css("visibility", "visible");
}

function pushOutSys() {
  var ids = getSelectRows();

  if (ids.length == 0) {
    $.alert($.i18n("DocLang.doc_jsp_larning_alert"));
    return;
  }
  /* if($.ctx.hasPlugin("ocip")){
       for(var i = 0 ; ids.length > i; i++) {
           var drObj = nowPageDr[ids[i]];
           if(drObj.docResource.isFolder || drObj.isLink || drObj.isPig){
               $.alert("只能选择文档");
               return;
           }
           if(drObj.docResource.mimeTypeId==51 || drObj.docResource.mimeTypeId == 52 ||
               drObj.docResource.mimeTypeId== 2 || drObj.docResource.mimeTypeId==4){
               $.alert("不能选择关联文档、公文、会议");
               return;
           }
       }
       getA8Top().$.selectPeople({
           panels: 'Account,OcipOrganization',
           selectType: 'Account',
           // TODO 该处为新增属性，待后续扩展使用
           supportOcip: true,
           needConvertLocal: false,
           callback: function (ret) {
               post2Controller(ret.value, ids);
           }
       });
   }else{
       alert("ocip插件未开启");
   }
  */


  for (var i = 0; ids.length > i; i++) {
    var drObj = nowPageDr[ids[i]];

    if (drObj.docResource.isFolder || drObj.isLink || drObj.isPig) {
      $.alert("只能选择文档");
      return;
    }

    if (drObj.docResource.mimeTypeId == 51 || drObj.docResource.mimeTypeId == 52 || drObj.docResource.mimeTypeId == 2 || drObj.docResource.mimeTypeId == 4) {
      $.alert("不能选择关联文档、公文、会议");
      return;
    }

    if (drObj.docResource.hasAttachments == 1) {
      var x = confirm("文档中存在关联文档或本地文件，其中关联文档不可交换，是否继续");

      if (x == false) {
        return;
      }
    }
  }

  getA8Top().$.selectPeople({
    panels: 'Account,OcipOrganization',
    selectType: 'Account',
    // TODO 该处为新增属性，待后续扩展使用
    supportOcip: true,
    needConvertLocal: false,
    callback: function callback(ret) {
      post2Controller(ret.value, ids);
    }
  });
}
/**
 * 提交至后台
 * selectEdUnit:选中接收方id
 * docIds：选中文档
 */


function post2Controller(selectEdUnit, docIds) {
  $.ajax({
    type: "post",
    url: "/seeyon/ocipDoc.do?method=send2ExtSystem",
    data: {
      extUnit: selectEdUnit,
      docIds: docIds.toString()
    },
    cache: false,
    async: true,
    dataType: "html",
    success: function success(rtn) {
      if ('success' == rtn) {
        //alert('交换成功');由于这里只能知道交换数据发出，并不知道已经交换成功，所以暂不提示交换成功
        alert('交换数据已发送');
        window.location.reload();
      } else {
        alert('数据交换失败');
      }
    }
  });
}

function initDrag() {
  $(".drag_block").draggable({
    axis: "x",
    drag: function drag(event, dom) {
      resizeLayout(dom.position.left);
    },
    stop: function stop(event, dom) {
      resizeLayout(dom.position.left);
    }
  });
}

function initBodyEvent() {
  $("body").click(function () {
    onlyHideHistory();
  });
}

function toggleShowHide() {
  if ($("#hidden_side").hasClass("middle_hide")) {
    hideTree();
  } else {
    showTree();
  }
}

function showTree() {
  resizeLayout(140);
  $("#hidden_side").toggleClass("middle_hide", true).attr("src", _ctxPath + "/common/images/shou1.jpg");
}

function hideTree() {
  resizeLayout(0);
  $("#hidden_side").toggleClass("middle_hide", false).attr("src", _ctxPath + "/common/images/shou.jpg");
}

function resizeLayout(left) {
  $(".left_tree_block").css("width", left + "px");
  $(".drag_block").css("left", left + "px");
  $(".right_table_block").css("left", left + 5 + "px");
}

function hideMiniMenu() {
  $(".doc_menu").remove();
}

var searchObj;
var _commonSearchObj = {};

function initSearch() {
  var right = 16;
  var top = 66;

  if (searchObj && searchObj.g && searchObj.g.destroySearch) {
    searchObj.g.destroySearch();
  }

  var commonSearch = [];

  if (!isV5Member) {
    commonSearch = [{
      id: 'frName',
      name: 'frName',
      type: 'input',
      text: $.i18n('doc.jsp.knowledge.query.name'),
      value: 'frName'
    }, {
      id: "keyWords",
      name: "keyWords",
      type: "input",
      text: $.i18n('doc.metadata.def.keywords'),
      value: "keyWords"
    }];
  } else if (isVideoLib != "true") {
    // 无效参数逻辑控制
    if (window.docLibId == "undefined" || window.docLibId == null) {
      return;
    }

    _commonSearchObj = {};
    var requestCaller = new XMLHttpRequestCaller(this, "ajaxDocLibManager", "getSearchConditions4DocLibForAjax", false);
    requestCaller.addParameter(1, "Long", window.docLibId);
    requestCaller.addParameter(2, "Byte", window.docLibType);
    var ds = requestCaller.serviceRequest();

    if (ds) {
      ds = JSON.parse(ds);

      for (var i = 0; i < ds.length; i++) {
        var searchItem = ds[i];
        var typeId = searchItem.id;
        var type = searchItem.type;
        var physicalName = searchItem.physicalName;
        var showName = searchItem.showName;
        _commonSearchObj[physicalName] = type + "";
        var _searchParam = {
          id: physicalName,
          name: physicalName,
          type: 'input',
          text: $.i18n(searchItem.showName),
          value: searchItem.physicalName
        };

        if ('frType' == physicalName) {
          _searchParam.type = 'select';
          _searchParam.codecfg = "codeType:'java',codeId:'com.seeyon.apps.doc.enums.ContentTypeEnums',isPersonalLib:'" + window.isPrivateLib + "'";
        } else if (type == "4" || type == "5") {
          _searchParam.type = 'datemulti';
          _searchParam.ifFormat = '%Y-%m-%d';
        } else if (type == "7") {
          _searchParam.type = 'select';
          _searchParam.items = [{
            text: $.i18n('common.yes'),
            value: 'true'
          }, {
            text: $.i18n('common.no'),
            value: 'false'
          }];
        } else if (type == "8") {
          _searchParam.comp = "type:'selectPeople',mode:'open',panels:'Department,Team',selectType:'Member',maxSize:'1',showMe:'true'";
        } else if (type == "9") {
          _searchParam.type = "selectPeople";
          _searchParam.comp = "type:'selectPeople',mode:'open',panels:'Department,Team',selectType:'Department',maxSize:'1',showMe:'true'";
        } else if (type == "13" || type == "14" || type == "15") {
          _searchParam.type = 'select';
          var itemList = searchItem.metadataOption; // 如果用户没在公文元素设置内绑定列表类型的枚举值, 这里itemList会变成undefine

          if (itemList != undefined) {
            _searchParam.items = [];

            for (var j = 0; j < itemList.length; j++) {
              _searchParam.items.push({
                text: itemList[j].optionItem,
                value: itemList[j].id
              });
            }
          }
        } else if (typeId == '129' || typeId == '130' || typeId == '133' || typeId == '134' || typeId == '13') {
          _searchParam.type = 'select';
          var itemList = searchItem.metadataOption;
          _searchParam.items = [];

          for (var j = 0; j < itemList.length; j++) {
            _searchParam.items.push({
              text: itemList[j].optionItem,
              value: itemList[j].id
            });
          }
        }

        commonSearch.push(_searchParam);
      }
    } else {
      commonSearch = [{
        id: 'frName',
        name: 'frName',
        type: 'input',
        text: $.i18n('doc.jsp.knowledge.query.name'),
        value: 'frName'
      }, {
        id: 'frType',
        name: 'frType',
        type: 'select',
        text: $.i18n('common.content.type.label'),
        value: 'frType',
        codecfg: "codeType:'java',codeId:'com.seeyon.apps.doc.enums.ContentTypeEnums'"
      }, {
        id: 'keyWords',
        name: 'keyWords',
        type: 'input',
        text: $.i18n('doc.jsp.knowledge.query.key'),
        value: 'keyWords'
      }, {
        id: 'createTime',
        name: 'createTime',
        type: 'datemulti',
        text: $.i18n('common.date.createdate.label'),
        value: 'createTime',
        ifFormat: '%Y-%m-%d'
      }, {
        id: 'createUserId',
        name: 'createUserId',
        type: 'input',
        text: $.i18n('common.creater.label'),
        value: 'createUserId',
        comp: "type:'selectPeople',mode:'open',panels:'Department,Team',selectType:'Member',maxSize:'1',showMe:'true'"
      }, {
        id: 'reference1',
        name: 'reference1',
        type: 'selectPeople',
        text: $.i18n('common.sender.label'),
        value: 'reference1',
        comp: "type:'selectPeople',mode:'open',panels:'Department,Team',selectType:'Member',maxSize:'1',showMe:'true'"
      }, {
        id: 'date1',
        name: 'date1',
        type: 'datemulti',
        text: $.i18n('common.date.senddate.label'),
        value: 'date1',
        ifFormat: '%Y-%m-%d'
      }];
    }
  } else {
    commonSearch = [{
      id: 'frName',
      name: 'frName',
      type: 'input',
      text: $.i18n('doc.jsp.knowledge.query.name'),
      value: 'frName'
    }, {
      id: 'createTime',
      name: 'createTime',
      type: 'datemulti',
      text: $.i18n('common.date.createdate.label'),
      value: 'createTime',
      ifFormat: '%Y-%m-%d'
    }, {
      id: 'createUserId',
      name: 'createUserId',
      type: 'input',
      text: $.i18n('common.creater.label'),
      value: 'createUserId',
      comp: "type:'selectPeople',mode:'open',panels:'Department,Team',selectType:'Member',maxSize:'1',showMe:'true'"
    }];
  }

  $("#advanced_search_block").remove();

  if (window.resId != "20002") {
    if (window.isPrivateLib == "false" && isVideoLib != "true" && isV5Member) {
      //公共库有高级搜索
      $("body").append("<div id=\"advanced_search_block\"><a id=\"combinedQuery\" class=\"common_button\" onclick=\"advancedSearch();\">" + $.i18n("common.advance.label") + "</a></div>");
      right = right + 10 + $("#advanced_search_block").width();
    } // 处理文档中心搜索移上去隐藏表格和列表切换


    if (isVideoLib == "true") {
      $("#typeSwitch").hide();
      top = 12;
    } else {
      $("#typeSwitch").show();
    }

    searchObj = $.searchCondition({
      size: "L",
      top: top,
      right: right,
      searchHandler: function searchHandler() {
        var searchCondition = searchObj.g.getReturnValue();

        if (searchCondition) {
          var _condition = searchCondition.condition;
          var _value1 = "";
          var _value2 = "";

          if (searchCondition.value !== null) {
            if (_typeof(searchCondition.value) == "object") {
              _value1 = searchCondition.value[0];
              _value2 = searchCondition.value[1];
            } else if (typeof searchCondition.value == "string") {
              _value1 = searchCondition.value;
            }
          }

          if (isVideoLib == "true") {
            flipInfoForVideo.page = 1;
            flipInfoForVideo.pageNo = 20;
            flipInfoForVideo._condition = _condition;
            flipInfoForVideo._value1 = _value1;
            flipInfoForVideo._value2 = _value2;
            flipInfoForVideo.isSearch = true;
            getRightVideoData();
            initToolBar();
          } else {
            freshTableOrCard(_condition, _value1, _value2);
          }
        } //$('#myajaxgridbar').ajaxgridbarLoad(mySearchObj);

      },
      conditions: commonSearch,
      // 新增代码开始
      isNotToolbar: true // 新增代码结束

    });
    searchObj.g.setCondition("frName", "");
  }
}

function initVideoFolder(currentFolderId, isInitFile) {
  //,sortPairs:[{sortField: "createTime",sortOrder:"ASC"}]
  ajaxDocHierarchyManager.getRightNewListData({
    page: -1,
    size: -1
  }, {
    entranceType: entranceType,
    isShareAndBorrowRoot: "false",
    frType: frType,
    resId: resId,
    isSearch: "false",
    searchCondition: null,
    searchValue1: null,
    searchValue2: null,
    projectTypeId: projectTypeId
  }, {
    success: function success(rv) {
      var headBlock = $("#video_header_block"); //重置为初始状态

      if (headBlock.hasClass("has_more")) {
        headBlock.css("height", ""); //+20是folderUlH的上下margin合集

        $("#video_order_block").css("top", "");
        $("#video_card_ul").css("top", "");
      }

      headBlock.attr("class", "video_header_block").show();

      var _videoFolderTPL = $("<li class='video_folder_li'><span></span></li>");

      var folderUl = $(".video_folder_list");
      folderUl.find("li:not(#allVideo)").remove();
      $("#allVideo").attr("drid", resId);
      var folderList = rv.data; //没有分类的时候，隐藏全部

      if (folderList.length == 0) {
        headBlock.hide();
      }

      if (typeof currentFolderId != "undefined" && currentFolderId != null) {
        var requestCaller = new XMLHttpRequestCaller(this, "ajaxDocHierarchyManager", "docResourceExist", false);
        requestCaller.addParameter(1, "Long", currentFolderId);
        var flag = requestCaller.serviceRequest();

        if (flag == 'false') {
          currentFolderId = null;
        }
      }

      $(".current_folder").toggleClass("current_folder", false);

      for (var i = 0; i < folderList.length; i++) {
        var folderData = folderList[i];
        nowPageDr[folderData.docResource.id] = folderData;

        var _tempFolder = _videoFolderTPL.clone();

        _tempFolder.attr("drid", folderData.docResource.id);

        _tempFolder.attr("title", folderData.docResource.frNameEscapeJS).find("span").text(folderData.docResource.frNameEscapeJS);

        if (typeof currentFolderId != "undefined" && currentFolderId != null && folderData.docResource.id == currentFolderId) {
          _tempFolder.toggleClass("current_folder", true);

          currentFolderId = folderData.docResource.id;
        }

        _tempFolder.click(function () {
          var drId = $(this).attr("drid");
          var _drObj = nowPageDr[drId];
          $(".current_folder").toggleClass("current_folder", false);
          $(this).toggleClass("current_folder", true);
          videoFolderOpenFun(_drObj);
          var liUl = $(".video_folder_list");
          var hBlock = $("#video_header_block");
          var liNum = liUl.find(".video_folder_li").length;
          var ulHeight = liUl.height();

          if (ulHeight > 40) {
            //有滚动条
            hBlock.attr("class", "video_header_block has_more");
            ulHeight = ulHeight > 120 ? 120 : ulHeight;
            hBlock.css("height", ulHeight + 20); //+20是folderUlH的上下margin合集

            $("#video_order_block").css("top", ulHeight + 20 + "px");
            $("#video_card_ul").css("top", ulHeight + 65 + 20 + "px");
          } else if (liNum.length == 0) {
            //没有分类的时候，隐藏全部
            $("#video_order_block").css("top", "0px");
            $("#video_card_ul").css("top", "65px");
          } else {
            //刚好一行的时候
            hBlock.css("height", ""); //+20是folderUlH的上下margin合集

            $("#video_order_block").css("top", "");
            $("#video_card_ul").css("top", "");
          }
        });

        folderUl.append(_tempFolder);
      }

      if (isInitFile) {
        if (currentFolderId && nowPageDr[currentFolderId]) {
          videoFolderOpenFun(nowPageDr[currentFolderId]);
        } else {
          $(".current_folder").toggleClass("current_folder", false);
          $("#allVideo").toggleClass("current_folder", true);
          getAllVideoInLib();
        }
      }

      var folderUlH = folderUl.height();

      if (folderUlH > 40) {
        //有滚动条
        headBlock.attr("class", "video_header_block has_more");
        folderUlH = folderUlH > 120 ? 120 : folderUlH;
        headBlock.css("height", folderUlH + 20); //+20是folderUlH的上下margin合集

        $("#video_order_block").css("top", folderUlH + 20 + "px");
        $("#video_card_ul").css("top", folderUlH + 65 + 20 + "px");
      } else if (folderList.length == 0) {
        //没有分类的时候，隐藏全部
        $("#video_order_block").css("top", "0px");
        $("#video_card_ul").css("top", "65px");
      } else {
        //刚好一行的时候
        headBlock.css("height", ""); //+20是folderUlH的上下margin合集

        $("#video_order_block").css("top", "");
        $("#video_card_ul").css("top", "");
      }

      if (!isInitFile) {
        initToolBar();
      }
    }
  });
} // ----toolbar 权限控制:start----
//作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start


function checkBarAcl(params) {
  //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end
  var all = params.all;
  var list = params.list;
  var read = params.read;
  var add = params.add;
  var edit = params.edit;
  var del = params.del;
  var lend = params.lend;
  var openToZone = params.openToZone;
  var print = params.print;
  var download = params.download;
  var isPrivateLib = params.isPrivateLib;
  var folderEnabled = params.folderEnabled;
  var a6Enabled = params.a6Enabled;
  var officeEnabled = params.officeEnabled;
  var ofdEnabled = params.ofdEnabled;
  var uploadEnabled = params.uploadEnabled;
  var isGroupLib = params.isGroupLib;
  var isEdocLib = params.isEdocLib;
  var isVideoLib = params.isVideoLib;
  var isShareAndBorrowRoot = params.isShareAndBorrowRoot;
  var onlyA6 = params.onlyA6;
  var onlyA6s = params.onlyA6s;
  var dr = params.dr; //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end

  var menuShowList = new Properties();
  menuShowList.put("new", false);
  menuShowList.put("html", false);
  menuShowList.put("misWord", false);
  menuShowList.put("misExcel", false);
  menuShowList.put("wpsword", false);
  menuShowList.put("wpsexcel", false);
  menuShowList.put("xxxx", false);
  menuShowList.put("sendto", false);
  menuShowList.put("favorite", false);
  menuShowList.put("deptDoc", false);
  menuShowList.put("accountDoc", false);
  menuShowList.put("groupDoc", false);
  menuShowList.put("learning", false);
  menuShowList.put("deptLearn", false);
  menuShowList.put("accountLearn", false);
  menuShowList.put("groupLearn", false);
  menuShowList.put("link", false);
  menuShowList.put("forward", false);
  menuShowList.put("col", false);
  menuShowList.put("mail", false);
  menuShowList.put("orderBtn", false);
  menuShowList.put("downloadFile", false);
  menuShowList.put("pigArchive", false);
  menuShowList.put("docAllLogs", false);
  menuShowList.put("setSecretLevel", false); //作者:dengwei 时间2020-09-21 功能设置文档中心ofd菜单初始值，不然无法控制 start

  menuShowList.put("Ofd", false); //作者:dengwei 时间2020-09-21 功能设置文档中心ofd菜单初始值，不然无法控制 end

  menuShowList.put("uploadAll", false);
  menuShowList.put("uploadFile", false);
  menuShowList.put("uploadMedia", false);
  menuShowList.put("move", false);
  menuShowList.put("del", false);
  menuShowList.put("video_folderManage", false);
  menuShowList.put("video_CreateFolder", false);
  menuShowList.put("video_RenameFolder", false);
  menuShowList.put("video_DeleteFolder", false);
  menuShowList.put("video_SortFolder", false);
  menuShowList.put("video_ShareFolder", false);
  menuShowList.put("video_Acl", false);
  menuShowList.put("video_SubscribeFolder", false);
  menuShowList.put("video_PropertyFolder", false); // menuShowList.put("archive", false);

  var menuEnableList = new Properties();
  menuEnableList.put("new", false);
  menuEnableList.put("html", false);
  menuEnableList.put("misWord", false);
  menuEnableList.put("misExcel", false);
  menuEnableList.put("wpsword", false);
  menuEnableList.put("wpsexcel", false); //作者:dengwei 时间2020-09-21 功能设置文档中心ofd菜单初始值，不然无法控制 start

  menuEnableList.put("Ofd", false); //作者:dengwei 时间2020-09-21 功能设置文档中心ofd菜单初始值，不然无法控制 end

  menuEnableList.put("xxxx", false);
  menuEnableList.put("sendto", false);
  menuEnableList.put("favorite", false);
  menuEnableList.put("deptDoc", false);
  menuEnableList.put("accountDoc", false);
  menuEnableList.put("groupDoc", false);
  menuEnableList.put("learning", false);
  menuEnableList.put("deptLearn", false);
  menuEnableList.put("accountLearn", false);
  menuEnableList.put("groupLearn", false);
  menuEnableList.put("link", false);
  menuEnableList.put("forward", false);
  menuEnableList.put("col", false);
  menuEnableList.put("mail", false);
  menuEnableList.put("orderBtn", false);
  menuEnableList.put("downloadFile", false);
  menuEnableList.put("pigArchive", false);
  menuEnableList.put("docAllLogs", false);
  menuEnableList.put("setSecretLevel", false);
  menuEnableList.put("uploadAll", false);
  menuEnableList.put("uploadFile", false);
  menuEnableList.put("uploadMedia", false);
  menuEnableList.put("move", false);
  menuEnableList.put("del", false);
  menuEnableList.put("video_folderManage", false);
  menuEnableList.put("video_CreateFolder", false);
  menuEnableList.put("video_RenameFolder", false);
  menuEnableList.put("video_DeleteFolder", false);
  menuEnableList.put("video_SortFolder", false);
  menuEnableList.put("video_ShareFolder", false);
  menuEnableList.put("video_Acl", false);
  menuEnableList.put("video_SubscribeFolder", false);
  menuEnableList.put("video_PropertyFolder", false);
  var selectIdList = getSelectedIds();
  var isVideoAll = isVideoLib == "true" && $("#allVideo.current_folder").length == 1;

  if (isShareAndBorrowRoot == "false") {
    // "new": false,
    // "html": false,
    if (isVideoLib != "true" && isEdocLib != 'true' && a6Enabled == "true") {
      menuShowList.put("html", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("html", true);
    } // "misWord": false,


    if (isVideoLib != "true" && isEdocLib != 'true' && getA8Top().installDoc && officeEnabled == "true") {
      menuShowList.put("misWord", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("misWord", true);
    } // "misExcel": false,


    if (isVideoLib != "true" && isEdocLib != 'true' && getA8Top().installXls && officeEnabled == "true") {
      menuShowList.put("misExcel", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("misExcel", true);
    } // "wpsword": false,


    if (isVideoLib != "true" && isEdocLib != 'true' && getA8Top().installWps && officeEnabled == "true") {
      menuShowList.put("wpsword", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("wpsword", true);
    } // "wpsexcel": false,


    if (isVideoLib != "true" && isEdocLib != 'true' && getA8Top().installEt && officeEnabled == "true") {
      menuShowList.put("wpsexcel", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("wpsexcel", true);
    } //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start


    if (isVideoLib != "true" && ofdEnabled == "true") {
      menuShowList.put("Ofd", true);
    }

    if (add == "true" && !isVideoAll) {
      menuEnableList.put("Ofd", true);
    } //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end
    // "folder": false,


    if (isVideoLib != "true" && (folderEnabled == "true" || isEdocLib == 'true')) {
      menuShowList.put("xxxx", true);
    }

    if ((isEdocLib == 'false' && add == "true" || isEdocLib == 'true' && (window.allAcl == "true" || window.addAcl == "true")) && !isVideoAll) {
      menuEnableList.put("xxxx", true);
    } // "sendto": false,
    // "favorite": false,


    if (isV5Member && isEdocLib != "true") {
      menuShowList.put("favorite", true);
    }

    if ((all == "true" || read == "true" || typeof dr == "undefined" || dr.canSendToFavoriteOrLearning) && !isVideoAll) {
      menuEnableList.put("favorite", true);
    } // "deptDoc": false,


    if (isV5Member && isEdocLib != "true" && isPrivateLib != "true") {
      menuShowList.put("deptDoc", true);
    }

    if ((all == "true" || openToZone == "true") && depAdminSize != "0" && !isVideoAll) {
      menuEnableList.put("deptDoc", true);
    } // "accountDoc": false,


    if (isV5Member && isEdocLib != "true" && isPrivateLib != "true") {
      menuShowList.put("accountDoc", true);
    }

    if ((all == "true" || openToZone == "true") && isAdministrator == "true" && !isVideoAll) {
      menuEnableList.put("accountDoc", true);
    } // "groupDoc": false,


    if (isV5Member && isEdocLib != "true" && isGroupLib == 'true') {
      menuShowList.put("groupDoc", true);
    }

    if ((all == "true" || openToZone == "true") && isGroupAdmin == "true" && !isVideoAll) {
      menuEnableList.put("groupDoc", true);
    } // "learning": false,


    if (isV5Member && isEdocLib != "true" && (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink)) {
      menuShowList.put("learning", true);
    }

    if ((all == "true" || read == "true" || typeof dr == "undefined" || dr.canSendToFavoriteOrLearning) && !isVideoAll) {
      menuEnableList.put("learning", true);
    } // "deptLearn": false,


    if (isV5Member && isEdocLib != "true" && isPrivateLib != "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink) {
        menuShowList.put("deptLearn", true);
      }
    }

    if ((all == "true" || openToZone == "true") && depAdminSize != "0" && !isVideoAll) {
      menuEnableList.put("deptLearn", true);
    } // "accountLearn": false,


    if (isV5Member && isEdocLib != "true" && isPrivateLib != "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink) {
        menuShowList.put("accountLearn", true);
      }
    }

    if ((all == "true" || openToZone == "true") && isAdministrator == "true" && !isVideoAll) {
      menuEnableList.put("accountLearn", true);
    } // "groupLearn": false,


    if (isV5Member && isEdocLib != "true" && isGroupLib == 'true') {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink) {
        menuShowList.put("groupLearn", true);
      }
    }

    if ((all == "true" || openToZone == "true") && isGroupAdmin == "true" && !isVideoAll) {
      menuEnableList.put("groupLearn", true);
    } // "link": false,


    if (isV5Member && isEdocLib != "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink) {
        menuShowList.put("link", true);
      }
    }

    if ((all == "true" || lend == "true") && !isVideoAll) {
      menuEnableList.put("link", true);
    } // "forward": false,
    // "col": false,


    if (isV5Member && canNewColl == "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig || dr.isColOrForm) {
        menuShowList.put("col", true);
      }
    }

    if (selectIdList.length == 1 && (all == "true" || lend == "true") && !isVideoAll) {
      menuEnableList.put("col", true);
    } // "mail": false,


    if (isV5Member && canNewMail == "true" && isVideoLib != 'true') {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig && !dr.hasMedia || dr.isColOrForm) {
        menuShowList.put("mail", true);
      }
    }

    if (selectIdList.length == 1 && (all == "true" || lend == "true") && !isVideoAll) {
      menuEnableList.put("mail", true);
    } // "orderBtn":false,


    if (isV5Member && isVideoLib != "true" && window.frType != 101 && window.frType != 102 && window.frType != 34 && window.frType != 35 && window.frType != 110 && window.frType != 111 && window.frType != 103 && window.frType != 32 && window.frType != 43 && window.frType != 44 && window.frType != 45 && window.frType != 46) {
      menuShowList.put("orderBtn", true);
    }

    if (window.allAcl == 'true' && !isVideoAll) {
      menuEnableList.put("orderBtn", true);
    } // "downloadFile":false,


    if (isVideoLib != "true" && isV5Member && isEdocLib != 'true' && parentBatchDownloadEnable == "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.hasMedia) {
        menuShowList.put("downloadFile", true);
      }
    }

    if ((all == "true" || download == "true") && !isVideoAll) {
      menuEnableList.put("downloadFile", true);
    } // "pigArchive":false,


    if (isV5Member && isAllowArchivePigeonhole == 'true' && !isVideoAll) {
      menuShowList.put("pigArchive", true);
      menuEnableList.put("pigArchive", true);
    } // "docAllLogs":false,


    if (isV5Member && docLibType != '1') {
      menuShowList.put("docAllLogs", true);
    }

    if (typeof dr == "undefined" && window.allAcl == 'true' || typeof dr != "undefined" && all == 'true') {
      menuEnableList.put("docAllLogs", true);
    } //"setSecretLevel":false,


    if ((typeof dr == "undefined" || isV5Member && typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink) && isSecretLevel == true) {
      menuShowList.put("setSecretLevel", true);
    }

    if ((typeof dr != "undefined" && window.allAcl == 'true' || typeof dr != "undefined" && all == 'true' || typeof dr != "undefined" && edit == 'true' || typeof dr == "undefined") && typeof dr != "undefined" && !dr.isLink && !dr.isPig) {
      menuEnableList.put("setSecretLevel", true);
    } // "uploadFile":false,


    if (isVideoLib != 'true' && isEdocLib != 'true' && uploadEnabled == "true") {
      menuShowList.put("uploadFile", true);
    }

    if ((all == "true" || add == "true") && !isVideoAll) {
      menuEnableList.put("uploadFile", true);
    } // "uploadMedia":false,


    if (!v3x.isMSIE8 && !v3x.isMSIE9 && uploadVideoEnabled == "true" && isEdocLib != 'true' && uploadEnabled == "true") {
      menuShowList.put("uploadMedia", true);
    }

    if ((all == "true" || add == "true") && !isVideoAll) {
      menuEnableList.put("uploadMedia", true);
    } // "move":false,


    if (isV5Member) {
      menuShowList.put("move", true);
    }

    if ((all == "true" || edit == "true") && !isVideoAll) {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isSysInit && dr.canMove) {
        menuEnableList.put("move", true);
      }
    } // "del":false


    menuShowList.put("del", true);

    if ((all == "true" || del == "true") && !isVideoAll) {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isSysInit && dr.canDel) {
        menuEnableList.put("del", true);
      }
    }

    if (!menuShowList.get("html") && !menuShowList.get("misWord") && !menuShowList.get("misExcel") && !menuShowList.get("wpsword") && !menuShowList.get("wpsexcel") && !menuShowList.get("folder")) {
      menuShowList.put("new", false);
    } else {
      menuShowList.put("new", true);
    }

    if (!menuEnableList.get("html") && !menuEnableList.get("misWord") && !menuEnableList.get("misExcel") && !menuEnableList.get("wpsword") && !menuEnableList.get("wpsexcel") && !menuEnableList.get("folder")) {
      menuEnableList.put("new", false);
    } else {
      menuEnableList.put("new", true);
    }
  } else {
    menuShowList.put("new", true);
    menuShowList.put("sendto", true);
    menuShowList.put("uploadFile", true);
    menuShowList.put("forward", true);

    if (isV5Member && canNewColl == "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig) {
        menuShowList.put("col", true);
      }
    }

    if (selectIdList.length == 1 && (all == "true" || lend == "true")) {
      menuEnableList.put("col", true);
    } // "mail": false,


    if (isV5Member && onlyA6s === "false" && canNewMail == "true") {
      if (typeof dr == "undefined" || typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig && !dr.hasMedia) {
        menuShowList.put("mail", true);
      }
    }

    if (selectIdList.length == 1 && (all == "true" || lend == "true")) {
      menuEnableList.put("mail", true);
    } // "downloadFile":false,


    if (isV5Member && isEdocLib != 'true' && getA8Top().xmlDoc != null && parentBatchDownloadEnable == "true") {
      menuShowList.put("downloadFile", true);
    }

    if (all == "true" || download == "true" || isShareAndBorrowRoot == "true" && (frType == "102" || frType == "103")) {
      menuEnableList.put("downloadFile", true);
    }

    if ((typeof dr == "undefined" || isV5Member && typeof dr != "undefined" && !dr.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig) && isSecretLevel == true) {
      menuShowList.put("setSecretLevel", true);
    }

    if (typeof dr != "undefined" && window.frType != '104' && window.frType != '103' && (typeof dr != "undefined" && window.allAcl == 'true' || typeof dr != "undefined" && all == 'true' || typeof dr != "undefined" && edit == 'true')) {
      menuEnableList.put("setSecretLevel", true);
    }
  }

  if (!menuShowList.get("favorite") && !menuShowList.get("deptDoc") && !menuShowList.get("accountDoc") && !menuShowList.get("groupDoc") && !menuShowList.get("learning") && !menuShowList.get("deptLearn") && !menuShowList.get("accountLearn") && !menuShowList.get("groupLearn") && !menuShowList.get("link")) {
    menuShowList.put("sendto", false);
  } else {
    menuShowList.put("sendto", true);
  }

  if (!menuEnableList.get("favorite") && !menuEnableList.get("deptDoc") && !menuEnableList.get("accountDoc") && !menuEnableList.get("groupDoc") && !menuEnableList.get("learning") && !menuEnableList.get("deptLearn") && !menuEnableList.get("accountLearn") && !menuEnableList.get("groupLearn") && !menuEnableList.get("link")) {
    menuEnableList.put("sendto", false);
  } else {
    menuEnableList.put("sendto", true);
  }

  if (!menuShowList.get("col") && !menuShowList.get("mail") && !menuShowList.get("orderBtn") && !menuShowList.get("downloadFile") && !menuShowList.get("pigArchive") && !menuShowList.get("docAllLogs")) {
    menuShowList.put("forward", false);
  } else {
    menuShowList.put("forward", true);
  }

  if (!menuEnableList.get("col") && !menuEnableList.get("mail") && !menuEnableList.get("orderBtn") && !menuEnableList.get("downloadFile") && !menuEnableList.get("pigArchive") && !menuEnableList.get("docAllLogs")) {
    menuEnableList.put("forward", false);
  } else {
    menuEnableList.put("forward", true);
  }

  if (!menuShowList.get("uploadFile") && !menuShowList.get("uploadMedia")) {
    menuShowList.put("uploadAll", false);
  } else {
    menuShowList.put("uploadAll", true);
  }

  if (!menuEnableList.get("uploadFile") && !menuEnableList.get("uploadMedia")) {
    menuEnableList.put("uploadAll", false);
  } else {
    menuEnableList.put("uploadAll", true);
  }

  if (!menuShowList.get("html") && !menuShowList.get("misWord") && !menuShowList.get("misExcel") && !menuShowList.get("wpsword") && !menuShowList.get("wpsexcel") && !menuShowList.get("xxxx")) {
    menuShowList.put("new", false);
  } else {
    menuShowList.put("new", true);
  }

  if (!menuEnableList.get("html") && !menuEnableList.get("misWord") && !menuEnableList.get("misExcel") && !menuEnableList.get("wpsword") && !menuEnableList.get("wpsexcel") && !menuEnableList.get("xxxx")) {
    menuEnableList.put("new", false);
  } else {
    menuEnableList.put("new", true);
  } //视频分类管理单独逻辑显隐
  // menuShowList menuEnableList.put("video_folderManage", false);
  // menuShowList menuEnableList.put("video_CreateFolder", false);
  // menuShowList menuEnableList.put("video_RenameFolder", false);
  // menuShowList menuEnableList.put("video_DeleteFolder", false);
  // menuShowList menuEnableList.put("video_SortFolder", false);
  // menuShowList menuEnableList.put("video_ShareFolder", false);
  // menuShowList menuEnableList.put("video_Acl", false);
  // menuShowList menuEnableList.put("video_SubscribeFolder", false);
  // menuShowList menuEnableList.put("video_PropertyFolder", false);


  if (isVideoLib == "true") {
    var isAllFolder = $("#allVideo.current_folder").length == 1;
    menuShowList.put("video_folderManage", true);
    menuShowList.put("video_CreateFolder", true);
    menuShowList.put("video_RenameFolder", true);
    menuShowList.put("video_DeleteFolder", true);
    menuShowList.put("video_SortFolder", true);
    menuShowList.put("video_ShareFolder", true);
    menuShowList.put("video_Acl", true);
    menuShowList.put("video_SubscribeFolder", true);
    menuShowList.put("video_PropertyFolder", true);

    if (flipInfoForVideo.docLibAddAcl && flipInfoForVideo.folderEnabled == "true") {
      menuEnableList.put("video_CreateFolder", true);
    }

    if ((flipInfoForVideo.docLibAllAcl || flipInfoForVideo.docLibEditAcl || all == "true" || edit == "true") && !isAllFolder) {
      menuEnableList.put("video_RenameFolder", true);
    }

    if ((flipInfoForVideo.docLibAllAcl || flipInfoForVideo.docLibDelAcl || all == "true" || del == "true") && !isAllFolder) {
      menuEnableList.put("video_DeleteFolder", true);
    }

    if (flipInfoForVideo.docLibAllAcl) {
      menuEnableList.put("video_SortFolder", true);
    }

    if ((flipInfoForVideo.docLibAllAcl || all == "true") && !isAllFolder) {
      menuEnableList.put("video_ShareFolder", true);
    }

    if (ajaxDocHierarchyManager.needApproval(window.resId, "docAclApply") && !isAllFolder) {
      menuEnableList.put("video_Acl", true);
    }

    if ((all == "true" || list == "true") && !isAllFolder) {
      menuEnableList.put("video_SubscribeFolder", true);
    }

    if (!isAllFolder) {
      menuEnableList.put("video_PropertyFolder", true);
    }

    if (menuEnableList.get("video_folderManage") || menuEnableList.get("video_CreateFolder") || menuEnableList.get("video_RenameFolder") || menuEnableList.get("video_DeleteFolder") || menuEnableList.get("video_SortFolder") || menuEnableList.get("video_ShareFolder") || menuEnableList.get("video_Acl") || menuEnableList.get("video_SubscribeFolder") || menuEnableList.get("video_PropertyFolder")) {
      menuEnableList.put("video_folderManage", true);
    } else {
      menuEnableList.put("video_folderManage", false);
    }
  }

  var enableKeys = menuEnableList.keys();

  for (var i = 0; i < enableKeys.size(); i++) {
    var enableKey = enableKeys.get(i);
    var value = menuEnableList.get(enableKey);

    if (value) {
      topToolBar.enabled(enableKey);
    } else {
      topToolBar.disabled(enableKey);
    }
  }

  var showKeys = menuShowList.keys();

  for (var i = 0; i < showKeys.size(); i++) {
    var showKey = showKeys.get(i);
    var value = menuShowList.get(showKey);

    if (value) {
      topToolBar.showBtn(showKey);
    } else {
      topToolBar.hideBtn(showKey);
    }
  }
} //----toolbar 权限控制:end----

/**
 * 视图切换
 * @param type 0-卡片 1-列表
 */


function typeSwitch(type, dom) {
  var targetLi = $(".tableBtn").eq(type);

  if (targetLi.hasClass("currentLi")) {
    return;
  } else {
    $(".changeBtn li").toggleClass("currentLi", false);

    if (type == 0) {
      $(".changeBtn li").eq(0).toggleClass("currentLi", true);
      changeRightBlock("card_block");
      initRightCard();
    }

    if (type == 1) {
      $(".changeBtn li").eq(1).toggleClass("currentLi", true);
      changeRightBlock("table_block");
      initRightList();
    }

    renderIconFont4Ie8();
  }
} //==========小齿轮菜单==========//


function DocMenu(dr, x, y, attFlag) {
  $("body").find(".doc_menu").remove();
  this.isCard = $(".tableBtn").hasClass("currentLi");
  this.menu = $("<div class='doc_menu'><ul></ul></div>").toggleClass(this.isCard ? "doc_menu_row" : "doc_menu_card", true);
  this.dr = nowPageDr[dr];
  this.attFlag = attFlag;
  this.disableItem = {};
  this.showHideList = [];
  this.enableDisableList = [];
  this.bulidMenu();
  var liNum = this.menu.find(">ul>li.levelA_Item:not(.menu_hide)").length;
  var bodyHeight = liNum * 32;
  var _wH = document.body.clientHeight;
  var _wW = document.body.clientWidth;

  if (_wW - x - 125 < 0) {
    x = _wW - 125;
  }

  if (_wH - y - bodyHeight < 0) {
    y = _wH - bodyHeight;
  }

  this.menu.css({
    "top": y + "px",
    "left": x + "px"
  });

  if (_wW - x - 125 < 0) {
    this.menu.find(".levelA_child_block").css("left", "-120px");
  }
}
/**
 * 右键小齿轮
 * 菜单内容如下
 * sendto 发送到   /favorite 常用文档     /deptDoc 部门知识文档   /publish 单位知识文档      /group 集团知识文档
 *                 /learning 个人学习文档 /deptLearn 部门学习文档 /accountLearn 单位学习文档 /groupLearn 集团学习文档
 *                 /link 指定位置
 * forward 转发    /info 转发协同 /转发邮件
 *
 * download 下载
 * edit 编辑
 * coverImage 封面设置
 * collect/uncollect 收藏/取消收藏
 * recommend 推荐
 * move 移动
 * replace 替换
 * del 删除
 * rename 重命名
 * lock/unlock 解锁
 * share 个人共享
 * share_pub 共享
 * openToZone/openToZoneCancel 公开到广场/取消公开
 * log 文档日志
 * docHistory 版本记录
 * learnHistory 学习记录
 * alert 订阅
 * property 文档属性
 *
 */


DocMenu.prototype.bulidMenu = function () {
  var nowDr = this.dr; //发送到

  /*this.addItem("sendto",$.i18n("doc.menu.sendto.label"),"ico16 forwarding_16","child");
  this.addSubItem("favorite",$.i18n("doc.menu.sendto.favorite.label"),"sendto","favorite");
  this.addSubItem("deptDoc",$.i18n("doc.menu.sendto.deptDoc.label"),"sendto","deptDoc");
  this.addSubItem("publish",$.i18n("doc.menu.sendto.space.label"),"sendto","publish");
  this.addSubItem("group",$.i18n("doc.menu.sendto.group" + govLabel),"sendto","group");
   this.addSubItem("learning",$.i18n("doc.menu.sendto.learning.label"),"sendto","learning");
  this.addSubItem("deptLearn",$.i18n("doc.menu.sendto.deptLearn.label"),"sendto","deptLearn");
  this.addSubItem("accountLearn",$.i18n("doc.menu.sendto.accountLearn.label"),"sendto","accountLearn");
  this.addSubItem("groupLearn",$.i18n("doc.menu.sendto.group.learning"),"sendto","groupLearn");
  this.addSubItem("link",$.i18n("doc.menu.sendto.other.label"),"sendto","link");*/
  //转发

  /*this.addItem("forward",$.i18n("common.toolbar.transmit.label"),"ico16 forwarding_16","child");
  this.addSubItem("info",$.i18n("common.toolbar.transmit.col.label"),"forward",_ctxPath + "/doc.do?method=sendToColl","forward");
  this.addSubItem("mail",$.i18n("common.toolbar.transmit.mail.label"),"forward","/doc.do?method=sendToWebMail","forward");*/
  //下载

  this.addItem("download", $.i18n("common.download.label"), "ico16 download_16", "menuDownload"); //编辑

  this.addItem("edit", $.i18n("common.operate.edit"), "ico16 editor_16", "editDoc"); //修改密级

  this.addItem("setSecretLevel", $.i18n("doc.menu.set.secretLevel"), "ico16 editor_16", "setSecretLevel", [this.attFlag]); //收藏/取消收藏

  this.addItem("collect", $.i18n("common.collection.label"), "ico16 unstore_16", "collect");
  this.addItem("uncollect", $.i18n("common.cancel.collection.label"), "ico16 stored_16", "uncollect"); //推荐

  this.addItem("recommend", $.i18n("doc.menu.recommend.label"), "ico16 recommend_16", "recommend");
  this.addItem("move", $.i18n("common.move.label"), "ico16 move_16", "moveDoc"); //替换

  this.addItem("replace", $.i18n("doc.menu.replace.label"), "ico16 replace_16", "docReplace"); //删除

  this.addItem("del", $.i18n("common.toolbar.delete.label"), "ico16 del_16", "delDoc"); //重命名

  this.addItem("rename", $.i18n("doc.menu.rename.label"), "ico16 rename_16", "rename"); //加锁

  this.addItem("lock", $.i18n("doc.menu.lock.label"), "ico16 locking_16", "lockDoc"); //解锁

  this.addItem("unlock", $.i18n("common.unlock.label"), "ico16 locking_16", "unlockDoc");
  this.addItem("column", $.i18n("doc.menu.xianshilie.label"), "ico16 sort_16", "column"); //共享设置

  this.addItem("share", $.i18n("doc.menu.aclsetting.label"), "ico16 shareTo_16", "share"); //权限申请

  this.addItem("aclApply", $.i18n("doc.menu.aclapply.label"), "ico16 shareTo_16", "aclApply");
  this.addItem("lend", $.i18n("doc.menu.aclsetting.label"), "ico16 lending_16", "lend"); // this.addItem("openToZone",$.i18n("doc.menu.openToZone.label"),"ico16 publicSquare_16","openToZone");
  // this.addItem("openToZoneCancel",$.i18n("doc.menu.openToZone.cancel.label"),"ico16 unPublicSquare_16","openToZone");

  this.addItem("log", $.i18n("doc.menu.viewlog.label"), "ico16 view_log_16", "logView", [false]);
  this.addItem("docHistory", $.i18n("doc.menu.history.label"), "ico16 history_doc_16", "docHistory");
  this.addItem("learnHistory", $.i18n("doc.menu.learn.history.label"), "ico16 learning_record_16", "learnHistoryView", [isGroupLib]);
  this.addItem("alert", $.i18n("doc.menu.subscribe.label"), "ico16 subscribe_doc_16", "alertview");
  this.addItem("property", $.i18n("common.attribute.label"), "ico16 attribute_16", "properties"); //显隐 禁用判断

  this.loadState();
};

DocMenu.prototype.loadState = function () {
  var dr = this.dr; //创建人

  var isCreater = currentUserId == dr.docResource.createUserId; //权限-当前文档/文档夹

  var _all = dr.allAcl;
  var _list = dr.listAcl;
  var _read = dr.readAcl;
  var _add = dr.addAcl;
  var _edit = dr.editAcl;
  var _del = dr.delAcl;
  var _lend = dr.lendAcl;
  var _openToZone = dr.openToZoneAcl;
  var _print = dr.printAcl;
  var _download = dr.downloadAcl;
  var mimeType = dr.docResource.mimeTypeId;
  var frType = dr.docResource.frType;

  var _noLookAcl = !_list && !_read;

  var hasLockAccess = !dr.docResource.isCheckOut || dr.docResource.isCheckOut && (dr.isOwnerOfLib || dr.docResource.checkOutUserId == currentUserId);
  var isMediaFile = mimeType == '131' || mimeType == '132'; // 如果是我借出，则权限上只有浏览 duanyl

  if (entranceType === '3') {
    _all = false;
    _list = true;
    _read = true;
    _add = false;
    _edit = false;
    _del = false;
    _lend = false;
    _openToZone = false;
    _print = false;
    _download = false;
  } //新逻辑
  // // 1: {id: "favorite", name: "常用文档", value: false}
  // if(isEdocLib !="true"){
  //     this.setShowHideValue("favorite", true);
  // }
  // if(_all || _read){
  //     this.setEnableDisableValue("favorite",true);
  // }
  // // 2: {id: "deptDoc", name: "部门知识文档", value: false}
  // if(isEdocLib !="true" && isPrivateLib != "true" && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("deptDoc", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("deptDoc", true);
  // }
  // // 3: {id: "publish", name: "单位知识文档", value: false}
  // if(isEdocLib !="true" && isPrivateLib != "true" && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("publish", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("publish", true);
  // }
  // // 4: {id: "group", name: "集团知识文档", value: false}
  // if(isEdocLib !="true" && isGroupLib == 'true' && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("group", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("group", true);
  // }
  // // 5: {id: "learning", name: "个人学习文档", value: false}
  // if(isEdocLib !="true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink){
  //     this.setShowHideValue("learning", true);
  // }
  // if(_all || _read){
  //     this.setEnableDisableValue("learning", true);
  // }
  // // 6: {id: "deptLearn", name: "部门学习文档", value: false}
  // if(isEdocLib !="true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && isPrivateLib != "true" && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("deptLearn", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("deptLearn", true);
  // }
  // // 7: {id: "accountLearn", name: "单位学习文档", value: false}
  // if(isEdocLib !="true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && isPrivateLib != "true" && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("accountLearn", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("accountLearn", true);
  // }
  // // 8: {id: "groupLearn", name: "集团学习文档", value: false}
  // if(isEdocLib !="true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && isGroupLib == 'true' && isShareAndBorrowRoot != "true" && !dr.isCollect){
  //     this.setShowHideValue("groupLearn", true);
  // }
  // if(_all || _openToZone){
  //     this.setEnableDisableValue("groupLearn", true);
  // }
  // // 9: {id: "link", name: "指定位置", value: false}
  // if(isEdocLib !="true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && isShareAndBorrowRoot != "true"){
  //     this.setShowHideValue("link", true);
  // }
  // if(_all || _lend){
  //     this.setEnableDisableValue("link",true);
  // }
  // // 11: {id: "info", name: "转发协同", value: false}
  // if(canNewColl == "true" && !dr.docResource.isFolder && !dr.isLink && !dr.isFolderLink && !dr.isPig) {
  //     this.setShowHideValue("info", true);
  // }
  // if (_all || _lend) {
  //     this.setEnableDisableValue("info",true);
  // }
  // // 12: {id: "mail", name: "转发邮件", value: false}
  // if(!onlyA6s && canNewMail == "true" && !dr.docResource.isFolder && !dr.isLink && !dr.isFolderLink && !dr.isPig) {
  //     this.setShowHideValue("mail", true);
  // }
  // if (_all || _lend) {
  //     this.setEnableDisableValue("mail",true);
  // }
  // 13: {id: "download", name: "下载", value: false}

  /* if(!isMediaFile && !dr.docResource.isFolder && !dr.isLink && !dr.isFolderLink && !dr.isPig && !dr.isLink) {
       this.setShowHideValue("download", true);
   }*/
  //V5-45942
  // 【风暴测试】文档中心：文档库设置了不勾选批量下载，库下的文档夹，设置入口没有屏蔽下载按钮  增加对于父文档夹批量下载权限的判断  不为文档夹 或是为文档夹但允许批量下载


  if (!isMediaFile && !dr.isLink && !dr.isFolderLink && !dr.isPig && !dr.isLink && (!dr.docResource.isFolder || dr.docResource.batchDownloadEnabled)) {
    this.setShowHideValue("download", true);
  }

  if (_all || _download) {
    this.setEnableDisableValue("download", true);
  } // 14: {id: "edit", name: "编辑", value: false}


  if (isShareAndBorrowRoot == "false" && !dr.docResource.isFolder && !dr.isLink && !dr.isFolderLink && !dr.isPig && !dr.isLink) {
    this.setShowHideValue("edit", true);
  }

  if ((_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) && hasLockAccess) {
    if (mimeType == '101' || mimeType == '120' || mimeType == '102' || mimeType == '121' || mimeType == '23' || mimeType == '24' || mimeType == '25' || mimeType == '26') {
      // if ($.ctx.hasPlugin("officeOnlineEdit") || $.ctx.hasPlugin("officeOnlinePreview") || $.ctx.hasPlugin("domestic")) {
        this.setEnableDisableValue("edit", true);
      // } 客开 wzl,gjx 去掉office校验
    } else {
      this.setEnableDisableValue("edit", true);
    }
  }

  if ((_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) && hasLockAccess && (frType == '21' || frType != "1" && frType != "2" && frType != "3" && frType != "4" && frType != "5" && frType != "6" && frType != "7" && frType != "8" && frType != "9" && frType != "10" && frType != "15" && frType != "31" && frType != "32" && frType != "33" && frType != "34" && frType != "35" && frType != "36" && frType != "37" && frType != "38" && frType != "39" && frType != "40" && frType != "41" && frType != "42" && frType != "43" && frType != "44" && frType != "45" && frType != "46" && frType != "47" && frType != "48" && frType != "52" && frType != "51" && frType != "53" && frType != "110" && frType != "111")) {
    if (isSecretLevel == true) {
      this.setShowHideValue("setSecretLevel", true);
      this.setEnableDisableValue("setSecretLevel", true);
    }
  } // 15: {id: "collect", name: "收藏", value: false}
  // 16: {id: "uncollect", name: "取消收藏", value: false}


  if (!dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && (isPrivateLib != "true" || isShareAndBorrowRoot == "true" && !dr.isOwnerOfLib && !dr.isCollect && !dr.isPig && parseInt(dr.docResource.mimeTypeId) > 15 && parseInt(dr.docResource.mimeTypeId) != 53)) {
    this.setShowHideValue("collect", !dr.collect);
    this.setShowHideValue("uncollect", dr.collect);
  }

  if (_all || (_add || _del || _edit) && _noLookAcl && isCreater || _read) {
    this.setEnableDisableValue("collect", true);
    this.setEnableDisableValue("uncollect", true);
  } else if (dr.isCollect) {
    this.setEnableDisableValue("uncollect", true);
  } // 17: {id: "recommend", name: "推荐", value: false}


  if (!dr.docResource.isFolder && !dr.isFolderLink && dr.docResource.recommendEnable) {
    this.setShowHideValue("recommend", true);
    this.setEnableDisableValue("recommend", true);
  } // 18: {id: "move", name: "移动", value: false}


  if (!dr.isSysInit && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("move", true);
  }

  if ((_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) && hasLockAccess) {
    this.setEnableDisableValue("move", true);
  } // 19: {id: "replace", name: "替换", value: false}


  if (!isMediaFile && !dr.docResource.isFolder && dr.isUploadFile && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("replace", true);
  }

  if ((_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) && hasLockAccess) {
    this.setEnableDisableValue("replace", true);
  } // 20: {id: "del", name: "删除", value: false}


  if (!dr.isSysInit && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("del", true);
  }

  if (_all || _del && (_noLookAcl && isCreater || !_noLookAcl)) {
    this.setEnableDisableValue("del", true);
  } // 21: {id: "rename", name: "重命名", value: false}


  if (!dr.isSysInit && !dr.isLink && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("rename", true);
  }

  if ((_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) && hasLockAccess) {
    this.setEnableDisableValue("rename", true);
  } // 22: {id: "lock", name: "加锁", value: false}
  // 23: {id: "unlock", name: "解锁", value: false}


  if (isPrivateLib != "true" && !dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && !dr.isPig && !dr.isCollect && isShareAndBorrowRoot == "false") {
    if (dr.docResource.isCheckOut) {
      this.setShowHideValue("unlock", true);
    } else {
      this.setShowHideValue("lock", true);
    }
  }

  if (_all || _edit && (_noLookAcl && isCreater || !_noLookAcl)) {
    if (dr.docResource.isCheckOut) {
      if (hasLockAccess) {
        this.setEnableDisableValue("unlock", true);
      }
    } else {
      this.setEnableDisableValue("lock", true);
    }
  } // 24: {id: "column", name: "设置显示列/排序", value: false}


  if (dr.docResource.isFolder && isPrivateLib != "true" && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("column", true);
  }

  if (_all && docLibColumnEditable) {
    this.setEnableDisableValue("column", true);
  } // 25: {id: "share", name: "共享", value: false} ----25 26合并成一个了
  // 26: {id: "share_pub", name: "共享", value: false}


  if (dr.docResource.isFolder && (isShareAndBorrowRoot == "false" || isShareAndBorrowRoot == "true" && dr.isOwnerOfLib)) {
    this.setShowHideValue("share", true);
  }

  if (_all) {
    this.setEnableDisableValue("share", true);
  } // 27: {id: "lend", name: "借阅", value: false}


  if (!dr.docResource.isFolder && !dr.isFolderLink && !dr.isLink && (isShareAndBorrowRoot == "false" || isShareAndBorrowRoot == "true" && dr.isOwnerOfLib)) {
    this.setShowHideValue("lend", true);
  }

  if (_all) {
    this.setEnableDisableValue("lend", true);
  } // 28: {id: "openToZone", name: "公开到广场", value: false}
  // 29: {id: "openToZoneCancel", name: "取消广场公开", value: false}


  if (isPrivateLib == "true" && isShareAndBorrowRoot == "false" && isCreater) {
    this.setShowHideValue("openToZone", !dr.openSquare);
    this.setShowHideValue("openToZoneCancel", dr.openSquare);
  }

  if (_all || _openToZone) {
    this.setEnableDisableValue("openToZone", true);
    this.setEnableDisableValue("openToZone", true);
  } // 30: {id: "log", name: "文档日志", value: false}


  if (isPrivateLib != "true" && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("log", true);
  }

  if (_all) {
    this.setEnableDisableValue("log", true);
  } // 31: {id: "docHistory", name: "历史版本", value: false}


  if (!isMediaFile && !dr.docResource.isFolder && dr.docResource.versionEnabled && !dr.isPig && !dr.isLink && isPrivateLib != "true" && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("docHistory", true);
  }

  if ((_add || _del || _edit) && _noLookAcl && isCreater || (_all || _read) && !_noLookAcl) {
    this.setEnableDisableValue("docHistory", true);
  } // 32: {id: "learnHistory", name: "学习记录", value: false}


  if (dr.docResource.isLearningDoc && !dr.docResource.isFolder && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("learnHistory", true);
    this.setEnableDisableValue("learnHistory", true);
  } // 33: {id: "alert", name: "关注", value: false}


  if (isPrivateLib != "true" && !dr.isFolderLink && !dr.isLink && !dr.isPig && !dr.isCollect && isShareAndBorrowRoot == "false") {
    this.setShowHideValue("alert", true);
  }

  if (_all || _list || _add || _del || _edit && _noLookAcl && isCreater || !_noLookAcl) {
    this.setEnableDisableValue("alert", true);
  } // 34: {id: "property", name: "属性", value: false}


  this.setShowHideValue("property", true);
  this.setEnableDisableValue("property", true); // 35: {id: "aclApply", name: "权限申请", value: false}

  if (ajaxDocHierarchyManager.needApproval(dr.id, "docAclApply")) {
    this.setShowHideValue("aclApply", true);
  }

  if (true) {
    this.setEnableDisableValue("aclApply", true);
  } // 0: {id: "sendto", name: "发送到", value: false}


  if (this.showHideList[1].value || this.showHideList[2].value || this.showHideList[3].value || this.showHideList[4].value || this.showHideList[5].value || this.showHideList[6].value || this.showHideList[7].value || this.showHideList[8].value || this.showHideList[9].value) {
    this.setShowHideValue("sendto", true);
  }

  if (this.enableDisableList[1].value || this.enableDisableList[2].value || this.enableDisableList[3].value || this.enableDisableList[4].value || this.enableDisableList[5].value || this.enableDisableList[6].value || this.enableDisableList[7].value || this.enableDisableList[8].value || this.enableDisableList[9].value) {
    this.setEnableDisableValue("sendto", true);
  } // 10: {id: "forward", name: "转发", value: false}


  if (this.showHideList[11].value || this.showHideList[12].value) {
    this.setShowHideValue("forward", true);
  }

  if (this.enableDisableList[11].value || this.enableDisableList[12].value) {
    this.setEnableDisableValue("forward", true);
  } //一次循环 显隐 置灰


  for (var i = 0; i < this.showHideList.length; i++) {
    var _showHide = this.showHideList[i];
    var _enableDisable = this.enableDisableList[i];
    this.toggleShowItem(_showHide.id, _showHide.value);
    this.toggleEnableItem(_enableDisable.id, _enableDisable.value);
  }

  var separatorList = this.menu.find(".levelA_Separator").hide(); // for(var i = 0 ; i < separatorList.length; i++){
  //     var _tempSeparator = $(separatorList[i]);
  //     if(_tempSeparator.prevAll(".levelA_Item.menu_hide").length == 0){
  //         _tempSeparator.hide();
  //     }
  // }
};

DocMenu.prototype.setShowHideValue = function (id, state) {
  for (var i = 0; i < this.showHideList.length; i++) {
    var _showHide = this.showHideList[i];

    if (_showHide.id === id) {
      _showHide.value = state;
    }
  }
};

DocMenu.prototype.setEnableDisableValue = function (id, state) {
  for (var i = 0; i < this.enableDisableList.length; i++) {
    var _enableDisable = this.enableDisableList[i];

    if (_enableDisable.id === id) {
      _enableDisable.value = state;
    }
  }
};

DocMenu.prototype.toggleEnableItem = function (id, isEnable) {
  var isB = false;
  var dom = this.menu.find("#a_" + id); //一级

  if (dom.length == 0) {
    dom = this.menu.find("#b_" + id); //二级

    isB = dom.length != 0;
  }

  if (isEnable) {
    dom.toggleClass("menu_gray", false);
    this.disableItem[id] = "";
  } else {
    dom.toggleClass("menu_gray", true);
    this.disableItem[id] = "9777";
  }
};

DocMenu.prototype.toggleShowItem = function (id, isEnable) {
  var isB = false;
  var dom = this.menu.find("#a_" + id); //一级

  if (dom.length == 0) {
    dom = this.menu.find("#b_" + id); //二级

    isB = dom.length != 0;
  }

  if (isEnable) {
    dom.toggleClass("menu_hide", false);
    dom.show();
  } else {
    dom.toggleClass("menu_hide", true);
    dom.hide();
  }

  if (dom.parent().find("li:visible").length > 0) {
    dom.parents(".levelA_child_block").remove();
  }
};

DocMenu.prototype.addItem = function (id, title, icon, fun, extraParam) {
  this.showHideList.push({
    id: id,
    name: title,
    value: false
  });
  this.enableDisableList.push({
    id: id,
    value: false
  });

  var _li = $("<li class='levelA_Item'></li>").append($("<span class='" + icon + "'></span>")).append(title).attr("title", title);

  _li.attr("id", "a_" + id);

  var drId = this.dr.id;
  var dr = this.dr;
  var menu = this;

  if (fun !== "child") {
    //不是展开二级菜单的情况
    _li.click(function (e) {
      var herRefuse = menu.disableItem[id];

      if (herRefuse != "9777") {
        eval(fun + "('" + drId + (extraParam ? "','" + extraParam[0] : "") + "','" + dr.docResource.isFolder + "','" + dr.docResource.favoriteV + "')");
      } else {
        e.stopPropagation();
      }
    });
  } else {
    _li.hover(function () {
      var domIndex = $(this).index;
      var domS = 0; //$(this).prevAll(".levelA_Separator:visible").length 分割线不要了

      var domItem = $(this).prevAll(".levelA_Item:not(.menu_hide)").length;
      var subTop = 0 + domS * 14 + domItem * 25;
      $(".levelA_child_block").toggleClass("child_show", false);
      $("#" + "a_" + id + "_block").css("top", subTop + "px").toggleClass("child_show", true);
    }, null);
  }

  this.menu.find(">ul").append(_li);
};

DocMenu.prototype.addSeparator = function (id, title, icon, fun) {
  var _li = $("<li class='levelA_Separator'><hr></li>");

  this.menu.find(">ul").append(_li);
};

DocMenu.prototype.addSubItem = function (id, title, pId, fun) {
  this.showHideList.push({
    id: id,
    name: title,
    value: false
  });
  this.enableDisableList.push({
    id: id,
    value: false
  });

  var _li = $("<li class='levelB_Item'></li>").attr("id", "b_" + id).append(title).attr("title", title);

  var _childBlockTpl = $("<div class='levelA_child_block'><ul></ul></div>").attr("id", "a_" + pId + "_block");

  var childBlock = this.menu.find("#" + "a_" + pId + "_block");
  var drId = this.dr.id;
  var menu = this;

  _li.click(function (e) {
    var herRefuse = menu.disableItem[id];

    if (herRefuse != "9777") {
      eval(fun + "('" + drId + "')");
    } else {
      e.stopPropagation();
    }
  });

  if (childBlock.length == 0) {
    _childBlockTpl.appendTo(this.menu).find("ul").append(_li);
  } else {
    childBlock.appendTo(this.menu).find("ul").append(_li);
  }
};

DocMenu.prototype.destroy = function () {
  this.menu.remove();
}; // OA-232524 文档中心中文档夹和文档的操作图标按钮点击出不来菜单按钮，直接是穿透的效果


function docAction(iconDom, drId, event, attFlag) {
  var y = $(iconDom).offset().top;
  var x = $(iconDom).offset().left;
  var docMenuObj = new DocMenu(drId, x, y, attFlag);
  $("body").append(docMenuObj.menu);
  window.event ? window.event.cancelBubble = true : event.stopPropagation();
}
/**
 * 从文档列表中打开文档夹。
 */


function folderOpenFun(drObj, callbackFunc) {
  // id, frType, all, edit, add, readonly, browse, list, isFolderLink,v,projectTypeId
  $(".top_toolBar_block > div").show();
  $(".right_main_block").show();
  $("#docLibIframe").hide().attr("src", "");
  frType = drObj.docResource.frType + "";
  resId = drObj.docResource.id + "";

  if (drObj.docLibType || drObj.docLibType === 0) {
    docLibType = drObj.docLibType + "";
  }

  if (typeof drObj.docResource.docLibId != "undefined") {
    docLibId = drObj.docResource.docLibId + "";
  }

  if (typeof drObj.docResource.projectTypeId != "undefined") {
    projectTypeId = drObj.docResource.projectTypeId + "";
  }

  v = drObj.v; // isShareAndBorrowRoot = drObj.isBorrowOrShare + "";

  initBasicData(callbackFunc);
}
/**
 * 他人分享卡片列表
 * @param shareType
 * @param drObj
 */


function shareRootOpenFun(shareType, drObj) {
  $(".right_main_block").show();
  $("#docLibIframe").hide().attr("src", "");
  resId = drObj.docResource.id + "";
  frType = drObj.docResource.frType + "";

  if (drObj.docLibType || drObj.docLibType === 0) {
    docLibType = drObj.docLibType + "";
  }

  if (typeof drObj.docResource.docLibId != "undefined") {
    docLibId = drObj.docResource.docLibId + "";
  }

  if (shareType == "my") {
    window.allAcl = "true";
    window.listAcl = "true";
    window.readAcl = "true";
    window.addAcl = "true";
    window.editAcl = "true";
    window.delAcl = "true";
    window.lendAcl = "true";
    window.openToZoneAcl = "true";
    window.printAcl = "true";
    window.downloadAcl = "true";
    $(".top_toolBar_block > div").show();
  } else if (showMode = "other") {
    window.allAcl = "false";
    window.listAcl = "false";
    window.readAcl = "false";
    window.addAcl = "false";
    window.editAcl = "false";
    window.delAcl = "false";
    window.lendAcl = "false";
    window.openToZoneAcl = "false";
    window.printAcl = "false";
    window.downloadAcl = "false";
    $(".top_toolBar_block > div").hide();
  }

  initBasicData();
}
/**
 * 分享 文件夹穿透
 * @param folderId
 */


function shareFolderOpenFun(folderId) {
  $(".top_toolBar_block > div").show();
  isShareAndBorrowRoot = "true";

  if (folderId == "0") {
    //单位共享的
    window.frType = "103";
    window.allAcl = "false";
    window.listAcl = "false";
    window.readAcl = "false";
    window.addAcl = "false";
    window.editAcl = "false";
    window.delAcl = "false";
    window.lendAcl = "false";
    window.openToZoneAcl = "false";
    window.printAcl = "false";
    window.downloadAcl = "false";
    resId = folderId;
    docLibId = "20003";
  } else {
    //别人共享给我的根目录
    window.frType = "104";
    resId = folderId;
  }

  initBasicData();
}
/**
 * 视频文件夹打开方法
 * @param drObj
 */


function videoFolderOpenFun(drObj) {
  $(".top_toolBar_block > div").show();
  $(".right_main_block").show();
  $("#docLibIframe").hide().attr("src", "");
  frType = drObj.docResource.frType + "";
  resId = drObj.docResource.id + "";

  if (drObj.docLibType || drObj.docLibType === 0) {
    docLibType = drObj.docLibType + "";
  }

  if (typeof drObj.docResource.docLibId != "undefined") {
    docLibId = drObj.docResource.docLibId + "";
  }

  v = drObj.v; // isShareAndBorrowRoot = drObj.isBorrowOrShare + "";

  flipInfoForVideo.page = 1;
  flipInfoForVideo.size = 20;
  flipInfoForVideo._condition = null;
  flipInfoForVideo._value1 = "";
  flipInfoForVideo._value2 = "";
  flipInfoForVideo.isSearch = false;
  initSearch();
  initBasicData(function () {
    initToolBar();
    getRightVideoData();
  });
}
/**
 * 穿透文件
 * @param drObj
 */


function fileOpenFun(drObj) {
  // id, frType, all, edit, add, readonly, browse, list, isFolderLink,v,projectTypeId
  var fileAllAcl = drObj.allAcl + "";
  var fileListAcl = drObj.listAcl + "";
  var fileReadAcl = drObj.readAcl + "";
  var fileAddAcl = drObj.addAcl + "";
  var fileEditAcl = drObj.editAcl + "";
  var fileDelAcl = drObj.delAcl + "";
  var fileLendAcl = drObj.lendAcl + "";
  var fileOpenToZoneAcl = drObj.openToZoneAcl + "";
  var filePrintAcl = drObj.printAcl + "";
  var fileDownloadAcl = drObj.downloadAcl + "";
  var docId = drObj.id;
  var showBorrowApply = true;
  var entrance = window.entranceType;
  var isDelAlert = true;
  var baseDocId = null; //fnOpenKnowledge('${docsList.docResource.id}','${entranceType}',null,false,true)

  if (v3x.baseURL === '') {
    v3x.baseURL = _ctxPath;
  } // 从关联文档打开，不会显示申请借阅(先阶段，在关联文档打开也不会出现打不开的状况)


  if (entrance === 8 || entrance === '8' || typeof $ === 'undefined') {
    showBorrowApply = false;
  }

  if (entrance === 8 || entrance === '8') {
    //showDelete  在关联文档中表示是否是链接
    var isLink = showDelete;

    if (baseDocId === 'true' && isLink === 'false') {
      $.alert($.i18n('doc.prompt.noright'));
      return;
    }

    baseDocId = null;
  }

  var requestCaller = new XMLHttpRequestCaller(this, "docHierarchyManager", "getValidInfo", false);
  requestCaller.addParameter(1, "Long", docId);

  if (typeof entrance === 'undefined' || entrance === null) {
    entrance = 6;
  }

  requestCaller.addParameter(2, "Integer", entrance);

  if (typeof baseDocId === 'undefined' || baseDocId === null) {
    baseDocId = null;
  }

  requestCaller.addParameter(3, "Long", null);
  requestCaller.addParameter(4, "Long", baseDocId);
  ret = requestCaller.serviceRequest();
  var isExist = ret.charAt(0); // 现在为了统一，在任何位置都不提示删除

  showDelete = false; //20180629快速需求源文档不存在时，删除当前映射

  if (isExist === '2') {
    showDelete = true;
  }

  if (isExist === '4') {
    $.alert($.i18n('doc.prompt.docLib.disabled'));
    return;
  } else if (isExist !== '0') {
    if (showDelete && typeof delF !== 'undefined' && entrance != '8') {
      $.confirm($.i18n('doc.prompt.inexistence.delete'), function () {
        document.getElementById("isalert").value = "false";
        delF(docId, "self", false);
        document.getElementById("isalert").value = "";
      });
      return;
    } else {
      $.alert($.i18n('doc.prompt.inexistence'));
      return;
    }
  } // 0:代表有权限，1：代表没有打开权限，2代表没有资源，3代表仅仅有学习区的权限


  var hasOP = ret.charAt(1);

  if ((hasOP === 1 || hasOP === '1') && (entrance == '11' || entrance == 11)) {
    $.confirm({
      msg: $.i18n('doc.prompt.noright.sendlearningcancel.borrow'),
      ok_fn: function ok_fn() {
        fnAddDocBorrowApply(docId, null);
      }
    });
    return;
  }

  if (hasOP === '2' || hasOP === 2) {
    $.alert($.i18n('doc.prompt.noright'));
    return;
  }

  if (hasOP !== '0' && hasOP !== '3') {
    if (showBorrowApply && typeof fnAddDocBorrowApply !== 'undefined') {
      $.confirm({
        msg: $.i18n('doc.prompt.noright.borrow'),
        ok_fn: function ok_fn() {
          fnAddDocBorrowApply(docId, null);
        }
      });
      return;
    } else {
      $.alert($.i18n('doc.prompt.noright'));
      return;
    }
  } //文档库打开


  if ((entrance === 5 || entrance === '5') && (hasOP == '3' || hasOP === 3)) {
    //文档中心打开，仅仅学习区有权限
    if (showBorrowApply && typeof fnAddDocBorrowApply !== 'undefined') {
      $.confirm({
        msg: $.i18n('doc.prompt.noright.borrow'),
        ok_fn: function ok_fn() {
          fnAddDocBorrowApply(docId, null);
        }
      });
      return;
    } else {
      $.alert($.i18n('doc.prompt.noright'));
      return;
    }
  }

  var url = _ctxPath + ret.substring(2);

  if ((entrance === 6 || entrance === '6') && typeof ownerId !== 'undefined') {
    url = url + "&ownerId=" + ownerId;
  }

  url += CsrfGuard.getUrlSurffix();
  openCtpWindow({
    'url': url
  });
}
/**
 * 申请借阅
 * @param docResourceId 文档id
 * @param borrowUserId 借阅人
 * @param createUserId 文档创建人
 */


function fnAddDocBorrowApply(docResourceId, borrowUserId) {
  var needApprovalAjax = new XMLHttpRequestCaller(this, "docHierarchyManager", "needApproval", false);
  needApprovalAjax.addParameter(1, "Long", docResourceId);
  needApprovalAjax.addParameter(2, "String", "docAclApply");
  var needApproval = needApprovalAjax.serviceRequest();

  if (needApproval === true || needApproval === "true") {
    //互联互通审批

    /**
     * 互联互通，权限申请
     */
    var paramsForDel = {
      drId: docResourceId
    };
    var ajaxDocAclManager = new docAclManager();
    ajaxDocAclManager.aclApply(paramsForDel, {
      success: function success(rv) {
        rv = JSON.parse(rv);

        if (rv.type === "success") {
          new CtpUiMessage({
            title: $.i18n("doc.create.workflow.success"),
            type: "success"
          });
        } else {
          $.messageBox({
            'type': 100,
            'imgType': 2,
            'msg': rv.msg,
            buttons: [{
              id: 'btn1',
              text: $.i18n("common.button.ok.label"),
              handler: function handler() {
                window.close();
              }
            }]
          });
        }
      },
      error: function error(rv) {
        $.alert("apply Error");
      }
    });
  } else {
    //检测所有人是否有效
    var requestCaller2 = new XMLHttpRequestCaller(this, "knowledgePageManager", "getPotentModelUsers", false);
    requestCaller2.addParameter(1, "long", docResourceId);
    requestCaller2.addParameter(2, "boolean", false);
    var data2 = requestCaller2.serviceRequest(); //返回字符串，非json对象

    if (data2 == null || data2.length <= 2) {
      $.alert($.i18n("doc.member.delete.alert.js"));
      return;
    }

    var dialog = $.dialog({
      id: 'html',
      url: _ctxPath + "/doc/knowledgeController.do?method=applyBorrow&docId=" + docResourceId + getA8Top().CsrfGuard.getUrlSurffix(),
      title: $.i18n('doc.jsp.knowledge.borrow.apply'),
      width: 352,
      height: 120,
      overflow: 'hidden',
      closeParam: {
        show: true,
        handler: function handler() {
          dialog.close();
          window.close();
        }
      },
      buttons: [{
        text: $.i18n('common.button.ok.label'),
        isEmphasize: true,
        handler: function handler() {
          var data = $.parseJSON(dialog.getReturnValue());
          if (data == false) return; //                    var loginAccount = $.ctx.CurrentUser.loginAccount;

          var requestCaller = new XMLHttpRequestCaller(this, "knowledgePageManager", "applyDocBorrow", false);
          requestCaller.addParameter(1, "Long", borrowUserId);
          requestCaller.addParameter(2, "Long", docResourceId);
          requestCaller.addParameter(3, "String", data.spc1);
          requestCaller.addParameter(4, "String", data.borrowMsg);
          var data = requestCaller.serviceRequest();

          if (data === null) {
            $.alert({
              msg: $.i18n('doc.jsp.knowledge.borrow.apply.failed'),
              close_fn: function close_fn() {
                window.close();
              },
              ok_fn: function ok_fn() {
                window.close();
              }
            });
          } else {
            $.infor({
              msg: $.i18n('doc.jsp.knowledge.borrow.apply.success'),
              close_fn: function close_fn() {
                window.close();
              },
              ok_fn: function ok_fn() {
                window.close();
              }
            });
          }

          dialog.close();
        }
      }, {
        text: $.i18n('common.button.cancel.label'),
        handler: function handler() {
          dialog.close();
          window.close();
        }
      }]
    });
  }
}
/**
 * 取选中的id数组 自适应卡片式和列表式
 */


function getSelectedIds() {
  var isCard = $(".tableBtn").hasClass("currentLi");
  var selectIdList = [];

  if (isVideoLib == "true") {
    var liList = $("#video_card_ul > li.video_choose");

    for (var i = 0; i < liList.length; i++) {
      var drId = $(liList[i]).attr("drid");
      selectIdList.push(drId);
    }
  } else if (isCard) {
    var liList = $("#card_ul > li.currentChoose");

    for (var i = 0; i < liList.length; i++) {
      var drId = $(liList[i]).attr("drid");
      selectIdList.push(drId);
    }
  } else {
    var liList = $("#doc_grid tr > td:first-child :checkbox:checked:enabled");

    for (var i = 0; i < liList.length; i++) {
      var drId = $(liList[i]).val();
      selectIdList.push(drId);
    }
  }

  return selectIdList;
}
/**
 * 取选中的id数组(带密级校验)
 */


function getSelectedIdsForDeviceSecret() {
  var isCard = $(".tableBtn").hasClass("currentLi");
  var selectIdList = [];

  if (isVideoLib == "true") {
    var liList = $("#video_card_ul > li.video_choose");

    for (var i = 0; i < liList.length; i++) {
      var drId = $(liList[i]).attr("drid");
      selectIdList.push(drId);
    }
  } else if (isCard) {
    var liList = $("#card_ul > li.currentChoose");

    for (var i = 0; i < liList.length; i++) {
      var drId = $(liList[i]).attr("drid");
      selectIdList.push(drId);
    }
  } else {
    selectIdList = currentDocIds;
  }

  return selectIdList;
}

var currentDocIds = new Array();

function dealDeviceSecret(params) {
  currentDocIds = getSelectedIds();

  if (currentDocIds == null) {
    currentDocIds = new Array();
  }

  var secretBatchCheckParams = new Array();
  var rows = rightGrid.grid.getSelectRows();

  if (rows.length > 0) {
    var obj;

    for (var i = 0; i < rows.length; i++) {
      obj = rows[i];
      var param = new batchParam(obj.docResource.id, obj.docResource.frName);
      secretBatchCheckParams.push(param);
    }

    var secretCheckResult = callBackendMethod("secretAjaxManager", "batchCheckUserSecretLevel", secretBatchCheckParams);
    var secretCheck = new SecretCheck(secretCheckResult);
    currentDocIds = secretCheck.getSuccessIds();

    if (secretCheck.getCancelData().size() > 0) {
      if (secretCheck.getSuccessIds().length > 0) {
        secretCheck.messageDialog(dealCallBack, params);
      } else {
        secretCheck.messageDialog();
        currentDocIds = null;
      }
    } else {
      dealCallBack(params);
    }
  } else {
    dealCallBack(params);
  }
}

function dealCallBack(params) {
  if (params.method) {
    if (params.paramsLength == 1) {
      params.method(params.p1);
    } else if (params.paramsLength == 2) {
      params.method(params.p1, params.p2);
    } else if (params.paramsLength == 3) {
      params.method(params.p1, params.p2, params.p3);
    } else {
      params.method();
    }
  }
}

function buildSecretParams(method) {
  var params = {};
  params.method = method;
  params.paramsLength = 2;
  params.p1 = 'undefined';

  if (method == sendToDoc) {
    params.p2 = 'member';
  } else if (method == sendToDeptDoc) {
    params.p2 = depAdminSize;
  } else if (method == 'sendToDocForAccount') {
    params.method = sendToDoc;
    params.p2 = 'account';
  } else if (method == 'sendToDocForGroup') {
    params.method = sendToDoc;
    params.p2 = 'group';
  } else if (method == 'sendToLearnForAccount') {
    params.method = sendToLearn;
    params.p2 = 'account';
  } else if (method == 'sendToLearnForGroup') {
    params.method = sendToLearn;
    params.p2 = 'group';
  } else if (method == sendToDeptDoc) {
    params.p2 = depAdminSize;
  } else if (method == sendToPersonalLearnForDeviceSecret) {
    params.p1 = allAcl;
    params.p2 = isGroupLib;
  } else if (method == 'link') {
    params.method = moveOrLinkOrPigonhole;
    params.paramsLength = 1;
    params.p1 = 'link';
  } else if (method == 'move') {
    params.paramsLength = 1;
    params.method = moveOrLinkOrPigonhole;
    params.p1 = 'move';
  } else if (method == delDoc) {
    params.paramsLength = 0;
  } else if (method == docBatchDownload) {
    params.paramsLength = 0;
  } else if (method == setSecretLevels) {
    params.paramsLength = 0;
  }

  return params;
}

function batchParam(docId, subject) {
  this.objectId = docId;
  this.subject = subject;
}

function SecretCheck(result) {
  this.secretCheckResult = result;

  SecretCheck.prototype.getSuccessIds = function () {
    var idArray = new Array();

    for (var i = 0; i < this.secretCheckResult.length; i++) {
      if (this.secretCheckResult[i].resultCode === 0) {
        idArray.push(this.secretCheckResult[i].summaryId);
      }
    }

    return idArray;
  };

  SecretCheck.prototype.messageDialog = function (callback, params) {
    var url = _ctxPath + "/doc.do?method=secretBatch";
    var dialog1 = $.dialog({
      url: url,
      title: $.i18n('common.system.hint.label'),
      //系统提示
      width: 450,
      height: 310,
      targetWindow: getCtpTop(),
      isDrag: true,
      transParams: this,
      buttons: [{
        text: $.i18n('common.button.close.label'),
        //关闭
        handler: function handler() {
          dialog1.close();

          if (callback) {
            callback(params);
          }
        }
      }],
      closeParam: {
        show: true,
        handler: function handler() {
          dialog1.close();

          if (callback) {
            callback(params);
          }
        }
      },
      minParam: {
        show: false
      },
      maxParam: {
        show: false
      }
    });
  };

  SecretCheck.prototype.size = function () {
    return this.secretCheckResult.length;
  };

  SecretCheck.prototype.getCancelData = function () {
    var result = new ArrayList();

    for (var i = 0; i < this.secretCheckResult.length; i++) {
      var ele = this.secretCheckResult[i];

      if (ele && ele.resultCode !== 0) {
        result.add(ele);
      }
    }

    return result;
  };
}
/**
 * 合并选中项的权限
 */


function mergeAcl() {
  var idList = getSelectedIds();
  var basicAcl = new DocAcl();

  if (idList.length == 0) {
    //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 start
    var params = {
      all: allAcl,
      list: listAcl,
      read: readAcl,
      add: addAcl,
      edit: editAcl,
      del: delAcl,
      lend: lendAcl,
      openToZone: openToZoneAcl,
      print: printAcl,
      download: downloadAcl,
      isPrivateLib: isPrivateLib,
      folderEnabled: folderEnabled,
      a6Enabled: a6Enabled,
      officeEnabled: officeEnabled,
      ofdEnabled: ofdEnabled,
      uploadEnabled: uploadEnabled,
      isGroupLib: isGroupLib,
      isEdocLib: isEdocLib,
      isVideoLib: isVideoLib,
      isShareAndBorrowRoot: isShareAndBorrowRoot,
      onlyA6: onlyA6 + "",
      onlyA6s: onlyA6s + ""
    };
    checkBarAcl(params); //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end
  } else {
    var mergeObj = {
      canMove: true,
      canDel: true,
      canSendToFavoriteOrLearning: false,
      isLink: false,
      isFolderLink: false,
      isFolder: false,
      isPig: false,
      isSysInit: false,
      isCollect: false,
      hasMedia: false,
      isColOrForm: false
    };
    var firstDrObj; //多选时，如果有一个不能下载，则批量下载按钮禁用

    var enableBatchDownloadBtn = true;

    for (var i = 0; i < idList.length; i++) {
      var drId = idList[i];
      var drObj = nowPageDr[drId];
      firstDrObj = drObj;

      if (idList.length > 1 && drObj.downloadAcl === false) {
        enableBatchDownloadBtn = false;
      }

      var isCreater = currentUserId == drObj.docResource.createUserId;

      var _LookAcl = drObj.listAcl && drObj.readAcl;

      var hasLockAccess = !drObj.docResource.isCheckOut || drObj.docResource.isCheckOut && (drObj.isOwnerOfLib || drObj.docResource.checkOutUserId == currentUserId);
      var hasMedia = parseInt(drObj.docResource.mimeTypeId) == 131 || parseInt(drObj.docResource.mimeTypeId) == 132;

      if (drObj.docResource.isFolder) {
        mergeObj.isFolder = true;
      }

      if (drObj.isFolderLink) {
        mergeObj.isFolderLink = true;
      }

      if (drObj.isLink) {
        mergeObj.isLink = true;
      }

      if (drObj.isCollect) {
        mergeObj.isCollect = true;
      }

      if (drObj.isPig) {
        mergeObj.isPig = true;
      }

      if (drObj.isSysInit) {
        mergeObj.isSysInit = true;
      }

      if (hasMedia) {
        mergeObj.hasMedia = true;
      }

      if (_LookAcl || isCreater && (drObj.editAcl || drObj.delAcl || drObj.addAcl)) {
        mergeObj.canSendToFavoriteOrLearning = true;
      }

      basicAcl.mergeAcl(drObj.allAcl, drObj.listAcl, drObj.readAcl, // drObj.addAcl, //新建权限走的是父级的，与子级不相干
      window.addAcl, drObj.editAcl, drObj.delAcl, drObj.printAcl, enableBatchDownloadBtn && drObj.downloadAcl, drObj.lendAcl, drObj.openToZoneAcl);
    }

    mergeObj.isColOrForm = idList.length == 1 && (firstDrObj.docResource.frType == 1 || firstDrObj.docResource.frType == 9);
    var params = {
      all: basicAcl.allAcl + "",
      list: basicAcl.listAcl + "",
      read: basicAcl.readAcl + "",
      add: basicAcl.addAcl + "",
      edit: basicAcl.editAcl + "",
      del: basicAcl.delAcl + "",
      lend: basicAcl.lendAcl + "",
      openToZone: basicAcl.openToZoneAcl + "",
      print: basicAcl.printAcl + "",
      download: (enableBatchDownloadBtn && basicAcl.downloadAcl) + "",
      isPrivateLib: isPrivateLib,
      folderEnabled: folderEnabled,
      a6Enabled: a6Enabled,
      officeEnabled: officeEnabled,
      ofdEnabled: ofdEnabled,
      uploadEnabled: uploadEnabled,
      isGroupLib: isGroupLib,
      isEdocLib: isEdocLib,
      isVideoLib: isVideoLib,
      isShareAndBorrowRoot: isShareAndBorrowRoot,
      onlyA6: onlyA6 + "",
      onlyA6s: onlyA6s + "",
      dr: mergeObj
    };
    checkBarAcl(params); //作者:dengwei 时间2020-09-20 功能文档中心兼容ofd文件之展示ofd文件 end
  }
}
/**
 * 系统类型定义（用于归档文件的类型判断）
 */


function appEnumData() {
  this.global = '0'; // 全局

  this.collaboration = '1'; // 协同应用

  this.form = '2'; // 表单

  this.doc = '3'; // 知识管理

  this.edoc = '4'; // 公文

  this.plan = '5'; // 计划

  this.meeting = '6'; // 会议

  this.bulletin = '7'; // 公告

  this.news = '8'; // 新闻

  this.bbs = '9'; // 讨论

  this.inquiry = '10'; // 调查

  this.mail = '12'; // 邮件

  this.organization = '13'; // 组织模型

  this.info = '32'; // 信息报送

  this.infoStat = '33'; // 信息报送统计
}

function entranceEnumData() {
  this.knowledgeSquare = 0; //"知识广场"

  this.mydocument = 1; //"我的文档夹"

  this.borrowOrShare = 2; //"他人共享/借阅文档夹"

  this.borrowOut = 3; //"我借出的文档夹"

  this.shareOut = 4; //"我共享出的文档夹"

  this.otherLibs = 5; //"非个人文档库"

  this.defaultEntrance = 6; //"其他人口"

  this.docLearningMore = 7; //"学习区更多界面"

  this.associatedDoc = 8; //"关联文档"

  this.edocDocLib = 9; //"公文文档库"

  this.historyVersion = 10; //"历史版本"

  this.docMessageForLearn = 11; //"历史版本"?
}

function gridSelectAllPersonalFunction() {
  mergeAcl();
}

function advancedSearch() {
  if (!$("#search_block").is(":visible")) {
    changeRightBlock("search_block");
    var src = _ctxPath + "/doc.do?method=docAdvancedSearch&folderId=" + window.resId;
    $("#advancedSearch").attr("src", src);
  } else {
    changeRightBlock("table_block");
  }
}
/**
 * 切右侧列表的方法
 * @param blockName
 */


function changeRightBlock(blockName) {
  var rightList = ["card_block", "table_block", "other_share_block", "search_block", "video_block"];

  for (var i = 0; i < rightList.length; i++) {
    var _block = rightList[i];

    if (_block == blockName) {
      $("#" + _block).show();
    } else {
      $("#" + _block).hide();
    }
  }

  $("#toolbar").show();

  if (blockName == "video_block") {
    $(".right_path").hide();
    $(".right_main_block").css("top", "0");
  } else {
    $(".right_path").show();
    $(".right_main_block").css("top", "54px");
  }

  if (blockName == "other_share_block" || blockName == "search_block") {
    $("#toolbar").hide();
    $(".right_table_block_container").css("top", "0");
  } else {
    $(".right_table_block_container").css("top", "54px");
  }
}

function moreVideoFolder(showOrHide) {
  /*var headBlock = $("#video_header_block");
  if(headBlock.hasClass("stateCollapse")){
      //把分类展开
      $(".video_more_btn").html($.i18n('common.retract.label')+'<i class="syIcon sy-arrow-up"></i>');
      headBlock.attr("class","video_header_block stateExpand has_more");
      headBlock.css("height","100px");
      $("#video_order_block").css("top","100px");
      $("#video_card_ul").css("top","165px");
  }else if(headBlock.hasClass("stateExpand")){
      //把分类收起
      $(".video_more_btn").html($.i18n('common.more.label')+'<i class="syIcon sy-arrow-down"></i>');
      headBlock.attr("class","video_header_block stateCollapse has_more");
      headBlock.css("height","60px");
      $("#video_order_block").css("top","60px");
      $("#video_card_ul").css("top","125px");
  }*/
}

function videoUpload(drId) {
  var url = _ctxPath + "/doc.do?method=videoUploadDialog&folderId=" + window.resId;

  if (drId) {
    url += "&drId=" + drId;
  }

  if (isSecretLevel == true) {
    url += "&isSetSecretLevel=" + isSecretLevel;
  }

  getA8Top().docVideoUpload = getA8Top().$.dialog({
    id: "docVideoUpload",
    title: $.i18n("doc.media.upload"),
    transParams: {
      'parentWin': window
    },
    width: 500,
    height: 310,
    url: url,
    closeParam: {
      'show': true,
      autoClose: false,
      handler: function handler() {
        if (drId) {
          unlockAfterAction(drId);
        }
      }
    },
    buttons: [{
      id: 'btn1',
      text: v3x.getMessage("common.button.ok.label"),
      emphasize: "button-default_emphasize",
      handler: function handler() {
        getA8Top().docVideoUpload.getReturnValue();

        if (drId) {
          if (drId) {
            unlockAfterAction(drId);
          }
        }
      }
    }, {
      id: 'btn2',
      text: v3x.getMessage("common.button.cancel.label"),
      handler: function handler() {
        getA8Top().docVideoUpload.close();

        if (drId) {
          unlockAfterAction(drId);
        }
      }
    }]
  });
}

function videoUploadCallback(data, fileName) {
  if (data === "success") {
    if (isVideoLib == "true") {
      getRightVideoData(null, null, null);
      initToolBar();
    } else {
      initBasicData();
    }

    getA8Top().docVideoUpload.close();
  } else if (data === "success-wf") {
    var deleteSuccessTips = new CtpUiMessage({
      title: $.i18n("doc.create.workflow.success"),
      type: "success"
    });
    getA8Top().docVideoUpload.close();
  } else if (data === "sameName") {
    $.alert($.i18n("DocLang.doc_upload_dupli_name_failure_alert", fileName));
  } else if (data !== "") {
    new CtpUiMessage({
      title: data,
      type: "error"
    });
  }
}

function changeVideoOrder(type) {
  $(".video_order_btn").toggleClass("current_order", false);

  if (type == 1) {
    $("#videoNewlyOrder").toggleClass("current_order", true);
  }

  if (type == 2) {
    $("#videoHotOrder").toggleClass("current_order", true);
  }

  flipInfoForVideo.page = 1;
  flipInfoForVideo.size = 20;
  getRightVideoData();
  initToolBar();
}

function getAllVideoInLib() {
  $(".current_folder").toggleClass("current_folder", false);
  $("#allVideo").toggleClass("current_folder", true);
  initVideoCard("doc", false);
}

function onlyHideHistory() {
  //隐藏
  $("#videoHistory").attr("class", "video_history_btn");
  $("#video_history_block").hide();
}

function showHistory(event) {
  if ($("#video_history_block").is(":visible")) {
    //隐藏
    $("#videoHistory").attr("class", "video_history_btn");
    $("#video_history_block").hide();
  } else {
    //展开
    $("#videoHistory").attr("class", "video_history_btn expandBtn");
    $("#video_history_list > li").remove();
    $("#video_history_list > .noDataIconBox").remove();
    ajaxDocHierarchyManager.historyMediaList({
      success: function success(rv) {
        var _videoCardLiTPL = $("<li class='video_history_li'>" + "   <div class='video_history_li_left'>" + "           <img src=''>" + "   </div>" + "   <div class='video_history_li_right'>" + "       <div class='video_history_title'><span></span></div>" + "       <div class='video_history_time'><span></span></div>" + "    </div>" + "</li>");

        var historyUl = $("#video_history_list");
        var drList = rv;

        if (drList.length > 0) {
          for (var i = 0; i < drList.length; i++) {
            var dr = drList[i];

            var kageBunshin = _videoCardLiTPL.clone(false);

            var id = dr.docResoureId;
            var frName = dr.frName;
            var frCoverId = dr.coverImageId; //列表

            kageBunshin.attr("drId", id);
            kageBunshin.find(".video_history_title > span").text($.i18n(frName)).attr("title", $.i18n(frName));
            kageBunshin.find(".video_history_time > span").text(dr.relativeTimeStr).attr("title", dr.relativeTimeStr); //展示图片

            if (frCoverId == "-2") {
              kageBunshin.find(".video_history_li_left img").attr("src", _ctxPath + "/common/images/audio.png");
            } else {
              kageBunshin.find(".video_history_li_left img").attr("src", _ctxPath + "/fileUpload.do?method=showRTE&type=image&fileId=" + frCoverId);
            } //加drid


            kageBunshin.click(function () {
              var drId = $(this).attr("drId");
              fileOpenFun({
                id: drId
              });
            });
            historyUl.append(kageBunshin);
          }
        } else {
          historyUl.append('<table height="100%" width="100%" class="noDataIconBox"><tr><td  align="center"><span class="noDataIcon noDataIcon1x"></span>' + $.i18n('doc.label.noViewingHistory') + '</td></tr></table>');
        }
      }
    });
    $("#video_history_block").show();
  }

  var _event = event ? event : window.event;

  _event.stopPropagation();
} // 解决ie8下字体图标渲染拖后腿的问题，此处省略10000字


var renderIconFont4Ie8 = function renderIconFont4Ie8() {
  if (SeeUtils.isIE8) {
    $('html').addClass('fix-ie-font-face');
    setTimeout(function () {
      $('html').removeClass('fix-ie-font-face');
    }, 10);
  }
};

function docHisCollBack(refresh) {
  getA8Top().docHisWin.close();

  if (refresh == "true") {
    freshTableOrCard();
  }
}

var winSetSecretLevel;

function setSecretLevels(docId) {
  var idList = [];
  var attFlag = [];

  if (typeof docId != "undefined") {
    idList.push(docId);
  } else {
    idList = getSelectedIdsForDeviceSecret();
  }

  if (!idList) {
    return;
  }

  if (idList.length == 0) {
    $.alert($.i18n("DocLang.doc_space_alter_not_select"));
  }

  if (idList.length > 0) {
    for (var i = 0; i < idList.length; i++) {
      var id = idList[i];
      var drObj = nowPageDr[id];
      attFlag.push(drObj.docResource.hasAttachments);

      if (drObj.docResource.isCheckOut == true) {
        alert($.i18n('doc.checkout.document.secret'));
        return;
      }
    }
  }

  winSetSecretLevel = $.dialog({
    id: "setSecretLevel",
    title: v3x.getMessage("doc.title.set.secretLevel"),
    url: _ctxPath + "/doc.do?method=setSecretLevel&attFlag=" + attFlag + "&rowid=" + idList + getA8Top().CsrfGuard.getUrlSurffix(),
    transParams: {
      'parentWin': window
    },
    width: 380,
    height: 320,
    buttons: [{
      id: 'btn1',
      text: $.i18n("common.button.ok.label"),
      handler: function handler() {
        var returnValues = winSetSecretLevel.getReturnValue();
      }
    }, {
      id: 'btn2',
      text: $.i18n("common.button.cancel.label"),
      handler: function handler() {
        for (var i = 0; i < idList.length; i++) {
          unlockAfterAction(idList[i]);
        }

        winSetSecretLevel.close();
      }
    }]
  });
} //文档中心归档按钮逻辑


function archiveOtherSystem() {
  //var idList = getSelectedIds();
  var idList = [];
  var v = rightGrid.grid.getSelectRows();

  if (v.length == 0) {
    $.alert($.i18n("archive.button.tip3"));
  } else if (v.length > 20) {
    $.alert($.i18n("archive.button.tip2"));
  } else {
    var hasFolder = false;

    for (var i = 0; i < v.length; i++) {
      if (v[i].docResource.isFolder) {
        hasFolder = true;
        break;
      }

      idList[idList.length] = v[i].id;
    }

    if (hasFolder) {
      $.alert("不支持对文件夹进行归档，请重新选择！");
      return;
    }

    callBackendMethod("docArchiveManager", "checkArcStateResult", idList, {
      success: function success(checkResult) {
        if (checkResult) {
          $.confirm({
            'msg': checkResult,
            ok_fn: function ok_fn() {
              docArchive(idList);
            }
          });
        } else {
          docArchive(idList);
        }
      }
    });
  }
}

function docArchive(idList) {
  var docArchiveManager = new baseDocArchiveManager(); //开启进度条

  var proce = $.progressBar({
    text: $.i18n("archive.when.tip")
  }); //TODO 执行归档按钮逻辑

  if (isSdams) {
    //TODO 归档到网智电子档案
    callBackendMethod("sdamsBusinessManager", "docArchive", idList, {
      success: function success(ret) {
        proce.close();
        archiveResult(ret);
      }
    });
    return;
  }

  docArchiveManager.archive(idList, {
    success: function success(data) {
      proce.close();
      archiveResult(data);
    }
  });
}

function archiveResult(data) {
  try {
    if (data.success == true) {
      if (data.notArchiveCount > 0) {
        $.messageBox({
          'imgType': 0,
          'type': 0,
          'msg': v3x.getMessage("archive.result.tip1", data.successCount, data.failCount, data.notArchiveCount),
          ok_fn: function ok_fn() {
            $("#doc_grid").ajaxgridLoad();
          },
          buttons: [{
            id: 'ok',
            text: "${ctp:i18n('common.button.ok.label')}"
          }]
        });
      } else {
        $.messageBox({
          'imgType': 0,
          'type': 0,
          'msg': v3x.getMessage("archive.result.tip2", data.successCount, data.failCount),
          ok_fn: function ok_fn() {
            $("#doc_grid").ajaxgridLoad();
          },
          buttons: [{
            id: 'ok',
            text: "${ctp:i18n('common.button.ok.label')}"
          }]
        });
      }
    } else {
      $.alert(data.message);
    }
  } catch (e) {
    alert(e);
  }

  ;
}