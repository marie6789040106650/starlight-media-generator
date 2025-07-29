/**
 * 综合 Markdown 组件 - 集成到现有系统
 * 提供完整的 Markdown 渲染功能，可以直接替换现有的 Markdown 组件
 */

"use client"

import React, { useState, useMemo } from 'react';
import { EnhancedMarkdownRenderer } from './enhanced-markdown-renderer';
import { MarkdownPresets } from '../lib/markdown-renderer';

interface ComprehensiveMarkdownProps {
  /** Markdown 内容 */
  content: string;
  /** 组件标题 */
  title?: string;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示源码切换 */
  showSourceToggle?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否启用全部功能 */
  enableAllFeatures?: boolean;
  /** 链接点击处理 */
  onLinkClick?: (url: string) => void;
}

export const ComprehensiveMarkdown: React.FC<ComprehensiveMarkdownProps> = ({
  content,
  title,
  showToolbar = true,
  showSourceToggle = true,
  className = '',
  enableAllFeatures = true,
  onLinkClick
}) => {
  const [showSource, setShowSource] = useState(false);
  const [preset, setPreset] = useState<keyof typeof MarkdownPresets>(
    enableAllFeatures ? 'full' : 'standard'
  );

  // 统计信息
  const stats = useMemo(() => {
    if (!content) return { lines: 0, words: 0, chars: 0 };
    
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    const chars = content.length;
    
    return { lines, words, chars };
  }, [content]);

  const handleLinkClick = (url: string, event: React.MouseEvent) => {
    if (onLinkClick) {
      event.preventDefault();
      onLinkClick(url);
    } else {
      // 默认行为：在新窗口打开外部链接
      if (!url.startsWith('#') && !url.startsWith('/')) {
        event.preventDefault();
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className={`comprehensive-markdown ${className}`}>
      {/* 标题栏 */}
      {title && (
        <div className="border-b bg-gray-50 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      )}

      {/* 工具栏 */}
      {showToolbar && (
        <div className="border-b bg-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 预设选择 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">模式:</label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as keyof typeof MarkdownPresets)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="basic">基础</option>
                <option value="standard">标准</option>
                <option value="full">完整</option>
                <option value="safe">安全</option>
              </select>
            </div>

            {/* 统计信息 */}
            <div className="text-sm text-gray-500">
              {stats.lines} 行 · {stats.words} 词 · {stats.chars} 字符
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 源码切换 */}
            {showSourceToggle && (
              <button
                onClick={() => setShowSource(!showSource)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  showSource
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {showSource ? '预览' : '源码'}
              </button>
            )}

            {/* 功能指示器 */}
            <div className="flex items-center space-x-1">
              {preset === 'full' && (
                <>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    数学公式
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    语法高亮
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    全功能
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="bg-white">
        {showSource ? (
          /* 源码视图 */
          <div className="p-4">
            <pre className="bg-gray-50 border rounded-lg p-4 overflow-auto text-sm font-mono">
              <code>{content}</code>
            </pre>
          </div>
        ) : (
          /* 渲染视图 */
          <div className="p-4">
            <EnhancedMarkdownRenderer
              content={content}
              preset={preset}
              enableSyntaxHighlight={preset === 'full' || preset === 'standard'}
              enableMath={preset === 'full'}
              showLineNumbers={true}
              onLinkClick={handleLinkClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};