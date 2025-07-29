/**
 * 模块1：信息填写 + 关键词选择组件
 * 负责店铺信息输入和关键词推荐展示
 */

import React, { useState, useCallback, useMemo } from 'react';
import type { StoreInfo, Module1Data, KeywordItem } from '../../lib/business-types';
import { StoreInfoForm } from './module1/StoreInfoForm';
import { useStoreInfoValidation } from '../../hooks/use-store-info-validation';
import { ErrorAlert } from '../ui/error-alert';

// ==================== 接口定义 ====================

interface Module1KeywordsProps {
  /** 模块1数据 */
  data: Module1Data | null;
  /** 加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 初始店铺信息 */
  initialStoreInfo?: Partial<StoreInfo>;
  /** 完成回调 */
  onComplete: (data: Module1Data) => void;
  /** 获取关键词推荐 */
  onFetchKeywords: (storeInfo: StoreInfo) => void;
  /** 清除错误 */
  onClearError: () => void;
}

// ==================== 子组件 ====================

interface KeywordDisplayProps {
  keywords: KeywordItem[];
  title: string;
  color: 'blue' | 'green';
}

function KeywordDisplay({ keywords, title, color }: KeywordDisplayProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="space-y-2">
        {keywords.map((item, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${colorClasses[color]}`}
          >
            <div className="font-medium">{item.keyword}</div>
            <div className="text-sm opacity-80 mt-1">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

export function Module1Keywords({
  data,
  isLoading,
  error,
  initialStoreInfo = {},
  onComplete,
  onFetchKeywords,
  onClearError
}: Module1KeywordsProps) {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    storeName: initialStoreInfo.storeName || '',
    storeCategory: initialStoreInfo.storeCategory || '',
    storeLocation: initialStoreInfo.storeLocation || '',
    businessDuration: initialStoreInfo.businessDuration || '',
    storeFeatures: initialStoreInfo.storeFeatures || [],
    ownerName: initialStoreInfo.ownerName || '',
    ownerFeatures: initialStoreInfo.ownerFeatures || []
  });

  // 验证表单
  const isFormValid = useCallback(() => {
    return (
      storeInfo.storeName.trim() !== '' &&
      storeInfo.storeCategory !== '' &&
      storeInfo.storeLocation.trim() !== '' &&
      storeInfo.ownerName.trim() !== '' &&
      storeInfo.storeFeatures.length > 0 &&
      storeInfo.ownerFeatures.length > 0
    );
  }, [storeInfo]);

  // 处理获取关键词
  const handleFetchKeywords = useCallback(() => {
    if (isFormValid()) {
      onFetchKeywords(storeInfo);
    }
  }, [storeInfo, isFormValid, onFetchKeywords]);

  // 处理完成
  const handleComplete = useCallback(() => {
    if (data) {
      onComplete(data);
    }
  }, [data, onComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          模块1：店铺信息填写 + 关键词推荐
        </h2>
        <p className="text-gray-600">
          请填写店铺基本信息，系统将为您推荐相关关键词
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">⚠️</div>
              <div className="text-red-800">{error}</div>
            </div>
            <button
              onClick={onClearError}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              清除
            </button>
          </div>
        </div>
      )}

      {/* 店铺信息表单 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">店铺基本信息</h3>
        <StoreInfoForm
          storeInfo={storeInfo}
          onChange={setStoreInfo}
          disabled={isLoading}
        />
        
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleFetchKeywords}
            disabled={!isFormValid() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {isLoading ? '正在获取关键词...' : '获取关键词推荐'}
          </button>
        </div>
      </div>

      {/* 关键词推荐结果 */}
      {data && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">推荐关键词</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeywordDisplay
              keywords={data.confirmedStoreKeywords}
              title="店铺关键词"
              color="blue"
            />
            <KeywordDisplay
              keywords={data.confirmedOwnerKeywords}
              title="老板关键词"
              color="green"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              确认关键词，进入下一步
              <span className="ml-2">→</span>
            </button>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      {!data && !isLoading && !error && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p>请填写完整的店铺信息后获取关键词推荐</p>
        </div>
      )}
    </div>
  );
}

export default Module1Keywords;