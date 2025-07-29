/**
 * 带高级保护功能的导出组件
 * 集成多层水印和用户追踪功能
 */

"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Download, User, Clock, AlertTriangle } from "lucide-react";
import { addContentProtection, ProtectionPresets } from "@/lib/utils/advanced-watermark-protection";

interface ExportWithProtectionProps {
  content: string;
  title: string;
  storeName: string;
  onExport?: (result: { success: boolean; message: string }) => void;
}

interface UserInfo {
  name: string;
  email: string;
  department?: string;
}

export const AdvancedExportWithProtection: React.FC<ExportWithProtectionProps> = ({
  content,
  title,
  storeName,
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [protectionLevel, setProtectionLevel] = useState<'basic' | 'standard' | 'maximum'>('standard');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    department: ''
  });
  const [requireUserInfo, setRequireUserInfo] = useState(true);
  const [trackDownloads, setTrackDownloads] = useState(true);

  const handleExport = async () => {
    if (requireUserInfo && (!userInfo.name || !userInfo.email)) {
      alert('请填写完整的用户信息');
      return;
    }

    setIsExporting(true);
    
    try {
      // 1. 生成基础PDF
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          title,
          storeName
        })
      });

      if (!response.ok) {
        throw new Error('PDF生成失败');
      }

      const pdfBuffer = await response.arrayBuffer();

      // 2. 添加高级保护
      const protectionResult = await addContentProtection(
        pdfBuffer,
        {
          name: userInfo.name,
          email: userInfo.email,
          timestamp: new Date(),
          ipAddress: await getUserIP()
        },
        {
          companyName: storeName,
          protectionLevel,
          includeTracking: trackDownloads
        }
      );

      if (!protectionResult.success) {
        throw new Error(protectionResult.error || '添加保护失败');
      }

      // 3. 下载文件
      const blob = new Blob([protectionResult.pdfBytes!], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_protected.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 4. 记录下载
      if (trackDownloads) {
        await recordDownload({
          title,
          userInfo,
          protectionLevel,
          timestamp: new Date()
        });
      }

      onExport?.({ success: true, message: '导出成功' });
      setIsOpen(false);
      
    } catch (error) {
      console.error('导出失败:', error);
      onExport?.({ 
        success: false, 
        message: error instanceof Error ? error.message : '导出失败' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Shield className="h-4 w-4 mr-2" />
          安全导出PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            安全导出设置
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 保护级别选择 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">保护级别</Label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(ProtectionPresets).map(([key, preset]) => (
                <div
                  key={key}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    protectionLevel === key 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setProtectionLevel(key as any)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium capitalize">{key}</div>
                      <div className="text-sm text-gray-600">{preset.description}</div>
                    </div>
                    <Badge variant={protectionLevel === key ? "default" : "secondary"}>
                      {key === 'basic' && '基础'}
                      {key === 'standard' && '标准'}
                      {key === 'maximum' && '最高'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>        
  {/* 用户信息收集 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">用户信息</Label>
              <Switch
                checked={requireUserInfo}
                onCheckedChange={setRequireUserInfo}
              />
            </div>
            
            {requireUserInfo && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="user-name">姓名 *</Label>
                  <Input
                    id="user-name"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入您的姓名"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-email">邮箱 *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="请输入您的邮箱"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user-department">部门</Label>
                  <Input
                    id="user-department"
                    value={userInfo.department}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="请输入您的部门（可选）"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 下载追踪 */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">下载追踪</Label>
              <p className="text-sm text-gray-600">记录下载信息以便追踪文档使用</p>
            </div>
            <Switch
              checked={trackDownloads}
              onCheckedChange={setTrackDownloads}
            />
          </div>

          {/* 安全提示 */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>安全提示：</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• 导出的PDF将包含多层水印保护</li>
                <li>• 用户信息将嵌入到文档中用于追踪</li>
                <li>• 请确保仅将文档分享给授权人员</li>
                {protectionLevel === 'maximum' && (
                  <li>• 最高保护级别包含密集防截图水印</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          {/* 导出按钮 */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              取消
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || (requireUserInfo && (!userInfo.name || !userInfo.email))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  导出中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  安全导出
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * 获取用户IP地址
 */
async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 记录下载信息
 */
async function recordDownload(downloadInfo: {
  title: string;
  userInfo: UserInfo;
  protectionLevel: string;
  timestamp: Date;
}): Promise<void> {
  try {
    await fetch('/api/record-download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...downloadInfo,
        timestamp: downloadInfo.timestamp.toISOString()
      })
    });
  } catch (error) {
    console.warn('下载记录失败:', error);
    // 不影响主要功能，只记录警告
  }
}