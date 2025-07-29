# 🔄 npm 到 pnpm 转换指南

## 为什么要用 pnpm？
- 更快的安装速度
- 节省磁盘空间
- 更严格的依赖管理
- 本项目专门为 pnpm 优化

## 🚀 一键设置别名

```bash
# 运行一次即可
pnpm run setup-npm-alias
```

## 设置后的效果

| 你输入的命令 | 实际执行的命令 |
|-------------|---------------|
| `npm install` | `pnpm install` |
| `npm run dev` | `pnpm run dev` |
| `npm run build` | `pnpm run build` |
| `npm start` | `pnpm start` |

## 手动设置（可选）

如果自动设置脚本不工作，可以手动添加到你的 shell 配置文件：

### zsh 用户 (~/.zshrc)
```bash
echo "alias npm='echo \"⚠️  请使用 pnpm 而不是 npm！正在为您执行 pnpm...\" && pnpm'" >> ~/.zshrc
source ~/.zshrc
```

### bash 用户 (~/.bashrc)
```bash
echo "alias npm='echo \"⚠️  请使用 pnpm 而不是 npm！正在为您执行 pnpm...\" && pnpm'" >> ~/.bashrc
source ~/.bashrc
```

## 移除别名

如果想移除别名，编辑对应的配置文件删除相关行即可。

---
💡 **提示**: 设置后重启终端或运行 `source ~/.zshrc` (或 `~/.bashrc`) 生效