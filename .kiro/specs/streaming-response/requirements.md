# 流式响应功能需求文档 (MVP版本)

## 介绍

本功能为老板IP打造方案生成器添加流式AI交互能力，主要服务于模块1（信息填写+关键词拓展）、模块2（老板IP打造方案生成）、模块3（视觉Banner生成）的业务流程，提供实时的方案生成体验。

## 业务对齐说明

- **模块1支持**: 快速返回预置关键词（不需要流式），复用现有关键词触发逻辑
- **模块2核心**: 流式生成8个板块（全部需要生成），解决Serverless Function 10秒限制
- **模块3辅助**: 快速返回Banner设计方案，从模块1、2数据中提取所需信息
- **字段标准**: 严格按照 `docs/FIELD_STANDARDS.md` 中定义的字段结构实现
- **API端点**: 模块化设计 - `/api/module1-keywords`, `/api/module2-plan-stream`, `/api/module3-banner`

## 核心需求 (MVP)

### 需求 1：模块化API端点设计

**用户故事：** 作为商家，我希望系统能够高效处理不同模块的业务需求，提供合适的响应方式。

#### 验收标准

1. WHEN 调用模块1 API THEN 系统应快速返回预置关键词列表（Serverless Function）
2. WHEN 调用模块2 API THEN 系统应流式生成8个板块的IP方案（Edge Function）
3. WHEN 调用模块3 API THEN 系统应快速返回Banner设计方案（Serverless Function）
4. WHEN API接收业务数据 THEN 系统应严格遵循字段标准(storeName, storeCategory, confirmedStoreKeywords等)
5. WHEN 模块3处理数据 THEN 系统应从模块1、2数据中正确提取Banner所需信息
6. WHEN 响应完成 THEN 系统应返回符合业务输出结构的JSON格式数据

### 需求 2：业务数据状态管理Hook

**用户故事：** 作为开发者，我希望有一个Hook来管理业务流程中的流式数据状态。

#### 验收标准

1. WHEN Hook初始化 THEN 系统应支持业务字段结构(storeName, storeCategory等)
2. WHEN 处理模块1数据 THEN Hook应管理关键词推荐的流式状态
3. WHEN 处理模块2数据 THEN Hook应管理IP方案生成的8个板块状态（全部板块都需要生成）
4. WHEN 处理模块3数据 THEN Hook应管理Banner设计建议的流式状态
5. WHEN 接收业务数据 THEN Hook应实时更新对应的业务字段内容
6. WHEN 完成业务流程 THEN Hook应返回符合业务输出结构的完整数据

### 需求 3：业务流程界面组件

**用户故事：** 作为商家和操作人员，我希望有界面组件来展示业务流程的实时生成过程。

#### 验收标准

1. WHEN 展示模块1流程 THEN 界面应显示店铺信息输入和关键词推荐区域
2. WHEN 展示模块2流程 THEN 界面应分区域显示8个板块的流式生成过程（IP标签、品牌主张、内容栏目、金句等）
3. WHEN 展示模块3流程 THEN 界面应显示Banner设计建议和视觉元素推荐
4. WHEN 处理业务数据 THEN 界面应支持业务字段的结构化输入和展示
5. WHEN 生成过程中 THEN 界面应实时显示各个板块的流式内容更新
6. WHEN 完成生成 THEN 界面应提供业务数据的导出和下一步操作选项
7. WHEN 需要调试 THEN 界面应提供重新生成和参数调整功能

### 需求 4：混合架构兼容性

**用户故事：** 作为系统架构师，我希望流式功能与现有Serverless Function和谐共存。

#### 验收标准

1. WHEN 部署到Vercel THEN Edge Function和Serverless Function应同时运行
2. WHEN 使用环境变量 THEN 两种函数应共享API密钥和配置
3. WHEN 调用不同端点 THEN 系统应根据runtime配置选择执行环境
4. WHEN 处理复杂逻辑 THEN 现有generate-plan等应保持不变
5. WHEN 需要实时交互 THEN chat-stream应提供最佳性能

### 需求 5：错误处理和日志

**用户故事：** 作为运维人员，我希望系统具备完善的错误处理和监控能力。

#### 验收标准

1. WHEN API调用失败 THEN 系统应记录详细错误日志含请求ID
2. WHEN 网络超时 THEN 系统应提供适当超时处理和用户提示
3. WHEN 流式连接中断 THEN 系统应优雅处理断开并允许重连
4. WHEN 解析数据失败 THEN 系统应跳过错误块继续处理
5. WHEN 达到限制 THEN 系统应提供明确的限流提示

### 需求 6：基础文档

**用户故事：** 作为开发者，我希望有必要的文档来理解和使用功能。

#### 验收标准

1. WHEN 查看API文档 THEN 应包含端点说明和参数定义
2. WHEN 查看架构文档 THEN 应说明Edge/Serverless使用场景
3. WHEN 查看代码示例 THEN 应提供Hook和组件使用案例
4. WHEN 部署项目 THEN 应有环境配置指南