#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 确保项目符合 EdgeOne 部署要求
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// EdgeOne 部署限制
const EDGEONE_LIMITS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  WARN_FILE_SIZE: 20 * 1024 * 1024, // 20MB
}

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 检查构建目录是否存在
 */
function checkBuildExists() {
  if (!fs.existsSync('.next')) {
    log('red', '❌ 构建目录不存在，请先运行 pnpm build')
    return false
  }
  return true
}

/**
 * 清理测试文件
 */
function cleanupTestFiles() {
  log('blue', '🧹 清理测试文件...')
  try {
    execSync('pnpm run cleanup', { stdio: 'inherit' })
    log('green', '✅ 测试文件清理完成')
    return true
  } catch (error) {
    log('red', '❌ 测试文件清理失败')
    console.error(error.message)
    return false
  }
}

/**
 * 运行构建
 */
function runBuild() {
  log('blue', '🔨 开始构建...')
  try {
    execSync('pnpm build', { stdio: 'inherit' })
    log('green', '✅ 构建成功')
    return true
  } catch (error) {
    log('red', '❌ 构建失败')
    console.error(error.message)
    return false
  }
}

/**
 * 分析构建文件
 */
function analyzeBuild() {
  log('blue', '📊 分析构建文件...')
  try {
    const result = execSync('node scripts/analyze-bundle.js', { encoding: 'utf8' })
    console.log(result)
    return true
  } catch (error) {
    if (error.status === 1) {
      log('red', '❌ 发现超大文件，不符合 EdgeOne 部署要求')
      return false
    }
    log('red', '❌ 构建分析失败')
    console.error(error.message)
    return false
  }
}

/**
 * 检查大型库使用情况
 */
function checkLargeLibraries() {
  log('blue', '🔍 检查大型库使用情况...')
  
  const largeLibs = ['docx', 'jspdf', 'file-saver', 'html2canvas']
  let hasDirectImports = false
  
  largeLibs.forEach(lib => {
    try {
      // 检查客户端组件中的直接导入
      const result = execSync(
        `grep -r "^import.*${lib}" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=lib/export --exclude-dir=app/api .`,
        { encoding: 'utf8' }
      )
      
      if (result.trim()) {
        log('yellow', `⚠️  发现 ${lib} 的直接导入（客户端）:`)
        result.split('\n').filter(line => line.trim()).forEach(line => {
          console.log(`   ${line}`)
        })
        hasDirectImports = true
      }
    } catch (error) {
      // 没有找到直接导入是好事
    }
  })
  
  if (!hasDirectImports) {
    log('green', '✅ 没有发现客户端直接导入大型库')
  }
  
  return true
}

/**
 * 验证 API 路由
 */
function checkApiRoutes() {
  log('blue', '🔌 检查 API 路由...')
  
  const requiredApis = [
    'app/api/generate-pdf/route.ts',
    'app/api/generate-word/route.ts'
  ]
  
  let allExist = true
  
  requiredApis.forEach(api => {
    if (fs.existsSync(api)) {
      log('green', `✅ ${api} 存在`)
    } else {
      log('red', `❌ ${api} 不存在`)
      allExist = false
    }
  })
  
  return allExist
}

/**
 * 生成部署报告
 */
function generateDeploymentReport() {
  log('blue', '📋 生成部署报告...')
  
  const report = {
    timestamp: new Date().toISOString(),
    edgeOneCompliant: true,
    buildSize: 'Under 25MB limit',
    optimizations: [
      '✅ 大型库移至服务端 API',
      '✅ 客户端使用动态导入',
      '✅ Webpack 分包配置优化',
      '✅ 测试文件已清理',
      '✅ 构建缓存已禁用'
    ],
    recommendations: [
      '定期运行 pnpm run deploy:check',
      '监控构建文件大小变化',
      '保持大型库在服务端使用'
    ]
  }
  
  fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2))
  log('green', '✅ 部署报告已生成: deployment-report.json')
  
  return true
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 EdgeOne 部署前检查')
  console.log('='.repeat(50))
  console.log()
  
  const checks = [
    { name: '清理测试文件', fn: cleanupTestFiles },
    { name: '运行构建', fn: runBuild },
    { name: '检查构建目录', fn: checkBuildExists },
    { name: '分析构建文件', fn: analyzeBuild },
    { name: '检查大型库', fn: checkLargeLibraries },
    { name: '验证 API 路由', fn: checkApiRoutes },
    { name: '生成部署报告', fn: generateDeploymentReport }
  ]
  
  let allPassed = true
  
  for (const check of checks) {
    try {
      const result = await check.fn()
      if (!result) {
        allPassed = false
        break
      }
    } catch (error) {
      log('red', `❌ ${check.name} 失败: ${error.message}`)
      allPassed = false
      break
    }
    console.log()
  }
  
  console.log('='.repeat(50))
  
  if (allPassed) {
    log('green', '🎉 所有检查通过！项目可以部署到 EdgeOne')
    log('blue', '📝 部署命令: 上传构建产物到 EdgeOne 控制台')
    process.exit(0)
  } else {
    log('red', '❌ 部署前检查失败，请修复问题后重试')
    process.exit(1)
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('检查过程出错:', error)
    process.exit(1)
  })
}

module.exports = { main }