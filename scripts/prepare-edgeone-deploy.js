#!/usr/bin/env node

/**
 * EdgeOne 部署准备脚本
 * 为 EdgeOne 部署准备正确的文件结构
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🚀 准备 EdgeOne 部署文件...')
console.log('='.repeat(50))

// 1. 清理和构建
console.log('🧹 清理测试文件...')
try {
  execSync('pnpm run cleanup', { stdio: 'inherit' })
  console.log('✅ 测试文件清理完成')
} catch (error) {
  console.error('❌ 清理失败:', error.message)
  process.exit(1)
}

// 2. 构建项目
console.log('🔨 构建项目...')
try {
  execSync('pnpm build', { stdio: 'inherit' })
  console.log('✅ 项目构建完成')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

// 3. 检查必要文件
console.log('🔍 检查部署文件...')
const requiredFiles = [
  '.next',
  'package.json',
  'next.config.mjs',
  'app',
  'components',
  'lib',
  'public'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} 存在`)
  } else {
    console.log(`❌ ${file} 不存在`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.error('❌ 缺少必要文件，部署可能失败')
  process.exit(1)
}

// 4. 创建部署信息文件
const deployInfo = {
  timestamp: new Date().toISOString(),
  framework: 'Next.js',
  version: '15.1.3',
  nodeVersion: '18.x',
  buildCommand: 'pnpm install && pnpm build',
  outputDirectory: '.next',
  apiRoutes: [
    '/api/chat',
    '/api/generate-pdf',
    '/api/generate-word',
    '/api/generate-plan',
    '/api/expand-keywords',
    '/api/keyword-stats',
    '/api/images',
    '/api/convert-to-pdf',
    '/api/pdf-cache-stats'
  ],
  envVars: [
    'DEEPSEEK_API_KEY',
    'KIMI_API_KEY',
    'GLM_API_KEY',
    'QWEN_API_KEY',
    'SILICON_API_KEY'
  ],
  deploymentType: 'nextjs-app',
  notes: [
    '这是一个 Next.js 应用，需要 Node.js 运行时',
    '包含多个 API 路由，不能作为静态站点部署',
    '需要配置环境变量才能正常工作',
    '如果出现 404，请确保选择了 Next.js 应用部署方式'
  ]
}

fs.writeFileSync('edgeone-deploy-info.json', JSON.stringify(deployInfo, null, 2))
console.log('✅ 部署信息文件已生成: edgeone-deploy-info.json')

// 5. 生成部署包信息
console.log('📦 生成部署包信息...')
const stats = fs.statSync('.next')
const buildSize = execSync('du -sh .next', { encoding: 'utf8' }).trim()

console.log(`📊 构建产物信息:`)
console.log(`   目录: .next`)
console.log(`   大小: ${buildSize}`)
console.log(`   修改时间: ${stats.mtime}`)

// 6. 最终检查
console.log('🔍 最终检查...')
try {
  const result = execSync('node scripts/analyze-bundle.js', { encoding: 'utf8' })
  if (result.includes('✅ 构建文件大小符合要求')) {
    console.log('✅ 构建文件大小检查通过')
  }
} catch (error) {
  console.error('⚠️  构建分析警告:', error.message)
}

console.log('')
console.log('🎉 EdgeOne 部署准备完成！')
console.log('='.repeat(50))
console.log('📋 部署步骤:')
console.log('1. 登录 EdgeOne 控制台')
console.log('2. 选择 "Next.js 应用" 部署方式')
console.log('3. 连接 GitHub 仓库或上传项目文件')
console.log('4. 配置构建命令: pnpm install && pnpm build')
console.log('5. 配置环境变量（参考 edgeone-deploy-info.json）')
console.log('6. 发布部署')
console.log('')
console.log('⚠️  重要提醒:')
console.log('- 必须选择 Next.js 应用部署，不能选择静态站点')
console.log('- 需要配置 Node.js 18.x 运行时')
console.log('- 必须配置所有必要的环境变量')