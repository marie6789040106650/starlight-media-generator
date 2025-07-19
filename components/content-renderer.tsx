"use client"

import React from "react"
import { generateHeadingId } from "@/lib/utils"

interface ContentRendererProps {
  content: string
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  // 解析和渲染方案内容的函数
  const renderParsedContent = (content: string) => {
    const lines = content.split('\n')
    let renderedContent: React.ReactElement[] = []

    // 处理文本中的Markdown格式
    const parseMarkdownText = (text: string) => {
      const parts: (string | React.ReactElement)[] = []
      let lastIndex = 0

      // 匹配 **text** 格式的加粗文本
      const boldRegex = /\*\*(.*?)\*\*/g
      let match
      let keyCounter = 0

      while ((match = boldRegex.exec(text)) !== null) {
        // 添加匹配前的普通文本
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }

        // 添加加粗文本
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold text-gray-900">
            {match[1]}
          </strong>
        )

        lastIndex = match.index + match[0].length
      }

      // 添加剩余的普通文本
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return parts.length > 0 ? parts : [text]
    }

    lines.forEach((line, index) => {
      // 检查是否是标题行
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const title = headingMatch[2].trim()
        const id = generateHeadingId(index, title)

        const headingElement = React.createElement(
          `h${level}`,
          {
            key: index,
            id: id,
            className: `scroll-mt-20 font-bold text-gray-900 ${
              level === 1 ? 'text-3xl mb-6 mt-8' :
              level === 2 ? 'text-2xl mb-4 mt-6' :
              level === 3 ? 'text-xl mb-3 mt-5' :
              'text-lg mb-2 mt-4'
            }`
          },
          parseMarkdownText(title)
        )

        renderedContent.push(headingElement)
      } else if (line.trim()) {
        // 处理普通文本行，解析Markdown格式
        const trimmedLine = line.trim()

        if (trimmedLine) {
          renderedContent.push(
            <p key={index} className="text-gray-700 leading-relaxed mb-3">
              {parseMarkdownText(trimmedLine)}
            </p>
          )
        }
      } else {
        // 空行
        renderedContent.push(<div key={index} className="h-2" />)
      }
    })

    return (
      <div className="prose max-w-none">
        {renderedContent}
      </div>
    )
  }

  return renderParsedContent(content)
}