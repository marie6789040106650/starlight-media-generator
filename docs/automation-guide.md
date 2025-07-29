# Kiro 自动化使用指南

## 🎯 概述

现在你的项目已经配置了完整的自动化执行策略，Kiro 可以：

1. **自动信任和执行常用命令**
2. **智能管理开发服务器**（自动检查、关闭、重启）
3. **自动进行后续步骤**，避免长时间等待

## 🚀 快速开始

### 启动开发服务器
```bash
# 现在 pnpm dev 会自动检查并重启服务器
pnpm dev

# 或者使用专门的重启命令
pnpm run dev:restart
```

### 自动化命令执行
```bash
# 自动设置和启动项目
pnpm run setup

# 健康检查和自动修复
pnpm run health-auto

# 使用自动执行脚本
pnpm run auto-exec dev    # 智能启动开发服务器
pnpm run auto-exec health # 健康检查
```

## 🤖 自动化规则

### 高优先级命令（自动执行）
- `pnpm install` / `npm install`
- `pnpm dev` / `npm run dev`
- `pnpm build` / `npm run build`
- `pnpm test` / `npm test`
- `git status` / `git diff`
- 基础文件操作（`ls`, `cat`, `grep`）

### 中优先级命令（自动确认）
- `pkill -f "next dev"` - 关闭开发服务器
- `rm -rf node_modules` - 删除依赖
- Git 操作（`git add`, `git commit`）

### 智能开发服务器管理
每次启动开发服务器时会自动：
1. 检查现有进程
2. 强制关闭冲突进程
3. 等待进程完全关闭
4. 重新启动服务器
5. 验证启动状态

## 🔧 Kiro Hooks

### 自动重试 Hook
- **触发条件**: 遇到文件操作错误、网络错误等
- **功能**: 自动重试最多3次，间隔递增
- **状态**: 已启用自动批准

### 智能任务继续 Hook
- **触发方式**: 手动触发 "🔄 智能继续任务"
- **功能**: 分析错误并继续执行下一个任务
- **状态**: 已启用自动批准

### 自动命令执行 Hook
- **触发条件**: 需要执行命令时
- **功能**: 根据优先级自动执行或确认命令
- **状态**: 已启用自动批准

## 📋 常用场景

### 场景1: 启动开发环境
```bash
# 一键启动（会自动处理所有冲突）
pnpm dev
```

### 场景2: 项目健康检查
```bash
# 自动检查并修复常见问题
pnpm run health-auto
```

### 场景3: 完整重建项目
```bash
# 清理并重建
pnpm run build:clean
```

### 场景4: 遇到错误时
- Kiro 会自动重试文件操作错误
- 开发服务器问题会自动重启
- 可以手动触发 "智能继续任务" Hook

## ⚙️ 配置文件

### Steering 规则
- `.kiro/steering/automation-rules.md` - 自动化执行规则
- `.kiro/steering/error-recovery-strategy.md` - 错误恢复策略

### Hook 配置
- `.kiro/hooks/auto-command-execution.kiro.hook` - 自动命令执行
- `.kiro/hooks/auto-retry-on-error.kiro.hook` - 自动重试
- `.kiro/hooks/smart-task-continuation.kiro.hook` - 智能任务继续

### 脚本文件
- `scripts/dev-restart.sh` - 智能开发服务器重启
- `scripts/auto-execute.sh` - 自动化命令执行

## 🎛️ 自定义配置

### 修改自动信任命令
编辑 `.kiro/hooks/auto-command-execution.kiro.hook` 中的 `commandRules` 部分。

### 调整重试策略
编辑 `.kiro/hooks/auto-retry-on-error.kiro.hook` 中的 `retryConfig` 部分。

### 添加新的自动化规则
在 `.kiro/steering/automation-rules.md` 中添加新规则。

## 🔍 监控和日志

### 查看执行日志
```bash
# 查看详细日志
cat dev.log

# 实时监控日志
tail -f dev.log
```

### 检查进程状态
```bash
# 检查开发服务器进程
ps aux | grep "next dev"

# 检查端口占用
lsof -i :3000
```

## 🚨 故障排除

### 开发服务器无法启动
1. 运行 `pnpm run dev:restart` 强制重启
2. 检查端口占用：`lsof -i :3000`
3. 手动清理进程：`pkill -f "next dev"`

### 自动化不工作
1. 检查 Hook 是否启用
2. 查看 `dev.log` 了解错误信息
3. 手动触发 "智能继续任务" Hook

### 权限问题
```bash
# 确保脚本有执行权限
chmod +x scripts/*.sh
```

## 💡 最佳实践

1. **定期查看日志**: 了解自动化执行情况
2. **合理使用 Hook**: 遇到问题时主动触发智能继续
3. **保持配置更新**: 根据项目需要调整自动化规则
4. **监控资源使用**: 避免过多的自动重试消耗资源

现在你的 Kiro 已经具备了智能自动化能力，可以大大减少手动干预，提高开发效率！