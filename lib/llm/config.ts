/**
 * 统一多模型 LLM SDK 配置
 */

// LLM 配置类型定义

export interface LLMConfig {
  // 默认模型选择策略
  defaultStrategy: 'performance' | 'cost' | 'balanced'
  
  // 各任务类型的模型偏好
  taskPreferences: {
    fast: string[]           // 快速响应优先级列表
    long_context: string[]   // 长上下文优先级列表
    long_generation: string[] // 长内容生成优先级列表
    multimodal: string[]     // 多模态优先级列表
    budget: string[]         // 预算优先优先级列表
    experimental: string[]   // 实验性优先级列表
    default: string[]        // 默认优先级列表
  }
  
  // 提供商优先级
  providerPriority: Array<'siliconflow' | 'google' | 'openai' | 'anthropic'>
  
  // 重试配置
  retry: {
    maxAttempts: number
    baseDelay: number
    maxDelay: number
    backoffMultiplier: number
  }
  
  // 超时配置
  timeout: {
    default: number
    stream: number
    batch: number
  }
  
  // 并发限制
  concurrency: {
    maxConcurrent: number
    queueTimeout: number
  }
  
  // 成本控制
  costControl: {
    maxCostPerRequest: number  // 单次请求最大成本 (USD)
    dailyBudget: number        // 每日预算 (USD)
    enableCostTracking: boolean
  }
  
  // 缓存配置
  cache: {
    enabled: boolean
    ttl: number              // 缓存时间 (秒)
    maxSize: number          // 最大缓存条目数
  }
  
  // 日志配置
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    enableRequestLogging: boolean
    enableResponseLogging: boolean
    enablePerformanceLogging: boolean
  }
}

// 默认配置
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  defaultStrategy: 'balanced',
  
  taskPreferences: {
    fast: [
      'gemini-1.5-flash',
      'gemini-2.0-flash-exp',
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      'gpt-3.5-turbo'
    ],
    long_context: [
      'gemini-1.5-pro',
      'moonshotai/Kimi-K2-Instruct',
      'Pro/moonshotai/Kimi-K2-Instruct',
      'gpt-4'
    ],
    long_generation: [
      'gemini-2.0-flash-exp',  // 免费 + 12K tokens 输出
      'gemini-1.5-pro',
      'moonshotai/Kimi-K2-Instruct',
      'deepseek-ai/DeepSeek-V3'
    ],
    multimodal: [
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gpt-4'
    ],
    budget: [
      'gemini-2.0-flash-exp',  // 完全免费
      'gemini-1.5-flash',      // 最便宜
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      'gpt-3.5-turbo'
    ],
    experimental: [
      'gemini-2.0-flash-exp',
      'THUDM/GLM-4.1V-9B-Thinking',
      'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
    ],
    default: [
      'deepseek-ai/DeepSeek-V3',
      'gemini-1.5-flash',
      'Qwen/Qwen2.5-72B-Instruct',
      'gpt-3.5-turbo'
    ]
  },
  
  providerPriority: ['siliconflow', 'google', 'openai', 'anthropic'],
  
  retry: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  },
  
  timeout: {
    default: 30000,   // 30秒
    stream: 60000,    // 60秒
    batch: 120000     // 120秒
  },
  
  concurrency: {
    maxConcurrent: 5,
    queueTimeout: 30000
  },
  
  costControl: {
    maxCostPerRequest: 1.0,    // $1 per request
    dailyBudget: 10.0,         // $10 per day
    enableCostTracking: true
  },
  
  cache: {
    enabled: false,  // 默认关闭缓存
    ttl: 3600,       // 1小时
    maxSize: 1000
  },
  
  logging: {
    level: 'info',
    enableRequestLogging: true,
    enableResponseLogging: false,  // 避免记录敏感内容
    enablePerformanceLogging: true
  }
}

// 环境特定配置
export const ENVIRONMENT_CONFIGS: Record<string, Partial<LLMConfig>> = {
  development: {
    logging: {
      level: 'debug',
      enableRequestLogging: true,
      enableResponseLogging: true,
      enablePerformanceLogging: true
    },
    costControl: {
      maxCostPerRequest: 0.1,  // 开发环境限制更严格
      dailyBudget: 1.0,
      enableCostTracking: true
    }
  },
  
  production: {
    logging: {
      level: 'warn',
      enableRequestLogging: true,
      enableResponseLogging: false,
      enablePerformanceLogging: true
    },
    cache: {
      enabled: true,
      ttl: 1800,  // 30分钟
      maxSize: 5000
    },
    costControl: {
      maxCostPerRequest: 5.0,
      dailyBudget: 100.0,
      enableCostTracking: true
    }
  },
  
  test: {
    logging: {
      level: 'error',
      enableRequestLogging: false,
      enableResponseLogging: false,
      enablePerformanceLogging: false
    },
    timeout: {
      default: 10000,
      stream: 15000,
      batch: 30000
    },
    costControl: {
      maxCostPerRequest: 0.01,
      dailyBudget: 0.1,
      enableCostTracking: false
    }
  }
}

// 获取当前环境配置
export function getLLMConfig(): LLMConfig {
  const env = process.env.NODE_ENV || 'development'
  const envConfig = ENVIRONMENT_CONFIGS[env] || {}
  
  return {
    ...DEFAULT_LLM_CONFIG,
    ...envConfig,
    // 深度合并嵌套对象
    taskPreferences: {
      ...DEFAULT_LLM_CONFIG.taskPreferences,
      ...envConfig.taskPreferences
    },
    retry: {
      ...DEFAULT_LLM_CONFIG.retry,
      ...envConfig.retry
    },
    timeout: {
      ...DEFAULT_LLM_CONFIG.timeout,
      ...envConfig.timeout
    },
    concurrency: {
      ...DEFAULT_LLM_CONFIG.concurrency,
      ...envConfig.concurrency
    },
    costControl: {
      ...DEFAULT_LLM_CONFIG.costControl,
      ...envConfig.costControl
    },
    cache: {
      ...DEFAULT_LLM_CONFIG.cache,
      ...envConfig.cache
    },
    logging: {
      ...DEFAULT_LLM_CONFIG.logging,
      ...envConfig.logging
    }
  }
}

// 验证配置
export function validateLLMConfig(config: LLMConfig): string[] {
  const errors: string[] = []
  
  // 验证任务偏好
  Object.entries(config.taskPreferences).forEach(([task, models]) => {
    if (!Array.isArray(models) || models.length === 0) {
      errors.push(`任务 ${task} 的模型偏好列表不能为空`)
    }
  })
  
  // 验证重试配置
  if (config.retry.maxAttempts < 1) {
    errors.push('重试次数必须大于等于1')
  }
  
  if (config.retry.baseDelay < 0) {
    errors.push('基础延迟时间不能为负数')
  }
  
  // 验证超时配置
  Object.entries(config.timeout).forEach(([key, value]) => {
    if (value < 1000) {
      errors.push(`${key} 超时时间不能少于1秒`)
    }
  })
  
  // 验证成本控制
  if (config.costControl.maxCostPerRequest < 0) {
    errors.push('单次请求最大成本不能为负数')
  }
  
  if (config.costControl.dailyBudget < 0) {
    errors.push('每日预算不能为负数')
  }
  
  return errors
}

// 配置管理器
export class LLMConfigManager {
  private config: LLMConfig
  private listeners: Array<(config: LLMConfig) => void> = []
  
  constructor(initialConfig?: Partial<LLMConfig>) {
    this.config = {
      ...getLLMConfig(),
      ...initialConfig
    }
    
    const errors = validateLLMConfig(this.config)
    if (errors.length > 0) {
      throw new Error(`LLM配置验证失败: ${errors.join(', ')}`)
    }
  }
  
  getConfig(): LLMConfig {
    return { ...this.config }
  }
  
  updateConfig(updates: Partial<LLMConfig>): void {
    const newConfig = {
      ...this.config,
      ...updates
    }
    
    const errors = validateLLMConfig(newConfig)
    if (errors.length > 0) {
      throw new Error(`配置更新验证失败: ${errors.join(', ')}`)
    }
    
    this.config = newConfig
    this.notifyListeners()
  }
  
  onConfigChange(listener: (config: LLMConfig) => void): () => void {
    this.listeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.config)
      } catch (error) {
        console.error('配置变更监听器执行失败:', error)
      }
    })
  }
}

// 全局配置管理器实例
export const globalLLMConfig = new LLMConfigManager()