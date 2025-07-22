#!/bin/bash

# 自动化命令执行脚本
# 根据自动化规则自动执行常用命令

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[AUTO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# 高优先级自动信任命令列表
HIGH_PRIORITY_COMMANDS=(
    "pnpm install"
    "npm install"
    "pnpm dev"
    "npm run dev"
    "pnpm build"
    "npm run build"
    "pnpm test"
    "npm test"
    "pnpm run cleanup"
    "git status"
    "git diff"
    "ls"
    "cat"
    "grep"
)

# 中优先级命令列表
MEDIUM_PRIORITY_COMMANDS=(
    "pkill -f \"next dev\""
    "rm -rf node_modules"
    "git add ."
    "git commit"
)

# 检查命令是否在自动信任列表中
is_auto_trusted() {
    local cmd="$1"
    
    # 检查高优先级命令
    for trusted_cmd in "${HIGH_PRIORITY_COMMANDS[@]}"; do
        if [[ "$cmd" == "$trusted_cmd"* ]]; then
            return 0
        fi
    done
    
    return 1
}

# 检查命令是否需要确认
needs_confirmation() {
    local cmd="$1"
    
    # 检查中优先级命令
    for medium_cmd in "${MEDIUM_PRIORITY_COMMANDS[@]}"; do
        if [[ "$cmd" == "$medium_cmd"* ]]; then
            return 0
        fi
    done
    
    return 1
}

# 自动执行命令
auto_execute() {
    local cmd="$1"
    local auto_confirm="${2:-false}"
    
    log_info "准备执行命令: $cmd"
    
    if is_auto_trusted "$cmd"; then
        log_success "命令已自动信任，直接执行"
        eval "$cmd"
        return $?
    elif needs_confirmation "$cmd" && [[ "$auto_confirm" == "true" ]]; then
        log_warning "中优先级命令，自动确认执行"
        eval "$cmd"
        return $?
    else
        log_warning "命令需要手动确认: $cmd"
        read -p "是否执行此命令? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            eval "$cmd"
            return $?
        else
            log_info "用户取消执行"
            return 1
        fi
    fi
}

# 智能重启开发服务器
smart_dev_restart() {
    log_info "智能重启开发服务器"
    
    # 检查现有进程
    if pgrep -f "next dev" > /dev/null; then
        log_warning "发现运行中的开发服务器，正在关闭..."
        auto_execute "pkill -f \"next dev\"" true
        sleep 3
    fi
    
    # 启动新服务器
    log_info "启动开发服务器..."
    auto_execute "pnpm dev" true
}

# 自动安装依赖并启动
auto_setup_and_start() {
    log_info "自动设置和启动项目"
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装依赖..."
        auto_execute "pnpm install" true
    fi
    
    # 启动开发服务器
    smart_dev_restart
}

# 健康检查和自动修复
health_check_and_fix() {
    log_info "执行健康检查..."
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        log_warning "依赖缺失，自动安装..."
        auto_execute "pnpm install" true
    fi
    
    # 检查端口占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 3000 被占用"
        local process_info=$(lsof -Pi :3000 -sTCP:LISTEN | grep -v PID)
        log_info "进程信息: $process_info"
        
        if [[ "$process_info" == *"node"* ]] || [[ "$process_info" == *"next"* ]]; then
            log_info "检测到 Next.js 进程，自动重启..."
            smart_dev_restart
        fi
    fi
    
    # 检查项目结构
    local required_dirs=(".next" "node_modules" "components" "lib")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ] && [ "$dir" != ".next" ]; then
            log_warning "缺少目录: $dir"
        fi
    done
    
    log_success "健康检查完成"
}

# 主函数
main() {
    local action="${1:-help}"
    
    case "$action" in
        "dev")
            smart_dev_restart
            ;;
        "setup")
            auto_setup_and_start
            ;;
        "health")
            health_check_and_fix
            ;;
        "install")
            auto_execute "pnpm install" true
            ;;
        "build")
            auto_execute "pnpm build" true
            ;;
        "test")
            auto_execute "pnpm test" true
            ;;
        "cleanup")
            auto_execute "pnpm run cleanup" true
            ;;
        "exec")
            shift
            auto_execute "$*" false
            ;;
        "auto-exec")
            shift
            auto_execute "$*" true
            ;;
        "help"|*)
            echo "用法: $0 <action>"
            echo ""
            echo "可用操作:"
            echo "  dev      - 智能重启开发服务器"
            echo "  setup    - 自动设置和启动项目"
            echo "  health   - 健康检查和自动修复"
            echo "  install  - 安装依赖"
            echo "  build    - 构建项目"
            echo "  test     - 运行测试"
            echo "  cleanup  - 清理临时文件"
            echo "  exec     - 执行命令（需要确认）"
            echo "  auto-exec - 自动执行命令（自动确认）"
            echo "  help     - 显示帮助"
            ;;
    esac
}

# 执行主函数
main "$@"