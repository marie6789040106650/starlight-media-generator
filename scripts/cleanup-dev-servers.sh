#!/bin/bash

# 清理多余的开发服务器脚本

echo "🧹 清理多余的开发服务器进程..."
echo "=================================================="

# 获取所有相关进程
next_pids=$(ps aux | grep -E "next-server|next dev" | grep -v grep | awk '{print $2}')
pnpm_pids=$(ps aux | grep -E "pnpm.*dev" | grep -v grep | awk '{print $2}')

if [ -z "$next_pids" ] && [ -z "$pnpm_pids" ]; then
    echo "✅ 没有发现运行中的开发服务器"
    exit 0
fi

echo "🔍 发现以下进程:"
if [ ! -z "$next_pids" ]; then
    echo "Next.js 服务器进程:"
    for pid in $next_pids; do
        ps -p $pid -o pid,pcpu,pmem,time,command | tail -1
    done
fi

if [ ! -z "$pnpm_pids" ]; then
    echo "pnpm dev 进程:"
    for pid in $pnpm_pids; do
        ps -p $pid -o pid,pcpu,pmem,time,command | tail -1
    done
fi

echo ""
read -p "❓ 是否要停止所有开发服务器? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🛑 正在停止所有开发服务器..."
    
    # 优雅地停止进程
    if [ ! -z "$next_pids" ]; then
        for pid in $next_pids; do
            echo "  停止 Next.js 进程 $pid..."
            kill -TERM $pid 2>/dev/null
        done
    fi
    
    if [ ! -z "$pnpm_pids" ]; then
        for pid in $pnpm_pids; do
            echo "  停止 pnpm 进程 $pid..."
            kill -TERM $pid 2>/dev/null
        done
    fi
    
    # 等待进程停止
    echo "⏳ 等待进程停止..."
    sleep 3
    
    # 检查是否还有进程在运行
    remaining_next=$(ps aux | grep -E "next-server|next dev" | grep -v grep | wc -l)
    remaining_pnpm=$(ps aux | grep -E "pnpm.*dev" | grep -v grep | wc -l)
    
    if [ $remaining_next -gt 0 ] || [ $remaining_pnpm -gt 0 ]; then
        echo "⚠️  仍有进程在运行，强制停止..."
        pkill -f "next-server" 2>/dev/null
        pkill -f "pnpm.*dev" 2>/dev/null
        sleep 2
    fi
    
    # 最终检查
    final_check=$(ps aux | grep -E "next-server|next dev|pnpm.*dev" | grep -v grep | wc -l)
    if [ $final_check -eq 0 ]; then
        echo "✅ 所有开发服务器已停止"
        echo ""
        echo "🚀 现在可以启动新的开发服务器:"
        echo "   pnpm run dev"
    else
        echo "❌ 部分进程可能仍在运行，请手动检查"
        ps aux | grep -E "next-server|next dev|pnpm.*dev" | grep -v grep
    fi
else
    echo "❌ 取消操作"
fi