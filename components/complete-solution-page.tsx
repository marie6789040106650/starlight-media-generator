/**
 * 完整的方案页面组件 - 集成所有功能
 * 包含Markdown渲染、水印设置、多格式导出
 */

"use client"

import React, { useState } from 'react';
import { EnhancedSolutionDisplay } from './enhanced-solution-display';
import { SolutionExportWithWatermark } from './solution-export-with-watermark';
import '../styles/solution-display.css';

interface CompleteSolutionPageProps {
  /** 方案数据 */
  solution: {
    title: string;
    content: string; // Markdown格式
    category?: string;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  };
  /** 用户信息 */
  userInfo?: {
    name: string;
    email: string;
    department?: string;
  };
}

export const CompleteSolutionPage: React.FC<CompleteSolutionPageProps> = ({
  solution,
  userInfo
}) => {
  const [showWatermarkDialog, setShowWatermarkDialog] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{solution.title}</h1>
          {solution.category && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {solution.category}
              </span>
              {solution.tags?.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 导出工具栏 */}
        <SolutionExportWithWatermark
          title={solution.title}
          content={solution.content}
          userInfo={userInfo}
        />
      </div>

      {/* 方案内容展示 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <EnhancedSolutionDisplay
          content={solution.content}
          showWatermarkButton={false} // 已在工具栏中显示
        />
      </div>

      {/* 页面底部信息 */}
      <div className="text-sm text-gray-500 border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            {solution.createdAt && (
              <span>创建时间: {solution.createdAt.toLocaleDateString('zh-CN')}</span>
            )}
            {solution.updatedAt && solution.updatedAt !== solution.createdAt && (
              <span className="ml-4">
                更新时间: {solution.updatedAt.toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
          <div>
            {userInfo && (
              <span>当前用户: {userInfo.name} ({userInfo.email})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteSolutionPage;