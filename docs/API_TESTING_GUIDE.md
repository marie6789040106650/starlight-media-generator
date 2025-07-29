# API端点测试指南

## 概述

本文档介绍如何测试项目中的模块化API端点，特别是模块2（流式方案生成）和模块3（Banner设计方案）的功能。

## 测试脚本

### 位置
```
tests/api/api-endpoints.test.js
```

### 运行方式
```bash
# 直接运行测试脚本
node tests/api/api-endpoints.test.js

# 或者使用npm脚本（如果配置了）
pnpm run test:api
```

## 测试内容

### 1. 模块2 API测试 (`/api/module2-plan-stream`)

**功能**: 流式生成8个板块的IP打造方案

**测试要点**:
- 流式响应处理
- Server-Sent Events格式验证
- 数据块接收统计
- 错误处理验证

**请求格式**:
```javascript
{
  storeName: "川味小厨",
  storeCategory: "餐饮",
  storeLocation: "成都春熙路",
  businessDuration: "3年",
  storeFeatures: ["正宗川菜", "家常口味", "实惠价格"],
  ownerName: "张",
  ownerFeatures: ["热情好客", "厨艺精湛", "本地人"],
  confirmedStoreKeywords: [
    { keyword: "正宗川菜", description: "传统四川菜系，口味地道" }
  ],
  confirmedOwnerKeywords: [
    { keyword: "川菜师傅", description: "专业川菜烹饪技艺" }
  ]
}
```

**预期响应**: 流式数据块，包含8个板块的完整方案内容

### 2. 模块3 API测试 (`/api/module3-banner`)

**功能**: 生成Banner设计方案

**测试场景**:
1. **完整数据格式**: 传入模块1和模块2的完整数据
2. **直接数据格式**: 直接传入模块3所需的最小数据集

**完整数据格式**:
```javascript
{
  module1Data: { /* 模块1完整数据 */ },
  module2Data: { /* 模块2完整数据 */ }
}
```

**直接数据格式**:
```javascript
{
  storeName: "川味小厨",
  storeCategory: "餐饮",
  storeLocation: "成都春熙路",
  confirmedStoreKeywords: [
    { keyword: "正宗川菜", description: "传统四川菜系，口味地道" }
  ],
  brandSlogan: "正宗川味，家的味道",
  ipTags: ["川菜师傅", "热情老板", "本地达人"],
  contentColumns: [
    { title: "川菜说", description: "分享正宗川菜制作技巧" }
  ]
}
```

**预期响应**: Banner设计方案的JSON数据

## 环境要求

### 必需配置
```bash
# 环境变量配置
SILICONFLOW_API_KEY=your_api_key_here
```

### 服务状态
- 开发服务器运行在 `http://localhost:3000`
- 模块2需要AI API密钥才能正常工作
- 模块3可以在没有AI API密钥的情况下工作（使用本地数据处理）

## 测试输出示例

### 成功输出
```
🚀 开始API端点测试...

⚠️  注意：模块2测试需要配置SILICONFLOW_API_KEY环境变量

🧪 测试模块2 API (流式生成8个板块方案)...
✅ 模块2 API 响应成功
📊 响应头: { content-type: 'text/plain; charset=utf-8', ... }
📦 收到数据块: data: {"type":"content","data":{"ipTags":["川菜师傅"...
📦 收到数据块: data: {"type":"content","data":{"brandSlogan":"正宗川味...
✅ 模块2 API 测试完成
📝 总共收到 15 个数据块

🧪 测试模块3 API (Banner设计方案)...
✅ 模块3 API 响应成功
📊 响应头: { content-type: 'application/json', ... }
📝 响应数据: {
  "success": true,
  "data": {
    "bannerDesign": {
      "mainTitle": "川味小厨",
      "subtitle": "正宗川味，家的味道"
    },
    "designTags": ["川菜师傅", "热情老板", "本地达人"],
    ...
  }
}

🧪 测试模块3 API (直接数据格式)...
✅ 模块3 API (直接数据) 响应成功
📝 响应数据: { ... }

🎉 所有测试完成！
```

### 错误输出
```
❌ 模块2 API 测试失败: AI服务配置错误
❌ 模块3 API 测试失败: HTTP 400: 请求数据格式错误
```

## 故障排除

### 常见问题

1. **模块2测试失败 - AI服务配置错误**
   - 检查 `SILICONFLOW_API_KEY` 环境变量是否正确配置
   - 确认API密钥有效且有足够余额

2. **连接错误 - ECONNREFUSED**
   - 确认开发服务器正在运行 (`pnpm dev`)
   - 检查端口3000是否被占用

3. **数据格式错误**
   - 检查测试数据是否符合API接口要求
   - 确认必需字段都已提供

4. **流式响应处理失败**
   - 检查网络连接稳定性
   - 确认浏览器支持Server-Sent Events

### 调试建议

1. **启用详细日志**
   ```bash
   DEBUG=* node tests/api/api-endpoints.test.js
   ```

2. **单独测试模块**
   ```javascript
   // 只测试模块3
   await testModule3API()
   ```

3. **检查API响应**
   - 使用浏览器开发者工具查看网络请求
   - 检查API端点的响应状态和内容

## 扩展测试

### 添加新的测试用例

1. **修改测试数据**
   ```javascript
   const customTestData = {
     storeName: "你的店铺名",
     storeCategory: "你的品类",
     // ... 其他字段
   }
   ```

2. **添加新的测试函数**
   ```javascript
   async function testCustomScenario() {
     // 自定义测试逻辑
   }
   ```

3. **集成到主测试流程**
   ```javascript
   async function runAllTests() {
     await testModule2API()
     await testModule3API()
     await testCustomScenario() // 新增测试
   }
   ```

### 性能测试

可以扩展测试脚本来包含性能测试：

```javascript
async function performanceTest() {
  const startTime = Date.now()
  await testModule2API()
  const endTime = Date.now()
  console.log(`模块2 API 响应时间: ${endTime - startTime}ms`)
}
```

## 最佳实践

1. **定期运行测试**: 在开发过程中定期运行API测试
2. **环境隔离**: 使用不同的环境变量配置测试和生产环境
3. **数据清理**: 测试完成后清理生成的临时数据
4. **错误记录**: 记录和分析测试失败的原因
5. **自动化集成**: 考虑将API测试集成到CI/CD流程中

## 相关文档

- [流式响应实现文档](./STREAMING_IMPLEMENTATION.md)
- [业务模块设计文档](../docs/FIELD_STANDARDS.md)
- [API开发指南](./developer-guide.md)
- [环境配置指南](./environment-setup.md)