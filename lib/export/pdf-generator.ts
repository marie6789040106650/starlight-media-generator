import { WordToPDFGenerator, PDFFromWordOptions } from './word-to-pdf-generator'
import { addCompanyWatermark, addConfidentialWatermark, WatermarkPresets } from '../utils/pdf-watermark'

export interface PDFExportOptions {
  content: string
  storeName: string
  bannerImage?: string | null
  filename?: string
  includeWatermark?: boolean
  watermarkText?: string
  watermarkType?: 'company' | 'confidential' | 'custom'
  watermarkOptions?: any
}

/**
 * PDF生成器 - 基于Word转换方案
 * 
 * 这个类使用Word文档作为中间格式来生成PDF，
 * 避免了直接PDF生成中的中文字体和格式问题。
 */
export class PDFGenerator {
  private wordToPdfGenerator: WordToPDFGenerator

  constructor() {
    this.wordToPdfGenerator = new WordToPDFGenerator()
  }

  /**
   * 生成PDF文档（智能选择最佳方式）
   * 
   * 这个方法会：
   * 1. 优先使用后端API直接生成PDF
   * 2. 如果后端不可用，降级到Word转换方式
   * 3. 确保中文内容正确显示和格式一致
   */
  async generatePDFDocument(options: PDFExportOptions): Promise<void> {
    const { content, storeName, bannerImage, filename, includeWatermark } = options

    // 输入验证
    if (!content?.trim()) {
      throw new Error('文档内容不能为空')
    }
    
    if (!storeName?.trim()) {
      throw new Error('店铺名称不能为空')
    }

    console.log('🚀 开始PDF生成流程...')

    try {
      // 首先尝试使用后端API直接生成PDF
      console.log('📡 尝试使用后端API生成PDF...')
      await this.generatePDFViaAPI(options)
      console.log('✅ PDF已通过后端API成功生成')
      
    } catch (apiError) {
      console.warn('⚠️ 后端PDF生成失败，启动降级方案:', apiError)
      
      // 显示降级提示
      this.showFallbackMessage(apiError instanceof Error ? apiError.message : '未知错误')
      
      // 降级到Word转PDF方式
      const pdfOptions: PDFFromWordOptions = {
        content,
        storeName,
        bannerImage,
        filename: filename || this.generatePDFFilename(content),
        includeWatermark,
        pdfQuality: 'high',
        includeBookmarks: true
      }

      try {
        console.log('📄 使用Word转换方式生成PDF...')
        await this.wordToPdfGenerator.generatePDFDocument(pdfOptions)
        this.showWordConversionMessage(pdfOptions.filename!)
        console.log('✅ Word文档已生成，请按提示转换为PDF')
      } catch (fallbackError) {
        console.error('❌ PDF生成完全失败:', fallbackError)
        throw new Error(`PDF生成失败: ${fallbackError instanceof Error ? fallbackError.message : '未知错误'}`)
      }
    }
  }

  /**
   * 通过后端API生成PDF
   */
  private async generatePDFViaAPI(options: PDFExportOptions): Promise<void> {
    const { content, storeName, bannerImage, filename, includeWatermark } = options

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          storeName,
          bannerImage,
          filename: filename || this.generatePDFFilename(content),
          includeWatermark,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // 如果是服务不可用，抛出特定错误以便降级处理
        if (response.status === 503) {
          throw new Error(`PDF服务不可用: ${errorData.error || '服务器配置问题'}`)
        }
        
        throw new Error(`PDF生成失败: ${errorData.error || '服务器错误'}`)
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/pdf')) {
        throw new Error('服务器返回的不是PDF文件')
      }

      // 下载生成的PDF文件
      let blob = await response.blob()
      const finalFilename = filename || this.generatePDFFilename(content)
      
      // 验证blob大小
      if (blob.size === 0) {
        throw new Error('生成的PDF文件为空')
      }
      
      // 添加水印（如果需要）
      if (includeWatermark) {
        console.log('🔖 正在添加PDF水印...')
        blob = await this.addWatermarkToPDF(blob, options)
        console.log('✅ PDF水印添加完成')
      }
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = finalFilename
      document.body.appendChild(a)
      a.click()
      
      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      console.log(`✅ PDF文档已生成并下载: ${finalFilename}`)
      
    } catch (networkError) {
      console.error('PDF API调用失败:', networkError)
      
      // 网络错误或超时，抛出特定错误以便降级处理
      if (networkError instanceof TypeError && networkError.message.includes('fetch')) {
        throw new Error('网络连接失败，无法访问PDF生成服务')
      }
      
      throw networkError
    }
  }

  /**
   * 生成PDF文件名
   */
  private generatePDFFilename(content: string = ""): string {
    const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
    
    let title = "企业方案"
    
    // 尝试从内容中提取标题
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        title = trimmed.substring(2).trim()
        if (title.length > 30) {
          title = title.substring(0, 30) + "..."
        }
        break
      }
    }
    
    return `${title}-${currentDate}.pdf`
  }

  /**
   * 显示降级方案提示
   */
  private showFallbackMessage(errorMessage: string): void {
    const message = `⚠️ 后端PDF服务不可用

原因：${errorMessage}
解决方案：将使用Word转换方式生成PDF

这种方式同样能确保：
✅ 完美的中文字符支持
✅ 一致的文档格式
✅ 专业的排版效果`

    console.warn(message)
  }

  /**
   * 显示Word转换成功消息
   */
  private showWordConversionMessage(filename: string): void {
    const message = `✅ Word文档已生成！

📄 文件名：${filename}
🔄 请使用以下方式转换为PDF：

推荐方式：
1. Microsoft Word：文件 → 另存为 → PDF
2. 在线工具：smallpdf.com、ilovepdf.com
3. Google Docs：上传后下载为PDF

💡 转换后的PDF将保持与Word完全一致的格式`

    console.log(message)
  }

  /**
   * 直接生成Word文档（备用方法）
   */
  async generateWordDocument(options: PDFExportOptions): Promise<void> {
    const wordOptions = {
      content: options.content,
      storeName: options.storeName,
      bannerImage: options.bannerImage,
      filename: options.filename?.replace(/\.pdf$/i, '.docx'),
      includeWatermark: options.includeWatermark
    }

    return this.wordToPdfGenerator.generateWordDocument(wordOptions)
  }

  /**
   * 为 PDF 添加水印
   */
  private async addWatermarkToPDF(blob: Blob, options: PDFExportOptions): Promise<Blob> {
    try {
      const { storeName, watermarkText, watermarkType = 'company', watermarkOptions } = options
      
      // 将 Blob 转换为 ArrayBuffer
      const arrayBuffer = await blob.arrayBuffer()
      
      let watermarkResult
      
      // 根据水印类型选择不同的水印方法
      switch (watermarkType) {
        case 'confidential':
          watermarkResult = await addConfidentialWatermark(arrayBuffer, {
            ...WatermarkPresets.security,
            ...watermarkOptions
          })
          break
        case 'custom':
          if (watermarkText) {
            const { addSimpleWatermark } = await import('../utils/pdf-watermark')
            watermarkResult = await addSimpleWatermark(arrayBuffer, watermarkText, {
              ...WatermarkPresets.standard,
              ...watermarkOptions
            })
          } else {
            // 默认使用公司水印
            watermarkResult = await addCompanyWatermark(arrayBuffer, storeName, {
              ...WatermarkPresets.copyright,
              ...watermarkOptions
            })
          }
          break
        case 'company':
        default:
          watermarkResult = await addCompanyWatermark(arrayBuffer, storeName, {
            ...WatermarkPresets.copyright,
            ...watermarkOptions
          })
          break
      }
      
      if (watermarkResult.success && watermarkResult.pdfBytes) {
        console.log(`✅ 水印添加成功 - 处理了 ${watermarkResult.stats?.watermarkedPages} 页`)
        return new Blob([watermarkResult.pdfBytes], { type: 'application/pdf' })
      } else {
        console.warn('⚠️ 水印添加失败，返回原始PDF:', watermarkResult.error)
        return blob
      }
    } catch (error) {
      console.error('❌ 水印处理出错:', error)
      // 如果水印添加失败，返回原始PDF
      return blob
    }
  }
}

/**
 * 便捷函数：生成PDF（通过Word转换）
 */
export async function generatePDF(options: PDFExportOptions): Promise<void> {
  const generator = new PDFGenerator()
  return generator.generatePDFDocument(options)
}

/**
 * 获取PDF生成说明
 */
export function getPDFGenerationInstructions(): string {
  return `
📄 PDF生成说明

本系统使用Word转PDF的方式生成PDF文档，确保：
✅ 完美支持中文字符
✅ 保持专业的文档格式
✅ 支持复杂的样式和布局

生成流程：
1. 系统生成Word文档（.docx格式）
2. 用户下载Word文档
3. 使用Word软件或在线工具转换为PDF

推荐转换方法：
• Microsoft Word：文件 → 另存为 → PDF
• 在线工具：smallpdf.com、ilovepdf.com
• Google Docs：上传后下载为PDF

这种方式虽然多了一步，但能确保PDF质量和中文显示效果。
  `
}