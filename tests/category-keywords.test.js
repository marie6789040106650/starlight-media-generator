/**
 * 不同品类关键词生成测试
 * 验证不同品类是否生成相应的关键词
 */

const http = require('http');

// 测试不同品类的店铺信息
const testCases = [
  {
    name: '餐饮店铺',
    data: {
      storeName: '川味小厨',
      storeCategory: '餐饮',
      storeLocation: '成都春熙路',
      businessDuration: '3年',
      storeFeatures: ['传统工艺', '现制模式'],
      ownerName: '张',
      ownerFeatures: ['匠人传承', '热情好客']
    }
  },
  {
    name: '美业店铺',
    data: {
      storeName: '美丽人生',
      storeCategory: '美业',
      storeLocation: '上海淮海路',
      businessDuration: '5年',
      storeFeatures: ['专业技术', '个性定制'],
      ownerName: '李',
      ownerFeatures: ['学霸出身', '专业素养']
    }
  },
  {
    name: '教育机构',
    data: {
      storeName: '智慧教育',
      storeCategory: '教育',
      storeLocation: '北京海淀区',
      businessDuration: '8年',
      storeFeatures: ['师资优秀', '因材施教'],
      ownerName: '王',
      ownerFeatures: ['海归背景', '教育支持']
    }
  }
];

// 发送HTTP请求的工具函数
function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
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

    req.write(postData);
    req.end();
  });
}

async function testCategoryKeywords() {
  console.log('🧪 测试不同品类关键词生成...\n');

  for (const testCase of testCases) {
    console.log(`📋 测试 ${testCase.name}:`);
    console.log('=' .repeat(50));
    
    try {
      // 1. 测试关键词扩展
      console.log('🔍 关键词扩展结果:');
      const expandResult = await makeRequest('/api/expand-keywords', {
        storeFeatures: testCase.data.storeFeatures.join(','),
        ownerFeatures: testCase.data.ownerFeatures.join(','),
        storeCategory: testCase.data.storeCategory
      });

      console.log(`店铺扩展关键词: ${expandResult.expanded_store_features?.slice(0, 5).join(', ')}`);
      console.log(`老板扩展关键词: ${expandResult.expanded_boss_features?.slice(0, 5).join(', ')}`);

      // 2. 测试模块1关键词生成
      console.log('\n🔑 模块1关键词生成结果:');
      const module1Result = await makeRequest('/api/module1-keywords', testCase.data);

      if (module1Result.success) {
        console.log('生成的店铺关键词:');
        module1Result.data.confirmedStoreKeywords.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.keyword}`);
        });

        console.log('生成的老板关键词:');
        module1Result.data.confirmedOwnerKeywords.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.keyword}`);
        });

        // 检查是否包含用户选择的特色关键词
        const storeKeywords = module1Result.data.confirmedStoreKeywords.map(k => k.keyword);
        const ownerKeywords = module1Result.data.confirmedOwnerKeywords.map(k => k.keyword);

        const hasSelectedStoreFeatures = testCase.data.storeFeatures.some(feature => 
          storeKeywords.some(keyword => keyword.includes(feature) || feature.includes(keyword))
        );

        const hasSelectedOwnerFeatures = testCase.data.ownerFeatures.some(feature => 
          ownerKeywords.some(keyword => keyword.includes(feature) || feature.includes(keyword))
        );

        console.log(`\n✅ 包含用户选择的店铺特色: ${hasSelectedStoreFeatures}`);
        console.log(`✅ 包含用户选择的老板特色: ${hasSelectedOwnerFeatures}`);

      } else {
        console.error('❌ 模块1 API 错误:', module1Result.error);
      }

    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }

    console.log('\n');
  }

  console.log('✅ 不同品类关键词生成测试完成！');
}

// 运行测试
testCategoryKeywords();