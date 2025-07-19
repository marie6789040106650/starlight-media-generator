"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormData } from "@/lib/types"

interface BulkInputSectionProps {
  formData: FormData
  setFormData?: (data: FormData) => void
}

// 解析批量输入文本的工具函数
const parseBulkInput = (text: string): Partial<FormData> => {
  const lines = text.split('\n');
  const newFormData: Partial<FormData> = {};

  lines.forEach(line => {
    const [key, value] = line.split(/[：:]/);
    if (!key || !value) return;
    
    const trimmedKey = key.trim();
    const trimmedValue = value.trim();

    if (trimmedKey.includes('店名') || trimmedKey.includes('店的名字')) {
      newFormData.storeName = trimmedValue;
    } else if (trimmedKey.includes('品类') || trimmedKey.includes('店的品类')) {
      newFormData.storeCategory = trimmedValue;
    } else if (trimmedKey.includes('位置') || trimmedKey.includes('地点') || trimmedKey.includes('店的位置')) {
      newFormData.storeLocation = trimmedValue;
    } else if (trimmedKey.includes('开店时长') || trimmedKey.includes('时长')) {
      newFormData.businessDuration = trimmedValue;
    } else if (trimmedKey.includes('店铺特色') || trimmedKey.includes('店的特色')) {
      newFormData.storeFeatures = trimmedValue;
    } else if (trimmedKey.includes('老板姓氏') || trimmedKey.includes('老板') || trimmedKey.includes('老板贵姓')) {
      newFormData.ownerName = trimmedValue;
    } else if (trimmedKey.includes('老板特色') || trimmedKey.includes('老板的特色')) {
      newFormData.ownerFeatures = trimmedValue;
    }
  });

  return newFormData;
}

export const BulkInputSection: React.FC<BulkInputSectionProps> = ({
  formData,
  setFormData
}) => {
  const [showBulkInput, setShowBulkInput] = useState(false)
  const [bulkInputText, setBulkInputText] = useState("")

  const handleBulkInputSubmit = () => {
    if (!setFormData) return;
    
    if (!bulkInputText.trim()) {
      const defaultData: FormData = {
        storeName: "馋嘴老张麻辣烫",
        storeCategory: "餐饮",
        storeLocation: "北京市朝阳区望京SOHO",
        businessDuration: "5年",
        storeFeatures: "秘制汤底、地域食材、现制模式、健康定制、主题沉浸、网红装修",
        ownerName: "张",
        ownerFeatures: "匠人、传承、学霸、宠粉"
      };
      setFormData(defaultData);
      setShowBulkInput(false);
      setBulkInputText('');
      return;
    }

    const parsedData = parseBulkInput(bulkInputText);
    const newFormData = { ...formData, ...parsedData };
    setFormData(newFormData);
    setShowBulkInput(false);
    setBulkInputText('');
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="bg-green-500 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          </div>
          <Label className="text-base font-medium text-green-800">
            批量输入识别
          </Label>
        </div>
        <Button
          variant={showBulkInput ? "default" : "outline"}
          size="sm"
          className={showBulkInput ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-300 text-green-700 hover:bg-green-50"}
          onClick={() => setShowBulkInput(!showBulkInput)}
        >
          {showBulkInput ? "收起 ↑" : "展开 ↓"}
        </Button>
      </div>

      <p className="text-sm text-green-600 mb-2">
        粘贴商家信息，一键自动识别并填写到对应字段
      </p>

      {showBulkInput && (
        <div className="space-y-3 mt-3 border-t border-green-200 pt-3">
          <Textarea
            placeholder="粘贴商家信息，格式如下：
店的名字：馋嘴老张麻辣烫
店的品类：餐饮
店的位置：北京市朝阳区望京SOHO
开店时长：5年
店的特色：秘制汤底、地域食材、现制模式、健康定制、主题沉浸、网红装修
老板贵姓：张
老板的特色：匠人、传承、学霸、宠粉"
            value={bulkInputText}
            onChange={(e) => setBulkInputText(e.target.value)}
            className="border-green-200 focus:border-green-500 focus:ring-green-500 min-h-[150px]"
          />
          <Button
            onClick={handleBulkInputSubmit}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 text-base font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            自动识别并填写
          </Button>
        </div>
      )}
    </div>
  )
}