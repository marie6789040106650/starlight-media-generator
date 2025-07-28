/**
 * 客户端Word导出工具
 * 纯浏览器实现，适用于Vercel等无服务器部署
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Header, 
  Footer, 
  PageNumber
} from 'docx'

export interface ClientWordExportOptions {
  content: string
  storeName: string
  filename?: string
}

/**
 * 客户端Word导出函数
 */
export async function exportWordDocument(options: ClientWordExportOptions): Promise<void> {
  const { content, storeName, filename } = options

  try {
    console.log('🚀 开始生成Word文档...')
    
    // 解析内容为段落
    const paragraphs = parseContentToParagraphs(content, storeName)
    
    // 创建Word文档
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: 11906, // A4宽度 (21cm)
              height: 16838, // A4高度 (29.7cm)
            },
            margin: {
              top: 1440,    // 2.54cm
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${storeName} | 由星光传媒专业团队为您量身定制`,
                    font: "Source Han Sans SC",
                    size: 20,
                    color: "666666"
                  })
                ],
                alignment: AlignmentType.CENTER,
              })
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Source Han Sans SC",
                    size: 18,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: paragraphs,
      }],
      styles: {
        default: {
          document: {
            run: {
              font: "Source Han Sans SC",
              size: 22, // 11pt
            },
          },
        },
      },
    })

    console.log('📄 文档创建完成，开始生成Buffer...')
    
    // 生成Buffer
    const buffer = await Packer.toBuffer(doc)
    
    console.log('💾 Buffer生成完成，开始下载...')
    
    // 下载文件
    const finalFilename = filename || generateFilename(storeName, content)
    await downloadFile(buffer, finalFilename)
    
    console.log('✅ Word文档导出成功!')
    
  } catch (error) {
    console.error('❌ Word导出失败:', error)
    throw new Error(`Word导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 解析内容为Word段落
 */
function parseContentToParagraphs(content: string, storeName: string): Paragraph[] {
  const lines = content.split('\n').filter(line => line.trim())
  const paragraphs: Paragraph[] = []

  // 添加文档标题
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${storeName} - 老板IP打造方案`,
          bold: true,
          size: 32, // 16pt
          color: "1f2937"
        })
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `生成时间: ${new Date().toLocaleString('zh-CN')}`,
          size: 20,
          color: "9ca3af"
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    })
  )

  // 处理内容行
  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // 检查是否是标题
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const title = headingMatch[2]

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: getFontSizeForHeading(level),
              color: getColorForHeading(level)
            })
          ],
          heading: getHeadingLevel(level),
          spacing: { 
            before: getSpacingBefore(level), 
            after: getSpacingAfter(level) 
          }
        })
      )
    } else {
      // 处理普通段落，支持加粗文本
      const textRuns = parseTextWithFormatting(trimmedLine)
      
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 120 },
          indent: {
            firstLine: 420, // 首行缩进2字符
          },
        })
      )
    }
  })

  return paragraphs
}

/**
 * 解析带格式的文本
 */
function parseTextWithFormatting(text: string): TextRun[] {
  const textRuns: TextRun[] = []
  let lastIndex = 0
  const boldRegex = /\*\*(.*?)\*\*/g
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    // 添加普通文本
    if (match.index > lastIndex) {
      textRuns.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          size: 22
        })
      )
    }
    // 添加加粗文本
    textRuns.push(
      new TextRun({
        text: match[1],
        bold: true,
        size: 22
      })
    )
    lastIndex = match.index + match[0].length
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    textRuns.push(
      new TextRun({
        text: text.slice(lastIndex),
        size: 22
      })
    )
  }

  // 如果没有格式化文本，返回整个文本
  if (textRuns.length === 0) {
    textRuns.push(
      new TextRun({
        text: text,
        size: 22
      })
    )
  }

  return textRuns
}

/**
 * 下载文件 - 使用原生浏览器API
 */
async function downloadFile(buffer: ArrayBuffer, filename: string): Promise<void> {
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  })

  // 创建下载链接
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  // 添加到DOM并触发下载
  document.body.appendChild(link)
  link.click()
  
  // 清理
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 生成文件名
 */
function generateFilename(storeName: string, content: string): string {
  const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
  
  // 尝试从内容中提取标题
  const firstLine = content.split('\n')[0]
  if (firstLine && firstLine.startsWith('#')) {
    const title = firstLine.replace(/^#+\s*/, '').trim()
    if (title && title.length <= 30) {
      return `${title}-${currentDate}.docx`
    }
  }
  
  return `${storeName}-IP方案-${currentDate}.docx`
}

// 工具函数
function getFontSizeForHeading(level: number): number {
  switch (level) {
    case 1: return 28 // 14pt
    case 2: return 26 // 13pt
    case 3: return 24 // 12pt
    case 4: return 22 // 11pt
    default: return 22
  }
}

function getColorForHeading(level: number): string {
  switch (level) {
    case 1: return "1f2937" // 深灰
    case 2: return "374151" // 中灰
    case 3: return "4b5563" // 浅灰
    default: return "000000" // 黑色
  }
}

function getHeadingLevel(level: number): HeadingLevel {
  switch (level) {
    case 1: return HeadingLevel.HEADING_1
    case 2: return HeadingLevel.HEADING_2
    case 3: return HeadingLevel.HEADING_3
    case 4: return HeadingLevel.HEADING_4
    case 5: return HeadingLevel.HEADING_5
    case 6: return HeadingLevel.HEADING_6
    default: return HeadingLevel.HEADING_1
  }
}

function getSpacingBefore(level: number): number {
  switch (level) {
    case 1: return 400 // 20pt
    case 2: return 300 // 15pt
    case 3: return 200 // 10pt
    default: return 150 // 7.5pt
  }
}

function getSpacingAfter(level: number): number {
  switch (level) {
    case 1: return 200 // 10pt
    case 2: return 150 // 7.5pt
    case 3: return 100 // 5pt
    default: return 80 // 4pt
  }
}