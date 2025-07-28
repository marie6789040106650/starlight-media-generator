"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Download, FileText, File, Loader2, AlertCircle } from "lucide-react"
import { FormData } from "@/lib/types"
import { exportToPDF, exportToWord, checkExportSupport, getWatermarkConfig } from "@/lib/export-utils"

interface ExportButtonsProps {
  content: string
  formData: FormData
  bannerImage?: string | null
  className?: string
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  content,
  formData,
  bannerImage,
  className = ""
}) => {
  const [isExporting, setIsExporting] = useState<'pdf' | 'word' | null>(null)
  const [exportSupport, setExportSupport] = useState({ pdf: true, word: true })
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)

  // 检查导出支持和水印状态
  useEffect(() => {
    setExportSupport(checkExportSupport())
    
    const watermarkConfig = getWatermarkConfig()
    setWatermarkEnabled(watermarkConfig?.enabled || false)
  }, [])

  // PDF导出处理
  const handlePDFExport = async () => {
    setIsExporting('pdf')
    
    try {
      await exportToPDF({
        content,
        formData,
        bannerImage,
        format: 'pdf'
      })
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert(error instanceof Error ? error.message : 'PDF导出失败，请重试')
    } finally {
      setIsExporting(null)
    }
  }

  // Word导出处理
  const handleWordExport = async () => {
    setIsExporting('word')
    
    try {
      await exportToWord({
        content,
        formData,
        bannerImage,
        format: 'word'
      })
    } catch (error) {
      console.error('Word导出失败:', error)
      alert(error instanceof Error ? error.message : 'Word导出失败，请重试')
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 导出按钮组 */}
      <div className="flex gap-3">
        <Button
          onClick={handlePDFExport}
          disabled={!exportSupport.pdf || isExporting !== null || !content}
          variant="default"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
        >
          {isExporting === 'pdf' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {isExporting === 'pdf' ? '导出中...' : '导出PDF'}
          {watermarkEnabled && (
            <span className="ml-1 text-xs bg-white/20 px-1 rounded">含水印</span>
          )}
        </Button>

        <Button
          onClick={handleWordExport}
          disabled={!exportSupport.word || isExporting !== null || !content}
          variant="outline"
          size="sm"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
        >
          {isExporting === 'word' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <File className="h-4 w-4 mr-2" />
          )}
          {isExporting === 'word' ? '导出中...' : '导出Word'}
        </Button>
      </div>

      {/* 状态提示 */}
      <div className="text-xs text-gray-600 space-y-1">
        {!content && (
          <div className="flex items-center text-amber-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            请先生成内容后再导出
          </div>
        )}
        
        {content && (
          <div className="space-y-1">
            <div className="flex items-center text-green-600">
              ✅ PDF导出：基于分页模式的高质量截图，保持完整格式
            </div>
            <div className="flex items-center text-blue-600">
              📝 Word导出：基于内容文本，支持进一步编辑
            </div>
            {watermarkEnabled && (
              <div className="flex items-center text-purple-600">
                🎨 水印已启用，将包含在导出文件中
              </div>
            )}
          </div>
        )}

        {(!exportSupport.pdf || !exportSupport.word) && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            当前浏览器不支持某些导出功能
          </div>
        )}
      </div>
    </div>
  )
}

