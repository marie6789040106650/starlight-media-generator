"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Shield, Download, Copy } from "lucide-react"
import { 
  getCopySettings, 
  updateCopySettings, 
  resetCopySettings,
  type CopySettings 
} from "@/config/copy-settings"
import { updateProtectionStatus } from "@/utils/prevent-copy"

interface CopySettingsManagerProps {
  className?: string
}

export function CopySettingsManager({ className }: CopySettingsManagerProps) {
  const [settings, setSettings] = useState<CopySettings>({
    allowCopy: false,
    showCopyUI: false,
    allowExportAsAlternative: true
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 加载当前设置
    setSettings(getCopySettings())
  }, [])

  const handleSettingChange = (key: keyof CopySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateCopySettings({ [key]: value })
    // 更新保护状态
    updateProtectionStatus()
  }

  const handleReset = () => {
    resetCopySettings()
    setSettings(getCopySettings())
    // 更新保护状态
    updateProtectionStatus()
  }

  const getStatusBadge = () => {
    if (settings.allowCopy && settings.showCopyUI) {
      return <Badge variant="destructive">完全开放</Badge>
    } else if (!settings.allowCopy && !settings.showCopyUI && !settings.allowExportAsAlternative) {
      return <Badge variant="default">完全禁用</Badge>
    } else if (!settings.allowCopy && !settings.showCopyUI && settings.allowExportAsAlternative) {
      return <Badge variant="secondary">仅导出</Badge>
    } else {
      return <Badge variant="outline">自定义</Badge>
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 left-4 z-50 ${className}`}
      >
        <Settings className="h-4 w-4 mr-2" />
        复制设置
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>复制功能设置</CardTitle>
              {getStatusBadge()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
          <CardDescription>
            控制系统中的复制和导出功能。默认情况下所有复制功能都被禁用。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 复制功能开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Copy className="h-4 w-4" />
                <span>允许复制内容</span>
              </Label>
              <p className="text-sm text-gray-500">
                启用剪贴板API复制功能
              </p>
            </div>
            <Switch
              checked={settings.allowCopy}
              onCheckedChange={(checked) => handleSettingChange('allowCopy', checked)}
            />
          </div>

          {/* UI显示开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>显示复制按钮</Label>
              <p className="text-sm text-gray-500">
                在界面中显示复制相关按钮
              </p>
            </div>
            <Switch
              checked={settings.showCopyUI}
              onCheckedChange={(checked) => handleSettingChange('showCopyUI', checked)}
            />
          </div>

          {/* 导出功能开关 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>允许导出功能</span>
              </Label>
              <p className="text-sm text-gray-500">
                允许Word/PDF导出作为替代方案
              </p>
            </div>
            <Switch
              checked={settings.allowExportAsAlternative}
              onCheckedChange={(checked) => handleSettingChange('allowExportAsAlternative', checked)}
            />
          </div>

          {/* 预设配置 */}
          <div className="space-y-3">
            <Label>快速配置</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSettings = { allowCopy: false, showCopyUI: false, allowExportAsAlternative: false }
                  setSettings(newSettings)
                  updateCopySettings(newSettings)
                  updateProtectionStatus()
                }}
              >
                完全禁用
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSettings = { allowCopy: true, showCopyUI: true, allowExportAsAlternative: true }
                  setSettings(newSettings)
                  updateCopySettings(newSettings)
                  updateProtectionStatus()
                }}
              >
                完全开放
              </Button>
            </div>
          </div>

          {/* 重置按钮 */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              重置为默认
            </Button>
            <Button onClick={() => setIsVisible(false)}>
              确定
            </Button>
          </div>

          {/* 当前状态说明 */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>当前状态：</strong>
            {!settings.allowCopy && !settings.showCopyUI && !settings.allowExportAsAlternative && (
              "完全禁用 - 禁用所有复制和导出功能，包括键盘快捷键、右键菜单、文本选择等"
            )}
            {!settings.allowCopy && !settings.showCopyUI && settings.allowExportAsAlternative && (
              "仅导出模式 - 禁用所有复制功能，仅允许文档导出"
            )}
            {settings.allowCopy && settings.showCopyUI && settings.allowExportAsAlternative && (
              "完全开放 - 允许所有复制和导出功能"
            )}
            {(settings.allowCopy !== settings.showCopyUI || 
              (settings.allowCopy && !settings.allowExportAsAlternative)) && (
              "自定义配置 - 部分功能启用"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}