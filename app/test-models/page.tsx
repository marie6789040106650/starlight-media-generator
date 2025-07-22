/**
 * 模型选择测试页面
 * 用于验证模型过滤功能
 */

"use client"

import { useState, useEffect } from 'react'
import { getAvailableChatModels, CHAT_MODELS } from '@/lib/models'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TestModelsPage() {
  const [selectedModel, setSelectedModel] = useState('')
  const [allModels, setAllModels] = useState<any[]>([])
  const [availableModels, setAvailableModels] = useState<any[]>([])

  useEffect(() => {
    // 获取所有模型和可用模型
    const all = CHAT_MODELS
    const available = getAvailableChatModels()
    
    setAllModels(all)
    setAvailableModels(available)
    
    // 设置默认选择第一个可用模型
    if (available.length > 0) {
      setSelectedModel(available[0].id)
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">模型选择测试页面</h1>
      
      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总模型数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allModels.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">可用模型数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableModels.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">隐藏模型数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{allModels.length - availableModels.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 模型选择器 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>模型选择器测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">选择模型</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="选择一个模型" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {model.name}
                        {(!model.pricing || (model.pricing.input === 0 && model.pricing.output === 0)) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">免费</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedModel && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">选中的模型信息</h3>
              {(() => {
                const model = availableModels.find(m => m.id === selectedModel)
                return model ? (
                  <div className="text-sm space-y-1">
                    <p><strong>名称:</strong> {model.name}</p>
                    <p><strong>提供商:</strong> {model.provider}</p>
                    <p><strong>类别:</strong> {model.category}</p>
                    <p><strong>上下文窗口:</strong> {model.contextWindow.toLocaleString()} tokens</p>
                    <p><strong>最大输出:</strong> {model.maxTokens.toLocaleString()} tokens</p>
                    {model.pricing && (
                      <p><strong>定价:</strong> 输入 ${model.pricing.input}/1K tokens, 输出 ${model.pricing.output}/1K tokens</p>
                    )}
                  </div>
                ) : null
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 所有模型列表 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>所有模型列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allModels.map((model) => {
              const isAvailable = availableModels.some(am => am.id === model.id)
              const isFree = !model.pricing || (model.pricing.input === 0 && model.pricing.output === 0)
              
              return (
                <div 
                  key={model.id} 
                  className={`p-3 rounded-lg border ${
                    isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {model.name}
                        {isFree && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">免费</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">{model.description}</p>
                      <p className="text-xs text-gray-500">
                        提供商: {model.provider} | 
                        {model.pricing ? ` 定价: $${model.pricing.input}/$${model.pricing.output}` : ' 免费'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isAvailable ? '可用' : '隐藏'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}