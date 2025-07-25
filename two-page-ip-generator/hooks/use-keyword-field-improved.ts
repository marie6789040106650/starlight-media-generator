"use client"

import { useCallback, useRef, useEffect } from "react"
import { FormData } from "@/lib/types"
import { KEYWORD_SEPARATORS } from "@/lib/constants"

// Constants for better maintainability
const TIMEOUT_CONFIG = {
  BLUR_DELAY: 200,        // Short delay for blur to allow click events
  MOUSE_LEAVE_DELAY: 3000, // Medium delay when mouse leaves
  AFTER_CLICK_DELAY: 5000, // Long delay after successful click
} as const

// Utility functions moved outside component for performance
const parseKeywords = (text: string): string[] => {
  if (!text?.trim()) return []
  return text
    .split(KEYWORD_SEPARATORS)
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0)
}

const isValidKeywordInput = (field: string, keyword: string): boolean => {
  return Boolean(field?.trim() && keyword?.trim())
}

interface UseKeywordFieldProps {
  formData: FormData
  onInputChange: (field: string, value: string) => void
  onKeywordExpansion: () => void
  setFocusedField: (field: string | null) => void
}

interface TimeoutManager {
  clear: () => void
  set: (callback: () => void, delay: number) => void
}

export const useKeywordField = ({
  formData,
  onInputChange,
  onKeywordExpansion,
  setFocusedField
}: UseKeywordFieldProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Centralized timeout management
  const timeoutManager: TimeoutManager = {
    clear: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    },
    set: (callback: () => void, delay: number) => {
      timeoutManager.clear()
      timeoutRef.current = setTimeout(callback, delay)
    }
  }

  const hidePanel = useCallback(() => {
    setFocusedField(null)
  }, [setFocusedField])

  const handleKeywordClick = useCallback((field: string, keyword: string) => {
    if (!isValidKeywordInput(field, keyword)) {
      console.warn('Invalid field or keyword provided:', { field, keyword })
      return
    }

    try {
      timeoutManager.clear() // Cancel any pending hide operations

      const fieldValue = formData[field as keyof FormData]
      const currentValue = typeof fieldValue === 'string' ? fieldValue : ''
      const currentKeywords = parseKeywords(currentValue)

      // Avoid duplicate keywords
      if (!currentKeywords.includes(keyword.trim())) {
        const newValue = currentValue 
          ? `${currentValue}、${keyword.trim()}` 
          : keyword.trim()
        onInputChange(field, newValue)
      }

      // Set longer delay after successful click to allow multiple selections
      timeoutManager.set(hidePanel, TIMEOUT_CONFIG.AFTER_CLICK_DELAY)
      
    } catch (error) {
      console.error(`Failed to handle keyword click for field "${field}":`, error)
    }
  }, [formData, onInputChange, hidePanel, timeoutManager])

  const handleFieldFocus = useCallback((field: string) => {
    timeoutManager.clear()
    setFocusedField(field)
    onKeywordExpansion()
  }, [setFocusedField, onKeywordExpansion, timeoutManager])

  const handleFieldBlur = useCallback((e: React.FocusEvent, field: string) => {
    const relatedTarget = e.relatedTarget as HTMLElement
    const isClickingInKeywordArea = relatedTarget?.closest(`[data-keyword-area="${field}"]`)
    
    if (!isClickingInKeywordArea) {
      // Short delay to allow click events to fire before hiding
      timeoutManager.set(hidePanel, TIMEOUT_CONFIG.BLUR_DELAY)
    }
  }, [hidePanel, timeoutManager])

  const handleDelayedHide = useCallback(() => {
    timeoutManager.set(hidePanel, TIMEOUT_CONFIG.MOUSE_LEAVE_DELAY)
  }, [hidePanel, timeoutManager])

  const handleMouseEnter = useCallback(() => {
    timeoutManager.clear()
  }, [timeoutManager])

  const handleImmediateHide = useCallback(() => {
    timeoutManager.clear()
    hidePanel()
  }, [hidePanel, timeoutManager])

  // Cleanup on unmount
  useEffect(() => {
    return () => timeoutManager.clear()
  }, [timeoutManager])

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