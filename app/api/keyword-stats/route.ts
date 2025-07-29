import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STATS_FILE_PATH = path.join(process.cwd(), 'config', 'keyword-stats.json')

// 解析关键词的工具函数
function parseKeywords(text: string): string[] {
  if (!text) return []
  return text.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
}

// 读取关键词统计数据
function readKeywordStats() {
  try {
    if (!fs.existsSync(STATS_FILE_PATH)) {
      // 如果文件不存在，创建默认数据
      const defaultStats = {
        storeCategories: {
          "餐饮": 0,
          "美业": 0,
          "教育培训": 0,
          "零售": 0,
          "服务业": 0,
          "其他": 0
        },
        storeFeatures: {},
        ownerFeatures: {},
        categoryFeatureMapping: {}
      }
      fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(defaultStats, null, 2))
      return defaultStats
    }

    const data = fs.readFileSync(STATS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取关键词统计文件失败:', error)
    return {
      storeCategories: {},
      storeFeatures: {},
      ownerFeatures: {},
      categoryFeatureMapping: {}
    }
  }
}

// 写入关键词统计数据
function writeKeywordStats(stats: any) {
  try {
    // 确保目录存在
    const dir = path.dirname(STATS_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('写入关键词统计文件失败:', error)
    throw error
  }
}

// GET - 获取关键词统计数据
export async function GET() {
  try {
    const stats = readKeywordStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取关键词统计失败:', error)
    return NextResponse.json(
      { error: '获取关键词统计失败' },
      { status: 500 }
    )
  }
}

// POST - 更新关键词统计数据
export async function POST(request: NextRequest) {
  try {
    const { storeCategory, storeFeatures, ownerFeatures } = await request.json()

    // 读取当前统计数据
    const stats = readKeywordStats()

    // 更新店铺品类统计
    if (storeCategory) {
      stats.storeCategories[storeCategory] = (stats.storeCategories[storeCategory] || 0) + 1
    }

    // 更新店铺特色关键词统计
    if (storeFeatures) {
      const storeFeatureKeywords = parseKeywords(storeFeatures)
      storeFeatureKeywords.forEach(keyword => {
        stats.storeFeatures[keyword] = (stats.storeFeatures[keyword] || 0) + 1
        
        // 更新品类与特色的映射关系
        if (storeCategory) {
          if (!stats.categoryFeatureMapping[storeCategory]) {
            stats.categoryFeatureMapping[storeCategory] = {}
          }
          stats.categoryFeatureMapping[storeCategory][keyword] = 
            (stats.categoryFeatureMapping[storeCategory][keyword] || 0) + 1
        }
      })
    }

    // 更新老板特色关键词统计
    if (ownerFeatures) {
      const ownerFeatureKeywords = parseKeywords(ownerFeatures)
      ownerFeatureKeywords.forEach(keyword => {
        stats.ownerFeatures[keyword] = (stats.ownerFeatures[keyword] || 0) + 1
      })
    }

    // 写入更新后的统计数据
    writeKeywordStats(stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('更新关键词统计失败:', error)
    return NextResponse.json(
      { error: '更新关键词统计失败' },
      { status: 500 }
    )
  }
}