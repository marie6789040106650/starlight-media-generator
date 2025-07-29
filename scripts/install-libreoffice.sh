#!/bin/bash

# LibreOffice安装和配置脚本
# 用于在服务器上安装LibreOffice以支持Word到PDF转换

set -e  # 遇到错误时退出

echo "🚀 开始安装和配置LibreOffice..."

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

# 检查是否以root权限运行
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_warning "检测到root权限，建议使用普通用户运行此脚本"
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检测操作系统和发行版
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "检测到Linux系统"
        
        # 检测具体发行版
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS_NAME=$NAME
            OS_VERSION=$VERSION_ID
            log_info "发行版: $OS_NAME $OS_VERSION"
        fi
        
        return 0
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log_info "检测到macOS系统"
        OS_NAME="macOS"
        return 0
    else
        log_error "不支持的操作系统: $OSTYPE"
        return 1
    fi
}

# 安装LibreOffice (Linux)
install_libreoffice_linux() {
    log_info "开始在Linux上安装LibreOffice..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        log_info "使用apt-get安装LibreOffice..."
        
        # 更新包列表
        sudo apt-get update
        
        # 安装LibreOffice核心组件和字体
        sudo apt-get install -y \
            libreoffice-core \
            libreoffice-writer \
            libreoffice-common \
            fonts-liberation \
            fonts-dejavu-core \
            fonts-noto-cjk \
            --no-install-recommends
        
        # 安装中文字体支持
        sudo apt-get install -y \
            fonts-wqy-microhei \
            fonts-wqy-zenhei \
            --no-install-recommends || log_warning "中文字体安装失败，PDF中文显示可能有问题"
        
    # CentOS/RHEL/Fedora
    elif command -v yum &> /dev/null; then
        log_info "使用yum安装LibreOffice..."
        
        # 安装EPEL仓库（如果需要）
        sudo yum install -y epel-release || true
        
        # 安装LibreOffice
        sudo yum install -y \
            libreoffice-headless \
            libreoffice-writer \
            liberation-fonts \
            dejavu-fonts-common
        
    elif command -v dnf &> /dev/null; then
        log_info "使用dnf安装LibreOffice..."
        
        # 安装LibreOffice
        sudo dnf install -y \
            libreoffice-headless \
            libreoffice-writer \
            liberation-fonts \
            dejavu-fonts-common
        
    # Alpine Linux
    elif command -v apk &> /dev/null; then
        log_info "使用apk安装LibreOffice..."
        
        sudo apk update
        sudo apk add \
            libreoffice \
            ttf-liberation \
            ttf-dejavu
        
    else
        log_error "不支持的Linux发行版，请手动安装LibreOffice"
        return 1
    fi
}

# 安装LibreOffice (macOS)
install_libreoffice_macos() {
    log_info "开始在macOS上安装LibreOffice..."
    
    # 检查是否安装了Homebrew
    if command -v brew &> /dev/null; then
        log_info "使用Homebrew安装LibreOffice..."
        brew install --cask libreoffice
    else
        log_warning "未检测到Homebrew"
        log_info "请选择安装方式:"
        echo "1. 安装Homebrew然后安装LibreOffice"
        echo "2. 手动下载安装LibreOffice"
        read -p "请选择 (1/2): " -n 1 -r
        echo
        
        if [[ $REPLY == "1" ]]; then
            log_info "安装Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            brew install --cask libreoffice
        else
            log_info "请访问 https://www.libreoffice.org/download/download/ 手动下载安装"
            return 1
        fi
    fi
}

# 验证LibreOffice安装
verify_installation() {
    log_info "验证LibreOffice安装..."
    
    # 检查可用的命令
    local commands=("libreoffice" "/usr/bin/libreoffice" "/opt/libreoffice/program/soffice" "soffice")
    local found_command=""
    
    for cmd in "${commands[@]}"; do
        if command -v "$cmd" &> /dev/null; then
            found_command="$cmd"
            break
        fi
    done
    
    if [ -z "$found_command" ]; then
        log_error "LibreOffice命令未找到"
        return 1
    fi
    
    log_success "找到LibreOffice命令: $found_command"
    
    # 获取版本信息
    local version_output
    if version_output=$($found_command --version 2>&1); then
        log_success "LibreOffice版本: $version_output"
    else
        log_error "无法获取LibreOffice版本信息"
        return 1
    fi
    
    # 测试headless模式
    log_info "测试headless模式..."
    if $found_command --headless --version &> /dev/null; then
        log_success "Headless模式正常"
    else
        log_warning "Headless模式可能有问题，但基本功能应该可用"
    fi
    
    return 0
}

# 创建测试文档进行转换测试
test_conversion() {
    log_info "执行PDF转换测试..."
    
    local test_dir="/tmp/libreoffice-test-$$"
    mkdir -p "$test_dir"
    
    # 创建测试Word文档内容
    cat > "$test_dir/test.txt" << 'EOF'
测试文档
这是一个LibreOffice PDF转换测试文档。
Test Document
This is a LibreOffice PDF conversion test document.
EOF
    
    # 查找LibreOffice命令
    local commands=("libreoffice" "/usr/bin/libreoffice" "/opt/libreoffice/program/soffice" "soffice")
    local found_command=""
    
    for cmd in "${commands[@]}"; do
        if command -v "$cmd" &> /dev/null; then
            found_command="$cmd"
            break
        fi
    done
    
    if [ -z "$found_command" ]; then
        log_error "LibreOffice命令未找到"
        rm -rf "$test_dir"
        return 1
    fi
    
    # 执行转换测试
    log_info "执行转换命令..."
    if timeout 30 "$found_command" --headless --convert-to pdf --outdir "$test_dir" "$test_dir/test.txt" 2>&1; then
        if [ -f "$test_dir/test.pdf" ]; then
            local file_size=$(stat -f%z "$test_dir/test.pdf" 2>/dev/null || stat -c%s "$test_dir/test.pdf" 2>/dev/null)
            log_success "PDF转换测试成功! 生成文件大小: ${file_size} bytes"
        else
            log_warning "转换命令执行成功，但未找到PDF文件"
        fi
    else
        log_warning "PDF转换测试失败，但LibreOffice已安装"
    fi
    
    # 清理测试文件
    rm -rf "$test_dir"
}

# 配置系统环境
configure_environment() {
    log_info "配置系统环境..."
    
    # 设置临时目录权限
    if [ -d "/tmp" ]; then
        chmod 1777 /tmp 2>/dev/null || log_warning "无法设置/tmp目录权限"
    fi
    
    # 创建LibreOffice配置目录
    local config_dir="$HOME/.config/libreoffice"
    if [ ! -d "$config_dir" ]; then
        mkdir -p "$config_dir" 2>/dev/null || log_warning "无法创建LibreOffice配置目录"
    fi
    
    # 设置环境变量
    log_info "建议添加以下环境变量到你的shell配置文件:"
    echo "export LIBREOFFICE_HEADLESS=1"
    echo "export SAL_USE_VCLPLUGIN=svp"
}

# 显示使用说明
show_usage_instructions() {
    log_success "LibreOffice安装和配置完成!"
    echo ""
    log_info "📝 使用说明:"
    echo "1. 重启你的应用服务器"
    echo "2. 访问 GET /api/generate-pdf 检查服务状态"
    echo "3. 使用 POST /api/generate-pdf 生成PDF文档"
    echo ""
    log_info "🔧 故障排除:"
    echo "- 如果转换失败，检查临时目录权限: chmod 1777 /tmp"
    echo "- 确保服务器有足够的内存 (建议至少512MB)"
    echo "- 检查磁盘空间是否充足"
    echo "- 在Docker环境中需要安装字体包"
    echo ""
    log_info "🐳 Docker环境额外配置:"
    echo "在Dockerfile中添加:"
    echo "RUN apt-get update && apt-get install -y libreoffice-core libreoffice-writer fonts-liberation --no-install-recommends"
    echo ""
    log_info "🧪 测试命令:"
    echo "curl http://localhost:3000/api/generate-pdf"
}

# 主函数
main() {
    echo "🚀 LibreOffice PDF转换服务安装脚本"
    echo "========================================"
    
    # 检查权限
    check_root
    
    # 检测操作系统
    if ! detect_os; then
        exit 1
    fi
    
    # 安装LibreOffice
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if ! install_libreoffice_linux; then
            log_error "Linux上LibreOffice安装失败"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        if ! install_libreoffice_macos; then
            log_error "macOS上LibreOffice安装失败"
            exit 1
        fi
    fi
    
    # 验证安装
    if ! verify_installation; then
        log_error "LibreOffice安装验证失败"
        exit 1
    fi
    
    # 执行转换测试
    test_conversion
    
    # 配置环境
    configure_environment
    
    # 显示使用说明
    show_usage_instructions
}

# 运行主函数
main "$@"