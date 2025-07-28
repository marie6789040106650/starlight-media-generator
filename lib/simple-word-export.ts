/**
 * 简单的前端Word导出工具
 * 不依赖file-saver，使用原生浏览器API
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

export interface SimpleWordExportOptions {
  content: string
  storeName: string
  filename?: string
}

export class SimpleWordExporter {
  /**
   * 导出Word文档
   */
  async exportWord(options: SimpleWordExportOptions): Promise<void> {
    const { content, storeName, filename } = options

    try {
      console.log('🚀 开始生成Word文档...')
      
      // 解析内容
      const paragraphs = this.parseContent(content)
      
      // 创建文档
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
      await this.downloadFile(buffer, filename || this.generateFilename(storeName))
      
      console.log('✅ Word文档导出成功!')
      
    } catch (error) {
      console.error('❌ Word导出失败:', error)
      throw new Error(`Word导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 解析内容为段落
   */
  private parseContent(content: string): Paragraph[] {
    const lines = content.split('\n').filter(line => line.trim())
    const paragraphs: Paragraph[] = []

    // 添加标题
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "老板IP打造方案",
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

    // 处理内容
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
                size: level === 1 ? 28 : level === 2 ? 26 : level === 3 ? 24 : 22,
                color: level === 1 ? "1f2937" : level === 2 ? "374151" : "4b5563"
              })
            ],
            heading: level === 1 ? HeadingLevel.HEADING_1 :
              level === 2 ? HeadingLevel.HEADING_2 :
                level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
            spacing: { before: 300, after: 150 }
          })
        )
      } else {
        // 处理普通段落，解析加粗文本
        const textRuns: TextRun[] = []
        let lastIndex = 0
        const boldRegex = /\*\*(.*?)\*\*/g
        let match

        while ((match = boldRegex.exec(trimmedLine)) !== null) {
          // 添加普通文本
          if (match.index > lastIndex) {
            textRuns.push(
              new TextRun({
                text: trimmedLine.slice(lastIndex, match.index),
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
        if (lastIndex < trimmedLine.length) {
          textRuns.push(
            new TextRun({
              text: trimmedLine.slice(lastIndex),
              size: 22
            })
          )
        }

        if (textRuns.length === 0) {
          textRuns.push(
            new TextRun({
              text: trimmedLine,
              size: 22
            })
          )
        }

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
   * 下载文件 - 使用原生浏览器API
   */
  private async downloadFile(buffer: ArrayBuffer, filename: string): Promise<void> {
    try {
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
      
      console.log('✅ 文件下载成功:', filename)
      
    } catch (error) {
      console.error('❌ 文件下载失败:', error)
      throw new Error('文件下载失败，请检查浏览器兼容性')
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(storeName: string): string {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
    return `${storeName}-IP方案-${currentDate}.docx`
  }
}