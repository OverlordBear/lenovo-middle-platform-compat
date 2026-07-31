<%@ page contentType="text/html; charset=UTF-8" isELIgnored="false"%>
<%@ taglib prefix="ctp" uri="http://www.seeyon.com/ctp"%>
<%
	response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	response.setHeader("Pragma", "no-cache");
	response.setDateHeader("Expires", 0L);
%>
<%-- //gjx-start：2026-07-09 配置中心第二版
     1. 存取链路照搬 AAAZSbankCommonConfig：ctp ConfigManager(ctp_config_item) + fetch 读写
        · 读取 GET  /euFileZ.do?method=configData
        · 保存 POST /euFileZ.do?method=saveConfig（保存后立即热生效）
        · 弃用 euc 配置框架（jval/fnOK/eucConfigManager，按 mode+userId 键存取导致保存不生效）
     2. 删除套红字段开关面板（需求变更：不套红的字段直接改模板）
     3. UI 重做：灰白液态玻璃（glassmorphism）风格，零外部依赖（无 jQuery/euc js） --%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<title>FileZ 集成配置中心</title>
<style type="text/css">
	/* ===================== 基底 ===================== */
	* { box-sizing: border-box; }
	html, body {
		height: 100%; margin: 0; padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", "微软雅黑", Roboto, sans-serif;
		color: #2b2f36; font-size: 14px;
		overflow: hidden;
	}
	body {
		display: flex; flex-direction: column;
		background:
			radial-gradient(1100px 500px at 85% -10%, rgba(200,206,218,.55), transparent 60%),
			radial-gradient(900px 480px at -10% 30%, rgba(228,231,238,.9), transparent 55%),
			radial-gradient(700px 420px at 55% 115%, rgba(210,214,224,.5), transparent 60%),
			linear-gradient(165deg, #f2f3f6 0%, #e9ebef 46%, #f5f6f8 100%);
	}
	/* 装饰光斑：营造玻璃后的景深 */
	.bg-orb { position: fixed; border-radius: 50%; filter: blur(70px); pointer-events: none; z-index: 0; }
	.orb-1 { width: 380px; height: 380px; top: -120px; right: 12%;  background: rgba(255,255,255,.75); }
	.orb-2 { width: 320px; height: 320px; bottom: -80px; left: 6%;  background: rgba(190,197,210,.45); }
	.orb-3 { width: 240px; height: 240px; top: 38%; right: -60px;   background: rgba(215,220,230,.55); }

	/* ===================== 液态玻璃通用 ===================== */
	.glass {
		background: linear-gradient(135deg, rgba(255,255,255,.72) 0%, rgba(255,255,255,.42) 100%);
		-webkit-backdrop-filter: blur(22px) saturate(150%);
		backdrop-filter: blur(22px) saturate(150%);
		border: 1px solid rgba(255,255,255,.65);
		box-shadow: 0 8px 32px rgba(31, 38, 45, .10), inset 0 1px 0 rgba(255,255,255,.8);
	}

	/* ===================== 顶部栏 ===================== */
	.topbar {
		position: relative; z-index: 5; flex: none;
		margin: 14px 18px 0; padding: 16px 24px;
		border-radius: 16px;
		display: flex; align-items: center; gap: 16px;
		overflow: hidden;
	}
	/* 液态高光流线 */
	.topbar::after {
		content: ''; position: absolute; top: 0; left: -40%;
		width: 60%; height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent);
		animation: liquid-sweep 6s ease-in-out infinite;
	}
	@keyframes liquid-sweep { 0%,100% { left: -40%; } 50% { left: 80%; } }
	.topbar-icon {
		width: 42px; height: 42px; border-radius: 12px; flex: none;
		background: linear-gradient(135deg, #43474f, #23262c);
		color: #fff; font-size: 20px;
		display: flex; align-items: center; justify-content: center;
		box-shadow: 0 4px 14px rgba(35, 38, 44, .35), inset 0 1px 0 rgba(255,255,255,.18);
	}
	.topbar h1 { margin: 0; font-size: 17px; font-weight: 600; letter-spacing: .5px; color: #24272d; }
	.topbar p  { margin: 3px 0 0; font-size: 12px; color: #7a8089; }
	.mode-pill {
		margin-left: auto; flex: none;
		display: inline-flex; align-items: center; gap: 7px;
		padding: 5px 14px; border-radius: 999px; font-size: 12px; color: #5c636d;
		background: rgba(255,255,255,.55);
		border: 1px solid rgba(255,255,255,.7);
		box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
	}
	.mode-pill .dot { width: 7px; height: 7px; border-radius: 50%; background: #9aa3ad; box-shadow: 0 0 6px rgba(154,163,173,.8); }
	.mode-pill.editing .dot { background: #f0b429; box-shadow: 0 0 8px rgba(240,180,41,.8); }

	/* ===================== 页签栏（gjx 2026-07-15：三卡片改多页签切换） ===================== */
	.tabbar {
		position: relative; z-index: 4; flex: none;
		margin: 12px 18px 0; padding: 6px;
		border-radius: 14px;
		display: flex; gap: 6px;
	}
	.tab-btn {
		flex: none; height: 36px; padding: 0 22px;
		border-radius: 10px; border: 1px solid transparent;
		background: transparent; color: #5c636d;
		font-size: 13px; cursor: pointer;
		transition: all .22s ease;
	}
	.tab-btn:hover { background: rgba(255,255,255,.55); color: #23262c; }
	.tab-btn.active {
		color: #fff;
		background: linear-gradient(135deg, #454a53, #23262c);
		box-shadow: 0 3px 12px rgba(35,38,44,.28), inset 0 1px 0 rgba(255,255,255,.16);
	}

	/* ===================== 内容区 ===================== */
	.scroll { position: relative; z-index: 1; flex: 1; overflow-y: auto; padding: 18px 18px 96px; }
	.scroll::-webkit-scrollbar { width: 8px; }
	.scroll::-webkit-scrollbar-thumb { background: rgba(140,147,158,.35); border-radius: 8px; }
	.scroll::-webkit-scrollbar-thumb:hover { background: rgba(140,147,158,.55); }

	.card {
		max-width: 940px; margin: 0 auto 18px;
		border-radius: 16px; padding: 22px 26px;
		transition: transform .25s ease, box-shadow .25s ease;
	}
	.card:hover { transform: translateY(-1px); box-shadow: 0 12px 40px rgba(31,38,45,.13), inset 0 1px 0 rgba(255,255,255,.8); }

	.card-header {
		display: flex; align-items: center; gap: 10px;
		padding-bottom: 14px; margin-bottom: 18px;
		border-bottom: 1px solid rgba(120,128,140,.14);
	}
	.card-icon {
		width: 32px; height: 32px; border-radius: 9px; flex: none;
		display: flex; align-items: center; justify-content: center; font-size: 15px;
		background: rgba(255,255,255,.65);
		border: 1px solid rgba(255,255,255,.8);
		box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 2px 8px rgba(31,38,45,.06);
	}
	.card-title { font-size: 15px; font-weight: 600; color: #2b2f36; }
	.card-sub   { font-size: 12px; color: #8a919b; margin-left: 2px; }

	.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 22px; }
	.form-group { display: flex; flex-direction: column; gap: 6px; }
	.form-group.full { grid-column: span 2; }
	.form-label { font-size: 13px; font-weight: 500; color: #4a505a; }
	.form-label .key { color: #a3aab4; font-weight: 400; font-size: 12px; margin-left: 6px; }
	.form-hint { font-size: 12px; color: #98a0aa; line-height: 1.5; }

	.ipt {
		height: 34px; padding: 0 12px; width: 100%;
		border-radius: 9px; font-size: 13px; color: #2b2f36;
		background: rgba(255,255,255,.6);
		border: 1px solid rgba(180,186,196,.45);
		box-shadow: inset 0 1px 2px rgba(31,38,45,.05);
		transition: border-color .25s, box-shadow .25s, background .25s;
		outline: none;
	}
	.ipt.mono { font-family: Consolas, Monaco, "Courier New", monospace; }
	.ipt::placeholder { color: #b6bcc5; }
	.ipt:focus {
		background: rgba(255,255,255,.85);
		border-color: rgba(110,118,130,.55);
		box-shadow: inset 0 1px 2px rgba(31,38,45,.04), 0 0 0 3px rgba(130,138,150,.14);
	}
	/* 只读态：隐入背景呈纯文本 */
	body.readonly .ipt {
		background: transparent; border-color: transparent; box-shadow: none;
		padding-left: 0; color: #3a3f47; font-weight: 500; cursor: default;
	}
	body.readonly .ipt::placeholder { color: #c4c9d1; font-weight: 400; }

	/* ===================== 套红字段配置卡片（gjx 2026-07-15） ===================== */
	.rf-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
	.rf-select {
		height: 34px; padding: 0 10px; min-width: 260px;
		border-radius: 9px; font-size: 13px; color: #2b2f36;
		background: rgba(255,255,255,.7); border: 1px solid rgba(180,186,196,.45); outline: none;
	}
	.rf-btn {
		height: 32px; padding: 0 18px; border-radius: 9px; font-size: 13px; cursor: pointer;
		border: 1px solid rgba(255,255,255,.75); color: #4a505a;
		background: rgba(255,255,255,.55);
		box-shadow: inset 0 1px 0 rgba(255,255,255,.85), 0 2px 8px rgba(31,38,45,.06);
		transition: all .2s ease;
	}
	.rf-btn:hover { background: rgba(255,255,255,.85); color: #23262c; }
	.rf-btn.primary {
		color: #fff; border-color: transparent;
		background: linear-gradient(135deg, #454a53, #23262c);
		box-shadow: 0 3px 12px rgba(35,38,44,.28), inset 0 1px 0 rgba(255,255,255,.16);
	}
	.rf-btn.primary:disabled { opacity: .55; cursor: not-allowed; }
	.rf-hint { font-size: 12px; color: #98a0aa; }
	.rf-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(120,128,140,.16); }
	table.rf-table { width: 100%; border-collapse: collapse; font-size: 13px; background: rgba(255,255,255,.35); }
	.rf-table th {
		text-align: left; font-weight: 600; color: #4a505a; font-size: 12px;
		padding: 9px 12px; background: rgba(255,255,255,.6);
		border-bottom: 1px solid rgba(120,128,140,.18); white-space: nowrap;
	}
	.rf-table td { padding: 7px 12px; border-bottom: 1px solid rgba(120,128,140,.10); color: #2b2f36; }
	.rf-table tr:last-child td { border-bottom: none; }
	.rf-table tr.rf-disabled td { color: #b3b9c2; }
	.rf-table tr.rf-missing td { color: #b0343c; }
	.rf-ipt {
		height: 28px; padding: 0 8px; width: 160px;
		border-radius: 7px; font-size: 13px; color: #2b2f36;
		background: rgba(255,255,255,.7); border: 1px solid rgba(180,186,196,.45); outline: none;
	}
	.rf-ipt:disabled { background: transparent; border-color: transparent; color: #9aa1ab; }
	.rf-badge {
		display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px;
		background: rgba(140,147,158,.14); color: #6a717c; white-space: nowrap;
	}
	.rf-badge.warn { background: rgba(240,180,41,.16); color: #9a6d00; }
	.rf-badge.err  { background: rgba(176,52,60,.12); color: #b0343c; }
	.rf-count { margin-left: auto; font-size: 12px; color: #7a8089; }
	.rf-pager { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 12px; }
	.rf-btn:disabled { opacity: .45; cursor: not-allowed; }

	/* ===================== 底部操作栏 ===================== */
	.bottombar {
		position: fixed; left: 18px; right: 18px; bottom: 14px; z-index: 10;
		height: 58px; border-radius: 16px;
		display: flex; align-items: center; justify-content: center; gap: 12px;
	}
	.btn {
		height: 36px; padding: 0 26px; border-radius: 10px;
		font-size: 14px; cursor: pointer; outline: none;
		border: 1px solid transparent;
		transition: all .22s ease;
	}
	.btn-primary {
		color: #fff;
		background: linear-gradient(135deg, #454a53, #23262c);
		box-shadow: 0 4px 14px rgba(35,38,44,.30), inset 0 1px 0 rgba(255,255,255,.16);
	}
	.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(35,38,44,.38), inset 0 1px 0 rgba(255,255,255,.16); }
	.btn-primary:active { transform: translateY(0); }
	.btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; }
	.btn-ghost {
		color: #4a505a;
		background: rgba(255,255,255,.55);
		border-color: rgba(255,255,255,.75);
		box-shadow: inset 0 1px 0 rgba(255,255,255,.85), 0 2px 8px rgba(31,38,45,.06);
	}
	.btn-ghost:hover { background: rgba(255,255,255,.8); color: #23262c; }
	.hidden { display: none !important; }

	/* ===================== Toast ===================== */
	#toast {
		position: fixed; left: 50%; bottom: 90px; z-index: 99;
		transform: translateX(-50%) translateY(16px);
		padding: 10px 22px; border-radius: 12px;
		font-size: 13px; color: #2b2f36;
		opacity: 0; pointer-events: none;
		transition: opacity .3s ease, transform .3s ease;
	}
	#toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
	#toast.err { color: #b0343c; }
</style>
</head>
<body class="readonly">
	<div class="bg-orb orb-1"></div>
	<div class="bg-orb orb-2"></div>
	<div class="bg-orb orb-3"></div>

	<header class="glass topbar">
		<div class="topbar-icon">⚙</div>
		<div>
			<h1>FileZ 集成配置中心</h1>
			<p>服务连接 · 表单套红映射 · 公文套红字段 —— 保存后在当前节点立即热生效</p>
		</div>
		<span id="modePill" class="mode-pill"><span class="dot"></span><span id="modeText">只读模式</span></span>
	</header>

	<%-- gjx-start：2026-07-15 页签栏（服务连接默认展示） --%>
	<nav class="glass tabbar">
		<button type="button" class="tab-btn active" data-tab="panel-conn">🔗 服务连接</button>
		<button type="button" class="tab-btn" data-tab="panel-redmap">📄 表单套红映射</button>
		<button type="button" class="tab-btn" data-tab="panel-redfield">🔖 公文套红字段配置</button>
	</nav>
	<%-- gjx-end --%>

	<main class="scroll">
		<!-- 服务连接 -->
		<section class="glass card" id="panel-conn">
			<div class="card-header">
				<div class="card-icon">🔗</div>
				<div>
					<div class="card-title">服务连接</div>
					<div class="card-sub">FileZ 中台地址、OA 回调地址与 HMAC 签名密钥</div>
				</div>
			</div>
			<div class="form-grid">
				<div class="form-group">
					<label class="form-label">OA 服务地址<span class="key">filez.oaUrl</span></label>
					<input type="text" class="ipt" id="f_oaUrl" data-key="filez.oaUrl" placeholder="如 http://oa.example.com:80" />
					<div class="form-hint">FileZ 下载 OA 文件、上传结果以及回调 OA 时使用的固定 OA 根地址</div>
				</div>
				<div class="form-group">
					<label class="form-label">FileZ 中台地址<span class="key">filez.fileZurl</span></label>
					<input type="text" class="ipt" id="f_fileZurl" data-key="filez.fileZurl" placeholder="如 http://filez.example.com:8001" />
					<div class="form-hint">浏览器打开编辑器、OA 调用 API 及下载异步结果时使用的固定 FileZ 根地址</div>
				</div>
				<div class="form-group">
					<label class="form-label">存储库 ID<span class="key">filez.repoId</span></label>
					<input type="text" class="ipt" id="f_repoId" data-key="filez.repoId" placeholder="如 OA1" />
					<div class="form-hint">FileZ 分配给本 OA 系统的 repoId；留空表示保持当前值</div>
				</div>
				<div class="form-group full">
					<label class="form-label">HMAC 签名密钥<span class="key">filez.secret</span></label>
					<input type="text" class="ipt mono" id="f_secret" autocomplete="off"
						placeholder="点击“修改配置”后查看或更换完整密钥" />
					<div class="form-hint">只读时显示前后各 4 位；进入编辑模式后显示完整密钥，修改并保存后立即热生效</div>
				</div>
			</div>
		</section>

		<!-- 表单套红映射 -->
		<section class="glass card hidden" id="panel-redmap">
			<div class="card-header">
				<div class="card-icon">📄</div>
				<div>
					<div class="card-title">表单套红映射</div>
					<div class="card-sub">CAP4 表单场景的字段/书签映射（公文正文套红的字段取舍请直接调整套红模板书签）</div>
				</div>
			</div>
			<div class="form-grid">
				<div class="form-group full">
					<label class="form-label">纯文本套红对应字段/书签<span class="key">filez.redStrings · 分号分割</span></label>
					<input type="text" class="ipt mono" id="f_redStrings" data-key="filez.redStrings"
						placeholder="交付方式;代购总价合计;代购标准价合计;合同金额" />
				</div>
				<div class="form-group full">
					<label class="form-label">表格套红书签字段分组<span class="key">filez.redTableStrings · 分号分割</span></label>
					<input type="text" class="ipt mono" id="f_redTableStrings" data-key="filez.redTableStrings"
						placeholder="付款明细表=收款期数,款项内容,收款条件,收款比例,软件服务费,实施服务费,客开服务费,预计收款日期,备注;" />
				</div>
			</div>
		</section>

		<%-- gjx-start：2026-07-15 公文套红字段动态配置 --%>
		<section class="glass card hidden" id="panel-redfield">
			<div class="card-header">
				<div class="card-icon">🔖</div>
				<div>
					<div class="card-title">公文套红字段配置</div>
					<div class="card-sub">套入哪些字段<b>完全由此处配置决定</b>：勾选即套入；未配置或未勾选的表单，套红时只合并正文（Content），不套任何文单字段 · 保存即生效</div>
				</div>
			</div>
			<div class="rf-toolbar">
				<select class="rf-select" id="rfForm"></select>
				<button type="button" class="rf-btn" id="rfReload">↻ 刷新字段</button>
				<button type="button" class="rf-btn primary" id="rfSave">保存字段配置</button>
				<span class="rf-count" id="rfCount"></span>
			</div>
			<div class="rf-table-wrap">
				<table class="rf-table">
					<thead>
						<tr>
							<th style="width:52px;">套入</th>
							<th>数据域名</th>
							<th style="width:90px;">类型</th>
							<th style="width:130px;">绑定元素</th>
							<th style="width:180px;">书签名（模板里要一致）</th>
							<th style="width:150px;">状态</th>
						</tr>
					</thead>
					<tbody id="rfBody">
						<tr><td colspan="6" style="text-align:center;color:#98a0aa;padding:18px;">加载中…</td></tr>
					</tbody>
				</table>
			</div>
			<div class="rf-pager hidden" id="rfPager">
				<button type="button" class="rf-btn" id="rfPrev">‹ 上一页</button>
				<span class="rf-hint" id="rfPageInfo"></span>
				<button type="button" class="rf-btn" id="rfNext">下一页 ›</button>
			</div>
			<div class="rf-hint" style="margin-top:10px;">
				· 书签名默认取数据域名，可改；红头模板 docx 里的书签名必须与此一致（另有固定书签 <b>Content</b> 用于正文合并，无需配置）。<br/>
				· 表单设计器里新增字段 → 刷新后出现在列表（未勾选）；字段被删除 → 状态标"字段已删"，保存时自动清理；改数据域名 → 配置保留并提示。<br/>
				· 意见类字段（签发、会签、各部门核稿等）与附件字段不支持文本套入，已自动隐藏，不在列表中显示。
			</div>
		</section>
		<%-- gjx-end --%>

	</main>

	<footer class="glass bottombar">
		<button type="button" id="btnEdit" class="btn btn-ghost">✎ 修改配置</button>
		<button type="button" id="btnSave" class="btn btn-primary hidden">保存并应用</button>
		<button type="button" id="btnCancel" class="btn btn-ghost hidden">取消</button>
	</footer>

	<div id="toast" class="glass"></div>

	<script type="text/javascript">
	//gjx-start：配置读写（fetch 直连 EuFileZController，不再依赖 euc 框架）
	(function () {
		var CTX = '${pageContext.request.contextPath}';
		var CSRF_SUFFIX = '${ctp:csrfSuffix()}';
		var URL_DATA = CTX + '/euFileZ.do?method=configData';
		var URL_SECRET = CTX + '/euFileZ.do?method=configSecret' + CSRF_SUFFIX;
		var URL_SAVE = CTX + '/euFileZ.do?method=saveConfig' + CSRF_SUFFIX;

		var snapshot = {};
		var toastTimer = null;
		var secretMasked = '';
		var secretOriginal = '';
		var secretDirty = false;

		function inputs() {
			return Array.prototype.slice.call(document.querySelectorAll('[data-key]'));
		}

		function controlValue(ipt) {
			return ipt.type === 'checkbox' ? ipt.checked : ipt.value;
		}

		function toast(msg, isErr) {
			var el = document.getElementById('toast');
			el.textContent = msg;
			el.className = 'glass show' + (isErr ? ' err' : '');
			clearTimeout(toastTimer);
			toastTimer = setTimeout(function () { el.className = 'glass'; }, 2600);
		}

		function fillFrom(data) {
			inputs().forEach(function (ipt) {
				var v = data[ipt.getAttribute('data-key')];
				if (ipt.type === 'checkbox') {
					ipt.checked = v === true || v === 1 || String(v).toLowerCase() === 'true' || String(v) === '1';
				} else {
					ipt.value = (v === undefined || v === null) ? '' : v;
				}
			});
			if (data && Object.prototype.hasOwnProperty.call(data, 'filez.secretMasked')) {
				secretMasked = data['filez.secretMasked'] || '';
				document.getElementById('f_secret').value = secretMasked;
			}
		}

		function takeSnapshot() {
			snapshot = {};
			inputs().forEach(function (ipt) { snapshot[ipt.getAttribute('data-key')] = controlValue(ipt); });
		}

		function collect() {
			var data = {};
			inputs().forEach(function (ipt) {
				data[ipt.getAttribute('data-key')] = ipt.type === 'checkbox' ? ipt.checked : ipt.value.trim();
			});
			if (secretDirty) {
				data['filez.secret'] = document.getElementById('f_secret').value.trim();
			}
			return data;
		}

		function setEditing(isEdit) {
			document.body.classList.toggle('readonly', !isEdit);
			inputs().forEach(function (ipt) { ipt.disabled = !isEdit; });
			var secretIpt = document.getElementById('f_secret');
			secretIpt.disabled = !isEdit;
			if (!isEdit) {
				secretIpt.value = secretMasked;
				secretOriginal = '';
				secretDirty = false;
			}
			document.getElementById('btnEdit').classList.toggle('hidden', isEdit);
			document.getElementById('btnSave').classList.toggle('hidden', !isEdit);
			document.getElementById('btnCancel').classList.toggle('hidden', !isEdit);
			document.getElementById('modePill').classList.toggle('editing', isEdit);
			document.getElementById('modeText').textContent = isEdit ? '编辑模式' : '只读模式';
		}

		function load() {
			fetch(URL_DATA, { credentials: 'same-origin', cache: 'no-store' })
				.then(function (r) {
					if (!r.ok) { throw new Error('HTTP ' + r.status); }
					return r.json();
				})
				.then(function (data) {
					fillFrom(data);
					takeSnapshot();
				})
				.catch(function (e) {
					console.error('[FileZ配置] 读取失败', e);
					toast('配置读取失败，请刷新重试', true);
				});
		}

		function beginEdit() {
			var btn = document.getElementById('btnEdit');
			var oldText = btn.textContent;
			btn.disabled = true;
			btn.textContent = '读取密钥中…';
			fetch(URL_SECRET, {
				method: 'POST',
				credentials: 'same-origin',
				cache: 'no-store',
				headers: { 'Content-Type': 'application/json' },
				body: '{}'
			})
				.then(function (r) {
					if (!r.ok) { throw new Error('HTTP ' + r.status); }
					return r.json();
				})
				.then(function (res) {
					if (!res || !res.success) {
						throw new Error((res && res.message) || '读取签名密钥失败');
					}
					secretOriginal = res.secret || '';
					secretDirty = false;
					document.getElementById('f_secret').value = secretOriginal;
					setEditing(true);
				})
				.catch(function (e) {
					console.error('[FileZ配置] 密钥读取失败', e);
					toast('读取完整密钥失败，请确认当前账号具有管理员权限', true);
				})
				.then(function () {
					btn.disabled = false;
					btn.textContent = oldText;
				});
		}

		function save() {
			var btn = document.getElementById('btnSave');
			btn.disabled = true; btn.textContent = '保存中…';
			fetch(URL_SAVE, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(collect())
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					if (res && res.success) {
						setEditing(false);
						load();
						toast('✓ ' + (res.message || '配置已保存并热生效'));
					} else {
						toast((res && res.message) || '保存失败', true);
					}
				})
				.catch(function (e) {
					console.error('[FileZ配置] 保存失败', e);
					toast('保存失败，请检查网络或登录状态', true);
				})
				.then(function () {
					btn.disabled = false; btn.textContent = '保存并应用';
			});
		}

		document.getElementById('f_secret').oninput = function () {
			secretDirty = this.value !== secretOriginal;
		};
		document.getElementById('btnEdit').onclick = beginEdit;
		document.getElementById('btnCancel').onclick = function () {
			if (window.confirm('确定要取消修改吗？未保存的内容将会丢失。')) {
				fillFrom(snapshot);
				setEditing(false);
			}
		};
		document.getElementById('btnSave').onclick = save;
		setEditing(false);
		load();
	})();
	//gjx-end
	//gjx-start：2026-07-15 页签切换（服务连接默认；公文套红字段页签自带保存，隐藏底部全局操作栏）
	(function () {
		var PANELS = ['panel-conn', 'panel-redmap', 'panel-redfield'];
		var btns = document.querySelectorAll('.tab-btn');

		function activate(tabId) {
			Array.prototype.forEach.call(btns, function (b) {
				b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
			});
			PANELS.forEach(function (id) {
				var el = document.getElementById(id);
				if (el) { el.classList.toggle('hidden', id !== tabId); }
			});
			// 底部"修改配置/保存并应用"服务连接、表单套红映射；字段配置页签自带保存
			var bar = document.querySelector('.bottombar');
			if (bar) { bar.classList.toggle('hidden', tabId === 'panel-redfield'); }
		}

		Array.prototype.forEach.call(btns, function (b) {
			b.onclick = function () { activate(this.getAttribute('data-tab')); };
		});
		activate('panel-conn');
	})();
	//gjx-end
	//gjx-start：2026-07-15 公文套红字段动态配置（独立卡片，自带保存，不参与上方"修改配置"编辑态）
	(function () {
		var CTX = '${pageContext.request.contextPath}';
		var URL_FORMS = CTX + '/euFileZ.do?method=redFieldForms';
		var URL_LIST  = CTX + '/euFileZ.do?method=redFieldList&formId=';
		var URL_SAVE  = CTX + '/euFileZ.do?method=redFieldSave${ctp:csrfSuffix()}';

		var rows = [];
		var toastTimer2 = null;
		var PAGE_SIZE = 6;
		var page = 1;
		var dirty = false; // 本地有未保存改动（勾选/书签名变化）

		function $id(id) { return document.getElementById(id); }

		function totalPages() { return Math.max(1, Math.ceil(rows.length / PAGE_SIZE)); }

		function toast2(msg, isErr) {
			var el = $id('toast');
			el.textContent = msg;
			el.className = 'glass show' + (isErr ? ' err' : '');
			clearTimeout(toastTimer2);
			toastTimer2 = setTimeout(function () { el.className = 'glass'; }, 2600);
		}

		function esc(s) {
			return String(s === null || s === undefined ? '' : s)
				.replace(/&/g, '&amp;').replace(/</g, '&lt;')
				.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		}

		function renderEmpty(msg) {
			$id('rfBody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:#98a0aa;padding:18px;">' + esc(msg) + '</td></tr>';
			$id('rfCount').textContent = '';
			$id('rfPager').classList.add('hidden');
		}

		function renderPager() {
			var wrap = $id('rfPager');
			if (rows.length <= PAGE_SIZE) { wrap.classList.add('hidden'); return; }
			wrap.classList.remove('hidden');
			$id('rfPageInfo').textContent = '第 ' + page + ' / ' + totalPages() + ' 页 · 共 ' + rows.length + ' 个字段';
			$id('rfPrev').disabled = page <= 1;
			$id('rfNext').disabled = page >= totalPages();
		}

		function loadForms() {
			fetch(URL_FORMS, { credentials: 'same-origin' })
				.then(function (r) { return r.json(); })
				.then(function (res) {
					var sel = $id('rfForm');
					sel.innerHTML = '';
					var forms = (res && res.forms) || [];
					if (!forms.length) {
						sel.innerHTML = '<option value="">（没有可用的发文单）</option>';
						renderEmpty((res && res.message) || '没有可用的发文单');
						return;
					}
					forms.forEach(function (f) {
						var opt = document.createElement('option');
						opt.value = f.id;
						opt.setAttribute('data-name', f.name);
						opt.textContent = f.name + (f.configuredCount > 0 ? '　●已配置 ' + f.configuredCount : '');
						sel.appendChild(opt);
					});
					loadFields();
				})
				.catch(function (e) {
					console.error('[套红字段] 发文单列表读取失败', e);
					renderEmpty('发文单列表读取失败，请刷新重试');
				});
		}

		function loadFields() {
			var formId = $id('rfForm').value;
			if (!formId) { return; }
			page = 1;
			renderEmpty('加载中…');
			fetch(URL_LIST + encodeURIComponent(formId), { credentials: 'same-origin' })
				.then(function (r) { return r.json(); })
				.then(function (res) {
					if (!res || !res.success) {
						renderEmpty((res && res.message) || '字段读取失败');
						return;
					}
					rows = res.fields || [];
					dirty = false;
					render();
				})
				.catch(function (e) {
					console.error('[套红字段] 字段读取失败', e);
					renderEmpty('字段读取失败，请刷新重试');
				});
		}

		function render() {
			if (!rows.length) { renderEmpty('该表单没有可配置的业务字段'); return; }
			if (page > totalPages()) { page = totalPages(); }
			var start = (page - 1) * PAGE_SIZE;
			var html = '';
			rows.slice(start, start + PAGE_SIZE).forEach(function (f, k) {
				var i = start + k; // rows 全量数组中的绝对下标（勾选状态跨页保留）
				var trCls = f.status === 'missing' ? 'rf-missing' : '';
				var badge = '';
				if (f.status === 'missing') {
					badge = '<span class="rf-badge err" title="表单中已不存在该字段，保存后自动清理其配置">字段已删</span>';
				} else if (f.status === 'renamed') {
					badge = '<span class="rf-badge warn" title="配置时的数据域名：' + esc(f.oldDisplay) + '，书签名未自动变更">显示名已变</span>';
				}
				var lock = f.status === 'missing';
				html += '<tr class="' + trCls + '">' +
					'<td><input type="checkbox" data-i="' + i + '"' + (f.checked ? ' checked' : '') + (lock ? ' disabled' : '') + ' /></td>' +
					'<td>' + esc(f.display) + '</td>' +
					'<td>' + esc(f.fieldType || '') + '</td>' +
					'<td>' + esc(f.mappingField || '—') + '</td>' +
					'<td><input type="text" class="rf-ipt" data-i="' + i + '" value="' + esc(f.bookmark) + '"' + ((!f.checked) || lock ? ' disabled' : '') + ' /></td>' +
					'<td>' + badge + '</td>' +
					'</tr>';
			});
			$id('rfBody').innerHTML = html;
			bind();
			updateCount();
			renderPager();
		}

		function bind() {
			Array.prototype.forEach.call(document.querySelectorAll('#rfBody input[type=checkbox][data-i]'), function (cb) {
				cb.onchange = function () {
					var i = +this.getAttribute('data-i');
					rows[i].checked = this.checked;
					dirty = true;
					var ipt = document.querySelector('#rfBody input.rf-ipt[data-i="' + i + '"]');
					if (ipt) {
						ipt.disabled = !this.checked;
						if (this.checked && !ipt.value.trim()) {
							ipt.value = rows[i].display || '';
							rows[i].bookmark = ipt.value;
						}
					}
					updateCount();
				};
			});
			Array.prototype.forEach.call(document.querySelectorAll('#rfBody input.rf-ipt[data-i]'), function (ipt) {
				ipt.oninput = function () {
					rows[+this.getAttribute('data-i')].bookmark = this.value;
					if (!dirty) { dirty = true; updateCount(); }
				};
			});
		}

		function updateCount() {
			var total = 0, n = 0;
			rows.forEach(function (f) {
				if (f.status === 'missing') { return; }
				total++;
				if (f.checked) { n++; }
			});
			var txt = (dirty ? '勾选 ' : '当前已配置 ') + n + ' / ' + total + ' 个字段' + (dirty ? '（未保存）' : '');
			if (n === 0) { txt += ' · 套红时仅正文合并'; }
			$id('rfCount').textContent = txt;
		}

		function save() {
			var formId = $id('rfForm').value;
			if (!formId) { return; }
			var items = [];
			var seen = {};
			for (var i = 0; i < rows.length; i++) {
				var f = rows[i];
				if (!f.checked || f.status === 'missing') { continue; }
				var bm = String(f.bookmark || '').trim();
				if (!bm) { toast2('「' + f.display + '」的书签名为空', true); return; }
				if (seen[bm]) { toast2('书签名重复：' + bm, true); return; }
				seen[bm] = 1;
				items.push({ fieldName: f.fieldName, display: f.display, bookmark: bm, sort: items.length });
			}
			var btn = $id('rfSave');
			btn.disabled = true; btn.textContent = '保存中…';
			fetch(URL_SAVE, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ formId: formId, items: items })
			})
				.then(function (r) { return r.json(); })
				.then(function (res) {
					if (res && res.success) {
						toast2('✓ ' + (res.message || '已保存并即时生效'));
						// 同步下拉框里的"●已配置 n"标记
						var sel = $id('rfForm');
						var opt = sel.options[sel.selectedIndex];
						if (opt) {
							var nm = opt.getAttribute('data-name') || opt.textContent;
							opt.textContent = nm + (items.length > 0 ? '　●已配置 ' + items.length : '');
						}
						loadFields();
					} else {
						toast2((res && res.message) || '保存失败', true);
					}
				})
				.catch(function (e) {
					console.error('[套红字段] 保存失败', e);
					toast2('保存失败，请检查网络或登录状态', true);
				})
				.then(function () {
					btn.disabled = false; btn.textContent = '保存字段配置';
				});
		}

		$id('rfForm').onchange = loadFields;
		$id('rfReload').onclick = loadFields;
		$id('rfSave').onclick = save;
		$id('rfPrev').onclick = function () { if (page > 1) { page--; render(); } };
		$id('rfNext').onclick = function () { if (page < totalPages()) { page++; render(); } };
		loadForms();
	})();
	//gjx-end
	</script>
</body>
</html>
<%-- //gjx-end --%>
