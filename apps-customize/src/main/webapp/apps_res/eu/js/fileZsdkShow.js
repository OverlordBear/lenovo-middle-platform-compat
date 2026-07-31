$(function() {
	var items=$.parseJSON(redJson);
	var redTable=$.parseJSON(redTableJSON);
//	var items =  [
//		{ key: '交付方式', val: '张三' },
//		{ key: 'id_number', val: '110105202201013350' },
//		{ key: 'address', val: '海淀区上地东路东北旺软件园2号' }      
//		];
	window.ZOfficeSDK.mount(fileZurl, "#doc1", true).then(async function(app) {
		for(let it of items) {
			if (it.val && it.val != "") {
				var bm = await app.ActiveDocument.Bookmarks.item(it.key);
				bm && await bm.setText(it.val);
			}
		}
		for(var redRow in redTable) {
			var data=redTable[redRow];
			var bm1 = await app.ActiveDocument.Bookmarks.item(redRow);
			var bm1Range = await bm1.range;
			var tbl = await bm1Range.Tables.item(1);	// 获取书签下的表格
			var success = await tbl.Rows.add(1, data.length, false);		// 向表格的第一行后面插
			var dataList=data[0];
			var rowIndex = 0;
			for (let i = 2; i <= data.length+1; i+= 1) {
			    const row = await tbl.Rows.item(i);
			    let colIndex = 0;
			    for (let j = 1; j <= dataList.length; j += 1) {
			        const cell = await row.Cells.item(j);
			        await cell.setText(data[rowIndex][colIndex]);	// 设置单元格内容
			        colIndex += 1;
			    }
			    rowIndex += 1;
			}
		}
		
//		var data = [['aa', 'bb'], ['cc', 'dd']];	// 预制数据
//		var bm1 = await app.ActiveDocument.Bookmarks.item('付款明细表');
//		var bm1Range = await bm1.range;
//		var tbl = await bm1Range.Tables.item(1);	// 获取书签下的表格
//		var success = await tbl.Rows.add(1, 2, false);		// 向表格的第一行后面插入两行
//		var rowIndex = 0;
//		for (let i = 2; i <= 3; i+= 1) {
//		    const row = await tbl.Rows.item(i);
//		    let colIndex = 0;
//		    for (let j = 1; j <= 2; j += 1) {
//		        const cell = await row.Cells.item(j);
//		        await cell.setText(data[rowIndex][colIndex]);	// 设置单元格内容
//		        colIndex += 1;
//		    }
//		    rowIndex += 1;
//		}
	});

});