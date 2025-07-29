import { useState, useRef, useEffect } from 'react'

export function useFocusManagement() {
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFieldFocus = (fieldName: string) => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setFocusedField(fieldName)
  }

  const handleFieldBlur = (fieldName: string, relatedTarget?: HTMLElement | null) => {
    // Check if focus moved to keyword area
    if (!relatedTarget || !relatedTarget.closest(`[data-keyword-area="${fieldName}"]`)) {
      setFocusedField(null)
    }
  }

  const handleKeywordAreaLeave = () => {
    setFocusedField(null)
  }

  const handleKeywordAreaEnter = () => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  return {
    focusedField,
    setFocusedField,
    handleFieldFocus,
    handleFieldBlur,
    handleKeywordAreaLeave,
    handleKeywordAreaEnter
  }
}