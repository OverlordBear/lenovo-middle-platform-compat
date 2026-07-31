$(function() {
	window.ZOfficeSDK.mount(fileZurl, "#doc1", true).then(async function(app) {
		//gjx-start：2026-07-14 ①移除强制开启修订模式（原 await app.ActiveDocument.enableTrackChange()，
		//   留痕与否交由业务/用户在编辑器内自行决定）；
		// ②将 app 暴露给外层页面：清稿按钮通过同源 iframe 读取 __filezApp，
		//   在编辑会话内调 Revisions.acceptAll() 接受全部修订（保留作者身份，格式修订也能接受，
		//   规避服务端 ClearDoc 漏清 rPrChange、剥离身份产生"绿色幽灵修订"的缺陷）
		window.__filezApp = app;
		//gjx-end
	});
});
