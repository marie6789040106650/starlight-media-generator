import { useState } from 'react'
import { FormData, ExpandedKeywords } from '@/lib/types'
import { REQUIRED_FIELDS } from '@/lib/constants'
import { generatePrompt } from '@/lib/utils'

export const usePlanGeneration = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const generatePlanWithStream = async (
    formData: FormData,
    enableKeywordExpansion: boolean,
    selectedModelId: string,
    setExpandedKeywords: (keywords: ExpandedKeywords | null) => void,
    setIsExpandingKeywords: (loading: boolean) => void,
    onChunk: (chunk: string) => void,
    onComplete: (finalContent: string) => void
  ) => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] generatePlanWithStream 开始`, {
      storeName: formData.storeName,
      enableKeywordExpansion,
      selectedModelId
    })

    // 验证必填字段
    const emptyFields = REQUIRED_FIELDS.filter(({ field }) => !formData[field as keyof FormData]?.trim())

    if (emptyFields.length > 0) {
      const missingFieldNames = emptyFields.map(({ label }) => label).join('、')
      const errorMsg = `请填写以下必填信息：${missingFieldNames}`
      console.error(`[${new Date().toISOString()}] 验证失败:`, errorMsg)
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setIsLoading(true)
    setError("")

    try {
      // 使用用户输入的数据
      let currentFormData = { ...formData }
      let storeFeatures = currentFormData.storeFeatures
      let ownerFeatures = currentFormData.ownerFeatures

      // 如果启用了关键词拓展，先进行关键词拓展
      if (enableKeywordExpansion) {
        console.log(`[${new Date().toISOString()}] 开始关键词拓展`)
        setIsExpandingKeywords(true)
        try {
          const expandResponse = await fetch('/api/expand-keywords', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeFeatures: currentFormData.storeFeatures,
              ownerFeatures: currentFormData.ownerFeatures
            }),
          })

          if (expandResponse.ok) {
            const expandData = await expandResponse.json()
            console.log(`[${new Date().toISOString()}] 关键词拓展成功`, expandData)
            setExpandedKeywords(expandData)

            // 使用拓展后的关键词
            if (expandData.expanded_store_features && expandData.expanded_store_features.length > 0) {
              storeFeatures = expandData.expanded_store_features.join('、')
            }

            if (expandData.expanded_boss_features && expandData.expanded_boss_features.length > 0) {
              ownerFeatures = expandData.expanded_boss_features.join('、')
            }
          } else {
            console.warn(`[${new Date().toISOString()}] 关键词拓展失败，将使用原始关键词`)
          }
        } catch (expandError) {
          console.error(`[${new Date().toISOString()}] 关键词拓展出错:`, expandError)
          // 出错时使用原始关键词，不中断流程
        } finally {
          setIsExpandingKeywords(false)
        }
      }

      // 构建AI提示词
      const prompt = generatePrompt(currentFormData, storeFeatures, ownerFeatures)
      console.log(`[${new Date().toISOString()}] 开始流式生成`, {
        promptLength: prompt.length,
        modelId: selectedModelId
      })

      // 流式生成内容
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          formData: currentFormData,
          modelId: selectedModelId,
          stream: true
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[${new Date().toISOString()}] API请求失败:`, {
          status: response.status,
          statusText: response.statusText,
          errorText
        })
        throw new Error(`生成方案失败: ${response.status} ${response.statusText}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log(`[${new Date().toISOString()}] 流式响应完成`, {
            duration: `${Date.now() - startTime}ms`,
            totalLength: fullContent.length
          })
          onComplete(fullContent)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim()
            
            if (dataStr === '[DONE]') {
              console.log(`[${new Date().toISOString()}] 收到结束标记`)
              onComplete(fullContent)
              return
            }

            if (dataStr) {
              try {
                const data = JSON.parse(dataStr)
                if (data.content) {
                  fullContent += data.content
                  onChunk(data.content)
                } else if (data.error) {
                  console.error(`[${new Date().toISOString()}] 流式响应错误:`, data.error)
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.warn(`[${new Date().toISOString()}] 解析流数据失败:`, parseError, 'Data:', dataStr)
              }
            }
          }
        }
      }

    } catch (error) {
      console.error(`[${new Date().toISOString()}] generatePlanWithStream 错误:`, error)
      setError(error instanceof Error ? error.message : '生成方案时出错')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const generatePlan = async (
    formData: FormData,
    enableKeywordExpansion: boolean,
    selectedModelId: string,
    setExpandedKeywords: (keywords: ExpandedKeywords | null) => void,
    setIsExpandingKeywords: (loading: boolean) => void,
    returnContent: boolean = false
  ) => {
    // 验证必填字段
    const emptyFields = REQUIRED_FIELDS.filter(({ field }) => !formData[field as keyof FormData]?.trim())

    if (emptyFields.length > 0) {
      const missingFieldNames = emptyFields.map(({ label }) => label).join('、')
      setError(`请填写以下必填信息：${missingFieldNames}`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // 使用用户输入的数据
      let currentFormData = { ...formData }
      let storeFeatures = currentFormData.storeFeatures
      let ownerFeatures = currentFormData.ownerFeatures

      // 如果启用了关键词拓展，先进行关键词拓展
      if (enableKeywordExpansion) {
        setIsExpandingKeywords(true)
        try {
          const expandResponse = await fetch('/api/expand-keywords', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              storeFeatures: currentFormData.storeFeatures,
              ownerFeatures: currentFormData.ownerFeatures
            }),
          })

          if (expandResponse.ok) {
            const expandData = await expandResponse.json()
            setExpandedKeywords(expandData)

            // 使用拓展后的关键词
            if (expandData.expanded_store_features && expandData.expanded_store_features.length > 0) {
              storeFeatures = expandData.expanded_store_features.join('、')
            }

            if (expandData.expanded_boss_features && expandData.expanded_boss_features.length > 0) {
              ownerFeatures = expandData.expanded_boss_features.join('、')
            }
          } else {
            console.warn('关键词拓展失败，将使用原始关键词')
          }
        } catch (expandError) {
          console.error('关键词拓展出错:', expandError)
          // 出错时使用原始关键词，不中断流程
        } finally {
          setIsExpandingKeywords(false)
        }
      }

      // 构建AI提示词
      const prompt = generatePrompt(currentFormData, storeFeatures, ownerFeatures)

      if (returnContent) {
        // 直接生成内容并返回
        console.log('发送API请求到 /api/generate-plan')
        
        // 添加超时控制
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时

        try {
          const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt,
              formData: currentFormData,
              modelId: selectedModelId,
              stream: false
            }),
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          console.log('API响应状态:', response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('API错误响应:', errorText)
            throw new Error(`生成方案失败: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          console.log('API响应数据:', data)
          
          if (!data.content) {
            throw new Error('API返回的内容为空')
          }
          
          return data.content
        } catch (fetchError: unknown) {
          clearTimeout(timeoutId)
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('请求超时，请检查网络连接后重试')
          }
          throw fetchError
        }
      } else {
        // 准备跳转参数
        const finalFormData = {
          ...currentFormData,
          storeFeatures,
          ownerFeatures
        }

        // 构建跳转URL，使用流式生成
        const params = new URLSearchParams({
          prompt: prompt,
          formData: encodeURIComponent(JSON.stringify(finalFormData)),
          modelId: selectedModelId
        })

        // 跳转到结果页面进行流式生成
        window.location.href = `/result?${params.toString()}`
      }

    } catch (error) {
      console.error('准备生成方案时出错:', error)
      setError('准备生成方案时出错，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    generatePlan,
    generatePlanWithStream
  }
}