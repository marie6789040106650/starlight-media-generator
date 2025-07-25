# EdgeOne 部署指南

## 🎯 部署要求

EdgeOne 静态部署对构建文件有严格的要求：
- **单文件最大 25MiB**：任何构建产物超过此限制都会部署失败
- **静态导出模式**：使用 `output: 'export'` 生成静态文件
- **包括所有文件**：客户端 JS、静态资源、预渲染页面等

## ✅ 已完成的优化

### 1. 大型库服务端化
```typescript
// ❌ 之前：客户端直接导入
import { jsPDF } from "jspdf"
import { Document, Packer } from "docx"
import { saveAs } from "file-saver"

// ✅ 现在：通过 API 调用
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  body: JSON.stringify({ content, storeName })
})
```

### 2. 动态导入优化
```typescript
// ✅ 客户端使用动态导入
const handleExport = async () => {
  const { jsPDF } = await import('jspdf');
  // 使用 jsPDF
};
```

### 3. Webpack 分包配置
```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      maxSize: 15000000, // 15MB 限制
      cacheGroups: {
        // 大型库独立分包
        docx: {
          test: /[\\/]node_modules[\\/]docx[\\/]/,
          name: 'docx',
          chunks: 'async',
          priority: 30,
        },
        // ... 其他配置
      },
    };
  }
}
```

### 4. 静态导出配置
```javascript
// next.config.mjs
const nextConfig = {
  // EdgeOne 静态部署配置
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['docx', 'jspdf', 'file-saver', 'html2canvas'],
}
```

## 🚀 部署流程

### 1. 部署前检查
```bash
# 运行完整的部署前检查
pnpm run deploy:check

# 或者分步检查
pnpm run cleanup        # 清理测试文件
pnpm build             # 构建项目
pnpm run build:analyze # 分析构建结果
```

### 2. 检查结果解读
```
✅ 构建文件大小符合要求
📊 总文件数: 153
📊 总大小: 4.15 MB
📊 最大文件: 1.32 MB (vendors chunk)
```

### 3. EdgeOne 控制台部署

#### 静态站点部署（推荐）
1. 登录 EdgeOne 控制台
2. 选择"静态站点部署"
3. 连接 GitHub 仓库：`https://github.com/marie6789040106650/starlight-media-generator.git`
4. 配置构建设置：
   - 构建命令：`pnpm install && pnpm build`
   - 输出目录：`out`
   - Node.js 版本：18.x
5. 部署发布

#### 手动上传部署
1. 本地构建静态文件：`pnpm build`
2. 将 `out` 目录打包上传到 EdgeOne 控制台
3. 配置静态站点托管
4. 发布部署

#### 重要说明
- **静态导出模式**：项目现在使用 `output: 'export'` 配置，生成纯静态文件
- **API 路由限制**：静态导出模式下，API 路由将不可用
- **输出目录**：构建产物位于 `out` 目录而非 `.next`
- **尾部斜杠**：启用 `trailingSlash: true` 确保路由兼容性

## 📊 构建分析结果

### 当前构建状态
- **总文件数**: 153
- **总大小**: 4.15 MB
- **最大文件**: 1.32 MB
- **超大文件**: 0 个 ✅

### 分包结果
- `vendors-08bbb39c74e4f91c.js`: 1.32 MB
- `jspdf.340f7eebd9487701.js`: 327 KB
- `html2canvas.a9fb3abfcf3ad199.js`: 193 KB

## 🛠️ 故障排除

### 如果出现超大文件
1. **检查直接导入**
   ```bash
   # 搜索客户端直接导入
   grep -r "import.*docx" --include="*.tsx" .
   ```

2. **使用动态导入**
   ```typescript
   // 替换直接导入
   const { Document } = await import('docx');
   ```

3. **移至服务端 API**
   ```typescript
   // 在 app/api/xxx/route.ts 中使用
   import { Document } from 'docx';
   ```

### 如果构建失败
1. **清理缓存**
   ```bash
   rm -rf .next
   pnpm run cleanup
   ```

2. **检查配置**
   ```bash
   # 验证 next.config.mjs
   node -e "console.log(require('./next.config.mjs'))"
   ```

3. **重新构建**
   ```bash
   pnpm build
   ```

## 📝 维护建议

### 定期检查
```bash
# 每次发布前运行
pnpm run deploy:check

# 监控构建大小变化
pnpm run build:analyze
```

### 代码审查要点
- [ ] 新增大型库是否在服务端使用
- [ ] 客户端是否使用动态导入
- [ ] 构建文件是否超过限制

### 性能监控
- 监控首次加载时间
- 检查代码分割效果
- 验证懒加载是否正常

## 🔗 相关文档

- [Next.js 代码分割](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Webpack 分包配置](https://webpack.js.org/plugins/split-chunks-plugin/)
- [EdgeOne 部署文档](https://cloud.tencent.com/document/product/1552)

## 📞 支持

如果遇到部署问题：
1. 运行 `pnpm run deploy:check` 获取详细报告
2. 查看 `deployment-report.json` 文件
3. 检查构建日志中的警告信息