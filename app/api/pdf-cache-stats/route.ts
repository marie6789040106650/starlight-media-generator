import { NextRequest, NextResponse } from 'next/server'
import { getGlobalTempFileManager } from '@/lib/temp-file-manager'

/**
 * GET request handler - PDF缓存统计信息
 */
export async function GET() {
  try {
    const tempFileManager = getGlobalTempFileManager()
    const stats = tempFileManager.getCacheStats()
    
    return NextResponse.json({
      status: 'ok',
      cache: {
        totalFiles: stats.totalFiles,
        totalSize: stats.totalSize,
        maxSize: stats.maxSize,
        hitRate: Math.round(stats.hitRate * 100) / 100,
        utilizationRate: Math.round((stats.totalSize / stats.maxSize) * 10000) / 100,
        oldestFile: stats.oldestFile ? {
          created: new Date(stats.oldestFile.created).toISOString(),
          lastAccessed: new Date(stats.oldestFile.lastAccessed).toISOString(),
          accessCount: stats.oldestFile.accessCount,
          size: stats.oldestFile.size
        } : null,
        mostAccessed: stats.mostAccessed ? {
          created: new Date(stats.mostAccessed.created).toISOString(),
          lastAccessed: new Date(stats.mostAccessed.lastAccessed).toISOString(),
          accessCount: stats.mostAccessed.accessCount,
          size: stats.mostAccessed.size
        } : null
      },
      performance: {
        cacheEnabled: true,
        autoCleanupEnabled: true,
        recommendations: generateRecommendations(stats)
      }
    })
  } catch (error) {
    console.error('获取缓存统计失败:', error)
    return NextResponse.json({
      status: 'error',
      message: '无法获取缓存统计信息',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * POST request handler - 缓存管理操作
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const tempFileManager = getGlobalTempFileManager()
    
    switch (action) {
      case 'cleanup-expired':
        const cleanedCount = await tempFileManager.cleanupExpiredFiles()
        return NextResponse.json({
          status: 'ok',
          message: `清理了 ${cleanedCount} 个过期文件`,
          cleanedCount
        })
        
      case 'force-cleanup':
        await tempFileManager.forceCacheCleanup()
        return NextResponse.json({
          status: 'ok',
          message: '强制清理缓存完成'
        })
        
      case 'full-cleanup':
        await tempFileManager.cleanup()
        return NextResponse.json({
          status: 'ok',
          message: '完全清理缓存完成'
        })
        
      default:
        return NextResponse.json({
          status: 'error',
          message: '不支持的操作',
          supportedActions: ['cleanup-expired', 'force-cleanup', 'full-cleanup']
        }, { status: 400 })
    }
  } catch (error) {
    console.error('缓存管理操作失败:', error)
    return NextResponse.json({
      status: 'error',
      message: '缓存管理操作失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

/**
 * 生成性能优化建议
 */
function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = []
  
  // 缓存利用率建议
  const utilizationRate = (stats.totalSize / stats.maxSize) * 100
  if (utilizationRate > 90) {
    recommendations.push('缓存使用率过高，建议增加缓存大小或更频繁清理')
  } else if (utilizationRate < 20) {
    recommendations.push('缓存使用率较低，可以考虑减少缓存大小以节省内存')
  }
  
  // 命中率建议
  if (stats.hitRate < 30) {
    recommendations.push('缓存命中率较低，可能需要调整缓存策略或增加缓存时间')
  } else if (stats.hitRate > 80) {
    recommendations.push('缓存命中率很高，系统性能良好')
  }
  
  // 文件数量建议
  if (stats.totalFiles > 100) {
    recommendations.push('缓存文件数量较多，建议启用更积极的清理策略')
  }
  
  // 默认建议
  if (recommendations.length === 0) {
    recommendations.push('缓存状态正常，无需特殊优化')
  }
  
  return recommendations
}