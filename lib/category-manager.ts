/**
 * 品类管理工具类
 * 负责动态品类的统计、验证和自动添加
 */

import fs from 'fs';
import path from 'path';
import { persistentStorage } from './persistent-storage';

interface CategoryStats {
  customCategories: Record<string, string[]>; // 自定义品类及其关键词
  categoryUsageCount: Record<string, number>; // 品类使用次数统计
  pendingCategories: Record<string, number>; // 待添加品类及其出现次数
  settings: {
    autoAddThreshold: number; // 自动添加阈值
    lastUpdated: string | null;
  };
}

export class CategoryManager {
  private static instance: CategoryManager;
  private statsFilePath: string;
  private storeKeywordsPath: string;
  private stats: CategoryStats;

  private constructor() {
    this.statsFilePath = path.join(process.cwd(), 'config/category-stats.json');
    this.storeKeywordsPath = path.join(process.cwd(), 'config/store-keywords.json');
    this.initializeStats();
  }

  /**
   * 异步初始化统计数据
   */
  private async initializeStats(): Promise<void> {
    await this.loadStats();
  }

  public static getInstance(): CategoryManager {
    if (!CategoryManager.instance) {
      CategoryManager.instance = new CategoryManager();
    }
    return CategoryManager.instance;
  }

  /**
   * 加载统计数据
   */
  private async loadStats(): Promise<void> {
    this.stats = await persistentStorage.getCategoryStats();
  }

  /**
   * 保存统计数据
   */
  private async saveStats(): Promise<void> {
    await persistentStorage.saveCategoryStats(this.stats);
  }

  /**
   * 获取所有支持的品类（包括默认和自定义）
   */
  public getAllCategories(): string[] {
    const defaultCategories = ['餐饮', '美业', '零售', '服务', '教育', '健康', '其他'];
    const customCategories = Object.keys(this.stats.customCategories);
    return [...defaultCategories, ...customCategories];
  }

  /**
   * 检查品类是否存在
   */
  public isCategoryExists(category: string): boolean {
    const allCategories = this.getAllCategories();
    return allCategories.includes(category);
  }

  /**
   * 记录品类使用
   */
  public async recordCategoryUsage(category: string): Promise<{
    shouldAdd: boolean;
    isNew: boolean;
    message?: string;
  }> {
    // 确保数据已加载
    await this.initializeStats();
    const trimmedCategory = category.trim();
    
    if (!trimmedCategory) {
      return { shouldAdd: false, isNew: false };
    }

    // 如果是已存在的品类，增加使用计数
    if (this.isCategoryExists(trimmedCategory)) {
      if (this.stats.categoryUsageCount[trimmedCategory] !== undefined) {
        this.stats.categoryUsageCount[trimmedCategory]++;
      } else {
        this.stats.categoryUsageCount[trimmedCategory] = 1;
      }
      await this.saveStats();
      return { shouldAdd: false, isNew: false };
    }

    // 如果是新品类，记录到待添加列表
    if (!this.stats.pendingCategories[trimmedCategory]) {
      this.stats.pendingCategories[trimmedCategory] = 0;
    }
    
    this.stats.pendingCategories[trimmedCategory]++;
    const count = this.stats.pendingCategories[trimmedCategory];

    // 检查是否达到自动添加阈值
    if (count >= this.stats.settings.autoAddThreshold) {
      await this.addNewCategory(trimmedCategory);
      delete this.stats.pendingCategories[trimmedCategory];
      await this.saveStats();
      
      return {
        shouldAdd: true,
        isNew: true,
        message: `新品类"${trimmedCategory}"已自动添加（出现${count}次）`
      };
    }

    await this.saveStats();
    return {
      shouldAdd: false,
      isNew: true,
      message: `新品类"${trimmedCategory}"已记录（${count}/${this.stats.settings.autoAddThreshold}次）`
    };
  }

  /**
   * 添加新品类
   */
  private async addNewCategory(category: string): Promise<void> {
    // 为新品类生成默认关键词
    const defaultKeywords = this.generateDefaultKeywords(category);
    
    // 添加到自定义品类
    this.stats.customCategories[category] = defaultKeywords;
    this.stats.categoryUsageCount[category] = this.stats.pendingCategories[category] || 0;

    // 更新store-keywords.json文件
    await this.updateStoreKeywordsFile(category, defaultKeywords);

    console.log(`✅ 新品类"${category}"已添加，包含${defaultKeywords.length}个默认关键词`);
  }

  /**
   * 为新品类生成默认关键词
   */
  private generateDefaultKeywords(category: string): string[] {
    // 基础通用关键词
    const baseKeywords = [
      '专业服务', '品质保证', '价格合理', '服务周到', '经验丰富', '诚信经营',
      '客户至上', '创新思维', '持续改进', '团队协作', '专业素养', '用心服务'
    ];

    // 根据品类名称生成相关关键词
    const categorySpecificKeywords = this.generateCategorySpecificKeywords(category);

    // 合并并去重
    const allKeywords = [...new Set([...categorySpecificKeywords, ...baseKeywords])];
    
    return allKeywords.slice(0, 30); // 限制为30个关键词
  }

  /**
   * 根据品类名称生成特定关键词
   */
  private generateCategorySpecificKeywords(category: string): string[] {
    const keywords: string[] = [];
    
    // 基于品类名称的关键词映射
    const keywordMappings: Record<string, string[]> = {
      '科技': ['技术领先', '创新研发', '智能化', '数字化转型', '高科技产品', '前沿技术'],
      '金融': ['专业理财', '风险控制', '投资顾问', '金融服务', '资产管理', '财富增值'],
      '房产': ['地段优越', '品质楼盘', '投资价值', '居住舒适', '配套完善', '升值潜力'],
      '汽车': ['品质可靠', '性能优越', '售后保障', '驾驶体验', '安全配置', '节能环保'],
      '旅游': ['景色优美', '服务贴心', '行程丰富', '性价比高', '安全保障', '文化体验'],
      '娱乐': ['内容丰富', '体验精彩', '设施先进', '服务优质', '环境舒适', '价格实惠'],
      '体育': ['专业指导', '设施完善', '安全保障', '效果显著', '氛围良好', '价格合理'],
      '宠物': ['专业护理', '健康保障', '服务贴心', '设施完善', '价格透明', '爱心服务']
    };

    // 检查品类名称是否包含映射中的关键字
    Object.entries(keywordMappings).forEach(([key, values]) => {
      if (category.includes(key) || key.includes(category)) {
        keywords.push(...values);
      }
    });

    // 如果没有匹配的特定关键词，生成通用关键词
    if (keywords.length === 0) {
      keywords.push(
        `${category}专业`, `${category}品质`, `${category}服务`, `${category}体验`,
        `优质${category}`, `专业${category}`, `${category}专家`, `${category}领先`,
        `${category}创新`, `${category}标准`, `${category}保障`, `${category}优势`
      );
    }

    return keywords;
  }

  /**
   * 更新store-keywords.json文件
   */
  private async updateStoreKeywordsFile(category: string, keywords: string[]): Promise<void> {
    try {
      // 获取当前的关键词配置
      const storeKeywords = await persistentStorage.getStoreKeywords();
      
      // 添加新品类关键词
      storeKeywords[category] = keywords;
      
      // 保存到持久化存储
      await persistentStorage.saveStoreKeywords(storeKeywords);
      console.log(`✅ store-keywords已更新，添加品类"${category}"`);
    } catch (error) {
      console.error('Failed to update store-keywords:', error);
    }
  }

  /**
   * 获取品类统计信息
   */
  public getCategoryStats(): {
    totalCategories: number;
    defaultCategories: number;
    customCategories: number;
    pendingCategories: Record<string, number>;
    mostUsedCategory: string | null;
  } {
    const allCategories = this.getAllCategories();
    const defaultCategories = ['餐饮', '美业', '零售', '服务', '教育', '健康', '其他'];
    
    // 找出使用最多的品类
    let mostUsedCategory: string | null = null;
    let maxUsage = 0;
    
    Object.entries(this.stats.categoryUsageCount).forEach(([category, count]) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedCategory = category;
      }
    });

    return {
      totalCategories: allCategories.length,
      defaultCategories: defaultCategories.length,
      customCategories: Object.keys(this.stats.customCategories).length,
      pendingCategories: { ...this.stats.pendingCategories },
      mostUsedCategory
    };
  }

  /**
   * 手动添加品类
   */
  public manuallyAddCategory(category: string, keywords?: string[]): boolean {
    const trimmedCategory = category.trim();
    
    if (!trimmedCategory || this.isCategoryExists(trimmedCategory)) {
      return false;
    }

    const categoryKeywords = keywords || this.generateDefaultKeywords(trimmedCategory);
    this.addNewCategory(trimmedCategory);
    
    return true;
  }

  /**
   * 删除自定义品类
   */
  public removeCustomCategory(category: string): boolean {
    if (!this.stats.customCategories[category]) {
      return false;
    }

    delete this.stats.customCategories[category];
    delete this.stats.categoryUsageCount[category];
    
    // 从store-keywords.json中移除
    try {
      const data = fs.readFileSync(this.storeKeywordsPath, 'utf-8');
      const storeKeywords = JSON.parse(data);
      delete storeKeywords[category];
      fs.writeFileSync(this.storeKeywordsPath, JSON.stringify(storeKeywords, null, 2));
    } catch (error) {
      console.error('Failed to update store-keywords.json:', error);
    }

    this.saveStats();
    return true;
  }
}

// 导出单例实例
export const categoryManager = CategoryManager.getInstance();