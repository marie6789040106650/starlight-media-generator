/**
 * 分页模式导出组件
 * PDF导出: 基于分页（保持视觉效果）
 * Word导出: 基于文本内容（保持可编辑性）
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, File } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { exportToPDF, checkExportSupport } from "@/lib/export-utils"
import { FormData } from "@/lib/types"

interface PageExportActionsProps {
  storeName: string
  content: string // 添加content用于可编辑的Word导出
  bannerImage?: string | null
  disabled?: boolean
  className?: string
}

export function PageExportActions({ 
  storeName, 
  content,
  bannerImage, 
  disabled = false, 
  className 
}: PageExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | null>(null)

  // 检查是否在分页模式
  const checkPageMode = () => {
    const pages = document.querySelectorAll('.page')
    if (pages.length === 0) {
      alert('未找到分页内容，请先切换到分页模式')
      return false
    }
    return true
  }

  // PDF导出 - 基于分页（保持视觉效果）
  const handlePDFExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用')
      return
    }

    if (!storeName) return

    if (!checkPageMode()) return

    // 检查导出支持
    const support = checkExportSupport()
    if (!support.pdf) {
      alert('当前浏览器不支持PDF导出功能')
      return
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

      // 使用前端导出工具 - 会自动检测分页元素
      await exportToPDF({
        content: '', // PDF导出不依赖content，而是基于.page元素
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

  // Word导出 - 基于文本内容（保持可编辑性）
  const handleEditableWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用')
      return
    }

    if (!storeName || !content) return

    // 检查导出支持
    const support = checkExportSupport()
    if (!support.word) {
      alert('当前浏览器不支持Word导出功能')
      return
    }

    setIsExporting(true)
    setExportType('word')

    try {
      // 导入原有的Word导出功能
      const { exportToWord } = await import('@/lib/export-utils')
      
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

      // 使用基于文本的Word导出（可编辑）
      await exportToWord({
        content,
        formData,
        bannerImage,
        includeWatermark: true,
        format: 'word'
      })

      console.log('可编辑Word文档导出成功')
    } catch (error) {
      console.error('Word导出失败:', error)
      alert(`导出Word文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }



  // 检查是否允许显示导出功能
  if (!isExportAllowed()) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 导出PDF按钮 - 基于分页视觉效果 */}
      <Button
        onClick={handlePDFExport}
        disabled={disabled || isExporting}
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

      {/* 导出Word按钮 - 基于文本内容（可编辑） */}
      <Button
        onClick={handleEditableWordExport}
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

