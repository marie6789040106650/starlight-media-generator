# 复制功能控制 - 快速使用指南

## 概述

本系统默认**全面禁用**所有复制功能，并提供完整的内容保护机制，通过配置文件可以灵活控制。系统不仅禁用复制功能，还通过多层次保护防止用户通过其他方式获取内容，为未来基于此系统添加功能提供了完整的架构基础。

## 快速测试

### 1. 访问测试页面
```
http://localhost:3000/copy-test
```

### 2. 查看当前状态
- 默认配置：复制功能全部禁用
- 导出功能：保持启用（作为替代方案）
- UI状态：复制按钮被隐藏

### 3. 修改配置
点击"打开配置管理器"按钮，可以实时修改配置：
- **安全模式**（默认）：禁用复制，允许导出
- **完全开放**：启用所有功能
- **完全禁用**：禁用所有功能

## 配置说明

### 核心配置文件
`config/copy-settings.ts`

```typescript
interface CopySettings {
  allowCopy: boolean;                    // 是否允许复制
  showCopyUI: boolean;                   // 是否显示复制UI
  allowExportAsAlternative: boolean;     // 是否允许导出
}
```

### 默认配置（安全模式）
```typescript
{
  allowCopy: false,           // 禁用复制功能
  showCopyUI: false,          // 隐藏复制按钮
  allowExportAsAlternative: true  // 保留导出功能
}
```

## 程序化控制

### 检查配置状态
```typescript
import { isCopyAllowed, shouldShowCopyUI, isExportAllowed } from "@/config/copy-settings"

// 检查是否允许复制
if (isCopyAllowed()) {
  // 执行复制操作
}

// 检查是否显示复制UI
if (shouldShowCopyUI()) {
  // 显示复制按钮
}

// 检查是否允许导出
if (isExportAllowed()) {
  // 显示导出选项
}
```

### 修改配置
```typescript
import { updateCopySettings } from "@/config/copy-settings"

// 启用复制功能
updateCopySettings({
  allowCopy: true,
  showCopyUI: true
})

// 禁用导出功能
updateCopySettings({
  allowExportAsAlternative: false
})
```

## 受控制的功能

### 1. 全面内容保护
- **事件拦截**: 复制、剪切、粘贴、右键菜单、文本选择、拖拽操作
- **键盘快捷键**: Ctrl+C/X/V/A/S/P、F12、Ctrl+Shift+I、Ctrl+U等
- **CSS样式保护**: 禁用文本选择、拖拽、选择高亮等
- **智能识别**: 自动允许表单元素的正常文本操作
- **可视化提示**: 用户友好的保护操作反馈

### 2. 剪贴板工具函数
- `copyTextToClipboard()` - 文本复制
- `copyImageToClipboard()` - 图片复制
- `createTemporaryTextArea()` - 临时文本区域

### 3. 导出组件
- `ExportActions` - Word/PDF导出组件
- 配置禁用时组件完全隐藏

### 4. 工具函数
- `handleCopyContent()` - 内容复制处理
- `shouldShowCopyButton()` - 复制按钮显示控制

## 扩展开发

### 添加新功能
1. 检查配置状态
2. 根据配置决定功能行为
3. 提供合适的用户反馈

```typescript
export async function newFeature(data: any): Promise<boolean> {
  if (!isCopyAllowed()) {
    console.warn('功能已被禁用');
    alert('该功能已被禁用，请使用其他方式。');
    return false;
  }
  // 实现功能逻辑
}
```

### 添加UI控制
```typescript
import { shouldShowCopyUI } from "@/config/copy-settings"

export function NewFeatureButton() {
  if (!shouldShowCopyUI()) {
    return null; // 不显示按钮
  }
  
  return (
    <Button onClick={handleNewFeature}>
      新功能
    </Button>
  )
}
```

## 常见场景

### 开发调试
使用配置管理器快速切换不同模式进行测试。

### 生产部署
根据业务需求设置合适的默认配置。

### 功能演示
可以实时切换配置来演示不同的功能状态。

## 注意事项

1. **默认安全**：所有复制功能默认被禁用
2. **配置驱动**：所有功能都受配置文件控制
3. **用户友好**：被禁用的功能会提供清晰的提示
4. **扩展性强**：为未来功能扩展预留了完整接口

## 未来扩展

这个控制系统为以下功能扩展提供了基础：
- 权限控制系统
- 内容水印功能
- 复制次数限制
- 时间窗口控制
- 远程配置管理

---

通过这个控制系统，你可以灵活地管理复制功能，既保证了内容安全，又为未来的功能扩展奠定了坚实的基础。