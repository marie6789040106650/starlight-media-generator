/**
 * 复制功能配置
 * 
 * 全面控制系统中的复制功能，包括：
 * - 剪贴板API复制
 * - 导出功能中的复制选项
 * - 用户界面中的复制按钮
 * - 基于路由的复制控制
 */

export interface CopySettings {
  /**
   * 是否允许复制内容
   * 默认为 false (全面禁用复制功能)
   */
  allowCopy: boolean;

  /**
   * 是否显示复制相关的UI元素
   * 默认为 false (隐藏所有复制按钮和选项)
   */
  showCopyUI: boolean;

  /**
   * 是否允许通过导出功能间接复制
   * 默认为 true (允许Word/PDF导出)
   */
  allowExportAsAlternative: boolean;
}

/**
 * 路由复制规则配置
 * 定义不同路由的复制权限
 */
export interface RouteCopyRule {
  /**
   * 路由路径模式 (支持通配符)
   */
  path: string;

  /**
   * 该路由的复制设置
   */
  settings: CopySettings;

  /**
   * 规则描述
   */
  description?: string;
}

// 路由复制规则配置
const routeCopyRules: RouteCopyRule[] = [
  {
    path: '/',
    settings: {
      allowCopy: true,           // 首页允许复制
      showCopyUI: true,          // 显示复制UI
      allowExportAsAlternative: true
    },
    description: '首页表单页面 - 允许复制粘贴'
  },
  {
    path: '/result',
    settings: {
      allowCopy: false,          // 结果页禁止复制
      showCopyUI: false,         // 隐藏复制UI
      allowExportAsAlternative: true  // 保留导出Word、PDF权限
    },
    description: '结果页面 - 禁止鼠标键盘复制，仅允许导出Word/PDF'
  }
];

// 默认配置：全面禁用复制功能
let copySettings: CopySettings = {
  allowCopy: false,           // 禁用所有复制功能
  showCopyUI: false,          // 隐藏复制相关UI
  allowExportAsAlternative: true   // 允许导出功能作为替代方案
};

/**
 * 获取当前复制设置
 * @returns 当前复制设置的副本
 */
export function getCopySettings(): CopySettings {
  return { ...copySettings };
}

/**
 * 更新复制设置
 * @param settings 要更新的设置
 */
export function updateCopySettings(settings: Partial<CopySettings>): void {
  Object.assign(copySettings, settings);
  console.log('复制设置已更新:', copySettings);
}

/**
 * 检查是否允许复制操作
 * @returns 是否允许复制
 */
export function isCopyAllowed(): boolean {
  return copySettings.allowCopy;
}

/**
 * 检查是否显示复制相关UI
 * @returns 是否显示复制UI
 */
export function shouldShowCopyUI(): boolean {
  return copySettings.showCopyUI;
}

/**
 * 检查是否允许导出功能
 * @returns 是否允许导出
 */
export function isExportAllowed(): boolean {
  return copySettings.allowExportAsAlternative;
}

/**
 * 重置为默认设置
 */
export function resetCopySettings(): void {
  copySettings.allowCopy = false;
  copySettings.showCopyUI = false;
  copySettings.allowExportAsAlternative = true;
  console.log('复制设置已重置为默认值');
}

/**
 * 根据当前路由更新复制设置
 * @param pathname 当前路由路径
 */
export function updateCopySettingsByRoute(pathname: string): void {
  // 查找匹配的路由规则
  const matchedRule = routeCopyRules.find(rule => {
    // 支持精确匹配和通配符匹配
    if (rule.path === pathname) {
      return true;
    }

    // 支持通配符匹配 (例如 /result/* 匹配 /result/123)
    if (rule.path.endsWith('*')) {
      const basePath = rule.path.slice(0, -1);
      return pathname.startsWith(basePath);
    }

    return false;
  });

  if (matchedRule) {
    console.log(`🎯 路由 ${pathname} 匹配规则: ${matchedRule.description}`);
    updateCopySettings(matchedRule.settings);
  } else {
    console.log(`⚠️ 路由 ${pathname} 未找到匹配规则，使用默认设置`);
    // 使用默认的严格设置
    updateCopySettings({
      allowCopy: false,
      showCopyUI: false,
      allowExportAsAlternative: true
    });
  }
}

/**
 * 获取所有路由复制规则
 * @returns 路由复制规则数组
 */
export function getRouteCopyRules(): RouteCopyRule[] {
  return [...routeCopyRules];
}

/**
 * 添加新的路由复制规则
 * @param rule 新的路由规则
 */
export function addRouteCopyRule(rule: RouteCopyRule): void {
  routeCopyRules.push(rule);
  console.log('已添加新的路由复制规则:', rule);
}

/**
 * 移除路由复制规则
 * @param path 要移除的路由路径
 */
export function removeRouteCopyRule(path: string): void {
  const index = routeCopyRules.findIndex(rule => rule.path === path);
  if (index !== -1) {
    const removed = routeCopyRules.splice(index, 1)[0];
    console.log('已移除路由复制规则:', removed);
  }
}