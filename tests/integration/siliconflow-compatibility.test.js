/**
 * SiliconFlow API兼容性测试
 * 验证SiliconFlow API与现有系统的兼容性
 */

console.log('🚀 SiliconFlow API兼容性测试');

// 测试环境变量配置
function testEnvironmentVariables() {
  console.log('🔍 检查环境变量配置...');
  
  const requiredVars = [
    'SILICONFLOW_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  const optionalVars = [
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_EDGE_REGION',
    'API_TIMEOUT',
    'STREAM_TIMEOUT'
  ];
  
  const results = {
    configured: [],
    missing: [],
    optional: []
  };
  
  // 检查必需的环境变量
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      results.configured.push(varName);
      console.log(`✅ ${varName}: 已配置`);
    } else {
      results.missing.push(varName);
      console.log(`❌ ${varName}: 未配置`);
    }
  });
  
  // 检查可选的环境变量
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      results.optional.push(varName);
      console.log(`✅ ${varName}: 已配置 (${process.env[varName]})`);
    } else {
      console.log(`⚠️  ${varName}: 未配置 (可选)`);
    }
  });
  
  return results;
}

// 测试SiliconFlow API连接
async function testSiliconFlowConnection() {
  console.log('🔍 测试SiliconFlow API连接...');
  
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    console.log('❌ SILICONFLOW_API_KEY环境变量未设置');
    return { success: false, error: 'API密钥未配置' };
  }
  
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ API连接失败: ${response.status} ${response.statusText}`);
      return { success: false, error: `${response.status} ${response.statusText}` };
    }
    
    const data = await response.json();
    console.log('✅ SiliconFlow API连接成功');
    console.log(`📊 可用模型数量: ${data.data?.length || 0}`);
    
    return { success: true, models: data.data };
  } catch (error) {
    console.log('❌ SiliconFlow API连接失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runCompatibilityTests() {
  console.log('='.repeat(50));
  
  // 1. 测试环境变量
  const envResults = testEnvironmentVariables();
  
  console.log('\n' + '='.repeat(50));
  
  // 2. 测试API连接
  const connectionResults = await testSiliconFlowConnection();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 测试结果汇总:');
  console.log(`⚙️  环境配置: ${envResults.missing.length === 0 ? '✅ 完整' : '⚠️  不完整'}`);
  console.log(`🔗 API连接: ${connectionResults.success ? '✅ 通过' : '❌ 失败'}`);
  
  const overall = envResults.missing.length === 0 && connectionResults.success;
  console.log(`🎯 整体状态: ${overall ? '✅ 兼容' : '❌ 需要修复'}`);
  
  return {
    environment: envResults,
    connection: connectionResults,
    overall
  };
}

// 如果直接运行此脚本
if (require.main === module) {
  runCompatibilityTests()
    .then(results => {
      process.exit(results.overall ? 0 : 1);
    })
    .catch(error => {
      console.error('测试执行失败:', error);
      process.exit(1);
    });
}

module.exports = {
  runCompatibilityTests,
  testSiliconFlowConnection,
  testEnvironmentVariables
};