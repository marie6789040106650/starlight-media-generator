#!/usr/bin/env node

/**
 * 本地 API 密钥配置助手
 * 帮助安全地配置本地开发环境的 API 密钥
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE = path.join(process.cwd(), '.env.local');

// API 服务配置
const API_SERVICES = {
  SILICONFLOW_API_KEY: {
    name: 'SiliconFlow',
    url: 'https://cloud.siliconflow.cn',
    required: true,
    description: '用于 AI 内容生成的核心服务'
  },
  OPENAI_API_KEY: {
    name: 'OpenAI',
    url: 'https://platform.openai.com/api-keys',
    required: false,
    description: '备用 AI 服务，支持 GPT 模型'
  },
  GOOGLE_API_KEY: {
    name: 'Google Gemini',
    url: 'https://makersuite.google.com/app/apikey',
    required: false,
    description: 'Google 的 AI 服务，有免费额度'
  },
  ANTHROPIC_API_KEY: {
    name: 'Anthropic Claude',
    url: 'https://console.anthropic.com/',
    required: false,
    description: 'Claude AI 服务'
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔐 本地 API 密钥配置助手');
  console.log('=====================================');
  console.log('✅ 此配置仅在本地生效，不会上传到 GitHub\n');

  // 读取现有配置
  let envContent = '';
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  }

  const envVars = {};
  
  // 解析现有环境变量
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2];
    }
  });

  console.log('📋 当前配置状态：');
  for (const [key, config] of Object.entries(API_SERVICES)) {
    const current = envVars[key] || '';
    const status = current && !current.includes('your_') && !current.includes('here') ? '✅ 已配置' : '❌ 未配置';
    const required = config.required ? '(必需)' : '(可选)';
    console.log(`  ${config.name} ${required}: ${status}`);
  }

  console.log('\n🛠️ 开始配置...\n');

  for (const [key, config] of Object.entries(API_SERVICES)) {
    const current = envVars[key] || '';
    const hasValidKey = current && !current.includes('your_') && !current.includes('here');
    
    console.log(`\n📝 配置 ${config.name} ${config.required ? '(必需)' : '(可选)'}`);
    console.log(`   描述: ${config.description}`);
    console.log(`   获取地址: ${config.url}`);
    
    if (hasValidKey) {
      console.log(`   当前: ${current.substring(0, 10)}...${current.substring(current.length - 4)}`);
      const keep = await question('   保持当前配置？(y/n): ');
      if (keep.toLowerCase() === 'y') {
        continue;
      }
    }

    const newKey = await question('   请输入 API 密钥 (留空跳过): ');
    if (newKey.trim()) {
      envVars[key] = newKey.trim();
      console.log('   ✅ 已保存');
    } else if (config.required) {
      console.log('   ⚠️  警告: 这是必需的密钥，跳过可能导致功能异常');
    }
  }

  // 生成新的 .env.local 文件
  const newEnvContent = `# 🔐 本地开发环境变量配置
# ⚠️ 此文件已被 .gitignore 忽略，不会上传到 GitHub
# ✅ 可以安全地在此文件中配置真实的 API 密钥
# 📅 最后更新: ${new Date().toLocaleString()}

# 🚀 SiliconFlow API密钥 (必需)
SILICONFLOW_API_KEY=${envVars.SILICONFLOW_API_KEY || ''}

# 🤖 备用 AI 服务密钥 (可选)
OPENAI_API_KEY=${envVars.OPENAI_API_KEY || ''}
ANTHROPIC_API_KEY=${envVars.ANTHROPIC_API_KEY || ''}
GOOGLE_API_KEY=${envVars.GOOGLE_API_KEY || ''}

# 🛠️ 环境配置
NODE_ENV=development

# 📝 说明：
# - 此文件受 .gitignore 保护，不会泄露到 GitHub
# - 配置后请重启开发服务器：pnpm dev
# - 如需重新配置，运行：pnpm run setup-keys
`;

  fs.writeFileSync(ENV_FILE, newEnvContent);
  
  console.log('\n🎉 配置完成！');
  console.log('📁 配置已保存到 .env.local');
  console.log('🔒 此文件不会上传到 GitHub');
  console.log('\n🚀 下一步：');
  console.log('   1. 重启开发服务器：pnpm dev');
  console.log('   2. 测试 AI 功能是否正常工作');
  console.log('\n💡 提示：');
  console.log('   - 如需重新配置：pnpm run setup-keys');
  console.log('   - 查看配置状态：pnpm run check-env');

  rl.close();
}

main().catch(console.error);