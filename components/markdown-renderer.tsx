"use client"

import React from "react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface ParsedElement {
  type: string
  content: string
  level?: number
  language?: string
  items?: string[]
  checked?: boolean
  url?: string
  alt?: string
  children?: ParsedElement[]
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  // 解析内联格式（加粗、斜体、代码等）
  const parseInlineFormats = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let lastIndex = 0
    let keyCounter = 0

    // 定义所有内联格式的正则表达式（按优先级排序）
    const patterns = [
      { regex: /\*\*\*(.*?)\*\*\*/g, type: 'bold-italic' },
      { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
      { regex: /__([^_]+)__/g, type: 'bold' },
      { regex: /\*(.*?)\*/g, type: 'italic' },
      { regex: /_([^_]+)_/g, type: 'italic' },
      { regex: /~~(.*?)~~/g, type: 'strikethrough' },
      { regex: /==(.*?)==/g, type: 'highlight' },
      { regex: /`([^`\n]+)`/g, type: 'inline-code' },
      { regex: /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, type: 'link' },
      { regex: /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, type: 'image' },
      { regex: /<([^>\s]+@[^>\s]+)>/g, type: 'email' },
      { regex: /<(https?:\/\/[^>\s]+)>/g, type: 'auto-link' },
      { regex: /\[([^\]]+)\]\[([^\]]+)\]/g, type: 'ref-link' },
      { regex: /\[\^([^\]]+)\]/g, type: 'footnote-ref' },
    ]

    // 找到所有匹配项并按位置排序
    const matches: Array<{
      index: number
      length: number
      type: string
      content: string
      url?: string
      alt?: string
    }> = []

    patterns.forEach(pattern => {
      let match
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
      
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          index: match.index,
          length: match[0].length,
          type: pattern.type,
          content: match[1],
          url: match[2], // 用于链接和图片
          alt: match[1]  // 用于图片的alt文本
        })
      }
    })

    // 按位置排序
    matches.sort((a, b) => a.index - b.index)

    // 处理重叠的匹配项（优先处理更长的匹配）
    const validMatches = []
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i]
      let isValid = true
      
      // 检查是否与已有的匹配项重叠
      for (const valid of validMatches) {
        if (current.index < valid.index + valid.length && 
            current.index + current.length > valid.index) {
          isValid = false
          break
        }
      }
      
      if (isValid) {
        validMatches.push(current)
      }
    }

    // 重新按位置排序
    validMatches.sort((a, b) => a.index - b.index)

    // 构建最终的元素数组
    validMatches.forEach(match => {
      // 添加匹配前的普通文本
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index))
      }

      // 添加格式化的元素
      switch (match.type) {
        case 'bold-italic':
          elements.push(
            <strong key={`bold-italic-${keyCounter++}`} className="font-bold italic">
              {match.content}
            </strong>
          )
          break
        case 'bold':
          elements.push(
            <strong key={`bold-${keyCounter++}`} className="font-semibold">
              {parseInlineFormats(match.content)}
            </strong>
          )
          break
        case 'italic':
          elements.push(
            <em key={`italic-${keyCounter++}`} className="italic">
              {parseInlineFormats(match.content)}
            </em>
          )
          break
        case 'strikethrough':
          elements.push(
            <del key={`strike-${keyCounter++}`} className="line-through opacity-75">
              {parseInlineFormats(match.content)}
            </del>
          )
          break
        case 'highlight':
          elements.push(
            <mark key={`highlight-${keyCounter++}`} className="bg-yellow-200 px-1 rounded">
              {parseInlineFormats(match.content)}
            </mark>
          )
          break
        case 'inline-code':
          elements.push(
            <code key={`code-${keyCounter++}`} className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">
              {match.content}
            </code>
          )
          break
        case 'link':
          const title = match.alt || match.content
          elements.push(
            <a 
              key={`link-${keyCounter++}`} 
              href={match.url} 
              title={title}
              className="text-blue-600 hover:text-blue-800 underline decoration-1 hover:decoration-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {match.content}
            </a>
          )
          break
        case 'image':
          elements.push(
            <img 
              key={`img-${keyCounter++}`} 
              src={match.url} 
              alt={match.alt || match.content || ''} 
              title={match.alt || ''}
              className="max-w-full h-auto rounded-lg shadow-sm my-2"
              loading="lazy"
            />
          )
          break
        case 'email':
          elements.push(
            <a 
              key={`email-${keyCounter++}`} 
              href={`mailto:${match.content}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {match.content}
            </a>
          )
          break
        case 'auto-link':
          elements.push(
            <a 
              key={`auto-link-${keyCounter++}`} 
              href={match.content}
              className="text-blue-600 hover:text-blue-800 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {match.content}
            </a>
          )
          break
        case 'ref-link':
          // 引用链接需要额外处理，这里先显示为普通文本
          elements.push(
            <span key={`ref-link-${keyCounter++}`} className="text-blue-600">
              [{match.content}][{match.url}]
            </span>
          )
          break
        case 'footnote-ref':
          elements.push(
            <sup key={`footnote-${keyCounter++}`}>
              <a 
                href={`#footnote-${match.content}`}
                className="text-blue-600 hover:text-blue-800 no-underline"
              >
                {match.content}
              </a>
            </sup>
          )
          break
      }

      lastIndex = match.index + match.length
    })

    // 添加剩余的普通文本
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex))
    }

    return elements.length > 0 ? elements : [text]
  }

  // 解析块级元素
  const parseBlocks = (content: string): ParsedElement[] => {
    const lines = content.split('\n')
    const blocks: ParsedElement[] = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // 空行
      if (!trimmedLine) {
        i++
        continue
      }

      // 标题
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        blocks.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2]
        })
        i++
        continue
      }

      // 代码块
      const codeBlockMatch = trimmedLine.match(/^```(\w+)?$/)
      if (codeBlockMatch) {
        const language = codeBlockMatch[1] || 'text'
        const codeLines: string[] = []
        i++
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        
        blocks.push({
          type: 'code-block',
          language,
          content: codeLines.join('\n')
        })
        i++ // 跳过结束的 ```
        continue
      }

      // 引用（支持嵌套）
      if (trimmedLine.startsWith('> ')) {
        const quoteLines: string[] = []
        let quoteLevel = 0
        
        while (i < lines.length) {
          const quoteLine = lines[i].trim()
          if (quoteLine.startsWith('> ')) {
            // 计算引用层级
            const currentLevel = (quoteLine.match(/^>+/) || [''])[0].length
            quoteLevel = Math.max(quoteLevel, currentLevel)
            quoteLines.push(quoteLine.substring(currentLevel + 1).trim())
            i++
          } else if (!quoteLine) {
            quoteLines.push('')
            i++
          } else {
            break
          }
        }
        
        blocks.push({
          type: 'blockquote',
          content: quoteLines.join('\n'),
          level: quoteLevel
        })
        continue
      }

      // 水平分割线
      if (trimmedLine.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        blocks.push({
          type: 'hr',
          content: ''
        })
        i++
        continue
      }

      // 任务列表（必须在无序列表之前检查）
      const taskListMatch = trimmedLine.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.+)$/)
      if (taskListMatch) {
        const items: string[] = []
        const checkedStates: boolean[] = []
        const baseIndent = taskListMatch[1].length
        
        while (i < lines.length) {
          const currentLine = lines[i]
          const taskLine = currentLine.trim()
          
          if (!taskLine) {
            i++
            continue
          }
          
          const taskMatch = taskLine.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/)
          const indentMatch = currentLine.match(/^(\s*)/)
          const currentIndent = indentMatch ? indentMatch[1].length : 0
          
          if (taskMatch && currentIndent >= baseIndent) {
            items.push(taskMatch[2])
            checkedStates.push(taskMatch[1].toLowerCase() === 'x')
            i++
          } else if (currentIndent > baseIndent && items.length > 0) {
            // 多行任务项的延续
            const lastIndex = items.length - 1
            items[lastIndex] += ' ' + taskLine
            i++
          } else {
            break
          }
        }
        
        blocks.push({
          type: 'task-list',
          content: '',
          items,
          children: checkedStates.map(checked => ({ type: 'task-item', content: '', checked }))
        })
        continue
      }

      // 无序列表（改进版本，支持嵌套和多行）
      const unorderedListMatch = trimmedLine.match(/^(\s*)[-*+]\s+(.+)$/)
      if (unorderedListMatch) {
        const items: string[] = []
        const baseIndent = unorderedListMatch[1].length
        
        while (i < lines.length) {
          const currentLine = lines[i]
          const listLine = currentLine.trim()
          
          if (!listLine) {
            // 空行，继续检查下一行
            i++
            continue
          }
          
          const listMatch = listLine.match(/^[-*+]\s+(.+)$/)
          const indentMatch = currentLine.match(/^(\s*)/)
          const currentIndent = indentMatch ? indentMatch[1].length : 0
          
          if (listMatch && currentIndent >= baseIndent) {
            items.push(listMatch[1])
            i++
          } else if (currentIndent > baseIndent && items.length > 0) {
            // 多行列表项的延续
            const lastIndex = items.length - 1
            items[lastIndex] += ' ' + listLine
            i++
          } else {
            break
          }
        }
        
        blocks.push({
          type: 'unordered-list',
          content: '',
          items
        })
        continue
      }

      // 有序列表（改进版本，支持嵌套和多行）
      const orderedListMatch = trimmedLine.match(/^(\s*)\d+\.\s+(.+)$/)
      if (orderedListMatch) {
        const items: string[] = []
        const baseIndent = orderedListMatch[1].length
        
        while (i < lines.length) {
          const currentLine = lines[i]
          const listLine = currentLine.trim()
          
          if (!listLine) {
            // 空行，继续检查下一行
            i++
            continue
          }
          
          const listMatch = listLine.match(/^\d+\.\s+(.+)$/)
          const indentMatch = currentLine.match(/^(\s*)/)
          const currentIndent = indentMatch ? indentMatch[1].length : 0
          
          if (listMatch && currentIndent >= baseIndent) {
            items.push(listMatch[1])
            i++
          } else if (currentIndent > baseIndent && items.length > 0) {
            // 多行列表项的延续
            const lastIndex = items.length - 1
            items[lastIndex] += ' ' + listLine
            i++
          } else {
            break
          }
        }
        
        blocks.push({
          type: 'ordered-list',
          content: '',
          items
        })
        continue
      }



      // 表格
      if (trimmedLine.includes('|') && trimmedLine.split('|').length >= 3) {
        const tableLines: string[] = []
        let hasValidTable = false
        
        while (i < lines.length) {
          const tableLine = lines[i].trim()
          if (tableLine.includes('|') && tableLine.split('|').length >= 3) {
            tableLines.push(tableLine)
            // 检查是否有分隔行（第二行应该是 |---|---|）
            if (tableLines.length === 2 && tableLine.match(/^\|?[\s\-:]+\|/)) {
              hasValidTable = true
            }
            i++
          } else if (!tableLine && tableLines.length > 0) {
            i++
            break
          } else {
            break
          }
        }
        
        if (hasValidTable && tableLines.length >= 2) {
          blocks.push({
            type: 'table',
            content: tableLines.join('\n')
          })
          continue
        } else {
          // 回退到普通文本处理
          i -= tableLines.length
        }
      }

      // 脚注定义
      const footnoteDefMatch = trimmedLine.match(/^\[\^([^\]]+)\]:\s*(.+)$/)
      if (footnoteDefMatch) {
        blocks.push({
          type: 'footnote-def',
          content: footnoteDefMatch[2],
          level: footnoteDefMatch[1] // 使用 level 存储脚注ID
        })
        i++
        continue
      }

      // 定义列表
      const defListMatch = trimmedLine.match(/^([^:]+):\s*$/)
      if (defListMatch && i + 1 < lines.length && lines[i + 1].trim().startsWith('  ')) {
        const term = defListMatch[1]
        const definitions: string[] = []
        i++
        
        while (i < lines.length && lines[i].trim().startsWith('  ')) {
          definitions.push(lines[i].trim().substring(2))
          i++
        }
        
        blocks.push({
          type: 'definition-list',
          content: term,
          items: definitions
        })
        continue
      }

      // 普通段落（改进版本，更精确的模式匹配）
      const paragraphLines: string[] = []
      while (i < lines.length) {
        const currentLine = lines[i].trim()
        
        if (!currentLine) {
          // 遇到空行，段落结束
          break
        }
        
        // 检查是否是其他块级元素的开始
        if (currentLine.match(/^(#{1,6}\s|```|>\s|[-*+]\s+(?!\[)|[-*+]\s+\[[ xX]\]\s|\d+\.\s|\||[^:]+:\s*$|\[\^[^\]]+\]:)/)) {
          break
        }
        
        paragraphLines.push(currentLine)
        i++
      }
      
      if (paragraphLines.length > 0) {
        blocks.push({
          type: 'paragraph',
          content: paragraphLines.join(' ')
        })
      }
    }

    return blocks
  }

  // 渲染表格
  const renderTable = (content: string) => {
    const lines = content.split('\n')
    if (lines.length < 2) return null

    const headerCells = lines[0].split('|').map(cell => cell.trim()).filter(cell => cell)
    const separatorLine = lines[1]
    const dataRows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    )

    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              {headerCells.map((header, index) => (
                <th key={index} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  {parseInlineFormats(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                    {parseInlineFormats(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // 渲染块级元素
  const renderBlock = (block: ParsedElement, index: number): React.ReactNode => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
        const headingClasses = {
          1: 'text-3xl font-bold mb-6 mt-8 text-gray-900 border-b pb-2',
          2: 'text-2xl font-bold mb-4 mt-6 text-gray-900',
          3: 'text-xl font-semibold mb-3 mt-5 text-gray-800',
          4: 'text-lg font-semibold mb-2 mt-4 text-gray-800',
          5: 'text-base font-semibold mb-2 mt-3 text-gray-700',
          6: 'text-sm font-semibold mb-1 mt-2 text-gray-700'
        }
        
        return (
          <HeadingTag 
            key={index} 
            className={headingClasses[block.level as keyof typeof headingClasses]}
          >
            {parseInlineFormats(block.content)}
          </HeadingTag>
        )

      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {parseInlineFormats(block.content)}
          </p>
        )

      case 'code-block':
        return (
          <div key={index} className="my-4">
            <SyntaxHighlighter
              language={block.language}
              style={tomorrow}
              className="rounded-lg"
              showLineNumbers={true}
            >
              {block.content}
            </SyntaxHighlighter>
          </div>
        )

      case 'blockquote':
        const quoteLevel = block.level || 1
        const borderClass = quoteLevel > 1 ? 'border-l-2 border-gray-400' : 'border-l-4 border-gray-300'
        const bgClass = quoteLevel > 1 ? 'bg-gray-100' : 'bg-gray-50'
        
        return (
          <blockquote key={index} className={`${borderClass} pl-4 py-2 my-4 ${bgClass} italic text-gray-600`}>
            <div className="space-y-2">
              {block.content.split('\n').map((line, lineIndex) => (
                line.trim() ? (
                  <div key={lineIndex}>
                    {parseInlineFormats(line)}
                  </div>
                ) : (
                  <div key={lineIndex} className="h-2" />
                )
              ))}
            </div>
          </blockquote>
        )

      case 'unordered-list':
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-1">
            {block.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700">
                {parseInlineFormats(item)}
              </li>
            ))}
          </ul>
        )

      case 'ordered-list':
        return (
          <ol key={index} className="list-decimal list-inside mb-4 space-y-1">
            {block.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700">
                {parseInlineFormats(item)}
              </li>
            ))}
          </ol>
        )

      case 'task-list':
        return (
          <ul key={index} className="mb-4 space-y-2">
            {block.items?.map((item, itemIndex) => {
              const isChecked = block.children?.[itemIndex]?.checked || false
              return (
                <li key={itemIndex} className="flex items-start gap-2">
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    readOnly
                    className="mt-1 rounded"
                  />
                  <span className={`text-gray-700 ${isChecked ? 'line-through text-gray-500' : ''}`}>
                    {parseInlineFormats(item)}
                  </span>
                </li>
              )
            })}
          </ul>
        )

      case 'table':
        return <div key={index}>{renderTable(block.content)}</div>

      case 'footnote-def':
        return (
          <div key={index} className="text-sm text-gray-600 border-t pt-2 mt-4">
            <sup className="font-semibold">{block.level}</sup>
            <span className="ml-2">{parseInlineFormats(block.content)}</span>
          </div>
        )

      case 'definition-list':
        return (
          <dl key={index} className="my-4">
            <dt className="font-semibold text-gray-900 mb-1">
              {parseInlineFormats(block.content)}
            </dt>
            {block.items?.map((def, defIndex) => (
              <dd key={defIndex} className="ml-4 mb-2 text-gray-700">
                {parseInlineFormats(def)}
              </dd>
            ))}
          </dl>
        )

      case 'hr':
        return <hr key={index} className="my-6 border-t border-gray-300" />

      default:
        return null
    }
  }

  // 主渲染函数
  const blocks = parseBlocks(content)

  return (
    <div className={`prose max-w-none ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}