/**
 * 环境配置管理
 * 确保Edge Function和Serverless Function间的环境变量共享
 */

// 环境变量类型定义
export interface EnvironmentConfig {
  // AI API配置
  siliconflowApiKey: string | null;
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
  
  // API基础配置
  apiBaseUrl: string;
  apiTimeout: number;
  streamTimeout: number;
  
  // 功能开关
  enableStreamingChat: boolean;
  enableBusinessModules: boolean;
  enableModelSelection: boolean;
  enableAdvancedUI: boolean;
  
  // 调试配置
  enableVerboseLogging: boolean;
  enablePerformanceMonitoring: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  // 运行环境
  nodeEnv: string;
  edgeRegion: string;
}

// 默认配置
const DEFAULT_CONFIG: EnvironmentConfig = {
  siliconflowApiKey: null,
  openaiApiKey: null,
  anthropicApiKey: null,
  apiBaseUrl: 'https://api.siliconflow.cn',
  apiTimeout: 30000,
  streamTimeout: 60000,
  enableStreamingChat: true,
  enableBusinessModules: true,
  enableModelSelection: true,
  enableAdvancedUI: true,
  enableVerboseLogging: false,
  enablePerformanceMonitoring: false,
  logLevel: 'info',
  nodeEnv: 'development',
  edgeRegion: 'hkg1'
};

/**
 * 获取环境配置
 * 支持Edge Runtime和Node.js Runtime
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    siliconflowApiKey: process.env.SILICONFLOW_API_KEY || null,
    openaiApiKey: process.env.OPENAI_API_KEY || null,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_CONFIG.apiBaseUrl,
    apiTimeout: parseInt(process.env.API_TIMEOUT || '30000'),
    streamTimeout: parseInt(process.env.STREAM_TIMEOUT || '60000'),
    
    enableStreamingChat: process.env.ENABLE_STREAMING_CHAT === 'true',
    enableBusinessModules: process.env.ENABLE_BUSINESS_MODULES === 'true',
    enableModelSelection: process.env.ENABLE_MODEL_SELECTION === 'true',
    enableAdvancedUI: process.env.ENABLE_ADVANCED_UI === 'true',
    
    enableVerboseLogging: process.env.ENABLE_VERBOSE_LOGGING === 'true',
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    logLevel: (process.env.LOG_LEVEL as any) || DEFAULT_CONFIG.logLevel,
    
    nodeEnv: process.env.NODE_ENV || DEFAULT_CONFIG.nodeEnv,
    edgeRegion: process.env.NEXT_PUBLIC_EDGE_REGION || DEFAULT_CONFIG.edgeRegion
  };
}

/**
 * 验证环境配置
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 检查必需的API密钥
  if (!config.siliconflowApiKey) {
    errors.push('SILICONFLOW_API_KEY is required');
  }
  
  if (!config.openaiApiKey) {
    warnings.push('OPENAI_API_KEY is not configured (optional backup)');
  }
  
  if (!config.anthropicApiKey) {
    warnings.push('ANTHROPIC_API_KEY is not configured (optional)');
  }
  
  // 检查超时配置
  if (config.apiTimeout < 1000 || config.apiTimeout > 300000) {
    warnings.push('API_TIMEOUT should be between 1000ms and 300000ms');
  }
  
  if (config.streamTimeout < 1000 || config.streamTimeout > 600000) {
    warnings.push('STREAM_TIMEOUT should be between 1000ms and 600000ms');
  }
  
  // 检查日志级别
  const validLogLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLogLevels.includes(config.logLevel)) {
    warnings.push(`LOG_LEVEL should be one of: ${validLogLevels.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 获取API密钥（按提供商）
 */
export function getApiKeyByProvider(provider: string): string | null {
  const config = getEnvironmentConfig();
  
  switch (provider) {
    case 'siliconflow':
      return config.siliconflowApiKey;
    case 'openai':
      return config.openaiApiKey;
    case 'anthropic':
      return config.anthropicApiKey;
    default:
      return null;
  }
}

/**
 * 检查功能是否启用
 */
export function isFeatureEnabled(feature: keyof Pick<EnvironmentConfig, 
  'enableStreamingChat' | 'enableBusinessModules' | 'enableModelSelection' | 'enableAdvancedUI'
>): boolean {
  const config = getEnvironmentConfig();
  return config[feature];
}

/**
 * 获取调试配置
 */
export function getDebugConfig(): Pick<EnvironmentConfig, 
  'enableVerboseLogging' | 'enablePerformanceMonitoring' | 'logLevel'
> {
  const config = getEnvironmentConfig();
  return {
    enableVerboseLogging: config.enableVerboseLogging,
    enablePerformanceMonitoring: config.enablePerformanceMonitoring,
    logLevel: config.logLevel
  };
}

/**
 * 日志记录函数
 */
export function logWithLevel(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]) {
  const config = getDebugConfig();
  
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const currentLevel = levels[config.logLevel];
  const messageLevel = levels[level];
  
  if (messageLevel <= currentLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
    }
  }
}

/**
 * 性能监控装饰器
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const config = getDebugConfig();
    
    if (!config.enablePerformanceMonitoring) {
      return fn(...args);
    }
    
    const start = performance.now();
    const result = fn(...args);
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        logWithLevel('debug', `Performance: ${name} took ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      logWithLevel('debug', `Performance: ${name} took ${duration.toFixed(2)}ms`);
      return result;
    }
  }) as T;
}

/**
 * 环境配置摘要
 */
export function getConfigSummary(): {
  environment: string;
  region: string;
  apiProviders: string[];
  enabledFeatures: string[];
  debugMode: boolean;
} {
  const config = getEnvironmentConfig();
  
  const apiProviders: string[] = [];
  if (config.siliconflowApiKey) apiProviders.push('SiliconFlow');
  if (config.openaiApiKey) apiProviders.push('OpenAI');
  if (config.anthropicApiKey) apiProviders.push('Anthropic');
  
  const enabledFeatures: string[] = [];
  if (config.enableStreamingChat) enabledFeatures.push('Streaming Chat');
  if (config.enableBusinessModules) enabledFeatures.push('Business Modules');
  if (config.enableModelSelection) enabledFeatures.push('Model Selection');
  if (config.enableAdvancedUI) enabledFeatures.push('Advanced UI');
  
  return {
    environment: config.nodeEnv,
    region: config.edgeRegion,
    apiProviders,
    enabledFeatures,
    debugMode: config.enableVerboseLogging || config.enablePerformanceMonitoring
  };
}