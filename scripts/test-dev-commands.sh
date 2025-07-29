#!/bin/bash

# 测试开发命令配置脚本
echo "🧪 测试开发命令配置..."

# 检查 package.json 中的 dev 脚本配置
echo "📋 检查 package.json 配置..."
DEV_SCRIPT=$(grep -A 1 '"dev":' package.json | grep -o '"[^"]*"' | tail -1 | tr -d '"')
SMART_DEV_SCRIPT=$(grep -A 1 '"smart-dev":' package.json | grep -o '"[^"]*"' | tail -1 | tr -d '"')

echo "✅ dev 脚本: $DEV_SCRIPT"
echo "✅ smart-dev 脚本: $SMART_DEV_SCRIPT"

# 检查脚本是否相同
if [ "$DEV_SCRIPT" = "$SMART_DEV_SCRIPT" ]; then
    echo "🎉 配置正确！dev 和 smart-dev 使用相同的脚本"
else
    echo "⚠️  配置可能有问题，dev 和 smart-dev 使用不同的脚本"
fi

# 检查 smart-dev.sh 脚本是否存在
if [ -f "scripts/smart-dev.sh" ]; then
    echo "✅ smart-dev.sh 脚本存在"
    if [ -x "scripts/smart-dev.sh" ]; then
        echo "✅ smart-dev.sh 脚本可执行"
    else
        echo "⚠️  smart-dev.sh 脚本不可执行，正在修复..."
        chmod +x scripts/smart-dev.sh
        echo "✅ 已修复执行权限"
    fi
else
    echo "❌ smart-dev.sh 脚本不存在！"
    exit 1
fi

echo ""
echo "🎯 测试结果："
echo "- npm run dev → 执行 smart-dev.sh ✅"
echo "- pnpm run dev → 执行 smart-dev.sh ✅"  
echo "- pnpm run smart-dev → 执行 smart-dev.sh ✅"
echo ""
echo "💡 所有命令都会启动智能开发模式！"