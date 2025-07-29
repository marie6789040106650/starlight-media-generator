// AI服务配置管理器 (Server-side only)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface AIServiceConfig {
  provider: 'siliconflow' | 'openai' | 'anthropic' | 'google'
  apiKey: string
  enabled: boolean
  lastUpdated: string
  notes?: string
}

export interface ConfigData {
  services: Record<string, AIServiceConfig>
  settings: {
    defaultProvider: string
    autoFallback: boolean
    logUsage: boolean
    lastConfigUpdate: string
  }
}

class ConfigManager {
  private configPath: string
  private config: ConfigData | null = null

  constructor() {
    // 配置文件存储在项目根目录的 .kiro 文件夹中
    this.configPath = join(process.cwd(), '.kiro', 'ai-config.json')
  }

  /**
   * 初始化配置文件
   */
  private initializeConfig(): ConfigData {
    const defaultConfig: ConfigData = {
      services: {
        siliconflow: {
          provider: 'siliconflow',
          apiKey: '',
          enabled: false,
          lastUpdated: new Date().toISOString(),
          notes: '硅基流动 - 中文优化，成本低'
        },
        google: {
          provider: 'google',
          apiKey: '',
          enabled: false,
          lastUpdated: new Date().toISOString(),
          notes: 'Google Gemini - 多模态，超长上下文'
        },
        openai: {
          provider: 'openai',
          apiKey: '',
          enabled: false,
          lastUpdated: new Date().toISOString(),
          notes: 'OpenAI - 业界标杆，效果最好'
        },
        anthropic: {
          provider: 'anthropic',
          apiKey: '',
          enabled: false,
          lastUpdated: new Date().toISOString(),
          notes: 'Anthropic Claude - 安全导向，长上下文'
        }
      },
      settings: {
        defaultProvider: 'siliconflow',
        autoFallback: true,
        logUsage: true,
        lastConfigUpdate: new Date().toISOString()
      }
    }

    this.saveConfig(defaultConfig)
    return defaultConfig
  }

  /**
   * 加载配置
   */
  private loadConfig(): ConfigData {
    if (this.config) {
      return this.config
    }

    try {
      if (!existsSync(this.configPath)) {
        console.log('🔧 初始化AI服务配置文件...')
        return this.initializeConfig()
      }

      const configData = readFileSync(this.configPath, 'utf8')
      this.config = JSON.parse(configData)
      return this.config!
    } catch (error) {
      console.error('❌ 配置文件加载失败，使用默认配置:', error)
      return this.initializeConfig()
    }
  }

  /**
   * 保存配置
   */
  private saveConfig(config: ConfigData): void {
    try {
      // 确保目录存在
      const configDir = join(process.cwd(), '.kiro')
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true })
      }

      // 更新最后修改时间
      config.settings.lastConfigUpdate = new Date().toISOString()
      
      writeFileSync(this.configPath, JSON.stringify(config, null, 2))
      this.config = config
      console.log('✅ AI服务配置已保存')
    } catch (error) {
      console.error('❌ 配置文件保存失败:', error)
      throw error
    }
  }

  /**
   * 获取所有服务配置
   */
  public getAllServices(): Record<string, AIServiceConfig> {
    const config = this.loadConfig()
    return config.services
  }

  /**
   * 获取特定服务配置
   */
  public getService(provider: string): AIServiceConfig | null {
    const config = this.loadConfig()
    return config.services[provider] || null
  }

  /**
   * 更新服务API密钥
   */
  public updateApiKey(provider: string, apiKey: string, notes?: string): boolean {
    try {
      const config = this.loadConfig()
      
      if (!config.services[provider]) {
        console.error(`❌ 未知的服务提供商: ${provider}`)
        return false
      }

      config.services[provider].apiKey = apiKey
      config.services[provider].enabled = apiKey.length > 0
      config.services[provider].lastUpdated = new Date().toISOString()
      
      if (notes) {
        config.services[provider].notes = notes
      }

      this.saveConfig(config)
      console.log(`✅ ${provider} API密钥已更新`)
      return true
    } catch (error) {
      console.error(`❌ 更新${provider} API密钥失败:`, error)
      return false
    }
  }

  /**
   * 启用/禁用服务
   */
  public toggleService(provider: string, enabled: boolean): boolean {
    try {
      const config = this.loadConfig()
      
      if (!config.services[provider]) {
        console.error(`❌ 未知的服务提供商: ${provider}`)
        return false
      }

      config.services[provider].enabled = enabled
      config.services[provider].lastUpdated = new Date().toISOString()

      this.saveConfig(config)
      console.log(`✅ ${provider} 服务已${enabled ? '启用' : '禁用'}`)
      return true
    } catch (error) {
      console.error(`❌ 切换${provider}服务状态失败:`, error)
      return false
    }
  }

  /**
   * 获取可用的服务列表
   */
  public getAvailableServices(): string[] {
    const config = this.loadConfig()
    return Object.entries(config.services)
      .filter(([_, service]) => service.enabled && service.apiKey.length > 0)
      .map(([provider, _]) => provider)
  }

  /**
   * 获取API密钥（优先从配置文件，其次从环境变量）
   */
  public getApiKey(provider: string): string | null {
    // 1. 首先尝试从配置文件获取
    const service = this.getService(provider)
    if (service && service.enabled && service.apiKey) {
      return service.apiKey
    }

    // 2. 其次从环境变量获取
    const envVarName = this.getEnvVarName(provider)
    const envKey = process.env[envVarName]
    if (envKey) {
      // 如果环境变量有密钥，自动更新到配置文件
      this.updateApiKey(provider, envKey, '从环境变量自动导入')
      return envKey
    }

    return null
  }

  /**
   * 获取环境变量名
   */
  private getEnvVarName(provider: string): string {
    const envMap: Record<string, string> = {
      siliconflow: 'SILICONFLOW_API_KEY',
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      google: 'GOOGLE_API_KEY'
    }
    return envMap[provider] || 'API_KEY'
  }

  /**
   * 检查服务是否可用
   */
  public isServiceAvailable(provider: string): boolean {
    return this.getApiKey(provider) !== null
  }

  /**
   * 获取配置统计信息
   */
  public getConfigStats(): {
    totalServices: number
    enabledServices: number
    availableServices: string[]
    lastUpdate: string
  } {
    const config = this.loadConfig()
    const availableServices = this.getAvailableServices()

    return {
      totalServices: Object.keys(config.services).length,
      enabledServices: Object.values(config.services).filter(s => s.enabled).length,
      availableServices,
      lastUpdate: config.settings.lastConfigUpdate
    }
  }

  /**
   * 导出配置（不包含敏感信息）
   */
  public exportConfig(): any {
    const config = this.loadConfig()
    const safeConfig = {
      services: Object.fromEntries(
        Object.entries(config.services).map(([provider, service]) => [
          provider,
          {
            provider: service.provider,
            enabled: service.enabled,
            hasApiKey: service.apiKey.length > 0,
            lastUpdated: service.lastUpdated,
            notes: service.notes
          }
        ])
      ),
      settings: config.settings
    }
    return safeConfig
  }

  /**
   * 重置配置
   */
  public resetConfig(): void {
    console.log('🔄 重置AI服务配置...')
    this.config = null
    this.initializeConfig()
  }
}

// 单例实例
export const configManager = new ConfigManager()

// 便捷函数
export function getApiKey(provider: string): string | null {
  return configManager.getApiKey(provider)
}

export function isServiceAvailable(provider: string): boolean {
  return configManager.isServiceAvailable(provider)
}

export function getAvailableServices(): string[] {
  return configManager.getAvailableServices()
}

export function updateApiKey(provider: string, apiKey: string, notes?: string): boolean {
  return configManager.updateApiKey(provider, apiKey, notes)
}