"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Copy, RefreshCw, Shield } from "lucide-react"
import Link from 'next/link'
import { getCopySettings, shouldShowCopyUI } from "@/config/copy-settings"

function ResultPageContent() {
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // 获取当前复制设置状态
  const [copySettings, setCopySettings] = useState(getCopySettings())

  useEffect(() => {
    // 监听复制设置变化
    const interval = setInterval(() => {
      setCopySettings(getCopySettings())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // 从URL参数获取表单数据和配置
    const formDataStr = searchParams?.get('formData')
    const prompt = searchParams?.get('prompt')
    const modelId = searchParams?.get('modelId')

    if (formDataStr && prompt) {
      // 先尝试流式生成，如果失败则回退到非流式
      startStreamGeneration(prompt, JSON.parse(decodeURIComponent(formDataStr)), modelId)
    } else {
      setError('缺少必要的生成参数')
    }

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [searchParams])

  const startStreamGeneration = async (prompt: string, formData: any, modelId: string | null) => {
    setIsGenerating(true)
    setError('')
    setContent('')
    setIsComplete(false)

    // 创建新的AbortController
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          formData,
          modelId,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        // 如果流式生成失败，尝试非流式生成
        console.warn('流式生成失败，尝试非流式生成')
        return await startNonStreamGeneration(prompt, formData, modelId)
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        // 如果不是流式响应，尝试作为JSON处理
        const data = await response.json()
        if (data.content) {
          setContent(data.content)
          setIsComplete(true)
          setIsGenerating(false)
          return
        } else {
          throw new Error('响应格式错误')
        }
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('无法获取响应流')
      }

      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          setIsComplete(true)
          setIsGenerating(false)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim()
            
            if (dataStr === '[DONE]') {
              setIsComplete(true)
              setIsGenerating(false)
              return
            }

            if (dataStr) {
              try {
                const data = JSON.parse(dataStr)
                if (data.error) {
                  throw new Error(data.error)
                }
                if (data.content) {
                  setContent(prev => prev + data.content)
                }
              } catch (parseError) {
                console.warn('解析流数据失败:', parseError, 'Data:', dataStr)
              }
            }
          }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('生成已取消')
        return
      }
      
      console.error('流式生成失败:', error)
      // 尝试非流式生成作为备用方案
      console.log('尝试非流式生成作为备用方案')
      return await startNonStreamGeneration(prompt, formData, modelId)
    }
  }

  const startNonStreamGeneration = async (prompt: string, formData: any, modelId: string | null) => {
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          formData,
          modelId,
          stream: false
        }),
        signal: abortControllerRef.current?.signal
      })

      if (!response.ok) {
        let errorMessage = '生成失败'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (data.content) {
        setContent(data.content)
        setIsComplete(true)
        setIsGenerating(false)
      } else {
        throw new Error('API返回的内容为空')
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('生成已取消')
        return
      }
      
      console.error('非流式生成也失败:', error)
      setError(error.message || '生成失败，请重试')
      setIsGenerating(false)
    }
  }

  const handleCopyContent = async () => {
    if (!content) return
    
    try {
      await navigator.clipboard.writeText(content)
      alert('✅ 内容已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动选择内容复制')
    }
  }

  const handleRetry = () => {
    const formDataStr = searchParams?.get('formData')
    const prompt = searchParams?.get('prompt')
    const modelId = searchParams?.get('modelId')

    if (formDataStr && prompt) {
      startStreamGeneration(prompt, JSON.parse(decodeURIComponent(formDataStr)), modelId)
    }
  }

  const handleExportPDF = async () => {
    if (!content) return

    try {
      // 动态导入jsPDF
      const { default: jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF()
      
      // 设置中文字体支持
      pdf.setFont('helvetica')
      pdf.setFontSize(12)
      
      // 简单的文本换行处理
      const lines = content.split('\n')
      let yPosition = 20
      const lineHeight = 7
      const pageHeight = pdf.internal.pageSize.height - 20
      
      lines.forEach(line => {
        if (yPosition > pageHeight) {
          pdf.addPage()
          yPosition = 20
        }
        
        // 处理长行文本
        const maxWidth = 180
        const words = line.split('')
        let currentLine = ''
        
        for (const char of words) {
          const testLine = currentLine + char
          const textWidth = pdf.getTextWidth(testLine)
          
          if (textWidth > maxWidth && currentLine) {
            pdf.text(currentLine, 10, yPosition)
            yPosition += lineHeight
            currentLine = char
            
            if (yPosition > pageHeight) {
              pdf.addPage()
              yPosition = 20
            }
          } else {
            currentLine = testLine
          }
        }
        
        if (currentLine) {
          pdf.text(currentLine, 10, yPosition)
          yPosition += lineHeight
        }
      })
      
      // 下载PDF
      const fileName = `IP打造方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('导出PDF失败:', error)
      alert('导出PDF失败，请稍后重试')
    }
  }

  // 渲染Markdown内容
  const renderContent = (text: string) => {
    return text
      .replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes, title) => {
        const level = hashes.length
        return `<h${level} class="text-${level === 1 ? '2xl' : level === 2 ? 'xl' : 'lg'} font-bold mt-6 mb-3 text-gray-900">${title}</h${level}>`
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\n/g, '<br>')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">生成失败</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          <div className="flex gap-2">
            {isComplete && shouldShowCopyUI() && (
              <>
                <Button onClick={handleCopyContent} variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  复制内容
                </Button>
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  导出PDF
                </Button>
              </>
            )}
            {isComplete && !shouldShowCopyUI() && (
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出PDF
              </Button>
            )}
            {!isGenerating && content && (
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新生成
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              老板IP打造方案
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  正在生成中...
                </div>
              )}
              {isComplete && (
                <span className="text-sm text-green-600">✅ 生成完成</span>
              )}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>
                {isGenerating ? '方案正在实时生成，请耐心等待...' : '专业定制的抖音IP打造方案'}
              </span>
              
              {/* 复制保护状态指示器 */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                copySettings.allowCopy 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {copySettings.allowCopy ? (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>可复制</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-3 w-3" />
                    <span>复制保护</span>
                  </>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {content ? (
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderContent(content) }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-pulse flex space-x-1">
                        <div className="rounded-full bg-blue-400 h-2 w-2 animate-bounce"></div>
                        <div className="rounded-full bg-blue-400 h-2 w-2 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="rounded-full bg-blue-400 h-2 w-2 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <p>正在为您量身定制专业方案...</p>
                    </div>
                  ) : (
                    '等待生成内容...'
                  )}
                </div>
              )}
              
              {/* 实时显示光标效果 */}
              {isGenerating && content && (
                <span className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1"></span>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ResultPageContent />
    </Suspense>
  )
}