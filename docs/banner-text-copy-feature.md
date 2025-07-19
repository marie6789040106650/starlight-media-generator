# Banner图片和方案文字复制功能

## 功能概述

该功能允许用户一键复制Banner图片和方案文字内容，提升用户体验和分享便捷性。

## 实现细节

### 1. 剪贴板工具函数

在 `utils/clipboard-utils.ts` 中实现了以下工具函数：

- `copyImageToClipboard`: 将图片URL复制到剪贴板
- `copyTextToClipboard`: 将文本复制到剪贴板
- `createTemporaryTextArea`: 创建临时文本区域供用户手动复制（降级方案）

### 2. 复制流程

复制功能的执行流程如下：

1. 用户点击"复制图文"按钮
2. 系统先尝试复制Banner图片（如果有）
3. 然后复制方案文字内容
4. 根据复制结果给出相应提示
5. 如果自动复制失败，提供降级方案

### 3. 降级策略

为确保功能在各种浏览器环境下的可用性，实现了多级降级策略：

- 首选：同时复制Banner图片和文字
- 降级1：仅复制文字内容
- 降级2：复制原始Markdown内容
- 降级3：提供手动复制界面

## 使用方法

用户只需点击界面上的"复制图文"按钮，系统会自动处理复制过程：

- 如果有Banner图片，按钮显示为"复制图文"
- 如果没有Banner图片，按钮显示为"复制全部"

## 技术实现

### 图片复制实现

```typescript
async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  // 创建Image对象加载图片
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = imageUrl
  })
  
  // 使用Canvas绘制图片
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  
  // 转换为Blob并复制到剪贴板
  const blob = await new Promise<Blob>(resolve => 
    canvas.toBlob(blob => resolve(blob), 'image/png')
  )
  
  const clipboardItem = new ClipboardItem({ 'image/png': blob })
  await navigator.clipboard.write([clipboardItem])
  return true
}
```

### 文本复制实现

```typescript
async function copyTextToClipboard(text: string): Promise<boolean> {
  await navigator.clipboard.writeText(text)
  return true
}
```

## 浏览器兼容性

该功能依赖于现代浏览器的Clipboard API，具体兼容性如下：

- 完全支持：Chrome 76+, Edge 79+, Firefox 87+
- 部分支持：Safari 13.1+（仅支持文本复制）
- 不支持：IE 所有版本

对于不支持的浏览器，系统会自动降级到手动复制模式。

## 注意事项

1. 由于浏览器安全策略，复制图片需要图片源支持CORS
2. 复制大图片可能会占用较多内存，建议优化Banner图片大小
3. 某些浏览器环境下可能无法同时复制图片和文本，系统会自动降级

## 未来优化方向

1. 添加复制进度指示器
2. 优化图片处理性能
3. 支持复制多张图片
4. 增加复制成功后的视觉反馈