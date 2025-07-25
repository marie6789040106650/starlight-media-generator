'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { FormData } from '../lib/types'
import { FormDataManager } from '../lib/form-data-manager'

// 表单上下文类型定义
interface FormContextType {
  // 表单数据状态
  formData: FormData
  isValid: boolean
  errors: Record<string, string>
  isDirty: boolean
  
  // 表单操作方法
  setFormData: (data: FormData) => void
  updateField: (field: keyof FormData, value: string) => void
  resetForm: () => void
  validateForm: () => boolean
  clearErrors: () => void
  
  // 持久化操作
  saveToStorage: () => void
  loadFromStorage: () => void
  clearStorage: () => void
  
  // URL 操作
  encodeForUrl: () => string
  loadFromUrl: (encoded: string) => boolean
}

// 表单状态类型
interface FormState {
  formData: FormData
  errors: Record<string, string>
  isDirty: boolean
}

// 表单动作类型
type FormAction =
  | { type: 'SET_FORM_DATA'; payload: FormData }
  | { type: 'UPDATE_FIELD'; payload: { field: keyof FormData; value: string } }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_FORM' }
  | { type: 'SET_DIRTY'; payload: boolean }

// 表单状态 reducer
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: action.payload,
        isDirty: true
      }
    
    case 'UPDATE_FIELD':
      const updatedFormData = {
        ...state.formData,
        [action.payload.field]: action.payload.value
      }
      return {
        ...state,
        formData: updatedFormData,
        isDirty: true
      }
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      }
    
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {}
      }
    
    case 'RESET_FORM':
      return {
        formData: FormDataManager.getDefaultFormData(),
        errors: {},
        isDirty: false
      }
    
    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload
      }
    
    default:
      return state
  }
}

// 创建上下文
const FormContext = createContext<FormContextType | undefined>(undefined)

// 表单提供者组件属性
interface FormProviderProps {
  children: React.ReactNode
  initialData?: FormData
  autoSave?: boolean
}

/**
 * 表单上下文提供者组件
 */
export function FormProvider({ 
  children, 
  initialData,
  autoSave = true 
}: FormProviderProps): JSX.Element {
  // 初始化状态
  const initialState: FormState = {
    formData: initialData || FormDataManager.getDefaultFormData(),
    errors: {},
    isDirty: false
  }

  const [state, dispatch] = useReducer(formReducer, initialState)

  // 计算是否有效
  const isValid = Object.keys(state.errors).length === 0 && 
    FormDataManager.validateFormData(state.formData).isValid

  // 设置表单数据
  const setFormData = useCallback((data: FormData) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data })
  }, [])

  // 更新单个字段
  const updateField = useCallback((field: keyof FormData, value: string) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { field, value } })
    
    // 清除该字段的错误
    if (state.errors[field]) {
      const newErrors = { ...state.errors }
      delete newErrors[field]
      dispatch({ type: 'SET_ERRORS', payload: newErrors })
    }
  }, [state.errors])

  // 重置表单
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' })
  }, [])

  // 验证表单
  const validateForm = useCallback((): boolean => {
    const validation = FormDataManager.validateFormData(state.formData)
    dispatch({ type: 'SET_ERRORS', payload: validation.errors })
    return validation.isValid
  }, [state.formData])

  // 清除错误
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  // 保存到本地存储
  const saveToStorage = useCallback(() => {
    FormDataManager.saveToStorage(state.formData)
    dispatch({ type: 'SET_DIRTY', payload: false })
  }, [state.formData])

  // 从本地存储加载
  const loadFromStorage = useCallback(() => {
    const stored = FormDataManager.loadFromStorage()
    if (stored) {
      dispatch({ type: 'SET_FORM_DATA', payload: stored })
      dispatch({ type: 'SET_DIRTY', payload: false })
    }
  }, [])

  // 清除本地存储
  const clearStorage = useCallback(() => {
    FormDataManager.clearStorage()
  }, [])

  // 编码为URL
  const encodeForUrl = useCallback((): string => {
    return FormDataManager.encodeForUrl(state.formData)
  }, [state.formData])

  // 从URL加载
  const loadFromUrl = useCallback((encoded: string): boolean => {
    const decoded = FormDataManager.decodeFromUrl(encoded)
    if (decoded) {
      dispatch({ type: 'SET_FORM_DATA', payload: decoded })
      dispatch({ type: 'SET_DIRTY', payload: false })
      return true
    }
    return false
  }, [])

  // 自动保存效果
  useEffect(() => {
    if (autoSave && state.isDirty && !FormDataManager.isEmptyFormData(state.formData)) {
      const timer = setTimeout(() => {
        saveToStorage()
      }, 1000) // 1秒后自动保存

      return () => clearTimeout(timer)
    }
  }, [state.formData, state.isDirty, autoSave, saveToStorage])

  // 页面卸载时保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.isDirty) {
        saveToStorage()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.isDirty, saveToStorage])

  // 上下文值
  const contextValue: FormContextType = {
    // 状态
    formData: state.formData,
    isValid,
    errors: state.errors,
    isDirty: state.isDirty,
    
    // 操作方法
    setFormData,
    updateField,
    resetForm,
    validateForm,
    clearErrors,
    
    // 持久化操作
    saveToStorage,
    loadFromStorage,
    clearStorage,
    
    // URL 操作
    encodeForUrl,
    loadFromUrl
  }

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  )
}

/**
 * 使用表单上下文的 Hook
 */
export function useFormContext(): FormContextType {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider')
  }
  return context
}

/**
 * 使用表单字段的 Hook
 */
export function useFormField(field: keyof FormData) {
  const { formData, updateField, errors } = useFormContext()
  
  return {
    value: formData[field] || '',
    onChange: (value: string) => updateField(field, value),
    error: errors[field],
    hasError: !!errors[field]
  }
}

/**
 * 使用表单验证的 Hook
 */
export function useFormValidation() {
  const { validateForm, isValid, errors, clearErrors } = useFormContext()
  
  return {
    validate: validateForm,
    isValid,
    errors,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  }
}

/**
 * 使用表单持久化的 Hook
 */
export function useFormPersistence() {
  const { 
    saveToStorage, 
    loadFromStorage, 
    clearStorage, 
    encodeForUrl, 
    loadFromUrl,
    isDirty 
  } = useFormContext()
  
  return {
    save: saveToStorage,
    load: loadFromStorage,
    clear: clearStorage,
    encodeForUrl,
    loadFromUrl,
    isDirty
  }
}