# LibreOffice PDF转换服务

这是一个基于LibreOffice的Word到PDF转换服务，为星光传媒项目提供高质量的PDF文档生成功能。

## 🚀 快速开始

### 1. 安装LibreOffice

```bash
# 自动安装（推荐）
pnpm run pdf:install

# 或手动安装
sudo apt-get install libreoffice-core libreoffice-writer fonts-noto-cjk
```

### 2. 启动服务

```bash
# 开发模式
pnpm run dev

# 生产模式
pnpm run build
pnpm run start
```

### 3. 测试功能

```bash
# 快速测试
pnpm run pdf:test-quick

# 详细测试
pnpm run pdf:test
```

## 📋 功能特性

### ✅ 核心功能
- **Word到PDF转换**: 使用LibreOffice进行高质量转换
- **智能降级机制**: 服务不可用时自动降级到Word导出
- **中文字符支持**: 完美支持中文字符显示
- **企业级模板**: 严格按照专业文档标准设计
- **多重错误处理**: 完善的错误处理和重试机制

### 🎯 技术特点
- **多命令支持**: 自动检测可用的LibreOffice命令
- **临时文件管理**: 自动清理临时文件，防止磁盘空间泄露
- **性能优化**: 支持并发转换和缓存机制
- **容器化部署**: 提供完整的Docker部署方案
- **健康检查**: 内置服务健康检查和监控

## 🏗️ 架构设计

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端组件      │───▶│   PDF生成API     │───▶│  LibreOffice    │
│ ExportActions   │    │ /api/generate-pdf│    │   转换引擎      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌──────────────────┐    ┌─────────────────┐
         │              │   Word生成器     │    │   临时文件管理   │
         │              │ WordGenerator    │    │  自动清理机制   │
         │              └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   配置管理      │
│ copy-settings   │
└─────────────────┘
```

## 📁 文件结构

```
├── app/api/generate-pdf/
│   └── route.ts                 # PDF生成API端点
├── lib/export/
│   ├── word-generator.ts        # Word文档生成器
│   ├── pdf-generator.ts         # PDF生成器（智能降级）
│   ├── word-to-pdf-generator.ts # Word转PDF转换器
│   ├── markdown-parser.ts       # Markdown解析器
│   └── style-config.ts          # 样式配置
├── components/
│   └── export-actions.tsx       # 导出操作组件
├── scripts/
│   ├── install-libreoffice.sh   # LibreOffice安装脚本
│   ├── test-pdf-conversion.js   # PDF转换测试脚本
│   └── quick-pdf-test.sh        # 快速测试脚本
├── docker/
│   ├── libreoffice.Dockerfile   # Docker镜像配置
│   └── docker-compose.pdf.yml   # Docker Compose配置
└── docs/
    └── LIBREOFFICE_PDF_SETUP.md # 完整部署指南
```

## 🔧 API接口

### 生成PDF

**POST** `/api/generate-pdf`

```json
{
  "content": "# 标题\n\n内容...",
  "storeName": "店铺名称",
  "bannerImage": "https://example.com/banner.jpg",
  "filename": "custom-name.pdf",
  "includeWatermark": true
}
```

**响应**: PDF文件流

### 健康检查

**GET** `/api/generate-pdf`

```json
{
  "status": "ok",
  "message": "PDF生成服务正常",
  "converter": "LibreOffice",
  "version": "LibreOffice 7.x.x"
}
```

## 🐳 Docker部署

### 单容器部署

```bash
# 构建镜像
docker build -f docker/libreoffice.Dockerfile -t starlight-pdf .

# 运行容器
docker run -d \
  --name starlight-pdf \
  -p 3000:3000 \
  -e NODE_ENV=production \
  starlight-pdf
```

### Docker Compose部署

```bash
# 启动服务栈
pnpm run pdf:docker

# 查看日志
pnpm run pdf:docker-logs

# 停止服务
pnpm run pdf:docker-stop
```

## 🧪 测试和验证

### 快速测试

```bash
# 运行快速测试
pnpm run pdf:test-quick

# 预期输出
✅ PDF服务正常运行
✅ PDF生成成功
✅ 所有测试通过! 🎉
```

### 详细测试

```bash
# 运行完整测试套件
pnpm run pdf:test

# 包含以下测试：
# - 健康检查
# - 基本功能测试
# - 性能测试
# - 错误处理测试
```

### 手动测试

```bash
# 使用curl测试
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 测试文档\n\n这是一个**测试**。",
    "storeName": "测试店铺"
  }' \
  --output test.pdf
```

## 🔍 故障排除

### 常见问题

#### LibreOffice未安装
```bash
# 错误: command not found: libreoffice
pnpm run pdf:install
```

#### 权限问题
```bash
# 错误: Permission denied
sudo chmod 1777 /tmp
```

#### 内存不足
```bash
# 错误: Cannot allocate memory
# 增加swap空间或升级服务器配置
```

#### 中文字符问题
```bash
# 安装中文字体
sudo apt-get install fonts-noto-cjk fonts-wqy-microhei
```

### 调试模式

```bash
# 启用详细日志
export DEBUG=pdf:*
export PDF_DEBUG_KEEP_TEMP=1
pnpm run dev
```

## 📊 性能优化

### 系统级优化

```bash
# 调整文件描述符限制
ulimit -n 65536

# 使用内存文件系统
sudo mount -t tmpfs -o size=512M tmpfs /tmp/pdf-conversion
```

### 应用级优化

```javascript
// 环境变量配置
PDF_CONVERSION_TIMEOUT=45000
PDF_MAX_RETRIES=3
LIBREOFFICE_HEADLESS=1
SAL_USE_VCLPLUGIN=svp
```

## 📈 监控和维护

### 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/api/generate-pdf

# 监控转换性能
curl http://localhost:3000/api/generate-pdf/metrics
```

### 定期维护

```bash
# 清理临时文件
find /tmp -name "pdf-conversion-*" -mtime +1 -delete

# 重启服务
systemctl restart your-app-service
```

## 🔗 相关文档

- [完整部署指南](docs/LIBREOFFICE_PDF_SETUP.md)
- [API文档](docs/PDF_EXPORT_SETUP.md)
- [Docker部署指南](docker/README.md)
- [故障排除指南](docs/TROUBLESHOOTING.md)

## 📞 技术支持

遇到问题时请：

1. 查看[故障排除指南](docs/LIBREOFFICE_PDF_SETUP.md#故障排除)
2. 运行测试脚本获取详细信息
3. 检查系统日志和应用日志
4. 提交Issue时请包含完整的错误信息

## 🎯 使用示例

### 在React组件中使用

```tsx
import { ExportActions } from '@/components/export-actions'

function MyComponent() {
  return (
    <ExportActions
      content={markdownContent}
      storeName="我的店铺"
      bannerImage="/images/banner.jpg"
      disabled={false}
    />
  )
}
```

### 直接API调用

```javascript
async function generatePDF(content, storeName) {
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      storeName,
      includeWatermark: true
    })
  })
  
  if (response.ok) {
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.pdf'
    a.click()
  }
}
```

---

**版本**: 1.0.0  
**最后更新**: 2025-01-19  
**维护者**: 星光传媒技术团队