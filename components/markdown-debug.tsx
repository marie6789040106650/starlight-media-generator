"use client"

import React from "react"

interface MarkdownDebugProps {
  content: string
}

export const MarkdownDebug: React.FC<MarkdownDebugProps> = ({ content }) => {
  // 简单的调试解析器
  const debugParse = (content: string) => {
    const lines = content.split('\n')
    const results: Array<{
      line: string
      type: string
      match?: RegExpMatchArray | null
    }> = []

    lines.forEach((line) => {
      const trimmed = line.trim()
      let type = 'paragraph'
      let match = null

      if (!trimmed) {
        type = 'empty'
      } else if (match = trimmed.match(/^(#{1,6})\s+(.+)$/)) {
        type = 'heading'
      } else if (match = trimmed.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.+)$/)) {
        type = 'task-list'
      } else if (match = trimmed.match(/^(\s*)[-*+]\s+(.+)$/)) {
        type = 'unordered-list'
      } else if (match = trimmed.match(/^(\s*)\d+\.\s+(.+)$/)) {
        type = 'ordered-list'
      } else if (trimmed.startsWith('```')) {
        type = 'code-block'
      } else if (trimmed.startsWith('> ')) {
        type = 'blockquote'
      } else if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        type = 'hr'
      }

      results.push({
        line: line,
        type,
        match
      })
    })

    return results
  }

  const debugResults = debugParse(content)

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-3 overflow-auto">
        <div className="space-y-2 font-mono text-xs">
          {debugResults.map((result, index) => (
            <div key={index} className="border-b border-gray-100 pb-1 mb-2">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-gray-400 text-xs">#{index + 1}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  result.type === 'unordered-list' ? 'bg-blue-100 text-blue-700' :
                  result.type === 'ordered-list' ? 'bg-green-100 text-green-700' :
                  result.type === 'task-list' ? 'bg-purple-100 text-purple-700' :
                  result.type === 'heading' ? 'bg-yellow-100 text-yellow-700' :
                  result.type === 'paragraph' ? 'bg-gray-100 text-gray-700' :
                  result.type === 'empty' ? 'bg-gray-50 text-gray-500' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.type}
                </span>
              </div>
              <div className="bg-gray-50 p-1.5 rounded text-xs">
                <div className="bg-white p-1 rounded border break-all">
                  "{result.line}"
                </div>
                {result.match && result.match.length > 1 && (
                  <div className="mt-1">
                    <div className="text-gray-500 text-xs mb-0.5">匹配:</div>
                    <div className="bg-white p-1 rounded border text-xs">
                      {result.match.slice(1).map((match, i) => (
                        <div key={i} className="truncate">
                          [{i}]: "{match}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}