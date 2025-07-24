# 悬浮目录组件使用指南

## 功能概述

悬浮目录组件（FloatingToc）提供了一个可展开/折叠的目录导航功能，支持：

- 🎯 自动解析Markdown或HTML内容中的标题
- 📱 响应式设计，适配移动端
- 🎨 平滑的展开/折叠动画
- 🔗 点击标题跳转到对应位置
- 👆 点击外部区域自动折叠
- 🎨 美观的UI设计和悬停效果

## 快速开始

### 1. 基础使用

```tsx
import { FloatingToc } from '@/components/FloatingToc';

function MyPage() {
  const markdownContent = `
# 标题1
## 标题2
### 标题3
  `;

  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
      <FloatingToc content={markdownContent} />
    </div>
  );
}
```

### 2. 与Markdown渲染器结合使用

```tsx
import { MarkdownWithToc } from '@/components/MarkdownWithToc';

function MyPage() {
  const markdownContent = `
# 我的文档
## 第一章
### 1.1 介绍
## 第二章
### 2.1 实现
  `;

  return (
    <MarkdownWithToc 
      content={markdownContent}
      className="my-custom-class"
    />
  );
}
```

## 组件API

### FloatingToc Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| content | string | - | Markdown或HTML内容 |
| className | string | '' | 自定义CSS类名 |

### MarkdownWithToc Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| content | string | - | Markdown内容 |
| className | string | '' | 自定义CSS类名 |

## 样式定制

### 1. 引入样式文件

```tsx
import '@/styles/floating-toc.css';
```

### 2. 自定义样式

```css
/* 自定义悬浮按钮颜色 */
.floating-toc-button {
  background-color: #your-color;
}

/* 自定义目录面板样式 */
.floating-toc-panel {
  background-color: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
}

/* 自定义目录项样式 */
.toc-item-level-1 {
  font-weight: 600;
  color: #1f2937;
}
```

## 高级配置

### 1. 自定义标题ID生成

组件会自动生成与Markdown渲染器一致的标题ID。如果需要自定义ID生成逻辑，可以修改 `generateHeadingId` 函数。

### 2. 响应式断点

组件内置了响应式设计：

- 桌面端：宽度320px
- 平板端：宽度280px  
- 移动端：宽度260px

### 3. 动画配置

可以通过CSS变量调整动画效果：

```css
.animate-in {
  animation-duration: 300ms; /* 调整动画时长 */
}
```

## 最佳实践

### 1. 内容结构

确保Markdown内容有清晰的标题层级：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
```

### 2. 性能优化

- 对于长文档，考虑使用虚拟滚动
- 避免在目录项过多时影响性能

### 3. 用户体验

- 保持标题简洁明了
- 避免标题层级跳跃（如从h1直接到h3）
- 确保标题内容有意义

## 故障排除

### 1. 目录不显示

检查内容是否包含有效的标题：

```tsx
// ✅ 正确
const content = `
# 标题1
## 标题2
`;

// ❌ 错误 - 没有标题
const content = `
普通文本内容
`;
```

### 2. 跳转不工作

确保渲染的HTML包含正确的ID：

```html
<!-- ✅ 正确 -->
<h1 id="heading-0-title">标题</h1>

<!-- ❌ 错误 - 缺少ID -->
<h1>标题</h1>
```

### 3. 样式问题

确保引入了样式文件：

```tsx
import '@/styles/floating-toc.css';
```

## 示例项目

查看完整示例：`examples/floating-toc-demo.tsx`

## 技术支持

如有问题，请检查：

1. 是否正确引入组件和样式
2. 内容格式是否正确
3. 浏览器控制台是否有错误信息
4. 标题ID是否正确生成