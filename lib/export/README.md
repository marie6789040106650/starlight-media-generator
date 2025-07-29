# 企业方案 Word 样式模板导出

这个模块严格按照 Python 脚本 `generate_template.py` 的格式标准，实现了企业方案 Word 文档的导出功能。

## 格式规范

### 页面设置
- **纸张大小**: A4（21 x 29.7 cm）
- **页边距**: 上 2.54 cm，下 2.54 cm，左 3.17 cm，右 3.17 cm
- **页眉距离**: 1.5 cm
- **页脚距离**: 1.75 cm

### 字体标准
- **正文内容**: 思源黑体（Source Han Sans SC），11pt，1.5 倍行距
- **一级标题**: 思源宋体（Source Han Serif SC），16~18pt，加粗，段前 12pt，段后 6pt
- **二级标题**: 思源宋体（Source Han Serif SC），14pt，加粗，段前 6pt，段后 4pt
- **三级标题**: 思源黑体，12pt，加粗，段前 3pt，段后 3pt
- **页眉页脚**: 思源黑体，10pt

### 段落格式
- **正文首行缩进**: 2 个字符（约 0.74 cm）
- **段前距离**: 0pt
- **段后距离**: 6pt
- **行距**: 1.5 倍行距
- **对齐方式**: 正文左对齐，标题左对齐

### 页眉页脚
- **页眉**: LOGO 左，文档标题右对齐
- **页脚**: LOGO + 页码居中

## 使用方法

### 基本使用

```typescript
import { WordGenerator } from './word-generator'

const generator = new WordGenerator()

// 生成企业方案样式规范文档
await generator.generateWordDocument({
  content: '', // 空内容将使用默认模板
  storeName: '企业方案模板',
  filename: '企业方案Word样式模板规范文档.docx'
})
```

### 快速示例

```typescript
import { generateEnterpriseWordTemplate } from './enterprise-word-example'

// 直接生成企业方案模板
await generateEnterpriseWordTemplate()
```

### 自定义内容

```typescript
import { generateCustomEnterpriseWord } from './enterprise-word-example'

const customContent = `
# 1. IP核心定位与形象塑造

## 人设定位
这里是人设定位的内容...

### 创业故事线
这里是创业故事线的内容...
`

// 不带Banner图
await generateCustomEnterpriseWord(customContent, null, '自定义企业方案.docx')

// 带Banner图
await generateCustomEnterpriseWord(customContent, 'https://example.com/banner.jpg', '自定义企业方案.docx')
```

## 文件结构

```
lib/export/
├── word-generator.ts          # 主要的Word生成器类
├── style-config.ts           # 样式配置（严格按照企业方案规范）
├── markdown-parser.ts        # Markdown内容解析器
├── enterprise-word-example.ts # 使用示例
└── README.md                 # 说明文档
```

## 依赖

```json
{
  "docx": "^8.0.0",
  "file-saver": "^2.0.5"
}
```

## 特性

- ✅ 严格按照 Python 脚本格式标准
- ✅ A4 纸张，精确页边距设置
- ✅ 思源字体系列（黑体/宋体）
- ✅ 标准的企业方案文档结构
- ✅ 页眉页脚格式（LOGO + 页码）
- ✅ 1.5 倍行距，首行缩进
- ✅ 标题层级样式规范
- ✅ 自动生成企业方案样式规范内容
- ✅ **Logo图片集成** - 自动加载 `/public/logo.png`
- ✅ **动态Banner图** - 支持传入动态生成的Banner图片
- ✅ **智能文件命名** - 自动从内容提取标题作为文件名
- ✅ **引用块支持** - 支持Markdown引用块和嵌套引用

## 注意事项

1. **字体支持**: 确保系统安装了思源黑体和思源宋体字体
2. **LOGO 图片**: 当前版本使用文本占位符，实际使用时需要添加真实的 LOGO 图片
3. **Banner 图片**: 首页 Banner 图片需要根据项目动态替换
4. **浏览器兼容性**: 需要现代浏览器支持 File API

## 与 Python 脚本对应关系

| Python 脚本功能 | TypeScript 实现 |
|----------------|----------------|
| `doc = Document()` | `new Document()` |
| 页面边距设置 | `page.margin` 配置 |
| 页眉页脚创建 | `createEnterpriseHeader/Footer()` |
| 字体设置 | `font` 属性配置 |
| 段落格式 | `spacing` 和 `indent` 配置 |
| 内容结构 | `createEnterpriseStyleGuide()` |
| 文件保存 | `Packer.toBuffer()` + `saveAs()` |

这个实现完全遵循了原 Python 脚本的格式规范，确保生成的 Word 文档符合企业方案模板标准。
## 最新更新 (v1.0.43)

### 引用块支持
- **引用块解析**: 新增对Markdown引用块的支持，使用`>`符号表示
- **嵌套引用**: 支持多级嵌套引用块，通过`>>`、`>>>`等表示不同级别
- **格式化内容**: 引用块内的格式化内容（加粗、斜体等）也能被正确解析
- **类型扩展**: 在`ParsedContent`接口中添加`'blockquote'`类型和`quoteLevel`属性
- **Word导出集成**: 引用块在Word文档中以特殊样式和缩进呈现

## 更新 (v1.0.40)

### 文本处理增强
- **转义序列处理**: 新增`cleanText`函数，专门处理文本中的转义序列
- **自动清理**: `parseInlineFormatting`函数现在会自动清理文本转义序列
- **格式一致性**: 确保所有文本格式在Word文档中正确显示
- **特殊字符处理**: 智能替换表情符号和特殊字符，确保文档兼容性

### 引用块技术实现
```typescript
// 引用块解析
if (line.startsWith('>')) {
  // 计算引用嵌套级别
  let quoteLevel = 0
  while (line.startsWith('>')) {
    quoteLevel++
    line = line.substring(1).trim()
  }
  
  // 解析引用内容中的格式
  const formattedContent = parseInlineFormatting(line)
  
  parsed.push({
    type: 'blockquote',
    text: line,
    quoteLevel: quoteLevel,
    formattedContent: formattedContent
  })
}
```

### Word文档中的引用块渲染
```typescript
// Word文档中渲染引用块
private createBlockquote(content: string, quoteLevel: number = 1): Paragraph {
  // 根据嵌套级别设置不同的缩进
  const indentSize = quoteLevel * 0.5; // 每级缩进0.5cm
  
  return new Paragraph({
    children: this.parseTextRuns(content),
    indent: {
      left: this.convertCmToTwips(indentSize),
      right: this.convertCmToTwips(0.5)
    },
    spacing: {
      before: this.convertPtToTwips(6),
      after: this.convertPtToTwips(6),
      line: this.convertLineSpacingToTwips(this.config.document.spacing.lineHeight)
    },
    border: {
      left: {
        color: "#CCCCCC",
        size: 4,
        style: BorderStyle.SINGLE
      }
    },
    shading: {
      type: ShadingType.CLEAR,
      color: "#F8F8F8",
      fill: "#F8F8F8"
    }
  });
}
```

### 用户体验提升
- **更丰富的内容格式**: 支持引用块和嵌套引用，提升文档表现力
- **专业文档效果**: 引用块在Word文档中以专业样式呈现，包括缩进和边框
- **格式一致性**: 引用块内的格式化内容（加粗、斜体等）保持正确显示
- **多级引用支持**: 通过不同级别的缩进清晰表示引用层级关系
- **更完整的Markdown支持**: 进一步完善Markdown解析能力，接近标准Markdown规范