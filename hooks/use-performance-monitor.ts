import { useCallback, useRef } from "react"

interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  context: string
  metadata?: Record<string, any>
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<Map<string, PerformanceMetrics>>(new Map())

  const startTimer = useCallback((id: string, context: string, metadata?: Record<string, any>) => {
    const startTime = Date.now()
    metricsRef.current.set(id, {
      startTime,
      context,
      metadata
    })
    
    console.log(`[${new Date().toISOString()}] 开始${context}`, metadata)
  }, [])

  const endTimer = useCallback((id: string, additionalMetadata?: Record<string, any>) => {
    const metrics = metricsRef.current.get(id)
    if (!metrics) {
      console.warn(`Performance timer not found: ${id}`)
      return
    }

    const endTime = Date.now()
    const duration = endTime - metrics.startTime
    
    const finalMetrics = {
      ...metrics,
      endTime,
      duration
    }
    
    console.log(`[${new Date().toISOString()}] ${metrics.context}完成`, {
      duration: `${duration}ms`,
      ...metrics.metadata,
      ...additionalMetadata
    })
    
    metricsRef.current.delete(id)
    return finalMetrics
  }, [])

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const id = `${context}-${Date.now()}`
    startTimer(id, context, metadata)
    
    try {
      const result = await operation()
      endTimer(id, { success: true })
      return result
    } catch (error) {
      endTimer(id, { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      })
      throw error
    }
  }, [startTimer, endTimer])

  return {
    startTimer,
    endTimer,
    measureAsync
  }
}