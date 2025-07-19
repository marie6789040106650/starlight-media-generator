import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

// Configuration constants
const CONVERSION_CONFIG = {
  TIMEOUT_MS: 30000,
  SUPPORTED_EXTENSIONS: ['.docx'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// Error messages
const ERROR_MESSAGES = {
  NO_FILE: '没有上传文件',
  UNSUPPORTED_FORMAT: '只支持.docx文件',
  FILE_TOO_LARGE: '文件大小超过限制（最大10MB）',
  CONVERSION_FAILED: '文档转换失败，请确保系统已安装LibreOffice',
  SERVER_ERROR: '服务器内部错误',
} as const

// Helper functions for better separation of concerns
async function validateFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  if (!file) {
    return { isValid: false, error: ERROR_MESSAGES.NO_FILE }
  }

  if (!CONVERSION_CONFIG.SUPPORTED_EXTENSIONS.some(ext => file.name.endsWith(ext))) {
    return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_FORMAT }
  }

  if (file.size > CONVERSION_CONFIG.MAX_FILE_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }

  return { isValid: true }
}

async function createTempPaths(): Promise<{ inputPath: string; outputPath: string }> {
  const tempDir = tmpdir()
  const timestamp = Date.now()
  return {
    inputPath: join(tempDir, `input-${timestamp}.docx`),
    outputPath: join(tempDir, `output-${timestamp}.pdf`)
  }
}

async function cleanupTempFiles(inputPath: string, outputPath: string): Promise<void> {
  await Promise.all([
    unlink(inputPath).catch(() => {}),
    unlink(outputPath).catch(() => {})
  ])
}

async function convertWordToPdf(inputPath: string, outputPath: string): Promise<void> {
  const tempDir = tmpdir()
  const command = `libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${inputPath}"`
  
  try {
    await execAsync(command, { timeout: CONVERSION_CONFIG.TIMEOUT_MS })
  } catch (error) {
    throw new Error(`LibreOffice conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function createPdfResponse(pdfBuffer: Buffer, originalFilename: string): NextResponse {
  const pdfFilename = originalFilename.replace(/\.docx$/i, '.pdf')
  
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let inputPath = ''
  let outputPath = ''

  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Validate file
    const validation = await validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Create temporary file paths
    const tempPaths = await createTempPaths()
    inputPath = tempPaths.inputPath
    outputPath = tempPaths.outputPath

    // Save uploaded file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(inputPath, buffer)

    // Convert Word to PDF
    await convertWordToPdf(inputPath, outputPath)

    // Read generated PDF
    const pdfBuffer = await readFile(outputPath)
    
    // Clean up temporary files
    await cleanupTempFiles(inputPath, outputPath)

    // Return PDF response
    return createPdfResponse(pdfBuffer, file.name)

  } catch (error) {
    // Ensure cleanup on any error
    if (inputPath || outputPath) {
      await cleanupTempFiles(inputPath, outputPath)
    }
    
    console.error('PDF conversion API error:', error)
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error && error.message.includes('LibreOffice') 
      ? ERROR_MESSAGES.CONVERSION_FAILED 
      : ERROR_MESSAGES.SERVER_ERROR
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}