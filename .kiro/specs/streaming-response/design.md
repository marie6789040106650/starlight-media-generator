# 流式响应功能设计文档 (MVP版本)

## 概述

本设计文档描述了基于业务字段标准的流式响应功能实现方案。专注于模块1、2、3的业务流程，使用统一的字段结构，确保数据一致性和系统兼容性。

## 字段标准对齐

本设计严格遵循 `docs/FIELD_STANDARDS.md` 中定义的业务字段标准：

### 核心字段结构
- **storeName**: 店铺名称
- **storeCategory**: 所属行业
- **storeLocation**: 所在城市/商圈
- **confirmedStoreKeywords**: 用户确认的店铺关键词数组
- **confirmedOwnerKeywords**: 用户确认的老板关键词数组
- **businessDuration**: 开店时长（可选）
- **storeFeatures**: 店铺特色数组
- **ownerName**: 老板姓氏
- **ownerFeatures**: 老板人格特色数组

## 架构设计

### 业务模块架构

```mermaid
graph TB
    Client[客户端应用] --> Module1[模块1: 信息填写+关键词]
    Client --> Module2[模块2: IP方案生成]
    Client --> Module3[模块3: Banner设计]
    
    Module1 --> API1[/api/module1-keywords]
    Module2 --> API2[/api/module2-plan-stream]
    Module3 --> API3[/api/module3-banner]
    
    API1 --> Serverless1[Serverless Function]
    API2 --> Edge1[Edge Function]
    API3 --> Serverless2[Serverless Function]
    
    Serverless1 --> PresetKeywords[预置关键词库]
    Edge1 --> SiliconFlow[SiliconFlow API]
    Serverless2 --> DataExtractor[数据提取器]
    
    subgraph "数据流转"
        Module1Data[模块1数据] --> Module2Data[模块2数据]
        Module2Data --> Module3Data[模块3数据]
    end
    
    subgraph "字段标准"
        FieldStandards[统一字段结构]
        FieldStandards --> API1
        FieldStandards --> API2
        FieldStandards --> API3
    end
```

### 混合架构策略

#### Edge Function 使用场景
- **实时聊天对话** (`/api/chat-stream`)
- **快速响应查询** 
- **流式内容生成**
- **低延迟交互**

#### Serverless Function 使用场景
- **完整方案生成** (`/api/generate-plan`)
- **文件处理** (`/api/generate-pdf`, `/api/generate-word`)
- **复杂业务逻辑**
- **数据库操作**

## 组件和接口设计

### 1. 模块1 API (`app/api/module1-keywords/route.ts`)

```typescript
interface Module1API {
  // Serverless Function - 快速返回预置关键词
  POST: (request: Module1Request) => Promise<Module1Response>
  
  // 输入字段（基于字段标准）
  interface Module1Request {
    storeName: string;
    storeCategory: string;
    storeLocation: string;
    businessDuration?: string;
    storeFeatures: string[];
    ownerName: string;
    ownerFeatures: string[];
  }
  
  // 输出字段
  interface Module1Response {
    success: boolean;
    data: {
      confirmedStoreKeywords: KeywordItem[];
      confirmedOwnerKeywords: KeywordItem[];
    };
  }
}
```

### 2. 模块2 流式API (`app/api/module2-plan-stream/route.ts`)

```typescript
interface Module2StreamAPI {
  // Edge Function - 流式生成8板块方案
  POST: (request: Module2Request) => Promise<StreamResponse>
  runtime: 'edge'
  
  // 输入字段（继承模块1所有字段）
  interface Module2Request {
    storeName: string;
    storeCategory: string;
    storeLocation: string;
    businessDuration?: string;
    storeFeatures: string[];
    ownerName: string;
    ownerFeatures: string[];
    confirmedStoreKeywords: KeywordItem[];
    confirmedOwnerKeywords: KeywordItem[];
  }
  
  // 流式输出8个板块（全部需要生成）
  interface Module2StreamOutput {
    ipTags: string[];
    brandSlogan: string;
    contentColumns: ContentColumn[];
    goldenSentences: string[];
    // 其余4个板块（全部需要生成）
    accountMatrix: string[];
    liveStreamDesign: string[];
    operationAdvice: string[];
    commercializationPath: string[];
  }
}
```

### 3. 模块3 API (`app/api/module3-banner/route.ts`)

```typescript
interface Module3API {
  // Serverless Function - 快速返回设计方案
  POST: (request: Module3Request) => Promise<Module3Response>
  
  // 输入字段（从模块1、2提取）
  interface Module3Request {
    storeName: string;
    storeCategory: string;
    storeLocation: string;
    confirmedStoreKeywords: KeywordItem[];
    brandSlogan: string;
    ipTags: string[];
    contentColumns: ContentColumn[];
  }
  
  // 输出字段
  interface Module3Response {
    success: boolean;
    data: {
      bannerDesign: BannerDesign;
      imagePrompt: string;
      designTags: string[];
    };
  }
}

### 4. 业务数据类型系统 (`lib/business-types.ts`)

```typescript
// 基于字段标准的核心类型
interface StoreInfo {
  storeName: string;
  storeCategory: string;
  storeLocation: string;
  businessDuration?: string;
  storeFeatures: string[];
  ownerName: string;
  ownerFeatures: string[];
}

interface KeywordItem {
  keyword: string;
  description: string;
}

interface Module1Data extends StoreInfo {
  confirmedStoreKeywords: KeywordItem[];
  confirmedOwnerKeywords: KeywordItem[];
}

// 模块2输出结构（8个板块全部生成）
interface Module2OutputFull {
  // 前4个板块
  ipTags: string[];
  brandSlogan: string;
  contentColumns: ContentColumn[];
  goldenSentences: string[];
  // 后4个板块（全部需要生成）
  accountMatrix: string[];
  liveStreamDesign: string[];
  operationAdvice: string[];
  commercializationPath: string[];
}

// 流式响应状态（8个板块全部生成）
interface Module2StreamState {
  ipTags: { content: string[]; isComplete: boolean; };
  brandSlogan: { content: string; isComplete: boolean; };
  contentColumns: { content: ContentColumn[]; isComplete: boolean; };
  goldenSentences: { content: string[]; isComplete: boolean; };
  accountMatrix: { content: string[]; isComplete: boolean; };
  liveStreamDesign: { content: string[]; isComplete: boolean; };
  operationAdvice: { content: string[]; isComplete: boolean; };
  commercializationPath: { content: string[]; isComplete: boolean; };
}
```

### 5. 业务流程 Hook (`hooks/use-business-stream.ts`)

```typescript
interface BusinessStreamHook {
  // 模块1状态
  module1: {
    data: Module1Data | null;
    isLoading: boolean;
    error: string | null;
    fetchKeywords: (storeInfo: StoreInfo) => Promise<void>;
  };
  
  // 模块2流式状态
  module2: {
    streamState: Module2StreamState;
    isStreaming: boolean;
    error: string | null;
    startGeneration: (module1Data: Module1Data) => Promise<void>;
    stopGeneration: () => void;
  };
  
  // 模块3状态
  module3: {
    data: Module3Output | null;
    isLoading: boolean;
    error: string | null;
    generateBanner: (module1Data: Module1Data, module2Data: Module2OutputFull) => Promise<void>;
  };
  
  // 通用方法
  reset: () => void;
  retryCurrentStep: () => void;
}
```

### 6. 业务流程UI组件架构

```typescript
// 模块1组件 - 信息填写和关键词选择
interface Module1Component {
  props: {
    onComplete: (data: Module1Data) => void;
    initialData?: Partial<StoreInfo>;
  };
  features: [
    '店铺信息表单',
    '关键词推荐展示',
    '关键词选择和确认',
    '数据验证和提交'
  ];
}

// 模块2组件 - 流式方案生成
interface Module2Component {
  props: {
    module1Data: Module1Data;
    onComplete: (data: Module2OutputFull) => void;
  };
  features: [
    '8个板块分区域展示',
    '实时流式内容更新',
    '生成进度指示',
    '停止和重试控制'
  ];
}

// 模块3组件 - Banner设计预览
interface Module3Component {
  props: {
    module1Data: Module1Data;
    module2Data: Module2OutputFull;
    onComplete: (data: Module3Output) => void;
  };
  features: [
    'Banner设计方案展示',
    '设计元素可视化',
    '生成参数调整',
    '结果导出功能'
  ];
}

// 主容器组件
interface BusinessProcessDemo {
  features: [
    '三个模块的流程编排',
    '数据流转管理',
    '整体进度控制',
    '结果汇总展示'
  ];
}
```

## 数据模型

### 消息流数据结构

```typescript
// 输入消息
{
  role: 'user',
  content: '用户输入的问题',
  timestamp: 1642694400000
}

// 流式响应块
{
  content: '部分AI回复内容',
  timestamp: 1642694401000
}

// 完整响应消息
{
  role: 'assistant',
  content: '完整的AI回复内容',
  timestamp: 1642694405000
}
```

### API 提供商抽象

```typescript
interface StreamProvider {
  endpoint: string
  getHeaders: (apiKey: string) => Record<string, string>
  formatRequest: (request: ChatRequest) => any
  parseStreamChunk: (chunk: string) => string | null
}

// SiliconFlow 实现
class SiliconFlowProvider implements StreamProvider {
  endpoint = 'https://api.siliconflow.cn/v1/chat/completions'
  // ... 具体实现
}

// OpenAI 实现
class OpenAIProvider implements StreamProvider {
  endpoint = 'https://api.openai.com/v1/chat/completions'
  // ... 具体实现
}
```

## 错误处理策略

### 1. 分层错误处理

```typescript
// API 层错误
- 网络连接错误
- API 认证失败
- 速率限制
- 服务不可用

// 流处理错误
- 数据解析失败
- 连接中断
- 超时处理

// 客户端错误
- 状态同步错误
- 内存泄漏防护
- UI 渲染错误
```

### 2. 错误恢复机制

```typescript
interface ErrorRecovery {
  // 自动重试
  retryWithBackoff: (maxRetries: number) => Promise<void>
  
  // 降级处理
  fallbackToAlternativeProvider: () => Promise<void>
  
  // 用户控制
  manualRetry: () => void
  clearErrorState: () => void
}
```

## 性能优化设计

### 1. Edge Function 优化

```typescript
// 冷启动优化
- 最小化依赖包大小
- 使用 Edge Runtime 原生 API
- 避免复杂的初始化逻辑

// 运行时优化
- 流式数据处理
- 内存使用控制
- 连接池管理
```

### 2. 客户端优化

```typescript
// React 性能优化
- useCallback 和 useMemo 优化
- 虚拟滚动（长对话场景）
- 防抖输入处理

// 网络优化
- 请求去重
- 连接复用
- 智能重连
```

## 测试策略

### 1. 单元测试

```typescript
// API 测试
- Edge Function 路由测试
- 流式数据处理测试
- 错误处理测试

// Hook 测试
- 状态管理测试
- 异步操作测试
- 错误场景测试

// 组件测试
- 渲染测试
- 交互测试
- 状态变化测试
```

### 2. 集成测试

```typescript
// 端到端流程测试
- 完整对话流程
- 模型切换测试
- 错误恢复测试

// 性能测试
- 响应时间测试
- 并发用户测试
- 内存使用测试
```

## 部署和监控

### 1. Vercel 部署配置

```json
{
  "functions": {
    "app/api/chat-stream/route.ts": {
      "runtime": "edge",
      "regions": ["hkg1", "sin1"]
    },
    "app/api/generate-plan/route.ts": {
      "runtime": "nodejs18.x",
      "maxDuration": 60
    }
  }
}
```

### 2. 环境变量管理

```bash
# 共享配置
SILICONFLOW_API_KEY=sk-xxx
OPENAI_API_KEY=sk-xxx

# Edge Function 专用
NEXT_PUBLIC_EDGE_REGION=hkg1

# Serverless Function 专用
DATABASE_URL=postgresql://xxx
```

### 3. 监控和日志

```typescript
// 结构化日志
interface LogEntry {
  requestId: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  metadata: Record<string, any>
}

// 性能指标
interface PerformanceMetrics {
  responseTime: number
  throughput: number
  errorRate: number
  concurrentUsers: number
}
```

## 安全考虑

### 1. API 安全

```typescript
// 认证和授权
- API 密钥管理
- 请求频率限制
- 输入验证和清理

// 数据保护
- 敏感信息过滤
- 传输加密
- 日志脱敏
```

### 2. 客户端安全

```typescript
// XSS 防护
- 内容转义
- CSP 策略
- 安全的 HTML 渲染

// 数据泄露防护
- 本地存储加密
- 会话管理
- 敏感数据清理
```

## 扩展性设计

### 1. 模块化架构

```typescript
// 可插拔的 AI 提供商
interface AIProvider {
  name: string
  endpoint: string
  authenticate: (apiKey: string) => boolean
  createStream: (request: ChatRequest) => ReadableStream
}

// 可配置的 UI 主题
interface ChatTheme {
  colors: ColorScheme
  typography: TypographyConfig
  layout: LayoutConfig
}
```

### 2. 功能扩展点

```typescript
// 中间件支持
interface StreamMiddleware {
  beforeRequest: (request: ChatRequest) => ChatRequest
  afterResponse: (response: string) => string
  onError: (error: Error) => void
}

// 插件系统
interface ChatPlugin {
  name: string
  version: string
  install: (context: ChatContext) => void
  uninstall: () => void
}
```

## 迁移和兼容性

### 1. 现有系统集成

```typescript
// 复用现有配置
- lib/models.ts 模型配置
- 环境变量管理
- 错误处理模式

// 保持 API 兼容性
- 相同的认证机制
- 一致的响应格式
- 统一的错误码
```

### 2. 渐进式升级

```typescript
// 功能开关
interface FeatureFlags {
  enableStreamingChat: boolean
  enableModelSelection: boolean
  enableAdvancedUI: boolean
}

// 版本兼容
interface APIVersion {
  version: string
  supportedFeatures: string[]
  deprecatedFeatures: string[]
}
```