import { useState, useCallback } from 'react'
import { ExpandedKeywords } from '@/lib/types'

export const useKeywordExpansion = () => {
  const [expandedKeywords, setExpandedKeywords] = useState<ExpandedKeywords | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)

  const expandKeywords = useCallback(async (
    storeFeatures: string,
    ownerFeatures: string,
    storeCategory: string
  ) => {
    if (isExpanding) return

    setIsExpanding(true)
    try {
      const response = await fetch('/api/expand-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeFeatures: storeFeatures || '',
          ownerFeatures: ownerFeatures || '',
          storeCategory: storeCategory || ''
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to expand keywords')
      }

      const data = await response.json()
      console.log('关键词拓展结果:', data)
      setExpandedKeywords(data)
    } catch (error) {
      console.error('关键词拓展出错:', error)
    } finally {
      setIsExpanding(false)
    }
  }, [isExpanding])

  const clearExpandedKeywords = useCallback(() => {
    setExpandedKeywords(null)
  }, [])

  return {
    expandedKeywords,
    isExpanding,
    expandKeywords,
    clearExpandedKeywords,
    setExpandedKeywords
  }
}