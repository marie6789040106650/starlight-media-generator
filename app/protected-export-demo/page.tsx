/**
 * 受保护导出功能演示页面
 * 展示高级水印和用户追踪功能
 */

"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Users, BarChart3, Info } from "lucide-react";
import { AdvancedExportWithProtection } from "@/components/advanced-export-with-protection";
import { DownloadRecordsDashboard } from "@/components/download-records-dashboard";

const ProtectedExportDemo: React.FC = () => {
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  const sampleContent = `# 星光传媒营销方案

## 项目概述
本文档包含星光传媒的核心营销策略和商业机密信息。

## 市场分析
- 目标客户群体分析
- 竞争对手研究
- 市场机会评估

## 营销策略
1. **数字化营销**
   - 社交媒体推广
   - 内容营销策略
   - SEO优化方案

2. **传统媒体整合**
   - 电视广告投放
   - 平面媒体合作
   - 户外广告布局

## 预算分配
- 数字营销: 60%
- 传统媒体: 30%
- 其他渠道: 10%

## 执行时间表
Q1: 策略制定和准备
Q2: 全面推广启动
Q3: 效果评估和优化
Q4: 总结和规划

---
*本文档为星光传媒内部机密资料，请勿外传*`;

  const handleExportResult = (result: { success: boolean; message: string }) => {
    setExportResult(result);
    setTimeout(() => setExportResult(null), 5000);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <Shield className="h-8 w-8 mr-3 text-blue-600" />
          安全导出演示
        </h1>
        <p className="text-gray-600">
          体验高级PDF水印保护和用户追踪功能
        </p>
      </div>

      {/* 导出结果提示 */}
      {exportResult && (
        <Alert className={exportResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertDescription className={exportResult.success ? "text-green-800" : "text-red-800"}>
            {exportResult.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            导出演示
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            保护功能
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            下载记录
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            使用说明
          </TabsTrigger>
        </TabsList>

        {/* 导出演示 */}
        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 文档预览 */}
            <Card>
              <CardHeader>
                <CardTitle>文档预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{sampleContent}</pre>
                </div>
              </CardContent>
            </Card>

            {/* 导出控制 */}
            <Card>
              <CardHeader>
                <CardTitle>安全导出</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  点击下方按钮体验带有高级保护功能的PDF导出：
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓ 多层水印保护</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓ 用户信息追踪</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓ 下载记录管理</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">✓ 防截图保护</Badge>
                  </div>
                </div>

                <div className="pt-4">
                  <AdvancedExportWithProtection
                    content={sampleContent}
                    title="星光传媒营销方案"
                    storeName="星光传媒"
                    onExport={handleExportResult}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>      
  {/* 保护功能说明 */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  基础保护
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">公司水印</h4>
                    <p className="text-sm text-gray-600">在PDF右下角添加公司版权信息</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">时间戳</h4>
                    <p className="text-sm text-gray-600">记录文档生成时间</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">基础追踪</h4>
                    <p className="text-sm text-gray-600">记录下载基本信息</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-orange-600" />
                  标准保护
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">用户水印</h4>
                    <p className="text-sm text-gray-600">添加下载用户的姓名和邮箱信息</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">对角线水印</h4>
                    <p className="text-sm text-gray-600">在页面对角线添加重复水印</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">详细追踪</h4>
                    <p className="text-sm text-gray-600">记录IP地址、用户代理等信息</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-red-600" />
                  最高保护
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">密集水印</h4>
                    <p className="text-sm text-gray-600">高密度网格水印，防止截图盗用</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">多层保护</h4>
                    <p className="text-sm text-gray-600">结合多种水印技术</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">完整追踪</h4>
                    <p className="text-sm text-gray-600">记录所有可用的用户和环境信息</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  用户追踪
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">身份验证</h4>
                    <p className="text-sm text-gray-600">要求用户提供姓名和邮箱</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">行为记录</h4>
                    <p className="text-sm text-gray-600">记录下载时间、IP地址等</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">审计日志</h4>
                    <p className="text-sm text-gray-600">生成完整的下载审计记录</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 下载记录 */}
        <TabsContent value="records">
          <DownloadRecordsDashboard />
        </TabsContent>

        {/* 使用说明 */}
        <TabsContent value="help" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">如何使用安全导出功能</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    点击"安全导出PDF"按钮打开配置对话框
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    选择适合的保护级别（基础/标准/最高）
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    填写用户信息（姓名、邮箱、部门）
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">4</span>
                    确认设置并点击"安全导出"
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">5</span>
                    系统将生成带有水印保护的PDF文件
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">保护级别说明</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-gray-400 pl-4">
                    <h4 className="font-medium">基础保护</h4>
                    <p className="text-sm text-gray-600">适用于一般文档，提供基本的版权保护</p>
                  </div>
                  <div className="border-l-4 border-orange-400 pl-4">
                    <h4 className="font-medium">标准保护</h4>
                    <p className="text-sm text-gray-600">适用于重要文档，包含用户追踪功能</p>
                  </div>
                  <div className="border-l-4 border-red-400 pl-4">
                    <h4 className="font-medium">最高保护</h4>
                    <p className="text-sm text-gray-600">适用于机密文档，提供最强的防盗用保护</p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>注意事项：</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• 用户信息将被嵌入到PDF中，请确保信息准确</li>
                    <li>• 下载记录将被保存用于安全审计</li>
                    <li>• 请仅将受保护的文档分享给授权人员</li>
                    <li>• 水印信息可用于追踪文档来源和使用情况</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProtectedExportDemo;