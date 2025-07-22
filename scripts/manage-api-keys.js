#!/usr/bin/env node

/**
 * AI服务API密钥管理工具
 * 使用方法：
 * node scripts/manage-api-keys.js --help
 */

const { configManager } = require('../lib/config-manager')
const readline = require('readline')

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 支持的服务提供商
const PROVIDERS = {
  siliconflow: {
    name: '硅基流动 (SiliconFlow)',
    description: '中文优化，成本低，推理能力强',
    website: 'https://siliconflow.cn'
  },
  google: {
    name: 'Google Gemini',
    description: '多模态支持，超长上下文，部分免费',
    website: 'https://ai.google.dev'
  },
  openai: {
    name: 'OpenAI',
    description: '业界标杆，效果最好，成本较高',
    website: 'https://platform.openai.com'
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: '安全导向，长上下文，理解能力强',
    website: 'https://console.anthropic.com'
  }
}

// 显示帮助信息
function showHelp() {
  colorLog('cyan', '\n🤖 AI服务API密钥管理工具\n')
  
  console.log('使用方法:')
  console.log('  node scripts/manage-api-keys.js [选项]\n')
  
  console.log('选项:')
  console.log('  --status, -s     显示当前配置状态')
  console.log('  --update, -u     更新API密钥')
  console.log('  --list, -l       列出所有服务')
  console.log('  --interactive    交互式配置')
  console.log('  --reset          重置所有配置')
  console.log('  --help, -h       显示帮助信息\n')
  
  console.log('示例:')
  console.log('  node scripts/manage-api-keys.js --status')
  console.log('  node scripts/manage-api-keys.js --update')
  console.log('  node scripts/manage-api-keys.js --interactive\n')
}

// 显示配置状态
function showStatus() {
  colorLog('cyan', '\n📊 AI服务配置状态\n')
  
  const stats = configManager.getConfigStats()
  const config = configManager.exportConfig()
  
  console.log(`总服务数: ${stats.totalServices}`)
  console.log(`已启用: ${stats.enabledServices}`)
  console.log(`可用服务: ${stats.availableServices.join(', ') || '无'}`)
  console.log(`最后更新: ${stats.lastUpdate}\n`)
  
  colorLog('yellow', '服务详情:')
  Object.entries(config.services).forEach(([provider, service]) => {
    const providerInfo = PROVIDERS[provider]
    const status = service.hasApiKey ? 
      (service.enabled ? colorLog('green', '✅ 可用') : colorLog('yellow', '⚠️  已禁用')) :
      colorLog('red', '❌ 无密钥')
    
    console.log(`\n${providerInfo.name}:`)
    console.log(`  状态: ${service.hasApiKey ? (service.enabled ? '✅ 可用' : '⚠️  已禁用') : '❌ 无密钥'}`)
    console.log(`  描述: ${providerInfo.description}`)
    console.log(`  最后更新: ${service.lastUpdated}`)
    if (service.notes) {
      console.log(`  备注: ${service.notes}`)
    }
  })
  
  console.log()
}

// 列出所有服务
function listServices() {
  colorLog('cyan', '\n🔧 支持的AI服务\n')
  
  Object.entries(PROVIDERS).forEach(([key, provider]) => {
    console.log(`${provider.name} (${key}):`)
    console.log(`  描述: ${provider.description}`)
    console.log(`  官网: ${provider.website}\n`)
  })
}

// 询问用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// 更新API密钥
async function updateApiKey() {
  colorLog('cyan', '\n🔑 更新API密钥\n')
  
  // 显示可用服务
  console.log('可用的服务:')
  Object.entries(PROVIDERS).forEach(([key, provider], index) => {
    console.log(`  ${index + 1}. ${provider.name} (${key})`)
  })
  
  const providerChoice = await askQuestion('\n请选择服务 (输入编号或名称): ')
  
  let selectedProvider = null
  
  // 解析用户选择
  if (/^\d+$/.test(providerChoice)) {
    const index = parseInt(providerChoice) - 1
    const providers = Object.keys(PROVIDERS)
    if (index >= 0 && index < providers.length) {
      selectedProvider = providers[index]
    }
  } else {
    selectedProvider = providerChoice.toLowerCase()
  }
  
  if (!selectedProvider || !PROVIDERS[selectedProvider]) {
    colorLog('red', '❌ 无效的服务选择')
    rl.close()
    return
  }
  
  const providerInfo = PROVIDERS[selectedProvider]
  colorLog('green', `\n选择了: ${providerInfo.name}`)
  console.log(`描述: ${providerInfo.description}`)
  console.log(`获取密钥: ${providerInfo.website}\n`)
  
  const apiKey = await askQuestion('请输入API密钥: ')
  
  if (!apiKey) {
    colorLog('red', '❌ API密钥不能为空')
    rl.close()
    return
  }
  
  const notes = await askQuestion('备注 (可选): ')
  
  // 更新配置
  const success = configManager.updateApiKey(selectedProvider, apiKey, notes || undefined)
  
  if (success) {
    colorLog('green', `✅ ${providerInfo.name} API密钥更新成功!`)
    
    // 显示更新后的状态
    const stats = configManager.getConfigStats()
    console.log(`\n当前可用服务: ${stats.availableServices.join(', ') || '无'}`)
  } else {
    colorLog('red', `❌ ${providerInfo.name} API密钥更新失败`)
  }
  
  rl.close()
}

// 交互式配置
async function interactiveConfig() {
  colorLog('cyan', '\n🎯 交互式配置向导\n')
  
  colorLog('yellow', '这个向导将帮助你配置AI服务API密钥')
  console.log('你可以跳过任何不需要的服务 (直接按回车)\n')
  
  for (const [provider, info] of Object.entries(PROVIDERS)) {
    colorLog('blue', `\n配置 ${info.name}:`)
    console.log(`描述: ${info.description}`)
    console.log(`获取密钥: ${info.website}`)
    
    // 检查当前状态
    const currentService = configManager.getService(provider)
    if (currentService && currentService.apiKey) {
      console.log(`当前状态: ${currentService.enabled ? '✅ 已配置' : '⚠️  已禁用'}`)
      
      const update = await askQuestion('是否更新密钥? (y/N): ')
      if (update.toLowerCase() !== 'y' && update.toLowerCase() !== 'yes') {
        continue
      }
    }
    
    const apiKey = await askQuestion('API密钥 (跳过请按回车): ')
    
    if (apiKey) {
      const notes = await askQuestion('备注 (可选): ')
      
      const success = configManager.updateApiKey(provider, apiKey, notes || undefined)
      if (success) {
        colorLog('green', `✅ ${info.name} 配置成功`)
      } else {
        colorLog('red', `❌ ${info.name} 配置失败`)
      }
    } else {
      colorLog('yellow', `⏭️  跳过 ${info.name}`)
    }
  }
  
  colorLog('cyan', '\n🎉 配置完成!')
  showStatus()
  rl.close()
}

// 重置配置
async function resetConfig() {
  colorLog('yellow', '\n⚠️  重置配置')
  console.log('这将删除所有已保存的API密钥和配置')
  
  const confirm = await askQuestion('确认重置? (输入 "yes" 确认): ')
  
  if (confirm.toLowerCase() === 'yes') {
    configManager.resetConfig()
    colorLog('green', '✅ 配置已重置')
  } else {
    colorLog('blue', '❌ 取消重置')
  }
  
  rl.close()
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp()
    return
  }
  
  if (args.includes('--status') || args.includes('-s')) {
    showStatus()
    return
  }
  
  if (args.includes('--list') || args.includes('-l')) {
    listServices()
    return
  }
  
  if (args.includes('--update') || args.includes('-u')) {
    await updateApiKey()
    return
  }
  
  if (args.includes('--interactive')) {
    await interactiveConfig()
    return
  }
  
  if (args.includes('--reset')) {
    await resetConfig()
    return
  }
  
  colorLog('red', '❌ 未知的选项')
  showHelp()
}

// 错误处理
process.on('uncaughtException', (error) => {
  colorLog('red', `❌ 发生错误: ${error.message}`)
  rl.close()
  process.exit(1)
})

process.on('SIGINT', () => {
  colorLog('yellow', '\n👋 再见!')
  rl.close()
  process.exit(0)
})

// 运行主函数
main().catch((error) => {
  colorLog('red', `❌ 执行失败: ${error.message}`)
  rl.close()
  process.exit(1)
})