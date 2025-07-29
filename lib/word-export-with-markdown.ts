/**
 * Word导出时的Markdown处理器
 * 将Markdown转换为Word兼容的格式
 */

import { renderMarkdown } from './markdown-toolkit';

export interface WordExportOptions {
  /** 是否保留HTML格式 */
  preserveHtml?: boolean;
  /** 是否转换表格 */
  convertTables?: boolean;
  /** 是否转换代码块 */
  convertCodeBlocks?: boolean;
  /** 图片处理方式 */
  imageHandling?: 'embed' | 'link' | 'remove';
}

/**
 * 将Markdown内容转换为Word兼容的HTML
 */
export function convertMarkdownForWord(
  markdownContent: string,
  options: WordExportOptions = {}
): string {
  const {
    preserveHtml = true,
    convertTables = true,
    convertCodeBlocks = true,
    imageHandling = 'embed'
  } = options;

  // 使用完整的markdown渲染器
  let htmlContent = renderMarkdown(markdownContent, {
    breaks: true,
    tables: convertTables,
    highlight: convertCodeBlocks,
    html: preserveHtml,
    sanitize: false // Word导出时不需要清理HTML
  });

  // Word特定的HTML优化
  htmlContent = optimizeHtmlForWord(htmlContent, options);

  return htmlContent;
}

/**
 * 优化HTML以适配Word导出
 */
function optimizeHtmlForWord(html: string, options: WordExportOptions): string {
  let optimized = html;

  // 1. 处理标题 - 使用Word样式
  optimized = optimized.replace(/<h([1-6])([^>]*)>(.*?)<\/h[1-6]>/g, (match, level, attrs, content) => {
    const styles = {
      1: 'font-size: 24px; font-weight: bold; margin: 20px 0 10px 0; color: #1a1a1a;',
      2: 'font-size: 20px; font-weight: bold; margin: 18px 0 8px 0; color: #2a2a2a;',
      3: 'font-size: 18px; font-weight: bold; margin: 16px 0 6px 0; color: #3a3a3a;',
      4: 'font-size: 16px; font-weight: bold; margin: 14px 0 4px 0; color: #4a4a4a;',
      5: 'font-size: 14px; font-weight: bold; margin: 12px 0 2px 0; color: #5a5a5a;',
      6: 'font-size: 12px; font-weight: bold; margin: 10px 0 2px 0; color: #6a6a6a;'
    };
    return `<p style="${styles[level as keyof typeof styles]}">${content}</p>`;
  });

  // 2. 处理段落间距
  optimized = optimized.replace(/<p>/g, '<p style="margin: 8px 0; line-height: 1.6;">');

  // 3. 处理列表 - Word兼容格式
  optimized = optimized.replace(/<ul>/g, '<ul style="margin: 10px 0; padding-left: 20px;">');
  optimized = optimized.replace(/<ol>/g, '<ol style="margin: 10px 0; padding-left: 20px;">');
  optimized = optimized.replace(/<li>/g, '<li style="margin: 4px 0;">');

  // 4. 处理表格 - Word样式
  if (options.convertTables) {
    optimized = optimized.replace(/<table>/g, 
      '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #ddd;">');
    optimized = optimized.replace(/<th>/g, 
      '<th style="border: 1px solid #ddd; padding: 8px 12px; background-color: #f5f5f5; font-weight: bold; text-align: left;">');
    optimized = optimized.replace(/<td>/g, 
      '<td style="border: 1px solid #ddd; padding: 8px 12px;">');
  }

  // 5. 处理代码块 - Word兼容
  if (options.convertCodeBlocks) {
    optimized = optimized.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gs, (match, code) => {
      return `<div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 12px; margin: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; white-space: pre-wrap;">${code}</div>`;
    });

    optimized = optimized.replace(/<code>(.*?)<\/code>/g, 
      '<span style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 2px; padding: 2px 4px; font-family: \'Courier New\', monospace; font-size: 13px;">$1</span>');
  }

  // 6. 处理引用块
  optimized = optimized.replace(/<blockquote>/g, 
    '<div style="border-left: 4px solid #ddd; margin: 15px 0; padding: 10px 15px; background-color: #f9f9f9; font-style: italic;">');
  optimized = optimized.replace(/<\/blockquote>/g, '</div>');

  // 7. 处理图片
  switch (options.imageHandling) {
    case 'link':
      optimized = optimized.replace(/<img[^>]*src="([^"]*)"[^>]*>/g, 
        '<a href="$1" style="color: #0066cc; text-decoration: underline;">查看图片: $1</a>');
      break;
    case 'remove':
      optimized = optimized.replace(/<img[^>]*>/g, '');
      break;
    case 'embed':
    default:
      // 保持原样，Word会尝试嵌入图片
      break;
  }

  // 8. 处理链接样式
  optimized = optimized.replace(/<a([^>]*)>/g, '<a$1 style="color: #0066cc; text-decoration: underline;">');

  // 9. 处理强调文本
  optimized = optimized.replace(/<strong>/g, '<strong style="font-weight: bold;">');
  optimized = optimized.replace(/<em>/g, '<em style="font-style: italic;">');

  // 10. 清理多余的空白
  optimized = optimized.replace(/\n\s*\n/g, '\n');
  optimized = optimized.replace(/>\s+</g, '><');

  return optimized;
}

/**
 * 生成Word文档的完整HTML结构
 */
export function generateWordDocument(
  title: string,
  content: string,
  options: WordExportOptions = {}
): string {
  const processedContent = convertMarkdownForWord(content, options);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body {
            font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .document-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 30px;
            color: #1a1a1a;
            border-bottom: 2px solid #ddd;
            padding-bottom: 15px;
        }
        .document-content {
            margin-top: 20px;
        }
        @media print {
            body { margin: 0; padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="document-title">${title}</div>
    <div class="document-content">
        ${processedContent}
    </div>
</body>
</html>`;
}

/**
 * 导出为Word文件
 */
export function exportToWord(
  title: string,
  markdownContent: string,
  options: WordExportOptions = {}
): void {
  const htmlContent = generateWordDocument(title, markdownContent, options);
  
  // 创建Blob
  const blob = new Blob([htmlContent], {
    type: 'application/msword'
  });
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}