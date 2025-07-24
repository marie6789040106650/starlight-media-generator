/**
 * PDF 水印添加工具
 * 独立的水印处理模块，可在多个项目中复用
 */

import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export interface WatermarkOptions {
  /** 水印文本 */
  text: string;
  /** 水印透明度 (0-1) */
  opacity?: number;
  /** 水印颜色 (RGB) */
  color?: {
    r: number;
    g: number;
    b: number;
  };
  /** 字体大小 */
  fontSize?: number;
  /** 旋转角度 (度) */
  rotation?: number;
  /** 水印位置 */
  position?: {
    x?: number | 'center' | 'left' | 'right';
    y?: number | 'center' | 'top' | 'bottom';
  };
  /** 水印重复模式 */
  repeat?: 'none' | 'diagonal' | 'grid';
  /** 重复间距 */
  spacing?: {
    x: number;
    y: number;
  };
  /** 是否只在第一页添加水印 */
  firstPageOnly?: boolean;
}

export interface WatermarkResult {
  /** 处理是否成功 */
  success: boolean;
  /** 处理后的 PDF 字节数据 */
  pdfBytes?: Uint8Array;
  /** 错误信息 */
  error?: string;
  /** 处理统计 */
  stats?: {
    totalPages: number;
    watermarkedPages: number;
    processingTime: number;
  };
}

/**
 * PDF 水印处理器类
 */
export class PDFWatermarkProcessor {
  private defaultOptions: Required<WatermarkOptions> = {
    text: '机密文档',
    opacity: 0.3,
    color: { r: 0.5, g: 0.5, b: 0.5 },
    fontSize: 48,
    rotation: 45,
    position: { x: 'center', y: 'center' },
    repeat: 'diagonal',
    spacing: { x: 200, y: 150 },
    firstPageOnly: false
  };

  /**
   * 为 PDF 添加水印
   */
  async addWatermark(
    pdfBuffer: ArrayBuffer | Uint8Array,
    options: WatermarkOptions
  ): Promise<WatermarkResult> {
    const startTime = Date.now();
    
    try {
      // 合并配置
      const config = { ...this.defaultOptions, ...options };
      
      // 加载 PDF 文档
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      // 获取字体
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // 计算要处理的页面
      const pagesToProcess = config.firstPageOnly ? [pages[0]] : pages;
      let watermarkedPages = 0;
      
      // 为每个页面添加水印
      for (const page of pagesToProcess) {
        if (page) {
          await this.addWatermarkToPage(page, font, config);
          watermarkedPages++;
        }
      }
      
      // 生成处理后的 PDF
      const pdfBytes = await pdfDoc.save();
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        pdfBytes,
        stats: {
          totalPages: pages.length,
          watermarkedPages,
          processingTime
        }
      };
      
    } catch (error) {
      console.error('PDF 水印添加失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 为单个页面添加水印
   */
  private async addWatermarkToPage(
    page: any,
    font: any,
    config: Required<WatermarkOptions>
  ): Promise<void> {
    const { width, height } = page.getSize();
    
    switch (config.repeat) {
      case 'none':
        await this.drawSingleWatermark(page, font, config, width, height);
        break;
      case 'diagonal':
        await this.drawDiagonalWatermarks(page, font, config, width, height);
        break;
      case 'grid':
        await this.drawGridWatermarks(page, font, config, width, height);
        break;
    }
  }

  /**
   * 绘制单个水印
   */
  private async drawSingleWatermark(
    page: any,
    font: any,
    config: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    const position = this.calculatePosition(
      config.position,
      pageWidth,
      pageHeight,
      config.fontSize
    );
    
    page.drawText(config.text, {
      x: position.x,
      y: position.y,
      size: config.fontSize,
      font: font,
      color: rgb(config.color.r, config.color.g, config.color.b),
      opacity: config.opacity,
      rotate: degrees(config.rotation)
    });
  }  
/**
   * 绘制对角线水印
   */
  private async drawDiagonalWatermarks(
    page: any,
    font: any,
    config: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    const { spacing } = config;
    
    // 计算对角线上的水印位置
    const diagonal = Math.sqrt(pageWidth * pageWidth + pageHeight * pageHeight);
    const angle = Math.atan2(pageHeight, pageWidth);
    
    // 沿对角线方向放置水印
    for (let i = -diagonal; i < diagonal * 2; i += spacing.x) {
      for (let j = -diagonal; j < diagonal * 2; j += spacing.y) {
        const x = i * Math.cos(angle) - j * Math.sin(angle);
        const y = i * Math.sin(angle) + j * Math.cos(angle);
        
        // 检查是否在页面范围内
        if (x >= -100 && x <= pageWidth + 100 && y >= -100 && y <= pageHeight + 100) {
          page.drawText(config.text, {
            x: x,
            y: y,
            size: config.fontSize,
            font: font,
            color: rgb(config.color.r, config.color.g, config.color.b),
            opacity: config.opacity,
            rotate: degrees(config.rotation)
          });
        }
      }
    }
  }

  /**
   * 绘制网格水印
   */
  private async drawGridWatermarks(
    page: any,
    font: any,
    config: Required<WatermarkOptions>,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    const { spacing } = config;
    
    // 计算网格起始位置
    const startX = spacing.x / 2;
    const startY = spacing.y / 2;
    
    // 绘制网格水印
    for (let x = startX; x < pageWidth; x += spacing.x) {
      for (let y = startY; y < pageHeight; y += spacing.y) {
        page.drawText(config.text, {
          x: x,
          y: y,
          size: config.fontSize,
          font: font,
          color: rgb(config.color.r, config.color.g, config.color.b),
          opacity: config.opacity,
          rotate: degrees(config.rotation)
        });
      }
    }
  }

  /**
   * 计算水印位置
   */
  private calculatePosition(
    position: { x?: number | string; y?: number | string },
    pageWidth: number,
    pageHeight: number,
    fontSize: number
  ): { x: number; y: number } {
    let x: number;
    let y: number;
    
    // 计算 X 坐标
    if (typeof position.x === 'number') {
      x = position.x;
    } else {
      switch (position.x) {
        case 'left':
          x = 50;
          break;
        case 'right':
          x = pageWidth - 200;
          break;
        case 'center':
        default:
          x = pageWidth / 2 - 100;
          break;
      }
    }
    
    // 计算 Y 坐标
    if (typeof position.y === 'number') {
      y = position.y;
    } else {
      switch (position.y) {
        case 'top':
          y = pageHeight - 50;
          break;
        case 'bottom':
          y = 50;
          break;
        case 'center':
        default:
          y = pageHeight / 2;
          break;
      }
    }
    
    return { x, y };
  }

  /**
   * 验证 PDF 文件
   */
  async validatePDF(pdfBuffer: ArrayBuffer | Uint8Array): Promise<{
    isValid: boolean;
    error?: string;
    info?: {
      pageCount: number;
      fileSize: number;
    };
  }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      return {
        isValid: true,
        info: {
          pageCount: pages.length,
          fileSize: pdfBuffer.byteLength
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '无效的 PDF 文件'
      };
    }
  }
}/**
 * 便
捷函数：添加简单文本水印
 */
export async function addSimpleWatermark(
  pdfBuffer: ArrayBuffer | Uint8Array,
  text: string,
  options?: Partial<WatermarkOptions>
): Promise<WatermarkResult> {
  const processor = new PDFWatermarkProcessor();
  return processor.addWatermark(pdfBuffer, { text, ...options });
}

/**
 * 便捷函数：添加公司水印
 */
export async function addCompanyWatermark(
  pdfBuffer: ArrayBuffer | Uint8Array,
  companyName: string,
  options?: Partial<WatermarkOptions>
): Promise<WatermarkResult> {
  const processor = new PDFWatermarkProcessor();
  return processor.addWatermark(pdfBuffer, {
    text: `© ${companyName}`,
    opacity: 0.2,
    fontSize: 36,
    rotation: 0,
    position: { x: 'right', y: 'bottom' },
    repeat: 'none',
    ...options
  });
}

/**
 * 便捷函数：添加机密文档水印
 */
export async function addConfidentialWatermark(
  pdfBuffer: ArrayBuffer | Uint8Array,
  options?: Partial<WatermarkOptions>
): Promise<WatermarkResult> {
  const processor = new PDFWatermarkProcessor();
  return processor.addWatermark(pdfBuffer, {
    text: '机密文档',
    opacity: 0.4,
    color: { r: 1, g: 0, b: 0 }, // 红色
    fontSize: 60,
    rotation: 45,
    repeat: 'diagonal',
    spacing: { x: 300, y: 200 },
    ...options
  });
}

/**
 * 便捷函数：添加草稿水印
 */
export async function addDraftWatermark(
  pdfBuffer: ArrayBuffer | Uint8Array,
  options?: Partial<WatermarkOptions>
): Promise<WatermarkResult> {
  const processor = new PDFWatermarkProcessor();
  return processor.addWatermark(pdfBuffer, {
    text: 'DRAFT',
    opacity: 0.3,
    color: { r: 0.8, g: 0.8, b: 0.8 }, // 浅灰色
    fontSize: 72,
    rotation: 45,
    position: { x: 'center', y: 'center' },
    repeat: 'none',
    ...options
  });
}

/**
 * 预设水印配置
 */
export const WatermarkPresets = {
  // 轻量水印 - 不影响阅读
  light: {
    opacity: 0.1,
    fontSize: 36,
    color: { r: 0.7, g: 0.7, b: 0.7 }
  } as Partial<WatermarkOptions>,
  
  // 标准水印 - 平衡可见性和阅读体验
  standard: {
    opacity: 0.3,
    fontSize: 48,
    color: { r: 0.5, g: 0.5, b: 0.5 }
  } as Partial<WatermarkOptions>,
  
  // 强调水印 - 明显但不过分干扰
  emphasis: {
    opacity: 0.5,
    fontSize: 60,
    color: { r: 0.3, g: 0.3, b: 0.3 }
  } as Partial<WatermarkOptions>,
  
  // 安全水印 - 用于机密文档
  security: {
    text: '机密文档',
    opacity: 0.4,
    fontSize: 54,
    color: { r: 1, g: 0, b: 0 },
    rotation: 45,
    repeat: 'diagonal'
  } as Partial<WatermarkOptions>,
  
  // 版权水印 - 用于版权保护
  copyright: {
    opacity: 0.2,
    fontSize: 32,
    rotation: 0,
    position: { x: 'right', y: 'bottom' },
    repeat: 'none'
  } as Partial<WatermarkOptions>,
  
  // 样本水印 - 用于样本文档
  sample: {
    text: 'SAMPLE',
    opacity: 0.6,
    fontSize: 80,
    color: { r: 1, g: 0, b: 0 },
    rotation: 45,
    repeat: 'diagonal',
    spacing: { x: 250, y: 180 }
  } as Partial<WatermarkOptions>
};

/**
 * 批量处理多个 PDF 文件
 */
export async function batchAddWatermark(
  pdfFiles: Array<{ buffer: ArrayBuffer | Uint8Array; filename: string }>,
  watermarkOptions: WatermarkOptions,
  onProgress?: (completed: number, total: number, currentFile: string) => void
): Promise<Array<{
  filename: string;
  result: WatermarkResult;
}>> {
  const processor = new PDFWatermarkProcessor();
  const results: Array<{ filename: string; result: WatermarkResult }> = [];
  
  for (let i = 0; i < pdfFiles.length; i++) {
    const file = pdfFiles[i];
    
    // 调用进度回调
    if (onProgress) {
      onProgress(i, pdfFiles.length, file.filename);
    }
    
    // 处理单个文件
    const result = await processor.addWatermark(file.buffer, watermarkOptions);
    results.push({
      filename: file.filename,
      result
    });
  }
  
  // 最终进度回调
  if (onProgress) {
    onProgress(pdfFiles.length, pdfFiles.length, '完成');
  }
  
  return results;
}

/**
 * 从 URL 加载 PDF 并添加水印
 */
export async function addWatermarkFromUrl(
  pdfUrl: string,
  watermarkOptions: WatermarkOptions
): Promise<WatermarkResult> {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`无法加载 PDF: ${response.statusText}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    const processor = new PDFWatermarkProcessor();
    
    return processor.addWatermark(pdfBuffer, watermarkOptions);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '加载 PDF 失败'
    };
  }
}