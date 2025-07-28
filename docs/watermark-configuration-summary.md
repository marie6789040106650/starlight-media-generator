# 水印配置统一总结

## 🎯 统一后的默认配置

所有水印相关组件现在使用统一的默认参数：

### 基础配置
- **透明度**: 10% (0.1)
- **字体大小**: 42px
- **旋转角度**: 45°
- **重复模式**: grid (网格)
- **位置**: center (居中)
- **颜色**: gray (灰色)
- **默认状态**: 禁用 (enabled: false)

### 特殊类型配置
- **公司水印**: 透明度 10%，灰色
- **机密文档**: 透明度 20%，红色 (稍微明显一些)
- **自定义水印**: 使用基础配置

## 📁 已统一的文件

### 1. 组件配置文件
- `components/watermark-config.tsx` - 主要水印配置组件
- `components/watermark-settings-button.tsx` - 水印设置按钮
- `lib/watermark-toolkit/watermark-config.tsx` - 工具包配置组件

### 2. PDF处理器配置
- `lib/utils/pdf-watermark.ts` - PDF水印处理器
- `lib/watermark-toolkit/pdf-watermark.ts` - 工具包PDF处理器

### 3. 导出工具配置
- `lib/export-utils.ts` - 导出工具中的水印配置

## 🎯 水印生效范围

### 1. 分页模式显示
- **文件**: `components/word-style-renderer-with-pagination.tsx`
- **生效时机**: 用户切换到分页模式时
- **显示方式**: 作为背景层渲染在每个页面上
- **实时更新**: 配置修改后立即在分页模式中生效

### 2. PDF导出
- **文件**: `lib/export-utils.ts`
- **生效时机**: 用户导出PDF时
- **应用方式**: 
  - 如果分页模式已启用：直接截图包含水印的页面
  - 如果分页模式未启用：自动切换到分页模式后导出
- **水印来源**: 从localStorage读取用户配置

### 3. Word导出
- **文件**: `lib/export-utils.ts`
- **生效时机**: 用户导出Word文档时
- **应用方式**: 在Word文档中添加水印段落
- **位置**: 文档开头作为背景水印

## 🔧 配置存储和读取

### 存储位置
- **localStorage键**: `watermarkConfig`
- **存储格式**: JSON字符串
- **自动保存**: 用户修改配置时立即保存

### 读取逻辑
```typescript
const getWatermarkConfig = (): WatermarkConfig | null => {
  try {
    const saved = localStorage.getItem('watermarkConfig')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.warn('获取水印配置失败:', error)
    return null
  }
}
```

## 🎨 水印显示特性

### 中英文混合支持
- **字体**: 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei'
- **支持内容**: 中文、英文、数字混合显示
- **优化**: 针对A4纸张尺寸优化显示效果

### 重复模式
1. **单个** (none): 在指定位置显示一个水印
2. **对角线** (diagonal): 沿对角线方向重复显示
3. **网格** (grid): 按网格模式均匀分布

### 位置选项
- **居中** (center): 页面中心
- **左上角** (top-left): 页面左上角
- **右上角** (top-right): 页面右上角
- **左下角** (bottom-left): 页面左下角
- **右下角** (bottom-right): 页面右下角

## 🚀 使用流程

### 1. 用户配置水印
1. 点击"水印设置"按钮
2. 在弹窗中配置水印参数
3. 实时预览效果
4. 配置自动保存到localStorage

### 2. 分页模式显示
1. 用户切换到分页模式
2. 系统读取水印配置
3. 如果启用，在每个页面渲染水印背景层

### 3. 导出应用
1. 用户点击导出按钮
2. 系统读取水印配置
3. 根据配置在导出文件中应用水印

## 📋 配置接口

```typescript
interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number;        // 10-50，推荐10-20
  fontSize: number;       // 20-100，推荐42
  rotation: number;       // -90到90，推荐45
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  repeat: 'none' | 'diagonal' | 'grid';
  color: 'gray' | 'red' | 'blue' | 'black';
}
```

## ✅ 统一完成状态

- [x] 所有默认配置统一为：透明度10%、字体42px、角度45°、网格模式
- [x] 分页模式实时显示水印
- [x] PDF导出包含水印
- [x] Word导出包含水印
- [x] 配置持久化存储
- [x] 中英文混合支持
- [x] 移动端兼容性

水印功能现在已经完全统一，用户在任何地方使用都会获得一致的体验。