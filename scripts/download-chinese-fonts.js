#!/usr/bin/env node

/**
 * 下载中文字体文件脚本
 * 用于支持PDF中文水印功能
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 字体下载配置 - 使用可靠的CDN源
const fonts = [
  {
    name: 'Noto Sans SC Regular',
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.11/files/noto-sans-sc-chinese-simplified-400-normal.woff2',
    filename: 'NotoSansSC-Regular.woff2'
  },
  {
    name: 'Source Han Sans SC (Subset)',
    url: 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSansSC/NotoSansSC-Regular.ttf',
    filename: 'NotoSansSC-Regular.ttf'
  }
];

// 创建字体目录
const fontsDir = path.join(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log('📁 创建字体目录:', fontsDir);
}

// 下载字体文件
async function downloadFont(font) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(fontsDir, font.filename);
    
    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      console.log(`✅ 字体已存在: ${font.name}`);
      resolve();
      return;
    }
    
    console.log(`🌐 开始下载: ${font.name}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(font.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ 下载完成: ${font.name} -> ${font.filename}`);
        resolve();
      });
      
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // 删除不完整的文件
      reject(err);
    });
  });
}

// 主函数
async function main() {
  console.log('🚀 开始下载中文字体文件...\n');
  
  try {
    for (const font of fonts) {
      await downloadFont(font);
    }
    
    console.log('\n🎉 所有字体下载完成！');
    console.log('📍 字体文件位置:', fontsDir);
    console.log('\n💡 现在可以在PDF水印中使用中文字符了！');
    
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
    console.log('\n🔧 备用方案:');
    console.log('1. 手动下载字体文件到 public/fonts/ 目录');
    console.log('2. 或者使用在线字体CDN（需要网络连接）');
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { downloadFont, fonts };