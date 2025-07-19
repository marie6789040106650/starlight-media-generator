#!/usr/bin/env node

// 验证所有导入路径是否正确
const fs = require('fs');
const path = require('path');

console.log('🔍 验证项目导入路径...');

// 检查关键文件是否存在
const criticalFiles = [
  'lib/models.ts',
  'lib/constants.ts', 
  'components/page-header.tsx',
  'components/progress-steps.tsx',
  'components/form-section.tsx',
  'hooks/use-form-data.ts',
  'hooks/use-plan-generation.ts',
  'hooks/use-banner-image.ts',
  'hooks/use-toc.ts',
  'hooks/use-keyword-stats.ts'
];

let allFilesExist = true;

criticalFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 所有关键文件都存在！');
  process.exit(0);
} else {
  console.log('\n❌ 有文件缺失，请检查！');
  process.exit(1);
}