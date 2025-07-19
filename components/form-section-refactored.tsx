"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Settings } from "lucide-react"
import { FormData, ExpandedKeywords } from "@/lib/types"
import { CHAT_MODELS } from "@/lib/models"
import { useKeywordStats } from "@/hooks/use-keyword-stats"
import { useFocusManagement } from "@/hooks/use-focus-management"
import { StoreInfoFields } from "@/components/form-fields/store-info-fields"
import { FeatureFields } from "@/components/form-fields/feature-fields"
import { BulkInputSection } from "@/components/bulk-input-section"

interface FormSectionProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  expandedKeywords: ExpandedKeywords | null
  isExpandingKeywords: boolean
  enableKeywordExpansion: boolean
  onToggleKeywordExpansion: (enabled: boolean) => void
  selectedModelId: string
  onModelChange: (modelId: string) => void
  showModelSettings: boolean
  onToggleModelSettings: () => void
  isLoading: boolean
  error: string
  onSubmit: () => void
  setFormData?: (data: FormData) => void
  setExpandedKeywords?: (keywords: ExpandedKeywords | null) => void
  setIsExpandingKeywords?: (loading: boolean) => void
}

export const FormSectionRefactored: React.FC<FormSectionProps> = ({
  formData,
  onInputChange,
  expandedKeywords,
  isExpandingKeywords,
  enableKeywordExpansion,
  onToggleKeywordExpansion,
  selectedModelId,
  onModelChange,
  showModelSettings,
  onToggleModelSettings,
  isLoading,
  error,
  onSubmit,
  setFormData,
  setExpandedKeywords,
  setIsExpandingKeywords
}) => {
  const {
    focusedField,
    setFocusedField,
    handleFieldFocus,
    handleFieldBlur,
    handleKeywordAreaLeave,
    handleKeywordAreaEnter
  } = useFocusManagement()

  const {
    keywordStats,
    updateKeywordStats,
    getPopularCategories,
    getPopularFeaturesForCategory,
    getPopularOwnerFeatures,
    isLoading: isStatsLoading,
    error: statsError
  } = useKeywordStats()

  // Auto-trigger keyword expansion on focus
  const handleKeywordExpansion = () => {
    if (!isExpandingKeywords && setIsExpandingKeywords && setExpandedKeywords) {
      setIsExpandingKeywords(true)
      fetch('/api/expand-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeFeatures: formData.storeFeatures || '',
          ownerFeatures: formData.ownerFeatures || '',
          storeCategory: formData.storeCategory || ''
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('关键词拓展结果:', data)
          setExpandedKeywords(data)
          setIsExpandingKeywords(false)
        })
        .catch(error => {
          console.error('关键词拓展出错:', error)
          setIsExpandingKeywords(false)
        })
    }
  }

  // Get categories for dropdown
  const categories = [
    "餐饮", "服务业", "教育培训", "美业", "零售", "其他",
    ...getPopularCategories()
  ]

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          商家信息填写
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm sm:text-base">
          请填写以下信息，我们将为您生成专业的老板IP打造方案
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Store Information Fields */}
        <StoreInfoFields
          formData={formData}
          onInputChange={onInputChange}
          categories={categories}
        />

        {/* Feature Fields with Keyword Expansion */}
        <FeatureFields
          formData={formData}
          onInputChange={onInputChange}
          expandedKeywords={expandedKeywords}
          focusedField={focusedField}
          setFocusedField={setFocusedField}
          onKeywordExpansion={handleKeywordExpansion}
        />

        {/* Bulk Input Section */}
        <BulkInputSection
          onDataParsed={(data) => {
            if (setFormData) {
              setFormData(data)
            }
          }}
        />

        {/* Keyword Expansion Loading Indicator */}
        {isExpandingKeywords && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span>正在加载关键词...</span>
            </div>
          </div>
        )}

        {/* AI Model Selection */}
        <ModelSelectionSection
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
          showModelSettings={showModelSettings}
          onToggleModelSettings={onToggleModelSettings}
        />

        {/* Submit Button */}
        <SubmitSection
          isLoading={isLoading}
          error={error}
          onSubmit={onSubmit}
        />
      </CardContent>
    </Card>
  )
}

// Separate components for better organization
const ModelSelectionSection: React.FC<{
  selectedModelId: string
  onModelChange: (modelId: string) => void
  showModelSettings: boolean
  onToggleModelSettings: () => void
}> = ({ selectedModelId, onModelChange, showModelSettings, onToggleModelSettings }) => (
  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-orange-800">
          🤖 AI模型选择
        </Label>
        <p className="text-xs text-orange-600">
          选择不同的AI模型来生成专业方案，默认使用DeepSeek-V3
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleModelSettings}
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Settings className="h-4 w-4 mr-1" />
          {showModelSettings ? "收起" : "设置"}
        </Button>
      </div>
    </div>

    {showModelSettings && (
      <div className="mt-3 pt-3 border-t border-orange-200">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-orange-700">选择AI模型</Label>
            <Select value={selectedModelId} onValueChange={onModelChange}>
              <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                <SelectValue placeholder="选择AI模型" />
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )}
  </div>
)

const SubmitSection: React.FC<{
  isLoading: boolean
  error: string
  onSubmit: () => void
}> = ({ isLoading, error, onSubmit }) => (
  <div className="pt-4">
    {error && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )}
    
    <Button
      onClick={onSubmit}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-base font-medium"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          正在生成方案...
        </div>
      ) : (
        <>
          <ArrowRight className="w-4 h-4 mr-2" />
          生成专业方案
        </>
      )}
    </Button>
  </div>
)