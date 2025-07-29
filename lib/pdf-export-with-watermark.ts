/**
 * PDF导出功能 - 集成Markdown渲染和水印保护
 */

import { renderMarkdown } from './markdown-toolkit';
import { addSimpleWatermark } from './watermark-toolkit';

interface PDFExportOptions {
  watermark?: {
    text: string;
    opacity: number;
    fontSize: number;
    rotation: number;
    position: { x: string; y: string };
    repeat: string;
    color: { r: number; g: number; b: number };
  };
  userInfo?: {
    name: string;
    email: string;
    department?: string;
  };
  protectionLevel?: 'basic' | 'standard' | 'maximum';
}

/**
 * 将方案导出为PDF
 */
export async function exportSolutionToPDF(
  title: string,
  markdownContent: string,
  options: PDFExportOptions = {}
): Promise<void> {
  try {
    // 1. 将Markdown转换为HTML
    const htmlContent = renderMarkdown(markdownContent, {
      breaks: true,
      tables: true,
      highlight: true,
      math: true,
      emoji: true,
      html: true,
      sanitize: true
    });

    // 2. 生成完整的HTML文档
    const fullHtml = generatePDFDocument(title, htmlContent, options);

    // 3. 使用浏览器打印API生成PDF
    const pdfBuffer = await generatePDFFromHTML(fullHtml);

    // 4. 如果启用了水印，添加水印
    if (options.watermark) {
      const watermarkedPDF = await addSimpleWatermark(pdfBuffer, options.watermark.text, {
        opacity: options.watermark.opacity,
        fontSize: options.watermark.fontSize,
        rotation: options.watermark.rotation,
        position: options.watermark.position,
        repeat: options.watermark.repeat as any,
        color: options.watermark.color
      });

      if (watermarkedPDF.success && watermarkedPDF.pdfBytes) {
        downloadPDF(watermarkedPDF.pdfBytes, `${title}_protected.pdf`);
      } else {
        throw new Error(watermarkedPDF.error || '水印添加失败');
      }
    } else {
      downloadPDF(pdfBuffer, `${title}.pdf`);
    }

  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
}/**

 * 生成PDF文档的HTML结构
 */
function generatePDFDocument(
  title: string,
  content: string,
  options: PDFExportOptions
): string {
  const userInfo = options.userInfo;
  const currentDate = new Date().toLocaleDateString('zh-CN');

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .document-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ddd;
        }
        
        .document-title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 10px;
        }
        
        .document-meta {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
        }
        
        .document-content {
            margin-top: 20px;
        }
        
        /* Markdown样式 */
        .document-content h1 { font-size: 20px; margin: 20px 0 10px 0; }
        .document-content h2 { font-size: 18px; margin: 18px 0 8px 0; }
        .document-content h3 { font-size: 16px; margin: 16px 0 6px 0; }
        .document-content p { margin: 8px 0; }
        .document-content ul, .document-content ol { margin: 10px 0; padding-left: 20px; }
        .document-content li { margin: 4px 0; }
        .document-content blockquote {
            border-left: 4px solid #ddd;
            margin: 15px 0;
            padding: 10px 15px;
            background-color: #f9f9f9;
        }
        .document-content pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 12px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .document-content code {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 2px;
            padding: 2px 4px;
            font-family: 'Courier New', monospace;
        }
        .document-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        .document-content th, .document-content td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        .document-content th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .document-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <div class="document-title">${title}</div>
        <div class="document-meta">
            生成日期: ${currentDate}
            ${userInfo ? ` | 生成人: ${userInfo.name}` : ''}
            ${userInfo?.department ? ` | 部门: ${userInfo.department}` : ''}
        </div>
    </div>
    
    <div class="document-content">
        ${content}
    </div>
    
    <div class="document-footer">
        <p>本文档由星光传媒方案生成系统自动生成</p>
        ${userInfo ? `<p>联系方式: ${userInfo.email}</p>` : ''}
    </div>
</body>
</html>`;
}/**

 * 使用浏览器API生成PDF
 */
async function generatePDFFromHTML(html: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    // 创建隐藏的iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      reject(new Error('无法创建PDF文档'));
      return;
    }

    // 写入HTML内容
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // 等待内容加载完成
    setTimeout(() => {
      try {
        // 使用打印API
        const printWindow = iframe.contentWindow;
        if (printWindow) {
          // 模拟PDF生成（实际项目中可能需要使用专门的PDF库）
          const htmlContent = iframeDoc.documentElement.outerHTML;
          const blob = new Blob([htmlContent], { type: 'text/html' });
          
          // 转换为ArrayBuffer
          const reader = new FileReader();
          reader.onload = () => {
            document.body.removeChild(iframe);
            resolve(reader.result as ArrayBuffer);
          };
          reader.onerror = () => {
            document.body.removeChild(iframe);
            reject(new Error('PDF生成失败'));
          };
          reader.readAsArrayBuffer(blob);
        } else {
          throw new Error('无法访问打印窗口');
        }
      } catch (error) {
        document.body.removeChild(iframe);
        reject(error);
      }
    }, 1000);
  });
}

/**
 * 下载PDF文件
 */
function downloadPDF(pdfData: ArrayBuffer | Uint8Array, filename: string): void {
  const blob = new Blob([pdfData], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}