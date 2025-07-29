// 验证硅基流动模型可用性的脚本
// 使用方法: node scripts/verify-models.js

const CHAT_MODELS = [
  'deepseek-ai/DeepSeek-V3',
  'moonshotai/Kimi-K2-Instruct',
  'Pro/moonshotai/Kimi-K2-Instruct',
  'THUDM/GLM-4.1V-9B-Thinking',
  'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B'
];

const IMAGE_MODELS = [
  'black-forest-labs/FLUX.1-schnell',
  'black-forest-labs/FLUX.1-dev',
  'stabilityai/stable-diffusion-3-5-large'
];

async function verifyModel(modelId, type = 'chat') {
  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    console.log('❌ 请设置 SILICONFLOW_API_KEY 环境变量');
    return false;
  }

  const endpoint = type === 'chat'
    ? 'https://api.siliconflow.cn/v1/chat/completions'
    : 'https://api.siliconflow.cn/v1/images/generations';

  const body = type === 'chat'
    ? {
      model: modelId,
      messages: [{ role: 'user', content: '你好' }],
      max_tokens: 10
    }
    : {
      model: modelId,
      prompt: '一只可爱的小猫',
      n: 1,
      size: '512x512'
    };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      console.log(`✅ ${modelId} - 可用`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${modelId} - 不可用: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${modelId} - 错误: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 验证文本对话模型...');
  for (const model of CHAT_MODELS) {
    await verifyModel(model, 'chat');
  }

  console.log('\n🔍 验证图片生成模型...');
  for (const model of IMAGE_MODELS) {
    await verifyModel(model, 'image');
  }
}

main().catch(console.error);