# 开发命令说明

## 🔄 dev 脚本配置变更

### 当前配置
```json
"dev": "next dev"
```

### 智能启动配置
```json
"smart-dev": "bash scripts/smart-dev.sh"
```

## 🎯 配置说明

### 1. **标准开发模式**
- `pnpm dev` 使用标准的 Next.js 开发服务器
- 简单直接，符合 Next.js 项目标准
- 适合大多数开发场景

### 2. **智能开发模式**
- `pnpm run smart-dev` 使用智能启动脚本
- 包含额外的优化功能和环境检测
- 自动端口管理和冲突检测
- 更好的错误处理和日志输出

### 3. **灵活选择**
- 开发者可根据需要选择不同的启动方式
- 保持了多种启动选项的兼容性
- 支持中文命令（`pnpm run 开发`）

## 📋 所有启动方式

```bash
# 标准方式（推荐）
pnpm dev
pnpm run dev

# 智能启动方式
pnpm run smart-dev

# 别名方式
pnpm run serve
pnpm run 开发
```

## ⚠️ 注意事项

1. **包管理器检查**: 项目配置了 `preinstall` 钩子，强制使用 pnpm
2. **端口管理**: 如果 3000 端口被占用，脚本会自动处理
3. **环境检查**: 启动前会进行必要的环境检查

## 🧪 开发命令配置测试

### 新增功能
为了确保开发命令配置的正确性，项目新增了配置测试功能：

```bash
# 测试开发命令配置
pnpm run test-dev-config
```

### 测试内容
- 验证dev脚本是否正确配置为使用smart-dev.sh
- 检查smart-dev.sh脚本是否存在和可执行
- 确认所有开发命令都指向智能启动脚本
- 提供配置问题的诊断和修复建议

## 🔄 npm 别名设置

### 新增功能
为了方便习惯使用 npm 命令的开发者，项目新增了自动别名设置功能：

```bash
# 设置npm到pnpm的别名
pnpm run setup-npm-alias
```

### 设置效果
设置后，在终端中输入 npm 命令会自动转换为 pnpm：
- `npm install` → `pnpm install`
- `npm run dev` → `pnpm run dev`
- `npm run build` → `pnpm run build`

### 使用场景
- 团队成员习惯使用 npm 命令
- 避免因误用 npm 导致的包管理器冲突
- 提供更友好的开发体验

## 🛠️ 故障排除

如果启动失败，可以尝试：
```bash
# 检查端口状态
pnpm run port-status

# 杀死占用端口的进程
pnpm run port-kill

# 项目健康检查
pnpm run health-check

# 测试开发命令配置
pnpm run test-dev-config

# 设置npm别名（如果需要）
pnpm run setup-npm-alias
```