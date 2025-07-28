import { NextRequest } from 'next/server';
import { 
  formatModule1Data,
  generateRequestId
} from '@/lib/business-utils';

// Edge Runtime 配置
export const runtime = 'edge'
import { 
  getLongContentConfig,
  recordLongContentMetrics
} from '@/lib/long-content-config';
import { smartChat } from '@/lib/llm';
import type { 
  Module1Data,
  Module2OutputFull,
  StreamChunk
} from '@/lib/business-types';

// Removed Edge Runtime to support Node.js modules (fs, path) used by category-manager

/**
 * 生成模块2的8个板块Prompt
 */
function generateModule2Prompt(module1Data: Module1Data): string {
  const {
    storeName,
    storeCategory,
    storeLocation,
    businessDuration,
    storeFeatures,
    ownerName,
    ownerFeatures,
    confirmedStoreKeywords,
    confirmedOwnerKeywords
  } = module1Data;

  // 只使用用户确认的关键词，不添加任何默认关键词
  const storeKeywordsList = confirmedStoreKeywords.map(k => `${k.keyword}(${k.description})`).join('、');
  const ownerKeywordsList = confirmedOwnerKeywords.map(k => `${k.keyword}(${k.description})`).join('、');
  const storeFeaturesList = storeFeatures.join('、');
  const ownerFeaturesList = ownerFeatures.join('、');

  return `请为"${storeName}"${storeCategory}店铺的老板IP打造方案，生成以下8个板块的内容。

店铺信息：
- 店铺名称：${storeName}
- 行业类别：${storeCategory}
- 所在位置：${storeLocation}
- 经营时长：${businessDuration || '未提供'}
- 店铺特色：${storeFeaturesList}
- 老板姓名：${ownerName}老板
- 老板特色：${ownerFeaturesList}

用户确认的关键词（请严格基于这些关键词生成方案，不要添加其他关键词）：
- 店铺关键词：${storeKeywordsList}
- 老板关键词：${ownerKeywordsList}

请按照以下JSON格式生成8个板块的内容，每个板块都必须生成：

{
  "ipTags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "brandSlogan": "品牌主张文案",
  "contentColumns": [
    {"title": "栏目标题1", "description": "栏目描述1"},
    {"title": "栏目标题2", "description": "栏目描述2"},
    {"title": "栏目标题3", "description": "栏目描述3"}
  ],
  "goldenSentences": ["金句1", "金句2", "金句3"],
  "accountMatrix": ["账号类型1", "账号类型2", "账号类型3"],
  "liveStreamDesign": ["直播主题1", "直播主题2", "直播主题3"],
  "operationAdvice": ["运营建议1", "运营建议2", "运营建议3"],
  "commercializationPath": ["变现方式1", "变现方式2", "变现方式3"]
}

要求：
1. IP标签：5个简洁有力的标签，体现老板人格特色
2. 品牌主张：一句话概括品牌价值主张，朗朗上口
3. 内容栏目：3-4个内容栏目，每个栏目有标题和描述
4. 金句表达：3个朗朗上口的金句，体现老板风格
5. 账号矩阵：3个不同平台的账号定位
6. 直播设计：3个直播主题方向
7. 运营建议：3个具体的运营策略
8. 商业化路径：3个变现方式建议

请确保内容贴合${storeCategory}行业特点，体现${storeLocation}地域特色，符合${ownerName}老板的人格特征。`;
}

/**
 * 解析AI响应中的JSON内容
 */
function parseAIResponse(content: string): Partial<Module2OutputFull> | null {
  try {
    // 首先尝试提取代码块中的JSON
    const codeBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr = '';
    
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    } else {
      // 尝试找到完整的JSON对象
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }
      jsonStr = jsonMatch[0];
    }
    
    // 尝试修复常见的JSON格式问题
    // 1. 移除可能的截断
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      // JSON可能被截断，尝试添加缺失的闭合括号
      const missing = openBraces - closeBraces;
      jsonStr += '}'.repeat(missing);
    }
    
    // 2. 尝试解析
    const parsed = JSON.parse(jsonStr);
    
    // 3. 验证必要字段
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    
    return null;
  } catch (error) {
    // 尝试更宽松的解析
    try {
      // 查找可能的部分JSON
      const partialMatches = content.match(/"(\w+)":\s*(\[.*?\]|".*?"|[^,}]+)/g);
      if (partialMatches && partialMatches.length > 0) {
        const partialObj: any = {};
        
        partialMatches.forEach(match => {
          const keyValueMatch = match.match(/"(\w+)":\s*(.*)/);
          if (keyValueMatch) {
            const key = keyValueMatch[1];
            const value = keyValueMatch[2].trim();
            
            try {
              if (value.startsWith('[') || value.startsWith('{')) {
                partialObj[key] = JSON.parse(value);
              } else if (value.startsWith('"') && value.endsWith('"')) {
                partialObj[key] = value.slice(1, -1);
              } else {
                partialObj[key] = value;
              }
            } catch (e) {
              // 忽略解析失败的字段
            }
          }
        });
        
        if (Object.keys(partialObj).length > 0) {
          return partialObj;
        }
      }
    } catch (fallbackError) {
      console.warn('Fallback parsing also failed:', fallbackError);
    }
    
    console.error('Failed to parse AI response:', error);
    return null;
  }
}

/**
 * 创建流式响应数据块
 */
function createStreamChunk(type: 'content' | 'error' | 'done', data?: any, error?: string): string {
  const chunk: StreamChunk = {
    type,
    data,
    error,
    done: type === 'done'
  };
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * 创建错误响应
 */
function createErrorResponse(error: string, status: number = 500): Response {
  return new Response(
    createStreamChunk('error', null, error),
    {
      status,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    console.log(`[${requestId}] Module2 long content generation started`);
    
    // 解析请求体
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      return createErrorResponse('请求数据格式错误', 400);
    }
    
    // 验证和格式化模块1数据
    const validationResult = formatModule1Data(body);
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation failed:`, validationResult.error);
      return createErrorResponse(validationResult.error!, 400);
    }
    
    const module1Data = validationResult.data!;
    
    // 获取长内容生成的最佳配置
    const longContentConfig = getLongContentConfig();
    
    // 生成Prompt
    const prompt = generateModule2Prompt(module1Data);
    
    console.log(`[${requestId}] Long content generation config:`, {
      storeName: module1Data.storeName,
      storeCategory: module1Data.storeCategory,
      taskType: 'long_generation',
      maxTokens: longContentConfig.maxTokens,
      estimatedCost: 'Optimized for cost'
    });
    
    // 创建流式响应 - 使用统一SDK
    const stream = new ReadableStream({
      async start(controller) {
        let accumulatedContent = '';
        let hasValidResponse = false;
        let totalChunks = 0;
        let outputTokens = 0;
        
        try {
          // 使用统一SDK的智能选择，专门针对长内容生成优化
          await smartChat({
            taskType: 'long_generation',
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            stream: true,
            maxTokens: longContentConfig.maxTokens,
            temperature: longContentConfig.temperature,
            topP: longContentConfig.topP,
            onData: (chunk: string) => {
              accumulatedContent += chunk;
              totalChunks++;
              
              // 每100个chunk尝试解析一次，减少CPU消耗
              if (totalChunks % 100 === 0 || accumulatedContent.length > 5000) {
                const parsedResponse = parseAIResponse(accumulatedContent);
                if (parsedResponse && !hasValidResponse) {
                  controller.enqueue(new TextEncoder().encode(createStreamChunk('content', parsedResponse)));
                  hasValidResponse = true;
                }
              }
            },
            onComplete: (content: string) => {
              const responseTime = Date.now() - startTime;
              outputTokens = Math.ceil(content.length / 4); // 估算token数
              
              console.log(`[${requestId}] Long content generation completed:`, {
                contentLength: content.length,
                totalChunks,
                outputTokens,
                responseTime: `${responseTime}ms`
              });
              
              // 最终解析检查
              if (!hasValidResponse) {
                const parsed = parseAIResponse(content);
                if (parsed) {
                  controller.enqueue(new TextEncoder().encode(createStreamChunk('content', parsed)));
                  hasValidResponse = true;
                }
              }
              
              // 记录性能指标
              recordLongContentMetrics(
                'smart_selected', // 使用智能选择的模型
                content.length,
                responseTime,
                0, // 成本由统一SDK优化
                hasValidResponse
              );
              
              if (!hasValidResponse) {
                controller.enqueue(new TextEncoder().encode(createStreamChunk('error', null, '未能生成有效的方案内容')));
              } else {
                controller.enqueue(new TextEncoder().encode(createStreamChunk('done')));
              }
              
              controller.close();
            },
            onError: (error: Error) => {
              console.error(`[${requestId}] Smart chat error:`, error.message);
              controller.enqueue(new TextEncoder().encode(createStreamChunk('error', null, `生成错误: ${error.message}`)));
              controller.close();
            }
          });
          
        } catch (error) {
          console.error(`[${requestId}] Stream processing error:`, error);
          controller.enqueue(new TextEncoder().encode(createStreamChunk('error', null, '流式处理错误')));
          controller.close();
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Request-ID': requestId
      }
    });
    
  } catch (error) {
    console.error(`[${requestId}] Module2 stream error:`, error);
    return createErrorResponse(
      error instanceof Error ? error.message : '服务器内部错误',
      500
    );
  }
}