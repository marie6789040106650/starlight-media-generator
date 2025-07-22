/**
 * 关键词管理工具类
 * 负责从配置文件加载和管理关键词库
 */

import storeKeywordsConfig from '@/config/store-keywords.json';
import ownerKeywordsConfig from '@/config/owner-keywords.json';
import { categoryManager } from './category-manager';
import { persistentStorage } from './persistent-storage';

export interface KeywordConfig {
  [category: string]: string[];
}

/**
 * 店铺关键词管理器
 */
export class StoreKeywordManager {
  private static instance: StoreKeywordManager;
  private keywordConfig: KeywordConfig;

  private constructor() {
    this.keywordConfig = storeKeywordsConfig as KeywordConfig;
  }

  public static getInstance(): StoreKeywordManager {
    if (!StoreKeywordManager.instance) {
      StoreKeywordManager.instance = new StoreKeywordManager();
    }
    return StoreKeywordManager.instance;
  }

  /**
   * 获取指定品类的关键词
   */
  public async getKeywordsByCategory(category: string): Promise<string[]> {
    // 首先尝试从静态配置获取
    if (this.keywordConfig[category]) {
      return this.keywordConfig[category];
    }
    
    // 如果是动态添加的品类，从持久化存储获取
    try {
      const updatedConfig = await persistentStorage.getStoreKeywords();
      
      if (updatedConfig[category]) {
        // 更新内存中的配置
        this.keywordConfig = { ...this.keywordConfig, ...updatedConfig };
        return updatedConfig[category];
      }
    } catch (error) {
      console.warn('Failed to reload store keywords config:', error);
    }
    
    // 如果都没有找到，返回"其他"类别的关键词
    return this.keywordConfig['其他'] || [];
  }

  /**
   * 获取所有支持的品类（包括动态添加的品类）
   */
  public getSupportedCategories(): string[] {
    // 合并静态配置和动态品类
    const staticCategories = Object.keys(this.keywordConfig);
    const allCategories = categoryManager.getAllCategories();
    return [...new Set([...staticCategories, ...allCategories])];
  }

  /**
   * 根据用户选择的特色筛选相关关键词
   */
  public async getRelevantKeywords(category: string, selectedFeatures: string[]): Promise<string[]> {
    const categoryKeywords = await this.getKeywordsByCategory(category);
    
    if (selectedFeatures.length === 0) {
      return categoryKeywords.slice(0, 20); // 返回前20个默认关键词
    }

    const relevantKeywords = new Set<string>();
    
    // 基于用户选择的特色匹配相关关键词
    selectedFeatures.forEach(feature => {
      categoryKeywords.forEach(keyword => {
        // 如果关键词包含特色词汇，或特色词汇包含关键词，则认为相关
        if (keyword.includes(feature) || feature.includes(keyword) || 
            this.isSemanticMatch(feature, keyword)) {
          relevantKeywords.add(keyword);
        }
      });
    });

    // 如果相关关键词不足，补充一些通用关键词
    if (relevantKeywords.size < 10) {
      categoryKeywords.slice(0, 15).forEach(keyword => relevantKeywords.add(keyword));
    }

    return Array.from(relevantKeywords).slice(0, 20);
  }

  /**
   * 语义匹配判断（简单实现）
   */
  private isSemanticMatch(feature: string, keyword: string): boolean {
    const semanticMap: Record<string, string[]> = {
      '手工': ['传统工艺', '制作精细', '匠心制作'],
      '新鲜': ['食材新鲜', '现做现卖', '当日采购'],
      '特色': ['招牌菜品', '独家秘方', '地方特色'],
      '环境': ['装修精美', '氛围温馨', '环境舒适'],
      '服务': ['服务周到', '态度亲切', '贴心服务']
    };

    return semanticMap[feature]?.includes(keyword) || false;
  }
}

/**
 * 老板关键词管理器
 */
export class OwnerKeywordManager {
  private static instance: OwnerKeywordManager;
  private keywordConfig: KeywordConfig;

  private constructor() {
    this.keywordConfig = ownerKeywordsConfig as KeywordConfig;
  }

  public static getInstance(): OwnerKeywordManager {
    if (!OwnerKeywordManager.instance) {
      OwnerKeywordManager.instance = new OwnerKeywordManager();
    }
    return OwnerKeywordManager.instance;
  }

  /**
   * 获取指定类型的关键词
   */
  public getKeywordsByType(type: string): string[] {
    return this.keywordConfig[type] || [];
  }

  /**
   * 获取所有关键词类型
   */
  public getSupportedTypes(): string[] {
    return Object.keys(this.keywordConfig);
  }

  /**
   * 根据用户选择的特色获取相关关键词
   */
  public getRelevantKeywords(selectedFeatures: string[]): string[] {
    if (selectedFeatures.length === 0) {
      // 如果没有选择特色，返回一些通用的关键词
      return [
        ...this.keywordConfig.personality.slice(0, 5),
        ...this.keywordConfig.professional.slice(0, 5),
        ...this.keywordConfig.business.slice(0, 5)
      ].slice(0, 15);
    }

    const relevantKeywords = new Set<string>();
    
    // 基于用户选择的特色匹配相关关键词
    selectedFeatures.forEach(feature => {
      Object.values(this.keywordConfig).forEach(keywords => {
        keywords.forEach(keyword => {
          if (keyword.includes(feature) || feature.includes(keyword) || 
              this.isSemanticMatch(feature, keyword)) {
            relevantKeywords.add(keyword);
          }
        });
      });
    });

    // 如果相关关键词不足，补充一些通用关键词
    if (relevantKeywords.size < 10) {
      this.keywordConfig.personality.slice(0, 5).forEach(k => relevantKeywords.add(k));
      this.keywordConfig.professional.slice(0, 5).forEach(k => relevantKeywords.add(k));
    }

    return Array.from(relevantKeywords).slice(0, 20);
  }

  /**
   * 获取所有关键词（用于关键词扩展面板）
   */
  public getAllKeywords(): string[] {
    const allKeywords = new Set<string>();
    Object.values(this.keywordConfig).forEach(keywords => {
      keywords.forEach(keyword => allKeywords.add(keyword));
    });
    return Array.from(allKeywords);
  }

  /**
   * 语义匹配判断
   */
  private isSemanticMatch(feature: string, keyword: string): boolean {
    const semanticMap: Record<string, string[]> = {
      '热情': ['热情好客', '亲和力强', '温和友善'],
      '专业': ['专业素养', '技术精湛', '经验丰富'],
      '年轻': ['年轻活力', '创新思维', '学习能力强'],
      '经验': ['经验丰富', '行业专家', '技能娴熟'],
      '创新': ['创新思维', '勇于挑战', '适应能力强']
    };

    return semanticMap[feature]?.includes(keyword) || false;
  }
}

/**
 * 导出单例实例
 */
export const storeKeywordManager = StoreKeywordManager.getInstance();
export const ownerKeywordManager = OwnerKeywordManager.getInstance();