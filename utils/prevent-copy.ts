/**
 * 全面内容保护系统
 * 禁止所有形式的复制、剪切、选择和右键操作
 */
import { isCopyAllowed } from "@/config/copy-settings";

/**
 * 检查元素是否为可编辑元素
 */
function isEditableElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  const isInForm = element.closest('form') !== null;
  
  return isInput || isContentEditable || isInForm;
}

/**
 * 初始化全面内容保护
 * 禁止所有形式的复制操作
 */
export function initPreventCopy(): void {
  if (typeof window === 'undefined') return;

  console.log('🛡️ 初始化全面内容保护系统');

  // 1. 禁止复制事件 (Ctrl+C)
  document.addEventListener('copy', (e) => {
    if (!isCopyAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('🚫 复制操作已被阻止');
      showProtectionMessage('复制功能已被禁用');
    }
  }, true);

  // 2. 禁止剪切事件 (Ctrl+X)
  document.addEventListener('cut', (e) => {
    if (!isCopyAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('🚫 剪切操作已被阻止');
      showProtectionMessage('剪切功能已被禁用');
    }
  }, true);

  // 3. 禁止粘贴事件 (Ctrl+V) - 在非编辑区域
  document.addEventListener('paste', (e) => {
    if (!isCopyAllowed()) {
      const target = e.target as HTMLElement;
      if (!isEditableElement(target)) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 粘贴操作已被阻止');
      }
    }
  }, true);

  // 4. 禁止右键菜单
  document.addEventListener('contextmenu', (e) => {
    if (!isCopyAllowed()) {
      e.preventDefault();
      e.stopPropagation();
      console.warn('🚫 右键菜单已被禁用');
      showProtectionMessage('右键菜单已被禁用');
    }
  }, true);

  // 5. 禁止文本选择
  document.addEventListener('selectstart', (e) => {
    if (!isCopyAllowed()) {
      const target = e.target as HTMLElement;
      if (!isEditableElement(target)) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 文本选择已被阻止');
      }
    }
  }, true);

  // 6. 禁止拖拽选择
  document.addEventListener('dragstart', (e) => {
    if (!isCopyAllowed()) {
      const target = e.target as HTMLElement;
      if (!isEditableElement(target)) {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 拖拽操作已被阻止');
      }
    }
  }, true);

  // 7. 禁止键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (!isCopyAllowed()) {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isEditable = isEditableElement(target);

      // 禁止复制相关快捷键
      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();
        const copyKeys = ['c', 'x', 'v', 'a', 's', 'p'];
        
        if (copyKeys.includes(key) && !isEditable) {
          e.preventDefault();
          e.stopPropagation();
          console.warn(`🚫 快捷键 Ctrl+${key.toUpperCase()} 已被阻止`);
          showProtectionMessage(`快捷键 Ctrl+${key.toUpperCase()} 已被禁用`);
        }
      }

      // 禁止F12开发者工具
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 开发者工具快捷键已被阻止');
        showProtectionMessage('开发者工具已被禁用');
      }

      // 禁止Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 开发者工具快捷键已被阻止');
        showProtectionMessage('开发者工具已被禁用');
      }

      // 禁止Ctrl+U (查看源代码)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 查看源代码快捷键已被阻止');
        showProtectionMessage('查看源代码已被禁用');
      }
    }
  }, true);

  // 8. 禁用打印功能
  document.addEventListener('keydown', (e) => {
    if (!isCopyAllowed()) {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        console.warn('🚫 打印功能已被阻止');
        showProtectionMessage('打印功能已被禁用');
      }
    }
  }, true);

  // 9. 添加CSS样式禁用选择
  addProtectionStyles();

  // 10. 监听窗口失焦（防止通过其他方式复制）
  window.addEventListener('blur', () => {
    if (!isCopyAllowed()) {
      // 清空剪贴板（如果可能）
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (error) {
        // 忽略错误
      }
    }
  });

  console.log('✅ 全面内容保护系统已启用');
}

/**
 * 添加保护样式
 */
function addProtectionStyles(): void {
  if (!isCopyAllowed()) {
    const style = document.createElement('style');
    style.id = 'content-protection-styles';
    style.textContent = `
      /* 禁用文本选择 */
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* 允许表单元素选择 */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* 禁用拖拽 */
      * {
        -webkit-user-drag: none !important;
        -moz-user-drag: none !important;
        user-drag: none !important;
      }
      
      /* 禁用图片拖拽 */
      img {
        -webkit-user-drag: none !important;
        -moz-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* 禁用链接拖拽 */
      a {
        -webkit-user-drag: none !important;
        -moz-user-drag: none !important;
        user-drag: none !important;
      }
      
      /* 隐藏选择高亮 */
      ::selection {
        background: transparent !important;
      }
      
      ::-moz-selection {
        background: transparent !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 保护样式已应用');
  }
}

/**
 * 移除保护样式
 */
function removeProtectionStyles(): void {
  const existingStyle = document.getElementById('content-protection-styles');
  if (existingStyle) {
    existingStyle.remove();
    console.log('🎨 保护样式已移除');
  }
}

/**
 * 显示保护提示消息
 */
function showProtectionMessage(message: string): void {
  // 创建临时提示
  const toast = document.createElement('div');
  toast.textContent = `🛡️ ${message}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  // 添加动画样式
  if (!document.getElementById('protection-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'protection-toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // 3秒后自动移除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 3000);
}

/**
 * 更新保护状态
 * 当配置改变时调用
 */
export function updateProtectionStatus(): void {
  if (isCopyAllowed()) {
    removeProtectionStyles();
    console.log('🔓 内容保护已禁用');
  } else {
    addProtectionStyles();
    console.log('🔒 内容保护已启用');
  }
}

/**
 * 清理保护功能
 */
export function cleanupProtection(): void {
  removeProtectionStyles();
  const toastStyles = document.getElementById('protection-toast-styles');
  if (toastStyles) {
    toastStyles.remove();
  }
}