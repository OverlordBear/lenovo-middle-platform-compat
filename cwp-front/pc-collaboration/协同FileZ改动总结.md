# 协同模块 联想文档中台 (FileZ) 集成改动总结

> 项目：`cwp-front/pc-collaboration`（致远 OA PC 协同工作模块前端）
> 基线：`cwp-front-standard-V10.0-release_20250930-pc-collaboration`（已逐文件 diff 核实为未修改原版）
> 重构日期：2026-07-16　标记规范：与公文模块一致，`gjx-start` / `gjx-end` 成对出现
> 本次为对旧客开实现（OfficeSDK 全局劫持散改版）的整体重构，功能对齐、行为差异见 §五。
> 逐功能的"旧版改哪里 → 新版怎么承接"详细对照（含代码摘录与机制说明）见仓库根目录《FileZ改造前后对照.md》。

---

## 〇、文件改动总清单（合并致远新版源码专用）

> 升级致远源码时：**整体拷入 B 类目录 + 按标记重放 A 类 7 处代码块**，即完成全部客开合并。

### A. 对致远原版源码的修改 —— 3 个文件、7 处标记块

| # | 文件 | 标记 | 说明 |
|---|---|---|---|
| 1 | `src/main.js` | 1 对 | 引入并启动 `src/custom/filez` |
| 2 | `src/components/atom/accessory-item/components/handle/index.vue` | 3 对 | 老附件组件：引入白名单判断、补正查看权限、查看统一走 FileZ |
| 3 | `src/components/atom/accessory-item-new/components/file-handle.vue` | 3 对 | 新附件组件：引入白名单判断、补正查看权限、查看统一走 FileZ |

### B. 客开新增文件 —— 全部集中在 1 个新目录（7 个文件）

| # | 文件（`src/custom/filez/`） | 说明 |
|---|---|---|
| 4 | `index.js` | 装配入口（main.js 仅引用此文件）；各子系统独立 try/catch 启动 |
| 5 | `config.js` | 常量 / 正文类型映射 / FileZ 附件预览扩展名白名单 |
| 6 | `filez-service.js` | euFileZManager 后端双通道（Bridge 优先、ajax.do 兜底）+ 业务适配（URL 换取、文件名拼装、fileId 提取/生成、contentAPI 反写） |
| 7 | `filez-loader.js` | 加载过渡动画，视觉与生命周期与公文模块逐条对齐 |
| 8 | `content-render.js` | 正文容器注入/恢复（对称 API）+ 正文类型切换监听 |
| 9 | `sdk-hijack.js` | zwIframe 内 OfficeSDK 运行时代理（查看/新建正文的接管点） |
| 10 | `office-v2-patch.js` | "修改正文"新窗口编辑（OfficeV2 原型补丁，41-44 接管、45/46 放行原生） |
| 11 | `attachment-intercept.js` | 附件预览拦截（officeTrans.do?method=view → FileZ 弹窗）+ 常见格式白名单的数据层 canLook 补正 |

### C. 本次重构恢复为原版的文件（旧客开曾内联修改，现已还原，**合并时无需处理**）

| 文件 | 旧客开改动 | 现由谁承接 |
|---|---|---|
| `src/plugins/office/extend/office-v2.js` | 重写 `editOfficeTrans` 为 FileZ 新窗口编辑 | `office-v2-patch.js` 原型补丁 |
| `src/components/header/components/headerWrite/contentType.vue` | 切回 HTML 时恢复原生 iframe 的内联 DOM 代码 | `content-render.js` 订阅原版自带的 `ContentTypeChanged` 事件 |
| `src/plugins/office/index.js` | 仅删注释/格式化（无功能变化） | —— 直接还原 |
| `src/plugins/office/extend/base-office.js` | 仅删注释（无功能变化） | —— 直接还原 |
| ~~`src/plugins/office/extend/filez-office.js`~~ | 旧劫持引擎（已删除） | `sdk-hijack.js` + `filez-service.js` |
| ~~`src/plugins/office/extend/filezI-iframe/loader.js`~~ | 旧加载动画（已删除） | `filez-loader.js` |

### D. 与 FileZ 无关、保留现状的本机差异（合并时按需自查）

| 文件 | 差异 | 说明 |
|---|---|---|
| `package.json` | `build:comi` 脚本 `mv` → `move` | Windows 构建环境适配，非 FileZ 客开 |
| `.env.development` | `SERVER_URL=http://localhost` | 本地开发代理地址，个性配置无需合并 |

---

## 一、架构

```
src/main.js（装配入口，gjx 标记块）
  └─ installFileZ()  ——  src/custom/filez/index.js
       ├─ sdk-hijack.js            正文「查看 / 新建」接管
       │    动机：正文编辑器在 zwIframe 内部页面初始化，其源码不在本仓库，
       │    无法像公文模块那样在初始化点加显式分支，故做运行时代理。
       │    init 命中 41-44/doc 家族 → filez-service 换 URL → content-render 注入
       │    其余类型原样放行；saveFile 等仅对「被接管实例」伪造成功（实例级标记）
       │
       ├─ office-v2-patch.js       正文「修改」接管
       │    OfficeV2.prototype.editOfficeTrans 原型补丁：
       │    41-44 → 新窗口 FileZ 编辑 + 关窗后局部刷新预览；45/46 → 原生
       │
       ├─ attachment-intercept.js  附件「查看」接管
       │    数据层按 FILEZ_PREVIEW_EXTENSIONS 把 canLook 补为 true；
       │    两个附件组件也直接按同一白名单补正，覆盖非 axios/缓存数据。
       │    查看按钮统一生成 officeTrans 地址，图片/PDF不再走原生预览。
       │    两条原生预览链路都汇聚到 officeTrans.do?method=view：
       │    老组件 <a target="openFrame"> → 捕获阶段 click 拦截
       │    新组件 #myIframe.src 赋值   → 元素级 src 访问器拦截
       │    命中 → FileZ 弹窗（先同步开窗防拦截，异步回填地址）
       │
       └─ content-render.js + filez-loader.js   渲染与过渡
            注入/恢复对称成对；动画视觉与公文模块一致
```

## 二、模块 API 一览

| API | 所在文件 | 说明 |
|---|---|---|
| `isFileZBodyType()` / `isFileZTargetParams()` | config.js | 数字枚举 / init 参数两种判定 |
| `getStandardFileType()` | config.js | 41/43→doc 系、42/44→xls 系映射 |
| `callFileZBackend()` | filez-service.js | Bridge / Ajax 双通道（同公文 `_callBackend`） |
| `fileZInit()` / `createDefaultFile()` | filez-service.js | 后端原子接口 |
| `getBodyViewData()` / `getBodyCreateData()` | filez-service.js | 已有正文取 URL / 新建正文（含 contentAPI 反写） |
| `extractExistingFileId()` / `generateFileId()` | filez-service.js | 正文 ID 提取（URL 新建标识过滤 + contentAPI）/ 取号 |
| `getAttachmentViewUrl()` | filez-service.js | 附件预览 URL |
| `FILEZ_PREVIEW_EXTENSIONS` | config.js | FileZ 附件预览白名单（Office/PDF/文本/压缩包/图片） |
| `getAttachmentExtension()` / `isFileZPreviewFile()` | config.js | 兼容 extension/fileType/文件名字段并判断白名单 |
| `showLoading()` / `hideLoading()` / `failLoading()` | filez-loader.js | 动画原语（最短 2s、0.5s 淡出、失败红字） |
| `renderBodyIframe()` / `restoreNativeBody()` | content-render.js | 正文注入 / 恢复（对称） |
| `showBodyLoading()` / `hideBodyLoading()` | content-render.js | 正文区动画（劫持层提前调用） |
| `startContentTypeWatch()` | content-render.js | 订阅 `ContentTypeChanged` 自动恢复 |
| `startSdkHijack()` | sdk-hijack.js | 启动代理引擎 |
| `applyOfficeV2Patch()` | office-v2-patch.js | 安装"修改正文"补丁（幂等） |
| `startAttachmentIntercept()` | attachment-intercept.js | 启动附件拦截 |

## 三、加载动画（与公文模块一致）

- 视觉：浅灰白底 `#f7f8fa` + 紫色光环 2s 呼吸脉冲 + 5 个彩虹色圆点依次弹跳（1.2s）
  + 主标题"FileZ 文档正在初始化…"渐变流光（2.5s）+ 副标题"请耐心等待，马上就好 ✨"
- 生命周期：t=0 显示（劫持层在请求后端前即显示，早于旧实现）→ iframe onload 后再等 1.5s
  → 最短显示 2s → 0.5s 淡出；30s 超时红字"加载时间较长，请检查网络或刷新重试"，5s 后强制关闭

## 四、旧实现问题修复清单

| 问题（旧客开实现） | 本次处理 |
|---|---|
| 20ms `setInterval` 永不 `clearInterval`，且逻辑/服务/DOM 混在一个文件 | 轮询保留（同源导航会重建 iframe 全局对象，轮询即重载探测器，每拍仅一次标记位短路检查）；按公文形态拆分为 7 个单一职责模块，理由写入注释 |
| `mode` 计算后被忽略、已有文档硬编码 `view` 的"暗坑" | 行为保留（内嵌一律预览态、编辑走新窗口补丁），改为**显式注释声明的设计决策** |
| `saveFile` 等 mock 按页面级 bodyType 兜底判断，同页其它 SDK 实例（签章、PDF 等）被误伤 | 收窄为**实例级标记**（仅 init 被接管过的实例）+ 显式 fileType 匹配 |
| 隐藏原生 iframe 在 filez-office.js、恢复却在 contentType.vue，做/撤分家 | `renderBodyIframe` / `restoreNativeBody` 对称成对，切换恢复走事件订阅 |
| 切换到 PDF/OFD(45/46) 正文时 FileZ iframe 残留不恢复 | 恢复条件由"=10"改为"非 41-44 即恢复"（安全超集） |
| `editOfficeTrans` 被整体重写且无任何标记，PDF/OFD 也被卷入 FileZ 编辑 | 原型补丁只接管 41-44，45/46 回落原生方法 |
| 附件预览两个组件复制粘贴同一段代码；`callBackendMethod` 无兜底 | 收敛到一个拦截器；后端调用统一走双通道 |
| 附件弹窗在异步返回后 `window.open`，易被浏览器弹窗拦截（Bridge 同步时恰好规避） | 先同步开空白窗占位，异步回填地址 |
| 无 git、无成对标记、无文档 | 本文档 + 全部成对标记 + 建议 git init（见 §七） |

## 五、与旧客开实现的行为差异（需要知晓）

| 场景 | 旧实现 | 现实现 | 说明 |
|---|---|---|---|
| 图片附件"查看" | FileZ 弹窗 | FileZ 弹窗 | 2026-07-22 明确统一走文档中台，不再分流到原生灯箱 |
| PDF 附件（未开在线预览） | FileZ 弹窗 | FileZ 弹窗 | 数据层补正 canLook 后进入 FileZ 统一链路 |
| 未保存附件（hasSaved=false）| 也显示预览按钮 | 恢复原版：只显示下载 | 原版本意如此 |
| Office 文档附件"查看" | FileZ 弹窗 | FileZ 弹窗 | doc/docx/xls/xlsx/ppt/pptx 等均由白名单显式放行 |
| 文本/压缩包附件"查看" | 无条件按钮 → FileZ | 数据层补正 canLook → 模板出图标 → FileZ | txt/md/csv/rtf/zip/rar/7z，白名单见 `FILEZ_PREVIEW_EXTENSIONS` |
| 正文查看/新建/修改/切换 | FileZ | FileZ（不变） | 核心诉求保持 |
| 签章按钮（FileZ 正文下） | 被 mock 静默"成功" | 不再被误 mock，走原生逻辑（FileZ 正文下原生签章本身不可用） | 见 §六-1 |

## 六、已知限制与待验证项

0. **现场未采购致远原生转换预览服务**（2026-07-16 在公文模块实测确认）——FileZ 是本环境唯一的 Office 预览/编辑能力，集成随 `main.js` 加载时直接安装，不提供运行时禁用开关。

1. **签章**：FileZ 接管的正文（41-44）不支持致远原生流版签签章。旧实现是静默假成功，现实现不再拦截签章实例；若现场配置了签章按钮，需在 FileZ 侧确认能力或隐藏按钮。
2. **草稿再编辑**：`extractExistingFileId()` 沿用旧逻辑以 URL `method=newColl`/`isNew=true` 判定"纯新建"。若存在"打开草稿时 URL 仍带新建标识"的场景，会重新建空白文档覆盖 contentDataId（旧实现同样如此）。建议实测一次"存草稿 → 重新打开"链路。
3. **fileId 取号**仍为前端"时间戳+6位随机数"（保持旧约定兼容）；建议后续由 `createDefaultFile` 后端统一取号。
4. 本目录未纳入公文侧《导出前端改动文件.ps1》扫描范围；如需一键导出，把 `pc-collaboration/src/custom/filez/**`、`pc-collaboration/src/main.js` 以及 A 类两个附件组件加入脚本 `$ExtraFiles`/扫描根即可。

## 七、验证清单（部署前手工回归）

- [ ] 新建协同 → 正文类型选 Word/Excel/WPS → FileZ 编辑器内嵌加载（动画：光环+彩点+流光）
- [ ] 新建填写标题后进正文 → FileZ 文件名为"标题.doc/.xls"
- [ ] 新建 → 发送 → 接收人打开详情 → 正文以 FileZ 预览态内嵌显示
- [ ] 详情页"修改正文" → 新窗口打开 FileZ 编辑 → 关窗后正文区自动局部刷新（页面不整刷）
- [ ] 正文类型 Word ↔ HTML 往返切换 → 原生编辑器/FileZ 正确显隐；再切到 PDF/OFD 验证无 FileZ 残留
- [ ] Word/Excel/PPT/PDF 附件显示"查看"图标 → FileZ 弹窗预览正常
- [ ] txt/md/csv/rtf/zip/rar/7z 附件（含"全部附件"面板）→ FileZ 弹窗预览正常
- [ ] jpg/jpeg/png/gif/bmp/webp/tif/tiff/svg 图片附件 → FileZ 弹窗；附件下载不受影响
- [ ] PDF/OFD 正文的查看与编辑 → 走致远原生（不被 FileZ 拦截）
- [ ] 存草稿 → 重新打开草稿 → 正文内容不丢（§六-2）

> 另建议：在本目录执行 `git init` 并以「原版基线 → 客开提交」两个 commit 入库，
> 后续升级合并可直接 `git diff` 定位客开面。
