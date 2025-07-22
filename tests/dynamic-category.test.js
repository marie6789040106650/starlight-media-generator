/**
 * 动态品类功能测试
 * 验证品类自动添加功能是否正常工作
 */

const http = require('http');

// 发送HTTP请求的工具函数
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

async function testDynamicCategory() {
  console.log('🧪 测试动态品类功能...\n');

  try {
    // 1. 获取当前品类状态
    console.log('📋 获取当前品类状态...');
    const initialStats = await makeRequest('/api/category-management', null, 'GET');
    console.log('当前品类数量:', initialStats.data?.stats.totalCategories);
    console.log('自定义品类数量:', initialStats.data?.stats.customCategories);
    console.log('待添加品类:', initialStats.data?.stats.pendingCategories);

    // 2. 测试新品类"科技"的自动添加
    const newCategory = '科技';
    console.log(`\n🔬 测试新品类"${newCategory}"的自动添加...`);

    // 模拟用户连续3次使用新品类
    for (let i = 1; i <= 4; i++) {
      console.log(`\n第${i}次使用品类"${newCategory}"`);
      
      const testStoreInfo = {
        storeName: `科技公司${i}`,
        storeCategory: newCategory,
        storeLocation: '深圳南山',
        businessDuration: '2年',
        storeFeatures: ['技术创新', '专业服务'],
        ownerName: '李',
        ownerFeatures: ['技术精湛', '创新思维']
      };

      // 通过module1-keywords API触发品类记录
      const result = await makeRequest('/api/module1-keywords', testStoreInfo);
      
      if (result.success) {
        console.log('✅ 关键词生成成功');
        if (result.data.categoryInfo) {
          console.log('品类信息:', result.data.categoryInfo.message);
          if (result.data.categoryInfo.shouldAdd) {
            console.log('🎉 品类已自动添加！');
            break;
          }
        }
      } else {
        console.log('❌ 关键词生成失败:', result.error);
      }

      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. 验证品类是否已添加
    console.log('\n📊 验证品类添加结果...');
    const finalStats = await makeRequest('/api/category-management', null, 'GET');
    
    const hasNewCategory = finalStats.data?.categories.includes(newCategory);
    console.log(`品类"${newCategory}"是否已添加:`, hasNewCategory);
    
    if (hasNewCategory) {
      console.log('新品类总数:', finalStats.data?.stats.totalCategories);
      console.log('自定义品类数量:', finalStats.data?.stats.customCategories);
    }

    // 4. 测试新品类的关键词生成
    if (hasNewCategory) {
      console.log(`\n🔑 测试新品类"${newCategory}"的关键词生成...`);
      
      const testWithNewCategory = {
        storeName: '创新科技',
        storeCategory: newCategory,
        storeLocation: '北京中关村',
        businessDuration: '3年',
        storeFeatures: ['技术领先', '创新研发'],
        ownerName: '张',
        ownerFeatures: ['专业素养', '技术出身']
      };

      const newCategoryResult = await makeRequest('/api/module1-keywords', testWithNewCategory);
      
      if (newCategoryResult.success) {
        console.log('✅ 新品类关键词生成成功');
        console.log('生成的店铺关键词:');
        newCategoryResult.data.confirmedStoreKeywords.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.keyword}`);
        });
      }
    }

    // 5. 测试手动添加品类
    console.log('\n🛠️ 测试手动添加品类...');
    const manualAddResult = await makeRequest('/api/category-management', {
      action: 'add',
      category: '宠物',
      keywords: ['专业护理', '健康保障', '服务贴心', '设施完善', '价格透明', '爱心服务']
    });

    console.log('手动添加结果:', manualAddResult.data?.message);

    console.log('\n✅ 动态品类功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testDynamicCategory();