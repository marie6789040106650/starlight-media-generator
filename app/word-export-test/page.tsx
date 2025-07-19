"use client"

import { useState } from 'react'
import { WordGenerator } from '../../lib/export/word-generator'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, Settings } from 'lucide-react'

export default function WordExportTest() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('')

  const handleGenerateTemplate = async () => {
    setIsGenerating(true)
    setStatus('正在生成企业方案Word模板...')
    
    try {
      const generator = new WordGenerator()
      await generator.generateWordDocument({
        content: '', // 空内容将使用默认的企业方案样式规范
        storeName: '企业方案模板',
        bannerImage: null, // 标准模板不使用banner图
        filename: '企业方案Word样式模板规范文档.docx',
        includeWatermark: true
      })
      setStatus('Word文档生成成功！文件已开始下载。')
    } catch (error) {
      console.error('生成Word文档失败:', error)
      setStatus('生成失败，请检查控制台错误信息。')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCustom = async () => {
    setIsGenerating(true)
    setStatus('正在生成自定义企业方案...')
    
    const customContent = `
# 1. IP核心定位与形象塑造

## 人设定位
这里是人设定位的具体内容，包括目标用户画像、品牌个性特征等关键要素。

### 创业故事线
详细描述创业历程中的关键节点和转折点，突出品牌价值观和使命。

## 标签体系
建立完整的品牌标签体系，包括核心标签、辅助标签和情感标签。

# 2. 内容策略规划

## 内容主题矩阵
根据用户需求和品牌定位，制定多维度的内容主题规划。

### 互动玩法
设计多样化的用户互动方式，提升用户参与度和品牌粘性。
`
    
    try {
      const generator = new WordGenerator()
      await generator.generateWordDocument({
        content: customContent,
        storeName: '自定义企业方案',
        bannerImage: null, // 测试页面暂时不使用banner图
        filename: `自定义企业方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`,
        includeWatermark: true
      })
      setStatus('自定义Word文档生成成功！文件已开始下载。')
    } catch (error) {
      console.error('生成Word文档失败:', error)
      setStatus('生成失败，请检查控制台错误信息。')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回主页
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Word导出测试
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Title Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              企业方案 Word 样式模板导出
            </h1>
            <p className="text-purple-100">
              严格按照Python脚本格式标准，生成专业的企业方案Word文档
            </p>
          </div>

          <div className="p-8 space-y-8">
            {/* Format Specifications */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-blue-900">
                  格式规范说明
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
                <div>
                  <h3 className="font-medium mb-3 text-blue-900">页面设置</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      纸张大小：A4（21 x 29.7 cm）
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      页边距：上下 2.54cm，左右 3.17cm
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      页眉距离：1.5cm，页脚距离：1.75cm
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-3 text-blue-900">字体标准</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      正文：思源黑体，11pt，1.5倍行距
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      一级标题：思源宋体，16-18pt，加粗
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      二级标题：思源宋体，14pt，加粗
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      三级标题：思源黑体，12pt，加粗
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-3 text-blue-900">段落格式</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      正文首行缩进 2 个字符
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      段前距离：0pt，段后距离：6pt
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      页眉页脚：LOGO + 页码居中
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      标准企业方案模板
                    </h3>
                    <p className="text-sm text-gray-500">
                      完整格式规范文档
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  生成严格按照Python脚本格式的企业方案Word样式模板规范文档，包含完整的6个章节格式说明和示例内容，适用于IP打造、品牌方案、项目规划类文档。
                </p>
                <button
                  onClick={handleGenerateTemplate}
                  disabled={isGenerating}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成标准模板'}
                </button>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      自定义内容方案
                    </h3>
                    <p className="text-sm text-gray-500">
                      实际应用示例
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  使用相同的格式标准，但包含自定义的IP打造和品牌方案内容，展示实际应用效果。包含人设定位、创业故事线、标签体系、内容策略等实用内容。
                </p>
                <button
                  onClick={handleGenerateCustom}
                  disabled={isGenerating}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成自定义方案'}
                </button>
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-md border ${
                status.includes('成功') 
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : status.includes('失败')
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
              }`}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    status.includes('成功') 
                      ? 'bg-green-400'
                      : status.includes('失败')
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                  }`}></div>
                  <p className="font-medium">{status}</p>
                </div>
              </div>
            )}

            {/* Technical Implementation */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                技术实现说明
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">严格格式对应</strong>
                      <p>完全按照Python脚本的格式标准实现，确保输出一致性</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">字体系统</strong>
                      <p>使用思源黑体和思源宋体字体系列，专业排版</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">页面布局</strong>
                      <p>A4纸张，精确的页边距和页眉页脚设置</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">内容结构</strong>
                      <p>包含6个主要章节的企业方案样式规范</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">导出功能</strong>
                      <p>基于docx库实现，支持浏览器直接下载</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <strong className="text-gray-900">兼容性</strong>
                      <p>生成的文档与Microsoft Word完全兼容</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}