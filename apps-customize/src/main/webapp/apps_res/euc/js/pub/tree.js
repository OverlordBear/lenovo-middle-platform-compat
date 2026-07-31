function euTree(id,options) {
    var tree = {
    	"id" : id,
      "init" : init,
      "selectNode":selectNode,// 获取选中节点
      "getNodes":getNodes,// 获取所有节点或指定属性的节点
      "load":load,// 从后台载入
      "reload":reload,// 重新刷新当前树
      "expand":null,// 展开节点
      "treeObj":null
    };
    
    function init(beanId,method,treeClk){
      tree.beanId = beanId;
      tree.method = method;
      tree.treeClk = treeClk;
    }
    
    function getNodes(){
      return tree.treeObj.getNodes();
    }
    
    function selectNode(node){
      if(node){
        tree.treeObj.selectNode(node);
      }else{
       return tree.treeObj.getSelectedNodes();
      }
    }
    
    
    
    function load(){
      tree.treeObj.reAsyncChildNodes(null, "refresh");
    }
    
    function reload(){
      tree.treeObj.transformToArray([]); 
      load();
    }
    
    
    
    function argsBuilder(treeClk) {
      var defaultSet = {
        "idKey" : "id",
        "pIdKey" : "pid",
        "nameKey" : "name",
        "onClick" : function(e, treeId, node){
          if(tree.treeClk instanceof Function){
            tree.treeClk(e, treeId, node);
          } else if (typeof (fnTreeClk) !== 'undefined'){
            fnTreeClk(e, treeId, node);
          } 
        },
        "asyncParam" : {},
        "nodeHandler" : function(node) {
          if (node.data.pid == '-1') {
            node.isParent = true;
            node.open = true;
          } else {
            node.isParent = false;
          }
        },
        render : function(name, data) {
          return name;
        }
      };
      
      var settings = $.extend(true, defaultSet, options);
      
      if(tree.beanId){
        settings.managerName = tree.beanId;
        settings.managerMethod = tree.method;
      }
      return settings;
  }
    
  $("#"+id).tree(argsBuilder());
  tree.treeObj = $("#"+id).treeObj();
  return tree;
}