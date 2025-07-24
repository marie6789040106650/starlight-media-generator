"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function WatermarkTestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testWatermarkImport = async () => {
    setIsLoading(true)
    setTestResult('测试中...')
    
    try {
      // 测试水印工具库导入
      console.log('🔍 测试水印工具库导入...')
      
      // 方法1：测试从watermark-toolkit导入
      try {
        const toolkit = await import('../../lib/watermark-toolkit')
        console.log('✅ watermark-toolkit 导入成功:', Object.keys(toolkit))
        setTestResult(prev => prev + '\n✅ watermark-toolkit 导入成功')
      } catch (error) {
        console.error('❌ watermark-toolkit 导入失败:', error)
        setTestResult(prev => prev + '\n❌ watermark-toolkit 导入失败: ' + (error as Error).message)
      }

      // 方法2：测试从utils/pdf-watermark导入
      try {
        const utils = await import('../../lib/utils/pdf-watermark')
        console.log('✅ utils/pdf-watermark 导入成功:', Object.keys(utils))
        setTestResult(prev => prev + '\n✅ utils/pdf-watermark 导入成功')
        
        // 测试addSimpleWatermark函数
        if (utils.addSimpleWatermark) {
          console.log('✅ addSimpleWatermark 函数可用')
          setTestResult(prev => prev + '\n✅ addSimpleWatermark 函数可用')
        } else {
          console.warn('⚠️ addSimpleWatermark 函数不可用')
          setTestResult(prev => prev + '\n⚠️ addSimpleWatermark 函数不可用')
        }
      } catch (error) {
        console.error('❌ utils/pdf-watermark 导入失败:', error)
        setTestResult(prev => prev + '\n❌ utils/pdf-watermark 导入失败: ' + (error as Error).message)
      }

      // 测试水印配置
      try {
        const config = localStorage.getItem('watermarkConfig')
        if (config) {
          const parsed = JSON.parse(config)
          console.log('✅ 水印配置读取成功:', parsed)
          setTestResult(prev => prev + '\n✅ 水印配置读取成功')
        } else {
          console.log('ℹ️ 未找到水印配置')
          setTestResult(prev => prev + '\nℹ️ 未找到水印配置')
        }
      } catch (error) {
        console.error('❌ 水印配置读取失败:', error)
        setTestResult(prev => prev + '\n❌ 水印配置读取失败')
      }

    } catch (error) {
      console.error('❌ 测试失败:', error)
      setTestResult(prev => prev + '\n❌ 测试失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const testWatermarkFunction = async () => {
    setIsLoading(true)
    setTestResult('测试水印功能...')
    
    try {
      // 导入PDF创建工具
      const { PDFDocument } = await import('pdf-lib')
      
      // 创建一个真正的PDF文档用于测试
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([600, 400])
      page.drawText('This is a test PDF document', {
        x: 50,
        y: 350,
        size: 20,
      })
      
      // 将PDF转换为buffer
      const testPdfBuffer = await pdfDoc.save()
      console.log('✅ 创建测试PDF成功，大小:', testPdfBuffer.length, 'bytes')
      setTestResult('✅ 创建测试PDF成功\n')
      
      // 导入水印工具
      const { addSimpleWatermark } = await import('../../lib/utils/pdf-watermark')
      
      // 测试水印添加 - 使用中文水印
      console.log('🛡️ 开始测试中文水印功能...')
      setTestResult(prev => prev + '🛡️ 开始测试中文水印: "星光传媒"\n')
      
      const result = await addSimpleWatermark(testPdfBuffer, '星光传媒', {
        opacity: 0.3,
        fontSize: 48,
        rotation: 45,
        position: { x: 'center', y: 'center' },
        repeat: 'diagonal',
        color: { r: 0.5, g: 0.5, b: 0.5 }
      })
      
      if (result.success) {
        console.log('✅ 水印功能测试成功')
        setTestResult(prev => prev + '✅ 水印功能测试成功\n')
        setTestResult(prev => prev + `✅ 处理统计: ${result.stats?.totalPages} 页, 耗时 ${result.stats?.processingTime}ms`)
      } else {
        console.log('❌ 水印功能测试失败:', result.error)
        setTestResult(prev => prev + '❌ 水印功能测试失败: ' + result.error)
      }
      
    } catch (error) {
      console.error('❌ 水印功能测试异常:', error)
      setTestResult(prev => prev + '❌ 水印功能测试异常: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🛡️ 水印功能测试</h1>
      
      <div className="space-y-4">
        <Button 
          onClick={testWatermarkImport}
          disabled={isLoading}
          className="mr-4"
        >
          {isLoading ? '测试中...' : '测试模块导入'}
        </Button>
        
        <Button 
          onClick={testWatermarkFunction}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? '测试中...' : '测试水印功能'}
        </Button>
      </div>

      {testResult && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">测试结果：</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔍 问题诊断指南：</h3>
        <ul className="text-sm space-y-1">
          <li>• 如果看到"导入失败"，说明模块路径有问题</li>
          <li>• 如果看到"函数不可用"，说明导出有问题</li>
          <li>• 如果看到"水印功能测试失败"，说明pdf-lib依赖有问题</li>
          <li>• 正常情况下应该看到所有"✅"标记</li>
        </ul>
      </div>
    </div>
  )
}