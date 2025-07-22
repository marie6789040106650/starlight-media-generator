#!/bin/bash

# 快速设置脚本 - AI服务配置

echo "🚀 AI服务快速设置向导"
echo "========================"
echo ""

# 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查项目依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装项目依赖..."
    pnpm install
fi

echo "🔧 初始化AI服务配置..."
node scripts/init-config.js

echo ""
echo "📊 当前配置状态:"
node scripts/manage-api-keys.js --status

echo ""
echo "💡 接下来你可以:"
echo "1. 运行 'pnpm run config:interactive' 进行交互式配置"
echo "2. 运行 'pnpm run config:update' 更新特定服务的API密钥"
echo "3. 运行 'pnpm run config:list' 查看所有支持的服务"
echo "4. 运行 'pnpm run dev' 启动开发服务器"
echo ""
echo "📖 详细文档: docs/CONFIG_MANAGEMENT.md"
echo ""
echo "🎉 设置完成!"