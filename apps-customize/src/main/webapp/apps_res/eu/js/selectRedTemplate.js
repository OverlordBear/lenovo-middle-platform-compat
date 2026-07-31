// js开始处理
$(function() {
  pageX.ajaxM = new euFileZManager();
  pageX.toolBar = toolBar("toolbar").addAll([]).init(toolBarItems);
  pageX.searchBar = searchBar().init(sbarItems).showItem("name","");;
  pageX.tab = euTab("useTable").init(tabItems, {
      "parentId":$('.layout_center').eq(0).attr('id'),
      "slideToggleBtn":false,// 上下伸缩按钮是否显示
      "resizable":false,// 明细页面的分隔条
      "gridType": 'autoGrid',
      "render" : tabRender,
      "managerName":"euFileZManager",
      "managerMethod":"getEdocDocTemplateList"
  });
    pageX.tab.load();
});

function tabRender(text, row, rowIndex, colIndex, col) {
  var _text = (text == null) ? "" : text;
  return _text;
}

function fnSearch(data){
  pageX.data = data;
  pageX.tab.load(data);
}

function sbarItems(){
  return {
    "name":{
      id : 'name',
      name : 'name',
      type : 'input',
      text : "套红文件",
      value : 'name'
    }
  }
}

function tabItems(){ 
	return [{
	    display : 'id',
	    name : 'id',
	    align : 'center',
	    width : 'small',
	    sortable : true,
	    type : 'radio'
	  },{
		display : "套红文件",
		name : 'name',
		width : 'big',
		sortable : true,
		align : 'left'
	},{
		display : "创建时间",
		name : 'createTime',
		width : 'big',
		sortable : true,
		align : 'left'
	}];
}

function OK() {
	var rows = pageX.tab.selectRows();
	return rows;
}


function toolBarItems() {
  return {
 };
}