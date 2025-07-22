"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import { ArrowRight, Settings } from "lucide-react"
import { FormData, ExpandedKeywords } from "@/lib/types"
import { CHAT_MODELS, getAvailableChatModels } from "@/lib/models"
import { useKeywordStats } from "@/hooks/use-keyword-stats"
import { useKeywordField } from "@/hooks/use-keyword-field-improved"
import { BulkInputSection } from "./bulk-input-section"
import { KeywordExpansionPanel } from "./keyword-expansion-panel"


interface FormSectionProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  expandedKeywords: ExpandedKeywords | null
  isExpandingKeywords: boolean
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

export const FormSection: React.FC<FormSectionProps> = ({
  formData,
  onInputChange,
  expandedKeywords,
  isExpandingKeywords,
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
  // 添加焦点状态管理
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 关键词统计功能
  const {
    getPopularCategories
  } = useKeywordStats()

  // 关键词字段处理功能
  const {
    handleKeywordClick,
    handleFieldFocus,
    handleFieldBlur,
    handleDelayedHide,
    handleMouseEnter
  } = useKeywordField({
    formData,
    onInputChange,
    onKeywordExpansion: () => {
      if (setIsExpandingKeywords && setExpandedKeywords) {
        setIsExpandingKeywords(true);
        // 关键词拓展逻辑
        fetch('/api/expand-keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeType: formData.storeType || formData.storeCategory,
            storeFeatures: formData.storeFeatures,
            targetAudience: formData.targetAudience || '',
            businessGoals: formData.businessGoals || ''
          })
        })
          .then(res => res.json())
          .then(data => {
            setExpandedKeywords(data);
            setIsExpandingKeywords(false);
          })
          .catch(error => {
            console.error('关键词拓展出错:', error);
            setIsExpandingKeywords(false);
          });
      }
    },
    setFocusedField
  })



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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeName" className="text-sm font-medium text-gray-700">
              店的名字 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="storeName"
              placeholder="如：馋嘴老张麻辣烫"
              value={formData.storeName}
              onChange={(e) => onInputChange("storeName", e.target.value)}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeCategory" className="text-sm font-medium text-gray-700">
              店的品类 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="relative">
                <Input
                  id="storeCategory"
                  placeholder="请选择或输入行业类型"
                  value={formData.storeCategory}
                  onChange={(e) => onInputChange("storeCategory", e.target.value)}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                  onClick={() => {
                    const dropdown = document.getElementById('custom-category-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}
                  onFocus={() => {
                    const dropdown = document.getElementById('custom-category-dropdown');
                    if (dropdown) {
                      dropdown.classList.remove('hidden');
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      const dropdown = document.getElementById('custom-category-dropdown');
                      if (dropdown) {
                        dropdown.classList.add('hidden');
                      }
                    }, 200);
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={() => {
                    const dropdown = document.getElementById('custom-category-dropdown');
                    if (dropdown) {
                      dropdown.classList.toggle('hidden');
                    }
                  }}>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div
                id="custom-category-dropdown"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg hidden"
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                {(() => {
                  const fixedCategories = ["餐饮", "服务业", "教育培训", "美业", "零售", "其他"];
                  const dynamicCategories = getPopularCategories();
                  const allCategories = [...new Set([...fixedCategories, ...dynamicCategories])];
                  const sortedCategories = allCategories.sort((a, b) => a.localeCompare(b, 'zh-CN'));

                  return sortedCategories.map((category, index) => (
                    <div
                      key={index}
                      className={`px-4 py-2 cursor-pointer hover:bg-purple-50 ${formData.storeCategory === category ? 'bg-purple-100' : ''}`}
                      onClick={() => {
                        onInputChange("storeCategory", category);
                        const dropdown = document.getElementById('custom-category-dropdown');
                        if (dropdown) {
                          dropdown.classList.add('hidden');
                        }
                      }}
                    >
                      {category}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="storeLocation" className="text-sm font-medium text-gray-700">
              店的位置 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="storeLocation"
              placeholder="如：北京市朝阳区望京SOHO"
              value={formData.storeLocation}
              onChange={(e) => onInputChange("storeLocation", e.target.value)}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDuration" className="text-sm font-medium text-gray-700">
              开店时长 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessDuration"
              placeholder="如：5年"
              value={formData.businessDuration}
              onChange={(e) => onInputChange("businessDuration", e.target.value)}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeFeatures" className="text-sm font-medium text-gray-700">
            店的特色 <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="storeFeatures"
            placeholder="如：地道手工汤底、回头客多"
            value={formData.storeFeatures}
            onChange={(e) => onInputChange("storeFeatures", e.target.value)}
            onFocus={() => handleFieldFocus('storeFeatures')}
            onBlur={(e) => handleFieldBlur(e, 'storeFeatures')}
            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
          />

          {focusedField === 'storeFeatures' && expandedKeywords?.expanded_store_features && (
            <KeywordExpansionPanel
              type="storeFeatures"
              keywords={expandedKeywords.expanded_store_features}
              currentValue={formData.storeFeatures}
              onKeywordClick={(keyword) => handleKeywordClick('storeFeatures', keyword)}
              onMouseLeave={handleDelayedHide}
              onMouseEnter={handleMouseEnter}
            />
          )}
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
              老板贵姓 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ownerName"
              placeholder="如：张"
              value={formData.ownerName}
              onChange={(e) => onInputChange("ownerName", e.target.value)}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerFeatures" className="text-sm font-medium text-gray-700">
              老板的特色 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ownerFeatures"
              placeholder="如：东北口音亲和力强、厨艺出众"
              value={formData.ownerFeatures}
              onChange={(e) => onInputChange("ownerFeatures", e.target.value)}
              onFocus={() => handleFieldFocus('ownerFeatures')}
              onBlur={(e) => handleFieldBlur(e, 'ownerFeatures')}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />

            {focusedField === 'ownerFeatures' && expandedKeywords?.expanded_boss_features && (
              <KeywordExpansionPanel
                type="ownerFeatures"
                keywords={expandedKeywords.expanded_boss_features}
                currentValue={formData.ownerFeatures}
                onKeywordClick={(keyword) => handleKeywordClick('ownerFeatures', keyword)}
                onMouseLeave={handleDelayedHide}
                onMouseEnter={handleMouseEnter}
              />
            )}
          </div>
        </div>
        {/* 批量输入功能 */}
        <BulkInputSection
          formData={formData}
          setFormData={setFormData}
        />
        {/* 关键词拓展加载指示器 */}
        {isExpandingKeywords && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span>正在加载关键词...</span>
            </div>
          </div>
        )}

        {/* 模型选择 */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-orange-800">
                🤖 模型选择
              </Label>
              <p className="text-xs text-orange-600">
                选择不同的模型来生成专业方案，默认使用DeepSeek-V3
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
                  <Label className="text-sm font-medium text-orange-700">选择模型</Label>
                  <Select value={selectedModelId} onValueChange={onModelChange}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableChatModels().map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {model.name}
                            </span>
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

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 生成按钮 */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-base font-medium"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>正在生成方案...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>生成专业方案</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}