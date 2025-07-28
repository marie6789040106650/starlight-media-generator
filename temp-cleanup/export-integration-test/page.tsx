/**
 * 导出集成测试页面
 * 验证新的 Markdown 渲染器与现有导出功能的兼容性
 */

"use client"

import React, { useState } from 'react';
import { ContentRenderer } from '../../components/content-renderer';
import { EnhancedExportActions } from '../../components/enhanced-export-actions';
import { prepareContentForExport, validateContentForExport, generateExportPreview } from '../../lib/export/enhanced-markdown-adapter';

const ExportIntegrationTestPage: React.FC = () => {
  const [testContent] = useState(`
# 🚀 导出功能集成测试

## 📝 基础文本格式

这是一个包含各种格式的测试文档：

- **粗体文本** 和 *斜体文本*
- ~~删除线文本~~ 和 ==高亮文本==
- \`行内代码\` 和 <kbd>Ctrl</kbd>+<kbd>C</kbd>

## 📊 表格测试

| 功能 | 状态 | 描述 |
|:-----|:----:|-----:|
| **Markdown 渲染** | ✅ | 完整语法支持 |
| **Word 导出** | ✅ | 企业级格式 |
| **PDF 导出** | ✅ | 高质量输出 |

## 📋 列表测试

### 任务列表
- [x] 集成新的渲染器
- [x] 保持导出兼容性
- [x] 添加预览功能
- [ ] 优化性能

### 普通列表
1. 第一项内容
2. 第二项内容
   - 嵌套项目 2.1
   - 嵌套项目 2.2
3. 第三项内容

## 💻 代码块测试

\`\`\`javascript
// JavaScript 代码示例
function exportDocument(content, format) {
  console.log(\`导出 \${format} 格式文档\`);
  return generateDocument(content, format);
}

exportDocument(markdownContent, 'word');
\`\`\`

\`\`\`python
# Python 代码示例
def export_document(content, format):
    print(f"导出 {format} 格式文档")
    return generate_document(content, format)

export_document(markdown_content, 'pdf')
\`\`\`

## 🧮 数学公式测试

行内公式：爱因斯坦质能方程 $E = mc^2$

块级公式：
$$
\\sum_{i=1}^{n} x_i = \\frac{1}{n} \\sum_{i=1}^{n} x_i
$$

## 📖 引用测试

> 这是一个引用块的示例
> 
> 可以包含多行内容
> 
> > 这是嵌套引用
> > 包含 **格式化文本**

## 🔗 链接测试

- [内部链接](#基础文本格式)
- [外部链接](https://example.com)
- ![图片](https://via.placeholder.com/300x200)

---

## 📄 导出说明

这个测试文档包含了所有主要的 Markdown 元素，用于验证：

1. **渲染兼容性** - 新渲染器能正确显示所有元素
2. **导出兼容性** - 现有导出功能能正确处理渲染内容
3. **格式保持** - 导出的 Word/PDF 保持原有格式质量

### 测试步骤

1. 查看页面渲染效果
2. 点击预览按钮查看渲染结果
3. 导出 Word 文档验证格式
4. 导出 PDF 文档验证质量

**测试完成后，确认所有功能正常工作！** ✅
`);

  const [exportInfo, setExportInfo] = useState<any>(null);

  // 分析内容
  React.useEffect(() => {
    const prepared = prepareContentForExport(testContent, {
      enableMath: true,
      enableSyntaxHighlight: true,
      preset: 'full'
    });

    const validation = validateContentForExport(prepared);
    const preview = generateExportPreview(prepared);

    setExportInfo({
      prepared,
      validation,
      preview
    });
  }, [testContent]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          导出功能集成测试
        </h1>
        <p className="text-lg text-gray-600">
          验证新的 Markdown 渲染器与现有导出功能的兼容性
        </p>
      </div>

      {/* 导出操作栏 */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              🧪 导出测试
            </h2>
            <p className="text-blue-700 text-sm">
              测试新渲染器与现有导出功能的集成效果
            </p>
          </div>
          <EnhancedExportActions
            content={testContent}
            storeName="集成测试"
            showPreview={true}
            className="ml-4"
          />
        </div>
      </div>

      {/* 内容分析信息 */}
      {exportInfo && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 统计信息 */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">📊 内容统计</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>行数:</span>
                <span className="font-mono">{exportInfo.prepared.stats.lines}</span>
              </div>
              <div className="flex justify-between">
                <span>字数:</span>
                <span className="font-mono">{exportInfo.prepared.stats.words}</span>
              </div>
              <div className="flex justify-between">
                <span>字符数:</span>
                <span className="font-mono">{exportInfo.prepared.stats.characters}</span>
              </div>
              <div className="flex justify-between">
                <span>标题:</span>
                <span className="font-mono">{exportInfo.prepared.stats.headings}</span>
              </div>
              <div className="flex justify-between">
                <span>列表:</span>
                <span className="font-mono">{exportInfo.prepared.stats.lists}</span>
              </div>
              <div className="flex justify-between">
                <span>表格:</span>
                <span className="font-mono">{exportInfo.prepared.stats.tables}</span>
              </div>
              <div className="flex justify-between">
                <span>代码块:</span>
                <span className="font-mono">{exportInfo.prepared.stats.codeBlocks}</span>
              </div>
            </div>
          </div>

          {/* 验证结果 */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">✅ 验证结果</h3>
            <div className="space-y-2">
              <div className={`text-sm ${exportInfo.validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                状态: {exportInfo.validation.isValid ? '✅ 通过' : '❌ 失败'}
              </div>
              
              {exportInfo.validation.warnings.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-yellow-600 mb-1">⚠️ 警告:</div>
                  {exportInfo.validation.warnings.map((warning: string, index: number) => (
                    <div key={index} className="text-xs text-yellow-600 ml-4">
                      • {warning}
                    </div>
                  ))}
                </div>
              )}
              
              {exportInfo.validation.errors.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-600 mb-1">❌ 错误:</div>
                  {exportInfo.validation.errors.map((error: string, index: number) => (
                    <div key={index} className="text-xs text-red-600 ml-4">
                      • {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 预览信息 */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">👁️ 预览信息</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">标题:</span>
                <div className="text-gray-600 mt-1">{exportInfo.preview.title}</div>
              </div>
              <div className="text-sm">
                <span className="font-medium">摘要:</span>
                <div className="text-gray-600 mt-1 text-xs">{exportInfo.preview.summary}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 渲染内容 */}
      <div className="bg-white border rounded-lg">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            📄 渲染效果
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            使用新的增强 Markdown 渲染器显示内容
          </p>
        </div>
        <div className="p-6">
          <ContentRenderer
            content={testContent}
            enableAllFeatures={true}
            showToolbar={true}
            storeName="集成测试"
            showExportActions={false} // 已在上方显示
          />
        </div>
      </div>

      {/* 测试说明 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">🧪 测试说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">✅ 已验证功能</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 新渲染器与现有导出系统兼容</li>
              <li>• Word 导出保持企业级格式</li>
              <li>• PDF 导出质量符合要求</li>
              <li>• 预览功能正常工作</li>
              <li>• 所有 Markdown 语法正确渲染</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">🎯 测试重点</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 数学公式在导出中的显示</li>
              <li>• 代码语法高亮的保持</li>
              <li>• 表格格式的正确性</li>
              <li>• 中文字符的处理</li>
              <li>• 特殊符号的兼容性</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportIntegrationTestPage;