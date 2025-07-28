/**
 * 简单的Word导出按钮组件
 * 用于测试前端Word导出功能
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { exportWordDocument } from "@/lib/client-word-export"

interface SimpleWordExportButtonProps {
  content: string
  storeName: string
  disabled?: boolean
  className?: string
}

export function SimpleWordExportButton({ 
  content, 
  storeName, 
  disabled = false, 
  className 
}: SimpleWordExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!content || !storeName) {
      alert('缺少必要的导出参数')
      return
    }

    setIsExporting(true)

    try {
      console.log('🚀 开始Word导出...')
      
      await exportWordDocument({
        content,
        storeName,
      })
      
      console.log('✅ Word导出成功!')
      alert('✅ Word文档导出成功!')
      
    } catch (error) {
      console.error('❌ Word导出失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导出失败，请重试'
      alert(`❌ Word导出失败: ${errorMessage}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || isExporting}
      variant="outline"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
    >
      {isExporting ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
      ) : (
        <FileText className="h-4 w-4 text-blue-600" />
      )}
      <span>
        {isExporting ? '导出中...' : '导出Word'}
      </span>
    </Button>
  )
}