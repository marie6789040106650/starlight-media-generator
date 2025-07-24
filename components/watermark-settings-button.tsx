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
  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    enabled: true,
    text: `© ${storeName}`,
    opacity: 35,
    fontSize: 48,
    rotation: 45,
    position: 'center',
    repeat: 'diagonal',
    color: 'gray'
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