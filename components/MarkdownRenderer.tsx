/**
 * React Markdown 渲染组件 - 完整功能版本
 * 支持所有 Markdown 语法和扩展功能
 */

import React, { useMemo } from 'react';
import { renderMarkdown, MarkdownOptions, MarkdownPresets } from '../lib/markdown-renderer';

interface MarkdownRendererProps {
  /** Markdown 内容 */
  content: string;
  /** 渲染选项 */
  options?: MarkdownOptions;
  /** 预设配置 */
  preset?: keyof typeof MarkdownPresets;
  /** 自定义 CSS 类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否启用语法高亮 */
  enableSyntaxHighlight?: boolean;
  /** 是否启用数学公式渲染 */
  enableMath?: boolean;
  /** 点击链接的处理函数 */
  onLinkClick?: (url: string, event: React.MouseEvent) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  options,
  preset = 'standard',
  className = '',
  style,
  enableSyntaxHighlight = true,
  enableMath = false,
  onLinkClick
}) => {
  // 合并配置
  const finalOptions = useMemo(() => {
    const baseOptions = preset ? MarkdownPresets[preset] : {};
    return {
      ...baseOptions,
      highlight: enableSyntaxHighlight,
      math: enableMath,
      ...options
    };
  }, [options, preset, enableSyntaxHighlight, enableMath]);

  // 渲染 HTML
  const htmlContent = useMemo(() => {
    if (!content) return '';
    return renderMarkdown(content, finalOptions);
  }, [content, finalOptions]);

  // 处理链接点击
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onLinkClick) return;
    
    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      const link = target as HTMLAnchorElement;
      const url = link.href;
      
      // 只处理外部链接
      if (url && !url.startsWith('#')) {
        event.preventDefault();
        onLinkClick(url, event);
      }
    }
  };

  return (
    <div
      className={`markdown-renderer ${className}`}
      style={style}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// 预设组件
export const BasicMarkdownRenderer: React.FC<Omit<MarkdownRendererProps, 'preset'>> = (props) => (
  <MarkdownRenderer {...props} preset="basic" />
);

export const SafeMarkdownRenderer: React.FC<Omit<MarkdownRendererProps, 'preset'>> = (props) => (
  <MarkdownRenderer {...props} preset="safe" />
);

export const FullMarkdownRenderer: React.FC<Omit<MarkdownRendererProps, 'preset'>> = (props) => (
  <MarkdownRenderer {...props} preset="full" />
);

// Hook 版本
export function useMarkdownRenderer(content: string, options?: MarkdownOptions) {
  return useMemo(() => {
    if (!content) return '';
    return renderMarkdown(content, options);
  }, [content, options]);
}

// 默认样式
export const defaultMarkdownStyles = `
.markdown-renderer {
  line-height: 1.6;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.markdown-renderer h1,
.markdown-renderer h2,
.markdown-renderer h3,
.markdown-renderer h4,
.markdown-renderer h5,
.markdown-renderer h6 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-renderer h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.markdown-renderer h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.markdown-renderer h3 { font-size: 1.25em; }
.markdown-renderer h4 { font-size: 1em; }
.markdown-renderer h5 { font-size: 0.875em; }
.markdown-renderer h6 { font-size: 0.85em; color: #666; }

.markdown-renderer p {
  margin-bottom: 1em;
}

.markdown-renderer ul,
.markdown-renderer ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-renderer li {
  margin-bottom: 0.25em;
}

.markdown-renderer blockquote {
  margin: 1em 0;
  padding: 0 1em;
  border-left: 4px solid #ddd;
  color: #666;
  background-color: #f9f9f9;
}

.markdown-renderer pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-renderer code {
  background-color: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
}

.markdown-renderer pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-renderer table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-renderer th,
.markdown-renderer td {
  border: 1px solid #ddd;
  padding: 0.5em 1em;
  text-align: left;
}

.markdown-renderer th {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-renderer a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-renderer a:hover {
  text-decoration: underline;
}

.markdown-renderer img {
  max-width: 100%;
  height: auto;
}

.markdown-renderer hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 2em 0;
}

.markdown-renderer del {
  color: #666;
}

.markdown-renderer mark {
  background-color: #fff3cd;
  padding: 0.1em 0.2em;
}

.markdown-renderer kbd {
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d1d5da;
  color: #444d56;
  display: inline-block;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.85em;
  line-height: 1;
  padding: 0.2em 0.4em;
  vertical-align: middle;
}

.markdown-renderer .footnotes {
  margin-top: 2em;
  border-top: 1px solid #eee;
  padding-top: 1em;
  font-size: 0.9em;
}

.markdown-renderer .math-block {
  text-align: center;
  margin: 1em 0;
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.markdown-renderer .math-inline {
  background-color: #f6f8fa;
  padding: 0.1em 0.3em;
  border-radius: 3px;
}

.markdown-renderer .container {
  margin: 1em 0;
  padding: 1em;
  border-radius: 6px;
  border-left: 4px solid;
}

.markdown-renderer .container-warning {
  background-color: #fff3cd;
  border-left-color: #ffc107;
}

.markdown-renderer .container-info {
  background-color: #d1ecf1;
  border-left-color: #17a2b8;
}

.markdown-renderer .container-tip {
  background-color: #d4edda;
  border-left-color: #28a745;
}

.markdown-renderer .container-title {
  font-weight: 600;
  margin-bottom: 0.5em;
}

.markdown-renderer input[type="checkbox"] {
  margin-right: 0.5em;
}
`;

export default MarkdownRenderer;