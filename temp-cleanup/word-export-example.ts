/**
 * 客户端Word导出使用示例
 * 展示如何在不同场景下使用exportWordDocument函数
 */

import { exportWordDocument } from './client-word-export'

// 示例1: 基本使用
export async function basicWordExport(content: string, storeName: string) {
  try {
    await exportWordDocument({
      content,
      storeName,
    })
    console.log('✅ Word导出成功')
  } catch (error) {
    console.error('❌ Word导出失败:', error)
    throw error
  }
}

// 示例2: 自定义文件名
export async function customFilenameWordExport(content: string, storeName: string, customFilename: string) {
  try {
    await exportWordDocument({
      content,
      storeName,
      filename: customFilename,
    })
    console.log('✅ 自定义文件名Word导出成功')
  } catch (error) {
    console.error('❌ Word导出失败:', error)
    throw error
  }
}

// 示例3: 在React组件中使用
export function useWordExport() {
  const exportWord = async (content: string, storeName: string) => {
    try {
      await exportWordDocument({
        content,
        storeName,
      })
      return { success: true, message: 'Word文档导出成功' }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Word导出失败' 
      }
    }
  }

  return { exportWord }
}

// 示例4: 批量导出
export async function batchWordExport(documents: Array<{content: string, storeName: string}>) {
  const results = []
  
  for (const doc of documents) {
    try {
      await exportWordDocument({
        content: doc.content,
        storeName: doc.storeName,
      })
      results.push({ storeName: doc.storeName, success: true })
    } catch (error) {
      results.push({ 
        storeName: doc.storeName, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }
  
  return results
}