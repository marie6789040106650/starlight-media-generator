#!/bin/bash

# 智能开发服务器启动脚本
# 自动检测并使用正确的包管理器，处理端口冲突

echo "🚀 智能启动开发服务器..."

# 默认端口配置
DEFAULT_PORT=3000

# 检测包管理器
detect_package_manager() {
    if [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "package-lock.json" ]; then
        echo "npm"
    else
        # 检查 package.json 中的配置
        if [ -f "package.json" ]; then
            PACKAGE_MANAGER=$(grep -o '"packageManager":\s*"[^"]*"' package.json | cut -d'"' -f4 | cut -d'@' -f1)
            if [ ! -z "$PACKAGE_MANAGER" ]; then
                echo "$PACKAGE_MANAGER"
            else
                echo "npm"  # 默认使用 npm
            fi
        else
            echo "npm"
        fi
    fi
}

# 检测并使用正确的包管理器
PM=$(detect_package_manager)
echo "📦 检测到包管理器: $PM"

# 检查是否有限制
if [ -f "package.json" ]; then
    PREINSTALL=$(grep -o '"preinstall":\s*"[^"]*"' package.json | cut -d'"' -f4)
    if [[ "$PREINSTALL" == *"only-allow"* ]]; then
        RESTRICTED_PM=$(echo "$PREINSTALL" | grep -o 'only-allow [a-z]*' | cut -d' ' -f2)
        if [ "$PM" != "$RESTRICTED_PM" ]; then
            echo "⚠️  检测到限制: 只能使用 $RESTRICTED_PM"
            PM="$RESTRICTED_PM"
        fi
    fi
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📥 依赖未安装，正在安装..."
    $PM install
fi

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口可用
    fi
}

# 处理端口冲突
handle_port_conflict() {
    local port=$1
    echo "⚠️  端口 $port 已被占用"
    
    # 检查是否是 Next.js 开发服务器
    local process_info=$(lsof -Pi :$port -sTCP:LISTEN | grep -v PID)
    if [[ "$process_info" == *"node"* ]] || [[ "$process_info" == *"next"* ]]; then
        echo "🔍 检测到可能是 Next.js 开发服务器正在运行"
        echo "📋 进程信息: $process_info"
        
        read -p "是否要终止现有进程并重新启动？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🛑 正在终止端口 $port 上的进程..."
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 2
            return 1  # 端口现在应该可用了
        else
            echo "❌ 用户取消操作"
            return 0  # 保持端口占用状态
        fi
    else
        echo "🔍 端口被其他应用占用: $process_info"
        echo "💡 建议手动处理或使用其他端口"
        return 0  # 端口仍被占用
    fi
}

# 检查并处理端口
echo "🔍 检查端口 $DEFAULT_PORT..."
if check_port $DEFAULT_PORT; then
    if ! handle_port_conflict $DEFAULT_PORT; then
        echo "✅ 端口 $DEFAULT_PORT 现在可用"
    else
        echo "❌ 无法启动：端口 $DEFAULT_PORT 仍被占用"
        echo "💡 你可以："
        echo "   1. 手动终止占用端口的进程"
        echo "   2. 修改 .env.local 中的 PORT 配置"
        echo "   3. 使用 $PM dev -p [其他端口] 指定不同端口"
        exit 1
    fi
else
    echo "✅ 端口 $DEFAULT_PORT 可用"
fi

# 启动开发服务器
echo "🎯 使用 $PM 在端口 $DEFAULT_PORT 启动开发服务器..."
npx next dev