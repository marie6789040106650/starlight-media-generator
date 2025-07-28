/**
 * PDF 水印配置组件
 * 允许用户自定义水印设置
 */

"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Eye } from "lucide-react";

export interface WatermarkConfig {
  enabled: boolean;
  type: 'company' | 'confidential' | 'custom';
  text: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  repeat: 'none' | 'diagonal' | 'grid';
  color: 'gray' | 'red' | 'blue' | 'black';
}

interface WatermarkConfigProps {
  defaultConfig?: Partial<WatermarkConfig>;
  onConfigChange: (config: WatermarkConfig) => void;
  storeName: string;
}

export const WatermarkConfigDialog: React.FC<WatermarkConfigProps> = ({
  defaultConfig = {},
  onConfigChange,
  storeName
}) => {
  const [config, setConfig] = useState<WatermarkConfig>({
    enabled: false, // 默认不启用水印
    type: 'company',
    text: `© ${storeName}`,
    opacity: 15, // 透明度 15%
    fontSize: 42, // 字体大小 42px
    rotation: 45, // 旋转角度 45°
    position: 'center',
    repeat: 'grid', // 重复模式 网格
    color: 'gray',
    ...defaultConfig
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleConfigChange = (key: keyof WatermarkConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    
    // 根据类型自动调整文本
    if (key === 'type') {
      switch (value) {
        case 'company':
          newConfig.text = `© ${storeName}`;
          newConfig.color = 'gray';
          newConfig.opacity = 15;
          break;
        case 'confidential':
          newConfig.text = '机密文档 CONFIDENTIAL';
          newConfig.color = 'red';
          newConfig.opacity = 40;
          break;
        case 'custom':
          // 保持用户自定义的文本
          break;
      }
    }
    
    setConfig(newConfig);
    onConfigChange(newConfig);
    
    // 立即保存到localStorage，确保实时生效
    try {
      localStorage.setItem('watermarkConfig', JSON.stringify(newConfig));
    } catch (error) {
      console.warn('Failed to save watermark config:', error);
    }
  };

  const colorMap = {
    gray: { r: 0.5, g: 0.5, b: 0.5 },
    red: { r: 1, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 1 },
    black: { r: 0, g: 0, b: 0 }
  };

  const positionMap = {
    center: { x: 'center', y: 'center' },
    'top-left': { x: 'left', y: 'top' },
    'top-right': { x: 'right', y: 'top' },
    'bottom-left': { x: 'left', y: 'bottom' },
    'bottom-right': { x: 'right', y: 'bottom' }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          水印设置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>PDF 水印配置</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 启用水印 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="watermark-enabled">启用水印</Label>
              <Switch
                id="watermark-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
              />
            </div>
            <div className="text-xs text-gray-500">
              {config.enabled ? (
                <span className="text-green-600">✅ 水印已启用，将在分页模式中实时显示</span>
              ) : (
                <span className="text-gray-500">❌ 水印已禁用</span>
              )}
            </div>
          </div>

          {config.enabled && (
            <>
              {/* 水印类型 */}
              <div className="space-y-2">
                <Label>水印类型</Label>
                <Select
                  value={config.type}
                  onValueChange={(value) => handleConfigChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">公司水印 (推荐)</SelectItem>
                    <SelectItem value="confidential">机密文档 (中英混合)</SelectItem>
                    <SelectItem value="custom">自定义 (支持中英文混合)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-gray-500 mt-1">
                  💡 支持中文、英文、数字混合显示，已针对A4纸张优化
                </div>
              </div>

              {/* 水印文本 */}
              <div className="space-y-2">
                <Label htmlFor="watermark-text">水印文本</Label>
                <Input
                  id="watermark-text"
                  value={config.text}
                  onChange={(e) => handleConfigChange('text', e.target.value)}
                  placeholder="支持中文、English、123混合输入"
                />
                <div className="text-xs text-gray-500">
                  💡 示例：机密文档 CONFIDENTIAL、© 2024 星光传媒、内部资料 INTERNAL
                </div>
              </div>

              {/* 透明度 */}
              <div className="space-y-2">
                <Label>透明度: {config.opacity}%</Label>
                <Slider
                  value={[config.opacity]}
                  onValueChange={([value]) => handleConfigChange('opacity', value)}
                  max={50}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>10-15%: 正式文档</span>
                  <span>15-20%: 标准保护</span>
                  <span>20%+: 重要文档</span>
                </div>
              </div>

              {/* 字体大小 */}
              <div className="space-y-2">
                <Label>字体大小: {config.fontSize}px</Label>
                <Slider
                  value={[config.fontSize]}
                  onValueChange={([value]) => handleConfigChange('fontSize', value)}
                  max={72}
                  min={24}
                  step={6}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>36px: 低调</span>
                  <span>42px: 标准</span>
                  <span>48px+: 显眼</span>
                </div>
              </div>

              {/* 旋转角度 */}
              <div className="space-y-2">
                <Label>旋转角度: {config.rotation}°</Label>
                <Slider
                  value={[config.rotation]}
                  onValueChange={([value]) => handleConfigChange('rotation', value)}
                  max={90}
                  min={-90}
                  step={15}
                  className="w-full"
                />
              </div>

              {/* 位置 */}
              <div className="space-y-2">
                <Label>位置</Label>
                <Select
                  value={config.position}
                  onValueChange={(value) => handleConfigChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">居中</SelectItem>
                    <SelectItem value="top-left">左上角</SelectItem>
                    <SelectItem value="top-right">右上角</SelectItem>
                    <SelectItem value="bottom-left">左下角</SelectItem>
                    <SelectItem value="bottom-right">右下角</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 重复模式 */}
              <div className="space-y-2">
                <Label>重复模式</Label>
                <Select
                  value={config.repeat}
                  onValueChange={(value) => handleConfigChange('repeat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">单个</SelectItem>
                    <SelectItem value="diagonal">对角线</SelectItem>
                    <SelectItem value="grid">网格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 颜色 */}
              <div className="space-y-2">
                <Label>颜色</Label>
                <Select
                  value={config.color}
                  onValueChange={(value) => handleConfigChange('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gray">灰色</SelectItem>
                    <SelectItem value="red">红色</SelectItem>
                    <SelectItem value="blue">蓝色</SelectItem>
                    <SelectItem value="black">黑色</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 快速模板 */}
          {config.type === 'custom' && (
            <div className="space-y-2">
              <Label>快速模板 (中英文混合)</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigChange('text', '机密文档 CONFIDENTIAL')}
                  className="text-xs justify-start"
                >
                  机密文档 CONFIDENTIAL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigChange('text', '内部资料 INTERNAL USE ONLY')}
                  className="text-xs justify-start"
                >
                  内部资料 INTERNAL USE ONLY
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigChange('text', `© 2024 ${storeName} 版权所有`)}
                  className="text-xs justify-start"
                >
                  © 2024 {storeName} 版权所有
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConfigChange('text', '草稿 DRAFT - 请勿外传')}
                  className="text-xs justify-start"
                >
                  草稿 DRAFT - 请勿外传
                </Button>
              </div>
            </div>
          )}

          {/* 预览说明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center text-blue-800 text-sm">
              <Eye className="h-4 w-4 mr-2" />
              <div>
                <div>水印效果将在分页模式和导出的 PDF 中显示</div>
                <div className="text-xs mt-1 text-blue-600">
                  💡 支持中文、英文、数字混合显示，配置修改后立即生效
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * 将配置转换为水印选项
 */
export function configToWatermarkOptions(config: WatermarkConfig) {
  const colorMap = {
    gray: { r: 0.5, g: 0.5, b: 0.5 },
    red: { r: 1, g: 0, b: 0 },
    blue: { r: 0, g: 0, b: 1 },
    black: { r: 0, g: 0, b: 0 }
  };

  const positionMap = {
    center: { x: 'center', y: 'center' },
    'top-left': { x: 'left', y: 'top' },
    'top-right': { x: 'right', y: 'top' },
    'bottom-left': { x: 'left', y: 'bottom' },
    'bottom-right': { x: 'right', y: 'bottom' }
  };

  return {
    text: config.text,
    opacity: config.opacity / 100,
    fontSize: config.fontSize,
    rotation: config.rotation,
    position: positionMap[config.position],
    repeat: config.repeat,
    color: colorMap[config.color]
  };
}