# Word文档导出实现指南

## 概述

本项目提供了完整的Word文档导出功能，基于`docx`库实现专业级文档生成。Word文档生成器经过完整重构，支持Banner图片集成、企业级样式配置和丰富的格式化内容。

## 核心架构

### WordGenerator类结构

```typescript
export class WordGenerator {
  private logoBuffer: ArrayBuffer | null = null

  constructor() {
    // 配置按需加载
  }

  // 主要公共方法
  async generateWordDocument(options: WordExportOptions): Promise<void>

  // 私有方法 - 图片处理
  private async loadLogo(): Promise<ArrayBuffer | null>
  private async loadBannerImage(bannerUrl: string): Promise<ArrayBuffer | null>

  // 私有方法 - 文档结构创建
  private async createBannerSection(bannerBuffer: ArrayBuffer | null): Promise<Paragraph[]>
  private createEnterpriseCoverPage(): Paragraph[]
  private async createEnterpriseHeader(logoBuffer: ArrayBuffer | null): Promise<Header>
  private async createEnterpriseFooter(logoBuffer: ArrayBuffer | null): Promise<Footer>
  private createEnterpriseContentStructure(parsedContent: ParsedContent[]): Paragraph[]

  // 私有方法 - 格式化内容处理
  private createFormattedHeading(formattedContent: FormattedText[], level: number): Paragraph
  private createFormattedParagraph(formattedContent: FormattedText[]): Paragraph
  private createFormattedBlockquote(formattedContent: FormattedText[], level: number): Paragraph
  private createBlockquote(text: string, level: number): Paragraph

  // 私有方法 - 企业样式
  private createEnterpriseHeading(text: string, level: number): Paragraph
  private createEnterpriseParagraph(text: string): Paragraph
  private createEnterpriseStyleGuide(): Paragraph[]

  // 私有方法 - 工具函数
  private cleanTextForWord(text: string): string
  private getHeadingLevel(level: number): HeadingLevel
  private generateEnterpriseFilename(content: string): string
  private convertCmToTwips(cm: number): number
  private convertPtToTwips(pt: number): number
  private convertLineSpacingToTwips(lineSpacing: number): number
}
```

## 导入优化 (v1.0.45)

### 修复的问题

1. **重复导入清理**: 移除了重复的`FormattedText`导入声明
2. **未使用导入移除**: 移除了未使用的`Media`导入
3. **类型统一**: 确保所有类型定义来源统一，避免类型冲突

### 优化后的导入结构

```typescript
// 清理后的导入
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import { parseMarkdownContent, ParsedContent, FormattedText } from './markdown-parser'
import { loadStyleConfig, StyleConfig } from './style-config'

// 之前的问题导入（已修复）
// import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, ImageRun, Media } from 'docx' // Media未使用
// import { parseMarkdownContent, ParsedContent } from './markdown-parser'
// import { FormattedText } from './markdown-parser' // 重复导入1
// import { FormattedText } from './markdown-parser' // 重复导入2
```

## 核心功能特性

### 1. Banner图片集成

```typescript
// Banner图片处理
private async createBannerSection(bannerBuffer: ArrayBuffer | null): Promise<Paragraph[]> {
  if (bannerBuffer) {
    try {
      return [
        new Paragraph({
          children: [
            new ImageRun({
              data: new Uint8Array(bannerBuffer),
              transformation: {
                width: 504, // 7英寸 (约504像素)
                height: 168, // 保持原始比例 1800:600 = 3:1
              },
              type: 'jpg',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: this.convertPtToTwips(6),
          },
        })
      ]
    } catch (error) {
      console.warn('无法插入banner图片:', error)
    }
  }

  // 占位符
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: "[首页Banner图位置 - 尺寸1800x600px，JPG格式，居中对齐]",
          size: 20,
          color: "#999999",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  ]
}
```

### 2. 企业级页眉页脚

```typescript
// 页眉：LOGO和文字在同一行，居中对齐
private async createEnterpriseHeader(logoBuffer: ArrayBuffer | null): Promise<Header> {
  const headerChildren: (TextRun | ImageRun)[] = []
  
  if (logoBuffer) {
    headerChildren.push(
      new ImageRun({
        data: new Uint8Array(logoBuffer),
        transformation: {
          width: 60,
          height: 60,
        },
        type: 'png',
      })
    )
  }
  
  headerChildren.push(
    new TextRun({
      text: "  由星光传媒专业团队为您量身定制",
      font: "Source Han Sans SC",
      size: 24,
    })
  )

  return new Header({
    children: [
      new Paragraph({
        children: headerChildren,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        border: {
          bottom: {
            color: "#DDDDDD",
            size: 1,
            space: 4,
            style: "single",
          }
        },
      })
    ],
  })
}

// 页脚：只显示页码（居中）
private async createEnterpriseFooter(): Promise<Footer> {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            font: "Source Han Sans SC",
            size: 20,
          })
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
  })
}
```

### 3. 格式化内容处理

```typescript
// 创建格式化的标题
private createFormattedHeading(formattedContent: FormattedText[], level: number): Paragraph {
  let fontSize: number, fontName: string, spacingBefore: number, spacingAfter: number

  switch (level) {
    case 1:
      fontSize = 32 // 16pt * 2
      fontName = "Source Han Serif SC"
      spacingBefore = 12
      spacingAfter = 6
      break
    case 2:
      fontSize = 28 // 14pt * 2
      fontName = "Source Han Serif SC"
      spacingBefore = 6
      spacingAfter = 4
      break
    case 3:
      fontSize = 24 // 12pt * 2
      fontName = "Source Han Sans SC"
      spacingBefore = 3
      spacingAfter = 3
      break
    default:
      fontSize = 32
      fontName = "Source Han Serif SC"
      spacingBefore = 12
      spacingAfter = 6
  }
  
  const textRuns = formattedContent.map(part => {
    const cleanedText = this.cleanTextForWord(part.text)
    
    return new TextRun({
      text: cleanedText,
      font: fontName,
      size: fontSize,
      bold: true,
      italics: part.italic || false,
    })
  })
  
  return new Paragraph({
    children: textRuns,
    heading: this.getHeadingLevel(level),
    spacing: {
      before: this.convertPtToTwips(spacingBefore),
      after: this.convertPtToTwips(spacingAfter),
      line: this.convertLineSpacingToTwips(1.5),
    },
    alignment: AlignmentType.LEFT,
  })
}
```

### 4. 文本清理功能

```typescript
// 清理文本中的转义序列和特殊字符
private cleanTextForWord(text: string): string {
  return text
    .replace(/\\n/g, ' ')     // 将\n替换为空格
    .replace(/\\r/g, ' ')     // 将\r替换为空格
    .replace(/\\t/g, ' ')     // 将\t替换为空格
    .replace(/\\\\/g, '\\')   // 将\\替换为\
    .replace(/\\"/g, '"')     // 将\"替换为"
    .replace(/\\'/g, "'")     // 将\'替换为'
    // 处理常见的表情符号
    .replace(/⚠️/g, '警告')
    .replace(/✅/g, '完成')
    .replace(/❌/g, '错误')
    .replace(/📝/g, '笔记')
    .replace(/📌/g, '重点')
    .replace(/🔍/g, '搜索')
    .replace(/🚀/g, '启动')
    .replace(/💡/g, '提示')
    .replace(/⭐/g, '星级')
    .replace(/👍/g, '赞同')
}
```

## 企业样式规范

### 字体配置

- **一级标题**: 思源宋体，16-18pt，加粗，段前12pt，段后6pt
- **二级标题**: 思源宋体，14pt，加粗，段前6pt，段后4pt
- **三级标题**: 思源黑体，12pt，加粗，段前3pt，段后3pt
- **正文内容**: 思源黑体，11pt，1.5倍行距，首行缩进2个字符
- **正文加粗**: 同正文，11pt，加粗

### 页面设置

- **纸张大小**: A4（21 x 29.7 cm）
- **页边距**: 上2.54cm，下2.54cm，左3.17cm，右3.17cm
- **页眉距离**: 1.5cm
- **页脚距离**: 1.75cm

### 段落格式

- **正文首行缩进**: 2个字符（约0.74cm）
- **段前距离**: 0pt
- **段后距离**: 6pt
- **行距**: 1.5倍行距
- **对齐方式**: 正文左对齐，标题左对齐

## 使用示例

### 基本使用

```typescript
import { WordGenerator } from '@/lib/export/word-generator'

const wordGenerator = new WordGenerator()

await wordGenerator.generateWordDocument({
  content: markdownContent,
  storeName: '店铺名称',
  bannerImage: 'https://example.com/banner.jpg',
  filename: '自定义文件名.docx',
  includeWatermark: true
})
```

### 在组件中使用

```typescript
// ExportActions组件中的使用
const handleWordExport = async () => {
  try {
    setIsExporting(true)
    
    const wordGenerator = new WordGenerator()
    await wordGenerator.generateWordDocument({
      content,
      storeName,
      bannerImage,
      includeWatermark: true
    })
    
    toast.success('Word文档导出成功！')
  } catch (error) {
    console.error('Word导出失败:', error)
    toast.error('Word文档导出失败，请重试')
  } finally {
    setIsExporting(false)
  }
}
```

## 依赖关系

### 核心依赖

```json
{
  "dependencies": {
    "docx": "^9.5.1",           // Word文档生成
    "file-saver": "^2.0.5"      // 文件下载
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"  // TypeScript类型定义
  }
}
```

### 内部依赖

- `./markdown-parser`: Markdown内容解析器
- `./style-config`: 样式配置管理器

## 错误处理

### 图片加载错误

```typescript
try {
  const response = await fetch(bannerUrl)
  if (response.ok) {
    return await response.arrayBuffer()
  }
} catch (error) {
  console.warn('无法加载banner图片:', error)
}
return null
```

### 文档生成错误

```typescript
try {
  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  })
  saveAs(blob, finalFilename)
} catch (error) {
  console.error('Word文档生成失败:', error)
  throw new Error('Word文档生成失败，请重试')
}
```

## 性能优化

### 图片缓存

```typescript
private logoBuffer: ArrayBuffer | null = null

private async loadLogo(): Promise<ArrayBuffer | null> {
  if (this.logoBuffer) {
    return this.logoBuffer  // 使用缓存
  }
  
  // 加载并缓存
  const response = await fetch('/logo.png')
  if (response.ok) {
    this.logoBuffer = await response.arrayBuffer()
    return this.logoBuffer
  }
  
  return null
}
```

### 单位转换优化

```typescript
// 预计算常用转换值
private convertCmToTwips(cm: number): number {
  return Math.round(cm * 567) // 1cm = 567 twips
}

private convertPtToTwips(pt: number): number {
  return Math.round(pt * 20) // 1pt = 20 twips
}

private convertLineSpacingToTwips(lineSpacing: number): number {
  return Math.round(lineSpacing * 240) // 单倍行距 = 240 twips
}
```

## 扩展开发

### 添加新的格式化类型

1. 在`FormattedText`接口中添加新属性
2. 在`createFormattedParagraph`方法中处理新格式
3. 在`cleanTextForWord`方法中添加相应的文本清理逻辑

### 自定义样式配置

1. 修改`style-config.ts`中的默认配置
2. 在WordGenerator中使用配置值
3. 提供配置更新接口

### 添加新的文档元素

1. 创建新的私有方法处理元素
2. 在`createEnterpriseContentStructure`中集成
3. 更新`ParsedContent`类型定义

## 故障排除

### 常见问题

1. **字体不显示**: 确保系统安装了思源字体，或使用fallback字体
2. **图片不显示**: 检查图片URL是否可访问，格式是否支持
3. **文件下载失败**: 检查浏览器兼容性和文件权限
4. **格式错误**: 检查Markdown解析器输出和类型定义

### 调试技巧

1. 启用详细日志记录
2. 检查生成的文档结构
3. 验证输入数据格式
4. 测试各种边界情况

## 更新历史

- **v1.0.45**: 修复导入问题，优化类型定义
- **v1.0.44**: 增强企业样式规范
- **v1.0.43**: 添加引用块支持
- **v1.0.42**: 完善格式化内容处理
- **v1.0.41**: 集成Banner图片支持
- **v1.0.40**: 增强文本清理功能