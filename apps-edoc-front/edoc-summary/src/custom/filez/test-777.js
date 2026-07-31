//gjx-start：「正文下载」自定义按钮逻辑（客开新增文件，handle 键 test777，由 handles-patch.js 运行时注册）
import state from '@/store/state';

export default async function test777Action() {
  const edocContent = state.edocContent;
  if (!edocContent) {
    console.warn("未获取到正文上下文");
    return;
  }

  // 1. 获取基础路径和 affairId (公文核心参数)
  const basePath = typeof window.basePath === 'function' ? window.basePath() : '/seeyon';

  // 优先从 URL 获取 affairId，如果没有，尝试从 state 或全局变量中兜底获取
  const urlParams = new URLSearchParams(window.location.search);
  let affairId = urlParams.get('affairId');
  if (!affairId && state.summary) affairId = state.summary.affairId; // 兜底策略

  if (!affairId) {
    console.warn("未能获取到 affairId，无法发起打包请求");
    return;
  }

  // --- 核心步骤 1：发起打包申请，获取 Key ---
  // 完全对齐你抓包拿到的真实 URL 结构
  const packUrl = `${basePath}/govdoc/govdoc.do?method=packAndDownload&downloadBody=1&downloadAttachment=0&downloadFormType=-1&affairId=${affairId}&showReplyComment=true`;

  try {
    console.log("🚀 [步骤1] 正在向后端申请打包正文...");

    const packResponse = await fetch(packUrl, {
      method: 'POST', // 必须是 POST
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'same-origin', // 【关键】确保带上致远的 JSESSIONID 登录态
      body: 'formArguments=' // 对应你之前截图里的 Form Data
    });

    if (!packResponse.ok) {
      throw new Error(`打包请求失败，状态码: ${packResponse.status}`);
    }

    // 解析后端返回的 JSON 数据 {"key":"xxxxxxx"}
    const resData = await packResponse.json();
    const downloadKey = resData.key;

    if (!downloadKey) {
      throw new Error("后端响应成功，但返回数据中没有找到 key！");
    }

    console.log("✅ [步骤1完成] 拿到下载凭证 Key:", downloadKey);

    // --- 核心步骤 2：拿着 Key 去提取真正的文件流 ---
    // 完全对齐你的第二个请求链接
    const downloadUrl = `${basePath}/govdoc/govdoc.do?method=getDownloadFileByKey&key=${downloadKey}`;
    console.log("🚀 [步骤2] 正在拉取文件流...", downloadUrl);

    // 采用 a 标签静默下载
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // 延时移除，确保浏览器有足够时间捕获点击事件
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);

    console.log("🎉 正文下载动作已完美触发！");

  } catch (error) {
    console.error("❌ 下载流程发生异常:", error);
    // 这里可以换成致远的 UI 提示，例如：
    // if(window.vueData) window.vueData.$message.error('下载失败：' + error.message);
  }
}
//gjx-end
