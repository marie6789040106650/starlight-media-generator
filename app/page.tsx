"use client"

import { useState } from "react"
import { DEFAULT_CHAT_MODEL } from "@/lib/models"
import { REQUIRED_FIELDS } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { ProgressSteps } from "@/components/progress-steps"
import { FormSection } from "@/components/form-section"
import { ContentRenderer } from "@/components/content-renderer"
import { TocNavigation } from "@/components/toc-navigation"
import { useFormData } from "@/hooks/use-form-data"
import { usePlanGeneration } from "@/hooks/use-plan-generation"
import { useBannerImage } from "@/hooks/use-banner-image"
import { useToc } from "@/hooks/use-toc"
import { useKeywordStats } from "@/hooks/use-keyword-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EnhancedExportWithWatermark } from "@/components/enhanced-export-with-watermark"

import { ArrowLeft, RefreshCw, ChevronDown, FileImage } from "lucide-react"



export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_CHAT_MODEL.id)
  const [showModelSettings, setShowModelSettings] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFloatingToc, setShowFloatingToc] = useState(false)
  const {
    formData,
    expandedKeywords,
    isExpandingKeywords,
    handleInputChange,
    setExpandedKeywords,
    setIsExpandingKeywords,
    setFormData
  } = useFormData()

  // 始终启用关键词拓展功能
  const enableKeywordExpansion = true

  const { isLoading, error, generatePlanWithStream } = usePlanGeneration()

  const {
    bannerImage,
    isGeneratingBanner,
    generateBannerImage
  } = useBannerImage()

  const {
    tocItems,
    activeSection,
    scrollToHeading
  } = useToc(generatedContent, currentStep)

  const { updateKeywordStats } = useKeywordStats()



  const handleNextStep = async () => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] 开始生成方案`, {
      formData: {
        storeName: formData.storeName,
        storeCategory: formData.storeCategory,
        storeLocation: formData.storeLocation
      },
      selectedModelId,
      enableKeywordExpansion
    })

    // 检查商家信息是否已填写
    const emptyFields = REQUIRED_FIELDS.filter(({ field }) => !(formData as any)[field]?.trim())

    if (emptyFields.length > 0) {
      const missingFieldNames = emptyFields.map(({ label }) => label).join('、')
      alert(`请填写以下必填信息：${missingFieldNames}`)
      return
    }

    // 先跳转到下一个页面
    setCurrentStep(2)
    setIsGenerating(true)
    setGeneratedContent("") // 清空之前的内容

    try {
      // 更新关键词统计 - 确保统计店铺品类、特色和老板特色
      console.log(`[${new Date().toISOString()}] 更新关键词统计`)
      await updateKeywordStats({
        storeCategory: formData.storeCategory,
        storeFeatures: formData.storeFeatures,
        ownerFeatures: formData.ownerFeatures
      })

      await generatePlanWithStream(
        formData,
        enableKeywordExpansion,
        selectedModelId,
        setExpandedKeywords,
        setIsExpandingKeywords,
        (chunk) => {
          // 流式更新内容
          setGeneratedContent(prev => prev + chunk)
        },
        (finalContent) => {
          // 生成完成后的回调
          const endTime = Date.now()
          console.log(`[${new Date().toISOString()}] 方案生成完成`, {
            duration: `${endTime - startTime}ms`,
            contentLength: finalContent.length
          })

          // 生成Banner图片
          if (!bannerImage && !isGeneratingBanner) {
            console.log(`[${new Date().toISOString()}] 开始生成Banner图片`)
            generateBannerImage(finalContent, formData)
          }
        }
      )
    } catch (error) {
      const endTime = Date.now()
      console.error(`[${new Date().toISOString()}] 生成方案失败`, {
        duration: `${endTime - startTime}ms`,
        error: error instanceof Error ? error.message : '未知错误',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`生成方案时出错: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBackToForm = () => {
    setCurrentStep(1)
    setGeneratedContent("")
  }

  const handleRegenerateBanner = async () => {
    if (!generatedContent) {
      alert('请先生成方案内容')
      return
    }
    
    console.log(`[${new Date().toISOString()}] 重新生成Banner图片`)
    await generateBannerImage(generatedContent, formData)
  }







  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-x-hidden">
      <PageHeader />

      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <ProgressSteps currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                老板IP打造方案生成器
              </h1>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                填写您的店铺信息，系统将为您量身定制专业的IP打造方案
              </p>
              <div className="mt-6 flex justify-center">
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-3 rounded-full">
                  <span className="text-purple-700 font-medium text-sm">✨ 专业定制 · 精准营销 · 快速生成</span>
                </div>
              </div>
            </div>

            <FormSection
              formData={formData}
              onInputChange={handleInputChange}
              expandedKeywords={expandedKeywords}
              isExpandingKeywords={isExpandingKeywords}
              selectedModelId={selectedModelId}
              onModelChange={(modelId: string) => setSelectedModelId(modelId)}
              showModelSettings={showModelSettings}
              onToggleModelSettings={() => setShowModelSettings(!showModelSettings)}
              isLoading={isLoading || isGenerating}
              error={error}
              onSubmit={handleNextStep}
              setFormData={setFormData}
              setExpandedKeywords={setExpandedKeywords}
              setIsExpandingKeywords={setIsExpandingKeywords}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex-1">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{formData.storeName || "店铺名称"} - 老板IP打造方案</h2>
                <p className="text-sm lg:text-base text-gray-600">由星光传媒专业团队为您量身定制 · 智能生成 · 专业可靠</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:gap-4 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleBackToForm}
                  className="flex-1 lg:flex-none min-w-[120px] h-11 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  修改信息
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="default"
                      className="flex-1 lg:flex-none min-w-[120px] h-11 text-sm font-medium border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      重新生成
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={handleNextStep}
                      disabled={isGenerating}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <div className="flex flex-col">
                        <span>重新生成方案</span>
                        <span className="text-xs text-gray-500">重新生成完整IP方案</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRegenerateBanner}
                      disabled={isGeneratingBanner || !generatedContent}
                      className="cursor-pointer"
                    >
                      <FileImage className="h-4 w-4 mr-2" />
                      <div className="flex flex-col">
                        <span>重新生成banner图</span>
                        <span className="text-xs text-gray-500">仅重新生成Banner图片</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <EnhancedExportWithWatermark
                  content={generatedContent}
                  storeName={formData.storeName || "店铺"}
                  bannerImage={bannerImage}
                  disabled={!generatedContent}
                  className="text-xs sm:text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-8">
              {/* Combined Banner and Content */}
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                {/* Banner Image */}
                {(bannerImage || isGeneratingBanner) && (
                  <CardContent className="p-0">
                    {isGeneratingBanner ? (
                      <div className="w-full h-64 bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-purple-700 font-medium">正在生成专属Banner图...</p>
                        </div>
                      </div>
                    ) : bannerImage ? (
                      <div className="relative w-full h-64 overflow-hidden">
                        <img
                          src={bannerImage}
                          alt="方案Banner图"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="text-center text-white">
                            <h3 className="text-2xl font-bold mb-2">{formData.storeName} IP打造方案</h3>
                            <p className="text-lg opacity-90">专业定制 · 精准营销</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                )}

                {/* Content Section */}

                <CardContent>
                  {generatedContent ? (
                    <div className="prose prose-lg max-w-none">
                      <ContentRenderer content={generatedContent} />
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 bg-purple-600 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">正在生成专业方案</h3>
                      <p className="text-gray-600">正在为您量身定制IP打造方案，请稍候...</p>
                      <div className="mt-4 flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮目录 */}
      {tocItems.length > 0 && (
        <TocNavigation
          tocItems={tocItems}
          activeSection={activeSection}
          showFloatingToc={showFloatingToc}
          setShowFloatingToc={setShowFloatingToc}
          scrollToHeading={scrollToHeading}
        />
      )}


    </div>
  )
}