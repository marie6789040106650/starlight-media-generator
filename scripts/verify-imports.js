#!/usr/bin/env node

/**
 * 验证所有导入路径是否正确
 */

const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'components/enhanced-solution-display.tsx',
  'components/solution-export-with-watermark.tsx', 
  'components/complete-solution-page.tsx',
  'lib/word-export-with-markdown.ts',
  'lib/pdf-export-with-watermark.ts',
  'lib/markdown-toolkit/enhanced-markdown-renderer.tsx'
];

const requiredFiles = [
  'lib/markdown-toolkit/index.ts',
  'lib/markdown-toolkit/markdown-renderer.ts',
  'lib/markdown-toolkit/enhanced-markdown-renderer.tsx',
  'lib/markdown-toolkit/enhanced-markdown.css',
  'lib/watermark-toolkit/index.ts',
  'lib/watermark-toolkit/pdf-watermark.ts',
  'lib/watermark-toolkit/watermark-config.tsx'
];

console.log('🔍 验证文件导入路径...\n');

// 检查必需文件是否存在
console.log('📁 检查必需文件:');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

console.log('\n📝 检查导入路径:');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查是否还有临时路径引用
    if (content.includes('temp/tools')) {
      console.log(`⚠️  ${file} - 仍包含临时路径引用`);
    } else {
      console.log(`✅ ${file} - 导入路径正确`);
    }
  } else {
    console.log(`❌ ${file} - 文件不存在`);
  }
});

if (allFilesExist) {
  console.log('\n🎉 所有文件验证通过！');
  console.log('💡 提示: 现在可以安全删除 temp/tools 目录');
} else {
  console.log('\n❌ 验证失败，请检查缺失的文件');
  process.exit(1);
}