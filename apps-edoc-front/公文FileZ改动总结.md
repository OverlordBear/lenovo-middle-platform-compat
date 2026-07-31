# 公文模块 联想文档中台 (FileZ) 集成改动总结

> 项目：`apps-edoc-front`（致远 OA 公文模块前端，仅 `edoc-summary` 子项目有改动）
> 基线：`apps-edoc-front-standard-V10.0-release_20250930`（已逐文件 diff 核实为未修改原版）
> 重构日期：2026-07-16　标记规范：`gjx-start` / `gjx-end` 成对出现
> 本文档取代旧版《联想文档中台集成改动总结.md》；后端 apps-customize 改动见附录（自旧文档平移，本次未涉及）。
> 逐功能"旧版改哪里 → 新版怎么承接"的详细对照见《FileZ改造前后对照.md》（公文版）。
> 姊妹项目：协同模块 `cwp-front/pc-collaboration` 已按同一模式重构，见其《协同FileZ改动总结.md》。

---

## 〇、文件改动总清单（合并致远新版源码专用）

> 升级致远源码时：**整体拷入 B 类目录 + 按标记重放 A 类四个文件的代码块**，即完成全部客开合并。
> 一键导出：项目根《导出前端改动文件.ps1》（自动扫描 gjx 标记 + $ExtraFiles 清单）。

### A. 对致远原版源码的修改 —— 4 个文件（全部成对标记）

| # | 文件 | 标记块 | 内容 | 性质 |
|---|---|---|---|---|
| 1 | `edoc-summary/src/main.js` | 1 处 | 引入并启动 `src/custom/filez`，FileZ 集成的唯一装配触点 | FileZ |
| 2 | `edoc-summary/src/components/attachment-list/table.vue` | 3 处 | 附件"预览"改走 FileZ 弹窗（原 canPreview 条件放开，zip/txt 等也可预览；原生入口注释保留） | FileZ（$emit 多层链路，拦截成本高于收益，保留最小标记块） |
| 3 | `edoc-summary/src/components/content/content-header.vue` | 4 处 | **AI 智能创作**：下拉菜单入口（当前已注释停用，postMessage 接收机制保留）+ 接收外部 AI 页面的 docx + 上传 OA + 应用为正文 | **非 FileZ 客开**（原实现无标记，本次补齐；原对 FileZ 的特判分支已删——SDK 劫持自动覆盖） |
| 4 | `edoc-summary/src/store/actions/common/modules/edoc-content.js` | 1 处 | 全新新建公文（空白拟文，非模板/待发）强制默认标准正文 HTML | **非 FileZ 客开**（2026-06-17 引入；⚠️ 2026-07-16 曾按"与管理端配置重复"假设删除，实测服务端空白新建默认返回 Word、发文页行为回归，当日恢复。除非管理端找到等效配置并实测生效，勿删） |

### B. 客开新增文件 —— 全部集中在 1 个新目录（7 个文件）

| # | 文件（`edoc-summary/src/custom/filez/`） | 说明 |
|---|---|---|
| 5 | `index.js` | 装配入口（main.js 仅引用此文件）；各子系统独立 try/catch 启动 |
| 6 | `config.js` | 套红 / 清稿 / 正文转PDF 按钮识别条件及正文下载 handle 注册键 |
| 7 | `filez-adapter.js` | FileZ 统一适配器（双通道后端调用/URL/DOM 注入/加载动画/指纹轮询/局部刷新）——2026-07-16 由 `src/services/` 迁入，**内容未变** |
| 8 | `sdk-hijack.js` | ✨新增：`window.OfficeSDK` 类劫持——正文查看/新建/上传的统一接管点（详见 §一） |
| 9 | `handles-patch.js` | ✨新增：handles 调度表补丁——修改正文 / FileZ套红 / FileZ清稿 / FileZ正文转PDF / 下载（详见 §一） |
| 10 | `filez-logic.js` | FileZ套红 / 清稿 / 正文转PDF 统一业务逻辑 |
| 11 | `test-777.js` | 「正文下载」按钮逻辑——由旧 `custom-test/` 迁入 |

### C. 本次重构恢复为原版的文件（旧版曾内联修改，现已还原，**合并时无需处理**）

| 文件 | 旧客开改动 | 现由谁承接 |
|---|---|---|
| `src/components/content/office-content.js` | FileZ 分支 + **原生初始化逻辑被整段删除**（潜在回归：PDF/OFD 走此路径拿到未 init 的空实例） | `sdk-hijack.js`；恢复原版顺带修复原生路径 |
| `src/handles/common/modules/upload-content-file.js` | 上传正文 FileZ 分支 | `sdk-hijack.js`（原生流程 initOfficeEditor → new OfficeSDK 被类劫持接管） |
| `src/handles/create/modules/save-content.js` | FileZ 直接放行 + 空正文弹窗 | FileZ 实例的 `isEmpty()=false / saveFile()=true` 静默放行 |
| `src/handles/create/modules/save-draft.js` | ensureOfficeEditorForSave 改造 | FileZ 实例已被原版 setOfficeEditor 登记，原版逻辑自然拿到实例、不触发 openHideContent |
| `src/handles/create/modules/send.js` | 同上 + 跳过套红书签检查 | FileZ 实例 `countBookmarks()=0` 使 checkBookMarks 自然短路 |
| `src/handles/content-utils.js` | 新增 ensureOfficeEditorForSave 公共函数 | 不再需要（见上两行） |
| `src/handles/summary/modules/content/content-edit.js` | 修改正文 FileZ 弹窗分支 | `handles-patch.js` 替换调度表 `handles.edit` 槽位 |
| `src/handles/summary/modules/custom-action/index.js` | FileZ套红/清稿/正文转PDF按钮拦截 | `handles-patch.js` 替换 `handles.custom` 槽位 |
| `src/handles/common/index.js` | 注册 test777 | `handles-patch.js` 运行时注册键 |
| `src/components/content/content-header.vue`（changeContentType 部分） | 切换正文类型 FileZ 分支（无类型判断，PDF/OFD 也被卷入） | `sdk-hijack.js`（原版 else 分支 initOfficeEditor 被接管；41-44 之外回归原生） |
| ~~`src/services/filez-adapter.js`~~ | 旧适配器位置 | 迁入 `src/custom/filez/`，原目录删除 |
| ~~`src/handles/summary/modules/custom-test/`~~ | 转PDF/下载逻辑旧位置 | PDF逻辑并入 `filez-logic.js`；仅下载逻辑迁入 `test-777.js`，原目录删除 |
| ~~`src/handles/summary/modules/custom-action/filez-logic.js`~~ | 套红逻辑旧位置 | 迁入 `src/custom/filez/` |
| 纯格式化噪音 7 个：`api/modules/gwk.js`、`api/modules/smart-decision.js`、`components/comment-list/index.vue`、`components/form/create.vue`、`components/more-setting/workflow-deadline.vue`、`handles/create/modules/page-load.js`、`config/schema/layoutD_summary.json` | 删注释/空行（零功能变化） | —— 直接还原 |

### D. 与 FileZ 无关、保留现状的本机差异

| 文件 | 差异 | 说明 |
|---|---|---|
| `edoc-summary/vue.config.js` | 屏蔽 Sass 弃用警告 + 关闭体积警告（文件内有【新增/修改部分】注释） | 构建环境适配，合并时带上 |
| `edoc-summary/config/devServer.js` | 本地代理 target=127.0.0.1:80 | 开发个性配置，无需合并 |

> ⚠️ 旧文档所列 `store/actions/summary/modules/base.js`（按钮注入）经 diff 核实**从未被修改**（自定义按钮实际由管理端配置 handle 字段），旧清单该条目已废弃。

---

## 一、架构

```
edoc-summary/src/main.js（A-1，唯一 FileZ 装配触点）
  └─ installFileZ()  ——  src/custom/filez/index.js
       │
       ├─ sdk-hijack.js  window.OfficeSDK 类劫持 ——「正文查看 / 新建 / 上传 / 保存链路」
       │    公文 SDK 在主窗口挂载（loadJs），用访问器在挂载瞬间把类包一层：
       │    · state.edocContent.bodyType ∈ {OfficeWord,WpsWord,OfficeExcel,WpsExcel}
       │      → 构造函数返回 FileZ 实例：init 记参 → openFile 注入 FileZ iframe
       │        （isHide 只登记不出 UI）→ isEmpty/saveFile 静默放行
       │        → countBookmarks=0 使套红书签检查自然短路；
       │    · 其余类型（Pdf/Ofd/gd…）原样 new 致远原生 SDK；
       │    · 原版 _initOfficeEditor 会把实例 setOfficeEditor 登记进 store/instance，
       │      save-content / save-draft / send 读到的即 FileZ 实例 → 六个源文件零改动。
       │    与协同模块的差别：SDK 在主窗口、时机确定，无需轮询。
       │
       └─ handles-patch.js  调度表补丁 ——「按钮行为」
            原版按钮点击统一走 handles[key]（widgets/edoc-toolbar-button 按键名现查），
            调度表为普通可变对象，运行时替换/新增槽位：
            · handles.edit    修改正文：FileZ → 弹窗编辑+关窗局部刷新；其余 → 原生
            · handles.custom  FileZ套红 / FileZ清稿 / FileZ正文转PDF 拦截 → filez-logic；其余 → 原生分发
            · handles.test777 注册正文下载
```

## 二、装配方式

FileZ 集成随 `main.js` 加载时直接安装，不提供运行时禁用开关。SDK 包装与 handles 补丁各自保留幂等保护，避免重复安装。

## 三、旧实现问题修复清单

| 问题（旧内联版） | 本次处理 |
|---|---|
| office-content.js 原生初始化逻辑被整段删除（mode 判定/init/openFile/错误重试/实例销毁全没了），PDF/OFD 走此路径拿到从未 init 的实例 | 恢复致远原版；FileZ 分支改由类劫持承接 |
| content-header.vue 切换正文类型分支无类型判断，切到 PDF/OFD 也被卷入 FileZ | 劫持仅接管 41-44 目标类型，其余回归原生 |
| save-content.js 中"FileZ 空正文弹窗"分支位于提前 return 之后，永不可达（演化遗留死代码） | 随恢复原版消失；语义由 FileZ 实例 isEmpty()=false 统一表达 |
| 转PDF旧逻辑裸用全局 callBackendMethod/getA8Top、`location.href=location.href` 自赋值 | 并入 `filez-logic.js`，统一 window. 前缀 + reload()，行为不变 |
| AI 智能创作、"新建默认 HTML 正文"两处真实客开**无任何标记**，旧文档也未记载 | 补齐成对标记并入清单（A-3/A-4）；后者曾试删验证冗余假设，实测为必要逻辑，已恢复并在代码注释中留档 |
| 17+ 文件散改、大量纯格式化噪音混入 diff | 触点收敛为 A 类 4 文件 + B 类 1 目录，噪音全部还原 |

## 四、已知限制与待验证项

0. **现场未采购致远原生转换预览服务（officeTrans）**——2026-07-16 实测确认原生附件预览不可用。因此：FileZ 是本环境唯一的 Office 预览能力，table.vue 的 FileZ 附件预览为**必要功能**。

1. **正文盖章/签批（ContentSign 等）**：FileZ 接管的 Word/Excel 正文下，签章类流程拿到的是 FileZ 实例（相关方法静默放行），原生控件签章不可用——与旧版行为一致；若现场启用需在 FileZ 侧确认能力。
2. **AI 创作应用后的文件名**：正文在 FileZ 中显示的文件名取"公文标题.扩展名"（与切换正文类型场景一致）；旧版此场景用 AI 返回的原始文件名，属细微差异。
3. **content-header 头部条**：旧版加了"newGovdoc 页恒显"的 v-show 条件（为已注释掉的独立 AI 按钮而设，属死代码配套），本次随死代码一并清理；AI 入口在"AI辅助"下拉菜单内，显示条件同旧版（aiEdoc.show）。
4. **FileZ清稿 / 正文转PDF按钮**：管理端建好按钮后，把 operationId 分别回填到 `config.js` 的 `CLEAR_BUTTON_OPERATION_ID` / `PDF_BUTTON_OPERATION_ID`（当前均按 label 匹配兜底）。
5. table.vue 仅"列表布局"的预览入口改走 FileZ（与旧版改动范围一致）；卡片等其它布局的预览仍为原生。

## 五、验证清单（部署前手工回归）

- [ ] 新建公文 → 正文类型选 Word/WPS/Excel → FileZ 编辑器内嵌加载（光环+彩点+流光动画）
- [ ] 新建 → 上传正文（docx/xlsx）→ FileZ 编辑态内嵌显示
- [ ] 新建 → 发送/存草稿 → 无套红书签弹窗阻断、正文保存放行、流程正常提交
- [ ] 审批页打开 Word 正文 → FileZ 预览态；点"修改正文" → 新窗口编辑 → 关窗后正文区局部刷新（整页不刷）
- [ ] FileZ套红按钮 → 模板选择 → 提交后正文容器指纹轮询自动局部刷新；FileZ清稿同链路
- [ ] FileZ正文转PDF（custom，按 label/operationId 分发）/ 正文下载（test777）按钮功能正常
- [ ] 附件列表"预览" → FileZ 弹窗（含 zip/txt）
- [ ] PDF/OFD 正文的查看/编辑 → 走致远原生（不被 FileZ 拦截）★ 旧版此处已坏，重点验证
- [ ] AI 智能创作（入口菜单项当前已注释停用；如启用）：外部页面生成 → 推送回 OA → 自动上传并应用为正文（FileZ 渲染）
- [ ] 空白新建公文（非模板）默认正文类型为标准正文 HTML；从模板新建则跟随模板类型

---

## 附录：后端配置中心改造（apps-customize，2026-07-09 二版）

> 自旧版《联想文档中台集成改动总结.md》§六平移存档，本次前端重构未涉及后端。
> 位置：`D:\Java-project\v10.0瑞安源码\apps-customize`，均以 `//gjx-start` / `//gjx-end` 标记。
> 二版背景：一版沿用 euc 配置框架（存 ctp_customize 表）但保存键与读取键不一致导致配置不生效；
> 二版弃用 euc 通道，改用 ctp 标准 ConfigManager（ctp_config_item 表，固定键）+ 自有接口 + fetch 读写 + 热刷新。
> 同时删除"套红字段开关"功能（不需要套红的字段直接删改套红模板中的书签即可）。

### 配置存取链路

```
页面加载  GET  /seeyon/euFileZ.do?method=configData
            → ConfigManager 读 ctp_config_item（DB 无值回退 EuConfig 运行时值）→ JSON 回显
页面保存  POST /seeyon/euFileZ.do?method=saveConfig（JSON body）
            → ConfigManager 逐键写库（category=eu_filez_config）
            → 同步 EuConfig setter → FileZUtil 静态值   ⚡ 立即热生效
服务启动  spring-eu-manager.xml: euConfig bean init-method="initFromDb"
            → ConfigManager 读库（DB 无值回退 FileZUtil 内置默认）→ 推送 FileZUtil
```

配置键（6 个）：`filez.oaUrl`、`filez.fileZurl`、`filez.repoId`、`filez.secret`、`filez.redStrings`、`filez.redTableStrings`

### 涉及文件

| 文件 | 改动 |
|---|---|
| `eu/controller/EuFileZController.java` | 🆕 configData()（读取，secret 不回显内置密钥）、saveConfig()（写库+热生效）、euConfig 注入 |
| `eu/config/EuConfig.java` | CONFIG_CATEGORY=eu_filez_config；reload() 置空切断 euc 旧通道；🆕 initFromDb()；secret 非空即推 FileZUtil（换密钥不重启）；删 redDisabledFields/isRedFieldEnabled |
| `eu/util/FileZUtil.java` | 🆕 静态 getter（内置硬编码值作"出厂默认"，DB 无值时回退） |
| `eu/manager/EuFileZRedManagerImpl.java` | 删一版按开关剔除字段的过滤块，恢复全量字段填充 |
| `cfgHome/plugin/eu/spring/spring-eu-manager.xml` | euConfig bean 增加 init-method="initFromDb" |
| `WEB-INF/jsp/apps/euc/pub/config.jsp` | 界面二版：灰白液态玻璃风格；两张卡片（服务连接 / 表单套红映射）；只读/编辑双态；零外部依赖纯原生 fetch |

### 迁移说明

- euc 旧通道（ctp_customize）历史配置不迁移（其保存本就未正确生效）；新页面首次回显运行时生效值，确认后点一次"保存并应用"即落库。
- 部署清单：`EuConfig.class`、`EuFileZController.class`、`EuFileZRedManagerImpl.class`、`FileZUtil.class` + `spring-eu-manager.xml` + `config.jsp`，重启一次；此后所有配置改动均热生效。
