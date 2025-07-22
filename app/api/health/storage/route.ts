import { NextRequest, NextResponse } from 'next/server';
import { persistentStorage } from '@/lib/persistent-storage';
import { generateRequestId } from '@/lib/business-utils';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    console.log(`[${requestId}] Storage health check request`);
    
    // 执行健康检查
    const healthStatus = await persistentStorage.healthCheck();
    
    // 获取存储统计信息
    let storageStats = null;
    try {
      const categoryStats = await persistentStorage.getCategoryStats();
      const storeKeywords = await persistentStorage.getStoreKeywords();
      
      storageStats = {
        categoryStats: {
          customCategories: Object.keys(categoryStats.customCategories).length,
          totalUsage: Object.values(categoryStats.categoryUsageCount).reduce((a, b) => a + b, 0),
          pendingCategories: Object.keys(categoryStats.pendingCategories).length,
          lastUpdated: categoryStats.settings.lastUpdated
        },
        storeKeywords: {
          totalCategories: Object.keys(storeKeywords).length,
          categories: Object.keys(storeKeywords)
        }
      };
    } catch (error) {
      console.warn(`[${requestId}] Failed to get storage stats:`, error);
    }
    
    const response = {
      success: true,
      data: {
        health: healthStatus,
        stats: storageStats,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        hasKV: !!process.env.KV_URL
      }
    };
    
    return NextResponse.json(response, {
      headers: {
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Storage health check error:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '存储健康检查失败',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    });
  }
}