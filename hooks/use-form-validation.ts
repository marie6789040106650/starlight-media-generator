import { useCallback } from "react"
import { FormData } from "@/lib/types"
import { validateFormData, showValidationError } from "@/lib/validation"

export const useFormValidation = () => {
  const validateAndShowErrors = useCallback((formData: FormData): boolean => {
    const validationResult = validateFormData(formData)
    
    if (!validationResult.isValid) {
      showValidationError(validationResult)
      return false
    }
    
    return true
  }, [])

  return {
    validateAndShowErrors,
    validateFormData
  }
}