"use client"

import { useState, useEffect } from "react"
import { generateHeadingId, parseMarkdownToc } from "@/lib/utils"
import { renderWebMarkdown } from "@/lib/web-markdown-renderer"

const testMarkdown = `# 第一个标题
内容1

## 第二个标题  
内容2

### 第三个标题
内容3

## 第四个标题
内容4`

export default function DebugTocPage() {
  const [renderedHtml, setRenderedHtml] = useState("")
  const [tocItems, setTocItems] = useState<any[]>([])
  const [actualIds, setActualIds] = useState<string[]>([])

  useEffect(() => {
    // 渲染HTML
    const html = renderWebMarkdown(testMarkdown)
    setRenderedHtml(html)
    
    // 解析目录
    const toc = parseMarkdownToc(testMarkdown)
    setTocItems(toc)
    
    // 延迟获取实际的DOM元素ID
    setTimeout(() => {
      const elements = Array.from(document.querySelectorAll('[id^="heading-"]'))
      setActualIds(elements.map(el => el.id))
    }, 100)
  }, [])

  const testScroll = (id: string) => {
    console.log('测试滚动到:', id)
    const element = document.getElementById(id)
    if (element) {
      console.log('找到元素!')
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      console.log('未找到元素!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 调试信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">调试信息</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">解析的目录项:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {tocItems.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div>ID: <code className="bg-yellow-200 px-1">{item.id}</code></div>
                    <div>标题: {item.title}</div>
                    <div>级别: {item.level}</div>
                    <button 
                      onClick={() => testScroll(item.id)}
                      className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      测试跳转
                    </button>
                    <hr className="mt-2" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">实际DOM中的ID:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {actualIds.map((id, index) => (
                  <div key={index} className="mb-1">
                    <code className="bg-green-200 px-1">{id}</code>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">ID匹配检查:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {tocItems.map((item, index) => (
                  <div key={index} className="mb-1">
                    {actualIds.includes(item.id) ? (
                      <span className="text-green-600">✅ {item.id}</span>
                    ) : (
                      <span className="text-red-600">❌ {item.id}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 渲染的内容 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">渲染的内容</h2>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </div>
  )
}