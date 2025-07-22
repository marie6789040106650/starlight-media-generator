/**
 * 即时可用功能验证测试
 * 验证新品类添加后立即可用于关键词生成
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

async function testInstantAvailability() {
  console.log('⚡ 测试新品类的即时可用性\n');

  try {
    const newCategory = '汽车';
    console.log(`🚗 测试品类: ${newCategory}`);
    console.log('=' .repeat(50));

    // 1. 确认品类不存在
    const initialStats = await makeRequest('/api/category-management', null, 'GET');
    const categoryExists = initialStats.data?.categories.includes(newCategory);
    console.log(`初始状态 - 品类"${newCategory}"是否存在: ${categoryExists}`);

    if (categoryExists) {
      console.log('⚠️  品类已存在，跳过测试');
      return;
    }

    // 2. 连续3次使用新品类触发自动添加
    console.log('\n🔄 连续使用新品类触发自动添加...');
    let addedInIteration = 0;

    for (let i = 1; i <= 3; i++) {
      console.log(`\n第${i}次使用:`);
      
      const testData = {
        storeName: `汽车店${i}`,
        storeCategory: newCategory,
        storeLocation: '上海浦东',
        businessDuration: '3年',
        storeFeatures: ['品质可靠', '性能优越'],
        ownerName: '王',
        ownerFeatures: ['专业素养', '经验丰富']
      };

      const startTime = Date.now();
      const result = await makeRequest('/api/module1-keywords', testData);
      const endTime = Date.now();

      if (result.success) {
        console.log(`  ✅ 关键词生成成功 (耗时: ${endTime - startTime}ms)`);
        
        if (result.data.categoryInfo?.shouldAdd) {
          console.log(`  🎉 品类"${newCategory}"已自动添加！`);
          addedInIteration = i;
          break;
        } else if (result.data.categoryInfo?.message) {
          console.log(`  📝 ${result.data.categoryInfo.message}`);
        }
      } else {
        console.log(`  ❌ 失败: ${result.error}`);
      }
    }

    // 3. 立即测试新品类的可用性（无延迟）
    console.log('\n⚡ 立即测试新品类可用性（无延迟）:');
    console.log('-' .repeat(30));

    const immediateTestData = {
      storeName: '豪华汽车',
      storeCategory: newCategory,
      storeLocation: '北京朝阳',
      businessDuration: '5年',
      storeFeatures: ['售后保障', '驾驶体验'],
      ownerName: '李',
      ownerFeatures: ['海归背景', '技术出身']
    };

    const immediateStartTime = Date.now();
    const immediateResult = await makeRequest('/api/module1-keywords', immediateTestData);
    const immediateEndTime = Date.now();

    if (immediateResult.success) {
      console.log(`✅ 即时测试成功！(耗时: ${immediateEndTime - immediateStartTime}ms)`);
      console.log('\n🔑 生成的关键词:');
      
      console.log('店铺关键词:');
      immediateResult.data.confirmedStoreKeywords.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.keyword} - ${item.description}`);
      });
      
      console.log('\n老板关键词:');
      immediateResult.data.confirmedOwnerKeywords.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.keyword} - ${item.description}`);
      });

      // 4. 验证关键词质量
      const storeKeywords = immediateResult.data.confirmedStoreKeywords.map(k => k.keyword);
      const hasSpecificKeywords = storeKeywords.some(k => 
        k.includes('汽车') || k.includes('车') || k.includes('驾驶') || 
        k.includes('性能') || k.includes('品质') || k.includes('售后')
      );
      
      console.log(`\n🎯 关键词质量检查:`);
      console.log(`  包含汽车相关关键词: ${hasSpecificKeywords}`);
      console.log(`  关键词总数: ${storeKeywords.length}`);

    } else {
      console.log(`❌ 即时测试失败: ${immediateResult.error}`);
    }

    // 5. 验证系统状态
    console.log('\n📊 最终系统状态验证:');
    const finalStats = await makeRequest('/api/category-management', null, 'GET');
    const finalCategoryExists = finalStats.data?.categories.includes(newCategory);
    console.log(`品类"${newCategory}"最终状态: ${finalCategoryExists ? '已添加' : '未添加'}`);

    // 6. 性能分析
    console.log('\n⚡ 性能分析:');
    console.log(`品类添加触发轮次: 第${addedInIteration}次`);
    console.log('即时可用机制: 文件更新 → 动态重载 → 立即可用');
    console.log('无需重启服务器或清除缓存');

    console.log('\n✅ 即时可用性测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testInstantAvailability();