#!/bin/bash

echo "🚀 部署前最终检查..."

# 1. 清理测试文件
echo "1️⃣ 清理测试文件..."
pnpm run cleanup

# 2. 验证导入路径
echo "2️⃣ 验证导入路径..."
node scripts/verify-imports.js

# 3. 本地构建测试
echo "3️⃣ 本地构建测试..."
pnpm build

# 4. 检查关键配置文件
echo "4️⃣ 检查配置文件..."
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json 存在"
else
    echo "❌ vercel.json 缺失"
    exit 1
fi

if [ -f "next.config.mjs" ]; then
    echo "✅ next.config.mjs 存在"
else
    echo "❌ next.config.mjs 缺失"
    exit 1
fi

if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json 存在"
else
    echo "❌ tsconfig.json 缺失"
    exit 1
fi

# 5. 检查关键依赖是否在正
echo "5️⃣ 检查生产依赖..."
if grep -A 50 '"dependencies"' package.json | grep -q '"tailwindcss"'; then
    echo "✅ tailwindcss 在生产依赖中"
else
    echo "❌ tailwindcss 应该在 dependencies 中，不是 devDependencies"
    exit 1
fi

if grep -A 50 '"dependencies"' package.json | grep -q '"postcss"'; then
    echo "✅ postcss 在生产依赖中"
else
    echo "❌ postcss 应该在 dependencies 中，不是 devDependencies"
    exit 1
fi

# 6. 检查环境变量模板
echo "6️⃣ 检查环境变量..."
if [ -f ".env.example" ]; then
    echo "✅ .env.example 存在"
else
    echo "⚠️  建议创建 .env.example 文件"
fi

echo ""
echo "🎉 部署前检查完成！"
echo ""
echo "📋 Vercel部署步骤："
echo "1. 访问 https://vercel.com/dashboard"
echo "2. 点击 'New Project'"
echo "3. 选择你的GitHub仓库"
echo "4. 配置环境变量："
echo "   - SILICONFLOW_API_KEY=你的API密钥"
echo "   - NEXT_PUBLIC_API_BASE_URL=https://api.siliconflow.cn"
echo "   - NODE_ENV=production"
echo "5. 点击 'Deploy'"
echo ""
echo "🔧 如果部署失败，检查Vercel构建日志中的具体错误信息"