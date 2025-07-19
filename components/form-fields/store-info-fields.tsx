"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CategoryDropdown } from "@/components/category-dropdown"
import { FormData } from "@/lib/types"

interface StoreInfoFieldsProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  categories: string[]
}

export const StoreInfoFields: React.FC<StoreInfoFieldsProps> = ({
  formData,
  onInputChange,
  categories
}) => {
  return (
    <>
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
          <CategoryDropdown
            value={formData.storeCategory}
            onChange={(value) => onInputChange("storeCategory", value)}
            categories={categories}
            label="店的品类"
            placeholder="请选择或输入行业类型"
            required
          />
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
    </>
  )
}