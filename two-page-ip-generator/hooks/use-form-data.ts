import { useState, useCallback } from 'react'
import { FormData, ExpandedKeywords } from '@/lib/types'
import { INITIAL_FORM_DATA } from '@/lib/constants'

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [expandedKeywords, setExpandedKeywords] = useState<ExpandedKeywords | null>(null)
  const [isExpandingKeywords, setIsExpandingKeywords] = useState(false)
  const [enableKeywordExpansion, setEnableKeywordExpansion] = useState(false)

  // 页面间状态管理 - 适配两页面结构
  const [currentPage, setCurrentPage] = useState<'form' | 'result'>('form')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 直接执行关键词拓展函数，不使用防抖
  const expandKeywords = useCallback((storeFeatures: string, ownerFeatures: string) => {
    console.log('触发关键词拓展:', storeFeatures, ownerFeatures);
    setIsExpandingKeywords(true);
    fetch('/api/expand-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeFeatures: storeFeatures || '',
        ownerFeatures: ownerFeatures || ''
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('关键词拓展结果:', data);
        setExpandedKeywords(data);
        setIsExpandingKeywords(false);
      })
      .catch(error => {
        console.error('关键词拓展出错:', error);
        setIsExpandingKeywords(false);
      });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)
  }

  // 页面导航函数
  const navigateToResult = useCallback(() => {
    setCurrentPage('result')
  }, [])

  const navigateToForm = useCallback(() => {
    setCurrentPage('form')
  }, [])

  // 重置表单状态
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setExpandedKeywords(null)
    setGeneratedContent('')
    setCurrentPage('form')
  }, [])

  return {
    formData,
    setFormData,
    expandedKeywords,
    setExpandedKeywords,
    isExpandingKeywords,
    setIsExpandingKeywords,
    enableKeywordExpansion,
    setEnableKeywordExpansion,
    handleInputChange,
    // 页面状态管理
    currentPage,
    setCurrentPage,
    navigateToResult,
    navigateToForm,
    generatedContent,
    setGeneratedContent,
    isGenerating,
    setIsGenerating,
    resetForm
  }
}