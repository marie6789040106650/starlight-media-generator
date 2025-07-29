# 🛡️ 水印导出逻辑实现

## 🎯 实现需求

按照你的要求，我已经实现了新的导出逻辑：

1. **水印开关控制** - 用户可以选择是否添加水印
2. **分层导出流程** - 先按原逻辑导出，再添加水印层
3. **智能文件命名** - 带水印的文件自动添加"_protected"后缀

## 🔄 导出流程

### PDF导出流程

#### 1. 无水印导出（水印开关关闭）
```
用户点击"导出PDF" 
    ↓
调用原始导出API (/api/generate-pdf)
    ↓
生成标准PDF文件
    ↓
下载文件：方案名称.pdf
```

#### 2. 带水印导出（水印开关开启）
```
用户点击"导出PDF"
    ↓
第一步：调用原始导出API (/api/generate-pdf)
    ↓
生成标准PDF文件
    ↓
第二步：读取水印配置 (localStorage)
    ↓
使用pdf-lib在PDF上添加水印层
    ↓
生成带水印的PDF文件
    ↓
下载文件：方案名称_protected.pdf
```

### Word导出流程
```
用户点击"导出Word"
    ↓
调用原始导出API (/api/generate-word)
    ↓
生成Word文件（暂不支持水印）
    ↓
下载文件：方案名称.docx
```

## 🔧 技术实现

### 1. 水印配置获取
```typescript
const getWatermarkConfig = () => {
  try {
    const saved = localStorage.getItem('watermarkConfig')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.warn('获取水印配置失败:', error)
    return null
  }
}
```

### 2. 分层导出逻辑
```typescript
// 第一步：按原逻辑导出PDF
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content, storeName, bannerImage, filename })
})

let finalBlob = await response.blob()

// 第二步：如果启用水印，则在PDF上添加水印层
const watermarkConfig = getWatermarkConfig()
if (watermarkConfig && watermarkConfig.enabled) {
  const pdfBuffer = await finalBlob.arrayBuffer()
  const { addSimpleWatermark } = await import('../lib/watermark-toolkit')
  
  const watermarkResult = await addSimpleWatermark(pdfBuffer, watermarkConfig.text, {
    opacity: watermarkConfig.opacity / 100,
    fontSize: watermarkConfig.fontSize,
    rotation: watermarkConfig.rotation,
    position: { x: '...', y: '...' },
    repeat: watermarkConfig.repeat,
    color: getColorRGB(watermarkConfig.color)
  })

  if (watermarkResult.success) {
    finalBlob = new Blob([watermarkResult.pdfBytes], { type: 'application/pdf' })
    filename = filename?.replace('.pdf', '_protected.pdf')
  }
}
```

### 3. 颜色转换函数
```typescript
const getColorRGB = (color: string) => {
  const colorMap = {
    gray: { r: 0.5, g: 0.5, b: 0.5 },
    red: { r: 1, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 1 },
    black: { r: 0, g: 0, b: 0 }
  };
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
}
```

## 🎨 用户界面增强

### 1. 水印状态指示
当用户启用水印时，导出按钮旁会显示蓝色的"已启用水印"标识：
```tsx
{isWatermarkEnabled && (
  <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
    <Shield className="h-3 w-3 mr-1" />
    <span className="hidden sm:inline">已启用水印</span>
  </div>
)}
```

### 2. 导出选项说明
下拉菜单中显示每个导出选项的详细说明：
- **Word导出**: "原始格式导出"
- **PDF导出**: 
  - 无水印时："原始格式导出"
  - 有水印时："包含水印保护"

## 📁 文件命名规则

### 自动文件名生成
```typescript
// 从内容第一行提取标题
const firstLine = content.split('\n')[0];
if (firstLine && firstLine.startsWith('#')) {
  const title = firstLine.replace(/^#+\s*/, '').trim();
  if (title) {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
    filename = `${title}-${currentDate}.pdf`;
  }
}
```

### 水印文件后缀
- **原始PDF**: `营销方案-20250124.pdf`
- **带水印PDF**: `营销方案-20250124_protected.pdf`

## 🛡️ 错误处理

### 水印添加失败处理
```typescript
try {
  // 添加水印逻辑
  const watermarkResult = await addSimpleWatermark(...)
  if (watermarkResult.success) {
    // 使用带水印的PDF
  }
} catch (watermarkError) {
  console.warn('水印添加失败，使用原始PDF:', watermarkError)
  // 如果水印添加失败，继续使用原始PDF
}
```

### 配置读取失败处理
```typescript
const getWatermarkConfig = () => {
  try {
    const saved = localStorage.getItem('watermarkConfig')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.warn('获取水印配置失败:', error)
    return null // 返回null，按无水印处理
  }
}
```

## 🎯 用户体验

### 导出流程体验
1. **配置水印** - 用户在水印设置中配置参数
2. **状态提示** - 界面显示"已启用水印"状态
3. **选择导出** - 下拉菜单显示是否包含水印
4. **自动处理** - 系统自动按配置添加水印
5. **文件下载** - 自动下载带后缀的保护文件

### 视觉反馈
- ✅ **状态指示** - 蓝色标签显示水印启用状态
- ✅ **选项说明** - 下拉菜单显示导出类型说明
- ✅ **进度提示** - 导出过程中显示"导出中..."
- ✅ **文件命名** - 自动生成有意义的文件名

## 🔄 兼容性

### 向后兼容
- 如果用户没有配置水印，按原逻辑导出
- 如果水印配置损坏，自动降级到无水印导出
- 如果水印添加失败，使用原始PDF文件

### 渐进增强
- 基础功能：原始导出（始终可用）
- 增强功能：水印保护（可选启用）
- 高级功能：自定义水印参数（完全可配置）

## 🎉 实现效果

现在用户可以：

1. **灵活选择** - 通过水印设置开关控制是否添加水印
2. **无缝体验** - 导出流程保持一致，自动处理水印
3. **状态感知** - 界面清晰显示当前水印状态
4. **智能命名** - 文件名自动区分是否包含水印
5. **容错处理** - 水印失败时自动降级到原始文件

这个实现完全符合你的需求：**先按原逻辑导出，如果启用水印则在PDF上添加水印层**！🛡️✨