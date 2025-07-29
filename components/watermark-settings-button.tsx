/**
 * 水印设置按钮组件
 * 专门用于主页面的水印设置功能
 */

"use client"

import { useState } from "react"
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
  // 从localStorage加载配置，如果没有则使用默认配置
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('watermarkConfig')
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (error) {
        console.warn('加载水印配置失败:', error)
      }
    }
    
    // 默认配置（关闭状态）
    return {
      enabled: false,
      text: `© ${storeName}`,
      opacity: 20,
      fontSize: 48,
      rotation: 45,
      position: 'center',
      repeat: 'diagonal',
      color: 'gray'
    }
  })

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