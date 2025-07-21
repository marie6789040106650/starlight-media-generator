'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStreamingChat } from '@/hooks/use-streaming-chat';

export default function ChatStreaming() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    currentResponse,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    retryLastMessage,
  } = useStreamingChat({
    model: 'gpt-4',
    temperature: 0.7,
    systemMessage: '你是一个有用的AI助手，请用中文回答问题。',
  });

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col bg-gray-50">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800">AI 流式对话</h1>
        <div className="flex gap-2">
          <button
            onClick={clearMessages}
            className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            清空对话
          </button>
          {error && (
            <button
              onClick={retryLastMessage}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              重试
            </button>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>错误:</strong> {error}
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-white rounded-lg p-4">
        {messages.length === 0 && !currentResponse && (
          <div className="text-center text-gray-500 py-8">
            <p>开始与 AI 对话吧！</p>
            <p className="text-sm mt-2">支持 Markdown 格式，流式响应</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800 border'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
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
              </div>
              <div className="flex items-center mt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">AI 正在回复...</span>
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入您的消息... (Enter 发送，Shift+Enter 换行)"
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <span>
            {messages.length > 0 && `${messages.length} 条消息`}
            {isStreaming && ' • 正在生成回复...'}
          </span>
          <span>支持 Markdown • 流式响应</span>
        </div>
      </div>
    </div>
  );
}