"use client"

import { MarkdownRenderer } from '@/components/markdown-renderer'
import { MarkdownDebug } from '@/components/markdown-debug'

const testMarkdown = `# 列表解析测试

## 基础无序列表
* 项目1
* 项目2  
* 项目3

## 问题案例测试
* 标题：川菜传承人，天府新区美食专家，热情好客的掌柜，品质至上的川川菜大师，贴心做饭人。
* 人设：一位经验丰富，技艺精湛，同时又温情脉脉的川菜老字号掌门人，她不仅仅是川菜烹饪技艺的传承者，更是对美食的热爱和对顾客的真诚关怀的体现者，用她的双手和故事，诉说着老成都的味道传奇。
* Slogan：川味川川菜，老成都的味道；一口地道，一生难忘；传承成都，享受川菜成都。

## 有序列表测试
1. 第一步：开始操作
2. 第二步：继续操作  
3. 第三步：完成操作

## 任务列表测试
- [x] 已完成任务
- [ ] 未完成任务
- [X] 大写X任务

## 段落测试
这是一个普通段落，不应该被解析为列表。

* 这应该是列表项1
* 这应该是列表项2

这是另一个段落。

## 代码块测试
\`\`\`
* 这不应该被解析为列表
* 这是代码中的星号
\`\`\`

普通文本中的星号 * 不应该被解析为列表。
`

export default function MarkdownTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Markdown 列表解析测试
        </h1>
        
        <div className="grid grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* 左栏：源码 */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="border-b px-3 py-2 bg-blue-50">
              <h2 className="font-semibold text-blue-800 text-sm">📝 Markdown 源码</h2>
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              <pre className="w-full h-full p-2 bg-gray-50 border border-gray-200 rounded font-mono text-xs overflow-auto whitespace-pre-wrap leading-relaxed">
                {testMarkdown}
              </pre>
            </div>
          </div>

          {/* 中栏：渲染结果 */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="border-b px-3 py-2 bg-green-50">
              <h2 className="font-semibold text-green-800 text-sm">🎨 渲染结果</h2>
            </div>
            <div className="flex-1 p-3 overflow-auto">
              <div className="text-sm">
                <MarkdownRenderer content={testMarkdown} />
              </div>
            </div>
          </div>

          {/* 右栏：调试信息 */}
          <div className="bg-white rounded-lg shadow-sm border flex flex-col">
            <div className="border-b px-3 py-2 bg-orange-50">
              <h2 className="font-semibold text-orange-800 text-sm">🔍 解析调试</h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <MarkdownDebug content={testMarkdown} />
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-gray-800">测试说明</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>测试重点：</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>无序列表（* - +）应该正确渲染为项目符号</li>
                <li>有序列表（1. 2. 3.）应该正确渲染为数字列表</li>
                <li>任务列表（- [ ] - [x]）应该渲染为复选框</li>
                <li>多行列表项应该正确处理</li>
                <li>嵌套列表应该有正确的缩进</li>
                <li>代码块中的星号不应该被解析为列表</li>
                <li>普通文本中的星号不应该被解析为列表</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}