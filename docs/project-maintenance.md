# 项目维护规则

## 🔄 定期维护任务

### 每日检查
- [ ] 检查临时文件目录 `temp/` 是否有新增文件需要处理
- [ ] 确认测试文件都在 `tests/` 目录下
- [ ] 验证新增代码符合模块化要求

### 每周检查
- [ ] 运行 `pnpm run cleanup` 验证清理脚本正常
- [ ] 检查项目结构是否保持整洁
- [ ] 更新 CHANGELOG.md 记录重要变更

### 每月检查
- [ ] 全面审查代码模块化程度
- [ ] 检查文档是否需要更新
- [ ] 验证所有规则执行情况

## 📝 变更记录要求

### 必须记录的变更
1. **文件结构变更** - 新增、删除、移动文件或目录
2. **规则修改** - 开发规则的任何变更
3. **工具脚本更新** - 清理脚本、测试脚本等的修改
4. **配置文件变更** - package.json、配置文件等的修改

### 记录格式
```markdown
## 📅 YYYY-MM-DD - 变更标题

### 🎯 变更目标
简述变更的目的和背景

### 📄 具体变更
- 变更项1：详细描述
- 变更项2：详细描述

### 🔍 影响分析
- 对项目的影响
- 需要注意的事项
```

## 🚨 问题排查指南

### 常见问题及解决方案

#### 1. 临时文件丢失
**问题**: temp/ 目录下的文件突然消失
**排查步骤**:
1. 检查 CHANGELOG.md 确认文件是否已迁移
2. 查看 `public/templates/` 是否有备份
3. 检查 `tests/fixtures/` 是否有相关测试数据

#### 2. 测试文件混乱
**问题**: 测试文件散落在各个目录
**排查步骤**:
1. 运行 `find . -name "*test*" -type f` 查找所有测试文件
2. 检查是否遵循测试文件隔离规则
3. 使用清理脚本重新整理

#### 3. 构建失败
**问题**: 构建时出现文件找不到的错误
**排查步骤**:
1. 检查是否有文件被意外删除
2. 确认所有依赖文件都在正确位置
3. 查看 CHANGELOG.md 了解最近的文件变更

#### 4. 清理脚本未执行
**问题**: 生产版本包含测试文件
**排查步骤**:
1. 确认是否手动运行了 `pnpm run cleanup`
2. 检查清理脚本是否正常工作
3. 验证构建前的清理流程是否遵循

## 🔧 维护工具

### 检查脚本
```bash
#!/bin/bash
# 项目健康检查脚本

echo "🔍 项目结构检查..."

# 检查必要目录
required_dirs=("docs" "components" "lib" "utils")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ 缺少目录: $dir"
    else
        echo "✅ 目录存在: $dir"
    fi
done

# 检查测试文件位置
if [ -d "tests" ]; then
    echo "✅ 测试目录结构正常"
else
    echo "⚠️  测试目录不存在（可能已清理）"
fi

# 检查临时文件
if [ -d "temp" ]; then
    temp_files=$(find temp -type f | wc -l)
    echo "⚠️  临时目录存在，包含 $temp_files 个文件"
else
    echo "✅ 无临时文件目录"
fi

echo "🎉 检查完成"
```

### 快速修复命令
```bash
# 重新整理项目结构
pnpm run cleanup && pnpm install

# 检查代码质量
pnpm run lint

# 运行所有测试
pnpm test
```

## 📊 质量指标

### 项目健康度指标
- **模块化程度**: 单文件代码行数 < 500行
- **测试覆盖率**: 测试文件都在tests目录
- **文档完整性**: 重要功能都有文档说明
- **结构清洁度**: 根目录文件数量 < 20个

### 监控方法
```bash
# 检查大文件
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | sort -n

# 检查根目录文件数量
ls -1 | wc -l

# 检查测试文件分布
find . -name "*test*" -type f
```

## 🎯 持续改进

### 规则优化
- 根据实际使用情况调整规则
- 定期收集团队反馈
- 持续优化工具脚本

### 文档维护
- 保持文档与代码同步
- 及时更新变更记录
- 定期整理历史文档

### 工具改进
- 优化清理脚本效率
- 增加自动化检查
- 完善错误处理机制

## ⚠️ 重要变更记录

### 2025-01-19 - prebuild钩子移除
- **变更**: 移除package.json中的`"prebuild": "pnpm run cleanup"`
- **影响**: 构建时不再自动清理测试文件
- **新流程**: 开发者需要手动运行清理命令
- **维护要求**: 加强手动清理流程的监督和提醒