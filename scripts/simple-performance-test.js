#!/usr/bin/env node

/**
 * 简单性能测试脚本
 * 测试PDF生成的缓存效果
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

// 配置
const CONFIG = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  OUTPUT_DIR: './test-output'
}

// 测试数据
const TEST_DATA = {
  content: `# 性能测试文档

## 测试目的
验证PDF生成缓存机制的性能改善效果。

## 测试内容
- 第一次请求：完整生成流程
- 第二次请求：缓存命中测试

## 预期结果
第二次请求应该显著快于第一次请求。

---
测试时间: ${new Date().toLocaleString('zh-CN')}`,
  storeName: '性能测试店铺',
  filename: 'performance-test.pdf'
}

// 日志函数
function logInfo(message) {
  console.log(`ℹ️  ${message}`)
}

function logSuccess(message) {
  console.log(`✅ ${message}`)
}

function logError(message) {
  console.log(`❌ ${message}`)
}

// 确保输出目录存在
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true })
  }
}

// 生成PDF请求
function generatePDF(testName) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const postData = JSON.stringify(TEST_DATA)
    const url = new URL('/api/generate-pdf', CONFIG.BASE_URL)

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: CONFIG.TIMEOUT
    }

    const req = http.request(options, (res) => {
      let data = Buffer.alloc(0)

      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk])
      })

      res.on('end', () => {
        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (res.statusCode === 200) {
          const contentType = res.headers['content-type']
          
          if (contentType && contentType.includes('application/pdf')) {
            // 保存PDF文件
            const filename = `${testName}-${Date.now()}.pdf`
            const filepath = path.join(CONFIG.OUTPUT_DIR, filename)
            fs.writeFileSync(filepath, data)
            
            resolve({
              success: true,
              responseTime,
              fileSize: data.length,
              filename: filepath
            })
          } else {
            resolve({
              success: false,
              responseTime,
              error: '响应不是PDF格式'
            })
          }
        } else {
          let errorMessage = `HTTP ${res.statusCode}`
          try {
            const errorData = JSON.parse(data.toString())
            errorMessage = errorData.error || errorMessage
          } catch (e) {
            errorMessage = data.toString().substring(0, 200)
          }
          
          resolve({
            success: false,
            responseTime,
            error: errorMessage
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('请求超时'))
    })

    req.write(postData)
    req.end()
  })
}

// 获取缓存状态
function getCacheStats() {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/pdf-cache-stats', CONFIG.BASE_URL)

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000
    }

    const req = http.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const stats = JSON.parse(data)
            resolve(stats)
          } catch (error) {
            reject(new Error('解析缓存状态失败'))
          }
        } else {
          reject(new Error(`获取缓存状态失败: HTTP ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('获取缓存状态超时'))
    })

    req.end()
  })
}

// 主测试函数
async function runPerformanceTest() {
  console.log('🚀 PDF性能测试开始')
  console.log('==================')
  
  try {
    ensureOutputDir()
    
    // 获取初始缓存状态
    logInfo('获取初始缓存状态...')
    let initialStats
    try {
      initialStats = await getCacheStats()
      logInfo(`初始缓存: ${initialStats.cache.totalFiles} 文件, 命中率: ${initialStats.cache.hitRate}%`)
    } catch (error) {
      logError(`获取缓存状态失败: ${error.message}`)
      initialStats = null
    }
    
    // 第一次请求（无缓存）
    logInfo('执行第一次PDF生成请求（建立缓存）...')
    const firstResult = await generatePDF('first-request')
    
    if (firstResult.success) {
      logSuccess(`第一次请求成功: ${firstResult.responseTime}ms, ${firstResult.fileSize} bytes`)
    } else {
      logError(`第一次请求失败: ${firstResult.error}`)
      return
    }
    
    // 等待一秒确保缓存生效
    logInfo('等待缓存生效...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 第二次请求（缓存命中）
    logInfo('执行第二次PDF生成请求（测试缓存命中）...')
    const secondResult = await generatePDF('second-request')
    
    if (secondResult.success) {
      logSuccess(`第二次请求成功: ${secondResult.responseTime}ms, ${secondResult.fileSize} bytes`)
    } else {
      logError(`第二次请求失败: ${secondResult.error}`)
      return
    }
    
    // 获取最终缓存状态
    let finalStats
    try {
      finalStats = await getCacheStats()
      logInfo(`最终缓存: ${finalStats.cache.totalFiles} 文件, 命中率: ${finalStats.cache.hitRate}%`)
    } catch (error) {
      logError(`获取最终缓存状态失败: ${error.message}`)
      finalStats = null
    }
    
    // 性能分析
    console.log('\n📊 性能分析结果')
    console.log('================')
    
    const timeSaved = firstResult.responseTime - secondResult.responseTime
    const improvementPercent = ((timeSaved / firstResult.responseTime) * 100).toFixed(1)
    
    console.log(`第一次请求时间: ${firstResult.responseTime}ms`)
    console.log(`第二次请求时间: ${secondResult.responseTime}ms`)
    console.log(`时间节省: ${timeSaved}ms`)
    console.log(`性能改善: ${improvementPercent}%`)
    
    if (finalStats && initialStats) {
      const cacheGrowth = finalStats.cache.totalFiles - initialStats.cache.totalFiles
      console.log(`缓存文件增长: ${cacheGrowth} 个`)
      console.log(`缓存命中率变化: ${initialStats.cache.hitRate}% → ${finalStats.cache.hitRate}%`)
    }
    
    // 结论
    console.log('\n🎯 测试结论')
    console.log('============')
    
    if (timeSaved > 0) {
      logSuccess(`缓存机制有效！性能提升 ${improvementPercent}%`)
      if (parseFloat(improvementPercent) > 30) {
        logSuccess('性能改善显著，缓存机制工作良好')
      } else {
        console.log('⚠️  性能改善较小，可能需要进一步优化')
      }
    } else {
      console.log('⚠️  第二次请求未显示性能改善，缓存可能未生效')
    }
    
    console.log(`\n📁 生成的测试文件:`)
    console.log(`- ${firstResult.filename}`)
    console.log(`- ${secondResult.filename}`)
    
    logSuccess('性能测试完成！')
    
  } catch (error) {
    logError(`测试过程中出现错误: ${error.message}`)
    console.error(error)
  }
}

// 运行测试
if (require.main === module) {
  runPerformanceTest().catch(console.error)
}

module.exports = { runPerformanceTest, generatePDF, getCacheStats }