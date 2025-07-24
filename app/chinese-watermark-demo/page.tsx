"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChineseWatermarkDemo() {
  const [watermarkText, setWatermarkText] = useState('星光传媒')
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string>('')

  const commonWatermarks = [
    '星光传媒',
    '机密文档', 
    '内部资料',
    '版权所有',
    '禁止复制',
    '草稿',
    '样本',
    '测试水印'
  ]

  const testChineseWatermark = async () => {
    setIsLoading(true)
    setTestResult('开始测试中文水印...\n')
    setPdfUrl('')
    
    try {
      // 导入PDF创建工具
      const { PDFDocument } = await import('pdf-lib')
      
      // 创建测试PDF
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400])
      
      // 添加一些中文内容到PDF
      page.drawText('中文PDF水印测试文档', {
        x: 50,
        y: 350,
        size: 20,
      })
      
      page.drawText('这是一个用于测试中文水印功能的PDF文档。', {
        x: 50,
        y: 320,
        size: 14,
      })
      
      page.drawText('Chinese Watermark Test Document', {
        x: 50,
        y: 280,
        size: 16,
      })
      
      const testPdfBuffer = await pdfDoc.save()
      console.log('✅ 创建测试PDF成功，大小:', testPdfBuffer.length, 'bytes')
      setTestResult(prev => prev + '✅ 创建测试PDF成功\n')
      
      // 导入水印工具
      const { addSimpleWatermark } = await import('../../lib/utils/pdf-watermark')
      
      // 测试中文水印
      console.log('🛡️ 开始添加中文水印:', watermarkText)
      setTestResult(prev => prev + `🛡️ 开始添加中文水印: "${watermarkText}"\n`)
      
      const result = await addSimpleWatermark(testPdfBuffer, watermarkText, {
        opacity: 0.3,
        fontSize: 48,
        rotation: 45,
        position: { x: 'center', y: 'center' },
        repeat: 'diagonal',
        color: { r: 0.5, g: 0.5, b: 0.5 }
      })
      
      if (result.success && result.pdfBytes) {
        console.log('✅ 中文水印添加成功')
        setTestResult(prev => prev + '✅ 中文水印添加成功\n')
        setTestResult(prev => prev + `📊 处理统计: ${result.stats?.totalPages} 页, 耗时 ${result.stats?.processingTime}ms\n`)
        
        // 创建下载链接
        const blob = new Blob([result.pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        
        setTestResult(prev => prev + '🎉 PDF生成完成，可以下载查看效果！')
      } else {
        console.log('❌ 中文水印添加失败:', result.error)
        setTestResult(prev => prev + '❌ 中文水印添加失败: ' + result.error)
      }
      
    } catch (error) {
      console.error('❌ 测试失败:', error)
      setTestResult(prev => prev + '❌ 测试失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = () => {
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `中文水印测试-${watermarkText}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">🛡️ 中文水印功能演示</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle>🎛️ 水印设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="watermark-text">水印文本</Label>
              <Input
                id="watermark-text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="输入中文水印文本"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm text-gray-600">常用水印模板</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {commonWatermarks.map((text) => (
                  <Button
                    key={text}
                    variant="outline"
                    size="sm"
                    onClick={() => setWatermarkText(text)}
                    className="text-xs"
                  >
                    {text}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={testChineseWatermark}
              disabled={isLoading || !watermarkText.trim()}
              className="w-full"
            >
              {isLoading ? '生成中...' : '🚀 生成带水印PDF'}
            </Button>
            
            {pdfUrl && (
              <Button 
                onClick={downloadPDF}
                variant="outline"
                className="w-full"
              >
                📥 下载PDF文件
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 右侧：结果显示 */}
        <Card>
          <CardHeader>
            <CardTitle>📊 测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">{testResult}</pre>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                点击"生成带水印PDF"开始测试
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 底部：说明信息 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>💡 使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">🎯 功能特点</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 支持完整中文字符显示</li>
                <li>• 多层级字体加载策略</li>
                <li>• 自动字体回退机制</li>
                <li>• 实时预览和下载</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🔧 技术实现</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• 本地字体文件优先</li>
                <li>• CDN在线字体备用</li>
                <li>• 系统字体最终回退</li>
                <li>• pdf-lib核心引擎</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 提示：</strong> 
              如果中文字符显示异常，请确保已下载中文字体文件到 <code>public/fonts/</code> 目录。
              可以运行 <code>node scripts/download-chinese-fonts.js</code> 自动下载。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}