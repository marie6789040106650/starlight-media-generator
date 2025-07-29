/**
 * PDF导出功能使用示例
 * 
 * 这个示例展示了如何在不同场景下使用PDF导出功能
 */

// 示例1: 基本PDF导出
async function basicPDFExport() {
  const { PDFGenerator } = await import('../lib/export/pdf-generator.js')
  
  const pdfGenerator = new PDFGenerator()
  
  await pdfGenerator.generatePDFDocument({
    content: `# 企业营销方案

## 1. 项目概述
这是一个完整的企业营销解决方案...

## 2. 核心策略
- 品牌定位
- 内容营销
- 社交媒体推广

## 3. 执行计划
详细的执行时间表和里程碑...`,
    storeName: '星光传媒',
    filename: '企业营销方案.pdf',
    includeWatermark: true
  })
}

// 示例2: 带Banner图的PDF导出
async function pdfWithBanner() {
  const { PDFGenerator } = await import('../lib/export/pdf-generator.js')
  
  const pdfGenerator = new PDFGenerator()
  
  await pdfGenerator.generatePDFDocument({
    content: `# 品牌升级方案

## 视觉识别系统
全新的品牌视觉设计...

## 市场定位
精准的目标客户群体分析...`,
    storeName: '创意设计工作室',
    bannerImage: 'https://example.com/brand-banner.jpg',
    filename: '品牌升级方案.pdf',
    includeWatermark: true
  })
}

// 示例3: 批量PDF生成
async function batchPDFGeneration() {
  const { PDFGenerator } = await import('../lib/export/pdf-generator.js')
  
  const documents = [
    {
      title: '电商运营方案',
      content: '# 电商运营策略\n\n详细的运营计划...',
      storeName: '电商服务商'
    },
    {
      title: '社交媒体策略',
      content: '# 社交媒体营销\n\n全平台营销策略...',
      storeName: '社媒营销公司'
    },
    {
      title: '内容创作指南',
      content: '# 内容创作流程\n\n专业的内容制作...',
      storeName: '内容创作团队'
    }
  ]
  
  const pdfGenerator = new PDFGenerator()
  
  for (const doc of documents) {
    try {
      await pdfGenerator.generatePDFDocument({
        content: doc.content,
        storeName: doc.storeName,
        filename: `${doc.title}.pdf`,
        includeWatermark: true
      })
      
      console.log(`✅ ${doc.title} 生成成功`)
      
      // 添加延迟避免服务器过载
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`❌ ${doc.title} 生成失败:`, error.message)
    }
  }
}

// 示例4: 错误处理和重试
async function robustPDFGeneration() {
  const { PDFGenerator } = await import('../lib/export/pdf-generator.js')
  
  const pdfGenerator = new PDFGenerator()
  const maxRetries = 3
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await pdfGenerator.generatePDFDocument({
        content: '# 重要文档\n\n这是一个重要的业务文档...',
        storeName: '重要客户',
        filename: '重要文档.pdf',
        includeWatermark: true
      })
      
      console.log('✅ PDF生成成功')
      break
      
    } catch (error) {
      console.warn(`⚠️  第${attempt}次尝试失败:`, error.message)
      
      if (attempt === maxRetries) {
        console.error('❌ 所有重试都失败了，请检查服务状态')
        throw error
      }
      
      // 指数退避重试
      const delay = Math.pow(2, attempt) * 1000
      console.log(`⏳ ${delay/1000}秒后重试...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 示例5: 服务状态检查
async function checkPDFServiceStatus() {
  try {
    const response = await fetch('/api/generate-pdf', { method: 'GET' })
    
    if (response.ok) {
      const status = await response.json()
      console.log('✅ PDF服务状态:', status)
      return status
    } else {
      console.log('⚠️  PDF服务不可用')
      return { status: 'unavailable' }
    }
  } catch (error) {
    console.error('❌ 无法连接PDF服务:', error.message)
    return { status: 'error', error: error.message }
  }
}

// 示例6: 条件导出（根据服务状态选择导出方式）
async function conditionalExport() {
  const serviceStatus = await checkPDFServiceStatus()
  
  if (serviceStatus.status === 'ok') {
    console.log('🚀 使用后端PDF服务')
    await basicPDFExport()
  } else {
    console.log('📄 降级到Word文档导出')
    const { WordGenerator } = await import('../lib/export/word-generator.js')
    
    const wordGenerator = new WordGenerator()
    await wordGenerator.generateWordDocument({
      content: '# 文档标题\n\n文档内容...',
      storeName: '客户名称',
      filename: '文档.docx',
      includeWatermark: true
    })
  }
}

// 导出示例函数
export {
  basicPDFExport,
  pdfWithBanner,
  batchPDFGeneration,
  robustPDFGeneration,
  checkPDFServiceStatus,
  conditionalExport
}

// 如果直接运行此文件，执行基本示例
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 运行PDF导出示例...')
  
  checkPDFServiceStatus()
    .then(status => {
      if (status.status === 'ok') {
        return basicPDFExport()
      } else {
        console.log('💡 请先启动PDF服务或安装LibreOffice')
      }
    })
    .catch(error => {
      console.error('示例运行失败:', error.message)
    })
}