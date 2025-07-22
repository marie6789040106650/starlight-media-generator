# 🚀 Vercel部署配置指南

## 📋 部署流程

### 1. GitHub → Vercel 部署流程
```
本地开发 → GitHub推送 → Vercel自动部署 → 生产环境
```

### 2. 环境变量配置 (关键步骤)

在Vercel控制台配置以下环境变量：

#### 进入Vercel项目设置
1. 登录 [vercel.com](https://vercel.com)
2. 选择你的项目
3. 点击 **Settings** → **Environment Variables**

#### 添加AI服务密钥
```bash
# 必须配置的密钥 (你已有的)
SILICONFLOW_API_KEY = "你的SiliconFlow密钥"
GOOGLE_API_KEY = "AIzaSyBB1Wuf3bnv7KdyGPevGt7dyn7ak2yakR0"

# 可选配置的密钥 (暂时可以留空)
OPENAI_API_KEY = ""
ANTHROPIC_API_KEY = ""

# 其他必要配置
NODE_ENV = "production"
```

#### KV数据库配置 (如果使用)
```bash
KV_URL = "你的KV数据库URL"
KV_REST_API_URL = "你的KV REST API URL"  
KV_REST_API_TOKEN = "你的KV API Token"
KV_REST_API_READ_ONLY_TOKEN = "你的只读Token"
```

### 3. 部署后验证

#### 检查环境变量是否生效
访问: `https://你的域名.vercel.app/api/config/ai-services`

应该返回类似：
```json
{
  "success": true,
  "data": {
    "stats": {
      "availableServices": ["siliconflow", "google"],
      "enabledServices": 2
    }
  }
}
```

#### 测试AI服务
访问: `https://你的域名.vercel.app/api/health/storage`

### 4. 自动部署配置

#### vercel.json 配置
```json
{
  "functions": {
    "app/api/chat-stream/route.ts": {
      "runtime": "edge",
      "regions": ["hkg1", "sin1"]
    },
    "app/api/module2-plan-stream/route.ts": {
      "runtime": "edge", 
      "regions": ["hkg1", "sin1"]
    }
  },
  "env": {
    "SILICONFLOW_API_KEY": "@siliconflow_api_key",
    "GOOGLE_API_KEY": "@google_api_key"
  }
}
```

### 5. 部署检查清单

- [ ] ✅ GitHub代码已推送
- [ ] ✅ Vercel环境变量已配置
- [ ] ✅ 部署成功无错误
- [ ] ✅ AI服务API可用
- [ ] ✅ 配置接口返回正确状态

## 🔧 故障排除

### 1. 环境变量未生效
- 重新部署项目 (Vercel控制台点击 Redeploy)
- 检查变量名是否正确
- 确认变量值没有多余空格

### 2. API调用失败
- 检查密钥是否有效
- 查看Vercel Function日志
- 验证API端点是否正确

### 3. 部署失败
- 检查构建日志
- 确认依赖安装正确
- 验证TypeScript类型无误

## 💡 最佳实践

1. **分环境配置**: 开发/生产环境使用不同密钥
2. **密钥轮换**: 定期更新API密钥
3. **监控使用**: 关注API调用量和成本
4. **备用方案**: 配置多个AI服务提供商