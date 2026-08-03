# FileZ OfficeSDK Facade PoC

版本：`0.6.1`

这是致远 A8 V10 的低侵入 FileZ 查看/编辑验证插件。它不修改协同、公文、
文档中心 Vue 业务源码，也不修改致远核心 JAR；FileZ 逻辑位于独立插件中。
唯一需要覆盖的致远标准文件是 `common/office/js/officeSDK.js`，其中只保留一个
通用、命名、可注销并可回退的 Adapter Resolver 扩展点。

当前代码已通过 JDK 8 编译、三组 Java 冒烟测试、Bootstrap/Viewer、Editor
和后台内嵌页签合同测试，尚未由 Codex 部署到 A8，也尚未完成真实编辑保存现场验收。

## 为什么不需要修改业务源码

这里的“低侵入”是指不修改公文、协同、文档中心的 Vue/Java 业务源码，并非
完全不覆盖任何致远文件：

1. A8 的 `GlobalJsExtend` 扩展点从独立 JAR 向 PC 页面加载 `bootstrap.js`；
2. `bootstrap.js` 根据页面、正文类型、模式和服务端开关注册 FileZ Resolver；
3. 标准 `officeSDK.js` 只增加一个通用 Adapter Resolver 插槽，命中时加载
   FileZ Adapter，不命中或失败时仍回到致远原生 Adapter；
4. 查看、编辑、保存、鉴权、配置接口全部位于独立 JAR 和独立 `apps_res` 目录。

所以致远业务模块升级不会直接覆盖 FileZ 实现；需要维护的唯一标准文件侵入点
是 `officeSDK.js` 中带 `RUIAN-FILEZ-ADAPTER-RESOLVER-*` 标记的小段代码。

## 组件

```text
RUIAN_FILEZ_VIEW  -> viewer.js  -> 公文 Word/Excel 查看
RUIAN_FILEZ_EDIT  -> editor.js  -> Word/Excel 新建、编辑和保存
```

`bootstrap.js` 注册 `ruian-filez-view-edit` Resolver，只在白名单范围内选择
上述 Adapter；不命中、关闭或安全回退时继续使用致远原生 Adapter。

## 后台开关

部署后，以系统管理员进入：

```text
系统设置 -> 流版签设置 -> FileZ 集成设置
```

可选择：

- `off`：关闭 FileZ，全部回到致远原生厂商；
- `shadow`：只记录路由判定；
- `view`：只接管已验证的 Word/Excel 正文查看；
- `edit`：在当前白名单内启用 FileZ 查看与编辑。

全新安装默认 `view`，现场验证编辑前不会自动提升到 `edit`。策略保存在
`ruian_filez_view` 分类的 `filez.enabled` 和 `filez.facadeMode` 中。后台接口
只接受同源 POST、A8 登录态和系统管理员身份。

该入口以内嵌页签形式复用致远原生“修改/保存/取消”按钮，不再弹窗。它是
FileZ 自己的管理入口，不会修改上方致远原生的“在线编辑插件”
单选项。V10 的原生厂商列表由固定枚举、固定配置聚合和 JSP 组成，没有公开
第三方 Provider SPI；把 FileZ 强行加入该列表需要修改核心 JAR/JSP，会重新
制造升级覆盖问题。原生厂商配置继续作为 FileZ 未接管场景的回退选择。

## 当前业务范围

| 场景 | 行为 |
|---|---|
| 公文已有 Word/Excel 正文查看 | FileZ View |
| 公文已有待发/待办 Word/Excel 正文编辑 | FileZ Edit |
| 新建普通公文 Word/Excel 正文 | FileZ Edit |
| 新建普通协同 Word/Excel 正文 | FileZ Edit；兼容协同隐藏签章预检和 `modifyContent` |
| 文档中心新建普通 Word/Excel 文档 | FileZ Edit |
| 已有协同/已有文档中心正文编辑 | 原生，尚未补齐对象级 ACL |
| 模板、转 Office、原始文件派生的新建 | 原生 |
| PDF/OFD/PPT、ODS/CSV、打印及非白名单隐藏打开 | 原生 |
| 套红、清稿、转 PDF、签章等高级能力 | 原生或显式 `UNSUPPORTED` |
| M3/移动端 | 原生 |

## 保存合同

新建正文的 `fileId` 由服务端生成，先调用
`OfficeFileManager.createV3XFileAndDefaultBlankFile(...)` 建立 A8 文件，再由
`editor.js` 回写 `contentAPI` 的 `fileId/id/contentDataId`。

FileZ 上传后通过 `OfficeFileManager.controlAfterSave(...)` 提交到 A8 文件
生命周期，不直接覆盖物理文件。OfficeSDK 的 `saveFile` 只有在以下条件全部
满足后才成功：

1. FileZ 上传 capability、会话、nonce、文件 ID、后缀和大小合法；
2. A8 当前 `V3XFile` 没有发生并发版本漂移；
3. `controlAfterSave` 返回同一 canonical `fileId`；
4. 服务端 revision 递增；
5. wrapper 返回匹配 `requestId` 的 `SAVE_RESULT`，包含
   `fileId/revision/contentLength`。

`SAVE_REQUESTED`、FileZ 本地 `save()` 返回和关闭 iframe 都不是保存成功。
每次保存会先读取实时 revision，再触发 FileZ 保存，再等待新 revision，避免把
此前的自动保存误判成本次保存。当前不支持 Save As。

## 安全边界

- 查看 wrapper、编辑 wrapper、编辑下载和编辑上传使用不同 capability；
- wrapper 绑定用户、session、nonce，且一次消费；
- 浏览器消息校验 source、origin、channel、protocol、sessionId 和 nonce；
- FileZ 回调 URL 不带 query，下载和上传使用不同的参数名携带短时票据；
- 上传只允许原文档后缀且受服务端最大字节数限制；
- 保存前做 A8 文件版本比较，冲突时拒绝静默覆盖；
- callback 按 Node 风格恰好调用一次；
- 有未保存修改时，编辑器异常不会为了原生回退而销毁唯一内容，而是阻断提交；
- FileZ 密钥只在 A8 后端读取，不进入浏览器、URL 或日志。

当前仍是单节点测试版。生产化前还要补齐孤儿新文件回收、已有协同/文档中心
ACL、多节点共享状态、审计、限流、真实 `isEmpty`、故障注入和压力测试。

## IDEA 构建

工程已配置 Java 8 模块和 JAR Artifact：

```text
模块：    filez-officesdk-facade-poc
Artifact：ruian-filez-facade-poc-0.6.1:jar
输出：    out/artifacts/ruian_filez_facade_poc_0_6_1/
          ruian-filez-facade-poc-0.6.1.jar
```

在 IDEA 中执行：

```text
Build -> Build Artifacts -> ruian-filez-facade-poc-0.6.1:jar -> Build
```

A8 依赖通过 IDEA 应用级 `lib` 库以 `PROVIDED` 方式引用，不会被打进插件 JAR。
`src/main/resources` 会进入 JAR，`src/main/webapp` 不会进入 JAR。本项目不再
提供 PowerShell 构建或部署脚本。IDEA 的 `lib` 是本机应用级库；换电脑打开
工程时，需要把它重新指向该机器 A8 的 `WEB-INF/lib`。

## 手工部署

Codex 不执行部署。操作顺序：

2026-08-03 最后一次只读核对时，A8 根 `WEB-INF/lib` 已出现一个
`ruian-filez-facade-poc-0.6.1.jar`，关键静态资源也与当前工作区一致；
`WEB-INF/lib/customer` 中没有同名 JAR。该现状不等同于现场验收通过。
根 `WEB-INF/lib` 是本机已经验证会进入 WebApp 类路径的位置。当前没有找到
`WEB-INF/lib/customer` 会被此版 A8 递归加入类路径的明确配置，因此本版部署
统一使用根 `WEB-INF/lib`，不能把“目录名称像客开目录”当成可加载证据。

1. 停止 A8；
2. 备份将覆盖的相对文件，尤其是
   `E:\Seeyon\A8\ApacheJetspeed\webapps\seeyon\common\office\js\officeSDK.js`；
3. 同时检查 `WEB-INF/lib` 和 `WEB-INF/lib/customer`，移走全部旧
   `ruian-filez-facade-poc-*.jar`；
4. 将 IDEA 生成的 `ruian-filez-facade-poc-0.6.1.jar` 复制到已验证的类路径：

   ```text
   E:\Seeyon\A8\ApacheJetspeed\webapps\seeyon\WEB-INF\lib\
   ```

5. 将 `src/main/webapp/` 下的全部内容按相对路径合并到：

   ```text
   E:\Seeyon\A8\ApacheJetspeed\webapps\seeyon\
   ```

6. 确认整个 A8 只剩一个 `0.6.1` Facade JAR，再启动 A8；
7. 系统管理员进入 FileZ 集成设置，选择“查看与编辑”；
8. 强制刷新浏览器并按下节验证。

## 部署文件

```text
WEB-INF/lib/ruian-filez-facade-poc-0.6.1.jar
apps_res/ruian-filez-facade-poc/bootstrap.js
apps_res/ruian-filez-facade-poc/viewer.js
apps_res/ruian-filez-facade-poc/editor.js
apps_res/ruian-filez-facade-poc/admin-panel.js
apps_res/ruian-filez-facade-poc/filez-sdk.js
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/pluginCfg.xml
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/spring/spring-ruian-filez-facade-manager.xml
WEB-INF/cfgHome/plugin/ruianFilezFacadePoc/spring/spring-ruian-filez-facade-controller.xml
WEB-INF/classes/needless_check_login_ruian_filez.xml
WEB-INF/classes/needless_check_login_recheck_ruian_filez.xml
common/office/js/officeSDK.js
```

## 验收

只使用测试文档：

1. 后台 FileZ 设置能读取、保存 `edit`，非系统管理员不能修改；
2. 新建普通协同 Word 正文，输入唯一文本，保存待发/发送并重新打开；
3. 新建普通协同 Excel 正文，修改单元格，保存待发/发送并重新打开；
4. 新建普通公文 Word/Excel 正文，编辑、保存/发送并重新打开；
5. 编辑一个已有待发/待办公文并重新打开；
6. 文档中心新建普通 Word/Excel 文档并重新打开；
7. 切到 `view` 后新建编辑走原生、已有 Word/Excel 查看走 FileZ；
8. 切到 `off` 后全部走原生，URL 参数不能重新提权；
9. 模板、PDF/OFD/PPT、套红、清稿、转 PDF、签章和打印仍走原生；
10. 模拟 FileZ 断网或上传失败，A8 保存/发送必须失败，不能假成功。

只有真实保存并重新打开确认内容后，才能判定编辑 PoC 现场通过。

## 回滚

先把 FileZ 模式设置为 `off`，再停止 A8。移走 `0.6.1` JAR 和本插件独立
资源，按部署前备份恢复 `officeSDK.js` 及其他覆盖文件。日常故障通常只需
`off` 即可回到原生；完整卸载才需要恢复标准文件。

完整研究证据、改动清单、限制和升级策略见：

```text
D:\Java-project\v10.0瑞安源码\致远A8与FileZ低侵入集成研究报告.md
```
