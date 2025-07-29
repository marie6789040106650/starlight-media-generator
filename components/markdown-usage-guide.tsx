/**
 * Markdown 使用指南组件
 * 展示如何使用各种 Markdown 语法
 */

"use client"

import React, { useState } from 'react';
import { ComprehensiveMarkdown } from './comprehensive-markdown';

const syntaxExamples = {
  headers: {
    title: '标题语法',
    content: `# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

替代语法：

一级标题
========

二级标题
--------`
  },
  
  text: {
    title: '文本格式',
    content: `**粗体文本** 或 __粗体文本__

*斜体文本* 或 _斜体文本_

***粗斜体*** 或 ___粗斜体___

~~删除线文本~~

==高亮文本==

上标：E = mc^2^

下标：H~2~O

\`行内代码\`

<kbd>Ctrl</kbd>+<kbd>C</kbd>`
  },

  lists: {
    title: '列表语法',
    content: `## 无序列表
- 项目 1
* 项目 2
+ 项目 3
  - 嵌套项目

## 有序列表
1. 第一项
2. 第二项
   1. 嵌套项目

## 任务列表
- [x] 已完成任务
- [ ] 未完成任务`
  },

  links: {
    title: '链接和图片',
    content: `## 链接
[内联链接](https://example.com "可选标题")

[引用链接][ref]
[ref]: https://example.com "引用链接标题"

<https://example.com> 自动链接

<email@example.com> 邮箱链接

## 图片
![图片描述](https://via.placeholder.com/300x200 "图片标题")

![引用图片][img-ref]
[img-ref]: https://via.placeholder.com/200x150 "引用图片标题"`
  },

  code: {
    title: '代码语法',
    content: `## 行内代码
使用 \`console.log()\` 输出信息。

## 代码块
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
\`\`\`

## 缩进代码块
    这是缩进代码块
    使用 4 个空格或 1 个 tab`
  },

  tables: {
    title: '表格语法',
    content: `| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  |   内容2   |  内容3 |
| 长内容 |   短内容   |  中等内容 |
| **粗体** | *斜体* | \`代码\` |

简化表格：
列1 | 列2 | 列3
----|-----|----
内容1|内容2|内容3`
  },

  quotes: {
    title: '引用语法',
    content: `> 这是一个引用块
> 
> 可以包含多个段落
> 
> > 这是嵌套引用
> > 
> > ### 引用中的标题
> > 
> > - 引用中的列表
> > - 另一个列表项`
  },

  math: {
    title: '数学公式',
    content: `## 行内公式
爱因斯坦质能方程：$E = mc^2$

## 块级公式
$$
\\sum_{i=1}^{n} x_i = \\frac{1}{n} \\sum_{i=1}^{n} x_i
$$

## 矩阵
$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$`
  },

  advanced: {
    title: '高级功能',
    content: `## 脚注
这是一个脚注示例[^1]。

[^1]: 这是脚注内容

## 定义列表
术语1
: 这是术语1的定义

术语2
: 这是术语2的第一个定义
: 这是术语2的第二个定义

## 容器
::: warning 警告
这是一个警告容器
:::

::: info 信息
这是一个信息容器
:::

::: tip 提示
这是一个提示容器
:::

## Emoji
:smile: :heart: :thumbsup: :rocket: :fire:

## HTML 标签
<details>
<summary>折叠内容</summary>
这是折叠的内容。
</details>

## 分隔线
---

## 转义字符
\\* 转义星号
\\# 转义井号`
  }
};

export const MarkdownUsageGuide: React.FC = () => {
  const [activeExample, setActiveExample] = useState<keyof typeof syntaxExamples>('headers');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Markdown 语法指南
        </h1>
        <p className="text-lg text-gray-600">
          完整的 Markdown 语法参考和实时预览
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边栏导航 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border shadow-sm p-4 sticky top-4">
            <h2 className="font-semibold text-gray-900 mb-4">语法分类</h2>
            <nav className="space-y-2">
              {Object.entries(syntaxExamples).map(([key, example]) => (
                <button
                  key={key}
                  onClick={() => setActiveExample(key as keyof typeof syntaxExamples)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeExample === key
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {example.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="lg:col-span-3">
          <ComprehensiveMarkdown
            content={syntaxExamples[activeExample].content}
            title={syntaxExamples[activeExample].title}
            showToolbar={true}
            showSourceToggle={true}
            enableAllFeatures={true}
            className="border rounded-lg shadow-sm"
          />
        </div>
      </div>

      {/* 快速参考 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">快速参考</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">基础语法</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code># 标题</code> - 标题</li>
              <li><code>**粗体**</code> - 粗体</li>
              <li><code>*斜体*</code> - 斜体</li>
              <li><code>`代码`</code> - 行内代码</li>
              <li><code>[链接](url)</code> - 链接</li>
              <li><code>![图片](url)</code> - 图片</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">列表和引用</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code>- 项目</code> - 无序列表</li>
              <li><code>1. 项目</code> - 有序列表</li>
              <li><code>- [x] 任务</code> - 任务列表</li>
              <li><code>> 引用</code> - 引用块</li>
              <li><code>---</code> - 分隔线</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">高级功能</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><code>| 表格 |</code> - 表格</li>
              <li><code>$公式$</code> - 数学公式</li>
              <li><code>[^1]</code> - 脚注</li>
              <li><code>:emoji:</code> - 表情</li>
              <li><code>```代码块```</code> - 代码块</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};