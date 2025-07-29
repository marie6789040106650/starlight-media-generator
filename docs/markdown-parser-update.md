# Markdown 解析器更新文档

## 概述

为了解决 Markdown 格式在网页渲染和 Word 导出中的问题，我们对 Markdown 解析器和 Word 生成器进行了全面更新。这些更新确保了所有常见的 Markdown 格式能够在网页中正确渲染，并在导出到 Word 文档时保持格式一致。

## 支持的 Markdown 格式

现在，我们的系统支持以下 Markdown 格式：

### 文本格式
- **加粗**：使用 `**文本**` 或 `__文本__`
- *斜体*：使用 `*文本*` 或 `_文本_`
- ***加粗斜体***：使用 `***文本***` 或 `___文本___`
- ~~删除线~~：使用 `~~文本~~`
- `代码`：使用 `` `代码` ``

### 标题
- # 一级标题：使用 `# 标题文本`
- ## 二级标题：使用 `## 标题文本`
- ### 三级标题：使用 `### 标题文本`
- #### 四级标题：使用 `#### 标题文本`
- ##### 五级标题：使用 `##### 标题文本`
- ###### 六级标题：使用 `###### 标题文本`

### 列表
- 无序列表：使用 `- 项目` 或 `* 项目` 或 `+ 项目`
- 有序列表：使用 `1. 项目`
- 任务列表：使用 `- [ ] 未完成任务` 或 `- [x] 已完成任务`

### 引用块
- 基本引用：使用 `> 引用文本`
- 嵌套引用：使用 `>> 嵌套引用文本`

### 链接和图片
- [链接](https://example.com)：使用 `[链接文本](URL)`
- ![图片](https://example.com/image.jpg)：使用 `![替代文本](图片URL)`

### 表格
```
| 表头1 | 表头2 |
|-------|-------|
| 单元格1 | 单元格2 |
| 单元格3 | 单元格4 |
```

### 代码块
````
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

### 分隔线
使用 `---` 或 `***` 创建分隔线

## 技术实现

### Markdown 解析器更新
- 扩展了 `ParsedContent` 接口，增加了对引用块和任务列表的支持
- 增强了 `parseInlineFormatting` 函数，支持更多的内联格式（如删除线、链接等）
- 添加了对嵌套引用块的处理
- 优化了列表项的解析，包括任务列表

### Word 生成器更新
- 添加了 `createBlockquote` 和 `createFormattedBlockquote` 方法，用于处理引用块
- 增强了 `createFormattedParagraph` 方法，支持更多的文本格式
- 优化了列表项的处理，包括任务列表的复选框
- 添加了对链接和图片的处理

### 网页渲染组件
- 创建了 `MarkdownRenderer` 组件，使用 `react-markdown` 库在网页中渲染 Markdown
- 添加了自定义样式，确保渲染效果美观一致
- 支持代码高亮显示

## 测试页面

我们创建了一个专门的测试页面 `/markdown-test`，用于测试各种 Markdown 格式的渲染和导出效果。该页面提供了以下功能：

- Markdown 编辑器
- 实时预览
- 导出为 Word 文档
- Markdown 格式指南

## 使用方法

### 在网页中渲染 Markdown

```tsx
import MarkdownRenderer from '../components/markdown-renderer';

// 在组件中使用
<MarkdownRenderer content={markdownContent} />
```

### 导出 Markdown 为 Word 文档

```tsx
import { WordGenerator } from '../lib/export/word-generator';

// 导出为 Word
const generator = new WordGenerator();
await generator.generateWordDocument({
  content: markdownContent,
  storeName: '文档标题',
  filename: '导出文件名.docx'
});
```

## 注意事项

1. 表格在 Word 导出中可能会有一些格式限制
2. 复杂的嵌套格式（如引用块中的列表）可能需要额外处理
3. 代码块在 Word 中会转换为带背景色的文本块
4. 图片在 Word 中会显示为图片描述文本，而不是实际图片

## 后续优化方向

1. 改进表格在 Word 中的渲染效果
2. 支持在 Word 中插入实际图片
3. 添加更多自定义样式选项
4. 优化复杂嵌套结构的处理
5. 添加对数学公式的支持