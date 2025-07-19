"use client"

import { useCallback, useRef, useEffect } from "react"
import { FormData } from "@/lib/types"

// 移动到组件外部，避免重复创建 - 性能优化
const parseKeywords = (text: string): string[] => {
  if (!text) return []
  return text.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
}

interface UseKeywordFieldProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  onKeywordExpansion: () => void
  setFocusedField: (field: string | null) => void
}

export const useKeywordField = ({
  formData,
  onInputChange,
  onKeywordExpansion,
  setFocusedField
}: UseKeywordFieldProps) => {
  // 使用 ref 跟踪 timeout，避免内存泄漏
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleKeywordClick = useCallback((field: string, keyword: string) => {
    try {
      // 立即取消任何待执行的隐藏操作
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      const fieldValue = formData[field as keyof FormData]
      const currentValue = typeof fieldValue === 'string' ? fieldValue : ''
      const currentKeywords = parseKeywords(currentValue)

      if (!currentKeywords.includes(keyword)) {
        const newValue = currentValue ? `${currentValue}、${keyword}` : keyword
        onInputChange(field, newValue)
      }

      // 点击后重新设置延迟隐藏，给用户时间继续选择
      timeoutRef.current = setTimeout(() => {
        setFocusedField(null)
        timeoutRef.current = null
      }, 5000) // 增加到5秒，给用户更多时间

    } catch (error) {
      console.warn('Error handling keyword click:', error)
    }
  }, [formData, onInputChange, setFocusedField])

  const handleFieldFocus = useCallback((field: string) => {
    setFocusedField(field)
    onKeywordExpansion()
  }, [setFocusedField, onKeywordExpansion])

  const handleFieldBlur = useCallback((e: React.FocusEvent, field: string) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !relatedTarget.closest(`[data-keyword-area="${field}"]`)) {
      // 延迟隐藏，给点击事件时间执行
      timeoutRef.current = setTimeout(() => {
        setFocusedField(null)
        timeoutRef.current = null
      }, 200)
    }
  }, [setFocusedField])

  const handleDelayedHide = useCallback(() => {
    // 清除之前的 timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setFocusedField(null)
      timeoutRef.current = null
    }, 3000) // 3秒延迟
  }, [setFocusedField])

  // 添加鼠标进入处理，取消隐藏定时器
  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // 立即隐藏处理
  const handleImmediateHide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setFocusedField(null)
  }, [setFocusedField])

  // 清理 timeout 防止内存泄漏
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    parseKeywords,
    handleKeywordClick,
    handleFieldFocus,
    handleFieldBlur,
    handleDelayedHide,
    handleMouseEnter,
    handleImmediateHide
  }
}