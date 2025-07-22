'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStreamingChat } from '@/hooks/use-streaming-chat';

interface ChatStreamingProps {
  model?: string;
  provider?: 'openai' | 'siliconflow';
  temperature?: number;
  systemMessage?: string;
  className?: string;
  onMessage?: (message: any) => void;
  onError?: (error: string) => void;
}

export default function ChatStreaming({
  model = 'deepseek-ai/DeepSeek-V3',
  provider = 'siliconflow',
  temperature = 0.7,
  systemMessage = '你是一个有用的AI助手，请用中文回答问题。',
  className = '',
  onMessage,
  onError
}: ChatStreamingProps = {}) {
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    currentResponse,
    isStreaming,
    error,
    connectionStatus,
    requestId,
    messageCount,
    hasError,
    canRetry,
    isConnected,
    sendMessage,
    stopStreaming,
    clearMessages,
    retryLastMessage,
    clearError,
    removeMessage
  } = useStreamingChat({
    model,
    provider,
    temperature,
    systemMessage,
    onMessage,
    onError,
    onStreamStart: () => {
      console.log('Stream started');
    },
    onStreamEnd: () => {
      console.log('Stream ended');
      // 聚焦到输入框
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  });

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSend = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming) return;
    sendMessage(trimmedInput);
    setInput('');
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className={`max-w-4xl mx-auto p-6 h-screen flex flex-col bg-gray-50 ${className}`}>
      {/* 头部 */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">智能对话</h1>
          <div className="flex items-center gap-2">
            {/* 连接状态指示器 */}
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              connectionStatus === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? '已连接' :
               connectionStatus === 'connecting' ? '连接中' :
               connectionStatus === 'error' ? '连接错误' :
               '未连接'}
            </span>
            {requestId && (
              <span className="text-xs text-gray-400">ID: {requestId.slice(-6)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            设置
          </button>
          <button
            onClick={clearMessages}
            disabled={isStreaming}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            清空对话
          </button>
          {hasError && canRetry && (
            <button
              onClick={retryLastMessage}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              重试
            </button>
          )}
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="mb-4 p-4 bg-white rounded-lg border shadow-sm">
          <h3 className="font-semibold mb-3">对话设置</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">模型:</span>
              <span className="ml-2 font-mono">{model}</span>
            </div>
            <div>
              <span className="text-gray-600">提供商:</span>
              <span className="ml-2">{provider}</span>
            </div>
            <div>
              <span className="text-gray-600">温度:</span>
              <span className="ml-2">{temperature}</span>
            </div>
            <div>
              <span className="text-gray-600">消息数:</span>
              <span className="ml-2">{messageCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <strong>错误:</strong> {error}
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white rounded-lg p-4">
        {messages.length === 0 && !currentResponse && (
          <div className="text-center text-gray-500 py-8">
            <p>开始智能对话吧！</p>
            <p className="text-sm mt-2">支持 {provider} 模型，流式响应</p>
            <p className="text-xs mt-1 text-gray-400">当前模型: {model}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg shadow-sm relative ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800 border'
              }`}
            >
              {/* 消息操作按钮 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeMessage(index)}
                  className={`text-xs px-2 py-1 rounded ${
                    message.role === 'user' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                  }`}
                >
                  删除
                </button>
              </div>
              
              <div className="whitespace-pre-wrap break-words pr-12">
                {message.content}
              </div>
              <div className={`flex justify-between items-center text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                {message.requestId && (
                  <span className="font-mono">#{message.requestId.slice(-4)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* 显示当前流式响应 */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-gray-100 text-gray-800 border shadow-sm">
              <div className="whitespace-pre-wrap break-words">
                {currentResponse}
                <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">正在回复...</span>
                </div>
                <span className="text-xs text-gray-400">
                  {currentResponse.length} 字符
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`输入您的消息... (Enter 发送，Shift+Enter 换行)${isStreaming ? ' - 正在生成回复中...' : ''}`}
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            rows={3}
            disabled={isStreaming}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isStreaming ? '发送中...' : '发送'}
            </button>
            {isStreaming && (
              <button
                onClick={stopStreaming}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                停止
              </button>
            )}
          </div>
        </div>
        
        {/* 状态指示 */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              {messageCount > 0 && `${messageCount} 条消息`}
              {isStreaming && ' • 正在生成回复...'}
              {!isStreaming && !hasError && isConnected && ' • 就绪'}
            </span>
            {input.length > 0 && (
              <span>{input.length} 字符</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>支持 Markdown • 流式响应</span>
            <span className="text-gray-400">•</span>
            <span className="font-mono text-gray-400">{provider}</span>
          </div>
        </div>
      </div>
    </div>
  );
}