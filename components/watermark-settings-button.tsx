/**
 * 水印设置按钮组件
 * 专门用于主页面的水印设置功能
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { WatermarkConfigDialog, WatermarkConfig } from "./watermark-config"

interface WatermarkSettingsButtonProps {
  storeName: string
  disabled?: boolean
  className?: string
}

export function WatermarkSettingsButton({ 
  storeName, 
  disabled = false, 
  className = "" 
}: WatermarkSettingsButtonProps) {
  // 默认配置
  const defaultConfig: WatermarkConfig = {
    enabled: false, // 默认不启用水印
    type: 'company',
    text: `© ${storeName}`,
    opacity: 10, // 透明度 10%
    fontSize: 42, // 字体大小 42px
    rotation: 45, // 旋转角度 45°
    position: 'center',
    repeat: 'grid', // 重复模式 网格
    color: 'gray'
  }

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(defaultConfig)

  // 从localStorage加载已保存的配置
  useEffect(() => {
    try {
      const saved = localStorage.getItem('watermarkConfig')
      if (saved) {
        const parsedConfig = JSON.parse(saved)
        setWatermarkConfig({ ...defaultConfig, ...parsedConfig })
      }
    } catch (error) {
      console.warn('Failed to load watermark config:', error)
    }
  }, [storeName])

  const handleConfigChange = (config: WatermarkConfig) => {
    setWatermarkConfig(config)
    // 保存配置到本地存储
    localStorage.setItem('watermarkConfig', JSON.stringify(config))
  }

  return (
    <div className={className}>
      <WatermarkConfigDialog
        defaultConfig={watermarkConfig}
        onConfigChange={handleConfigChange}
        storeName={storeName}
      />
    </div>
  )
}