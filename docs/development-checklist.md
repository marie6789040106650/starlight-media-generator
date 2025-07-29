# 开发检查清单

## 🚀 开始开发前必须检查

### 包管理器确认
```bash
# 运行包管理器检查脚本
pnpm run check-pm
# 或者直接运行脚本
bash scripts/check-package-manager.sh
```

### 项目配置检查
- [ ] 确认使用正确的包管理器 (pnpm/npm/yarn)
- [ ] 检查 lock 文件类型
- [ ] 验证 package.json 中的限制
- [ ] 确认可用的脚本命令

### 常见命令映射

| 操作 | pnpm | npm | yarn |
|------|------|-----|------|
| 安装依赖 | `pnpm install` | `npm install` | `yarn install` |
| 启动开发 | `pnpm dev` | `npm run dev` | `yarn dev` |
| 构建项目 | `pnpm build` | `npm run build` | `yarn build` |
| 运行测试 | `pnpm test` | `npm test` | `yarn test` |
| 添加依赖 | `pnpm add <pkg>` | `npm install <pkg>` | `yarn add <pkg>` |

## 🔍 当前项目配置

根据检查脚本结果，本项目使用：
- **包管理器**: pnpm
- **Lock文件**: pnpm-lock.yaml
- **限制**: 只允许使用 pnpm (preinstall 脚本)

## ⚠️ 常见错误避免

1. **不要混用包管理器**
   - ❌ 错误: `npm install` 然后 `pnpm dev`
   - ✅ 正确: 统一使用 `pnpm install` 和 `pnpm dev`

2. **检查项目限制**
   - 如果有 `preinstall` 脚本，必须使用指定的包管理器
   - 不要强制绕过限制

3. **保持 lock 文件一致**
   - 不要同时存在多个 lock 文件
   - 提交时包含正确的 lock 文件

## 🛠️ 故障排除

### 如果命令执行失败
```bash
# 1. 检查包管理器配置
pnpm run check-pm

# 2. 清理并重新安装
rm -rf node_modules
rm package-lock.json yarn.lock  # 删除错误的 lock 文件
pnpm install  # 使用正确的包管理器

# 3. 使用智能启动脚本
pnpm run smart-dev
```

### 如果遇到权限问题
```bash
# 检查 preinstall 脚本
grep preinstall package.json

# 如果被阻止，使用正确的包管理器
pnpm install  # 而不是 npm install
```