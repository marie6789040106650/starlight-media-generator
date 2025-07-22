/**
 * Module1 Constants
 * Extracted from Module1Keywords component for better maintainability
 */

export const STORE_CATEGORIES = [
  '餐饮',
  '美业', 
  '零售',
  '服务',
  '教育',
  '健康',
  '其他'
] as const;

export const COMMON_STORE_FEATURES = [
  '正宗口味',
  '家常风味',
  '实惠价格',
  '环境舒适',
  '服务周到',
  '品质保证',
  '传统工艺',
  '现代时尚',
  '健康营养',
  '快速便捷'
] as const;

export const COMMON_OWNER_FEATURES = [
  '热情好客',
  '专业技能',
  '经验丰富',
  '本地人',
  '年轻活力',
  '细心负责',
  '创新思维',
  '亲和力强',
  '诚信经营',
  '用心服务'
] as const;

export type StoreCategoryType = typeof STORE_CATEGORIES[number];
export type StoreFeatureType = typeof COMMON_STORE_FEATURES[number];
export type OwnerFeatureType = typeof COMMON_OWNER_FEATURES[number];