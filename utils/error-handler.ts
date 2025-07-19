/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 格式化错误消息
   */
  static formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return '未知错误'
  }

  /**
   * 记录错误日志
   */
  static logError(context: string, error: unknown, metadata?: Record<string, any>): void {
    const timestamp = new Date().toISOString()
    const errorMessage = this.formatError(error)
    
    console.error(`[${timestamp}] ${context} 失败`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      ...metadata
    })
  }

  /**
   * 显示用户友好的错误消息
   */
  static showUserError(context: string, error: unknown): void {
    const errorMessage = this.formatError(error)
    alert(`${context}时出错: ${errorMessage}`)
  }
}

/**
 * 异步操作包装器，提供统一的错误处理
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  metadata?: Record<string, any>
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    ErrorHandler.logError(context, error, metadata)
    ErrorHandler.showUserError(context, error)
    return null
  }
}