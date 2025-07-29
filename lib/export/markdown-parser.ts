export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

export interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'text' | 'blockquote' | 'table' | 'codeblock' | 'separator'
  text: string
  level?: number
  items?: string[]
  formattedContent?: FormattedText[] // 添加格式化内容
  quoteLevel?: number // 引用块的嵌套级别
  language?: string // 代码块语言
  tableHeaders?: string[] // 表格头部
  tableRows?: string[][] // 表格行数据
  tableAlignment?: ('left' | 'center' | 'right')[] // 表格对齐方式
}

// 清理文本中的转义序列和特殊字符
function cleanText(text: string): string {
  // 替换常见的转义序列
  return text
    .replace(/\\n/g, ' ') // 将\n替换为空格
    .replace(/\\r/g, ' ') // 将\r替换为空格
    .replace(/\\t/g, ' ') // 将\t替换为空格
    .replace(/\\\\/g, '\\') // 将\\替换为\
    .replace(/\\"/g, '"') // 将\"替换为"
    .replace(/\\'/g, "'"); // 将\'替换为'
}

// 扩展 FormattedText 接口以支持更多格式
interface ExtendedFormattedText extends FormattedText {
  strikethrough?: boolean;
  link?: string;
  isImage?: boolean;
  imageAlt?: string;
  isTaskItem?: boolean;
  checked?: boolean;
}

// 解析行内格式（加粗、斜体、删除线、链接等）
function parseInlineFormatting(text: string): FormattedText[] {
  // 首先清理文本中的转义序列
  const cleanedText = cleanText(text);
  const result: FormattedText[] = [];
  
  let currentIndex = 0;
  let remainingText = cleanedText;
  
  // 处理所有格式的正则表达式
  // 1. 链接: [text](url)
  // 2. 图片: ![alt](url)
  // 3. 删除线: ~~text~~
  // 4. 加粗斜体: ***text*** 或 ___text___
  // 5. 加粗: **text** 或 __text__
  // 6. 斜体: *text* 或 _text_
  // 7. 代码: `text`
  
  // 先处理链接和图片，因为它们的格式更复杂
  const linkRegex = /(!?\[([^\]]*)\]\(([^)]+)\))/g;
  let linkMatch;
  
  while ((linkMatch = linkRegex.exec(remainingText)) !== null) {
    // 添加链接前的普通文本
    if (linkMatch.index > currentIndex) {
      const plainText = remainingText.substring(currentIndex, linkMatch.index);
      if (plainText) {
        // 处理普通文本中的其他格式
        const formattedPlainText = parseBasicFormatting(plainText);
        result.push(...formattedPlainText);
      }
    }
    
    const [fullMatch, _, linkText, url] = linkMatch;
    const isImage = fullMatch.startsWith('!');
    
    if (isImage) {
      // 处理图片
      result.push({
        text: linkText || '图片',
        isImage: true,
        imageAlt: linkText,
        link: url
      } as ExtendedFormattedText);
    } else {
      // 处理链接
      result.push({
        text: linkText,
        link: url
      } as ExtendedFormattedText);
    }
    
    currentIndex = linkMatch.index + fullMatch.length;
  }
  
  // 处理剩余文本中的基本格式
  if (currentIndex < remainingText.length) {
    const plainText = remainingText.substring(currentIndex);
    if (plainText) {
      const formattedPlainText = parseBasicFormatting(plainText);
      result.push(...formattedPlainText);
    }
  }
  
  return result;
}

// 处理基本文本格式（加粗、斜体、删除线、代码）
function parseBasicFormatting(text: string): FormattedText[] {
  const result: FormattedText[] = [];
  let currentIndex = 0;
  let remainingText = text;
  
  // 匹配基本格式
  // 删除线: ~~text~~
  // 加粗斜体: ***text*** 或 ___text___
  // 加粗: **text** 或 __text__
  // 斜体: *text* 或 _text_
  // 代码: `text`
  const formatRegex = /(~~|\*\*\*|\*\*|\*|___|\__|_|`)(.*?)\1/g;
  let match;
  
  while ((match = formatRegex.exec(remainingText)) !== null) {
    // 添加格式前的普通文本
    if (match.index > currentIndex) {
      const plainText = remainingText.substring(currentIndex, match.index);
      if (plainText) {
        result.push({ text: plainText });
      }
    }
    
    const [fullMatch, format, content] = match;
    
    // 根据格式标记添加相应的格式
    const formattedText: ExtendedFormattedText = { text: content };
    
    if (format === '~~') {
      formattedText.strikethrough = true;
    } else if (format === '***' || format === '___') {
      formattedText.bold = true;
      formattedText.italic = true;
    } else if (format === '**' || format === '__') {
      formattedText.bold = true;
    } else if (format === '*' || format === '_') {
      formattedText.italic = true;
    } else if (format === '`') {
      formattedText.code = true;
    }
    
    result.push(formattedText);
    
    currentIndex = match.index + fullMatch.length;
  }
  
  // 添加剩余的普通文本
  if (currentIndex < remainingText.length) {
    const plainText = remainingText.substring(currentIndex);
    if (plainText) {
      result.push({ text: plainText });
    }
  }
  
  return result;
}

// 处理特殊字符和表情符号
function handleSpecialCharacters(text: string): string {
  // 替换常见的特殊字符和表情符号
  return text
    // 处理常见的表情符号
    .replace(/⚠️/g, '警告')
    .replace(/✅/g, '完成')
    .replace(/❌/g, '错误')
    .replace(/📝/g, '笔记')
    .replace(/📌/g, '重点')
    .replace(/🔍/g, '搜索')
    .replace(/🚀/g, '启动')
    .replace(/💡/g, '提示')
    .replace(/⭐/g, '星级')
    .replace(/👍/g, '赞同')
    // 处理其他可能的特殊字符
    .replace(/[^\u0020-\u007E\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF]/g, ''); // 移除不可打印字符，保留ASCII、中文等常用字符
}

export function parseMarkdownContent(content: string): ParsedContent[] {
  if (!content || content.trim() === '') {
    return []
  }

  // 预处理内容，替换转义序列
  content = content
    .replace(/\\n/g, ' ') // 将\n替换为空格
    .replace(/\\r/g, ' ') // 将\r替换为空格
    .replace(/\\t/g, ' ') // 将\t替换为空格
    .replace(/\\\\/g, '\\'); // 将\\替换为\

  const lines = content.split('\n')
  const parsed: ParsedContent[] = []
  let currentList: string[] = []
  let currentQuote: string[] = []
  let currentQuoteLevel = 0
  let currentCodeBlock: string[] = []
  let currentCodeLanguage = ''
  let inCodeBlock = false

  for (let i = 0; i < lines.length; i++) {
    // 清理每一行的文本
    let line = lines[i].trim()
    line = handleSpecialCharacters(line)
    
    // 处理代码块
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true
        currentCodeLanguage = line.substring(3).trim()
        
        // 完成当前列表和引用块
        if (currentList.length > 0) {
          parsed.push({
            type: 'list',
            text: '',
            items: [...currentList]
          })
          currentList = []
        }
        
        if (currentQuote.length > 0) {
          const quoteText = currentQuote.join('\n')
          const formattedContent = parseInlineFormatting(quoteText)
          
          parsed.push({
            type: 'blockquote',
            text: quoteText,
            quoteLevel: currentQuoteLevel,
            formattedContent: formattedContent
          })
          currentQuote = []
          currentQuoteLevel = 0
        }
      } else {
        // 结束代码块
        inCodeBlock = false
        const codeText = currentCodeBlock.join('\n')
        
        parsed.push({
          type: 'codeblock',
          text: codeText,
          language: currentCodeLanguage
        })
        
        currentCodeBlock = []
        currentCodeLanguage = ''
      }
      continue
    }
    
    // 如果在代码块中，直接添加到代码块内容
    if (inCodeBlock) {
      currentCodeBlock.push(lines[i]) // 保留原始格式，不trim
      continue
    }
    
    // 处理分隔线
    if (line === '---' || line === '***' || line === '___') {
      // 完成当前列表和引用块
      if (currentList.length > 0) {
        parsed.push({
          type: 'list',
          text: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      
      parsed.push({
        type: 'separator',
        text: '---'
      })
      continue
    }
    
    // 处理表格
    if (line.includes('|') && line.split('|').length >= 3) {
      // 检查是否是表格行
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      
      // 检查下一行是否是表格分隔符
      let isTable = false
      let alignment: ('left' | 'center' | 'right')[] = []
      
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim()
        if (nextLine.includes('|') && nextLine.includes('-')) {
          const alignCells = nextLine.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
          if (alignCells.length === cells.length) {
            isTable = true
            alignment = alignCells.map(cell => {
              if (cell.startsWith(':') && cell.endsWith(':')) return 'center'
              if (cell.endsWith(':')) return 'right'
              return 'left'
            })
          }
        }
      }
      
      if (isTable) {
        // 完成当前列表和引用块
        if (currentList.length > 0) {
          parsed.push({
            type: 'list',
            text: '',
            items: [...currentList]
          })
          currentList = []
        }
        
        if (currentQuote.length > 0) {
          const quoteText = currentQuote.join('\n')
          const formattedContent = parseInlineFormatting(quoteText)
          
          parsed.push({
            type: 'blockquote',
            text: quoteText,
            quoteLevel: currentQuoteLevel,
            formattedContent: formattedContent
          })
          currentQuote = []
          currentQuoteLevel = 0
        }
        
        // 解析表格
        const tableRows: string[][] = []
        i++ // 跳过分隔符行
        
        // 继续读取表格行
        for (let j = i + 1; j < lines.length; j++) {
          const rowLine = lines[j].trim()
          if (rowLine.includes('|')) {
            const rowCells = rowLine.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
            if (rowCells.length === cells.length) {
              tableRows.push(rowCells)
              i = j // 更新当前行索引
            } else {
              break
            }
          } else {
            break
          }
        }
        
        parsed.push({
          type: 'table',
          text: '',
          tableHeaders: cells,
          tableRows: tableRows,
          tableAlignment: alignment
        })
        continue
      }
    }
    
    if (line === '') {
      // 如果有未完成的列表，先添加它
      if (currentList.length > 0) {
        parsed.push({
          type: 'list',
          text: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      // 如果有未完成的引用块，先添加它
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      continue
    }

    // 引用块解析
    if (line.startsWith('>')) {
      // 完成当前列表
      if (currentList.length > 0) {
        parsed.push({
          type: 'list',
          text: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      // 计算引用嵌套级别
      let quoteLevel = 0
      while (line.startsWith('>')) {
        quoteLevel++
        line = line.substring(1).trim()
      }
      
      // 如果引用级别变化，先添加之前的引用块
      if (currentQuote.length > 0 && quoteLevel !== currentQuoteLevel) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
      }
      
      currentQuoteLevel = quoteLevel
      currentQuote.push(line)
    }
    // 标题解析
    else if (line.startsWith('#')) {
      // 完成当前列表
      if (currentList.length > 0) {
        parsed.push({
          type: 'list',
          text: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      // 完成当前引用块
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }

      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s*/, '')
      
      // 解析标题中的格式
      const formattedContent = parseInlineFormatting(text)
      
      parsed.push({
        type: 'heading',
        text: text,
        level: level,
        formattedContent: formattedContent
      })
    }
    // 列表项解析
    else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('+ ')) {
      // 完成当前引用块
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      
      const text = line.replace(/^[-*+]\s*/, '')
      currentList.push(text)
    }
    // 数字列表解析
    else if (/^\d+\.\s/.test(line)) {
      // 完成当前引用块
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      
      const text = line.replace(/^\d+\.\s*/, '')
      currentList.push(text)
    }
    // 任务列表解析
    else if (line.startsWith('- [ ]') || line.startsWith('- [x]') || line.startsWith('- [X]')) {
      // 完成当前引用块
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      
      // 处理任务列表项
      const isChecked = line.startsWith('- [x]') || line.startsWith('- [X]')
      const text = line.replace(/^- \[([ xX])\]\s*/, '')
      // 添加复选框标记
      currentList.push(`${isChecked ? '✓ ' : '☐ '}${text}`)
    }
    // 普通段落
    else {
      // 完成当前列表
      if (currentList.length > 0) {
        parsed.push({
          type: 'list',
          text: '',
          items: [...currentList]
        })
        currentList = []
      }
      
      // 完成当前引用块
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join('\n')
        const formattedContent = parseInlineFormatting(quoteText)
        
        parsed.push({
          type: 'blockquote',
          text: quoteText,
          quoteLevel: currentQuoteLevel,
          formattedContent: formattedContent
        })
        currentQuote = []
        currentQuoteLevel = 0
      }
      
      // 解析段落中的格式
      const formattedContent = parseInlineFormatting(line)
      
      parsed.push({
        type: 'paragraph',
        text: line,
        formattedContent: formattedContent
      })
    }
  }

  // 处理最后的列表
  if (currentList.length > 0) {
    // 解析列表项中的格式
    const formattedItems = currentList.map(item => {
      return parseInlineFormatting(item);
    });
    
    parsed.push({
      type: 'list',
      text: '',
      items: [...currentList],
      formattedContent: formattedItems.flat()
    })
  }
  
  // 处理最后的引用块
  if (currentQuote.length > 0) {
    const quoteText = currentQuote.join('\n')
    const formattedContent = parseInlineFormatting(quoteText)
    
    parsed.push({
      type: 'blockquote',
      text: quoteText,
      quoteLevel: currentQuoteLevel,
      formattedContent: formattedContent
    })
  }

  return parsed
}