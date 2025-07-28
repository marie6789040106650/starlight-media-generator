#!/bin/bash

# 文件恢复脚本
# 用于在测试失败时恢复所有移动的文件

echo "🔄 开始恢复文件..."

# 读取移动记录并恢复
while IFS='|' read -r original_path new_path move_time description; do
    # 跳过表头和空行
    if [[ "$original_path" == *"原路径"* ]] || [[ -z "$original_path" ]]; then
        continue
    fi
    
    # 清理路径中的空格
    original_path=$(echo "$original_path" | xargs)
    new_path=$(echo "$new_path" | xargs)
    
    if [[ -f "$new_path" ]] || [[ -d "$new_path" ]]; then
        echo "📁 恢复: $new_path -> $original_path"
        
        # 创建目标目录（如果不存在）
        mkdir -p "$(dirname "$original_path")"
        
        # 移动文件回原位置
        mv "$new_path" "$original_path"
        
        if [[ $? -eq 0 ]]; then
            echo "✅ 恢复成功: $original_path"
        else
            echo "❌ 恢复失败: $original_path"
        fi
    else
        echo "⚠️  文件不存在，跳过: $new_path"
    fi
done < cleanup-log.md

echo "🎉 文件恢复完成！"