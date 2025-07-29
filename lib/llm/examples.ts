/**
 * 统一多模型 LLM SDK 使用示例
 */

import { unifiedChat, smartChat, unifiedChatBatch } from './index'

// 示例1: 基础聊天 - 指定具体模型
export async function basicChatExample() {
  try {
    const response = await unifiedChat({
      model: "gemini-1.5-flash",
      messages: [
        { role: "user", content: "你好，请介绍一下你自己" }
      ]
    })
    
    console.log('模型:', response.model)
    console.log('提供商:', response.provider)
    console.log('回复:', response.content)
    return response
  } catch (error) {
    console.error('基础聊天失败:', error)
    throw error
  }
}

// 示例2: 流式聊天
export async function streamChatExample() {
  try {
    let fullContent = ''
    
    const response = await unifiedChat({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        { role: "system", content: "你是一个专业的技术写作助手" },
        { role: "user", content: "请写一篇关于 React Hooks 的技术文章" }
      ],
      stream: true,
      onData: (chunk) => {
        process.stdout.write(chunk) // 实时输出
        fullContent += chunk
      },
      onComplete: (content) => {
        console.log('\n\n=== 流式输出完成 ===')
        console.log('总长度:', content.length)
      },
      onError: (error) => {
        console.error('流式输出错误:', error.message)
      }
    })
    
    return response
  } catch (error) {
    console.error('流式聊天失败:', error)
    throw error
  }
}

// 示例3: 智能模型选择
export async function smartChatExample() {
  try {
    // 长内容生成 - 自动选择最适合的模型
    const longContentResponse = await smartChat({
      taskType: 'long_generation',
      messages: [
        { role: "user", content: "请写一份详细的项目技术方案，包括架构设计、技术选型、实施计划等" }
      ]
    })
    
    console.log('长内容生成 - 选择的模型:', longContentResponse.model)
    console.log('内容长度:', longContentResponse.content.length)
    
    // 快速响应 - 自动选择最快的模型
    const fastResponse = await smartChat({
      taskType: 'fast',
      messages: [
        { role: "user", content: "简单总结一下今天的天气" }
      ]
    })
    
    console.log('快速响应 - 选择的模型:', fastResponse.model)
    
    // 预算优先 - 自动选择最便宜的模型
    const budgetResponse = await smartChat({
      taskType: 'budget',
      messages: [
        { role: "user", content: "帮我写个简单的购物清单" }
      ]
    })
    
    console.log('预算优先 - 选择的模型:', budgetResponse.model)
    
    return { longContentResponse, fastResponse, budgetResponse }
  } catch (error) {
    console.error('智能聊天失败:', error)
    throw error
  }
}

// 示例4: 批量处理
export async function batchChatExample() {
  try {
    const requests = [
      {
        model: "gemini-1.5-flash",
        messages: [{ role: "user", content: "什么是人工智能？" }]
      },
      {
        model: "deepseek-ai/DeepSeek-V3", 
        messages: [{ role: "user", content: "什么是机器学习？" }]
      },
      {
        model: "gemini-2.0-flash-exp",
        messages: [{ role: "user", content: "什么是深度学习？" }]
      }
    ]
    
    console.log('开始批量处理...')
    const responses = await unifiedChatBatch(requests)
    
    responses.forEach((response, index) => {
      console.log(`\n=== 请求 ${index + 1} ===`)
      console.log('模型:', response.model)
      console.log('提供商:', response.provider)
      console.log('回复:', response.content.substring(0, 100) + '...')
    })
    
    return responses
  } catch (error) {
    console.error('批量聊天失败:', error)
    throw error
  }
}

// 示例5: 多轮对话
export async function multiTurnChatExample() {
  try {
    const messages = [
      { role: "system" as const, content: "你是一个专业的编程助手" },
      { role: "user" as const, content: "我想学习 TypeScript，应该从哪里开始？" }
    ]
    
    // 第一轮对话
    const firstResponse = await unifiedChat({
      model: "gemini-1.5-pro",
      messages
    })
    
    console.log('第一轮回复:', firstResponse.content.substring(0, 200) + '...')
    
    // 添加助手回复到对话历史
    messages.push({ role: "assistant", content: firstResponse.content })
    
    // 第二轮对话
    messages.push({ role: "user", content: "能给我推荐一些实践项目吗？" })
    
    const secondResponse = await unifiedChat({
      model: "gemini-1.5-pro",
      messages
    })
    
    console.log('第二轮回复:', secondResponse.content.substring(0, 200) + '...')
    
    return { firstResponse, secondResponse, messages }
  } catch (error) {
    console.error('多轮对话失败:', error)
    throw error
  }
}

// 示例6: 错误处理和重试
export async function errorHandlingExample() {
  try {
    // 尝试使用不存在的模型
    const response = await unifiedChat({
      model: "non-existent-model",
      messages: [{ role: "user", content: "测试错误处理" }]
    })
    
    return response
  } catch (error) {
    console.log('预期的错误:', error instanceof Error ? error.message : error)
    
    // 降级到默认模型
    console.log('降级到智能选择...')
    const fallbackResponse = await smartChat({
      taskType: 'default',
      messages: [{ role: "user", content: "测试错误处理和降级" }]
    })
    
    console.log('降级成功，使用模型:', fallbackResponse.model)
    return fallbackResponse
  }
}

// 示例7: 成本估算
export async function costEstimationExample() {
  const { estimateRequestCost } = await import('./utils')
  
  const inputText = "请写一篇关于人工智能发展历史的详细文章，包括重要里程碑、关键人物和技术突破。"
  const expectedOutputLength = 5000 // 预期输出长度
  
  // 估算不同模型的成本
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "deepseek-ai/DeepSeek-V3"]
  
  console.log('=== 成本估算 ===')
  models.forEach(modelId => {
    const cost = estimateRequestCost(modelId, inputText.length, expectedOutputLength)
    console.log(`${modelId}: $${cost.toFixed(4)}`)
  })
  
  // 选择最经济的模型
  const response = await smartChat({
    taskType: 'budget',
    messages: [{ role: "user", content: inputText }]
  })
  
  console.log('选择的经济模型:', response.model)
  return response
}

// 运行所有示例的函数
export async function runAllExamples() {
  console.log('🚀 开始运行统一多模型 LLM SDK 示例...\n')
  
  try {
    console.log('1. 基础聊天示例')
    await basicChatExample()
    
    console.log('\n2. 流式聊天示例')
    await streamChatExample()
    
    console.log('\n3. 智能模型选择示例')
    await smartChatExample()
    
    console.log('\n4. 批量处理示例')
    await batchChatExample()
    
    console.log('\n5. 多轮对话示例')
    await multiTurnChatExample()
    
    console.log('\n6. 错误处理示例')
    await errorHandlingExample()
    
    console.log('\n7. 成本估算示例')
    await costEstimationExample()
    
    console.log('\n✅ 所有示例运行完成！')
  } catch (error) {
    console.error('❌ 示例运行失败:', error)
  }
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllExamples()
}