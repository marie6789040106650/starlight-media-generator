/**
 * Markdown 渲染器完整功能测试页面
 */

"use client"

import React, { useState } from 'react';
import { MarkdownRenderer } from '../../components/markdown-renderer';
import { EnhancedMarkdownRenderer } from '../../components/enhanced-markdown-renderer';
import { PaginatedMarkdownRenderer } from '../../components/paginated-markdown-renderer';

const MarkdownTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'full' | 'paginated'>('full');

  // 基础 Markdown 示例
  const basicMarkdown = `
![基础功能Banner](https://via.placeholder.com/1200x200/10B981/FFFFFF?text=Basic+Markdown+Features "基础功能Banner图片")

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

  // 高级 Markdown 示例
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

![Banner图片示例](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=Banner+Image+Full+Width "这是一个全宽度的Banner图片")

## 🎯 所有支持的语法

### 1. 标题层级

# 一级标题
## 二级标题  
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

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

### 3. 代码和语法高亮

\`\`\`javascript
// JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
\`\`\`

### 4. 表格功能

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  |   内容2   |  内容3 |
| 长内容 |   短内容   |  中等内容 |
| **粗体** | *斜体* | \`代码\` |

### 5. 列表功能

#### 无序列表
- 项目 1
* 项目 2  
+ 项目 3
  - 嵌套项目
    - 深层嵌套

#### 有序列表
1. 第一项
2. 第二项
   1. 嵌套有序项
   2. 另一个嵌套项
3. 第三项

#### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务

### 6. 引用和嵌套

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

### 7. 链接和图片

#### 内联链接
[链接文本](https://example.com "可选标题")

#### 图片
![图片描述](https://via.placeholder.com/300x200 "图片标题")

### 8. 脚注系统

这是一个脚注示例[^1]，还有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含更多信息

### 9. Emoji 表情

表情符号：:smile: :heart: :thumbsup: :rocket: :fire: :star:

### 10. 分隔线

---

这就是完整的 Markdown 功能展示！🎉
`;

  // 分页测试示例 - 专门设计用于测试智能分页功能
  const paginatedMarkdown = `
![分页测试Banner](https://via.placeholder.com/1200x250/8B5CF6/FFFFFF?text=Paginated+Markdown+Test "分页测试Banner图片")

# 智能分页测试文档

这个文档专门用于测试Markdown的智能分页功能，包含各种可能影响分页的元素。

## 第一章：基础内容测试

这是第一章的内容。我们需要足够的文本来测试分页功能。Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### 1.1 子章节测试

这是一个子章节，用于测试标题是否会被孤立在页面末尾。

---

## 第二章：列表和代码测试

### 2.1 无序列表测试

- 这是第一个列表项，包含较长的文本内容，用于测试列表项是否会被不当分页
- 第二个列表项
  - 嵌套列表项 1
  - 嵌套列表项 2
  - 嵌套列表项 3
- 第三个列表项
- 第四个列表项

### 2.2 有序列表测试

1. 第一个有序列表项，同样包含较长的文本内容
2. 第二个有序列表项
   1. 嵌套有序列表项 1
   2. 嵌套有序列表项 2
3. 第三个有序列表项

### 2.3 代码块测试

下面是一个JavaScript代码块，不应该被分页打断：

\`\`\`javascript
function smartPagination(content, pageSize) {
  const lines = content.split('\\n');
  const pages = [];
  let currentPage = [];
  let currentSize = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineType = getLineType(line);
    
    // 检查是否为markdown标识符
    if (isMarkdownSymbol(line)) {
      // 特殊处理逻辑
      handleMarkdownSymbol(line, currentPage);
    } else {
      // 正常添加内容
      currentPage.push(line);
      currentSize += line.length;
    }
    
    // 检查是否需要分页
    if (shouldBreakPage(currentSize, pageSize, lineType)) {
      pages.push(currentPage);
      currentPage = [];
      currentSize = 0;
    }
  }
  
  return pages;
}
\`\`\`

---

## 第三章：引用和表格测试

### 3.1 引用块测试

> 这是一个引用块，用于测试引用内容是否会被不当分页。
> 
> 引用块应该保持完整性，不应该在中间被分页打断。
> 
> > 这是嵌套引用，同样需要保持完整。
> > 
> > 嵌套引用的内容也很重要。

### 3.2 表格测试

下面是一个表格，不应该被分页打断：

| 功能特性 | 实现状态 | 优先级 | 备注说明 |
|:---------|:--------:|:------:|:---------|
| 智能分页 | ✅ 已完成 | 高 | 核心功能 |
| 标题保护 | ✅ 已完成 | 高 | 避免孤立标题 |
| 列表完整性 | ✅ 已完成 | 中 | 保持列表连贯 |
| 代码块保护 | ✅ 已完成 | 高 | 代码不可分割 |
| 引用块保护 | ✅ 已完成 | 中 | 保持引用完整 |
| 表格保护 | ✅ 已完成 | 中 | 表格不可分割 |

---

## 第四章：特殊情况测试

### 4.1 连续分隔线测试

---

***

___

这些分隔线应该被正确处理，不会影响分页逻辑。

### 4.2 空行和标识符测试

下面有一些空行和markdown标识符：



### 

#### 

##### 

这些空的标题标识符应该被忽略。

### 4.3 混合内容测试

这是一个包含多种元素的复杂段落：

1. **粗体文本**和*斜体文本*
2. \`行内代码\`和[链接](https://example.com)
3. 上标H~2~O和下标E=mc^2^

> 引用中的列表：
> 1. 引用列表项1
> 2. 引用列表项2
> 3. 引用列表项3

---

## 第五章：长内容测试

这一章包含大量文本，用于测试长内容的分页处理。

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

### 5.1 技术细节

分页算法需要考虑以下因素：

- **行高计算**：每行的实际渲染高度
- **元素类型**：标题、段落、列表、代码等
- **语义完整性**：相关内容应该保持在一起
- **视觉连贯性**：避免突兀的分页点

### 5.2 实现挑战

1. **动态高度计算**：不同类型的内容有不同的行高
2. **上下文感知**：需要理解markdown的语义结构
3. **性能优化**：大文档的分页计算需要高效
4. **用户体验**：分页应该自然流畅

---

## 结论

这个测试文档涵盖了各种可能影响分页的markdown元素，通过这些测试可以验证智能分页算法的正确性和有效性。

**测试要点总结：**

- ✅ 标题不会孤立在页面末尾
- ✅ 分隔线与后续内容保持在同一页
- ✅ 列表项保持连贯性
- ✅ 代码块不会被分页打断
- ✅ 引用块保持完整
- ✅ 表格不会被分割
- ✅ 空的markdown标识符被正确忽略

🎉 分页测试完成！
`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Markdown 渲染器完整功能测试
      </h1>

      {/* 更新说明 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600">✅</span>
          <h2 className="text-lg font-semibold text-green-800">分页显示问题已修复</h2>
        </div>
        <p className="text-green-700 text-sm">
          现在所有 Markdown 内容都能完整显示，不再受到高度限制。源码部分采用可折叠设计，节省页面空间。
        </p>
      </div>

      {/* 标签切换 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          {(['basic', 'advanced', 'full', 'paginated'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {tab === 'basic' && '基础功能'}
              {tab === 'advanced' && '高级功能'}
              {tab === 'full' && '完整功能'}
              {tab === 'paginated' && '智能分页'}
            </button>
          ))}
        </div>
      </div>

      {/* 基础功能测试 */}
      {activeTab === 'basic' && (
        <div className="space-y-8">
          {/* 源码显示 - 可折叠 */}
          <div>
            <details className="group">
              <summary className="cursor-pointer text-xl font-semibold mb-4 hover:text-blue-600 transition-colors">
                📝 Markdown 源码 (点击展开/收起)
              </summary>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-80 mt-4">
                <code>{basicMarkdown}</code>
              </pre>
            </details>
          </div>

          {/* 渲染结果 - 无高度限制 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">🎨 渲染结果</h2>
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

      {/* 高级功能测试 */}
      {activeTab === 'advanced' && (
        <div className="space-y-8">
          {/* 源码显示 - 可折叠 */}
          <div>
            <details className="group">
              <summary className="cursor-pointer text-xl font-semibold mb-4 hover:text-blue-600 transition-colors">
                📝 Markdown 源码 (点击展开/收起)
              </summary>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-80 mt-4">
                <code>{advancedMarkdown}</code>
              </pre>
            </details>
          </div>

          {/* 渲染结果 - 无高度限制 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">🎨 渲染结果</h2>
            <div className="border rounded-lg p-4 bg-white">
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
          <div className="space-y-8">
            {/* 源码显示 - 可折叠 */}
            <div>
              <details className="group">
                <summary className="cursor-pointer text-xl font-semibold mb-4 hover:text-blue-600 transition-colors">
                  📝 Markdown 源码 (点击展开/收起)
                </summary>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border max-h-80 mt-4">
                  <code>{fullMarkdown}</code>
                </pre>
              </details>
            </div>

            {/* 完整渲染结果 - 无高度限制 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">🎨 完整渲染结果</h2>
              <div className="border rounded-lg bg-white overflow-hidden">
                {/* Banner图片区域 - 无padding，允许全宽 */}
                <div className="markdown-banner-container">
                  <style jsx>{`
                    .markdown-banner-container :global(.enhanced-markdown-renderer img:first-child) {
                      width: 100%;
                      max-width: none;
                      height: auto;
                      display: block;
                      margin: 0;
                      border-radius: 0;
                    }
                    .markdown-banner-container :global(.enhanced-markdown-renderer) {
                      padding: 0;
                    }
                    .markdown-banner-container :global(.enhanced-markdown-renderer > *:not(:first-child)) {
                      padding-left: 1.5rem;
                      padding-right: 1.5rem;
                    }
                    .markdown-banner-container :global(.enhanced-markdown-renderer > *:last-child) {
                      padding-bottom: 1.5rem;
                    }
                    .markdown-banner-container :global(.enhanced-markdown-renderer h1:first-of-type) {
                      margin-top: 1.5rem;
                    }
                  `}</style>
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

      {/* 智能分页测试 */}
      {activeTab === 'paginated' && (
        <div className="space-y-8">
          {/* 分页功能说明 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              📖 智能分页功能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-purple-700 mb-3">核心特性</h3>
                <ul className="space-y-2 text-purple-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>行高智能计算</strong> - 根据实际渲染高度精确分页</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>孤立标题避免</strong> - 标题不会单独出现在页面末尾</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>内容完整性</strong> - 代码块、表格、引用不会被分割</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✅</span>
                    <span><strong>标识符智能处理</strong> - 忽略空标识符的分页影响</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-700 mb-3">分页规则</h3>
                <ul className="space-y-2 text-purple-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">📏</span>
                    <span><strong>分隔线处理</strong> - <code>---</code> 与后续内容保持同页</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">📝</span>
                    <span><strong>列表连贯性</strong> - 相关列表项尽量保持在同一页</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">💻</span>
                    <span><strong>代码块保护</strong> - 代码块绝不会被分页打断</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">🔗</span>
                    <span><strong>语义关联</strong> - 相关内容保持上下文连贯</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 分页控制面板 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">🎛️ 分页参数控制</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页面高度 (px)
                </label>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  defaultValue="800"
                  className="w-full"
                  onChange={(e) => {
                    // 这里可以添加动态调整页面高度的逻辑
                    console.log('页面高度:', e.target.value);
                  }}
                />
                <span className="text-xs text-gray-500">400px - 1200px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页面宽度 (px)
                </label>
                <input
                  type="range"
                  min="400"
                  max="800"
                  defaultValue="600"
                  className="w-full"
                  onChange={(e) => {
                    console.log('页面宽度:', e.target.value);
                  }}
                />
                <span className="text-xs text-gray-500">400px - 800px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页边距 (px)
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  defaultValue="40"
                  className="w-full"
                  onChange={(e) => {
                    console.log('页边距:', e.target.value);
                  }}
                />
                <span className="text-xs text-gray-500">20px - 80px</span>
              </div>
            </div>
          </div>

          {/* 分页渲染器 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">📄 智能分页演示</h2>
            <div className="bg-gray-100 p-6 rounded-lg">
              <PaginatedMarkdownRenderer
                content={paginatedMarkdown}
                pageHeight={800}
                pageWidth={600}
                pageMargin={{ top: 40, bottom: 40, left: 40, right: 40 }}
                enableSyntaxHighlight={true}
                enableMath={true}
                showLineNumbers={false}
                onLinkClick={(url) => {
                  console.log('分页模式链接点击:', url);
                  window.open(url, '_blank');
                }}
                onPageChange={(current, total) => {
                  console.log(`页面变化: ${current + 1}/${total}`);
                }}
              />
            </div>
          </div>

          {/* 分页算法说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">
              🧠 分页算法详解
            </h3>
            <div className="space-y-4 text-sm text-blue-700">
              <div>
                <h4 className="font-semibold mb-2">1. 内容解析阶段</h4>
                <p>将Markdown内容按行解析，识别每行的类型（标题、段落、列表、代码等）和语义属性。</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. 高度计算阶段</h4>
                <p>使用隐藏的测量容器，动态计算每行在实际渲染时的高度，考虑字体、行距、边距等因素。</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. 智能分页阶段</h4>
                <p>基于内容类型和高度信息，应用分页规则：</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>检查页面剩余空间是否足够容纳下一行</li>
                  <li>如果不够，检查当前页最后一行是否为标题</li>
                  <li>如果是标题，将标题移到下一页避免孤立</li>
                  <li>忽略空的markdown标识符对分页的影响</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. 渲染优化阶段</h4>
                <p>为每页内容应用适当的CSS样式，确保banner图片全宽显示，代码块语法高亮等。</p>
              </div>
            </div>
          </div>

          {/* 测试用例说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800">
              🧪 测试用例说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <h4 className="font-semibold mb-2">包含的测试场景</h4>
                <ul className="space-y-1">
                  <li>• Banner图片全宽显示测试</li>
                  <li>• 多级标题分页测试</li>
                  <li>• 长列表分页处理测试</li>
                  <li>• 代码块完整性测试</li>
                  <li>• 引用块连贯性测试</li>
                  <li>• 表格不分割测试</li>
                  <li>• 分隔线位置测试</li>
                  <li>• 混合内容分页测试</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">验证要点</h4>
                <ul className="space-y-1">
                  <li>• 标题不会孤立在页面底部</li>
                  <li>• 代码块不会被分页打断</li>
                  <li>• 列表项保持逻辑连贯性</li>
                  <li>• 分隔线与内容的关联性</li>
                  <li>• 空标识符不影响分页逻辑</li>
                  <li>• 页面高度计算的准确性</li>
                  <li>• 分页导航的流畅性</li>
                  <li>• 整体阅读体验的连贯性</li>
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

export default MarkdownTestPage;