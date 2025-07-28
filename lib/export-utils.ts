/**
 * 导出工具函数
 * 支持PDF和Word格式导出，包含水印功能
 * 包含移动端兼容性优化
 */

import { FormData } from "@/lib/types"
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
 * PDF导出 - 基于分页组件（支持移动端）
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
  const { formData } = options
  
  // 检查移动端兼容性
  const mobileCompat = checkMobileCompatibility()
  const limitations = checkMobileLimitations()
  
  if (!limitations.canExport) {
    throw new Error('当前设备不支持PDF导出功能：\n' + limitations.warnings.join('\n'))
  }
  
  // 动态导入库
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ])

  // 获取所有页面元素
  const pages = document.querySelectorAll('.page')
  if (pages.length === 0) {
    throw new Error('未找到分页内容，请先切换到分页模式')
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
      // 使用优化的配置截图
      const canvas = await html2canvas(pageElement, canvasConfig)
      const imgData = canvas.toDataURL('image/png', mobileCompat.memoryLimited ? 0.8 : 1.0)
      
      if (i > 0) {
        pdf.addPage()
      }
      
      // 添加页面图片
      pdf.addImage(imgData, 'PNG', 0, 0, 595, 842)
      
      // 如果启用了水印且页面没有水印，添加PDF水印
      if (watermarkConfig?.enabled && !pageElement.querySelector('[style*="watermark"]')) {
        addPDFWatermark(pdf, watermarkConfig)
      }
      
      // 移动端内存管理：每处理几页清理一次
      if (mobileCompat.memoryLimited && i % 3 === 0 && i > 0) {
        // 强制垃圾回收（如果支持）
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc()
        }
      }
      
    } catch (error) {
      console.error(`页面 ${i + 1} 处理失败:`, error)
      if (mobileCompat.isMobile) {
        throw new Error(`移动端导出失败：页面 ${i + 1} 处理出错，建议减少页数或使用桌面端`)
      }
      throw error
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
  const [docx, { saveAs }] = await Promise.all([
    import('docx'),
    import('file-saver')
  ])
  
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Header, Footer } = docx

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
  pdf.setTextColor(getColorRGB(color))
  pdf.setFontSize(fontSize)
  pdf.setGState(pdf.GState({ opacity: opacity / 100 }))
  
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
 * 生成文件名
 */
function generateFileName(storeName: string, extension: string): string {
  const date = new Date().toISOString().split('T')[0]
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-')
  return `${storeName}-内容-${date}-${time}.${extension}`
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