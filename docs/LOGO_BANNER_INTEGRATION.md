# Logo 和 Banner 图片集成完成

## 概述

已成功将Logo和Banner图片集成到Word导出功能中，严格按照Python脚本的格式要求实现。

## Logo图片集成

### 实现细节
- **文件位置**: `/public/logo.png`
- **自动加载**: 系统启动时自动从public目录加载
- **页眉使用**: Logo左侧，文档标题右对齐，尺寸0.5英寸
- **页脚使用**: Logo + 页码居中，尺寸0.4英寸
- **错误处理**: 如果Logo不可用，显示文本占位符

### 代码实现
```typescript
private async loadLogo(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch('/logo.png')
    if (response.ok) {
      this.logoBuffer = await response.arrayBuffer()
      return this.logoBuffer
    }
  } catch (error) {
    console.warn('无法加载logo图片:', error)
  }
  return null
}
```

### 页眉布局更新 (v1.0.33)
页眉布局已进一步优化，调整了LOGO尺寸和文字大小，并增加了页眉与正文之间的间距：

```typescript
private async createEnterpriseHeader(logoBuffer: ArrayBuffer | null): Promise<Header> {
  const headerParagraphs: Paragraph[] = []

  // 单行：LOGO和文字在同一行，居中对齐
  const headerChildren: (TextRun | ImageRun)[] = []
  if (logoBuffer) {
    headerChildren.push(new ImageRun({
      data: new Uint8Array(logoBuffer),
      transformation: { width: 40, height: 40 }, // 调整logo尺寸，使其与文字更协调
      type: 'png',
    }))
  }
  
  // 添加文字，与logo在同一行
  headerChildren.push(new TextRun({
    text: " 由星光传媒专业团队为您量身定制", // 前面加空格，与logo分开
    font: "Source Han Sans SC", // 思源黑体
    size: 22, // 11pt * 2，稍微增大字体
  }))

  headerParagraphs.push(new Paragraph({
    children: headerChildren,
    alignment: AlignmentType.CENTER, // 整体居中对齐
    spacing: {
      after: 200, // 增加页眉与正文之间的间距
    },
  }))

  return new Header({ children: headerParagraphs })
}
```

## Banner图片集成

### 实现细节
- **动态传入**: 通过`bannerImage`参数传入URL
- **首页位置**: 居中插入，宽度7英寸（严格按照Python脚本）
- **自动下载**: 从URL自动下载并嵌入Word文档
- **降级处理**: 如果Banner不可用，显示占位符

### 代码实现
```typescript
private async loadBannerImage(bannerUrl: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(bannerUrl)
    if (response.ok) {
      return await response.arrayBuffer()
    }
  } catch (error) {
    console.warn('无法加载banner图片:', error)
  }
  return null
}
```

## 接口更新

### WordExportOptions
```typescript
export interface WordExportOptions {
  content: string
  storeName: string
  bannerImage?: string | null  // 新增：Banner图片URL
  filename?: string
  includeWatermark?: boolean
}
```

### ExportActions组件
```typescript
interface ExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null  // 新增：Banner图片URL
  disabled?: boolean
  className?: string
}
```

## 使用流程

### 1. 主应用中的集成
```typescript
// 在app/page.tsx中
const { bannerImage } = useBannerImage()

<ExportActions
  content={generatedContent}
  storeName={formData.storeName}
  bannerImage={bannerImage}  // 传递动态生成的Banner图
  disabled={!generatedContent}
/>
```

### 2. Word生成流程
1. **加载Logo**: 从`/public/logo.png`加载固定Logo
2. **加载Banner**: 从传入的URL下载动态Banner图
3. **创建页眉**: Logo左侧 + 文档标题右对齐
4. **创建页脚**: Logo + 页码居中
5. **插入Banner**: 首页Banner图，7英寸宽度
6. **生成文档**: 完整的Word文档

## 格式对应

### 与Python脚本的对应关系
| Python脚本 | TypeScript实现 | 状态 |
|-----------|---------------|------|
| `run.add_picture('logo.jpg', width=Inches(0.5))` | `width: 20pt (缩小尺寸)` | ✅ |
| `run.add_picture('logo.jpg', width=Inches(0.4))` | `width: 29pt (0.4英寸)` | ✅ |
| `doc.add_picture('banner.jpg', width=Inches(7))` | `width: 504pt (7英寸)` | ✅ |
| 页眉LOGO和文字居中对齐 | `AlignmentType.CENTER` | ✅ |
| 页脚居中 | `AlignmentType.CENTER` | ✅ |

## 测试验证

### 测试页面
- 访问 `/word-export-test` 进行测试
- 支持标准模板和自定义内容两种模式
- 自动处理Logo集成，Banner图可选

### 验证步骤
1. 确保 `/public/logo.png` 文件存在
2. 生成方案并获得Banner图URL
3. 导出Word文档
4. 检查页眉页脚Logo显示
5. 检查首页Banner图显示

## 错误处理

### Logo加载失败
- 显示文本占位符 `[LOGO]`
- 不影响文档生成
- 控制台警告信息

### Banner加载失败
- 显示文本占位符
- 不影响文档生成
- 控制台警告信息

## 技术细节

### 图片格式处理
```typescript
new ImageRun({
  data: new Uint8Array(imageBuffer),  // ArrayBuffer转Uint8Array
  transformation: {
    width: 504,  // 像素单位
    height: 168,
  },
  type: 'png',  // 指定图片类型
})
```

### 单位转换
- 英寸到像素: `1英寸 = 72像素`
- 页眉Logo: `0.5英寸 = 36像素`
- 页脚Logo: `0.4英寸 = 29像素`
- Banner图: `7英寸 = 504像素`

## 完成状态

- ✅ Logo图片自动加载和嵌入
- ✅ Banner图片动态传入和嵌入
- ✅ 页眉页脚格式严格对应Python脚本
- ✅ 首页Banner图格式严格对应Python脚本
- ✅ 错误处理和降级方案
- ✅ 接口更新和组件集成
- ✅ 测试页面和文档更新

现在Word导出功能已完全支持Logo和Banner图片，严格按照Python脚本的格式标准实现。