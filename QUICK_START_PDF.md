# PDF导出功能快速开始

## 🚀 5分钟快速上手

### 第一步：检查系统状态
```bash
# 安装依赖
pnpm install

# 检查PDF服务状态
pnpm run pdf:check
```

**期望输出**：
```
🚀 PDF服务诊断工具
✅ LibreOffice已安装: LibreOffice 7.4.2.3
✅ PDF转换测试成功
✅ API端点正常
🎉 所有检查都通过了！
```

### 第二步：安装LibreOffice（如需要）

如果诊断显示LibreOffice未安装：

```bash
# macOS
brew install --cask libreoffice

# Ubuntu/Debian
sudo apt install libreoffice-headless

# 或使用Docker
pnpm run pdf:docker
```

### 第三步：启动服务
```bash
# 启动开发服务器
pnpm dev

# 访问测试页面
open http://localhost:3000/pdf-export-test
```

### 第四步：测试PDF生成

#### 方式1：使用测试页面（推荐）
1. 访问 `http://localhost:3000/pdf-export-test`
2. 编辑文档内容
3. 配置店铺信息
4. 点击"生成PDF"按钮

#### 方式2：使用API
```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 企业方案\n\n## 项目概述\n\n这是一个测试文档。",
    "storeName": "星光传媒"
  }' \
  --output "企业方案.pdf"
```

#### 方式3：代码调用
```typescript
import { PDFGenerator } from '@/lib/export/pdf-generator'

const generator = new PDFGenerator()
await generator.generatePDFDocument({
  content: '# 企业方案\n\n## 项目概述\n\n这是一个测试文档。',
  storeName: '星光传媒',
  filename: '企业方案.pdf'
})
```

## 📊 服务状态说明

### 🟢 后端服务可用
- **显示**: "✅ 后端转换可用"
- **体验**: 点击按钮直接下载PDF文件
- **优势**: 无需手动转换，格式完美

### 🟡 后端服务不可用
- **显示**: "⚠️ 后端不可用，将使用Word转换"
- **体验**: 下载Word文档，按提示转换为PDF
- **优势**: 确保功能可用，格式一致

## 🔧 常见问题快速解决

### Q: 提示"LibreOffice未安装"
```bash
# 快速安装
brew install --cask libreoffice  # macOS
sudo apt install libreoffice     # Ubuntu

# 验证安装
libreoffice --version
```

### Q: PDF生成失败
```bash
# 运行诊断
pnpm run pdf:check

# 查看详细错误
pnpm run pdf:test
```

### Q: 中文显示异常
- **解决方案**: 使用Word转换方式，中文支持更好
- **操作**: 下载Word文档后用Microsoft Word转换为PDF

### Q: 网络连接失败
- **检查**: 确保开发服务器正在运行 (`pnpm dev`)
- **端口**: 确认访问 `http://localhost:3000`

## 📋 快速命令参考

```bash
# 🔍 诊断和检查
pnpm run pdf:check      # 系统诊断
pnpm run pdf:test       # 功能测试
pnpm run pdf:docker     # Docker服务

# 🛠️ 开发和构建
pnpm dev               # 开发服务器
pnpm build             # 构建项目
pnpm start             # 生产服务器

# 🧹 维护和清理
pnpm run cleanup       # 清理临时文件
```

## 🎯 最佳实践

### 开发环境
1. **优先使用诊断工具**: 遇到问题先运行 `pnpm run pdf:check`
2. **保持服务运行**: 开发时保持 `pnpm dev` 运行
3. **定期测试**: 使用测试页面验证功能正常

### 生产环境
1. **确保LibreOffice安装**: 在服务器上正确安装LibreOffice
2. **监控服务状态**: 定期检查PDF生成服务可用性
3. **备用方案**: 确保Word转换方式始终可用

### 用户体验
1. **状态提示**: 向用户清晰显示当前服务状态
2. **操作指导**: 提供详细的转换步骤说明
3. **错误处理**: 友好的错误提示和解决方案

## 🎉 成功标志

当你看到以下情况时，说明PDF功能已正常工作：

- ✅ 诊断工具显示"所有检查都通过了"
- ✅ 测试页面能正常生成PDF或Word文档
- ✅ API调用返回正确的文件
- ✅ 中文内容显示正常，格式专业

## 📚 更多帮助

- 📖 **详细文档**: `docs/PDF_EXPORT_SETUP.md`
- 🧪 **测试页面**: `http://localhost:3000/pdf-export-test`
- 🔧 **故障排除**: 运行 `pnpm run pdf:check` 获取诊断信息
- 💬 **技术支持**: 查看项目README获取联系方式

---

💡 **提示**: 如果遇到任何问题，首先运行 `pnpm run pdf:check` 进行诊断！