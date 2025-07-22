/**
 * 统一多模型 LLM SDK 入口文件
 * 
 * 使用示例:
 * ```typescript
 * import { unifiedChat, smartChat } from '@/lib/llm'
 * 
 * // 指定模型调用
 * const response = await unifiedChat({
 *   model: "gemini-1.5-flash",
 *   messages: [{ role: "user", content: "Hello" }],
 *   stream: true,
 *   onData: (chunk) => console.log(chunk)
 * })
 * 
 * // 智能模型选择
 * const response = await smartChat({
 *   taskType: "long_generation",
 *   messages: [{ role: "user", content: "写一篇长文章" }]
 * })
 * ```
 */

// 核心统一接口
export { 
  unifiedChat, 
  unifiedChatStream, 
  unifiedChatBatch, 
  smartChat 
} from './unifiedChat'

// 类型定义
export type { 
  UnifiedChatOptions, 
  UnifiedChatResponse 
} from './unifiedChat'

// 各提供商的具体实现 (可选导出，用于高级用法)
export { chatGemini } from './providers/gemini'
export { chatOpenAI } from './providers/openai'
export { chatSiliconFlow } from './providers/siliconFlow'
export { chatClaude } from './providers/claude'

// 便捷工具函数
export * from './utils'