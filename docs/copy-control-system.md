# 复制功能控制系统

## 概述

本系统实现了全面的复制功能控制机制和内容保护系统，默认情况下禁用所有复制功能，通过配置文件可以灵活控制复制和导出功能的启用状态。系统包含三个核心组件：复制功能配置管理、基于路由的复制控制和全面内容保护机制，为内容安全和功能扩展提供了完整的基础架构。

## 设计理念

### 安全优先
- **默认禁用**: 所有复制功能默认被禁用
- **配置控制**: 通过配置文件统一管理功能开关
- **分层控制**: 支持功能级别和UI级别的独立控制

### 扩展性强
- **接口预留**: 为未来功能扩展预留了完整的接口
- **模块化设计**: 各功能模块独立，便于扩展
- **配置驱动**: 新功能可通过配置文件快速启用

## 核心组件

### 1. 配置管理 (`config/copy-settings.ts`)

```typescript
export interface CopySettings {
  allowCopy: boolean;                    // 是否允许复制内容
  showCopyUI: boolean;                   // 是否显示复制相关UI
  allowExportAsAlternative: boolean;     // 是否允许导出功能
}

export interface RouteCopyRule {
  path: string;                          // 路由路径模式 (支持通配符)
  settings: CopySettings;                // 该路由的复制设置
  description?: string;                  // 规则描述
}

// 默认配置：全面禁用复制功能
let copySettings: CopySettings = {
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: true
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
      allowExportAsAlternative: true  // 保留导出Word、PDF权限
    },
    description: '结果页面 - 禁止鼠标键盘复制，仅允许导出Word/PDF'
  }
];
```

#### 核心函数
- `getCopySettings()`: 获取当前配置
- `updateCopySettings()`: 更新配置
- `isCopyAllowed()`: 检查是否允许复制
- `shouldShowCopyUI()`: 检查是否显示复制UI
- `isExportAllowed()`: 检查是否允许导出
- `resetCopySettings()`: 重置为默认配置
- `updateCopySettingsByRoute()`: 根据路由更新复制设置
- `getRouteCopyRules()`: 获取所有路由复制规则
- `addRouteCopyRule()`: 添加新的路由复制规则
- `removeRouteCopyRule()`: 移除路由复制规则

### 2. 全面内容保护 (`utils/prevent-copy.ts`)

全面的内容保护系统，禁止所有形式的复制、剪切、选择和右键操作：

```typescript
/**
 * 初始化全面内容保护
 * 禁止所有形式的复制操作
 */
export function initPreventCopy(): void {
  if (typeof window === 'undefined') return;

  console.log('🛡️ 初始化全面内容保护系统');

  // 1. 禁止复制事件 (Ctrl+C)
  document.addEventListener('copy', (e) => {
    if (!isCopyAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      showProtectionMessage('复制功能已被禁用');
    }
  }, true);

  // 2. 禁止剪切事件 (Ctrl+X)
  // 3. 禁止粘贴事件 (Ctrl+V) - 在非编辑区域
  // 4. 禁止右键菜单
  // 5. 禁止文本选择
  // 6. 禁止拖拽选择
  // 7. 禁止键盘快捷键
  // 8. 禁用打印功能
  // 9. 添加CSS样式禁用选择
  // 10. 监听窗口失焦（防止通过其他方式复制）
}

/**
 * 更新保护状态
 * 当配置改变时调用
 */
export function updateProtectionStatus(): void {
  if (isCopyAllowed()) {
    removeProtectionStyles();
    console.log('🔓 内容保护已禁用');
  } else {
    addProtectionStyles();
    console.log('🔒 内容保护已启用');
  }
}
```

### 3. 剪贴板工具 (`utils/clipboard-utils.ts`)

所有剪贴板相关功能都受到配置控制：

```typescript
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    return false;
  }
  // ... 复制逻辑
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    return false;
  }
  // ... 复制逻辑
}
```

### 4. 导出控制 (`components/export-actions.tsx`)

导出组件受到配置控制，可以完全隐藏或禁用：

```typescript
export function ExportActions({ content, storeName, bannerImage, disabled, className }: ExportActionsProps) {
  // 检查是否允许显示导出功能
  if (!isExportAllowed()) {
    return null; // 如果不允许导出，则不显示组件
  }

  const handleWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }
    // ... 导出逻辑
  }
}
```

### 5. 路由复制控制

基于路由的复制控制功能，允许为不同页面设置不同的复制权限：

```typescript
// 根据当前路由更新复制设置
import { updateCopySettingsByRoute } from '@/config/copy-settings'

// 在路由变化时调用
updateCopySettingsByRoute('/result')  // 应用结果页的复制规则

// 添加新的路由规则
import { addRouteCopyRule } from '@/config/copy-settings'

addRouteCopyRule({
  path: '/admin/*',
  settings: {
    allowCopy: true,
    showCopyUI: true,
    allowExportAsAlternative: true
  },
  description: '管理员页面 - 完全开放'
})
```

#### 路由匹配规则
- **精确匹配**: `/result` 只匹配 `/result` 路径
- **通配符匹配**: `/admin/*` 匹配所有以 `/admin/` 开头的路径
- **优先级**: 按规则定义顺序匹配，首个匹配的规则生效

### 6. 设置管理器 (`components/copy-settings-manager.tsx`)

提供可视化的配置管理界面：

- **实时配置**: 可以实时修改配置并立即生效
- **预设模式**: 提供安全模式、完全开放等预设配置
- **状态显示**: 清晰显示当前配置状态
- **路由规则管理**: 可视化管理路由复制规则
- **开发友好**: 便于开发和调试时使用

## 配置模式

### 安全模式（默认）
```typescript
{
  allowCopy: false,           // 禁用复制
  showCopyUI: false,          // 隐藏复制按钮
  allowExportAsAlternative: true  // 允许导出
}
```
- 完全禁用复制功能
- 隐藏所有复制相关UI
- 保留导出功能作为替代方案

### 完全开放模式
```typescript
{
  allowCopy: true,
  showCopyUI: true,
  allowExportAsAlternative: true
}
```
- 启用所有复制功能
- 显示所有复制相关UI
- 允许导出功能

### 完全禁用模式
```typescript
{
  allowCopy: false,
  showCopyUI: false,
  allowExportAsAlternative: false
}
```
- 禁用所有复制功能
- 隐藏所有相关UI
- 禁用导出功能

## 使用方法

### 开发时配置

在开发环境中，可以使用设置管理器组件：

```typescript
import { CopySettingsManager } from "@/components/copy-settings-manager"

// 在开发页面中添加
<CopySettingsManager />
```

### 程序化配置

```typescript
import { updateCopySettings, updateCopySettingsByRoute } from "@/config/copy-settings"

// 启用复制功能
updateCopySettings({
  allowCopy: true,
  showCopyUI: true
})

// 禁用导出功能
updateCopySettings({
  allowExportAsAlternative: false
})

// 根据路由自动配置
updateCopySettingsByRoute('/result')  // 自动应用结果页的复制规则
```

### 路由配置

```typescript
import { addRouteCopyRule, removeRouteCopyRule, getRouteCopyRules } from "@/config/copy-settings"

// 添加新的路由规则
addRouteCopyRule({
  path: '/premium/*',
  settings: {
    allowCopy: false,
    showCopyUI: false,
    allowExportAsAlternative: true
  },
  description: '付费内容页面 - 禁止复制'
})

// 移除路由规则
removeRouteCopyRule('/premium/*')

// 获取所有路由规则
const rules = getRouteCopyRules()
console.log('当前路由规则:', rules)
```

### 检查配置状态

```typescript
import { isCopyAllowed, shouldShowCopyUI, isExportAllowed } from "@/config/copy-settings"

// 在组件中使用
if (shouldShowCopyUI()) {
  // 显示复制按钮
}

if (isCopyAllowed()) {
  // 执行复制操作
}

if (isExportAllowed()) {
  // 显示导出选项
}
```

## 扩展指南

### 添加新的复制功能

1. **创建功能函数**
```typescript
export async function newCopyFeature(data: any): Promise<boolean> {
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    return false;
  }
  // 实现新功能
}
```

2. **添加UI控制**
```typescript
import { shouldShowCopyUI } from "@/config/copy-settings"

export function NewCopyButton() {
  if (!shouldShowCopyUI()) {
    return null;
  }
  // 渲染按钮
}
```

### 添加新的配置选项

1. **扩展配置接口**
```typescript
export interface CopySettings {
  allowCopy: boolean;
  showCopyUI: boolean;
  allowExportAsAlternative: boolean;
  newFeatureEnabled: boolean;  // 新增配置项
}
```

2. **添加检查函数**
```typescript
export function isNewFeatureEnabled(): boolean {
  return copySettings.newFeatureEnabled;
}
```

3. **更新设置管理器**
在 `CopySettingsManager` 组件中添加新的开关控件。

## 安全考虑

### 防止绕过
- 所有复制相关功能都必须通过配置检查
- UI层面和功能层面双重控制
- 配置状态在运行时可以动态修改

### 日志记录
- 所有被禁用的操作都会记录警告日志
- 配置变更会记录到控制台
- 便于调试和监控

### 用户体验
- 功能被禁用时提供清晰的提示信息
- 建议用户使用替代方案（如导出功能）
- 避免功能突然失效造成困惑

## 最佳实践

### 开发阶段
1. 使用设置管理器进行快速配置切换
2. 在不同配置下测试所有功能
3. 确保禁用状态下的用户体验良好

### 生产部署
1. 根据业务需求设置合适的默认配置
2. 考虑是否需要运行时配置修改能力
3. 监控配置变更和功能使用情况

### 功能扩展
1. 新功能必须遵循配置控制原则
2. 提供合理的默认配置
3. 考虑与现有功能的兼容性

## 未来扩展方向

### 权限控制
- 基于用户角色的功能控制
- 细粒度的权限管理
- 动态权限验证

### 远程配置
- 支持从服务器获取配置
- 实时配置推送
- A/B测试支持

### 审计日志
- 详细的操作日志记录
- 配置变更历史
- 用户行为分析

### 高级功能
- 内容水印
- 复制次数限制
- 时间窗口控制
- 地理位置限制

---

这个控制系统为项目提供了强大而灵活的复制功能管理能力，既保证了内容安全，又为未来的功能扩展奠定了坚实的基础。