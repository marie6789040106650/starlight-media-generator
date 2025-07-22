/**
 * 关键词库统计测试
 * 验证关键词库的完整性和数量
 */

const storeKeywords = require('../config/store-keywords.json');
const ownerKeywords = require('../config/owner-keywords.json');

console.log('📊 关键词库统计报告\n');

// 店铺关键词统计
console.log('🏪 店铺关键词库统计:');
console.log('=' .repeat(50));

let totalStoreKeywords = 0;
Object.entries(storeKeywords).forEach(([category, keywords]) => {
  console.log(`${category}: ${keywords.length} 个关键词`);
  totalStoreKeywords += keywords.length;
});

console.log(`\n总计: ${totalStoreKeywords} 个店铺关键词`);

// 老板关键词统计
console.log('\n👤 老板关键词库统计:');
console.log('=' .repeat(50));

let totalOwnerKeywords = 0;
Object.entries(ownerKeywords).forEach(([type, keywords]) => {
  console.log(`${type}: ${keywords.length} 个关键词`);
  totalOwnerKeywords += keywords.length;
});

console.log(`\n总计: ${totalOwnerKeywords} 个老板关键词`);

// 展示部分关键词示例
console.log('\n🔍 关键词示例:');
console.log('=' .repeat(50));

console.log('\n餐饮类店铺关键词 (前10个):');
storeKeywords['餐饮'].slice(0, 10).forEach((keyword, index) => {
  console.log(`  ${index + 1}. ${keyword}`);
});

console.log('\n专业类老板关键词 (前10个):');
ownerKeywords['professional'].slice(0, 10).forEach((keyword, index) => {
  console.log(`  ${index + 1}. ${keyword}`);
});

console.log('\n特殊背景老板关键词 (全部):');
ownerKeywords['special'].forEach((keyword, index) => {
  console.log(`  ${index + 1}. ${keyword}`);
});

// 检查关键词重复情况
console.log('\n🔄 重复关键词检查:');
console.log('=' .repeat(50));

// 检查店铺关键词重复
const allStoreKeywords = [];
Object.values(storeKeywords).forEach(keywords => {
  allStoreKeywords.push(...keywords);
});

const uniqueStoreKeywords = [...new Set(allStoreKeywords)];
const storeDuplicates = allStoreKeywords.length - uniqueStoreKeywords.length;

console.log(`店铺关键词重复数量: ${storeDuplicates}`);

// 检查老板关键词重复
const allOwnerKeywords = [];
Object.values(ownerKeywords).forEach(keywords => {
  allOwnerKeywords.push(...keywords);
});

const uniqueOwnerKeywords = [...new Set(allOwnerKeywords)];
const ownerDuplicates = allOwnerKeywords.length - uniqueOwnerKeywords.length;

console.log(`老板关键词重复数量: ${ownerDuplicates}`);

// 检查是否包含特定关键词
console.log('\n🎯 特定关键词检查:');
console.log('=' .repeat(50));

const hasXuebaChushen = allOwnerKeywords.includes('学霸出身');
const hasJiangrenChuancheng = allOwnerKeywords.includes('匠人传承');
const hasWangHongLaoban = allOwnerKeywords.includes('网红老板');
const hasChongFenDaren = allOwnerKeywords.includes('宠粉达人');

console.log(`包含"学霸出身": ${hasXuebaChushen}`);
console.log(`包含"匠人传承": ${hasJiangrenChuancheng}`);
console.log(`包含"网红老板": ${hasWangHongLaoban}`);
console.log(`包含"宠粉达人": ${hasChongFenDaren}`);

console.log('\n✅ 关键词库统计完成！');