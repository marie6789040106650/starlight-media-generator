#!/bin/bash

# 项目包管理器检查脚本
echo "🔍 检查项目包管理器配置..."

# 检查 lock 文件
if [ -f "pnpm-lock.yaml" ]; then
    echo "✅ 发现 pnpm-lock.yaml - 建议使用 pnpm"
    SUGGESTED_PM="pnpm"
elif [ -f "yarn.lock" ]; then
    echo "✅ 发现 yarn.lock - 建议使用 yarn"
    SUGGESTED_PM="yarn"
elif [ -f "package-lock.json" ]; then
    echo "✅ 发现 package-lock.json - 建议使用 npm"
    SUGGESTED_PM="npm"
else
    echo "⚠️  未发现 lock 文件"
    SUGGESTED_PM="unknown"
fi

# 检查 package.json 配置
if [ -f "package.json" ]; then
    echo "📦 检查 package.json 配置..."
    
    # 检查 packageManager 字段
    PACKAGE_MANAGER=$(grep -o '"packageManager":\s*"[^"]*"' package.json | cut -d'"' -f4 | cut -d'@' -f1)
    if [ ! -z "$PACKAGE_MANAGER" ]; then
        echo "✅ packageManager 字段指定: $PACKAGE_MANAGER"
        SUGGESTED_PM="$PACKAGE_MANAGER"
    fi
    
    # 检查 preinstall 脚本
    PREINSTALL=$(grep -o '"preinstall":\s*"[^"]*"' package.json | cut -d'"' -f4)
    if [[ "$PREINSTALL" == *"only-allow"* ]]; then
        RESTRICTED_PM=$(echo "$PREINSTALL" | grep -o 'only-allow [a-z]*' | cut -d' ' -f2)
        echo "🚫 preinstall 限制只能使用: $RESTRICTED_PM"
        SUGGESTED_PM="$RESTRICTED_PM"
    fi
    
    # 显示可用脚本
    echo "📋 可用脚本命令:"
    grep -A 20 '"scripts"' package.json | grep -E '^\s*"[^"]+":' | sed 's/^[[:space:]]*/  /'
fi

echo ""
echo "🎯 建议使用的包管理器: $SUGGESTED_PM"
echo "💡 启动开发服务器: $SUGGESTED_PM dev"
echo "💡 安装依赖: $SUGGESTED_PM install"
echo "💡 构建项目: $SUGGESTED_PM build"