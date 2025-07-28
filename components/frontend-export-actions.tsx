/**
 * 前端导出操作组件
 * 纯浏览器环境实现，无需服务器支持
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, File, Download } from "lucide-react"
import { isExportAllowed } from "@/config/copy-settings"
import { FrontendWordGenerator } from "@/lib/frontend-word-generator"

interface FrontendExportActionsProps {
  content: string
  storeName: string
  bannerImage?: string | null
  disabled?: boolean
  className?: string
  usePageMode?: boolean // 是否基于分页模式
}

export function FrontendExportActions({ 
  content, 
  storeName, 
  bannerImage, 
  disabled = false, 
  className,
  usePageMode = false
}: FrontendExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'word' | 'pdf' | null>(null)

  // 检查分页模式
  const checkPageMode = () => {
    if (usePageMode) {
      const pages = document.querySelectorAll('.page')
      if (pages.length === 0) {
        alert('未找到分页内容，请先切换到分页模式')
        return false
      }
    }
    return true
  }

  // 前端Word导出
  const handleWordExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用')
      return
    }

    if (!content || !storeName) {
      console.warn('缺少必要的导出参数:', { content: !!content, storeName })
      return
    }

    if (!checkPageMode()) {
      return
    }

    setIsExporting(true)
    setExportType('word')

    try {
      const generator = new FrontendWordGenerator()
      
      // 生成文件名
      let filename = undefined
      const firstLine = content.split('\n')[0]
      if (firstLine && firstLine.startsWith('#')) {
        const title = firstLine.replace(/^#+\s*/, '').trim()
        if (title) {
          const currentDate = new Date().toLocaleDateString('zh-CN').replace(/\//g, '')
          filename = `${title}-${currentDate}.docx`
        }
      }

      // 导出选项
      const options = {
        content,
        storeName,
        bannerImage,
        filename,
        usePageMode, // 是否使用分页模式解析
      }

      // 生成并下载
      await generator.generateAndDownload(options)
      
      console.log('✅ 前端Word导出成功')
      
    } catch (error) {
      console.error('前端Word导出失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导出失败，请重试'
      alert(`Word导出失败: ${errorMessage}`)
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  // PDF导出（保持原有逻辑）
  const handlePDFExport = async () => {
    if (!isExportAllowed()) {
      alert('导出功能已被禁用')
      return
    }

    setIsExporting(true)
    setExportType('pdf')

    try {
      // 这里可以集成PDF导出逻辑
      alert('PDF导出功能开发中...')
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert('PDF导出失败，请重试')
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Word导出按钮 */}
      <Button
        onClick={handleWordExport}
        disabled={disabled || isExporting}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isExporting && exportType === 'word' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
        ) : (
          <FileText className="h-4 w-4 text-blue-600" />
        )}
        <span>
          {isExporting && exportType === 'word' ? '导出Word中...' : '导出Word'}
        </span>
      </Button>

      {/* PDF导出按钮 */}
      <Button
        onClick={handlePDFExport}
        disabled={disabled || isExporting}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {isExporting && exportType === 'pdf' ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
        ) : (
          <File className="h-4 w-4 text-red-600" />
        )}
        <span>
          {isExporting && exportType === 'pdf' ? '导出PDF中...' : '导出PDF'}
        </span>
      </Button>
    </div>
  )
}

// 导出便捷Hook
export function useFrontendExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportWord = async (options: {
    content: string
    storeName: string
    bannerImage?: string | null
    filename?: string
    usePageMode?: boolean
  }) => {
    if (!isExportAllowed()) {
      throw new Error('导出功能已被禁用')
    }

    setIsExporting(true)
    try {
      const generator = new FrontendWordGenerator()
      await generator.generateAndDownload(options)
      return true
    } catch (error) {
      console.error('Word导出失败:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return {
    isExporting,
    exportWord
  }
}