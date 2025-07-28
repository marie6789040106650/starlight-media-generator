import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageNumber, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import { parseMarkdownContent, ParsedContent, FormattedText } from './markdown-parser'
import { loadStyleConfig, StyleConfig } from './style-config'

export interface WordExportOptions {
  content: string
  storeName: string
  bannerImage?: string | null
  filename?: string
  includeWatermark?: boolean
}



// Constants for better maintainability
const BANNER_DIMENSIONS = {
  ASPECT_RATIO: 3, // 原始比例 1800:600 = 3:1
  // 页面宽度计算：A4宽度21cm - 左右边距(2.54cm * 2) = 15.92cm ≈ 453pt
  PAGE_CONTENT_WIDTH_PT: 453, // 页面内容区域宽度（点）
} as const

const LOGO_DIMENSIONS = {
  WIDTH: 60,
  HEIGHT: 60
} as const

const DEFAULT_LOGO_PATHS = [
  'public/logo.png',
  'public/placeholder-logo.png'
] as const

export class WordGenerator {
  private logoBuffer: ArrayBuffer | null = null

  constructor() {
    // Config is loaded when needed
  }



  private async loadLogo(): Promise<ArrayBuffer | null> {
    if (this.logoBuffer) {
      return this.logoBuffer
    }

    try {
      // 在服务器端，直接从文件系统读取logo
      if (typeof window === 'undefined') {
        const fs = await import('fs/promises')
        const path = await import('path')

        // 尝试多个可能的logo路径
        const logoPaths = [
          ...DEFAULT_LOGO_PATHS.map(p => path.join(process.cwd(), p)),
          ...DEFAULT_LOGO_PATHS.map(p => path.join(__dirname, '../../', p))
        ]

        for (const logoPath of logoPaths) {
          try {
            const logoData = await fs.readFile(logoPath)
            this.logoBuffer = logoData.buffer.slice(logoData.byteOffset, logoData.byteOffset + logoData.byteLength)
            console.log(`Logo图片加载成功: ${logoPath}`)
            return this.logoBuffer
          } catch (error) {
            // 继续尝试下一个路径
            continue
          }
        }

        console.warn('所有logo路径都无法访问，尝试使用HTTP方式')
      }

      // 在客户端或服务器端HTTP方式作为备选
      const response = await fetch('/logo.png')
      if (response.ok) {
        this.logoBuffer = await response.arrayBuffer()
        console.log('Logo图片通过HTTP加载成功')
        return this.logoBuffer
      } else {
        console.warn('Logo图片加载失败，状态码:', response.status)
      }
    } catch (error) {
      console.warn('无法加载logo图片:', error)
    }
    return null
  }

  private async loadBannerImage(bannerUrl: string): Promise<ArrayBuffer | null> {
    try {
      // 如果是本地路径且在服务器端，尝试直接读取文件
      if (typeof window === 'undefined' && bannerUrl.startsWith('/')) {
        const fs = await import('fs/promises')
        const path = await import('path')

        const bannerPath = path.join(process.cwd(), 'public', bannerUrl.substring(1))
        try {
          const bannerData = await fs.readFile(bannerPath)
          console.log(`Banner图片从文件系统加载成功: ${bannerPath}`)
          return bannerData.buffer.slice(bannerData.byteOffset, bannerData.byteOffset + bannerData.byteLength)
        } catch (fsError) {
          console.warn(`无法从文件系统加载banner图片: ${bannerPath}，尝试HTTP方式`)
        }
      }

      // HTTP方式加载（客户端或远程图片）
      const response = await fetch(bannerUrl)
      if (response.ok) {
        console.log('Banner图片通过HTTP加载成功')
        return await response.arrayBuffer()
      }
    } catch (error) {
      console.warn('无法加载banner图片:', error)
    }
    return null
  }

  async generateWordDocument(options: WordExportOptions): Promise<Buffer> {
    const { content, bannerImage } = options

    // 加载logo图片
    const logoBuffer = await this.loadLogo()

    // 加载banner图片
    const bannerBuffer = bannerImage ? await this.loadBannerImage(bannerImage) : null

    // 解析Markdown内容
    const parsedContent = parseMarkdownContent(content)

    // 创建页眉页脚 - 严格按照Python脚本格式
    const header = await this.createEnterpriseHeader(logoBuffer)
    const footer = await this.createEnterpriseFooter(logoBuffer)

    // 创建Word文档 - 严格按照企业方案模板规范
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: this.convertCmToTwips(21),      // A4宽度 21cm
              height: this.convertCmToTwips(29.7),   // A4高度 29.7cm
            },
            margin: {
              top: this.convertCmToTwips(2.54),      // 上边距 2.54cm
              bottom: this.convertCmToTwips(2.54),   // 下边距 2.54cm
              left: this.convertCmToTwips(2.54),     // 左边距 2.54cm (Normal格式)
              right: this.convertCmToTwips(2.54),    // 右边距 2.54cm (Normal格式)
              header: this.convertCmToTwips(1.5),    // 页眉距离 1.5cm
              footer: this.convertCmToTwips(1.75),   // 页脚距离 1.75cm
            },
          },
        },
        headers: {
          default: header,
        },
        footers: {
          default: footer,
        },
        children: [
          // 添加首页Banner图（如果有的话）
          ...await this.createBannerSection(bannerBuffer),
          // 添加封面标题（减少了空白）
          ...this.createEnterpriseCoverPage(),
          // 添加企业方案内容结构
          ...this.createEnterpriseContentStructure(parsedContent),
        ],
      }],
      // 设置默认字体为思源黑体
      styles: {
        default: {
          document: {
            run: {
              font: "Source Han Sans SC",
              size: 22, // 11pt * 2
            },
          },
        },
      },
    })

    // 生成并返回Buffer
    const buffer = await Packer.toBuffer(doc)
    return buffer
  }

  /**
   * 生成Word文档到指定文件路径（用于服务器端）
   */
  async generateWordDocumentToFile(options: WordExportOptions & { filename: string }): Promise<Buffer> {
    const { content, bannerImage, filename } = options

    // 加载logo图片
    const logoBuffer = await this.loadLogo()

    // 加载banner图片
    const bannerBuffer = bannerImage ? await this.loadBannerImage(bannerImage) : null

    // 解析Markdown内容
    const parsedContent = parseMarkdownContent(content)

    // 创建页眉页脚 - 严格按照Python脚本格式
    const header = await this.createEnterpriseHeader(logoBuffer)
    const footer = await this.createEnterpriseFooter(logoBuffer)

    // 创建Word文档 - 严格按照企业方案模板规范
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: this.convertCmToTwips(21),      // A4宽度 21cm
              height: this.convertCmToTwips(29.7),   // A4高度 29.7cm
            },
            margin: {
              top: this.convertCmToTwips(2.54),      // 上边距 2.54cm
              bottom: this.convertCmToTwips(2.54),   // 下边距 2.54cm
              left: this.convertCmToTwips(2.54),     // 左边距 2.54cm (Normal格式)
              right: this.convertCmToTwips(2.54),    // 右边距 2.54cm (Normal格式)
              header: this.convertCmToTwips(1.5),    // 页眉距离 1.5cm
              footer: this.convertCmToTwips(1.75),   // 页脚距离 1.75cm
            },
          },
        },
        headers: {
          default: header,
        },
        footers: {
          default: footer,
        },
        children: [
          // 添加首页Banner图（如果有的话）
          ...await this.createBannerSection(bannerBuffer),
          // 添加封面标题（减少了空白）
          ...this.createEnterpriseCoverPage(),
          // 添加企业方案内容结构
          ...this.createEnterpriseContentStructure(parsedContent),
        ],
      }],
      // 设置默认字体为思源黑体
      styles: {
        default: {
          document: {
            run: {
              font: "Source Han Sans SC",
              size: 22, // 11pt * 2
            },
          },
        },
      },
    })

    // 生成Buffer并写入文件
    const buffer = await Packer.toBuffer(doc)

    // 在服务器环境中，直接写入文件
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises')
      await fs.writeFile(filename, buffer)
    }

    return buffer
  }

  private async createBannerSection(bannerBuffer: ArrayBuffer | null): Promise<Paragraph[]> {
    // 首页Banner图（居中插入，自适应页面宽度，保持原始比例3:1）
    if (bannerBuffer) {
      try {
        // 计算自适应尺寸：使用页面内容区域的宽度，根据3:1比例计算高度
        const bannerWidth = BANNER_DIMENSIONS.PAGE_CONTENT_WIDTH_PT
        const bannerHeight = Math.round(bannerWidth / BANNER_DIMENSIONS.ASPECT_RATIO)

        return [
          new Paragraph({
            children: [
              new ImageRun({
                data: new Uint8Array(bannerBuffer),
                transformation: {
                  width: bannerWidth,   // 自适应页面宽度
                  height: bannerHeight, // 根据比例计算高度
                },
                type: 'jpg', // 更新为jpg格式
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              // 减少banner图后的空白，只保留一行的间距
              after: this.convertPtToTwips(6),
            },
          })
        ]
      } catch (error) {
        console.warn('无法插入banner图片:', error)
      }
    }

    // 如果没有banner图片，返回占位符
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: "[首页Banner图位置 - 自适应页面宽度，保持3:1比例，JPG格式，居中对齐]",
            size: 20,
            color: "#999999",
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          after: this.convertPtToTwips(6),
        },
      })
    ]
  }

  private createEnterpriseCoverPage(): Paragraph[] {
    const coverElements: Paragraph[] = []

    // 删除中间圈住的"企业方案word样式模板.."字样
    // 只添加一个很小的空白段落，减少banner与正文之间的空白
    coverElements.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: {
          after: this.convertPtToTwips(6), // 减少为6pt，只保留一行的间距
        },
      })
    )

    return coverElements
  }

  private async createEnterpriseHeader(logoBuffer: ArrayBuffer | null): Promise<Header> {
    // 页眉：LOGO和文字在同一行，居中对齐
    const headerParagraphs: Paragraph[] = []

    // 单行：LOGO和文字在同一行，居中对齐
    const headerChildren: (TextRun | ImageRun)[] = []
    if (logoBuffer) {
      try {
        // 根据图片效果调整logo尺寸
        headerChildren.push(
          new ImageRun({
            data: new Uint8Array(logoBuffer),
            transformation: {
              width: LOGO_DIMENSIONS.WIDTH,
              height: LOGO_DIMENSIONS.HEIGHT,
            },
            type: 'png',
          })
        )
      } catch (error) {
        console.warn('无法在页眉中插入logo:', error)
        headerChildren.push(new TextRun({
          text: "[LOGO]",
          size: 20,
          color: "#999999",
        }))
      }
    } else {
      headerChildren.push(new TextRun({
        text: "[LOGO]",
        size: 20,
        color: "#999999",
      }))
    }

    // 添加文字，与logo在同一行，增加间距使其更协调
    headerChildren.push(
      new TextRun({
        text: "  由星光同城传媒专业团队为您量身定制", // 增加空格，与logo分开更明显
        font: "Source Han Sans SC", // 思源黑体
        size: 24, // 12pt * 2，与图片中效果一致
      })
    )

    // 创建页眉段落，设置为居中对齐
    headerParagraphs.push(
      new Paragraph({
        children: headerChildren,
        alignment: AlignmentType.CENTER, // 整体居中对齐
        spacing: {
          after: 240, // 增加页眉与正文之间的间距
        },
        border: {
          bottom: {
            color: "#DDDDDD", // 浅灰色边框
            size: 1,
            space: 4, // 增加边框与内容的间距
            style: "single",
          }
        },
      })
    )

    return new Header({
      children: headerParagraphs,
    })
  }

  private async createEnterpriseFooter(_logoBuffer: ArrayBuffer | null): Promise<Footer> {
    // 页脚：只显示页码（居中），删除LOGO
    const children: (TextRun)[] = []

    // 只添加页码，不添加LOGO
    children.push(new TextRun({
      children: [PageNumber.CURRENT], // 页码：阿拉伯数字
      font: "Source Han Sans SC", // 思源黑体
      size: 20, // 10pt * 2
    }))

    return new Footer({
      children: [
        new Paragraph({
          children: children,
          alignment: AlignmentType.CENTER, // 页脚居中
        }),
      ],
    })
  }

  private createEnterpriseContentStructure(parsedContent: ParsedContent[]): Paragraph[] {
    // 使用解析的内容创建企业方案，包含banner的方案内容
    const paragraphs: Paragraph[] = []

    // 如果有解析的内容，使用实际内容
    if (parsedContent && parsedContent.length > 0) {
      parsedContent.forEach(content => {
        switch (content.type) {
          case 'heading':
            if (content.formattedContent) {
              // 使用格式化内容创建标题
              paragraphs.push(this.createFormattedHeading(content.formattedContent, content.level || 1))
            } else {
              paragraphs.push(this.createEnterpriseHeading(content.text, content.level || 1))
            }
            break
          case 'paragraph':
            if (content.formattedContent) {
              // 使用格式化内容创建段落
              paragraphs.push(this.createFormattedParagraph(content.formattedContent))
            } else {
              paragraphs.push(this.createEnterpriseParagraph(content.text))
            }
            break
          case 'list':
            if (content.items) {
              content.items.forEach((item: string, index: number) => {
                // 检查是否是任务列表项
                const isTaskItem = item.startsWith('✓ ') || item.startsWith('☐ ');
                let bulletChar = '•';
                let taskText = item;

                if (isTaskItem) {
                  bulletChar = item.startsWith('✓ ') ? '☑' : '☐';
                  taskText = item.substring(2); // 移除任务标记
                }

                // 如果有格式化内容，使用它来创建列表项
                if (content.formattedContent && content.formattedContent[index]) {
                  const formattedItem = [{ text: `${bulletChar} `, bold: false, italic: false }, ...content.formattedContent];
                  paragraphs.push(this.createFormattedParagraph(formattedItem));
                } else {
                  paragraphs.push(this.createEnterpriseParagraph(`${bulletChar} ${isTaskItem ? taskText : item}`))
                }
              })
            }
            break
          case 'blockquote':
            // 处理引用块
            if (content.formattedContent) {
              // 创建带格式的引用块
              paragraphs.push(this.createFormattedBlockquote(content.formattedContent, content.quoteLevel || 1));
            } else {
              // 创建普通引用块
              paragraphs.push(this.createBlockquote(content.text, content.quoteLevel || 1));
            }
            break
          case 'table':
            // 处理表格
            if (content.tableHeaders && content.tableRows) {
              paragraphs.push(...this.createTable(content.tableHeaders, content.tableRows, content.tableAlignment));
            }
            break
          case 'codeblock':
            // 处理代码块
            paragraphs.push(this.createCodeBlock(content.text, content.language));
            break
          case 'separator':
            // 处理分隔线
            paragraphs.push(this.createSeparator());
            break
          default:
            if (content.formattedContent) {
              paragraphs.push(this.createFormattedParagraph(content.formattedContent))
            } else {
              paragraphs.push(this.createEnterpriseParagraph(content.text))
            }
        }
      })
    } else {
      // 如果没有解析内容，生成默认的企业方案样式规范
      paragraphs.push(...this.createEnterpriseStyleGuide())
    }

    return paragraphs
  }

  // 创建引用块
  private createBlockquote(text: string, level: number): Paragraph {
    // 根据引用级别设置缩进和样式
    const indentSize = level * 0.5; // 每级缩进0.5cm
    const quotePrefix = '> '.repeat(level);

    return new Paragraph({
      children: [
        new TextRun({
          text: `${quotePrefix}${text}`,
          font: "Source Han Sans SC", // 思源黑体
          size: 22, // 11pt * 2
          color: "#555555", // 引用块使用灰色
          italics: true, // 引用块使用斜体
        }),
      ],
      spacing: {
        before: this.convertPtToTwips(3),
        after: this.convertPtToTwips(3),
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      indent: {
        left: this.convertCmToTwips(indentSize), // 根据引用级别设置左缩进
      },
      border: {
        left: {
          color: "#AAAAAA",
          size: 3,
          space: 7,
          style: "single",
        }
      },
    });
  }

  // 创建带格式的引用块
  private createFormattedBlockquote(formattedContent: FormattedText[], level: number): Paragraph {
    // 根据引用级别设置缩进和样式
    const indentSize = level * 0.5; // 每级缩进0.5cm

    // 创建文本运行对象
    const textRuns = formattedContent.map((part: FormattedText) => {
      // 清理文本中的转义序列和特殊字符
      const cleanedText = this.cleanTextForWord(part.text);

      const textRunProps: any = {
        text: cleanedText,
        font: "Source Han Sans SC", // 思源黑体
        size: 22, // 11pt * 2
        bold: part.bold || false,
        italics: true, // 引用块默认使用斜体
        color: "#555555", // 引用块使用灰色
      };

      // 处理下划线
      if (part.underline) {
        textRunProps.underline = {};
      }

      return new TextRun(textRunProps);
    });

    return new Paragraph({
      children: textRuns,
      spacing: {
        before: this.convertPtToTwips(3),
        after: this.convertPtToTwips(3),
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      indent: {
        left: this.convertCmToTwips(indentSize), // 根据引用级别设置左缩进
      },
      border: {
        left: {
          color: "#AAAAAA",
          size: 3,
          space: 7,
          style: "single",
        }
      },
    });
  }

  // 创建格式化的标题
  private createFormattedHeading(formattedContent: FormattedText[], level: number): Paragraph {
    // 设置标题样式
    let fontSize: number
    let fontName: string
    let spacingBefore: number
    let spacingAfter: number

    switch (level) {
      case 1:
        // 一级标题：思源宋体，16~18pt，加粗，段前12pt，段后6pt
        fontSize = 32 // 16pt * 2
        fontName = "Source Han Serif SC"
        spacingBefore = 12
        spacingAfter = 6
        break
      case 2:
        // 二级标题：思源宋体，14pt，加粗，段前6pt，段后4pt
        fontSize = 28 // 14pt * 2
        fontName = "Source Han Serif SC"
        spacingBefore = 6
        spacingAfter = 4
        break
      case 3:
        // 三级标题：思源黑体，12pt，加粗，段前3pt，段后3pt
        fontSize = 24 // 12pt * 2
        fontName = "Source Han Sans SC"
        spacingBefore = 3
        spacingAfter = 3
        break
      default:
        fontSize = 32
        fontName = "Source Han Serif SC"
        spacingBefore = 12
        spacingAfter = 6
    }

    // 创建文本运行对象
    const textRuns = formattedContent.map((part: FormattedText) => {
      // 清理文本中的转义序列和特殊字符
      const cleanedText = this.cleanTextForWord(part.text);

      const textRunProps: any = {
        text: cleanedText,
        font: fontName,
        size: fontSize,
        bold: true, // 标题默认加粗
        italics: part.italic || false,
      };

      // 处理下划线
      if (part.underline) {
        textRunProps.underline = {};
      }

      return new TextRun(textRunProps);
    });

    return new Paragraph({
      children: textRuns,
      heading: this.getHeadingLevel(level),
      spacing: {
        before: this.convertPtToTwips(spacingBefore),
        after: this.convertPtToTwips(spacingAfter),
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      alignment: AlignmentType.LEFT, // 标题左对齐
    });
  }

  // 清理文本中的转义序列和特殊字符
  private cleanTextForWord(text: string): string {
    // 替换常见的转义序列和特殊字符
    return text
      .replace(/\\n/g, ' ') // 将\n替换为空格
      .replace(/\\r/g, ' ') // 将\r替换为空格
      .replace(/\\t/g, ' ') // 将\t替换为空格
      .replace(/\\\\/g, '\\') // 将\\替换为\
      .replace(/\\"/g, '"') // 将\"替换为"
      .replace(/\\'/g, "'") // 将\'替换为'
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
      .replace(/👍/g, '赞同');
  }

  private createFormattedParagraph(formattedContent: FormattedText[]): Paragraph {
    // 创建文本运行对象
    const textRuns = formattedContent.map((part: FormattedText) => {
      // 清理文本中的转义序列和特殊字符
      const cleanedText = this.cleanTextForWord(part.text);

      // 检查是否有扩展属性
      const extendedPart = part as any;

      // 基本文本运行属性
      const textRunProps: any = {
        text: cleanedText,
        font: "Source Han Sans SC", // 思源黑体
        size: 22, // 11pt * 2
        bold: part.bold || false,
        italics: part.italic || false,
      };

      // 处理下划线
      if (part.underline) {
        textRunProps.underline = {};
      }

      // 处理删除线
      if (extendedPart.strikethrough) {
        textRunProps.strike = true;
      }

      // 处理代码
      if (part.code) {
        textRunProps.font = "Courier New";
        textRunProps.highlight = "lightGray";
      }

      // 处理链接
      if (extendedPart.link) {
        textRunProps.hyperlink = {
          uri: extendedPart.link,
        };
        textRunProps.color = "0000FF"; // 蓝色链接
        textRunProps.underline = true;
      }

      // 处理图片（在Word中，图片需要特殊处理，这里只添加图片描述）
      if (extendedPart.isImage) {
        textRunProps.text = `[图片: ${extendedPart.imageAlt || '图片'}]`;
        textRunProps.italics = true;
        textRunProps.color = "666666";
      }

      return new TextRun(textRunProps);
    });

    return new Paragraph({
      children: textRuns,
      spacing: {
        before: this.convertPtToTwips(0),  // 段前0pt
        after: this.convertPtToTwips(6),   // 段后6pt
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      alignment: AlignmentType.LEFT, // 正文左对齐
      indent: {
        firstLine: this.convertCmToTwips(0.74), // 首行缩进2个字符（约0.74cm）
      },
    });
  }

  private createEnterpriseStyleGuide(): Paragraph[] {
    const paragraphs: Paragraph[] = []

    // 严格按照Python脚本的内容结构和格式标准

    // 1. 页面设置
    paragraphs.push(this.createEnterpriseHeading("1. 页面设置", 1))
    const pageSettings = [
      "纸张大小：A4（21 x 29.7 cm）",
      "页边距：上 2.54 cm，下 2.54 cm，左 2.54 cm，右 2.54 cm（Normal格式）",
      "页码样式：页脚居中，阿拉伯数字，字体为思源黑体，10pt"
    ]
    pageSettings.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    // 2. 字体与字号标准
    paragraphs.push(this.createEnterpriseHeading("2. 字体与字号标准", 1))
    const fontStandards = [
      "正文内容：思源黑体（Source Han Sans SC），11pt，1.5 倍行距",
      "一级标题：思源宋体（Source Han Serif SC），16~18pt，加粗，段前 12pt，段后 6pt",
      "二级标题：思源宋体（Source Han Serif SC），14pt，加粗，段前 6pt，段后 4pt",
      "三级标题：思源黑体，12pt，加粗，段前 3pt，段后 3pt",
      "正文加粗关键字：同正文，11pt，加粗"
    ]
    fontStandards.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    // 3. 段落格式
    paragraphs.push(this.createEnterpriseHeading("3. 段落格式", 1))
    const paragraphFormats = [
      "正文首行缩进 2 个字符（约 0.74 cm）",
      "段前距离：0pt，段后距离：6pt",
      "行距：1.5 倍行距",
      "段落对齐方式：正文左对齐，标题居中或左对齐"
    ]
    paragraphFormats.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    // 4. 标题样式
    paragraphs.push(this.createEnterpriseHeading("4. 标题样式", 1))
    const titleStyles = [
      "一级标题：适用于章节标题，如「1. IP核心定位与形象塑造」",
      "二级标题：适用于章节内逻辑分项，如「人设定位」、「标签体系」",
      "三级标题：适用于内容块中的结构层次，如「创业故事线」、「互动玩法」"
    ]
    titleStyles.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    // 5. 色彩与图文使用规范
    paragraphs.push(this.createEnterpriseHeading("5. 色彩与图文使用规范", 1))
    const colorAndImageRules = [
      "色彩使用：正文纯黑（RGB: 0, 0, 0），可适当使用品牌辅助色做点缀（标题或边框）",
      "插图规范：图片居中插入，宽度不超过页面宽度的 80%",
      "图注样式：思源黑体，10pt，居中，段前 3pt，段后 6pt"
    ]
    colorAndImageRules.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    // 6. 封面与页眉页脚规范
    paragraphs.push(this.createEnterpriseHeading("6. 封面与页眉页脚规范", 1))
    const headerFooterRules = [
      "封面包含：主标题、副标题、品牌名称、撰写日期",
      "页眉内容：可设置文档名称或企业简称，字体为思源黑体，10pt",
      "页脚内容：居中页码，字体为思源黑体，10pt"
    ]
    headerFooterRules.forEach(text => {
      paragraphs.push(this.createEnterpriseParagraph(text))
    })

    return paragraphs
  }

  private createEnterpriseHeading(text: string, level: number): Paragraph {
    // 严格按照企业方案模板规范的标题格式
    let fontSize: number
    let fontName: string
    let spacingBefore: number
    let spacingAfter: number

    switch (level) {
      case 1:
        // 一级标题：思源宋体，16~18pt，加粗，段前12pt，段后6pt
        fontSize = 32 // 16pt * 2
        fontName = "Source Han Serif SC"
        spacingBefore = 12
        spacingAfter = 6
        break
      case 2:
        // 二级标题：思源宋体，14pt，加粗，段前6pt，段后4pt
        fontSize = 28 // 14pt * 2
        fontName = "Source Han Serif SC"
        spacingBefore = 6
        spacingAfter = 4
        break
      case 3:
        // 三级标题：思源黑体，12pt，加粗，段前3pt，段后3pt
        fontSize = 24 // 12pt * 2
        fontName = "Source Han Sans SC"
        spacingBefore = 3
        spacingAfter = 3
        break
      default:
        fontSize = 32
        fontName = "Source Han Serif SC"
        spacingBefore = 12
        spacingAfter = 6
    }

    // 清理文本中的转义序列和特殊字符
    const cleanedText = this.cleanTextForWord(text);

    return new Paragraph({
      children: [
        new TextRun({
          text: cleanedText,
          font: fontName,
          size: fontSize,
          bold: true,
        }),
      ],
      heading: this.getHeadingLevel(level),
      spacing: {
        before: this.convertPtToTwips(spacingBefore),
        after: this.convertPtToTwips(spacingAfter),
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      alignment: AlignmentType.LEFT, // 标题左对齐
    })
  }

  private createEnterpriseParagraph(text: string): Paragraph {
    // 严格按照企业方案模板规范的正文格式
    // 正文：思源黑体，11pt，1.5倍行距，首行缩进2个字符，段前0pt，段后6pt

    // 清理文本中的转义序列和特殊字符
    const cleanedText = this.cleanTextForWord(text);

    return new Paragraph({
      children: [
        new TextRun({
          text: cleanedText,
          font: "Source Han Sans SC", // 思源黑体
          size: 22, // 11pt * 2
        }),
      ],
      spacing: {
        before: this.convertPtToTwips(0),  // 段前0pt
        after: this.convertPtToTwips(6),   // 段后6pt
        line: this.convertLineSpacingToTwips(1.5), // 1.5倍行距
      },
      alignment: AlignmentType.LEFT, // 正文左对齐
      indent: {
        firstLine: this.convertCmToTwips(0.74), // 首行缩进2个字符（约0.74cm）
      },
    })
  }



  private getHeadingLevel(level: number): typeof HeadingLevel[keyof typeof HeadingLevel] {
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



  private generateEnterpriseFilename(content: string = ""): string {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')

    // 从内容中提取标题作为文件名
    let title = "企业方案"
    const parsedContent = parseMarkdownContent(content)

    // 查找第一个标题作为文件名
    const firstHeading = parsedContent.find(item => item.type === 'heading')
    if (firstHeading) {
      title = firstHeading.text.trim()
      // 限制文件名长度
      if (title.length > 30) {
        title = title.substring(0, 30) + "..."
      }
    }

    return `${title}-${currentDate}.docx`
  }

  // 单位转换工具函数
  private convertCmToTwips(cm: number): number {
    return Math.round(cm * 567) // 1cm = 567 twips
  }

  private convertPtToTwips(pt: number): number {
    return Math.round(pt * 20) // 1pt = 20 twips
  }

  private convertLineSpacingToTwips(lineSpacing: number): number {
    return Math.round(lineSpacing * 240) // 单倍行距 = 240 twips
  }

  // 创建表格
  private createTable(headers: string[], rows: string[][], alignment?: ('left' | 'center' | 'right')[]): Paragraph[] {
    const paragraphs: Paragraph[] = []

    // 添加表格前的间距
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: {
          before: this.convertPtToTwips(6),
          after: this.convertPtToTwips(3),
        },
      })
    )

    // 创建表格行
    const tableRows: TableRow[] = []

    // 创建表头行
    const headerCells = headers.map((header, index) => {
      const align = alignment && alignment[index] ? alignment[index] : 'left'
      const alignmentType = align === 'center' ? AlignmentType.CENTER :
        align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT

      return new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: this.cleanTextForWord(header),
                font: "Source Han Sans SC",
                size: 22,
                bold: true,
              }),
            ],
            alignment: alignmentType,
          }),
        ],
        shading: {
          fill: "F3F4F6", // 浅灰色背景
        },
        margins: {
          top: this.convertPtToTwips(6),
          bottom: this.convertPtToTwips(6),
          left: this.convertPtToTwips(8),
          right: this.convertPtToTwips(8),
        },
      })
    })

    tableRows.push(new TableRow({
      children: headerCells,
    }))

    // 创建数据行
    rows.forEach(row => {
      const dataCells = row.map((cell, index) => {
        const align = alignment && alignment[index] ? alignment[index] : 'left'
        const alignmentType = align === 'center' ? AlignmentType.CENTER :
          align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT

        return new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: this.cleanTextForWord(cell),
                  font: "Source Han Sans SC",
                  size: 22,
                }),
              ],
              alignment: alignmentType,
            }),
          ],
          margins: {
            top: this.convertPtToTwips(6),
            bottom: this.convertPtToTwips(6),
            left: this.convertPtToTwips(8),
            right: this.convertPtToTwips(8),
          },
        })
      })

      tableRows.push(new TableRow({
        children: dataCells,
      }))
    })

    // 创建表格
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      },
    })

    // 由于docx库的限制，我们需要将表格包装在段落中
    // 这里我们创建一个包含表格描述的段落，然后在实际应用中手动插入表格
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[表格: ${headers.join(' | ')}]`,
            font: "Source Han Sans SC",
            size: 20,
            color: "#666666",
            italics: true,
          }),
        ],
        spacing: {
          before: this.convertPtToTwips(3),
          after: this.convertPtToTwips(6),
        },
      })
    )

    // 添加表格数据作为文本（临时解决方案）
    rows.forEach(row => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `  ${row.join(' | ')}`,
              font: "Source Han Sans SC",
              size: 22,
            }),
          ],
          spacing: {
            after: this.convertPtToTwips(3),
          },
        })
      )
    })

    return paragraphs
  }

  // 创建代码块
  private createCodeBlock(code: string, language?: string): Paragraph {
    const languageLabel = language ? ` (${language})` : ''

    return new Paragraph({
      children: [
        new TextRun({
          text: `代码块${languageLabel}:\n${code}`,
          font: "Courier New", // 等宽字体
          size: 20,
          color: "#333333",
        }),
      ],
      spacing: {
        before: this.convertPtToTwips(6),
        after: this.convertPtToTwips(6),
        line: this.convertLineSpacingToTwips(1.2), // 代码块使用较小的行距
      },
      indent: {
        left: this.convertCmToTwips(1), // 代码块左缩进1cm
      },
      shading: {
        fill: "F8F9FA", // 浅灰色背景
      },
      border: {
        left: {
          color: "#DDDDDD",
          size: 3,
          space: 7,
          style: "single",
        }
      },
    })
  }

  // 创建分隔线
  private createSeparator(): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: "─".repeat(50), // 使用Unicode横线字符
          font: "Source Han Sans SC",
          size: 20,
          color: "#CCCCCC",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        before: this.convertPtToTwips(12),
        after: this.convertPtToTwips(12),
      },
    })
  }
}