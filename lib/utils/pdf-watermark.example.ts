/**
 * PDF 水印工具使用示例
 */

import {
  PDFWatermarkProcessor,
  addSimpleWatermark,
  addCompanyWatermark,
  addConfidentialWatermark,
  addDraftWatermark,
  WatermarkPresets,
  batchAddWatermark,
  addWatermarkFromUrl
} from './pdf-watermark';

/**
 * 示例 1: 基础水印添加
 */
export async function basicWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('🔖 基础水印示例');
  
  // 添加简单文本水印
  const result = await addSimpleWatermark(pdfBuffer, '星光传媒', {
    opacity: 0.3,
    fontSize: 48,
    rotation: 45
  });
  
  if (result.success) {
    console.log('✅ 水印添加成功');
    console.log(`📊 处理统计:`, result.stats);
    return result.pdfBytes;
  } else {
    console.error('❌ 水印添加失败:', result.error);
  }
}

/**
 * 示例 2: 公司水印
 */
export async function companyWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('🏢 公司水印示例');
  
  const result = await addCompanyWatermark(pdfBuffer, '星光传媒', {
    position: { x: 'right', y: 'bottom' },
    fontSize: 24,
    opacity: 0.5
  });
  
  if (result.success) {
    console.log('✅ 公司水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ 公司水印添加失败:', result.error);
  }
}

/**
 * 示例 3: 机密文档水印
 */
export async function confidentialWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('🔒 机密文档水印示例');
  
  const result = await addConfidentialWatermark(pdfBuffer, {
    repeat: 'diagonal',
    spacing: { x: 200, y: 150 }
  });
  
  if (result.success) {
    console.log('✅ 机密水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ 机密水印添加失败:', result.error);
  }
}

/**
 * 示例 4: 使用预设配置
 */
export async function presetWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('⚙️ 预设配置示例');
  
  const processor = new PDFWatermarkProcessor();
  
  // 使用安全预设
  const result = await processor.addWatermark(pdfBuffer, {
    text: '内部文档',
    ...WatermarkPresets.security
  });
  
  if (result.success) {
    console.log('✅ 预设水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ 预设水印添加失败:', result.error);
  }
}

/**
 * 示例 5: 自定义水印配置
 */
export async function customWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('🎨 自定义水印示例');
  
  const processor = new PDFWatermarkProcessor();
  
  const result = await processor.addWatermark(pdfBuffer, {
    text: '星光传媒专业定制',
    opacity: 0.25,
    color: { r: 0.2, g: 0.4, b: 0.8 }, // 蓝色
    fontSize: 42,
    rotation: 30,
    position: { x: 'center', y: 'center' },
    repeat: 'grid',
    spacing: { x: 300, y: 200 },
    firstPageOnly: false
  });
  
  if (result.success) {
    console.log('✅ 自定义水印添加成功');
    console.log(`📄 处理了 ${result.stats?.watermarkedPages} 页`);
    return result.pdfBytes;
  } else {
    console.error('❌ 自定义水印添加失败:', result.error);
  }
}

/**
 * 示例 6: 批量处理
 */
export async function batchWatermarkExample(pdfFiles: Array<{ buffer: ArrayBuffer; filename: string }>) {
  console.log('📦 批量处理示例');
  
  const results = await batchAddWatermark(
    pdfFiles,
    {
      text: '星光传媒',
      ...WatermarkPresets.standard
    },
    (completed, total, currentFile) => {
      console.log(`📊 进度: ${completed}/${total} - 正在处理: ${currentFile}`);
    }
  );
  
  console.log('✅ 批量处理完成');
  results.forEach(({ filename, result }) => {
    if (result.success) {
      console.log(`✅ ${filename}: 成功`);
    } else {
      console.log(`❌ ${filename}: ${result.error}`);
    }
  });
  
  return results;
}

/**
 * 示例 7: 从 URL 加载并添加水印
 */
export async function urlWatermarkExample(pdfUrl: string) {
  console.log('🌐 URL 水印示例');
  
  const result = await addWatermarkFromUrl(pdfUrl, {
    text: '网络文档',
    ...WatermarkPresets.light
  });
  
  if (result.success) {
    console.log('✅ URL 水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ URL 水印添加失败:', result.error);
  }
}

/**
 * 示例 8: 多种水印组合
 */
export async function multipleWatermarkExample(pdfBuffer: ArrayBuffer) {
  console.log('🔄 多重水印示例');
  
  const processor = new PDFWatermarkProcessor();
  let currentBuffer = pdfBuffer;
  
  // 第一层：背景水印
  let result = await processor.addWatermark(currentBuffer, {
    text: '星光传媒',
    opacity: 0.1,
    fontSize: 72,
    rotation: 45,
    repeat: 'diagonal',
    spacing: { x: 400, y: 300 }
  });
  
  if (!result.success) {
    console.error('❌ 背景水印失败:', result.error);
    return;
  }
  
  currentBuffer = result.pdfBytes!.buffer;
  
  // 第二层：版权水印
  result = await processor.addWatermark(currentBuffer, {
    text: '© 2025 星光传媒',
    opacity: 0.6,
    fontSize: 16,
    rotation: 0,
    position: { x: 'right', y: 'bottom' },
    repeat: 'none'
  });
  
  if (result.success) {
    console.log('✅ 多重水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ 版权水印失败:', result.error);
  }
}

/**
 * 示例 9: 条件水印（仅首页）
 */
export async function firstPageOnlyExample(pdfBuffer: ArrayBuffer) {
  console.log('📄 首页水印示例');
  
  const result = await addCompanyWatermark(pdfBuffer, '星光传媒', {
    firstPageOnly: true,
    position: { x: 'center', y: 'top' },
    fontSize: 32,
    opacity: 0.4
  });
  
  if (result.success) {
    console.log('✅ 首页水印添加成功');
    console.log(`📊 总页数: ${result.stats?.totalPages}, 水印页数: ${result.stats?.watermarkedPages}`);
    return result.pdfBytes;
  } else {
    console.error('❌ 首页水印添加失败:', result.error);
  }
}

/**
 * 示例 10: 验证和错误处理
 */
export async function validationExample(pdfBuffer: ArrayBuffer) {
  console.log('🔍 验证示例');
  
  const processor = new PDFWatermarkProcessor();
  
  // 先验证 PDF
  const validation = await processor.validatePDF(pdfBuffer);
  
  if (!validation.isValid) {
    console.error('❌ PDF 验证失败:', validation.error);
    return;
  }
  
  console.log('✅ PDF 验证通过');
  console.log(`📊 文件信息:`, validation.info);
  
  // 添加水印
  const result = await processor.addWatermark(pdfBuffer, {
    text: '已验证文档',
    ...WatermarkPresets.standard
  });
  
  if (result.success) {
    console.log('✅ 验证后水印添加成功');
    return result.pdfBytes;
  } else {
    console.error('❌ 水印添加失败:', result.error);
  }
}

// 导出所有示例
export const watermarkExamples = {
  basic: basicWatermarkExample,
  company: companyWatermarkExample,
  confidential: confidentialWatermarkExample,
  preset: presetWatermarkExample,
  custom: customWatermarkExample,
  batch: batchWatermarkExample,
  url: urlWatermarkExample,
  multiple: multipleWatermarkExample,
  firstPageOnly: firstPageOnlyExample,
  validation: validationExample
};