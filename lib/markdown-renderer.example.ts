/**
 * Markdown 渲染器使用示例
 */

import { renderMarkdown, MarkdownRenderer, MarkdownPresets } from './markdown-renderer';

// 示例 1: 基础使用
export function basicExample() {
  const markdown = `
# 标题示例

这是一个 **粗体** 和 *斜体* 的示例。

## 列表示例

- 无序列表项 1
- 无序列表项 2
  - 嵌套项目

1. 有序列表项 1
2. 有序列表项 2

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

行内代码：\`console.log()\`

## 链接和图片

[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)
`;

  return renderMarkdown(markdown);
}

// 示例 2: 表格和任务列表
export function advancedExample() {
  const markdown = `
# 高级功能示例

## 表格

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| 内容1  | 内容2 | 内容3  |
| 内容4  | 内容5 | 内容6  |

## 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务

## 引用

> 这是一个引用
> 
> 可以有多行
>> 嵌套引用

## 删除线和高亮

~~删除的文本~~ 和 ==高亮文本==

## 脚注

这是一个脚注示例[^1]。

[^1]: 这是脚注内容

## 数学公式

行内公式：$E = mc^2$

块级公式：
$$
\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n
$$

## Emoji

:smile: :heart: :thumbsup: :rocket:
`;

  return renderMarkdown(markdown, MarkdownPresets.full);
}

// 示例 3: 自定义配置
export function customConfigExample() {
  const renderer = new MarkdownRenderer({
    breaks: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
    emoji: true,
    math: false, // 禁用数学公式
    footnotes: false, // 禁用脚注
    sanitize: true // 启用 HTML 清理
  });

  const markdown = `
# 自定义配置示例

这个示例使用了自定义配置。

## 支持的功能

- [x] 表格
- [x] 任务列表  
- [x] 删除线
- [x] Emoji :tada:
- [ ] 数学公式 (已禁用)
- [ ] 脚注 (已禁用)

| 功能 | 状态 |
|------|------|
| 表格 | ✅ |
| Emoji | :check: |
`;

  return renderer.render(markdown);
}

// 示例 4: 安全模式 (用户输入)
export function safeExample() {
  const userInput = `
# 用户输入示例

这是用户输入的内容，可能包含危险的 HTML：

<script>alert('XSS')</script>

<div onclick="alert('危险')">点击我</div>

但是正常的 Markdown 功能仍然可用：

- **粗体文本**
- *斜体文本*
- [安全链接](https://example.com)

\`\`\`javascript
// 代码块是安全的
console.log("Hello");
\`\`\`
`;

  return renderMarkdown(userInput, MarkdownPresets.safe);
}

// 示例 5: 完整功能展示
export function fullFeatureExample() {
  const markdown = `
# 完整 Markdown 功能展示

## 1. 标题层级

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

## 2. 文本格式化

**粗体文本** 或 __粗体文本__

*斜体文本* 或 _斜体文本_

***粗斜体*** 或 ___粗斜体___

~~删除线文本~~

==高亮文本==

上标：E = mc^2^

下标：H~2~O

\`行内代码\`

<kbd>Ctrl</kbd>+<kbd>C</kbd>

## 3. 列表

### 无序列表

- 项目 1
* 项目 2  
+ 项目 3
  - 嵌套项目
    - 深层嵌套

### 有序列表

1. 第一项
2. 第二项
   1. 嵌套有序项
   2. 另一个嵌套项
3. 第三项

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [x] 另一个已完成任务

## 4. 链接和图片

### 内联链接
[链接文本](https://example.com "可选标题")

### 引用链接
[引用链接][ref-link]
[ref-link]: https://example.com "引用链接标题"

### 自动链接
<https://example.com>
<email@example.com>

### 图片
![图片描述](https://example.com/image.jpg "图片标题")

### 引用图片
![引用图片][ref-image]
[ref-image]: https://example.com/image.jpg "引用图片标题"

## 5. 代码

### 行内代码
使用 \`console.log()\` 输出信息。

### 代码块

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

### 缩进代码块

    这是缩进代码块
    使用 4 个空格或 1 个 tab

## 6. 表格

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 内容1  |   内容2   |  内容3 |
| 长内容 |   短内容   |  中等内容 |

## 7. 引用

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

## 8. 分隔线

---

***

___

- - -

* * *

## 9. 脚注

这是一个脚注示例[^1]，还有另一个脚注[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含更多信息

## 10. 数学公式

### 行内公式
爱因斯坦质能方程：$E = mc^2$

### 块级公式
$$
\\sum_{i=1}^{n} x_i = \\frac{1}{n} \\sum_{i=1}^{n} x_i
$$

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

## 11. Emoji

表情符号：:smile: :heart: :thumbsup: :rocket: :fire: :star:

更多表情：:warning: :info: :check: :x: :bulb: :gear:

## 12. HTML 标签

<div>这是 HTML div 标签</div>

<details>
<summary>折叠内容</summary>
这是折叠的内容，点击上面的标题可以展开/折叠。
</details>

## 13. 转义字符

\\* 转义星号
\\# 转义井号  
\\[ 转义方括号
\\\\ 转义反斜杠

## 14. 定义列表

术语1
: 这是术语1的定义

术语2  
: 这是术语2的第一个定义
: 这是术语2的第二个定义

## 15. 容器 (扩展语法)

::: warning 警告
这是一个警告容器
:::

::: info 信息
这是一个信息容器
:::

::: tip 提示
这是一个提示容器
:::

---

这就是完整的 Markdown 功能展示！
`;

  return renderMarkdown(markdown, MarkdownPresets.full);
}

// 导出所有示例
export const examples = {
  basic: basicExample,
  advanced: advancedExample,
  custom: customConfigExample,
  safe: safeExample,
  full: fullFeatureExample
};