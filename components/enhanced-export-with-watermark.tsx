/**
 * 增强的导出操作组件 - 包含水印设置功能
 * 在原有导出功能基础上添加水印配置
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, File, ChevronDown, Shield, Layout } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { WatermarkSettingsButton } from "./watermark-settings-button"
import { exportToPDF, checkExportSupport } from "@/lib/export-utils"
import { FormData } from "@/lib/types"

interface EnhancedExportWithWatermarkProps {
  content: string
  storeName: string
  bannerImage?: string | null
  disabled?: boolean
  className?: string
}

export function EnhancedExportWithWatermark({ 
  content, 
  storeName, 
  bannerImage, 
  disabled = false, 
  className 
}: EnhancedExportWithWatermarkProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | 'page-pdf' | 'page-word' | null>(null)

  // 检查是否在分页模式
  const isInPageMode = typeof document !== 'undefined' && document.querySelectorAll('.page').length > 0

  // 获取水印配置
  const getWatermarkConfig = () => {
    try {
      const saved = localStorage.getItem('watermarkConfig')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('获取水印配置失败:', error)
      return null
    }
  }

  // 获取颜色RGB值
  const getColorRGB = (color: string) => {
    const colorMap = {
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      red: { r: 1, g: 0, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      black: { r: 0, g: 0, b: 0 }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  }


  const handleWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!content || !storeName) {
      console.warn('缺少必要的导出参数:', { content: !!content, storeName });
      return;
    }

    setIsExporting(true)
    setExportType('word')

    try {
      // 使用统一的客户端Word导出工具
      const { exportWordDocument } = await import('@/lib/client-word-export')
      
      await exportWordDocument({
        content,
        storeName,
      })
      
      console.log('✅ 客户端Word导出成功')
    } catch (error) {
      console.error('前端Word导出失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导出失败，请重试';
      alert(`Word导出失败: ${errorMessage}`);
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handlePdfExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!content || !storeName) {
      console.warn('缺少必要的导出参数:', { content: !!content, storeName });
      return;
    }

    setIsExporting(true)
    setExportType('pdf')

    try {
      let filename = undefined;
      const firstLine = content.split('\n')[0];
      if (firstLine && firstLine.startsWith('#')) {
        const title = firstLine.replace(/^#+\s*/, '').trim();
        if (title) {
          const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
          filename = `${title}-${currentDate}.pdf`;
        }
      }

      // 第一步：按原逻辑导出PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          storeName,
          bannerImage,
          filename
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '未知错误');
        console.error('PDF导出API错误:', response.status, errorText);
        throw new Error(`导出失败: ${response.status} ${errorText}`);
      }

      let finalBlob = await response.blob()
      if (finalBlob.size === 0) {
        throw new Error('导出的PDF文件为空');
      }

      // 第二步：如果启用水印，则在PDF上添加水印层
      const watermarkConfig = getWatermarkConfig()
      if (watermarkConfig && watermarkConfig.enabled) {
        try {
          // 将blob转换为ArrayBuffer
          const pdfBuffer = await finalBlob.arrayBuffer()
          
          // 动态导入水印工具
          const { addSimpleWatermark } = await import('../lib/watermark-toolkit')
          
          // 准备水印选项
          const watermarkOptions = {
            opacity: watermarkConfig.opacity / 100,
            fontSize: watermarkConfig.fontSize,
            rotation: watermarkConfig.rotation,
            position: {
              x: watermarkConfig.position.includes('left') ? 'left' : 
                 watermarkConfig.position.includes('right') ? 'right' : 'center',
              y: watermarkConfig.position.includes('top') ? 'top' : 
                 watermarkConfig.position.includes('bottom') ? 'bottom' : 'center'
            },
            repeat: watermarkConfig.repeat,
            color: getColorRGB(watermarkConfig.color)
          }

          // 添加水印
          const watermarkResult = await addSimpleWatermark(pdfBuffer, watermarkConfig.text, watermarkOptions)

          if (watermarkResult.success && watermarkResult.pdfBytes) {
            finalBlob = new Blob([watermarkResult.pdfBytes], { type: 'application/pdf' })
            filename = filename?.replace('.pdf', '_protected.pdf') || `${storeName}-方案_protected.pdf`
            console.log('水印添加成功');
          } else {
            console.warn('水印添加失败:', watermarkResult.error);
          }
        } catch (watermarkError) {
          console.warn('水印添加失败，使用原始PDF:', watermarkError)
          // 如果水印添加失败，继续使用原始PDF
        }
      }

      // 下载最终的PDF文件
      const url = window.URL.createObjectURL(finalBlob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename || `${storeName}-方案.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF导出失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导出失败，请重试';
      alert(errorMessage);
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  // 分页模式PDF导出
  const handlePagePDFExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!storeName) return;

    // 检查分页模式
    if (!isInPageMode) {
      alert('请先切换到分页模式');
      return;
    }

    const support = checkExportSupport()
    if (!support.pdf) {
      alert('当前浏览器不支持PDF导出功能');
      return;
    }

    setIsExporting(true)
    setExportType('page-pdf')

    try {
      const formData: FormData = {
        storeName: storeName,
        storeCategory: '',
        targetAudience: '',
        businessGoals: '',
        contentStyle: '',
        keywords: '',
        additionalRequirements: ''
      }

      await exportToPDF({
        content: '', // PDF导出基于.page元素，不依赖content
        formData,
        bannerImage,
        includeWatermark: true,
        format: 'pdf'
      })

      console.log('分页PDF导出成功')
    } catch (error) {
      console.error('分页PDF导出失败:', error)
      alert(`导出PDF失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  // 分页模式Word导出
  const handlePageWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!storeName || !content) return;

    const support = checkExportSupport()
    if (!support.word) {
      alert('当前浏览器不支持Word导出功能');
      return;
    }

    setIsExporting(true)
    setExportType('page-word')

    try {
      const formData: FormData = {
        storeName: storeName,
        storeCategory: '',
        targetAudience: '',
        businessGoals: '',
        contentStyle: '',
        keywords: '',
        additionalRequirements: ''
      }

      await exportToWord({
        content,
        formData,
        bannerImage,
        includeWatermark: true,
        format: 'word'
      })

      console.log('分页Word导出成功')
    } catch (error) {
      console.error('分页Word导出失败:', error)
      alert(`导出Word失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  // 检查水印状态
  const watermarkConfig = getWatermarkConfig()
  const isWatermarkEnabled = watermarkConfig?.enabled || false

  return (
    <div className="flex items-center space-x-2">
      {/* 水印设置按钮 */}
      <WatermarkSettingsButton
        storeName={storeName}
        disabled={disabled}
      />

      {/* 水印状态指示 */}
      {isWatermarkEnabled && (
        <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
          <Shield className="h-3 w-3 mr-1" />
          <span className="hidden sm:inline">已启用水印</span>
        </div>
      )}

      {/* 原有的导出按钮 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            disabled={disabled || isExporting}
            className={`bg-purple-600 hover:bg-purple-700 text-white ${className}`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                {exportType === 'word' ? '导出Word中...' : 
                 exportType === 'pdf' ? '导出PDF中...' :
                 exportType === 'page-word' ? '导出Word中...' :
                 exportType === 'page-pdf' ? '导出PDF中...' : '导出中...'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">导出文档</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* 分页模式导出选项 */}
          {isInPageMode && (
            <>
              <DropdownMenuItem onClick={handlePagePDFExport} disabled={isExporting}>
                <File className="h-4 w-4 mr-2 text-red-600" />
                <div className="flex flex-col">
                  <span>导出PDF (分页模式)</span>
                  <span className="text-xs text-gray-500">基于分页视觉效果</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePageWordExport} disabled={isExporting || !content}>
                <FileText className="h-4 w-4 mr-2 text-blue-600" />
                <div className="flex flex-col">
                  <span>导出Word (可编辑)</span>
                  <span className="text-xs text-gray-500">基于文本内容</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* 原有的导出选项 */}
          <DropdownMenuItem onClick={handleWordExport} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>导出为 Word</span>
              <span className="text-xs text-gray-500">原始格式导出</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePdfExport} disabled={isExporting}>
            <File className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>导出为 PDF</span>
              <span className="text-xs text-gray-500">
                {isWatermarkEnabled ? '包含水印保护' : '原始格式导出'}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}