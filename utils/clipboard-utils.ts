/**
 * 剪贴板工具函数
 * 提供复制图片和文本到剪贴板的功能
 * 
 * 注意：所有复制功能都受到配置文件控制
 * 默认情况下复制功能被全面禁用
 */
import { isCopyAllowed } from "@/config/copy-settings";

/**
 * 将图片URL复制到剪贴板
 * @param imageUrl 图片URL
 * @returns 是否复制成功
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  // 检查是否允许复制
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    return false;
  }

  if (!imageUrl) {
    console.log('没有图片URL可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('浏览器不支持剪贴板图片API')
    }

    // 创建一个新的Image对象来加载图片
    const img = new Image()
    img.crossOrigin = 'anonymous' // 允许跨域图片
    
    // 返回一个Promise，等待图片加载完成
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })
    
    // 创建Canvas来绘制图片
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('无法创建Canvas上下文')
    }
    
    // 在Canvas上绘制图片
    ctx.drawImage(img, 0, 0)
    
    // 将Canvas转换为Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('无法创建图片Blob'))
      }, 'image/png')
    })
    
    // 创建ClipboardItem并复制到剪贴板
    const clipboardItem = new ClipboardItem({ 'image/png': blob })
    await navigator.clipboard.write([clipboardItem])
    
    console.log('图片复制成功')
    return true
  } catch (error) {
    console.error('复制图片失败:', error)
    return false
  }
}

/**
 * 将文本复制到剪贴板
 * @param text 要复制的文本
 * @returns 是否复制成功
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 检查是否允许复制
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用');
    return false;
  }

  if (!text) {
    console.log('没有文本可复制')
    return false
  }

  try {
    // 检查剪贴板API是否可用
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('浏览器不支持剪贴板文本API')
    }

    await navigator.clipboard.writeText(text)
    console.log('文本复制成功')
    return true
  } catch (error) {
    console.error('复制文本失败:', error)
    return false
  }
}

/**
 * 创建一个临时文本区域供用户手动复制
 * @param text 要复制的文本
 */
export function createTemporaryTextArea(text: string): void {
  // 检查是否允许复制
  if (!isCopyAllowed()) {
    console.warn('复制功能已被配置禁用，无法创建临时文本区域');
    alert('复制功能已被禁用，请使用导出功能获取内容。');
    return;
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '50%'
  textArea.style.top = '50%'
  textArea.style.transform = 'translate(-50%, -50%)'
  textArea.style.width = '80%'
  textArea.style.height = '60%'
  textArea.style.zIndex = '9999'
  textArea.style.backgroundColor = 'white'
  textArea.style.border = '2px solid #ccc'
  textArea.style.padding = '10px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  alert('自动复制失败，请手动选择文本并按 Ctrl+C (或 Cmd+C) 复制。点击确定后文本框将消失。')
  document.body.removeChild(textArea)
}