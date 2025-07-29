#!/usr/bin/env node

/**
 * PDF服务检查脚本
 * 检查LibreOffice是否正确安装和配置
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const execAsync = promisify(exec)

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function checkLibreOffice() {
  log('\n🔍 检查LibreOffice安装状态...', 'blue')
  
  try {
    const { stdout } = await execAsync('libreoffice --version', { timeout: 5000 })
    log(`✅ LibreOffice已安装: ${stdout.trim()}`, 'green')
    return true
  } catch (error) {
    log('❌ LibreOffice未安装或不在PATH中', 'red')
    return false
  }
}

async function checkPDFConversion() {
  log('\n🧪 测试PDF转换功能...', 'blue')
  
  try {
    // 创建测试Word文档
    const testContent = `
      <html>
        <body>
          <h1>PDF转换测试</h1>
          <p>这是一个测试文档，用于验证LibreOffice的PDF转换功能。</p>
          <p>如果您能看到这个PDF文件，说明转换功能正常工作。</p>
        </body>
      </html>
    `
    
    const tempDir = require('os').tmpdir()
    const testHtmlPath = path.join(tempDir, 'test-conversion.html')
    const testPdfPath = path.join(tempDir, 'test-conversion.pdf')
    
    // 写入测试HTML文件
    fs.writeFileSync(testHtmlPath, testContent)
    
    // 尝试转换为PDF
    const command = `libreoffice --headless --convert-to pdf --outdir "${tempDir}" "${testHtmlPath}"`
    await execAsync(command, { timeout: 10000 })
    
    // 检查PDF是否生成
    if (fs.existsSync(testPdfPath)) {
      const stats = fs.statSync(testPdfPath)
      log(`✅ PDF转换测试成功，文件大小: ${stats.size} bytes`, 'green')
      
      // 清理测试文件
      fs.unlinkSync(testHtmlPath)
      fs.unlinkSync(testPdfPath)
      
      return true
    } else {
      log('❌ PDF文件未生成', 'red')
      return false
    }
    
  } catch (error) {
    log(`❌ PDF转换测试失败: ${error.message}`, 'red')
    return false
  }
}

async function checkAPIEndpoint() {
  log('\n🌐 检查PDF生成API...', 'blue')
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-pdf', {
      method: 'GET'
    })
    
    if (response.ok) {
      const data = await response.json()
      log(`✅ API端点正常: ${data.message}`, 'green')
      return true
    } else {
      log(`⚠️ API端点响应异常: ${response.status}`, 'yellow')
      return false
    }
  } catch (error) {
    log(`❌ 无法连接到API端点: ${error.message}`, 'red')
    log('💡 请确保开发服务器正在运行 (pnpm dev)', 'yellow')
    return false
  }
}

function showInstallationGuide() {
  log('\n📋 LibreOffice安装指南:', 'bold')
  log('\n🍎 macOS:', 'blue')
  log('  brew install --cask libreoffice')
  log('  或从官网下载: https://www.libreoffice.org/download/download/')
  
  log('\n🐧 Ubuntu/Debian:', 'blue')
  log('  sudo apt update')
  log('  sudo apt install libreoffice')
  
  log('\n🎩 CentOS/RHEL:', 'blue')
  log('  sudo yum install libreoffice')
  
  log('\n🪟 Windows:', 'blue')
  log('  从官网下载安装包: https://www.libreoffice.org/download/download/')
  log('  或使用 Chocolatey: choco install libreoffice')
  
  log('\n🐳 Docker方式:', 'blue')
  log('  pnpm run pdf:docker')
  log('  (使用预配置的LibreOffice Docker容器)')
}

function showTroubleshootingTips() {
  log('\n🔧 故障排除提示:', 'bold')
  log('\n1. 确保LibreOffice在系统PATH中')
  log('2. 尝试重启终端或IDE')
  log('3. 检查LibreOffice是否能正常启动')
  log('4. 确保有足够的磁盘空间用于临时文件')
  log('5. 检查系统权限，确保可以创建临时文件')
  
  log('\n📚 更多帮助:', 'blue')
  log('  查看文档: docs/PDF_EXPORT_SETUP.md')
  log('  运行Docker服务: pnpm run pdf:docker')
}

async function main() {
  log('🚀 PDF服务诊断工具', 'bold')
  log('=' .repeat(50), 'blue')
  
  const checks = [
    { name: 'LibreOffice安装', fn: checkLibreOffice },
    { name: 'PDF转换功能', fn: checkPDFConversion },
    { name: 'API端点', fn: checkAPIEndpoint }
  ]
  
  const results = []
  
  for (const check of checks) {
    const result = await check.fn()
    results.push({ name: check.name, success: result })
  }
  
  // 显示总结
  log('\n📊 检查结果总结:', 'bold')
  log('=' .repeat(30), 'blue')
  
  let allPassed = true
  results.forEach(result => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    const color = result.success ? 'green' : 'red'
    log(`${result.name}: ${status}`, color)
    if (!result.success) allPassed = false
  })
  
  if (allPassed) {
    log('\n🎉 所有检查都通过了！PDF生成服务已准备就绪。', 'green')
  } else {
    log('\n⚠️ 发现问题，PDF生成可能无法正常工作。', 'yellow')
    showInstallationGuide()
    showTroubleshootingTips()
  }
  
  log('\n💡 提示: 运行 pnpm run pdf:test 可以进行完整的PDF生成测试', 'blue')
}

// 运行检查
main().catch(error => {
  log(`\n💥 检查过程中发生错误: ${error.message}`, 'red')
  process.exit(1)
})