#!/bin/bash

# 检查开发服务器状态脚本

echo "🔍 检查当前运行的开发服务器..."
echo "=================================================="

# 查找所有相关进程
echo "📊 当前运行的 Next.js 开发服务器:"
ps aux | grep -E "next-server|next dev" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    cpu=$(echo $line | awk '{print $3}')
    mem=$(echo $line | awk '{print $4}')
    time=$(echo $line | awk '{print $10}')
    echo "  PID: $pid | CPU: $cpu% | MEM: $mem% | TIME: $time"
done

echo ""
echo "📊 当前运行的 pnpm 进程:"
ps aux | grep -E "pnpm.*dev" | grep -v grep | while read line; do
    pid=$(echo $line | awk '{print $2}')
    cpu=$(echo $line | awk '{print $3}')
    mem=$(echo $line | awk '{print $4}')
    command=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}')
    echo "  PID: $pid | CPU: $cpu% | MEM: $mem% | CMD: $command"
done

echo ""
echo "🌐 检查端口占用情况:"
for port in 3000 3001 3002 3003; do
    if lsof -i :$port >/dev/null 2>&1; then
        process=$(lsof -i :$port | tail -1 | awk '{print $1, $2}')
        echo "  端口 $port: 被占用 ($process)"
    else
        echo "  端口 $port: 空闲"
    fi
done

echo ""
echo "💡 建议操作:"

# 统计进程数量
next_count=$(ps aux | grep -E "next-server|next dev" | grep -v grep | wc -l)
pnpm_count=$(ps aux | grep -E "pnpm.*dev" | grep -v grep | wc -l)

if [ $next_count -gt 1 ]; then
    echo "  ⚠️  发现 $next_count 个 Next.js 服务器在运行，建议只保留一个"
    echo "  💡 可以运行: ./scripts/cleanup-dev-servers.sh 来清理多余进程"
fi

if [ $pnpm_count -gt 1 ]; then
    echo "  ⚠️  发现 $pnpm_count 个 pnpm dev 进程在运行"
    echo "  💡 可能有重复的开发服务器启动"
fi

if [ $next_count -eq 0 ]; then
    echo "  ✅ 没有开发服务器在运行，可以启动: pnpm run dev"
elif [ $next_count -eq 1 ]; then
    echo "  ✅ 只有一个开发服务器在运行，状态正常"
fi

echo ""
echo "🚀 快速操作命令:"
echo "  启动开发服务器: pnpm run dev"
echo "  清理多余进程:   ./scripts/cleanup-dev-servers.sh"
echo "  检查端口状态:   lsof -i :3000"
echo "  强制杀死进程:   pkill -f 'next-server'"