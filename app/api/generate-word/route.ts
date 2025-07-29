import { NextRequest, NextResponse } from 'next/server'
import { WordGenerator } from '@/lib/export/word-generator'

// 错误消息
const ERROR_MESSAGES = {
  MISSING_PARAMS: '缺少必要参数：content 和 storeName',
  SERVER_ERROR: '服务器内部错误',
  GENERATION_FAILED: 'Word文档生成失败',
} as const

interface WordGenerationRequest {
  content: string
  storeName: string
  bannerImage?: string | null
  filename?: string
  includeWatermark?: boolean
}

/**
 * 验证请求参数
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
 * 生成文件名
 */
function generateFilename(customFilename?: string): string {
  if (customFilename && customFilename.endsWith('.docx')) {
    return customFilename
  }
  
  const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
  const baseName = customFilename || '企业方案'
  return `${baseName}-${currentDate}.docx`
}

/**
 * 创建Word响应
 */
function createWordResponse(wordBuffer: Buffer, filename: string): NextResponse {
  return new NextResponse(wordBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': wordBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Word-Generator': 'docx',
    },
  })
}

/**
 * POST request handler - Generate Word document
 */
export async function POST(request: NextRequest) {
  try {
    const body: WordGenerationRequest = await request.json()
    
    // 验证请求参数
    const validation = validateRequest(body)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { content, storeName, bannerImage, filename, includeWatermark } = body

    console.log('📝 开始生成Word文档...')
    console.log(`内容长度: ${content.length} 字符`)
    console.log(`店铺名称: ${storeName}`)

    // 生成Word文档
    const wordGenerator = new WordGenerator()
    
    // 使用内存生成方式
    const wordBuffer = await new Promise<Buffer>((resolve, reject) => {
      // 创建临时文件路径
      const tempFilename = `/tmp/word-${Date.now()}.docx`
      
      wordGenerator.generateWordDocumentToFile({
        content,
        storeName,
        bannerImage,
        filename: tempFilename,
        includeWatermark
      }).then((buffer) => {
        resolve(buffer)
      }).catch((error) => {
        console.error('Word生成失败:', error)
        reject(error)
      })
    })

    // 生成最终文件名
    const finalFilename = generateFilename(filename)
    console.log(`✅ Word文档生成成功 - 文件大小: ${wordBuffer.length} bytes`)

    return createWordResponse(wordBuffer, finalFilename)

  } catch (error) {
    console.error('❌ Word生成失败:', error)
    
    return NextResponse.json({ 
      error: ERROR_MESSAGES.SERVER_ERROR,
      details: error instanceof Error ? error.message : '未知错误',
      fallback: 'pdf'
    }, { status: 500 })
  }
}

/**
 * GET request handler - Health check
 */
export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'ok',
      message: 'Word生成服务正常',
      generator: 'docx',
      features: [
        'Markdown解析',
        'Logo支持',
        '中文字体',
        '企业模板',
        '水印功能'
      ]
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      message: 'Word生成服务检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 503 })
  }
}