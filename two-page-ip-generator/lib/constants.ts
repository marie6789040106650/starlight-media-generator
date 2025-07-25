// 常量定义
export const REQUIRED_FIELDS = [
  { field: 'storeName', label: '店的名字' },
  { field: 'storeCategory', label: '店的品类' },
  { field: 'storeLocation', label: '店的位置' },
  { field: 'businessDuration', label: '开店时长' },
  { field: 'storeFeatures', label: '店的特色' },
  { field: 'ownerName', label: '老板贵姓' },
  { field: 'ownerFeatures', label: '老板的特色' }
] as const

export const INITIAL_FORM_DATA = {
  storeName: "",
  storeCategory: "",
  storeLocation: "",
  businessDuration: "",
  storeFeatures: "",
  ownerName: "",
  ownerFeatures: "",
}

export const INITIAL_EXPANDED_SECTIONS = {
  positioning: true,
  branding: false,
  account: false,
  content: false,
  livestream: false,
  scripts: false,
  growth: false,
  monetization: false,
}

// 从 REQUIRED_FIELDS 创建字段映射对象
export const FORM_FIELD_LABELS = REQUIRED_FIELDS.reduce((acc, { field, label }) => {
  acc[field] = label
  return acc
}, {} as Record<string, string>)

// 关键词分隔符正则表达式
export const KEYWORD_SEPARATORS = /[、，,]/