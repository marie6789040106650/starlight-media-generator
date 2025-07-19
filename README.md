# 🚀 Starlight Media Generator

> AI驱动的企业IP打造方案生成器 | AI-Powered Business IP Development Solution Generator

基于硅基流动DeepSeek-V3等多种AI模型的智能方案生成系统，专为中小企业老板IP打造而设计。

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-8.15.0-orange?logo=pnpm)](https://pnpm.io/)

## 🚀 项目特点

- **精选模型**: 集成5种精选AI模型，包括DeepSeek-V3、Kimi、GLM等
- **智能生成**: 一键生成专业的老板IP打造方案
- **专业导出**: 完整重构的Word文档生成器，支持专业级文档输出
- **模块化设计**: 易于扩展和维护的代码结构
- **用户友好**: 直观的界面和丰富的功能

## 📋 功能列表

### ✅ 核心功能
- [x] 商家信息填写表单
- [x] AI模型选择（5种精选模型）
- [x] 智能关键词拓展（自动触发+手动触发）
- [x] 品类特定关键词推荐（基于店铺品类提供相关关键词）
- [x] 关键词统计分析系统
- [x] 专业方案生成
- [x] 批量输入识别
- [x] 方案导出功能（复制/Word/PDF）- Word导出完整重构
- [x] 智能内容复制（格式清理+元数据）
- [x] 自动Banner图片生成
- [x] 专业Word文档导出 (完整重构+专业级实现)
- [x] 智能文件命名（自动从内容提取标题作为文件名）
- [x] 多步骤用户流程
- [x] 内容渲染和目录导航
- [x] 增强浮动目录导航（统一设备支持）
- [x] 响应式设计
- [x] 增强错误处理和用户反馈
- [x] 详细日志记录和调试支持
- [x] 自动关键词拓展触发（输入框焦点触发）
- [x] Word导出测试页面（专业级测试界面）
- [x] 页面头部导航优化（品牌链接+真实Logo图片）
- [x] 品类选择优化（自动显示下拉选项+按拼音排序）
- [x] **全面内容保护系统**（彻底禁用所有复制操作）
- [x] **键盘快捷键拦截**（Ctrl+C/X/V/A/S/P/F12等）
- [x] **鼠标操作保护**（右键菜单、文本选择、拖拽）
- [x] **开发者工具阻止**（F12、查看源码、控制台访问）
- [x] **CSS样式保护**（样式层面的选择和拖拽禁用）
- [x] **智能例外处理**（表单元素正常功能保持）
- [x] **可视化配置管理器**（实时保护模式切换）
- [x] 增强复制控制系统（全面的复制功能管理和配置）
- [x] 基于路由的复制控制（不同页面不同复制权限）
- [x] **智能权限管理**（首页允许复制，结果页禁止鼠标键盘复制但保留Word/PDF导出）
- [x] 全面内容保护系统（禁止复制、剪切、选择和右键操作）
- [x] 智能保护机制（自动识别可编辑元素，允许正常输入）
- [x] 可视化保护提示（用户友好的操作反馈）
- [x] 动态保护控制（基于配置实时启用/禁用保护功能）

### 🔧 代码质量优化
- [x] 移除未使用的变量和函数，提升代码质量
- [x] 优化TypeScript类型检查，确保类型安全
- [x] 完善错误处理机制，提升系统稳定性
- [x] 增强文本处理能力，自动清理转义序列和特殊字符
- [x] 增强Markdown解析器，支持引用块和更多格式化内容

### ✅ AI模型支持
- [x] **DeepSeek-V3**: 最推荐 - 推理能力强
- [x] **Kimi-K2 标准版**: 长上下文场景
- [x] **Kimi-K2 Pro版**: 高要求场景
- [x] **GLM-4.1V-9B-Thinking**: 思维链推理
- [x] **DeepSeek-R1-Qwen3-8B**: 推理优化

### ✅ 开发工具
- [x] 模型验证脚本
- [x] Markdown解析测试脚本
- [x] 测试页面
- [x] 使用文档
- [x] 配置管理

## 🛠️ 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **UI组件**: Radix UI, Tailwind CSS
- **AI接口**: 硅基流动API
- **状态管理**: React Hooks
- **包管理器**: pnpm@8.15.0 (推荐)
- **运行环境**: Node.js >= 18.0.0

## 📦 项目结构

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # 通用聊天API
│   │   ├── generate-plan/route.ts # 方案生成API
│   │   ├── images/route.ts        # 图片生成API
│   │   ├── keyword-stats/route.ts # 关键词统计分析API
│   │   └── expand-keywords/       # 关键词拓展API
│   ├── page.tsx                   # 主页面 (多步骤流程架构)
│   ├── page-original.tsx          # 原版页面 (备份参考)
│   └── result/page.tsx           # 结果展示页面
├── components/
│   ├── ui/                        # UI组件库 (Radix UI + Tailwind)
│   ├── content-renderer.tsx       # 内容渲染组件 (Markdown解析)
│   ├── form-section.tsx           # 表单组件 (完整表单逻辑)
│   ├── page-header.tsx            # 页面头部组件
│   ├── progress-steps.tsx         # 进度步骤组件
│   ├── section-collapsible.tsx    # 可折叠区域组件
│   ├── toc-navigation.tsx         # 目录导航组件
│   └── theme-provider.tsx         # 主题提供者组件
├── lib/
│   ├── export/                    # 文档导出模块
│   │   ├── word-generator.ts      # Word文档生成器 (完整重构+专业级实现)
│   │   ├── pdf-generator.ts       # PDF文档生成器 (水印+格式化)
│   │   ├── markdown-parser.ts     # Markdown内容解析器 (v1.0.27重构版)
│   │   └── style-config.ts        # 样式配置管理 (统一配置系统)
│   ├── models.ts                  # AI模型配置
│   ├── types.ts                   # TypeScript类型定义
│   ├── constants.ts               # 常量配置
│   └── utils.ts                   # 工具函数库 (增强版)
├── hooks/
│   ├── use-banner-image.ts        # Banner图片生成Hook
│   ├── use-form-data.ts           # 表单数据管理Hook (完整状态管理)
│   ├── use-keyword-stats.ts       # 关键词统计分析Hook (数据统计和分析)
│   ├── use-mobile.tsx             # 移动端检测Hook
│   ├── use-plan-generation.ts     # 方案生成Hook (业务逻辑分离)
│   ├── use-sections.ts            # 区域折叠状态管理Hook
│   ├── use-toc.ts                 # 目录导航Hook
│   └── use-toast.ts               # 消息提示Hook
├── utils/
│   ├── clipboard-utils.ts         # 剪贴板工具函数 (受配置控制)
│   ├── export-utils.ts            # 导出工具函数 (受配置控制)
│   └── prevent-copy.ts            # 全面内容保护系统 v2.0 (彻底禁用所有复制操作)
├── config/
│   ├── copy-settings.ts           # 复制功能配置管理 (核心控制系统 + 路由控制)
│   ├── export-styles.json         # 导出样式配置
│   └── keyword-stats.json         # 关键词统计配置
├── scripts/
│   └── verify-models.js          # 模型验证脚本
├── temp/
│   └── test-export.js            # Markdown解析测试脚本
└── docs/
    ├── environment-setup.md      # 环境配置指南
    ├── model-guide.md            # 模型使用指南
    └── developer-guide.md        # 开发者指南
```

## 🚀 快速开始

### 1. 环境要求

确保您的开发环境满足以下要求：

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐使用 pnpm@8.15.0)

> 📖 详细的环境配置指南请参考：[环境配置指南](docs/environment-setup.md)

### 2. 环境配置

```bash
# 克隆项目
git clone <your-repo>
cd your-project

# 安装依赖
pnpm install
```

### 3. 配置API密钥

在 `.env.local` 文件中配置：

```env
# 硅基流动 API 配置
SILICONFLOW_API_KEY=your_api_key_here
```

### API端点要求
关键词统计分析系统需要以下API端点：
- `GET /api/keyword-stats` - 获取关键词统计数据
- `POST /api/keyword-stats` - 更新关键词统计数据

请确保实现这些端点以支持完整的关键词统计功能。

### 4. 依赖说明

项目已包含所有必需的依赖：

```json
{
  "dependencies": {
    "docx": "^9.5.1",           // Word文档生成
    "file-saver": "^2.0.5",     // 文件下载
    "jspdf": "^3.0.1"           // PDF文档生成
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"  // TypeScript类型定义
  }
}
```

### 5. 验证和测试

```bash
# 验证AI模型可用性
node scripts/verify-models.js

# 测试Markdown解析功能
pnpm test
# 或者直接运行
node tests/scripts/test-markdown-export.js

# 清理测试文件（可选）
pnpm run cleanup
```

### 6. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

> **注意**: 项目使用标准的 Next.js 开发服务器，如需智能启动功能请使用 `pnpm run smart-dev`

### 8. 构建和部署

```bash
# 构建项目（会自动清理测试文件）
pnpm build

# 启动生产服务器
pnpm start
```

## 🎯 使用指南

### 生成专业方案

1. **填写商家信息**
   - 店的名字、品类、位置
   - 开店时长
   - 店铺特色和老板特色
   - **智能关键词拓展**: 点击"店的特色"或"老板特色"输入框时自动触发关键词拓展

2. **选择AI模型**
   - 点击"设置"展开模型选择
   - 推荐使用DeepSeek-V3或Qwen2.5-72B

3. **生成方案**
   - 点击"生成专业方案"按钮
   - 等待AI生成完整的IP打造方案
   - 系统会自动验证生成结果，只有成功生成后才会跳转到结果页面

4. **导出和分享**
   - **智能复制**: 一键复制格式化内容，包含完整元数据
   - **图片复制**: 支持Banner图片复制到剪贴板，方便分享
   - **Word导出**: 生成专业Word文档，完整重构实现，支持Banner图片集成
   - **PDF导出**: 生成专业PDF文档，支持Banner图片集成
   - **Banner图片**: 自动生成的Banner图片会集成到导出文档中，提升视觉效果
   - **内容编辑**: 支持重新生成和修改
   - **降级处理**: 提供复制失败时的降级方案，确保用户体验

### 错误处理机制

- **生成失败保护**: 如果方案生成失败，系统会保持在表单页面，避免空白结果页
- **清晰错误提示**: 提供具体的错误信息，帮助用户理解问题
- **重试机制**: 用户可以直接在表单页面重新尝试生成

### 模型选择建议

| 场景 | 推荐模型 | 原因 |
|------|----------|------|
| 专业方案生成 | DeepSeek-V3 | 最推荐 - 推理能力强，适合复杂任务 |
| 长上下文场景 | Kimi-K2 标准版 | 长上下文支持，文档处理能力强 |
| 高要求场景 | Kimi-K2 Pro版 | 16K上下文，更强性能 |
| 复杂推理分析 | GLM-4.1V-9B-Thinking | 思维链推理，逻辑分析能力强 |
| 快速响应需求 | DeepSeek-R1-Qwen3-8B | 推理优化，响应快速 |

## 🧪 测试功能

### 模型测试页面

访问测试页面验证模型功能：
- 直接测试不同AI模型
- 验证API调用是否正常
- 比较不同模型的输出质量
- 测试Banner图片生成功能

### Markdown解析测试

使用专用测试脚本验证解析功能：
- 测试所有Markdown格式支持
- 验证标题、列表、引用块等解析
- 检查任务列表和代码块处理
- 确保表格和分隔线正确解析

### 验证脚本

```bash
# 验证所有模型的可用性
node scripts/verify-models.js

# 输出示例：
# ✅ deepseek-ai/DeepSeek-V3 - 可用
# ✅ Qwen/Qwen2.5-72B-Instruct - 可用
# ❌ some-model - 不可用: 404 Model not found

# 测试PDF转换功能
node scripts/test-pdf-conversion.js

# 测试Logo专项功能（包含性能优化验证）
node scripts/test-logo-pdf.js

# 输出示例：
# 🧪 PDF转换功能测试
# ==================
# ℹ️  检查PDF服务健康状态...
# ✅ PDF服务正常运行
# ℹ️  转换器: LibreOffice
# ℹ️  命令: libreoffice
# ℹ️  版本: LibreOffice 7.4.2.3
# 
# ℹ️  测试PDF生成功能...
# ✅ PDF生成成功
# ✅ PDF文件已保存: ./test-output/test-1642567890123.pdf
# ℹ️  文件大小: 245760 bytes
# 
# ℹ️  执行性能测试...
# ℹ️  执行第 1/3 次测试...
# ✅ 测试 1 完成: 3245ms, 245760 bytes
# ℹ️  执行第 2/3 次测试...
# ✅ 测试 2 完成: 2987ms, 246123 bytes
# ℹ️  执行第 3/3 次测试...
# ✅ 测试 3 完成: 3156ms, 245892 bytes
# 
# ℹ️  性能测试结果:
# ℹ️  成功率: 3/3 (100.0%)
# ℹ️  平均响应时间: 3129ms
# 
# ✅ 所有测试完成!
# ℹ️  生成的测试文件位于: ./test-output
# ℹ️    - test-1642567890123.pdf
# ℹ️    - performance-test-1.pdf
# ℹ️    - performance-test-2.pdf
# ℹ️    - performance-test-3.pdf

# 测试Markdown解析功能
pnpm test
# 或者直接运行
node tests/scripts/test-markdown-export.js

# 输出示例：
# 测试Markdown内容:
# # 测试标题
# 这是一个**加粗文本**和*斜体文本*的段落。
# 
# 解析结果应该包含:
# - 标题 (H1, H2)
# - 格式化文本 (加粗, 斜体)
# - 列表 (普通列表, 任务列表)
# - 引用块
# - 代码块
# - 表格
# - 分隔线

# 清理测试文件
pnpm run cleanup
```

## 🔧 扩展开发

### Word文档生成器 (`lib/export/word-generator.ts`)

项目提供了完整重构的Word文档生成器，支持专业级文档输出：

#### 核心功能特性

```typescript
// Word文档生成器完整实现
import { WordGenerator } from '@/lib/export/word-generator'

const wordGenerator = new WordGenerator()
await wordGenerator.generateWordDocument({
  content: markdownContent,
  storeName: '店铺名称',
  filename: '自定义文件名.docx',
  includeWatermark: true
})

// 核心类结构
export class WordGenerator {
  private config: StyleConfig
  
  constructor() {
    this.config = loadStyleConfig()
  }
  
  // 主要方法
  async generateWordDocument(options: WordExportOptions): Promise<void>
  private createCoverPage(storeName: string): Paragraph[]
  private createHeader(storeName: string): Header
  private createDocFooter(): Footer
  private createContentParagraphs(parsedContent: any[]): Paragraph[]
  private parseTextRuns(text: string): TextRun[]
  
  // 单位转换工具
  private convertCmToTwips(cm: number): number
  private convertPtToTwips(pt: number): number
  private convertLineSpacingToTwips(lineSpacing: number): number
}
```

#### 专业功能实现
- **完整重构**: 全新的WordGenerator类，采用现代化架构设计
- **专业封面页**: 动态标题、副标题、生成日期，完全可配置
- **页眉页脚**: 自定义页眉内容和自动页码，支持变量替换
- **内容解析**: 完整的Markdown格式支持（标题、段落、列表、粗体），自动清理转义序列和特殊字符
- **企业级样式**: 遵循企业方案Word样式模板规范，专业排版标准
- **样式配置**: 统一的样式配置系统，支持字体、间距、对齐等
- **单位转换**: 专业的单位转换工具（cm、pt、twips）
- **类型安全**: 完整的TypeScript类型定义，零类型错误

#### 文档结构
- **封面页**: 包含标题、副标题、日期信息的专业封面
- **页眉**: 自定义内容，支持店铺名称等变量替换
- **页脚**: 自动页码，居中显示，可配置开关
- **内容区**: 智能解析Markdown内容，保持格式完整性
- **结尾签名**: 品牌标识和版权信息

#### 内容解析能力
- **标题解析**: 支持H1-H6所有标题层级，自动应用样式
- **段落处理**: 智能段落分割和格式化，支持首行缩进
- **列表支持**: 自动列表项格式化和缩进处理
- **粗体文本**: 完整的粗体文本解析和TextRun生成
- **文本分割**: 智能的文本分割算法，保持格式一致性

### 工具函数库

项目提供了一套完整的工具函数，用于提升开发效率和代码复用：

#### 核心工具函数 (`lib/utils.ts`)

```typescript
// 样式类名合并工具
cn(...inputs: ClassValue[]) // 合并Tailwind CSS类名

// 关键词处理
parseKeywords(text: string) // 智能分割关键词，支持多种分隔符

// 性能优化
debounce(func: Function, delay: number) // 防抖函数，优化用户输入体验

// 内容解析
parseMarkdownToc(content: string) // 解析Markdown生成目录结构

// AI提示词生成
generatePrompt(formData, storeFeatures, ownerFeatures) // 生成标准化AI提示词
```

#### 剪贴板工具函数 (`utils/clipboard-utils.ts`)

```typescript
// 图片复制功能
async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  // 将图片URL复制到剪贴板
  // 支持跨域图片，使用Canvas处理
}

// 文本复制功能
async function copyTextToClipboard(text: string): Promise<boolean> {
  // 将文本复制到剪贴板
  // 使用现代Clipboard API
}

// 降级处理
function createTemporaryTextArea(text: string): void {
  // 创建临时文本区域供用户手动复制
  // 当自动复制失败时的降级方案
}
```

#### 使用示例

```typescript
// 内容渲染组件
import { ContentRenderer } from '@/components/content-renderer'

<ContentRenderer content={markdownContent} />

// 工具函数
import { parseKeywords, debounce, generatePrompt } from '@/lib/utils'
import { copyImageToClipboard, copyTextToClipboard } from '@/utils/clipboard-utils'

// 关键词分割
const keywords = parseKeywords("美食、川菜，火锅/烧烤 特色菜")
// 结果: ["美食", "川菜", "火锅", "烧烤", "特色菜"]

// 防抖搜索
const debouncedSearch = debounce((query) => {
  // 执行搜索逻辑
}, 500)

// 生成AI提示词
const prompt = generatePrompt(formData, storeFeatures, ownerFeatures)

// 复制图片到剪贴板
await copyImageToClipboard(bannerImage)

// 复制文本到剪贴板
await copyTextToClipboard(generatedContent)
```

### 添加新模型

1. 在 `lib/models.ts` 中添加模型配置：

```typescript
{
  id: 'new-model/model-name',
  name: '新模型名称',
  provider: 'siliconflow',
  endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
  maxTokens: 8000,
  temperature: 0.7,
  topP: 0.9,
  description: '模型描述',
  category: 'chat'
}
```

2. 更新验证脚本
3. 测试新模型可用性

### 自定义API端点

如果需要使用其他AI服务商：

1. 修改模型配置中的 `endpoint` 和 `provider`
2. 调整API调用格式（如需要）
3. 更新环境变量配置

### 关键词统计分析系统 (`hooks/use-keyword-stats.ts`)

项目提供了完整的关键词统计分析功能，通过自定义Hook实现数据收集和分析：

```typescript
// 使用关键词统计Hook
import { useKeywordStats } from '@/hooks/use-keyword-stats'

const {
  keywordStats,                    // 关键词统计数据
  updateKeywordStats,              // 更新统计数据
  getPopularCategories,            // 获取热门品类
  getPopularFeaturesForCategory,   // 获取品类相关特色
  getPopularOwnerFeatures,         // 获取热门老板特色
  isLoading,                       // 加载状态
  error                            // 错误信息
} = useKeywordStats()

// 更新关键词统计
await updateKeywordStats(formData)

// 获取热门品类（使用次数>3）
const popularCategories = getPopularCategories()

// 获取特定品类的热门特色
const categoryFeatures = getPopularFeaturesForCategory('餐饮')

// 获取热门老板特色
const ownerFeatures = getPopularOwnerFeatures()
```

#### 核心功能特性
- **数据统计**: 自动统计店铺品类、特色、老板特色的使用频率
- **智能推荐**: 基于统计数据推荐热门关键词
- **品类关联**: 建立品类与特色关键词的关联映射
- **实时更新**: 支持实时更新统计数据
- **错误处理**: 完善的错误处理和加载状态管理

#### 数据结构
```typescript
interface KeywordStats {
  storeCategories: Record<string, number>           // 品类使用统计
  storeFeatures: Record<string, number>             // 店铺特色统计
  ownerFeatures: Record<string, number>             // 老板特色统计
  categoryFeatureMapping: Record<string, Record<string, number>> // 品类特色映射
}
```

#### 技术实现
Hook内部实现了以下核心功能：

```typescript
// 自动加载统计数据
useEffect(() => {
  loadKeywordStats()
}, [])

// 解析关键词的工具函数
const parseKeywords = (text: string): string[] => {
  if (!text) return []
  return text.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
}

// 更新统计数据
const updateKeywordStats = async (formData: any) => {
  setIsLoading(true)
  setError(null)
  
  try {
    const response = await fetch('/api/keyword-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeCategory: formData.storeCategory,
        storeFeatures: formData.storeFeatures,
        ownerFeatures: formData.ownerFeatures
      }),
    })
    
    if (!response.ok) {
      throw new Error('更新关键词统计失败')
    }
    
    const updatedStats = await response.json()
    setKeywordStats(updatedStats)
  } catch (err) {
    setError(err instanceof Error ? err.message : '更新关键词统计失败')
  } finally {
    setIsLoading(false)
  }
}
```

#### 应用场景
- **表单智能提示**: 在FormSection组件中显示热门品类和特色关键词
- **用户体验优化**: 基于历史数据提供个性化推荐
- **数据分析**: 了解用户偏好和使用趋势
- **内容优化**: 根据统计数据优化AI生成内容的质量

#### FormSection组件集成
FormSection组件已完全集成关键词统计功能，提供：
- **焦点状态管理**: 新增`focusedField`状态变量，精确跟踪当前获得焦点的输入框
- **品类下拉优化**: 自动显示下拉选项，按拼音/字母顺序排序
- **品类特色关联**: 根据选择的品类显示相关特色关键词
- **老板特色推荐**: 显示最受欢迎的老板特色关键词
- **点击快速添加**: 用户可点击推荐标签快速添加到对应字段
- **实时数据更新**: 每次提交表单时自动更新统计数据
- **智能焦点处理**: 基于焦点状态控制关键词面板显示，提升交互体验

### Banner图片生成 (`hooks/use-banner-image.ts`)

项目提供了自动生成方案Banner图片的功能，通过自定义Hook实现：

```typescript
// 使用Banner图片生成Hook
import { useBannerImage } from '@/hooks/use-banner-image'

const { 
  bannerImage,           // 生成的Banner图片URL
  isGeneratingBanner,    // 是否正在生成中
  generateBannerImage    // 生成Banner图片的函数
} = useBannerImage()

// 生成Banner图片
generateBannerImage(planContent) // 传入方案内容，自动提取关键信息生成相关图片
```

Banner图片生成功能会自动从方案内容中提取关键信息，生成与方案主题相关的图片，可用于方案导出时的封面图片。

### 类型定义 (`lib/types.ts`)

项目使用TypeScript提供完整的类型安全：

```typescript
interface FormData {
  storeName: string
  storeCategory: string
  storeLocation: string
  businessDuration: string
  storeFeatures: string
  ownerName: string
  ownerFeatures: string
}

interface ExpandedKeywords {
  expanded_store_features: string[]
  expanded_boss_features: string[]
}

interface TocItem {
  id: string
  title: string
  level: number
}
```

## 📊 性能优化

- **模型选择**: 根据任务复杂度选择合适模型
- **Token控制**: 合理设置max_tokens避免超额费用
- **缓存策略**: 相同输入可考虑缓存结果
- **错误处理**: 完善的错误处理和重试机制

## 🔒 安全注意事项

- **API密钥**: 妥善保管，不要提交到代码仓库
- **输入验证**: 对用户输入进行适当验证
- **费用控制**: 监控API调用费用，设置合理限制
- **数据隐私**: 注意用户数据的处理和存储

## 🛠️ 可用脚本

项目提供了以下npm脚本来简化开发和测试流程：

### 开发脚本
```bash
# 启动开发服务器（智能启动）
pnpm dev

# 代码检查
pnpm lint
```

### 测试脚本
```bash
# 运行Markdown解析测试
pnpm test

# 验证AI模型可用性
node scripts/verify-models.js

# 项目健康检查
pnpm run health-check

# 核心功能完整性测试
node scripts/test-core-functionality.js

# 输出示例：
# 🚀 开始核心功能测试
# ==================================================
# 
# 🔍 测试1: 健康检查
# ✅ 服务器正常运行
# 
# 🔍 测试2: 方案生成API (流式响应)
# ✅ 方案生成API正常 (流式响应)
# ✅ 返回流式响应格式正确
# ✅ 流式数据格式正确
# ✅ 接收到 15 个数据块
# 
# 🔍 测试3: 关键词拓展API
# ✅ 关键词拓展API正常
# ✅ 店铺品类关键词: 5 个
# ✅ 店铺特色关键词: 8 个
# 
# 🔍 测试4: PDF导出功能
# ✅ PDF生成API正常
# ✅ 返回PDF格式正确
# 
# 🔍 测试5: Word导出功能
# ✅ Word生成API正常
# ✅ 返回Word格式正确
# 
# 🔍 测试6: 缓存状态API
# ✅ 缓存状态API正常
# 
# 📊 测试结果汇总
# ==================================================
# ✅ 通过 健康检查
# ✅ 通过 方案生成
# ✅ 通过 关键词拓展
# ✅ 通过 PDF导出
# ✅ 通过 Word导出
# ✅ 通过 缓存状态
# 
# 🎯 总体结果: 6/6 测试通过
# 🎉 所有核心功能测试通过！UI简化后功能完整性验证成功

# PDF性能测试
pnpm run pdf:test-performance
```

### 构建脚本
```bash
# 构建项目（自动清理测试文件）
pnpm build

# 启动生产服务器
pnpm start
```

### 维护脚本
```bash
# 清理测试文件和临时文件
pnpm run cleanup

# 项目健康检查
pnpm run health-check

# 检查包管理器配置
pnpm run check-pm

# 智能启动开发服务器
pnpm run smart-dev

# 设置npm到pnpm的别名
pnpm run setup-npm-alias

# 测试开发命令配置
pnpm run test-dev-config
```

### PDF导出脚本
```bash
# PDF服务安装和配置
pnpm run pdf:install         # 安装LibreOffice
pnpm run pdf:test            # 测试PDF服务
pnpm run pdf:test-logo       # 测试Logo显示（包含性能优化验证）
pnpm run pdf:test-performance # 简单性能测试（缓存效果验证）
pnpm run pdf:test-cache      # 缓存功能测试
pnpm run pdf:docker          # 启动Docker PDF服务
pnpm run pdf:docker-stop     # 停止Docker PDF服务

# 或者直接运行测试脚本
node scripts/test-pdf-conversion.js
node scripts/test-logo-pdf.js
node scripts/simple-performance-test.js
node scripts/test-cache.js
```

### 脚本说明

- **`pnpm test`**: 运行Markdown解析功能测试，验证解析器的正确性
- **`pnpm run cleanup`**: 清理tests/、temp/等测试相关文件和目录
- **`pnpm run health-check`**: 运行项目健康检查脚本，验证项目结构和规则遵循情况
- **`node scripts/test-core-functionality.js`**: 核心功能完整性测试，验证UI简化后所有核心API功能正常
- **`pnpm run check-pm`**: 检查项目包管理器配置，验证lock文件和限制设置
- **`pnpm run smart-dev`**: 智能启动开发服务器，自动检测并使用正确的包管理器
- **`pnpm run setup-npm-alias`**: 设置npm到pnpm的别名，避免误用npm命令
- **`pnpm run test-dev-config`**: 测试开发命令配置，验证dev脚本设置是否正确
- **`pnpm build`**: 构建生产版本，会自动执行prebuild钩子清理测试文件
- **prebuild钩子**: 在构建前自动运行cleanup脚本，确保生产版本不包含测试文件

## 📝 更新日志

### v1.0.58 (2025-01-19)
- ✅ 优化依赖管理，移除未使用的`@radix-ui/react-textarea`依赖
- ✅ 确认项目使用自定义Textarea组件（基于原生HTML textarea元素）
- ✅ 清理依赖列表，提升项目构建效率和包大小优化
- ✅ 更新文档以反映当前依赖状态和组件使用情况
- ✅ 保持UI组件库的一致性和最佳实践

### v1.0.57 (2025-01-19)
- ✅ 增强核心功能测试脚本，新增流式响应测试验证
- ✅ 优化方案生成API测试，支持Server-Sent Events格式验证
- ✅ 新增流式数据块统计功能，提供详细的响应分析
- ✅ 完善测试输出格式，明确标识流式响应测试状态
- ✅ 创建核心功能测试文档，详细说明UI简化MVP验证流程
- ✅ 更新测试指南，集成流式响应测试说明和故障排除
- ✅ 修复主页面组件中的未使用变量，提升代码质量
- ✅ 完善文档系统，确保测试功能与实际代码状态同步

### v1.0.56 (2025-01-19)
- ✅ 优化Logo PDF测试脚本代码质量，提升可读性和维护性
- ✅ 更新脚本注释，明确测试目标包含性能优化效果验证
- ✅ 统一代码格式，移除多余空行，符合项目代码规范
- ✅ 增强测试功能完善性，集成性能测试和错误处理优化
- ✅ 提升用户体验，保持清晰的测试流程和详细的检查建议
- ✅ 更新相关文档，反映Logo测试脚本的最新改进和功能增强

### v1.0.55 (2025-01-19)
- ✅ 新增PDF转换功能测试脚本，提供完整的PDF生成功能验证和性能测试
- ✅ 实现`scripts/test-pdf-conversion.js`，支持健康检查、功能测试、性能测试的完整流程
- ✅ 提供详细的测试输出和彩色日志，包含成功率统计和平均响应时间分析
- ✅ 集成中文内容和复杂Markdown格式的完整测试覆盖，验证实际使用场景
- ✅ 自动保存测试生成的PDF文件到`test-output`目录，便于验证输出质量
- ✅ 支持性能基准测试，提供多次测试的统计分析和响应时间监控
- ✅ 完善错误处理和超时控制，提供可靠的测试环境和故障排除建议
- ✅ 更新所有相关文档，包含PDF转换测试脚本的详细使用说明和示例输出

### v1.0.54 (2025-01-19)
- ✅ 新增PDF服务测试脚本，提供完整的PDF生成功能验证
- ✅ 添加`pnpm run pdf:test`命令，支持一键测试PDF服务状态和生成功能
- ✅ 实现健康检查、功能测试、文件验证的完整测试流程
- ✅ 提供详细的测试输出和故障排除建议，提升开发调试效率
- ✅ 集成中文内容和Markdown格式的完整测试覆盖
- ✅ 更新所有相关文档，包含PDF测试脚本的使用说明和示例

### v1.0.53 (2025-01-19)
- ✅ 新增开发命令配置测试脚本，提供完整的配置验证功能
- ✅ 添加`pnpm run test-dev-config`命令，验证dev脚本配置是否正确
- ✅ 集成开发命令测试到npm脚本系统，提供标准化的测试接口
- ✅ 完善开发工具链，确保开发环境配置的正确性和一致性
- ✅ 提升开发体验，提供自动化的配置验证和问题诊断功能

### v1.0.52 (2025-01-19)
- ✅ 新增npm别名设置脚本集成，提供便捷的命令行访问方式
- ✅ 添加`pnpm run setup-npm-alias`命令，支持一键设置npm到pnpm的别名
- ✅ 更新所有相关文档，包含npm别名设置的使用说明和效果说明
- ✅ 提升用户体验，避免误用npm命令导致的包管理器冲突问题
- ✅ 提供标准化的脚本命令接口，符合项目命令规范和最佳实践

### v1.0.51 (2025-07-19)
- ✅ 新增基于路由的复制控制功能，支持不同页面设置不同复制权限
- ✅ 扩展CopySettings配置系统，新增RouteCopyRule接口和路由规则管理
- ✅ 实现路由匹配算法，支持精确匹配和通配符匹配（如 `/admin/*`）
- ✅ 新增路由复制规则管理函数：`updateCopySettingsByRoute`、`addRouteCopyRule`、`removeRouteCopyRule`
- ✅ 预配置首页（/）允许复制，结果页（/result）禁止鼠标键盘复制但保留导出Word/PDF权限
- ✅ 完善文档系统，更新复制控制系统和配置指南文档
- ✅ 提供完整的路由复制控制使用示例和最佳实践指导
- ✅ 增强复制功能的灵活性，支持基于页面内容类型的动态权限控制

### v1.0.50 (2025-07-19)
- ✅ 新增`pnpm run health-check`脚本，运行项目健康检查
- ✅ 集成项目健康检查脚本到npm脚本系统
- ✅ 提供完整的项目结构和规则遵循情况验证
- ✅ 更新文档，添加健康检查脚本说明
- ✅ 完善开发工具链，提升项目维护效率

### v1.0.49 (2025-07-19)
- ✅ 新增npm脚本系统，简化开发和测试流程
- ✅ 添加`pnpm test`脚本，运行Markdown解析功能测试
- ✅ 添加`pnpm run cleanup`脚本，清理测试文件和临时文件
- ✅ 添加prebuild钩子，构建前自动清理测试文件
- ✅ 优化构建流程，确保生产版本不包含测试相关文件
- ✅ 更新所有文档，统一使用新的npm脚本命令
- ✅ 提升开发体验，提供标准化的脚本命令

### v1.0.48 (2025-07-19)
- ✅ 新增Markdown解析功能测试脚本，提供完整的解析功能验证
- ✅ 创建`temp/test-export.js`测试工具，支持Markdown格式验证
- ✅ 测试脚本覆盖标题、格式化文本、列表、引用块、代码块、表格、分隔线等所有格式
- ✅ 提供开发者友好的测试输出，便于调试和验证Markdown解析器功能
- ✅ 支持任务列表、嵌套引用、代码高亮等高级Markdown特性测试

### v1.0.47 (2025-07-19)
- ✅ 全面升级内容保护系统，实现完整的内容安全管理
- ✅ 新增全面内容保护功能，禁止复制、剪切、选择和右键操作
- ✅ 实现智能元素识别，自动允许表单元素的正常文本操作
- ✅ 新增键盘快捷键拦截，禁用Ctrl+C/X/V/A/S/P等复制相关快捷键
- ✅ 新增开发者工具保护，禁用F12、Ctrl+Shift+I、Ctrl+U等调试快捷键
- ✅ 实现CSS样式保护，通过样式禁用文本选择和拖拽操作
- ✅ 新增可视化保护提示，提供用户友好的操作反馈
- ✅ 实现动态保护控制，支持基于配置实时启用/禁用保护功能
- ✅ 新增保护状态管理函数，支持配置变更时的自动同步
- ✅ 完善保护功能清理机制，确保系统资源的正确释放

### v1.0.46 (2025-07-19)
- ✅ 增强复制功能配置系统，提供全面的复制控制管理
- ✅ 新增showCopyUI配置项，支持隐藏/显示复制相关UI元素
- ✅ 新增allowExportAsAlternative配置项，支持导出功能作为复制替代方案
- ✅ 完善复制设置管理函数，提供便捷的配置操作接口
- ✅ 增强复制功能的灵活性和可配置性，满足不同使用场景需求
- ✅ 提供完整的复制控制文档和使用指南

### v2.0.0 (2025-07-19) - 全面内容保护系统
- ✅ **重大更新**: 实现全面内容保护系统，彻底禁用所有复制操作
- ✅ **键盘保护**: 拦截所有复制相关快捷键（Ctrl+C/X/V/A/S/P等）
- ✅ **鼠标保护**: 禁用右键菜单、文本选择、拖拽操作
- ✅ **开发者工具**: 阻止F12、Ctrl+Shift+I、Ctrl+U等开发者工具访问
- ✅ **CSS样式保护**: 通过样式层面禁用选择和拖拽
- ✅ **智能例外**: 保持表单元素和可编辑区域的正常功能
- ✅ **动态提示**: 用户友好的操作阻止提示系统
- ✅ **全局保护**: 通过CopyPreventionProvider实现全站保护
- ✅ **配置管理**: 可视化配置界面，支持实时切换保护模式
- ✅ **完整文档**: 详细的保护系统说明和使用指南

### v1.0.46 (2025-07-19)
- ✅ 全面禁用复制功能，实现配置驱动的功能控制系统
- ✅ 创建完整的复制功能控制架构 (`config/copy-settings.ts`)
- ✅ 更新所有复制相关组件和工具函数，受配置控制
- ✅ 新增可视化配置管理器 (`components/copy-settings-manager.tsx`)
- ✅ 创建复制功能测试页面 (`app/copy-test/page.tsx`)
- ✅ 完善文档系统，新增复制控制系统说明文档
- ✅ 为未来功能扩展预留完整接口和架构基础
- ✅ 保持导出功能作为内容获取的替代方案

### v1.0.45 (2025-07-19)
- ✅ 修复Word文档生成器的导入问题，清理重复导入
- ✅ 优化import语句，移除未使用的Media导入
- ✅ 统一FormattedText类型导入，确保类型一致性
- ✅ 修复TypeScript编译错误，提升代码质量
- ✅ 完善Word导出功能的稳定性和可靠性

### v1.0.44 (2025-07-19)
- ✅ 新增环境要求规范，明确 Node.js >= 18.0.0 和 pnpm >= 8.0.0
- ✅ 指定 packageManager 为 pnpm@8.15.0，确保团队开发环境一致性
- ✅ 创建详细的环境配置指南文档 (`docs/environment-setup.md`)
- ✅ 更新所有文档中的安装和构建命令，优先推荐使用 pnpm
- ✅ 完善开发者指南，新增环境要求和配置说明
- ✅ 提供常见问题解决方案和性能优化建议

### v1.0.43 (2025-07-19)
- ✅ 增强Markdown解析器，新增引用块支持
- ✅ 添加对嵌套引用块的支持，通过quoteLevel属性表示嵌套级别
- ✅ 优化ParsedContent接口，支持更多内容类型
- ✅ 保留格式化内容支持，确保引用块内的格式正确渲染
- ✅ 提供完整的文档，说明引用块的使用方法和应用场景

### v1.0.42 (2025-07-19)
- ✅ 新增基础内容保护功能，防止未授权复制、剪切和选择
- ✅ 实现`utils/prevent-copy.ts`基础版本，提供内容保护机制
- ✅ 创建`config/copy-settings.ts`，支持灵活控制保护功能
- ✅ 智能识别输入框和文本区域，允许正常文本操作
- ✅ 与剪贴板工具函数库协同工作，实现完整的内容管理
- ✅ 提供详细文档，说明功能实现和使用方法

### v1.0.41 (2025-07-19)
- ✅ 新增Banner图片和方案文字一键复制功能
- ✅ 实现图片复制到剪贴板的完整功能
- ✅ 创建专用剪贴板工具函数库 (`utils/clipboard-utils.ts`)，支持图片和文本复制
- ✅ 优化复制按钮文本，根据是否有Banner图片动态显示"复制图文"或"复制全部"
- ✅ 实现多级降级策略，确保在各种浏览器环境下的可用性
- ✅ 完善错误处理和用户反馈，提供清晰的复制结果提示
- ✅ 添加详细文档，说明功能实现和使用方法

### v1.0.40 (2025-07-19)
- ✅ 增强Markdown解析器的文本处理能力
- ✅ 新增cleanText函数，专门处理文本中的转义序列
- ✅ 优化parseInlineFormatting函数，自动清理文本转义序列
- ✅ 改进Markdown格式解析的准确性和稳定性
- ✅ 提升Word文档导出时的文本质量和格式一致性
- ✅ 修复特殊字符和转义序列导致的格式问题

### v1.0.39 (2025-07-19)
- ✅ 增强Word文档生成器的文件命名功能
- ✅ 新增从内容中提取标题作为文件名的功能
- ✅ 自动查找第一个标题作为文件名，提升文档管理体验
- ✅ 添加文件名长度限制，超长标题自动截断并添加省略号
- ✅ 保留日期后缀，确保文件名的唯一性和时间标识
- ✅ 提升用户体验，生成更有意义的文档文件名

### v1.0.38 (2025-07-19)
- ✅ 增强关键词拓展功能，支持品类特定关键词推荐
- ✅ 新增基于店铺品类的智能关键词推荐系统
- ✅ 为餐饮、美业、教育培训、零售、服务业等品类添加专属关键词库
- ✅ 优化关键词拓展算法，提供更精准的行业特定建议
- ✅ 改进代码结构，修复额外大括号问题
- ✅ 提升用户体验，帮助用户更快获得行业相关的专业关键词

### v1.0.37 (2025-07-19)
- ✅ 增强店铺品类选择功能，实现自定义下拉菜单
- ✅ 替换原生datalist为自定义下拉菜单，提供更好的视觉体验
- ✅ 支持点击、获得焦点自动显示下拉选项，失去焦点自动隐藏
- ✅ 优化下拉菜单样式，添加悬停效果和当前选中项高亮
- ✅ 实现下拉箭头点击切换菜单显示状态
- ✅ 添加自定义滚动条样式，提升用户体验
- ✅ 合并固定类目和动态类目，去重并按拼音/字母排序

### v1.0.51 (2025-07-19)
- ✅ 增强FormSection组件焦点状态管理功能
- ✅ 新增`focusedField`状态变量，精确跟踪当前获得焦点的输入框
- ✅ 优化关键词拓展显示逻辑，基于焦点状态控制关键词面板显示
- ✅ 完善全局事件监听机制，集成下拉菜单管理和焦点处理
- ✅ 增强品类信息传递，关键词拓展API调用时包含店铺品类信息
- ✅ 提升用户体验，实现更精准的焦点状态管理和交互反馈

### v1.0.36 (2025-07-19)
- ✅ 增强自动关键词拓展触发功能
- ✅ 新增全局文档级别的输入框焦点监听
- ✅ 支持店铺特色和老板特色输入框的自动关键词拓展
- ✅ 优化用户交互体验，减少手动操作步骤
- ✅ 提升关键词拓展的可靠性和一致性

### v1.0.35 (2025-07-18)
- ✅ 优化店铺品类选择功能，提升用户体验
- ✅ 新增品类下拉选项自动显示功能，点击输入框自动展示选项
- ✅ 按拼音/字母顺序排序固定类目和动态类目，提升查找效率
- ✅ 移除热门品类标签区域，简化界面设计
- ✅ 优化品类选择的交互体验，提升用户操作便捷性

### v1.0.34 (2025-07-18)
- ✅ 更新页面头部组件，使用实际Logo图片替换图标
- ✅ 移除未使用的图标导入（Star, FileText），优化代码
- ✅ 修复Logo图片路径，使用相对路径确保正确加载
- ✅ 保持响应式设计，确保在不同设备上的良好显示
- ✅ 提升品牌一致性，使用统一的Logo图片

### v1.0.33 (2025-07-18)
- ✅ 进一步优化Word文档页眉布局，提升专业性
- ✅ 调整LOGO尺寸从20px增加到40px，提升视觉效果
- ✅ 增大页眉文字字体，从10pt增加到11pt，提升可读性
- ✅ 增加页眉与正文之间的间距，优化页面布局
- ✅ 提升整体文档的专业性和视觉平衡

### v1.0.32 (2025-07-18)
- ✅ 优化Banner图片尺寸，提升视觉效果
- ✅ 将Banner图片宽度从6.5英寸增加到7英寸，完全符合Python脚本规范
- ✅ 保持原始比例1800:600 = 3:1，高度相应调整为168像素
- ✅ 更大的Banner图片提供更好的视觉效果和品牌展示
- ✅ 确保所有文档中的Banner图片尺寸一致
- ✅ 更新注释，提高代码可读性

### v1.0.31 (2025-07-18)
- ✅ 优化Word文档页眉布局，提升专业性
- ✅ 将页眉从两行结构改为单行结构，LOGO和文字在同一行
- ✅ 采用居中对齐方式，提升视觉平衡性
- ✅ 优化LOGO尺寸和间距，提供更协调的页眉布局
- ✅ 简化页眉创建逻辑，减少冗余代码

### v1.0.29 (2025-01-18)
- ✅ 增强文档导出功能，集成Banner图片支持
- ✅ 更新ExportActions组件，支持bannerImage参数传递
- ✅ 完善Word和PDF导出器的Banner图片集成
- ✅ 优化导出文档的视觉效果和专业性
- ✅ 提升文档导出功能的完整性和用户体验

### v1.0.28 (2025-01-18)
- ✅ 优化页面头部导航组件，提升用户体验
- ✅ 新增品牌LOGO可点击返回首页功能
- ✅ 集成Word导出测试页面快速访问链接
- ✅ 优化导航布局，支持多个操作项的合理排列
- ✅ 增强页面头部的功能性和可用性
- ✅ 改进响应式设计，确保移动端和桌面端的一致体验

### v1.0.27 (2025-01-18)
- ✅ 重构Markdown解析器，提升解析准确性和性能
- ✅ 优化标题、段落、列表的解析逻辑，支持更多格式
- ✅ 增强数字列表解析支持（1. 2. 3. 格式）
- ✅ 改进列表状态管理，避免解析错误
- ✅ 统一ParsedContent接口，确保类型安全
- ✅ 简化解析算法，提升代码可读性和维护性
- ✅ 移除未使用的工具函数，精简代码结构

### v1.0.26 (2025-01-18)
- ✅ 修复Word文档生成器中的字符串转义问题
- ✅ 优化示例文本中的引号格式，确保代码质量
- ✅ 提升Word文档生成的稳定性和可靠性
- ✅ 完善企业方案样式规范示例内容的格式化

### v1.0.24 (2025-01-18)
- ✅ 完成样式配置系统的文档增强和企业规范标准化
- ✅ 为所有配置项添加详细的中文注释和说明文档
- ✅ 明确思源宋体/黑体字体系统的使用场景和规格要求
- ✅ 标准化1.5倍行距和各级标题间距配置
- ✅ 规范标准A4页边距设置（上下2.54cm，左右3.17cm）
- ✅ 明确各元素的对齐方式标准（标题居中，正文左对齐等）
- ✅ 完善企业方案Word样式模板规范的完整实现
- ✅ 提升配置系统的可读性和维护性

### v1.0.23 (2025-01-18)
- ✅ 重构主页面UI布局，优化用户体验
- ✅ 移除内容卡片中的标题栏，简化内容区域设计
- ✅ 新增独立的操作栏（Action Bar），集中管理所有操作按钮
- ✅ 优化按钮布局和响应式设计，提升移动端体验
- ✅ 统一操作界面，将标题、复制、导出等功能集中到顶部操作栏
- ✅ 改进视觉层次，突出内容展示区域
- ✅ 增强用户操作的便捷性和一致性

### v1.0.22 (2025-01-18)
- ✅ 新增自动关键词拓展触发功能
- ✅ 实现输入框焦点触发的智能关键词拓展
- ✅ 优化用户交互体验，减少手动操作步骤
- ✅ 增强FormSection组件的智能化程度
- ✅ 完善关键词拓展的自动化流程

### v1.0.21 (2025-01-18)
- ✅ 完成关键词统计分析系统的完整实现
- ✅ 新增useKeywordStats Hook，提供完整的数据统计和分析功能
- ✅ 实现智能关键词推荐系统，基于使用频率提供个性化建议
- ✅ 建立品类与特色关键词的关联映射系统
- ✅ 集成实时数据更新和状态管理功能
- ✅ 提供完善的错误处理和加载状态管理
- ✅ 支持热门品类、店铺特色、老板特色的智能推荐
- ✅ 优化FormSection组件集成，提供基于数据的用户体验

### v1.0.20 (2025-01-18)
- ✅ 优化方案生成流程的用户体验
- ✅ 修复步骤跳转逻辑，确保只有成功生成方案后才进入第二步
- ✅ 增强错误处理机制，生成失败时保持在表单页面
- ✅ 提升用户操作的可靠性和直观性
- ✅ 完善异常情况下的用户界面状态管理

### v1.0.19 (2025-01-18)
- ✅ 完成Word文档生成器的完整重构和实现
- ✅ 新增完整的Word文档生成类，支持专业级文档输出
- ✅ 实现完整的封面页、页眉页脚、内容解析功能
- ✅ 集成docx库和file-saver，提供原生Word文档支持
- ✅ 完善Markdown内容解析和格式化转换
- ✅ 实现完整的样式配置系统和单位转换工具
- ✅ 提供完整的TypeScript类型安全和错误处理
- ✅ 支持粗体文本解析、列表格式、标题层级等完整功能

### v1.0.18 (2025-01-18)
- ✅ 完成Word文档导出功能的重大升级
- ✅ 新增专业封面页设计，包含标题、副标题、日期信息
- ✅ 实现页眉页脚功能，支持页码和自定义内容
- ✅ 完善样式配置系统，支持字体、间距、对齐等全面配置
- ✅ 优化PDF导出功能，统一配置管理
- ✅ 修复所有TypeScript类型错误，提升代码质量
- ✅ 增强文档导出的专业性和可定制性

### v1.0.17 (2025-01-18)
- ✅ 修复TypeScript类型错误，提升代码质量
- ✅ 优化内容复制功能的降级处理机制
- ✅ 改进execCommand的错误处理和用户反馈
- ✅ 完善ContentRenderer组件的类型安全性
- ✅ 提升代码稳定性和维护性

### v1.0.16 (2025-01-18)
- ✅ 优化主页面UI布局，提升用户体验
- ✅ 合并Banner图片和内容区域为统一卡片设计
- ✅ 移除重复的目录按钮，简化操作界面
- ✅ 优化内容标题显示，动态展示店铺名称
- ✅ 清理未使用的图标导入（Menu），提升代码质量
- ✅ 改进代码格式和空格规范，提升可读性
- ✅ 统一卡片布局设计，增强视觉一致性

### v1.0.15 (2025-01-18)
- ✅ 重构目录导航组件，提升用户体验
- ✅ 统一所有设备的悬浮目录按钮显示
- ✅ 优化目录面板设计，采用右下角弹出式布局
- ✅ 增强目录交互体验，支持背景遮罩点击关闭
- ✅ 简化目录项显示，移除层级指示器以提升可读性
- ✅ 优化目录项样式，增加悬停效果和活跃状态指示
- ✅ 移除未使用的图标导入，清理代码质量
- ✅ 改进目录面板的响应式设计和动画效果
- ✅ 更新悬浮按钮设计，采用文字标签替代图标，提升可识别性

### v1.0.14 (2025-01-18)
- ✅ 增强内容复制功能，支持智能格式清理
- ✅ 新增复制内容的元数据信息（店铺名称、生成时间、品牌标识）
- ✅ 实现Markdown格式自动清理（移除标题标记、加粗标记等）
- ✅ 添加复制失败的降级处理机制
- ✅ 优化用户复制体验，提供完整的方案信息
- ✅ 增强错误处理，确保复制功能的稳定性

### v1.0.13 (2025-01-18)
- ✅ 修复TypeScript类型错误和编译警告
- ✅ 统一错误处理的类型安全性 (unknown -> Error类型检查)
- ✅ 替换已弃用的substr方法为substring
- ✅ 完善API路由的日志记录一致性
- ✅ 移除未使用的变量和导入，提升代码质量
- ✅ 增强代码的类型安全性和维护性

### v1.0.12 (2025-01-18)
- ✅ 增强API请求超时控制和错误处理机制
- ✅ 新增45秒超时保护，防止长时间等待
- ✅ 优化网络请求失败的错误分类和处理
- ✅ 完善AbortController信号控制机制
- ✅ 提升API调用的稳定性和用户体验
- ✅ 增强错误信息的详细程度和可读性

### v1.0.11 (2025-01-18)
- ✅ 增强方案生成过程的错误处理和用户反馈
- ✅ 新增详细的控制台日志记录，便于调试和监控
- ✅ 优化生成失败时的用户提示信息
- ✅ 完善异常情况的处理逻辑
- ✅ 提升用户体验和系统稳定性

### v1.0.10 (2025-01-18)
- ✅ 完善FormSection组件状态管理集成
- ✅ 新增setFormData、setExpandedKeywords、setIsExpandingKeywords props传递
- ✅ 优化批量输入识别功能的状态同步
- ✅ 增强关键词拓展功能的实时更新能力
- ✅ 提升组件间数据流的一致性和可靠性
- ✅ 完善表单组件与主页面的状态协调

### v1.0.9 (2025-01-18)
- ✅ 修复FormSection组件语法错误
- ✅ 优化批量输入识别功能的UI结构
- ✅ 完善表单组件的代码质量和稳定性
- ✅ 确保所有组件正常渲染和交互
- ✅ 提升用户体验和界面一致性

### v1.0.8 (2025-01-18)
- ✅ 完成多步骤用户流程实现
- ✅ 集成完整的内容渲染和目录导航功能
- ✅ 实现浮动目录导航和锚点跳转
- ✅ 优化Banner图片生成集成
- ✅ 完善状态管理和组件交互
- ✅ 移除未使用的导入和变量，提升代码质量
- ✅ 实现完整的两步骤工作流程（表单填写 → 内容生成）

### v1.0.7 (2025-01-18)
- 🔄 主页面架构准备阶段
- ✅ 重新引入核心组件导入 (ContentRenderer, TocNavigation)
- ✅ 添加完整的状态管理变量 (多步骤流程支持)
- ✅ 集成Banner图片生成和目录导航功能
- ✅ 为多步骤用户流程做好架构准备
- 📝 更新文档以反映当前开发状态

### v1.0.6 (2025-01-18)
- ✅ 修复结果页面TypeScript类型错误
- ✅ 优化流式生成和非流式生成的错误处理
- ✅ 完善Suspense组件的正确使用
- ✅ 清理未使用的导入和变量
- ✅ 提升代码质量和类型安全性

### v1.0.5 (2025-01-18)
- ✅ 完善新版页面架构 (`app/page-new.tsx`)
- ✅ 移除未使用的状态变量，优化代码质量
- ✅ 简化组件逻辑，提升性能和可维护性
- ✅ 完全基于Hook的状态管理模式
- ✅ 清理代码警告，提升开发体验

### v1.0.4 (2025-01-18)
- ✅ 创建全新的模块化页面架构 (`app/page-new.tsx`)
- ✅ 完全基于自定义Hooks的组件设计
- ✅ 极简化的页面组件，提升代码可读性
- ✅ 完善的关键词拓展和方案生成流程
- ✅ 优化的用户体验和错误处理

### v1.0.3 (2025-01-18)
- ✅ 完成主页面模块化重构
- ✅ 实现组件和Hook的完全分离
- ✅ 优化代码结构和可维护性
- ✅ 提升开发体验和代码复用率
- ✅ 完善TypeScript类型定义

### v1.0.2 (2025-01-18)
- ✅ 重构主页面为模块化架构
- ✅ 分离业务逻辑到自定义Hooks
- ✅ 新增表单数据管理Hook (`use-form-data`)
- ✅ 新增方案生成Hook (`use-plan-generation`)
- ✅ 优化组件结构和代码复用性
- ✅ 提升开发效率和维护性

### v1.0.1 (2025-01-18)
- ✅ 新增专用内容渲染组件 (`ContentRenderer`)
- ✅ 优化Markdown格式解析和显示
- ✅ 改进标题锚点生成和跳转功能
- ✅ 增强中文内容的显示效果
- ✅ 提升内容渲染性能和用户体验

### v1.0.0 (2025-01-17)
- ✅ 集成硅基流动DeepSeek-V3模型
- ✅ 支持5种精选AI模型选择
- ✅ 完整的老板IP方案生成功能
- ✅ 智能关键词拓展
- ✅ 自动Banner图片生成
- ✅ 模型验证和测试工具
- ✅ 完善的文档和使用指南

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请：
1. 查看文档 `docs/model-guide.md`
2. 运行验证脚本检查配置
3. 查看控制台错误信息
4. 提交Issue描述问题