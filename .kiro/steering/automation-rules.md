# Kiro 自动化执行规则

## 🤖 自动信任和执行策略

### 1. 命令自动信任规则
当遇到需要执行命令时，按照以下优先级自动选择最小权限选项：

#### 高优先级自动信任命令
- `pnpm install` / `npm install` - 安装依赖
- `pnpm dev` / `npm run dev` - 启动开发服务器
- `pnpm build` / `npm run build` - 构建项目
- `pnpm test` / `npm test` - 运行测试
- `pnpm run cleanup` - 清理临时文件
- `git status` / `git diff` - 查看状态
- `ls` / `cat` / `grep` - 基础文件操作
- `mkdir -p` - 创建目录结构
- `chmod 644` / `chmod 755` - 修复文件权限
- `touch` - 创建空文件
- `lsof` - 检查文件占用
- `df -h` - 检查磁盘空间

#### 中优先级命令（需要确认但可自动执行）
- `pkill -f "next dev"` - 关闭开发服务器
- `rm -rf node_modules` - 删除依赖目录
- `git add .` / `git commit` - Git 操作

#### 低优先级命令（需要明确授权）
- 系统级别的安装命令
- 修改系统配置的命令
- 删除重要文件的命令

### 2. 自动后续步骤执行
执行命令后自动进行相关后续操作：

#### 开发服务器管理
```bash
# 检查并重启开发服务器的完整流程
pkill -f "next dev" || true
sleep 2
pnpm dev
```

#### 依赖安装后续
```bash
# 安装依赖后自动检查
pnpm install
pnpm run type-check || true
```

#### 构建后续检查
```bash
# 构建后自动验证
pnpm build
ls -la .next/
```

### 3. 开发服务器智能管理

#### 日志记录规则 📝
- **始终记录日志**: 开发服务器的所有输出都要保存到日志文件
- **日志文件位置**: `logs/dev-server.log`
- **日志轮转**: 每天创建新的日志文件，保留最近7天
- **错误日志**: 单独记录错误信息到 `logs/dev-server-error.log`
- **分析便利**: 日志格式要便于后续分析和问题排查
- **实时监控**: 可以通过 `tail -f logs/dev-server.log` 实时查看日志

#### 启动前检查流程
1. **检查现有进程**: `ps aux | grep "next dev"`
2. **强制关闭**: `pkill -f "next dev" || true`
3. **等待关闭**: `sleep 2`
4. **创建日志目录**: `mkdir -p logs`
5. **重新启动**: `pnpm dev > logs/dev-server.log 2>&1 &`
6. **验证启动**: 检查端口占用情况和日志输出

#### 自动化脚本
```bash
#!/bin/bash
# 智能重启开发服务器（带日志记录）

# 创建日志目录
mkdir -p logs

# 生成带时间戳的日志文件名
LOG_FILE="logs/dev-server-$(date +%Y%m%d).log"
ERROR_LOG="logs/dev-server-error-$(date +%Y%m%d).log"

echo "🔍 检查现有开发服务器..."
if pgrep -f "next dev" > /dev/null; then
    echo "⚠️  发现运行中的开发服务器，正在关闭..." | tee -a "$LOG_FILE"
    pkill -f "next dev"
    sleep 3
    echo "✅ 已关闭现有服务器" | tee -a "$LOG_FILE"
else
    echo "✅ 没有运行中的开发服务器" | tee -a "$LOG_FILE"
fi

echo "🚀 启动新的开发服务器..." | tee -a "$LOG_FILE"
echo "📝 日志文件: $LOG_FILE"
echo "❌ 错误日志: $ERROR_LOG"

# 启动开发服务器并记录日志
pnpm dev > "$LOG_FILE" 2> "$ERROR_LOG" &

# 清理旧日志文件（保留7天）
find logs/ -name "dev-server-*.log" -mtime +7 -delete 2>/dev/null || true
find logs/ -name "dev-server-error-*.log" -mtime +7 -delete 2>/dev/null || true

echo "✅ 开发服务器已启动，日志记录中..."
```

## 🎯 执行策略配置

### 自动执行模式
- **Autopilot 模式**: 启用时自动执行所有高优先级命令
- **Supervised 模式**: 执行前显示命令但自动确认
- **Manual 模式**: 需要手动确认每个命令

### 模型选择自动化
- **首选模型**: Claude Sonnet 4.0
- **备用模型**: Claude Sonnet 3.7
- **自动切换**: 检测到模型不可用时自动切换到备用模型
- **后台监控**: 每30秒检查首选模型是否恢复可用
- **无缝恢复**: 首选模型恢复后自动切换回去
- **任务连续性**: 模型切换不中断当前任务执行

### 超时处理
- **命令超时**: 30秒后自动取消长时间运行的命令
- **服务启动超时**: 60秒后认为启动失败
- **网络请求超时**: 10秒后重试
- **模型切换超时**: 5秒内完成模型切换

### 错误恢复
- **自动重试**: 网络相关错误自动重试3次
- **回滚机制**: 关键操作失败时自动回滚
- **状态保存**: 执行过程中保存检查点
- **模型故障恢复**: 自动切换到可用模型并继续执行

## 🔧 实用工具命令

### 快速重启开发环境
```bash
# 一键重启完整开发环境
pnpm run dev:restart
```

### 健康检查
```bash
# 检查项目状态
pnpm run health-check
```

### 自动清理和重建
```bash
# 完整重建项目
pnpm run rebuild
```

## 📋 自动化检查清单

### 每次启动前
- [ ] 检查端口占用情况
- [ ] 验证依赖完整性
- [ ] 清理临时文件
- [ ] 检查环境变量

### 执行过程中
- [ ] 监控命令执行状态
- [ ] 记录执行日志
- [ ] 处理异常情况
- [ ] 更新进度状态

### 执行完成后
- [ ] 验证结果正确性
- [ ] 清理临时资源
- [ ] 更新状态记录
- [ ] 准备下一步操作

## ⚡ 性能优化

### 并行执行
- 同时执行多个独立任务
- 合理利用系统资源
- 避免不必要的等待

### 缓存策略
- 缓存常用命令结果
- 复用已有的构建产物
- 智能跳过重复操作

### 资源管理
- 及时释放不用的资源
- 监控内存和CPU使用
- 优化文件I/O操作