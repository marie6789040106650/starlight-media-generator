/**
 * Kiro 自动错误恢复和任务继续执行 Hook
 * 当遇到错误时自动重试和恢复，避免人工介入
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  maxRetries: 3,
  retryDelay: 2000,
  autoRetryErrors: [
    'An unexpected error occurred',
    'Error(s) while creating',
    'Error(s) while reading',
    'Error(s) while editing',
    'ENOENT',
    'EACCES',
    'Tool execution failed'
  ],
  logFile: '.kiro/logs/auto-recovery.log'
};

// 日志记录
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  // 确保日志目录存在
  const logDir = path.dirname(CONFIG.logFile);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // 写入日志
  fs.appendFileSync(CONFIG.logFile, logMessage);
  console.log(`[AUTO-RECOVERY] ${message}`);
}

// 检查是否为可自动重试的错误
function isAutoRetryableError(error) {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  return CONFIG.autoRetryErrors.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

// 自动重试函数
async function autoRetry(operation, context = {}) {
  let lastError;
  
  for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
    try {
      log(`尝试执行操作 (第${attempt}次): ${context.operation || '未知操作'}`);
      
      const result = await operation();
      
      if (attempt > 1) {
        log(`操作成功恢复 (第${attempt}次尝试): ${context.operation || '未知操作'}`, 'SUCCESS');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      log(`操作失败 (第${attempt}次尝试): ${error.message}`, 'ERROR');
      
      if (!isAutoRetryableError(error)) {
        log(`错误不可自动重试: ${error.message}`, 'WARN');
        throw error;
      }
      
      if (attempt < CONFIG.maxRetries) {
        log(`等待 ${CONFIG.retryDelay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
    }
  }
  
  log(`所有重试尝试失败: ${lastError.message}`, 'ERROR');
  throw lastError;
}

// 自动修复常见问题
async function autoFix(error, context = {}) {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  
  try {
    // 修复文件不存在问题
    if (errorMessage.includes('ENOENT') && context.filePath) {
      log(`尝试创建缺失的文件: ${context.filePath}`);
      const dir = path.dirname(context.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(context.filePath)) {
        fs.writeFileSync(context.filePath, context.defaultContent || '');
      }
      return true;
    }
    
    // 修复权限问题
    if (errorMessage.includes('EACCES') && context.filePath) {
      log(`尝试修复文件权限: ${context.filePath}`);
      fs.chmodSync(context.filePath, 0o644);
      return true;
    }
    
    // 修复目录不存在问题
    if (errorMessage.includes('directory') && context.dirPath) {
      log(`尝试创建缺失的目录: ${context.dirPath}`);
      fs.mkdirSync(context.dirPath, { recursive: true });
      return true;
    }
    
  } catch (fixError) {
    log(`自动修复失败: ${fixError.message}`, 'ERROR');
  }
  
  return false;
}

// 任务状态管理
class TaskStateManager {
  constructor() {
    this.stateFile = '.kiro/state/task-state.json';
    this.ensureStateFile();
  }
  
  ensureStateFile() {
    const dir = path.dirname(this.stateFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.stateFile)) {
      fs.writeFileSync(this.stateFile, JSON.stringify({
        currentTask: null,
        completedTasks: [],
        failedTasks: [],
        lastUpdate: new Date().toISOString()
      }, null, 2));
    }
  }
  
  getState() {
    try {
      return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch (error) {
      log(`读取任务状态失败: ${error.message}`, 'ERROR');
      return {
        currentTask: null,
        completedTasks: [],
        failedTasks: [],
        lastUpdate: new Date().toISOString()
      };
    }
  }
  
  updateState(updates) {
    try {
      const state = this.getState();
      const newState = {
        ...state,
        ...updates,
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(this.stateFile, JSON.stringify(newState, null, 2));
      log(`任务状态已更新: ${JSON.stringify(updates)}`);
    } catch (error) {
      log(`更新任务状态失败: ${error.message}`, 'ERROR');
    }
  }
  
  markTaskCompleted(taskId) {
    const state = this.getState();
    if (!state.completedTasks.includes(taskId)) {
      state.completedTasks.push(taskId);
      this.updateState(state);
    }
  }
  
  markTaskFailed(taskId, error) {
    const state = this.getState();
    const failedTask = {
      id: taskId,
      error: error.message || error,
      timestamp: new Date().toISOString()
    };
    state.failedTasks.push(failedTask);
    this.updateState(state);
  }
}

// 自动任务执行器
class AutoTaskExecutor {
  constructor() {
    this.stateManager = new TaskStateManager();
    this.isRunning = false;
  }
  
  async executeTaskWithRecovery(taskFn, taskId, context = {}) {
    try {
      log(`开始执行任务: ${taskId}`);
      this.stateManager.updateState({ currentTask: taskId });
      
      const result = await autoRetry(async () => {
        try {
          return await taskFn();
        } catch (error) {
          // 尝试自动修复
          const fixed = await autoFix(error, context);
          if (fixed) {
            log(`自动修复成功，重新执行任务: ${taskId}`);
            return await taskFn();
          }
          throw error;
        }
      }, { operation: taskId });
      
      this.stateManager.markTaskCompleted(taskId);
      log(`任务执行成功: ${taskId}`, 'SUCCESS');
      
      return result;
    } catch (error) {
      this.stateManager.markTaskFailed(taskId, error);
      log(`任务执行失败: ${taskId} - ${error.message}`, 'ERROR');
      
      // 继续执行下一个任务而不是停止
      log(`跳过失败任务，继续执行后续任务`, 'WARN');
      return null;
    }
  }
  
  async continueFromLastState() {
    const state = this.stateManager.getState();
    log(`从上次状态继续执行，当前任务: ${state.currentTask}`);
    log(`已完成任务: ${state.completedTasks.length}个`);
    log(`失败任务: ${state.failedTasks.length}个`);
    
    // 这里可以根据状态继续执行未完成的任务
    return state;
  }
}

// 导出主要功能
module.exports = {
  autoRetry,
  autoFix,
  TaskStateManager,
  AutoTaskExecutor,
  log,
  isAutoRetryableError,
  
  // 便捷方法
  async withAutoRecovery(operation, context = {}) {
    return await autoRetry(operation, context);
  },
  
  // 创建自动执行器实例
  createExecutor() {
    return new AutoTaskExecutor();
  }
};