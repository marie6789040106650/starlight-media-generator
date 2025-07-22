import { useState, useCallback, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  requestId?: string;
}

interface StreamingChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemMessage?: string;
  provider?: 'openai' | 'siliconflow';
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

interface StreamingState {
  messages: ChatMessage[];
  currentResponse: string;
  isStreaming: boolean;
  error: string | null;
  requestId: string | null;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  rateLimited: boolean;
  retryAfter: number | null;
}

interface StreamChunkData {
  content?: string;
  error?: string;
  requestId?: string;
  timestamp?: number;
}

export function useStreamingChat(options: StreamingChatOptions = {}) {
  const [state, setState] = useState<StreamingState>({
    messages: [],
    currentResponse: '',
    isStreaming: false,
    error: null,
    requestId: null,
    connectionStatus: 'idle',
    rateLimited: false,
    retryAfter: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (content: string, retryCount: number = 0) => {
    if (!content.trim() || state.isStreaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // 只在第一次发送时添加用户消息
    if (retryCount === 0) {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        error: null,
        isStreaming: true,
        currentResponse: '',
        connectionStatus: 'connecting'
      }));
      
      options.onStreamStart?.();
    } else {
      setState(prev => ({
        ...prev,
        error: null,
        isStreaming: true,
        currentResponse: '',
        connectionStatus: 'connecting'
      }));
    }

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      // 构建消息历史
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        ...(options.systemMessage ? [{ role: 'system' as const, content: options.systemMessage }] : []),
        ...state.messages.map(msg => ({ role: msg.role, content: msg.content })),
        ...(retryCount === 0 ? [{ role: 'user' as const, content: userMessage.content }] : [])
      ];

      const requestBody = {
        messages,
        model: options.model || 'deepseek-ai/DeepSeek-V3',
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        provider: options.provider || 'siliconflow'
      };

      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // 处理速率限制
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
          setState(prev => ({
            ...prev,
            rateLimited: true,
            retryAfter,
            error: `请求过于频繁，请等待 ${retryAfter} 秒后重试`,
            isStreaming: false,
            connectionStatus: 'error'
          }));
          
          // 自动重试
          setTimeout(() => {
            setState(prev => ({ ...prev, rateLimited: false, retryAfter: null }));
            sendMessage(content, retryCount + 1);
          }, retryAfter * 1000);
          
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setState(prev => ({ ...prev, connectionStatus: 'connected' }));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      const requestId = response.headers.get('X-Request-ID') || undefined;

      setState(prev => ({ ...prev, requestId: requestId || null }));

      let lastActivityTime = Date.now();
      const timeoutDuration = 30000; // 30秒超时
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // 流结束但没有收到[DONE]标记，可能是连接中断
          if (accumulatedContent) {
            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: accumulatedContent,
              timestamp: Date.now(),
              requestId
            };
            
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, assistantMessage],
              currentResponse: '',
              isStreaming: false,
              connectionStatus: 'idle'
            }));
            
            options.onMessage?.(assistantMessage);
            options.onStreamEnd?.();
          }
          break;
        }
        
        lastActivityTime = Date.now();
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // 流式响应正常结束
              const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: accumulatedContent,
                timestamp: Date.now(),
                requestId
              };
              
              setState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                currentResponse: '',
                isStreaming: false,
                connectionStatus: 'idle'
              }));
              
              options.onMessage?.(assistantMessage);
              options.onStreamEnd?.();
              retryCountRef.current = 0;
              return;
            }
            
            try {
              const parsed: StreamChunkData = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setState(prev => ({
                  ...prev,
                  currentResponse: accumulatedContent,
                }));
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', data, parseError);
            }
          }
        }
        
        // 检查超时
        if (Date.now() - lastActivityTime > timeoutDuration) {
          throw new Error('流式响应超时');
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        setState(prev => ({
          ...prev,
          isStreaming: false,
          connectionStatus: 'idle'
        }));
      } else {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('Streaming error:', error);
        
        // 自动重试逻辑
        if (retryCount < maxRetries && !errorMessage.includes('400')) {
          console.log(`Retrying request (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            sendMessage(content, retryCount + 1);
          }, Math.pow(2, retryCount) * 1000); // 指数退避
          return;
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isStreaming: false,
          currentResponse: '',
          connectionStatus: 'error'
        }));
        
        options.onError?.(errorMessage);
      }
    }
  }, [state.messages, state.isStreaming, options]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      connectionStatus: 'idle'
    }));
  }, []);

  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      messages: [],
      currentResponse: '',
      isStreaming: false,
      error: null,
      requestId: null,
      connectionStatus: 'idle',
      rateLimited: false,
      retryAfter: null
    });
    retryCountRef.current = 0;
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
        error: null
      }));
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, state.isStreaming, sendMessage]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const removeMessage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  }, []);

  const editMessage = useCallback((index: number, newContent: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => 
        i === index ? { ...msg, content: newContent } : msg
      )
    }));
  }, []);

  return {
    ...state,
    sendMessage: useCallback((content: string) => sendMessage(content, 0), [sendMessage]),
    stopStreaming,
    clearMessages,
    retryLastMessage,
    clearError,
    removeMessage,
    editMessage,
    // 统计信息
    messageCount: state.messages.length,
    hasError: !!state.error,
    canRetry: !state.isStreaming && !!state.error && !state.rateLimited,
    isConnected: state.connectionStatus === 'connected',
    // 速率限制状态
    isRateLimited: state.rateLimited,
    retryAfterSeconds: state.retryAfter,
    // 连接状态检查
    isIdle: state.connectionStatus === 'idle',
    isConnecting: state.connectionStatus === 'connecting',
    hasConnectionError: state.connectionStatus === 'error'
  };
}