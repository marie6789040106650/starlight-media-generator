#!/bin/bash

# 项目健康检查脚本
# 用于定期检查项目是否符合开发规则

echo "🔍 开始项目健康检查..."
echo "================================"

# 检查必要目录
echo "📁 检查目录结构..."
required_dirs=("tests" "docs" "components" "lib" "utils" "config")
missing_dirs=()

for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ 缺少目录: $dir"
        missing_dirs+=("$dir")
    else
        echo "✅ 目录存在: $dir"
    fi
done

# 检查测试文件结构
echo ""
echo "🧪 检查测试文件结构..."
if [ -d "tests" ]; then
    test_subdirs=("unit" "integration" "fixtures" "scripts" "config")
    for subdir in "${test_subdirs[@]}"; do
        if [ -d "tests/$subdir" ]; then
            echo "✅ 测试子目录存在: tests/$subdir"
        else
            echo "⚠️  测试子目录缺失: tests/$subdir"
        fi
    done
else
    echo "❌ 测试目录不存在"
fi

# 检查临时文件
echo ""
echo "🗂️  检查临时文件..."
if [ -d "temp" ]; then
    temp_files=$(find temp -type f 2>/dev/null | wc -l)
    if [ $temp_files -gt 0 ]; then
        echo "⚠️  临时目录存在，包含 $temp_files 个文件"
        echo "   建议检查是否需要迁移重要文件"
    else
        echo "✅ 临时目录为空"
    fi
else
    echo "✅ 无临时文件目录"
fi

# 检查大文件
echo ""
echo "📏 检查文件大小..."
large_files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l 2>/dev/null | awk '$1 > 500 {print $2 " (" $1 " lines)"}' | grep -v total)

if [ -n "$large_files" ]; then
    echo "⚠️  发现大文件 (>500行):"
    echo "$large_files"
else
    echo "✅ 所有代码文件都符合大小要求"
fi

# 检查根目录文件数量
echo ""
echo "🏠 检查根目录整洁度..."
root_files=$(ls -1 | wc -l)
if [ $root_files -gt 20 ]; then
    echo "⚠️  根目录文件过多 ($root_files 个文件)"
    echo "   建议整理到相应的子目录"
else
    echo "✅ 根目录文件数量合理 ($root_files 个文件)"
fi

# 检查测试文件分布
echo ""
echo "🔍 检查测试文件分布..."
scattered_tests=$(find . -name "*test*" -type f ! -path "./tests/*" ! -path "./node_modules/*" ! -path "./.next/*")

if [ -n "$scattered_tests" ]; then
    echo "⚠️  发现散落的测试文件:"
    echo "$scattered_tests"
else
    echo "✅ 所有测试文件都在tests目录下"
fi

# 检查清理脚本
echo ""
echo "🧹 检查清理脚本..."
if [ -f "scripts/cleanup-tests.sh" ]; then
    if [ -x "scripts/cleanup-tests.sh" ]; then
        echo "✅ 清理脚本存在且可执行"
    else
        echo "⚠️  清理脚本存在但不可执行"
        echo "   运行: chmod +x scripts/cleanup-tests.sh"
    fi
else
    echo "❌ 清理脚本不存在"
fi

# 检查package.json脚本
echo ""
echo "📦 检查package.json脚本..."
if [ -f "package.json" ]; then
    if grep -q '"cleanup"' package.json; then
        echo "✅ cleanup脚本已配置"
    else
        echo "⚠️  package.json中缺少cleanup脚本"
    fi
    
    if grep -q '"prebuild".*cleanup' package.json; then
        echo "✅ prebuild自动清理已配置"
    else
        echo "⚠️  prebuild自动清理未配置"
    fi
else
    echo "❌ package.json不存在"
fi

# 生成健康报告
echo ""
echo "================================"
echo "📊 健康检查报告"
echo "================================"

# 计算健康分数
total_checks=8
passed_checks=0

[ ${#missing_dirs[@]} -eq 0 ] && ((passed_checks++))
[ -d "tests" ] && ((passed_checks++))
[ ! -d "temp" ] || [ $(find temp -type f 2>/dev/null | wc -l) -eq 0 ] && ((passed_checks++))
[ -z "$large_files" ] && ((passed_checks++))
[ $root_files -le 20 ] && ((passed_checks++))
[ -z "$scattered_tests" ] && ((passed_checks++))
[ -f "scripts/cleanup-tests.sh" ] && [ -x "scripts/cleanup-tests.sh" ] && ((passed_checks++))
[ -f "package.json" ] && grep -q '"cleanup"' package.json && ((passed_checks++))

health_score=$((passed_checks * 100 / total_checks))

echo "健康分数: $health_score% ($passed_checks/$total_checks)"

if [ $health_score -ge 90 ]; then
    echo "🎉 项目健康状况优秀！"
elif [ $health_score -ge 70 ]; then
    echo "👍 项目健康状况良好，有少量需要改进的地方"
else
    echo "⚠️  项目需要改进，请根据上述建议进行调整"
fi

echo ""
echo "🔧 建议的修复命令:"
echo "pnpm run cleanup  # 清理测试文件"
echo "bash scripts/project-health-check.sh  # 重新检查"

echo ""
echo "✅ 健康检查完成"