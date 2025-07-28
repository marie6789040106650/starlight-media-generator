/**
 * 增强的导出操作组件
 * 集成新的 Markdown 渲染器与现有的 Word/PDF 导出功能
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, File, Eye } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { EnhancedMarkdownRenderer } from "./enhanced-markdown-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { exportToPDF, exportToWord, checkExportSupport } from "@/lib/export-utils"
import { FormData } from "@/lib/types"

interface EnhancedExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null
  disabled?: boolean
  className?: string
  showPreview?: boolean // 是否显示预览功能
}

export function EnhancedExportActions({
  content,
  storeName,
  bannerImage,
  disabled = false,
  className,
  showPreview = true
}: EnhancedExportActionsProps) {
  // 检测是否在分页模式下
  const isInPageMode = typeof document !== 'undefined' && document.querySelectorAll('.page').length > 0
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

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

      // 使用前端导出工具
      await exportToWord({
        content,
        formData,
        bannerImage,
        includeWatermark: true,
        format: 'word'
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

      // 使用前端导出工具
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
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 预览按钮 - 分页模式下隐藏 */}
      {showPreview && !isInPageMode && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled || !content}
              className={className}
            >
              <Eye className="h-4 w-4 mr-2" />
              预览
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>文档预览</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <EnhancedMarkdownRenderer
                content={content}
                preset="full"
                enableSyntaxHighlight={true}
                enableMath={true}
                showLineNumbers={false}
                className="border rounded-lg p-4"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

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