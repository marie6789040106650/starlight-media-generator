'use client';

import { useState } from 'react';
import ChatStreaming from '@/components/chat-streaming';

interface DemoConfig {
  model: string;
  provider: 'openai' | 'siliconflow';
  temperature: number;
  systemMessage: string;
}

const DEMO_CONFIGS: Record<string, DemoConfig> = {
  'deepseek-v3': {
    model: 'deepseek-ai/DeepSeek-V3',
    provider: 'siliconflow',
    temperature: 0.7,
    systemMessage: '你是一个有用的AI助手，请用中文回答问题。你具备强大的推理能力和广泛的知识。'
  },
  'qwen-max': {
    model: 'Qwen/Qwen2.5-72B-Instruct',
    provider: 'siliconflow',
    temperature: 0.7,
    systemMessage: '你是通义千问，由阿里云开发的AI助手。请用中文回答问题，提供准确和有用的信息。'
  },
  'gpt-4': {
    model: 'gpt-4',
    provider: 'openai',
    temperature: 0.7,
    systemMessage: 'You are a helpful AI assistant. Please respond in Chinese and provide accurate, helpful information.'
  }
};

export default function StreamingDemoPage() {
  const [selectedConfig, setSelectedConfig] = useState<string>('deepseek-v3');
  const [showInfo, setShowInfo] = useState(true);
  
  const currentConfig = DEMO_CONFIGS[selectedConfig];

  const handleMessage = (message: any) => {
    console.log('New message:', message);
  };

  const handleError = (error: string) => {
    console.error('Chat error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 信息面板 */}
      {showInfo && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  🚀 AI 流式对话演示
                </h2>
                <p className="text-blue-700 text-sm mb-3">
                  体验基于 SiliconFlow 和 OpenAI 的流式响应聊天功能，支持多种模型和实时交互。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-1">✨ 主要特性</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• 实时流式响应</li>
                      <li>• 多模型支持</li>
                      <li>• 错误处理和重试</li>
                      <li>• 连接状态监控</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-1">🔧 技术栈</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Next.js Edge Runtime</li>
                      <li>• Server-Sent Events</li>
                      <li>• React Hooks</li>
                      <li>• TypeScript</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-1">🎯 使用场景</h3>
                    <ul className="text-blue-700 space-y-1">
                      <li>• 智能客服</li>
                      <li>• 内容生成</li>
                      <li>• 代码助手</li>
                      <li>• 知识问答</li>
                    </ul>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-500 hover:text-blue-700 text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配置选择器 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">选择模型配置:</label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="deepseek-v3">DeepSeek-V3 (推荐)</option>
                <option value="qwen-max">Qwen2.5-72B</option>
                <option value="gpt-4">GPT-4 (OpenAI)</option>
              </select>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>提供商: <strong>{currentConfig.provider}</strong></span>
              <span>温度: <strong>{currentConfig.temperature}</strong></span>
              {!showInfo && (
                <button
                  onClick={() => setShowInfo(true)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  显示信息
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 聊天界面 */}
      <ChatStreaming
        model={currentConfig.model}
        provider={currentConfig.provider}
        temperature={currentConfig.temperature}
        systemMessage={currentConfig.systemMessage}
        onMessage={handleMessage}
        onError={handleError}
      />
    </div>
  );
}