import { NextRequest, NextResponse } from 'next/server';
import { 
  extractModule3Data,
  generateModule3Output,
  sanitizeText,
  generateRequestId,
  validateKeywords
} from '@/lib/business-utils';
import type { 
  Module1Data,
  Module2OutputFull,
  Module3Request,
  Module3Output,
  ApiResponse,
  ContentColumn
} from '@/lib/business-types';

/**
 * 验证模块3请求数据
 */
function validateModule3Request(data: any): ApiResponse<Module3Request> {
  const errors: string[] = [];
  
  // 验证基础字段
  if (!data.storeName || typeof data.storeName !== 'string') {
    errors.push('店铺名称不能为空');
  }
  
  if (!data.storeCategory || typeof data.storeCategory !== 'string') {
    errors.push('店铺类别不能为空');
  }
  
  if (!data.storeLocation || typeof data.storeLocation !== 'string') {
    errors.push('店铺位置不能为空');
  }
  
  if (!data.brandSlogan || typeof data.brandSlogan !== 'string') {
    errors.push('品牌主张不能为空');
  }
  
  // 验证关键词数组
  if (!Array.isArray(data.confirmedStoreKeywords)) {
    errors.push('店铺关键词必须是数组格式');
  } else {
    const keywordValidation = validateKeywords(data.confirmedStoreKeywords, '店铺关键词');
    if (!keywordValidation.success) {
      errors.push(keywordValidation.error!);
    }
  }
  
  // 验证IP标签
  if (!Array.isArray(data.ipTags)) {
    errors.push('IP标签必须是数组格式');
  } else if (data.ipTags.length === 0) {
    errors.push('IP标签不能为空');
  }
  
  // 验证内容栏目
  if (!Array.isArray(data.contentColumns)) {
    errors.push('内容栏目必须是数组格式');
  } else {
    data.contentColumns.forEach((column: any, index: number) => {
      if (!column || typeof column !== 'object') {
        errors.push(`第${index + 1}个内容栏目格式错误`);
      } else {
        if (!column.title || typeof column.title !== 'string') {
          errors.push(`第${index + 1}个内容栏目标题不能为空`);
        }
        if (!column.description || typeof column.description !== 'string') {
          errors.push(`第${index + 1}个内容栏目描述不能为空`);
        }
      }
    });
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      error: errors.join('；'),
      code: 'VALIDATION_ERROR'
    };
  }
  
  // 清理和格式化数据
  const cleanedData: Module3Request = {
    storeName: sanitizeText(data.storeName),
    storeCategory: sanitizeText(data.storeCategory),
    storeLocation: sanitizeText(data.storeLocation),
    confirmedStoreKeywords: data.confirmedStoreKeywords.map((k: any) => ({
      keyword: sanitizeText(k.keyword),
      description: sanitizeText(k.description)
    })),
    brandSlogan: sanitizeText(data.brandSlogan),
    ipTags: data.ipTags.map((tag: string) => sanitizeText(tag)).filter((tag: string) => tag.length > 0),
    contentColumns: data.contentColumns.map((column: any) => ({
      title: sanitizeText(column.title),
      description: sanitizeText(column.description)
    })).filter((column: ContentColumn) => column.title.length > 0 && column.description.length > 0)
  };
  
  return {
    success: true,
    data: cleanedData
  };
}

/**
 * 验证完整的模块1+模块2数据并提取模块3所需数据
 */
function validateAndExtractModule3Data(data: any): ApiResponse<Module3Request> {
  try {
    // 检查是否包含完整的模块1和模块2数据
    if (data.module1Data && data.module2Data) {
      // 从完整数据中提取
      const module1Data = data.module1Data as Module1Data;
      const module2Data = data.module2Data as Module2OutputFull;
      
      const extractedData = extractModule3Data(module1Data, module2Data);
      return validateModule3Request(extractedData);
    }
    
    // 直接验证模块3请求数据
    return validateModule3Request(data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '数据提取失败',
      code: 'EXTRACTION_ERROR'
    };
  }
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
      'X-Request-ID': requestId,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    console.log(`[${requestId}] Module3 banner request started`);
    
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
    
    // 验证和提取模块3数据
    const validationResult = validateAndExtractModule3Data(body);
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation failed:`, validationResult.error);
      return createErrorResponse(
        validationResult.error!,
        validationResult.code || 'VALIDATION_ERROR',
        400,
        requestId
      );
    }
    
    const module3Request = validationResult.data!;
    
    console.log(`[${requestId}] Processing banner generation for:`, {
      storeName: module3Request.storeName,
      storeCategory: module3Request.storeCategory,
      ipTagsCount: module3Request.ipTags.length,
      contentColumnsCount: module3Request.contentColumns.length
    });
    
    // 生成Banner设计方案
    const module3Output = generateModule3Output(module3Request);
    
    console.log(`[${requestId}] Generated banner design:`, {
      mainTitle: module3Output.bannerDesign.mainTitle,
      designTagsCount: module3Output.designTags.length,
      visualSymbolsCount: module3Output.bannerDesign.visualSymbols.length
    });
    
    const response: ApiResponse<Module3Output> = {
      success: true,
      data: module3Output
    };
    
    return NextResponse.json(response, {
      headers: {
        'X-Request-ID': requestId,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Module3 banner error:`, error);
    
    return createErrorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      'INTERNAL_ERROR',
      500,
      requestId
    );
  }
}

/**
 * 处理OPTIONS请求（CORS预检）
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}