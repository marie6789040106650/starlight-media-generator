import { FormData } from '@/lib/types'
import { isCopyAllowed, shouldShowCopyUI } from '@/config/copy-settings'

// 复制内容到剪贴板 - 已禁用
export const handleCopyContent = async (generatedContent: string, formData: FormData) => {
  // 检查是否允许复制
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    alert('复制功能已被禁用，请使用导出功能获取内容。');
    return;
  }

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

// 检查是否应该显示复制相关UI
export const shouldShowCopyButton = (): boolean => {
  return shouldShowCopyUI();
}

// 导出Word文档
export const handleExportWord = async (generatedContent: string, formData: FormData, bannerImage?: string | null) => {
  if (!generatedContent) return

  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
    const fileSaver = await import('file-saver')
    
    // 修复 saveAs 导入问题
    const saveAs = fileSaver.default?.saveAs || fileSaver.default || fileSaver.saveAs

    if (!saveAs || typeof saveAs !== 'function') {
      throw new Error('无法加载文件保存功能，请检查网络连接或浏览器兼容性')
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
            text: "本方案由星光传媒AI智能生成 | 专注于服务本地实体商家的IP内容机构",
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