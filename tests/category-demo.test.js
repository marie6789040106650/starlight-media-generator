/**
 * 动态品类功能完整演示
 * 展示品类自动添加的完整流程
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

async function demonstrateFeature() {
  console.log('🎯 动态品类功能完整演示\n');
  console.log('=' .repeat(60));

  try {
    // 1. 显示当前状态
    console.log('📊 当前系统状态:');
    const initialStats = await makeRequest('/api/category-management', null, 'GET');
    console.log(`总品类数量: ${initialStats.data?.stats.totalCategories}`);
    console.log(`默认品类: ${initialStats.data?.stats.defaultCategories}`);
    console.log(`自定义品类: ${initialStats.data?.stats.customCategories}`);
    console.log(`待添加品类: ${JSON.stringify(initialStats.data?.stats.pendingCategories)}`);
    console.log(`当前品类列表: ${initialStats.data?.categories.join(', ')}`);

    // 2. 演示新品类"房产"的添加过程
    const newCategory = '房产';
    console.log(`\n🏠 演示新品类"${newCategory}"的自动添加过程:`);
    console.log('-' .repeat(50));

    for (let i = 1; i <= 4; i++) {
      console.log(`\n第${i}次用户使用品类"${newCategory}":`);
      
      const testData = {
        storeName: `房产公司${i}`,
        storeCategory: newCategory,
        storeLocation: '北京朝阳',
        businessDuration: `${i + 1}年`,
        storeFeatures: ['地段优越', '品质楼盘'],
        ownerName: '李',
        ownerFeatures: ['专业素养', '经验丰富']
      };

      const result = await makeRequest('/api/module1-keywords', testData);
      
      if (result.success) {
        console.log('  ✅ 关键词生成成功');
        
        // 检查品类信息
        if (result.data.categoryInfo) {
          console.log(`  📝 ${result.data.categoryInfo.message}`);
          
          if (result.data.categoryInfo.shouldAdd) {
            console.log('  🎉 品类已自动添加到系统！');
            
            // 显示生成的关键词
            console.log('  🔑 生成的店铺关键词:');
            result.data.confirmedStoreKeywords.forEach((item, index) => {
              console.log(`    ${index + 1}. ${item.keyword} - ${item.description}`);
            });
            break;
          }
        }
      } else {
        console.log('  ❌ 失败:', result.error);
      }
    }

    // 3. 验证最终状态
    console.log('\n📈 最终系统状态:');
    console.log('-' .repeat(50));
    const finalStats = await makeRequest('/api/category-management', null, 'GET');
    console.log(`总品类数量: ${finalStats.data?.stats.totalCategories} (增加了 ${finalStats.data?.stats.totalCategories - initialStats.data?.stats.totalCategories})`);
    console.log(`自定义品类: ${finalStats.data?.stats.customCategories} (增加了 ${finalStats.data?.stats.customCategories - initialStats.data?.stats.customCategories})`);
    console.log(`新增品类: ${finalStats.data?.categories.filter(c => !initialStats.data?.categories.includes(c)).join(', ')}`);

    // 4. 测试新品类的关键词生成效果
    if (finalStats.data?.categories.includes(newCategory)) {
      console.log(`\n🧪 测试新品类"${newCategory}"的关键词生成效果:`);
      console.log('-' .repeat(50));
      
      const testNewCategory = {
        storeName: '优质房产',
        storeCategory: newCategory,
        storeLocation: '上海浦东',
        businessDuration: '10年',
        storeFeatures: ['投资价值', '居住舒适'],
        ownerName: '张',
        ownerFeatures: ['海归背景', '专业素养']
      };

      const newCategoryTest = await makeRequest('/api/module1-keywords', testNewCategory);
      
      if (newCategoryTest.success) {
        console.log('✅ 新品类关键词生成测试成功');
        console.log('\n店铺关键词:');
        newCategoryTest.data.confirmedStoreKeywords.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.keyword}`);
        });
        console.log('\n老板关键词:');
        newCategoryTest.data.confirmedOwnerKeywords.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.keyword}`);
        });
      }
    }

    // 5. 功能特点总结
    console.log('\n🎯 功能特点总结:');
    console.log('=' .repeat(60));
    console.log('✅ 用户可以输入任意品类名称');
    console.log('✅ 系统自动统计新品类的使用次数');
    console.log('✅ 达到3次阈值时自动添加新品类');
    console.log('✅ 自动为新品类生成相关关键词');
    console.log('✅ 新品类立即可用于关键词生成');
    console.log('✅ 支持手动管理品类（添加/删除）');

    console.log('\n🎉 演示完成！');

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
  }
}

demonstrateFeature();