# Word 样式模板规范

这个文件包含了从临时目录迁移的Word样式模板规范信息。

## 模板文件位置

原始模板文件位于: `temp/d/企业方案 Word 样式模板规范文档.docx`

## 使用说明

1. 该模板定义了企业方案文档的标准样式
2. 包含标题、正文、列表等样式规范
3. 用于Word导出功能的样式参考

## 注意事项

- 模板文件可能随时从temp目录删除
- 如需使用，请将模板文件复制到合适的位置
- 建议将模板文件放在 `public/templates/` 目录下

## 模板文件

模板文件已迁移到: `public/templates/企业方案 Word 样式模板规范文档.docx`

## 相关功能

- Word导出功能: `lib/export/word-generator.ts`
- 导出工具: `utils/export-utils.ts`

## 使用方式

```typescript
// 在代码中引用模板
const templatePath = '/templates/企业方案 Word 样式模板规范文档.docx';
```