#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 确保所有配置正确，Edge Function和Serverless Function准备就绪
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 部署前检查开始...\n');

// 检查项目结构
function checkProjectStructure() {
  console.log('📋 检查项目结构:');
  
  const requiredPaths = [
    'app/api/chat-stream/route.ts',
    'app/api/module1-keywords/route.ts', 
    'app/api/module2-plan-stream/route.ts',
    'app/api/module3-banner/route.ts',
    'lib/models.ts',
    'lib/business-types.ts',
    'lib/business-utils.ts',
    'vercel.json',
    '.env.example'
  ];
  
  let allExist = true;
  
  requiredPaths.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`❌ ${filePath}`);
      allExist = false;
    }
  });
  
  return allExist;
}

// 检查TypeScript编译
function checkTypeScript() {
  console.log('\n📋 检查TypeScript配置:');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    console.log('❌ tsconfig.json: 不存在');
    return false;
  }
  
  console.log('✅ tsconfig.json: 存在');
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // 检查关键配置
    const compilerOptions = tsconfig.compilerOptions || {};
    
    console.log(`✅ target: ${compilerOptions.target || 'default'}`);
    console.log(`✅ module: ${compilerOptions.module || 'default'}`);
    console.log(`✅ moduleResolution: ${compilerOptions.moduleResolution || 'default'}`);
    
    return true;
  } catch (error) {
    console.log('❌ tsconfig.json: 格式错误');
    return false;
  }
}

// 检查依赖包
function checkDependencies() {
  console.log('\n📋 检查依赖包:');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json: 不存在');
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDeps = [
      'next',
      'react',
      'typescript'
    ];
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    let allPresent = true;
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep}: 未安装`);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    console.log('❌ package.json: 格式错误');
    return false;
  }
}

// 检查Vercel配置
function checkVercelConfiguration() {
  console.log('\n📋 检查Vercel配置:');
  
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  if (!fs.existsSync(vercelJsonPath)) {
    console.log('❌ vercel.json: 不存在');
    return false;
  }
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    
    // 检查函数配置
    if (!vercelConfig.functions) {
      console.log('❌ functions配置: 缺失');
      return false;
    }
    
    console.log('✅ functions配置: 存在');
    
    // 检查Edge Functions
    const edgeFunctions = Object.entries(vercelConfig.functions)
      .filter(([_, config]) => config.runtime === 'edge');
    
    console.log(`✅ Edge Functions: ${edgeFunctions.length}个`);
    edgeFunctions.forEach(([path, config]) => {
      console.log(`   - ${path} (regions: ${config.regions?.join(', ') || 'default'})`);
    });
    
    // 检查Serverless Functions
    const serverlessFunctions = Object.entries(vercelConfig.functions)
      .filter(([_, config]) => config.runtime !== 'edge');
    
    console.log(`✅ Serverless Functions: ${serverlessFunctions.length}个`);
    serverlessFunctions.forEach(([path, config]) => {
      console.log(`   - ${path} (timeout: ${config.maxDuration || 10}s)`);
    });
    
    // 检查环境变量配置
    if (vercelConfig.env) {
      console.log('✅ 环境变量配置: 存在');
      const envVars = Object.keys(vercelConfig.env);
      console.log(`   配置的变量: ${envVars.join(', ')}`);
    } else {
      console.log('⚠️  环境变量配置: 缺失');
    }
    
    return true;
  } catch (error) {
    console.log('❌ vercel.json: 格式错误', error.message);
    return false;
  }
}

// 检查API端点语法
function checkApiSyntax() {
  console.log('\n📋 检查API端点语法:');
  
  const apiFiles = [
    'app/api/chat-stream/route.ts',
    'app/api/module1-keywords/route.ts',
    'app/api/module2-plan-stream/route.ts', 
    'app/api/module3-banner/route.ts'
  ];
  
  let allValid = true;
  
  apiFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 基本语法检查
      const checks = [
        { name: 'export POST', pattern: /export\s+async\s+function\s+POST/ },
        { name: 'NextRequest import', pattern: /import.*NextRequest.*from.*next\/server/ },
        { name: 'runtime配置', pattern: /export\s+const\s+runtime\s*=/ }
      ];
      
      console.log(`📄 ${filePath}:`);
      
      checks.forEach(check => {
        if (check.pattern.test(content)) {
          console.log(`   ✅ ${check.name}`);
        } else if (check.name === 'runtime配置') {
          // runtime配置是可选的（Serverless Function不需要）
          console.log(`   ⚠️  ${check.name} (可选)`);
        } else {
          console.log(`   ❌ ${check.name}`);
          allValid = false;
        }
      });
    } else {
      console.log(`❌ ${filePath}: 文件不存在`);
      allValid = false;
    }
  });
  
  return allValid;
}

// 检查环境变量模板
function checkEnvironmentTemplate() {
  console.log('\n📋 检查环境变量模板:');
  
  const envExamplePath = path.join(process.cwd(), '.env.example');
  if (!fs.existsSync(envExamplePath)) {
    console.log('❌ .env.example: 不存在');
    return false;
  }
  
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  const requiredVars = [
    'SILICONFLOW_API_KEY',
    'OPENAI_API_KEY'
  ];
  
  const optionalVars = [
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_EDGE_REGION',
    'API_TIMEOUT',
    'STREAM_TIMEOUT'
  ];
  
  console.log('必需的环境变量:');
  requiredVars.forEach(varName => {
    if (content.includes(varName)) {
      console.log(`   ✅ ${varName}`);
    } else {
      console.log(`   ❌ ${varName}`);
    }
  });
  
  console.log('可选的环境变量:');
  optionalVars.forEach(varName => {
    if (content.includes(varName)) {
      console.log(`   ✅ ${varName}`);
    } else {
      console.log(`   ⚠️  ${varName}`);
    }
  });
  
  return requiredVars.every(varName => content.includes(varName));
}

// 生成部署清单
function generateDeploymentChecklist() {
  console.log('\n📋 部署清单:');
  
  const checklist = [
    '1. 确保所有环境变量在Vercel项目中已配置',
    '2. 验证API密钥的有效性',
    '3. 检查Edge Function的区域设置',
    '4. 确认Serverless Function的超时配置',
    '5. 测试所有API端点的功能',
    '6. 验证流式响应的正常工作',
    '7. 检查CORS配置是否正确',
    '8. 确认错误处理和日志记录'
  ];
  
  checklist.forEach(item => {
    console.log(`   ${item}`);
  });
}

// 主函数
function main() {
  const results = {
    structure: checkProjectStructure(),
    typescript: checkTypeScript(),
    dependencies: checkDependencies(),
    vercel: checkVercelConfiguration(),
    syntax: checkApiSyntax(),
    environment: checkEnvironmentTemplate()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 检查结果汇总:');
  
  Object.entries(results).forEach(([key, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败';
    const name = {
      structure: '项目结构',
      typescript: 'TypeScript配置',
      dependencies: '依赖包',
      vercel: 'Vercel配置',
      syntax: 'API语法',
      environment: '环境变量模板'
    }[key];
    
    console.log(`${name}: ${status}`);
  });
  
  const overall = Object.values(results).every(result => result);
  console.log(`\n🎯 整体状态: ${overall ? '✅ 准备就绪' : '❌ 需要修复'}`);
  
  if (overall) {
    console.log('\n🎉 项目已准备好部署！');
    generateDeploymentChecklist();
  } else {
    console.log('\n⚠️  请修复上述问题后再进行部署。');
  }
  
  return overall;
}

// 如果直接运行此脚本
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };