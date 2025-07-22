/**
 * 流式聊天 API - 使用统一多模型 SDK 优化版
 * 大幅简化代码，移除复杂的提供商抽象层
 */

import { NextRequest, NextResponse } from 'next/server'
import { unifiedChat, smartChat } from '@/lib/llm'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  taskType?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到流式聊天请求`)
    
    const {
      messages,
      model,
      taskType,
      temperature,
      max_tokens,
      top_p
    }: ChatRequest = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      messagesCount: messages?.length,
      model,
      taskType,
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // 验证请求数据
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse('Invalid messages format', { status: 400 })
    }

    // 创建流式响应
    const encoder = new TextEncoder()
    let totalChunks = 0
    let totalContent = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用统一SDK - 智能选择或指定模型
          const chatFunction = model ? unifiedChat : smartChat
          const chatOptions = model 
            ? { 
                model, 
                messages, 
                stream: true,
                temperature,
                maxTokens: max_tokens,
                topP: top_p
              }
            : { 
                taskType: taskType || 'default', 
                messages, 
                stream: true,
                temperature,
                maxTokens: max_tokens,
                topP: top_p
              }

          await chatFunction({
            ...chatOptions,
            onData: (chunk: string) => {
              totalChunks++
              totalContent += chunk

              // 转发内容到客户端
              const responseData = {
                content: chunk,
                timestamp: Date.now(),
                requestId
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseData)}\n\n`))
            },
            onComplete: (content: string) => {
              const duration = Date.now() - startTime
              console.log(`[${new Date().toISOString()}] [${requestId}] 流式聊天完成`, {
                duration: `${duration}ms`,
                totalChunks,
                contentLength: content.length
              })
              
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            },
            onError: (error: Error) => {
              const duration = Date.now() - startTime
              console.error(`[${new Date().toISOString()}] [${requestId}] 流式聊天错误:`, {
                error: error.message,
                duration: `${duration}ms`
              })

              // 发送错误信息到客户端
              const errorData = {
                error: error.message,
                requestId,
                timestamp: Date.now()
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
              controller.close()
            }
          })

        } catch (error) {
          // 尝试降级处理
          console.log(`[${new Date().toISOString()}] [${requestId}] 尝试降级到智能选择...`)
          
          try {
            await smartChat({
              taskType: 'default',
              messages,
              stream: true,
              temperature,
              maxTokens: max_tokens,
              topP: top_p,
              onData: (chunk: string) => {
                const responseData = {
                  content: chunk,
                  timestamp: Date.now(),
                  requestId,
                  fallback: true
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(responseData)}\n\n`))
              },
              onComplete: (content: string) => {
                const duration = Date.now() - startTime
                console.log(`[${new Date().toISOString()}] [${requestId}] 降级流式处理成功`, {
                  duration: `${duration}ms`,
                  contentLength: content.length
                })
                
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              },
              onError: (fallbackError: Error) => {
                console.error(`[${new Date().toISOString()}] [${requestId}] 降级处理也失败:`, fallbackError.message)
                
                const errorData = {
                  error: `降级处理失败: ${fallbackError.message}`,
                  requestId,
                  timestamp: Date.now()
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
                controller.close()
              }
            })
          } catch (fallbackError) {
            console.error(`[${new Date().toISOString()}] [${requestId}] 降级处理异常:`, fallbackError)
            controller.error(fallbackError)
          }
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Request-ID': requestId
      },
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 流式聊天API错误:`, {
      error: error instanceof Error ? error.message : '未知错误',
      duration: `${duration}ms`
    })

    if (error instanceof Error && error.name === 'TimeoutError') {
      return new NextResponse('Request timeout', { status: 408 })
    }

    return new NextResponse('Internal server error', { status: 500 })
  }
}