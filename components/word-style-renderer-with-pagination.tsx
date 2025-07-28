"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
import { FormData } from "@/lib/types"

// 水印配置接口
interface WatermarkConfig {
  enabled: boolean
  text: string
  opacity: number
  fontSize: number
  rotation: number
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  repeat: 'none' | 'diagonal' | 'grid'
  color: 'gray' | 'red' | 'blue' | 'black'
}

interface WordStyleRendererWithPaginationProps {
  content: string
  formData: FormData
  bannerImage?: string | null
  isGeneratingBanner?: boolean
}

interface PageContent {
  pageNumber: number
  content: string
  isComplete: boolean
}

export const WordStyleRendererWithPagination: React.FC<WordStyleRendererWithPaginationProps> = ({
  content,
  formData,
  bannerImage,
  isGeneratingBanner
}) => {
  const [pages, setPages] = useState<PageContent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isContentComplete, setIsContentComplete] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // A4页面的精确尺寸（以像素为单位，使用更高精度的DPI计算）
  // 使用CSS的1pt = 1.333px的标准换算，更接近Word的实际渲染
  const PT_TO_PX = 1.333 // 1pt = 1.333px (CSS标准)
  const CM_TO_PT = 28.35 // 1cm = 28.35pt

  // A4纸张尺寸：21cm × 29.7cm
  const A4_WIDTH_PX = Math.round(21 * CM_TO_PT * PT_TO_PX)   // 21cm = 794px
  const A4_HEIGHT_PX = Math.round(29.7 * CM_TO_PT * PT_TO_PX) // 29.7cm = 1123px

  // Word默认页边距：上下2.54cm，左右3.17cm
  const PAGE_MARGIN_TOP = Math.round(2.54 * CM_TO_PT * PT_TO_PX)    // 2.54cm = 96px
  const PAGE_MARGIN_BOTTOM = Math.round(2.54 * CM_TO_PT * PT_TO_PX) // 2.54cm = 96px
  const PAGE_MARGIN_LEFT = Math.round(3.17 * CM_TO_PT * PT_TO_PX)   // 3.17cm = 120px
  const PAGE_MARGIN_RIGHT = Math.round(3.17 * CM_TO_PT * PT_TO_PX)  // 3.17cm = 120px

  // 页眉页脚高度：页眉距离1.5cm，页脚距离1.75cm
  const HEADER_HEIGHT = Math.round(1.5 * CM_TO_PT * PT_TO_PX)  // 1.5cm = 57px
  const FOOTER_HEIGHT = Math.round(1.75 * CM_TO_PT * PT_TO_PX) // 1.75cm = 66px

  // 动态计算每页的可用内容高度（根据Banner状态智能调整）
  const getContentHeight = (pageNumber: number, hasBanner: boolean) => {
    let baseHeight = A4_HEIGHT_PX - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM - HEADER_HEIGHT - FOOTER_HEIGHT

    // 第一页如果有Banner图片，需要减去Banner高度和额外间距
    if (pageNumber === 1 && hasBanner) {
      baseHeight -= 180 + 12 // Banner图片区域高度 + 页眉间距调整
    }

    return baseHeight
  }

  // 辅助函数：判断元素类型
  const getElementType = (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase()

    if (tagName.match(/^h[1-6]$/)) {
      return 'heading'
    } else if (tagName === 'p') {
      return 'paragraph'
    } else if (tagName === 'ul' || tagName === 'ol') {
      return 'list'
    } else if (tagName === 'blockquote') {
      return 'quote'
    } else if (tagName === 'pre') {
      return 'code'
    }

    return 'other'
  }

  // 辅助函数：获取元素的优先级（用于分页决策）
  const getElementPriority = (element: HTMLElement) => {
    const type = getElementType(element)

    switch (type) {
      case 'heading':
        return 'high' // 标题优先保持完整
      case 'quote':
      case 'code':
        return 'medium' // 引用和代码块尽量不分割
      case 'list':
        return 'medium' // 列表尽量保持完整
      default:
        return 'low' // 普通段落可以灵活处理
    }
  }

  const CONTENT_HEIGHT = getContentHeight(1, !!(bannerImage || isGeneratingBanner))

  // 获取水印配置
  const getWatermarkConfig = (): WatermarkConfig | null => {
    try {
      const saved = localStorage.getItem('watermarkConfig')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('获取水印配置失败:', error)
      return null
    }
  }

  // 获取颜色值 - 针对A4纸张优化
  const getWatermarkColor = (color: string, opacity: number): string => {
    const baseOpacity = opacity / 100
    const colorMap = {
      gray: `rgba(128, 128, 128, ${baseOpacity})`,
      red: `rgba(220, 53, 69, ${baseOpacity})`, // 使用更柔和的红色
      blue: `rgba(13, 110, 253, ${baseOpacity})`, // 使用更柔和的蓝色
      black: `rgba(33, 37, 41, ${baseOpacity})` // 使用深灰色而非纯黑
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  // 渲染水印层
  const renderWatermarkLayer = (pageNumber: number) => {
    const watermarkConfig = getWatermarkConfig()
    
    if (!watermarkConfig || !watermarkConfig.enabled) {
      return null
    }

    const { text, opacity, fontSize, rotation, position, repeat, color } = watermarkConfig
    
    // 计算水印的基础样式 - 针对A4纸张优化
    const baseWatermarkStyle: React.CSSProperties = {
      position: 'absolute',
      color: getWatermarkColor(color, opacity),
      fontSize: `${fontSize}px`,
      fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
      fontWeight: '600', // 使用中等粗细，避免过于突出
      transform: `rotate(${rotation}deg)`,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 1, // 在背景之上，内容之下
      whiteSpace: 'nowrap',
      letterSpacing: '2px', // 增加字符间距，提高可读性
      textShadow: 'none' // 移除文字阴影，保持简洁
    }

    // 根据位置计算具体坐标
    const getPositionStyle = (pos: string): React.CSSProperties => {
      switch (pos) {
        case 'center':
          return {
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
          }
        case 'top-left':
          return {
            top: '20%',
            left: '20%',
            transform: `rotate(${rotation}deg)`
          }
        case 'top-right':
          return {
            top: '20%',
            right: '20%',
            transform: `rotate(${rotation}deg)`
          }
        case 'bottom-left':
          return {
            bottom: '20%',
            left: '20%',
            transform: `rotate(${rotation}deg)`
          }
        case 'bottom-right':
          return {
            bottom: '20%',
            right: '20%',
            transform: `rotate(${rotation}deg)`
          }
        default:
          return {
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
          }
      }
    }

    // 根据重复模式渲染水印
    const renderWatermarkElements = () => {
      const elements: JSX.Element[] = []
      
      if (repeat === 'none') {
        // 单个水印
        elements.push(
          <div
            key="single-watermark"
            style={{
              ...baseWatermarkStyle,
              ...getPositionStyle(position)
            }}
          >
            {text}
          </div>
        )
      } else if (repeat === 'diagonal') {
        // 对角线重复水印 - 针对A4纸张优化布局
        const positions = [
          { top: '20%', left: '20%' },
          { top: '40%', left: '40%' },
          { top: '60%', left: '60%' },
          { top: '80%', left: '80%' },
          { top: '30%', right: '30%' },
          { top: '50%', right: '50%' },
          { top: '70%', right: '70%' }
        ]
        
        positions.forEach((pos, index) => {
          elements.push(
            <div
              key={`diagonal-watermark-${index}`}
              style={{
                ...baseWatermarkStyle,
                ...pos,
                transform: `rotate(${rotation}deg)`
              }}
            >
              {text}
            </div>
          )
        })
      } else if (repeat === 'grid') {
        // 网格重复水印 - 针对A4纸张优化密度
        const rows = 3 // 减少行数，避免过于密集
        const cols = 2 // 减少列数，适合A4宽度
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            elements.push(
              <div
                key={`grid-watermark-${row}-${col}`}
                style={{
                  ...baseWatermarkStyle,
                  top: `${25 + (row * 25)}%`, // 增加间距
                  left: `${25 + (col * 30)}%`, // 增加间距
                  transform: `rotate(${rotation}deg)`
                }}
              >
                {text}
              </div>
            )
          }
        }
      }
      
      return elements
    }

    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        {renderWatermarkElements()}
      </div>
    )
  }

  // 智能分页处理机制
  useEffect(() => {
    if (content) {
      // 立即进行精确分页（因为内容已经是完整的）
      const timer = setTimeout(() => {
        console.log('Starting pagination for cached content...')
        setIsContentComplete(true)
        performFinalPagination()
      }, 100) // 很短的延迟，确保DOM已更新

      return () => clearTimeout(timer)
    }
  }, [content])

  // 备用的流式分页处理（如果需要的话）
  useEffect(() => {
    if (content && !isContentComplete) {
      // 如果1秒后还没有完成分页，使用流式分页作为备用
      const fallbackTimer = setTimeout(() => {
        console.log('Using fallback streaming pagination...')
        performStreamingPagination()
        setIsContentComplete(true)
      }, 1000)

      return () => clearTimeout(fallbackTimer)
    }
  }, [content, isContentComplete])

  // 流式分页处理 - 快速分页，适合实时更新
  const performStreamingPagination = () => {
    if (!content) return

    // 简单的基于字符数的分页估算
    const avgCharsPerPage = 800
    const lines = content.split('\n').filter(line => line.trim())
    const processedContent = lines.map(line => {
      if (line.startsWith('#')) {
        return processContentForMeasurement(line)
      } else {
        return `<p style="font-family: 'Source Han Sans SC', 'SimHei', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; text-indent: 0.74cm; margin-top: 0pt; margin-bottom: 6pt;">${line}</p>`
      }
    }).join('')

    // 基于内容长度估算页数
    const estimatedPages = Math.max(1, Math.ceil(content.length / avgCharsPerPage))
    const contentPerPage = Math.ceil(lines.length / estimatedPages)

    const newPages: PageContent[] = []
    for (let i = 0; i < estimatedPages; i++) {
      const startIndex = i * contentPerPage
      const endIndex = Math.min((i + 1) * contentPerPage, lines.length)
      const pageLines = lines.slice(startIndex, endIndex)

      const pageContent = pageLines.map(line => {
        if (line.startsWith('#')) {
          return processContentForMeasurement(line)
        } else {
          return `<p style="font-family: 'Source Han Sans SC', 'SimHei', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; text-indent: 0.74cm; margin-top: 0pt; margin-bottom: 6pt;">${line}</p>`
        }
      }).join('')

      newPages.push({
        pageNumber: i + 1,
        content: pageContent,
        isComplete: false
      })
    }

    setPages(newPages)
  }

  // 最终精确分页处理 - 内容生成完成后的精确分页
  const performFinalPagination = () => {
    if (!contentRef.current) return

    // 创建一个隐藏的测量容器
    const measureContainer = document.createElement('div')
    measureContainer.style.position = 'absolute'
    measureContainer.style.left = '-9999px'
    measureContainer.style.top = '0'
    measureContainer.style.width = `${A4_WIDTH_PX - PAGE_MARGIN_LEFT - PAGE_MARGIN_RIGHT}px`
    measureContainer.style.fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
    measureContainer.style.fontSize = '11pt'
    measureContainer.style.lineHeight = '1.5'
    measureContainer.innerHTML = processContentForMeasurement(content)

    document.body.appendChild(measureContainer)

    try {
      const newPages: PageContent[] = []
      let currentPageContent = ''
      let currentHeight = 0
      let pageNumber = 1

      // 获取所有段落元素
      const elements = Array.from(measureContainer.children) as HTMLElement[]

      // 智能分页处理
      const hasBanner = !!(bannerImage || isGeneratingBanner)

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i]
        const nextElement = elements[i + 1]

        const elementHeight = element.offsetHeight
        const computedStyle = window.getComputedStyle(element)
        const elementMarginTop = parseInt(computedStyle.marginTop) || 0
        const elementMarginBottom = parseInt(computedStyle.marginBottom) || 0

        // 更精确的高度计算
        let totalElementHeight = elementHeight
        if (elementMarginTop > 0) totalElementHeight += Math.min(elementMarginTop, 12)
        if (elementMarginBottom > 0) totalElementHeight += Math.min(elementMarginBottom, 12)

        // 动态计算当前页面的可用高度（根据Banner状态）
        const currentPageHeight = getContentHeight(pageNumber, hasBanner && pageNumber === 1)
        const safetyMargin = 8
        const availableHeight = currentPageHeight - safetyMargin

        // 智能分页决策函数
        const shouldCreateNewPage = () => {
          // 基本空间检查
          if (currentHeight + totalElementHeight <= availableHeight) {
            return false
          }

          // 如果当前页面没有内容，强制添加（避免无限循环）
          if (!currentPageContent) {
            return false
          }

          const elementType = getElementType(element)
          const elementPriority = getElementPriority(element)
          const lineHeight = parseFloat(computedStyle.lineHeight) || 22
          const remainingSpace = availableHeight - currentHeight

          // 1. 标题智能处理：标题优先放到下一页，避免孤立显示
          if (elementType === 'heading') {
            console.log(`Moving heading "${element.textContent?.substring(0, 30)}..." to next page`)
            return true
          }

          // 2. 行高智能处理：根据行高计算是否有足够空间
          if (elementType === 'paragraph') {
            // 对于段落，检查是否有足够空间显示至少2行内容
            const minRequiredSpace = lineHeight * 2
            if (remainingSpace < minRequiredSpace) {
              console.log(`Insufficient space for paragraph (${remainingSpace}px < ${minRequiredSpace}px)`)
              return true
            }
          }

          // 3. 高优先级元素处理：引用、代码块等尽量保持完整
          if (elementPriority === 'high' || elementPriority === 'medium') {
            const elementNeedsSpace = totalElementHeight * 1.1 // 需要额外10%空间
            if (remainingSpace < elementNeedsSpace) {
              console.log(`Moving ${elementType} to next page to keep it intact`)
              return true
            }
          }

          // 4. 避免标题孤立：如果下一个元素是标题，避免当前元素孤立在页面底部
          if (nextElement) {
            const nextElementType = getElementType(nextElement)
            if (nextElementType === 'heading') {
              const spaceAfterCurrent = availableHeight - (currentHeight + totalElementHeight)
              const nextElementHeight = nextElement.offsetHeight + 24 // 标题需要更多空间

              if (spaceAfterCurrent < nextElementHeight) {
                console.log(`Avoiding orphaned content before heading, moving to next page`)
                return true
              }
            }
          }

          // 5. 列表智能处理：避免列表被截断在不合适的位置
          if (elementType === 'list') {
            const listItems = element.querySelectorAll('li')
            if (listItems.length > 1) {
              // 如果列表有多个项目，确保至少能显示2个项目
              const itemHeight = listItems[0]?.offsetHeight || 20
              const minListSpace = itemHeight * 2
              if (remainingSpace < minListSpace) {
                console.log(`Moving list to next page to avoid awkward split`)
                return true
              }
            }
          }

          return true
        }

        if (shouldCreateNewPage()) {
          // 创建新页面
          newPages.push({
            pageNumber: pageNumber,
            content: currentPageContent,
            isComplete: true
          })

          currentPageContent = element.outerHTML
          currentHeight = totalElementHeight
          pageNumber++

          console.log(`Created page ${pageNumber - 1}, starting page ${pageNumber}`)
        } else {
          currentPageContent += element.outerHTML
          currentHeight += totalElementHeight
        }

        // 特殊处理：超大元素警告
        if (totalElementHeight > availableHeight && currentPageContent === element.outerHTML) {
          console.warn('Element too large for single page:', element.tagName, totalElementHeight, 'available:', availableHeight)
        }
      }

      // 添加最后一页
      if (currentPageContent) {
        newPages.push({
          pageNumber: pageNumber,
          content: currentPageContent,
          isComplete: true
        })
      }

      setPages(newPages)
    } finally {
      document.body.removeChild(measureContainer)
    }
  }

  // 处理内容用于测量 - 完全按照Word样式规范
  const processContentForMeasurement = (content: string): string => {
    if (!content) return ''

    // 清理可能导致显示问题的特殊字符
    let html = content
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // 移除控制字符
      .replace(/\uFEFF/g, '') // 移除BOM字符
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除零宽字符

    // 处理删除线
    html = html.replace(/~~([^~\n]+)~~/g, '<del style="text-decoration: line-through; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</del>')

    // 处理粗体 - 支持 ** 和 __ 两种格式
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong style="font-weight: bold; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</strong>')
    html = html.replace(/__([^_\n]+)__/g, '<strong style="font-weight: bold; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</strong>')

    // 处理斜体 - 支持 * 和 _ 两种格式
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em style="font-style: italic; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</em>')
    html = html.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em style="font-style: italic; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</em>')

    // 处理高亮文本
    html = html.replace(/==([^=\n]+)==/g, '<mark style="background-color: #ffff00; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</mark>')

    // 处理上标和下标
    html = html.replace(/\^([^\^\s]+)\^/g, '<sup style="font-size: 8pt; color: #000000;">$1</sup>')
    html = html.replace(/~([^~\s]+)~/g, '<sub style="font-size: 8pt; color: #000000;">$1</sub>')

    // 处理键盘按键
    html = html.replace(/\[\[([^\]]+)\]\]/g, '<kbd style="background-color: #f1f1f1; border: 1px solid #ccc; border-radius: 3px; padding: 1px 4px; font-family: monospace; font-size: 9pt;">$1</kbd>')

    // 处理特殊符号和转义字符
    html = html.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1') // 处理转义字符

    // 处理标题 - 中文商业文档标准
    let isFirstH1 = true // 标记是否为第一个一级标题（文档主标题）
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length
      let fontSize, fontFamily, marginTop, marginBottom, fontWeight, textAlign

      switch (level) {
        case 1:
          if (isFirstH1) {
            // 文档主标题：24pt，居中，思源黑体加粗，段前24pt，段后18pt
            fontSize = '24pt'
            fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
            marginTop = '24pt'
            marginBottom = '18pt'
            fontWeight = 'bold'
            textAlign = 'center'
            isFirstH1 = false
          } else {
            // 一级标题：20pt，居中，思源黑体加粗，段前18pt，段后12pt
            fontSize = '20pt'
            fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
            marginTop = '18pt'
            marginBottom = '12pt'
            fontWeight = 'bold'
            textAlign = 'center'
          }
          break
        case 2:
          // 二级标题：18pt，左对齐，思源黑体加粗，段前12pt，段后8pt
          fontSize = '18pt'
          fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
          marginTop = '12pt'
          marginBottom = '8pt'
          fontWeight = 'bold'
          textAlign = 'left'
          break
        case 3:
          // 三级标题：16pt，左对齐，思源黑体加粗，段前8pt，段后6pt
          fontSize = '16pt'
          fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
          marginTop = '8pt'
          marginBottom = '6pt'
          fontWeight = 'bold'
          textAlign = 'left'
          break
        default:
          fontSize = '20pt'
          fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif"
          marginTop = '18pt'
          marginBottom = '12pt'
          fontWeight = 'bold'
          textAlign = 'center'
      }

      return `<h${level} style="font-size: ${fontSize}; font-family: ${fontFamily}; font-weight: ${fontWeight}; color: #000000; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; line-height: 1.5; text-align: ${textAlign};">${title.trim()}</h${level}>`
    })

    // 处理列表项
    html = html.replace(/^[-*+]\s+(.+)$/gm, '<li style="margin-bottom: 6pt; line-height: 1.5; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</li>')
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-bottom: 6pt; line-height: 1.5; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</li>')

    // 处理引用
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote style="border-left: 3pt solid #AAAAAA; padding-left: 7pt; margin: 16pt 0; color: #000000; font-style: italic; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt; line-height: 1.5;">$1</blockquote>')

    // 处理代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background-color: #F8F9FA; border: 1pt solid #DDDDDD; padding: 12pt; margin: 12pt 0; font-family: 'Courier New', monospace; font-size: 9pt; line-height: 1.2; color: #000000; overflow-x: auto;"><code>${code.trim()}</code></pre>`
    })

    // 处理行内代码
    html = html.replace(/`([^`\n]+)`/g, '<code style="background-color: #F1F3F4; padding: 1pt 3pt; font-family: \'Courier New\', monospace; font-size: 9pt; color: #000000;">$1</code>')

    // 处理图片链接
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 6pt 0;" />')

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #0000FF; text-decoration: underline; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</a>')

    // 处理自动链接
    html = html.replace(/<(https?:\/\/[^>]+)>/g, '<a href="$1" style="color: #0000FF; text-decoration: underline; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</a>')

    // 处理水平线 - 支持多种格式
    html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '<hr style="border: none; border-top: 1pt solid #E5E7EB; margin: 12pt 0;" />')

    // 处理表格分隔符（简单处理，避免显示原始符号）
    html = html.replace(/^\|.*\|$/gm, (match) => {
      if (match.includes('---') || match.includes('===')) {
        return '' // 移除表格分隔行
      }
      return match.replace(/\|/g, ' | ') // 简单格式化表格行
    })

    // 处理任务列表
    html = html.replace(/^- \[[ x]\] (.+)$/gm, (match, text, offset, string) => {
      const checked = match.includes('[x]')
      return `<div style="margin: 3pt 0;"><input type="checkbox" ${checked ? 'checked' : ''} disabled style="margin-right: 6pt;"><span style="font-family: 'Source Han Sans SC', 'SimHei', sans-serif; font-size: 11pt; color: #000000;">${text}</span></div>`
    })

    // 处理脚注引用
    html = html.replace(/\[\^([^\]]+)\]/g, '<sup style="font-size: 8pt; color: #0066cc;">[$1]</sup>')

    // 清理可能残留的Markdown符号
    html = html.replace(/^\s*[>]+\s*/gm, '') // 清理可能残留的引用符号
    html = html.replace(/^\s*[*+-]\s*$/gm, '') // 清理空的列表项符号

    // 处理段落 - 完全按照Word样式规范
    const lines = html.split('\n')
    const processedLines: string[] = []
    let inList = false
    let listItems: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith('<li ')) {
        if (!inList) {
          inList = true
          listItems = []
        }
        listItems.push(line)
      } else {
        if (inList) {
          // 结束列表
          const listType = listItems[0].includes('1.') ? 'ol' : 'ul'
          const listStyle = listType === 'ol'
            ? 'list-style-type: decimal; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
            : 'list-style-type: disc; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
          processedLines.push(`<${listType} style="${listStyle}">${listItems.join('')}</${listType}>`)
          inList = false
          listItems = []
        }

        if (line === '') {
          continue
        } else if (line.startsWith('<h') || line.startsWith('<blockquote') || line.startsWith('<hr') || line.startsWith('<pre')) {
          processedLines.push(line)
        } else if (line.trim()) {
          // 正文段落：思源黑体，11pt，1.5倍行距，首行缩进2个字符，段前0pt，段后6pt
          // 只处理非空行，避免空段落
          processedLines.push(`<p style="font-family: 'Source Han Sans SC', 'SimHei', sans-serif; font-size: 11pt; line-height: 1.5; color: #000000; text-align: left; text-indent: 0.74cm; margin-top: 0pt; margin-bottom: 6pt;">${line}</p>`)
        }
      }
    }

    // 处理最后的列表
    if (inList && listItems.length > 0) {
      const listType = listItems[0].includes('1.') ? 'ol' : 'ul'
      const listStyle = listType === 'ol'
        ? 'list-style-type: decimal; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
        : 'list-style-type: disc; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
      processedLines.push(`<${listType} style="${listStyle}">${listItems.join('')}</${listType}>`)
    }

    return processedLines.join('\n')
  }

  // 渲染单个页面
  const renderPage = (page: PageContent) => (
    <div
      key={page.pageNumber}
      className="page"
      style={{
        width: `${A4_WIDTH_PX}px`,
        height: `${A4_HEIGHT_PX}px`,
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        marginBottom: '20px',
        position: 'relative',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
        // 确保页面在屏幕上的显示效果
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }}
    >
      {/* 页眉 - 精确按照Word样式 */}
      <div style={{
        position: 'absolute',
        top: `${PAGE_MARGIN_TOP}px`,
        left: `${PAGE_MARGIN_LEFT}px`,
        right: `${PAGE_MARGIN_RIGHT}px`,
        height: `${HEADER_HEIGHT}px`,
        borderBottom: '0.5pt solid #DDDDDD',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8pt' }}>
          {/* 真实LOGO - 按照Word中的实际尺寸 */}
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: '30pt',
              height: '30pt',
              objectFit: 'contain'
            }}
            onError={(e) => {
              // 如果logo加载失败，显示占位符
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const placeholder = target.nextElementSibling as HTMLElement
              if (placeholder) {
                placeholder.style.display = 'flex'
              }
            }}
          />
          {/* LOGO占位符 - 当真实logo加载失败时显示 */}
          <div style={{
            width: '30pt',
            height: '30pt',
            backgroundColor: '#f3f4f6',
            border: '0.5pt solid #d1d5db',
            borderRadius: '2pt',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6pt',
            color: '#6b7280'
          }}>
            LOGO
          </div>
          {/* 页眉文字 - 思源黑体，9pt，深灰色 */}
          <span style={{
            fontSize: '9pt',
            color: '#333333',
            fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
            fontWeight: 'normal'
          }}>
            星光同城传媒 | 专注于服务本地实体商家的IP内容机构
          </span>
        </div>
      </div>

      {/* Banner图片（仅第一页） - 按照Word中的实际效果 */}
      {page.pageNumber === 1 && (bannerImage || isGeneratingBanner) && (
        <div style={{
          position: 'absolute',
          top: `${PAGE_MARGIN_TOP + HEADER_HEIGHT}px`,
          left: `${PAGE_MARGIN_LEFT}px`,
          right: `${PAGE_MARGIN_RIGHT}px`,
          textAlign: 'center',
          padding: '6pt 0',
          backgroundColor: 'white'
        }}>
          {isGeneratingBanner ? (
            <div style={{
              width: '100%',
              height: '168px', // 7英寸宽度对应的高度
              background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              <div style={{
                width: '16pt',
                height: '16pt',
                border: '1.5pt solid #e5e7eb',
                borderTop: '1.5pt solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '6pt'
              }}></div>
              <p style={{
                color: '#000000',
                fontSize: '9pt',
                margin: '0',
                fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
              }}>
                正在生成专属Banner图...
              </p>
            </div>
          ) : bannerImage ? (
            <img
              src={bannerImage}
              alt="首页Banner图"
              style={{
                maxWidth: '504px', // 7英寸宽度
                height: '168px', // 保持比例
                objectFit: 'cover',
                display: 'block',
                margin: '0 auto'
              }}
            />
          ) : null}
        </div>
      )}

      {/* 水印层 - 在内容之前渲染，作为背景层 */}
      {renderWatermarkLayer(page.pageNumber)}

      {/* 页面内容 - 精确按照Word A4页面样式 */}
      <div style={{
        position: 'absolute',
        top: `${PAGE_MARGIN_TOP + HEADER_HEIGHT + 12 + (page.pageNumber === 1 && (bannerImage || isGeneratingBanner) ? 180 : 0)}px`, // 增加12px间距
        left: `${PAGE_MARGIN_LEFT}px`,
        right: `${PAGE_MARGIN_RIGHT}px`,
        bottom: `${PAGE_MARGIN_BOTTOM + FOOTER_HEIGHT + 8}px`, // 减少到8px安全边距
        overflow: 'hidden', // 确保内容不会溢出
        fontSize: '11pt', // 正文11pt
        lineHeight: '1.5', // 1.5倍行距
        color: '#000000',
        backgroundColor: 'transparent', // 改为透明，让水印可见
        fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
        zIndex: 2 // 确保内容在水印之上
      }}>
        <div
          style={{
            height: '100%',
            overflow: 'hidden', // 双重保险，确保内容不溢出
            paddingTop: '4px', // 顶部留一点空间
            paddingBottom: '4px', // 底部留一点空间
            position: 'relative',
            zIndex: 2 // 确保文本内容在水印之上
          }}
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

      {/* 页脚 - 中文商业文档标准格式 */}
      <div style={{
        position: 'absolute',
        bottom: `${PAGE_MARGIN_BOTTOM}px`,
        left: `${PAGE_MARGIN_LEFT}px`,
        right: `${PAGE_MARGIN_RIGHT}px`,
        height: `${FOOTER_HEIGHT}px`,
        borderTop: '0.5pt solid #DDDDDD',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* 左侧版权信息 */}
        <div style={{
          fontSize: '9pt',
          color: '#333333',
          fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
          fontWeight: 'normal'
        }}>
          © 2025 星光同城传媒
        </div>

        {/* 右侧页码 */}
        <div style={{
          fontSize: '9pt',
          color: '#333333',
          fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
          fontWeight: 'normal'
        }}>
          第 {page.pageNumber} 页
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* 隐藏的测量容器 */}
      <div ref={contentRef} style={{ display: 'none' }} />

      {/* 页面渲染 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {pages.length > 0 ? (
          pages.map(page => renderPage(page))
        ) : (
          <div style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${A4_HEIGHT_PX}px`,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11pt',
            color: '#000000'
          }}>
            正在生成专业方案...
          </div>
        )}
      </div>

      {/* 内容生成状态和分页控制 */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        {/* 生成状态指示器 */}
        {!isContentComplete && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              fontSize: '11pt',
              color: '#856404'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                border: '2px solid #ffeaa7',
                borderTop: '2px solid #856404',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              正在输出中...
            </div>
          </div>
        )}

        {/* 完成状态 */}
        {isContentComplete && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              fontSize: '11pt',
              color: '#155724'
            }}>
              ✅ 内容生成完成
            </div>
          </div>
        )}

        {/* 分页信息 */}
        <p style={{
          fontSize: '12pt',
          color: '#000000',
          margin: '0 0 12px 0',
          fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
        }}>
          共 {pages.length} 页 {isContentComplete ? '(最终版本)' : '(实时更新中)'}
        </p>

        {/* 分页导航 */}
        {pages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {pages.map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentPage === index + 1 ? '#3b82f6' : '#ffffff',
                  color: currentPage === index + 1 ? '#ffffff' : '#000000',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '10pt',
                  fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
                }}
              >
                第 {index + 1} 页
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 文档底部信息 - 完全独立的模块 */}
      <div style={{
        marginTop: '20px',
        padding: '16pt 20pt',
        backgroundColor: '#fafafa',
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <hr style={{
          border: 'none',
          borderTop: '1pt solid #e5e7eb',
          margin: '0 0 12pt 0'
        }} />
        <p style={{
          fontSize: '12pt',
          color: '#000000',
          margin: '0',
          fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
        }}>
          星光同城传媒 | 专注于服务本地实体商家的IP内容机构
        </p>
      </div>

      {/* CSS样式 - 完全按照Word样式规范 */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* 商业文档标题样式 - 主标题居中，其他左对齐 */
        h1 {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-weight: bold !important;
          color: #000000 !important;
          line-height: 1.5 !important;
          /* 具体样式由内联样式控制，支持主标题居中和其他标题左对齐 */
        }

        h2 {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 18pt !important;
          font-weight: bold !important;
          color: #000000 !important;
          margin-top: 12pt !important;
          margin-bottom: 8pt !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        h3 {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 16pt !important;
          font-weight: bold !important;
          color: #000000 !important;
          margin-top: 8pt !important;
          margin-bottom: 6pt !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        /* Word样式的段落样式 - 精确复刻 */
        p {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          color: #000000 !important;
          line-height: 1.5 !important;
          text-align: left !important;
          text-indent: 0.74cm !important; /* 首行缩进2个字符 */
          margin-top: 0pt !important;
          margin-bottom: 6pt !important; /* 段后6pt */
        }

        /* Word样式的加粗文本 */
        strong {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          font-weight: bold !important;
          color: #000000 !important;
        }

        /* Word样式的斜体文本 */
        em {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          font-style: italic !important;
          color: #000000 !important;
        }

        /* Word样式的列表样式 */
        ul, ol {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          color: #000000 !important;
          line-height: 1.5 !important;
          padding-left: 24pt !important;
          margin: 12pt 0 !important;
        }

        li {
          margin-bottom: 6pt !important;
          color: #000000 !important;
          font-size: 11pt !important;
          line-height: 1.5 !important;
        }

        /* Word样式的引用样式 */
        blockquote {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          color: #000000 !important;
          font-style: italic !important;
          border-left: 3pt solid #AAAAAA !important;
          padding-left: 7pt !important;
          margin: 16pt 0 !important;
          background-color: transparent !important;
          line-height: 1.5 !important;
        }

        /* Word样式的代码样式 */
        pre {
          font-family: 'Courier New', monospace !important;
          font-size: 9pt !important;
          background-color: #F8F9FA !important;
          border: 1pt solid #DDDDDD !important;
          padding: 12pt !important;
          margin: 12pt 0 !important;
          line-height: 1.2 !important;
          color: #000000 !important;
          overflow-x: auto !important;
        }

        code {
          font-family: 'Courier New', monospace !important;
          background-color: #F1F3F4 !important;
          padding: 1pt 3pt !important;
          font-size: 9pt !important;
          color: #000000 !important;
        }

        /* Word样式的链接样式 */
        a {
          color: #0000FF !important;
          text-decoration: underline !important;
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
        }

        /* Word样式的水平线样式 */
        hr {
          border: none !important;
          border-top: 1pt solid #E5E7EB !important;
          margin: 12pt 0 !important;
        }

        /* 确保所有文本都使用正确的字体和大小 */
        * {
          box-sizing: border-box;
        }

        /* 打印样式 - 确保打印时完全按照Word效果 */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .page {
            page-break-after: always;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  )
}