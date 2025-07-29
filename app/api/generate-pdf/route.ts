import { NextRequest, NextResponse } from 'next/server'
import { OptimizedTempFileManager } from '@/lib/temp-file-manager'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, access, readdir } from 'fs/promises'
import { join } from 'path'
import { constants } from 'fs'
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib'

const execAsync = promisify(exec)

/**
 * 服务端水印处理函数
 */
async function addServerSideWatermark(
  pdfBuffer: Buffer,
  watermarkConfig: {
    enabled: boolean
    text: string
    opacity: number
    fontSize: number
    rotation: number
    position: string
    repeat: string
    color: string
  }
): Promise<Buffer | null> {
  try {
    console.log(`🛡️ 服务端添加水印: "${watermarkConfig.text}"`)
    
    // 加载PDF文档
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    
    // 尝试加载中文字体
    let font
    try {
      // 在服务端，我们可以直接读取字体文件
      const fontPath = join(process.cwd(), 'public/fonts/NotoSansSC-Regular.woff2')
      const fontBytes = await readFile(fontPath)
      console.log(`📁 服务端加载字体文件: ${fontPath}, 大小: ${fontBytes.length} bytes`)
      font = await pdfDoc.embedFont(fontBytes)
      console.log('✅ 服务端中文字体加载成功')
    } catch (fontError) {
      console.warn('⚠️ 服务端中文字体加载失败，使用默认字体:', fontError)
      font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    }
    
    // 转换颜色
    const colorMap = {
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      red: { r: 1, g: 0, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      black: { r: 0, g: 0, b: 0 }
    }
    const color = colorMap[watermarkConfig.color as keyof typeof colorMap] || colorMap.gray
    
    // 为每个页面添加水印
    for (const page of pages) {
      const { width, height } = page.getSize()
      
      if (watermarkConfig.repeat === 'diagonal') {
        // 对角线重复水印
        const spacing = 150
        for (let x = -width; x < width * 2; x += spacing) {
          for (let y = -height; y < height * 2; y += spacing) {
            page.drawText(watermarkConfig.text, {
              x: x,
              y: y,
              size: watermarkConfig.fontSize,
              font: font,
              color: rgb(color.r, color.g, color.b),
              opacity: watermarkConfig.opacity / 100,
              rotate: degrees(watermarkConfig.rotation)
            })
          }
        }
      } else if (watermarkConfig.repeat === 'grid') {
        // 网格重复水印
        const spacingX = 120
        const spacingY = 80
        for (let x = spacingX / 2; x < width; x += spacingX) {
          for (let y = spacingY / 2; y < height; y += spacingY) {
            page.drawText(watermarkConfig.text, {
              x: x,
              y: y,
              size: watermarkConfig.fontSize,
              font: font,
              color: rgb(color.r, color.g, color.b),
              opacity: watermarkConfig.opacity / 100,
              rotate: degrees(watermarkConfig.rotation)
            })
          }
        }
      } else {
        // 单个水印
        let x = width / 2
        let y = height / 2
        
        // 根据位置调整
        if (watermarkConfig.position.includes('left')) x = width * 0.2
        if (watermarkConfig.position.includes('right')) x = width * 0.8
        if (watermarkConfig.position.includes('top')) y = height * 0.8
        if (watermarkConfig.position.includes('bottom')) y = height * 0.2
        
        page.drawText(watermarkConfig.text, {
          x: x,
          y: y,
          size: watermarkConfig.fontSize,
          font: font,
          color: rgb(color.r, color.g, color.b),
          opacity: watermarkConfig.opacity / 100,
          rotate: degrees(watermarkConfig.rotation)
        })
      }
    }
    
    // 保存PDF
    const pdfBytes = await pdfDoc.save()
    console.log(`✅ 服务端水印处理完成，新文件大小: ${pdfBytes.length} bytes`)
    
    return Buffer.from(pdfBytes)
    
  } catch (error) {
    console.error('❌ 服务端水印处理失败:', error)
    return null
  }
}

// Configuration constants
const PDF_CONVERSION_CONFIG = {
  TIMEOUT_MS: 45000,
  DEFAULT_FILENAME: '企业方案',
  SUPPORTED_FORMATS: ['.docx'],
  LIBREOFFICE_ERRORS: ['libreoffice', 'command not found', 'No such file', 'not found'],
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TEMP_DIR_PREFIX: 'pdf-conversion-',
  LIBREOFFICE_COMMANDS: [
    'libreoffice',
    '/usr/bin/libreoffice',
    '/opt/libreoffice/program/soffice',
    'soffice'
  ]
} as const

// Error messages
const ERROR_MESSAGES = {
  MISSING_PARAMS: '缺少必要参数：content 和 storeName',
  CONVERSION_FAILED: 'PDF转换失败，请稍后重试',
  SERVICE_UNAVAILABLE: 'PDF转换服务未配置，请安装LibreOffice或使用Docker服务',
  SERVER_ERROR: '服务器内部错误',
  FILE_NOT_FOUND: 'PDF文件生成失败：找不到输出文件',
  TIMEOUT_ERROR: 'PDF转换超时，请稍后重试',
  PERMISSION_ERROR: '文件权限错误，请检查临时目录权限',
} as const

// Custom error classes
class LibreOfficeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibreOfficeError'
  }
}

class ConversionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConversionError'
  }
}

interface PDFGenerationRequest {
  content: string
  storeName: string
  bannerImage?: string | null
  filename?: string
  includeWatermark?: boolean
  watermarkConfig?: {
    enabled: boolean
    text: string
    opacity: number
    fontSize: number
    rotation: number
    position: string
    repeat: string
    color: string
  }
}



/**
 * Find available LibreOffice command
 */
async function findLibreOfficeCommand(): Promise<string | null> {
  for (const command of PDF_CONVERSION_CONFIG.LIBREOFFICE_COMMANDS) {
    try {
      await execAsync(`which ${command}`, { timeout: 5000 })
      await execAsync(`${command} --version`, { timeout: 5000 })
      console.log(`✅ 找到LibreOffice命令: ${command}`)
      return command
    } catch (error) {
      continue
    }
  }
  
  console.warn('❌ 未找到可用的LibreOffice命令')
  return null
}

/**
 * Convert Word to PDF with retry mechanism
 */
async function convertWordToPdfWithRetry(
  libreOfficeCommand: string,
  wordPath: string,
  tempDir: string,
  timestamp: number
): Promise<Buffer> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= PDF_CONVERSION_CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 PDF转换尝试 ${attempt}/${PDF_CONVERSION_CONFIG.MAX_RETRIES}`)
      
      const command = `${libreOfficeCommand} --headless --convert-to pdf --outdir "${tempDir}" "${wordPath}"`
      console.log(`执行命令: ${command}`)
      
      const { stdout, stderr } = await execAsync(command, { 
        timeout: PDF_CONVERSION_CONFIG.TIMEOUT_MS,
        cwd: tempDir
      })
      
      if (stderr && !stderr.includes('Warning')) {
        console.warn('LibreOffice stderr:', stderr)
      }
      
      if (stdout) {
        console.log('LibreOffice stdout:', stdout)
      }
      
      // Wait for file generation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find generated PDF file
      const pdfBuffer = await findGeneratedPdf(tempDir, timestamp)
      
      console.log(`✅ PDF转换成功 (尝试 ${attempt})`)
      return pdfBuffer
      
    } catch (error) {
      lastError = error as Error
      console.error(`❌ PDF转换失败 (尝试 ${attempt}):`, error)
      
      if (error instanceof Error && error.message.includes('timeout')) {
        console.log(`⏱️ 转换超时，等待 ${PDF_CONVERSION_CONFIG.RETRY_DELAY}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, PDF_CONVERSION_CONFIG.RETRY_DELAY))
        continue
      }
      
      if (error instanceof Error && isLibreOfficeError(error)) {
        throw new LibreOfficeError(error.message)
      }
      
      if (attempt < PDF_CONVERSION_CONFIG.MAX_RETRIES) {
        console.log(`⏳ 等待 ${PDF_CONVERSION_CONFIG.RETRY_DELAY}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, PDF_CONVERSION_CONFIG.RETRY_DELAY))
      }
    }
  }
  
  throw new ConversionError(`PDF转换失败，已重试 ${PDF_CONVERSION_CONFIG.MAX_RETRIES} 次: ${lastError?.message}`)
}

/**
 * Find generated PDF file
 */
async function findGeneratedPdf(tempDir: string, timestamp: number): Promise<Buffer> {
  const expectedPdfPath = join(tempDir, `document-${timestamp}.pdf`)
  
  try {
    await access(expectedPdfPath, constants.F_OK)
    const buffer = await readFile(expectedPdfPath)
    console.log(`📄 找到PDF文件: ${expectedPdfPath} (${buffer.length} bytes)`)
    return buffer
  } catch (error) {
    console.log('预期PDF文件不存在，搜索其他PDF文件...')
  }
  
  try {
    const files = await readdir(tempDir)
    const pdfFiles = files.filter(f => f.endsWith('.pdf'))
    
    console.log(`📁 临时目录中的文件:`, files)
    console.log(`📄 找到的PDF文件:`, pdfFiles)
    
    if (pdfFiles.length > 0) {
      const pdfPath = join(tempDir, pdfFiles[0])
      const buffer = await readFile(pdfPath)
      console.log(`📄 使用PDF文件: ${pdfPath} (${buffer.length} bytes)`)
      return buffer
    }
  } catch (error) {
    console.error('搜索PDF文件时出错:', error)
  }
  
  throw new ConversionError('PDF文件生成失败：找不到输出文件')
}

/**
 * Validate request parameters
 */
function validateRequest(body: any): { isValid: boolean; error?: string } {
  const { content, storeName } = body
  
  if (!content || !storeName) {
    return { isValid: false, error: ERROR_MESSAGES.MISSING_PARAMS }
  }
  
  if (typeof content !== 'string' || typeof storeName !== 'string') {
    return { isValid: false, error: '参数类型错误：content 和 storeName 必须是字符串' }
  }
  
  if (content.trim().length === 0) {
    return { isValid: false, error: '内容不能为空' }
  }
  
  return { isValid: true }
}

/**
 * Generate filename
 */
function generateFilename(customFilename?: string): string {
  if (customFilename) return customFilename
  
  const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
  return `${PDF_CONVERSION_CONFIG.DEFAULT_FILENAME}-${currentDate}.pdf`
}

/**
 * Create PDF response
 */
function createPdfResponse(pdfBuffer: Buffer, filename: string): NextResponse {
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': pdfBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-PDF-Generator': 'LibreOffice',
    },
  })
}

/**
 * Check if error is LibreOffice related
 */
function isLibreOfficeError(error: Error): boolean {
  return PDF_CONVERSION_CONFIG.LIBREOFFICE_ERRORS.some(errorType => 
    error.message.toLowerCase().includes(errorType.toLowerCase())
  )
}

/**
 * Generate PDF from request (优化版本)
 */
async function generatePdfFromRequest(
  request: PDFGenerationRequest, 
  tempFileManager: OptimizedTempFileManager
): Promise<NextResponse> {
  const { content, storeName, bannerImage, filename, includeWatermark } = request
  
  // Check LibreOffice availability
  const libreOfficeCommand = await findLibreOfficeCommand()
  if (!libreOfficeCommand) {
    throw new LibreOfficeError('LibreOffice not available')
  }

  console.log(`📄 开始PDF转换流程（优化版本）`)

  // 使用优化的临时文件管理器生成Word文档
  console.log('📝 生成Word文档（支持缓存）...')
  const wordPath = await tempFileManager.addWordFile(content, storeName, {
    bannerImage,
    includeWatermark
  })

  // 获取临时目录
  const tempDir = tempFileManager.getTempDir()
  if (!tempDir) {
    throw new ConversionError('临时目录创建失败')
  }

  // Verify Word file was created
  await access(wordPath, constants.F_OK)
  console.log('✅ Word文档准备完成')

  // 显示缓存统计信息
  const cacheStats = tempFileManager.getCacheStats()
  console.log(`📊 缓存统计: ${cacheStats.totalFiles} 文件, ${formatBytes(cacheStats.totalSize)}, 命中率: ${cacheStats.hitRate.toFixed(1)}%`)

  // Convert to PDF
  console.log('🔄 开始PDF转换...')
  const timestamp = Date.now()
  let pdfBuffer = await convertWordToPdfWithRetry(
    libreOfficeCommand,
    wordPath,
    tempDir,
    timestamp
  )

  console.log(`✅ PDF转换成功 - 文件大小: ${pdfBuffer.length} bytes`)

  // 检查是否需要添加水印
  let finalFilename = generateFilename(filename)
  
  // 调试：打印请求中的水印配置
  console.log('🔍 检查水印配置:', JSON.stringify(request.watermarkConfig, null, 2))
  
  if (request.watermarkConfig && request.watermarkConfig.enabled) {
    console.log('🛡️ 开始添加服务端水印...')
    try {
      const watermarkedBuffer = await addServerSideWatermark(pdfBuffer, request.watermarkConfig)
      if (watermarkedBuffer) {
        pdfBuffer = watermarkedBuffer
        finalFilename = finalFilename.replace('.pdf', '_protected.pdf')
        console.log('✅ 服务端水印添加成功')
      } else {
        console.warn('⚠️ 水印处理返回null')
      }
    } catch (watermarkError) {
      console.warn('⚠️ 服务端水印添加失败，使用原始PDF:', watermarkError)
    }
  } else {
    console.log('ℹ️ 未启用水印或水印配置为空')
  }

  return createPdfResponse(pdfBuffer, finalFilename)
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 优化临时文件管理器单例模式
class TempFileManagerSingleton {
  private static instance: OptimizedTempFileManager | null = null
  
  static getInstance(): OptimizedTempFileManager {
    if (!TempFileManagerSingleton.instance) {
      TempFileManagerSingleton.instance = new OptimizedTempFileManager({
        enableCache: true,
        maxCacheSize: 200 * 1024 * 1024, // 200MB缓存
        autoCleanup: true,
        cleanupInterval: 15 * 60 * 1000 // 15分钟清理一次
      })
    }
    return TempFileManagerSingleton.instance
  }
  
  static async cleanup(): Promise<void> {
    if (TempFileManagerSingleton.instance) {
      await TempFileManagerSingleton.instance.cleanup()
      TempFileManagerSingleton.instance = null
    }
  }
}

/**
 * POST request handler - Generate PDF (优化版本)
 */
export async function POST(request: NextRequest) {
  const tempFileManager = TempFileManagerSingleton.getInstance()
  
  try {
    const body: PDFGenerationRequest = await request.json()
    
    // Validate request
    const validation = validateRequest(body)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate PDF with optimized temp file management
    return await generatePdfFromRequest(body, tempFileManager)

  } catch (error) {
    console.error('❌ PDF生成失败:', error)
    
    if (error instanceof LibreOfficeError) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
        details: error.message,
        fallback: 'word',
        installGuide: '/docs/PDF_EXPORT_SETUP.md'
      }, { status: 503 })
    }
    
    if (error instanceof ConversionError) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.CONVERSION_FAILED,
        details: error.message,
        fallback: 'word'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: ERROR_MESSAGES.SERVER_ERROR,
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
  // 注意：不再在每次请求后清理，而是依靠自动清理机制
}

/**
 * GET request handler - Health check
 */
export async function GET() {
  try {
    const libreOfficeCommand = await findLibreOfficeCommand()
    
    if (!libreOfficeCommand) {
      return NextResponse.json({ 
        status: 'error',
        message: 'PDF转换服务不可用，请安装LibreOffice',
        availableCommands: PDF_CONVERSION_CONFIG.LIBREOFFICE_COMMANDS,
        installGuide: '/docs/PDF_EXPORT_SETUP.md'
      }, { status: 503 })
    }
    
    const { stdout } = await execAsync(`${libreOfficeCommand} --version`, { timeout: 5000 })
    
    return NextResponse.json({ 
      status: 'ok',
      message: 'PDF生成服务正常',
      converter: 'LibreOffice',
      command: libreOfficeCommand,
      version: stdout.trim(),
      config: {
        timeout: PDF_CONVERSION_CONFIG.TIMEOUT_MS,
        maxRetries: PDF_CONVERSION_CONFIG.MAX_RETRIES,
        supportedFormats: PDF_CONVERSION_CONFIG.SUPPORTED_FORMATS
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'PDF转换服务检查失败',
      error: error instanceof Error ? error.message : '未知错误',
      installGuide: '/docs/PDF_EXPORT_SETUP.md'
    }, { status: 503 })
  }
}

// 优雅关闭处理
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('收到SIGTERM信号，开始清理资源...')
    await TempFileManagerSingleton.cleanup()
    process.exit(0)
  })
  
  process.on('SIGINT', async () => {
    console.log('收到SIGINT信号，开始清理资源...')
    await TempFileManagerSingleton.cleanup()
    process.exit(0)
  })
}