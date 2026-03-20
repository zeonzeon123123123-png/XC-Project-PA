# 🔑 API 配置指南

## 📋 概述

AI 智能表单助手支持调用真实的 AI 模型和联网搜索功能，需要提供相应的 API 密钥。

---

## ⚙️ 配置步骤

### 1️⃣ 复制配置文件

```bash
cd /home/jun/.openclaw/workspace/XC-Project-PA
cp api-config.example.json api-config.json
```

### 2️⃣ 编辑配置文件

打开 `api-config.json`，填入你的 API 密钥：

```json
{
  "model": "qwen-plus",
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "sk-your-actual-api-key-here",
  
  "webSearch": {
    "enabled": true,
    "provider": "brave",
    "apiKey": "your-brave-search-api-key"
  }
}
```

---

## 🔑 获取 API 密钥

### 阿里云 Qwen（通义千问）

**适用模型：** qwen-plus, qwen-max, qwen-turbo

1. 访问：https://dashscope.console.aliyun.com/
2. 登录阿里云账号
3. 进入"API-KEY 管理"
4. 创建新的 API 密钥
5. 复制密钥到配置文件

**免费额度：** 新用户有一定免费额度

---

### 智谱 GLM

**适用模型：** glm-4, glm-3-turbo

1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入"API 密钥"页面
4. 创建 API 密钥
5. 修改配置文件中的 `baseUrl` 为：`https://open.bigmodel.cn/api/paas/v4`

**免费额度：** 新用户有免费体验金

---

### OpenAI GPT

**适用模型：** gpt-4, gpt-3.5-turbo

1. 访问：https://platform.openai.com/api-keys
2. 登录 OpenAI 账号
3. 创建新的 API 密钥
4. 修改配置文件中的 `baseUrl` 为：`https://api.openai.com/v1`

**注意：** 需要海外账号和支付方式

---

### 联网搜索 API

#### Brave Search（推荐）

1. 访问：https://brave.com/search/api/
2. 点击"Get Started"
3. 注册账号
4. 创建 API 密钥（免费计划：每月 2000 次搜索）
5. 复制密钥到配置文件的 `webSearch.apiKey`

#### Bing Search

1. 访问：https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
2. 登录 Microsoft Azure 账号
3. 创建 Bing Search API 资源
4. 获取 API 密钥
5. 修改配置文件：
   ```json
   {
     "webSearch": {
       "provider": "bing",
       "apiKey": "your-bing-api-key"
     }
   }
   ```

#### Google Custom Search

1. 访问：https://cse.google.com/cse/
2. 创建 Custom Search Engine
3. 获取 CX（Custom Search Engine ID）
4. 访问：https://console.cloud.google.com/apis/credentials
5. 创建 API 密钥
6. 修改配置文件：
   ```json
   {
     "webSearch": {
       "provider": "google",
       "apiKey": "your-google-api-key",
       "googleCX": "your-cx-id"
     }
   }
   ```

---

## ✅ 验证配置

### 方法 1：浏览器控制台

1. 打开研发立项书页面
2. 按 F12 打开浏览器控制台
3. 查看日志：
   ```
   ✅ AI API Service 已初始化
   ✅ AI Form Assistant 已初始化
   ```

### 方法 2：测试问答

1. 在 AI 助手对话框输入：
   ```
   2026 年 AI 行业的最新趋势是什么？
   ```
2. 如果配置正确，AI 会：
   - 调用 AI 模型生成回答
   - 联网搜索最新信息
   - 提供综合回答

### 方法 3：测试历史数据 + AI

1. 在"项目名称"输入："智能摄像头系统"
2. 在对话框输入：
   ```
   这个项目的技术可行性应该怎么写？
   ```
3. AI 应该：
   - 检索历史项目（摄像头相关）
   - 调用 AI 模型生成建议
   - 提供详细的可行性分析模板

---

## 🔧 故障排查

### 问题 1：提示"未配置 API 密钥"

**原因：** API 密钥未填写或配置文件未加载

**解决方法：**
1. 确认 `api-config.json` 文件存在
2. 确认 `apiKey` 字段已填写
3. 刷新页面
4. 查看浏览器控制台是否有错误

---

### 问题 2：联网搜索不工作

**原因：** 搜索 API 密钥未配置

**解决方法：**
1. 检查 `webSearch.apiKey` 是否填写
2. 确认 `webSearch.enabled` 为 `true`
3. 测试搜索 API 密钥是否有效：
   ```bash
   curl "https://api.search.brave.com/res/v1/web/search?q=test" \
     -H "X-Subscription-Token: YOUR_API_KEY"
   ```

---

### 问题 3：API 调用失败

**可能原因：**
- API 密钥错误
- 网络问题
- 额度不足

**解决方法：**
1. 检查 API 密钥是否正确
2. 查看浏览器控制台错误信息
3. 登录 API 提供商控制台查看额度
4. 尝试切换其他模型提供商

---

## 🔐 安全提醒

### ⚠️ 重要：不要将 API 密钥提交到 Git！

```bash
# 将 api-config.json 添加到 .gitignore
echo "api-config.json" >> .gitignore
git add .gitignore
git commit -m "gitignore: 忽略 API 配置文件"
```

### 推荐做法

1. **本地开发：** 使用 `api-config.json`（已添加到 .gitignore）
2. **生产环境：** 
   - 使用环境变量
   - 使用后端代理服务
   - 使用密钥管理服务

---

## 📊 费用说明

### AI 模型 API

| 提供商 | 模型 | 价格（约） | 免费额度 |
|--------|------|-----------|---------|
| 阿里云 | qwen-plus | ¥0.004/1K tokens | 新用户¥200 |
| 阿里云 | qwen-turbo | ¥0.002/1K tokens | 新用户¥200 |
| 智谱 | glm-4 | ¥0.1/1K tokens | 新用户¥10 |
| OpenAI | gpt-4 | $0.03/1K tokens | 无 |

### 搜索 API

| 提供商 | 免费计划 | 付费计划 |
|--------|---------|---------|
| Brave | 2000 次/月 | $3/1000 次 |
| Bing | 1000 次/月 | $15/10000 次 |
| Google | 100 次/天 | $5/1000 次 |

---

## 🚀 快速开始（最小配置）

如果只想快速测试，只需配置 AI 模型 API：

```json
{
  "model": "qwen-plus",
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "apiKey": "sk-your-qwen-api-key",
  
  "webSearch": {
    "enabled": false
  }
}
```

这样 AI 助手可以：
- ✅ 调用 AI 模型回答问题
- ✅ 结合历史项目数据
- ❌ 无法联网搜索（需要单独配置搜索 API）

---

## 📞 获取帮助

如遇到问题：
1. 查看浏览器控制台错误信息
2. 检查 API 提供商的状态页面
3. 参考本文档的故障排查部分
4. 联系项目维护者

---

**文档版本**: v1.0  
**更新时间**: 2026-03-20  
**GitHub**: https://github.com/zeonzeon123123123-png/XC-Project-PA
