/**
 * 持久化存储管理器
 * 支持本地开发和Vercel KV生产环境
 */

import { kv } from '@vercel/kv';

interface CategoryData {
  customCategories: Record<string, string[]>;
  categoryUsageCount: Record<string, number>;
  pendingCategories: Record<string, number>;
  settings: {
    autoAddThreshold: number;
    lastUpdated: string | null;
  };
}

export class PersistentStorage {
  private static instance: PersistentStorage;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' && !!process.env.KV_URL;
  }

  public static getInstance(): PersistentStorage {
    if (!PersistentStorage.instance) {
      PersistentStorage.instance = new PersistentStorage();
    }
    return PersistentStorage.instance;
  }

  /**
   * 获取品类统计数据
   */
  async getCategoryStats(): Promise<CategoryData> {
    if (this.isProduction) {
      try {
        const data = await kv.get<CategoryData>('category-stats');
        return data || this.getDefaultCategoryData();
      } catch (error) {
        console.error('Failed to get category stats from KV:', error);
        return this.getDefaultCategoryData();
      }
    } else {
      // 本地开发环境，使用文件存储
      return this.getLocalCategoryStats();
    }
  }

  /**
   * 保存品类统计数据
   */
  async saveCategoryStats(data: CategoryData): Promise<boolean> {
    data.settings.lastUpdated = new Date().toISOString();

    if (this.isProduction) {
      try {
        await kv.set('category-stats', data);
        return true;
      } catch (error) {
        console.error('Failed to save category stats to KV:', error);
        return false;
      }
    } else {
      // 本地开发环境，保存到文件
      return this.saveLocalCategoryStats(data);
    }
  }

  /**
   * 获取店铺关键词配置
   */
  async getStoreKeywords(): Promise<Record<string, string[]>> {
    if (this.isProduction) {
      try {
        const data = await kv.get<Record<string, string[]>>('store-keywords');
        if (data) {
          return data;
        }
      } catch (error) {
        console.error('Failed to get store keywords from KV:', error);
      }
    }
    
    // 回退到本地配置
    return this.getLocalStoreKeywords();
  }

  /**
   * 保存店铺关键词配置
   */
  async saveStoreKeywords(keywords: Record<string, string[]>): Promise<boolean> {
    if (this.isProduction) {
      try {
        await kv.set('store-keywords', keywords);
        // 同时更新本地文件作为备份
        this.saveLocalStoreKeywords(keywords);
        return true;
      } catch (error) {
        console.error('Failed to save store keywords to KV:', error);
        return false;
      }
    } else {
      // 本地开发环境
      return this.saveLocalStoreKeywords(keywords);
    }
  }

  /**
   * 获取默认品类数据
   */
  private getDefaultCategoryData(): CategoryData {
    return {
      customCategories: {},
      categoryUsageCount: {
        '餐饮': 0,
        '美业': 0,
        '零售': 0,
        '服务': 0,
        '教育': 0,
        '健康': 0,
        '其他': 0
      },
      pendingCategories: {},
      settings: {
        autoAddThreshold: 3,
        lastUpdated: null
      }
    };
  }

  /**
   * 本地文件操作方法
   */
  private getLocalCategoryStats(): CategoryData {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'config/category-stats.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to read local category stats, using defaults');
      return this.getDefaultCategoryData();
    }
  }

  private saveLocalCategoryStats(data: CategoryData): boolean {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'config/category-stats.json');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save local category stats:', error);
      return false;
    }
  }

  private getLocalStoreKeywords(): Record<string, string[]> {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'config/store-keywords.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to read local store keywords:', error);
      return {};
    }
  }

  private saveLocalStoreKeywords(keywords: Record<string, string[]>): boolean {
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'config/store-keywords.json');
      fs.writeFileSync(filePath, JSON.stringify(keywords, null, 2));
      return true;
    } catch (error) {
      console.error('Failed to save local store keywords:', error);
      return false;
    }
  }

  /**
   * 数据迁移：从本地文件迁移到KV
   */
  async migrateToKV(): Promise<boolean> {
    if (!this.isProduction) {
      console.log('Not in production, skipping KV migration');
      return false;
    }

    try {
      // 迁移品类统计数据
      const localStats = this.getLocalCategoryStats();
      await kv.set('category-stats', localStats);

      // 迁移店铺关键词
      const localKeywords = this.getLocalStoreKeywords();
      await kv.set('store-keywords', localKeywords);

      console.log('✅ Data migration to KV completed');
      return true;
    } catch (error) {
      console.error('❌ Data migration to KV failed:', error);
      return false;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    storage: 'local' | 'kv';
    accessible: boolean;
    error?: string;
  }> {
    if (this.isProduction) {
      try {
        await kv.get('health-check');
        return { storage: 'kv', accessible: true };
      } catch (error) {
        return { 
          storage: 'kv', 
          accessible: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      try {
        this.getLocalCategoryStats();
        return { storage: 'local', accessible: true };
      } catch (error) {
        return { 
          storage: 'local', 
          accessible: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  }
}

// 导出单例实例
export const persistentStorage = PersistentStorage.getInstance();