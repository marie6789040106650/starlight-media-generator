// 类型定义
export interface FormData {
  storeName: string
  storeCategory: string
  storeLocation: string
  businessDuration: string
  storeFeatures: string
  ownerName: string
  ownerFeatures: string
  // 添加缺失的属性用于关键词扩展
  storeType?: string
  targetAudience?: string
  businessGoals?: string
}

export interface ExpandedKeywords {
  expanded_store_features: string[]
  expanded_boss_features: string[]
}

export interface TocItem {
  id: string
  title: string
  level: number
}

export interface SectionConfig {
  [key: string]: boolean
}