/**
 * useStreamingChat Hook 测试
 * 验证TypeScript类型和错误处理
 */

import { renderHook, act } from '@testing-library/react';
import { useStreamingChat } from '../../hooks/use-streaming-chat';

// Mock fetch
global.fetch = jest.fn();

describe('useStreamingChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初始状态正确', () => {
    const { result } = renderHook(() => useStreamingChat());
    
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentResponse).toBe('');
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.connectionStatus).toBe('idle');
    expect(result.current.rateLimited).toBe(false);
    expect(result.current.retryAfter).toBeNull();
  });

  test('速率限制处理', async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      headers: new Map([['Retry-After', '60']]),
      text: () => Promise.resolve('Rate limited')
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useStreamingChat());

    await act(async () => {
      await result.current.sendMessage('test message');
    });

    expect(result.current.rateLimited).toBe(true);
    expect(result.current.retryAfter).toBe(60);
    expect(result.current.error).toContain('请求过于频繁');
  });

  test('连接状态管理', () => {
    const { result } = renderHook(() => useStreamingChat());
    
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.hasConnectionError).toBe(false);
  });

  test('错误清除功能', () => {
    const { result } = renderHook(() => useStreamingChat());
    
    // 模拟错误状态
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  test('消息管理功能', () => {
    const { result } = renderHook(() => useStreamingChat());
    
    expect(result.current.messageCount).toBe(0);
    expect(result.current.hasError).toBe(false);
    expect(result.current.canRetry).toBe(false);
  });

  test('TypeScript类型检查', () => {
    const options = {
      model: 'deepseek-ai/DeepSeek-V3',
      temperature: 0.7,
      max_tokens: 2000,
      systemMessage: 'You are a helpful assistant',
      provider: 'siliconflow' as const,
      onMessage: (message: any) => console.log(message),
      onError: (error: string) => console.error(error),
      onStreamStart: () => console.log('Stream started'),
      onStreamEnd: () => console.log('Stream ended')
    };

    const { result } = renderHook(() => useStreamingChat(options));
    
    // 验证返回的方法存在且类型正确
    expect(typeof result.current.sendMessage).toBe('function');
    expect(typeof result.current.stopStreaming).toBe('function');
    expect(typeof result.current.clearMessages).toBe('function');
    expect(typeof result.current.retryLastMessage).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
    expect(typeof result.current.removeMessage).toBe('function');
    expect(typeof result.current.editMessage).toBe('function');
  });
});