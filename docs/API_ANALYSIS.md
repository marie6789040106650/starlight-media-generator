# 项目API完整分析报告

## 📊 API概览

项目共有 **15个API端点**，分布在不同的功能模块中，形成了一个完整的企业IP打造和内容生成系统。

## 🏗️ API架构分层

### 1. 核心业务流程API（主流程）
这些API构成了系统的主要业务流程，按顺序调用：

#### 1.1 模块1 - 关键词生成 `/api/module1-keywords`
- **功能**: 根据店铺信息生成关键词推荐
- **输入**: 店铺基本信息（名称、类别、位置、特色等）
- **输出**: 确认的店铺关键词和老板关键词
- **依赖**: `keyword-manager`, `business-utils`
- **调用时机**: 用户填写店铺信息后的第一步

#### 1.2 模块2 - 方案生成 `/api/module2-plan-stream`
- **功能**: 基于模块1数据生成8个板块的IP打造方案
- **输入**: 模块1的完整数据
- **输出**: 流式返回IP标签、品牌主张、内容栏目等8个板块
- **依赖**: AI模型API（SiliconFlow/OpenAI）
- **调用时机**: 模块1完成后，用户确认关键词

#### 1.3 模块3 - Banner设计 `/api/module3-banner`
- **功能**: 生成Banner设计方案
- **输入**: 模块1+模块2的关键数据
- **输出**: Banner设计元素和视觉符号
- **依赖**: `business-utils`
- **调用时机**: 模块2完成后的最终步骤

### 2. 辅助业务API（支持功能）

#### 2.1 关键词扩展 `/api/expand-keywords`
- **功能**: 扩展用户输入的关键词
- **输入**: 店铺特色、老板特色、店铺类别
- **输出**: 扩展后的关键词列表
- **依赖**: `keyword-manager`
- **调用时机**: 模块1过程中，辅助关键词生成

#### 2.2 品类管理 `/api/category-management`
- **功能**: 管理店铺品类和关键词映射
- **输入**: 品类操作（增删改查）
- **输出**: 品类统计和管理结果
- **依赖**: `category-manager`
- **调用时机**: 系统维护和数据管理

#### 2.3 关键词统计 `/api/keyword-stats`
- **功能**: 统计关键词使用频率
- **输入**: 关键词使用数据
- **输出**: 统计报告
- **依赖**: 本地文件存储
- **调用时机**: 后台数据分析

### 3. 内容生成API（输出功能）

#### 3.1 方案生成 `/api/generate-plan`
- **功能**: 生成完整的IP打造方案
- **输入**: 用户提示词和表单数据
- **输出**: 流式或完整的方案内容
- **依赖**: AI模型API
- **调用时机**: 独立的方案生成入口

#### 3.2 PDF导出 `/api/generate-pdf`
- **功能**: 将方案内容转换为PDF文档
- **输入**: 方案内容、店铺名称、Banner图片
- **输出**: PDF文件下载
- **依赖**: LibreOffice、临时文件管理器
- **调用时机**: 用户需要导出PDF时

#### 3.3 Word导出 `/api/generate-word`
- **功能**: 将方案内容转换为Word文档
- **输入**: 方案内容、店铺名称、Banner图片
- **输出**: Word文件下载
- **依赖**: docx库
- **调用时机**: 用户需要导出Word时

#### 3.4 文档转换 `/api/convert-to-pdf`
- **功能**: 将上传的Word文档转换为PDF
- **输入**: Word文件上传
- **输出**: PDF文件下载
- **依赖**: LibreOffice
- **调用时机**: 用户上传文档转换时

### 4. AI服务API（智能功能）

#### 4.1 聊天流式 `/api/chat-stream`
- **功能**: 提供流式AI对话服务
- **输入**: 消息历史、模型选择
- **输出**: 流式AI回复
- **依赖**: 多个AI提供商（SiliconFlow、OpenAI、Anthropic）
- **调用时机**: 用户与AI交互时

#### 4.2 文本对话 `/api/chat`
- **功能**: 提供标准AI对话服务
- **输入**: 消息数组
- **输出**: AI回复
- **依赖**: SiliconFlow API
- **调用时机**: 简单AI对话需求

#### 4.3 图片生成 `/api/images`
- **功能**: 生成AI图片
- **输入**: 图片描述提示词
- **输出**: 生成的图片URL
- **依赖**: SiliconFlow Images API
- **调用时机**: 需要生成Banner或其他图片时

### 5. 系统监控API（运维功能）

#### 5.1 存储健康检查 `/api/health/storage`
- **功能**: 检查存储系统健康状态
- **输入**: 无
- **输出**: 存储统计和健康状态
- **依赖**: `persistent-storage`
- **调用时机**: 系统监控和运维

#### 5.2 PDF缓存统计 `/api/pdf-cache-stats`
- **功能**: 管理PDF生成缓存
- **输入**: 缓存操作指令
- **输出**: 缓存统计和操作结果
- **依赖**: 临时文件管理器
- **调用时机**: 缓存管理和性能优化

## 🔄 API调用关系图

```
用户输入店铺信息
        ↓
[module1-keywords] ← [expand-keywords] (辅助)
        ↓
[module2-plan-stream] ← AI模型API
        ↓
[module3-banner]
        ↓
[generate-pdf/word] ← [pdf-cache-stats] (缓存管理)
        ↓
文档下载

并行支持：
[chat-stream] ← 用户交互
[images] ← Banner生成
[category-management] ← 数据管理
[keyword-stats] ← 统计分析
[health/storage] ← 系统监控
```

## 📋 API调用先后顺序

### 主流程顺序（必须按顺序）：
1. **module1-keywords** - 生成关键词（必须第一步）
2. **module2-plan-stream** - 生成方案（依赖步骤1）
3. **module3-banner** - 生成Banner（依赖步骤1+2）
4. **generate-pdf/word** - 导出文档（依赖前面所有步骤）

### 辅助功能（可并行调用）：
- **expand-keywords** - 可在步骤1过程中调用
- **images** - 可在任何需要图片时调用
- **chat-stream** - 可随时调用，独立功能
- **category-management** - 后台管理，独立调用
- **keyword-stats** - 数据统计，独立调用
- **health/storage** - 系统监控，独立调用
- **pdf-cache-stats** - 缓存管理，独立调用

### 独立功能（不依赖主流程）：
- **generate-plan** - 独立的方案生成入口
- **chat** - 简单AI对话
- **convert-to-pdf** - 文档转换工具

## 🔧 技术架构特点

### 1. 运行时环境
- **Edge Runtime**: `chat-stream`, `module2-plan-stream` (流式处理)
- **Node.js Runtime**: 其他API (文件处理、数据库操作)

### 2. 依赖关系
- **AI服务依赖**: SiliconFlow ✅、Google Gemini ✅、OpenAI ❌、Anthropic ❌
- **文档处理依赖**: LibreOffice、docx库
- **存储依赖**: 本地文件系统、KV存储
- **缓存依赖**: 临时文件管理器

### 3. AI服务可用性
- **✅ 可用**: SiliconFlow (有密钥)、Google Gemini (有密钥)
- **❌ 不可用**: OpenAI (无密钥)、Anthropic (无密钥)

### 3. 错误处理
- 统一的错误响应格式
- 请求ID追踪
- 自动重试机制
- 优雅降级策略

### 4. 性能优化
- 流式响应处理
- 文件缓存机制
- 并行处理支持
- 资源自动清理

## 📈 使用建议

### 1. 开发调用顺序
```javascript
// 主流程
const keywords = await callAPI('/api/module1-keywords', storeInfo);
const plan = await callStreamAPI('/api/module2-plan-stream', keywords);
const banner = await callAPI('/api/module3-banner', {keywords, plan});
const pdf = await callAPI('/api/generate-pdf', {content, storeName});
```

### 2. 错误处理策略
- 每个API都有独立的错误处理
- 主流程中断时提供回退方案
- 缓存中间结果避免重复计算

### 3. 性能优化建议
- 使用流式API提升用户体验
- 合理利用缓存减少重复计算
- 监控API调用频率和响应时间

## 🎯 总结

该项目的API设计体现了以下特点：
1. **模块化设计** - 每个API职责单一，便于维护
2. **流程化架构** - 主流程清晰，支持步骤化操作
3. **扩展性良好** - 支持多种AI提供商和输出格式
4. **监控完善** - 提供健康检查和性能监控
5. **用户友好** - 支持流式响应和多种导出格式

整个API系统形成了一个完整的企业IP打造解决方案，从数据输入到内容生成，再到文档导出，覆盖了完整的业务流程。