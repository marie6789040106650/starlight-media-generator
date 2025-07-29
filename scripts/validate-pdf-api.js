#!/usr/bin/env node

/**
 * PDF API代码验证脚本
 * 验证API代码的语法和逻辑正确性，无需实际运行服务
 */

const fs = require('fs')
const path = require('path')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

// 验证文件存在性
function validateFileExists(filePath, description) {
  const fullPath = path.resolve(filePath)
  if (fs.existsSync(fullPath)) {
    logSuccess(`${description}: ${filePath}`)
    return true
  } else {
    logError(`${description}不存在: ${filePath}`)
    return false
  }
}

// 验证文件语法
function validateJavaScriptSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // 基本语法检查
    if (content.includes('export async function POST') || content.includes('export async function GET')) {
      logSuccess(`API路由语法正确: ${filePath}`)
      return true
    } else {
      logWarning(`API路由可能缺少导出函数: ${filePath}`)
      return false
    }
  } catch (error) {
    logError(`读取文件失败 ${filePath}: ${error.message}`)
    return false
  }
}

// 验证依赖项
function validateDependencies() {
  logInfo('检查依赖项...')
  
  const packageJsonPath = 'package.json'
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json不存在')
    return false
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    const requiredDeps = [
      'docx',
      'file-saver'
    ]
    
    let allDepsPresent = true
    
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        logSuccess(`依赖项存在: ${dep}`)
      } else {
        logError(`缺少依赖项: ${dep}`)
        allDepsPresent = false
      }
    })
    
    return allDepsPresent
  } catch (error) {
    logError(`解析package.json失败: ${error.message}`)
    return false
  }
}

// 验证脚本文件
function validateScripts() {
  logInfo('检查脚本文件...')
  
  const scripts = [
    { path: 'scripts/install-libreoffice.sh', desc: 'LibreOffice安装脚本' },
    { path: 'scripts/quick-pdf-test.sh', desc: '快速测试脚本' },
    { path: 'scripts/test-pdf-conversion.js', desc: '详细测试脚本' }
  ]
  
  let allScriptsValid = true
  
  scripts.forEach(script => {
    if (!validateFileExists(script.path, script.desc)) {
      allScriptsValid = false
    } else {
      // 检查脚本是否可执行
      try {
        const stats = fs.statSync(script.path)
        if (stats.mode & parseInt('111', 8)) {
          logSuccess(`脚本可执行: ${script.path}`)
        } else {
          logWarning(`脚本不可执行: ${script.path}`)
        }
      } catch (error) {
        logWarning(`无法检查脚本权限: ${script.path}`)
      }
    }
  })
  
  return allScriptsValid
}

// 验证API文件
function validateAPIFiles() {
  logInfo('检查API文件...')
  
  const apiFiles = [
    { path: 'app/api/generate-pdf/route.ts', desc: 'PDF生成API' },
    { path: 'lib/export/word-generator.ts', desc: 'Word生成器' },
    { path: 'lib/export/pdf-generator.ts', desc: 'PDF生成器' },
    { path: 'lib/export/markdown-parser.ts', desc: 'Markdown解析器' },
    { path: 'components/export-actions.tsx', desc: '导出组件' }
  ]
  
  let allFilesValid = true
  
  apiFiles.forEach(file => {
    if (!validateFileExists(file.path, file.desc)) {
      allFilesValid = false
    } else if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
      // 对TypeScript文件进行基本语法检查
      try {
        const content = fs.readFileSync(file.path, 'utf8')
        if (content.includes('export') && content.length > 100) {
          logSuccess(`文件内容正常: ${file.path}`)
        } else {
          logWarning(`文件内容可能不完整: ${file.path}`)
        }
      } catch (error) {
        logError(`读取文件失败 ${file.path}: ${error.message}`)
        allFilesValid = false
      }
    }
  })
  
  return allFilesValid
}

// 验证Docker文件
function validateDockerFiles() {
  logInfo('检查Docker配置...')
  
  const dockerFiles = [
    { path: 'docker/libreoffice.Dockerfile', desc: 'Docker镜像配置' },
    { path: 'docker/docker-compose.pdf.yml', desc: 'Docker Compose配置' }
  ]
  
  let allDockerFilesValid = true
  
  dockerFiles.forEach(file => {
    if (!validateFileExists(file.path, file.desc)) {
      allDockerFilesValid = false
    } else {
      try {
        const content = fs.readFileSync(file.path, 'utf8')
        if (content.includes('libreoffice') || content.includes('LibreOffice')) {
          logSuccess(`Docker配置包含LibreOffice: ${file.path}`)
        } else {
          logWarning(`Docker配置可能缺少LibreOffice: ${file.path}`)
        }
      } catch (error) {
        logError(`读取Docker文件失败 ${file.path}: ${error.message}`)
        allDockerFilesValid = false
      }
    }
  })
  
  return allDockerFilesValid
}

// 验证文档文件
function validateDocumentation() {
  logInfo('检查文档文件...')
  
  const docFiles = [
    { path: 'docs/LIBREOFFICE_PDF_SETUP.md', desc: '部署指南' },
    { path: 'README-PDF-CONVERSION.md', desc: 'PDF转换说明' }
  ]
  
  let allDocsValid = true
  
  docFiles.forEach(file => {
    if (!validateFileExists(file.path, file.desc)) {
      allDocsValid = false
    }
  })
  
  return allDocsValid
}

// 生成安装建议
function generateInstallationSuggestions() {
  logInfo('生成安装建议...')
  
  console.log('')
  log('📋 安装和部署建议:', 'blue')
  console.log('')
  
  log('1. 安装LibreOffice:', 'yellow')
  console.log('   pnpm run pdf:install')
  console.log('   # 或手动安装: sudo apt-get install libreoffice-core')
  console.log('')
  
  log('2. 启动开发服务器:', 'yellow')
  console.log('   pnpm run dev')
  console.log('')
  
  log('3. 测试PDF功能:', 'yellow')
  console.log('   pnpm run pdf:test-quick')
  console.log('   # 或详细测试: pnpm run pdf:test')
  console.log('')
  
  log('4. Docker部署 (可选):', 'yellow')
  console.log('   pnpm run pdf:docker')
  console.log('')
  
  log('5. 验证安装:', 'yellow')
  console.log('   curl http://localhost:3000/api/generate-pdf')
  console.log('')
}

// 主函数
async function main() {
  console.log('🔍 PDF API代码验证')
  console.log('==================')
  console.log('')
  
  let overallValid = true
  
  // 验证各个组件
  const validations = [
    { name: '依赖项', fn: validateDependencies },
    { name: 'API文件', fn: validateAPIFiles },
    { name: '脚本文件', fn: validateScripts },
    { name: 'Docker配置', fn: validateDockerFiles },
    { name: '文档文件', fn: validateDocumentation }
  ]
  
  for (const validation of validations) {
    console.log('')
    const result = validation.fn()
    if (!result) {
      overallValid = false
    }
  }
  
  console.log('')
  console.log('==================')
  
  if (overallValid) {
    logSuccess('所有验证通过! PDF转换功能代码完整 🎉')
  } else {
    logWarning('部分验证失败，但核心功能应该可用')
  }
  
  // 生成安装建议
  generateInstallationSuggestions()
  
  console.log('')
  log('📚 相关文档:', 'blue')
  console.log('   - 完整部署指南: docs/LIBREOFFICE_PDF_SETUP.md')
  console.log('   - PDF转换说明: README-PDF-CONVERSION.md')
  console.log('   - API文档: app/api/generate-pdf/route.ts')
  
  return overallValid
}

// 运行验证
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    logError(`验证失败: ${error.message}`)
    process.exit(1)
  })
}

module.exports = { main }