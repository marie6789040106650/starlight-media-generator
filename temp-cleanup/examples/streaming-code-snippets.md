# 流式输出代码片段示例

## 1. OpenAI GPT 流式响应 (Vercel Edge Function)

```typescript
// app/api/chat-stream/route.ts
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
```

## 2. 基础流式响应 (API Route)

```typescript
// app/api/stream/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendChunk = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: data })}\n\n`));
      };
      
      // 模拟流式输出
      const messages = [
        "开始处理请求...",
        "正在分析数据...",
        "生成内容中...",
        "处理完成！"
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < messages.length) {
          sendChunk(messages[index]);
          index++;
        } else {
          controller.close();
          clearInterval(interval);
        }
      }, 1000);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}
```

## 2. Server-Sent Events (SSE)

```typescript
// app/api/sse/route.ts
export async function GET() {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };
      
      // 发送初始连接事件
      sendEvent('connected', { message: '连接已建立' });
      
      // 定期发送数据
      let count = 0;
      const interval = setInterval(() => {
        count++;
        sendEvent('update', { 
          count, 
          timestamp: new Date().toISOString(),
          message: `第 ${count} 次更新`
        });
        
        if (count >= 10) {
          sendEvent('complete', { message: '数据传输完成' });
          controller.close();
          clearInterval(interval);
        }
      }, 500);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 3. React 客户端流式接收组件

```typescript
// components/chat-streaming.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatStreaming() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentResponse('');

    // 创建 AbortController 用于取消请求
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage.content }
          ],
          model: 'gpt-4',
          temperature: 0.7,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // 流式响应结束，保存完整消息
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: accumulatedContent,
                timestamp: Date.now(),
              };
              setMessages(prev => [...prev, assistantMessage]);
              setCurrentResponse('');
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.content;
              
              if (content) {
                accumulatedContent += content;
                setCurrentResponse(accumulatedContent);
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Streaming error:', error);
        // 显示错误消息
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后重试。',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsStreaming(false);
      setCurrentResponse('');
      abortControllerRef.current = null;
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-70 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {/* 显示当前流式响应 */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-gray-100 text-gray-800">
              <div className="whitespace-pre-wrap">{currentResponse}</div>
              <div className="flex items-center mt-2">
                <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs text-gray-500 ml-2">正在输入...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的消息... (Enter 发送，Shift+Enter 换行)"
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStreaming ? '发送中...' : '发送'}
            </button>
            {isStreaming && (
              <button
                onClick={stopStreaming}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                停止
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 4. WebSocket 流式通信

```typescript
// app/api/websocket/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(request);
  
  socket.onopen = () => {
    console.log('WebSocket 连接已建立');
    
    // 开始流式发送数据
    let count = 0;
    const interval = setInterval(() => {
      count++;
      socket.send(JSON.stringify({
        type: 'stream',
        data: `流式数据 #${count}`,
        timestamp: Date.now()
      }));
      
      if (count >= 20) {
        socket.send(JSON.stringify({
          type: 'complete',
          message: '流式传输完成'
        }));
        clearInterval(interval);
      }
    }, 200);
  };

  socket.onmessage = (event) => {
    console.log('收到消息:', event.data);
  };

  socket.onclose = () => {
    console.log('WebSocket 连接已关闭');
  };

  return response;
}
```

## 5. 自定义 Hook：useStreamingChat

```typescript
// hooks/use-streaming-chat.ts
import { useState, useCallback, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface StreamingChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemMessage?: string;
}

interface StreamingState {
  messages: ChatMessage[];
  currentResponse: string;
  isStreaming: boolean;
  error: string | null;
}

export function useStreamingChat(options: StreamingChatOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    messages: [],
    currentResponse: '',
    isStreaming: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || state.isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      error: null,
      isStreaming: true,
      currentResponse: '',
    }));

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 构建消息历史
      const messages = [
        ...(options.systemMessage ? [{ role: 'system' as const, content: options.systemMessage }] : []),
        ...state.messages.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user' as const, content: userMessage.content }
      ];

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: options.model || 'gpt-4',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2000,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // 流式响应结束
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: accumulatedContent,
                timestamp: Date.now(),
              };
              
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                currentResponse: '',
                isStreaming: false,
              }));
              return;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.content;
              
              if (content) {
                accumulatedContent += content;
                setState(prev => ({
                  ...prev,
                  currentResponse: accumulatedContent,
                }));
              }
            } catch (e) {
              console.warn('Failed to parse streaming data:', data);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Streaming error:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : '未知错误',
          isStreaming: false,
          currentResponse: '',
        }));
      }
    }
  }, [state.messages, state.isStreaming, options]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      currentResponse: '',
      isStreaming: false,
      error: null,
    });
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...state.messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage && !state.isStreaming) {
      // 移除最后的助手消息（如果有的话）
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter((msg, index) => 
          index < prev.messages.length - 1 || msg.role === 'user'
        ),
      }));
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, state.isStreaming, sendMessage]);

  return {
    ...state,
    sendMessage,
    stopStreaming,
    clearMessages,
    retryLastMessage,
  };
}
```

## 6. 使用示例

```typescript
// components/streaming-example.tsx
'use client';

import { useStreaming } from '@/hooks/use-streaming';

export default function StreamingExample() {
  const { data, isStreaming, error, startStream, clearData } = useStreaming();

  const handleStart = () => {
    startStream({
      url: '/api/stream',
      method: 'POST',
      body: { message: '开始流式处理' }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleStart}
          disabled={isStreaming}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isStreaming ? '处理中...' : '开始流式输出'}
        </button>
        
        <button
          onClick={clearData}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          清空数据
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          错误: {error}
        </div>
      )}

      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 border rounded-lg animate-fade-in"
          >
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </div>
        ))}
      </div>

      {isStreaming && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">正在接收数据...</span>
        </div>
      )}
    </div>
  );
}
```