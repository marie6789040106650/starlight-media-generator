import { NextRequest, NextResponse } from 'next/server'
import { storeKeywordManager, ownerKeywordManager } from '@/lib/keyword-manager'

export async function POST(request: NextRequest) {
  try {
    const { storeFeatures, ownerFeatures, storeCategory } = await request.json()
    
    console.log('收到关键词拓展请求:', { storeFeatures, ownerFeatures, storeCategory })
    
    // 使用新的关键词管理器获取相关关键词
    const expandedStoreFeatures = await storeKeywordManager.getRelevantKeywords(
      storeCategory || '其他', 
      parseFeatures(storeFeatures)
    )
    
    const expandedBossFeatures = ownerKeywordManager.getRelevantKeywords(
      parseFeatures(ownerFeatures)
    )
    
    const result = {
      expanded_store_features: expandedStoreFeatures,
      expanded_boss_features: expandedBossFeatures
    }
    
    console.log('关键词拓展结果:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('关键词拓展API错误:', error)
    return NextResponse.json(
      { error: '关键词拓展失败' },
      { status: 500 }
    )
  }
}

/**
 * 解析特色字符串为数组
 */
function parseFeatures(features: string): string[] {
  if (!features) return []
  return features.split(/[、，,]/).map(f => f.trim()).filter(f => f.length > 0)
}

