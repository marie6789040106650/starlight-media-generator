# 内容保护功能更新

## 功能概述

已成功实现内容保护功能，提供完整的机制防止用户未经授权复制、剪切或选择应用中的内容。该功能通过配置系统实现灵活控制，可以根据需要启用或禁用。

## 核心更新内容

- **内容保护机制**: 新增 `utils/prevent-copy.ts`，提供完整的内容保护功能
- **配置系统**: 实现 `config/copy-settings.ts`，支持灵活控制保护功能
- **事件拦截**: 拦截复制、剪切、右键菜单和文本选择事件
- **智能识别**: 自动识别输入框和文本区域，允许正常文本操作
- **用户体验**: 在保护内容的同时，确保表单输入等基本功能不受影响
- **剪贴板集成**: 与剪贴板工具函数库协同工作，实现完整的内容管理

## 技术实现

### 配置系统

在 `config/copy-settings.ts` 中实现了一个集中式配置系统，用于控制内容保护功能：

```typescript
interface CopySettings {
  /**
   * 是否允许复制内容
   * 默认为 false (禁止复制)
   */
  allowCopy: boolean;
}

// 默认配置：禁止复制
const copySettings: CopySettings = {
  allowCopy: false
};

/**
 * 获取当前复制设置
 * @returns 当前复制设置
 */
export function getCopySettings(): CopySettings {
  return { ...copySettings };
}

/**
 * 更新复制设置
 * @param settings 要更新的设置
 */
export function updateCopySettings(settings: Partial<CopySettings>): void {
  Object.assign(copySettings, settings);
}
```

### 保护机制

在 `utils/prevent-copy.ts` 中实现了完整的内容保护机制，通过以下事件监听器实现：

```typescript
/**
 * 初始化禁止复制功能
 * 在浏览器环境中禁止复制操作
 */
export function initPreventCopy(): void {
  if (typeof window === 'undefined') return;

  // 禁止复制事件
  document.addEventListener('copy', (e) => {
    const { allowCopy } = getCopySettings();
    if (!allowCopy) {
      e.preventDefault();
      console.log('复制功能已禁用');
    }
  });

  // 禁止剪切事件
  document.addEventListener('cut', (e) => {
    const { allowCopy } = getCopySettings();
    if (!allowCopy) {
      e.preventDefault();
      console.log('剪切功能已禁用');
    }
  });

  // 禁止右键菜单
  document.addEventListener('contextmenu', (e) => {
    const { allowCopy } = getCopySettings();
    if (!allowCopy) {
      e.preventDefault();
      console.log('右键菜单已禁用');
    }
  });

  // 禁止选择文本
  document.addEventListener('selectstart', (e) => {
    const { allowCopy } = getCopySettings();
    if (!allowCopy) {
      const target = e.target as HTMLElement;
      // 允许在输入框和文本区域中选择文本
      if (
        target.tagName !== 'INPUT' && 
        target.tagName !== 'TEXTAREA' && 
        !(target.getAttribute('contenteditable') === 'true')
      ) {
        e.preventDefault();
        console.log('文本选择已禁用');
      }
    }
  });
}
```

### 智能文本选择控制

系统智能识别输入框和文本区域，允许在这些元素中进行正常的文本选择操作：

```typescript
// 禁止选择文本
document.addEventListener('selectstart', (e) => {
  const { allowCopy } = getCopySettings();
  if (!allowCopy) {
    const target = e.target as HTMLElement;
    // 允许在输入框和文本区域中选择文本
    if (
      target.tagName !== 'INPUT' && 
      target.tagName !== 'TEXTAREA' && 
      !(target.getAttribute('contenteditable') === 'true')
    ) {
      e.preventDefault();
      console.log('文本选择已禁用');
    }
  }
});
```

## 与剪贴板工具的集成

内容保护功能与剪贴板工具函数库 (`utils/clipboard-utils.ts`) 协同工作：

```typescript
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 检查是否允许复制
  const { allowCopy } = getCopySettings();
  if (!allowCopy) {
    console.log('复制功能已禁用')
    return false
  }
  
  // 执行复制操作...
}
```

## 使用方法

### 初始化保护功能

在应用入口文件（如 `app/layout.tsx` 或 `pages/_app.tsx`）中初始化保护功能：

```typescript
import { initPreventCopy } from '@/utils/prevent-copy';

// 在组件挂载时初始化
useEffect(() => {
  initPreventCopy();
}, []);
```

### 动态控制保护状态

可以根据需要动态更新保护设置：

```typescript
import { updateCopySettings } from '@/config/copy-settings';

// 允许复制
updateCopySettings({ allowCopy: true });

// 禁止复制
updateCopySettings({ allowCopy: false });
```

## 应用场景

- **内容保护**: 防止用户未经授权复制、剪切或选择应用中的内容
- **版权保护**: 保护知识产权和版权内容
- **数据安全**: 防止敏感数据被轻易复制和传播
- **用户体验**: 在保护内容的同时，确保表单输入等基本功能不受影响

## 注意事项

1. **用户体验**: 虽然内容保护功能可以有效防止复制，但可能会影响用户体验，建议根据实际需求谨慎使用
2. **技术限制**: 该功能主要通过前端JavaScript实现，技术熟练的用户仍可通过浏览器开发工具等方式绕过限制
3. **输入框兼容**: 系统已针对输入框和文本区域做了特殊处理，确保用户可以在这些元素中正常选择和编辑文本
4. **配置灵活性**: 通过集中式配置系统，可以根据不同场景灵活控制保护功能的启用状态

## 未来优化方向

1. **水印保护**: 结合水印功能，在复制内容时自动添加水印信息
2. **选择性保护**: 支持对特定DOM元素或内容区域进行保护，而不是全局控制
3. **复制次数限制**: 实现复制次数限制功能，允许用户在特定时间段内复制有限次数
4. **复制内容追踪**: 添加复制内容的追踪功能，记录复制操作的来源和内容
5. **自定义提示**: 当用户尝试复制被保护内容时，显示自定义提示信息