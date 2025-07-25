#!/bin/bash

# 创建独立项目目录
TARGET_DIR="../two-page-ip-generator-clean"
mkdir -p "$TARGET_DIR"

# 复制基础项目结构
cp -r projects/two-page-ip-generator/* "$TARGET_DIR/"

echo "✅ 基础项目结构已复制"

# 复制必需的UI组件
UI_COMPONENTS=(
    "badge.tsx"
    "button.tsx" 
    "card.tsx"
    "input.tsx"
    "label.tsx"
    "select.tsx"
    "textarea.tsx"
)

echo "📦 复制UI组件..."
for component in "${UI_COMPONENTS[@]}"; do
    if [ -f "components/ui/$component" ]; then
        cp "components/ui/$component" "$TARGET_DIR/components/ui/"
        echo "  ✅ $component"
    else
        echo "  ❌ $component (不存在)"
    fi
done

# 复制业务组件
BUSINESS_COMPONENTS=(
    "form-section.tsx"
    "page-header.tsx"
    "progress-steps.tsx"
)

echo "🔧 复制业务组件..."
for component in "${BUSINESS_COMPONENTS[@]}"; do
    if [ -f "components/$component" ]; then
        cp "components/$component" "$TARGET_DIR/components/"
        echo "  ✅ $component"
    else
        echo "  ❌ $component (不存在)"
    fi
done

# 复制Hooks
echo "🎣 复制Hooks..."
if [ -d "hooks" ]; then
    cp -r hooks/* "$TARGET_DIR/hooks/"
    echo "  ✅ 所有hooks已复制"
else
    echo "  ❌ hooks目录不存在"
fi

# 复制lib工具
LIB_FILES=(
    "types.ts"
    "constants.ts" 
    "models.ts"
)

echo "📚 复制lib文件..."
for file in "${LIB_FILES[@]}"; do
    if [ -f "lib/$file" ]; then
        cp "lib/$file" "$TARGET_DIR/lib/"
        echo "  ✅ $file"
    else
        echo "  ❌ $file (不存在)"
    fi
done

# 清理不需要的UI组件
echo "🧹 清理不需要的UI组件..."
cd "$TARGET_DIR/components/ui"
for file in *.tsx; do
    if [[ ! " ${UI_COMPONENTS[@]} " =~ " ${file} " ]]; then
        rm "$file"
        echo "  🗑️  删除 $file"
    fi
done
cd - > /dev/null

echo ""
echo "🎉 独立项目创建完成！"
echo "📁 位置: $TARGET_DIR"
echo ""
echo "下一步："
echo "1. cd $TARGET_DIR"
echo "2. npm install"
echo "3. npm run build"
echo "4. npm run dev"