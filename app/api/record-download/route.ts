/**
 * 下载记录API
 * 记录PDF下载信息用于安全追踪
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 生成下载记录
    const record: DownloadRecord = {
      id: generateRecordId(),
      title: body.title,
      userInfo: body.userInfo,
      protectionLevel: body.protectionLevel,
      timestamp: body.timestamp,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // 保存记录到文件
    await saveDownloadRecord(record);

    return NextResponse.json({
      success: true,
      recordId: record.id,
      message: '下载记录已保存'
    });

  } catch (error) {
    console.error('保存下载记录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '保存失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 获取下载记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const records = await getDownloadRecords(limit, offset);
    
    return NextResponse.json({
      success: true,
      records,
      total: records.length
    });

  } catch (error) {
    console.error('获取下载记录失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '获取失败' 
      },
      { status: 500 }
    );
  }
}

/**
 * 生成记录ID
 */
function generateRecordId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `dl_${timestamp}_${random}`;
}

/**
 * 获取客户端IP
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * 保存下载记录
 */
async function saveDownloadRecord(record: DownloadRecord): Promise<void> {
  const logsDir = path.join(process.cwd(), 'logs');
  const recordsFile = path.join(logsDir, 'download-records.jsonl');
  
  // 确保日志目录存在
  if (!existsSync(logsDir)) {
    await mkdir(logsDir, { recursive: true });
  }
  
  // 追加记录到文件（JSONL格式）
  const recordLine = JSON.stringify(record) + '\n';
  await writeFile(recordsFile, recordLine, { flag: 'a' });
}

/**
 * 获取下载记录
 */
async function getDownloadRecords(limit: number, offset: number): Promise<DownloadRecord[]> {
  const logsDir = path.join(process.cwd(), 'logs');
  const recordsFile = path.join(logsDir, 'download-records.jsonl');
  
  if (!existsSync(recordsFile)) {
    return [];
  }
  
  try {
    const content = await readFile(recordsFile, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    const records = lines
      .map(line => {
        try {
          return JSON.parse(line) as DownloadRecord;
        } catch {
          return null;
        }
      })
      .filter((record): record is DownloadRecord => record !== null)
      .reverse() // 最新的在前面
      .slice(offset, offset + limit);
    
    return records;
  } catch (error) {
    console.error('读取下载记录失败:', error);
    return [];
  }
}