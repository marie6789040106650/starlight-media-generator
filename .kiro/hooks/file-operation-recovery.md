# 文件操作错误自动恢复 Hook

## 触发条件
- 检测到 `Error(s) while editing` 错误
- 检测到 `Error(s) while creating` 错误
- 检测到 `ENOENT` 或 `EACCES` 错误
- 文件操作失败超过 2 次

## 自动执行流程

### 1. 立即诊断
```bash
# 检查目标文件状态
ls -la [target_file_path]
# 检查目录权限
ls -ld [target_directory]
# 检查磁盘空间
df -h .
```

### 2. 自动修复步骤

#### 步骤 1: 目录结构修复
```bash
# 确保目录存在
mkdir -p $(dirname [target_file_path])
# 修复目录权限
chmod 755 $(dirname [target_file_path])
```

#### 步骤 2: 文件权限修复
```bash
# 如果文件存在，修复权限
if [ -f [target_file_path] ]; then
    chmod 644 [target_file_path]
fi
```

#### 步骤 3: 进程冲突解决
```bash
# 检查是否有进程占用文件
lsof [target_file_path] 2>/dev/null || true
# 等待文件释放
sleep 1
```

#### 步骤 4: 重新尝试操作
- 使用备用方法创建/编辑文件
- 如果仍然失败，创建临时文件后移动
- 记录详细错误信息供分析

### 3. 智能重试机制
```javascript
const retryConfig = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 1.5,
  jitter: true
}
```

### 4. 失败后的备用方案
- 使用系统临时目录创建文件
- 尝试不同的文件操作方法
- 降级到只读模式继续执行
- 跳过当前操作，记录待处理

## 预防措施

### 环境检查
- 启动时检查文件系统权限
- 监控磁盘空间使用情况
- 检测可能的文件锁定

### 资源管理
- 及时关闭文件句柄
- 清理临时文件
- 避免并发文件操作

## 监控和日志

### 错误统计
- 记录每种错误类型的发生频率
- 分析错误模式和趋势
- 优化修复策略

### 性能监控
- 监控修复操作的耗时
- 统计成功率
- 识别需要优化的环节

## 用户通知

### 静默修复
对于常见的、可自动修复的错误，静默处理不打断用户。

### 进度提示
对于需要较长时间的修复操作，显示进度提示。

### 失败报告
对于无法自动修复的错误，提供详细的错误报告和建议。