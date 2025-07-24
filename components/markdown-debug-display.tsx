/**
 * Markdown调试展示组件
 * 用于对比原始内容和渲染后的内容
 */

"use client"

import React, { useMemo } from 'react';
import { renderWebMarkdown } from '../lib/web-markdown-renderer';
import '../styles/solution-display.css';

interface MarkdownDebugDisplayProps {
  content: string;
}

export const MarkdownDebugDisplay: React.FC<MarkdownDebugDisplayProps> = ({ content }) => {
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Markdown渲染调试</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 原始内容 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-red-600">原始Markdown内容</h2>
          <div className="bg-gray-100 p-4 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
          </div>
        </div>
        
        {/* 渲染后内容 */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-600">渲染后HTML内容</h2>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div 
              className="solution-markdown-content"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>
        </div>
      </div>
      
      {/* HTML源码 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-blue-600">生成的HTML源码</h2>
        <div className="bg-blue-50 p-4 rounded-lg border">
          <pre className="whitespace-pre-wrap text-sm font-mono text-blue-800">{renderedContent}</pre>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDebugDisplay;