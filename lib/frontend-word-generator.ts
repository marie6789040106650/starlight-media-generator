/**
 * 前端Word文档生成器
 * 纯浏览器环境实现，无需服务器支持
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
  PageNumber,
  ImageRun
} from 'docx'

export interface FrontendWordExportOptions {
  content: string
  storeName: string
  bannerImage?: string | null
  filename?: string
  usePageMode?: boolean
}

export class FrontendWordGenerator {
  private logoBuffer: ArrayBuffer | null = null

  constructor() {
    // 前端环境初始化
  }

  /**
   * 生成Word文档并下载
   */
  async generateAndDownload(options: FrontendWordExportOptions): Promise<void> {
    try {
      const buffer = await this.generateWordDocument(options)
      await this.downloadFile(buffer, options.filename || this.generateFilename(options.storeName))
    } catch (error) {
      console.error('前端Word导出失败:', error)
      throw new Error(`Word导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 生成Word文档Buffer
   */
  async generateWordDocument(options: FrontendWordExportOptions): Promise<ArrayBuffer> {
    const { content, storeName, bannerImage, usePageMode } = options

    // 解析内容
    const parsedContent = usePageMode ? this.parsePageModeContent() : this.parseMarkdownContent(content)

    // 加载资源
    const logoBuffer = await this.loadLogo()
    const bannerBuffer = bannerImage ? await this.loadBannerImage(bannerImage) : null

    // 创建文档
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: this.convertCmToTwips(21),
              height: this.convertCmToTwips(29.7),
            },
            margin: {
              top: this.convertCmToTwips(2.54),
              bottom: this.convertCmToTwips(2.54),
              left: this.convertCmToTwips(2.54),
              right: this.convertCmToTwips(2.54),
              header: this.convertCmToTwips(1.5),
              footer: this.convertCmToTwips(1.75),
            },
          },
        },
        headers: {
          default: await this.createHeader(logoBuffer, storeName),
        },
        footers: {
          default: this.createFooter(),
        },
        children: [
          ...await this.createBannerSection(bannerBuffer),
          ...this.createDocumentContent(parsedContent),
        ],
      }],
      styles: {
        default: {
          document: {
            run: {
              font: "Source Han Sans SC",
              size: 22,
            },
          },
        },
      },
    })

    const buffer = await Packer.toBuffer(doc)
    return buffer
  }  /**
  
 * 解析分页模式的HTML内容
   */
  private parsePageModeContent(): ParsedElement[] {
    const pages = document.querySelectorAll('.page')
    const elements: ParsedElement[] = []

    pages.forEach(page => {
      const pageElements = this.parsePageElements(page)
      elements.push(...pageElements)
    })

    return elements
  }

  /**
   * 解析单个页面的元素
   */
  private parsePageElements(page: Element): ParsedElement[] {
    const elements: ParsedElement[] = []
    const children = Array.from(page.children)

    children.forEach(child => {
      const element = this.parseHTMLElement(child)
      if (element) {
        elements.push(element)
      }
    })

    return elements
  }

  /**
   * 解析HTML元素为Word元素
   */
  private parseHTMLElement(element: Element): ParsedElement | null {
    const tagName = element.tagName.toLowerCase()
    const textContent = element.textContent?.trim() || ''

    if (!textContent && !['img', 'table'].includes(tagName)) {
      return null
    }

    const styles = this.parseElementStyles(element)

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          level: parseInt(tagName.charAt(1)),
          text: textContent,
          styles
        }

      case 'p':
        return {
          type: 'paragraph',
          text: textContent,
          styles,
          children: this.parseInlineElements(element)
        }

      case 'ul':
      case 'ol':
        return {
          type: 'list',
          ordered: tagName === 'ol',
          items: this.parseListItems(element),
          styles
        }

      default:
        if (textContent) {
          return {
            type: 'paragraph',
            text: textContent,
            styles,
            children: this.parseInlineElements(element)
          }
        }
        return null
    }
  }

  /**
   * 解析元素样式
   */
  private parseElementStyles(element: Element): ElementStyles {
    if (typeof window === 'undefined') return {}
    
    const computedStyle = window.getComputedStyle(element)
    return {
      fontSize: this.parseFontSize(computedStyle.fontSize),
      fontFamily: computedStyle.fontFamily,
      fontWeight: computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 600,
      fontStyle: computedStyle.fontStyle === 'italic',
      color: this.parseColor(computedStyle.color),
      textAlign: computedStyle.textAlign,
      lineHeight: this.parseLineHeight(computedStyle.lineHeight),
      marginTop: this.parseSpacing(computedStyle.marginTop),
      marginBottom: this.parseSpacing(computedStyle.marginBottom),
    }
  }  /**

   * 解析内联元素
   */
  private parseInlineElements(element: Element): InlineElement[] {
    const inlineElements: InlineElement[] = []
    
    if (typeof window === 'undefined') {
      return [{
        type: 'text',
        text: element.textContent || '',
        styles: {}
      }]
    }

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      null
    )

    let node = walker.nextNode()
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          inlineElements.push({
            type: 'text',
            text,
            styles: {}
          })
        }
      }
      node = walker.nextNode()
    }

    return inlineElements
  }

  /**
   * 解析Markdown内容（备用方案）
   */
  private parseMarkdownContent(content: string): ParsedElement[] {
    const lines = content.split('\n')
    const elements: ParsedElement[] = []

    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // 标题
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        elements.push({
          type: 'heading',
          level: headingMatch[1].length,
          text: headingMatch[2],
          styles: {}
        })
        return
      }

      // 普通段落
      elements.push({
        type: 'paragraph',
        text: trimmedLine,
        styles: {}
      })
    })

    return elements
  }

  /**
   * 创建文档内容
   */
  private createDocumentContent(elements: ParsedElement[]): Paragraph[] {
    const paragraphs: Paragraph[] = []

    elements.forEach(element => {
      switch (element.type) {
        case 'heading':
          paragraphs.push(this.createHeading(element))
          break
        case 'paragraph':
          paragraphs.push(this.createParagraph(element))
          break
        case 'list':
          paragraphs.push(...this.createList(element))
          break
      }
    })

    return paragraphs
  }

  /**
   * 创建标题段落
   */
  private createHeading(element: ParsedElement): Paragraph {
    const { level, text, styles } = element
    
    return new Paragraph({
      children: [
        new TextRun({
          text: text || '',
          font: styles?.fontFamily?.includes('Serif') ? "Source Han Serif SC" : "Source Han Sans SC",
          size: this.getFontSizeForHeading(level || 1),
          bold: true,
          color: styles?.color || "000000",
        }),
      ],
      heading: this.getHeadingLevel(level || 1),
      alignment: this.getAlignment(styles?.textAlign),
      spacing: {
        before: this.convertPtToTwips(this.getHeadingSpaceBefore(level || 1)),
        after: this.convertPtToTwips(this.getHeadingSpaceAfter(level || 1)),
        line: this.convertLineSpacingToTwips(1.5),
      },
    })
  }  /**

   * 创建普通段落
   */
  private createParagraph(element: ParsedElement): Paragraph {
    const { text, styles, children } = element
    
    const textRuns = children && children.length > 0 
      ? this.createTextRuns(children)
      : [new TextRun({
          text: text || '',
          font: "Source Han Sans SC",
          size: 22,
          bold: styles?.fontWeight || false,
          italics: styles?.fontStyle || false,
        })]

    return new Paragraph({
      children: textRuns,
      alignment: this.getAlignment(styles?.textAlign),
      spacing: {
        before: this.convertPtToTwips(styles?.marginTop || 0),
        after: this.convertPtToTwips(styles?.marginBottom || 6),
        line: this.convertLineSpacingToTwips(styles?.lineHeight || 1.5),
      },
      indent: {
        firstLine: this.convertCmToTwips(0.74),
      },
    })
  }

  /**
   * 创建文本运行对象
   */
  private createTextRuns(inlineElements: InlineElement[]): TextRun[] {
    return inlineElements.map(element => {
      const { text, styles } = element
      
      return new TextRun({
        text: text || '',
        font: "Source Han Sans SC",
        size: styles?.fontSize || 22,
        bold: styles?.fontWeight || false,
        italics: styles?.fontStyle || false,
        color: styles?.color || "000000",
      })
    })
  }

  /**
   * 创建列表
   */
  private createList(element: ParsedElement): Paragraph[] {
    const { items, ordered } = element
    const paragraphs: Paragraph[] = []

    items?.forEach((item, index) => {
      const bullet = ordered ? `${index + 1}.` : '•'
      
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: `${bullet} ${item}`,
            font: "Source Han Sans SC",
            size: 22,
          }),
        ],
        spacing: {
          before: this.convertPtToTwips(2),
          after: this.convertPtToTwips(2),
        },
        indent: {
          left: this.convertPtToTwips(20),
        },
      }))
    })

    return paragraphs
  }

  /**
   * 创建页眉
   */
  private async createHeader(logoBuffer: ArrayBuffer | null, storeName: string): Promise<Header> {
    const headerChildren: (TextRun | ImageRun)[] = []

    if (logoBuffer) {
      try {
        headerChildren.push(
          new ImageRun({
            data: new Uint8Array(logoBuffer),
            transformation: {
              width: 60,
              height: 60,
            },
            type: 'png',
          })
        )
      } catch (error) {
        console.warn('页眉Logo加载失败:', error)
      }
    }

    headerChildren.push(
      new TextRun({
        text: `  由星光同城传媒专业团队为您量身定制`,
        font: "Source Han Sans SC",
        size: 24,
      })
    )

    return new Header({
      children: [
        new Paragraph({
          children: headerChildren,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 240,
          },
        })
      ],
    })
  }

  /**
   * 创建页脚
   */
  private createFooter(): Footer {
    return new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: "Source Han Sans SC",
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
      ],
    })
  }  /*
*
   * 创建Banner部分
   */
  private async createBannerSection(bannerBuffer: ArrayBuffer | null): Promise<Paragraph[]> {
    if (bannerBuffer) {
      try {
        const bannerWidth = 453
        const bannerHeight = Math.round(bannerWidth / 3)

        return [
          new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(bannerBuffer),
                transformation: {
                  width: bannerWidth,
                  height: bannerHeight,
                },
                type: 'jpg',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              after: this.convertPtToTwips(6),
            },
          })
        ]
      } catch (error) {
        console.warn('Banner图片插入失败:', error)
      }
    }

    return [
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: {
          after: this.convertPtToTwips(6),
        },
      })
    ]
  }

  /**
   * 加载Logo图片
   */
  private async loadLogo(): Promise<ArrayBuffer | null> {
    if (this.logoBuffer) {
      return this.logoBuffer
    }

    try {
      const response = await fetch('/logo.png')
      if (response.ok) {
        this.logoBuffer = await response.arrayBuffer()
        console.log('Logo图片加载成功')
        return this.logoBuffer
      }
    } catch (error) {
      console.warn('Logo图片加载失败:', error)
    }
    return null
  }

  /**
   * 加载Banner图片
   */
  private async loadBannerImage(bannerUrl: string): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch(bannerUrl)
      if (response.ok) {
        console.log('Banner图片加载成功')
        return await response.arrayBuffer()
      }
    } catch (error) {
      console.warn('Banner图片加载失败:', error)
    }
    return null
  }

  /**
   * 下载文件
   */
  private async downloadFile(buffer: ArrayBuffer, filename: string): Promise<void> {
    try {
      // 尝试多种导入方式
      let saveAs: any = null
      
      try {
        const fileSaver = await import('file-saver')
        saveAs = fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default
      } catch (importError) {
        console.warn('file-saver导入失败，使用备用方法:', importError)
      }

      if (saveAs && typeof saveAs === 'function') {
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        })
        
        saveAs(blob, filename)
        console.log('✅ Word文档下载成功:', filename)
      } else {
        // 直接使用备用方法
        this.fallbackDownload(buffer, filename)
      }
    } catch (error) {
      console.error('文件下载失败:', error)
      this.fallbackDownload(buffer, filename)
    }
  }

  /**
   * 备用下载方法
   */
  private fallbackDownload(buffer: ArrayBuffer, filename: string): void {
    try {
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log('✅ Word文档备用下载成功:', filename)
    } catch (error) {
      console.error('备用下载也失败:', error)
      throw new Error('文件下载失败，请检查浏览器兼容性')
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(storeName: string): string {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
    return `${storeName}-方案-${currentDate}.docx`
  }  //
 样式解析工具方法
  private parseFontSize(fontSize: string): number {
    const match = fontSize.match(/(\d+(?:\.\d+)?)px/)
    if (match) {
      const px = parseFloat(match[1])
      return Math.round(px * 1.5)
    }
    return 22
  }

  private parseColor(color: string): string {
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
      return r + g + b
    }
    
    if (color.startsWith('#')) {
      return color.substring(1)
    }
    
    return "000000"
  }

  private parseLineHeight(lineHeight: string): number {
    if (lineHeight === 'normal') return 1.5
    
    const numMatch = lineHeight.match(/(\d+(?:\.\d+)?)/)
    if (numMatch) {
      return parseFloat(numMatch[1])
    }
    
    return 1.5
  }

  private parseSpacing(spacing: string): number {
    const match = spacing.match(/(\d+(?:\.\d+)?)px/)
    if (match) {
      return parseFloat(match[1]) * 0.75
    }
    return 0
  }

  private parseListItems(listElement: Element): string[] {
    const items: string[] = []
    const listItems = listElement.querySelectorAll('li')
    
    listItems.forEach(li => {
      const text = li.textContent?.trim()
      if (text) {
        items.push(text)
      }
    })
    
    return items
  }

  // Word样式工具方法
  private getFontSizeForHeading(level: number): number {
    switch (level) {
      case 1: return 32
      case 2: return 28
      case 3: return 24
      case 4: return 22
      case 5: return 20
      case 6: return 18
      default: return 32
    }
  }

  private getHeadingLevel(level: number): HeadingLevel {
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

  private getHeadingSpaceBefore(level: number): number {
    switch (level) {
      case 1: return 12
      case 2: return 6
      case 3: return 3
      default: return 6
    }
  }

  private getHeadingSpaceAfter(level: number): number {
    switch (level) {
      case 1: return 6
      case 2: return 4
      case 3: return 3
      default: return 4
    }
  }

  private getAlignment(textAlign?: string): AlignmentType {
    switch (textAlign) {
      case 'center': return AlignmentType.CENTER
      case 'right': return AlignmentType.RIGHT
      case 'justify': return AlignmentType.JUSTIFIED
      default: return AlignmentType.LEFT
    }
  }

  // 单位转换工具方法
  private convertCmToTwips(cm: number): number {
    return Math.round(cm * 567)
  }

  private convertPtToTwips(pt: number): number {
    return Math.round(pt * 20)
  }

  private convertLineSpacingToTwips(lineSpacing: number): number {
    return Math.round(lineSpacing * 240)
  }
}

// 类型定义
interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image'
  level?: number
  text?: string
  styles?: ElementStyles
  children?: InlineElement[]
  ordered?: boolean
  items?: string[]
}

interface InlineElement {
  type: 'text'
  text?: string
  styles?: ElementStyles
}

interface ElementStyles {
  fontSize?: number
  fontFamily?: string
  fontWeight?: boolean
  fontStyle?: boolean
  color?: string
  textAlign?: string
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
}