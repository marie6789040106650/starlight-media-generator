/**
 * 分页 Markdown 渲染器
 * 支持智能分页：行高计算、孤立标题处理、markdown标识符忽略
 */

"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { EnhancedMarkdownRenderer } from './enhanced-markdown-renderer';

interface PaginatedMarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 页面高度 (px) */
  pageHeight?: number;
  /** 页面宽度 (px) */
  pageWidth?: number;
  /** 页边距 */
  pageMargin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  /** 是否启用语法高亮 */
  enableSyntaxHighlight?: boolean;
  /** 是否启用数学公式渲染 */
  enableMath?: boolean;
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 点击链接的处理函数 */
  onLinkClick?: (url: string, event: React.MouseEvent) => void;
  /** 页面变化回调 */
  onPageChange?: (currentPage: number, totalPages: number) => void;
}

interface PageBreakInfo {
  pageIndex: number;
  startLine: number;
  endLine: number;
  content: string;
}

export const PaginatedMarkdownRenderer: React.FC<PaginatedMarkdownRendererProps> = ({
  content,
  pageHeight = 800,
  pageWidth = 600,
  pageMargin = { top: 40, bottom: 40, left: 40, right: 40 },
  enableSyntaxHighlight = true,
  enableMath = true,
  showLineNumbers = false,
  onLinkClick,
  onPageChange
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageBreakInfo[]>([]);
  const [isCalculating, setIsCalculating] = useState(true);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可用的内容区域高度
  const contentHeight = pageHeight - pageMargin.top - pageMargin.bottom;
  const contentWidth = pageWidth - pageMargin.left - pageMargin.right;

  // 解析markdown内容为行
  const lines = useMemo(() => {
    return content.split('\n').map((line, index) => ({
      index,
      content: line,
      type: getLineType(line),
      isMarkdownSymbol: isMarkdownSymbol(line)
    }));
  }, [content]);

  // 判断行类型
  function getLineType(line: string): 'heading' | 'paragraph' | 'code' | 'list' | 'quote' | 'separator' | 'empty' {
    const trimmed = line.trim();

    if (!trimmed) return 'empty';
    if (trimmed.startsWith('#')) return 'heading';
    if (trimmed.startsWith('```')) return 'code';
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('+ ') || /^\d+\.\s/.test(trimmed)) return 'list';
    if (trimmed.startsWith('>')) return 'quote';
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') return 'separator';

    return 'paragraph';
  }

  // 判断是否为markdown标识符（应该忽略的行）
  function isMarkdownSymbol(line: string): boolean {
    const trimmed = line.trim();

    // 空行
    if (!trimmed) return true;

    // 分隔线（完整的分隔线）
    if (/^(---+|___+|\*\*\*+)$/.test(trimmed)) return true;

    // 纯标题标识（没有文本内容，只有#符号）
    if (/^#{1,6}\s*$/.test(trimmed)) return true;

    // 代码块开始/结束标识（单独的```行）
    if (trimmed === '```') return true;

    // 其他空的markdown结构
    if (trimmed === '>' || trimmed === '|' || /^[\s\-\|\:]*$/.test(trimmed)) return true;

    return false;
  }

  // 判断行是否可以作为分页点（暂时未使用，保留供将来扩展）
  // function canBreakAfter(line: typeof lines[0], nextLine?: typeof lines[0]): boolean {
  //   // 标题后不能立即分页（除非下一行也是标题或分隔线）
  //   if (line.type === 'heading') {
  //     if (!nextLine) return true;
  //     return nextLine.type === 'heading' || nextLine.type === 'separator';
  //   }

  //   // 分隔线后不能立即分页
  //   if (line.type === 'separator') return false;

  //   // 代码块内不能分页
  //   if (line.type === 'code') return false;

  //   // 列表项之间尽量不分页（除非是不同类型的列表）
  //   if (line.type === 'list' && nextLine?.type === 'list') {
  //     return false;
  //   }

  //   // 引用块内尽量不分页
  //   if (line.type === 'quote' && nextLine?.type === 'quote') {
  //     return false;
  //   }

  //   // 空行和markdown标识符可以分页
  //   if (line.isMarkdownSymbol) return true;

  //   // 段落后可以分页
  //   return line.type === 'paragraph';
  // }

  // 测量行高度
  const measureLineHeight = async (lineContent: string, lineType: string): Promise<number> => {
    return new Promise((resolve) => {
      if (!measureRef.current) {
        resolve(20); // 默认行高
        return;
      }

      const measureElement = measureRef.current;

      // 创建临时测量元素
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = `${contentWidth}px`;
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      // 根据行类型设置样式
      switch (lineType) {
        case 'heading':
          const level = (lineContent.match(/^#+/) || [''])[0].length;
          tempDiv.style.fontSize = `${Math.max(24 - level * 2, 16)}px`;
          tempDiv.style.fontWeight = 'bold';
          tempDiv.style.marginTop = '1.5em';
          tempDiv.style.marginBottom = '0.5em';
          break;
        case 'paragraph':
          tempDiv.style.marginBottom = '1em';
          break;
        case 'code':
          tempDiv.style.fontFamily = 'monospace';
          tempDiv.style.backgroundColor = '#f5f5f5';
          tempDiv.style.padding = '0.5em';
          break;
        case 'list':
          tempDiv.style.marginLeft = '1.5em';
          tempDiv.style.marginBottom = '0.5em';
          break;
        case 'quote':
          tempDiv.style.borderLeft = '4px solid #ddd';
          tempDiv.style.paddingLeft = '1em';
          tempDiv.style.marginBottom = '1em';
          break;
      }

      // 渲染内容
      tempDiv.innerHTML = `<div class="enhanced-markdown-renderer">${lineContent}</div>`;
      measureElement.appendChild(tempDiv);

      // 测量高度
      setTimeout(() => {
        const height = tempDiv.offsetHeight;
        measureElement.removeChild(tempDiv);
        resolve(Math.max(height, 20));
      }, 0);
    });
  };

  // 计算分页
  const calculatePages = async () => {
    setIsCalculating(true);

    const pageBreaks: PageBreakInfo[] = [];
    let currentPageLines: typeof lines = [];
    let currentPageHeight = 0;
    let pageIndex = 0;
    let inCodeBlock = false;
    let codeBlockLines: typeof lines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      const lineHeight = await measureLineHeight(line.content, line.type);

      // 处理代码块
      if (line.content.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // 代码块开始
          inCodeBlock = true;
          codeBlockLines = [line];
        } else {
          // 代码块结束
          inCodeBlock = false;
          codeBlockLines.push(line);

          // 计算整个代码块的高度
          let codeBlockHeight = 0;
          for (const codeLine of codeBlockLines) {
            codeBlockHeight += await measureLineHeight(codeLine.content, codeLine.type);
          }

          // 检查代码块是否能放入当前页
          if (currentPageHeight + codeBlockHeight > contentHeight && currentPageLines.length > 0) {
            // 代码块放不下，需要分页
            const pageContent = currentPageLines.map(l => l.content).join('\n');
            pageBreaks.push({
              pageIndex,
              startLine: currentPageLines[0].index,
              endLine: currentPageLines[currentPageLines.length - 1].index,
              content: pageContent
            });
            pageIndex++;

            // 新页开始，放入整个代码块
            currentPageLines = [...codeBlockLines];
            currentPageHeight = codeBlockHeight;
          } else {
            // 代码块可以放入当前页
            currentPageLines.push(...codeBlockLines);
            currentPageHeight += codeBlockHeight;
          }

          codeBlockLines = [];
          continue;
        }
      }

      // 如果在代码块内，收集代码行
      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      // 检查是否需要分页
      const wouldExceedPage = currentPageHeight + lineHeight > contentHeight;

      if (wouldExceedPage && currentPageLines.length > 0) {
        // 应用智能分页规则
        let shouldCreateNewPage = true;
        const linesToMove: typeof lines = [];

        // 规则1: 避免孤立标题
        const lastLine = currentPageLines[currentPageLines.length - 1];
        if (lastLine.type === 'heading' && !lastLine.isMarkdownSymbol) {
          linesToMove.push(lastLine);
          currentPageLines.pop();
        }

        // 规则2: 分隔线与后续内容保持同页
        if (line.type === 'separator') {
          // 分隔线应该与下一行内容一起
          if (nextLine && !nextLine.isMarkdownSymbol) {
            linesToMove.unshift(line);
            shouldCreateNewPage = true;
          }
        }

        // 规则3: 列表项连贯性
        if (lastLine.type === 'list' && line.type === 'list') {
          // 尝试保持列表连贯，但不能超过页面限制太多
          const combinedHeight = currentPageHeight + lineHeight;
          if (combinedHeight <= contentHeight * 1.1) { // 允许10%的溢出
            shouldCreateNewPage = false;
          }
        }

        // 规则4: 忽略markdown标识符的影响
        if (line.isMarkdownSymbol && !nextLine) {
          // 如果是最后一行且是标识符，可以放在当前页
          shouldCreateNewPage = false;
        }

        if (shouldCreateNewPage) {
          // 创建当前页（如果还有内容）
          if (currentPageLines.length > 0) {
            const pageContent = currentPageLines.map(l => l.content).join('\n');
            pageBreaks.push({
              pageIndex,
              startLine: currentPageLines[0].index,
              endLine: currentPageLines[currentPageLines.length - 1].index,
              content: pageContent
            });
            pageIndex++;
          }

          // 开始新页
          currentPageLines = [...linesToMove, line];

          // 重新计算高度（正确处理异步操作）
          let newPageHeight = 0;
          for (const l of linesToMove) {
            newPageHeight += await measureLineHeight(l.content, l.type);
          }
          currentPageHeight = newPageHeight + lineHeight;
        } else {
          // 继续添加到当前页
          currentPageLines.push(line);
          currentPageHeight += lineHeight;
        }
      } else {
        // 添加到当前页
        currentPageLines.push(line);
        currentPageHeight += lineHeight;
      }
    }

    // 处理未完成的代码块
    if (inCodeBlock && codeBlockLines.length > 0) {
      currentPageLines.push(...codeBlockLines);
    }

    // 添加最后一页
    if (currentPageLines.length > 0) {
      const pageContent = currentPageLines.map(l => l.content).join('\n');
      pageBreaks.push({
        pageIndex,
        startLine: currentPageLines[0].index,
        endLine: currentPageLines[currentPageLines.length - 1].index,
        content: pageContent
      });
    }

    setPages(pageBreaks);
    setIsCalculating(false);

    // 通知页面变化
    if (onPageChange) {
      onPageChange(currentPage, pageBreaks.length);
    }
  };

  // 内容变化时重新计算分页
  useEffect(() => {
    if (content && lines.length > 0) {
      calculatePages();
    }
  }, [content, pageHeight, pageWidth, contentHeight, contentWidth, lines.length, calculatePages]);

  // 页面变化时通知
  useEffect(() => {
    if (onPageChange && pages.length > 0) {
      onPageChange(currentPage, pages.length);
    }
  }, [currentPage, pages.length, onPageChange]);

  // 导航函数
  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在计算分页...</p>
        </div>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <div className="paginated-markdown-container">
      {/* 隐藏的测量容器 */}
      <div
        ref={measureRef}
        className="absolute -top-full left-0 pointer-events-none"
        style={{ width: contentWidth }}
      />

      {/* 页面容器 */}
      <div
        ref={containerRef}
        className="page-container bg-white shadow-lg mx-auto"
        style={{
          width: pageWidth,
          height: pageHeight,
          padding: `${pageMargin.top}px ${pageMargin.right}px ${pageMargin.bottom}px ${pageMargin.left}px`
        }}
      >
        {currentPageData && (
          <div className="page-content h-full overflow-hidden">
            <style jsx>{`
              .page-content {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                color: #374151;
              }
              
              /* Banner图片全宽显示 */
              .page-content :global(.enhanced-markdown-renderer img:first-child) {
                width: 100%;
                max-width: none;
                height: auto;
                display: block;
                margin: 0 0 1.5rem 0;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              }
              
              /* 标题样式 */
              .page-content :global(.enhanced-markdown-renderer h1) {
                font-size: 2rem;
                font-weight: 700;
                margin: 2rem 0 1rem 0;
                color: #1f2937;
                break-after: avoid;
                page-break-after: avoid;
              }
              
              .page-content :global(.enhanced-markdown-renderer h2) {
                font-size: 1.5rem;
                font-weight: 600;
                margin: 1.5rem 0 0.75rem 0;
                color: #374151;
                break-after: avoid;
                page-break-after: avoid;
              }
            
              .page-content :global(.enhanced-markdown-renderer h3) {
                font-size: 1.25rem;
                font-weight: 600;
                margin: 1.25rem 0 0.5rem 0;
                color: #4b5563;
                break-after: avoid;
                page-break-after: avoid;
              }
              
              .page-content :global(.enhanced-markdown-renderer h4),
              .page-content :global(.enhanced-markdown-renderer h5),
              .page-content :global(.enhanced-markdown-renderer h6) {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 1rem 0 0.5rem 0;
                color: #6b7280;
                break-after: avoid;
                page-break-after: avoid;
              }
              
              /* 段落样式 */
              .page-content :global(.enhanced-markdown-renderer p) {
                margin: 0 0 1rem 0;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              /* 列表样式 */
              .page-content :global(.enhanced-markdown-renderer ul),
              .page-content :global(.enhanced-markdown-renderer ol) {
                margin: 0.5rem 0 1rem 0;
                padding-left: 1.5rem;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              .page-content :global(.enhanced-markdown-renderer li) {
                margin: 0.25rem 0;
              }
              
              /* 代码块样式 */
              .page-content :global(.enhanced-markdown-renderer pre) {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 1rem;
                margin: 1rem 0;
                overflow-x: auto;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              .page-content :global(.enhanced-markdown-renderer code) {
                background: #f1f5f9;
                padding: 0.125rem 0.25rem;
                border-radius: 3px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                font-size: 0.875em;
              }
              
              /* 引用块样式 */
              .page-content :global(.enhanced-markdown-renderer blockquote) {
                border-left: 4px solid #3b82f6;
                padding-left: 1rem;
                margin: 1rem 0;
                color: #6b7280;
                background: #f8fafc;
                border-radius: 0 4px 4px 0;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              /* 分隔线样式 */
              .page-content :global(.enhanced-markdown-renderer hr) {
                border: none;
                height: 2px;
                background: linear-gradient(to right, #e5e7eb, #9ca3af, #e5e7eb);
                margin: 2rem 0;
                border-radius: 1px;
              }
              
              /* 表格样式 */
              .page-content :global(.enhanced-markdown-renderer table) {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
                break-inside: avoid;
                page-break-inside: avoid;
              }
              
              .page-content :global(.enhanced-markdown-renderer th),
              .page-content :global(.enhanced-markdown-renderer td) {
                border: 1px solid #d1d5db;
                padding: 0.5rem;
                text-align: left;
              }
              
              .page-content :global(.enhanced-markdown-renderer th) {
                background: #f9fafb;
                font-weight: 600;
              }
              
              /* 链接样式 */
              .page-content :global(.enhanced-markdown-renderer a) {
                color: #3b82f6;
                text-decoration: none;
                border-bottom: 1px solid transparent;
                transition: border-color 0.2s;
              }
              
              .page-content :global(.enhanced-markdown-renderer a:hover) {
                border-bottom-color: #3b82f6;
              }
              
              /* 强调样式 */
              .page-content :global(.enhanced-markdown-renderer strong) {
                font-weight: 600;
                color: #1f2937;
              }
              
              .page-content :global(.enhanced-markdown-renderer em) {
                font-style: italic;
                color: #4b5563;
              }
            `}</style>
            <EnhancedMarkdownRenderer
              content={currentPageData.content}
              preset="full"
              enableSyntaxHighlight={enableSyntaxHighlight}
              enableMath={enableMath}
              showLineNumbers={showLineNumbers}
              onLinkClick={onLinkClick}
            />
          </div>
        )}
      </div>

      {/* 页面信息指示器 */}
      {currentPageData && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">
                📄 第 {currentPage + 1} 页内容
              </span>
              <span className="text-gray-500">
                行 {currentPageData.startLine + 1} - {currentPageData.endLine + 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* 显示当前页包含的内容类型 */}
              {(() => {
                const pageLines = lines.slice(currentPageData.startLine, currentPageData.endLine + 1);
                const contentTypes = new Set(pageLines.map(l => l.type));
                return Array.from(contentTypes).map(type => {
                  const icons = {
                    heading: '📝',
                    paragraph: '📄',
                    list: '📋',
                    code: '💻',
                    quote: '💬',
                    separator: '➖',
                    empty: '⬜'
                  };
                  return (
                    <span key={type} className="px-2 py-1 bg-white rounded text-xs" title={type}>
                      {icons[type as keyof typeof icons]} {type}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 分页控制 */}
      <div className="flex items-center justify-between mt-6 px-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          上一页
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            第 {currentPage + 1} 页，共 {pages.length} 页
          </span>

          {/* 页码导航 */}
          <div className="flex gap-1 max-w-xs overflow-x-auto">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`min-w-8 h-8 px-2 rounded text-sm transition-colors ${index === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          下一页
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">调试信息</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>总行数: {lines.length}</p>
              <p>总页数: {pages.length}</p>
              <p>当前页: {currentPage + 1}</p>
            </div>
            <div>
              <p>页面尺寸: {pageWidth} × {pageHeight}</p>
              <p>内容区域: {contentWidth} × {contentHeight}</p>
              {currentPageData && (
                <p>当前页行数: {currentPageData.endLine - currentPageData.startLine + 1}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 默认导出
export default PaginatedMarkdownRenderer;