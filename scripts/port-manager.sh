#!/bin/bash

# 端口管理脚本
# 处理开发服务器端口冲突和管理

CONFIG_FILE="config/server.json"
DEFAULT_PORT=3000

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 从配置文件读取端口
get_config_port() {
    if [ -f "$CONFIG_FILE" ]; then
        # 使用 node 来解析 JSON（如果可用）
        if command -v node >/dev/null 2>&1; then
            node -e "
                const config = require('./$CONFIG_FILE');
                console.log(config.development.port);
            " 2>/dev/null || echo $DEFAULT_PORT
        else
            # 简单的 grep 解析
            grep -o '"port":\s*[0-9]*' "$CONFIG_FILE" | head -1 | grep -o '[0-9]*' || echo $DEFAULT_PORT
        fi
    else
        echo $DEFAULT_PORT
    fi
}

# 检查端口是否被占用
is_port_in_use() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
}

# 获取端口占用进程信息
get_port_process() {
    local port=$1
    lsof -Pi :$port -sTCP:LISTEN | grep -v PID | head -1
}

# 终止端口上的进程
kill_port_process() {
    local port=$1
    print_message $YELLOW "正在终止端口 $port 上的进程..."
    
    local pids=$(lsof -ti:$port)
    if [ ! -z "$pids" ]; then
        echo $pids | xargs kill -9 2>/dev/null
        sleep 2
        
        if is_port_in_use $port; then
            print_message $RED "❌ 无法终止端口 $port 上的进程"
            return 1
        else
            print_message $GREEN "✅ 成功终止端口 $port 上的进程"
            return 0
        fi
    else
        print_message $YELLOW "⚠️  端口 $port 上没有找到进程"
        return 0
    fi
}

# 查找可用端口
find_available_port() {
    local start_port=$1
    local max_attempts=10
    
    for ((i=0; i<max_attempts; i++)); do
        local test_port=$((start_port + i))
        if ! is_port_in_use $test_port; then
            echo $test_port
            return 0
        fi
    done
    
    return 1
}

# 主要的端口检查和处理逻辑
handle_port() {
    local target_port=$(get_config_port)
    
    print_message $BLUE "🔍 检查端口 $target_port..."
    
    if ! is_port_in_use $target_port; then
        print_message $GREEN "✅ 端口 $target_port 可用"
        echo $target_port
        return 0
    fi
    
    # 端口被占用
    local process_info=$(get_port_process $target_port)
    print_message $YELLOW "⚠️  端口 $target_port 已被占用"
    print_message $BLUE "📋 进程信息: $process_info"
    
    # 检查是否是开发服务器
    if [[ "$process_info" == *"node"* ]] || [[ "$process_info" == *"next"* ]]; then
        print_message $YELLOW "🔍 检测到可能是开发服务器正在运行"
        
        echo "请选择操作："
        echo "1) 终止现有进程并使用端口 $target_port"
        echo "2) 查找其他可用端口"
        echo "3) 手动处理"
        echo "4) 退出"
        
        read -p "请输入选择 (1-4): " choice
        
        case $choice in
            1)
                if kill_port_process $target_port; then
                    echo $target_port
                    return 0
                else
                    return 1
                fi
                ;;
            2)
                local available_port=$(find_available_port $((target_port + 1)))
                if [ $? -eq 0 ]; then
                    print_message $GREEN "✅ 找到可用端口: $available_port"
                    echo $available_port
                    return 0
                else
                    print_message $RED "❌ 未找到可用端口"
                    return 1
                fi
                ;;
            3)
                print_message $BLUE "💡 请手动处理端口冲突后重新运行"
                return 1
                ;;
            4)
                print_message $BLUE "👋 退出"
                return 1
                ;;
            *)
                print_message $RED "❌ 无效选择"
                return 1
                ;;
        esac
    else
        print_message $YELLOW "🔍 端口被其他应用占用"
        local available_port=$(find_available_port $((target_port + 1)))
        if [ $? -eq 0 ]; then
            print_message $GREEN "✅ 建议使用端口: $available_port"
            echo $available_port
            return 0
        else
            print_message $RED "❌ 未找到可用端口"
            return 1
        fi
    fi
}

# 显示端口状态
show_port_status() {
    local port=$(get_config_port)
    print_message $BLUE "📊 端口状态报告"
    echo "配置端口: $port"
    
    if is_port_in_use $port; then
        print_message $RED "状态: 被占用"
        print_message $BLUE "进程信息: $(get_port_process $port)"
    else
        print_message $GREEN "状态: 可用"
    fi
}

# 主函数
main() {
    case "${1:-check}" in
        "check")
            handle_port
            ;;
        "status")
            show_port_status
            ;;
        "kill")
            local port=${2:-$(get_config_port)}
            kill_port_process $port
            ;;
        "find")
            local start_port=${2:-3000}
            find_available_port $start_port
            ;;
        *)
            echo "用法: $0 [check|status|kill|find] [port]"
            echo "  check  - 检查并处理端口冲突（默认）"
            echo "  status - 显示端口状态"
            echo "  kill   - 终止指定端口的进程"
            echo "  find   - 查找可用端口"
            ;;
    esac
}

main "$@"