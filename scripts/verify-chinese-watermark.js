#!/usr/bin/env node

/**
 * 中文水印功能验证脚本
 * 检查所有必要的文件和配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证中文水印功能...\n');

// 检查项目
const checks = [
  {
    name: '中文字体文件',
    check: () => {
      const fontPath = path.join(__dirname, '../public/fonts/NotoSansSC-Regular.woff2');
      if (fs.existsSync(fontPath)) {
        const stats = fs.statSync(fontPath);
        if (stats.size > 1000000) { // 大于1MB
          return { success: true, message: `字体文件存在 (${(stats.size / 1024 / 1024).toFixed(1)}MB)` };
        } else {
          return { success: false, message: '字体文件过小，可能下载不完整' };
        }
      }
      return { success: false, message: '字体文件不存在' };
    }
  },
  {
    name: '水印工具库',
    check: () => {
      const toolkitPath = path.join(__dirname, '../lib/utils/pdf-watermark.ts');
      if (fs.existsSync(toolkitPath)) {
        const content = fs.readFileSync(toolkitPath, 'utf8');
        if (content.includes('loadChineseFont') && content.includes('loadLocalChineseFont')) {
          return { success: true, message: '水印工具库包含中文字体支持' };
        }
        return { success: false, message: '水印工具库缺少中文字体支持' };
      }
      return { success: false, message: '水印工具库文件不存在' };
    }
  },
  {
    name: '演示页面',
    check: () => {
      const demoPath = path.join(__dirname, '../app/chinese-watermark-demo/page.tsx');
      if (fs.existsSync(demoPath)) {
        return { success: true, message: '中文水印演示页面存在' };
      }
      return { success: false, message: '演示页面不存在' };
    }
  },
  {
    name: '测试页面',
    check: () => {
      const testPath = path.join(__dirname, '../app/watermark-test/page.tsx');
      if (fs.existsSync(testPath)) {
        const content = fs.readFileSync(testPath, 'utf8');
        if (content.includes('测试模块导入') && content.includes('测试水印功能')) {
          return { success: true, message: '测试页面功能完整' };
        }
        return { success: false, message: '测试页面功能不完整' };
      }
      return { success: false, message: '测试页面不存在' };
    }
  },
  {
    name: '导出组件',
    check: () => {
      const exportPath = path.join(__dirname, '../components/enhanced-export-with-watermark.tsx');
      if (fs.existsSync(exportPath)) {
        const content = fs.readFileSync(exportPath, 'utf8');
        if (content.includes('utils/pdf-watermark') && content.includes('watermarkConfig')) {
          return { success: true, message: '导出组件集成正确' };
        }
        return { success: false, message: '导出组件集成有问题' };
      }
      return { success: false, message: '导出组件不存在' };
    }
  },
  {
    name: '字体下载脚本',
    check: () => {
      const scriptPath = path.join(__dirname, '../scripts/download-chinese-fonts.js');
      if (fs.existsSync(scriptPath)) {
        return { success: true, message: '字体下载脚本存在' };
      }
      return { success: false, message: '字体下载脚本不存在' };
    }
  }
];

// 执行检查
let passCount = 0;
let totalCount = checks.length;

checks.forEach((check, index) => {
  const result = check.check();
  const status = result.success ? '✅' : '❌';
  const number = (index + 1).toString().padStart(2, '0');
  
  console.log(`${status} ${number}. ${check.name}: ${result.message}`);
  
  if (result.success) {
    passCount++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`📊 检查结果: ${passCount}/${totalCount} 项通过`);

if (passCount === totalCount) {
  console.log('🎉 所有检查通过！中文水印功能已就绪');
  console.log('\n🚀 可以开始使用中文水印功能：');
  console.log('   • 测试页面: http://localhost:3000/watermark-test');
  console.log('   • 演示页面: http://localhost:3000/chinese-watermark-demo');
  console.log('   • 主应用: http://localhost:3000/');
} else {
  console.log('⚠️  部分检查未通过，请修复后重试');
  console.log('\n🔧 修复建议：');
  
  checks.forEach((check, index) => {
    const result = check.check();
    if (!result.success) {
      console.log(`   • ${check.name}: ${result.message}`);
    }
  });
}

console.log('\n💡 如需帮助，请查看 CHINESE_WATERMARK_GUIDE.md');