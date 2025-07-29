/**
 * 验证 Markdown 渲染器集成
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证 Markdown 渲染器集成...\n');

// 检查文件是否存在
const filesToCheck = [
  'lib/markdown-renderer.ts',
  'components/enhanced-markdown-renderer.tsx',
  'components/markdown-renderer.tsx',
  'components/comprehensive-markdown.tsx',
  'components/content-renderer.tsx',
  'styles/enhanced-markdown.css',
  'app/markdown-test/page.tsx',
  'tests/markdown-renderer.test.ts'
];

console.log('📁 检查文件存在性:');
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - 文件不存在`);
  }
});

// 检查依赖是否安装
console.log('\n📦 检查依赖包:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'katex',
  '@types/katex',
  'prismjs',
  '@types/prismjs'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`   ✅ ${dep}`);
  } else {
    console.log(`   ❌ ${dep} - 依赖未安装`);
  }
});

// 检查样式导入
console.log('\n🎨 检查样式集成:');
try {
  const globalCss = fs.readFileSync('app/globals.css', 'utf8');
  if (globalCss.includes('enhanced-markdown.css')) {
    console.log('   ✅ 增强 Markdown 样式已导入');
  } else {
    console.log('   ❌ 增强 Markdown 样式未导入');
  }
} catch (error) {
  console.log('   ❌ 无法读取 globals.css');
}

// 检查组件导入
console.log('\n🧩 检查组件集成:');
try {
  const contentRenderer = fs.readFileSync('components/content-renderer.tsx', 'utf8');
  if (contentRenderer.includes('EnhancedMarkdownRenderer')) {
    console.log('   ✅ ContentRenderer 已更新为使用增强渲染器');
  } else {
    console.log('   ❌ ContentRenderer 未更新');
  }
} catch (error) {
  console.log('   ❌ 无法读取 content-renderer.tsx');
}

// 功能特性检查
console.log('\n⚡ 功能特性检查:');
try {
  const markdownRenderer = fs.readFileSync('lib/markdown-renderer.ts', 'utf8');
  
  const features = [
    { name: '标题渲染', check: 'renderHeaders' },
    { name: '代码高亮', check: 'highlightCode' },
    { name: '表格渲染', check: 'renderTables' },
    { name: '数学公式', check: 'renderMath' },
    { name: '脚注支持', check: 'renderFootnotes' },
    { name: 'Emoji 支持', check: 'renderEmoji' },
    { name: '安全清理', check: 'sanitizeHtml' }
  ];

  features.forEach(feature => {
    if (markdownRenderer.includes(feature.check)) {
      console.log(`   ✅ ${feature.name}`);
    } else {
      console.log(`   ❌ ${feature.name} - 功能缺失`);
    }
  });
} catch (error) {
  console.log('   ❌ 无法读取 markdown-renderer.ts');
}

// 预设配置检查
console.log('\n⚙️ 预设配置检查:');
try {
  const markdownRenderer = fs.readFileSync('lib/markdown-renderer.ts', 'utf8');
  
  const presets = ['basic', 'standard', 'full', 'safe'];
  presets.forEach(preset => {
    if (markdownRenderer.includes(preset)) {
      console.log(`   ✅ ${preset} 预设`);
    } else {
      console.log(`   ❌ ${preset} 预设 - 配置缺失`);
    }
  });
} catch (error) {
  console.log('   ❌ 无法读取预设配置');
}

console.log('\n🎯 集成状态总结:');
console.log('   📚 核心渲染器: lib/markdown-renderer.ts');
console.log('   🎨 增强组件: components/enhanced-markdown-renderer.tsx');
console.log('   🔧 兼容组件: components/markdown-renderer.tsx');
console.log('   📖 综合组件: components/comprehensive-markdown.tsx');
console.log('   🎪 测试页面: app/markdown-test/page.tsx');
console.log('   💅 样式文件: styles/enhanced-markdown.css');

console.log('\n✨ 使用方法:');
console.log('   1. 基础使用: import { MarkdownRenderer } from "./components/markdown-renderer"');
console.log('   2. 增强使用: import { EnhancedMarkdownRenderer } from "./components/enhanced-markdown-renderer"');
console.log('   3. 综合使用: import { ComprehensiveMarkdown } from "./components/comprehensive-markdown"');
console.log('   4. 测试页面: 访问 /markdown-test');

console.log('\n🚀 启用全部功能的配置:');
console.log('   preset="full" - 启用所有 Markdown 语法');
console.log('   enableSyntaxHighlight={true} - 启用代码语法高亮');
console.log('   enableMath={true} - 启用数学公式渲染');
console.log('   showLineNumbers={true} - 显示代码行号');

console.log('\n🎉 Markdown 渲染器集成验证完成！');
console.log('💡 现在你可以在项目中使用完整的 Markdown 功能了。');