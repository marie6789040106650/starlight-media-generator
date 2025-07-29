
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Palette, Type, Image, Download, RefreshCw } from 'lucide-react';
import { Module3Request, Module3Output, BannerDesign } from '@/lib/business-types';

interface Module3BannerPreviewProps {
  /** 模块3输入数据 */
  requestData: Module3Request;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 错误信息 */
  error?: string;
  /** 生成完成回调 */
  onGenerate?: (data: Module3Request) => void;
  /** 重新生成回调 */
  onRegenerate?: () => void;
}

/**
 * 模块3 Banner设计预览组件
 * 展示基于模块1、2数据生成的Banner设计方案
 */
export default function Module3BannerPreview({
  requestData,
  isLoading = false,
  error,
  onGenerate,
  onRegenerate
}: Module3BannerPreviewProps) {
  const [bannerOutput, setBannerOutput] = useState<Module3Output | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 自动生成Banner设计
  useEffect(() => {
    if (requestData && !bannerOutput && !isLoading && !error) {
      handleGenerate();
    }
  }, [requestData]);

  const handleGenerate = async () => {
    if (!requestData || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/module3-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`生成失败: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setBannerOutput(result.data);
        onGenerate?.(requestData);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (err) {
      console.error('Banner生成错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setBannerOutput(null);
    onRegenerate?.();
    handleGenerate();
  };

  // 渲染加载状态
  if (isLoading || isGenerating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Banner设计生成中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">正在基于您的IP方案生成Banner设计...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Image className="h-5 w-5" />
            Banner生成失败
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleGenerate} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 渲染Banner设计结果
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Banner设计方案
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={handleRegenerate} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {bannerOutput ? (
          <>
            {/* Banner设计预览 */}
            <BannerDesignPreview design={bannerOutput.bannerDesign} />
            
            <Separator />
            
            {/* 图像生成Prompt */}
            <ImagePromptSection prompt={bannerOutput.imagePrompt} />
            
            <Separator />
            
            {/* 设计标签 */}
            <DesignTagsSection tags={bannerOutput.designTags} />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">等待生成Banner设计方案...</p>
            <Button onClick={handleGenerate}>
              开始生成
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Banner设计预览组件
 */
function BannerDesignPreview({ design }: { design: BannerDesign }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Palette className="h-5 w-5" />
        设计方案
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 标题设计 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Type className="h-4 w-4" />
              标题设计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">主标题</p>
              <p className="font-semibold">{design.mainTitle}</p>
            </div>
            {design.subtitle && (
              <div>
                <p className="text-sm text-muted-foreground">副标题</p>
                <p className="text-sm">{design.subtitle}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 视觉风格 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">视觉风格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">背景风格</p>
              <p className="text-sm">{design.backgroundStyle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">色调方案</p>
              <p className="text-sm">{design.colorTheme}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">字体风格</p>
              <p className="text-sm">{design.fontStyle}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 视觉符号 */}
      {design.visualSymbols.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">推荐视觉符号</p>
          <div className="flex flex-wrap gap-2">
            {design.visualSymbols.map((symbol, index) => (
              <Badge key={index} variant="secondary">
                {symbol}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 图像生成Prompt部分
 */
function ImagePromptSection({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">图像生成Prompt</h3>
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <pre className="text-sm bg-muted p-4 rounded-md whitespace-pre-wrap">
              {prompt}
            </pre>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
            >
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        可将此Prompt用于Midjourney、DALL-E等图像生成工具
      </p>
    </div>
  );
}

/**
 * 设计标签部分
 */
function DesignTagsSection({ tags }: { tags: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">设计标签</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        这些标签可用于进一步优化设计方向
      </p>
    </div>
  );
}