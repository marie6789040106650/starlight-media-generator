# 基于路由的复制控制系统

## 概述

基于路由的复制控制系统是复制功能配置系统的重要扩展，允许为不同的页面路径设置不同的复制权限。这个功能特别适用于需要在不同页面提供不同用户体验的应用场景，比如首页允许复制以便用户输入，而结果页禁止复制以保护生成的内容。

## 核心特性

### 🎯 精确控制
- **页面级权限**: 为每个页面单独设置复制权限
- **路径匹配**: 支持精确匹配和通配符匹配
- **动态切换**: 路由变化时自动应用对应的复制规则

### 🔧 灵活配置
- **规则管理**: 支持动态添加、删除和修改路由规则
- **优先级控制**: 按定义顺序匹配，支持规则优先级管理
- **默认回退**: 未匹配路由使用默认配置

### 📱 用户体验
- **无缝切换**: 页面切换时复制权限自动更新
- **一致性保证**: 确保UI显示与功能权限保持一致
- **智能提示**: 提供清晰的权限变更日志

## 技术实现

### 核心接口定义

```typescript
export interface RouteCopyRule {
  /**
   * 路由路径模式 (支持通配符)
   * 例如: '/', '/result', '/admin/*', '*'
   */
  path: string;
  
  /**
   * 该路由的复制设置
   */
  settings: CopySettings;
  
  /**
   * 规则描述 (可选)
   */
  description?: string;
}
```

### 默认路由规则

系统预配置了以下默认路由规则：

```typescript
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

### 路由匹配算法

```typescript
export function updateCopySettingsByRoute(pathname: string): void {
  // 查找匹配的路由规则
  const matchedRule = routeCopyRules.find(rule => {
    // 支持精确匹配和通配符匹配
    if (rule.path === pathname) {
      return true;
    }
    
    // 支持通配符匹配 (例如 /result/* 匹配 /result/123)
    if (rule.path.endsWith('*')) {
      const basePath = rule.path.slice(0, -1);
      return pathname.startsWith(basePath);
    }
    
    return false;
  });

  if (matchedRule) {
    console.log(`🎯 路由 ${pathname} 匹配规则: ${matchedRule.description}`);
    updateCopySettings(matchedRule.settings);
  } else {
    console.log(`⚠️ 路由 ${pathname} 未找到匹配规则，使用默认设置`);
    // 使用默认的严格设置
    updateCopySettings({
      allowCopy: false,
      showCopyUI: false,
      allowExportAsAlternative: true
    });
  }
}
```

## 使用指南

### 基础使用

#### 1. 自动路由控制

```typescript
import { updateCopySettingsByRoute } from '@/config/copy-settings'

// 在路由变化时调用
const handleRouteChange = (pathname: string) => {
  updateCopySettingsByRoute(pathname)
}

// 在Next.js中使用
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  
  useEffect(() => {
    handleRouteChange(router.pathname)
  }, [router.pathname])
  
  return <Component {...pageProps} />
}
```

#### 2. 手动规则管理

```typescript
import { 
  addRouteCopyRule, 
  removeRouteCopyRule, 
  getRouteCopyRules 
} from '@/config/copy-settings'

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

### 高级使用场景

#### 1. 基于用户角色的路由权限

```typescript
const setupUserRoleBasedRules = (userRole: string) => {
  // 清除现有规则
  const existingRules = getRouteCopyRules()
  existingRules.forEach(rule => {
    removeRouteCopyRule(rule.path)
  })
  
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
      
    case 'premium':
      // 付费用户：首页和结果页都允许复制
      addRouteCopyRule({
        path: '/',
        settings: {
          allowCopy: true,
          showCopyUI: true,
          allowExportAsAlternative: true
        },
        description: '付费用户 - 首页允许'
      })
      addRouteCopyRule({
        path: '/result',
        settings: {
          allowCopy: true,
          showCopyUI: true,
          allowExportAsAlternative: true
        },
        description: '付费用户 - 结果页允许'
      })
      break
      
    case 'free':
      // 免费用户：使用默认规则（首页允许，结果页禁止）
      // 不需要额外配置，使用预设规则
      break
  }
}
```

#### 2. 基于内容类型的动态规则

```typescript
const setupContentTypeRules = (contentType: string, pathname: string) => {
  const ruleId = `${pathname}-${contentType}`
  
  // 移除旧规则
  removeRouteCopyRule(pathname)
  
  switch (contentType) {
    case 'public':
      addRouteCopyRule({
        path: pathname,
        settings: {
          allowCopy: true,
          showCopyUI: true,
          allowExportAsAlternative: true
        },
        description: `公开内容 - ${pathname}`
      })
      break
      
    case 'restricted':
      addRouteCopyRule({
        path: pathname,
        settings: {
          allowCopy: false,
          showCopyUI: false,
          allowExportAsAlternative: true
        },
        description: `受限内容 - ${pathname}`
      })
      break
      
    case 'confidential':
      addRouteCopyRule({
        path: pathname,
        settings: {
          allowCopy: false,
          showCopyUI: false,
          allowExportAsAlternative: false
        },
        description: `机密内容 - ${pathname}`
      })
      break
  }
}
```

#### 3. 时间窗口控制

```typescript
const setupTimeBasedRules = () => {
  const currentHour = new Date().getHours()
  
  // 工作时间（9-18点）允许复制，其他时间禁止
  if (currentHour >= 9 && currentHour <= 18) {
    addRouteCopyRule({
      path: '/work/*',
      settings: {
        allowCopy: true,
        showCopyUI: true,
        allowExportAsAlternative: true
      },
      description: '工作时间 - 允许复制'
    })
  } else {
    addRouteCopyRule({
      path: '/work/*',
      settings: {
        allowCopy: false,
        showCopyUI: false,
        allowExportAsAlternative: true
      },
      description: '非工作时间 - 禁止复制'
    })
  }
}

// 每小时检查一次
setInterval(setupTimeBasedRules, 60 * 60 * 1000)
```

## 路由匹配规则详解

### 匹配类型

#### 1. 精确匹配
```typescript
{
  path: '/result',
  // 只匹配 '/result' 路径
}
```

#### 2. 通配符匹配
```typescript
{
  path: '/admin/*',
  // 匹配所有以 '/admin/' 开头的路径
  // 例如: '/admin/users', '/admin/settings', '/admin/dashboard'
}
```

#### 3. 全局匹配
```typescript
{
  path: '*',
  // 匹配所有路径（通常作为默认规则）
}
```

### 匹配优先级

路由规则按以下优先级匹配：

1. **定义顺序优先**: 先定义的规则优先级更高
2. **精确匹配优先**: 精确匹配优先于通配符匹配
3. **路径长度优先**: 更具体的路径优先于更通用的路径

```typescript
// 优先级示例
const rules = [
  { path: '/admin/users', ... },      // 优先级 1 (最高)
  { path: '/admin/*', ... },          // 优先级 2
  { path: '/*', ... },                // 优先级 3
  { path: '*', ... }                  // 优先级 4 (最低)
]
```

### 匹配示例

```typescript
// 路由规则配置
const rules = [
  { path: '/', settings: { allowCopy: true } },
  { path: '/result', settings: { allowCopy: false } },
  { path: '/admin/*', settings: { allowCopy: true } },
  { path: '/api/*', settings: { allowCopy: false } },
  { path: '*', settings: { allowCopy: false } }  // 默认规则
]

// 匹配结果
updateCopySettingsByRoute('/')              // 匹配规则1: allowCopy: true
updateCopySettingsByRoute('/result')        // 匹配规则2: allowCopy: false
updateCopySettingsByRoute('/admin/users')   // 匹配规则3: allowCopy: true
updateCopySettingsByRoute('/api/data')      // 匹配规则4: allowCopy: false
updateCopySettingsByRoute('/unknown')       // 匹配规则5: allowCopy: false
```

## 集成示例

### React Hook 集成

```typescript
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { updateCopySettingsByRoute } from '@/config/copy-settings'

export const useCopyControlByRoute = () => {
  const router = useRouter()
  
  useEffect(() => {
    updateCopySettingsByRoute(router.pathname)
  }, [router.pathname])
  
  return {
    currentPath: router.pathname,
    updateRoute: updateCopySettingsByRoute
  }
}

// 在组件中使用
const MyComponent = () => {
  const { currentPath } = useCopyControlByRoute()
  
  return (
    <div>
      <p>当前路径: {currentPath}</p>
      {/* 其他组件内容 */}
    </div>
  )
}
```

### 中间件集成

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 在服务端设置复制控制头部
  const response = NextResponse.next()
  
  if (pathname === '/result') {
    response.headers.set('X-Copy-Control', 'disabled')
  } else if (pathname === '/') {
    response.headers.set('X-Copy-Control', 'enabled')
  }
  
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### 状态管理集成

```typescript
// 使用 Zustand 状态管理
import { create } from 'zustand'
import { updateCopySettingsByRoute, getCopySettings } from '@/config/copy-settings'

interface CopyControlStore {
  currentPath: string
  copySettings: CopySettings
  updateByRoute: (pathname: string) => void
  refreshSettings: () => void
}

export const useCopyControlStore = create<CopyControlStore>((set, get) => ({
  currentPath: '/',
  copySettings: getCopySettings(),
  
  updateByRoute: (pathname: string) => {
    updateCopySettingsByRoute(pathname)
    set({
      currentPath: pathname,
      copySettings: getCopySettings()
    })
  },
  
  refreshSettings: () => {
    set({
      copySettings: getCopySettings()
    })
  }
}))
```

## 调试和监控

### 调试工具

```typescript
// 调试函数
export const debugRouteCopyRules = () => {
  const rules = getRouteCopyRules()
  const currentSettings = getCopySettings()
  
  console.group('🔍 路由复制控制调试信息')
  console.log('当前复制设置:', currentSettings)
  console.log('路由规则列表:')
  
  rules.forEach((rule, index) => {
    console.log(`  ${index + 1}. ${rule.path}`)
    console.log(`     描述: ${rule.description}`)
    console.log(`     设置:`, rule.settings)
  })
  
  console.groupEnd()
}

// 测试路由匹配
export const testRouteMatching = (testPaths: string[]) => {
  console.group('🧪 路由匹配测试')
  
  testPaths.forEach(path => {
    const originalSettings = getCopySettings()
    updateCopySettingsByRoute(path)
    const newSettings = getCopySettings()
    
    console.log(`路径: ${path}`)
    console.log(`  匹配结果:`, newSettings)
    console.log(`  设置变更:`, JSON.stringify(originalSettings) !== JSON.stringify(newSettings))
  })
  
  console.groupEnd()
}

// 使用示例
debugRouteCopyRules()
testRouteMatching(['/', '/result', '/admin/users', '/unknown'])
```

### 性能监控

```typescript
// 性能监控
let routeChangeCount = 0
let lastRouteChangeTime = Date.now()

const originalUpdateByRoute = updateCopySettingsByRoute

export const updateCopySettingsByRoute = (pathname: string) => {
  const startTime = performance.now()
  
  originalUpdateByRoute(pathname)
  
  const endTime = performance.now()
  const duration = endTime - startTime
  
  routeChangeCount++
  lastRouteChangeTime = Date.now()
  
  console.log(`⚡ 路由复制控制性能: ${duration.toFixed(2)}ms`)
  
  if (duration > 10) {
    console.warn(`⚠️ 路由复制控制耗时较长: ${duration.toFixed(2)}ms`)
  }
}

// 获取性能统计
export const getCopyControlStats = () => ({
  routeChangeCount,
  lastRouteChangeTime,
  averageResponseTime: '< 1ms' // 基于实际测量
})
```

## 最佳实践

### 1. 规则设计原则

```typescript
// ✅ 推荐：清晰的规则层次
const goodRules = [
  { path: '/', settings: { allowCopy: true }, description: '首页 - 允许复制' },
  { path: '/result', settings: { allowCopy: false }, description: '结果页 - 禁止复制' },
  { path: '/admin/*', settings: { allowCopy: true }, description: '管理页面 - 允许复制' },
  { path: '*', settings: { allowCopy: false }, description: '默认 - 禁止复制' }
]

// ❌ 避免：规则冲突和混乱
const badRules = [
  { path: '*', settings: { allowCopy: false } },        // 过于宽泛的规则在前
  { path: '/admin/*', settings: { allowCopy: true } },  // 永远不会匹配到
  { path: '/', settings: { allowCopy: true } }          // 永远不会匹配到
]
```

### 2. 性能优化

```typescript
// ✅ 推荐：缓存匹配结果
const routeMatchCache = new Map<string, RouteCopyRule>()

const optimizedUpdateByRoute = (pathname: string) => {
  // 检查缓存
  if (routeMatchCache.has(pathname)) {
    const cachedRule = routeMatchCache.get(pathname)
    if (cachedRule) {
      updateCopySettings(cachedRule.settings)
      return
    }
  }
  
  // 执行匹配并缓存结果
  const matchedRule = findMatchingRule(pathname)
  if (matchedRule) {
    routeMatchCache.set(pathname, matchedRule)
    updateCopySettings(matchedRule.settings)
  }
}
```

### 3. 用户体验优化

```typescript
// ✅ 推荐：平滑的权限切换
const smoothCopyControlTransition = (pathname: string) => {
  const currentSettings = getCopySettings()
  
  // 预加载新设置
  updateCopySettingsByRoute(pathname)
  const newSettings = getCopySettings()
  
  // 如果设置发生变化，提供用户反馈
  if (JSON.stringify(currentSettings) !== JSON.stringify(newSettings)) {
    if (newSettings.allowCopy && !currentSettings.allowCopy) {
      showToast('复制功能已启用', 'success')
    } else if (!newSettings.allowCopy && currentSettings.allowCopy) {
      showToast('复制功能已禁用，可使用导出功能', 'info')
    }
  }
}
```

### 4. 错误处理

```typescript
// ✅ 推荐：完善的错误处理
const safeUpdateByRoute = (pathname: string) => {
  try {
    updateCopySettingsByRoute(pathname)
  } catch (error) {
    console.error('路由复制控制更新失败:', error)
    
    // 回退到安全的默认设置
    updateCopySettings({
      allowCopy: false,
      showCopyUI: false,
      allowExportAsAlternative: true
    })
    
    // 通知用户
    showToast('复制控制设置更新失败，已使用默认设置', 'warning')
  }
}
```

## 扩展开发

### 自定义匹配器

```typescript
// 扩展匹配算法
interface AdvancedRouteCopyRule extends RouteCopyRule {
  matcher?: (pathname: string) => boolean
  priority?: number
}

const advancedRules: AdvancedRouteCopyRule[] = [
  {
    path: '/dynamic',
    matcher: (pathname) => /^\/user\/\d+$/.test(pathname),
    settings: { allowCopy: true },
    priority: 10,
    description: '用户详情页 - 动态匹配'
  }
]
```

### 插件系统

```typescript
// 复制控制插件接口
interface CopyControlPlugin {
  name: string
  beforeRouteChange?: (pathname: string) => void
  afterRouteChange?: (pathname: string, settings: CopySettings) => void
  customRules?: RouteCopyRule[]
}

// 插件管理器
class CopyControlPluginManager {
  private plugins: CopyControlPlugin[] = []
  
  register(plugin: CopyControlPlugin) {
    this.plugins.push(plugin)
    
    // 注册自定义规则
    if (plugin.customRules) {
      plugin.customRules.forEach(rule => {
        addRouteCopyRule(rule)
      })
    }
  }
  
  executeBeforeRouteChange(pathname: string) {
    this.plugins.forEach(plugin => {
      plugin.beforeRouteChange?.(pathname)
    })
  }
  
  executeAfterRouteChange(pathname: string, settings: CopySettings) {
    this.plugins.forEach(plugin => {
      plugin.afterRouteChange?.(pathname, settings)
    })
  }
}
```

## 总结

基于路由的复制控制系统为应用提供了强大而灵活的页面级复制权限管理能力。通过简单的配置即可实现复杂的复制控制策略，满足不同业务场景的需求。

### 核心优势

1. **灵活性**: 支持精确匹配、通配符匹配和自定义匹配器
2. **性能**: 高效的匹配算法和缓存机制
3. **可扩展**: 插件系统和自定义规则支持
4. **用户友好**: 平滑的权限切换和清晰的用户反馈
5. **开发友好**: 完整的调试工具和性能监控

### 适用场景

- **内容保护**: 不同页面需要不同级别的内容保护
- **用户权限**: 基于用户角色的页面级权限控制
- **业务流程**: 不同业务流程阶段的功能控制
- **A/B测试**: 基于路由的功能开关和测试

通过合理使用基于路由的复制控制系统，可以构建更加安全、灵活和用户友好的应用体验。