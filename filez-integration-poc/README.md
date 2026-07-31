# FileZ 零源码加载 PoC

这是第一阶段验证包，只验证以下问题：

1. `WEB-INF/lib/customer` 中的独立 JAR 能否被 A8 主类加载器发现；
2. `GlobalJsExtend` 是否能通过 `ServiceLoader` 生效；
3. 哪些 A8 页面和 iframe 会执行 Global Env；
4. Bootstrap 执行时 `window.OfficeSDK` 是否已经存在；
5. 卸载插件后是否完全恢复原生行为。

本 PoC：

- 不连接 FileZ；
- 不修改 `window.OfficeSDK`；
- 不拦截保存、附件或公文操作；
- 不修改任何致远标准源码；
- 只写入独立 JAR、独立静态资源和独立插件配置目录。

## 构建

```powershell
.\build.ps1
```

默认使用：

```text
E:\Seeyon\A8
```

也可以指定：

```powershell
.\build.ps1 -A8Home 'E:\Seeyon\A8'
```

## 部署

A8 必须停止：

```powershell
.\deploy.ps1
```

部署目标：

```text
WEB-INF/lib/customer/ruian-filez-poc-0.1.0.jar
apps_res/ruian-filez-poc/bootstrap.js
WEB-INF/cfgHome/plugin/ruianFilezPoc/pluginCfg.xml
```

## 启动后验证

登录 A8 后，在目标页面 URL 追加：

```text
filezPoc=1
```

例如原 URL 已有查询参数时追加 `&filezPoc=1`。

页面右下角出现绿色 `FileZ PoC` 标识即表示当前 window 已加载。浏览器控制台可查看：

```js
window.__RUIAN_FILEZ_POC__
window.__RUIAN_FILEZ_POC_WINDOWS__
```

每个 window 会记录：

- 页面路径；
- 是否顶层窗口；
- Bootstrap、DOMContentLoaded、window.load 三个时点；
- 对应时点是否已经存在 `window.OfficeSDK`；
- 当前脚本来自 PC Global Env 还是 Mobile Global Env。

## 验证部署

```powershell
.\verify-deployment.ps1
```

## 卸载

A8 必须停止：

```powershell
.\undeploy.ps1
```

卸载脚本只删除本 PoC 明确拥有的三个目标，不处理任何致远标准文件。
