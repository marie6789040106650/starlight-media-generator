/**
 * 增强的导出操作组件
 * 集成新的 Markdown 渲染器与现有的 Word/PDF 导出功能
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, File, ChevronDown, Eye } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { EnhancedMarkdownRenderer } from "./enhanced-markdown-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  const handleWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用');
      return;
    }

    if (!content || !storeName) return

    setIsExporting(true)
    setExportType('word')

    try {
      // 从内容中提取标题作为文件名
      let filename = undefined;
      const firstLine = content.split('\n')[0];
      if (firstLine && firstLine.startsWith('#')) {
        const title = firstLine.replace(/^#+\s*/, '').trim();
        if (title) {
          const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
          filename = `${title}-${currentDate}.docx`;
        }
      }
      
      // 通过API调用生成Word文档
      const response = await fetch('/api/generate-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          storeName,
          bannerImage,
          filename,
          includeWatermark: true
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Word生成失败: ${errorData.error || '服务器错误'}`)
      }

      // 下载生成的Word文件
      const blob = await response.blob()
      const finalFilename = filename || `${storeName}-方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = finalFilename
      document.body.appendChild(a)
      a.click()
      
      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      console.log('Word文档导出成功')
    } catch (error) {
      console.error('Word导出失败:', error)
      alert('导出Word文档失败，请稍后重试')
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

    setIsExporting(true)
    setExportType('pdf')

    try {
      // 从内容中提取标题作为文件名
      let filename = undefined;
      const firstLine = content.split('\n')[0];
      if (firstLine && firstLine.startsWith('#')) {
        const title = firstLine.replace(/^#+\s*/, '').trim();
        if (title) {
          const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '');
          filename = `${title}-${currentDate}.pdf`;
        }
      }
      
      // 通过API调用生成PDF文档
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          storeName,
          bannerImage,
          filename,
          includeWatermark: true,
          watermarkType: 'company',
          watermarkText: `© ${storeName}`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`PDF生成失败: ${errorData.error || '服务器错误'}`)
      }

      // 下载生成的PDF文件
      const blob = await response.blob()
      const finalFilename = filename || `${storeName}-方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = finalFilename
      document.body.appendChild(a)
      a.click()
      
      // 清理资源
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      console.log('PDF文档导出成功')
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('导出PDF文档失败，请稍后重试')
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const getButtonText = () => {
    if (isExporting) {
      return exportType === 'word' ? '导出Word中...' : '导出PDF中...'
    }
    return '导出文档'
  }

  const getButtonIcon = () => {
    if (isExporting) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
    }
    return <Download className="h-4 w-4" />
  }

  // 检查是否允许显示导出功能
  if (!isExportAllowed()) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {/* 预览按钮 */}
      {showPreview && (
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

      {/* 导出下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled || isExporting || !content}
            className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 ${className}`}
          >
            {getButtonIcon()}
            <span className="ml-2">{getButtonText()}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleWordExport}
            disabled={isExporting || !content}
            className="cursor-pointer"
          >
            <FileText className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>导出为 Word</span>
              <span className="text-xs text-gray-500">专业格式，可编辑</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handlePDFExport}
            disabled={isExporting || !content}
            className="cursor-pointer"
          >
            <File className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>导出为 PDF</span>
              <span className="text-xs text-gray-500">固定格式，便于分享</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}