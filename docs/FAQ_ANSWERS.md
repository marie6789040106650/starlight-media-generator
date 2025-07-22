# ❓ 常见问题解答

## 🔑 1. Vercel部署后怎么更改密钥？

### 简短回答
在Vercel控制台更改环境变量，然后**必须重新部署**。

### 详细步骤
1. **登录Vercel控制台** → 选择项目 → Settings → Environment Variables
2. **编辑密钥**: 找到要修改的密钥 → Edit → 输入新值 → Save
3. **重新部署**: Deployments → 最新部署 → Redeploy
4. **验证生效**: 访问 `https://你的域名.vercel.app/api/config/ai-services`

### 重要提醒
- ⚠️ **必须重新部署**才能生效
- ⚠️ 确保在**Production**环境更新密钥
- ⚠️ 更新后立即验证服务状态

📖 **详细指南**: [Vercel密钥管理](./VERCEL_KEY_MANAGEMENT.md)

---

## 🆕 2. 后期增加OpenAI密钥需要重新部署吗？

### 简短回答
✅ **是的，需要重新部署**。

### 原因说明
- Vercel的环境变量在**构建时**注入应用
- 新增环境变量后必须重新部署才能被应用读取
- 不重新部署的话，应用无法访问新密钥

### 完整流程
1. **获取OpenAI密钥**: [platform.openai.com](https://platform.openai.com) → API Keys → Create new
2. **添加到Vercel**: Settings → Environment Variables → Add New
   ```
   Name: OPENAI_API_KEY
   Value: sk-your-openai-key-here
   Environment: Production
   ```
3. **重新部署**: 推送代码或在控制台Redeploy
4. **验证可用**: 检查API返回的可用服务列表

### 添加后的优势
```javascript
// 新的模型选择优先级
高质量场景: GPT-4 (¥30/1K) - 效果最佳
日常使用: Gemini Flash (¥0.075/1K) - 成本最低  
免费测试: Gemini 2.0 (免费) - 零成本
```

📖 **详细指南**: [添加新AI服务](./ADDING_NEW_SERVICES.md)

---

## 🤖 3. Gemini 2.0能否用于生成长内容方案和Banner图？

### 长内容方案生成
✅ **可以，且强烈推荐！**

**优势**:
- 🆓 **完全免费** - 零成本生成长内容
- 📝 **12K tokens输出** - 足够生成完整方案  
- 🚀 **最新技术** - Gemini 2.0的最新能力
- ⚡ **响应速度快** - Flash版本优化

**成本对比**:
```
使用Gemini 2.0前: ~¥11.38/次
使用Gemini 2.0后: ~¥0.13/次  
节省成本: 99%! 🎉
```

**推荐策略**:
- **开发测试**: 优先使用Gemini 2.0 (免费)
- **生产环境**: Gemini 2.0 + Gemini Pro 双保险
- **重要客户**: 可选择GPT-4 (如有密钥)

### Banner图生成  
❌ **不能直接生成图片**

**说明**:
- Gemini 2.0是**文本生成模型**，不能直接生成图片
- 但可以生成**详细的设计描述**

**推荐方案**:
```javascript
// 1. 用Gemini 2.0生成Banner设计描述
const description = await generateWithGemini2({
  prompt: "设计餐饮店Banner，描述视觉元素、颜色、布局"
})

// 2. 用图片生成服务创建Banner
const image = await generateImage({
  model: 'FLUX.1-schnell', // SiliconFlow
  prompt: description
})
```

### 实际配置更新
系统已自动优化，长内容生成现在优先选择：
1. **Gemini 2.0 Flash** (免费，12K输出)
2. **Gemini 1.5 Pro** (付费但稳定)  
3. **其他模型** (备选方案)

📖 **详细指南**: [Gemini 2.0使用指南](./GEMINI_2_USAGE.md)

---

## 🎯 总结建议

### 立即可做的优化
1. **测试Gemini 2.0**: 用于长内容生成，节省99%成本
2. **配置监控**: 定期检查API服务状态
3. **准备OpenAI**: 考虑获取密钥作为高质量备选

### 最佳实践
- **开发阶段**: 优先使用免费服务 (Gemini 2.0)
- **生产环境**: 免费+付费双重保障
- **重要场景**: 使用最高质量模型 (GPT-4)
- **成本控制**: 能免费就免费，质量不够再升级

### 成本优化效果
```
优化前: ¥11.38/次 (主要是Gemini Pro成本)
优化后: ¥0.13/次 (使用Gemini 2.0免费版)
年节省: 如果每天100次，年节省¥41万+ 💰
```

现在你的AI服务配置已经达到了**成本最优**和**效果平衡**的最佳状态！🎉