# AI 助手开发指南

## 🤖 执行命令前的必要检查

### 强制检查清单
在执行任何包管理器命令前，AI 助手必须：

1. **读取 package.json**
   ```bash
   # 检查包管理器配置
   cat package.json | grep -E "(packageManager|preinstall)"
   ```

2. **检查 lock 文件**
   ```bash
   # 确认项目使用的包管理器
   ls -la | grep -E "(pnpm-lock|yarn.lock|package-lock)"
   ```

3. **使用检查脚本**
   ```bash
   # 运行自动检查
   bash scripts/check-package-manager.sh
   ```

### 命令执行规则

#### ✅ 正确做法
```bash
# 1. 先检查配置
bash scripts/check-package-manager.sh

# 2. 根据结果使用正确命令
pnpm dev  # 如果项目使用 pnpm
yarn dev  # 如果项目使用 yarn
npm run dev  # 如果项目使用 npm
```

#### ❌ 错误做法
```bash
# 不要直接假设使用某个包管理器
npm run dev  # 可能与项目配置不符
```

### 自动化解决方案

#### 使用智能脚本
```bash
# 让脚本自动检测并使用正确的包管理器
pnpm smart-dev
# 或者
bash scripts/smart-dev.sh
```

## 🔍 常见项目配置识别

### pnpm 项目特征
- 存在 `pnpm-lock.yaml`
- package.json 中有 `"packageManager": "pnpm@x.x.x"`
- preinstall 脚本包含 `only-allow pnpm`

### npm 项目特征
- 存在 `package-lock.json`
- 没有其他包管理器的 lock 文件
- 没有包管理器限制

### yarn 项目特征
- 存在 `yarn.lock`
- package.json 中可能有 `"packageManager": "yarn@x.x.x"`
- preinstall 脚本包含 `only-allow yarn`

## 🚨 错误预防机制

### 1. 命令执行前验证
```javascript
// 伪代码：AI 助手内部检查逻辑
function executeCommand(command) {
  if (command.includes('npm') || command.includes('yarn') || command.includes('pnpm')) {
    // 先检查项目配置
    const projectConfig = checkPackageManager();
    const correctPM = projectConfig.packageManager;
    
    if (!command.startsWith(correctPM)) {
      throw new Error(`项目配置要求使用 ${correctPM}，但命令使用了其他包管理器`);
    }
  }
  
  // 执行命令
  return runCommand(command);
}
```

### 2. 提供修正建议
当检测到错误时，应该：
- 指出错误的原因
- 提供正确的命令
- 解释为什么要使用特定的包管理器

### 3. 学习和记忆
- 记住每个项目的包管理器配置
- 在后续操作中自动使用正确的工具
- 避免重复相同的错误

## 📝 最佳实践

1. **总是先检查，再执行**
2. **使用项目提供的智能脚本**
3. **保持配置一致性**
4. **提供清晰的错误说明**
5. **学习项目特定的配置**