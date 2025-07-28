"use client"

import React, { useMemo, useState, useEffect } from "react"
import { FormData } from "@/lib/types"
import { generateHeadingId } from "@/lib/utils"

interface WordStyleRendererProps {
  content: string
  formData: FormData
  bannerImage?: string | null
  isGeneratingBanner?: boolean
}

export const WordStyleRenderer: React.FC<WordStyleRendererProps> = ({
  content,
  formData,
  bannerImage,
  isGeneratingBanner
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 计算页数和分页处理
  useEffect(() => {
    if (content) {
      // 更精确的页数估算：每页约800-1000字符
      const estimatedPages = Math.max(1, Math.ceil(content.length / 900))
      setTotalPages(estimatedPages)

      // TODO: 实现真正的分页逻辑
      // 这里可以添加分页处理逻辑
      handlePagination(content)
    }
  }, [content])

  // 分页处理函数
  const handlePagination = (content: string) => {
    // 分页逻辑将在这里实现
    // 目前先保持简单的估算
    console.log('分页处理:', { contentLength: content.length, estimatedPages: totalPages })
  }

  // 将Markdown内容转换为完全符合Word样式的HTML
  const wordStyleHtml = useMemo(() => {
    if (!content) return '';

    let html = content;

    // 处理标题 - 完全按照Word样式，并添加ID用于目录跳转
    let headingIndex = 0;
    html = html.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
      const level = hashes.length;
      let fontSize, fontFamily, marginTop, marginBottom, fontWeight;

      switch (level) {
        case 1:
          // 一级标题：思源宋体，16pt，加粗，段前12pt，段后6pt
          fontSize = '16pt';
          fontFamily = "'Source Han Serif SC', 'SimSun', serif";
          marginTop = '12pt';
          marginBottom = '6pt';
          fontWeight = 'bold';
          break;
        case 2:
          // 二级标题：思源宋体，14pt，加粗，段前6pt，段后4pt
          fontSize = '14pt';
          fontFamily = "'Source Han Serif SC', 'SimSun', serif";
          marginTop = '6pt';
          marginBottom = '4pt';
          fontWeight = 'bold';
          break;
        case 3:
          // 三级标题：思源黑体，12pt，加粗，段前3pt，段后3pt
          fontSize = '12pt';
          fontFamily = "'Source Han Sans SC', 'SimHei', sans-serif";
          marginTop = '3pt';
          marginBottom = '3pt';
          fontWeight = 'bold';
          break;
        default:
          fontSize = '16pt';
          fontFamily = "'Source Han Serif SC', 'SimSun', serif";
          marginTop = '12pt';
          marginBottom = '6pt';
          fontWeight = 'bold';
      }

      // 生成与useToc hook一致的ID
      const cleanTitle = title.replace(/^\*+|\*+$/g, '').trim();
      const headingId = generateHeadingId(headingIndex, cleanTitle);
      console.log(`渲染标题: 索引=${headingIndex}, 标题="${cleanTitle}", ID="${headingId}"`)
      headingIndex++;

      return `<h${level} id="${headingId}" style="font-size: ${fontSize}; font-family: ${fontFamily}; font-weight: ${fontWeight}; color: #000000; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; line-height: 1.5; text-align: left;">${title.trim()}</h${level}>`;
    });

    // 处理粗体 - 正文加粗关键字：同正文，11pt，加粗
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong style="font-weight: bold; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</strong>');

    // 处理斜体
    html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em style="font-style: italic; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</em>');

    // 处理列表项
    html = html.replace(/^[-*+]\s+(.+)$/gm, '<li style="margin-bottom: 6pt; line-height: 1.5; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</li>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin-bottom: 6pt; line-height: 1.5; color: #000000; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</li>');

    // 处理引用 - 引用文字也使用黑色，与Word保持一致
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote style="border-left: 3pt solid #AAAAAA; padding-left: 7pt; margin: 16pt 0; color: #000000; font-style: italic; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt; line-height: 1.5;">$1</blockquote>');

    // 处理代码块 - 代码块文字使用黑色
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre style="background-color: #F8F9FA; border: 1pt solid #DDDDDD; padding: 12pt; margin: 12pt 0; font-family: 'Courier New', monospace; font-size: 9pt; line-height: 1.2; color: #000000; overflow-x: auto;"><code>${code.trim()}</code></pre>`;
    });

    // 处理行内代码 - 行内代码也使用黑色
    html = html.replace(/`([^`\n]+)`/g, '<code style="background-color: #F1F3F4; padding: 1pt 3pt; font-family: \'Courier New\', monospace; font-size: 9pt; color: #000000;">$1</code>');

    // 处理链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #0000FF; text-decoration: underline; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif; font-size: 11pt;">$1</a>');

    // 处理水平线
    html = html.replace(/^-{3,}$/gm, '<hr style="border: none; border-top: 1pt solid #E5E7EB; margin: 12pt 0;" />');

    // 处理段落 - 完全按照Word样式规范
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    let listItems: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('<li ')) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line);
      } else {
        if (inList) {
          // 结束列表
          const listType = listItems[0].includes('1.') ? 'ol' : 'ul';
          const listStyle = listType === 'ol'
            ? 'list-style-type: decimal; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
            : 'list-style-type: disc; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;';
          processedLines.push(`<${listType} style="${listStyle}">${listItems.join('')}</${listType}>`);
          inList = false;
          listItems = [];
        }

        if (line === '') {
          continue;
        } else if (line.startsWith('<h') || line.startsWith('<blockquote') || line.startsWith('<hr') || line.startsWith('<pre')) {
          processedLines.push(line);
        } else {
          // 正文段落：流式模式，取消首行缩进，增加段间距
          processedLines.push(`<p style="font-family: 'Source Han Sans SC', 'SimHei', sans-serif; font-size: 11pt; line-height: 1.6; color: #000000; text-align: left; text-indent: 0; margin-top: 0pt; margin-bottom: 12pt;">${line}</p>`);
        }
      }
    }

    // 处理最后的列表
    if (inList && listItems.length > 0) {
      const listType = listItems[0].includes('1.') ? 'ol' : 'ul';
      const listStyle = listType === 'ol'
        ? 'list-style-type: decimal; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;'
        : 'list-style-type: disc; padding-left: 24pt; margin: 12pt 0; font-family: \'Source Han Sans SC\', \'SimHei\', sans-serif;';
      processedLines.push(`<${listType} style="${listStyle}">${listItems.join('')}</${listType}>`);
    }

    return processedLines.join('\n');
  }, [content]);

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      width: '100%',
      maxWidth: 'none',
      margin: '0',
      fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
    }}>

      {/* Banner图片区域 - 流式模式，居中显示，无边距 */}
      {(bannerImage || isGeneratingBanner) && (
        <div style={{
          backgroundColor: '#ffffff',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {isGeneratingBanner ? (
            <div style={{
              width: '100%',
              height: '168px',
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
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover'
              }}
            />
          ) : null}
        </div>
      )}

      {/* 文档内容区域 - 流式模式简化样式 */}
      <div style={{
        padding: '20px 40px', // 简化的内边距
        backgroundColor: 'white',
        lineHeight: '1.5'
      }}>
        {content ? (
          <div
            style={{
              fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
              fontSize: '11pt', // 正文11pt
              lineHeight: '1.5',
              color: '#000000'
            }}
            dangerouslySetInnerHTML={{ __html: wordStyleHtml }}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '48pt 0',
            color: '#000000'
          }}>
            <div style={{
              width: '24pt',
              height: '24pt',
              border: '2pt solid #e5e7eb',
              borderTop: '2pt solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12pt'
            }}></div>
            <h3 style={{
              fontSize: '16pt', // 一级标题大小
              fontWeight: 'bold',
              color: '#000000',
              margin: '0 0 6pt 0',
              fontFamily: "'Source Han Serif SC', 'SimSun', serif"
            }}>
              正在生成专业方案
            </h3>
            <p style={{
              color: '#000000',
              margin: '0 0 12pt 0',
              fontSize: '11pt',
              fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif"
            }}>
              正在为您量身定制IP打造方案，请稍候...
            </p>
          </div>
        )}
      </div>

      {/* 文档底部信息 - 流式模式简化样式 */}
      <div style={{
        padding: '20px',
        borderTop: '1pt solid #e5e7eb',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12pt',
          color: '#666666',
          margin: '0',
          fontFamily: "'Source Han Sans SC', 'SimHei', sans-serif",
          fontWeight: 'normal'
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

        /* Word样式的标题样式 - 精确复刻 */
        h1 {
          font-family: 'Source Han Serif SC', 'SimSun', serif !important;
          font-size: 16pt !important;
          font-weight: bold !important;
          color: #000000 !important;
          margin-top: 12pt !important;
          margin-bottom: 6pt !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        h2 {
          font-family: 'Source Han Serif SC', 'SimSun', serif !important;
          font-size: 14pt !important;
          font-weight: bold !important;
          color: #000000 !important;
          margin-top: 6pt !important;
          margin-bottom: 4pt !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        h3 {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 12pt !important;
          font-weight: bold !important;
          color: #000000 !important;
          margin-top: 3pt !important;
          margin-bottom: 3pt !important;
          line-height: 1.5 !important;
          text-align: left !important;
        }

        /* 流式模式的段落样式 - 适合网页阅读 */
        p {
          font-family: 'Source Han Sans SC', 'SimHei', sans-serif !important;
          font-size: 11pt !important;
          color: #000000 !important;
          line-height: 1.6 !important; /* 增加行距 */
          text-align: left !important;
          text-indent: 0 !important; /* 取消首行缩进 */
          margin-top: 0pt !important;
          margin-bottom: 12pt !important; /* 增加段间距 */
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
      `}</style>
    </div>
  );
};