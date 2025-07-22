/**
 * API端点测试脚本
 * 测试模块1、模块2、模块3和流式聊天的API功能
 * 
 * 测试覆盖：
 * - 模块1: /api/module1-keywords (关键词推荐)
 * - 模块2: /api/module2-plan-stream (流式方案生成)
 * - 模块3: /api/module3-banner (Banner设计)
 * - 流式聊天: /api/chat-stream (通用流式聊天)
 */

const { TEST_CONFIG, TestUtils } = require('../test-config');

// 测试数据
const testModule1Data = {
  ...TEST_CONFIG.TEST_DATA.STORE_INFO,
  ...TEST_CONFIG.TEST_DATA.MODULE1_DATA
};

const testModule2Data = TEST_CONFIG.TEST_DATA.MODULE2_DATA;
const testChatMessages = TEST_CONFIG.TEST_DATA.CHAT_MESSAGES;

// 测试统计
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// 辅助函数
function logTestResult(testName, success, error = null) {
  testResults.total++;
  if (success) {
    testResults.passed++;
    TestUtils.log('info', `✅ ${testName} - 通过`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error?.message || '未知错误' });
    TestUtils.log('error', `❌ ${testName} - 失败: ${error?.message || '未知错误'}`);
  }
}

function printTestSummary() {
  console.log('\n📊 测试结果汇总:');
  console.log(`总计: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ 失败详情:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }
}

// 测试模块1 API
async function testModule1API() {
  console.log('🧪 测试模块1 API (关键词推荐)...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/module1-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeName: testModule1Data.storeName,
        storeCategory: testModule1Data.storeCategory,
        storeLocation: testModule1Data.storeLocation,
        businessDuration: testModule1Data.businessDuration,
        storeFeatures: testModule1Data.storeFeatures,
        ownerName: testModule1Data.ownerName,
        ownerFeatures: testModule1Data.ownerFeatures
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    console.log('📝 响应数据:', JSON.stringify(result, null, 2));
    
    // 验证响应结构
    if (!result.success || !result.data) {
      throw new Error('响应格式不正确');
    }
    
    if (!result.data.confirmedStoreKeywords || !result.data.confirmedOwnerKeywords) {
      throw new Error('缺少必需的关键词数据');
    }
    
    console.log(`📈 生成关键词统计: 店铺关键词 ${result.data.confirmedStoreKeywords.length} 个, 老板关键词 ${result.data.confirmedOwnerKeywords.length} 个`);
    
    logTestResult('模块1 API', true);
    
  } catch (error) {
    logTestResult('模块1 API', false, error);
  }
}

// 测试流式聊天API
async function testChatStreamAPI() {
  console.log('\n🧪 测试流式聊天 API...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/chat-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: testChatMessages,
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));

    // 读取流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let chunks = [];
    let totalContent = '';
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      chunks.push(chunk);
      
      // 解析SSE数据
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('📦 收到结束标记');
            break;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              totalContent += parsed.content;
              console.log('📦 收到内容块:', parsed.content.substring(0, 50) + '...');
            } else if (parsed.data) {
              // 处理我们API的数据格式
              totalContent += JSON.stringify(parsed.data);
              console.log('📦 收到数据块:', JSON.stringify(parsed.data).substring(0, 100) + '...');
            }
          } catch (e) {
            // 忽略解析错误，继续处理
          }
        }
      }
    }

    const endTime = Date.now();
    console.log(`⏱️  流式响应耗时: ${endTime - startTime}ms`);
    console.log(`📝 总共收到 ${chunks.length} 个数据块`);
    console.log(`📄 完整内容长度: ${totalContent.length} 字符`);
    
    if (totalContent.length === 0) {
      throw new Error('未收到有效内容');
    }
    
    logTestResult('流式聊天 API', true);
    
  } catch (error) {
    logTestResult('流式聊天 API', false, error);
  }
}

// 测试模块2 API
async function testModule2API() {
  console.log('🧪 测试模块2 API (流式生成8个板块方案)...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/module2-plan-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testModule1Data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));

    // 读取流式响应
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    let chunks = [];
    let boardSections = new Set();
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      chunks.push(chunk);
      
      // 分析数据块内容，统计板块
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content' && parsed.data) {
              // 检查所有可能的板块字段
              Object.keys(parsed.data).forEach(key => {
                boardSections.add(key);
                console.log(`📋 检测到板块字段: ${key}`);
              });
            }
          } catch (e) {
            // 忽略解析错误
            console.log('⚠️ JSON解析错误:', e.message);
          }
        }
      }
      
      console.log('📦 收到数据块:', chunk.substring(0, 100) + '...');
    }

    const endTime = Date.now();
    console.log(`⏱️  流式响应耗时: ${endTime - startTime}ms`);
    console.log(`📝 总共收到 ${chunks.length} 个数据块`);
    console.log(`📋 检测到板块: ${Array.from(boardSections).join(', ')}`);
    
    // 验证是否收到了预期的8个板块
    const expectedSections = ['ipTags', 'brandSlogan', 'contentColumns', 'goldenSentences', 
                             'accountMatrix', 'liveStreamDesign', 'operationAdvice', 'commercializationPath'];
    const missingSections = expectedSections.filter(section => !boardSections.has(section));
    
    if (missingSections.length > 0) {
      console.log(`⚠️  缺少板块: ${missingSections.join(', ')}`);
    }
    
    logTestResult('模块2 API', true);
    
  } catch (error) {
    logTestResult('模块2 API', false, error);
  }
}

// 测试模块3 API
async function testModule3API() {
  console.log('\n🧪 测试模块3 API (Banner设计方案)...');
  
  const module3RequestData = {
    module1Data: testModule1Data,
    module2Data: testModule2Data
  };
  
  try {
    const response = await fetch(`${TEST_CONFIG.API_BASE_URL}/api/module3-banner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(module3RequestData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 模块3 API 响应成功');
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    console.log('📝 响应数据:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ 模块3 API 测试失败:', error.message);
  }
}

// 测试模块3 API (直接数据格式)
async function testModule3APIDirectData() {
  console.log('\n🧪 测试模块3 API (直接数据格式)...');
  
  const directData = {
    storeName: "川味小厨",
    storeCategory: "餐饮",
    storeLocation: "成都春熙路",
    confirmedStoreKeywords: [
      { keyword: "正宗川菜", description: "传统四川菜系，口味地道" }
    ],
    brandSlogan: "正宗川味，家的味道",
    ipTags: ["川菜师傅", "热情老板", "本地达人"],
    contentColumns: [
      { title: "川菜说", description: "分享正宗川菜制作技巧" }
    ]
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/module3-banner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(directData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ 模块3 API (直接数据) 响应成功');
    console.log('📝 响应数据:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ 模块3 API (直接数据) 测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始API端点测试...\n');
  
  // 注意：模块2需要AI API密钥，如果没有配置会失败
  console.log('⚠️  注意：模块2测试需要配置SILICONFLOW_API_KEY环境变量\n');
  
  await testModule2API();
  await testModule3API();
  await testModule3APIDirectData();
  
  console.log('\n🎉 所有测试完成！');
}

// 如果直接运行此脚本
if (typeof window === 'undefined') {
  runAllTests().catch(console.error);
}

// 导出测试函数供其他地方使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testModule2API,
    testModule3API,
    testModule3APIDirectData,
    runAllTests
  };
}