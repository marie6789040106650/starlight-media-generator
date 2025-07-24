import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FormData, TocItem } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 统一的关键词分割函数
export const parseKeywords = (text: string) => {
  if (!text) return []
  // 支持多种分隔符：、，,/空格
  return text.split(/[、，,\/\s]+/).filter(keyword => keyword.trim().length > 0)
}

// 防抖函数
export const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

// 生成一致的标题ID
export const generateHeadingId = (index: number, title: string): string => {
  return `heading-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`
}

// 解析Markdown生成目录的函数
export const parseMarkdownToc = (content: string): TocItem[] => {
  const lines = content.split('\n')
  const toc: TocItem[] = []
  let headingIndex = 0

  lines.forEach((line) => {
    // 匹配标题行 (# ## ### 等)
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      let title = match[2].trim()
      
      // 去掉标题前后的 * 号
      title = title.replace(/^\*+|\*+$/g, '').trim()
      
      const id = generateHeadingId(headingIndex, title)
      headingIndex++

      toc.push({
        id,
        title,
        level
      })
    }
  })

  return toc
}

// 生成AI提示词
export const generatePrompt = (formData: FormData, storeFeatures: string, ownerFeatures: string, confirmedStoreKeywords?: string, confirmedOwnerKeywords?: string) => {
  return `你是一名资深抖音IP打造专家，请根据下列商家信息，输出一份结构完整、语言专业、情绪有感染力的《老板IP打造方案》，以markdown格式输出。

商家信息如下：
- 店名：${formData.storeName}
- 品类：${formData.storeCategory}
- 地点：${formData.storeLocation}
- 开店时长：${formData.businessDuration}
- 店铺特色：${storeFeatures}、${confirmedStoreKeywords}
- 老板姓氏：${formData.ownerName}
- 老板个人特色：${ownerFeatures}、${confirmedOwnerKeywords}

请严格按照以下8个结构输出内容：
1. IP核心定位与形象塑造（标签 + 人设 + Slogan）
2. 品牌主张升级
3. 抖音账号基础布局（头像、名称、简介、背景图）
4. 内容板块（创业故事 / 技艺揭秘 / 公益责任 / 用户互动）
5. 直播间设计（主题 + 流程）
6. 口播金句模板（情怀类 / 专业类 / 推广类）
7. 运营增长策略（冷启动打法 + 数据优化）
8. 商业化路径（短期变现 / 长期布局）

要求：每部分不少于3段描述，语言专业、有逻辑、有亮点，金句频出。`
}