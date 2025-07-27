"use client"

import { useState } from "react"
import { DEFAULT_CHAT_MODEL } from "@/lib/models"
import { REQUIRED_FIELDS } from "@/lib/constants"
import { PageHeader } from "@/components/page-header"
import { ProgressSteps } from "@/components/progress-steps"
import { FormSection } from "@/components/form-section"
import { ContentRenderer } from "@/components/content-renderer"
import { SmartWordRenderer } from "@/components/smart-word-renderer"
import { TocNavigation } from "@/components/toc-navigation"
import { useFormData } from "@/hooks/use-form-data"
import { usePlanGeneration } from "@/hooks/use-plan-generation"
import { useBannerImage } from "@/hooks/use-banner-image"
import { useToc } from "@/hooks/use-toc"
import { useKeywordStats } from "@/hooks/use-keyword-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedExportWithWatermark } from "@/components/enhanced-export-with-watermark"

import { ArrowLeft, RefreshCw } from "lucide-react"



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
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleNextStep}
                  className="flex-1 lg:flex-none min-w-[120px] h-11 text-sm font-medium border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成
                </Button>

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
              {/* Smart Word Style Document */}
              <SmartWordRenderer
                content={generatedContent}
                formData={formData}
                bannerImage={bannerImage}
                isGeneratingBanner={isGeneratingBanner}
                isStreaming={isGenerating}
              />
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