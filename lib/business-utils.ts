/**
 * 老板IP打造方案生成器 - 业务工具函数
 * 基于字段标准实现模块间数据处理和转换
 */

import {
  StoreInfo,
  KeywordItem,
  Module1Data,
  Module2OutputFull,
  Module3Request,
  Module3Output,
  BannerDesign,
  ContentColumn,
  ApiResponse
} from './business-types';



// ==================== 模块3数据提取逻辑 ====================

/**
 * 从模块1和模块2数据中提取Banner所需信息
 * @param module1Data 模块1输出数据
 * @param module2Data 模块2输出数据
 * @returns 模块3请求数据
 */
export function extractModule3Data(
  module1Data: Module1Data,
  module2Data: Module2OutputFull
): Module3Request {
  return {
    // 来自模块1的数据
    storeName: module1Data.storeName,
    storeCategory: module1Data.storeCategory,
    storeLocation: module1Data.storeLocation,
    confirmedStoreKeywords: module1Data.confirmedStoreKeywords,
    
    // 来自模块2的数据
    brandSlogan: module2Data.brandSlogan,
    ipTags: module2Data.ipTags,
    contentColumns: module2Data.contentColumns
  };
}

/**
 * 从IP标签中提取5-8个标签用于视觉设计
 * @param ipTags IP标签数组
 * @param maxCount 最大提取数量，默认8个
 * @returns 提取的设计标签
 */
export function extractDesignTags(ipTags: string[], maxCount: number = 8): string[] {
  // 过滤掉空标签并去重
  const validTags = [...new Set(ipTags.filter((tag: string) => tag && tag.trim().length > 0))];
  
  // 按长度和重要性排序，优先选择简洁有力的标签
  const sortedTags = validTags.sort((a: string, b: string) => {
    // 优先选择较短的标签（更适合视觉设计）
    if (a.length !== b.length) {
      return a.length - b.length;
    }
    // 字母顺序作为次要排序
    return a.localeCompare(b);
  });
  
  // 确保至少有5个标签，最多8个
  const minCount = Math.min(5, sortedTags.length);
  const actualCount = Math.min(maxCount, Math.max(minCount, sortedTags.length));
  
  return sortedTags.slice(0, actualCount);
}

/**
 * 从内容栏目中提取视觉符号建议
 * @param contentColumns 内容栏目数组
 * @returns 视觉符号建议数组
 */
export function extractVisualSymbols(contentColumns: ContentColumn[]): string[] {
  const symbols: string[] = [];
  
  contentColumns.forEach((column: ContentColumn) => {
    const { title, description } = column;
    
    // 从标题中提取关键词
    if (title.includes('说') || title.includes('聊')) {
      symbols.push('对话气泡', '麦克风图标');
    }
    if (title.includes('打卡') || title.includes('体验')) {
      symbols.push('相机图标', '位置标记');
    }
    if (title.includes('美食') || title.includes('菜品')) {
      symbols.push('餐具图标', '美食插画');
    }
    if (title.includes('故事') || title.includes('分享')) {
      symbols.push('书本图标', '心形图标');
    }
    
    // 从描述中提取行业特色
    if (description.includes('川味') || description.includes('成都')) {
      symbols.push('辣椒图标', '熊猫元素');
    }
    if (description.includes('传统') || description.includes('文化')) {
      symbols.push('中式花纹', '传统图案');
    }
    if (description.includes('现代') || description.includes('时尚')) {
      symbols.push('几何图形', '简约线条');
    }
  });
  
  // 去重并返回
  return [...new Set(symbols)];
}

/**
 * 根据行业类别生成色调建议
 * @param storeCategory 店铺行业类别
 * @returns 色调建议
 */
export function generateColorTheme(storeCategory: string): string {
  const categoryColorMap: Record<string, string> = {
    '餐饮': '暖色调（红色、橙色、黄色）营造食欲感',
    '美业': '优雅色调（粉色、紫色、金色）体现精致感',
    '零售': '活力色调（蓝色、绿色、橙色）传达活力感',
    '服务': '专业色调（蓝色、灰色、白色）展现专业感',
    '教育': '温和色调（蓝色、绿色、米色）营造学习氛围',
    '健康': '清新色调（绿色、蓝色、白色）传达健康理念',
    '其他': '中性色调（蓝色、灰色、白色）适应性强'
  };
  
  return categoryColorMap[storeCategory] || categoryColorMap['其他'];
}

/**
 * 根据店铺特色生成背景风格建议
 * @param storeFeatures 店铺特色数组
 * @returns 背景风格建议
 */
export function generateBackgroundStyle(storeFeatures: string[]): string {
  const featureStyleMap: Record<string, string[]> = {
    '传统': ['中式传统背景', '古典花纹', '水墨风格'],
    '现代': ['简约几何背景', '渐变色彩', '现代线条'],
    '复古': ['复古纹理背景', '怀旧色调', '老式图案'],
    '时尚': ['时尚渐变背景', '流行色彩', '潮流元素'],
    '温馨': ['温暖色调背景', '柔和光效', '舒适氛围'],
    '专业': ['商务风格背景', '简洁布局', '专业配色']
  };
  
  const styles: string[] = [];
  
  storeFeatures.forEach((feature: string) => {
    Object.keys(featureStyleMap).forEach((key: string) => {
      if (feature.includes(key)) {
        styles.push(...featureStyleMap[key]);
      }
    });
  });
  
  // 如果没有匹配的特色，返回默认风格
  if (styles.length === 0) {
    styles.push('简约现代背景', '清新色调', '专业布局');
  }
  
  // 去重并组合成建议
  const uniqueStyles = [...new Set(styles)];
  return uniqueStyles.slice(0, 3).join('，');
}

// ==================== Banner设计生成 ====================

/**
 * 生成Banner设计建议
 * @param module3Request 模块3请求数据
 * @returns Banner设计建议
 */
export function generateBannerDesign(module3Request: Module3Request): BannerDesign {
  const {
    storeCategory,
    confirmedStoreKeywords,
    brandSlogan,
    contentColumns
  } = module3Request;
  
  // 生成主标题（优先使用品牌主张，其次店铺名称）
  const mainTitle = brandSlogan || module3Request.storeName;
  
  // 生成副标题（从关键词中选择最有特色的）
  const subtitle = confirmedStoreKeywords.length > 0 
    ? confirmedStoreKeywords[0].keyword 
    : undefined;
  
  // 生成设计元素
  const colorTheme = generateColorTheme(storeCategory);
  const backgroundStyle = generateBackgroundStyle(
    confirmedStoreKeywords.map(k => k.keyword)
  );
  const visualSymbols = extractVisualSymbols(contentColumns);
  
  return {
    mainTitle,
    subtitle,
    backgroundStyle,
    colorTheme,
    fontStyle: 'Pure visual design without text', // 不需要字体，但保持接口兼容性
    visualSymbols
  };
}



/**
 * 生成图像生成Prompt
 * @param bannerDesign Banner设计建议
 * @param storeName 店铺名称
 * @param storeCategory 店铺类别
 * @returns 图像生成Prompt
 */
export function generateImagePrompt(
  bannerDesign: BannerDesign,
  storeName: string,
  storeCategory: string
): string {
  const { backgroundStyle, colorTheme, visualSymbols } = bannerDesign;
  
  const prompt = [
    `Professional banner design for ${translateCategoryToEnglish(storeCategory)} business`,
    `Background style: ${translateStyleToEnglish(backgroundStyle)}`,
    `Color scheme: ${translateColorToEnglish(colorTheme)}`,
    visualSymbols.length > 0 ? `Visual elements: ${translateSymbolsToEnglish(visualSymbols).join(', ')}` : '',
    'Requirements: High quality, professional design, commercial use',
    'Format: Horizontal banner, suitable for web and social media',
    'CRITICAL: ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO CHARACTERS of any kind',
    'CRITICAL: NO CHINESE TEXT, NO ENGLISH TEXT, NO NUMBERS, NO SYMBOLS WITH TEXT',
    'CRITICAL: Pure visual design only - graphics, colors, patterns, shapes, icons without text',
    'Focus on: Abstract patterns, geometric shapes, color gradients, visual textures',
    'Avoid: Any readable text, typography, letters, numbers, written content',
    'Style: Clean visual composition with colors and shapes only'
  ].filter(Boolean).join(', ');
  
  return prompt;
}

/**
 * 将中文行业类别翻译为英文
 */
function translateCategoryToEnglish(category: string): string {
  const categoryMap: Record<string, string> = {
    '餐饮': 'restaurant and food service',
    '美业': 'beauty and wellness',
    '零售': 'retail and shopping',
    '服务': 'professional service',
    '教育': 'education and training',
    '健康': 'health and fitness',
    '其他': 'general business'
  };
  return categoryMap[category] || 'business';
}

/**
 * 将中文背景风格翻译为英文
 */
function translateStyleToEnglish(style: string): string {
  return style
    .replace(/简约现代背景/g, 'modern minimalist background')
    .replace(/清新色调/g, 'fresh color palette')
    .replace(/专业布局/g, 'professional layout')
    .replace(/中式传统背景/g, 'traditional Chinese style background')
    .replace(/古典花纹/g, 'classical patterns')
    .replace(/水墨风格/g, 'ink wash style')
    .replace(/简约几何背景/g, 'geometric minimalist background')
    .replace(/渐变色彩/g, 'gradient colors')
    .replace(/现代线条/g, 'modern lines')
    .replace(/复古纹理背景/g, 'vintage textured background')
    .replace(/怀旧色调/g, 'nostalgic color scheme')
    .replace(/老式图案/g, 'retro patterns')
    .replace(/时尚渐变背景/g, 'trendy gradient background')
    .replace(/流行色彩/g, 'popular colors')
    .replace(/潮流元素/g, 'trendy elements')
    .replace(/温暖色调背景/g, 'warm tone background')
    .replace(/柔和光效/g, 'soft lighting effects')
    .replace(/舒适氛围/g, 'comfortable atmosphere')
    .replace(/商务风格背景/g, 'business style background')
    .replace(/简洁布局/g, 'clean layout')
    .replace(/专业配色/g, 'professional color scheme');
}

/**
 * 将中文颜色描述翻译为英文
 */
function translateColorToEnglish(color: string): string {
  return color
    .replace(/暖色调（红色、橙色、黄色）营造食欲感/g, 'warm colors (red, orange, yellow) for appetite appeal')
    .replace(/优雅色调（粉色、紫色、金色）体现精致感/g, 'elegant colors (pink, purple, gold) for sophistication')
    .replace(/活力色调（蓝色、绿色、橙色）传达活力感/g, 'vibrant colors (blue, green, orange) for energy')
    .replace(/专业色调（蓝色、灰色、白色）展现专业感/g, 'professional colors (blue, gray, white) for trust')
    .replace(/温和色调（蓝色、绿色、米色）营造学习氛围/g, 'gentle colors (blue, green, beige) for learning')
    .replace(/清新色调（绿色、蓝色、白色）传达健康理念/g, 'fresh colors (green, blue, white) for health')
    .replace(/中性色调（蓝色、灰色、白色）适应性强/g, 'neutral colors (blue, gray, white) for versatility');
}



/**
 * 将中文视觉元素翻译为英文
 */
function translateSymbolsToEnglish(symbols: string[]): string[] {
  const symbolMap: Record<string, string> = {
    '麻辣烫': 'hot pot elements',
    '东北特色': 'northeastern Chinese cultural elements',
    '传统工艺': 'traditional craftsmanship symbols',
    '美食': 'food and cuisine icons',
    '咖啡': 'coffee related graphics',
    '书籍': 'book and reading symbols',
    '健身': 'fitness and exercise icons',
    '美容': 'beauty and cosmetics elements',
    '教育': 'education and learning symbols',
    '科技': 'technology and digital icons',
    '服务': 'service industry symbols',
    '购物': 'shopping and retail icons'
  };
  
  return symbols.map(symbol => {
    // 尝试直接匹配
    if (symbolMap[symbol]) {
      return symbolMap[symbol];
    }
    
    // 部分匹配
    for (const [key, value] of Object.entries(symbolMap)) {
      if (symbol.includes(key)) {
        return value;
      }
    }
    
    // 默认返回通用图标描述
    return 'business related icons';
  });
}

/**
 * 生成完整的模块3输出
 * @param module3Request 模块3请求数据
 * @returns 模块3输出数据
 */
export function generateModule3Output(module3Request: Module3Request): Module3Output {
  const bannerDesign = generateBannerDesign(module3Request);
  const imagePrompt = generateImagePrompt(
    bannerDesign,
    module3Request.storeName,
    module3Request.storeCategory
  );
  const designTags = extractDesignTags(module3Request.ipTags);
  
  return {
    bannerDesign,
    imagePrompt,
    designTags
  };
}

// ==================== 数据验证和格式化工具 ====================

/**
 * 验证店铺基础信息
 * @param storeInfo 店铺信息
 * @returns 验证结果
 */
export async function validateStoreInfo(storeInfo: Partial<StoreInfo>): Promise<ApiResponse<StoreInfo & { categoryInfo?: any }>> {
  const errors: string[] = [];
  let categoryInfo: any = null;
  
  if (!storeInfo.storeName || storeInfo.storeName.trim().length === 0) {
    errors.push('店铺名称不能为空');
  }
  
  if (!storeInfo.storeCategory || storeInfo.storeCategory.trim().length === 0) {
    errors.push('请选择或输入行业类别');
  } else {
    // 记录品类使用并检查是否需要自动添加 (仅在服务端)
    if (typeof window === 'undefined') {
      try {
        // 动态导入以避免客户端打包
        const { categoryManager } = eval('require')('./category-manager');
        const categoryResult = await categoryManager.recordCategoryUsage(storeInfo.storeCategory);
        categoryInfo = categoryResult;
        
        // 如果品类不存在且未达到自动添加阈值，给出提示但不阻止验证
        if (!categoryManager.isCategoryExists(storeInfo.storeCategory) && !categoryResult.shouldAdd) {
          console.log(`📝 新品类记录: ${categoryResult.message}`);
        }
      } catch (error) {
        console.warn('Category manager operation failed:', error);
      }
    }
  }
  
  if (!storeInfo.storeLocation || storeInfo.storeLocation.trim().length === 0) {
    errors.push('店铺位置不能为空');
  }
  
  if (!storeInfo.ownerName || storeInfo.ownerName.trim().length === 0) {
    errors.push('老板姓名不能为空');
  }
  
  if (!Array.isArray(storeInfo.storeFeatures) || storeInfo.storeFeatures.length === 0) {
    errors.push('请至少选择一个店铺特色');
  }
  
  if (!Array.isArray(storeInfo.ownerFeatures) || storeInfo.ownerFeatures.length === 0) {
    errors.push('请至少选择一个老板特色');
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('；'),
      code: 'VALIDATION_ERROR'
    };
  }
  
  return {
    success: true,
    data: { ...(storeInfo as StoreInfo), categoryInfo }
  };
}

/**
 * 验证关键词数组
 * @param keywords 关键词数组
 * @param fieldName 字段名称（用于错误提示）
 * @returns 验证结果
 */
export function validateKeywords(
  keywords: any[],
  fieldName: string = '关键词'
): ApiResponse<KeywordItem[]> {
  if (!Array.isArray(keywords)) {
    return {
      success: false,
      error: `${fieldName}必须是数组格式`,
      code: 'INVALID_FORMAT'
    };
  }
  
  if (keywords.length === 0) {
    return {
      success: false,
      error: `请至少选择一个${fieldName}`,
      code: 'EMPTY_KEYWORDS'
    };
  }
  
  const validKeywords: KeywordItem[] = [];
  const errors: string[] = [];
  
  keywords.forEach((item: any, index: number) => {
    if (!item || typeof item !== 'object') {
      errors.push(`第${index + 1}个${fieldName}格式错误`);
      return;
    }
    
    if (!item.keyword || typeof item.keyword !== 'string' || item.keyword.trim().length === 0) {
      errors.push(`第${index + 1}个${fieldName}的关键词不能为空`);
      return;
    }
    
    if (!item.description || typeof item.description !== 'string') {
      errors.push(`第${index + 1}个${fieldName}的描述不能为空`);
      return;
    }
    
    validKeywords.push({
      keyword: item.keyword.trim(),
      description: item.description.trim()
    });
  });
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('；'),
      code: 'VALIDATION_ERROR'
    };
  }
  
  return {
    success: true,
    data: validKeywords
  };
}

/**
 * 格式化模块1数据
 * @param rawData 原始数据
 * @returns 格式化后的模块1数据
 */
export async function formatModule1Data(rawData: any): Promise<ApiResponse<Module1Data>> {
  // 验证基础信息
  const storeInfoResult = await validateStoreInfo(rawData);
  if (!storeInfoResult.success) {
    return {
      success: false,
      error: storeInfoResult.error,
      code: storeInfoResult.code
    };
  }
  
  // 验证店铺关键词
  const storeKeywordsResult = validateKeywords(
    rawData.confirmedStoreKeywords,
    '店铺关键词'
  );
  if (!storeKeywordsResult.success) {
    return {
      success: false,
      error: storeKeywordsResult.error,
      code: storeKeywordsResult.code
    };
  }
  
  // 验证老板关键词
  const ownerKeywordsResult = validateKeywords(
    rawData.confirmedOwnerKeywords,
    '老板关键词'
  );
  if (!ownerKeywordsResult.success) {
    return {
      success: false,
      error: ownerKeywordsResult.error,
      code: ownerKeywordsResult.code
    };
  }
  
  const formattedData: Module1Data = {
    ...storeInfoResult.data!,
    confirmedStoreKeywords: storeKeywordsResult.data!,
    confirmedOwnerKeywords: ownerKeywordsResult.data!
  };
  
  return {
    success: true,
    data: formattedData
  };
}

/**
 * 清理和标准化文本内容
 * @param text 原始文本
 * @returns 清理后的文本
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .replace(/\s+/g, ' ') // 合并多个空格
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\-_.,!?()（）]/g, '') // 保留中英文、数字和基本标点
    .substring(0, 200); // 限制长度
}

/**
 * 生成唯一的请求ID
 * @returns 请求ID
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

// ==================== 导出所有工具函数 ====================

export const BusinessUtils = {
  // 数据提取
  extractModule3Data,
  extractDesignTags,
  extractVisualSymbols,
  
  // 设计生成
  generateBannerDesign,
  generateImagePrompt,
  generateModule3Output,
  generateColorTheme,
  generateBackgroundStyle,
  
  // 数据验证
  validateStoreInfo,
  validateKeywords,
  formatModule1Data,
  
  // 工具函数
  sanitizeText,
  generateRequestId
};

export default BusinessUtils;