# 文件清理日志

## 清理目标
废弃服务端生成水印、导出PDF、导出Word功能，保留前端浏览器导出功能。

## 移动记录

### 已移动的文件

| 原路径 | 新路径 | 移动时间 | 说明 |
|--------|--------|----------|------|
| lib/word-export-example.ts | temp-cleanup/word-export-example.ts | 2025-01-28 | Word导出示例文件 |
| lib/word-export-with-markdown.ts | temp-cleanup/word-export-with-markdown.ts | 2025-01-28 | Word导出Markdown处理 |
| lib/pdf-export-with-watermark.ts | temp-cleanup/pdf-export-with-watermark.ts | 2025-01-28 | PDF导出水印功能 |
| examples/ | temp-cleanup/examples/ | 2025-01-28 | 示例文件目录 |
| test-output/ | temp-cleanup/test-output/ | 2025-01-28 | 测试输出目录 |
| scripts/check-pdf-service.js | temp-cleanup/check-pdf-service.js | 2025-01-28 | PDF服务检查脚本 |
| scripts/quick-pdf-test.sh | temp-cleanup/quick-pdf-test.sh | 2025-01-28 | PDF测试脚本 |

### 待移动的文件

#### 1. 服务端导出相关文件
- `lib/word-export-example.ts` - Word导出示例
- `lib/word-export-with-markdown.ts` - Word导出Markdown处理
- `lib/pdf-export-with-watermark.ts` - PDF导出水印功能
- `examples/pdf-export-example.js` - PDF导出示例

#### 2. 测试和示例文件
- `test-output/` - 测试输出目录
- `examples/` - 示例文件目录
- `scripts/quick-pdf-test.sh` - PDF测试脚本
- `scripts/check-pdf-service.js` - PDF服务检查脚本

#### 3. 文档文件
- 各种README和文档文件中的过时内容

## 恢复指令

如果需要恢复文件，使用以下命令：
```bash
# 恢复单个文件
mv temp-cleanup/[文件名] [原路径]

# 恢复所有文件
./temp-cleanup/restore-all.sh
```

## 测试检查清单

- [ ] 启动开发服务器 `pnpm dev`
- [ ] 测试前端Word导出功能
- [ ] 测试前端PDF导出功能  
- [ ] 测试水印功能
- [ ] 检查构建是否正常 `pnpm build`
- [ ] 检查是否有引用错误

## 最终删除

测试通过后，执行：
```bash
rm -rf temp-cleanup
```