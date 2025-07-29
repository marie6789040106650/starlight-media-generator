"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"

// 解析关键词的工具函数 - 移到组件外部避免重复创建
const parseKeywords = (text: string): string[] => {
  if (!text) return []
  return text.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
}

// 颜色主题配置 - 提取到组件外部提升性能
const COLOR_THEMES = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    badgeHover: 'hover:bg-blue-100',
    badgeSelected: 'border-2 border-blue-400'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    text: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    badgeHover: 'hover:bg-purple-100',
    badgeSelected: 'border-2 border-purple-400'
  }
} as const

interface KeywordExpansionPanelProps {
  type?: 'storeFeatures' | 'ownerFeatures'
  keywords: string[]
  currentValue: string
  onKeywordClick: (keyword: string) => void
  onMouseLeave?: () => void
  onMouseEnter?: () => void
  colorScheme?: 'blue' | 'purple'
  dataArea?: string
  className?: string
}

export const KeywordExpansionPanel: React.FC<KeywordExpansionPanelProps> = ({
  type,
  keywords,
  currentValue,
  onKeywordClick,
  onMouseLeave,
  onMouseEnter,
  colorScheme,
  dataArea,
  className = ""
}) => {
  // 确定颜色主题：优先使用 colorScheme，其次根据 type 推断
  const theme = colorScheme || (type === 'storeFeatures' ? 'blue' : 'purple')
  const colors = COLOR_THEMES[theme]

  const currentKeywords = parseKeywords(currentValue)

  return (
    <div
      className={`mt-2 p-2 ${colors.bg} rounded-md border ${colors.border} ${className}`}
      data-keyword-area={dataArea || type}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onClick={(e) => {
        // 阻止面板容器的点击事件冒泡
        e.stopPropagation()
      }}
    >
      <p className={`text-xs ${colors.text} mb-2`}>拓展关键词（点击添加）：</p>
      <div className="flex flex-wrap gap-2">
        {keywords.slice(0, 20).map((keyword, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`bg-white ${colors.badgeBorder} ${colors.badgeText} cursor-pointer ${colors.badgeHover} ${currentKeywords.includes(keyword) ? colors.badgeSelected : ''
              }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // 确保点击时不会触发父元素的事件
              onKeywordClick(keyword)
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseUp={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  )
}