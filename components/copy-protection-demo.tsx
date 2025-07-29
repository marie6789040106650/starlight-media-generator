"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Shield, Eye, EyeOff } from "lucide-react"
import { getCopySettings, isCopyAllowed, shouldShowCopyUI } from "@/config/copy-settings"

export function CopyProtectionDemo() {
  const [copySettings, setCopySettings] = useState(getCopySettings())
  const [testText] = useState("这是一段测试文本，用于验证复制保护功能是否正常工作。在允许复制的页面，您可以选择和复制这段文字；在禁止复制的页面，您将无法选择或复制这段文字。")
  const [showDemo, setShowDemo] = useState(false)
  
  // 在结果页面隐藏复制保护演示
  useEffect(() => {
    const isResultPage = window.location.pathname === '/result'
    if (isResultPage) {
      setShowDemo(false)
    }
  }, [])

  useEffect(() => {
    // 监听复制设置变化
    const interval = setInterval(() => {
      setCopySettings(getCopySettings())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCopyTest = async () => {
    if (!isCopyAllowed()) {
      alert('🚫 复制功能已被禁用')
      return
    }

    try {
      await navigator.clipboard.writeText(testText)
      alert('✅ 文本已复制到剪贴板！')
    } catch (error) {
      alert('❌ 复制失败')
    }
  }

  const getStatusInfo = () => {
    if (copySettings.allowCopy && copySettings.showCopyUI) {
      return {
        status: "完全开放",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Copy className="h-3 w-3" />,
        description: "允许所有复制操作，显示复制按钮"
      }
    } else if (!copySettings.allowCopy && !copySettings.showCopyUI) {
      return {
        status: "完全保护",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <Shield className="h-3 w-3" />,
        description: "禁止所有复制操作，隐藏复制按钮"
      }
    } else {
      return {
        status: "部分保护",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Shield className="h-3 w-3" />,
        description: "自定义保护设置"
      }
    }
  }

  const statusInfo = getStatusInfo()
  
  // 在结果页面完全隐藏复制保护演示
  const isResultPage = typeof window !== 'undefined' && window.location.pathname === '/result'
  if (isResultPage) {
    return null
  }

  if (!showDemo) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDemo(true)}
        className="fixed bottom-4 right-4 z-40"
      >
        <Eye className="h-4 w-4 mr-2" />
        复制保护演示
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {statusInfo.icon}
              复制保护状态
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDemo(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            实时显示当前页面的复制保护状态
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 状态徽章 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">当前状态:</span>
            <Badge className={`${statusInfo.color} border`}>
              {statusInfo.status}
            </Badge>
          </div>

          {/* 详细设置 */}
          <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
            <div className="flex justify-between">
              <span>允许复制:</span>
              <span className={copySettings.allowCopy ? "text-green-600" : "text-red-600"}>
                {copySettings.allowCopy ? "是" : "否"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>显示复制UI:</span>
              <span className={copySettings.showCopyUI ? "text-green-600" : "text-red-600"}>
                {copySettings.showCopyUI ? "是" : "否"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>允许导出:</span>
              <span className={copySettings.allowExportAsAlternative ? "text-green-600" : "text-red-600"}>
                {copySettings.allowExportAsAlternative ? "是" : "否"}
              </span>
            </div>
          </div>

          {/* 测试区域 */}
          <div className="space-y-2">
            <div className="text-xs font-medium">复制测试:</div>
            <div className={`text-xs p-2 border rounded ${
              copySettings.allowCopy 
                ? "bg-white border-gray-200" 
                : "bg-gray-100 border-gray-300 select-none"
            }`}>
              {testText}
            </div>
            
            {shouldShowCopyUI() && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyTest}
                className="w-full text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                测试复制
              </Button>
            )}
            
            {!shouldShowCopyUI() && (
              <div className="text-xs text-gray-500 text-center py-2">
                复制按钮已隐藏
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {statusInfo.description}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}