# 🚀 快速开始

## 启动开发服务器
```bash
# 标准开发模式 ✅
pnpm dev              # ⭐ 推荐
pnpm run dev          # 等效

# 智能开发模式
pnpm run smart-dev    # 包含额外优化功能
```

## 🎯 重要说明
- **标准模式**: `pnpm dev` 使用 Next.js 标准开发服务器
- **智能模式**: `pnpm run smart-dev` 包含端口管理和环境检测

## 🔄 可选：系统级别 npm 别名
```bash
# 如果想在所有项目中都用 pnpm 替代 npm
pnpm run setup-npm-alias
```

## 常用别名
```bash
pnpm dev           # = next dev ⭐ 推荐
pnpm run smart-dev # = 智能启动脚本
pnpm run serve     # = smart-dev
pnpm run 开发       # = smart-dev
pnpm run 构建       # = build
pnpm run 清理       # = cleanup
```

## 端口问题？
```bash
pnpm run port-kill  # 杀死占用端口的进程
```

---
💡 **提示**: 如果忘记命令，运行 `pnpm run` 查看所有可用脚本