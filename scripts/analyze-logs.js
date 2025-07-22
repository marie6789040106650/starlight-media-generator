#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 开发服务器日志分析报告');
console.log('=====================================');

// 获取所有日志文件
function getAllLogFiles() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        console.log('❌ 日志目录不存在');
        return [];
    }
    
    return fs.readdirSync(logsDir)
        .filter(file => file.startsWith('dev-server-') && file.endsWith('.log'))
        .map(file => ({
            name: file,
            path: path.join(logsDir, file),
            mtime: fs.statSync(path.join(logsDir, file)).mtime,
            size: fs.statSync(path.join(logsDir, file)).size
        }))
        .sort((a, b) => b.mtime - a.mtime);
}

// 深度分析日志内容
function deepAnalyzeLog(content, filename) {
    const lines = content.split('\n');
    const analysis = {
        filename,
        total_lines: lines.length,
        errors: [],
        warnings: [],
        apiCalls: [],
        performance: [],
        compilations: [],
        serverEvents: [],
        timestamps: []
    };
    
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        const trimmedLine = line.trim();
        
        if (!trimmedLine) return;
        
        // 提取时间戳
        const timeMatch = line.match(/\[(.*?)\]/);
        if (timeMatch) {
            analysis.timestamps.push(timeMatch[1]);
        }
        
        // 检测错误
        if (/error|Error|ERROR|failed|Failed|FAILED/i.test(line)) {
            analysis.errors.push({ 
                line: lineNum, 
                content: trimmedLine,
                type: 'error'
            });
        }
        
        // 检测警告
        if (/warning|Warning|WARN|⚠/i.test(line)) {
            analysis.warnings.push({ 
                line: lineNum, 
                content: trimmedLine,
                type: 'warning'
            });
        }
        
        // 检测API调用
        if (/POST|GET|PUT|DELETE|\/api\//i.test(line)) {
            const methodMatch = line.match(/(POST|GET|PUT|DELETE)/i);
            const pathMatch = line.match(/\/api\/[^\s]*/);
            analysis.apiCalls.push({ 
                line: lineNum, 
                content: trimmedLine,
                method: methodMatch ? methodMatch[1] : 'unknown',
                path: pathMatch ? pathMatch[0] : 'unknown'
            });
        }
        
        // 检测性能信息
        if (/Ready in|Compiled|ms|seconds/i.test(line)) {
            const timeMatch = line.match(/(\d+(?:\.\d+)?)\s*(ms|seconds?)/i);
            analysis.performance.push({ 
                line: lineNum, 
                content: trimmedLine,
                duration: timeMatch ? `${timeMatch[1]}${timeMatch[2]}` : 'unknown'
            });
        }
        
        // 检测编译信息
        if (/Compiled|Compiling|webpack|build/i.test(line)) {
            analysis.compilations.push({ 
                line: lineNum, 
                content: trimmedLine
            });
        }
        
        // 检测服务器事件
        if (/Starting|Ready|Local:|Network:|Port/i.test(line)) {
            analysis.serverEvents.push({ 
                line: lineNum, 
                content: trimmedLine
            });
        }
    });
    
    return analysis;
}

// 生成统计报告
function generateReport(analyses) {
    console.log(`\n📈 总体统计:`);
    console.log(`日志文件数量: ${analyses.length}`);
    
    const totalLines = analyses.reduce((sum, a) => sum + a.total_lines, 0);
    const totalErrors = analyses.reduce((sum, a) => sum + a.errors.length, 0);
    const totalWarnings = analyses.reduce((sum, a) => sum + a.warnings.length, 0);
    const totalApiCalls = analyses.reduce((sum, a) => sum + a.apiCalls.length, 0);
    
    console.log(`总日志行数: ${totalLines}`);
    console.log(`总错误数: ${totalErrors}`);
    console.log(`总警告数: ${totalWarnings}`);
    console.log(`总API调用数: ${totalApiCalls}`);
    
    // 最新日志详细分析
    if (analyses.length > 0) {
        const latest = analyses[0];
        console.log(`\n📄 最新日志分析 (${latest.filename}):`);
        
        if (latest.serverEvents.length > 0) {
            console.log(`\n🚀 服务器事件 (${latest.serverEvents.length}个):`);
            latest.serverEvents.slice(-3).forEach(event => {
                console.log(`  行${event.line}: ${event.content}`);
            });
        }
        
        if (latest.errors.length > 0) {
            console.log(`\n❌ 错误 (${latest.errors.length}个):`);
            latest.errors.slice(-3).forEach(error => {
                console.log(`  行${error.line}: ${error.content}`);
            });
        }
        
        if (latest.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${latest.warnings.length}个):`);
            latest.warnings.slice(-3).forEach(warning => {
                console.log(`  行${warning.line}: ${warning.content}`);
            });
        }
        
        if (latest.apiCalls.length > 0) {
            console.log(`\n🌐 API调用 (${latest.apiCalls.length}个):`);
            const apiStats = {};
            latest.apiCalls.forEach(call => {
                const key = `${call.method} ${call.path}`;
                apiStats[key] = (apiStats[key] || 0) + 1;
            });
            
            Object.entries(apiStats).forEach(([endpoint, count]) => {
                console.log(`  ${endpoint}: ${count}次`);
            });
        }
        
        if (latest.performance.length > 0) {
            console.log(`\n⚡ 性能信息 (${latest.performance.length}个):`);
            latest.performance.slice(-3).forEach(perf => {
                console.log(`  行${perf.line}: ${perf.content}`);
            });
        }
    }
    
    // 健康度评估
    console.log(`\n🏥 系统健康度评估:`);
    const errorRate = totalLines > 0 ? (totalErrors / totalLines * 100).toFixed(2) : 0;
    const warningRate = totalLines > 0 ? (totalWarnings / totalLines * 100).toFixed(2) : 0;
    
    console.log(`错误率: ${errorRate}%`);
    console.log(`警告率: ${warningRate}%`);
    
    if (errorRate < 1) {
        console.log('✅ 系统运行良好');
    } else if (errorRate < 5) {
        console.log('⚠️  系统有少量错误，需要关注');
    } else {
        console.log('🚨 系统错误较多，需要立即处理');
    }
}

// 保存分析结果
function saveAnalysisReport(analyses) {
    const reportPath = path.join(process.cwd(), 'logs', 'analysis-report.json');
    const report = {
        generated_at: new Date().toISOString(),
        summary: {
            total_files: analyses.length,
            total_lines: analyses.reduce((sum, a) => sum + a.total_lines, 0),
            total_errors: analyses.reduce((sum, a) => sum + a.errors.length, 0),
            total_warnings: analyses.reduce((sum, a) => sum + a.warnings.length, 0),
            total_api_calls: analyses.reduce((sum, a) => sum + a.apiCalls.length, 0)
        },
        files: analyses
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 分析报告已保存到: ${reportPath}`);
}

// 主函数
function main() {
    const logFiles = getAllLogFiles();
    
    if (logFiles.length === 0) {
        console.log('❌ 没有找到日志文件');
        return;
    }
    
    console.log(`找到 ${logFiles.length} 个日志文件`);
    
    const analyses = logFiles.map(file => {
        console.log(`分析: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        const content = fs.readFileSync(file.path, 'utf8');
        return deepAnalyzeLog(content, file.name);
    });
    
    generateReport(analyses);
    saveAnalysisReport(analyses);
    
    console.log(`\n🎯 使用以下命令继续监控:`);
    console.log(`  pnpm run logs:monitor  # 实时监控`);
    console.log(`  pnpm run logs:view     # 查看最新日志`);
    console.log(`  pnpm run logs:clean    # 清理旧日志`);
}

main();