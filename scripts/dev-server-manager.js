#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开发服务器管理器');
console.log('=====================================');

const command = process.argv[2] || 'status';

// 获取当前时间戳
function getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

// 检查服务器进程
function checkServerProcess() {
    return new Promise((resolve) => {
        exec('ps aux | grep "next dev" | grep -v grep', (error, stdout) => {
            if (error || !stdout.trim()) {
                resolve(null);
            } else {
                const lines = stdout.trim().split('\n');
                const processes = lines.map(line => {
                    const parts = line.trim().split(/\s+/);
                    return {
                        pid: parts[1],
                        cpu: parts[2],
                        mem: parts[3],
                        command: parts.slice(10).join(' ')
                    };
                });
                resolve(processes);
            }
        });
    });
}

// 启动服务器
async function startServer() {
    console.log('🔍 检查现有服务器进程...');
    const processes = await checkServerProcess();
    
    if (processes && processes.length > 0) {
        console.log('⚠️  发现运行中的服务器进程:');
        processes.forEach(proc => {
            console.log(`  PID: ${proc.pid}, CPU: ${proc.cpu}%, MEM: ${proc.mem}%`);
        });
        
        console.log('🛑 正在关闭现有进程...');
        exec('pkill -f "next dev"', (error) => {
            if (error) {
                console.log('⚠️  关闭进程时出现警告，继续启动新服务器');
            } else {
                console.log('✅ 现有进程已关闭');
            }
            
            setTimeout(() => {
                launchNewServer();
            }, 2000);
        });
    } else {
        console.log('✅ 没有发现运行中的服务器');
        launchNewServer();
    }
}

// 启动新服务器
function launchNewServer() {
    console.log('🚀 启动新的开发服务器...');
    
    // 确保日志目录存在
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, `dev-server-${getTimestamp()}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    
    console.log(`📝 日志文件: ${logFile}`);
    
    const server = spawn('pnpm', ['dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
    });
    
    // 将输出重定向到日志文件
    server.stdout.pipe(logStream);
    server.stderr.pipe(logStream);
    
    // 同时显示在控制台
    server.stdout.on('data', (data) => {
        process.stdout.write(data);
    });
    
    server.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
    
    server.on('spawn', () => {
        console.log(`✅ 服务器已启动 (PID: ${server.pid})`);
        console.log('📊 使用以下命令监控:');
        console.log('  pnpm run server:status  # 检查状态');
        console.log('  pnpm run logs:monitor   # 实时监控');
        console.log('  pnpm run logs:analyze   # 分析日志');
        
        // 分离进程，让它在后台运行
        server.unref();
        process.exit(0);
    });
    
    server.on('error', (error) => {
        console.error('❌ 启动服务器失败:', error.message);
        logStream.end();
        process.exit(1);
    });
}

// 停止服务器
async function stopServer() {
    console.log('🛑 停止开发服务器...');
    const processes = await checkServerProcess();
    
    if (!processes || processes.length === 0) {
        console.log('✅ 没有发现运行中的服务器');
        return;
    }
    
    console.log('🔍 发现以下服务器进程:');
    processes.forEach(proc => {
        console.log(`  PID: ${proc.pid}, CPU: ${proc.cpu}%, MEM: ${proc.mem}%`);
    });
    
    exec('pkill -f "next dev"', (error) => {
        if (error) {
            console.log('❌ 停止服务器时出错:', error.message);
        } else {
            console.log('✅ 服务器已停止');
        }
    });
}

// 重启服务器
async function restartServer() {
    console.log('🔄 重启开发服务器...');
    await stopServer();
    setTimeout(() => {
        startServer();
    }, 3000);
}

// 显示状态
async function showStatus() {
    const processes = await checkServerProcess();
    
    if (!processes || processes.length === 0) {
        console.log('❌ 开发服务器未运行');
        console.log('💡 使用以下命令启动:');
        console.log('  pnpm run dev:start');
        return;
    }
    
    console.log('✅ 开发服务器正在运行:');
    processes.forEach(proc => {
        console.log(`  PID: ${proc.pid}`);
        console.log(`  CPU: ${proc.cpu}%`);
        console.log(`  内存: ${proc.mem}%`);
        console.log(`  命令: ${proc.command}`);
    });
    
    // 检查日志文件
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
        const logFiles = fs.readdirSync(logsDir)
            .filter(file => file.startsWith('dev-server-') && file.endsWith('.log'))
            .sort()
            .reverse();
        
        if (logFiles.length > 0) {
            console.log(`\n📝 最新日志文件: ${logFiles[0]}`);
            const logPath = path.join(logsDir, logFiles[0]);
            const stats = fs.statSync(logPath);
            console.log(`  大小: ${(stats.size / 1024).toFixed(2)} KB`);
            console.log(`  修改时间: ${stats.mtime.toLocaleString()}`);
        }
    }
}

// 显示帮助
function showHelp() {
    console.log('📖 使用方法:');
    console.log('  node scripts/dev-server-manager.js [命令]');
    console.log('');
    console.log('🎯 可用命令:');
    console.log('  start    - 启动开发服务器');
    console.log('  stop     - 停止开发服务器');
    console.log('  restart  - 重启开发服务器');
    console.log('  status   - 显示服务器状态 (默认)');
    console.log('  help     - 显示此帮助信息');
    console.log('');
    console.log('📊 相关命令:');
    console.log('  pnpm run server:status  - 检查服务器和API状态');
    console.log('  pnpm run logs:monitor   - 实时监控日志');
    console.log('  pnpm run logs:analyze   - 分析日志文件');
}

// 主函数
async function main() {
    switch (command) {
        case 'start':
            await startServer();
            break;
        case 'stop':
            await stopServer();
            break;
        case 'restart':
            await restartServer();
            break;
        case 'status':
            await showStatus();
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            console.log(`❌ 未知命令: ${command}`);
            showHelp();
            process.exit(1);
    }
}

main().catch(console.error);