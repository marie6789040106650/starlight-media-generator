/**
 * 高级水印保护功能
 * 提供更强的内容防盗用保护
 */

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { WatermarkOptions, WatermarkResult } from './pdf-watermark';

export interface AdvancedProtectionOptions {
  /** 用户信息水印 */
  userInfo?: {
    name: string;
    email: string;
    timestamp: Date;
    ipAddress?: string;
  };
  /** 隐形水印 */
  invisibleWatermark?: {
    enabled: boolean;
    data: string; // 编码的用户信息
  };
  /** 多层水印 */
  multiLayerWatermark?: {
    enabled: boolean;
    layers: Array<{
      text: string;
      opacity: number;
      fontSize: number;
      rotation: number;
    }>;
  };
  /** 防截图水印 */
  antiScreenshotWatermark?: {
    enabled: boolean;
    density: 'low' | 'medium' | 'high';
  };
}

/**
 * 高级水印保护处理器
 */
export class AdvancedWatermarkProtector {
  /**
   * 添加用户追踪水印
   */
  async addUserTrackingWatermark(
    pdfBuffer: ArrayBuffer | Uint8Array,
    userInfo: AdvancedProtectionOptions['userInfo'],
    baseOptions?: WatermarkOptions
  ): Promise<WatermarkResult> {
    if (!userInfo) {
      throw new Error('用户信息不能为空');
    }

    const trackingText = this.generateTrackingText(userInfo);
    
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // 在每页添加用户追踪信息
      for (const page of pages) {
        await this.addTrackingInfoToPage(page, font, trackingText, userInfo);
      }

      const pdfBytes = await pdfDoc.save();
      
      return {
        success: true,
        pdfBytes,
        stats: {
          totalPages: pages.length,
          watermarkedPages: pages.length,
          processingTime: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加追踪水印失败'
      };
    }
  }

  /**
   * 生成追踪文本
   */
  private generateTrackingText(userInfo: AdvancedProtectionOptions['userInfo']): string {
    if (!userInfo) return '';
    
    const timestamp = userInfo.timestamp.toISOString().split('T')[0];
    return `${userInfo.name} | ${userInfo.email} | ${timestamp}`;
  }  
/**
   * 在页面添加追踪信息
   */
  private async addTrackingInfoToPage(
    page: any,
    font: any,
    trackingText: string,
    userInfo: AdvancedProtectionOptions['userInfo']
  ): Promise<void> {
    const { width, height } = page.getSize();
    
    // 1. 页脚追踪信息（小字体，低透明度）
    page.drawText(trackingText, {
      x: 20,
      y: 15,
      size: 8,
      font: font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3
    });

    // 2. 页面中心隐蔽水印
    if (userInfo) {
      const hiddenText = `ID:${this.generateUserId(userInfo)}`;
      page.drawText(hiddenText, {
        x: width - 100,
        y: height - 20,
        size: 6,
        font: font,
        color: rgb(0.95, 0.95, 0.95),
        opacity: 0.1
      });
    }

    // 3. 时间戳水印
    const timestamp = userInfo?.timestamp.getTime().toString() || '';
    if (timestamp) {
      page.drawText(timestamp, {
        x: width / 2,
        y: 10,
        size: 4,
        font: font,
        color: rgb(0.9, 0.9, 0.9),
        opacity: 0.05
      });
    }
  }

  /**
   * 生成用户ID
   */
  private generateUserId(userInfo: AdvancedProtectionOptions['userInfo']): string {
    if (!userInfo) return '';
    
    const data = `${userInfo.name}${userInfo.email}${userInfo.timestamp.getTime()}`;
    return this.simpleHash(data).substring(0, 8);
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 添加多层防护水印
   */
  async addMultiLayerProtection(
    pdfBuffer: ArrayBuffer | Uint8Array,
    protectionOptions: AdvancedProtectionOptions
  ): Promise<WatermarkResult> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const page of pages) {
        // 第一层：公司水印
        await this.addCompanyLayer(page, font);
        
        // 第二层：用户信息
        if (protectionOptions.userInfo) {
          await this.addUserLayer(page, font, protectionOptions.userInfo);
        }
        
        // 第三层：防截图密集水印
        if (protectionOptions.antiScreenshotWatermark?.enabled) {
          await this.addAntiScreenshotLayer(
            page, 
            font, 
            protectionOptions.antiScreenshotWatermark.density
          );
        }
      }

      const pdfBytes = await pdfDoc.save();
      
      return {
        success: true,
        pdfBytes,
        stats: {
          totalPages: pages.length,
          watermarkedPages: pages.length,
          processingTime: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '多层保护添加失败'
      };
    }
  }  /**

   * 添加公司水印层
   */
  private async addCompanyLayer(page: any, font: any): Promise<void> {
    const { width, height } = page.getSize();
    
    page.drawText('© 星光传媒', {
      x: width - 120,
      y: height - 30,
      size: 24,
      font: font,
      color: rgb(0.3, 0.3, 0.3),
      opacity: 0.2,
      rotate: degrees(0)
    });
  }

  /**
   * 添加用户信息层
   */
  private async addUserLayer(
    page: any, 
    font: any, 
    userInfo: AdvancedProtectionOptions['userInfo']
  ): Promise<void> {
    if (!userInfo) return;
    
    const { width, height } = page.getSize();
    const userText = `${userInfo.name} - ${userInfo.email}`;
    
    // 对角线用户信息
    for (let i = 0; i < 3; i++) {
      page.drawText(userText, {
        x: 100 + i * 200,
        y: height - 100 - i * 150,
        size: 16,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.15,
        rotate: degrees(45)
      });
    }
  }

  /**
   * 添加防截图密集水印层
   */
  private async addAntiScreenshotLayer(
    page: any, 
    font: any, 
    density: 'low' | 'medium' | 'high'
  ): Promise<void> {
    const { width, height } = page.getSize();
    
    const densityConfig = {
      low: { spacing: 150, opacity: 0.05, fontSize: 12 },
      medium: { spacing: 100, opacity: 0.08, fontSize: 10 },
      high: { spacing: 60, opacity: 0.12, fontSize: 8 }
    };
    
    const config = densityConfig[density];
    const watermarkText = '星光传媒';
    
    // 密集网格水印
    for (let x = 0; x < width; x += config.spacing) {
      for (let y = 0; y < height; y += config.spacing) {
        page.drawText(watermarkText, {
          x: x,
          y: y,
          size: config.fontSize,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: config.opacity,
          rotate: degrees(30)
        });
      }
    }
  }

  /**
   * 生成下载记录
   */
  generateDownloadRecord(
    userInfo: AdvancedProtectionOptions['userInfo'],
    documentInfo: {
      title: string;
      type: string;
      size: number;
    }
  ): {
    recordId: string;
    timestamp: string;
    userFingerprint: string;
    documentHash: string;
  } {
    const recordId = this.generateUserId(userInfo) + '-' + Date.now();
    const timestamp = new Date().toISOString();
    const userFingerprint = userInfo ? this.simpleHash(
      `${userInfo.name}${userInfo.email}${userInfo.ipAddress || ''}`
    ) : '';
    const documentHash = this.simpleHash(
      `${documentInfo.title}${documentInfo.type}${documentInfo.size}`
    );

    return {
      recordId,
      timestamp,
      userFingerprint,
      documentHash
    };
  }
}

/**
 * 便捷函数：添加完整的内容保护
 */
export async function addContentProtection(
  pdfBuffer: ArrayBuffer | Uint8Array,
  userInfo: {
    name: string;
    email: string;
    timestamp?: Date;
    ipAddress?: string;
  },
  options?: {
    companyName?: string;
    protectionLevel?: 'basic' | 'standard' | 'maximum';
    includeTracking?: boolean;
  }
): Promise<WatermarkResult> {
  const protector = new AdvancedWatermarkProtector();
  const protectionLevel = options?.protectionLevel || 'standard';
  
  const protectionOptions: AdvancedProtectionOptions = {
    userInfo: {
      ...userInfo,
      timestamp: userInfo.timestamp || new Date()
    },
    antiScreenshotWatermark: {
      enabled: protectionLevel !== 'basic',
      density: protectionLevel === 'maximum' ? 'high' : 'medium'
    }
  };

  if (options?.includeTracking) {
    return protector.addUserTrackingWatermark(pdfBuffer, protectionOptions.userInfo);
  } else {
    return protector.addMultiLayerProtection(pdfBuffer, protectionOptions);
  }
}

/**
 * 预设保护级别
 */
export const ProtectionPresets = {
  // 基础保护 - 仅公司水印
  basic: {
    protectionLevel: 'basic' as const,
    includeTracking: false,
    description: '基础版权保护，适用于一般文档'
  },
  
  // 标准保护 - 公司水印 + 用户信息
  standard: {
    protectionLevel: 'standard' as const,
    includeTracking: true,
    description: '标准保护，包含用户追踪信息'
  },
  
  // 最大保护 - 多层水印 + 密集防截图
  maximum: {
    protectionLevel: 'maximum' as const,
    includeTracking: true,
    description: '最高级别保护，适用于机密文档'
  }
};