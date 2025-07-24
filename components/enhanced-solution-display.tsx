/**
 * 增强的方案展示组件 - 完美渲染Markdown
 * 使用和导出文件相同的Markdown渲染器
 */

"use client"

import React, { useMemo } from 'react';
import { renderWebMarkdown } from '../lib/web-markdown-renderer';
import '../styles/solution-display.css';

interface SolutionDisplayProps {
  /** 方案内容 (Markdown格式) */
  content: string;
  /** 方案标题 */
  title?: string;
  /** 是否显示水印设置按钮 */
  showWatermarkButton?: boolean;
  /** 水印设置回调 */
  onWatermarkConfig?: () => void;
}

export const EnhancedSolutionDisplay: React.FC<SolutionDisplayProps> = ({
  content,
  title,
  showWatermarkButton = true,
  onWatermarkConfig
}) => {
  // 使用专门为网页优化的Markdown渲染器
  const renderedContent = useMemo(() => {
    if (!content) return '';
    return renderWebMarkdown(content, {
      breaks: true,
      tables: true,
      codeHighlight: true,
      sanitize: true
    });
  }, [content]);

  return (
    <div className="solution-display-container">
      {/* 标题栏 */}
      {title && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {showWatermarkButton && (
            <button
              onClick={onWatermarkConfig}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              水印设置
            </button>
          )}
        </div>
      )}

      {/* Markdown内容渲染 */}
      <div className="solution-content">
        <div 
          className="solution-markdown-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
          onClick={(e) => {
            // 处理链接点击
            const target = e.target as HTMLElement;
            if (target.tagName === 'A') {
              const link = target as HTMLAnchorElement;
              const url = link.href;
              if (url && !url.startsWith('#')) {
                e.preventDefault();
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default EnhancedSolutionDisplay;