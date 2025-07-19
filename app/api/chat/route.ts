import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'deepseek-ai/DeepSeek-V3', ...options } = await request.json()

    // 验证环境变量
    const apiKey = process.env.SILICONFLOW_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量 SILICONFLOW_API_KEY' },
        { status: 500 }
      )
    }

    // 验证必需参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages参数是必需的，且必须是非空数组' },
        { status: 400 }
      )
    }

    // 构建请求体
    const requestBody = {
      model,
      messages,
      max_tokens: options.max_tokens || 4000,
      temperature: options.temperature || 0.7,
      top_p: options.top_p || 0.9,
      stream: options.stream || false,
      ...options
    }

    // 调用硅基流动 Chat Completions API
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('硅基流动API错误:', errorData)
      return NextResponse.json(
        { error: `API调用失败: ${response.status} ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('文本对话API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}