import { NextRequest } from 'next/server';
import {
  formatModule1Data,
  generateRequestId
} from '@/lib/business-utils';
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

  return `你是一名资深抖音IP打造专家，请根据下列店铺信息，输出一份结构完整、语言专业、情绪有感染力的《老板IP打造方案》，以markdown格式输出。

店铺信息如下：
- 店铺名称：${storeName}
- 行业类别：${storeCategory}
- 所在位置：${storeLocation}
- 经营时长：${businessDuration || '未提供'}
- 店铺特色：${storeFeaturesList}、${storeKeywordsList}
- 老板姓名：${ownerName}
- 老板特色：${ownerFeaturesList}、${ownerKeywordsList}

请严格按照以下8个结构输出内容：
1. IP核心定位与形象塑造（标签 + 人设 + Slogan）
2. 品牌主张升级
3. 抖音账号基础布局（头像、名称、简介、背景图）
4. 内容板块（创业故事 / 技艺揭秘 / 公益责任 / 用户互动）
5. 直播间设计（主题 + 流程）
6. 口播金句模板（情怀类 / 专业类 / 推广类）
7. 运营增长策略（冷启动打法 + 数据优化）
8. 商业化路径（短期变现 / 长期布局）

要求：每部分不少于3段描述，语言专业、有逻辑、有亮点，金句频出。`;
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
    const validationResult = await formatModule1Data(body);
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