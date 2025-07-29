/**
 * 统一错误处理工具
 * 提供标准化的错误处理和类型安全的错误信息提取
 */

// ==================== 错误类型定义 ====================

export interface ErrorInfo {
  message: string;
  code?: string;
  type: 'network' | 'validation' | 'rate_limit' | 'server' | 'client' | 'unknown';
  retryable: boolean;
  retryAfter?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

// ==================== 错误分类器 ====================

export function classifyError(error: unknown): ErrorInfo {
  // 处理 AbortError
  if (error instanceof Error && error.name === 'AbortError') {
    return {
      message: '请求已取消',
      code: 'ABORTED',
      type: 'client',
      retryable: false
    };
  }

  // 处理网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: '网络连接失败，请检查网络连接',
      code: 'NETWORK_ERROR',
      type: 'network',
      retryable: true
    };
  }

  // 处理HTTP错误
  if (error instanceof Error) {
    const message = error.message;
    
    // 速率限制
    if (message.includes('429') || message.toLowerCase().includes('rate limit')) {
      const retryAfterMatch = message.match(/(\d+)/);
      const retryAfter = retryAfterMatch ? parseInt(retryAfterMatch[1]) : 60;
      
      return {
        message: `请求过于频繁，请等待 ${retryAfter} 秒后重试`,
        code: 'RATE_LIMITED',
        type: 'rate_limit',
        retryable: true,
        retryAfter
      };
    }

    // 服务器错误 (5xx)
    if (message.includes('HTTP 5')) {
      return {
        message: '服务器暂时不可用，请稍后重试',
        code: 'SERVER_ERROR',
        type: 'server',
        retryable: true
      };
    }

    // 客户端错误 (4xx)
    if (message.includes('HTTP 4')) {
      return {
        message: '请求参数错误，请检查输入内容',
        code: 'CLIENT_ERROR',
        type: 'client',
        retryable: false
      };
    }

    // 超时错误
    if (message.includes('timeout') || message.includes('超时')) {
      return {
        message: '请求超时，请重试',
        code: 'TIMEOUT',
        type: 'network',
        retryable: true
      };
    }

    // 解析错误
    if (message.includes('parse') || message.includes('JSON')) {
      return {
        message: '数据格式错误，请重试',
        code: 'PARSE_ERROR',
        type: 'server',
        retryable: true
      };
    }

    // 通用错误
    return {
      message: error.message,
      code: 'GENERIC_ERROR',
      type: 'unknown',
      retryable: true
    };
  }

  // 未知错误
  return {
    message: '发生未知错误，请重试',
    code: 'UNKNOWN_ERROR',
    type: 'unknown',
    retryable: true
  };
}

// ==================== 重试逻辑 ====================

export function calculateRetryDelay(
  attempt: number, 
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
): number {
  if (attempt >= config.maxRetries) {
    return 0;
  }

  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  );

  // 添加随机抖动，避免雷群效应
  return delay + Math.random() * 1000;
}

export function shouldRetry(error: ErrorInfo, attempt: number, maxRetries: number): boolean {
  return error.retryable && attempt < maxRetries;
}

// ==================== 自动重试装饰器 ====================

export function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }
) {
  return async (...args: T): Promise<R> => {
    let lastError: ErrorInfo;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = classifyError(error);
        
        if (!shouldRetry(lastError, attempt, config.maxRetries)) {
          throw new Error(lastError.message);
        }

        if (attempt < config.maxRetries) {
          const delay = lastError.retryAfter 
            ? lastError.retryAfter * 1000 
            : calculateRetryDelay(attempt, config);
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(lastError!.message);
  };
}

// ==================== 错误报告 ====================

export interface ErrorReport {
  timestamp: string;
  error: ErrorInfo;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

export function createErrorReport(error: unknown, context?: Record<string, any>): ErrorReport {
  return {
    timestamp: new Date().toISOString(),
    error: classifyError(error),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined
  };
}

// ==================== 用户友好的错误消息 ====================

export function getUserFriendlyMessage(error: unknown): string {
  const errorInfo = classifyError(error);
  
  const friendlyMessages: Record<string, string> = {
    'NETWORK_ERROR': '网络连接不稳定，请检查网络后重试',
    'RATE_LIMITED': '操作过于频繁，请稍后再试',
    'SERVER_ERROR': '服务暂时不可用，请稍后重试',
    'CLIENT_ERROR': '请求格式有误，请检查输入内容',
    'TIMEOUT': '请求超时，请重试',
    'PARSE_ERROR': '数据处理出错，请重试',
    'ABORTED': '操作已取消'
  };

  return friendlyMessages[errorInfo.code || ''] || errorInfo.message || '操作失败，请重试';
}

// ==================== 导出便捷函数 ====================

export const safeAsync = <T extends any[], R>(fn: (...args: T) => Promise<R>) => 
  withRetry(fn);

export const handleError = (error: unknown) => ({
  info: classifyError(error),
  message: getUserFriendlyMessage(error),
  report: createErrorReport(error)
});