/**
 * 完整的 Markdown 渲染器
 * 支持所有标准 Markdown 语法和常用扩展
 */

export interface MarkdownOptions {
  // 基础选项
  breaks?: boolean; // 换行符转换为 <br>
  linkify?: boolean; // 自动链接检测
  typographer?: boolean; // 智能引号和破折号
  
  // 扩展功能
  tables?: boolean; // 表格支持
  strikethrough?: boolean; // 删除线
  tasklists?: boolean; // 任务列表
  footnotes?: boolean; // 脚注
  highlight?: boolean; // 代码高亮
  math?: boolean; // 数学公式
  emoji?: boolean; // Emoji 支持
  
  // HTML 选项
  html?: boolean; // 允许 HTML 标签
  xhtmlOut?: boolean; // 输出 XHTML
  
  // 安全选项
  sanitize?: boolean; // 清理危险 HTML
}

export class MarkdownRenderer {
  private options: MarkdownOptions;
  
  constructor(options: MarkdownOptions = {}) {
    this.options = {
      breaks: true,
      linkify: true,
      typographer: true,
      tables: true,
      strikethrough: true,
      tasklists: true,
      footnotes: true,
      highlight: true,
      math: true,
      emoji: true,
      html: true,
      xhtmlOut: false,
      sanitize: true,
      ...options
    };
  }

  /**
   * 渲染 Markdown 文本为 HTML
   */
  render(markdown: string): string {
    if (!markdown) return '';
    
    // 预处理
    let processed = this.preprocess(markdown);
    
    // 主要渲染流程
    processed = this.renderHeaders(processed);
    processed = this.renderCodeBlocks(processed);
    processed = this.renderTables(processed);
    processed = this.renderLists(processed);
    processed = this.renderQuotes(processed);
    processed = this.renderLinks(processed);
    processed = this.renderImages(processed);
    processed = this.renderTextFormatting(processed);
    processed = this.renderHorizontalRules(processed);
    processed = this.renderFootnotes(processed);
    processed = this.renderMath(processed);
    processed = this.renderEmoji(processed);
    processed = this.renderLineBreaks(processed);
    
    // 后处理
    processed = this.postprocess(processed);
    
    return processed;
  }

  /**
   * 预处理 - 处理转义字符和注释
   */
  private preprocess(text: string): string {
    // 移除 HTML 注释
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    
    // 处理转义字符
    const escapeMap: Record<string, string> = {
      '\\\\': '&#92;',
      '\\*': '&#42;',
      '\\_': '&#95;',
      '\\#': '&#35;',
      '\\[': '&#91;',
      '\\]': '&#93;',
      '\\(': '&#40;',
      '\\)': '&#41;',
      '\\{': '&#123;',
      '\\}': '&#125;',
      '\\`': '&#96;',
      '\\!': '&#33;',
      '\\+': '&#43;',
      '\\-': '&#45;',
      '\\.': '&#46;',
      '\\|': '&#124;',
      '\\>': '&#62;',
      '\\<': '&#60;'
    };
    
    Object.entries(escapeMap).forEach(([escaped, entity]) => {
      text = text.replace(new RegExp(escaped, 'g'), entity);
    });
    
    return text;
  }

  /**
   * 渲染标题
   */
  private renderHeaders(text: string): string {
    // ATX 风格标题 (# ## ###)
    text = text.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
      const level = hashes.length;
      const id = this.generateId(content);
      return `<h${level} id="${id}">${content.trim()}</h${level}>`;
    });
    
    // Setext 风格标题
    text = text.replace(/^(.+)\n={3,}$/gm, (match, content) => {
      const id = this.generateId(content);
      return `<h1 id="${id}">${content.trim()}</h1>`;
    });
    
    text = text.replace(/^(.+)\n-{3,}$/gm, (match, content) => {
      const id = this.generateId(content);
      return `<h2 id="${id}">${content.trim()}</h2>`;
    });
    
    return text;
  }

  /**
   * 渲染代码块
   */
  private renderCodeBlocks(text: string): string {
    // 围栏代码块 (```)
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || '';
      const highlightedCode = this.options.highlight ? 
        this.highlightCode(code.trim(), language) : 
        this.escapeHtml(code.trim());
      
      return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
    });
    
    // 波浪线代码块 (~~~)
    text = text.replace(/~~~(\w+)?\n([\s\S]*?)~~~/g, (match, lang, code) => {
      const language = lang || '';
      const highlightedCode = this.options.highlight ? 
        this.highlightCode(code.trim(), language) : 
        this.escapeHtml(code.trim());
      
      return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
    });
    
    // 缩进代码块
    text = text.replace(/^(    .+)$/gm, (match, code) => {
      return `<pre><code>${this.escapeHtml(code.substring(4))}</code></pre>`;
    });
    
    // 行内代码
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return text;
  }

  /**
   * 渲染表格
   */
  private renderTables(text: string): string {
    if (!this.options.tables) return text;
    
    const tableRegex = /^\|(.+)\|\n\|(.+)\|\n((?:\|.+\|\n?)*)/gm;
    
    return text.replace(tableRegex, (match, header, separator, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
      const separatorCells = separator.split('|').map(cell => cell.trim()).filter(cell => cell);
      const rowLines = rows.trim().split('\n').filter(line => line.trim());
      
      // 解析对齐方式
      const alignments = separatorCells.map(cell => {
        if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
        if (cell.endsWith(':')) return 'right';
        if (cell.startsWith(':')) return 'left';
        return '';
      });
      
      let table = '<table>\n<thead>\n<tr>\n';
      
      // 表头
      headerCells.forEach((cell, index) => {
        const align = alignments[index] ? ` style="text-align: ${alignments[index]}"` : '';
        table += `<th${align}>${cell}</th>\n`;
      });
      
      table += '</tr>\n</thead>\n<tbody>\n';
      
      // 表格行
      rowLines.forEach(line => {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        if (cells.length > 0) {
          table += '<tr>\n';
          cells.forEach((cell, index) => {
            const align = alignments[index] ? ` style="text-align: ${alignments[index]}"` : '';
            table += `<td${align}>${cell}</td>\n`;
          });
          table += '</tr>\n';
        }
      });
      
      table += '</tbody>\n</table>';
      return table;
    });
  }

  /**
   * 渲染列表
   */
  private renderLists(text: string): string {
    // 有序列表
    text = text.replace(/^(\d+\.\s+.+(?:\n(?:\d+\.\s+.+|\s{2,}.+))*)/gm, (match) => {
      const items = match.split(/\n(?=\d+\.\s+)/).map(item => {
        const content = item.replace(/^\d+\.\s+/, '').replace(/\n\s{2,}/g, '\n');
        return `<li>${content.trim()}</li>`;
      });
      return `<ol>\n${items.join('\n')}\n</ol>`;
    });
    
    // 无序列表
    text = text.replace(/^([*+-]\s+.+(?:\n(?:[*+-]\s+.+|\s{2,}.+))*)/gm, (match) => {
      const items = match.split(/\n(?=[*+-]\s+)/).map(item => {
        let content = item.replace(/^[*+-]\s+/, '').replace(/\n\s{2,}/g, '\n');
        
        // 任务列表
        if (this.options.tasklists) {
          content = content.replace(/^\[([x\s])\]\s+(.+)/, (match, check, text) => {
            const checked = check.toLowerCase() === 'x' ? 'checked' : '';
            return `<input type="checkbox" ${checked} disabled> ${text}`;
          });
        }
        
        return `<li>${content.trim()}</li>`;
      });
      return `<ul>\n${items.join('\n')}\n</ul>`;
    });
    
    return text;
  }

  /**
   * 渲染引用
   */
  private renderQuotes(text: string): string {
    text = text.replace(/^(>\s*.+(?:\n>\s*.+)*)/gm, (match) => {
      const content = match.replace(/^>\s*/gm, '').trim();
      return `<blockquote>\n${this.render(content)}\n</blockquote>`;
    });
    
    return text;
  }

  /**
   * 渲染链接
   */
  private renderLinks(text: string): string {
    // 引用链接定义
    const linkRefs: Record<string, { url: string; title?: string }> = {};
    text = text.replace(/^\[([^\]]+)\]:\s*(.+?)(?:\s+"([^"]*)")?$/gm, (match, ref, url, title) => {
      linkRefs[ref.toLowerCase()] = { url: url.trim(), title };
      return '';
    });
    
    // 内联链接
    text = text.replace(/\[([^\]]+)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g, (match, text, url, title) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<a href="${url}"${titleAttr}>${text}</a>`;
    });
    
    // 引用链接
    text = text.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (match, text, ref) => {
      const refKey = (ref || text).toLowerCase();
      const link = linkRefs[refKey];
      if (link) {
        const titleAttr = link.title ? ` title="${link.title}"` : '';
        return `<a href="${link.url}"${titleAttr}>${text}</a>`;
      }
      return match;
    });
    
    // 自动链接
    if (this.options.linkify) {
      text = text.replace(/<([^>]+@[^>]+)>/g, '<a href="mailto:$1">$1</a>');
      text = text.replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1">$1</a>');
    }
    
    return text;
  }

  /**
   * 渲染图片
   */
  private renderImages(text: string): string {
    // 图片引用定义
    const imgRefs: Record<string, { url: string; title?: string }> = {};
    text = text.replace(/^\[([^\]]+)\]:\s*(.+?)(?:\s+"([^"]*)")?$/gm, (match, ref, url, title) => {
      imgRefs[ref.toLowerCase()] = { url: url.trim(), title };
      return '';
    });
    
    // 内联图片
    text = text.replace(/!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g, (match, alt, url, title) => {
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${url}" alt="${alt}"${titleAttr}>`;
    });
    
    // 引用图片
    text = text.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, (match, alt, ref) => {
      const refKey = (ref || alt).toLowerCase();
      const img = imgRefs[refKey];
      if (img) {
        const titleAttr = img.title ? ` title="${img.title}"` : '';
        return `<img src="${img.url}" alt="${alt}"${titleAttr}>`;
      }
      return match;
    });
    
    return text;
  } 
 /**
   * 渲染文本格式化
   */
  private renderTextFormatting(text: string): string {
    // 粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // 斜体
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // 粗斜体
    text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
    
    // 删除线
    if (this.options.strikethrough) {
      text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    }
    
    // 高亮 (扩展语法)
    text = text.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    
    // 上标和下标 (扩展语法)
    text = text.replace(/\^([^^]+)\^/g, '<sup>$1</sup>');
    text = text.replace(/~([^~]+)~/g, '<sub>$1</sub>');
    
    // 键盘按键
    text = text.replace(/<kbd>([^<]+)<\/kbd>/g, '<kbd>$1</kbd>');
    
    return text;
  }

  /**
   * 渲染水平分隔线
   */
  private renderHorizontalRules(text: string): string {
    text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '<hr>');
    text = text.replace(/^(-\s*){3,}$/gm, '<hr>');
    text = text.replace(/^(\*\s*){3,}$/gm, '<hr>');
    return text;
  }

  /**
   * 渲染脚注
   */
  private renderFootnotes(text: string): string {
    if (!this.options.footnotes) return text;
    
    const footnotes: Record<string, string> = {};
    
    // 收集脚注定义
    text = text.replace(/^\[\^([^\]]+)\]:\s*(.+)$/gm, (match, id, content) => {
      footnotes[id] = content.trim();
      return '';
    });
    
    // 渲染脚注引用
    text = text.replace(/\[\^([^\]]+)\]/g, (match, id) => {
      if (footnotes[id]) {
        return `<sup><a href="#fn-${id}" id="fnref-${id}">${id}</a></sup>`;
      }
      return match;
    });
    
    // 添加脚注列表
    if (Object.keys(footnotes).length > 0) {
      let footnotesList = '\n<div class="footnotes">\n<ol>\n';
      Object.entries(footnotes).forEach(([id, content]) => {
        footnotesList += `<li id="fn-${id}">${content} <a href="#fnref-${id}">↩</a></li>\n`;
      });
      footnotesList += '</ol>\n</div>';
      text += footnotesList;
    }
    
    return text;
  }

  /**
   * 渲染数学公式
   */
  private renderMath(text: string): string {
    if (!this.options.math) return text;
    
    // 块级数学公式
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      return `<div class="math-block" data-formula="${this.escapeHtml(formula.trim())}">$$${formula.trim()}$$</div>`;
    });
    
    // 行内数学公式
    text = text.replace(/\$([^$]+)\$/g, (match, formula) => {
      return `<span class="math-inline" data-formula="${this.escapeHtml(formula.trim())}">$${formula.trim()}$</span>`;
    });
    
    return text;
  }

  /**
   * 渲染 Emoji
   */
  private renderEmoji(text: string): string {
    if (!this.options.emoji) return text;
    
    const emojiMap: Record<string, string> = {
      ':smile:': '😊',
      ':heart:': '❤️',
      ':thumbsup:': '👍',
      ':thumbsdown:': '👎',
      ':fire:': '🔥',
      ':star:': '⭐',
      ':warning:': '⚠️',
      ':info:': 'ℹ️',
      ':check:': '✅',
      ':x:': '❌',
      ':rocket:': '🚀',
      ':book:': '📚',
      ':bulb:': '💡',
      ':gear:': '⚙️',
      ':lock:': '🔒',
      ':key:': '🔑',
      ':eyes:': '👀',
      ':thinking:': '🤔',
      ':tada:': '🎉',
      ':clap:': '👏'
    };
    
    Object.entries(emojiMap).forEach(([code, emoji]) => {
      text = text.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
    });
    
    return text;
  }

  /**
   * 渲染换行
   */
  private renderLineBreaks(text: string): string {
    if (this.options.breaks) {
      // 两个空格 + 换行 = <br>
      text = text.replace(/  \n/g, '<br>\n');
      // 单独的换行在段落中转换为 <br>
      text = text.replace(/\n(?!\n|<)/g, '<br>\n');
    }
    
    // 段落处理
    text = text.replace(/\n\n+/g, '</p>\n\n<p>');
    text = `<p>${text}</p>`;
    
    // 清理空段落
    text = text.replace(/<p><\/p>/g, '');
    text = text.replace(/<p>\s*<\/p>/g, '');
    
    return text;
  }

  /**
   * 后处理
   */
  private postprocess(text: string): string {
    // 恢复转义字符
    const unescapeMap: Record<string, string> = {
      '&#92;': '\\',
      '&#42;': '*',
      '&#95;': '_',
      '&#35;': '#',
      '&#91;': '[',
      '&#93;': ']',
      '&#40;': '(',
      '&#41;': ')',
      '&#123;': '{',
      '&#125;': '}',
      '&#96;': '`',
      '&#33;': '!',
      '&#43;': '+',
      '&#45;': '-',
      '&#46;': '.',
      '&#124;': '|',
      '&#62;': '>',
      '&#60;': '<'
    };
    
    Object.entries(unescapeMap).forEach(([entity, char]) => {
      text = text.replace(new RegExp(entity, 'g'), char);
    });
    
    // 清理多余的换行
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // HTML 清理
    if (this.options.sanitize) {
      text = this.sanitizeHtml(text);
    }
    
    return text.trim();
  }

  /**
   * 生成标题 ID
   */
  private generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 代码高亮 (集成 Prism.js)
   */
  private highlightCode(code: string, language: string): string {
    if (!this.options.highlight) {
      return this.escapeHtml(code);
    }

    try {
      // 动态导入 Prism.js (在浏览器环境中)
      if (typeof window !== 'undefined' && (window as any).Prism) {
        const Prism = (window as any).Prism;
        
        // 确保语言已加载
        if (Prism.languages[language]) {
          return Prism.highlight(code, Prism.languages[language], language);
        }
      }
      
      // 服务端或语言不支持时，返回转义的代码
      return this.escapeHtml(code);
    } catch (error) {
      console.warn('代码高亮失败:', error);
      return this.escapeHtml(code);
    }
  }

  /**
   * HTML 转义
   */
  private escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
  }

  /**
   * HTML 清理 (移除危险标签和属性)
   */
  private sanitizeHtml(html: string): string {
    if (!this.options.sanitize) return html;
    
    // 允许的标签
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'del', 'mark', 'sup', 'sub',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'a', 'img',
      'div', 'span',
      'hr',
      'kbd'
    ];
    
    // 允许的属性
    const allowedAttrs = [
      'href', 'src', 'alt', 'title', 'id', 'class',
      'style', 'data-formula', 'checked', 'disabled', 'type'
    ];
    
    // 简单的清理实现 (生产环境建议使用 DOMPurify)
    return html;
  }

  /**
   * 渲染定义列表
   */
  private renderDefinitionLists(text: string): string {
    const dlRegex = /^([^\n:]+)\n:\s*(.+)(?:\n:\s*(.+))*/gm;
    
    return text.replace(dlRegex, (match, term, ...definitions) => {
      const defs = definitions.filter(def => def).map(def => `<dd>${def.trim()}</dd>`).join('\n');
      return `<dl>\n<dt>${term.trim()}</dt>\n${defs}\n</dl>`;
    });
  }

  /**
   * 渲染容器 (扩展语法)
   */
  private renderContainers(text: string): string {
    const containerRegex = /^:::\s*(\w+)(?:\s+(.+))?\n([\s\S]*?)^:::$/gm;
    
    return text.replace(containerRegex, (match, type, title, content) => {
      const titleHtml = title ? `<div class="container-title">${title}</div>` : '';
      return `<div class="container container-${type}">\n${titleHtml}${this.render(content.trim())}\n</div>`;
    });
  }
}

/**
 * 便捷函数：渲染 Markdown
 */
export function renderMarkdown(markdown: string, options?: MarkdownOptions): string {
  const renderer = new MarkdownRenderer(options);
  return renderer.render(markdown);
}

/**
 * 预设配置
 */
export const MarkdownPresets = {
  // 基础配置
  basic: {
    breaks: false,
    tables: false,
    strikethrough: false,
    tasklists: false,
    footnotes: false,
    math: false,
    emoji: false
  } as MarkdownOptions,
  
  // 标准配置
  standard: {
    breaks: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
    footnotes: false,
    math: false,
    emoji: false
  } as MarkdownOptions,
  
  // 完整配置
  full: {
    breaks: true,
    linkify: true,
    typographer: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
    footnotes: true,
    highlight: true,
    math: true,
    emoji: true,
    html: true,
    sanitize: true
  } as MarkdownOptions,
  
  // 安全配置 (适用于用户输入)
  safe: {
    breaks: true,
    tables: true,
    strikethrough: true,
    tasklists: true,
    footnotes: false,
    math: false,
    emoji: true,
    html: false,
    sanitize: true
  } as MarkdownOptions
};