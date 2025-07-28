/**
 * 导出工具函数
 * 支持PDF和Word格式导出，包含水印功能
 * 包含移动端兼容性优化
 * 支持智能分页模式切换
 */

import { FormData } from "@/lib/types"

// PDF导出状态管理
class PDFExportManager {
  private static instance: PDFExportManager | null = null
  private exportQueue: Array<{
    id: string
    options: ExportOptions
    resolve: (value: void) => void
    reject: (error: Error) => void
  }> = []
  private isProcessing = false

  static getInstance(): PDFExportManager {
    if (!PDFExportManager.instance) {
      PDFExportManager.instance = new PDFExportManager()
    }
    return PDFExportManager.instance
  }

  // 智能PDF导出入口
  async smartExportToPDF(options: ExportOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const taskId = `pdf-${Date.now()}`
      this.exportQueue.push({ id: taskId, options, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.exportQueue.length === 0) return

    this.isProcessing = true
    const task = this.exportQueue.shift()!

    try {
      await this.executeSmartExport(task.options)
      task.resolve()
    } catch (error) {
      task.reject(error as Error)
    } finally {
      this.isProcessing = false
      if (this.exportQueue.length > 0) {
        this.processQueue()
      }
    }
  }

  private async executeSmartExport(options: ExportOptions): Promise<void> {
    const status = this.checkPaginationStatus()

    if (status.hasVisiblePages) {
      // 直接使用现有分页导出
      await this.exportWithCurrentPages(options)
    } else if (status.hasCachedContent) {
      // 自动切换到分页模式并导出
      await this.autoSwitchAndExport(options)
    } else {
      // 等待分页生成
      await this.waitAndExport(options)
    }
  }

  private checkPaginationStatus() {
    const hasVisiblePages = document.querySelectorAll('.page').length > 0
    let hasCachedContent = false

    try {
      const cached = localStorage.getItem('word-renderer-cache')
      hasCachedContent = cached ? JSON.parse(cached).paginationReady : false
    } catch (e) {
      hasCachedContent = false
    }

    return { hasVisiblePages, hasCachedContent }
  }

  private async exportWithCurrentPages(options: ExportOptions): Promise<void> {
    await executeBasicPDFExport(options)
  }

  private async autoSwitchAndExport(options: ExportOptions): Promise<void> {
    const originalMode = this.getCurrentMode()

    // 切换到分页模式
    this.triggerModeSwitch(true)

    // 等待分页渲染
    await this.waitForPages()

    // 执行导出
    await executeBasicPDFExport(options)

    // 恢复原模式
    if (originalMode === 'stream') {
      setTimeout(() => this.triggerModeSwitch(false), 500)
    }
  }

  private async waitAndExport(options: ExportOptions): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('分页生成超时')), 30000)

      const checkInterval = setInterval(() => {
        const status = this.checkPaginationStatus()
        if (status.hasCachedContent) {
          clearInterval(checkInterval)
          clearTimeout(timeout)
          resolve()
        }
      }, 500)
    })

    await this.autoSwitchAndExport(options)
  }

  private getCurrentMode(): 'stream' | 'pagination' {
    return document.querySelector('[data-pagination-active="true"]') ? 'pagination' : 'stream'
  }

  private triggerModeSwitch(toPagination: boolean): void {
    const event = new CustomEvent('smart-mode-switch', {
      detail: { toPagination, forExport: true }
    })
    window.dispatchEvent(event)
  }

  private async waitForPages(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('等待分页超时')), 5000)

      const checkInterval = setInterval(() => {
        if (document.querySelectorAll('.page').length > 0) {
          clearInterval(checkInterval)
          clearTimeout(timeout)
          resolve()
        }
      }, 100)
    })
  }
}

// 基础PDF导出执行函数
async function executeBasicPDFExport(options: ExportOptions): Promise<void> {
  const { formData } = options

  // 检查移动端兼容性
  const mobileCompat = checkMobileCompatibility()
  const limitations = checkMobileLimitations()

  if (!limitations.canExport) {
    throw new Error('当前设备不支持PDF导出功能：\n' + limitations.warnings.join('\n'))
  }

  // 动态导入库
  const [jsPDFModule, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ])
  
  const jsPDF = jsPDFModule.default
  const html2canvas = html2canvasModule.default

  // 获取分页元素
  const pages = document.querySelectorAll('.page')
  if (pages.length === 0) {
    throw new Error('未找到分页内容')
  }

  // 移动端页数优化
  const optimizedPages = mobileCompat.isMobile ?
    optimizePagesForMobile(pages, mobileCompat.recommendedMaxPages) :
    Array.from(pages)

  const pdf = new jsPDF('p', 'pt', 'a4')
  const watermarkConfig = getWatermarkConfig()

  // 获取移动端优化的canvas配置
  const canvasConfig = getMobileCanvasConfig(mobileCompat.isMobile, mobileCompat.memoryLimited)

  for (let i = 0; i < optimizedPages.length; i++) {
    const pageElement = optimizedPages[i] as HTMLElement

    // 移动端显示进度
    if (mobileCompat.isMobile && optimizedPages.length > 5) {
      console.log(`📱 移动端导出进度: ${i + 1}/${optimizedPages.length}`)
    }

    try {
      // 预处理页面中的图片，确保它们能正确加载
      await preprocessPageImages(pageElement)
      
      // 使用优化的配置截图
      const canvas = await html2canvas(pageElement, canvasConfig)
      const imgData = canvas.toDataURL('image/png', mobileCompat.memoryLimited ? 0.8 : 1.0)

      if (i > 0) {
        pdf.addPage()
      }

      // 添加页面图片
      pdf.addImage(imgData, 'PNG', 0, 0, 595, 842)

      // 基于分页的PDF导出：直接使用截图内容，不再添加额外水印
      // 如果分页中有水印，截图会自动包含；如果没有，就不应该有水印

      // 移动端内存管理：每处理几页清理一次
      if (mobileCompat.memoryLimited && i % 3 === 0 && i > 0) {
        // 强制垃圾回收（如果支持）
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc()
        }
      }

    } catch (error) {
      console.error(`页面 ${i + 1} 处理失败:`, error)
      
      // 如果是图片加载错误，尝试继续处理但给出警告
      if (error instanceof Error && error.message.includes('Error loading image')) {
        console.warn(`页面 ${i + 1} 包含无法加载的图片，将继续处理但可能影响显示效果`)
        
        try {
          // 尝试使用更宽松的配置重新截图
          const fallbackConfig = {
            ...canvasConfig,
            allowTaint: true,
            useCORS: false,
            ignoreElements: (element: Element) => {
              // 忽略有问题的图片
              if (element.tagName === 'IMG') {
                const img = element as HTMLImageElement
                if (img.src && img.src.includes('aliyuncs.com')) {
                  return true // 忽略阿里云图片
                }
              }
              return false
            }
          }
          
          const canvas = await html2canvas(pageElement, fallbackConfig)
          const imgData = canvas.toDataURL('image/png', mobileCompat.memoryLimited ? 0.8 : 1.0)

          if (i > 0) {
            pdf.addPage()
          }
          pdf.addImage(imgData, 'PNG', 0, 0, 595, 842)
          
          console.log(`✅ 页面 ${i + 1} 使用备用方案处理成功`)
        } catch (fallbackError) {
          console.error(`页面 ${i + 1} 备用方案也失败:`, fallbackError)
          if (mobileCompat.isMobile) {
            throw new Error(`移动端导出失败：页面 ${i + 1} 处理出错，建议减少页数或使用桌面端`)
          }
          throw error
        }
      } else {
        if (mobileCompat.isMobile) {
          throw new Error(`移动端导出失败：页面 ${i + 1} 处理出错，建议减少页数或使用桌面端`)
        }
        throw error
      }
    }
  }

  // 生成文件名
  const fileName = generateFileName(formData.storeName || '内容', 'pdf')

  // 移动端特殊下载处理
  if (mobileCompat.isMobile) {
    const pdfBlob = pdf.output('blob')
    const result = handleMobileDownload(pdfBlob, fileName, mobileCompat.isIOS)

    if (!result.success) {
      throw new Error(result.message)
    }

    if (mobileCompat.isIOS) {
      alert(result.message)
    }
  } else {
    // 桌面端直接保存
    pdf.save(fileName)
  }
}
import {
  checkMobileCompatibility,
  getMobileCanvasConfig,
  handleMobileDownload,
  optimizePagesForMobile,
  checkMobileLimitations
} from "./mobile-compatibility"

export interface ExportOptions {
  content: string
  formData: FormData
  bannerImage?: string | null
  includeWatermark?: boolean
  format: 'pdf' | 'word'
}

export interface WatermarkConfig {
  enabled: boolean
  text: string
  opacity: number
  fontSize: number
  rotation: number
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  repeat: 'none' | 'diagonal' | 'grid'
  color: 'gray' | 'red' | 'blue' | 'black'
}

/**
 * 获取水印配置
 */
export function getWatermarkConfig(): WatermarkConfig | null {
  try {
    const saved = localStorage.getItem('watermarkConfig')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.warn('获取水印配置失败:', error)
    return null
  }
}

/**
 * PDF导出 - 智能分页模式切换
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const manager = PDFExportManager.getInstance()
  return manager.smartExportToPDF(options)
}



/**
 * Word导出 - 基于内容文本（支持移动端）
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
  const { content, formData } = options

  // 检查移动端兼容性
  const mobileCompat = checkMobileCompatibility()
  const limitations = checkMobileLimitations()

  if (!limitations.canExport) {
    throw new Error('当前设备不支持Word导出功能：\n' + limitations.warnings.join('\n'))
  }

  // 动态导入库
  const [docx, fileSaver] = await Promise.all([
    import('docx'),
    import('file-saver')
  ])

  const { saveAs } = fileSaver

  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Header } = docx

  // 解析内容
  const paragraphs = parseContentToWordParagraphs(content, docx)

  // 获取水印配置
  const watermarkConfig = getWatermarkConfig()

  try {
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1英寸
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${formData.storeName || '星光传媒'} | 专注于服务本地实体商家的IP内容机构`,
                    font: "Source Han Sans SC",
                    size: 18,
                    color: "666666"
                  })
                ],
                alignment: "center"
              })
            ]
          })
        },
        children: [
          // 添加水印段落（如果启用）
          ...(watermarkConfig?.enabled ? [createWordWatermark(watermarkConfig, docx)] : []),
          ...paragraphs
        ]
      }]
    })

    // 移动端显示处理进度
    if (mobileCompat.isMobile) {
      console.log('📱 移动端正在生成Word文档...')
    }

    const blob = await Packer.toBlob(doc)
    const fileName = generateFileName(formData.storeName || '内容', 'docx')

    // 移动端特殊下载处理
    if (mobileCompat.isMobile) {
      const result = handleMobileDownload(blob, fileName, mobileCompat.isIOS)

      if (!result.success) {
        throw new Error(result.message)
      }

      if (mobileCompat.isIOS) {
        alert(result.message)
      }
    } else {
      // 桌面端使用file-saver
      saveAs(blob, fileName)
    }

  } catch (error) {
    console.error('Word导出失败:', error)
    if (mobileCompat.isMobile) {
      throw new Error('移动端Word导出失败，建议使用桌面浏览器')
    }
    throw error
  }
}

/**
 * 为PDF添加水印
 */
function addPDFWatermark(pdf: any, config: WatermarkConfig): void {
  const { text, opacity, fontSize, rotation, position, repeat, color } = config

  // 设置水印样式
  const colorRGB = getColorRGB(color)
  pdf.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2])
  pdf.setFontSize(fontSize)

  // 设置透明度 - 使用正确的jsPDF API
  try {
    pdf.setGState(new pdf.GState({ opacity: opacity / 100 }))
  } catch (error) {
    // 如果GState不可用，跳过透明度设置
    console.warn('PDF透明度设置失败，跳过水印透明度:', error)
  }

  const pageWidth = 595 // A4宽度
  const pageHeight = 842 // A4高度

  if (repeat === 'none') {
    // 单个水印
    const pos = getWatermarkPosition(position, pageWidth, pageHeight)
    pdf.text(text, pos.x, pos.y, { angle: rotation })
  } else if (repeat === 'grid') {
    // 网格水印
    const rows = 3
    const cols = 2
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (pageWidth / (cols + 1)) * (col + 1)
        const y = (pageHeight / (rows + 1)) * (row + 1)
        pdf.text(text, x, y, { angle: rotation, align: 'center' })
      }
    }
  } else if (repeat === 'diagonal') {
    // 对角线水印
    const positions = [
      { x: pageWidth * 0.2, y: pageHeight * 0.2 },
      { x: pageWidth * 0.4, y: pageHeight * 0.4 },
      { x: pageWidth * 0.6, y: pageHeight * 0.6 },
      { x: pageWidth * 0.8, y: pageHeight * 0.8 }
    ]
    positions.forEach(pos => {
      pdf.text(text, pos.x, pos.y, { angle: rotation, align: 'center' })
    })
  }
}

/**
 * 创建Word水印
 */
function createWordWatermark(config: WatermarkConfig, docx: any): any {
  const { Paragraph, TextRun } = docx

  return new Paragraph({
    children: [
      new TextRun({
        text: config.text,
        font: "Source Han Sans SC",
        size: config.fontSize,
        color: getColorHex(config.color),
        opacity: config.opacity
      })
    ],
    alignment: "center"
  })
}

/**
 * 解析markdown内容为Word段落
 */
function parseContentToWordParagraphs(content: string, docx: any): any[] {
  const { Paragraph, TextRun, HeadingLevel } = docx
  const paragraphs: any[] = []

  const lines = content.split('\n').filter(line => line.trim())

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('#')) {
      // 处理标题
      const level = (trimmedLine.match(/^#+/) || [''])[0].length
      const text = trimmedLine.replace(/^#+\s*/, '')

      paragraphs.push(new Paragraph({
        text: text,
        heading: level === 1 ? HeadingLevel.HEADING_1 :
          level === 2 ? HeadingLevel.HEADING_2 :
            HeadingLevel.HEADING_3,
        spacing: { after: 200 }
      }))
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // 处理列表项
      const text = trimmedLine.replace(/^[-*]\s*/, '')
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: `• ${text}`,
            font: "Source Han Sans SC",
            size: 22
          })
        ],
        spacing: { after: 100 }
      }))
    } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
      // 处理粗体
      const text = trimmedLine.replace(/^\*\*|\*\*$/g, '')
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: text,
            font: "Source Han Sans SC",
            size: 22,
            bold: true
          })
        ],
        spacing: { after: 120 }
      }))
    } else if (trimmedLine) {
      // 处理普通段落
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            font: "Source Han Sans SC",
            size: 22 // 11pt = 22 half-points
          })
        ],
        spacing: { after: 120 },
        indent: { firstLine: 420 } // 首行缩进
      }))
    }
  }

  return paragraphs
}

/**
 * 获取水印位置
 */
function getWatermarkPosition(position: string, width: number, height: number) {
  switch (position) {
    case 'center':
      return { x: width / 2, y: height / 2 }
    case 'top-left':
      return { x: width * 0.2, y: height * 0.2 }
    case 'top-right':
      return { x: width * 0.8, y: height * 0.2 }
    case 'bottom-left':
      return { x: width * 0.2, y: height * 0.8 }
    case 'bottom-right':
      return { x: width * 0.8, y: height * 0.8 }
    default:
      return { x: width / 2, y: height / 2 }
  }
}

/**
 * 获取颜色RGB值
 */
function getColorRGB(color: string) {
  const colorMap = {
    gray: [128, 128, 128],
    red: [220, 53, 69],
    blue: [13, 110, 253],
    black: [33, 37, 41]
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.gray
}

/**
 * 获取颜色十六进制值
 */
function getColorHex(color: string): string {
  const colorMap = {
    gray: "808080",
    red: "DC3545",
    blue: "0D6EFD",
    black: "212529"
  }
  return colorMap[color as keyof typeof colorMap] || colorMap.gray
}

/**
 * 预处理页面中的图片，确保它们能正确加载
 */
async function preprocessPageImages(pageElement: HTMLElement): Promise<void> {
  const images = pageElement.querySelectorAll('img')
  const imagePromises: Promise<void>[] = []

  images.forEach((img) => {
    if (img.src && img.src.includes('aliyuncs.com')) {
      const promise = new Promise<void>((resolve) => {
        // 如果图片已经加载完成
        if (img.complete && img.naturalHeight !== 0) {
          resolve()
          return
        }

        // 设置超时时间
        const timeout = setTimeout(() => {
          console.warn('图片加载超时，将使用占位符:', img.src)
          // 创建占位符
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 200
          canvas.height = img.height || 150
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#f8f9fa'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.strokeStyle = '#dee2e6'
            ctx.strokeRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#6c757d'
            ctx.font = '14px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('图片加载中...', canvas.width / 2, canvas.height / 2)
          }
          img.src = canvas.toDataURL()
          resolve()
        }, 10000) // 10秒超时

        // 图片加载成功
        img.onload = () => {
          clearTimeout(timeout)
          resolve()
        }

        // 图片加载失败
        img.onerror = () => {
          clearTimeout(timeout)
          console.warn('图片加载失败，使用占位符:', img.src)
          // 创建错误占位符
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 200
          canvas.height = img.height || 150
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#f8d7da'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.strokeStyle = '#f5c6cb'
            ctx.strokeRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#721c24'
            ctx.font = '14px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('图片加载失败', canvas.width / 2, canvas.height / 2)
          }
          img.src = canvas.toDataURL()
          resolve()
        }

        // 如果图片还没开始加载，触发加载
        if (!img.src) {
          resolve()
        }
      })

      imagePromises.push(promise)
    }
  })

  // 等待所有图片处理完成，但不超过15秒
  try {
    await Promise.race([
      Promise.all(imagePromises),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('图片预处理超时')), 15000)
      )
    ])
  } catch (error) {
    console.warn('图片预处理超时，继续导出:', error)
  }
}

/**
 * 生成文件名
 */
function generateFileName(storeName: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0]
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${storeName}-内容-${date}-${time}.${extension}`
}

/**
 * 自动生成分页内容用于PDF导出
 * 在后台创建临时的分页DOM结构
 */
async function generatePagesForExport(
  content: string,
  formData: FormData,
  bannerImage?: string | null
): Promise<NodeListOf<Element>> {
  return new Promise((resolve, reject) => {
    try {
      // 创建临时容器
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      tempContainer.style.top = '0'
      tempContainer.style.visibility = 'hidden'
      tempContainer.style.pointerEvents = 'none'
      tempContainer.id = 'temp-pagination-container'

      // 动态导入分页组件
      import('../components/word-style-renderer-with-pagination').then(({ WordStyleRendererWithPagination }) => {
        // 使用React渲染分页组件到临时容器
        const { createRoot } = require('react-dom/client')
        const React = require('react')

        const root = createRoot(tempContainer)

        // 渲染分页组件
        root.render(
          React.createElement(WordStyleRendererWithPagination, {
            content,
            formData,
            bannerImage,
            isGeneratingBanner: false
          })
        )

        // 添加到DOM
        document.body.appendChild(tempContainer)

        // 等待渲染完成
        setTimeout(() => {
          const pages = tempContainer.querySelectorAll('.page')
          if (pages.length > 0) {
            console.log(`✅ 自动生成了 ${pages.length} 页内容`)
            resolve(pages)
          } else {
            // 清理临时容器
            document.body.removeChild(tempContainer)
            reject(new Error('自动分页生成失败'))
          }
        }, 2000) // 等待2秒确保渲染完成

      }).catch(error => {
        console.error('分页组件导入失败:', error)
        reject(new Error('无法加载分页组件'))
      })

    } catch (error) {
      console.error('自动分页生成出错:', error)
      reject(error)
    }
  })
}

/**
 * 清理临时生成的分页内容
 */
function cleanupTempPagination(): void {
  const tempContainer = document.getElementById('temp-pagination-container')
  if (tempContainer && tempContainer.parentNode) {
    tempContainer.parentNode.removeChild(tempContainer)
    console.log('🧹 清理临时分页容器')
  }
}

/**
 * 检查是否支持导出功能（增强移动端检测）
 */
export function checkExportSupport(): {
  pdf: boolean;
  word: boolean;
  mobile: boolean;
  warnings: string[];
} {
  const mobileCompat = checkMobileCompatibility()
  const limitations = checkMobileLimitations()

  return {
    pdf: typeof window !== 'undefined' && 'HTMLCanvasElement' in window && mobileCompat.canvasSupport,
    word: typeof window !== 'undefined' && 'Blob' in window && mobileCompat.blobSupport,
    mobile: mobileCompat.isMobile,
    warnings: limitations.warnings
  }
}