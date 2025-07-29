#!/usr/bin/env node

/**
 * 自动任务恢复脚本
 * 处理模型选择问题并自动继续执行任务
 */

const fs = require('fs');
const path = require('path');

class AutoTaskRecovery {
  constructor() {
    this.config = this.loadConfig();
    this.taskState = this.loadTaskState();
    this.preferredModel = "Claude Sonnet 4.0";
    this.fallbackModel = "Claude Sonnet 3.7";
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../settings/task-recovery-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.log('使用默认配置');
      return {
        autoRecovery: {
          enabled: true,
          modelSelection: {
            preferredModel: "Claude Sonnet 4.0",
            fallbackModels: ["Claude Sonnet 3.7"],
            autoSwitch: true,
            retryInterval: 30000,
            silentSwitch: true
          }
        }
      };
    }
  }

  loadTaskState() {
    try {
      const statePath = path.join(__dirname, '../state/current-task-state.json');
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch (error) {
      return {
        currentSpec: "streaming-response",
        currentTask: null,
        lastModel: null,
        context: {}
      };
    }
  }

  saveTaskState() {
    try {
      const statePath = path.join(__dirname, '../state/current-task-state.json');
      const stateDir = path.dirname(statePath);
      
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }
      
      fs.writeFileSync(statePath, JSON.stringify(this.taskState, null, 2));
    } catch (error) {
      console.error('保存任务状态失败:', error.message);
    }
  }

  getCurrentTasks() {
    try {
      const tasksPath = path.join(__dirname, `../specs/${this.taskState.currentSpec}/tasks.md`);
      const content = fs.readFileSync(tasksPath, 'utf8');
      
      // 解析任务列表，找到未完成的任务
      const lines = content.split('\n');
      const tasks = [];
      let currentTask = null;
      
      for (const line of lines) {
        const taskMatch = line.match(/^- \[([ x])\] (\d+\.?\d*)\. (.+)/);
        if (taskMatch) {
          const [, status, number, title] = taskMatch;
          currentTask = {
            number,
            title,
            completed: status === 'x',
            line: line
          };
          tasks.push(currentTask);
        }
      }
      
      return tasks;
    } catch (error) {
      console.error('读取任务列表失败:', error.message);
      return [];
    }
  }

  getNextTask() {
    const tasks = this.getCurrentTasks();
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    if (incompleteTasks.length > 0) {
      return incompleteTasks[0];
    }
    
    return null;
  }

  generateRecoveryPrompt() {
    const nextTask = this.getNextTask();
    
    if (!nextTask) {
      return "所有任务已完成！";
    }

    const prompt = `
# 自动任务恢复

## 当前状态
- 规格: ${this.taskState.currentSpec}
- 下一个任务: ${nextTask.number}. ${nextTask.title}
- 首选模型: ${this.preferredModel}
- 备用模型: ${this.fallbackModel}

## 执行指令
请继续执行 streaming-response 规格中的任务 "${nextTask.number}. ${nextTask.title}"。

如果遇到模型选择问题：
1. 优先选择 Claude Sonnet 4.0
2. 如果不可用，自动选择 Claude Sonnet 3.7
3. 继续执行任务，不要中断工作流程
4. 在后台定期检查首选模型是否恢复

## 任务上下文
基于 .kiro/specs/streaming-response/ 目录下的 requirements.md、design.md 和 tasks.md 文件执行任务。

请开始执行任务。
`;

    return prompt;
  }

  logRecovery(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [AUTO_RECOVERY] ${message}\n`;
    
    try {
      const logPath = path.join(__dirname, '../../dev.log');
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.log(logEntry.trim());
    }
  }

  run() {
    this.logRecovery('启动自动任务恢复');
    
    const nextTask = this.getNextTask();
    if (nextTask) {
      this.taskState.currentTask = nextTask.number;
      this.taskState.lastModel = this.preferredModel;
      this.saveTaskState();
      
      this.logRecovery(`准备执行任务: ${nextTask.number}. ${nextTask.title}`);
      console.log(this.generateRecoveryPrompt());
    } else {
      this.logRecovery('所有任务已完成');
      console.log('🎉 所有任务已完成！');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const recovery = new AutoTaskRecovery();
  recovery.run();
}

module.exports = AutoTaskRecovery;