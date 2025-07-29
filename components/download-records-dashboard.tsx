/**
 * 下载记录管理面板
 * 用于查看和管理PDF下载记录
 */

"use client"

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Download, Shield, User, Calendar, MapPin, RefreshCw } from "lucide-react";

interface DownloadRecord {
  id: string;
  title: string;
  userInfo: {
    name: string;
    email: string;
    department?: string;
  };
  protectionLevel: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export const DownloadRecordsDashboard: React.FC = () => {
  const [records, setRecords] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DownloadRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/record-download?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('加载下载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProtectionLevelBadge = (level: string) => {
    const variants = {
      basic: { variant: "secondary" as const, label: "基础", color: "bg-gray-100" },
      standard: { variant: "default" as const, label: "标准", color: "bg-blue-100" },
      maximum: { variant: "destructive" as const, label: "最高", color: "bg-red-100" }
    };
    
    const config = variants[level as keyof typeof variants] || variants.basic;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getStats = () => {
    const total = records.length;
    const today = new Date().toDateString();
    const todayCount = records.filter(r => 
      new Date(r.timestamp).toDateString() === today
    ).length;
    
    const protectionLevels = records.reduce((acc, record) => {
      acc[record.protectionLevel] = (acc[record.protectionLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, todayCount, protectionLevels };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">总下载量</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">今日下载</p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">高级保护</p>
                <p className="text-2xl font-bold">{stats.protectionLevels.maximum || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">标准保护</p>
                <p className="text-2xl font-bold">{stats.protectionLevels.standard || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>     
 {/* 搜索和刷新 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>下载记录</span>
            <Button onClick={loadRecords} disabled={loading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索文档标题、用户姓名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* 记录表格 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文档标题</TableHead>
                  <TableHead>用户信息</TableHead>
                  <TableHead>保护级别</TableHead>
                  <TableHead>下载时间</TableHead>
                  <TableHead>IP地址</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? '没有找到匹配的记录' : '暂无下载记录'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.title}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.userInfo.name}</div>
                          <div className="text-sm text-gray-600">{record.userInfo.email}</div>
                          {record.userInfo.department && (
                            <div className="text-xs text-gray-500">{record.userInfo.department}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProtectionLevelBadge(record.protectionLevel)}
                      </TableCell>
                      <TableCell>
                        {formatDate(record.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {record.ipAddress || 'unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRecord(record)}
                            >
                              详情
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>下载记录详情</DialogTitle>
                            </DialogHeader>
                            {selectedRecord && (
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-medium">记录ID</Label>
                                  <p className="text-sm text-gray-600 font-mono">{selectedRecord.id}</p>
                                </div>
                                
                                <div>
                                  <Label className="font-medium">文档标题</Label>
                                  <p className="text-sm text-gray-600">{selectedRecord.title}</p>
                                </div>
                                
                                <div>
                                  <Label className="font-medium">用户信息</Label>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>姓名: {selectedRecord.userInfo.name}</p>
                                    <p>邮箱: {selectedRecord.userInfo.email}</p>
                                    {selectedRecord.userInfo.department && (
                                      <p>部门: {selectedRecord.userInfo.department}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="font-medium">技术信息</Label>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <p>IP地址: {selectedRecord.ipAddress}</p>
                                    <p>用户代理: {selectedRecord.userAgent}</p>
                                    <p>下载时间: {formatDate(selectedRecord.timestamp)}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="font-medium">保护级别</Label>
                                  <div className="mt-1">
                                    {getProtectionLevelBadge(selectedRecord.protectionLevel)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 添加Label组件的简单实现（如果不存在）
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = "", 
  children 
}) => (
  <label className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);