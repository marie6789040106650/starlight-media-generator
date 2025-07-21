#!/usr/bin/env node

/**
 * 构建文件大小检查脚本
 * 用于验证构建产物是否符合部署平台的文件大小限制
 */

const fs = require('fs');
const path = require('path');

// 配置项
const CONFIG = {
  // 文件大小限制 (字节)
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB (EdgeOne限制)
  WARNING_SIZE: 20 * 1024 * 1024,  // 20MB (警告阈值)
  
  // 检查目录
  BUILD_DIR: '.next',
  CHUNKS_DIR: '.next/static/chunks',
  
  // 输出格式
  COLORS: {
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    GREEN: '\x1b[32m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
  }
};

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取文件信息
 */
function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  return {
    path: relativePath,
    size: stats.size,
    formattedSize: formatSize(stats.size)
  };
}

/**
 * 检查单个文件
 */
function checkFile(fileInfo) {
  const { path: filePath, size, formattedSize } = fileInfo;
  const { RED, YELLOW, GREEN, RESET } = CONFIG.COLORS;
  
  if (size > CONFIG.MAX_FILE_SIZE) {
    console.log(`${RED}❌ 文件过大: ${filePath} (${formattedSize})${RESET}`);
    return { status: 'error', file: filePath, size };
  } else if (size > CONFIG.WARNING_SIZE) {
    console.log(`${YELLOW}⚠️  文件较大: ${filePath} (${formattedSize})${RESET}`);
    return { status: 'warning', file: filePath, size };
  } else {
    console.log(`${GREEN}✅ 文件正常: ${filePath} (${formattedSize})${RESET}`);
    return { status: 'ok', file: filePath, size };
  }
}

/**
 * 扫描目录中的所有文件
 */
function scanDirectory(dirPath) {
  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        walkDir(itemPath);
      } else {
        files.push(getFileInfo(itemPath));
      }
    }
  }
  
  walkDir(dirPath);
  return files;
}

/**
 * 主检查函数
 */
function checkBuildSize() {
  const { BLUE, RED, GREEN, RESET } = CONFIG.COLORS;
  
  console.log(`${BLUE}🔍 开始检查构建文件大小...${RESET}\n`);
  
  // 检查构建目录是否存在
  if (!fs.existsSync(CONFIG.BUILD_DIR)) {
    console.error(`${RED}❌ 构建目录不存在: ${CONFIG.BUILD_DIR}${RESET}`);
    console.error(`${RED}请先运行 'pnpm build' 构建项目${RESET}`);
    process.exit(1);
  }
  
  // 检查chunks目录
  if (!fs.existsSync(CONFIG.CHUNKS_DIR)) {
    console.error(`${RED}❌ Chunks目录不存在: ${CONFIG.CHUNKS_DIR}${RESET}`);
    process.exit(1);
  }
  
  // 扫描所有文件
  const allFiles = scanDirectory(CONFIG.BUILD_DIR);
  const results = {
    total: allFiles.length,
    errors: [],
    warnings: [],
    ok: []
  };
  
  console.log(`📁 检查目录: ${CONFIG.BUILD_DIR}`);
  console.log(`📊 文件总数: ${allFiles.length}\n`);
  
  // 检查每个文件
  for (const fileInfo of allFiles) {
    const result = checkFile(fileInfo);
    
    switch (result.status) {
      case 'error':
        results.errors.push(result);
        break;
      case 'warning':
        results.warnings.push(result);
        break;
      case 'ok':
        results.ok.push(result);
        break;
    }
  }
  
  // 输出统计信息
  console.log('\n📊 检查结果统计:');
  console.log(`${GREEN}✅ 正常文件: ${results.ok.length}${RESET}`);
  console.log(`${CONFIG.COLORS.YELLOW}⚠️  警告文件: ${results.warnings.length}${RESET}`);
  console.log(`${RED}❌ 错误文件: ${results.errors.length}${RESET}`);
  
  // 显示最大的几个文件
  const sortedFiles = allFiles.sort((a, b) => b.size - a.size).slice(0, 5);
  console.log('\n📈 最大的5个文件:');
  for (const file of sortedFiles) {
    const color = file.size > CONFIG.WARNING_SIZE ? RED : 
                  file.size > CONFIG.WARNING_SIZE * 0.8 ? CONFIG.COLORS.YELLOW : GREEN;
    console.log(`${color}   ${file.path} (${file.formattedSize})${RESET}`);
  }
  
  // 输出建议
  if (results.errors.length > 0) {
    console.log(`\n${RED}🚨 发现 ${results.errors.length} 个文件超过大小限制！${RESET}`);
    console.log(`${RED}建议检查以下配置：${RESET}`);
    console.log(`${RED}1. next.config.mjs 中的 serverExternalPackages 配置${RESET}`);
    console.log(`${RED}2. webpack splitChunks 配置${RESET}`);
    console.log(`${RED}3. 是否有大型库被错误打包到客户端${RESET}`);
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log(`\n${CONFIG.COLORS.YELLOW}⚠️  发现 ${results.warnings.length} 个文件接近大小限制${RESET}`);
    console.log(`${CONFIG.COLORS.YELLOW}建议优化以避免未来问题${RESET}`);
  } else {
    console.log(`\n${GREEN}🎉 所有文件大小检查通过！${RESET}`);
  }
  
  // 输出部署建议
  console.log(`\n${BLUE}📋 部署建议：${RESET}`);
  console.log(`${BLUE}• EdgeOne: 文件大小限制 25MB ✅${RESET}`);
  console.log(`${BLUE}• Vercel: 无特殊限制 ✅${RESET}`);
  console.log(`${BLUE}• Netlify: 无特殊限制 ✅${RESET}`);
}

/**
 * 命令行参数处理
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
构建文件大小检查工具

用法:
  node scripts/check-build-size.js [选项]

选项:
  -h, --help     显示帮助信息
  --max-size     设置最大文件大小限制 (MB)
  --warn-size    设置警告阈值 (MB)

示例:
  node scripts/check-build-size.js
  node scripts/check-build-size.js --max-size 30
  node scripts/check-build-size.js --warn-size 15 --max-size 25
`);
    return;
  }
  
  // 处理自定义大小限制
  const maxSizeIndex = args.indexOf('--max-size');
  if (maxSizeIndex !== -1 && args[maxSizeIndex + 1]) {
    CONFIG.MAX_FILE_SIZE = parseInt(args[maxSizeIndex + 1]) * 1024 * 1024;
  }
  
  const warnSizeIndex = args.indexOf('--warn-size');
  if (warnSizeIndex !== -1 && args[warnSizeIndex + 1]) {
    CONFIG.WARNING_SIZE = parseInt(args[warnSizeIndex + 1]) * 1024 * 1024;
  }
  
  try {
    checkBuildSize();
  } catch (error) {
    console.error(`${CONFIG.COLORS.RED}❌ 检查过程中发生错误: ${error.message}${CONFIG.COLORS.RESET}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { checkBuildSize, formatSize, getFileInfo };