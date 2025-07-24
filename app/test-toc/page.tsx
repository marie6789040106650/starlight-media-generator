"use client"

import { useState } from "react"
import { ContentRenderer } from "@/components/content-renderer"
import { TocNavigation } from "@/components/toc-navigation"
import { useToc } from "@/hooks/use-toc"

const testContent = `# 第一个标题

这是第一个标题下的内容。这里有一些文字来填充内容，让页面有足够的高度来测试滚动效果。

## 第二个标题

这是第二个标题下的内容。我们需要更多的内容来测试目录跳转功能是否正常工作。

### 第三个标题

这是第三个标题下的内容。让我们添加更多的文字来确保页面有足够的高度。

## 第四个标题

这是第四个标题下的内容。目录跳转应该能够正确地跳转到这个位置。

# 第五个标题

这是第五个标题下的内容。这是最后一个标题，用来测试完整的目录功能。

## 第六个标题

最后一个标题，确保所有的目录项都能正常工作。`

export default function TestTocPage() {
  const [showFloatingToc, setShowFloatingToc] = useState(false)
  
  const {
    tocItems,
    activeSection,
    scrollToHeading
  } = useToc(testContent, 2)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">目录跳转功能测试</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">测试说明：</h2>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>右下角有目录按钮，点击可以展开目录</li>
              <li>点击目录中的任意标题应该能跳转到对应位置</li>
              <li>所有标题都应该能正常跳转</li>
            </ul>
          </div>

          <ContentRenderer content={testContent} />
        </div>
      </div>

      {/* 悬浮目录 */}
      {tocItems.length > 0 && (
        <TocNavigation
          tocItems={tocItems}
          activeSection={activeSection}
          showFloatingToc={showFloatingToc}
          setShowFloatingToc={setShowFloatingToc}
          scrollToHeading={scrollToHeading}
        />
      )}
    </div>
  )
}