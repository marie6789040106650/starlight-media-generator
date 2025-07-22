/**
 * 预置关键词库配置
 * 用于模块1关键词推荐功能
 */

import type { KeywordItem } from './business-types';

export interface KeywordPresets {
  store: Record<string, KeywordItem[]>;
  owner: Record<string, KeywordItem[]>;
}

/**
 * 店铺关键词库
 */
const STORE_KEYWORDS: Record<string, KeywordItem[]> = {
  '餐饮': [
    { keyword: '秘制锅底', description: '独家配方，口味独特，顾客记忆点强' },
    { keyword: '地道川味', description: '正宗四川口味，辣而不燥' },
    { keyword: '环境复古', description: '装修风格怀旧，营造温馨氛围' },
    { keyword: '食材新鲜', description: '每日采购新鲜食材，品质保证' },
    { keyword: '服务贴心', description: '员工服务周到，客户体验佳' }
  ],
  '美业': [
    { keyword: '专业技术', description: '技师经验丰富，手法专业' },
    { keyword: '环境优雅', description: '装修精致，氛围舒适' },
    { keyword: '产品高端', description: '使用知名品牌产品' },
    { keyword: '个性定制', description: '根据客户需求定制服务' },
    { keyword: '贴心服务', description: '全程贴心服务，客户满意度高' }
  ],
  '零售': [
    { keyword: '品质保证', description: '严选商品，质量可靠' },
    { keyword: '价格实惠', description: '性价比高，让利客户' },
    { keyword: '款式丰富', description: '商品种类多样，选择性强' },
    { keyword: '服务专业', description: '导购专业，购物体验好' },
    { keyword: '售后完善', description: '完善的售后服务体系' }
  ],
  '服务': [
    { keyword: '专业可靠', description: '服务专业，值得信赖' },
    { keyword: '响应迅速', description: '快速响应客户需求' },
    { keyword: '价格透明', description: '收费标准清晰透明' },
    { keyword: '服务周到', description: '全程贴心服务' },
    { keyword: '经验丰富', description: '行业经验深厚' }
  ],
  '教育': [
    { keyword: '师资优秀', description: '教师团队专业优秀' },
    { keyword: '方法科学', description: '教学方法科学有效' },
    { keyword: '环境舒适', description: '学习环境舒适安静' },
    { keyword: '因材施教', description: '根据学生特点个性化教学' },
    { keyword: '成果显著', description: '教学成果显著可见' }
  ],
  '健康': [
    { keyword: '专业权威', description: '专业资质权威认证' },
    { keyword: '设备先进', description: '使用先进专业设备' },
    { keyword: '服务贴心', description: '服务细致贴心' },
    { keyword: '效果显著', description: '健康效果显著' },
    { keyword: '安全可靠', description: '安全保障可靠' }
  ]
};

/**
 * 老板关键词库
 */
const OWNER_KEYWORDS: Record<string, KeywordItem[]> = {
  '实干型': [
    { keyword: '亲力亲为', description: '事事亲自把关，注重细节' },
    { keyword: '经验丰富', description: '行业经验深厚，专业可靠' },
    { keyword: '品质追求', description: '对产品和服务品质要求严格' },
    { keyword: '踏实稳重', description: '做事踏实，值得信赖' }
  ],
  '亲和型': [
    { keyword: '平易近人', description: '待人友善，容易亲近' },
    { keyword: '善于沟通', description: '沟通能力强，理解客户需求' },
    { keyword: '服务至上', description: '以客户满意为第一目标' },
    { keyword: '热情周到', description: '热情服务，周到细致' }
  ],
  '创新型': [
    { keyword: '思维活跃', description: '思路开阔，善于创新' },
    { keyword: '紧跟潮流', description: '关注行业趋势，与时俱进' },
    { keyword: '勇于尝试', description: '敢于尝试新事物，不断进步' },
    { keyword: '前瞻视野', description: '具有前瞻性的商业视野' }
  ],
  '专业型': [
    { keyword: '技术精湛', description: '专业技术精湛，业务能力强' },
    { keyword: '严谨细致', description: '工作严谨，注重细节' },
    { keyword: '持续学习', description: '不断学习，提升专业能力' },
    { keyword: '行业专家', description: '在行业内具有专家地位' }
  ]
};

/**
 * 预置关键词库
 */
export const PRESET_KEYWORDS: KeywordPresets = {
  store: STORE_KEYWORDS,
  owner: OWNER_KEYWORDS
};

/**
 * 获取店铺类别的关键词
 */
export function getStoreKeywords(category: string): KeywordItem[] {
  return STORE_KEYWORDS[category] || [];
}

/**
 * 获取老板类型的关键词
 */
export function getOwnerKeywords(type: string): KeywordItem[] {
  return OWNER_KEYWORDS[type] || [];
}

/**
 * 获取所有支持的店铺类别
 */
export function getSupportedStoreCategories(): string[] {
  return Object.keys(STORE_KEYWORDS);
}

/**
 * 获取所有支持的老板类型
 */
export function getSupportedOwnerTypes(): string[] {
  return Object.keys(OWNER_KEYWORDS);
}

/**
 * 根据特征匹配关键词
 */
export function matchKeywordsByFeature(
  keywords: KeywordItem[], 
  feature: string
): KeywordItem[] {
  return keywords.filter(k => 
    k.keyword.includes(feature) || 
    k.description.includes(feature) ||
    feature.includes(k.keyword)
  );
}

/**
 * 去重并限制关键词数量
 */
export function deduplicateAndLimit(
  keywords: KeywordItem[], 
  maxCount: number = 5
): KeywordItem[] {
  const uniqueKeywords = Array.from(
    new Map(keywords.map(k => [k.keyword, k])).values()
  );
  return uniqueKeywords.slice(0, maxCount);
}