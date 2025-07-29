#!/usr/bin/env node

/**
 * 验证Edge Function和Serverless Function之间的环境变量共享
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 验证环境变量共享配置...\n');

// 检查环境变量配置文件
function checkEnvFiles() {
  console.log('📋 检查环境变量配置文件:');
  
  const envFiles = ['.env.example', '.env.local', '.env'];
  const results = {};
  
  envFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}: 存在`);
      results[file] = true;
      
      // 读取并分析内容
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => 
        line.trim() && !line.startsWith('#') && line.includes('=')
      );
      
      console.log(`   📊 包含 ${lines.length} 个环境变量配置`);
      
      // 检查关键的API密钥
      const apiKeys = ['SILICONFLOW_API_KEY', 'OPENAI_API_KEY'];
      apiKeys.forEach(key => {
        const hasKey = lines.some(line => line.startsWith(key));
        console.log(`   ${hasKey ? '✅' : '❌'} ${key}`);
      });
    } else {
      console.log(`❌ ${file}: 不存在`);
      results[file] = false;
    }
  });
  
  return results;
}

// 检查Vercel配置
function checkVercelConfig() {
  console.log('\n📋 检查Vercel部署配置:');
  
  const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    console.log('❌ vercel.json: 不存在');
    return false;
  }
  
  console.log('✅ vercel.json: 存在');
  
  try {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    
    // 检查函数配置
    if (config.functions) {
      console.log('✅ 函数配置: 已定义');
      
      const edgeFunctions = [];
      const serverlessFunctions = [];
      
      Object.entries(config.functions).forEach(([path, config]) => {
        if (config.runtime === 'edge') {
          edgeFunctions.push(path);
        } else {
          serverlessFunctions.push(path);
        }
      });
      
      console.log(`   📊 Edge Functions: ${edgeFunctions.length}个`);
      edgeFunctions.forEach(fn => console.log(`      - ${fn}`));
      
      console.log(`   📊 Serverless Functions: ${serverlessFunctions.length}个`);
      serverlessFunctions.forEach(fn => console.log(`      - ${fn}`));
    } else {
      console.log('⚠️  函数配置: 未定义');
    }
    
    // 检查环境变量配置
    if (config.env) {
      console.log('✅ 环境变量配置: 已定义');
      const envVars = Object.keys(config.env);
      console.log(`   📊 配置的环境变量: ${envVars.length}个`);
      envVars.forEach(key => console.log(`      - ${key}`));
    } else {
      console.log('⚠️  环境变量配置: 未定义');
    }
    
    return true;
  } catch (error) {
    console.log('❌ vercel.json: 格式错误', error.message);
    return false;
  }
}

// 检查API端点的环境变量使用
function checkApiEndpoints() {
  console.log('\n📋 检查API端点的环境变量使用:');
  
  const apiPaths = [
    'app/api/chat-stream/route.ts',
    'app/api/module1-keywords/route.ts',
    'app/api/module2-plan-stream/route.ts',
    'app/api/module3-banner/route.ts'
  ];
  
  const results = {};
  
  apiPaths.forEach(apiPath => {
    const fullPath = path.join(process.cwd(), apiPath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${apiPath}: 存在`);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查环境变量使用
      const envUsage = [];
      if (content.includes('process.env.SILICONFLOW_API_KEY')) {
        envUsage.push('SILICONFLOW_API_KEY');
      }
      if (content.includes('process.env.OPENAI_API_KEY')) {
        envUsage.push('OPENAI_API_KEY');
      }
      if (content.includes('getModelApiKeyEnvName')) {
        envUsage.push('动态API密钥获取');
      }
      
      // 检查运行时配置
      let runtime = 'serverless';
      if (content.includes("export const runtime = 'edge'")) {
        runtime = 'edge';
      }
      
      console.log(`   🏃 运行时: ${runtime}`);
      console.log(`   🔑 使用的环境变量: ${envUsage.length > 0 ? envUsage.join(', ') : '无'}`);
      
      results[apiPath] = {
        exists: true,
        runtime,
        envUsage
      };
    } else {
      console.log(`❌ ${apiPath}: 不存在`);
      results[apiPath] = { exists: false };
    }
  });
  
  return results;
}

// 检查模型配置集成
function checkModelIntegration() {
  console.log('\n📋 检查模型配置集成:');
  
  const modelsPath = path.join(process.cwd(), 'lib/models.ts');
  if (!fs.existsSync(modelsPath)) {
    console.log('❌ lib/models.ts: 不存在');
    return false;
  }
  
  console.log('✅ lib/models.ts: 存在');
  
  const content = fs.readFileSync(modelsPath, 'utf8');
  
  // 检查关键函数
  const functions = [
    'getModelApiKeyEnvName',
    'DEFAULT_CHAT_MODEL',
    'getModelById',
    'getStreamingModels'
  ];
  
  functions.forEach(fn => {
    if (content.includes(fn)) {
      console.log(`   ✅ ${fn}: 已定义`);
    } else {
      console.log(`   ❌ ${fn}: 未定义`);
    }
  });
  
  // 检查支持的提供商
  const providers = ['siliconflow', 'openai', 'anthropic'];
  providers.forEach(provider => {
    if (content.includes(`'${provider}'`)) {
      console.log(`   ✅ ${provider}: 已支持`);
    } else {
      console.log(`   ❌ ${provider}: 未支持`);
    }
  });
  
  return true;
}

// 生成配置建议
function generateRecommendations(results) {
  console.log('\n💡 配置建议:');
  
  const recommendations = [];
  
  // 环境变量建议
  if (!results.envFiles['.env.example']) {
    recommendations.push('创建 .env.example 文件作为环境变量模板');
  }
  
  // Vercel配置建议
  if (!results.vercelConfig) {
    recommendations.push('创建 vercel.json 文件配置部署设置');
  }
  
  // API端点建议
  Object.entries(results.apiEndpoints).forEach(([path, config]) => {
    if (!config.exists) {
      recommendations.push(`实现缺失的API端点: ${path}`);
    } else if (config.envUsage.length === 0 && config.runtime === 'edge') {
      recommendations.push(`为Edge Function ${path} 添加环境变量使用`);
    }
  });
  
  if (recommendations.length === 0) {
    console.log('🎉 配置完整，无需额外建议！');
  } else {
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
}

// 主函数
function main() {
  const results = {
    envFiles: checkEnvFiles(),
    vercelConfig: checkVercelConfig(),
    apiEndpoints: checkApiEndpoints(),
    modelIntegration: checkModelIntegration()
  };
  
  generateRecommendations(results);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 环境变量共享验证完成');
  
  // 返回整体状态
  const overall = 
    results.envFiles['.env.example'] &&
    results.vercelConfig &&
    results.modelIntegration &&
    Object.values(results.apiEndpoints).every(api => api.exists);
  
  console.log(`📊 整体状态: ${overall ? '✅ 配置完整' : '⚠️  需要完善'}`);
  
  return overall;
}

// 如果直接运行此脚本
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };