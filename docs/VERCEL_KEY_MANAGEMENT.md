# 🔑 Vercel密钥管理指南

## 📋 部署后更改密钥

### 方法1: Vercel控制台 (推荐)

#### 步骤1: 登录Vercel控制台
1. 访问 [vercel.com](https://vercel.com)
2. 登录你的账户
3. 选择你的项目

#### 步骤2: 修改环境变量
1. 点击 **Settings** 标签
2. 选择 **Environment Variables**
3. 找到要修改的密钥 (如 `GOOGLE_API_KEY`)
4. 点击右侧的 **Edit** 按钮
5. 输入新的密钥值
6. 点击 **Save** 保存

#### 步骤3: 重新部署 (重要!)
```bash
# 方法1: 在Vercel控制台
点击 "Deployments" → 最新部署 → "Redeploy"

# 方法2: 推送代码触发部署
git commit --allow-empty -m "trigger redeploy for env update"
git push origin main
```

### 方法2: Vercel CLI

#### 安装Vercel CLI
```bash
npm i -g vercel
vercel login
```

#### 更新环境变量
```bash
# 添加或更新环境变量
vercel env add GOOGLE_API_KEY production
# 输入新的密钥值

# 查看所有环境变量
vercel env ls

# 删除环境变量
vercel env rm GOOGLE_API_KEY production
```

#### 重新部署
```bash
vercel --prod
```

### 方法3: 通过项目API (高级)

```bash
# 使用Vercel API更新环境变量
curl -X PATCH "https://api.vercel.com/v9/projects/YOUR_PROJECT_ID/env/ENV_VAR_ID" \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "new_api_key_value"}'
```

## ⚠️ 重要注意事项

### 1. 必须重新部署
- 环境变量更改后**必须重新部署**才能生效
- 不重新部署的话，应用仍使用旧密钥

### 2. 生产环境vs开发环境
- 确保在正确的环境 (Production/Preview/Development) 更新密钥
- 通常只需要更新 Production 环境

### 3. 验证更改
```bash
# 部署后验证密钥是否生效
curl https://你的域名.vercel.app/api/config/ai-services

# 应该显示新的服务状态
```

## 🔄 密钥轮换最佳实践

### 1. 定期轮换
- 建议每3-6个月轮换一次API密钥
- 重要项目建议每月轮换

### 2. 轮换流程
```bash
# 1. 在AI服务商处生成新密钥
# 2. 在Vercel更新环境变量
# 3. 重新部署验证
# 4. 删除旧密钥
```

### 3. 监控告警
- 设置密钥过期提醒
- 监控API调用失败率
- 及时发现密钥问题

## 🚨 应急处理

### 密钥泄露处理
```bash
# 1. 立即在AI服务商处撤销泄露的密钥
# 2. 生成新密钥
# 3. 在Vercel更新环境变量
# 4. 立即重新部署
# 5. 验证服务正常
```

### 密钥失效处理
```bash
# 1. 检查密钥状态
curl https://你的域名.vercel.app/api/config/ai-services

# 2. 更新失效的密钥
# 3. 重新部署
# 4. 验证恢复正常
```