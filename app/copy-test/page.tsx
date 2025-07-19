"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CopySettingsManager } from "@/components/copy-settings-manager"
import { ExportActions } from "@/components/export-actions"
import { 
  isCopyAllowed, 
  shouldShowCopyUI, 
  isExportAllowed,
  getCopySettings 
} from "@/config/copy-settings"
import { copyTextToClipboard, copyImageToClipboard } from "@/utils/clipboard-utils"
import { handleCopyContent, shouldShowCopyButton } from "@/utils/export-utils"

import { Copy, Image, FileText, Settings } from "lucide-react"

export default function CopyTestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  const testContent = `# 测试内容

这是一个测试文档，用于验证复制功能控制系统。

## 功能特点
- 配置驱动的功能控制
- 安全的默认设置
- 灵活的扩展能力

**测试时间**: ${new Date().toLocaleString('zh-CN')}`

  const testFormData = {
    storeName: "测试店铺",
    storeCategory: "测试",
    storeLocation: "测试地址",
    businessDuration: "1年",
    storeFeatures: "测试特色",
    ownerName: "测试",
    ownerFeatures: "测试特色"
  }

  const handleTestTextCopy = async () => {
    const result = await copyTextToClipboard(testContent)
    setTestResult(result ? "✅ 文本复制成功" : "❌ 文本复制失败（功能被禁用）")
  }

  const handleTestImageCopy = async () => {
    // 使用一个测试图片URL
    const testImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVTVDwvdGV4dD48L3N2Zz4="
    const result = await copyImageToClipboard(testImageUrl)
    setTestResult(result ? "✅ 图片复制成功" : "❌ 图片复制失败（功能被禁用）")
  }

  const handleTestExportCopy = async () => {
    try {
      await handleCopyContent(testContent, testFormData)
      setTestResult("✅ 导出复制成功")
    } catch (error) {
      setTestResult("❌ 导出复制失败（功能被禁用）")
    }
  }

  const getCurrentStatus = () => {
    const settings = getCopySettings()
    return {
      allowCopy: settings.allowCopy,
      showCopyUI: settings.showCopyUI,
      allowExport: settings.allowExportAsAlternative,
      copyAllowed: isCopyAllowed(),
      showUI: shouldShowCopyUI(),
      exportAllowed: isExportAllowed(),
      showCopyBtn: shouldShowCopyButton()
    }
  }

  const status = getCurrentStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            复制功能控制系统测试
          </h1>
          <p className="text-gray-600">
            测试和验证复制功能的配置控制效果
          </p>
        </div>

        {/* 当前状态显示 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>当前配置状态</span>
            </CardTitle>
            <CardDescription>
              显示当前复制功能的配置状态和检查结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">允许复制</div>
                <Badge variant={status.allowCopy ? "default" : "secondary"}>
                  {status.allowCopy ? "是" : "否"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">显示UI</div>
                <Badge variant={status.showCopyUI ? "default" : "secondary"}>
                  {status.showCopyUI ? "是" : "否"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">允许导出</div>
                <Badge variant={status.allowExport ? "default" : "secondary"}>
                  {status.allowExport ? "是" : "否"}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">整体状态</div>
                <Badge variant={status.copyAllowed ? "destructive" : "default"}>
                  {status.copyAllowed ? "开放" : "安全"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 功能测试区域 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 复制功能测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Copy className="h-5 w-5" />
                <span>复制功能测试</span>
              </CardTitle>
              <CardDescription>
                测试各种复制功能是否受到配置控制
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 文本复制测试 */}
              <div className="space-y-2">
                <Button
                  onClick={handleTestTextCopy}
                  variant="outline"
                  className="w-full"
                  disabled={!shouldShowCopyUI()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  测试文本复制
                </Button>
                {!shouldShowCopyUI() && (
                  <p className="text-xs text-gray-500">
                    按钮被禁用（showCopyUI = false）
                  </p>
                )}
              </div>

              {/* 图片复制测试 */}
              <div className="space-y-2">
                <Button
                  onClick={handleTestImageCopy}
                  variant="outline"
                  className="w-full"
                  disabled={!shouldShowCopyUI()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  测试图片复制
                </Button>
                {!shouldShowCopyUI() && (
                  <p className="text-xs text-gray-500">
                    按钮被禁用（showCopyUI = false）
                  </p>
                )}
              </div>

              {/* 导出复制测试 */}
              <div className="space-y-2">
                <Button
                  onClick={handleTestExportCopy}
                  variant="outline"
                  className="w-full"
                  disabled={!shouldShowCopyButton()}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  测试导出复制
                </Button>
                {!shouldShowCopyButton() && (
                  <p className="text-xs text-gray-500">
                    按钮被禁用（shouldShowCopyButton = false）
                  </p>
                )}
              </div>

              {/* 测试结果显示 */}
              {testResult && (
                <div className="p-3 bg-gray-50 rounded text-sm">
                  <strong>测试结果：</strong> {testResult}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 导出功能测试 */}
          <Card>
            <CardHeader>
              <CardTitle>导出功能测试</CardTitle>
              <CardDescription>
                测试导出组件是否受到配置控制
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <ExportActions
                  content={testContent}
                  storeName="测试店铺"
                  className="w-full"
                />
                {!isExportAllowed() && (
                  <p className="text-xs text-gray-500">
                    导出组件被隐藏（allowExportAsAlternative = false）
                  </p>
                )}
              </div>

              <div className="p-3 bg-blue-50 rounded text-sm">
                <strong>说明：</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• 如果导出功能被禁用，组件将完全隐藏</li>
                  <li>• 如果导出功能启用，可以正常使用Word/PDF导出</li>
                  <li>• 导出功能可以作为复制功能的替代方案</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 配置管理 */}
        <Card>
          <CardHeader>
            <CardTitle>配置管理</CardTitle>
            <CardDescription>
              实时修改配置并查看效果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowSettings(true)}
              className="w-full"
            >
              <Settings className="h-4 w-4 mr-2" />
              打开配置管理器
            </Button>
          </CardContent>
        </Card>

        {/* 测试内容预览 */}
        <Card>
          <CardHeader>
            <CardTitle>测试内容预览</CardTitle>
            <CardDescription>
              用于测试的示例内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
              {testContent}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* 配置管理器 */}
      {showSettings && (
        <CopySettingsManager />
      )}
    </div>
  )
}