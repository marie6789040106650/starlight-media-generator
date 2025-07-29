---
inclusion: always
---

# 错误恢复和自动重试策略

## 🔄 自动重试机制

### 文件操作错误处理
当遇到以下错误时自动重试：
- `Error(s) while reading file(s)` - 文件读取错误
- `Error(s) while creating` - 文件创建错误  
- `Error(s) while editing` - 文件编辑错误
- `ENOENT` - 文件不存在
- `EACCES` - 权限不足

### 重试策略
1. **立即重试**: 第一次失败后立即重试
2. **延迟重试**: 2秒后第二次重试
3. **长延迟重试**: 5秒后第三次重试
4. **最终重试**: 10秒后最后一次重试

### 重试过程中的操作
```bash
# 文件操作重试流程
1. 检查文件路径是否正确
2. 检查目录是否存在，不存在则创建
3. 检查文件权限
4. 尝试使用备用方法操作文件
5. 记录重试过程到日志
```

## 🛠️ 错误类型和解决方案

### 1. 开发服务器错误
**错误特征**: `next.config.mjs` 语法错误、端口占用
**自动解决方案**:
```bash
# 重启开发服务器
pkill -f "next dev" || true
sleep 3
pnpm dev
```

### 2. 文件系统错误
**错误特征**: 文件不存在、权限不足、路径错误
**自动解决方案**:
```bash
# 创建必要的目录结构
mkdir -p .kiro/hooks .kiro/steering .kiro/specs
# 修复文件权限
chmod 755 .kiro/
```

### 3. 依赖安装错误
**错误特征**: 包管理器错误、网络超时
**自动解决方案**:
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
pnpm install
```

### 4. 构建错误
**错误特征**: TypeScript 错误、模块找不到
**自动解决方案**:
```bash
# 类型检查和修复
pnpm run type-check
pnpm run lint --fix
```

## 🎯 智能任务继续策略

### 任务状态检查
1. **已完成任务**: 跳过，继续下一个
2. **进行中任务**: 检查是否可以恢复
3. **失败任务**: 分析失败原因，尝试修复或跳过
4. **未开始任务**: 检查依赖后开始执行

### 依赖关系处理
- **强依赖**: 必须等待前置任务完成
- **弱依赖**: 可以并行执行或跳过
- **无依赖**: 可以独立执行

### 错误隔离原则
- 单个任务失败不影响整个任务链
- 记录失败原因供后续分析
- 提供手动修复的建议

## 🔧 自动化命令执行

### 高优先级自动执行
```bash
# 这些命令遇到时自动执行，无需确认
pnpm install
pnpm dev
pnpm build
pnpm test
git status
ls -la
```

### 智能服务器管理
```bash
# 开发服务器智能重启脚本
#!/bin/bash
echo "🔍 检查开发服务器状态..."
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️ 关闭现有服务器..."
    pkill -f "next dev"
    sleep 3
fi
echo "🚀 启动开发服务器..."
pnpm dev &
sleep 5
echo "✅ 服务器启动完成"
```

## 📊 监控和日志

### 错误监控
- 实时监控任务执行状态
- 自动记录错误信息和恢复过程
- 统计重试成功率和失败模式

### 日志格式
```
[TIMESTAMP] [ERROR_RECOVERY] 错误类型: 具体错误信息
[TIMESTAMP] [RETRY_ATTEMPT] 重试次数: X/3
[TIMESTAMP] [RECOVERY_SUCCESS] 恢复成功，继续执行
[TIMESTAMP] [TASK_SKIP] 跳过失败任务，继续下一个
```

## ⚡ 性能优化

### 快速失败原则
- 快速识别无法恢复的错误
- 避免无意义的重试
- 及时跳转到下一个任务

### 资源管理
- 及时清理临时文件
- 释放被占用的端口和进程
- 优化内存使用

### 并行执行
- 独立任务可以并行执行
- 合理利用系统资源
- 避免资源竞争