/**
 * Markdown 渲染器集成测试
 * 验证所有功能是否正确集成到现有系统中
 */

const { renderMarkdown, MarkdownPresets } = require('../../lib/markdown-renderer');

// 测试数据
const testMarkdown = `
# 完整功能测试

## 基础语法
**粗体** *斜体* ~~删除线~~ ==高亮==

## 列表
- 无序列表
- [x] 任务列表
- [ ] 未完成任务

1. 有序列表
2. 第二项

## 代码
\`行内代码\`

\`\`\`javascript
console.log("Hello, World!");
\`\`\`

## 表格
| 列1 | 列2 | 列3 |
|-----|:---:|----:|
| 左对齐 | 居中 | 右对齐 |

## 链接和图片
[链接](https://example.com)
![图片](https://via.placeholder.com/100)

## 引用
> 这是引用
> > 嵌套引用

## 数学公式
$E = mc^2$

$$
\\sum_{i=1}^{n} x_i
$$

## 脚注
文本[^1]

[^1]: 脚注内容

## 分隔线
---

## Emoji
:smile: :heart: :thumbsup:
`;

// 测试函数
function runTests() {
  console.log('🧪 开始 Markdown 渲染器集成测试...\n');

  // 测试 1: 基础渲染
  console.log('✅ 测试 1: 基础渲染');
  try {
    const basicResult = renderMarkdown('# 标题\n\n**粗体文本**');
    if (basicResult.includes('<h1') && basicResult.includes('<strong>')) {
      console.log('   ✓ 基础渲染正常');
    } else {
      console.log('   ✗ 基础渲染失败');
    }
  } catch (error) {
    console.log('   ✗ 基础渲染出错:', error.message);
  }

  // 测试 2: 预设配置
  console.log('\n✅ 测试 2: 预设配置');
  try {
    const presets = ['basic', 'standard', 'full', 'safe'];
    presets.forEach(preset => {
      const result = renderMarkdown('**测试**', MarkdownPresets[preset]);
      if (result.includes('<strong>')) {
        console.log(`   ✓ ${preset} 预设正常`);
      } else {
        console.log(`   ✗ ${preset} 预设失败`);
      }
    });
  } catch (error) {
    console.log('   ✗ 预设配置测试出错:', error.message);
  }

  // 测试 3: 完整功能
  console.log('\n✅ 测试 3: 完整功能');
  try {
    const fullResult = renderMarkdown(testMarkdown, MarkdownPresets.full);
    
    const features = [
      { name: '标题', check: '<h1' },
      { name: '粗体', check: '<strong>' },
      { name: '斜体', check: '<em>' },
      { name: '删除线', check: '<del>' },
      { name: '列表', check: '<ul>' },
      { name: '有序列表', check: '<ol>' },
      { name: '代码块', check: '<pre>' },
      { name: '表格', check: '<table>' },
      { name: '链接', check: '<a href=' },
      { name: '图片', check: '<img src=' },
      { name: '引用', check: '<blockquote>' },
      { name: '分隔线', check: '<hr>' }
    ];

    features.forEach(feature => {
      if (fullResult.includes(feature.check)) {
        console.log(`   ✓ ${feature.name} 功能正常`);
      } else {
        console.log(`   ✗ ${feature.name} 功能失败`);
      }
    });
  } catch (error) {
    console.log('   ✗ 完整功能测试出错:', error.message);
  }

  // 测试 4: 安全性
  console.log('\n✅ 测试 4: 安全性');
  try {
    const dangerousInput = `
<script>alert('XSS')</script>
<div onclick="alert('危险')">点击我</div>
**安全的内容**
`;
    
    const safeResult = renderMarkdown(dangerousInput, MarkdownPresets.safe);
    
    if (!safeResult.includes('<script>') && !safeResult.includes('onclick=')) {
      console.log('   ✓ XSS 防护正常');
    } else {
      console.log('   ✗ XSS 防护失败');
    }
    
    if (safeResult.includes('<strong>')) {
      console.log('   ✓ 安全内容保留正常');
    } else {
      console.log('   ✗ 安全内容保留失败');
    }
  } catch (error) {
    console.log('   ✗ 安全性测试出错:', error.message);
  }

  // 测试 5: 性能测试
  console.log('\n✅ 测试 5: 性能测试');
  try {
    const largeContent = Array(100).fill(testMarkdown).join('\n\n');
    const startTime = Date.now();
    
    renderMarkdown(largeContent, MarkdownPresets.full);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ✓ 大文档渲染耗时: ${duration}ms`);
    
    if (duration < 5000) {
      console.log('   ✓ 性能测试通过');
    } else {
      console.log('   ⚠ 性能可能需要优化');
    }
  } catch (error) {
    console.log('   ✗ 性能测试出错:', error.message);
  }

  console.log('\n🎉 Markdown 渲染器集成测试完成！');
}

// 运行测试
if (require.main === module) {
  runTests();
}

module.exports = { runTests };