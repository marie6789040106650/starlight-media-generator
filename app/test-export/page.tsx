/**
 * 前端Word导出测试页面
 */

"use client"

import { SimpleWordExportButton } from "@/components/simple-word-export-button"

const testContent = `# 测试店铺 - 老板IP打造方案

## 1. IP核心定位与形象塑造

### 人设定位
**创业故事线**：从传统实体店主到数字化转型的先行者，通过不断学习和实践，成功打造了具有地方特色的品牌。

**专业标签**：
- 本地商业专家
- 数字化转型实践者
- 社区服务倡导者

### 内容风格
- **真实性**：分享真实的经营经历和心得
- **实用性**：提供可操作的商业建议
- **温度感**：展现对顾客和社区的关怀

## 2. 内容创作策略

### 日常内容规划
1. **周一**：行业洞察分享
2. **周三**：经营技巧教学
3. **周五**：顾客故事展示
4. **周日**：生活感悟分享

### 爆款内容公式
- 痛点 + 解决方案 + 案例验证
- 争议话题 + 独特观点 + 互动引导

## 3. 私域运营体系

### 用户分层管理
- **新用户**：欢迎引导 + 价值输出
- **活跃用户**：深度互动 + 专属福利
- **忠实粉丝**：VIP服务 + 口碑传播

### 转化路径设计
公域引流 → 私域沉淀 → 信任建立 → 产品转化 → 复购推荐

---
本方案由星光传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构`

export default function TestExportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            前端Word导出功能测试
          </h1>
          <p className="text-gray-600">
            测试纯浏览器环境的Word文档生成和下载功能
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 测试按钮区域 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">导出测试</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <SimpleWordExportButton
                content={testContent}
                storeName="测试店铺"
              />
              
              <div className="text-sm text-gray-600">
                <p>• 点击按钮测试前端Word导出功能</p>
                <p>• 不依赖服务器，纯浏览器实现</p>
              </div>
            </div>
          </div>

          {/* 内容预览区域 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">内容预览</h3>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                {testContent.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold mb-4">{line.substring(2)}</h1>
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-semibold mb-3 mt-6">{line.substring(3)}</h2>
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-medium mb-2 mt-4">{line.substring(4)}</h3>
                  } else if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={index} className="font-bold mb-2">{line.slice(2, -2)}</p>
                  } else if (line.startsWith('- ')) {
                    return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>
                  } else if (line.match(/^\d+\./)) {
                    return <li key={index} className="ml-4 mb-1 list-decimal">{line.substring(line.indexOf('.') + 2)}</li>
                  } else if (line.trim()) {
                    return <p key={index} className="mb-3">{line}</p>
                  }
                  return <br key={index} />
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}