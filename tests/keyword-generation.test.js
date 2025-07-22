/**
 * 关键词生成机制测试
 * 验证系统如何为新品类生成相关关键词
 */

const http = require('http');

function makeRequest(path, data, method = 'POST') {
  return new Promise((resolve, reject) => {
    const postData = method === 'POST' ? JSON.stringify(data) : null;
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: method === 'POST' ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testKeywordGeneration() {
  console.log('🧠 测试关键词生成机制\n');

  const testCases = [
    {
      name: '医疗',
      description: '全新品类，不在预定义映射表中',
      expectedType: '动态生成'
    },
    {
      name: '宠物',
      description: '预定义品类，在映射表中',
      expectedType: '精确匹配'
    },
    {
      name: '咖啡',
      description: '全新品类，测试动态组合',
      expectedType: '动态生成'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔬 测试品类: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`🎯 预期类型: ${testCase.expectedType}`);
    console.log('=' .repeat(50));

    try {
      // 检查品类是否已存在
      const initialStats = await makeRequest('/api/category-management', null, 'GET');
      const categoryExists = initialStats.data?.categories.includes(testCase.name);
      
      if (categoryExists) {
        console.log('⚠️  品类已存在，跳过测试\n');
        continue;
      }

      // 连续3次使用触发自动添加
      console.log('🔄 触发自动添加...');
      for (let i = 1; i <= 3; i++) {
        const testData = {
          storeName: `${testCase.name}店${i}`,
          storeCategory: testCase.name,
          storeLocation: '上海徐汇',
          businessDuration: '2年',
          storeFeatures: ['专业服务', '品质保证'],
          ownerName: '张',
          ownerFeatures: ['专业素养', '经验丰富']
        };

        const result = await makeRequest('/api/module1-keywords', testData);
        
        if (result.success && result.data.categoryInfo?.shouldAdd) {
          console.log(`✅ 第${i}次使用后品类已添加`);
          break;
        }
      }

      // 测试生成的关键词
      console.log('\n🔑 分析生成的关键词:');
      const testData = {
        storeName: `优质${testCase.name}`,
        storeCategory: testCase.name,
        storeLocation: '北京海淀',
        businessDuration: '5年',
        storeFeatures: ['专业技术', '优质服务'],
        ownerName: '李',
        ownerFeatures: ['专业素养', '技术精湛']
      };

      const keywordResult = await makeRequest('/api/module1-keywords', testData);
      
      if (keywordResult.success) {
        const storeKeywords = keywordResult.data.confirmedStoreKeywords.map(k => k.keyword);
        
        console.log('生成的店铺关键词:');
        storeKeywords.forEach((keyword, index) => {
          console.log(`  ${index + 1}. ${keyword}`);
        });

        // 分析关键词类型
        console.log('\n📊 关键词分析:');
        
        // 检查是否包含品类名称
        const containsCategoryName = storeKeywords.some(k => k.includes(testCase.name));
        console.log(`包含品类名称"${testCase.name}": ${containsCategoryName}`);
        
        // 检查动态生成的关键词模式
        const dynamicPatterns = [
          `${testCase.name}专业`,
          `${testCase.name}品质`,
          `${testCase.name}服务`,
          `优质${testCase.name}`,
          `专业${testCase.name}`
        ];
        
        const hasDynamicKeywords = dynamicPatterns.some(pattern => 
          storeKeywords.some(k => k === pattern)
        );
        console.log(`包含动态生成关键词: ${hasDynamicKeywords}`);
        
        // 检查通用关键词
        const commonKeywords = ['专业服务', '品质保证', '价格合理', '服务周到'];
        const hasCommonKeywords = commonKeywords.some(common => 
          storeKeywords.some(k => k === common)
        );
        console.log(`包含通用关键词: ${hasCommonKeywords}`);
        
        // 关键词相关性评分
        const relevanceScore = calculateRelevanceScore(storeKeywords, testCase.name);
        console.log(`关键词相关性评分: ${relevanceScore}/10`);
      }

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('✅ 关键词生成机制测试完成！');
}

// 计算关键词相关性评分
function calculateRelevanceScore(keywords, categoryName) {
  let score = 0;
  
  keywords.forEach(keyword => {
    // 包含品类名称 +3分
    if (keyword.includes(categoryName)) {
      score += 3;
    }
    // 专业相关词汇 +2分
    else if (keyword.includes('专业') || keyword.includes('品质') || keyword.includes('服务')) {
      score += 2;
    }
    // 通用词汇 +1分
    else {
      score += 1;
    }
  });
  
  // 标准化到10分制
  return Math.min(10, Math.round(score / keywords.length * 2));
}

testKeywordGeneration();