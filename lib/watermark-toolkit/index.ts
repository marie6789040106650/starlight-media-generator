/**
 * 水印工具包入口文件
 */

export {
  PDFWatermarkProcessor,
  addSimpleWatermark,
  addCompanyWatermark,
  addConfidentialWatermark,
  addDraftWatermark,
  WatermarkPresets,
  batchAddWatermark,
  addWatermarkFromUrl
} from './pdf-watermark';

export type {
  WatermarkOptions,
  WatermarkResult
} from './pdf-watermark';

export {
  WatermarkConfig,
  WatermarkConfigDialog,
  configToWatermarkOptions
} from './watermark-config';