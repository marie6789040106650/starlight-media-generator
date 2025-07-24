/**
 * 网页专用Markdown渲染器
 * 专门为网页展示优化，确保Markdown正确渲染为HTML
 */

import { generateHeadingId } from './utils';

export interface WebMarkdownOptions {
  breaks?: boolean;
  tables?: boolean;
  codeHighlight?: boolean;
  sanitize?: boolean;
}

/**
 * 网页Markdown渲染器
 */
export function renderWebMarkdown(markdown: string, options: WebMarkdownOptions = {}): string {
  if (!markdown) return '';

  const { breaks = true, tables = true, codeHighlight = true, sanitize = true } = options;

  let html = markdown;

  // 1. 处理代码块 (```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || '';
    const escapedCode = escapeHtml(code.trim());
    return `<pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>`;
  });

  // 2. 处理行内代码 (`)
  html = html.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');

  // 3. 处理标题 (# ## ###)
  let headingIndex = 0;
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
    const level = hashes.length;
    let title = content.trim();

    // 去掉标题前后的 * 号
    title = title.replace(/^\*+|\*+$/g, '').trim();

    // 使用与 parseMarkdownToc 相同的 ID 生成逻辑
    const id = generateHeadingId(headingIndex, title);
    headingIndex++;

    return `<h${level} id="${id}" class="heading-${level}">${title}</h${level}>`;
  });

  // 4. 处理粗体 (**)
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');

  // 5. 处理斜体 (*)
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  // 6. 处理删除线 (~~)
  html = html.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

  // 7. 处理链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 8. 处理图片 ![alt](src)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" />');

  // 9. 处理表格 (如果启用)
  if (tables) {
    html = renderTables(html);
  }

  // 10. 处理无序列表 (- * +)
  html = html.replace(/^([*+-])\s+(.+)$/gm, '<li class="list-item">$2</li>');

  // 11. 处理有序列表 (1. 2. 3.)
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="ordered-list-item">$1</li>');

  // 12. 处理引用 (>)
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote class="quote">$1</blockquote>');

  // 13. 处理水平线 (---)
  html = html.replace(/^-{3,}$/gm, '<hr class="horizontal-rule" />');

  // 14. 包装列表项
  html = html.replace(/(<li class="list-item">.*?<\/li>)/gs, '<ul class="unordered-list">$1</ul>');
  html = html.replace(/(<li class="ordered-list-item">.*?<\/li>)/gs, '<ol class="ordered-list">$1</ol>');

  // 15. 处理段落 - 重要：确保换行正确处理
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inCodeBlock = false;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检查是否在代码块中
    if (line.includes('<pre class="code-block">')) inCodeBlock = true;
    if (line.includes('</pre>')) inCodeBlock = false;

    // 检查是否在列表中
    if (line.includes('<ul class="unordered-list">') || line.includes('<ol class="ordered-list">')) inList = true;
    if (line.includes('</ul>') || line.includes('</ol>')) inList = false;

    if (inCodeBlock || inList) {
      processedLines.push(line);
    } else if (line === '') {
      processedLines.push('</p><p class="paragraph">');
    } else if (!line.startsWith('<h') && !line.startsWith('<blockquote') && !line.startsWith('<hr') && !line.startsWith('<table') && !line.startsWith('<ul') && !line.startsWith('<ol') && !line.startsWith('<pre')) {
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }

  html = processedLines.join('\n');

  // 16. 包装段落
  html = `<p class="paragraph">${html}</p>`;

  // 17. 清理空段落和多余标签
  html = html.replace(/<p class="paragraph"><\/p>/g, '');
  html = html.replace(/<p class="paragraph">\s*<\/p>/g, '');
  html = html.replace(/<p class="paragraph">(<h[1-6])/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<blockquote)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<hr)/g, '$1');
  html = html.replace(/(<hr[^>]*>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<table)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<ul)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<ol)/g, '$1');
  html = html.replace(/(<\/ol>)<\/p>/g, '$1');
  html = html.replace(/<p class="paragraph">(<pre)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');

  // 18. 处理换行
  if (breaks) {
    html = html.replace(/\n/g, '<br />');
  }

  return html;
}

/**
 * 处理表格
 */
function renderTables(html: string): string {
  const tableRegex = /^\|(.+)\|\s*\n\|(.+)\|\s*\n((?:\|.+\|\s*\n?)*)/gm;

  return html.replace(tableRegex, (match, header, separator, rows) => {
    const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
    const rowLines = rows.trim().split('\n').filter((line: string) => line.trim());

    let table = '<table class="markdown-table">\n<thead>\n<tr>';

    // 表头
    headerCells.forEach((cell: string) => {
      table += `<th class="table-header">${cell}</th>`;
    });

    table += '</tr>\n</thead>\n<tbody>\n';

    // 表格行
    rowLines.forEach((line: string) => {
      const cells = line.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell !== '');
      if (cells.length > 0) {
        table += '<tr>';
        cells.forEach((cell: string) => {
          table += `<td class="table-cell">${cell}</td>`;
        });
        table += '</tr>\n';
      }
    });

    table += '</tbody>\n</table>';
    return table;
  });
}

/**
 * HTML转义
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}