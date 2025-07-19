// AI模型配置
export interface AIModel {
  id: string
  name: string
  provider: string
  endpoint: string
  maxTokens: number
  temperature: number
  topP: number
  description: string
  category: 'chat' | 'image' | 'multimodal'
}

// 文本对话模型配置
export const CHAT_MODELS: AIModel[] = [
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek-V3',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '🚀 最推荐 - 最新的DeepSeek-V3模型，推理能力强',
    category: 'chat'
  },
  {
    id: 'moonshotai/Kimi-K2-Instruct',
    name: 'Kimi-K2 标准版',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '📚 长上下文场景 - Moonshot Kimi-K2标准版，长上下文支持',
    category: 'chat'
  },
  {
    id: 'Pro/moonshotai/Kimi-K2-Instruct',
    name: 'Kimi-K2 Pro版',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 16000,
    temperature: 0.7,
    topP: 0.9,
    description: '🎯 高要求场景 - Moonshot Kimi-K2专业版，更强性能和更长上下文',
    category: 'chat'
  },
  {
    id: 'THUDM/GLM-4.1V-9B-Thinking',
    name: 'GLM-4.1V-9B-Thinking',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '🧠 思维链推理 - 清华GLM-4.1V思维模型，支持复杂推理',
    category: 'chat'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
    name: 'DeepSeek-R1-Qwen3-8B',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '⚡ 推理优化 - DeepSeek-R1推理模型，基于Qwen3优化',
    category: 'chat'
  }
]

// 图片生成模型配置
export const IMAGE_MODELS: AIModel[] = [
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX.1-schnell',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    maxTokens: 0,
    temperature: 0,
    topP: 0,
    description: 'FLUX.1快速版本，生成速度快',
    category: 'image'
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1-dev',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    maxTokens: 0,
    temperature: 0,
    topP: 0,
    description: 'FLUX.1开发版本，质量更高',
    category: 'image'
  },
  {
    id: 'stabilityai/stable-diffusion-3-5-large',
    name: 'Stable Diffusion 3.5',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    maxTokens: 0,
    temperature: 0,
    topP: 0,
    description: 'Stable Diffusion 3.5大模型',
    category: 'image'
  }
]

// 默认模型配置
export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0] // DeepSeek-V3
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0] // FLUX.1-schnell

// 根据ID获取模型配置
export function getModelById(modelId: string): AIModel | undefined {
  return [...CHAT_MODELS, ...IMAGE_MODELS].find(model => model.id === modelId)
}

// 获取指定类别的模型
export function getModelsByCategory(category: 'chat' | 'image' | 'multimodal'): AIModel[] {
  return [...CHAT_MODELS, ...IMAGE_MODELS].filter(model => model.category === category)
}