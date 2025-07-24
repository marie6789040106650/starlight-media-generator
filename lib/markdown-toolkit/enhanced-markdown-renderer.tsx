/**
 * 增强的 Markdown 渲染器 - 集成到现有系统
 * 支持所有 Markdown 语法、数学公式、语法高亮等完整功能
 */

"use client"

import React, { useEffect, useMemo } from 'react';
import { renderMarkdown, MarkdownOptions, MarkdownPresets } from './markdown-renderer';

interface EnhancedMarkdownRendererProps {
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
  /** 是否显示行号 */
  showLineNumbers?: boolean;
  /** 代码主题 */
  codeTheme?: 'light' | 'dark';
}

export const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({
  content,
  options,
  preset = 'full', // 默认使用完整功能
  className = '',
  style,
  enableSyntaxHighlight = true,
  enableMath = true,
  onLinkClick,
  showLineNumbers = true,
  codeTheme = 'light'
}) => {
  // 加载必要的外部库
  useEffect(() => {
    const loadExternalLibraries = async () => {
      // 加载 Prism.js 用于语法高亮
      if (enableSyntaxHighlight && typeof window !== 'undefined') {
        if (!(window as any).Prism) {
          // 动态加载 Prism.js
          const prismScript = document.createElement('script');
          prismScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-core.min.js';
          document.head.appendChild(prismScript);

          prismScript.onload = () => {
            // 加载常用语言支持
            const languages = [
              'markup', 'css', 'javascript', 'typescript', 'jsx', 'tsx',
              'python', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby',
              'go', 'rust', 'swift', 'kotlin', 'scala', 'sql', 'json',
              'yaml', 'markdown', 'bash', 'powershell', 'docker'
            ];

            languages.forEach(lang => {
              const langScript = document.createElement('script');
              langScript.src = `https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/prism-${lang}.min.js`;
              document.head.appendChild(langScript);
            });
          };

          // 加载 Prism.js 样式
          const prismCSS = document.createElement('link');
          prismCSS.rel = 'stylesheet';
          prismCSS.href = codeTheme === 'dark' 
            ? 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism-tomorrow.css'
            : 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/themes/prism.css';
          document.head.appendChild(prismCSS);

          // 加载行号插件
          if (showLineNumbers) {
            const lineNumbersScript = document.createElement('script');
            lineNumbersScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/plugins/line-numbers/prism-line-numbers.min.js';
            document.head.appendChild(lineNumbersScript);

            const lineNumbersCSS = document.createElement('link');
            lineNumbersCSS.rel = 'stylesheet';
            lineNumbersCSS.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/plugins/line-numbers/prism-line-numbers.css';
            document.head.appendChild(lineNumbersCSS);
          }
        }
      }

      // 加载 KaTeX 用于数学公式
      if (enableMath && typeof window !== 'undefined') {
        if (!(window as any).katex) {
          // 加载 KaTeX 样式
          const katexCSS = document.createElement('link');
          katexCSS.rel = 'stylesheet';
          katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css';
          document.head.appendChild(katexCSS);

          // 加载 KaTeX 脚本
          const katexScript = document.createElement('script');
          katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js';
          document.head.appendChild(katexScript);

          katexScript.onload = () => {
            // 加载自动渲染插件
            const autoRenderScript = document.createElement('script');
            autoRenderScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js';
            document.head.appendChild(autoRenderScript);
          };
        }
      }
    };

    loadExternalLibraries();
  }, [enableSyntaxHighlight, enableMath, showLineNumbers, codeTheme]);

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

  // 处理数学公式渲染
  useEffect(() => {
    if (enableMath && typeof window !== 'undefined' && (window as any).renderMathInElement) {
      const container = document.querySelector('.enhanced-markdown-renderer');
      if (container) {
        (window as any).renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      }
    }
  }, [htmlContent, enableMath]);

  // 处理语法高亮
  useEffect(() => {
    if (enableSyntaxHighlight && typeof window !== 'undefined' && (window as any).Prism) {
      (window as any).Prism.highlightAll();
    }
  }, [htmlContent, enableSyntaxHighlight]);

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
      className={`enhanced-markdown-renderer ${showLineNumbers ? 'line-numbers' : ''} ${className}`}
      style={style}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// 预设组件
export const BasicMarkdownRenderer: React.FC<Omit<EnhancedMarkdownRendererProps, 'preset'>> = (props) => (
  <EnhancedMarkdownRenderer {...props} preset="basic" />
);

export const SafeMarkdownRenderer: React.FC<Omit<EnhancedMarkdownRendererProps, 'preset'>> = (props) => (
  <EnhancedMarkdownRenderer {...props} preset="safe" />
);

export const FullMarkdownRenderer: React.FC<Omit<EnhancedMarkdownRendererProps, 'preset'>> = (props) => (
  <EnhancedMarkdownRenderer {...props} preset="full" />
);

// Hook 版本
export function useEnhancedMarkdownRenderer(content: string, options?: MarkdownOptions) {
  return useMemo(() => {
    if (!content) return '';
    return renderMarkdown(content, { ...MarkdownPresets.full, ...options });
  }, [content, options]);
}

// 默认导出
export default EnhancedMarkdownRenderer;