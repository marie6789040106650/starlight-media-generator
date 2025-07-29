# 部署指南

## 🚀 Vercel部署配置

### 1. 数据持久化问题解决

**问题**：用户运行时生成的新品类数据在重新部署后会丢失

**解决方案**：使用Vercel KV数据库进行持久化存储

### 2. 部署前准备

#### 2.1 安装依赖
```bash
pnpm install @vercel/kv
```

#### 2.2 创建Vercel KV数据库
1. 登录Vercel控制台
2. 进入项目设置
3. 选择"Storage"标签
4. 创建新的KV数据库
5. 复制环境变量

#### 2.3 配置环境变量
在Vercel项目设置中添加以下环境变量：
```
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
```

### 3. 数据迁移

#### 3.1 本地开发环境
```bash
# 复制环境变量到本地
cp .env.example .env.local
# 编辑.env.local，填入KV配置

# 运行数据迁移脚本
node scripts/migrate-to-kv.js
```

#### 3.2 验证迁移结果
```bash
# 检查存储健康状态
curl https://your-domain.vercel.app/api/health/storage
```

### 4. 部署流程

#### 4.1 推送代码
```bash
git add .
git commit -m "feat: 添加Vercel KV持久化存储"
git push origin main
```

#### 4.2 Vercel自动部署
- Vercel检测到代码变更
- 自动构建和部署
- 新版本上线

#### 4.3 验证部署
```bash
# 检查存储状态
curl https://your-domain.vercel.app/api/health/storage

# 测试品类管理
curl https://your-domain.vercel.app/api/category-management
```

### 5. 数据持久化机制

#### 5.1 存储策略
- **本地开发**：使用文件存储（config/*.json）
- **生产环境**：使用Vercel KV数据库
- **自动切换**：根据环境变量自动选择存储方式

#### 5.2 数据结构
```typescript
// KV存储的数据结构
{
  "category-stats": {
    customCategories: Record<string, string[]>,
    categoryUsageCount: Record<string, number>,
    pendingCategories: Record<string, number>,
    settings: { autoAddThreshold: number, lastUpdated: string }
  },
  "store-keywords": Record<string, string[]>
}
```

#### 5.3 数据同步
- 用户操作 → 实时更新KV数据库
- 部署更新 → 数据保持不变
- 多实例 → 共享同一KV数据库

### 6. 监控和维护

#### 6.1 健康检查
```bash
# 存储健康检查
GET /api/health/storage

# 响应示例
{
  "success": true,
  "data": {
    "health": { "storage": "kv", "accessible": true },
    "stats": {
      "categoryStats": {
        "customCategories": 5,
        "totalUsage": 127,
        "pendingCategories": 2
      },
      "storeKeywords": {
        "totalCategories": 12,
        "categories": ["餐饮", "美业", "科技", ...]
      }
    }
  }
}
```

#### 6.2 数据备份
```bash
# 定期备份KV数据到本地
node scripts/backup-kv-data.js
```

### 7. 故障排除

#### 7.1 常见问题
1. **KV连接失败**
   - 检查环境变量配置
   - 验证KV数据库状态

2. **数据丢失**
   - 检查KV数据库内容
   - 运行数据迁移脚本

3. **性能问题**
   - 监控KV请求频率
   - 优化缓存策略

#### 7.2 回滚方案
如果KV出现问题，系统会自动回退到本地文件存储：
```typescript
// 自动回退逻辑
if (this.isProduction && kvAvailable) {
  // 使用KV存储
} else {
  // 回退到本地文件存储
}
```

### 8. 性能优化

#### 8.1 缓存策略
- 内存缓存：频繁访问的数据
- KV缓存：持久化存储
- 智能刷新：按需更新缓存

#### 8.2 请求优化
- 批量操作：减少KV请求次数
- 异步处理：非阻塞数据更新
- 错误重试：提高可靠性

## 🎯 部署检查清单

- [ ] 安装@vercel/kv依赖
- [ ] 创建Vercel KV数据库
- [ ] 配置环境变量
- [ ] 运行数据迁移脚本
- [ ] 推送代码到GitHub
- [ ] 验证Vercel自动部署
- [ ] 测试存储健康状态
- [ ] 验证动态品类功能
- [ ] 设置监控和备份

## 📞 技术支持

如果遇到部署问题，请检查：
1. Vercel部署日志
2. 存储健康检查API
3. 环境变量配置
4. KV数据库状态