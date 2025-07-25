import { FormData } from './types'

/**
 * 表单数据管理器
 * 负责表单数据的编码/解码、持久化存储和验证
 */
export class FormDataManager {
  private static readonly STORAGE_KEY = 'two-page-ip-form-data'
  private static readonly URL_PARAM_KEY = 'data'

  /**
   * 将表单数据保存到localStorage
   */
  static saveToStorage(data: FormData): void {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(this.STORAGE_KEY, serialized)
    } catch (error) {
      console.error('Failed to save form data to storage:', error)
    }
  }

  /**
   * 从localStorage加载表单数据
   */
  static loadFromStorage(): FormData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      return this.validateAndNormalizeFormData(parsed)
    } catch (error) {
      console.error('Failed to load form data from storage:', error)
      return null
    }
  }

  /**
   * 清除localStorage中的表单数据
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear form data from storage:', error)
    }
  }

  /**
   * 将表单数据编码为URL参数字符串
   */
  static encodeForUrl(data: FormData): string {
    try {
      const compressed = this.compressFormData(data)
      const encoded = btoa(JSON.stringify(compressed))
      return encodeURIComponent(encoded)
    } catch (error) {
      console.error('Failed to encode form data for URL:', error)
      return ''
    }
  }

  /**
   * 从URL参数字符串解码表单数据
   */
  static decodeFromUrl(encoded: string): FormData | null {
    try {
      const decoded = decodeURIComponent(encoded)
      const decompressed = JSON.parse(atob(decoded))
      const expanded = this.expandFormData(decompressed)
      return this.validateAndNormalizeFormData(expanded)
    } catch (error) {
      console.error('Failed to decode form data from URL:', error)
      return null
    }
  }

  /**
   * 验证表单数据的完整性和格式
   */
  static validateFormData(data: FormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // 必填字段验证
    const requiredFields = [
      { key: 'storeName', label: '店铺名称' },
      { key: 'storeCategory', label: '店铺品类' },
      { key: 'storeLocation', label: '店铺位置' },
      { key: 'businessDuration', label: '经营时长' },
      { key: 'storeFeatures', label: '店铺特色' },
      { key: 'ownerName', label: '老板姓名' },
      { key: 'ownerFeatures', label: '老板特色' }
    ]

    requiredFields.forEach(({ key, label }) => {
      const value = data[key as keyof FormData]
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        errors[key] = `${label}不能为空`
      }
    })

    // 字段长度验证
    const lengthValidations = [
      { key: 'storeName', max: 50, label: '店铺名称' },
      { key: 'storeCategory', max: 30, label: '店铺品类' },
      { key: 'storeLocation', max: 100, label: '店铺位置' },
      { key: 'businessDuration', max: 20, label: '经营时长' },
      { key: 'storeFeatures', max: 500, label: '店铺特色' },
      { key: 'ownerName', max: 20, label: '老板姓名' },
      { key: 'ownerFeatures', max: 500, label: '老板特色' }
    ]

    lengthValidations.forEach(({ key, max, label }) => {
      const value = data[key as keyof FormData]
      if (value && typeof value === 'string' && value.length > max) {
        errors[key] = `${label}不能超过${max}个字符`
      }
    })

    // 特殊格式验证
    if (data.ownerName && !/^[\u4e00-\u9fa5a-zA-Z\s]{1,20}$/.test(data.ownerName)) {
      errors.ownerName = '老板姓名只能包含中文、英文和空格'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * 获取默认的空表单数据
   */
  static getDefaultFormData(): FormData {
    return {
      storeName: '',
      storeCategory: '',
      storeLocation: '',
      businessDuration: '',
      storeFeatures: '',
      ownerName: '',
      ownerFeatures: '',
      storeType: '',
      targetAudience: '',
      businessGoals: ''
    }
  }

  /**
   * 合并表单数据，用新数据覆盖旧数据中的非空字段
   */
  static mergeFormData(existing: FormData, updates: Partial<FormData>): FormData {
    const merged = { ...existing }
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        (merged as any)[key] = value
      }
    })

    return merged
  }

  /**
   * 压缩表单数据以减少URL长度
   */
  private static compressFormData(data: FormData): Record<string, string> {
    const keyMap: Record<keyof FormData, string> = {
      storeName: 'sn',
      storeCategory: 'sc',
      storeLocation: 'sl',
      businessDuration: 'bd',
      storeFeatures: 'sf',
      ownerName: 'on',
      ownerFeatures: 'of',
      storeType: 'st',
      targetAudience: 'ta',
      businessGoals: 'bg'
    }

    const compressed: Record<string, string> = {}
    Object.entries(data).forEach(([key, value]) => {
      const shortKey = keyMap[key as keyof FormData]
      if (shortKey && value) {
        compressed[shortKey] = value
      }
    })

    return compressed
  }

  /**
   * 展开压缩的表单数据
   */
  private static expandFormData(compressed: Record<string, string>): FormData {
    const keyMap: Record<string, keyof FormData> = {
      sn: 'storeName',
      sc: 'storeCategory',
      sl: 'storeLocation',
      bd: 'businessDuration',
      sf: 'storeFeatures',
      on: 'ownerName',
      of: 'ownerFeatures',
      st: 'storeType',
      ta: 'targetAudience',
      bg: 'businessGoals'
    }

    const expanded = this.getDefaultFormData()
    Object.entries(compressed).forEach(([shortKey, value]) => {
      const fullKey = keyMap[shortKey]
      if (fullKey && value) {
        (expanded as any)[fullKey] = value
      }
    })

    return expanded
  }

  /**
   * 验证并规范化表单数据
   */
  private static validateAndNormalizeFormData(data: any): FormData | null {
    if (!data || typeof data !== 'object') {
      return null
    }

    const normalized = this.getDefaultFormData()
    
    // 只保留有效的字段
    Object.keys(normalized).forEach(key => {
      const value = data[key]
      if (typeof value === 'string') {
        (normalized as any)[key] = value.trim()
      }
    })

    return normalized
  }

  /**
   * 检查表单数据是否为空
   */
  static isEmptyFormData(data: FormData): boolean {
    const requiredFields = ['storeName', 'storeCategory', 'storeLocation', 'businessDuration', 'storeFeatures', 'ownerName', 'ownerFeatures']
    return requiredFields.every(field => !data[field as keyof FormData] || data[field as keyof FormData].trim() === '')
  }

  /**
   * 生成表单数据的摘要信息
   */
  static getFormDataSummary(data: FormData): string {
    const { storeName, storeCategory, storeLocation } = data
    const parts = [storeName, storeCategory, storeLocation].filter(Boolean)
    return parts.join(' - ') || '未填写信息'
  }
}