#!/usr/bin/env node

/**
 * 综合测试运行器
 * 运行所有API端点、Hook和集成测试
 */

const { spawn } = require('child_process');
const path = require('path');

// 测试配置
const tests = [
  {
    name: 'API端点测试',
    script: 'tests/api/api-endpoints.test.js',
    description: '测试模块1、2、3和流式聊天API'
  },
  {
    name: 'Hook功能测试',
    script: 'tests/hooks/use-business-stream.test.js',
    description: '测试业务流程Hook状态管理'
  },
  {
    name: 'SiliconFlow兼容性测试',
    script: 'tests/integration/siliconflow-compatibility.test.js',
    description: '测试SiliconFlow API兼容性'
  }
];

// 测试结果统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// 运行单个测试
function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 运行测试: ${test.name}`);
    console.log(`📝 描述: ${test.description}`);
    console.log(`📂 脚本: ${test.script}`);
    console.log(`${'='.repeat(60)}\n`);

    const child = spawn('node', [test.script], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      testResults.total++;
      
      if (code === 0) {
        testResults.passed++;
        console.log(`\n✅ ${test.name} - 通过`);
      } else {
        testResults.failed++;
        testResults.errors.push({
          test: test.name,
          exitCode: code
        });
        console.log(`\n❌ ${test.name} - 失败 (退出码: ${code})`);
      }
      
      resolve(code);
    });

    child.on('error', (error) => {
      testResults.total++;
      testResults.failed++;
      testResults.errors.push({
        test: test.name,
        error: error.message
      });
      console.log(`\n❌ ${test.name} - 错误: ${error.message}`);
      resolve(1);
    });
  });
}

// 打印测试结果汇总
function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 测试结果汇总');
  console.log(`${'='.repeat(60)}`);
  console.log(`总计: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`成功率: ${testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach(({ test, error, exitCode }) => {
      if (error) {
        console.log(`  - ${test}: ${error}`);
      } else {
        console.log(`  - ${test}: 退出码 ${exitCode}`);
      }
    });
  }
  
  console.log(`${'='.repeat(60)}\n`);
  
  if (testResults.passed === testResults.total) {
    console.log('🎉 所有测试通过！系统功能正常。');
    return 0;
  } else {
    console.log('⚠️  部分测试失败，请检查相关功能。');
    return 1;
  }
}

// 检查环境
function checkEnvironment() {
  console.log('🔍 检查测试环境...');
  
  const requiredEnvVars = [
    'SILICONFLOW_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  警告: 以下环境变量未配置，部分测试可能失败:');
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
    console.log('');
  } else {
    console.log('✅ 环境变量配置完整');
  }
}

// 主函数
async function main() {
  console.log('🚀 开始运行综合测试套件...\n');
  
  // 检查环境
  checkEnvironment();
  
  // 运行所有测试
  for (const test of tests) {
    await runTest(test);
  }
  
  // 打印汇总
  const exitCode = printSummary();
  
  process.exit(exitCode);
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 测试运行器失败:', error);
    process.exit(1);
  });
}

module.exports = {
  runTest,
  tests,
  main
};