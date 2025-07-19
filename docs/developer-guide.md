# 开发者指南

## 项目架构

### 环境要求

在开始开发之前，请确保您的开发环境满足以下要求：

#### Node.js 版本要求
- **最低版本**: Node.js >= 18.0.0
- **推荐版本**: Node.js 18.x 或 20.x LTS
- **验证命令**: `node --version`

#### 包管理器要求
- **推荐使用**: pnpm >= 8.0.0
- **指定版本**: pnpm@8.15.0 (项目锁定版本)
- **安装命令**: `npm install -g pnpm@8.15.0` 或 `curl -fsSL https://get.pnpm.io/install.sh | sh -`
- **验证命令**: `pnpm --version`

#### 为什么选择这些版本？
- **Node.js 18+**: 支持最新的ES模块特性和性能优化
- **pnpm 8.15.0**: 提供更快的安装速度和更好的依赖管理
- **版本锁定**: 确保团队开发环境的一致性

> 📖 完整的环境配置指南请参考：[环境配置指南](./environment-setup.md)

### 技术栈
- **前端框架**: Next.js 15 + React 19
- **类型系统**: TypeScript
- **样式方案**: Tailwind CSS + Radix UI
- **状态管理**: React Hooks
- **AI接口**: 硅基流动API
- **包管理器**: pnpm@8.15.0 (推荐)
- **运行环境**: Node.js >= 18.0.0

### 当前开发状态
项目主页面 (`app/page.tsx`) 已完成多步骤流程架构升级：
- ✅ 核心组件导入已就绪 (ContentRenderer, TocNavigation)
- ✅ 完整状态管理变量已配置
- ✅ Banner图片生成和目录导航功能已集成
- ✅ 多步骤用户界面已完成实现
- ✅ 浮动目录导航和锚点跳转功能已实现
- ✅ 统一卡片布局设计，合并Banner和内容区域
- ✅ 动态标题显示，提升个性化体验
- ✅ 代码质量优化，移除未使用的导入和变量
- ✅ 优化错误处理流程，确保用户体验的可靠性

### 最新更新 (v1.0.47)

#### 全面内容保护系统升级
- **全面保护**: 禁止复制、剪切、选择、右键菜单等所有内容获取方式
- **智能识别**: 自动识别可编辑元素（input、textarea、contenteditable），允许正常输入
- **键盘拦截**: 拦截Ctrl+C/X/V/A/S/P等复制相关快捷键
- **开发者工具保护**: 禁用F12、Ctrl+Shift+I、Ctrl+U等调试快捷键
- **CSS样式保护**: 通过样式禁用文本选择、拖拽等操作
- **可视化反馈**: 提供用户友好的保护提示消息
- **动态控制**: 支持基于配置实时启用/禁用保护功能
- **状态管理**: 完善的保护状态管理和清理机制

### 最新更新 (v1.0.45)

#### Word文档生成器导入优化
- **导入清理**: 修复重复导入问题，移除未使用的Media导入
- **类型统一**: 统一FormattedText类型导入，确保类型一致性
- **代码质量**: 修复TypeScript编译错误，提升代码稳定性
- **依赖优化**: 清理不必要的依赖，简化导入结构
- **功能完整**: 保持Word导出功能的完整性和可靠性

```typescript
// 优化后的导入结构
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import { parseMarkdownContent, ParsedContent, FormattedText } from './markdown-parser'
import { loadStyleConfig, StyleConfig } from './style-config'

// 移除了重复的FormattedText导入和未使用的Media导入
// 确保所有类型定义来源统一，避免类型冲突
```

### 最新更新 (v1.0.41)

#### 剪贴板工具函数库实现
- **专用工具库**: 新增`utils/clipboard-utils.ts`，提供完整的剪贴板操作功能
- **图片复制**: 实现`copyImageToClipboard`函数，支持将图片URL复制到剪贴板
- **文本复制**: 实现`copyTextToClipboard`函数，提供可靠的文本复制功能
- **降级处理**: 添加`createTemporaryTextArea`函数，在自动复制失败时提供手动复制选项
- **错误处理**: 完善的错误捕获和处理机制，确保功能稳定性
- **跨浏览器支持**: 兼容现代浏览器的Clipboard API，提供一致的用户体验

```typescript
// 图片复制到剪贴板的实现
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!imageUrl) {
    console.log('没有图片URL可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('浏览器不支持剪贴板图片API')
    }

    // 创建一个新的Image对象来加载图片
    const img = new Image()
    img.crossOrigin = 'anonymous' // 允许跨域图片
    
    // 等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })
    
    // 使用Canvas处理图片
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }
    
    ctx.drawImage(img, 0, 0)
    
    // 将Canvas转换为Blob并复制到剪贴板
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('无法创建图片Blob'))
      }, 'image/png')
    })
    
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
    
    return true
  } catch (error) {
    console.error('复制图片失败:', error)
    return false
  }
}
```

### 最新更新 (v1.0.40)

#### Markdown解析器文本处理增强
- **转义序列处理**: 新增`cleanText`函数，专门处理文本中的转义序列
- **自动清理**: `parseInlineFormatting`函数现在会自动清理文本转义序列
- **格式一致性**: 确保所有文本格式在Word文档中正确显示
- **特殊字符处理**: 智能替换表情符号和特殊字符，确保文档兼容性

```typescript
// 清理文本中的转义序列和特殊字符
function cleanText(text: string): string {
  // 替换常见的转义序列
  return text
    .replace(/\\n/g, ' ') // 将\n替换为空格
    .replace(/\\r/g, ' ') // 将\r替换为空格
    .replace(/\\t/g, ' ') // 将\t替换为空格
    .replace(/\\\\/g, '\\') // 将\\替换为\
    .replace(/\\"/g, '"') // 将\"替换为"
    .replace(/\\'/g, "'"); // 将\'替换为'
}

// 解析行内格式（加粗、斜体等）
function parseInlineFormatting(text: string): FormattedText[] {
  // 首先清理文本中的转义序列
  const cleanedText = cleanText(text);
  const result: FormattedText[] = [];
  
  // 使用清理后的文本进行格式解析
  let remainingText = cleanedText;
  // ...解析逻辑
}
```

### 最新更新 (v1.0.41)

#### 剪贴板工具函数库实现
- **专用工具库**: 新增`utils/clipboard-utils.ts`，提供完整的剪贴板操作功能
- **图片复制**: 实现`copyImageToClipboard`函数，支持将图片URL复制到剪贴板
- **文本复制**: 实现`copyTextToClipboard`函数，提供可靠的文本复制功能
- **降级处理**: 添加`createTemporaryTextArea`函数，在自动复制失败时提供手动复制选项
- **错误处理**: 完善的错误捕获和处理机制，确保功能稳定性
- **跨浏览器支持**: 兼容现代浏览器的Clipboard API，提供一致的用户体验

```typescript
// 图片复制到剪贴板的实现
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!imageUrl) {
    console.log('没有图片URL可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('浏览器不支持剪贴板图片API')
    }

    // 创建一个新的Image对象来加载图片
    const img = new Image()
    img.crossOrigin = 'anonymous' // 允许跨域图片
    
    // 等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })
    
    // 使用Canvas处理图片
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }
    
    ctx.drawImage(img, 0, 0)
    
    // 将Canvas转换为Blob并复制到剪贴板
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('无法创建图片Blob'))
      }, 'image/png')
    })
    
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
    
    return true
  } catch (error) {
    console.error('复制图片失败:', error)
    return false
  }
}
```

### 核心模块

#### 1. 主页面架构 (`app/page.tsx`)
当前主页面采用多步骤流程设计，集成以下核心功能：
- **步骤管理**: 支持多步骤用户流程 (表单填写 → 内容生成 → 结果展示)
- **内容渲染**: 集成ContentRenderer组件用于Markdown内容显示
- **目录导航**: 集成TocNavigation组件用于长内容导航
- **Banner生成**: 自动生成方案相关的Banner图片
- **状态管理**: 完整的状态变量管理多个功能模块
- **错误处理**: 优化的错误处理机制，确保用户体验可靠性
- **操作栏设计**: 独立的Action Bar集中管理所有用户操作

```typescript
// 主要状态变量
const [currentStep, setCurrentStep] = useState(1)           // 当前步骤
const [generatedContent, setGeneratedContent] = useState("") // 生成的内容
const [isGenerating, setIsGenerating] = useState(false)     // 生成状态
const [showFloatingToc, setShowFloatingToc] = useState(false) // 目录显示

// 优化的方案生成流程
const handleNextStep = async () => {
  setIsGenerating(true)
  setGeneratedContent("") // 清空之前的内容

  try {
    await generatePlanWithStream(/* 参数 */)
    
    // 只有在成功生成方案后才跳转到第二步
    setCurrentStep(2)
  } catch (error) {
    // 生成失败时保持在表单页面，不跳转
    alert(`生成方案时出错: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    setIsGenerating(false)
  }
}
```

#### 2. 内容渲染组件 (`components/content-renderer.tsx`)
- 专用Markdown内容渲染器
- 支持标题、加粗文本等格式
- 自动生成锚点ID
- 中文友好的ID生成
- 响应式样式设计

```typescript
// 使用示例
import { ContentRenderer } from '@/components/content-renderer'

<ContentRenderer content={markdownContent} />
```

#### 3. 页面头部组件 (`components/page-header.tsx`)
- 品牌标识和导航功能
- 使用真实Logo图片替代图标占位符
- 可点击的品牌LOGO，支持返回首页
- 响应式设计，适配移动端和桌面端
- 品牌标识和功能导航的统一设计

```typescript
// 使用示例
import { PageHeader } from '@/components/page-header'

<PageHeader />

// 核心功能
// 1. 品牌链接 - 点击LOGO返回首页
// 2. 真实Logo - 使用/public/logo.png作为品牌标识
// 3. 品牌标识 - 专业的品牌展示
// 4. 响应式 - 移动端优化显示

// Logo实现
<Link href="/" className="flex items-center space-x-2 sm:space-x-3">
  <img 
    src="/logo.png" 
    alt="Logo" 
    className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg"
  />
  <div>
    <h1 className="text-lg sm:text-xl font-bold text-gray-900">星光传媒</h1>
    <p className="text-xs sm:text-sm text-gray-500">方案生成器</p>
  </div>
</Link>
```

#### 4. 表单数据管理 (`hooks/use-form-data.ts`)
- 统一管理表单状态
- 实时关键词拓展
- 防抖优化用户体验
- 自动触发关键词拓展功能
- 品类选择优化，支持自动显示下拉选项

```typescript
// 使用示例
import { useFormData } from '@/hooks/use-form-data'

const {
  formData,                    // 表单数据
  setFormData,                 // 设置表单数据
  expandedKeywords,            // 拓展的关键词
  setExpandedKeywords,         // 设置拓展关键词
  isExpandingKeywords,         // 是否正在拓展
  setIsExpandingKeywords,      // 设置拓展状态
  enableKeywordExpansion,      // 是否启用关键词拓展
  setEnableKeywordExpansion,   // 设置拓展开关
  handleInputChange            // 处理输入变化
} = useFormData()

// 全局文档级别的输入框焦点监听（在FormSection组件中使用）
React.useEffect(() => {
  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.id === 'storeFeatures' || target.id === 'ownerFeatures') {
      // 当店铺特色或老板特色输入框获得焦点时，触发关键词拓展
      if (!isExpandingKeywords && setIsExpandingKeywords && setExpandedKeywords) {
        setIsExpandingKeywords(true);
        fetch('/api/expand-keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeFeatures: formData.storeFeatures || '',
            ownerFeatures: formData.ownerFeatures || ''
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('关键词拓展结果:', data);
            setExpandedKeywords(data);
            setIsExpandingKeywords(false);
          })
          .catch(error => {
            console.error('关键词拓展出错:', error);
            setIsExpandingKeywords(false);
          });
      }
    }
  };

  document.addEventListener('focusin', handleFocus);
  return () => {
    document.removeEventListener('focusin', handleFocus);
  };
}, [formData.storeFeatures, formData.ownerFeatures, isExpandingKeywords, setIsExpandingKeywords, setExpandedKeywords]);

// 品类选择优化 - 自动显示下拉选项
onFocus={() => {
  // 当输入框获得焦点时，显示下拉选项
  const datalist = document.getElementById('category-options');
  if (datalist) {
    const options = datalist.getElementsByTagName('option');
    if (options.length > 0) {
      const input = document.getElementById('storeCategory') as HTMLInputElement;
      if (input) {
        input.click();
      }
    }
  }
}}
```

#### 5. 方案生成 (`hooks/use-plan-generation.ts`)
- 处理AI方案生成逻辑
- 错误处理和重试机制
- 支持流式和非流式生成

#### 6. 目录导航 (`hooks/use-toc.ts` + `components/toc-navigation.tsx`)
- 自动解析Markdown内容生成目录
- 支持锚点跳转和当前位置追踪
- 统一的悬浮目录导航（所有设备）
- 增强的用户交互体验

```typescript
// 使用示例
import { useToc } from '@/hooks/use-toc'
import { TocNavigation } from '@/components/toc-navigation'

const { tocItems, activeSection, scrollToHeading } = useToc(content, currentStep)

<TocNavigation
  tocItems={tocItems}
  activeSection={activeSection}
  showFloatingToc={showFloatingToc}
  setShowFloatingToc={setShowFloatingToc}
  scrollToHeading={scrollToHeading}
/>
```

#### 7. Banner图片生成 (`hooks/use-banner-image.ts`)
- 自动生成方案相关的Banner图片
- 基于方案内容提取关键信息
- 支持自定义图片尺寸和质量
- 集成图片生成API

```typescript
// 使用示例
import { useBannerImage } from '@/hooks/use-banner-image'

const { bannerImage, isGeneratingBanner, generateBannerImage } = useBannerImage()

// 当方案生成完成后，自动生成相关Banner图片
useEffect(() => {
  if (planContent && !bannerImage && !isGeneratingBanner) {
    generateBannerImage(planContent)
  }
}, [planContent])
```

#### 8. 模型配置 (`lib/models.ts`)
- 集中管理AI模型配置
- 支持多种模型类型
- 灵活的模型切换

#### 9. 工具函数 (`lib/utils.ts`)
- 通用工具函数库
- Markdown解析
- 防抖和节流
- 样式类名合并

#### 10. 关键词统计分析系统 (`hooks/use-keyword-stats.ts`)
完整的关键词统计和分析功能，提供智能推荐和数据洞察：

```typescript
// 使用关键词统计Hook
import { useKeywordStats } from '@/hooks/use-keyword-stats'

const {
  keywordStats,                    // 统计数据
  updateKeywordStats,              // 更新统计
  getPopularCategories,            // 热门品类
  getPopularFeaturesForCategory,   // 品类特色
  getPopularOwnerFeatures,         // 老板特色
  isLoading,                       // 加载状态
  error                            // 错误信息
} = useKeywordStats()

// 核心功能
await updateKeywordStats(formData)           // 更新统计数据
const categories = getPopularCategories()   // 获取热门品类
const features = getPopularFeaturesForCategory('餐饮') // 品类特色
const ownerFeatures = getPopularOwnerFeatures() // 老板特色
```

##### 核心功能
- **数据收集**: 自动收集和统计用户输入的关键词
- **智能分析**: 分析关键词使用频率和关联关系
- **推荐系统**: 基于统计数据提供智能推荐
- **品类映射**: 建立品类与特色关键词的关联关系
- **实时更新**: 支持实时数据更新和状态管理

##### 数据结构
```typescript
interface KeywordStats {
  storeCategories: Record<string, number>           // 店铺品类统计
  storeFeatures: Record<string, number>             // 店铺特色统计
  ownerFeatures: Record<string, number>             // 老板特色统计
  categoryFeatureMapping: Record<string, Record<string, number>> // 品类特色映射
}
```

##### API集成
- **GET /api/keyword-stats**: 获取统计数据
- **POST /api/keyword-stats**: 更新统计数据
- **错误处理**: 完善的错误处理和重试机制
- **状态管理**: 加载状态和错误状态管理

##### 应用场景
- **表单优化**: 在FormSection中提供智能推荐
- **用户体验**: 基于历史数据优化用户输入体验
- **数据洞察**: 分析用户行为和偏好趋势
- **内容优化**: 根据统计数据优化AI生成质量

#### 10. 文档导出系统 (`lib/export/`)
完整的文档导出解决方案，支持Word和PDF格式，集成Banner图片支持：

##### Word文档生成器 (`word-generator.ts`)
- **专业封面页**: 动态标题、副标题、日期信息
- **页眉页脚**: 自定义页眉内容和自动页码
- **样式配置**: 完整的字体、间距、对齐配置系统
- **Markdown解析**: 支持标题、段落、列表等格式
- **类型安全**: 完整的TypeScript类型定义

```typescript
// 使用示例
import { WordGenerator } from '@/lib/export/word-generator'

const wordGenerator = new WordGenerator()
await wordGenerator.generateWordDocument({
  content: markdownContent,
  storeName: '店铺名称',
  bannerImage: 'https://example.com/banner.jpg', // 支持Banner图片集成
  filename: '自定义文件名.docx',
  includeWatermark: true
})
```

##### PDF文档生成器 (`pdf-generator.ts`)
- **水印支持**: 文字水印和图片水印
- **专业格式**: 标题、段落、列表的专业排版
- **分页控制**: 自动分页和页面管理
- **中文支持**: 优化的中文字体显示

```typescript
// 使用示例
import { PDFGenerator } from '@/lib/export/pdf-generator'

const pdfGenerator = new PDFGenerator()
await pdfGenerator.generatePDFDocument({
  content: markdownContent,
  storeName: '店铺名称',
  bannerImage: 'https://example.com/banner.jpg', // 支持Banner图片集成
  includeWatermark: true
})
```

##### 样式配置系统 (`style-config.ts`)
统一的样式配置管理，遵循企业方案Word样式模板规范：
- **字体配置**: 思源宋体/黑体字体系统，不同元素的专业字体设置
- **间距配置**: 标准化的标题、段落、行间距配置（1.5倍行距）
- **对齐配置**: 各种对齐方式设置（标题居中，正文左对齐等）
- **页面配置**: 标准A4页边距设置（上下2.54cm，左右3.17cm）
- **水印配置**: 水印样式和位置设置
- **企业规范**: 完全按照企业方案Word样式模板规范实现

```typescript
// 配置管理示例
import { loadStyleConfig, updateStyleConfig } from '@/lib/export/style-config'

// 加载配置
const config = loadStyleConfig()

// 企业级样式配置示例
const updatedConfig = updateStyleConfig({
  document: {
    fonts: {
      title: { 
        name: "Source Han Serif SC",  // 思源宋体
        size: 18,     // 16-18pt
        bold: true, 
        color: '#000000' 
      },
      heading1: {
        name: "Source Han Serif SC",  // 一级标题：思源宋体，16-18pt，加粗
        size: 16,
        bold: true,
        color: "#000000"
      },
      heading2: {
        name: "Source Han Serif SC",  // 二级标题：思源宋体，14pt，加粗
        size: 14,
        bold: true,
        color: "#000000"
      },
      heading3: {
        name: "Source Han Sans SC",   // 三级标题：思源黑体，12pt，加粗
        size: 12,
        bold: true,
        color: "#000000"
      },
      body: { 
        name: "Source Han Sans SC",   // 正文：思源黑体，11pt，1.5倍行距
        size: 11,
        bold: false, 
        color: '#000000' 
      },
      emphasis: {
        name: "Source Han Sans SC",   // 正文加粗关键字：同正文，11pt，加粗
        size: 11,
        bold: true,
        color: "#000000"
      }
    },
    spacing: {
      lineHeight: 1.5,              // 1.5倍行距
      heading1Spacing: {
        before: 12,                 // 一级标题：段前12pt，段后6pt
        after: 6
      },
      heading2Spacing: {
        before: 6,                  // 二级标题：段前6pt，段后4pt
        after: 4
      },
      heading3Spacing: {
        before: 3,                  // 三级标题：段前3pt，段后3pt
        after: 3
      },
      paragraphSpacing: { 
        before: 0,                  // 正文：段前0pt，段后6pt
        after: 6 
      }
    },
    indentation: {
      firstLine: 0.74               // 正文首行缩进2个字符（约0.74cm）
    },
    alignment: {
      title: "center",              // 标题居中
      subtitle: "center",           // 副标题居中
      heading1: "left",             // 一级标题左对齐
      heading2: "left",             // 二级标题左对齐
      heading3: "left",             // 三级标题左对齐
      body: "left",                 // 正文左对齐
      caption: "center",            // 图注居中
      footer: "center"              // 页脚居中
    }
  }
})
```

##### Markdown解析器 (`markdown-parser.ts`)
专用的Markdown内容解析器，经过完整重构优化：
- **结构化解析**: 将Markdown转换为结构化数据，支持标题、段落、列表、引用块
- **增强格式支持**: 支持标题(# ## ###)、无序列表(- * +)、数字列表(1. 2. 3.)、引用块(>)
- **格式化内容**: 支持加粗、斜体、代码等行内格式，并提供统一的格式化内容接口
- **嵌套引用**: 支持多级引用块，通过quoteLevel属性表示嵌套级别
- **智能状态管理**: 改进列表和引用块状态管理，避免解析冲突和错误
- **类型安全**: 统一ParsedContent接口，确保类型一致性
- **性能优化**: 简化解析算法，提升解析速度和准确性

```typescript
// 解析示例
import { parseMarkdownContent } from '@/lib/export/markdown-parser'

// 解析为结构化数据
const parsedContent = parseMarkdownContent(markdownText)

// 支持的格式示例
const markdown = `
# 一级标题
## 二级标题

这是段落内容

- 无序列表项1
- 无序列表项2

1. 数字列表项1
2. 数字列表项2

> 这是引用块
> 包含**加粗文本**

> 这是另一个引用块
>> 这是嵌套的引用块
`

// 解析结果
const result = parseMarkdownContent(markdown)
// [
//   { type: 'heading', text: '一级标题', level: 1 },
//   { type: 'heading', text: '二级标题', level: 2 },
//   { type: 'paragraph', text: '这是段落内容' },
//   { type: 'list', text: '', items: ['无序列表项1', '无序列表项2'] },
//   { type: 'list', text: '', items: ['数字列表项1', '数字列表项2'] },
//   { 
//     type: 'blockquote', 
//     text: '这是引用块\n包含加粗文本', 
//     quoteLevel: 1,
//     formattedContent: [
//       { text: '这是引用块\n包含' },
//       { text: '加粗文本', bold: true }
//     ]
//   },
//   { 
//     type: 'blockquote', 
//     text: '这是嵌套的引用块', 
//     quoteLevel: 2 
//   }
// ]
```

#### 10. 复制功能配置系统 (`config/copy-settings.ts`)
全面的复制控制管理系统，提供灵活的复制功能配置：

```typescript
// 复制功能配置接口
export interface CopySettings {
  allowCopy: boolean;                    // 是否允许复制内容
  showCopyUI: boolean;                   // 是否显示复制相关UI元素
  allowExportAsAlternative: boolean;     // 是否允许导出功能作为替代
}

// 配置管理函数
import { 
  getCopySettings,           // 获取当前设置
  updateCopySettings,        // 更新配置
  isCopyAllowed,            // 检查复制权限
  shouldShowCopyUI,         // 检查UI显示权限
  isExportAllowed,          // 检查导出权限
  resetCopySettings         // 重置为默认设置
} from '@/config/copy-settings'

// 使用示例
const handleCopy = async () => {
  if (!isCopyAllowed()) {
    alert('复制功能已被禁用')
    return
  }
  await copyToClipboard(content)
}

// 动态配置示例
updateCopySettings({
  allowCopy: true,
  showCopyUI: true,
  allowExportAsAlternative: true
})
```

##### 核心功能特性
- **全面控制**: 覆盖剪贴板API、UI显示、导出功能的完整控制
- **灵活配置**: 支持动态配置和多种使用场景
- **权限检查**: 提供便捷的权限检查函数
- **类型安全**: 完整的TypeScript类型定义
- **易于集成**: 简洁的API设计，易于在组件中使用

##### 使用场景
- **内容保护**: 严格控制内容复制，保护知识产权
- **权限管理**: 基于用户角色动态配置复制权限
- **渐进式开放**: 从严格到宽松的权限控制策略
- **用户体验**: 提供一致的复制功能体验

#### 11. 剪贴板工具函数库 (`utils/clipboard-utils.ts`)
专用的剪贴板工具函数库，提供完整的图片和文本复制功能：

```typescript
/**
 * 剪贴板工具函数
 * 提供复制图片和文本到剪贴板的功能
 */

/**
 * 将图片URL复制到剪贴板
 * @param imageUrl 图片URL
 * @returns 是否复制成功
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!imageUrl) {
    console.log('没有图片URL可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('浏览器不支持剪贴板图片API')
    }

    // 创建一个新的Image对象来加载图片
    const img = new Image()
    img.crossOrigin = 'anonymous' // 允许跨域图片
    
    // 返回一个Promise，等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })
    
    // 创建Canvas来绘制图片
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }
    
    // 在Canvas上绘制图片
    ctx.drawImage(img, 0, 0)
    
    // 将Canvas转换为Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('无法创建图片Blob'))
      }, 'image/png')
    })
    
    // 创建ClipboardItem并复制到剪贴板
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
    
    console.log('图片复制成功')
    return true
  } catch (error) {
    console.error('复制图片失败:', error)
    return false
  }
}

/**
 * 将文本复制到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) {
    console.log('没有文本可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('浏览器不支持剪贴板文本API')
    }

    await navigator.clipboard.writeText(text)
    console.log('文本复制成功')
    return true
  } catch (error) {
    console.error('复制文本失败:', error)
    return false
  }
}

/**
 * 创建一个临时文本区域供用户手动复制
 * @param text 要复制的文本
 */
export function createTemporaryTextArea(text: string): void {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '50%'
  textArea.style.top = '50%'
  textArea.style.transform = 'translate(-50%, -50%)'
  textArea.style.width = '80%'
  textArea.style.height = '60%'
  textArea.style.zIndex = '9999'
  textArea.style.backgroundColor = 'white'
  textArea.style.border = '2px solid #ccc'
  textArea.style.padding = '10px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  alert('自动复制失败，请手动选择文本并按 Ctrl+C (或 Cmd+C) 复制。点击确定后文本框将消失。')
  document.body.removeChild(textArea)
}
```

#### 12. 内容复制功能 (`app/page.tsx`)
- 智能Markdown格式清理
- 自动添加方案元数据信息
- 多层级错误处理和降级机制
- 用户友好的操作反馈
- 支持Banner图片复制到剪贴板

```typescript
// 综合复制功能：尝试复制Banner+文本，如果失败则只复制文本
const handleCopyContent = async () => {
  if (!generatedContent) {
    alert('暂无内容可复制')
    return
  }

  console.log('开始复制内容，长度:', generatedContent.length)

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard) {
      throw new Error('浏览器不支持剪贴板API')
    }

    // 先尝试复制Banner图片
    let bannerCopied = false
    if (bannerImage) {
      bannerCopied = await copyImageToClipboard(bannerImage)
    }
    
    // 准备文本内容
    const cleanContent = generatedContent
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗标记
      .replace(/\n\n+/g, '\n\n') // 规范化换行
      .trim()

    const fullContent = `${formData.storeName} - 老板IP打造方案
由星光传媒专业团队为您量身定制
生成时间: ${new Date().toLocaleString('zh-CN')}

${cleanContent}

---
本方案由星光传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构`
    
    // 复制文本内容
    const textCopied = await copyTextToClipboard(fullContent)
    
    if (bannerCopied && textCopied) {
      alert('✅ Banner图片和方案文字已复制到剪贴板！')
    } else if (textCopied) {
      alert('✅ 方案文字已复制到剪贴板！')
    } else if (bannerCopied) {
      alert('✅ 仅Banner图片复制成功，文字复制失败！')
    } else {
      throw new Error('Banner和文字都复制失败')
    }
  } catch (error) {
    console.error('复制失败:', error)

    // 降级方案：尝试复制原始内容
    try {
      await navigator.clipboard.writeText(generatedContent)
      console.log('降级复制成功')
      alert('✅ 内容已复制到剪贴板！')
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError)

      // 最后的降级方案：提示用户手动复制
      console.error('所有复制方法都失败:', fallbackError)
      createTemporaryTextArea(generatedContent)
    }
  }
}
```

## 组件设计

### ExportActions 组件

#### 功能特性
- **文档导出**: 支持Word和PDF格式的专业文档导出
- **Banner图片集成**: 自动将生成的Banner图片集成到导出文档中
- **下拉菜单**: 提供清晰的导出选项选择界面
- **状态管理**: 完整的导出状态反馈和错误处理
- **响应式设计**: 适配移动端和桌面端的不同布局需求

#### Banner图片集成
ExportActions组件现已支持Banner图片的自动集成：

```typescript
// 组件使用示例
<ExportActions
  content={generatedContent}
  storeName={formData.storeName}
  bannerImage={bannerImage}  // 自动集成Banner图片
  disabled={!generatedContent}
  className="text-xs sm:text-sm"
/>

// 核心实现
const handleWordExport = async () => {
  const wordGenerator = new WordGenerator()
  await wordGenerator.generateWordDocument({
    content,
    storeName,
    bannerImage,  // 传递Banner图片到Word生成器
    includeWatermark: true
  })
}

const handlePDFExport = async () => {
  const pdfGenerator = new PDFGenerator()
  await pdfGenerator.generatePDFDocument({
    content,
    storeName,
    bannerImage,  // 传递Banner图片到PDF生成器
    includeWatermark: true
  })
}
```

#### 核心特性
- **自动集成**: Banner图片自动从主页面传递到导出组件
- **格式支持**: Word和PDF导出都支持Banner图片集成
- **视觉增强**: 导出文档包含专业的Banner图片，提升视觉效果
- **用户体验**: 无需额外操作，Banner图片自动包含在导出文档中

#### 使用场景
- **专业方案导出**: 为客户提供包含品牌视觉的专业文档
- **营销材料**: 导出的文档可直接用作营销展示材料
- **品牌一致性**: 确保导出文档与在线展示的视觉一致性
- **完整体验**: 提供从生成到导出的完整用户体验

#### 接口更新 (v1.0.29)
ExportActions组件接口已更新，新增bannerImage参数支持：

```typescript
interface ExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null  // 新增：Banner图片URL
  disabled?: boolean
  className?: string
}
```

在主页面中的使用示例：
```typescript
<ExportActions
  content={generatedContent}
  storeName={formData.storeName || "店铺"}
  bannerImage={bannerImage}  // 传递Banner图片
  disabled={!generatedContent}
  className="text-xs sm:text-sm disabled:opacity-50"
/>
```

### FormSection 组件

#### 功能特性
- **智能表单**: 完整的商家信息填写表单
- **关键词统计**: 集成关键词统计和智能推荐功能
- **自动触发**: 输入框焦点自动触发关键词拓展
- **批量输入**: 支持批量信息识别和自动填写
- **模型选择**: 集成AI模型选择和配置功能
- **响应式设计**: 适配移动端和桌面端

#### 全局文档级别的输入框焦点监听
FormSection组件现已实现全局文档级别的输入框焦点监听和焦点状态管理：

```typescript
// 焦点状态管理
const [focusedField, setFocusedField] = useState<string | null>(null);

// 全局焦点监听实现
React.useEffect(() => {
  const handleFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.id === 'storeFeatures' || target.id === 'ownerFeatures') {
      // 当店铺特色或老板特色输入框获得焦点时，触发关键词拓展
      if (!isExpandingKeywords && setIsExpandingKeywords && setExpandedKeywords) {
        setIsExpandingKeywords(true);
        fetch('/api/expand-keywords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storeFeatures: formData.storeFeatures || '',
            ownerFeatures: formData.ownerFeatures || '',
            storeCategory: formData.storeCategory || '' // 添加店铺品类信息
          }),
        })
          .then(response => response.json())
          .then(data => {
            console.log('关键词拓展结果:', data);
            setExpandedKeywords(data);
            setIsExpandingKeywords(false);
          })
          .catch(error => {
            console.error('关键词拓展出错:', error);
            setIsExpandingKeywords(false);
          });
      }
    }
  };

  // 点击外部区域关闭下拉菜单
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const dropdown = document.getElementById('custom-category-dropdown');
    const input = document.getElementById('storeCategory');
    
    if (dropdown && !dropdown.contains(target) && input !== target) {
      dropdown.classList.add('hidden');
    }
  };

  document.addEventListener('focusin', handleFocus);
  document.addEventListener('mousedown', handleClickOutside);
  
  return () => {
    document.removeEventListener('focusin', handleFocus);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [formData.storeFeatures, formData.ownerFeatures, isExpandingKeywords, setIsExpandingKeywords, setExpandedKeywords]);

// 输入框焦点状态管理
onFocus={() => {
  setFocusedField('storeFeatures');
  // 当输入框获得焦点时，自动展示拓展关键词（无论开关状态）
  if (!isExpandingKeywords && setIsExpandingKeywords && setExpandedKeywords) {
    // 触发关键词拓展逻辑
  }
}}
onBlur={() => {
  setFocusedField(null);
}}
```

#### 核心特性
- **焦点状态管理**: 新增`focusedField`状态变量，精确跟踪当前获得焦点的输入框
- **全局事件监听**: 使用document级别的focusin事件，捕获所有输入框焦点变化
- **目标元素识别**: 通过ID精确识别店铺特色和老板特色输入框
- **条件触发**: 只在未处于拓展状态且有状态管理函数时触发API调用
- **完整错误处理**: 包含完整的异常处理和状态管理，确保稳定性
- **依赖数组优化**: 正确设置useEffect依赖数组，避免不必要的重复触发
- **下拉菜单管理**: 集成点击外部区域关闭下拉菜单的功能
- **品类信息传递**: 关键词拓展API调用时包含店铺品类信息，提升推荐准确性

#### 使用场景
- **新用户引导**: 帮助新用户快速了解如何填写店铺特色
- **内容启发**: 为用户提供更多的特色关键词选择
- **效率提升**: 减少用户思考和输入时间
- **体验优化**: 提供更流畅的表单填写体验
- **体验一致性**: 店铺特色和老板特色输入框都支持自动关键词拓展

### ContentRenderer 组件

#### 功能特性
- **Markdown解析**: 支持标题(H1-H6)和加粗文本(**text**)
- **锚点生成**: 自动为标题生成可跳转的ID
- **样式优化**: 使用Tailwind CSS提供美观排版
- **中文支持**: 正确处理中文字符的ID生成
- **性能优化**: 高效的文本解析和组件渲染

#### 实现原理
```typescript
// 核心解析逻辑
const parseMarkdownText = (text: string) => {
  // 处理加粗文本 **text**
  const boldRegex = /\*\*(.*?)\*\*/g
  // 返回React元素数组
}

// 标题处理
const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
if (headingMatch) {
  const level = headingMatch[1].length
  const title = headingMatch[2].trim()
  const id = `heading-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`
  // 生成对应级别的标题元素
}
```

#### 使用场景
- AI生成内容的格式化显示
- 方案结果页面的内容渲染
- 支持导出功能的内容预览

## 开发规范

### 代码风格
- 使用TypeScript严格模式
- 遵循React Hooks最佳实践
- 组件采用函数式编程
- 使用ESLint和Prettier

### 文件组织
```
src/
├── app/                 # Next.js App Router
├── components/          # React组件
│   ├── ui/             # 基础UI组件
│   └── content-renderer.tsx # 内容渲染组件
├── hooks/              # 自定义Hooks
├── lib/                # 工具库和配置
└── types/              # TypeScript类型定义
```

### 组件设计原则
- 单一职责原则
- 可复用性优先
- Props接口清晰
- 错误边界处理

## API设计

### 路由结构
- `/api/chat` - 通用聊天接口
- `/api/generate-plan` - 方案生成接口
- `/api/expand-keywords` - 关键词拓展接口
- `/api/keyword-stats` - 关键词统计分析接口
- `/api/images` - 图片生成接口

### 错误处理
- 统一错误响应格式
- 客户端错误边界
- 用户友好的错误提示
- 详细的错误日志

## 部署指南

### 环境变量
```env
SILICONFLOW_API_KEY=your_api_key_here
```

### 构建命令
```bash
# 构建项目（会自动清理测试文件）
pnpm build

# 启动生产服务器
pnpm start

# 清理测试文件（可选）
pnpm run cleanup
```

### 性能优化
- 代码分割和懒加载
- 图片优化
- 缓存策略
- CDN部署

## 测试策略

### 开发工具测试

#### AI模型验证脚本
```bash
# 验证所有模型的可用性
node scripts/verify-models.js

# 输出示例：
# ✅ deepseek-ai/DeepSeek-V3 - 可用
# ✅ Qwen/Qwen2.5-72B-Instruct - 可用
# ❌ some-model - 不可用: 404 Model not found
```

#### Markdown解析功能测试脚本
```bash
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
```

#### PDF服务测试脚本
```bash
# 测试PDF服务功能
pnpm run pdf:test
# 或者直接运行
node scripts/test-pdf-service.js

# 输出示例：
# 🚀 开始PDF服务测试...
# 📍 测试地址: http://localhost:3000
# 🔍 检查PDF服务健康状态...
# ✅ PDF服务正常: PDF生成服务正常
# 📄 测试PDF生成功能...
# ✅ PDF生成成功: test-output-1642567890123.pdf (245760 bytes)
# 🎉 所有测试通过!
# 📁 生成的PDF文件: temp/test-output-1642567890123.pdf
```

#### 项目健康检查脚本
```bash
# 运行项目健康检查
pnpm run health-check
# 或者直接运行
bash scripts/project-health-check.sh

# 输出示例：
# 🔍 开始项目健康检查...
# ================================
# 📁 检查目录结构...
# ✅ 目录存在: tests
# ✅ 目录存在: docs
# ✅ 目录存在: components
# 📊 健康检查报告
# ================================
# 健康分数: 85% (7/8)
# 👍 项目健康状况良好，有少量需要改进的地方
```

**测试脚本特性**:
- **全面覆盖**: 测试所有支持的Markdown格式类型
- **开发友好**: 提供清晰的测试输出和格式说明
- **易于扩展**: 可以轻松添加新的测试用例
- **项目监控**: 健康检查脚本提供完整的项目结构验证
- **调试支持**: 便于开发者验证解析器功能的正确性

### 单元测试
- 工具函数测试
- 组件渲染测试
- Hook逻辑测试
- ContentRenderer组件测试
- Markdown解析器测试

### 集成测试
- API接口测试
- 端到端流程测试
- 错误场景测试
- Markdown解析集成测试

### 性能测试
- 页面加载速度
- 内存使用情况
- API响应时间
- 内容渲染性能
- Markdown解析性能

## Word文档生成器详细实现

### 核心架构设计

Word文档生成器采用面向对象设计，提供完整的文档生成能力：

```typescript
export class WordGenerator {
  private config: StyleConfig
  
  constructor() {
    this.config = loadStyleConfig()
  }
  
  // 主要公共方法
  async generateWordDocument(options: WordExportOptions): Promise<void>
  
  // 私有方法 - 文档结构创建
  private createCoverPage(storeName: string): Paragraph[]
  private createHeader(storeName: string): Header
  private createDocFooter(): Footer
  private createContentParagraphs(parsedContent: any[]): Paragraph[]
  private createHeading(text: string, level: number): Paragraph
  private createParagraph(text: string): Paragraph
  private createList(items: string[]): Paragraph[]
  private createFooterSignature(): Paragraph
  
  // 私有方法 - 文本解析
  private parseTextRuns(text: string): TextRun[]
  
  // 私有方法 - 配置获取
  private getHeadingFontConfig(level: number)
  private getHeadingSpacingConfig(level: number)
  private getHeadingLevel(level: number): HeadingLevel
  private getAlignmentType(type: string): AlignmentType
  
  // 私有方法 - 工具函数
  private generateFilename(storeName: string): string
  private convertCmToTwips(cm: number): number
  private convertPtToTwips(pt: number): number
  private convertLineSpacingToTwips(lineSpacing: number): number
}
```

### 关键技术实现

#### 1. 封面页生成
```typescript
private createCoverPage(storeName: string): Paragraph[] {
  const coverElements: Paragraph[] = []
  
  // 主标题 - 使用配置中的标题格式
  const titleText = this.config.templates.default.titleFormat.replace('{storeName}', storeName)
  coverElements.push(new Paragraph({
    children: [new TextRun({
      text: titleText,
      size: this.config.document.fonts.title.size * 2, // docx需要双倍字号
      bold: this.config.document.fonts.title.bold,
    })],
    alignment: AlignmentType.CENTER,
    heading: HeadingLevel.TITLE,
  }))
  
  // 副标题和日期...
  return coverElements
}
```

#### 2. 粗体文本解析
```typescript
private parseTextRuns(text: string): TextRun[] {
  const runs: TextRun[] = []
  const boldRegex = /\*\*(.*?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    // 添加普通文本
    if (match.index > lastIndex) {
      runs.push(new TextRun({
        text: text.substring(lastIndex, match.index),
        size: this.config.document.fonts.body.size * 2,
      }))
    }

    // 添加粗体文本
    runs.push(new TextRun({
      text: match[1],
      size: this.config.document.fonts.emphasis.size * 2,
      bold: true,
    }))

    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    runs.push(new TextRun({
      text: text.substring(lastIndex),
      size: this.config.document.fonts.body.size * 2,
    }))
  }

  return runs.length > 0 ? runs : [new TextRun({
    text: text,
    size: this.config.document.fonts.body.size * 2,
  })]
}
```

#### 3. 单位转换系统
```typescript
// Word文档使用twips作为基本单位
// 1 inch = 1440 twips
// 1 cm = 567 twips
// 1 pt = 20 twips

private convertCmToTwips(cm: number): number {
  return Math.round(cm * 567)
}

private convertPtToTwips(pt: number): number {
  return Math.round(pt * 20)
}

private convertLineSpacingToTwips(lineSpacing: number): number {
  return Math.round(lineSpacing * 240) // 单倍行距 = 240 twips
}
```

#### 4. 页眉页脚实现
```typescript
private async createEnterpriseHeader(logoBuffer: ArrayBuffer | null): Promise<Header> {
  const headerParagraphs: Paragraph[] = []

  // 单行：LOGO和文字在同一行，居中对齐
  const headerChildren: (TextRun | ImageRun)[] = []
  if (logoBuffer) {
    headerChildren.push(
      new ImageRun({
        data: new Uint8Array(logoBuffer),
        transformation: {
          width: 20, // 缩小logo尺寸
          height: 20, // 保持比例，缩小尺寸
        },
        type: 'png',
      })
    )
  }
  
  // 添加文字，与logo在同一行
  headerChildren.push(
    new TextRun({
      text: " 由星光传媒专业团队为您量身定制", // 前面加空格，与logo分开
      font: "Source Han Sans SC", // 思源黑体
      size: 20, // 10pt * 2
    })
  )

  headerParagraphs.push(
    new Paragraph({
      children: headerChildren,
      alignment: AlignmentType.CENTER, // 整体居中对齐
    })
  )

  return new Header({
    children: headerParagraphs,
  })
}

private createDocFooter(): Footer {
  return new Footer({
    children: [new Paragraph({
      children: [new TextRun({
        children: [PageNumber.CURRENT], // 自动页码
        size: this.config.pageElements.footer.font.size * 2,
      })],
      alignment: AlignmentType.CENTER,
    })],
  })
}
```

### 使用指南

#### 基本使用
```typescript
import { WordGenerator } from '@/lib/export/word-generator'

const generator = new WordGenerator()
await generator.generateWordDocument({
  content: markdownContent,
  storeName: '店铺名称',
  filename: '自定义文件名.docx', // 可选
  includeWatermark: true // 可选
})
```

#### 自定义配置
```typescript
// 修改样式配置
import { updateStyleConfig } from '@/lib/export/style-config'

updateStyleConfig({
  document: {
    fonts: {
      title: { size: 20, bold: true, color: '#000000' },
      body: { size: 12, bold: false, color: '#333333' }
    },
    spacing: {
      paragraphSpacing: { before: 0, after: 8 }
    }
  }
})
```

### 扩展开发

#### 添加新的Markdown格式支持
```typescript
// 在parseTextRuns方法中添加新的正则表达式
const italicRegex = /\*(.*?)\*/g // 斜体支持
const codeRegex = /`(.*?)`/g     // 代码支持

// 相应地添加TextRun处理逻辑
runs.push(new TextRun({
  text: match[1],
  italics: true, // 斜体
  // 或
  font: { name: 'Courier New' } // 代码字体
}))
```

#### 自定义文档模板
```typescript
// 修改模板配置
const customTemplate = {
  titleFormat: "《{storeName}》专业方案",
  subtitle: "由您的团队专业定制",
  footer: "您的品牌标识",
  date: "制作日期：{date}"
}

// 应用自定义模板
updateStyleConfig({
  templates: {
    default: customTemplate
  }
})
```

## 最新更新 (2025-07-18)

### 页眉布局进一步优化 (v1.0.33)
完成Word文档页眉布局的进一步优化，提升专业性和视觉效果：

#### 核心更新内容
- **LOGO尺寸增大**: 将LOGO尺寸从20px增加到40px，提升视觉效果和品牌识别度
- **文字字体增大**: 页眉文字字体从10pt增加到11pt，提升可读性
- **间距增强**: 增加页眉与正文之间的间距，优化整体页面布局
- **视觉平衡**: 通过调整元素尺寸和间距，提供更平衡的视觉效果
- **专业性提升**: 更大的LOGO和更清晰的文字提升文档的专业性
- **布局优化**: 整体页眉布局更加协调，与正文内容形成良好的视觉层次

#### 技术实现改进
```typescript
// 优化前：较小的LOGO和文字
headerChildren.push(new ImageRun({
  data: new Uint8Array(logoBuffer),
  transformation: {
    width: 20, // 较小的logo尺寸
    height: 20,
  },
  type: 'png',
}))

headerChildren.push(new TextRun({ 
  text: " 由星光传媒专业团队为您量身定制",
  font: "Source Han Sans SC",
  size: 20 // 10pt * 2
}))

headerParagraphs.push(new Paragraph({
  children: headerChildren,
  alignment: AlignmentType.CENTER,
  // 没有额外间距设置
}))

// 优化后：更大的LOGO、更大的文字和增加的间距
headerChildren.push(new ImageRun({
  data: new Uint8Array(logoBuffer),
  transformation: {
    width: 40, // 增大到40px，提升视觉效果
    height: 40, // 保持比例
  },
  type: 'png',
}))

headerChildren.push(new TextRun({ 
  text: " 由星光传媒专业团队为您量身定制",
  font: "Source Han Sans SC",
  size: 22 // 增大到11pt * 2
}))

headerParagraphs.push(new Paragraph({
  children: headerChildren,
  alignment: AlignmentType.CENTER,
  spacing: {
    after: 200, // 增加页眉与正文之间的间距
  },
}))
```

#### 用户体验提升
- **视觉平衡**: 单行居中布局提供更平衡的视觉效果
- **专业性**: 简洁的页眉设计提升文档的专业性
- **一致性**: 与企业方案Word样式模板规范保持一致
- **空间利用**: 优化页眉空间利用，为内容区域留出更多空间

### Banner图片尺寸优化 (v1.0.32)
完成Banner图片尺寸的优化，提供更好的视觉效果：

#### 核心更新内容
- **尺寸标准化**: 将Banner图片宽度从6.5英寸增加到7英寸，完全符合Python脚本规范
- **比例保持**: 保持原始比例1800:600 = 3:1，高度相应调整为168像素
- **视觉增强**: 更大的Banner图片提供更好的视觉效果和品牌展示
- **格式统一**: 确保所有文档中的Banner图片尺寸一致
- **代码优化**: 更新注释，提高代码可读性

#### 技术实现改进
```typescript
// 优化前：6.5英寸宽度
transformation: {
  width: 468, // 6.5英寸 (约468像素)
  height: 156, // 保持原始比例 1800:600 = 3:1
},

// 优化后：7英寸宽度
transformation: {
  width: 504, // 7英寸 (约504像素)
  height: 168, // 保持原始比例 1800:600 = 3:1
},
```

### Banner图片集成增强 (v1.0.29)
完成文档导出功能的Banner图片集成，提供更专业的导出体验：

#### 核心更新内容
- **ExportActions组件增强**: 新增bannerImage参数支持，自动传递Banner图片到导出器
- **Word导出器集成**: WordGenerator已支持Banner图片集成，自动嵌入到文档中
- **PDF导出器集成**: PDFGenerator新增Banner图片支持，完善导出功能
- **主页面集成**: 主页面自动传递生成的Banner图片到导出组件
- **接口标准化**: 统一导出接口，确保Banner图片在所有导出格式中的一致性

#### 技术实现改进
```typescript
// ExportActions组件接口更新
interface ExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null  // 新增Banner图片支持
  disabled?: boolean
  className?: string
}

// PDF导出器接口更新
export interface PDFExportOptions {
  content: string
  storeName: string
  bannerImage?: string | null  // 新增Banner图片支持
  filename?: string
  includeWatermark?: boolean
}

// 主页面集成示例
<ExportActions
  content={generatedContent}
  storeName={formData.storeName || "店铺"}
  bannerImage={bannerImage}  // 自动传递Banner图片
  disabled={!generatedContent}
/>
```

#### 用户体验提升
- **视觉一致性**: 导出文档与在线展示保持视觉一致性
- **专业性**: 包含Banner图片的文档更具专业性和品牌识别度
- **自动化**: 无需用户额外操作，Banner图片自动集成到导出文档
- **完整性**: 提供从生成到导出的完整用户体验链条

### Markdown解析器完整重构 (v1.0.27)
完成Markdown解析器的完整重构，提升解析准确性和性能：

#### 核心重构内容
- **解析算法重构**: 完全重写`parseMarkdownContent`函数，采用更清晰的逻辑结构
- **格式支持增强**: 新增数字列表解析支持（1. 2. 3. 格式），完善无序列表支持（- * + 格式）
- **状态管理优化**: 改进列表状态管理机制，避免解析冲突和错误
- **类型安全提升**: 统一ParsedContent接口，确保所有解析结果的类型一致性
- **代码简化**: 移除未使用的工具函数（cleanMarkdownText、extractHeadings），专注核心解析功能
- **性能优化**: 简化解析算法，提升解析速度和代码可读性

#### 技术实现改进
```typescript
// 重构前的复杂逻辑
const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
const listMatch = trimmedLine.match(/^[-*+]\s+(.+)$/)

// 重构后的简化逻辑
if (line.startsWith('#')) {
  const level = line.match(/^#+/)?.[0].length || 1
  const text = line.replace(/^#+\s*/, '')
  parsed.push({ type: 'heading', text: text, level: level })
}
else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
  const text = line.replace(/^[-*+]\s*/, '')
  currentList.push(text)
}
else if (/^\d+\.\s/.test(line)) {
  const text = line.replace(/^\d+\.\s*/, '')
  currentList.push(text)
}
```

#### 接口标准化
```typescript
// 统一的ParsedContent接口
export interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'text'
  text: string        // 必需字段，确保类型一致性
  level?: number      // 标题层级（仅标题类型使用）
  items?: string[]    // 列表项（仅列表类型使用）
}
```

#### 功能增强
- **数字列表支持**: 新增对"1. 2. 3."格式数字列表的完整支持
- **列表状态管理**: 改进列表项的收集和处理逻辑，避免状态冲突
- **空内容处理**: 增强对空内容和空行的处理能力
- **错误容错**: 提升解析器的容错能力和稳定性

#### 代码质量提升
- **移除冗余**: 删除未使用的`cleanMarkdownText`和`extractHeadings`函数
- **逻辑简化**: 采用更直观的条件判断和状态管理
- **可维护性**: 提升代码的可读性和维护性
- **性能优化**: 减少正则表达式的使用，提升解析性能

### Word文档生成器代码质量优化 (v1.0.26)
完成Word文档生成器的代码质量优化，修复字符串格式问题：

#### 核心修复
- **字符串转义修复**: 修复示例文本中的引号转义问题，使用\"替代中文引号
- **代码质量提升**: 优化字符串字面量的格式，确保代码的一致性和可读性
- **稳定性增强**: 提升Word文档生成的稳定性和可靠性
- **格式化改进**: 完善企业方案样式规范示例内容的格式化

#### 技术实现
```typescript
// 修复前：使用中文引号可能导致格式问题
paragraphs.push(this.createParagraph("一级标题：适用于章节标题，如"1. IP核心定位与形象塑造""))

// 修复后：使用转义引号确保格式正确
paragraphs.push(this.createParagraph("一级标题：适用于章节标题，如\"1. IP核心定位与形象塑造\""))
```

#### 改进内容
- **示例文本优化**: 所有示例文本中的引号都使用标准转义格式
- **格式一致性**: 确保代码中字符串格式的一致性
- **可维护性**: 提升代码的可读性和维护性
- **稳定性**: 避免因字符编码问题导致的潜在错误

### 样式配置系统增强 (v1.0.24)
完成样式配置系统的文档增强和企业规范标准化：

#### 核心改进
- **企业规范标准**: 完全按照企业方案Word样式模板规范实现配置系统
- **详细注释文档**: 为所有配置项添加详细的中文注释和说明
- **字体系统规范**: 明确思源宋体/黑体的使用场景和规格要求
- **间距标准化**: 标准化的1.5倍行距和各级标题间距配置
- **页面布局规范**: 标准A4页边距设置（上下2.54cm，左右3.17cm）
- **对齐方式标准**: 明确各元素的对齐方式（标题居中，正文左对齐等）

#### 技术实现
```typescript
// 企业级样式配置标准
const defaultConfig: StyleConfig = {
  document: {
    page: {
      margins: {
        top: 2.54,    // 上边距 2.54cm
        bottom: 2.54, // 下边距 2.54cm
        left: 3.17,   // 左边距 3.17cm
        right: 3.17   // 右边距 3.17cm
      }
    },
    fonts: {
      title: {
        name: "Source Han Serif SC",  // 思源宋体
        size: 18,     // 16-18pt
        bold: true,
        color: "#000000"
      },
      heading1: {
        name: "Source Han Serif SC",  // 一级标题：思源宋体，16-18pt，加粗
        size: 16,
        bold: true,
        color: "#000000"
      },
      body: { 
        name: "Source Han Sans SC",   // 正文：思源黑体，11pt，1.5倍行距
        size: 11,
        bold: false, 
        color: '#000000' 
      }
    },
    spacing: {
      lineHeight: 1.5,              // 1.5倍行距
      heading1Spacing: {
        before: 12,                 // 一级标题：段前12pt，段后6pt
        after: 6
      },
      paragraphSpacing: { 
        before: 0,                  // 正文：段前0pt，段后6pt
        after: 6 
      }
    },
    indentation: {
      firstLine: 0.74               // 正文首行缩进2个字符（约0.74cm）
    },
    alignment: {
      title: "center",              // 标题居中
      subtitle: "center",           // 副标题居中
      heading1: "left",             // 一级标题左对齐
      body: "left",                 // 正文左对齐
      footer: "center"              // 页脚居中
    }
  }
}
```

#### 配置标准化
- **字体规范**: 思源宋体用于标题，思源黑体用于正文和界面元素
- **尺寸标准**: 标题16-18pt，正文11pt，页脚10pt等标准化尺寸
- **间距规范**: 1.5倍行距，标准化的段前段后间距设置
- **缩进标准**: 正文首行缩进2个字符（约0.74cm）
- **对齐规范**: 标题居中，正文左对齐，页脚居中等标准对齐方式
- **页面规范**: 标准A4页边距（上下2.54cm，左右3.17cm）

### 主页面UI布局重构 (v1.0.23)
完成主页面UI布局的重大重构，提供更清晰和高效的用户体验：

#### 核心改进
- **独立操作栏**: 新增Action Bar，将所有操作按钮集中到顶部独立区域
- **内容区域简化**: 移除内容卡片中的CardHeader，专注于内容展示
- **操作集中化**: 标题、修改信息、重新生成、复制、导出等功能统一管理
- **响应式优化**: 操作栏完全适配移动端和桌面端的不同布局需求
- **视觉层次优化**: 通过分离操作和内容区域，提升界面清晰度

#### 技术实现
```typescript
// 新的Action Bar设计
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
  <div className="flex-1">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formData.storeName || "店铺名称"} - 老板IP打造方案</h2>
    <p className="text-xs sm:text-sm text-gray-500 mt-1">由星光传媒专业团队为您量身定制</p>
  </div>
  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
    <Button variant="outline" size="sm" onClick={handleBackToForm}>
      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">修改信息</span>
      <span className="sm:hidden">修改</span>
    </Button>
    <Button variant="outline" size="sm" onClick={handleNextStep}>
      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">重新生成</span>
      <span className="sm:hidden">重新</span>
    </Button>
    <Button variant="outline" size="sm" onClick={handleCopyContent}>
      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">复制全部</span>
      <span className="sm:hidden">复制</span>
    </Button>
    <ExportActions content={generatedContent} storeName={formData.storeName} />
  </div>
</div>

// 简化的内容卡片结构
<Card className="overflow-hidden">
  {/* Banner Image */}
  {(bannerImage || isGeneratingBanner) && (
    <CardContent className="p-0">
      {/* Banner内容 */}
    </CardContent>
  )}

  {/* Content Section - 移除了CardHeader */}
  <CardContent>
    <ContentRenderer content={generatedContent} />
  </CardContent>
</Card>
```

#### 用户体验提升
- **操作便捷**: 所有操作按钮集中在顶部，用户操作更直观高效
- **内容突出**: 内容区域专注于展示，减少视觉干扰
- **响应式设计**: 移动端和桌面端都有优化的按钮布局和文字显示
- **视觉清晰**: 操作区域和内容区域明确分离，提升界面层次感
- **触控友好**: 按钮尺寸和间距优化，提供更好的移动端体验

### 用户体验流程优化 (v1.0.20)
完成方案生成流程的用户体验优化，提供更可靠的操作流程：

#### 核心改进
- **步骤跳转逻辑优化**: 修复步骤跳转时机，确保只有成功生成方案后才进入第二步
- **错误处理增强**: 生成失败时保持在表单页面，避免用户困惑
- **状态管理改进**: 优化异常情况下的用户界面状态管理
- **用户反馈完善**: 提供更清晰的错误提示和操作指导

#### 技术实现
```typescript
// 优化前：过早跳转步骤，可能导致空白页面
setIsGenerating(true)
setCurrentStep(2) // 立即跳转，但内容可能还未生成
setGeneratedContent("")

// 优化后：确保成功后再跳转
setIsGenerating(true)
setGeneratedContent("") // 清空之前的内容

try {
  await generatePlanWithStream(/* 参数 */)
  
  // 只有在成功生成方案后才跳转到第二步
  setCurrentStep(2)
} catch (error) {
  // 生成失败时保持在表单页面，不跳转
  alert(`生成方案时出错: ${error instanceof Error ? error.message : '未知错误'}`)
} finally {
  setIsGenerating(false)
}
```

#### 用户体验提升
- **可靠性**: 避免因网络或API错误导致的空白结果页面
- **直观性**: 用户在遇到错误时仍停留在表单页面，可以重新尝试
- **一致性**: 统一的错误处理流程，提供一致的用户体验
- **反馈性**: 清晰的错误信息，帮助用户理解问题所在

### Word文档生成器完整重构 (v1.0.19)
完成Word文档生成器的完整重构和实现，提供专业级文档生成能力：

#### 核心功能重构
- **完整重构**: 全新的WordGenerator类，采用现代化架构设计
- **专业封面页**: 自动生成包含标题、副标题、日期的专业封面
- **页眉页脚**: 支持自定义页眉内容和自动页码，完整的变量替换系统
- **样式配置系统**: 统一的样式配置管理，支持字体、间距、对齐等全面配置
- **Markdown解析**: 完整的Markdown内容解析和格式化，支持所有常用格式
- **类型安全**: 完整的TypeScript类型定义，零类型错误
- **单位转换**: 专业的单位转换工具（cm、pt、twips）

#### 技术实现
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

#### 文档结构完整实现
- **封面页**: 动态标题、副标题、生成日期，完全可配置
- **页眉**: 自定义内容，支持店铺名称变量替换
- **页脚**: 自动页码，居中显示，可配置开关
- **内容区**: 完整的Markdown格式支持（标题、段落、列表、粗体）
- **结尾签名**: 品牌标识和版权信息

#### 内容解析功能
- **标题解析**: 支持H1-H6所有标题层级
- **段落处理**: 智能段落分割和格式化
- **列表支持**: 自动列表项格式化和缩进
- **粗体文本**: 完整的粗体文本解析和TextRun生成
- **文本分割**: 智能的文本分割和格式保持

#### 配置系统增强
新的样式配置系统支持企业方案Word样式模板规范：
- **字体配置**: 思源宋体/黑体字体系统，标题、副标题、正文、强调等不同字体设置
- **间距配置**: 标准化的标题间距、段落间距、行间距等精确控制（1.5倍行距）
- **对齐配置**: 不同元素的对齐方式设置（标题居中，正文左对齐等）
- **页面配置**: 标准A4页边距、页面尺寸等页面布局设置（上下2.54cm，左右3.17cm）
- **水印配置**: 文字水印和图片水印支持
- **单位转换**: cm、pt、twips之间的精确转换
- **企业规范**: 完全按照企业方案Word样式模板规范实现

## 最新更新 (2025-01-18)

### 自动关键词拓展触发功能 (v1.0.22)
完成自动关键词拓展触发功能的开发，提供更智能的用户交互体验：

#### 核心功能实现
- **自动触发机制**: 在FormSection组件的"店的特色"输入框添加onFocus事件监听
- **智能条件判断**: 检查关键词拓展开关状态、现有拓展结果和加载状态
- **API调用优化**: 避免重复请求，提升性能和用户体验
- **错误处理完善**: 包含完整的异常处理和状态管理

#### 技术实现细节
```typescript
// FormSection组件中的自动触发实现
<Textarea
  id="storeFeatures"
  placeholder="如：地道手工汤底、回头客多"
  value={formData.storeFeatures}
  onChange={(e) => onInputChange("storeFeatures", e.target.value)}
  onFocus={() => {
    // 当输入框获得焦点且开启关键词拓展时，自动展示拓展关键词
    if (enableKeywordExpansion && !expandedKeywords && !isExpandingKeywords && setIsExpandingKeywords && setExpandedKeywords) {
      setIsExpandingKeywords(true);
      fetch('/api/expand-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeFeatures: formData.storeFeatures || '',
          ownerFeatures: formData.ownerFeatures || ''
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('关键词拓展结果:', data);
          setExpandedKeywords(data);
          setIsExpandingKeywords(false);
        })
        .catch(error => {
          console.error('关键词拓展出错:', error);
          setIsExpandingKeywords(false);
        });
    }
  }}
  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
/>
```

#### 条件判断逻辑
自动触发功能包含以下智能条件判断：
1. **enableKeywordExpansion**: 关键词拓展功能已开启
2. **!expandedKeywords**: 当前没有已拓展的关键词结果
3. **!isExpandingKeywords**: 当前没有正在进行的拓展请求
4. **setIsExpandingKeywords && setExpandedKeywords**: 状态更新函数可用

#### 用户体验优化
- **减少操作步骤**: 用户无需手动点击拓展按钮
- **智能化程度**: 系统自动识别用户意图并提供帮助
- **响应及时**: 在用户开始输入前就提供智能建议
- **避免重复**: 智能判断避免重复的API请求

#### 开发最佳实践
- **条件检查**: 确保所有必要的状态和函数都可用
- **错误处理**: 完善的try-catch机制和状态重置
- **性能优化**: 避免不必要的API调用和状态更新
- **用户反馈**: 通过加载状态提供清晰的用户反馈

### TypeScript类型错误修复 (v1.0.17)
完成代码质量提升和类型安全性改进：

#### 核心修复
- **TypeScript类型错误**: 修复ContentRenderer组件中的JSX.Element类型错误，统一使用React.ReactElement
- **execCommand优化**: 改进已弃用的execCommand方法的错误处理机制
- **降级处理增强**: 完善内容复制功能的多层降级处理
- **用户体验改进**: 提供更详细的错误反馈和操作指导

#### 技术实现
```typescript
// 修复前：使用JSX.Element（可能导致类型错误）
const parts: (string | JSX.Element)[] = []
let renderedContent: JSX.Element[] = []

// 修复后：统一使用React.ReactElement
const parts: (string | React.ReactElement)[] = []
let renderedContent: React.ReactElement[] = []

// execCommand降级处理优化
const successful = document.execCommand('copy')
if (successful) {
  console.log('传统方法复制成功')
  alert('✅ 内容已复制到剪贴板！')
} else {
  throw new Error('execCommand复制失败')
}
```

#### 代码质量提升
- **类型安全**: 确保所有TypeScript类型检查通过
- **错误处理**: 完善异常情况的处理逻辑
- **用户反馈**: 提供更清晰的操作结果提示
- **代码稳定性**: 提升整体代码的健壮性和维护性

### 主页面UI布局重构 (v1.0.23)
完成主页面UI布局的重大重构，提供更清晰和高效的用户体验：

#### 核心改进
- **独立操作栏**: 新增Action Bar，将所有操作按钮集中到顶部独立区域
- **内容区域简化**: 移除内容卡片中的CardHeader，专注于内容展示
- **操作集中化**: 标题、修改信息、重新生成、复制、导出等功能统一管理
- **响应式优化**: 操作栏完全适配移动端和桌面端的不同布局需求
- **视觉层次优化**: 通过分离操作和内容区域，提升界面清晰度

#### 技术实现
```typescript
// 新的Action Bar设计
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
  <div className="flex-1">
    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formData.storeName || "店铺名称"} - 老板IP打造方案</h2>
    <p className="text-xs sm:text-sm text-gray-500 mt-1">由星光传媒专业团队为您量身定制</p>
  </div>
  <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
    <Button variant="outline" size="sm" onClick={handleBackToForm}>
      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">修改信息</span>
      <span className="sm:hidden">修改</span>
    </Button>
    <Button variant="outline" size="sm" onClick={handleNextStep}>
      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">重新生成</span>
      <span className="sm:hidden">重新</span>
    </Button>
    <Button variant="outline" size="sm" onClick={handleCopyContent}>
      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      <span className="hidden sm:inline">复制全部</span>
      <span className="sm:hidden">复制</span>
    </Button>
    <ExportActions content={generatedContent} storeName={formData.storeName} />
  </div>
</div>

// 简化的内容卡片结构
<Card className="overflow-hidden">
  {/* Banner Image */}
  {(bannerImage || isGeneratingBanner) && (
    <CardContent className="p-0">
      {/* Banner内容 */}
    </CardContent>
  )}

  {/* Content Section - 移除了CardHeader */}
  <CardContent>
    <ContentRenderer content={generatedContent} />
  </CardContent>
</Card>
```

#### 用户体验提升
- **操作便捷**: 所有操作按钮集中在顶部，用户操作更直观高效
- **内容突出**: 内容区域专注于展示，减少视觉干扰
- **响应式设计**: 移动端和桌面端都有优化的按钮布局和文字显示
- **视觉清晰**: 操作区域和内容区域明确分离，提升界面层次感
- **触控友好**: 按钮尺寸和间距优化，提供更好的移动端体验

### 主页面UI布局优化 (v1.0.16)
完成主页面UI布局的重大优化，提供更统一和简洁的用户体验：

#### 核心改进
- **统一卡片设计**: 将Banner图片和内容区域合并为单一卡片，提升视觉一致性
- **简化操作界面**: 移除重复的目录按钮，避免用户困惑
- **动态标题显示**: 内容标题动态展示店铺名称，提升个性化体验
- **代码质量提升**: 清理未使用的图标导入，改进代码格式规范

#### 用户体验提升
- **视觉统一**: Banner和内容在同一卡片中，提供更好的视觉连贯性
- **操作简化**: 移除重复按钮，用户操作更直观
- **个性化**: 标题动态显示店铺名称，增强用户归属感
- **代码优化**: 清理冗余代码，提升维护性和性能

### 目录导航组件重构 (v1.0.15)
完成TocNavigation组件的全面重构，提供更优秀的用户体验：

#### 核心改进
- **统一设备支持**: 移除桌面端固定目录，所有设备统一使用悬浮目录按钮
- **优化布局设计**: 目录面板改为右下角弹出式，避免遮挡主要内容
- **增强交互体验**: 支持背景遮罩点击关闭，提供更直观的操作方式
- **简化显示**: 移除层级指示器，通过缩进展示层级关系，提升可读性
- **样式优化**: 改进目录项的悬停效果和活跃状态指示

#### 技术实现
```typescript
// 新的目录导航组件结构
<TocNavigation
  tocItems={tocItems}              // 目录项数组
  activeSection={activeSection}    // 当前活跃章节
  showFloatingToc={showFloatingToc} // 显示状态控制
  setShowFloatingToc={setShowFloatingToc} // 状态更新函数
  scrollToHeading={scrollToHeading} // 跳转函数
/>

// 悬浮按钮设计 - 文字标签替代图标
<Button
  onClick={() => setShowFloatingToc(!showFloatingToc)}
  size="sm"
  className={`rounded-lg px-4 py-2 h-auto shadow-lg transition-all duration-200 ${
    showFloatingToc 
      ? "bg-gray-600 hover:bg-gray-700" 
      : "bg-purple-600 hover:bg-purple-700"
  }`}
>
  <span className="text-white font-medium">目录</span>
</Button>

// 目录项简化显示
<div className="flex items-center">
  <span className="truncate">{item.title}</span>
</div>
// 层级通过paddingLeft缩进体现：
// style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
```

#### 用户体验提升
- **响应式设计**: 适配所有屏幕尺寸，提供一致的使用体验
- **动画效果**: 平滑的弹出动画和过渡效果
- **操作便捷**: 点击标题自动跳转并关闭面板
- **视觉反馈**: 清晰的活跃状态和悬停效果
- **简洁显示**: 通过缩进而非符号显示层级，提升内容可读性
- **按钮优化**: 悬浮按钮采用文字标签设计，提升可识别性和易用性

### 智能内容复制功能增强 (v1.0.14)
实现了智能内容复制功能，提供完整的格式清理和元数据支持：

#### 核心功能
- **格式清理**: 自动移除Markdown格式标记（标题#、加粗**等）
- **元数据添加**: 包含店铺名称、生成时间、品牌标识等信息
- **降级处理**: 复制失败时自动尝试原始内容复制
- **用户体验**: 提供清晰的成功/失败反馈

#### 技术实现
```typescript
const handleCopyContent = async () => {
  // 1. 清理Markdown格式
  const cleanContent = generatedContent
    .replace(/#{1,6}\s+/g, '')           // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1')     // 移除加粗标记
    .replace(/\n\n+/g, '\n\n')           // 规范化换行
    .trim()

  // 2. 添加元数据信息
  const fullContent = `${formData.storeName} - 老板IP打造方案
由星光传媒专业团队为您量身定制
生成时间: ${new Date().toLocaleString('zh-CN')}

${cleanContent}

---
本方案由星光传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构`

  // 3. 执行复制操作
  await navigator.clipboard.writeText(fullContent)
}
```

#### 错误处理机制
- **主要复制**: 尝试复制格式化后的完整内容
- **降级复制**: 失败时尝试复制原始生成内容
- **用户反馈**: 提供明确的成功/失败提示信息

### FormSection组件修复 (v1.0.9)
完成FormSection组件的语法错误修复和优化：

#### 修复内容
- **语法错误修复**: 修复JSX语法错误，确保组件正常渲染
- **UI结构优化**: 优化批量输入识别功能的HTML结构
- **代码质量提升**: 清理无效的HTML标签和属性
- **组件稳定性**: 确保所有表单功能正常工作

#### 技术细节
- 修复了`<Card>`标签的错误使用，改为正确的`<div>`结构
- 修正了CSS类名的拼写错误
- 优化了组件的嵌套结构和样式应用
- 确保TypeScript类型检查通过

### 多步骤流程完整实现 (v1.0.8)
主页面现已完成多步骤用户流程的完整实现：

#### 核心功能集成
- **步骤管理**: 完整的两步骤工作流程（表单填写 → 内容生成）
- **内容渲染**: ContentRenderer组件完全集成，支持Markdown格式化
- **目录导航**: TocNavigation组件完全集成，支持浮动目录和锚点跳转
- **Banner生成**: 自动生成方案相关的Banner图片
- **状态协调**: 多个Hook和组件的完美协调工作

#### 代码质量提升
- 移除所有未使用的导入和变量
- 优化状态管理逻辑
- 完善TypeScript类型检查
- 提升组件渲染性能

#### 用户体验优化
- 响应式设计完全适配移动端和桌面端
- 直观的进度步骤显示
- 实时的加载状态反馈
- 便捷的操作按钮（复制、导出、重新生成）

## 扩展开发

### 添加新的Markdown格式支持

如需扩展ContentRenderer支持更多Markdown格式，可以在`parseMarkdownText`函数中添加新的正则表达式匹配：

```typescript
// 示例：添加斜体文本支持
const italicRegex = /\*(.*?)\*/g
// 添加相应的处理逻辑
```

### 自定义样式主题

可以通过修改Tailwind CSS类名来自定义内容渲染的样式：

```typescript
// 在ContentRenderer中修改className
className: `scroll-mt-20 font-bold text-gray-900 ${
  level === 1 ? 'text-3xl mb-6 mt-8' :
  level === 2 ? 'text-2xl mb-4 mt-6' :
  // 自定义样式
}`
```

### 内容复制功能开发指南

#### 功能特性
- **智能格式清理**: 自动移除Markdown语法标记
- **元数据增强**: 添加店铺信息、生成时间、品牌标识
- **多层降级**: 确保复制功能的高可用性
- **用户反馈**: 提供明确的操作结果提示

#### 扩展开发
如需自定义复制内容格式，可以修改以下部分：

```typescript
// 自定义格式清理规则
const cleanContent = generatedContent
  .replace(/#{1,6}\s+/g, '')           // 移除标题标记
  .replace(/\*\*(.*?)\*\*/g, '$1')     // 移除加粗标记
  .replace(/\*(.*?)\*/g, '$1')         // 移除斜体标记（可选）
  .replace(/\n\n+/g, '\n\n')           // 规范化换行
  .trim()

// 自定义元数据模板
const customTemplate = `
自定义标题: ${formData.storeName}
生成时间: ${new Date().toLocaleString()}
自定义信息: 您的品牌信息

${cleanContent}

自定义结尾信息
`
```

#### 错误处理最佳实践
1. **检查API可用性**: 验证`navigator.clipboard`是否存在
2. **多层降级**: 主要方法失败时尝试备用方案
3. **用户反馈**: 提供清晰的成功/失败提示
4. **日志记录**: 记录错误信息便于调试

### 性能优化建议

1. **内容缓存**: 对于相同的内容，可以考虑缓存解析结果
2. **虚拟滚动**: 对于超长内容，可以实现虚拟滚动
3. **懒加载**: 大型内容可以分段加载和渲染
4. **内存管理**: 及时清理不需要的DOM元素和事件监听器
5. **复制优化**: 对于大量内容，可以考虑分块复制或压缩
## 最
新更新 (2025-07-18)

### 品类选择优化 (v1.0.35)
完成店铺品类选择功能的优化，提升用户体验：

#### 核心更新内容
- **自动显示下拉选项**: 当用户点击品类输入框时，自动触发下拉选项显示
- **按拼音排序**: 固定类目和动态类目都按拼音/字母顺序排序，提升查找效率
- **移除热门标签**: 移除热门品类标签区域，简化界面设计
- **交互优化**: 提升品类选择的交互体验，减少用户操作步骤
- **界面简化**: 更清晰的界面布局，专注于核心功能

#### 技术实现
```typescript
// 自动显示下拉选项
onFocus={() => {
  // 当输入框获得焦点时，显示下拉选项
  const datalist = document.getElementById('category-options');
  if (datalist) {
    const options = datalist.getElementsByTagName('option');
    if (options.length > 0) {
      const input = document.getElementById('storeCategory') as HTMLInputElement;
      if (input) {
        input.click();
      }
    }
  }
}}

// 按拼音/字母顺序排序动态类目
{getPopularCategories()
  .sort((a, b) => {
    // 简单按字符串排序，实际项目中可能需要更复杂的拼音排序
    return a.localeCompare(b, 'zh-CN');
  })
  .map((category) => (
    <option key={category} value={category} />
  ))}
```

#### 用户体验提升
- **查找效率**: 按拼音/字母顺序排序，用户可以更快找到所需品类
- **操作便捷**: 点击输入框自动显示选项，减少用户操作步骤
- **界面简洁**: 移除热门品类标签区域，减少视觉干扰
- **一致性**: 固定类目和动态类目采用统一的排序方式
- **专注性**: 用户可以更专注于输入和选择，而非在多个区域间切换注意力

#### 代码优化
- **移除冗余**: 删除热门品类标签区域的相关代码，简化组件结构
- **排序逻辑**: 添加简单的字符串排序逻辑，支持中文拼音排序
- **交互增强**: 添加onFocus事件处理，提升交互体验
- **注释完善**: 添加清晰的代码注释，提高可维护性
- **布局优化**: 优化输入框和下拉选项的布局结构

#### 实现细节
1. **自动显示下拉选项**:
   - 监听输入框的onFocus事件
   - 获取datalist元素和其中的option元素
   - 如果存在选项，则模拟点击输入框，触发下拉列表显示

2. **按拼音排序**:
   - 对固定类目进行手动排序（餐饮、服务业、教育培训、美业、零售、其他）
   - 对动态类目使用localeCompare方法进行排序，支持中文拼音排序
   - 使用'zh-CN'作为排序区域设置，确保正确的中文排序

3. **移除热门标签区域**:
   - 完全移除热门品类标签相关代码，包括标题、容器和Badge组件
   - 简化组件结构，减少不必要的DOM元素
   - 提升页面加载性能和渲染效率