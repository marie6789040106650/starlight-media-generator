'use client';

import React from 'react';
import { MarkdownWithToc } from '@/components/MarkdownWithToc';

// 示例Markdown内容
const sampleMarkdown = `
# 老板IP打造方案

## 1. IP核心定位与形象塑造

### 标签定位
作为一名资深的餐饮行业从业者，您的IP标签应该围绕"匠心"、"传承"、"创新"三个核心关键词展开。

### 人设塑造
打造"传统工艺的现代传承者"人设，既有深厚的技艺底蕴，又具备现代经营理念。

### Slogan设计
"用心做好每一道菜，传承不止是技艺"

## 2. 品牌主张升级

### 核心价值观
坚持品质至上，传承匠心精神，为顾客提供最authentic的美食体验。

### 品牌故事
从学徒到老板的创业历程，每一道菜背后的故事和坚持。

## 3. 抖音账号基础布局

### 头像设计
使用专业形象照，展现亲和力和专业性。

### 账号名称
结合店名和个人特色，如"XX师傅的厨房"。

### 简介优化
突出专业背景、店铺特色和服务理念。

## 4. 内容板块规划

### 创业故事板块
分享从业经历、创业心路历程、行业见解。

### 技艺揭秘板块
展示制作工艺、食材选择、独家秘方。

### 公益责任板块
参与社区活动、帮助同行、传承技艺。

### 用户互动板块
回答用户问题、分享生活日常、建立情感连接。

## 5. 直播间设计

### 主题设定
以"老师傅教你做菜"为主题，营造温馨的厨房氛围。

### 直播流程
开场问候 → 今日菜品介绍 → 制作过程展示 → 互动答疑 → 结束语

## 6. 口播金句模板

### 情怀类金句
"做菜如做人，用心才能做出好味道"

### 专业类金句
"这道菜的关键在于火候的掌握"

### 推广类金句
"好的食材配上用心的制作，就是我们的招牌"

## 7. 运营增长策略

### 冷启动打法
通过优质内容建立初始粉丝基础，利用话题标签扩大曝光。

### 数据优化
分析用户喜好，优化内容方向，提高互动率和完播率。

## 8. 商业化路径

### 短期变现
通过直播带货、探店合作实现快速变现。

### 长期布局
建立个人品牌，开发周边产品，打造IP矩阵。
`;

export default function FloatingTocDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            悬浮目录演示页面
          </h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">使用说明</h2>
            <ul className="text-blue-800 space-y-1">
              <li>• 右上角有一个蓝色的悬浮按钮</li>
              <li>• 点击按钮可以展开/折叠目录</li>
              <li>• 点击目录中的标题可以跳转到对应位置</li>
              <li>• 点击目录外的区域会自动折叠目录</li>
            </ul>
          </div>

          {/* 使用带悬浮目录的Markdown组件 */}
          <MarkdownWithToc 
            content={sampleMarkdown}
            className="markdown-content"
          />
        </div>
      </div>
    </div>
  );
}