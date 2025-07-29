#!/bin/bash

echo "🚀 AI服务集成系统 - 快速启动"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 步骤1: 系统检查
echo -e "\n${BLUE}📋 步骤1: 系统完整性检查${NC}"
if node scripts/system-check.js; then
    echo -e "${GREEN}✅ 系统检查通过${NC}"
else
    echo -e "${RED}❌ 系统检查失败，请检查错误信息${NC}"
    exit 1
fi

# 步骤2: 依赖检查
echo -e "\n${BLUE}🔍 步骤2: 依赖检查${NC}"
if [ ! -d "node_modules/@vercel" ]; then
    echo -e "${YELLOW}⚠️  正在安装缺失的依赖...${NC}"
    pnpm install @vercel/kv
fi
echo -e "${GREEN}✅ 依赖检查完成${NC}"

# 步骤3: 启动开发服务器
echo -e "\n${BLUE}🚀 步骤3: 启动开发服务器${NC}"
node scripts/dev-server-manager.js start &
SERVER_PID=$!

# 等待服务器启动
echo -e "${YELLOW}⏳ 等待服务器启动...${NC}"
sleep 8

# 步骤4: 验证服务器状态
echo -e "\n${BLUE}🔍 步骤4: 验证服务器状态${NC}"
if node scripts/server-status.js | grep -q "活跃服务器"; then
    echo -e "${GREEN}✅ 服务器启动成功${NC}"
else
    echo -e "${RED}❌ 服务器启动失败${NC}"
    exit 1
fi

# 步骤5: 快速功能验证
echo -e "\n${BLUE}🧪 步骤5: 快速功能验证${NC}"
if node scripts/quick-verify.js; then
    echo -e "${GREEN}✅ 功能验证通过${NC}"
else
    echo -e "${YELLOW}⚠️  部分功能可能需要配置API密钥${NC}"
fi

# 显示有用信息
echo -e "\n${GREEN}🎉 系统启动完成！${NC}"
echo -e "\n${BLUE}📊 有用的命令:${NC}"
echo "  pnpm run server:status    # 检查服务器状态"
echo "  pnpm run logs:monitor     # 实时监控日志"
echo "  pnpm run logs:analyze     # 分析日志文件"
echo "  pnpm run dev:restart      # 重启服务器"

echo -e "\n${BLUE}🌐 API端点:${NC}"
echo "  http://localhost:3000/api/health/storage"
echo "  http://localhost:3000/api/config/ai-services"
echo "  http://localhost:3000/api/metrics/long-content"

echo -e "\n${BLUE}📖 文档:${NC}"
echo "  docs/DEV_SERVER_GUIDE.md  # 开发服务器完整指南"
echo "  START_HERE.md             # 快速开始指南"

echo -e "\n${GREEN}✨ 开发环境已就绪，开始你的开发之旅吧！${NC}"