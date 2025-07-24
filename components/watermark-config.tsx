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
import "../styles/watermark-preview.css";

export interface WatermarkConfig {
  enabled: boolean;
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
    enabled: true,
    text: `© ${storeName}`,
    opacity: 30,
    fontSize: 48,
    rotation: 45,
    position: 'center',
    repeat: 'diagonal',
    color: 'gray',
    ...defaultConfig
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleConfigChange = (key: keyof WatermarkConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  // 渲染水印预览效果
  const renderWatermarkPreview = () => {
    const colorMap = {
      gray: '#6b7280',
      red: '#ef4444', 
      blue: '#3b82f6',
      black: '#000000'
    };

    const getWatermarkStyle = (index = 0) => ({
      color: colorMap[config.color],
      opacity: config.opacity / 100,
      fontSize: `${Math.max(config.fontSize / 3.5, 12)}px`, // 优化预览大小
      transform: `rotate(${config.rotation}deg)`,
      transformOrigin: 'center'
    });

    const getPosition = (index = 0) => {
      const containerWidth = 300; // 预览容器宽度
      const containerHeight = 200; // 预览容器高度
      
      switch (config.position) {
        case 'top-left':
          return { top: '10px', left: '10px' };
        case 'top-right':
          return { top: '10px', right: '10px' };
        case 'bottom-left':
          return { bottom: '10px', left: '10px' };
        case 'bottom-right':
          return { bottom: '10px', right: '10px' };
        case 'center':
        default:
          return { 
            top: '50%', 
            left: '50%', 
            transform: `translate(-50%, -50%) rotate(${config.rotation}deg)` 
          };
      }
    };

    const renderSingleWatermark = (index = 0) => (
      <div
        key={index}
        className="watermark-element"
        style={{
          ...getWatermarkStyle(index),
          ...getPosition(index)
        }}
      >
        {config.text}
      </div>
    );

    const renderDiagonalWatermarks = () => {
      const watermarks = [];
      const spacing = 70; // 优化间距
      
      for (let i = -1; i <= 2; i++) {
        for (let j = -1; j <= 2; j++) {
          watermarks.push(
            <div
              key={`diagonal-${i}-${j}`}
              className="watermark-element"
              style={{
                ...getWatermarkStyle(),
                position: 'absolute',
                top: `${60 + i * spacing}px`,
                left: `${40 + j * spacing}px`,
                transform: `rotate(${config.rotation}deg)`
              }}
            >
              {config.text}
            </div>
          );
        }
      }
      return watermarks;
    };

    const renderGridWatermarks = () => {
      const watermarks = [];
      const spacingX = 80; // 水平间距
      const spacingY = 50; // 垂直间距
      
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          watermarks.push(
            <div
              key={`grid-${i}-${j}`}
              className="watermark-element"
              style={{
                ...getWatermarkStyle(),
                position: 'absolute',
                top: `${30 + i * spacingY}px`,
                left: `${30 + j * spacingX}px`,
                transform: `rotate(${config.rotation}deg)`
              }}
            >
              {config.text}
            </div>
          );
        }
      }
      return watermarks;
    };

    switch (config.repeat) {
      case 'diagonal':
        return renderDiagonalWatermarks();
      case 'grid':
        return renderGridWatermarks();
      case 'none':
      default:
        return renderSingleWatermark();
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
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">水印设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            水印配置与预览
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：配置选项 */}
          <div className="space-y-4">
          {/* 启用水印 */}
          <div className="flex items-center justify-between">
            <Label htmlFor="watermark-enabled">启用水印</Label>
            <Switch
              id="watermark-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
          </div>

          {config.enabled && (
            <>
              {/* 水印文本 */}
              <div className="space-y-2">
                <Label htmlFor="watermark-text">水印文本</Label>
                <Input
                  id="watermark-text"
                  value={config.text}
                  onChange={(e) => handleConfigChange('text', e.target.value)}
                  placeholder="输入水印文本"
                />
              </div>

              {/* 透明度 */}
              <div className="space-y-2">
                <Label>透明度: {config.opacity}%</Label>
                <Slider
                  value={[config.opacity]}
                  onValueChange={([value]) => handleConfigChange('opacity', value)}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* 字体大小 */}
              <div className="space-y-2">
                <Label>字体大小: {config.fontSize}px</Label>
                <Slider
                  value={[config.fontSize]}
                  onValueChange={([value]) => handleConfigChange('fontSize', value)}
                  max={100}
                  min={20}
                  step={4}
                  className="w-full"
                />
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
          </div>

          {/* 右侧：预览区域 */}
          <div className="space-y-4">
            <div className="sticky top-0">
              {/* 水印预览 */}
              <div className="space-y-3">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2 text-blue-600" />
              <Label className="text-sm font-medium">水印预览效果</Label>
            </div>
            
            <div className="watermark-preview-container">
              {/* 模拟文档内容 */}
              <div className="watermark-preview-content">
                <h3>《星光传媒营销方案》</h3>
                <p className="text-gray-700">
                  本方案针对目标客户群体制定了完整的营销策略，
                  包含品牌定位、内容策略、渠道布局等核心要素。
                </p>
                <p className="text-gray-600">
                  水印将根据您的设置叠加在文档内容之上，
                  为您的知识产权提供有效保护。
                </p>
              </div>

              {/* 水印效果 */}
              {config.enabled && renderWatermarkPreview()}
            </div>
            
            <div className="watermark-preview-note">
              * 预览效果仅供参考，实际导出效果可能因文档内容而略有差异
            </div>
            
            {/* 配置摘要 */}
            {config.enabled && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">当前配置</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>文本: {config.text}</div>
                  <div>透明度: {config.opacity}%</div>
                  <div>大小: {config.fontSize}px</div>
                  <div>角度: {config.rotation}°</div>
                  <div>位置: {
                    config.position === 'center' ? '居中' :
                    config.position === 'top-left' ? '左上角' :
                    config.position === 'top-right' ? '右上角' :
                    config.position === 'bottom-left' ? '左下角' : '右下角'
                  }</div>
                  <div>模式: {
                    config.repeat === 'none' ? '单个' :
                    config.repeat === 'diagonal' ? '对角线' : '网格'
                  }</div>
                  <div>颜色: {
                    config.color === 'gray' ? '灰色' :
                    config.color === 'red' ? '红色' :
                    config.color === 'blue' ? '蓝色' : '黑色'
                  }</div>
                </div>
              </div>
            )}
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