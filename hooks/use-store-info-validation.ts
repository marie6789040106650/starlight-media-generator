/**
 * Store Information Validation Hook
 * Provides form validation logic with memoization
 */

import { useMemo } from 'react';
import type { StoreInfo } from '../lib/business-types';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  fieldErrors: {
    storeName: boolean;
    storeCategory: boolean;
    storeLocation: boolean;
    ownerName: boolean;
    storeFeatures: boolean;
    ownerFeatures: boolean;
  };
}

export function useStoreInfoValidation(storeInfo: StoreInfo): ValidationResult {
  return useMemo(() => {
    const errors: Record<string, string> = {};
    
    // Validate required fields
    if (!storeInfo.storeName?.trim()) {
      errors.storeName = '店铺名称不能为空';
    }
    
    if (!storeInfo.storeCategory) {
      errors.storeCategory = '请选择行业类别';
    }
    
    if (!storeInfo.storeLocation?.trim()) {
      errors.storeLocation = '店铺位置不能为空';
    }
    
    if (!storeInfo.ownerName?.trim()) {
      errors.ownerName = '老板姓氏不能为空';
    }
    
    if (!storeInfo.storeFeatures?.length) {
      errors.storeFeatures = '请至少选择一个店铺特色';
    }
    
    if (!storeInfo.ownerFeatures?.length) {
      errors.ownerFeatures = '请至少选择一个老板特色';
    }
    
    const fieldErrors = {
      storeName: !!errors.storeName,
      storeCategory: !!errors.storeCategory,
      storeLocation: !!errors.storeLocation,
      ownerName: !!errors.ownerName,
      storeFeatures: !!errors.storeFeatures,
      ownerFeatures: !!errors.ownerFeatures
    };
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      fieldErrors
    };
  }, [storeInfo]);
}

export default useStoreInfoValidation;