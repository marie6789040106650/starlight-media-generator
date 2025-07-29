/**
 * 方案导出组件 - 集成水印设置功能
 * 支持PDF、Word导出，并提供完整的水印配置
 */

"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  Settings, 
  Shield,
  Eye,
  Printer
} from "lucide-react";

interface SolutionExportProps {
  /** 方案标题 */
  title: string;
  /** 方案内容 (Markdown格式) */
  content: string;
  /** 用户信息 */
  userInfo?: {
    name: string;
    email: string;
    department?: string;
  };
}

export const SolutionExportWithWatermark: React.FC<SolutionExportProps> = ({
  title,
  content,
  userInfo
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [watermarkConfig, setWatermarkConfig] = useState({
    enabled: true,
    text: '© 星光传媒',
    opacity: 30,
    fontSize: 48,
    rotation: 45,
    position: 'center' as 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    repeat: 'diagonal' as 'none' | 'diagonal' | 'grid',
    color: 'gray' as 'gray' | 'red' | 'blue' | 'black',
    protectionLevel: 'standard' as 'basic' | 'standard' | 'maximum'
  });

  // 导出为PDF
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // 动态导入PDF导出功能
      const { exportSolutionToPDF } = await import('../lib/pdf-export-with-watermark');
      
      await exportSolutionToPDF(title, content, {
        watermark: watermarkConfig.enabled ? {
          text: watermarkConfig.text,
          opacity: watermarkConfig.opacity / 100,
          fontSize: watermarkConfig.fontSize,
          rotation: watermarkConfig.rotation,
          position: { x: watermarkConfig.position.includes('left') ? 'left' : 
                         watermarkConfig.position.includes('right') ? 'right' : 'center',
                     y: watermarkConfig.position.includes('top') ? 'top' : 
                        watermarkConfig.position.includes('bottom') ? 'bottom' : 'center' },
          repeat: watermarkConfig.repeat,
          color: getColorRGB(watermarkConfig.color)
        } : undefined,
        userInfo,
        protectionLevel: watermarkConfig.protectionLevel
      });
    } catch (error) {
      console.error('PDF导出失败:', error);
      alert('PDF导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导出为Word
  const exportToWord = async () => {
    setIsExporting(true);
    try {
      const { exportToWord } = await import('../lib/word-export-with-markdown');
      
      exportToWord(title, content, {
        preserveHtml: true,
        convertTables: true,
        convertCodeBlocks: true,
        imageHandling: 'embed'
      });
    } catch (error) {
      console.error('Word导出失败:', error);
      alert('Word导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 获取颜色RGB值
  const getColorRGB = (color: string) => {
    const colorMap = {
      gray: { r: 0.5, g: 0.5, b: 0.5 },
      red: { r: 1, g: 0, b: 0 },
      blue: { r: 0, g: 0, b: 1 },
      black: { r: 0, g: 0, b: 0 }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="flex items-center space-x-3">
      {/* 导出按钮组 */}
      <Button
        onClick={exportToPDF}
        disabled={isExporting}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        <FileText className="h-4 w-4 mr-2" />
        {isExporting ? '导出中...' : '导出PDF'}
      </Button>

      <Button
        onClick={exportToWord}
        disabled={isExporting}
        variant="outline"
        className="border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        <Download className="h-4 w-4 mr-2" />
        导出Word
      </Button>

      {/* 水印设置对话框 */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            水印设置
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              水印保护设置
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">基础设置</TabsTrigger>
              <TabsTrigger value="advanced">高级设置</TabsTrigger>
              <TabsTrigger value="preview">预览效果</TabsTrigger>
            </TabsList>

            {/* 基础设置 */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">水印基础配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 启用水印 */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">启用水印保护</label>
                    <input
                      type="checkbox"
                      checked={watermarkConfig.enabled}
                      onChange={(e) => setWatermarkConfig(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                  </div>

                  {watermarkConfig.enabled && (
                    <>
                      {/* 水印文本 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">水印文本</label>
                        <input
                          type="text"
                          value={watermarkConfig.text}
                          onChange={(e) => setWatermarkConfig(prev => ({
                            ...prev,
                            text: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="输入水印文本"
                        />
                      </div>

                      {/* 保护级别 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">保护级别</label>
                        <div className="space-y-2">
                          {[
                            { value: 'basic', label: '基础保护', desc: '轻量水印，不影响阅读' },
                            { value: 'standard', label: '标准保护', desc: '平衡保护与体验' },
                            { value: 'maximum', label: '最高保护', desc: '密集水印，最强保护' }
                          ].map((level) => (
                            <div
                              key={level.value}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                watermarkConfig.protectionLevel === level.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setWatermarkConfig(prev => ({
                                ...prev,
                                protectionLevel: level.value as any,
                                opacity: level.value === 'basic' ? 20 : 
                                        level.value === 'standard' ? 30 : 50,
                                repeat: level.value === 'maximum' ? 'grid' : 'diagonal'
                              }))}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{level.label}</div>
                                  <div className="text-sm text-gray-600">{level.desc}</div>
                                </div>
                                <input
                                  type="radio"
                                  checked={watermarkConfig.protectionLevel === level.value}
                                  onChange={() => {}}
                                  className="h-4 w-4"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent> 
           {/* 高级设置 */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">高级水印配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watermarkConfig.enabled && (
                    <>
                      {/* 透明度 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          透明度: {watermarkConfig.opacity}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          step="5"
                          value={watermarkConfig.opacity}
                          onChange={(e) => setWatermarkConfig(prev => ({
                            ...prev,
                            opacity: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                      </div>

                      {/* 字体大小 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          字体大小: {watermarkConfig.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          step="4"
                          value={watermarkConfig.fontSize}
                          onChange={(e) => setWatermarkConfig(prev => ({
                            ...prev,
                            fontSize: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                      </div>

                      {/* 旋转角度 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          旋转角度: {watermarkConfig.rotation}°
                        </label>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          step="15"
                          value={watermarkConfig.rotation}
                          onChange={(e) => setWatermarkConfig(prev => ({
                            ...prev,
                            rotation: parseInt(e.target.value)
                          }))}
                          className="w-full"
                        />
                      </div>

                      {/* 位置设置 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">水印位置</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'top-left', label: '左上' },
                            { value: 'center', label: '居中' },
                            { value: 'top-right', label: '右上' },
                            { value: 'bottom-left', label: '左下' },
                            { value: 'center', label: '中心' },
                            { value: 'bottom-right', label: '右下' }
                          ].map((pos, index) => (
                            <button
                              key={`${pos.value}-${index}`}
                              className={`p-2 text-sm border rounded transition-colors ${
                                watermarkConfig.position === pos.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setWatermarkConfig(prev => ({
                                ...prev,
                                position: pos.value as any
                              }))}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 重复模式 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">重复模式</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'none', label: '单个', desc: '仅一个水印' },
                            { value: 'diagonal', label: '对角线', desc: '对角分布' },
                            { value: 'grid', label: '网格', desc: '密集分布' }
                          ].map((mode) => (
                            <div
                              key={mode.value}
                              className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                                watermarkConfig.repeat === mode.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setWatermarkConfig(prev => ({
                                ...prev,
                                repeat: mode.value as any
                              }))}
                            >
                              <div className="font-medium text-sm">{mode.label}</div>
                              <div className="text-xs text-gray-600">{mode.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 颜色设置 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">水印颜色</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { value: 'gray', label: '灰色', color: 'bg-gray-400' },
                            { value: 'red', label: '红色', color: 'bg-red-400' },
                            { value: 'blue', label: '蓝色', color: 'bg-blue-400' },
                            { value: 'black', label: '黑色', color: 'bg-black' }
                          ].map((colorOption) => (
                            <div
                              key={colorOption.value}
                              className={`p-2 border rounded-lg cursor-pointer text-center transition-colors ${
                                watermarkConfig.color === colorOption.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setWatermarkConfig(prev => ({
                                ...prev,
                                color: colorOption.value as any
                              }))}
                            >
                              <div className={`w-6 h-6 ${colorOption.color} rounded mx-auto mb-1`}></div>
                              <div className="text-xs">{colorOption.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 预览效果 */}
            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    水印效果预览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {watermarkConfig.enabled ? (
                    <div className="relative bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[300px] overflow-hidden">
                      {/* 模拟文档内容 */}
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold mb-4">{title}</h3>
                        <p className="text-gray-700 mb-3">这是文档内容的预览...</p>
                        <p className="text-gray-700 mb-3">水印将会叠加在内容之上</p>
                        <p className="text-gray-700">保护您的知识产权</p>
                      </div>

                      {/* 水印预览 */}
                      <div 
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        style={{
                          opacity: watermarkConfig.opacity / 100,
                          transform: `rotate(${watermarkConfig.rotation}deg)`,
                          color: watermarkConfig.color === 'gray' ? '#6b7280' :
                                 watermarkConfig.color === 'red' ? '#ef4444' :
                                 watermarkConfig.color === 'blue' ? '#3b82f6' : '#000000',
                          fontSize: `${Math.min(watermarkConfig.fontSize / 2, 24)}px`,
                          fontWeight: 'bold'
                        }}
                      >
                        {watermarkConfig.repeat === 'grid' ? (
                          <div className="grid grid-cols-3 gap-8 w-full h-full">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} className="flex items-center justify-center">
                                {watermarkConfig.text}
                              </div>
                            ))}
                          </div>
                        ) : watermarkConfig.repeat === 'diagonal' ? (
                          <div className="relative w-full h-full">
                            <div className="absolute top-1/4 left-1/4">{watermarkConfig.text}</div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              {watermarkConfig.text}
                            </div>
                            <div className="absolute bottom-1/4 right-1/4">{watermarkConfig.text}</div>
                          </div>
                        ) : (
                          <div>{watermarkConfig.text}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>水印功能已禁用</p>
                      <p className="text-sm">启用水印以查看预览效果</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 打印按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4 mr-2" />
        打印
      </Button>
    </div>
  );
};

export default SolutionExportWithWatermark;