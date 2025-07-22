#!/usr/bin/env node

/**
 * 项目优化验证脚本
 * 验证统一多模型 LLM SDK 的集成效果
 */

const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green')
    return true
  } else {
    log(`❌ ${description} - 文件不存在: ${filePath}`, 'red')
    return false
  }
}

function analyzeFileComplexity(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n').length
    const hasUnifiedImport = content.includes('from \'@/lib/llm\'')
    const hasSmartChat = content.includes('smartChat')
    const hasUnifiedChat = content.includes('unifiedChat')
    const hasComplexProviderLogic = content.includes('if (selectedModel.provider')
    
    return {
      lines,
      hasUnifiedImport,
      hasSmartChat,
      hasUnifiedChat,
      hasComplexProviderLogic,
      optimized: (hasUnifiedImport || hasSmartChat || hasUnifiedChat) && !hasComplexProviderLogic
    }
  } catch (error) {
    return { lines: 0, optimized: false, error: error.message }
  }
}

function main() {
  log('🔍 项目优化验证开始...', 'cyan')
  log('=' .repeat(50), 'cyan')
  
  // 1. 检查统一SDK文件
  log('\n📁 统一多模型 LLM SDK 文件检查:', 'yellow')
  const sdkFiles = [
    ['lib/llm/index.ts', '统一导出入口'],
    ['lib/llm/unifiedChat.ts', '核心统一调度器'],
    ['lib/llm/config.ts', '配置管理'],
    ['lib/llm/utils.ts', '工具函数'],
    ['lib/llm/providers/gemini.ts', 'Google Gemini 提供商'],
    ['lib/llm/providers/openai.ts', 'OpenAI 提供商'],
    ['lib/llm/providers/siliconFlow.ts', 'SiliconFlow 提供商'],
    ['lib/llm/providers/claude.ts', 'Claude 提供商（预留）']
  ]
  
  let sdkFilesOk = 0
  sdkFiles.forEach(([file, desc]) => {
    if (checkFile(file, desc)) sdkFilesOk++
  })
  
  // 2. 检查优化后的API文件
  log('\n🚀 优化后的 API 文件检查:', 'yellow')
  const apiFiles = [
    ['app/api/generate-plan/route.ts', '生成方案 API'],
    ['app/api/chat/route.ts', '聊天 API'],
    ['app/api/chat-stream/route.ts', '流式聊天 API'],
    ['app/api/module2-plan-stream/route.ts', '模块2计划流 API'],
    ['app/api/unified-chat/route.ts', '统一聊天 API（新增）']
  ]
  
  let apiFilesOk = 0
  apiFiles.forEach(([file, desc]) => {
    if (checkFile(file, desc)) apiFilesOk++
  })
  
  // 3. 分析API文件的优化程度
  log('\n📊 API 文件优化分析:', 'yellow')
  const analysisResults = []
  
  apiFiles.forEach(([file, desc]) => {
    if (fs.existsSync(file)) {
      const analysis = analyzeFileComplexity(file)
      analysisResults.push({ file, desc, ...analysis })
      
      const status = analysis.optimized ? '✅ 已优化' : '⚠️  待优化'
      const statusColor = analysis.optimized ? 'green' : 'yellow'
      
      log(`${status} ${desc}`, statusColor)
      log(`   📏 代码行数: ${analysis.lines}`, 'blue')
      log(`   🔧 使用统一SDK: ${analysis.hasUnifiedImport ? '是' : '否'}`, 'blue')
      log(`   🤖 智能选择: ${analysis.hasSmartChat ? '是' : '否'}`, 'blue')
      log(`   🎯 统一调用: ${analysis.hasUnifiedChat ? '是' : '否'}`, 'blue')
      log(`   🔄 复杂提供商逻辑: ${analysis.hasComplexProviderLogic ? '是（需优化）' : '否'}`, 'blue')
    }
  })
  
  // 4. 检查文档文件
  log('\n📚 文档文件检查:', 'yellow')
  const docFiles = [
    ['UNIFIED-LLM-USAGE.md', '使用指南'],
    ['UNIFIED-LLM-SUMMARY.md', '架构总结'],
    ['PROJECT-OPTIMIZATION-SUMMARY.md', '优化总结'],
    ['QUICK-START.md', '快速开始'],
    ['test-llm-sdk.js', '测试脚本']
  ]
  
  let docFilesOk = 0
  docFiles.forEach(([file, desc]) => {
    if (checkFile(file, desc)) docFilesOk++
  })
  
  // 5. 环境检查
  log('\n🔧 环境配置检查:', 'yellow')
  const envVars = [
    'SILICONFLOW_API_KEY',
    'GOOGLE_API_KEY',
    'OPENAI_API_KEY'
  ]
  
  let configuredKeys = 0
  envVars.forEach(envVar => {
    const configured = !!process.env[envVar]
    const status = configured ? '✅ 已配置' : '❌ 未配置'
    const color = configured ? 'green' : 'red'
    log(`${status} ${envVar}`, color)
    if (configured) configuredKeys++
  })
  
  // 6. 生成优化报告
  log('\n📋 优化报告:', 'cyan')
  log('=' .repeat(30), 'cyan')
  
  const totalSdkFiles = sdkFiles.length
  const totalApiFiles = apiFiles.length
  const totalDocFiles = docFiles.length
  const optimizedApis = analysisResults.filter(r => r.optimized).length
  
  log(`📁 统一SDK文件: ${sdkFilesOk}/${totalSdkFiles} (${Math.round(sdkFilesOk/totalSdkFiles*100)}%)`, 
      sdkFilesOk === totalSdkFiles ? 'green' : 'yellow')
  
  log(`🚀 API文件存在: ${apiFilesOk}/${totalApiFiles} (${Math.round(apiFilesOk/totalApiFiles*100)}%)`, 
      apiFilesOk === totalApiFiles ? 'green' : 'yellow')
  
  log(`📊 API文件优化: ${optimizedApis}/${totalApiFiles} (${Math.round(optimizedApis/totalApiFiles*100)}%)`, 
      optimizedApis === totalApiFiles ? 'green' : 'yellow')
  
  log(`📚 文档文件: ${docFilesOk}/${totalDocFiles} (${Math.round(docFilesOk/totalDocFiles*100)}%)`, 
      docFilesOk === totalDocFiles ? 'green' : 'yellow')
  
  log(`🔧 API密钥配置: ${configuredKeys}/${envVars.length} (${Math.round(configuredKeys/envVars.length*100)}%)`, 
      configuredKeys > 0 ? 'green' : 'red')
  
  // 7. 总体评估
  log('\n🎯 总体评估:', 'cyan')
  const overallScore = Math.round(
    (sdkFilesOk/totalSdkFiles * 0.3 + 
     optimizedApis/totalApiFiles * 0.4 + 
     docFilesOk/totalDocFiles * 0.2 + 
     (configuredKeys > 0 ? 1 : 0) * 0.1) * 100
  )
  
  if (overallScore >= 90) {
    log(`🎉 优秀！项目优化完成度: ${overallScore}%`, 'green')
    log('✨ 统一多模型 LLM SDK 已成功集成到项目中！', 'green')
  } else if (overallScore >= 70) {
    log(`👍 良好！项目优化完成度: ${overallScore}%`, 'yellow')
    log('🔧 还有一些优化空间，建议继续完善。', 'yellow')
  } else {
    log(`⚠️  项目优化完成度: ${overallScore}%`, 'red')
    log('🛠️  需要更多工作来完成优化。', 'red')
  }
  
  // 8. 下一步建议
  log('\n💡 下一步建议:', 'cyan')
  
  if (configuredKeys === 0) {
    log('1. 配置至少一个 API 密钥以启用 AI 功能', 'yellow')
  }
  
  if (optimizedApis < totalApiFiles) {
    log('2. 继续优化剩余的 API 文件，使用统一 SDK', 'yellow')
  }
  
  if (sdkFilesOk === totalSdkFiles && optimizedApis === totalApiFiles) {
    log('1. 运行测试脚本验证功能: node test-llm-sdk.js', 'green')
    log('2. 在实际环境中测试 API 端点', 'green')
    log('3. 监控性能和成本优化效果', 'green')
  }
  
  log('\n🚀 项目优化验证完成！', 'cyan')
}

if (require.main === module) {
  main()
}