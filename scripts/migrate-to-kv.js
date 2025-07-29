/**
 * 数据迁移脚本：从本地文件迁移到Vercel KV
 * 使用方法：node scripts/migrate-to-kv.js
 */

const { kv } = require('@vercel/kv');
const fs = require('fs');
const path = require('path');

async function migrateData() {
    console.log('🚀 开始数据迁移到Vercel KV...\n');

    try {
        // 检查KV连接
        console.log('🔍 检查KV连接...');
        await kv.set('migration-test', 'test-value');
        const testValue = await kv.get('migration-test');
        if (testValue !== 'test-value') {
            throw new Error('KV连接测试失败');
        }
        await kv.del('migration-test');
        console.log('✅ KV连接正常\n');

        // 迁移品类统计数据
        console.log('📊 迁移品类统计数据...');
        const categoryStatsPath = path.join(process.cwd(), 'config/category-stats.json');
        if (fs.existsSync(categoryStatsPath)) {
            const categoryStats = JSON.parse(fs.readFileSync(categoryStatsPath, 'utf-8'));
            await kv.set('category-stats', categoryStats);
            console.log('✅ 品类统计数据迁移完成');
            console.log(`   - 自定义品类: ${Object.keys(categoryStats.customCategories || {}).length}个`);
            console.log(`   - 待添加品类: ${Object.keys(categoryStats.pendingCategories || {}).length}个`);
        } else {
            console.log('⚠️  品类统计文件不存在，跳过');
        }

        // 迁移店铺关键词数据
        console.log('\n🔑 迁移店铺关键词数据...');
        const storeKeywordsPath = path.join(process.cwd(), 'config/store-keywords.json');
        if (fs.existsSync(storeKeywordsPath)) {
            const storeKeywords = JSON.parse(fs.readFileSync(storeKeywordsPath, 'utf-8'));
            await kv.set('store-keywords', storeKeywords);
            console.log('✅ 店铺关键词数据迁移完成');
            console.log(`   - 品类数量: ${Object.keys(storeKeywords).length}个`);

            // 显示品类列表
            const categories = Object.keys(storeKeywords);
            console.log(`   - 品类列表: ${categories.join(', ')}`);
        } else {
            console.log('⚠️  店铺关键词文件不存在，跳过');
        }

        // 验证迁移结果
        console.log('\n🔍 验证迁移结果...');
        const migratedCategoryStats = await kv.get('category-stats');
        const migratedStoreKeywords = await kv.get('store-keywords');

        if (migratedCategoryStats) {
            console.log('✅ 品类统计数据验证通过');
        } else {
            console.log('❌ 品类统计数据验证失败');
        }

        if (migratedStoreKeywords) {
            console.log('✅ 店铺关键词数据验证通过');
        } else {
            console.log('❌ 店铺关键词数据验证失败');
        }

        console.log('\n🎉 数据迁移完成！');
        console.log('\n📝 后续步骤：');
        console.log('1. 部署到Vercel生产环境');
        console.log('2. 配置KV环境变量');
        console.log('3. 测试动态品类功能');

    } catch (error) {
        console.error('❌ 数据迁移失败:', error.message);
        process.exit(1);
    }
}

// 检查环境变量
if (!process.env.KV_URL) {
    console.error('❌ 请先配置KV_URL环境变量');
    console.log('💡 提示：');
    console.log('1. 在Vercel项目中创建KV数据库');
    console.log('2. 复制环境变量到.env.local文件');
    console.log('3. 重新运行此脚本');
    process.exit(1);
}

migrateData();