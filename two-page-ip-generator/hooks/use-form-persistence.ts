'use client'

import { useEffect, useCallback, useRef } from 'react'
import { FormData } from '../lib/types'
import { FormDataManager } from '../lib/form-data-manager'

/**
 * 表单持久化配置选项
 */
interface FormPersistenceOptions {
  /** 自动保存间隔（毫秒），默认 1000ms */
  autoSaveInterval?: number
  /** 是否启用自动保存，默认 true */
  enableAutoSave?: boolean
  /** 是否在页面卸载时保存，默认 true */
  saveOnUnload?: boolean
  /** 是否在页面可见性变化时保存，默认 true */
  saveOnVisibilityChange?: boolean
  /** 存储键名，默认使用 FormDataManager 的默认键 */
  storageKey?: string
  /** 调试模式，默认 false */
  debug?: boolean
}

/**
 * 表单持久化状态
 */
interface FormPersistenceState {
  /** 是否正在保存 */
  isSaving: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 最后保存时间 */
  lastSaved: Date | null
  /** 最后加载时间 */
  lastLoaded: Date | null
  /** 是否有未保存的更改 */
  hasUnsavedChanges: boolean
}

/**
 * 表单持久化返回值
 */
interface FormPersistenceReturn extends FormPersistenceState {
  /** 手动保存表单数据 */
  save: (data: FormData) => Promise<boolean>
  /** 手动加载表单数据 */
  load: () => Promise<FormData | null>
  /** 清除存储的数据 */
  clear: () => Promise<boolean>
  /** 检查是否有存储的数据 */
  hasStoredData: () => boolean
  /** 获取存储数据的摘要信息 */
  getStoredDataSummary: () => string | null
  /** 强制保存（忽略防抖） */
  forceSave: (data: FormData) => Promise<boolean>
  /** 重置持久化状态 */
  resetState: () => void
}

/**
 * 表单持久化 Hook
 * 提供表单数据的自动保存、加载和恢复功能
 */
export function useFormPersistence(
  formData: FormData,
  onDataLoaded?: (data: FormData) => void,
  options: FormPersistenceOptions = {}
): FormPersistenceReturn {
  const {
    autoSaveInterval = 1000,
    enableAutoSave = true,
    saveOnUnload = true,
    saveOnVisibilityChange = true,
    storageKey,
    debug = false
  } = options

  // 状态引用
  const stateRef = useRef<FormPersistenceState>({
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    lastLoaded: null,
    hasUnsavedChanges: false
  })

  // 防抖定时器引用
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastFormDataRef = useRef<FormData>(formData)

  // 调试日志
  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[FormPersistence] ${message}`, ...args)
    }
  }, [debug])

  // 手动保存
  const save = useCallback(async (data: FormData): Promise<boolean> => {
    try {
      stateRef.current.isSaving = true
      log('Saving form data', data)

      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(data))
      } else {
        FormDataManager.saveToStorage(data)
      }

      stateRef.current.lastSaved = new Date()
      stateRef.current.hasUnsavedChanges = false
      stateRef.current.isSaving = false
      
      log('Form data saved successfully')
      return true
    } catch (error) {
      console.error('Failed to save form data:', error)
      stateRef.current.isSaving = false
      return false
    }
  }, [storageKey, log])

  // 强制保存（忽略防抖）
  const forceSave = useCallback(async (data: FormData): Promise<boolean> => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    return await save(data)
  }, [save])

  // 手动加载
  const load = useCallback(async (): Promise<FormData | null> => {
    try {
      stateRef.current.isLoading = true
      log('Loading form data')

      let loaded: FormData | null = null

      if (storageKey) {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          loaded = FormDataManager.validateAndNormalizeFormData ? 
            FormDataManager.validateAndNormalizeFormData(parsed) : parsed
        }
      } else {
        loaded = FormDataManager.loadFromStorage()
      }

      if (loaded) {
        stateRef.current.lastLoaded = new Date()
        stateRef.current.hasUnsavedChanges = false
        log('Form data loaded successfully', loaded)
        
        if (onDataLoaded) {
          onDataLoaded(loaded)
        }
      } else {
        log('No stored form data found')
      }

      stateRef.current.isLoading = false
      return loaded
    } catch (error) {
      console.error('Failed to load form data:', error)
      stateRef.current.isLoading = false
      return null
    }
  }, [storageKey, onDataLoaded, log])

  // 清除存储
  const clear = useCallback(async (): Promise<boolean> => {
    try {
      log('Clearing stored form data')

      if (storageKey) {
        localStorage.removeItem(storageKey)
      } else {
        FormDataManager.clearStorage()
      }

      stateRef.current.lastSaved = null
      stateRef.current.lastLoaded = null
      stateRef.current.hasUnsavedChanges = false
      
      log('Stored form data cleared')
      return true
    } catch (error) {
      console.error('Failed to clear form data:', error)
      return false
    }
  }, [storageKey, log])

  // 检查是否有存储的数据
  const hasStoredData = useCallback((): boolean => {
    try {
      if (storageKey) {
        return localStorage.getItem(storageKey) !== null
      } else {
        return FormDataManager.loadFromStorage() !== null
      }
    } catch (error) {
      console.error('Failed to check stored data:', error)
      return false
    }
  }, [storageKey])

  // 获取存储数据的摘要
  const getStoredDataSummary = useCallback((): string | null => {
    try {
      let stored: FormData | null = null

      if (storageKey) {
        const item = localStorage.getItem(storageKey)
        if (item) {
          stored = JSON.parse(item)
        }
      } else {
        stored = FormDataManager.loadFromStorage()
      }

      return stored ? FormDataManager.getFormDataSummary(stored) : null
    } catch (error) {
      console.error('Failed to get stored data summary:', error)
      return null
    }
  }, [storageKey])

  // 重置状态
  const resetState = useCallback(() => {
    stateRef.current = {
      isSaving: false,
      isLoading: false,
      lastSaved: null,
      lastLoaded: null,
      hasUnsavedChanges: false
    }
    
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    
    log('Persistence state reset')
  }, [log])

  // 防抖保存
  const debouncedSave = useCallback((data: FormData) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      save(data)
      saveTimerRef.current = null
    }, autoSaveInterval)
  }, [save, autoSaveInterval])

  // 监听表单数据变化进行自动保存
  useEffect(() => {
    if (!enableAutoSave) return

    const currentData = JSON.stringify(formData)
    const lastData = JSON.stringify(lastFormDataRef.current)

    if (currentData !== lastData) {
      stateRef.current.hasUnsavedChanges = true
      lastFormDataRef.current = formData

      // 检查是否为空数据，空数据不自动保存
      if (!FormDataManager.isEmptyFormData(formData)) {
        log('Form data changed, scheduling auto-save')
        debouncedSave(formData)
      }
    }
  }, [formData, enableAutoSave, debouncedSave, log])

  // 页面卸载时保存
  useEffect(() => {
    if (!saveOnUnload) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (stateRef.current.hasUnsavedChanges && !FormDataManager.isEmptyFormData(formData)) {
        log('Page unloading, saving form data')
        // 同步保存，因为异步操作可能被中断
        try {
          if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(formData))
          } else {
            FormDataManager.saveToStorage(formData)
          }
        } catch (error) {
          console.error('Failed to save on unload:', error)
        }

        // 显示确认对话框（可选）
        event.preventDefault()
        event.returnValue = '您有未保存的更改，确定要离开吗？'
        return event.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formData, saveOnUnload, storageKey, log])

  // 页面可见性变化时保存
  useEffect(() => {
    if (!saveOnVisibilityChange) return

    const handleVisibilityChange = () => {
      if (document.hidden && stateRef.current.hasUnsavedChanges && !FormDataManager.isEmptyFormData(formData)) {
        log('Page hidden, saving form data')
        save(formData)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [formData, saveOnVisibilityChange, save, log])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  return {
    // 状态
    ...stateRef.current,
    
    // 方法
    save,
    load,
    clear,
    hasStoredData,
    getStoredDataSummary,
    forceSave,
    resetState
  }
}

/**
 * 简化版本的表单持久化 Hook
 * 只提供基本的保存和加载功能
 */
export function useSimpleFormPersistence(formData: FormData) {
  const { save, load, clear, hasStoredData } = useFormPersistence(formData, undefined, {
    enableAutoSave: true,
    autoSaveInterval: 2000,
    debug: false
  })

  return {
    save: () => save(formData),
    load,
    clear,
    hasStoredData
  }
}

/**
 * 用于页面恢复的表单持久化 Hook
 * 在组件挂载时自动尝试恢复数据
 */
export function useFormRecovery(
  onRecover: (data: FormData) => void,
  options: FormPersistenceOptions = {}
) {
  const { load, hasStoredData, getStoredDataSummary } = useFormPersistence(
    FormDataManager.getDefaultFormData(),
    onRecover,
    { ...options, enableAutoSave: false }
  )

  // 组件挂载时尝试恢复
  useEffect(() => {
    if (hasStoredData()) {
      load()
    }
  }, [load, hasStoredData])

  return {
    hasStoredData,
    getStoredDataSummary,
    recover: load
  }
}