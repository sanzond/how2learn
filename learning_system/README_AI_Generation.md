# AI 生成学习数据功能使用指南

## 🎯 功能概述

本模块集成了强大的 AI 生成功能，可以基于学习集的 `full_text` 内容，调用第三方 AI API 自动生成完整的学习数据结构，包括词汇、线索、句子分析等。

## 🚀 支持的 AI 平台

### 1. **OpenAI (ChatGPT)**
- 模型：GPT-3.5-turbo, GPT-4, GPT-4-turbo
- API 地址：`https://api.openai.com/v1/chat/completions`
- 需要：OpenAI API Key

### 2. **Google Gemini**
- 模型：gemini-pro, gemini-pro-vision
- API 地址：`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- 需要：Google AI Studio API Key

### 3. **DeepSeek**
- 模型：deepseek-chat, deepseek-coder
- API 地址：`https://api.deepseek.com/v1/chat/completions`
- 需要：DeepSeek API Key

### 4. **Anthropic Claude**
- 模型：claude-3-sonnet, claude-3-opus
- API 地址：`https://api.anthropic.com/v1/messages`
- 需要：Anthropic API Key

### 5. **自定义 API**
- 支持任何兼容的 REST API
- 可自定义请求格式

## 📋 使用步骤

### 第一步：配置 AI 服务提供商

1. 进入 **学习系统** → **配置** → **AI 配置**
2. 点击 **创建** 添加新的 AI 配置
3. 填写配置信息：
   - **Provider Name**: 自定义名称
   - **Provider Type**: 选择 AI 平台类型
   - **API URL**: API 接口地址
   - **API Key**: 您的 API 密钥
   - **Model Name**: 模型名称
4. 点击 **测试连接** 验证配置
5. 勾选 **Default Provider** 设为默认

### 第二步：生成学习数据

1. 进入 **学习系统** → **学习集**
2. 选择或创建一个学习集
3. 确保填写了 **Full Text** 字段（英文句子）
4. 点击页面顶部的 **AI 生成数据** 按钮
5. 在弹出的向导中：
   - 选择 AI 提供商
   - 选择生成模式：
     - **Replace All Data**: 替换所有现有数据
     - **Append to Existing Data**: 追加到现有数据
     - **Update Existing Data**: 更新现有数据
6. 点击 **开始生成**
7. 等待生成完成，查看结果

## ⚙️ 配置参数说明

### **基础配置**
- **Provider Name**: 配置的显示名称
- **Provider Type**: AI 平台类型选择
- **API URL**: 完整的 API 接口地址
- **API Key**: 从 AI 平台获取的密钥
- **Model Name**: 具体的模型名称

### **生成参数**
- **Timeout**: 请求超时时间（秒）
- **Max Tokens**: 最大生成 token 数量
- **Temperature**: 生成随机性（0-1，越高越随机）

### **选项设置**
- **Active**: 是否启用此配置
- **Default Provider**: 是否为默认提供商

## 🔧 API 密钥获取

### **OpenAI**
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册/登录账号
3. 进入 **API Keys** 页面
4. 点击 **Create new secret key**
5. 复制生成的密钥

### **Google Gemini**
1. 访问 [Google AI Studio](https://makersuite.google.com/)
2. 登录 Google 账号
3. 点击 **Get API key**
4. 创建新的 API 密钥
5. 复制密钥

### **DeepSeek**
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入 **API Keys** 管理页面
4. 创建新的 API 密钥
5. 复制密钥

### **Anthropic Claude**
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账号
3. 进入 **API Keys** 页面
4. 生成新的密钥
5. 复制密钥

## 📊 生成数据结构

AI 会根据提供的英文句子生成以下结构的数据：

### **词汇数据 (vocabulary)**
- 4-8个关键词汇
- 每个词汇包含：中文翻译、例句、常见错误
- 3个不同类型的学习线索

### **线索类型 (cues)**
- `context` - 上下文线索
- `synonym` - 同义词线索
- `time` - 时间概念
- `feeling` - 情感描述
- `image` - 形象化描述
- `pattern` - 模式规律
- `anatomy` - 身体相关
- `category` - 分类归纳
- `opposite` - 反义对比
- `symptom` - 症状描述

### **句子分析 (sentences)**
- 预测理解问题
- 3个错误选项（含错误原因）
- 正确答案和详细解释
- 完整的语法结构分析

## 🛠️ 故障排除

### **常见错误**

1. **API Key 无效**
   - 检查密钥是否正确
   - 确认密钥是否过期
   - 验证账户余额

2. **网络连接失败**
   - 检查网络连接
   - 确认 API 地址正确
   - 检查防火墙设置

3. **生成内容格式错误**
   - AI 响应可能不是标准 JSON
   - 尝试调整 temperature 参数
   - 检查 max_tokens 设置

4. **超时错误**
   - 增加超时时间设置
   - 减少输入文本长度
   - 降低 max_tokens 参数

### **优化建议**

1. **提高生成质量**
   - 使用更高级的模型（如 GPT-4）
   - 适当调整 temperature（0.5-0.8）
   - 确保输入文本语法正确

2. **提升生成速度**
   - 选择响应速度快的模型
   - 适当减少 max_tokens
   - 使用稳定的网络环境

3. **降低成本**
   - 选择性价比高的模型
   - 控制 max_tokens 数量
   - 避免频繁重复生成

## 📈 最佳实践

### **输入文本准备**
1. 确保英文句子语法正确
2. 长度适中（1-3个句子最佳）
3. 包含有学习价值的词汇
4. 避免过于简单或复杂的内容

### **配置管理**
1. 为不同用途配置多个 AI 提供商
2. 定期测试连接状态
3. 根据需要调整生成参数
4. 备份重要的配置信息

### **数据管理**
1. 生成前备份现有数据
2. 检查生成结果的质量
3. 适当手动调整生成内容
4. 定期更新学习材料

## 🔒 安全注意事项

1. **API 密钥安全**
   - 不要在公共场所暴露密钥
   - 定期更换 API 密钥
   - 限制密钥的使用权限

2. **数据隐私**
   - 注意发送给 AI 的内容隐私
   - 避免包含敏感信息
   - 了解各平台的数据处理政策

3. **成本控制**
   - 监控 API 使用量
   - 设置合理的使用限额
   - 避免无意中的大量调用

---

*此功能基于 learning_data_generation_prompt.md 中的提示词模板，确保生成的数据与现有系统完全兼容。*