"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Download, FileText, File, Loader2, AlertCircle, Smartphone } from "lucide-react"
import { FormData } from "@/lib/types"
import { exportToPDF, checkExportSupport, getWatermarkConfig } from "@/lib/export-utils"
import { checkMobileCompatibility, getMobileExportTips } from "@/lib/mobile-compatibility"

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
  const [exportSupport, setExportSupport] = useState({ pdf: true, word: true, mobile: false, warnings: [] as string[] })
  const [watermarkEnabled, setWatermarkEnabled] = useState(false)
  const [mobileCompat, setMobileCompat] = useState({ isMobile: false, isIOS: false, isAndroid: false })

  // 检查导出支持和水印状态
  useEffect(() => {
    const support = checkExportSupport()
    const mobile = checkMobileCompatibility()
    
    setExportSupport(support)
    setMobileCompat(mobile)
    
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
      const { exportWordDocument } = await import('@/lib/client-word-export')
      
      await exportWordDocument({
        content,
        storeName: formData.storeName,
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
        
        {/* 移动端特殊提示 */}
        {mobileCompat.isMobile && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
            <div className="flex items-center text-blue-700 font-medium">
              <Smartphone className="h-3 w-3 mr-1" />
              移动设备检测
            </div>
            {mobileCompat.isIOS && (
              <div className="text-blue-600">🍎 iOS设备：下载后需手动保存到文件app</div>
            )}
            {mobileCompat.isAndroid && (
              <div className="text-blue-600">🤖 Android设备：某些浏览器可能限制下载</div>
            )}
            <div className="text-blue-600">💡 大文档建议使用桌面浏览器以获得最佳体验</div>
          </div>
        )}
        
        {content && (
          <div className="space-y-1">
            <div className="flex items-center text-green-600">
              ✅ PDF导出：基于分页模式的高质量截图，保持完整格式
              {mobileCompat.isMobile && <span className="ml-1 text-xs">(移动端优化)</span>}
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

        {/* 兼容性警告 */}
        {exportSupport.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-2">
            <div className="flex items-center text-amber-700 font-medium mb-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              兼容性提示
            </div>
            {exportSupport.warnings.map((warning, index) => (
              <div key={index} className="text-amber-600 text-xs">
                {warning}
              </div>
            ))}
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

