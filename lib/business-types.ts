/**
 * 老板IP打造方案生成器 - 业务数据类型定义
 * 基于模块1、2、3的MVP结构定义
 */

// ==================== 模块1：信息填写 + 关键词拓展 ====================

/**
 * 店铺基础信息
 */
export interface StoreInfo {
  /** 店铺名称 */
  storeName: string;
  /** 所属行业（餐饮、美业等） */
  storeCategory: string;
  /** 所在城市/商圈等 */
  storeLocation: string;
  /** 开店时长，如"3年" */
  businessDuration?: string;
  /** 店铺特色（支持多选+自定义） */
  storeFeatures: string[];
  /** 老板姓氏，用于IP昵称生成 */
  ownerName: string;
  /** 老板人格特色（多选+自定义） */
  ownerFeatures: string[];
}

/**
 * 关键词项目结构
 */
export interface KeywordItem {
  /** 关键词 */
  keyword: string;
  /** 关键词描述 */
  description: string;
}

/**
 * 模块1输出结构
 */
export interface Module1Output {
  /** 用户确认后的关键词列表（店铺） */
  confirmedStoreKeywords: KeywordItem[];
  /** 用户确认后的关键词列表（老板） */
  confirmedOwnerKeywords: KeywordItem[];
}

/**
 * 模块1完整数据结构
 */
export interface Module1Data extends StoreInfo, Module1Output {}

// ==================== 模块2：老板IP打造方案生成 ====================

/**
 * 内容栏目结构
 */
export interface ContentColumn {
  /** 栏目标题 */
  title: string;
  /** 栏目描述 */
  description: string;
}

/**
 * 模块2输出结构（MVP版本 - 4个板块）
 */
export interface Module2OutputMVP {
  /** IP标签体系 */
  ipTags: string[];
  /** 品牌主张 */
  brandSlogan: string;
  /** 内容板块设计 */
  contentColumns: ContentColumn[];
  /** 金句表达模板 */
  goldenSentences: string[];
}

/**
 * 模块2完整输出结构（8个板块）
 */
export interface Module2OutputFull extends Module2OutputMVP {
  /** 账号矩阵（延后开发） */
  accountMatrix?: string[];
  /** 直播设计（延后开发） */
  liveStreamDesign?: string[];
  /** 运营建议（延后开发） */
  operationAdvice?: string[];
  /** 商业化路径（延后开发） */
  commercializationPath?: string[];
}

/**
 * 模块2请求数据结构
 */
export interface Module2Request extends Module1Data {}

// ==================== 模块3：视觉Banner生成系统 ====================

/**
 * Banner设计建议结构
 */
export interface BannerDesign {
  /** 主标题建议 */
  mainTitle: string;
  /** 副标题建议 */
  subtitle?: string;
  /** 背景风格建议 */
  backgroundStyle: string;
  /** 色调建议 */
  colorTheme: string;
  /** 字体风格建议 */
  fontStyle: string;
  /** 视觉符号建议 */
  visualSymbols: string[];
}

/**
 * 模块3输入数据结构
 */
export interface Module3Request {
  /** 来自模块1的数据 */
  storeName: string;
  storeCategory: string;
  storeLocation: string;
  confirmedStoreKeywords: KeywordItem[];
  /** 来自模块2的数据 */
  brandSlogan: string;
  ipTags: string[];
  contentColumns: ContentColumn[];
}

/**
 * 模块3输出结构
 */
export interface Module3Output {
  /** Banner设计建议 */
  bannerDesign: BannerDesign;
  /** 图像生成Prompt */
  imagePrompt: string;
  /** 设计标签（用于视觉元素） */
  designTags: string[];
}

// ==================== 流式响应相关类型 ====================

/**
 * 流式响应数据块
 */
export interface StreamChunk {
  /** 内容类型 */
  type: 'content' | 'error' | 'done';
  /** 数据内容 */
  data?: any;
  /** 错误信息 */
  error?: string;
  /** 是否完成 */
  done?: boolean;
}

/**
 * 模块2流式响应状态
 */
export interface Module2StreamState {
  /** IP标签生成状态 */
  ipTags: {
    content: string[];
    isComplete: boolean;
  };
  /** 品牌主张生成状态 */
  brandSlogan: {
    content: string;
    isComplete: boolean;
  };
  /** 内容栏目生成状态 */
  contentColumns: {
    content: ContentColumn[];
    isComplete: boolean;
  };
  /** 金句生成状态 */
  goldenSentences: {
    content: string[];
    isComplete: boolean;
  };
}

// ==================== API请求响应类型 ====================

/**
 * 通用API响应结构
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 流式API响应结构
 */
export interface StreamResponse {
  /** 响应流 */
  stream: ReadableStream<Uint8Array>;
  /** 响应头 */
  headers: Record<string, string>;
}

// ==================== 业务常量 ====================

/**
 * 支持的行业类别
 */
export const STORE_CATEGORIES = [
  '餐饮',
  '美业',
  '零售',
  '服务',
  '教育',
  '健康',
  '其他'
] as const;

/**
 * Banner尺寸配置
 */
export const BANNER_SIZES = {
  /** 方案首页封面 */
  PLAN_COVER: { width: 1800, height: 800 },
  /** 社交媒体横图 */
  SOCIAL_MEDIA: { width: 1280, height: 720 }
} as const;

/**
 * 流式响应事件类型
 */
export const STREAM_EVENTS = {
  CONTENT: 'content',
  ERROR: 'error',
  DONE: 'done',
  PROGRESS: 'progress'
} as const;

// ==================== 类型守卫函数 ====================

/**
 * 检查是否为有效的店铺信息
 */
export function isValidStoreInfo(data: any): data is StoreInfo {
  return (
    typeof data === 'object' &&
    typeof data.storeName === 'string' &&
    typeof data.storeCategory === 'string' &&
    typeof data.storeLocation === 'string' &&
    typeof data.ownerName === 'string' &&
    Array.isArray(data.storeFeatures) &&
    Array.isArray(data.ownerFeatures)
  );
}

/**
 * 检查是否为有效的关键词项目
 */
export function isValidKeywordItem(data: any): data is KeywordItem {
  return (
    typeof data === 'object' &&
    typeof data.keyword === 'string' &&
    typeof data.description === 'string'
  );
}

/**
 * 检查是否为有效的流式数据块
 */
export function isValidStreamChunk(data: any): data is StreamChunk {
  return (
    typeof data === 'object' &&
    typeof data.type === 'string' &&
    ['content', 'error', 'done'].includes(data.type)
  );
}