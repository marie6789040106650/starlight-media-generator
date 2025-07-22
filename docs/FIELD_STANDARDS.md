# 业务字段标准文档

## 📋 概述

本文档定义了老板IP打造方案生成器项目中所有业务模块使用的标准字段结构，确保数据一致性和系统兼容性。

## 🏗️ 模块1：信息填写 + 关键词拓展

### 基础字段结构

| 字段名                    | 类型       | 必填 | 说明              |
| ---------------------- | -------- | -- | --------------- |
| storeName              | string   | ✅  | 店铺名称            |
| storeCategory          | string   | ✅  | 所属行业（餐饮、美业等）    |
| storeLocation          | string   | ✅  | 所在城市/商圈等        |
| businessDuration       | string   | ❌  | 开店时长，如"3年"      |
| storeFeatures          | string[] | ✅  | 店铺特色（支持多选+自定义）  |
| ownerName              | string   | ✅  | 老板姓氏，用于IP昵称生成   |
| ownerFeatures          | string[] | ✅  | 老板人格特色（多选+自定义）  |
| confirmedStoreKeywords | array    | ✅  | 用户确认后的关键词列表（店铺） |
| confirmedOwnerKeywords | array    | ✅  | 用户确认后的关键词列表（老板） |

### 关键词数组结构

```typescript
interface KeywordItem {
  keyword: string;      // 关键词
  description: string;  // 关键词描述
}

// 示例数据
confirmedStoreKeywords: [
  { keyword: "秘制锅底", description: "独家配方，口味独特，顾客记忆点强" },
  { keyword: "老成都装修", description: "风格复古，提升顾客沉浸感" }
]
```

## 🎯 模块2：老板IP打造方案生成

### 输入字段（继承模块1所有字段）

```typescript
interface Module2Request {
  // 继承模块1的所有字段
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
```

### 输出字段结构（8个板块）

#### MVP版本（4个板块）
| 字段名            | 类型              | 说明        |
| -------------- | --------------- | --------- |
| ipTags         | string[]        | IP标签体系    |
| brandSlogan    | string          | 品牌主张      |
| contentColumns | ContentColumn[] | 内容板块设计    |
| goldenSentences| string[]        | 金句表达模板    |

#### 完整版本（延后开发的4个板块）
| 字段名                   | 类型       | 说明      |
| --------------------- | -------- | ------- |
| accountMatrix         | string[] | 账号矩阵    |
| liveStreamDesign      | string[] | 直播设计    |
| operationAdvice       | string[] | 运营建议    |
| commercializationPath | string[] | 商业化路径   |

### 内容栏目结构

```typescript
interface ContentColumn {
  title: string;       // 栏目标题
  description: string; // 栏目描述
}

// 示例数据
contentColumns: [
  {
    title: "张哥说",
    description: "用成都话讲串串文化、店铺趣事"
  },
  {
    title: "顾客打卡",
    description: "顾客吃播体验或点评短视频专栏"
  }
]
```

## 🎨 模块3：视觉Banner生成系统

### 输入字段（从模块1、2提取）

| 字段名                    | 类型              | 来源    | 说明                 |
| ---------------------- | --------------- | ----- | ------------------ |
| storeName              | string          | 模块1   | 店名或品牌名，用作Banner主文案 |
| storeCategory          | string          | 模块1   | 所属行业，影响色调与风格建议     |
| storeLocation          | string          | 模块1   | 可选，用于地域特色展示        |
| confirmedStoreKeywords | KeywordItem[]   | 模块1   | 可提取1-2个作为设计标签元素    |
| brandSlogan            | string          | 模块2输出 | 作为Banner文案主标题或副标题  |
| ipTags                 | string[]        | 模块2输出 | 提取5-8个标签用于视觉元素设计   |
| contentColumns         | ContentColumn[] | 模块2输出 | 从栏目标题中提取视觉符号建议     |

### 输出字段结构

```typescript
interface BannerDesign {
  mainTitle: string;        // 主标题建议
  subtitle?: string;        // 副标题建议
  backgroundStyle: string;  // 背景风格建议
  colorTheme: string;       // 色调建议
  fontStyle: string;        // 字体风格建议
  visualSymbols: string[];  // 视觉符号建议
}

interface Module3Output {
  bannerDesign: BannerDesign;  // Banner设计建议
  imagePrompt: string;         // 图像生成Prompt
  designTags: string[];        // 设计标签（用于视觉元素）
}
```

## 🔄 流式响应相关字段

### 流式数据块结构

```typescript
interface StreamChunk {
  type: 'content' | 'error' | 'done';  // 内容类型
  data?: any;                          // 数据内容
  error?: string;                      // 错误信息
  done?: boolean;                      // 是否完成
}
```

### 模块2流式状态结构

```typescript
interface Module2StreamState {
  ipTags: {
    content: string[];
    isComplete: boolean;
  };
  brandSlogan: {
    content: string;
    isComplete: boolean;
  };
  contentColumns: {
    content: ContentColumn[];
    isComplete: boolean;
  };
  goldenSentences: {
    content: string[];
    isComplete: boolean;
  };
}
```

## 📝 API端点字段映射

### `/api/module1-keywords`
- **输入**: StoreInfo基础字段
- **输出**: confirmedStoreKeywords, confirmedOwnerKeywords

### `/api/module2-plan-stream`
- **输入**: Module2Request (包含模块1所有字段)
- **输出**: 流式返回8个板块数据

### `/api/module3-banner`
- **输入**: 从模块1、2提取的字段
- **输出**: Module3Output

## ⚠️ 重要注意事项

1. **字段命名一致性**: 所有API、组件、Hook必须使用相同的字段名
2. **类型安全**: 使用TypeScript确保字段类型正确
3. **数据验证**: 所有输入数据必须经过验证
4. **向后兼容**: 新增字段时保持现有字段不变
5. **文档同步**: 字段变更时同步更新所有相关文档

## 🔧 使用示例

```typescript
// 模块1数据示例
const module1Data: Module1Data = {
  storeName: "馋嘴老张麻辣烫",
  storeCategory: "餐饮",
  storeLocation: "成都·宽窄巷子",
  businessDuration: "3年",
  storeFeatures: ["招牌锅底", "地道川味", "环境复古"],
  ownerName: "张",
  ownerFeatures: ["幽默", "亲和力强"],
  confirmedStoreKeywords: [
    { keyword: "秘制锅底", description: "独家配方，口味独特" }
  ],
  confirmedOwnerKeywords: [
    { keyword: "实干型老板", description: "亲力亲为，重视品质" }
  ]
};

// 模块2输出示例
const module2Output: Module2OutputFull = {
  ipTags: ["实干型", "亲和力强", "复古气质"],
  brandSlogan: "张哥带你吃老成都味道，麻辣也走心！",
  contentColumns: [
    { title: "张哥说", description: "用成都话讲串串文化、店铺趣事" }
  ],
  goldenSentences: ["张哥说：锅底讲究三分火候七分真诚！"]
};
```