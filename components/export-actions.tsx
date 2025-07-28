"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, File } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { exportToPDF, exportToWord, checkExportSupport } from "@/lib/export-utils"
import { FormData } from "@/lib/types"

interface ExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null
  disabled?: boolean
  className?: string
}

export function ExportActions({ content, storeName, bannerImage, disabled = false, className }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | null>(null)

  const handleWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!content || !storeName) return

    // 检查导出支持
    const support = checkExportSupport()
    if (!support.word) {
      alert('当前浏览器不支持Word导出功能');
      return;
    }

    setIsExporting(true)
    setExportType('word')

    try {
      // 构建FormData对象
      const formData: FormData = {
        storeName: storeName,
        storeCategory: '',
        targetAudience: '',
        businessGoals: '',
        contentStyle: '',
        keywords: '',
        additionalRequirements: ''
      }

      // 使用统一的客户端Word导出工具
      const { exportWordDocument } = await import('@/lib/client-word-export')
      
      await exportWordDocument({
        content,
        storeName,
      })
      
      console.log('Word文档导出成功')
    } catch (error) {
      console.error('Word导出失败:', error)
      alert(`导出Word文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handlePDFExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!content || !storeName) return

    // 检查导出支持
    const support = checkExportSupport()
    if (!support.pdf) {
      alert('当前浏览器不支持PDF导出功能');
      return;
    }

    setIsExporting(true)
    setExportType('pdf')

    try {
      // 构建FormData对象
      const formData: FormData = {
        storeName: storeName,
        storeCategory: '',
        targetAudience: '',
        businessGoals: '',
        contentStyle: '',
        keywords: '',
        additionalRequirements: ''
      }

      // 使用智能PDF导出（自动处理分页模式切换）
      await exportToPDF({
        content,
        formData,
        bannerImage,
        includeWatermark: true,
        format: 'pdf'
      })

      console.log('PDF文档导出成功')
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert(`导出PDF文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }



  // 检查是否允许显示导出功能
  if (!isExportAllowed()) {
    return null; // 如果不允许导出，则不显示组件
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 导出PDF按钮 */}
      <Button
        onClick={handlePDFExport}
        disabled={disabled || isExporting || !content}
        className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 ${className}`}
      >
        {isExporting && exportType === 'pdf' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <File className="h-4 w-4" />
        )}
        <span className="ml-2">
          {isExporting && exportType === 'pdf' ? '导出PDF中...' : '导出PDF'}
        </span>
      </Button>

      {/* 导出Word按钮 */}
      <Button
        onClick={handleWordExport}
        disabled={disabled || isExporting || !content}
        className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ${className}`}
      >
        {isExporting && exportType === 'word' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="ml-2">
          {isExporting && exportType === 'word' ? '导出Word中...' : '导出Word'}
        </span>
      </Button>
    </div>
  )
}