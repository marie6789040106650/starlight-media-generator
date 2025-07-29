/**
 * 水印工具包入口文件 - 统一导出
 */

// 主要从utils目录导出，因为那里有完整的实现
export {
  PDFWatermarkProcessor,
  addSimpleWatermark,
  addCompanyWatermark,
  addConfidentialWatermark,
  addDraftWatermark,
  WatermarkPresets,
  batchAddWatermark,
  addWatermarkFromUrl
} from '../utils/pdf-watermark';

export type {
  WatermarkOptions,
  WatermarkResult
} from '../utils/pdf-watermark';

// 从组件目录导出配置相关
export {
  WatermarkConfigDialog,
  configToWatermarkOptions
} from '../../components/watermark-config';

export type {
  WatermarkConfig
} from '../../components/watermark-config';