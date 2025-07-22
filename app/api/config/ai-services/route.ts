import { NextRequest, NextResponse } from 'next/server'
import { configManager } from '@/lib/config-manager'
import { generateRequestId } from '@/lib/business-utils'

/**
 * GET - 获取AI服务配置状态
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    console.log(`[${requestId}] 获取AI服务配置状态`)
    
    const stats = configManager.getConfigStats()
    const safeConfig = configManager.exportConfig()
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        config: safeConfig
      }
    }, {
      headers: {
        'X-Request-ID': requestId
      }
    })
    
  } catch (error) {
    console.error(`[${requestId}] 获取配置失败:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取配置失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    })
  }
}

/**
 * POST - 更新AI服务配置
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    console.log(`[${requestId}] 更新AI服务配置`)
    
    const body = await request.json()
    const { action, provider, apiKey, enabled, notes } = body
    
    let result: any = {}
    
    switch (action) {
      case 'update_key':
        if (!provider || !apiKey) {
          return NextResponse.json({
            success: false,
            error: '缺少必要参数: provider 和 apiKey'
          }, { status: 400 })
        }
        
        const updateSuccess = configManager.updateApiKey(provider, apiKey, notes)
        result = {
          success: updateSuccess,
          message: updateSuccess ? `${provider} API密钥更新成功` : `${provider} API密钥更新失败`
        }
        break
        
      case 'toggle_service':
        if (!provider || enabled === undefined) {
          return NextResponse.json({
            success: false,
            error: '缺少必要参数: provider 和 enabled'
          }, { status: 400 })
        }
        
        const toggleSuccess = configManager.toggleService(provider, enabled)
        result = {
          success: toggleSuccess,
          message: toggleSuccess ? 
            `${provider} 服务已${enabled ? '启用' : '禁用'}` : 
            `${provider} 服务状态切换失败`
        }
        break
        
      case 'reset_config':
        configManager.resetConfig()
        result = {
          success: true,
          message: '配置已重置为默认值'
        }
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: '不支持的操作类型',
          supportedActions: ['update_key', 'toggle_service', 'reset_config']
        }, { status: 400 })
    }
    
    // 返回更新后的配置状态
    const stats = configManager.getConfigStats()
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        stats
      }
    }, {
      headers: {
        'X-Request-ID': requestId
      }
    })
    
  } catch (error) {
    console.error(`[${requestId}] 更新配置失败:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新配置失败'
    }, {
      status: 500,
      headers: {
        'X-Request-ID': requestId
      }
    })
  }
}