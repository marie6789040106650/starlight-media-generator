/**
 * 简单的品类测试
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

async function testCategory() {
  console.log('🧪 测试品类管理功能...\n');

  try {
    // 1. 获取当前品类
    console.log('📋 获取当前品类列表...');
    const stats = await makeRequest('/api/category-management', null, 'GET');
    console.log('当前品类:', stats.data?.categories);
    console.log('品类统计:', stats.data?.stats);

    // 2. 测试新品类"金融"
    console.log('\n💰 测试新品类"金融"...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`第${i}次使用"金融"品类`);
      
      const testData = {
        storeName: `金融公司${i}`,
        storeCategory: '金融',
        storeLocation: '上海陆家嘴',
        businessDuration: '5年',
        storeFeatures: ['专业理财', '风险控制'],
        ownerName: '王',
        ownerFeatures: ['专业素养', '经验丰富']
      };

      const result = await makeRequest('/api/module1-keywords', testData);
      console.log('结果:', result.success ? '成功' : result.error);
    }

    // 3. 再次检查品类
    console.log('\n📊 检查品类是否已添加...');
    const finalStats = await makeRequest('/api/category-management', null, 'GET');
    console.log('最终品类:', finalStats.data?.categories);
    console.log('是否包含"金融":', finalStats.data?.categories.includes('金融'));

    console.log('\n✅ 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCategory();