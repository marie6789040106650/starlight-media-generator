# Markdown 渲染器文档

## 概述

这是一个功能完整的 Markdown 渲染器，支持所有标准 Markdown 语法和常用扩展功能。它可以将 Markdown 文本转换为 HTML，并提供了丰富的配置选项和安全特性。

## 特性

### 🎯 核心功能
- ✅ 支持所有标准 Markdown 语法
- ✅ 扩展语法支持 (表格、任务列表、删除线等)
- ✅ 数学公式渲染 (LaTeX 语法)
- ✅ 代码语法高亮
- ✅ Emoji 表情支持
- ✅ 脚注功能
- ✅ HTML 标签支持

### 🔒 安全特性
- ✅ XSS 防护
- ✅ HTML 清理和过滤
- ✅ 安全链接处理
- ✅ 可配置的安全级别

### ⚡ 性能优化
- ✅ 高效的正则表达式引擎
- ✅ 增量渲染支持
- ✅ 内存优化
- ✅ 大文档处理能力

## 安装和导入

```typescript
// 基础渲染函数
import { renderMarkdown } from './lib/markdown-renderer';

// 渲染器类
import { MarkdownRenderer } from './lib/markdown-renderer';

// 预设配置
import { MarkdownPresets } from './lib/markdown-renderer';

// React 组件
import { MarkdownRenderer as ReactMarkdownRenderer } from './components/MarkdownRenderer';
```

## 基础使用

### 快速开始

```typescript
import { renderMarkdown } from './lib/markdown-renderer';

const markdown = `
# 标题

这是一个 **粗体** 和 *斜体* 的示例。

- 列表项 1
- 列表项 2

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`;

const html = renderMarkdown(markdown);
console.log(html);
```

### 使用渲染器类

```typescript
import { MarkdownRenderer } from './lib/markdown-renderer';

const renderer = new MarkdownRenderer({
  breaks: true,
  tables: true,
  strikethrough: true,
  tasklists: true,
  footnotes: true,
  math: true,
  emoji: true
});

const html = renderer.render(markdown);
```

## 配置选项

### MarkdownOptions 接口

```typescript
interface MarkdownOptions {
  // 基础选项
  breaks?: boolean;        // 换行符转换为 <br>
  linkify?: boolean;       // 自动链接检测
  typographer?: boolean;   // 智能引号和破折号
  
  // 扩展功能
  tables?: boolean;        // 表格支持
  strikethrough?: boolean; // 删除线
  tasklists?: boolean;     // 任务列表
  footnotes?: boolean;     // 脚注
  highlight?: boolean;     // 代码高亮
  math?: boolean;          // 数学公式
  emoji?: boolean;         // Emoji 支持
  
  // HTML 选项
  html?: boolean;          // 允许 HTML 标签
  xhtmlOut?: boolean;      // 输出 XHTML
  
  // 安全选项
  sanitize?: boolean;      // 清理危险 HTML
}
```

### 预设配置

```typescript
import { MarkdownPresets } from './lib/markdown-renderer';

// 基础配置 - 只支持核心 Markdown 语法
const basicHtml = renderMarkdown(markdown, MarkdownPresets.basic);

// 标准配置 - 支持常用扩展
const standardHtml = renderMarkdown(markdown, MarkdownPresets.standard);

// 完整配置 - 支持所有功能
const fullHtml = renderMarkdown(markdown, MarkdownPresets.full);

// 安全配置 - 适用于用户输入
const safeHtml = renderMarkdown(markdown, MarkdownPresets.safe);
```#
# 支持的语法

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

替代语法：
一级标题
========

二级标题
--------
```

### 文本格式化

```markdown
**粗体** 或 __粗体__
*斜体* 或 _斜体_
***粗斜体*** 或 ___粗斜体___
~~删除线~~
==高亮文本==
上标^2^
下标~2~
`行内代码`
<kbd>Ctrl</kbd>+<kbd>C</kbd>
```

### 列表

```markdown
# 无序列表
- 项目1
* 项目2
+ 项目3
  - 嵌套项目

# 有序列表
1. 第一项
2. 第二项
   1. 嵌套项目

# 任务列表
- [x] 已完成任务
- [ ] 未完成任务
```

### 链接和图片

```markdown
[链接文本](URL "可选标题")
[引用链接][ref]
[ref]: URL "标题"

![图片alt](URL "可选标题")
![引用图片][img-ref]
[img-ref]: URL "标题"

<URL> 自动链接
<email@example.com> 邮箱链接
```

### 代码

```markdown
`行内代码`

```语言
代码块
```

    缩进代码块（4个空格或1个tab）

~~~
波浪线代码块
~~~
```

### 引用

```markdown
> 引用文本
> 
> 多行引用
>> 嵌套引用

> #### 引用中的标题
> - 引用中的列表
> *引用中的格式*
```

### 表格

```markdown
| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容1  | 内容2 | 内容3  |
| 内容4  | 内容5 | 内容6  |
```

### 分隔线

```markdown
---
***
___
- - -
* * *
```

### 脚注

```markdown
文本[^1]

[^1]: 脚注内容
```

### 数学公式

```markdown
# 行内公式
$E = mc^2$

# 块级公式
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$
```

### Emoji

```markdown
:smile: :heart: :thumbsup: :rocket: :fire:
```

### HTML 标签

```markdown
<div>HTML内容</div>
<br>
<hr>
<details>
<summary>折叠标题</summary>
折叠内容
</details>
```

### 转义字符

```markdown
\* 转义星号
\# 转义井号
\[ 转义方括号
\\ 转义反斜杠
```## Rea
ct 组件使用

### 基础组件

```tsx
import { MarkdownRenderer } from './components/MarkdownRenderer';

function MyComponent() {
  const markdown = `
# 标题

这是 **Markdown** 内容。
`;

  return (
    <MarkdownRenderer
      content={markdown}
      preset="standard"
      className="my-markdown"
      style={{ padding: '1rem' }}
    />
  );
}
```

### 组件属性

```tsx
interface MarkdownRendererProps {
  content: string;                    // Markdown 内容
  options?: MarkdownOptions;          // 渲染选项
  preset?: 'basic' | 'standard' | 'full' | 'safe'; // 预设配置
  className?: string;                 // CSS 类名
  style?: React.CSSProperties;        // 内联样式
  enableSyntaxHighlight?: boolean;    // 语法高亮
  enableMath?: boolean;               // 数学公式
  onLinkClick?: (url: string, event: React.MouseEvent) => void; // 链接点击处理
}
```

### 预设组件

```tsx
import { 
  BasicMarkdownRenderer,
  SafeMarkdownRenderer,
  FullMarkdownRenderer 
} from './components/MarkdownRenderer';

// 基础渲染器
<BasicMarkdownRenderer content={markdown} />

// 安全渲染器（用于用户输入）
<SafeMarkdownRenderer content={userInput} />

// 完整功能渲染器
<FullMarkdownRenderer 
  content={markdown}
  enableSyntaxHighlight={true}
  enableMath={true}
  onLinkClick={(url) => window.open(url, '_blank')}
/>
```

### Hook 使用

```tsx
import { useMarkdownRenderer } from './components/MarkdownRenderer';

function MyComponent() {
  const markdown = '# 标题\n\n**粗体文本**';
  const html = useMarkdownRenderer(markdown, { 
    breaks: true, 
    tables: true 
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

## 样式定制

### 默认样式

组件提供了完整的默认样式，包括：

- 标题样式和层级
- 段落和文本格式
- 列表和引用样式
- 代码块和语法高亮
- 表格样式
- 链接和图片样式
- 数学公式样式
- 容器和警告框样式

### 自定义样式

```tsx
import { MarkdownRenderer, defaultMarkdownStyles } from './components/MarkdownRenderer';

// 使用默认样式
<style dangerouslySetInnerHTML={{ __html: defaultMarkdownStyles }} />

// 或者自定义样式
const customStyles = `
.markdown-renderer h1 {
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
}

.markdown-renderer code {
  background-color: #f8f9fa;
  color: #e83e8c;
}
`;

<style dangerouslySetInnerHTML={{ __html: customStyles }} />
<MarkdownRenderer content={markdown} className="custom-markdown" />
```

### CSS 类名

渲染器为不同元素提供了语义化的 CSS 类名：

```css
.markdown-renderer          /* 根容器 */
.markdown-renderer h1-h6    /* 标题 */
.markdown-renderer p        /* 段落 */
.markdown-renderer ul, ol   /* 列表 */
.markdown-renderer blockquote /* 引用 */
.markdown-renderer pre      /* 代码块 */
.markdown-renderer code     /* 行内代码 */
.markdown-renderer table    /* 表格 */
.markdown-renderer a        /* 链接 */
.markdown-renderer img      /* 图片 */
.markdown-renderer hr       /* 分隔线 */
.markdown-renderer del      /* 删除线 */
.markdown-renderer mark     /* 高亮 */
.markdown-renderer kbd      /* 键盘按键 */
.footnotes                  /* 脚注容器 */
.math-block                 /* 数学公式块 */
.math-inline                /* 行内数学公式 */
.container                  /* 容器 */
.container-warning          /* 警告容器 */
.container-info             /* 信息容器 */
.container-tip              /* 提示容器 */
```## 
高级功能

### 数学公式渲染

支持 LaTeX 语法的数学公式：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\sum_{i=1}^{n} x_i = \frac{1}{n} \sum_{i=1}^{n} x_i
$$

矩阵：
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

### 代码语法高亮

支持多种编程语言的语法高亮：

```markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```

```python
def hello():
    print("Hello, World!")
```

```css
.container {
  display: flex;
  justify-content: center;
}
```
```

### 脚注系统

完整的脚注支持：

```markdown
这是一个脚注示例[^1]，还有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含更多信息
```

### 任务列表

交互式任务列表：

```markdown
- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务
  - [ ] 嵌套任务
  - [x] 已完成的嵌套任务
```

### 表格高级功能

支持表格对齐和复杂内容：

```markdown
| 功能 | 状态 | 描述 |
|:-----|:----:|-----:|
| **粗体** | ✅ | 支持文本格式化 |
| `代码` | ✅ | 支持行内代码 |
| [链接](/) | ✅ | 支持链接 |
```

### 容器和警告框

扩展语法支持：

```markdown
::: warning 警告
这是一个警告容器
:::

::: info 信息
这是一个信息容器
:::

::: tip 提示
这是一个提示容器
:::
```

## 安全特性

### XSS 防护

自动过滤危险的 HTML 内容：

```typescript
const userInput = `
<script>alert('XSS')</script>
<div onclick="alert('危险')">点击我</div>
**安全的 Markdown 内容**
`;

// 使用安全模式渲染
const safeHtml = renderMarkdown(userInput, MarkdownPresets.safe);
// <script> 和 onclick 会被过滤，但 Markdown 格式保留
```

### HTML 清理

可配置的 HTML 清理级别：

```typescript
const renderer = new MarkdownRenderer({
  html: true,        // 允许 HTML 标签
  sanitize: true     // 但要清理危险内容
});

// 允许安全的 HTML 标签
const html = renderer.render(`
<div>安全内容</div>
<p>段落内容</p>
<script>alert('这会被移除')</script>
`);
```

### 链接安全

自动处理链接安全：

```typescript
<MarkdownRenderer
  content="[链接](https://example.com)"
  onLinkClick={(url, event) => {
    // 自定义链接处理逻辑
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    event.preventDefault();
  }}
/>
```

## 性能优化

### 大文档处理

针对大文档的优化：

```typescript
// 对于大文档，建议使用流式处理
const renderer = new MarkdownRenderer({
  breaks: false,     // 减少不必要的处理
  linkify: false,    // 如果不需要自动链接检测
  typographer: false // 如果不需要智能标点
});

// 分块处理大文档
function renderLargeDocument(largeMarkdown: string) {
  const chunks = largeMarkdown.split('\n\n'); // 按段落分块
  return chunks.map(chunk => renderer.render(chunk)).join('');
}
```

### 缓存机制

实现渲染结果缓存：

```typescript
const renderCache = new Map<string, string>();

function cachedRender(markdown: string, options?: MarkdownOptions): string {
  const cacheKey = `${markdown}-${JSON.stringify(options)}`;
  
  if (renderCache.has(cacheKey)) {
    return renderCache.get(cacheKey)!;
  }
  
  const result = renderMarkdown(markdown, options);
  renderCache.set(cacheKey, result);
  
  return result;
}
```

### React 性能优化

使用 React.memo 和 useMemo：

```tsx
import React, { memo, useMemo } from 'react';

const OptimizedMarkdownRenderer = memo<MarkdownRendererProps>(({
  content,
  options,
  ...props
}) => {
  const html = useMemo(() => {
    return renderMarkdown(content, options);
  }, [content, options]);

  return (
    <div 
      {...props}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
});
```##
 测试

### 单元测试

运行测试套件：

```bash
npm test tests/markdown-renderer.test.ts
```

### 测试覆盖

测试涵盖以下功能：

- ✅ 所有标准 Markdown 语法
- ✅ 扩展语法功能
- ✅ 边界情况处理
- ✅ 安全特性验证
- ✅ 性能基准测试
- ✅ React 组件测试

### 自定义测试

```typescript
import { renderMarkdown, MarkdownRenderer } from './lib/markdown-renderer';

describe('自定义测试', () => {
  test('特定功能测试', () => {
    const markdown = '**粗体** *斜体*';
    const result = renderMarkdown(markdown);
    
    expect(result).toContain('<strong>粗体</strong>');
    expect(result).toContain('<em>斜体</em>');
  });
});
```

## 故障排除

### 常见问题

#### 1. 数学公式不显示

确保启用了数学公式支持：

```typescript
const renderer = new MarkdownRenderer({
  math: true  // 启用数学公式
});
```

并在页面中引入 KaTeX 样式：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
```

#### 2. 代码高亮不工作

确保启用了代码高亮：

```typescript
const renderer = new MarkdownRenderer({
  highlight: true  // 启用代码高亮
});
```

并引入语法高亮库（如 Prism.js）：

```html
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/prism-core.min.js"></script>
```

#### 3. 表格样式问题

确保包含了表格样式：

```css
.markdown-renderer table {
  border-collapse: collapse;
  width: 100%;
}

.markdown-renderer th,
.markdown-renderer td {
  border: 1px solid #ddd;
  padding: 0.5em 1em;
}
```

#### 4. 链接点击不工作

检查链接点击处理：

```tsx
<MarkdownRenderer
  content={markdown}
  onLinkClick={(url, event) => {
    console.log('链接点击:', url);
    // 确保有适当的处理逻辑
  }}
/>
```

### 调试技巧

#### 1. 启用调试模式

```typescript
const renderer = new MarkdownRenderer({
  // 其他选项...
});

// 查看渲染过程
console.log('原始 Markdown:', markdown);
console.log('渲染结果:', renderer.render(markdown));
```

#### 2. 分步调试

```typescript
// 分步查看渲染过程
const steps = [
  'preprocess',
  'renderHeaders',
  'renderCodeBlocks',
  'renderTables',
  // ... 其他步骤
];

steps.forEach(step => {
  console.log(`${step}:`, renderer[step](markdown));
});
```

#### 3. 性能分析

```typescript
function profileRender(markdown: string) {
  const start = performance.now();
  const result = renderMarkdown(markdown);
  const end = performance.now();
  
  console.log(`渲染耗时: ${end - start}ms`);
  console.log(`内容长度: ${markdown.length} 字符`);
  console.log(`结果长度: ${result.length} 字符`);
  
  return result;
}
```

## 扩展开发

### 自定义渲染器

```typescript
class CustomMarkdownRenderer extends MarkdownRenderer {
  // 重写特定的渲染方法
  protected renderCustomSyntax(text: string): string {
    // 添加自定义语法支持
    return text.replace(/\[\[([^\]]+)\]\]/g, '<span class="custom">$1</span>');
  }
  
  render(markdown: string): string {
    let processed = super.render(markdown);
    processed = this.renderCustomSyntax(processed);
    return processed;
  }
}
```

### 插件系统

```typescript
interface MarkdownPlugin {
  name: string;
  process: (text: string, options: MarkdownOptions) => string;
}

class ExtendableMarkdownRenderer extends MarkdownRenderer {
  private plugins: MarkdownPlugin[] = [];
  
  addPlugin(plugin: MarkdownPlugin) {
    this.plugins.push(plugin);
  }
  
  render(markdown: string): string {
    let result = super.render(markdown);
    
    // 应用所有插件
    this.plugins.forEach(plugin => {
      result = plugin.process(result, this.options);
    });
    
    return result;
  }
}

// 使用插件
const renderer = new ExtendableMarkdownRenderer();
renderer.addPlugin({
  name: 'custom-alerts',
  process: (text) => {
    return text.replace(/\!\!\!(.+?)\!\!\!/g, '<div class="alert">$1</div>');
  }
});
```

## 更新日志

### v1.0.0
- ✅ 初始版本发布
- ✅ 支持所有标准 Markdown 语法
- ✅ 基础扩展功能
- ✅ React 组件支持

### 未来计划
- 🔄 更多语法高亮语言支持
- 🔄 插件系统完善
- 🔄 性能进一步优化
- 🔄 更多预设配置
- 🔄 TypeScript 类型完善

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

---

这个 Markdown 渲染器提供了完整的功能支持和灵活的配置选项，可以满足各种使用场景的需求。如果有任何问题或建议，请随时联系我们。