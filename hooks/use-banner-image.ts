import { useState } from 'react'

export const useBannerImage = () => {
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const [isGeneratingBanner, setIsGeneratingBanner] = useState(false)

  // 生成banner图片的函数
  const generateBannerImage = async (planContent: string, formData: any = {}) => {
    setIsGeneratingBanner(true)
    try {
      // 使用店铺信息作为图片提示词
      const storeName = formData?.storeName || '未知店铺'
      const storeCategory = formData?.storeCategory || '未知品类'
      const storeFeatures = formData?.storeFeatures || '未知特色'
      
      const bannerPrompt = `给该方案生成一个banner图- 店名：${storeName}- 品类：${storeCategory}- 店铺特色：${storeFeatures}`

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: bannerPrompt,
          size: '1800x600', // 更新为1800x600px
          quality: 'standard',
          response_format: 'url',
          format: 'jpg' // 指定格式为jpg
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data[0] && data.data[0].url) {
          setBannerImage(data.data[0].url)
        }
      } else {
        console.error('Banner图片生成失败:', response.statusText)
      }
    } catch (error) {
      console.error('生成banner图片时出错:', error)
    } finally {
      setIsGeneratingBanner(false)
    }
  }

  return {
    bannerImage,
    setBannerImage,
    isGeneratingBanner,
    generateBannerImage
  }
}