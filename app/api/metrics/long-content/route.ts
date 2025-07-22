import { NextRequest, NextResponse } from 'next/server'
import { 
  getLongContentMetrics, 
  resetLongContentMetrics,
  validateLongContentCapability,
  getPromptOptimizationTips
} from '@/lib/long-content-config'
import { generateRequestId } from '@/lib/business-utils'

/**
 * GET - 获取长内容生成统计信息
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    console.log(`[${requestId}] 获取长内容生成统计`)
    
    const metrics = getLongContentMetrics()
    const capability = validateLongContentCapability()
    const optimizationTips = getPromptOptimizationTips()
    
    // 计算成功率
    const successRate = metrics.totalRequests > 0 ? 
      Math.round((metrics.successfulRequests / metrics.totalRequests) * 100) : 0
    
    // 计算平均成本
    const averageCost = metrics.successfulRequests > 0 ? 
      Math.round((metrics.totalCost / metrics.successfulRequests) * 1000) / 1000 : 0
    
    return NextResponse.json({
      success: true,
      data: {
        // 基础统计
        metrics: {
          ...metrics,
          successRate: `${successRate}%`,
          averageCost: `¥${averageCost}`,
          totalCost: `¥${Math.round(metrics.totalCost * 100) / 100}`
        },
        
        // 能力验证
        capability: {
          ...capability,
          estimatedCost: `¥${capability.estimatedCost}`
        },
        
        // 优化建议
        optimization: {
          tips: optimizationTips,
          recommendations: generateRecommendations(metrics, capability)
        },
        
        // 性能分析
        performance: {
          avgOutputLength: `${metrics.averageOutputLength} 字符`,
          avgResponseTime: `${metrics.averageResponseTime}ms`,
          efficiency: calculateEfficiency(metrics),
          status: getPerformanceStatus(metrics)
        }
      }
    }, {
      headers: {
        'X-Request-ID': requestId
      }
    })
    
  } catch (error) {
    console.error(`[${requestId}] 获取长内容统计失败:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取统计失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    })
  }
}

/**
 * POST - 重置统计数据
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    console.log(`[${requestId}] 重置长内容生成统计`)
    
    const body = await request.json()
    const { action } = body
    
    if (action === 'reset') {
      resetLongContentMetrics()
      
      return NextResponse.json({
        success: true,
        message: '统计数据已重置'
      }, {
        headers: {
          'X-Request-ID': requestId
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      error: '不支持的操作',
      supportedActions: ['reset']
    }, { status: 400 })
    
  } catch (error) {
    console.error(`[${requestId}] 重置统计失败:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '重置失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    })
  }
}

/**
 * 生成优化建议
 */
function generateRecommendations(metrics: any, capability: any): string[] {
  const recommendations: string[] = []
  
  // 基于成功率的建议
  const successRate = metrics.totalRequests > 0 ? 
    (metrics.successfulRequests / metrics.totalRequests) * 100 : 100
  
  if (successRate < 80) {
    recommendations.push('成功率较低，建议检查提示词格式和模型配置')
  }
  
  // 基于响应时间的建议
  if (metrics.averageResponseTime > 60000) {
    recommendations.push('响应时间较长，建议优化提示词长度或切换到更快的模型')
  }
  
  // 基于输出长度的建议
  if (metrics.averageOutputLength < 3000) {
    recommendations.push('输出内容较短，可以在提示词中要求更详细的内容')
  } else if (metrics.averageOutputLength > 15000) {
    recommendations.push('输出内容很长，注意控制成本和响应时间')
  }
  
  // 基于成本的建议
  const averageCost = metrics.successfulRequests > 0 ? 
    metrics.totalCost / metrics.successfulRequests : 0
  
  if (averageCost > 0.5) {
    recommendations.push('单次成本较高，建议优化提示词或使用更经济的模型')
  }
  
  // 基于模型能力的建议
  if (!capability.isSupported) {
    recommendations.push('当前模型不太适合长内容生成，建议切换到Gemini Pro或Kimi')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('性能表现良好，继续保持当前配置')
  }
  
  return recommendations
}

/**
 * 计算效率指标
 */
function calculateEfficiency(metrics: any): string {
  if (metrics.totalRequests === 0) return '暂无数据'
  
  // 效率 = 成功率 × 输出质量 / 响应时间
  const successRate = metrics.successfulRequests / metrics.totalRequests
  const outputQuality = Math.min(metrics.averageOutputLength / 5000, 1) // 5000字符为满分
  const timeEfficiency = Math.max(1 - (metrics.averageResponseTime / 120000), 0) // 2分钟为基准
  
  const efficiency = (successRate * 0.4 + outputQuality * 0.3 + timeEfficiency * 0.3) * 100
  
  return `${Math.round(efficiency)}%`
}

/**
 * 获取性能状态
 */
function getPerformanceStatus(metrics: any): string {
  if (metrics.totalRequests === 0) return '未开始'
  
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100
  
  if (successRate >= 95) return '优秀'
  if (successRate >= 85) return '良好'
  if (successRate >= 70) return '一般'
  return '需要优化'
}