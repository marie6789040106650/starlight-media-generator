#!/usr/bin/env node

/**
 * 系统完整性检查脚本
 * 验证AI服务集成系统的所有组件
 */

const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  log(exists ? 'green' : 'red', `   ${exists ? '✅' : '❌'} ${description}: ${filePath}`)
  return exists
}

async function systemCheck() {
  log('cyan', '\n🔍 AI服务集成系统完整性检查\n')
  
  let totalChecks = 0
  let passedChecks = 0
  
  // 1. 核心库文件检查
  log('blue', '1. 核心库文件检查')
  const coreFiles = [
    ['lib/config-manager.ts', '配置管理器'],
    ['lib/models.ts', '模型配置'],
    ['lib/long-content-config.ts', '长内容配置'],
    ['lib/business-utils.ts', '业务工具'],
    ['lib/keyword-manager.ts', '关键词管理器']
  ]
  
  coreFiles.forEach(([file, desc]) => {
    totalChecks++
    if (checkFileExists(file, desc)) passedChecks++
  })
  
  // 2. API端点检查
  log('blue', '\n2. API端点检查')
  const apiFiles = [
    ['app/api/config/ai-services/route.ts', '配置管理API'],
    ['app/api/metrics/long-content/route.ts', '长内容监控API'],
    ['app/api/module2-plan-stream/route.ts', '方案生成API'],
    ['app/api/chat-stream/route.ts', '聊天流式API']
  ]
  
  apiFiles.forEach(([file, desc]) => {
    totalChecks++
    if (checkFileExists(file, desc)) passedChecks++
  })
  
  // 3. 管理工具检查
  log('blue', '\n3. 管理工具检查')
  const toolFiles = [
    ['scripts/manage-api-keys.js', '密钥管理工具'],
    ['scripts/init-config.js', '配置初始化'],
    ['scripts/test-ai-integration.js', '集成测试'],
    ['scripts/quick-verify.js', '快速验证'],
    ['scripts/quick-setup.sh', '一键设置']
  ]
  
  toolFiles.forEach(([file, desc]) => {
    totalChecks++
    if (checkFileExists(file, desc)) passedChecks++
  })
  
  // 4. 文档检查
  log('blue', '\n4. 关键文档检查')
  const docFiles = [
    ['docs/FINAL_SUMMARY.md', '最终总结'],
    ['docs/ACTION_PLAN.md', '行动计划'],
    ['docs/FAQ_ANSWERS.md', '常见问题'],
    ['docs/CONFIG_MANAGEMENT.md', '配置管理指南'],
    ['docs/GEMINI_2_USAGE.md', 'Gemini 2.0使用指南'],
    ['README_QUICK_START.md', '快速启动指南'],
    ['START_HERE.md', '开始指南'],
    ['EXECUTION_CHECKLIST.md', '执行检查清单']
  ]
  
  docFiles.forEach(([file, desc]) => {
    totalChecks++
    if (checkFileExists(file, desc)) passedChecks++
  })
  
  // 5. 配置文件检查
  log('blue', '\n5. 配置文件检查')
  const configFiles = [
    ['package.json', 'NPM配置'],
    ['.env.example', '环境变量示例'],
    ['.gitignore', 'Git忽略配置'],
    ['vercel.json', 'Vercel部署配置']
  ]
  
  configFiles.forEach(([file, desc]) => {
    totalChecks++
    if (checkFileExists(file, desc)) passedChecks++
  })
  
  // 6. Package.json脚本检查
  log('blue', '\n6. NPM脚本检查')
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const requiredScripts = [
      'config:status',
      'config:interactive', 
      'config:init',
      'verify:quick',
      'test:ai-integration',
      'monitor:ai-services',
      'monitor:long-content'
    ]
    
    requiredScripts.forEach(script => {
      totalChecks++
      const exists = packageJson.scripts && packageJson.scripts[script]
      log(exists ? 'green' : 'red', `   ${exists ? '✅' : '❌'} NPM脚本: ${script}`)
      if (exists) passedChecks++
    })
  } catch (error) {
    log('red', '   ❌ 无法读取package.json')
  }
  
  // 7. 功能测试
  log('blue', '\n7. 功能模块测试')
  
  // 测试配置管理器
  try {
    const { configManager } = require('../lib/config-manager')
    const stats = configManager.getConfigStats()
    totalChecks++
    log('green', `   ✅ 配置管理器: ${stats.enabledServices}/${stats.totalServices} 服务可用`)
    passedChecks++
  } catch (error) {
    totalChecks++
    log('red', `   ❌ 配置管理器: ${error.message}`)
  }
  
  // 测试模型选择
  try {
    const { selectOptimalModel } = require('../lib/models')
    const longGenModel = selectOptimalModel('long_generation')
    totalChecks++
    log('green', `   ✅ 智能模型选择: ${longGenModel.name} (${longGenModel.provider})`)
    passedChecks++
    
    if (longGenModel.id === 'gemini-2.0-flash-exp') {
      log('cyan', '   🎉 已优化为Gemini 2.0 - 免费长内容生成!')
    }
  } catch (error) {
    totalChecks++
    log('red', `   ❌ 模型选择: ${error.message}`)
  }
  
  // 测试长内容配置
  try {
    const { getLongContentConfig } = require('../lib/long-content-config')
    const config = getLongContentConfig()
    totalChecks++
    log('green', `   ✅ 长内容配置: ${config.model.name}, ${config.maxTokens} tokens`)
    passedChecks++
  } catch (error) {
    totalChecks++
    log('red', `   ❌ 长内容配置: ${error.message}`)
  }
  
  // 8. 生成总结报告
  log('blue', '\n8. 系统状态总结')
  
  const successRate = Math.round((passedChecks / totalChecks) * 100)
  
  log('cyan', '\n' + '='.repeat(60))
  log('cyan', '📊 系统完整性检查报告')
  log('cyan', '='.repeat(60))
  
  log('yellow', `总检查项目: ${totalChecks}`)
  log('green', `通过检查: ${passedChecks}`)
  log(successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red', 
      `成功率: ${successRate}%`)
  
  if (successRate >= 95) {
    log('green', '\n🎉 系统状态: 优秀!')
    log('green', '✅ AI服务集成系统完全就绪')
    log('green', '✅ 所有核心组件正常工作')
    log('green', '✅ 可以开始使用和部署')
  } else if (successRate >= 85) {
    log('yellow', '\n⚠️  系统状态: 良好')
    log('yellow', '⚠️  大部分组件正常，少数问题需要修复')
  } else {
    log('red', '\n❌ 系统状态: 需要修复')
    log('red', '❌ 存在重要组件缺失或错误')
  }
  
  // 9. 下一步建议
  log('blue', '\n9. 下一步建议')
  
  if (successRate >= 95) {
    log('cyan', '🚀 立即可执行:')
    log('green', '• 运行 "pnpm run verify:quick" 验证优化效果')
    log('green', '• 运行 "pnpm run dev" 启动开发服务器')
    log('green', '• 测试完整的方案生成流程')
    log('green', '• 准备部署到Vercel')
  } else {
    log('cyan', '🔧 需要修复:')
    log('yellow', '• 检查缺失的文件和配置')
    log('yellow', '• 运行 "pnpm install" 安装依赖')
    log('yellow', '• 重新运行此检查脚本')
  }
  
  log('blue', '\n📖 相关文档:')
  log('blue', '• START_HERE.md - 立即开始指南')
  log('blue', '• EXECUTION_CHECKLIST.md - 执行检查清单')
  log('blue', '• docs/FAQ_ANSWERS.md - 常见问题解答')
  
  return successRate >= 90
}

// 运行系统检查
systemCheck().then(success => {
  process.exit(success ? 0 : 1)
}).catch(error => {
  log('red', `❌ 系统检查失败: ${error.message}`)
  process.exit(1)
})