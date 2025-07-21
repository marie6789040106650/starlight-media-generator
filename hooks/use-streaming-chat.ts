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