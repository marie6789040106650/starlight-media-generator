/**
 * 简单的Markdown测试组件
 */

"use client"

import React from 'react';
import { MarkdownDebugDisplay } from './markdown-debug-display';

const simpleTestContent = `# 馋嘴老张麻辣烫 - 老张IP打造方案

## 1. IP核心定位与形象塑造

**核心体验**: 打造"有温度的老字号"形象，老张创业30年的匠心精神。

**人设画像**: 塑造"有文化的创业美食家"形象：
- 专业维度：北京麻辣烫资深创始者，研发过12种独家秘方
- 性格维度：会读书口相的学霸老板，每个顾客都是"老铁"
- 价值维度：用985的脑子做街边美食的暖心者

**Slogan体系**: 主slogan"学霸的味子，匠人的勺子"

## 2. 内容策略与传播矩阵

### 2.1 核心内容支柱
- **匠心故事**: 30年配方传承，每一勺都有温度
- **跨界魅力**: 从清华到厨房的人生转折

### 2.2 平台布局策略

| 平台 | 内容重点 | 发布频率 | 预期效果 |
|------|----------|----------|----------|
| 抖音 | 制作过程展示 | 每日2-3条 | 品牌曝光 |
| 小红书 | 美食攻略分享 | 每日1-2条 | 种草转化 |

## 3. 实施计划

1. **第一阶段**: 品牌基础建设
2. **第二阶段**: 内容输出与推广  
3. **第三阶段**: 效果优化与扩展

> **重要提示**: 本方案需要持续优化和调整

---

*本方案由星光传媒专业团队制作*`;

export const SimpleMarkdownTest: React.FC = () => {
  return <MarkdownDebugDisplay content={simpleTestContent} />;
};

export default SimpleMarkdownTest;