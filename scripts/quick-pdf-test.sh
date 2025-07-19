#!/bin/bash

# 快速PDF转换测试脚本
# 用于快速验证LibreOffice PDF转换功能

set -e

# 配置
BASE_URL="${BASE_URL:-http://localhost:3000}"
OUTPUT_DIR="./test-output"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v curl &> /dev/null; then
        log_error "curl 未安装，请先安装 curl"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq 未安装，JSON输出可能不够美观"
    fi
    
    log_success "依赖检查完成"
}

# 健康检查
health_check() {
    log_info "检查PDF服务状态..."
    
    local response
    local status_code
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/api/generate-pdf" || echo "HTTPSTATUS:000")
    status_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    local body=$(echo "$response" | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    case $status_code in
        200)
            log_success "PDF服务正常运行"
            if command -v jq &> /dev/null; then
                echo "$body" | jq '.'
            else
                echo "$body"
            fi
            return 0
            ;;
        503)
            log_error "PDF服务不可用"
            echo "$body"
            return 1
            ;;
        000)
            log_error "无法连接到服务器"
            return 1
            ;;
        *)
            log_error "健康检查失败: HTTP $status_code"
            echo "$body"
            return 1
            ;;
    esac
}

# 测试PDF生成
test_pdf_generation() {
    log_info "测试PDF生成..."
    
    # 创建输出目录
    mkdir -p "$OUTPUT_DIR"
    
    # 测试数据
    local test_data='{
        "content": "# PDF转换测试\n\n## 测试内容\n这是一个**PDF转换测试**文档。\n\n### 功能验证\n- LibreOffice转换\n- 中文字符支持\n- 格式保持\n\n> 这是一个引用块测试\n\n```javascript\nconsole.log(\"Hello PDF!\");\n```\n\n---\n*测试完成*",
        "storeName": "测试店铺",
        "filename": "quick-test.pdf",
        "includeWatermark": true
    }'
    
    local output_file="$OUTPUT_DIR/quick-test-$(date +%s).pdf"
    
    log_info "发送PDF生成请求..."
    
    local response
    local status_code
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$test_data" \
        --output "$output_file" \
        "$BASE_URL/api/generate-pdf" || echo "HTTPSTATUS:000")
    
    status_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    
    case $status_code in
        200)
            if [ -f "$output_file" ] && [ -s "$output_file" ]; then
                local file_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null)
                log_success "PDF生成成功!"
                log_info "文件路径: $output_file"
                log_info "文件大小: $file_size bytes"
                
                # 验证PDF文件头
                if head -c 4 "$output_file" | grep -q "%PDF"; then
                    log_success "PDF文件格式验证通过"
                else
                    log_warning "PDF文件格式可能有问题"
                fi
                
                return 0
            else
                log_error "PDF文件生成失败或为空"
                return 1
            fi
            ;;
        503)
            log_error "PDF服务不可用"
            # 尝试读取错误信息
            if [ -f "$output_file" ]; then
                cat "$output_file"
                rm -f "$output_file"
            fi
            return 1
            ;;
        *)
            log_error "PDF生成失败: HTTP $status_code"
            # 尝试读取错误信息
            if [ -f "$output_file" ]; then
                cat "$output_file"
                rm -f "$output_file"
            fi
            return 1
            ;;
    esac
}

# 显示使用说明
show_usage() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -u, --url URL     设置服务器URL (默认: http://localhost:3000)"
    echo "  -o, --output DIR  设置输出目录 (默认: ./test-output)"
    echo "  -h, --help        显示此帮助信息"
    echo ""
    echo "环境变量:"
    echo "  BASE_URL          服务器URL"
    echo ""
    echo "示例:"
    echo "  $0                           # 使用默认设置"
    echo "  $0 -u http://localhost:8080  # 指定服务器URL"
    echo "  BASE_URL=http://prod.com $0  # 使用环境变量"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -u|--url)
                BASE_URL="$2"
                shift 2
                ;;
            -o|--output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# 主函数
main() {
    echo "🧪 快速PDF转换测试"
    echo "=================="
    echo ""
    
    log_info "服务器URL: $BASE_URL"
    log_info "输出目录: $OUTPUT_DIR"
    echo ""
    
    # 检查依赖
    check_dependencies
    echo ""
    
    # 健康检查
    if ! health_check; then
        log_error "服务不健康，测试终止"
        exit 1
    fi
    echo ""
    
    # 测试PDF生成
    if test_pdf_generation; then
        echo ""
        log_success "所有测试通过! 🎉"
        
        # 显示输出文件
        if [ -d "$OUTPUT_DIR" ]; then
            local files=$(find "$OUTPUT_DIR" -name "*.pdf" -type f 2>/dev/null | head -5)
            if [ -n "$files" ]; then
                echo ""
                log_info "生成的PDF文件:"
                echo "$files" | while read -r file; do
                    echo "  📄 $file"
                done
            fi
        fi
    else
        echo ""
        log_error "测试失败"
        exit 1
    fi
}

# 解析参数并运行
parse_args "$@"
main