"use client"

import React from "react"
import { EnhancedMarkdownRenderer } from './enhanced-markdown-renderer'
import '../styles/enhanced-markdown.css'

interface MarkdownRendererProps {
  content: string
  className?: string
  enableSyntaxHighlight?: boolean
  enableMath?: boolean
  showLineNumbers?: boolean
  onLinkClick?: (url: string, event: React.MouseEvent) => void
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "",
  enableSyntaxHighlight = true,
  enableMath = true,
  showLineNumbers = true,
  onLinkClick
}) => {
  // 使用增强的渲染器，启用全部功能
  return (
    <EnhancedMarkdownRenderer
      content={content}
      className={className}
      preset="full" // 启用全部语法功能
      enableSyntaxHighlight={enableSyntaxHighlight}
      enableMath={enableMath}
      showLineNumbers={showLineNumbers}
      onLinkClick={onLinkClick}
    />
  )
}