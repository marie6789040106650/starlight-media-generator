import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // 使用 Edge Runtime

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// 配置常量
const CONFIG = {
  DEFAULT_MODEL: 'deepseek-ai/DeepSeek-V3', // 使用项目推荐的主要模型
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 2000,
  TIMEOUT: 30000,
} as const;

// API提供商策略接口
interface StreamProvider {
  endpoint: string;
  getHeaders(apiKey: string): Record<string, string>;
  formatRequest(request: ChatRequest): any;
  parseStreamChunk(chunk: string): string | null;
}

// OpenAI兼容的提供商实现
class OpenAICompatibleProvider implements StreamProvider {
  constructor(
    public endpoint: string = 'https://api.openai.com/v1/chat/completions',
    private apiKeyEnv: string = 'OPENAI_API_KEY'
  ) {}

  getHeaders(apiKey: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  formatRequest(request: ChatRequest): any {
    return {
      model: request.model || CONFIG.DEFAULT_MODEL,
      messages: request.messages,
      temperature: request.temperature || CONFIG.DEFAULT_TEMPERATURE,
      max_tokens: request.max_tokens || CONFIG.DEFAULT_MAX_TOKENS,
      stream: true,
    };
  }

  parseStreamChunk(data: string): string | null {
    if (data === '[DONE]') return null;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.choices?.[0]?.delta?.content || null;
    } catch (e) {
      console.warn('Failed to parse chunk:', data);
      return null;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'gpt-4', temperature = 0.7, max_tokens = 2000 }: ChatRequest = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse('OpenAI API key not configured', { status: 500 });
    }

    // 调用 OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true, // 关键：启用流式响应
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new NextResponse(`OpenAI API error: ${error}`, { status: response.status });
    }

    // 创建流式响应
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // 发送结束标记
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    // 转发内容到客户端
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch (e) {
                  // 忽略解析错误，继续处理
                  console.warn('Failed to parse chunk:', data);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Chat stream error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}