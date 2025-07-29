// AI模型配置
export interface AIModel {
  id: string
  name: string
  provider: 'siliconflow' | 'openai' | 'anthropic' | 'google'
  endpoint: string
  maxTokens: number
  temperature: number
  topP: number
  description: string
  category: 'chat' | 'image' | 'multimodal'
  streaming: boolean
  contextWindow: number
  pricing?: {
    input: number  // 每1K tokens价格
    output: number // 每1K tokens价格
  }
  features: string[]
  status: 'active' | 'deprecated' | 'beta'
}

// 文本对话模型配置
export const CHAT_MODELS: AIModel[] = [
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek-V3',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 16000,
    temperature: 0.7,
    topP: 0.9,
    description: '🚀 最推荐 - 最新的DeepSeek-V3模型，推理能力强',
    category: 'chat',
    streaming: true,
    contextWindow: 64000,
    pricing: { input: 0.14, output: 0.28 },
    features: ['推理能力强', '中文优化', '代码生成', '数学计算'],
    status: 'active'
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
    category: 'chat',
    streaming: true,
    contextWindow: 200000,
    pricing: { input: 0.5, output: 1.0 },
    features: ['超长上下文', '文档分析', '多轮对话', '中文优化'],
    status: 'active'
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
    category: 'chat',
    streaming: true,
    contextWindow: 200000,
    pricing: { input: 1.0, output: 2.0 },
    features: ['超长上下文', '高性能', '专业分析', '复杂推理'],
    status: 'active'
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
    category: 'chat',
    streaming: true,
    contextWindow: 32000,
    pricing: { input: 0.5, output: 1.0 },
    features: ['思维链推理', '逻辑分析', '多模态', '中文优化'],
    status: 'active'
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
    category: 'chat',
    streaming: true,
    contextWindow: 32000,
    pricing: { input: 0.2, output: 0.4 },
    features: ['推理优化', '快速响应', '中文支持', '代码理解'],
    status: 'active'
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen2.5-72B',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/chat/completions',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '🎯 通义千问 - 阿里云大模型，综合能力强',
    category: 'chat',
    streaming: true,
    contextWindow: 32000,
    pricing: { input: 0.5, output: 1.0 },
    features: ['综合能力强', '中文优化', '多领域知识', '稳定性好'],
    status: 'active'
  },
  // OpenAI 模型
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 0.9,
    description: '🌟 OpenAI GPT-4 - 业界标杆模型',
    category: 'chat',
    streaming: true,
    contextWindow: 8000,
    pricing: { input: 30, output: 60 },
    features: ['业界标杆', '多语言支持', '推理能力强', '创意写作'],
    status: 'active'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4000,
    temperature: 0.7,
    topP: 0.9,
    description: '⚡ OpenAI GPT-3.5 - 快速响应，成本较低',
    category: 'chat',
    streaming: true,
    contextWindow: 4000,
    pricing: { input: 1.5, output: 2.0 },
    features: ['快速响应', '成本较低', '多语言支持', '对话优化'],
    status: 'active'
  },
  // Google Gemini 模型
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '🧠 Google Gemini 1.5 Pro - 多模态能力强，超长上下文',
    category: 'multimodal',
    streaming: true,
    contextWindow: 2000000,
    pricing: { input: 1.25, output: 5.0 },
    features: ['超长上下文', '多模态支持', '代码生成', '数学推理', '文档分析'],
    status: 'active'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    description: '⚡ Google Gemini 1.5 Flash - 快速响应，成本更低',
    category: 'multimodal',
    streaming: true,
    contextWindow: 1000000,
    pricing: { input: 0.075, output: 0.3 },
    features: ['快速响应', '成本较低', '多模态支持', '实时处理'],
    status: 'active'
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (实验版)',
    provider: 'google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    maxTokens: 12000, // 提升输出长度，适合长内容生成
    temperature: 0.7,
    topP: 0.9,
    description: '🚀 Google Gemini 2.0 Flash - 最新实验版本，支持长内容生成',
    category: 'multimodal',
    streaming: true,
    contextWindow: 1000000,
    pricing: { input: 0.075, output: 0.3 }, // 与Flash相同的定价
    features: ['最新技术', '多模态支持', '长内容生成', '图像理解', '性能优化'],
    status: 'beta'
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
    description: '⚡ FLUX.1快速版本，生成速度快',
    category: 'image',
    streaming: false,
    contextWindow: 0,
    pricing: { input: 0.05, output: 0 },
    features: ['生成速度快', '质量良好', '多样化风格', '商用友好'],
    status: 'active'
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1-dev',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    maxTokens: 0,
    temperature: 0,
    topP: 0,
    description: '🎨 FLUX.1开发版本，质量更高',
    category: 'image',
    streaming: false,
    contextWindow: 0,
    pricing: { input: 0.1, output: 0 },
    features: ['高质量输出', '细节丰富', '艺术风格', '专业级别'],
    status: 'active'
  },
  {
    id: 'stabilityai/stable-diffusion-3-5-large',
    name: 'Stable Diffusion 3.5',
    provider: 'siliconflow',
    endpoint: 'https://api.siliconflow.cn/v1/images/generations',
    maxTokens: 0,
    temperature: 0,
    topP: 0,
    description: '🖼️ Stable Diffusion 3.5大模型',
    category: 'image',
    streaming: false,
    contextWindow: 0,
    pricing: { input: 0.08, output: 0 },
    features: ['开源模型', '可控性强', '社区支持', '多种尺寸'],
    status: 'active'
  }
]

// 默认模型配置 - 优先使用有密钥的服务
export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0] // DeepSeek-V3 (SiliconFlow)
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0] // FLUX.1-schnell (SiliconFlow)

// 备用模型配置 - 基于可用密钥的智能选择
export const FALLBACK_MODELS = {
  // 快速响应场景 - 优先使用Gemini Flash (最便宜)
  FAST_RESPONSE: CHAT_MODELS.find(m => m.id === 'gemini-1.5-flash') || DEFAULT_CHAT_MODEL,

  // 长上下文场景 - 使用Gemini Pro (200万tokens)
  LONG_CONTEXT: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') || DEFAULT_CHAT_MODEL,

  // 多模态场景 - 使用Gemini Pro
  MULTIMODAL: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') || DEFAULT_CHAT_MODEL,

  // 实验性场景 - 使用Gemini 2.0 (免费)
  EXPERIMENTAL: CHAT_MODELS.find(m => m.id === 'gemini-2.0-flash-exp') || DEFAULT_CHAT_MODEL,

  // 预算优先 - 使用免费的Gemini 2.0或最便宜的Flash
  BUDGET: CHAT_MODELS.find(m => m.id === 'gemini-2.0-flash-exp') ||
    CHAT_MODELS.find(m => m.id === 'gemini-1.5-flash') ||
    DEFAULT_CHAT_MODEL
}

// 根据ID获取模型配置
export function getModelById(modelId: string): AIModel | undefined {
  return [...CHAT_MODELS, ...IMAGE_MODELS].find(model => model.id === modelId)
}

// 获取指定类别的模型
export function getModelsByCategory(category: 'chat' | 'image' | 'multimodal'): AIModel[] {
  return [...CHAT_MODELS, ...IMAGE_MODELS].filter(model => model.category === category)
}

// 获取指定提供商的模型
export function getModelsByProvider(provider: 'siliconflow' | 'openai' | 'anthropic' | 'google'): AIModel[] {
  return [...CHAT_MODELS, ...IMAGE_MODELS].filter(model => model.provider === provider)
}

// 获取支持流式响应的模型
export function getStreamingModels(): AIModel[] {
  return [...CHAT_MODELS, ...IMAGE_MODELS].filter(model => model.streaming)
}

// 获取活跃状态的模型
export function getActiveModels(): AIModel[] {
  return [...CHAT_MODELS, ...IMAGE_MODELS].filter(model => model.status === 'active')
}

// 根据价格排序模型（从低到高）
export function getModelsByPrice(category?: 'chat' | 'image' | 'multimodal'): AIModel[] {
  let models = category ? getModelsByCategory(category) : [...CHAT_MODELS, ...IMAGE_MODELS];
  return models.sort((a, b) => {
    const priceA = a.pricing ? a.pricing.input + a.pricing.output : 0;
    const priceB = b.pricing ? b.pricing.input + b.pricing.output : 0;
    return priceA - priceB;
  });
}

// 根据上下文窗口大小排序模型（从大到小）
export function getModelsByContextWindow(): AIModel[] {
  return [...CHAT_MODELS].sort((a, b) => b.contextWindow - a.contextWindow);
}

// 获取推荐的模型配置 - 基于你的可用密钥优化
export function getRecommendedModels(): {
  chat: AIModel;
  image: AIModel;
  budget: AIModel;
  performance: AIModel;
  multimodal: AIModel;
  longContext: AIModel;
  longGeneration: AIModel; // 新增：长内容生成专用
} {
  return {
    chat: DEFAULT_CHAT_MODEL, // DeepSeek-V3 (SiliconFlow) - 日常对话
    image: DEFAULT_IMAGE_MODEL, // FLUX.1-schnell (SiliconFlow) - 图片生成
    budget: CHAT_MODELS.find(m => m.id === 'gemini-2.0-flash-exp') ||
      CHAT_MODELS.find(m => m.id === 'gemini-1.5-flash') ||
      DEFAULT_CHAT_MODEL, // 免费Gemini 2.0 > Gemini Flash > DeepSeek
    performance: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') ||
      CHAT_MODELS.find(m => m.id === 'Pro/moonshotai/Kimi-K2-Instruct') ||
      DEFAULT_CHAT_MODEL, // Gemini Pro > Kimi Pro > DeepSeek
    multimodal: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') || DEFAULT_CHAT_MODEL, // Gemini Pro最佳
    longContext: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') || DEFAULT_CHAT_MODEL, // Gemini Pro (200万tokens)
    longGeneration: CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') ||
      CHAT_MODELS.find(m => m.id === 'moonshotai/Kimi-K2-Instruct') ||
      DEFAULT_CHAT_MODEL // 长内容生成：Gemini Pro > Kimi > DeepSeek
  };
}

// 验证模型配置
export function validateModelConfig(modelId: string, provider: string): boolean {
  const model = getModelById(modelId);
  return model !== undefined && model.provider === provider && model.status === 'active';
}

// 获取模型的API密钥环境变量名
export function getModelApiKeyEnvName(provider: string): string {
  switch (provider) {
    case 'siliconflow':
      return 'SILICONFLOW_API_KEY';
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'anthropic':
      return 'ANTHROPIC_API_KEY';
    case 'google':
      return 'GOOGLE_API_KEY';
    default:
      return 'API_KEY';
  }
}

// 获取API密钥（优先从配置管理器）
export function getApiKey(provider: string): string | null {
  // 在客户端环境下，直接返回 null，API 密钥只在服务端使用
  if (typeof window !== 'undefined') {
    return null;
  }
  
  // 服务端环境下，尝试从配置管理器获取
  try {
    // 动态导入配置管理器以避免循环依赖
    // 使用 eval 来避免 webpack 静态分析
    const configManager = eval('require')('@/lib/config-manager');
    return configManager.getApiKey(provider);
  } catch (error) {
    // 降级到环境变量
    const envName = getModelApiKeyEnvName(provider);
    return process.env[envName] || null;
  }
}

// 估算token成本
export function estimateTokenCost(model: AIModel, inputTokens: number, outputTokens: number): number {
  if (!model.pricing) return 0;
  return (inputTokens / 1000) * model.pricing.input + (outputTokens / 1000) * model.pricing.output;
}

// 模型能力检查
export function hasFeature(model: AIModel, feature: string): boolean {
  return model.features.includes(feature);
}

// 智能模型选择 - 基于任务类型和可用密钥
export function selectOptimalModel(taskType: 'fast' | 'long_context' | 'multimodal' | 'budget' | 'experimental' | 'long_generation' | 'default'): AIModel {
  // 检查可用的API密钥（优先从配置管理器）
  const availableKeys = {
    siliconflow: !!getApiKey('siliconflow'),
    google: !!getApiKey('google'),
    openai: !!getApiKey('openai'),
    anthropic: !!getApiKey('anthropic')
  };

  switch (taskType) {
    case 'fast':
      // 快速响应：优先Gemini Flash，备选DeepSeek
      if (availableKeys.google) {
        return FALLBACK_MODELS.FAST_RESPONSE;
      }
      return availableKeys.siliconflow ? DEFAULT_CHAT_MODEL : CHAT_MODELS.find(m => m.provider === 'openai') || DEFAULT_CHAT_MODEL;

    case 'long_context':
      // 长上下文：优先Gemini Pro，备选Kimi
      if (availableKeys.google) {
        return FALLBACK_MODELS.LONG_CONTEXT;
      }
      return availableKeys.siliconflow ?
        CHAT_MODELS.find(m => m.id === 'moonshotai/Kimi-K2-Instruct') || DEFAULT_CHAT_MODEL :
        DEFAULT_CHAT_MODEL;

    case 'multimodal':
      // 多模态：优先Gemini Pro
      if (availableKeys.google) {
        return FALLBACK_MODELS.MULTIMODAL;
      }
      return DEFAULT_CHAT_MODEL;

    case 'budget':
      // 预算优先：免费Gemini 2.0 > Gemini Flash > DeepSeek
      if (availableKeys.google) {
        return FALLBACK_MODELS.BUDGET;
      }
      return availableKeys.siliconflow ?
        CHAT_MODELS.find(m => m.id === 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B') || DEFAULT_CHAT_MODEL :
        DEFAULT_CHAT_MODEL;

    case 'experimental':
      // 实验性：优先免费的Gemini 2.0
      if (availableKeys.google) {
        return FALLBACK_MODELS.EXPERIMENTAL;
      }
      return DEFAULT_CHAT_MODEL;

    case 'long_generation':
      // 长内容生成：优先免费的Gemini 2.0，备选Gemini Pro，再备选Kimi
      if (availableKeys.google) {
        // 首选：免费的Gemini 2.0 (12K tokens输出，完全免费!)
        const gemini2 = CHAT_MODELS.find(m => m.id === 'gemini-2.0-flash-exp');
        if (gemini2) return gemini2;

        // 备选：稳定的Gemini Pro
        return CHAT_MODELS.find(m => m.id === 'gemini-1.5-pro') || DEFAULT_CHAT_MODEL;
      }
      return availableKeys.siliconflow ?
        CHAT_MODELS.find(m => m.id === 'moonshotai/Kimi-K2-Instruct') || DEFAULT_CHAT_MODEL :
        DEFAULT_CHAT_MODEL;

    default:
      // 默认：使用主力模型
      return availableKeys.siliconflow ? DEFAULT_CHAT_MODEL :
        availableKeys.google ? FALLBACK_MODELS.FAST_RESPONSE :
          DEFAULT_CHAT_MODEL;
  }
}

// 检查API密钥是否有效（不是占位符）
function isValidApiKey(key: string | null): boolean {
  if (!key) return false;
  
  // 检查是否是占位符
  const placeholders = [
    'your_openai_key_here',
    'your_anthropic_key_here',
    'your_google_key_here',
    'your_siliconflow_key_here',
    'sk-placeholder',
    'placeholder'
  ];
  
  return !placeholders.includes(key.toLowerCase()) && key.length > 10;
}

// 稳定的模型优先级配置 - 基于你的实际API密钥
export function getStableModelPriority(): AIModel[] {
  // 你的可用API密钥：SiliconFlow + Google
  const stablePriorityList = [
    // 第1优先级：免费且稳定的模型
    'gemini-2.0-flash-exp',           // Google Gemini 2.0 - 完全免费，12K输出
    
    // 第2优先级：性价比最高的付费模型  
    'deepseek-ai/DeepSeek-V3',        // SiliconFlow DeepSeek-V3 - 便宜且强大
    'gemini-1.5-flash',               // Google Gemini Flash - 快速便宜
    
    // 第3优先级：高性能模型
    'gemini-1.5-pro',                 // Google Gemini Pro - 最强多模态
    'moonshotai/Kimi-K2-Instruct',    // SiliconFlow Kimi - 长上下文
    
    // 第4优先级：其他可用模型
    'Qwen/Qwen2.5-72B-Instruct',     // SiliconFlow Qwen
    'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B' // SiliconFlow DeepSeek-R1
  ];

  return stablePriorityList
    .map(id => CHAT_MODELS.find(m => m.id === id))
    .filter((model): model is AIModel => model !== undefined);
}

// 获取当前可用的模型列表（稳定版本）
export function getAvailableModels(): AIModel[] {
  // 直接返回稳定的优先级列表，避免实时检查的不稳定性
  return getStableModelPriority();
}

// 获取可用的聊天模型（稳定版本）
export function getAvailableChatModels(): AIModel[] {
  return getStableModelPriority(); // 直接返回稳定的优先级列表
}

// 获取默认推荐模型（按优先级）
export function getDefaultRecommendedModel(): AIModel {
  const stableModels = getStableModelPriority();
  return stableModels[0] || DEFAULT_CHAT_MODEL; // 返回第一优先级模型
}

// 获取按场景分类的推荐模型
export function getScenarioModels(): {
  free: AIModel;           // 免费使用
  fast: AIModel;           // 快速响应  
  quality: AIModel;        // 高质量输出
  longContext: AIModel;    // 长上下文
  multimodal: AIModel;     // 多模态
  budget: AIModel;         // 预算优先
} {
  const models = getStableModelPriority();
  
  return {
    free: models.find(m => m.id === 'gemini-2.0-flash-exp') || models[0],
    fast: models.find(m => m.id === 'gemini-1.5-flash') || models[1], 
    quality: models.find(m => m.id === 'deepseek-ai/DeepSeek-V3') || models[1],
    longContext: models.find(m => m.id === 'gemini-1.5-pro') || models[3],
    multimodal: models.find(m => m.id === 'gemini-1.5-pro') || models[3],
    budget: models.find(m => m.id === 'gemini-2.0-flash-exp') || models[0]
  };
}

// 获取模型统计信息
export function getModelStats(): {
  total: number;
  byCategory: Record<string, number>;
  byProvider: Record<string, number>;
  byStatus: Record<string, number>;
} {
  const allModels = [...CHAT_MODELS, ...IMAGE_MODELS];

  return {
    total: allModels.length,
    byCategory: {
      chat: CHAT_MODELS.length,
      image: IMAGE_MODELS.length,
      multimodal: allModels.filter(m => m.category === 'multimodal').length
    },
    byProvider: {
      siliconflow: allModels.filter(m => m.provider === 'siliconflow').length,
      openai: allModels.filter(m => m.provider === 'openai').length,
      anthropic: allModels.filter(m => m.provider === 'anthropic').length,
      google: allModels.filter(m => m.provider === 'google').length
    },
    byStatus: {
      active: allModels.filter(m => m.status === 'active').length,
      deprecated: allModels.filter(m => m.status === 'deprecated').length,
      beta: allModels.filter(m => m.status === 'beta').length
    }
  };
}