import { WordGenerator, WordExportOptions } from './word-generator'

export interface PDFFromWordOptions extends Omit<WordExportOptions, 'filename'> {
  filename?: string
  // 可以添加PDF特定的选项
  pdfQuality?: 'high' | 'medium' | 'low'
  includeBookmarks?: boolean
}

export class WordToPDFGenerator {
  private wordGenerator: WordGenerator

  constructor() {
    this.wordGenerator = new WordGenerator()
  }

  /**
   * 生成PDF文档（通过Word转换）
   * 这个方法会先生成Word文档，然后提供转换指导
   */
  async generatePDFDocument(options: PDFFromWordOptions): Promise<void> {
    const { filename, ...wordOptions } = options
    
    // 生成临时的Word文档
    const tempWordFilename = this.generateTempWordFilename(filename)
    
    try {
      // 先生成Word文档
      await this.wordGenerator.generateWordDocument({
        ...wordOptions,
        filename: tempWordFilename
      })

      // 显示转换指导
      this.showConversionInstructions(tempWordFilename, filename)
      
    } catch (error) {
      console.error('生成Word文档失败:', error)
      throw new Error('PDF生成失败：无法创建Word文档')
    }
  }

  /**
   * 生成临时Word文件名
   */
  private generateTempWordFilename(pdfFilename?: string): string {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
    
    if (pdfFilename) {
      // 将PDF扩展名替换为Word扩展名
      const baseName = pdfFilename.replace(/\.pdf$/i, '')
      return `${baseName}-temp-${currentDate}.docx`
    }
    
    return `企业方案-temp-${currentDate}.docx`
  }

  /**
   * 显示Word转PDF的操作指导
   */
  private showConversionInstructions(wordFilename: string, pdfFilename?: string): void {
    const finalPdfName = pdfFilename || wordFilename.replace(/\.docx$/i, '.pdf')
    
    const instructions = `
📄 Word文档已生成：${wordFilename}

🔄 转换为PDF的方法：

方法一：使用Microsoft Word
1. 打开刚下载的Word文档
2. 点击"文件" → "另存为"
3. 选择文件类型为"PDF"
4. 保存为：${finalPdfName}

方法二：使用在线转换工具
1. 访问在线Word转PDF工具（如：smallpdf.com、ilovepdf.com）
2. 上传刚下载的Word文档
3. 下载转换后的PDF文件

方法三：使用Google Docs
1. 上传Word文档到Google Drive
2. 用Google Docs打开
3. 点击"文件" → "下载" → "PDF文档(.pdf)"

💡 推荐使用方法一，可以保持最佳的格式和质量。
    `

    // 在控制台显示指导
    console.log(instructions)
    
    // 如果在浏览器环境，也可以显示弹窗
    if (typeof window !== 'undefined') {
      // 创建一个更友好的提示框
      this.showUserFriendlyInstructions(wordFilename, finalPdfName)
    }
  }

  /**
   * 显示用户友好的转换指导
   */
  private showUserFriendlyInstructions(wordFilename: string, pdfFilename: string): void {
    const message = `Word文档已生成并下载！

要转换为PDF，请：
1. 打开下载的Word文档（${wordFilename}）
2. 在Word中选择"文件" → "另存为" → "PDF"
3. 保存为：${pdfFilename}

或者使用在线转换工具进行转换。`

    alert(message)
  }

  /**
   * 直接生成Word文档（用于需要Word格式的场景）
   */
  async generateWordDocument(options: WordExportOptions): Promise<void> {
    return this.wordGenerator.generateWordDocument(options)
  }
}

/**
 * 便捷函数：生成PDF（通过Word转换）
 */
export async function generatePDFFromWord(options: PDFFromWordOptions): Promise<void> {
  const generator = new WordToPDFGenerator()
  return generator.generatePDFDocument(options)
}

/**
 * 便捷函数：检查是否支持直接PDF转换
 * 在浏览器环境中，我们无法直接转换，需要用户手动操作
 */
export function isDirectPDFConversionSupported(): boolean {
  // 在浏览器环境中，我们无法直接进行Word到PDF的转换
  // 这需要服务器端支持或用户手动操作
  return false
}

/**
 * 获取推荐的转换方法
 */
export function getRecommendedConversionMethod(): string {
  return `
推荐的Word转PDF方法：

1. Microsoft Word（最佳质量）
   - 打开Word文档
   - 文件 → 另存为 → PDF

2. 在线转换工具（便捷）
   - smallpdf.com
   - ilovepdf.com
   - pdf24.org

3. Google Docs（免费）
   - 上传到Google Drive
   - 用Google Docs打开
   - 文件 → 下载 → PDF
  `
}