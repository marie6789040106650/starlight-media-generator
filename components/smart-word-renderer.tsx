"use client"

import React, { useState, useEffect, useRef } from "react"
import { FormData } from "@/lib/types"
import { WordStyleRenderer } from "./word-style-renderer"
import { WordStyleRendererWithPagination } from "./word-style-renderer-with-pagination"

interface SmartWordRendererProps {
  content: string
  formData: FormData
  bannerImage?: string | null
  isGeneratingBanner?: boolean
  isStreaming?: boolean
}

interface CachedContent {
  content: string
  formData: FormData
  bannerImage?: string | null
  timestamp: number
  paginationReady: boolean
}

export const SmartWordRenderer: React.FC<SmartWordRendererProps> = ({
  content,
  formData,
  bannerImage,
  isGeneratingBanner,
  isStreaming = false
}) => {
  const [useAdvancedRenderer, setUseAdvancedRenderer] = useState(false)
  const [contentStable, setContentStable] = useState(false)
  const [paginationReady, setPaginationReady] = useState(false)
  const [cachedContent, setCachedContent] = useState<CachedContent | null>(null)
  const [contentUpdated, setContentUpdated] = useState(false) // 新增：跟踪内容是否已更新
  const contentStabilityTimer = useRef<NodeJS.Timeout | null>(null)
  const paginationTimer = useRef<NodeJS.Timeout | null>(null)
  const previousContentRef = useRef<string>('')
  const previousBannerRef = useRef<string | null | undefined>(undefined)

  // 从浏览器缓存中加载内容
  useEffect(() => {
    const loadCachedContent = () => {
      try {
        const cached = localStorage.getItem('word-renderer-cache')
        if (cached) {
          const parsedCache: CachedContent = JSON.parse(cached)
          // 检查缓存是否还有效（24小时内）
          const now = Date.now()
          if (now - parsedCache.timestamp < 24 * 60 * 60 * 1000) {
            setCachedContent(parsedCache)
            if (parsedCache.paginationReady) {
              setPaginationReady(true)
            }
          } else {
            // 清除过期缓存
            localStorage.removeItem('word-renderer-cache')
          }
        }
      } catch (error) {
        console.warn('Failed to load cached content:', error)
        localStorage.removeItem('word-renderer-cache')
      }
    }

    loadCachedContent()
  }, [])

  // 检测内容是否稳定和是否有更新
  useEffect(() => {
    // 检测内容或Banner是否发生变化
    if (content !== previousContentRef.current || bannerImage !== previousBannerRef.current) {
      if (previousContentRef.current !== '' || previousBannerRef.current !== undefined) {
        // 不是初始加载，说明内容已更新
        setContentUpdated(true)
        console.log('Content or banner updated, pagination may need refresh')
      }
      previousContentRef.current = content
      previousBannerRef.current = bannerImage
    }

    if (content && isStreaming) {
      // 清除之前的计时器
      if (contentStabilityTimer.current) {
        clearTimeout(contentStabilityTimer.current)
      }

      // 重置稳定状态
      setContentStable(false)
      setPaginationReady(false)

      // 设置新的稳定检测计时器
      contentStabilityTimer.current = setTimeout(() => {
        setContentStable(true)
        console.log('Content is now stable, preparing for pagination...')
      }, 2000) // 2秒后认为内容稳定

      return () => {
        if (contentStabilityTimer.current) {
          clearTimeout(contentStabilityTimer.current)
        }
      }
    } else if (content && !isStreaming) {
      // 如果不是流式模式，立即标记为稳定
      setContentStable(true)
    }
  }, [content, isStreaming, bannerImage])

  // 当内容稳定后，准备分页数据
  useEffect(() => {
    if (contentStable && content && !paginationReady) {
      console.log('Content stable, starting pagination preparation...')
      
      // 延迟1秒后开始准备分页，给用户一个缓冲时间
      if (paginationTimer.current) {
        clearTimeout(paginationTimer.current)
      }

      paginationTimer.current = setTimeout(() => {
        // 缓存当前内容
        const cacheData: CachedContent = {
          content,
          formData,
          bannerImage: bannerImage || undefined,
          timestamp: Date.now(),
          paginationReady: true
        }

        try {
          localStorage.setItem('word-renderer-cache', JSON.stringify(cacheData))
          setCachedContent(cacheData)
          setPaginationReady(true)
          console.log('Pagination data cached and ready')
        } catch (error) {
          console.warn('Failed to cache content:', error)
          // 即使缓存失败，也标记分页为可用
          setPaginationReady(true)
        }
      }, 1000)

      return () => {
        if (paginationTimer.current) {
          clearTimeout(paginationTimer.current)
        }
      }
    }
  }, [contentStable, content, formData, bannerImage, paginationReady])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (contentStabilityTimer.current) {
        clearTimeout(contentStabilityTimer.current)
      }
      if (paginationTimer.current) {
        clearTimeout(paginationTimer.current)
      }
    }
  }, [])

  // 获取用于渲染的内容（优先使用缓存）
  const getRenderContent = () => {
    if (useAdvancedRenderer && cachedContent && cachedContent.paginationReady) {
      return {
        content: cachedContent.content,
        formData: cachedContent.formData,
        bannerImage: cachedContent.bannerImage
      }
    }
    return { content, formData, bannerImage }
  }

  // 处理模式切换
  const handleModeSwitch = (usePagination: boolean) => {
    if (usePagination && !paginationReady) {
      // 如果分页还没准备好，显示提示
      alert('分页模式正在准备中，请稍候...')
      return
    }
    setUseAdvancedRenderer(usePagination)
  }

  // 清除缓存
  const clearCache = () => {
    try {
      localStorage.removeItem('word-renderer-cache')
      setCachedContent(null)
      setPaginationReady(false)
      setContentStable(false)
      setContentUpdated(false) // 清除缓存时也清除更新提示
      console.log('Cache cleared successfully')
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  // 处理分页模式切换
  const handlePaginationSwitch = () => {
    if (!paginationReady) {
      alert('分页模式正在准备中，请稍候...')
      return
    }
    setUseAdvancedRenderer(true)
    setContentUpdated(false) // 重新生成分页后清除更新提示
  }

  return (
    <div>
      {/* 渲染器切换控制 */}
      {content && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '11pt',
              color: '#000000',
              fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
            }}>
              显示模式：
            </span>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleModeSwitch(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: !useAdvancedRenderer ? '#3b82f6' : '#ffffff',
                  color: !useAdvancedRenderer ? '#ffffff' : '#000000',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10pt',
                  fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
                }}
              >
                📄 流式模式
              </button>
              
              <button
                onClick={handlePaginationSwitch}
                disabled={!paginationReady}
                style={{
                  padding: '6px 12px',
                  backgroundColor: useAdvancedRenderer ? '#3b82f6' : '#ffffff',
                  color: useAdvancedRenderer ? '#ffffff' : (!paginationReady ? '#999999' : '#000000'),
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: paginationReady ? 'pointer' : 'not-allowed',
                  fontSize: '10pt',
                  fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
                  opacity: paginationReady ? 1 : 0.6
                }}
              >
                📑 {contentUpdated && cachedContent ? '重新生成分页' : '分页模式'} {!paginationReady && '(准备中...)'}
              </button>
            </div>

            {/* 状态指示器 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isStreaming && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  color: '#856404'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    border: '1px solid #ffeaa7',
                    borderTop: '1px solid #856404',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  实时生成中
                </div>
              )}

              {contentStable && !paginationReady && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  backgroundColor: '#e1f5fe',
                  border: '1px solid #b3e5fc',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  color: '#0277bd'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    border: '1px solid #b3e5fc',
                    borderTop: '1px solid #0277bd',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  准备分页中
                </div>
              )}

              {paginationReady && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  color: '#155724'
                }}>
                  ✅ 分页就绪
                </div>
              )}

              {/* 清除缓存按钮 */}
              {cachedContent && (
                <button
                  onClick={clearCache}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#fff',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '9pt',
                    fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
                  }}
                  title="清除缓存，重新生成分页数据"
                >
                  🗑️ 清除缓存
                </button>
              )}
            </div>
          </div>

          <div style={{
            fontSize: '9pt',
            color: '#666666',
            margin: '8px 0 0 0',
            fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
            textAlign: 'left'
          }}>
            <p style={{ margin: '4px 0' }}>
              {useAdvancedRenderer 
                ? '📑 分页模式：真实A4页面效果，每页独立渲染，适合最终预览和打印'
                : '📄 流式模式：连续滚动显示，适合实时查看生成过程'
              }
            </p>
            {cachedContent && (
              <p style={{ margin: '4px 0', color: '#28a745' }}>
                💾 内容已缓存，切换模式无需重新生成
              </p>
            )}
            {!paginationReady && contentStable && (
              <p style={{ margin: '4px 0', color: '#007bff' }}>
                ⏳ 正在为分页模式准备数据，请稍候...
              </p>
            )}
            {contentUpdated && cachedContent && (
              <div style={{ 
                margin: '4px 0', 
                color: '#ff6b35', 
                backgroundColor: '#fff3e0', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                border: '1px solid #ffcc80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>
                  ⚠️ 内容已更新，如需更新分页模式，请先点击"清除缓存"，然后重新生成分页
                </span>
                <button 
                  onClick={() => setContentUpdated(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ff6b35',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: '8px',
                    padding: '0 4px'
                  }}
                  title="关闭提示"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 渲染器选择 */}
      {(() => {
        const renderData = getRenderContent()
        
        if (useAdvancedRenderer) {
          return (
            <WordStyleRendererWithPagination
              content={renderData.content}
              formData={renderData.formData}
              bannerImage={renderData.bannerImage}
              isGeneratingBanner={isGeneratingBanner}
            />
          )
        } else {
          return (
            <WordStyleRenderer
              content={renderData.content}
              formData={renderData.formData}
              bannerImage={renderData.bannerImage}
              isGeneratingBanner={isGeneratingBanner}
            />
          )
        }
      })()}

      {/* CSS动画 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}