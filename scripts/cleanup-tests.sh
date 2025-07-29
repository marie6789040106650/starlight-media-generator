#!/bin/bash

# 测试文件清理脚本
# 上线前运行此脚本删除所有测试相关文件

echo "🧹 开始清理测试文件..."

# 删除测试目录
if [ -d "tests" ]; then
    echo "删除 tests/ 目录..."
    rm -rf tests/
    echo "✅ tests/ 目录已删除"
else
    echo "⚠️  tests/ 目录不存在"
fi

# 删除临时测试文件
if [ -d "temp" ]; then
    echo "删除 temp/ 目录..."
    rm -rf temp/
    echo "✅ temp/ 目录已删除"
else
    echo "⚠️  temp/ 目录不存在"
fi

# 删除根目录下的测试文件
test_files=("test-fixes.html" "test-word-export.html" "test-copy-protection.html")
for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "删除 $file..."
        rm "$file"
        echo "✅ $file 已删除"
    fi
done

# 删除根目录下的测试组件文件
find . -maxdepth 1 -name "test-*.tsx" -o -name "test-*.ts" -o -name "test-*.jsx" -o -name "test-*.js" | while read -r file; do
    if [ -f "$file" ]; then
        echo "删除测试文件 $file..."
        rm "$file"
        echo "✅ $file 已删除"
    fi
done

# 删除测试页面
if [ -d "app/copy-test" ]; then
    echo "删除 app/copy-test/ 目录..."
    rm -rf app/copy-test/
    echo "✅ app/copy-test/ 目录已删除"
else
    echo "⚠️  app/copy-test/ 目录不存在"
fi

echo "🎉 测试文件清理完成！"
echo ""
echo "已清理的内容："
echo "- tests/ 目录"
echo "- temp/ 目录"  
echo "- test-*.html 文件"
echo "- app/copy-test/ 目录"
echo ""
echo "项目现在可以安全上线了！"