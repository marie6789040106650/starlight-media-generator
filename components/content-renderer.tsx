"use client"

import React, { useMemo } from "react"
import { renderWebMarkdown } from "../lib/web-markdown-renderer"
import { EnhancedExportActions } from "./enhanced-export-actions"
import "../styles/solution-display.css"

interface ContentRendererProps {
  content: string
  enableAllFeatures?: boolean
  showToolbar?: boolean
  storeName?: string
  bannerImage?: string | null
  showExportActions?: boolean
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content,
  enableAllFeatures = true,
  showToolbar = false,
  storeName,
  bannerImage,
  showExportActions = false
}) => {
  // 使用网页专用的Markdown渲染器
  const renderedContent = useMemo(() => {
    if (!content) return '';
    return renderWebMarkdown(content, {
      breaks: true,
      tables: true,
      codeHighlight: enableAllFeatures,
      sanitize: true
    });
  }, [content, enableAllFeatures]);

  return (
    <div className="content-renderer">
      {/* 工具栏 */}
      {showToolbar && (
        <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            {content.split('\n').length} 行 · {content.split(/\s+/).filter(w => w).length} 词
          </div>
          {showExportActions && storeName && (
            <EnhancedExportActions
              content={content}
              storeName={storeName}
              bannerImage={bannerImage}
              showPreview={true}
            />
          )}
        </div>
      )}

      {/* 内容渲染 */}
      <div 
        className="solution-markdown-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
        onClick={(e) => {
          // 处理链接点击
          const target = e.target as HTMLElement;
          if (target.tagName === 'A') {
            const link = target as HTMLAnchorElement;
            const url = link.href;
            if (url && !url.startsWith('#') && !url.startsWith('/')) {
              e.preventDefault();
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          }
        }}
      />
    </div>
  )
}