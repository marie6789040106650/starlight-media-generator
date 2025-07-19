# PDF转换功能测试指南

## 🎯 概述

本文档详细介绍了新增的PDF转换功能测试脚本 `scripts/test-pdf-conversion.js`，该脚本提供了完整的PDF生成功能验证、性能测试和故障排除功能。

## 🚀 快速开始

### 运行测试

```bash
# 方式一：直接运行测试脚本
node scripts/test-pdf-conversion.js

# 方式二：使用npm脚本
pnpm run pdf:test

# 方式三：指定测试地址
BASE_URL=http://localhost:3001 node scripts/test-pdf-conversion.js
```

### 预期输出

```
🧪 PDF转换功能测试
==================
ℹ️  检查PDF服务健康状态...
✅ PDF服务正常运行
ℹ️  转换器: LibreOffice
ℹ️  命令: libreoffice
ℹ️  版本: LibreOffice 7.4.2.3

ℹ️  测试PDF生成功能...
✅ PDF生成成功
✅ PDF文件已保存: ./test-output/test-1642567890123.pdf
ℹ️  文件大小: 245760 bytes

ℹ️  执行性能测试...
ℹ️  执行第 1/3 次测试...
✅ 测试 1 完成: 3245ms, 245760 bytes
ℹ️  执行第 2/3 次测试...
✅ 测试 2 完成: 2987ms, 246123 bytes
ℹ️  执行第 3/3 次测试...
✅ 测试 3 完成: 3156ms, 245892 bytes

ℹ️  性能测试结果:
ℹ️  成功率: 3/3 (100.0%)
ℹ️  平均响应时间: 3129ms

✅ 所有测试完成!
ℹ️  生成的测试文件位于: ./test-output
ℹ️    - test-1642567890123.pdf
ℹ️    - performance-test-1.pdf
ℹ️    - performance-test-2.pdf
ℹ️    - performance-test-3.pdf
```

## 🔧 功能特性

### 1. 健康检查 (Health Check)

**功能**：验证PDF服务的可用性和配置状态

**检查项目**：
- PDF服务API端点连通性
- LibreOffice安装状态和版本信息
- 服务配置参数验证

**输出信息**：
- 服务状态（正常/异常）
- 转换器类型和版本
- 可用命令路径

### 2. 功能测试 (Functional Test)

**功能**：实际生成PDF文件并验证输出质量

**测试内容**：
- 复杂Markdown内容解析
- 中文字符支持验证
- 文档格式和布局测试
- 文件完整性检查

**测试数据**：
```markdown
# 企业方案测试文档

## 1. 项目概述
这是一个用于测试PDF转换功能的示例文档。

### 1.1 功能特性
- **Word文档生成**：支持复杂的文档结构
- **PDF转换**：使用LibreOffice进行高质量转换
- **中文支持**：完美支持中文字符显示

### 1.2 技术规格
| 项目 | 规格 |
|------|------|
| 页面大小 | A4 (210×297mm) |
| 字体 | 思源黑体/思源宋体 |
| 行距 | 1.5倍 |

## 2. 测试内容

### 2.1 格式测试
这是**加粗文本**和*斜体文本*的示例。

### 2.2 列表测试
- 项目一
- 项目二
  - 子项目A
  - 子项目B
- 项目三

### 2.3 引用块测试
> 这是一个引用块的示例
> 用于测试引用格式的显示效果

### 2.4 代码块测试
```javascript
function testPdfConversion() {
  console.log('PDF转换测试');
  return true;
}
```

## 3. 结论
如果您能看到这个PDF文档，说明转换功能正常工作！

---
*本文档由星光传媒AI智能生成*
```

### 3. 性能测试 (Performance Test)

**功能**：多次测试统计成功率和响应时间

**测试参数**：
- 测试次数：3次
- 测试间隔：1秒
- 超时时间：30秒

**统计指标**：
- 成功率百分比
- 平均响应时间
- 文件大小统计
- 错误率分析

## 📊 配置选项

### 环境变量

```bash
# 测试服务地址（默认：http://localhost:3000）
BASE_URL=http://localhost:3001

# 请求超时时间（默认：30000ms）
TIMEOUT=45000

# 输出目录（默认：./test-output）
OUTPUT_DIR=./custom-output
```

### 脚本配置

```javascript
// 配置对象
const CONFIG = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  OUTPUT_DIR: './test-output'
}

// 测试数据配置
const TEST_DATA = {
  content: '...',           // Markdown内容
  storeName: '测试店铺',     // 店铺名称
  filename: 'pdf-conversion-test.pdf',  // 文件名
  includeWatermark: true    // 是否包含水印
}
```

## 🔍 故障排除

### 常见错误及解决方案

#### 1. 服务连接失败

**错误信息**：
```
❌ 健康检查失败: Request timeout
```

**解决方案**：
1. 确认开发服务器已启动：`pnpm dev`
2. 检查端口是否正确：默认3000端口
3. 验证防火墙设置
4. 尝试使用不同的BASE_URL

#### 2. PDF服务不可用

**错误信息**：
```
❌ PDF服务不可用
❌ 错误: PDF转换服务不可用，请安装LibreOffice
```

**解决方案**：
1. 安装LibreOffice：
   ```bash
   # macOS
   brew install --cask libreoffice
   
   # Ubuntu
   sudo apt-get install libreoffice-headless
   
   # 或使用安装脚本
   bash scripts/install-libreoffice.sh
   ```

2. 验证安装：
   ```bash
   libreoffice --version
   ```

3. 重启服务：
   ```bash
   pnpm dev
   ```

#### 3. PDF生成失败

**错误信息**：
```
❌ PDF生成失败: HTTP 500
❌ 错误: PDF转换失败，请稍后重试
```

**解决方案**：
1. 检查服务器日志
2. 验证临时目录权限：
   ```bash
   chmod 777 /tmp
   ```
3. 检查系统内存是否充足
4. 重启LibreOffice服务

#### 4. 文件保存失败

**错误信息**：
```
❌ 响应不是PDF格式
❌ Content-Type: text/html
```

**解决方案**：
1. 检查API响应内容
2. 验证请求参数格式
3. 确认服务端错误处理

### 调试技巧

#### 1. 启用详细日志

```bash
# 设置调试模式
DEBUG=pdf-test node scripts/test-pdf-conversion.js
```

#### 2. 单步调试

```javascript
// 在脚本中添加调试信息
console.log('请求数据:', JSON.stringify(TEST_DATA, null, 2))
console.log('响应头:', response.headers)
console.log('响应状态:', response.statusCode)
```

#### 3. 网络抓包

```bash
# 使用curl测试API
curl -X GET http://localhost:3000/api/generate-pdf

curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"content":"测试","storeName":"测试店铺"}'
```

## 📈 性能基准

### 标准性能指标

| 指标 | 期望值 | 说明 |
|------|--------|------|
| 成功率 | ≥95% | PDF生成成功率 |
| 响应时间 | ≤5秒 | 平均PDF生成时间 |
| 文件大小 | 100KB-1MB | 标准文档大小范围 |
| 内存使用 | ≤512MB | LibreOffice进程内存 |

### 性能优化建议

1. **系统配置**：
   - 确保充足的内存（推荐≥2GB）
   - 使用SSD存储提升I/O性能
   - 优化临时目录位置

2. **应用配置**：
   - 启用LibreOffice进程复用
   - 配置合理的超时时间
   - 实现请求队列管理

3. **监控告警**：
   - 设置响应时间告警
   - 监控成功率指标
   - 跟踪资源使用情况

## 🔄 集成到CI/CD

### GitHub Actions示例

```yaml
name: PDF Conversion Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  pdf-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Install LibreOffice
      run: |
        sudo apt-get update
        sudo apt-get install -y libreoffice-headless
        
    - name: Start application
      run: |
        pnpm build
        pnpm start &
        sleep 10
        
    - name: Run PDF conversion tests
      run: node scripts/test-pdf-conversion.js
      
    - name: Upload test artifacts
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: pdf-test-results
        path: test-output/
```

### Docker测试环境

```dockerfile
FROM node:18-slim

# 安装LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice-headless \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 运行测试
CMD ["node", "scripts/test-pdf-conversion.js"]
```

## 📚 扩展开发

### 添加新的测试用例

```javascript
// 在TEST_DATA中添加新的测试内容
const ADVANCED_TEST_DATA = {
  content: `
# 高级功能测试

## 表格测试
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |

## 数学公式测试
E = mc²

## 特殊字符测试
© ® ™ § ¶ † ‡ • … ‰ ′ ″
  `,
  storeName: '高级测试店铺',
  filename: 'advanced-test.pdf'
}
```

### 自定义测试函数

```javascript
// 添加自定义测试函数
async function customTest() {
  logInfo('执行自定义测试...')
  
  try {
    // 自定义测试逻辑
    const result = await performCustomTest()
    logSuccess('自定义测试通过')
    return true
  } catch (error) {
    logError(`自定义测试失败: ${error.message}`)
    return false
  }
}

// 在主函数中调用
async function main() {
  // ... 现有测试
  
  // 添加自定义测试
  await customTest()
}
```

### 测试报告生成

```javascript
// 生成测试报告
function generateTestReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    },
    details: results
  }
  
  fs.writeFileSync('./test-output/report.json', JSON.stringify(report, null, 2))
  logInfo('测试报告已生成: ./test-output/report.json')
}
```

## 🎯 最佳实践

### 1. 测试策略

- **定期执行**：每次代码变更后运行测试
- **环境隔离**：使用独立的测试环境
- **数据清理**：测试后及时清理临时文件
- **结果验证**：不仅检查成功状态，还要验证输出质量

### 2. 监控告警

- **成功率监控**：设置成功率低于95%的告警
- **响应时间监控**：设置响应时间超过5秒的告警
- **资源监控**：监控磁盘空间和内存使用

### 3. 故障处理

- **自动重试**：对临时失败进行自动重试
- **降级处理**：PDF服务不可用时提供Word导出
- **用户通知**：及时通知用户服务状态变化

## 📞 技术支持

### 获取帮助

1. **查看日志**：检查详细的测试输出和错误信息
2. **运行诊断**：使用 `pnpm run pdf:check` 进行系统诊断
3. **查阅文档**：参考 [PDF导出设置指南](./PDF_EXPORT_SETUP.md)
4. **社区支持**：在项目Issues中寻求帮助

### 常见问题FAQ

**Q: 测试脚本运行很慢怎么办？**
A: 检查LibreOffice安装和系统资源，考虑增加内存或使用SSD。

**Q: 生成的PDF文件在哪里？**
A: 默认保存在 `./test-output/` 目录下，可通过OUTPUT_DIR环境变量修改。

**Q: 如何跳过性能测试？**
A: 修改脚本中的testCount变量或注释掉performanceTest()调用。

**Q: 测试失败但手动操作正常？**
A: 检查测试环境与手动操作环境的差异，特别是端口和配置。

---

💡 **提示**: 定期运行PDF转换测试可以及早发现问题，确保生产环境的稳定性！