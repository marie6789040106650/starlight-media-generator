'use client';

import React from 'react';
import { FloatingToc } from './FloatingToc';
import { renderWebMarkdown } from '@/lib/web-markdown-renderer';

interface MarkdownWithTocProps {
  content: string;
  className?: string;
}

/**
 * 带悬浮目录的Markdown渲染组件
 * 结合了Markdown渲染和悬浮目录功能
 */
export function MarkdownWithToc({ content, className = '' }: MarkdownWithTocProps) {
  // 渲染Markdown内容
  const htmlContent = renderWebMarkdown(content);

  return (
    <div className={`relative ${className}`}>
      {/* 渲染的Markdown内容 */}
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      
      {/* 悬浮目录 */}
      <FloatingToc content={content} />
    </div>
  );
}