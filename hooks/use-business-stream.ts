/**
 * 业务流程React Hook
 * 基于useStreamingChat扩展，专门处理模块1、2、3的业务流程
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  StoreInfo,
  Module1Data,
  Module2OutputFull,
  Module3Output,
  Module2StreamState,
  StreamChunk,
  ApiResponse
} from '../lib/business-types';

// ==================== 接口定义 ====================

interface Module1State {
  data: Module1Data | null;
  isLoading: boolean;
  error: string | null;
}

interface Module2State {
  streamState: Module2StreamState;
  isStreaming: boolean;
  error: string | null;
  finalData: Module2OutputFull | null;
}

interface Module3State {
  data: Module3Output | null;
  isLoading: boolean;
  error: string | null;
}

interface BusinessStreamState {
  module1: Module1State;
  module2: Module2State;
  module3: Module3State;
  currentStep: 'module1' | 'module2' | 'module3' | 'completed';
  requestId: string | null;
}

interface BusinessStreamOptions {
  onModule1Complete?: (data: Module1Data) => void;
  onModule2Complete?: (data: Module2OutputFull) => void;
  onModule3Complete?: (data: Module3Output) => void;
  onError?: (error: string, module: string) => void;
  onStepChange?: (step: string) => void;
}

// ==================== 初始状态 ====================

const initialModule2StreamState: Module2StreamState = {
  ipTags: { content: [], isComplete: false },
  brandSlogan: { content: '', isComplete: false },
  contentColumns: { content: [], isComplete: false },
  goldenSentences: { content: [], isComplete: false }
};

const initialState: BusinessStreamState = {
  module1: {
    data: null,
    isLoading: false,
    error: null
  },
  module2: {
    streamState: initialModule2StreamState,
    isStreaming: false,
    error: null,
    finalData: null
  },
  module3: {
    data: null,
    isLoading: false,
    error: null
  },
  currentStep: 'module1',
  requestId: null
};

// ==================== Hook实现 ====================

export function useBusinessStream(options: BusinessStreamOptions = {}) {
  const [state, setState] = useState<BusinessStreamState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);


  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ==================== 模块1：关键词推荐 ====================

  const fetchModule1Keywords = useCallback(async (storeInfo: StoreInfo) => {
    if (state.module1.isLoading) return;

    setState(prev => ({
      ...prev,
      module1: {
        ...prev.module1,
        isLoading: true,
        error: null
      },
      currentStep: 'module1'
    }));

    options.onStepChange?.('module1');

    try {
      const response = await fetch('/api/module1-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeInfo)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<Module1Data> = await response.json();

      if (!result.success) {
        throw new Error(result.error || '模块1处理失败');
      }

      const module1Data: Module1Data = {
        ...storeInfo,
        ...result.data!
      };

      setState(prev => ({
        ...prev,
        module1: {
          data: module1Data,
          isLoading: false,
          error: null
        }
      }));

      options.onModule1Complete?.(module1Data);
      retryCountRef.current = 0;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '模块1处理失败';
      
      setState(prev => ({
        ...prev,
        module1: {
          ...prev.module1,
          isLoading: false,
          error: errorMessage
        }
      }));

      options.onError?.(errorMessage, 'module1');
    }
  }, [state.module1.isLoading, options]);

  // ==================== 模块2：流式方案生成 ====================

  const startModule2Generation = useCallback(async (module1Data: Module1Data) => {
    if (state.module2.isStreaming) return;

    setState(prev => ({
      ...prev,
      module2: {
        ...prev.module2,
        streamState: initialModule2StreamState,
        isStreaming: true,
        error: null,
        finalData: null
      },
      currentStep: 'module2'
    }));

    options.onStepChange?.('module2');

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/module2-plan-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module1Data),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedData: Partial<Module2OutputFull> = {};

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // 流式响应结束，生成最终数据
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

              setState(prev => ({
                ...prev,
                module2: {
                  ...prev.module2,
                  isStreaming: false,
                  finalData,
                  streamState: {
                    ipTags: { content: finalData.ipTags, isComplete: true },
                    brandSlogan: { content: finalData.brandSlogan, isComplete: true },
                    contentColumns: { content: finalData.contentColumns, isComplete: true },
                    goldenSentences: { content: finalData.goldenSentences, isComplete: true }
                  }
                }
              }));

              options.onModule2Complete?.(finalData);
              retryCountRef.current = 0;
              return;
            }
            
            try {
              const parsed: StreamChunk = JSON.parse(data);
              
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              
              if (parsed.type === 'content' && parsed.data) {
                // 更新累积数据
                accumulatedData = { ...accumulatedData, ...parsed.data };
                
                // 更新流式状态
                setState(prev => ({
                  ...prev,
                  module2: {
                    ...prev.module2,
                    streamState: {
                      ipTags: {
                        content: parsed.data.ipTags || prev.module2.streamState.ipTags.content,
                        isComplete: !!parsed.data.ipTags
                      },
                      brandSlogan: {
                        content: parsed.data.brandSlogan || prev.module2.streamState.brandSlogan.content,
                        isComplete: !!parsed.data.brandSlogan
                      },
                      contentColumns: {
                        content: parsed.data.contentColumns || prev.module2.streamState.contentColumns.content,
                        isComplete: !!parsed.data.contentColumns
                      },
                      goldenSentences: {
                        content: parsed.data.goldenSentences || prev.module2.streamState.goldenSentences.content,
                        isComplete: !!parsed.data.goldenSentences
                      }
                    }
                  }
                }));
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', data, parseError);
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Module2 request was aborted');
        setState(prev => ({
          ...prev,
          module2: {
            ...prev.module2,
            isStreaming: false
          }
        }));
      } else {
        const errorMessage = error instanceof Error ? error.message : '模块2处理失败';
        
        setState(prev => ({
          ...prev,
          module2: {
            ...prev.module2,
            isStreaming: false,
            error: errorMessage
          }
        }));

        options.onError?.(errorMessage, 'module2');
      }
    }
  }, [state.module2.isStreaming, options]);

  // ==================== 模块3：Banner设计 ====================

  const generateModule3Banner = useCallback(async (
    module1Data: Module1Data, 
    module2Data: Module2OutputFull
  ) => {
    if (state.module3.isLoading) return;

    setState(prev => ({
      ...prev,
      module3: {
        ...prev.module3,
        isLoading: true,
        error: null
      },
      currentStep: 'module3'
    }));

    options.onStepChange?.('module3');

    try {
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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: ApiResponse<Module3Output> = await response.json();

      if (!result.success) {
        throw new Error(result.error || '模块3处理失败');
      }

      setState(prev => ({
        ...prev,
        module3: {
          data: result.data!,
          isLoading: false,
          error: null
        },
        currentStep: 'completed'
      }));

      options.onModule3Complete?.(result.data!);
      options.onStepChange?.('completed');
      retryCountRef.current = 0;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '模块3处理失败';
      
      setState(prev => ({
        ...prev,
        module3: {
          ...prev.module3,
          isLoading: false,
          error: errorMessage
        }
      }));

      options.onError?.(errorMessage, 'module3');
    }
  }, [state.module3.isLoading, options]);

  // ==================== 控制方法 ====================

  const stopModule2Generation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      module2: {
        ...prev.module2,
        isStreaming: false
      }
    }));
  }, []);

  const resetAllModules = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(initialState);
    retryCountRef.current = 0;
  }, []);

  const retryCurrentStep = useCallback(() => {
    const { currentStep } = state;
    
    if (currentStep === 'module1' && state.module1.error) {
      // 需要重新提供storeInfo，这里只能清除错误状态
      setState(prev => ({
        ...prev,
        module1: {
          ...prev.module1,
          error: null
        }
      }));
    } else if (currentStep === 'module2' && state.module2.error && state.module1.data) {
      startModule2Generation(state.module1.data);
    } else if (currentStep === 'module3' && state.module3.error && state.module1.data && state.module2.finalData) {
      generateModule3Banner(state.module1.data, state.module2.finalData);
    }
  }, [state, startModule2Generation, generateModule3Banner]);

  const clearError = useCallback((module: 'module1' | 'module2' | 'module3') => {
    setState(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        error: null
      }
    }));
  }, []);

  // ==================== 便捷方法 ====================

  const canProceedToModule2 = state.module1.data !== null && !state.module1.error;
  const canProceedToModule3 = canProceedToModule2 && state.module2.finalData !== null && !state.module2.error;
  const isCompleted = state.currentStep === 'completed' && state.module3.data !== null;

  const getProgress = useCallback(() => {
    let completed = 0;
    let total = 3;
    
    if (state.module1.data) completed++;
    if (state.module2.finalData) completed++;
    if (state.module3.data) completed++;
    
    return { completed, total, percentage: (completed / total) * 100 };
  }, [state]);

  // ==================== 返回值 ====================

  return {
    // 状态
    ...state,
    
    // 模块1方法
    fetchModule1Keywords,
    
    // 模块2方法
    startModule2Generation,
    stopModule2Generation,
    
    // 模块3方法
    generateModule3Banner,
    
    // 控制方法
    resetAllModules,
    retryCurrentStep,
    clearError,
    
    // 便捷属性
    canProceedToModule2,
    canProceedToModule3,
    isCompleted,
    getProgress,
    
    // 状态检查
    isAnyLoading: state.module1.isLoading || state.module2.isStreaming || state.module3.isLoading,
    hasAnyError: !!state.module1.error || !!state.module2.error || !!state.module3.error,
    
    // 数据访问
    getAllData: () => ({
      module1: state.module1.data,
      module2: state.module2.finalData,
      module3: state.module3.data
    })
  };
}

export default useBusinessStream;