/**
 * 关键词系统集成测试
 * 验证关键词扩展和生成是否按预期工作
 */

const http = require('http');

// 测试数据
const testStoreInfo = {
  storeName: '测试小店',
  storeCategory: '餐饮',
  storeLocation: '北京朝阳',
  businessDuration: '2年',
  storeFeatures: ['手工制作', '新鲜食材'],
  ownerName: '李',
  ownerFeatures: ['热情好客', '专业技能']
};

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

async function testKeywordSystem() {
  console.log('🧪 测试关键词系统...\n');

  try {
    // 1. 测试关键词扩展API
    console.log('📋 测试关键词扩展API...');
    const expandResult = await makeRequest('/api/expand-keywords', {
      storeFeatures: '手工制作,新鲜食材',
      ownerFeatures: '热情好客,专业技能',
      storeCategory: '餐饮'
    });

    console.log('店铺扩展关键词:', expandResult.expanded_store_features?.slice(0, 5));
    console.log('老板扩展关键词:', expandResult.expanded_boss_features?.slice(0, 5));

    // 检查是否包含不应该出现的硬编码关键词
    const storeHasXueba = expandResult.expanded_store_features?.some(k => k.includes('学霸'));
    const ownerHasXueba = expandResult.expanded_boss_features?.some(k => k.includes('学霸'));
    const ownerHasJiangren = expandResult.expanded_boss_features?.some(k => k.includes('匠人'));

    console.log('店铺关键词是否包含"学霸":', storeHasXueba);
    console.log('老板关键词是否包含"学霸":', ownerHasXueba);
    console.log('老板关键词是否包含"匠人":', ownerHasJiangren);

    // 2. 测试模块1关键词生成API
    console.log('\n🔑 测试模块1关键词生成API...');
    const module1Result = await makeRequest('/api/module1-keywords', testStoreInfo);

    if (module1Result.success) {
      console.log('生成的店铺关键词:');
      module1Result.data.confirmedStoreKeywords.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.keyword} - ${item.description}`);
      });

      console.log('生成的老板关键词:');
      module1Result.data.confirmedOwnerKeywords.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.keyword} - ${item.description}`);
      });

      // 检查生成的关键词是否合理
      const storeKeywords = module1Result.data.confirmedStoreKeywords.map(k => k.keyword);
      const ownerKeywords = module1Result.data.confirmedOwnerKeywords.map(k => k.keyword);

      const hasUnexpectedStoreKeywords = storeKeywords.some(k => k.includes('学霸') || k.includes('匠人'));
      const hasUnexpectedOwnerKeywords = ownerKeywords.some(k => k.includes('学霸') && !testStoreInfo.ownerFeatures.some(f => f.includes('学霸')));

      console.log('店铺关键词是否包含意外的硬编码词:', hasUnexpectedStoreKeywords);
      console.log('老板关键词是否包含意外的硬编码词:', hasUnexpectedOwnerKeywords);

      // 3. 测试模块2方案生成（使用生成的关键词）
      console.log('\n📝 测试模块2方案生成...');
      const module2Data = {
        ...testStoreInfo,
        confirmedStoreKeywords: module1Result.data.confirmedStoreKeywords,
        confirmedOwnerKeywords: module1Result.data.confirmedOwnerKeywords
      };

      // 这里只测试请求是否能正常发送，不等待完整响应
      console.log('发送模块2请求...');
      const module2Response = await makeRequest('/api/module2-plan-stream', module2Data);
      console.log('模块2响应状态: 已发送请求');

    } else {
      console.error('模块1 API 错误:', module1Result.error);
    }

    console.log('\n✅ 关键词系统测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testKeywordSystem();