#!/bin/bash

# 智能开发服务器重启脚本
# 自动检查、关闭并重启开发服务器

set -e  # 遇到错误时退出

echo "🔄 智能重启开发服务器..."
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检测包管理器
detect_package_manager() {
    if [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "package-lock.json" ]; then
        echo "npm"
    else
        echo "pnpm"  # 默认使用 pnpm
    fi
}

# 检查进程是否存在
check_dev_processes() {
    local next_processes=$(pgrep -f "next dev" 2>/dev/null || true)
    local pnpm_processes=$(pgrep -f "pnpm.*dev" 2>/dev/null || true)
    local npm_processes=$(pgrep -f "npm.*dev" 2>/dev/null || true)
    
    if [ ! -z "$next_processes" ] || [ ! -z "$pnpm_processes" ] || [ ! -z "$npm_processes" ]; then
        return 0  # 有进程在运行
    else
        return 1  # 没有进程
    fi
}

# 强制关闭开发服务器
force_kill_dev_servers() {
    log_info "正在关闭现有的开发服务器..."
    
    # 优雅关闭
    pkill -TERM -f "next dev" 2>/dev/null || true
    pkill -TERM -f "pnpm.*dev" 2>/dev/null || true
    pkill -TERM -f "npm.*dev" 2>/dev/null || true
    
    # 等待进程关闭
    sleep 3
    
    # 强制关闭仍在运行的进程
    pkill -KILL -f "next dev" 2>/dev/null || true
    pkill -KILL -f "pnpm.*dev" 2>/dev/null || true
    pkill -KILL -f "npm.*dev" 2>/dev/null || true
    
    # 清理端口
    local ports=(3000 3001 3002 8080 8000)
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [ ! -z "$pid" ]; then
            log_warning "关闭端口 $port 上的进程 $pid"
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    sleep 2
}

# 检查端口是否可用
check_port_available() {
    local port=${1:-3000}
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口可用
    else
        return 1  # 端口被占用
    fi
}

# 启动开发服务器
start_dev_server() {
    local pm=$(detect_package_manager)
    log_info "使用包管理器: $pm"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log_warning "依赖未安装，正在安装..."
        $pm install
    fi
    
    # 检查端口
    if ! check_port_available 3000; then
        log_warning "端口 3000 仍被占用，尝试清理..."
        force_kill_dev_servers
        sleep 2
    fi
    
    if check_port_available 3000; then
        log_success "端口 3000 可用"
    else
        log_error "端口 3000 仍被占用，可能需要手动处理"
        lsof -Pi :3000 -sTCP:LISTEN 2>/dev/null || true
    fi
    
    # 启动服务器
    log_info "启动开发服务器..."
    exec $pm dev
}

# 主流程
main() {
    # 检查是否有开发服务器在运行
    if check_dev_processes; then
        log_warning "发现运行中的开发服务器"
        
        # 显示当前进程
        echo "当前进程:"
        ps aux | grep -E "next dev|pnpm.*dev|npm.*dev" | grep -v grep || true
        echo ""
        
        # 自动关闭（根据自动化规则）
        force_kill_dev_servers
        log_success "已关闭现有服务器"
    else
        log_success "没有运行中的开发服务器"
    fi
    
    # 启动新的服务器
    start_dev_server
}

# 错误处理
trap 'log_error "脚本执行失败，请检查错误信息"; exit 1' ERR

# 执行主流程
main "$@"