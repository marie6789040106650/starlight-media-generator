import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { storeFeatures, ownerFeatures, storeCategory } = await request.json()
    
    console.log('收到关键词拓展请求:', { storeFeatures, ownerFeatures, storeCategory })
    
    // 模拟关键词拓展逻辑，考虑店铺品类
    const expandedStoreFeatures = generateExpandedKeywords(storeFeatures, 'store', storeCategory)
    const expandedBossFeatures = generateExpandedKeywords(ownerFeatures, 'boss')
    
    // 从配置文件获取基于统计的热门关键词
    let popularStoreFeatures: string[] = []
    let popularBossFeatures: string[] = []
    
    try {
      // 直接导入配置文件数据
      const statsData = await import('@/config/keyword-stats.json')
      
      // 获取特定品类下的热门特色
      if (storeCategory && statsData.categoryFeatureMapping && (statsData.categoryFeatureMapping as any)[storeCategory]) {
        popularStoreFeatures = Object.entries((statsData.categoryFeatureMapping as any)[storeCategory])
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 20)
          .map(([feature]) => feature)
      }
      
      // 获取热门老板特色
      if (statsData.ownerFeatures) {
        popularBossFeatures = Object.entries(statsData.ownerFeatures)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 20)
          .map(([feature]) => feature)
      }
    } catch (statsError) {
      console.error('获取关键词统计失败:', statsError)
      // 失败时继续使用生成的关键词
    }
    
    // 合并生成的关键词和热门关键词，确保热门关键词排在前面
    const mergedStoreFeatures = [...new Set([...popularStoreFeatures, ...expandedStoreFeatures])].slice(0, 20)
    const mergedBossFeatures = [...new Set([...popularBossFeatures, ...expandedBossFeatures])].slice(0, 20)
    
    const result = {
      expanded_store_features: mergedStoreFeatures,
      expanded_boss_features: mergedBossFeatures
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

function generateExpandedKeywords(input: string, type: 'store' | 'boss', storeCategory?: string): string[] {
  if (!input) return []
  
  // 基于输入内容生成相关关键词
  const keywords = input.split(/[、，,]/).map(k => k.trim()).filter(k => k.length > 0)
  
  if (type === 'store') {
    // 店铺特色关键词库 - 通用关键词
    const storeKeywordMap: Record<string, string[]> = {
      '手工': ['纯手工制作', '传统工艺', '匠心制作', '现场制作'],
      '汤底': ['秘制汤底', '骨汤熬制', '营养汤底', '清汤鲜美'],
      '回头客': ['老客户多', '口碑好', '忠实粉丝', '常客满座'],
      '新鲜': ['食材新鲜', '当日采购', '绿色食材', '无添加'],
      '特色': ['招牌菜品', '独家秘方', '地方特色', '创新口味'],
      '环境': ['装修精美', '氛围温馨', '干净整洁', '舒适用餐'],
      '服务': ['服务周到', '态度亲切', '专业服务', '贴心照顾']
    }
    
    // 根据店铺品类添加特定关键词
    const categorySpecificKeywords: Record<string, string[]> = {
      '餐饮': [
        '招牌菜品', '特色美食', '秘制配方', '食材新鲜', '口味独特', 
        '现做现卖', '健康饮食', '营养均衡', '地方特色', '传统工艺',
        '创新菜式', '网红打卡', '环境舒适', '用餐体验', '主题餐厅'
      ],
      '美业': [
        '专业技术', '个性定制', '品质服务', '时尚潮流', '舒适环境',
        '高端设备', '明星产品', '专属方案', '贴心服务', '会员福利',
        '技术创新', '口碑相传', '精细服务', '私人定制', '品牌保障'
      ],
      '教育培训': [
        '专业师资', '小班教学', '个性化辅导', '优质课程', '学习氛围',
        '成果展示', '升学率高', '实用技能', '就业保障', '证书认证',
        '实践机会', '名师指导', '系统课程', '学习环境', '学员关怀'
      ],
      '零售': [
        '品质保障', '正品承诺', '价格优惠', '款式多样', '新品上市',
        '限量发售', '会员专享', '售后无忧', '快速配送', '实体体验',
        '品类齐全', '精选商品', '性价比高', '时尚潮流', '专业推荐'
      ],
      '服务业': [
        '专业服务', '快速响应', '一站式解决', '贴心周到', '用户体验',
        '品质保障', '价格透明', '诚信经营', '专业团队', '售后无忧',
        '定制方案', '便捷服务', '高效处理', '客户至上', '服务标准'
      ]
    }
    
    const expanded = new Set<string>()
    
    // 添加基于输入关键词的拓展
    keywords.forEach(keyword => {
      // 查找相关关键词
      Object.entries(storeKeywordMap).forEach(([key, values]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          values.forEach(v => expanded.add(v))
        }
      })
    })
    
    // 添加品类特定的关键词
    if (storeCategory && categorySpecificKeywords[storeCategory]) {
      categorySpecificKeywords[storeCategory].forEach(k => expanded.add(k))
    }
    
    // 添加一些通用的店铺特色关键词
    const commonStoreKeywords = [
      '口味正宗', '分量足', '性价比高', '环境舒适', '服务贴心',
      '食材优质', '制作精细', '营养健康', '创新口味', '传统工艺',
      '人气爆棚', '网红打卡', '特色装修', '主题风格', '精品服务',
      '技术领先', '品牌保障', '专业团队', '一站式服务', '个性定制'
    ]
    
    commonStoreKeywords.slice(0, 15).forEach(k => expanded.add(k))
    
    return Array.from(expanded).slice(0, 20)
  } else {
    // 老板特色关键词库
    const bossKeywordMap: Record<string, string[]> = {
      '东北': ['东北人', '豪爽性格', '热情好客', '幽默风趣'],
      '亲和': ['亲和力强', '平易近人', '和蔼可亲', '善于沟通'],
      '厨艺': ['厨艺精湛', '烹饪高手', '美食达人', '技艺娴熟'],
      '经验': ['经验丰富', '行业老手', '资深从业', '见多识广'],
      '创新': ['勇于创新', '思维活跃', '与时俱进', '敢于尝试'],
      '服务': ['服务意识强', '客户至上', '用心经营', '贴心服务']
    }
    
    const expanded = new Set<string>()
    keywords.forEach(keyword => {
      // 查找相关关键词
      Object.entries(bossKeywordMap).forEach(([key, values]) => {
        if (keyword.includes(key) || key.includes(keyword)) {
          values.forEach(v => expanded.add(v))
        }
      })
    })
    
    // 添加一些通用的老板特色关键词
    const commonBossKeywords = [
      '匠人精神', '传承工艺', '学霸背景', '宠粉老板',
      '亲民价格', '用心经营', '品质坚持', '创新思维',
      '专业素养', '行业经验', '诚信经营', '顾客至上',
      '细节控', '追求完美', '持续学习', '团队领导',
      '亲力亲为', '热爱行业', '专注品质', '服务意识'
    ]
    
    commonBossKeywords.slice(0, 15).forEach(k => expanded.add(k))
    
    return Array.from(expanded).slice(0, 20)
  }
}