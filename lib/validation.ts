import { FormData } from "@/lib/types"
import { REQUIRED_FIELDS, FORM_FIELD_LABELS } from "@/lib/constants"

export interface ValidationResult {
  isValid: boolean
  missingFields: string[]
  errorMessage?: string
}

/**
 * 验证表单数据的完整性
 * @param formData 表单数据
 * @returns 验证结果
 */
export function validateFormData(formData: FormData): ValidationResult {
  const requiredFieldKeys = REQUIRED_FIELDS.map(({ field }) => field) as (keyof FormData)[]
  const missingFields = requiredFieldKeys.filter(field => !formData[field]?.trim())
  
  if (missingFields.length === 0) {
    return { isValid: true, missingFields: [] }
  }
  
  const missingFieldNames = missingFields
    .map(field => FORM_FIELD_LABELS[field])
    .join('、')
  
  return {
    isValid: false,
    missingFields,
    errorMessage: `请填写以下必填信息：${missingFieldNames}`
  }
}

/**
 * 显示验证错误消息
 * @param validationResult 验证结果
 */
export function showValidationError(validationResult: ValidationResult): void {
  if (!validationResult.isValid && validationResult.errorMessage) {
    alert(validationResult.errorMessage)
  }
}