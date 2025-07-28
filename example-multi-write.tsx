'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  ChevronLeft,
  RefreshCw,
  Download,
  FileText,
  FileImage,
  Settings,
  Droplets,
  List,
  Hash,
  Eye,
  Edit
} from 'lucide-react'
import { renderMarkdown, MarkdownPresets } from '@/lib/markdown-renderer'
import { WatermarkConfigDialog, WatermarkConfig, configToWatermarkOptions } from '@/components/watermark-config'
import { addSimpleWatermark, addCompanyWatermark } from '@/lib/utils/pdf-watermark'

export default function MultiWritePage() {
  const [showToc, setShowToc] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [content, setContent] = useState(`# 《大柳树烧烤 - 老板IP打造方案》

由星光传媒专业团队为您量身定制 · 智能主播 · 专业可靠

## 1. IP核心定位与形象建构

**桥段体系**：打造"烧火气里的技术流"客群化定位，"烧烤界黄金会的温的朋友"，"大柳树清深夜食堂主理人"，"30年烧火艺术家"三大核心标签，构建"专业+亲切"的认知框架。

**人设框架**：塑造"技术型烧烤"复合形象，白天是厨艺的边缘专家（展示烧烤采购vlog），傍晚变身影子烤师（逆光拍影烤串教学），深夜化身情感顾问（食客故事记录），通过"白领"烧烤技法，"人间烟火气"的温度表达。

## 2. Slogan系统

**主slogan**："烧火有温度，人生有态度"

**副标语**：
- "烧烤的不只是串，是江湖"
- "大柳树清的第三空间"

**话术体系**：采用"技术话术+市井智慧"的混搭表达
- "三分火候七分心"
- "人生如烧烤，都要慢慢火候"

## 3. 内容策略

### 3.1 专业维度
- 烧烤技法分享
- 食材选择心得
- 火候控制技巧

### 3.2 情感维度
- 深夜食堂故事
- 客人情感交流
- 人生感悟分享`)

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: false,
    text: '星光同城传媒',
    opacity: 30,
    fontSize: 48,
    rotation: 45,
    position: 'bottom-right',
    repeat: 'none',
    color: 'gray'
  })

  const handleExportWord = async () => {
    console.log('导出Word文档')
    // 这里添加导出Word的逻辑，可以集成水印
    if (watermarkConfig.enabled) {
      console.log('Word导出将包含水印:', watermarkConfig)
    }
  }

  const handleExportPDF = async () => {
    console.log('导出PDF文档')
    // 这里添加导出PDF的逻辑，使用水印功能
    if (watermarkConfig.enabled) {
      try {
        // 这里应该先生成PDF，然后添加水印
        console.log('PDF导出将包含水印:', watermarkConfig)
        const watermarkOptions = configToWatermarkOptions(watermarkConfig)
        console.log('水印选项:', watermarkOptions)
        // const result = await addSimpleWatermark(pdfBuffer, watermarkConfig.text, watermarkOptions)
      } catch (error) {
        console.error('PDF水印添加失败:', error)
      }
    }
  }

  const handleWatermarkConfigChange = (config: WatermarkConfig) => {
    setWatermarkConfig(config)
  }

  // 生成标题ID（与markdown渲染器保持一致）
  const generateId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // 生成目录
  const generateToc = () => {
    const lines = content.split('\n')
    const tocItems: { level: number; text: string; id: string }[] = []
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)/)
      if (match) {
        const level = match[1].length
        const text = match[2].replace(/[《》]/g, '').trim()
        const id = generateId(text)
        tocItems.push({ level, text, id })
      }
    })
    
    return tocItems
  }

  const tocItems = generateToc()

  // 渲染markdown内容（markdown渲染器会自动为标题添加ID）
  const renderedContent = renderMarkdown(content, MarkdownPresets.full)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                修改信息
              </Button>
              <Button variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                重新生成
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 水印设置按钮 */}
              <WatermarkConfigDialog
                defaultConfig={watermarkConfig}
                onConfigChange={handleWatermarkConfigChange}
                storeName="星光传媒"
              />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Download className="w-4 h-4 mr-1" />
                    导出文档
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportWord}>
                    <FileText className="w-4 h-4 mr-2" />
                    导出为 Word
                    <span className="text-xs text-gray-500 ml-2">专业排版，可编辑</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileImage className="w-4 h-4 mr-2" />
                    导出为 PDF
                    <span className="text-xs text-gray-500 ml-2">固定格式，便于分享</span>
                  </DropdownMenuItem>
                  
                  {watermarkConfig.enabled && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-xs text-blue-600 flex items-center">
                        <Droplets className="w-3 h-3 mr-1" />
                        将包含水印: {watermarkConfig.text}
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">
                      大柳树烧烤 - 老板IP打造方案
                    </CardTitle>
                    <p className="text-gray-600">
                      由星光传媒专业团队为您量身定制 · 智能主播 · 专业可靠
                    </p>
                  </div>
                  
                  {/* 编辑/预览切换 */}
                  <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')}>
                    <TabsList>
                      <TabsTrigger value="edit" className="flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')}>
                  <TabsContent value="edit">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[500px] font-mono text-sm"
                      placeholder="在这里编辑您的内容..."
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div 
                      className="min-h-[500px] prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderedContent }}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 工具面板 */}
          <div className="space-y-6">
            {/* 水印状态显示 */}
            {watermarkConfig.enabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                    水印状态
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">文本:</span>
                      <span>{watermarkConfig.text}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">透明度:</span>
                      <span>{watermarkConfig.opacity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">位置:</span>
                      <span>{watermarkConfig.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">重复:</span>
                      <span>{watermarkConfig.repeat}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 文档统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  文档统计
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">字符数:</span>
                    <span>{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">段落数:</span>
                    <span>{content.split('\n\n').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">标题数:</span>
                    <span>{tocItems.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 右下角目录悬浮按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* 目录面板 */}
          {showToc && (
            <div className="absolute bottom-16 right-0 w-80 max-h-96 bg-white rounded-lg shadow-lg border overflow-hidden">
              <div className="p-3 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <List className="w-4 h-4 mr-2" />
                      文档目录
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">点击标题可快速跳转</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToc(false)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {tocItems.length > 0 ? (
                  <div className="p-2">
                    {tocItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center py-2 px-2 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer text-sm transition-colors group"
                        style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
                        onClick={() => {
                          console.log(`尝试跳转到: ${item.text}, ID: ${item.id}`)
                          
                          // 跳转到对应的标题
                          const targetElement = document.getElementById(item.id)
                          if (targetElement) {
                            targetElement.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            })
                            // 关闭目录面板
                            setShowToc(false)
                          } else {
                            console.warn(`未找到ID为 ${item.id} 的元素`)
                            // 调试：列出所有标题元素
                            const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
                            console.log('页面中所有标题元素:', Array.from(allHeadings).map(el => ({ 
                              id: el.id, 
                              tag: el.tagName, 
                              text: el.textContent?.slice(0, 50) 
                            })))
                          }
                        }}
                        title={`点击跳转到: ${item.text}`}
                      >
                        <Hash className="w-3 h-3 mr-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="truncate group-hover:font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    暂无标题内容
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 悬浮按钮 */}
          <Button
            onClick={() => setShowToc(!showToc)}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="sm"
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}