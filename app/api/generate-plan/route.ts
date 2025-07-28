/**
 * 生成方案 API - 使用统一多模型 SDK 优化版
 * 大幅简化代码，自动处理多提供商兼容性
 */

import { NextRequest } from 'next/server'
import { unifiedChat, smartChat } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到生成方案请求`)
    
    const { 
      prompt, 
      formData, 
      modelId, 
      stream: requestedStream = true,
      taskType = 'long_generation' // 默认使用长内容生成优化
    } = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      promptLength: prompt?.length,
      modelId,
      taskType,
      stream: requestedStream,
      storeInfo: formData?.storeName,
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // 参数验证
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: '请求内容不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 构建消息 - 统一格式
    const messages = [
      {
        role: 'system' as const,
        content: '你是一名资深抖音IP打造专家。请直接输出完整的老板IP打造方案，不要任何开场白、客套话或询问信息。直接从方案标题开始，提供详细、实用、可执行的IP打造策略。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ]

    // 流式响应处理
    if (requestedStream) {
      const encoder = new TextEncoder()
      let fullContent = ''
      let chunkCount = 0

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // 使用统一SDK - 智能选择或指定模型
            const chatFunction = modelId ? unifiedChat : smartChat
            const options = modelId 
              ? { model: modelId, messages, stream: true }
              : { taskType, messages, stream: true }

            await chatFunction({
              ...options,
              onData: (chunk: string) => {
                fullContent += chunk
                chunkCount++
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              },
              onComplete: (content: string) => {
                const duration = Date.now() - startTime
                console.log(`[${new Date().toISOString()}] [${requestId}] 生成完成`, {
                  duration: `${duration}ms`,
                  contentLength: content.length,
                  totalChunks: chunkCount
                })
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              },
              onError: (error: Error) => {
                const duration = Date.now() - startTime
                console.error(`[${new Date().toISOString()}] [${requestId}] 生成错误:`, {
                  error: error.message,
                  duration: `${duration}ms`
                })
                
                // 如果是模型不可用错误，尝试自动降级
                if (error.message.includes('付费余额') || error.message.includes('地区不可用')) {
                  console.log(`[${new Date().toISOString()}] [${requestId}] 尝试自动降级到可用模型...`)
                  // 这里会在catch块中处理降级逻辑
                  throw error
                }
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
                controller.close()
              }
            })
          } catch (error) {
            const duration = Date.now() - startTime
            console.error(`[${new Date().toISOString()}] [${requestId}] 处理异常:`, {
              error: error instanceof Error ? error.message : '未知错误',
              duration: `${duration}ms`
            })
            
            // 尝试降级处理
            try {
              console.log(`[${new Date().toISOString()}] [${requestId}] 尝试降级到智能选择...`)
              await smartChat({
                taskType: 'default',
                messages,
                stream: true,
                onData: (chunk: string) => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
                },
                onComplete: () => {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                },
                onError: (fallbackError: Error) => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `降级处理也失败: ${fallbackError.message}` })}\n\n`))
                  controller.close()
                }
              })
            } catch (fallbackError) {
              controller.error(fallbackError)
            }
          }
        }
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    } else {
      // 非流式响应
      try {
        const chatFunction = modelId ? unifiedChat : smartChat
        const options = modelId 
          ? { model: modelId, messages }
          : { taskType, messages }

        const response = await chatFunction(options)

        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] [${requestId}] 生成完成`, {
          duration: `${duration}ms`,
          model: response.model,
          provider: response.provider,
          contentLength: response.content.length
        })

        return new Response(
          JSON.stringify({
            content: response.content,
            model: response.model,
            provider: response.provider,
            modelId: response.model,
            requestId,
            duration,
            usage: response.usage
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        // 尝试降级处理
        console.log(`[${new Date().toISOString()}] [${requestId}] 尝试降级到智能选择...`)
        try {
          const fallbackResponse = await smartChat({
            taskType: 'default',
            messages
          })

          const duration = Date.now() - startTime
          console.log(`[${new Date().toISOString()}] [${requestId}] 降级处理成功`, {
            duration: `${duration}ms`,
            model: fallbackResponse.model,
            provider: fallbackResponse.provider
          })

          return new Response(
            JSON.stringify({
              content: fallbackResponse.content,
              model: fallbackResponse.model,
              provider: fallbackResponse.provider,
              modelId: fallbackResponse.model,
              requestId,
              duration,
              fallback: true,
              originalError: error instanceof Error ? error.message : '未知错误'
            }),
            { headers: { 'Content-Type': 'application/json' } }
          )
        } catch (fallbackError) {
          throw fallbackError
        }
      }
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 生成方案失败:`, {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    })

    return new Response(
      JSON.stringify({
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误',
        requestId,
        duration
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}