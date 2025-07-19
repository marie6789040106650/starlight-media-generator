import { WordGenerator } from './word-generator'

// 企业方案Word样式模板生成示例
export async function generateEnterpriseWordTemplate() {
  const generator = new WordGenerator()
  
  // 生成严格按照Python脚本格式的Word文档
  await generator.generateWordDocument({
    content: '', // 空内容将使用默认的企业方案样式规范
    storeName: '企业方案模板',
    bannerImage: null, // 示例不使用banner图
    filename: '企业方案Word样式模板规范文档.docx',
    includeWatermark: true
  })
}

// 使用示例
export function initEnterpriseWordExport() {
  // 可以在页面中添加导出按钮
  const exportButton = document.createElement('button')
  exportButton.textContent = '导出企业方案Word模板'
  exportButton.onclick = generateEnterpriseWordTemplate
  
  // 添加到页面中（根据实际需要调整）
  document.body.appendChild(exportButton)
}

// 如果需要自定义内容的Word导出
export async function generateCustomEnterpriseWord(content: string, bannerImage?: string | null, filename?: string) {
  const generator = new WordGenerator()
  
  await generator.generateWordDocument({
    content: content,
    storeName: '企业方案',
    bannerImage: bannerImage,
    filename: filename || `企业方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`,
    includeWatermark: true
  })
}