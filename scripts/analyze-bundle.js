#!/usr/bin/env node

/**
 * Bundle 分析脚本
 * 用于分析 Next.js 构建后的包大小
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 配置
const CONFIG = {
  BUILD_DIR: '.next',
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  WARN_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  LARGE_LIBRARIES: ['docx', 'jspdf', 'file-saver', 'html2canvas']
}

/**
 * 格式化文件大小
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取文件大小
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList)
    } else {
      fileList.push({
        path: filePath,
        size: stat.size,
        relativePath: path.relative(CONFIG.BUILD_DIR, filePath)
      })
    }
  })
  
  return fileList
}

/**
 * 分析构建文件
 */
function analyzeBuildFiles() {
  console.log('🔍 分析构建文件...\n')
  
  if (!fs.existsSync(CONFIG.BUILD_DIR)) {
    console.error('❌ 构建目录不存在，请先运行 pnpm build')
    process.exit(1)
  }
  
  const allFiles = getAllFiles(CONFIG.BUILD_DIR)
  
  // 按大小排序
  allFiles.sort((a, b) => b.size - a.size)
  
  // 分析结果
  const analysis = {
    totalFiles: allFiles.length,
    totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
    largeFiles: allFiles.filter(file => file.size > CONFIG.WARN_FILE_SIZE),
    oversizedFiles: allFiles.filter(file => file.size > CONFIG.MAX_FILE_SIZE),
    webpackFiles: allFiles.filter(file => file.relativePath.includes('webpack')),
    staticFiles: allFiles.filter(file => file.relativePath.includes('static')),
  }
  
  return { allFiles, analysis }
}

/**
 * 显示分析结果
 */
function displayAnalysis(allFiles, analysis) {
  console.log('📊 构建分析结果')
  console.log('='.repeat(50))
  console.log(`总文件数: ${analysis.totalFiles}`)
  console.log(`总大小: ${formatBytes(analysis.totalSize)}`)
  console.log(`大文件数 (>${formatBytes(CONFIG.WARN_FILE_SIZE)}): ${analysis.largeFiles.length}`)
  console.log(`超大文件数 (>${formatBytes(CONFIG.MAX_FILE_SIZE)}): ${analysis.oversizedFiles.length}`)
  console.log()
  
  // 显示超大文件
  if (analysis.oversizedFiles.length > 0) {
    console.log('🚨 超大文件 (超过 25MB):')
    analysis.oversizedFiles.forEach(file => {
      console.log(`  ❌ ${file.relativePath} - ${formatBytes(file.size)}`)
    })
    console.log()
  }
  
  // 显示大文件
  if (analysis.largeFiles.length > 0) {
    console.log('⚠️  大文件 (超过 20MB):')
    analysis.largeFiles.slice(0, 10).forEach(file => {
      console.log(`  📦 ${file.relativePath} - ${formatBytes(file.size)}`)
    })
    console.log()
  }
  
  // 显示前10个最大文件
  console.log('📋 前10个最大文件:')
  allFiles.slice(0, 10).forEach((file, index) => {
    const icon = file.size > CONFIG.MAX_FILE_SIZE ? '❌' : 
                 file.size > CONFIG.WARN_FILE_SIZE ? '⚠️' : '✅'
    console.log(`  ${index + 1}. ${icon} ${file.relativePath} - ${formatBytes(file.size)}`)
  })
  console.log()
  
  // Webpack 缓存文件分析
  if (analysis.webpackFiles.length > 0) {
    console.log('🔧 Webpack 缓存文件:')
    const webpackSize = analysis.webpackFiles.reduce((sum, file) => sum + file.size, 0)
    console.log(`  总数: ${analysis.webpackFiles.length}`)
    console.log(`  总大小: ${formatBytes(webpackSize)}`)
    
    const largeWebpackFiles = analysis.webpackFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (largeWebpackFiles.length > 0) {
      console.log('  大缓存文件:')
      largeWebpackFiles.forEach(file => {
        console.log(`    📦 ${file.relativePath} - ${formatBytes(file.size)}`)
      })
    }
    console.log()
  }
}

/**
 * 提供优化建议
 */
function provideSuggestions(analysis) {
  console.log('💡 优化建议:')
  console.log('-'.repeat(30))
  
  if (analysis.oversizedFiles.length > 0) {
    console.log('1. 🚨 发现超大文件，需要立即处理:')
    console.log('   - 检查是否有大型库被错误打包到客户端')
    console.log('   - 使用动态导入 (dynamic import) 分割代码')
    console.log('   - 将大型库移到服务端 API 处理')
    console.log()
  }
  
  if (analysis.largeFiles.length > 5) {
    console.log('2. ⚠️  大文件过多，建议优化:')
    console.log('   - 启用更激进的代码分割')
    console.log('   - 检查是否有重复的依赖')
    console.log('   - 考虑使用 CDN 加载大型库')
    console.log()
  }
  
  const webpackCacheSize = analysis.webpackFiles.reduce((sum, file) => sum + file.size, 0)
  if (webpackCacheSize > 100 * 1024 * 1024) {
    console.log('3. 🔧 Webpack 缓存过大:')
    console.log('   - 在生产环境禁用缓存: config.cache = false')
    console.log('   - 清理构建缓存: rm -rf .next')
    console.log()
  }
  
  console.log('4. 🛠️  通用优化建议:')
  console.log('   - 运行: ANALYZE=true pnpm build 查看详细分析')
  console.log('   - 使用 next-bundle-analyzer 可视化分析')
  console.log('   - 检查 next.config.js 的分包配置')
  console.log('   - 确保大型库在 serverComponentsExternalPackages 中')
}

/**
 * 检查特定库的使用情况
 */
function checkLibraryUsage() {
  console.log('🔍 检查大型库使用情况:')
  console.log('-'.repeat(30))
  
  CONFIG.LARGE_LIBRARIES.forEach(lib => {
    try {
      // 检查是否在客户端代码中直接导入
      const grepResult = execSync(`grep -r "import.*${lib}" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.next .`, { encoding: 'utf8' })
      
      if (grepResult) {
        console.log(`⚠️  发现 ${lib} 的直接导入:`)
        grepResult.split('\n').filter(line => line.trim()).forEach(line => {
          console.log(`   ${line}`)
        })
        console.log()
      }
    } catch (error) {
      // 没有找到直接导入，这是好事
      console.log(`✅ ${lib} - 没有发现直接导入`)
    }
  })
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 Next.js Bundle 分析器')
  console.log('='.repeat(50))
  console.log()
  
  try {
    // 分析构建文件
    const { allFiles, analysis } = analyzeBuildFiles()
    
    // 显示分析结果
    displayAnalysis(allFiles, analysis)
    
    // 检查库使用情况
    checkLibraryUsage()
    
    // 提供优化建议
    provideSuggestions(analysis)
    
    // 返回状态码
    if (analysis.oversizedFiles.length > 0) {
      console.log('❌ 发现超大文件，构建不符合部署要求')
      process.exit(1)
    } else if (analysis.largeFiles.length > 5) {
      console.log('⚠️  发现较多大文件，建议优化')
      process.exit(0)
    } else {
      console.log('✅ 构建文件大小符合要求')
      process.exit(0)
    }
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message)
    process.exit(1)
  }
}

// 运行主函数
if (require.main === module) {
  main()
}

module.exports = { analyzeBuildFiles, formatBytes }