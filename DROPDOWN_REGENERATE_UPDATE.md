# 重新生成按钮下拉菜单更新

## 📋 更新内容

将原来的单一"重新生成"按钮改为下拉菜单，提供两个选项：

### 🔄 下拉菜单选项

1. **重新生成方案** - 重新生成完整IP方案
   - 功能：完全重新生成整个IP打造方案内容
   - 说明：重新生成完整IP方案
   - 图标：RefreshCw

2. **重新生成banner图** - 仅重新生成Banner图片  
   - 功能：仅重新生成Banner图片，保留现有方案内容
   - 说明：仅重新生成Banner图片
   - 图标：FileImage

## 🛠️ 技术实现

### 导入的组件
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowLeft, RefreshCw, ChevronDown, FileImage } from "lucide-react"
```

### 新增功能函数
```typescript
const handleRegenerateBanner = async () => {
  if (!generatedContent) {
    alert('请先生成方案内容')
    return
  }
  
  console.log(`[${new Date().toISOString()}] 重新生成Banner图片`)
  await generateBannerImage(generatedContent, formData)
}
```

### UI 结构
- 使用 Radix UI 的 DropdownMenu 组件
- 触发按钮保持原有样式，增加下拉箭头图标
- 菜单项包含图标、标题和描述文字
- 支持禁用状态（生成中或无内容时）

## 🎯 用户体验改进

### 优势
1. **功能分离** - 用户可以选择只重新生成Banner图片，无需重新生成整个方案
2. **节省时间** - 当方案内容满意但Banner图片不理想时，只需重新生成图片
3. **清晰标识** - 每个选项都有明确的说明文字
4. **视觉一致** - 保持与其他下拉菜单组件的设计一致性

### 交互逻辑
- 点击主按钮显示下拉菜单
- 菜单项有hover效果和禁用状态
- 生成过程中相应选项会被禁用
- 无方案内容时Banner重新生成选项被禁用

## 📱 响应式设计

- 下拉菜单在移动端和桌面端都能正常工作
- 菜单宽度固定为 `w-48` 确保内容显示完整
- 对齐方式设置为 `align="end"` 与按钮右对齐

## 🔧 状态管理

### 禁用条件
- **重新生成方案**：`isGenerating` 为 true 时禁用
- **重新生成banner图**：`isGeneratingBanner` 为 true 或 `!generatedContent` 时禁用

### 加载状态
- 各自独立的加载状态管理
- 不会相互影响操作

## 🚀 部署说明

此更新已完成并可以直接使用：
- 所有必要的组件都已正确导入
- 功能函数已实现
- UI 组件已正确配置
- 响应式设计已适配

用户现在可以通过点击"重新生成"按钮看到下拉菜单，并选择相应的重新生成选项。