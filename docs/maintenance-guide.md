# 项目维护指南

## 📋 维护任务清单

### 日常维护 (每日)
```bash
# 快速健康检查
pnpm run health-check

# 检查临时文件
ls -la temp/ 2>/dev/null || echo "无临时文件目录"
```

### 周度维护 (每周)
```bash
# 完整健康检查
pnpm run health-check

# 清理测试文件
pnpm run cleanup

# 检查代码质量
pnpm run lint

# 运行测试
pnpm test
```

### 月度维护 (每月)
- 审查 CHANGELOG.md 更新情况
- 检查文档是否需要更新
- 评估规则执行效果
- 优化工具脚本

## 🔧 维护工具使用

### 健康检查工具
```bash
# 运行完整的项目健康检查
pnpm run health-check

# 检查结果说明:
# ✅ 通过检查
# ⚠️  需要注意
# ❌ 需要修复
```

### 清理工具
```bash
# 清理所有测试文件
pnpm run cleanup

# 手动清理特定目录
rm -rf tests/temp/*
```

### 结构检查
```bash
# 检查大文件
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -10

# 检查测试文件分布
find . -name "*test*" -type f ! -path "./node_modules/*"

# 检查根目录文件数量
ls -1 | wc -l
```

## 🚨 问题排查手册

### 问题1: 临时文件丢失
**症状**: temp/d/ 目录下的重要文件消失
**排查步骤**:
1. 检查 `public/templates/` 是否有备份
2. 查看 CHANGELOG.md 确认迁移记录
3. 检查 `tests/fixtures/` 相关测试数据

**解决方案**:
```bash
# 从备份位置恢复
cp public/templates/* temp/d/ 2>/dev/null || echo "无备份文件"
```

### 问题2: 测试文件散乱
**症状**: 测试文件不在tests目录下
**排查步骤**:
```bash
# 查找所有测试文件
find . -name "*test*" -type f ! -path "./tests/*" ! -path "./node_modules/*"
```

**解决方案**:
```bash
# 移动测试文件到正确位置
mkdir -p tests/temp
mv test-*.html tests/temp/ 2>/dev/null || echo "无散乱测试文件"
```

### 问题3: 构建失败
**症状**: 构建时找不到文件
**排查步骤**:
1. 检查最近的文件变更记录
2. 确认依赖文件位置
3. 验证import路径

**解决方案**:
```bash
# 重新安装依赖
pnpm install

# 清理并重新构建
pnpm run cleanup
pnpm run build
```

## 📊 质量监控

### 关键指标
- **模块化程度**: 单文件 < 500行
- **测试覆盖**: 测试文件在tests目录
- **结构清洁**: 根目录文件 < 20个
- **文档完整**: 重要功能有文档

### 监控命令
```bash
# 检查大文件
find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | awk '$1 > 500'

# 检查根目录文件数
ls -1 | wc -l

# 检查文档覆盖
ls docs/ | wc -l
```

## 📝 记录要求

### 必须记录的变更
1. **文件结构变更** - 移动、删除、新增文件
2. **规则修改** - 开发规则的任何调整
3. **工具更新** - 脚本、配置的修改
4. **问题修复** - 重要bug的修复过程

### 记录位置
- **CHANGELOG.md** - 主要变更记录
- **commit message** - 代码变更说明
- **文档更新** - 相关功能文档

## 🎯 最佳实践

### 开发前
- [ ] 运行健康检查
- [ ] 确认临时文件状态
- [ ] 检查测试环境

### 开发中
- [ ] 遵循模块化原则
- [ ] 测试文件放正确位置
- [ ] 及时记录重要变更

### 开发后
- [ ] 运行完整测试
- [ ] 更新相关文档
- [ ] 提交变更记录

### 上线前
- [ ] 运行清理脚本
- [ ] 执行健康检查
- [ ] 确认所有规则遵循

## 🔄 持续改进

### 工具优化
- 根据使用反馈改进脚本
- 增加自动化检查项目
- 优化错误提示信息

### 规则调整
- 定期评估规则有效性
- 根据项目发展调整标准
- 收集团队使用反馈

### 文档维护
- 保持文档与代码同步
- 定期整理过时内容
- 补充缺失的说明