"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { FormData, ExpandedKeywords } from "@/lib/types"
import { KeywordExpansionPanel } from "../keyword-expansion-panel"
import { useKeywordField } from "@/hooks/use-keyword-field"

interface FeatureFieldsProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  expandedKeywords: ExpandedKeywords | null
  focusedField: string | null
  setFocusedField: (field: string | null) => void
  onKeywordExpansion: () => void
}

export const FeatureFields: React.FC<FeatureFieldsProps> = ({
  formData,
  onInputChange,
  expandedKeywords,
  focusedField,
  setFocusedField,
  onKeywordExpansion
}) => {
  const {
    handleKeywordClick,
    handleFieldFocus,
    handleFieldBlur,
    handleDelayedHide,
    handleMouseEnter
  } = useKeywordField({
    formData,
    onInputChange,
    onKeywordExpansion,
    setFocusedField
  })

  return (
    <>
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

        {/* 店铺特色关键词拓展 */}
        {focusedField === 'storeFeatures' && expandedKeywords?.expanded_store_features && (
          <KeywordExpansionPanel
            keywords={expandedKeywords.expanded_store_features}
            currentValue={formData.storeFeatures}
            onKeywordClick={(keyword) => handleKeywordClick('storeFeatures', keyword)}
            onMouseLeave={handleDelayedHide}
            onMouseEnter={handleMouseEnter}
            colorScheme="blue"
            dataArea="storeFeatures"
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

          {/* 老板特色关键词拓展 */}
          {focusedField === 'ownerFeatures' && expandedKeywords?.expanded_boss_features && (
            <KeywordExpansionPanel
              keywords={expandedKeywords.expanded_boss_features}
              currentValue={formData.ownerFeatures}
              onKeywordClick={(keyword) => handleKeywordClick('ownerFeatures', keyword)}
              onMouseLeave={handleDelayedHide}
              onMouseEnter={handleMouseEnter}
              colorScheme="purple"
              dataArea="ownerFeatures"
            />
          )}
        </div>
      </div>
    </>
  )
}