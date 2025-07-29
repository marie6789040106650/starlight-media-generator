"use client"

import { getStableModelPriority, getScenarioModels, getDefaultRecommendedModel } from '@/lib/models'

export default function StableModelsPage() {
  const stableModels = getStableModelPriority()
  const scenarioModels = getScenarioModels()
  const defaultModel = getDefaultRecommendedModel()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">稳定模型配置</h1>
        <p className="text-gray-600">基于你的API密钥配置的稳定模型优先级</p>
      </div>

      {/* 默认推荐模型 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-800">🎯 默认推荐模型</h2>
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-lg">{defaultModel.name}</h3>
              <p className="text-sm text-gray-600">{defaultModel.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                提供商: {defaultModel.provider} | 
                价格: {defaultModel.pricing ? 
                  `输入 $${defaultModel.pricing.input}/1K, 输出 $${defaultModel.pricing.output}/1K` : 
                  '免费'
                }
              </p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              推荐
            </span>
          </div>
        </div>
      </div>

      {/* 按优先级排序的模型列表 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📋 稳定模型优先级列表</h2>
        <div className="space-y-3">
          {stableModels.map((model, index) => (
            <div key={model.id} className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-sm text-gray-600">{model.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {model.provider} | 上下文: {model.contextWindow.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {model.pricing && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                      ${(model.pricing.input + model.pricing.output).toFixed(3)}/1K
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 按场景分类的推荐模型 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🎭 场景推荐模型</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(scenarioModels).map(([scenario, model]) => (
            <div key={scenario} className="bg-white rounded-lg p-4 border">
              <div className="mb-2">
                <h3 className="font-medium text-sm text-purple-700 uppercase tracking-wide">
                  {scenario === 'free' && '💰 预算友好'}
                  {scenario === 'fast' && '⚡ 快速响应'}
                  {scenario === 'quality' && '🎯 高质量'}
                  {scenario === 'longContext' && '📚 长上下文'}
                  {scenario === 'multimodal' && '🖼️ 多模态'}
                  {scenario === 'budget' && '💸 预算优先'}
                </h3>
              </div>
              <div>
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{model.provider}</p>
                {model.pricing && (
                  <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    ${(model.pricing.input + model.pricing.output).toFixed(3)}/1K
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API密钥状态 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🔑 API密钥状态</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">SF</span>
            </div>
            <p className="text-sm font-medium">SiliconFlow</p>
            <p className="text-xs text-green-600">✅ 已配置</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">G</span>
            </div>
            <p className="text-sm font-medium">Google</p>
            <p className="text-xs text-green-600">✅ 已配置</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 font-bold">O</span>
            </div>
            <p className="text-sm font-medium">OpenAI</p>
            <p className="text-xs text-gray-400">❌ 未配置</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-gray-400 font-bold">A</span>
            </div>
            <p className="text-sm font-medium">Anthropic</p>
            <p className="text-xs text-gray-400">❌ 未配置</p>
          </div>
        </div>
      </div>
    </div>
  )
}