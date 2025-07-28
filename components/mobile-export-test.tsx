"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Monitor, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { checkMobileCompatibility, getMobileExportTips, checkMobileLimitations } from "@/lib/mobile-compatibility"

export const MobileExportTest: React.FC = () => {
  const [compatibility, setCompatibility] = useState<any>(null)
  const [limitations, setLimitations] = useState<any>(null)
  const [tips, setTips] = useState<string[]>([])

  useEffect(() => {
    const compat = checkMobileCompatibility()
    const limits = checkMobileLimitations()
    const exportTips = getMobileExportTips(compat.isMobile)
    
    setCompatibility(compat)
    setLimitations(limits)
    setTips(exportTips)
  }, [])

  if (!compatibility) return <div>检测中...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {compatibility.isMobile ? (
              <Smartphone className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
            设备兼容性检测
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 设备信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">设备类型</div>
              <Badge variant={compatibility.isMobile ? "default" : "secondary"}>
                {compatibility.isMobile ? "移动设备" : "桌面设备"}
              </Badge>
            </div>
            
            {compatibility.isMobile && (
              <>
                <div className="text-center">
                  <div className="text-sm text-gray-500">操作系统</div>
                  <Badge variant={compatibility.isIOS ? "default" : compatibility.isAndroid ? "secondary" : "outline"}>
                    {compatibility.isIOS ? "iOS" : compatibility.isAndroid ? "Android" : "其他"}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">内存状态</div>
                  <Badge variant={compatibility.memoryLimited ? "destructive" : "default"}>
                    {compatibility.memoryLimited ? "内存受限" : "内存充足"}
                  </Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-500">推荐页数</div>
                  <Badge variant="outline">
                    ≤ {compatibility.recommendedMaxPages}页
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* API支持情况 */}
          <div className="space-y-2">
            <h4 className="font-medium">API支持情况</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                {compatibility.canvasSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Canvas API (PDF导出)</span>
              </div>
              
              <div className="flex items-center gap-2">
                {compatibility.blobSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Blob API (文件生成)</span>
              </div>
              
              <div className="flex items-center gap-2">
                {compatibility.downloadSupport ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">下载支持</span>
              </div>
            </div>
          </div>

          {/* 导出能力 */}
          <div className="space-y-2">
            <h4 className="font-medium">导出能力评估</h4>
            <div className="flex items-center gap-2">
              {limitations.canExport ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={limitations.canExport ? "text-green-700" : "text-red-700"}>
                {limitations.canExport ? "支持导出功能" : "不支持导出功能"}
              </span>
            </div>
          </div>

          {/* 警告信息 */}
          {limitations.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">注意事项</span>
              </div>
              <ul className="space-y-1 text-sm text-amber-700">
                {limitations.warnings.map((warning: string, index: number) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 移动端使用提示 */}
          {tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="font-medium text-blue-800 mb-2">使用建议</div>
              <ul className="space-y-1 text-sm text-blue-700">
                {tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>功能测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              disabled={!compatibility.canvasSupport}
              onClick={() => {
                // 测试Canvas功能
                try {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    ctx.fillStyle = 'red'
                    ctx.fillRect(0, 0, 100, 100)
                    alert('Canvas测试成功！')
                  } else {
                    alert('Canvas上下文获取失败')
                  }
                } catch (error) {
                  alert('Canvas测试失败: ' + error)
                }
              }}
            >
              测试Canvas API
            </Button>
            
            <Button 
              variant="outline"
              disabled={!compatibility.blobSupport}
              onClick={() => {
                // 测试Blob功能
                try {
                  const blob = new Blob(['测试内容'], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = 'test.txt'
                  link.click()
                  URL.revokeObjectURL(url)
                  alert('Blob测试成功！文件应该已开始下载')
                } catch (error) {
                  alert('Blob测试失败: ' + error)
                }
              }}
            >
              测试文件下载
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            点击按钮测试浏览器对相关API的支持情况
          </div>
        </CardContent>
      </Card>
    </div>
  )
}