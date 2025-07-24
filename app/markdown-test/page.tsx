/**
 * Markdown 渲染器完整功能测试页面
 */

"use client"

import React, { useState } from 'react';
import { MarkdownRenderer } from '../../components/markdown-renderer';
import { EnhancedMarkdownRenderer } from '../../components/enhanced-markdown-renderer';

const MarkdownTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'full'>('full');

  // 基础 Markdown 示例
  const basicMarkdown = `
# 基础 Markdown 功能测试

## 文本格式化

这是一个包含 **粗体文本**、*斜体文本* 和 ***粗斜体文本*** 的段落。

还可以使用 ~~删除线~~ 和 ==高亮文本==。

## 列表

### 无序列表
- 项目 1
- 项目 2
  - 嵌套项目 2.1
  - 嵌套项目 2.2
- 项目 3

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套项目 2.1
   2. 嵌套项目 2.2
3. 第三项

### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务

## 链接和图片

[这是一个链接](https://example.com "链接标题")

![图片描述](https://via.placeholder.com/300x200 "图片标题")

## 代码

行内代码：\`console.log("Hello, World!")\`

代码块：
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`
`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Markdown 渲染器完整功能测试
      </h1>
      
      {/* 标签切换 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          {(['basic', 'advanced', 'full'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'basic' && '基础功能'}
              {tab === 'advanced' && '高级功能'}
              {tab === 'full' && '完整功能'}
            </button>
          ))}
        </div>
      </div>

      {/* 基础功能测试 */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Markdown 源码</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border">
              <code>{basicMarkdown}</code>
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">渲染结果</h2>
            <div className="border rounded-lg p-4 bg-white">
              <MarkdownRenderer 
                content={basicMarkdown}
                enableSyntaxHighlight={true}
                enableMath={false}
                showLineNumbers={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownTestPage;
  // 高级
 Markdown 示例
  const advancedMarkdown = `
# 高级 Markdown 功能测试

## 表格

| 功能 | 状态 | 描述 |
|:-----|:----:|-----:|
| **粗体** | ✅ | 支持文本格式化 |
| \`代码\` | ✅ | 支持行内代码 |
| [链接](/) | ✅ | 支持链接 |

## 引用

> 这是一个引用块
> 
> 可以包含多个段落
> 
> > 这是嵌套引用
> > 
> > ### 引用中的标题
> > 
> > - 引用中的列表
> > - 另一个列表项

## 脚注

这是一个脚注示例[^1]，还有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含更多信息

## 定义列表

术语1
: 这是术语1的定义

术语2
: 这是术语2的第一个定义
: 这是术语2的第二个定义

## 水平分隔线

---

## 键盘按键

使用 <kbd>Ctrl</kbd>+<kbd>C</kbd> 复制文本。

## 上标和下标

水的化学式是 H~2~O，爱因斯坦的质能方程是 E = mc^2^。
`;

  // 完整功能示例
  const fullMarkdown = `
# 完整 Markdown 功能展示

## 🎯 所有支持的语法

### 1. 标题层级

# 一级标题
## 二级标题  
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

替代语法标题：

一级标题
========

二级标题
--------

### 2. 文本格式化

**粗体文本** 或 __粗体文本__

*斜体文本* 或 _斜体文本_

***粗斜体*** 或 ___粗斜体___

~~删除线文本~~

==高亮文本==

上标：E = mc^2^

下标：H~2~O

\`行内代码\`

<kbd>Ctrl</kbd>+<kbd>C</kbd>

### 3. 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\\sum_{i=1}^{n} x_i = \\frac{1}{n} \\sum_{i=1}^{n} x_i
$$

复杂公式：
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

### 4. 代码和语法高亮

\`\`\`javascript
// JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

\`\`\`python
# Python 示例
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # 55
\`\`\`

\`\`\`css
/* CSS 示例 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
}
\`\`\`

### 5. 表格功能

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  |   内容2   |  内容3 |
| 长内容 |   短内容   |  中等内容 |
| **粗体** | *斜体* | \`代码\` |
| [链接](/) | ![图片](https://via.placeholder.com/50) | ~~删除~~ |

### 6. 列表功能

#### 无序列表
- 项目 1
* 项目 2  
+ 项目 3
  - 嵌套项目
    - 深层嵌套
      - 更深层嵌套

#### 有序列表
1. 第一项
2. 第二项
   1. 嵌套有序项
   2. 另一个嵌套项
      1. 深层嵌套
3. 第三项

#### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务
  - [ ] 嵌套任务
  - [x] 已完成的嵌套任务

### 7. 引用和嵌套

> 这是一个引用块
> 
> 可以包含多个段落
> 
> > 这是嵌套引用
> > 
> > ### 引用中的标题
> > 
> > - 引用中的列表
> > - 另一个列表项
> > 
> > \`\`\`javascript
> > // 引用中的代码
> > console.log("引用中的代码块");
> > \`\`\`

### 8. 链接和图片

#### 内联链接
[链接文本](https://example.com "可选标题")

#### 引用链接
[引用链接][ref-link]
[ref-link]: https://example.com "引用链接标题"

#### 自动链接
<https://example.com>
<email@example.com>

#### 图片
![图片描述](https://via.placeholder.com/300x200 "图片标题")

#### 引用图片
![引用图片][ref-image]
[ref-image]: https://via.placeholder.com/200x150 "引用图片标题"

### 9. 脚注系统

这是一个脚注示例[^1]，还有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含更多信息

### 10. 定义列表

术语1
: 这是术语1的定义

术语2  
: 这是术语2的第一个定义
: 这是术语2的第二个定义

HTML
: 超文本标记语言

CSS
: 层叠样式表

### 11. 容器和警告框

::: warning 警告
这是一个警告容器
:::

::: info 信息
这是一个信息容器
:::

::: tip 提示
这是一个提示容器
:::

### 12. Emoji 表情

表情符号：:smile: :heart: :thumbsup: :rocket: :fire: :star:

更多表情：:warning: :info: :check: :x: :bulb: :gear:

### 13. HTML 标签支持

<div style="background: #f0f0f0; padding: 1rem; border-radius: 0.5rem;">
这是 HTML div 标签
</div>

<details>
<summary>折叠内容</summary>
这是折叠的内容，点击上面的标题可以展开/折叠。

- 可以包含 Markdown 内容
- **粗体文本**
- \`代码\`
</details>

### 14. 转义字符

\\* 转义星号
\\# 转义井号  
\\[ 转义方括号
\\\\ 转义反斜杠

### 15. 分隔线

---

***

___

- - -

* * *

---

这就是完整的 Markdown 功能展示！🎉
`;     
 {/* 高级功能测试 */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Markdown 源码</h2>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-96">
              <code>{advancedMarkdown}</code>
            </pre>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">渲染结果</h2>
            <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
              <MarkdownRenderer 
                content={advancedMarkdown}
                enableSyntaxHighlight={true}
                enableMath={false}
                showLineNumbers={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 完整功能测试 */}
      {activeTab === 'full' && (
        <div className="space-y-8">
          {/* 功能说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              🚀 完整功能模式
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">基础语法</h3>
                <ul className="space-y-1 text-blue-600">
                  <li>✅ 标题 (ATX 和 Setext)</li>
                  <li>✅ 段落和换行</li>
                  <li>✅ 粗体、斜体、删除线</li>
                  <li>✅ 行内代码和代码块</li>
                  <li>✅ 链接和图片</li>
                  <li>✅ 列表 (有序、无序、任务)</li>
                  <li>✅ 引用和嵌套引用</li>
                  <li>✅ 水平分隔线</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">扩展功能</h3>
                <ul className="space-y-1 text-blue-600">
                  <li>✅ 表格 (支持对齐)</li>
                  <li>✅ 脚注系统</li>
                  <li>✅ 数学公式 (LaTeX)</li>
                  <li>✅ Emoji 表情</li>
                  <li>✅ 语法高亮</li>
                  <li>✅ HTML 标签支持</li>
                  <li>✅ 定义列表</li>
                  <li>✅ 容器 (警告、信息、提示)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">安全特性</h3>
                <ul className="space-y-1 text-blue-600">
                  <li>✅ XSS 防护</li>
                  <li>✅ HTML 清理</li>
                  <li>✅ 安全链接处理</li>
                  <li>✅ 转义字符支持</li>
                  <li>✅ 可配置安全级别</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 渲染结果 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Markdown 源码</h2>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-96">
                <code>{fullMarkdown}</code>
              </pre>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">渲染结果</h2>
              <div className="border rounded-lg p-4 bg-white max-h-96 overflow-auto">
                <EnhancedMarkdownRenderer 
                  content={fullMarkdown}
                  preset="full"
                  enableSyntaxHighlight={true}
                  enableMath={true}
                  showLineNumbers={true}
                  onLinkClick={(url) => {
                    console.log('链接点击:', url);
                    window.open(url, '_blank');
                  }}
                />
              </div>
            </div>
          </div>

          {/* 性能信息 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-800">
              ⚡ 性能特性
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
              <div>
                <h4 className="font-semibold mb-2">渲染优化</h4>
                <ul className="space-y-1">
                  <li>• 高效的正则表达式引擎</li>
                  <li>• 增量渲染支持</li>
                  <li>• 内存优化</li>
                  <li>• 大文档处理能力</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">用户体验</h4>
                <ul className="space-y-1">
                  <li>• 实时预览</li>
                  <li>• 语法高亮</li>
                  <li>• 数学公式渲染</li>
                  <li>• 响应式设计</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">📖 使用说明</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">基础使用</h3>
            <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
              <code>{`import { MarkdownRenderer } from './components/markdown-renderer';

<MarkdownRenderer
  content="# 标题\\n\\n**粗体文本**"
  enableSyntaxHighlight={true}
  enableMath={true}
  showLineNumbers={true}
/>`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">完整功能使用</h3>
            <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
              <code>{`import { EnhancedMarkdownRenderer } from './components/enhanced-markdown-renderer';

<EnhancedMarkdownRenderer
  content={markdownContent}
  preset="full"
  enableSyntaxHighlight={true}
  enableMath={true}
  showLineNumbers={true}
  onLinkClick={(url) => window.open(url, '_blank')}
/>`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};