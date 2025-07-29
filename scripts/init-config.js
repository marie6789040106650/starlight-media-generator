#!/usr/bin/env node

/**
 * 配置初始化脚本
 * 自动检测环境变量并初始化配置文件
 */

const { configManager } = require('../lib/config-manager')

console.log('🔧 初始化AI服务配置...\n')

// 检查环境变量并自动导入
const envKeys = {
  siliconflow: process.env.SILICONFLOW_API_KEY,
  google: process.env.GOOGLE_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY
}

let importedCount = 0

Object.entries(envKeys).forEach(([provider, apiKey]) => {
  if (apiKey) {
    const success = configManager.updateApiKey(provider, apiKey, '从环境变量自动导入')
    if (success) {
      console.log(`✅ ${provider} API密钥已导入`)
      importedCount++
    } else {
      console.log(`❌ ${provider} API密钥导入失败`)
    }
  } else {
    console.log(`⚠️  ${provider} 环境变量未设置`)
  }
})

console.log(`\n📊 导入结果: ${importedCount}/4 个服务已配置\n`)

// 显示配置状态
const stats = configManager.getConfigStats()
console.log('当前配置状态:')
console.log(`- 总服务数: ${stats.totalServices}`)
console.log(`- 已启用: ${stats.enabledServices}`)
console.log(`- 可用服务: ${stats.availableServices.join(', ') || '无'}`)

if (stats.availableServices.length === 0) {
  console.log('\n💡 建议:')
  console.log('1. 运行 "pnpm run config:interactive" 进行交互式配置')
  console.log('2. 或者设置环境变量后重新运行此脚本')
  console.log('3. 查看 "pnpm run config:list" 了解支持的服务')
} else {
  console.log('\n🎉 配置完成! 可以开始使用AI服务了')
}

console.log('\n📖 更多配置选项:')
console.log('- pnpm run config:status    # 查看配置状态')
console.log('- pnpm run config:update    # 更新API密钥')
console.log('- pnpm run config:interactive # 交互式配置')