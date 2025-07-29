#!/bin/bash

# 自动化系统测试脚本
# 验证所有自动化功能是否正常工作

echo "🧪 测试 Kiro 自动化系统"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_passed=0
test_failed=0

# 测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "测试: $test_name ... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((test_passed++))
    else
        echo -e "${RED}❌ 失败${NC}"
        ((test_failed++))
    fi
}

echo "1. 测试脚本文件存在性"
echo "------------------------"

run_test "dev-restart.sh 存在" "[ -f scripts/dev-restart.sh ]"
run_test "auto-execute.sh 存在" "[ -f scripts/auto-execute.sh ]"
run_test "smart-dev.sh 存在" "[ -f scripts/smart-dev.sh ]"
run_test "cleanup-dev-servers.sh 存在" "[ -f scripts/cleanup-dev-servers.sh ]"

echo ""
echo "2. 测试脚本可执行性"
echo "------------------------"

run_test "dev-restart.sh 可执行" "[ -x scripts/dev-restart.sh ]"
run_test "auto-execute.sh 可执行" "[ -x scripts/auto-execute.sh ]"
run_test "smart-dev.sh 可执行" "[ -x scripts/smart-dev.sh ]"
run_test "cleanup-dev-servers.sh 可执行" "[ -x scripts/cleanup-dev-servers.sh ]"

echo ""
echo "3. 测试 Kiro Hook 文件"
echo "------------------------"

run_test "auto-command-execution.kiro.hook 存在" "[ -f .kiro/hooks/auto-command-execution.kiro.hook ]"
run_test "auto-retry-on-error.kiro.hook 存在" "[ -f .kiro/hooks/auto-retry-on-error.kiro.hook ]"
run_test "smart-task-continuation.kiro.hook 存在" "[ -f .kiro/hooks/smart-task-continuation.kiro.hook ]"

echo ""
echo "4. 测试 Steering 规则文件"
echo "------------------------"

run_test "automation-rules.md 存在" "[ -f .kiro/steering/automation-rules.md ]"
run_test "error-recovery-strategy.md 存在" "[ -f .kiro/steering/error-recovery-strategy.md ]"
run_test "development-rules.md 存在" "[ -f .kiro/steering/development-rules.md ]"
run_test "project-maintenance.md 存在" "[ -f .kiro/steering/project-maintenance.md ]"

echo ""
echo "5. 测试 Package.json 脚本"
echo "------------------------"

run_test "dev:restart 脚本存在" "grep -q 'dev:restart' package.json"
run_test "dev:auto 脚本存在" "grep -q 'dev:auto' package.json"
run_test "setup 脚本存在" "grep -q '\"setup\"' package.json"
run_test "health-auto 脚本存在" "grep -q 'health-auto' package.json"
run_test "auto-exec 脚本存在" "grep -q 'auto-exec' package.json"

echo ""
echo "6. 测试脚本功能"
echo "------------------------"

run_test "auto-execute.sh help 命令" "bash scripts/auto-execute.sh help | grep -q '用法'"
run_test "auto-execute.sh health 命令" "bash scripts/auto-execute.sh health | grep -q '健康检查'"

echo ""
echo "7. 测试文档文件"
echo "------------------------"

run_test "自动化指南存在" "[ -f docs/automation-guide.md ]"
run_test "自动化总结存在" "[ -f AUTOMATION_SUMMARY.md ]"

echo ""
echo "=================================="
echo "测试结果汇总:"
echo -e "✅ 通过: ${GREEN}$test_passed${NC}"
echo -e "❌ 失败: ${RED}$test_failed${NC}"

if [ $test_failed -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}所有测试通过！自动化系统配置完成！${NC}"
    echo ""
    echo "现在你可以使用以下命令："
    echo "  pnpm dev                 # 智能启动开发服务器"
    echo "  pnpm run setup           # 自动设置项目"
    echo "  pnpm run health-auto     # 健康检查"
    echo "  pnpm run auto-exec help  # 查看自动化命令帮助"
else
    echo -e "\n⚠️ ${YELLOW}有 $test_failed 个测试失败，请检查配置${NC}"
fi

echo ""
echo "🔗 相关文档："
echo "  - docs/automation-guide.md    # 详细使用指南"
echo "  - AUTOMATION_SUMMARY.md       # 功能总结"