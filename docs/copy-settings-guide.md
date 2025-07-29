# 复制功能配置指南

## 概述

复制功能配置系统提供了全面的复制控制管理，允许开发者和管理员灵活控制系统中的各种复制功能，包括剪贴板API复制、导出功能中的复制选项、用户界面中的复制按钮以及基于路由的复制控制。

## 配置文件位置

```
config/copy-settings.ts
```

## 核心配置接口

```typescript
export interface CopySettings {
  /**
   * 是否允许复制内容
   * 默认为 false (全面禁用复制功能)
   */
  allowCopy: boolean;
  
  /**
   * 是否显示复制相关的UI元素
   * 默认为 false (隐藏所有复制按钮和选项)
   */
  showCopyUI: boolean;
  
  /**
   * 是否允许通过导出功能间接复制
   * 默认为 true (允许Word/PDF导出)
   */
  allowExportAsAlternative: boolean;
}

export interface RouteCopyRule {
  /**
   * 路由路径模式 (支持通配符)
   */
  path: string;
  
  /**
   * 该路由的复制设置
   */
  settings: CopySettings;
  
  /**
   * 规则描述
   */
  description?: string;
}
```

## 默认配置

```typescript
// 默认配置：全面禁用复制功能
let copySettings: CopySettings = {
  allowCopy: false,           // 禁用所有复制功能
  showCopyUI: false,          // 隐藏复制相关UI
  allowExportAsAlternative: true  // 保留导出功能作为替代方案
};

// 路由复制规则配置
const routeCopyRules: RouteCopyRule[] = [
  {
    path: '/',
    settings: {
      allowCopy: true,           // 首页允许复制
      showCopyUI: true,          // 显示复制UI
      allowExportAsAlternative: true
    },
    description: '首页表单页面 - 允许复制粘贴'
  },
  {
    path: '/result',
    settings: {
      allowCopy: false,          // 结果页禁止复制
      showCopyUI: false,         // 隐藏复制UI
      allowExportAsAlternative: true
    },
    description: '结果页面 - 禁止复制，仅允许导出'
  }
];
```

## 配置管理函数

### 获取当前设置

```typescript
import { getCopySettings } from '@/config/copy-settings'

const currentSettings = getCopySettings()
console.log('当前复制设置:', currentSettings)
```

### 更新配置

```typescript
import { updateCopySettings } from '@/config/copy-settings'

// 部分更新
updateCopySettings({
  allowCopy: true,
  showCopyUI: true
})

// 完整更新
updateCopySettings({
  allowCopy: true,
  showCopyUI: true,
  allowExportAsAlternative: true
})
```

### 检查权限

```typescript
import { 
  isCopyAllowed, 
  shouldShowCopyUI, 
  isExportAllowed 
} from '@/config/copy-settings'

// 检查是否允许复制操作
if (isCopyAllowed()) {
  // 执行复制操作
  await copyToClipboard(content)
}

// 检查是否显示复制UI
if (shouldShowCopyUI()) {
  // 显示复制按钮
  return <CopyButton onClick={handleCopy} />
}

// 检查是否允许导出
if (isExportAllowed()) {
  // 显示导出选项
  return <ExportActions />
}
```

### 重置配置

```typescript
import { resetCopySettings } from '@/config/copy-settings'

// 重置为默认设置
resetCopySettings()
```

### 路由复制控制

```typescript
import { 
  updateCopySettingsByRoute,
  addRouteCopyRule,
  removeRouteCopyRule,
  getRouteCopyRules
} from '@/config/copy-settings'

// 根据当前路由自动更新复制设置
updateCopySettingsByRoute('/result')

// 添加新的路由复制规则
addRouteCopyRule({
  path: '/admin/*',
  settings: {
    allowCopy: true,
    showCopyUI: true,
    allowExportAsAlternative: true
  },
  description: '管理员页面 - 完全开放'
})

// 移除路由复制规则
removeRouteCopyRule('/admin/*')

// 获取所有路由复制规则
const rules = getRouteCopyRules()
console.log('当前路由规则:', rules)
```

## 路由复制控制

### 路由匹配规则

系统支持基于路由的复制控制，允许为不同页面设置不同的复制权限：

```typescript
// 精确匹配
{
  path: '/result',
  settings: { allowCopy: false, showCopyUI: false, allowExportAsAlternative: true },
  description: '结果页面 - 禁止复制'
}

// 通配符匹配
{
  path: '/admin/*',
  settings: { allowCopy: true, showCopyUI: true, allowExportAsAlternative: true },
  description: '管理员页面 - 完全开放'
}

// 全局匹配
{
  path: '*',
  settings: { allowCopy: false, showCopyUI: false, allowExportAsAlternative: false },
  description: '全局禁用'
}
```

### 路由规则优先级

路由规则按定义顺序匹配，首个匹配的规则生效：

1. **精确匹配优先**: `/result` 优先于 `/result/*`
2. **定义顺序**: 先定义的规则优先级更高
3. **默认规则**: 如果没有匹配的规则，使用默认配置

### 动态路由控制

```typescript
import { updateCopySettingsByRoute } from '@/config/copy-settings'

// 在路由变化时自动应用规则
const handleRouteChange = (pathname: string) => {
  updateCopySettingsByRoute(pathname)
  console.log(`🎯 路由 ${pathname} 的复制设置已更新`)
}

// 在Next.js中使用
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const MyApp = () => {
  const router = useRouter()
  
  useEffect(() => {
    handleRouteChange(router.pathname)
  }, [router.pathname])
  
  return <div>...</div>
}
```

## 使用场景

### 场景1：完全禁用复制功能

适用于需要严格内容保护的场景：

```typescript
updateCopySettings({
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: false
})
```

**效果**：
- 隐藏所有复制按钮
- 禁用剪贴板API调用
- 禁用Word/PDF导出功能

### 场景2：允许导出但禁用直接复制

适用于希望用户通过正式文档获取内容的场景：

```typescript
updateCopySettings({
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: true
})
```

**效果**：
- 隐藏复制按钮
- 禁用直接复制功能
- 保留Word/PDF导出功能

### 场景3：完全开放复制功能

适用于内部使用或开放环境：

```typescript
updateCopySettings({
  allowCopy: true,
  showCopyUI: true,
  allowExportAsAlternative: true
})
```

**效果**：
- 显示所有复制按钮
- 允许所有复制操作
- 保留所有导出功能

### 场景4：仅显示UI但禁用功能

适用于需要保持界面一致性但临时禁用功能的场景：

```typescript
updateCopySettings({
  allowCopy: false,
  showCopyUI: true,
  allowExportAsAlternative: true
})
```

**效果**：
- 显示复制按钮但点击无效
- 保留导出功能
- 可配合提示信息告知用户

## 组件集成示例

### 在React组件中使用

```typescript
import React from 'react'
import { shouldShowCopyUI, isCopyAllowed } from '@/config/copy-settings'

const ContentActions: React.FC = () => {
  const handleCopy = async () => {
    if (!isCopyAllowed()) {
      alert('复制功能已被禁用')
      return
    }
    
    // 执行复制逻辑
    await copyToClipboard(content)
  }

  return (
    <div className="flex gap-2">
      {shouldShowCopyUI() && (
        <button 
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          复制内容
        </button>
      )}
      
      {isExportAllowed() && (
        <ExportActions />
      )}
    </div>
  )
}
```

### 在导出组件中使用

```typescript
import React from 'react'
import { isExportAllowed } from '@/config/copy-settings'

const ExportActions: React.FC = () => {
  if (!isExportAllowed()) {
    return null // 不显示导出选项
  }

  return (
    <div className="export-actions">
      <button onClick={handleWordExport}>导出Word</button>
      <button onClick={handlePDFExport}>导出PDF</button>
    </div>
  )
}
```

## 动态配置管理

### 基于用户权限的动态配置

```typescript
import { updateCopySettings, addRouteCopyRule } from '@/config/copy-settings'

const initializeCopySettings = (userRole: string) => {
  switch (userRole) {
    case 'admin':
      // 管理员：所有页面都允许复制
      addRouteCopyRule({
        path: '*',
        settings: {
          allowCopy: true,
          showCopyUI: true,
          allowExportAsAlternative: true
        },
        description: '管理员权限 - 全局允许'
      })
      break
      
    case 'editor':
      // 编辑者：首页允许复制，其他页面禁止
      addRouteCopyRule({
        path: '/',
        settings: {
          allowCopy: true,
          showCopyUI: true,
          allowExportAsAlternative: true
        },
        description: '编辑者权限 - 首页允许'
      })
      break
      
    case 'viewer':
      // 查看者：所有页面都禁止复制
      updateCopySettings({
        allowCopy: false,
        showCopyUI: false,
        allowExportAsAlternative: false
      })
      break
      
    default:
      resetCopySettings() // 使用默认设置
  }
}
```

### 基于内容类型的动态配置

```typescript
const configureForContentType = (contentType: string, currentPath: string) => {
  if (contentType === 'public') {
    addRouteCopyRule({
      path: currentPath,
      settings: {
        allowCopy: true,
        showCopyUI: true,
        allowExportAsAlternative: true
      },
      description: `公开内容 - ${currentPath}`
    })
  } else if (contentType === 'restricted') {
    addRouteCopyRule({
      path: currentPath,
      settings: {
        allowCopy: false,
        showCopyUI: false,
        allowExportAsAlternative: true
      },
      description: `受限内容 - ${currentPath}`
    })
  } else if (contentType === 'confidential') {
    addRouteCopyRule({
      path: currentPath,
      settings: {
        allowCopy: false,
        showCopyUI: false,
        allowExportAsAlternative: false
      },
      description: `机密内容 - ${currentPath}`
    })
  }
}
```

## 与内容保护功能的协同

复制功能配置系统与内容保护功能 (`utils/prevent-copy.ts`) 协同工作：

```typescript
import { isCopyAllowed } from '@/config/copy-settings'
import { enableContentProtection, disableContentProtection } from '@/utils/prevent-copy'

const syncContentProtection = () => {
  if (isCopyAllowed()) {
    disableContentProtection() // 允许复制时禁用内容保护
  } else {
    enableContentProtection() // 禁用复制时启用内容保护
  }
}

// 在配置更新后同步
updateCopySettings(newSettings)
syncContentProtection()
```

## 调试和监控

### 启用调试日志

配置更新时会自动输出日志：

```typescript
updateCopySettings({ allowCopy: true })
// 控制台输出: "复制设置已更新: { allowCopy: true, showCopyUI: false, allowExportAsAlternative: true }"

resetCopySettings()
// 控制台输出: "复制设置已重置为默认值"
```

### 监控配置状态

```typescript
const monitorCopySettings = () => {
  const settings = getCopySettings()
  
  console.log('复制功能监控报告:')
  console.log('- 允许复制:', settings.allowCopy ? '是' : '否')
  console.log('- 显示复制UI:', settings.showCopyUI ? '是' : '否')
  console.log('- 允许导出:', settings.allowExportAsAlternative ? '是' : '否')
  
  // 检查配置一致性
  if (settings.allowCopy && !settings.showCopyUI) {
    console.warn('警告: 允许复制但隐藏UI，用户可能无法使用复制功能')
  }
}
```

## 最佳实践

### 1. 配置一致性

确保UI显示与功能权限保持一致：

```typescript
// 推荐：UI和功能保持一致
updateCopySettings({
  allowCopy: true,
  showCopyUI: true
})

// 避免：功能禁用但显示UI（除非有特殊需求）
updateCopySettings({
  allowCopy: false,
  showCopyUI: true
})
```

### 2. 渐进式权限控制

从严格到宽松的权限控制：

```typescript
// 第一阶段：完全禁用
updateCopySettings({
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: false
})

// 第二阶段：允许导出
updateCopySettings({
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: true
})

// 第三阶段：显示UI但限制功能
updateCopySettings({
  allowCopy: false,
  showCopyUI: true,
  allowExportAsAlternative: true
})

// 第四阶段：完全开放
updateCopySettings({
  allowCopy: true,
  showCopyUI: true,
  allowExportAsAlternative: true
})
```

### 3. 用户体验考虑

提供清晰的用户反馈：

```typescript
const handleCopyAttempt = async () => {
  if (!isCopyAllowed()) {
    // 提供友好的错误提示
    toast.error('复制功能已被管理员禁用，请使用导出功能获取内容')
    return
  }
  
  try {
    await copyToClipboard(content)
    toast.success('内容已复制到剪贴板')
  } catch (error) {
    toast.error('复制失败，请重试')
  }
}
```

## 故障排除

### 常见问题

1. **配置不生效**
   - 检查是否正确导入配置函数
   - 确认配置更新后是否重新渲染组件

2. **UI显示异常**
   - 检查`shouldShowCopyUI()`的返回值
   - 确认组件正确使用了配置检查

3. **权限检查失效**
   - 确认使用了正确的权限检查函数
   - 检查配置是否被意外重置

### 调试步骤

```typescript
// 1. 检查当前配置
console.log('当前配置:', getCopySettings())

// 2. 测试权限检查
console.log('允许复制:', isCopyAllowed())
console.log('显示UI:', shouldShowCopyUI())
console.log('允许导出:', isExportAllowed())

// 3. 重置并重新配置
resetCopySettings()
updateCopySettings({ allowCopy: true, showCopyUI: true })

// 4. 验证配置生效
console.log('更新后配置:', getCopySettings())
```

## 扩展开发

### 添加新的配置项

```typescript
// 扩展接口
export interface CopySettings {
  allowCopy: boolean;
  showCopyUI: boolean;
  allowExportAsAlternative: boolean;
  // 新增配置项
  allowPartialCopy: boolean;        // 允许部分复制
  maxCopyLength: number;            // 最大复制长度
  copyWatermark: boolean;           // 复制时添加水印
}

// 添加对应的检查函数
export function isPartialCopyAllowed(): boolean {
  return copySettings.allowPartialCopy;
}

export function getMaxCopyLength(): number {
  return copySettings.maxCopyLength;
}

export function shouldAddCopyWatermark(): boolean {
  return copySettings.copyWatermark;
}
```

### 集成外部配置源

```typescript
// 从API加载配置
const loadConfigFromAPI = async () => {
  try {
    const response = await fetch('/api/copy-settings')
    const settings = await response.json()
    updateCopySettings(settings)
  } catch (error) {
    console.error('加载复制配置失败:', error)
    resetCopySettings() // 使用默认配置
  }
}

// 保存配置到API
const saveConfigToAPI = async (settings: Partial<CopySettings>) => {
  try {
    await fetch('/api/copy-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    updateCopySettings(settings)
  } catch (error) {
    console.error('保存复制配置失败:', error)
  }
}
```

## 总结

复制功能配置系统提供了灵活而强大的复制控制能力，通过简单的配置即可实现从完全禁用到完全开放的各种复制控制策略。结合内容保护功能，可以构建完整的内容安全管理体系。

关键特性：
- **全面控制**: 覆盖UI显示、功能权限、导出选项的完整控制
- **灵活配置**: 支持动态配置和多种使用场景
- **易于集成**: 提供简洁的API和完整的TypeScript支持
- **用户友好**: 支持渐进式权限控制和清晰的用户反馈