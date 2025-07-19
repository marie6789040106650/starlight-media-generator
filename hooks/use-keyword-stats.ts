"use client"

import { useState, useEffect } from 'react'

interface KeywordStats {
  storeCategories: Record<string, number>
  storeFeatures: Record<string, number>
  ownerFeatures: Record<string, number>
  categoryFeatureMapping: Record<string, Record<string, number>>
}

interface UseKeywordStatsReturn {
  keywordStats: KeywordStats
  updateKeywordStats: (formData: any) => Promise<void>
  getPopularCategories: () => string[]
  getPopularFeaturesForCategory: (category: string) => string[]
  getPopularOwnerFeatures: () => string[]
  isLoading: boolean
  error: string | null
}

export function useKeywordStats(): UseKeywordStatsReturn {
  const [keywordStats, setKeywordStats] = useState<KeywordStats>({
    storeCategories: {},
    storeFeatures: {},
    ownerFeatures: {},
    categoryFeatureMapping: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载关键词统计数据
  useEffect(() => {
    loadKeywordStats()
  }, [])

  const loadKeywordStats = async () => {
    try {
      const response = await fetch('/api/keyword-stats')
      if (response.ok) {
        const data = await response.json()
        setKeywordStats(data)
      }
    } catch (err) {
      console.error('加载关键词统计失败:', err)
    }
  }

  // 解析关键词的工具函数
  const parseKeywords = (text: string): string[] => {
    if (!text) return []
    return text.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
  }

  // 更新关键词统计
  const updateKeywordStats = async (formData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/keyword-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeCategory: formData.storeCategory,
          storeFeatures: formData.storeFeatures,
          ownerFeatures: formData.ownerFeatures
        }),
      })

      if (!response.ok) {
        throw new Error('更新关键词统计失败')
      }

      const updatedStats = await response.json()
      setKeywordStats(updatedStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新关键词统计失败'
      setError(errorMessage)
      console.error('更新关键词统计失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 获取所有店铺品类，按拼音/字母排序
  const getPopularCategories = (): string[] => {
    return Object.entries(keywordStats.storeCategories)
      .map(([category]) => category)
      .sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }

  // 获取特定品类下最受欢迎的店铺特色关键词
  const getPopularFeaturesForCategory = (category: string): string[] => {
    const categoryFeatures = keywordStats.categoryFeatureMapping[category] || {}
    return Object.entries(categoryFeatures)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // 取前20个最受欢迎的
      .map(([feature]) => feature)
  }

  // 获取最受欢迎的老板特色关键词
  const getPopularOwnerFeatures = (): string[] => {
    return Object.entries(keywordStats.ownerFeatures)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20) // 取前20个最受欢迎的
      .map(([feature]) => feature)
  }

  return {
    keywordStats,
    updateKeywordStats,
    getPopularCategories,
    getPopularFeaturesForCategory,
    getPopularOwnerFeatures,
    isLoading,
    error
  }
}