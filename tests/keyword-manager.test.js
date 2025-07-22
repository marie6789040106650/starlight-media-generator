/**
 * 关键词管理器测试
 * 验证新的关键词系统是否正常工作
 */

const { storeKeywordManager, ownerKeywordManager } = require('../lib/keyword-manager');

console.log('🧪 测试关键词管理器...\n');

// 测试店铺关键词管理器
console.log('📋 测试店铺关键词管理器:');
console.log('支持的品类:', storeKeywordManager.getSupportedCategories());

// 测试餐饮类关键词
const restaurantKeywords = storeKeywordManager.getKeywordsByCategory('餐饮');
console.log('餐饮类关键词数量:', restaurantKeywords.length);
console.log('餐饮类前5个关键词:', restaurantKeywords.slice(0, 5));

// 测试基于特色的关键词推荐
const relevantKeywords = storeKeywordManager.getRelevantKeywords('餐饮', ['手工', '新鲜']);
console.log('基于"手工,新鲜"特色的相关关键词:', relevantKeywords.slice(0, 5));

console.log('\n👤 测试老板关键词管理器:');
console.log('支持的类型:', ownerKeywordManager.getSupportedTypes());

// 测试专业类关键词
const professionalKeywords = ownerKeywordManager.getKeywordsByType('professional');
console.log('专业类关键词:', professionalKeywords);

// 测试基于特色的关键词推荐
const ownerRelevantKeywords = ownerKeywordManager.getRelevantKeywords(['热情', '专业']);
console.log('基于"热情,专业"特色的相关关键词:', ownerRelevantKeywords.slice(0, 5));

// 测试获取所有关键词
const allOwnerKeywords = ownerKeywordManager.getAllKeywords();
console.log('老板关键词总数:', allOwnerKeywords.length);

// 验证是否包含"学霸"、"匠人"等关键词
const hasXueba = allOwnerKeywords.some(k => k.includes('学霸'));
const hasJiangren = allOwnerKeywords.some(k => k.includes('匠人'));

console.log('\n🔍 关键词检查:');
console.log('是否包含"学霸"相关关键词:', hasXueba);
console.log('是否包含"匠人"相关关键词:', hasJiangren);

// 但是应该包含"学霸出身"、"匠人传承"作为可选项
const hasXuebaChushen = allOwnerKeywords.includes('学霸出身');
const hasJiangrenChuancheng = allOwnerKeywords.includes('匠人传承');

console.log('是否包含"学霸出身"作为可选项:', hasXuebaChushen);
console.log('是否包含"匠人传承"作为可选项:', hasJiangrenChuancheng);

console.log('\n✅ 关键词管理器测试完成！');