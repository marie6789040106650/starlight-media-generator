/**
 * 模块2：流式方案生成展示组件
 * 负责展示8个板块的流式生成过程
 */

import React, { useCallback } from 'react';
import type { 
  Module1Data, 
  Module2OutputFull, 
  Module2StreamState,
  ContentColumn 
} from '../../lib/business-types';

// ==================== 接口定义 ====================

interface Module2PlanStreamProps {
  /** 模块1数据 */
  module1Data: Module1Data;
  /** 流式状态 */
  streamState: Module2StreamState;
  /** 最终数据 */
  finalData: Module2OutputFull | null;
  /** 是否正在流式生成 */
  isStreaming: boolean;
  /** 错误信息 */
  error: string | null;
  /** 开始生成 */
  onStartGeneration: (data: Module1Data) => void;
  /** 停止生成 */
  onStopGeneration: () => void;
  /** 完成回调 */
  onComplete: (data: Module2OutputFull) => void;
  /** 清除错误 */
  onClearError: () => void;
}

// ==================== 子组件 ====================

interface StreamSectionProps {
  title: string;
  isComplete: boolean;
  isStreaming: boolean;
  children: React.ReactNode;
}

function StreamSection({ title, isComplete, isStreaming, children }: StreamSectionProps) {
  const getStatusIcon = () => {
    if (isComplete) return '✅';
    if (isStreaming) return '⏳';
    return '⭕';
  };

  const getStatusColor = () => {
    if (isComplete) return 'border-green-200 bg-green-50';
    if (isStreaming) return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">{getStatusIcon()}</span>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {isStreaming && (
          <div className="ml-2 animate-pulse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="min-h-[60px]">
        {children}
      </div>
    </div>
  );
}

interface IPTagsDisplayProps {
  tags: string[];
  isComplete: boolean;
  isStreaming: boolean;
}

function IPTagsDisplay({ tags, isComplete, isStreaming }: IPTagsDisplayProps) {
  if (tags.length === 0 && !isStreaming) {
    return <div className="text-gray-500 text-sm">等待生成IP标签...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
        >
          {tag}
        </span>
      ))}
      {isStreaming && tags.length === 0 && (
        <div className="text-blue-600 text-sm">正在生成IP标签...</div>
      )}
    </div>
  );
}

interface BrandSloganDisplayProps {
  slogan: string;
  isComplete: boolean;
  isStreaming: boolean;
}

function BrandSloganDisplay({ slogan, isComplete, isStreaming }: BrandSloganDisplayProps) {
  if (!slogan && !isStreaming) {
    return <div className="text-gray-500 text-sm">等待生成品牌主张...</div>;
  }

  return (
    <div className="text-lg font-medium text-gray-900">
      {slogan || (isStreaming ? '正在生成品牌主张...' : '')}
    </div>
  );
}

interface ContentColumnsDisplayProps {
  columns: ContentColumn[];
  isComplete: boolean;
  isStreaming: boolean;
}

function ContentColumnsDisplay({ columns, isComplete, isStreaming }: ContentColumnsDisplayProps) {
  if (columns.length === 0 && !isStreaming) {
    return <div className="text-gray-500 text-sm">等待生成内容栏目...</div>;
  }

  return (
    <div className="space-y-3">
      {columns.map((column, index) => (
        <div key={index} className="border-l-4 border-green-400 pl-3">
          <div className="font-medium text-gray-900">{column.title}</div>
          <div className="text-sm text-gray-600 mt-1">{column.description}</div>
        </div>
      ))}
      {isStreaming && columns.length === 0 && (
        <div className="text-green-600 text-sm">正在生成内容栏目...</div>
      )}
    </div>
  );
}

interface GoldenSentencesDisplayProps {
  sentences: string[];
  isComplete: boolean;
  isStreaming: boolean;
}

function GoldenSentencesDisplay({ sentences, isComplete, isStreaming }: GoldenSentencesDisplayProps) {
  if (sentences.length === 0 && !isStreaming) {
    return <div className="text-gray-500 text-sm">等待生成金句表达...</div>;
  }

  return (
    <div className="space-y-2">
      {sentences.map((sentence, index) => (
        <div key={index} className="flex items-start">
          <span className="text-yellow-500 mr-2">💡</span>
          <span className="text-gray-900 italic">"{sentence}"</span>
        </div>
      ))}
      {isStreaming && sentences.length === 0 && (
        <div className="text-yellow-600 text-sm">正在生成金句表达...</div>
      )}
    </div>
  );
}

interface StoreInfoSummaryProps {
  data: Module1Data;
}

function StoreInfoSummary({ data }: StoreInfoSummaryProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">基础信息概览</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">店铺名称：</span>
          <span className="font-medium">{data.storeName}</span>
        </div>
        <div>
          <span className="text-gray-600">行业类别：</span>
          <span className="font-medium">{data.storeCategory}</span>
        </div>
        <div>
          <span className="text-gray-600">所在位置：</span>
          <span className="font-medium">{data.storeLocation}</span>
        </div>
        <div>
          <span className="text-gray-600">老板姓氏：</span>
          <span className="font-medium">{data.ownerName}老板</span>
        </div>
      </div>
      
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">店铺关键词：</span>
          <span className="font-medium">
            {data.confirmedStoreKeywords.map(k => k.keyword).join('、')}
          </span>
        </div>
        <div>
          <span className="text-gray-600">老板关键词：</span>
          <span className="font-medium">
            {data.confirmedOwnerKeywords.map(k => k.keyword).join('、')}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================

export function Module2PlanStream({
  module1Data,
  streamState,
  finalData,
  isStreaming,
  error,
  onStartGeneration,
  onStopGeneration,
  onComplete,
  onClearError
}: Module2PlanStreamProps) {

  // 处理开始生成
  const handleStartGeneration = useCallback(() => {
    onStartGeneration(module1Data);
  }, [module1Data, onStartGeneration]);

  // 处理完成
  const handleComplete = useCallback(() => {
    if (finalData) {
      onComplete(finalData);
    }
  }, [finalData, onComplete]);

  // 计算完成进度
  const getProgress = useCallback(() => {
    const sections = [
      streamState.ipTags.isComplete,
      streamState.brandSlogan.isComplete,
      streamState.contentColumns.isComplete,
      streamState.goldenSentences.isComplete
    ];
    const completed = sections.filter(Boolean).length;
    return { completed, total: sections.length, percentage: (completed / sections.length) * 100 };
  }, [streamState]);

  const progress = getProgress();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          模块2：老板IP打造方案流式生成
        </h2>
        <p className="text-gray-600">
          基于店铺信息生成完整的IP打造方案，包含8个核心板块
        </p>
      </div>

      {/* 进度条 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">生成进度</span>
          <span className="text-sm text-gray-600">
            {progress.completed}/{progress.total} ({progress.percentage.toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
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

      {/* 店铺信息概览 */}
      <StoreInfoSummary data={module1Data} />

      {/* 控制按钮 */}
      <div className="flex justify-center space-x-4">
        {!isStreaming && !finalData && (
          <button
            onClick={handleStartGeneration}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            开始生成IP方案
            <span className="ml-2">🚀</span>
          </button>
        )}
        
        {isStreaming && (
          <button
            onClick={onStopGeneration}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            停止生成
            <span className="ml-2">⏹️</span>
          </button>
        )}
      </div>

      {/* 流式生成展示区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IP标签体系 */}
        <StreamSection
          title="IP标签体系"
          isComplete={streamState.ipTags.isComplete}
          isStreaming={isStreaming && !streamState.ipTags.isComplete}
        >
          <IPTagsDisplay
            tags={streamState.ipTags.content}
            isComplete={streamState.ipTags.isComplete}
            isStreaming={isStreaming && !streamState.ipTags.isComplete}
          />
        </StreamSection>

        {/* 品牌主张 */}
        <StreamSection
          title="品牌主张"
          isComplete={streamState.brandSlogan.isComplete}
          isStreaming={isStreaming && !streamState.brandSlogan.isComplete}
        >
          <BrandSloganDisplay
            slogan={streamState.brandSlogan.content}
            isComplete={streamState.brandSlogan.isComplete}
            isStreaming={isStreaming && !streamState.brandSlogan.isComplete}
          />
        </StreamSection>

        {/* 内容板块设计 */}
        <StreamSection
          title="内容板块设计"
          isComplete={streamState.contentColumns.isComplete}
          isStreaming={isStreaming && !streamState.contentColumns.isComplete}
        >
          <ContentColumnsDisplay
            columns={streamState.contentColumns.content}
            isComplete={streamState.contentColumns.isComplete}
            isStreaming={isStreaming && !streamState.contentColumns.isComplete}
          />
        </StreamSection>

        {/* 金句表达模板 */}
        <StreamSection
          title="金句表达模板"
          isComplete={streamState.goldenSentences.isComplete}
          isStreaming={isStreaming && !streamState.goldenSentences.isComplete}
        >
          <GoldenSentencesDisplay
            sentences={streamState.goldenSentences.content}
            isComplete={streamState.goldenSentences.isComplete}
            isStreaming={isStreaming && !streamState.goldenSentences.isComplete}
          />
        </StreamSection>
      </div>

      {/* 完成按钮 */}
      {finalData && !isStreaming && (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="text-green-800 font-medium mb-2">🎉 IP方案生成完成！</div>
            <div className="text-green-700 text-sm">
              已成功生成包含IP标签、品牌主张、内容栏目、金句表达等核心板块的完整方案
            </div>
          </div>
          
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            确认方案，进入下一步
            <span className="ml-2">→</span>
          </button>
        </div>
      )}

      {/* 等待状态 */}
      {!isStreaming && !finalData && !error && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p>点击"开始生成IP方案"开始流式生成过程</p>
        </div>
      )}
    </div>
  );
}

export default Module2PlanStream;