$(function() {
	window.ZOfficeSDK.mount(fileZurl, "#doc1", true).then(async function(app) {
		console.log("view");
	});
});