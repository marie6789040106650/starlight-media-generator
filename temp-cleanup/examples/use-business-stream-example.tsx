/**
 * useBusinessStream Hook 使用示例
 * 展示如何在React组件中使用业务流程Hook
 */

import React, { useState } from 'react';
import { useBusinessStream } from '../hooks/use-business-stream';
import type { StoreInfo } from '../lib/business-types';

// 示例组件
export function BusinessStreamExample() {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: "川味小厨",
    storeCategory: "餐饮",
    storeLocation: "成都春熙路",
    businessDuration: "3年",
    storeFeatures: ["正宗川菜", "家常口味", "实惠价格"],
    ownerName: "张",
    ownerFeatures: ["热情好客", "厨艺精湛", "本地人"]
  });

  // 使用业务流程Hook
  const businessStream = useBusinessStream({
    onModule1Complete: (data) => {
      console.log('模块1完成:', data);
    },
    onModule2Complete: (data) => {
      console.log('模块2完成:', data);
    },
    onModule3Complete: (data) => {
      console.log('模块3完成:', data);
    },
    onError: (error, module) => {
      console.error(`${module}错误:`, error);
    },
    onStepChange: (step) => {
      console.log('当前步骤:', step);
    }
  });

  const {
    module1,
    module2,
    module3,
    currentStep,
    fetchModule1Keywords,
    startModule2Generation,
    stopModule2Generation,
    generateModule3Banner,
    resetAllModules,
    retryCurrentStep,
    canProceedToModule2,
    canProceedToModule3,
    isCompleted,
    getProgress,
    isAnyLoading,
    hasAnyError
  } = businessStream;

  const progress = getProgress();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">业务流程Hook示例</h1>
      
      {/* 进度条 */}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-600">
        进度: {progress.completed}/{progress.total} ({progress.percentage.toFixed(1)}%)
      </p>

      {/* 当前步骤指示 */}
      <div className="flex justify-center space-x-4">
        {['module1', 'module2', 'module3', 'completed'].map((step) => (
          <div
            key={step}
            className={`px-3 py-1 rounded-full text-sm ${
              currentStep === step
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step === 'module1' && '信息填写'}
            {step === 'module2' && '方案生成'}
            {step === 'module3' && 'Banner设计'}
            {step === 'completed' && '完成'}
          </div>
        ))}
      </div>

      {/* 模块1：信息填写 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">模块1：信息填写 + 关键词推荐</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">店铺名称</label>
            <input
              type="text"
              value={storeInfo.storeName}
              onChange={(e) => setStoreInfo(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">行业类别</label>
            <select
              value={storeInfo.storeCategory}
              onChange={(e) => setStoreInfo(prev => ({ ...prev, storeCategory: e.target.value }))}
              className="w-full border rounded px-3 py-2"
            >
              <option value="餐饮">餐饮</option>
              <option value="美业">美业</option>
              <option value="零售">零售</option>
              <option value="服务">服务</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => fetchModule1Keywords(storeInfo)}
          disabled={module1.isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {module1.isLoading ? '处理中...' : '获取关键词推荐'}
        </button>

        {module1.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            错误: {module1.error}
          </div>
        )}

        {module1.data && (
          <div className="mt-4 p-3 bg-green-50 rounded">
            <h3 className="font-medium mb-2">推荐关键词:</h3>
            <div className="space-y-2">
              <div>
                <strong>店铺关键词:</strong>
                {module1.data.confirmedStoreKeywords.map(k => k.keyword).join(', ')}
              </div>
              <div>
                <strong>老板关键词:</strong>
                {module1.data.confirmedOwnerKeywords.map(k => k.keyword).join(', ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 模块2：方案生成 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">模块2：IP方案流式生成</h2>
        
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => module1.data && startModule2Generation(module1.data)}
            disabled={!canProceedToModule2 || module2.isStreaming}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {module2.isStreaming ? '生成中...' : '开始生成方案'}
          </button>
          
          {module2.isStreaming && (
            <button
              onClick={stopModule2Generation}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              停止生成
            </button>
          )}
        </div>

        {module2.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            错误: {module2.error}
          </div>
        )}

        {/* 流式状态显示 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <h4 className="font-medium">IP标签 {module2.streamState.ipTags.isComplete ? '✅' : '⏳'}</h4>
            <div className="text-sm text-gray-600">
              {module2.streamState.ipTags.content.join(', ') || '等待生成...'}
            </div>
          </div>
          
          <div className="p-3 border rounded">
            <h4 className="font-medium">品牌主张 {module2.streamState.brandSlogan.isComplete ? '✅' : '⏳'}</h4>
            <div className="text-sm text-gray-600">
              {module2.streamState.brandSlogan.content || '等待生成...'}
            </div>
          </div>
          
          <div className="p-3 border rounded">
            <h4 className="font-medium">内容栏目 {module2.streamState.contentColumns.isComplete ? '✅' : '⏳'}</h4>
            <div className="text-sm text-gray-600">
              {module2.streamState.contentColumns.content.map(c => c.title).join(', ') || '等待生成...'}
            </div>
          </div>
          
          <div className="p-3 border rounded">
            <h4 className="font-medium">金句表达 {module2.streamState.goldenSentences.isComplete ? '✅' : '⏳'}</h4>
            <div className="text-sm text-gray-600">
              {module2.streamState.goldenSentences.content.join(', ') || '等待生成...'}
            </div>
          </div>
        </div>
      </div>

      {/* 模块3：Banner设计 */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">模块3：Banner设计生成</h2>
        
        <button
          onClick={() => module1.data && module2.finalData && generateModule3Banner(module1.data, module2.finalData)}
          disabled={!canProceedToModule3 || module3.isLoading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {module3.isLoading ? '生成中...' : '生成Banner设计'}
        </button>

        {module3.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
            错误: {module3.error}
          </div>
        )}

        {module3.data && (
          <div className="mt-4 p-3 bg-purple-50 rounded">
            <h3 className="font-medium mb-2">Banner设计方案:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>主标题:</strong> {module3.data.bannerDesign.mainTitle}</div>
              <div><strong>副标题:</strong> {module3.data.bannerDesign.subtitle}</div>
              <div><strong>色调:</strong> {module3.data.bannerDesign.colorTheme}</div>
              <div><strong>设计标签:</strong> {module3.data.designTags.join(', ')}</div>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={retryCurrentStep}
          disabled={!hasAnyError}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          重试当前步骤
        </button>
        
        <button
          onClick={resetAllModules}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          重置所有模块
        </button>
      </div>

      {/* 完成状态 */}
      {isCompleted && (
        <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
          🎉 所有模块已完成！您可以查看生成的完整方案。
        </div>
      )}

      {/* 调试信息 */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-600">调试信息</summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify({
            currentStep,
            canProceedToModule2,
            canProceedToModule3,
            isCompleted,
            isAnyLoading,
            hasAnyError,
            progress
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default BusinessStreamExample;