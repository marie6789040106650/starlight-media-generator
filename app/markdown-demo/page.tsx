"use client"

import { useState } from 'react'
import { MarkdownRenderer } from '@/components/markdown-renderer'

const sampleMarkdown = `# Markdown 格式演示

这是一个完整的 Markdown 格式演示页面，展示了各种常用的 Markdown 语法。

## 文本格式

### 基本文本格式
- **加粗文本** 使用 \`**text**\` 或 \`__text__\`
- *斜体文本* 使用 \`*text*\` 或 \`_text_\`
- ***粗斜体文本*** 使用 \`***text***\`
- ~~删除线文本~~ 使用 \`~~text~~\`
- ==高亮文本== 使用 \`==text==\`
- \`行内代码\` 使用反引号包围

### 链接和图片
- [这是一个链接](https://github.com "GitHub")
- [带标题的链接](https://example.com "示例网站")
- <https://auto-link.com>
- <email@example.com>
- ![图片示例](https://via.placeholder.com/300x200?text=Markdown+Image "图片标题")

## 标题层级

# 一级标题
## 二级标题  
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 列表

### 无序列表
- 第一项
- 第二项
  - 嵌套项目1
  - 嵌套项目2
- 第三项

### 有序列表
1. 第一步
2. 第二步
3. 第三步

### 任务列表
- [x] 已完成的任务
- [ ] 未完成的任务
- [x] 另一个已完成的任务
- [ ] 待办事项

## 引用

> 这是一个引用块
> 
> 可以包含多行内容，支持 **加粗** 和 *斜体*
> 
> > 这是嵌套引用
> > 
> > > 支持多层嵌套

## 脚注

这里有一个脚注引用[^1]，还有另一个[^note]。

[^1]: 这是第一个脚注的内容
[^note]: 这是命名脚注的内容，可以包含 **格式化文本**

## 定义列表

术语1:
  这是术语1的定义
  可以有多行定义

术语2:
  这是术语2的定义
  支持 *格式化* 文本

## 代码块

### JavaScript 代码
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to Markdown demo!\`;
}

const message = greet("World");
\`\`\`

### Python 代码
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算斐波那契数列
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

### TypeScript 代码
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

class UserService {
  private users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
  }
  
  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
\`\`\`

## 表格

| 功能 | 支持状态 | 说明 |
|------|----------|------|
| 加粗 | ✅ | **粗体文本** |
| 斜体 | ✅ | *斜体文本* |
| 代码 | ✅ | \`行内代码\` |
| 链接 | ✅ | [链接文本](url) |
| 图片 | ✅ | ![alt](src) |
| 表格 | ✅ | 当前表格 |
| 列表 | ✅ | 有序/无序列表 |
| 引用 | ✅ | > 引用块 |
| 代码块 | ✅ | 语法高亮 |

## 分割线

上面的内容

---

下面的内容

***

另一种分割线

___

第三种分割线

## 混合格式示例

这里展示一些**混合格式**的例子：

1. **加粗** + *斜体* + \`代码\` 的组合
2. 包含 [链接](https://example.com) 的 **加粗文本**
3. ~~删除线~~ 和 ***粗斜体*** 的组合

### 复杂列表示例

- **项目管理**
  - [x] 需求分析
  - [x] 技术选型
  - [ ] 开发实现
  - [ ] 测试验证
- **技术栈**
  - 前端：\`React\` + \`TypeScript\` + \`Tailwind CSS\`
  - 后端：\`Node.js\` + \`Express\`
  - 数据库：\`PostgreSQL\`

> **提示**: 这个 Markdown 渲染器支持大部分常用的 Markdown 语法，包括语法高亮、表格、任务列表等高级功能。

## 结语

这就是我们的 **Markdown 渲染器** 的完整演示！它支持：

- ✅ 所有基本文本格式
- ✅ 标题层级（1-6级）
- ✅ 各种列表类型
- ✅ 代码块和语法高亮
- ✅ 表格渲染
- ✅ 链接和图片
- ✅ 引用块
- ✅ 分割线
- ✅ 任务列表

*感谢使用我们的 Markdown 渲染器！*`

export default function MarkdownDemoPage() {
  const [content, setContent] = useState(sampleMarkdown)
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Markdown 渲染器演示
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditing ? '预览模式' : '编辑模式'}
            </button>
            <button
              onClick={() => setContent(sampleMarkdown)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              重置内容
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-gray-800">
                {isEditing ? 'Markdown 编辑器' : 'Markdown 源码'}
              </h2>
            </div>
            <div className="p-4">
              {isEditing ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="在这里输入 Markdown 内容..."
                />
              ) : (
                <pre className="w-full h-96 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
                  {content}
                </pre>
              )}
            </div>
          </div>

          {/* 渲染结果 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold text-gray-800">渲染结果</h2>
            </div>
            <div className="p-4 h-96 overflow-auto">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>

        {/* 格式说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-gray-800">支持的 Markdown 格式</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">文本格式</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>**加粗** 或 __加粗__</li>
                  <li>*斜体* 或 _斜体_</li>
                  <li>***粗斜体***</li>
                  <li>~~删除线~~</li>
                  <li>==高亮文本==</li>
                  <li>`行内代码`</li>
                  <li>[^1] 脚注引用</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">结构元素</h3>
                <ul className="space-y-1 text-gray-600">
                  <li># 标题 (1-6级)</li>
                  <li>- 无序列表</li>
                  <li>1. 有序列表</li>
                  <li>- [ ] 任务列表</li>
                  <li>&gt; 引用块</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">高级功能</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>```代码块```</li>
                  <li>| 表格 |</li>
                  <li>[链接](url)</li>
                  <li>![图片](src)</li>
                  <li>--- 分割线</li>
                  <li>术语: 定义列表</li>
                  <li>&lt;email@example.com&gt;</li>
                  <li>&lt;https://auto-link.com&gt;</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}