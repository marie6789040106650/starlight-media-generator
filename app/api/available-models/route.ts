/**
 * 获取可用模型列表 API
 * 用于测试模型过滤功能
 */

import { NextResponse } from 'next/server'
import { getAvailableChatModels, CHAT_MODELS } from '@/lib/models'

export async function GET() {
  try {
    const allModels = CHAT_MODELS
    const availableModels = getAvailableChatModels()
    
    return NextResponse.json({
      success: true,
      data: {
        total: allModels.length,
        available: availableModels.length,
        allModels: allModels.map(m => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          pricing: m.pricing,
          isFree: !m.pricing || (m.pricing.input === 0 && m.pricing.output === 0)
        })),
        availableModels: availableModels.map(m => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          pricing: m.pricing,
          isFree: !m.pricing || (m.pricing.input === 0 && m.pricing.output === 0)
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取模型列表失败'
    }, { status: 500 })
  }
}