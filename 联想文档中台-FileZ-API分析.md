# 联想文档中台 (FileZ) API 全面分析

> 分析日期：2026-06-12
> 文档来源：https://api.filez.com/office/docs/ （官方开发者文档）
> 目的：全面梳理 FileZ 提供的所有 API，分析与公文套红场景的关联
> 状态说明（2026-07-29）：本文中的多方案比较仅保留为历史研究记录；项目源码现仅保留
> `euFileZRedManager.edocRedTest` 这一条 FileZ 公文套红实现。

---

## 一、FileZ 平台能力全景

FileZ 文档中台提供四大能力：

| 能力 | 说明 |
|------|------|
| **在线预览** | 支持 Office/WPS、PDF/OFD、CAD、图片等格式的在线预览 |
| **协同编辑** | 多人实时协同在线编辑 Office 文件 |
| **服务端 Open API** | 格式转换、内容操作、水印、书签套用等异步任务 |
| **JS SDK (JSSDK)** | 前端 JS API，与在线编辑页面交互，操作文档内容 |

---

## 二、服务端 Open API 完整列表

### 2.1 API 概览

所有服务端 API 的 prefix 为 `{apiPrefix}`，通常映射为 `/docs/publicapi/v1`。

| 功能分类 | 接口路径 | 方法 | 描述 |
|---------|---------|------|------|
| **结果下载** | `/download` | GET | 下载异步任务处理结果文件 |
| **格式转换** | `/convert` | POST | Word→PDF、Excel→PDF、PPT→PDF、Word→ofd、Word→图片、PDF→ofd |
| **文档内容操作** | `/content/update` | POST | 清稿、书签替换、加水印等 |
| **文档内容查询** | `/content/query` | POST | 查询批注、书签信息、修订信息 |
| **文档合并** | （独立API） | POST | 多个文档合并为一个 |
| **图片操作** | （独立API） | POST | 图片处理相关操作 |
| **文档编辑保护** | （独立API） | POST | 文档保护相关 |
| **文档拆分** | （独立API） | POST | 文档拆分 |
| **查询任务状态** | （独立API） | GET | 查询异步任务状态 |
| **文档比对** | （独立API） | POST | 文档比对相关 |

### 2.2 `/content/update` — 文档内容操作（核心API）

**这是我们项目中使用的核心 API。**

```
POST {apiPrefix}/content/update
```

**请求体结构：**

| 参数名 | 类型 | 说明 | 必须 |
|--------|------|------|------|
| `fileUrl` | string | 源文件下载地址 | 是 |
| `filename` | string | 含后缀的文件名（支持 doc/docx/wps/pdf） | 是 |
| `tokenType` | string | 三方 token 类型（cookie/header） | 否 |
| `tokenValue` | string | 三方 token 值 | 否 |
| `callback` | string | 回调地址，任务结束后通知 | 是 |
| `ops` | 数组 | 有序操作数组 | 是 |

**同步返回：**
```json
{"taskId": "uuid", "code": "Ok", "detail": {"taskStatus": "IN_QUEUE"}}
```

**回调通知：**
```json
{"taskId": "uuid", "code": "TaskSuccessNotify", "detail": {"taskStatus": "SUCCESS", "contentId": "...", "filename": "..."}}
```

---

## 三、`/content/update` 支持的所有操作 (actId)

### 3.1 清稿 — `ClearDoc`

```json
{"actId": "ClearDoc", "options": {"args": ["acceptAllTrack", "removeAllComment"]}}
```

| 参数 | 说明 |
|------|------|
| `acceptAllTrack` | 接受所有修订记录 |
| `removeAllComment` | 移除所有评论 |
| args 为空 | 执行所有上述操作 |

支持格式：docx/wps/doc（最大300m，docx最大600m，最多1000页）

### 3.2 书签内容替换 — `UpdateBookmarkRef` ⭐ 核心

```json
{
    "actId": "UpdateBookmarkRef",
    "options": {
        "args": [
            {
                "bookname": "书签名",
                "dataType": "TEXT|DOC|PIC",
                "dataRef": "引用内容",
                "refName": "引用文件名（TEXT时可省略）"
            }
        ]
    }
}
```

#### 参数详解

| 参数 | 说明 |
|------|------|
| `bookname` | 书签名。不存在时该条被忽略，不影响其他书签。 |
| `dataType` | **可选值：`TEXT`、`DOC`、`PIC`** |
| `dataRef` | **当 dataType=TEXT 时，该值为字符串（直接值！）**；当 dataType=DOC/PIC 时，该值为下载 URL |
| `refName` | dataType=TEXT 时可省略；dataType=DOC/PIC 时必须提供带后缀的文件名 |

#### ▶ 重大发现：TEXT 的正确参数名是 `dataRef`！

官方示例：
```json
{
    "bookname": "文件标题",
    "dataType": "TEXT",
    "dataRef": "zOffice PublicAPI 书签套用"
}
```

**我们之前的测试代码错误地使用了 `"text"`、`"value"`、`"data"` 字段来传递文本值，但正确的字段名是 `"dataRef"`！**

这解释了为什么我们的 5 轮测试都失败了 — 不是因为引擎不支持 TEXT 类型，而是因为我们用了错误的参数名！引擎收到 `dataType: "TEXT"` 后去 `dataRef` 字段找值，发现是空的/不存在的，就跳过了。

#### 使用限制

- ❌ ops 中**不允许有多个 UpdateBookmarkRef**
- ❌ UpdateBookmarkRef **不允许和其他操作混合**（如不能同时清稿+书签替换）
- ✅ 单个 UpdateBookmarkRef 的 args 数组可以包含**多个书签**、**多种 dataType 混合**
- 支持格式：doc/docx/wps，所有文件总和最大 300m

#### 完整混合示例（TEXT + PIC + DOC）

```json
{
    "actId": "UpdateBookmarkRef",
    "options": {
        "args": [
            {"bookname": "文件标题", "dataType": "TEXT", "dataRef": "关于xxx的通知"},
            {"bookname": "签名部门", "dataType": "PIC", "dataRef": "http://xxx/sign.png", "refName": "sign.png"},
            {"bookname": "正文", "dataType": "DOC", "dataRef": "http://xxx/body.docx", "refName": "body.docx"},
            {"bookname": "尾注", "dataType": "TEXT", "dataRef": "科技改变生活"}
        ]
    }
}
```

### 3.3 位置文本水印 — `ApplyWatermark`

```json
{
    "actId": "ApplyWatermark",
    "options": {
        "text": "watermark for test",
        "fontcolor": "#DC134C",
        "fontsize": "70",
        "font": "黑体",
        "rotation": 315,
        "transparent": 20,
        "position": "BOTTOM_RIGHT"
    }
}
```

支持格式：docx/wps/doc/pdf/ofd（v8.2 起支持 PDF）

### 3.4 位置图片水印 — `ApplyPicWatermark`（本项目已使用）

```json
{
    "actId": "ApplyPicWatermark",
    "options": {
        "picUrl": "http://xxx/pic.png",
        "picName": "pic.png",
        "isErosion": false,
        "rotation": 0,
        "position": "CENTER",
        "picScale": 100
    }
}
```

支持格式：docx/wps/doc + pdf/ofd（参数略有不同）

### 3.5 平铺文本水印 — `ApplyWatermarkForFixed`

```json
{
    "actId": "ApplyWatermarkForFixed",
    "options": {
        "line1": "watermark for test",
        "withDate": true,
        "font": "黑体",
        "fontcolor": "#DC134C",
        "fontsize": "70",
        "transparent": 70,
        "rotation": 315,
        "spacing": 50
    }
}
```

支持格式：docx/wps/doc/pdf/ofd（v8.2 起支持 docx/wps/doc）

### 3.6 平铺图片水印 — `ApplyTiledImgWatermarkForFixed`

```json
{
    "actId": "ApplyTiledImgWatermarkForFixed",
    "options": {
        "picUrl": "http://xxx/filez.png",
        "picName": "filez.png",
        "picScale": 100,
        "rotation": 315,
        "transparent": 70,
        "spacing": 80
    }
}
```

支持格式：docx/wps/doc/pdf/ofd（v8.2 起支持 docx/wps/doc/PDF）

---

## 四、JS SDK (JSSDK) 书签操作能力

### 4.1 书签相关 API

| API | 说明 | 使用场景 |
|-----|------|---------|
| `Application.ActiveDocument.Bookmarks.item(name)` | 获取指定书签对象 | 定位书签 |
| `bookmark.setText(content)` | 设置书签文本内容 | 替换书签文字 |
| `Application.ActiveDocument.Bookmarks.batchSetText(items)` | **批量设置多个书签**（推荐） | 一次填充所有字段 |
| `Application.ActiveDocument.Bookmarks.setTextCandidates({...})` | 为书签设置预设下拉值 | 提供可选填充值 |
| `bookmark.range.appendText(text)` | 在书签末尾追加内容 | 保留原文本并追加 |
| `bookmark.range.insertText(offset, text)` | 在书签指定偏移处插入内容 | 精确插入 |
| `bookmark.range.clear()` | 清空书签内容 | 删除书签文本 |

### 4.2 `batchSetText` 批量设置（最推荐）

```javascript
const result = await Application.ActiveDocument.Bookmarks.batchSetText([
    { key: 1,          text: '通过序号设置' },        // 通过序号
    { key: '甲方',      text: 'A公司' },              // 通过名称
    { key: '乙方',      text: 'B公司' },
    { key: '签订日期',  text: '2026-01-28' },
    { key: '合同金额',  text: '100,000元' }
]);

// 返回: { success: bool, successCount: N, failureCount: N, details: [...] }
```

### 4.3 其他书签能力

| 功能 | API |
|------|-----|
| 创建书签 | `Application.ActiveDocument.Bookmarks.add(name, range)` |
| 修改书签名称 | `bookmark.name = newName` |
| 获取大纲内容 | `Application.ActiveDocument.getOutlineContent()` |
| 获取选区内容 | `Application.ActiveDocument.Selection` |
| 查找指定内容 | `Application.ActiveDocument.search(text)` |
| 创建可编辑区域 | 通过 PermissionRange API |
| 跨文档拷贝粘贴 | 通过 Range 的 copy/paste |

---

## 五、与公文套红场景的关联分析

### 5.1 方案一重新评估：✅ 可行！

之前的 5 轮测试失败原因是**参数名错误**：

| 字段 | 我们发送的（错误） | 正确的 |
|------|-------------------|--------|
| 文本值字段名 | `"text"` / `"value"` / `"data"` | **`"dataRef"`** |
| refName | 未提供 | TEXT 时可省略 |

**修正后的 TEXT arg：**
```json
{"bookname": "发文字号", "dataType": "TEXT", "dataRef": "瑞政发〔2026〕6号"}
```

**修正后的完整请求（混合 TEXT + DOC）：**
```json
{
    "actId": "UpdateBookmarkRef",
    "options": {
        "args": [
            {"bookname": "Content", "dataType": "DOC", "dataRef": "http://oa/下载正文", "refName": "正文.docx"},
            {"bookname": "发文字号", "dataType": "TEXT", "dataRef": "瑞政发〔2026〕6号"},
            {"bookname": "标题", "dataType": "TEXT", "dataRef": "关于测试套红扩展功能的通知"},
            {"bookname": "发文机关", "dataType": "TEXT", "dataRef": "瑞安市人民政府办公室"},
            {"bookname": "发文日期", "dataType": "TEXT", "dataRef": "2026年6月12日"},
            {"bookname": "主送机关", "dataType": "TEXT", "dataRef": "各镇人民政府，各街道办事处"},
            {"bookname": "抄送机关", "dataType": "TEXT", "dataRef": "市委各部门，市人大常委会办公室"},
            {"bookname": "签发人", "dataType": "TEXT", "dataRef": "张三"},
            {"bookname": "紧急程度", "dataType": "TEXT", "dataRef": "特急"},
            {"bookname": "密级", "dataType": "TEXT", "dataRef": "机密"},
            {"bookname": "印发机关", "dataType": "TEXT", "dataRef": "瑞安市人民政府办公室"},
            {"bookname": "印发日期", "dataType": "TEXT", "dataRef": "2026年6月12日"},
            {"bookname": "份数", "dataType": "TEXT", "dataRef": "10"},
            {"bookname": "主题词", "dataType": "TEXT", "dataRef": "套红 测试 通知"},
            {"bookname": "附注", "dataType": "TEXT", "dataRef": "（此件公开发布）"}
        ]
    }
}
```

### 5.2 方案一 vs 方案二 重新对比

| 维度 | 方案一（修正后） | 方案二（POI预处理） |
|------|-----------------|---------------------|
| **复杂度** | ⭐ 极简（1个字段名修正） | ⭐⭐ 中等 |
| **工作量** | 15分钟 | 已完成实现 |
| **维护成本** | 极低 | 中（POI 依赖） |
| **额外IO** | 无 | 下载模板→修改→上传 |
| **风险** | 需重新测试验证 | 已实现，POI 定位待增强 |

### 5.3 PIC 类型的潜在价值

官方文档支持 `dataType: "PIC"`，可以替换为图片。这对公文套红可能有以下应用：
- **电子印章/签名图片**替换到指定书签位置
- **红头图片**替换（如果红头不是文字而是图片）

### 5.4 JSSDK batchSetText 作为备选方案

如果服务端 API 仍然有问题，前端 JSSDK 的 `batchSetText()` 提供了另一种途径：
- 路径：用户选择模板 → 前端 SDK 打开模板 → `batchSetText()` 一次性填充所有字段 → 保存
- 优点：批量操作、有详细返回结果、不存在字段名问题
- 缺点：需要用户交互，不能纯后端自动化

---

## 六、现有项目中 FileZ API 使用情况

| API | 项目中的调用位置 | 状态 |
|-----|----------------|------|
| `POST /content/update` (UpdateBookmarkRef) | `EuFileZManagerImpl.edocRed()` / `EuFileZRedManagerImpl.edocRedWithFields()` / `edocRedTest()` | ✅ 使用中 |
| `POST /convert` | `EuFileZManagerImpl.edocPdf()` | ✅ 使用中 |
| `POST /content/update` (ApplyPicWatermark) | `WatermarkEvent.java` | ✅ 使用中 |
| `GET /download` | `EuFileZManagerImpl.saveRed()` / `savePdf()` / `saveWater()` | ✅ 使用中 |
| FileZ Editor URL | `EuFileZManagerImpl.getFileZUrl()` | ✅ 使用中 |
| JSSDK Bookmark.setText | `fileZsdkShow.js` | ✅ 使用中 |
| **JSSDK batchSetText** | — | ⚪ 未使用 |
| **POST /content/query** | — | ⚪ 未使用 |
| **ClearDoc** | — | ⚪ 未使用 |

---

## 七、建议下一步行动

### 7.1 优先级 P0：修正方案一并重新测试

修正 `edocRedTest` 中 TEXT arg 的参数名：

```java
// 错误（当前代码）
textArg.put("text", bookValue);

// 正确
textArg.put("dataRef", bookValue);
```

部署后重新执行测试指南的步骤验证。

### 7.2 优先级 P1：如方案一验证通过

1. 将修正后的方案一逻辑合入 `EuFileZRedManagerImpl.edocRedWithFields()`
2. 移除 POI 预处理步骤（因为 FileZ API 直接支持 TEXT）
3. 大幅简化代码

### 7.3 优先级 P2：如方案一验证仍失败

1. 保留当前实现的方案二（POI 预处理）
2. 考虑使用 JSSDK 的 `batchSetText` 作为 Plan C

### 7.4 长期优化

1. 探索 PIC 类型书签替换（电子印章/签名场景）
2. 探索 `/content/query` 接口（查询模板中的书签列表，可用于验证模板）
3. 统一套红配置到 `EuConfig.formFieldBookmarks`

---

## 八、参考链接

| 资源 | URL |
|------|-----|
| 服务端API概述 | https://api.filez.com/office/docs/docs-api/get-started/overview/ |
| Open API概述 | https://api.filez.com/office/docs/docs-api/open-api/overview/ |
| 文档内容操作API | https://api.filez.com/office/docs/docs-api/open-api/api-list/content-operation/ |
| 文档内容查询API | https://api.filez.com/office/docs/docs-api/open-api/api-list/content-query/ |
| JS SDK 书签修改 | https://api.filez.com/office/docs/jssdk/cases-examples/basic-capabilities/modify-bookmark-content/ |
| 基本概念 | https://api.filez.com/office/docs/docs-api/get-started/basic-concepts/ |

---

*文档结束*
