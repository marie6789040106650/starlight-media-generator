import { NextRequest, NextResponse } from 'next/server';
import {
  validateStoreInfo,
  sanitizeText,
  generateRequestId
} from '@/lib/business-utils';
import { storeKeywordManager, ownerKeywordManager } from '@/lib/keyword-manager';
import type {
  StoreInfo,
  Module1Output,
  KeywordItem,
  ApiResponse
} from '@/lib/business-types';

/**
 * 根据店铺信息生成关键词推荐
 */
async function generateKeywordRecommendations(storeInfo: StoreInfo): Promise<Module1Output> {
  const { storeCategory, storeFeatures, ownerFeatures } = storeInfo;

  // 使用新的关键词管理器生成推荐
  const storeKeywords = await generateStoreKeywords(storeCategory, storeFeatures);
  const ownerKeywords = generateOwnerKeywords(ownerFeatures);

  return {
    confirmedStoreKeywords: storeKeywords.slice(0, 5),
    confirmedOwnerKeywords: ownerKeywords.slice(0, 5)
  };
}

/**
 * 生成店铺关键词推荐
 */
async function generateStoreKeywords(storeCategory: string, storeFeatures: string[]): Promise<KeywordItem[]> {
  const relevantKeywords = await storeKeywordManager.getRelevantKeywords(storeCategory, storeFeatures);

  // 将字符串关键词转换为KeywordItem格式
  return relevantKeywords.map(keyword => ({
    keyword,
    description: generateKeywordDescription(keyword, 'store', storeCategory)
  }));
}

/**
 * 生成老板关键词推荐
 */
function generateOwnerKeywords(ownerFeatures: string[]): KeywordItem[] {
  const relevantKeywords = ownerKeywordManager.getRelevantKeywords(ownerFeatures);

  // 将字符串关键词转换为KeywordItem格式
  return relevantKeywords.map(keyword => ({
    keyword,
    description: generateKeywordDescription(keyword, 'owner')
  }));
}

/**
 * 为关键词生成描述
 */
function generateKeywordDescription(keyword: string, type: 'store' | 'owner', category?: string): string {
  if (type === 'store') {
    const storeDescriptions: Record<string, string> = {
      '秘制汤底': '独家配方，口味独特，顾客记忆点强',
      '地域食材': '选用当地优质食材，体现地方特色',
      '现制模式': '现场制作，新鲜热乎，品质保证',
      '健康定制': '根据客户需求定制健康餐品',
      '主题沉浸': '营造独特主题氛围，增强用餐体验',
      '网红装修': '时尚装修风格，适合拍照打卡',
      '传统工艺': '传承传统制作工艺，保持正宗口味',
      '创新口味': '不断创新菜品口味，满足多样需求',
      '专业技术': '技师经验丰富，手法专业',
      '个性定制': '根据客户需求提供个性化服务',
      '品质服务': '注重服务品质，客户满意度高',
      '时尚潮流': '紧跟时尚潮流，引领行业趋势'
    };

    return storeDescriptions[keyword] || `${keyword}，体现${category || '店铺'}专业特色`;
  } else {
    const ownerDescriptions: Record<string, string> = {
      '热情好客': '待人热情，善于与客户建立良好关系',
      '专业素养': '具备专业知识和技能，值得信赖',
      '经验丰富': '行业经验深厚，能够提供专业指导',
      '亲和力强': '容易亲近，善于沟通交流',
      '技术精湛': '技术水平高超，专业能力突出',
      '诚信经营': '诚实守信，经营理念正直',
      '用心服务': '用心对待每一位客户，服务细致',
      '创新思维': '思维活跃，善于创新和改进',
      '年轻活力': '充满活力，思维敏捷',
      '本地人': '熟悉当地情况，了解客户需求'
    };

    return ownerDescriptions[keyword] || `${keyword}，体现老板个人特色`;
  }
}

/**
 * 清理店铺信息数据
 */
function sanitizeStoreInfo(storeInfo: StoreInfo): StoreInfo {
  return {
    ...storeInfo,
    storeName: sanitizeText(storeInfo.storeName),
    storeLocation: sanitizeText(storeInfo.storeLocation),
    ownerName: sanitizeText(storeInfo.ownerName),
    businessDuration: storeInfo.businessDuration ? sanitizeText(storeInfo.businessDuration) : undefined,
    storeFeatures: storeInfo.storeFeatures.map((f: string) => sanitizeText(f)),
    ownerFeatures: storeInfo.ownerFeatures.map((f: string) => sanitizeText(f))
  };
}

/**
 * 创建错误响应
 */
function createErrorResponse(
  error: string,
  code: string,
  status: number,
  requestId: string
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    code
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'X-Request-ID': requestId
    }
  });
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    console.log(`[${requestId}] Module1 keywords request started`);

    // 解析请求体
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      return createErrorResponse(
        '请求数据格式错误',
        'INVALID_JSON',
        400,
        requestId
      );
    }

    // 验证输入数据
    const validationResult = await validateStoreInfo(body as Partial<StoreInfo>);
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation failed:`, validationResult.error);
      return createErrorResponse(
        validationResult.error!,
        validationResult.code || 'VALIDATION_ERROR',
        400,
        requestId
      );
    }

    const storeInfo = validationResult.data!;

    // 清理输入数据
    const cleanedStoreInfo = sanitizeStoreInfo(storeInfo);

    // 生成关键词推荐
    const recommendations = await generateKeywordRecommendations(cleanedStoreInfo);

    console.log(`[${requestId}] Generated recommendations:`, {
      storeKeywords: recommendations.confirmedStoreKeywords.length,
      ownerKeywords: recommendations.confirmedOwnerKeywords.length,
      storeCategory: cleanedStoreInfo.storeCategory
    });

    const response: ApiResponse<Module1Output> = {
      success: true,
      data: recommendations
    };

    return NextResponse.json(response, {
      headers: {
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`[${requestId}] Module1 keywords error:`, error);

    return createErrorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      'INTERNAL_ERROR',
      500,
      requestId
    );
  }
}