/**
 * 业务流程演示主容器组件
 * 整合模块1、2、3的完整业务流程
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useBusinessStream } from '../../hooks/use-business-stream';
import Module1Keywords from './Module1Keywords';
import Module2PlanStream from './Module2PlanStream';
import Module3BannerPreview from './Module3BannerPreview';
import type { StoreInfo, Module1Data, Module2OutputFull, Module3Output } from '../../lib/business-types';

// ==================== 接口定义 ====================

interface BusinessProcessDemoProps {
  /** 初始店铺信息 */
  initialStoreInfo?: Partial<StoreInfo>;
  /** 完成回调 */
  onComplete?: (data: {
    module1: Module1Data;
    module2: Module2OutputFull;
    module3: Module3Output;
  }) => void;
}

// ==================== 主组件 ====================

export default function BusinessProcessDemo({
  initialStoreInfo = {},
  onComplete
}: BusinessProcessDemoProps) {
  const [completedModules, setCompletedModules] = useState<{
    module1?: Module1Data;
    module2?: Module2OutputFull;
    module3?: Module3Output;
  }>({});

  // 使用业务流程Hook
  const {
    module1,
    module2,
    module3,
    currentStep,
    fetchModule1Keywords,
    startModule2Generation,
    stopModule2Generation,
    generateModule3Banner,
    clearError,
    canProceedToModule2,
    canProceedToModule3,
    isCompleted,
    getProgress
  } = useBusinessStream({
    onModule1Complete: (data) => {
      setCompletedModules(prev => ({ ...prev, module1: data }));
    },
    onModule2Complete: (data) => {
      setCompletedModules(prev => ({ ...prev, module2: data }));
    },
    onModule3Complete: (data) => {
      setCompletedModules(prev => ({ ...prev, module3: data }));
      // 所有模块完成，触发完成回调
      if (completedModules.module1 && completedModules.module2) {
        onComplete?.({
          module1: completedModules.module1,
          module2: completedModules.module2,
          module3: data
        });
      }
    },
    onError: (error, module) => {
      console.error(`${module} 错误:`, error);
    },
    onStepChange: (step) => {
      console.log('当前步骤:', step);
    }
  });

  // 处理模块1完成
  const handleModule1Complete = useCallback((data: Module1Data) => {
    setCompletedModules(prev => ({ ...prev, module1: data }));
    // 自动开始模块2
    startModule2Generation(data);
  }, [startModule2Generation]);

  // 处理模块2完成
  const handleModule2Complete = useCallback((data: Module2OutputFull) => {
    setCompletedModules(prev => ({ ...prev, module2: data }));
    // 自动开始模块3
    if (completedModules.module1) {
      generateModule3Banner(completedModules.module1, data);
    }
  }, [generateModule3Banner, completedModules.module1]);

  // 获取进度信息
  const progress = getProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部进度条 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-900">
              老板IP打造方案生成器
            </h1>
            <div className="text-sm text-gray-600">
              进度: {progress.completed}/{progress.total} ({progress.percentage.toFixed(0)}%)
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          {/* 步骤指示器 */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <div className={`flex items-center ${currentStep === 'module1' ? 'text-blue-600 font-medium' : completedModules.module1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                completedModules.module1 ? 'bg-green-100 text-green-600' : 
                currentStep === 'module1' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {completedModules.module1 ? '✓' : '1'}
              </div>
              信息填写
            </div>
            
            <div className={`flex items-center ${currentStep === 'module2' ? 'text-blue-600 font-medium' : completedModules.module2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                completedModules.module2 ? 'bg-green-100 text-green-600' : 
                currentStep === 'module2' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {completedModules.module2 ? '✓' : '2'}
              </div>
              方案生成
            </div>
            
            <div className={`flex items-center ${currentStep === 'module3' ? 'text-blue-600 font-medium' : completedModules.module3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                completedModules.module3 ? 'bg-green-100 text-green-600' : 
                currentStep === 'module3' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {completedModules.module3 ? '✓' : '3'}
              </div>
              Banner设计
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 模块1：信息填写 + 关键词推荐 */}
        {currentStep === 'module1' && (
          <Module1Keywords
            data={module1.data}
            isLoading={module1.isLoading}
            error={module1.error}
            initialStoreInfo={initialStoreInfo}
            onComplete={handleModule1Complete}
            onFetchKeywords={fetchModule1Keywords}
            onClearError={() => clearError('module1')}
          />
        )}

        {/* 模块2：流式方案生成 */}
        {currentStep === 'module2' && completedModules.module1 && (
          <Module2PlanStream
            module1Data={completedModules.module1}
            streamState={module2.streamState}
            finalData={module2.finalData}
            isStreaming={module2.isStreaming}
            error={module2.error}
            onStartGeneration={startModule2Generation}
            onStopGeneration={stopModule2Generation}
            onComplete={handleModule2Complete}
            onClearError={() => clearError('module2')}
          />
        )}

        {/* 模块3：Banner设计 */}
        {(currentStep === 'module3' || currentStep === 'completed') && 
         completedModules.module1 && completedModules.module2 && (
          <Module3BannerPreview
            requestData={{
              storeName: completedModules.module1.storeName,
              storeCategory: completedModules.module1.storeCategory,
              storeLocation: completedModules.module1.storeLocation,
              confirmedStoreKeywords: completedModules.module1.confirmedStoreKeywords,
              brandSlogan: completedModules.module2.brandSlogan,
              ipTags: completedModules.module2.ipTags,
              contentColumns: completedModules.module2.contentColumns
            }}
            isLoading={module3.isLoading}
            error={module3.error}
            onGenerate={() => {
              if (completedModules.module1 && completedModules.module2) {
                generateModule3Banner(completedModules.module1, completedModules.module2);
              }
            }}
            onRegenerate={() => {
              if (completedModules.module1 && completedModules.module2) {
                generateModule3Banner(completedModules.module1, completedModules.module2);
              }
            }}
          />
        )}

        {/* 完成状态 */}
        {isCompleted && completedModules.module1 && completedModules.module2 && completedModules.module3 && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-800 text-xl font-bold mb-2">🎉 恭喜！IP打造方案生成完成</div>
              <div className="text-green-700 mb-4">
                已成功生成包含关键词推荐、IP方案和Banner设计的完整解决方案
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  打印方案
                </button>
                <button
                  onClick={() => {
                    const data = {
                      module1: completedModules.module1!,
                      module2: completedModules.module2!,
                      module3: completedModules.module3!
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ip-plan-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  导出数据
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}