#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 开发服务器日志监控器');
console.log('=====================================');

// 获取最新的日志文件
function getLatestLogFile() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        console.log('❌ 日志目录不存在');
        return null;
    }

    const files = fs.readdirSync(logsDir)
        .filter(file => file.startsWith('dev-server-') && file.endsWith('.log'))
        .map(file => ({
            name: file,
            path: path.join(logsDir, file),
            mtime: fs.statSync(path.join(logsDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

    return files.length > 0 ? files[0] : null;
}

// 分析日志内容
function analyzeLog(content) {
    const lines = content.split('\n');
    const analysis = {
        errors: [],
        warnings: [],
        apiCalls: [],
        performance: [],
        total_lines: lines.length
    };

    lines.forEach((line, index) => {
        const lineNum = index + 1;

        // 检测错误
        if (line.includes('Error') || line.includes('error') || line.includes('ERROR')) {
            analysis.errors.push({ line: lineNum, content: line.trim() });
        }

        // 检测警告
        if (line.includes('Warning') || line.includes('warning') || line.includes('WARN')) {
            analysis.warnings.push({ line: lineNum, content: line.trim() });
        }

        // 检测API调用
        if (line.includes('POST') || line.includes('GET') || line.includes('/api/')) {
            analysis.apiCalls.push({ line: lineNum, content: line.trim() });
        }

        // 检测性能信息
        if (line.includes('Ready in') || line.includes('Compiled') || line.includes('ms')) {
            analysis.performance.push({ line: lineNum, content: line.trim() });
        }
    });

    return analysis;
}

// 显示分析结果
function displayAnalysis(analysis) {
    console.log('\n📊 日志分析结果:');
    console.log(`总行数: ${analysis.total_lines}`);

    if (analysis.errors.length > 0) {
        console.log(`\n❌ 错误 (${analysis.errors.length}个):`);
        analysis.errors.slice(-5).forEach(error => {
            console.log(`  行${error.line}: ${error.content}`);
        });
    }

    if (analysis.warnings.length > 0) {
        console.log(`\n⚠️  警告 (${analysis.warnings.length}个):`);
        analysis.warnings.slice(-3).forEach(warning => {
            console.log(`  行${warning.line}: ${warning.content}`);
        });
    }

    if (analysis.apiCalls.length > 0) {
        console.log(`\n🌐 API调用 (${analysis.apiCalls.length}个):`);
        analysis.apiCalls.slice(-3).forEach(call => {
            console.log(`  行${call.line}: ${call.content}`);
        });
    }

    if (analysis.performance.length > 0) {
        console.log(`\n⚡ 性能信息 (${analysis.performance.length}个):`);
        analysis.performance.slice(-3).forEach(perf => {
            console.log(`  行${perf.line}: ${perf.content}`);
        });
    }
}

// 主函数
function main() {
    const latestLog = getLatestLogFile();

    if (!latestLog) {
        console.log('❌ 没有找到日志文件');
        return;
    }

    console.log(`📄 监控文件: ${latestLog.name}`);
    console.log(`📅 创建时间: ${latestLog.mtime.toLocaleString()}`);

    // 读取并分析当前日志
    const content = fs.readFileSync(latestLog.path, 'utf8');
    const analysis = analyzeLog(content);
    displayAnalysis(analysis);

    // 实时监控新日志
    console.log('\n👀 开始实时监控...');
    console.log('按 Ctrl+C 退出监控');

    const tail = spawn('tail', ['-f', latestLog.path]);

    tail.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] ${line}`);

            // 实时分析重要信息
            if (line.includes('Error') || line.includes('error')) {
                console.log('🚨 检测到错误!');
            }
            if (line.includes('/api/')) {
                console.log('🌐 API调用');
            }
        });
    });

    tail.stderr.on('data', (data) => {
        console.error(`监控错误: ${data}`);
    });

    process.on('SIGINT', () => {
        console.log('\n👋 停止监控');
        tail.kill();
        process.exit(0);
    });
}

main();