"use client"

import React, { useState } from "react"
import { DEFAULT_CHAT_MODEL } from "@/lib/models"
import { PageHeader } from "@/components/page-header"
import { ProgressSteps } from "@/components/progress-steps"
import { FormSection } from "@/components/form-section"
import { useFormData } from "@/hooks/use-form-data"
import { usePlanGeneration } from "@/hooks/use-plan-generation"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_CHAT_MODEL.id)
  const [showModelSettings, setShowModelSettings] = useState(false)
  
  // 使用自定义hooks
  const {
    formData,
    expandedKeywords,
    isExpandingKeywords,
    enableKeywordExpansion,
    setEnableKeywordExpansion,
    handleInputChange
  } = useFormData()
  
  const { isLoading, error, generatePlan } = usePlanGeneration()



  // 处理表单提交
  const handleNextStep = async () => {
    await generatePlan(
      formData,
      enableKeywordExpansion,
      selectedModelId,
      () => {}, // setExpandedKeywords - 这里简化处理
      () => {}  // setIsExpandingKeywords - 这里简化处理
    )
  }





  const handleBackToForm = () => {
    setCurrentStep(1)
    setGeneratedContent("")
    setError("")
  }

  const sectionIcons = {
    positioning: Target,
    branding: Sparkles,
    account: Users,
    content: Video,
    livestream: MessageSquare,
    scripts: MessageSquare,
    growth: TrendingUp,
    monetization: DollarSign,
  }

  // 解析Markdown生成目录的函数
  const parseMarkdownToc = (content: string) => {
    const lines = content.split('\n')
    const toc: Array<{ id: string, title: string, level: number }> = []

    lines.forEach((line, index) => {
      // 匹配标题行 (# ## ### 等)
      const match = line.match(/^(#{1,6})\s+(.+)$/)
      if (match) {
        const level = match[1].length
        const title = match[2].trim()
        const id = `heading-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`

        toc.push({
          id,
          title,
          level
        })
      }
    })

    return toc
  }

  // 监听滚动事件，更新当前激活的章节
  React.useEffect(() => {
    if (!generatedContent || currentStep !== 2) return

    const handleScroll = () => {
      const headings = document.querySelectorAll('[id^="heading-"]')
      let currentActive = ''

      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100) {
          currentActive = heading.id
        }
      })

      setActiveSection(currentActive)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [generatedContent, currentStep])

  // 跳转到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // 生成banner图片的函数
  const generateBannerImage = async (planContent: string) => {
    setIsGeneratingBanner(true)
    try {
      // 提取方案的关键信息作为图片提示词
      const bannerPrompt = `给该方案生成一个banner图${planContent.substring(0, 200)}`

      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: bannerPrompt,
          size: '1024x512', // banner比例
          quality: 'standard'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data[0] && data.data[0].url) {
          setBannerImage(data.data[0].url)
        }
      } else {
        console.error('Banner图片生成失败:', response.statusText)
      }
    } catch (error) {
      console.error('生成banner图片时出错:', error)
    } finally {
      setIsGeneratingBanner(false)
    }
  }

  // 复制内容到剪贴板
  const handleCopyContent = async () => {
    if (!generatedContent) return

    try {
      // 清理Markdown格式，转换为纯文本
      const cleanContent = generatedContent
        .replace(/#{1,6}\s+/g, '') // 移除标题标记
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除加粗标记
        .replace(/\n\n+/g, '\n\n') // 规范化换行
        .trim()

      const fullContent = `${formData.storeName} - 老板IP打造方案
由星光传媒专业团队为您量身定制
生成时间: ${new Date().toLocaleString('zh-CN')}

${cleanContent}

---
本方案由星光传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构`

      await navigator.clipboard.writeText(fullContent)
      alert('✅ 内容已复制到剪贴板！')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动选择内容复制')
    }
  }

  // 导出Word文档
  const handleExportWord = async () => {
    if (!generatedContent) return

    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      const fileSaver = await import('file-saver')
      const saveAs = fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default

      if (!saveAs || typeof saveAs !== 'function') {
        throw new Error('无法加载文件保存功能，请检查网络连接')
      }

      // 解析内容为段落
      const lines = generatedContent.split('\n').filter(line => line.trim())
      const paragraphs: any[] = []

      // 添加标题
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${formData.storeName} - 老板IP打造方案`,
              bold: true,
              size: 32,
              color: "1f2937"
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "由星光传媒专业团队为您量身定制",
              size: 24,
              color: "6b7280"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `生成时间: ${new Date().toLocaleString('zh-CN')}`,
              size: 20,
              color: "9ca3af"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      )

      // 添加banner图片（如果存在）
      if (bannerImage) {
        try {
          // 获取图片数据
          const response = await fetch(bannerImage)
          const imageBuffer = await response.arrayBuffer()

          const { ImageRun } = await import('docx')

          paragraphs.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 600,
                    height: 300,
                  },
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            })
          )
        } catch (imageError) {
          console.warn('添加banner图片失败:', imageError)
          // 如果图片加载失败，添加一个占位文本
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "[Banner图片]",
                  size: 20,
                  color: "9ca3af",
                  italics: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 }
            })
          )
        }
      }

      // 处理内容
      lines.forEach(line => {
        const trimmedLine = line.trim()
        if (!trimmedLine) return

        // 检查是否是标题
        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
        if (headingMatch) {
          const level = headingMatch[1].length
          const title = headingMatch[2]

          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: level === 1 ? 28 : level === 2 ? 24 : level === 3 ? 22 : 20,
                  color: level === 1 ? "1f2937" : level === 2 ? "374151" : "4b5563"
                })
              ],
              heading: level === 1 ? HeadingLevel.HEADING_1 :
                level === 2 ? HeadingLevel.HEADING_2 :
                  level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
              spacing: { before: 400, after: 200 }
            })
          )
        } else {
          // 处理普通段落，解析加粗文本
          const textRuns: any[] = []
          let lastIndex = 0
          const boldRegex = /\*\*(.*?)\*\*/g
          let match

          while ((match = boldRegex.exec(trimmedLine)) !== null) {
            // 添加普通文本
            if (match.index > lastIndex) {
              textRuns.push(
                new TextRun({
                  text: trimmedLine.slice(lastIndex, match.index),
                  size: 22
                })
              )
            }
            // 添加加粗文本
            textRuns.push(
              new TextRun({
                text: match[1],
                bold: true,
                size: 22
              })
            )
            lastIndex = match.index + match[0].length
          }

          // 添加剩余文本
          if (lastIndex < trimmedLine.length) {
            textRuns.push(
              new TextRun({
                text: trimmedLine.slice(lastIndex),
                size: 22
              })
            )
          }

          if (textRuns.length === 0) {
            textRuns.push(
              new TextRun({
                text: trimmedLine,
                size: 22
              })
            )
          }

          paragraphs.push(
            new Paragraph({
              children: textRuns,
              spacing: { after: 200 }
            })
          )
        }
      })

      // 添加页脚
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "---",
              size: 20,
              color: "e5e7eb"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "本方案由星光传媒专I智能生成 | 专注于服务本地实体商家的IP内容机构",
              size: 20,
              color: "6b7280"
            })
          ],
          alignment: AlignmentType.CENTER
        })
      )

      // 创建文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      })

      // 生成并下载
      const blob = await Packer.toBlob(doc)
      const fileName = `${formData.storeName || '店铺'}-IP打造方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.docx`
      saveAs(blob, fileName)

      console.log('✅ Word文档导出成功:', fileName)

    } catch (error) {
      console.error('导出Word失败:', error)
      alert('导出Word失败，请稍后重试。错误信息：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 导出PDF功能
  const handleExportPDF = async () => {
    if (!generatedContent) return

    try {
      // 动态导入jsPDF和html2canvas
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')

      // 创建一个临时的导出容器
      const exportContainer = document.createElement('div')
      exportContainer.style.position = 'absolute'
      exportContainer.style.left = '-9999px'
      exportContainer.style.top = '0'
      exportContainer.style.width = '800px' // 固定像素宽度，更好控制
      exportContainer.style.backgroundColor = 'white'
      exportContainer.style.padding = '40px'
      exportContainer.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif'
      exportContainer.style.fontSize = '14px'
      exportContainer.style.lineHeight = '1.6'

      // 构建导出内容
      let exportHTML = `
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 30px;">
          <div style="display: inline-flex; align-items: center; margin-bottom: 20px;">
            <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #7c3aed, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">★</span>
            </div>
            <div style="text-align: left;">
              <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">星光传媒</h1>
              <p style="margin: 0; font-size: 16px; color: #6b7280;">AI智能方案生成器</p>
            </div>
          </div>
          <h2 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 20px 0 10px 0;">${formData.storeName || '店铺'} - 老板IP打造方案</h2>
          <p style="color: #6b7280; margin: 0; font-size: 16px;">由星光传媒专业团队为您量身定制</p>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 14px;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
      `

      // 如果有banner图片，添加到导出内容中
      if (bannerImage) {
        exportHTML += `
          <div style="margin-bottom: 40px; text-align: center;">
            <img src="${bannerImage}" alt="方案Banner图" style="max-width: 100%; height: 250px; object-fit: cover; border-radius: 12px; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);" />
          </div>
        `
      }

      // 处理方案内容，改进Markdown解析
      const processedContent = generatedContent
        .replace(/\n\n+/g, '\n\n') // 规范化换行
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>') // 加粗文本
        .replace(/^(#{1})\s+(.+)$/gm, '<h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 30px 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">$2</h1>') // 一级标题
        .replace(/^(#{2})\s+(.+)$/gm, '<h2 style="font-size: 20px; font-weight: bold; color: #374151; margin: 25px 0 12px 0;">$2</h2>') // 二级标题
        .replace(/^(#{3})\s+(.+)$/gm, '<h3 style="font-size: 18px; font-weight: 600; color: #4b5563; margin: 20px 0 10px 0;">$3</h3>') // 三级标题
        .replace(/^(#{4,6})\s+(.+)$/gm, '<h4 style="font-size: 16px; font-weight: 600; color: #6b7280; margin: 15px 0 8px 0;">$2</h4>') // 四级及以下标题
        .replace(/^- (.+)$/gm, '<li style="margin: 5px 0; color: #374151;">$1</li>') // 列表项
        .replace(/\n/g, '<br>') // 换行

      // 添加方案内容
      exportHTML += `
        <div style="line-height: 1.8; color: #374151; font-size: 14px;">
          ${processedContent}
        </div>
      `

      // 添加页脚
      exportHTML += `
        <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center;">
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">星光传媒 - 专注本地实体商家IP打造</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">让每个老板都成为自己行业的IP</p>
          </div>
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">本方案由AI智能生成，仅供参考，具体执行请结合实际情况调整</p>
        </div>
      `

      exportContainer.innerHTML = exportHTML
      document.body.appendChild(exportContainer)

      // 等待图片加载
      const images = exportContainer.querySelectorAll('img')
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true)
          } else {
            img.onload = () => resolve(true)
            img.onerror = () => resolve(true)
          }
        })
      }))

      // 使用html2canvas截图
      const canvas = await html2canvas(exportContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: exportContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      })

      // 移除临时容器
      document.body.removeChild(exportContainer)

      // 创建PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png', 0.95)

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // 计算缩放比例，留出边距
      const margin = 10 // 10mm边距
      const availableWidth = pdfWidth - 2 * margin
      const availableHeight = pdfHeight - 2 * margin
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583))

      const scaledWidth = imgWidth * 0.264583 * ratio
      const scaledHeight = imgHeight * 0.264583 * ratio
      const imgX = (pdfWidth - scaledWidth) / 2
      const imgY = margin

      // 如果内容高度超过一页，进行分页处理
      if (scaledHeight > availableHeight) {
        const pageHeight = availableHeight
        let currentY = 0
        let pageCount = 0

        while (currentY < scaledHeight) {
          if (pageCount > 0) {
            pdf.addPage()
          }

          const sourceY = currentY / ratio / 0.264583
          const sourceHeight = Math.min(pageHeight / ratio / 0.264583, imgHeight - sourceY)

          // 创建当前页的canvas
          const pageCanvas = document.createElement('canvas')
          const pageCtx = pageCanvas.getContext('2d')
          pageCanvas.width = imgWidth
          pageCanvas.height = sourceHeight

          pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
          const pageImgData = pageCanvas.toDataURL('image/png', 0.95)

          pdf.addImage(pageImgData, 'PNG', imgX, imgY, scaledWidth, sourceHeight * 0.264583 * ratio)

          currentY += pageHeight
          pageCount++
        }
      } else {
        pdf.addImage(imgData, 'PNG', imgX, imgY, scaledWidth, scaledHeight)
      }

      // 下载PDF
      const fileName = `${formData.storeName || '店铺'}-IP打造方案-${new Date().toLocaleDateString('zh-CN').replace(/\//g, '')}.pdf`
      pdf.save(fileName)

      // 显示成功提示
      console.log('✅ PDF导出成功:', fileName)

    } catch (error) {
      console.error('导出PDF失败:', error)
      alert('导出PDF失败，请稍后重试。错误信息：' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  // 解析目录的 useEffect
  React.useEffect(() => {
    if (generatedContent && currentStep === 2) {
      const toc = parseMarkdownToc(generatedContent)
      setTocItems(toc)

      // 自动生成banner图片
      if (!bannerImage && !isGeneratingBanner) {
        generateBannerImage(generatedContent)
      }
    }
  }, [generatedContent, currentStep])

  // 解析和渲染方案内容的函数
  const renderParsedContent = (content: string) => {
    const lines = content.split('\n')
    let renderedContent: JSX.Element[] = []

    // 处理文本中的Markdown格式
    const parseMarkdownText = (text: string) => {
      const parts: (string | JSX.Element)[] = []
      let lastIndex = 0

      // 匹配 **text** 格式的加粗文本
      const boldRegex = /\*\*(.*?)\*\*/g
      let match
      let keyCounter = 0

      while ((match = boldRegex.exec(text)) !== null) {
        // 添加匹配前的普通文本
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index))
        }

        // 添加加粗文本
        parts.push(
          <strong key={`bold-${keyCounter++}`} className="font-semibold text-gray-900">
            {match[1]}
          </strong>
        )

        lastIndex = match.index + match[0].length
      }

      // 添加剩余的普通文本
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return parts.length > 0 ? parts : [text]
    }

    lines.forEach((line, index) => {
      // 检查是否是标题行
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const title = headingMatch[2].trim()
        const id = `heading-${index}-${title.replace(/[^\w\u4e00-\u9fa5]/g, '-').toLowerCase()}`

        const headingElement = React.createElement(
          `h${level}`,
          {
            key: index,
            id: id,
            className: `scroll-mt-20 font-bold text-gray-900 ${level === 1 ? 'text-3xl mb-6 mt-8' :
              level === 2 ? 'text-2xl mb-4 mt-6' :
                level === 3 ? 'text-xl mb-3 mt-5' :
                  'text-lg mb-2 mt-4'
              }`
          },
          parseMarkdownText(title)
        )

        renderedContent.push(headingElement)
      } else if (line.trim()) {
        // 处理普通文本行，解析Markdown格式
        const trimmedLine = line.trim()

        if (trimmedLine) {
          renderedContent.push(
            <p key={index} className="text-gray-700 leading-relaxed mb-3">
              {parseMarkdownText(trimmedLine)}
            </p>
          )
        }
      } else {
        // 空行
        renderedContent.push(<div key={index} className="h-2" />)
      }
    })

    return (
      <div className="prose max-w-none">
        {renderedContent}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-1.5 sm:p-2 rounded-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">星光传媒</h1>
                <p className="text-xs sm:text-sm text-gray-500">方案生成器</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
              抖音第一人设打造专家
            </Badge>
            <Badge variant="secondary" className="sm:hidden bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs px-2 py-1">
              专家
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${currentStep >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                1
              </div>
              <span className={`ml-2 sm:ml-3 font-medium text-sm sm:text-base ${currentStep >= 1 ? "text-purple-600" : "text-gray-500"}`}>
                <span className="hidden sm:inline">商家信息填写</span>
                <span className="sm:hidden">填写信息</span>
              </span>
            </div>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <div className="flex items-center">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${currentStep >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
              >
                2
              </div>
              <span className={`ml-2 sm:ml-3 font-medium text-sm sm:text-base ${currentStep >= 2 ? "text-purple-600" : "text-gray-500"}`}>
                <span className="hidden sm:inline">方案生成</span>
                <span className="sm:hidden">生成方案</span>
              </span>
            </div>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  商家信息填写
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  请填写以下信息，我们将为您生成专业的老板IP打造方案
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-sm font-medium text-gray-700">
                      店的名字 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storeName"
                      placeholder="如：馋嘴老张麻辣烫"
                      value={formData.storeName}
                      onChange={(e) => handleInputChange("storeName", e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeCategory" className="text-sm font-medium text-gray-700">
                      店的品类 <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.storeCategory}
                      onValueChange={(value) => handleInputChange("storeCategory", value)}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
                        <SelectValue placeholder="请选择行业类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="餐饮">餐饮</SelectItem>
                        <SelectItem value="美业">美业</SelectItem>
                        <SelectItem value="教育培训">教育培训</SelectItem>
                        <SelectItem value="零售">零售</SelectItem>
                        <SelectItem value="服务业">服务业</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeLocation" className="text-sm font-medium text-gray-700">
                      店的位置 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="storeLocation"
                      placeholder="如：北京市朝阳区望京SOHO"
                      value={formData.storeLocation}
                      onChange={(e) => handleInputChange("storeLocation", e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessDuration" className="text-sm font-medium text-gray-700">
                      开店时长 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessDuration"
                      placeholder="如：5年"
                      value={formData.businessDuration}
                      onChange={(e) => handleInputChange("businessDuration", e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeFeatures" className="text-sm font-medium text-gray-700">
                    店的特色 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="storeFeatures"
                    placeholder="如：地道手工汤底、回头客多"
                    value={formData.storeFeatures}
                    onChange={(e) => handleInputChange("storeFeatures", e.target.value)}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[80px]"
                  />

                  {/* 店铺特色关键词拓展 */}
                  {enableKeywordExpansion && expandedKeywords?.expanded_store_features && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                      <p className="text-xs text-blue-700 mb-2">点击关键词添加到店铺特色：</p>
                      <div className="flex flex-wrap gap-2">
                        {expandedKeywords.expanded_store_features.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className={`bg-white border-blue-200 text-blue-700 cursor-pointer hover:bg-blue-100 ${parseKeywords(formData.storeFeatures).includes(keyword) ? 'border-2 border-blue-400' : ''
                              }`}
                            onClick={() => {
                              // 使用统一的关键词分割函数
                              const currentKeywords = parseKeywords(formData.storeFeatures)

                              // 检查关键词是否已存在
                              if (!currentKeywords.includes(keyword)) {
                                // 添加新关键词
                                const newValue = formData.storeFeatures ?
                                  `${formData.storeFeatures}、${keyword}` :
                                  keyword;
                                handleInputChange("storeFeatures", newValue);

                                // 手动触发关键词拓展
                                if (enableKeywordExpansion) {
                                  setIsExpandingKeywords(true);
                                  fetch('/api/expand-keywords', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      storeFeatures: newValue,
                                      ownerFeatures: formData.ownerFeatures || ''
                                    }),
                                  })
                                    .then(response => response.json())
                                    .then(data => {
                                      console.log('关键词拓展结果:', data);
                                      setExpandedKeywords(data);
                                      setIsExpandingKeywords(false);
                                    })
                                    .catch(error => {
                                      console.error('关键词拓展出错:', error);
                                      setIsExpandingKeywords(false);
                                    });
                                }
                              }
                            }}
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                      老板贵姓 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      placeholder="如：张"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange("ownerName", e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerFeatures" className="text-sm font-medium text-gray-700">
                      老板的特色 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ownerFeatures"
                      placeholder="如：东北口音亲和力强、厨艺出众"
                      value={formData.ownerFeatures}
                      onChange={(e) => handleInputChange("ownerFeatures", e.target.value)}
                      className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    />

                    {/* 老板特色关键词拓展 */}
                    {enableKeywordExpansion && expandedKeywords?.expanded_boss_features && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-md border border-purple-100">
                        <p className="text-xs text-purple-700 mb-2">点击关键词添加到老板特色：</p>
                        <div className="flex flex-wrap gap-2">
                          {expandedKeywords.expanded_boss_features.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className={`bg-white border-purple-200 text-purple-700 cursor-pointer hover:bg-purple-100 ${parseKeywords(formData.ownerFeatures).includes(keyword) ? 'border-2 border-purple-400' : ''
                                }`}
                              onClick={() => {
                                // 使用统一的关键词分割函数
                                const currentKeywords = parseKeywords(formData.ownerFeatures)

                                // 检查关键词是否已存在
                                if (!currentKeywords.includes(keyword)) {
                                  // 添加新关键词
                                  const newValue = formData.ownerFeatures ?
                                    `${formData.ownerFeatures}、${keyword}` :
                                    keyword;
                                  handleInputChange("ownerFeatures", newValue);

                                  // 手动触发关键词拓展
                                  if (enableKeywordExpansion) {
                                    setIsExpandingKeywords(true);
                                    fetch('/api/expand-keywords', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        storeFeatures: formData.storeFeatures || '',
                                        ownerFeatures: newValue
                                      }),
                                    })
                                      .then(response => response.json())
                                      .then(data => {
                                        console.log('关键词拓展结果:', data);
                                        setExpandedKeywords(data);
                                        setIsExpandingKeywords(false);
                                      })
                                      .catch(error => {
                                        console.error('关键词拓展出错:', error);
                                        setIsExpandingKeywords(false);
                                      });
                                  }
                                }
                              }}
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 批量输入识别功能 */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-500 p-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                      </div>
                      <Label className="text-base font-medium text-green-800">
                        批量输入识别
                      </Label>
                    </div>
                    <Button
                      variant={showBulkInput ? "default" : "outline"}
                      size="sm"
                      className={showBulkInput ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-300 text-green-700 hover:bg-green-50"}
                      onClick={() => setShowBulkInput(!showBulkInput)}
                    >
                      {showBulkInput ? "收起 ↑" : "展开 ↓"}
                    </Button>
                  </div>

                  <p className="text-sm text-green-600 mb-2">
                    粘贴商家信息，一键自动识别并填写到对应字段
                  </p>

                  {showBulkInput ? (
                    <div className="space-y-3 mt-3 border-t border-green-200 pt-3">
                      <Textarea
                        placeholder="粘贴商家信息，格式如下：
店的名字：馋嘴老张麻辣烫
店的品类：餐饮
店的位置：北京市朝阳区望京SOHO
开店时长：5年
店的特色：秘制汤底、地域食材、现制模式、健康定制、主题沉浸、网红装修
老板贵姓：张
老板的特色：匠人、传承、学霸、宠粉"
                        value={bulkInputText}
                        onChange={(e) => setBulkInputText(e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500 min-h-[150px]"
                      />
                      <Button
                        onClick={() => {
                          // 如果批量输入为空，则使用默认数据
                          if (!bulkInputText.trim()) {
                            // 使用默认数据
                            const defaultData = {
                              storeName: "馋嘴老张麻辣烫",
                              storeCategory: "餐饮",
                              storeLocation: "北京市朝阳区望京SOHO",
                              businessDuration: "5年",
                              storeFeatures: "秘制汤底、地域食材、现制模式、健康定制、主题沉浸、网红装修",
                              ownerName: "张",
                              ownerFeatures: "匠人、传承、学霸、宠粉"
                            };
                            setFormData(defaultData);
                            setShowBulkInput(false);
                            setBulkInputText('');

                            // 如果启用了关键词拓展，添加默认的拓展关键词
                            if (enableKeywordExpansion) {
                              const defaultExpandedKeywords = {
                                expanded_store_features: [
                                  "秘制汤底",
                                  "地域食材",
                                  "现制模式",
                                  "健康定制",
                                  "主题沉浸",
                                  "网红装修",
                                  "营养搭配",
                                  "新鲜食材",
                                  "口味丰富",
                                  "环境舒适",
                                  "服务贴心"
                                ],
                                expanded_boss_features: [
                                  "匠人",
                                  "传承",
                                  "学霸",
                                  "宠粉",
                                  "专业厨师",
                                  "食材专家",
                                  "营养师",
                                  "服务达人",
                                  "品质控制",
                                  "创新思维",
                                  "客户至上"
                                ]
                              };
                              setExpandedKeywords(defaultExpandedKeywords);

                              // 自动触发关键词拓展
                              setIsExpandingKeywords(true);
                              fetch('/api/expand-keywords', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  storeFeatures: defaultData.storeFeatures,
                                  ownerFeatures: defaultData.ownerFeatures
                                }),
                              })
                                .then(response => response.json())
                                .then(data => {
                                  console.log('默认数据关键词拓展结果:', data);
                                  setExpandedKeywords(data);
                                  setIsExpandingKeywords(false);
                                })
                                .catch(error => {
                                  console.error('默认数据关键词拓展出错:', error);
                                  setIsExpandingKeywords(false);
                                });
                            }
                            return;
                          }

                          // 解析批量输入文本
                          const lines = bulkInputText.split('\n');
                          const newFormData = { ...formData };

                          // 正常解析批量输入文本
                          lines.forEach(line => {
                            if (line.includes('店名：') || line.includes('店名:') ||
                              line.includes('店的名字：') || line.includes('店的名字:')) {
                              newFormData.storeName = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('品类：') || line.includes('品类:') ||
                              line.includes('店的品类：') || line.includes('店的品类:')) {
                              newFormData.storeCategory = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('位置：') || line.includes('位置:') ||
                              line.includes('地点：') || line.includes('地点:') ||
                              line.includes('店的位置：') || line.includes('店的位置:')) {
                              newFormData.storeLocation = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('开店时长：') || line.includes('开店时长:') ||
                              line.includes('时长：') || line.includes('时长:')) {
                              newFormData.businessDuration = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('店铺特色：') || line.includes('店铺特色:') ||
                              line.includes('店的特色：') || line.includes('店的特色:')) {
                              newFormData.storeFeatures = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('老板姓氏：') || line.includes('老板姓氏:') ||
                              line.includes('老板：') || line.includes('老板:') ||
                              line.includes('老板贵姓：') || line.includes('老板贵姓:')) {
                              newFormData.ownerName = line.split(/[：:]/)[1]?.trim() || '';
                            } else if (line.includes('老板特色：') || line.includes('老板特色:') ||
                              line.includes('老板的特色：') || line.includes('老板的特色:')) {
                              newFormData.ownerFeatures = line.split(/[：:]/)[1]?.trim() || '';
                            }
                          });

                          setFormData(newFormData);
                          setShowBulkInput(false);
                          setBulkInputText('');

                          // 如果启用了关键词拓展，立即进行实时拓展
                          if (enableKeywordExpansion && newFormData.storeFeatures && newFormData.ownerFeatures) {
                            setIsExpandingKeywords(true);
                            fetch('/api/expand-keywords', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                storeFeatures: newFormData.storeFeatures,
                                ownerFeatures: newFormData.ownerFeatures
                              }),
                            })
                              .then(response => response.json())
                              .then(data => {
                                console.log('批量输入关键词拓展结果:', data);
                                setExpandedKeywords(data);
                                setIsExpandingKeywords(false);
                              })
                              .catch(error => {
                                console.error('实时关键词拓展出错:', error);
                                setIsExpandingKeywords(false);
                              });
                          }
                        }}
                        className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-2 text-base font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        自动识别并填写
                      </Button>
                    </div>
                  ) : null}
                </div>

                {/* AI模型选择 */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-orange-800">
                        🤖 AI模型选择
                      </Label>
                      <p className="text-xs text-orange-600">
                        选择不同的AI模型来生成专业方案，默认使用DeepSeek-V3
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowModelSettings(!showModelSettings)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {showModelSettings ? "收起" : "设置"}
                      </Button>
                    </div>
                  </div>

                  {showModelSettings && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-orange-700">选择AI模型</Label>
                          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                            <SelectTrigger className="border-orange-200 focus:border-orange-500 focus:ring-orange-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHAT_MODELS.map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{model.name}</span>
                                    <span className="text-xs text-gray-500">{model.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 显示当前选择的模型信息 */}
                        {(() => {
                          const currentModel = CHAT_MODELS.find(m => m.id === selectedModelId)
                          return currentModel ? (
                            <div className="bg-orange-100 p-3 rounded-md border border-orange-200">
                              <div className="text-sm">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-orange-800">当前模型: {currentModel.name}</div>
                                  <div className="text-xs bg-orange-200 px-2 py-1 rounded-full text-orange-700">
                                    {currentModel.provider}
                                  </div>
                                </div>
                                <div className="text-orange-600 mt-1">{currentModel.description}</div>
                                <div className="text-xs text-orange-500 mt-2 flex flex-wrap gap-3">
                                  <span>📊 最大令牌: {currentModel.maxTokens}</span>
                                  <span>🌡️ 温度: {currentModel.temperature}</span>
                                  <span>🎯 Top-P: {currentModel.topP}</span>
                                </div>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* 关键词拓展开关 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-blue-800">
                        🚀 智能关键词拓展
                      </Label>
                      <p className="text-xs text-blue-600">
                        AI将自动拓展"店的特色"和"老板特色"，支持多种分隔符（、，,/ 空格）
                      </p>
                      {isExpandingKeywords && (
                        <p className="text-xs text-orange-600 animate-pulse">
                          正在拓展关键词...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {enableKeywordExpansion && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // 测试数据
                            const testData = {
                              storeFeatures: formData.storeFeatures || "地道手工汤底、回头客多",
                              ownerFeatures: formData.ownerFeatures || "东北口音亲和力强、厨艺出众",
                              useTestData: true // 使用测试数据
                            };

                            setIsExpandingKeywords(true);
                            fetch('/api/expand-keywords', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(testData),
                            })
                              .then(response => response.json())
                              .then(data => {
                                console.log('关键词拓展结果:', data);
                                setExpandedKeywords(data);
                                setIsExpandingKeywords(false);
                              })
                              .catch(error => {
                                console.error('手动关键词拓展出错:', error);
                                setIsExpandingKeywords(false);
                              });
                          }}
                          disabled={isExpandingKeywords}
                          className="text-xs"
                        >
                          {isExpandingKeywords ? '拓展中...' : '立即拓展关键词'}
                        </Button>
                      )}
                      <Switch
                        checked={enableKeywordExpansion}
                        onCheckedChange={setEnableKeywordExpansion}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="pt-6 space-y-3">
                  <Button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                        <span className="hidden sm:inline">正在生成方案...</span>
                        <span className="sm:hidden">生成中...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">生成专业方案</span>
                        <span className="sm:hidden">生成方案</span>
                        <span className="ml-2 text-xs opacity-75 hidden md:inline">
                          ({CHAT_MODELS.find(m => m.id === selectedModelId)?.name || 'DeepSeek-V3'})
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </>
                    )}
                  </Button>


                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm border">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{formData.storeName || "店铺名称"} - 老板IP打造方案</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">由星光传媒专业团队为您量身定制</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFloatingToc(!showFloatingToc)}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                  <Menu className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>目录</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToForm}
                  className="text-xs sm:text-sm"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">修改信息</span>
                  <span className="sm:hidden">修改</span>
                </Button>
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentStep(1);
                      setError("");
                      // 重新生成方案
                      setTimeout(() => {
                        handleNextStep();
                      }, 100);
                    }}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 text-xs sm:text-sm"
                  >
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">重新生成</span>
                    <span className="sm:hidden">重新</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
                  disabled={!generatedContent}
                  className="text-xs sm:text-sm disabled:opacity-50"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">复制全部</span>
                  <span className="sm:hidden">复制</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportWord}
                  disabled={!generatedContent}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm disabled:opacity-50 text-white"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">导出Word</span>
                  <span className="sm:hidden">Word</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={!generatedContent}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs sm:text-sm disabled:opacity-50"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">导出PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </div>

            {/* Generated Content */}
            <div className="space-y-6">

              {/* Banner Image */}
              {(bannerImage || isGeneratingBanner) && (
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    {isGeneratingBanner ? (
                      <div className="w-full h-64 bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-purple-700 font-medium">正在生成专属Banner图...</p>
                        </div>
                      </div>
                    ) : bannerImage ? (
                      <div className="relative w-full h-64 overflow-hidden">
                        <img
                          src={bannerImage}
                          alt="方案Banner图"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                          <div className="text-center text-white">
                            <h3 className="text-2xl font-bold mb-2">{formData.storeName} IP打造方案</h3>
                            <p className="text-lg opacity-90">专业定制 · 精准营销</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}

              {/* AI Generated Content */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-purple-600 mr-3" />
                      <CardTitle className="text-lg">AI生成的专业方案</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            if (navigator.clipboard && navigator.clipboard.writeText) {
                              await navigator.clipboard.writeText(generatedContent)
                              alert('✅ 内容已复制到剪贴板！')
                            } else {
                              throw new Error('浏览器不支持剪贴板API')
                            }
                          } catch (error) {
                            console.error('复制失败:', error)
                            alert('复制失败，请手动选择内容复制')
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedContent ? (
                    <div className="prose max-w-none">
                      {renderParsedContent(generatedContent)}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">正在生成专业方案，请稍候...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮目录 */}
      {showFloatingToc && tocItems.length > 0 && (
        <div className="fixed inset-x-4 top-16 sm:top-20 sm:right-6 sm:left-auto z-50 w-auto sm:w-80 max-h-[70vh] overflow-hidden">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                  <CardTitle className="text-sm sm:text-base">方案目录</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFloatingToc(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 max-h-80 sm:max-h-96 overflow-y-auto px-3 sm:px-6">
              <div className="space-y-1">
                {tocItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      scrollToHeading(item.id)
                      setShowFloatingToc(false) // 点击后自动收起目录
                    }}
                    className={`w-full text-left p-1.5 sm:p-2 rounded-md transition-colors hover:bg-purple-50 ${activeSection === item.id
                      ? 'bg-purple-100 text-purple-700 border-l-2 border-purple-500'
                      : 'text-gray-600 hover:text-purple-600'
                      }`}
                    style={{
                      paddingLeft: `${(item.level - 1) * 8 + 6}px`,
                      fontSize: item.level === 1 ? '13px' : item.level === 2 ? '12px' : '11px'
                    }}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <span className={`${item.level === 1 ? 'font-semibold' :
                        item.level === 2 ? 'font-medium' : 'font-normal'
                        } truncate`}>
                        {item.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">星光传媒</span>
            </div>
            <p className="text-gray-600 mb-2">专注于服务本地实体商家的IP内容机构</p>
            <p className="text-sm text-gray-500">帮助老板打造"抖音第一人设"，实现流量变现与品牌传播</p>
          </div>
        </div>
      </footer>
    </div>
  )
}