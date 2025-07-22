/**
 * 聊天 API - 使用统一多模型 SDK 优化版
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedChat, smartChat } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到聊天请求`)
    
    const { 
      messages, 
      model, 
      taskType,
      temperature,
      max_tokens,
      top_p,
      stream = false,
      ...options 
    } = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      messagesCount: messages?.length,
      model,
      taskType,
      stream,
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // 验证必需参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages参数是必需的，且必须是非空数组' },
        { status: 400 }
      )
    }

    try {
      // 使用统一SDK - 智能选择或指定模型
      const chatFunction = model ? unifiedChat : smartChat
      const chatOptions = model 
        ? { 
            model, 
            messages, 
            temperature,
            maxTokens: max_tokens,
            topP: top_p,
            stream 
          }
        : { 
            taskType: taskType || 'default', 
            messages, 
            temperature,
            maxTokens: max_tokens,
            topP: top_p,
            stream 
          }

      const response = await chatFunction(chatOptions)

      const duration = Date.now() - startTime
      console.log(`[${new Date().toISOString()}] [${requestId}] 聊天完成`, {
        duration: `${duration}ms`,
        model: response.model,
        provider: response.provider,
        contentLength: response.content.length
      })

      // 返回兼容原格式的响应
      return NextResponse.json({
        choices: [{
          message: {
            role: 'assistant',
            content: response.content
          },
          finish_reason: 'stop'
        }],
        model: response.model,
        provider: response.provider,
        usage: response.usage,
        requestId,
        duration
      })

    } catch (error) {
      // 尝试降级处理
      console.log(`[${new Date().toISOString()}] [${requestId}] 尝试降级到智能选择...`)
      
      try {
        const fallbackResponse = await smartChat({
          taskType: 'default',
          messages,
          temperature,
          maxTokens: max_tokens,
          topP: top_p
        })

        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] [${requestId}] 降级处理成功`, {
          duration: `${duration}ms`,
          model: fallbackResponse.model,
          provider: fallbackResponse.provider
        })

        return NextResponse.json({
          choices: [{
            message: {
              role: 'assistant',
              content: fallbackResponse.content
            },
            finish_reason: 'stop'
          }],
          model: fallbackResponse.model,
          provider: fallbackResponse.provider,
          usage: fallbackResponse.usage,
          requestId,
          duration,
          fallback: true,
          originalError: error instanceof Error ? error.message : '未知错误'
        })

      } catch (fallbackError) {
        throw fallbackError
      }
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 聊天API错误:`, {
      error: error instanceof Error ? error.message : '未知错误',
      duration: `${duration}ms`
    })

    return NextResponse.json(
      { 
        error: '服务器内部错误', 
        details: error instanceof Error ? error.message : '未知错误',
        requestId,
        duration
      },
      { status: 500 }
    )
  }
}