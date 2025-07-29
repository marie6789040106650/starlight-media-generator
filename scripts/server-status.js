#!/usr/bin/env node

const http = require('http');

console.log('🔍 服务器状态检查');
console.log('=====================================');

// 检查服务器是否响应
function checkServer(port = 3000) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/health/storage`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({
                        status: 'running',
                        port,
                        health: parsed,
                        statusCode: res.statusCode
                    });
                } catch (e) {
                    resolve({
                        status: 'error',
                        port,
                        error: 'Invalid JSON response',
                        statusCode: res.statusCode
                    });
                }
            });
        });
        
        req.on('error', () => {
            resolve({
                status: 'offline',
                port,
                error: 'Connection refused'
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                status: 'timeout',
                port,
                error: 'Request timeout'
            });
        });
    });
}

// 检查多个端口
async function checkMultiplePorts() {
    const ports = [3000, 3001, 3002];
    const results = await Promise.all(ports.map(port => checkServer(port)));
    
    console.log('🌐 端口检查结果:');
    results.forEach(result => {
        const icon = result.status === 'running' ? '✅' : 
                    result.status === 'offline' ? '❌' : '⚠️';
        console.log(`  ${icon} 端口 ${result.port}: ${result.status}`);
        
        if (result.health) {
            console.log(`     - 存储状态: ${result.health.data.health.storage}`);
            console.log(`     - 环境: ${result.health.data.environment}`);
            console.log(`     - 时间戳: ${result.health.data.timestamp}`);
        }
        
        if (result.error) {
            console.log(`     - 错误: ${result.error}`);
        }
    });
    
    return results.find(r => r.status === 'running');
}

// 检查AI服务配置
async function checkAIServices(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/api/config/ai-services`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve({ error: 'Invalid JSON response' });
                }
            });
        });
        
        req.on('error', () => {
            resolve({ error: 'Connection failed' });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({ error: 'Request timeout' });
        });
    });
}

// 主函数
async function main() {
    const runningServer = await checkMultiplePorts();
    
    if (!runningServer) {
        console.log('\n❌ 没有发现运行中的开发服务器');
        console.log('💡 使用以下命令启动服务器:');
        console.log('   pnpm run dev');
        return;
    }
    
    console.log(`\n🎯 活跃服务器: localhost:${runningServer.port}`);
    
    // 检查AI服务配置
    console.log('\n🤖 AI服务配置检查:');
    const aiConfig = await checkAIServices(runningServer.port);
    
    if (aiConfig.error) {
        console.log(`❌ AI服务检查失败: ${aiConfig.error}`);
    } else if (aiConfig.success) {
        const stats = aiConfig.data.stats;
        console.log(`✅ 总服务数: ${stats.totalServices}`);
        console.log(`✅ 启用服务数: ${stats.enabledServices}`);
        console.log(`✅ 可用服务: ${stats.availableServices.length > 0 ? stats.availableServices.join(', ') : '无'}`);
        
        // 显示各服务状态
        const services = aiConfig.data.config.services;
        Object.entries(services).forEach(([name, config]) => {
            const icon = config.enabled ? '🟢' : '🔴';
            const keyStatus = config.hasApiKey ? '🔑' : '❌';
            console.log(`  ${icon} ${name}: ${config.notes} ${keyStatus}`);
        });
    }
    
    // 显示有用的命令
    console.log('\n🛠️  有用的命令:');
    console.log(`  curl http://localhost:${runningServer.port}/api/health/storage`);
    console.log(`  curl http://localhost:${runningServer.port}/api/config/ai-services`);
    console.log('  pnpm run logs:monitor  # 实时监控日志');
    console.log('  pnpm run logs:analyze  # 分析日志');
    
    console.log('\n✅ 服务器状态检查完成');
}

main().catch(console.error);