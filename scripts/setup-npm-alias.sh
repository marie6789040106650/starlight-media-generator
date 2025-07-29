#!/bin/bash

# 设置 npm 到 pnpm 的别名脚本
# 运行此脚本后，在终端中输入 npm 会自动使用 pnpm

echo "🔧 设置 npm 到 pnpm 的别名..."

# 检测当前使用的shell
if [[ $SHELL == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
    echo "检测到 zsh shell"
elif [[ $SHELL == *"bash"* ]]; then
    SHELL_RC="$HOME/.bashrc"
    echo "检测到 bash shell"
else
    echo "⚠️  未知的shell类型: $SHELL"
    echo "请手动添加以下别名到您的shell配置文件："
    echo "alias npm='echo \"⚠️  请使用 pnpm 而不是 npm！\" && pnpm'"
    exit 1
fi

# 检查是否已经存在别名
if grep -q "alias npm=" "$SHELL_RC" 2>/dev/null; then
    echo "✅ npm 别名已存在"
else
    echo "" >> "$SHELL_RC"
    echo "# npm 到 pnpm 的别名 (由 starlight-media-generator 项目添加)" >> "$SHELL_RC"
    echo "alias npm='echo \"⚠️  请使用 pnpm 而不是 npm！正在为您执行 pnpm...\" && pnpm'" >> "$SHELL_RC"
    echo "✅ 已添加 npm 别名到 $SHELL_RC"
fi

echo ""
echo "🎉 设置完成！"
echo ""
echo "现在您可以："
echo "1. 重新启动终端，或者运行: source $SHELL_RC"
echo "2. 输入 'npm install' 会自动转换为 'pnpm install'"
echo "3. 输入 'npm run dev' 会自动转换为 'pnpm run dev'"
echo ""
echo "💡 提示: 如果要移除别名，请编辑 $SHELL_RC 文件"