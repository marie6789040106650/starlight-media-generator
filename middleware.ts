import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substr(2, 9)
  
  // 记录请求开始
  console.log(`[${new Date().toISOString()}] [${requestId}] ${request.method} ${request.url}`, {
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer'),
    clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  })

  // 继续处理请求
  const response = NextResponse.next()
  
  // 添加请求ID到响应头
  response.headers.set('x-request-id', requestId)
  
  // 记录响应（这里只能记录开始处理的时间，实际响应时间需要在各个API中记录）
  const duration = Date.now() - startTime
  console.log(`[${new Date().toISOString()}] [${requestId}] 请求处理开始完成`, {
    duration: `${duration}ms`,
    status: response.status
  })

  return response
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
    // 匹配主要页面
    '/',
    '/result'
  ]
}