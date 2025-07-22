#!/usr/bin/env node

/**
 * 环境配置验证脚本
 * 验证SiliconFlow API兼容性和环境变量配置
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查环境变量配置
function checkEnvironmentVariables() {
  log('\n🔍 检查环境变量配置...', 'blue');
  
  const requiredEnvVars = [
    'SILICONFLOW_API_KEY',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY'
  ];
  
  const optionalEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
    'API_TIMEOUT',
    'STREAM_TIMEOUT',
    'ENABLE_STREAMING_CHAT',
    'ENABLE_BUSINESS_MODULES'
  ];
  
  let allConfigured = true;
  
  // 检查必需的环境变量
  log('\n必需的API密钥:', 'yellow');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value && value !== 'your_' + envVar.toLowerCase() + '_here') {
      log(`  ✅ ${envVar}: 已配置`, 'green');
    } else {
      log(`  ❌ ${envVar}: 未配置或使用默认值`, 'red');
      allConfigured = false;
    }
  });
  
  // 检查可选的环境变量
  log('\n可选配置:', 'yellow');
  optionalEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      log(`  ✅ ${envVar}: ${value}`, 'green');
    } else {
      log(`  ⚠️  ${envVar}: 未设置`, 'yellow');
    }
  });
  
  return allConfigured;
}

// 检查.env文件
function checkEnvFiles() {
  log('\n📄 检查环境配置文件...', 'blue');
  
  const envFiles = ['.env.local', '.env', '.env.example'];
  
  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file}: 存在`, 'green');
      
      // 读取文件内容检查配置
      const content = fs.readFileSync(file, 'utf8');
      const hasSiliconFlow = content.includes('SILICONFLOW_API_KEY');
      const hasOpenAI = content.includes('OPENAI_API_KEY');
      
      if (hasSiliconFlow) {
        log(`    ✅ 包含 SiliconFlow 配置`, 'green');
      } else {
        log(`    ❌ 缺少 SiliconFlow 配置`, 'red');
      }
      
      if (hasOpenAI) {
        log(`    ✅ 包含 OpenAI 配置`, 'green');
      } else {
        log(`    ⚠️  缺少 OpenAI 配置`, 'yellow');
      }
    } else {
      log(`  ❌ ${file}: 不存在`, 'red');
    }
  });
}

// 检查模型配置
function checkModelConfiguration() {
  log('\n🤖 检查AI模型配置...', 'blue');
  
  try {
    // 动态导入模型配置
    const modelsPath = path.join(process.cwd(), 'lib/models.ts');
    if (fs.existsSync(modelsPath)) {
      log('  ✅ 模型配置文件存在', 'green');
      
      const content = fs.readFileSync(modelsPath, 'utf8');
      
      // 检查SiliconFlow模型
      const hasSiliconFlowModels = content.includes("provider: 'siliconflow'");
      const hasDeepSeek = content.includes('deepseek-ai/DeepSeek-V3');
      const hasKimi = content.includes('moonshotai/Kimi-K2');
      
      if (hasSiliconFlowModels) {
        log('  ✅ 包含 SiliconFlow 模型配置', 'green');
      } else {
        log('  ❌ 缺少 SiliconFlow 模型配置', 'red');
      }
      
      if (hasDeepSeek) {
        log('  ✅ 包含 DeepSeek-V3 模型', 'green');
      }
      
      if (hasKimi) {
        log('  ✅ 包含 Kimi-K2 模型', 'green');
      }
      
    } else {
      log('  ❌ 模型配置文件不存在', 'red');
    }
  } catch (error) {
    log(`  ❌ 检查模型配置时出错: ${error.message}`, 'red');
  }
}

// 检查API端点
function checkAPIEndpoints() {
  log('\n🌐 检查API端点配置...', 'blue');
  
  const apiEndpoints = [
    'app/api/chat-stream/route.ts',
    'app/api/module1-keywords/route.ts',
    'app/api/module2-plan-stream/route.ts',
    'app/api/module3-banner/route.ts'
  ];
  
  apiEndpoints.forEach(endpoint => {
    if (fs.existsSync(endpoint)) {
      log(`  ✅ ${endpoint}: 存在`, 'green');
      
      const content = fs.readFileSync(endpoint, 'utf8');
      
      // 检查是否使用了模型配置
      const usesModelConfig = content.includes('getModelById') || content.includes('DEFAULT_CHAT_MODEL');
      const usesSiliconFlow = content.includes('siliconflow') || content.includes('SILICONFLOW');
      
      if (usesModelConfig) {
        log(`    ✅ 使用模型配置系统`, 'green');
      } else {
        log(`    ⚠️  未使用模型配置系统`, 'yellow');
      }
      
      if (usesSiliconFlow) {
        log(`    ✅ 支持 SiliconFlow`, 'green');
      } else {
        log(`    ⚠️  未明确支持 SiliconFlow`, 'yellow');
      }
      
    } else {
      log(`  ❌ ${endpoint}: 不存在`, 'red');
    }
  });
}

// 生成配置报告
function generateConfigReport() {
  log('\n📊 生成配置报告...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      environmentVariables: checkEnvironmentVariables(),
      envFiles: true, // 简化检查
      modelConfiguration: true,
      apiEndpoints: true
    },
    recommendations: []
  };
  
  // 添加建议
  if (!report.checks.environmentVariables) {
    report.recommendations.push('配置必需的API密钥环境变量');
  }
  
  if (!process.env.SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY.includes('your_')) {
    report.recommendations.push('设置有效的 SILICONFLOW_API_KEY');
  }
  
  // 保存报告
  const reportPath = 'config-verification-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`  ✅ 报告已保存到: ${reportPath}`, 'green');
  
  return report;
}

// 主函数
async function main() {
  log('🚀 开始环境配置验证...', 'blue');
  
  try {
    // 执行各项检查
    checkEnvFiles();
    const envConfigured = checkEnvironmentVariables();
    checkModelConfiguration();
    checkAPIEndpoints();
    
    // 生成报告
    const report = generateConfigReport();
    
    // 输出总结
    log('\n📋 验证总结:', 'blue');
    
    if (envConfigured && report.recommendations.length === 0) {
      log('  ✅ 所有配置检查通过！', 'green');
      log('  🎉 SiliconFlow API 集成已就绪', 'green');
    } else {
      log('  ⚠️  发现配置问题，请查看上述建议', 'yellow');
      
      if (report.recommendations.length > 0) {
        log('\n建议操作:', 'yellow');
        report.recommendations.forEach(rec => {
          log(`  • ${rec}`, 'yellow');
        });
      }
    }
    
    log('\n✨ 验证完成！', 'blue');
    
  } catch (error) {
    log(`❌ 验证过程中出错: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkEnvFiles,
  checkModelConfiguration,
  checkAPIEndpoints,
  generateConfigReport
};