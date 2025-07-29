import { useState, useCallback } from 'react'
import { FormData, ExpandedKeywords } from '@/lib/types'
import { INITIAL_FORM_DATA } from '@/lib/constants'
import { debounce } from '@/lib/utils'

export const useFormData = () => {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [expandedKeywords, setExpandedKeywords] = useState<ExpandedKeywords | null>(null)
  const [isExpandingKeywords, setIsExpandingKeywords] = useState(false)
  const [enableKeywordExpansion, setEnableKeywordExpansion] = useState(false)

  // 创建防抖版本的关键词拓展函数 - 暂时停用防抖
  // const debouncedExpandKeywords = useCallback(
  //   debounce((storeFeatures: string, ownerFeatures: string) => {
  //     console.log('触发关键词拓展:', storeFeatures, ownerFeatures);
  //     setIsExpandingKeywords(true);
  //     fetch('/api/expand-keywords', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         storeFeatures: storeFeatures || '',
  //         ownerFeatures: ownerFeatures || ''
  //       }),
  //     })
  //       .then(response => response.json())
  //       .then(data => {
  //         console.log('关键词拓展结果:', data);
  //         setExpandedKeywords(data);
  //         setIsExpandingKeywords(false);
  //       })
  //       .catch(error => {
  //         console.error('关键词拓展出错:', error);
  //         setIsExpandingKeywords(false);
  //       });
  //   }, 1000),
  //   []
  // );

  // 直接执行关键词拓展函数，不使用防抖
  const expandKeywords = useCallback((storeFeatures: string, ownerFeatures: string) => {
    console.log('触发关键词拓展:', storeFeatures, ownerFeatures);
    setIsExpandingKeywords(true);
    fetch('/api/expand-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeFeatures: storeFeatures || '',
        ownerFeatures: ownerFeatures || ''
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('关键词拓展结果:', data);
        setExpandedKeywords(data);
        setIsExpandingKeywords(false);
      })
      .catch(error => {
        console.error('关键词拓展出错:', error);
        setIsExpandingKeywords(false);
      });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
    }
    setFormData(newFormData)

    // 当店铺特色或老板特色发生变化，且启用了关键词拓展时，进行实时拓展 - 暂时停用自动触发
    // if (enableKeywordExpansion &&
    //   (field === "storeFeatures" || field === "ownerFeatures") &&
    //   value.length > 2) { // 至少输入2个字符才触发拓展

    //   const storeFeatures = field === "storeFeatures" ? value : newFormData.storeFeatures
    //   const ownerFeatures = field === "ownerFeatures" ? value : newFormData.ownerFeatures

    //   // 只要有一个字段有内容就可以进行拓展
    //   if (storeFeatures || ownerFeatures) {
    //     expandKeywords(storeFeatures, ownerFeatures);
    //   }
    // }
  }

  return {
    formData,
    setFormData,
    expandedKeywords,
    setExpandedKeywords,
    isExpandingKeywords,
    setIsExpandingKeywords,
    enableKeywordExpansion,
    setEnableKeywordExpansion,
    handleInputChange
  }
}