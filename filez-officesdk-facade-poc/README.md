# FileZ OfficeSDK Facade 只读查看 PoC

版本：`0.5.0`

本项目用于验证一条适合长期维护的低侵入集成路径：不修改公文 Vue
业务源码和标准 JAR，只对致远 `common/office/js/officeSDK.js` 增加一个
通用、失败后自动回到原生映射的适配器解析扩展点，其余 FileZ 代码全部放在
独立插件中。FileZ 仅替代明确命中的 Word 正文查看场景。

## 已确认的空白正文根因

失败请求不是正文权限校验失败，也不是数据库查询失败。浏览器侧旧实现把
会话创建请求的超时固定为 `10,000 ms`，而一次实际
`ruianFileZViewManager.createViewSession` 请求在后端成功返回前耗时
`20,557 ms`。浏览器在成功结果返回前已经放弃 FileZ 并进入致远原生插件
回退，随后原生插件又因不支持 `pdf/docx` 打开而显示空白。

`0.4.0` 将该问题与长期接入方式一起修正：会话等待窗口覆盖已观测的首次
调用耗时，后端记录分段耗时；FileZ 驱动回调地址遵循当前官方 SDK/服务的
无查询串回调契约；OfficeSDK 通过正式注册的独立适配器解析器加载，不再
依赖运行时改写 `OfficeSDK.prototype`。

`0.5.0` 取消了“每次在地址后追加 `filezFacade=view`”的依赖。A8 后端
`ConfigManager` 是唯一的启用权威：只有 `ruian_filez_view` 分类同时存在
`filez.enabled=true` 和 `filez.facadeMode=view` 时，新打开的页面才会自动
进入 FileZ 只读查看。浏览器 URL、`sessionStorage` 和控制台 API 只能把
服务端模式降为 `shadow/off`，不能把服务端 `off/shadow` 提升为 `view`。

本包内置从当前 FileZ 服务取得的官方 Web SDK `1.8.2`，文件大小
`129,606` 字节，固定 SHA-256 为
`C00711BB7D85576850E4A93AADA5568C16E7A8453A04799C781F28F328A378F4`。
测试、部署和部署后校验都会同时检查版本声明与/或该哈希，防止 SDK 被静默
替换。

## 安全边界

- 默认模式为 `off`；开关缺失、非法、读取异常或未显式启用时均不接管；
- 旧 `eu_filez_config` 只兼容提供 FileZ 连接参数，不能代表启用；
- 每次会话创建、wrapper 打开和正文 capability 消费都重新检查服务端
  `view` 开关，关闭后拒绝继续创建或消费；
- 当前仅用于 `view` 测试，只允许读取和展示正文；
- 不提供编辑、上传、保存、转 PDF、套红、清稿、签章和附件接管；
- 不伪造 `saveFile` 成功，也不会向致远回写文件；
- FileZ 密钥只在 A8 后端读取和使用，不进入浏览器、URL 或日志；
- 匿名白名单仅包含 `/ruianFileZContent.do` 的 `index` 和兼容
  `download` 方法；
- 下载请求仍必须通过短时 capability 校验，白名单不等于无条件放行；
- 当前 FileZ Web SDK 合同要求浏览器取得 content bearer，再交给 FileZ
  driver。已获查看权限的测试用户可从 DevTools 观察该短时 bearer，并在
  过期/耗尽前直接读取原始正文；`download:false` 只关闭 FileZ UI，不是
  服务端 DLP/防下载边界；
- `off` 会立即拒绝后续请求，但当前 capability 没有策略 epoch；若在
  60/300 秒 TTL 内快速重新启用 `view`，未耗尽旧 token 可能重新有效；
- capability 当前存于单个 JVM，正文会全量进入 A8 堆内存；只允许单节点、
  小文件、可信测试用户验证；
- 不记录正文、文件名、用户信息或 capability 原文。

这是验证包，不是生产发布包。只有在 capability、对象权限、过期时间和
重放防护全部验证通过后，才能继续扩大使用范围。临时测试约束是：只使用
非敏感测试文档；关闭后按实际 content TTL 等待（默认 300 秒、最大
600 秒，保守按 600 秒）或在 off 状态重启 A8，再重新启用；不得把
`download:false` 当成防下载承诺。

## 运行模式

服务端配置是模式上限：

```text
category: ruian_filez_view
filez.enabled: true | false
filez.facadeMode: off | shadow | view
```

- `off`：注销 FileZ Resolver，全部使用致远原生 OfficeSDK；
- `shadow`：只记录脱敏路由结果，全部使用致远原生 OfficeSDK；
- `view`：新页面默认对严格白名单内的 Word 正文查看启用 FileZ。

缺少任一启用条件、值非法或配置服务异常时均按 `off` 处理。URL 参数只保留
诊断降级能力：

```text
filezFacade=off
filezFacade=shadow
```

服务端为 `view` 时，以上参数可让当前页面临时回到原生或 shadow；删除参数
并刷新即可恢复服务端默认。`filezFacade=view` 不再具有启用权限，旧书签
可以继续打开，但不能绕过服务端 `off/shadow`。

## 独立后端组件

Spring Bean：

```text
ruianFileZCapabilityService
ruianFileZViewSessionService
ruianFileZViewManager
```

Controller：

```text
/ruianFileZView.do
/ruianFileZContent.do
```

实际会话由登录态 AJAX manager 创建，请求沿用 A8 的 CSRF token；
`/ruianFileZView.do` 保持 A8 登录校验，只负责用短期 ticket 输出同源
查看 wrapper。FileZ 要求下载地址不带查询串，因此生产下载地址是
`/ruianFileZContent.do`，由 A8 默认路由到 `index`；`download` 仅作为
兼容入口。两个入口虽然在匿名白名单中，仍必须通过一次性短时 capability
鉴权。

## 正文授权绑定

V10 公文正文以 `ctp_content_all` 为权威数据源。插件通过 A8 自带的
`ctpMainbodyManager` 查询当前公文，只接受唯一一条同时满足以下条件的记录：

- `moduleId` 等于当前 `affair.objectId`；
- `moduleType` 等于 `ModuleType.edoc`（值为 `4`）；
- `contentType` 为 Word/WPS 正文（`41` 或 `43`）；
- `sort` 为主正文值 `1`；
- `content` 可解析为请求中的 `V3XFile.id`，且两者完全相等。

只要 A8 已存在任何 `ctp_content_all` 记录，就不会回退并接受可能过期的
`edoc_body` 文件绑定。仅在完全没有现代内容记录的旧数据中，才使用
`EdocApi` 做同样的精确文件 ID 校验。PDF/OFD 转换正文、历史正文、
`contentDataId` 和客户端文件名均不能扩大授权范围。

## 插件拥有的部署文件

```text
WEB-INF/lib/customer/ruian-filez-facade-poc-0.5.0.jar
apps_res/ruian-filez-facade-poc/bootstrap.js
apps_res/ruian-filez-facade-poc/viewer.js
apps_res/ruian-filez-facade-poc/filez-sdk.js
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/pluginCfg.xml
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/spring/spring-ruian-filez-facade-manager.xml
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/spring/spring-ruian-filez-facade-controller.xml
WEB-INF/classes/needless_check_login_ruian_filez.xml
WEB-INF/classes/needless_check_login_recheck_ruian_filez.xml
```

这些文件均使用独立目录、独立 Bean 名称和独立 Controller 地址。此外，
手工部署会覆盖唯一一个致远原文件，复制前必须由操作人员自行完整备份：

```text
common/office/js/officeSDK.js
```

该文件中的改动只有带
`RUIAN-FILEZ-ADAPTER-RESOLVER-*` 标记的通用解析扩展点。以下致远标准文件
保持原始基线，不会被覆盖：

```text
WEB-INF/cfgHome/base/systemProperties.xml
WEB-INF/lib/seeyon-ctp-core.jar
WEB-INF/lib/javax.servlet-api.jar
```

当前审核后的文件保存在
`src/main/webapp/common/office/js/officeSDK.js`，固定 SHA-256 为
`173DC0F49FE44A2D985C94C7CB3A47B77B2BA50090D8D15AA1A745E760659F0A`；
其中六个 Resolver marker 均只能出现一次。原自动哈希门禁已随构建工具删除，
因此手工部署者必须自行核对源文件和目标文件；如果致远升级改变了目标
`officeSDK.js`，不得直接覆盖，必须先基于新版本重新审查和适配扩展点。

## IDEA 构建与手工部署

IDEA Java 模块和 JAR Artifact 已配置完成：

```text
模块：filez-officesdk-facade-poc
Artifact：ruian-filez-facade-poc-0.5.0:jar
输出：out/artifacts/ruian_filez_facade_poc_0_5_0/
      ruian-filez-facade-poc-0.5.0.jar
```

模块固定为 Java 8，复用 IDEA 应用级 `lib` 库（指向 A8 的
`WEB-INF/lib`），并将其设为 `PROVIDED`，所以 A8 的依赖 JAR 不会被打进插件
JAR。`src/main/resources/META-INF` 会进入 JAR，`src/main/webapp` 不会进入
JAR。重新加载 IDEA 项目后，执行 `Build -> Build Artifacts ->
ruian-filez-facade-poc-0.5.0:jar -> Build` 即可。

原 PowerShell 构建、测试、部署、校验、回滚和卸载工具已按用户要求全部删除。
Java 冒烟测试源码仍保留在 `src/test/java`，JavaScript 合同测试仍保留在
`src/test/js`，可由 IDEA 或 Node 单独执行。

手工部署前先停止 A8，并备份所有即将覆盖或删除的目标文件。复制映射为：

```text
IDEA Artifact 输出的 ruian-filez-facade-poc-0.5.0.jar
  -> E:\Seeyon\A8\ApacheJetspeed\webapps\seeyon\WEB-INF\lib\customer\

src\main\webapp\ 下的全部内容
  -> E:\Seeyon\A8\ApacheJetspeed\webapps\seeyon\（按相对路径合并）
```

复制 `0.5.0` JAR 前必须移走旧的
`ruian-filez-facade-poc-0.4.0.jar`，最终 `WEB-INF/lib/customer` 只能保留一个
Facade 版本。`src/main/webapp` 已经按 A8 WebRoot 相对路径组织，包含插件
脚本、配置、登录校验 sidecar，以及审核版
`common/office/js/officeSDK.js`，无需重新打包或改目录。该 OfficeSDK 的固定
SHA-256 为
`173DC0F49FE44A2D985C94C7CB3A47B77B2BA50090D8D15AA1A745E760659F0A`；
若 OA 升级后目标文件不是已知基线，必须停止手工覆盖并重新适配。

### 管理员一次性启用

部署并启动 A8 后，以**系统管理员**登录。在任一已加载 A8 公共脚本的
同源 PC 页面打开浏览器控制台，执行：

```javascript
callBackendMethod(
  'ruianFileZViewManager',
  'setFacadePolicy',
  { enabled: true, mode: 'view' },
  {
    success: function (result) { console.log(result); },
    error: function (error) { console.error(error); }
  }
);
```

查询当前有效策略：

```javascript
callBackendMethod(
  'ruianFileZViewManager',
  'getFacadePolicy',
  {},
  {
    success: function (result) { console.log(result); },
    error: function (error) { console.error(error); }
  }
);
```

紧急关闭：

```javascript
callBackendMethod(
  'ruianFileZViewManager',
  'setFacadePolicy',
  { enabled: false, mode: 'off' },
  {
    success: function (result) { console.log(result); },
    error: function (error) { console.error(error); }
  }
);
```

三个调用都由 A8 原生 AJAX 通道携带登录态和 CSRF 信息；后端只接受同源
POST 和 `isSystemAdmin()`。接口固定写入两个非敏感策略键，不允许调用者指定
category/key，也不会返回 FileZ 地址、仓库或密钥。策略变更后刷新已打开的
业务页面；新页面不再需要 `filezFacade=view`。

如果服务端查询结果是 `view`，但该浏览器标签曾经显式保存过
`shadow/off` 降级，可在控制台清除该本地降级后刷新：

```javascript
top.__RUIAN_FILEZ_FACADE_CONTROL__.setMode(
  'view',
  'clear-local-downgrade'
);
location.reload();
```

该调用仍受 `serverMode` 上限约束；服务端不是 `view` 时不能借此启用 FileZ。

## 只读查看验证

1. 部署后启动 A8。开关尚未显式启用时，普通页面和公文正文必须保持原生。
2. 用系统管理员账号调用 `ruianFileZViewManager.setFacadePolicy`，把模式设为
   `view`；该方法只接受同源 POST、A8 CSRF 校验和系统管理员身份。
3. 打开一个包含 Word 正文的公文查看页面，URL 不添加
   `filezFacade=view`。正文应自动由 FileZ 显示，且没有编辑或保存入口。
4. 网络请求中可以出现独立的 `ruianFileZView.do` 和无查询串的
   `ruianFileZContent.do`，但不应出现上传、保存或转换请求。
5. 在当前页面添加 `filezFacade=off` 并刷新，应完整回到原生；删除参数并
   刷新，应再次跟随服务端 `view`。
6. 管理员把服务端模式设回 `off` 后刷新页面；即使 URL 或旧
   `sessionStorage` 中仍有 `view`，也不得接管。

验证期间只使用测试文件。不要在该版本中执行真实编辑或生产文件保存。

## 手工回滚

如果当前策略为 `view/shadow`，先在 A8 仍运行时用前述
`setFacadePolicy` 命令设置 `{ enabled: false, mode: 'off' }`，确认成功后停止
A8。删除 `0.5.0` JAR，恢复部署前备份的旧 JAR、插件资源、配置和
`officeSDK.js`，确认 customer 目录仍只有一个 Facade JAR 后再启动 A8。

彻底卸载时同样必须先关闭策略并停止 A8，再删除本插件拥有的 JAR、
`apps_res/ruian-filez-facade-poc`、插件配置和两个登录校验 sidecar。唯一的
致远标准文件 `officeSDK.js` 不能直接删除，必须从可靠的部署前备份恢复。

## 生产化前必须完成

当前 `0.5.0` 是单节点、本地测试验证版，不能直接作为生产发布包。进入生产
前至少要完成：

- 正文下载增加并发闸门和用户级限流；大文件尽可能改为流式处理，避免
  50–200 MB 文件并发时占满 A8 堆内存；
- 非 localhost 环境强制 OA 与 FileZ 全链路 HTTPS，并要求 HMAC 密钥至少
  32 个随机字节；
- 多节点部署时把短时 capability 放入共享 TTL 存储，或明确保证浏览器和
  FileZ 回调始终粘滞到同一节点；
- 增加成功访问审计、撤权策略和压测，同时继续保持下载、打印、写入权限
  关闭。
