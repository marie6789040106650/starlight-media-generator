import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'black-forest-labs/FLUX.1-schnell', ...options } = await request.json()

    // 验证环境变量
    const apiKey = process.env.SILICONFLOW_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置，请检查环境变量 SILICONFLOW_API_KEY' },
        { status: 500 }
      )
    }

    // 验证必需参数
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt参数是必需的，且必须是字符串' },
        { status: 400 }
      )
    }

    // 构建请求体
    const requestBody = {
      model,
      prompt,
      n: options.n || 1,
      size: options.size || '1800x600',
      quality: options.quality || 'standard',
      response_format: options.response_format || 'url',
      format: options.format || 'jpg', // 添加格式选项，默认为jpg
      ...options
    }

    // 调用硅基流动 Images API
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('硅基流动图片生成API错误:', errorData)
      return NextResponse.json(
        { error: `API调用失败: ${response.status} ${response.statusText}`, details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('图片生成API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}