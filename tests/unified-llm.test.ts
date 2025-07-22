/**
 * 统一多模型 LLM SDK 测试
 */

import { describe, test, expect, beforeAll } from '@jest/globals'
import { unifiedChat, smartChat, unifiedChatBatch } from '@/lib/llm'
import { getModelById, selectOptimalModel } from '@/lib/models'

describe('统一多模型 LLM SDK', () => {
  beforeAll(() => {
    // 确保测试环境有必要的环境变量
    if (!process.env.SILICONFLOW_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn('警告: 没有配置 API 密钥，某些测试可能会失败')
    }
  })

  describe('unifiedChat 基础功能', () => {
    test('应该能够使用 SiliconFlow 模型进行聊天', async () => {
      if (!process.env.SILICONFLOW_API_KEY) {
        console.log('跳过 SiliconFlow 测试 - 未配置 API 密钥')
        return
      }

      const response = await unifiedChat({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { role: 'user', content: '请简单介绍一下你自己' }
        ]
      })

      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.model).toBeTruthy()
      expect(response.provider).toBe('siliconflow')
    }, 30000)

    test('应该能够使用 Google Gemini 模型进行聊天', async () => {
      if (!process.env.GOOGLE_API_KEY) {
        console.log('跳过 Gemini 测试 - 未配置 API 密钥')
        return
      }

      const response = await unifiedChat({
        model: 'gemini-1.5-flash',
        messages: [
          { role: 'user', content: '你好，请用一句话介绍你自己' }
        ]
      })

      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.model).toBeTruthy()
      expect(response.provider).toBe('google')
    }, 30000)

    test('应该能够处理不支持的模型', async () => {
      await expect(unifiedChat({
        model: 'non-existent-model',
        messages: [
          { role: 'user', content: '测试' }
        ]
      })).rejects.toThrow('不支持的模型')
    })

    test('应该能够处理流式响应', async () => {
      if (!process.env.SILICONFLOW_API_KEY) {
        console.log('跳过流式测试 - 未配置 API 密钥')
        return
      }

      let chunks: string[] = []
      let fullContent = ''

      const response = await unifiedChat({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { role: 'user', content: '请数从1到5' }
        ],
        stream: true,
        onData: (chunk) => {
          chunks.push(chunk)
          fullContent += chunk
        }
      })

      expect(response).toBeDefined()
      expect(chunks.length).toBeGreaterThan(0)
      expect(fullContent).toBeTruthy()
    }, 30000)
  })

  describe('smartChat 智能选择', () => {
    test('应该能够根据任务类型选择合适的模型', async () => {
      const taskTypes = ['fast', 'long_context', 'budget', 'experimental'] as const

      for (const taskType of taskTypes) {
        const optimalModel = selectOptimalModel(taskType)
        expect(optimalModel).toBeDefined()
        expect(optimalModel.id).toBeTruthy()
        
        console.log(`${taskType} 任务推荐模型: ${optimalModel.name} (${optimalModel.provider})`)
      }
    })

    test('应该能够使用智能选择进行聊天', async () => {
      if (!process.env.SILICONFLOW_API_KEY && !process.env.GOOGLE_API_KEY) {
        console.log('跳过智能选择测试 - 未配置 API 密钥')
        return
      }

      const response = await smartChat({
        taskType: 'fast',
        messages: [
          { role: 'user', content: '请简单回答：1+1等于几？' }
        ]
      })

      expect(response).toBeDefined()
      expect(response.content).toBeTruthy()
      expect(response.model).toBeTruthy()
      expect(response.provider).toBeTruthy()
    }, 30000)
  })

  describe('unifiedChatBatch 批量处理', () => {
    test('应该能够批量处理多个请求', async () => {
      if (!process.env.SILICONFLOW_API_KEY) {
        console.log('跳过批量测试 - 未配置 API 密钥')
        return
      }

      const requests = [
        {
          model: 'deepseek-ai/DeepSeek-V3',
          messages: [{ role: 'user' as const, content: '什么是AI？' }]
        },
        {
          model: 'deepseek-ai/DeepSeek-V3',
          messages: [{ role: 'user' as const, content: '什么是ML？' }]
        }
      ]

      const responses = await unifiedChatBatch(requests)

      expect(responses).toHaveLength(2)
      responses.forEach(response => {
        expect(response.content).toBeTruthy()
        expect(response.model).toBeTruthy()
        expect(response.provider).toBe('siliconflow')
      })
    }, 60000)
  })

  describe('错误处理', () => {
    test('应该能够处理 API 密钥缺失', async () => {
      // 临时清除环境变量
      const originalKey = process.env.SILICONFLOW_API_KEY
      delete process.env.SILICONFLOW_API_KEY

      await expect(unifiedChat({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: '测试' }]
      })).rejects.toThrow('API密钥未配置')

      // 恢复环境变量
      if (originalKey) {
        process.env.SILICONFLOW_API_KEY = originalKey
      }
    })

    test('应该能够处理网络错误', async () => {
      // 使用无效的端点测试网络错误
      const mockModel = {
        id: 'test-model',
        provider: 'siliconflow' as const,
        endpoint: 'https://invalid-endpoint.example.com/v1/chat/completions',
        name: 'Test Model',
        maxTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
        description: 'Test',
        category: 'chat' as const,
        streaming: true,
        contextWindow: 4000,
        features: [],
        status: 'active' as const
      }

      // 这个测试需要模拟网络错误，实际实现可能需要更复杂的 mock
      // 这里只是展示错误处理的结构
    })
  })

  describe('模型配置', () => {
    test('应该能够获取模型配置', () => {
      const model = getModelById('deepseek-ai/DeepSeek-V3')
      expect(model).toBeDefined()
      expect(model?.provider).toBe('siliconflow')
      expect(model?.name).toBeTruthy()
    })

    test('应该能够选择最优模型', () => {
      const fastModel = selectOptimalModel('fast')
      const longContextModel = selectOptimalModel('long_context')
      const budgetModel = selectOptimalModel('budget')

      expect(fastModel).toBeDefined()
      expect(longContextModel).toBeDefined()
      expect(budgetModel).toBeDefined()

      // 验证不同任务类型选择了不同的模型（如果有多个可用模型）
      console.log('快速响应模型:', fastModel.name)
      console.log('长上下文模型:', longContextModel.name)
      console.log('预算优先模型:', budgetModel.name)
    })
  })

  describe('工具函数', () => {
    test('应该能够估算请求成本', async () => {
      const { estimateRequestCost } = await import('@/lib/llm/utils')
      
      const cost = estimateRequestCost('gemini-1.5-flash', 1000, 2000)
      expect(typeof cost).toBe('number')
      expect(cost).toBeGreaterThanOrEqual(0)
    })

    test('应该能够根据内容长度选择模型', async () => {
      const { selectModelByContentLength } = await import('@/lib/llm/utils')
      
      const shortContentModel = selectModelByContentLength(100)
      const longContentModel = selectModelByContentLength(60000)
      
      expect(shortContentModel).toBeTruthy()
      expect(longContentModel).toBeTruthy()
      
      console.log('短内容推荐:', shortContentModel)
      console.log('长内容推荐:', longContentModel)
    })

    test('应该能够根据任务描述推荐模型', async () => {
      const { recommendModelForTask } = await import('@/lib/llm/utils')
      
      const fastTask = recommendModelForTask('快速回答一个简单问题')
      const longTask = recommendModelForTask('写一篇详细的技术文档')
      const budgetTask = recommendModelForTask('便宜的模型来处理这个任务')
      
      expect(fastTask).toBeTruthy()
      expect(longTask).toBeTruthy()
      expect(budgetTask).toBeTruthy()
      
      console.log('快速任务推荐:', fastTask)
      console.log('长内容任务推荐:', longTask)
      console.log('预算任务推荐:', budgetTask)
    })
  })
})