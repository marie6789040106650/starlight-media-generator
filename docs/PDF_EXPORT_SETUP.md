# PDF导出功能完整指南

## 🎯 功能概述

本项目提供**智能PDF生成解决方案**，确保PDF文件与Word文件格式完全一致，支持直接导出PDF文件：

- ✅ **直接PDF生成**：优先使用后端LibreOffice服务
- ✅ **智能降级**：后端不可用时自动切换到Word转换
- ✅ **格式一致性**：PDF与Word文档保持完全相同的格式
- ✅ **中文完美支持**：无乱码，专业排版
- ✅ **用户体验优化**：自动检测服务状态，提供清晰指导

### 🔄 智能工作流程

```
用户请求 → 检测服务状态 → 选择最佳方案
    ↓
方案A: 后端可用 → 直接生成PDF → 立即下载
方案B: 后端不可用 → 生成Word → 用户转换指导
```

## 🛠️ 环境配置

### 方式一：本地安装LibreOffice

#### macOS
```bash
# 使用Homebrew安装
brew install --cask libreoffice

# 或运行自动安装脚本
./scripts/install-libreoffice.sh
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y libreoffice --no-install-recommends

# 或运行自动安装脚本
./scripts/install-libreoffice.sh
```

#### CentOS/RHEL
```bash
sudo yum install -y libreoffice-headless

# 或运行自动安装脚本
./scripts/install-libreoffice.sh
```

### 方式二：Docker部署

```bash
# 构建PDF服务容器
docker-compose -f docker/docker-compose.pdf.yml up -d

# 检查服务状态
docker-compose -f docker/docker-compose.pdf.yml ps
```

## 🔧 API接口

### 1. 生成PDF文档

**POST** `/api/generate-pdf`

```json
{
  "content": "# 标题\n\n内容...",
  "storeName": "店铺名称",
  "bannerImage": "https://example.com/banner.jpg",
  "filename": "文档名称.pdf",
  "includeWatermark": true
}
```

**响应**: PDF文件流

### 2. 服务健康检查

**GET** `/api/generate-pdf`

```json
{
  "status": "ok",
  "message": "PDF生成服务正常",
  "converter": "LibreOffice"
}
```

### 3. Word转PDF转换

**POST** `/api/convert-to-pdf`

上传Word文件，返回PDF文件。

## 🎯 前端使用

### 基本用法

```typescript
import { PDFGenerator } from '@/lib/export/pdf-generator'

const pdfGenerator = new PDFGenerator()

await pdfGenerator.generatePDFDocument({
  content: markdownContent,
  storeName: '店铺名称',
  bannerImage: 'https://example.com/banner.jpg',
  filename: '企业方案.pdf',
  includeWatermark: true
})
```

### 组件使用

```tsx
import { ExportActions } from '@/components/export-actions'

<ExportActions
  content={content}
  storeName={storeName}
  bannerImage={bannerImage}
/>
```

## 🧪 测试和验证

### 快速诊断工具

```bash
# 🔍 完整系统诊断（推荐）
pnpm run pdf:check

# 📊 功能测试
pnpm run pdf:test

# 🧪 PDF转换功能测试（新增）
node scripts/test-pdf-conversion.js

# 🌐 交互式测试
# 访问 http://localhost:3000/pdf-export-test
```

### PDF服务诊断脚本

新增的智能诊断工具 `scripts/check-pdf-service.js` 提供全面的系统检查：

#### 检查项目
- ✅ **LibreOffice安装状态**：版本检查和可用性验证
- ✅ **PDF转换功能**：实际转换测试
- ✅ **API端点状态**：后端服务连通性
- ✅ **系统环境**：权限、磁盘空间、字体支持

#### 诊断输出示例
```
🚀 PDF服务诊断工具
==================================================

🔍 检查LibreOffice安装状态...
✅ LibreOffice已安装: LibreOffice 7.4.2.3

🧪 测试PDF转换功能...
✅ PDF转换测试成功，文件大小: 15234 bytes

🌐 检查PDF生成API...
✅ API端点正常: PDF生成服务正常

📊 检查结果总结:
==============================
LibreOffice安装: ✅ 通过
PDF转换功能: ✅ 通过
API端点: ✅ 通过

🎉 所有检查都通过了！PDF生成服务已准备就绪。
```

### 功能测试脚本

#### 新增PDF转换功能测试

完整的PDF转换功能验证，包含健康检查、功能测试和性能测试：

```bash
# 运行PDF转换功能测试
node scripts/test-pdf-conversion.js
```

**测试特性**：
- 🏥 **健康检查**：验证PDF服务状态和LibreOffice可用性
- 📄 **功能测试**：实际生成PDF文件并验证输出质量
- ⚡ **性能测试**：多次测试统计成功率和平均响应时间
- 💾 **文件保存**：自动保存生成的PDF文件到test-output目录
- 🎨 **详细日志**：彩色输出和详细的测试进度信息

**测试内容**：
- 📄 **中文内容测试**：各种中文字符、标点符号
- 🎨 **格式测试**：标题、段落、列表、引用、代码块、表格
- 🖼️ **图片测试**：Banner图片插入和显示
- 📏 **布局测试**：页面设置、边距、字体大小
- 🔍 **质量验证**：文件完整性、大小合理性
- 📊 **性能分析**：响应时间统计和成功率监控

#### 传统功能测试

```bash
# 运行完整功能测试
pnpm run pdf:test
```

### 交互式测试页面

访问 `http://localhost:3000/pdf-export-test` 进行可视化测试：

- 🎛️ **实时配置**：店铺名称、文件名、Banner图片
- 📝 **内容编辑**：Markdown内容实时编辑
- 📊 **状态显示**：服务状态实时监控
- 🔄 **智能切换**：根据服务状态自动选择生成方式
- 💡 **操作指导**：详细的使用说明和转换指导

## 🔍 故障排除

### 常见问题

#### 1. LibreOffice未安装
**错误**: `PDF转换服务不可用，请安装LibreOffice`

**解决方案**:
```bash
# 运行安装脚本
./scripts/install-libreoffice.sh

# 或手动安装
# macOS: brew install --cask libreoffice
# Ubuntu: sudo apt-get install libreoffice
```

#### 2. 权限问题
**错误**: `Permission denied` 或文件写入失败

**解决方案**:
```bash
# 确保临时目录权限
sudo chmod 777 /tmp

# 或设置应用专用临时目录
mkdir -p ./temp/pdf && chmod 755 ./temp/pdf
```

#### 3. 内存不足
**错误**: 转换过程中内存溢出

**解决方案**:
- 增加服务器内存
- 设置Node.js内存限制: `node --max-old-space-size=4096`
- 分批处理大文档

#### 4. 字体问题
**错误**: PDF中中文显示异常

**解决方案**:
```bash
# Linux安装中文字体
sudo apt-get install fonts-noto-cjk

# macOS通常自带中文字体
# 确保系统字体配置正确
fc-cache -f
```

### 调试模式

启用详细日志：

```bash
# 设置环境变量
export DEBUG=pdf-generator
export LIBREOFFICE_DEBUG=1

# 启动应用
pnpm dev
```

## 📊 性能优化

### 1. 缓存策略
- 缓存生成的Word文档模板
- 复用LibreOffice进程
- 使用Redis缓存频繁请求

### 2. 并发控制
```typescript
// 限制并发转换数量
const semaphore = new Semaphore(3) // 最多3个并发转换

await semaphore.acquire()
try {
  await convertToPDF(wordFile)
} finally {
  semaphore.release()
}
```

### 3. 资源清理
- 及时删除临时文件
- 监控磁盘空间使用
- 设置文件过期时间

## 🚀 部署建议

### 生产环境

1. **使用专用PDF服务**
   ```yaml
   # docker-compose.yml
   services:
     pdf-service:
       image: your-app:latest
       environment:
         - PDF_SERVICE_ONLY=true
       volumes:
         - /tmp/pdf:/tmp/pdf
   ```

2. **负载均衡**
   - 多个PDF服务实例
   - 使用队列处理大量请求
   - 监控服务健康状态

3. **监控告警**
   - PDF生成成功率
   - 响应时间监控
   - 磁盘空间告警

### 开发环境

```bash
# 快速启动
pnpm dev

# 检查PDF服务
curl http://localhost:3000/api/generate-pdf

# 测试PDF生成
open http://localhost:3000/pdf-export-test
```

## � 5分日钟快速开始

### 第一步：检查环境
```bash
# 克隆项目后，运行诊断
pnpm install
pnpm run pdf:check
```

### 第二步：安装LibreOffice（如需要）
```bash
# macOS
brew install --cask libreoffice

# Ubuntu
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

### 第四步：测试功能
```bash
# 运行PDF转换功能测试（推荐）
node scripts/test-pdf-conversion.js

# 或运行传统功能测试
pnpm run pdf:test

# 如果一切正常，你会看到：
# ✅ 所有测试完成!
# ℹ️  生成的测试文件位于: ./test-output
```

## 📋 常用命令速查

```bash
# 🔍 诊断和检查
pnpm run pdf:check                    # 完整系统诊断
pnpm run pdf:test                     # 功能测试
node scripts/test-pdf-conversion.js   # PDF转换功能测试（新增）
pnpm run pdf:docker                   # 启动Docker服务

# 🛠️ 开发和构建
pnpm dev               # 开发服务器
pnpm build             # 构建项目
pnpm start             # 生产服务器

# 🧹 维护和清理
pnpm run cleanup       # 清理临时文件
pnpm run health-check  # 项目健康检查
```

## 📊 服务状态说明

| 状态 | 说明 | 用户体验 |
|------|------|----------|
| 🟢 **后端可用** | LibreOffice服务正常 | 直接下载PDF文件 |
| 🟡 **后端不可用** | LibreOffice未安装/配置 | 下载Word文档，手动转换 |
| 🔴 **服务异常** | 网络或系统错误 | 显示错误信息和解决方案 |

## 📝 更新日志

### v1.4.0 (2025-01-19) - PDF转换功能测试
- 🧪 **新增PDF转换功能测试脚本**：完整的PDF生成功能验证和性能测试
- 📊 **性能基准测试**：多次测试统计成功率和平均响应时间分析
- 💾 **自动文件保存**：测试生成的PDF文件自动保存到test-output目录
- 🎨 **彩色日志输出**：详细的测试进度信息和状态显示
- 🔍 **完整测试覆盖**：健康检查、功能测试、性能测试的完整流程
- 📚 **文档更新**：详细的测试脚本使用说明和示例输出

### v1.3.0 (2025-01-19) - 智能PDF生成
- ✨ **新增智能生成流程**：自动选择最佳PDF生成方式
- 🔧 **改进错误处理**：完善的降级机制和用户提示
- 📊 **服务状态检测**：实时监控后端服务可用性
- 🛠️ **诊断工具**：新增 `pdf:check` 命令进行系统诊断
- 📚 **文档完善**：详细的设置指南和故障排除
- 🐛 **修复问题**：中文字符显示、文件下载、临时文件清理

### v1.2.0 (2025-01-19) - Docker支持
- 🐳 **Docker部署**：支持容器化PDF服务
- 🔄 **API优化**：改进后端API的错误处理和响应
- 📱 **前端优化**：更好的用户界面和状态显示

### v1.1.0 (2025-01-19) - 后端服务
- 🖥️ **后端转换**：LibreOffice后端PDF转换服务
- 📄 **Word生成器**：完善的Word文档生成功能
- 🎨 **格式支持**：企业级文档格式和样式

### v1.0.0 (2025-01-19) - 基础功能
- 🎉 **项目初始化**：基础PDF生成功能
- 📝 **Markdown支持**：完整的Markdown解析和渲染
- 🇨🇳 **中文支持**：专业的中文排版和字体处理

## 🆘 获取帮助

### 自助诊断
1. **运行诊断**: `pnpm run pdf:check`
2. **查看日志**: 浏览器控制台 + 服务器日志
3. **测试功能**: 访问 `/pdf-export-test` 页面

### 常见问题
- 📖 **查看故障排除部分**：本文档详细的问题解决方案
- 🔍 **搜索已知问题**：检查项目Issues
- 💬 **社区支持**：参与项目讨论

### 技术支持
- 📧 **邮件支持**：查看项目README联系方式
- 🐛 **问题反馈**：提交Issue并附上诊断结果
- 📚 **文档贡献**：帮助改进文档和指南

---

💡 **提示**: 使用 `pnpm run pdf:check` 可以快速诊断大部分问题！