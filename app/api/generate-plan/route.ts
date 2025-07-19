import { NextRequest } from 'next/server'
import { getModelById, DEFAULT_CHAT_MODEL } from '@/lib/models'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到生成方案请求`)
    const { prompt, formData, modelId, stream: enableStream = true } = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      promptLength: prompt?.length,
      modelId,
      enableStream,
      storeInfo: formData?.storeName,
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // 验证环境变量
    const apiKey = process.env.SILICONFLOW_API_KEY

    if (!apiKey) {
      console.error(`[${new Date().toISOString()}] [${requestId}] API密钥未配置`)
      return new Response(
        JSON.stringify({ error: 'API密钥未配置，请检查环境变量 SILICONFLOW_API_KEY' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 获取模型配置，如果没有指定则使用默认模型
    const selectedModel = modelId ? getModelById(modelId) : DEFAULT_CHAT_MODEL

    if (!selectedModel) {
      console.error(`[${new Date().toISOString()}] [${requestId}] 未找到模型配置: ${modelId}`)
      return new Response(
        JSON.stringify({ error: `未找到模型配置: ${modelId}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] 使用模型: ${selectedModel.name} (${selectedModel.id}), 流式模式: ${enableStream}`)

    // 构建请求体
    const requestBody = {
      model: selectedModel.id,
      messages: [
        {
          role: 'system',
          content: '你是一名资深抖音IP打造专家，擅长为商家制定专业的老板IP打造方案。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: selectedModel.maxTokens,
      temperature: selectedModel.temperature,
      top_p: selectedModel.topP,
      stream: enableStream
    }

    // 调用AI模型API
    console.log(`[${new Date().toISOString()}] [${requestId}] 调用${selectedModel.provider} API:`, selectedModel.endpoint)

    // 添加超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log(`[${new Date().toISOString()}] [${requestId}] API请求超时，中止请求`)
      controller.abort()
    }, 45000) // 45秒超时

    let response
    try {
      response = await fetch(selectedModel.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error(`[${new Date().toISOString()}] [${requestId}] API请求失败:`, fetchError)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({
            error: 'API请求超时，请稍后重试',
            model: selectedModel.name
          }),
          { status: 408, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          error: `网络请求失败: ${fetchError instanceof Error ? fetchError.message : '未知错误'}`,
          model: selectedModel.name
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] API响应状态: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`[${new Date().toISOString()}] [${requestId}] ${selectedModel.provider} API错误:`, errorData)
      return new Response(
        JSON.stringify({
          error: `API调用失败: ${response.status} ${response.statusText}`,
          model: selectedModel.name,
          details: errorData
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 如果不是流式模式，直接返回完整响应
    if (!enableStream) {
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || '生成内容为空'

      const duration = Date.now() - startTime
      console.log(`[${new Date().toISOString()}] [${requestId}] 非流式响应完成`, {
        duration: `${duration}ms`,
        contentLength: content.length
      })

      return new Response(
        JSON.stringify({
          content,
          model: selectedModel.name,
          modelId: selectedModel.id
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 流式响应处理
    console.log(`[${new Date().toISOString()}] [${requestId}] 开始流式响应处理`)
    const encoder = new TextEncoder()

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) {
            console.error(`[${new Date().toISOString()}] [${requestId}] 无法获取响应流`)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '无法获取响应流' })}\n\n`))
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          let buffer = ''
          let chunkCount = 0

          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              const duration = Date.now() - startTime
              console.log(`[${new Date().toISOString()}] [${requestId}] 流式响应完成`, {
                duration: `${duration}ms`,
                totalChunks: chunkCount
              })
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
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
                  const duration = Date.now() - startTime
                  console.log(`[${new Date().toISOString()}] [${requestId}] 收到结束标记`, {
                    duration: `${duration}ms`,
                    totalChunks: chunkCount
                  })
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                if (dataStr) {
                  try {
                    const data = JSON.parse(dataStr)
                    const content = data.choices?.[0]?.delta?.content

                    if (content) {
                      chunkCount++
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                    }
                  } catch (parseError) {
                    // 忽略解析错误，继续处理下一行
                    console.warn(`[${new Date().toISOString()}] [${requestId}] 解析流数据失败:`, parseError, 'Data:', dataStr)
                  }
                }
              }
            }
          }
        } catch (error) {
          const duration = Date.now() - startTime
          console.error(`[${new Date().toISOString()}] [${requestId}] 流处理错误:`, {
            error: error instanceof Error ? error.message : '未知错误',
            duration: `${duration}ms`
          })
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '流处理错误: ' + (error instanceof Error ? error.message : '未知错误') })}\n\n`))
          controller.close()
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
      },
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 生成方案时出错:`, {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`
    })
    return new Response(
      JSON.stringify({
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}