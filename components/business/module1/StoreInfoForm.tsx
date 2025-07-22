/**
 * Store Information Form Component
 * Extracted from Module1Keywords for better modularity
 */

import React, { useCallback } from 'react';
import type { StoreInfo } from '../../../lib/business-types';
import { 
  STORE_CATEGORIES, 
  COMMON_STORE_FEATURES, 
  COMMON_OWNER_FEATURES 
} from './constants';

interface StoreInfoFormProps {
  storeInfo: StoreInfo;
  onChange: (storeInfo: StoreInfo) => void;
  disabled?: boolean;
}

export function StoreInfoForm({ storeInfo, onChange, disabled = false }: StoreInfoFormProps) {
  const handleInputChange = useCallback((field: keyof StoreInfo, value: string | string[]) => {
    onChange({ ...storeInfo, [field]: value });
  }, [storeInfo, onChange]);

  const handleFeatureToggle = useCallback((field: 'storeFeatures' | 'ownerFeatures', feature: string) => {
    const currentFeatures = storeInfo[field] as string[];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    handleInputChange(field, newFeatures);
  }, [storeInfo, handleInputChange]);

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            店铺名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeInfo.storeName}
            onChange={(e) => handleInputChange('storeName', e.target.value)}
            disabled={disabled}
            placeholder="请输入店铺名称"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            行业类别 <span className="text-red-500">*</span>
          </label>
          <select
            value={storeInfo.storeCategory}
            onChange={(e) => handleInputChange('storeCategory', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">请选择行业类别</option>
            {STORE_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            店铺位置 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeInfo.storeLocation}
            onChange={(e) => handleInputChange('storeLocation', e.target.value)}
            disabled={disabled}
            placeholder="如：成都春熙路"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            经营时长
          </label>
          <input
            type="text"
            value={storeInfo.businessDuration || ''}
            onChange={(e) => handleInputChange('businessDuration', e.target.value)}
            disabled={disabled}
            placeholder="如：3年"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            老板姓氏 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={storeInfo.ownerName}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            disabled={disabled}
            placeholder="如：张"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* Store Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          店铺特色 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {COMMON_STORE_FEATURES.map(feature => (
            <button
              key={feature}
              type="button"
              onClick={() => handleFeatureToggle('storeFeatures', feature)}
              disabled={disabled}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                storeInfo.storeFeatures.includes(feature)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {feature}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          已选择 {storeInfo.storeFeatures.length} 个特色
        </p>
      </div>

      {/* Owner Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          老板特色 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {COMMON_OWNER_FEATURES.map(feature => (
            <button
              key={feature}
              type="button"
              onClick={() => handleFeatureToggle('ownerFeatures', feature)}
              disabled={disabled}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                storeInfo.ownerFeatures.includes(feature)
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              {feature}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          已选择 {storeInfo.ownerFeatures.length} 个特色
        </p>
      </div>
    </div>
  );
}

export default StoreInfoForm;