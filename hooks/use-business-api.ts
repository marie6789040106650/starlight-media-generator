/**
 * Business API operations
 * Extracted from use-business-stream.ts for better separation of concerns
 */

import type {
  StoreInfo,
  Module1Data,
  Module2OutputFull,
  Module3Output,
  StreamChunk,
  ApiResponse
} from '../lib/business-types';

// ==================== API Error Handling ====================

export class BusinessApiError extends Error {
  constructor(
    message: string,
    public readonly module: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'BusinessApiError';
  }
}

// ==================== Module 1 API ====================

export async function fetchModule1Keywords(storeInfo: StoreInfo): Promise<Module1Data> {
  const response = await fetch('/api/module1-keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storeInfo)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new BusinessApiError(
      `HTTP ${response.status}: ${errorText}`,
      'module1',
      response.status
    );
  }

  const result: ApiResponse<Module1Data> = await response.json();

  if (!result.success) {
    throw new BusinessApiError(result.error || '模块1处理失败', 'module1');
  }

  return {
    ...storeInfo,
    ...result.data!
  };
}

// ==================== Module 2 API ====================

export interface Module2StreamCallbacks {
  onData: (data: Partial<Module2OutputFull>) => void;
  onComplete: (data: Module2OutputFull) => void;
  onError: (error: BusinessApiError) => void;
}

export async function startModule2Stream(
  module1Data: Module1Data,
  callbacks: Module2StreamCallbacks,
  abortSignal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/module2-plan-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(module1Data),
    signal: abortSignal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new BusinessApiError(
      `HTTP ${response.status}: ${errorText}`,
      'module2',
      response.status
    );
  }

  if (!response.body) {
    throw new BusinessApiError('No response body', 'module2');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedData: Partial<Module2OutputFull> = {};

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            // Generate final data with defaults
            const finalData: Module2OutputFull = {
              ipTags: accumulatedData.ipTags || [],
              brandSlogan: accumulatedData.brandSlogan || '',
              contentColumns: accumulatedData.contentColumns || [],
              goldenSentences: accumulatedData.goldenSentences || [],
              accountMatrix: accumulatedData.accountMatrix || [],
              liveStreamDesign: accumulatedData.liveStreamDesign || [],
              operationAdvice: accumulatedData.operationAdvice || [],
              commercializationPath: accumulatedData.commercializationPath || []
            };

            callbacks.onComplete(finalData);
            return;
          }
          
          try {
            const parsed: StreamChunk = JSON.parse(data);
            
            if (parsed.error) {
              throw new BusinessApiError(parsed.error, 'module2');
            }
            
            if (parsed.type === 'content' && parsed.data) {
              accumulatedData = { ...accumulatedData, ...parsed.data };
              callbacks.onData(parsed.data);
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming data:', data, parseError);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof BusinessApiError) {
      callbacks.onError(error);
    } else if (error instanceof Error && error.name === 'AbortError') {
      // Silently handle abort
      return;
    } else {
      callbacks.onError(
        new BusinessApiError(
          error instanceof Error ? error.message : '模块2处理失败',
          'module2'
        )
      );
    }
  }
}

// ==================== Module 3 API ====================

export async function generateModule3Banner(
  module1Data: Module1Data,
  module2Data: Module2OutputFull
): Promise<Module3Output> {
  const requestData = {
    module1Data,
    module2Data
  };

  const response = await fetch('/api/module3-banner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new BusinessApiError(
      `HTTP ${response.status}: ${errorText}`,
      'module3',
      response.status
    );
  }

  const result: ApiResponse<Module3Output> = await response.json();

  if (!result.success) {
    throw new BusinessApiError(result.error || '模块3处理失败', 'module3');
  }

  return result.data!;
}